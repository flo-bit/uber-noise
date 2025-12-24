import {
  type NoiseDerivFunction2D,
  type NoiseDerivFunction3D,
  type NoiseDerivFunction4D,
  NoiseFunction2D,
  NoiseFunction3D,
  NoiseFunction4D,
  createNoise2DWithDerivatives,
  createNoise3DWithDerivatives,
  createNoise4DWithDerivatives,
  createNoise2D,
  createNoise3D,
  createNoise4D,
} from './simplex-noise/simplex-noise';

import { aleaFactory } from './alea/alea';

function lerp(a: number, b: number, t: number): number {
  return (b - a) * t + a;
}

type VectorLikeObject = {
  x: number;
  y: number;
  z?: number;
  w?: number;
};

type NoiseParameter = number | UberNoise;

type NoiseOptions = {
  /**
   * seed for the noise, if not provided, Math.random() will be used,
   *
   * @default Math.random()
   */
  seed?: string | number;

  /**
   * minimun value of noise
   *
   * @default -1
   */
  min?: number | UberNoise | NoiseOptions;

  /**
   * maximum value of noise
   *
   * @default 1
   */
  max?: number | UberNoise | NoiseOptions;

  /**
   * scale of the noise ("zoom" in or out)
   *
   * @default 1
   */
  scale?: number | UberNoise | NoiseOptions;

  /**
   * power of the noise (1 = linear, 2 = quadratic, etc)
   *
   * @default 1
   */
  power?: number | UberNoise | NoiseOptions;

  /**
   * move noise in 2D, 3D or 4D space
   *
   * @default [0, 0, 0, 0]
   */
  shift?: number[];

  /**
   * number of layers for fbm noise
   *
   * @default 0
   */
  octaves?: number;

  /**
   * how much to multiply amplitude per fbm layer
   *
   * @default 0.5
   */
  gain?: number | UberNoise | NoiseOptions;

  /**
   * how much to multiply scale per fbm layer
   *
   * @default 2
   */
  lacunarity?: number | UberNoise | NoiseOptions;

  /**
   * array of amplitudes for each fbm layer
   *
   * @default []
   */
  amps?: number[];

  /**
   * custom noise options for each fbm layer
   *
   * @default []
   */
  layers?: NoiseOptions[];

  /**
   * billowed or rigded noise (0 = normal, 1 = billowed, -1 = ridged)
   *
   * @default 0
   */
  sharpness?: number | UberNoise | NoiseOptions;

  /**
   * will turn noise into discrete steps (integer, number of steps)
   *
   * @default 0
   */
  steps?: number | UberNoise | NoiseOptions;

  /**
   * how much to warp the noise
   *
   * @default 0
   */
  warp?: number | UberNoise | NoiseOptions;

  /**
   * custom noise to warp the noise with
   *
   * @default undefined
   */
  warpNoise?: UberNoise;

  /**
   * second warp, can only be used if warp is used too
   *
   * @default 0
   */
  warp2?: number | UberNoise | NoiseOptions;
  /**
   * second warp noise
   *
   * @default undefined
   */
  warpNoise2?: UberNoise;

  /**
   * should the noise be inverted
   *
   * @default false
   */
  invert?: boolean;

  /**
   * should we take the absolute value of the noise
   *
   * @default false
   */
  abs?: boolean;

  /**
   * should we clamp the noise between min and max
   *
   * @default false
   */
  clamp?: boolean;

  /**
   * tile the noise in x direction
   *
   * @default false
   */
  tileX?: boolean;
  /**
   * tile the noise in y direction
   *
   * @default false
   */
  tileY?: boolean;
  /**
   * tile the noise in all directions (will override tileX and tileY)
   *
   * @default false
   */
  tile?: boolean;

  /**
   * generate noise with derivatives
   *
   * @default false
   */
  withDerivatives?: boolean;
};

class UberNoise {
  private noise2D?: NoiseDerivFunction2D | NoiseFunction2D;
  private noise3D?: NoiseDerivFunction3D | NoiseFunction3D;
  private noise4D?: NoiseDerivFunction4D | NoiseFunction4D;
  private seed: string | number;

