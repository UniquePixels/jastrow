/**
 * Body-model census (design doc §7 / entry-body-model plan Task 3).
 * Measures every value space and edge class the body-model parse
 * rules depend on, so the fixtures and rule vocabularies later tasks
 * build are evidence, not guesses. Read-only; writes the machine
 * report to data/source/body-census-report.json (gitignored — data
 * architecture spec D2, not committed). Run: bun body:census
 */
import { type CitationHit, findCitations } from './cite.ts';
import { MARKERS } from './form-sections.ts';
import { parseLabel } from './labels.ts';
import { readSourceEntries } from './source.ts';
import type { SourceEntry, SourceSense } from './types.ts';

const REPORT_PATH = 'data/source/body-census-report.json';

type Boundary =
	| 'sense-start'
	| 'period'
	| 'dash'
	| 'semicolon'
	| 'comma'
	| 'embedded';

const TAGS = /<[^>]+>/gu;
// Strips to a fixed point so fragments re-composed by one pass
// (`<scr<i>ipt>`-style) can't survive (CodeQL js/incomplete-
// multi-character-sanitization); corpus-verified byte-identical to
// the single-pass version over all 32,512 entries.
const stripTags = (text: string): string => {
	let out = text;
	let prev: string;
	do {
		prev = out;
		out = out.replace(TAGS, '');
	} while (out !== prev);
	return out;
};

/** Classify the (tag-stripped) text immediately before a citation
 * anchor into the punctuation class it ends on. Empty text means the
 * anchor opens its sense outright. */
function classifyBoundary(before: string): Boundary {
	const t = stripTags(before).trimEnd();
	if (t === '') {
		return 'sense-start';
	}
	if (t.endsWith('—')) {
		return 'dash';
	}
	if (t.endsWith('.')) {
		return 'period';
	}
	if (t.endsWith(';')) {
		return 'semicolon';
	}
	if (t.endsWith(',')) {
		return 'comma';
	}
	return 'embedded';
}

const SENSE_NUMBER = /(?<digits>\d+)/u;

/** Pull the leading integer out of each sense-number token ("—3)" → 3)
 * in encounter order, dropping any token with none. A clean sequence
 * is `[1, 2, ..., n]`; anything else is a broken sequence. */
function labelSequence(numbers: string[]): number[] {
	return numbers
		.map((n) => SENSE_NUMBER.exec(n)?.groups?.['digits'])
		.filter((n): n is string => n !== undefined)
		.map(Number);
}

type SequenceBreakClass =
	| 'crossref-chop'
	| 'citation-chop'
	| 'numbering-gap'
	| 'unclassified';

interface SequenceBreak {
	class: SequenceBreakClass;
	tail: string;
}

/** The entry-level fields a phantom-sense check reads when the bare
 * number's preceding sense is `senses[0]` (or the bare number's sense
 * is itself `senses[0]`, with nothing before it at all) — the gloss head a
 * chopped cross-reference paren often opens in. */
interface OriginFields {
	languageCode?: string;
	languageReference?: string;
	morphology?: string;
}

const PAREN_OPEN = /\(/gu;
const PAREN_CLOSE = /\)/gu;

/** True when text has more '(' than ')' — an unclosed paren, the
 * fingerprint of a cross-reference or citation chopped at its own
 * `N)` (design finding: Sefaria's importer split `(v. X 2)` into a
 * fake sense boundary at the `2)`). */
function hasUnclosedParen(text: string): boolean {
	const opens = text.match(PAREN_OPEN)?.length ?? 0;
	const closes = text.match(PAREN_CLOSE)?.length ?? 0;
	return opens > closes;
}

function tailOf(text: string, max: number): string {
	return text.length <= max ? text : text.slice(-max);
}

function originHead(origin: OriginFields): string {
	return [origin.morphology, origin.languageCode, origin.languageReference]
		.filter((s): s is string => s !== undefined)
		.map(stripTags)
		.join(' ');
}

/** The tag-stripped text immediately preceding the sense at `idx` in
 * `senses` — the previous sense's definition, prepended with the
 * entry's origin fields (morphology/language code/language reference)
 * whenever that previous sense is `senses[0]`, or *is* those origin
 * fields alone when `idx` is 0 and there is no previous sense at all. */
