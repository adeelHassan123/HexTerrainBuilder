import { useState } from 'react';
import { ThreeEvent } from '@react-three/fiber';
import * as THREE from 'three';
import { useMapStore } from '../../store/useMapStore';
import { HexTile } from './HexTile';
import { worldToAxial, getKey, axialToWorld } from '../../lib/hexMath';

const TABLE_WIDTH = 20;
const TABLE_HEIGHT = 16;

export function HexGrid() {
  const {
    tiles,
    selectedTool,
    addTile,
    addAsset,
    selectedTileHeight,
    getTotalHeightAt,
    selectedObjectId,
    setSelectedObject,
  } = useMapStore();

  const [hoveredHex, setHoveredHex] = useState<{ q: number; r: number } | null>(null);

  const isWithinBounds = (q: number, r: number) => {
    // Table bounds: roughly -10 to +10 in x, -8 to +8 in z
    const [x, , z] = axialToWorld(q, r, 0);
    return Math.abs(x) <= TABLE_WIDTH / 2 && Math.abs(z) <= TABLE_HEIGHT / 2;
  };

  const handlePointerMove = (e: ThreeEvent<PointerEvent>) => {
    try {
      e.stopPropagation();
      const axial = worldToAxial(e.point.x, e.point.z);

      if (isWithinBounds(axial.q, axial.r)) {
        if (!hoveredHex || hoveredHex.q !== axial.q || hoveredHex.r !== axial.r) {
          setHoveredHex(axial);
        }
      } else {
        setHoveredHex(null);
      }
    } catch (error) {
      console.error('Error in handlePointerMove:', error);
    }
  };

  const handlePointerLeave = () => {
    setHoveredHex(null);
  };

  const handleClick = (e: ThreeEvent<MouseEvent>) => {
    try {
      e.stopPropagation();
      if (!hoveredHex) return;

      if (selectedTool === 'tile') {
        if (e.button === 0) {
          // Left click - add tile
          addTile(hoveredHex.q, hoveredHex.r);
        }
      } else if (selectedTool === 'asset') {
        // Place asset on hex
        addAsset(hoveredHex.q, hoveredHex.r);
      } else {
        // Select Mode (default if not tile/asset)
        const key = getKey(hoveredHex.q, hoveredHex.r);
        const tilesAt = tiles.get(key) || [];
        if (tilesAt.length > 0) {
          const topTile = tilesAt[tilesAt.length - 1];
          setSelectedObject(topTile.id);
        } else {
          setSelectedObject(null);
        }
      }
    } catch (error) {
      console.error('Error in handleClick:', error);
    }
  };

  // Collect all tiles with their positions
  const allTiles: Array<{
    tile: any;
    totalHeightBelow: number;
  }> = [];

  for (const [, tilesAt] of tiles) {
    // Ensure tilesAt is always an array
    if (!Array.isArray(tilesAt)) continue;
    let totalHeightBelow = 0;
    for (const tile of tilesAt) {
      allTiles.push({ tile, totalHeightBelow });
      totalHeightBelow += tile.height;
    }
  }

  return (
    <group
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerLeave}
      onClick={handleClick}
      onContextMenu={(e) => {
        e.nativeEvent.preventDefault();
        // Right click could be used for something else, or just ignored
      }}
    >
      {/* Render all tiles */}
      {allTiles.map(({ tile, totalHeightBelow }) => (
        <HexTile
          key={tile.id}
          tile={tile}
          totalHeightBelow={totalHeightBelow}
          isSelected={selectedObjectId === tile.id}
          onSelect={(id) => setSelectedObject(id)}
        />
      ))}

      {/* Render hover preview */}
      {hoveredHex && (selectedTool === 'tile' || selectedTool === 'asset') && (
        <group position={axialToWorld(hoveredHex.q, hoveredHex.r, getTotalHeightAt(hoveredHex.q, hoveredHex.r))}>
          {selectedTool === 'tile' && (
            <mesh position={[0, selectedTileHeight * 0.5 / 2, 0]}>
              <cylinderGeometry args={[1, 1, selectedTileHeight * 0.5, 6]} />
              <meshStandardMaterial
                color="#ffffff"
                transparent
                opacity={0.5}
                emissive="#ffffff"
                emissiveIntensity={0.3}
              />
            </mesh>
          )}
          {selectedTool === 'asset' && (
            // Simple marker for asset placement
            <mesh position={[0, 0.1, 0]}>
              <ringGeometry args={[0.5, 0.8, 32]} />
              <meshBasicMaterial color="#fbbf24" transparent opacity={0.6} side={THREE.DoubleSide} />
            </mesh>
          )}
          {/* Black outline for preview */}
          {selectedTool === 'tile' && (
            <lineSegments>
              <edgesGeometry args={[new THREE.CylinderGeometry(1, 1, selectedTileHeight * 0.5, 6)]} />
              <lineBasicMaterial color="#000000" linewidth={2} />
            </lineSegments>
          )}
        </group>
      )}

      {/* Ground plane for raycasting and visual reference */}
      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, -0.01, 0]}
        receiveShadow
      >
        <planeGeometry args={[TABLE_WIDTH * 3, TABLE_HEIGHT * 3]} />
        <meshStandardMaterial
          color="#e5e7eb"
          transparent
          opacity={0.3}
          roughness={0.8}
        />
      </mesh>
    </group>
  );
}
