/**
 * Maintainer review package (design doc §7 "maintainer sampled review",
 * entry-body-model plan Task 12). Generates docs/v2/body-review/ — one
 * markdown doc per eyes-on decision set (broken sequences, orphan refs,
 * quotes stragglers, label quarantines, unit-segmentation sample, empty
 * binyan forms, italic lettered markers) plus a front-page index — each
 * row carrying an empty Decision column for the maintainer to fill.
 * Deterministic: reads only the census report, the dry-run report, the
 * committed fixtures, and the source JSONL — no timestamps, no
 * randomness — so two runs produce byte-identical files. The generated
 * docs are committed (unlike the gitignored machine reports they read):
 * they are the standing review record. Run: bun body:review
 */
import { letteredRun, type SequenceBreakClass, walkSenses } from './census.ts';
import { buildTrace } from './dry-run.ts';
import { readSourceEntries } from './source.ts';
import type {
	BodyEntry,
	BodySense,
	SourceEntry,
	SourceSense,
} from './types.ts';

const REVIEW_DIR = 'docs/v2/body-review';
const CENSUS_REPORT = 'data/source/body-census-report.json';
const DRYRUN_REPORT = 'data/source/body-dryrun-report.json';
const FIXTURES_DIR = 'admin/pipeline/body/fixtures';
const SAMPLE_STRIDE = 650;
const BINYAN_EXAMPLE_ENTRIES = 10;

interface BrokenSequenceRow {
	class: SequenceBreakClass;
	rid: string;
	seq: number[];
	tail: string;
}

interface CensusReportSlice {
	brokenSequences: BrokenSequenceRow[];
}

interface QuarantineEntry {
	detail: string;
	rid: string;
}

interface DryRunReportSlice {
	grammar: { quarantined: QuarantineEntry[] };
	labels: { quarantined: QuarantineEntry[] };
}

// ---------------------------------------------------------------------
// §5 orphan dispositions (design doc, audited 2026-07-11). Literal,
// reviewed code, like extract.ts's rid lists: the 5 resolved-but-
// unlinked ibid items (with the unlinked in-body ibid text each one
// resolves) and the 3 unexplained eyes-on items. Every other orphan rid
// is a gershayim cross-ref, derived from its refs field below.
// ---------------------------------------------------------------------

const IBID_ORPHANS: Record<string, { item: string; snippet: string }[]> = {
	P00331: [
		{ item: 'Eruvin 88b:1', snippet: 'Ib. 88ᵇ' },
		{ item: 'Eruvin 88b:17', snippet: 'Ib. 88ᵇ' },
		{ item: 'Eruvin 88b:22', snippet: 'Ib. 88ᵇ' },
	],
	P01404: [{ item: 'Targum Jerusalem, Exodus 21:18', snippet: 'ib. XXI, 18' }],
	S01230: [{ item: 'Yoma 85b:14', snippet: 'ib. 85ᵇ' }],
};

const EYES_ON_ORPHANS: Record<string, string> = {
	D00541: 'Yoma 2a',
	M01355: 'Rosh Hashanah 23b',
	Q00890: 'Yoma 2a:3',
};

// ---------------------------------------------------------------------
// Text helpers
// ---------------------------------------------------------------------

const TAGS = /<[^>]+>/gu;
const WS = /\s+/gu;
const REGEX_SPECIALS = /[.*+?^${}()|[\]\\]/gu;
const ITALIC_MARKER = /<i>\s*[a-z]\s*<\/i>\)/u;

const stripTags = (text: string): string => text.replace(TAGS, '');
const collapse = (text: string): string => text.replace(WS, ' ').trim();
const clean = (text: string): string => collapse(stripTags(text));
const cell = (text: string): string => collapse(text).replaceAll('|', '\\|');
const escapeRegExp = (text: string): string =>
	text.replace(REGEX_SPECIALS, '\\$&');

function headOf(text: string, max: number): string {
	return text.length <= max ? text : `${text.slice(0, max)}…`;
}

function tailOf(text: string, max: number): string {
	return text.length <= max ? text : `…${text.slice(-max)}`;
}

/** The entry's whole raw text in print order — the same fragments the
 * gloss-head rejoin reads, plus every sense definition — so excerpt
 * scans see cross-field content (anchors, ibids) wherever it sits. */
function rawEntryText(e: SourceEntry): string {
	const parts = [e.content.morphology, e.language_code, e.language_reference];
	for (const sense of walkSenses(e.content.senses)) {
		parts.push(sense.definition);
	}
	return parts.filter((p): p is string => p !== undefined).join(' ');
}

