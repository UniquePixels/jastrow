/**
 * `plural-to-feminine-final-letter-mislink` (batch-2 task 6). Every
 * number in `misc-links.ts`'s module doc came from a corpus walk —
 * recursive through `sense.senses` (senses nest) and
 * `anchors(tokenize(definition))` for the anchors. The corpus-walking
 * tests that re-ran the load-bearing claims (raw population, clean
 * population, retarget reachability) were retired in consolidation
 * step 5 and are listed in `docs/v2/retired-corpus-checks.md`.
 */
import { expect, it } from 'bun:test';
import type { SourceEntry } from '../../types.ts';
import { tokenize } from '../html.ts';
import { anchors } from '../links.ts';
import { applyTransforms } from '../run.ts';
import {
	inCleanPlSpan,
	pluralToFeminineFinalLetter,
	shurukAsYodDisplayCorruption,
	shurukAsYodMatch,
} from './misc-links.ts';

/** `headword` and `content.senses` are load-bearing for this row —
 * the predicate reads the host headword's own skeleton and every
 * sense's definition text — so every fixture carries them, in the
 * shape `rules/geresh.ts`'s tests use. */
const entry = (
	rid: string,
	headword: string,
	...definitions: string[]
): SourceEntry =>
	({
		content: { senses: definitions.map((definition) => ({ definition })) },
		headword,
		rid,
	}) as SourceEntry;

const definitionOf = (
	out: { entry: SourceEntry },
	at = 0,
): string | undefined => out.entry.content.senses[at]?.definition;

/** C01080 גַּנָּב, excerpt: the catalogue's own worked example. Both
 * plural variants (גַּנָּבִים, גַּנָּבִין) anchor to the feminine
 * sibling גַּנָּבִית instead of to themselves. */
const C01080_PLURAL =
	'thief in Nisan or in Tishri is not a thief; a. fr.—Pl. ' +
	'<a dir="rtl" class="refLink" href="/Jastrow,_גַּנָּבִית.1" ' +
	'data-ref="Jastrow, גַּנָּבִית 1">גַּנָּבִים</a>, ' +
	'<a dir="rtl" class="refLink" href="/Jastrow,_גַּנָּבִית.1" ' +
	'data-ref="Jastrow, גַּנָּבִית 1">גַּנָּבִין</a>. Tosef. B. Kam. VII, 8.';

/** A01423 אִיסְטְוָונִית, excerpt: a genuinely feminine headword's OWN
 * plural, ending -יּוֹת, correctly self-linked. Must never fire —
 * the display's final letter is ת, not ם/ן, and the target IS the
 * host. */
const A01423_OWN_PLURAL =
	'basilica. Tosef. Sabb. I, 4; a. fr.—Pl. ' +
	'<a dir="rtl" class="refLink" href="/Jastrow,_אִיסְטְוָונִית.1" ' +
	'data-ref="Jastrow, אִיסְטְוָונִית 1">אִיסְטְוָונִיֹּות</a>. Ohol. l. c.';

/** H00796 חִילְתִּית, excerpt: a headword that ALREADY ends -ית. Its
 * own plural (חִילְתִּין) correctly resolves to itself — a self-link,
 * not a mislink to a "sibling", since there is no sibling. The
 * catalogue's own null model names this exact shape as the one
 * legitimate member the description could produce. */
const H00796_SELF_LINK =
	'(140ᵃ) אין שורין את הח׳ וכ׳ (Mish. ed. ' +
	'<a dir="rtl" class="refLink" href="/Jastrow,_חִילְתִּית.1" ' +
	'data-ref="Jastrow, חִילְתִּית 1">חִילְתִּין</a>) you must not dissolve ' +
	'the resin of asa-foetida in warm water (on the Sabbath).';

/** K00357 כּוֹפֶת, excerpt: the entry's OWN plural (כּוֹפְתִין) is
 * printed unanchored right after "Pl."; a SEPARATE citation two
 * sentences later gives an edition's variant reading
 * (כָּפִיתִין), correctly anchored to a redirect-stub entry whose
 * `alt_headwords` is that exact spelling. Not part of the clean
 * Pl.-construct span, so it must not fire even though it matches the
 * raw shape. */