  private _min: NoiseParameter = -1;
  private _max: NoiseParameter = 1;

  private _scale: NoiseParameter = 1;
  private _power: NoiseParameter = 1;

  private shift: VectorLikeObject = {
    x: 0,
    y: 0,
  };

  private octaves = 0;
  private _gain: NoiseParameter = 0.5;
  private _lacunarity: NoiseParameter = 2;

  private amps: number[] = [];

  private _sharpness: NoiseParameter = 0;
  private _steps: NoiseParameter = 0;

  private _warp: NoiseParameter = 0;
  private _warpNoise?: UberNoise;
  private _warp2: NoiseParameter = 0;
  private _warpNoise2?: UberNoise;

  private tileX = false;
  private tileY = false;

  private position: VectorLikeObject = {
    x: 0,
    y: 0,
  };

  private pngr;

  private layers: UberNoise[] = [];

  constructor(options: NoiseOptions = {}) {
    this.seed = options.seed ?? Math.random();
    this.pngr = aleaFactory(this.seed).random;

    this.min = options.min ?? -1;
    this.max = options.max ?? 1;

    this.scale = options.scale ?? 1;
    this.power = options.power ?? 1;

    this.octaves = options.octaves ?? options.layers?.length ?? 0;
    this.gain = options.gain ?? 0.5;
    this.lacunarity = options.lacunarity ?? 2;

    this.sharpness = options.sharpness ?? 0;
    this.steps = options.steps ?? 0;

    this.warp = options.warp ?? 0;
    this.warpNoise = options.warpNoise;
    this.warp2 = options.warp2 ?? 0;
    this.warpNoise2 = options.warpNoise2;

    this.amps = options.amps ?? [];

    this.tileX = options.tileX ?? options.tile ?? false;
    this.tileY = options.tileY ?? options.tile ?? false;

    this.createLayers(options);
  }

  private createLayers(options: NoiseOptions) {
    // process layers
    for (let i = 0; i < this.octaves; i++) {
      const layerOptions = options.layers?.[i] ?? {};
      if (layerOptions instanceof UberNoise) {
        this.layers[i] = layerOptions;
        continue;
      }

      if (layerOptions.seed === undefined) layerOptions.seed = this.pngr();
      this.layers[i] = new UberNoise(layerOptions);
    }
    if (this.layers.length == 0) {
      if (options.withDerivatives) {
        this.noise2D = createNoise2DWithDerivatives(this.pngr);
        this.noise3D = createNoise3DWithDerivatives(this.pngr);
        this.noise4D = createNoise4DWithDerivatives(this.pngr);
      } else {
        this.noise2D = createNoise2D(this.pngr);
        this.noise3D = createNoise3D(this.pngr);
        this.noise4D = createNoise4D(this.pngr);
      }
    }
  }

  private warpPosition(warp: number, warpNoise: UberNoise | undefined) {
    if (warp == undefined || warp == 0) return;

    if (warpNoise != undefined) warpNoise.position = this.position;

    let x = this.position.x,
      y = this.position.y,
      z = this.position.z,
      w = this.position.w;

    const noise = warpNoise ?? this;
    const scl = this.scale;

    // move some amount so that we don't sample the same point as the original noise
    this.position.x = x + 54.47 * scl;
    this.position.y = y - 34.98 * scl;
    if (z != undefined) this.position.z = z + 21.63 * scl;
    if (w != undefined) this.position.w = w - 67.1 * scl;

    x += noise.getFBM() * warp;
    y += noise.getFBM() * warp;
    if (z != undefined) z += noise.getFBM() * warp;
    if (w != undefined) w += noise.getFBM() * warp;

    this.position.x = x;
    this.position.y = y;
    this.position.z = z;
    this.position.w = w;
  }

