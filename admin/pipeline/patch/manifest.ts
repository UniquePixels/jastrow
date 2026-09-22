/**
 * Entry-result manifest (spec
 * docs/archive/specs/2026-08-10-research-process-design.md §4.4).
 *
 * The audit trail and the gate: one JSONL record per input rid,
 * carrying exactly one disposition, the ids of that entry's patches,
 * escalation details, and — for `needs_*` rows — the eventual
 * maintainer decision. Flag-without-repair is a first-class outcome,
 * not a fallback. Replay refuses to run while any `needs_*` record
 * is unresolved; `replayGate` is that refusal.
 *
 * This module is pure parsing + validation; the apply engine and the
 * sweep ingest consume it.
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
 * approval metadata the completeness gate (spec §4.4) resolves. */
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
	/** Why the entry's anomaly hints were rejected. Allowed on ANY
	 * disposition, and that is the point: the sweep prompt requires
	 * every hint judged "with a reason you could defend to the
	 * verification tier", but `escalation` is forbidden on clean and
	 * repaired rows, so without this field a defensible rejection on a
	 * sound entry has nowhere to live — one sweep chunk lost eight such
	 * reasons that way. The verification tier cannot audit hint
	 * judgment, where the sweep does most of its reasoning, without
	 * them. Optional: an entry that received no hints has nothing to
	 * record. */
	hint_notes?: string;
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

/** A plain JSON object — not null, not an array. `typeof null` is
 * `'object'` and so is an array's, so both need excluding by hand
 * before a decoded value can be indexed by key. */
function isRecord(value: unknown): value is Record<string, unknown> {
	return typeof value === 'object' && value !== null && !Array.isArray(value);
}

/** Whether a decoded value is one of the four dispositions. */
function isDisposition(value: unknown): value is Disposition {
	return (
		typeof value === 'string' &&
		(DISPOSITIONS as readonly string[]).includes(value)
	);
}

/** Whether a disposition is one of the two `needs_*` escalations.
 * Several rules below branch on it, and it is the only thing that
 * makes `escalation` and `resolution` legal on a record. */
function isNeeds(disposition: unknown): boolean {
	return (
		disposition === 'needs_print_check' ||
		disposition === 'needs_human_judgment'
	);
}

/** The two fields that identify a record: a well-formed rid and one
 * of the four dispositions. Everything else is judged relative to the
 * disposition, so a record failing here will usually fail again
 * below — by design, since the report names every problem at once. */
function checkIdentity(
	value: Record<string, unknown>,
	reasons: string[],
): void {
	if (typeof value['rid'] !== 'string' || !RID.test(value['rid'])) {
		reasons.push(`rid must match ${RID.source}`);
	}
	if (!isDisposition(value['disposition'])) {
		reasons.push(`disposition must be one of: ${DISPOSITIONS.join(', ')}`);
	}
}

/** The well-formed patch ids, in order. Ill-formed ones are reported
 * and dropped, so later checks (`clean` carries none, `repaired`
 * carries at least one) see only ids that could be real. */
function collectPatches(
	value: Record<string, unknown>,
	reasons: string[],
): string[] {
	if (!Array.isArray(value['patches'])) {
		reasons.push('patches must be an array of patch ids');
		return [];
	}
	const patches: string[] = [];
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
	return patches;
}

/** `escalation` is required on `needs_*` rows and forbidden on the
 * others: an entry carrying an unrepaired finding is by definition
 * neither clean nor repaired, so the field's presence and the
 * disposition have to agree in both directions. */
