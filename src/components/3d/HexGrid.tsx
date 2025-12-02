import { useState, useRef } from 'react';
import type { Tile } from '../../types';

type WindowWithHexGridControls = Window & {
  __hexGridControlsEnabled?: (enabled: boolean) => void;
};
import { ThreeEvent, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { useMapStore } from '../../store/useMapStore';
import { HexTile } from './HexTile';
import { GridOverlay } from './GridOverlay';
import { worldToAxial, axialToWorld, getKey, isHexInBounds, HEX_SIZE } from '../../lib/hexMath';
import { useFrame } from '@react-three/fiber';

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
    assets,
  } = useMapStore();

  const { camera, scene } = useThree();
  const raycasterRef = useRef(new THREE.Raycaster());
  const groundPlaneRef = useRef(new THREE.Plane(new THREE.Vector3(0, 1, 0), 0));
  const pointerRef = useRef(new THREE.Vector2());
  const lastHoverHex = useRef<{ q: number; r: number } | null>(null);
  const lastHoverTime = useRef(0);

  const [hoveredHex, setHoveredHex] = useState<{ q: number; r: number } | null>(null);
  const [isValidPlacement, setIsValidPlacement] = useState(true);
  const [hoverScale, setHoverScale] = useState(1);
  const previewPosRef = useRef(new THREE.Vector3(0, 0, 0));
  const targetPosRef = useRef(new THREE.Vector3(0, 0, 0));
  const previewGroupRef = useRef<THREE.Group | null>(null);

  // Track touch interactions to distinguish tap vs drag
  const touchStateRef = useRef<{
    startTime: number;
    startPosition: { x: number; y: number } | null;
    hasMoved: boolean;
    startHex: { q: number; r: number } | null;
    pointerType: 'mouse' | 'touch' | 'pen';
  }>({
    startTime: 0,
    startPosition: null,
    hasMoved: false,
    startHex: null,
    pointerType: 'mouse',
  });

  // Thresholds for touch detection
  const TAP_MAX_DURATION = 300; // ms - max time for a tap
  const TAP_MAX_DISTANCE = 10; // pixels - max movement for a tap

  const checkBounds = (q: number, r: number) => {
    const width = tableSize?.widthCm && !isNaN(tableSize.widthCm) ? tableSize.widthCm : 90;
    const height = tableSize?.heightCm && !isNaN(tableSize.heightCm) ? tableSize.heightCm : 60;
    return isHexInBounds(q, r, width, height);
  };

  /**
   * Get world position using raycasting from mouse coordinates.
   * This properly accounts for the camera projection and 3D view.
   * The ray is cast from the camera through the mouse position and intersected with the ground plane (y=0).
   */
  const getRaycastWorldPosition = (event: PointerEvent): THREE.Vector3 | null => {
    const canvas = document.querySelector('canvas');
    if (!canvas) return null;

    const rect = canvas.getBoundingClientRect();
    const x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    const y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
    
    pointerRef.current.set(x, y);
    raycasterRef.current.setFromCamera(pointerRef.current, camera);
    
    // First, try to intersect with existing tiles
    const intersects = raycasterRef.current.intersectObjects(
      scene.getObjectByName('tiles')?.children || []
    );
    
    if (intersects.length > 0) {
      return intersects[0].point;
    }
    
    // If no tile intersection, use ground plane
    const planeIntersection = new THREE.Vector3();
    raycasterRef.current.ray.intersectPlane(groundPlaneRef.current, planeIntersection);
    return planeIntersection;
  };

  // Smooth preview movement with improved performance
  useFrame((_, delta) => {
    if (!previewGroupRef.current) return;
    
    // Calculate dynamic lerp factor based on distance
    const distance = previewPosRef.current.distanceTo(targetPosRef.current);
    const lerpFactor = Math.min(1, (distance > 0.5 ? 20 : 10) * delta);
    
    // Smooth position with easing
    previewPosRef.current.lerp(targetPosRef.current, lerpFactor);
    
    // Update scale with easing
    const targetScale = hoverScale;
    const currentScale = previewGroupRef.current.scale.x;
    const scale = THREE.MathUtils.damp(currentScale, targetScale, 10, delta);
    
    // Apply transforms
    previewGroupRef.current.position.copy(previewPosRef.current);
    previewGroupRef.current.scale.setScalar(scale);
  });

  const handlePointerMove = (e: ThreeEvent<PointerEvent>) => {
    try {
      const now = Date.now();
      if (now - lastHoverTime.current < 16) { // ~60fps throttle
        return;
      }
      lastHoverTime.current = now;

      const worldPos = getRaycastWorldPosition(e.nativeEvent);
      if (!worldPos) {
        setHoveredHex(null);
        setIsValidPlacement(false);
        setHoverScale(1);
        return;
      }

      // Convert world position to axial coordinates with proper rounding
      const axial = worldToAxial(worldPos.x, worldPos.z);
      const inBounds = checkBounds(axial.q, axial.r);
      
      // Skip if hex hasn't changed and it's been less than 100ms
      if (lastHoverHex.current?.q === axial.q && lastHoverHex.current?.r === axial.r) {
        return;
      }
      lastHoverHex.current = axial;

      if (inBounds) {
        setHoveredHex(axial);
        setIsValidPlacement(true);
        
        // Calculate exact hex center position
        const [hexX, , hexZ] = axialToWorld(axial.q, axial.r, 0);
        const totalHeight = getTotalHeightAt(axial.q, axial.r);
        const realHeight = Math.max(0.1, selectedTileHeight * 0.5);
        
        // Smoothly update target position
        targetPosRef.current.set(
          hexX,
          totalHeight * 0.5 + realHeight / 2,
          hexZ
        );
        
        setHoverScale(1.08);
      } else {
        setHoveredHex(null);
        setIsValidPlacement(false);
        setHoverScale(1);
      }

      // Track movement for touch gestures AND mouse drags
      if (touchStateRef.current.startPosition) {
        const dx = e.nativeEvent.clientX - touchStateRef.current.startPosition.x;
        const dy = e.nativeEvent.clientY - touchStateRef.current.startPosition.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance > TAP_MAX_DISTANCE) {
          touchStateRef.current.hasMoved = true;
        }
      }
    } catch (error) {
      console.error('Error in handlePointerMove:', error);
    }
  };

  const handlePointerLeave = () => {
    setHoveredHex(null);
    setIsValidPlacement(true);
    setHoverScale(1);

    // Re-enable OrbitControls if touch was interrupted
    const setControlsEnabled = (window as WindowWithHexGridControls).__hexGridControlsEnabled;
    if (setControlsEnabled && touchStateRef.current.startHex) {
      setControlsEnabled(true);
      touchStateRef.current = {
        startTime: 0,
        startPosition: null,
        hasMoved: false,
        startHex: null,
        pointerType: 'mouse',
      };
    }
  };

  const handleClick = (e: ThreeEvent<PointerEvent>) => {
    // We handle clicks in handlePointerUp to unify mouse/touch logic and prevent drag-clicks
    e.stopPropagation();
  };

  // Handle pointer down - track start
  const handlePointerDown = (e: ThreeEvent<PointerEvent>) => {
    try {
      // Use raycasting to get accurate hex position
      const worldPos = getRaycastWorldPosition(e.nativeEvent);
      const startHex = worldPos ? worldToAxial(worldPos.x, worldPos.z) : null;

      touchStateRef.current = {
        startTime: Date.now(),
        startPosition: {
          x: e.nativeEvent.clientX,
          y: e.nativeEvent.clientY,
        },
        hasMoved: false,
        startHex: startHex,
        pointerType: e.pointerType as 'mouse' | 'touch' | 'pen',
      };
    } catch (error) {
      console.error('Error in handlePointerDown:', error);
    }
  };

  // Handle pointer up - place tile only if it was a tap (not a drag)
  const handlePointerUp = () => {
    try {
      const touchState = touchStateRef.current;

      // Always re-enable controls on up
      const setControlsEnabled = (window as WindowWithHexGridControls).__hexGridControlsEnabled;
      if (setControlsEnabled) {
        setControlsEnabled(true);
      }

      if (!touchState.startHex) {
        return;
      }

      const duration = Date.now() - touchState.startTime;
      const wasTap = !touchState.hasMoved && duration < TAP_MAX_DURATION;
      
      // Use hoveredHex (current mouse position) if available, otherwise fall back to startHex
      const hexToPlace = hoveredHex || touchState.startHex;
      const inBounds = checkBounds(hexToPlace.q, hexToPlace.r);

      // Only place tile if it was a quick tap (no drag) and in bounds
      if (wasTap && inBounds && isValidPlacement) {
        if (selectedTool === 'tile') {
          addTile(hexToPlace.q, hexToPlace.r);
        } else if (selectedTool === 'asset') {
          addAsset(hexToPlace.q, hexToPlace.r);
        } else {
          // Select mode - prioritize assets over tiles
          if (!hexToPlace) return;
          const assetsAtHex = Array.from(assets.values()).filter(
            a => a.q === hexToPlace.q && a.r === hexToPlace.r
          );
          if (assetsAtHex.length > 0) {
            // Select the topmost asset (highest stackLevel)
            const topAsset = assetsAtHex.reduce((a, b) => 
              a.stackLevel > b.stackLevel ? a : b
            );
            setSelectedObject(topAsset.id);
          } else {
            // No asset, check for tiles
            const key = getKey(hexToPlace.q, hexToPlace.r);
            const tilesAt = tiles.get(key) || [];
            if (tilesAt.length > 0) {
              const topTile = tilesAt[tilesAt.length - 1];
              setSelectedObject(topTile.id);
            } else {
              setSelectedObject(null);
            }
          }
        }
      }

      // Reset touch state
      touchStateRef.current = {
        startTime: 0,
        startPosition: null,
        hasMoved: false,
        startHex: null,
        pointerType: 'mouse',
      };
    } catch (error) {
      console.error('Error in handlePointerUp:', error);
      // Re-enable controls on error
      const setControlsEnabled = (window as WindowWithHexGridControls).__hexGridControlsEnabled;
      if (setControlsEnabled) {
        setControlsEnabled(true);
      }
    }
  };

  // Collect all tiles with their positions
  const allTiles: Array<{ tile: Tile; totalHeightBelow: number }> = [];

  for (const [, tilesAt] of tiles) {
    // Ensure tilesAt is always an array
    if (!Array.isArray(tilesAt)) continue;
    let totalHeightBelow = 0;
    for (const tile of tilesAt as Tile[]) {
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
          onSelect={setSelectedObject}
        />
      ))}

      {/* Render hover preview with visual feedback */}
      {(selectedTool === 'tile' || selectedTool === 'asset') && (
        <group ref={previewGroupRef}>
          {/* Soft glow point light following preview */}
          {isValidPlacement && (
            <pointLight
              position={[0, 0.5, 0]}
              intensity={0.8}
              distance={3}
              color="#10b981"
              decay={2}
            />
          )}

          {selectedTool === 'tile' && isValidPlacement && (
            <>
              <mesh position={[0, 0, 0]}>
                <cylinderGeometry args={[HEX_SIZE, HEX_SIZE, selectedTileHeight * 0.5, 6]} />
                <meshStandardMaterial
                  color={"#10b981"}
                  transparent
                  opacity={0.6}
                  emissive={"#10b981"}
                  emissiveIntensity={0.5}
                  roughness={0.3}
                  metalness={0.1}
                />
              </mesh>
              <lineSegments>
                <edgesGeometry args={[new THREE.CylinderGeometry(HEX_SIZE, HEX_SIZE, selectedTileHeight * 0.5, 6)]} />
                <lineBasicMaterial color={"#059669"} linewidth={3} />
              </lineSegments>
            </>
          )}
          {selectedTool === 'asset' && isValidPlacement && (
            <>
              <mesh position={[0, 0.1, 0]}>
                <ringGeometry args={[0.5, 0.8, 32]} />
                <meshBasicMaterial
                  color={"#10b981"}
                  transparent
                  opacity={0.7}
                  side={THREE.DoubleSide}
                />
              </mesh>
              <mesh position={[0, 0.11, 0]}>
                <circleGeometry args={[0.2, 16]} />
                <meshBasicMaterial
                  color={"#059669"}
                  transparent
                  opacity={0.8}
                  side={THREE.DoubleSide}
                />
              </mesh>
            </>
          )}
        </group>
      )}

      {
        
      }
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
