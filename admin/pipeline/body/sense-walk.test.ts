import { describe, expect, it } from 'bun:test';
import type { Boundary } from './sense-walk.ts';
import { classifyBoundary, stripTags, walkSenses } from './sense-walk.ts';
import type { SourceSense } from './types.ts';

// The pattern the scanner replaced. `[^>]+` is what backtracks.
const TAGS = /<[^>]+>/gu;
/** `stripTags` as it was before the linear scanner replaced it
 * (SonarCloud typescript:S8786). Kept here as the oracle: the
 * scanner's only contract is that it strips to the same fixed point,
 * byte for byte, so every case below is asserted against this as well
 * as against a literal. Deleting it deletes the evidence that the
 * S8786 fix changed no behaviour. */
const stripTagsByRegex = (text: string): string => {
	let out = text;
	let prev: string;
	do {
		prev = out;
		out = out.replace(TAGS, '');
	} while (out !== prev);
	return out;
};

// Each case is a shape the two implementations could disagree on:
// the `<>` no-match retry, an unterminated `<`, and the re-composition
// the fixed-point loop exists for.
const CASES: [string, string][] = [
	['plain text', 'plain text'],
	['', ''],
	['<b>bold</b>', 'bold'],
	['a<b>c', 'ac'],
	// `[^>]+` admits `<`, so the first pass swallows `<scr<i>` whole
	// and the `ipt>` remainder is the fixed point — an earlier `<`
	// always wins the leftmost match, which is why no pass can
	// re-compose a tag out of what a previous one left.
	['<scr<i>ipt>', 'ipt>'],
	['<a<b>c>', 'c>'],
	['<>', '<>'],
	['<><a>', '<>'],
	['<a><>', '<>'],
	['unterminated <tag', 'unterminated <tag'],
	['<', '<'],
	['>', '>'],
	['><a>', '>'],
	['<<<<<<<<<<', '<<<<<<<<<<'],
	['<<<<<<<<<<>', ''],
	['<a href="/x" data-ref="y">z</a>', 'z'],
	['<a\nb>c', 'c'],
	['אִיבּוּס <i>ib.</i> 4a', 'אִיבּוּס ib. 4a'],
];

describe('stripTags', () => {
	it.each(CASES)('strips %j to %j', (input, expected) => {
		expect(stripTags(input)).toBe(expected);
	});

	it.each(CASES)('agrees with the old regex on %j', (input) => {
		expect(stripTags(input)).toBe(stripTagsByRegex(input));
	});

	// Two ways the pair could come apart, one alphabet each.
	//
	// They differ in how they SEARCH, not in what they match, so an
	// ordering or restart bug would show on dense `<`/`>` input —
	// random strings hit those paths far more often than hand-written
	// cases do. And the regex carried the `u` flag, matching code
	// POINTS, where `indexOf` works in UTF-16 code units: astral
	// characters, lone surrogates and combining marks are where that
	// distinction could bite.
	it.each([
		['ascii', ['<', '>', 'a', 'b', 'c', ' ', '/', '"']],
		[
			'unicode',
			['<', '>', 'a', '\u{1F600}', '\uD800', '\uDC00', '\u05B8', 'א'],
		],
	])('agrees with the old regex over random tag-dense %s', (_name, chars) => {
		const alphabet = chars.join('');
		// Park–Miller, chosen so the product stays inside the exact
		// integer range — no bitwise masking, and reproducible run to run.
		let seed = 20_260_917;
		const next = (): number => {
			seed = (seed * 16_807) % 2_147_483_647;
			return seed;
		};
		for (let n = 0; n < 5000; n += 1) {
			const length = next() % 40;
			let input = '';
			for (let i = 0; i < length; i += 1) {
				input += alphabet[next() % alphabet.length];
			}
			expect(stripTags(input)).toBe(stripTagsByRegex(input));
		}
	});

	// The property the CodeQL fixed-point loop exists for: no `<…>`
	// fragment can survive by being re-composed out of the remains of
	// an earlier pass.
	it('leaves no strippable tag behind', () => {
		for (const [input] of CASES) {
			const once = stripTags(input);
			expect(stripTags(once)).toBe(once);
		}
	});

	// The regex is quadratic here: `[^>]+` runs to the end of the input
	// at each of the 200,000 start positions. Measured on 2026-09-17,
	// bun 1.3.14: the regex took 21,644 ms on this input, the scanner
	// under 1 ms. The ceiling is deliberately loose — this is a shape
	// check, not a benchmark, and only has to separate O(n) from a
	// twenty-second O(n²).
	it('is linear on a long run of `<` with no `>`', () => {
		const pathological = '<'.repeat(200_000);
		const started = performance.now();
		expect(stripTags(pathological)).toBe(pathological);
		expect(performance.now() - started).toBeLessThan(1000);
	});
});

const BOUNDARIES: [string, Boundary][] = [
	['', 'sense-start'],
	['<i></i>  ', 'sense-start'],
	['foo—', 'dash'],
	['foo.', 'period'],
	['foo;', 'semicolon'],
	['foo,', 'comma'],
	['foo', 'embedded'],
	['foo. ', 'period'],
	['<i>foo.</i>', 'period'],
];

describe('classifyBoundary', () => {
	it.each(BOUNDARIES)('classifies %j as %s', (before, expected) => {
		expect(classifyBoundary(before)).toBe(expected);
	});
});

describe('walkSenses', () => {
	it('yields every node depth-first, parents before children', () => {
		const tree = [
			{ definition: 'a', senses: [{ definition: 'a1' }, { definition: 'a2' }] },
			{ definition: 'b' },
		] as unknown as SourceSense[];
		expect([...walkSenses(tree)].map((s) => s.definition)).toEqual([
			'a',
			'a1',
			'a2',
			'b',
		]);
	});

	it('yields nothing for an empty tree', () => {
		expect([...walkSenses([])]).toHaveLength(0);
	});
});
