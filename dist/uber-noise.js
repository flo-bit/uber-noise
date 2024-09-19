import { createNoise2D, createNoise3D, createNoise4D, } from 'simplex-noise';
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
function lerp(a, b, t) {
    return (b - a) * t + a;
}
export default class UberNoise {
    noise2D;
    noise3D;
    noise4D;
    seed;
    _min = -1;
    _max = 1;
    _scale = 1;
    _power = 1;
    shift = {
        x: 0,
        y: 0,
    };
    octaves = 0;
    _gain = 0.5;
    _lacunarity = 2;
    amps = [];
    _erosion = 0;
    _sharpness = 0;
    _steps = 0;
    _warp = 0;
    _warpNoise;
    _warp2 = 0;
    _warpNoise2;
    tileX = false;
    tileY = false;
    position = {
        x: 0,
        y: 0,
    };
    pngr;
    layers = [];
    constructor(options = {}) {
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
    createLayers(options) {
        // process layers
        for (let i = 0; i < this.octaves; i++) {
            const layerOptions = options.layers?.[i] ?? {};
            if (layerOptions instanceof UberNoise) {
                this.layers[i] = layerOptions;
                continue;
            }
            if (layerOptions.seed === undefined)
                layerOptions.seed = this.pngr();
            this.layers[i] = new UberNoise(layerOptions);
        }
        if (this.layers.length == 0) {
            this.noise2D = createNoise2D(this.pngr);
            this.noise3D = createNoise3D(this.pngr);
            this.noise4D = createNoise4D(this.pngr);
        }
    }
    warpPosition(warp, warpNoise) {
        if (warp == undefined || warp == 0)
            return;
        if (warpNoise != undefined)
            warpNoise.position = this.position;
        let x = this.position.x, y = this.position.y, z = this.position.z, w = this.position.w;
        const noise = warpNoise ?? this;
        const scl = this.scale;
        // move some amount so that we don't sample the same point as the original noise
        this.position.x = x + 54.47 * scl;
        this.position.y = y - 34.98 * scl;
        if (z != undefined)
            this.position.z = z + 21.63 * scl;
        if (w != undefined)
            this.position.w = w - 67.1 * scl;
        x += noise.getFBM() * warp;
        y += noise.getFBM() * warp;
        if (z != undefined)
            z += noise.getFBM() * warp;
        if (w != undefined)
            w += noise.getFBM() * warp;
        this.position.x = x;
        this.position.y = y;
        this.position.z = z;
        this.position.w = w;
    }
    tilePosition() {
        if (!this.tileX && !this.tileY)
            return;
        const x = this.position.x;
        const y = this.position.y;
        let newX = 0, newY = 0, newZ = 0, newW = 0;
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
        }
        else if (this.tileY && !this.tileX) {
            this.position.x = newZ + x;
            this.position.y = newW;
        }
        else if (this.tileX && this.tileY) {
            this.position.x = newX;
            this.position.y = newY;
            this.position.z = newZ;
            this.position.w = newW;
        }
    }
    getFBM() {
        const x = this.position.x, y = this.position.y, z = this.position.z, w = this.position.w;
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
        let amp = 1, freq = scale;
        const lacunarity = this.lacunarity;
        const gain = this.gain;
        let n = 0;
        for (let i = 0; i < this.octaves; i++) {
            const layer = this.layers[i];
            const layerAmp = this.amps[i] ?? 1;
            const value = layer.get(x * freq, y * freq, z != undefined ? z * freq : undefined, w != undefined ? w * freq : undefined) *
                amp *
                layerAmp;
            n += value;
            amp *= gain;
            freq *= lacunarity;
            maxAmp += amp * layerAmp;
        }
        return n / maxAmp;
    }
    applyShift() {
        const shift = this.shift;
        if (shift !== undefined) {
            this.position.x += shift.x;
            this.position.y += shift.y;
            if (this.position.z)
                this.position.z += shift.z ?? 0;
            if (this.position.w)
                this.position.w += shift.w ?? 0;
        }
    }
    applyPower(norm) {
        const power = this.power;
        if (power != 1) {
            // convert to [0 - 1], apply power and back to [-1, 1]
            norm = (Math.pow((norm + 1) * 0.5, power) - 0.5) * 2;
        }
        return norm;
    }
    applySharpness(norm) {
        const sharpness = this.sharpness;
        if (sharpness != 0) {
            const billow = (Math.abs(norm) - 0.5) * 2;
            const ridged = (0.5 - Math.abs(norm)) * 2;
            norm = lerp(norm, billow, Math.max(0, sharpness));
            norm = lerp(norm, ridged, Math.max(0, -sharpness));
        }
        return norm;
    }
    applySteps(norm) {
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
    getNoise(x, y, z = undefined, w = undefined) {
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
    get(x, y = undefined, z = undefined, w = undefined) {
        const norm = this.normalized(x, y, z, w);
        return this.normalizedToMinMax(norm);
    }
    // same as get but returns between -1 and 1
    normalized(x, y = undefined, z = undefined, w = undefined) {
        // if x is an array, treat it as a vector
        if (Array.isArray(x)) {
            w = x[3];
            z = x[2];
            y = x[1];
            x = x[0];
        }
        else if (typeof x === 'object') {
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
    minMaxToNormalized(value) {
        return ((value - this.min) / (this.max - this.min)) * 2 - 1;
    }
    /**
     * convert normlized value to value between min and max
     *
     * @param value {number}
     * @returns {number}
     */
    normalizedToMinMax(value) {
        return (value + 1) * 0.5 * (this.max - this.min) + this.min;
    }
    move(x, y, z = undefined, w = undefined) {
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
    checkParameterInput(value) {
        if (typeof value === 'object' && !(value instanceof UberNoise)) {
            if (value.seed === undefined) {
                value.seed = this.pngr();
            }
            value = new UberNoise(value);
        }
        return value;
    }
    getParameter(value) {
        if (typeof value === 'number') {
            return value;
        }
        return value.get(this.position);
    }
    // getter and setter for min and max
    get min() {
        return this.getParameter(this._min);
    }
    set min(value) {
        this._min = this.checkParameterInput(value);
    }
    get max() {
        return this.getParameter(this._max);
    }
    set max(value) {
        this._max = this.checkParameterInput(value);
    }
    // getter and setter for scale and power
    get scale() {
        return this.getParameter(this._scale);
    }
    set scale(value) {
        this._scale = this.checkParameterInput(value);
    }
    get power() {
        return this.getParameter(this._power);
    }
    set power(value) {
        this._power = this.checkParameterInput(value);
    }
    // getter and setter for gain and lacunarity
    get gain() {
        return this.getParameter(this._gain);
    }
    set gain(value) {
        this._gain = this.checkParameterInput(value);
    }
    get lacunarity() {
        return this.getParameter(this._lacunarity);
    }
    set lacunarity(value) {
        this._lacunarity = this.checkParameterInput(value);
    }
    // getter and setter for erosion, sharpness and steps
    get erosion() {
        return this.getParameter(this._erosion);
    }
    set erosion(value) {
        this._erosion = this.checkParameterInput(value);
    }
    get sharpness() {
        return this.getParameter(this._sharpness);
    }
    set sharpness(value) {
        this._sharpness = this.checkParameterInput(value);
    }
    get steps() {
        return Math.round(this.getParameter(this._steps));
    }
    set steps(value) {
        this._steps = this.checkParameterInput(value);
    }
    // getter and setter for warp, warpNoise, warp2 and warpNoise2
    get warp() {
        return this.getParameter(this._warp);
    }
    set warp(value) {
        this._warp = this.checkParameterInput(value);
    }
    get warpNoise() {
        return this._warpNoise;
    }
    set warpNoise(value) {
        if (value == undefined) {
            this._warpNoise = undefined;
            return;
        }
        const processed = this.checkParameterInput(value);
        if (processed instanceof UberNoise) {
            this._warpNoise = processed;
        }
    }
    get warp2() {
        return this.getParameter(this._warp2);
    }
    set warp2(value) {
        this._warp2 = this.checkParameterInput(value);
    }
    get warpNoise2() {
        return this._warpNoise2;
    }
    set warpNoise2(value) {
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
export { UberNoise, };
