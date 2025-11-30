import { useState, useRef } from 'react';
import { ThreeEvent } from '@react-three/fiber';
import * as THREE from 'three';
import { useMapStore } from '../../store/useMapStore';
import { HexTile } from './HexTile';
import { GridOverlay } from './GridOverlay';
import { worldToAxial, getKey, axialToWorld, isHexInBounds, HEX_SIZE } from '../../lib/hexMath';

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
    tableSize,
  } = useMapStore();

  const [hoveredHex, setHoveredHex] = useState<{ q: number; r: number } | null>(null);
  const [isValidPlacement, setIsValidPlacement] = useState(true);
  
  // Track touch interactions to distinguish tap vs drag
  const touchStateRef = useRef<{
    startTime: number;
    startPosition: { x: number; y: number } | null;
    hasMoved: boolean;
    startHex: { q: number; r: number } | null;
  }>({
    startTime: 0,
    startPosition: null,
    hasMoved: false,
    startHex: null,
  });
  
  // Thresholds for touch detection
  const TAP_MAX_DURATION = 300; // ms - max time for a tap
  const TAP_MAX_DISTANCE = 10; // pixels - max movement for a tap

  const checkBounds = (q: number, r: number) => {
    const width = tableSize?.widthCm && !isNaN(tableSize.widthCm) ? tableSize.widthCm : 90;
    const height = tableSize?.heightCm && !isNaN(tableSize.heightCm) ? tableSize.heightCm : 60;
    return isHexInBounds(q, r, width, height);
  };

  const handlePointerMove = (e: ThreeEvent<PointerEvent>) => {
    try {
      const axial = worldToAxial(e.point.x, e.point.z);

      const inBounds = checkBounds(axial.q, axial.r);

      if (inBounds) {
        if (!hoveredHex || hoveredHex.q !== axial.q || hoveredHex.r !== axial.r) {
          setHoveredHex(axial);
          setIsValidPlacement(true);
        }
      } else {
        setHoveredHex(axial);
        setIsValidPlacement(false);
      }
      
      // Track movement for touch gestures
      if (e.pointerType === 'touch' && touchStateRef.current.startPosition) {
        const dx = e.nativeEvent.clientX - touchStateRef.current.startPosition.x;
        const dy = e.nativeEvent.clientY - touchStateRef.current.startPosition.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance > TAP_MAX_DISTANCE) {
          touchStateRef.current.hasMoved = true;
          // If movement detected, re-enable OrbitControls for rotation/pan
          const setControlsEnabled = (window as any).__hexGridControlsEnabled;
          if (setControlsEnabled) {
            setControlsEnabled(true);
          }
        }
      }
    } catch (error) {
      console.error('Error in handlePointerMove:', error);
    }
  };

  const handlePointerLeave = () => {
    setHoveredHex(null);
    setIsValidPlacement(true);
    
    // Re-enable OrbitControls if touch was interrupted
    const setControlsEnabled = (window as any).__hexGridControlsEnabled;
    if (setControlsEnabled && touchStateRef.current.startHex) {
      setControlsEnabled(true);
      touchStateRef.current = {
        startTime: 0,
        startPosition: null,
        hasMoved: false,
        startHex: null,
      };
    }
  };

  const handleClick = (e: ThreeEvent<PointerEvent>) => {
    try {
      // Only handle mouse clicks, not touch (touch is handled in pointerUp)
      if (e.pointerType === 'touch' || e.pointerType === 'pen') {
        return;
      }
      
      e.stopPropagation();
      if (!hoveredHex || !isValidPlacement) return;

      if (selectedTool === 'tile') {
        addTile(hoveredHex.q, hoveredHex.r);
      } else if (selectedTool === 'asset') {
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

  // Handle pointer down - track touch start
  const handlePointerDown = (e: ThreeEvent<PointerEvent>) => {
    try {
      // Only track touch events for mobile
      if (e.pointerType === 'touch' || e.pointerType === 'pen') {
        // Temporarily disable OrbitControls to prevent rotation on tap
        const setControlsEnabled = (window as any).__hexGridControlsEnabled;
        if (setControlsEnabled) {
          setControlsEnabled(false);
        }
        
        touchStateRef.current = {
          startTime: Date.now(),
          startPosition: {
            x: e.nativeEvent.clientX,
            y: e.nativeEvent.clientY,
          },
          hasMoved: false,
          startHex: worldToAxial(e.point.x, e.point.z),
        };
      }
    } catch (error) {
      console.error('Error in handlePointerDown:', error);
    }
  };

  // Handle pointer up - place tile only if it was a tap (not a drag)
  const handlePointerUp = (e: ThreeEvent<PointerEvent>) => {
    try {
      // Only handle touch events for tile placement
      if (e.pointerType !== 'touch' && e.pointerType !== 'pen') {
        return;
      }

      const touchState = touchStateRef.current;
      if (!touchState.startHex) {
        // Re-enable controls if no touch state
        const setControlsEnabled = (window as any).__hexGridControlsEnabled;
        if (setControlsEnabled) {
          setControlsEnabled(true);
        }
        return;
      }

      const duration = Date.now() - touchState.startTime;
      const wasTap = !touchState.hasMoved && duration < TAP_MAX_DURATION;
      const inBounds = checkBounds(touchState.startHex.q, touchState.startHex.r);

      // Only place tile if it was a quick tap (no drag) and in bounds
      if (wasTap && inBounds && isValidPlacement) {
        // Keep controls disabled during tap to prevent rotation
        if (selectedTool === 'tile') {
          addTile(touchState.startHex.q, touchState.startHex.r);
        } else if (selectedTool === 'asset') {
          addAsset(touchState.startHex.q, touchState.startHex.r);
        } else {
          // Select mode
          const key = getKey(touchState.startHex.q, touchState.startHex.r);
          const tilesAt = tiles.get(key) || [];
          if (tilesAt.length > 0) {
            const topTile = tilesAt[tilesAt.length - 1];
            setSelectedObject(topTile.id);
          } else {
            setSelectedObject(null);
          }
        }
      }

      // Re-enable OrbitControls after handling the touch
      const setControlsEnabled = (window as any).__hexGridControlsEnabled;
      if (setControlsEnabled) {
        setControlsEnabled(true);
      }

      // Reset touch state
      touchStateRef.current = {
        startTime: 0,
        startPosition: null,
        hasMoved: false,
        startHex: null,
      };
    } catch (error) {
      console.error('Error in handlePointerUp:', error);
      // Re-enable controls on error
      const setControlsEnabled = (window as any).__hexGridControlsEnabled;
      if (setControlsEnabled) {
        setControlsEnabled(true);
      }
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
      onPointerDown={handlePointerDown}
      onPointerUp={handlePointerUp}
      onClick={handleClick}
      onContextMenu={(e) => {
        e.nativeEvent.preventDefault();
      }}
    >
      {/* Render hexagonal grid overlay */}
      <GridOverlay />

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

      {/* Render hover preview with visual feedback */}
      {hoveredHex && (selectedTool === 'tile' || selectedTool === 'asset') && (
        <group position={axialToWorld(hoveredHex.q, hoveredHex.r, getTotalHeightAt(hoveredHex.q, hoveredHex.r))}>
          {selectedTool === 'tile' && (
            <>
              <mesh position={[0, selectedTileHeight * 0.5 / 2, 0]}>
                <cylinderGeometry args={[HEX_SIZE, HEX_SIZE, selectedTileHeight * 0.5, 6]} />
                <meshStandardMaterial
                  color={isValidPlacement ? "#10b981" : "#ef4444"} // Green for valid, red for invalid
                  transparent
                  opacity={0.5}
                  emissive={isValidPlacement ? "#10b981" : "#ef4444"}
                  emissiveIntensity={0.3}
                />
              </mesh>
              {/* Enhanced outline */}
              <lineSegments>
                <edgesGeometry args={[new THREE.CylinderGeometry(HEX_SIZE, HEX_SIZE, selectedTileHeight * 0.5, 6)]} />
                <lineBasicMaterial color={isValidPlacement ? "#059669" : "#dc2626"} linewidth={3} />
              </lineSegments>
            </>
          )}
          {selectedTool === 'asset' && (
            // Enhanced asset placement marker
            <>
              <mesh position={[0, 0.1, 0]}>
                <ringGeometry args={[0.5, 0.8, 32]} />
                <meshBasicMaterial
                  color={isValidPlacement ? "#10b981" : "#ef4444"}
                  transparent
                  opacity={0.7}
                  side={THREE.DoubleSide}
                />
              </mesh>
              {/* Center dot */}
              <mesh position={[0, 0.11, 0]}>
                <circleGeometry args={[0.2, 16]} />
                <meshBasicMaterial
                  color={isValidPlacement ? "#059669" : "#dc2626"}
                  transparent
                  opacity={0.8}
                  side={THREE.DoubleSide}
                />
              </mesh>
            </>
          )}
        </group>
      )}

      {/* Ground plane for raycasting */}
      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, -0.01, 0]}
        receiveShadow
      >
        <planeGeometry args={[
          (tableSize?.widthCm && !isNaN(tableSize.widthCm) ? tableSize.widthCm : 90) * 2,
          (tableSize?.heightCm && !isNaN(tableSize.heightCm) ? tableSize.heightCm : 60) * 2
        ]} />
        <meshStandardMaterial
          color="#e5e7eb"
          transparent
          opacity={0.2}
          roughness={0.8}
        />
      </mesh>
    </group>
  );
}
