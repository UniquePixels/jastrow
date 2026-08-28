import { expect, it } from 'bun:test';
import type { SourceEntry } from '../../body/types.ts';
import { applyTransforms } from '../run.ts';
import type { Rule, TransformResult } from '../types.ts';
import {
	abbrevFusedHeadword,
	genderPairAltDuplicate,
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

it('substitutes the headword for a stubbed token', () => {
	expect(phrase(['בַּר א׳'], 'אַבְיוּ')).toEqual(['בַּר אַבְיוּ']);
	expect(phrase(['א׳ הַשָּׂדֶה'], 'אַדְנֵי')).toEqual(['אַדְנֵי הַשָּׂדֶה']);
});

/** The stub may carry a prefix particle — `ד` (of), `ה` (the) — ahead of
 * the initial. It is text the field already holds and is carried
 * through verbatim; inventing a vowel for it would be exactly what the
 * 2026-08-22 ruling forbids. */
it('carries a prefix particle through the substitution', () => {
	expect(phrase(['דינא דג׳'], 'גְּרָמֵי')).toEqual(['דינא דגְּרָמֵי']);
});

/** v2's marks live on the form object, not in the text: `*` is
 * `reconstructed` and a Roman numeral is `homograph`. Neither belongs
 * inside a toponym. */
it('strips the headword marks before substituting', () => {
	expect(phrase(['מֶלַח דְּזַ׳'], '*זַרְוַאי')).toEqual(['מֶלַח דְּזַרְוַאי']);
	expect(phrase(['בֵּי מְ׳'], 'מְקוֹשֵׁשׁ II')).toEqual(['בֵּי מְקוֹשֵׁשׁ']);
});

/** A homograph numeral on the ITEM is part of that lemma's identity and
 * survives; it is also the token the predicate must ignore when
 * deciding whether the item is a phrase at all. */
it('leaves a Roman mark on the item in place', () => {
	expect(phrase(['בֵּית ז׳ II'], 'זַבְדִּין')).toEqual(['בֵּית זַבְדִּין II']);
});

/** A single-word stub carrying only a homograph numeral is the parent
 * row's job 1, for which no deterministic expansion exists. The
 * predicate must not reach it. */
it('does not touch a single-word stub with a homograph mark', () => {
	expect(phrase(['אֲמוּ׳ II'], 'אֵימוּרִים')).toEqual(['אֲמוּ׳ II']);
});

// ------------------------------------------- rule 2's four refusals

/**
 * THE POINTING CONFLICT, and the reason it is refused rather than
 * resolved. Brian's ruling of 2026-08-22 killed a rule that assumed the
 * headword's vowels were the variant's. Here the stub writes a sheva
 * and the headword a hiriq, in the same entry; substituting would pick
 * one. Six corpus occurrences, all refused.
 */
it('refuses a stub whose pointing disagrees with the headword', () => {
	expect(phrase(['פּוּנְדְּקָא רְ׳'], 'רִטִיבְתָּא')).toEqual(['פּוּנְדְּקָא רְ׳']);
	expect(phrase(['הַר הַמּ׳'], 'מוֹרִיָּה')).toEqual(['הַר הַמּ׳']);
});

/** 52 of the 58 pointed stubs agree with the headword exactly, so
 * nothing is chosen for them and they expand normally. */
it('expands a pointed stub that agrees with the headword', () => {
	expect(phrase(['בֵּי בְּ׳'], 'בְּלִיעֵי')).toEqual(['בֵּי בְּלִיעֵי']);
});

/** `H00247`: two geresh tokens, so which one is the headword's is
 * undetermined. `A02403`: a three-consonant truncation whose final
 * letter is not the headword's first, so it is not an initial stub at
 * all. */
it('refuses an ambiguous or non-initial stub', () => {
	expect(phrase(['בַּר׳ ח׳'], 'חוּבָּץ I')).toEqual(['בַּר׳ ח׳']);
	expect(phrase(['אסת׳ )'], 'אַסְטְרוֹלוֹגְיָא')).toEqual(['אסת׳ )']);
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
	expect(fused('עָ׳ עַדְיָא', ['עָדִיתָא']).alt_headwords).toEqual(['עָדִיתָא', 'עָ׳']);
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
