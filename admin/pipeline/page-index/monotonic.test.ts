import { describe, expect, it } from 'bun:test';
import { isNonDecreasing, isotonic } from './monotonic.ts';

describe('isotonic', () => {
	it('leaves an already non-decreasing sequence untouched', () => {
		const v = [1, 2, 2, 5, 9];
		expect(isotonic(v)).toEqual(v);
	});

	it('pools a single violator with its neighbour', () => {
		// 5 then 1 must become their mean, twice.
		expect(isotonic([0, 5, 1, 10])).toEqual([0, 3, 3, 10]);
	});

	it('pools a long descending run to one mean', () => {
		expect(isotonic([4, 3, 2, 1])).toEqual([2.5, 2.5, 2.5, 2.5]);
	});

	it('always returns a non-decreasing sequence', () => {
		const v = [9, 1, 8, 2, 7, 3, 6, 4, 5, 0];
		expect(isNonDecreasing(isotonic(v))).toBe(true);
	});

	it('lets a heavy weight hold its value against a light neighbour', () => {
		// The 0-weight-ish second point barely moves the heavy first one.
		const out = isotonic([10, 0], [1000, 1]);
		expect(out[0]).toBeGreaterThan(9.9);
		expect(out[0]).toBe(out[1] as number);
	});

	it('handles the empty and single-element cases', () => {
		expect(isotonic([])).toEqual([]);
		expect(isotonic([7])).toEqual([7]);
	});

	it('does not modify its input', () => {
		const v = [3, 1, 2];
		isotonic(v);
		expect(v).toEqual([3, 1, 2]);
	});

	it('treats a non-positive weight as negligible rather than dividing by zero', () => {
		const out = isotonic([5, 1], [0, 1]);
		expect(Number.isFinite(out[0] as number)).toBe(true);
		expect(isNonDecreasing(out)).toBe(true);
	});
});

describe('isNonDecreasing', () => {
	it('accepts equal neighbours and rejects a drop', () => {
		expect(isNonDecreasing([1, 1, 2])).toBe(true);
		expect(isNonDecreasing([1, 2, 1])).toBe(false);
	});

	it('accepts trivially short sequences', () => {
		expect(isNonDecreasing([])).toBe(true);
		expect(isNonDecreasing([5])).toBe(true);
	});
});