function mdTable(header: string[], rows: string[][]): string {
	const lines = [
		`| ${header.join(' | ')} |`,
		`| ${header.map(() => '---').join(' | ')} |`,
	];
	for (const row of rows) {
		lines.push(`| ${row.join(' | ')} |`);
	}
	return lines.join('\n');
}

const doc = (lines: string[]): string => `${lines.join('\n')}\n`;

async function readReport<T>(path: string, regen: string): Promise<T> {
	const file = Bun.file(path);
	if (!(await file.exists())) {
		throw new Error(`${path} missing — run \`${regen}\` first`);
	}
	return (await file.json()) as T;
}

async function readJsonl(path: string): Promise<SourceEntry[]> {
	const text = await Bun.file(path).text();
	return text
		.split('\n')
		.filter((line) => line !== '')
		.map((line) => JSON.parse(line) as SourceEntry);
}

// ---------------------------------------------------------------------
// 01 — broken sense-number sequences
// ---------------------------------------------------------------------

/** For every labeled top-level sense: the tag-stripped tail of the text
 * immediately preceding it (where a swallowed or spurious number
 * usually hides), then the label token itself in bold. */
function labelsInContext(e: SourceEntry): string {
	const parts: string[] = [];
	let prev = '(entry start)';
	for (const sense of e.content.senses) {
		if (sense.number !== undefined) {
			parts.push(`${cell(tailOf(clean(prev), 90))} **${cell(sense.number)}**`);
		}
		prev = sense.definition ?? '';
	}
	return parts.join('<br>');
}

const BROKEN_SEQUENCE_HEADER = [
	'Rid',
	'Headword',
	'Observed sequence',
	'Labels in context',
	'Decision',
];

const CLASS_ORDER: SequenceBreakClass[] = [
	'crossref-chop',
	'citation-chop',
	'numbering-gap',
	'unclassified',
];

const CLASS_TITLE: Record<SequenceBreakClass, string> = {
	'citation-chop': 'Citation-chop — phantom sense from a chopped citation',
	'crossref-chop':
		'Crossref-chop — phantom sense from a chopped cross-reference',
	'numbering-gap': 'Numbering-gap — genuinely missing/odd numbering',
	unclassified: 'Unclassified',
};

const CLASS_EXPLANATION: Record<SequenceBreakClass, string[]> = {
	'citation-chop': [
		'the upstream sense segmentation chopped a citation — e.g. `(play on X, Gen.',
		'XLI, 2)` — at its own `N)`, splitting one printed flow into a',
		'fake sense boundary. Proposed disposition: heal at migration by',
		'rejoining into the preceding text.',
	],
	'crossref-chop': [
		'the upstream sense segmentation chopped a parenthesized cross-reference —',
		'e.g. `(v. אוֹר 2)` — at its own `N)`, splitting one printed flow',
		'into a fake sense boundary. Proposed disposition: heal at',
		'migration by rejoining into the preceding text.',
	],
	'numbering-gap': ['Genuinely missing/odd numbering — eyes-on.'],
	unclassified: [
		"Doesn't fit the measured phantom-sense or numbering-gap",
		'patterns — eyes-on.',
	],
};

function brokenSequenceRow(e: SourceEntry, seq: number[]): string[] {
	return [e.rid, cell(e.headword), seq.join(', '), labelsInContext(e), ''];
}

function classSection(
	cls: SequenceBreakClass,
	rows: { entry: SourceEntry; seq: number[] }[],
): string[] {
	if (rows.length === 0) {
		return [];
	}
	return [
		`## ${CLASS_TITLE[cls]} (${rows.length} ${rows.length === 1 ? 'entry' : 'entries'})`,
		'',
		...CLASS_EXPLANATION[cls],
		'',
		mdTable(
			BROKEN_SEQUENCE_HEADER,
			rows.map(({ entry, seq }) => brokenSequenceRow(entry, seq)),
		),
		'',
	];
}

