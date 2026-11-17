/**
 * The headword rules: checks on an entry's `headwords` and `display`.
 *
 * 1. Every form index appears in `display` exactly once.
 * 2. `display` holds no Hebrew.
 * 3. The markers in `display` agree with the forms: `*` with
 *    `reconstructed`, a single Roman numeral with `homograph`, `m.` or
 *    `f.` with `gender`. `display` holds no superscript digit.
 * 4. A form's `text` holds no comma, parenthesis, `?`, `=`, `…` or
 *    Latin letter.
 * 5. A `partial` alternate has a sibling written in full.
 *
 * Rules 1 to 3 read `display` with its `<annotate>` tags removed.
 */
import { withoutAnnotateTags } from '../lib/annotate.ts';
import { isLexical, SUPERSCRIPT_DIGIT } from '../lib/hebrew.ts';
import { intToRoman } from '../lib/roman.ts';
import { type Entry, type FormObject, PLACEHOLDER } from './schema.ts';

/** A character rule 4 forbids in a form's `text`. */
const FORBIDDEN_IN_TEXT = /[(),?=…]|[A-Za-z]/u;
/** A Roman numeral standing alone in `display`. */
const ROMAN_IN_DISPLAY = /(?<![A-Za-z])[IVXLC]+(?![A-Za-z])/gu;
/** An `m.` or `f.` gender label in `display`. */
const GENDER_IN_DISPLAY = /(?<![A-Za-z])(?<label>[mf])\.(?![A-Za-z])/gu;
/**
 * A `*` followed only by delimiters, `?` or whitespace to the end of a
 * gap.
 */
const STAR_REACHES = /\*[\s()?]*$/u;

/**
 * Checks rule 4: no form's `text` holds notation.
 *
 * @param entry - The entry's `headwords` and `id`.
 * @returns One problem per offending form.
 */
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

/**
 * A `display` template split at its placeholders: `slots[i]` is the
 * form index of placeholder i, `gaps[i]` the text before it, and the
 * last gap the text after the final placeholder.
 */
interface Template {
	gaps: string[];
	slots: number[];
}

/**
 * Splits a `display` template at its placeholders.
 *
 * @param display - The template.
 * @returns The slots and the gaps between them.
 */
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

/**
 * Checks rule 1: the template names each form index exactly once, and
 * no other.
 *
 * @param id - The entry's rid.
 * @param headwords - The entry's forms.
 * @param template - The split template.
 * @param problems - The list problems are appended to.
 */
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

/**
 * Checks rule 2: reports the first Hebrew character in `display`.
 *
 * @param id - The entry's rid.
 * @param display - The template.
 * @param problems - The list problems are appended to.
 */
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

/**
 * One form's place in the template: the form, the gaps before and
 * after its slot, and the entry's rid.
 */
interface MarkerSite {
	after: string;
	before: string;
	form: FormObject;
	id: string;
}

/**
 * Checks rule 3 for one form: the star, numeral and gender label
 * around its slot match its `reconstructed`, `homograph` and `gender`.
 *
 * @param at - The form and the gaps around its slot.
 * @param problems - The list problems are appended to.
 */
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

/**
 * Checks rule 3's numeral clause for one form: a single Roman numeral
 * after the slot must equal the form's `homograph`; with none, or more
 * than one, the form must have no `homograph`.
 *
 * @param at - The form and the gaps around its slot.
 * @param problems - The list problems are appended to.
 */
function checkNumeral(at: MarkerSite, problems: string[]): void {
	const { after, form, id } = at;
	const romans = [...after.matchAll(ROMAN_IN_DISPLAY)].map((m) => m[0]);
	const expected = romans.length === 1 ? romans[0] : undefined;
	const written =
		form.homograph === undefined ? undefined : intToRoman(form.homograph);
	if (expected === written) {
		return;
	}
	problems.push(
		`${id}: display says homograph ${String(expected)} but the form says ${String(written)} (§3.1 rule 3)`,
	);
}

/**
 * Reports a superscript digit in `display`.
 *
 * @param id - The entry's rid.
 * @param display - The template, or `''` if the entry has none.
 * @param problems - The list problems are appended to.
 */
function checkNoSuperscriptInDisplay(
	id: string,
	display: string,
	problems: string[],
): void {
	const sup = SUPERSCRIPT_DIGIT.exec(display);
	if (sup !== null) {
		problems.push(
			`${id}: display carries the superscript ${JSON.stringify(sup[0])}; print sets none (§3.1 rule 3, ruling 11-13 url words)`,
		);
	}
}

/**
 * Checks rule 5: reports each `partial` alternate of an entry whose
 * forms are all partial. The first form is exempt.
 *
 * @param id - The entry's rid.
 * @param headwords - The entry's forms.
 * @param problems - The list problems are appended to.
 */
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

/**
 * Runs the headword rules on one entry. Rules 1 to 3 are skipped when
 * the entry has no `display`.
 *
 * @param entry - The entry's `display`, `headwords` and `id`.
 * @returns The problems found; empty if the headwords are valid.
 */
function headwordShapeProblems(
	entry: Pick<Entry, 'display' | 'headwords' | 'id'>,
): string[] {
	const problems: string[] = [];
	checkPartial(entry.id, entry.headwords, problems);
	problems.push(...textDefects(entry));
	const display =
		entry.display === undefined
			? undefined
			: withoutAnnotateTags(entry.display);
	checkNoSuperscriptInDisplay(entry.id, display ?? '', problems);
	if (display === undefined) {
		// Rules 1 to 3 need a template.
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
