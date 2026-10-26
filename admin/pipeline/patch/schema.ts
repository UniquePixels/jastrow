// biome-ignore-all lint/style/noExcessiveLinesPerFile: one patch grammar: every op's validator beside the union it discriminates.
/**
 * Semantic patch schema (spec
 * docs/archive/specs/2026-08-10-research-process-design.md §4.3).
 *
 * One JSONL record per patch. Eleven ops — `split`, `join`, `nest`,
 * `retag`, `move`, `delete`, `replace`, `reform`, `unref`, `annotate`,
 * `relabel` — each with its own payload shape. The sense ops address a sense by **marker token +
 * content-hash anchor**, never by array index: an earlier structural
 * patch must not shift a later patch's target. `unref` instead
 * addresses one item of the entry's `refs[]`, by **exact value +
 * content-hash anchor** (`refs[<item>]:<anchor>`); `reform` the
 * headword block (`forms:<anchor>`); and `replace` or `annotate` may
 * instead address the `language_reference` field
 * (`language_reference:<anchor>`, review ledger L50).
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
import { isIsoDate } from '../../entry/annotations.ts';
import { parseHeadwordLine } from '../../entry/headwords.ts';
import { serialize, tokenize } from '../../entry/html.ts';
import type { Annotation } from '../../entry/types.ts';
import { declaredRunReason } from '../body/lettered.ts';
import type {
	AnnotationNote,
	SourceEntry,
	SourceHomograph,
	SourceSense,
} from '../types.ts';

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
/** `language_reference:<anchor>` — the etymology paren Sefaria keeps in
 * its own field (`(b. h.; X I)`, `ch. = h. X I`), which the import
 * folds into the gloss head of `senses[0]` (`body/rejoin.ts`). Used by
 * `replace` and `annotate` (review ledger L50). The field is one
 * string, so like the headword block it is addressed whole and
 * resolves once or not at all. */
const LANGUAGE_REFERENCE_TARGET =
	/^language_reference:(?<anchor>[0-9a-f]{8})$/u;
/** The ops that may address `language_reference`: the one that edits
 * text, and the one that pins a kept reading of it. */
const LANGUAGE_REFERENCE_OPS: ReadonlySet<unknown> = new Set([
	'annotate',
	'replace',
]);
/** The closed sense-marker grammar (`N)` / `—N)`) — the only tokens a
 * patch may synthesize (spec §4.3, no-new-text validator). */
const CLOSED_MARKER = /^—?\d{1,2}\)$/u;
/** A `split`'s marker: the closed grammar, or print's starred sense
 * marker (`—*2)`, ruling 10-04 sense star) that upstream left inside a
 * definition (review ledger L36). A split synthesizes nothing: the
 * token is cut from the text, exactly once, and becomes the sibling's
 * number, which `body/labels.ts` reads with its star. */
const SPLIT_MARKER = /^—?\*?\d{1,2}\)$/u;
/** One digit: the character a split's numeral may not follow
 * (`markerOffsets`). */
const DIGIT = /\d/u;
/** A list item's marker as `nest` carries it: the closed grammar,
 * print's star, or a single lowercase letter — the shapes
 * `body/labels.ts` parses into a label, so every child a nest makes
 * has one. A nest synthesizes nothing: each token is cut from the
 * text, never added to it. */
const NEST_MARKER = /^—?\*?(?:\d{1,2}|[a-z])\)$/u;
/** One letter of a `relabel` run: the letter alone, as a lettered
 * child's label stores it. */
const RUN_LETTER = /^[a-z]$/u;
/** Text that sits tight against a marker a `join` folds back: the
 * space print sets after `N)` is already there, or print sets
 * punctuation hard against the `)` (`preced. 2), being`, `Is. XL,
 * 1); a. fr.`). Any other text gets the one space back. */
const TIGHT_AFTER_MARKER: RegExp = /^[\s,.:;)\]]/u;
/** The last character of the text a `join` folds a marker after,
 * where print sets the numeral tight against it (review ledger L61):
 * a space already there, a dash or an open paren or bracket, or a
 * digit, where the numeral ends a page, column or verse number and
 * its `)` closes the paren (`P. Sm. 4012)`, U01674; `Gen. IV, 22)`,
 * S01040). Anything else gets print's space back: `(v. אָנַךְ 2)`,
 * `<i>Af.</i> 1)`. */
