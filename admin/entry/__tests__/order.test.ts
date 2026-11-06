import { describe, expect, it } from 'bun:test';
import { byCodeUnit } from '../order.ts';

describe('byCodeUnit', () => {
	it('orders by UTF-16 code unit, not by locale', () => {
		expect(byCodeUnit('a', 'b')).toBe(-1);
		expect(byCodeUnit('b', 'a')).toBe(1);
		expect(byCodeUnit('a', 'a')).toBe(0);
		// 'B' (0x42) sorts before 'a' (0x61); a locale collation would
		// put them the other way round.
		expect(['a', 'B'].toSorted(byCodeUnit)).toEqual(['B', 'a']);
	});

	it('is total over Hebrew with and without points', () => {
		const words = ['בָּרָא', 'ברא', 'אָב'];
		const sorted = words.toSorted(byCodeUnit);
		expect(sorted).toEqual(['אָב', 'בָּרָא', 'ברא']);
		expect(sorted.toSorted(byCodeUnit)).toEqual(sorted);
	});
});