const K00357_VARIANT_READING =
	'a. e.—Pl. כּוֹפְתִין. Ib. in R. S. to Ohol l. c. (ed. Zuck. a. oth. ' +
	'<a dir="rtl" class="refLink" href="/Jastrow,_כָּפִית.1" ' +
	'data-ref="Jastrow, כָּפִית 1">כָּפִיתִין</a>).';

/** A02980 אַרְגּוּבְלָא, excerpt: opens with a biblical-Hebrew cognate
 * citation, "(= b. h. גִּבְלִים)" — not this entry's plural at all
 * (which is separately, correctly self-linked later in the same
 * definition as אַרְגּוּבְלַיָּא). A "premise false" case: the anchor
 * merely string-matches the row's shape without being a printed
 * plural. */
const A02980_COGNATE_CITATION =
	' (= b. h. <a dir="rtl" class="refLink" href="/Jastrow,_גִּבְלִית.1" ' +
	'data-ref="Jastrow, גִּבְלִית 1">גִּבְלִים</a>) <i>Giblean</i>. Pl. ' +
	'<a dir="rtl" class="refLink" href="/Jastrow,_אַרְגּוּבְלָא.1" ' +
	'data-ref="Jastrow, אַרְגּוּבְלָא 1">אַרְגּוּבְלַיָּא</a>.';

it('unlinks a printed plural anchored to the feminine sibling, keeping the display', () => {
	const out = applyTransforms(
		entry('C01080', 'גַּנָּב', C01080_PLURAL),
		'text-repairs',
		[pluralToFeminineFinalLetter],
	);
	expect(definitionOf(out)).toBe(
		'thief in Nisan or in Tishri is not a thief; a. fr.—Pl. ' +
			'גַּנָּבִים, גַּנָּבִין. Tosef. B. Kam. VII, 8.',
	);
	expect(out.records).toHaveLength(1);
});

it('declares unlinks equal to the anchors it removed', () => {
	const result = pluralToFeminineFinalLetter.apply(
		entry('C01080', 'גַּנָּב', C01080_PLURAL),
	);
	expect(result.unlinks).toBe(2);
});

it('leaves a feminine headword’s own -יּוֹת plural alone', () => {
	const out = applyTransforms(
		entry('A01423', 'אִיסְטְוָונִית', A01423_OWN_PLURAL),
		'text-repairs',
		[pluralToFeminineFinalLetter],
	);
	expect(out.records).toHaveLength(0);
	expect(definitionOf(out)).toBe(A01423_OWN_PLURAL);
});

it('leaves a self-link alone (host headword already ends -ית)', () => {
	const out = applyTransforms(
		entry('H00796', 'חִילְתִּית', H00796_SELF_LINK),
		'text-repairs',
		[pluralToFeminineFinalLetter],
	);
	expect(out.records).toHaveLength(0);
});

it('leaves a variant-reading citation outside the Pl. construct alone', () => {
	const out = applyTransforms(
		entry('K00357', 'כּוֹפֶת', K00357_VARIANT_READING),
		'text-repairs',
		[pluralToFeminineFinalLetter],
	);
	expect(out.records).toHaveLength(0);
});

it('leaves a biblical-cognate citation alone (not the entry’s own plural)', () => {
	const out = applyTransforms(
		entry('A02980', 'אַרְגּוּבְלָא', A02980_COGNATE_CITATION),
		'text-repairs',
		[pluralToFeminineFinalLetter],
	);
	expect(out.records).toHaveLength(0);
});

it('a no-op entry produces no records and no unlinks', () => {
	const result = pluralToFeminineFinalLetter.apply(
		entry('Z99999', 'זְמַן', ' an ordinary entry with no plural anchor at all.'),
	);
	expect(result.records).toHaveLength(0);
	expect(result.unlinks).toBeUndefined();
});

/**
 * `shuruk-as-yod-display-corruption` (batch-2 task 10). Fixtures below
 * are real entries cited by rid, per `misc-links.ts`'s module doc.
 */

