#!/usr/bin/env bun
/**
 * Patch apply engine + phase manifest (research-process plan Task 4;
 * spec docs/specs/2026-08-10-research-process-design.md §5).
 *
 * Preflight first, then write: the corpus-level checks (snapshot
 * pin, corpus validity, manifest reconciliation, replay gate) run
 * before any entry is touched and report **all** problems together —
 * never just the first. Per-entry application chains a rid's patches
 * in committed corpus order; every apply is followed by a round-trip
 * re-parse assertion and the no-new-text validator (the cheap floor,
 * spec §4.3).
 *
 * The phase manifest is the committed pipeline order (spec §5.2):
 * marker/text passes → structural repairs → patch apply →
 * consumer-facing output. `createPhaseTracker` asserts that order at
 * runtime; a violated assertion aborts the run (`PhaseViolation`).
 *
 * Run (dry, read-only): bun research:apply
 */
import process from 'node:process';
import { readSourceEntries } from '../body/source.ts';
import type { SourceEntry } from '../body/types.ts';
import {
	type EntryResult,
	parseManifest,
	reconcilePatches,
	replayGate,
} from '../research/manifest.ts';
import { validateNoNewText } from './no-new-text.ts';
import {
	applyPatch,
	PatchApplyError,
	PatchFormatError,
	parsePatchLine,
	parseTarget,
	resolveTarget,
	type SemanticPatch,
	validateCorpus,
} from './schema.ts';
import { computeSnapshot } from './snapshot.ts';

/** The committed patch corpus and its entry-result manifest
 * (spec §4.4) — absent files mean an empty corpus. */
const CORPUS_PATH = 'data/patches/patches.jsonl';
const MANIFEST_PATH = 'data/patches/manifest.jsonl';

/**
 * The committed ordered phase manifest (spec §5.2). Marker/text
 * passes run before structural repairs (the S1 contract — reinserted
 * markers must be in-text before any split), structural repairs
 * complete before the patch corpus applies, and everything precedes
 * consumer-facing output.
 */
const PHASE_MANIFEST = [
	{ name: 'text-repairs', requires: [] },
	{ name: 'structural-repairs', requires: ['text-repairs'] },
	{ name: 'patch-apply', requires: ['text-repairs', 'structural-repairs'] },
	{
		name: 'consumer-output',
		requires: ['text-repairs', 'structural-repairs', 'patch-apply'],
	},
] as const;

type PhaseName = (typeof PHASE_MANIFEST)[number]['name'];

/** A pipeline stage ran out of the committed order. */
class PhaseViolation extends Error {
	constructor(message: string) {
		super(message);
		this.name = 'PhaseViolation';
	}
}

/** Order-enforcing wrapper around the pipeline stages. */
interface PhaseTracker {
	run<T>(name: PhaseName, work: () => T): T;
}

/** Runtime enforcement of the phase manifest: each `run` asserts its
 * phase exists, follows the last one in manifest order, and has every
 * prerequisite completed. One tracker per unit of work (per entry in
 * the migration walk). */
function createPhaseTracker(
	manifest: typeof PHASE_MANIFEST = PHASE_MANIFEST,
): PhaseTracker {
	const completed = new Set<string>();
	let lastIndex = -1;
	return {
		run<T>(name: PhaseName, work: () => T): T {
			const index = manifest.findIndex((phase) => phase.name === name);
			if (index === -1) {
				throw new PhaseViolation(`unknown phase "${name}"`);
			}
			if (index <= lastIndex) {
				throw new PhaseViolation(
					`phase "${name}" ran after "${manifest[lastIndex]?.name}" — manifest order is ${manifest.map((p) => p.name).join(' → ')}`,
				);
			}
			const missing = manifest[index]?.requires.filter(
				(dep) => !completed.has(dep),
			);
			if (missing !== undefined && missing.length > 0) {
				throw new PhaseViolation(
					`phase "${name}" requires incomplete phase(s): ${missing.join(', ')}`,
				);
			}
			const result = work();
			completed.add(name);
			lastIndex = index;
			return result;
		},
	};
}

/** One apply-time problem, attributed to a patch when one is at
 * fault. */
interface ApplyProblem {
	patchId?: string | undefined;
	reason: string;
	rid?: string | undefined;
}

/** Load the committed patch corpus (empty when the file does not
 * exist yet — no tranche has landed). */
async function loadCorpus(
	path: string = CORPUS_PATH,
): Promise<SemanticPatch[]> {
	const file = Bun.file(path);
	if (!(await file.exists())) {
		return [];
	}
	const patches: SemanticPatch[] = [];
	const lines = (await file.text()).split('\n');
	for (const [index, line] of lines.entries()) {
		if (line.trim() !== '') {
			patches.push(parsePatchLine(line, index + 1));
		}
	}
	return patches;
}

/** Load the entry-result manifest (empty when absent). */
async function loadManifest(
	path: string = MANIFEST_PATH,
): Promise<EntryResult[]> {
	const file = Bun.file(path);
	if (!(await file.exists())) {
		return [];
	}
	return parseManifest(await file.text());
}