function buildBrokenSequencesDoc(
	entries: SourceEntry[],
	breaksByRid: Map<string, BrokenSequenceRow>,
): string {
	const byClass = new Map<
		SequenceBreakClass,
		{ entry: SourceEntry; seq: number[] }[]
	>(CLASS_ORDER.map((cls) => [cls, []]));
	for (const entry of entries) {
		const row = breaksByRid.get(entry.rid);
		const cls = row?.class ?? 'unclassified';
		byClass.get(cls)?.push({ entry, seq: row?.seq ?? [] });
	}

	const sections = CLASS_ORDER.flatMap((cls) =>
		classSection(cls, byClass.get(cls) ?? []),
	);
	// Drop the blank line the last populated section trails.
	if (sections.at(-1) === '') {
		sections.pop();
	}

	return doc([
		`# 01 — Broken sense-number sequences (${entries.length} entries)`,
		'',
		'**Set:** every entry whose top-level sense-number sequence is not',
		'`1, 2, …, n` (census report `.brokenSequences`; design doc §7 —',
		'"upstream damage (spurious/missing `N)`) — eyes-on"), classified by',
		'what the break looks like (correction pass, verified finding: the 72',
		"aren't one class — see the class sections below).",
		'',
		'**How to read a row:** *Observed sequence* is the leading integer of',
		'each top-level `sense.number` token in encounter order. *Labels in',
		'context* shows, for each labeled sense, the tag-stripped tail of the',
		'text immediately preceding it — where a swallowed or spurious number',
		'usually hides — followed by the label token itself in bold.',
		'',
		'**Decision to record per row:** what migration should do with the',
		"entry's numbering (accept as printed / hand-fix / other).",
		'',
		...sections,
	]);
}

// ---------------------------------------------------------------------
// 02 — orphan refs items
// ---------------------------------------------------------------------

interface OrphanRow {
	context: string;
	headword: string;
	item: string;
	rid: string;
}

interface OrphanGroups {
	eyesOn: OrphanRow[];
	gershayim: OrphanRow[];
	ibid: OrphanRow[];
}

/** The single refs item naming a gershayim-abbreviation headword (a
 * `"` inside a `Jastrow, …` value) — the §5 class-1 orphan for this
 * entry. Undefined when the entry doesn't carry exactly one. */
function gershayimOrphanItem(e: SourceEntry): string | undefined {
	const hits = (e.refs ?? []).filter(
		(ref) => ref.startsWith('Jastrow, ') && ref.includes('"'),
	);
	return hits.length === 1 ? hits[0] : undefined;
}

/** Locate the raw anchor whose data-ref names the orphan item (the
 * gershayim quote breaks the attribute, so the citation detector never
 * resolves it) and show its visible target text in context. */
function anchorContext(e: SourceEntry, item: string): string {
	const text = rawEntryText(e);
	const pattern = new RegExp(
		`<a\\b[^>]*data-ref="${escapeRegExp(item)}"[^>]*>([^<]*)</a>`,
		'u',
	);
	const match = pattern.exec(text);
	if (!match) {
		return '(anchor not located)';
	}
	const before = tailOf(clean(text.slice(0, match.index)), 70);
	const after = headOf(clean(text.slice(match.index + match[0].length)), 40);
	return `${cell(before)} **${cell(match[1] ?? '')}** ${cell(after)}`;
}

/** Show a literal in-body snippet (an unlinked ibid) in context. */
function snippetContext(e: SourceEntry, snippet: string): string {
	const text = rawEntryText(e);
	const index = text.indexOf(snippet);
	if (index < 0) {
		return '(snippet not located)';
	}
	const before = tailOf(clean(text.slice(0, index)), 70);
	const after = headOf(clean(text.slice(index + snippet.length)), 70);
	return `${cell(before)} **${cell(snippet)}** ${cell(after)}`;
}

function classifyOrphan(e: SourceEntry, groups: OrphanGroups): void {
	const ibids = IBID_ORPHANS[e.rid];
	if (ibids !== undefined) {
		for (const { item, snippet } of ibids) {
			groups.ibid.push({
				context: snippetContext(e, snippet),
				headword: e.headword,
				item,
				rid: e.rid,
			});
		}
		return;
	}
	const eye = EYES_ON_ORPHANS[e.rid];
	if (eye !== undefined) {
		groups.eyesOn.push({
			context: cell(headOf(clean(rawEntryText(e)), 140)),
			headword: e.headword,
			item: eye,
			rid: e.rid,
		});
		return;
	}
	const item = gershayimOrphanItem(e);
	groups.gershayim.push({
		context:
			item === undefined
				? '(no unique gershayim ref found — flag)'
				: anchorContext(e, item),
		headword: e.headword,
		item: item ?? '?',
		rid: e.rid,
	});
}

function orphanRows(entries: SourceEntry[]): OrphanGroups {
	const groups: OrphanGroups = { eyesOn: [], gershayim: [], ibid: [] };
	for (const e of entries) {
		classifyOrphan(e, groups);
	}
	return groups;
}

const orphanRow = (row: OrphanRow): string[] => [
	row.rid,
	cell(row.headword),
	cell(row.item),
	row.context,
	'',
];

