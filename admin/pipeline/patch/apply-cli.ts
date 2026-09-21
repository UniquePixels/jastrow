#!/usr/bin/env bun
/**
 * `bun patch:replay` — the dry, read-only replay of the committed
 * patch corpus (research-process plan Task 4; spec
 * docs/archive/specs/2026-08-10-research-process-design.md §5).
 *
 * It lives beside `apply.ts` rather than inside it because it composes
 * each entry through `body/compose.ts`, and `body/compose.ts` imports
 * `apply.ts` — an entry point inside `apply.ts` would close an import
 * cycle.
 *
 * What it replays is `data:import`'s patch-apply phase, entry for
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
	loadManifest,
	loadReviewedCorpus,
	patchesByRid,
	reviewedManifestProblems,
} from './apply.ts';
import { replayGate } from './manifest.ts';
import { computeSnapshot } from './snapshot.ts';

if (import.meta.main) {
	// The same corpus split `migrate.ts` runs on (Ruling F): accepted
	// healed-stage patches, plus the pre-patch rows no accepted patch
	// already supersedes. The flat every-stage corpus would instead
	// judge a pre-patch anchor against the healed entry, where it
	// legitimately no longer resolves — `applyCarryOver` calls that
	// `absorbed`, not a problem.
	const corpus: AcceptedCorpus = await loadAcceptedCorpus();
	const reviewedCorpus = await loadReviewedCorpus();
	const total: number =
		corpus.patches.length +
		corpus.carryOver.length +
		reviewedCorpus.patches.length;
	const pin = `sha256:${(await computeSnapshot()).combined}`;
	// `reconcileOnly` is required because carry-over rows sit outside
	// the accepted record set — their manifest rows are pre-patch stage.
	// Reviewed patches join the pin/id/target checks the same way; their
	// manifest lives in the reviewed directory, not the accepted one
	// `reconcileOnly` names, so `reviewedManifestProblems` reconciles it
	// separately just below. Escalations are deferred HERE and re-checked below, wider:
	// the gate inside `corpusPreflight` reads the records it reconciles
	// against, and those are healed-stage only.
	const problems: ApplyProblem[] = corpusPreflight(
		[...reviewedCorpus.patches, ...corpus.patches, ...corpus.carryOver],
		corpus.records,
		pin,
		{ escalations: 'defer', reconcileOnly: corpus.patches },
	);
	problems.push(...reviewedManifestProblems(reviewedCorpus));
	// The replay gate is the research track's contract (Ruling D), and
	// it answers for the whole corpus, not the migrated slice. Running
	// it on `corpus.records` would drop every escalation recorded in a
	// pre-patch manifest — 130 rids of 617, measured 2026-09-10 — even
	// though this run still applies 66 pre-patch rows as carry-over.
	for (const problem of replayGate([
		...(await loadManifest()),
		...reviewedCorpus.records,
	])) {
		problems.push({ reason: `${problem.reason}: ${problem.rids.join(', ')}` });
	}
	let applied = 0;
	let absorbed = 0;
	let carried = 0;
	if (problems.length === 0 && total > 0) {
		const reviewed = patchesByRid(reviewedCorpus.patches);
		const accepted = patchesByRid(corpus.patches);
		const carryOver = patchesByRid(corpus.carryOver);
		for await (const source of readSourceEntries()) {
			const reviewedGroup = reviewed.get(source.rid);
			const acceptedGroup = accepted.get(source.rid);
			const carryGroup = carryOver.get(source.rid);
			if (
				reviewedGroup === undefined &&
				acceptedGroup === undefined &&
				carryGroup === undefined
			) {
				continue;
			}
			reviewed.delete(source.rid);
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
					reviewed: reviewedGroup,
				});
				problems.push(...result.patchProblems);
				applied += result.patchesApplied;
				absorbed += result.carryOver.absorbed.length;
				carried += result.carryOver.carried.length;
			} catch (error) {
				// `composeEntry` throws `TransformFailure` for a tripped
				// transform gate. `applyRepairs` no longer holds rid-keyed
				// find-text assertions (those moved to reviewed patches in
				// consolidation step 8, spec §4.1) and does not throw, so
				// the `'repair'` label below is dead code today; kept as the
				// fallback in case a future `applyRepairs` pass throws.
				problems.push({
					reason: `${error instanceof TransformFailure ? 'transform' : 'repair'}: ${error instanceof Error ? error.message : String(error)}`,
					rid: source.rid,
				});
			}
		}
		// A rid still grouped never streamed past, so it names no entry.
		// Deduped: a rid can hold a reviewed, an accepted, and a
		// carry-over group all at once.
		const missing = new Set([
			...reviewed.keys(),
			...accepted.keys(),
			...carryOver.keys(),
		]);
		for (const rid of missing) {
			problems.push({
				patchId: (reviewed.get(rid) ??
					accepted.get(rid) ??
					carryOver.get(rid))?.[0]?.id,
				reason: `no source entry with rid ${rid}`,
				rid,
			});
		}
	}
	console.log(
		`corpus=${total} manifest=${corpus.records.length + reviewedCorpus.records.length} applied=${applied} absorbed=${absorbed} carried=${carried} problems=${problems.length}`,
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