/**
 * Corpus-level preflight (spec §5.3): (a) every patch's snapshot pin
 * equals the current snapshot hash; (b) the corpus is internally
 * valid (unique ids, no overlapping targets); (c) the manifest lists
 * exactly the corpus patches; (d) the replay gate is open — no
 * unresolved `needs_*` rows. Reports every problem together. The
 * per-patch `expected_before` / occurrence checks live in
 * `applyEntryPatches`, where the entries stream past.
 */
function corpusPreflight(
	patches: readonly SemanticPatch[],
	records: readonly EntryResult[],
	currentPin: string,
): ApplyProblem[] {
	const problems: ApplyProblem[] = [];
	for (const patch of patches) {
		if (patch.snapshot !== currentPin) {
			problems.push({
				patchId: patch.id,
				reason: `snapshot pin ${patch.snapshot} does not match current ${currentPin} — maintenance-track rebase required (spec §6)`,
				rid: patch.rid,
			});
		}
	}
	for (const problem of validateCorpus(patches)) {
		problems.push({
			patchId: problem.patchIds[0],
			reason: problem.reason,
		});
	}
	for (const problem of reconcilePatches(records, patches)) {
		problems.push({ reason: problem.reason, rid: problem.rids[0] });
	}
	for (const problem of replayGate(records)) {
		problems.push({ reason: `${problem.reason}: ${problem.rids.join(', ')}` });
	}
	return problems;
}

/** Round-trip re-parse assertion (spec §4.3): the patched entry must
 * survive JSON serialization unchanged, and the patch's pre-state
 * target address must no longer resolve to its old count — an apply
 * that left the target byte-identical repaired nothing. */
function postApplyAssertions(after: SourceEntry, patch: SemanticPatch): void {
	const reparsed = JSON.parse(JSON.stringify(after)) as SourceEntry;
	if (JSON.stringify(reparsed) !== JSON.stringify(after)) {
		throw new PatchApplyError(
			patch.id,
			'round-trip re-parse changed the entry — non-JSON-safe structure',
		);
	}
	const stale = resolveTarget(after, parseTarget(patch.target));
	if (stale.length !== patch.expected_occurrences - 1) {
		throw new PatchApplyError(
			patch.id,
			`after apply, the pre-state target still resolves ${stale.length} time(s); expected ${patch.expected_occurrences - 1} — the apply did not change its target`,
		);
	}
}

/** Apply one rid's patches in committed corpus order, chaining state.
 * Every problem is recorded (the failing patch is skipped, later
 * patches still try against the last good state) so a run reports
 * all drift at once. */
function applyEntryPatches(
	entry: SourceEntry,
	patches: readonly SemanticPatch[],
): { entry: SourceEntry; problems: ApplyProblem[] } {
	let current = entry;
	const problems: ApplyProblem[] = [];
	for (const patch of patches) {
		try {
			const next = applyPatch(current, patch);
			postApplyAssertions(next, patch);
			const verdict = validateNoNewText(patch, current, next);
			if (!verdict.ok) {
				problems.push({
					patchId: patch.id,
					reason: `${verdict.reason} — entry re-dispositions ${verdict.redisposition}`,
					rid: patch.rid,
				});
				continue;
			}
			current = next;
		} catch (error) {
			if (
				error instanceof PatchApplyError ||
				error instanceof PatchFormatError
			) {
				problems.push({
					patchId: patch.id,
					reason: error.message,
					rid: patch.rid,
				});
				continue;
			}
			throw error;
		}
	}
	return { entry: current, problems };
}

/** Group a corpus by rid, preserving committed order within each
 * group. */
function patchesByRid(
	patches: readonly SemanticPatch[],
): Map<string, SemanticPatch[]> {
	const groups = new Map<string, SemanticPatch[]>();
	for (const patch of patches) {
		const group = groups.get(patch.rid);
		if (group === undefined) {
			groups.set(patch.rid, [patch]);
		} else {
			group.push(patch);
		}
	}
	return groups;
}

if (import.meta.main) {
	const patches = await loadCorpus();
	const records = await loadManifest();
	const pin = `sha256:${(await computeSnapshot()).combined}`;
	const problems = corpusPreflight(patches, records, pin);
	let applied = 0;
	if (problems.length === 0 && patches.length > 0) {
		const groups = patchesByRid(patches);
		for await (const entry of readSourceEntries()) {
			const group = groups.get(entry.rid);
			if (group === undefined) {
				continue;
			}
			groups.delete(entry.rid);
			const result = applyEntryPatches(entry, group);
			problems.push(...result.problems);
			applied += group.length - result.problems.length;
		}
		for (const [rid, group] of groups) {
			problems.push({
				patchId: group[0]?.id,
				reason: `no source entry with rid ${rid}`,
				rid,
			});
		}
	}
	console.log(
		`corpus=${patches.length} manifest=${records.length} applied=${applied} problems=${problems.length}`,
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

export type { ApplyProblem, PhaseName };
export {
	applyEntryPatches,
	CORPUS_PATH,
	corpusPreflight,
	createPhaseTracker,
	loadCorpus,
	loadManifest,
	MANIFEST_PATH,
	PHASE_MANIFEST,
	PhaseViolation,
	patchesByRid,
	postApplyAssertions,
};
