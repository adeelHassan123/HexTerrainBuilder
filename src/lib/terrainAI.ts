import { Tile, PlacedAsset, TileHeight, ASSET_CATALOG, PlacementSuggestion, TerrainAnalysis, TerrainPreset } from '../types';
import { getKey } from './hexMath';
import { createNoise2D } from 'simplex-noise';
import type { NoiseFunction2D } from 'simplex-noise';


// Predefined terrain presets for different environments
export const TERRAIN_PRESETS: TerrainPreset[] = [
  {
    id: 'forest',
    name: 'Dense Forest',
    description: 'Thick woodland with trees and undergrowth',
    heightDistribution: { 1: 0.7, 2: 0.2, 5: 0.1 },
    assetCategories: {
      'Trees': { probability: 0.8, density: 0.6, clustering: 0.3 },
      'Rocks': { probability: 0.2, density: 0.1, clustering: 0.8 },
      'Scatter': { probability: 0.4, density: 0.3, clustering: 0.2 }
    },
    colorScheme: { primary: '#228B22', secondary: '#32CD32', accent: '#8B4513' }
  },
  {
    id: 'desert',
    name: 'Arid Desert',
    description: 'Sandy dunes with sparse vegetation',
    heightDistribution: { 1: 0.4, 2: 0.4, 5: 0.2 },
    assetCategories: {
      'Trees': { probability: 0.1, density: 0.05, clustering: 0.9 },
      'Rocks': { probability: 0.6, density: 0.2, clustering: 0.4 },
      'Scatter': { probability: 0.2, density: 0.1, clustering: 0.6 }
    },
    colorScheme: { primary: '#F4A460', secondary: '#DEB887', accent: '#8B4513' }
  },
  {
    id: 'mountain',
    name: 'Rugged Mountains',
    description: 'Steep peaks with rocky terrain',
    heightDistribution: { 1: 0.3, 2: 0.3, 5: 0.4 },
    assetCategories: {
      'Trees': { probability: 0.3, density: 0.15, clustering: 0.7 },
      'Rocks': { probability: 0.8, density: 0.4, clustering: 0.2 },
      'Buildings': { probability: 0.1, density: 0.02, clustering: 1.0 }
    },
    colorScheme: { primary: '#696969', secondary: '#A9A9A9', accent: '#2F4F4F' }
  },
  {
    id: 'urban',
    name: 'Urban Settlement',
    description: 'Built-up area with structures and paths',
    heightDistribution: { 1: 0.9, 2: 0.08, 5: 0.02 },
    assetCategories: {
      'Buildings': { probability: 0.6, density: 0.3, clustering: 0.1 },
      'Rocks': { probability: 0.2, density: 0.1, clustering: 0.8 },
      'Scatter': { probability: 0.3, density: 0.2, clustering: 0.3 }
    },
    colorScheme: { primary: '#708090', secondary: '#778899', accent: '#D3D3D3' }
  }
];

export class TerrainAI {
  private noise: NoiseFunction2D;

  constructor(seed: number = Math.random() * 1000) {
    // Use the installed simplex-noise library with seeded random function
    const seededRandom = () => {
      const x = Math.sin(seed++) * 10000;
      return x - Math.floor(x);
    };
    this.noise = createNoise2D(seededRandom);
  }

  // Generate height map using multiple octaves of noise
  generateHeightMap(centerQ: number, centerR: number, radius: number): Map<string, number> {
    const heightMap = new Map<string, number>();

    for (let q = centerQ - radius; q <= centerQ + radius; q++) {
      for (let r = centerR - radius; r <= centerR + radius; r++) {
        // Convert hex coordinates to world space for noise
        const worldX = q * 1.5;
        const worldZ = r * Math.sqrt(3) + (q % 2) * Math.sqrt(3) / 2;

        // Multi-octave noise for natural variation
        let height = 0;
        let amplitude = 1;
        let frequency = 0.05;

        for (let octave = 0; octave < 4; octave++) {
          height += this.noise(worldX * frequency, worldZ * frequency) * amplitude;
          amplitude *= 0.5;
          frequency *= 2;
        }

        // Normalize to 0-1 range
        height = (height + 1) / 2;

        const distanceFromCenter = Math.sqrt(q * q + r * r);
        const falloff = Math.max(0, 1 - (distanceFromCenter / radius));

        height *= falloff;

        heightMap.set(getKey(q, r), height);
      }
    }

    return heightMap;
  }

