import { describe, expect, it } from 'bun:test';
import { compareStrings } from '../compare-strings.ts';

describe('compareStrings', () => {
	it('returns -1, 0 or 1', () => {
		expect(compareStrings('a', 'b')).toBe(-1);
		expect(compareStrings('b', 'a')).toBe(1);
		expect(compareStrings('a', 'a')).toBe(0);
	});

	it('orders exactly as a bare sort() orders the same strings', () => {
		// 'B' (0x42) before 'a' (0x61), and pointed Hebrew before the
		// bare spelling: code-unit order, not a locale's.
		const words = ['a', 'B', 'בָּרָא', 'ברא', 'אָב', 'A00010', 'A00009'];
		expect(words.toSorted(compareStrings)).toEqual(words.toSorted());
	});
});
