import * as THREE from 'three';
import { useMapStore } from '@/store/useMapStore';

export function TableBoundary() {
  const { tableSize } = useMapStore();
  const thickness = 0.5;
  const height = 1.0;

  // Use real-world dimensions in cm, with fallback to prevent NaN
  const realWidth = tableSize?.widthCm && !isNaN(tableSize.widthCm) ? tableSize.widthCm : 90;
  const realDepth = tableSize?.heightCm && !isNaN(tableSize.heightCm) ? tableSize.heightCm : 60;

  return (
    <group position={[0, 0, 0]}>
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