const TIGHT_BEFORE_MARKER: RegExp = /[\s\d—([]$/u;

/** The kind of repair a patch makes. It is the discriminant of
 * `SemanticPatch`, so each op's payload type travels with it, and the
 * key every payload validator is registered under in
 * `PAYLOAD_VALIDATORS` — which is typed `Record<PatchOp, …>`, so
 * adding an op without its validator does not compile. */
type PatchOp =
	| 'annotate'
	| 'delete'
	| 'join'
	| 'move'
	| 'nest'
	| 'reform'
	| 'relabel'
	| 'replace'
	| 'retag'
	| 'split'
	| 'unref';

/** Which ops change what a reader sees as TEXT — a word, a mark, the
 * sense the words stand in, a headword, a `refs` item or the entry a
 * cite links to — and so may not stand on Sefaria's text alone (ruling
 * `10-26 patch evidence`): the import refuses one whose `evidence` is
 * `sefaria-only` unless it is `pending` a re-read
 * (`evidenceProblems`, `apply.ts`). Typed `Record<PatchOp, …>`, so an
 * op added without a verdict here does not compile.
 *
 * Text-changing:
 * - `replace` swaps an exact substring: the words, or, on an anchor,
 *   the entry a cite links to (the 166 cite retargets). Class A of
 *   the 2026-10-25 review (P000194, P000197, P000221, P000268).
 * - `reform` rewrites the headword line. Class B (P000291–P000300).
 * - `unref` removes a `refs[]` item, a reference the entry carried.
 *   Class A (P000232).
 * - `delete` removes a segment or a whole sense.
 * - `move` reorders the words of a definition.
 * - `split` cuts a definition at an in-text marker: the marker leaves
 *   the gloss and the text after it becomes a sense of its own. No
 *   byte is added, but the reader sees different sense text. Class D
 *   (P000389).
 * - `join` folds a sense back into the definition before it, adding
 *   its marker and print's spaces to that text. Class D (P000388).
 * - `nest` cuts a restarted list out of a sense into a new sibling's
 *   children: a `split` that makes children.
 *
 * Not text-changing:
 * - `retag` sets a sense's `number` token, from the closed marker
 *   grammar, and nothing else: no word, no sense boundary, no link.
 *   A label is not text (DESIGN.md §5, `relabel`). The number is
 *   determined by the run Jastrow's own
 *   text sets (an implied `1)` before a `—2)`, a renumber after a
 *   doubled `4)`; ruling `10-13 correction policy`, case 2), so its
 *   normal evidence is `jastrow-text`.
 * - `relabel` declares the labels a lettered run's children take;
 *   it edits no text (DESIGN.md §5).
 * - `annotate` changes nothing: it records a print reading kept. */
const TEXT_CHANGING: Readonly<Record<PatchOp, boolean>> = {
	annotate: false,
	delete: true,
	join: true,
	move: true,
	nest: true,
	reform: true,
	relabel: false,
	replace: true,
	retag: false,
	split: true,
	unref: true,
};

/** Where a reviewed patch's print evidence comes from (ruling `10-26
 * patch evidence`):
 * - `maintainer-read`: a person read the scan; `reader` and `date`
 *   say who and when. The only kind that can witness a Hebrew reading.
 * - `hOCR`: a line of the print hOCR (`data/print/hocr/`), quoted
 *   verbatim as `quote` from leaf `leaf` of volume `volume`. It
 *   witnesses Latin text, numerals, punctuation and position only:
 *   vol. 2's hOCR holds no Hebrew at all, and vol. 1's garbles it.
 *   The import checks the quote is on that leaf (`evidenceLocator`).
 * - `jastrow-text`: Jastrow's own text elsewhere in the entry or the
 *   corpus determines the change, as `quote` (the `—2)` after an
 *   implied `1)`, a run with a doubled number). Ruling `10-13
 *   correction policy`, case 2.
 * - `sefaria-only`: nothing but Sefaria's text. Refused on a
 *   text-changing op (`TEXT_CHANGING`) unless `pending`: the 2026-10-26
 *   backfill marked every record it could not tie to print so, and
 *   each re-read batch removes the flag from its members.
 *
 * `leaf` and `volume` locate the print evidence on the scans the page
 * index is pinned to (IIIF `$n` is leaf `n − 1`), always together; the
 * import checks the leaf shows the patch's entry. */
type EvidenceKind =
	| 'hOCR'
	| 'jastrow-text'
	| 'maintainer-read'
	| 'sefaria-only';
interface PatchEvidence {
	date?: string;
	kind: EvidenceKind;
	leaf?: number;
	pending?: true;
	quote?: string;
	reader?: string;
	volume?: 1 | 2;
}

/** What a reviewed patch states about the print reading it departs
 * from or keeps (ANNOTATIONS.md §3; ruling `10-13 correction
 * policy`). The import adds the rest of the entry's `Annotation`:
 * `field` from the op and its payload, `stored` from the value after
 * the build, `source` from the patch id. Only a reviewed patch may
 * carry one, and only on an op that can change a printed value
 * (`ANNOTATED_OPS`), or on `annotate`. */
interface PatchAnnotation {
	date: string;
	evidence: string;
	kind: Annotation['kind'];
	printed: string;
}

/** Record that print's reading was checked and is kept (case 3), on
 * the field of the target that holds it. Changes nothing: the target
 * — a sense, or the headword block — is pinned by `expected_before`
 * like any other, so a kept note fails loudly when upstream rewrites
 * the text it describes instead of describing text that is gone.
 *
 * `gloss`, `label` and `units` sit on a `sense[…]` target, and the
 * build finds the gloss or unit that holds `annotation.printed`;
 * `homograph` and `text` sit on a `forms:` target, on the parsed form
 * `form` names. A `gloss` or `units` note may name, as `child`, the
 * lettered child of the target that holds the text (review ledger
 * L67): the children exist only once the build splits the target's
 * text (`body/lettered.ts`), so the target is the host, the draft
 * rides it, and the build moves the draft onto the child whose label
 * is `child` (`body/lettered-children.ts`). */
type AnnotatePayload =
	| { child?: string; field: 'gloss' | 'units' }
	| { field: 'label' }
	| { field: 'homograph' | 'text'; form: number };

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

/** Nest the list that restarts inside the target sense under a new
 * unlabelled sibling (ruling `10-12 nested sublists`): a dual's own
 * `1) … 2)`, a derived noun's after `Hence`, a participle's `a) … 2)`.
 * The target keeps the text before `lead`; the sibling inserted at
 * host+1 takes `lead` as its definition and the list as its `senses`,
 * one child per marker, each carrying its marker verbatim as its
 * `number` and the text up to the next marker (the last, to the end
 * of the definition) as its definition. Byte-conserving: host + lead +
 * every marker and child text is the original definition, in order.
 *
 * Only a run that closes the sense nests — the list's last item runs
 * to the end of the definition, as print sets the four rows that
 * asked for it — and apply refuses a target carrying `grammar` or
 * child `senses`, which a nest would bury. `split` makes a sibling;
 * this is the one op that makes a sense the child of another. */
interface NestPayload {
	/** The new sense's own text: from the cut to the first marker. It
	 * must occur exactly once in the definition, not open it, and be
	 * followed directly by `markers[0]`. */
	lead: string;
	/** The list's markers in print order (`NEST_MARKER`). After the
	 * first, each must occur exactly once in the text after `lead`,
	 * and after the one before it. */
	markers: string[];
}

/** Relabel the lettered run the target sense's text holds, where print
 * skipped a letter (review ledger L59; ruling `10-13 correction
 * policy`, case 2: P00790's Hif. `a) b) c) d) f) g) h)` becomes `a b c
 * d e f g`). The plain lettered rule ends a run at the first letter out
 * of sequence (`body/lettered.ts`, L56), so a gapped run never splits
 * past the gap, and no other op can reach the children: they are made
 * by the build, at trace time, after every patch.
 *
 * `run` is print's letters in the order the text sets them, gap
 * included; `to` the labels the children take, `a`, `b`, `c`… from
 * `a`, as long as `run`. The text is not touched — a label is not text
 * — so the apply leaves the pair on the sense as a draft
 * (`SourceSense.relabel`), after checking that the sense's counted
 * markers read exactly `run`. The build splits at exactly those
 * markers, labels each child from `to`, and annotates each child whose
 * label departs from print's letter. Reviewed only, and annotated
 * whenever it changes a label (`print-error`, `printed: ''`: the
 * import reads each changed label's printed letter from `run`). A run
 * print sets whole that the plain rule leaves unsplit (review ledger
 * L57, J00403) is declared with `to` equal to `run`: it only forces
 * the split, and carries no annotation. */
interface RelabelPayload {
	run: string[];
	to: string[];
}

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
 * bounded that way, so a `reform` belongs in `admin/pipeline/patch/records/reviewed/`
 * where a person wrote it from the print — the print, not
 * concatenation, is what settles a form whose pointing the source
 * lost.
 *
 * **`gloss` is the text a repair lifts OFF the line.** Headword design
 * §4's H4 row reads `X = Y` as headword `X` and the cross-reference
 * `= Y`, which belongs in the gloss — and the entries that hold such a
 * line have no sense for it to move into (A01175, A01345: #113). So
 * the reform that takes `= Y` off the line is the one that puts it
 * down, in one record, and the text cannot go missing between two
 * patches. It is refused on an entry that already has a sense: the
 * field ADDS the first sense, it never addresses or overwrites one —
 * an edit to existing sense text is a sense op's job.
 *
 * **`homographs` sets a numeral on a form without touching its
 * text** (ruling 10-09 reform homographs): a numeral print sets and
 * Sefaria dropped (worklist pile B), or an I Jastrow's own text names
 * where print sets none (ruling 10-13 correction policy, which retired
 * 10-06's hidden `implied` I). `headword` is the string internal links
 * resolve by, and writing ` I` into it would dangle every link that
 * names Sefaria's spelling. Each item names a form by its index in the
 * parsed line, and every numeral is displayed, so the patch supplies a
 * `display` that sets it (rule 3). */
interface ReformPayload {
	display?: string;
	forms: string[];
	gloss?: string;
	homographs?: SourceHomograph[];
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
	/** The print reading this patch departs from or keeps
	 * (`PatchAnnotation`). Absent on most patches. */
	annotation?: PatchAnnotation;
	/** Set only by the loader, from the directory a patch was read from:
	 * `admin/pipeline/patch/records/reviewed/` holds patches a person wrote from a print
	 * check, and they may add bytes. A record never carries it. */
	author?: 'human';
	defect_class: string;
	/** Where the change's print evidence comes from (`PatchEvidence`).
	 * Every reviewed patch carries one (`corpusPreflight` refuses a
	 * reviewed patch without it); an agent patch has none. */
	evidence?: PatchEvidence;
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
	/** `provisional`: a patch under dispute. It stays valid and in the
	 * corpus, but the import does not apply it; it is counted and
	 * listed as a `patch-provisional` row until the dispute is settled
	 * (ruling `10-26 patch evidence`). Absent on every patch that
	 * applies. */
	status?: 'provisional';
	target: string;
}

interface AnnotatePatch extends PatchBase {
	op: 'annotate';
	payload: AnnotatePayload;
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
interface NestPatch extends PatchBase {
	op: 'nest';
	payload: NestPayload;
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
interface RelabelPatch extends PatchBase {
	op: 'relabel';
	payload: RelabelPayload;
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
	| AnnotatePatch
	| DeletePatch
	| JoinPatch
	| MovePatch
	| NestPatch
	| ReformPatch
	| RelabelPatch
	| ReplacePatch
	| RetagPatch
	| SplitPatch
	| UnrefPatch;

/** Every patch that edits a sense — all ops but `unref` and `reform`,
 * which address `refs[]` and the headword block, and `annotate` and
 * `relabel`, which edit no text. */
type SensePatch = Exclude<
	SemanticPatch,
	AnnotatePatch | ReformPatch | RelabelPatch | UnrefPatch
>;

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

/** Parse a `language_reference:<anchor>` address. */
function parseLanguageReferenceTarget(target: string): PatchTarget {
	const m = LANGUAGE_REFERENCE_TARGET.exec(target);
	if (m?.groups?.['anchor'] === undefined) {
		throw new PatchFormatError(`target "${target}"`, [
			'expected language_reference:<8-hex-anchor>',
		]);
	}
	return { anchor: m.groups['anchor'], token: '' };
}

/** Whether a record's op and target address `language_reference`. */
function onLanguageReference(op: unknown, target: unknown): boolean {
	return (
		LANGUAGE_REFERENCE_OPS.has(op) &&
		typeof target === 'string' &&
		LANGUAGE_REFERENCE_TARGET.test(target)
	);
}

/** Whether a patch addresses `language_reference` rather than a sense:
 * a `replace` or an `annotate` on a `language_reference:` target. */
function addressesLanguageReference(patch: SemanticPatch): boolean {
	return onLanguageReference(patch.op, patch.target);
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
	if (addressesForms(patch)) {
		// An entry has exactly one headword block, so the count is 0 or
		// 1 — the same question apply asks, kept in one place so drift
		// and carry-over read it the same way.
		return formsBlock(entry) === patch.expected_before ? 1 : 0;
	}
	if (addressesLanguageReference(patch)) {
		// One field, so 0 or 1, as for the headword block. An entry
		// without the field resolves nothing.
		return entry.language_reference === patch.expected_before ? 1 : 0;
	}
	return resolveTarget(entry, parseTarget(patch.target)).length;
}

/** Whether a patch addresses the headword block (`forms:`): every
 * `reform`, and an `annotate` on a form. */
function addressesForms(patch: SemanticPatch): boolean {
	return (
		patch.op === 'reform' ||
		(patch.op === 'annotate' && FORMS_TARGET.test(patch.target))
	);
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

/** The fields `annotate` takes: the sense's, then the form's. */
const SENSE_FIELDS: ReadonlySet<string> = new Set(['gloss', 'label', 'units']);
const FORM_FIELDS: ReadonlySet<string> = new Set(['homograph', 'text']);

/** `annotate`: a known field, and a form index exactly when the field
 * is a form's. Which target the field needs is `annotateTargetReasons`'
 * question, since the payload alone cannot see the target. */
function annotatePayloadReasons(p: Record<string, unknown>): string[] {
	const field = p['field'];
	if (
		typeof field !== 'string' ||
		!(SENSE_FIELDS.has(field) || FORM_FIELDS.has(field))
	) {
		return [
			'annotate payload.field must be gloss, homograph, label, text or units',
		];
	}
	if (p['child'] !== undefined) {
		return annotateChildReasons(field, p['child']);
	}
	if (SENSE_FIELDS.has(field)) {
		return p['form'] === undefined
			? []
			: ['annotate payload.form is only for homograph and text'];
	}
	const form = p['form'];
	return Number.isInteger(form) && (form as number) >= 0
		? []
		: ['annotate payload.form must be a form index (a non-negative integer)'];
}

/** `annotate`'s `child` (L67): a lettered child's label, on a text
 * field. A child's label is not annotated here: a `relabel` states
 * the labels its run's children take. */
function annotateChildReasons(field: string, child: unknown): string[] {
	if (field !== 'gloss' && field !== 'units') {
		return ['annotate payload.child is only for gloss and units'];
	}
	return typeof child === 'string' && RUN_LETTER.test(child)
		? []
		: [
				"annotate payload.child must be a lettered child's label, one letter a-z",
			];
}

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

/** `nest`: a non-empty lead, and a non-empty list of item markers,
 * each a label token (`NEST_MARKER`) and none twice — a repeated
 * token could not be found exactly once. */
function nestPayloadReasons(p: Record<string, unknown>): string[] {
	const reasons: string[] = [];
	if (!nonEmptyString(p['lead'])) {
		reasons.push('nest payload.lead must be a non-empty string');
	}
	const markers = p['markers'];
	if (!Array.isArray(markers) || markers.length === 0) {
		reasons.push('nest payload.markers must be a non-empty array');
		return reasons;
	}
	if (markers.some((m) => typeof m !== 'string' || !NEST_MARKER.test(m))) {
		reasons.push(
			'nest payload.markers must each be a label token (N) / —N) / *N) / a))',
		);
	}
	if (new Set(markers).size !== markers.length) {
		reasons.push('nest payload.markers must not repeat a token');
	}
	return reasons;
}

/** Whether `value` is an array of single letters (`RUN_LETTER`). */
function runLetters(value: unknown): value is string[] {
	return (
		Array.isArray(value) &&
		value.every((v) => typeof v === 'string' && RUN_LETTER.test(v))
	);
}

/** `relabel`: `run` and `to` letter arrays of one length, at least
 * two; `run` with no letter twice, since each must be found once; and
 * `to` the consecutive run from `a`. The two may be the same: a run
 * print sets whole that the plain rule cannot split (review ledger
 * L57, J00403) is declared to force the split, and relabels nothing. */
function relabelPayloadReasons(p: Record<string, unknown>): string[] {
	const { run, to } = p;
	if (!(runLetters(run) && runLetters(to))) {
		return (['run', 'to'] as const)
			.filter((key) => !runLetters(p[key]))
			.map(
				(key) =>
					`relabel payload.${key} must be an array of single letters a–z`,
			);
	}
	if (run.length < 2) {
		return ['relabel payload.run must hold at least two letters'];
	}
	if (to.length !== run.length) {
		return ['relabel payload.to must be as long as payload.run'];
	}
	const reasons: string[] = [];
	if (new Set(run).size !== run.length) {
		reasons.push('relabel payload.run must not repeat a letter');
	}
	if (to.some((letter, i) => letter !== String.fromCodePoint(97 + i))) {
		reasons.push('relabel payload.to must run a, b, c… from a');
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

/** `split`: the marker must be a closed-grammar marker, starred or
 * not (`SPLIT_MARKER`). */
function splitPayloadReasons(p: Record<string, unknown>): string[] {
	if (typeof p['marker'] !== 'string' || !SPLIT_MARKER.test(p['marker'])) {
		return [
			'split payload.marker must match the closed marker grammar (N) / —N)), starred or not',
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
	if (p['gloss'] !== undefined && !nonEmptyString(p['gloss'])) {
		reasons.push('reform gloss must be a non-empty string when present');
	}
	reasons.push(
		...reformHomographReasons(
			p['homographs'],
			Array.isArray(forms) ? forms.length : 0,
		),
	);
	return reasons;
}

/** The `homographs` half of a reform payload, or no reasons when it is
 * absent. Each item names one form, once, by an index inside the
 * payload's `forms` (`homographItemReasons`). Whether the indexed form
 * is free of a printed numeral is a question about the parsed line, so
 * `finishEntry` asks it. */
function reformHomographReasons(homographs: unknown, forms: number): string[] {
	if (homographs === undefined) {
		return [];
	}
	if (!Array.isArray(homographs) || homographs.length === 0) {
		return ['reform homographs must be a non-empty array when present'];
	}
	const reasons: string[] = [];
	const seen = new Set<unknown>();
	for (const item of homographs as (Record<string, unknown> | null)[]) {
		const form = item?.['form'];
		if (seen.has(form)) {
			reasons.push(`reform homographs: form ${String(form)} twice`);
		}
		seen.add(form);
		reasons.push(...homographItemReasons(item ?? {}, forms));
	}
	return reasons;
}

/** The keys a `homographs` item holds. `implied` left with ruling
 * 10-13 correction policy, and a record that still carries it is
 * refused rather than read as a plain numeral. */
const HOMOGRAPH_ITEM_KEYS: ReadonlySet<string> = new Set(['form', 'homograph']);

/** One `homographs` item: only the keys {@link HOMOGRAPH_ITEM_KEYS}
 * names, a form index inside the payload's `forms`, and a positive
 * integer numeral. */
function homographItemReasons(
	item: Record<string, unknown>,
	forms: number,
): string[] {
	const { form, homograph } = item;
	const reasons: string[] = Object.keys(item)
		.filter((key) => !HOMOGRAPH_ITEM_KEYS.has(key))
		.map((key) => `reform homographs: ${key} is not a field`);
	if (
		!(
			Number.isInteger(form) &&
			(form as number) >= 0 &&
			(form as number) < forms
		)
	) {
		reasons.push(
			`reform homographs: form ${String(form)} is not one of the ${forms} form(s)`,
		);
	}
	if (!Number.isInteger(homograph) || (homograph as number) < 1) {
		reasons.push('reform homographs: homograph must be a positive integer');
	}
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
	annotate: annotatePayloadReasons,
	delete: deletePayloadReasons,
	join: joinPayloadReasons,
	move: movePayloadReasons,
	nest: nestPayloadReasons,
	relabel: relabelPayloadReasons,
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
	'annotate',
	'delete',
	'join',
	'move',
	'nest',
	'reform',
	'relabel',
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
	if (op === 'annotate' && FORMS_TARGET.test(text)) {
		return parseFormsTarget(text);
	}
	if (onLanguageReference(op, text)) {
		return parseLanguageReferenceTarget(text);
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
		const misplacedForms =
			raw['op'] !== 'reform' &&
			raw['op'] !== 'annotate' &&
			FORMS_TARGET.test(text);
		const misplacedReference = LANGUAGE_REFERENCE_TARGET.test(text);
		const misplaced =
			(misplacedRefs ? 'refs[…] targets are only for unref' : undefined) ??
			(misplacedForms
				? 'forms: targets are only for reform and annotate'
				: undefined) ??
			(misplacedReference
				? 'language_reference: targets are only for replace and annotate'
				: undefined);
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

/** Reasons from the provenance fields: rationale, defect_class,
 * snapshot pin, prompt_version, status. `confidence` left with ruling
 * `10-26 patch evidence` (770 of 770 reviewed records said `high`); a
 * record that still carries one is not refused for it, since nothing
 * reads it. */
function metadataReasons(raw: Record<string, unknown>): string[] {
	const reasons: string[] = [];
	if ('status' in raw && raw['status'] !== 'provisional') {
		reasons.push('status, when present, must be provisional');
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

/** What each evidence kind must state beside `kind`: who read the
 * scan and when; where the hOCR line is and what it reads; the text of
 * Jastrow's that determines the change. `sefaria-only` states nothing. */
const EVIDENCE_REQUIRES: Readonly<
	Record<EvidenceKind, readonly (keyof PatchEvidence)[]>
> = {
	hOCR: ['leaf', 'quote', 'volume'],
	'jastrow-text': ['quote'],
	'maintainer-read': ['date', 'reader'],
	'sefaria-only': [],
};
const EVIDENCE_KEYS: ReadonlySet<string> = new Set([
	'date',
	'kind',
	'leaf',
	'pending',
	'quote',
	'reader',
	'volume',
]);

/** Reasons the locator — `leaf` and `volume`, which name a leaf only
 * together — is malformed. */
function evidenceLocatorReasons(e: Record<string, unknown>): string[] {
	const reasons: string[] = [];
	if (
		'leaf' in e &&
		!(Number.isInteger(e['leaf']) && (e['leaf'] as number) >= 0)
	) {
		reasons.push('evidence.leaf must be a non-negative integer');
	}
	if ('volume' in e && e['volume'] !== 1 && e['volume'] !== 2) {
		reasons.push('evidence.volume must be 1 or 2');
	}
	if ('leaf' in e !== 'volume' in e) {
		reasons.push('evidence.leaf and evidence.volume go together');
	}
	return reasons;
}

/** Reasons the value of each present evidence field is malformed,
 * whatever the kind. */
function evidenceFieldReasons(e: Record<string, unknown>): string[] {
	const reasons = evidenceLocatorReasons(e);
	for (const key of ['quote', 'reader'] as const) {
		if (key in e && !nonEmptyString(e[key])) {
			reasons.push(`evidence.${key} must be a non-empty string`);
		}
	}
	if ('date' in e && !(typeof e['date'] === 'string' && isIsoDate(e['date']))) {
		reasons.push('evidence.date must be an ISO date (YYYY-MM-DD)');
	}
	if (
		'pending' in e &&
		(e['pending'] !== true || e['kind'] !== 'sefaria-only')
	) {
		reasons.push('evidence.pending is true, and only on sefaria-only evidence');
	}
	return reasons;
}

/** Reasons a present `evidence` is malformed (`PatchEvidence`): an
 * object of known keys, a known kind with everything that kind must
 * state, and well-formed fields. Whether a patch must carry one, and
 * whether its op may stand on `sefaria-only`, are the preflight's
 * (`apply.ts`), which knows who wrote it. */
function evidenceReasons(raw: Record<string, unknown>): string[] {
	const evidence = raw['evidence'];
	if (evidence === undefined) {
		return [];
	}
	if (
		typeof evidence !== 'object' ||
		evidence === null ||
		Array.isArray(evidence)
	) {
		return ['evidence must be an object'];
	}
	const e = evidence as Record<string, unknown>;
	const reasons = Object.keys(e)
		.filter((key) => !EVIDENCE_KEYS.has(key))
		.map((key) => `evidence.${key} is not an evidence field`);
	const kind = e['kind'];
	// An own key only: an inherited name such as `toString` is not a kind.
	const required =
		typeof kind === 'string' && Object.hasOwn(EVIDENCE_REQUIRES, kind)
			? EVIDENCE_REQUIRES[kind as EvidenceKind]
			: undefined;
	if (required === undefined) {
		reasons.push(
			'evidence.kind must be hOCR, jastrow-text, maintainer-read or sefaria-only',
		);
	} else {
		for (const key of required.filter((k) => !(k in e))) {
			reasons.push(`${String(e['kind'])} evidence needs evidence.${key}`);
		}
	}
	return [...reasons, ...evidenceFieldReasons(e)];
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
	if (
		raw['op'] === 'annotate' &&
		typeof raw['target'] === 'string' &&
		FORMS_TARGET.test(raw['target']) &&
		(occurrences !== 1 || index !== 1)
	) {
		reasons.push(
			'annotate on the forms: expected_occurrences and occurrence_index must both be 1',
		);
	}
	if (
		onLanguageReference(raw['op'], raw['target']) &&
		(occurrences !== 1 || index !== 1)
	) {
		reasons.push(
			'a language_reference: target resolves once: expected_occurrences and occurrence_index must both be 1',
		);
	}
	return reasons;
}

/** The ops whose change can depart from a printed value, so may carry
 * an annotation (ANNOTATIONS.md §3), with `annotate`, which records a
 * value kept. `split`, `join`, `nest`, `move`, `delete` and `unref`
 * cut, rejoin, reorder or remove what Sefaria mis-segmented or
 * duplicated: never. */
const ANNOTATED_OPS: ReadonlySet<string> = new Set([
	'annotate',
	'reform',
	'relabel',
	'replace',
	'retag',
]);
/** The ops that never stand without an annotation, and why: `annotate`
 * is one. A `relabel` needs one exactly when it changes a label
 * (`relabelOwesAnnotation`). */
const ANNOTATION_REQUIRED: Readonly<Record<string, string>> = {
	annotate: 'annotate needs an annotation',
};

/** Whether a `relabel` record changes any label, so owes an
 * annotation: every label it changes departs from print, and one that
 * changes none (`run` equal to `to`, L57) departs from nothing. A
 * payload the validator refuses counts as changing, so the record is
 * not also refused for its annotation. */
function relabelOwesAnnotation(payload: Record<string, unknown>): boolean {
	const { run, to } = payload;
	return !(
		Array.isArray(run) &&
		Array.isArray(to) &&
		run.length === to.length &&
		run.every((letter, i) => letter === to[i])
	);
}
/** The keys a patch's `annotation` holds; the import adds the rest. */
const ANNOTATION_KEYS: ReadonlySet<string> = new Set([
	'date',
	'evidence',
	'kind',
	'printed',
]);
const ANNOTATION_KINDS: ReadonlySet<string> = new Set([
	'illegible',
	'kept',
	'print-error',
]);

/** The shape of a present `annotation`: an object of exactly
 * `ANNOTATION_KEYS`, a known kind, a string `printed`, a non-empty
 * `evidence` and a calendar `date`. */
function annotationShapeReasons(annotation: unknown): string[] {
	if (
		typeof annotation !== 'object' ||
		annotation === null ||
		Array.isArray(annotation)
	) {
		return ['annotation must be an object'];
	}
	const a = annotation as Record<string, unknown>;
	const reasons = Object.keys(a)
		.filter((key) => !ANNOTATION_KEYS.has(key))
		.map(
			(key) =>
				`annotation.${key} is not a patch field: the import adds field, stored and source`,
		);
	if (!ANNOTATION_KINDS.has(a['kind'] as string)) {
		reasons.push('annotation.kind must be illegible, kept or print-error');
	}
	if (typeof a['printed'] !== 'string') {
		reasons.push('annotation.printed must be a string');
	}
	if (!nonEmptyString(a['evidence'])) {
		reasons.push('annotation.evidence must be a non-empty string');
	}
	if (typeof a['date'] !== 'string' || !isIsoDate(a['date'])) {
		reasons.push('annotation.date must be an ISO date (YYYY-MM-DD)');
	}
	return reasons;
}

/** What an op asks of the annotation it carries: none on an op that
 * cannot change a printed value; only `kept`, and never none, on
 * `annotate`; exactly one homograph on an annotated `reform` that sets
 * homographs, since the annotation names one form; and a replacement
 * to find on an annotated `replace`. */
function annotatedOpReasons(raw: Record<string, unknown>): string[] {
	const { annotation, op } = raw;
	const payload = (raw['payload'] ?? {}) as Record<string, unknown>;
	if (op === 'relabel') {
		return relabelAnnotationReasons(
			annotation as Record<string, unknown> | undefined,
			relabelOwesAnnotation(payload),
		);
	}
	if (annotation === undefined) {
		const required = ANNOTATION_REQUIRED[op as string];
		return required === undefined ? [] : [required];
	}
	if (!ANNOTATED_OPS.has(op as string)) {
		return [
			`an annotation on ${String(op)}: the op cannot change a printed value (ANNOTATIONS.md §3)`,
		];
	}
	const kind = (annotation as Record<string, unknown>)['kind'];
	if (op === 'annotate' && kind !== 'kept') {
		return [
			'annotate carries only a kept annotation: a correction belongs on the op that makes it',
		];
	}
	const homographs = payload['homographs'];
	if (op === 'reform' && Array.isArray(homographs) && homographs.length !== 1) {
		return [
			'an annotated reform sets exactly one homograph, the one it annotates',
		];
	}
	if (op === 'replace' && payload['replace'] === '') {
		return [
			'an annotated replace needs a non-empty replacement: it is what the annotation finds',
		];
	}
	return [];
}

/** A `relabel`'s annotation: present exactly when the relabel changes
 * a label (`owes`); then a correction (`print-error`), and no
 * `printed` of its own, since each changed child's printed letter is
 * the run's (`RelabelPayload`) and one string could not state three. */
function relabelAnnotationReasons(
	annotation: Record<string, unknown> | undefined,
	owes: boolean,
): string[] {
	if (annotation === undefined) {
		return owes
			? [
					'relabel needs an annotation: every label it changes departs from print',
				]
			: [];
	}
	if (!owes) {
		return [
			'a relabel that changes no label carries no annotation: it departs from no print',
		];
	}
	const reasons: string[] = [];
	if (annotation['kind'] !== 'print-error') {
		reasons.push(
			'relabel carries a print-error annotation: the run it corrects is print’s error',
		);
	}
	if (annotation['printed'] !== '') {
		reasons.push(
			'relabel annotation.printed must be empty: the import reads each changed label’s printed letter from payload.run',
		);
	}
	return reasons;
}

/** How many annotations a patch that applied must write: none without
 * an `annotation`; for a `relabel`, one per child whose label departs
 * from print's letter (`to` against `run`); otherwise one. Gate 10
 * holds each patch to it (`import/gates.ts`). */
function annotationsOwed(patch: SemanticPatch): number {
	if (patch.annotation === undefined) {
		return 0;
	}
	if (patch.op !== 'relabel') {
		return 1;
	}
	const { run, to } = patch.payload;
	return run.filter((letter, i) => letter !== to[i]).length;
}

/** An `annotate`'s field against its target: a form's field needs the
 * headword block, a sense's a sense. */
function annotateTargetReasons(raw: Record<string, unknown>): string[] {
	const field = (raw['payload'] as Record<string, unknown> | undefined)?.[
		'field'
	];
	if (raw['op'] !== 'annotate' || typeof raw['target'] !== 'string') {
		return [];
	}
	if (onLanguageReference('annotate', raw['target'])) {
		if (
			(raw['payload'] as Record<string, unknown> | undefined)?.['child'] !==
			undefined
		) {
			return [
				'annotate on a language_reference: target takes no child: the gloss head it lands in is the host text, before any lettered child',
			];
		}
		// The field is folded into `senses[0]`'s gloss head, so that is
		// the one field a note on it can name. An unknown field already
		// has its reason from the payload check.
		const known =
			SENSE_FIELDS.has(field as string) || FORM_FIELDS.has(field as string);
		return field === 'gloss' || !known
			? []
			: [
					'annotate on a language_reference: target takes field gloss, the gloss head it is folded into',
				];
	}
	const onForms = FORMS_TARGET.test(raw['target']);
	if (FORM_FIELDS.has(field as string) && !onForms) {
		return [`annotate on ${String(field)} needs a forms: target`];
	}
	if (SENSE_FIELDS.has(field as string) && onForms) {
		return [`annotate on ${String(field)} needs a sense[…] target`];
	}
	return [];
}

/** Every reason the record's annotation, or its absence, is refused. */
function annotationReasons(raw: Record<string, unknown>): string[] {
	const shape =
		raw['annotation'] === undefined
			? []
			: annotationShapeReasons(raw['annotation']);
	return [
		...shape,
		...(shape.length > 0 ? [] : annotatedOpReasons(raw)),
		...annotateTargetReasons(raw),
	];
}

/** The pre-§2 `reform` payload, read forward.
 *
 * **TRANSITIONAL.** `reform` shipped on 2026-09-20 with a payload of
 * `headword` plus `alt_headwords`; headword design §2 made the line a
 * single `forms[]` on 2026-09-21, and the 15 records already in
 * `admin/pipeline/patch/records/reviewed/` were written under the old spelling. A
 * patch corpus is EVIDENCE — a person wrote each record from the
 * print — so it is read forward rather than rewritten under the
 * author's name, the same way the entry validator read the committed
 * entry tree forward until that tree's own batched rewrite.
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
	// The legacy spelling predates `display`, `gloss` and `homographs`, and the
	// rebuild below keeps only the forms. A record mixing the two would
	// lose them without a word — for a `gloss`, the cross-reference the
	// line gave up — so it is left alone and refused by name instead.
	if ('display' in p || 'gloss' in p || 'homographs' in p) {
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
		...annotationReasons(raw),
		...evidenceReasons(raw),
	];
	const occurrences = raw['expected_occurrences'] ?? 1;
	const index = raw['occurrence_index'] ?? 1;
	if (reasons.length > 0) {
		const context =
			typeof raw['id'] === 'string' ? `patch ${raw['id']}` : 'patch <no id>';
		throw new PatchFormatError(context, reasons);
	}
	return {
		...(raw['annotation'] === undefined
			? {}
			: { annotation: raw['annotation'] }),
		defect_class: raw['defect_class'],
		...(raw['evidence'] === undefined ? {} : { evidence: raw['evidence'] }),
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
		...(raw['status'] === undefined ? {} : { status: raw['status'] }),
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

/** The ops that leave the target's text exactly as it was: `annotate`
 * changes nothing, and `relabel` leaves a draft beside the text. Two
 * of them on one target cannot invalidate each other's anchor, which
 * is all the one-patch-per-target rule guards against, so a target
 * may carry several (review ledger L67: J00403's kept `)` is noted on
 * the sense P000820's relabel declares the run on). */
const TEXT_KEEPING_OPS: ReadonlySet<string> = new Set(['annotate', 'relabel']);

/** Corpus preflight over already-parsed patches: unique ids, one
 * patch per (rid, target) unless every patch on it keeps the text
 * (`TEXT_KEEPING_OPS`). Reports every problem, not just the first. */
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
		if (group.length > 1 && !group.every((p) => TEXT_KEEPING_OPS.has(p.op))) {
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

/** Every offset at which `marker` stands as a sense marker in `text`:
 * each non-overlapping occurrence, less those whose numeral a digit
 * immediately precedes (review ledger L81). A digit before `1)` makes
 * it the tail of a longer number — print's page `261)`, a verse, a
 * column — not a marker, so A00675's `p. 18; 261) 1) Ulam` holds the
 * marker `1)` once. A `—1)` or `*1)` opens on its own mark, so a digit
 * before it is not before the numeral and the rule never reaches it.
 * The character is read in code, not by a lookbehind. */
function markerOffsets(text: string, marker: string): number[] {
	const offsets: number[] = [];
	if (marker === '') {
		return offsets;
	}
	const numeralFirst = DIGIT.test(marker.charAt(0));
	let at = text.indexOf(marker);
	while (at !== -1) {
		if (!(numeralFirst && DIGIT.test(text.charAt(at - 1)))) {
			offsets.push(at);
		}
		at = text.indexOf(marker, at + marker.length);
	}
	return offsets;
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
	if (patch.op === 'annotate') {
		return applyAnnotate(entry, patch);
	}
	if (patch.op === 'relabel') {
		return applyRelabel(entry, patch);
	}
	if (patch.op === 'replace' && addressesLanguageReference(patch)) {
		return applyReferenceReplace(entry, patch);
	}
	const copy = structuredClone(entry);
	const position = locateSense(copy, patch);
	mutateSense(patch, position, position.sense.definition ?? '');
	if (patch.annotation !== undefined) {
		// Only `retag` and `replace` reach here with one
		// (`ANNOTATED_OPS`), and both leave the sense they edited where
		// it stood, so `position.sense` is the edited sense.
		const note = annotationNote(patch, patch.annotation);
		addSenseDraft(
			position.sense,
			patch.op === 'replace'
				? { ...note, field: 'gloss-or-units', find: patch.payload.replace }
				: { ...note, field: 'label' },
		);
	}
	return copy;
}

/** A patch's annotation with its id as `source`: the half of an entry
 * annotation the patch knows. */
function annotationNote(
	patch: SemanticPatch,
	annotation: PatchAnnotation,
): AnnotationNote {
	return { ...annotation, source: patch.id };
}

/** Append a draft to a sense's list, creating the list. */
function addSenseDraft(
	sense: SourceSense,
	draft: NonNullable<SourceSense['annotations']>[number],
): void {
	sense.annotations = [...(sense.annotations ?? []), draft];
}

/** Append a draft to the entry's form list, creating the list. */
function addFormDraft(
	entry: SourceEntry,
	draft: NonNullable<SourceEntry['formAnnotations']>[number],
): void {
	entry.formAnnotations = [...(entry.formAnnotations ?? []), draft];
}

/** Assert `language_reference` still reads as `expected_before`. */
function assertReference(entry: SourceEntry, patch: SemanticPatch): string {
	const reference = entry.language_reference;
	if (reference === undefined || reference !== patch.expected_before) {
		throw new PatchApplyError(
			patch.id,
			'expected_before does not match language_reference — the source moved under the patch (maintenance track, spec §6)',
		);
	}
	return reference;
}

/** The sense a `language_reference` annotation rides: source sense 0,
 * the one the gloss head is built on (`buildTrace` carries its drafts
 * to `senses[0]`). A stem in that place carries no drafts to the head,
 * and an entry with no sense has none to carry, so both are refused
 * rather than leaving an annotation gate 10 would find unwritten. */
function headSense(entry: SourceEntry, patch: SemanticPatch): SourceSense {
	const [first] = entry.content.senses;
	if (first === undefined || first.grammar !== undefined) {
		throw new PatchApplyError(
			patch.id,
			'an annotation on language_reference rides the gloss head, and the entry has no first text sense to carry it',
		);
	}
	return first;
}

/** `replace` on `language_reference`: swap the one exact find inside
 * the field. An annotation names the gloss of `senses[0]`, where the
 * import folds the field (ANNOTATIONS.md §3). */
function applyReferenceReplace(
	entry: SourceEntry,
	patch: ReplacePatch,
): SourceEntry {
	const reference = assertReference(entry, patch);
	const { find, replace } = patch.payload;
	const at = exactlyOnce(patch, reference, find, 'replace find');
	const copy = structuredClone(entry);
	copy.language_reference =
		reference.slice(0, at) + replace + reference.slice(at + find.length);
	if (patch.annotation !== undefined) {
		addSenseDraft(headSense(copy, patch), {
			...annotationNote(patch, patch.annotation),
			field: 'gloss',
			find: replace,
		});
	}
	return copy;
}

/** `annotate`: assert the target still reads as `expected_before`, and
 * leave a draft for the field — nothing else changes. */
function applyAnnotate(entry: SourceEntry, patch: AnnotatePatch): SourceEntry {
	const copy = structuredClone(entry);
	const note = annotationNote(patch, patch.annotation as PatchAnnotation);
	const { payload } = patch;
	if (addressesLanguageReference(patch)) {
		assertReference(copy, patch);
		addSenseDraft(headSense(copy, patch), {
			...note,
			field: 'gloss',
			find: note.printed,
		});
		return copy;
	}
	if ('form' in payload) {
		if (formsBlock(copy) !== patch.expected_before) {
			throw new PatchApplyError(
				patch.id,
				'expected_before does not match the headword block — the text this annotation keeps moved (maintenance track, spec §6)',
			);
		}
		addFormDraft(copy, { ...note, field: payload.field, form: payload.form });
		return copy;
	}
	const { sense } = locateSense(copy, patch);
	if (payload.field === 'label') {
		if (sense.number === undefined) {
			throw new PatchApplyError(
				patch.id,
				'annotate on a label: the sense has no number',
			);
		}
		addSenseDraft(sense, { ...note, field: 'label' });
	} else {
		addSenseDraft(sense, {
			...note,
			...('child' in payload && payload.child !== undefined
				? { child: payload.child }
				: {}),
			field: payload.field,
			find: note.printed,
		});
	}
	return copy;
}

/** The one form whose text an annotated `reform` of the forms changes,
 * by its index in the parsed line — the index `finishEntry` reads the
 * draft by, since it parses the same line. Both lines are parsed, so a
 * respelling the parser reads as notation (a numeral, a star) is not
 * mistaken for a change of text. Throws unless exactly one form's text
 * changed and the line kept its number of forms: the annotation names
 * one form, and any other count would leave which one a guess. */
function changedForm(patch: ReformPatch): number {
	const before = parseHeadwordLine(patch.expected_before.split('\n')).headwords;
	const after = parseHeadwordLine(patch.payload.forms).headwords;
	const fail = (what: string): PatchApplyError =>
		new PatchApplyError(
			patch.id,
			`an annotated reform of the forms must change exactly one form's text; this one ${what}`,
		);
	if (before.length !== after.length) {
		throw fail(
			`changes the number of forms (${before.length} → ${after.length})`,
		);
	}
	const changed = after.flatMap((form, i) =>
		form.text === before[i]?.text ? [] : [i],
	);
	const [only] = changed;
	if (changed.length !== 1 || only === undefined) {
		throw fail(`changes ${changed.length} forms`);
	}
	return only;
}

/** `reform`: replace the headword line on a copy of the entry, after
 * asserting that the block still reads exactly as `expected_before`.
 * A single-form payload removes `alt_headwords` rather than writing
 * `[]`, so an entry with no alternates looks the way the rest of the
 * corpus does. A `gloss` becomes the entry's only sense, and only on
 * an entry that has none (see `ReformPayload`). `display` and
 * `homographs` are the line's: each is written when the payload
 * carries it and removed when it does not, so the patch states the
 * whole line. */
function applyReform(entry: SourceEntry, patch: ReformPatch): SourceEntry {
	const before = formsBlock(entry);
	if (before !== patch.expected_before) {
		throw new PatchApplyError(
			patch.id,
			'expected_before does not match the headword block — the source moved under the patch (maintenance track, spec §6)',
		);
	}
	const { gloss } = patch.payload;
	if (gloss !== undefined && entry.content.senses.length > 0) {
		throw new PatchApplyError(
			patch.id,
			`reform gloss adds the first sense, and the entry already has ${entry.content.senses.length}`,
		);
	}
	const copy = structuredClone(entry);
	if (gloss !== undefined) {
		copy.content.senses = [{ definition: gloss }];
	}
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
	if (patch.payload.homographs === undefined) {
		// biome-ignore lint/performance/noDelete: key must vanish
		delete copy.homographs;
	} else {
		copy.homographs = patch.payload.homographs.map((h) => ({ ...h }));
	}
	if (patch.annotation !== undefined) {
		// One homograph set means the annotation is on that numeral
		// (`annotatedOpReasons` holds it to one); none means it is on the
		// text of the one form the reform respelled.
		const note = annotationNote(patch, patch.annotation);
		const [numeral] = patch.payload.homographs ?? [];
		addFormDraft(
			copy,
			numeral === undefined
				? { ...note, field: 'text', form: changedForm(patch) }
				: { ...note, field: 'homograph', form: numeral.form },
		);
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

/** `relabel`: leave the declared run on the target sense
 * (`RelabelPayload`), its text untouched, once the sense's counted
 * markers are shown to read exactly `run` (`declaredRunReason`, the
 * check the build splits by). Refused on a stem header, which holds no
 * text; on a sense with children, which another patch made and the
 * build would put after the run's; and on a sense that already
 * carries a run. */
function applyRelabel(entry: SourceEntry, patch: RelabelPatch): SourceEntry {
	const copy = structuredClone(entry);
	const { sense } = locateSense(copy, patch);
	if (sense.grammar !== undefined) {
		throw new PatchApplyError(
			patch.id,
			'relabel target carries grammar: a stem header holds no lettered run',
		);
	}
	if ((sense.senses ?? []).length > 0) {
		throw new PatchApplyError(
			patch.id,
			'relabel target already has child senses (from another patch); a relabel’s children are built from its text',
		);
	}
	if (sense.relabel !== undefined) {
		throw new PatchApplyError(
			patch.id,
			`relabel target already carries a declared run (${sense.relabel.source})`,
		);
	}
	const { run, to } = patch.payload;
	const reason = declaredRunReason(sense.definition ?? '', run);
	if (reason !== undefined) {
		throw new PatchApplyError(patch.id, reason);
	}
	sense.relabel = {
		...(patch.annotation === undefined
			? {}
			: { note: annotationNote(patch, patch.annotation) }),
		run: [...run],
		source: patch.id,
		to: [...to],
	};
	return copy;
}

/** Resolve a sense patch's target in `copy` and assert its pre-state:
 * resolved count, occurrence index, and expected_before. */
function locateSense(
	copy: SourceEntry,
	patch: AnnotatePatch | RelabelPatch | SensePatch,
): SensePosition {
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
		case 'nest':
			applyNest(patch, position, definition);
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
 * sibling, or into its own head when it is the first sibling. The
 * marker goes back with print's space after it (`foldMarker`). */
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
		position.sense.definition = foldMarker(token, definition);
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
		const before = previous.definition ?? '';
		previous.definition =
			before + spaceBefore(before, token) + foldMarker(token, definition);
		position.siblings.splice(position.index, 1);
	}
}

/** The marker `token` set back in front of the text Sefaria minted
 * from it. Sefaria's split ate the space print sets after the `)`
 * (`Pi. 2)praise`, L58), so the fold puts one back unless the text
 * already starts with whitespace or with punctuation print sets hard
 * against the `)`. Only that one space: the space print sets BEFORE
 * the numeral is not the fold's to restore. */
/** The space print sets before a marker a `join` folds back after
 * `before`, or none (`TIGHT_BEFORE_MARKER`, read on the visible text).
 * A dashed token (`—3)`) is set tight by print, and an empty `before`
 * leaves nothing to space from. */
function spaceBefore(before: string, token: string): '' | ' ' {
	// What decides the space is what the reader sees, not an href: the
	// entry tokenizer's text tokens, as `transform/no-new-text.ts`'s
	// `stripTags` reads them, never a one-pass tag regex.
	const visible = serialize(
		tokenize(before).filter((piece) => piece.kind === 'text'),
	);
	return visible === '' ||
		token.startsWith('—') ||
		TIGHT_BEFORE_MARKER.test(visible)
		? ''
		: ' ';
}

function foldMarker(token: string, definition: string): string {
	const gap =
		definition === '' || TIGHT_AFTER_MARKER.test(definition) ? '' : ' ';
	return token + gap + definition;
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

/** `nest`: cut the definition at `lead`, and insert the lead plus the
 * list after it as a new unlabelled sibling whose children are the
 * list's items (see `NestPayload`). Every position is asserted before
 * anything moves, so a refused nest leaves the sense as it was. */
function applyNest(
	patch: NestPatch,
	position: SensePosition,
	definition: string,
): void {
	if (position.sense.grammar !== undefined) {
		throw new PatchApplyError(
			patch.id,
			'nest target carries grammar, which the nest would bury',
		);
	}
	if ((position.sense.senses ?? []).length > 0) {
		throw new PatchApplyError(
			patch.id,
			'nest target has child senses; the list would land after them',
		);
	}
	const { lead, markers } = patch.payload;
	const at = exactlyOnce(patch, definition, lead, 'nest lead');
	if (at === 0) {
		throw new PatchApplyError(
			patch.id,
			'nest lead opens the target; nothing would be left to host it',
		);
	}
	const tail = definition.slice(at + lead.length);
	const starts = nestMarkerStarts(patch, tail, markers);
	const children: SourceSense[] = markers.map((marker, i) => ({
		definition: tail.slice(
			(starts[i] ?? 0) + marker.length,
			starts[i + 1] ?? tail.length,
		),
		number: marker,
	}));
	position.sense.definition = definition.slice(0, at);
	position.siblings.splice(position.index + 1, 0, {
		definition: lead,
		senses: children,
	});
}

/** Where each of a nest's markers starts in `tail` (the text after
 * the lead): each exactly once in `tail`, the first directly at 0 and
 * every later one after the marker before it. */
function nestMarkerStarts(
	patch: NestPatch,
	tail: string,
	markers: readonly string[],
): number[] {
	const [first = ''] = markers;
	// Exactly once, like every later marker: a second copy inside the
	// list would leave which one opens it a guess.
	exactlyOnce(patch, tail, first, 'nest marker');
	if (!tail.startsWith(first)) {
		throw new PatchApplyError(
			patch.id,
			`nest lead is not followed directly by its first marker "${first}"`,
		);
	}
	const starts = [0];
	let floor = first.length;
	for (const marker of markers.slice(1)) {
		const start = exactlyOnce(patch, tail, marker, 'nest marker');
		if (start < floor) {
			throw new PatchApplyError(
				patch.id,
				`nest marker "${marker}" comes before the marker it follows`,
			);
		}
		starts.push(start);
		floor = start + marker.length;
	}
	return starts;
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
 * new sibling numbered by the marker. The marker must stand once as a
 * marker (`markerOffsets`): an `N)` a digit precedes is part of a
 * number and is neither counted nor cut. */
function applySplit(
	patch: SplitPatch,
	position: SensePosition,
	definition: string,
): void {
	const { marker } = patch.payload;
	const offsets = markerOffsets(definition, marker);
	const [at] = offsets;
	if (offsets.length !== 1 || at === undefined) {
		throw new PatchApplyError(
			patch.id,
			`split marker "${marker}" occurs ${offsets.length} times in the target definition as a marker (not after a digit); expected exactly 1`,
		);
	}
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
	// `language_reference` is in it for the reason the headword block
	// is: `replace` edits it (review ledger L50).
	const parts: string[] = [
		formsBlock(entry),
		entry.content.morphology ?? '',
		entry.language_reference ?? '',
	];
	for (const { sense } of walkSenses(entry)) {
		parts.push(sense.number ?? '', sense.definition ?? '');
	}
	return parts.join('');
}

export type {
	AnnotatePayload,
	CorpusProblem,
	DeletePayload,
	EvidenceKind,
	JoinPayload,
	MovePayload,
	NestPayload,
	PatchAnnotation,
	PatchEvidence,
	PatchOp,
	PatchTarget,
	ReformPayload,
	RelabelPayload,
	ReplacePayload,
	RetagPayload,
	SemanticPatch,
	SensePosition,
	SplitPayload,
	UnrefPayload,
};
export {
	addressesLanguageReference,
	annotationsOwed,
	applyPatch,
	CLOSED_MARKER,
	contentAnchor,
	countOccurrences,
	countTarget,
	flattenContent,
	formsBlock,
	markerOffsets,
	PATCH_ID,
	PatchApplyError,
	PatchFormatError,
	parsePatch,
	parsePatchLine,
	parseTarget,
	RID,
	resolveTarget,
	senseTarget,
	TEXT_CHANGING,
	validateCorpus,
	walkSenses,
};
