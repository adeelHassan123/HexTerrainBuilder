import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { temporal } from 'zundo';
import { getKey } from '../lib/hexMath';
import { Tile, PlacedAsset, TileHeight, ToolMode, TableSize, ASSET_CATALOG } from '../types';

export interface MapState {
  tiles: Map<string, Tile[]>; // Map of hex key -> array of tiles at that hex (stacking)
  assets: Map<string, PlacedAsset>;
  importedAssets: Map<string, ArrayBuffer>; // Map of asset ID -> ArrayBuffer for user-uploaded models
  selectedTool: ToolMode;
  selectedTileHeight: TileHeight;
  selectedAssetType: string;
  tableSize: TableSize;
  projectName: string;
  selectedObjectId: string | null; // ID of selected tile or asset
  showLowerLayers: boolean; // Show/hide lower layers in stacks
  showGrid: boolean; // Show/hide grid overlay
  rotateMode: boolean; // Global rotate mode (drag to rotate selected)
  isMobile: boolean; // UI state for mobile responsiveness

  // Actions
  setTool: (tool: ToolMode) => void;
  setShowLowerLayers: (show: boolean) => void;
  setShowGrid: (show: boolean) => void;
  setRotateMode: (on: boolean) => void;
  setIsMobile: (isMobile: boolean) => void;
  setTileHeight: (h: TileHeight) => void;
  setAssetType: (type: string) => void;
  setSelectedObject: (id: string | null) => void;
  addImportedAsset: (id: string, buffer: ArrayBuffer) => void;
  removeImportedAsset: (id: string) => void;
  addTile: (q: number, r: number) => void;
  removeTile: (id: string, q: number, r: number) => void;
  removeAllTilesAt: (q: number, r: number) => void;
  addAsset: (q: number, r: number) => void;
  removeAsset: (id: string) => void;
  moveAsset: (id: string, q: number, r: number) => void;
  rotateAsset: (id: string, delta: number) => void;
  scaleAsset: (id: string, scale: number) => void;
  adjustAssetScale: (id: string, delta: number) => void;
  deleteSelected: () => void;
  clearMap: () => void;
  loadProject: (data: Partial<MapState>) => void;
  getTilesAt: (q: number, r: number) => Tile[];
  getTotalHeightAt: (q: number, r: number) => number;
}

