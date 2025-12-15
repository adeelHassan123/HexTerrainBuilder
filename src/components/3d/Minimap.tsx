import { useEffect, useState } from 'react';
import { useThree, useFrame } from '@react-three/fiber';
import { View } from '@react-three/drei';
import { useMapStore } from '../../store/useMapStore';
import { HexGrid } from './HexGrid';
import { PlacedAsset } from './PlacedAsset';
import * as THREE from 'three';
import { cn } from '@/lib/utils';

interface MinimapViewProps {
  containerRef: React.RefObject<HTMLElement>;
}

export function MinimapView({ containerRef }: MinimapViewProps) {
  const { tableSize, assets, getTotalHeightAt, selectedObjectId, setSelectedObject, isMobile } = useMapStore();
  const { camera } = useThree();

  // Defensive: fall back to defaults if tableSize is not set yet
  const width = tableSize?.widthCm ?? 90;
  const depth = tableSize?.heightCm ?? 60;

  // Update camera indicator position
  const cameraDirection = new THREE.Vector3();
  const [cameraAngle, setCameraAngle] = useState(0);

  useFrame(() => {
    // Ensure camera exists
    if (!camera) return;
    camera.getWorldDirection(cameraDirection);
    setCameraAngle(Math.atan2(cameraDirection.x, cameraDirection.z));
  });

  // Handle minimap click (move main camera)
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleClick = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      if (rect.width === 0 || rect.height === 0) return;
      const x = ((e.clientX - rect.left) / rect.width) * width - width / 2;
      const z = ((e.clientY - rect.top) / rect.height) * depth - depth / 2;

      // Move main camera to clicked position if camera is available
      if (camera) {
        camera.position.set(x, 15, z + 10);
        camera.lookAt(x, 0, z);
      }
    };

    container.addEventListener('click', handleClick);
    return () => container.removeEventListener('click', handleClick);
  }, [camera, width, depth, containerRef]);

  return (
    <View track={containerRef as React.MutableRefObject<HTMLElement>}>
      <color attach="background" args={['#1e293b']} />
      <ambientLight intensity={1} />
      <directionalLight position={[10, 20, 10]} intensity={1.5} />

      {/* Render the hex grid and assets */}
      <HexGrid />
      {Array.from(assets.values()).map((asset) => (
        <PlacedAsset
          key={asset.id}
          asset={asset}
          totalHeightAtHex={getTotalHeightAt(asset.q, asset.r)}
          isSelected={selectedObjectId === asset.id}
          onSelect={(id) => setSelectedObject(id)}
        />
      ))}

      {/* Camera indicator - blue semi-transparent cone showing direction */}
      <group position={[camera?.position.x ?? 0, 1, camera?.position.z ?? 0]} rotation={[0, cameraAngle, 0]}>
        <mesh>
          <coneGeometry args={[0.5, 1.5, 8]} />
          <meshBasicMaterial color="#3b82f6" transparent opacity={0.7} />
        </mesh>
      </group>

      {/* Orthographic camera from above */}
      <orthographicCamera position={[0, 40, 0]} zoom={isMobile ? 1.5 : 2} near={0.1} far={1000} rotation={[-Math.PI / 2, 0, 0]} />
    </View>
  );
}

// Container component that goes outside Canvas
interface MinimapContainerProps {
  containerRef: React.RefObject<HTMLDivElement | null>;
}

export function MinimapContainer({ containerRef }: MinimapContainerProps) {
  const { isMobile } = useMapStore();

  return (
    <div
      ref={containerRef as React.RefObject<HTMLDivElement>}
      className={cn(
        "fixed border-2 border-primary rounded-lg overflow-hidden bg-background shadow-xl z-40 cursor-crosshair pointer-events-auto transition-all duration-300",
        isMobile
          ? "top-4 right-4 w-32 h-32"
          : "bottom-6 right-6 w-48 h-48"
      )}
    >
      <div className="absolute bottom-1 left-1 right-1 text-[10px] md:text-xs text-muted-foreground text-center bg-background/50 py-0.5 md:py-1 rounded pointer-events-none z-10">
        {isMobile ? "Tap to move" : "Click to move camera"}
      </div>
    </div>
  );
}
