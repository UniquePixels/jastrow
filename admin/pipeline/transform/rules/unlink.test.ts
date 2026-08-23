/**
 * Discovery query behind `GRAETZ_CUE`/`ARUCH_CUE`/`RABBI_CUE` (batch-2
 * task-2 brief): walks every `definition` and `language_reference`
 * field with `leadOf` + `anchors`, corpus-wide. task-2-report.md has
 * the runnable script; task-3-report.md has the ellipsis-fragment
 * equivalent. Measured: apparatus 8 (catalogued 8), rabbi 41
 * (catalogued 41).
 */
import { expect, it } from 'bun:test';
import { readSourceEntries } from '../../body/source.ts';
import type { SourceEntry } from '../../body/types.ts';
import { applyTransforms } from '../run.ts';
import {
	apparatusCite,
	ELLIPSIS_CONVENTION,
	ellipsisFragment,
	ellipsisRaw,
	rabbiName,
	unobservedConvention,
} from './unlink.ts';

// `headword` is required on `SourceEntry` and `fieldsOf` (no-new-text.ts)
// reads it unconditionally when building the gate's text multiset — an
// empty string is enough to satisfy that without meaning anything for
// these fixtures.
const entry = (definition: string, rid = 'A00135'): SourceEntry =>
	({
		content: { senses: [{ definition }] },
		headword: '',
		rid,
	}) as SourceEntry;

/** A00135, verbatim. */
const A00135 =
	'a district of Peræa (v. Graetz, Gesch. d. ' +
	'<a class="refLink" href="/Judges.2.2" data-ref="Judges 2:2">Jud. II, 2</a>).';

it('unlinks the apparatus citation, keeping the display', () => {
	const out = applyTransforms(entry(A00135), 'text-repairs', [apparatusCite]);
	expect(out.entry.content.senses[0]?.definition).toBe(
		'a district of Peræa (v. Graetz, Gesch. d. Jud. II, 2).',
	);
	expect(out.records).toHaveLength(1);
});

it('leaves a real biblical citation of the same book alone', () => {
	const real =
		'as in <a class="refLink" href="/Judges.2.2" data-ref="Judges 2:2">Jud. II, 2</a>.';
	const out = applyTransforms(entry(real), 'text-repairs', [apparatusCite]);
	expect(out.entry.content.senses[0]?.definition).toBe(real);
	expect(out.records).toHaveLength(0);
});

it('declares unlinks equal to the anchor it removed', () => {
	const result = apparatusCite.apply(entry(A00135));
	expect(result.unlinks).toBe(1);
});

/** G00065, excerpt: the Aruch-Completum arm of the same row, an
 * Ecclesiastes mislink rather than a Judges one. */
const G00065 =
	'[R. Gerson Ms. to Ḥull.: leaving out אכיל; Ar. ed. ' +
	'<a class="refLink" href="/Ecclesiastes.3" data-ref="Ecclesiastes 3">Koh. III, p. 3</a>19.]';

it('unlinks the Aruch apparatus citation of Ecclesiastes', () => {
	const out = applyTransforms(entry(G00065, 'G00065'), 'text-repairs', [
		apparatusCite,
	]);
	expect(out.entry.content.senses[0]?.definition).toBe(
		'[R. Gerson Ms. to Ḥull.: leaving out אכיל; Ar. ed. Koh. III, p. 319.]',
	);
	expect(out.records).toHaveLength(1);
});

/** A01350, excerpt: "Lam. R. introd. (R. Josh. 2)" — the audit's own
 * example, a rabbi's name (R. Joshua) read as the Book of Joshua. */
const A01350 =
	'as the lamb of the daily offering’. Lam. R. introd. (R. ' +
	'<a class="refLink" href="/Joshua.2" data-ref="Joshua 2">Josh. 2</a>) ' +
	'who slaughters a lamb and augurs from its liver.';

it('unlinks the rabbi name read as a bible book', () => {
	const out = applyTransforms(entry(A01350, 'A01350'), 'text-repairs', [
		rabbiName,
	]);
	expect(out.entry.content.senses[0]?.definition).toBe(
		'as the lamb of the daily offering’. Lam. R. introd. (R. Josh. 2) ' +
			'who slaughters a lamb and augurs from its liver.',
	);
	expect(out.records).toHaveLength(1);
});

it('declares unlinks equal to the anchor it removed (rabbi name)', () => {
	const result = rabbiName.apply(entry(A01350, 'A01350'));
	expect(result.unlinks).toBe(1);
});

