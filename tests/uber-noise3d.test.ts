type Vec3 = [number, number, number];

function sub(a: Vec3, b: Vec3): Vec3 {
  return [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
}

function cross(a: Vec3, b: Vec3): Vec3 {
  return [
    a[1] * b[2] - a[2] * b[1],
    a[2] * b[0] - a[0] * b[2],
    a[0] * b[1] - a[1] * b[0],
  ];
}

function length(v: Vec3): number {
  return Math.sqrt(v[0] * v[0] + v[1] * v[1] + v[2] * v[2]);
}

function normalize(v: Vec3): Vec3 {
  const len = length(v);
  if (len === 0) return [0, 0, 0]; // degenerate triangle
  return [v[0] / len, v[1] / len, v[2] / len];
}

function fmt(n: number): string {
  // STL accepts floats; keep it compact but stable.
  // 6 decimals is usually plenty for many meshes.
  return Number.isFinite(n) ? n.toFixed(6) : '0.000000';
}

function sanitizeName(name: string): string {
  // STL "solid name" is usually a single line; avoid newlines/tabs.
  return name.replace(/[\r\n\t]/g, ' ').trim() || 'mesh';
}

/**
 * Convert a triangle mesh (every 3 vertices = 1 triangle) to an ASCII STL string.
 * @param vertices - flat list of vertices; vertices.length must be a multiple of 3
 * @param solidName - name in the STL header/footer
 */
export function meshToAsciiStl(vertices: Vec3[], solidName = 'mesh'): string {
  if (vertices.length % 3 !== 0) {
    throw new Error(
      `vertices.length must be a multiple of 3 (got ${vertices.length}).`,
    );
  }

  const lines: string[] = [];
  lines.push(`solid ${sanitizeName(solidName)}`);

  for (let i = 0; i < vertices.length; i += 3) {
    const a = vertices[i];
    const b = vertices[i + 1];
    const c = vertices[i + 2];

    const n = normalize(cross(sub(b, a), sub(c, a))); // right-hand rule

    lines.push(
      `  facet normal ${fmt(n[0])} ${fmt(n[1])} ${fmt(n[2])}`,
      `    outer loop`,
      `      vertex ${fmt(a[0])} ${fmt(a[1])} ${fmt(a[2])}`,
      `      vertex ${fmt(b[0])} ${fmt(b[1])} ${fmt(b[2])}`,
      `      vertex ${fmt(c[0])} ${fmt(c[1])} ${fmt(c[2])}`,
      `    endloop`,
      `  endfacet`,
    );
  }

  lines.push(`endsolid ${sanitizeName(solidName)}`);
  return lines.join('\n');
}

import { test, expect } from 'bun:test';
import { UberNoise } from '../src/uber-noise';
import * as fs from 'fs';

test('Test 3D terrain generation', () => {
  const noise = new UberNoise({
    seed: 12345,
    scale: 0.1,
    max: 0.1,
    octaves: 4,
  });

  let size = 10;
  const cellSize = 0.1;

  let mesh = [];
  for (let x = 0; x < size; x += cellSize) {
    for (let y = 0; y < size; y += cellSize) {
      const pointA = [x, y, noise.get(x, y) * 5];
      const pointB = [x + cellSize, y, noise.get(x + cellSize, y) * 5];
      const pointC = [x, y + cellSize, noise.get(x, y + cellSize) * 5];
      const pointD = [
        x + cellSize,
        y + cellSize,
        noise.get(x + cellSize, y + cellSize) * 5,
      ];

      // two triangles per cell
      // triangle 1: A, B, C
      // triangle 2: B, D, C
      const verts: number[][] = [
        pointA,
        pointB,
        pointC,
        pointB,
        pointD,
        pointC,
      ];
      mesh.push(...verts);
    }
  }
  const stl = meshToAsciiStl(
    mesh as [number, number, number][],
    'two_triangles',
  );

  // write stl string to file for manual inspection
  fs.writeFileSync('two_triangles.stl', stl);
});
