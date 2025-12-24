/**
 * A random() function, must return a number in the interval [0,1), just like Math.random().
 */
export type RandomFn = () => number;
/**
 * Samples the noise field in two dimensions
 *
 * Coordinates should be finite, bigger than -2^31 and smaller than 2^31.
 * @param x
 * @param y
 * @returns a number in the interval [-1, 1]
 */
export type NoiseFunction2D = (x: number, y: number) => number;
/**
 * Creates a 2D noise function
 * @param random the random function that will be used to build the permutation table
 * @returns {NoiseFunction2D}
 */
export declare function createNoise2D(random?: RandomFn): NoiseFunction2D;
/**
 * Samples the noise field in three dimensions
 *
 * Coordinates should be finite, bigger than -2^31 and smaller than 2^31.
 * @param x
 * @param y
 * @param z
 * @returns a number in the interval [-1, 1]
 */
export type NoiseFunction3D = (x: number, y: number, z: number) => number;
/**
 * Creates a 3D noise function
 * @param random the random function that will be used to build the permutation table
 * @returns {NoiseFunction3D}
 */
export declare function createNoise3D(random?: RandomFn): NoiseFunction3D;
/**
 * Samples the noise field in four dimensions
 *
 * Coordinates should be finite, bigger than -2^31 and smaller than 2^31.
 * @param x
 * @param y
 * @param z
 * @param w
 * @returns a number in the interval [-1, 1]
 */
export type NoiseFunction4D = (x: number, y: number, z: number, w: number) => number;
/**
 * Creates a 4D noise function
 * @param random the random function that will be used to build the permutation table
 * @returns {NoiseFunction4D}
 */
export declare function createNoise4D(random?: RandomFn): NoiseFunction4D;
/**
 * Builds a random permutation table.
 * This is exported only for (internal) testing purposes.
 * Do not rely on this export.
 * @private
 */
export declare function buildPermutationTable(random: RandomFn): Uint8Array;
/**
 * The output of the noise function with derivatives
 *
 * @property value the noise value in the interval [-1, 1]
 * @property dx the partial derivative with respect to x
 * @property dy the partial derivative with respect to y
 */
export type NoiseDeriv2DOutput = {
    value: number;
    dx: number;
    dy: number;
};
/**
 * Samples the noise field in two dimensions and returns the partial derivatives (dx, dy).
 *
 * Coordinates should be finite, bigger than -2^31 and smaller than 2^31.
 * @param x
 * @param y
 * @param output optional output object to store the result, if not provided, a new one will be created
 * @returns {NoiseDeriv2DOutput}
 */
export type NoiseDerivFunction2D = (x: number, y: number, output?: NoiseDeriv2DOutput) => NoiseDeriv2DOutput;
/**
 * Creates a 2D noise function with derivatives
 *
 * @param random the random function that will be used to build the permutation table
 * @returns {NoiseDerivFunction2D}
 */
export declare function createNoise2DWithDerivatives(random?: RandomFn): NoiseDerivFunction2D;
/**
 * The output of the noise function with derivatives
 *
 * @property value the noise value in the interval [-1, 1]
 * @property dx the partial derivative with respect to x
 * @property dy the partial derivative with respect to y
 * @property dz the partial derivative with respect to z
 */
export type NoiseDeriv3DOutput = {
    value: number;
    dx: number;
    dy: number;
    dz: number;
};
/**
 * Samples the noise field in three dimensions and returns the partial derivatives (dx, dy, dz).
 *
 * Coordinates should be finite, bigger than -2^31 and smaller than 2^31.
 * @param x
 * @param y
 * @param z
 * @param output
 * @returns a number in the interval [-1, 1]
 */
export type NoiseDerivFunction3D = (x: number, y: number, z: number, output?: NoiseDeriv3DOutput) => NoiseDeriv3DOutput;
/**
 * Creates a 3D Simplex noise function that also returns partial derivatives (dx, dy, dz).
 *
 * The final noise value is scaled to ~[-1, 1], just like `createNoise3D`.
 * The derivatives match that same scaling.
 *
 * @param random the random function that will be used to build the permutation table
 * @returns {NoiseDerivFunction3D}
 */
export declare function createNoise3DWithDerivatives(random?: RandomFn): NoiseDerivFunction3D;
/**
 * The output of the noise function with derivatives
 *
 * @property value the noise value in the interval [-1, 1]
 * @property dx the partial derivative with respect to x
 * @property dy the partial derivative with respect to y
 * @property dz the partial derivative with respect to z
 * @property dw the partial derivative with respect to w
 */
export type NoiseDeriv4DOutput = {
    value: number;
    dx: number;
    dy: number;
    dz: number;
    dw: number;
};
/**
 * Samples the noise field in four dimensions and returns the partial derivatives (dx, dy, dz, dw).
 *
 * Coordinates should be finite, bigger than -2^31 and smaller than 2^31.
 * @param x
 * @param y
 * @param z
 * @param w
 * @param output (optional) an object to re-use for the result, so as to avoid allocations
 * @returns {NoiseDeriv4DOutput}
 */
export type NoiseDerivFunction4D = (x: number, y: number, z: number, w: number, output?: NoiseDeriv4DOutput) => NoiseDeriv4DOutput;
/**
 * Creates a 4D Simplex noise function that also computes its analytical partial derivatives.
 *
 * @param random the random function that will be used to build the permutation table
 * @returns {NoiseDerivFunction4D}
 */
export declare function createNoise4DWithDerivatives(random?: RandomFn): NoiseDerivFunction4D;
