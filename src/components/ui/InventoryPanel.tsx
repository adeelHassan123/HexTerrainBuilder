import { Card, CardHeader, CardTitle } from "@/components/ui/card"
import { useMapStore } from "@/store/useMapStore"

export function InventoryPanel() {
  const { tiles, assets } = useMapStore()

  let totalTiles = 0;
  for (const [, tilesAt] of tiles) {
    if (Array.isArray(tilesAt)) {
      totalTiles += tilesAt.length;
    }
  }

  const totalAssets = assets.size;

  return (
    <Card className="fixed top-16 sm:top-20 left-2 sm:left-4 w-auto sm:w-48 flex flex-row sm:flex-col z-30 shadow-xl border-primary/20 bg-background/95 backdrop-blur-sm">
      <CardHeader className="p-2 sm:p-4 border-b-0 sm:border-b border-r sm:border-r-0">
        <CardTitle className="text-sm sm:text-lg whitespace-nowrap">Map Stats</CardTitle>
      </CardHeader>

      <div className="p-2 sm:p-4 space-y-2 sm:space-y-3 flex flex-row sm:flex-col gap-3 sm:gap-0">
        <div className="flex items-center justify-between gap-2 sm:gap-0">
          <span className="text-xs sm:text-sm font-medium text-muted-foreground">Tiles</span>
          <span className="text-xs sm:text-sm font-bold">{totalTiles}</span>
        </div>
        <div className="flex items-center justify-between gap-2 sm:gap-0">
          <span className="text-xs sm:text-sm font-medium text-muted-foreground">Assets</span>
          <span className="text-xs sm:text-sm font-bold">{totalAssets}</span>
        </div>
      </div>
    </Card>
  )
}
