import { useMapStore } from "@/store/useMapStore"
import { TILE_TYPES } from "@/types"
import { Card } from "@/components/ui/card"
import { X } from "lucide-react"
import { useEffect } from "react"
import { cn } from "@/lib/utils"

export function TileSelector() {
  const { selectedTileHeight, setTileHeight, selectedTileType, setTileType, showTileSelector, setShowTileSelector } = useMapStore()

  // Handle escape key to close selector
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && showTileSelector) {
        e.preventDefault()
        setShowTileSelector(false)
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [showTileSelector, setShowTileSelector])

  return (
    <Card className="bg-slate-900/90 backdrop-blur-xl border border-slate-700/50 rounded-2xl shadow-2xl p-4 w-64 relative">
      {/* Close Button */}
      <button
        onClick={() => setShowTileSelector(false)}
        className="absolute top-3 right-3 w-6 h-6 flex items-center justify-center rounded-lg hover:bg-slate-800/50 text-slate-400 hover:text-white transition-all"
      >
        <X className="w-4 h-4" />
      </button>

      <div className="space-y-4">
        {/* Tile Height Section */}
        <div>
          <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wide mb-2">
            Tile Height
          </h3>
          <div className="flex gap-2">
            {[1, 2, 5].map((height) => (
              <button
                key={height}
                onClick={() => setTileHeight(height as 1 | 2 | 5)}
                className={cn(
                  "flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-all",
                  selectedTileHeight === height
                    ? "bg-blue-600 text-white shadow-lg shadow-blue-900/20"
                    : "bg-slate-800/50 text-slate-400 hover:bg-slate-700 hover:text-white"
                )}
              >
                {height}cm
              </button>
            ))}
          </div>
        </div>

        {/* Tile Type Section */}
        <div>
          <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wide mb-2">
            Terrain Type
          </h3>
          <div className="grid grid-cols-2 gap-2">
            {TILE_TYPES.map((tileType) => (
              <button
                key={tileType.id}
                onClick={() => setTileType(tileType.id)}
                className={cn(
                  "group relative px-3 py-3 rounded-lg text-sm font-medium transition-all flex items-center justify-between",
                  selectedTileType === tileType.id
                    ? "bg-blue-600 text-white shadow-lg shadow-blue-900/20"
                    : "bg-slate-800/50 text-slate-400 hover:bg-slate-700 hover:text-white"
                )}
              >
                <span>{tileType.name}</span>
                <div
                  className="w-4 h-4 rounded-full border border-current"
                  style={{ backgroundColor: tileType.color }}
                />
              </button>
            ))}
          </div>
        </div>

        {/* Info */}
        <div className="text-xs text-slate-500 border-t border-slate-700/50 pt-3">
          <p>
            <strong>Height:</strong> Select how thick each tile is
          </p>
          <p>
            <strong>Type:</strong> Choose the terrain appearance
          </p>
        </div>
      </div>
    </Card>
  )
}
