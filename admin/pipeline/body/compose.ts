/**
 * The per-entry composer (migrate spec §5): one corpus entry through
 * the committed phase manifest's first three stages — text-repairs →
 * structural-repairs → patch-apply.
 *
 * It lives here rather than in a caller because a dry run and a write
 * run differ only in what they do with the result, so the composition
 * is stated once instead of once per caller.
 */
import {
	type ApplyProblem,
	applyCarryOver,
	applyEntryPatches,
	createPhaseTracker,
	type DriftMode,
	type PatchDrift,
} from '../patch/apply.ts';
import type { SemanticPatch } from '../patch/schema.ts';
import { RULES } from '../transform/registry.ts';
import { applyTransforms } from '../transform/run.ts';
import type { Rule, TransformRecord } from '../transform/types.ts';
import { applyRepairs, type RepairRecord } from './repairs.ts';
import type { SourceEntry } from './types.ts';

type PhaseTracker = ReturnType<typeof createPhaseTracker>;

/** A failure raised by the TRANSFORM half of `text-repairs` or by
 * `structural-repairs`, not by `repairs.ts`. The two halves fail for
 * unrelated reasons and are fixed in unrelated files — a drifted
 * literal find-text is a `repairs.ts` edit, a no-new-text or markup
 * violation is a rule bug in `transform/rules/` — so the phase that
 * failed is carried on the error rather than left for the operator to
 * guess from a message saying "repair drift". */
class TransformFailure extends Error {}

/** The `text-repairs` phase body: the general `applyRepairs` cleanup
 * first (binyan-form trimming only, corpus-wide — a rid-keyed fix is
 * a reviewed patch applied in `patch-apply` instead, spec §4.1),
 * then the corpus-correction
 * transforms second, on the healed entry (transform spec §2
 * "Placement": "Rules run after `applyRepairs`, within
 * `text-repairs`"). Transform records are pushed onto
 * `report.transformRecords` directly since `RunResult` and
 * `RepairRecord` don't share a shape the caller could merge
 * generically. `report` only needs a `transformRecords` sink — not
 * the full migration `Report` — so callers pass any object with one. */
function healAndTransform(
	source: SourceEntry,
	report: { transformRecords: TransformRecord[] },
	rules: readonly Rule[] = RULES,
): ReturnType<typeof applyRepairs> {
	const healed = applyRepairs(source);
	let transformed: ReturnType<typeof applyTransforms>;
	try {
		transformed = applyTransforms(healed.entry, 'text-repairs', rules);
	} catch (error) {
		throw new TransformFailure(
			error instanceof Error ? error.message : String(error),
		);
	}
	report.transformRecords.push(...transformed.records);
	return { entry: transformed.entry, records: healed.records };
}

/** The rid's patch sets `composeEntry` applies (spec §4.2), in
 * order: `reviewed`, then `accepted`, then `carryOver` for the same
 * rid, all in the same `patch-apply` phase. Any of the three may be
 * omitted — a caller with no corpus loaded composes with none of
 * them, as `compose.test.ts`'s fixtures do. */
interface ComposePatches {
	accepted?: readonly SemanticPatch[] | undefined;
	carryOver?: readonly SemanticPatch[] | undefined;
	/** Drift policy for both patch sets (consolidation spec §4.2).
	 * Omitted: `problem`, the research-track behaviour. */
	drift?: DriftMode | undefined;
	/** Human-authored, applied first (spec §4.2): a person's
	 * print-check repair may be a precondition for an accepted patch
	 * downstream of it. */
	reviewed?: readonly SemanticPatch[] | undefined;
}

interface ComposeResult {
	/** Carry-over disposition: patches whose defect the healed corpus
	 * already fixed (`absorbed`, dropped)
	 * vs. still present (`carried`, applied). Empty when no carry-over
	 * group was passed. */
	carryOver: { absorbed: string[]; carried: string[] };
	/** The entry after text-repairs, structural-repairs and
	 * patch-apply. */
	entry: SourceEntry;
	/** Patches skipped because their precondition no longer holds
	 * (`drift: 'outcome'` only; always empty otherwise). */
	patchDrift: PatchDrift[];
	patchesApplied: number;
	patchProblems: ApplyProblem[];
	/** The tracker with three phases recorded, so the caller can run
	 * `consumer-output` under the same ordering contract. */
	phases: PhaseTracker;
	repairRecords: RepairRecord[];
	transformRecords: TransformRecord[];
}

/** What the `patch-apply` phase leaves: the patched entry and its patch
 * accounting. */
