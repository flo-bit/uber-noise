## uber-noise

advanced noise generation for the browser and node.js

## Install

```bash
npm i uber-noise
```

```javascript
import UberNoise from "uber-noise";
```

## Usage

### Basic

### Get noise value

```javascript
const noise = new UberNoise();

// get noise value at x,y
const value = noise.get(x, y);

// get noise value at x,y,z
const value = noise.get(x, y, z);

// get noise value at x,y,z,w
const value = noise.get(x, y, z, w);
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
