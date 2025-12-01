import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";

interface WelcomeScreenProps {
    onStart: () => void;
}

export function WelcomeScreen({ onStart }: WelcomeScreenProps) {
    return (
        <motion.div
            className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-slate-950 text-white"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0, transition: { duration: 0.8, ease: "easeInOut" } }}
        >
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.8, ease: "easeOut" }}
                className="text-center space-y-8"
            >
                <div className="space-y-4">
                    <h1 className="text-6xl md:text-8xl font-bold tracking-tighter bg-gradient-to-b from-white to-white/50 bg-clip-text text-transparent">
                        HexTerrain
                    </h1>
                    <p className="text-xl md:text-2xl text-slate-400 font-light tracking-wide">
                        Build Your World, One Hex at a Time
                    </p>
                </div>

                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.8, duration: 0.5 }}
                >
                    <Button
                        onClick={onStart}
                        size="lg"
                        className="text-lg px-8 py-6 rounded-full bg-white text-slate-950 hover:bg-slate-200 transition-all duration-300 shadow-[0_0_20px_rgba(255,255,255,0.3)] hover:shadow-[0_0_30px_rgba(255,255,255,0.5)]"
                    >
                        Start Building
                    </Button>
                </motion.div>
            </motion.div>

            {/* Decorative background elements */}
            <div className="absolute inset-0 -z-10 overflow-hidden pointer-events-none">
                <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl" />
                <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl" />
            </div>
        </motion.div>
    );
}
