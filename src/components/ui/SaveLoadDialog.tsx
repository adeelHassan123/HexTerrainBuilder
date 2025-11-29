import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useMapStore } from "@/store/useMapStore"
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
}

export function SaveLoadDialog({ open, onOpenChange }: SaveLoadDialogProps) {
  const [activeTab, setActiveTab] = useState<"save" | "load">("save")
  const [projectName, setProjectName] = useState("")
  const [savedProjects, setSavedProjects] = useState<ProjectFile[]>([])
  
  const { tiles, assets, tableSize, projectName: currentProjectName, loadProject } = useMapStore()
  
  // Load saved projects from localStorage
  const loadSavedProjects = () => {
    const projects = JSON.parse(localStorage.getItem('hexMapProjects') || '[]')
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
        tiles: Array.from(tiles.values()),
        assets: Array.from(assets.values()),
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
  
  const handleLoad = (project: any) => {
    loadProject(project.data)
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
    reader.onload = (event) => {
      try {
        const projectData = JSON.parse(event.target?.result as string)
        loadProject(projectData.data)
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
      tiles: Array.from(tiles.values()),
      assets: Array.from(assets.values()),
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
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>{activeTab === 'save' ? 'Save Project' : 'Load Project'}</DialogTitle>
          <DialogDescription>
            {activeTab === 'save' 
              ? 'Save your current project to continue working on it later.'
              : 'Load a previously saved project to continue working on it.'}
          </DialogDescription>
        </DialogHeader>
        
        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="save" onClick={() => setActiveTab('save')}>
              <Save className="h-4 w-4 mr-2" /> Save
            </TabsTrigger>
            <TabsTrigger value="load" onClick={() => { setActiveTab('load'); loadSavedProjects(); }}>
              <FolderOpen className="h-4 w-4 mr-2" /> Load
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="save" className="mt-4 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="projectName">Project Name</Label>
              <Input
                id="projectName"
                placeholder="My Awesome Map"
                value={projectName || currentProjectName}
                onChange={(e) => setProjectName(e.target.value)}
              />
            </div>
            
            <div className="flex justify-between pt-2">
              <Button variant="outline" onClick={handleExport}>
                <Download className="h-4 w-4 mr-2" />
                Export to File
              </Button>
              
              <Button onClick={handleSave} disabled={!projectName && !currentProjectName}>
                <Save className="h-4 w-4 mr-2" />
                Save Project
              </Button>
            </div>
          </TabsContent>
          
          <TabsContent value="load" className="mt-4">
            <div className="space-y-4">
              <div className="rounded-lg border p-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-medium">Local Storage</h3>
                  <div className="text-sm text-muted-foreground">
                    {savedProjects.length} saved project{savedProjects.length !== 1 ? 's' : ''}
                  </div>
                </div>
                
                {savedProjects.length > 0 ? (
                  <div className="space-y-2 max-h-60 overflow-y-auto">
                    {savedProjects.map((project) => (
                      <div 
                        key={project.id}
                        className="flex items-center justify-between p-2 rounded hover:bg-muted/50 cursor-pointer"
                        onClick={() => handleLoad(project)}
                      >
                        <div>
                          <div className="font-medium">{project.name}</div>
                          <div className="text-xs text-muted-foreground">
                            {new Date(project.date).toLocaleString()}
                          </div>
                        </div>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-8 w-8 text-destructive hover:bg-destructive/10"
                          onClick={(e) => handleDelete(project.id, e)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-6 text-muted-foreground">
                    <p>No saved projects found.</p>
                    <p className="text-sm">Save a project to see it here.</p>
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
                <label className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2 cursor-pointer">
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
        
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            <X className="h-4 w-4 mr-2" />
            Cancel
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
