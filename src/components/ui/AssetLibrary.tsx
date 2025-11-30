import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { useMapStore } from "@/store/useMapStore"
import { ASSET_CATALOG } from "@/types"
import { Check, Package } from "lucide-react"

const CATEGORIES = ["Trees", "Rocks", "Buildings", "Decorations"];

const AssetLibraryContent = () => {
  const { selectedAssetType, setAssetType, setTool } = useMapStore()

  const handleClick = (assetId: string) => {
    setAssetType(assetId)
    setTool('asset')
  }

  return (
    <>
      <CardHeader className="p-3 sm:p-4 border-b">
        <CardTitle className="text-base sm:text-lg">Asset Library</CardTitle>
      </CardHeader>

      <Tabs defaultValue="Trees" className="flex-1 flex flex-col">
        <TabsList className="w-full rounded-none border-b px-1 sm:px-2 justify-start overflow-x-auto">
          {CATEGORIES.map((category) => (
            <TabsTrigger key={category} value={category} className="text-xs px-2 sm:px-3 whitespace-nowrap">
              {category}
            </TabsTrigger>
          ))}
        </TabsList>

        <ScrollArea className="flex-1">
          <div className="p-2 sm:p-4">
            {CATEGORIES.map((category) => (
              <TabsContent key={category} value={category} className="m-0">
                <div className="grid grid-cols-2 sm:grid-cols-2 gap-2 sm:gap-3">
                  {ASSET_CATALOG.filter(a => a.category === category).map((asset) => {
                    const isSelected = selectedAssetType === asset.id;
                    return (
                      <Button
                        key={asset.id}
                        variant={isSelected ? 'default' : 'outline'}
                        className={`h-auto flex-col p-1.5 sm:p-2 relative ${isSelected ? 'ring-2 ring-primary ring-offset-2' : 'hover:border-primary/50'}`}
                        onClick={() => handleClick(asset.id)}
                      >
                        {isSelected && (
                          <div className="absolute top-1 right-1 sm:top-2 sm:right-2 bg-primary text-primary-foreground rounded-full p-0.5">
                            <Check className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                          </div>
                        )}
                        <div className="w-full aspect-square bg-muted/50 rounded-md mb-1 sm:mb-2 overflow-hidden flex items-center justify-center">
                          <div className="text-2xl sm:text-4xl">
                            {category === 'Trees' ? '🌲' : 
                             category === 'Rocks' ? '🪨' : 
                             category === 'Buildings' ? '🏠' : '🌿'}
                          </div>
                        </div>
                        <span className="text-xs font-medium line-clamp-1">{asset.name}</span>
                      </Button>
                    );
                  })}
                </div>
              </TabsContent>
            ))}
          </div>
        </ScrollArea>
      </Tabs>
    </>
  )
}

export function AssetLibrary() {
  return (
    <>
      {/* Desktop: Fixed Panel */}
      <Card className="hidden md:flex fixed right-4 top-20 w-80 h-[calc(100vh-7rem)] flex-col z-30 shadow-xl border-primary/20 bg-background/95 backdrop-blur-sm pointer-events-auto">
        <AssetLibraryContent />
      </Card>

      {/* Mobile: Sheet/Drawer */}
      <Sheet>
        <SheetTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            className="fixed bottom-20 right-4 md:hidden z-40 shadow-lg bg-background/95 backdrop-blur-sm pointer-events-auto"
            aria-label="Open Asset Library"
          >
            <Package className="w-4 h-4 mr-2" />
            Assets
          </Button>
        </SheetTrigger>
        <SheetContent side="right" className="w-full sm:w-[90vw] sm:max-w-sm p-0 flex flex-col">
          <Card className="flex flex-col h-full border-0 shadow-none rounded-none">
            <AssetLibraryContent />
          </Card>
        </SheetContent>
      </Sheet>
    </>
  )
}
