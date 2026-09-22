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
 *
 * Two ops leave no sense run to look for, so their post-state is
 * stated directly: `unref`'s is the item's absence (its target IS the
 * item, so `found === 0` is the fix), and `join`'s is its token and
 * text folded into a neighbour — some definition ending with, or
 * holding exactly once, `token + expected_before`.
 */
import type { SourceEntry, SourceSense } from '../types.ts';
import {
	applyPatch,
	countOccurrences,
	countTarget,
	formsBlock,
	PatchApplyError,
	parseTarget,
	type SemanticPatch,
	walkSenses,
} from './schema.ts';

/** What `classifyDrift` concluded about a patch whose precondition no
 * longer holds — the two outcomes are not symmetric.
 * `upstream-fixed` is a claim that the repair already landed, and it
 * is made only when the post-state can be seen in the entry;
 * `upstream-changed` is the default, and means a person re-judges the
 * patch. The asymmetry is the point: a wrong "fixed" archives a patch
 * that was still needed, a wrong "changed" costs one look. */
type DriftOutcome = 'upstream-changed' | 'upstream-fixed';

/** The senses a patch leaves where its target stood, computed by
 * applying it to an entry holding only that target. `undefined` when
 * the patch removes the sense outright (nothing to look for) or cannot
 * apply even to its own `expected_before`. Not called for `unref` or
 * `join` — `classifyDrift` states their post-states directly. */
function postState(patch: SemanticPatch): SourceSense[] | undefined {
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

/** Whether a join's folded text — its token followed by its
 * definition — stands exactly once across the entry's definitions.
 * Two copies leave it ambiguous which one is the fold, so that reads
 * as changed, not fixed. */
function holdsFold(entry: SourceEntry, patch: SemanticPatch): boolean {
	const folded = parseTarget(patch.target).token + patch.expected_before;
	let found = 0;
	for (const { sense } of walkSenses(entry)) {
		found += countOccurrences(sense.definition ?? '', folded);
	}
	return found === 1;
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
	if (patch.op === 'unref') {
		return 'upstream-fixed';
	}
	if (patch.op === 'reform') {
		// The headword block moved. Upstream FIXED it only if the block
		// now reads exactly as this patch would have written it;
		// anything else is a change we have not seen.
		const written = patch.payload.forms.join('\n');
		return formsBlock(entry) === written
			? 'upstream-fixed'
			: 'upstream-changed';
	}
	if (patch.op === 'join') {
		return holdsFold(entry, patch) ? 'upstream-fixed' : 'upstream-changed';
	}
	const after = postState(patch);
	return after !== undefined && holdsRun(entry, after)
		? 'upstream-fixed'
		: 'upstream-changed';
}

export type { DriftOutcome };
export { classifyDrift };
