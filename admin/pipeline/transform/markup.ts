/**
 * The transform-tier MARKUP gate (spec §5, the layer table's "free to
 * change; separately checked for well-formedness").
 *
 * `no-new-text.ts` deliberately cannot see markup damage: it strips
 * tags with the same tokenizer a rule uses, so a `<span>` a rule
 * injected INSIDE an attribute value is stripped as a tag and the text
 * multiset comes back unchanged. That is the D00478 defect this branch
 * found and fixed by hand; it was caught only because `bare-rtl-hebrew`
 * sat on an audited row whose entry count moved by one. Ten of the 78
 * transform rows are still unaudited (13 of 80 when this was written;
 * batch 2 audited three and withdrew two — see
 * `docs/v2/phase-2-triage.md`, which derives both figures from the
 * catalogue) and would have no such tripwire.
 *
 * **The assertion is a DELTA, not an absolute.** The corpus contains
 * genuinely malformed markup that must survive untouched — D00478 and
 * J00597 carry a literal `</a>` inside an `href` value, and the
 * still-pending catalogue row `unterminated-href-swallows-closing-tag`
 * exists to repair exactly those. A gate demanding well-formed output
 * would fail on every entry a rule so much as touches near them, and
 * would forbid the repair rule from ever seeing its own input. So the
 * bar is: **the output is no LESS well-formed than the input.** A rule
 * may leave damage alone, or fix it; it may not add to it.
 *
 * Two measures, per field, compared before against after:
 *
 * - **Balance.** Opening tags never popped, and closing tags that
 *   popped nothing. Neither may increase. This catches a dropped
 *   closing tag — invisible to `checkNoNewText`, which is a
 *   SUB-multiset check and reads a deletion as legitimate.
 * - **Tags inside an attribute value.** When an unterminated attribute
 *   swallows a closing tag, that `</a>` supplies the `>` which ends the
 *   tag token, and the attribute's real tail tokenizes as document
 *   text. A rule that rewrites that tail writes markup into a machine
 *   identifier. Counted, not forbidden, so the pre-existing damage
 *   passes and only an increase fails.
 *
 * One consequence worth stating up front. D00478's malformed tag
 * recovers — a later text token supplies the `>` that ends the
 * attribute — so only the few tokens in between are attribute
 * interior. J00597's never does, so the whole remainder of that one
 * field counts as interior and no rule may add markup anywhere in it.
 *
 * **This is NOT what a browser does, and the two readings diverge
 * sharply here.** A browser's double-quoted attribute value ends at
 * the next `"` — inside the following `<a class="`, about 110
 * characters later — and the tag itself then ends at the first `>`;
 * everything after that is ordinary document text, same as always.
 * This tokenizer clears its in-attribute state only on a `>` inside a
 * TEXT token, and J00597's tail holds 68 tokens, 34 of them tags and
 * 0 text tokens containing `>` — so it never recovers, all the way to
 * the field's end. The state machine is conservative by construction
 * (see the delta property above), and this is that conservatism
 * costing more than it looks like on a first read, not a claim that a
 * browser would treat the field the same way.
 *
 * The radius is one field, but not a small one: it is
 * `content.senses[0].definition`, 3,573 characters, of which 1,539
 * (43%) — spanning 34 tag tokens — are frozen. That is exactly the
 * scope `bare-rtl-hebrew` and `redundant-outer-rtl-span` already walk
 * via `overDefinitions`. None of the three live rules changes this
 * field today, so the constraint trips zero times, but it is a live
 * constraint on the next definition-scoped rule, not a dormant one. It
 * lifts when `unterminated-href-swallows-closing-tag` repairs the tag.
 * Measured: these are the only two malformed open tags in the corpus,
 * and none of the three live rules edits either field.
 *
 * **What this gate does NOT catch, stated rather than implied.**
 * Within its own domain — markup, not text — three classes pass both
 * axes untouched:
 *
 * - **Crossed nesting.** `<i><span dir="rtl">x</span></i>` rewritten
 *   to `<i><span dir="rtl">x</i></span>` scores 0→0 on every axis:
 *   `damageOf` counts opens pushed and closes popped, never which open
 *   a given close paired with, so any re-nesting that preserves depth
 *   is invisible to it.
 * - **Tag-name mismatch.** `<span dir="rtl">x</span>` rewritten to
 *   `<span dir="rtl">x</i>` passes for the same reason — a close pops
 *   the stack regardless of what name it carries.
 * - **Attribute-value corruption inside an otherwise well-formed tag.**
 *   `dir="rtl"` rewritten to `dir="ltr"`, or an `href`/`data-ref`
 *   retargeted to anything, passes both axes: the attribute axis counts
 *   a TAG token written inside an attribute value, never a rewrite of
 *   the value's own text, and balance never looks inside a tag at all.
 *
 * Outside markup, text RELOCATION is invisible too — not to this gate
 * specifically, but to all three transform-tier layers together: two
 * senses swapping their definitions, or text moved from `headword`
 * into a definition (`textOf` flattens every field into one multiset,
 * so the move is invisible there too). Per-field zipping narrows that
 * class here — a move that changes a field's markup shape shows up —
 * but a plain text move does not, and this gate does not claim it.
 *
 * Spec §5 records the full residue; §5.1 sets the precedent for
 * admitting a gate's blind spot rather than papering it. A rule that
 * re-nests or renames a tag, or rewrites an attribute value, carries
 * its own structural assertions — this gate will not carry them for
 * it.
 */
