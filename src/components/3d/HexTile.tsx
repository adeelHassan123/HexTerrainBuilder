import * as THREE from 'three';
import { axialToWorld } from '../../lib/hexMath';

interface HexTileProps {
  q: number;
  r: number;
  height: number;
}

export function HexTile({ q, r, height }: HexTileProps) {
  try {
    const [x, , z] = axialToWorld(q, r, height);
    const realHeight = Math.max(0.1, height * 0.1); // Ensure positive height

    return (
      <mesh
        position={[x, realHeight / 2, z]}
        castShadow
        receiveShadow
      >
        <cylinderGeometry args={[1, 1, realHeight, 6]} />
        <meshStandardMaterial color="#4ade80" />
        <lineSegments>
          <edgesGeometry args={[new THREE.CylinderGeometry(1, 1, realHeight, 6)]} />
          <lineBasicMaterial color="#166534" />
        </lineSegments>
      </mesh>
    );
  } catch (error) {
    console.error('Error rendering HexTile:', error);
    return null;
  }
}
