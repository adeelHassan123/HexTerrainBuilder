/**
 * Centralized Asset Catalog Configuration
 * Single source of truth for all 3D assets in the application
 */

export type AssetSize = 'small' | 'medium' | 'large';

export interface AssetDefinition {
    id: string;
    name: string;
    category: 'Trees' | 'Rocks' | 'Buildings' | 'Scatter';
    path: string;
    scale: number;
    price: number;
    size: AssetSize;
    baseAssetId?: string;
}

export const ASSET_CATALOG: readonly AssetDefinition[] = [
    // Trees with size variants
    { id: "tree_pine_small", name: "Small Pine Tree", category: "Trees", path: "/models/trees/tree_pine.glb", scale: 0.6, price: 1.99, size: "small", baseAssetId: "tree_pine" },
    { id: "tree_pine_medium", name: "Pine Tree", category: "Trees", path: "/models/trees/tree_pine.glb", scale: 1.0, price: 2.99, size: "medium", baseAssetId: "tree_pine" },
    { id: "tree_pine_large", name: "Large Pine Tree", category: "Trees", path: "/models/trees/tree_pine.glb", scale: 1.4, price: 4.49, size: "large", baseAssetId: "tree_pine" },
    { id: "tree_oak_small", name: "Small Oak Tree", category: "Trees", path: "/models/trees/tree_oak.glb", scale: 0.7, price: 2.29, size: "small", baseAssetId: "tree_oak" },
    { id: "tree_oak_medium", name: "Oak Tree", category: "Trees", path: "/models/trees/tree_oak.glb", scale: 1.2, price: 3.49, size: "medium", baseAssetId: "tree_oak" },
    { id: "tree_oak_large", name: "Large Oak Tree", category: "Trees", path: "/models/trees/tree_oak.glb", scale: 1.6, price: 4.99, size: "large", baseAssetId: "tree_oak" },
    { id: "tree_birch_small", name: "Small Birch Tree", category: "Trees", path: "/models/trees/tree_birch.glb", scale: 0.5, price: 1.99, size: "small", baseAssetId: "tree_birch" },
    { id: "tree_birch_medium", name: "Birch Tree", category: "Trees", path: "/models/trees/tree_birch.glb", scale: 0.9, price: 2.99, size: "medium", baseAssetId: "tree_birch" },
    { id: "tree_birch_large", name: "Large Birch Tree", category: "Trees", path: "/models/trees/tree_birch.glb", scale: 1.3, price: 4.49, size: "large", baseAssetId: "tree_birch" },

    // Rocks with size variants
    { id: "rock_small", name: "Small Pebble", category: "Rocks", path: "/models/rocks/rock_small.glb", scale: 0.5, price: 1.49, size: "small", baseAssetId: "rock_small" },
    { id: "rock_medium", name: "Medium Rock", category: "Rocks", path: "/models/rocks/rock_medium.glb", scale: 0.8, price: 2.49, size: "medium", baseAssetId: "rock_medium" },
    { id: "rock_large", name: "Large Boulder", category: "Rocks", path: "/models/rocks/rock_large.glb", scale: 1.2, price: 3.99, size: "large", baseAssetId: "rock_large" },
    { id: "rock_mossy_small", name: "Small Mossy Rock", category: "Rocks", path: "/models/rocks/rock_mossy.glb", scale: 0.5, price: 2.29, size: "small", baseAssetId: "rock_mossy" },
    { id: "rock_mossy_medium", name: "Mossy Rock", category: "Rocks", path: "/models/rocks/rock_mossy.glb", scale: 0.9, price: 3.49, size: "medium", baseAssetId: "rock_mossy" },
    { id: "rock_mossy_large", name: "Large Mossy Rock", category: "Rocks", path: "/models/rocks/rock_mossy.glb", scale: 1.3, price: 4.99, size: "large", baseAssetId: "rock_mossy" },

    // Buildings with size variants
    { id: "house_cottage_small", name: "Small Cottage", category: "Buildings", path: "/models/buildings/house_cottage.glb", scale: 0.7, price: 9.99, size: "small", baseAssetId: "house_cottage" },
    { id: "house_cottage_medium", name: "Cottage", category: "Buildings", path: "/models/buildings/house_cottage.glb", scale: 1.0, price: 14.99, size: "medium", baseAssetId: "house_cottage" },
    { id: "house_cottage_large", name: "Large Cottage", category: "Buildings", path: "/models/buildings/house_cottage.glb", scale: 1.3, price: 19.99, size: "large", baseAssetId: "house_cottage" },
    { id: "tower_watch_small", name: "Small Watch Tower", category: "Buildings", path: "/models/buildings/tower_watch.glb", scale: 0.8, price: 12.99, size: "small", baseAssetId: "tower_watch" },
    { id: "tower_watch_medium", name: "Watch Tower", category: "Buildings", path: "/models/buildings/tower_watch.glb", scale: 1.2, price: 19.99, size: "medium", baseAssetId: "tower_watch" },
    { id: "tower_watch_large", name: "Large Watch Tower", category: "Buildings", path: "/models/buildings/tower_watch.glb", scale: 1.6, price: 26.99, size: "large", baseAssetId: "tower_watch" },

    // Scatter items with size variants
    { id: "bush_small", name: "Small Bush", category: "Scatter", path: "/models/foliage/bush.glb", scale: 0.6, price: 0.99, size: "small", baseAssetId: "bush" },
    { id: "bush_medium", name: "Bush", category: "Scatter", path: "/models/foliage/bush.glb", scale: 1.0, price: 1.49, size: "medium", baseAssetId: "bush" },
    { id: "bush_large", name: "Large Bush", category: "Scatter", path: "/models/foliage/bush.glb", scale: 1.4, price: 2.29, size: "large", baseAssetId: "bush" },
    { id: "scatter_grass_small", name: "Small Grass Tuft", category: "Scatter", path: "/models/scatter/grass_tuft.glb", scale: 0.2, price: 0.49, size: "small", baseAssetId: "scatter_grass" },
    { id: "scatter_grass_medium", name: "Grass Tuft", category: "Scatter", path: "/models/scatter/grass_tuft.glb", scale: 0.3, price: 0.99, size: "medium", baseAssetId: "scatter_grass" },
    { id: "scatter_grass_large", name: "Large Grass Tuft", category: "Scatter", path: "/models/scatter/grass_tuft.glb", scale: 0.4, price: 1.49, size: "large", baseAssetId: "scatter_grass" },
] as const;

export type AssetId = typeof ASSET_CATALOG[number]['id'];

// Helper function to get asset by ID
export const getAssetById = (id: string): AssetDefinition | undefined => {
    return ASSET_CATALOG.find(asset => asset.id === id);
};

// Helper function to get assets by category
export const getAssetsByCategory = (category: AssetDefinition['category']): AssetDefinition[] => {
    return ASSET_CATALOG.filter(asset => asset.category === category);
};
