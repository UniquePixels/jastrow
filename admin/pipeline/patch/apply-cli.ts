#!/usr/bin/env bun
/**
 * `bun research:apply` — the dry, read-only replay of the committed
 * patch corpus (research-process plan Task 4; spec
 * docs/specs/2026-08-10-research-process-design.md §5).
 *
 * It lives beside `apply.ts` rather than inside it because it composes
 * each entry through `body/compose.ts`, and `body/compose.ts` imports
 * `apply.ts` — an entry point inside `apply.ts` would close an import
 * cycle.
 *
 * What it replays is `pipeline:migrate`'s patch-apply phase, entry for
 * entry: the accepted/carry-over corpus split, then `composeEntry`.
 * The one deliberate difference is the escalation policy —
 * `escalations: 'block'` here, because unresolved `needs_*` rows are
 * the research track's contract (Ruling D), while migration defers
 * them (spec §8). Until those escalations are resolved, preflight
 * stops the run before the entry walk begins.
 */
import process from 'node:process';
import { composeEntry, TransformFailure } from '../body/compose.ts';
import { readSourceEntries } from '../body/source.ts';
import {
	type AcceptedCorpus,
	type ApplyProblem,
	corpusPreflight,
	loadAcceptedCorpus,
	patchesByRid,
} from './apply.ts';
import { computeSnapshot } from './snapshot.ts';

if (import.meta.main) {
	// The same corpus split `migrate.ts` runs on (Ruling F): accepted
	// healed-stage patches, plus the pre-patch rows no accepted patch
	// already supersedes. The flat every-stage corpus would instead
	// judge a pre-patch anchor against the healed entry, where it
	// legitimately no longer resolves — `applyCarryOver` calls that
	// `absorbed`, not a problem.
	const corpus: AcceptedCorpus = await loadAcceptedCorpus();
	const total: number = corpus.patches.length + corpus.carryOver.length;
	const pin = `sha256:${(await computeSnapshot()).combined}`;
	// `reconcileOnly` is required because carry-over rows sit outside
	// the accepted record set — their manifest rows are pre-patch stage.
	const problems: ApplyProblem[] = corpusPreflight(
		[...corpus.patches, ...corpus.carryOver],
		corpus.records,
		pin,
		{ escalations: 'block', reconcileOnly: corpus.patches },
	);
	let applied = 0;
	let absorbed = 0;
	let carried = 0;
	if (problems.length === 0 && total > 0) {
		const accepted = patchesByRid(corpus.patches);
		const carryOver = patchesByRid(corpus.carryOver);
		for await (const source of readSourceEntries()) {
			const acceptedGroup = accepted.get(source.rid);
			const carryGroup = carryOver.get(source.rid);
			if (acceptedGroup === undefined && carryGroup === undefined) {
				continue;
			}
			accepted.delete(source.rid);
			carryOver.delete(source.rid);
			try {
				// A patch target is a content anchor over the COMPOSED entry
				// — `applyRepairs`, then `text-repairs`, then
				// `structural-repairs`. Resolving one against the pristine
				// source entry addresses text no phase of the pipeline ever
				// hands the patch corpus.
				const result = composeEntry(source, {
					accepted: acceptedGroup,
					carryOver: carryGroup,
				});
				problems.push(...result.patchProblems);
				applied += result.patchesApplied;
				absorbed += result.carryOver.absorbed.length;
				carried += result.carryOver.carried.length;
			} catch (error) {
				// `composeEntry` throws for a tripped transform gate or a
				// drifted `repairs.ts` find-text — the two are fixed in
				// different files, so the reason says which.
				problems.push({
					reason: `${error instanceof TransformFailure ? 'transform' : 'repair'}: ${error instanceof Error ? error.message : String(error)}`,
					rid: source.rid,
				});
			}
		}
		// A rid still grouped never streamed past, so it names no entry.
		// Deduped: a rid can hold both an accepted and a carry-over group.
		const missing = new Set([...accepted.keys(), ...carryOver.keys()]);
		for (const rid of missing) {
			problems.push({
				patchId: (accepted.get(rid) ?? carryOver.get(rid))?.[0]?.id,
				reason: `no source entry with rid ${rid}`,
				rid,
			});
		}
	}
	console.log(
		`corpus=${total} manifest=${corpus.records.length} applied=${applied} absorbed=${absorbed} carried=${carried} problems=${problems.length}`,
	);
	if (problems.length > 0) {
		for (const problem of problems) {
			console.error(
				`  ${problem.patchId ?? problem.rid ?? '(corpus)'}: ${problem.reason}`,
			);
		}
		process.exit(1);
	}
}
