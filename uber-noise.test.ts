import { test, expect } from 'bun:test';
import UberNoise from './src/uber-noise';

test('Basic noise generation returns value within min and max', () => {
  const noise = new UberNoise({ seed: 12345 });
  const value = noise.get(0.5, 0.5);
  expect(value).toBeGreaterThanOrEqual(noise.min);
  expect(value).toBeLessThanOrEqual(noise.max);
});

test('Changing scale affects the noise output', () => {
  const noise1 = new UberNoise({ seed: 12345, scale: 1 });
  const noise2 = new UberNoise({ seed: 12345, scale: 10 });

  const value1 = noise1.get(0.5, 0.5);
  const value2 = noise2.get(0.5, 0.5);

  expect(value1).not.toEqual(value2);
});

test('Warping alters the noise output', () => {
  const baseNoise = new UberNoise({ seed: 12345 });
  const warpNoise = new UberNoise({ seed: 54321 });
  const noise = new UberNoise({ seed: 12345, warp: 0.5, warpNoise });

  const baseValue = baseNoise.get(0.5, 0.5);
  const warpedValue = noise.get(0.5, 0.5);

  expect(warpedValue).not.toEqual(baseValue);
});

test('Tiling produces seamless edges', () => {
  const size = 1;
  const noise = new UberNoise({ seed: 12345, tileX: true, tileY: true });

  const value1 = noise.get(0, 0);
  const value2 = noise.get(size, 0);
  const value3 = noise.get(0, size);
  const value4 = noise.get(size, size);

  const value5 = noise.get(size * 2, 0);
  const value6 = noise.get(0, size * 2);
  const value7 = noise.get(size * 2, size * 2);

  expect(value1).toBeCloseTo(value2, 5);
  expect(value1).toBeCloseTo(value3, 5);
  expect(value1).toBeCloseTo(value4, 5);

  expect(value1).toBeCloseTo(value5, 5);
  expect(value1).toBeCloseTo(value6, 5);
  expect(value1).toBeCloseTo(value7, 5);
});

test('Sharpness affects the noise output', () => {
  const noiseNormal = new UberNoise({ seed: 12345, sharpness: 0 });
  const noiseRidged = new UberNoise({ seed: 12345, sharpness: -1 });
  const noiseBillowed = new UberNoise({ seed: 12345, sharpness: 1 });

  const valueNormal = noiseNormal.get(0.5, 0.5);
  const valueRidged = noiseRidged.get(0.5, 0.5);
  const valueBillowed = noiseBillowed.get(0.5, 0.5);

  expect(valueNormal).not.toEqual(valueRidged);
  expect(valueNormal).not.toEqual(valueBillowed);
  expect(valueRidged).not.toEqual(valueBillowed);
});

test('Steps parameter quantizes the noise output', () => {
  const noise = new UberNoise({ seed: 12345, steps: 5, scale: 0.1 });

  const values: number[] = [];
  for (let i = 0; i <= 100; i += 1) {
    values.push(noise.get(i, i));
  }

  const uniqueValues = new Set(values.map((v) => v.toFixed(5)));
  expect(uniqueValues.size).toBeLessThanOrEqual(5);
});

test('Multiple layers produce fractal noise', () => {
  const noiseSingleLayer = new UberNoise({ seed: 12345, octaves: 1 });
  const noiseMultipleLayers = new UberNoise({ seed: 12345, octaves: 5 });

  const valueSingle = noiseSingleLayer.get(0.5, 0.5);
  const valueMultiple = noiseMultipleLayers.get(0.5, 0.5);

  expect(valueSingle).not.toEqual(valueMultiple);
});

test('shifting the noise works', () => {
  const noise = new UberNoise({
    seed: 12345,
    octaves: 1,
  });

  const value = noise.get(0.5, 0.5);
  noise.move(1, 1);
  const secondValue = noise.get(-0.5, -0.5);

  expect(value).toBeCloseTo(secondValue);
});

test('min max to normalized', () => {
  const noise = new UberNoise({ seed: 12345, min: 0.2, max: 10.8 });

  const value = noise.get(0.5, 0.5);
  const normalized = noise.normalized(0.5, 0.5);

  const expected = noise.minMaxToNormalized(value);

  expect(normalized).toBeCloseTo(expected);
});

