export type TileType = 'ground' | 'water' | 'mud';

export interface Tile {
  id: string;
  q: number; // axial column
  r: number; // axial row
  height: number; // 1, 2, or 5 (steps)
  type?: TileType; // 'ground', 'water', 'mud'
  stackLevel: number; // 0=bottom, 1=on top of 0, etc.
}

export type TileHeight = 1 | 2 | 5;

export interface PlacedAsset {
  id: string;
  q: number;
  r: number;
  type: string; // ID from catalog
  rotationY: number;
  scale: number;
  stackLevel: number;
}

export type ToolMode = 'select' | 'tile' | 'asset' | 'delete';

export interface AssetDef {
  id: string;
  name: string;
  category: string;
  path: string; // path to GLB
  thumbnail?: string;
  scale?: number;
  price?: number; // Cost in some hypothetical currency, used for export
}

export interface TableSize {
  widthCm: number;
  heightCm: number;
}

export const ASSET_CATALOG: AssetDef[] = [
  { id: 'tree_pine', name: 'Pine Tree', category: 'Trees', path: '/models/trees/tree_pine.glb' },
  { id: 'tree_oak', name: 'Oak Tree', category: 'Trees', path: '/models/trees/tree_oak.glb' },
  { id: 'rock_large', name: 'Large Rock', category: 'Rocks', path: '/models/rocks/rock_large.glb' },
  { id: 'rock_small', name: 'Small Rock', category: 'Rocks', path: '/models/rocks/rock_small.glb' },
  { id: 'house_cottage', name: 'Cottage', category: 'Buildings', path: '/models/buildings/house_cottage.glb' },
  { id: 'tower_watch', name: 'Watch Tower', category: 'Buildings', path: '/models/buildings/tower_watch.glb' },
  { id: 'bush', name: 'Bush', category: 'Scatter', path: '/models/foliage/bush.glb' },
];

export const TILE_PRICES: Record<number, number> = {
  1: 1.99,
  2: 2.99,
  5: 5.99
};

export interface WindowWithHexGridControls extends Window {
  __hexGridControlsEnabled?: (enabled: boolean) => void;
}

// AI Types
export interface TerrainPreset {
  id: string;
  name: string;
  description: string;
  heightDistribution: { [key: number]: number };
  assetCategories: {
    [category: string]: { probability: number; density: number; clustering: number };
  };
  colorScheme: { primary: string; secondary: string; accent: string };
}

export interface TerrainAnalysis {
  terrainType: 'flat' | 'hilly' | 'mountainous' | 'mixed';
  assetDensity: number;
  heightVariance: number;
  connectivity: number;
  recommendedActions: string[];
}

export interface PlacementSuggestion {
  q: number;
  r: number;
  assetType: string;
  reason: string;
  confidence: number;
}