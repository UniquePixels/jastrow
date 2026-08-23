/**
 * Discovery query behind the cues in `unlink.ts` (batch-2 task-2
 * brief). Re-run whenever a delta between the measured and catalogued
 * counts needs re-checking:
 *
 * bun -e '
 * import { readSourceEntries } from "./admin/pipeline/body/source.ts";
 * import { tokenize } from "./admin/pipeline/transform/html.ts";
 * import { anchors } from "./admin/pipeline/transform/links.ts";
 * function leadOf(tokens, open) {
 *   let text = "";
 *   for (const token of tokens.slice(0, open)) {
 *     if (token.kind === "text") text += token.value;
 *   }
 *   return text;
 * }
 * function* walk(senses, path) {
 *   for (const [i, s] of senses.entries()) {
 *     yield [path + "." + i, s];
 *     if (s.senses) yield* walk(s.senses, path + "." + i);
 *   }
 * }
 * const GRAETZ = /\bGr(?:ae|æ)tz,?\s+Gesch\.\s+d(?:\.|er)\s*$/u;
 * const ARUCH = /\bAr\.(?:\s*Compl\.)?\s*ed\.\s*$/u;
 * const RABBI = /\(R\.\s*$/u;
 * let apparatus = 0;
 * let rabbi = 0;
 * for await (const e of readSourceEntries()) {
 *   const fields = [
 *     ["lang", e.language_reference],
 *     ...[...walk(e.content.senses, "s")].map(([p, s]) => [p, s.definition]),
 *   ];
 *   for (const [, field] of fields) {
 *     if (field === undefined) continue;
 *     const t = tokenize(field);
 *     for (const a of anchors(t)) {
 *       const lead = leadOf(t, a.open);
 *       if (
 *         (GRAETZ.test(lead) && a.dataRef.startsWith("Judges ")) ||
 *         (ARUCH.test(lead) && a.dataRef.startsWith("Ecclesiastes "))
 *       ) {
 *         apparatus++;
 *       }
 *       if (RABBI.test(lead) && a.dataRef.startsWith("Joshua ")) rabbi++;
 *     }
 *   }
 * }
 * console.log("apparatus", apparatus, "rabbi", rabbi);
 * '
 *
 * Measured: apparatus 8 (catalogued 8), rabbi 41 (catalogued 41).
 */
import { expect, it } from 'bun:test';
import type { SourceEntry } from '../../body/types.ts';
import { applyTransforms } from '../run.ts';
import { apparatusCite, ellipsisFragment, rabbiName } from './unlink.ts';

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

// The no-op guard this batch has already been bitten by once (Task
// 2): a predicate that matches nothing drops no anchor, keeps the text
// byte-identical, and passes both older gates in silence. `unlinks` is
// only ever set when > 0 (unlinkOverDefinitions), so a no-op predicate
// leaves it `undefined`, not `1` — this fails loudly instead.
it('declares unlinks equal to the anchor it removed (ellipsis fragment)', () => {
	const result = ellipsisFragment.apply(entry(Q00231, 'Q00231'));
	expect(result.unlinks).toBe(1);
});

// A02658, excerpt: one of the 6 convention members (task-3-report.md)
// — "Ḥull. 64ᵇ …" elides quoted Talmudic text, not a word-head, and
// דוסתאי is the complete name Dostai, glossed right after it and
// correctly linked to its own headword. Must survive: the inverse
// error the brief warns against, same shape as D00149 above.
const A02658 =
	'<i>Aftoriki</i>. <a class="refLink" href="/Bava_Metzia.5a.7" data-ref="Bava Metzia 5a:7">B. Mets. 5ᵃ</a> ' +
	'<span dir="rtl">אבוה דר׳ א׳</span>; <a class="refLink" href="/Chullin.64b.3" data-ref="Chullin 64b:3">Ḥull. 64ᵇ</a> … ' +
	'<a dir="rtl" class="refLink" href="/Jastrow,_דּוֹסְתַּאי.1" data-ref="Jastrow, דּוֹסְתַּאי 1">דוסתאי</a> ' +
	'(Dostai) the father of R. A. (<a class="refLink" href="Jerusalem_Talmud_Yoma.4.4.9" data-ref="Jerusalem Talmud Yoma 4:4:9">Y. Yoma IV, 41ᵈ</a> top ' +
	'<span dir="rtl">פטרוקי אחוה וכ׳</span> Patruki, brother of R. Darosa).';

it('leaves a convention ellipsis before a complete, correctly linked name alone (A02658)', () => {
	const out = applyTransforms(entry(A02658, 'A02658'), 'text-repairs', [
		ellipsisFragment,
	]);
	expect(out.entry.content.senses[0]?.definition).toBe(A02658);
	expect(out.records).toHaveLength(0);
});
