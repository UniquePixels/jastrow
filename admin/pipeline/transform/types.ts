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
	 * fails as fabricated. */
	composed?: readonly { from: string; target: string }[];
	/** Text this call duplicated from elsewhere in the SAME entry
	 * (spec §5.1). The gate verifies each string occurs in the input
	 * before permitting it — a declared copy that is not in the
	 * source is a violation, not an allowance. */
	copied?: readonly string[];
	entry: SourceEntry;
	records: TransformRecord[];
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
