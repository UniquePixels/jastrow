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
 * anchor in `after` must satisfy one of the spec's seven cases:
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
 * 6. **Restored** (gate-cases spec of 2026-08-27 §2) — a rule repaired
 *    an opening tag by DELETING a run that never belonged inside it,
 *    and DECLARED the pair through `TransformResult.restored`. The
 *    gate re-inserts the run and requires the result to be a
 *    byte-exact SUBSTRING of some field in this entry's own input, at
 *    EXACTLY ONE insertion offset. Ambiguity is a refusal, not a
 *    choice. Since 2026-08-27 the claim also NAMES THE PLACE — the
 *    input field the repair happened in, verbatim, and the offset in
 *    it where the recovered run begins — and the gate requires the
 *    bytes to sit exactly there, in the input counterpart of the field
 *    the repaired anchor came out of. "Somewhere in this entry" was
 *    the whole of the old test, so a run recovered from the headword
 *    licensed a repair made in a definition.
 *
 *    It is case 5's lesson one level further out, and the extra level
 *    is the whole reason it exists. Case 5 reads raw tag bytes but
 *    compares them against the input anchors' `.tag` values, which
 *    works for gershayim because a stranded ASCII quote still leaves a
 *    tag the tokenizer accepts. A tag whose `href` swallowed the
 *    `</a>` that should have followed it does not parse as a tag at
 *    all — `opensScope` is false, and everything after it reads as
 *    that attribute's value — so it appears in NO anchor's `.tag` and
 *    a case phrased on parsed tags refuses the repair for exactly the
 *    damage it undoes. This case therefore compares against
 *    `fieldsOf(input)`: the raw bytes, before anything parses them.
 *    Measured on D00478, the entry that forced it: re-inserting `</a>`
 *    into the written tag recovers an input substring at ONE offset
 *    (54) and nowhere else.
 *
 *    Safe by construction rather than by population, on case 5's
 *    argument: every character of `written` except the deleted run is
 *    pinned by input bytes, in order, contiguously, at a unique
 *    offset OF A NAMED FIELD. The case cannot move a link to another
 *    entry, cannot move one between an entry's own fields, cannot
 *    alter a locus, and cannot recover an address the input did not
 *    spell out — it can only delete a declared run from bytes the
 *    input already contains. Like case 5 it licenses a whole opening
 *    TAG and so settles both attributes at once, and like case 5 it is
 *    ALL-claim. Cases 1-5 are untouched; nothing was loosened to make
 *    room.
 * 7. **Corroborated** (gate-cases spec of 2026-08-27 §3) — a target
 *    assembled from a `head` the input holds and a `tail` that is a
 *    literal SUFFIX of `from`, a second target the input holds, with
 *    `head + tail === target` exactly and the DIGITS of `tail`
 *    occurring in the display of ONE NAMED input anchor, which must
 *    carry `from`. All of it is DECLARED through
 *    `TransformResult.corroborated`, the witness included: the claim
 *    cites the input field it read and the opening-tag token index of
 *    the anchor within it, which together identify exactly one anchor.
 *    Before 2026-08-27 the claim named only the target string and any
 *    anchor carrying it could supply the digits, so an entry citing
 *    one address twice had its mint corroborated by a sibling the rule
 *    never read.
 *
 *    It exists because case 4's tightening of 2026-08-24 refuses a
 *    repair the entry evidences twice over. `Tosef. Sabb. XVI (XVII),
 *    6` splits across two anchors; the primary keeps
 *    `Tosefta Shabbat 16` and drops the halakha, and writing
 *    `Tosefta Shabbat 16:6` needs `:6` from the variant's
 *    `Tosefta Shabbat 17:6`. The discarded part of that tail is
 *    `Tosefta Shabbat 17`, which is not a prefix of
 *    `Tosefta Shabbat 16`, so `rejoinsFrom` refuses — correctly, since
 *    the shape it is refusing is "mint a wrong verse in the head's own
 *    work". Case 3 cannot reach it either: the primary's display is
 *    `Tosef. Sabb. XVI`, with no `:` and no `6`. The evidence case 4
 *    cannot ask for is the VARIANT's display, `XVII), 6`, which prints
 *    the halakha the variant also addresses — two independent
 *    witnesses in the entry's own input for the same digits.
 *
 *    **THIS CASE MINTS, AND CLAUSE 4 DOES NOT MAKE MINTING SAFE.**
 *    That is stated here rather than only in the blind-spot list
 *    because the case was nearly ruled in on the opposite belief. The
 *    spec's first cut claimed clause 4 licensed 0 of the 69
 *    structurally analogous same-work pairs; re-measured before any
 *    code was written, it licenses **29 of the 68 that would mint**
 *    (spec §3.1, corrected). Jastrow renders a Sefaria `Work C:V`
 *    anchor as `Abbr. <roman chapter>, <arabic verse>`, so the arabic
 *    verse IS the tail's digit run and the corroborating witness is
 *    present by DEFAULT across that whole family. `XVII), 6` and
 *    `Ex. XV, 25` are indistinguishable to a digits-only test. What
 *    separates them is semantic — in `Tosef. Sabb. XVI (XVII), 6` the
 *    halakha is shared by both recensions and so belongs to the
 *    primary — and no structure-free strengthening of clause 4 reaches
 *    zero. The only predicate that separates the families is
 *    `VARIANT_DISPLAY`, which is the RULE's, and a gate whose
 *    predicate is the rule's can no longer catch a rule that widened
 *    its own (see `FLANKED_GERSHAYIM`).
 *
 *    So what case 7 buys is not safety but ATTRIBUTION. Live exposure
 *    is zero because a gate case is a LICENCE and not an instruction:
 *    nothing is minted unless a rule declares it, only
 *    `toseftaPrimaryHalakha` declares this one, and its own predicate
 *    fires on none of the 68. Every minted target must name the two
 *    input targets and ONE input anchor — cited by field and token
 *    index — that carries `from` and whose display prints the tail's
 *    digits, so a wrong mint is a wrong claim with a rule's name on it
 *    rather than an anonymous fabrication. Ruled on those terms
 *    2026-08-27 after the correction; the witness was made a named
 *    anchor the same day, because the ruling's own sentence was not
 *    true of a declaration that named a target string. Cases 1-6 are
 *    untouched.
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
 * - **A tag, not an address, in case 6.** Case 5's bullet above, word
 *   for word, and for the same reason: the case asks only whether the
 *   bytes were in the input minus one declared run. A link that
 *   pointed at the wrong entry BEFORE its tag was damaged still points
 *   there after the damage is undone, and case 6 licenses that,
 *   because the wrong address is spelled out in the input bytes the
 *   repair reassembles. Correct for a rule that relocates markup — the
 *   repair is not what aimed the link — and wrong for anything else.
 * - **Which bytes, in case 6.** The comparison is against whole FIELD
 *   bytes, not against the input's tags, so the run `written`
 *   reproduces need not have been a TAG in the input: document text
 *   that happens to spell one licenses a claim just as well. That is
 *   deliberate and it is the point — the defect makes the tag
 *   unparseable, so there is no input tag to compare against — but it
 *   is a genuinely wider warrant than case 5's, and the width is here
 *   rather than in the case's own note so it sits with the rest of
 *   them. Narrowed 2026-08-27 in ONE respect only: the bytes must be
 *   in the field the repair happened in, at the offset the claim
 *   names. What they were in that field is still not asked.
 * - **Which run, in case 6.** The gate never asks WHAT `removed` is,
 *   only that re-inserting it lands. Nothing restricts it to markup: a
 *   claim deleting a run of display text from inside a tag clears the
 *   same three clauses. Every byte is still the input's, so this
 *   cannot fabricate an address; it can rearrange one the input holds.
 * - **Which anchor, in case 6.** There is no multiplicity cap like
 *   case 5's, and none is available. Case 5 bounds a claim by how many
 *   input anchors carried its `from` TAG; case 6's `written` is by
 *   construction a tag the input never held AS A TAG — that is the
 *   defect — so the same cap reads 0 for every honest claim and would
 *   refuse them all. Two output anchors carrying byte-identical
 *   repaired tags are therefore both licensed by one claim, PROVIDED
 *   both are in the field the claim cites: since 2026-08-27 the same
 *   tag repaired in a second field is refused there, so the residue is
 *   per-field rather than per-entry. Within one field this gate still
 *   counts and does not track identity, which is the same shape as
 *   "which anchor, in case 5" and the same root.
 * - **A minted address, in case 7, and a MEASURED one.** The bullet
 *   above says case 4 synthesizes an address that may occur nowhere in
 *   the corpus. Case 7 does the same on a different warrant, and the
 *   size of it is measured rather than argued: over the corpus it
 *   licenses 414 of 414 tosefta variant pairs and **29 of the 68**
 *   structurally analogous same-work pairs that would mint —
 *   `Exodus 24` beside `Exodus 15:25` yields `Exodus 24:25`, and
 *   Exodus 24 has 18 verses. Clause 4 does not exclude them, because
 *   Jastrow prints the verse of a `Work C:V` anchor in arabic and that
 *   IS the tail's digit run. Recorded as a cost of the case rather
 *   than a defect in it, and pinned by a PASSING test in
 *   `link-target.test.ts` — one that asserts the ACCEPT, since
 *   asserting a refusal there would be false.
 * - **Which display, in case 7 — NARROWED 2026-08-27, and what is
 *   left.** This read: "the witness need only be SOME input anchor
 *   carrying `from`, not the sibling the rule reasoned about". The
 *   claim now CITES its witness by field bytes and token index, and
 *   the gate reads the digits off that one anchor, so a rule can no
 *   longer be corroborated by a sibling it never looked at. What the
 *   gate still cannot ask is whether the cited anchor is the one the
 *   rule SHOULD have read — a rule may cite the wrong sibling with
 *   perfect internal consistency, and this gate will agree with it.
 *   That is the limit case 4 carries for `head`, which is still
 *   uncited: `head`'s href spellings are gathered from every anchor
 *   carrying it, exactly as before.
 * - **Digits, not structure, in case 7.** Clause 4 compares digit
 *   RUNS, concatenated and stripped of everything else, so a display
 *   witnessing `6` licenses a tail of `:6` whether print meant halakha
 *   6, verse 6 or a page number. Two consequences worth naming: a
 *   longer digit run is satisfied by any SUBSTRING match, so a display
 *   reading `156` witnesses `:15`; and a tail carrying no digit at all
 *   would be corroborated vacuously, which is why an empty digit run
 *   is refused outright rather than passing the `includes('')` test.
 * - **Unused claims.** A `composed`, `recombined`, `glyphCorrected`,
 *   `restored` or `corroborated` entry matching no anchor grants
 *   nothing, but is not itself reported, so a stale declaration left in
 *   a rule will not be flagged. A claim that DOES match diverges by
 *   case: cases 3, 4 and 7 are ANY-claim, so a faulty claim beside an
 *   honest one on the same value is ignored; cases 5 and 6 are
 *   ALL-claim, so they refuse the anchor. `glyphFaults` argues why —
 *   for case 5 a second claim on the same tag can only be a false
 *   provenance, never an alternative source — and `restoreFaults`
 *   inherits the argument. Case 7 sits with 3 and 4 for THEIR reason:
 *   `hrefsFor` yields several candidate spellings for one declared
 *   string, so genuine multiplicity exists and a second honest claim
 *   naming a different `from` is a real possibility rather than
 *   necessarily a false provenance.
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

