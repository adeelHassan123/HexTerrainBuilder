import * as THREE from 'three';

interface OrbitVisualizerProps {
  position?: [number, number, number];
  size?: number;
  color?: string;
}

/**
 * Renders a visible point at the center of rotation
 */
export function OrbitVisualizer({
  position = [0, 0, 0],
  size = 1.0,
  color = '#fbbf24',
}: OrbitVisualizerProps) {
  return (
    <mesh position={position}>
      <sphereGeometry args={[size, 32, 32]} />
      <meshBasicMaterial color={color} toneMapped={false} />
    </mesh>
  );
}
