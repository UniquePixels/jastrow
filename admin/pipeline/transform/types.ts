/**
 * The Phase 2 transform contract (spec
 * docs/specs/2026-08-22-transform-module-design.md §3.1).
 *
 * A rule carries a PREDICATE and never an expected count. Counts live
 * in the catalogue and are read only by the audit harness — a source
 * re-fetch must re-baseline an audit, never break the pipeline.
 */
import type { SourceEntry } from '../body/types.ts';

/** The two committed manifest phases a rule may run in
 * (`admin/pipeline/patch/apply.ts:55`). */
type TransformPhase = 'structural-repairs' | 'text-repairs';

/** One instance a rule changed, for the migration report. */
interface TransformRecord {
	detail: string;
	rid: string;
	ruleId: string;
}

/** What one `Rule.apply` call returns (spec §5, §5.1; batch-2 link
 * spec §3.2 for `composed` and `unlinks`). */
interface TransformResult {
	/** Link targets this call ASSEMBLED rather than copied whole
	 * (batch-2 link spec §3.2 case 3). `from` is a target in this
	 * entry's INPUT that supplied the copied work; `target` is the
	 * `data-ref` written. `link-target.ts` takes the longest common
	 * prefix of `from` and `target` — on CODEPOINTS, with no word
	 * boundary — as the copied part, and requires every remaining
	 * character of `target` to occur in that anchor's own display
	 * text. The same test runs on the `href` against the `from`
	 * anchor's own `href`. An undeclared compose is a violation, not
	 * an allowance: a target absent from the input and unclaimed
	 * fails as fabricated.
	 *
	 * A claim is matched to an anchor by `target === anchor.dataRef`,
	 * and every anchor it matches must satisfy it. Two consequences
	 * for rule authors: a claim naming a `target` no anchor carries
	 * licenses nothing (and is not itself reported), and a compose
	 * that rewrites only the `href` is declared by setting `target` to
	 * that anchor's UNCHANGED `data-ref` — the `data-ref` is the key,
	 * not necessarily the thing that moved. */
	composed?: readonly { from: string; target: string }[];
	/** Text this call duplicated from elsewhere in the SAME entry
	 * (spec §5.1). The gate verifies each string occurs in the input
	 * before permitting it — a declared copy that is not in the
	 * source is a violation, not an allowance. */
	copied?: readonly string[];
	/** Link targets this call MINTED from a head it already held and a
	 * tail taken from a SIBLING anchor whose own display witnesses that
	 * tail (link-target gate case 7, spec
	 * docs/specs/2026-08-27-link-target-gate-cases.md §3). `head` is a
	 * target in this entry's input that supplies the leading run;
	 * `from` is a second input target, of which `tail` is a literal
	 * SUFFIX; `target` is the `data-ref` written, and must be exactly
	 * `head + tail` — no gap, no third source, no character from
	 * anywhere else.
	 *
	 * `field` and `open` NAME THE WITNESS: `field` is one of this
	 * entry's own input fields, verbatim, and `open` is the index of
	 * the opening-tag token, in that field's own tokenization, of the
	 * anchor whose display the rule read. Token indices are unique
	 * within a field, so the pair identifies exactly one input anchor.
	 *
	 * `link-target.ts` accepts the claim only when, in addition, that
	 * anchor CARRIES `from` and the DIGITS of `tail` occur in ITS
	 * display. That is the corroboration the case is named for and the
	 * one thing case 4 cannot ask: the halakha reaches the primary only
	 * because the variant PRINTS it as well as addressing it.
	 *
	 * The witness became a named anchor on 2026-08-27. Until then the
	 * claim carried no anchor identity and the gate accepted the digits
	 * from ANY input anchor carrying `from`, so an entry citing one
	 * address twice could have its mint corroborated by the sibling the
	 * rule never read.
	 *
	 * Declared, matched to anchors (`target === anchor.dataRef`) and
	 * reported exactly like `composed` and `recombined`, ANY-claim like
	 * both. On the `href` side `head` is mapped through every anchor
	 * carrying it and `from` through the WITNESS's own href, the tail
	 * is re-derived per spelling (`:6` on the `data-ref`, `.6` on the
	 * `href`), and the same clauses are re-tested against that
	 * spelling.
	 *
	 * **THIS CASE MINTS, AND CLAUSE 4 DOES NOT MAKE MINTING SAFE.**
	 * `Tosefta Shabbat 16:6` occurs nowhere in the input. Measured
	 * corpus-wide before the case shipped (spec §3.1): it licenses 414
	 * of 414 tosefta variant pairs, and also 29 of the 68 structurally
	 * analogous same-work pairs that would MINT — including
	 * `Exodus 24` + `Exodus 15:25` giving `Exodus 24:25`, a verse that
	 * does not exist. Jastrow renders a Sefaria `Work C:V` anchor as
	 * `Abbr. <roman chapter>, <arabic verse>`, so the digit witness is
	 * present by DEFAULT across that whole family. What the case buys
	 * is not safety but ATTRIBUTION: a minted target must name the two
	 * input targets AND the one input anchor whose display witnessed
	 * the tail, so a wrong mint is a wrong claim with a rule's name on
	 * it rather than an anonymous fabrication. A rule declaring this is
	 * asserting a population argument of its own; the gate audits the
	 * claim, it does not supply the argument. */
	corroborated?: readonly {
		field: string;
		from: string;
		head: string;
		open: number;
		tail: string;
		target: string;
	}[];
	entry: SourceEntry;
	/** Opening tags this call repaired by GLYPH SUBSTITUTION alone
	 * (batch-3a spec §4.3). `from` is an opening tag in this entry's
	 * INPUT; `target` is the tag written. `link-target.ts` accepts the
	 * pair only if mapping every `״` in `target` back to `"` yields
	 * `from` exactly — same length, same characters, same order — and
	 * only if `from` is the tag of an anchor the input actually held.
	 *
	 * Stated on RAW TAG BYTES rather than on parsed targets, and the
	 * reason is the defect itself: an ASCII quote inside a
	 * `"`-delimited attribute terminates it, so all 90 damaged anchors
	 * parse `malformed: false` with a truncated `data-ref`. A case
	 * phrased against the input target set would compare the repair to
	 * `Jastrow, אל` and reject it for the truncation it is fixing.
	 *
	 * A claim is matched to an anchor by `target === anchor.tag`, and
	 * every anchor it matches must satisfy it. A claim naming a tag no
	 * anchor carries licenses nothing.
	 *
	 * Three further conditions rule authors need to know about, all of
	 * them fail-closed:
	 *
	 * - A `from` that itself contains a `״` can never be accepted,
	 *   because the mapping leaves no gershayim behind for it to match.
	 *   That is correct rather than an oversight, and by construction
	 *   rather than by a corpus fact: "the input holds no U+05F4" is
	 *   true of the snapshot and false under composition, since
	 *   `run.ts` feeds each rule the previous rule's output (batch
	 *   report §9.4). `from` is an OPENING TAG, and the registry's only
	 *   writer of `״` is `gershayim.ts`, whose `repairText` leaves
	 *   every `<…>` run byte-identical and whose `repairTags` writes
	 *   into `target`. No tag in a rule's input can carry one; if one
	 *   ever did, the claim would be refused rather than licensed.
	 * - A claim may license no MORE anchors than the input held anchors
	 *   carrying its `from`. Tag values repeat (two corpus entries
	 *   repeat a damaged tag verbatim), and without the cap one honest
	 *   claim would also license a sibling anchor that another rule
	 *   retargeted to the repaired bytes.
	 * - Every `״` in `target` must stand between two Hebrew letters,
	 *   combining points on the left-hand letter tolerated. Converting
	 *   the quotes that DELIMIT an attribute de-maps just as exactly as
	 *   converting the one stranded inside it, and would otherwise
	 *   license a tag whose `href` parses to nothing. */
	glyphCorrected?: readonly { from: string; target: string }[];
	/** Link targets this call REBUILT from two other targets in this
	 * entry's input (batch-2 link spec §3.2 case 4, ruling of
	 * 2026-08-23). `head` supplies a leading run of the written
	 * `target` and `tail` supplies the rest: `link-target.ts` accepts
	 * it only if some split of `target` makes the first part a PREFIX
	 * of `head` and the second part a SUFFIX of `tail`, with both
	 * contributing at least one character. Nothing else is admitted —
	 * no gap, no third source, no character from the display — so
	 * every character of the written target is verbatim from a target
	 * the entry already held, and both `head` and `tail` must be in
	 * that input.
	 *
	 * Two further constraints, added 2026-08-24 after four probes
	 * against the first cut all came back clean. **The part of `tail`
	 * the split discards must itself be a prefix of `head`** — the two
	 * spellings of one address differ only in a short leading run of
	 * the tail (an href's `/`), so honest claims keep clearing it
	 * while truncating or extending the head's own locus no longer
	 * does. And **`head` and `tail` must differ**: a string is
	 * trivially its own prefix, so one source could otherwise extend
	 * itself, and §3.2's "a suffix of ANOTHER" says two. Distinctness
	 * is enforced per PAIR, not only on the declared strings: on the
	 * href side each declared target maps to every matching anchor's
	 * `href`, and a pair that collapses to one spelling is skipped —
	 * so two distinct data-refs sharing a single href cannot license
	 * an href through this case. Fail-closed, and no rule has met it.
	 *
	 * The case exists for `ib-targum-work-loss`: an "ib." inside a
	 * Targum run keeps its own correct verse but loses the work, and
	 * the repair is the antecedent's work joined to this anchor's own
	 * locus. Case 3 cannot license it — its remainder must occur in
	 * the DISPLAY, and Jastrow writes `Deut. VI, 22` where Sefaria
	 * writes `6:22`, so no Sefaria locus can ever clear that test.
	 * Case 4 asks a different question (is every character verbatim
	 * from two named input targets?) and does not subsume case 3,
	 * which admits display evidence this case has no way to read.
	 *
	 * Declared, matched to anchors and reported exactly like
	 * `composed`. What it newly permits is in `link-target.ts`'s
	 * blind-spot list — the split point is derived rather than
	 * declared, so a borrowed trailing character can extend the
	 * head's own locus. */
	recombined?: readonly { head: string; tail: string; target: string }[];
	records: TransformRecord[];
	/** Text this call DELETED on purpose (batch-6b spec
	 * `docs/specs/2026-08-28-structural-repairs-design.md` §2.2) — the
	 * exact mirror of `copied`, read by `no-lost-text.ts`. Each string
	 * is verified to occur in this entry's INPUT first, and credited as
	 * a MULTISET, so declaring one deletion permits exactly one.
	 *
	 * Per-call rather than a static `Rule` field, and the reason is the
	 * blast radius `allows` documents: what a structural rule deletes
	 * is a per-entry run — one marker's trailing space, one stray label
	 * period — and a static list would license that codepoint anywhere
	 * in the rule's diff, over every entry it touches.
	 *
	 * Only `structural-repairs` rules are gated on it today (spec
	 * §2.3): 10 of the 39 rules already in `RULES` delete text, 4,504
	 * codepoints between them, and a global gate would mean retrofitting
	 * ten declarations in the PR that introduced the gate. Those ten are
	 * pinned at their measured counts instead. A `text-repairs` rule may
	 * still declare `removes`; nothing reads it there. */
	removes?: readonly string[];
	/** Opening tags this call repaired by DELETING a run that never
	 * belonged inside them (link-target gate case 6, spec
	 * docs/specs/2026-08-27-link-target-gate-cases.md §2). `written` is
	 * the raw opening tag the rule emitted; `removed` is the run it
	 * lifted out. `link-target.ts` accepts the pair only if re-inserting
	 * `removed` into `written` reproduces a byte-exact SUBSTRING of some
	 * field in this entry's own input, and only if EXACTLY ONE insertion
	 * offset does so — ambiguity is a refusal, not a choice.
	 *
	 * `field` and `offset` NAME THE PLACE: `field` is the input field
	 * the repair happened in, verbatim, and `offset` is where in it the
	 * recovered run begins. The gate requires the run to sit exactly
	 * there, and requires `field` to be the input counterpart of the
	 * field the repaired anchor came out of. Added 2026-08-27: without
	 * it a run recovered from the headword licensed a repair made in a
	 * definition, since "some field of this entry" was the whole of the
	 * test.
	 *
	 * Stated on RAW FIELD BYTES rather than on parsed targets, and one
	 * level further out than case 5's raw tag bytes. Case 5 compares
	 * against the input anchors' `.tag` values, which works because a
	 * stranded ASCII quote still leaves a parseable tag. A tag whose
	 * `href` swallowed the following `</a>` does not parse as a tag at
	 * all — `html.ts` reads it as malformed and everything after it as
	 * that attribute's value — so it appears in NO anchor's `.tag`, and
	 * a case phrased against the parsed tag set would refuse the repair
	 * for exactly the damage it undoes.
	 *
	 * A claim is matched to an anchor by `written === anchor.tag`, and
	 * every anchor it matches must satisfy EVERY claim naming it. It
	 * settles both attributes of that tag at once, like case 5, because
	 * neither of them parses on the input side.
	 *
	 * Two consequences rule authors need, both fail-closed:
	 *
	 * - A repair that ADDS bytes cannot be declared this way. Case 6
	 *   only ever deletes a declared run from bytes the input already
	 *   holds, so a reconstruction that writes an attribute copied from
	 *   a witness elsewhere in the entry must clear cases 1-2 on its own
	 *   (which it does, the witness being in the parsed target set).
	 * - An empty `removed` licenses nothing: every offset then yields
	 *   `written` itself, so a `written` the input holds verbatim
	 *   produces `written.length + 1` satisfying offsets and one it does
	 *   not hold produces none. Neither is one. */
	restored?: readonly {
		field: string;
		offset: number;
		removed: string;
		written: string;
	}[];
	/** How many anchors this call REMOVED from the entry, counted over
	 * the whole entry rather than per field. The markup-delta gate
	 * reads a dropped tag pair as an improvement and the text gate is
	 * a SUB-multiset check that reads a deletion as legitimate, so
	 * this count is the only thing standing between an accidental
	 * unlink and a clean run. Absent means zero, and a mismatch in
	 * either direction — undeclared removal, or a declaration larger
	 * than what went missing — fails. */
	unlinks?: number;
}

