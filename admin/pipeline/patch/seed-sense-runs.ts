/**
 * The doc-08 follow-up tranche: sense runs the implied-`1)` generator
 * cannot express, confirmed by the maintainer on 2026-09-10 (and, for
 * `K00081`, deferred on 2026-08-05 and resolved now).
 *
 * ## Why a second generator
 *
 * `seed-implied-one.ts` addresses exactly one shape — an UNNUMBERED
 * sense whose text opens a `—2)` run with no `1)` before it — and its
 * repair is fixed: split the run, retag the host `1)`. The six rows
 * here each carry a run inside a sense that shape cannot reach:
 *
 * - `K00081` — doc 01 deferred it on 2026-08-05 rather than rejecting
 *   it. Two halves, both determined by the surrounding sequence: an
 *   in-text `—3)` swallowed inside sense `—2)`, and the section
 *   between `—4)` and `—6)` carrying no number at all.
 * - `P00816` — the run sits in a sense already numbered `—2)`, in the
 *   entry's `Ithpe.` stem. `impliedHost` never looks at numbered
 *   senses, so the seeded repair fixed the entry's top-level run and
 *   left this one. Register #3's `swallowed-marker`.
 * - `L00565`, `O01387` — the sense that should be `2)` exists and
 *   simply carries no number token at all. The census cannot see it
 *   (nothing is implied — a marker was dropped), and neither can
 *   `census.ts`'s `labelSequence`, which drops number-less senses
 *   before checking the sequence reads `1..n`. The maintainer read
 *   both against print: `…affixed to, v. Pi.—2) to accustom, train`
 *   and `…scour; v. Ithpe.—2) to regard`.
 * - `E00148`, `E00298`, `I00822` — the `1)` is present but OCR'd as a
 *   lowercase `l)`, which is why the census flagged them (an `l)` is
 *   not a `1)`, so the `—2)` looks unpreceded) and why doc 08
 *   rejected them on 2026-08-05 as an OCR class rather than this one.
 *   Correcting the glyph is a correction, not text invention, and
 *   `replace`'s closed-marker allowance covers it.
 *
 * ## How the patches are derived
 *
 * Each row declares its ops in apply order. Rather than deriving the
 * intermediate states by hand, the generator applies each patch it
 * mints to a working copy through `applyPatch` — the same code the
 * apply phase runs — and addresses the next op against that copy. An
 * anchor that would not resolve therefore cannot be minted: the
 * generator would have failed on the previous step.
 *
 * Run: bun run patch:seed-sense-runs
 */
import { healAndTransform } from '../body/compose.ts';
import { readSourceEntries } from '../body/source.ts';
import type { SourceEntry, SourceSense } from '../body/types.ts';
import { applyTransforms } from '../transform/run.ts';
import { applyPatch, parsePatch, senseTarget } from './schema.ts';

/** The snapshot every tranche pins. */
const SNAPSHOT =
	'sha256:75bbc5ee7ab863b80b144c5fe176492b9bbcc8719cad83264ff8027092719ad9';

/** Not a sweep prompt: the decisions are the maintainer's, given on
 * 2026-09-10 against `docs/v2/phase-2-swallowed-runs.md`. */
const PROMPT_VERSION = 'doc-08-runs';

/** First id this tranche mints. `seed-doc-08-implied-one` ends at
 * `P000170`; ids are unique corpus-wide, not per tranche. */
const FIRST_ID = 171;

/** One declared op. `split` and `retag` carry closed-grammar marker
 * tokens; `replace` carries the OCR glyph correction. */
type RunOp =
	| { kind: 'replace'; find: string; with: string }
	| { kind: 'retag'; number: string }
	| { kind: 'split'; marker: string };

interface RunRow {
	/** What the defect is called in the patch corpus. */
	defectClass: string;
	/** The ops, in apply order. */
	ops: RunOp[];
	/** Tag-stripped prefix that identifies the sense to address. It
	 * must match exactly one sense in the composed entry — a prefix
	 * that matches none or several is drift the caller must see. */
	opens: string;
	rationale: string;
	rid: string;
}

/**
 * The six confirmed rows.
 *
 * Committed rather than derived, because each one encodes a reading
 * the maintainer made against print. A detector that re-derived them
 * would be asserting that judgment rather than recording it.
 */
