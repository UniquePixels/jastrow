#!/usr/bin/env bun
/**
 * The one-off backfill of `evidence` on the reviewed patch records
 * (ruling `10-26 patch evidence`, 2026-10-26). Kept as the record of
 * how the field was filled, not run again: it refuses a corpus where
 * any record already carries `evidence`, since from then on a batch
 * PR sets the field by hand from a print read.
 *
 * Every record's `evidence` is derived from its rationale alone, with
 * the regexes the Sefaria appendix already reads it by
 * (`report/sefaria-evidence.ts`), in this order, first match wins:
 *
 * 1. **`maintainer-read`**: a maintainer print read or check with its
 *    date (`PRINT_READ`, `READ_DATE`). `reader` is `Brian`, the one
 *    maintainer. A scan leaf the rationale links (IIIF) rides along
 *    as the locator when the leaf shows the entry.
 * 2. **`hOCR`**: the rationale names the hOCR. The quote is the first
 *    backticked or double-quoted string after the first `hOCR …:`
 *    that introduces one (`HOCR_INTRO`), else after the first `hOCR`,
 *    and it must hold at least `MIN_QUOTE` characters; the
 *    leaf the first `leaf N` after it, else the first linked one; the
 *    volume the IIIF link of that leaf, else a `vol. N` beside the
 *    hOCR, else the volume the page index places the rid in. The
 *    claim must check: the leaf shows the entry (`leafOutsideEntry`)
 *    and the quote is on it (`quoteOnLeaf`). An hOCR claim that does
 *    not check, or that names no quote or leaf, is unverifiable, so it
 *    falls through.
 * 3. **`jastrow-text`**: a `retag` whose number is determined by
 *    Jastrow's own run (10-13 case 2), as its rationale or annotation
 *    states it: the following sense's marker (`—2)`, `—*2)`) for an
 *    implied `1)`, or the printed run a renumber reads (`1 2 *3 4 4`).
 *    The quote is that marker or run.
 * 4. **`sefaria-only`** with `pending: true`: everything else, held
 *    for the group 3 re-read batches (`docs/review-checklist-2026-10-25.md`).
 *
 * Then one pass over what came out: a record that opens `Companion to
 * PNNNNNN (same print read` takes its partner's `maintainer-read`
 * evidence, since the rationale says the read is the same one.
 *
 * `confidence` (high on all 770) is dropped. Key order stays the
 * file's own, alphabetical, one compact JSON object per line.
 *
 * Usage:
 *   bun admin/pipeline/patch/backfill-evidence.ts           # dry: print the tables
 *   bun admin/pipeline/patch/backfill-evidence.ts --write   # rewrite patches.jsonl
 */
import process from 'node:process';
import { REVIEWED_DIR } from '../paths.ts';
import {
	HOCR,
	LEAF,
	PRINT_READ,
	READ_DATE,
} from '../report/sefaria-evidence.ts';
import { collapse, leafLines, MIN_QUOTE, quoteOnLeaf } from './hocr.ts';
import {
	leafOutsideEntry,
	type PageLookup,
	readPageLookup,
} from './locator.ts';
import { firstQuote } from './quote.ts';
import type { PatchEvidence } from './schema.ts';

const PATCHES = `${REVIEWED_DIR}/patches.jsonl`;
const IIIF_ALL =
	/dictionaryoftarg0(?<volume>[12])jastuoft\$(?<index>\d+)\/full/gu;
const LEAF_ALL = new RegExp(LEAF.source, 'gu');
const VOLUME_NOTE = /\bvol\. (?<volume>[12])\b/u;
/** A backticked or double-quoted string. A double quote closes only
 * where a terminator follows it (`;`, `,`, `)`, ` /`, a full stop
 * ending a sentence, or the end), so a quote holding a stray `"` of
 * the OCR's own is read whole. */
/** The next sense's marker, which determines an implied `1)`. */
const FOLLOWING_MARKER = /—\*?\d{1,2}\)/u;
/** The run a renumber reads its new number from, as the rationale
 * states it before the arrow (`1 2 *3 4 4` → `1 2 *3 4 5`). */
const RENUMBERED_RUN = /`(?<run>\*?\d{1,2}(?: \*?\d{1,2})+)` → `/u;
/** A companion patch that shares its partner's print read. */
const COMPANION_READ = /^Companion to (?<id>P\d{6}) \(same print read\b/u;
/** Where a rationale introduces its hOCR line: `hOCR` and, within the
 * same clause, a colon before the quote (`hOCR: …`, `hOCR for U00378:
 * …`, `(hOCR, 62a · leaf 85, 2026-10-22): "…"`, `the hOCR reads it so
 * (26a · leaf 49: "…"`). */
const HOCR_INTRO = /\bhOCR\b[^`"]{0,60}?:\s*(?=[`"])/u;
type Raw = Record<string, unknown> & {
	annotation?: { evidence: string };
	id: string;
	op: string;
	prompt_version: string;
	rationale: string;
	rid: string;
};

