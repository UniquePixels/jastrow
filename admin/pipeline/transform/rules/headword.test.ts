import { expect, it } from 'bun:test';
import type { SourceEntry } from '../../body/types.ts';
import { applyTransforms } from '../run.ts';
import type { Rule, TransformResult } from '../types.ts';
import {
	abbrevFusedHeadword,
	genderPairAltDuplicate,
	headwordToken,
	parenAltHeadword,
	phraseAltHeadwordStub,
	refusesStrip,
	strip,
} from './headword.ts';

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

// ----------------------------------------- phrase-alt-headword-stub

const phrase = (alt: string[], headword: string): string[] =>
	applyTransforms(
		{
			alt_headwords: alt,
			content: { senses: [{ definition: 'stub' }] },
			headword,
			rid: 'X00003',
		},
		'text-repairs',
		[phraseAltHeadwordStub],
	).entry.alt_headwords ?? [];

/**
 * Rule 2's cases as a TABLE of `[alt, headword, expected, why]`.
 *
 * Written this way for a reason beyond brevity: the interesting property
 * of this rule is the BOUNDARY between what it expands and what it
 * declines, and a table puts the two a line apart instead of in separate
 * blocks a reader has to hold in their head.
 *
 * TUPLES RATHER THAN OBJECT LITERALS, and that is not a style choice.
 * Seven near-identical `it` bodies read to a duplication detector as
 * exactly that — SonarCloud measured this file at 17.3% and failed the
 * gate. Rewriting them as a table of twelve `{alt, expected, headword,
 * why}` literals made it WORSE, 18.8%, because the repeated key tokens
 * are themselves the duplicated block. One line per case, no repeated
 * keys, is what actually removes it.
 *
 * `why` is not decoration: an unexplained refusal is indistinguishable
 * from a rule that quietly stopped working.
 */
type Case = readonly [
	alt: string,
	headword: string,
	expected: string,
	why: string,
];

// The prefix particle — ד (of), ה (the) — ahead of the initial is text
// the field already holds and rides through verbatim; inventing a vowel
// for it is what the 2026-08-22 ruling forbids. v2's marks live on the
// form object, not in the text, so `*` (reconstructed) and a Roman
// numeral are stripped from the HEADWORD before substituting — but a
// Roman mark on the ITEM is part of that lemma's identity and stays.
const EXPANDS: readonly Case[] = [
	['בַּר א׳', 'אַבְיוּ', 'בַּר אַבְיוּ', 'the plain substitution'],
	['א׳ הַשָּׂדֶה', 'אַדְנֵי', 'אַדְנֵי הַשָּׂדֶה', 'the stub LEADS the phrase'],
	['דינא דג׳', 'גְּרָמֵי', 'דינא דגְּרָמֵי', 'a prefix particle rides through'],
	['מֶלַח דְּזַ׳', '*זַרְוַאי', 'מֶלַח דְּזַרְוַאי', 'the reconstruction mark is stripped'],
	['בֵּי מְ׳', 'מְקוֹשֵׁשׁ II', 'בֵּי מְקוֹשֵׁשׁ', 'the homograph mark is stripped'],
	['בֵּית ז׳ II', 'זַבְדִּין', 'בֵּית זַבְדִּין II', 'a Roman mark on the ITEM stays'],
	['בֵּי בְּ׳', 'בְּלִיעֵי', 'בֵּי בְּלִיעֵי', 'a pointed stub that AGREES expands'],
];

// THE POINTING CONFLICT is the first two. Brian's ruling of 2026-08-22
// killed a rule that assumed the headword's vowels were the variant's;
// here the stub writes a sheva and the headword a hiriq IN THE SAME
// ENTRY, so substituting would pick one. Six corpus occurrences. The
// homograph-only stub is the parent row's job 1, for which no
// deterministic expansion exists. `H00247` leaves it undetermined which
// of two geresh tokens is the headword's; `A02403` is a three-consonant
// truncation whose final letter is not the headword's first, so it is
// not an initial stub at all.
const REFUSES: readonly Case[] = [
	['פּוּנְדְּקָא רְ׳', 'רִטִיבְתָּא', 'פּוּנְדְּקָא רְ׳', 'the pointing disagrees'],
	['הַר הַמּ׳', 'מוֹרִיָּה', 'הַר הַמּ׳', 'a dagesh the lemma does not carry'],
	['אֲמוּ׳ II', 'אֵימוּרִים', 'אֲמוּ׳ II', 'a single-word stub with only a mark'],
	['בַּר׳ ח׳', 'חוּבָּץ I', 'בַּר׳ ח׳', 'two geresh tokens'],
	['אסת׳ )', 'אַסְטְרוֹלוֹגְיָא', 'אסת׳ )', 'a non-initial truncation'],
];

