/**
 * The headword LINE — Sefaria's `headword` followed by its
 * `alt_headwords`, read back as the one line print sets
 * (`docs/v2/headword-design.md` §2, ruled 2026-09-21).
 *
 * The old `decomposeForm` read one ITEM at a time and could only keep
 * what fitted `*text ROMAN SUP`; everything print sets BETWEEN the
 * forms — the parentheses that group a run of variant readings, the
 * `?` of a doubtful reading, the `…` of an elided ending — had to be
 * deleted or left inside the lookup key. This module reads the whole
 * line instead and splits it in two:
 *
 * - **`headwords[]`** carries only MEANING. Each form's `text` is
 *   clean Hebrew: never a comma, parenthesis, `?`, `=`, `…` or Latin
 *   letter (§3.1 rule 4). Index 0 is the primary form.
 * - **`display`** is a template carrying LAYOUT. `{n}` stands for form
 *   n's bare text; everything else is literal notation, and never
 *   Hebrew (§3.1 rule 2).
 *
 * `display` is OPTIONAL. Where the source cannot settle the layout the
 * entry is still written, `display` is left unset and the row is
 * flagged — a ticket, not a guess (§3). Two things unsettle it: a
 * parenthesis group the line never closes (`paren-group-close-unknown`,
 * §4's H2 rows and A01394) and a form text the grammar cannot account
 * for at all (`headword-unparsed`, §3's halt).
 *
 * **What the parser deliberately does NOT do** is move notation. §5
 * records that parenthesis placement is not trustworthy in the source
 * — A02823's group sits on the alternate where the print sets it on
 * the headword — and rules that "only what the source shows is
 * recorded" until the ~580 placements are checked against the print.
 * So a parenthesis is emitted where the source puts it, and a Roman
 * numeral stays on the form it is attached to (§4, HW-roman).
 *
 * **The separator between items is supplied, not recovered.** Sefaria
 * split the line at print's commas and did not keep them (§1), so no
 * parser can know whether print set one. §4's commas row rules that
 * the app supplies separators; this module joins the items with `, `,
 * which reproduces every worked example in the §2 table but one
 * (A02823, whose line print sets without a comma).
 */
import type { FormObject } from './types.ts';

/** Superscript digits, in value order — `intToSup`'s alphabet and
 * `supToInt`'s lookup, so the two cannot disagree about a glyph. */
const SUP_DIGITS = '⁰¹²³⁴⁵⁶⁷⁸⁹';
/** Roman numeral values, largest first: the greedy table both
 * `intToRoman` and `romanToInt` walk. */