  private tilePosition() {
    if (!this.tileX && !this.tileY) return;
    const x = this.position.x;
    const y = this.position.y;
    let newX = 0,
      newY = 0,
      newZ = 0,
      newW = 0;
    if (this.tileX) {
      newX = Math.sin(x * Math.PI * 2);
      newY = Math.cos(x * Math.PI * 2);
    }
    if (this.tileY) {
      newZ = Math.sin(y * Math.PI * 2);
      newW = Math.cos(y * Math.PI * 2);
    }
    if (this.tileX && !this.tileY) {
      this.position.x = newX;
      this.position.y = newY + y;
    } else if (this.tileY && !this.tileX) {
      this.position.x = newZ + x;
      this.position.y = newW;
    } else if (this.tileX && this.tileY) {
      this.position.x = newX;
      this.position.y = newY;
      this.position.z = newZ;
      this.position.w = newW;
    }
  }

  private getNoiseValue(
    dimension: 2 | 3 | 4,
    x: number,
    y: number,
    z?: number,
    w?: number,
  ): number {
    if (dimension === 2 && this.noise2D != undefined) {
      const result = this.noise2D(x, y);
      return typeof result === 'number' ? result : result.value;
    } else if (dimension === 3 && this.noise3D != undefined) {
      const result = this.noise3D(x, y, z!);
      return typeof result === 'number' ? result : result.value;
    } else if (dimension === 4 && this.noise4D != undefined) {
      const result = this.noise4D(x, y, z!, w!);
      return typeof result === 'number' ? result : result.value;
    }
    return 0;
  }

  private getFBM(): number {
    const x = this.position.x,
      y = this.position.y,
      z = this.position.z,
      w = this.position.w;

    const scale = this.scale;

    if (this.layers.length == 0) {
      if (z != undefined && w != undefined && this.noise4D != undefined) {
        return this.getNoiseValue(
          4,
          x * scale,
          y * scale,
          z * scale,
          w * scale,
        );
      }
      if (z != undefined && this.noise3D != undefined) {
        return this.getNoiseValue(3, x * scale, y * scale, z * scale);
      }
      if (this.noise2D != undefined) {
        return this.getNoiseValue(2, x * scale, y * scale);
      }
      return 0;
    }

    let maxAmp = 1;
    let amp = 1,
      freq = scale;

    const lacunarity = this.lacunarity;
    const gain = this.gain;

    let n = 0;

    for (let i = 0; i < this.octaves; i++) {
      const layer = this.layers[i];

      const layerAmp = this.amps[i] ?? 1;

      const value =
        layer.get(
          x * freq,
          y * freq,
          z != undefined ? z * freq : undefined,
          w != undefined ? w * freq : undefined,
        ) *
        amp *
        layerAmp;
      n += value;

      amp *= gain;
      freq *= lacunarity;
      maxAmp += amp * layerAmp;
    }
    return n / maxAmp;
  }

  private applyShift() {
    const shift = this.shift;
    if (shift !== undefined) {
      this.position.x += shift.x;
      this.position.y += shift.y;
      if (this.position.z) this.position.z += shift.z ?? 0;
      if (this.position.w) this.position.w += shift.w ?? 0;
    }
  }

  private applyPower(norm: number) {
    const power = this.power;
    if (power != 1) {
      // convert to [0 - 1], apply power and back to [-1, 1]
      norm = (Math.pow((norm + 1) * 0.5, power) - 0.5) * 2;
    }
    return norm;
  }

  private applySharpness(norm: number) {
    const sharpness = this.sharpness;
    if (sharpness != 0) {
      const billow = (Math.abs(norm) - 0.5) * 2;
      const ridged = (0.5 - Math.abs(norm)) * 2;

      norm = lerp(norm, billow, Math.max(0, sharpness));
      norm = lerp(norm, ridged, Math.max(0, -sharpness));
    }
    return norm;
  }

  private applySteps(norm: number) {
    const steps = this.steps;
    if (steps != 0) {
      // convert from -1 to 1 to 0 to 1
      norm = (norm + 1) * 0.5;
      // apply steps
      norm = Math.floor(norm * steps) / steps;
      // convert back to -1 to 1
      norm = norm * 2 - 1;
    }
    return norm;
  }

