// biome-ignore-all lint/style/noExcessiveLinesPerFile: one patch grammar: every op's validator beside the union it discriminates.
/**
 * Semantic patch schema (spec
 * docs/archive/specs/2026-08-10-research-process-design.md §4.3).
 *
 * One JSONL record per patch. Seven ops — `split`, `join`, `retag`,
 * `move`, `delete`, `replace`, `unref` — each with its own payload
 * shape. The six sense ops address a sense by **marker token +
 * content-hash anchor**, never by array index: an earlier structural
 * patch must not shift a later patch's target. `unref` instead
 * addresses one item of the entry's `refs[]`, by **exact value +
 * content-hash anchor** (`refs[<item>]:<anchor>`).
 * `expected_before` (the target's exact current text — a sense's
 * definition, or the `refs[]` item) is the safety mechanism — apply
 * fails loudly on any mismatch, and that same loud mismatch is the
 * maintenance track's worklist when upstream moves.
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
 * manifest gating) is `apply.ts`, which composes these functions.
 */
import { createHash } from 'node:crypto';
import type { SourceEntry, SourceSense } from '../body/types.ts';

// Hoisted per lint/performance/useTopLevelRegex — no state (`g`/`y`)
// flags, so sharing across calls is safe.
/** `P<6 digits>` — the shape of a patch id. Exported because the
 * manifest lists patch ids too, and it checks them against this rule
 * rather than a copy of it. */
const PATCH_ID = /^P\d{6}$/u;
/** `<letter><5 digits>` — the shape of an entry id. Exported for the
 * same reason as `PATCH_ID`: a manifest record's `rid` column and a
 * patch record's `rid` are the same identifier, so they are held to
 * one rule. */
const RID = /^[A-Z]\d{5}$/u;
const SNAPSHOT_PIN = /^sha256:[0-9a-f]{64}$/u;
const TARGET = /^sense\[(?<token>[^\]]*)\]:(?<anchor>[0-9a-f]{8})$/u;
/** `refs[<item>]:<anchor>` — the one non-sense target, used by
 * `unref`. */
const REFS_TARGET = /^refs\[(?<item>.+)\]:(?<anchor>[0-9a-f]{8})$/u;
/** `forms:<anchor>` — the headword block, used by `reform`. The block
 * is addressed WHOLE rather than per item because the repairs that
 * need it change how many forms there are (a torn word rejoined, a
 * missed comma split into two), and an index would shift under them —
 * the failure the anchor design exists to prevent. */
const FORMS_TARGET = /^forms:(?<anchor>[0-9a-f]{8})$/u;
/** The closed sense-marker grammar (`N)` / `—N)`) — the only tokens a
 * patch may synthesize (spec §4.3, no-new-text validator). */
const CLOSED_MARKER = /^—?\d{1,2}\)$/u;

/** How sure the patch's author was, as the record states it. It is
 * provenance, not permission: nothing in the apply path branches on
 * it, because what a patch may do is settled by the validators and by
 * `author` (a reviewed patch is exempt from the no-new-text floor,
 * a confident one is not). A low-confidence patch that passes every
 * check still applies; the value is there for whoever reads the
 * corpus back. */
type Confidence = 'high' | 'low' | 'med';
/** The kind of repair a patch makes. It is the discriminant of
 * `SemanticPatch`, so each op's payload type travels with it, and the
 * key every payload validator is registered under in
 * `PAYLOAD_VALIDATORS` — which is typed `Record<PatchOp, …>`, so
 * adding an op without its validator does not compile. */
type PatchOp =
	| 'delete'
	| 'join'
	| 'move'
	| 'reform'
	| 'replace'
	| 'retag'
	| 'split'
	| 'unref';

/** Split an in-text `—N)` run out of its host sense: the host keeps
 * the text before the marker, a new sibling sense is inserted at
 * host+1 carrying the marker as its verbatim `number` token and the
 * text after the marker as its definition. Byte-conserving. */
interface SplitPayload {
	/** The in-text marker token, e.g. `—2)`; must occur exactly once
	 * in the host definition and match the closed marker grammar. */
	marker: string;
}

