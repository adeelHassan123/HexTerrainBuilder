import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { useMapStore } from "@/store/useMapStore"
import { Eye, EyeOff } from "lucide-react"

export function LayerControls() {
  const { showLowerLayers, setShowLowerLayers, showGrid, setShowGrid } = useMapStore()

  return (
    <Card className="fixed top-2 sm:top-4 left-1/2 -translate-x-1/2 p-2 sm:p-3 shadow-xl z-40 bg-background/95 backdrop-blur-sm border-primary/20">
      <div className="flex items-center gap-1.5 sm:gap-3">
        <span className="text-xs sm:text-sm font-semibold text-foreground whitespace-nowrap hidden sm:inline">Layers:</span>
        <Button
          variant={showLowerLayers ? 'default' : 'outline'}
          size="sm"
          onClick={() => setShowLowerLayers(!showLowerLayers)}
          className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm"
          aria-label={showLowerLayers ? 'Hide lower layers' : 'Show lower layers'}
        >
          {showLowerLayers ? (
            <>
              <Eye className="w-3 h-3 sm:w-4 sm:h-4" />
              <span className="hidden xs:inline">Show Lower</span>
              <span className="xs:hidden">Lower</span>
            </>
          ) : (
            <>
              <EyeOff className="w-3 h-3 sm:w-4 sm:h-4" />
              <span className="hidden xs:inline">Hide Lower</span>
              <span className="xs:hidden">Lower</span>
            </>
          )}
        </Button>
        <Button
          variant={showGrid ? 'default' : 'outline'}
          size="sm"
          onClick={() => setShowGrid(!showGrid)}
          className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm"
          aria-label={showGrid ? 'Hide grid' : 'Show grid'}
        >
          {showGrid ? (
            <>
              <Eye className="w-3 h-3 sm:w-4 sm:h-4" />
              <span>Grid</span>
            </>
          ) : (
            <>
              <EyeOff className="w-3 h-3 sm:w-4 sm:h-4" />
              <span>Grid</span>
            </>
          )}
        </Button>
      </div>
    </Card>
  )
}

