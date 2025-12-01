import { useState, useEffect, useRef } from "react"
import { Card } from "@/components/ui/card"
import { useMapStore } from "@/store/useMapStore"
import { Mountain, Package, ChevronLeft, ChevronRight } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

export function MapStatsPanel() {
    const { tiles, assets } = useMapStore()
    const [isCollapsed, setIsCollapsed] = useState(false)

    // Count total tiles
    const totalTiles = Array.from(tiles.values()).reduce((sum, tileArray) => {
        return sum + (Array.isArray(tileArray) ? tileArray.length : 0);
    }, 0);

    const totalAssets = assets.size;

    // FPS tracking
    const [fps, setFps] = useState(0)
    const framesRef = useRef(0)
    const lastTimeRef = useRef<number>(0)

    useEffect(() => {
        let rafId: number
        lastTimeRef.current = performance.now()

        const loop = (t: number) => {
            framesRef.current += 1
            const delta = t - lastTimeRef.current
            if (delta >= 500) {
                const currentFps = Math.round((framesRef.current / delta) * 1000)
                setFps(currentFps)
                framesRef.current = 0
                lastTimeRef.current = t
            }
            rafId = requestAnimationFrame(loop)
        }

        rafId = requestAnimationFrame(loop)
        return () => cancelAnimationFrame(rafId)
    }, [])

    return (
        <div
            className={cn(
                "fixed left-0 top-1/2 -translate-y-1/2 z-30 flex items-start transition-all duration-500 ease-out",
                isCollapsed ? "-translate-x-[calc(100%-3rem)]" : "translate-x-0"
            )}
        >
            {/* Main Panel */}
            <Card className="w-48 py-6 px-4 bg-slate-900/90 backdrop-blur-xl border border-slate-700/50 rounded-r-2xl shadow-2xl flex flex-col gap-6">

                {/* Stats Items */}
                <div className="space-y-1">
                    <p className="text-xs font-medium text-slate-400 uppercase tracking-wider mb-2">Project Stats</p>

                    <div className="flex items-center justify-between group">
                        <div className="flex items-center gap-2 text-slate-300">
                            <Mountain className="w-4 h-4 text-emerald-400" />
                            <span className="text-sm">Tiles</span>
                        </div>
                        <span className="text-lg font-bold text-white font-mono">{totalTiles}</span>
                    </div>

                    <div className="w-full h-px bg-slate-800/50 my-2" />

                    <div className="flex items-center justify-between group">
                        <div className="flex items-center gap-2 text-slate-300">
                            <Package className="w-4 h-4 text-blue-400" />
                            <span className="text-sm">Assets</span>
                        </div>
                        <span className="text-lg font-bold text-white font-mono">{totalAssets}</span>
                    </div>

                    <div className="w-full h-px bg-slate-800/50 my-2" />

                    {/* Removed Value (currency) as it's not important) */}
                    <div className="flex items-center justify-between group">
                        <div className="flex items-center gap-2 text-slate-300">
                            <span className="text-sm">FPS</span>
                        </div>
                        <span className="text-lg font-bold text-white font-mono">{fps}</span>
                    </div>
                </div>

            </Card>

            {/* Toggle Handle */}
            <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsCollapsed(!isCollapsed)}
                className="h-24 w-12 rounded-r-xl bg-slate-900/90 backdrop-blur-md border-y border-r border-slate-700/50 text-slate-400 hover:text-white hover:bg-slate-800 shadow-xl -ml-1 z-40"
            >
                {isCollapsed ? <ChevronRight className="w-6 h-6" /> : <ChevronLeft className="w-6 h-6" />}
            </Button>
        </div>
    )
}
