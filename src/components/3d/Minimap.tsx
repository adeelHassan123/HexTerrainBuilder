import { OrthographicCamera, View } from '@react-three/drei';
import { useMapStore } from '../../store/useMapStore';

export function Minimap() {
  const { tableSize } = useMapStore();

  // Calculate bounds for the orthographic camera
  const width = tableSize.w * Math.sqrt(3);
  const depth = tableSize.h * 1.5;

  return (
    <div className="fixed top-4 right-4 w-48 h-48 border-2 border-primary rounded-lg overflow-hidden bg-background shadow-xl z-50">
      <View className="w-full h-full">
        <color attach="background" args={['#1e293b']} />
        <ambientLight intensity={1} />
        <directionalLight position={[10, 20, 10]} intensity={1.5} />

        {/* Simple plane representing the table */}
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[width / 2, 0, depth / 2]}>
          <planeGeometry args={[width, depth]} />
          <meshStandardMaterial color="#334155" opacity={0.2} transparent />
        </mesh>

        {/* Camera marker */}
        <mesh position={[width / 2, 1, depth / 2]}>
          <sphereGeometry args={[0.3]} />
          <meshBasicMaterial color="#ff0000" />
        </mesh>

        <OrthographicCamera
          makeDefault
          position={[width / 2, 50, depth / 2]}
          zoom={8}
          near={0.1}
          far={1000}
          rotation={[-Math.PI / 2, 0, 0]}
        />
      </View>
    </div>
  );
}
