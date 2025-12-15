import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { HEX_SIZE } from '@/lib/hexMath';

const WaterShaderMaterial = {
    uniforms: {
        uTime: { value: 0 },
        uColor: { value: new THREE.Color('#4fc3f7') }, // Light blue
        uDeepColor: { value: new THREE.Color('#01579b') }, // Deep blue
        uOpacity: { value: 0.8 },
        uSelected: { value: 0.0 }, // Selection glow strength
    },
    vertexShader: `
    varying vec2 vUv;
    varying float vElevation;
    uniform float uTime;

    void main() {
      vUv = uv;
      vec3 pos = position;
      
      // Simple wave animation
      float wave1 = sin(pos.x * 2.0 + uTime) * 0.1;
      float wave2 = cos(pos.z * 1.5 + uTime * 1.2) * 0.1;
      
      // Apply waves only to top surface (y > 0)
      if (pos.y > 0.0) {
        pos.y += wave1 + wave2;
      }
      
      vElevation = pos.y;

      gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
    }
  `,
    fragmentShader: `
    uniform vec3 uColor;
    uniform vec3 uDeepColor;
    uniform float uOpacity;
    uniform float uSelected;
    varying float vElevation;
    varying vec2 vUv;

    void main() {
      // Mix colors based on wave height
      float mixStrength = (vElevation + 0.1) * 2.0;
      vec3 color = mix(uDeepColor, uColor, mixStrength);
      
      // Add selection glow
      color += vec3(1.0, 0.8, 0.2) * uSelected;
      
      gl_FragColor = vec4(color, uOpacity);
    }
  `
};

interface WaterMeshProps {
    realHeight: number;
    isSelected: boolean;
}

export function WaterMesh({ realHeight, isSelected }: WaterMeshProps) {
    const meshRef = useRef<THREE.Mesh>(null);

    // Create a unique material instance per mesh or use a shared one?
    // Shared is better for uniforms like time, but selection is per-mesh.
    // We can clone the material.

    const material = useMemo(() => {
        const mat = new THREE.ShaderMaterial({
            uniforms: THREE.UniformsUtils.clone(WaterShaderMaterial.uniforms),
            vertexShader: WaterShaderMaterial.vertexShader,
            fragmentShader: WaterShaderMaterial.fragmentShader,
            transparent: true,
        });
        return mat;
    }, []);

    // Random time offset for variation
    const timeOffset = useMemo(() => Math.random() * 100, []);

    useFrame((state) => {
        if (material.uniforms) {
            material.uniforms.uTime.value = state.clock.getElapsedTime() + timeOffset;
            material.uniforms.uSelected.value = THREE.MathUtils.lerp(
                material.uniforms.uSelected.value,
                isSelected ? 0.5 : 0.0,
                0.1
            );
        }
    });

    return (
        <mesh
            ref={meshRef}
            castShadow
            receiveShadow
        >
            <cylinderGeometry args={[HEX_SIZE, HEX_SIZE, realHeight, 6]} />
            <primitive object={material} attach="material" />
        </mesh>
    );
}
