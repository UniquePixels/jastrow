/**
 * The six rules the pipeline halts on (the pipeline's `DESIGN.md`
 * §2), as checks over a FINISHED entry. They hold however the entry
 * got there — the pipeline's write or a hand edit — so they live here
 * rather than inside the parser, and `validate.ts` runs them over
 * every entry: the import's `contract` gate before it writes, and
 * `bun data:validate` (CI's Validate job) over the committed tree.
 *
 * 1. Every form index appears in `display` exactly once.
 * 2. `display` holds no Hebrew letters or points.
 * 3. Markers agree with the forms: `*` before `{n}` or its group ⇔
 *    `reconstructed`; a SINGLE numeral beside `{n}` ⇔ a `homograph`
 *    that is not `implied`; `m.`/`f.` beside `{n}` ⇔ `gender`. Two
 *    things are named and never displayed (rulings 10-06 hidden
 *    superscript and implied I): a `disambiguator`'s superscript never
 *    appears in `display`, and an `implied` homograph's numeral never
 *    does. `implied` stands only beside a `homograph`.
 * 4. A form's `text` never holds a comma, parenthesis, `?`, `=`, `…`
 *    or a Latin letter.
 * 5. A `partial` form is never a lookup key.
 * 6. Every comparison normalizes to NFC first. No stage rewrites
 *    stored text except the import WRITE step, which normalizes the
 *    whole entry file (`normalizeForWrite`, #110 — §3.1 rule 6 names
 *    it as the one exception). Nothing in THIS file rewrites anything.
 *
 * **Rule 4 halts.** §3 makes a text defect a halt, so rule 4 is a
 * validation error beside the other five. It was held at a report
 * until the last two entries tripping it were repaired — A01175 and
 * A01345, whose line was `X = Y`; reviewed patches P000309 and P000310
 * (#113) lift `= Y` into the gloss with `reform`'s `gloss` field.
 *
 * The halt lives in `validateEntry`. The parser files such a line as
 * a `headword-unparsed` `blocks` row, so a NEW one from upstream is
 * named in the report, and the import's `contract` gate then refuses
 * the write — the same check a HAND EDIT to a committed file meets in
 * CI's Validate job. There is no switch back to a report: the one
 * that held it (`HALT_ON_TEXT_DEFECT`) was removed once armed, since
 * its other branch was dead (review ledger L13).
 */
import { isLexical, PLACEHOLDER } from './headwords.ts';
import type { Entry, FormObject } from './types.ts';

/** The notation rule 4 keeps OUT of a form's text. Each one has a home
 * in `display` instead: the grouping delimiters and the query mark are
 * layout, the comma is a separator the app supplies, the ellipsis is
 * print's elision mark, and `=` introduces a gloss cross-reference
 * that belongs in the definition. */
const FORBIDDEN_IN_TEXT = /[(),?=…]|[A-Za-z]/u;
/** A Roman numeral standing alone in a `display` segment. */
const ROMAN_IN_DISPLAY = /(?<![A-Za-z])[IVXLC]+(?![A-Za-z])/gu;
/** The `m.` / `f.` labels, as `display` carries them. */
const GENDER_IN_DISPLAY = /(?<![A-Za-z])(?<label>[mf])\.(?![A-Za-z])/gu;
/** A notation run that may stand between a `*` and the form (or the
 * group) it marks: the delimiters, the query mark and whitespace. */
const STAR_REACHES = /\*[\s()?]*$/u;
/** A superscript digit, the glyph of a `disambiguator`. Listed by code
 * point: three of them (¹ ² ³) sit in Latin-1, the rest at U+2070. */
const SUPERSCRIPT = /[\u00B2\u00B3\u00B9\u2070\u2074-\u2079]/u;

/** Rule 4: the forms whose `text` carries notation it must not — the
 * §3 halt, measured rather than assumed. Returns one line per
 * offending form, empty when the entry is clean. */
function textDefects(entry: Pick<Entry, 'headwords' | 'id'>): string[] {
	const problems: string[] = [];
	for (const [i, form] of entry.headwords.entries()) {
		const found = FORBIDDEN_IN_TEXT.exec(form.text);
		if (found !== null) {
			problems.push(
				`${entry.id}: headwords[${i}].text carries ${JSON.stringify(found[0])}, which belongs in display or the gloss (§3.1 rule 4)`,
			);
		}
	}
	return problems;
}

/** The display template split at its placeholders: `slots[i]` is the
 * index form i occupies, and `gaps[i]` is the literal notation before
 * slot i (`gaps` has one more element than `slots`, the last being the
 * tail after the final slot). */
