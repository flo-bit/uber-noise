import {
  type NoiseFunction2D,
  type NoiseFunction3D,
  type NoiseFunction4D,
  createNoise2D,
  createNoise3D,
  createNoise4D,
} from 'simplex-noise';

import alea from 'alea';

/**
 *
 * @property {number} seed - seed for the noise, if not provided, Math.random() will be used,
 * currently same results can only be guaranteed for newly created noise objects with same seed
 * (as opposed to an old noise object where you changed the seed)
 *
 * @property {number} min - minimun value of noise
 * @property {number} max - maximum value of noise
 *
 * @property {number} scale - scale of the noise
 * @property {number} power - power of the noise (1 = linear, 2 = quadratic, etc)
 * @property {Vector} shift - move noise in 2D, 3D or 4D space
 *
 * @property {number} octaves - number of layers for fbm noise
 * @property {number} gain - how much to multiply amplitude per layer
 * @property {number} lacunarity - how much to multiply scale per layer
 * @property {array} amps - array of amplitudes for each layer
 * @property {number} erosion - how much previous layers influence amplitude of later layers
 * @property {number} sharpness - billowed or rigded noise (0 = normal, 1 = billowed, -1 = ridged)
 * @property {number} steps - will turn noise into steps (integer, number of steps)
 *
 * @property {number} warp - how much to warp the noise
 * @property {number} warpNoise - noise to warp the noise with
 * @property {number} warp2 - second warp, can only be used if warp is used too
 * @property {number} warpNoise2 - second warp noise
 *
 * @property {boolean} invert - invert the noise
 * @property {boolean} abs - absolute value of the noise
 * @property {boolean} clamp - clamp the noise between min and max
 * @property {boolean} tileX - tile the noise in x direction
 * @property {boolean} tileY - tile the noise in y direction
 * @property {boolean} tile - tile the noise in all directions (will override tileX and tileY)
 *
 * @constructor
 */

function lerp(a: number, b: number, t: number): number {
  return (b - a) * t + a;
}

type VectorLikeObject = {
  x: number;
  y: number;
  z?: number;
  w?: number;
};

type NoiseParameterInput = number | UberNoise | NoiseOptions;
type NoiseParameter = number | UberNoise;

type NoiseOptions = {
  /**
   * seed for the noise, if not provided, Math.random() will be used,
   */
  seed?: string | number;

  /**
   * minimun value of noise
   */
  min?: NoiseParameterInput;

  /**
   * maximum value of noise
   */
  max?: NoiseParameterInput;

  /**
   * scale of the noise ("zoom" in or out)
   */
  scale?: NoiseParameterInput;

  /**
   * power of the noise (1 = linear, 2 = quadratic, etc)
   */
  power?: NoiseParameterInput;

  /**
   * move noise in 2D, 3D or 4D space
   */
  shift?: number[];

  /**
   * number of layers for fbm noise
   */
  octaves?: number;
  /**
   * how much to multiply amplitude per fbm layer
   */
  gain?: NoiseParameterInput;
  /**
   * how much to multiply scale per fbm layer
   */
  lacunarity?: NoiseParameterInput;

  /**
   * array of amplitudes for each fbm layer
   */
  amps?: number[];

  /**
   * custom noise options for each fbm layer
   */
  layers?: NoiseOptions[];

  /**
   * billowed or rigded noise (0 = normal, 1 = billowed, -1 = ridged)
   */
  sharpness?: NoiseParameterInput;
  /**
   * will turn noise into discrete steps (integer, number of steps)
   */
  steps?: NoiseParameterInput;

  /**
   * how much to warp the noise
   */
  warp?: NoiseParameterInput;
  /**
   * custom noise to warp the noise with
   */
  warpNoise?: UberNoise;
  /**
   * second warp, can only be used if warp is used
   * too
   */
  warp2?: NoiseParameterInput;
  /**
   * second warp noise
   */
  warpNoise2?: UberNoise;

  /**
   * should the noise be inverted
   */
  invert?: boolean;
  /**
   * should we take the absolute value of the noise
   */
  abs?: boolean;
  /**
   * should we clamp the noise between min and max
   */
  clamp?: boolean;

  /**
   * tile the noise in x direction
   */
  tileX?: boolean;
  /**
   * tile the noise in y direction
   */
  tileY?: boolean;
  /**
   * tile the noise in all directions (will override tileX and tileY)
   */
  tile?: boolean;
};

