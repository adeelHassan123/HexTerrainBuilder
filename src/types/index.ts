/**
 * Shared TypeScript type definitions for HexTerrainBuilder
 */

export type TileHeight = 1 | 2 | 5; // cm heights

export interface Tile {
  q: number;
  r: number;
  height: TileHeight;
  id: string;
  stackLevel: number; // Which position in the stack (0 = base, 1 = on top of base, etc.)
}

export interface PlacedAsset {
  id: string;
  q: number;
  r: number;
  type: string; // Asset type ID (e.g., 'tree_pine', 'rock_large')
  rotationY: number; // Y-axis rotation in radians
  stackLevel: number; // Position in stack (sits on top of tiles at this hex)
}

export type ToolMode = 'tile' | 'asset' | 'select' | 'delete';

export interface TableSize {
  widthCm: number; // Width in centimeters (real-world)
  heightCm: number; // Height in centimeters (real-world)
}

// Standard tabletop gaming table sizes
export const STANDARD_TABLE_SIZES = [
  { name: 'Small Square (60×60cm)', widthCm: 60, heightCm: 60 },
  { name: 'Medium Rectangle (90×60cm)', widthCm: 90, heightCm: 60 },
  { name: 'Large Rectangle (120×60cm)', widthCm: 120, heightCm: 60 },
  { name: 'Large Square (120×120cm)', widthCm: 120, heightCm: 120 },
] as const;


export interface DraggedAsset {
  type: string;
  q: number;
  r: number;
}

export interface MapProject {
  name: string;
  tableSize: TableSize;
  tiles: Tile[];
  assets: PlacedAsset[];
  createdAt: string;
  lastModified: string;
}

export const ASSET_CATALOG = [
  // Trees (7 unique species/variations)
  { id: "tree_pine", name: "Pine Tree", category: "Trees", path: "/models/trees/tree_pine.glb", scale: 1.0, price: 2.99 },
  { id: "tree_oak", name: "Oak Tree", category: "Trees", path: "/models/trees/tree_oak.glb", scale: 1.2, price: 3.49 },
  { id: "tree_birch", name: "Birch Tree", category: "Trees", path: "/models/trees/tree_birch.glb", scale: 0.9, price: 2.99 },
  { id: "tree_maple", name: "Maple Tree", category: "Trees", path: "/models/trees/tree_maple.glb", scale: 1.1, price: 3.49 },
  { id: "tree_dead", name: "Dead Tree", category: "Trees", path: "/models/trees/tree_dead.glb", scale: 1.0, price: 2.49 },
  { id: "tree_palm", name: "Palm Tree", category: "Trees", path: "/models/trees/tree_palm.glb", scale: 1.3, price: 3.99 },
  { id: "tree_willow", name: "Willow Tree", category: "Trees", path: "/models/trees/tree_willow.glb", scale: 1.4, price: 3.99 },

  // Rocks (5 unique variations)
  { id: "rock_small", name: "Small Pebble", category: "Rocks", path: "/models/rocks/rock_small.glb", scale: 0.5, price: 1.99 },
  { id: "rock_medium", name: "Medium Rock", category: "Rocks", path: "/models/rocks/rock_medium.glb", scale: 0.8, price: 2.99 },
  { id: "rock_large", name: "Large Boulder", category: "Rocks", path: "/models/rocks/rock_large.glb", scale: 1.2, price: 4.99 },
  { id: "rock_cliff", name: "Cliff Face", category: "Rocks", path: "/models/rocks/rock_cliff.glb", scale: 1.5, price: 6.99 },
  { id: "rock_mossy", name: "Mossy Rock", category: "Rocks", path: "/models/rocks/rock_mossy.glb", scale: 0.9, price: 3.49 },

  // Buildings (4 structures)
  { id: "house_cottage", name: "Cottage", category: "Buildings", path: "/models/buildings/house_cottage.glb", scale: 1.0, price: 14.99 },
  { id: "tower_watch", name: "Watch Tower", category: "Buildings", path: "/models/buildings/tower_watch.glb", scale: 1.2, price: 19.99 },
  { id: "ruin_stone", name: "Stone Ruin", category: "Buildings", path: "/models/buildings/ruin_stone.glb", scale: 1.0, price: 12.99 },
  { id: "bridge_wood", name: "Wooden Bridge", category: "Buildings", path: "/models/buildings/bridge_wood.glb", scale: 1.0, price: 9.99 },

  // Scatter Props (6 small decorative items)
  { id: "scatter_grass", name: "Grass Tuft", category: "Scatter", path: "/models/scatter/grass_tuft.glb", scale: 0.3, price: 0.99 },
  { id: "scatter_flowers", name: "Wildflowers", category: "Scatter", path: "/models/scatter/flowers.glb", scale: 0.4, price: 1.49 },
  { id: "scatter_mushroom", name: "Mushrooms", category: "Scatter", path: "/models/scatter/mushroom.glb", scale: 0.3, price: 1.29 },
  { id: "scatter_log", name: "Dead Log", category: "Scatter", path: "/models/scatter/log_dead.glb", scale: 0.6, price: 1.99 },
  { id: "scatter_fern", name: "Fern", category: "Scatter", path: "/models/scatter/fern.glb", scale: 0.5, price: 1.49 },
  { id: "scatter_vine", name: "Hanging Vine", category: "Scatter", path: "/models/scatter/vine.glb", scale: 0.4, price: 1.49 },
] as const;

export type AssetId = typeof ASSET_CATALOG[number]['id'];

export const TILE_PRICES: Record<TileHeight, number> = {
  1: 4.99,
  2: 9.99,
  5: 19.99,
};
