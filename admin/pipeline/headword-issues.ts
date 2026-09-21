/**
 * Headword issue report — every headword and alternate-headword shape
 * that a perfect-or-halt headword rule would have to rule on, grouped
 * so the shapes can be decided one at a time (`docs/v2/headword-design.md`).
 *
 * Two inputs, deliberately:
 *
 * - `data/source/migration-report.json`, for what the CURRENT processor
 *   already flags (`headword-unparsed`, `slug-unsafe`). Run
 *   `bun data:import` first if it is stale.
 * - `data/entries/`, walked independently. The processor's review list
 *   is not the defect list: a form can round-trip through the grammar
 *   and still be wrong (a lost letter, a Sefaria split, a slug whose
 *   number contradicts the printed numeral), and those rows exist only
 *   because this file looks for them.
 *
 * Writes `docs/v2/headword-issues.md` (read by eye, one section per
 * shape, every rid linked to the live app) and
 * `docs/v2/headword-issues.csv` (the same rows, for sorting).
 *
 * Run: bun run headword:issues
 */
import type { FormObject, TruthEntry } from './migrate/types.ts';

const ENTRIES_DIR = 'data/entries';
const REPORT_PATH = 'data/source/migration-report.json';
const DOC_PATH = 'docs/v2/headword-issues.md';
const CSV_PATH = 'docs/v2/headword-issues.csv';
const DESIGN_PATH = 'docs/v2/headword-design.md';
const APP_URL = 'https://jastrow.app/#rid:';

// Escapes, never pasted literals: a combining mark typed into a class
// attaches to its neighbour and the range silently widens. U+0307, the
// combining dot above, is its own alternative because biome's
// noMisleadingCharacterClass rejects a mark escape beside a base
// escape in one class (see `migrate/headword.ts`).
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
const UNPARSED_DETAIL = /^(?<form>.*) — (?<reason>.*)$/u;
const UNSAFE_SLUG_CHAR = /[^\u05D0-\u05EA0-9-]/gu;
/** Final letters and the plain forms they answer to, in one order so a
 * `ך` mid-word and a `כ` word-finally are both recognisable. */
const FINAL_LETTERS = '\u05DA\u05DD\u05DF\u05E3\u05E5';
const NON_FINAL_LETTERS = '\u05DB\u05DE\u05E0\u05E4\u05E6';

interface ReportRow {
	detail: string;
	kind: string;
	rid: string;
}

interface MigrationReport {
	rows: ReportRow[];
}

/** One row of the issue report: a shape, the form it was seen on, and
 * whether the current processor already flags it. */
interface IssueRow {
	flagged: boolean;
	note: string;
	rid: string;
	role: 'alt' | 'headword' | 'slug';
	shape: string;
	slug: string;
	text: string;
}

/** A form's consonants: points, accents and the combining dot removed,
 * so two spellings of one word compare equal. */
function consonants(text: string): string {
	return text.normalize('NFD').replace(MARKS, '');
}

/** The shape a form's TEXT is in, as one name. `lexical` is the only
 * clean answer; every other value is a decision waiting to be taken. */
