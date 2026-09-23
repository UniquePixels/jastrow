// biome-ignore-all lint/style/noExcessiveLinesPerFile: a table-driven suite; the cases and the fixtures they share read as one unit.
/**
 * `ib-yoma-2a` (batch-2 task 7). Every number in `anaphora.ts`'s module
 * doc and in `docs/archive/catalogue-audit/ib-yoma-2a.md` came from a
 * corpus walk over `sense.senses` (senses nest) and
 * `anchors(tokenize(definition))` for the anchors. The corpus-walking
 * tests that re-ran those load-bearing claims (population, fire count,
 * the whole decline census, the control that validates the repair, the
 * mechanism that identifies the defect, and the absence of any locus a
 * compose could have used) were retired in consolidation step 5 and are
 * listed in `docs/archive/retired-corpus-checks.md`.
 *
 * The unit tests run through `applyTransforms`, not `ibAnaphora.apply`,
 * so `link-target.ts`'s gate — the whole reason this batch exists —
 * runs on every fixture. A rule writing a target the entry does not
 * hold would throw here rather than pass quietly.
 */
import { expect, it } from 'bun:test';
import type { SourceEntry } from '../../types.ts';
import { type Token, tokenize } from '../html.ts';
import { type Anchor, anchors } from '../links.ts';
import { applyTransforms } from '../run.ts';
import {
	antecedentOf,
	gapBetween,
	HREF_LOCUS,
	INTERVENING_CITATION,
	ibAnaphora,
	isSifreCitation,
	isSinkMember,
	isTargumCitation,
	isTargumMember,
	REF_LOCUS,
	sifreAnaphora,
	TARGUM_WORKS,
	targumAnaphora,
	textBetween,
} from './anaphora.ts';

const SINK = 'Yoma 2a';

const entry = (rid: string, ...definitions: string[]): SourceEntry =>
	({
		content: { senses: definitions.map((definition) => ({ definition })) },
		headword: 'אַדְרָא',
		rid,
	}) as SourceEntry;

const definitionOf = (
	out: { entry: SourceEntry },
	at = 0,
): string | undefined => out.entry.content.senses[at]?.definition;

const run = (e: SourceEntry): { entry: SourceEntry; records: unknown[] } =>
	applyTransforms(e, 'text-repairs', [ibAnaphora]);

/** A00445 אַדְרָא, excerpt — the catalogue's worked example, bytes from
 * `data/source/jastrow-dictionary.jsonl`. Three anchors: a `Jastrow, …`
 * cross-reference (skipped — a headword is not a place), the Yerushalmi
 * citation that IS the antecedent, and the bare `Ib.` that fell to the
 * sink. The antecedent's `href` carries no leading slash while the
 * sink's does; the repair copies its spelling verbatim rather than
 * normalising it. */
const A00445 =
	' (v. <a dir="rtl" class="refLink" href="/Jastrow,_אָדַר.1" ' +
	'data-ref="Jastrow, אָדַר 1">אָדַר</a> 3) <i>skin, hide</i>. ' +
	'<a class="refLink" href="Jerusalem_Talmud_Maaser_Sheni.4.6.11" ' +
	'data-ref="Jerusalem Talmud Maaser Sheni 4:6:11">Y. Maas. Sh. IV, 55ᶜ</a> ' +
	'<span dir="rtl">אדר תורתא</span> hide of a cow. ' +
	'<a class="refLink" href="/Yoma.2a" data-ref="Yoma 2a">Ib.</a> ' +
	'<span dir="rtl">אדרא</span>';

/** A03210 אָרַס, excerpt: the antecedent ("Y. Bets. V, 63ᵃ bot.") is
 * PRINTED but never anchored, so the first anchor is the sink itself. */
const A03210_NO_ANCHOR =
	'to betroth to one’s self. Y. Bets. V, 63ᵃ bot. ' +
	'<span dir="rtl">לְאָרֵס</span>. ' +
	'<a class="refLink" href="/Yoma.2a" data-ref="Yoma 2a">Ib.</a> ' +
	'<span dir="rtl">הא לארס יְאָרֵס</span> but betroth he may';

/** C00103 גִּיבּוּל, excerpt: the only preceding anchor is a
 * `Jastrow, …` cross-reference; the real antecedent is unanchored. */
