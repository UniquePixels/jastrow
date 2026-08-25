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
 * anchor in `after` must satisfy one of the spec's five cases:
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
 * 4. **Recombined** (ruling of 2026-08-23) — a prefix of one input
 *    target joined to a suffix of another, both DECLARED through
 *    `TransformResult.recombined`, with no character from anywhere
 *    else and no gap between the halves. Case 3 cannot express this:
 *    its remainder must appear in the anchor's DISPLAY, and Jastrow
 *    writes `Deut. VI, 22` where Sefaria writes `6:22`, so no Sefaria
 *    locus will ever clear that test — a general limit of case 3, not
 *    a quirk of the nine `ib-targum-work-loss` occurrences that
 *    forced the ruling.
 *
 *    The two cases do not overlap and neither subsumes the other:
 *    case 3 reads evidence off the display, which case 4 cannot see;
 *    case 4 reads it off a second input target, which case 3 cannot
 *    name. Cases 1-3 are untouched — nothing was loosened to make
 *    room.
 * 5. **Glyph-corrected** (batch-3a spec §4.3) — the anchor's whole
 *    opening TAG, with every gershayim `״` mapped back to an ASCII
 *    `"`, is byte-identical to a tag the input held, and the rule
 *    DECLARED that pair through `TransformResult.glyphCorrected`.
 *
 *    Alone among the five it is stated on raw tag BYTES rather than
 *    on parsed targets, and the defect is the reason: an ASCII quote
 *    inside a `"`-delimited attribute terminates it, so all 90
 *    damaged anchors parse `malformed: false` with a truncated
 *    `data-ref` — `Jastrow, אל״ף 1` reads back as `Jastrow, אל`.
 *    Cases 1-2 compare the repair against that truncation and reject
 *    it; case 3's remainder must occur in the display, which carries
 *    the same ASCII quote in the input; case 4 cannot express a
 *    mid-string substitution at all. Phrasing case 5 on the parsed
 *    set would reject the correction for the very truncation it
 *    fixes, so it reads the bytes the parser cannot mangle.
 *
 *    Fail-closed, and tighter than any target-set phrasing: every
 *    character except the substituted quotes is pinned by length,
 *    order and codepoint, so the case cannot move a link to another
 *    entry, cannot alter a locus, and cannot recover an address the
 *    input did not spell out. Two further conditions, both added
 *    2026-08-24 after review found each of them licensed something the
 *    spec's wording does not: a claim may license no MORE output
 *    anchors than the input held anchors carrying its `from` (tag
 *    values repeat, and §4.3 says "THAT anchor's opening tag"), and
 *    every gershayim in the written tag must stand between two Hebrew
 *    letters, which is what stops a claim converting the quotes that
 *    DELIMIT an attribute instead of the one stranded inside it.
 *    `glyphFault` carries both arguments. Cases 1-4 are untouched.
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
 * **What this gate does NOT catch.** §5's house style is to record a
 * gate's blind spots rather than imply coverage, and a rule author
 * reaching for `composed` or `unlinks` is the reader who needs them:
 *
 * - **Laundering between anchors.** Anchor A given B's target and B
 *   given A's passes — both values are in the input's set. Inherent
 *   in §3.2 case 2, which permits copying a sibling's target and
 *   cannot tell a copy from a swap.
 * - **Laundering between attributes.** `href` and `data-ref` are
 *   pooled into ONE set, so writing a URL-shaped value into
 *   `data-ref`, or a ref-shaped one into `href`, passes. The gate
 *   asks whether the entry held the string, never which attribute
 *   held it.
 * - **Movement between fields.** That set is entry-wide, not per
 *   field, so an anchor moved from `language_reference` into a
 *   definition passes. §3.3 asks for entry-wide COVERAGE; entry-wide
 *   COMPARISON is what it costs.
 * - **Delete-one, create-one.** The count invariant is a NET count. A
 *   rule that unlinks one anchor and wraps a new one around other
 *   text, with a target copied from the input, nets to zero — and the
 *   markup gate reads the added balanced pair as no change. Nor does
 *   `unlinks` say WHICH anchor went: unlinking the wrong one and
 *   declaring 1 passes.
 * - **A composed target that only DROPS characters.** The remainder
 *   test constrains what a claim adds past the common prefix, never
 *   what it truncates, so a declared compose to any prefix of an
 *   input target (`'Shabbat 30b'` → `'Shabbat 3'`) has an empty
 *   remainder and passes with no display evidence at all. The prefix
 *   is also character-level, so how much evidence a claim must show
 *   depends on digit coincidence rather than on structure.
 * - **Display-text laundering.** The remainder is tested against the
 *   OUTPUT anchor's display, so a rule that rewrote the display and
 *   then composed from it satisfies this gate; only the text gate
 *   stands between that and invention, and it is a whole-entry
 *   multiset.
 * - **Empty attributes.** An absent `href` or `data-ref` reads as
 *   `''`, which must stay in the set or every anchor lacking that
 *   attribute would fail for being unchanged — so writing an EMPTY
 *   target passes whenever any input anchor also lacked one.
 * - **Damaged-tag tails.** Where a tag token ends inside an attribute
 *   value (D00478's `href` swallowing its closing tag), the
 *   "attributes" that follow are document TEXT to the tokenizer and
 *   are invisible here. The text gate covers edits to them.
 * - **A minted address, in case 4.** Cases 1-3 can only reuse a
 *   target the entry held or extend one with display evidence. Case 4
 *   SYNTHESIZES an address that may occur nowhere in the entry — or
 *   in the corpus. Every character is verbatim, and that is a
 *   provenance claim about characters, not a claim that the resulting
 *   address is real. The maintainer's ruling rests on it being better
 *   evidenced than case 2, which is true, and this is the cost side
 *   of that trade.
 * - **An unchecked pairing, in case 4.** Any two input targets may be
 *   named `head` and `tail`. The gate never asks whether the head is
 *   the antecedent the rule reasoned about, nor whether the tail is
 *   the anchor's OWN current target — a rule that picks the wrong
 *   antecedent (the hazard `ib-yoma-2a` already meets, and the reason
 *   Task 8's Sifré arm carries a predicate) produces a
 *   well-provenanced wrong address and passes.
 * - **Same-work siblings, in case 4.** The tightening of 2026-08-24
 *   requires the tail's discarded prefix to be a prefix of the head,
 *   which closes head-extension and truncation between targets naming
 *   DIFFERENT works. It cannot close them between two targets naming
 *   the SAME work, because there the discarded prefix legitimately is
 *   a head prefix: `Onkelos Deuteronomy 13:2` and
 *   `Onkelos Deuteronomy 1:13` together license
 *   `Onkelos Deuteronomy 13:13`, a verse nothing cites, and
 *   `Onkelos Deuteronomy 13:2:13`, which is not a ref at all. Entries
 *   citing one work twice are common, so this is the live residue of
 *   the off-by-one verse family. No rule keyed on the discarded
 *   prefix can separate it from the legitimate claim, whose whole
 *   shape is "two targets that differ in the work" — closing it needs
 *   evidence this gate does not have. Pinned by a passing test.
 * - **The truncation mirror, in case 4.** Shortening a target is
 *   rejected for every corpus-shaped pair probed, same-work included:
 *   a truncation needs the tail to END with an interior chunk of the
 *   head while its own discarded prefix BEGINS the head, and no
 *   Sefaria ref does both. The gate does not forbid it in general
 *   though — a target of that shape in some entry would license one,
 *   and nothing here would notice. Narrow even then: such a tail is
 *   essentially the truncation itself, which case 2 already licenses
 *   outright, so case 4 adds next to nothing here.
 * - **Cross-spelling, in case 4.** The target set pools `href` with
 *   `data-ref`, so an href SPELLING is a legal `head` or `tail` on the
 *   data-ref side: `/`, `_` and `.` can be assembled into a
 *   `data-ref` that should never hold them. The pooling is older than
 *   case 4 (see "laundering between attributes"), but cases 1-2 can
 *   only copy a whole value across where this ASSEMBLES one. Pinned
 *   by a passing test.
 * - **The href cross-product, in case 4.** On the href side each
 *   declared target is mapped through `hrefsFor`, which returns every
 *   anchor whose `data-ref` OR `href` matches, and every head href is
 *   tried against every tail href EXCEPT pairs that resolve to the
 *   same spelling — the distinctness rule applies per pair, not only
 *   to the declared strings. So two anchors sharing a `data-ref` but
 *   spelling their `href` differently can still license a value by a
 *   spelling the rule never meant to name; and two DISTINCT
 *   data-refs that share one href are rejected on that attribute,
 *   since the pair collapses to a single source. The second is a
 *   fail-closed narrowing, not a hole, and no corpus rule has met it.
 * - **A tag, not an address, in case 5.** The case asks only whether
 *   the bytes moved. A rule that corrected the glyph AND happened to
 *   be pointing at the wrong entry to begin with is licensed by it,
 *   because the wrong address is already spelled out in the input tag
 *   and the correction leaves every character of it in place. That is
 *   correct for a glyph rule — the repair is not what aimed the link
 *   — and would not be for anything else, which is why the case is
 *   keyed to a substitution that reproduces the input exactly rather
 *   than to a rule id. It also settles BOTH attributes of the tag at
 *   once: `checkValue` consults case 5 before judging either, since
 *   neither parses on the input side.
 * - **Which anchor, in case 5.** The multiplicity CAP bounds how many
 *   anchors a claim may license, not which ones. Two anchors carrying
 *   byte-identical damaged tags are indistinguishable to this case, so
 *   a rule that repaired one and left the other untouched while some
 *   earlier rule wrote the repaired bytes onto a third is within the
 *   cap and licensed. The same shape as "delete-one, create-one"
 *   above, and the same root: this gate counts, and does not track
 *   identity.
 * - **A Hebrew-flanked DELIMITER, in case 5.** Condition 4 rejects a
 *   claim that converted an attribute's delimiters rather than the
 *   quote stranded inside it, because a delimiter abuts `=`,
 *   whitespace or `>`. A CLOSING delimiter followed directly by an
 *   attribute whose name begins with a Hebrew letter would be flanked
 *   on both sides and would pass. That is measured 0 in this corpus —
 *   four attribute names in use, none Hebrew-initial — so condition 4
 *   is closed by the INPUT rather than by the shape of HTML, and a
 *   re-fetch that introduced such an attribute would reopen it.
 * - **Unused claims.** A `composed`, `recombined` or `glyphCorrected`
 *   entry matching no anchor grants nothing, but is not itself
 *   reported, so a stale declaration left in a rule will not be
 *   flagged. A claim that DOES match diverges by case: cases 3 and 4
 *   are ANY-claim, so a faulty claim beside an honest one on the same
 *   value is ignored; case 5 is ALL-claim, so it refuses the anchor.
 *   `glyphFaults` argues why — for case 5 a second claim on the same
 *   tag can only be a false provenance, never an alternative source.
 * - **Provenance stops at the rule boundary.** `run.ts` gates each
 *   rule against the entry AS OF THAT RULE'S START, not against the
 *   phase's original input, so rule N reads the targets rule N−1
 *   wrote. An address MINTED by case 4 is, one rule later, an
 *   ordinary member of the input target set — a plain case-1 or case-2
 *   source that any subsequent rule may copy or recombine with no
 *   further evidence. Provenance is therefore per-call, and the chain
 *   is not checked end to end: nothing here can tell a target the
 *   ENTRY held from one the REGISTRY built two rules ago. Nothing is
 *   wrong today — `ib-targum-work-loss` is case 4's only user and it
 *   runs last, so no rule ever sees its output — but that is a fact
 *   about the current registry order, not a property of the gate.
 *   Anyone appending a rule below `targumAnaphora` inherits this.
 * - **Fields outside `fieldsOf`.** `refs[]` and `rid` are excluded
 *   from the shared walk (see `no-new-text.ts` on why), so a rule
 *   editing only those passes here — and `refs[]` holds link targets
 *   by definition. This gate inherits that boundary rather than
 *   redrawing it, and the `untouched` fast path inherits it too.
 */
import type { SourceEntry } from '../body/types.ts';
import { tokenize } from './html.ts';
import { type Anchor, anchors } from './links.ts';
import { fieldsOf } from './no-new-text.ts';
import type { TransformResult } from './types.ts';

/** One declared composition (`TransformResult.composed`). */
type Compose = { from: string; target: string };

/** One declared glyph correction (`TransformResult.glyphCorrected`).
 * Both members are RAW opening-tag values, not parsed targets. */
type GlyphCorrect = { from: string; target: string };

/** One declared recombination (`TransformResult.recombined`). */
type Recombine = { head: string; tail: string; target: string };

/** The gershayim, U+05F4 — the one character case 5 may map back to an
 * ASCII quote.
 *
 * Declared HERE rather than imported from the rule that writes it.
 * A gate that took its notion of "the licensed glyph" from a rule
 * module would be a gate a rule could widen, which is not a gate. Two
 * one-character constants is the cheaper problem. */
const GERSHAYIM = '״';

// Hoisted per lint/performance/useTopLevelRegex. Both are used only
// through `matchAll`, which iterates a clone rather than advancing
// `lastIndex`, so the shared global instances carry no state between
// calls.
const ANY_GERSHAYIM = /\u05f4/gu;
/** A gershayim standing where the MARK actually stands: between two
 * Hebrew letters, tolerating the combining marks Jastrow sets on the
 * left-hand letter (`ָּ` and friends — a bare lookbehind
 * leaves one corpus occurrence unmatched, per batch-3a spec §4.1).
 *
 * The tolerance admits U+0307 alongside the Hebrew points
 * U+0591–U+05C7, as ONE character class with U+0307 written FIRST.
 * The position is load-bearing and the two linters are why. Biome's
 * `noMisleadingCharacterClass` reads a class as a sequence and
 * objects to a combining character standing AFTER another element,
 * which the natural `[U+0591-U+05C7, U+0307]` order does — the range
 * is not wholly combining (U+05BE, U+05C0, U+05C3 and U+05C6 are
 * punctuation), so the pair reads as base-plus-mark. Leading, the
 * same set passes. The obvious alternative, an alternation
 * `(?:[points]|U+0307)*`, satisfies Biome but draws
 * `typescript:S8786`: a quantified alternation is a backtracking
 * shape, where a quantified class is one deterministic step. Class
 * membership is order-independent, so all three forms match exactly
 * the same strings; only this one satisfies both linters. Widened
 * 2026-08-24, on a measurement rather than on symmetry: 1 of the 2,305 marks the batch writes (M01940's
 * `מ̇ס̇״ך̇`) sets the combining dot between the letter and the
 * mark. That one is in the TEXT locus, where case 5 never runs, so 0
 * of the 180 tag-locus marks failed here — the widening buys nothing
 * on today's data and everything on a re-fetch that moves such an
 * occurrence into an attribute, which would otherwise halt the
 * pipeline on an honest repair.
 *
 * The gate declares this itself, exactly as it declares `GERSHAYIM`,
 * and for the same reason. It is not the rule's predicate borrowed: it
 * is an INDEPENDENT statement about where the output may differ from
 * the input, so a rule whose own predicate drifted wider would be
 * caught here rather than rubber-stamped. That is why the widening is
 * confined to the TOLERANCE class and why this must NOT import
 * `HEBREW_ATOM` from `html.ts`, architecturally legal though that
 * would be: a gate whose predicate is the rule's predicate can no
 * longer catch a rule that widened its own, and would silently follow
 * any future widening of the tokenizer's Hebrew class. The three
 * remaining divergences are deliberate and stay — the rule admits
 * presentation forms (U+FB1D–U+FB4F), `׳`/`״` themselves and bare
 * points as FLANKS; this gate admits none of them.
 *
 * All three run ONE WAY — narrower than the rule, never wider. That
 * direction is the whole point: a gate wider than the predicate it
 * checks rubber-stamps a rule that widened its own. The letter ranges
 * below are therefore held inside `HEBREW`'s own — U+05D0–U+05EA
 * and U+05F0–U+05F2. Corrected 2026-08-24, having read
 * U+05EF–U+05F2 and so admitted U+05EF HEBREW YOD TRIANGLE — which
 * `HEBREW` does NOT hold — as a flank the rule can never produce.
 * Cost of the error was zero (U+05EF occurs 0 times in the walked
 * fields of the pinned corpus, and every corpus count is unmoved by
 * the correction), and the correction is fail-closed. Recorded rather
 * than quietly narrowed so nobody restores the off-by-one for the
 * U+05F0–U+05F2 ligatures. */
const FLANKED_GERSHAYIM =
	/(?<=[\u05d0-\u05ea\u05f0-\u05f2][\u0307\u0591-\u05c7]*)\u05f4(?=[\u05d0-\u05ea\u05f0-\u05f2])/gu;

/** Whether some gershayim in `tag` stands somewhere a gershayim cannot
 * stand — which, in an opening tag, means it is doing a QUOTE's job
 * rather than a mark's. See `glyphFault`. */
function hasStrayGershayim(tag: string): boolean {
	return (
		[...tag.matchAll(ANY_GERSHAYIM)].length !==
		[...tag.matchAll(FLANKED_GERSHAYIM)].length
	);
}

/** Everything `checkValue` reads about the entry, gathered once per
 * call: the input anchors, the target set built from them, the raw
 * opening tags case 5 compares against, the rule's declared claims,
 * and the rid for the messages.
 *
 * `tags` and `written` are TALLIES rather than sets because case 5
 * caps a claim's reach by them: a claim may license no more output
 * anchors than the input held anchors carrying its `from`. */
interface Input {
	claims: readonly Compose[];
	glyphs: readonly GlyphCorrect[];
	rejoins: readonly Recombine[];
	rid: string;
	source: readonly Anchor[];
	tags: ReadonlyMap<string, number>;
	targets: ReadonlySet<string>;
	written: ReadonlyMap<string, number>;
}

/** How many anchors carry each distinct opening tag. Duplicate tags
 * are real — two corpus entries repeat a damaged tag verbatim — so
 * this cannot be a set without discarding the multiplicity case 5's
 * cap is stated in. */
function tally(list: readonly Anchor[]): Map<string, number> {
	const counts = new Map<string, number>();
	for (const anchor of list) {
		counts.set(anchor.tag, (counts.get(anchor.tag) ?? 0) + 1);
	}
	return counts;
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
 * Never empty in practice: the only caller checks `targets.has(from)`
 * first and `continue`s when it fails, and membership in that set
 * means some input anchor carried the string on one attribute or the
 * other. So no fallback value is invented here; an empty list would
 * mean that invariant broke, and `faultOf` reporting nothing to
 * compare against is the honest outcome. */
function hrefsFor(from: string, source: readonly Anchor[]): string[] {
	return source
		.filter((anchor) => anchor.dataRef === from || anchor.href === from)
		.map((anchor) => anchor.href);
}

/**
 * Whether `claim` licenses `value` on an anchor showing `display`,
 * given the input-side strings the copied part may have come from.
 *
 * A claim passes on ANY source — the same address occasionally
 * appears with two `href` spellings, and "copied from the input" is
 * satisfied by one of them, not all. The reported remainder is the
 * first source's, so the message is deterministic; with no sources at
 * all the claim licenses nothing, which fails closed.
 *
 * Only what the claim ADDS past the prefix is tested. Characters it
 * DROPS are unconstrained, so a compose to a prefix of its own source
 * shows no display evidence and passes — see the module doc's
 * blind-spot list, where that sits with the rest of them.
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
 * Whether `value` is some PREFIX of `head` joined to some SUFFIX of
 * `tail`, with both contributing at least one character — spec §3.2
 * case 4, and the whole of it.
 *
 * The split point is derived rather than declared, because a rule
 * author cannot know it: the same address splits at a different
 * offset on each attribute (`Onkelos Deuteronomy 13:2` gives up
 * `Onkelos ` while `/Onkelos_Deuteronomy.13.2` gives up `/Onkelos_`),
 * so a declared offset would be wrong on one of the two. Every offset
 * the head can support is tried instead, which is why the head cannot
 * simply be truncated: some suffix of the tail must account for
 * whatever the prefix does not.
 *
 * A prefix of `value` matches `head` exactly when it is no longer
 * than their common prefix, so the search runs over
 * `[value.length - tail.length, commonPrefix]`, clamped to leave one
 * character on each side. Offsets are code units, not codepoints: the
 * test is exact string equality on both halves, so a split inside a
 * surrogate pair or before a combining mark can only match when the
 * same units are genuinely present in the source, and the verbatim
 * property holds either way.
 *
 * **The discarded head of the tail must itself be a prefix of `head`**
 * (tightening of 2026-08-24). Without it a free split point licensed
 * far more than the two-spelling problem needs, and four probes
 * against the first cut all came back clean: truncating the head's
 * locus (`13:22` → `13:2` — Sefaria refs end in digits, so any tail
 * ending in the same digit serves), minting a wrong verse in the
 * head's own work without moving the work at all, and splicing two
 * unrelated targets mid-word (`Oeviticus 6:3`). The rule holds
 * because the two spellings only ever differ in a short LEADING run
 * of the tail — the `/` of an href — which is a prefix of the head's
 * href too, whereas head-extension and truncation both need to
 * discard a tail prefix the head does not begin with. Measured: it
 * licenses A00589 and M00567 on both attributes and rejects probes 1,
 * 2 and 4.
 *
 * It does NOT reject probe 3, `head === tail` — a string is trivially
 * its own prefix, so a single source could still extend itself. That
 * needs the distinctness check in `checkValue`; the review's analysis
 * that this rule alone covers probes 1-3 does not hold. Both
 * constraints are load-bearing and neither replaces the other.
 */
function rejoinsFrom(value: string, head: string, tail: string): boolean {
	const limit = Math.min(commonPrefix(head, value).length, value.length - 1);
	for (let at = Math.max(1, value.length - tail.length); at <= limit; at++) {
		const kept = value.slice(at);
		if (!tail.endsWith(kept)) {
			continue;
		}
		if (head.startsWith(tail.slice(0, tail.length - kept.length))) {
			return true;
		}
	}
	return false;
}

/**
 * Faults from the case-3 arm — one per declared composition naming
 * this anchor — or `undefined` as soon as one of them LICENSES the
 * value. An empty array means no composition spoke to this anchor at
 * all, which is not the same as a licence and is why the caller
 * distinguishes the two.
 *
 * Split out of `checkValue` for cognitive complexity (S3776); the
 * arms are the spec's cases, so one function per case is also how
 * they read.
 */
function composeFaults(
	value: string,
	anchor: Anchor,
	input: Input,
): string[] | undefined {
	const { claims, rid, source, targets } = input;
	const faults: string[] = [];
	for (const claim of claims.filter((c) => c.target === anchor.dataRef)) {
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
	return faults;
}

/** The two input-side spellings a recombination is checked against:
 * the declared strings on the `data-ref` side, every matching
 * anchor's `href` on the href side. */
function halvesOf(
	value: string,
	anchor: Anchor,
	claim: Recombine,
	source: readonly Anchor[],
): [readonly string[], readonly string[]] {
	if (value === anchor.dataRef) {
		return [[claim.head], [claim.tail]];
	}
	return [hrefsFor(claim.head, source), hrefsFor(claim.tail, source)];
}

/**
 * Faults from the case-4 arm, with the same contract as
 * `composeFaults`: `undefined` means one declared recombination
 * licensed the value.
 *
 * Distinctness is checked twice over, and deliberately: once on the
 * declared strings, and once per PAIR below, because two different
 * data-refs can map to a single `href` and that pair would otherwise
 * let a source extend itself on the href side.
 */
function rejoinFaults(
	value: string,
	anchor: Anchor,
	input: Input,
): string[] | undefined {
	const { rejoins, rid, source, targets } = input;
	const faults: string[] = [];
	for (const claim of rejoins.filter((c) => c.target === anchor.dataRef)) {
		if (claim.head === claim.tail) {
			faults.push(
				`recombined ${JSON.stringify(claim.target)} names ${JSON.stringify(claim.head)} as both head and tail`,
			);
			continue;
		}
		const absent = [claim.head, claim.tail].find((from) => !targets.has(from));
		if (absent !== undefined) {
			faults.push(
				`recombined ${JSON.stringify(claim.target)} copies from ${JSON.stringify(absent)}, which is not in ${rid}'s input`,
			);
			continue;
		}
		const [heads, tails] = halvesOf(value, anchor, claim, source);
		if (
			heads.some((head) =>
				tails.some((tail) => tail !== head && rejoinsFrom(value, head, tail)),
			)
		) {
			return;
		}
		faults.push(
			`recombined ${JSON.stringify(value)} is not a prefix of ${JSON.stringify(heads[0] ?? claim.head)} joined to a suffix of ${JSON.stringify(tails[0] ?? claim.tail)}`,
		);
	}
	return faults;
}

/**
 * Why `claim` does not license this anchor, or `undefined` when it
 * does. Four conditions, all of them on RAW TAG BYTES except the last
 * count, and every one of them fail-closed.
 *
 * 1. Mapping every gershayim in the written tag back to an ASCII quote
 *    must reproduce `from` EXACTLY — same length, same order, same
 *    codepoints everywhere else. A corollary worth stating so nobody
 *    later "fixes" it: a `from` that itself contains a gershayim can
 *    never satisfy this, because the mapping leaves none behind. That
 *    is correct, and it is correct BY CONSTRUCTION rather than by a
 *    corpus fact. "The input holds no U+05F4" is true of the snapshot
 *    and FALSE UNDER COMPOSITION — `run.ts` hands each rule the
 *    previous rule's output, so `gershayimInBody` puts 2,125 marks
 *    into the document text before `gershayimRefAttribute` ever runs
 *    (asserted at `rules/gershayim.test.ts:333`; see that rule's
 *    module doc and batch report §9.4). What holds instead is about
 *    the substitution: `from` is an OPENING TAG, the only writer of
 *    U+05F4 in the registry is `gershayim.ts`, and its `repairText`
 *    leaves every `<…>` run byte-identical while its `repairTags`
 *    writes into `target`, never into a later rule's `from`. So no
 *    tag in any rule's input carries a gershayim however many the
 *    text around it now does — and were some future rule to write
 *    one, this stays fail-closed: the claim is refused, not licensed.
 * 2. `from` must be a tag the input actually held.
 * 3. The claim must not license MORE output anchors than the input had
 *    anchors carrying `from` (spec §4.3 says "THAT anchor's opening
 *    tag"). Without the cap one honest claim also licenses a sibling
 *    anchor that some other rule retargeted to the repaired bytes,
 *    because claims are matched by tag value and tag values repeat.
 *    Equal counts are the normal case, duplicates included.
 * 4. Every gershayim in the written tag must stand between two Hebrew
 *    letters. Conditions 1-3 all hold for a claim that converts the
 *    quotes DELIMITING an attribute rather than the one stranded
 *    inside it: `href=״/Jastrow,_אל"ף.1״` de-maps to the input tag
 *    byte for byte, so it would be licensed, and it leaves an anchor
 *    whose `href` parses to nothing at all. An OPENING delimiter abuts
 *    `=` on its left and so can never be Hebrew-flanked; a CLOSING one
 *    normally abuts whitespace or `>` on its right, which is why this
 *    catches the family in practice — including the subtler form where
 *    one attribute's delimiters are converted and its value swallows
 *    the next attribute, which a test phrased on "is the gershayim
 *    inside a parsed value" would pass. That second half is a fact
 *    about THIS CORPUS, not about HTML: a closing delimiter followed
 *    immediately by an attribute whose NAME begins with a Hebrew
 *    letter would be Hebrew on both sides. Measured 0 — the corpus
 *    uses four attribute names (`class`, `data-ref`, `dir`, `href`),
 *    none Hebrew-initial, and all 180 Hebrew-flanked in-tag quotes are
 *    the known strays. See the blind-spot list above.
 */
function glyphFault(
	value: string,
	claim: GlyphCorrect,
	input: Input,
): string | undefined {
	const held = input.tags.get(claim.from) ?? 0;
	const written = input.written.get(claim.target) ?? 0;
	const lead = `glyph-corrected ${JSON.stringify(value)}`;
	if (claim.target.replaceAll(GERSHAYIM, '"') !== claim.from) {
		return `${lead} changes more than the quote`;
	}
	if (held === 0) {
		return `${lead} is claimed from ${JSON.stringify(claim.from)}, which is not a tag in ${input.rid}'s input`;
	}
	if (written > held) {
		return `${lead} is claimed for ${written} anchors, but ${input.rid}'s input held ${held}`;
	}
	return hasStrayGershayim(claim.target)
		? `${lead} substitutes a quote that no Hebrew letters flank`
		: undefined;
}

/**
 * Faults from the case-5 arm. It shares `composeFaults`'s and
 * `rejoinFaults`'s RETURN protocol — `undefined` means a declared
 * claim licensed this anchor, an EMPTY array means no claim spoke to
 * it at all — but NOT their quantifier, and the difference is
 * deliberate rather than an oversight.
 *
 * `composeFaults` is ANY-claim: it returns as soon as one matching
 * claim is fault-free, so a second, faulty claim on the same value
 * cannot block an honest one. This arm is ALL-claim: every matching
 * claim must be fault-free. Two reasons.
 *
 * - ANY-claim buys case 5 nothing. `glyphFault`'s condition 1 is a
 *   FUNCTION of the target — `target` de-mapped must equal `from` —
 *   so for a given `target` at most ONE `from` can ever be licensed,
 *   and conditions 3 and 4 read the target alone. Two claims naming
 *   the same `anchor.tag` can therefore only disagree when they
 *   differ in `from`, and then exactly one of them is asserting a
 *   provenance the bytes contradict. Compose has real multiplicity to
 *   accommodate (`hrefsFor` yields several candidate spellings for one
 *   value); this has none.
 * - So a second claim here is not noise a rule left lying around. It
 *   names a tag the rule DID write and states something false about
 *   where those bytes came from — a rule bug, and the declaration
 *   audit is what case 5 exists to be. Under ANY-claim a rule could
 *   declare one true claim plus any amount of garbage against the same
 *   tag and the gate would say nothing.
 *
 * The module doc's "Unused claims" blind spot is unaffected and means
 * what it says: a claim MATCHING NO ANCHOR grants nothing and is not
 * reported, and one matching an anchor whose value is already in
 * `input.targets` is never consulted either, because `checkValue`
 * settles cases 1 and 2 first. What a claim naming a genuinely
 * repaired tag cannot do is sit alongside an honest one and be
 * ignored — see that bullet, which records the divergence.
 *
 * A claim is matched by `target === anchor.tag` — the raw opening-tag
 * bytes, because the parsed targets are truncated for exactly the
 * anchors this case exists to license. `glyphFault` above is the whole
 * test. Every character except the substituted quotes is pinned by it,
 * so a licensed claim cannot move a link to another entry, alter a
 * locus, or recover an address the input never spelled out.
 *
 * It licenses a TAG, not an ADDRESS, and takes both attributes at
 * once: the two quotes it repairs sit in `href` and `data-ref`
 * respectively, and neither parses on the input side. See the module
 * doc's blind-spot list for what that costs.
 *
 * Messages name the VALUE under judgement, not the claim's tag. Tag
 * values repeat, so a message phrased on the tag alone would read as a
 * statement about whichever anchor the rule author had in mind rather
 * than the one actually being refused.
 */
function glyphFaults(
	value: string,
	anchor: Anchor,
	input: Input,
): string[] | undefined {
	const claims = input.glyphs.filter((claim) => claim.target === anchor.tag);
	if (claims.length === 0) {
		return [];
	}
	const faults = claims
		.map((claim) => glyphFault(value, claim, input))
		.filter((fault): fault is string => fault !== undefined);
	return faults.length === 0 ? undefined : faults;
}

/**
 * Why this anchor's `value` (its `href` or its `data-ref`) is not one
 * the entry's input could supply, or `undefined` when it is. The five
 * spec cases, in order, one line each.
 *
 * Membership in `targets` settles cases 1 and 2 outright. Otherwise
 * the value must be licensed by a declared glyph correction (case 5),
 * composition (case 3) or recombination (case 4). Cases 3 and 4 are
 * matched to this anchor by `target === anchor.dataRef` and case 5 by
 * `target === anchor.tag`: EVERY matching anchor must satisfy the
 * claim, which falls out of checking each anchor against every claim
 * that names it rather than pairing them off. One licence is enough —
 * a value more than one kind of claim names passes if any admits it —
 * and the first fault is reported when none does, case 5 before 3
 * before 4. With no claim of any kind the value is simply absent from
 * the input, which is the fabrication message and the fallback below.
 *
 * Case 5 is consulted FIRST, and before either attribute is judged,
 * because it licenses a whole opening TAG: a licensed tag settles
 * both of its attributes at once, and neither of them parses on the
 * input side, which is the point of stating that case on bytes.
 */
function checkValue(
	value: string,
	anchor: Anchor,
	input: Input,
): string | undefined {
	if (input.targets.has(value)) {
		return;
	}
	const glyphs = glyphFaults(value, anchor, input);
	if (glyphs === undefined) {
		return;
	}
	const composed = composeFaults(value, anchor, input);
	if (composed === undefined) {
		return;
	}
	const rejoined = rejoinFaults(value, anchor, input);
	if (rejoined === undefined) {
		return;
	}
	return (
		[...glyphs, ...composed, ...rejoined][0] ??
		`target ${JSON.stringify(value)} is not in ${input.rid}'s input`
	);
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
	result: Pick<
		TransformResult,
		'composed' | 'glyphCorrected' | 'recombined' | 'unlinks'
	>,
): string[] {
	const sourceFields = fieldsOf(before);
	const outputFields = fieldsOf(after);
	const changed = !untouched(sourceFields, outputFields);
	const source = changed ? anchorsIn(sourceFields) : [];
	const output = changed ? anchorsIn(outputFields) : [];
	const { rid } = after;
	const input: Input = {
		claims: result.composed ?? [],
		glyphs: result.glyphCorrected ?? [],
		rejoins: result.recombined ?? [],
		rid,
		source,
		tags: tally(source),
		targets: targetsOf(source),
		written: tally(output),
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
