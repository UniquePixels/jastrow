/**
 * The accepted patch corpus, loaded and consolidated the way
 * migrate-dry and migrate load it (Ruling E — task-3 addendum-2:
 * migration accepts HEALED-stage tranches only, pilot and tranche-01
 * are pre-patch and excluded from `patches` outright; Ruling C — task-3
 * addendum: a rid swept more than once keeps only its latest tranche's
 * record; Ruling F — task-3 addendum-3: a pre-patch patch whose defect
 * is NOT absorbed by the healed corpus is carried over and applied,
 * unless an accepted patch already targets the same (rid, target)),
 * applied to the entry each patch targets at the phase it targets,
 * with the replay gate deferred (Ruling D — 2026-09-06 maintainer
 * decision, class report; migrate spec §8).
 *
 * Measured 2026-09-07 against data/patches/pilot +
 * data/patches/tranches/*: 91 raw patches, 2760 raw manifest records.
 * Of those, 67 patches / 1710 records are pre-patch stage (pilot +
 * tranche-01, Ruling E). The remaining 24 healed-stage patches / 1050
 * healed-stage records consolidate (Ruling C) to 14 accepted patches /
 * 723 accepted records (10 patches / 327 records superseded by a later
 * sweep of the same rid). Of the 67 pre-patch patches, 1 overlaps an
 * accepted patch's (rid, target) and is dropped (Ruling F); the other
 * 66 carry over, and against the healed corpus 61 are absorbed (the
 * defect is gone — a transform rule already fixed it) and 5 are
 * carried (P000018 A00515, P000025 A00633, P000027 A00675, P000031
 * A00785, P000050 A01252 — repairs the healed corpus still needs).
 * These numbers are a claim about the repository: they move when a
 * tranche is ingested, and whoever ingests one re-pins them here.
 */
import { expect, it } from 'bun:test';
import { composedEntries } from '../transform/rules/corpus-fixture.ts';
import { applyTransforms } from '../transform/run.ts';
import {
	applyCarryOver,
	applyEntryPatches,
	corpusPreflight,
	loadAcceptedCorpus,
	loadCorpus,
	loadManifest,
	patchesByRid,
} from './apply.ts';
import { computeSnapshot } from './snapshot.ts';

/** Was 14 patches / 723 records until 2026-09-09. The doc-08 seed
 * tranche is healed-stage, so all of it is accepted: +58 patches and
 * +28 records. 58 rather than 56 because a row's patch count is not
 * fixed — 26 rows take a split/retag pair, and `C00805` and `I00111`
 * take one split per marker in the run their `—2)` opens. See
 * `patch/seed-implied-one.ts` and `docs/v2/phase-2-swallowed-runs.md`.
 *
 * Was 72 / 751 until later on 2026-09-10, when the maintainer
 * confirmed six more swallowed-run rows: `SEED_CONFIRMED` went 28 ->
 * 34, the tranche 58 -> 79 patches, so +21 patches and +6 records.
 */
const ACCEPTED_PATCHES = 93;
const ACCEPTED_RECORDS = 757;
const SUPERSEDED_PATCHES = 10;
const SUPERSEDED_RECORDS = 327;
const PRE_PATCH_PATCHES = 67;
const PRE_PATCH_RECORDS = 1710;
const PRE_PATCH_OVERLAPPING = 1;
const CARRY_OVER = 66;
const ABSORBED = 61;
const CARRIED = 5;
const CARRIED_IDS = ['P000018', 'P000025', 'P000027', 'P000031', 'P000050'];
/** Was 91 patches / 2,760 records until 2026-09-09, when the doc-08
 * seed tranche seeded its 28 confirmed implied-`1)` rows: +58 patches
 * and +28 manifest records, both arithmetic consequences of
 * `patch/seed-implied-one.ts`'s committed `SEED_CONFIRMED` list rather
 * than a corpus movement. Was +56 until 2026-09-10, when the two rows
 * whose run continues past `—2)` gained a split apiece, and +79 later
 * that day when six more confirmed rows joined `SEED_CONFIRMED`. */
