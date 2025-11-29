import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useMapStore } from "@/store/useMapStore"
import { Plus, Search } from "lucide-react"

const ASSET_TYPES = [
  { id: 'terrain', name: 'Terrain' },
  { id: 'trees', name: 'Trees' },
  { id: 'rocks', name: 'Rocks' },
  { id: 'buildings', name: 'Buildings' },
  { id: 'decorations', name: 'Decorations' },
]

const ASSETS = {
  terrain: [
    { id: 'grass', name: 'Grass', thumbnail: '/assets/terrain/grass.jpg' },
    { id: 'water', name: 'Water', thumbnail: '/assets/terrain/water.jpg' },
    { id: 'sand', name: 'Sand', thumbnail: '/assets/terrain/sand.jpg' },
    { id: 'rock', name: 'Rock', thumbnail: '/assets/terrain/rock.jpg' },
  ],
  trees: [
    { id: 'oak', name: 'Oak', thumbnail: '/assets/trees/oak.png' },
    { id: 'pine', name: 'Pine', thumbnail: '/assets/trees/pine.png' },
    { id: 'palm', name: 'Palm', thumbnail: '/assets/trees/palm.png' },
    { id: 'dead', name: 'Dead', thumbnail: '/assets/trees/dead.png' },
  ],
  rocks: [
    { id: 'rock1', name: 'Rock 1', thumbnail: '/assets/rocks/rock1.png' },
    { id: 'rock2', name: 'Rock 2', thumbnail: '/assets/rocks/rock2.png' },
    { id: 'boulder', name: 'Boulder', thumbnail: '/assets/rocks/boulder.png' },
  ],
  buildings: [
    { id: 'house1', name: 'Small House', thumbnail: '/assets/buildings/house1.png' },
    { id: 'tower', name: 'Tower', thumbnail: '/assets/buildings/tower.png' },
    { id: 'bridge', name: 'Bridge', thumbnail: '/assets/buildings/bridge.png' },
  ],
  decorations: [
    { id: 'bush1', name: 'Bush', thumbnail: '/assets/decorations/bush1.png' },
    { id: 'flower1', name: 'Flower', thumbnail: '/assets/decorations/flower1.png' },
    { id: 'sign', name: 'Sign', thumbnail: '/assets/decorations/sign.png' },
  ],
}

export function AssetLibrary() {
  const { selectedAssetType, setAssetType } = useMapStore()

  return (
    <Card className="fixed right-4 top-20 w-80 h-[calc(100vh-7rem)] flex flex-col">
      <CardHeader className="p-4 border-b">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Asset Library</CardTitle>
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <input
              type="search"
              placeholder="Search assets..."
              className="pl-8 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            />
          </div>
        </div>
      </CardHeader>
      
      <Tabs defaultValue="terrain" className="flex-1 flex flex-col">
        <TabsList className="w-full rounded-none border-b px-2">
          {ASSET_TYPES.map((type) => (
            <TabsTrigger key={type.id} value={type.id} className="text-xs">
              {type.name}
            </TabsTrigger>
          ))}
        </TabsList>
        
        <div className="flex-1 overflow-auto p-4">
          {Object.entries(ASSETS).map(([category, assets]) => (
            <TabsContent key={category} value={category} className="m-0">
              <div className="grid grid-cols-2 gap-3">
                {assets.map((asset) => (
                  <Button
                    key={asset.id}
                    variant={selectedAssetType === asset.id ? 'default' : 'outline'}
                    className="h-auto flex-col p-2"
                    onClick={() => setAssetType(asset.id)}
                  >
                    <div className="w-full aspect-square bg-muted rounded-md mb-2 overflow-hidden">
                      <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                        {asset.name[0]}
                      </div>
                    </div>
                    <span className="text-xs">{asset.name}</span>
                  </Button>
                ))}
                
                <Button variant="outline" className="h-auto flex-col p-2">
                  <div className="w-full aspect-square bg-muted/50 border-2 border-dashed rounded-md mb-2 flex items-center justify-center">
                    <Plus className="h-6 w-6 text-muted-foreground" />
                  </div>
                  <span className="text-xs">Add Custom</span>
                </Button>
              </div>
            </TabsContent>
          ))}
        </div>
      </Tabs>
    </Card>
  )
}
