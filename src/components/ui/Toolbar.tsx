import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { useMapStore } from "@/store/useMapStore"
import { Plus, Trash2, Save, Eraser } from "lucide-react"

interface ToolbarProps {
  onSaveLoadOpen: () => void
  onExport?: (format: string) => void
}

export function Toolbar({ onSaveLoadOpen }: ToolbarProps) {
  const {
    selectedTool,
    setTool,
    selectedTileHeight,
    setTileHeight,
    clearMap,
    deleteSelected,
    selectedObjectId,
    setSelectedObject
  } = useMapStore()

  return (
    <Card className="fixed bottom-6 left-1/2 -translate-x-1/2 p-3 shadow-xl z-40 bg-background/95 backdrop-blur-sm border-primary/20 flex items-center gap-4">

      {/* Tile Tools */}
      <div className="flex items-center gap-2">
        <Button
          variant={selectedTool === 'tile' ? 'default' : 'outline'}
          size="sm"
          onClick={() => {
            setTool('tile');
            setSelectedObject(null); // Deselect any object when switching to tile mode
          }}
          className="gap-2"
        >
          <Plus className="w-4 h-4" />
          Add Tile
        </Button>
      </div>

      <div className="h-8 w-px bg-border" />

      {/* Delete Action */}
      <Button
        variant="destructive"
        size="sm"
        onClick={() => deleteSelected()}
        disabled={!selectedObjectId}
        className="gap-2"
        title="Delete selected object (Delete key)"
      >
        <Trash2 className="w-4 h-4" />
        Delete
      </Button>

      <div className="h-8 w-px bg-border" />

      {/* Tile Height Selection */}
      <div className="flex items-center gap-2 bg-muted/50 p-1 rounded-md">
        <span className="text-xs font-semibold px-2 text-muted-foreground">Tile Height:</span>
        <Button
          variant={selectedTileHeight === 1 ? 'secondary' : 'ghost'}
          size="sm"
          onClick={() => { setTileHeight(1); setTool('tile'); }}
          className={`h-7 text-xs ${selectedTileHeight === 1 ? 'bg-white shadow-sm text-green-700' : ''}`}
        >
          1cm Base
        </Button>
        <Button
          variant={selectedTileHeight === 2 ? 'secondary' : 'ghost'}
          size="sm"
          onClick={() => { setTileHeight(2); setTool('tile'); }}
          className={`h-7 text-xs ${selectedTileHeight === 2 ? 'bg-white shadow-sm text-green-600' : ''}`}
        >
          2cm Hill
        </Button>
        <Button
          variant={selectedTileHeight === 5 ? 'secondary' : 'ghost'}
          size="sm"
          onClick={() => { setTileHeight(5); setTool('tile'); }}
          className={`h-7 text-xs ${selectedTileHeight === 5 ? 'bg-white shadow-sm text-green-500' : ''}`}
        >
          5cm Peak
        </Button>
      </div>

      <div className="h-8 w-px bg-border" />

      {/* Global Actions */}
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => clearMap()}
          className="gap-2 text-muted-foreground hover:text-destructive"
        >
          <Eraser className="w-4 h-4" />
          Clear Map
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => onSaveLoadOpen()}
          className="gap-2"
        >
          <Save className="w-4 h-4" />
          Save/Load
        </Button>
      </div>

      {/* Help Text */}
      <div className="absolute -top-8 left-1/2 -translate-x-1/2 whitespace-nowrap text-xs text-white/80 bg-black/50 px-3 py-1 rounded-full backdrop-blur-sm pointer-events-none">
        Left-click to place • Select & Delete to remove
      </div>
    </Card>
  )
}
