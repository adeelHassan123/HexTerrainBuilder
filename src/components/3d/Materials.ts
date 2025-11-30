import * as THREE from 'three';

/**
 * Material definitions for intelligent terrain progression
 * Phase 2: Height-based material system
 */

// Grass material for level 0 (base tiles)
export const createGrassMaterial = () => {
    return new THREE.MeshStandardMaterial({
        color: '#7cb342', // Natural grass green
        roughness: 0.85,
        metalness: 0.05,
        // Future: Add grass texture, normal map, and roughness map
    });
};

// Dirt/transition material for level 1 (mid-height tiles)
export const createDirtMaterial = () => {
    return new THREE.MeshStandardMaterial({
        color: '#8d6e63', // Brown dirt
        roughness: 0.9,
        metalness: 0.0,
        // Future: Add dirt texture with grass edges, normal map
    });
};

// Rock/cliff material for level 2+ (high tiles)
export const createRockMaterial = () => {
    return new THREE.MeshStandardMaterial({
        color: '#616161', // Dark gray rock
        roughness: 0.7,
        metalness: 0.15,
        // Future: Add rock texture with moss, cracks, normal map
    });
};

/**
 * Get material based on stack level and tile height
 * @param stackLevel Position in the stack (0 = base, 1 = mid, 2+ = high)
 * @param tileHeight Height of the individual tile (1, 2, or 5)
 * @returns Appropriate material for the tile
 */
export const getMaterialForTile = (stackLevel: number, tileHeight: number): THREE.MeshStandardMaterial => {
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
export const addColorVariation = (material: THREE.MeshStandardMaterial, seed: number): void => {
    const variation = 0.1; // 10% variation
    const baseColor = new THREE.Color(material.color);

    // Use seed to create deterministic but varied colors
    const r = baseColor.r * (1 + (Math.sin(seed * 12.9898) * variation));
    const g = baseColor.g * (1 + (Math.sin(seed * 78.233) * variation));
    const b = baseColor.b * (1 + (Math.sin(seed * 45.164) * variation));

    material.color.setRGB(
        Math.min(1, Math.max(0, r)),
        Math.min(1, Math.max(0, g)),
        Math.min(1, Math.max(0, b))
    );
};
