/**
 * What the two doc-08 seed generators share.
 *
 * `seed-implied-one.ts` and `seed-sense-runs.ts` address different
 * shapes and declare their repairs differently, but they compose the
 * corpus the same way, stamp the same provenance onto every patch,
 * and write the same two files. Keeping those three things here is
 * not only de-duplication: a generator that composed the corpus
 * differently from its sibling would mint anchors against a state the
 * apply phase never sees, and the divergence would only surface as a
 * patch that fails to resolve much later.
 */
import { healAndTransform } from '../body/compose.ts';
import type { SourceEntry } from '../body/types.ts';
import { applyTransforms } from '../transform/run.ts';

/** The snapshot the doc-08 census and every patch derived from it
 * were built against — the pin each tranche carries and
 * `corpusPreflight` checks. */
const SNAPSHOT =
	'sha256:75bbc5ee7ab863b80b144c5fe176492b9bbcc8719cad83264ff8027092719ad9';

/** The entry as the patch-apply phase receives it: `applyRepairs`,
 * then the `text-repairs` and `structural-repairs` transform phases.
 * Addressing a sense in any other state mints an anchor that will not
 * resolve. */
function composedEntry(source: SourceEntry): SourceEntry {
	const healed = healAndTransform(source, { transformRecords: [] });
	return applyTransforms(healed.entry, 'structural-repairs').entry;
}

/** The provenance every patch in these tranches carries. `confidence`
 * is fixed at `high` because these rows are maintainer decisions, not
 * sweep inferences, and the occurrence pair is fixed at 1 because
 * each op addresses one sense by content anchor. */
function patchProvenance(
	rid: string,
	promptVersion: string,
): Record<string, unknown> {
	return {
		confidence: 'high',
		expected_occurrences: 1,
		occurrence_index: 1,
		prompt_version: promptVersion,
		rid,
		snapshot: SNAPSHOT,
	};
}

/** A row's own keys in alphabetical order, so a generated tranche
 * reads like every swept one. Top level only: `payload`'s shape is
 * the op's, not this module's, and reordering it would churn bytes
 * for no gain. Purely cosmetic — the rows parse identically either
 * way — but a corpus where one tranche is ordered differently invites
 * a diff nobody can explain. */
function sortKeys(row: unknown): unknown {
	if (typeof row !== 'object' || row === null) {
		return row;
	}
	return Object.fromEntries(
		Object.entries(row as Record<string, unknown>).sort(([a], [b]) =>
			a.localeCompare(b),
		),
	);
}

/** One entry's patches, in apply order. */
interface SeededRow {
	patches: Record<string, unknown>[];
	rid: string;
}

/** Mint an id in the corpus-wide `P######` space. */
function patchId(n: number): string {
	return `P${String(n).padStart(6, '0')}`;
}

/** Write a tranche's `patches.jsonl` and `manifest.jsonl`, one JSON
 * object per line, and report what was written. Every row is
 * `repaired`: a generator only emits patches for rows a maintainer
 * decided, so there is no other disposition to record here. */
async function writeTranche(
	dir: string,
	rows: readonly SeededRow[],
): Promise<void> {
	const patches = rows.flatMap((row) => row.patches);
	const manifest = rows.map((row) => ({
		disposition: 'repaired',
		patches: row.patches.map((patch) => patch['id']),
		rid: row.rid,
	}));
	const write = async (name: string, list: unknown[]): Promise<void> => {
		await Bun.write(
			`${dir}/${name}`,
			`${list.map((item) => JSON.stringify(sortKeys(item))).join('\n')}\n`,
		);
	};
	await write('patches.jsonl', patches);
	await write('manifest.jsonl', manifest);
	console.log(
		`wrote ${patches.length} patches over ${rows.length} entries to ${dir}`,
	);
}

export type { SeededRow };
export { composedEntry, patchId, patchProvenance, SNAPSHOT, writeTranche };
