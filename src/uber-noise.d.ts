import { aleaFactory } from './alea/alea';
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
declare class UberNoise {
    private noise2D?;
    private noise3D?;
    private noise4D?;
    private seed;
    private _min;
    private _max;
    private _scale;
    private _power;
    private shift;
    private octaves;
    private _gain;
    private _lacunarity;
    private amps;
    private _sharpness;
    private _steps;
    private _warp;
    private _warpNoise?;
    private _warp2;
    private _warpNoise2?;
    private tileX;
    private tileY;
    private position;
    private pngr;
    private layers;
    constructor(options?: NoiseOptions);
    private createLayers;
    private warpPosition;
    private tilePosition;
    private getNoiseValue;
    private getFBM;
    private applyShift;
    private applyPower;
    private applySharpness;
    private applySteps;
    private getNoise;
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
    get(x: number | VectorLikeObject | Array<number>, y?: number | undefined, z?: number | undefined, w?: number | undefined): number;
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
    normalized(x: number | VectorLikeObject | Array<number>, y?: number | undefined, z?: number | undefined, w?: number | undefined): number;
    /**
     * convert value between min and max to normalized value between -1 and 1
     *
     * @param value {number}
     * @returns {number}
     */
    minMaxToNormalized(value: number): number;
    /**
     * convert normlized value to value between min and max
     *
     * @param value {number}
     * @returns {number}
     */
    normalizedToMinMax(value: number): number;
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
    move(x: number, y: number, z?: number | undefined, w?: number | undefined): this | undefined;
    private checkParameterInput;
    private getParameter;
    get min(): number;
    set min(value: number | UberNoise | NoiseOptions);
    get max(): number;
    set max(value: number | UberNoise | NoiseOptions);
    get scale(): number;
    set scale(value: number | UberNoise | NoiseOptions);
    get power(): number;
    set power(value: number | UberNoise | NoiseOptions);
    get gain(): number;
    set gain(value: number | UberNoise | NoiseOptions);
    get lacunarity(): number;
    set lacunarity(value: number | UberNoise | NoiseOptions);
    get sharpness(): number;
    set sharpness(value: number | UberNoise | NoiseOptions);
    get steps(): number;
    set steps(value: number | UberNoise | NoiseOptions);
    get warp(): number;
    set warp(value: number | UberNoise | NoiseOptions);
    get warpNoise(): UberNoise | undefined;
    set warpNoise(value: UberNoise | NoiseOptions | undefined);
    get warp2(): number;
    set warp2(value: number | UberNoise | NoiseOptions);
    get warpNoise2(): UberNoise | undefined;
    set warpNoise2(value: UberNoise | NoiseOptions | undefined);
}
declare global {
    var UberNoise: typeof import('./uber-noise').UberNoise;
    var alea: typeof import('./alea/alea').aleaFactory;
}
export { UberNoise, type NoiseOptions, type NoiseParameter, type VectorLikeObject as VectorObject, UberNoise as noise, aleaFactory as alea, };