for (const [alt, headword, expected, why] of [...EXPANDS, ...REFUSES]) {
	it(`${why} (${alt})`, () => {
		expect(phrase([alt], headword)).toEqual([expected]);
	});
}

/** Both sides of the boundary must stay populated. A refactor that
 * dropped every refusal would leave a green suite asserting only that
 * the rule fires — the failure mode a rule that does nothing already
 * passes. Asserted here rather than trusted to review. */
it('the case table covers expansions and refusals alike', () => {
	expect(REFUSES.every(([alt, , expected]) => alt === expected)).toBe(true);
	expect(EXPANDS.every(([alt, , expected]) => alt !== expected)).toBe(true);
	expect(EXPANDS.length).toBeGreaterThanOrEqual(5);
	expect(REFUSES.length).toBeGreaterThanOrEqual(5);
});

// ------------------------------------------------ the `copied` gate

/**
 * THE GATE MUST BE LIVE, not merely quiet. `checkNoNewText` verifies
 * each declared `copied` string against the entry's own input before
 * crediting it, so a declaration naming text the entry does not hold is
 * a violation rather than an allowance. Without this test the batch
 * could only claim the gate did not complain.
 */
it('reports a copied declaration the entry does not contain', () => {
	const liar: Rule = {
		apply: (source: SourceEntry): TransformResult => ({
			copied: ['לֹאקַייָם'],
			entry: {
				...source,
				alt_headwords: ['בַּר לֹאקַייָם'],
			},
			records: [
				{ detail: 'fabricated', rid: source.rid, ruleId: 'phrase-liar' },
			],
		}),
		id: 'phrase-liar',
		phase: 'text-repairs',
	};
	expect(() =>
		applyTransforms(entry(['בַּר א׳'], 'X00004'), 'text-repairs', [liar]),
	).toThrow(/phrase-liar/u);
});

/** And the honest declaration passes the same gate — the pair is what
 * makes the negative meaningful. */
it('accepts the honest declaration for every substitution', () => {
	const result = phraseAltHeadwordStub.apply({
		alt_headwords: ['בַּר א׳', 'בֵּי א׳'],
		content: { senses: [{ definition: 'stub' }] },
		headword: 'אַבְיוּ',
		rid: 'X00005',
	});
	expect(result.copied).toEqual(['אַבְיוּ', 'אַבְיוּ']);
	expect(result.records).toHaveLength(2);
});

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
 * an awkward headword. `body/pipeline-links.corpus.test.ts`'s ABSOLUTE pin is
 * what caught it: its differential assertion stayed green because the
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

/**
 * `headwordToken` drops mark TOKENS, and `SUPERSCRIPT` is a bare
 * character class rather than an anchored one — so a token like `'אב²'`
 * would be dropped entirely, losing its letters into a substitution that
 * still looked plausible. Measured at ZERO in this corpus, but the
 * pipeline re-fetches, so the guard returns `''` and `expandStub` reads
 * that as a refusal.
 *
 * The shapes that DO occur must be unaffected, which is the second half
 * of this test: a space-separated superscript and a Roman numeral are
 * still dropped cleanly.
 */
it('refuses a headword whose mark is fused to its letters', () => {
	expect(headwordToken('אב²')).toBe('');
	expect(phrase(['בֵּי א׳'], 'אב²')).toEqual(['בֵּי א׳']);
});

it('still drops a separated superscript or Roman numeral', () => {
	expect(headwordToken('אַבָּא ²')).toBe('אַבָּא');
	expect(headwordToken('מְקוֹשֵׁשׁ II')).toBe('מְקוֹשֵׁשׁ');
	expect(headwordToken('*זַרְוַאי')).toBe('זַרְוַאי');
});