const ROMAN: ReadonlyArray<readonly [number, string]> = [
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
/** Jastrow's abbreviation mark: a word ending in a geresh is written
 * short (`פּ׳` for *Pappa*). Gershayim (U+05F4) is NOT this mark — it
 * sits BETWEEN letters in an acronym (`א"ל`), which §4 rules a
 * legitimate, fully searchable form. */
const GERESH = '׳';
/** The elision mark print sets before an ending that replaces the base
 * form's (`… טָה`, §4's H5 rows). */
const ELLIPSIS = '…';
/** A Latin run that is a Roman numeral and nothing else. */
const ROMAN_TOKEN = /^[IVXLC]+$/u;
/** The two gender labels print sets beside a form (§2's headline
 * example, `{0} m., {1} f.`). Their `.` is part of the token. */
const GENDER_TOKEN = /^[mf]\.$/u;
const LATIN = /[A-Za-z]/u;
const WHITESPACE = /\s+/gu;
/** `{0}`, `{12}` — a form's slot in a `display` template. */
const PLACEHOLDER = /\{(\d+)\}/gu;
/** The notation run immediately before a form's slot, once the slot
 * before it has been cut away. A `*` anywhere in it marks the form (or
 * the group it opens) reconstructed — §3.1 rule 3. */
const STAR_RUN = /\*/u;

/** Which review row a headword line becomes.
 *
 * - `headword-unparsed` — a form `text` the grammar cannot account
 *   for. This is §3's halt: the text is a lookup key, a slug and a
 *   link target, so a wrong one cannot be published. Armed in
 *   `validate.ts` and held while the corpus still trips it.
 * - `paren-group-close-unknown` — the line's parentheses do not
 *   balance, so `display` cannot be settled without the print (§4's
 *   H2 rows and A01394). The forms are clean and are written.
 * - `headword-partial-only` — every ALTERNATE of the entry is
 *   `partial`, so the entry has no alternate lookup key until the
 *   print work in #107. A note: nothing is wrong with the data.
 * - `headword-duplicate-form` — the line names one form twice, the
 *   two spellings compared in NFC (§3.1 rule 6). Nothing in §3 or §4
 *   rules on the shape, so it is reported rather than halted on.
 */
type HeadwordReviewKind =
	| 'headword-duplicate-form'
	| 'headword-partial-only'
	| 'headword-unparsed'
	| 'paren-group-close-unknown';

/** Every headword review kind, as a lookup. A `Record` over the union
 * rather than an array, so adding a kind is a TYPE ERROR here instead
 * of a silent omission from the report's headword list and from
 * `headword-issues.ts`'s flagged column. */
const HEADWORD_REVIEW_KINDS: Readonly<Record<HeadwordReviewKind, true>> = {
	'headword-duplicate-form': true,
	'headword-partial-only': true,
	'headword-unparsed': true,
	'paren-group-close-unknown': true,
};

/** Whether a report row's kind is one this parser mints. */
function isHeadwordReviewKind(kind: string): boolean {
	return Object.hasOwn(HEADWORD_REVIEW_KINDS, kind);
}

/** Why a line is on the headword review list, and under which kind. */
interface HeadwordReview {
	kind: HeadwordReviewKind;
	reason: string;
}

/** One headword line, read. `display` is absent exactly when
 * `reviews` carries a reason it could not be settled. */
interface ParsedLine {
	display?: string;
	headwords: FormObject[];
	reviews: HeadwordReview[];
}

/** A homograph number as the Roman numeral Jastrow prints. */
function intToRoman(n: number): string {
	let rest = n;
	let out = '';
	for (const [value, glyph] of ROMAN) {
		while (rest >= value) {
			out += glyph;
			rest -= value;
		}
	}
	return out;
}

/** A Roman numeral back to its number, or NaN when the string is not
 * one this table can consume whole — the caller treats NaN as "this
 * did not parse" rather than guessing at a partial reading. */
function romanToInt(s: string): number {
	let total = 0;
	let rest = s;
	for (const [value, glyph] of ROMAN) {
		while (rest.startsWith(glyph)) {
			total += value;
			rest = rest.slice(glyph.length);
		}
	}
	return rest === '' ? total : Number.NaN;
}

/** A disambiguator as superscript digits. */
function intToSup(n: number): string {
	return [...String(n)].map((d) => SUP_DIGITS[Number(d)] ?? '').join('');
}

/** Superscript digits back to a number, or NaN on any character that
 * is not one — see `romanToInt` for why a partial read is refused. */
function supToInt(s: string): number {
	let out = '';
	for (const ch of s) {
		const digit = SUP_DIGITS.indexOf(ch);
		if (digit < 0) {
			return Number.NaN;
		}
		out += String(digit);
	}
	return Number(out);
}

/** Hebrew letters, points, accents, geresh, gershayim and the
 * combining dot above — the characters a form's `text` is built from.
 *
 * Tested by CODE POINT rather than by a character class: a combining
 * mark written into a class attaches to its neighbour and silently
 * widens the range (the hazard `transform/html.ts` documents), and
 * biome's `noMisleadingCharacterClass` rejects the escape sitting
 * beside a base-character range in one class. Numbers cannot be
 * misread either way.
 *
 * U+05D0–U+05EA letters · U+0591–U+05C7 points, accents and Hebrew
 * punctuation (the maqaf U+05BE is inside that range) · U+05F3 geresh
 * · U+05F4 gershayim · U+0307 combining dot above. */
function isLexical(ch: string): boolean {
	const c = ch.codePointAt(0) ?? 0;
	return (
		(c >= 0x05_d0 && c <= 0x05_ea) ||
		(c >= 0x05_91 && c <= 0x05_c7) ||
		c === 0x05_f3 ||
		c === 0x05_f4 ||
		c === 0x03_07
	);
}

/** One scanned piece of a source item: a run of Hebrew (which becomes
 * a form) or a run of notation (which becomes literal `display`). */
interface Piece {
	kind: 'mark' | 'text';
	value: string;
}

/** Split one source item into Hebrew runs and notation runs.
 *
 * A single space BETWEEN two Hebrew characters stays inside the run:
 * a multi-word form is one lemma, not two (§4 rules reduplication,
 * spaced variants and phrase headwords legitimate). Any other run of
 * whitespace collapses to one space first, so the doubled space
 * Sefaria leaves in front of a numeral (`אוּרְיָה  I, II`) does not
 * reach either side of the split.
 *
 * A Latin run takes a following `.` with it, so `m.` and `f.` arrive
 * as one token rather than a letter and a period. Superscript digits
 * run together for the same reason. */
function scanItem(item: string): Piece[] {
	const chars = [...item.replace(WHITESPACE, ' ').trim()];
	const pieces: Piece[] = [];
	let i = 0;
	while (i < chars.length) {
		if (isLexical(chars[i] ?? '')) {
			const end = hebrewRunEnd(chars, i);
			pieces.push({ kind: 'text', value: chars.slice(i, end).join('') });
			i = end;
			continue;
		}
		const run = scanRun(chars, i);
		pieces.push({ kind: 'mark', value: run });
		i += [...run].length;
	}
	return pieces;
}

/** Where the Hebrew run starting at `at` ends. A single space between
 * two Hebrew characters stays INSIDE the run — a multi-word form is
 * one lemma — but a trailing one does not, so the run ends on its
 * last letter rather than on the gap after it. */
function hebrewRunEnd(chars: readonly string[], at: number): number {
	let j = at;
	let end = at;
	while (j < chars.length) {
		const c = chars[j] ?? '';
		if (isLexical(c)) {
			j++;
			end = j;
			continue;
		}
		if (c === ' ' && isLexical(chars[j + 1] ?? '')) {
			j++;
			continue;
		}
		break;
	}
	return end;
}

/** One notation run starting at `at`: a Latin word (plus a trailing
 * `.`), a superscript number, or a single other character. */
function scanRun(chars: readonly string[], at: number): string {
	const ch = chars[at] ?? '';
	if (LATIN.test(ch)) {
		let j = at;
		while (j < chars.length && LATIN.test(chars[j] ?? '')) {
			j++;
		}
		if (chars[j] === '.') {
			j++;
		}
		return chars.slice(at, j).join('');
	}
	if (SUP_DIGITS.includes(ch)) {
		let j = at;
		while (j < chars.length && SUP_DIGITS.includes(chars[j] ?? '')) {
			j++;
		}
		return chars.slice(at, j).join('');
	}
	return ch;
}

/** One form under construction: the object being filled, the notation
 * that follows it inside its own item, and whether the item attached
 * it to the form before it with no space (print's optional-ending
 * notation, `אִיסְפְּלָנִית(א)`). */
interface Building {
	attached: boolean;
	form: FormObject;
	trailing: string[];
}

/** One source item, read: the forms it holds and the `display`
 * fragment that puts them back where print set them. */
interface ItemParse {
	building: Building[];
	fragment: string;
	problems: string[];
}

/** Read one source item. `first` is the global index the item's first
 * form takes, so the fragment's placeholders are line-wide. */
function parseItem(item: string, first: number): ItemParse {
	const scan = collectPieces(scanItem(item), first);
	const { building, fragment, leading } = scan;
	const problems: string[] = [];
	if (building.length === 0) {
		problems.push('the item holds no Hebrew');
		return { building, fragment, problems };
	}
	const head = building[0];
	if (head !== undefined && STAR_RUN.test(leading.join(''))) {
		head.form.reconstructed = true;
	}
	problems.push(...markLeading(leading));
	for (const one of building) {
		problems.push(...applyTrailing(one));
	}
	markPartial(item, building);
	return { building, fragment, problems };
}

/** One item's scanned pieces, sorted into the forms they make, the
 * notation standing in front of the first of them, and the `display`
 * fragment that puts them back in place. */
interface ItemScan {
	building: Building[];
	fragment: string;
	leading: string[];
}

/** Walk an item's pieces once, building all three at the same time.
 *
 * `sawSpaceSinceForm` is what decides `attached`: a form the item ran
 * straight onto the one before it, with no space between, is print's
 * optional-ending notation rather than a lemma of its own. It starts
 * TRUE so an item's first form is never attached to nothing. */
function collectPieces(pieces: readonly Piece[], first: number): ItemScan {
	const building: Building[] = [];
	const leading: string[] = [];
	let fragment = '';
	let sawSpaceSinceForm = true;
	for (const piece of pieces) {
		if (piece.kind === 'mark') {
			(building.at(-1)?.trailing ?? leading).push(piece.value);
			if (piece.value === ' ') {
				sawSpaceSinceForm = true;
			}
			fragment += piece.value;
			continue;
		}
		building.push({
			attached: building.length > 0 && !sawSpaceSinceForm,
			form: { text: piece.value },
			trailing: [],
		});
		sawSpaceSinceForm = false;
		fragment += `{${first + building.length - 1}}`;
	}
	return { building, fragment, leading };
}

/** Notation standing in front of an item's first form. Only `*`, the
 * grouping delimiters, `?` and whitespace belong there; anything else
 * — a stray `=`, a Latin word — is a text defect the grammar has no
 * reading for. */
function markLeading(leading: readonly string[]): string[] {
	const problems: string[] = [];
	for (const mark of leading) {
		if (mark === '*' || mark === '(' || mark === ')' || mark === '?') {
			continue;
		}
		if (mark === ' ' || mark === ELLIPSIS || mark === ',') {
			continue;
		}
		problems.push(`notation ${JSON.stringify(mark)} before the form`);
	}
	return problems;
}

/** The notation following one form inside its own item, read onto that
 * form: a SINGLE Roman numeral is its homograph, superscript digits
 * its disambiguator, `m.`/`f.` its gender.
 *
 * **Two or more numerals are not this form's number** (§3.1 rule 3,
 * §4's H1 row): `אוּרְיָה I, II` is a cross-reference naming two other
 * entries, each of which carries its own `homograph`. They stay in
 * `display` and nothing is written on the form. */
function applyTrailing(one: Building): string[] {
	const problems: string[] = [];
	const romans: string[] = [];
	for (const mark of one.trailing) {
		problems.push(...readMark(mark, one, romans));
	}
	problems.push(...readHomograph(one, romans));
	return problems;
}

/** One trailing mark onto its form, or a reason it is not one this
 * grammar has a reading for. Roman numerals are COLLECTED rather than
 * applied, because what a numeral means depends on how many of them
 * the segment holds — see `readHomograph`. */
function readMark(mark: string, one: Building, romans: string[]): string[] {
	if (ROMAN_TOKEN.test(mark)) {
		romans.push(mark);
		return [];
	}
	if (GENDER_TOKEN.test(mark)) {
		one.form.gender = mark.startsWith('m') ? 'm' : 'f';
		return [];
	}
	if (LATIN.test(mark)) {
		return [`Latin run ${JSON.stringify(mark)} beside the form`];
	}
	if (SUP_DIGITS.includes(mark.charAt(0))) {
		return readSuperscript(mark, one);
	}
	if (mark === '=') {
		return ['the line holds `=`, which introduces a gloss reference'];
	}
	return [];
}

/** Superscript digits as the form's disambiguator. A run that does
 * not read as a whole number is refused rather than partly consumed
 * (see `supToInt`). */
function readSuperscript(mark: string, one: Building): string[] {
	const value = supToInt(mark);
	if (!Number.isInteger(value) || value < 1) {
		return [`superscript ${JSON.stringify(mark)} is not a number`];
	}
	one.form.disambiguator = value;
	return [];
}

/** The collected numerals onto the form.
 *
 * **Exactly one is this form's `homograph`. Two or more are not its
 * number at all** (§3.1 rule 3, §4's H1 row): `אוּרְיָה I, II` is a
 * cross-reference naming two other entries, each carrying its own
 * numbering, so nothing is written here and the numerals stay in
 * `display`. Zero is the ordinary case. */
function readHomograph(one: Building, romans: readonly string[]): string[] {
	if (romans.length !== 1) {
		return [];
	}
	const value = romanToInt(romans[0] ?? '');
	if (!Number.isInteger(value) || value < 1) {
		return [`Roman numeral ${JSON.stringify(romans[0])} does not read`];
	}
	one.form.homograph = value;
	return [];
}

/** Which of an item's forms are `partial` — shown as printed, never a
 * lookup key (§2).
 *
 * - An item holding an ELLIPSIS is an ending that replaces the base
 *   form's (§4's H5 rows). Every form it holds is partial: `ק … טִינֵי`
 *   is one elided word written as two fragments, not two lemmas.
 * - A form the item ATTACHED to the one before it with no space is
 *   print's optional-ending notation — `אִיסְפְּלָנִית(א)`, §4's A01480
 *   row, "an alternate ending of one word, not a separate form".
 *   `partial` is how the §2 shape says that: shown as printed, never a
 *   key.
 *
 * The third source of `partial` — an abbreviated form with a full
 * sibling — is a property of the LINE, not of one item, and is applied
 * in `parseHeadwordLine`. */
function markPartial(item: string, building: readonly Building[]): void {
	const elided = item.includes(ELLIPSIS);
	for (const one of building) {
		if (elided || one.attached) {
			one.form.partial = true;
		}
	}
}

/** Whether a form is written short — any of its words ends in a
 * geresh (`נְהַר פּ׳`, `כ׳`). Not gershayim: that mark sits between an
 * acronym's letters and the word is whole. */
function isAbbreviated(text: string): boolean {
	return text.split(' ').some((word) => word.endsWith(GERESH));
}

/** `partial` for the abbreviated forms, which only the whole line can
 * decide (§2, §4's H6/X6/X7 rows).
 *
 * - A MULTI-WORD form with an abbreviated word is always partial:
 *   `נְהַר פּ׳` is *N'har Pappa* with the second word written short, and
 *   §4 marks it partial wherever it sits — including as the entry's
 *   primary headword (K00107, P00137, A02002).
 * - A single abbreviated WORD is partial only as an ALTERNATE beside a
 *   form written out in full. An abbreviation that is the entry's only
 *   name stays a lookup key, notation and all (§4's X7 row): 28 of
 *   those 34 entries have no other form, and marking them partial
 *   would leave them unfindable. */
function markAbbreviated(forms: readonly FormObject[]): void {
	const hasFull = forms.some((f) => !isAbbreviated(f.text));
	for (const [i, form] of forms.entries()) {
		if (!isAbbreviated(form.text)) {
			continue;
		}
		if (form.text.includes(' ') || (i > 0 && hasFull)) {
			form.partial = true;
		}
	}
}

/** A separator no form text, homograph or disambiguator can hold, so
 * a joined key cannot be confused by one field ending where the next
 * begins.
 *
 * Built with `String.fromCodePoint` rather than written as a unicode
 * escape for U+0000: `biome format` DECODES such an escape into a
 * literal NUL byte in the source, which makes this file `data` rather
 * than text to `file(1)` and — the part that matters — silently
 * invisible to a plain `grep` over `admin/`. A module that cannot be
 * found by searching for the
 * names in it is worse than a slightly indirect constant. */
const KEY_SEPARATOR = String.fromCodePoint(0);

/** The forms a line names twice, compared in NFC — §3.1 rule 6's
 * "duplicate check", which is a COMPARISON the rule tells us how to
 * make rather than a halt it imposes. Two spellings whose combining
 * marks are ordered differently are canonically equal and would be two
 * keys under a byte comparison, so the key is normalized; the stored
 * text is not.
 *
 * Neither §3 nor §4 rules on what a repeated form MEANS — print may
 * set a word twice on one line for a reason the source cannot show —
 * so this is a review row and never an error. Measured over the
 * committed tree: four entries (A02981, E00199, Q01624, U00076), each
 * naming its primary form again among its alternates. */
function duplicateForms(headwords: readonly FormObject[]): HeadwordReview[] {
	const seen = new Map<string, number>();
	const reviews: HeadwordReview[] = [];
	for (const [i, form] of headwords.entries()) {
		const key = [
			form.text.normalize('NFC'),
			form.homograph ?? '',
			form.disambiguator ?? '',
		].join(KEY_SEPARATOR);
		const owner = seen.get(key);
		if (owner === undefined) {
			seen.set(key, i);
		} else {
			reviews.push({
				kind: 'headword-duplicate-form',
				reason: `headwords[${i}] repeats headwords[${owner}] (${form.text}) under NFC`,
			});
		}
	}
	return reviews;
}

/** Whether the line's parentheses balance. A group may span items —
 * the upstream split cut print's one group at its internal comma, so
 * `(אוֹרָיָיתָא` opens in one item and `אוֹרְיָה)` closes in a later one
 * — so the depth is counted over the whole line rather than per item.
 * A `)` at depth 0 is A01394's stray close; depth left open at the end
 * is §4's H2 shape. Either one leaves `display` unset. */
function parensBalance(items: readonly string[]): boolean {
	let depth = 0;
	for (const ch of items.join('')) {
		if (ch === '(') {
			depth++;
		} else if (ch === ')') {
			depth--;
			if (depth < 0) {
				return false;
			}
		}
	}
	return depth === 0;
}

/** Read a whole headword line: Sefaria's `headword` as `items[0]`,
 * then its `alt_headwords` in source order.
 *
 * Every item contributes at least one form and the forms keep the
 * source's order, so `headwords[0]` is the primary form the name, the
 * search key and every link are derived from (§2).
 *
 * A line whose grammar does not read — a `=` introducing a gloss
 * reference, a Latin word that is no numeral, an item with no Hebrew
 * in it at all — is NOT half-parsed. Every item is kept whole as one
 * form's `text` and the line is flagged `headword-unparsed`: a text
 * defect is §3's halt, and a line that is wrong in one place gives no
 * ground to trust the rest of it. */
function parseHeadwordLine(items: readonly string[]): ParsedLine {
	const parsed: ItemParse[] = [];
	let next = 0;
	for (const item of items) {
		const one = parseItem(item, next);
		next += one.building.length;
		parsed.push(one);
	}
	const problems = parsed.flatMap((p) => p.problems);
	if (problems.length > 0) {
		return {
			headwords: items.map((item) => ({ text: item })),
			reviews: [
				{
					kind: 'headword-unparsed',
					reason: [...new Set(problems)].join('; '),
				},
			],
		};
	}
	const headwords = parsed.flatMap((p) => p.building.map((b) => b.form));
	markAbbreviated(headwords);
	const reviews: HeadwordReview[] = [...duplicateForms(headwords)];
	const alternates = headwords.slice(1);
	if (alternates.length > 0 && alternates.every((f) => f.partial === true)) {
		reviews.push({
			kind: 'headword-partial-only',
			reason: `all ${alternates.length} alternate(s) are partial; the entry has no alternate lookup key`,
		});
	}
	if (!parensBalance(items)) {
		reviews.push({
			kind: 'paren-group-close-unknown',
			reason:
				"the line's parentheses do not balance, so the layout cannot be settled from the source",
		});
		return { headwords, reviews };
	}
	return {
		display: parsed.map((p) => p.fragment).join(', '),
		headwords,
		reviews,
	};
}

/** A `display` template with each `{n}` replaced by form n's text —
 * the line as a reader sees it. Used by the gates and the report; the
 * app renders the template itself so it can link each span. */
function renderDisplay(
	display: string,
	headwords: readonly FormObject[],
): string {
	return display.replace(
		PLACEHOLDER,
		(whole, index: string) => headwords[Number(index)]?.text ?? whole,
	);
}

export type { HeadwordReview, HeadwordReviewKind, ParsedLine };
export {
	GERESH,
	intToRoman,
	intToSup,
	isAbbreviated,
	isHeadwordReviewKind,
	isLexical,
	PLACEHOLDER,
	parseHeadwordLine,
	renderDisplay,
	romanToInt,
	supToInt,
};
