import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useMapStore } from "@/store/useMapStore"
import type { MapState } from "@/store/useMapStore"
import type { Tile, PlacedAsset, TableSize } from '@/types'
import { Save, FolderOpen, X, Download, Upload, Trash2 } from "lucide-react"

type SaveLoadDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
}

type ProjectFile = {
  id: string
  name: string
  date: string
  thumbnail?: string
  // Saved project data may be stored as arrays (legacy) or as Maps; accept both shapes
  data?: {
    tiles?: Tile[][] | Record<string, Tile[]> | Map<string, Tile[]>
    assets?: PlacedAsset[] | Record<string, PlacedAsset> | Map<string, PlacedAsset>
    tableSize?: TableSize
    projectName?: string
  }
}

export function SaveLoadDialog({ open, onOpenChange }: SaveLoadDialogProps) {
  const [activeTab, setActiveTab] = useState<"save" | "load">("save")
  const [projectName, setProjectName] = useState("")
  const [savedProjects, setSavedProjects] = useState<ProjectFile[]>([])
  
  const { tiles, assets, tableSize, projectName: currentProjectName, loadProject } = useMapStore()
  
  // Load saved projects from localStorage
  const loadSavedProjects = () => {
    const projects = JSON.parse(localStorage.getItem('hexMapProjects') || '[]') as ProjectFile[]
    setSavedProjects(projects)
    return projects
  }
  
  const handleSave = () => {
    if (!projectName.trim()) return
    
    const projectData = {
      id: Date.now().toString(),
      name: projectName,
      date: new Date().toISOString(),
      data: {
        // Save tiles/assets as keyed objects so they can be restored into Maps
        tiles: Object.fromEntries(Array.from(tiles.entries())),
        assets: Object.fromEntries(Array.from(assets.entries())),
        tableSize,
        projectName: projectName
      }
    }
    
    // Save to localStorage
    const projects = loadSavedProjects()
    const existingIndex = projects.findIndex((p: ProjectFile) => p.name === projectName)
    
    if (existingIndex >= 0) {
      projects[existingIndex] = { ...projects[existingIndex], ...projectData }
    } else {
      projects.push(projectData)
    }
    
    localStorage.setItem('hexMapProjects', JSON.stringify(projects))
    setProjectName("")
    onOpenChange(false)
  }
  
  const handleLoad = (project: ProjectFile) => {
    if (project.data) {
      // Normalize saved data (accept Map, Record, or legacy arrays) into Partial<MapState>
      const d = project.data
      const payload: Partial<MapState> = {}

      if (d.tiles) {
        if (d.tiles instanceof Map) {
          payload.tiles = d.tiles as Map<string, Tile[]>
        } else if (Array.isArray(d.tiles)) {
          const m = new Map<string, Tile[]>()
          d.tiles.forEach((arr, i) => m.set(`legacy_${i}`, arr))
          payload.tiles = m
        } else {
          const m = new Map<string, Tile[]>()
          Object.entries(d.tiles).forEach(([k, v]) => m.set(k, v as Tile[]))
          payload.tiles = m
        }
      }

      if (d.assets) {
        if (d.assets instanceof Map) {
          payload.assets = d.assets as Map<string, PlacedAsset>
        } else if (Array.isArray(d.assets)) {
          const m = new Map<string, PlacedAsset>()
          d.assets.forEach((a) => m.set(a.id, a))
          payload.assets = m
        } else {
          const m = new Map<string, PlacedAsset>()
          Object.entries(d.assets).forEach(([k, v]) => m.set(k, v as PlacedAsset))
          payload.assets = m
        }
      }

      if (d.tableSize) payload.tableSize = d.tableSize
      if (d.projectName) payload.projectName = d.projectName

      loadProject(payload)
    }
    onOpenChange(false)
  }
  
  const handleDelete = (id: string, e: React.MouseEvent) => {
    e.stopPropagation()
    const updatedProjects = savedProjects.filter(p => p.id !== id)
    setSavedProjects(updatedProjects)
    localStorage.setItem('hexMapProjects', JSON.stringify(updatedProjects))
  }
  
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    
    const reader = new FileReader()
    reader.onload = (event: ProgressEvent<FileReader>) => {
      try {
        const projectData = JSON.parse(event.target?.result as string)
        if (projectData?.data) {
          // reuse normalization logic from handleLoad
          const d = projectData.data
          const payload: Partial<MapState> = {}

          if (d.tiles) {
            if (d.tiles instanceof Map) {
              payload.tiles = d.tiles as Map<string, Tile[]>
            } else if (Array.isArray(d.tiles)) {
              const m = new Map<string, Tile[]>()
              d.tiles.forEach((arr: Tile[], i: number) => m.set(`legacy_${i}`, arr))
              payload.tiles = m
            } else {
              const m = new Map<string, Tile[]>()
              Object.entries(d.tiles).forEach(([k, v]) => m.set(k, v as Tile[]))
              payload.tiles = m
            }
          }

          if (d.assets) {
            if (d.assets instanceof Map) {
              payload.assets = d.assets as Map<string, PlacedAsset>
            } else if (Array.isArray(d.assets)) {
              const m = new Map<string, PlacedAsset>()
              d.assets.forEach((a: PlacedAsset) => m.set(a.id, a))
              payload.assets = m
            } else {
              const m = new Map<string, PlacedAsset>()
              Object.entries(d.assets).forEach(([k, v]) => m.set(k, v as PlacedAsset))
              payload.assets = m
            }
          }

          if (d.tableSize) payload.tableSize = d.tableSize
          if (d.projectName) payload.projectName = d.projectName

          loadProject(payload)
        }
        onOpenChange(false)
      } catch (error) {
        console.error('Error loading project file', error)
        alert('Invalid project file')
      }
    }
    reader.readAsText(file)
  }
  
  const handleExport = () => {
    const projectData = {
      tiles: Object.fromEntries(Array.from(tiles.entries())),
      assets: Object.fromEntries(Array.from(assets.entries())),
      tableSize,
      projectName: currentProjectName
    }
    
    const dataStr = JSON.stringify({ data: projectData }, null, 2)
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr)
    
    const exportFileDefaultName = `${currentProjectName || 'hexmap'}.json`
    
    const linkElement = document.createElement('a')
    linkElement.setAttribute('href', dataUri)
    linkElement.setAttribute('download', exportFileDefaultName)
    linkElement.click()
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[95vw] sm:w-full sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-lg sm:text-xl">{activeTab === 'save' ? 'Save Project' : 'Load Project'}</DialogTitle>
          <DialogDescription className="text-sm">
            {activeTab === 'save' 
              ? 'Save your current project to continue working on it later.'
              : 'Load a previously saved project to continue working on it.'}
          </DialogDescription>
        </DialogHeader>
        
        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'save' | 'load')} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="save" onClick={() => setActiveTab('save')} className="text-xs sm:text-sm">
              <Save className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" /> 
              <span className="hidden xs:inline">Save</span>
              <span className="xs:hidden">Save</span>
            </TabsTrigger>
            <TabsTrigger value="load" onClick={() => { setActiveTab('load'); loadSavedProjects(); }} className="text-xs sm:text-sm">
              <FolderOpen className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" /> 
              <span className="hidden xs:inline">Load</span>
              <span className="xs:hidden">Load</span>
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="save" className="mt-4 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="projectName" className="text-sm">Project Name</Label>
              <Input
                id="projectName"
                placeholder="My Awesome Map"
                value={projectName || currentProjectName}
                onChange={(e) => setProjectName(e.target.value)}
                className="text-base sm:text-sm"
              />
            </div>
            
            <div className="flex flex-col sm:flex-row gap-2 sm:justify-between pt-2">
              <Button variant="outline" onClick={handleExport} className="w-full sm:w-auto text-sm">
                <Download className="h-3 w-3 sm:h-4 sm:w-4 mr-2" />
                <span className="hidden xs:inline">Export to File</span>
                <span className="xs:hidden">Export</span>
              </Button>
              
              <Button onClick={handleSave} disabled={!projectName && !currentProjectName} className="w-full sm:w-auto text-sm">
                <Save className="h-3 w-3 sm:h-4 sm:w-4 mr-2" />
                Save Project
              </Button>
            </div>
          </TabsContent>
          
          <TabsContent value="load" className="mt-4">
            <div className="space-y-4">
              <div className="rounded-lg border p-3 sm:p-4">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 gap-2">
                  <h3 className="font-medium text-sm sm:text-base">Local Storage</h3>
                  <div className="text-xs sm:text-sm text-muted-foreground">
                    {savedProjects.length} saved project{savedProjects.length !== 1 ? 's' : ''}
                  </div>
                </div>
                
                {savedProjects.length > 0 ? (
                  <div className="space-y-2 max-h-48 sm:max-h-60 overflow-y-auto">
                    {savedProjects.map((project) => (
                      <div 
                        key={project.id}
                        className="flex items-center justify-between p-2 rounded hover:bg-muted/50 cursor-pointer"
                        onClick={() => handleLoad(project)}
                      >
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-sm truncate">{project.name}</div>
                          <div className="text-xs text-muted-foreground">
                            {new Date(project.date).toLocaleString()}
                          </div>
                        </div>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-8 w-8 sm:h-8 sm:w-8 text-destructive hover:bg-destructive/10 flex-shrink-0 ml-2"
                          onClick={(e) => handleDelete(project.id, e)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-6 text-muted-foreground">
                    <p className="text-sm">No saved projects found.</p>
                    <p className="text-xs sm:text-sm">Save a project to see it here.</p>
                  </div>
                )}
              </div>
              
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-background px-2 text-muted-foreground">Or</span>
                </div>
              </div>
              
              <div className="text-center">
                <label className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 sm:h-10 px-4 py-2 cursor-pointer w-full sm:w-auto">
                  <Upload className="h-4 w-4 mr-2" />
                  Import from File
                  <input 
                    type="file" 
                    className="hidden" 
                    accept=".json"
                    onChange={handleFileUpload}
                  />
                </label>
              </div>
            </div>
          </TabsContent>
        </Tabs>
        
        <DialogFooter className="flex-col sm:flex-row gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)} className="w-full sm:w-auto text-sm">
            <X className="h-3 w-3 sm:h-4 sm:w-4 mr-2" />
            Cancel
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
