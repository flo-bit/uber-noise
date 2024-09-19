import { run, bench, group, baseline } from 'mitata';
import UberNoise from './src/uber-noise';
import { createNoise2D, createNoise3D, createNoise4D } from 'simplex-noise';

const baseNoise2D = createNoise2D();
const baseNoise3D = createNoise3D();
const baseNoise4D = createNoise4D();

bench('base-noise-2d', () => {
  return baseNoise2D(0.5, 0.5);
});
bench('base-noise-3d', () => {
  return baseNoise3D(0.5, 0.5, 0.5);
});
bench('base-noise-4d', () => {
  return baseNoise4D(0.5, 0.5, 0.5, 0.5);
});

const simpleNoise = new UberNoise({
  seed: 12345,
});
const mediumComplex = new UberNoise({
  seed: 12345,
  steps: 5,
  octaves: 10,
  power: 2,
  warp: 2,
});
const complexNoise = new UberNoise({
  seed: 12345,
  steps: 10,
  octaves: 10,
  gain: 0.5,

  power: {
    max: 1,
    min: 2,
  },

  warp: 2,
  warp2: 1,
  sharpness: 1,

  min: {
    max: -0.5,
    min: -1,
    steps: 2,
  },
  tileX: true,
});

bench('simple-noise-2d', () => {
  return simpleNoise.get(0.5, 0.5);
});
bench('simple-noise-3d', () => {
  return simpleNoise.get(0.5, 0.5, 0.5);
});
bench('simple-noise-4d', () => {
  return simpleNoise.get(0.5, 0.5, 0.5, 0.5);
});
bench('medium-complex-noise-2d', () => {
  return mediumComplex.get(0.5, 0.5);
});
bench('medium-complex-noise-3d', () => {
  return mediumComplex.get(0.5, 0.5, 0.5);
});
bench('medium-complex-noise-4d', () => {
  return mediumComplex.get(0.5, 0.5, 0.5, 0.5);
});
bench('complex-noise-2d', () => {
  return complexNoise.get(0.5, 0.5);
});
bench('complex-noise-3d', () => {
  return complexNoise.get(0.5, 0.5, 0.5);
});
bench('complex-noise-4d', () => {
  return complexNoise.get(0.5, 0.5, 0.5, 0.5);
});

await run({
  percentiles: false,
});
