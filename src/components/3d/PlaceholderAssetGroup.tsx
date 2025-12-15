import { useRef, useMemo, useEffect } from 'react';
import * as THREE from 'three';
import { PlacedAsset } from '../../types';
import { axialToWorld } from '../../lib/hexMath';

interface PlaceholderAssetGroupProps {
    assets: (PlacedAsset & { _calculatedHeight: number })[];
    isSelected: (id: string) => boolean;
    onSelect: (id: string | null) => void;
    color?: string;
}

export function PlaceholderAssetGroup({ assets, isSelected, onSelect, color = "#ff8800" }: PlaceholderAssetGroupProps) {
    const meshRef = useRef<THREE.InstancedMesh>(null);

    // Choose geometry based on type (simple heuristics could be added here)
    const geometry = useMemo(() => new THREE.ConeGeometry(0.3, 1, 8), []);
    const material = useMemo(() => new THREE.MeshStandardMaterial({ color, roughness: 0.8 }), [color]);

    useEffect(() => {
        if (!meshRef.current) return;
        const mesh = meshRef.current;

        // Resize buffer if needed
        if (mesh.count !== assets.length) mesh.count = assets.length;

        const matrix = new THREE.Matrix4();
        const colorObj = new THREE.Color();

        assets.forEach((asset, i) => {
            const { q, r, _calculatedHeight, rotationY, scale } = asset;
            const [x, , z] = axialToWorld(q, r, 0);

            // Adjust Y to sit on top of terrain
            // _calculatedHeight is tile units (1,2,5). In world, h = h * 0.5.
            const terrainY = _calculatedHeight * 0.5;

            matrix.makeRotationY(rotationY);
            matrix.scale(new THREE.Vector3(scale, scale, scale));
            matrix.setPosition(x, terrainY + 0.5 * scale, z); // +0.5*scale because cone origin is center

            mesh.setMatrixAt(i, matrix);

            if (isSelected(asset.id)) {
                colorObj.setHex(0xffff00); // Yellow selection
            } else {
                colorObj.set(color);
            }
            mesh.setColorAt(i, colorObj);
        });

        mesh.instanceMatrix.needsUpdate = true;
        if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
    }, [assets, color, isSelected]);

    return (
        <instancedMesh
            ref={meshRef}
            args={[geometry, material, assets.length]}
            castShadow
            receiveShadow
            onClick={(e) => {
                e.stopPropagation();
                // Find instance index
                const instanceId = e.instanceId;
                if (instanceId !== undefined && assets[instanceId]) {
                    onSelect(assets[instanceId].id);
                }
            }}
        />
    );
}
