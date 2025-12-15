import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { useQualityStore, QualityPreset } from "@/store/useQualityStore";
import { Settings, Zap, Gauge, Sparkles, Monitor } from "lucide-react";
import { cn } from "@/lib/utils";

const QUALITY_ICONS: Record<QualityPreset, typeof Zap> = {
    low: Gauge,
    medium: Monitor,
    high: Sparkles,
    ultra: Zap,
};

const QUALITY_DESCRIPTIONS: Record<QualityPreset, string> = {
    low: "Optimized for low-end devices and mobile",
    medium: "Balanced performance and visual quality",
    high: "Enhanced visuals for modern hardware",
    ultra: "Maximum quality for high-end systems",
};

interface QualitySettingsProps {
    isOpen: boolean;
    onClose: () => void;
}

export function QualitySettings({ isOpen, onClose }: QualitySettingsProps) {
    const { settings, setPreset, autoDetectQuality } = useQualityStore();

    if (!isOpen) return null;

    return (
        <div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={onClose}
        >
            <Card
                className="w-full max-w-2xl"
                onClick={(e) => e.stopPropagation()}
            >
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                                <Settings className="w-6 h-6 text-white" />
                            </div>
                            <div>
                                <CardTitle>Graphics Quality Settings</CardTitle>
                                <CardDescription>Optimize performance for your device</CardDescription>
                            </div>
                        </div>
                        <Button variant="ghost" size="sm" onClick={onClose}>×</Button>
                    </div>
                </CardHeader>

                <CardContent className="space-y-6">
                    {/* Auto-detect button */}
                    <div className="flex justify-end">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={autoDetectQuality}
                        >
                            <Sparkles className="w-4 h-4 mr-2" />
                            Auto-Detect Quality
                        </Button>
                    </div>

                    {/* Quality presets */}
                    <div className="grid grid-cols-2 gap-4">
                        {(['low', 'medium', 'high', 'ultra'] as QualityPreset[]).map((preset) => {
                            const Icon = QUALITY_ICONS[preset];
                            const isActive = settings.preset === preset;

                            return (
                                <button
                                    key={preset}
                                    onClick={() => setPreset(preset)}
                                    className={cn(
                                        "p-4 rounded-lg border-2 transition-all text-left",
                                        isActive
                                            ? "border-primary bg-primary/10"
                                            : "border-border hover:border-primary/50"
                                    )}
                                >
                                    <div className="flex items-center gap-3 mb-2">
                                        <Icon className={cn(
                                            "w-6 h-6",
                                            isActive ? "text-primary" : "text-muted-foreground"
                                        )} />
                                        <span className="font-semibold capitalize">{preset}</span>
                                    </div>
                                    <p className="text-sm text-muted-foreground">
                                        {QUALITY_DESCRIPTIONS[preset]}
                                    </p>
                                </button>
                            );
                        })}
                    </div>

                    {/* Current settings display */}
                    <div className="pt-4 border-t">
                        <Label className="text-sm font-medium mb-3 block">Current Settings:</Label>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                                <span className="text-muted-foreground">Shadow Quality:</span>
                                <span className="ml-2 font-medium">{settings.shadowMapSize}px</span>
                            </div>
                            <div>
                                <span className="text-muted-foreground">Pixel Ratio:</span>
                                <span className="ml-2 font-medium">{settings.pixelRatio.toFixed(2)}x</span>
                            </div>
                            <div>
                                <span className="text-muted-foreground">Anti-aliasing:</span>
                                <span className="ml-2 font-medium">{settings.antialias ? 'On' : 'Off'}</span>
                            </div>
                            <div>
                                <span className="text-muted-foreground">Post-Processing:</span>
                                <span className="ml-2 font-medium">{settings.enablePostProcessing ? 'On' : 'Off'}</span>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
