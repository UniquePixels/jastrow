/**
 * Verification machinery (research-process plan Task 7; spec
 * docs/specs/2026-08-10-research-process-design.md §4.1.6).
 *
 * Three pieces, all pure:
 *
 * - **Ingest** (`ingestChunk`): validates one sweep agent's raw
 *   output (patches JSONL + manifest JSONL) before anything enters
 *   the corpus — schema parse, snapshot pin + prompt version
 *   equality, corpus preflight (unique ids, no overlapping targets),
 *   manifest completeness against the chunk's rid set, and a full
 *   chained apply with the no-new-text validator per patch. Rejected
 *   patches are logged and their entries re-dispositioned: a
 *   no-new-text violation re-dispositions `needs_print_check` (spec
 *   §4.3); every other rejection re-dispositions
 *   `needs_human_judgment` (the repair intent exists but could not
 *   be validated). Manifest-level failures are chunk-fatal — an
 *   incomplete audit trail means the chunk re-sweeps.
 *
 * - **Sampler** (`selectSample`): the verification sample — every
 *   low- and med-confidence patch, a seeded random sample of
 *   high-confidence patches, and a seeded random sample of `clean`
 *   entries (the false-negative measure). Deterministic under a
 *   fixed seed so a committed sample is reproducible.
 *
 * - **Report** (`buildPilotReport` / `renderPilotReport`): sampled
 *   error rate, clean-sample miss rate, escalation queue size — the
 *   numbers the maintainer sets per-tranche thresholds against.
 */
import type { SourceEntry } from '../body/types.ts';
import { validateNoNewText } from '../patch/no-new-text.ts';
import {
	applyPatch,
	PatchApplyError,
	PatchFormatError,
	parsePatchLine,
	type SemanticPatch,
	validateCorpus,
} from '../patch/schema.ts';
import {
	type Disposition,
	type EntryResult,
	ManifestFormatError,
	parseManifestLine,
	reconcilePatches,
	validateManifest,
} from './manifest.ts';

/** Sampler defaults — calibration-tranche scale; the maintainer may
 * override per tranche. */
const DEFAULT_SAMPLE: SampleConfig = {
	cleanRate: 0.1,
	highRate: 0.2,
	minClean: 10,
	minHigh: 5,
	seed: 1,
};

/** What one sweep agent handed back for one chunk, verbatim. */
interface ChunkOutput {
	chunkId: string;
	manifestText: string;
	patchesText: string;
}

/** The pinned context the output must match. */
interface IngestContext {
	/** Pre-patch entry state by rid (what the patch-apply phase will
	 * see) — `expected_before` is checked against these bytes. */
	entries: ReadonlyMap<string, SourceEntry>;
	pin: string;
	promptVersion: string;
	/** The chunk's exact rid set (manifest completeness target). */
	rids: readonly string[];
}

/** One rejected patch: the reason and the disposition its entry
 * falls to. */
interface RejectRecord {
	patchId: string;
	reason: string;
	redisposition: 'needs_human_judgment' | 'needs_print_check';
	rid: string;
}

/** Ingest outcome. `problems` non-empty = chunk-fatal (re-sweep);
 * otherwise `patches`/`records` are the validated, re-dispositioned
 * output ready for the pilot corpus, and `rejects` is the log. */
interface IngestResult {
	patches: SemanticPatch[];
	problems: string[];
	records: EntryResult[];
	rejects: RejectRecord[];
}

/** The verification sample (spec §4.1.6), by reference. */
interface VerificationSample {
	clean: string[];
	high: SemanticPatch[];
	lowMed: SemanticPatch[];
}

interface SampleConfig {
	cleanRate: number;
	highRate: number;
	minClean: number;
	minHigh: number;
	seed: number;
}

/** Opus-tier verdict on one sampled patch. `labelOnly` marks a
 * failure whose repair is substantively correct (a metadata slip,
 * e.g. a wrong `defect_class` token) — corrected at acceptance and
 * tracked, but not counted against the error threshold (maintainer
 * standard 2026-08-14, batch-01). Absent means false. */
interface PatchVerdict {
	labelOnly?: boolean;
	note: string;
	ok: boolean;
	patchId: string;
}

/** Opus-tier verdict on one sampled `clean` entry. `catchable`
 * says whether the missed defect was findable from what the sweep
 * was given — the entry, its anomaly hints, the seed rulings, and
 * the catalog — without corpus-wide forensics. Uncatchable misses
 * are *discoveries*: folded into the escalation queue and tracked,
 * but not counted against the miss threshold (maintainer standard
 * 2026-08-14, batch-01). Absent means catchable (back-compat with
 * pilot verdicts). */
interface CleanVerdict {
	catchable?: boolean;
	missed: boolean;
	note: string;
	rid: string;
}

