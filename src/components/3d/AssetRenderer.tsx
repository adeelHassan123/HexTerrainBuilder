import { useMemo } from 'react';
import { useMapStore } from '../../store/useMapStore';
import { ASSET_CATALOG, PlacedAsset } from '../../types';
import { InstancedAssetGroup } from './InstancedAssetGroup';
import { ProceduralAssetGroup } from './ProceduralAssetGroup';
import { PlacedAsset as PlacedAssetComponent } from './PlacedAsset';
import { ErrorBoundary } from './ErrorBoundary';

/**
 * AssetRenderer
 * Orchestrates the rendering of all placed assets.
 * Groups assets by type and delegates to InstancedAssetGroup for efficient rendering.
 * Handles both catalog assets (GLTF paths) and imported assets (Blob URLs).
 */
export function AssetRenderer() {
    const { assets, getTotalHeightAt, selectedObjectId, setSelectedObject } = useMapStore();

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

    return (
        <group>
            {
                Object.entries(groupedAssets).map(([type, groupAssets]) => {
                    const isImported = type.startsWith('imported-');

                    // Render imported assets using PlacedAsset component for proper handling
                    if (isImported) {
                        return (
                            <group key={type}>
                                {groupAssets.map((asset) => (
                                    <PlacedAssetComponent
                                        key={asset.id}
                                        asset={asset}
                                        totalHeightAtHex={asset._calculatedHeight}
                                        isSelected={selectedObjectId === asset.id}
                                        onSelect={setSelectedObject}
                                    />
                                ))}
                            </group>
                        );
                    }

                    // Render catalog assets using InstancedAssetGroup for efficiency
                    const def = ASSET_CATALOG.find(a => a.id === type);
                    const url = def ? def.path : '/models/tree_pine.glb';

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
