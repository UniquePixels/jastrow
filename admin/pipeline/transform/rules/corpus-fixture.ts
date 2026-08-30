/**
 * The composed corpus, built ONCE for every corpus-tier test in this
 * directory.
 *
 * ## Why this exists
 *
 * Every corpus test needs the same starting point:
 * `applyTransforms(applyRepairs(source).entry, 'text-repairs').entry`
 * over all 32,512 entries — the entry the `structural-repairs` phase
 * receives. Building it means reading the snapshot and running 40 rules
 * across the whole corpus, and it is by far the most expensive thing
 * any of these files does.
 *
 * Batch 7 added four corpus files, each building it again. On CI —
 * slower than a laptop — the `Test` job reached 19m40s and was killed
 * mid-file, having passed every assertion it reached. Nothing was
 * wrong with the tests; there were simply four redundant copies of one
 * expensive pass.
 *
 * `bun test` runs the files of a run in ONE process, so a module-level
 * memo is shared across them: the first file to ask pays, the rest are
 * free. That is the whole mechanism.
 *
 * ## The contract callers depend on
 *
 * The returned array is SHARED, and `applyTransforms` treats entries as
 * immutable (`types.ts` `Rule.apply`), so a caller that mutates one
 * corrupts every later file in the run. Read it; do not write to it.
 * Rules take it as input and return new objects, which is the normal
 * use and is safe.
 *
 * A test that needs a DIFFERENT stage — the raw source, or the
 * structural phase with some rule held out — builds that itself from
 * this one rather than re-reading the snapshot.
 */
import { applyRepairs } from '../../body/repairs.ts';
import { readSourceEntries } from '../../body/source.ts';
import type { SourceEntry } from '../../body/types.ts';
import { applyTransforms } from '../run.ts';

let sourceMemo: readonly SourceEntry[] | undefined;
let repairedMemo: readonly SourceEntry[] | undefined;
let composedMemo: readonly SourceEntry[] | undefined;

/** Every entry of the pinned snapshot, unrepaired and untransformed. */
async function sourceEntries(): Promise<readonly SourceEntry[]> {
	if (sourceMemo === undefined) {
		const entries: SourceEntry[] = [];
		for await (const entry of readSourceEntries()) {
			entries.push(entry);
		}
		sourceMemo = entries;
	}
	return sourceMemo;
}

/** Every entry after `applyRepairs` and before any transform — the
 * stage a row's population must be counted at, per
 * [[feedback_measure_post_repairs]]. */
async function repairedEntries(): Promise<readonly SourceEntry[]> {
	if (repairedMemo === undefined) {
		const source = await sourceEntries();
		repairedMemo = source.map((entry) => applyRepairs(entry).entry);
	}
	return repairedMemo;
}

/** Every entry as the `structural-repairs` phase receives it: repaired,
 * then run through the whole `text-repairs` phase. */
async function composedEntries(): Promise<readonly SourceEntry[]> {
	if (composedMemo === undefined) {
		const repaired = await repairedEntries();
		composedMemo = repaired.map(
			(entry) => applyTransforms(entry, 'text-repairs').entry,
		);
	}
	return composedMemo;
}

export { composedEntries, repairedEntries, sourceEntries };
