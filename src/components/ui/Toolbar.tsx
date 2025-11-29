import { Button } from "@/components/ui/button"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useMapStore } from "@/store/useMapStore"
import { Download, Save, Trash2 } from "lucide-react"

interface ToolbarProps {
  onSaveLoadOpen: () => void
  onExport: (format: string) => void
}

export function Toolbar({ onSaveLoadOpen, onExport }: ToolbarProps) {
  const { 
    selectedTool, 
    setTool, 
    selectedTileHeight, 
    setTileHeight
  } = useMapStore()

  const tools = [
    { id: 'select', label: 'Select', icon: null },
    { id: 'tile', label: 'Add Tile', icon: null },
    { id: 'asset', label: 'Add Asset', icon: null },
    { id: 'delete', label: 'Delete', icon: <Trash2 className="w-4 h-4" /> },
  ]

  const heights = [
    { value: 1, label: '1"' },
    { value: 2, label: '2"' },
    { value: 5, label: '5"' },
  ]

  return (
    <div className="fixed top-4 left-1/2 -translate-x-1/2 bg-background/80 backdrop-blur-md p-2 rounded-lg shadow-lg border flex items-center gap-4 z-50">
      <Tabs 
        value={selectedTool} 
        onValueChange={(v) => setTool(v as any)}
        className="flex items-center gap-2"
      >
        <TabsList className="grid grid-cols-4 h-auto p-1">
          {tools.map((tool) => (
            <TabsTrigger 
              key={tool.id} 
              value={tool.id}
              className="flex flex-col items-center justify-center gap-1 h-auto px-3 py-2 text-xs"
            >
              {tool.icon}
              <span>{tool.label}</span>
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      <div className="h-8 w-px bg-border mx-1" />

      <div className="flex items-center gap-2">
        <span className="text-sm font-medium">Height:</span>
        <Tabs 
          value={selectedTileHeight.toString()} 
          onValueChange={(v) => setTileHeight(parseInt(v) as any)}
          className="flex items-center gap-2"
        >
          <TabsList className="h-auto p-1">
            {heights.map((height) => (
              <TabsTrigger 
                key={height.value} 
                value={height.value.toString()}
                className="h-8 w-12"
              >
                {height.label}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
      </div>

      <div className="h-8 w-px bg-border mx-1" />

      <div className="flex items-center gap-2">
        <Button 
          variant="outline" 
          size="sm" 
          className="gap-2"
          onClick={onSaveLoadOpen}
        >
          <Save className="h-4 w-4" />
          <span>Save</span>
        </Button>
        <Button 
          size="sm" 
          className="gap-2"
          onClick={() => onExport('png')}
        >
          <Download className="h-4 w-4" />
          <span>Export</span>
        </Button>
      </div>
    </div>
  )
}