function shapeOf(text: string): string {
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
		const open = [...text].filter((c) => c === '(').length;
		const close = [...text].filter((c) => c === ')').length;
		if (open !== close) {
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
		if ([...word.slice(0, -1)].some((c) => FINAL_LETTERS.includes(c))) {
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

/** The shape each issue name files under, with the multi-word note
 * carried alongside so one pass can produce both. */
function shapeFor(issue: string): string | undefined {
	const table: Record<string, string> = {
		'final-letter-medial': 'X2 final letter mid-word',
		'leading-mark': 'X1 starts with a vowel/dagesh mark',
		maqaf: 'X5 maqaf fragment',
		'nonfinal-letter-at-end': 'X3 non-final letter at word end',
		'not-NFC': 'X4 not NFC',
		'shape:equals-variant': 'H4 "=" variant pair',
		'shape:latin-or-digit': 'H1 homograph list / stray comma',
		'shape:multi-word': 'H6 multi-word',
		'shape:other-char': 'H5 ellipsis fragment',
		'shape:paren-optional-letters': 'H2 parentheses',
		'shape:paren-unbalanced': 'H2 parentheses',
		'shape:paren-whole': 'H2 parentheses',
		'shape:query-mark': 'H3 query mark',
	};
	return table[issue];
}

/** Read every truth entry, keyed by rid. */
async function loadEntries(): Promise<Map<string, TruthEntry>> {
	const paths = await Array.fromAsync(
		new Bun.Glob('*/*.json').scan(ENTRIES_DIR),
	);
	const entries = new Map<string, TruthEntry>();
	for (const path of paths.sort()) {
		const entry = (await Bun.file(
			`${ENTRIES_DIR}/${path}`,
		).json()) as TruthEntry;
		entries.set(entry.id, entry);
	}
	return entries;
}

/** The `rid`/`text` pairs the current processor put on its headword
 * review list, so each row can say whether it is already visible. */
function flaggedForms(report: MigrationReport): Map<string, Set<string>> {
	const flagged = new Map<string, Set<string>>();
	for (const row of report.rows) {
		if (row.kind !== 'headword-unparsed') {
			continue;
		}
		const marked = UNPARSED_DETAIL.exec(row.detail)?.groups?.['form'];
		if (marked !== undefined) {
			const forms = flagged.get(row.rid) ?? new Set<string>();
			forms.add(marked);
			flagged.set(row.rid, forms);
		}
	}
	return flagged;
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
	entry: TruthEntry;
	flagged: Map<string, Set<string>>;
	form: FormObject;
	role: 'alt' | 'headword';
}

/** One form's rows. `role` separates a primary headword from an
 * alternate: the same shape means different things on each. */
function formRows({ entry, flagged, form, role }: FormContext): IssueRow[] {
	const { text } = form;
	const rid = entry.id;
	const marked = form.reconstructed === true ? `*${text}` : text;
	const seen = flagged.get(rid) ?? new Set<string>();
	const isFlagged = seen.has(text) || seen.has(marked);
	const rows: IssueRow[] = [];
	for (const issue of issuesOf(text)) {
		const shape = shapeFor(issue);
		if (shape === undefined) {
			continue;
		}
		const note = noteFor(shape, issue, text, entry.headword.text);
		rows.push({
			flagged: isFlagged,
			note,
			rid,
			role,
			shape,
			slug: entry.slug,
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
			note: '',
			rid,
			role,
			shape,
			slug: entry.slug,
			text,
		});
	}
	return rows;
}

/** Slug rows: notation that reached the URL — a headword consequence,
 * since the slug is derived from the headword's text.
 *
 * A slug number that differs from the printed homograph numeral is NOT
 * reported. The two count different things: the slug number orders the
 * entries sharing a stem (a prefix entry `\u05D0\u05B7\u05D1\u05BE` takes `\u05D0\u05D1-1`, so
 * `\u05D0\u05B8\u05D1` I becomes `\u05D0\u05D1-2`), while Jastrow's numeral counts homographs
 * of one word. Brian ruled the slug number an opaque identifier
 * (2026-09-20), so the 1,184 rows this once emitted were noise, not
 * defects (`docs/v2/headword-design.md` §4). */
function slugRows(
	entries: Map<string, TruthEntry>,
	unsafe: Set<string>,
): IssueRow[] {
	const rows: IssueRow[] = [];
	const inRidOrder = [...entries.values()].sort((a, b) =>
		a.id.localeCompare(b.id),
	);
	for (const entry of inRidOrder) {
		const rid = entry.id;
		const bad = [...new Set(entry.slug.match(UNSAFE_SLUG_CHAR) ?? [])].sort();
		const apostrophes = bad.every((c) => c === '׳' || c === '״');
		if (bad.length > 0 && !apostrophes) {
			rows.push({
				flagged: unsafe.has(rid),
				note: `chars ${bad.join('')}`,
				rid,
				role: 'slug',
				shape: 'S1 slug carries notation',
				slug: entry.slug,
				text: entry.headword.text,
			});
		}
	}
	return rows;
}

/** Homograph families whose numerals do not run 1..n.
 *
 * Keyed on the **exact NFC spelling**, and alternates count. Both
 * halves were wrong in this file's first version. Keyed on consonants
 * alone, `\u05E7\u05B7\u05E8\u05B0\u05D7\u05B8\u05D0` II, `\u05E7\u05B8\u05E8\u05B8\u05D7\u05B8\u05D0` II and `\u05E7\u05B8\u05E8\u05B0\u05D7\u05B8\u05D0` II merge into
 * one family that reads as three clashing IIs, when they are three
 * different words each numbered in its own right; and ignoring
 * alternates reported 119 families whose missing numeral sits on an
 * alternate form. Consonants + headwords-only gave 202 families, the
 * two fixes give 178.
 *
 * A row is a question, never a verdict: the note says which numerals
 * are missing and how many unnumbered siblings could be carrying them,
 * so the print can settle it. */
function homographGapRows(entries: Map<string, TruthEntry>): IssueRow[] {
	const families = new Map<
		string,
		Array<{ homograph: number | undefined; rid: string }>
	>();
	const add = (
		text: string,
		homograph: number | undefined,
		rid: string,
	): void => {
		const key = text.normalize('NFC');
		families.set(key, [...(families.get(key) ?? []), { homograph, rid }]);
	};
	for (const [rid, entry] of entries) {
		add(entry.headword.text, entry.headword.homograph, rid);
		for (const alt of entry.altHeadwords ?? []) {
			add(alt.text, alt.homograph, `${rid}/alt`);
		}
	}
	const rows: IssueRow[] = [];
	for (const family of families.values()) {
		const members = [...family].sort((a, b) => a.rid.localeCompare(b.rid));
		// DISTINCT numerals: a family can hold two entries numbered II
		// (A00014, A00015), told apart by their superscript
		// disambiguator. Counting the repeat would report every such
		// family as a gap.
		const numbers = [
			...new Set(
				members
					.map((m) => m.homograph)
					.filter((n): n is number => n !== undefined),
			),
		].sort((a, b) => a - b);
		const complete = numbers.every((n, i) => n === i + 1);
		const first = members.find((m) => m.homograph !== undefined);
		if (numbers.length === 0 || complete || first === undefined) {
			continue;
		}
		const entry = entries.get(first.rid.replace('/alt', ''));
		if (entry === undefined) {
			continue;
		}
		const unnumbered = members.filter((m) => m.homograph === undefined).length;
		const highest = numbers.at(-1) ?? 0;
		const missing = Array.from({ length: highest }, (_, i) => i + 1).filter(
			(n) => !numbers.includes(n),
		);
		const detail = members
			.map((m) => `${m.rid}=${m.homograph ?? '—'}`)
			.join('; ');
		rows.push({
			flagged: false,
			note: `missing ${missing.join(',')}; ${unnumbered} unnumbered: ${detail}`,
			rid: first.rid.replace('/alt', ''),
			role: 'headword',
			shape: 'X8 homograph numbering gap',
			slug: entry.slug,
			text: entry.headword.text,
		});
	}
	return rows;
}

/** The generated document: a count table, then one section per shape
 * with every row, each rid linked to the live app. */
function render(rows: IssueRow[]): string {
	const byShape = new Map<string, IssueRow[]>();
	for (const row of rows) {
		byShape.set(row.shape, [...(byShape.get(row.shape) ?? []), row]);
	}
	const shapes = [...byShape.keys()].sort((a, b) => a.localeCompare(b));
	const lines = [
		'# Headword issues — every row by shape',
		'',
		`Generated by \`bun run headword:issues\` from \`${REPORT_PATH}\` and`,
		`\`${ENTRIES_DIR}/\`. The proposed headword design, the decisions taken`,
		'and the open questions live in [headword-design.md](headword-design.md).',
		'',
		'| Shape | Rows | Main | Alt | Flagged by the processor |',
		'|---|---|---|---|---|',
	];
	for (const shape of shapes) {
		const group = byShape.get(shape) ?? [];
		const mainForms = group.filter((r) => r.role === 'headword').length;
		const alt = group.filter((r) => r.role === 'alt').length;
		const flagged = group.filter((r) => r.flagged).length;
		lines.push(
			`| ${shape} | ${group.length} | ${mainForms} | ${alt} | ${flagged} |`,
		);
	}
	for (const shape of shapes) {
		const group = [...(byShape.get(shape) ?? [])].sort(
			(a, b) => a.note.localeCompare(b.note) || a.rid.localeCompare(b.rid),
		);
		lines.push('', `## ${shape} (${group.length})`, '');
		lines.push(
			'| rid | role | text | slug | note | flagged |',
			'|---|---|---|---|---|---|',
		);
		for (const row of group) {
			lines.push(
				`| [${row.rid}](${APP_URL}${row.rid}) | ${row.role} | ${row.text} | ${row.slug} | ${row.note} | ${row.flagged ? 'yes' : ''} |`,
			);
		}
	}
	return `${lines.join('\n')}\n`;
}

/** The same rows as CSV, for sorting and filtering. */
function renderCsv(rows: IssueRow[]): string {
	const quote = (value: string): string => `"${value.replaceAll('"', '""')}"`;
	const lines = ['shape,rid,role,text,slug,note,processor_flagged'];
	for (const row of [...rows].sort(
		(a, b) => a.shape.localeCompare(b.shape) || a.rid.localeCompare(b.rid),
	)) {
		lines.push(
			[
				row.shape,
				row.rid,
				row.role,
				row.text,
				row.slug,
				row.note,
				String(row.flagged),
			]
				.map(quote)
				.join(','),
		);
	}
	return `${lines.join('\n')}\n`;
}

async function main(): Promise<void> {
	const report = (await Bun.file(REPORT_PATH).json()) as MigrationReport;
	const entries = await loadEntries();
	const flagged = flaggedForms(report);
	const unsafe = new Set(
		report.rows.filter((r) => r.kind === 'slug-unsafe').map((r) => r.rid),
	);
	const rows: IssueRow[] = [];
	const inRidOrder = [...entries.values()].sort((a, b) =>
		a.id.localeCompare(b.id),
	);
	for (const entry of inRidOrder) {
		rows.push(
			...formRows({ entry, flagged, form: entry.headword, role: 'headword' }),
		);
		for (const alt of entry.altHeadwords ?? []) {
			rows.push(...formRows({ entry, flagged, form: alt, role: 'alt' }));
		}
	}
	rows.push(...homographGapRows(entries), ...slugRows(entries, unsafe));
	await Bun.write(DOC_PATH, render(rows));
	await Bun.write(CSV_PATH, renderCsv(rows));
	const shapes = new Set(rows.map((r) => r.shape)).size;
	console.log(`${rows.length} rows across ${shapes} shapes`);
	console.log(`written to ${DOC_PATH}, ${CSV_PATH}; design in ${DESIGN_PATH}`);
}

await main();
