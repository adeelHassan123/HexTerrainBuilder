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
    <Card className="fixed top-20 left-4 w-48 flex flex-col z-30 shadow-xl border-primary/20 bg-background/95 backdrop-blur-sm">
      <CardHeader className="p-4 border-b">
        <CardTitle className="text-lg">Map Stats</CardTitle>
      </CardHeader>

      <div className="p-4 space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-muted-foreground">Tiles</span>
          <span className="text-sm font-bold">{totalTiles}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-muted-foreground">Assets</span>
          <span className="text-sm font-bold">{totalAssets}</span>
        </div>
      </div>
    </Card>
  )
}
