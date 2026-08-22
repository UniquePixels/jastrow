/**
 * Migration dry run (entry-body-model plan Task 16). Applies the
 * approved §6.0 repair passes (`repairs.ts`) to every source entry,
 * re-runs the full §6.0 composition + round-trip gates over the HEALED
 * corpus, and writes the migration report: every pass's entry ids, the
 * blessing-gate results, and the before/after recounts of each damage
 * census the repairs target. Read-only apart from the gitignored report
 * — truth writing stays with `migrate.ts`, later.
 * Run: bun body:migrate-dry
 */
import type { ValidateFunction } from 'ajv';
import Ajv2020 from 'ajv/dist/2020';
import {
	applyEntryPatches,
	corpusPreflight,
	createPhaseTracker,
	loadCorpus,
	loadManifest,
	patchesByRid,
} from '../patch/apply.ts';
import type { SemanticPatch } from '../patch/schema.ts';
import { computeSnapshot } from '../patch/snapshot.ts';
import entrySchema from '../schema/entry.schema.json' with { type: 'json' };
import { applyTransforms } from '../transform/run.ts';
import type { TransformRecord } from '../transform/types.ts';
import { findCitations } from './cite.ts';
import { buildTrace } from './dry-run.ts';
import { toValidationEntry } from './dry-run-report.ts';
import { evaluateRoundTrip } from './dry-run-verify.ts';
import { parseLabel } from './labels.ts';
import type { RepairRecord } from './repairs.ts';
import {
	applyRepairs,
	CONFIRMED_NO_CHANGE,
	DEFERRED,
	REPAIRED_ORPHAN_ITEMS,
	walkSensesDeep,
} from './repairs.ts';
import { readSourceEntries } from './source.ts';
import type { SourceEntry } from './types.ts';

const REPORT_PATH = 'data/source/body-migration-report.json';

// Hoisted per lint/performance/useTopLevelRegex — no state (`g`/`y`)
// flags, so sharing across calls is safe.
const LEADING_INTEGER = /\d+/u;
const OPENS_AT_TWO = /^\D*2\)/u;

interface GateTally {
	pass: number;
	total: number;
}

interface Recounts {
	brokenTopSequences: string[];
	emptyOrUntrimmedBinyanForms: number;
	labelQuarantines: string[];
	schemaFailures: string[];
	startsAtTwo: string[];
	unresolvedRepairedOrphans: string[];
}

interface PatchTally {
	applied: number;
	corpus: number;
	problems: string[];
}

interface Report {
	confirmedNoChange: string[];
	deferred: Record<string, string>;
	entries: number;
	gates: Record<'formSection' | 'lettered' | 'rejoin' | 'units', GateTally>;
	patches: PatchTally;
	recordsByPass: Record<string, RepairRecord[]>;
	recounts: Recounts;
	repairedEntries: number;
	repairFailures: string[];
	transformRecords: TransformRecord[];
}

/** Top-level sense-number sequence check (census .brokenSequences
 * shape): the leading integers of numbered senses must read 1..n. */
function brokenTopSequence(entry: SourceEntry): boolean {
	const numbers: number[] = [];
	for (const sense of entry.content.senses) {
		const match = LEADING_INTEGER.exec(sense.number ?? '');
		if (match) {
			numbers.push(Number(match[0]));
		}
	}
	return numbers.length > 0 && numbers.some((n, index) => n !== index + 1);
}

/** Register #16 phenomenon: any sense list (top-level or stem children)
 * whose first numbered sense opens at 2. */
function startsAtTwo(entry: SourceEntry): boolean {
	const lists = [
		entry.content.senses,
		...entry.content.senses.filter((s) => s.grammar).map((s) => s.senses ?? []),
	];
	return lists.some((list) => {
		const first = list.find((s) => s.number !== undefined);
		return OPENS_AT_TWO.test(first?.number ?? '');
	});
}

/** The repaired orphan refs items must now have an in-body citation
 * basis: some detected anchor's data-ref, with `&quot;` read back as the
 * gershayim it encodes, equals the item. Returns unmatched items. */
function unresolvedOrphans(entry: SourceEntry): string[] {
	const expected = REPAIRED_ORPHAN_ITEMS[entry.rid];
	if (expected === undefined) {
		return [];
	}
	const seen = new Set<string>();
	for (const sense of walkSensesDeep(entry.content.senses)) {
		for (const hit of findCitations(sense.definition ?? '')) {
			seen.add(hit.dataRef.split('&quot;').join('"'));
		}
	}
	return expected.filter((item) => !seen.has(item));
}

