import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { useMapStore } from '@/store/useMapStore';
import { cn } from '@/lib/utils';
import { Activity } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function MapStatsPanel() {
    const { tiles, assets } = useMapStore();
    const [fps, setFps] = useState(0);
    const [isOpen, setIsOpen] = useState(true);

    // Calculate counts
    const tileCount = Array.from(tiles.values()).reduce((acc, stack) => acc + stack.length, 0);
    const assetCount = assets.size;

    // Simple FPS counter
    useEffect(() => {
        let frameCount = 0;
        let lastTime = performance.now();
        let animationFrameId: number;

        const loop = () => {
            const now = performance.now();
            frameCount++;
            if (now - lastTime >= 1000) {
                setFps(Math.round((frameCount * 1000) / (now - lastTime)));
                frameCount = 0;
                lastTime = now;
            }
            animationFrameId = requestAnimationFrame(loop);
        };

        loop();
        return () => cancelAnimationFrame(animationFrameId);
    }, []);

    return (
        <div className="fixed top-24 left-6 z-30 flex items-start gap-2 pointer-events-none">
            {/* Toggle Button */}
            <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsOpen(!isOpen)}
                className={cn(
                    "pointer-events-auto h-8 w-8 rounded-full bg-slate-900/90 backdrop-blur-xl border border-slate-700/50 text-slate-400 hover:text-white hover:bg-slate-800 shadow-lg transition-all duration-300",
                    isOpen && "bg-slate-800 text-white"
                )}
            >
                <Activity className="w-4 h-4" />
            </Button>

            {/* Stats Panel */}
            <div className={cn(
                "overflow-hidden transition-all duration-500 ease-out pointer-events-auto",
                isOpen ? "w-56 opacity-100 translate-x-0" : "w-0 opacity-0 -translate-x-4"
            )}>
                <Card className="p-3 bg-slate-900/90 backdrop-blur-xl border border-slate-700/50 text-slate-200 shadow-2xl rounded-xl">
                    <div className="space-y-2 text-xs font-medium">
                        <div className="flex justify-between items-center">
                            <span className="text-slate-400">Tiles</span>
                            <span className="font-mono text-blue-400 bg-blue-400/10 px-1.5 py-0.5 rounded">{tileCount}</span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-slate-400">Assets</span>
                            <span className="font-mono text-emerald-400 bg-emerald-400/10 px-1.5 py-0.5 rounded">{assetCount}</span>
                        </div>
                        <div className="h-px bg-slate-800 my-1" />
                        <div className="flex justify-between items-center">
                            <span className="text-slate-400">FPS</span>
                            <span className="font-mono text-white font-bold text-sm">{fps}</span>
                        </div>
                    </div>
                </Card>
            </div>
        </div>
    );
}
