import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Save } from "lucide-react"

interface ProjectInfoProps {
    onSave: () => void
}

export function ProjectInfo({ onSave }: ProjectInfoProps) {
    return (
        <Card className="fixed top-6 left-6 z-40 p-2 pl-4 pr-2 bg-slate-900/90 backdrop-blur-xl border border-slate-700/50 rounded-full shadow-2xl flex items-center gap-4 pointer-events-auto group hover:border-slate-600 transition-colors">
            <div className="flex flex-col">
                <h1 className="text-sm font-bold text-white tracking-tight leading-none">HexMap 3D</h1>
            </div>

            <div className="h-6 w-px bg-slate-800" />

            <Button
                size="sm"
                variant="ghost"
                onClick={onSave}
                className="h-8 w-8 rounded-full p-0 text-slate-400 hover:text-white hover:bg-slate-800"
            >
                <Save className="w-4 h-4" />
            </Button>
        </Card>
    )
}
