import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { useMapStore } from "@/store/useMapStore";
import { TERRAIN_PRESETS } from "@/lib/terrainAI";
import { PlacementSuggestion } from "@/types";
import { Sparkles, Mountain, Trees, Building, TrendingUp, Target, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface TerrainGeneratorProps {
  isOpen: boolean;
  onClose: () => void;
}

const getTerrainIcon = (presetId: string) => {
  switch (presetId) {
    case 'forest': return Trees;
    case 'mountain': return Mountain;
    case 'urban': return Building;
    default: return Sparkles;
  }
};

const getConfidenceColor = (confidence: number) => {
  if (confidence >= 0.8) return 'bg-green-500';
  if (confidence >= 0.6) return 'bg-yellow-500';
  return 'bg-red-500';
};

export function TerrainGenerator({ isOpen, onClose }: TerrainGeneratorProps) {
  const {
    selectedPreset,
    setSelectedPreset,
    generateTerrain,
    analyzeCurrentTerrain,
    getPlacementSuggestions,
    applySuggestion,
    isGenerating,
    lastAnalysis,
    placementSuggestions,
    isMobile
  } = useMapStore();

  const [selectedSuggestion, setSelectedSuggestion] = useState<PlacementSuggestion | null>(null);
  const [generationRadius, setGenerationRadius] = useState(8);

  const handleGenerate = async () => {
    await generateTerrain(0, 0, generationRadius);
    // Auto-analyze after generation
    setTimeout(() => analyzeCurrentTerrain(), 500);
  };

  const handleAnalyze = () => {
    analyzeCurrentTerrain();
  };

  const handleGetSuggestions = () => {
    getPlacementSuggestions(0, 0);
  };

  if (!isOpen) return null;

  return (
    <div className={cn(
      "fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4",
      isMobile && "p-2"
    )} onClick={onClose}>
      <Card
        className={cn(
          "w-full max-w-4xl max-h-[90vh] overflow-hidden",
          isMobile && "max-w-[95vw] max-h-[95vh]"
        )}
        onClick={(e) => e.stopPropagation()}
      >
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-blue-500 rounded-lg flex items-center justify-center">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <div>
                <CardTitle className="text-xl">AI Terrain Generator</CardTitle>
                <CardDescription>Generate intelligent landscapes with smart asset placement</CardDescription>
              </div>
            </div>
            <Button variant="ghost" size="sm" onClick={onClose}>×</Button>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

            {/* Left Panel - Generation Controls */}
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Terrain Preset</label>
                <Select
                  value={selectedPreset.id}
                  onValueChange={(value: string) => {
                    const preset = TERRAIN_PRESETS.find(p => p.id === value);
                    if (preset) setSelectedPreset(preset);
                  }}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {TERRAIN_PRESETS.map((preset) => {
                      const Icon = getTerrainIcon(preset.id);
                      return (
                        <SelectItem key={preset.id} value={preset.id}>
                          <div className="flex items-center gap-2">
                            <Icon className="w-4 h-4" />
                            {preset.name}
                          </div>
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>
              </div>

              {/* Preset Preview */}
              <Card className="p-4">
                <div className="flex items-start gap-3">
                  {React.createElement(getTerrainIcon(selectedPreset.id), {
                    className: "w-8 h-8 text-primary mt-1"
                  })}
                  <div className="flex-1">
                    <h4 className="font-semibold">{selectedPreset.name}</h4>
                    <p className="text-sm text-muted-foreground mb-3">{selectedPreset.description}</p>

                    <div className="space-y-2">
                      <div>
                        <span className="text-xs font-medium">Height Distribution:</span>
                        <div className="flex gap-1 mt-1">
                          {Object.entries(selectedPreset.heightDistribution).map(([height, prob]) => (
                            <Badge key={height} variant="secondary" className="text-xs">
                              {height}cm: {Math.round(prob * 100)}%
                            </Badge>
                          ))}
                        </div>
                      </div>

                      <div>
                        <span className="text-xs font-medium">Asset Categories:</span>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {Object.entries(selectedPreset.assetCategories).map(([category, config]) => (
                            <Badge key={category} variant="outline" className="text-xs">
                              {category} ({Math.round(config.probability * 100)}%)
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>

              {/* Generation Controls */}
              <div className="space-y-3">
                <div>
                  <label className="text-sm font-medium">Generation Radius: {generationRadius} hexes</label>
                  <input
                    type="range"
                    min="3"
                    max="15"
                    value={generationRadius}
                    onChange={(e) => setGenerationRadius(Number(e.target.value))}
                    className="w-full mt-2"
                  />
                </div>

                <Button
                  onClick={handleGenerate}
                  disabled={isGenerating}
                  className="w-full"
                  size="lg"
                >
                  {isGenerating ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Generating Terrain...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4 mr-2" />
                      Generate Terrain
                    </>
                  )}
                </Button>
              </div>

              <Separator />

              {/* Analysis Controls */}
              <div className="space-y-3">
                <Button onClick={handleAnalyze} variant="outline" className="w-full">
                  <TrendingUp className="w-4 h-4 mr-2" />
                  Analyze Current Terrain
                </Button>

                <Button onClick={handleGetSuggestions} variant="outline" className="w-full">
                  <Target className="w-4 h-4 mr-2" />
                  Get Placement Suggestions
                </Button>
              </div>
            </div>

            {/* Right Panel - Analysis & Suggestions */}
            <div className="space-y-4">

              {/* Terrain Analysis */}
              {lastAnalysis && (
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg">Terrain Analysis</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <span className="text-sm font-medium">Type:</span>
                        <Badge className="ml-2 capitalize">{lastAnalysis.terrainType}</Badge>
                      </div>
                      <div>
                        <span className="text-sm font-medium">Connectivity:</span>
                        <span className="ml-2">{Math.round(lastAnalysis.connectivity * 100)}%</span>
                      </div>
                      <div>
                        <span className="text-sm font-medium">Asset Density:</span>
                        <span className="ml-2">{lastAnalysis.assetDensity.toFixed(2)}</span>
                      </div>
                      <div>
                        <span className="text-sm font-medium">Height Variance:</span>
                        <span className="ml-2">{Math.round(lastAnalysis.heightVariance)}</span>
                      </div>
                    </div>

                    {lastAnalysis.recommendedActions.length > 0 && (
                      <div>
                        <span className="text-sm font-medium">Recommendations:</span>
                        <ul className="mt-2 space-y-1">
                          {lastAnalysis.recommendedActions.map((action, index) => (
                            <li key={index} className="text-sm text-muted-foreground flex items-start gap-2">
                              <span className="text-primary mt-1">•</span>
                              {action}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}

              {/* Placement Suggestions */}
              {placementSuggestions.length > 0 && (
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg">Smart Placement Suggestions</CardTitle>
                    <CardDescription>AI-recommended assets for your terrain</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ScrollArea className="h-64">
                      <div className="space-y-3">
                        {placementSuggestions.map((suggestion, index) => (
                          <div
                            key={index}
                            className={cn(
                              "p-3 rounded-lg border cursor-pointer transition-colors",
                              selectedSuggestion?.assetType === suggestion.assetType
                                ? "border-primary bg-primary/5"
                                : "border-border hover:border-primary/50"
                            )}
                            onClick={() => {
                              setSelectedSuggestion(suggestion);
                              applySuggestion(suggestion);
                            }}
                          >
                            <div className="flex items-center justify-between mb-2">
                              <span className="font-medium">{suggestion.assetType.replace(/_/g, ' ')}</span>
                              <Badge className={cn("text-xs", getConfidenceColor(suggestion.confidence))}>
                                {Math.round(suggestion.confidence * 100)}% confidence
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground">{suggestion.reason}</p>
                            <div className="text-xs text-muted-foreground mt-1">
                              Position: ({suggestion.q}, {suggestion.r})
                            </div>
                          </div>
                        ))}
                      </div>
                    </ScrollArea>

                    {selectedSuggestion && (
                      <div className="mt-4 p-3 bg-primary/10 rounded-lg">
                        <p className="text-sm font-medium mb-1">Selected Suggestion:</p>
                        <p className="text-sm">{selectedSuggestion.reason}</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          Click on a hex in the 3D view to place this asset
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