function precedingText(
	senses: SourceSense[],
	idx: number,
	origin: OriginFields,
): string {
	const prevIdx = idx - 1;
	if (prevIdx < 0) {
		return originHead(origin);
	}
	const prevDefinition = stripTags(senses[prevIdx]?.definition ?? '');
	if (prevIdx === 0) {
		return `${originHead(origin)} ${prevDefinition}`;
	}
	return prevDefinition;
}

/** Classify a broken top-level sense-number sequence (design finding:
 * the 72 broken sequences aren't one class). A bare (dash-less)
 * non-1 number is either a phantom sense — Sefaria's importer chopped
 * a parenthesized cross-reference or citation at its own `N)`, leaving
 * an unclosed paren in the text right before it — or a legitimate
 * label some senses simply carry without the usual em-dash. Only the
 * first offending bare non-1 number (encounter order) is examined;
 * the corpus has none with a second. */
function classifySequenceBreak(
	senses: SourceSense[],
	origin: OriginFields,
): SequenceBreak {
	const numbered = senses
		.map((sense, idx) => ({ idx, sense }))
		.filter((entry): entry is { idx: number; sense: SourceSense } =>
			Boolean(entry.sense.number),
		);

	for (const [position, { idx, sense }] of numbered.entries()) {
		const parsed = parseLabel(sense.number ?? '');
		if ('unknown' in parsed || parsed.dash) {
			continue;
		}
		const value = Number(parsed.label);
		if (!Number.isFinite(value) || value === 1) {
			continue;
		}

		const preceding = precedingText(senses, idx, origin);
		const tail = tailOf(preceding, 50);
		if (hasUnclosedParen(preceding)) {
			return {
				class: position === 0 ? 'crossref-chop' : 'citation-chop',
				tail,
			};
		}
		// Balanced parens: this bare label is a legitimate sense without
		// a dash, not phantom damage. Mid-sequence, the entry's break is
		// still a genuine gap elsewhere — numbering-gap. At the first
		// numbered position (no earlier sense to explain the gap from),
		// it doesn't fit any measured pattern — unclassified.
		return position > 0
			? { class: 'numbering-gap', tail: '' }
			: { class: 'unclassified', tail };
	}

	// No bare non-1 number at all: a plain index gap (e.g. [1, 3, 4]).
	return { class: 'numbering-gap', tail: '' };
}

// The lookbehind excludes a preceding '(' or letter, but not a digit —
// so a folio-style citation like "39a)…39b)" could in principle match.
// Accepted at current corpus counts (189 ≈ the design estimate).
const LETTERED = /(?<![(\p{L}])a\)\s[\s\S]*?(?<![(\p{L}])b\)\s/u;

/** True when raw text contains a lettered a)…b) run — a candidate for
 * lettered sub-sense handling (Task 6). Strips tags internally. */
function letteredRun(text: string): boolean {
	return LETTERED.test(stripTags(text));
}

// Coarse detector for the design census's plural-section candidate count
// (B12, docs/specs/2026-07-11-entry-body-model-design.md §2/§3): a `Pl.`
// marker with a bare `1)` within ~120 chars, not immediately preceded by
// '(' or a word character. Like LETTERED above, this only checks the
// single character before the digit — it can't tell a restarted-list
// marker from a `1)` that merely closes an unrelated parenthetical
// citation (e.g. "Lam. R. introd. (R. Joḥ. 1)"). `form-sections.ts`'s
// `splitFormSection` is the authoritative structural rule (paren-balance
// aware) and disagrees with this detector on most of its hits — of the
// 25 entries this pattern flags corpus-wide, only 5 carry a genuine,
// paren-clear ascending run (task report). Mirrors the `LETTERED` /
// `splitLettered` relationship (189 detected vs 191 structural since
// Task 15's italic extension; 116 before it) documented above and in
// `lettered.ts`'s header comment.
const PLURAL_SECTION = /Pl\..{0,120}?(?<![(\w])1\)\s/su;

/** True when raw text contains the coarse plural-section candidate shape
 * — sizing only (see `PLURAL_SECTION` above); not the authoritative
 * split rule. Strips tags internally. */
function pluralSection(text: string): boolean {
	return PLURAL_SECTION.test(stripTags(text));
}