  // Convert noise values to tile heights based on preset
  generateTilesFromHeightMap(
    heightMap: Map<string, number>,
    preset: TerrainPreset
  ): Map<string, Tile[]> {
    const tiles = new Map<string, Tile[]>();

    for (const [key, height] of heightMap) {
      // Determine tile height based on preset distribution
      let tileHeight: TileHeight = 1;
      const rand = Math.random();

      if (rand < preset.heightDistribution[5]) {
        tileHeight = 5;
      } else if (rand < preset.heightDistribution[5] + preset.heightDistribution[2]) {
        tileHeight = 2;
      } else {
        tileHeight = 1;
      }

      // Create stacked tiles based on height value
      const stackHeight = Math.floor(height * 3) + 1;
      const tileStack: Tile[] = [];

      for (let level = 0; level < stackHeight; level++) {
        tileStack.push({
          q: parseInt(key.split(',')[0]),
          r: parseInt(key.split(',')[1]),
          height: tileHeight,
          id: crypto.randomUUID(),
          stackLevel: level
        });
      }

      tiles.set(key, tileStack);
    }

    return tiles;
  }

  // Generate asset placements using clustering algorithms
  generateAssets(
    tiles: Map<string, Tile[]>,
    preset: TerrainPreset,
    existingAssets: Map<string, PlacedAsset> = new Map()
  ): PlacedAsset[] {
    const assets: PlacedAsset[] = [];

    // Get all hex coordinates
    const hexCoords: Array<{ q: number, r: number, height: number }> = [];
    for (const [key, tileStack] of tiles) {
      const [q, r] = key.split(',').map(Number);
      const totalHeight = tileStack.reduce((sum, tile) => sum + tile.height, 0);
      hexCoords.push({ q, r, height: totalHeight });
    }

    // Generate assets for each category
    for (const [category, config] of Object.entries(preset.assetCategories)) {
      if (Math.random() > config.probability) continue;

      const categoryAssets = ASSET_CATALOG.filter(asset => asset.category === category);
      if (categoryAssets.length === 0) continue;

      // Use clustering algorithm for natural distribution
      const clusters = this.generateClusters(hexCoords, config.density, config.clustering);

      for (const cluster of clusters) {
        const assetType = categoryAssets[Math.floor(Math.random() * categoryAssets.length)];
        const stackLevel = Math.floor(cluster.height / 10); // Assets sit on top of terrain

        // Check if position is already occupied by existing assets
        const existingAtPosition = Array.from(existingAssets.values())
          .find(asset => asset.q === cluster.q && asset.r === cluster.r);

        if (!existingAtPosition) {
          assets.push({
            id: crypto.randomUUID(),
            q: cluster.q,
            r: cluster.r,
            type: assetType.id,
            rotationY: Math.random() * Math.PI * 2,
            scale: 0.8 + Math.random() * 0.4, // Slight variation
            stackLevel
          });
        }
      }
    }

    return assets;
  }

