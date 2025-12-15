import * as THREE from 'three';

/**
 * Material definitions for intelligent terrain progression
 * Phase 2: Height-based material system with textures
 */

// Texture loader singleton
let textureLoader: THREE.TextureLoader | null = null;

const getTextureLoader = () => {
  if (!textureLoader) {
    textureLoader = new THREE.TextureLoader();
  }
  return textureLoader;
};

/**
 * Configure texture for proper tiling on hexagons
 */
const configureTexture = (texture: THREE.Texture, repeat = 2) => {
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(repeat, repeat);
  return texture;
};

/**
 * Grass material for level 0 (base tiles)
 * Using procedural texture URLs from free sources
 */
export const createGrassMaterial = () => {
  const loader = getTextureLoader();

  const material = new THREE.MeshStandardMaterial({
    color: '#7cb342', // Natural grass green
    roughness: 0.85,
    metalness: 0.05,
  });

  // Load textures asynchronously
  // Using placeholder URLs - replace with your own textures
  loader.load(
    'https://cdn.jsdelivr.net/gh/mrdoob/three.js/examples/textures/terrain/grasslight-big.jpg',
    (texture) => {
      material.map = configureTexture(texture, 2);
      material.needsUpdate = true;
    },
    undefined,
    (error) => console.warn('Grass texture failed to load:', error)
  );

  loader.load(
    'https://cdn.jsdelivr.net/gh/mrdoob/three.js/examples/textures/terrain/grasslight-big-nm.jpg',
    (texture) => {
      material.normalMap = configureTexture(texture, 2);
      material.normalScale = new THREE.Vector2(0.5, 0.5);
      material.needsUpdate = true;
    },
    undefined,
    (error) => console.warn('Grass normal map failed to load:', error)
  );

  return material;
};

/**
 * Dirt/transition material for level 1 (mid-height tiles)
 */
export const createDirtMaterial = () => {
  const loader = getTextureLoader();

  const material = new THREE.MeshStandardMaterial({
    color: '#8d6e63', // Brown dirt
    roughness: 0.9,
    metalness: 0.0,
  });

  // Load dirt texture with grass edges
  loader.load(
    'https://cdn.jsdelivr.net/gh/mrdoob/three.js/examples/textures/terrain/backgrounddetailed6.jpg',
    (texture) => {
      material.map = configureTexture(texture, 1.5);
      material.needsUpdate = true;
    },
    undefined,
    (error) => console.warn('Dirt texture failed to load:', error)
  );

  return material;
};

/**
 * Mud material for specific mud tiles
 * High roughness, dark, messy look
 */
export const createMudMaterial = () => {
  const loader = getTextureLoader();

  const material = new THREE.MeshStandardMaterial({
    color: '#4e342e', // Dark earthy brown
    roughness: 0.95,   // Very rough
    metalness: 0.1,    // Slight wetness reflection
  });

  // Re-use dirt texture but tinted darker via color
  loader.load(
    'https://cdn.jsdelivr.net/gh/mrdoob/three.js/examples/textures/terrain/backgrounddetailed6.jpg',
    (texture) => {
      material.map = configureTexture(texture, 2);
      // Bump map for extra depth
      material.bumpMap = texture;
      material.bumpScale = 0.5;
      material.needsUpdate = true;
    },
    undefined,
    (error) => console.warn('Mud texture failed to load:', error)
  );

  return material;
};

/**
 * Rock/cliff material for level 2+ (high tiles)
 */
export const createRockMaterial = () => {
  const loader = getTextureLoader();

  const material = new THREE.MeshStandardMaterial({
    color: '#616161', // Dark gray rock
    roughness: 0.7,
    metalness: 0.15,
  });

  // Load rock texture
  loader.load(
    'https://cdn.jsdelivr.net/gh/mrdoob/three.js/examples/textures/brick_diffuse.jpg',
    (texture) => {
      material.map = configureTexture(texture, 1);
      material.needsUpdate = true;
    },
    undefined,
    (error) => console.warn('Rock texture failed to load:', error)
  );

  loader.load(
    'https://cdn.jsdelivr.net/gh/mrdoob/three.js/examples/textures/brick_bump.jpg',
    (texture) => {
      material.normalMap = configureTexture(texture, 1);
      material.normalScale = new THREE.Vector2(1.0, 1.0);
      material.needsUpdate = true;
    },
    undefined,
    (error) => console.warn('Rock normal map failed to load:', error)
  );

  return material;
};