/** Why an hOCR claim fell through to `sefaria-only`, for the README. */
type Unverified =
	| 'no leaf'
	| 'no quote'
	| 'leaf outside entry'
	| 'quote not on leaf';

interface Derived {
	evidence: PatchEvidence;
	unverified?: Unverified;
}

/** The linked scan leaves, in rationale order, as `{volume, leaf}`. */
function linkedLeaves(rationale: string): { leaf: number; volume: 1 | 2 }[] {
	return [...rationale.matchAll(IIIF_ALL)].map((m) => ({
		leaf: Number(m.groups?.['index']) - 1,
		volume: Number(m.groups?.['volume']) as 1 | 2,
	}));
}

/** The first linked leaf that shows the entry, as a locator. */
function linkedLocator(
	raw: Raw,
	pages: PageLookup,
): { leaf: number; volume: 1 | 2 } | undefined {
	return linkedLeaves(raw.rationale).find(
		({ leaf, volume }) =>
			leafOutsideEntry(pages, raw.rid, volume, leaf) === undefined,
	);
}

async function hocrEvidence(
	raw: Raw,
	pages: PageLookup,
): Promise<PatchEvidence | Unverified> {
	const intro = HOCR_INTRO.exec(raw.rationale);
	const at = intro?.index ?? raw.rationale.search(HOCR);
	const after = raw.rationale.slice(at);
	const quote = firstQuote(
		intro === null ? after : after.slice(intro[0].length),
	);
	const linked = linkedLeaves(raw.rationale);
	const named = [...after.matchAll(LEAF_ALL)][0]?.groups?.['leaf'];
	const leaf = named === undefined ? linked[0]?.leaf : Number(named);
	if (leaf === undefined) {
		return 'no leaf';
	}
	if (quote === undefined || collapse(quote).length < MIN_QUOTE) {
		return 'no quote';
	}
	const noted = VOLUME_NOTE.exec(after)?.groups?.['volume'];
	const volume = (linked.find((l) => l.leaf === leaf)?.volume ??
		(noted === undefined ? undefined : Number(noted)) ??
		pages.entries.get(raw.rid)?.volume ??
		1) as 1 | 2;
	if (leafOutsideEntry(pages, raw.rid, volume, leaf) !== undefined) {
		return 'leaf outside entry';
	}
	if (!quoteOnLeaf((await leafLines(volume, leaf)) ?? [], quote)) {
		return 'quote not on leaf';
	}
	return { kind: 'hOCR', leaf, quote, volume };
}

/** The text of Jastrow's own run a `retag` reads its number from, or
 * `undefined` for any other op or a rationale that states none. */
function jastrowText(raw: Raw): string | undefined {
	if (raw.op !== 'retag') {
		return;
	}
	const marker = FOLLOWING_MARKER.exec(
		`${raw.rationale}\n${raw.annotation?.evidence ?? ''}`,
	)?.[0];
	return marker ?? RENUMBERED_RUN.exec(raw.rationale)?.groups?.['run'];
}

async function derive(raw: Raw, pages: PageLookup): Promise<Derived> {
	const date = READ_DATE.exec(raw.rationale)?.groups?.['date'];
	if (PRINT_READ.test(raw.rationale) && date !== undefined) {
		const locator = linkedLocator(raw, pages);
		return {
			evidence: {
				date,
				kind: 'maintainer-read',
				...locator,
				reader: 'Brian',
			},
		};
	}
	let unverified: Unverified | undefined;
	if (HOCR.test(raw.rationale)) {
		const hocr = await hocrEvidence(raw, pages);
		if (typeof hocr !== 'string') {
			return { evidence: hocr };
		}
		unverified = hocr;
	}
	const quote = jastrowText(raw);
	if (quote !== undefined) {
		return { evidence: { kind: 'jastrow-text', quote } };
	}
	return {
		evidence: { kind: 'sefaria-only', pending: true },
		...(unverified === undefined ? {} : { unverified }),
	};
}

/** `value` with its keys in code-unit order, as every line of the file
 * already is. */
function sortedKeys(value: Record<string, unknown>): Record<string, unknown> {
	return Object.fromEntries(
		Object.entries(value).sort(([a], [b]) => (a < b ? -1 : Number(a > b))),
	);
}

