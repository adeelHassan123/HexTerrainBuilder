import { useState } from 'react';
import { ThreeEvent } from '@react-three/fiber';
import { useMapStore } from '../../store/useMapStore';
import { HexTile } from './HexTile';
import { worldToAxial, getKey, axialToWorld } from '../../lib/hexMath';

export function HexGrid() {
  const { tiles, selectedTool, addTile, removeTile, addAsset, selectedTileHeight } = useMapStore();
  const [hoveredHex, setHoveredHex] = useState<{ q: number, r: number } | null>(null);

  const handlePointerMove = (e: ThreeEvent<PointerEvent>) => {
    try {
      e.stopPropagation();
      const axial = worldToAxial(e.point.x, e.point.z);

      if (!hoveredHex || hoveredHex.q !== axial.q || hoveredHex.r !== axial.r) {
        setHoveredHex(axial);
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
        if (e.button === 0) { // Left click
          addTile(hoveredHex.q, hoveredHex.r);
        } else if (e.button === 2) { // Right click
          removeTile(hoveredHex.q, hoveredHex.r);
        }
      } else if (selectedTool === 'delete') {
        removeTile(hoveredHex.q, hoveredHex.r);
      } else if (selectedTool === 'asset') {
        // Check if there is a tile here to place asset on
        const key = getKey(hoveredHex.q, hoveredHex.r);
        if (tiles.has(key)) {
          addAsset(hoveredHex.q, hoveredHex.r);
        }
      }
    } catch (error) {
      console.error('Error in handleClick:', error);
    }
  };

  const tilesArray = Array.from(tiles.values()).filter(tile => 
    tile && typeof tile.q === 'number' && typeof tile.r === 'number' && typeof tile.height === 'number'
  );

  return (
    <group
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerLeave}
      onClick={handleClick}
      onContextMenu={(e) => { e.nativeEvent.preventDefault(); handleClick(e as any); }}
    >
      {/* Render placed tiles */}
      {tilesArray.map((tile) => (
        <HexTile key={tile.id} q={tile.q} r={tile.r} height={tile.height} />
      ))}

      {/* Render hover preview */}
      {hoveredHex && selectedTool === 'tile' && (
        <group position={axialToWorld(hoveredHex.q, hoveredHex.r, 0)}>
          <mesh position={[0, selectedTileHeight * 0.1 / 2, 0]}>
            <cylinderGeometry args={[1, 1, selectedTileHeight * 0.1, 6]} />
            <meshStandardMaterial color="#4ade80" transparent opacity={0.5} />
          </mesh>
        </group>
      )}

      {/* Invisible plane for raycasting if needed, but tiles/grid helper might be enough. 
          Actually, we need a plane to catch events where there are no tiles. */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.01, 0]} visible={false}>
        <planeGeometry args={[100, 100]} />
        <meshBasicMaterial />
      </mesh>
    </group>
  );
}
