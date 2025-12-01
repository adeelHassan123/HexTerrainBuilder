import * as THREE from 'three';
import { useRef, useMemo, useEffect } from 'react';
import { axialToWorld, HEX_SIZE } from '../../lib/hexMath';
import { getMaterialForTile, addColorVariation } from './Materials';
import type { Tile } from '../../types';

interface HexTileProps {
  tile: Tile;
  totalHeightBelow: number; // Total height of all tiles below this one
  isSelected: boolean;
  onSelect: (tileId: string) => void;
}

export function HexTile({ tile, totalHeightBelow, isSelected, onSelect }: HexTileProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  const edgesRef = useRef<THREE.LineSegments>(null);

  // Get material based on stack level (intelligent terrain progression)
  const material = useMemo(() => {
    const baseMaterial = getMaterialForTile(tile.stackLevel);
    // Add subtle variation to avoid repetition
    const seed = tile.q * 1000 + tile.r * 100 + tile.stackLevel;
    addColorVariation(baseMaterial, seed);
    return baseMaterial;
  }, [tile.stackLevel, tile.q, tile.r]);

  const realHeight = Math.max(0.1, tile.height * 0.5); // HEIGHT_UNIT = 0.5 for Three.js scaling (1cm = 0.5 units)
  const yPos = totalHeightBelow * 0.5 + realHeight / 2;
  const [x, , z] = axialToWorld(tile.q, tile.r, 0);

  // Optimize: Only update emissive when selection changes, not every frame
  useEffect(() => {
    if (meshRef.current) {
      const mat = meshRef.current.material as THREE.MeshStandardMaterial;
      if (isSelected) {
        mat.emissive = new THREE.Color('#fbbf24');
        mat.emissiveIntensity = 0.6;
      } else {
        mat.emissive = new THREE.Color('#000000');
        mat.emissiveIntensity = 0;
      }
    }
  }, [isSelected]);

  return (
    <group
      position={[x, yPos, z]}
      onClick={(e) => {
        e.stopPropagation();
        onSelect(tile.id);
      }}
    >
      {/* Contact Shadow for depth perception */}
      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, -realHeight / 2 - 0.01, 0]}
        receiveShadow
      >
        <circleGeometry args={[HEX_SIZE * 0.9, 32]} />
        <meshBasicMaterial
          color="#000000"
          transparent
          opacity={0.15}
        />
      </mesh>

      {/* Main hex tile */}
      <mesh
        ref={meshRef}
        castShadow
        receiveShadow
        userData={{ hexTile: { q: tile.q, r: tile.r } }}
      >
        {/* CRITICAL FIX: Use HEX_SIZE instead of hardcoded 1 */}
        <cylinderGeometry args={[HEX_SIZE, HEX_SIZE, realHeight, 6]} />
        <primitive object={material} attach="material" />
      </mesh>

      {/* Enhanced edge definition */}
      <lineSegments ref={edgesRef}>
        <edgesGeometry args={[new THREE.CylinderGeometry(HEX_SIZE, HEX_SIZE, realHeight, 6)]} />
        <lineBasicMaterial color="#1a1a1a" linewidth={2} opacity={0.8} transparent />
      </lineSegments>
    </group>
  );
}
