import { useMapStore } from '../../store/useMapStore';
import { HexGrid } from './HexGrid';
import { PlacedAsset } from './PlacedAsset';

export function Scene() {
  const { assets, getTotalHeightAt, selectedObjectId, setSelectedObject } = useMapStore();

  return (
    <group>
      <HexGrid />
      {/* Render all placed assets */}
      {Array.from(assets.values()).map((asset) => (
        <PlacedAsset
          key={asset.id}
          asset={asset}
          totalHeightAtHex={getTotalHeightAt(asset.q, asset.r)}
          isSelected={selectedObjectId === asset.id}
          onSelect={(id) => setSelectedObject(id)}
        />
      ))}
    </group>
  );
}