  private getNoise(
    x: number,
    y: number,
    z: number | undefined = undefined,
    w: number | undefined = undefined,
  ): number {
    // set position
    this.position.x = x;
    this.position.y = y;
    this.position.z = z;
    this.position.w = w;

    // apply shift
    this.applyShift();

    // apply tiling
    this.tilePosition();

    // apply warp
    this.warpPosition(this.warp, this.warpNoise);
    this.warpPosition(this.warp2, this.warpNoise2);

    let norm = this.getFBM();

    // apply power
    norm = this.applyPower(norm);

    // apply sharpness
    norm = this.applySharpness(norm);

    // apply steps
    norm = this.applySteps(norm);

    return norm;
  }

  /**
   * get noise value at position x, y, z, w
   *
   * all transformations will be applied to the noise (shift, warp, power, sharpness, steps, min, max, fmb, etc)
   *
   * either pass in
   * - x, y, z, w as separate arguments
   * - as first argument an object {x, y, z, w}
   * - as first argument an array [x, y, z, w]
   *
   * if y is not provided, it will be set to 0
   * if z is not provided, will use 2D noise
   * if w is not provided, will use 3D noise
   *
   * @param x {number | VectorLikeObject | Array<number>}
   * @param y {number | undefined}
   * @param z {number | undefined}
   * @param w {number | undefined}
   * @returns {number}
   */
  get(
    x: number | VectorLikeObject | Array<number>,
    y: number | undefined = undefined,
    z: number | undefined = undefined,
    w: number | undefined = undefined,
  ): number {
    const norm = this.normalized(x, y, z, w);
    return this.normalizedToMinMax(norm);
  }

  /**
   * get normalized noise value at position x, y, z, w
   *
   * all transformations will be applied to the noise (shift, warp, power, sharpness, steps, fmb, etc)
   * EXCEPT min and max, noise will be returned as a value between -1 and 1
   *
   * either pass in
   * - x, y, z, w as separate arguments
   * - as first argument an object {x, y, z, w}
   * - as first argument an array [x, y, z, w]
   *
   * if y is not provided, it will be set to 0
   * if z is not provided, will use 2D noise
   * if w is not provided, will use 3D noise
   *
   * @param x {number | VectorLikeObject | Array<number>}
   * @param y {number | undefined}
   * @param z {number | undefined}
   * @param w {number | undefined}
   * @returns {number}
   */
  normalized(
    x: number | VectorLikeObject | Array<number>,
    y: number | undefined = undefined,
    z: number | undefined = undefined,
    w: number | undefined = undefined,
  ): number {
    // if x is an array, treat it as a vector
    if (Array.isArray(x)) {
      w = x[3];
      z = x[2];
      y = x[1];
      x = x[0];
    } else if (typeof x === 'object') {
      w = x.w;
      z = x.z;
      y = x.y;
      x = x.x;
    }
    // if y is undefined, treat it as 2D noise with y = 0
    y = y ?? 0;

    return this.getNoise(x, y, z, w);
  }

  /**
   * convert value between min and max to normalized value between -1 and 1
   *
   * @param value {number}
   * @returns {number}
   */
  minMaxToNormalized(value: number): number {
    return ((value - this.min) / (this.max - this.min)) * 2 - 1;
  }

  /**
   * convert normlized value to value between min and max
   *
   * @param value {number}
   * @returns {number}
   */
  normalizedToMinMax(value: number): number {
    return (value + 1) * 0.5 * (this.max - this.min) + this.min;
  }

  /**
   *
   * shift the noise in 2D, 3D or 4D space, will be added to the position
   *
   * if called multiple times, the shifts will be added
   *
   * returns the UberNoise object for chaining
   *
   * @param x {number}
   * @param y {number}
   * @param z {number | undefined}
   * @param w {number | undefined}
   * @returns {UberNoise}
   */
  move(
    x: number,
    y: number,
    z: number | undefined = undefined,
    w: number | undefined = undefined,
  ) {
    if (!this.shift) {
      this.shift = { x, y, z, w };
      return;
    }

    this.shift.x += x;
    this.shift.y += y;
    if (z != undefined) {
      this.shift.z = (this.shift.z ?? 0) + z;
    }
    if (w != undefined) {
      this.shift.w = (this.shift.w ?? 0) + w;
    }

    return this;
  }

