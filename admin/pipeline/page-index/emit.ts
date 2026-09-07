/**
 * Serialisation of the built index.
 *
 * Split out from `build.ts` so the build reads as the argument it is —
 * spine, scans, alignment, placement — with the file writing out of the way.
 */

import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import type { ColumnRecord } from './columns.ts';
import type { SpineEntry } from './spine.ts';

type Confidence = 'high' | 'low' | 'medium';

interface ColumnHead {
	readonly column: 'a' | 'b';
	readonly confidence: Confidence;
	/** Entry whose text runs over into the top of this column, if any. */
	readonly continuedFrom: string | null;
	/**
	 * The guide word Tesseract read from this column's header, verbatim.
	 *
	 * Jastrow's left guide word is the first headword beginning on the page, so
	 * for column `a` this is an independent check on `headword` — where the OCR
	 * managed to read it, which is only about half the time.
	 */
	readonly guideOcr: string;
	readonly headword: string;
	readonly leaf: number;
	readonly letter: string;
	/**
	 * True when this page carries a full-width letter heading.
	 *
	 * On such a page the old letter runs across both columns above the heading
	 * and the new one across both below, so this column holds entries from two
	 * different letters.
	 */
	readonly letterChange: boolean;
	readonly page: number;
	readonly rid: string;
	readonly volume: number;
}

/** Where one spine entry was placed. */
interface Placement {
	readonly column: ColumnRecord | null;
	readonly confidence: Confidence;
	readonly entry: SpineEntry;
}

interface LetterStart {
	readonly column: string;
	readonly letter: string;
	readonly page: number;
	readonly rid: string;
}

interface EntryRow {
	readonly column: string;
	readonly confidence: Confidence;
	readonly headword: string;
	readonly page: number;
	readonly rid: string;
	readonly volume: number;
}

function writeJsonl(path: string, rows: readonly unknown[]): void {
	writeFileSync(
		path,
		`${rows.map((r) => JSON.stringify(r)).join('\n')}\n`,
		'utf8',
	);
}

function writeJson(path: string, value: unknown): void {
	writeFileSync(path, `${JSON.stringify(value, null, '\t')}\n`, 'utf8');
}

/**
 * The earliest-indexed entry placed in each column.
 *
 * A letter-change page contributes two blocks per column; both map to the same
 * key, so the top block's entry wins, which is what "first headword beginning
 * in this column" means.
 */
function firstEntryPerColumn(
	placements: readonly Placement[],
): Map<string, Placement> {
	const firstIn = new Map<string, Placement>();
	for (const p of placements) {
		if (!p.column) {
			continue;
		}
		const key = `${p.column.volume}:${p.column.leaf}:${p.column.column}`;
		const seen = firstIn.get(key);
		if (!seen || p.entry.index < seen.entry.index) {
			firstIn.set(key, p);
		}
	}
	return firstIn;
}

/** Leaves split by a full-width letter heading, as `volume:leaf` keys. */
function bandedPages(columns: readonly ColumnRecord[]): Set<string> {
	const out = new Set<string>();
	for (const col of columns) {
		if (col.band !== 'full') {
			out.add(`${col.volume}:${col.leaf}`);
		}
	}
	return out;
}

/**
 * The first entry to begin in each column.
 *
 * Columns with no head are omitted rather than emitted empty: most are front
 * and back matter, but a few are real columns wholly filled by one long entry,
 * and both are honestly "no headword begins here".
 */
function columnHeads(
	columns: readonly ColumnRecord[],
	placements: readonly Placement[],
	spine: readonly SpineEntry[],
): ColumnHead[] {
	const firstIn = firstEntryPerColumn(placements);

	const banded = bandedPages(columns);
	const heads: ColumnHead[] = [];
	const emitted = new Set<string>();
	for (const col of columns) {
		const key = `${col.volume}:${col.leaf}:${col.column}`;
		const p = firstIn.get(key);
		if (!p || emitted.has(key)) {
			continue;
		}
		emitted.add(key);
		const prev =
			p.entry.index > 0 ? (spine[p.entry.index - 1] as SpineEntry) : null;
		heads.push({
			column: col.column,
			confidence: p.confidence,
			continuedFrom: prev ? prev.rid : null,
			guideOcr: col.guide,
			headword: p.entry.headword,
			leaf: col.leaf,
			letter: p.entry.letter,
			letterChange: banded.has(`${col.volume}:${col.leaf}`),
			page: col.printedPage,
			rid: p.entry.rid,
			volume: col.volume,
		});
	}
	heads.sort((a, b) => a.page - b.page || a.column.localeCompare(b.column));
	return heads;
}

/** Page and column for every placed entry. */
function entryRows(placements: readonly Placement[]): EntryRow[] {
	const rows: EntryRow[] = [];
	for (const p of placements) {
		if (!p.column) {
			continue;
		}
		rows.push({
			column: p.column.column,
			confidence: p.confidence,
			headword: p.entry.headword,
			page: p.column.printedPage,
			rid: p.entry.rid,
			volume: p.column.volume,
		});
	}
	return rows;
}

/**
 * Where each Hebrew letter's section starts.
 *
 * Recorded to column granularity because Jastrow changes letter mid-page — 7
 * of the 22 letters begin in column b — so a page number alone would not say
 * which half of the page the new letter starts in.
 */
function letterStarts(placements: readonly Placement[]): LetterStart[] {
	const out: LetterStart[] = [];
	let last = '';
	for (const p of placements) {
		if (!p.column || p.entry.letter === last) {
			continue;
		}
		last = p.entry.letter;
		out.push({
			column: p.column.column,
			letter: p.entry.letter,
			page: p.column.printedPage,
			rid: p.entry.rid,
		});
	}
	return out;
}

interface EmitOptions {
	readonly columns: readonly ColumnRecord[];
	/** Extra fields to fold into the build report, e.g. derived offsets. */
	readonly extra: Readonly<Record<string, unknown>>;
	readonly outDir: string;
	readonly placements: readonly Placement[];
	readonly spine: readonly SpineEntry[];
}

/** Write every output file and return the summary report. */
function emitIndex(options: EmitOptions): Record<string, unknown> {
	const { columns, extra, outDir, placements, spine } = options;
	const heads = columnHeads(columns, placements, spine);
	const entries = entryRows(placements);
	const letters = letterStarts(placements);

	mkdirSync(outDir, { recursive: true });
	writeJsonl(join(outDir, 'columns.jsonl'), heads);
	writeJsonl(join(outDir, 'entries.jsonl'), entries);
	writeJson(join(outDir, 'letters.json'), letters);

	const byConf: Record<string, number> = {};
	for (const p of placements) {
		byConf[p.confidence] = (byConf[p.confidence] ?? 0) + 1;
	}
	const headConf: Record<string, number> = {};
	for (const h of heads) {
		headConf[h.confidence] = (headConf[h.confidence] ?? 0) + 1;
	}
	const report = {
		...extra,
		columnsTotal: columns.length,
		columnsWithHead: heads.length,
		entriesPlaced: entries.length,
		entriesTotal: spine.length,
		headConfidence: headConf,
		letters: letters.length,
		placementConfidence: byConf,
	};
	writeJson(join(outDir, 'build-report.json'), report);
	return report;
}

export type { ColumnHead, Confidence, EmitOptions, Placement };
export { emitIndex };
