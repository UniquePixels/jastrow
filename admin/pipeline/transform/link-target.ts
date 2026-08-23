/**
 * The link-target gate (batch-2 link spec §3.2).
 *
 * The text gate strips tags before comparing — its own header says a
 * rule that adds an `<a href>` "would read as inventing text. This
 * gate strips tags first" — and the markup gate compares a
 * well-formedness DELTA, so an anchor retargeted from a right address
 * to a wrong one is well-formed on both sides and passes clean. Until
 * this gate, nothing looked at `href` or `data-ref` at all: a rule
 * could point 538 anchors at a fabricated address and all three
 * verification layers would report success. That is spec §5's
 * blind-spot problem in its sharpest form, and batch 2 — every rule of
 * which writes a target — is where it has to be closed rather than
 * recorded.
 *
 * The contract is one sentence: **a rule may only write a link target
 * it can point at in this entry's own input.** Concretely, every
 * anchor in `after` must satisfy one of the spec's three cases:
 *
 * 1. **Unchanged** and 2. **copied** collapse into ONE membership
 *    test here. An unchanged target is trivially present in the
 *    input's target set, so there is nothing a separate identity
 *    comparison would catch that the set does not — and the set is
 *    what case 2 needs anyway, since a target copied from a sibling
 *    anchor is indistinguishable from one that never moved.
 * 3. **Composed** — the work copied whole from a `from` target the
 *    input holds, the locus assembled from the anchor's own display
 *    text, and the whole thing DECLARED through
 *    `TransformResult.composed`. An undeclared compose is reported as
 *    a fabrication, which is what it is until a rule author says
 *    otherwise.
 *
 * `href` and `data-ref` are checked INDEPENDENTLY against that one
 * set. A rule that copies both from the same source anchor therefore
 * passes without declaring anything — the intended path, and the
 * reason no href-synthesis logic lives here. At most one problem is
 * reported per anchor (`data-ref` first, then `href`): the two
 * attributes carry the same address in two spellings, so a second
 * message would restate the first.
 *
 * Plus the spec's two counting invariants, over the whole entry:
 * anchors never grow (batch 2 creates no links; §1's ruling is
 * enforced in code, not left to rule authors), and any shortfall is
 * declared by `unlinks` (the markup gate reads a dropped tag pair as
 * an improvement, and the text gate reads the deletion as a
 * legitimate sub-multiset, so nothing else can catch an accidental
 * unlink).
 *
 * Scope is every field `fieldsOf` walks — `language_reference` and
 * nested `sense.senses` included — on the principle §5 states for
 * text: a field the gate cannot see passes VACUOUSLY, which is worse
 * than failing. `h-cognate-self-link` is why that is stated rather
 * than assumed; its re-measurement found its largest locus in
 * `language_reference`, disjoint from the definition-side probe the
 * row was written from.
 *
 * This gate never edits, so unlike `retarget`/`unlink` it must
 * tolerate anchors those two refuse: `malformed`, `interior`, and
 * unclosed anchors are counted and target-checked like any other. An
 * anchor a rule could not legitimately have touched is exactly the
 * one a silent skip would hide.
 *
 * §5's house style is to record a gate's blind spots rather than
 * imply coverage, so: this gate compares the entry's targets as ONE
 * set, not per field, so an anchor moved between fields passes; a
 * `composed` claim that matches no anchor grants nothing but is not
 * itself reported; and an attribute absent from a tag reads as the
 * empty string, so an empty target passes whenever any input anchor
 * also lacked that attribute.
 */
import type { SourceEntry } from '../body/types.ts';
import { tokenize } from './html.ts';
import { type Anchor, anchors } from './links.ts';
import { fieldsOf } from './no-new-text.ts';
import type { TransformResult } from './types.ts';

/** One declared composition (`TransformResult.composed`). */
type Compose = { from: string; target: string };

/** Everything `checkValue` reads about the INPUT side, gathered once
 * per call: the entry's anchors, the target set built from them, the
 * rule's declared compositions, and the rid for the messages. */
