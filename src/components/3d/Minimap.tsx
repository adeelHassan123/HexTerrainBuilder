import { useRef, useEffect, useState } from 'react';
import { useThree, useFrame } from '@react-three/fiber';
import { View } from '@react-three/drei';
import { useMapStore } from '../../store/useMapStore';
import { HexGrid } from './HexGrid';
import { PlacedAsset } from './PlacedAsset';
import * as THREE from 'three';

// This component must be inside Canvas
interface MinimapViewProps {
  containerRef: React.RefObject<HTMLDivElement | null>;
}

export function MinimapView({ containerRef }: MinimapViewProps) {
  const { tableSize, assets, getTotalHeightAt, selectedTileId, setSelectedTile } = useMapStore();
  const { camera } = useThree();

  const width = tableSize.w * Math.sqrt(3);
  const depth = tableSize.h * 1.5;

  // Update camera indicator position
  const cameraDirection = new THREE.Vector3();
  const [cameraAngle, setCameraAngle] = useState(0);
  
  useFrame(() => {
    camera.getWorldDirection(cameraDirection);
    setCameraAngle(Math.atan2(cameraDirection.x, cameraDirection.z));
  });

  // Handle minimap click
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleClick = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * width - width / 2;
      const z = ((e.clientY - rect.top) / rect.height) * depth - depth / 2;

      // Move main camera to clicked position
      camera.position.set(x, 15, z + 10);
      camera.lookAt(x, 0, z);
    };

    container.addEventListener('click', handleClick);
    return () => container.removeEventListener('click', handleClick);
  }, [camera, width, depth, containerRef]);

  return (
    <View track={containerRef}>
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
          isSelected={selectedTileId === asset.id}
          onSelect={(id) => setSelectedTile(id)}
        />
      ))}
      
      {/* Camera indicator - blue semi-transparent cone showing direction */}
      <group position={[camera.position.x, 1, camera.position.z]} rotation={[0, cameraAngle, 0]}>
        <mesh>
          <coneGeometry args={[0.5, 1.5, 8]} />
          <meshBasicMaterial color="#3b82f6" transparent opacity={0.7} />
        </mesh>
      </group>

      {/* Orthographic camera from above */}
      <orthographicCamera
        position={[0, 40, 0]}
        zoom={2}
        near={0.1}
        far={1000}
        rotation={[-Math.PI / 2, 0, 0]}
      />
    </View>
  );
}

// Container component that goes outside Canvas
interface MinimapContainerProps {
  containerRef: React.RefObject<HTMLDivElement | null>;
}

export function MinimapContainer({ containerRef }: MinimapContainerProps) {
  return (
    <div
      ref={containerRef}
      className="fixed bottom-6 right-6 w-48 h-48 border-2 border-primary rounded-lg overflow-hidden bg-background shadow-xl z-40 cursor-crosshair pointer-events-auto"
    >
      <div className="absolute bottom-1 left-1 right-1 text-xs text-muted-foreground text-center bg-background/50 py-1 rounded pointer-events-none z-10">
        Click to move camera
      </div>
    </div>
  );
}