/** Fold the target sense back into the text flow it was cut from — the
 * reverse of `split`, for a sense Sefaria minted at a cross-reference's
 * own `N)`. Its number token and definition are appended to the
 * preceding sibling's definition and the sense is removed; a target
 * with no preceding sibling keeps its place, loses its `number`, and
 * takes the token as the head of its definition. Byte-conserving over
 * number + definition only, so apply refuses a target that carries
 * `grammar` or child `senses` (both would be dropped) and a preceding
 * sibling with child `senses` (the text would land after them). */
type JoinPayload = Record<string, never>;

/** Remove one item from the entry's `refs[]` — the one op that
 * addresses `refs[…]` instead of a sense. */
type UnrefPayload = Record<string, never>;

/** Rewrite the whole headword line: every form, and optionally the
 * layout print set them in (headword design §2, §4.1).
 *
 * **`forms` is the whole line, not a headword plus alternates.** The
 * §2 shape reads the line as `headwords[]` with index 0 primary, and
 * the repairs that need this op change the NUMBER of forms — `שׁ` +
 * `ׁוּף` rejoining into one, `טְוִיָּיה טְוִיָּה` splitting into two — so a
 * payload shaped as "the headword, and separately the rest" would make
 * `forms[0]` a special case for no reason. `forms[0]` becomes the
 * entry's `headword` and the rest its `alt_headwords`, which is how
 * the snapshot stores a line; a single-form payload removes
 * `alt_headwords` entirely.
 *
 * **`display` is the only way a layout the source cannot settle ever
 * gets written.** §3 leaves it unset and flags the row rather than
 * guessing, and §4's H2 rows are exactly the lines where two readings
 * are possible. A person reading the print can settle one, and this is
 * where they put it. Omitted, the parser decides as usual.
 *
 * Every other op is byte-conserving within `content`; this one is not
 * bounded that way, so a `reform` belongs in `data/patches/reviewed/`
 * where a person wrote it from the print — the print, not
 * concatenation, is what settles a form whose pointing the source
 * lost. */
