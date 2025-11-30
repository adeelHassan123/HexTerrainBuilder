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
    <Card className="fixed bottom-0 left-0 right-0 sm:bottom-6 sm:left-1/2 sm:right-auto sm:-translate-x-1/2 p-2 sm:p-3 shadow-xl z-40 bg-background/95 backdrop-blur-sm border-primary/20 flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-4 rounded-t-lg sm:rounded-lg sm:max-w-fit sm:mx-auto">
      
      {/* Mobile: Primary Actions Row */}
      <div className="flex items-center gap-2 sm:gap-2 flex-1 sm:flex-initial justify-center sm:justify-start">
        {/* Tile Tools */}
        <Button
          variant={selectedTool === 'tile' ? 'default' : 'outline'}
          size="sm"
          onClick={() => {
            setTool('tile');
            setSelectedObject(null);
          }}
          className="gap-1 sm:gap-2 text-xs sm:text-sm flex-1 sm:flex-initial min-w-[80px] sm:min-w-0"
        >
          <Plus className="w-3 h-3 sm:w-4 sm:h-4" />
          <span className="hidden xs:inline">Add Tile</span>
          <span className="xs:hidden">Tile</span>
        </Button>

        <div className="h-6 sm:h-8 w-px bg-border hidden sm:block" />

        {/* Delete Action */}
        <Button
          variant="destructive"
          size="sm"
          onClick={() => deleteSelected()}
          disabled={!selectedObjectId}
          className="gap-1 sm:gap-2 text-xs sm:text-sm flex-1 sm:flex-initial min-w-[80px] sm:min-w-0"
          title="Delete selected object"
        >
          <Trash2 className="w-3 h-3 sm:w-4 sm:h-4" />
          <span className="hidden xs:inline">Delete</span>
          <span className="xs:hidden">Del</span>
        </Button>
      </div>

      <div className="h-px sm:h-8 sm:w-px bg-border sm:bg-border" />

      {/* Mobile: Tile Height Row */}
      <div className="flex items-center gap-1 sm:gap-2 bg-muted/50 p-1 rounded-md overflow-x-auto">
        <span className="text-xs font-semibold px-1 sm:px-2 text-muted-foreground whitespace-nowrap hidden sm:inline">Tile Height:</span>
        <span className="text-xs font-semibold px-1 text-muted-foreground whitespace-nowrap sm:hidden">H:</span>
        <Button
          variant={selectedTileHeight === 1 ? 'secondary' : 'ghost'}
          size="sm"
          onClick={() => { setTileHeight(1); setTool('tile'); }}
          className={`h-7 text-xs whitespace-nowrap ${selectedTileHeight === 1 ? 'bg-white shadow-sm text-green-700' : ''}`}
        >
          <span className="hidden sm:inline">1cm Base</span>
          <span className="sm:hidden">1</span>
        </Button>
        <Button
          variant={selectedTileHeight === 2 ? 'secondary' : 'ghost'}
          size="sm"
          onClick={() => { setTileHeight(2); setTool('tile'); }}
          className={`h-7 text-xs whitespace-nowrap ${selectedTileHeight === 2 ? 'bg-white shadow-sm text-green-600' : ''}`}
        >
          <span className="hidden sm:inline">2cm Hill</span>
          <span className="sm:hidden">2</span>
        </Button>
        <Button
          variant={selectedTileHeight === 5 ? 'secondary' : 'ghost'}
          size="sm"
          onClick={() => { setTileHeight(5); setTool('tile'); }}
          className={`h-7 text-xs whitespace-nowrap ${selectedTileHeight === 5 ? 'bg-white shadow-sm text-green-500' : ''}`}
        >
          <span className="hidden sm:inline">5cm Peak</span>
          <span className="sm:hidden">5</span>
        </Button>
      </div>

      <div className="h-px sm:h-8 sm:w-px bg-border sm:bg-border" />

      {/* Mobile: Global Actions Row */}
      <div className="flex items-center gap-2 flex-1 sm:flex-initial justify-center sm:justify-start">
        <Button
          variant="outline"
          size="sm"
          onClick={() => clearMap()}
          className="gap-1 sm:gap-2 text-xs sm:text-sm text-muted-foreground hover:text-destructive flex-1 sm:flex-initial min-w-[80px] sm:min-w-0"
        >
          <Eraser className="w-3 h-3 sm:w-4 sm:h-4" />
          <span className="hidden xs:inline">Clear</span>
          <span className="xs:hidden">Clr</span>
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => onSaveLoadOpen()}
          className="gap-1 sm:gap-2 text-xs sm:text-sm flex-1 sm:flex-initial min-w-[80px] sm:min-w-0"
        >
          <Save className="w-3 h-3 sm:w-4 sm:h-4" />
          <span className="hidden xs:inline">Save/Load</span>
          <span className="xs:hidden">Save</span>
        </Button>
      </div>

      {/* Help Text - Hidden on mobile */}
      <div className="absolute -top-8 left-1/2 -translate-x-1/2 whitespace-nowrap text-xs text-white/80 bg-black/50 px-3 py-1 rounded-full backdrop-blur-sm pointer-events-none hidden sm:block">
        Left-click to place • Select & Delete to remove
      </div>
    </Card>
  )
}
