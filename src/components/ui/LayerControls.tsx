import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { useMapStore } from "@/store/useMapStore"
import { Eye, EyeOff } from "lucide-react"

export function LayerControls() {
  const { showLowerLayers, setShowLowerLayers } = useMapStore()

  return (
    <Card className="fixed top-4 left-1/2 -translate-x-1/2 p-3 shadow-xl z-40 bg-background/95 backdrop-blur-sm border-primary/20">
      <div className="flex items-center gap-3">
        <span className="text-sm font-semibold text-foreground whitespace-nowrap">Layers:</span>
        <Button
          variant={showLowerLayers ? 'default' : 'outline'}
          size="sm"
          onClick={() => setShowLowerLayers(!showLowerLayers)}
          className="flex items-center gap-2"
          aria-label={showLowerLayers ? 'Hide lower layers' : 'Show lower layers'}
        >
          {showLowerLayers ? (
            <>
              <Eye className="w-4 h-4" />
              <span>Show Lower</span>
            </>
          ) : (
            <>
              <EyeOff className="w-4 h-4" />
              <span>Hide Lower</span>
            </>
          )}
        </Button>
      </div>
    </Card>
  )
}

