import { useRef, useMemo, useEffect } from 'react';
import * as THREE from 'three';
import { PlacedAsset } from '../../types';
import { axialToWorld } from '../../lib/hexMath';

interface ProceduralAssetGroupProps {
    assets: (PlacedAsset & { _calculatedHeight: number })[];
    isSelected: (id: string) => boolean;
    onSelect: (id: string | null) => void;
    type: string; // Asset Type ID (e.g., 'tree_pine', 'rock_small')
}

export function ProceduralAssetGroup({ assets, isSelected, onSelect, type }: ProceduralAssetGroupProps) {
    const meshRef = useRef<THREE.InstancedMesh>(null);
    const foliageRef = useRef<THREE.InstancedMesh>(null);

    // Determine geometry based on type category
    const { geometry, secondaryGeometry, material, secondaryMaterial, scaleModifier, offsetY } = useMemo(() => {
        let baseGeo: THREE.BufferGeometry;
        let secGeo: THREE.BufferGeometry | null = null;
        let baseMat: THREE.MeshStandardMaterial;
        let secMat: THREE.MeshStandardMaterial | null = null;
        let scale = 1.0;
        let offset = 0;

        if (type.includes('tree')) {
            // TREE: Cylinder Trunk + Cone Foliage
            baseGeo = new THREE.CylinderGeometry(0.1, 0.15, 0.5, 6);
            baseGeo.translate(0, 0.25, 0); // Base at 0

            secGeo = new THREE.ConeGeometry(0.4, 1.2, 7);
            secGeo.translate(0, 0.6 + 0.25, 0); // On top of trunk

            baseMat = new THREE.MeshStandardMaterial({ color: '#5d4037', roughness: 0.9 }); // Trunk brown
            secMat = new THREE.MeshStandardMaterial({ color: '#2e7d32', roughness: 0.8 }); // Leaves green
            scale = 1.0;
        }
        else if (type.includes('rock')) {
            // ROCK: Dodecahedron (irregular/low poly look)
            baseGeo = new THREE.DodecahedronGeometry(0.4, 0);
            baseMat = new THREE.MeshStandardMaterial({ color: '#757575', roughness: 0.7, flatShading: true });
            scale = type.includes('large') ? 1.2 : 0.7;
            offset = 0.3;
        }
        else if (type.includes('building') || type.includes('house') || type.includes('tower')) {
            // BUILDING: Box base + Cone roof
            baseGeo = new THREE.BoxGeometry(0.6, 0.5, 0.6);
            baseGeo.translate(0, 0.25, 0);

            secGeo = new THREE.ConeGeometry(0.5, 0.4, 4);
            secGeo.translate(0, 0.5 + 0.2, 0);
            secGeo.rotateY(Math.PI / 4); // Align roof

            baseMat = new THREE.MeshStandardMaterial({ color: '#e0e0e0', roughness: 0.5 }); // White/Grey Walls
            secMat = new THREE.MeshStandardMaterial({ color: '#b71c1c', roughness: 0.6 }); // Red Roof
            scale = 1.2;
        }
        else {
            // SCATTER / BUSH: Small Sphere/Dodecahedron
            baseGeo = new THREE.DodecahedronGeometry(0.25, 1);
            baseMat = new THREE.MeshStandardMaterial({ color: '#4caf50', roughness: 0.8 });
            scale = 0.8;
            offset = 0.2;
        }

        return {
            geometry: baseGeo,
            secondaryGeometry: secGeo,
            material: baseMat,
            secondaryMaterial: secMat,
            scaleModifier: scale,
            offsetY: offset
        };
    }, [type]);

    useEffect(() => {
        if (!meshRef.current) return;

        const count = assets.length;
        if (meshRef.current.count !== count) meshRef.current.count = count;
        if (foliageRef.current && foliageRef.current.count !== count) foliageRef.current.count = count;

        const matrix = new THREE.Matrix4();
        const color = new THREE.Color();

        assets.forEach((asset, i) => {
            const { q, r, _calculatedHeight, rotationY, scale } = asset;
            const [x, , z] = axialToWorld(q, r, 0);

            const terrainY = _calculatedHeight * 0.5;
            const finalScale = scale * scaleModifier;

            // Base Mesh Transform
            matrix.makeRotationY(rotationY);
            matrix.scale(new THREE.Vector3(finalScale, finalScale, finalScale));
            matrix.setPosition(x, terrainY + offsetY * finalScale, z);

            meshRef.current?.setMatrixAt(i, matrix);

            // Secondary Mesh Transform (same matrix, geometry has local offset baked in)
            foliageRef.current?.setMatrixAt(i, matrix);

            // Selection Highlight
            if (isSelected(asset.id)) {
                color.setHex(0xffff00);
            } else {
                color.set(material.color);
            }
            meshRef.current?.setColorAt(i, color);

            if (foliageRef.current && secondaryMaterial) {
                if (isSelected(asset.id)) {
                    color.setHex(0xffff00);
                } else {
                    color.set(secondaryMaterial.color);
                }
                foliageRef.current.setColorAt(i, color);
            }
        });

        meshRef.current.instanceMatrix.needsUpdate = true;
        if (meshRef.current.instanceColor) meshRef.current.instanceColor.needsUpdate = true;

        if (foliageRef.current) {
            foliageRef.current.instanceMatrix.needsUpdate = true;
            if (foliageRef.current.instanceColor) foliageRef.current.instanceColor.needsUpdate = true;
        }

    }, [assets, isSelected, material, secondaryMaterial, scaleModifier, offsetY]);

    return (
        <group>
            <instancedMesh
                ref={meshRef}
                args={[geometry, material, assets.length]}
                castShadow
                receiveShadow
                onClick={(e) => {
                    e.stopPropagation();
                    const instanceId = e.instanceId;
                    if (instanceId !== undefined && assets[instanceId]) {
                        onSelect(assets[instanceId].id);
                    }
                }}
            />
            {secondaryGeometry && secondaryMaterial && (
                <instancedMesh
                    ref={foliageRef}
                    args={[secondaryGeometry, secondaryMaterial, assets.length]}
                    castShadow
                    receiveShadow
                // pointerEvents="none" - removed to fix TS error. Raycasting will hit this but we just don't handle onClick.
                />
            )}
        </group>
    );
}
