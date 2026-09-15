/** Patch accounting for the migrate CLI (consolidation spec §3.3,
 * §4.2): the per-entry outcome rows a run's offered patches resolve
 * to, and the fault rows for a patch whose rid never streamed past. */
import type { ComposeResult } from '../body/compose.ts';
import type { DriftMode } from '../patch/apply.ts';
import type { DriftOutcome } from '../patch/drift.ts';
import type { SemanticPatch } from '../patch/schema.ts';
import { mark } from './gates.ts';
import type { Report } from './report.ts';

/** The rid-grouped patch sets `composeOne` applies (Ruling F), and the
 * drift policy they apply under. */
interface PatchGroups {
	accepted: Map<string, SemanticPatch[]>;
	carryOver: Map<string, SemanticPatch[]>;
	drift: DriftMode;
}

const DRIFT_DETAIL: Record<DriftOutcome, string> = {
	'upstream-changed': 'the source changed under this patch; re-judge it',
	'upstream-fixed':
		'the source already reads as this patch leaves it; archive the patch',
};

/** One outcome row per patch this entry was offered (spec §3.3). A
 * drifted patch is also a review row and a header count; a patch that
 * failed its apply gate gets no outcome — it is a fault row instead. */
function recordPatchOutcomes(
	rid: string,
	offered: readonly SemanticPatch[],
	result: ComposeResult,
	report: Report,
): void {
	const failed = new Set(result.patchProblems.map((p) => p.patchId));
	const drifted = new Map(result.patchDrift.map((d) => [d.patchId, d.outcome]));
	const absorbed = new Set(result.carryOver.absorbed);
	for (const patch of offered) {
		const drift = drifted.get(patch.id);
		if (drift !== undefined) {
			report.patchOutcomes.push({ outcome: drift, patchId: patch.id, rid });
			report.rows.push({
				bucket: 'patch',
				detail: `${patch.id} (${patch.defect_class}): ${DRIFT_DETAIL[drift]}`,
				kind: drift,
				rid,
				severity: 'review',
			});
			if (drift === 'upstream-fixed') {
				report.patches.upstreamFixed++;
			} else {
				report.patches.upstreamChanged++;
			}
		} else if (absorbed.has(patch.id)) {
			report.patchOutcomes.push({
				outcome: 'superseded',
				patchId: patch.id,
				rid,
			});
		} else if (!failed.has(patch.id)) {
			report.patchOutcomes.push({ outcome: 'applied', patchId: patch.id, rid });
		}
	}
}

/** A patch whose rid never streamed past targets a nonexistent entry.
 * Recorded on gate 9 rather than thrown, so the report lists it beside
 * every other composition problem — and as a `## Pipeline faults` row
 * too, so a red gate 9 from this cause is never a silent skip
 * (consolidation spec §3.1, §4.2). Call after the streaming loop, once
 * `groups` holds only rids that never appeared. */
function markMissingTargets(groups: PatchGroups, report: Report): void {
	const missing = new Set([
		...groups.accepted.keys(),
		...groups.carryOver.keys(),
	]);
	for (const rid of missing) {
		mark(report.gates.composition, false, `no source entry with rid ${rid}`);
		const ids = [
			...(groups.accepted.get(rid) ?? []),
			...(groups.carryOver.get(rid) ?? []),
		].map((p) => p.id);
		report.rows.push({
			bucket: 'pipeline',
			detail: `${ids.join(', ')}: no source entry with this rid`,
			kind: 'patch-target-missing',
			rid,
			severity: 'fault',
		});
	}
}

export type { PatchGroups };
export { DRIFT_DETAIL, markMissingTargets, recordPatchOutcomes };
