import { useMapStore } from "@/store/useMapStore";
import { Moon, Sun } from "lucide-react";
import { Slider } from "@/components/ui/slider";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export function TimeControls() {
    const { timeOfDay, setTimeOfDay, isMobile } = useMapStore();

    const formatTime = (time: number) => {
        const hours = Math.floor(time);
        const minutes = Math.floor((time - hours) * 60);
        const ampm = hours >= 12 ? 'PM' : 'AM';
        const displayHours = hours % 12 || 12;
        return `${displayHours}:${minutes.toString().padStart(2, '0')} ${ampm}`;
    };

    return (
        <Card className={cn(
            "fixed right-4 top-20 z-20 p-3 bg-slate-900/80 backdrop-blur-md border-slate-700/50 w-64",
            isMobile && "top-auto bottom-32 left-4 w-[calc(100vw-2rem)]"
        )}>
            <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                    {timeOfDay > 6 && timeOfDay < 18 ? (
                        <Sun className="w-4 h-4 text-yellow-400" />
                    ) : (
                        <Moon className="w-4 h-4 text-blue-300" />
                    )}
                    <span className="text-sm font-medium text-slate-200">
                        {formatTime(timeOfDay)}
                    </span>
                </div>
            </div>

            <Slider
                value={[timeOfDay]}
                min={0}
                max={24}
                step={0.1}
                onValueChange={(vals) => setTimeOfDay(vals[0])}
                className="cursor-pointer"
            />

            <div className="flex justify-between mt-1 text-[10px] text-slate-500 font-mono">
                <span>00:00</span>
                <span>12:00</span>
                <span>24:00</span>
            </div>
        </Card>
    );
}
