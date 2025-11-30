import { Suspense, useState, useRef, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Stats } from '@react-three/drei';
import { Scene } from '@/components/3d/Scene';
import { TableBoundary } from '@/components/3d/TableBoundary';
import { Toolbar } from '@/components/ui/Toolbar';
import { AssetLibrary } from '@/components/ui/AssetLibrary';
import { InventoryPanel } from '@/components/ui/InventoryPanel';
import { LayerControls } from '@/components/ui/LayerControls';
import { SaveLoadDialog } from '@/components/ui/SaveLoadDialog';
import { Toaster } from '@/components/ui/sonner';
import { useExport } from '@/lib/export';
import * as THREE from 'three';

// Main App Component
export default function App() {
  const [saveLoadOpen, setSaveLoadOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { exportMap } = useExport();

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const handleExport = (format: string) => {
    if (format === 'png' && canvasRef.current) {
      const renderer = new THREE.WebGLRenderer({ canvas: canvasRef.current, antialias: true });
      exportMap('png', renderer);
    } else {
      exportMap(format as 'woocommerce' | 'json' | 'glb' | 'png');
    }
  };

  return (
    <div className="h-screen w-screen overflow-hidden bg-background relative touch-none">
      <Canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full z-0"
        camera={{
          position: [15, 15, 15],
          fov: 60,
          near: 0.1,
          far: 1000
        }}
        gl={{
          antialias: true,
          toneMapping: THREE.ACESFilmicToneMapping
        }}
        shadows
        dpr={typeof window !== 'undefined' ? [1, Math.min(window.devicePixelRatio, 2)] : 1}
      >
        <Suspense fallback={null}>
          {/* Sky-blue background */}
          <color attach="background" args={['#87CEEB']} />

          {/* Phase 3: Cinematic Outdoor Lighting */}

          {/* Hemisphere light for realistic sky/ground ambient */}
          <hemisphereLight
            args={['#87CEEB', '#6B8E23', 0.4]} // Sky blue, olive ground, moderate intensity
            position={[0, 50, 0]}
          />

          {/* Physically correct sun directional light (warm, sharp but soft shadows) */}
          <directionalLight
            position={[15, 30, 15]} // Angled from above
            intensity={1.2}
            color="#FFF5E1" // Warm sunlight (cream white)
            castShadow
            shadow-mapSize-width={2048}
            shadow-mapSize-height={2048}
            shadow-camera-far={100}
            shadow-camera-left={-25}
            shadow-camera-right={25}
            shadow-camera-top={25}
            shadow-camera-bottom={-25}
            shadow-bias={-0.0001}
          />

          {/* Subtle fill light to soften deep shadows */}
          <directionalLight
            position={[-10, 15, -10]}
            intensity={0.3}
            color="#B0C4DE" // Cool fill (light steel blue)
          />

          {/* Subtle volumetric distance fog */}
          <fog attach="fog" args={['#87CEEB', 30, 80]} />

          <Scene />
          <TableBoundary />

          <OrbitControls
            enablePan={true}
            enableZoom={true}
            enableRotate={true}
            minDistance={5}
            maxDistance={50}
            target={[0, 0, 0]}
            dampingFactor={0.1}
            enableDamping={true}
            rotateSpeed={isMobile ? 0.3 : 0.5}
            panSpeed={isMobile ? 0.5 : 0.8}
            zoomSpeed={isMobile ? 0.5 : 0.8}
            touches={{
              ONE: 2, // Rotate
              TWO: 1  // Zoom
            }}
          />

          {/* Removed square gridHelper - replaced with hexagonal GridOverlay */}
          <axesHelper args={[5]} />
          <Stats />

          {/* Minimap temporarily disabled to fix rendering issues */}
          {/* <MinimapView containerRef={minimapRef} /> */}
        </Suspense>
      </Canvas>

      {/* <MinimapContainer containerRef={minimapRef} /> */}

      <Toolbar onSaveLoadOpen={() => setSaveLoadOpen(true)} onExport={handleExport} />
      <AssetLibrary />
      <InventoryPanel />
      <LayerControls />

      <SaveLoadDialog
        open={saveLoadOpen}
        onOpenChange={setSaveLoadOpen}
      />

      <Toaster position="top-center" />

      <div className="fixed bottom-2 left-2 text-xs text-muted-foreground bg-background/80 px-2 py-1 rounded hidden sm:block">
        HexMap 3D Builder v1.0.0
      </div>
    </div>
  );
}
