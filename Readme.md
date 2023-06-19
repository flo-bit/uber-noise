## uber-noise

advanced noise generation for the browser and node.js

> :warning: **Work in progress. Expect breaking changes!**

## Install

### Node.js

add uber-noise to your project and import/require it

```bash
npm i uber-noise
```

```javascript
const UberNoise = require("uber-noise");
// OR
import UberNoise from "uber-noise";
```

### Browser

add script tag to your html and use the global class variable `UberNoise`

```html
<script src="https://cdn.jsdelivr.net/npm/uber-noise@0.1.6"></script>
```

```javascript
const noise = new UberNoise();

const value = noise.get(x, y);
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
  scale: { min: 0.01, max: 0.1, scale: 0.01 }, // this will set the scale to a noise instance returning values between 0.01 and 0.1
});
```

## Examples

### simple 1D noise with p5.js

[see it live here](https://flo-bit.github.io/uber-noise/examples/1D/p5-simple-1D-noise.html)

```html
<script src="https://cdn.jsdelivr.net/npm/uber-noise@0.1.6"></script>
```

```javascript
// creating noise in setup()
noise = new UberNoise({ scale: 0.005 });
```

```javascript
// using noise in draw()
for (let x = 0; x < width; x += stepSize) {
  let v = noise.get(x + counter);
  // ... use v to draw something
}
```