/** D00149, excerpt: a genuine citation of Joshua in a rabbinic-literature
 * context — "(ref. to Bethel …, Josh. VII, 2)" inside a Genesis Rabbah
 * discussion — with no "(R. " lead. Must survive: the inverse error the
 * brief warns against. */
const D00149 =
	'Gen. R. s. 39, end (ref. to Bethel, changed into Beth-aven, ' +
	'<a class="refLink" href="/Joshua.7.2" data-ref="Joshua 7:2">Josh. VII, 2</a>) ' +
	'she did not deserve even to be named Beth Heamal.';

it('leaves a real citation of Joshua in a rabbinic context alone', () => {
	const out = applyTransforms(entry(D00149, 'D00149'), 'text-repairs', [
		rabbiName,
	]);
	expect(out.entry.content.senses[0]?.definition).toBe(D00149);
	expect(out.records).toHaveLength(0);
});

// Ruling (maintainer, 2026-08-23): K01198's comma-lead ("introd., R. ")
// is the SAME defect as the open-paren lead ("introd. (R. ") — same
// rabbinic-name context, same Book-of-Joshua target, same "introd."
// antecedent — and the predicate must describe the defect rather than
// stop one short of it to match the catalogue's (pre-this-rule) count
// of 41. This test used to assert the opposite (that K01198 was
// deliberately excluded); the ruling reverses that and this is now
// the record of it. `bun transform:count` measures 42 against a
// catalogued 41 as a result — the delta is a correction for Task 11's
// write-back, the same direction batch 1's `bare-rtl-hebrew` count
// was corrected (4,190 → 4,189).
it('unlinks the comma-lead sibling variant (K01198)', () => {
	const K01198 =
		'he erected camps of siege (Lam. R. introd., R. ' +
		'<a class="refLink" href="/Joshua.2.24" data-ref="Joshua 2:24">Josh. 2</a> טירונין).';
	const out = applyTransforms(entry(K01198, 'K01198'), 'text-repairs', [
		rabbiName,
	]);
	expect(out.entry.content.senses[0]?.definition).toBe(
		'he erected camps of siege (Lam. R. introd., R. Josh. 2 טירונין).',
	);
	expect(out.records).toHaveLength(1);
});

// Q00231, excerpt: the audit's own example ("(ed. פלימרכים, …כוס)" ->
// כּוֹס III "cup"), and the fixture that disproves the brief's original
// Step 1 query — the ellipsis sits as plain text before the anchor,
// not inside its display, per task-3-report.md.
const Q00231 =
	'(ed. <span dir="rtl">פלימרכים</span>, … ' +
	'<a dir="rtl" class="refLink" href="/Jastrow,_כּוֹס III.1" data-ref="Jastrow, כּוֹס III 1">כוס</a>), v. ' +
	'<a dir="rtl" class="refLink" href="/Jastrow,_כלירכין.1" data-ref="Jastrow, כלירכין 1">כלירכין</a>.';

it('unlinks an anchored elision fragment (Q00231)', () => {
	const out = applyTransforms(entry(Q00231, 'Q00231'), 'text-repairs', [
		ellipsisFragment,
	]);
	expect(out.entry.content.senses[0]?.definition).toBe(
		'(ed. <span dir="rtl">פלימרכים</span>, … כוס), v. ' +
			'<a dir="rtl" class="refLink" href="/Jastrow,_כלירכין.1" data-ref="Jastrow, כלירכין 1">כלירכין</a>.',
	);
	expect(out.records).toHaveLength(1);
});

// M01288, verbatim: two ellipsis-fragment anchors in one sense
// ("(ed. …נָן, …נַן)"), so unlinks (2) and records.length (1) can
// disagree — a stronger no-op guard than a single-anchor fixture.
const M01288 =
	' (<a dir="rtl" class="refLink" href="/Jastrow,_מִיק.1" data-ref="Jastrow, מִיק 1">מִיק</a>; cmp. ' +
	'<a dir="rtl" class="refLink" href="/Jastrow,_*דַּאֲבַן.1" data-ref="Jastrow, *דַּאֲבַן 1">דַּאֲבַן</a> <i>to mock</i>. ' +
	'<a class="refLink" href="/Aramaic_Targum_to_Psalms.119.51" data-ref="Aramaic Targum to Psalms 119:51">Targ. Ps. CXIX, 51</a> ' +
	'<span dir="rtl">מְמִיקְנִין</span> ed. Lag. (ed. … ' +
	'<a dir="rtl" class="refLink" href="/Jastrow,_נַן.1" data-ref="Jastrow, נַן 1">נָן</a>, … ' +
	'<a dir="rtl" class="refLink" href="/Jastrow,_נַן.1" data-ref="Jastrow, נַן 1">נַן</a>).';

