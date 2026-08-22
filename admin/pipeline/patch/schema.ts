/**
 * Semantic patch schema (research-process plan Task 2; spec
 * docs/specs/2026-08-10-research-process-design.md §4.3).
 *
 * One JSONL record per patch. Five ops — `split`, `retag`, `move`,
 * `delete`, `replace` — each with its own payload shape, addressing a
 * sense by **marker token + content-hash anchor**, never by array
 * index: an earlier structural patch must not shift a later patch's
 * target. `expected_before` (the target sense's exact current
 * definition) is the safety mechanism — apply fails loudly on any
 * mismatch, and that same loud mismatch is the maintenance track's
 * worklist when upstream moves.
 *
 * Corpus preflight rules enforced here (`validateCorpus`):
 * - patch ids are unique;
 * - `target` anchor is self-consistent with `expected_before`
 *   (the anchor is derived from it, so an inconsistent pair can be
 *   rejected without touching any entry);
 * - at most one patch per (rid, target) — two patches on the same
 *   sense always overlap, because the first invalidates the second's
 *   anchor. Agents combine edits to one sense into one patch.
 *
 * Application (`applyPatch`) is pure: entry in, repaired copy out.
 * The corpus-wide engine (snapshot-pin preflight, phase ordering,
 * manifest gating) is Task 4 and composes these functions.
 */
import { createHash } from 'node:crypto';
import type { SourceEntry, SourceSense } from '../body/types.ts';

// Hoisted per lint/performance/useTopLevelRegex — no state (`g`/`y`)
// flags, so sharing across calls is safe.
const PATCH_ID = /^P\d{6}$/u;
const RID = /^[A-Z]\d{5}$/u;
const SNAPSHOT_PIN = /^sha256:[0-9a-f]{64}$/u;
const TARGET = /^sense\[(?<token>[^\]]*)\]:(?<anchor>[0-9a-f]{8})$/u;
/** The closed sense-marker grammar (`N)` / `—N)`) — the only tokens a
 * patch may synthesize (spec §4.3, no-new-text validator). */
const CLOSED_MARKER = /^—?\d{1,2}\)$/u;

type Confidence = 'high' | 'low' | 'med';
type PatchOp = 'delete' | 'move' | 'replace' | 'retag' | 'split';

/** Split an in-text `—N)` run out of its host sense: the host keeps
 * the text before the marker, a new sibling sense is inserted at
 * host+1 carrying the marker as its verbatim `number` token and the
 * text after the marker as its definition. Byte-conserving. */
interface SplitPayload {
	/** The in-text marker token, e.g. `—2)`; must occur exactly once
	 * in the host definition and match the closed marker grammar. */
	marker: string;
}

/** Set (or add) the target sense's `number` field. The new token must
 * come from the closed marker grammar — retag is how an implied `1)`
 * or a lost `—5)` is reinserted. */
interface RetagPayload {
	number: string;
}

/** Move an exact text segment within the target sense's definition to
 * before/after an exact anchor substring. Byte-conserving. */
interface MovePayload {
	/** Exact substring the segment lands next to; must occur exactly
	 * once in the definition after the segment is lifted out. */
	anchor: string;
	position: 'after' | 'before';
	/** Exact substring to move; must occur exactly once. */
	segment: string;
}

/** Delete an exact text segment from the definition (`scope:
 * "segment"`, e.g. a duplicated tail) or the whole target sense
 * (`scope: "sense"`, e.g. an upstream-minted phantom). */
interface DeletePayload {
	scope: 'segment' | 'sense';
	/** Required when scope is `segment`; must occur exactly once. */
	segment?: string;
}

/** Replace an exact substring of the definition. The no-new-text
 * validator holds the replacement to bytes drawn from the find text
 * plus closed-grammar marker tokens (the OCR `l)` → `1)` class). */
interface ReplacePayload {
	/** Exact substring to replace; must occur exactly once. */
	find: string;
	replace: string;
}

