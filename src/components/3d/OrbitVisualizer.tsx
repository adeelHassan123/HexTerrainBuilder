import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';

interface OrbitVisualizerProps {
  controlsRef?: React.RefObject<any>;
  size?: number;
  color?: string;
}

/**
 * Renders a visible point at the current OrbitControls target (center of rotation).
 * If `controlsRef` is not provided, falls back to world origin.
 */
export function OrbitVisualizer({
  controlsRef,
  size = 1.0,
  color = '#fbbf24',
}: OrbitVisualizerProps) {
  const meshRef = useRef<any>(null);

  useFrame(() => {
    const mesh = meshRef.current;
    if (!mesh) return;

    // If we have OrbitControls, follow its target; otherwise default to origin
    const target = controlsRef?.current?.target;
    if (target) {
      mesh.position.set(target.x ?? 0, target.y ?? 0, target.z ?? 0);
    } else {
      mesh.position.set(0, 0, 0);
    }
  });

  return (
    <mesh ref={meshRef}>
      <sphereGeometry args={[size, 32, 32]} />
      <meshBasicMaterial color={color} toneMapped={false} />
    </mesh>
  );
}