/**
 * ALTERNATIVE: Use your own custom textures
 * Place texture files in your public folder and use paths like:
 * '/textures/grass-diffuse.jpg'
 * '/textures/grass-normal.jpg'
 */
export const createCustomGrassMaterial = (
  diffusePath: string,
  normalPath?: string,
  roughnessPath?: string
) => {
  const loader = getTextureLoader();

  const material = new THREE.MeshStandardMaterial({
    color: '#ffffff', // White to show texture colors accurately
    roughness: 0.85,
    metalness: 0.05,
  });

  // Load diffuse/color map
  loader.load(
    diffusePath,
    (texture) => {
      material.map = configureTexture(texture, 2);
      material.needsUpdate = true;
    },
    undefined,
    (error) => console.error('Failed to load diffuse texture:', error)
  );

  // Load normal map if provided
  if (normalPath) {
    loader.load(
      normalPath,
      (texture) => {
        material.normalMap = configureTexture(texture, 2);
        material.normalScale = new THREE.Vector2(0.5, 0.5);
        material.needsUpdate = true;
      },
      undefined,
      (error) => console.error('Failed to load normal map:', error)
    );
  }

  // Load roughness map if provided
  if (roughnessPath) {
    loader.load(
      roughnessPath,
      (texture) => {
        material.roughnessMap = configureTexture(texture, 2);
        material.needsUpdate = true;
      },
      undefined,
      (error) => console.error('Failed to load roughness map:', error)
    );
  }

  return material;
};

/**
 * Get material based on stack level and tile height
 * @param stackLevel Position in the stack (0 = base, 1 = mid, 2+ = high)
 * @param tileHeight Height of the individual tile (1, 2, or 5)
 * @returns Appropriate material for the tile
 */
export const getMaterialForTile = (
  stackLevel: number,
  _tileHeight: number
): THREE.MeshStandardMaterial => {
  // Level 0: Always grass (ground level)
  if (stackLevel === 0) {
    return createGrassMaterial();
  }

  // Level 1: Transitional dirt/grass mix
  if (stackLevel === 1) {
    return createDirtMaterial();
  }

  // Level 2+: Rocky cliff
  return createRockMaterial();
};

/**
 * Add subtle variation to material color to avoid repetition
 * @param material Base material
 * @param seed Random seed for consistent variation
 */
export const addColorVariation = (
  material: THREE.MeshStandardMaterial,
  seed: number
): void => {
  const variation = 0.1; // 10% variation
  const baseColor = new THREE.Color(material.color);

  // Use seed to create deterministic but varied colors
  const r = baseColor.r * (1 + Math.sin(seed * 12.9898) * variation);
  const g = baseColor.g * (1 + Math.sin(seed * 78.233) * variation);
  const b = baseColor.b * (1 + Math.sin(seed * 45.164) * variation);

  material.color.setRGB(
    Math.min(1, Math.max(0, r)),
    Math.min(1, Math.max(0, g)),
    Math.min(1, Math.max(0, b))
  );
};

/**
 * Material cache to reuse materials and reduce memory
 */
const materialCache = new Map<string, THREE.MeshStandardMaterial>();

export const getCachedMaterial = (
  stackLevel: number,
  tileHeight: number,
  tileType: string = 'ground'
): THREE.MeshStandardMaterial => {
  const key = `${stackLevel}-${tileHeight}-${tileType}`;

  if (!materialCache.has(key)) {
    // If explicit mud type, use mud material regardless of height
    if (tileType === 'mud') {
      materialCache.set(key, createMudMaterial());
    } else {
      const material = getMaterialForTile(stackLevel, tileHeight);
      materialCache.set(key, material);
    }
  }

  return materialCache.get(key)!;
};

/**
 * Dispose all cached materials (call on cleanup)
 */
export const disposeMaterials = () => {
  materialCache.forEach(material => {
    material.map?.dispose();
    material.normalMap?.dispose();
    material.roughnessMap?.dispose();
    material.dispose();
  });
  materialCache.clear();
};