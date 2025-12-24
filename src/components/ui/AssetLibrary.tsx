import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useMapStore } from "@/store/useMapStore"
import { ASSET_CATALOG, AssetDef } from "@/types"
import { Check, Package, ChevronRight, Upload, X, ArrowLeft } from "lucide-react"
import { cn } from "@/lib/utils"

const CATEGORIES = ["Trees", "Rocks", "Buildings", "Scatter"];

const CATEGORY_ICONS = {
  Trees: "🌲",
  Rocks: "🪨",
  Buildings: "🏠",
  Scatter: "🌿"
};

const BASE_ASSET_INFO = {
  tree_pine: { emoji: "🌲", description: "Evergreen conifer" },
  tree_oak: { emoji: "🌳", description: "Deciduous hardwood" },
  tree_birch: { emoji: "🌿", description: "Slender birch tree" },
  rock_small: { emoji: "🪨", description: "Small stone/pebble" },
  rock_medium: { emoji: "🪨", description: "Medium boulder" },
  rock_large: { emoji: "🪨", description: "Large rock formation" },
  rock_mossy: { emoji: "🪨", description: "Moss-covered stone" },
  house_cottage: { emoji: "🏠", description: "Rural cottage home" },
  tower_watch: { emoji: "🏰", description: "Watch/defense tower" },
  bush: { emoji: "🌿", description: "Shrub/undergrowth" },
  scatter_grass: { emoji: "🌱", description: "Grass tuft" },
  scatter_mushroom: { emoji: "🍄", description: "Fungi/mushroom" },
};

const SIZE_LABELS = {
  small: "Small",
  medium: "Medium",
  large: "Large"
};

const SIZE_COLORS = {
  small: "bg-green-500/20 border-green-500/50 text-green-300",
  medium: "bg-blue-500/20 border-blue-500/50 text-blue-300",
  large: "bg-purple-500/20 border-purple-500/50 text-purple-300"
};

// Map animal/object names to emojis
const ANIMAL_EMOJIS: Record<string, string> = {
  cat: "🐱", cats: "🐱", kitty: "🐱",
  dog: "🐶", dogs: "🐶", puppy: "🐶",
  fox: "🦊", foxes: "🦊",
  cow: "🐄", cows: "🐄",
  pig: "🐷", pigs: "🐷",
  sheep: "🐑", sheeps: "🐑",
  horse: "🐴", horses: "🐴",
  lion: "🦁", lions: "🦁",
  tiger: "🐯", tigers: "🐯",
  bear: "🐻", bears: "🐻",
  rabbit: "🐰", rabbits: "🐰",
  deer: "🦌", deers: "🦌",
  bird: "🐦", birds: "🐦", eagle: "🦅", eagles: "🦅",
  fish: "🐟", fishes: "🐟",
  butterfly: "🦋", butterflies: "🦋",
  dragon: "🐉", dragons: "🐉",
  unicorn: "🦄", unicorns: "🦄",
  penguin: "🐧", penguins: "🐧",
  panda: "🐼", pandas: "🐼"
};

// Extract emoji from filename
const getEmojiForAsset = (filename: string): string => {
  const nameWithoutExt = filename.toLowerCase().replace(/\.(glb|gltf)$/i, '');
  const words = nameWithoutExt.split(/[_-\s]+/);
  
  for (const word of words) {
    if (ANIMAL_EMOJIS[word]) {
      return ANIMAL_EMOJIS[word];
    }
  }
  
  return "🎁"; // Default emoji for unknown assets
};

// Get unique base assets for each category
const getBaseAssetsByCategory = (category: string) => {
  const categoryAssets = ASSET_CATALOG.filter(asset => asset.category === category);
  const baseAssets = new Map<string, AssetDef[]>();

  categoryAssets.forEach(asset => {
    if (asset.baseAssetId) {
      if (!baseAssets.has(asset.baseAssetId)) {
        baseAssets.set(asset.baseAssetId, []);
      }
      baseAssets.get(asset.baseAssetId)!.push(asset);
    }
  });

  return Array.from(baseAssets.entries()).map(([baseId, variants]) => ({
    baseId,
    baseAsset: variants[0], // Use first variant as representative
    variants: variants.sort((a, b) => {
      const sizeOrder = { small: 0, medium: 1, large: 2 };
      return sizeOrder[a.size!] - sizeOrder[b.size!];
    })
  }));
};