const C00103_LEXICAL_ONLY =
	'same. Y. Ter. V, 43ᶜ bot. <span dir="rtl">הפריש ' +
	'<a dir="rtl" class="refLink" href="/Jastrow,_גְּבִישָׁתָא.1" ' +
	'data-ref="Jastrow, גְּבִישָׁתָא 1">גי׳</a></span> he set apart. ' +
	'<a class="refLink" href="/Yoma.2a" data-ref="Yoma 2a">Ib.</a> ' +
	'<span dir="rtl">מיגבול חמש</span>';

/** A03095 אָרַךְ, excerpt: an anchored Targum antecedent, then TWO
 * unanchored Yerushalmi citations, then the sink. The nearest ANCHOR is
 * not the nearest CITATION — copying it would write a different work
 * past a gate that cannot see it. */
const A03095_INTERVENING =
	'<a class="refLink" href="/Aramaic_Targum_to_Job.6.11" ' +
	'data-ref="Aramaic Targum to Job 6:11">Targ. Job VI, 11</a>' +
	'.—Y. Yoma VI, 43ᵈ <span dir="rtl">אורכין צבחר</span> wait a while. ' +
	'Y. R. Hash. I, 57ᵃ bot. <span dir="rtl">הוות מוֹרְכָה וכ׳</span> ' +
	'she waited a whole year. ' +
	'<a class="refLink" href="/Yoma.2a" data-ref="Yoma 2a">Ib.</a> ' +
	'<span dir="rtl">מוֹרְכָא</span>';

it('a bare Ib. copies the antecedent citation’s target whole (gate case 2)', () => {
	const out = run(entry('A00445', A00445));
	expect(definitionOf(out)).toContain(
		'<a class="refLink" href="Jerusalem_Talmud_Maaser_Sheni.4.6.11" ' +
			'data-ref="Jerusalem Talmud Maaser Sheni 4:6:11">Ib.</a>',
	);
	expect(definitionOf(out)).not.toContain(SINK);
	expect(out.records).toHaveLength(1);
});

it('the copy is a pure attribute rewrite — every other byte is unchanged', () => {
	const after = definitionOf(run(entry('A00445', A00445))) ?? '';
	const undone = after.replace(
		'href="Jerusalem_Talmud_Maaser_Sheni.4.6.11" ' +
			'data-ref="Jerusalem Talmud Maaser Sheni 4:6:11">Ib.',
		'href="/Yoma.2a" data-ref="Yoma 2a">Ib.',
	);
	expect(undone).toBe(A00445);
});

it('declares nothing: no composed claim, no copied strings, no unlinks', () => {
	const result = ibAnaphora.apply(entry('A00445', A00445));
	expect(result.composed).toBeUndefined();
	expect(result.copied).toBeUndefined();
	expect(result.unlinks).toBeUndefined();
});

it('declines when the definition holds no preceding anchor at all', () => {
	const out = run(entry('A03210', A03210_NO_ANCHOR));
	expect(out.records).toHaveLength(0);
	expect(definitionOf(out)).toBe(A03210_NO_ANCHOR);
});

it('declines when every preceding anchor is a Jastrow cross-reference', () => {
	const out = run(entry('C00103', C00103_LEXICAL_ONLY));
	expect(out.records).toHaveLength(0);
	expect(definitionOf(out)).toBe(C00103_LEXICAL_ONLY);
});

it('declines when an unanchored citation intervenes', () => {
	const out = run(entry('A03095', A03095_INTERVENING));
	expect(out.records).toHaveLength(0);
	expect(definitionOf(out)).toBe(A03095_INTERVENING);
});

it('leaves non-members alone: an Ib. outside the sink, and a sink anchor that is not an anaphor', () => {
	const other =
		'<a class="refLink" href="/Gittin.43b" data-ref="Gittin 43b:8">Git. 43ᵇ</a> ' +
		'<a class="refLink" href="/Gittin.43b" data-ref="Gittin 43b:9">Ib.</a> and ' +
		'<a class="refLink" href="/Yoma.2a" data-ref="Yoma 2a">Yoma 2ᵃ</a>';
	const out = run(entry('X00000', other));
	expect(out.records).toHaveLength(0);
	expect(definitionOf(out)).toBe(other);
});

