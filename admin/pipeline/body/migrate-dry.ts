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
import entrySchema from '../schema/entry.schema.json' with { type: 'json' };
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
} from './repairs.ts';
import { readSourceEntries } from './source.ts';
import type { SourceEntry, SourceSense } from './types.ts';

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

interface Report {
	confirmedNoChange: string[];
	deferred: Record<string, string>;
	entries: number;
	gates: Record<'formSection' | 'lettered' | 'rejoin' | 'units', GateTally>;
	recordsByPass: Record<string, RepairRecord[]>;
	recounts: Recounts;
	repairedEntries: number;
}

function* walkSensesDeep(list: SourceSense[]): Generator<SourceSense> {
	for (const sense of list) {
		yield sense;
		if (sense.senses) {
			yield* walkSensesDeep(sense.senses);
		}
	}
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

function tallyGate(tally: GateTally, ok: boolean): void {
	tally.total++;
	if (ok) {
		tally.pass++;
	}
}

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
		recordsByPass: {},
		recounts: {
			brokenTopSequences: [],
			emptyOrUntrimmedBinyanForms: 0,
			labelQuarantines: [],
			schemaFailures: [],
			startsAtTwo: [],
			unresolvedRepairedOrphans: [],
		},
		repairedEntries: 0,
	};
}

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

function processEntry(
	source: SourceEntry,
	report: Report,
	validate: ValidateFunction,
): void {
	report.entries++;
	const { entry, records } = applyRepairs(source);
	if (records.length > 0) {
		report.repairedEntries++;
		for (const record of records) {
			const bucket = report.recordsByPass[record.pass] ?? [];
			bucket.push(record);
			report.recordsByPass[record.pass] = bucket;
		}
	}
	const trace = buildTrace(entry);
	const gates = evaluateRoundTrip(entry, trace);
	tallyGate(report.gates.rejoin, gates.rejoin);
	tallyGate(report.gates.units, gates.units);
	tallyGate(report.gates.lettered, gates.lettered);
	tallyGate(report.gates.formSection, gates.formSection);
	recount(entry, report);
	// Full-corpus schema validation (the dry run samples ~129; here the
	// binyan cleanup is exactly what the 3 sampled failures traced to, so
	// validate everything). Placeholder slug/headword per tallySchema.
	if (!validate(toValidationEntry(entry, trace.body))) {
		report.recounts.schemaFailures.push(entry.rid);
	}
	report.recounts.unresolvedRepairedOrphans.push(
		...unresolvedOrphans(entry).map((item) => `${entry.rid}: ${item}`),
	);
}

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
		`unresolvedRepairedOrphans=${report.recounts.unresolvedRepairedOrphans.length}`,
		`deferred=${Object.keys(report.deferred).length} confirmedNoChange=${report.confirmedNoChange.length}`,
	];
	console.log(lines.join('\n'));
}

if (import.meta.main) {
	const ajv = new Ajv2020({ allErrors: true, strict: true });
	const validate = ajv.compile(entrySchema);
	const report = createReport();
	for await (const source of readSourceEntries()) {
		processEntry(source, report, validate);
	}
	await Bun.write(REPORT_PATH, `${JSON.stringify(report, null, '\t')}\n`);
	printSummary(report);
	console.log(`report written to ${REPORT_PATH}`);
}

export { brokenTopSequence, startsAtTwo };