/** E00186 הוֹבִיר, full definition: the display splits across a nested
 * `<span dir="rtl">בּיּר</span>` plus trailing text (" I") still inside
 * the anchor — the shape that exercises `rewriteShurukDefinition`'s
 * token-scoped rewrite rather than a naive whole-definition regex. */
const E00186_NESTED_SPAN =
	', <i>Hif.</i> of <a class="refLink" href="/Jastrow,_בּוּר I.1" ' +
	'data-ref="Jastrow, בּוּר I 1"><span dir="rtl">בּיּר</span> I</a>.';

/** S02233 קַשְׁטָן, full definition: a plain (non-nested) corrupt
 * display, the common shape 11 of the 12 members take. */
const S02233_PLAIN =
	', v. <a dir="rtl" class="refLink" href="/Jastrow,_קוּשְׁטָן.1" ' +
	'data-ref="Jastrow, קוּשְׁטָן 1">קיּשְׁטָן</a>';

/** S01462 *קָמֵט, full definition: the SAME href/data-ref
 * (`Jastrow, קוּץ IV 1`) is anchored twice. The first occurrence is
 * already correctly spelled (קוּץ, no corruption). The second carries
 * the display corruption (קיּץ) — but swapping it still yields "קוּץ I",
 * not "קוּץ IV": the printed homograph numeral (I) disagrees with the
 * target's (IV), a co-located but DIFFERENT defect
 * (`homograph-numeral-mismatch`, batch 2 Task 9, `PENDING`). Neither
 * occurrence should fire — the first because it is not corrupt, the
 * second because the swap does not fully resolve it. */
const S01462_HOMOGRAPH_MISMATCH =
	' (<a class="refLink" href="/Jastrow,_קְמַט.1" ' +
	'data-ref="Jastrow, קְמַט 1">preced.</a>; cmp. ' +
	'<a class="refLink" href="/Jastrow,_קוּץ IV.1" ' +
	'data-ref="Jastrow, קוּץ IV 1"><span dir="rtl">קוּץ</span> I</a>) ' +
	'[<i>shrinking</i>,] <i>feeling aversion</i>. ' +
	'<a class="refLink" href="/Yalkut_Shimoni_on_Torah.626" ' +
	'data-ref="Yalkut Shimoni on Torah 626">Yalk. Lev. 626</a>, v. ' +
	'<a class="refLink" href="/Jastrow,_קוּץ IV.1" ' +
	'data-ref="Jastrow, קוּץ IV 1"><span dir="rtl">קיּץ</span> I</a>.';

/** N00423 נוּשְׁקְתָא, full definition: the entry's own plural is
 * correctly self-linked first (נוּשְׁקָאתָא, no corruption). A SECOND
 * occurrence of the same href, an editorial-variant citation
 * "(ed. Wil. ניּשְׁקָתָא)", carries the display corruption AND a
 * genuine vowel difference from the target (קָ vs the target's קְ) —
 * swapping יּ→וּ yields "נוּשְׁקָתָא", still not "נוּשְׁקְתָא". Must not
 * fire: the corruption alone is not this anchor's only divergence
 * from its target. */
const N00423_VOWEL_VARIANT =
	' (<a dir="rtl" class="refLink" href="/Jastrow,_נְשַׁק.1" ' +
	'data-ref="Jastrow, נְשַׁק 1">נְשַׁק</a>) <i>kiss</i>.—Pl. ' +
	'<a dir="rtl" class="refLink" href="/Jastrow,_נוּשְׁקְתָא.1" ' +
	'data-ref="Jastrow, נוּשְׁקְתָא 1">נוּשְׁקָאתָא</a>. ' +
	'<a class="refLink" href="/Aramaic_Targum_to_Proverbs.27.6" ' +
	'data-ref="Aramaic Targum to Proverbs 27:6">Targ. Prov. XXVII, 6</a> ' +
	'(ed. Wil. <a dir="rtl" class="refLink" ' +
	'href="/Jastrow,_נוּשְׁקְתָא.1" data-ref="Jastrow, נוּשְׁקְתָא 1">' +
	'ניּשְׁקָתָא</a>).';

