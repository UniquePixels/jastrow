#!/usr/bin/env bun
// biome-ignore-all lint/style/noExcessiveLinesPerFile: the apply engine and its phase manifest; the manifest IS the order the engine asserts.
/**
 * Patch apply engine + phase manifest (spec
 * docs/archive/specs/2026-08-10-research-process-design.md §5).
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
 * `bun data:import`'s `preparePatches` (`migrate.ts`) is the one
 * consumer of the corpus split and preflight built here. The dry,
 * read-only replay that used to exercise this module on its own —
 * `bun patch:replay`, `patch/apply-cli.ts` — was deleted 2026-09-22
 * (Brian's ruling): it duplicated import's own preflight and could
 * not complete on the corpus, blocking on the ~600 `needs_*`
 * escalations import deliberately defers.
 */
import { existsSync } from 'node:fs';
import type { SourceEntry } from '../types.ts';
import { classifyDrift, type DriftOutcome } from './drift.ts';
import {
	type EntryResult,
	isNeeds,
	parseManifest,
	reconcilePatches,
	replayGate,
} from './manifest.ts';
import { validateNoNewText } from './no-new-text.ts';
import {
	applyPatch,
	countTarget,
	PatchApplyError,
	PatchFormatError,
	parsePatchLine,
	type SemanticPatch,
	validateCorpus,
} from './schema.ts';

/** The committed patch corpus (spec §4.4): the pilot's files plus
 * every ingested tranche's. Absent files mean an empty corpus. */
const PILOT_DIR = 'data/patches/pilot';
const TRANCHES_DIR = 'data/patches/tranches';

/** Human-authored patches (consolidation spec §4.2). Kept out of
 * `TRANCHES` on purpose: consolidation keeps one manifest record per
 * rid, and 11 reviewed rids also have agent records. */
const REVIEWED_DIR = 'data/patches/reviewed';

/** What `loadReviewedCorpus` finds in a reviewed patch directory: the
 * human-authored patches, the findings a person flagged without
 * repairing, and the manifest rows behind both.
 *
 * `records` is carried alongside `deferred` rather than being
 * discarded once the `needs_*` rows are filtered out, because a
 * reviewed patch may add bytes the no-new-text floor would otherwise
 * refuse. `reviewedManifestProblems` needs the full row set to show
 * that each such patch is accounted for by exactly one record before
 * any of them applies. */
interface ReviewedCorpus {
	/** `needs_*` records: items a person has flagged and not repaired. */
	deferred: EntryResult[];
	patches: SemanticPatch[];
	/** Every manifest record, for `reviewedManifestProblems`. */
	records: EntryResult[];
}

/** Load the reviewed patch group (consolidation spec §4.2): every
 * patch in `<dir>/patches.jsonl`, stamped `author: 'human'` so
 * `applyEntryPatches` exempts it from the no-new-text floor, and the
 * `needs_*` rows of `<dir>/manifest.jsonl` as `deferred` — findings a
 * person flagged but did not repair — with every row as `records`, for
 * `reviewedManifestProblems`. A missing directory returns an empty
 * corpus. */
async function loadReviewedCorpus(dir = REVIEWED_DIR): Promise<ReviewedCorpus> {
	const patches = (await loadCorpus(`${dir}/patches.jsonl`)).map((patch) => ({
		...patch,
		author: 'human' as const,
	}));
	const records = await loadManifest(`${dir}/manifest.jsonl`);
	return {
		deferred: records.filter((r) => isNeeds(r.disposition)),
		patches,
		records,
	};
}

/** Reconcile the reviewed manifest against the reviewed patches: every
 * patch listed exactly once, under its own rid, and every listed id
 * present. A reviewed patch applies first and may add bytes, so one
 * that no record accounts for must not apply unflagged. Shared by
 * `migrate.ts` and `apply-cli.ts` preflight. */
function reviewedManifestProblems(corpus: ReviewedCorpus): ApplyProblem[] {
	return reconcilePatches(corpus.records, corpus.patches).map((problem) => ({
		reason: `reviewed manifest: ${problem.reason}`,
		rid: problem.rids[0],
	}));
}

/** The corpus stage a tranche was swept at. `pre-patch`: swept
 * against `applyRepairs` output only, before any transform rule
 * existed, so its anchors are authored against text the rules later
 * rewrote and it re-reports defects they already fixed. `healed`:
 * swept against both `text-repairs` and `structural-repairs`, the
 * stage patches actually apply against. */