function checkEscalation(
	value: Record<string, unknown>,
	reasons: string[],
): void {
	if (isNeeds(value['disposition'])) {
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
}

/** `hint_notes` is legal on any disposition — that is the point of
 * the field (see the interface) — but never as an empty string. An
 * entry that received no hints omits it; one that records a rejection
 * has to say what the rejection was. */
function checkHintNotes(
	value: Record<string, unknown>,
	reasons: string[],
): void {
	if (
		value['hint_notes'] !== undefined &&
		(typeof value['hint_notes'] !== 'string' ||
			value['hint_notes'].trim() === '')
	) {
		reasons.push('hint_notes must be a non-empty string when present');
	}
}

/** The maintainer decision, which only a `needs_*` row may carry and
 * which must be a complete object when present: a non-empty ruling
 * and a `YYYY-MM-DD` review date. Each failure stops the checks it
 * makes meaningless — a resolution on a clean row is not then also
 * reported as the wrong shape. */
function checkResolution(
	value: Record<string, unknown>,
	reasons: string[],
): void {
	const resolution = value['resolution'];
	if (resolution === undefined) {
		return;
	}
	if (!isNeeds(value['disposition'])) {
		reasons.push('resolution is only allowed on needs_* rows');
		return;
	}
	if (!isRecord(resolution)) {
		reasons.push('resolution must be an object');
		return;
	}
	if (
		typeof resolution['decision'] !== 'string' ||
		resolution['decision'].trim() === ''
	) {
		reasons.push('resolution.decision must be non-empty');
	}
	if (
		typeof resolution['decided_on'] !== 'string' ||
		!REVIEW_DATE.test(resolution['decided_on'])
	) {
		reasons.push('resolution.decided_on must be a YYYY-MM-DD review date');
	}
}

/** The arity each disposition implies: `clean` carries no patches,
 * `repaired` carries at least one. `needs_*` is deliberately
 * unconstrained — an escalated entry may still hold the patches the
 * sweep was confident about. Reads the ids `collectPatches` accepted,
 * so a malformed id cannot satisfy `repaired`. */
function checkDispositionPatches(
	value: Record<string, unknown>,
	patches: readonly string[],
	reasons: string[],
): void {
	if (value['disposition'] === 'clean' && patches.length > 0) {
		reasons.push('a clean entry cannot carry patches');
	}
	if (value['disposition'] === 'repaired' && patches.length === 0) {
		reasons.push('a repaired entry requires at least one patch id');
	}
}

/** Build the record once validation has passed. The optional fields
 * are assigned rather than spread so an absent one stays absent — the
 * JSONL round trip must not gain `"escalation": undefined` keys. */
function buildEntryResult(
	value: Record<string, unknown>,
	patches: string[],
): EntryResult {
	const result: EntryResult = {
		disposition: value['disposition'] as Disposition,
		patches,
		rid: value['rid'] as string,
	};
	if (value['escalation'] !== undefined) {
		result.escalation = value['escalation'] as string;
	}
	if (value['hint_notes'] !== undefined) {
		result.hint_notes = value['hint_notes'] as string;
	}
	if (value['resolution'] !== undefined) {
		result.resolution = value['resolution'] as unknown as MaintainerResolution;
	}
	return result;
}

/** Validate one decoded JSON value as an `EntryResult`, collecting
 * every problem before throwing.
 *
 * Each check appends to one shared `reasons` list rather than
 * returning, so a bad record is reported in full rather than one
 * problem at a time. The call order below IS the order the reasons
 * come out in, and `manifest.test.ts` pins it (rid before
 * disposition) — reordering these calls is a visible change. */
function parseEntryResult(value: unknown, context: string): EntryResult {
	if (!isRecord(value)) {
		throw new ManifestFormatError(context, ['record must be a JSON object']);
	}
	const reasons: string[] = [];
	checkIdentity(value, reasons);
	const patches = collectPatches(value, reasons);
	checkEscalation(value, reasons);
	checkHintNotes(value, reasons);
	checkResolution(value, reasons);
	checkDispositionPatches(value, patches, reasons);
	if (reasons.length > 0) {
		throw new ManifestFormatError(context, reasons);
	}
	return buildEntryResult(value, patches);
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

/** Walk every listed patch id: record which records claim it (into
 * `listedBy`, which the caller then checks for double claims) and
 * report the ones the corpus cannot account for. */
function checkListedPatches(
	records: readonly EntryResult[],
	corpus: ReadonlyMap<string, SemanticPatch>,
	listedBy: Map<string, string[]>,
): ManifestProblem[] {
	const problems: ManifestProblem[] = [];
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
	return problems;
}

/** Patch ids claimed by more than one record. */
function checkDoubleClaims(
	listedBy: ReadonlyMap<string, readonly string[]>,
): ManifestProblem[] {
	const problems: ManifestProblem[] = [];
	for (const [id, rids] of listedBy) {
		if (rids.length > 1) {
			problems.push({
				reason: `patch ${id} is listed by more than one record`,
				rids: [...rids],
			});
		}
	}
	return problems;
}

/** Corpus patches no record accounts for — the other direction of the
 * same completeness claim. */
function checkUnlistedPatches(
	patches: readonly SemanticPatch[],
	listedBy: ReadonlyMap<string, readonly string[]>,
): ManifestProblem[] {
	const problems: ManifestProblem[] = [];
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

/** Cross-check the manifest against the patch corpus: every listed
 * patch exists and belongs to its record's rid; every corpus patch
 * is listed exactly once. */
function reconcilePatches(
	records: readonly EntryResult[],
	patches: readonly SemanticPatch[],
): ManifestProblem[] {
	const corpus = new Map(patches.map((p) => [p.id, p]));
	// `listedBy` is an out-parameter of the first check and an input to
	// the other two, so the three are bound in order rather than
	// composed in one expression.
	const listedBy = new Map<string, string[]>();
	const listed = checkListedPatches(records, corpus, listedBy);
	const doubleClaimed = checkDoubleClaims(listedBy);
	const unlisted = checkUnlistedPatches(patches, listedBy);
	return [...listed, ...doubleClaimed, ...unlisted];
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
	isNeeds,
	ManifestFormatError,
	parseManifest,
	parseManifestLine,
	reconcilePatches,
	replayGate,
	unresolvedNeeds,
	validateManifest,
};