/** One count table: rows by `row`, columns by `column`, with totals. */
function table(
	rows: readonly { column: string; row: string }[],
	rowTitle: string,
): string[] {
	const columns = [...new Set(rows.map((r) => r.column))].sort(byCodeUnit);
	const rowKeys = [...new Set(rows.map((r) => r.row))].sort(byCodeUnit);
	const count = (row: string, column: string): number =>
		rows.filter((r) => r.row === row && r.column === column).length;
	return [
		`| ${rowTitle} | ${columns.join(' | ')} | total |`,
		`|---|${columns.map(() => '---:').join('|')}|---:|`,
		...rowKeys.map(
			(row) =>
				`| ${row} | ${columns.map((c) => count(row, c)).join(' | ')} | ${rows.filter((r) => r.row === row).length} |`,
		),
		`| **total** | ${columns.map((c) => rows.filter((r) => r.column === c).length).join(' | ')} | ${rows.length} |`,
	];
}

/** Give each `Companion to PNNNNNN (same print read` record its
 * partner's `maintainer-read` evidence, in place, when it came out
 * `sefaria-only`. Returns `id ← partner` for each. */
function inheritCompanionReads(
	records: readonly Raw[],
	derived: Map<string, Derived>,
): string[] {
	const inherited: string[] = [];
	for (const raw of records) {
		const partner = COMPANION_READ.exec(raw.rationale)?.groups?.['id'];
		const read = derived.get(partner ?? '')?.evidence;
		if (
			derived.get(raw.id)?.evidence.kind === 'sefaria-only' &&
			read?.kind === 'maintainer-read'
		) {
			derived.set(raw.id, { evidence: read });
			inherited.push(`${raw.id} ← ${partner}`);
		}
	}
	return inherited;
}

interface TallyRow {
	column: string;
	id: string;
	row: string;
	unverified?: string;
}

/** The classification table, the unverifiable hOCR claims, the
 * inherited reads and the pending ids, as the tranche README states
 * them. */
function printTables(
	tally: readonly TallyRow[],
	inherited: readonly string[],
): void {
	console.log(table(tally, 'prompt_version').join('\n'));
	console.log('');
	const unverified = tally.filter((t) => t.unverified !== undefined);
	console.log(
		`hOCR named but unverifiable (now sefaria-only, pending): ${unverified.length}`,
	);
	for (const t of unverified) {
		console.log(`- ${t.id} (${t.row}): ${t.unverified}`);
	}
	console.log('');
	console.log(
		`companions inheriting a maintainer read: ${inherited.join(', ')}`,
	);
	console.log('');
	const pending = tally.filter((t) => t.column === 'sefaria-only');
	console.log(`pending: ${pending.length}`);
	console.log(pending.map((t) => t.id).join(' '));
}

async function main(): Promise<void> {
	const write = process.argv.includes('--write');
	const lines = (await Bun.file(PATCHES).text()).split('\n').filter(Boolean);
	const records = lines.map((line) => JSON.parse(line) as Raw);
	if (records.some((r) => 'evidence' in r)) {
		throw new Error(
			`${PATCHES} already carries evidence: the backfill ran once and is not run again`,
		);
	}
	const pages = await readPageLookup();
	const derivedAll = await Promise.all(
		records.map((raw) => derive(raw, pages)),
	);
	const derived = new Map(
		records.map((raw, index) => [raw.id, derivedAll[index] as Derived]),
	);
	const inherited = inheritCompanionReads(records, derived);
	const out: string[] = [];
	const tally: TallyRow[] = [];
	for (const raw of records) {
		const { evidence, unverified } = derived.get(raw.id) as Derived;
		const { confidence: _dropped, ...rest } = raw;
		out.push(
			JSON.stringify(
				sortedKeys({
					...rest,
					evidence: sortedKeys({ ...evidence }),
				}),
			),
		);
		tally.push({
			column: evidence.kind,
			id: raw.id,
			row: raw.prompt_version,
			...(unverified === undefined ? {} : { unverified }),
		});
	}
	printTables(tally, inherited);
	if (write) {
		await Bun.write(PATCHES, `${out.join('\n')}\n`);
		console.log(`wrote ${PATCHES}`);
	}
}

/** Code-unit order: stable across machines, unlike a locale collation. */
function byCodeUnit(a: string, b: string): -1 | 0 | 1 {
	if (a === b) {
		return 0;
	}
	return a < b ? -1 : 1;
}

if (import.meta.main) {
	await main();
}
