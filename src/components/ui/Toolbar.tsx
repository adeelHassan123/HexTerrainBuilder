import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { useMapStore } from "@/store/useMapStore"
import { X, Move, Mountain, Box, Save, Download, Trash2 } from "lucide-react"
import React from "react"
import { TileSelector } from "./TileSelector"
interface ToolbarProps {
  onSaveLoadOpen: () => void
  onExport?: (format: string) => void
}
import { ToolMode } from "@/types"
import { cn } from "@/lib/utils"

export function Toolbar({ onSaveLoadOpen, onExport }: ToolbarProps) {
  const {
    selectedTool,
    setTool,
    deleteSelected,
    selectedObjectId,
    isMobile,
    showTileSelector,
    setShowTileSelector
  } = useMapStore()
  const { clearMap, rotateMode, setRotateMode } = useMapStore()

  // Handle keyboard shortcuts
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase();
      const target = e.target as HTMLElement;
      const isInput = target.tagName === 'INPUT' || target.tagName === 'TEXTAREA';
      
      // Allow shortcuts unless typing in an input
      if (!isInput) {
        switch (key) {
          case '1':
            e.preventDefault();
            setTool('tile');
            setShowTileSelector(true);
            break;
          case '2':
            e.preventDefault();
            setTool('asset');
            break;
          case '3':
            e.preventDefault();
            setTool('select');
            break;
          case 'delete':
          case 'backspace':
            if (selectedObjectId) {
              e.preventDefault();
              deleteSelected();
            }
            break;
          case 's':
            if (e.ctrlKey || e.metaKey) {
              e.preventDefault();
              onSaveLoadOpen?.();
            }
            break;
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedObjectId, setTool, deleteSelected, onSaveLoadOpen, setShowTileSelector]);

  const tools = [
    { id: 'tile', icon: Mountain, label: 'Add Tile', hotkey: '1' },
    { id: 'asset', icon: Box, label: 'Add Asset', hotkey: '2' },
    // Use 'select' mode for moving/selection (ToolMode expects 'select')
    { id: 'select', icon: Move, label: 'Select/Move', hotkey: '3' },
    // Rotate performs an immediate action when something is selected; otherwise it falls back to select mode
    { id: 'delete', icon: Trash2, label: 'Delete', action: deleteSelected, disabled: !selectedObjectId, danger: true, hotkey: 'Delete' },
  ]

  return (
    <div className={cn(
      "fixed left-1/2 -translate-x-1/2 z-40 flex flex-col items-center gap-4 pointer-events-none",
      isMobile ? "bottom-4" : "bottom-8"
    )}>

      {/* Tile Selector - Context Aware (Shows when Tile tool is active and showTileSelector is true) */}
      <div className={cn(
        "transition-all duration-300 pointer-events-auto",
        selectedTool === 'tile' && showTileSelector ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4 pointer-events-none absolute bottom-0"
      )}>
        <TileSelector />
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
                  {tool.hotkey && <p className="text-xs text-slate-400 mt-1">Press <kbd className="px-1.5 py-0.5 bg-slate-800 rounded border border-slate-600 text-slate-300">{tool.hotkey}</kbd></p>}
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
                <p className="text-xs text-slate-400 mt-1">Press <kbd className="px-1.5 py-0.5 bg-slate-800 rounded border border-slate-600 text-slate-300">Ctrl+S</kbd></p>
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
                  <X className="w-6 h-6 text-rose-400" />
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
