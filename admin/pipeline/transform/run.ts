/**
 * The transform runner (spec §3). Applies every rule for one phase to
 * one entry, gating each rule's output as it goes so a violation names
 * the rule that caused it rather than surfacing as a mystery diff at
 * the end of the walk.
 *
 * Three gates run here, per rule, because each is blind to what the
 * others see. The text sub-multiset (`checkNoNewText`) strips tags
 * with the same tokenizer a rule uses, so markup damage is invisible
 * to it by construction; the markup well-formedness delta
 * (`checkMarkup`) never looks inside a tag, so an attribute rewrite is
 * invisible to it; and neither reads `href` or `data-ref` at all,
 * which is the hole `checkLinkTargets` (batch-2 link spec §3.2) closes
 * for every rule that writes a link target. Spec §5 covers the first
 * two; the third is that spec's blind-spot problem answered rather
 * than recorded.
 *
 * `rule.id` reaches the link gate as well as the text one, since
 * 2026-08-27: link-target case 7 licenses a MINTED address only for
 * rules on its own allowlist, so it needs the identity of the rule it
 * is gating. This loop is where a rule and its `TransformResult` are
 * associated, and so the only place that identity is knowable.
 */
import type { SourceEntry } from '../body/types.ts';
import { checkLinkTargets } from './link-target.ts';
import { checkMarkup } from './markup.ts';
import { checkNoNewText } from './no-new-text.ts';
import { RULES } from './registry.ts';
import type { Rule, TransformPhase, TransformRecord } from './types.ts';

/** One phase's worth of rule application over one entry: the resulting
 * entry plus every record the matching rules produced, in rule order. */
interface RunResult {
	entry: SourceEntry;
	records: TransformRecord[];
}

function applyTransforms(
	source: SourceEntry,
	phase: TransformPhase,
	rules: readonly Rule[] = RULES,
): RunResult {
	let entry = source;
	const records: TransformRecord[] = [];
	for (const rule of rules) {
		if (rule.phase !== phase) {
			continue;
		}
		const before = entry;
		const result = rule.apply(before);
		const problems = [
			...checkNoNewText(before, result.entry, rule, result.copied),
			...checkMarkup(before, result.entry),
			...checkLinkTargets(before, result.entry, result, rule.id),
		];
		if (problems.length > 0) {
			throw new Error(`${rule.id}: ${problems.join('; ')}`);
		}
		({ entry } = result);
		records.push(...result.records);
	}
	return { entry, records };
}

export type { RunResult };
export { applyTransforms };
