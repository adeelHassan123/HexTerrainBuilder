import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useMapStore } from "@/store/useMapStore"
import { ASSET_CATALOG } from "@/types"
import { Check, Package, ChevronRight, ChevronLeft, Upload, X } from "lucide-react"
import { cn } from "@/lib/utils"

const CATEGORIES = ["Trees", "Rocks", "Buildings", "Scatter"];

export function AssetLibrary() {
  const { selectedAssetType, setAssetType, setTool, isMobile, importedAssets, addImportedAsset, removeImportedAsset } = useMapStore()
  const [isOpen, setIsOpen] = useState(false)
  const [activeCategory, setActiveCategory] = useState("Trees")
  const [activeTab, setActiveTab] = useState<"quick" | "import">("quick")
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleSelect = (assetId: string) => {
    setAssetType(assetId)
    setTool('asset')
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.currentTarget.files
    if (!files) return

    for (let i = 0; i < files.length; i++) {
      const file = files[i]
      if (!file.name.toLowerCase().endsWith('.glb') && !file.name.toLowerCase().endsWith('.gltf')) {
        alert('Only .glb and .gltf files are supported')
        continue
      }

      const reader = new FileReader()
      reader.onload = (event) => {
        const result = event.target?.result
        if (result instanceof ArrayBuffer) {
          const assetId = `imported-${Date.now()}-${i}`
          addImportedAsset(assetId, result)
        }
      }
      reader.readAsArrayBuffer(file)
    }

    // Reset input
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const handleRemoveImported = (assetId: string) => {
    removeImportedAsset(assetId)
    if (selectedAssetType === assetId) {
      setAssetType('')
    }
  }

  return (
    <div
      className={cn(
        "fixed right-0 top-1/2 -translate-y-1/2 z-30 flex items-start transition-all duration-500 ease-out",
        isOpen ? "translate-x-0" : "translate-x-[calc(100%-3rem)]",
        isMobile && "top-auto bottom-24 translate-y-0 h-[40vh]"
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
      <div className={cn(
        "bg-slate-900/90 backdrop-blur-xl border border-slate-700/50 rounded-l-2xl shadow-2xl flex flex-col overflow-hidden",
        isMobile ? "w-[85vw] h-[40vh]" : "w-80 h-[70vh]"
      )}>

        {/* Header */}
        <div className="p-4 border-b border-slate-700/50 bg-slate-900/50">
          <div className="flex items-center gap-2 mb-4">
            <Package className="w-5 h-5 text-blue-400" />
            <h2 className="font-bold text-white tracking-tight">Asset Library</h2>
          </div>

          {/* Main Tabs */}
          <div className="flex gap-2 mb-3 border-b border-slate-700/50 pb-3">
            <button
              onClick={() => setActiveTab("quick")}
              className={cn(
                "px-3 py-1.5 rounded-lg text-xs font-medium transition-all",
                activeTab === "quick"
                  ? "bg-blue-600 text-white shadow-lg shadow-blue-900/20"
                  : "bg-slate-800/50 text-slate-400 hover:bg-slate-700 hover:text-white"
              )}
            >
              Quick Access
            </button>
            <button
              onClick={() => setActiveTab("import")}
              className={cn(
                "px-3 py-1.5 rounded-lg text-xs font-medium transition-all",
                activeTab === "import"
                  ? "bg-blue-600 text-white shadow-lg shadow-blue-900/20"
                  : "bg-slate-800/50 text-slate-400 hover:bg-slate-700 hover:text-white"
              )}
            >
              Import Assets
            </button>
          </div>

          {/* Category Tabs (only for Quick Access) */}
          {activeTab === "quick" && (
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
          )}
        </div>

        {/* Grid Content */}
        <ScrollArea className="flex-1 p-4 [&>div>div]:!block [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:bg-slate-800/50 [&::-webkit-scrollbar-thumb]:bg-slate-600 [&::-webkit-scrollbar-thumb]:rounded-full hover:[&::-webkit-scrollbar-thumb]:bg-slate-500">
          {activeTab === "quick" ? (
            // Quick Access Tab
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

                    {/* Asset Preview */}
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
          ) : (
            // Import Assets Tab
            <div className="flex flex-col gap-4">
              {/* Upload Button */}
              <div>
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  accept=".glb,.gltf"
                  onChange={handleFileSelect}
                  className="hidden"
                />
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full p-4 border-2 border-dashed border-slate-600 rounded-lg hover:border-blue-500 hover:bg-blue-500/5 transition-all flex items-center justify-center gap-2 text-slate-300 hover:text-blue-300"
                >
                  <Upload className="w-5 h-5" />
                  <span className="text-sm font-medium">Upload .glb/.gltf</span>
                </button>
              </div>

              {/* Imported Assets Grid */}
              {importedAssets.size > 0 ? (
                <div className="grid grid-cols-2 gap-3">
                  {Array.from(importedAssets.keys()).map((assetId) => {
                    const isSelected = selectedAssetType === assetId
                    return (
                      <div
                        key={assetId}
                        className={cn(
                          "group relative aspect-square rounded-xl border transition-all duration-300 overflow-hidden flex flex-col items-center justify-center",
                          isSelected
                            ? "bg-blue-500/10 border-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.3)]"
                            : "bg-slate-800/30 border-slate-700/50 hover:bg-slate-800 hover:border-slate-600"
                        )}
                      >
                        {/* Selection Indicator */}
                        {isSelected && (
                          <div className="absolute top-2 right-2 w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center shadow-lg z-10">
                            <Check className="w-3 h-3 text-white" />
                          </div>
                        )}

                        {/* 3D Model Icon */}
                        <div className="text-5xl filter drop-shadow-lg">📦</div>

                        {/* Delete Button */}
                        <button
                          onClick={() => handleRemoveImported(assetId)}
                          className="absolute top-2 left-2 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity z-20"
                        >
                          <X className="w-3 h-3 text-white" />
                        </button>

                        {/* Select on click */}
                        <button
                          onClick={() => handleSelect(assetId)}
                          className="absolute inset-0"
                        />
                      </div>
                    )
                  })}
                </div>
              ) : (
                <div className="text-center py-8 text-slate-500">
                  <p className="text-sm">No imported assets yet</p>
                  <p className="text-xs mt-1">Upload .glb or .gltf files to get started</p>
                </div>
              )}
            </div>
          )}
        </ScrollArea>
      </div>
    </div>
  )
}