/** Bump a pass/total gate pair. */
function tallyGate(tally: GateTally, ok: boolean): void {
	tally.total++;
	if (ok) {
		tally.pass++;
	}
}

/** A zeroed migration report, with the disposition lists embedded so
 * the written JSON is self-describing. */
function createReport(): Report {
	return {
		confirmedNoChange: CONFIRMED_NO_CHANGE,
		deferred: DEFERRED,
		entries: 0,
		gates: {
			formSection: { pass: 0, total: 0 },
			lettered: { pass: 0, total: 0 },
			rejoin: { pass: 0, total: 0 },
			units: { pass: 0, total: 0 },
		},
		patches: { applied: 0, corpus: 0, problems: [] },
		recordsByPass: {},
		recounts: {
			brokenTopSequences: [],
			emptyOrUntrimmedBinyanForms: 0,
			labelQuarantines: [],
			schemaFailures: [],
			startsAtTwo: [],
			unresolvedRepairedOrphans: [],
		},
		repairFailures: [],
		repairedEntries: 0,
		transformRecords: [],
	};
}

/** Re-measure, on the HEALED entry, every damage census the repairs
 * target — the before/after evidence the migration report exists for. */
function recount(entry: SourceEntry, report: Report): void {
	const { recounts } = report;
	if (brokenTopSequence(entry)) {
		recounts.brokenTopSequences.push(entry.rid);
	}
	if (startsAtTwo(entry)) {
		recounts.startsAtTwo.push(entry.rid);
	}
	for (const sense of walkSensesDeep(entry.content.senses)) {
		for (const form of sense.grammar?.binyan_form ?? []) {
			if (form === '' || form !== form.trim()) {
				recounts.emptyOrUntrimmedBinyanForms++;
			}
		}
		const number = sense.number;
		if (number !== undefined && 'unknown' in parseLabel(number)) {
			recounts.labelQuarantines.push(`${entry.rid}:${number}`);
		}
	}
}

/** The `text-repairs` phase body: literal repairs first (on pristine
 * source, so `repairs.ts`'s exactly-once find-text assertions hold),
 * then the corpus-correction transforms second, on the healed entry
 * (spec §5.2's ordering contract). Transform records are pushed onto
 * the report directly since `RunResult` and `RepairRecord` don't share
 * a shape the caller could merge generically. */
function healAndTransform(
	source: SourceEntry,
	report: Report,
): ReturnType<typeof applyRepairs> {
	const healed = applyRepairs(source);
	const transformed = applyTransforms(healed.entry, 'text-repairs');
	report.transformRecords.push(...transformed.records);
	return { entry: transformed.entry, records: healed.records };
}

/** One corpus entry through the committed phase manifest (spec §5.2):
 * text repairs → structural repairs → patch apply → consumer-facing
 * composition + gates + recounts + full schema validation. The
 * tracker turns a mis-ordered edit to this function into a loud
 * `PhaseViolation` instead of silently corrupted output. */
function processEntry(
	source: SourceEntry,
	report: Report,
	validate: ValidateFunction,
	patchGroups: Map<string, SemanticPatch[]>,
): void {
	report.entries++;
	const phases = createPhaseTracker();
	// Contain a drifted find-text to its own entry: record it and keep
	// walking, so one report run lists every drift instead of aborting at
	// the first. main() rethrows after the walk — the run stays loud.
	let repaired: ReturnType<typeof applyRepairs>;
	try {
		repaired = phases.run('text-repairs', () =>
			healAndTransform(source, report),
		);
	} catch (error) {
		report.repairFailures.push(
			`${source.rid}: ${error instanceof Error ? error.message : String(error)}`,
		);
		return;
	}
	const { entry, records } = repaired;
	if (records.length > 0) {
		report.repairedEntries++;
		for (const record of records) {
			const bucket = report.recordsByPass[record.pass] ?? [];
			bucket.push(record);
			report.recordsByPass[record.pass] = bucket;
		}
	}
	// No structural pass exists yet (the S1 splitter folds into the
	// sweep's `split` op); the phase runs empty so the ordering
	// contract is enforced from day one.
	phases.run('structural-repairs', () => undefined);
	const group = patchGroups.get(entry.rid);
	const patched = phases.run('patch-apply', () =>
		group === undefined
			? { entry, problems: [] }
			: applyEntryPatches(entry, group),
	);
	if (group !== undefined) {
		report.patches.applied += group.length - patched.problems.length;
		report.patches.problems.push(
			...patched.problems.map((p) => `${p.patchId ?? entry.rid}: ${p.reason}`),
		);
	}
	phases.run('consumer-output', () => {
		const healed = patched.entry;
		const trace = buildTrace(healed);
		const gates = evaluateRoundTrip(healed, trace);
		tallyGate(report.gates.rejoin, gates.rejoin);
		tallyGate(report.gates.units, gates.units);
		tallyGate(report.gates.lettered, gates.lettered);
		tallyGate(report.gates.formSection, gates.formSection);
		recount(healed, report);
		// Full-corpus schema validation (the dry run samples ~129; here the
		// binyan cleanup is exactly what the 3 sampled failures traced to, so
		// validate everything). Placeholder slug/headword per tallySchema.
		if (!validate(toValidationEntry(healed, trace.body))) {
			report.recounts.schemaFailures.push(healed.rid);
		}
		report.recounts.unresolvedRepairedOrphans.push(
			...unresolvedOrphans(healed).map((item) => `${healed.rid}: ${item}`),
		);
	});
}