  // Generate clusters for natural asset distribution
  private generateClusters(
    hexCoords: Array<{ q: number, r: number, height: number }>,
    density: number,
    clustering: number
  ): Array<{ q: number, r: number, height: number }> {
    const clusters: Array<{ q: number, r: number, height: number }> = [];
    const numClusters = Math.floor(hexCoords.length * density);

    // Create cluster centers
    const centers: Array<{ q: number, r: number }> = [];
    for (let i = 0; i < numClusters; i++) {
      const randomHex = hexCoords[Math.floor(Math.random() * hexCoords.length)];
      centers.push({ q: randomHex.q, r: randomHex.r });
    }

    // Assign hexes to nearest clusters
    for (const hex of hexCoords) {
      let nearestCenter = centers[0];
      let minDistance = this.hexDistance(hex.q, hex.r, nearestCenter.q, nearestCenter.r);

      for (const center of centers) {
        const distance = this.hexDistance(hex.q, hex.r, center.q, center.r);
        if (distance < minDistance) {
          minDistance = distance;
          nearestCenter = center;
        }
      }

      // Add to cluster with probability based on clustering factor
      const probability = clustering + (1 - clustering) * (1 - minDistance / 5);
      if (Math.random() < probability) {
        clusters.push(hex);
      }
    }

    return clusters;
  }

  // Calculate distance between hex coordinates
  private hexDistance(q1: number, r1: number, q2: number, r2: number): number {
    return (Math.abs(q1 - q2) + Math.abs(q1 + r1 - q2 - r2) + Math.abs(r1 - r2)) / 2;
  }

  // Analyze existing terrain and provide suggestions
  analyzeTerrain(
    tiles: Map<string, Tile[]>,
    assets: Map<string, PlacedAsset>,
    centerQ: number = 0,
    centerR: number = 0,
    radius: number = 10
  ): TerrainAnalysis {
    let totalHeight = 0;
    let heightSum = 0;
    let heightVariance = 0;

    // Analyze within radius
    for (let q = centerQ - radius; q <= centerQ + radius; q++) {
      for (let r = centerR - radius; r <= centerR + radius; r++) {
        const key = getKey(q, r);
        const tileStack = tiles.get(key);

        if (tileStack && tileStack.length > 0) {
          const stackHeight = tileStack.reduce((sum, tile) => sum + tile.height, 0);
          heightSum += stackHeight;
          totalHeight++;
        }
      }
    }

    const avgHeight = totalHeight > 0 ? heightSum / totalHeight : 0;

    // Calculate variance
    for (let q = centerQ - radius; q <= centerQ + radius; q++) {
      for (let r = centerR - radius; r <= centerR + radius; r++) {
        const key = getKey(q, r);
        const tileStack = tiles.get(key);

        if (tileStack && tileStack.length > 0) {
          const stackHeight = tileStack.reduce((sum, tile) => sum + tile.height, 0);
          heightVariance += Math.pow(stackHeight - avgHeight, 2);
        }
      }
    }
    heightVariance = totalHeight > 0 ? heightVariance / totalHeight : 0;

    // Determine terrain type
    let terrainType: TerrainAnalysis['terrainType'] = 'flat';
    if (heightVariance > 50) terrainType = 'mountainous';
    else if (heightVariance > 20) terrainType = 'hilly';
    else if (totalHeight > radius * radius * 0.3) terrainType = 'mixed';

    const assetDensity = assets.size / Math.max(totalHeight, 1);
    const connectivity = this.calculateConnectivity(tiles, centerQ, centerR, radius);

    const recommendedActions = this.generateRecommendations(terrainType, assetDensity, heightVariance, connectivity);

    return {
      terrainType,
      assetDensity,
      heightVariance,
      connectivity,
      recommendedActions
    };
  }