export function AssetLibrary() {
  const { selectedAssetType, setAssetType, setTool, isMobile, importedAssets, importedAssetNames, addImportedAsset, removeImportedAsset, isAssetLibraryOpen, setAssetLibraryOpen } = useMapStore()
  const [activeCategory, setActiveCategory] = useState("Trees")
  const [activeTab, setActiveTab] = useState<"quick" | "import">("quick")
  const [selectedBaseAsset, setSelectedBaseAsset] = useState<string | null>(null)
  const [isImporting, setIsImporting] = useState(false)
  const [importProgress, setImportProgress] = useState<{ current: number; total: number } | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleBaseAssetSelect = (baseId: string) => {
    setSelectedBaseAsset(baseId)
  }

  const handleSizeSelect = (assetId: string) => {
    setAssetType(assetId)
    setTool('asset')
    setSelectedBaseAsset(null) // Reset to show category view
  }

  const handleBackToCategory = () => {
    setSelectedBaseAsset(null)
  }

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.currentTarget.files
    if (!files || files.length === 0) return

    setIsImporting(true)
    setImportProgress({ current: 0, total: files.length })

    const validFiles = []
    const invalidFiles = []

    // Validate files first
    for (let i = 0; i < files.length; i++) {
      const file = files[i]
      if (file.name.toLowerCase().endsWith('.glb') || file.name.toLowerCase().endsWith('.gltf')) {
        validFiles.push(file)
      } else {
        invalidFiles.push(file.name)
      }
    }

    if (invalidFiles.length > 0) {
      alert(`The following files are not supported (only .glb and .gltf allowed):\n${invalidFiles.join('\n')}`)
    }

    if (validFiles.length === 0) {
      setIsImporting(false)
      setImportProgress(null)
      return
    }

    // Import valid files
    for (let i = 0; i < validFiles.length; i++) {
      const file = validFiles[i]

      try {
        const arrayBuffer = await new Promise<ArrayBuffer>((resolve, reject) => {
          const reader = new FileReader()
          reader.onload = (event) => {
            const result = event.target?.result
            if (result instanceof ArrayBuffer) {
              resolve(result)
            } else {
              reject(new Error('Failed to read file'))
            }
          }
          reader.onerror = () => reject(new Error('File reading error'))
          reader.readAsArrayBuffer(file)
        })

        const assetId = `imported-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
        await addImportedAsset(assetId, arrayBuffer, file.name)

        setImportProgress({ current: i + 1, total: validFiles.length })
      } catch (error) {
        console.error(`Error importing "${file.name}":`, error)
        alert(`Failed to import "${file.name}". The file may be corrupted or too large.`)
      }
    }

    setTimeout(() => {
      setIsImporting(false)
      setImportProgress(null)
    }, 500)

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
        isAssetLibraryOpen ? "translate-x-0" : "translate-x-[calc(100%-3rem)]",
        isMobile && "top-auto bottom-24 translate-y-0 h-[40vh]"
      )}
    >
      {/* Toggle Handle */}
      {/* Toggle Handle */}
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setAssetLibraryOpen(!isAssetLibraryOpen)}
        className="h-10 w-10 rounded-l-lg bg-slate-900/90 backdrop-blur-md border-y border-l border-slate-700/50 text-slate-400 hover:text-white hover:bg-slate-800 shadow-xl -mr-1 z-40"
        aria-label={isAssetLibraryOpen ? "Close Asset Library" : "Open Asset Library"}
      >
        {isAssetLibraryOpen ? <ChevronRight className="w-5 h-5" /> : <Package className="w-5 h-5" />}
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
            selectedBaseAsset ? (
              // Size Selection View
              <div className="space-y-4">
                {/* Back Button */}
                <Button
                  onClick={handleBackToCategory}
                  variant="ghost"
                  size="sm"
                  className="text-slate-400 hover:text-white mb-2"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to {activeCategory}
                </Button>

                {/* Size Variants */}
                <div className="space-y-3">
                  <h3 className="text-lg font-semibold text-white text-center">
                    Choose Size for {getBaseAssetsByCategory(activeCategory).find(item => item.baseId === selectedBaseAsset)?.baseAsset.name.replace(/ (Small|Medium|Large)/, '')}
                  </h3>

                  {getBaseAssetsByCategory(activeCategory)
                    .find(item => item.baseId === selectedBaseAsset)
                    ?.variants.map((variant) => {
                    const isSelected = selectedAssetType === variant.id
                    return (
                      <button
                        key={variant.id}
                        onClick={() => handleSizeSelect(variant.id)}
                        className={cn(
                          "w-full p-4 rounded-xl border transition-all duration-300 flex items-center justify-between",
                          isSelected
                            ? "bg-blue-500/20 border-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.3)]"
                            : "bg-slate-800/30 border-slate-700/50 hover:bg-slate-800 hover:border-slate-600"
                        )}
                      >
                        <div className="flex items-center gap-3">
                          {/* Size Badge */}
                          <div className={cn(
                            "px-3 py-1 rounded-full text-xs font-medium border",
                            SIZE_COLORS[variant.size!]
                          )}>
                            {SIZE_LABELS[variant.size!]}
                          </div>

                          {/* Asset Info */}
                          <div>
                            <div className="text-white font-medium">{variant.name}</div>
                            <div className="text-slate-400 text-sm">${variant.price}</div>
                          </div>
                        </div>

                        {/* Selection Indicator */}
                        {isSelected && (
                          <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                            <Check className="w-4 h-4 text-white" />
                          </div>
                        )}
                      </button>
                    )
                  })}
                </div>
              </div>
            ) : (
              // Base Asset Selection View
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  {getBaseAssetsByCategory(activeCategory).map(({ baseId, baseAsset, variants }) => {
                    const hasSelectionInThisGroup = variants.some(v => v.id === selectedAssetType)

                    return (
                      <button
                        key={baseId}
                        onClick={() => handleBaseAssetSelect(baseId)}
                        className={cn(
                          "group relative aspect-square rounded-xl border transition-all duration-300 overflow-hidden flex flex-col items-center justify-center gap-2",
                          hasSelectionInThisGroup
                            ? "bg-blue-500/10 border-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.3)]"
                            : "bg-slate-800/30 border-slate-700/50 hover:bg-slate-800 hover:border-slate-600"
                        )}
                      >
                        {/* Selection Indicator */}
                        {hasSelectionInThisGroup && (
                          <div className="absolute top-2 right-2 w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center shadow-lg z-10">
                            <Check className="w-3 h-3 text-white" />
                          </div>
                        )}

                        {/* Asset Preview */}
                        <div className="flex flex-col items-center gap-2">
                          <div className={cn(
                            "text-4xl transition-transform duration-300 filter drop-shadow-lg",
                            hasSelectionInThisGroup ? "scale-110" : "group-hover:scale-110"
                          )}>
                            {BASE_ASSET_INFO[baseId as keyof typeof BASE_ASSET_INFO]?.emoji || CATEGORY_ICONS[activeCategory as keyof typeof CATEGORY_ICONS]}
                          </div>

                          {/* Asset Description */}
                          <div className="text-center px-2">
                            <div className="text-xs font-medium text-slate-200 truncate">
                              {baseAsset.name.replace(/ (Small|Medium|Large)/, '')}
                            </div>
                            <div className="text-xs text-slate-400 mt-1">
                              {BASE_ASSET_INFO[baseId as keyof typeof BASE_ASSET_INFO]?.description || `${variants.length} sizes`}
                            </div>
                          </div>
                        </div>

                        {/* Size Options Preview */}
                        <div className="absolute top-2 left-2 flex gap-1">
                          {variants.map((variant, idx) => (
                            <div
                              key={idx}
                              className={cn(
                                "w-2 h-2 rounded-full border",
                                SIZE_COLORS[variant.size!]
                              )}
                              title={`${SIZE_LABELS[variant.size!]} - $${variant.price}`}
                            />
                          ))}
                        </div>

                        {/* Price Range */}
                        <div className="absolute top-2 right-12 bg-slate-900/80 px-2 py-1 rounded text-xs text-slate-300">
                          ${Math.min(...variants.map(v => v.price || 0))}-${Math.max(...variants.map(v => v.price || 0))}
                        </div>
                      </button>
                    )
                  })}
                </div>
              </div>
            )
          ) : (
            // Import Assets Tab
            <div className="flex flex-col gap-4">
              {/* Upload Button */}
              <div className="space-y-2">
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  accept=".glb,.gltf"
                  onChange={handleFileSelect}
                  className="hidden"
                  disabled={isImporting}
                />
                <button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isImporting}
                  className={cn(
                    "w-full p-6 border-2 border-dashed rounded-lg transition-all flex flex-col items-center justify-center gap-3",
                    isImporting
                      ? "border-slate-500 bg-slate-800/50 cursor-not-allowed"
                      : "border-slate-600 hover:border-blue-500 hover:bg-blue-500/5 text-slate-300 hover:text-blue-300"
                  )}
                >
                  <Upload className={cn("w-8 h-8", isImporting && "animate-pulse")} />
                  <div className="text-center">
                    <div className="text-sm font-medium">
                      {isImporting ? "Importing..." : "Upload 3D Models"}
                    </div>
                    <div className="text-xs text-slate-400 mt-1">
                      {isImporting
                        ? `Processing ${importProgress?.current || 0} of ${importProgress?.total || 0} files...`
                        : "Supports .glb and .gltf files"
                      }
                    </div>
                  </div>

                  {/* Progress Bar */}
                  {isImporting && importProgress && (
                    <div className="w-full max-w-xs bg-slate-700 rounded-full h-2">
                      <div
                        className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${(importProgress.current / importProgress.total) * 100}%` }}
                      />
                    </div>
                  )}
                </button>
              </div>

              {/* Imported Assets Grid */}
              {importedAssets.size > 0 ? (
                <div className="space-y-3">
                  <h3 className="text-sm font-medium text-slate-300">Imported Assets ({importedAssets.size})</h3>
                  <div className="grid grid-cols-2 gap-3">
                    {Array.from(importedAssets.keys()).map((assetId) => {
                      const isSelected = selectedAssetType === assetId
                      return (
                        <div
                          key={assetId}
                          className={cn(
                            "group relative aspect-square rounded-xl border transition-all duration-300 overflow-hidden flex flex-col items-center justify-center cursor-pointer",
                            isSelected
                              ? "bg-blue-500/10 border-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.3)]"
                              : "bg-slate-800/30 border-slate-700/50 hover:bg-slate-800 hover:border-slate-600"
                          )}
                          onClick={() => handleSizeSelect(assetId)}
                        >
                          {/* Selection Indicator */}
                          {isSelected && (
                            <div className="absolute top-2 right-2 w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center shadow-lg z-10">
                              <Check className="w-3 h-3 text-white" />
                            </div>
                          )}

                          {/* Asset Emoji */}
                          <div className="text-5xl drop-shadow-lg">
                            {getEmojiForAsset(importedAssetNames.get(assetId) || '')}
                          </div>

                          {/* Asset Filename */}
                          <div className="absolute bottom-0 inset-x-0 p-2 bg-gradient-to-t from-slate-900/90 to-transparent text-center">
                            <span className="text-xs font-medium text-slate-200 truncate block">
                              {importedAssetNames.get(assetId) || assetId.replace('imported-', '').slice(0, 8)}
                            </span>
                          </div>

                          {/* Delete Button */}
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              handleRemoveImported(assetId)
                            }}
                            className="absolute top-2 left-2 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity z-20 hover:scale-110"
                          >
                            <X className="w-3 h-3 text-white" />
                          </button>
                        </div>
                      )
                    })}
                  </div>
                </div>
              ) : (
                <div className="text-center py-12 text-slate-500">
                  <Package className="w-12 h-12 mx-auto mb-4 text-slate-600" />
                  <p className="text-sm font-medium">No imported assets yet</p>
                  <p className="text-xs mt-1">Upload .glb or .gltf files above to get started</p>
                </div>
              )}
            </div>
          )}
        </ScrollArea>
      </div>
    </div>
  )
}
