import { useMemo } from 'react';
import { useLoader } from '@react-three/fiber';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { Instances, Instance } from '@react-three/drei';
import * as THREE from 'three';
import { PlacedAsset } from '../../types';
import { axialToWorld } from '../../lib/hexMath';

interface InstancedAssetGroupProps {
    url: string;
    assets: PlacedAsset[];
    isSelected: (id: string) => boolean;
    onSelect: (id: string) => void;
    onError?: (err: any) => void;
}

export function InstancedAssetGroup({ url, assets, isSelected, onSelect }: InstancedAssetGroupProps) {
    const gltf = useLoader(GLTFLoader, url);

    // Extract all distinct meshes from the GLTF to instance them
    const meshes = useMemo(() => {
        const m: { geometry: THREE.BufferGeometry; material: THREE.Material; position: THREE.Vector3; rotation: THREE.Euler; scale: THREE.Vector3 }[] = [];

        // We need to bake the scene hierarchy transforms into the mesh offset if possible, 
        // OR just use the mesh's local transform relative to the scene root if we assume flat structure.
        // For simplicity, we assume assets are relatively centered or simple. 
        // Ideally we traverse and capture the world transform relative to scene root.

        gltf.scene.traverse((node) => {
            if ((node as THREE.Mesh).isMesh) {
                const mesh = node as THREE.Mesh;
                mesh.castShadow = true;
                mesh.receiveShadow = true;
                // Capture local transform (assuming flat hierarchy for simple assets, or accumulating if needed)
                // For standard low-poly assets, usually just the mesh at logic position.

                m.push({
                    geometry: mesh.geometry,
                    material: mesh.material as THREE.Material,
                    position: mesh.position.clone(),
                    rotation: mesh.rotation.clone(),
                    scale: mesh.scale.clone()
                });
            }
        });
        return m;
    }, [gltf]);

    // Compute vertical offset (bounding box bottom) to sit on ground
    const verticalOffset = useMemo(() => {
        const box = new THREE.Box3().setFromObject(gltf.scene);
        return -box.min.y;
    }, [gltf]);

    if (!meshes.length) return null;

    return (
        <group>
            {meshes.map((meshData, i) => (
                <Instances
                    key={i}
                    range={assets.length}
                    geometry={meshData.geometry}
                    material={meshData.material}
                    castShadow
                    receiveShadow
                >
                    {assets.map((asset) => (
                        <IndividualInstance
                            key={asset.id}
                            asset={asset}
                            meshOffset={meshData}
                            baseVerticalOffset={verticalOffset}
                            isSelected={isSelected(asset.id)}
                            onClick={(e) => {
                                e.stopPropagation();
                                onSelect(asset.id);
                            }}
                        />
                    ))}
                </Instances>
            ))}

            {/* Selection Rings - rendered separately because they are distinct visual elements */}
            {assets.map(asset => isSelected(asset.id) && (
                <SelectionRing key={`ring-${asset.id}`} asset={asset} />
            ))}
        </group>
    );
}

function IndividualInstance({
    asset,
    baseVerticalOffset,
    isSelected,
    onClick
}: {
    asset: PlacedAsset;
    meshOffset: any; // Kept in type to match map but unused
    baseVerticalOffset: number;
    isSelected: boolean;
    onClick: (e: any) => void;
}) {
    const [x, , z] = axialToWorld(asset.q, asset.r, 0);
    // We need to calculate height from the terrain... 
    // Wait, PlacedAsset.tsx receives `totalHeightAtHex`. 
    // InstancedAssetGroup needs that data.
    // We should pass a lookup function or pre-calculated height.
    // For now, let's assume y=0 and fix it in step 3 (AssetRenderer needs to pass height).
    // Actually, we can use useMapStore inside here? Or pass height in the asset object?
    // The 'asset' object in types usually just has q,r. 

    // Let's defer height calculation to the caller (AssetRenderer) mapping.
    // Assuming 'asset' passed here includes a 'height' property added by Renderer.

    const y = (asset as any)._calculatedHeight || 0;

    // Apply visual scale and offset
    // Combined transform: 
    // 1. Mesh local offset (meshOffset.position/rot/scale)
    // 2. Asset scale/rotation
    // 3. World position (hex center)

    // This is complex to composition in <Instance>.
    // <Instance> takes position/rotation/scale.
    // If meshOffset is significant, we might need a distinct component or simpler assets.
    // For most terrain assets, meshOffset is usually identity or negligible.

    return (
        <Instance
            position={[x, y + baseVerticalOffset * asset.scale, z]}
            rotation={[0, asset.rotationY, 0]}
            scale={[asset.scale, asset.scale, asset.scale]}
            onClick={onClick}
            color={isSelected ? '#fbbf24' : undefined} // Highlight tint if selected? Or use SelectionRing.
        />
    );
}

function SelectionRing({ asset }: { asset: PlacedAsset }) {
    const [x, , z] = axialToWorld(asset.q, asset.r, 0);
    const y = (asset as any)._calculatedHeight || 0;

    return (
        <mesh position={[x, y + 0.1, z]} rotation={[-Math.PI / 2, 0, 0]}>
            <ringGeometry args={[0.6 * asset.scale, 0.7 * asset.scale, 32]} />
            <meshBasicMaterial color="#fbbf24" toneMapped={false} />
        </mesh>
    );
}
