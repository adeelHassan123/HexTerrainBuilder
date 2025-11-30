// Real-world scale: 1 unit in Three.js = 1 cm in real world
// Hex size: Balanced for performance and precision
// Reducing total hex count while maintaining usable snapping
export const HEX_SIZE = 1.5; // Radius (center to vertex) - sweet spot for performance
export const HEX_FLAT_TO_FLAT = HEX_SIZE * Math.sqrt(3); // ≈ 2.6cm
export const HEX_POINT_TO_POINT = HEX_SIZE * 2; // = 3cm

export interface Axial {
  q: number;
  r: number;
}

export interface Cube {
  q: number;
  r: number;
  s: number;
}

export const axialToCube = (q: number, r: number): Cube => {
  return { q, r, s: -q - r };
};

export const cubeToAxial = (q: number, r: number, _s: number): Axial => {
  return { q, r };
};

export const axialToWorld = (q: number, r: number, height = 0): [number, number, number] => {
  const x = HEX_SIZE * (Math.sqrt(3) * q + Math.sqrt(3) / 2 * r);
  const z = HEX_SIZE * (3 / 2 * r);
  const y = height * 0.5; // HEIGHT_UNIT = 0.5 (1cm real-world = 0.5 Three.js units)
  return [x, y, z];
};

export const worldToAxial = (x: number, z: number): Axial => {
  const q = (Math.sqrt(3) / 3 * x - 1 / 3 * z) / HEX_SIZE;
  const r = (2 / 3 * z) / HEX_SIZE;
  return hexRound(q, r);
};

export const hexRound = (q: number, r: number): Axial => {
  let cubeQ = q;
  let cubeR = r;
  let cubeS = -q - r;

  let rx = Math.round(cubeQ);
  let ry = Math.round(cubeR);
  let rz = Math.round(cubeS);

  const x_diff = Math.abs(rx - cubeQ);
  const y_diff = Math.abs(ry - cubeR);
  const z_diff = Math.abs(rz - cubeS);

  if (x_diff > y_diff && x_diff > z_diff) {
    rx = -ry - rz;
  } else if (y_diff > z_diff) {
    ry = -rx - rz;
  } else {
    rz = -rx - ry;
  }

  return { q: rx, r: ry };
};

export const getHexNeighbors = (q: number, r: number): Axial[] => {
  const directions = [
    { q: 1, r: 0 }, { q: 1, r: -1 }, { q: 0, r: -1 },
    { q: -1, r: 0 }, { q: -1, r: 1 }, { q: 0, r: 1 }
  ];
  return directions.map(d => ({ q: q + d.q, r: r + d.r }));
};

export const getKey = (q: number, r: number) => `${q},${r}`;

/**
 * Get the 6 corner points of a hexagon in world space
 * Returns array of [x, z] coordinates (y is not included as it's flat)
 */
export const getHexCorners = (q: number, r: number): [number, number][] => {
  const [centerX, , centerZ] = axialToWorld(q, r, 0);
  const corners: [number, number][] = [];

  for (let i = 0; i < 6; i++) {
    const angle = (Math.PI / 3) * i; // 60 degrees per corner
    const x = centerX + HEX_SIZE * Math.cos(angle);
    const z = centerZ + HEX_SIZE * Math.sin(angle);
    corners.push([x, z]);
  }

  return corners;
};

/**
 * Generate all valid hex coordinates for a table of given dimensions
 * Uses rectangular boundary approximation for performance
 */
export const getHexGridForTable = (widthCm: number, heightCm: number): Axial[] => {
  const hexes: Axial[] = [];

  // Calculate how many hexes fit in each direction
  const hexWidth = HEX_SIZE * Math.sqrt(3); // Width of a hex (flat-to-flat)
  const hexHeight = HEX_SIZE * 1.5; // Height between rows

  // Calculate range of q and r coordinates
  const maxQ = Math.ceil(widthCm / hexWidth);
  const maxR = Math.ceil(heightCm / hexHeight);

  // Generate all hexes within rectangular bounds
  for (let r = -maxR; r <= maxR; r++) {
    for (let q = -maxQ; q <= maxQ; q++) {
      if (isHexInBounds(q, r, widthCm, heightCm)) {
        hexes.push({ q, r });
      }
    }
  }

  return hexes;
};

/**
 * Check if a hex is within the rectangular table bounds
 * Uses world position to check against table dimensions
 */
export const isHexInBounds = (q: number, r: number, widthCm: number, heightCm: number): boolean => {
  const [x, , z] = axialToWorld(q, r, 0);

  // Check if hex center is within table bounds (with small margin)
  const halfWidth = widthCm / 2;
  const halfHeight = heightCm / 2;

  return Math.abs(x) <= halfWidth && Math.abs(z) <= halfHeight;
};

/**
 * Get the actual world position of a hex center including height
 */
export const getHexCenterWorld = (q: number, r: number, heightAbove = 0): [number, number, number] => {
  return axialToWorld(q, r, heightAbove);
};