interface Template {
	gaps: string[];
	slots: number[];
}

/** Read a `display` template into slots and the notation between
 * them. `PLACEHOLDER` carries the `g` flag, so `lastIndex` is reset by
 * the `matchAll` protocol rather than left where a previous call
 * stopped. */
function readTemplate(display: string): Template {
	const slots: number[] = [];
	const gaps: string[] = [];
	let at = 0;
	for (const m of display.matchAll(PLACEHOLDER)) {
		gaps.push(display.slice(at, m.index));
		slots.push(Number(m[1]));
		at = m.index + m[0].length;
	}
	gaps.push(display.slice(at));
	return { gaps, slots };
}

/** Rule 1: every form index appears in `display` exactly once, and
 * `display` names no index the entry does not have. */
function checkSlots(
	id: string,
	headwords: readonly FormObject[],
	template: Template,
	problems: string[],
): void {
	const wanted = headwords.map((_, i) => i).join(',');
	const got = [...template.slots].sort((a, b) => a - b).join(',');
	if (wanted !== got) {
		problems.push(
			`${id}: display names slots [${template.slots.join(',')}] for ${headwords.length} form(s) (§3.1 rule 1)`,
		);
	}
}

/** Rule 2: `display` holds no Hebrew. Every Hebrew character in the
 * line comes from a form, so one written into the template would be a
 * second, uncorrectable copy of it. */
function checkNoHebrew(id: string, display: string, problems: string[]): void {
	for (const ch of display) {
		if (isLexical(ch)) {
			problems.push(
				`${id}: display carries Hebrew ${JSON.stringify(ch)} (§3.1 rule 2)`,
			);
			return;
		}
	}
}

/** One form's slot in the template: the notation before it and the
 * notation after it, up to the neighbouring slots. */
interface MarkerSite {
	after: string;
	before: string;
	form: FormObject;
	id: string;
}

/** Rule 3, for one form: the notation around its slot says what the
 * form says. The numeral clause is {@link checkNumeral}. */
function checkMarkers(at: MarkerSite, problems: string[]): void {
	const { after, before, form, id } = at;
	const starred = STAR_REACHES.test(before);
	if (starred !== (form.reconstructed === true)) {
		problems.push(
			`${id}: display ${starred ? 'stars' : 'does not star'} a form that is ${form.reconstructed === true ? '' : 'not '}reconstructed (§3.1 rule 3)`,
		);
	}
	checkNumeral(at, problems);
	const labels = [...after.matchAll(GENDER_IN_DISPLAY)].map(
		(m) => m.groups?.['label'],
	);
	const label = labels.length === 1 ? labels[0] : undefined;
	if (label !== form.gender) {
		problems.push(
			`${id}: display says gender ${String(label)} but the form says ${String(form.gender)} (§3.1 rule 3)`,
		);
	}
}

/** Rule 3's numeral clause, for one form. It reads the gap AFTER the
 * slot, up to the next slot, and distinguishes the two cases §3.1
 * separates. Exactly one numeral is this form's `homograph`. **Two or
 * more are not a number for this form at all** — `{0} I, II` is a
 * cross-reference naming two other entries — and the form must carry
 * none.
 *
 * An `implied` homograph is one print does not number (ruling 10-06
 * implied I), so its slot must show no numeral at all: the number is
 * in the name and nowhere on the line. */
function checkNumeral(at: MarkerSite, problems: string[]): void {
	const { after, form, id } = at;
	const romans = [...after.matchAll(ROMAN_IN_DISPLAY)].map((m) => m[0]);
	const expected = romans.length === 1 ? romans[0] : undefined;
	const shown = form.implied === true ? undefined : form.homograph;
	const written = shown === undefined ? undefined : intToRomanLocal(shown);
	if (expected === written) {
		return;
	}
	problems.push(
		form.implied === true
			? `${id}: display sets ${String(expected)} beside a form whose homograph is implied, which print does not number (§3.1 rule 3, ruling 10-06 implied I)`
			: `${id}: display says homograph ${String(expected)} but the form says ${String(written)} (§3.1 rule 3)`,
	);
}

/** Rule 3's two halves that hold with or without a `display`
 * (rulings 10-06 hidden superscript and implied I):
 *
 * - `display` carries no superscript digit. A `disambiguator` is named
 *   and never displayed, so a superscript in the template is either
 *   that number shown, or one no form carries.
 * - `implied` stands only beside a `homograph`: it says the numeral is
 *   ours, so with no numeral it says nothing. The schema refuses the
 *   same shape first (`dependentRequired`); this holds it for a caller
 *   that reads the rules without the schema. */