/** One declared corroboration (`TransformResult.corroborated`). Four
 * of its six members are TARGETS or runs of targets, never raw tag
 * bytes: unlike cases 5 and 6, the anchors case 7 speaks for parse
 * perfectly well — what they lack is the address, not the markup.
 *
 * `field` and `open` are the WITNESS, added 2026-08-27: the input
 * field the rule read, verbatim, and the index of the opening tag
 * token, inside that field's own tokenization, of the anchor whose
 * DISPLAY corroborated the tail. Token indices are unique within a
 * field, so the pair names exactly one input anchor. Before it the
 * declaration named a target string and clause 4 accepted any anchor
 * carrying it, which made "the witnessing display it came from"
 * unstatable — see `witnessOf`. */
type Corroborate = {
	field: string;
	from: string;
	head: string;
	open: number;
	tail: string;
	target: string;
};

/** One declared glyph correction (`TransformResult.glyphCorrected`).
 * Both members are RAW opening-tag values, not parsed targets. */
type GlyphCorrect = { from: string; target: string };

/** One declared recombination (`TransformResult.recombined`). */
type Recombine = { head: string; tail: string; target: string };

/** One declared restoration (`TransformResult.restored`). `written` is
 * a RAW opening tag, like `GlyphCorrect`'s members; `removed` is the
 * run the rule lifted out of it, and is not a target of any kind.
 *
 * `field` and `offset` are the WITNESS, added 2026-08-27: the input
 * field the repair happened in, verbatim, and the offset within it at
 * which the damaged bytes begin. Before them clause 2 asked only that
 * the recovered run match SOME field of the entry, so bytes found in
 * one field could license a repair made in another and an offset had
 * no field to be an offset into — see `restoreFault`. */