interface ReformPayload {
	display?: string;
	forms: string[];
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
	/** Set only by the loader, from the directory a patch was read from:
	 * `data/patches/reviewed/` holds patches a person wrote from a print
	 * check, and they may add bytes. A record never carries it. */
	author?: 'human';
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
interface JoinPatch extends PatchBase {
	op: 'join';
	payload: JoinPayload;
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
interface ReformPatch extends PatchBase {
	op: 'reform';
	payload: ReformPayload;
}
interface UnrefPatch extends PatchBase {
	op: 'unref';
	payload: UnrefPayload;
}

/** One patch record: the common `PatchBase` fields narrowed by `op`
 * to the payload that op takes. A discriminated union rather than a
 * base with a loose `payload` so that `switch (patch.op)` in apply,
 * drift and the no-new-text allowance each read an exactly-typed
 * payload, and an op added without its arm fails to compile. */
type SemanticPatch =
	| DeletePatch
	| JoinPatch
	| MovePatch
	| ReformPatch
	| ReplacePatch
	| RetagPatch
	| SplitPatch
	| UnrefPatch;

/** Every patch that addresses a sense — all ops but `unref` and
 * `reform`, which address `refs[]` and the headword block. */
type SensePatch = Exclude<SemanticPatch, ReformPatch | UnrefPatch>;

/** A parsed `sense[<token>]:<anchor>` address. */
interface PatchTarget {
	anchor: string;
	token: string;
}

/** A patch that failed schema validation, with every reason. */
class PatchFormatError extends Error {
	readonly reasons: string[];
	constructor(context: string, reasons: string[], options?: ErrorOptions) {
		super(`${context}: ${reasons.join('; ')}`, options);
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
	const m = TARGET.exec(target);
	if (m?.groups?.['anchor'] === undefined || m.groups['token'] === undefined) {
		throw new PatchFormatError(`target "${target}"`, [
			'expected sense[<token>]:<8-hex-anchor>',
		]);
	}
	return { anchor: m.groups['anchor'], token: m.groups['token'] };
}

/** Parse a `refs[<item>]:<anchor>` address — `unref`'s target shape. */
function parseRefsTarget(target: string): PatchTarget {
	const m = REFS_TARGET.exec(target);
	if (m?.groups?.['anchor'] === undefined || m.groups['item'] === undefined) {
		throw new PatchFormatError(`target "${target}"`, [
			'unref needs a refs[…] target',
		]);
	}
	return { anchor: m.groups['anchor'], token: m.groups['item'] };
}

/** The headword block as one string: the headword, then every
 * alternate, newline-joined. No form contains a newline, so the join
 * is reversible and the `expected_before` of a `reform` reads as the
 * print line does — one form per line. */
function formsBlock(entry: SourceEntry): string {
	return [entry.headword, ...(entry.alt_headwords ?? [])].join('\n');
}

/** Parse a `forms:<anchor>` address — `reform`'s target shape. */
function parseFormsTarget(target: string): PatchTarget {
	const m = FORMS_TARGET.exec(target);
	if (m?.groups?.['anchor'] === undefined) {
		throw new PatchFormatError(`target "${target}"`, [
			'reform needs a forms:<8-hex-anchor> target',
		]);
	}
	return { anchor: m.groups['anchor'], token: '' };
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

/** How many places a patch's target resolves to in `entry`: senses for
 * every op but `unref`, which counts its item in `refs[]`. The one
 * count every caller shares, so apply, drift and carry-over agree. */
function countTarget(entry: SourceEntry, patch: SemanticPatch): number {
	if (patch.op === 'unref') {
		return (entry.refs ?? []).filter((r) => r === patch.expected_before).length;
	}
	if (patch.op === 'reform') {
		// An entry has exactly one headword block, so the count is 0 or
		// 1 — the same question apply asks, kept in one place so drift
		// and carry-over read it the same way.
		return formsBlock(entry) === patch.expected_before ? 1 : 0;
	}
	return resolveTarget(entry, parseTarget(patch.target)).length;
}

/** Validate one op's payload shape, returning reasons (empty = ok). */
function payloadReasons(op: PatchOp, payload: unknown): string[] {
	if (typeof payload !== 'object' || payload === null) {
		return ['payload must be an object'];
	}
	const validate = PAYLOAD_VALIDATORS[op] as PayloadValidator | undefined;
	if (validate === undefined) {
		return [`unknown op "${op}"`];
	}
	return validate(payload as Record<string, unknown>);
}

/** One op's payload check over an already-object payload; returns
 * reasons (empty = ok). */
type PayloadValidator = (p: Record<string, unknown>) => string[];

/** `delete`: a known scope, with a segment exactly when scope is
 * `segment`. */
function deletePayloadReasons(p: Record<string, unknown>): string[] {
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

/** `join`: the payload must be empty. */
function joinPayloadReasons(p: Record<string, unknown>): string[] {
	return Object.keys(p).length === 0
		? []
		: ['join payload must be an empty object'];
}

/** `move`: segment, anchor and position, every bad field reported. */
function movePayloadReasons(p: Record<string, unknown>): string[] {
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

/** `replace`: a non-empty find and a string replacement. */
function replacePayloadReasons(p: Record<string, unknown>): string[] {
	const reasons: string[] = [];
	if (!nonEmptyString(p['find'])) {
		reasons.push('replace payload.find must be a non-empty string');
	}
	if (typeof p['replace'] !== 'string') {
		reasons.push('replace payload.replace must be a string');
	}
	return reasons;
}

/** `retag`: the new number must be a closed-grammar marker. */
function retagPayloadReasons(p: Record<string, unknown>): string[] {
	if (typeof p['number'] !== 'string' || !CLOSED_MARKER.test(p['number'])) {
		return [
			'retag payload.number must match the closed marker grammar (N) / —N))',
		];
	}
	return [];
}

/** `split`: the marker must be a closed-grammar marker. */
function splitPayloadReasons(p: Record<string, unknown>): string[] {
	if (typeof p['marker'] !== 'string' || !CLOSED_MARKER.test(p['marker'])) {
		return [
			'split payload.marker must match the closed marker grammar (N) / —N))',
		];
	}
	return [];
}

/** `reform`: at least one non-empty form, no newline anywhere — the
 * newline is the block's separator, so a form holding one would make
 * the target ambiguous — and, if a layout is given, one that is a
 * template rather than a second copy of the Hebrew.
 *
 * The `display` clauses are §3.1's rules 1 and 2 applied where the
 * text is still a patch record. Checking them at PARSE time rather
 * than leaving them to `validate.ts` means a malformed template is
 * refused with the patch id beside it, instead of surfacing three
 * stages later as a defect in an entry nobody edited by hand. */
function reformPayloadReasons(p: Record<string, unknown>): string[] {
	const reasons: string[] = [];
	const forms = p['forms'];
	if (
		!Array.isArray(forms) ||
		forms.length === 0 ||
		forms.some((f) => !nonEmptyString(f))
	) {
		reasons.push(
			'reform payload needs forms: a non-empty array of non-empty strings',
		);
	} else if (forms.some((f: string) => f.includes('\n'))) {
		reasons.push('reform forms must not contain a newline');
	}
	// A record holding BOTH spellings is refused rather than
	// half-read: `readLegacyReform` steps aside when `forms` is
	// present, so a stale `headword`/`alt_headwords` beside it would be
	// silently ignored — and a reader of the record would have no way
	// to tell which one the run used.
	for (const stale of ['alt_headwords', 'headword']) {
		if (stale in p) {
			reasons.push(
				`reform payload carries both forms and the pre-2026-09-21 ${stale}`,
			);
		}
	}
	reasons.push(...reformDisplayReasons(p['display'], forms));
	return reasons;
}

/** Hebrew letters and points, which a `display` template must not
 * hold: all the Hebrew of a line comes from its forms (§3.1 rule 2). */
const HEBREW_IN_DISPLAY = /[\u0590-\u05FF]/u;
/** A `{n}` slot. */
const DISPLAY_SLOT = /\{(?<index>\d+)\}/gu;

/** The `display` half of a reform payload, or no reasons when it is
 * absent — which is the ordinary case and means "let the parser
 * decide". */
function reformDisplayReasons(display: unknown, forms: unknown): string[] {
	if (display === undefined) {
		return [];
	}
	if (!nonEmptyString(display)) {
		return ['reform display must be a non-empty string when present'];
	}
	if (display.includes('\n')) {
		return ['reform display must not contain a newline'];
	}
	if (HEBREW_IN_DISPLAY.test(display)) {
		return ['reform display must hold no Hebrew: it comes from the forms'];
	}
	if (!Array.isArray(forms)) {
		return [];
	}
	const slots = [...display.matchAll(DISPLAY_SLOT)]
		.map((m) => Number(m.groups?.['index']))
		.toSorted((a, b) => a - b);
	const wanted = forms.map((_, i) => i);
	if (slots.join(',') !== wanted.join(',')) {
		return [
			`reform display names slots [${slots.join(',')}] for ${forms.length} form(s)`,
		];
	}
	return [];
}

/** `unref`: the payload must be empty. */
function unrefPayloadReasons(p: Record<string, unknown>): string[] {
	return Object.keys(p).length === 0
		? []
		: ['unref payload must be an empty object'];
}

/** The payload validator for each op. */
const PAYLOAD_VALIDATORS: Record<PatchOp, PayloadValidator> = {
	delete: deletePayloadReasons,
	join: joinPayloadReasons,
	move: movePayloadReasons,
	replace: replacePayloadReasons,
	retag: retagPayloadReasons,
	split: splitPayloadReasons,
	reform: reformPayloadReasons,
	unref: unrefPayloadReasons,
};

function nonEmptyString(value: unknown): value is string {
	return typeof value === 'string' && value.length > 0;
}

/** Every op a record may name, in the order the op reason lists them. */
const PATCH_OPS: PatchOp[] = [
	'delete',
	'join',
	'move',
	'reform',
	'replace',
	'retag',
	'split',
	'unref',
];

/** Reasons from the identity fields: no record-set author, id, rid,
 * op and its payload, expected_before. */
function identityReasons(raw: Record<string, unknown>): string[] {
	const reasons: string[] = [];
	if ('author' in raw) {
		reasons.push(
			'author is set by the loader from the patch directory, never by the record',
		);
	}
	if (typeof raw['id'] !== 'string' || !PATCH_ID.test(raw['id'])) {
		reasons.push('id must match P<6 digits>');
	}
	if (typeof raw['rid'] !== 'string' || !RID.test(raw['rid'])) {
		reasons.push('rid must match <letter><5 digits>');
	}
	if (PATCH_OPS.includes(raw['op'] as PatchOp)) {
		reasons.push(...payloadReasons(raw['op'] as PatchOp, raw['payload']));
	} else {
		reasons.push(`op must be one of ${PATCH_OPS.join(', ')}`);
	}
	if (typeof raw['expected_before'] !== 'string') {
		reasons.push('expected_before must be a string');
	}
	return reasons;
}

/** Parse the record's target in the shape its op expects: `refs[…]`
 * for unref, `sense[…]` for every other op. Throws on a bad shape. */
function parseTargetFor(op: unknown, text: string): PatchTarget {
	if (op === 'unref') {
		return parseRefsTarget(text);
	}
	return op === 'reform' ? parseFormsTarget(text) : parseTarget(text);
}

/** Parse the target field, returning the target when it parses and
 * the one reason when it does not. */
function readTarget(raw: Record<string, unknown>): {
	reasons: string[];
	target?: PatchTarget;
} {
	const text = raw['target'];
	if (typeof text !== 'string') {
		return { reasons: ['target must be a string'] };
	}
	try {
		return { reasons: [], target: parseTargetFor(raw['op'], text) };
	} catch (e) {
		const misplacedRefs = raw['op'] !== 'unref' && REFS_TARGET.test(text);
		const misplacedForms = raw['op'] !== 'reform' && FORMS_TARGET.test(text);
		const misplaced =
			(misplacedRefs ? 'refs[…] targets are only for unref' : undefined) ??
			(misplacedForms ? 'forms: targets are only for reform' : undefined);
		return { reasons: [misplaced ?? (e as Error).message] };
	}
}

/** Reasons the parsed target disagrees with the rest of the record:
 * anchor vs expected_before, a refs item that is not expected_before,
 * a join target without a closed-grammar token. */
function anchorReasons(
	raw: Record<string, unknown>,
	target: PatchTarget | undefined,
): string[] {
	if (target === undefined) {
		return [];
	}
	const reasons: string[] = [];
	// Anchor self-consistency: the anchor is derived from the exact
	// current content, which expected_before claims to be — an
	// inconsistent pair is rejected before any entry is read.
	if (typeof raw['expected_before'] === 'string') {
		const derived = contentAnchor(raw['expected_before']);
		if (derived !== target.anchor) {
			reasons.push(
				`target anchor ${target.anchor} does not match expected_before (sha256 → ${derived})`,
			);
		}
		// A refs target names its item in clear; apply matches on
		// expected_before, so a differing item would be a label that lies.
		if (raw['op'] === 'unref' && target.token !== raw['expected_before']) {
			reasons.push(
				`target refs[${target.token}] does not name expected_before`,
			);
		}
	}
	// A join folds the target's number token back into the text; an
	// unnumbered target has none, so the join would only erase a sense
	// boundary.
	if (raw['op'] === 'join' && !CLOSED_MARKER.test(target.token)) {
		reasons.push('join target token must match the closed marker grammar');
	}
	return reasons;
}

/** Reasons from the provenance fields: confidence, rationale,
 * defect_class, snapshot pin, prompt_version. */
function metadataReasons(raw: Record<string, unknown>): string[] {
	const reasons: string[] = [];
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
	return reasons;
}

/** Reasons from expected_occurrences and occurrence_index (each
 * defaulting to 1). */
function occurrenceReasons(raw: Record<string, unknown>): string[] {
	const reasons: string[] = [];
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
	// An entry has exactly ONE headword block, so a reform can only ever
	// resolve once. A larger count would parse, pass `expected_before`,
	// and then fail post-apply — or, through the exported `applyPatch`,
	// rewrite a copy that no caller checks. Refuse it at the record.
	if (raw['op'] === 'reform' && (occurrences !== 1 || index !== 1)) {
		reasons.push(
			'reform expected_occurrences and occurrence_index must both be 1',
		);
	}
	return reasons;
}

/** The pre-§2 `reform` payload, read forward.
 *
 * **TRANSITIONAL.** `reform` shipped on 2026-09-20 with a payload of
 * `headword` plus `alt_headwords`; headword design §2 made the line a
 * single `forms[]` on 2026-09-21, and the 15 records already in
 * `data/patches/reviewed/` were written under the old spelling. A
 * patch corpus is EVIDENCE — a person wrote each record from the
 * print — so it is read forward rather than rewritten under the
 * author's name, the same way `truth.test.ts` reads the committed
 * entry tree forward until its own batched rewrite.
 *
 * The normalization is total and lossless: `[headword, ...alts]` IS
 * the line, in order. It retires when the records are restated, and
 * `schema.test.ts` pins both spellings so neither can drift. */
function readLegacyReform(raw: Record<string, unknown>): void {
	if (raw['op'] !== 'reform') {
		return;
	}
	const payload = raw['payload'];
	if (typeof payload !== 'object' || payload === null) {
		return;
	}
	const p = payload as Record<string, unknown>;
	if ('forms' in p || !('headword' in p)) {
		return;
	}
	// Only a WELL-FORMED legacy payload is read forward. The old
	// validator required `alt_headwords` to be an array of non-empty
	// strings, and coercing a malformed one — a missing key, a bare
	// string — would turn a record the old reader REFUSED into a
	// single-form payload that parses, and then `applyReform` would
	// delete every alternate on the entry. A malformed record is left
	// alone so the new validator rejects it by name.
	if (!nonEmptyString(p['headword']) || !Array.isArray(p['alt_headwords'])) {
		return;
	}
	raw['payload'] = { forms: [p['headword'], ...p['alt_headwords']] };
}

/** The record-level gate: one decoded JSON value in, a validated
 * `SemanticPatch` out, or a `PatchFormatError` carrying **every**
 * reason it failed — identity, target shape, anchor agreement,
 * provenance and occurrence counts are all collected before the throw,
 * never stopped at the first. An agent fixing a malformed record sees
 * the whole list in one pass instead of one problem per run.
 *
 * It works on a shallow copy of `value`, so `readLegacyReform` can
 * normalize the pre-2026-09-21 `reform` spelling forward without
 * mutating the caller's object. */
function parsePatch(value: unknown): SemanticPatch {
	if (typeof value !== 'object' || value === null) {
		throw new PatchFormatError('patch', ['record must be an object']);
	}
	const raw = { ...(value as Record<string, unknown>) };
	readLegacyReform(raw);
	const { reasons: targetReasons, target } = readTarget(raw);
	const reasons = [
		...identityReasons(raw),
		...targetReasons,
		...anchorReasons(raw, target),
		...metadataReasons(raw),
		...occurrenceReasons(raw),
	];
	const occurrences = raw['expected_occurrences'] ?? 1;
	const index = raw['occurrence_index'] ?? 1;
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
	} catch (e) {
		// biome-ignore lint/style/useErrorCause: the cause IS passed — this Error subclass takes it as a third options argument, which the rule does not read.
		throw new PatchFormatError(`line ${lineNumber}`, ['not valid JSON'], {
			cause: e,
		});
	}
	try {
		return parsePatch(value);
	} catch (e) {
		if (e instanceof PatchFormatError) {
			// biome-ignore lint/style/useErrorCause: the cause IS passed — this Error subclass takes it as a third options argument, which the rule does not read.
			throw new PatchFormatError(`line ${lineNumber}`, e.reasons, {
				cause: e,
			});
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
// biome-ignore lint/nursery/noMisleadingReturnType: a loop counter is a number; narrowing to its literal seeds would couple callers to the body.
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
	if (patch.op === 'unref') {
		return applyUnref(entry, patch);
	}
	if (patch.op === 'reform') {
		return applyReform(entry, patch);
	}
	const copy = structuredClone(entry);
	const position = locateSense(copy, patch);
	mutateSense(patch, position, position.sense.definition ?? '');
	return copy;
}

/** `reform`: replace the headword line on a copy of the entry, after
 * asserting that the block still reads exactly as `expected_before`.
 * A single-form payload removes `alt_headwords` rather than writing
 * `[]`, so an entry with no alternates looks the way the rest of the
 * corpus does. */
function applyReform(entry: SourceEntry, patch: ReformPatch): SourceEntry {
	const before = formsBlock(entry);
	if (before !== patch.expected_before) {
		throw new PatchApplyError(
			patch.id,
			'expected_before does not match the headword block — the source moved under the patch (maintenance track, spec §6)',
		);
	}
	const copy = structuredClone(entry);
	const [headword = '', ...alts] = patch.payload.forms;
	copy.headword = headword;
	if (alts.length > 0) {
		copy.alt_headwords = alts;
	} else {
		// `delete`, not `= undefined`: the field is optional under
		// exactOptionalPropertyTypes, and an entry with no alternates
		// carries no key at all in the rest of the corpus.
		// biome-ignore lint/performance/noDelete: key must vanish
		delete copy.alt_headwords;
	}
	if (patch.payload.display === undefined) {
		// biome-ignore lint/performance/noDelete: key must vanish
		delete copy.display;
	} else {
		copy.display = patch.payload.display;
	}
	return copy;
}

/** `unref`: remove the addressed `refs[]` item from a copy of the
 * entry, after asserting its occurrence count. */
function applyUnref(entry: SourceEntry, patch: UnrefPatch): SourceEntry {
	const copy = structuredClone(entry);
	const refs = copy.refs ?? [];
	const hits = refs.flatMap((r, i) => (r === patch.expected_before ? [i] : []));
	if (hits.length !== patch.expected_occurrences) {
		throw new PatchApplyError(
			patch.id,
			`refs item resolved ${hits.length} time(s); expected ${patch.expected_occurrences}`,
		);
	}
	const at = hits[patch.occurrence_index - 1] ?? -1;
	copy.refs = refs.filter((_, i) => i !== at);
	return copy;
}

/** Resolve a sense patch's target in `copy` and assert its pre-state:
 * resolved count, occurrence index, and expected_before. */
function locateSense(copy: SourceEntry, patch: SensePatch): SensePosition {
	const target = parseTarget(patch.target);
	const matches = resolveTarget(copy, target);
	// The pre-state gate: `matches.length` already IS the resolved
	// count, so compare it directly rather than re-parsing `target` and
	// re-walking `copy` a second time for the same number.
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
	return position;
}

/** Apply a sense patch's edit in place at its located position;
 * `definition` is the target's (already asserted) current text. */
function mutateSense(
	patch: SensePatch,
	position: SensePosition,
	definition: string,
): void {
	switch (patch.op) {
		case 'delete':
			applyDelete(patch, position, definition);
			break;
		case 'join':
			applyJoin(patch, position, definition);
			break;
		case 'move':
			applyMove(patch, position, definition);
			break;
		case 'replace':
			applyReplace(patch, position, definition);
			break;
		case 'retag':
			position.sense.number = patch.payload.number;
			break;
		case 'split':
			applySplit(patch, position, definition);
			break;
		default: {
			// Exhaustiveness backstop; parsePatch rejects unknown ops.
			throw new PatchApplyError(
				(patch as SemanticPatch).id,
				`unknown op ${(patch as SemanticPatch).op}`,
			);
		}
	}
}

/** `delete`: drop the whole sense, or its one exact segment. */
function applyDelete(
	patch: DeletePatch,
	position: SensePosition,
	definition: string,
): void {
	if (patch.payload.scope === 'sense') {
		position.siblings.splice(position.index, 1);
		return;
	}
	const segment = patch.payload.segment ?? '';
	const at = exactlyOnce(patch, definition, segment, 'delete segment');
	position.sense.definition =
		definition.slice(0, at) + definition.slice(at + segment.length);
}

/** `join`: fold the target's number + definition into the preceding
 * sibling, or into its own head when it is the first sibling. */
function applyJoin(
	patch: JoinPatch,
	position: SensePosition,
	definition: string,
): void {
	const token = position.sense.number ?? '';
	const previous = position.siblings[position.index - 1];
	// Only number + definition move; anything else on the target
	// (grammar, child senses) would be silently dropped, and text
	// appended to a sibling with children lands after them — out of
	// document order. Refuse all three rather than lose bytes.
	if (position.sense.grammar !== undefined) {
		throw new PatchApplyError(
			patch.id,
			'join target carries grammar, which a join would drop',
		);
	}
	if ((position.sense.senses ?? []).length > 0) {
		throw new PatchApplyError(
			patch.id,
			'join target has child senses, which a join would drop',
		);
	}
	if (position.index === 0) {
		position.sense.definition = token + definition;
		// The key must vanish so an unnumbered sense serialises as one
		// (exactOptionalPropertyTypes forbids assigning undefined).
		// biome-ignore lint/performance/noDelete: key must vanish
		delete position.sense.number;
	} else if (previous === undefined || previous.grammar !== undefined) {
		throw new PatchApplyError(patch.id, 'no text flow to join into');
	} else if ((previous.senses ?? []).length > 0) {
		throw new PatchApplyError(
			patch.id,
			'preceding sibling has child senses; the joined text would land after them',
		);
	} else {
		previous.definition = (previous.definition ?? '') + token + definition;
		position.siblings.splice(position.index, 1);
	}
}

/** `move`: lift the exact segment out and reinsert it beside the
 * exact anchor. */
function applyMove(
	patch: MovePatch,
	position: SensePosition,
	definition: string,
): void {
	const { anchor, position: side, segment } = patch.payload;
	const at = exactlyOnce(patch, definition, segment, 'move segment');
	const lifted =
		definition.slice(0, at) + definition.slice(at + segment.length);
	const anchorAt = exactlyOnce(patch, lifted, anchor, 'move anchor');
	const insertAt = side === 'before' ? anchorAt : anchorAt + anchor.length;
	position.sense.definition =
		lifted.slice(0, insertAt) + segment + lifted.slice(insertAt);
}

/** `replace`: swap the one exact find for the replacement. */
function applyReplace(
	patch: ReplacePatch,
	position: SensePosition,
	definition: string,
): void {
	const { find, replace } = patch.payload;
	const at = exactlyOnce(patch, definition, find, 'replace find');
	position.sense.definition =
		definition.slice(0, at) + replace + definition.slice(at + find.length);
}

/** `split`: cut the definition at the marker and insert the tail as a
 * new sibling numbered by the marker. */
function applySplit(
	patch: SplitPatch,
	position: SensePosition,
	definition: string,
): void {
	const { marker } = patch.payload;
	const at = exactlyOnce(patch, definition, marker, 'split marker');
	const sibling: SourceSense = {
		definition: definition.slice(at + marker.length),
		number: marker,
	};
	position.sense.definition = definition.slice(0, at);
	position.siblings.splice(position.index + 1, 0, sibling);
}

/** Flatten the mutable content of an entry — the headword block, then
 * every sense's number token and definition in document order, plus
 * the morphology — into one string. This is the byte pool the
 * no-new-text validator compares against.
 *
 * **The headword block is part of it BECAUSE `reform` edits it.** A
 * pool that stopped at `content` would let a reform rewrite a headword
 * with bytes from nowhere and still pass: the gate would be measuring
 * fields the op cannot touch. Human-authored patches are exempt from
 * the floor anyway, but an agent-written reform is not, and the
 * exemption must come from provenance, not from a blind spot. */
function flattenContent(entry: SourceEntry): string {
	// **`display` is deliberately NOT in the pool.** It looked like it
	// belonged — a `reform` writes it, and the pool exists so a reform
	// cannot invent bytes. But a template is not text: `({0}, {1})`
	// contributes braces and slot digits that no entry holds, so every
	// well-formed template would be reported as invented and the entry
	// re-dispositioned. That would not be a safety check, it would be a
	// standing refusal dressed as byte accounting.
	//
	// What the pool was guarding against here is a template smuggling
	// TEXT into the line, and `reformDisplayReasons` refuses that
	// directly and by name: a `display` holding any Hebrew fails to
	// parse, with the patch id beside it.
	const parts: string[] = [formsBlock(entry), entry.content.morphology ?? ''];
	for (const { sense } of walkSenses(entry)) {
		parts.push(sense.number ?? '', sense.definition ?? '');
	}
	return parts.join('');
}

export type {
	Confidence,
	CorpusProblem,
	DeletePayload,
	JoinPayload,
	MovePayload,
	PatchOp,
	PatchTarget,
	ReformPayload,
	ReplacePayload,
	RetagPayload,
	SemanticPatch,
	SensePosition,
	SplitPayload,
	UnrefPayload,
};
export {
	applyPatch,
	CLOSED_MARKER,
	contentAnchor,
	countOccurrences,
	countTarget,
	flattenContent,
	formsBlock,
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