it('a locus in the display is declined, not composed', () => {
	// Synthetic: no member carries a locus (audit §6), so this shape
	// exists only to pin the refusal. `Ib. 35ᵃ` is not a bare anaphor,
	// so the population predicate rejects it and no `composed` claim is
	// ever produced.
	const withLocus =
		'<a class="refLink" href="/Shabbat.30b" data-ref="Shabbat 30b">Sabb. 30ᵇ</a> ' +
		'<a class="refLink" href="/Yoma.2a" data-ref="Yoma 2a">Ib. 35ᵃ</a>';
	const result = ibAnaphora.apply(entry('X00001', withLocus));
	expect(result.records).toHaveLength(0);
	expect(result.composed).toBeUndefined();
	expect(definitionOf(result)).toBe(withLocus);
});

it('declines an antecedent that ENCLOSES the anaphor rather than preceding it', () => {
	// Anchors nest (477 pairs in definition text). A citation anchor
	// whose `</a>` lands after the anaphor's `<a>` wraps it, so the
	// "text between" them is a backwards range and reads as empty —
	// the gap check would pass vacuously on the one shape it exists to
	// catch. Measured 0 such pairs corpus-wide (2026-08-23), so this is
	// a guard against a shape the corpus does not currently hold.
	const enclosing =
		'<a class="refLink" href="/Shabbat.30b" data-ref="Shabbat 30b">Sabb. 30ᵇ ' +
		'<a class="refLink" href="/Yoma.2a" data-ref="Yoma 2a">Ib.</a> tail</a>';
	const list = anchors(tokenize(enclosing));
	const at = list.findIndex(isSinkMember);
	expect(at).toBeGreaterThan(-1);
	const outer = list[at - 1];
	const inner = list[at];
	if (outer === undefined || inner === undefined) {
		throw new Error('expected an enclosing pair');
	}
	expect(outer.close).toBeGreaterThan(inner.open);
	expect(antecedentOf(tokenize(enclosing), list, at)).toBeUndefined();
	const out = run(entry('X00002', enclosing));
	expect(out.records).toHaveLength(0);
	expect(definitionOf(out)).toBe(enclosing);
});

it('repairs a member inside a nested sense, recursing through sense.senses', () => {
	const nested = {
		content: {
			senses: [{ definition: 'outer.', senses: [{ definition: A00445 }] }],
		},
		headword: 'אַדְרָא',
		rid: 'A00445',
	} as SourceEntry;
	const out = applyTransforms(nested, 'text-repairs', [ibAnaphora]);
	expect(out.entry.content.senses[0]?.senses?.[0]?.definition).toContain(
		'data-ref="Jerusalem Talmud Maaser Sheni 4:6:11">Ib.',
	);
	expect(out.records).toHaveLength(1);
});

it('INTERVENING_CITATION reads the four cues and ignores the antecedent’s own tail', () => {
	// "bot."/"top" are almost always the tail of the antecedent's OWN
	// citation, so they are not cues. The corpus cost of adding them is
	// measured below, in `POSITION_MARKER`'s own test.
	expect(INTERVENING_CITATION.test(' bot. חֲמָרְתִּי my ass. ')).toBe(false);
	expect(INTERVENING_CITATION.test(' top ולא מ׳. Ib. יש לו מ׳ ')).toBe(false);
	expect(INTERVENING_CITATION.test('.—Y. Yoma VI, 43ᵈ wait a while. ')).toBe(
		true,
	);
	expect(INTERVENING_CITATION.test(' (v. Taan. l. c.).—V. ')).toBe(true);
	expect(INTERVENING_CITATION.test(' Gen. R. s. 31 ')).toBe(true);
});

// ------------------------------------------------- sifre-ib-resolves-to-yalkut

/** E00476 הִיפָּטִיקוֹס, excerpt — the only member of the Sifré row the
 * entry's own input can repair, and the one instance in this batch
 * that exercises gate case 3. Three things have to be true at once and
 * all three are real bytes: the anchored `Sifré Deut. 309` supplies
 * the work, an unrelated `Yalk. ib. 542` sits BETWEEN it and the
 * anaphor (so the arm has to walk past a nearer citation of another
 * work), and the anaphor's own display carries the section number. */