import type { SourceEntry } from '../body/types.ts';
import { attributeInterior, opensScope, tokenize } from './html.ts';
import { fieldsOf } from './no-new-text.ts';

/** How ill-formed one field's markup is, on the two axes a rule can
 * make worse. All three counts are 0 for well-formed markup. */
interface Damage {
	/** Tag tokens sitting inside an attribute value (see module doc). */
	attribute: number;
	/** Closing tags that popped nothing. */
	closes: number;
	/** Opening tags that were never popped. */
	opens: number;
}

/**
 * Measure one field's markup damage.
 *
 * Which tokens count as attribute interior is not decided here:
 * `attributeInterior` in `html.ts` is the single authority, and
 * `bare-rtl-hebrew` — the rule this axis exists to backstop — reads the
 * same region from the same call. A gate that modelled the region one
 * way while the rule modelled it another would be a gate whose passes
 * mean nothing, which is what an earlier one-token lookback in that
 * rule made it.
 *
 * Balance mirrors `tokenize`'s stack only UP TO the first malformed
 * open tag. From there the region takes over: every tag token inside it
 * is counted on the attribute axis and `continue`s before reaching the
 * depth counter, whereas `tokenize` goes on pushing and popping those
 * same tags unconditionally. On J00597's one damaged field that is 34
 * tag tokens the balance never sees, and `opens` reports the depth
 * standing when the malformed tag was met rather than at end of field.
 *
 * That divergence is safe because the assertion is a DELTA, run with
 * the same model on both sides (see the module doc): a rule passes only
 * by leaving the region's tag count where it found it. It would not be
 * safe as an absolute well-formedness claim, and none is made.
 */
function damageOf(html: string): Damage {
	const damage: Damage = { attribute: 0, closes: 0, opens: 0 };
	const tokens = tokenize(html);
	const interior = attributeInterior(tokens);
	let depth = 0;
	for (const [at, token] of tokens.entries()) {
		if (token.kind === 'text') {
			continue;
		}
		if (interior.has(at)) {
			damage.attribute++;
			continue;
		}
		if (token.close) {
			if (depth > 0) {
				depth--;
			} else {
				damage.closes++;
			}
		} else if (opensScope(token.value)) {
			depth++;
		}
	}
	damage.opens = depth;
	return damage;
}

/** Sum of every field's damage — the fallback comparison when a rule
 * changed the entry's field COUNT (a structural-repairs rule splitting
 * or merging senses), so there is no field-to-field correspondence to
 * zip. Coarser: damage moving from one field to another passes. */
function totalDamage(fields: readonly string[]): Damage {
	const total: Damage = { attribute: 0, closes: 0, opens: 0 };
	for (const field of fields) {
		const damage = damageOf(field);
		total.attribute += damage.attribute;
		total.closes += damage.closes;
		total.opens += damage.opens;
	}
	return total;
}

const AXES = [
	['opens', 'unmatched opening tag(s)'],
	['closes', 'unmatched closing tag(s)'],
	['attribute', 'tag(s) inside an attribute value'],
] as const;

/** Every axis on which `after` is more damaged than `before`, as a
 * message naming the rid, the field position and both figures. */
function worse(
	before: Damage,
	after: Damage,
	rid: string,
	at: string,
): string[] {
	const problems: string[] = [];
	for (const [axis, label] of AXES) {
		if (after[axis] > before[axis]) {
			problems.push(
				`${rid}: ${at} gained ${label} (${before[axis]} → ${after[axis]})`,
			);
		}
	}
	return problems;
}

/**
 * Markup damage the output holds beyond the input's. Empty means the
 * rule left the markup no worse than it found it.
 *
 * Fields are compared pairwise, in `fieldsOf` order, so a violation
 * names the field slot. When the two entries hold different numbers of
 * fields — only a structural rule does that — the comparison falls
 * back to entry totals, which is weaker but still catches damage
 * appearing from nowhere.
 */
function checkMarkup(before: SourceEntry, after: SourceEntry): string[] {
	const source = fieldsOf(before);
	const output = fieldsOf(after);
	if (source.length !== output.length) {
		return worse(
			totalDamage(source),
			totalDamage(output),
			after.rid,
			'the entry',
		);
	}
	const problems: string[] = [];
	for (const [at, field] of source.entries()) {
		const next = output[at] ?? '';
		if (next === field) {
			continue;
		}
		problems.push(
			...worse(damageOf(field), damageOf(next), after.rid, `field ${at}`),
		);
	}
	return problems;
}

export type { Damage };
export { checkMarkup, damageOf };
