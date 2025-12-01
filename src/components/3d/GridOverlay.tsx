import { useMemo } from 'react';
import * as THREE from 'three';
import { useMapStore } from '../../store/useMapStore';
import { getHexGridForTable, getHexCorners } from '../../lib/hexMath';

/**
 * GridOverlay - renders visible hexagonal grid lines on the table
 * OPTIMIZED: Uses a single merged BufferGeometry instead of individual Line components
 * This dramatically improves performance when rendering hundreds of hexagons
 */
export function GridOverlay() {
    const { tableSize, showGrid } = useMapStore();

    // Always call hooks first
    const width = tableSize?.widthCm && !isNaN(tableSize.widthCm) ? tableSize.widthCm : 90;
    const height = tableSize?.heightCm && !isNaN(tableSize.heightCm) ? tableSize.heightCm : 60;

    const hexPositions = useMemo(
        () => getHexGridForTable(width, height),
        [width, height]
    );

    const mergedGeometry = useMemo(() => {
        const geometry = new THREE.BufferGeometry();
        const positions: number[] = [];

        for (const hex of hexPositions) {
            const corners = getHexCorners(hex.q, hex.r);
            const y = 0.05;
            for (let i = 0; i < 6; i++) {
                const [x1, z1] = corners[i];
                const [x2, z2] = corners[(i + 1) % 6];
                positions.push(x1, y, z1);
                positions.push(x2, y, z2);
            }
        }
        geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
        return geometry;
    }, [hexPositions]);

    // Early return if grid is hidden
    if (!showGrid) {
        return null;
    }

    if (process.env.NODE_ENV === 'development') {
        console.log('GridOverlay rendering', hexPositions.length, 'hexagons (optimized)');
    }

    return (
        <lineSegments geometry={mergedGeometry}>
            <lineBasicMaterial
                color="#64748b"
                transparent
                opacity={0.5}
                linewidth={1}
            />
        </lineSegments>
    );
}