type CorpusStage = 'healed' | 'pre-patch';

/** Ingest order of the committed tranches, with the corpus stage each
 * was swept at. MIGRATION ACCEPTS HEALED TRANCHES ONLY — `loadCorpus`
 * and `loadManifest` stay raw for the research tools, which need every
 * stage. Directory names do not sort chronologically
 * (`calibration-2026-09-04` ran before `batch-01-2026-09-04`), so the
 * order is explicit, and a tranche directory this list does not name
 * is an error rather than a silent guess. */
const TRANCHES: readonly { dir: string; stage: CorpusStage }[] = [
	{ dir: 'tranche-01', stage: 'pre-patch' },
	{ dir: 'calibration-2026-09-04', stage: 'healed' },
	{ dir: 'batch-01-2026-09-04', stage: 'healed' },
	{ dir: 'batch-02-2026-09-04', stage: 'healed' },
	{ dir: 'batch-03-2026-09-04', stage: 'healed' },
	{ dir: 'batch-04-2026-09-05', stage: 'healed' },
	{ dir: 'batch-05-2026-09-05', stage: 'healed' },
	{ dir: 'residue-01', stage: 'healed' },
	// Not a sweep tranche: doc 08's confirmed implied-`1)` rows, seeded
	// because 24 of them produce no anomaly hint and so never enter a
	// sweep chunk (`patch/seed-implied-one.ts`, archived at
	// `refs/tags/archive/v2-research-2026-09`). Authored against the
	// healed stage, and last so no existing tranche's ingest position
	// moves.
	{ dir: 'seed-doc-08-implied-one', stage: 'healed' },
	// The doc-08 follow-up: runs the implied-`1)` generator cannot
	// express — a run inside an already-numbered sense, a sense whose
	// number token was dropped, and three whose `1)` was OCR'd as `l)`
	// (`patch/seed-sense-runs.ts`, archived at
	// `refs/tags/archive/v2-research-2026-09`). Last, for the same
	// reason.
	{ dir: 'seed-doc-08-sense-runs', stage: 'healed' },
];
/** The pilot directory's stage — swept pre-patch, like tranche-01. */
const PILOT_STAGE: CorpusStage = 'pre-patch';

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

/** The name of one pipeline phase, derived from `PHASE_MANIFEST`
 * itself rather than written out a second time. The manifest is the
 * committed order, so a stage can only be named once it has a place
 * in that order — `createPhaseTracker` still rejects an unknown name
 * at runtime, for a value that reached it untyped. */
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

/** What a patch whose precondition no longer holds becomes
 * (consolidation spec §4.2). `problem`: an apply problem, as the
 * research track has always treated it and as `--strict` restores.
 * `outcome`: a `PatchDrift` row — not a problem; the run continues. */
type DriftMode = 'outcome' | 'problem';

/** One patch skipped because its precondition no longer holds. */
interface PatchDrift {
	outcome: DriftOutcome;
	patchId: string;
	rid: string;
}

/** Patches pinned to a snapshot other than `currentPin`. Every patch
 * pins one hash over the whole export, so a new export makes this every
 * patch at once — which is why migrate reports it as a count and judges
 * each patch by its own `expected_before` instead. */
function stalePins(
	patches: readonly SemanticPatch[],
	currentPin: string,
): SemanticPatch[] {
	return patches.filter((patch) => patch.snapshot !== currentPin);
}

/** Order a set of found tranche-directory names by `TRANCHES`'s ingest
 * order, optionally filtered to one `stage`. Pure over a
 * directory-name list so the ordering/filtering/unknown-directory
 * logic is unit-testable without a real directory tree. Throws if
 * `existing` names a directory `TRANCHES` doesn't know — an ingest bug,
 * not a silent gap. */
function orderedDirs(
	existing: readonly string[],
	stage?: CorpusStage,
): string[] {
	const known = new Set<string>(TRANCHES.map((t) => t.dir));
	for (const dir of existing) {
		if (!known.has(dir)) {
			throw new Error(
				`unordered tranche directory "${dir}": add it to TRANCHES`,
			);
		}
	}
	const found = new Set(existing);
	return TRANCHES.filter(
		(t) => found.has(t.dir) && (stage === undefined || t.stage === stage),
	).map((t) => t.dir);
}