function buildOrphanRefsDoc(groups: OrphanGroups): string {
	const total =
		groups.eyesOn.length + groups.gershayim.length + groups.ibid.length;
	const header = ['Rid', 'Headword', 'Orphan refs item', 'Context', 'Decision'];
	return doc([
		`# 02 — Orphan refs items (${total} items)`,
		'',
		'**Set:** the `refs`-field items with no inline citation basis (design',
		'doc §5, decision B7 — refs dropped from truth, index derived at',
		'compile). Pre-annotated with the §5 dispositions; the Decision column',
		'records maintainer confirmation (or override) of each.',
		'',
		`## Class 1 — unlinked gershayim cross-refs (${groups.gershayim.length} items)`,
		'',
		'§5 disposition: internal cross-references to gershayim-abbreviation',
		'headwords whose target text sits unlinked in the body — **fixed by',
		'wrapping the text in `<cite ref>`** (hand pass, listed in the',
		'migration report). The source anchors exist, but the gershayim `"`',
		'inside `href`/`data-ref` breaks the attribute, so the link never',
		'resolves. *Context* shows the in-body target text in bold.',
		'',
		mdTable(header, groups.gershayim.map(orphanRow)),
		'',
		`## Class 2 — resolved-but-unlinked ibid citations (${groups.ibid.length} items)`,
		'',
		'§5 disposition: **fixed the same way** (wrap in `<cite ref>`), with',
		'the resolution taken from the old refs value. *Context* shows the',
		'unlinked in-body ibid text in bold; the *Orphan refs item* column is',
		'the resolution the old refs field recorded for it.',
		'',
		mdTable(header, groups.ibid.map(orphanRow)),
		'',
		`## Class 3 — unexplained, eyes-on (${groups.eyesOn.length} items)`,
		'',
		'§5 disposition: **maintainer eyes-on at migration review** — no',
		'in-body basis was found for these at audit. *Context* shows the entry',
		'opening for orientation.',
		'',
		mdTable(header, groups.eyesOn.map(orphanRow)),
	]);
}

// ---------------------------------------------------------------------
// 03 — quotes stragglers
// ---------------------------------------------------------------------

function buildQuotesDoc(entries: SourceEntry[]): string {
	const rows = entries.map((e) => [
		e.rid,
		cell(e.headword),
		`\`${cell(JSON.stringify(e.quotes))}\``,
		cell(headOf(clean(rawEntryText(e)), 360)),
		'',
	]);
	return doc([
		`# 03 — Quotes stragglers (${entries.length} entries)`,
		'',
		'**Set:** the entries whose `quotes` phrases do not locate in their',
		'own body even after abbreviation collapse (design doc §6, decision',
		'B8 — quotes dropped entirely; 316 of 324 phrases provably locate,',
		'these are the remainder).',
		'',
		'**Decision to record per row:** confirm that dropping the `quotes`',
		'field loses nothing of value here — the phrase is corrupt, redundant,',
		'or otherwise not worth preserving — or flag it for hand-carry.',
		'',
		mdTable(
			['Rid', 'Headword', '`quotes` (verbatim)', 'Body opening', 'Decision'],
			rows,
		),
	]);
}

// ---------------------------------------------------------------------
// 04 — label quarantines
// ---------------------------------------------------------------------

/** Depth-first search for the sense carrying the quarantined label,
 * keeping its preceding sibling for context. */
function findLabeledSense(
	list: SourceSense[],
	detail: string,
): { prev: SourceSense | undefined; sense: SourceSense } | null {
	for (const [index, sense] of list.entries()) {
		if (sense.number === detail) {
			return { prev: list[index - 1], sense };
		}
		const nested = sense.senses ? findLabeledSense(sense.senses, detail) : null;
		if (nested) {
			return nested;
		}
	}
	return null;
}

function quarantineContext(e: SourceEntry, detail: string): string {
	const found = findLabeledSense(e.content.senses, detail);
	if (!found) {
		return '(labeled sense not found)';
	}
	const before = tailOf(clean(found.prev?.definition ?? '(entry start)'), 90);
	const after = headOf(clean(found.sense.definition ?? ''), 110);
	return `${cell(before)} **${cell(detail)}** ${cell(after)}`;
}

