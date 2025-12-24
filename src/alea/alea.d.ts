/**
 * aleaState
 *
 * the three 32 bit seeds of alea and a dynamic integration constant
 */
interface aleaState {
    seed0: number;
    seed1: number;
    seed2: number;
    constant: number;
}
/**
 * aleaType
 *
 * The required functions of an alea implementation
 */
export interface aleaType {
    /**
     * @returns a 32 bit number between `[0,1)` like Math.random
     */
    random(): number;
    /**
     * @returns an integer `[0, 2^32)`
     */
    uint32(): number;
    /**
     * @returns a pseudo-random 53-bit number between `[0, 1)`, higher precision than random()
     */
    fract53(): number;
    /** @returns Exports the current state of the alea prng*/
    exportState(): aleaState;
    /**
     * Imports the current state of the alea prng
     *
     * @param state - the new state to change the prng to
     */
    importState(state: Readonly<aleaState>): void;
}
/**
 * aleaFactory
 *
 * creates a seedable pseduo random number generator
 *
 * @param seed - the seed for the pseudo random generations
 * @returns a pseduo random number generator
 */
export declare const aleaFactory: (seed?: {
    toString: () => string;
}) => aleaType;
export declare const alea: () => number;
export {};
