import * as THREE from 'three';
import { useMapStore } from '@/store/useMapStore';
import { HEX_SIZE } from '@/lib/hexMath';

export function TableBoundary() {
  const { tableSize } = useMapStore();
  const thickness = 0.5;
  const height = 1.0;

  // Calculate real world dimensions based on hex size
  // Width (x-axis) depends on hex width (sqrt(3) * size)
  // Height (z-axis) depends on hex height (3/2 * size)
  // But the tableSize is likely in "number of hexes".
  // Let's assume tableSize.w is number of columns, tableSize.h is number of rows.

  // Approximate width/depth for the boundary
  const realWidth = tableSize.w * HEX_SIZE * Math.sqrt(3);
  const realDepth = tableSize.h * HEX_SIZE * 1.5;

  const centerX = realWidth / 2 - (HEX_SIZE * Math.sqrt(3)) / 2; // Center offset
  const centerZ = realDepth / 2 - (HEX_SIZE * 1.5) / 2;

  return (
    <group position={[centerX, 0, centerZ]}>
      {/* Table top */}
      <mesh
        position={[0, -thickness / 2 - 0.1, 0]}
        rotation={[-Math.PI / 2, 0, 0]}
        receiveShadow
      >
        <planeGeometry args={[realWidth + 2, realDepth + 2]} />
        <meshStandardMaterial
          color="#8b5cf6"
          transparent
          opacity={0.1}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* Table edges */}
      <mesh position={[0, -height / 2, -realDepth / 2 - thickness / 2]}>
        <boxGeometry args={[realWidth + thickness * 2, height, thickness]} />
        <meshStandardMaterial color="#7c3aed" />
      </mesh>

      <mesh position={[0, -height / 2, realDepth / 2 + thickness / 2]}>
        <boxGeometry args={[realWidth + thickness * 2, height, thickness]} />
        <meshStandardMaterial color="#7c3aed" />
      </mesh>

      <mesh position={[-realWidth / 2 - thickness / 2, -height / 2, 0]}>
        <boxGeometry args={[thickness, height, realDepth]} />
        <meshStandardMaterial color="#7c3aed" />
      </mesh>

      <mesh position={[realWidth / 2 + thickness / 2, -height / 2, 0]}>
        <boxGeometry args={[thickness, height, realDepth]} />
        <meshStandardMaterial color="#7c3aed" />
      </mesh>
    </group>
  );
}