interface PatchBase {
	confidence: Confidence;
	defect_class: string;
	/** Exact current definition of the target sense; apply fails
	 * loudly on mismatch. */
	expected_before: string;
	/** Expected number of senses the target resolves to (spec §4.3,
	 * normally exactly 1). */
	expected_occurrences: number;
	id: string;
	/** 1-based document-order index of the match this patch edits;
	 * required to be ≤ expected_occurrences. */
	occurrence_index: number;
	prompt_version: string;
	rationale: string;
	rid: string;
	snapshot: string;
	target: string;
}

interface DeletePatch extends PatchBase {
	op: 'delete';
	payload: DeletePayload;
}
interface MovePatch extends PatchBase {
	op: 'move';
	payload: MovePayload;
}
interface ReplacePatch extends PatchBase {
	op: 'replace';
	payload: ReplacePayload;
}
interface RetagPatch extends PatchBase {
	op: 'retag';
	payload: RetagPayload;
}
interface SplitPatch extends PatchBase {
	op: 'split';
	payload: SplitPayload;
}

type SemanticPatch =
	| DeletePatch
	| MovePatch
	| ReplacePatch
	| RetagPatch
	| SplitPatch;

/** A parsed `sense[<token>]:<anchor>` address. */
interface PatchTarget {
	anchor: string;
	token: string;
}

/** A patch that failed schema validation, with every reason. */
class PatchFormatError extends Error {
	readonly reasons: string[];
	constructor(context: string, reasons: string[]) {
		super(`${context}: ${reasons.join('; ')}`);
		this.name = 'PatchFormatError';
		this.reasons = reasons;
	}
}

/** A patch whose application failed its assertions (target
 * resolution, expected_before, occurrence counts). */
class PatchApplyError extends Error {
	readonly patchId: string;
	constructor(patchId: string, message: string) {
		super(`${patchId}: ${message}`);
		this.name = 'PatchApplyError';
		this.patchId = patchId;
	}
}

/** First 8 hex chars of sha256 — the content anchor half of a target
 * address. */
function contentAnchor(text: string): string {
	return createHash('sha256').update(text).digest('hex').slice(0, 8);
}

/** The target address of a sense as it currently stands. */
function senseTarget(sense: SourceSense): string {
	return `sense[${sense.number ?? ''}]:${contentAnchor(sense.definition ?? '')}`;
}

/** Parse a `sense[<token>]:<anchor>` address. */
function parseTarget(target: string): PatchTarget {
	const m = target.match(TARGET);
	if (m?.groups?.['anchor'] === undefined || m.groups['token'] === undefined) {
		throw new PatchFormatError(`target "${target}"`, [
			'expected sense[<token>]:<8-hex-anchor>',
		]);
	}
	return { anchor: m.groups['anchor'], token: m.groups['token'] };
}

/** One position in an entry's sense tree: the sense plus the sibling
 * array holding it (what split/delete need to mutate). */
interface SensePosition {
	index: number;
	sense: SourceSense;
	siblings: SourceSense[];
}

/** Walk every sense in document order (each sense before its
 * children), yielding mutable positions. */
function* walkSenses(entry: SourceEntry): Generator<SensePosition> {
	function* walk(siblings: SourceSense[]): Generator<SensePosition> {
		for (const [index, sense] of siblings.entries()) {
			yield { index, sense, siblings };
			if (sense.senses !== undefined) {
				yield* walk(sense.senses);
			}
		}
	}
	yield* walk(entry.content.senses);
}

/** Every sense position matching a target address, in document
 * order. */
function resolveTarget(
	entry: SourceEntry,
	target: PatchTarget,
): SensePosition[] {
	const matches: SensePosition[] = [];
	for (const position of walkSenses(entry)) {
		const token = position.sense.number ?? '';
		if (
			token === target.token &&
			contentAnchor(position.sense.definition ?? '') === target.anchor
		) {
			matches.push(position);
		}
	}
	return matches;
}

