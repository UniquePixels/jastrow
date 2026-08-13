/**
 * Entry-result manifest (research-process plan Task 3; spec
 * docs/specs/2026-08-10-research-process-design.md §4.4).
 *
 * The audit trail and the gate: one JSONL record per input rid,
 * carrying exactly one disposition, the ids of that entry's patches,
 * escalation details, and — for `needs_*` rows — the eventual
 * maintainer decision. Flag-without-repair is a first-class outcome,
 * not a fallback. Replay refuses to run while any `needs_*` record
 * is unresolved; `replayGate` is that refusal.
 *
 * This module is pure parsing + validation; the apply engine (plan
 * Task 4) and the sweep ingest (plan Task 7) consume it.
 */
import { PATCH_ID, RID, type SemanticPatch } from '../patch/schema.ts';

// Hoisted per lint/performance/useTopLevelRegex — no state (`g`/`y`)
// flags, so sharing across calls is safe.
const REVIEW_DATE = /^\d{4}-\d{2}-\d{2}$/u;

/** Every entry gets exactly one disposition (spec §4.4). */
const DISPOSITIONS = [
	'clean',
	'needs_human_judgment',
	'needs_print_check',
	'repaired',
] as const;

type Disposition = (typeof DISPOSITIONS)[number];

/** The maintainer's eventual decision on a `needs_*` row — the
 * approval metadata the completeness gate (plan Task 7 ingest,
 * spec §4.4) resolves. */
interface MaintainerResolution {
	/** Review date, `YYYY-MM-DD` (same discipline as the body-review
	 * docs' signed rows). */
	decided_on: string;
	/** The ruling, non-empty. */
	decision: string;
}

/** One manifest record: everything the sweep concluded about one
 * entry. */
interface EntryResult {
	disposition: Disposition;
	/** What was found but not repaired — required on `needs_*` rows,
	 * forbidden elsewhere (a repaired/clean entry has nothing
	 * escalated). */
	escalation?: string;
	/** Ids of this entry's patches. `repaired` requires at least one;
	 * `clean` requires none; `needs_*` may carry confident patches
	 * alongside the escalated issue. */
	patches: string[];
	/** Maintainer decision — only meaningful (and only allowed) on
	 * `needs_*` rows. */
	resolution?: MaintainerResolution;
	rid: string;
}

/** A manifest record (or line) that failed validation, with every
 * reason — never just the first. */
class ManifestFormatError extends Error {
	readonly reasons: string[];
	constructor(context: string, reasons: string[]) {
		super(`${context}: ${reasons.join('; ')}`);
		this.name = 'ManifestFormatError';
		this.reasons = reasons;
	}
}

/** One manifest-level validation problem. */
interface ManifestProblem {
	reason: string;
	rids: string[];
}

