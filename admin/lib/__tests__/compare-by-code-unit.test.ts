import { describe, expect, it } from 'bun:test';
import { compareByCodeUnit } from '../compare-by-code-unit.ts';

describe('compareByCodeUnit', () => {
	it('returns -1, 0 or 1', () => {
		expect(compareByCodeUnit('a', 'b')).toBe(-1);
		expect(compareByCodeUnit('b', 'a')).toBe(1);
		expect(compareByCodeUnit('a', 'a')).toBe(0);
	});

	it('orders by UTF-16 code unit, not by locale', () => {
		// 'B' (0x42) before 'a' (0x61); pointed Hebrew before the bare
		// spelling, since a point (U+05B0–U+05C7) sorts below a letter.
		const words = ['a', 'B', 'ברא', 'בָּרָא', 'אָב', 'A00010', 'A00009'];
		expect(words.toSorted(compareByCodeUnit)).toEqual([
			'A00009',
			'A00010',
			'B',
			'a',
			'אָב',
			'בָּרָא',
			'ברא',
		]);
	});
});