/** The batch's measured numbers (spec §4.1.6). Threshold rates
 * count catchable misses and substantive patch errors only;
 * discoveries and label-only slips are reported alongside. */
interface PilotReport {
	cleanSampled: number;
	discoveries: string[];
	dispositions: Record<Disposition, number>;
	errorRate: number;
	escalationQueue: number;
	labelOnlyPatches: string[];
	missedClean: string[];
	missRate: number;
	patchesAccepted: number;
	patchesRejected: number;
	patchesSampled: number;
	patchesWrong: string[];
}

/** Try to salvage `id`/`rid` from a raw line that failed schema
 * parse, for reject attribution. */
function salvageIds(line: string): { id: string; rid: string } {
	try {
		const raw = JSON.parse(line) as Record<string, unknown>;
		return {
			id: typeof raw['id'] === 'string' ? raw['id'] : '(no id)',
			rid: typeof raw['rid'] === 'string' ? raw['rid'] : '(no rid)',
		};
	} catch {
		return { id: '(no id)', rid: '(no rid)' };
	}
}

/** Chain-apply one rid's patches against its pre-patch entry state,
 * running the no-new-text validator per step. Returns typed rejects;
 * a failing patch is skipped and later patches try against the last
 * good state (mirrors the apply engine, spec §5.3). */
