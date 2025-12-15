import { useEffect } from 'react';
import { useMapStore } from '../../store/useMapStore';

/**
 * SelectedAssetControls
 * Handles keyboard and mouse wheel interactions for the currently selected asset.
 * Extracted from PlacedAsset.tsx to support InstancedMesh architecture where
 * individual asset components no longer exist for event listening.
 */
export function SelectedAssetControls() {
    const { selectedObjectId, assets, moveAsset, rotateAsset, adjustAssetScale, removeAsset } = useMapStore();

    useEffect(() => {
        if (!selectedObjectId) return;

        const asset = assets.get(selectedObjectId);
        if (!asset) return;

        const handleKeyDown = (e: KeyboardEvent) => {
            // Check for WASD translation
            const directions: Record<string, { q: number; r: number }> = {
                'w': { q: 0, r: -1 },  // North
                'a': { q: -1, r: 0 },  // West
                's': { q: 0, r: 1 },   // South
                'd': { q: 1, r: 0 },   // East
            };

            const key = e.key.toLowerCase();
            if (key in directions) {
                // e.preventDefault(); // Don't prevent default, might block input fields if we're not careful. 
                // Ideally we check if interactive element is focused.
                // For now, mirroring original behavior.
                if (document.activeElement?.tagName !== 'INPUT' && document.activeElement?.tagName !== 'TEXTAREA') {
                    const dir = directions[key];
                    moveAsset(asset.id, asset.q + dir.q, asset.r + dir.r);
                }
                return;
            }

            // Other keyboard controls
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
            // Check if we are hovering over the canvas? 
            // Original logic just checked isSelected.
            // We might want to ensure we don't zoom the page if scrolling UI.
            // But standard 3D app behavior usually captures scroll.

            if (document.activeElement?.tagName === 'INPUT') return;

            if (e.deltaY !== 0) {
                // e.preventDefault(); // CAUTION: Passive event listeners cannot prevent default. 
                // Original logic used { passive: false }.

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
    }, [selectedObjectId, assets, moveAsset, rotateAsset, adjustAssetScale, removeAsset]);

    return null;
}