export const useMapStore = create<MapState>()(
  temporal(
    persist(
      (set, get) => ({
        tiles: new Map(),
        assets: new Map(),
        importedAssets: new Map(),
        selectedTool: 'select',
        selectedTileHeight: 1,
        selectedAssetType: ASSET_CATALOG[0].id,
        tableSize: { widthCm: 90, heightCm: 60 }, // Medium rectangle table
        projectName: 'Untitled Project',
        selectedObjectId: null,
        showLowerLayers: true,
        showGrid: true, // Grid visible by default
        rotateMode: false,
        isMobile: false,

        setTool: (tool) => set({ selectedTool: tool, selectedObjectId: null }),
        setShowLowerLayers: (show) => set({ showLowerLayers: show }),
        setShowGrid: (show) => set({ showGrid: show }),
        setRotateMode: (on: boolean) => set({ rotateMode: on }),
        setIsMobile: (isMobile) => set({ isMobile }),
        setTileHeight: (h) => set({ selectedTileHeight: h }),
        setAssetType: (type) => set({ selectedAssetType: type }),
        setSelectedObject: (id) => set({ selectedObjectId: id }),

        addImportedAsset: (id, buffer) => set(state => {
          const newImported = new Map(state.importedAssets);
          newImported.set(id, buffer);
          return { importedAssets: newImported };
        }),

        removeImportedAsset: (id) => set(state => {
          const newImported = new Map(state.importedAssets);
          newImported.delete(id);
          return { importedAssets: newImported };
        }),

        getTilesAt: (q, r) => {
          const key = getKey(q, r);
          return get().tiles.get(key) || [];
        },

        getTotalHeightAt: (q, r) => {
          const tilesAt = get().getTilesAt(q, r);
          // Return total height in cm (will be multiplied by 0.5 for Three.js units)
          return tilesAt.reduce((sum, tile) => sum + tile.height, 0);
        },

        addTile: (q, r) => set(state => {
          const key = getKey(q, r);
          const tilesAt = state.tiles.get(key) || [];
          const newTile: Tile = {
            q,
            r,
            height: state.selectedTileHeight,
            id: crypto.randomUUID(),
            stackLevel: tilesAt.length,
          };
          const newTiles = new Map(state.tiles);
          newTiles.set(key, [...tilesAt, newTile]);
          return { tiles: newTiles };
        }),

        removeTile: (id, q, r) => set(state => {
          const key = getKey(q, r);
          const tilesAt = state.tiles.get(key) || [];
          const filtered = tilesAt.filter((t: Tile) => t.id !== id);
          const newTiles = new Map(state.tiles);
          if (filtered.length > 0) {
            // Update stackLevels
            const updated = filtered.map((t: Tile, i: number) => ({ ...t, stackLevel: i }));
            newTiles.set(key, updated);
          } else {
            newTiles.delete(key);
          }
          return { tiles: newTiles, selectedObjectId: null };
        }),

        removeAllTilesAt: (q, r) => set(state => {
          const key = getKey(q, r);
          const newTiles = new Map(state.tiles);
          newTiles.delete(key);
          // Also remove assets on this hex
          const newAssets = new Map(state.assets);
          for (const [id, asset] of newAssets) {
            if (asset.q === q && asset.r === r) newAssets.delete(id);
          }
          return { tiles: newTiles, assets: newAssets, selectedObjectId: null };
        }),

        addAsset: (q, r) => set(state => {
          const newAssets = new Map(state.assets);
          const assetId = crypto.randomUUID();
          const stackLevel = Array.from(state.assets.values()).filter(a => a.q === q && a.r === r).length;

          // Verify asset type exists in catalog OR is an imported asset
          const isImported = state.selectedAssetType.startsWith('imported-');
          const isInCatalog = ASSET_CATALOG.find(a => a.id === state.selectedAssetType);
          if (!isImported && !isInCatalog) return {};

          newAssets.set(assetId, {
            id: assetId,
            q,
            r,
            type: state.selectedAssetType,
            rotationY: 0,
            scale: 1.0,
            stackLevel,
          });
          return { assets: newAssets };
        }),

        removeAsset: (id) => set(state => {
          const newAssets = new Map(state.assets);
          newAssets.delete(id);
          return { assets: newAssets, selectedObjectId: null };
        }),

        moveAsset: (id, q, r) => set(state => {
          const asset = state.assets.get(id);
          if (!asset) return {};
          const newAssets = new Map(state.assets);
          // Recalculate stack level at new location
          const assetsAtNewLocation = Array.from(state.assets.values()).filter(a => a.q === q && a.r === r);
          const newStackLevel = assetsAtNewLocation.length;
          newAssets.set(id, { ...asset, q, r, stackLevel: newStackLevel });
          return { assets: newAssets };
        }),

        rotateAsset: (id, delta) => set(state => {
          const asset = state.assets.get(id);
          if (!asset) return {};
          const newAssets = new Map(state.assets);
          newAssets.set(id, { ...asset, rotationY: asset.rotationY + delta });
          return { assets: newAssets };
        }),

        scaleAsset: (id, scale) => set(state => {
          const asset = state.assets.get(id);
          if (!asset) return {};
          const newAssets = new Map(state.assets);
          // Clamp scale between 0.1 and 10.0 (1000%)
          const clampedScale = Math.max(0.1, Math.min(10.0, scale));
          newAssets.set(id, { ...asset, scale: clampedScale });
          return { assets: newAssets };
        }),

        adjustAssetScale: (id, delta) => set(state => {
          const asset = state.assets.get(id);
          if (!asset) return {};
          const newAssets = new Map(state.assets);
          // Clamp scale between 0.1 and 10.0 (1000%)
          const clampedScale = Math.max(0.1, Math.min(10.0, asset.scale + delta));
          newAssets.set(id, { ...asset, scale: clampedScale });
          return { assets: newAssets };
        }),

        deleteSelected: () => set(state => {
          if (!state.selectedObjectId) return {};

          // Check if it's an asset
          if (state.assets.has(state.selectedObjectId)) {
            const newAssets = new Map(state.assets);
            newAssets.delete(state.selectedObjectId);
            return { assets: newAssets, selectedObjectId: null };
          }

          // Check if it's a tile
          for (const [key, tilesAt] of state.tiles) {
            const tileIndex = tilesAt.findIndex((t: Tile) => t.id === state.selectedObjectId);
            if (tileIndex !== -1) {
              const newTiles = new Map(state.tiles);
              const filtered = tilesAt.filter((t: Tile) => t.id !== state.selectedObjectId);
              if (filtered.length > 0) {
                const updated = filtered.map((t: Tile, i: number) => ({ ...t, stackLevel: i }));
                newTiles.set(key, updated);
              } else {
                newTiles.delete(key);
              }
              return { tiles: newTiles, selectedObjectId: null };
            }
          }

          return {};
        }),

        clearMap: () => set({ tiles: new Map(), assets: new Map(), selectedObjectId: null }),

        loadProject: (data) => {
          const tiles = new Map<string, Tile[]>();
          const assets = new Map<string, PlacedAsset>();
          if (data.tiles) {
            for (const [key, tileArray] of Object.entries(data.tiles)) {
              tiles.set(key, tileArray as Tile[]);
            }
          }
          if (data.assets) {
            for (const [key, asset] of Object.entries(data.assets)) {
              assets.set(key, asset as PlacedAsset);
            }
          }
          set({ ...data, tiles, assets, selectedObjectId: null });
        },
      }),
      {
        name: 'hexmap-storage',
        partialize: (state: unknown) => {
          const s = state as MapState;
          const tilesObj: Record<string, Tile[]> = {};
          for (const [key, tileArray] of s.tiles) {
            tilesObj[key] = tileArray;
          }
          const assetsObj: Record<string, PlacedAsset> = {};
          for (const [key, asset] of s.assets) {
            assetsObj[key] = asset;
          }
          // Note: importedAssets (ArrayBuffers) are NOT persisted since they can't be serialized to JSON
          return {
            tiles: tilesObj,
            assets: assetsObj,
            tableSize: s.tableSize,
            projectName: s.projectName,
          };
        },
        merge: (persistedState: unknown, currentState: MapState) => {
          const ps = persistedState as Partial<MapState>;
          if (!ps) return currentState;
          try {
            const tiles = new Map<string, Tile[]>();
            if (ps.tiles) {
              if (ps.tiles instanceof Map) {
                for (const [key, tileArray] of ps.tiles) {
                  tiles.set(key, Array.isArray(tileArray) ? tileArray : []);
                }
              } else if (typeof ps.tiles === 'object') {
                for (const [key, tileArray] of Object.entries(ps.tiles)) {
                  tiles.set(key, Array.isArray(tileArray) ? (tileArray as Tile[]) : []);
                }
              }
            }
            const assets = new Map<string, PlacedAsset>();
            if (ps.assets) {
              if (ps.assets instanceof Map) {
                for (const [key, asset] of ps.assets) {
                  assets.set(key, asset as PlacedAsset);
                }
              } else if (typeof ps.assets === 'object') {
                for (const [key, asset] of Object.entries(ps.assets)) {
                  assets.set(key, asset as PlacedAsset);
                }
              }
            }
            // importedAssets starts empty (ArrayBuffers are not persisted)
            return {
              ...currentState,
              ...ps,
              tiles,
              assets,
              importedAssets: new Map(),
            };
          } catch (error) {
            console.error('Error merging persisted state:', error);
            return {
              ...currentState,
              tiles: new Map(),
              assets: new Map(),
            };
          }
        },
      }
    ),
    {
      limit: 50,
      partialize: (state) => {
        const tilesObj: Record<string, Tile[]> = {};
        for (const [key, tileArray] of state.tiles) {
          tilesObj[key] = tileArray;
        }
        const assetsObj: Record<string, PlacedAsset> = {};
        for (const [key, asset] of state.assets) {
          assetsObj[key] = asset;
        }
        return { tiles: tilesObj, assets: assetsObj };
      }
    }
  )
);
