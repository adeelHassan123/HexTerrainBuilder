import { useRef, useEffect, Suspense, useMemo } from 'react';
import { useLoader } from '@react-three/fiber';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import * as THREE from 'three';
import { axialToWorld } from '../../lib/hexMath';
import { useMapStore } from '../../store/useMapStore';
import { PlacedAsset as PlacedAssetType, ASSET_CATALOG } from '../../types';
import { ErrorBoundary } from './ErrorBoundary';
import { createProceduralAsset } from './ProceduralAssets';

// Clone cache to avoid re-cloning the same model multiple times
const modelCloneCache = new Map<string, { clone: THREE.Object3D; metadata: { scale: number; verticalOffset: number } }>();

const getOrCreateClone = (gltf: any, modelPath: string, assetDef: any) => {
  const cacheKey = modelPath;
  
  if (!modelCloneCache.has(cacheKey)) {
    const modelScale = assetDef?.scale ?? 1.0;
    const sceneClone = gltf.scene.clone(true) as THREE.Object3D;
    
    // Configure all meshes
    sceneClone.traverse((node: THREE.Object3D) => {
      if ((node as THREE.Mesh).isMesh) {
        const mesh = node as THREE.Mesh;
        mesh.castShadow = true;
        mesh.receiveShadow = true;
      }
    });
    
    // Compute vertical offset once
    const tmpBox = new THREE.Box3().setFromObject(sceneClone);
    const minY = tmpBox.min.y || 0;
    sceneClone.scale.setScalar(modelScale);
    const verticalOffset = -minY * modelScale;
    
    modelCloneCache.set(cacheKey, {
      clone: sceneClone,
      metadata: { scale: modelScale, verticalOffset }
    });
  }
  
  return modelCloneCache.get(cacheKey)!;
};

// Geometry pool for selection rings - reuse instead of recreating
const geometryPool = {
  ring: new THREE.RingGeometry(0.6, 0.7, 32),
  dispose: () => {
    geometryPool.ring.dispose();
  }
};

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

  const proceduralGroup = useMemo(() => createProceduralAsset(asset.type), [asset.type]);

  return (
    <group
      position={[x, yPos, z]}
      rotation={[0, asset.rotationY, 0]}
      scale={asset.scale}
      onClick={(e) => {
        e.stopPropagation();
        onSelect(asset.id);
      }}
    >
      <primitive object={proceduralGroup} />

      {/* Selection Ring - reuse geometry pool */}
      {isSelected && (
        <mesh position={[0, 0.1, 0]} rotation={[-Math.PI / 2, 0, 0]} geometry={geometryPool.ring}>
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
  const { rotateAsset, adjustAssetScale, removeAsset } = useMapStore();

  // useLoader must be called unconditionally - Suspense will handle loading state
  const gltf = useLoader(GLTFLoader, modelPath);

  // Compute world position on hex
  const yPos = totalHeightAtHex * 0.5 + 0.5;
  const [x, , z] = axialToWorld(asset.q, asset.r, 0);
  
  // Get or create cached clone
  const assetDef = useMemo(() => ASSET_CATALOG.find((a) => a.id === asset.type), [asset.type]);
  const cachedClone = useMemo(() => {
    if (!gltf || !gltf.scene) return null;
    return getOrCreateClone(gltf, modelPath, assetDef);
  }, [gltf, modelPath, assetDef]);

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
      } else if (e.key === '[') {
        adjustAssetScale(asset.id, -0.1);
      } else if (e.key === ']') {
        adjustAssetScale(asset.id, 0.1);
      }
    };

    const handleWheel = (e: WheelEvent) => {
      if (isSelected && e.deltaY !== 0) {
        e.preventDefault();
        if (e.ctrlKey || e.metaKey) {
          // Ctrl+Wheel = Scale
          const delta = e.deltaY > 0 ? -0.05 : 0.05;
          adjustAssetScale(asset.id, delta);
        } else {
          // Regular Wheel = Rotate
          const delta = e.deltaY > 0 ? -Math.PI / 12 : Math.PI / 12;
          rotateAsset(asset.id, delta);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('wheel', handleWheel, { passive: false });

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('wheel', handleWheel);
    };
  }, [isSelected, asset.id, rotateAsset, adjustAssetScale, removeAsset]);

  // Make sure the loaded model is shown (not placeholder) and is properly scaled/positioned.
  if (!gltf || !gltf.scene || !cachedClone) {
    return null;
  }

  return (
    <group
      ref={groupRef}
      position={[x, yPos + cachedClone.metadata.verticalOffset, z]}
      rotation={[0, asset.rotationY, 0]}
      scale={asset.scale}
      onClick={(e) => {
        e.stopPropagation();
        onSelect(asset.id);
      }}
    >
      {/* Insert the cached, cloned scene */}
      <primitive object={cachedClone.clone} />

      {/* Selection Ring - reuse geometry pool */}
      {isSelected && (
        <mesh position={[0, 0.1, 0]} rotation={[-Math.PI / 2, 0, 0]} geometry={geometryPool.ring}>
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
