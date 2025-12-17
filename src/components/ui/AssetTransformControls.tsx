import { useEffect, useState } from 'react';
import { useMapStore } from '@/store/useMapStore';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { RotateCw, HelpCircle, Minus, Plus } from 'lucide-react';
import { cn } from '@/lib/utils';

export function AssetTransformControls() {
  const { selectedObjectId, assets, rotateAsset, scaleAsset, isMobile } = useMapStore();
  const [scale, setScale] = useState(1.0);
  const [rotation, setRotation] = useState(0);
  const [scaleInput, setScaleInput] = useState("100");

  // Determine if selected object is an asset
  const selectedAsset = selectedObjectId ? assets.get(selectedObjectId) : null;
  const isAssetSelected = !!selectedAsset;

  // Update local state when asset is selected or changes
  useEffect(() => {
    if (selectedAsset) {
      const validScale = isNaN(selectedAsset.scale) || selectedAsset.scale === undefined ? 1.0 : selectedAsset.scale;
      // Use setTimeout to avoid setState in effect
      setTimeout(() => {
        setScale(validScale);
        setScaleInput(Math.round(validScale * 100).toString());
        setRotation(selectedAsset.rotationY);
      }, 0);
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
    const newScale = Math.min(15.0, scale + 0.1);
    scaleAsset(selectedObjectId!, newScale);
    setScale(newScale);
    setScaleInput(Math.round(newScale * 100).toString());
  };

  const handleScaleDown = () => {
    const newScale = Math.max(0.0, scale - 0.1);
    scaleAsset(selectedObjectId!, newScale);
    setScale(newScale);
    setScaleInput(Math.round(newScale * 100).toString());
  };

  const handleScaleChange = (values: number[]) => {
    const newScale = values[0] / 100; // Convert from percentage back to decimal
    scaleAsset(selectedObjectId!, newScale);
    setScale(newScale);
    setScaleInput(values[0].toString());
  };

  const handleScaleInputChange = (value: string) => {
    setScaleInput(value);
    const numericValue = parseFloat(value);
    if (!isNaN(numericValue) && numericValue >= 0 && numericValue <= 1500) {
      const newScale = numericValue / 100;
      scaleAsset(selectedObjectId!, newScale);
      setScale(newScale);
    }
  };

  const handleScaleInputBlur = () => {
    const numericValue = parseFloat(scaleInput);
    if (isNaN(numericValue) || numericValue < 0) {
      setScaleInput("0");
      scaleAsset(selectedObjectId!, 0.0);
      setScale(0.0);
    } else if (numericValue > 1500) {
      setScaleInput("1500");
      scaleAsset(selectedObjectId!, 15.0);
      setScale(15.0);
    } else {
      setScaleInput(Math.round(numericValue).toString());
    }
  };

  const handleResetScale = () => {
    const newScale = 1.0;
    scaleAsset(selectedObjectId!, newScale);
    setScale(newScale);
    setScaleInput("100");
  };

  const rotationDegrees = Math.round((rotation * 180) / Math.PI) % 360;

  return (
    <div className={cn(
      "fixed z-40 transition-all duration-300 pointer-events-auto",
      // Position on left side below Time Controls
      "left-6 top-96",
      isMobile && "top-auto bottom-32 left-4 right-4"
    )}>
      <Card className="shadow-2xl bg-slate-900/95 backdrop-blur-xl border-slate-700/50 rounded-lg ring-1 ring-white/10">
        <div className="p-3 space-y-3">

          {/* Header */}
          <div className="text-center">
            <h3 className="text-xs font-semibold text-slate-200 uppercase tracking-wider">Asset Controls</h3>
          </div>

          {/* Rotation Controls */}
          <div className="space-y-2">
            <label className="text-xs text-slate-400 font-medium">Rotation</label>
            <div className="flex items-center gap-2">
              <Button size="icon" variant="ghost" className="h-7 w-7 text-slate-300 hover:text-white hover:bg-slate-700" onClick={handleRotateLeft} title="Rotate Left (-30°)">
                <RotateCw className="w-3 h-3 scale-x-[-1]" />
              </Button>
              <span className="text-xs font-mono min-w-[3rem] text-center text-slate-200 bg-slate-800/50 px-2 py-1 rounded">
                {rotationDegrees}°
              </span>
              <Button size="icon" variant="ghost" className="h-7 w-7 text-slate-300 hover:text-white hover:bg-slate-700" onClick={handleRotateRight} title="Rotate Right (+30°)">
                <RotateCw className="w-3 h-3" />
              </Button>
            </div>
          </div>

          {/* Scale Controls */}
          <div className="space-y-2">
            <label className="text-xs text-slate-400 font-medium">Scale (0% - 1500%)</label>

            {/* Scale Input with +/- buttons */}
            <div className="flex items-center gap-2">
              <Button
                size="icon"
                variant="ghost"
                className="h-7 w-7 text-slate-300 hover:text-white hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed"
                onClick={handleScaleDown}
                disabled={scale <= 0.0}
                title="Scale Down (-10%)"
              >
                <Minus className="w-3 h-3" />
              </Button>

              <Input
                type="number"
                value={scaleInput}
                onChange={(e) => handleScaleInputChange(e.target.value)}
                onBlur={handleScaleInputBlur}
                className="w-16 h-7 text-xs text-center bg-slate-800/50 border-slate-600 text-slate-200 focus:border-blue-500"
                min="0"
                max="1500"
                step="10"
                title="Scale percentage (0-1500%)"
              />

              <Button
                size="icon"
                variant="ghost"
                className="h-7 w-7 text-slate-300 hover:text-white hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed"
                onClick={handleScaleUp}
                disabled={scale >= 15.0}
                title="Scale Up (+10%)"
              >
                <Plus className="w-3 h-3" />
              </Button>
            </div>

            {/* Scale Slider */}
            <div className="px-1">
              <Slider
                value={[scale * 100]} // Convert to percentage for slider
                min={0}
                max={1500}
                step={10}
                onValueChange={handleScaleChange}
                className="w-full"
              />
            </div>

            {/* Scale Presets */}
            <div className="flex gap-1 justify-center">
              {[25, 50, 100, 200, 500].map((preset) => (
                <Button
                  key={preset}
                  size="sm"
                  variant="ghost"
                  className="h-6 px-2 text-xs text-slate-400 hover:text-slate-200 hover:bg-slate-700"
                  onClick={() => handleScaleChange([preset])}
                  title={`Set scale to ${preset}%`}
                >
                  {preset}%
                </Button>
              ))}
            </div>
          </div>

          {/* Reset Button */}
          <div className="pt-1 border-t border-slate-700/50">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-full h-7 text-xs text-slate-400 hover:text-slate-200 hover:bg-slate-700"
                    onClick={handleResetScale}
                    title="Reset scale to 100%"
                  >
                    <HelpCircle className="w-3 h-3 mr-2" />
                    Reset Scale
                  </Button>
                </TooltipTrigger>
                <TooltipContent className="bg-slate-900 border-slate-700 text-slate-200 text-xs">
                  <p>Reset scale to 100%</p>
                  <p>Mouse wheel: Rotate | Ctrl+Mouse wheel: Scale</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </div>
      </Card>
    </div>
  );
}