it('rewrites the corrupt display inside a nested <span dir="rtl">, leaving the target alone', () => {
	const out = applyTransforms(
		entry('E00186', 'הוֹבִיר', E00186_NESTED_SPAN),
		'text-repairs',
		[shurukAsYodDisplayCorruption],
	);
	expect(definitionOf(out)).toBe(
		', <i>Hif.</i> of <a class="refLink" href="/Jastrow,_בּוּר I.1" ' +
			'data-ref="Jastrow, בּוּר I 1"><span dir="rtl">בּוּר</span> I</a>.',
	);
	expect(out.records).toHaveLength(1);
});

it('rewrites a plain (non-nested) corrupt display', () => {
	const out = applyTransforms(
		entry('S02233', 'קַשְׁטָן', S02233_PLAIN),
		'text-repairs',
		[shurukAsYodDisplayCorruption],
	);
	expect(definitionOf(out)).toBe(
		', v. <a dir="rtl" class="refLink" href="/Jastrow,_קוּשְׁטָן.1" ' +
			'data-ref="Jastrow, קוּשְׁטָן 1">קוּשְׁטָן</a>',
	);
});

it('leaves the target byte-identical — the link-target gate sees case 1', () => {
	const before = entry('E00186', 'הוֹבִיר', E00186_NESTED_SPAN);
	const beforeDataRef = anchors(tokenize(E00186_NESTED_SPAN))[0]?.dataRef;
	const out = applyTransforms(before, 'text-repairs', [
		shurukAsYodDisplayCorruption,
	]);
	const afterDataRef = anchors(tokenize(definitionOf(out) ?? ''))[0]?.dataRef;
	expect(beforeDataRef).toBe('Jastrow, בּוּר I 1');
	expect(afterDataRef).toBe(beforeDataRef);
});

it('skips a corrupt display whose swap still disagrees with the target (a co-located homograph-numeral defect, not this row)', () => {
	const out = applyTransforms(
		entry('S01462', '*קָמֵט', S01462_HOMOGRAPH_MISMATCH),
		'text-repairs',
		[shurukAsYodDisplayCorruption],
	);
	expect(out.records).toHaveLength(0);
	expect(definitionOf(out)).toBe(S01462_HOMOGRAPH_MISMATCH);
});

it('skips a corrupt display whose swap still disagrees with the target (a genuine vowel variant, not this row)', () => {
	const out = applyTransforms(
		entry('N00423', 'נוּשְׁקְתָא', N00423_VOWEL_VARIANT),
		'text-repairs',
		[shurukAsYodDisplayCorruption],
	);
	expect(out.records).toHaveLength(0);
	expect(definitionOf(out)).toBe(N00423_VOWEL_VARIANT);
});

it('shurukAsYodMatch rejects an anchor with no corrupted glyph at all', () => {
	const [anchor] = anchors(
		tokenize('<a data-ref="Jastrow, בּוּר I 1" href="x">already correct</a>'),
	);
	if (anchor === undefined) {
		throw new Error('expected a fixture anchor');
	}
	expect(shurukAsYodMatch(anchor)).toBe(false);
});

it('a no-op entry returns the same entry reference and produces no records', () => {
	const before = entry(
		'Z99997',
		'זְמַן',
		' an ordinary entry with no shuruk-as-yod anchor at all.',
	);
	const result = shurukAsYodDisplayCorruption.apply(before);
	expect(result.records).toHaveLength(0);
	expect(result.entry).toBe(before);
});

it('inCleanPlSpan is exported and agrees with the module doc’s classification', () => {
	// K00357's variant-reading anchor sits outside the clean span even
	// though it matches the raw shape — the direct regression the unit
	// test above exercises through applyTransforms.
	const tokens = tokenize(K00357_VARIANT_READING);
	const [anchor] = anchors(tokens);
	if (anchor === undefined) {
		throw new Error('expected K00357_VARIANT_READING to contain one anchor');
	}
	expect(inCleanPlSpan(tokens, anchor.open)).toBe(false);
});
