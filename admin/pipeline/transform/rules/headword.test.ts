import { expect, it } from 'bun:test';
import type { SourceEntry } from '../../types.ts';
import { applyTransforms } from '../run.ts';
import { abbrevFusedHeadword, genderPairAltDuplicate } from './headword.ts';

/**
 * Fixture tier for the headword-field rules (spec
 * `docs/specs/2026-08-27-headword-field-integrity-design.md`). The
 * corpus tier this file was split from — following the same split as
 * `links.ts` — was retired in consolidation step 5; its checks are
 * listed in `docs/v2/retired-corpus-checks.md`.
 *
 * Every case runs through `applyTransforms`, not through `apply`
 * directly, so `checkNoNewText` gates each one. That is the real thing
 * rather than a re-derivation of it — and for this batch it is the only
 * gate with anything to say, `markup.ts` and `link-target.ts` having no
 * tags to read in these fields.
 */
// -------------------------------------------- abbrev-fused-headword

const fused = (headword: string, alt?: string[]): SourceEntry =>
	applyTransforms(
		{
			...(alt === undefined ? {} : { alt_headwords: alt }),
			content: { senses: [{ definition: 'stub' }] },
			headword,
			rid: 'X00006',
		},
		'text-repairs',
		[abbrevFusedHeadword],
	).entry;

it('moves a hoisted abbreviation into alt_headwords', () => {
	const out = fused('מִי׳ מִנְטַר');
	expect(out.headword).toBe('מִנְטַר');
	expect(out.alt_headwords).toEqual(['מִי׳']);
});

/** A homograph numeral belongs to the lemma and travels with it. */
it('keeps a homograph mark on the lemma', () => {
	expect(fused('רִי׳ רִכְסָא I').headword).toBe('רִכְסָא I');
});

it('appends to an existing alt_headwords rather than replacing it', () => {
	expect(fused('שִׁי׳ שִׁגְדָּא', ['שְׁגָדָא']).alt_headwords).toEqual(['שְׁגָדָא', 'שִׁי׳']);
});

/**
 * Two of the six are declined because ANOTHER entry's anchor names the
 * old headword string — `K00108` points at `'Jastrow, כִּדְ׳ כַּדְבוּבָא 1'`
 * and `P00132` at `'Jastrow, עָ׳ עַדְיָא 1'`. Rewriting the headword
 * would leave both dangling, and a dead link is worse for a reader than
 * an awkward headword. An ABSOLUTE pin in a corpus check (retired in
 * consolidation step 5, `docs/v2/retired-corpus-checks.md`) is what
 * caught it: its differential assertion stayed green because the
 * rule sits on both sides of that comparison.
 */
it('refuses a headword another entry links to', () => {
	expect(fused('כִּדְ׳ כַּדְבוּבָא').headword).toBe('כִּדְ׳ כַּדְבוּבָא');
	expect(fused('עָ׳ עַדְיָא').headword).toBe('עָ׳ עַדְיָא');
});

/**
 * `A02002`. The row's `reason` claims all seven alphabetize by their
 * SECOND token; this one alphabetizes by its THIRD (`אָמוּס`, between
 * `אֱמוּנָה` and `אֲמוֹרָא`) and is the toponym *Kfar Ammus* with its
 * INTERIOR token stubbed — a phrase stub in the headword field, not a
 * hoisted abbreviation. Refused by requiring the geresh token first.
 */
it('refuses a stub that is not the first token', () => {
	expect(fused('*כְּפַר א׳ אָמוּס').headword).toBe('*כְּפַר א׳ אָמוּס');
});

it('leaves a single-token headword by identity', () => {
	const source: SourceEntry = {
		content: { senses: [{ definition: 'stub' }] },
		headword: 'מִנְטַר',
		rid: 'X00007',
	};
	expect(abbrevFusedHeadword.apply(source).entry).toBe(source);
});

// ------------------------------ gender-pair-headword-line-collapse

const deduped = (alt: string[], morphology?: string): SourceEntry =>
	applyTransforms(
		{
			alt_headwords: alt,
			content: {
				senses: [{ definition: 'stub' }],
				...(morphology === undefined ? {} : { morphology }),
			},
			headword: 'אוּכָּם',
			rid: 'X00008',
		},
		'text-repairs',
		[genderPairAltDuplicate],
	).entry;

it('drops an adjacent duplicate, keeping first-occurrence order', () => {
	expect(deduped(['אוּכָּמָא', 'אוּכָּמָא', 'אוּכַּמְתָּא']).alt_headwords).toEqual([
		'אוּכָּמָא',
		'אוּכַּמְתָּא',
	]);
});

it('drops a duplicate at a distance', () => {
	expect(deduped(['חֵר׳', 'חֵירוּפִין', 'חֵר׳']).alt_headwords).toEqual([
		'חֵר׳',
		'חֵירוּפִין',
	]);
});

/**
 * The morphology half is NOT repaired, and this test is the guard on
 * that decision rather than a description of it. `'f.'` is wrong about
 * a masculine headword, but `'m.'` is text the entry does not hold and
 * `allows` flattens to codepoints — see the rule's docstring.
 */
it('leaves content.morphology untouched', () => {
	expect(deduped(['אוּכָּמָא', 'אוּכָּמָא'], 'f.').content.morphology).toBe('f.');
});

it('leaves a duplicate-free array by identity', () => {
	const source: SourceEntry = {
		alt_headwords: ['אוּכָּמָא', 'אוּכַּמְתָּא'],
		content: { senses: [{ definition: 'stub' }] },
		headword: 'אוּכָּם',
		rid: 'X00009',
	};
	expect(genderPairAltDuplicate.apply(source).entry).toBe(source);
});