function checkNamedNotShown(
	entry: Pick<Entry, 'display' | 'headwords' | 'id'>,
	problems: string[],
): void {
	const sup = SUPERSCRIPT.exec(entry.display ?? '');
	if (sup !== null) {
		problems.push(
			`${entry.id}: display carries the superscript ${JSON.stringify(sup[0])}; a disambiguator is named, never displayed (§3.1 rule 3, ruling 10-06 hidden superscript)`,
		);
	}
	for (const [i, form] of entry.headwords.entries()) {
		if (form.implied === true && form.homograph === undefined) {
			problems.push(
				`${entry.id}: headwords[${i}] is implied with no homograph (§3.1 rule 3, ruling 10-06 implied I)`,
			);
		}
	}
}

/** The Roman numeral for a homograph. A local copy of the parser's
 * table rather than an import of it: this module is the CHECK on what
 * the parser wrote, and a shared helper would make both sides of the
 * comparison the same code. */
function intToRomanLocal(n: number): string {
	const table: ReadonlyArray<readonly [number, string]> = [
		[100, 'C'],
		[90, 'XC'],
		[50, 'L'],
		[40, 'XL'],
		[10, 'X'],
		[9, 'IX'],
		[5, 'V'],
		[4, 'IV'],
		[1, 'I'],
	];
	let rest = n;
	let out = '';
	for (const [value, glyph] of table) {
		while (rest >= value) {
			out += glyph;
			rest -= value;
		}
	}
	return out;
}

/** Rule 5, the half that is a property of the DATA: a `partial`
 * alternate needs a sibling written out in full.
 *
 * `partial` says "shown as printed, never a lookup key". An entry
 * whose alternates are all partial still has `headwords[0]`, and §2
 * rules that an abbreviation which is an entry's ONLY name stays a key
 * rather than becoming partial (§4's X7 row). Index 0 is therefore
 * exempt: §4's H6 row marks three PRIMARY headwords partial on
 * purpose (K00107, P00137, A02002), and a URL name is still derived
 * from them with the notation stripped (`names.ts`). */
function checkPartial(
	id: string,
	headwords: readonly FormObject[],
	problems: string[],
): void {
	const full = headwords.some((f) => f.partial !== true);
	for (const [i, form] of headwords.entries()) {
		if (i > 0 && form.partial === true && !full) {
			problems.push(
				`${id}: headwords[${i}] is partial with no full sibling, so the entry has no lookup key (§3.1 rule 5)`,
			);
		}
	}
}

/** Every §3.1 rule over one entry, rule 4 included: it halts, as the
 * file header says. Returns the problems; an empty list is a valid
 * entry.
 *
 * **Rule 6 is not a check of its own, and that is deliberate.** It
 * says every comparison normalizes to NFC FIRST — an obligation on
 * the comparisons this file's caller already makes, not a new one.
 * Its storage half is discharged by the write step rather than
 * checked here (`normalizeForWrite`, #110). `names.ts`'s
 * `nameKey` normalizes before the uniqueness check, `validate.ts`
 * normalizes before the `sefariaHeadword` one, and `cite.ts` before
 * the headword map's. Adding a within-entry duplicate check here would
 * be a SEVENTH rule wearing rule 6's number: it fires on four
 * committed entries (A02981, E00199, Q01624, U00076, each of which
 * lists its primary form again among its alternates), and nothing in
 * §3 or §4 rules on that shape. It is reported to the maintainer
 * instead of halted on. */
function headwordShapeProblems(
	entry: Pick<Entry, 'display' | 'headwords' | 'id'>,
): string[] {
	const problems: string[] = [];
	checkPartial(entry.id, entry.headwords, problems);
	problems.push(...textDefects(entry));
	checkNamedNotShown(entry, problems);
	const { display } = entry;
	if (display === undefined) {
		// §3: a line the source cannot settle is written WITHOUT a
		// display and flagged. Rules 1–3 are about the template, so they
		// have nothing to check — and inventing a default to check them
		// against is exactly what §3 forbids.
		return problems;
	}
	checkNoHebrew(entry.id, display, problems);
	const template = readTemplate(display);
	checkSlots(entry.id, entry.headwords, template, problems);
	for (const [at, slot] of template.slots.entries()) {
		const form = entry.headwords[slot];
		if (form !== undefined) {
			checkMarkers(
				{
					after: template.gaps[at + 1] ?? '',
					before: template.gaps[at] ?? '',
					form,
					id: entry.id,
				},
				problems,
			);
		}
	}
	return problems;
}

export { headwordShapeProblems, textDefects };