interface Input {
	claims: readonly Compose[];
	rid: string;
	source: readonly Anchor[];
	targets: ReadonlySet<string>;
}

/** Every anchor in the entry's fields, in `fieldsOf` order then
 * document order. Unusable anchors (`malformed`, `interior`,
 * unclosed) are included: this gate reads and never edits, and
 * skipping them would hide the one case worth seeing. */
function anchorsIn(fields: readonly string[]): Anchor[] {
	return fields.flatMap((field) => anchors(tokenize(field)));
}

/**
 * Whether the rule left every walked field byte-identical — the
 * common case by far, since a rule matches a small slice of the
 * corpus and is gated on all 27,000 entries regardless.
 *
 * Identical fields tokenize to identical anchors, so both sides'
 * target sets, anchor counts and per-anchor verdicts are equal by
 * construction and the walk below can be skipped outright rather than
 * tokenizing every field twice to prove it (~24µs per entry per rule,
 * measured over 3,000 corpus entries). `checkMarkup` short-circuits
 * the same comparison field by field for the same reason. What is NOT
 * skipped is the `unlinks` reconciliation: a rule that changed nothing
 * and declared a removal is still wrong, and still reported.
 */
function untouched(
	source: readonly string[],
	output: readonly string[],
): boolean {
	return (
		source.length === output.length &&
		source.every((field, at) => output[at] === field)
	);
}

/** Every `href` and `data-ref` value in the entry, as one set. Empty
 * values are kept: an anchor with no `data-ref` attribute reads as
 * `''`, and dropping it would fail such an anchor for being
 * unchanged. The cost is recorded in the module doc. */
function targetsOf(list: readonly Anchor[]): Set<string> {
	const targets = new Set<string>();
	for (const anchor of list) {
		targets.add(anchor.href);
		targets.add(anchor.dataRef);
	}
	return targets;
}

/** The shared leading CODEPOINTS of two strings — no word boundary,
 * per the spec's wording. `'Shabbat 30b'` and `'Shabbat 31a'` share
 * `'Shabbat 3'`, so the remainder the display must account for is
 * `'1a'`, not `'31a'`. Iterating codepoints rather than UTF-16 units
 * keeps an astral character or a Hebrew base+mark pair from splitting
 * mid-sequence; the returned prefix is still a prefix in UTF-16 units,
 * so `.length` slices the remainder correctly. */
function commonPrefix(left: string, right: string): string {
	const a = [...left];
	const b = [...right];
	let at = 0;
	while (at < a.length && at < b.length && a[at] === b[at]) {
		at++;
	}
	return a.slice(0, at).join('');
}

/** Whether `remainder` holds a character (counting duplicates) that
 * `display` does not — the sub-multiset test of spec §3.2 case 3,
 * on the same codepoint basis `no-new-text.ts` uses. */
function absentFrom(remainder: string, display: string): boolean {
	const budget = new Map<string, number>();
	for (const ch of display) {
		budget.set(ch, (budget.get(ch) ?? 0) + 1);
	}
	for (const ch of remainder) {
		const left = budget.get(ch) ?? 0;
		if (left === 0) {
			return true;
		}
		budget.set(ch, left - 1);
	}
	return false;
}

/** The `href` values of every input anchor `from` names — by
 * `data-ref` or by `href`, since `from` may be written either way.
 * Falls back to `from` itself when no anchor matches, which only
 * happens for a `from` the caller has already reported as absent. */
function hrefsFor(from: string, source: readonly Anchor[]): string[] {
	const found = source
		.filter((anchor) => anchor.dataRef === from || anchor.href === from)
		.map((anchor) => anchor.href);
	return found.length > 0 ? found : [from];
}

/**
 * Whether `claim` licenses `value` on an anchor showing `display`,
 * given the input-side strings the copied part may have come from.
 *
 * A claim passes on ANY source — the same address occasionally
 * appears with two `href` spellings, and "copied from the input" is
 * satisfied by one of them, not all. The reported remainder is the
 * first source's, so the message is deterministic.
 */
