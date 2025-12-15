import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useMapStore } from '@/store/useMapStore';

export function DayNightCycle() {
    const { timeOfDay } = useMapStore();
    const directionalLightRef = useRef<THREE.DirectionalLight>(null);
    const ambientLightRef = useRef<THREE.AmbientLight>(null);
    const hemiLightRef = useRef<THREE.HemisphereLight>(null);

    // Calculate sun position based on time (0-24)
    // 6:00 = Sunrise (Left/East), 12:00 = Noon (Top), 18:00 = Sunset (Right/West), 24:00/0:00 = Midnight (Bottom)
    const sunPosition = useMemo(() => {
        // Map time to angle: 6 -> 0 (0 rad), 12 -> 90 (PI/2), 18 -> 180 (PI), 0/24 -> 270 (-PI/2)
        // Formula: angle = ((time - 6) / 24) * 2 * PI
        const angle = ((timeOfDay - 6) / 24) * Math.PI * 2;
        const radius = 30; // Distance of light

        // x = cos(angle), y = sin(angle) (simple circle in XY plane, slightly tilted for Z)
        const x = Math.cos(angle) * radius;
        const y = Math.max(0.1, Math.sin(angle) * radius); // Keep slightly above horizon to avoid total darkness bugs
        const z = Math.sin(angle * 0.5) * 10; // Slight Z variation for interesting shadows at noon/sunset

        return new THREE.Vector3(x, y, z);
    }, [timeOfDay]);

    // Dynamic colors based on time
    const { sunColor, groundColor, intensity, fogColor } = useMemo(() => {
        let sunColor = '#FFF5E1'; // Day default
        let groundColor = '#6B8E23'; // Day ground
        let intensity = 1.2;
        let fogColor = '#87CEEB'; // Day blue

        // Night (20:00 - 5:00)
        if (timeOfDay > 20 || timeOfDay < 5) {
            sunColor = '#1a237e'; // Deep blue moonlight
            groundColor = '#0f172a'; // Dark ground
            intensity = 0.4;
            fogColor = '#020617'; // Night sky
        }
        // Sunrise/Sunset (5:00-7:00, 17:00-19:00)
        else if ((timeOfDay >= 5 && timeOfDay < 7) || (timeOfDay >= 17 && timeOfDay < 19)) {
            sunColor = '#fb923c'; // Orange
            groundColor = '#854d0e'; // Warm ground
            intensity = 0.8;
            fogColor = '#fdba74'; // Orange sky
        }

        return { sunColor, groundColor, intensity, fogColor };
    }, [timeOfDay]);

    // Smoothly interpolate scene background and light colors
    useFrame((state, delta) => {
        if (directionalLightRef.current) {
            // Move sun
            const currentPos = directionalLightRef.current.position;
            currentPos.lerp(sunPosition, delta * 2);

            // Change color
            directionalLightRef.current.color.lerp(new THREE.Color(sunColor), delta * 2);
            directionalLightRef.current.intensity = THREE.MathUtils.lerp(directionalLightRef.current.intensity, intensity, delta * 2);
        }

        if (ambientLightRef.current) {
            ambientLightRef.current.intensity = THREE.MathUtils.lerp(ambientLightRef.current.intensity, intensity * 0.5, delta * 2);
        }

        if (hemiLightRef.current) {
            hemiLightRef.current.color.lerp(new THREE.Color(fogColor), delta * 2);
            hemiLightRef.current.groundColor.lerp(new THREE.Color(groundColor), delta * 2);
        }

        // Update background color (sky)
        // Note: This modifies the global scene background. If using a Skybox, we'd update that instead.
        if (state.scene.background instanceof THREE.Color) {
            state.scene.background.lerp(new THREE.Color(fogColor), delta * 2);
        } else {
            state.scene.background = new THREE.Color(fogColor);
        }

        // Update fog if it exists
        if (state.scene.fog && state.scene.fog instanceof THREE.Fog) {
            state.scene.fog.color.lerp(new THREE.Color(fogColor), delta * 2);
        }
    });

    return (
        <>
            <ambientLight ref={ambientLightRef} intensity={0.5} />
            <hemisphereLight ref={hemiLightRef} args={[0xffffff, 0x444444, 0.5]} />
            <directionalLight
                ref={directionalLightRef}
                position={[sunPosition.x, sunPosition.y, sunPosition.z]}
                castShadow
                shadow-mapSize-width={2048}
                shadow-mapSize-height={2048}
                shadow-camera-far={100}
                shadow-camera-left={-30}
                shadow-camera-right={30}
                shadow-camera-top={30}
                shadow-camera-bottom={-30}
                shadow-bias={-0.0005}
            />

        </>
    );
}