/** Every committed file with this basename: the pilot's, then each
 * tranche's, in `TRANCHES` ingest order. `stage` restricts
 * both to directories swept at that stage — pilot counts as
 * `PILOT_STAGE`; omit it for the raw, every-stage set the research
 * tools need. */
async function corpusFiles(
	name: string,
	stage?: CorpusStage,
): Promise<string[]> {
	const files: string[] = [];
	if (stage === undefined || stage === PILOT_STAGE) {
		files.push(`${PILOT_DIR}/${name}`);
	}
	if (existsSync(TRANCHES_DIR)) {
		const found = new Set<string>();
		for await (const hit of new Bun.Glob(`*/${name}`).scan({
			cwd: TRANCHES_DIR,
		})) {
			found.add(hit.slice(0, hit.indexOf('/')));
		}
		for (const dir of orderedDirs([...found], stage)) {
			files.push(`${TRANCHES_DIR}/${dir}/${name}`);
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

/** Load the patch corpus: one explicit file, or (no `path`) every
 * committed file, pilot first then tranches in `TRANCHES` order. A
 * `stage` restricts the no-`path` walk to that corpus
 * stage; omitted, the load is raw — every stage — which is what the
 * research tools need. Every entry is deep-frozen by `parsePatchLine`.
 * A line number in a `parsePatchLine` error is per-file, not
 * corpus-wide — the file it came from is not threaded through the
 * error message. */
async function loadCorpus(
	path?: string,
	stage?: CorpusStage,
): Promise<SemanticPatch[]> {
	const files =
		path === undefined ? await corpusFiles('patches.jsonl', stage) : [path];
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
 * parsing). `stage` restricts as `loadCorpus` does. */
async function loadManifest(
	path?: string,
	stage?: CorpusStage,
): Promise<EntryResult[]> {
	const files =
		path === undefined ? await corpusFiles('manifest.jsonl', stage) : [path];
	const records: EntryResult[] = [];
	for (const file of files) {
		const text = (await readLines(file)).join('\n');
		if (text.trim() !== '') {
			records.push(...parseManifest(text));
		}
	}
	return records;
}

/** Preflight policy. `block` (default): unresolved `needs_*` rows are
 * problems, which is the research track's contract. `defer`: they are
 * not — every escalation is deferred to post-go-live (migrate spec
 * §8) and migration proceeds without them. */
interface PreflightOptions {
	escalations: 'block' | 'defer';
	/** `block` (default): a stale snapshot pin is a problem. `skip`: it
	 * is not checked here — migrate counts it with `stalePins` and
	 * judges each patch by its precondition (consolidation spec §4.2). */
	pins?: 'block' | 'skip';
	/** Subset of `patches` the manifest must reconcile against.
	 * Carry-over patches sit outside the accepted record set — their
	 * manifest rows are pre-patch stage, not accepted — so
	 * `reconcilePatches` must not expect the manifest to list them.
	 * Defaults to `patches`. */
	reconcileOnly?: readonly SemanticPatch[];
}

/**
 * Corpus-level preflight (spec §5.3): (a) every patch's snapshot pin
 * equals the current snapshot hash; (b) the corpus is internally
 * valid (unique ids, no overlapping targets); (c) the manifest lists
 * exactly `options.reconcileOnly` (default: `patches`); (d) the replay
 * gate is open — no unresolved `needs_*` rows, unless
 * `options.escalations` is `'defer'`. Reports every problem together.
 * The per-patch `expected_before` / occurrence checks live in
 * `applyEntryPatches`, where the entries stream past.
 *
 * `patches` is the FULL apply set: the
 * pin and corpus-internal checks run over accepted + carry-over
 * together (a carry-over patch must still pin to the current
 * snapshot and must not overlap another patch's target), but
 * `reconcilePatches` only ever runs against `options.reconcileOnly` —
 * carry-over patches have no accepted manifest row to reconcile
 * against.
 */
function corpusPreflight(
	patches: readonly SemanticPatch[],
	records: readonly EntryResult[],
	currentPin: string,
	options?: PreflightOptions,
): ApplyProblem[] {
	const problems: ApplyProblem[] = [];
	if ((options?.pins ?? 'block') === 'block') {
		for (const patch of stalePins(patches, currentPin)) {
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
	for (const problem of reconcilePatches(
		records,
		options?.reconcileOnly ?? patches,
	)) {
		problems.push({ reason: problem.reason, rid: problem.rids[0] });
	}
	if ((options?.escalations ?? 'block') === 'block') {
		for (const problem of replayGate(records)) {
			problems.push({
				reason: `${problem.reason}: ${problem.rids.join(', ')}`,
			});
		}
	}
	return problems;
}

/** The corpus migration applies: every HEALED-stage record and patch
 * — pre-patch tranches are EXCLUDED from `patches` rather than
 * consolidated away — reduced to one record per rid, the latest
 * winning, plus `carryOver`: the excluded pre-patch patches whose
 * defect no accepted patch covers. Applying the migration means
 * applying `patches` then, per rid, `carryOver`. */
interface AcceptedCorpus {
	/** Pre-patch-stage patches whose `${rid} ${target}` is not already
	 * targeted by an accepted patch — repairs the healed
	 * corpus may still need. Raw, unsorted; `applyCarryOver` orders by
	 * patch id and decides, per patch, whether the healed corpus already
	 * absorbed it. */
	carryOver: SemanticPatch[];
	patches: SemanticPatch[];
	records: EntryResult[];
	superseded: {
		patches: number;
		records: number;
		/** Raw pre-patch-stage row counts — distinct from
		 * `patches`/`records` above, which count HEALED rows a later sweep
		 * of the same rid superseded. `overlapping`: pre-patch patches
		 * dropped from `carryOver` because an accepted patch already
		 * targets the same (rid, target), the healed one winning. */
		prePatch: { patches: number; records: number; overlapping: number };
	};
}

/** `consolidate`'s pure result — latest-wins accounting only.
 * `loadAcceptedCorpus` adds the `prePatch` exclusion
 * count to build the full `AcceptedCorpus`; `consolidate` itself never
 * sees pre-patch rows (its callers pass it healed-stage input only, or
 * hand-built fixtures in tests), so it has nothing to report there. */
interface ConsolidatedCorpus {
	patches: SemanticPatch[];
	records: EntryResult[];
	superseded: { patches: number; records: number };
}

/** ONE MANIFEST RECORD PER RID; THE LATEST WINS. Factored out pure so
 * it can be pinned against hand-built fixtures without touching disk.
 * A rid swept more than once keeps only its LATEST record (`records`
 * is in ingest order — file order matches `TRANCHES`'s — so later
 * entries for a rid replace earlier ones); only the patches its
 * survivors list are kept. A patch no record — kept OR superseded —
 * ever lists is not a supersession, it is an ingest bug (a
 * hand-authored or mis-ingested tranche), and is reported loudly
 * rather than silently folded into the supersession count. */
function consolidate(
	records: readonly EntryResult[],
	patches: readonly SemanticPatch[],
): ConsolidatedCorpus {
	const latest = new Map<string, EntryResult>();
	let supersededRecords = 0;
	for (const record of records) {
		if (latest.has(record.rid)) {
			supersededRecords++;
		}
		latest.set(record.rid, record);
	}
	const allIds = new Set(records.flatMap((record) => record.patches));
	const orphans = patches.filter((patch) => !allIds.has(patch.id));
	if (orphans.length > 0) {
		throw new Error(
			`patch(es) no manifest record lists: ${orphans.map((patch) => patch.id).join(', ')} — an ingest bug, not a Ruling C supersession`,
		);
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

/** Load the accepted corpus: every HEALED-stage committed record and
 * patch (the files `TRANCHES` names at that stage, in ingest order),
 * reduced to one record per rid with the latest winning, plus the
 * pre-patch-stage `carryOver` set — a raw pilot or tranche-01 patch
 * is carried over unless an accepted patch
 * already targets its exact (rid, target) — the healed one wins, and
 * that patch counts toward `superseded.prePatch.overlapping` instead.
 * `loadCorpus`/`loadManifest` stay raw — the research tools and the
 * ingest overlap check need every row, every stage. */
async function loadAcceptedCorpus(): Promise<AcceptedCorpus> {
	const records = await loadManifest(undefined, 'healed');
	const patches = await loadCorpus(undefined, 'healed');
	const consolidated = consolidate(records, patches);
	const prePatchRecords = await loadManifest(undefined, 'pre-patch');
	const prePatchPatches = await loadCorpus(undefined, 'pre-patch');
	const acceptedTargets = new Set(
		consolidated.patches.map((patch) => `${patch.rid} ${patch.target}`),
	);
	const carryOver = prePatchPatches.filter(
		(patch) => !acceptedTargets.has(`${patch.rid} ${patch.target}`),
	);
	return {
		...consolidated,
		carryOver,
		superseded: {
			...consolidated.superseded,
			prePatch: {
				patches: prePatchPatches.length,
				records: prePatchRecords.length,
				overlapping: prePatchPatches.length - carryOver.length,
			},
		},
	};
}

/** A `reform` that changed only the entry's `display`.
 *
 * `reform`'s target is the forms block, so the assertion below reads
 * "the apply changed its target" as "the block no longer hashes to
 * the anchor". Since headword design §2 gave the op a `display` half
 * (#130), that reading is incomplete: a patch may set the LAYOUT of a
 * line whose forms are already right. §4 "Parentheses" (ruled
 * 2026-09-22) is exactly that case — A02823's parentheses sit on the
 * wrong form in the source, the parser stays source-faithful, and the
 * print's `({0}) {1} I` is supplied by a reviewed patch while the
 * forms stay as the source has them.
 *
 * So the question the assertion asks is "did the apply change
 * anything?", and for such a patch the answer is `display`. A reform
 * that changes NEITHER still fails, which is the case the assertion
 * was written for. */
function reformSetDisplayOnly(
	before: SourceEntry,
	after: SourceEntry,
	patch: SemanticPatch,
): boolean {
	if (patch.op !== 'reform' || before.display === after.display) {
		return false;
	}
	// The forms half must really be unchanged, which is what makes the
	// skipped assertion safe. Without this clause the exemption would
	// read "a reform that set a display", and a payload whose `forms`
	// silently repeat the current ones would ship whenever it also
	// carried a template — the exact no-op the assertion exists to
	// catch, wearing a display as a pass.
	return countTarget(after, patch) === countTarget(before, patch);
}

/** Round-trip re-parse assertion (spec §4.3): the patched entry must
 * survive JSON serialization unchanged, and the apply must have
 * changed something — its pre-state target no longer resolving to its
 * old count, or (see `reformSetDisplayOnly`) the line's layout. An
 * apply that left the entry byte-identical repaired nothing. */
function postApplyAssertions(
	before: SourceEntry,
	after: SourceEntry,
	patch: SemanticPatch,
): void {
	const reparsed = JSON.parse(JSON.stringify(after)) as SourceEntry;
	if (JSON.stringify(reparsed) !== JSON.stringify(after)) {
		throw new PatchApplyError(
			patch.id,
			'round-trip re-parse changed the entry — non-JSON-safe structure',
		);
	}
	const stale = countTarget(after, patch);
	if (
		stale !== patch.expected_occurrences - 1 &&
		!reformSetDisplayOnly(before, after, patch)
	) {
		throw new PatchApplyError(
			patch.id,
			`after apply, the pre-state target still resolves ${stale} time(s); expected ${patch.expected_occurrences - 1} — the apply did not change its target`,
		);
	}
}

/** Apply one rid's patches in committed corpus order, chaining state.
 * Every problem is recorded (the failing patch is skipped, later
 * patches still try against the last good state) so a run reports
 * all drift at once. Under `drift: 'outcome'` a patch whose
 * precondition no longer holds is a `drifted` row instead of a
 * problem. */
function applyEntryPatches(
	entry: SourceEntry,
	patches: readonly SemanticPatch[],
	drift: DriftMode = 'problem',
): { drifted: PatchDrift[]; entry: SourceEntry; problems: ApplyProblem[] } {
	let current = entry;
	const drifted: PatchDrift[] = [];
	const problems: ApplyProblem[] = [];
	for (const patch of patches) {
		if (drift === 'outcome') {
			const outcome = classifyDrift(current, patch);
			if (outcome !== undefined) {
				drifted.push({ outcome, patchId: patch.id, rid: patch.rid });
				continue;
			}
		}
		const result = tryApply(current, patch);
		if (result.problem === undefined) {
			current = result.entry;
		} else {
			problems.push(result.problem);
		}
	}
	return { drifted, entry: current, problems };
}

/** Apply one patch to `current` with every gate (post-apply
 * assertions, no-new-text floor): the next entry, or the problem that
 * rejected the patch. An unexpected error still throws. */
function tryApply(
	current: SourceEntry,
	patch: SemanticPatch,
): { entry: SourceEntry; problem?: undefined } | { problem: ApplyProblem } {
	try {
		const next = applyPatch(current, patch);
		postApplyAssertions(current, next, patch);
		const problem = newTextProblem(patch, current, next);
		return problem === undefined ? { entry: next } : { problem };
	} catch (error) {
		if (error instanceof PatchApplyError || error instanceof PatchFormatError) {
			return {
				problem: {
					patchId: patch.id,
					reason: error.message,
					rid: patch.rid,
				},
			};
		}
		throw error;
	}
}

/** The no-new-text floor for one apply: a problem when a non-human
 * patch added bytes, else undefined (human patches are exempt). */
function newTextProblem(
	patch: SemanticPatch,
	before: SourceEntry,
	after: SourceEntry,
): ApplyProblem | undefined {
	if (patch.author === 'human') {
		return undefined;
	}
	const verdict = validateNoNewText(patch, before, after);
	if (verdict.ok) {
		return undefined;
	}
	return {
		patchId: patch.id,
		reason: `${verdict.reason} — entry re-dispositions ${verdict.redisposition}`,
		rid: patch.rid,
	};
}

/** Apply one rid's carry-over patches, in patch id order, after the
 * rid's accepted patches have already
 * landed on `entry`. Each patch is pre-checked by resolving its target
 * directly and comparing the exact count — a zero-match and a
 * wrong-count match are not the same fact, so a boolean "does it match
 * `expected_occurrences`" check cannot distinguish them: a zero-match
 * target means the defect it targets is already gone (a transform rule
 * absorbed it), so the patch is recorded as `absorbed` and never
 * applied. A match at the expected count means the
 * defect is still present, so the patch is `carried` and applied
 * through the normal `applyEntryPatches` gate (round-trip re-parse,
 * no-new-text floor), chaining state like any other apply. Any other
 * count — some but not the expected number of matches — proves neither
 * absorption nor safety to apply, and is recorded as a problem instead
 * of silently dropped. */
function applyCarryOver(
	entry: SourceEntry,
	patches: readonly SemanticPatch[],
	drift: DriftMode = 'problem',
): {
	entry: SourceEntry;
	absorbed: string[];
	carried: string[];
	drifted: PatchDrift[];
	problems: ApplyProblem[];
} {
	let current = entry;
	const absorbed: string[] = [];
	const carried: string[] = [];
	const drifted: PatchDrift[] = [];
	const problems: ApplyProblem[] = [];
	const ordered = [...patches].sort((a, b) => a.id.localeCompare(b.id));
	for (const patch of ordered) {
		const found = countTarget(current, patch);
		if (found === 0) {
			absorbed.push(patch.id);
			continue;
		}
		if (found !== patch.expected_occurrences) {
			// found > 0 here, so this is never "fixed": some matches remain.
			if (drift === 'outcome') {
				drifted.push({
					outcome: 'upstream-changed',
					patchId: patch.id,
					rid: patch.rid,
				});
				continue;
			}
			problems.push({
				patchId: patch.id,
				reason: `carry-over pre-state target ${patch.target} resolves ${found} time(s); expected ${patch.expected_occurrences} — neither absorbed nor safe to apply`,
				rid: patch.rid,
			});
			continue;
		}
		carried.push(patch.id);
		const result = applyEntryPatches(current, [patch]);
		current = result.entry;
		problems.push(...result.problems);
	}
	return { absorbed, carried, drifted, entry: current, problems };
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

export type {
	AcceptedCorpus,
	ApplyProblem,
	ConsolidatedCorpus,
	CorpusStage,
	DriftMode,
	PatchDrift,
	PhaseName,
	PreflightOptions,
	ReviewedCorpus,
};
export {
	applyCarryOver,
	applyEntryPatches,
	consolidate,
	corpusPreflight,
	createPhaseTracker,
	loadAcceptedCorpus,
	loadCorpus,
	loadReviewedCorpus,
	orderedDirs,
	PHASE_MANIFEST,
	PhaseViolation,
	patchesByRid,
	postApplyAssertions,
	reviewedManifestProblems,
	stalePins,
};