function isRecord(value: unknown): value is Record<string, unknown> {
	return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function isDisposition(value: unknown): value is Disposition {
	return (
		typeof value === 'string' &&
		(DISPOSITIONS as readonly string[]).includes(value)
	);
}

/** Validate one decoded JSON value as an `EntryResult`, collecting
 * every problem before throwing. */
function parseEntryResult(value: unknown, context: string): EntryResult {
	const reasons: string[] = [];
	if (!isRecord(value)) {
		throw new ManifestFormatError(context, ['record must be a JSON object']);
	}
	if (typeof value['rid'] !== 'string' || !RID.test(value['rid'])) {
		reasons.push(`rid must match ${RID.source}`);
	}
	if (!isDisposition(value['disposition'])) {
		reasons.push(`disposition must be one of: ${DISPOSITIONS.join(', ')}`);
	}
	const patches: string[] = [];
	if (Array.isArray(value['patches'])) {
		for (const id of value['patches']) {
			if (typeof id !== 'string' || !PATCH_ID.test(id)) {
				reasons.push(`patch id "${String(id)}" must match ${PATCH_ID.source}`);
			} else {
				patches.push(id);
			}
		}
		if (new Set(patches).size !== patches.length) {
			reasons.push('patches must not repeat an id');
		}
	} else {
		reasons.push('patches must be an array of patch ids');
	}
	const needs =
		value['disposition'] === 'needs_print_check' ||
		value['disposition'] === 'needs_human_judgment';
	if (needs) {
		if (
			typeof value['escalation'] !== 'string' ||
			value['escalation'].trim() === ''
		) {
			reasons.push('needs_* rows require a non-empty escalation');
		}
	} else if (value['escalation'] !== undefined) {
		reasons.push(
			'escalation is only allowed on needs_* rows — an entry with an unrepaired finding is not clean/repaired',
		);
	}
	if (value['resolution'] !== undefined) {
		if (!needs) {
			reasons.push('resolution is only allowed on needs_* rows');
		} else if (isRecord(value['resolution'])) {
			if (
				typeof value['resolution']['decision'] !== 'string' ||
				value['resolution']['decision'].trim() === ''
			) {
				reasons.push('resolution.decision must be non-empty');
			}
			if (
				typeof value['resolution']['decided_on'] !== 'string' ||
				!REVIEW_DATE.test(value['resolution']['decided_on'])
			) {
				reasons.push('resolution.decided_on must be a YYYY-MM-DD review date');
			}
		} else {
			reasons.push('resolution must be an object');
		}
	}
	if (value['disposition'] === 'clean' && patches.length > 0) {
		reasons.push('a clean entry cannot carry patches');
	}
	if (value['disposition'] === 'repaired' && patches.length === 0) {
		reasons.push('a repaired entry requires at least one patch id');
	}
	if (reasons.length > 0) {
		throw new ManifestFormatError(context, reasons);
	}
	const result: EntryResult = {
		disposition: value['disposition'] as Disposition,
		patches,
		rid: value['rid'] as string,
	};
	if (value['escalation'] !== undefined) {
		result.escalation = value['escalation'] as string;
	}
	if (value['resolution'] !== undefined) {
		result.resolution = value['resolution'] as unknown as MaintainerResolution;
	}
	return result;
}

/** Parse one JSONL manifest line. */
function parseManifestLine(line: string, lineNumber: number): EntryResult {
	const context = `manifest line ${lineNumber}`;
	let value: unknown;
	try {
		value = JSON.parse(line);
	} catch (e) {
		throw new ManifestFormatError(context, [
			`invalid JSON: ${e instanceof Error ? e.message : String(e)}`,
		]);
	}
	return parseEntryResult(value, context);
}

/** Parse a whole manifest (JSONL text), skipping blank lines. */
function parseManifest(text: string): EntryResult[] {
	const records: EntryResult[] = [];
	const lines = text.split('\n');
	for (const [index, line] of lines.entries()) {
		if (line.trim() !== '') {
			records.push(parseManifestLine(line, index + 1));
		}
	}
	return records;
}

/** The completeness check (spec §4.4): exactly one record per input
 * rid. Reports every duplicate, missing, and unknown rid — never
 * just the first. */
function validateManifest(
	records: readonly EntryResult[],
	inputRids: readonly string[],
): ManifestProblem[] {
	const problems: ManifestProblem[] = [];
	const seen = new Map<string, number>();
	for (const record of records) {
		seen.set(record.rid, (seen.get(record.rid) ?? 0) + 1);
	}
	const duplicates = [...seen.entries()].filter(([, n]) => n > 1);
	if (duplicates.length > 0) {
		problems.push({
			reason: 'duplicate manifest records',
			rids: duplicates.map(([rid]) => rid),
		});
	}
	const input = new Set(inputRids);
	const missing = [...input].filter((rid) => !seen.has(rid));
	if (missing.length > 0) {
		problems.push({ reason: 'input rids without a record', rids: missing });
	}
	const unknown = [...seen.keys()].filter((rid) => !input.has(rid));
	if (unknown.length > 0) {
		problems.push({
			reason: 'records for rids not in the input',
			rids: unknown,
		});
	}
	return problems;
}

/** Cross-check the manifest against the patch corpus: every listed
 * patch exists and belongs to its record's rid; every corpus patch
 * is listed exactly once. */
function reconcilePatches(
	records: readonly EntryResult[],
	patches: readonly SemanticPatch[],
): ManifestProblem[] {
	const problems: ManifestProblem[] = [];
	const corpus = new Map(patches.map((p) => [p.id, p]));
	const listedBy = new Map<string, string[]>();
	for (const record of records) {
		for (const id of record.patches) {
			const rids = listedBy.get(id);
			if (rids === undefined) {
				listedBy.set(id, [record.rid]);
			} else {
				rids.push(record.rid);
			}
			const patch = corpus.get(id);
			if (patch === undefined) {
				problems.push({
					reason: `listed patch ${id} does not exist in the corpus`,
					rids: [record.rid],
				});
			} else if (patch.rid !== record.rid) {
				problems.push({
					reason: `patch ${id} belongs to ${patch.rid}, listed under ${record.rid}`,
					rids: [record.rid, patch.rid],
				});
			}
		}
	}
	for (const [id, rids] of listedBy) {
		if (rids.length > 1) {
			problems.push({
				reason: `patch ${id} is listed by more than one record`,
				rids,
			});
		}
	}
	for (const patch of patches) {
		if (!listedBy.has(patch.id)) {
			problems.push({
				reason: `corpus patch ${patch.id} is not listed by any record`,
				rids: [patch.rid],
			});
		}
	}
	return problems;
}

/** The rows blocking replay: every `needs_*` record with no
 * maintainer resolution yet. */
function unresolvedNeeds(records: readonly EntryResult[]): EntryResult[] {
	return records.filter(
		(r) =>
			(r.disposition === 'needs_print_check' ||
				r.disposition === 'needs_human_judgment') &&
			r.resolution === undefined,
	);
}

/** The replay gate (spec §4.4): refuse while any `needs_*` record is
 * unresolved. Empty result = replay may proceed. */
function replayGate(records: readonly EntryResult[]): ManifestProblem[] {
	const blocking = unresolvedNeeds(records);
	if (blocking.length === 0) {
		return [];
	}
	return [
		{
			reason:
				'unresolved needs_* records block replay — every escalated entry requires a maintainer resolution first',
			rids: blocking.map((r) => r.rid),
		},
	];
}

export type { Disposition, EntryResult, MaintainerResolution, ManifestProblem };
export {
	DISPOSITIONS,
	ManifestFormatError,
	parseEntryResult,
	parseManifest,
	parseManifestLine,
	reconcilePatches,
	replayGate,
	unresolvedNeeds,
	validateManifest,
};