const E00476 =
	'<a class="refLink" href="/Sifrei_Devarim.309.6" ' +
	'data-ref="Sifrei Devarim 309:6">Sifré Deut. 309</a> [read:] ' +
	'<span dir="rtl">אם היה ה׳ שגדול משניהם</span> if he were a hypaticos ' +
	'who is higher than either of them; ' +
	'<a class="refLink" href="/Yalkut_Shimoni_on_Torah.542" ' +
	'data-ref="Yalkut Shimoni on Torah 542">Yalk. ib. 542</a>.—Sifré ' +
	'<a class="refLink" href="/Yalkut_Shimoni_on_Torah.330.3" ' +
	'data-ref="Yalkut Shimoni on Torah 330:3">ib. 330</a>.—Pl. ' +
	'<span dir="rtl">הִיפָּטִיקִין</span>.';

/** V00301 תורמין, excerpt: `Sifré ib. 218` with a Yalkut antecedent and
 * no Sifré anchor anywhere in the entry. The work name `Sifrei
 * Devarim` would have to be invented out of the abbreviation plus the
 * book shown on the Yalkut anchor's DISPLAY — inference, not
 * movement. Four of its five siblings (K00811, N00892, Q01325,
 * T00064) are the same shape. */
const V00301_NO_SIFRE =
	', <a class="refLink" href="/Yalkut_Shimoni_on_Torah.929" ' +
	'data-ref="Yalkut Shimoni on Torah 929">Yalk. Deut. 929</a>; Sifré ' +
	'<a class="refLink" href="/Yalkut_Shimoni_on_Torah.218" ' +
	'data-ref="Yalkut Shimoni on Torah 218">ib. 218</a> (added in ed. Fr.)';

const sifre = (e: SourceEntry): { entry: SourceEntry; records: unknown[] } =>
	applyTransforms(e, 'text-repairs', [sifreAnaphora]);

it('Sifré ib. N composes the antecedent’s work with the display’s own number (gate case 3)', () => {
	const out = sifre(entry('E00476', E00476));
	expect(definitionOf(out)).toContain(
		'<a class="refLink" href="/Sifrei_Devarim.330" ' +
			'data-ref="Sifrei Devarim 330">ib. 330</a>',
	);
	expect(definitionOf(out)).not.toContain('Yalkut_Shimoni_on_Torah.330.3');
	expect(out.records).toHaveLength(1);
});

it('the compose is declared, and declared with the target the gate keys on', () => {
	const result = sifreAnaphora.apply(entry('E00476', E00476));
	// `link-target.ts` matches a claim to an anchor by
	// `claim.target === anchor.dataRef`, so a claim naming anything
	// else licenses nothing and the anchor fails as fabricated.
	expect(result.composed).toEqual([
		{ from: 'Sifrei Devarim 309:6', target: 'Sifrei Devarim 330' },
	]);
	expect(result.copied).toBeUndefined();
	expect(result.unlinks).toBeUndefined();
});

it('the compose is a pure attribute rewrite — every other byte is unchanged', () => {
	const after = definitionOf(sifre(entry('E00476', E00476))) ?? '';
	const undone = after.replace(
		'href="/Sifrei_Devarim.330" data-ref="Sifrei Devarim 330">ib. 330',
		'href="/Yalkut_Shimoni_on_Torah.330.3" ' +
			'data-ref="Yalkut Shimoni on Torah 330:3">ib. 330',
	);
	expect(undone).toBe(E00476);
});

it('declines when the entry holds no Sifré antecedent', () => {
	const out = sifre(entry('V00301', V00301_NO_SIFRE));
	expect(out.records).toHaveLength(0);
	expect(definitionOf(out)).toBe(V00301_NO_SIFRE);
	expect(
		sifreAnaphora.apply(entry('V00301', V00301_NO_SIFRE)).composed,
	).toBeUndefined();
});

it('the nearest citation is not the antecedent — only a Sifré anchor is', () => {
	// The arm must walk PAST `Yalk. ib. 542`, which is nearer. Copying
	// the nearest citation is what `ib-yoma-2a` does and what this row
	// must not do: it would rewrite one Yalkut target as another and
	// pass the gate, since both are in the entry's input set. That is
	// the gate's own "laundering between anchors" blind spot, so it has
	// to be caught here.
	const list = anchors(tokenize(E00476));
	const at = list.length - 1;
	expect(list[at]?.display).toBe('ib. 330');
	expect(antecedentOf(tokenize(E00476), list, at)?.dataRef).toBe(
		'Yalkut Shimoni on Torah 542',
	);
	expect(
		antecedentOf(tokenize(E00476), list, at, {
			accept: isSifreCitation,
			tolerate: () => true,
		})?.dataRef,
	).toBe('Sifrei Devarim 309:6');
});

