import { Suspense, useState, useRef, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Stats } from '@react-three/drei';
import { Scene } from '@/components/3d/Scene';
import { TableBoundary } from '@/components/3d/TableBoundary';
import { OrbitVisualizer } from '@/components/3d/OrbitVisualizer';
import { AssetTransformControls } from '@/components/ui/AssetTransformControls';
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
import { WelcomeScreen } from '@/components/ui/WelcomeScreen';
import { AnimatePresence } from 'framer-motion';

type WindowWithHexGridControls = Window & {
  __hexGridControlsEnabled?: (enabled: boolean) => void
}

// Main App Component
export default function App() {
  const [showWelcome, setShowWelcome] = useState(true);
  const [saveLoadOpen, setSaveLoadOpen] = useState(false);
  const [controlsEnabled, setControlsEnabled] = useState(true);
  const [showStats, setShowStats] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const orbitControlsRef = useRef<any>(null);
  const { exportMap } = useExport();
  const { rotateMode, setRotateMode, selectedObjectId, rotateAsset, isMobile, setIsMobile } = useMapStore();

  // On first mount, ask user whether to load persisted map or clear it.
  useEffect(() => {
    try {
      const key = 'hexmap-storage';
      const persisted = localStorage.getItem(key);
      if (persisted && persisted.length > 10) {
        const load = window.confirm('A previously saved map was found. Click OK to load it, or Cancel to clear saved map and start fresh.');
        if (!load) {
          localStorage.removeItem(key);
          // Clear in-memory store as well
          const s = useMapStore.getState();
          s.clearMap();
        }
      }
    } catch (err) {
      // ignore
    }
  }, []);

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
  }, [setIsMobile]);

  // Expose controls state to HexGrid via window (temporary solution)
  useEffect(() => {
    type WindowWithHexGridControls = Window & {
      __hexGridControlsEnabled?: (enabled: boolean) => void
    }
      ; (window as WindowWithHexGridControls).__hexGridControlsEnabled = setControlsEnabled;
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

  // Arrow key camera panning
  useEffect(() => {
    const keys: Record<string, boolean> = {};

    const handleKeyDown = (e: KeyboardEvent) => {
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
        keys[e.key] = true;
        e.preventDefault();
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
        keys[e.key] = false;
      }
    };

    const panSpeed = isMobile ? 0.3 : 0.2;

    const handleFrame = () => {
      if (!orbitControlsRef.current) return;

      const controls = orbitControlsRef.current;
      if (!controls.target) return;

      // Pan the camera by moving the orbit target
      if (keys['ArrowUp']) {
        controls.target.z -= panSpeed;
      }
      if (keys['ArrowDown']) {
        controls.target.z += panSpeed;
      }
      if (keys['ArrowLeft']) {
        controls.target.x -= panSpeed;
      }
      if (keys['ArrowRight']) {
        controls.target.x += panSpeed;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    // Use a frame loop to smoothly pan
    const intervalId = setInterval(handleFrame, 16); // ~60 FPS

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      clearInterval(intervalId);
    };
  }, [isMobile]);

  const handleExport = (format: string) => {
    if (format === 'png' && canvasRef.current) {
      const renderer = new THREE.WebGLRenderer({ canvas: canvasRef.current, antialias: true });
      exportMap('png', renderer);
    } else {
      exportMap(format as 'woocommerce' | 'json' | 'glb' | 'png');
    }
  };

  // Improve mobile responsiveness: slightly faster rotate/zoom on mobile
  const orbitRotateSpeed = isMobile ? 1.0 : 0.6
  const orbitPanSpeed = isMobile ? 1.2 : 0.8
  const orbitZoomSpeed = isMobile ? 1.5 : 1.0

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
            shadow-mapSize-width={isMobile ? 1024 : 2048}
            shadow-mapSize-height={isMobile ? 1024 : 2048}
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

          <Scene />
          <TableBoundary />

          <OrbitControls
            ref={orbitControlsRef}
            enabled={controlsEnabled}
            enablePan={true}
            enableZoom={true}
            enableRotate={true}
            minDistance={5}
            maxDistance={50}
            target={[0, 0, 0]}
            dampingFactor={isMobile ? 0.2 : 0.15}
            enableDamping={true}
            rotateSpeed={orbitRotateSpeed}
            panSpeed={orbitPanSpeed}
            zoomSpeed={orbitZoomSpeed}
            touches={{
              ONE: THREE.TOUCH.ROTATE,
              TWO: THREE.TOUCH.DOLLY_PAN
            }}
            mouseButtons={{
              LEFT: 0, // Disable left mouse button for camera (let tile placement work)
              MIDDLE: 1, // Pan with middle button
              RIGHT: 2  // Rotate with right button
            }}
          />

          {/* Orbit center point visualizer - follows OrbitControls target */}
          <OrbitVisualizer controlsRef={orbitControlsRef} size={1.0} color="#fbbf24" />

          <OrbitControls
            ref={orbitControlsRef}
            enabled={controlsEnabled}
            enablePan={true}
            enableZoom={true}
            enableRotate={true}
            minDistance={5}
            maxDistance={50}
            target={[0, 0, 0]}
            dampingFactor={isMobile ? 0.2 : 0.15}
            enableDamping={true}
            rotateSpeed={orbitRotateSpeed}
            panSpeed={orbitPanSpeed}
            zoomSpeed={orbitZoomSpeed}
            touches={{
              ONE: THREE.TOUCH.ROTATE,
              TWO: THREE.TOUCH.DOLLY_PAN
            }}
            mouseButtons={{
              LEFT: 0, // Disable left mouse button for camera (let tile placement work)
              MIDDLE: 1, // Pan with middle button
              RIGHT: 2  // Rotate with right button
            }}
          />

          {/* Stats toggled with F3 */}
          {showStats && <Stats />}

        </Suspense>
      </Canvas>

      <OnboardingOverlay />
      <ProjectInfo onSave={() => setSaveLoadOpen(true)} />
      <MapStatsPanel />
      <Toolbar onSaveLoadOpen={() => setSaveLoadOpen(true)} onExport={handleExport} />
      <AssetLibrary />
      <AssetTransformControls />

      <SaveLoadDialog
        open={saveLoadOpen}
        onOpenChange={setSaveLoadOpen}
      />

      <Toaster position="top-center" />

      <AnimatePresence>
        {showWelcome && <WelcomeScreen onStart={() => setShowWelcome(false)} />}
      </AnimatePresence>
    </div>
  );
}
