import { useRef, useEffect } from 'react';
import { useLoader, useFrame } from '@react-three/fiber';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import * as THREE from 'three';
import { axialToWorld } from '../../lib/hexMath';
import { useMapStore } from '../../store/useMapStore';
import { PlacedAsset as PlacedAssetType, ASSET_CATALOG } from '../../types';

interface PlacedAssetProps {
  asset: PlacedAssetType;
  totalHeightAtHex: number;
  isSelected: boolean;
  onSelect: (assetId: string) => void;
}

export function PlacedAsset({ asset, totalHeightAtHex, isSelected, onSelect }: PlacedAssetProps) {
  const groupRef = useRef<THREE.Group>(null);

  // Find model path from catalog
  const assetDef = ASSET_CATALOG.find(a => a.id === asset.type);
  const modelPath = assetDef ? assetDef.path : '/models/tree_pine.glb'; // Fallback

  const { rotateAsset, removeAsset } = useMapStore();

  // Always call useLoader at the same location, catch errors gracefully
  let gltf: any = null;
  try {
    gltf = useLoader(GLTFLoader, modelPath);
  } catch (e) {
    console.error(`Failed to load model: ${modelPath}`, e);
  }

  const yPos = totalHeightAtHex * 0.5 + 0.5; // Sit on top of the hex stack (using 0.5 unit scaling)
  const [x, , z] = axialToWorld(asset.q, asset.r, 0);

  // Handle keyboard events for rotation and deletion
  useEffect(() => {
    if (!isSelected) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Delete' || e.key === 'Backspace') {
        removeAsset(asset.id);
      } else if (e.key === '+' || e.key === '=') {
        rotateAsset(asset.id, Math.PI / 6); // Rotate 30 degrees
      } else if (e.key === '-') {
        rotateAsset(asset.id, -Math.PI / 6); // Rotate -30 degrees
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

  // Highlight when selected
  useFrame(() => {
    if (groupRef.current && gltf && gltf.scene) {
      const scene = gltf.scene;
      scene.traverse((node: THREE.Object3D) => {
        if (node instanceof THREE.Mesh) {
          const material = node.material as THREE.MeshStandardMaterial;
          // Clone material to avoid affecting other instances
          // Note: In a real app, we might want to use a custom shader or outline pass for better performance
          // But for now, emissive is fine, but we must be careful not to mutate shared materials permanently
          // Actually, cloning materials per frame is bad. 
          // Better: Clone the scene once (which we do below) and then modify materials.

          if (isSelected) {
            if (material.emissive) {
              material.emissive.setHex(0xfbbf24);
              material.emissiveIntensity = 0.5;
            }
          } else {
            if (material.emissive) {
              material.emissive.setHex(0x000000);
              material.emissiveIntensity = 0;
            }
          }
        }
      });
    }
  });

  if (!gltf) {
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
