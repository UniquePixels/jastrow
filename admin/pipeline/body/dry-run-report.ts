/**
 * Full-corpus dry-run accumulator (design doc §6.0, entry-body-model
 * plan Task 11 — the capstone, split across two files only to stay
 * under the per-file line budget). Every function here is pure
 * bookkeeping over an already-built `BodyEntry`/`SourceEntry` pair — it
 * has no dependency on `dry-run.ts`'s composition, so the two files
 * don't form an import cycle even though `dry-run.ts` (the entry point,
 * `bun body:dry-run`) imports these helpers to drive its corpus walk.
 */
import type { ValidateFunction } from 'ajv';
import { walkSenses } from './census.ts';
import type { RoundTripResult } from './dry-run-verify.ts';
import { MARKERS } from './form-sections.ts';
import { parseMarker } from './grammar.ts';
import { parseLabel, printLabel } from './labels.ts';
import type { BodyEntry, BodySense, SourceEntry } from './types.ts';

const REPORT_PATH = 'data/source/body-dryrun-report.json';
const SCHEMA_SAMPLE_STRIDE = 300;

// The rids the Task 5-9 fixture files (baseline/origin-splits/stems/
// lettered/units-hard.jsonl — the same set dry-run.test.ts sweeps) name
// literally, so every fixtured edge-case shape gets a schema check on the
// full corpus walk regardless of where it lands relative to the stride.
const FIXTURE_SAMPLE_RIDS = new Set([
	'A00014',
	'A00030',
	'A00031',
	'A00043',
	'A00105',
	'A00114',
	'A00417',
	'A01350',
	'A01873',
	'A01999',
	'B01162',
	'C00009',
	'C00031',
	'D00077',
	'D00478',
	'D01096',
	'E00378',
	'J00597',
	'J00603',
	'K00664',
]);

interface Tally {
	pass: number;
	total: number;
}

interface UnitDistribution {
	'0': number;
	'1': number;
	'2': number;
	'3': number;
	'4': number;
	'5+': number;
}

interface QuarantineEntry {
	detail: string;
	rid: string;
}

interface SchemaFailure {
	errors: string;
	rid: string;
}

interface Accumulator {
	entries: number;
	formSection: Tally;
	formSectionSplits: number;
	formSectionSplitsByMarker: Record<string, number>;
	grammar: { quarantined: QuarantineEntry[]; total: number };
	labels: { quarantined: QuarantineEntry[]; regenPass: number; total: number };
	lettered: Tally;
	letteredSplitEntries: number;
	rejoin: Tally;
	schema: { failures: SchemaFailure[]; validated: number };
	stemsCount: number;
	unitDistribution: UnitDistribution;
	units: Tally;
}

function createAccumulator(): Accumulator {
	return {
		entries: 0,
		formSection: { pass: 0, total: 0 },
		formSectionSplits: 0,
		formSectionSplitsByMarker: Object.fromEntries(
			MARKERS.map((marker) => [marker, 0]),
		),
		grammar: { quarantined: [], total: 0 },
		labels: { quarantined: [], regenPass: 0, total: 0 },
		lettered: { pass: 0, total: 0 },
		letteredSplitEntries: 0,
		rejoin: { pass: 0, total: 0 },
		schema: { failures: [], validated: 0 },
		stemsCount: 0,
		unitDistribution: { '0': 0, '1': 0, '2': 0, '3': 0, '4': 0, '5+': 0 },
		units: { pass: 0, total: 0 },
	};
}

function tallyPass(tally: Tally, pass: boolean): void {
	tally.total++;
	if (pass) {
		tally.pass++;
	}
}

function tallyRoundTrip(acc: Accumulator, result: RoundTripResult): void {
	tallyPass(acc.rejoin, result.rejoin);
	tallyPass(acc.units, result.units);
	tallyPass(acc.lettered, result.lettered);
	tallyPass(acc.formSection, result.formSection);
	if (result.formSectionMarker !== null) {
		acc.formSectionSplits++;
		acc.formSectionSplitsByMarker[result.formSectionMarker] =
			(acc.formSectionSplitsByMarker[result.formSectionMarker] ?? 0) + 1;
	}
}

function unitBucket(count: number): keyof UnitDistribution {
	return count >= 5 ? '5+' : (String(count) as keyof UnitDistribution);
}

function* walkBodySenseList(list: BodySense[]): Generator<BodySense> {
	for (const sense of list) {
		yield sense;
		if (sense.senses) {
			yield* walkBodySenseList(sense.senses);
		}
	}
}

/** Every `BodySense` the built entry contains, top-level and nested —
 * lettered children under either a plain sense or a stem sense, plus
 * every stem's own senses. */
function* walkBodyEntry(body: BodyEntry): Generator<BodySense> {
	yield* walkBodySenseList(body.senses);
	for (const stem of body.stems ?? []) {
		yield* walkBodySenseList(stem.senses);
	}
}

