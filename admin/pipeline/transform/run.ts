/**
 * The transform runner (spec §3). Applies every rule for one phase to
 * one entry, gating each rule's output as it goes so a violation names
 * the rule that caused it rather than surfacing as a mystery diff at
 * the end of the walk.
 *
 * Both of spec §5's checkable layers run here, per rule: the text
 * sub-multiset (`checkNoNewText`) and the markup well-formedness delta
 * (`checkMarkup`). They are separate because they answer different
 * questions and neither subsumes the other — the text gate strips tags
 * with the same tokenizer a rule uses, so markup damage is invisible
 * to it by construction.
 */
import type { SourceEntry } from '../body/types.ts';
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
