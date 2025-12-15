import { useEffect, useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { PointerLockControls } from '@react-three/drei';
import { useMapStore } from '@/store/useMapStore';
import { worldToAxial } from '@/lib/hexMath';
import * as THREE from 'three';

export function ExplorerControls() {
    const { isExplorerMode, setExplorerMode, getTotalHeightAt } = useMapStore();
    const controlsRef = useRef<any>(null);
    const moveForward = useRef(false);
    const moveBackward = useRef(false);
    const moveLeft = useRef(false);
    const moveRight = useRef(false);

    // Physics state
    const velocity = useRef(new THREE.Vector3());
    const direction = useRef(new THREE.Vector3());

    const { camera } = useThree();

    useEffect(() => {
        // Only lock if explicitly enabled
        if (isExplorerMode && controlsRef.current) {
            controlsRef.current.lock();
        }
    }, [isExplorerMode]);

    // Track previous mode to detect exit

    // Handle key events
    useEffect(() => {
        const onKeyDown = (event: KeyboardEvent) => {
            switch (event.code) {
                case 'ArrowUp':
                case 'KeyW':
                    moveForward.current = true;
                    break;
                case 'ArrowLeft':
                case 'KeyA':
                    moveLeft.current = true;
                    break;
                case 'ArrowDown':
                case 'KeyS':
                    moveBackward.current = true;
                    break;
                case 'ArrowRight':
                case 'KeyD':
                    moveRight.current = true;
                    break;
            }
        };

        const onKeyUp = (event: KeyboardEvent) => {
            switch (event.code) {
                case 'ArrowUp':
                case 'KeyW':
                    moveForward.current = false;
                    break;
                case 'ArrowLeft':
                case 'KeyA':
                    moveLeft.current = false;
                    break;
                case 'ArrowDown':
                case 'KeyS':
                    moveBackward.current = false;
                    break;
                case 'ArrowRight':
                case 'KeyD':
                    moveRight.current = false;
                    break;
            }
        };

        document.addEventListener('keydown', onKeyDown);
        document.addEventListener('keyup', onKeyUp);

        return () => {
            document.removeEventListener('keydown', onKeyDown);
            document.removeEventListener('keyup', onKeyUp);
        };
    }, []);

    useFrame((_state, delta) => {
        if (!isExplorerMode) return;

        // Movement speed
        const speed = 100.0; // Units per second? Need tuning.
        // Damping
        const damping = 10.0;

        // Standard WASD logic adapted for Three.js

        velocity.current.x -= velocity.current.x * damping * delta;
        velocity.current.z -= velocity.current.z * damping * delta;

        direction.current.z = Number(moveForward.current) - Number(moveBackward.current);
        direction.current.x = Number(moveRight.current) - Number(moveLeft.current);
        direction.current.normalize(); // Ensure consistent speed in all directions

        if (moveForward.current || moveBackward.current) {
            velocity.current.z -= direction.current.z * speed * delta;
        }
        if (moveLeft.current || moveRight.current) {
            velocity.current.x -= direction.current.x * speed * delta;
        }

        // Apply movement relative to camera direction
        // PointerLockControls usually updates the camera object directly.
        // We can use controls.current.moveRight / moveForward

        if (controlsRef.current) {
            if (moveForward.current || moveBackward.current) {
                controlsRef.current.moveForward(-velocity.current.z * delta * 0.5); // Tune multiplier
            }
            if (moveLeft.current || moveRight.current) {
                controlsRef.current.moveRight(velocity.current.x * delta * 0.5); // Tune multiplier
            }
        }

        // Height Lock Logic
        // 1. Get current position
        const { x, z } = camera.position;

        // 2. Find hex total height
        const { q, r } = worldToAxial(x, z);
        const terrainHeightBase = getTotalHeightAt(q, r); // Sum of tile heights

        // 3. Calculate target Y
        // Heights in store are generic units (e.g. 1, 2, 5).
        // In World, 1 unit = 0.5 units height.
        // So surface Y = terrainHeightBase * 0.5.
        const surfaceY = terrainHeightBase * 0.5;
        const eyeLevel = 2.0; // Player height
        const targetY = Math.max(0, surfaceY) + eyeLevel;

        // 4. Smoothly interpolate Y
        camera.position.y = THREE.MathUtils.lerp(camera.position.y, targetY, delta * 10);
    });

    if (!isExplorerMode) return null;

    return (
        <PointerLockControls
            ref={controlsRef}
            onUnlock={() => setExplorerMode(false)} // Exit mode when user presses ESC
        />
    );
}