function buildLabelsDoc(
	quarantined: QuarantineEntry[],
	entryByRid: Map<string, SourceEntry>,
): string {
	const rows = quarantined.map((q) => {
		const e = entryByRid.get(q.rid);
		return [
			q.rid,
			cell(e?.headword ?? '?'),
			`\`${q.detail}\``,
			e === undefined ? '(entry not found)' : quarantineContext(e, q.detail),
			'',
		];
	});
	return doc([
		`# 04 — Sense-label quarantines (${quarantined.length} occurrences)`,
		'',
		'**Set:** the `sense.number` occurrences the dry run quarantined as',
		'unparseable (dry-run report `.labels.quarantined`, Finding 4): `[1)`',
		'(a bracket where a digit belongs — OCR/transcription damage) and',
		'`-2)` (ASCII hyphen-minus standing in for the em dash used everywhere',
		'else for the same continuation marker). Quarantined by design (B6):',
		'coercing them would break byte-exact label regeneration.',
		'',
		'**Decision to record per row:** keep the raw token verbatim in truth,',
		'or hand-correct it at migration (e.g. `-2)` → `—2)`), deliberately',
		'accepting the byte difference from the source for that entry.',
		'',
		mdTable(
			['Rid', 'Headword', 'Raw value', 'Surrounding sense text', 'Decision'],
			rows,
		),
	]);
}

// ---------------------------------------------------------------------
// 05 — unit-segmentation sample
// ---------------------------------------------------------------------

interface SampleRow {
	gloss: string;
	headword: string;
	rid: string;
	units: string[];
}

function sampleBlock(sample: SampleRow): string {
	return [
		`### ${sample.rid} — ${collapse(sample.headword)}`,
		'',
		`**Gloss:** ${clean(sample.gloss)}`,
		'',
		...sample.units.map((unit) => `- ${clean(unit)}`),
		'',
		'**Decision:**',
		'',
	].join('\n');
}

function buildUnitSampleDoc(samples: SampleRow[]): string {
	return doc([
		`# 05 — Unit-segmentation sample (${samples.length} entries)`,
		'',
		'**Set:** a deterministic sample — stepping through the corpus in',
		`strides of ${SAMPLE_STRIDE} and taking, at each stride anchor, the next entry (in`,
		'corpus order) whose intro sense carries at least one citation unit —',
		'so the doc is byte-identical run over run, never random. Each',
		"entry's first (intro) sense is rendered as its gloss line followed by",
		'one bullet per segmented citation unit (markup tags stripped for',
		'readability; citation text kept).',
		'',
		'**Decision to record per entry:** boundaries look right /',
		'under-split (acceptable per B4 — two units render as one) / wrong',
		'split (flag for rule review).',
		'',
		samples.map(sampleBlock).join('\n'),
	]);
}

// ---------------------------------------------------------------------
// 06 — empty binyan forms
// ---------------------------------------------------------------------

interface BinyanExample {
	forms: string[];
	headword: string;
	rid: string;
	stem: string;
}

interface BinyanScan {
	entries: number;
	exampleEntries: number;
	examples: BinyanExample[];
	occurrences: number;
}

function scanBinyan(e: SourceEntry, scan: BinyanScan): void {
	const affected: BinyanExample[] = [];
	let empties = 0;
	for (const sense of e.content.senses) {
		const forms = sense.grammar?.binyan_form ?? [];
		const count = forms.filter((form) => form === '').length;
		if (count === 0) {
			continue;
		}
		empties += count;
		affected.push({
			forms,
			headword: e.headword,
			rid: e.rid,
			stem: sense.grammar?.verbal_stem ?? '',
		});
	}
	if (empties === 0) {
		return;
	}
	scan.entries++;
	scan.occurrences += empties;
	if (scan.exampleEntries < BINYAN_EXAMPLE_ENTRIES) {
		scan.exampleEntries++;
		scan.examples.push(...affected);
	}
}

function buildBinyanDoc(scan: BinyanScan): string {
	const rows = scan.examples.map((example) => [
		example.rid,
		cell(example.headword),
		cell(example.stem),
		`\`${cell(JSON.stringify(example.forms))}\``,
		'',
	]);
	return doc([
		'# 06 — Empty binyan-form strings (dry-run Finding 3)',
		'',
		`**Set:** ${scan.occurrences} empty-string \`binyan_form\` elements across`,
		`${scan.entries} entries violate the entry schema's \`minLength: 1\` on stem`,
		'form strings (dry-run Finding 3 — the schema sample caught 3 of them;',
		'this is the full-corpus recount). The dry-run composition threads',
		'`binyan_form` straight through (`forms: binyan_form ?? []`), so an',
		'empty upstream slot becomes an empty output slot. Upstream-data /',
		'schema mismatch, not a composition bug.',
		'',
		`First ${scan.exampleEntries} affected entries (one row per affected stem;`,
		'`forms` verbatim, including empty strings and leading spaces):',
		'',
		mdTable(
			['Rid', 'Headword', 'Stem', '`forms` (verbatim)', 'Decision'],
			rows,
		),
		'',
		'## Decision (choose one — the two options from docs/v2/body-dryrun.md Finding 3)',
		'',
		'- [ ] **Accept in schema** — relax `minLength: 1` on stem form',
		'  strings; an empty form is arguably meaningful, marking "no',
		'  additional attested form" in that slot.',
		'- [ ] **Drop at migration** — a migration step filters empty strings',
		'  out of `forms`; the schema stays as reviewed (B11).',
		'',
		'**Decision notes:**',
	]);
}

