/**
 * The six rules the pipeline halts on (`docs/v2/headword-design.md`
 * §3.1), as checks over a FINISHED entry. They hold however the entry
 * got there — the pipeline's write or a hand edit — so they live here
 * rather than inside the parser, and `validate.ts` runs them over the
 * committed tree in `bun qa`.
 *
 * 1. Every form index appears in `display` exactly once.
 * 2. `display` holds no Hebrew letters or points.
 * 3. Markers agree with the forms: `*` before `{n}` or its group ⇔
 *    `reconstructed`; a SINGLE numeral beside `{n}` ⇔ `homograph`;
 *    `m.`/`f.` beside `{n}` ⇔ `gender`.
 * 4. A form's `text` never holds a comma, parenthesis, `?`, `=`, `…`
 *    or a Latin letter.
 * 5. A `partial` form is never a lookup key.
 * 6. Every comparison normalizes to NFC first. No stage rewrites
 *    stored text except the migrate WRITE step, which normalizes the
 *    whole entry file (`normalizeForWrite`, #110 — §3.1 rule 6 names
 *    it as the one exception). Nothing in THIS file rewrites anything.
 *
 * **Rule 4 is ARMED AND HELD, and that is a ruling, not an oversight.**
 * §3 makes a text defect a halt, so the natural home for rule 4 is a
 * validation error beside the other five. Two entries in the corpus
 * still trip it — A01175 and A01345, whose headword line is
 * `X = Y` and whose repair (§4's H4 row: move `= Y` into the gloss)
 * needs a patch op that does not exist yet ([#113]). Turning the halt
 * on would therefore make every run red over a defect already
 * catalogued, already flagged and already ticketed.
 *
 * So the defect is REPORTED rather than refused: the parser files the
 * same two lines as `headword-unparsed` `blocks` rows, which is what a
 * reader acts on, and `textDefects` is the validate-side arm — the
 * only thing a HAND EDIT to a committed file would ever meet.
 * `HALT_ON_TEXT_DEFECT` is the one switch that promotes it to an
 * error, and the maintainer flips it when those two lines are
 * repaired.
 */
import { isLexical, PLACEHOLDER } from './headwords.ts';
import type { FormObject, TruthEntry } from './types.ts';

/** Whether rule 4 refuses an entry outright (a validation error) or
 * reports it (a `headword-unparsed` review row). Held at `false`
 * while A01175 and A01345 still carry a `=` in their text; see the
 * module docstring. */
const HALT_ON_TEXT_DEFECT: boolean = false;

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

/** Rule 4: the forms whose `text` carries notation it must not — the
 * §3 halt, measured rather than assumed. Returns one line per
 * offending form, empty when the entry is clean. */
function textDefects(entry: Pick<TruthEntry, 'headwords' | 'id'>): string[] {
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

/** Whether rule 4's findings are errors this run. Exported so the two
 * readers — `validate.ts` and the migrate CLI — cannot disagree about
 * which side of the switch they are on. */
function textDefectsHalt(): boolean {
	return HALT_ON_TEXT_DEFECT;
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
 * form says.
 *
 * The numeral clause reads the gap AFTER the slot, up to the next
 * slot, and distinguishes the two cases §3.1 separates. Exactly one
 * numeral is this form's `homograph`. **Two or more are not a number
 * for this form at all** — `{0} I, II` is a cross-reference naming two
 * other entries — and the form must carry none. */
function checkMarkers(at: MarkerSite, problems: string[]): void {
	const { after, before, form, id } = at;
	const starred = STAR_REACHES.test(before);
	if (starred !== (form.reconstructed === true)) {
		problems.push(
			`${id}: display ${starred ? 'stars' : 'does not star'} a form that is ${form.reconstructed === true ? '' : 'not '}reconstructed (§3.1 rule 3)`,
		);
	}
	const romans = [...after.matchAll(ROMAN_IN_DISPLAY)].map((m) => m[0]);
	const expected = romans.length === 1 ? romans[0] : undefined;
	const written =
		form.homograph === undefined ? undefined : intToRomanLocal(form.homograph);
	if (expected !== written) {
		problems.push(
			`${id}: display says homograph ${String(expected)} but the form says ${String(written)} (§3.1 rule 3)`,
		);
	}
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
 * purpose (K00107, P00137, A02002), and a slug is still derived from
 * them with the notation stripped. */
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

/** Every §3.1 rule over one entry, rule 4 included only when the halt
 * is armed. Returns the problems; an empty list is a valid entry.
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
	entry: Pick<TruthEntry, 'display' | 'headwords' | 'id'>,
): string[] {
	const problems: string[] = [];
	checkPartial(entry.id, entry.headwords, problems);
	if (HALT_ON_TEXT_DEFECT) {
		problems.push(...textDefects(entry));
	}
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

export { headwordShapeProblems, textDefects, textDefectsHalt };
