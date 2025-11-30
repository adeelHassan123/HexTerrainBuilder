export const HEX_SIZE = 1;

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
