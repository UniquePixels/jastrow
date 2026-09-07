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
import { existsSync } from 'node:fs';
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

/** The committed patch corpus (spec §4.4): the pilot's files plus every
 * ingested tranche's, the same set `research/tranche.ts` walks. Absent
 * files mean an empty corpus. `CORPUS_PATH`/`MANIFEST_PATH` were the
 * single-file layout nothing ever wrote; kept exported for callers that
 * pass an explicit path. */
const PILOT_DIR = 'data/patches/pilot';
const TRANCHES_DIR = 'data/patches/tranches';
const CORPUS_PATH = `${PILOT_DIR}/patches.jsonl`;
const MANIFEST_PATH = `${PILOT_DIR}/manifest.jsonl`;

/** Ingest order of the committed tranches (task-3 addendum, Ruling
 * C). A rid swept more than once keeps its LATEST record only (class
 * report §1, "latest sweep per rid"); directory names do not sort
 * chronologically (`calibration-2026-09-04` ran before
 * `batch-01-2026-09-04`), so the order is explicit, and a tranche
 * directory this list does not name is an error rather than a silent
 * guess. */
const TRANCHE_ORDER = [
	'tranche-01',
	'calibration-2026-09-04',
	'batch-01-2026-09-04',
	'batch-02-2026-09-04',
	'batch-03-2026-09-04',
	'batch-04-2026-09-05',
	'batch-05-2026-09-05',
	'residue-01',
] as const;

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

/** Every committed file with this basename: the pilot's, then each
 * tranche's in `TRANCHE_ORDER` (ingest order, not directory-name
 * order — Ruling C). A tranche directory the glob finds but
 * `TRANCHE_ORDER` does not name is an ingest bug, not a silent gap. */
async function corpusFiles(name: string): Promise<string[]> {
	const files = [`${PILOT_DIR}/${name}`];
	if (existsSync(TRANCHES_DIR)) {
		const found = new Set<string>();
		for await (const hit of new Bun.Glob(`*/${name}`).scan({
			cwd: TRANCHES_DIR,
		})) {
			found.add(hit.slice(0, hit.indexOf('/')));
		}
		for (const dir of found) {
			if (!(TRANCHE_ORDER as readonly string[]).includes(dir)) {
				throw new Error(
					`unordered tranche directory "${dir}": add it to TRANCHE_ORDER`,
				);
			}
		}
		for (const dir of TRANCHE_ORDER) {
			if (found.has(dir)) {
				files.push(`${TRANCHES_DIR}/${dir}/${name}`);
			}
		}
	}
	return files;
}

async function readLines(path: string): Promise<string[]> {
	const file = Bun.file(path);
	if (!(await file.exists())) {
		return [];
	}
	return (await file.text()).split('\n');
}

/** Load the patch corpus: one explicit file, or (no argument) every
 * committed file, pilot first then tranches in name order. Every
 * entry is deep-frozen by `parsePatchLine`. A line number in a
 * `parsePatchLine` error is per-file, not corpus-wide — the file it
 * came from is not threaded through the error message. */
async function loadCorpus(path?: string): Promise<SemanticPatch[]> {
	const files =
		path === undefined ? await corpusFiles('patches.jsonl') : [path];
	const patches: SemanticPatch[] = [];
	for (const file of files) {
		for (const [index, line] of (await readLines(file)).entries()) {
			if (line.trim() !== '') {
				patches.push(parsePatchLine(line, index + 1));
			}
		}
	}
	return patches;
}

/** Load the entry-result manifest the same way (`parseManifest` wants
 * a whole file's text, so each file's lines are rejoined before
 * parsing). */
async function loadManifest(path?: string): Promise<EntryResult[]> {
	const files =
		path === undefined ? await corpusFiles('manifest.jsonl') : [path];
	const records: EntryResult[] = [];
	for (const file of files) {
		const text = (await readLines(file)).join('\n');
		if (text.trim() !== '') {
			records.push(...parseManifest(text));
		}
	}
	return records;
}

/** Preflight policy (task-3 addendum, Ruling D). `block` (default):
 * unresolved `needs_*` rows are problems — the research-track
 * contract. `defer`: they are not; the maintainer deferred every
 * escalation to post-go-live on 2026-09-06 (class report; migrate
 * spec §8), and migration proceeds without them. */
interface PreflightOptions {
	escalations: 'block' | 'defer';
}

/**
 * Corpus-level preflight (spec §5.3): (a) every patch's snapshot pin
 * equals the current snapshot hash; (b) the corpus is internally
 * valid (unique ids, no overlapping targets); (c) the manifest lists
 * exactly the corpus patches; (d) the replay gate is open — no
 * unresolved `needs_*` rows, unless `options.escalations` is
 * `'defer'`. Reports every problem together. The per-patch
 * `expected_before` / occurrence checks live in `applyEntryPatches`,
 * where the entries stream past.
 */
function corpusPreflight(
	patches: readonly SemanticPatch[],
	records: readonly EntryResult[],
	currentPin: string,
	options: PreflightOptions = { escalations: 'block' },
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
	if (options.escalations === 'block') {
		for (const problem of replayGate(records)) {
			problems.push({
				reason: `${problem.reason}: ${problem.rids.join(', ')}`,
			});
		}
	}
	return problems;
}

/** The corpus migration applies: every committed record and patch,
 * consolidated to the latest record per rid (Ruling C). */
interface AcceptedCorpus {
	patches: SemanticPatch[];
	records: EntryResult[];
	superseded: { patches: number; records: number };
}

/** Ruling C's latest-wins consolidation, factored out pure so it can
 * be pinned against hand-built fixtures without touching disk. A rid
 * swept more than once keeps only its LATEST record (`records` is in
 * ingest order — file order matches `TRANCHE_ORDER` — so later
 * entries for a rid replace earlier ones); only the patches its
 * survivors list are kept. */
function consolidate(
	records: readonly EntryResult[],
	patches: readonly SemanticPatch[],
): AcceptedCorpus {
	const latest = new Map<string, EntryResult>();
	let supersededRecords = 0;
	for (const record of records) {
		if (latest.has(record.rid)) {
			supersededRecords++;
		}
		latest.set(record.rid, record);
	}
	const keptRecords = [...latest.values()];
	const keptIds = new Set(keptRecords.flatMap((record) => record.patches));
	const keptPatches = patches.filter((patch) => keptIds.has(patch.id));
	return {
		patches: keptPatches,
		records: keptRecords,
		superseded: {
			patches: patches.length - keptPatches.length,
			records: supersededRecords,
		},
	};
}

/** Load the accepted corpus: every committed record and patch (the
 * files `TRANCHE_ORDER` names, in that order), consolidated to the
 * latest record per rid. `loadCorpus`/`loadManifest` stay raw — the
 * research tools and the ingest overlap check need every row. */
async function loadAcceptedCorpus(): Promise<AcceptedCorpus> {
	const records = await loadManifest();
	const patches = await loadCorpus();
	return consolidate(records, patches);
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

export type { AcceptedCorpus, ApplyProblem, PhaseName, PreflightOptions };
export {
	applyEntryPatches,
	CORPUS_PATH,
	consolidate,
	corpusPreflight,
	createPhaseTracker,
	loadAcceptedCorpus,
	loadCorpus,
	loadManifest,
	MANIFEST_PATH,
	PHASE_MANIFEST,
	PhaseViolation,
	patchesByRid,
	postApplyAssertions,
};
