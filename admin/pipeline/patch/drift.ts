/**
 * Patch drift (consolidation spec §3.3, §4.2): a patch whose
 * precondition — its target resolving `expected_occurrences` times —
 * no longer holds on the entry it meets. Sefaria correcting an entry is
 * the expected cause; the run reports the patch rather than refusing.
 *
 * `upstream-fixed` is claimed only when it can be shown: the target is
 * gone entirely AND the senses the patch would have produced are
 * present, number and definition both. Everything else is
 * `upstream-changed` and goes to a person to re-judge — a wrong "fixed"
 * archives a patch that was still needed, a wrong "changed" costs one
 * look. A multi-occurrence patch (`expected_occurrences > 1`) is never
 * called `upstream-fixed`: a real fix of one occurrence still leaves
 * `expected − 1` pre-state matches, so `found === 0` there means every
 * occurrence changed, not that the fix landed.
 */
import type { SourceEntry, SourceSense } from '../body/types.ts';
import {
	applyPatch,
	countTarget,
	PatchApplyError,
	parseTarget,
	type SemanticPatch,
	walkSenses,
} from './schema.ts';

type DriftOutcome = 'upstream-changed' | 'upstream-fixed';

/** The senses a patch leaves where its target stood, computed by
 * applying it to an entry holding only that target. `undefined` when
 * the patch removes the sense outright (nothing to look for) or cannot
 * apply even to its own `expected_before`. */
function postState(patch: SemanticPatch): SourceSense[] | undefined {
	if (patch.op === 'unref') {
		// unref addresses refs[…], not a sense — nothing to look for.
		return;
	}
	const { token } = parseTarget(patch.target);
	const sense: SourceSense =
		token === ''
			? { definition: patch.expected_before }
			: { definition: patch.expected_before, number: token };
	const alone: SourceEntry = {
		content: { senses: [sense] },
		headword: '',
		rid: patch.rid,
	};
	try {
		const after = applyPatch(alone, {
			...patch,
			expected_occurrences: 1,
			occurrence_index: 1,
		});
		return after.content.senses.length === 0 ? undefined : after.content.senses;
	} catch (error) {
		if (error instanceof PatchApplyError) {
			return;
		}
		throw error;
	}
}

function sameSense(a: SourceSense, b: SourceSense): boolean {
	return (
		(a.number ?? '') === (b.number ?? '') &&
		(a.definition ?? '') === (b.definition ?? '')
	);
}

/** Whether `run` appears as consecutive siblings anywhere in the tree. */
function holdsRun(entry: SourceEntry, run: readonly SourceSense[]): boolean {
	for (const { index, siblings } of walkSenses(entry)) {
		const matches = run.every((want, k) => {
			const got = siblings[index + k];
			return got !== undefined && sameSense(got, want);
		});
		if (matches) {
			return true;
		}
	}
	return false;
}

/** `undefined` when the patch's precondition holds on `entry`;
 * otherwise which kind of drift it is. */
function classifyDrift(
	entry: SourceEntry,
	patch: SemanticPatch,
): DriftOutcome | undefined {
	const found = countTarget(entry, patch);
	if (found === patch.expected_occurrences) {
		return;
	}
	if (found !== 0 || patch.expected_occurrences !== 1) {
		return 'upstream-changed';
	}
	const after = postState(patch);
	return after !== undefined && holdsRun(entry, after)
		? 'upstream-fixed'
		: 'upstream-changed';
}

export type { DriftOutcome };
export { classifyDrift };