// ---------------------------------------------------------------------
// 07 — italic-wrapped lettered markers
// ---------------------------------------------------------------------

interface ItalicRow {
	excerpt: string;
	headword: string;
	rid: string;
}

function censusDetectsLettered(e: SourceEntry): boolean {
	for (const sense of walkSenses(e.content.senses)) {
		if (letteredRun(sense.definition ?? '')) {
			return true;
		}
	}
	return false;
}

function* walkBodySenses(list: BodySense[]): Generator<BodySense> {
	for (const sense of list) {
		yield sense;
		if (sense.senses) {
			yield* walkBodySenses(sense.senses);
		}
	}
}

function hasStructuralSplit(body: BodyEntry): boolean {
	const lists = [body.senses, ...(body.stems ?? []).map((s) => s.senses)];
	for (const list of lists) {
		for (const sense of walkBodySenses(list)) {
			if (sense.senses !== undefined && sense.senses.length > 0) {
				return true;
			}
		}
	}
	return false;
}

/** The first italic-wrapped marker (`<i>a</i>)`) in the entry, raw, in
 * tag-stripped context — the reason the census detector saw a lettered
 * run that the structural splitter (correctly, per B5/B9) left whole. */
function italicMarkerExcerpt(e: SourceEntry): string {
	for (const sense of walkSenses(e.content.senses)) {
		const definition = sense.definition ?? '';
		const match = ITALIC_MARKER.exec(definition);
		if (match) {
			const before = tailOf(clean(definition.slice(0, match.index)), 70);
			const end = match.index + match[0].length;
			const after = headOf(clean(definition.slice(end)), 70);
			return `${cell(before)} \`${match[0]}\` ${cell(after)}`;
		}
	}
	return '(no `<i>letter</i>)` marker found — flag for eyes-on)';
}

function buildItalicDoc(rows: ItalicRow[]): string {
	return doc([
		`# 07 — Italic-wrapped lettered markers (${rows.length} entries)`,
		'',
		"**Set:** the entries where the census's raw-text detector sees a",
		'lettered `a)…b)` run but `splitLettered` does not split (dry-run',
		'Finding 2 reconciliation): the markers are wrapped in `<i>…</i>`',
		'(`<i>a</i>)`), which the census strips before testing while the',
		'structural splitter deliberately never strips tags — the documented',
		'under-split failure mode (B5/B9) working as designed. Recomputed',
		'here: census-detected entries with no structural split anywhere in',
		'the built body.',
		'',
		'## Decision (choose one, or decide per row)',
		'',
		'- [ ] **Accept under-split** — the markers stay in the gloss as',
		'  running prose (readable, per-entry hand fixes possible later).',
		'- [ ] **Extend the rule** — teach `splitLettered` to recognize',
		'  italic-wrapped markers before migration (future rule work,',
		'  re-fixtured and re-gated).',
		'',
		mdTable(
			['Rid', 'Headword', 'Marker in context', 'Decision'],
			rows.map((row) => [row.rid, cell(row.headword), row.excerpt, '']),
		),
	]);
}

// ---------------------------------------------------------------------
// 00 — index
// ---------------------------------------------------------------------

interface PackageCounts {
	binyanEntries: number;
	binyanOccurrences: number;
	broken: number;
	brokenByClass: Record<SequenceBreakClass, number>;
	grammarQuarantined: number;
	italic: number;
	labels: number;
	orphanEntries: number;
	orphanItems: number;
	quotes: number;
	samples: number;
}

function brokenClassBreakdown(
	counts: Record<SequenceBreakClass, number>,
): string {
	return CLASS_ORDER.map((cls) => `${counts[cls]} ${cls}`).join(' / ');
}

