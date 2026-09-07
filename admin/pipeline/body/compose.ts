/**
 * The per-entry composer (entry-body-model plan Task 4 addendum;
 * migrate spec §5): one corpus entry through the committed phase
 * manifest's first three stages — text-repairs → structural-repairs →
 * patch-apply. `migrate-dry.ts` and `migrate.ts` both walk the same
 * three phases before diverging on what they do with the result (a
 * console report vs. a write), so the composition lives here once.
 */
import {
	type ApplyProblem,
	applyCarryOver,
	applyEntryPatches,
	createPhaseTracker,
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

/** The `text-repairs` phase body: literal repairs first (on pristine
 * source, so `repairs.ts`'s exactly-once find-text assertions hold),
 * then the corpus-correction transforms second, on the healed entry
 * (transform spec §2 "Placement": "Rules run after `applyRepairs`,
 * within `text-repairs`"). Transform records are pushed onto
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

/** The rid's patch sets `composeEntry` applies (Ruling F — task-3
 * addendum-3): `accepted` first, then `carryOver` for the same rid,
 * in the same `patch-apply` phase. Either or both may be omitted —
 * `migrate-dry.ts`'s pre-corpus-load callers and `compose.test.ts`'s
 * fixtures both compose with no patches at all. */
interface ComposePatches {
	accepted?: readonly SemanticPatch[] | undefined;
	carryOver?: readonly SemanticPatch[] | undefined;
}

interface ComposeResult {
	/** Carry-over disposition (task-3 addendum-3, Ruling F): patches
	 * whose defect the healed corpus already fixed (`absorbed`, dropped)
	 * vs. still present (`carried`, applied). Empty when no carry-over
	 * group was passed. */
	carryOver: { absorbed: string[]; carried: string[] };
	/** The entry after text-repairs, structural-repairs and
	 * patch-apply. */
	entry: SourceEntry;
	patchesApplied: number;
	patchProblems: ApplyProblem[];
	/** The tracker with three phases recorded, so the caller can run
	 * `consumer-output` under the same ordering contract. */
	phases: PhaseTracker;
	repairRecords: RepairRecord[];
	transformRecords: TransformRecord[];
}

/** One entry through the first three phases of the committed manifest
 * (spec §5): literal repairs then text rules, structural rules, then
 * the accepted and carry-over patches. Throws `TransformFailure` for a
 * rule that tripped its gate, a plain `Error` for a drifted
 * `repairs.ts` find-text — the two are fixed in different files. Patch
 * problems are returned, not thrown: the composition still stands and
 * the caller decides whether a stale patch is fatal. */
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
	const accepted = patches?.accepted;
	const carryGroup = patches?.carryOver;
	const patched = phases.run('patch-apply', () => {
		const afterAccepted =
			accepted === undefined
				? { entry: structural.entry, problems: [] as ApplyProblem[] }
				: applyEntryPatches(structural.entry, accepted);
		const acceptedApplied =
			accepted === undefined
				? 0
				: accepted.length - afterAccepted.problems.length;
		if (carryGroup === undefined) {
			return {
				absorbed: [] as string[],
				applied: acceptedApplied,
				carried: [] as string[],
				entry: afterAccepted.entry,
				problems: afterAccepted.problems,
			};
		}
		const carry = applyCarryOver(afterAccepted.entry, carryGroup);
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
			applied: acceptedApplied + carry.carried.length - carriedFailures,
			carried: carry.carried,
			entry: carry.entry,
			problems: [...afterAccepted.problems, ...carry.problems],
		};
	});
	return {
		carryOver: { absorbed: patched.absorbed, carried: patched.carried },
		entry: patched.entry,
		patchesApplied: patched.applied,
		patchProblems: patched.problems,
		phases,
		repairRecords: healed.records,
		transformRecords,
	};
}

export type { ComposePatches, ComposeResult, PhaseTracker };
export { composeEntry, healAndTransform, TransformFailure };
