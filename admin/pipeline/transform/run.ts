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
 * A FOURTH gate joined them in batch 6b: `checkNoLostText` mirrors
 * the text sub-multiset in the other direction — what did the input
 * hold that the output does not? The three above are blind to
 * deletion by construction, which is survivable while a rule rewrites
 * a glyph in place and is not once a rule MOVES text between fields
 * or senses, where "moved" and "dropped" differ only in whether the
 * text arrives.
 *
 * It ran for `structural-repairs` rules alone until 2026-09-21, which
 * left a `text-repairs` rule free to delete text past all four gates.
 * It now runs for every phase, crediting the per-rule allowance in
 * `no-lost-text.ts`'s `LOSS_ALLOWANCES` — the measured retrofit onto
 * the ten shipped text-phase rules that do drop codepoints. A rule
 * that is not in that table may not lose one.
 *
 * A FIFTH check runs here and is not a gate at all: the purity
 * contract. `types.ts` requires a rule to return a NEW entry and
 * called the contract its own defence, because every gate above
 * compares VALUES — let a rule mutate what it was handed and all four
 * read the already-mutated text on both sides and report clean.
 *
 * Two shapes are checked, and between them they cover the text the
 * gates can see. `Object.is` catches the rule that hands its input
 * straight back; comparing `fieldsOf(before)` across the call catches
 * the one that mutates the sense tree and returns a shallow spread,
 * where the top-level objects differ but the array underneath is
 * shared. The second is the realistic shape and the first alone would
 * miss it. What neither covers is a field outside `fieldsOf` — the
 * same blind spot the text gates have, for the same reason, and
 * `count.ts` still freezes its corpus rather than relying on this.
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
import { checkNoLostText, LOSS_ALLOWANCES } from './no-lost-text.ts';
import { checkNoNewText, fieldsOf } from './no-new-text.ts';
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
		// Read BEFORE the call, so a rule that edits this array's strings
		// in place cannot make the comparison below read its own result.
		const wasFields = fieldsOf(before);
		const result = rule.apply(before);
		// `types.ts` on `Rule.apply`: a rule MUST return a new entry, or
		// its input unchanged. Identity alone is not the violation — the
		// no-match return is the same reference — so a returned input
		// counts only when the rule also reported a change. A mutated
		// input field counts on its own, whatever came back.
		const returnedItsInput =
			Object.is(before, result.entry) && result.records.length > 0;
		const nowFields = fieldsOf(before);
		const mutatedItsInput =
			nowFields.length !== wasFields.length ||
			nowFields.some((field, i) => field !== wasFields[i]);
		if (returnedItsInput || mutatedItsInput) {
			throw new Error(
				`${rule.id}: mutated its input in place; \`Rule.apply\` must treat \`entry\` as immutable and return a NEW entry`,
			);
		}
		const problems = [
			...checkNoNewText(before, result.entry, rule, result.copied),
			...checkMarkup(before, result.entry),
			...checkLinkTargets(before, result.entry, result, rule.id),
			...checkNoLostText(
				before,
				result.entry,
				result.removes,
				LOSS_ALLOWANCES.get(rule.id),
			),
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
