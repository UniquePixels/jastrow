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

/** What one `Rule.apply` call returns (spec §5, §5.1). */
interface TransformResult {
	/** Text this call duplicated from elsewhere in the SAME entry
	 * (spec §5.1). The gate verifies each string occurs in the input
	 * before permitting it — a declared copy that is not in the
	 * source is a violation, not an allowance. */
	copied?: readonly string[];
	entry: SourceEntry;
	records: TransformRecord[];
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
	apply(entry: SourceEntry): TransformResult;
	/** Must match an `id` in data/patches/patterns.jsonl. */
	id: string;
	phase: TransformPhase;
}

export type { Rule, TransformPhase, TransformRecord, TransformResult };