it('leaves the row’s non-members alone: a bare ib., and an ib. N already on a Sifré work', () => {
	const bare =
		'<a class="refLink" href="/Sifrei_Devarim.309.6" ' +
		'data-ref="Sifrei Devarim 309:6">Sifré Deut. 309</a>; Sifré ' +
		'<a class="refLink" href="/Yalkut_Shimoni_on_Torah.330" ' +
		'data-ref="Yalkut Shimoni on Torah 330">ib.</a>';
	const already =
		'<a class="refLink" href="/Sifrei_Devarim.309.6" ' +
		'data-ref="Sifrei Devarim 309:6">Sifré Deut. 309</a>; Sifré ' +
		'<a class="refLink" href="/Sifrei_Devarim.330" ' +
		'data-ref="Sifrei Devarim 330">ib. 330</a>';
	for (const text of [bare, already]) {
		const out = sifre(entry('X00003', text));
		expect(out.records).toHaveLength(0);
		expect(definitionOf(out)).toBe(text);
	}
});

it('declines when the Sifré label is not the text immediately before the anchor', () => {
	// The label has to ABUT the anchor. A `Sifré` earlier in the
	// sentence with other prose between it and the `ib. N` is not this
	// construct, and adopting one would widen the arm past the six
	// members it reproduces.
	const distant =
		'<a class="refLink" href="/Sifrei_Devarim.309.6" ' +
		'data-ref="Sifrei Devarim 309:6">Sifré Deut. 309</a>; Sifré has it, ' +
		'but the reading in Yalk. is ' +
		'<a class="refLink" href="/Yalkut_Shimoni_on_Torah.330" ' +
		'data-ref="Yalkut Shimoni on Torah 330">ib. 330</a>';
	const out = sifre(entry('X00004', distant));
	expect(out.records).toHaveLength(0);
	expect(definitionOf(out)).toBe(distant);
});

/** The two locus spellings `REF_LOCUS`/`HREF_LOCUS` have to strip, both
 * taken from real anchors. The range arm exists because the pin above
 * FAILED on the narrower pattern — 5 of the 402 `Sifrei Devarim`
 * anchors carry one — and a locus the strippers do not recognise makes
 * `repairSifreAnaphor` decline rather than mis-compose, which is safe
 * but is a silent under-fire. A third spelling fails here. */
it('REF_LOCUS and HREF_LOCUS strip both the plain and the range locus', () => {
	expect('Sifrei Devarim 309:6'.replace(REF_LOCUS, '')).toBe('Sifrei Devarim');
	expect('Sifrei Devarim 301:3-4'.replace(REF_LOCUS, '')).toBe(
		'Sifrei Devarim',
	);
	expect('Yalkut Shimoni on Torah 330'.replace(REF_LOCUS, '')).toBe(
		'Yalkut Shimoni on Torah',
	);
	expect('/Sifrei_Devarim.309.6'.replace(HREF_LOCUS, '')).toBe(
		'/Sifrei_Devarim',
	);
	expect('/Sifrei_Devarim.301.3-4'.replace(HREF_LOCUS, '')).toBe(
		'/Sifrei_Devarim',
	);
});

// ------------------------------------------------------ ib-targum-work-loss

/** A00589 *אַוְורַקְסִין, excerpt — the plain different-book shape, and the
 * commonest of the nine. `Targ. Y. I Ex. XXXIX, 28` then `Ib.` then a
 * Leviticus verse: the work carries over, the book does not. */
const A00589 =
	'<i>trowsers</i>. <a class="refLink" ' +
	'href="/Targum_Jonathan_on_Exodus.39.28" ' +
	'data-ref="Targum Jonathan on Exodus 39:28">Targ. Y. I Ex. XXXIX, 28</a> ' +
	'<span dir="rtl">אוורקסי</span>. Ib. ' +
	'<a class="refLink" href="/Leviticus.6.3" ' +
	'data-ref="Leviticus 6:3">Lev. VI, 3</a> (ed. Vien.).';

/** M00567 מוֹפֵת ², excerpt — the SAME-book member, and the one that
 * settled the ruling. Its common prefix with the head eats the work
 * AND the book, leaving `6:22`, which case 3 still could not license
 * because the display writes `VI`. */