// Coarse per-marker generalization of PLURAL_SECTION above (B12 extension,
// maintainer print pass 2026-07-14): the same "marker + bare `1)` within
// ~120 chars" shape, for every marker in `form-sections.ts`'s `MARKERS`
// table, not just `Pl.`. Same caveat as `PLURAL_SECTION` — this is sizing
// only (single-character lookbehind, tag-stripped), not the authoritative
// split rule; `form-sections.ts`'s `splitFormSection` (paren-balance,
// nearest-marker-attribution aware) disagrees with this detector on most
// hits, the same way it does for `Pl.` alone. Kept alongside (not
// replacing) `PLURAL_SECTION`/`pluralSection`/`pluralSections` for
// committed-report stability — this is additive.
const FORM_SECTION_PATTERNS = new Map(
	MARKERS.map((marker) => [
		marker,
		new RegExp(
			// Escape every regex special (not just `.`) even though MARKERS
			// is a closed literal vocabulary — CodeQL js/incomplete-
			// sanitization, and future markers stay safe by construction.
			`${marker.replace(/[.*+?^${}()|[\]\\]/gu, '\\$&')}.{0,120}?(?<![(\\w])1\\)\\s`,
			'su',
		),
	]),
);

/** Every marker (see `MARKERS`) whose coarse candidate shape appears in
 * raw `text` — sizing only (see `FORM_SECTION_PATTERNS` above); not the
 * authoritative split rule. Strips tags internally. */
function formSectionCandidates(text: string): string[] {
	const stripped = stripTags(text);
	const hits: string[] = [];
	for (const [marker, pattern] of FORM_SECTION_PATTERNS) {
		if (pattern.test(stripped)) {
			hits.push(marker);
		}
	}
	return hits;
}

/** Depth-first walk over a sense tree, yielding every node including
 * nested sub-senses. Shared with later tasks (grammar/labels/units). */
function* walkSenses(senses: SourceSense[]): Generator<SourceSense> {
	for (const sense of senses) {
		yield sense;
		if (sense.senses) {
			yield* walkSenses(sense.senses);
		}
	}
}

type PreambleOpener = 'empty' | 'non-gloss' | 'gloss';

