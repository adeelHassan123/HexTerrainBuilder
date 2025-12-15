/**
 * Centralized Asset Catalog Configuration
 * Single source of truth for all 3D assets in the application
 */

export interface AssetDefinition {
    id: string;
    name: string;
    category: 'Trees' | 'Rocks' | 'Buildings' | 'Scatter';
    path: string;
    scale: number;
    price: number;
}

export const ASSET_CATALOG: readonly AssetDefinition[] = [
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

// Helper function to get asset by ID
export const getAssetById = (id: string): AssetDefinition | undefined => {
    return ASSET_CATALOG.find(asset => asset.id === id);
};

// Helper function to get assets by category
export const getAssetsByCategory = (category: AssetDefinition['category']): AssetDefinition[] => {
    return ASSET_CATALOG.filter(asset => asset.category === category);
};