function chainValidate(
	entry: SourceEntry,
	patches: readonly SemanticPatch[],
): RejectRecord[] {
	const rejects: RejectRecord[] = [];
	let current = entry;
	for (const patch of patches) {
		try {
			const next = applyPatch(current, patch);
			const verdict = validateNoNewText(patch, current, next);
			if (!verdict.ok) {
				rejects.push({
					patchId: patch.id,
					reason: verdict.reason,
					redisposition: verdict.redisposition,
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
				rejects.push({
					patchId: patch.id,
					reason: error.message,
					redisposition: 'needs_human_judgment',
					rid: patch.rid,
				});
				continue;
			}
			throw error;
		}
	}
	return rejects;
}

/** Fold a reject into its manifest record: drop the patch id,
 * re-disposition (print-check outranks human-judgment — a print need
 * is the harder queue), and append the reason to the escalation. */
function redisposition(record: EntryResult, reject: RejectRecord): EntryResult {
	const patches = record.patches.filter((id) => id !== reject.patchId);
	const disposition: Disposition =
		record.disposition === 'needs_print_check' ||
		reject.redisposition === 'needs_print_check'
			? 'needs_print_check'
			: 'needs_human_judgment';
	const note = `rejected ${reject.patchId}: ${reject.reason}`;
	const escalation =
		record.escalation === undefined ? note : `${record.escalation}; ${note}`;
	return { ...record, disposition, escalation, patches };
}

/** Validate one chunk's agent output end-to-end (see module doc). */
function ingestChunk(
	output: ChunkOutput,
	context: IngestContext,
): IngestResult {
	const problems: string[] = [];
	const rejects: RejectRecord[] = [];
	const parsed: SemanticPatch[] = [];
	const rejectedIds = new Set<string>();

	for (const [index, line] of output.patchesText.split('\n').entries()) {
		if (line.trim() === '') {
			continue;
		}
		let patch: SemanticPatch;
		try {
			patch = parsePatchLine(line, index + 1);
		} catch (error) {
			if (error instanceof PatchFormatError) {
				const ids = salvageIds(line);
				rejects.push({
					patchId: ids.id,
					reason: error.message,
					redisposition: 'needs_human_judgment',
					rid: ids.rid,
				});
				rejectedIds.add(ids.id);
				continue;
			}
			throw error;
		}
		const reasons: string[] = [];
		if (patch.snapshot !== context.pin) {
			reasons.push(
				`snapshot pin ${patch.snapshot} does not match tranche pin ${context.pin}`,
			);
		}
		if (patch.prompt_version !== context.promptVersion) {
			reasons.push(
				`prompt_version ${patch.prompt_version} is not ${context.promptVersion}`,
			);
		}
		if (!context.rids.includes(patch.rid)) {
			reasons.push(`rid ${patch.rid} is not in chunk ${output.chunkId}`);
		}
		if (reasons.length > 0) {
			rejects.push({
				patchId: patch.id,
				reason: reasons.join('; '),
				redisposition: 'needs_human_judgment',
				rid: patch.rid,
			});
			rejectedIds.add(patch.id);
			continue;
		}
		parsed.push(patch);
	}

	// Corpus preflight within the chunk: duplicate ids / overlapping
	// targets reject every involved patch (the safe reading — which
	// one the agent meant is unknowable).
	for (const problem of validateCorpus(parsed)) {
		for (const id of problem.patchIds) {
			rejectedIds.add(id);
			const patch = parsed.find((p) => p.id === id);
			rejects.push({
				patchId: id,
				reason: problem.reason,
				redisposition: 'needs_human_judgment',
				rid: patch?.rid ?? '(no rid)',
			});
		}
	}
	const accepted = parsed.filter((p) => !rejectedIds.has(p.id));

	// Manifest: parse failures and completeness failures are
	// chunk-fatal — the audit trail itself is broken.
	const records: EntryResult[] = [];
	for (const [index, line] of output.manifestText.split('\n').entries()) {
		if (line.trim() === '') {
			continue;
		}
		try {
			records.push(parseManifestLine(line, index + 1));
		} catch (error) {
			if (error instanceof ManifestFormatError) {
				problems.push(error.message);
				continue;
			}
			throw error;
		}
	}
	for (const problem of validateManifest(records, context.rids)) {
		problems.push(`${problem.reason}: ${problem.rids.join(', ')}`);
	}
	// Reconcile against the surviving set: manifest references to
	// already-rejected ids are the rejects' business (handled by
	// re-disposition below), not an audit-trail failure.
	const stripped = records.map((record) => ({
		...record,
		patches: record.patches.filter((id) => !rejectedIds.has(id)),
	}));
	for (const problem of reconcilePatches(stripped, accepted)) {
		problems.push(`${problem.reason} (${problem.rids.join(', ')})`);
	}
	if (problems.length > 0) {
		return { patches: [], problems, records: [], rejects };
	}

	// Chained apply + no-new-text per rid, against the pre-patch
	// entry state.
	const byRid = new Map<string, SemanticPatch[]>();
	for (const patch of accepted) {
		const group = byRid.get(patch.rid);
		if (group === undefined) {
			byRid.set(patch.rid, [patch]);
		} else {
			group.push(patch);
		}
	}
	for (const [rid, group] of byRid) {
		const entry = context.entries.get(rid);
		if (entry === undefined) {
			problems.push(`no pre-patch entry state for rid ${rid}`);
			continue;
		}
		for (const reject of chainValidate(entry, group)) {
			rejects.push(reject);
			rejectedIds.add(reject.patchId);
		}
	}
	if (problems.length > 0) {
		return { patches: [], problems, records: [], rejects };
	}

	const finalPatches = accepted.filter((p) => !rejectedIds.has(p.id));
	const rejectsByRid = new Map<string, RejectRecord[]>();
	for (const reject of rejects) {
		const group = rejectsByRid.get(reject.rid);
		if (group === undefined) {
			rejectsByRid.set(reject.rid, [reject]);
		} else {
			group.push(reject);
		}
	}
	const finalRecords = records.map((record) => {
		let current = record;
		for (const reject of rejectsByRid.get(record.rid) ?? []) {
			if (current.patches.includes(reject.patchId)) {
				current = redisposition(current, reject);
			}
		}
		return current;
	});

	return { patches: finalPatches, problems, records: finalRecords, rejects };
}

/** Deterministic PRNG (mulberry32) — the sampler must be
 * reproducible from its committed seed. */
function mulberry32(seed: number): () => number {
	let a = seed >>> 0;
	return () => {
		a = (a + 0x6d_2b_79_f5) >>> 0;
		let t = a;
		t = Math.imul(t ^ (t >>> 15), t | 1);
		t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
		return ((t ^ (t >>> 14)) >>> 0) / 4_294_967_296;
	};
}

/** First `count` items of a seeded Fisher–Yates shuffle. */
function seededSample<T>(
	items: readonly T[],
	count: number,
	random: () => number,
): T[] {
	const pool = [...items];
	const take = Math.min(count, pool.length);
	for (let i = 0; i < take; i++) {
		const j = i + Math.floor(random() * (pool.length - i));
		const a = pool[i] as T;
		pool[i] = pool[j] as T;
		pool[j] = a;
	}
	return pool.slice(0, take);
}

/** Sample size for a pool: `rate` of it, at least `min`, at most the
 * pool itself. */
function sampleSize(pool: number, rate: number, min: number): number {
	return Math.min(pool, Math.max(min, Math.ceil(pool * rate)));
}

/** The verification sample (spec §4.1.6): every low/med patch, a
 * seeded sample of high patches, a seeded sample of clean entries.
 * Inputs are sorted before sampling so the result depends only on
 * content + seed, never arrival order. */
function selectSample(
	records: readonly EntryResult[],
	patches: readonly SemanticPatch[],
	config: SampleConfig = DEFAULT_SAMPLE,
): VerificationSample {
	const sorted = [...patches].sort((a, b) => a.id.localeCompare(b.id));
	const lowMed = sorted.filter((p) => p.confidence !== 'high');
	const high = sorted.filter((p) => p.confidence === 'high');
	const clean = records
		.filter((r) => r.disposition === 'clean')
		.map((r) => r.rid)
		.sort();
	const random = mulberry32(config.seed);
	return {
		clean: seededSample(
			clean,
			sampleSize(clean.length, config.cleanRate, config.minClean),
			random,
		),
		high: seededSample(
			high,
			sampleSize(high.length, config.highRate, config.minHigh),
			random,
		),
		lowMed,
	};
}

/** Fold verdicts into the pilot's measured numbers. */
function buildPilotReport(
	records: readonly EntryResult[],
	rejects: readonly RejectRecord[],
	sample: VerificationSample,
	patchVerdicts: readonly PatchVerdict[],
	cleanVerdicts: readonly CleanVerdict[],
): PilotReport {
	const dispositions: Record<Disposition, number> = {
		clean: 0,
		needs_human_judgment: 0,
		needs_print_check: 0,
		repaired: 0,
	};
	for (const record of records) {
		dispositions[record.disposition] += 1;
	}
	const sampledIds = new Set(
		[...sample.lowMed, ...sample.high].map((p) => p.id),
	);
	const judged = patchVerdicts.filter((v) => sampledIds.has(v.patchId));
	const failed = judged.filter((v) => !v.ok);
	const wrong = failed
		.filter((v) => v.labelOnly !== true)
		.map((v) => v.patchId);
	const labelOnly = failed
		.filter((v) => v.labelOnly === true)
		.map((v) => v.patchId);
	const cleanJudged = cleanVerdicts.filter((v) => sample.clean.includes(v.rid));
	const found = cleanJudged.filter((v) => v.missed);
	const missed = found
		.filter((v) => v.catchable !== false)
		.map((v) => v.rid);
	const discoveries = found
		.filter((v) => v.catchable === false)
		.map((v) => v.rid);
	const accepted = records.reduce((n, r) => n + r.patches.length, 0);
	return {
		cleanSampled: cleanJudged.length,
		discoveries,
		dispositions,
		errorRate: judged.length === 0 ? 0 : wrong.length / judged.length,
		escalationQueue:
			dispositions.needs_human_judgment + dispositions.needs_print_check,
		labelOnlyPatches: labelOnly,
		missRate: cleanJudged.length === 0 ? 0 : missed.length / cleanJudged.length,
		missedClean: missed,
		patchesAccepted: accepted,
		patchesRejected: rejects.length,
		patchesSampled: judged.length,
		patchesWrong: wrong,
	};
}

/** Render the report as the committed markdown artifact. */
function renderPilotReport(report: PilotReport, title: string): string {
	const pct = (n: number): string => `${(n * 100).toFixed(1)}%`;
	const lines = [
		`# ${title}`,
		'',
		'| Measure | Value |',
		'| --- | --- |',
		`| Entries | ${Object.values(report.dispositions).reduce((a, b) => a + b, 0)} |`,
		`| clean | ${report.dispositions.clean} |`,
		`| repaired | ${report.dispositions.repaired} |`,
		`| needs_print_check | ${report.dispositions.needs_print_check} |`,
		`| needs_human_judgment | ${report.dispositions.needs_human_judgment} |`,
		`| Patches accepted | ${report.patchesAccepted} |`,
		`| Patches rejected at ingest | ${report.patchesRejected} |`,
		`| Patches sampled (Opus tier) | ${report.patchesSampled} |`,
		`| Sampled error rate (substantive) | ${pct(report.errorRate)} |`,
		`| Label-only patch slips | ${report.labelOnlyPatches.length} |`,
		`| Clean entries sampled | ${report.cleanSampled} |`,
		`| Clean-sample miss rate (catchable) | ${pct(report.missRate)} |`,
		`| Verifier discoveries (not counted) | ${report.discoveries.length} |`,
		`| Escalation queue | ${report.escalationQueue} |`,
	];
	if (report.patchesWrong.length > 0) {
		lines.push('', `Wrong patches: ${report.patchesWrong.join(', ')}`);
	}
	if (report.labelOnlyPatches.length > 0) {
		lines.push(
			'',
			`Label-only slips (corrected, not counted): ${report.labelOnlyPatches.join(', ')}`,
		);
	}
	if (report.missedClean.length > 0) {
		lines.push('', `Missed clean entries: ${report.missedClean.join(', ')}`);
	}
	if (report.discoveries.length > 0) {
		lines.push(
			'',
			`Discoveries (fold in as escalations; shared mechanical root cause across several forces a detector/prompt update before the next batch): ${report.discoveries.join(', ')}`,
		);
	}
	lines.push('');
	return lines.join('\n');
}

export type {
	ChunkOutput,
	CleanVerdict,
	IngestContext,
	IngestResult,
	PatchVerdict,
	PilotReport,
	RejectRecord,
	SampleConfig,
	VerificationSample,
};
export {
	buildPilotReport,
	chainValidate,
	DEFAULT_SAMPLE,
	ingestChunk,
	mulberry32,
	renderPilotReport,
	seededSample,
	selectSample,
};