const M00567 =
	'<a class="refLink" href="/Onkelos_Deuteronomy.13.2" ' +
	'data-ref="Onkelos Deuteronomy 13:2">Targ. O. Deut. XIII, 2</a>; a. e.—Pl. ' +
	'<span dir="rtl">מוֹפְתִין</span>. Ib. ' +
	'<a class="refLink" href="/Deuteronomy.6.22" ' +
	'data-ref="Deuteronomy 6:22">Deut. VI, 22</a>. ' +
	'<a class="refLink" href="/Onkelos_Exodus.4.21" ' +
	'data-ref="Onkelos Exodus 4:21">Targ. O. Ex. IV, 21</a>; a. fr.';

/** C00446 גּוּס, excerpt — the CHAIN. The second `Ib.`'s nearest anchor
 * is the first member, which is itself defective, so the arm must walk
 * past it to the Targum anchor. Its display `Lev. IX, 7` also carries
 * the Roman numeral that `INTERVENING_CITATION` looks for, which is
 * why `gapBetween` has to mask text inside anchors. */
const C00446_CHAIN =
	' as h. Hif.—<a class="refLink" ' +
	'href="/Targum_Jonathan_on_Deuteronomy.17.20" ' +
	'data-ref="Targum Jonathan on Deuteronomy 17:20">Targ. Y. Deut. XVII, 20</a>' +
	'. Ib. <a class="refLink" href="/Leviticus.9.7" ' +
	'data-ref="Leviticus 9:7">Lev. IX, 7</a> ' +
	'<span dir="rtl">א׳ מנדעך</span> take courage. Ib. ' +
	'<a class="refLink" href="/Exodus.28.39" ' +
	'data-ref="Exodus 28:39">Ex. XXVIII, 39</a> the haughty.';

const targum = (e: SourceEntry): { entry: SourceEntry; records: unknown[] } =>
	applyTransforms(e, 'text-repairs', [targumAnaphora]);

/** The antecedent search with the SAME tolerance `repairTargumAnaphor`
 * ships — only a fellow row member may be stepped over. Restated once
 * here rather than at each call site: a test that passed the default
 * tolerance would be measuring a stricter rule than the one shipped,
 * and would have reported 8 fires for a rule that produces 9. */
const targumAntecedentOf = (
	tokens: readonly Token[],
	list: readonly Anchor[],
	at: number,
): Anchor | undefined =>
	antecedentOf(tokens, list, at, {
		accept: isTargumCitation,
		tolerate: (skipped: Anchor): boolean =>
			isTargumMember(textBetween(tokens, 0, skipped.open), skipped),
	});

it('a different-book ib. adopts the antecedent’s Targum work (gate case 4)', () => {
	const out = targum(entry('A00589', A00589));
	expect(definitionOf(out)).toContain(
		'<a class="refLink" href="/Targum_Jonathan_on_Leviticus.6.3" ' +
			'data-ref="Targum Jonathan on Leviticus 6:3">Lev. VI, 3</a>',
	);
	expect(out.records).toHaveLength(1);
});

it('the same-book member is repaired too — M00567, the one that carried the ruling', () => {
	const out = targum(entry('M00567', M00567));
	expect(definitionOf(out)).toContain(
		'<a class="refLink" href="/Onkelos_Deuteronomy.6.22" ' +
			'data-ref="Onkelos Deuteronomy 6:22">Deut. VI, 22</a>',
	);
	// The antecedent itself must NOT move: it is the head, not a member.
	expect(definitionOf(out)).toContain(
		'data-ref="Onkelos Deuteronomy 13:2">Targ. O. Deut. XIII, 2</a>',
	);
	expect(out.records).toHaveLength(1);
});

it('the C00446 chain repairs BOTH links, and both take the run’s opening work', () => {
	const result = targumAnaphora.apply(entry('C00446', C00446_CHAIN));
	// Both heads are the INPUT Targum anchor — never the first member's
	// repaired target, which is not in the input and could not be
	// declared. See `repairTargumAnaphor` on why that is the lawful
	// reading as well as the correct one.
	expect(result.recombined).toEqual([
		{
			head: 'Targum Jonathan on Deuteronomy 17:20',
			tail: 'Leviticus 9:7',
			target: 'Targum Jonathan on Leviticus 9:7',
		},
		{
			head: 'Targum Jonathan on Deuteronomy 17:20',
			tail: 'Exodus 28:39',
			target: 'Targum Jonathan on Exodus 28:39',
		},
	]);
	const after = definitionOf(result) ?? '';
	expect(after).toContain('data-ref="Targum Jonathan on Leviticus 9:7"');
	expect(after).toContain('data-ref="Targum Jonathan on Exodus 28:39"');
});