it('unlinks both fragments in one definition and counts each anchor (M01288)', () => {
	const result = ellipsisFragment.apply(entry(M01288, 'M01288'));
	expect(result.unlinks).toBe(2);
	expect(result.records).toHaveLength(1);
});

// A01030, verbatim: ellipsis follows a bare citation, not a Hebrew
// word being corrected; אַחֲיוּת is a sibling of this entry's headword.
const A01030 =
	' (<a dir="rtl" class="refLink" href="/Jastrow,_חיי.1" data-ref="Jastrow, חיי 1">חיי</a>) ' +
	'<i>reanimation, resurrection</i>. <a class="refLink" href="/Targum_Jonathan_on_Hosea.6.2" data-ref="Targum Jonathan on Hosea 6:2">Targ. Hos. VI, 2</a> … ' +
	'<a dir="rtl" class="refLink" href="/Jastrow,_אַחֲיוֹת.1" data-ref="Jastrow, אַחֲיוֹת 1">אַחֲיוּת</a> resurrection of &c.; a. e.';

it('leaves a convention ellipsis before a sibling headword form alone (A01030)', () => {
	const out = applyTransforms(entry(A01030, 'A01030'), 'text-repairs', [
		ellipsisFragment,
	]);
	expect(out.entry.content.senses[0]?.definition).toBe(A01030);
	expect(out.records).toHaveLength(0);
});

// A01111, excerpt (sense 2 of 3, trimmed to the anchor's clause):
// ellipsis follows English prose; היינו is glossed right after it.
const A01111 =
	'—<span dir="rtl">אי אמרת בשלמא</span> (abbr. <span dir="rtl">אא"ב</span> = <span dir="rtl">בשלמא אי אמרת</span>) I grant, if you were to say … ' +
	'<a dir="rtl" class="refLink" href="/Jastrow,_הַיְינוּ.1" data-ref="Jastrow, הַיְינוּ 1">היינו</a> then would be right what &c.';

it('leaves a convention ellipsis before a glossed discourse particle alone (A01111)', () => {
	const out = applyTransforms(entry(A01111, 'A01111'), 'text-repairs', [
		ellipsisFragment,
	]);
	expect(out.entry.content.senses[0]?.definition).toBe(A01111);
	expect(out.records).toHaveLength(0);
});

// K01049, verbatim: ellipsis follows an English list marker; כְּפַר is
// the construct-state sibling of this entry's own headword (כָּפָר).
const K01049 =
	' כפר <i>to be round</i>,  [<i>circle</i>,] <i>village, country town</i>. ' +
	'<a class="refLink" href="/Mishnah_Megillah.1.3" data-ref="Mishnah Megillah 1:3">Meg. I, 3</a> ' +
	'<span dir="rtl">פחות מכאן הרי זה כ׳</span> if a place has less (than ten persons of leisure), it is considered a country place, opp. ' +
	'<span dir="rtl">עיר גדולה</span>. <a class="refLink" href="/Chagigah.13b.5" data-ref="Chagigah 13b:5">Ḥag. 13ᵇ</a> v. ' +
	'<a dir="rtl" class="refLink" href="/Jastrow,_יְחֶזְקֵאל.1" data-ref="Jastrow, יְחֶזְקֵאל 1">יְחֶזְקְאֵל</a>. ' +
	'<a class="refLink" href="/Mishnah_Eduyot.2.3" data-ref="Mishnah Eduyot 2:3">Eduy. II, 3</a>; a. fr.—Pl. <span dir="rtl">כְּפָרִים</span>. ' +
	'<a class="refLink" href="/Mishnah_Megillah.1.1" data-ref="Mishnah Megillah 1:1">Meg. I, 1</a>, sq.; a. fr. [In compounds:… ' +
	'<a dir="rtl" class="refLink" href="/Jastrow,_כְּפַר.1" data-ref="Jastrow, כְּפַר 1">כְּפַר</a> pr. n. pl., v. respective determinants.]';

it('leaves a convention ellipsis before a construct-state sibling alone (K01049)', () => {
	const out = applyTransforms(entry(K01049, 'K01049'), 'text-repairs', [
		ellipsisFragment,
	]);
	expect(out.entry.content.senses[0]?.definition).toBe(K01049);
	expect(out.records).toHaveLength(0);
});

