import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useMapStore, type PlacedAsset } from "@/store/useMapStore"
import { Trash2, RotateCw, Move, Copy } from "lucide-react"

export function InventoryPanel() {
  const { assets } = useMapStore()

  // Group assets by type
  const assetsByType = Array.from(assets.values()).reduce<Record<string, PlacedAsset[]>>((acc, asset) => {
    if (!acc[asset.type]) {
      acc[asset.type] = []
    }
    acc[asset.type].push(asset)
    return acc
  }, {})

  // Remove an asset by ID
  const handleRemoveAsset = (id: string) => {
    useMapStore.getState().removeAsset(id);
  }

  // Get asset display name from type
  const getAssetName = (type: string) => {
    return type.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')
  }

  return (
    <Card className="fixed right-4 bottom-4 w-80 h-96 flex flex-col">
      <CardHeader className="p-4 border-b">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Inventory</CardTitle>
          <div className="text-sm text-muted-foreground">
            {assets.size} items
          </div>
        </div>
      </CardHeader>

      <ScrollArea className="flex-1">
        <div className="p-4 space-y-4">
          {Object.entries(assetsByType).map(([type, typeAssets]) => (
            <div key={type} className="space-y-2">
              <h3 className="text-sm font-medium">{getAssetName(type)} ({typeAssets.length})</h3>
              <div className="grid grid-cols-2 gap-2">
                {typeAssets.map((asset) => (
                  <div
                    key={asset.id}
                    className="border rounded-md p-2 text-sm flex flex-col"
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-medium">{getAssetName(asset.type)}</span>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 text-destructive hover:bg-destructive/10"
                        onClick={() => handleRemoveAsset(asset.id)}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Position: ({asset.q}, {asset.r})
                    </div>
                    <div className="mt-2 flex gap-1">
                      <Button variant="outline" size="sm" className="h-8 px-2">
                        <Move className="h-3 w-3 mr-1" />
                        Move
                      </Button>
                      <Button variant="outline" size="sm" className="h-8 px-2">
                        <RotateCw className="h-3 w-3 mr-1" />
                        Rotate
                      </Button>
                      <Button variant="outline" size="sm" className="h-8 px-2">
                        <Copy className="h-3 w-3 mr-1" />
                        Duplicate
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}

          {assets.size === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              <p>No assets placed yet.</p>
              <p className="text-xs mt-1">Select an asset from the library and click on the map to place it.</p>
            </div>
          )}
        </div>
      </ScrollArea>

      <div className="p-3 border-t flex justify-between items-center bg-muted/20">
        <div className="text-sm">
          <span className="font-medium">Total Cost:</span> ${(assets.size * 4.99).toFixed(2)}
        </div>
        <Button size="sm" disabled={assets.size === 0}>
          Checkout
        </Button>
      </div>
    </Card>
  )
}