const RUN_ROWS: readonly RunRow[] = [
	{
		defectClass: 'ocr-marker',
		opens: ' l) to return, restore;',
		ops: [
			{ find: 'l)', kind: 'replace', with: '1)' },
			{ kind: 'split', marker: '1)' },
			{ kind: 'split', marker: '—2)' },
			{ kind: 'split', marker: '—3)' },
			{ kind: 'split', marker: '—4)' },
		],
		rationale:
			'Doc-08 2026-08-05: not implied, OCR error — l) to return, restore. Correct the glyph, then split the 1)–4) run.',
		rid: 'E00148',
	},
	{
		defectClass: 'ocr-marker',
		opens: ' (זכר; v. ',
		ops: [
			{ find: 'l)', kind: 'replace', with: '1)' },
			{ kind: 'split', marker: '1)' },
			{ kind: 'split', marker: '—2)' },
			{ kind: 'split', marker: '—3)' },
		],
		rationale:
			'Doc-08 2026-08-05: not implied, OCR error — l) giving a debtor notice. Correct the glyph, then split the 1)–3) run.',
		rid: 'E00298',
	},
	{
		defectClass: 'ocr-marker',
		opens: ' (τρικλίνιον, triclinium) l)',
		ops: [
			{ find: 'l)', kind: 'replace', with: '1)' },
			{ kind: 'split', marker: '1)' },
			{ kind: 'split', marker: '—2)' },
			{ kind: 'split', marker: '—3)' },
		],
		rationale:
			'Doc-08 2026-08-05: not implied, OCR error — l) dining couch. Correct the glyph, then split the 1)–3) run.',
		rid: 'I00822',
	},
	{
		defectClass: 'missing-number',
		opens: 'to accustom, train.',
		ops: [
			{ kind: 'retag', number: '—2)' },
			{ kind: 'split', marker: '—3)' },
		],
		rationale:
			'Print reads “…affixed to, v. Pi.—2) to accustom, train”; the sense exists with no number token (maintainer, 2026-09-10). Number it, then split its —3) tail.',
		rid: 'L00565',
	},
	{
		defectClass: 'missing-number',
		opens: 'to regard. ',
		ops: [
			{ kind: 'retag', number: '—2)' },
			{ kind: 'split', marker: '—3)' },
		],
		rationale:
			'Print reads “…scour; v. Ithpe.—2) to regard”; the sense exists with no number token (maintainer, 2026-09-10). Number it, then split its —3) tail.',
		rid: 'O01387',
	},
	// K00081 is doc 01's 2026-08-05 DEFERRAL, not a new row. The
	// maintainer's own cell names both halves: an in-text “—3) to
	// press” inside sense —2), and a section that “does not have the 5
	// label”. The surrounding sequence (1, 2, [3], 4, ∅, 6, 7, 8)
	// determines both, so no print is needed.
	{
		defectClass: 'swallowed-marker',
		opens: ' כ׳ פנים (בקרקע) to press the face',
		ops: [{ kind: 'split', marker: '—3)' }],
		rationale:
			'Doc-01 deferral 2026-08-05: sense —2) swallows the —3) the maintainer read in print; the next sense is —4).',
		rid: 'K00081',
	},
	{
		defectClass: 'missing-number',
		opens: 'to detain (cmp. ',
		ops: [{ kind: 'retag', number: '—5)' }],
		rationale:
			'Doc-01 deferral 2026-08-05: the section between —4) and —6) carries no number; the maintainer noted it “does not have the 5 label”.',
		rid: 'K00081',
	},
	// P00816 carries TWO runs and is therefore repaired whole HERE
	// rather than half here and half in the implied-one seed. A rid
	// may be claimed by only one tranche: `consolidate` supersedes the
	// earlier manifest row, which would silently drop the earlier
	// tranche's patches for it. So P00816 is not in `SEED_CONFIRMED`.
	{
		defectClass: 'implied-one',
		opens: ', esp. (corresp. to h. ',
		ops: [
			{ kind: 'retag', number: '1)' },
			{ kind: 'split', marker: '—2)' },
			{ kind: 'split', marker: '—3)' },
		],
		rationale:
			'Doc-08 confirmed implied-one; in-text —2) run with no 1) before it, continuing to —3).',
		rid: 'P00816',
	},
	{
		defectClass: 'swallowed-marker',
		opens: 'to attempt entrance.',
		ops: [{ kind: 'split', marker: '—3)' }],
		rationale:
			'Ithpe. sense —2) swallows the —3) that follows it — a second run in the same entry, confirmed 2026-09-10.',
		rid: 'P00816',
	},
];

const TAGS = /<[^>]+>/gu;

/** Strip to a fixed point, as the census and review tooling do. */
function stripTags(text: string): string {
	let out = text;
	let prev: string;
	do {
		prev = out;
		out = out.replace(TAGS, '');
	} while (out !== prev);
	return out;
}

/** Every sense in document order — the order `schema.ts`'s resolver
 * uses, so an index here means the same thing there. */
function* walkSenses(list: readonly SourceSense[]): Generator<SourceSense> {
	for (const sense of list) {
		yield sense;
		if (sense.senses !== undefined) {
			yield* walkSenses(sense.senses);
		}
	}
}

/** The entry as the patch-apply phase receives it. */
function composedEntry(source: SourceEntry): SourceEntry {
	const healed = healAndTransform(source, { transformRecords: [] });
	return applyTransforms(healed.entry, 'structural-repairs').entry;
}

/** The document-order index of the one sense whose tag-stripped
 * definition starts with `opens`. Throws on none or several: an
 * ambiguous locator would silently address a different sense than the
 * maintainer read. */