// L00584, verbatim: ellipsis follows English prose; וידוי is a
// complete word, explicitly contrasted with "(in place of ראיון)".
const L00584 =
	' = <span dir="rtl">לָא אֲנָן</span>. ' +
	'<a class="refLink" href="Jerusalem_Talmud_Peah.3.7.4" data-ref="Jerusalem Talmud Peah 3:7:4">Y. Peah III, 17ᵈ</a> top ' +
	'<span dir="rtl">ולמה ל׳ אמרין וכ׳</span> (abbrev. <span dir="rtl">אמ׳</span>, v. R. S. to Mish. ib. III, 6) and why do we not say … ' +
	'<a dir="rtl" class="refLink" href="/Jastrow,_וִידּוּי.1" data-ref="Jastrow, וִידּוּי 1">וידוי</a> (in place of ' +
	'<a dir="rtl" class="refLink" href="/Jastrow,_רֵאָיוֹן.1" data-ref="Jastrow, רֵאָיוֹן 1">ראיון</a>)?';

it('leaves a convention ellipsis before a complete, contrasted word alone (L00584)', () => {
	const out = applyTransforms(entry(L00584, 'L00584'), 'text-repairs', [
		ellipsisFragment,
	]);
	expect(out.entry.content.senses[0]?.definition).toBe(L00584);
	expect(out.records).toHaveLength(0);
});

// D00702, verbatim: apparatus-note shape, but the anchored word is
// glossed right after ("basket-makers who brought wicker work..."),
// confirming a complete spelling, not a stem-elided fragment.
const D00702 =
	' (v. <a dir="rtl" class="refLink" href="/Jastrow,_דִּיקוּלָא.1" data-ref="Jastrow, דִּיקוּלָא 1">דִּיקוּלָא</a>) <i>basket maker</i>.—Pl. ' +
	'<a dir="rtl" class="refLink" href="/Jastrow,_דִּיקוּלָא.1" data-ref="Jastrow, דִּיקוּלָא 1">דִּיקוּלָאֵי</a>. ' +
	'<a class="refLink" href="/Bava_Batra.22a.4" data-ref="Bava Batra 22a:4">B. Bath. 22ᵃ</a> ד׳ דאייתי דיקולי Ms. M. (ed. … ' +
	'<a dir="rtl" class="refLink" href="/Jastrow,_דיקלאי.1" data-ref="Jastrow, דיקלאי 1">דיקלאי</a>) basket-makers who brought wicker work for sale; ' +
	'[Rashi: ‘one opinion’: <i>kettle-makers</i>, v. preced.].';

it('leaves a convention ellipsis glossed by the following English alone (D00702)', () => {
	const out = applyTransforms(entry(D00702, 'D00702'), 'text-repairs', [
		ellipsisFragment,
	]);
	expect(out.entry.content.senses[0]?.definition).toBe(D00702);
	expect(out.records).toHaveLength(0);
});

// Drift check (maintainer ruling, 2026-08-23): every key in
// ELLIPSIS_CONVENTION must be OBSERVED in the real corpus, or this
// names it and fails — see unlinkMatching's docstring for why an
// in-rule check can't do this instead.
it('observes every ellipsis-fragment convention exclusion in the corpus', async () => {
	const unmatched = await unobservedConvention(
		ELLIPSIS_CONVENTION,
		readSourceEntries(),
		ellipsisRaw,
	);
	expect(unmatched).toEqual([]);
});

// A02658, excerpt: ellipsis elides quoted text, not a word-head;
// דוסתאי is the complete name Dostai, glossed right after.
const A02658 =
	'<i>Aftoriki</i>. <a class="refLink" href="/Bava_Metzia.5a.7" data-ref="Bava Metzia 5a:7">B. Mets. 5ᵃ</a> ' +
	'<span dir="rtl">אבוה דר׳ א׳</span>; <a class="refLink" href="/Chullin.64b.3" data-ref="Chullin 64b:3">Ḥull. 64ᵇ</a> … ' +
	'<a dir="rtl" class="refLink" href="/Jastrow,_דּוֹסְתַּאי.1" data-ref="Jastrow, דּוֹסְתַּאי 1">דוסתאי</a> (Dostai) the father of R. A.';

it('leaves a convention ellipsis before a complete, correctly linked name alone (A02658)', () => {
	const out = applyTransforms(entry(A02658, 'A02658'), 'text-repairs', [
		ellipsisFragment,
	]);
	expect(out.entry.content.senses[0]?.definition).toBe(A02658);
	expect(out.records).toHaveLength(0);
});
