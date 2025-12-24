## uber-noise

advanced noise generation for the browser and node.js

- written in typescript
- seeded noise
- based on simplex noise (2D, 3D and 4D)
- fractal brownian motion (fbm)
- custom gain, lacunarity, scale, shift, power
- billowed, ridged, warped, stepped noise
- seamless tiling noise (1D and 2D)
- most options can be set to own noise instance

## Install

### Use in the browser

Add the following to your html's file `<head>`

```html
<script
  src="https://unpkg.com/uber-noise@0.3.0/dist/uber-noise.umd.js"
></script>
```

### Install as npm package

```bash
npm i uber-noise
```

```javascript
import { UberNoise } from "uber-noise";
```

## Usage

### Basic

### Get noise value

```javascript
const noise = new UberNoise();

// get noise value at x, y, z
const value = noise.get(x, y, z);
// OR
const value = noise.get({x, y, z});
```

### Set noise options

```javascript
// simple fbm noise
const noise = new UberNoise({
  scale: 0.01,
  octaves: 4,
  gain: 0.5,
  lacunarity: 2.0,
});
```

### Set noise options to noise instance

```javascript
const noise = new UberNoise({
  // this will set the scale to a noise instance returning values between 0.01 and 0.1
  scale: { min: 0.01, max: 0.1, scale: 0.01 },
});
```

### All options

| Option        | Type                             | Default Value     | Description                                        |
|---------------|----------------------------------|-------------------|----------------------------------------------------|
| `seed`        | `string \| number`               | `Math.random()`   | Seed for the noise, defaults to a random value.    |
| `min`         | `number \| UberNoise \| NoiseOptions` | `-1`            | Minimum value of noise.                            |
| `max`         | `number \| UberNoise \| NoiseOptions` | `1`             | Maximum value of noise.                            |
| `scale`       | `number \| UberNoise \| NoiseOptions` | `1`             | Scale of the noise ("zoom" level).                 |
| `power`       | `number \| UberNoise \| NoiseOptions` | `1`             | Power of the noise (1 = linear, 2 = quadratic).    |
| `shift`       | `number[]`                       | `[0, 0, 0, 0]`    | Move noise in 2D, 3D, or 4D space.                 |
| `octaves`     | `number`                         | `0`               | Number of layers for fbm noise.                    |
| `gain`        | `number \| UberNoise \| NoiseOptions` | `0.5`           | Amplitude multiplier per fbm layer.                |
| `lacunarity`  | `number \| UberNoise \| NoiseOptions` | `2`             | Scale multiplier per fbm layer.                    |
| `amps`        | `number[]`                       | `[]`              | Array of custom amplitudes for each fbm layer.            |
| `layers`      | `NoiseOptions[]`                 | `[]`              | Custom noise options for each fbm layer.           |
| `sharpness`   | `number \| UberNoise \| NoiseOptions` | `0`             | Sharpness of noise (0 = normal, 1 = billowed, -1 = ridged). |
| `steps`       | `number \| UberNoise \| NoiseOptions` | `0`             | Discretizes the noise into steps.                  |
| `warp`        | `number \| UberNoise \| NoiseOptions` | `0`             | Amount to warp the noise.                          |
| `warpNoise`   | `UberNoise`                      | `undefined`       | Custom noise used to warp the noise.               |
| `warp2`       | `number \| UberNoise \| NoiseOptions` | `0`             | Second level of warping, only used if `warp` is used too.    |
| `warpNoise2`  | `UberNoise`                      | `undefined`       | Second custom noise for additional warping.        |
| `invert`      | `boolean`                        | `false`           | Invert the noise output.                           |
| `abs`         | `boolean`                        | `false`           | Take the absolute value of the noise.              |
| `clamp`       | `boolean`                        | `false`           | Clamp the noise between min and max values (otherwise noise might overflow slightly).        |
| `tileX`       | `boolean`                        | `false`           | Tile the noise in the x direction.                 |
| `tileY`       | `boolean`                        | `false`           | Tile the noise in the y direction.                 |
| `tile`        | `boolean`                        | `false`           | Tile the noise in x and y directions (overwrites `tileX` and `tileY`)                 |

