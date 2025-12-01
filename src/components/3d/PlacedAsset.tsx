import { useRef, useEffect, Suspense } from 'react';
import { useLoader } from '@react-three/fiber';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import * as THREE from 'three';
import { axialToWorld } from '../../lib/hexMath';
import { useMapStore } from '../../store/useMapStore';
import { PlacedAsset as PlacedAssetType, ASSET_CATALOG } from '../../types';
import { ErrorBoundary } from './ErrorBoundary';
import { createProceduralAsset } from './ProceduralAssets';

interface PlacedAssetProps {
  asset: PlacedAssetType;
  totalHeightAtHex: number;
  isSelected: boolean;
  onSelect: (assetId: string) => void;
}

// Procedural fallback for missing models
function Placeholder({ asset, totalHeightAtHex, isSelected, onSelect }: PlacedAssetProps) {
  const yPos = totalHeightAtHex * 0.5 + 0.5;
  const [x, , z] = axialToWorld(asset.q, asset.r, 0);

  const proceduralGroup = createProceduralAsset(asset.type);

  return (
    <group
      position={[x, yPos, z]}
      rotation={[0, asset.rotationY, 0]}
      onClick={(e) => {
        e.stopPropagation();
        onSelect(asset.id);
      }}
    >
      <primitive object={proceduralGroup} />

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

// Internal component that handles model loading and proper placement
function ModelContent({
  modelPath,
  asset,
  totalHeightAtHex,
  isSelected,
  onSelect,
}: {
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

  // Compute world position on hex
  const yPos = totalHeightAtHex * 0.5 + 0.5;
  const [x, , z] = axialToWorld(asset.q, asset.r, 0);

  // Keyboard & wheel handlers for selected asset
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

  // Make sure the loaded model is shown (not placeholder) and is properly scaled/positioned.
  // We clone the gltf.scene, compute its bounding box to align the model base to y=0,
  // apply the canonical scale from ASSET_CATALOG (if present), and enable shadows on meshes.
  if (!gltf || !gltf.scene) {
    return null;
  }

  // Find asset definition from catalog to get default scale
  const assetDef = ASSET_CATALOG.find((a) => a.id === asset.type);
  const modelScale = assetDef?.scale ?? 1.0;

  // Clone scene so we can safely modify position/scale without mutating loader cache
  const sceneClone = gltf.scene.clone(true) as THREE.Object3D;

  // Ensure meshes cast/receive shadows and use realistic material settings
  sceneClone.traverse((node: THREE.Object3D) => {
    if ((node as THREE.Mesh).isMesh) {
      const mesh = node as THREE.Mesh;
      mesh.castShadow = true;
      mesh.receiveShadow = true;
      // If material exists, ensure toneMapping won't prevent visibility in some setups
      if ((mesh.material as any)?.toneMapped === undefined) {
        // leave as-is
      }
    }
  });

  // Compute bounding box to align model base at y=0 before we place the group at yPos
  const tmpBox = new THREE.Box3().setFromObject(sceneClone);
  const minY = tmpBox.min.y || 0;
  // Apply scale
  sceneClone.scale.setScalar(modelScale);
  // After scaling, the minY moves as well, so account for scale
  const verticalOffset = -minY * modelScale;

  return (
    <group
      ref={groupRef}
      position={[x, yPos + verticalOffset, z]}
      rotation={[0, asset.rotationY, 0]}
      onClick={(e) => {
        e.stopPropagation();
        onSelect(asset.id);
      }}
    >
      {/* Insert the processed, cloned scene */}
      <primitive object={sceneClone} />

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

// Main exported component: show model or placeholder via ErrorBoundary / Suspense
export function PlacedAsset(props: PlacedAssetProps) {
  // Find model path from catalog
  const assetDef = ASSET_CATALOG.find((a) => a.id === props.asset.type);
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
