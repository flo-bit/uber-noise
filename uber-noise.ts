import {
  NoiseFunction2D,
  NoiseFunction3D,
  NoiseFunction4D,
  createNoise2D,
  createNoise3D,
  createNoise4D,
} from "simplex-noise";
import alea from "alea";

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

type VectorObject = {
  x: number;
  y: number;
  z: number | undefined;
  w: number | undefined;
};

type NoiseParameterInput = number | UberNoise | NoiseOptions;
type NoiseParameter = number | UberNoise;

type NoiseOptions = {
  seed?: string | number;

  min?: NoiseParameterInput;
  max?: NoiseParameterInput;

  scale?: NoiseParameterInput;
  power?: NoiseParameterInput;

  shift?: number[];

  octaves?: number;
  gain?: NoiseParameterInput;
  lacunarity?: NoiseParameterInput;

  amps?: number[];

  layers?: NoiseOptions[];

  erosion?: NoiseParameterInput;
  sharpness?: NoiseParameterInput;
  steps?: NoiseParameterInput;
  warp?: NoiseParameterInput;
  warpNoise?: UberNoise;
  warp2?: NoiseParameterInput;
  warpNoise2?: UberNoise;

  invert?: boolean;
  abs?: boolean;
  clamp?: boolean;
  tileX?: boolean;
  tileY?: boolean;
  tile?: boolean;
};

export default class UberNoise {
  private noise2D: NoiseFunction2D | undefined;
  private noise3D: NoiseFunction3D | undefined;
  private noise4D: NoiseFunction4D | undefined;
  private seed: string | number;

  private _min: NoiseParameter = -1;
  private _max: NoiseParameter = 1;

  private _scale: NoiseParameter = 1;
  private _power: NoiseParameter = 1;

  private shift: number[] = [];

  private octaves = 0;
  private _gain: NoiseParameter = 0.5;
  private _lacunarity: NoiseParameter = 2;

  private amps: number[] = [];

  private _erosion: NoiseParameter = 0;
  private _sharpness: NoiseParameter = 0;
  private _steps: NoiseParameter = 0;

  private _warp: NoiseParameter = 0;
  private _warpNoise: UberNoise | undefined;
  private _warp2: NoiseParameter = 0;
  private _warpNoise2: UberNoise | undefined;

  private position = [0, 0];

  private pngr;

  private layers: UberNoise[] = [];

  constructor(options: NoiseOptions = {}) {
    this.seed = options.seed || Math.random();
    this.pngr = alea(this.seed);

    this.min = options.min ?? -1;
    this.max = options.max ?? 1;

    this.scale = options.scale ?? 1;
    this.power = options.power ?? 1;

    this.octaves = options.octaves ?? options.layers?.length ?? 0;
    this.gain = options.gain ?? 0.5;
    this.lacunarity = options.lacunarity ?? 2;

    this.erosion = options.erosion ?? 0;
    this.sharpness = options.sharpness ?? 0;
    this.steps = options.steps ?? 0;

    this.warp = options.warp ?? 0;
    this.warpNoise = options.warpNoise;
    this.warp2 = options.warp2 ?? 0;
    this.warpNoise2 = options.warpNoise2;

    // process layers
    for (let i = 0; i < this.octaves; i++) {
      const layerOptions = options.layers?.[i] ?? {};
      if (layerOptions instanceof UberNoise) {
        this.layers[i] = layerOptions;
      } else {
        if (layerOptions.seed === undefined) layerOptions.seed = this.pngr();
        this.layers[i] = new UberNoise(layerOptions);
      }
    }
    if (this.layers.length == 0) {
      this.noise2D = createNoise2D(this.pngr);
      this.noise3D = createNoise3D(this.pngr);
      this.noise4D = createNoise4D(this.pngr);
    }
  }

  private getFBM(
    x: number,
    y: number,
    z: number | undefined = undefined,
    w: number | undefined = undefined
  ): number {
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

    const lac = this.lacunarity;
    const gain = this.gain;

    let n = 0;

    for (let i = 0; i < this.octaves; i++) {
      const layer = this.layers[i];

      const value =
        layer.get(
          x * freq,
          y * freq,
          z != undefined ? z * freq : undefined,
          w != undefined ? w * freq : undefined
        ) * amp;
      n += value;

      amp *= gain;
      freq *= lac;
      maxAmp += amp;
    }
    return n / maxAmp;
  }

  private getNoise(
    x: number,
    y: number,
    z: number | undefined = undefined,
    w: number | undefined = undefined
  ): number {
    // set position
    this.position[0] = x;
    this.position[1] = y;
    if (z !== undefined) {
      this.position[2] = z;
    }
    if (w !== undefined) {
      this.position[3] = w;
    }

    // apply shift
    const shift = this.shift;
    if (shift !== undefined) {
      for (let i = 0; i < this.position.length && i < shift.length; i++) {
        this.position[i] += shift[i];
      }
    }

    // apply tiling
    // apply warp

    let norm = this.getFBM(
      this.position[0],
      this.position[1],
      this.position[2],
      this.position[3]
    );

    // apply power
    const power = this.power;
    if (power != 1) {
      // convert to [0 - 1], apply power and back to [-1, 1]
      norm = (Math.pow((norm + 1) * 0.5, power) - 0.5) * 2;
    }

    // apply sharpness
    const sharpness = this.sharpness;
    if (sharpness != 0) {
      const billow = (Math.abs(norm) - 0.5) * 2;
      const ridged = (0.5 - Math.abs(norm)) * 2;

      norm = lerp(norm, billow, Math.max(0, sharpness));
      norm = lerp(norm, ridged, Math.max(0, -sharpness));
    }

    // apply steps
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

  // same as get but returns between min and max
  get(
    x: number | VectorObject | Array<number>,
    y: number | undefined = undefined,
    z: number | undefined = undefined,
    w: number | undefined = undefined
  ): number {
    const norm = this.normalized(x, y, z, w);
    return this.toMinMax(norm);
  }

  // same as get but returns between -1 and 1
  normalized(
    x: number | VectorObject | Array<number>,
    y: number | undefined = undefined,
    z: number | undefined = undefined,
    w: number | undefined = undefined
  ): number {
    // if x is an array, treat it as a vector
    if (Array.isArray(x)) {
      w = x[3];
      z = x[2];
      y = x[1];
      x = x[0];
    } else if (typeof x === "object") {
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
   * value between min and max to normalized value between -1 and 1
   *
   * @param value {number}
   * @returns {number}
   */
  toNormalized(value: number): number {
    return ((value - this.min) / (this.max - this.min)) * 2 - 1;
  }

  /**
   * normlized value to value between min and max
   *
   * @param value {number}
   * @returns {number}
   */
  toMinMax(value: number): number {
    return (value + 1) * 0.5 * (this.max - this.min) + this.min;
  }

  private checkParameterInput(value: NoiseParameterInput): UberNoise | number {
    if (typeof value === "object" && !(value instanceof UberNoise)) {
      if (value.seed === undefined) {
        value.seed = this.pngr();
      }
      value = new UberNoise(value);
    }
    return value;
  }

  private getParameter(value: NoiseParameter): number {
    if (typeof value === "number") {
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
  NoiseOptions,
  NoiseParameter,
  NoiseParameterInput,
  VectorObject,
};
