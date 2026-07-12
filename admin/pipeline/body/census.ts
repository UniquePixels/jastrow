/**
 * Body-model census (design doc §7 / entry-body-model plan Task 3).
 * Measures every value space and edge class the body-model parse
 * rules depend on, so the fixtures and rule vocabularies later tasks
 * build are evidence, not guesses. Read-only; writes the machine
 * report to data/source/body-census-report.json (gitignored — data
 * architecture spec D2, not committed). Run: bun body:census
 */
import { type CitationHit, findCitations } from './cite.ts';
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
const stripTags = (text: string): string => text.replace(TAGS, '');

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

const SENSE_NUMBER = /(\d+)/u;

/** Pull the leading integer out of each sense-number token ("—3)" → 3)
 * in encounter order, dropping any token with none. A clean sequence
 * is `[1, 2, ..., n]`; anything else is a broken sequence. */
function labelSequence(numbers: string[]): number[] {
	return numbers
		.map((n) => SENSE_NUMBER.exec(n)?.[1])
		.filter((n): n is string => n !== undefined)
		.map(Number);
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

interface Accumulator {
	boundaries: Map<Boundary, number>;
	brokenSequences: { rid: string; seq: number[] }[];
	citations: CitationTally;
	definitions: number;
	entries: number;
	ibid: IbidTally;
	lettered: Set<string>;
	markers: Map<string, number>;
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
		ibid: { linked: 0, unlinked: 0 },
		lettered: new Set(),
		markers: new Map(),
		preambleOpeners: new Map(),
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
	numbers: string[],
	brokenSequences: { rid: string; seq: number[] }[],
): void {
	const seq = labelSequence(numbers);
	const isClean = seq.every((n, i) => n === i + 1);
	if (seq.length > 0 && !isClean) {
		brokenSequences.push({ rid, seq });
	}
}

function censusEntry(entry: SourceEntry, acc: Accumulator): void {
	acc.entries++;
	const marker = entry.content.morphology;
	if (marker !== undefined) {
		acc.markers.set(marker, (acc.markers.get(marker) ?? 0) + 1);
	}

	let hasLettered = false;
	for (const sense of walkSenses(entry.content.senses)) {
		if (sense.definition !== undefined) {
			acc.definitions++;
		}
		const definition = sense.definition ?? '';
		if (letteredRun(definition)) {
			hasLettered = true;
		}
		const hits = findCitations(definition);
		tallyCitations(hits, acc.citations);
		tallyBoundaries(definition, hits, acc.boundaries);
		tallyIbid(definition, hits, acc.ibid);
	}
	if (hasLettered) {
		acc.lettered.add(entry.rid);
	}

	// Sequence numbering is only checked at the top level: nested
	// sub-senses (e.g. under a grammar node) commonly restart their own
	// numbering, so folding them into one flat sequence manufactures
	// false breaks that don't exist in the source.
	const numbers = entry.content.senses
		.map((sense) => sense.number)
		.filter((n): n is string => n !== undefined);
	tallySequence(entry.rid, numbers, acc.brokenSequences);

	const opener = classifyOpener(entry.content.senses[0]?.definition ?? '');
	acc.preambleOpeners.set(opener, (acc.preambleOpeners.get(opener) ?? 0) + 1);
}

interface CensusReport {
	boundaries: Record<Boundary, number>;
	brokenSequences: { rid: string; seq: number[] }[];
	citations: CitationTally;
	ibid: IbidTally;
	lettered: string[];
	markers: Record<string, number>;
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

	return {
		boundaries,
		brokenSequences: acc.brokenSequences,
		citations: acc.citations,
		ibid: acc.ibid,
		lettered: [...acc.lettered].sort((a, b) => a.localeCompare(b)),
		markers,
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
		`brokenSequences=${report.brokenSequences.length} lettered=${report.lettered.length}`,
	);
	console.log(
		`citations total=${report.citations.total} wellFormed=${report.citations.wellFormed} malformed=${malformedTotal} (nestedDuplicate=${report.citations.malformed.nestedDuplicate} runawayHref=${report.citations.malformed.runawayHref} recoveredLoss=${report.citations.malformed.recoveredLoss}) slashless=${report.citations.slashless}`,
	);
	console.log(
		`ibid linked=${report.ibid.linked} unlinked=${report.ibid.unlinked}`,
	);
	console.log(`report written to ${REPORT_PATH}`);
}

export type { Boundary };
export {
	classifyBoundary,
	classifyMalformed,
	labelSequence,
	letteredRun,
	walkSenses,
};