  private checkParameterInput(
    value: number | UberNoise | NoiseOptions,
  ): UberNoise | number {
    if (typeof value === 'object' && !(value instanceof UberNoise)) {
      if (value.seed === undefined) {
        value.seed = this.pngr();
      }
      value = new UberNoise(value);
    }
    return value;
  }

  private getParameter(value: NoiseParameter): number {
    if (typeof value === 'number') {
      return value;
    }
    return value.get(this.position);
  }

  // getter and setter for min and max
  get min(): number {
    return this.getParameter(this._min);
  }
  set min(value: number | UberNoise | NoiseOptions) {
    this._min = this.checkParameterInput(value);
  }
  get max(): number {
    return this.getParameter(this._max);
  }
  set max(value: number | UberNoise | NoiseOptions) {
    this._max = this.checkParameterInput(value);
  }

  // getter and setter for scale and power
  get scale(): number {
    return this.getParameter(this._scale);
  }
  set scale(value: number | UberNoise | NoiseOptions) {
    this._scale = this.checkParameterInput(value);
  }
  get power(): number {
    return this.getParameter(this._power);
  }
  set power(value: number | UberNoise | NoiseOptions) {
    this._power = this.checkParameterInput(value);
  }

  // getter and setter for gain and lacunarity
  get gain(): number {
    return this.getParameter(this._gain);
  }
  set gain(value: number | UberNoise | NoiseOptions) {
    this._gain = this.checkParameterInput(value);
  }
  get lacunarity(): number {
    return this.getParameter(this._lacunarity);
  }
  set lacunarity(value: number | UberNoise | NoiseOptions) {
    this._lacunarity = this.checkParameterInput(value);
  }

  get sharpness(): number {
    return this.getParameter(this._sharpness);
  }
  set sharpness(value: number | UberNoise | NoiseOptions) {
    this._sharpness = this.checkParameterInput(value);
  }
  get steps(): number {
    return Math.round(this.getParameter(this._steps));
  }
  set steps(value: number | UberNoise | NoiseOptions) {
    this._steps = this.checkParameterInput(value);
  }

  get warp(): number {
    return this.getParameter(this._warp);
  }
  set warp(value: number | UberNoise | NoiseOptions) {
    this._warp = this.checkParameterInput(value);
  }
  get warpNoise(): UberNoise | undefined {
    return this._warpNoise;
  }
  set warpNoise(value: UberNoise | NoiseOptions | undefined) {
    if (value == undefined) {
      this._warpNoise = undefined;
      return;
    }

    const processed = this.checkParameterInput(value);
    if (processed instanceof UberNoise) {
      this._warpNoise = processed;
    }
  }
  get warp2(): number {
    return this.getParameter(this._warp2);
  }
  set warp2(value: number | UberNoise | NoiseOptions) {
    this._warp2 = this.checkParameterInput(value);
  }
  get warpNoise2(): UberNoise | undefined {
    return this._warpNoise2;
  }
  set warpNoise2(value: UberNoise | NoiseOptions | undefined) {
    if (value == undefined) {
      this._warpNoise2 = undefined;
      return;
    }

    const processed = this.checkParameterInput(value);
    if (processed instanceof UberNoise) {
      this._warpNoise2 = processed;
    }
  }
}

if (!globalThis.UberNoise) {
  globalThis.UberNoise = UberNoise;
  globalThis.alea = aleaFactory;
}

declare global {
  var UberNoise: typeof import('./uber-noise').UberNoise;
  var alea: typeof import('./alea/alea').aleaFactory;
}

export {
  UberNoise,
  type NoiseOptions,
  type NoiseParameter,
  type VectorLikeObject as VectorObject,
  UberNoise as noise,
  aleaFactory as alea,
};