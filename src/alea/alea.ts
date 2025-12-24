// -----------------------------------------------------
// 						 Alea
//
//	A port of an algorithm by Johannes Baagøe <baagoe@baagoe.com>, 2010
//	http://baagoe.com/en/RandomMusings/javascript/
//
//	Original work is under MIT license -
//
//	Copyright (C) 2010 by Johannes Baagøe <baagoe@baagoe.org>
//
//	Permission is hereby granted, free of charge, to any person obtaining a copy
//	of this software and associated documentation files (the "Software"), to deal
//	in the Software without restriction, including without limitation the rights
//	to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
//	copies of the Software, and to permit persons to whom the Software is
//	furnished to do so, subject to the following conditions:
//
//	The above copyright notice and this permission notice shall be included in
//	all copies or substantial portions of the Software.
//
//	THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
//	IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
//	FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
//	AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
//	LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
//	OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
//	THE SOFTWARE.
// -----------------------------------------------------

const _mashMagicNumber = 0.025_196_032_824_169_38;
const _fractionalFix = Number.EPSILON / 2;

/**
 * Equivalent to 2^32
 *
 * @private
 */
const _twoPow32 = 0x1_00_00_00_00;
/**
 * Equivalent to 2^-32
 *
 * @private
 */
const _twoPowNegative32 = 2 ** -32;

/**
 * Mash factory
 * returns an alea mash function
 *
 * @private
 * @returns a stateful hash function
 */
const _aleaMash = () => {
	let _state = 0xef_c8_24_9d;
	/**
	 * Mash
	 *
	 * hash used in alea
	 *
	 * @param input - a value to mash
	 * @returns a hashed version of the input
	 */
	const _mash = (input: { toString: () => string }): number => {
		const inputString = input.toString();
		for (var index = 0; index < inputString.length; index++) {
			_state += inputString.charCodeAt(index);
			var h = _mashMagicNumber * _state;
			_state = h >>> 0;
			h -= _state;
			h *= _state;
			_state = h >>> 0;
			h -= _state;
			_state += h * _twoPow32; // 2^32
		}
		return (_state >>> 0) * _twoPowNegative32; // 2^-32
	};

	return _mash;
};

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
export const aleaFactory = (
	seed = `${Date.now()}` as { toString: () => string }
): aleaType => {
	const _mash = _aleaMash();

	const _state = [_mash(' '), _mash(' '), _mash(' '), 1];

	_state[0] -= _mash(seed);
	if (_state[0] < 0) _state[0] += 1;

	_state[1] -= _mash(seed);
	if (_state[1] < 0) _state[1] += 1;

	_state[2] -= _mash(seed);
	if (_state[2] < 0) _state[2] += 1;

	const aleaObject = {
		random: () => {
			const _temporary =
				2_091_639 * _state[0] + _state[3] * _twoPowNegative32;
			_state[0] = _state[1];
			_state[1] = _state[2];
			return (_state[2] =
				_temporary - (_state[3] = Math.floor(_temporary)));
		},
		uint32: () => aleaObject.random() * _twoPow32,
		fract53: () => {
			return (
				aleaObject.random() +
				Math.trunc(aleaObject.random() * 0x20_00_00) * _fractionalFix
			);
		},
		exportState: (): aleaState => ({
			seed0: _state[0],
			seed1: _state[1],
			seed2: _state[2],
			constant: _state[3],
		}),
		importState: (inputState: Readonly<aleaState>): void => {
			[_state[0], _state[1], _state[2], _state[3]] = [
				inputState.seed0,
				inputState.seed1,
				inputState.seed2,
				inputState.constant,
			];
		},
	};
	return aleaObject;
};

export const alea = aleaFactory().random;