const NON_GLOSS_OPENER = /^[\s,(]/u;

/** Classify the first sense's opening: empty (no text at all),
 * non-gloss (opens on whitespace/comma/paren — a cross-reference or
 * continuation, not a gloss), or gloss (opens on the gloss itself). */
function classifyOpener(headDefinition: string): PreambleOpener {
	const head = stripTags(headDefinition);
	if (head === '') {
		return 'empty';
	}
	if (NON_GLOSS_OPENER.test(head)) {
		return 'non-gloss';
	}
	return 'gloss';
}

interface MalformedTally {
	nestedDuplicate: number;
	recoveredLoss: number;
	runawayHref: number;
}

interface CitationTally {
	malformed: MalformedTally;
	slashless: number;
	total: number;
	wellFormed: number;
}

interface IbidTally {
	linked: number;
	unlinked: number;
}

interface BrokenSequenceRow {
	class: SequenceBreakClass;
	rid: string;
	seq: number[];
	tail: string;
}

interface Accumulator {
	boundaries: Map<Boundary, number>;
	brokenSequences: BrokenSequenceRow[];
	citations: CitationTally;
	definitions: number;
	entries: number;
	formSections: Map<string, Set<string>>;
	ibid: IbidTally;
	lettered: Set<string>;
	markers: Map<string, number>;
	pluralSections: Set<string>;
	preambleOpeners: Map<PreambleOpener, number>;
}

function createAccumulator(): Accumulator {
	return {
		boundaries: new Map(),
		brokenSequences: [],
		citations: {
			malformed: { nestedDuplicate: 0, recoveredLoss: 0, runawayHref: 0 },
			slashless: 0,
			total: 0,
			wellFormed: 0,
		},
		definitions: 0,
		entries: 0,
		formSections: new Map(MARKERS.map((marker) => [marker, new Set<string>()])),
		ibid: { linked: 0, unlinked: 0 },
		lettered: new Set(),
		markers: new Map(),
		preambleOpeners: new Map(),
		pluralSections: new Set(),
	};
}

/** Decide which malformed bucket a single malformed hit belongs to.
 * `runawayHref` — the open tag's own href quote ran into markup, so
 * `extractHref` never got a clean target. `nestedDuplicate` — the
 * following hit starts exactly where this one ends and carries the
 * identical href: the benign outer-wraps-inner quirk. Anything else
 * left over is a `recoveredLoss` — a genuine anchor whose close truly
 * went missing from the source. */
function classifyMalformed(
	hit: CitationHit,
	next: CitationHit | undefined,
	malformed: MalformedTally,
): void {
	if (hit.href.includes('<')) {
		malformed.runawayHref++;
		return;
	}
	if (next !== undefined && next.start === hit.end && next.href === hit.href) {
		malformed.nestedDuplicate++;
		return;
	}
	malformed.recoveredLoss++;
}

function tallyCitations(hits: CitationHit[], tally: CitationTally): void {
	tally.total += hits.length;
	for (const [index, hit] of hits.entries()) {
		if (!hit.malformed) {
			tally.wellFormed++;
			if (hit.kind === 'external' && !hit.hadLeadingSlash) {
				tally.slashless++;
			}
			continue;
		}
		classifyMalformed(hit, hits[index + 1], tally.malformed);
	}
}

/** Boundary class is only meaningful for well-formed external
 * citations — malformed hits don't reliably span a full anchor, and
 * internal (Jastrow cross-reference) anchors aren't the citation
 * grammar this measures. */
function tallyBoundaries(
	definition: string,
	hits: CitationHit[],
	boundaries: Map<Boundary, number>,
): void {
	for (const hit of hits) {
		if (hit.malformed || hit.kind !== 'external') {
			continue;
		}
		const bucket = classifyBoundary(definition.slice(0, hit.start));
		boundaries.set(bucket, (boundaries.get(bucket) ?? 0) + 1);
	}
}

const IBID = /(?<![\p{L}])ib(?:id)?\./giu;

/** An ibid token is "linked" when it falls inside any citation span
 * already found in this definition (it's part of an anchor's visible
 * text), otherwise it's bare prose. */
function tallyIbid(
	definition: string,
	hits: CitationHit[],
	ibid: IbidTally,
): void {
	for (const match of definition.matchAll(IBID)) {
		const index = match.index ?? 0;
		const inside = hits.some((hit) => index >= hit.start && index < hit.end);
		if (inside) {
			ibid.linked++;
		} else {
			ibid.unlinked++;
		}
	}
}

function tallySequence(
	rid: string,
	senses: SourceSense[],
	origin: OriginFields,
	brokenSequences: BrokenSequenceRow[],
): void {
	const numbers = senses
		.map((sense) => sense.number)
		.filter((n): n is string => n !== undefined);
	const seq = labelSequence(numbers);
	const isClean = seq.every((n, i) => n === i + 1);
	if (seq.length > 0 && !isClean) {
		const { class: seqClass, tail } = classifySequenceBreak(senses, origin);
		brokenSequences.push({ class: seqClass, rid, seq, tail });
	}
}

function censusEntry(entry: SourceEntry, acc: Accumulator): void {
	acc.entries++;
	const marker = entry.content.morphology;
	if (marker !== undefined) {
		acc.markers.set(marker, (acc.markers.get(marker) ?? 0) + 1);
	}

	let hasLettered = false;
	let hasPluralSection = false;
	const hitMarkers = new Set<string>();
	for (const sense of walkSenses(entry.content.senses)) {
		if (sense.definition !== undefined) {
			acc.definitions++;
		}
		const definition = sense.definition ?? '';
		if (letteredRun(definition)) {
			hasLettered = true;
		}
		if (pluralSection(definition)) {
			hasPluralSection = true;
		}
		for (const formMarker of formSectionCandidates(definition)) {
			hitMarkers.add(formMarker);
		}
		const hits = findCitations(definition);
		tallyCitations(hits, acc.citations);
		tallyBoundaries(definition, hits, acc.boundaries);
		tallyIbid(definition, hits, acc.ibid);
	}
	if (hasLettered) {
		acc.lettered.add(entry.rid);
	}
	if (hasPluralSection) {
		acc.pluralSections.add(entry.rid);
	}
	for (const formMarker of hitMarkers) {
		acc.formSections.get(formMarker)?.add(entry.rid);
	}

	// Sequence numbering is only checked at the top level: nested
	// sub-senses (e.g. under a grammar node) commonly restart their own
	// numbering, so folding them into one flat sequence manufactures
	// false breaks that don't exist in the source.
	tallySequence(
		entry.rid,
		entry.content.senses,
		{
			...(entry.language_code !== undefined && {
				languageCode: entry.language_code,
			}),
			...(entry.language_reference !== undefined && {
				languageReference: entry.language_reference,
			}),
			...(entry.content.morphology !== undefined && {
				morphology: entry.content.morphology,
			}),
		},
		acc.brokenSequences,
	);

	const opener = classifyOpener(entry.content.senses[0]?.definition ?? '');
	acc.preambleOpeners.set(opener, (acc.preambleOpeners.get(opener) ?? 0) + 1);
}

interface CensusReport {
	boundaries: Record<Boundary, number>;
	brokenSequences: BrokenSequenceRow[];
	citations: CitationTally;
	formSections: Record<string, string[]>;
	ibid: IbidTally;
	lettered: string[];
	markers: Record<string, number>;
	pluralSections: string[];
	preambleOpeners: Record<PreambleOpener, number>;
	totals: { definitions: number; entries: number };
}

const BOUNDARY_ORDER: Boundary[] = [
	'sense-start',
	'period',
	'dash',
	'semicolon',
	'comma',
	'embedded',
];
const OPENER_ORDER: PreambleOpener[] = ['empty', 'non-gloss', 'gloss'];

function buildReport(acc: Accumulator): CensusReport {
	const markers = Object.fromEntries(
		[...acc.markers.entries()].sort((a, b) => b[1] - a[1]),
	);
	const boundaries = Object.fromEntries(
		BOUNDARY_ORDER.map((b) => [b, acc.boundaries.get(b) ?? 0]),
	) as Record<Boundary, number>;
	const preambleOpeners = Object.fromEntries(
		OPENER_ORDER.map((o) => [o, acc.preambleOpeners.get(o) ?? 0]),
	) as Record<PreambleOpener, number>;

	const formSections = Object.fromEntries(
		MARKERS.map((marker) => [
			marker,
			[...(acc.formSections.get(marker) ?? [])].sort((a, b) =>
				a.localeCompare(b),
			),
		]),
	);

	return {
		boundaries,
		brokenSequences: acc.brokenSequences,
		citations: acc.citations,
		formSections,
		ibid: acc.ibid,
		lettered: [...acc.lettered].sort((a, b) => a.localeCompare(b)),
		markers,
		pluralSections: [...acc.pluralSections].sort((a, b) => a.localeCompare(b)),
		preambleOpeners,
		totals: { definitions: acc.definitions, entries: acc.entries },
	};
}

if (import.meta.main) {
	const acc = createAccumulator();
	for await (const entry of readSourceEntries()) {
		censusEntry(entry, acc);
	}
	const report = buildReport(acc);
	await Bun.write(REPORT_PATH, `${JSON.stringify(report, null, '\t')}\n`);

	const malformedTotal =
		report.citations.malformed.nestedDuplicate +
		report.citations.malformed.recoveredLoss +
		report.citations.malformed.runawayHref;
	console.log(
		`entries=${report.totals.entries} definitions=${report.totals.definitions}`,
	);
	console.log(
		`brokenSequences=${report.brokenSequences.length} lettered=${report.lettered.length} pluralSections=${report.pluralSections.length}`,
	);
	const formSectionCounts = Object.fromEntries(
		Object.entries(report.formSections).map(([marker, rids]) => [
			marker,
			rids.length,
		]),
	);
	console.log(`formSections (coarse) = ${JSON.stringify(formSectionCounts)}`);
	console.log(
		`citations total=${report.citations.total} wellFormed=${report.citations.wellFormed} malformed=${malformedTotal} (nestedDuplicate=${report.citations.malformed.nestedDuplicate} runawayHref=${report.citations.malformed.runawayHref} recoveredLoss=${report.citations.malformed.recoveredLoss}) slashless=${report.citations.slashless}`,
	);
	console.log(
		`ibid linked=${report.ibid.linked} unlinked=${report.ibid.unlinked}`,
	);
	console.log(`report written to ${REPORT_PATH}`);
}

export type { Boundary, BrokenSequenceRow, OriginFields, SequenceBreakClass };
export {
	classifyBoundary,
	classifyMalformed,
	classifySequenceBreak,
	formSectionCandidates,
	labelSequence,
	letteredRun,
	pluralSection,
	walkSenses,
};
