import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { temporal } from 'zundo';
import { getKey } from '../lib/hexMath';

export type Tile = { q: number; r: number; height: number; id: string };
export type PlacedAsset = { id: string; q: number; r: number; type: string; rotationY: number };

interface MapState {
  tiles: Map<string, Tile>;
  assets: Map<string, PlacedAsset>;
  selectedTool: 'tile' | 'asset' | 'select' | 'delete';
  selectedTileHeight: 1 | 2 | 5;
  selectedAssetType: string;
  tableSize: { w: number; h: number };
  projectName: string;

  // Actions
  setTool: (tool: MapState['selectedTool']) => void;
  setTileHeight: (h: 1 | 2 | 5) => void;
  setAssetType: (type: string) => void;
  addTile: (q: number, r: number) => void;
  removeTile: (q: number, r: number) => void;
  addAsset: (q: number, r: number) => void;
  removeAsset: (id: string) => void;
  clearMap: () => void;
  loadProject: (data: any) => void;
}

export const useMapStore = create<MapState>()(
  temporal(
    persist(
      (set) => ({
        tiles: new Map(),
        assets: new Map(),
        selectedTool: 'tile',
        selectedTileHeight: 1,
        selectedAssetType: 'tree-01',
        tableSize: { w: 20, h: 16 },
        projectName: 'Untitled Map',

        setTool: (tool) => set({ selectedTool: tool }),
        setTileHeight: (h) => set({ selectedTileHeight: h }),
        setAssetType: (type) => set({ selectedAssetType: type }),

        addTile: (q, r) => set(state => {
          const key = getKey(q, r);
          const existing = state.tiles.get(key);
          const newHeight = existing ? existing.height + state.selectedTileHeight : state.selectedTileHeight;
          const newTiles = new Map(state.tiles);
          newTiles.set(key, { q, r, height: newHeight, id: crypto.randomUUID() });
          return { tiles: newTiles };
        }),

        removeTile: (q, r) => set(state => {
          const key = getKey(q, r);
          const newTiles = new Map(state.tiles);
          newTiles.delete(key);
          // Also remove assets on this hex
          const newAssets = new Map(state.assets);
          for (const [id, asset] of newAssets) {
            if (asset.q === q && asset.r === r) newAssets.delete(id);
          }
          return { tiles: newTiles, assets: newAssets };
        }),

        addAsset: (q, r) => set(state => {
          const newAssets = new Map(state.assets);
          newAssets.set(crypto.randomUUID(), {
            id: crypto.randomUUID(),
            q, r,
            type: state.selectedAssetType,
            rotationY: 0
          });
          return { assets: newAssets };
        }),

        removeAsset: (id) => set(state => {
          const newAssets = new Map(state.assets);
          newAssets.delete(id);
          return { assets: newAssets };
        }),

        clearMap: () => set({ tiles: new Map(), assets: new Map() }),

        loadProject: (data) => {
          // Convert arrays back to Maps if necessary
          const tiles = new Map(data.tiles);
          const assets = new Map(data.assets);
          set({ ...data, tiles, assets });
        },
      }),
      {
        name: 'hexmap-storage',
        partialize: (state) => ({
          tiles: Object.fromEntries(state.tiles),
          assets: Object.fromEntries(state.assets),
          tableSize: state.tableSize,
          projectName: state.projectName
        }),
        merge: (persistedState: any, currentState) => {
          if (!persistedState) return currentState;
          try {
            const tiles = persistedState.tiles ? new Map(Object.entries(persistedState.tiles)) : new Map();
            const assets = persistedState.assets ? new Map(Object.entries(persistedState.assets)) : new Map();
            return {
              ...currentState,
              ...persistedState,
              tiles,
              assets,
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
      limit: 20,
      partialize: (state) => {
        const { tiles, assets } = state;
        return { tiles, assets };
      }
    }
  )
);