interface Rule {
	/** Text codepoints this rule may introduce beyond the input's own
	 * bytes. Absent or empty means a strict sub-multiset. Every
	 * non-empty value is a maintainer ruling — cite it in a comment.
	 * A copy of existing per-entry text (the tail of a headword
	 * recovered into an alt-headword, say) cannot be expressed here —
	 * the copied bytes differ per entry, not per rule. Declare those
	 * through `TransformResult.copied` instead (spec §5.1). */
	allows?: readonly string[];
	/** MUST treat `entry` as immutable and return a NEW entry object
	 * reflecting the change — or the same reference, unchanged, when
	 * the rule makes no change (that is the normal case when
	 * `records` comes back empty, and every rule already does this
	 * when it doesn't match). An in-place mutator breaks two things
	 * silently, both load-bearing on this contract:
	 *
	 * - `run.ts` aliases the input as `const before = entry` (`run.ts:30`)
	 *   and then hands both `before` and `result.entry` to the gates.
	 *   The gates compare VALUES — `checkNoNewText` compares text
	 *   multisets, `checkMarkup` compares markup damage — and perform no
	 *   identity comparison of their own. That is exactly why an
	 *   in-place mutator defeats them: it returns the same object it was
	 *   given, so `before` and `result.entry` are one object, `textOf`
	 *   reads the ALREADY-MUTATED text on both sides, and every gate
	 *   reports clean no matter what the rule changed — the exact
	 *   violation they exist to catch. Nothing detects this; the
	 *   contract is the defence.
	 * - `count.ts`'s audit measures every rule alone against one
	 *   shared in-memory corpus array (loaded once, not per rule, for
	 *   performance). An in-place mutation from one rule corrupts
	 *   every later rule's measurement in the same run — the
	 *   "composed counts are meaningless" failure this architecture
	 *   forbids, reintroduced by that load-once optimization rather
	 *   than by rule chaining. `count.ts` recursively freezes the
	 *   corpus specifically so a violation throws a `TypeError` naming
	 *   the mutating call instead of silently corrupting later
	 *   results. */
	apply(entry: SourceEntry): TransformResult;
	/** Must match an `id` in data/patches/patterns.jsonl. */
	id: string;
	phase: TransformPhase;
}

export type { Rule, TransformPhase, TransformRecord, TransformResult };