/** Validate one op's payload shape, returning reasons (empty = ok). */
function payloadReasons(op: PatchOp, payload: unknown): string[] {
	if (typeof payload !== 'object' || payload === null) {
		return ['payload must be an object'];
	}
	const p = payload as Record<string, unknown>;
	switch (op) {
		case 'delete': {
			if (p['scope'] !== 'segment' && p['scope'] !== 'sense') {
				return ['delete payload.scope must be "segment" or "sense"'];
			}
			if (p['scope'] === 'segment' && !nonEmptyString(p['segment'])) {
				return ['delete payload.segment required when scope is "segment"'];
			}
			if (p['scope'] === 'sense' && p['segment'] !== undefined) {
				return ['delete payload.segment must be absent when scope is "sense"'];
			}
			return [];
		}
		case 'move': {
			const reasons: string[] = [];
			if (!nonEmptyString(p['segment'])) {
				reasons.push('move payload.segment must be a non-empty string');
			}
			if (!nonEmptyString(p['anchor'])) {
				reasons.push('move payload.anchor must be a non-empty string');
			}
			if (p['position'] !== 'before' && p['position'] !== 'after') {
				reasons.push('move payload.position must be "before" or "after"');
			}
			return reasons;
		}
		case 'replace': {
			const reasons: string[] = [];
			if (!nonEmptyString(p['find'])) {
				reasons.push('replace payload.find must be a non-empty string');
			}
			if (typeof p['replace'] !== 'string') {
				reasons.push('replace payload.replace must be a string');
			}
			return reasons;
		}
		case 'retag': {
			if (typeof p['number'] !== 'string' || !CLOSED_MARKER.test(p['number'])) {
				return [
					'retag payload.number must match the closed marker grammar (N) / —N))',
				];
			}
			return [];
		}
		case 'split': {
			if (typeof p['marker'] !== 'string' || !CLOSED_MARKER.test(p['marker'])) {
				return [
					'split payload.marker must match the closed marker grammar (N) / —N))',
				];
			}
			return [];
		}
		default:
			return [`unknown op "${op}"`];
	}
}

function nonEmptyString(value: unknown): value is string {
	return typeof value === 'string' && value.length > 0;
}

/** Parse and validate one patch record. Collects every problem into
 * one PatchFormatError instead of stopping at the first. */
function parsePatch(value: unknown): SemanticPatch {
	if (typeof value !== 'object' || value === null) {
		throw new PatchFormatError('patch', ['record must be an object']);
	}
	const raw = value as Record<string, unknown>;
	const reasons: string[] = [];
	if (typeof raw['id'] !== 'string' || !PATCH_ID.test(raw['id'])) {
		reasons.push('id must match P<6 digits>');
	}
	if (typeof raw['rid'] !== 'string' || !RID.test(raw['rid'])) {
		reasons.push('rid must match <letter><5 digits>');
	}
	const ops: PatchOp[] = ['delete', 'move', 'replace', 'retag', 'split'];
	if (ops.includes(raw['op'] as PatchOp)) {
		reasons.push(...payloadReasons(raw['op'] as PatchOp, raw['payload']));
	} else {
		reasons.push(`op must be one of ${ops.join(', ')}`);
	}
	if (typeof raw['expected_before'] !== 'string') {
		reasons.push('expected_before must be a string');
	}
	let target: PatchTarget | undefined;
	if (typeof raw['target'] === 'string') {
		try {
			target = parseTarget(raw['target']);
		} catch (e) {
			reasons.push((e as Error).message);
		}
	} else {
		reasons.push('target must be a string');
	}
	// Anchor self-consistency: the anchor is derived from the exact
	// current content, which expected_before claims to be — an
	// inconsistent pair is rejected before any entry is read.
	if (target !== undefined && typeof raw['expected_before'] === 'string') {
		const derived = contentAnchor(raw['expected_before']);
		if (derived !== target.anchor) {
			reasons.push(
				`target anchor ${target.anchor} does not match expected_before (sha256 → ${derived})`,
			);
		}
	}
	if (!['high', 'low', 'med'].includes(raw['confidence'] as string)) {
		reasons.push('confidence must be high, med, or low');
	}
	if (!nonEmptyString(raw['rationale'])) {
		reasons.push('rationale must be a non-empty string');
	}
	if (!nonEmptyString(raw['defect_class'])) {
		reasons.push('defect_class must be a non-empty string');
	}
	if (
		typeof raw['snapshot'] !== 'string' ||
		!SNAPSHOT_PIN.test(raw['snapshot'])
	) {
		reasons.push('snapshot must match sha256:<64 hex>');
	}
	if (!nonEmptyString(raw['prompt_version'])) {
		reasons.push('prompt_version must be a non-empty string');
	}
	const occurrences = raw['expected_occurrences'] ?? 1;
	if (!Number.isInteger(occurrences) || (occurrences as number) < 1) {
		reasons.push('expected_occurrences must be a positive integer');
	}
	const index = raw['occurrence_index'] ?? 1;
	if (
		!Number.isInteger(index) ||
		(index as number) < 1 ||
		(index as number) > (occurrences as number)
	) {
		reasons.push('occurrence_index must be in 1..expected_occurrences');
	}
	if (reasons.length > 0) {
		const context =
			typeof raw['id'] === 'string' ? `patch ${raw['id']}` : 'patch <no id>';
		throw new PatchFormatError(context, reasons);
	}
	return {
		confidence: raw['confidence'],
		defect_class: raw['defect_class'],
		expected_before: raw['expected_before'],
		expected_occurrences: occurrences,
		id: raw['id'],
		occurrence_index: index,
		op: raw['op'],
		payload: raw['payload'],
		prompt_version: raw['prompt_version'],
		rationale: raw['rationale'],
		rid: raw['rid'],
		snapshot: raw['snapshot'],
		target: raw['target'],
	} as SemanticPatch;
}