function buildIndexDoc(counts: PackageCounts): string {
	const rows = [
		[
			'[01-broken-sequences.md](01-broken-sequences.md)',
			'Broken sense-number sequences',
			`${counts.broken} entries (${brokenClassBreakdown(counts.brokenByClass)})`,
			'awaiting review',
		],
		[
			'[02-orphan-refs.md](02-orphan-refs.md)',
			'Orphan `refs` items (§5 dispositions pre-annotated)',
			`${counts.orphanItems} items (${counts.orphanEntries} entries)`,
			'awaiting review',
		],
		[
			'[03-quotes-stragglers.md](03-quotes-stragglers.md)',
			'`quotes` phrases that do not locate in their body',
			`${counts.quotes} entries`,
			'awaiting review',
		],
		[
			'[04-label-quarantines.md](04-label-quarantines.md)',
			'Unparseable sense labels',
			`${counts.labels} occurrences`,
			'awaiting review',
		],
		[
			'[05-unit-segmentation-sample.md](05-unit-segmentation-sample.md)',
			'Unit-segmentation spot sample',
			`${counts.samples} entries`,
			'awaiting review',
		],
		[
			'[06-empty-binyan-forms.md](06-empty-binyan-forms.md)',
			'Empty `binyan_form` strings vs. schema `minLength: 1`',
			`${counts.binyanOccurrences} occurrences (${counts.binyanEntries} entries)`,
			'awaiting review',
		],
		[
			'[07-italic-lettered-markers.md](07-italic-lettered-markers.md)',
			'Italic-wrapped lettered markers (census/structural gap)',
			`${counts.italic} entries`,
			'awaiting review',
		],
	];
	return doc([
		'# Body-Model Maintainer Review Package (§6.0)',
		'',
		'The maintainer sampled-review evidence the',
		'[design doc](../../specs/2026-07-11-entry-body-model-design.md) §7',
		'lists among the §6.0 blessing gates, and the standing maintainer',
		'gate for the entry-body-model work: one document per eyes-on',
		'decision set enumerated by the censuses and the',
		'[dry run](../body-dryrun.md). Each row shows the entry, the problem',
		'text in context, and an empty **Decision** column for the maintainer',
		'to fill. Generated by `bun body:review`',
		'(`admin/pipeline/body/review.ts`) from the census report, the',
		'dry-run report, the committed fixtures, and the source snapshot —',
		'deterministic, so re-running regenerates these files byte-for-byte.',
		'',
		mdTable(['Doc', 'Decision set', 'Items', 'Status'], rows),
		'',
		'Grammar-marker quarantines: the dry run measured',
		`**${counts.grammarQuarantined} quarantined** of 13,162 markers — no doc needed (0 items).`,
		'',
		"The review outcome gets recorded in the design doc's changelog",
		'([§9](../../specs/2026-07-11-entry-body-model-design.md#9-changelog)).',
	]);
}

// ---------------------------------------------------------------------
// Corpus scan + assembly
// ---------------------------------------------------------------------

interface CorpusScan {
	binyan: BinyanScan;
	italic: ItalicRow[];
	labelEntries: Map<string, SourceEntry>;
	nextSampleAnchor: number;
	samples: SampleRow[];
}

function createScan(): CorpusScan {
	return {
		binyan: { entries: 0, exampleEntries: 0, examples: [], occurrences: 0 },
		italic: [],
		labelEntries: new Map(),
		nextSampleAnchor: 0,
		samples: [],
	};
}

function scanEntry(
	e: SourceEntry,
	index: number,
	scan: CorpusScan,
	labelRids: Set<string>,
): void {
	if (labelRids.has(e.rid)) {
		scan.labelEntries.set(e.rid, e);
	}
	scanBinyan(e, scan.binyan);
	const { body } = buildTrace(e);
	const intro = body.senses[0];
	if (
		index >= scan.nextSampleAnchor &&
		intro !== undefined &&
		intro.units.length > 0
	) {
		scan.samples.push({
			gloss: intro.gloss,
			headword: e.headword,
			rid: e.rid,
			units: intro.units,
		});
		scan.nextSampleAnchor = index + SAMPLE_STRIDE;
	}
	if (censusDetectsLettered(e) && !hasStructuralSplit(body)) {
		scan.italic.push({
			excerpt: italicMarkerExcerpt(e),
			headword: e.headword,
			rid: e.rid,
		});
	}
}

interface ReviewInputs {
	binyan: BinyanScan;
	breaksByRid: Map<string, BrokenSequenceRow>;
	brokenEntries: SourceEntry[];
	grammarQuarantined: number;
	italic: ItalicRow[];
	labelEntries: Map<string, SourceEntry>;
	orphanEntries: SourceEntry[];
	quarantined: QuarantineEntry[];
	quotesEntries: SourceEntry[];
	samples: SampleRow[];
}

