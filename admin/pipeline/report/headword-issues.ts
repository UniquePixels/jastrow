// biome-ignore-all lint/style/noExcessiveLinesPerFile: one report: each row builder needs the same entry map, and splitting them would duplicate the load.
/**
 * Headword issue report — every headword and alternate-headword shape
 * that a perfect-or-halt headword rule would have to rule on, grouped
 * so the shapes can be decided one at a time (`admin/pipeline/DESIGN.md`
 * §2).
 *
 * Built by `bun data:import` on every run, dry or not, from two inputs
 * the run already holds:
 *
 * - the run's report rows, for what the CURRENT processor already
 *   flags (every `isHeadwordReviewKind` row).
 * - the finished entries, walked independently. The processor's
 *   review list is not the defect list: a form can round-trip through
 *   the grammar and still be wrong (a lost letter, a Sefaria split),
 *   and those rows exist only because this file looks for them.
 *
 * `import.ts` writes the result to `docs/reports/headword-issues.md`
 * (read by eye, one section per shape, every rid linked to the live
 * app) and `docs/reports/headword-issues.csv` (the same rows, for
 * sorting).
 */
import { dirname, relative } from 'node:path';
import { intToSup, isHeadwordReviewKind } from '../../entry/headwords.ts';
import { nameOf } from '../../entry/names.ts';
import type { Entry, FormObject } from '../../entry/types.ts';
import {
	DESIGN_PATH,
	HEADWORD_ISSUES_DOC,
	REVIEWED_KEPT_PATH,
} from '../paths.ts';
import { type KeptRecord, type KeptSplit, splitKept } from './reviewed-kept.ts';

const APP_URL = 'https://jastrow.app/#rid:';

