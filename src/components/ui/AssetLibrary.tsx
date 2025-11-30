import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useMapStore } from "@/store/useMapStore"
import { ASSET_CATALOG } from "@/types"
import { Check } from "lucide-react"

const CATEGORIES = ["Trees", "Rocks", "Buildings", "Decorations"];

export function AssetLibrary() {
  const { selectedAssetType, setAssetType, setTool } = useMapStore()

  const handleClick = (assetId: string) => {
    setAssetType(assetId)
    setTool('asset')
  }

  return (
    <Card className="fixed right-4 top-20 w-80 h-[calc(100vh-7rem)] flex flex-col z-30 shadow-xl border-primary/20 bg-background/95 backdrop-blur-sm">
      <CardHeader className="p-4 border-b">
        <CardTitle className="text-lg">Asset Library</CardTitle>
      </CardHeader>

      <Tabs defaultValue="Trees" className="flex-1 flex flex-col">
        <TabsList className="w-full rounded-none border-b px-2 justify-start overflow-x-auto">
          {CATEGORIES.map((category) => (
            <TabsTrigger key={category} value={category} className="text-xs px-3">
              {category}
            </TabsTrigger>
          ))}
        </TabsList>

        <ScrollArea className="flex-1">
          <div className="p-4">
            {CATEGORIES.map((category) => (
              <TabsContent key={category} value={category} className="m-0">
                <div className="grid grid-cols-2 gap-3">
                  {ASSET_CATALOG.filter(a => a.category === category).map((asset) => {
                    const isSelected = selectedAssetType === asset.id;
                    return (
                      <Button
                        key={asset.id}
                        variant={isSelected ? 'default' : 'outline'}
                        className={`h-auto flex-col p-2 relative ${isSelected ? 'ring-2 ring-primary ring-offset-2' : 'hover:border-primary/50'}`}
                        onClick={() => handleClick(asset.id)}
                      >
                        {isSelected && (
                          <div className="absolute top-2 right-2 bg-primary text-primary-foreground rounded-full p-0.5">
                            <Check className="w-3 h-3" />
                          </div>
                        )}
                        <div className="w-full aspect-square bg-muted/50 rounded-md mb-2 overflow-hidden flex items-center justify-center">
                          {/* Placeholder for thumbnail - in real app would be an image */}
                          <div className="text-4xl">
                            {category === 'Trees' ? '🌲' : 
                             category === 'Rocks' ? '🪨' : 
                             category === 'Buildings' ? '🏠' : '🌿'}
                          </div>
                        </div>
                        <span className="text-xs font-medium">{asset.name}</span>
                      </Button>
                    );
                  })}
                </div>
              </TabsContent>
            ))}
          </div>
        </ScrollArea>
      </Tabs>
    </Card>
  )
}
