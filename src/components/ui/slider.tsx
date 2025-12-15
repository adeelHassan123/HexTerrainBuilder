import * as React from "react"
import { cn } from "@/lib/utils"

interface SliderProps {
    value: number[]
    min?: number
    max?: number
    step?: number
    onValueChange?: (values: number[]) => void
    className?: string
    width?: string
}

export function Slider({
    value,
    min = 0,
    max = 100,
    step = 1,
    onValueChange,
    className,
    ...props
}: SliderProps) {
    const localValue = value[0] ?? min

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newValue = parseFloat(e.target.value)
        if (onValueChange) {
            onValueChange([newValue])
        }
    }

    // Calculate percentage for background gradient
    const percentage = ((localValue - min) / (max - min)) * 100

    return (
        <div className={cn("relative flex w-full touch-none select-none items-center", className)} {...props}>
            <input
                type="range"
                min={min}
                max={max}
                step={step}
                value={localValue}
                onChange={handleChange}
                className="h-2 w-full cursor-pointer appearance-none rounded-full bg-slate-800 accent-blue-500"
                style={{
                    backgroundImage: `linear-gradient(to right, #3b82f6 ${percentage}%, #1e293b ${percentage}%)`
                }}
            />
            <style>{`
        input[type=range]::-webkit-slider-thumb {
            -webkit-appearance: none;
            height: 16px;
            width: 16px;
            border-radius: 50%;
            background: #ffffff;
            cursor: pointer;
            border: 2px solid #3b82f6; 
            margin-top: -2px; /* Adjust for alignment */
        }
      `}</style>
        </div>
    )
}