test('test values', () => {
  const noise = new UberNoise({
    seed: 12345,
    min: -0.2,
    max: 0.8,
    octaves: 5,
    lacunarity: 2.5,
    sharpness: 0.5,
    power: 2,
    shift: [1, 2, 3],
    scale: 2,
    steps: 200,
    warp: 2,
    invert: true,
    abs: true,
    clamp: true,
  });

  const expected = [
    [
      0.145, 0.28, 0.18, 0.175, 0.125, 0.155, 0.23, 0.245, 0.095, 0.135, 0.16,
      0.21, 0.225, 0.13, 0.26, 0.175, 0.235, 0.22, 0.145, 0.245,
    ],
    [
      0.165, 0.16, 0.25, 0.17, 0.24, 0.22, 0.185, 0.145, 0.255, 0.26, 0.19,
      0.225, 0.115, 0.16, 0.19, 0.155, 0.2, 0.19, 0.14, 0.12,
    ],
    [
      0.235, 0.2, 0.14, 0.18, 0.185, 0.14, 0.125, 0.145, 0.22, 0.17, 0.185,
      0.225, 0.2, 0.22, 0.175, 0.15, 0.135, 0.205, 0.17, 0.25,
    ],
    [
      0.05, 0.065, 0.235, 0.17, 0.225, 0.06, 0.16, 0.16, 0.13, 0.145, 0.205,
      0.16, 0.08, 0.11, 0.22, 0.085, 0.11, 0.22, 0.23, 0.18,
    ],
    [
      0.225, 0.14, 0.195, 0.075, 0.26, 0.25, 0.245, 0.145, 0.165, 0.09, 0.125,
      0.18, 0.165, 0.125, 0.075, 0.075, 0.235, 0.23, 0.21, 0.235,
    ],
    [
      0.145, 0.26, 0.225, 0.215, 0.23, 0.19, 0.175, 0.125, 0.245, 0.235, 0.11,
      0.245, 0.265, 0.28, 0.185, 0.245, 0.175, 0.09, 0.175, 0.11,
    ],
    [
      0.065, 0.115, 0.165, 0.055, 0.07, 0.08, 0.105, 0.24, 0.125, 0.11, 0.18,
      0.18, 0.185, 0.05, 0.135, 0.06, 0.23, 0.12, 0.22, 0.255,
    ],
    [
      0.215, 0.225, 0.24, 0.11, 0.15, 0.19, 0.2, 0.23, 0.185, 0.18, 0.155,
      0.175, 0.24, 0.085, 0.145, 0.165, 0.26, 0.115, 0.06, 0.18,
    ],
    [
      0.28, 0.225, 0.075, 0.25, 0.255, 0.1, 0.185, 0.24, 0.13, 0.16, 0.24, 0.24,
      0.225, 0.23, 0.15, 0.15, 0.225, 0.2, 0.125, 0.185,
    ],
    [
      0.23, 0.19, 0.21, 0.23, 0.19, 0.16, 0.21, 0.195, 0.19, 0.185, 0.225, 0.23,
      0.185, 0.2, 0.115, 0.08, 0.18, 0.165, 0.165, 0.215,
    ],
    [
      0.175, 0.23, 0.15, 0.18, 0.22, 0.14, 0.18, 0.145, 0.23, 0.145, 0.115,
      0.12, 0.225, 0.27, 0.155, 0.17, 0.075, 0.17, 0.12, 0.165,
    ],
    [
      0.235, 0.175, 0.205, 0.195, 0.155, 0.1, 0.16, 0.225, 0.25, 0.135, 0.175,
      0.2, 0.145, 0.13, 0.11, 0.1, 0.065, 0.165, 0.19, 0.245,
    ],
    [
      0.265, 0.275, 0.05, 0.235, 0.11, 0.14, 0.225, 0.185, 0.075, 0.1, 0.225,
      0.11, 0.19, 0.05, 0.21, 0.185, 0.285, 0.085, 0.245, 0.18,
    ],
    [
      0.125, 0.13, 0.06, 0.215, 0.23, 0.26, 0.23, 0.225, 0.14, 0.2, 0.155, 0.16,
      0.235, 0.16, 0.17, 0.11, 0.095, 0.165, 0.125, 0.175,
    ],
    [
      0.225, 0.25, 0.165, 0.105, 0.245, 0.23, 0.14, 0.235, 0.135, 0.205, 0.165,
      0.07, 0.115, 0.18, 0.24, 0.24, 0.155, 0.14, 0.18, 0.225,
    ],
    [
      0.195, 0.18, 0.16, 0.115, 0.09, 0.22, 0.12, 0.185, 0.16, 0.07, 0.18,
      0.205, 0.275, 0.135, 0.235, 0.095, 0.245, 0.21, 0.18, 0.05,
    ],
    [
      0.23, 0.165, 0.235, 0.14, 0.2, 0.25, 0.16, 0.06, 0.14, 0.145, 0.165, 0.07,
      0.085, 0.08, 0.255, 0.16, 0.2, 0.125, 0.15, 0.235,
    ],
    [
      0.21, 0.255, 0.105, 0.155, 0.175, 0.165, 0.235, 0.205, 0.085, 0.19, 0.055,
      0.12, 0.125, 0.12, 0.21, 0.19, 0.225, 0.095, 0.155, 0.21,
    ],
    [
      0.17, 0.22, 0.19, 0.19, 0.21, 0.24, 0.135, 0.2, 0.125, 0.19, 0.21, 0.165,
      0.235, 0.165, 0.125, 0.05, 0.085, 0.215, 0.225, 0.17,
    ],
    [
      0.21, 0.11, 0.11, 0.21, 0.15, 0.23, 0.245, 0.22, 0.17, 0.175, 0.19, 0.205,
      0.15, 0.225, 0.095, 0.115, 0.185, 0.17, 0.18, 0.095,
    ],
  ];

  let log = '[[';

  for (let i = 0; i < 20; i++) {
    for (let j = 0; j < 20; j++) {
      const value = noise.get(i, j);

      log += `${value.toFixed(5)},`;

      expect(value).toBeCloseTo(expected[i][j], 5);
    }

    log += '],[';
  }

  // console.log(log);
});
