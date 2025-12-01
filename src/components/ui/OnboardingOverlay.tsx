import { useEffect, useState } from "react"
import { useMapStore } from "@/store/useMapStore"
import { AnimatePresence, motion } from "framer-motion"

export function OnboardingOverlay() {
    const { tiles } = useMapStore()
    const [step, setStep] = useState<'start' | 'drag' | 'done'>('start')
    const [isVisible, setIsVisible] = useState(() => {
        if (typeof window === 'undefined') return true
        return !localStorage.getItem('hexmap_visited')
    })

    useEffect(() => {
        let stepTimeoutId: number | null = null
        let hideTimeoutId: number | null = null

        if (tiles.size > 0 && step === 'start') {
            stepTimeoutId = window.setTimeout(() => setStep('drag'), 0)
        } else if (tiles.size > 2 && step === 'drag') {
            stepTimeoutId = window.setTimeout(() => setStep('done'), 0)
            hideTimeoutId = window.setTimeout(() => {
                setIsVisible(false)
                localStorage.setItem('hexmap_visited', 'true')
            }, 3000)
        }

        return () => {
            if (stepTimeoutId !== null) clearTimeout(stepTimeoutId)
            if (hideTimeoutId !== null) clearTimeout(hideTimeoutId)
        }
    }, [tiles.size, step])

    if (!isVisible) return null

    return (
        <div className="fixed inset-0 z-20 pointer-events-none flex items-center justify-center">
            <AnimatePresence mode="wait">
                {step === 'start' && (
                    <motion.div
                        key="start"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="text-center"
                    >
                        <h1 className="text-4xl font-bold text-white mb-2 drop-shadow-xl tracking-tight">
                            Welcome to HexMap 3D
                        </h1>
                        <p className="text-lg text-slate-300 drop-shadow-md">
                            Click <span className="text-blue-400 font-bold">+ Tile</span> below to start building
                        </p>
                    </motion.div>
                )}

                {step === 'drag' && (
                    <motion.div
                        key="drag"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="text-center"
                    >
    
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    )
}