it('the chain’s second link would decline if the gap counted its sibling’s display', () => {
	// The regression this pins: `Lev. IX, 7` holds `IX,`, which is one
	// of INTERVENING_CITATION's four cues. Measuring the gap with
	// `textBetween` (anchor display included) declines the second link;
	// `gapBetween` masks text inside anchors and it fires. Neither
	// reading changes `ib-yoma-2a` — 272 of 272 gaps agree, 209 either
	// way — so this is the only place the difference is observable.
	const tokens = tokenize(C00446_CHAIN);
	const list = anchors(tokens);
	const at = list.length - 1;
	const [head] = list;
	const member = list[at];
	if (head === undefined || member === undefined) {
		throw new Error('expected a Targum antecedent and a chained member');
	}
	const naive = textBetween(tokens, head.close + 1, member.open);
	const masked = gapBetween(tokens, list, head.close + 1, member.open);
	expect(INTERVENING_CITATION.test(naive)).toBe(true);
	expect(INTERVENING_CITATION.test(masked)).toBe(false);
	expect(targumAntecedentOf(tokens, list, at)?.dataRef).toBe(
		'Targum Jonathan on Deuteronomy 17:20',
	);
});

it('the written target is the work joined to the anchor’s WHOLE own target', () => {
	// The invariant that puts case 4's derived-split abuse out of
	// reach. The head contributes a prefix ending in a separator, so no
	// digit of its own locus can enter; the tail is contributed whole,
	// so no sibling can be paired in. Checked on every fire below.
	for (const [rid, text] of [
		['A00589', A00589],
		['M00567', M00567],
		['C00446', C00446_CHAIN],
	] as const) {
		for (const claim of targumAnaphora.apply(entry(rid, text)).recombined ??
			[]) {
			const work = TARGUM_WORKS.find((w) => claim.target.startsWith(w));
			expect(work).toBeDefined();
			expect(claim.target).toBe(`${work ?? ''}${claim.tail}`);
			expect(claim.head.startsWith(work ?? '')).toBe(true);
		}
	}
});

it('declines when no Targum anchor precedes the ib.', () => {
	const noTargum =
		'<a class="refLink" href="/Chullin.139a" ' +
		'data-ref="Chullin 139a">Ḥull. 139ᵃ</a>. Ib. ' +
		'<a class="refLink" href="/Leviticus.6.3" ' +
		'data-ref="Leviticus 6:3">Lev. VI, 3</a>';
	const out = targum(entry('X00005', noTargum));
	expect(out.records).toHaveLength(0);
	expect(definitionOf(out)).toBe(noTargum);
	expect(
		targumAnaphora.apply(entry('X00005', noTargum)).recombined,
	).toBeUndefined();
});

it('declines when an UNANCHORED citation intervenes — the guard gapBetween keeps', () => {
	// Masking anchor text must not disarm restriction 2. Here the
	// Yerushalmi citation between the Targum anchor and the `Ib.` is
	// bare text, so it still trips the cue and the arm declines.
	const intervening =
		'<a class="refLink" href="/Onkelos_Genesis.24.16" ' +
		'data-ref="Onkelos Genesis 24:16">Targ. O. Gen. XXIV, 16</a>' +
		'.—Y. Yoma VI, 43ᵈ <span dir="rtl">אורכין</span> wait a while. Ib. ' +
		'<a class="refLink" href="/Numbers.12.8" ' +
		'data-ref="Numbers 12:8">Num. XII, 8</a>';
	const out = targum(entry('X00006', intervening));
	expect(out.records).toHaveLength(0);
	expect(definitionOf(out)).toBe(intervening);
});