type Restore = {
	field: string;
	offset: number;
	removed: string;
	written: string;
};

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
 * opening tags case 5 compares against, the raw FIELD bytes case 6
 * compares against, the rule's declared claims, and the rid for the
 * messages.
 *
 * `tags` and `written` are TALLIES rather than sets because case 5
 * caps a claim's reach by them: a claim may license no more output
 * anchors than the input held anchors carrying its `from`.
 *
 * `fields` is the input's raw field strings, unparsed. Case 6 needs
 * them because the tag it licenses does not tokenize as a tag on the
 * input side — see that case in the module doc — so there is nothing
 * in `tags` for it to compare against. It is the SOURCE side only:
 * comparing a repair against the output would license anything. */
interface Input {
	claims: readonly Compose[];
	corroborations: readonly Corroborate[];
	fields: readonly string[];
	glyphs: readonly GlyphCorrect[];
	rejoins: readonly Recombine[];
	restores: readonly Restore[];
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

/** One OUTPUT anchor with the index of the field it was read out of.
 *
 * Every other case reads the entry as one pool of anchors and one pool
 * of bytes, which is why `anchorsIn` flattens. Case 6's witness is
 * stated per FIELD, so the anchor under judgement has to carry the
 * field it came from or the gate cannot tell a repair made HERE from
 * bytes recovered THERE. */
interface Placed {
	anchor: Anchor;
	field: number;
}

/** `anchorsIn` keeping each anchor's field index — same walk, same
 * order, one number kept. Indices are into the caller's field list,
 * and `checkLinkTargets` reads them against the INPUT list: `fieldsOf`
 * enumerates a fixed structure, so field `i` of the output is field
 * `i` of the input for every rule that edits text rather than shape. A
 * rule that changed the shape misaligns them, and case 6's witness
 * fails closed when it does — the declared field will not be the input
 * field at that index. */
function placedIn(fields: readonly string[]): Placed[] {
	return fields.flatMap((text, field) =>
		anchors(tokenize(text)).map((anchor) => ({ anchor, field })),
	);
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

// Hoisted per lint/performance/useTopLevelRegex. Used only through
// `replaceAll`, which resets `lastIndex` itself, so the shared global
// instance carries no state between calls.
const NON_DIGIT = /\D/gu;

/** Every digit of `text`, in order, with everything else discarded —
 * the "digits of `tail`" spec §3 clause 4 speaks of.
 *
 * A CONCATENATION rather than a list of runs, which is the loosest of
 * the readings available and is recorded as such in the blind-spot
 * list. It is also the only one that behaves the same on both
 * spellings of a locus: `:6` and `.6` reduce to the same `6`, where a
 * run-structured reading would have to know which separator belongs to
 * which attribute. */
function digitsOf(text: string): string {
	return text.replaceAll(NON_DIGIT, '');
}

/**
 * The ONE input anchor a corroboration's `field` and `open` name, or
 * `undefined` when they name none — spec §3 clause 4's witness, made
 * nameable 2026-08-27.
 *
 * The declared field must be one of THIS entry's own input fields,
 * byte for byte: bytes from anywhere else name no anchor this gate
 * walked, and accepting them would let a rule supply its own witness.
 * `open` is then a token index into that field's tokenization, which
 * is unique per anchor by construction, so the pair resolves to
 * exactly one anchor and to one drawn from the same population
 * `anchorsIn` builds `targets` from.
 *
 * Returns the ANCHOR rather than a verdict, and deliberately: clause 4
 * is the clause most likely to be narrowed next (§3.1.1's ruling is
 * explicitly provisional), and every narrowing that needs something
 * else about the witnessing anchor — its tag, its position, the shape
 * of its display — reads it off this value instead of re-plumbing the
 * case.
 *
 * Re-tokenizes the declared field rather than indexing the flat
 * `source` walk, because `anchorsIn` discards the field boundaries the
 * index is relative to. Claims are rare (414 corpus-wide, none outside
 * `toseftaPrimaryHalakha`) and fields are short, so the honest
 * re-parse is cheaper than a second walk kept in step with the first.
 */
function witnessOf(claim: Corroborate, input: Input): Anchor | undefined {
	if (!input.fields.includes(claim.field)) {
		return;
	}
	return anchors(tokenize(claim.field)).find(
		(anchor) => anchor.open === claim.open,
	);
}

/** Whether `anchor` carries `target` on either attribute — the same
 * "carrying" `hrefsFor` means, since the target set pools `href` with
 * `data-ref` and a declared string may be written either way. */
function carries(anchor: Anchor, target: string): boolean {
	return anchor.dataRef === target || anchor.href === target;
}

/**
 * Why this one `head`/`from` SPELLING does not license `value`, or
 * `undefined` when it does.
 *
 * The tail is DERIVED here rather than read off the claim, and it has
 * to be: the same address gives up `:6` on the `data-ref` side and
 * `.6` on the `href` side, so a declared tail is wrong on one of the
 * two. `corroborateFault` checks the DECLARED tail against the
 * DECLARED strings separately, which is what keeps the declaration
 * honest while this keeps the written bytes honest.
 *
 * Both halves must contribute at least one character. An empty `head`
 * is the one that matters and is not hypothetical: `''` is a member of
 * the target set whenever any input anchor lacks an attribute, so
 * without this a claim naming `head: ''` would license any suffix of
 * any input target as a whole target.
 *
 * The corroboration is read off `witness` — the ONE anchor the claim
 * named, resolved by `witnessOf` and already checked to carry `from` —
 * rather than off whichever anchor of the entry happens to print the
 * digits. That is the 2026-08-27 tightening, and it is the difference
 * between "these digits are printed somewhere near this address" and
 * "this display, on this anchor, printed them".
 */
function pairFault(
	value: string,
	head: string,
	from: string,
	witness: Anchor,
): string | undefined {
	const tail = value.startsWith(head) ? value.slice(head.length) : '';
	if (head === '' || head === from || tail === '' || !from.endsWith(tail)) {
		return `is not ${JSON.stringify(head)} joined to a suffix of ${JSON.stringify(from)}`;
	}
	const digits = digitsOf(tail);
	if (digits === '') {
		return `takes ${JSON.stringify(tail)}, which holds no digit to corroborate`;
	}
	return witness.display.includes(digits)
		? undefined
		: `takes ${JSON.stringify(tail)}, whose digits ${JSON.stringify(digits)} are absent from the witnessing display ${JSON.stringify(witness.display)}`;
}

/**
 * Why `claim` is not a well-formed corroboration at all, or
 * `undefined` when it is — the three clauses that read the DECLARED
 * strings alone and so give the same answer for both attributes.
 *
 * 1. `head + tail === target` exactly. No gap, no third source, no
 *    character from anywhere else. Checked on the declaration because
 *    that is where the rule author's arithmetic lives; the written
 *    value is checked separately, per spelling, by `pairFault`.
 * 2. `head` and `from` are both targets the input holds.
 * 3. `tail` is a literal, non-empty SUFFIX of `from`.
 *
 * Plus distinctness, which spec §3's "a SIBLING anchor" implies and
 * which case 4 learned to state: a string is trivially its own suffix,
 * so one source could otherwise extend itself indefinitely
 * (`X 1:2` + `:2` = `X 1:2:2`, and again).
 *
 * The WITNESS clauses are not here but in `claimFault`, because they
 * read the entry's anchors rather than the declared strings alone.
 */
function corroborateFault(
	claim: Corroborate,
	input: Input,
): string | undefined {
	const lead = corroborateLead(claim.target);
	if (claim.head === claim.from) {
		return `${lead} names ${JSON.stringify(claim.head)} as both head and source`;
	}
	if (claim.head + claim.tail !== claim.target) {
		return `${lead} is not ${JSON.stringify(claim.head)} joined to ${JSON.stringify(claim.tail)}`;
	}
	const absent = [claim.head, claim.from].find(
		(from) => !input.targets.has(from),
	);
	if (absent !== undefined) {
		return `${lead} copies from ${JSON.stringify(absent)}, which is not in ${input.rid}'s input`;
	}
	return claim.tail !== '' && claim.from.endsWith(claim.tail)
		? undefined
		: `${lead} takes ${JSON.stringify(claim.tail)}, which is not a suffix of ${JSON.stringify(claim.from)}`;
}

/** The opening of every case-7 refusal, so the declaration clauses and
 * the witness clauses cannot drift apart in how they name the value
 * under judgement. */
function corroborateLead(value: string): string {
	return `corroborated ${JSON.stringify(value)}`;
}

/**
 * Why one declared corroboration does not license `value`, or
 * `undefined` when it does — the declaration clauses, then the two
 * WITNESS clauses, then the per-spelling arithmetic.
 *
 * The witness clauses are the 2026-08-27 tightening and they run in
 * this order for a reason. First the claim must NAME an anchor of this
 * entry's input (`witnessOf`); then that anchor must CARRY `from`, so
 * a rule cannot point at the display it liked and the target it needed
 * on two different anchors. Only then is the display consulted, in
 * `pairFault`, and only that anchor's.
 *
 * The `href` spelling of `from` is now the WITNESS's own href rather
 * than every href in `hrefsFor(claim.from)`. That is the same
 * tightening one level down: the anchor is named, so the spelling to
 * test against is its own, not that of whichever sibling shares its
 * `data-ref`. `head` keeps the `hrefsFor` treatment — the claim does
 * not name the head's anchor, and case 4 carries the same limit for
 * the same reason (see the blind-spot list).
 */
function claimFault(
	value: string,
	anchor: Anchor,
	claim: Corroborate,
	input: Input,
): string | undefined {
	const declared = corroborateFault(claim, input);
	if (declared !== undefined) {
		return declared;
	}
	const lead = corroborateLead(claim.target);
	const witness = witnessOf(claim, input);
	if (witness === undefined) {
		return `${lead} cites no anchor of ${input.rid}'s input at token ${claim.open} of the declared field`;
	}
	if (!carries(witness, claim.from)) {
		return `${lead} cites an anchor that does not carry ${JSON.stringify(claim.from)}`;
	}
	const own = value === anchor.dataRef;
	const heads = own ? [claim.head] : hrefsFor(claim.head, input.source);
	const from = own ? claim.from : witness.href;
	const reasons = heads.map((head) => pairFault(value, head, from, witness));
	if (reasons.some((reason) => reason === undefined)) {
		return;
	}
	return `${corroborateLead(value)} ${
		reasons[0] ??
		`is not ${JSON.stringify(claim.head)} joined to a suffix of ${JSON.stringify(claim.from)}`
	}`;
}

/**
 * Faults from the case-7 arm, with `composeFaults`'s contract exactly:
 * `undefined` means one declared corroboration licensed the value, an
 * EMPTY array means none spoke to this anchor at all.
 *
 * ANY-claim, with cases 3 and 4 and for their reason rather than cases
 * 5 and 6's: `hrefsFor` yields several candidate spellings for one
 * declared `head`, so real multiplicity exists here and a second claim
 * naming a different `from` may be an alternative source rather than a
 * false provenance.
 *
 * The two spellings are handled the way `halvesOf` handles case 4's —
 * declared strings on the `data-ref` side, anchors' `href` values on
 * the href side — and the tail is re-derived for each pair, because it
 * differs between them.
 */
function corroborateFaults(
	value: string,
	anchor: Anchor,
	input: Input,
): string[] | undefined {
	const faults = input.corroborations
		.filter((claim) => claim.target === anchor.dataRef)
		.map((claim) => claimFault(value, anchor, claim, input));
	return faults.some((fault) => fault === undefined)
		? undefined
		: faults.filter((fault): fault is string => fault !== undefined);
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
 * Every offset at which re-inserting `claim.removed` into
 * `claim.written` reproduces a byte-exact substring of one of the
 * entry's own input fields — spec §2 clause 2, and the raw material
 * clause 3 counts.
 *
 * Offsets run `0 … written.length` inclusive, so a run lifted from
 * either end of the tag is expressible. They are CODE UNITS, not
 * codepoints, and that is safe in the direction that matters: the test
 * is exact substring equality, so a split inside a surrogate pair or
 * before a combining mark can only match when the same units are
 * genuinely present in the input. It can make two offsets produce the
 * SAME candidate string — a repeated character next to the insertion
 * point does it — and both are counted, which refuses the claim under
 * clause 3. That is the intended reading: the gate cannot tell which
 * of two identical positions the rule meant, and declines to pick.
 *
 * Quadratic in the tag length by construction (one substring search
 * per offset). Tags are short and claims are rare — the corpus holds
 * two — so the honest loop is cheaper than an index that would have to
 * be justified.
 */
function restoreOffsets(claim: Restore, fields: readonly string[]): number[] {
	const found: number[] = [];
	for (let at = 0; at <= claim.written.length; at++) {
		const candidate = recoveredAt(claim, at);
		if (fields.some((field) => field.includes(candidate))) {
			found.push(at);
		}
	}
	return found;
}

/** `claim.written` with `claim.removed` put back at `at` — the bytes
 * clause 2 says the input must hold, assembled in one place so the
 * offset search and the placement test cannot disagree about what they
 * are looking for. */
function recoveredAt(claim: Restore, at: number): string {
	return claim.written.slice(0, at) + claim.removed + claim.written.slice(at);
}

/**
 * Why `claim` does not license this tag, or `undefined` when it does.
 * The spec's three clauses, and every one of them fail-closed.
 *
 * 1. `written` is the raw opening tag the rule emitted. That is not
 *    tested here but in the CALLER, which matches a claim to an anchor
 *    by `written === anchor.tag` — the same shape as case 5's
 *    `target === anchor.tag`, and for the same reason: the parsed
 *    attributes of this tag are exactly what the defect destroyed.
 * 2. Re-inserting `removed` into `written` must reproduce a byte-exact
 *    substring of some field in this entry's OWN input. Every
 *    character of `written` is then pinned by input bytes, in order
 *    and contiguously, except across the one deleted run.
 * 3. EXACTLY ONE insertion offset may satisfy (2). Two offsets mean
 *    the input does not say which run was lifted, and a gate that
 *    picked one would be asserting a provenance it cannot read. Zero
 *    means the bytes are not the input's at all.
 * 4. **The recovered run must sit WHERE THE CLAIM SAYS IT DOES**
 *    (2026-08-27): in the input counterpart of the field this anchor
 *    was repaired in, at the declared offset. Clauses 2 and 3 alone
 *    ask only that the bytes be somewhere in the entry, so a run
 *    recovered from the headword licensed a repair made in a
 *    definition, and an offset with no field to be an offset into
 *    named nothing. `indexOf(recovered, offset) === offset` is the
 *    whole test and it is exact in both directions: a negative or
 *    fractional offset cannot equal an index, and bytes elsewhere in
 *    the field do not answer for bytes here.
 *
 * Clauses 2 and 3 are KEPT rather than folded into 4, though 4 makes
 * the entry-wide search redundant for an honest claim. Narrowing is
 * free — every claim 4 admits, 2 and 3 admit too — it costs the corpus
 * nothing (D00478's single offset is 54 either way), and dropping 3
 * would silently retire the one clause that says the gate declines to
 * pick between two readings of the same deletion.
 *
 * An empty `removed` needs no clause of its own: every offset then
 * yields `written` itself, so a `written` the input holds verbatim
 * gives `written.length + 1` offsets and one it does not hold gives
 * none. Both are refused by (3), which is why this does not carry a
 * fifth condition to say so.
 *
 * Messages name the VALUE under judgement rather than the tag, on
 * `glyphFault`'s reasoning: tag values repeat, and a message phrased
 * on the tag alone would read as a statement about whichever anchor
 * the rule author had in mind rather than the one being refused.
 */
function restoreFault(
	value: string,
	claim: Restore,
	input: Input,
	field: number,
): string | undefined {
	const offsets = restoreOffsets(claim, input.fields);
	const lead = `restored ${JSON.stringify(value)} re-inserting ${JSON.stringify(claim.removed)}`;
	if (offsets.length === 0) {
		return `${lead} matches nothing in ${input.rid}'s input`;
	}
	if (offsets.length > 1) {
		return `${lead} matches ${input.rid}'s input at ${offsets.length} offsets (${offsets.join(', ')})`;
	}
	if (input.fields[field] !== claim.field) {
		return `${lead} cites a field that is not the one it repaired in ${input.rid}`;
	}
	const recovered = recoveredAt(claim, offsets[0] ?? 0);
	return claim.field.indexOf(recovered, claim.offset) === claim.offset
		? undefined
		: `${lead} is not at offset ${claim.offset} of the cited field in ${input.rid}`;
}

/**
 * Faults from the case-6 arm, sharing `glyphFaults`'s protocol exactly
 * — `undefined` means a declared claim licensed this anchor, an EMPTY
 * array means no claim spoke to it at all — and its ALL-claim
 * quantifier for the same argument, one case out.
 *
 * `glyphFaults` is ALL-claim because at most one `from` can ever
 * de-map from a given `target`, so a second claim on the same tag can
 * only assert a provenance the bytes contradict. Here the equivalent
 * holds a step later: a rule lifted ONE run out of ONE tag, so two
 * claims naming the same `written` with different `removed` are two
 * accounts of one deletion and at least one of them is false. Under
 * ANY-claim a rule could declare the true pair alongside any amount of
 * garbage and this gate — whose whole job is the declaration audit —
 * would say nothing about it.
 *
 * A claim is matched by `written === anchor.tag`, which is clause 1.
 * Nothing else here reads the anchor: like case 5 this licenses a TAG
 * and settles both of its attributes at once, and it has to, because
 * neither of them parses on the input side.
 */
function restoreFaults(
	value: string,
	anchor: Anchor,
	input: Input,
	field: number,
): string[] | undefined {
	const claims = input.restores.filter((claim) => claim.written === anchor.tag);
	if (claims.length === 0) {
		return [];
	}
	const faults = claims
		.map((claim) => restoreFault(value, claim, input, field))
		.filter((fault): fault is string => fault !== undefined);
	return faults.length === 0 ? undefined : faults;
}

/**
 * Why this anchor's `value` (its `href` or its `data-ref`) is not one
 * the entry's input could supply, or `undefined` when it is. The seven
 * spec cases, in order, one line each.
 *
 * Membership in `targets` settles cases 1 and 2 outright. Otherwise
 * the value must be licensed by a declared glyph correction (case 5),
 * restoration (case 6), composition (case 3), recombination (case 4)
 * or corroboration (case 7). Cases 3, 4 and 7 are matched to this
 * anchor by `target === anchor.dataRef`, case 5 by
 * `target === anchor.tag` and case 6 by `written === anchor.tag`:
 * EVERY matching anchor must satisfy the claim, which falls out of
 * checking each anchor against every claim that names it rather than
 * pairing them off. One licence is enough — a value more than one kind
 * of claim names passes if any admits it — and the first fault is
 * reported when none does, case 5 before 6 before 3 before 4 before 7.
 * With no claim of any kind the value is simply absent from the input,
 * which is the fabrication message and the fallback below.
 *
 * Case 7 is consulted LAST among the target cases, and the order is
 * not arbitrary: it is the only one that can MINT an address the
 * corpus may not hold, so any other case that can account for the
 * value should be the one that does. A value both a recombination and
 * a corroboration name is licensed by the recombination, and the
 * weaker provenance is never reached.
 *
 * The two TAG cases are consulted FIRST, and before either attribute
 * is judged, because each licenses a whole opening TAG: a licensed tag
 * settles both of its attributes at once, and neither of them parses
 * on the input side, which is the point of stating those cases on
 * bytes. Case 5 leads case 6 only because it is older; they are keyed
 * to different declarations and cannot both speak to one claim.
 */
function checkValue(
	value: string,
	anchor: Anchor,
	input: Input,
	field: number,
): string | undefined {
	if (input.targets.has(value)) {
		return;
	}
	const glyphs = glyphFaults(value, anchor, input);
	if (glyphs === undefined) {
		return;
	}
	const restores = restoreFaults(value, anchor, input, field);
	if (restores === undefined) {
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
	const corroborated = corroborateFaults(value, anchor, input);
	if (corroborated === undefined) {
		return;
	}
	return (
		[...glyphs, ...restores, ...composed, ...rejoined, ...corroborated][0] ??
		`target ${JSON.stringify(value)} is not in ${input.rid}'s input`
	);
}

/** Everything `checkValue` reads, assembled once.
 *
 * Split out of `checkLinkTargets` rather than written inline: five
 * `?? []` defaults are five branches to a cognitive-complexity counter
 * (`noExcessiveCognitiveComplexity`, and case 7's was the sixth that
 * tipped it), while being one flat statement to a reader. The counting
 * and reporting logic that remains in the caller is what the limit is
 * there to protect. */
function inputOf(
	rid: string,
	fields: readonly string[],
	walked: { output: readonly Placed[]; source: readonly Anchor[] },
	result: Pick<
		TransformResult,
		'composed' | 'corroborated' | 'glyphCorrected' | 'recombined' | 'restored'
	>,
): Input {
	const { output, source } = walked;
	return {
		claims: result.composed ?? [],
		corroborations: result.corroborated ?? [],
		fields,
		glyphs: result.glyphCorrected ?? [],
		rejoins: result.recombined ?? [],
		restores: result.restored ?? [],
		rid,
		source,
		tags: tally(source),
		targets: targetsOf(source),
		written: tally(output.map((placed) => placed.anchor)),
	};
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
		| 'composed'
		| 'corroborated'
		| 'glyphCorrected'
		| 'recombined'
		| 'restored'
		| 'unlinks'
	>,
): string[] {
	const sourceFields = fieldsOf(before);
	const outputFields = fieldsOf(after);
	const changed = !untouched(sourceFields, outputFields);
	const source = changed ? anchorsIn(sourceFields) : [];
	const output = changed ? placedIn(outputFields) : [];
	const { rid } = after;
	const input = inputOf(rid, sourceFields, { output, source }, result);
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
	for (const { anchor, field } of output) {
		const problem =
			checkValue(anchor.dataRef, anchor, input, field) ??
			checkValue(anchor.href, anchor, input, field);
		if (problem !== undefined) {
			problems.push(problem);
		}
	}
	return problems;
}

export { checkLinkTargets };