  // Calculate how connected the terrain is
  private calculateConnectivity(
    tiles: Map<string, Tile[]>,
    centerQ: number,
    centerR: number,
    radius: number
  ): number {
    let connectedHexes = 0;
    let totalHexes = 0;

    for (let q = centerQ - radius; q <= centerQ + radius; q++) {
      for (let r = centerR - radius; r <= centerR + radius; r++) {
        const key = getKey(q, r);
        const hasTiles = tiles.has(key) && tiles.get(key)!.length > 0;

        if (hasTiles) {
          totalHexes++;
          // Check if connected to neighbors
          const neighbors = [
            [q + 1, r], [q - 1, r],
            [q, r + 1], [q, r - 1],
            [q + 1, r - 1], [q - 1, r + 1]
          ];

          let connectedNeighbors = 0;
          for (const [nq, nr] of neighbors) {
            const nkey = getKey(nq, nr);
            if (tiles.has(nkey) && tiles.get(nkey)!.length > 0) {
              connectedNeighbors++;
            }
          }

          if (connectedNeighbors > 0) connectedHexes++;
        }
      }
    }

    return totalHexes > 0 ? connectedHexes / totalHexes : 0;
  }

  // Generate smart recommendations
  private generateRecommendations(
    terrainType: string,
    assetDensity: number,
    heightVariance: number,
    connectivity: number
  ): string[] {
    const recommendations: string[] = [];

    if (assetDensity < 0.1) {
      recommendations.push("Consider adding more assets to populate the terrain");
    } else if (assetDensity > 0.5) {
      recommendations.push("Terrain seems crowded - consider reducing asset density");
    }

    if (connectivity < 0.3) {
      recommendations.push("Terrain connectivity is low - consider filling gaps for better playability");
    }

    if (terrainType === 'flat' && heightVariance < 10) {
      recommendations.push("Flat terrain detected - consider adding height variation for visual interest");
    }

    if (terrainType === 'mountainous') {
      recommendations.push("Mountainous terrain suits strategic gameplay - consider adding defensive positions");
    }

    return recommendations;
  }

  // Generate smart placement suggestions
  generatePlacementSuggestions(
    tiles: Map<string, Tile[]>,
    assets: Map<string, PlacedAsset>,
    cursorQ: number,
    cursorR: number
  ): PlacementSuggestion[] {
    const suggestions: PlacementSuggestion[] = [];
    const analysis = this.analyzeTerrain(tiles, assets, cursorQ, cursorR, 3);

    // Analyze nearby area for context
    const nearbyAssets: PlacedAsset[] = [];
    const nearbyTiles: Array<{ q: number, r: number, height: number }> = [];

    for (let dq = -2; dq <= 2; dq++) {
      for (let dr = -2; dr <= 2; dr++) {
        const q = cursorQ + dq;
        const r = cursorR + dr;
        const key = getKey(q, r);

        const tileStack = tiles.get(key);
        if (tileStack && tileStack.length > 0) {
          const height = tileStack.reduce((sum, tile) => sum + tile.height, 0);
          nearbyTiles.push({ q, r, height });
        }

        const asset = Array.from(assets.values()).find(a => a.q === q && a.r === r);
        if (asset) nearbyAssets.push(asset);
      }
    }

    // Suggest based on terrain type and nearby assets
    const avgHeight = nearbyTiles.reduce((sum, tile) => sum + tile.height, 0) / nearbyTiles.length;

    if (analysis.terrainType === 'mountainous' && avgHeight > 15) {
      suggestions.push({
        q: cursorQ,
        r: cursorR,
        assetType: 'rock_large',
        confidence: 0.8,
        reason: "High elevation suits large rock formations"
      });
    }

    if (nearbyAssets.some(a => a.type.startsWith('tree_'))) {
      suggestions.push({
        q: cursorQ,
        r: cursorR,
        assetType: 'scatter_grass',
        confidence: 0.6,
        reason: "Near trees - good spot for ground cover"
      });
    }

    if (analysis.assetDensity < 0.2) {
      const randomTree = ASSET_CATALOG.find(a => a.category === 'Trees');
      if (randomTree) {
        suggestions.push({
          q: cursorQ,
          r: cursorR,
          assetType: randomTree.id,
          confidence: 0.5,
          reason: "Area could benefit from vegetation"
        });
      }
    }

    return suggestions.slice(0, 3); // Limit to top 3 suggestions
  }
}

// Export singleton instance
export const terrainAI = new TerrainAI();