/** Parse one JSONL corpus line (1-based line number for context). */
function parsePatchLine(line: string, lineNumber: number): SemanticPatch {
	let value: unknown;
	try {
		value = JSON.parse(line);
	} catch {
		throw new PatchFormatError(`line ${lineNumber}`, ['not valid JSON']);
	}
	try {
		return parsePatch(value);
	} catch (e) {
		if (e instanceof PatchFormatError) {
			throw new PatchFormatError(`line ${lineNumber}`, e.reasons);
		}
		throw e;
	}
}

/** One corpus-level validation problem. */
interface CorpusProblem {
	patchIds: string[];
	reason: string;
}

/** Corpus preflight over already-parsed patches: unique ids, one
 * patch per (rid, target). Reports every problem, not just the
 * first. */
function validateCorpus(patches: readonly SemanticPatch[]): CorpusProblem[] {
	const problems: CorpusProblem[] = [];
	const byId = new Map<string, SemanticPatch[]>();
	const byTarget = new Map<string, SemanticPatch[]>();
	for (const patch of patches) {
		push(byId, patch.id, patch);
		push(byTarget, `${patch.rid} ${patch.target}`, patch);
	}
	for (const [id, group] of byId) {
		if (group.length > 1) {
			problems.push({
				patchIds: group.map((p) => p.id),
				reason: `duplicate patch id ${id}`,
			});
		}
	}
	for (const [key, group] of byTarget) {
		if (group.length > 1) {
			problems.push({
				patchIds: group.map((p) => p.id),
				reason: `overlapping patches on the same target (${key}) — the first apply invalidates the second's anchor; combine into one patch`,
			});
		}
	}
	return problems;
}

function push<K, V>(map: Map<K, V[]>, key: K, value: V): void {
	const group = map.get(key);
	if (group === undefined) {
		map.set(key, [value]);
	} else {
		group.push(value);
	}
}

/** Count non-overlapping occurrences of `needle` in `haystack`. */
function countOccurrences(haystack: string, needle: string): number {
	if (needle === '') {
		return 0;
	}
	let count = 0;
	let at = haystack.indexOf(needle);
	while (at !== -1) {
		count += 1;
		at = haystack.indexOf(needle, at + needle.length);
	}
	return count;
}

/** Assert `needle` occurs exactly once in the definition and return
 * its index. */
function exactlyOnce(
	patch: SemanticPatch,
	definition: string,
	needle: string,
	what: string,
): number {
	const count = countOccurrences(definition, needle);
	if (count !== 1) {
		throw new PatchApplyError(
			patch.id,
			`${what} "${needle}" occurs ${count} times in the target definition; expected exactly 1`,
		);
	}
	return definition.indexOf(needle);
}

