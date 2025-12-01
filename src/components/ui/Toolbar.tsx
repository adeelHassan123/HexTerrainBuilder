import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { useMapStore } from "@/store/useMapStore"
import { Trash2, Move, Mountain, Box, Save, Download } from "lucide-react"
interface ToolbarProps {
  onSaveLoadOpen: () => void
  onExport?: (format: string) => void
}
import { TileHeight, ToolMode } from "@/types"
import { cn } from "@/lib/utils"

export function Toolbar({ onSaveLoadOpen, onExport }: ToolbarProps) {
  const {
    selectedTool,
    setTool,
    selectedTileHeight,
    setTileHeight,
    deleteSelected,
    selectedObjectId,
    isMobile
  } = useMapStore()
  const { clearMap, rotateMode, setRotateMode } = useMapStore()

  const tools = [
    { id: 'tile', icon: Mountain, label: 'Add Tile' },
    { id: 'asset', icon: Box, label: 'Add Asset' },
    // Use 'select' mode for moving/selection (ToolMode expects 'select')
    { id: 'select', icon: Move, label: 'Select/Move' },
    // Rotate performs an immediate action when something is selected; otherwise it falls back to select mode
    { id: 'delete', icon: Trash2, label: 'Delete', action: deleteSelected, disabled: !selectedObjectId, danger: true },
  ]

  return (
    <div className={cn(
      "fixed left-1/2 -translate-x-1/2 z-40 flex flex-col items-center gap-4 pointer-events-none",
      isMobile ? "bottom-4" : "bottom-8"
    )}>

      {/* Height Selector - Context Aware (Only shows when Tile tool is active) */}
      <div className={cn(
        "flex items-center gap-2 bg-slate-900/80 backdrop-blur-md p-1.5 rounded-full border border-slate-700/50 shadow-xl transition-all duration-300 pointer-events-auto",
        selectedTool === 'tile' ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4 pointer-events-none absolute bottom-0"
      )}>
        {([1, 2, 5] as TileHeight[]).map((height) => (
          <button
            key={height}
            onClick={() => setTileHeight(height)}
            className={cn(
              "w-8 h-8 rounded-full text-xs font-bold transition-all duration-200 flex items-center justify-center",
              selectedTileHeight === height
                ? "bg-emerald-500 text-white shadow-lg shadow-emerald-500/30 scale-110"
                : "text-slate-400 hover:text-white hover:bg-slate-700/50"
            )}
          >
            {height}
          </button>
        ))}
      </div>

      {/* Main Creation Bar */}
      <Card className={cn(
        "shadow-2xl bg-slate-900/90 backdrop-blur-xl border-slate-700/50 rounded-2xl flex items-center gap-2 pointer-events-auto ring-1 ring-white/10",
        isMobile ? "p-1.5 gap-1" : "p-2 gap-2"
      )}>
        <TooltipProvider delayDuration={100}>
          {tools.map((tool) => {
            const isActive = selectedTool === tool.id
            const Icon = tool.icon

            const isRotateModeActive = rotateMode && tool.id === 'rotate'

            return (
              <Tooltip key={tool.id}>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    disabled={tool.disabled}
                    onClick={() => {
                      // Special handling for rotate: toggle global rotateMode
                      if (tool.id === 'rotate') {
                        // toggle rotate mode and ensure selection mode active
                        setRotateMode(!rotateMode)
                        setTool('select')
                        return
                      }

                      if (tool.action) {
                        tool.action()
                      } else {
                        // tool.id may be 'select' | 'tile' | 'asset' | 'delete'
                        setTool(tool.id as unknown as ToolMode)
                      }
                    }}
                    className={cn(
                      "rounded-xl transition-all duration-300 relative group",
                      isMobile ? "w-10 h-10" : "w-12 h-12",
                      isActive
                        ? "bg-blue-500/20 text-blue-400 shadow-[0_0_20px_rgba(59,130,246,0.3)]"
                        : tool.danger
                          ? "hover:bg-red-500/20 hover:text-red-400 text-slate-400"
                          : "hover:bg-slate-800 text-slate-400 hover:text-white",
                      tool.danger && !tool.disabled && "hover:scale-110"
                    )}
                  >
                    <Icon className={cn(
                      "w-6 h-6 transition-transform duration-300",
                      // make rotate icon pulse when rotate-mode active
                      (isActive || isRotateModeActive) && "scale-110",
                      isRotateModeActive && "animate-[soft-pulse_2s_infinite]"
                    )} />

                    {/* Active Indicator Dot */}
                    {isActive && (
                      <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 bg-blue-400 rounded-full shadow-[0_0_8px_rgba(59,130,246,0.8)]" />
                    )}
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="top" className="bg-slate-900 border-slate-700 text-slate-200">
                  <p>{tool.id === 'rotate' ? (rotateMode ? 'Exit Rotate (drag to rotate selected)' : 'Rotate (toggle to drag-rotate)') : tool.label}</p>
                </TooltipContent>
              </Tooltip>
            )
          })}
        </TooltipProvider>
        {/* Extra actions (Save / Export / Clear Map) */}
        <div className="flex items-center gap-2 ml-2">
          <TooltipProvider delayDuration={100}>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => onSaveLoadOpen?.()}
                  className="w-10 h-10 rounded-xl bg-slate-800/20 hover:bg-slate-700/30 text-slate-300"
                >
                  <Save className="w-5 h-5 text-sky-400" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="top" className="bg-slate-900 border-slate-700 text-slate-200">
                <p>Save / Load</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <TooltipProvider delayDuration={100}>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => onExport?.('json')}
                  className="w-10 h-10 rounded-xl bg-slate-800/20 hover:bg-slate-700/30 text-slate-300"
                >
                  <Download className="w-5 h-5 text-emerald-300" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="top" className="bg-slate-900 border-slate-700 text-slate-200">
                <p>Export</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          <TooltipProvider delayDuration={100}>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => {
                    if (window.confirm('Clear the entire map? This cannot be undone.')) {
                      clearMap()
                    }
                  }}
                  className="w-10 h-10 rounded-xl bg-slate-800/20 hover:bg-red-600/10 text-slate-300"
                >
                  <Trash2 className="w-5 h-5 text-rose-400" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="top" className="bg-slate-900 border-slate-700 text-slate-200">
                <p>Clear Map</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </Card>
    </div>
  )
}