// Escapes, never pasted literals: a combining mark typed into a class
// attaches to its neighbour and the range silently widens. U+0307, the
// combining dot above, is its own alternative because biome's
// noMisleadingCharacterClass rejects a mark escape beside a base
// escape in one class (see `admin/entry/headwords.ts`).
const MARKS = /[\u0591-\u05C7]|\u0307/gu;
const LETTERS = /[\u05D0-\u05EA]+/gu;
const LEADING_MARK = /^(?:[\u0591-\u05C7]|\u0307)/u;
const LEXICAL_PLUS_SPACE = /[^\u05D0-\u05EA\u0591-\u05C7\u05F3\u05F4 *]/u;
const LATIN_OR_DIGIT = /[A-Za-z0-9]/u;
const ROMAN_NUMERAL = /[IVXLC]+/gu;
const PAREN_WHOLE = /^\*?\([^()]*\)$/u;
const GERESH = /[\u05F3\u05F4'"]/u;
const MAQAF = '\u05BE';
const DOT_ABOVE = '\u0307';
const DOUBLE_SPACE = '  ';
/** A final letter, which may not stand mid-word (`\u05DA` in
 * F00009's `\u05D5\u05B7\u05D0\u05E8\u05B0\u05DA\u05BC\u05D5\u05BC\u05E0\u05B0\u05D9\u05B8\u05D0`), and the plain forms that may not end one. */
const FINAL_LETTER = /[\u05DA\u05DD\u05DF\u05E3\u05E5]/u;
const NON_FINAL_LETTERS = '\u05DB\u05DE\u05E0\u05E4\u05E6';

interface ReportRow {
	kind: string;
	rid: string;
}

/** One row of the issue report: a shape, the form it was seen on, and
 * whether the current processor already flags it. */
interface IssueRow {
	flagged: boolean;
	/** The entry's current URL name (`admin/entry/names.ts`), for context
	 * beside the form the row is about. Derived, never stored — this
	 * file does not re-implement the derivation the way it once
	 * re-implemented slug-stem stripping. */
	name: string;
	note: string;
	rid: string;
	role: 'alt' | 'headword';
	shape: string;
	text: string;
}

/** A form's consonants: points, accents and the combining dot removed,
 * so two spellings of one word compare equal. */
function consonants(text: string): string {
	return text.normalize('NFD').replace(MARKS, '');
}

/** Whether every `(` closes after it opens. Equal totals are not
 * enough: `)(` balances by count and nests nowhere. */
function parensNest(text: string): boolean {
	let depth = 0;
	for (const ch of text) {
		depth += ch === '(' ? 1 : 0;
		depth -= ch === ')' ? 1 : 0;
		if (depth < 0) {
			return false;
		}
	}
	return depth === 0;
}

/** Every shape `shapeOf` can name. Declared as a closed list so
 * `shapeOf`'s return type IS this union: a branch added there without
 * a name here is a TYPE ERROR, and `classifyEveryShape` can then
 * check the tables against the list rather than against a second copy
 * of it. `lexical` is the only clean answer. */
const SHAPE_NAMES = [
	'comma-list',
	'double-space',
	'equals-variant',
	'latin-or-digit',
	'lexical',
	'multi-word',
	'other-char',
	'paren-optional-letters',
	'paren-unbalanced',
	'paren-whole',
	'query-mark',
] as const;

type ShapeName = (typeof SHAPE_NAMES)[number];

/** The shape a form's TEXT is in, as one name. `lexical` is the only
 * clean answer; every other value is a decision waiting to be taken. */
function shapeOf(text: string): ShapeName {
	if (LATIN_OR_DIGIT.test(text)) {
		return 'latin-or-digit';
	}
	if (text.includes('?')) {
		return 'query-mark';
	}
	if (text.includes('=')) {
		return 'equals-variant';
	}
	if (text.includes(',')) {
		return 'comma-list';
	}
	if (text.includes('(') || text.includes(')')) {
		if (!parensNest(text)) {
			return 'paren-unbalanced';
		}
		return PAREN_WHOLE.test(text) ? 'paren-whole' : 'paren-optional-letters';
	}
	if (text.includes(DOUBLE_SPACE)) {
		return 'double-space';
	}
	// The combining dot above is lexical, but a class holding it
	// beside a base-letter range is ambiguous (biome's
	// noMisleadingCharacterClass). Removing it first says the same
	// thing without the class.
	if (LEXICAL_PLUS_SPACE.test(text.replaceAll(DOT_ABOVE, ''))) {
		return 'other-char';
	}
	return text.includes(' ') ? 'multi-word' : 'lexical';
}

/** Everything wrong with one form, as issue names. A form can carry
 * several: `שִׁיפָ` is both a non-final letter at a word end and half of
 * a Sefaria split. */
function issuesOf(text: string): string[] {
	const issues: string[] = [];
	const shape = shapeOf(text);
	if (shape !== 'lexical') {
		issues.push(`shape:${shape}`);
	}
	if (text.normalize('NFC') !== text) {
		issues.push('not-NFC');
	}
	if (text.trim() !== text) {
		issues.push('edge-space');
	}
	if (LEADING_MARK.test(text.normalize('NFD'))) {
		issues.push('leading-mark');
	}
	for (const word of consonants(text).match(LETTERS) ?? []) {
		if (FINAL_LETTER.test(word.slice(0, -1))) {
			issues.push('final-letter-medial');
		}
		// A plain letter ending a word is only suspicious in a word that
		// is whole. An abbreviation (`אלפ״א`, `קִי׳`) and a prefix or stem
		// fragment (`הֵיכ־`) both end that way by convention, and they
		// are counted under their own shapes.
		const last = word.at(-1) ?? '';
		if (
			word.length > 1 &&
			NON_FINAL_LETTERS.includes(last) &&
			!GERESH.test(text) &&
			!text.includes(MAQAF)
		) {
			issues.push('nonfinal-letter-at-end');
		}
	}
	if (GERESH.test(text)) {
		issues.push('geresh/abbrev');
	}
	if (text.includes(MAQAF)) {
		issues.push('maqaf');
	}
	return [...new Set(issues)];
}

/** Which multi-word sub-shape a form is: the four read very
 * differently, and only one of them is likely to be legitimate. */
function multiWordNote(text: string, headword: string): string {
	const words = text.split(' ').filter((w) => w !== '');
	const skeletons = words.map(consonants);
	if (words.some((w) => w.endsWith('׳'))) {
		return 'abbrev+word';
	}
	if (
		words.length === 2 &&
		skeletons[0] !== undefined &&
		skeletons[1] !== undefined
	) {
		const [a, b] = skeletons;
		const shorter = a.length < b.length ? a : b;
		const longer = a.length < b.length ? b : a;
		if (longer.startsWith(shorter.slice(0, Math.ceil(shorter.length * 0.6)))) {
			return 'two forms / reduplication';
		}
	}
	return skeletons.includes(consonants(headword))
		? 'phrase containing headword'
		: 'other phrase';
}

/** The shape each issue name files under. */
const SHAPES: Readonly<Record<string, string>> = {
	'final-letter-medial': 'X2 final letter mid-word',
	'leading-mark': 'X1 starts with a vowel/dagesh mark',
	maqaf: 'X5 maqaf fragment',
	'nonfinal-letter-at-end': 'X3 non-final letter at word end',
	'not-NFC': 'X4 not NFC',
	// H4: §4 moves `= Y` into the gloss. Its two rows, A01175 and
	// A01345, were repaired by reviewed patch (#113); the shape stays
	// mapped so a new `= Y` line from upstream is named, not dropped.
	'shape:equals-variant': 'H4 "=" variant pair',
	'shape:multi-word': 'H6 multi-word',
};

/** Shapes headword-design §4 SETTLED, each with the ruling that
 * settled it. They are named rather than merely absent: an unmapped
 * issue used to fall out of the report without a trace, which is the
 * same silence for a shape nobody has looked at and a shape a
 * maintainer decided. `classifyEveryShape` below refuses a third
 * state.
 *
 * **They are still REPORTED, under the ruling that settled them.**
 * §3.1 rule 4 keeps this notation out of a form's `text`, and the
 * committed tree no longer holds any of it, so a row here is a parser
 * bug or a new line from upstream rather than a shape awaiting a
 * decision. Dropping the sections would make such a row fall out of
 * the report as silently as an unmapped shape did. So the ruling goes
 * in the heading and any row that appears stays visible. */
const SETTLED: Readonly<Record<string, { by: string; section: string }>> = {
	'shape:comma-list': {
		by: 'HW-commas — never stored in a headword',
		section: 'H1 homograph list / stray comma',
	},
	'shape:double-space': {
		by: 'HW-h1-sep — a separator defect, patched',
		section: 'H1 homograph list / stray comma',
	},
	'shape:latin-or-digit': {
		by: 'HW-H1-xref — a numeral list is display only',
		section: 'H1 homograph list / stray comma',
	},
	'shape:other-char': {
		by: 'HW-ellipsis — an ellipsis ending is a partial form',
		section: 'H5 ellipsis fragment',
	},
	'shape:paren-optional-letters': {
		by: 'HW-paren — grouping is structure in display',
		section: 'H2 parentheses',
	},
	'shape:paren-unbalanced': {
		by: 'HW-H2-open — flagged paren-group-close-unknown',
		section: 'H2 parentheses',
	},
	'shape:paren-whole': {
		by: 'HW-paren — grouping is structure in display',
		section: 'H2 parentheses',
	},
	'shape:query-mark': {
		by: 'HW-query — the `?` is display only',
		section: 'H3 query mark',
	},
};

/** The section an issue files under. A settled shape KEEPS its
 * section and gains the ruling that settled it, so a reader sees at a
 * glance that the rows are decided rather than open — and so the
 * report does not stop carrying rows that are still on disk. */
function shapeFor(issue: string): string | undefined {
	const settled = SETTLED[issue];
	if (settled !== undefined) {
		return `${settled.section} — settled: ${settled.by}`;
	}
	return SHAPES[issue];
}

/** Every shape `shapeOf` can name is in exactly one of the two
 * tables.
 *
 * Read off `SHAPE_NAMES`, which IS `shapeOf`'s return type — never
 * off a second copy of the list. Against a copy this guard could only
 * fire when a table entry is DELETED, which is the one case it is not
 * needed for: the failure it exists to catch is a branch added to
 * `shapeOf` and forgotten in both tables, and a copy is blind to that
 * exactly as the tables are. */
function classifyEveryShape(): void {
	const missing = SHAPE_NAMES.filter(
		(shape) =>
			shape !== 'lexical' &&
			SHAPES[`shape:${shape}`] === undefined &&
			SETTLED[`shape:${shape}`] === undefined,
	);
	if (missing.length > 0) {
		throw new Error(
			`shape(s) neither reported nor settled: ${missing.join(', ')}`,
		);
	}
}

/** The rids whose headword LINE the current processor put on its
 * review list, so each row can say whether it is already visible.
 *
 * Keyed on the rid, not on a form's text: every headword review kind
 * is a verdict on the whole line (`parseHeadwordLine` in
 * `admin/entry/headwords.ts`), and its row's detail is that line
 * joined with `, ` and followed by the reason. A reviewer reading the
 * row sees every form on it, so every form of a reviewed line has been
 * seen. EVERY headword kind counts: they are one parser's several
 * verdicts on one line, split so the review report can class them
 * apart. Matching a form's text against the detail could never fire —
 * the detail is the line, not a form. */
function flaggedRids(reportRows: readonly ReportRow[]): Set<string> {
	return new Set(
		reportRows
			.filter((row) => isHeadwordReviewKind(row.kind))
			.map((r) => r.rid),
	);
}

/** Which H1 sub-shape a form is. Two or more numerals is a
 * cross-reference pointing at other entries (`\u05D0\u05D5\u05BC\u05E8\u05B0\u05D9\u05B8\u05D4  I, II`, gloss
 * `v. \u05D0\u05D5\u05BC\u05E8\u05B0\u05D9\u05B8\u05D0`); one numeral means the separator in front of
 * it is wrong, either a stray comma or a doubled space. */
function homographListNote(text: string): string {
	const numerals = text.match(ROMAN_NUMERAL) ?? [];
	if (numerals.length > 1) {
		return 'cross-reference to two homographs';
	}
	return text.includes(',') ? 'stray comma' : 'double space';
}

/** What a row's `note` column says: the sub-shape for the shapes that
 * have sub-shapes, and nothing for the rest. */
function noteFor(
	shape: string,
	issue: string,
	text: string,
	headword: string,
): string {
	if (shape.startsWith('H1')) {
		return homographListNote(text);
	}
	if (shape.startsWith('H6')) {
		return multiWordNote(text, headword);
	}
	if (issue.startsWith('shape:paren')) {
		return issue.slice('shape:'.length);
	}
	return '';
}

/** One form in its entry, with the processor's review list alongside. */
interface FormContext {
	entry: Entry;
	flagged: ReadonlySet<string>;
	form: FormObject;
	role: 'alt' | 'headword';
}

/** One form's rows. `role` separates a primary headword from an
 * alternate: the same shape means different things on each. */
function formRows({ entry, flagged, form, role }: FormContext): IssueRow[] {
	const { text } = form;
	const rid = entry.id;
	const isFlagged = flagged.has(rid);
	const rows: IssueRow[] = [];
	for (const issue of issuesOf(text)) {
		const shape = shapeFor(issue);
		if (shape === undefined) {
			continue;
		}
		const note = noteFor(shape, issue, text, entry.headwords[0]?.text ?? '');
		rows.push({
			flagged: isFlagged,
			name: nameOf(entry),
			note,
			rid,
			role,
			shape,
			text,
		});
	}
	// An abbreviation is not a defect, but it is a population: every
	// `׳`-final alternate is a stub print sets for a form it has already
	// spelled out, and the rule has to say what becomes of them.
	if (GERESH.test(text) && !text.includes(' ')) {
		const shape =
			role === 'alt' && text.endsWith('׳')
				? 'X6 abbreviated alt (ends ׳)'
				: 'X7 abbreviation headword (׳/״)';
		rows.push({
			flagged: isFlagged,
			name: nameOf(entry),
			note: '',
			rid,
			role,
			shape,
			text,
		});
	}
	return rows;
}

/** How far on, in entry (rid) order, the next numbered form of the same
 * consonants may stand and still continue a numbered sequence: at most
 * four entries between them.
 *
 * Measured on the committed entries: any window from 3 to 90 clears the
 * same 37 families. 2 clears 35 (it loses `קְבל` IV, three entries past
 * `קְבַל` III, and `שְׁפַל` II); 1 clears 29; from about 100 up distant
 * runs of the abbreviation `שִׁי׳` merge, repeat their numerals, and
 * 36 clear. 5 sits inside the flat stretch, away from both edges. */
const SEQUENCE_WINDOW = 5;

/** A form carrying a Roman numeral, placed in entry order. */
interface NumberedForm {
	disambiguator: number | undefined;
	homograph: number;
	/** The numeral is ours, not print's (ruling 10-06 implied I). It
	 * counts as a numeral like any other; notes say which it is. */
	implied: boolean;
	/** The form's index in its entry's `headwords`; 0 is the primary. */
	index: number;
	/** The entry's position in rid order: what "nearby" is measured in. */
	position: number;
	rid: string;
	/** NFC, so two mark orders of one spelling compare equal. */
	text: string;
}

/** Numbered forms of one consonant skeleton, each within
 * {@link SEQUENCE_WINDOW} entries of the one before. `clean` when it
 * reads as ONE numbered sequence (see {@link numbersOnce}). */
interface NumberedSequence {
	clean: boolean;
	members: NumberedForm[];
}

/** How a numbered form is named in a note: the rid, `/alt` when the
 * form is an alternate. */
function formLabel(form: { index: number; rid: string }): string {
	return form.index === 0 ? form.rid : `${form.rid}/alt`;
}

/** Whether a run's numerals read as one sequence: the distinct numerals
 * run 1..n, and no numeral is given twice unless a superscript tells
 * the two apart (A00014 `אָב II` and A00015 `אָב² II`).
 *
 * The second half is what keeps different words apart. A consonant
 * skeleton often holds two sequences side by side — a Hebrew verb
 * numbered I..III, then a noun numbered I, II — and their numerals
 * together still fill 1..n. Two IIs with no superscript between them
 * are two sequences, which a consonant key cannot separate, so the
 * run is not one. */
function numbersOnce(members: readonly NumberedForm[]): boolean {
	const numbers = [...new Set(members.map((m) => m.homograph))].sort(
		(a, b) => a - b,
	);
	const told = new Set(
		members.map((m) => `${m.homograph}/${m.disambiguator ?? 1}`),
	);
	return numbers.every((n, i) => n === i + 1) && told.size === members.length;
}

/** Every numbered form, grouped into sequences: same consonants (every
 * mark stripped, shin and sin dots too, as an unpointed text writes
 * the word; see {@link consonants}), in entry order, each member
 * within {@link SEQUENCE_WINDOW} entries of the last. Alternates take
 * part: a sequence's I is often an alternate (A01697 `אָכַל` I). An
 * implied I (ruling 10-06 implied I) is a numbered form like any
 * other: it is the I its sequence would otherwise lack. */
function numberedSequences(inOrder: readonly Entry[]): NumberedSequence[] {
	const bySkeleton = new Map<string, NumberedForm[]>();
	for (const [position, entry] of inOrder.entries()) {
		for (const [index, form] of entry.headwords.entries()) {
			if (form.homograph === undefined) {
				continue;
			}
			const text = form.text.normalize('NFC');
			const key = consonants(text);
			bySkeleton.set(key, [
				...(bySkeleton.get(key) ?? []),
				{
					disambiguator: form.disambiguator,
					homograph: form.homograph,
					implied: form.implied === true,
					index,
					position,
					rid: entry.id,
					text,
				},
			]);
		}
	}
	const runs: NumberedForm[][] = [];
	for (const forms of bySkeleton.values()) {
		let run: NumberedForm[] = [];
		for (const form of forms) {
			const last = run.at(-1);
			if (
				last !== undefined &&
				form.position - last.position > SEQUENCE_WINDOW
			) {
				runs.push(run);
				run = [];
			}
			run.push(form);
		}
		runs.push(run);
	}
	return runs.map((members) => ({ clean: numbersOnce(members), members }));
}

/** A form in a spelling family: which entry, which of its headwords,
 * its numeral if it has one, and whether that numeral is implied
 * (ruling 10-06 implied I), which counts as numbered everywhere. */
interface FamilyMember {
	homograph: number | undefined;
	implied: boolean;
	index: number;
	rid: string;
}

/** Every form, grouped by its exact NFC spelling, in rid order. */
function spellingFamilies(
	entries: Map<string, Entry>,
): Map<string, FamilyMember[]> {
	const families = new Map<string, FamilyMember[]>();
	for (const [rid, entry] of entries) {
		for (const [index, form] of entry.headwords.entries()) {
			const key = form.text.normalize('NFC');
			families.set(key, [
				...(families.get(key) ?? []),
				{
					homograph: form.homograph,
					implied: form.implied === true,
					index,
					rid,
				},
			]);
		}
	}
	return families;
}

/** The numbered forms that sit in a clean sequence, as `rid:index`. */
function cleanlySequenced(sequences: readonly NumberedSequence[]): Set<string> {
	return new Set(
		sequences
			.filter((s) => s.clean)
			.flatMap((s) => s.members.map((m) => `${m.rid}:${m.index}`)),
	);
}

/** One form placed in entry order, numbered or not: what the implied-I
 * check walks to find the form standing just before a II. */
interface PlacedForm {
	homograph: number | undefined;
	index: number;
	/** Whether any form of the same entry carries a numeral: print set
	 * one on that line, on another form (HW-roman). */
	lineNumbered: boolean;
	position: number;
	rid: string;
	/** NFC. */
	text: string;
}

/** Every form, numbered or not, grouped by its consonants (see
 * {@link consonants}), each group in entry order and, inside one
 * entry, in headword order. */
function formsByConsonants(
	inOrder: readonly Entry[],
): Map<string, PlacedForm[]> {
	const byKey = new Map<string, PlacedForm[]>();
	for (const [position, entry] of inOrder.entries()) {
		const lineNumbered = entry.headwords.some((f) => f.homograph !== undefined);
		for (const [index, form] of entry.headwords.entries()) {
			const text = form.text.normalize('NFC');
			const key = consonants(text);
			byKey.set(key, [
				...(byKey.get(key) ?? []),
				{
					homograph: form.homograph,
					index,
					lineNumbered,
					position,
					rid: entry.id,
					text,
				},
			]);
		}
	}
	return byKey;
}

/** The form that would take an implied I for a family whose ONLY
 * missing numeral is I (ruling 10-06 implied I), or `undefined`.
 *
 * It is the form with the family's consonants standing immediately
 * before the family's II, as the 10-05 sequence orders them: in an
 * earlier entry, at most {@link SEQUENCE_WINDOW} entries back, with no
 * numeral of its own and none anywhere on its line. Anything else
 * leaves the family an X8 gap, because no single form is the obvious
 * I: a numbered form in between (A03215 `אָרַע`, then A03216 `אֲרַע`
 * I, then A03217 `אָרַע` II), no unnumbered neighbour at all, one too
 * far back, or a line that already carries a numeral on another form
 * (M02161, whose I stands on its abbreviation `מַעֲצַ׳`: print numbers
 * that line, and HW-roman keeps the numeral where it stands). */
function impliedCandidate(
	text: string,
	members: readonly FamilyMember[],
	missing: readonly number[],
	byConsonants: ReadonlyMap<string, readonly PlacedForm[]>,
): PlacedForm | undefined {
	const second = members.find((m) => m.homograph === 2);
	if (missing.length !== 1 || missing[0] !== 1 || second === undefined) {
		return;
	}
	const placed = byConsonants.get(consonants(text)) ?? [];
	const at = placed.findIndex(
		(f) => f.rid === second.rid && f.index === second.index,
	);
	const ii = placed[at];
	const before = placed[at - 1];
	if (ii === undefined || before === undefined) {
		return;
	}
	const gap = ii.position - before.position;
	const bare = before.homograph === undefined && !before.lineNumbered;
	return bare && gap > 0 && gap <= SEQUENCE_WINDOW ? before : undefined;
}

/** A family member as a note names it: label, then its numeral, `—`
 * when it has none, marked when the numeral is implied. */
function describeMember(m: FamilyMember): string {
	const numeral = m.homograph === undefined ? '—' : String(m.homograph);
	return `${formLabel(m)}=${numeral}${m.implied ? ' (implied)' : ''}`;
}

/** What {@link homographGapRows} needs besides the entries: the
 * sequences, and every form by consonants for the implied-I check. */
interface GapContext {
	byConsonants: ReadonlyMap<string, readonly PlacedForm[]>;
	entries: Map<string, Entry>;
	sequences: readonly NumberedSequence[];
}

/** The X8 shape. */
const GAP_SHAPE = 'X8 homograph numbering gap';
/** The X10 shape (ruling 10-06 implied I): a gap whose missing I has an
 * obvious holder. Named in the file's style beside X8 and X9. */
const IMPLIED_SHAPE = 'X10 first homograph unnumbered: implied I candidate';

/** One family's numbers, distinct and ascending, and the numerals
 * 1..highest it lacks. DISTINCT: a family can hold two entries
 * numbered II (A00014, A00015), told apart by their superscript
 * disambiguator, and counting the repeat would report every such
 * family as a gap. */
function numbering(members: readonly FamilyMember[]): {
	missing: number[];
	numbers: number[];
} {
	const numbers = [
		...new Set(
			members
				.map((m) => m.homograph)
				.filter((n): n is number => n !== undefined),
		),
	].sort((a, b) => a - b);
	const highest = numbers.at(-1) ?? 0;
	const missing = Array.from({ length: highest }, (_, i) => i + 1).filter(
		(n) => !numbers.includes(n),
	);
	return { missing, numbers };
}

/** Homograph families whose numerals do not run 1..n.
 *
 * A family is keyed on the **exact NFC spelling**, and alternates
 * count. This is the fourth version, and the first two were each wrong
 * in a way the other fixed:
 *
 * 1. **Consonants alone**, headwords only: 202 families. `קַרְחָא` II,
 *    `קָרָחָא` II and `קָרְחָא` II merged into one family that read as
 *    three clashing IIs, when they are three different words each
 *    numbered in its own right; and ignoring alternates reported 119
 *    families whose missing numeral sits on an alternate form.
 * 2. **Exact spelling**, alternates in: 178 families (177 when it
 *    was replaced, 136 of them on a primary). It split one
 *    sequence wherever its members are pointed apart: `אֱגוֹרָא` I
 *    (A00278) is Aramaic and `אֲגוֹרָא` II (A00279) a Greek loan, and
 *    Jastrow numbers homographs as they stand in unpointed texts, so
 *    II is not missing its I. The vowels are editorial; exact pointing
 *    is the wrong key.
 * 3. **Exact spelling, unless the family is part of a numbered
 *    sequence** (`decisions.md`, 10-05 homograph sequence): a family is
 *    NOT a gap when every numbered member of it sits in a clean
 *    {@link NumberedSequence}. That clears 37 families (32 primary)
 *    and leaves 140. It keeps the three `קרחא` IIs apart (S01975 stays
 *    a gap), because their run repeats II with no superscript; and it
 *    keeps B00561's
 *    `בִּזָּא` II a gap: `בְּזָא` I, II (B00435, B00436) share its
 *    consonants, but stand 125 entries back and already hold a II.
 * 4. **The implied I** (`decisions.md`, 10-06 implied I): a gap whose
 *    ONLY missing numeral is I, where an unnumbered form with the same
 *    consonants stands immediately before the II in the 10-05 order
 *    ({@link impliedCandidate}), is no longer X8. It is reported as
 *    X10, and the note names the form that would take `homograph: 1,
 *    implied: true` if print sets no numeral beside it (or a plain
 *    `homograph: 1` if it does). A reviewed patch settles each one;
 *    once it has, the family runs 1..n and the row is gone. An implied
 *    numeral counts as a numeral here and everywhere else this file
 *    counts them.
 *
 * The families 3 clears are not dropped: their pointing is its own
 * question, reported by {@link pointingRows}. It cannot see a numeral
 * Sefaria dropped from an entry with no numbered sibling at all, and a
 * dropped numeral inside a sequence can make the rest look whole
 * (U01774 `שְׁפַל` II pairs with U01771 `שָׁפֵל` I, while print numbers
 * U01772 `שְׁפַל` I).
 *
 * A row is a question, never a verdict: the note says which numerals
 * are missing and how many unnumbered siblings could be carrying them,
 * so the print can settle it. */
function homographGapRows({
	byConsonants,
	entries,
	sequences,
}: GapContext): IssueRow[] {
	const inCleanSequence = cleanlySequenced(sequences);
	const rows: IssueRow[] = [];
	for (const [text, family] of spellingFamilies(entries)) {
		const members = [...family].sort((a, b) =>
			formLabel(a).localeCompare(formLabel(b)),
		);
		const { missing, numbers } = numbering(members);
		const first = members.find((m) => m.homograph !== undefined);
		const sequenced = members
			.filter((m) => m.homograph !== undefined)
			.every((m) => inCleanSequence.has(`${m.rid}:${m.index}`));
		const entry = first === undefined ? undefined : entries.get(first.rid);
		if (
			numbers.length === 0 ||
			missing.length === 0 ||
			first === undefined ||
			entry === undefined ||
			sequenced
		) {
			continue;
		}
		const unnumbered = members.filter((m) => m.homograph === undefined).length;
		const detail = `${unnumbered} unnumbered: ${members.map(describeMember).join('; ')}`;
		const candidate = impliedCandidate(text, members, missing, byConsonants);
		rows.push({
			flagged: false,
			name: nameOf(entry),
			note:
				candidate === undefined
					? `missing ${missing.join(',')}; ${detail}`
					: `${formLabel(candidate)} ${candidate.text} stands just before the II: it takes homograph: 1, implied: true if print sets no numeral beside it (homograph: 1 if print sets I); ${detail}`,
			rid: first.rid,
			// The family is keyed on the ALTERNATE's spelling when its
			// first numbered member is an alternate, so the row must name
			// that form, not the entry's primary headword.
			role: first.index === 0 ? 'headword' : 'alt',
			shape: candidate === undefined ? GAP_SHAPE : IMPLIED_SHAPE,
			text,
		});
	}
	return rows;
}

/** What each Hebrew point is called in a note. Escapes, not literals
 * (see {@link MARKS}). A mark not listed (a cantillation accent) is
 * named by its code point. */
const MARK_NAMES: ReadonlyMap<string, string> = new Map([
	['\u05B0', 'sheva'],
	['\u05B1', 'hataf segol'],
	['\u05B2', 'hataf patah'],
	['\u05B3', 'hataf qamats'],
	['\u05B4', 'hiriq'],
	['\u05B5', 'tsere'],
	['\u05B6', 'segol'],
	['\u05B7', 'patah'],
	['\u05B8', 'qamats'],
	['\u05B9', 'holam'],
	['\u05BA', 'holam for vav'],
	['\u05BB', 'qubuts'],
	['\u05BC', 'dagesh'],
	['\u05BD', 'meteg'],
	['\u05BE', 'maqaf'],
	['\u05BF', 'rafe'],
	['\u05C1', 'shin dot'],
	['\u05C2', 'sin dot'],
	['\u05C4', 'upper dot'],
	['\u05C5', 'lower dot'],
	['\u05C7', 'qamats qatan'],
	[DOT_ABOVE, 'dot above'],
]);

/** One mark, by name. */
function markName(mark: string): string {
	const codePoint = mark.codePointAt(0) ?? 0;
	return (
		MARK_NAMES.get(mark) ??
		`U+${codePoint.toString(16).toUpperCase().padStart(4, '0')}`
	);
}

/** A form split into its letters, each with the marks it carries, in
 * NFD order. Entry 0 holds any mark standing before the first letter
 * (X1's shape), so letter `n` is at index `n`. */
function marksByLetter(
	text: string,
): Array<{ letter: string; marks: string[] }> {
	const letters: Array<{ letter: string; marks: string[] }> = [
		{ letter: '', marks: [] },
	];
	for (const ch of text.normalize('NFD')) {
		if (ch.replace(MARKS, '') === '') {
			letters.at(-1)?.marks.push(ch);
		} else {
			letters.push({ letter: ch, marks: [] });
		}
	}
	return letters;
}

/** How two spellings of one consonant skeleton are pointed apart, in
 * words, and which of two kinds that is.
 *
 * - **mark missing**: one spelling's marks are a subset of the other's,
 *   letter by letter (`אִילפָא` / `אִילְפָא`). Likely a slip in one stored
 *   headword.
 * - **vowels differ**: a mark is replaced, not just absent (`אָכַל` /
 *   `אֲכַל`). Likely deliberate, Hebrew beside Aramaic or a loan word,
 *   though not always (A01964 `אְמָא`, a sheva under alef).
 *
 * Neither kind says which spelling is right, and nothing here infers
 * a vowel: the print decides. Marks are compared as counts, so a
 * doubled mark is one the other spelling lacks; two spellings with the
 * same marks in another order (accents of one combining class, which
 * NFC does not reorder) are said to be so. */
function pointingDifference(a: string, b: string): string {
	const left = marksByLetter(a);
	const right = marksByLetter(b);
	// Counted, not a set: a doubled mark is a mark the other lacks.
	const count = (marks: string[], m: string): number =>
		marks.filter((x) => x === m).length;
	const within = (xs: string[], ys: string[]): boolean =>
		xs.every((x) => count(xs, x) <= count(ys, x));
	const differing = left.flatMap((l, i) => {
		const r = right[i]?.marks ?? [];
		return within(l.marks, r) && within(r, l.marks)
			? []
			: [{ letter: l.letter, n: i, left: l.marks, right: r }];
	});
	// Two accents of one combining class keep their typed order under
	// NFC, so two spellings can differ in order alone.
	if (differing.length === 0) {
		return 'marks in another order: the same marks on every letter';
	}
	const subset =
		differing.every((d) => within(d.left, d.right)) ||
		differing.every((d) => within(d.right, d.left));
	const names = (marks: string[]): string =>
		marks.length === 0 ? 'no mark' : marks.map(markName).join(' and ');
	const detail = differing
		.map((d) => {
			const where =
				d.n === 0 ? 'before the first letter' : `${d.letter} (letter ${d.n})`;
			return `${where} ${names(d.left)} vs ${names(d.right)}`;
		})
		.join(', ');
	return `${subset ? 'mark missing' : 'vowels differ'}: ${detail}`;
}

/** A numbered form as a note names it: label, numeral, superscript,
 * spelling, and `(implied)` when the numeral is ours (ruling 10-06
 * implied I). */
function describeNumbered(form: NumberedForm): string {
	const sup =
		form.disambiguator === undefined ? '' : intToSup(form.disambiguator);
	const implied = form.implied ? ' (implied)' : '';
	return `${formLabel(form)}=${form.homograph}${sup}${implied} ${form.text}`;
}

/** The unnumbered forms spelled like either of `a` and `b`, in the
 * entries from `a`'s to `b`'s. One may be the numeral's true holder,
 * dropped by Sefaria (U01772), or a `ch. same` line print leaves
 * unnumbered (I00615): only the print tells. */
function unnumberedBetween(
	inOrder: readonly Entry[],
	a: NumberedForm,
	b: NumberedForm,
): string[] {
	return inOrder.slice(a.position, b.position + 1).flatMap((entry) =>
		entry.headwords.flatMap((form, index) => {
			const text = form.text.normalize('NFC');
			return form.homograph === undefined &&
				(text === a.text || text === b.text)
				? [`${formLabel({ index, rid: entry.id })} ${text}`]
				: [];
		}),
	);
}

/** The places a sequence changes spelling, as `[before, after]`, each
 * pair of spellings once however often the sequence alternates
 * between them (P00476-P00478). */
function spellingChanges(
	members: readonly NumberedForm[],
): Array<[NumberedForm, NumberedForm]> {
	const seen = new Set<string>();
	const changes: Array<[NumberedForm, NumberedForm]> = [];
	for (const [i, b] of members.entries()) {
		const a = members[i - 1];
		if (a === undefined || a.text === b.text) {
			continue;
		}
		const pair = [a.text, b.text].sort((x, y) => x.localeCompare(y)).join('|');
		if (!seen.has(pair)) {
			seen.add(pair);
			changes.push([a, b]);
		}
	}
	return changes;
}

/** An X9 row's note: how `a` and `b` are pointed apart, the whole
 * sequence they sit in, and any unnumbered form spelled like either
 * between them. */
function pointingNote(
	inOrder: readonly Entry[],
	members: readonly NumberedForm[],
	a: NumberedForm,
	b: NumberedForm,
): string {
	const unnumbered = unnumberedBetween(inOrder, a, b);
	return [
		`${pointingDifference(a.text, b.text)} (${formLabel(a)} vs ${formLabel(b)})`,
		`sequence ${members.map(describeNumbered).join(', ')}`,
		...(unnumbered.length === 0
			? []
			: [`unnumbered between them: ${unnumbered.join(', ')}`]),
	].join('; ');
}

/** Numbered sequences whose members are pointed differently: one row
 * for each place a sequence changes spelling, on the form after the
 * change (a sequence that changes twice, `קָבַל` I, II, `קְבַל` III,
 * `קְבל` IV, gives two rows, one of each kind).
 *
 * These are the families {@link homographGapRows} no longer reports,
 * and they are a question of their own: a mark missing on
 * `headwords[0]` changes the entry's URL name when it is fixed. */
function pointingRows(
	entries: Map<string, Entry>,
	inOrder: readonly Entry[],
	sequences: readonly NumberedSequence[],
): IssueRow[] {
	const rows: IssueRow[] = [];
	for (const { members } of sequences.filter((s) => s.clean)) {
		for (const [a, b] of spellingChanges(members)) {
			const entry = entries.get(b.rid);
			if (entry === undefined) {
				continue;
			}
			rows.push({
				flagged: false,
				name: nameOf(entry),
				note: pointingNote(inOrder, members, a, b),
				rid: b.rid,
				role: b.index === 0 ? 'headword' : 'alt',
				shape: 'X9 pointing differs within a numbered sequence',
				text: b.text,
			});
		}
	}
	return rows;
}

/** A value made safe for one Markdown table cell: a `|` would split the
 * row into extra columns and a line break would end it. */
function cell(value: string): string {
	return value.replaceAll('|', String.raw`\|`).replaceAll(/\r?\n/gu, ' ');
}

/** One line of the summary table: a label and its rows' counts. */
function countLine(label: string, group: readonly IssueRow[]): string {
	const mainForms = group.filter((r) => r.role === 'headword').length;
	const alt = group.filter((r) => r.role === 'alt').length;
	const flagged = group.filter((r) => r.flagged).length;
	return `| ${label} | ${group.length} | ${mainForms} | ${alt} | ${flagged} |`;
}

/** The heading of the reviewed-kept section, and its summary label. */
const KEPT_SECTION = 'Reviewed, kept';
/** The heading of the stale-records section, and its summary label. */
const STALE_SECTION = 'Reviewed, kept: stale records';

/** The two sections the reviewed-kept list adds (ruling 10-06
 * reviewed kept): the rows it keeps, each with the record's reason,
 * and the records no row matched. Both are printed even when empty, so
 * a section that found nothing reads differently from one that never
 * ran. */
function renderKept(split: KeptSplit<IssueRow>): string[] {
	const kept = [...split.kept].sort(
		(a, b) =>
			a.row.shape.localeCompare(b.row.shape) ||
			a.row.rid.localeCompare(b.row.rid),
	);
	const lines = [
		'',
		`## ${KEPT_SECTION} (${kept.length})`,
		'',
		`Rows read against the print and found right as stored, from \`${REVIEWED_KEPT_PATH}\` (decisions 10-06 reviewed kept). They are out of their shape's count, not out of the report: a wrong record is still a row here.`,
		'',
		'| rid | role | shape | text | name | note | reason | flagged |',
		'|---|---|---|---|---|---|---|---|',
	];
	for (const { record, row } of kept) {
		lines.push(
			`| [${row.rid}](${APP_URL}${row.rid}) | ${row.role} | ${cell(row.shape)} | ${cell(row.text)} | ${cell(row.name)} | ${cell(row.note)} | ${cell(record.reason)} | ${row.flagged ? 'yes' : ''} |`,
		);
	}
	lines.push(
		'',
		`## ${STALE_SECTION} (${split.stale.length})`,
		'',
		'Records no row matches on shape, rid and text: the stored text or the shape changed since the read. Each needs a person again.',
		'',
	);
	if (split.stale.length === 0) {
		lines.push('None.');
		return lines;
	}
	lines.push('| rid | shape | text | reason |', '|---|---|---|---|');
	for (const record of split.stale) {
		lines.push(
			`| [${record.rid}](${APP_URL}${record.rid}) | ${cell(record.shape)} | ${cell(record.text)} | ${cell(record.reason)} |`,
		);
	}
	return lines;
}

/** The generated document: a count table, then one section per shape
 * with every row it still asks about, each rid linked to the live app,
 * then the reviewed-kept rows and any stale records
 * ({@link renderKept}). */
function render(split: KeptSplit<IssueRow>): string {
	const byShape = new Map<string, IssueRow[]>();
	for (const row of split.open) {
		byShape.set(row.shape, [...(byShape.get(row.shape) ?? []), row]);
	}
	const shapes = [...byShape.keys()].sort((a, b) => a.localeCompare(b));
	// Computed, not pasted: HEADWORD_ISSUES_DOC and DESIGN_PATH live in
	// different directories (docs/reports/ and admin/pipeline/), so a
	// hardcoded same-directory link would break the moment either one
	// moves independently.
	const designLink = relative(dirname(HEADWORD_ISSUES_DOC), DESIGN_PATH);
	const lines = [
		'# Headword issues — every row by shape',
		'',
		"Generated by `bun data:import` from the run's report rows and its",
		'finished entries. The headword shape these rows are judged against,',
		`and the rules behind each one, are in [DESIGN.md](${designLink}) §2.`,
		'',
		'| Shape | Rows | Main | Alt | Flagged by the processor |',
		'|---|---|---|---|---|',
		...shapes.map((shape) => countLine(shape, byShape.get(shape) ?? [])),
		countLine(
			KEPT_SECTION,
			split.kept.map((k) => k.row),
		),
		`| ${STALE_SECTION} | ${split.stale.length} | | | |`,
	];
	for (const shape of shapes) {
		const group = [...(byShape.get(shape) ?? [])].sort(
			(a, b) => a.note.localeCompare(b.note) || a.rid.localeCompare(b.rid),
		);
		lines.push(
			'',
			`## ${shape} (${group.length})`,
			'',
			'| rid | role | text | name | note | flagged |',
			'|---|---|---|---|---|---|',
		);
		for (const row of group) {
			lines.push(
				`| [${row.rid}](${APP_URL}${row.rid}) | ${row.role} | ${cell(row.text)} | ${cell(row.name)} | ${cell(row.note)} | ${row.flagged ? 'yes' : ''} |`,
			);
		}
	}
	lines.push(...renderKept(split));
	return `${lines.join('\n')}\n`;
}

/** The same rows as CSV, for sorting and filtering. Every row is here,
 * kept or not; `reviewed_kept` carries the keeping record's reason and
 * is empty for a row the list does not keep. */
function renderCsv(split: KeptSplit<IssueRow>): string {
	const quote = (value: string): string => `"${value.replaceAll('"', '""')}"`;
	const reasons = new Map(split.kept.map((k) => [k.row, k.record.reason]));
	const lines = [
		'shape,rid,role,text,name,note,processor_flagged,reviewed_kept',
	];
	const rows = [...split.open, ...split.kept.map((k) => k.row)].toSorted(
		(a, b) => a.shape.localeCompare(b.shape) || a.rid.localeCompare(b.rid),
	);
	for (const row of rows) {
		lines.push(
			[
				row.shape,
				row.rid,
				row.role,
				row.text,
				row.name,
				row.note,
				String(row.flagged),
				reasons.get(row) ?? '',
			]
				.map(quote)
				.join(','),
		);
	}
	return `${lines.join('\n')}\n`;
}

/** The two rendered documents and the counts `import.ts` prints:
 * every row, the shapes, how many rows the reviewed-kept list keeps,
 * and how many of its records matched no row. */
interface HeadwordIssues {
	csv: string;
	doc: string;
	kept: number;
	rows: number;
	shapes: number;
	stale: number;
}

/** Every issue row over the run's finished entries, rendered. Pure:
 * the caller owns the write, so a dry run and `--write` produce the
 * same documents from the same in-memory state. `kept` is the
 * reviewed-kept list (`reviewed-kept.ts`), read by the caller; a row
 * it matches moves to its own section, and nothing leaves the report. */
function buildHeadwordIssues(
	finished: readonly Entry[],
	reportRows: readonly ReportRow[],
	kept: readonly KeptRecord[] = [],
): HeadwordIssues {
	classifyEveryShape();
	const flagged = flaggedRids(reportRows);
	const inRidOrder = [...finished].sort((a, b) => a.id.localeCompare(b.id));
	const entries = new Map(inRidOrder.map((entry) => [entry.id, entry]));
	const rows: IssueRow[] = [];
	for (const entry of inRidOrder) {
		for (const [i, form] of entry.headwords.entries()) {
			rows.push(
				...formRows({
					entry,
					flagged,
					form,
					role: i === 0 ? 'headword' : 'alt',
				}),
			);
		}
	}
	const sequences = numberedSequences(inRidOrder);
	rows.push(
		...homographGapRows({
			byConsonants: formsByConsonants(inRidOrder),
			entries,
			sequences,
		}),
		...pointingRows(entries, inRidOrder, sequences),
	);
	const split = splitKept(rows, kept);
	return {
		csv: renderCsv(split),
		doc: render(split),
		kept: split.kept.length,
		rows: rows.length,
		shapes: new Set(rows.map((r) => r.shape)).size,
		stale: split.stale.length,
	};
}

export type { HeadwordIssues };
export { buildHeadwordIssues };
