/**
 * Roman numerals, as Jastrow prints a homograph number (`אָב II`).
 * One table, read both ways, so writing a numeral and reading one
 * back cannot disagree.
 */

/** Roman numeral values, largest first: the greedy table both
 * `intToRoman` and `romanToInt` walk. */
const ROMAN: ReadonlyArray<readonly [number, string]> = [
	[100, 'C'],
	[90, 'XC'],
	[50, 'L'],
	[40, 'XL'],
	[10, 'X'],
	[9, 'IX'],
	[5, 'V'],
	[4, 'IV'],
	[1, 'I'],
];

/** A homograph number as the Roman numeral Jastrow prints. */
function intToRoman(n: number): string {
	let rest = n;
	let out = '';
	for (const [value, glyph] of ROMAN) {
		while (rest >= value) {
			out += glyph;
			rest -= value;
		}
	}
	return out;
}

/** A Roman numeral back to its number, or NaN when the string is not
 * one this table can consume whole — the caller treats NaN as "this
 * did not parse" rather than guessing at a partial reading. */
function romanToInt(s: string): number {
	let total = 0;
	let rest = s;
	for (const [value, glyph] of ROMAN) {
		while (rest.startsWith(glyph)) {
			total += value;
			rest = rest.slice(glyph.length);
		}
	}
	return rest === '' ? total : Number.NaN;
}

export { intToRoman, romanToInt };
