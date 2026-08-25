/**
 * The gershayim predicate, at the fixture tier (batch-3a spec §4.1).
 *
 * Every case here is a property of the substitution rather than a
 * story about one string: it is in place, it is idempotent, it never
 * changes length, and it holds off all but 2,305 of the 1,349,919
 * ASCII quotes across the 256,432 walked fields — every other one is
 * an attribute delimiter or ordinary punctuation.
 *
 * The corpus tier — the counts, the locus partition and the gates —
 * lives in `rules/gershayim.test.ts`, which has entries to run rules
 * over.
 */
import { expect, it } from 'bun:test';
import { GERSHAYIM, repairTags, repairText } from './gershayim.ts';

const Q = String.fromCharCode(34);

it('repairs a quote flanked by Hebrew on both sides', () => {
	expect(repairText(`הקב${Q}ה`)).toBe(`הקב${GERSHAYIM}ה`);
});

it('leaves attribute delimiters alone', () => {
	const html = `<a href=${Q}/x${Q} data-ref=${Q}y${Q}>אב</a>`;
	expect(repairText(html)).toBe(html);
	expect(repairTags(html)).toBe(html);
});

it('leaves Latin-flanked and one-sided quotes alone', () => {
	expect(repairText(`say ${Q}hello${Q}`)).toBe(`say ${Q}hello${Q}`);
	expect(repairText(`א${Q} ב`)).toBe(`א${Q} ב`);
	expect(repairText(`a${Q}ב`)).toBe(`a${Q}ב`);
	expect(repairText(`א${Q}b`)).toBe(`א${Q}b`);
});

it('takes both quotes of a two-abbreviation token', () => {
	// A00253 and U01408's shape. A CONSUMING `[HEBREW]"[HEBREW]` matches
	// `ב"ג` and resumes past the `ג`, so the second quote is never
	// examined — the two occurrences spec §2 measures as lost.
	expect(repairText(`א${Q}ב${Q}ג`)).toBe(`א${GERSHAYIM}ב${GERSHAYIM}ג`);
});

it('tolerates a combining mark between the letter and the quote', () => {
	// M01940's shape: U+0307 sits on the left-hand letter, so a bare
	// `(?<=[HEBREW])` lookbehind misses it (spec §2, one occurrence).
	expect(repairText(`תקל̇${Q}ה`)).toBe(`תקל̇${GERSHAYIM}ה`);
});

it('tolerates the vowel points Jastrow sets on the left letter', () => {
	// מַנְצְפַ"ךְ and three siblings: a patah stands between the letter and
	// the quote. Task 1's re-review measured that a lookbehind narrowed
	// to bare letters refuses four honest repairs.
	expect(repairText(`מַנְצְפַ${Q}ךְ`)).toBe(`מַנְצְפַ${GERSHAYIM}ךְ`);
});

it('is idempotent', () => {
	const once = repairText(`הקב${Q}ה`);
	expect(repairText(once)).toBe(once);
	const tags = repairTags(`<a data-ref=${Q}Jastrow, אל${Q}ף 1${Q}>x</a>`);
	expect(repairTags(tags)).toBe(tags);
});

it('returns the input string itself when nothing matches', () => {
	const clean = 'nothing to do here';
	expect(repairText(clean)).toBe(clean);
	expect(repairTags(clean)).toBe(clean);
});

it('never changes codepoint length', () => {
	const input = `אל${Q}ף and הקב${Q}ה <a data-ref=${Q}Jastrow, אל${Q}ף 1${Q}>x</a>`;
	expect([...repairText(input)]).toHaveLength([...input].length);
	expect([...repairTags(input)]).toHaveLength([...input].length);
});

it('repairText leaves tag interiors alone and repairTags takes them', () => {
	const html = `<a data-ref=${Q}Jastrow, אל${Q}ף 1${Q}>אל${Q}ף</a>`;
	expect(repairText(html)).toBe(
		`<a data-ref=${Q}Jastrow, אל${Q}ף 1${Q}>אל${GERSHAYIM}ף</a>`,
	);
	expect(repairTags(html)).toBe(
		`<a data-ref=${Q}Jastrow, אל${GERSHAYIM}ף 1${Q}>אל${Q}ף</a>`,
	);
});

it('the two loci compose to the whole population, in either order', () => {
	// The disjointness argument, at the fixture tier: neither repair can
	// create or destroy the other's occurrences, because the
	// substitution never writes or removes a `<` or a `>`. Measured over
	// the whole corpus in `rules/gershayim.test.ts`.
	const html = `<a data-ref=${Q}Jastrow, אל${Q}ף 1${Q}>אל${Q}ף</a> הקב${Q}ה`;
	const both = `<a data-ref=${Q}Jastrow, אל${GERSHAYIM}ף 1${Q}>אל${GERSHAYIM}ף</a> הקב${GERSHAYIM}ה`;
	expect(repairTags(repairText(html))).toBe(both);
	expect(repairText(repairTags(html))).toBe(both);
});

it('an unterminated tag does not swallow the rest of the field', () => {
	// `<[^<>]*>` needs a `>` before the next `<`, so a `<` with no
	// terminator is text — and the text after it stays repairable rather
	// than being frozen to the end of the field.
	expect(repairText(`<a href=${Q}x הקב${Q}ה`)).toBe(
		`<a href=${Q}x הקב${GERSHAYIM}ה`,
	);
	expect(repairTags(`<a href=${Q}x הקב${Q}ה`)).toBe(`<a href=${Q}x הקב${Q}ה`);
});
