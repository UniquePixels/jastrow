import { expect, it } from 'bun:test';
import type { SourceEntry } from '../../body/types.ts';
import { applyTransforms } from '../run.ts';
import { parenAltHeadword, refusesStrip, strip } from './headword.ts';

/**
 * Fixture tier for the headword-field rules (spec
 * `docs/specs/2026-08-27-headword-field-integrity-design.md`). The
 * corpus tier is `headword.corpus.test.ts`; the split follows
 * `links.test.ts` / `links.corpus.test.ts`.
 *
 * Every case runs through `applyTransforms`, not through `apply`
 * directly, so `checkNoNewText` gates each one. That is the real thing
 * rather than a re-derivation of it — and for this batch it is the only
 * gate with anything to say, `markup.ts` and `link-target.ts` having no
 * tags to read in these fields.
 */

const entry = (alt: string[], rid = 'X00001'): SourceEntry => ({
	alt_headwords: alt,
	content: { senses: [{ definition: 'stub' }] },
	headword: 'הֶדְוֶורְד',
	rid,
});

const run = (alt: string[]): string[] =>
	applyTransforms(entry(alt), 'text-repairs', [parenAltHeadword]).entry
		.alt_headwords ?? [];

// ------------------------------------------------ the seven sub-shapes

it('strips a wrapped-whole item', () => {
	expect(run(['(אוֹב)'])).toEqual(['אוֹב']);
});

/** The `*` is v2's reconstructed mark and sits OUTSIDE the delimiters;
 * it must survive, because all 18 starred alts in the corpus are this
 * shape and the decomposer reads the mark after this rule runs. */
it('keeps the reconstruction mark on a starred wrapped item', () => {
	expect(run(['*(אוּסְיָא)'])).toEqual(['*אוּסְיָא']);
});

/** A Roman homograph numeral sits outside the delimiters too, and the
 * space the strip leaves behind must be collapsed rather than doubled —
 * 12 corpus occurrences would otherwise carry a double space. */
it('collapses the space a mark-carrying item leaves behind', () => {
	expect(run(['(פַּנְיָה ) I'])).toEqual(['פַּנְיָה I']);
	expect(run(['(אַפְרִיקָא) I'])).toEqual(['אַפְרִיקָא I']);
});

/** A00083's shape: one print group torn at its internal comma, the
 * delimiters left on the two fragments. Both halves strip, and the
 * result is the two variant forms the group held. */
it('strips both halves of an adjacent torn group', () => {
	expect(run(['(אַבְזָקָא', 'אַבְזָקָה)'])).toEqual(['אַבְזָקָא', 'אַבְזָקָה']);
});

/** D00661's shape: the group spans an intervening item, which is inside
 * the parentheses as well and carries no delimiter of its own. */
it('strips a group spanning an intervening item', () => {
	expect(run(['(דיסגנים', 'דיסגניס', 'דיסקניס)'])).toEqual([
		'דיסגנים',
		'דיסגניס',
		'דיסקניס',
	]);
});

it('strips an orphaned open and an orphaned close', () => {
	expect(run(['(בֶּהֱמִי'])).toEqual(['בֶּהֱמִי']);
	expect(run(['מַאוָז)'])).toEqual(['מַאוָז']);
});

// ------------------------------------------------------- the refusals

/**
 * `A01480`. The parenthesis is INTERIOR and marks an optional final
 * letter — print's convention for a form attested with and without the
 * aleph. Stripping yields the plene reading and silently discards the
 * other one, so the rule declines it.
 */
it('refuses an interior optional-letter paren', () => {
	expect(run(['אִיסְפְּלָנִית(א)'])).toEqual(['אִיסְפְּלָנִית(א)']);
	expect(refusesStrip('אִיסְפְּלָנִית(א)')).toBe(true);
});

/**
 * `A01394`. A close delimiter mid-string whose open lives in a
 * DIFFERENT item — the tear landing at the wrong offset. Stripping
 * gives `'אֵינָשׁ אִינְשָׁא'`, a two-word item that is neither a phrase
 * lemma nor a spelling of anything; repairing it means re-splitting,
 * which is a different operation. Its sibling open-only item is a plain
 * orphan and IS stripped, which is correct either way.
 */
it('refuses a stray close, and still strips its sibling', () => {
	expect(run(['אֵינָשׁ) אִינְשָׁא', '(אֵינָשָׁא', 'אִינִישׁ'])).toEqual([
		'אֵינָשׁ) אִינְשָׁא',
		'אֵינָשָׁא',
		'אִינִישׁ',
	]);
});

/** Every shape the rule DOES repair must be refused by nothing — a
 * refusal predicate that crept wider would silently stop repairing, and
 * a rule that does nothing passes every gate. */
it('refuses none of the repaired shapes', () => {
	for (const item of [
		'(אוֹב)',
		'*(אוּסְיָא)',
		'(אַפְרִיקָא) I',
		'(אַבְזָקָא',
		'אַבְזָקָה)',
		'(בֶּהֱמִי',
		'מַאוָז)',
	]) {
		expect(refusesStrip(item)).toBe(false);
	}
});

// ------------------------------------------------------- housekeeping

it('leaves an entry without alt_headwords by identity', () => {
	const source: SourceEntry = {
		content: { senses: [{ definition: 'stub' }] },
		headword: 'הֶדְוֶורְד',
		rid: 'X00002',
	};
	const result = parenAltHeadword.apply(source);
	expect(result.entry).toBe(source);
	expect(result.records).toEqual([]);
});

it('leaves a paren-free array by identity', () => {
	const source = entry(['אֵיב', 'אָב']);
	const result = parenAltHeadword.apply(source);
	expect(result.entry).toBe(source);
	expect(result.records).toEqual([]);
});

/** One record per CHANGED ITEM, naming the occurrence rather than the
 * entry, so the migration report reads. `count.ts` measures entries
 * with a non-empty `records`, so the finer granularity costs nothing
 * there. */
it('records one entry per changed item', () => {
	const result = parenAltHeadword.apply(entry(['(אַבְזָקָא', 'אַבְזָקָה)', 'אָב']));
	expect(result.records).toEqual([
		{
			detail: '(אַבְזָקָא → אַבְזָקָא',
			rid: 'X00001',
			ruleId: 'parenthesized-alt-headword',
		},
		{
			detail: 'אַבְזָקָה) → אַבְזָקָה',
			rid: 'X00001',
			ruleId: 'parenthesized-alt-headword',
		},
	]);
});

it('strips nothing from an item that has no delimiter', () => {
	expect(strip('אָב')).toBe('אָב');
});