interface PatchedEntry {
	absorbed: string[];
	applied: number;
	carried: string[];
	drifted: PatchDrift[];
	entry: SourceEntry;
	problems: ApplyProblem[];
}

/** The `patch-apply` phase: the rid's reviewed patches, then its
 * accepted patches, then its carry-over set, all under the one drift
 * policy. Kept apart from `composeEntry` so each reads as one step. */
function applyPatchSets(
	entry: SourceEntry,
	patches: ComposePatches | undefined,
): PatchedEntry {
	const reviewed = patches?.reviewed;
	const accepted = patches?.accepted;
	const carryGroup = patches?.carryOver;
	// Reviewed patches apply first: a person's print-check repair can be
	// the precondition an accepted patch's `expected_before` depends on.
	const afterReviewed =
		reviewed === undefined
			? { drifted: [] as PatchDrift[], entry, problems: [] as ApplyProblem[] }
			: applyEntryPatches(entry, reviewed, patches?.drift);
	const reviewedApplied =
		reviewed === undefined
			? 0
			: reviewed.length -
				afterReviewed.problems.length -
				afterReviewed.drifted.length;
	const afterAccepted =
		accepted === undefined
			? {
					drifted: [] as PatchDrift[],
					entry: afterReviewed.entry,
					problems: [] as ApplyProblem[],
				}
			: applyEntryPatches(afterReviewed.entry, accepted, patches?.drift);
	const acceptedApplied =
		accepted === undefined
			? 0
			: accepted.length -
				afterAccepted.problems.length -
				afterAccepted.drifted.length;
	if (carryGroup === undefined) {
		return {
			absorbed: [],
			applied: reviewedApplied + acceptedApplied,
			carried: [],
			drifted: [...afterReviewed.drifted, ...afterAccepted.drifted],
			entry: afterAccepted.entry,
			problems: [...afterReviewed.problems, ...afterAccepted.problems],
		};
	}
	const carry = applyCarryOver(afterAccepted.entry, carryGroup, patches?.drift);
	// `carry.problems` mixes two sources: a pre-check problem for a
	// patch that never joined `carried` at all, and an apply-gate
	// failure for one that did. Only the second kind should reduce
	// the carried count — subtracting the whole list can undercount
	// (or go negative) the moment a pre-check problem exists.
	const carriedIds = new Set(carry.carried);
	const carriedFailures = carry.problems.filter(
		(problem) =>
			problem.patchId !== undefined && carriedIds.has(problem.patchId),
	).length;
	return {
		absorbed: carry.absorbed,
		applied:
			reviewedApplied +
			acceptedApplied +
			carry.carried.length -
			carriedFailures,
		carried: carry.carried,
		drifted: [
			...afterReviewed.drifted,
			...afterAccepted.drifted,
			...carry.drifted,
		],
		entry: carry.entry,
		problems: [
			...afterReviewed.problems,
			...afterAccepted.problems,
			...carry.problems,
		],
	};
}

/** One entry through the first three phases of the committed manifest
 * (spec §5): the general `applyRepairs` cleanup then text rules,
 * structural rules, then the reviewed, accepted and carry-over
 * patches in that order (spec §4.2). Throws
 * `TransformFailure` for a rule that tripped its gate. Patch problems
 * are returned, not thrown: the composition still stands and the
 * caller decides whether a stale patch is fatal. */
function composeEntry(
	source: SourceEntry,
	patches: ComposePatches | undefined,
	rules: readonly Rule[] = RULES,
): ComposeResult {
	const phases = createPhaseTracker();
	const transformRecords: TransformRecord[] = [];
	const healed = phases.run('text-repairs', () =>
		healAndTransform(source, { transformRecords }, rules),
	);
	const structural = phases.run('structural-repairs', () => {
		try {
			return applyTransforms(healed.entry, 'structural-repairs', rules);
		} catch (error) {
			throw new TransformFailure(
				error instanceof Error ? error.message : String(error),
			);
		}
	});
	transformRecords.push(...structural.records);
	const patched = phases.run('patch-apply', () =>
		applyPatchSets(structural.entry, patches),
	);
	return {
		carryOver: { absorbed: patched.absorbed, carried: patched.carried },
		entry: patched.entry,
		patchDrift: patched.drifted,
		patchesApplied: patched.applied,
		patchProblems: patched.problems,
		phases,
		repairRecords: healed.records,
		transformRecords,
	};
}

export type { ComposePatches, ComposeResult, PhaseTracker };
export { composeEntry, healAndTransform, TransformFailure };
