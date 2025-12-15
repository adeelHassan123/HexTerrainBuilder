import { useEffect, useState } from 'react';
import { useMapStore } from '@/store/useMapStore';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { RotateCw, ZoomIn, ZoomOut, HelpCircle } from 'lucide-react';
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
      "fixed z-40 transition-all duration-300 pointer-events-auto",
      // Stack on left side below Time Controls
      "left-6 top-96",
      isMobile && "top-auto bottom-32"
    )}>
      <Card className="shadow-2xl bg-slate-900/90 backdrop-blur-xl border-slate-700/50 rounded-lg p-2 ring-1 ring-white/10 w-fit">
        <div className="flex items-center gap-2">

          {/* Rotation Group */}
          <div className="flex items-center gap-1 bg-slate-800/50 rounded p-1">
            <Button size="icon" variant="ghost" className="h-6 w-6 text-slate-300 hover:text-white" onClick={handleRotateLeft} title="Rotate Left">
              <RotateCw className="w-3 h-3 scale-x-[-1]" />
            </Button>
            <span className="text-[10px] font-mono w-8 text-center text-slate-400">{rotationDegrees}°</span>
            <Button size="icon" variant="ghost" className="h-6 w-6 text-slate-300 hover:text-white" onClick={handleRotateRight} title="Rotate Right">
              <RotateCw className="w-3 h-3" />
            </Button>
          </div>

          <div className="w-px h-6 bg-slate-700/50" />

          {/* Scale Group */}
          <div className="flex items-center gap-1 bg-slate-800/50 rounded p-1">
            <Button size="icon" variant="ghost" className="h-6 w-6 text-slate-300 hover:text-white" onClick={handleScaleDown} disabled={scale <= 0.1} title="Scale Down">
              <ZoomOut className="w-3 h-3" />
            </Button>
            <span className="text-[10px] font-mono w-8 text-center text-slate-400">{scalePercent}%</span>
            <Button size="icon" variant="ghost" className="h-6 w-6 text-slate-300 hover:text-white" onClick={handleScaleUp} disabled={scale >= 10.0} title="Scale Up">
              <ZoomIn className="w-3 h-3" />
            </Button>
          </div>

          {/* Help/Reset */}
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button size="icon" variant="ghost" className="h-6 w-6 text-slate-500 hover:text-slate-300" onClick={handleResetScale}>
                  <HelpCircle className="w-3 h-3" />
                </Button>
              </TooltipTrigger>
              <TooltipContent className="bg-slate-900 border-slate-700 text-slate-200 text-xs text-center">
                <p>Scroll: Rotate | Ctrl+Scroll: Scale</p>
                <p>Click me to Reset Scale</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </Card>
    </div>
  );
}