it('leaves non-members alone: a lexical target, a folio, and an already-correct Targum ref', () => {
	const cases = [
		// A03251's shape — `Targ. O. ib.` before a Jastrow cross-reference.
		// Prepending a work to a headword would be nonsense.
		'<a class="refLink" href="/Genesis.10.17" ' +
			'data-ref="Genesis 10:17">Gen. X, 17</a>; Targ. O. ib. ' +
			'<a dir="rtl" class="refLink" href="/Jastrow,_אַנְתּוּסָאֵי.1" ' +
			'data-ref="Jastrow, אַנְתּוּסָאֵי 1">אַנְתּוּסָאֵי</a>',
		// A Talmud folio is not a book:chapter:verse and no work governs it.
		'<a class="refLink" href="/Onkelos_Genesis.24.16" ' +
			'data-ref="Onkelos Genesis 24:16">Targ. O. Gen. XXIV, 16</a>. Ib. ' +
			'<a class="refLink" href="/Chullin.139a" ' +
			'data-ref="Chullin 139a">Ḥull. 139ᵃ</a>',
		// The row's own control: the resolver got this one right.
		'<a class="refLink" href="/Onkelos_Genesis.24.16" ' +
			'data-ref="Onkelos Genesis 24:16">Targ. O. Gen. XXIV, 16</a>. Ib. ' +
			'<a class="refLink" href="/Onkelos_Numbers.12.8" ' +
			'data-ref="Onkelos Numbers 12:8">Targ. Num. XII, 8</a>',
	];
	for (const text of cases) {
		const out = targum(entry('X00007', text));
		expect(out.records).toHaveLength(0);
		expect(definitionOf(out)).toBe(text);
	}
});

it('declines when the antecedent’s href does not match the derived prefix', () => {
	// The `href` work prefix is spelled from the `data-ref` work by
	// Sefaria's URL convention, which is an assumption about URLs. It
	// is verified against the antecedent's real href rather than
	// trusted, so a respelling declines instead of minting.
	const oddHref =
		'<a class="refLink" href="/tj-deut.17.20" ' +
		'data-ref="Targum Jonathan on Deuteronomy 17:20">Targ. Y. Deut. XVII, 20</a>' +
		'. Ib. <a class="refLink" href="/Leviticus.9.7" ' +
		'data-ref="Leviticus 9:7">Lev. IX, 7</a>';
	const out = targum(entry('X00008', oddHref));
	expect(out.records).toHaveLength(0);
	expect(definitionOf(out)).toBe(oddHref);
});

it('declines when an ANCHORED citation of another work intervenes', () => {
	// Reviewer finding, 2026-08-24. `accept` and `gapBetween` are each
	// sound and jointly unsafe: a skipping `accept` steps over an
	// anchored rival and `gapBetween` then masks its text, so it is
	// invisible to the walk AND to the cue. Here `ibidem` names
	// `Gen. XXIV, 17` — the plain Bible — and repairing would mint
	// `Onkelos Numbers 12:8`, which the gate cannot catch because case
	// 4 never checks the head/tail pairing. `tolerate` catches it
	// exactly, rather than hoping the fuzzy cue does.
	//
	// The corpus holds 0 instances today: 8 of the 9 members skip no
	// anchor at all, and C00446's second link skips exactly one, its
	// own row-member sibling, which is excused.
	const rival =
		'<a class="refLink" href="/Onkelos_Genesis.24.16" ' +
		'data-ref="Onkelos Genesis 24:16">Targ. O. Gen. XXIV, 16</a> ' +
		'<span dir="rtl">למיחזי</span> ' +
		'<a class="refLink" href="/Genesis.24.17" ' +
		'data-ref="Genesis 24:17">Gen. XXIV, 17</a> and so. Ib. ' +
		'<a class="refLink" href="/Numbers.12.8" ' +
		'data-ref="Numbers 12:8">Num. XII, 8</a>';
	const out = targum(entry('X00009', rival));
	expect(out.records).toHaveLength(0);
	expect(definitionOf(out)).toBe(rival);
	expect(
		targumAnaphora.apply(entry('X00009', rival)).recombined,
	).toBeUndefined();

	// And the reason is the rival anchor specifically, not the cue:
	// masking leaves the gap clean, so without `tolerate` this fires.
	const tokens = tokenize(rival);
	const list = anchors(tokens);
	const at = list.length - 1;
	const [head] = list;
	const member = list[at];
	if (head === undefined || member === undefined) {
		throw new Error('expected an antecedent and a member');
	}
	expect(
		INTERVENING_CITATION.test(
			gapBetween(tokens, list, head.close + 1, member.open),
		),
	).toBe(false);
	expect(
		antecedentOf(tokens, list, at, { accept: isTargumCitation })?.dataRef,
	).toBeUndefined();
	expect(targumAntecedentOf(tokens, list, at)).toBeUndefined();
});
