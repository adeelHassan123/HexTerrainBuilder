import { useRef, useMemo, useEffect } from 'react';
import * as THREE from 'three';
import { useMapStore } from '../../store/useMapStore';
import { axialToWorld, HEX_SIZE } from '../../lib/hexMath';
import { getCachedMaterial } from './Materials';
import type { Tile } from '../../types';
import { WaterMesh } from './WaterHex';

/**
 * InstancedHexTiles - High-performance hex tile rendering using InstancedMesh
 * Renders thousands of tiles efficiently by using a single draw call per height level
 */
export function InstancedHexTiles() {
    const { tiles, selectedObjectId } = useMapStore();

    // Refs for instanced meshes (one per tile height + type)
    // Key is "ground-1", "mud-5", etc.
    const instancedMeshRefs = useRef<{
        [key: string]: THREE.InstancedMesh;
    }>({});

    // Geometry is shared across all instances
    const hexGeometry = useMemo(() => {
        return new THREE.CylinderGeometry(HEX_SIZE, HEX_SIZE, 1, 6);
    }, []);

    // Organize tiles by height for instancing
    // Organize tiles by height and type for instancing
    const { tilesByHeight, waterTiles, mudTilesByHeight } = useMemo(() => {
        // Standard Ground
        const organized: { [height: number]: Array<{ tile: Tile; totalHeightBelow: number }> } = {
            1: [],
            2: [],
            5: [],
        };
        // Mud
        const mud: { [height: number]: Array<{ tile: Tile; totalHeightBelow: number }> } = {
            1: [],
            2: [],
            5: [],
        };
        const water: Array<{ tile: Tile; totalHeightBelow: number }> = [];

        for (const [, tilesAt] of tiles) {
            if (!Array.isArray(tilesAt)) continue;
            let totalHeightBelow = 0;
            for (const tile of tilesAt as Tile[]) {
                if (tile.type === 'water') {
                    water.push({ tile, totalHeightBelow });
                    // Handle mud separately
                } else if (tile.type === 'mud') {
                    mud[tile.height].push({ tile, totalHeightBelow });
                } else {
                    organized[tile.height].push({ tile, totalHeightBelow });
                }
                totalHeightBelow += tile.height;
            }
        }

        return { tilesByHeight: organized, waterTiles: water, mudTilesByHeight: mud };
    }, [tiles]);

    // Update instance matrices for all groups (Ground + Mud)
    useEffect(() => {
        // Helper to update a set of meshes
        const updateMeshes = (sourceData: any, prefix: string) => {
            Object.entries(sourceData).forEach(([heightStr, tileData]: [string, any]) => {
                const height = Number(heightStr);
                const count = tileData.length;
                // Use a key prefix to distinguish ground vs mud refs
                const mesh = instancedMeshRefs.current[`${prefix}-${height}`];

                if (!mesh) return;

                if (mesh.count !== count) mesh.count = count;

                const matrix = new THREE.Matrix4();
                const color = new THREE.Color();

                tileData.forEach(({ tile, totalHeightBelow }: any, index: number) => {
                    const realHeight = Math.max(0.1, tile.height * 0.5);
                    const yPos = totalHeightBelow * 0.5 + realHeight / 2;
                    const [x, , z] = axialToWorld(tile.q, tile.r, 0);

                    matrix.makeScale(1, realHeight, 1);
                    matrix.setPosition(x, yPos, z);
                    mesh.setMatrixAt(index, matrix);

                    if (selectedObjectId === tile.id) {
                        color.setHex(0xfbbf24);
                    } else {
                        color.setHex(0xffffff);
                    }
                    mesh.setColorAt(index, color);
                });

                mesh.instanceMatrix.needsUpdate = true;
                if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
            });
        };

        updateMeshes(tilesByHeight, 'ground');
        updateMeshes(mudTilesByHeight, 'mud');

    }, [tilesByHeight, mudTilesByHeight, selectedObjectId]);

    return (
        <group name="tiles">
            {/* Ground Tiles (Instanced) */}
            {[1, 2, 5].map((height) => {
                const count = tilesByHeight[height]?.length || 0;
                if (count === 0) return null;
                return (
                    <instancedMesh
                        key={`ground-${height}`}
                        ref={(ref) => { if (ref) instancedMeshRefs.current[`ground-${height}`] = ref; }}
                        args={[hexGeometry, getCachedMaterial(0, height, 'ground'), count]}
                        castShadow receiveShadow
                    >
                        <primitive object={hexGeometry} attach="geometry" />
                        <primitive object={getCachedMaterial(0, height, 'ground')} attach="material" />
                    </instancedMesh>
                );
            })}

            {/* Mud Tiles (Instanced) */}
            {[1, 2, 5].map((height) => {
                const count = mudTilesByHeight[height]?.length || 0;
                if (count === 0) return null;
                return (
                    <instancedMesh
                        key={`mud-${height}`}
                        ref={(ref) => { if (ref) instancedMeshRefs.current[`mud-${height}`] = ref; }}
                        args={[hexGeometry, getCachedMaterial(0, height, 'mud'), count]}
                        castShadow receiveShadow
                    >
                        <primitive object={hexGeometry} attach="geometry" />
                        <primitive object={getCachedMaterial(0, height, 'mud')} attach="material" />
                    </instancedMesh>
                );
            })}

            {/* Water Tiles (Individual) */}
            {waterTiles.map(({ tile, totalHeightBelow }) => {
                const realHeight = Math.max(0.1, tile.height * 0.5);
                const yPos = totalHeightBelow * 0.5 + realHeight / 2;
                const [x, , z] = axialToWorld(tile.q, tile.r, 0);

                return (
                    <group position={[x, yPos, z]} key={tile.id}>
                        <WaterMesh realHeight={realHeight} isSelected={selectedObjectId === tile.id} />
                    </group>
                );
            })}
        </group>
    );
}