function locate(entry: SourceEntry, opens: string): number {
	const hits: number[] = [];
	[...walkSenses(entry.content.senses)].forEach((sense, index) => {
		if (stripTags(sense.definition ?? '').startsWith(opens)) {
			hits.push(index);
		}
	});
	const at = hits[0];
	if (hits.length !== 1 || at === undefined) {
		throw new Error(
			`${entry.rid}: locator ${JSON.stringify(opens)} matched ${hits.length} senses, expected 1`,
		);
	}
	return at;
}

/** The sense at a document-order index. */
function senseAt(entry: SourceEntry, index: number): SourceSense {
	const sense = [...walkSenses(entry.content.senses)][index];
	if (sense === undefined) {
		throw new Error(`${entry.rid}: no sense at document index ${index}`);
	}
	return sense;
}

/** The op's payload, as the schema names it. */
function payloadOf(op: RunOp): Record<string, unknown> {
	switch (op.kind) {
		case 'replace':
			return { find: op.find, replace: op.with };
		case 'retag':
			return { number: op.number };
		default:
			return { marker: op.marker };
	}
}

/** One row's patches, in apply order.
 *
 * Each patch is applied to a working copy before the next is
 * addressed, so every anchor is derived from the state that patch
 * will actually meet. A `split` moves the cursor onto the sibling it
 * creates — the rest of the run lives there — while the other ops
 * leave it on the sense they changed.
 */
function runPatches(
	row: RunRow,
	entry: SourceEntry,
	firstId: number,
): { entry: SourceEntry; patches: Record<string, unknown>[] } {
	const patches: Record<string, unknown>[] = [];
	let working = entry;
	let index = locate(working, row.opens);
	let nextId = firstId;
	for (const op of row.ops) {
		const sense = senseAt(working, index);
		const patch = {
			confidence: 'high',
			defect_class: row.defectClass,
			expected_before: sense.definition ?? '',
			expected_occurrences: 1,
			id: `P${String(nextId).padStart(6, '0')}`,
			occurrence_index: 1,
			op: op.kind,
			payload: payloadOf(op),
			prompt_version: PROMPT_VERSION,
			rationale: row.rationale,
			rid: row.rid,
			snapshot: SNAPSHOT,
			target: senseTarget(sense),
		};
		patches.push(patch);
		nextId += 1;
		working = applyPatch(working, parsePatch(patch));
		if (op.kind === 'split') {
			index += 1;
		}
	}
	return { entry: working, patches };
}

/** Every row's patches, in `RUN_ROWS` order, with ids running from
 * `FIRST_ID`. A rid absent from the corpus throws. */
async function buildRuns(): Promise<
	{ patches: Record<string, unknown>[]; rid: string }[]
> {
	const wanted = new Set(RUN_ROWS.map((row) => row.rid));
	const found = new Map<string, SourceEntry>();
	for await (const source of readSourceEntries()) {
		if (wanted.has(source.rid)) {
			found.set(source.rid, composedEntry(source));
		}
	}
	const missing = RUN_ROWS.filter((row) => !found.has(row.rid));
	if (missing.length > 0) {
		throw new Error(
			`run rids absent from the corpus: ${missing.map((row) => row.rid).join(', ')}`,
		);
	}
	// Grouped by rid, in declaration order: an entry with two runs
	// (P00816) must produce ONE manifest record, and its second group
	// has to address the state the first group leaves behind.
	const grouped = new Map<string, RunRow[]>();
	for (const row of RUN_ROWS) {
		grouped.set(row.rid, [...(grouped.get(row.rid) ?? []), row]);
	}
	const rows: { patches: Record<string, unknown>[]; rid: string }[] = [];
	let id = FIRST_ID;
	for (const [rid, groups] of grouped) {
		const entry = found.get(rid);
		if (entry === undefined) {
			throw new Error(`unreachable: ${rid} passed the presence check`);
		}
		const patches: Record<string, unknown>[] = [];
		let working = entry;
		for (const group of groups) {
			const made = runPatches(group, working, id + patches.length);
			patches.push(...made.patches);
			working = made.entry;
		}
		rows.push({ patches, rid });
		id += patches.length;
	}
	return rows;
}

if (import.meta.main) {
	const rows = await buildRuns();
	const dir = 'data/patches/tranches/seed-doc-08-sense-runs';
	const patches = rows.flatMap((row) => row.patches);
	const manifest = rows.map((row) => ({
		disposition: 'repaired',
		patches: row.patches.map((patch) => patch['id']),
		rid: row.rid,
	}));
	const write = async (name: string, list: unknown[]): Promise<void> => {
		await Bun.write(
			`${dir}/${name}`,
			`${list.map((item) => JSON.stringify(item)).join('\n')}\n`,
		);
	};
	await write('patches.jsonl', patches);
	await write('manifest.jsonl', manifest);
	console.log(
		`wrote ${patches.length} patches over ${rows.length} entries to ${dir}`,
	);
}

export type { RunOp, RunRow };
export { buildRuns, locate, RUN_ROWS, runPatches };
