import { describe, expect, it } from 'bun:test';
import { intToRoman, romanToInt } from '../roman.ts';

describe('intToRoman and romanToInt', () => {
	it('write the numerals print sets', () => {
		expect([1, 2, 4, 9, 14, 40, 99].map(intToRoman)).toEqual([
			'I',
			'II',
			'IV',
			'IX',
			'XIV',
			'XL',
			'XCIX',
		]);
	});

	it('read back every number they write', () => {
		for (let n = 1; n <= 120; n++) {
			expect(romanToInt(intToRoman(n))).toBe(n);
		}
	});

	it('refuse a string the table cannot consume whole', () => {
		expect(romanToInt('IIX')).toBeNaN();
		expect(romanToInt('IA')).toBeNaN();
	});
});
