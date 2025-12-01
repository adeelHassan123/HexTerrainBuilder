import { Suspense, useState, useRef, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Stats } from '@react-three/drei';
import { Scene } from '@/components/3d/Scene';
import { TableBoundary } from '@/components/3d/TableBoundary';
import { ProjectInfo } from '@/components/ui/ProjectInfo';
import { OnboardingOverlay } from '@/components/ui/OnboardingOverlay';
import { Toolbar } from '@/components/ui/Toolbar';
import { AssetLibrary } from '@/components/ui/AssetLibrary';
import { SaveLoadDialog } from '@/components/ui/SaveLoadDialog';
import { MapStatsPanel } from '@/components/ui/MapStatsPanel';
import { Toaster } from '@/components/ui/sonner';
import { useExport } from '@/lib/export';
import * as THREE from 'three';
import { useMapStore } from '@/store/useMapStore'

type WindowWithHexGridControls = Window & {
  __hexGridControlsEnabled?: (enabled: boolean) => void
}

// Main App Component
export default function App() {
  const [saveLoadOpen, setSaveLoadOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [controlsEnabled, setControlsEnabled] = useState(true);
  const [showStats, setShowStats] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { exportMap } = useExport();
  const { rotateMode, setRotateMode, selectedObjectId, rotateAsset } = useMapStore();

  // When rotateMode is active, allow click+drag on the canvas to rotate selected asset
  useEffect(() => {
    if (!rotateMode) return;

    let dragging = false
    let lastX = 0

    const onPointerDown = (e: PointerEvent) => {
      if (e.button !== 0) return
      dragging = true
      lastX = e.clientX
      // disable orbit controls while rotating (via global hook)
      const setter = (window as WindowWithHexGridControls).__hexGridControlsEnabled
      if (setter) setter(false)
    }

    const onPointerMove = (e: PointerEvent) => {
      if (!dragging) return
      const dx = e.clientX - lastX
      lastX = e.clientX
      if (selectedObjectId) {
        // sensitivity tuned down for UX
        const delta = dx * 0.01
        rotateAsset(selectedObjectId, delta)
      }
    }

    const onPointerUp = () => {
      dragging = false
      const setter = (window as WindowWithHexGridControls).__hexGridControlsEnabled
      if (setter) setter(true)
      // exit rotate mode by default after drag
      setRotateMode(false)
    }

    window.addEventListener('pointerdown', onPointerDown)
    window.addEventListener('pointermove', onPointerMove)
    window.addEventListener('pointerup', onPointerUp)

    return () => {
      window.removeEventListener('pointerdown', onPointerDown)
      window.removeEventListener('pointermove', onPointerMove)
      window.removeEventListener('pointerup', onPointerUp)
      const setter = (window as WindowWithHexGridControls).__hexGridControlsEnabled
      if (setter) setter(true)
      setRotateMode(false)
    }
  }, [rotateMode, selectedObjectId, rotateAsset, setRotateMode])

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Expose controls state to HexGrid via window (temporary solution)
  useEffect(() => {
    type WindowWithHexGridControls = Window & {
      __hexGridControlsEnabled?: (enabled: boolean) => void
    }
    ;(window as WindowWithHexGridControls).__hexGridControlsEnabled = setControlsEnabled;
    return () => {
      delete (window as WindowWithHexGridControls).__hexGridControlsEnabled;
    };
  }, []);

  // Keyboard shortcuts: F3 for Stats toggle
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'F3') {
        e.preventDefault();
        setShowStats(prev => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleExport = (format: string) => {
    if (format === 'png' && canvasRef.current) {
      const renderer = new THREE.WebGLRenderer({ canvas: canvasRef.current, antialias: true });
      exportMap('png', renderer);
    } else {
      exportMap(format as 'woocommerce' | 'json' | 'glb' | 'png');
    }
  };

  // Improve mobile responsiveness: slightly faster rotate/zoom on mobile
  const orbitRotateSpeed = isMobile ? 0.8 : 0.6
  const orbitPanSpeed = isMobile ? 0.9 : 0.8
  const orbitZoomSpeed = isMobile ? 1.2 : 1.0

  // Drag-to-rotate global handler when rotateMode is active

  return (
    <div className="h-screen w-screen overflow-hidden relative" style={{ backgroundColor: '#020617' }}>
      <Canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full z-0 touch-none vignette"
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
            enabled={controlsEnabled}
            enablePan={true}
            enableZoom={true}
            enableRotate={true}
            minDistance={5}
            maxDistance={50}
            target={[0, 0, 0]}
            dampingFactor={0.15}
            enableDamping={true}
            rotateSpeed={orbitRotateSpeed}
            panSpeed={orbitPanSpeed}
            zoomSpeed={orbitZoomSpeed}
            touches={{
              ONE: 2, // Single touch rotates (we still detect taps vs drags)
              TWO: 1  // Two fingers zoom
            }}
            mouseButtons={{
              LEFT: 0, // Disable left mouse button for camera (let tile placement work)
              MIDDLE: 1, // Pan with middle button
              RIGHT: 2  // Rotate with right button
            }}
          />

          {/* Stats toggled with F3 */}
          {showStats && <Stats />}

          {/* Minimap temporarily disabled to fix rendering issues */}
          {/* <MinimapView containerRef={minimapRef} /> */}
        </Suspense>
      </Canvas>

      {/* <MinimapContainer containerRef={minimapRef} /> */}

      <OnboardingOverlay />
      <ProjectInfo onSave={() => setSaveLoadOpen(true)} />
      <MapStatsPanel />
      <Toolbar onSaveLoadOpen={() => setSaveLoadOpen(true)} onExport={handleExport} />
      <AssetLibrary />

      <SaveLoadDialog
        open={saveLoadOpen}
        onOpenChange={setSaveLoadOpen}
      />

      <Toaster position="top-center" />
    </div>
  );
}
