import { HexGrid } from './HexGrid';
import { InstancedHexTiles } from './InstancedHexTiles';
import { AssetRenderer } from './AssetRenderer';
import { SelectedAssetControls } from './SelectedAssetControls';

export function Scene() {
  return (
    <group>
      <HexGrid />
      <InstancedHexTiles />

      {/* Efficiently render all placed assets using InstancedMesh */}
      <AssetRenderer />

      {/* Handle keyboard controls for selected asset */}
      <SelectedAssetControls />
    </group>
  );
}