/** Apply one patch to an entry, returning a repaired deep copy. Pure:
 * the input entry is never mutated. Every assertion — target
 * resolution, occurrence count, expected_before, in-definition
 * occurrence counts — fails loudly with the patch id. */
function applyPatch(entry: SourceEntry, patch: SemanticPatch): SourceEntry {
	if (entry.rid !== patch.rid) {
		throw new PatchApplyError(
			patch.id,
			`patch is for ${patch.rid}, entry is ${entry.rid}`,
		);
	}
	const copy = structuredClone(entry);
	const target = parseTarget(patch.target);
	const matches = resolveTarget(copy, target);
	if (matches.length !== patch.expected_occurrences) {
		throw new PatchApplyError(
			patch.id,
			`target ${patch.target} resolved to ${matches.length} sense(s); expected ${patch.expected_occurrences}`,
		);
	}
	const position = matches[patch.occurrence_index - 1];
	if (position === undefined) {
		throw new PatchApplyError(
			patch.id,
			`occurrence_index ${patch.occurrence_index} out of range`,
		);
	}
	const definition = position.sense.definition ?? '';
	if (definition !== patch.expected_before) {
		throw new PatchApplyError(
			patch.id,
			'expected_before does not match the target definition — the source moved under the patch (maintenance track, spec §6)',
		);
	}
	switch (patch.op) {
		case 'delete': {
			if (patch.payload.scope === 'sense') {
				position.siblings.splice(position.index, 1);
			} else {
				const segment = patch.payload.segment ?? '';
				const at = exactlyOnce(patch, definition, segment, 'delete segment');
				position.sense.definition =
					definition.slice(0, at) + definition.slice(at + segment.length);
			}
			break;
		}
		case 'move': {
			const { anchor, position: side, segment } = patch.payload;
			const at = exactlyOnce(patch, definition, segment, 'move segment');
			const lifted =
				definition.slice(0, at) + definition.slice(at + segment.length);
			const anchorAt = exactlyOnce(patch, lifted, anchor, 'move anchor');
			const insertAt = side === 'before' ? anchorAt : anchorAt + anchor.length;
			position.sense.definition =
				lifted.slice(0, insertAt) + segment + lifted.slice(insertAt);
			break;
		}
		case 'replace': {
			const { find, replace } = patch.payload;
			const at = exactlyOnce(patch, definition, find, 'replace find');
			position.sense.definition =
				definition.slice(0, at) + replace + definition.slice(at + find.length);
			break;
		}
		case 'retag': {
			position.sense.number = patch.payload.number;
			break;
		}
		case 'split': {
			const { marker } = patch.payload;
			const at = exactlyOnce(patch, definition, marker, 'split marker');
			const sibling: SourceSense = {
				definition: definition.slice(at + marker.length),
				number: marker,
			};
			position.sense.definition = definition.slice(0, at);
			position.siblings.splice(position.index + 1, 0, sibling);
			break;
		}
		default: {
			// Exhaustiveness backstop; parsePatch rejects unknown ops.
			throw new PatchApplyError(
				(patch as SemanticPatch).id,
				`unknown op ${(patch as SemanticPatch).op}`,
			);
		}
	}
	return copy;
}

/** Flatten the mutable content of an entry — every sense's number
 * token and definition, in document order, plus the morphology — into
 * one string. This is the byte pool the no-new-text validator
 * compares against. */
function flattenContent(entry: SourceEntry): string {
	const parts: string[] = [entry.content.morphology ?? ''];
	for (const { sense } of walkSenses(entry)) {
		parts.push(sense.number ?? '', sense.definition ?? '');
	}
	return parts.join('');
}

export type {
	Confidence,
	CorpusProblem,
	DeletePayload,
	MovePayload,
	PatchOp,
	PatchTarget,
	ReplacePayload,
	RetagPayload,
	SemanticPatch,
	SensePosition,
	SplitPayload,
};
export {
	applyPatch,
	CLOSED_MARKER,
	contentAnchor,
	countOccurrences,
	flattenContent,
	PATCH_ID,
	PatchApplyError,
	PatchFormatError,
	parsePatch,
	parsePatchLine,
	parseTarget,
	RID,
	resolveTarget,
	senseTarget,
	validateCorpus,
	walkSenses,
};
