## 1D Examples

### simple 1D noise with p5.js

[see it live here](https://flo-bit.github.io/uber-noise/examples/1D/p5-simple-1D-noise.html)

```html
<script src="https://cdn.jsdelivr.net/npm/uber-noise@0.1.8"></script>
```

```javascript
// creating noise in setup()
noise = new UberNoise({ scale: 0.005 });

// using noise in draw()
for (let x = 0; x < width; x += stepSize) {
  let v = noise.get(x + counter);
  // ... use v to draw something
}
```

### billowed and ridged 1D noise with p5.js

[see it live here](https://flo-bit.github.io/uber-noise/examples/1D/p5-billowed-rigded-1D-noise.html)

```javascript
noise = new UberNoise({
  scale: 0.005,
  sharpness: 0.5, // -1 to 0 for billowed noise, 0 to 1 for ridged noise
});
```

### fbm noise with p5.js

[see it live here](https://flo-bit.github.io/uber-noise/examples/1D/p5-fbm-1D-noise.html)

```javascript
noise = new UberNoise({
  scale: 0.005,
  octaves: 4, // number of noise layers
  gain: 0.5, // amplitude multiplier for each layer
  lacunarity: 2.0, // scale multiplier for each layer
});
```

### warped noise with p5.js

[see it live here](https://flo-bit.github.io/uber-noise/examples/1D/p5-warped-1D-noise.html)

```javascript
noise = new UberNoise({
  scale: 0.005,
  warp: 0.5, // warp factor
  warpNoise: { scale: 0.005 }, // optional noise instance for warping
});
```

### tiled noise with p5.js

[see it live here](https://flo-bit.github.io/uber-noise/examples/1D/p5-tileable-1D-noise.html)

```javascript
noise = new UberNoise({
  scale: 0.005,
  tileX: true, // tile noise in x direction
});

// get noise value between 0 and 1 for tileable noise
let steps = 100;
for (let x = 0; x < steps; x++) {
  let v = noise.get(x / steps);
  // ... use v to draw something
}
```

## 2D Examples

### simple 2D noise with p5.js

## 3D Examples
