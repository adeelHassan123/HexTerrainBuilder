import { useEffect, useState } from 'react';
import { useMapStore } from '@/store/useMapStore';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { RotateCw, ZoomIn, ZoomOut } from 'lucide-react';
import { cn } from '@/lib/utils';

export function AssetTransformControls() {
  const { selectedObjectId, assets, rotateAsset, adjustAssetScale, isMobile } = useMapStore();
  const [scale, setScale] = useState(1.0);
  const [rotation, setRotation] = useState(0);

  // Determine if selected object is an asset
  const selectedAsset = selectedObjectId ? assets.get(selectedObjectId) : null;
  const isAssetSelected = !!selectedAsset;

  // Update local state when asset is selected or changes
  useEffect(() => {
    if (selectedAsset) {
      const validScale = isNaN(selectedAsset.scale) || selectedAsset.scale === undefined ? 1.0 : selectedAsset.scale;
      setScale(validScale);
      setRotation(selectedAsset.rotationY);
    }
  }, [selectedAsset?.id, selectedAsset?.scale, selectedAsset?.rotationY]);

  if (!isAssetSelected) return null;

  const handleRotateLeft = () => {
    rotateAsset(selectedObjectId!, -Math.PI / 6); // -30 degrees
    setRotation(rotation - Math.PI / 6);
  };

  const handleRotateRight = () => {
    rotateAsset(selectedObjectId!, Math.PI / 6); // +30 degrees
    setRotation(rotation + Math.PI / 6);
  };

  const handleScaleUp = () => {
    if (!selectedAsset) return;
    const newScale = Math.min(10.0, scale + 0.1);
    adjustAssetScale(selectedObjectId!, newScale - selectedAsset.scale);
    setScale(newScale);
  };

  const handleScaleDown = () => {
    if (!selectedAsset) return;
    const newScale = Math.max(0.1, scale - 0.1);
    adjustAssetScale(selectedObjectId!, newScale - selectedAsset.scale);
    setScale(newScale);
  };

  const handleResetScale = () => {
    if (!selectedAsset) return;
    const newScale = 1.0;
    adjustAssetScale(selectedObjectId!, newScale - selectedAsset.scale);
    setScale(newScale);
  };

  const rotationDegrees = Math.round((rotation * 180) / Math.PI) % 360;
  const scalePercent = Math.round((isNaN(scale) || scale === undefined ? 1 : scale) * 100);

  return (
    <div className={cn(
      "fixed left-4 z-30 flex flex-col gap-2 pointer-events-auto",
      isMobile ? "bottom-24 w-64" : "bottom-8"
    )}>
      <Card className="shadow-2xl bg-slate-900/90 backdrop-blur-xl border-slate-700/50 rounded-lg p-3 ring-1 ring-white/10">
        <div className="space-y-3">
          {/* Header */}
          <div className="text-xs font-semibold text-slate-300 uppercase tracking-wide">
            Asset Transform
          </div>

          {/* Rotation Controls */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-400">Rotation</span>
              <span className="text-xs font-mono text-slate-300 bg-slate-800/50 px-2 py-1 rounded">
                {rotationDegrees}°
              </span>
            </div>
            <div className="flex gap-2">
              <TooltipProvider delayDuration={100}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleRotateLeft}
                      className="flex-1 h-8 bg-slate-800/50 border-slate-600 hover:bg-slate-700 text-slate-300"
                    >
                      <RotateCw className="w-4 h-4 mr-1 transform scale-x-[-1]" />
                      <span className="text-xs">Left</span>
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="top" className="bg-slate-900 border-slate-700 text-slate-200 text-xs">
                    <p>Rotate Left (30°) | Hotkey: [ ]</p>
                  </TooltipContent>
                </Tooltip>

                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleRotateRight}
                      className="flex-1 h-8 bg-slate-800/50 border-slate-600 hover:bg-slate-700 text-slate-300"
                    >
                      <RotateCw className="w-4 h-4 mr-1" />
                      <span className="text-xs">Right</span>
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="top" className="bg-slate-900 border-slate-700 text-slate-200 text-xs">
                    <p>Rotate Right (30°)</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          </div>

          {/* Scale Controls */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-400">Scale</span>
              <span className="text-xs font-mono text-slate-300 bg-slate-800/50 px-2 py-1 rounded">
                {scalePercent}%
              </span>
            </div>

            {/* Direct Scale Input */}
            <input
              type="number"
              min="10"
              max="1000"
              step="10"
              value={scalePercent}
              onChange={(e) => {
                const val = parseInt(e.target.value, 10);
                if (!isNaN(val)) {
                  // Clamp to 10–1000 range
                  const clamped = Math.max(10, Math.min(1000, val));
                  const scaleFactor = clamped / 100;
                  adjustAssetScale(selectedObjectId!, scaleFactor - selectedAsset!.scale);
                  setScale(scaleFactor);
                }
              }}
              className="w-full h-8 bg-slate-800/50 border border-slate-600 rounded px-2 text-xs text-slate-300 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
              placeholder="10–1000"
            />

            <div className="flex gap-2">
              <TooltipProvider delayDuration={100}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleScaleDown}
                      disabled={scale <= 0.1}
                      className="flex-1 h-8 bg-slate-800/50 border-slate-600 hover:bg-slate-700 text-slate-300 disabled:opacity-50"
                    >
                      <ZoomOut className="w-4 h-4 mr-1" />
                      <span className="text-xs">Down</span>
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="top" className="bg-slate-900 border-slate-700 text-slate-200 text-xs">
                    <p>Scale Down (10%) | Hotkey: [ ]</p>
                  </TooltipContent>
                </Tooltip>

                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleScaleUp}
                      disabled={scale >= 10.0}
                      className="flex-1 h-8 bg-slate-800/50 border-slate-600 hover:bg-slate-700 text-slate-300 disabled:opacity-50"
                    >
                      <ZoomIn className="w-4 h-4 mr-1" />
                      <span className="text-xs">Up</span>
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="top" className="bg-slate-900 border-slate-700 text-slate-200 text-xs">
                    <p>Scale Up (10%) | Hotkey: [ ] — Max 1000%</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>

            {/* Reset Scale Button - Always Visible */}
            <TooltipProvider delayDuration={100}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleResetScale}
                    disabled={scale === 1.0}
                    className="w-full h-7 text-xs bg-slate-800/30 border-slate-600 hover:bg-slate-700 text-slate-300 disabled:opacity-50"
                  >
                    Reset to 100%
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="top" className="bg-slate-900 border-slate-700 text-slate-200 text-xs">
                  <p>Reset scale to default (1.0)</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>

          {/* Help Text */}
          <div className="text-xs text-slate-500 pt-2 border-t border-slate-700/50">
            <p>• Scroll to rotate</p>
            <p>• Ctrl+Scroll to scale</p>
            <p>• <kbd className="bg-slate-800 px-1 rounded text-xs">+</kbd> / <kbd className="bg-slate-800 px-1 rounded text-xs">-</kbd> to rotate</p>
            <p>• <kbd className="bg-slate-800 px-1 rounded text-xs">[</kbd> / <kbd className="bg-slate-800 px-1 rounded text-xs">]</kbd> to scale</p>
            <p className="mt-2 text-slate-600">Camera: Drag to pan</p>
            <p className="text-slate-600">Ctrl+Drag to rotate</p>
          </div>
        </div>
      </Card>
    </div>
  );
}