function faultOf(
	value: string,
	sources: readonly string[],
	display: string,
): string | undefined {
	const remainders = sources.map((source) =>
		value.slice(commonPrefix(source, value).length),
	);
	if (remainders.some((remainder) => !absentFrom(remainder, display))) {
		return;
	}
	return `adds ${JSON.stringify(remainders[0] ?? value)} absent from display ${JSON.stringify(display)}`;
}

/**
 * Why this anchor's `value` (its `href` or its `data-ref`) is not one
 * the entry's input could supply, or `undefined` when it is.
 *
 * Membership in `targets` settles cases 1 and 2 outright. Otherwise
 * the value must be licensed by a declared composition, matched to
 * this anchor by `target === anchor.dataRef`: EVERY matching anchor
 * must satisfy the claim, which falls out of checking each anchor
 * against every claim that names it rather than pairing them off.
 */
function checkValue(
	value: string,
	anchor: Anchor,
	input: Input,
): string | undefined {
	const { claims, rid, source, targets } = input;
	if (targets.has(value)) {
		return;
	}
	const matching = claims.filter((claim) => claim.target === anchor.dataRef);
	if (matching.length === 0) {
		return `target ${JSON.stringify(value)} is not in ${rid}'s input`;
	}
	const faults: string[] = [];
	for (const claim of matching) {
		if (!targets.has(claim.from)) {
			faults.push(
				`composed ${JSON.stringify(claim.target)} copies from ${JSON.stringify(claim.from)}, which is not in ${rid}'s input`,
			);
			continue;
		}
		const sources =
			value === anchor.dataRef ? [claim.from] : hrefsFor(claim.from, source);
		const fault = faultOf(value, sources, anchor.display);
		if (fault === undefined) {
			return;
		}
		faults.push(`composed ${JSON.stringify(value)} ${fault}`);
	}
	return faults[0];
}

/**
 * Every way `after`'s link targets outrun what `before` could supply.
 * Empty means the rule pointed every anchor at an address the entry
 * already held, removed exactly as many anchors as it declared, and
 * created none.
 *
 * Read-only in both directions: neither entry nor the result is
 * touched, so a frozen corpus entry (`count.ts` deep-freezes) passes
 * through unharmed.
 *
 * A rule that changed no walked field is settled by `untouched`
 * without tokenizing anything; every other entry is walked in full.
 *
 * Problems come back UNPREFIXED, like `no-new-text.ts`'s and
 * `markup.ts`'s: `run.ts` names the offending rule once when it
 * throws. The two siblings carry no such note because they never had
 * a reason to; this one does, because its messages read as if they
 * were missing the rule name until you see where it is added. There
 * is no `rule` parameter for the same reason `checkMarkup` has none —
 * this gate reads nothing off the rule, and a parameter kept for
 * symmetry alone would be an unused one.
 */
function checkLinkTargets(
	before: SourceEntry,
	after: SourceEntry,
	result: Pick<TransformResult, 'composed' | 'unlinks'>,
): string[] {
	const sourceFields = fieldsOf(before);
	const outputFields = fieldsOf(after);
	const changed = !untouched(sourceFields, outputFields);
	const source = changed ? anchorsIn(sourceFields) : [];
	const output = changed ? anchorsIn(outputFields) : [];
	const { rid } = after;
	const input: Input = {
		claims: result.composed ?? [],
		rid,
		source,
		targets: targetsOf(source),
	};
	const problems: string[] = [];
	const removed = source.length - output.length;
	const declared = result.unlinks ?? 0;
	if (removed < 0) {
		problems.push(
			`anchor count grew ${source.length} → ${output.length} in ${rid}`,
		);
	} else if (removed !== declared) {
		problems.push(
			`removed ${removed} anchor${removed === 1 ? '' : 's'} in ${rid}, declared ${declared}`,
		);
	}
	for (const anchor of output) {
		const problem =
			checkValue(anchor.dataRef, anchor, input) ??
			checkValue(anchor.href, anchor, input);
		if (problem !== undefined) {
			problems.push(problem);
		}
	}
	return problems;
}

export { checkLinkTargets };
