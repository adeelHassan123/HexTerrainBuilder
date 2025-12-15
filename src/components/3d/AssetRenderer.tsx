import { useMemo, useEffect, useState } from 'react';
import { useMapStore } from '../../store/useMapStore';
import { ASSET_CATALOG, PlacedAsset } from '../../types';
import { InstancedAssetGroup } from './InstancedAssetGroup';
import { ProceduralAssetGroup } from './ProceduralAssetGroup';
import { ErrorBoundary } from './ErrorBoundary';

/**
 * AssetRenderer
 * Orchestrates the rendering of all placed assets.
 * Groups assets by type and delegates to InstancedAssetGroup for efficient rendering.
 * Handles both catalog assets (GLTF paths) and imported assets (Blob URLs).
 */
export function AssetRenderer() {
    const { assets, importedAssets, getTotalHeightAt, selectedObjectId, setSelectedObject } = useMapStore();

    // Group assets by type and augment with calculated height
    const groupedAssets = useMemo(() => {
        const groups: Record<string, (PlacedAsset & { _calculatedHeight: number })[]> = {};

        for (const asset of assets.values()) {
            if (!groups[asset.type]) {
                groups[asset.type] = [];
            }

            const height = getTotalHeightAt(asset.q, asset.r);
            groups[asset.type].push({
                ...asset,
                _calculatedHeight: height
            });
        }

        return groups;
    }, [assets, getTotalHeightAt]);

    // Handle Blob URLs for imported assets
    const [blobUrls, setBlobUrls] = useState<Record<string, string>>({});

    useEffect(() => {
        const newUrls: Record<string, string> = {};
        let changed = false;

        // Create URLs for any imported assets present in the map
        Object.keys(groupedAssets).forEach(type => {
            if (type.startsWith('imported-') && !blobUrls[type]) {
                const buffer = importedAssets.get(type);
                if (buffer) {
                    const blob = new Blob([buffer], { type: 'application/octet-stream' });
                    newUrls[type] = URL.createObjectURL(blob);
                    changed = true;
                }
            }
        });

        if (changed) {
            setBlobUrls(prev => ({ ...prev, ...newUrls }));
        }

        // Cleanup URLs when no longer needed (refinement needed for robust cleanup, 
        // but for now we keep them to avoid flickering on re-renders)

        return () => {
            // Ideal cleanup would check if type is no longer used.
            // For this implementation, we rely on page refresh to clear blobs 
            // or implement a smarter ref counting if memory becomes an issue.
        };
    }, [groupedAssets, importedAssets, blobUrls]);

    return (
        <group>
            {
                Object.entries(groupedAssets).map(([type, groupAssets]) => {
                    let url = '';
                    const isImported = type.startsWith('imported-');

                    if (isImported) {
                        url = blobUrls[type];
                        if (!url) return null; // Wait for blob URL generation
                    } else {
                        const def = ASSET_CATALOG.find(a => a.id === type);
                        url = def ? def.path : '/models/tree_pine.glb';
                    }

                    return (
                        <ErrorBoundary
                            key={type}
                            fallback={
                                <ProceduralAssetGroup
                                    assets={groupAssets}
                                    isSelected={(id) => selectedObjectId === id}
                                    onSelect={setSelectedObject}
                                    type={type}
                                />
                            }
                            onError={(e) => console.warn(`Failed to render asset group ${type}`, e)}
                        >
                            <InstancedAssetGroup
                                url={url}
                                assets={groupAssets}
                                isSelected={(id) => selectedObjectId === id}
                                onSelect={setSelectedObject}
                            />
                        </ErrorBoundary>
                    );
                })}
        </group >
    );
}                   
