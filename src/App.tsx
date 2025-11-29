import { Suspense, useState, useRef } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Stats } from '@react-three/drei';
import { Scene } from '@/components/3d/Scene';
import { TableBoundary } from '@/components/3d/TableBoundary';
import { Toolbar } from '@/components/ui/Toolbar';
import { AssetLibrary } from '@/components/ui/AssetLibrary';
import { InventoryPanel } from '@/components/ui/InventoryPanel';
import { SaveLoadDialog } from '@/components/ui/SaveLoadDialog';
import { Toaster } from '@/components/ui/sonner';
import { useMapStore } from '@/store/useMapStore';
import { useExport } from '@/lib/export';
import * as THREE from 'three';

// Main App Component
export default function App() {
  const [saveLoadOpen, setSaveLoadOpen] = useState(false);
  const { tableSize } = useMapStore();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { exportMap } = useExport();

  const handleExport = (format: string) => {
    if (format === 'png' && canvasRef.current) {
      const renderer = new THREE.WebGLRenderer({ canvas: canvasRef.current, antialias: true });
      exportMap('png', renderer);
    } else {
      exportMap(format as any);
    }
  };

  return (
    <div className="h-screen w-screen overflow-hidden bg-background">
      <Canvas
        ref={canvasRef}
        camera={{ 
          position: [tableSize.w * 0.8, tableSize.h * 0.8, tableSize.w * 0.8],
          fov: 60,
          near: 0.1,
          far: 1000
        }}
        gl={{ 
          antialias: true,
          toneMapping: THREE.ACESFilmicToneMapping
        }}
        shadows
      >
        <Suspense fallback={null}>
          <color attach="background" args={['#f8fafc']} />
          <ambientLight intensity={0.5} />
          <directionalLight 
            position={[10, 20, 10]} 
            intensity={1} 
            castShadow 
            shadow-mapSize-width={2048}
            shadow-mapSize-height={2048}
            shadow-camera-far={50}
            shadow-camera-left={-20}
            shadow-camera-right={20}
            shadow-camera-top={20}
            shadow-camera-bottom={-20}
          />
          
          <Scene />
          <TableBoundary />
          
          <OrbitControls 
            enablePan={true}
            enableZoom={true}
            enableRotate={true}
            minDistance={5}
            maxDistance={50}
            target={[tableSize.w / 2, 0, tableSize.h / 2]}
          />
          
          <gridHelper args={[50, 50, '#cbd5e1', '#e2e8f0']} position={[0, -0.1, 0]} />
          <axesHelper args={[5]} />
          <Stats />
        </Suspense>
      </Canvas>
      
      <Toolbar onSaveLoadOpen={() => setSaveLoadOpen(true)} onExport={handleExport} />
      <AssetLibrary />
      <InventoryPanel />
      
      <SaveLoadDialog 
        open={saveLoadOpen} 
        onOpenChange={setSaveLoadOpen} 
      />
      
      <Toaster position="top-center" />
      
      <div className="fixed bottom-2 left-2 text-xs text-muted-foreground bg-background/80 px-2 py-1 rounded">
        HexMap 3D Builder v1.0.0
      </div>
    </div>
  );
}
