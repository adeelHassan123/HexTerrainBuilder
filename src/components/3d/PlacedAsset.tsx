import { useRef, useEffect, Suspense } from 'react';
import { useLoader } from '@react-three/fiber';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import * as THREE from 'three';
import { axialToWorld } from '../../lib/hexMath';
import { useMapStore } from '../../store/useMapStore';
import { PlacedAsset as PlacedAssetType, ASSET_CATALOG } from '../../types';
import { ErrorBoundary } from './ErrorBoundary';

interface PlacedAssetProps {
  asset: PlacedAssetType;
  totalHeightAtHex: number;
  isSelected: boolean;
  onSelect: (assetId: string) => void;
}

// Internal component that handles model loading
function ModelContent({ modelPath, asset, totalHeightAtHex, isSelected, onSelect }: {
  modelPath: string;
  asset: PlacedAssetType;
  totalHeightAtHex: number;
  isSelected: boolean;
  onSelect: (assetId: string) => void;
}) {
  const groupRef = useRef<THREE.Group>(null);
  const { rotateAsset, removeAsset } = useMapStore();
  
  // useLoader must be called unconditionally - Suspense will handle loading state
  const gltf = useLoader(GLTFLoader, modelPath);

  const yPos = totalHeightAtHex * 0.5 + 0.5;
  const [x, , z] = axialToWorld(asset.q, asset.r, 0);

  // Handle keyboard events for rotation and deletion
  useEffect(() => {
    if (!isSelected) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Delete' || e.key === 'Backspace') {
        removeAsset(asset.id);
      } else if (e.key === '+' || e.key === '=') {
        rotateAsset(asset.id, Math.PI / 6);
      } else if (e.key === '-') {
        rotateAsset(asset.id, -Math.PI / 6);
      }
    };

    const handleWheel = (e: WheelEvent) => {
      if (isSelected && e.deltaY !== 0) {
        e.preventDefault();
        const delta = e.deltaY > 0 ? -Math.PI / 12 : Math.PI / 12;
        rotateAsset(asset.id, delta);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('wheel', handleWheel, { passive: false });

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('wheel', handleWheel);
    };
  }, [isSelected, asset.id, rotateAsset, removeAsset]);

  // Optimize: Only update emissive when selection changes, not every frame
  useEffect(() => {
    if (groupRef.current && gltf && gltf.scene) {
      const scene = gltf.scene;
      scene.traverse((node: THREE.Object3D) => {
        if (node instanceof THREE.Mesh) {
          const material = node.material as THREE.MeshStandardMaterial;
          if (material.emissive) {
            if (isSelected) {
              material.emissive.setHex(0xfbbf24);
              material.emissiveIntensity = 0.5;
            } else {
              material.emissive.setHex(0x000000);
              material.emissiveIntensity = 0;
            }
          }
        }
      });
    }
  }, [isSelected, gltf]);

  if (!gltf || !gltf.scene) {
    // Placeholder: simple cone for missing models
    return (
      <group
        ref={groupRef}
        position={[x, yPos, z]}
        rotation={[0, asset.rotationY, 0]}
        onClick={(e) => {
          e.stopPropagation();
          onSelect(asset.id);
        }}
      >
        <mesh castShadow receiveShadow>
          <coneGeometry args={[0.5, 1.5, 8]} />
          <meshStandardMaterial color={isSelected ? '#fbbf24' : '#888888'} />
        </mesh>
      </group>
    );
  }

  return (
    <group
      ref={groupRef}
      position={[x, yPos, z]}
      rotation={[0, asset.rotationY, 0]}
      onClick={(e) => {
        e.stopPropagation();
        onSelect(asset.id);
      }}
    >
      <primitive object={gltf.scene.clone()} />
      {/* Selection Ring */}
      {isSelected && (
        <mesh position={[0, 0.1, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[0.6, 0.7, 32]} />
          <meshBasicMaterial color="#fbbf24" toneMapped={false} />
        </mesh>
      )}
    </group>
  );
}

// Placeholder component for loading/error states
function Placeholder({ asset, totalHeightAtHex, isSelected, onSelect }: PlacedAssetProps) {
  const yPos = totalHeightAtHex * 0.5 + 0.5;
  const [x, , z] = axialToWorld(asset.q, asset.r, 0);

  return (
    <group
      position={[x, yPos, z]}
      rotation={[0, asset.rotationY, 0]}
      onClick={(e) => {
        e.stopPropagation();
        onSelect(asset.id);
      }}
    >
      <mesh castShadow receiveShadow>
        <coneGeometry args={[0.5, 1.5, 8]} />
        <meshStandardMaterial color={isSelected ? '#fbbf24' : '#888888'} />
      </mesh>
    </group>
  );
}

export function PlacedAsset(props: PlacedAssetProps) {
  // Find model path from catalog
  const assetDef = ASSET_CATALOG.find(a => a.id === props.asset.type);
  const modelPath = assetDef ? assetDef.path : '/models/tree_pine.glb'; // Fallback

  return (
    <ErrorBoundary 
      fallback={<Placeholder {...props} />}
      onError={(error) => {
        // Silently handle model loading errors - show placeholder instead
        console.warn(`Failed to load model: ${modelPath}`, error.message);
      }}
    >
      <Suspense fallback={<Placeholder {...props} />}>
        <ModelContent
          modelPath={modelPath}
          asset={props.asset}
          totalHeightAtHex={props.totalHeightAtHex}
          isSelected={props.isSelected}
          onSelect={props.onSelect}
        />
      </Suspense>
    </ErrorBoundary>
  );
}