const RAW_PATCHES = 170;
const RAW_RECORDS = 2794;

it('loads and consolidates the accepted (healed-stage) corpus, applying it cleanly', async () => {
	const accepted = await loadAcceptedCorpus();
	expect(accepted.patches).toHaveLength(ACCEPTED_PATCHES);
	expect(accepted.records).toHaveLength(ACCEPTED_RECORDS);
	expect(accepted.carryOver).toHaveLength(CARRY_OVER);
	expect(accepted.superseded).toEqual({
		patches: SUPERSEDED_PATCHES,
		records: SUPERSEDED_RECORDS,
		prePatch: {
			patches: PRE_PATCH_PATCHES,
			records: PRE_PATCH_RECORDS,
			overlapping: PRE_PATCH_OVERLAPPING,
		},
	});
	const pin = `sha256:${(await computeSnapshot()).combined}`;
	expect(
		corpusPreflight(
			[...accepted.patches, ...accepted.carryOver],
			accepted.records,
			pin,
			{ escalations: 'defer', reconcileOnly: accepted.patches },
		),
	).toEqual([]);
	const byRid = new Map(
		(await composedEntries()).map((entry) => [entry.rid, entry]),
	);
	let applied = 0;
	const problems: string[] = [];
	for (const [rid, group] of patchesByRid(accepted.patches)) {
		const composed = byRid.get(rid);
		if (composed === undefined) {
			throw new Error(`patch targets no entry: ${rid}`);
		}
		const structural = applyTransforms(composed, 'structural-repairs').entry;
		const result = applyEntryPatches(structural, group);
		applied += group.length - result.problems.length;
		problems.push(
			...result.problems.map((p) => `${p.patchId ?? rid}: ${p.reason}`),
		);
	}
	expect(problems).toEqual([]);
	expect(applied).toBe(ACCEPTED_PATCHES);
});

it('carry-over: absorbed patches are dropped, unabsorbed patches carry and apply cleanly (Ruling F)', async () => {
	// Ruling E excludes pre-patch tranches wholesale; Ruling F refines
	// that: a pre-patch patch whose defect a transform rule already
	// fixed is absorbed and dropped, but one whose defect is still
	// present is a repair the healed corpus still needs, and is carried
	// over and applied. This walks every carry-over patch through
	// `applyCarryOver` — the same pre-state resolver `applyPatch` uses —
	// against the healed entry, and proves the split is exactly what was
	// measured: nothing unaccounted, and the carried patches apply with
	// zero problems.
	const accepted = await loadAcceptedCorpus();
	expect(accepted.carryOver).toHaveLength(CARRY_OVER);
	const byRid = new Map(
		(await composedEntries()).map((entry) => [entry.rid, entry]),
	);
	let absorbed = 0;
	let carried = 0;
	const carriedIds: string[] = [];
	const problems: string[] = [];
	for (const [rid, group] of patchesByRid(accepted.carryOver)) {
		const composed = byRid.get(rid);
		if (composed === undefined) {
			throw new Error(`patch targets no entry: ${rid}`);
		}
		const healed = applyTransforms(composed, 'structural-repairs').entry;
		const result = applyCarryOver(healed, group);
		absorbed += result.absorbed.length;
		carried += result.carried.length;
		carriedIds.push(...result.carried);
		problems.push(
			...result.problems.map((p) => `${p.patchId ?? rid}: ${p.reason}`),
		);
	}
	expect(problems).toEqual([]);
	expect(absorbed).toBe(ABSORBED);
	expect(carried).toBe(CARRIED);
	expect(carriedIds.sort()).toEqual(CARRIED_IDS);
	expect(absorbed + carried + accepted.superseded.prePatch.overlapping).toBe(
		accepted.superseded.prePatch.patches,
	);
});

it('pins the raw (every-stage) corpus and manifest counts', async () => {
	expect(await loadCorpus()).toHaveLength(RAW_PATCHES);
	expect(await loadManifest()).toHaveLength(RAW_RECORDS);
});
