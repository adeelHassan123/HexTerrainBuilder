import { Suspense, useState, useRef, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Stats } from '@react-three/drei';
import { Scene } from '@/components/3d/Scene';
import { DayNightCycle } from '@/components/3d/DayNightCycle';
import { ExplorerControls } from '@/components/3d/ExplorerControls';
import { TableBoundary } from '@/components/3d/TableBoundary';
import { XRProvider, XRInterface } from '@/components/3d/XRWrapper';
import { AssetTransformControls } from '@/components/ui/AssetTransformControls';
import { ProjectInfo } from '@/components/ui/ProjectInfo';
import { OnboardingOverlay } from '@/components/ui/OnboardingOverlay';
import { Toolbar } from '@/components/ui/Toolbar';
import { AssetLibrary } from '@/components/ui/AssetLibrary';
import { SaveLoadDialog } from '@/components/ui/SaveLoadDialog';
import { MapStatsPanel } from '@/components/ui/MapStatsPanel';
import { QualitySettings } from '@/components/ui/QualitySettings';
import { AccessibilityAnnouncer, KeyboardShortcutsHelp } from '@/components/ui/Accessibility';
import { TimeControls } from '@/components/ui/TimeControls';
import { Toaster } from '@/components/ui/sonner';
import { useExport } from '@/lib/export';
import * as THREE from 'three';
import { useMapStore } from '@/store/useMapStore'
import { useQualityStore } from '@/store/useQualityStore';
import { WelcomeScreen } from '@/components/ui/WelcomeScreen';
import { TerrainGenerator } from '@/components/ui/TerrainGenerator';
import { AnimatePresence } from 'framer-motion';
import { WindowWithHexGridControls } from '@/types';

// Main App Component
export default function App() {
  const [showWelcome, setShowWelcome] = useState(true);
  const [saveLoadOpen, setSaveLoadOpen] = useState(false);
  const [terrainGeneratorOpen, setTerrainGeneratorOpen] = useState(false);
  const [qualitySettingsOpen, setQualitySettingsOpen] = useState(false);
  const [controlsEnabled, setControlsEnabled] = useState(true);
  const [showStats, setShowStats] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const orbitControlsRef = useRef<any>(null);
  const { exportMap } = useExport();
  const { rotateMode, setRotateMode, selectedObjectId, rotateAsset, isMobile, setIsMobile, hydrateImportedAssets, isExplorerMode } = useMapStore();
  const { settings: qualitySettings, autoDetectQuality } = useQualityStore();

  // Auto-detect quality and load imported assets on first load
  useEffect(() => {
    autoDetectQuality();
    hydrateImportedAssets();
  }, [autoDetectQuality, hydrateImportedAssets]);

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
    (window as WindowWithHexGridControls).__hexGridControlsEnabled = setControlsEnabled;
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

  // Handle exiting Explorer Mode - Reset Camera
  const prevExplorerMode = useRef(isExplorerMode);
  useEffect(() => {
    if (prevExplorerMode.current && !isExplorerMode) {
      // Just exited Explorer Mode
      if (orbitControlsRef.current && canvasRef.current) {
        const controls = orbitControlsRef.current;
        const camera = controls.object;

        // Reset to a nice overhead view
        camera.position.set(15, 20, 15);
        controls.target.set(0, 0, 0); // Look at center

        controls.update();
      }
    }
    prevExplorerMode.current = isExplorerMode;
  }, [isExplorerMode]);

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
          antialias: qualitySettings.antialias,
          toneMapping: THREE.ACESFilmicToneMapping
        }}
        shadows
        dpr={qualitySettings.pixelRatio}
      >
        <Suspense fallback={null}>
          <XRProvider>
            {/* Dynamic Day/Night Lighting Control */}
            <DayNightCycle />
            <ExplorerControls />

            <Scene />
            <TableBoundary />
          </XRProvider>

          <OrbitControls
            ref={orbitControlsRef}
            enabled={controlsEnabled && !isExplorerMode}
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
      <XRInterface />

      <AccessibilityAnnouncer />

      <OnboardingOverlay />
      {/* ProjectInfo with settings trigger */}
      <ProjectInfo onSave={() => setSaveLoadOpen(true)} />
      <MapStatsPanel />
      <TimeControls />
      <Toolbar
        onSaveLoadOpen={() => setSaveLoadOpen(true)}
        onExport={handleExport}
        onTerrainGeneratorOpen={() => setTerrainGeneratorOpen(true)}
      />
      <AssetLibrary />
      <AssetTransformControls />

      <SaveLoadDialog
        open={saveLoadOpen}
        onOpenChange={setSaveLoadOpen}
      />

      <QualitySettings
        isOpen={qualitySettingsOpen}
        onClose={() => setQualitySettingsOpen(false)}
      />

      <TerrainGenerator
        isOpen={terrainGeneratorOpen}
        onClose={() => setTerrainGeneratorOpen(false)}
      />

      <Toaster position="top-center" />
      <KeyboardShortcutsHelp />

      <AnimatePresence>
        {showWelcome && <WelcomeScreen onStart={() => setShowWelcome(false)} />}
      </AnimatePresence>
    </div>
  );
}