export default class UberNoise {
  private noise2D?: NoiseFunction2D;
  private noise3D?: NoiseFunction3D;
  private noise4D?: NoiseFunction4D;
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

  private _erosion: NoiseParameter = 0;
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
    this.pngr = alea(this.seed);

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
      this.noise2D = createNoise2D(this.pngr);
      this.noise3D = createNoise3D(this.pngr);
      this.noise4D = createNoise4D(this.pngr);
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

  private getFBM(): number {
    const x = this.position.x,
      y = this.position.y,
      z = this.position.z,
      w = this.position.w;

    const scale = this.scale;

    if (this.layers.length == 0) {
      if (z != undefined && w != undefined && this.noise4D != undefined) {
        return this.noise4D(x * scale, y * scale, z * scale, w * scale);
      }
      if (z != undefined && this.noise3D != undefined) {
        return this.noise3D(x * scale, y * scale, z * scale);
      }
      if (this.noise2D != undefined) {
        return this.noise2D(x * scale, y * scale);
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

  // same as normalized but returns between min and max
  get(
    x: number | VectorLikeObject | Array<number>,
    y: number | undefined = undefined,
    z: number | undefined = undefined,
    w: number | undefined = undefined,
  ): number {
    const norm = this.normalized(x, y, z, w);
    return this.normalizedToMinMax(norm);
  }

  // same as get but returns between -1 and 1
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
  }

  private checkParameterInput(value: NoiseParameterInput): UberNoise | number {
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
  set min(value: NoiseParameterInput) {
    this._min = this.checkParameterInput(value);
  }
  get max(): number {
    return this.getParameter(this._max);
  }
  set max(value: NoiseParameterInput) {
    this._max = this.checkParameterInput(value);
  }

  // getter and setter for scale and power
  get scale(): number {
    return this.getParameter(this._scale);
  }
  set scale(value: NoiseParameterInput) {
    this._scale = this.checkParameterInput(value);
  }
  get power(): number {
    return this.getParameter(this._power);
  }
  set power(value: NoiseParameterInput) {
    this._power = this.checkParameterInput(value);
  }

  // getter and setter for gain and lacunarity
  get gain(): number {
    return this.getParameter(this._gain);
  }
  set gain(value: NoiseParameterInput) {
    this._gain = this.checkParameterInput(value);
  }
  get lacunarity(): number {
    return this.getParameter(this._lacunarity);
  }
  set lacunarity(value: NoiseParameterInput) {
    this._lacunarity = this.checkParameterInput(value);
  }

  // getter and setter for erosion, sharpness and steps
  get erosion(): number {
    return this.getParameter(this._erosion);
  }
  set erosion(value: NoiseParameterInput) {
    this._erosion = this.checkParameterInput(value);
  }
  get sharpness(): number {
    return this.getParameter(this._sharpness);
  }
  set sharpness(value: NoiseParameterInput) {
    this._sharpness = this.checkParameterInput(value);
  }
  get steps(): number {
    return Math.round(this.getParameter(this._steps));
  }
  set steps(value: NoiseParameterInput) {
    this._steps = this.checkParameterInput(value);
  }

  // getter and setter for warp, warpNoise, warp2 and warpNoise2
  get warp(): number {
    return this.getParameter(this._warp);
  }
  set warp(value: NoiseParameterInput) {
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
  set warp2(value: NoiseParameterInput) {
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

export {
  UberNoise,
  type NoiseOptions,
  type NoiseParameter,
  type NoiseParameterInput,
  type VectorLikeObject as VectorObject,
};