/** The one-screen console summary — the numbers
 * docs/v2/body-migration.md transcribes. */
function printSummary(report: Report): void {
	const lines = [
		`entries=${report.entries} repaired=${report.repairedEntries}`,
		...Object.entries(report.recordsByPass).map(
			([pass, records]) =>
				`${pass}: ${records.length} record(s) across ${new Set(records.map((r) => r.rid)).size} entries`,
		),
		...Object.entries(report.gates).map(
			([gate, t]) => `gate ${gate}=${t.pass}/${t.total}`,
		),
		`brokenTopSequences=${report.recounts.brokenTopSequences.length}`,
		`startsAtTwo=${report.recounts.startsAtTwo.length}`,
		`labelQuarantines=${report.recounts.labelQuarantines.length}`,
		`binyanEmptyOrUntrimmed=${report.recounts.emptyOrUntrimmedBinyanForms}`,
		`schemaFailures=${report.recounts.schemaFailures.length}`,
		`repairFailures=${report.repairFailures.length}`,
		`patchCorpus=${report.patches.corpus} patchesApplied=${report.patches.applied} patchProblems=${report.patches.problems.length}`,
		`unresolvedRepairedOrphans=${report.recounts.unresolvedRepairedOrphans.length}`,
		`deferred=${Object.keys(report.deferred).length} confirmedNoChange=${report.confirmedNoChange.length}`,
	];
	const byRule = new Map<string, number>();
	for (const record of report.transformRecords) {
		byRule.set(record.ruleId, (byRule.get(record.ruleId) ?? 0) + 1);
	}
	lines.push(
		...[...byRule].map(([id, n]) => `transform ${id}: ${n} instance(s)`),
	);
	console.log(lines.join('\n'));
}

if (import.meta.main) {
	const ajv = new Ajv2020({ allErrors: true, strict: true });
	const validate = ajv.compile(entrySchema);
	const report = createReport();
	// Preflight first, then write (spec §5.3): the corpus-level checks
	// run before any entry streams past, and report every problem.
	const patches = await loadCorpus();
	const manifestRecords = await loadManifest();
	const pin = `sha256:${(await computeSnapshot()).combined}`;
	const preflight = corpusPreflight(patches, manifestRecords, pin);
	if (preflight.length > 0) {
		throw new Error(
			`patch-corpus preflight failed (${preflight.length} problem(s)):\n${preflight
				.map((p) => `${p.patchId ?? p.rid ?? '(corpus)'}: ${p.reason}`)
				.join('\n')}`,
		);
	}
	report.patches.corpus = patches.length;
	const patchGroups = patchesByRid(patches);
	for await (const source of readSourceEntries()) {
		processEntry(source, report, validate, patchGroups);
		patchGroups.delete(source.rid);
	}
	// A patch whose rid never streamed past targets a nonexistent entry.
	for (const [rid, group] of patchGroups) {
		report.patches.problems.push(
			`${group[0]?.id ?? rid}: no source entry with rid ${rid}`,
		);
	}
	await Bun.write(REPORT_PATH, `${JSON.stringify(report, null, '\t')}\n`);
	printSummary(report);
	console.log(`report written to ${REPORT_PATH}`);
	if (report.repairFailures.length > 0) {
		throw new Error(
			`repair drift on ${report.repairFailures.length} ${report.repairFailures.length === 1 ? 'entry' : 'entries'}:\n${report.repairFailures.join('\n')}`,
		);
	}
	if (report.patches.problems.length > 0) {
		throw new Error(
			`patch drift on ${report.patches.problems.length} patch(es):\n${report.patches.problems.join('\n')}`,
		);
	}
}

export { brokenTopSequence, startsAtTwo };
