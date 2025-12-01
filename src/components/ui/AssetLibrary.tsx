import { useState } from "react"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useMapStore } from "@/store/useMapStore"
import { ASSET_CATALOG } from "@/types"
import { Check, Package, ChevronRight, ChevronLeft } from "lucide-react"
import { cn } from "@/lib/utils"

const CATEGORIES = ["Trees", "Rocks", "Buildings", "Decorations"];

export function AssetLibrary() {
  const { selectedAssetType, setAssetType, setTool } = useMapStore()
  const [isOpen, setIsOpen] = useState(false)
  const [activeCategory, setActiveCategory] = useState("Trees")

  const handleSelect = (assetId: string) => {
    setAssetType(assetId)
    setTool('asset')
  }

  return (
    <div
      className={cn(
        "fixed right-0 top-1/2 -translate-y-1/2 z-30 flex items-start transition-all duration-500 ease-out",
        isOpen ? "translate-x-0" : "translate-x-[calc(100%-3rem)]"
      )}
    >
      {/* Toggle Handle */}
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setIsOpen(!isOpen)}
        className="h-24 w-12 rounded-l-xl bg-slate-900/90 backdrop-blur-md border-y border-l border-slate-700/50 text-slate-400 hover:text-white hover:bg-slate-800 shadow-xl -mr-1 z-40"
      >
        {isOpen ? <ChevronRight className="w-6 h-6" /> : <ChevronLeft className="w-6 h-6" />}
      </Button>

      {/* Main Panel */}
      <div className="w-80 h-[70vh] bg-slate-900/90 backdrop-blur-xl border border-slate-700/50 rounded-l-2xl shadow-2xl flex flex-col overflow-hidden">

        {/* Header */}
        <div className="p-4 border-b border-slate-700/50 bg-slate-900/50">
          <div className="flex items-center gap-2 mb-4">
            <Package className="w-5 h-5 text-blue-400" />
            <h2 className="font-bold text-white tracking-tight">Asset Library</h2>
          </div>

          {/* Category Tabs */}
          <div className="flex gap-1 overflow-x-auto pb-2 scrollbar-hide">
            {CATEGORIES.map(cat => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={cn(
                  "px-3 py-1.5 rounded-full text-xs font-medium transition-all whitespace-nowrap",
                  activeCategory === cat
                    ? "bg-blue-600 text-white shadow-lg shadow-blue-900/20"
                    : "bg-slate-800/50 text-slate-400 hover:bg-slate-700 hover:text-white"
                )}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Grid Content */}
        <ScrollArea className="flex-1 p-4">
          <div className="grid grid-cols-2 gap-3 pb-4">
            {ASSET_CATALOG.filter(a => a.category === activeCategory).map((asset) => {
              const isSelected = selectedAssetType === asset.id

              return (
                <button
                  key={asset.id}
                  onClick={() => handleSelect(asset.id)}
                  className={cn(
                    "group relative aspect-square rounded-xl border transition-all duration-300 overflow-hidden flex flex-col items-center justify-center gap-2",
                    isSelected
                      ? "bg-blue-500/10 border-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.3)]"
                      : "bg-slate-800/30 border-slate-700/50 hover:bg-slate-800 hover:border-slate-600"
                  )}
                >
                  {/* Selection Indicator */}
                  {isSelected && (
                    <div className="absolute top-2 right-2 w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center shadow-lg">
                      <Check className="w-3 h-3 text-white" />
                    </div>
                  )}

                  {/* Asset Preview (Emoji for now, 3D preview later) */}
                  <div className={cn(
                    "text-5xl transition-transform duration-300 filter drop-shadow-lg",
                    isSelected ? "scale-110" : "group-hover:scale-110"
                  )}>
                    {activeCategory === 'Trees' ? '🌲' :
                      activeCategory === 'Rocks' ? '🪨' :
                        activeCategory === 'Buildings' ? '🏠' : '🌿'}
                  </div>

                  <div className="absolute bottom-0 inset-x-0 p-2 bg-gradient-to-t from-slate-900/90 to-transparent text-center">
                    <span className="text-xs font-medium text-slate-200 truncate block">
                      {asset.name}
                    </span>
                  </div>
                </button>
              )
            })}
          </div>
        </ScrollArea>
      </div>
    </div>
  )
}