/** Tallies the unit-count distribution and lettered-split/stems census
 * over the already-built shape — independent of the round-trip check,
 * this is pure measurement of what got built. `formSectionSiblings`
 * (object identity, not a shape test) excludes the B12 form-section
 * sibling senses `dry-run.ts` appends: their own restarted-numbered
 * children are a genuine split, but a *form-section* one — counting them
 * here would silently inflate `letteredSplitEntries`, which this field's
 * name and Finding 2's census-vs-structural reconciliation both promise
 * is lettered-only. `formSectionSplits` (tallied separately, from
 * `evaluateRoundTrip`) is the dedicated count for this kind of split. */
function tallyStructure(
	body: BodyEntry,
	formSectionSiblings: ReadonlySet<BodySense>,
	acc: Accumulator,
): void {
	let hasSplit = false;
	for (const sense of walkBodyEntry(body)) {
		acc.unitDistribution[unitBucket(sense.units.length)]++;
		if (
			sense.senses &&
			sense.senses.length > 0 &&
			!formSectionSiblings.has(sense)
		) {
			hasSplit = true;
		}
	}
	if (hasSplit) {
		acc.letteredSplitEntries++;
	}
	acc.stemsCount += body.stems?.length ?? 0;
}

/** Independent re-derivation of the label quarantine/regen counts,
 * walking the raw source (via `census.ts`'s shared `walkSenses`) rather
 * than trusting the composition's own bookkeeping — every `sense.number`
 * occurrence in the corpus, known or quarantined. */
function tallyLabels(e: SourceEntry, acc: Accumulator): void {
	for (const sense of walkSenses(e.content.senses)) {
		if (sense.number === undefined) {
			continue;
		}
		acc.labels.total++;
		const parsed = parseLabel(sense.number);
		if ('unknown' in parsed) {
			acc.labels.quarantined.push({ detail: sense.number, rid: e.rid });
			continue;
		}
		if (printLabel(parsed) === sense.number) {
			acc.labels.regenPass++;
		}
	}
}

/** Independent re-derivation of the grammar-marker quarantine count —
 * the marker text itself is already covered by the `rejoin` round-trip
 * gate, so this only tracks parse coverage of the closed vocabulary. */
function tallyGrammar(e: SourceEntry, acc: Accumulator): void {
	if (e.content.morphology === undefined) {
		return;
	}
	acc.grammar.total++;
	const parsed = parseMarker(e.content.morphology);
	if (parsed !== null && 'unknown' in parsed) {
		acc.grammar.quarantined.push({ detail: parsed.unknown, rid: e.rid });
	}
}

function toValidationEntry(
	e: SourceEntry,
	body: BodyEntry,
): Record<string, unknown> {
	return {
		...body,
		headword: { text: e.headword },
		slug: `dryrun-${e.rid}`,
	};
}

/** Every 300th corpus entry (~109 of them) plus every fixture-class rid
 * named above — comfortably over the ≥100 sample the gate requires,
 * without validating the full corpus on every run. */
function shouldValidateSchema(e: SourceEntry, index: number): boolean {
	return index % SCHEMA_SAMPLE_STRIDE === 0 || FIXTURE_SAMPLE_RIDS.has(e.rid);
}

interface ValidationJob {
	body: BodyEntry;
	e: SourceEntry;
	index: number;
}

/** `BodyEntry` has no `slug`/`headword` (migration-scope, out of §6.0) —
 * synthesizes placeholders for schema validation only, per the task
 * brief; these placeholders never appear in the written report itself. */
function tallySchema(
	job: ValidationJob,
	validate: ValidateFunction,
	acc: Accumulator,
): void {
	if (!shouldValidateSchema(job.e, job.index)) {
		return;
	}
	acc.schema.validated++;
	const candidate = toValidationEntry(job.e, job.body);
	if (validate(candidate)) {
		return;
	}
	acc.schema.failures.push({
		errors: JSON.stringify(validate.errors),
		rid: job.e.rid,
	});
}

function printSummary(acc: Accumulator): void {
	console.log(`entries=${acc.entries}`);
	console.log(
		`round-trip rejoin=${acc.rejoin.pass}/${acc.rejoin.total} units=${acc.units.pass}/${acc.units.total} lettered=${acc.lettered.pass}/${acc.lettered.total} formSection=${acc.formSection.pass}/${acc.formSection.total}`,
	);
	console.log(
		`labels total=${acc.labels.total} regenPass=${acc.labels.regenPass} quarantined=${acc.labels.quarantined.length}`,
	);
	console.log(
		`grammar total=${acc.grammar.total} quarantined=${acc.grammar.quarantined.length}`,
	);
	console.log(
		`letteredSplitEntries=${acc.letteredSplitEntries} stems=${acc.stemsCount}`,
	);
	console.log(
		`formSectionSplits=${acc.formSectionSplits} byMarker=${JSON.stringify(acc.formSectionSplitsByMarker)}`,
	);
	console.log(`unitDistribution=${JSON.stringify(acc.unitDistribution)}`);
	console.log(
		`schema validated=${acc.schema.validated} failures=${acc.schema.failures.length}`,
	);
	console.log(`report written to ${REPORT_PATH}`);
}

export type { Accumulator };
export {
	createAccumulator,
	printSummary,
	REPORT_PATH,
	tallyGrammar,
	tallyLabels,
	tallyRoundTrip,
	tallySchema,
	tallyStructure,
};
