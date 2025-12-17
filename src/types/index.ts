/**
 * Shared TypeScript type definitions for HexTerrainBuilder
 */

export type TileHeight = 1 | 2 | 5; // cm heights
export type TileType = 'grass' | 'path' | 'dirt' | 'rock' | 'water' | 'mud'; // Terrain types

export const TILE_TYPES: { id: TileType; name: string; color: string }[] = [
  { id: 'grass', name: 'Grass', color: '#7cb342' },
  { id: 'path', name: 'Path', color: '#a1887f' },
  { id: 'dirt', name: 'Dirt', color: '#8d6e63' },
  { id: 'rock', name: 'Rock', color: '#616161' },
  { id: 'water', name: 'Water', color: '#2196f3' },
  { id: 'mud', name: 'Mud', color: '#795548' },
];

export interface Tile {
  q: number; // axial column
  r: number; // axial row
  height: TileHeight; // 1, 2, or 5 (steps)
  type?: TileType; // 'ground', 'water', 'mud'
  stackLevel: number; // 0=bottom, 1=on top of 0, etc.
  id: string;
}

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

export type AssetSize = 'small' | 'medium' | 'large';

export interface AssetDef {
  id: string;
  name: string;
  category: string;
  path: string; // path to GLB
  thumbnail?: string;
  scale?: number;
  price?: number; // Cost in some hypothetical currency, used for export
  size?: AssetSize; // Size variant of the asset
  baseAssetId?: string; // Reference to the base asset if this is a size variant
}

export interface TableSize {
  widthCm: number;
  heightCm: number;
}

export const ASSET_CATALOG: AssetDef[] = [
  // Trees with size variants
  { id: 'tree_pine_small', name: 'Small Pine Tree', category: 'Trees', path: '/models/trees/tree_pine.glb', scale: 0.6, size: 'small', baseAssetId: 'tree_pine', price: 1.99 },
  { id: 'tree_pine_medium', name: 'Pine Tree', category: 'Trees', path: '/models/trees/tree_pine.glb', scale: 1.0, size: 'medium', baseAssetId: 'tree_pine', price: 2.99 },
  { id: 'tree_pine_large', name: 'Large Pine Tree', category: 'Trees', path: '/models/trees/tree_pine.glb', scale: 1.4, size: 'large', baseAssetId: 'tree_pine', price: 4.49 },
  { id: 'tree_oak_small', name: 'Small Oak Tree', category: 'Trees', path: '/models/trees/tree_oak.glb', scale: 0.7, size: 'small', baseAssetId: 'tree_oak', price: 2.29 },
  { id: 'tree_oak_medium', name: 'Oak Tree', category: 'Trees', path: '/models/trees/tree_oak.glb', scale: 1.2, size: 'medium', baseAssetId: 'tree_oak', price: 3.49 },
  { id: 'tree_oak_large', name: 'Large Oak Tree', category: 'Trees', path: '/models/trees/tree_oak.glb', scale: 1.6, size: 'large', baseAssetId: 'tree_oak', price: 4.99 },

  // Rocks with size variants
  { id: 'rock_small', name: 'Small Pebble', category: 'Rocks', path: '/models/rocks/rock_small.glb', scale: 0.5, size: 'small', baseAssetId: 'rock_small', price: 1.49 },
  { id: 'rock_medium', name: 'Medium Rock', category: 'Rocks', path: '/models/rocks/rock_medium.glb', scale: 0.8, size: 'medium', baseAssetId: 'rock_medium', price: 2.49 },
  { id: 'rock_large', name: 'Large Boulder', category: 'Rocks', path: '/models/rocks/rock_large.glb', scale: 1.2, size: 'large', baseAssetId: 'rock_large', price: 3.99 },

  // Buildings with size variants
  { id: 'house_cottage_small', name: 'Small Cottage', category: 'Buildings', path: '/models/buildings/house_cottage.glb', scale: 0.7, size: 'small', baseAssetId: 'house_cottage', price: 9.99 },
  { id: 'house_cottage_medium', name: 'Cottage', category: 'Buildings', path: '/models/buildings/house_cottage.glb', scale: 1.0, size: 'medium', baseAssetId: 'house_cottage', price: 14.99 },
  { id: 'house_cottage_large', name: 'Large Cottage', category: 'Buildings', path: '/models/buildings/house_cottage.glb', scale: 1.3, size: 'large', baseAssetId: 'house_cottage', price: 19.99 },
  { id: 'tower_watch_small', name: 'Small Watch Tower', category: 'Buildings', path: '/models/buildings/tower_watch.glb', scale: 0.8, size: 'small', baseAssetId: 'tower_watch', price: 12.99 },
  { id: 'tower_watch_medium', name: 'Watch Tower', category: 'Buildings', path: '/models/buildings/tower_watch.glb', scale: 1.2, size: 'medium', baseAssetId: 'tower_watch', price: 19.99 },
  { id: 'tower_watch_large', name: 'Large Watch Tower', category: 'Buildings', path: '/models/buildings/tower_watch.glb', scale: 1.6, size: 'large', baseAssetId: 'tower_watch', price: 26.99 },

  // Scatter items with size variants
  { id: 'bush_small', name: 'Small Bush', category: 'Scatter', path: '/models/foliage/bush.glb', scale: 0.6, size: 'small', baseAssetId: 'bush', price: 0.99 },
  { id: 'bush_medium', name: 'Bush', category: 'Scatter', path: '/models/foliage/bush.glb', scale: 1.0, size: 'medium', baseAssetId: 'bush', price: 1.49 },
  { id: 'bush_large', name: 'Large Bush', category: 'Scatter', path: '/models/foliage/bush.glb', scale: 1.4, size: 'large', baseAssetId: 'bush', price: 2.29 },
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