import { useMapStore } from '../../store/useMapStore';
import { HexGrid } from './HexGrid';

export function Scene() {
  const { } = useMapStore();
  
  return (
    <group>
      <HexGrid />
    </group>
  );
}
