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

  expect(value1).toBeCloseTo(value2, 5);
  expect(value1).toBeCloseTo(value3, 5);
  expect(value1).toBeCloseTo(value4, 5);
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
  const noise = new UberNoise({ seed: 12345, octaves: 1 });

  const value = noise.get(0.5, 0.5);
  noise.move(1, 1);
  const secondValue = noise.get(-0.5, -0.5);

  expect(value).toBeCloseTo(secondValue);
});