function brokenByClass(
	inputs: ReviewInputs,
): Record<SequenceBreakClass, number> {
	const counts: Record<SequenceBreakClass, number> = {
		'citation-chop': 0,
		'crossref-chop': 0,
		'numbering-gap': 0,
		unclassified: 0,
	};
	for (const e of inputs.brokenEntries) {
		const cls = inputs.breaksByRid.get(e.rid)?.class ?? 'unclassified';
		counts[cls]++;
	}
	return counts;
}

function buildCounts(
	inputs: ReviewInputs,
	orphans: OrphanGroups,
): PackageCounts {
	return {
		binyanEntries: inputs.binyan.entries,
		binyanOccurrences: inputs.binyan.occurrences,
		broken: inputs.brokenEntries.length,
		brokenByClass: brokenByClass(inputs),
		grammarQuarantined: inputs.grammarQuarantined,
		italic: inputs.italic.length,
		labels: inputs.quarantined.length,
		orphanEntries: inputs.orphanEntries.length,
		orphanItems:
			orphans.eyesOn.length + orphans.gershayim.length + orphans.ibid.length,
		quotes: inputs.quotesEntries.length,
		samples: inputs.samples.length,
	};
}

function buildDocs(inputs: ReviewInputs): Record<string, string> {
	const orphans = orphanRows(inputs.orphanEntries);
	const counts = buildCounts(inputs, orphans);
	return {
		'00-INDEX.md': buildIndexDoc(counts),
		'01-broken-sequences.md': buildBrokenSequencesDoc(
			inputs.brokenEntries,
			inputs.breaksByRid,
		),
		'02-orphan-refs.md': buildOrphanRefsDoc(orphans),
		'03-quotes-stragglers.md': buildQuotesDoc(inputs.quotesEntries),
		'04-label-quarantines.md': buildLabelsDoc(
			inputs.quarantined,
			inputs.labelEntries,
		),
		'05-unit-segmentation-sample.md': buildUnitSampleDoc(inputs.samples),
		'06-empty-binyan-forms.md': buildBinyanDoc(inputs.binyan),
		'07-italic-lettered-markers.md': buildItalicDoc(inputs.italic),
	};
}

function printSummary(inputs: ReviewInputs): void {
	console.log(
		`brokenSequences=${inputs.brokenEntries.length} orphanEntries=${inputs.orphanEntries.length} quotes=${inputs.quotesEntries.length} labelQuarantines=${inputs.quarantined.length}`,
	);
	console.log(
		`sample=${inputs.samples.length} italicLettered=${inputs.italic.length} emptyBinyanForms=${inputs.binyan.occurrences} across ${inputs.binyan.entries} entries`,
	);
	if (inputs.grammarQuarantined !== 0) {
		console.log(
			`WARNING: grammar quarantines=${inputs.grammarQuarantined} (expected 0 — index note is stale)`,
		);
	}
	console.log(`review docs written to ${REVIEW_DIR}`);
}

if (import.meta.main) {
	const census = await readReport<CensusReportSlice>(
		CENSUS_REPORT,
		'bun body:census',
	);
	const dryrun = await readReport<DryRunReportSlice>(
		DRYRUN_REPORT,
		'bun body:dry-run',
	);
	const [brokenEntries, orphanEntries, quotesEntries] = await Promise.all([
		readJsonl(`${FIXTURES_DIR}/broken-sequences.jsonl`),
		readJsonl(`${FIXTURES_DIR}/orphans.jsonl`),
		readJsonl(`${FIXTURES_DIR}/quotes-stragglers.jsonl`),
	]);

	const labelRids = new Set(dryrun.labels.quarantined.map((q) => q.rid));
	const scan = createScan();
	let index = 0;
	for await (const e of readSourceEntries()) {
		scanEntry(e, index, scan, labelRids);
		index++;
	}

	const inputs: ReviewInputs = {
		binyan: scan.binyan,
		breaksByRid: new Map(census.brokenSequences.map((b) => [b.rid, b])),
		brokenEntries,
		grammarQuarantined: dryrun.grammar.quarantined.length,
		italic: scan.italic,
		labelEntries: scan.labelEntries,
		orphanEntries,
		quarantined: dryrun.labels.quarantined,
		quotesEntries,
		samples: scan.samples,
	};
	const docs = buildDocs(inputs);
	await Promise.all(
		Object.entries(docs).map(([name, text]) =>
			Bun.write(`${REVIEW_DIR}/${name}`, text),
		),
	);
	printSummary(inputs);
}
