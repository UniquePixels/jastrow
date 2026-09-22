/**
 * The ordered rule list and the coverage gate (spec §6).
 *
 * `patterns.jsonl` is the single source of truth. A `route: transform`
 * row must be either registered here or named in PENDING; a row that is
 * neither is a silent skip, and the gate fails on it.
 */
import type { Pattern } from '../patch/patterns.ts';
import { ibAnaphora, sifreAnaphora, targumAnaphora } from './rules/anaphora.ts';
import { unlinkedBareAnaphor } from './rules/anaphora-mint.ts';
import { continuationMarkerDash } from './rules/continuation-marker.ts';
import {
	adjacentVerbatimRepeat,
	duplicatedOpeningRun,
} from './rules/duplication.ts';
import {
	emphasisRunEdgeSpace,
	trailingWhitespaceDefinition,
} from './rules/edge-trim.ts';
import { gereshLetterNumeral, prefixedGereshAbbrev } from './rules/geresh.ts';
import { gereshApostropheGershayim } from './rules/geresh-apostrophe.ts';
import { gershayimInBody, gershayimRefAttribute } from './rules/gershayim.ts';
import {
	abbrevFusedHeadword,
	genderPairAltDuplicate,
} from './rules/headword.ts';
import { holamMaterMigration } from './rules/holam-mater.ts';
import { impossibleDagesh } from './rules/impossible-dagesh.ts';
import { italicSwallowsCloseParen } from './rules/italic-paren.ts';
import {
	italicGlossPeriodOutside,
	labelPeriodInside,
} from './rules/italic-period.ts';
import { unterminatedHref } from './rules/malformed-href.ts';
import {
	pluralToFeminineFinalLetter,
	shurukAsYodDisplayCorruption,
} from './rules/misc-links.ts';
import {
	dupAnchorLanguageRef,
	nestedAnchorDuplicate,
} from './rules/nested-anchor.ts';
import {
	openParenInAnchorDisplay,
	toseftaCloseParen,
	toseftaPrimaryHalakha,
} from './rules/paren-boundary.ts';
import {
	emDashSectionBreak,
	italicLonePunctuation,
} from './rules/punct-seams.ts';
import {
	bareRtlHebrew,
	latinTokenInsideRtl,
	redundantOuterRtl,
} from './rules/rtl.ts';
import {
	anchorItalicSpace,
	gereshAbbrevSpace,
	italicParenSpace,
	parenTagSpace,
	translitItalicSpace,
} from './rules/seam-space.ts';
import { sectionBreakTerminator } from './rules/section-break.ts';
import { seeParticleRestore } from './rules/see-particle.ts';
import { strandedDashStarMarker } from './rules/sense-marker.ts';
import { shinSinDotRestore } from './rules/shin-sin.ts';
import { stemHeadMarkerChop } from './rules/stem-head.ts';
import { asteriskStemStrayPeriod } from './rules/stem-label.ts';
import { strandedStemHead } from './rules/stem-section.ts';
import {
	superscriptInsideAnchor,
	truncatedCitationDigit,
} from './rules/stranded-tail.ts';
import { apparatusCite, ellipsisFragment, rabbiName } from './rules/unlink.ts';
import { vSubRedirectTwin } from './rules/v-sub-twin.ts';
import { vkhGereshRestore } from './rules/vkh-geresh.ts';
import type { Rule } from './types.ts';

/** Rules in execution order. Entangled rows MUST be adjacent — they own
 * the same records and will rewrite each other's work otherwise. */
const RULES: readonly Rule[] = [
	// ======== THE ORDERING DOCTRINE ========
	//
	// These comments say where a rule sits and what forces or frees that
	// position. What a rule repairs, and what licenses it, is in its own
	// module under `rules/`; the per-rule measurements and the record of
	// how each placement was settled are in
	// `docs/archive/registry-history.md`.
	//
	// Four constraints govern the list. `registry.order.test.ts` pins
	// them, `registry.order.corpus.test.ts` earns each rule's class from
	// the corpus rather than from these comments, and `commutation.ts`
	// measures every pair.
	//
	// 1. A rule that repairs what the TOKENIZER sees runs before every
	//    rule that reads the tokens.
	// 2. A rule that DELETES markup runs before one that reads the text
	//    that markup was hiding — unlink before wrap, unwrap before
	//    wrap. An anchor covers Hebrew that `bare-rtl-hebrew` correctly
	//    declines while it stands, so wrapping first never reaches it.
	// 3. A RETARGET runs after every rule that repairs an anchor it
	//    might adopt: after every unlink, and after every earlier
	//    retarget. It copies its antecedent whole, so an antecedent
	//    another rule is about to correct propagates a wrong address.
	// 4. `trailingWhitespaceDefinition` runs last among `text-repairs`.
	//
	// Rows declared `entangledWith` in `patterns.jsonl` must occupy a
	// gap-free span (`checkAdjacency`), which is DIRECTION-BLIND; the
	// direction lives in `ORDERED` below, in the order test, and in the
	// note beside the rule. Every other placement is FREE, and free
	// means measured: the rule moved to the front and to the back of
	// `RULES`, the registry composed over all 32,512 entries, and the
	// entries whose final bytes differ quoted as `front / back`.
	//
	// Everything down to `trailingWhitespaceDefinition` is
	// `text-repairs`, where list position is the only thing that
	// sequences a rule; `PHASE_MANIFEST` in `patch/apply.ts` runs
	// `structural-repairs` only after that whole pass, so moving a rule
	// across the boundary puts it after every wrap and retarget here.

	// Doctrine 1, most literally: an `href` that swallowed its own
	// `</a>` traps everything after it in an `attributeInterior` region
	// that `links.ts` marks `interior: true` and both editors refuse,
	// so no rule below can reach those anchors until this one has run.
	unterminatedHref,

	// ---- The unlink block (doctrine 2) ----

	// OUTSIDE the entangled span below — the display these re-expose is
	// a Latin apparatus citation or a rabbinic name, never Hebrew — and
	// ahead of it, because doctrine 2 applies fail-closed whether or not
	// today's corpus can tell. They also precede every compose rule,
	// which must not adopt work from an anchor they go on to delete.
	apparatusCite,
	rabbiName,

	// They lead the component below without joining it: neither carries
	// an edge to a member, and including them would break its gap-free
	// span. Their own order is free — disjoint populations, separated by
	// locus.
	dupAnchorLanguageRef,
	nestedAnchorDuplicate,

	// ---- The unlink/wrap component: SEVEN rules, gap-free ----
	//
	// One connected component of the entanglement graph: the rtl
	// 3-clique, the geresh pair, and four `bare-rtl-hebrew` edges.
	// Within the span, every UNLINK first, then the wrap trio.
	ellipsisFragment,

	// Each names the other in `entangledWith`, each re-serializing a
	// definition the other rewrites. Internal order free;
	// `gereshLetterNumeral` leads as the audited row of the two.
	gereshLetterNumeral,
	prefixedGereshAbbrev,

	// Entangled with `bare-rtl-hebrew`, which wraps the Hebrew this
	// unlink re-exposes inside the entry's own "Pl." construct.
	pluralToFeminineFinalLetter,

	// The rtl wrapper trio, a 3-clique. Doctrine 2's unwrap arm:
	// unwrapping second leaves 62 entries newly bare with nothing to
	// wrap them; unwrapping first leaves 0.
	redundantOuterRtl,
	bareRtlHebrew,
	latinTokenInsideRtl,

	// ---- The anchor-boundary rules ----
	//
	// All six are `text-repairs`, including the two unlinks above.
	// `structural-repairs` is the WRONG SIDE rather than an empty one —
	// it runs after every wrap and retarget here, the inversion
	// doctrines 2 and 3 forbid — and the name does not fit them: that
	// phase is for a pass changing an entry's SHAPE, which is why
	// `markup.ts` reasons about a field COUNT changing under it.
	//
	// The four below move one of an anchor's own tags across the text
	// beside it, removing no anchor, writing no target and changing no
	// byte of tag-stripped text, so all four are class `NEITHER` and
	// measure free. They sit before every retarget as a fail-closed
	// default: a rule that REPAIRS an anchor runs before one that READS
	// it, and `toseftaSplits` reads a variant's primary as the anchor
	// immediately preceding it, so the unlinks must settle the sequence
	// first.

	// STRICTLY BEFORE `toseftaCloseParen`; the direction is the whole
	// requirement and adjacency cannot see it. That rule destroys
	// `toseftaSplits`'s predicate — a variant's display reads
	// `XVII), 6` before the boundary move and `XVII` after — so a
	// halakha rule below this line repairs 0 primaries while
	// `transform:count`, which measures every rule ALONE, keeps
	// reporting 414 MATCH. Green everywhere, nothing done.
	toseftaPrimaryHalakha,

	toseftaCloseParen,

	// Adjacent to `toseftaCloseParen` by choice, not requirement: no
	// edge is recorded, and the byte-SPAN comparison finds 0
	// intersections although 9 entries carry both shapes at different
	// offsets, so a rid-level test would report a false collision.
	openParenInAnchorDisplay,

	// Composed, `truncatedCitationDigit` fires 12 times where
	// `transform:count` reports 14, and both are correct: `apparatusCite`
	// deletes the whole anchor in G00065 and H00504, taking the defect
	// away with the link that carried it. The orders converge, because
	// unlinking keeps the display text.
	superscriptInsideAnchor,
	truncatedCitationDigit,

	// Free: it writes no `data-ref`/`href`, so no retarget or compose
	// rule conflicts with it, and its 12 anchors already resolve
	// correctly, so no unlink rule can claim them.
	shurukAsYodDisplayCorruption,

	// The first RETARGET; doctrine 3's own case. FOR WHOEVER APPENDS THE
	// NEXT ONE: doctrine 3 covers retarget-after-retarget too. A later
	// `ib-` row may adopt an anchor this rule has already fixed — a
	// repaired address, not a wrong one — but only from below, and the
	// pair must be measured both ways at ADDRESS level, not by count.
	ibAnaphora,

	// Below `ibAnaphora` per doctrine 3; order measured free. The two
	// share 0 entries, disjoint by target, and neither can supply the
	// other's antecedent — this one accepts only a `Sifrei …` anchor,
	// which `ibAnaphora` never writes.
	sifreAnaphora,

	// The third retarget, below both per doctrine 3. All three
	// populations are pairwise disjoint, so the order is free — which is
	// not a reason to reorder them, disjointness being a fact about
	// today's corpus where doctrine 3 survives a re-fetch.
	targumAnaphora,

	// ONE defect, two rows split by locus: document text against tag
	// interiors. Adjacent by requirement — all 90 damaged tags point at
	// a headword carrying the same ASCII quote, so repairing either side
	// alone breaks all 90 cross-links by string identity. Internal order
	// free: the substitution never introduces or removes a `<` or `>`,
	// so neither row can move an occurrence into the other's locus.
	gershayimInBody,
	gershayimRefAttribute,

	// The THIRD arm of the same defect, placed beside the pair so all
	// three sit together. NOT entangled and bound by no ordering
	// constraint: the pair reads an ASCII `"`, this reads the run `׳'`,
	// and neither substitution can create or destroy the other's
	// occurrence. What would bind them is `gershayimRefAttribute`'s
	// `glyphCorrected` claim, which link-target case 5 refuses if the
	// `from` tag already carries a `״` — and this rule is document-text
	// only, leaving every `<…>` run byte-identical.
	gereshApostropheGershayim,

	// ---- Italic and punctuation seams ----
	//
	// Twelve rules, five modules, every placement measured. Two are
	// constrained; ten are free. A placement ARGUED rather than measured
	// is how the rtl trio shipped backwards with every unit test green.

	// The seam rules lead by argument, not measurement: all five read
	// 0 / 0. A missing space at `</a><i>` or `)<i>` changes what "the
	// italic run body" is for the label predicate below, so repairing
	// the seam first makes that predicate read the string a human reads
	// — a fail-closed default against a re-fetch.
	//
	// Mutually order-free BY CONSTRUCTION: `parenTagSpace` owns both
	// `)<i>` and `)</a><i>`, and `anchorItalicSpace`'s negative
	// lookbehind declines every seam whose anchor display ends in `)`,
	// so their 53 shared occurrences have one owner either way.
	anchorItalicSpace,
	parenTagSpace,
	italicParenSpace,
	translitItalicSpace,
	gereshAbbrevSpace,

	// Measured 0 / 0. It matches a paren INSIDE a run body with text on
	// both sides, where the seam rules match one adjacent to a tag from
	// outside, and it creates 0 new `<i>␣`/`␣</i>` edges.
	italicSwallowsCloseParen,

	// Measured 0 / 0, as `LONE_PUNCTUATION`'s `[.?;]` class requires —
	// it cannot match `emDashSectionBreak`'s em-dash against any corpus,
	// and nothing but that class keeps the two populations apart. It
	// sits OUTSIDE the component below, as close to `emDashSectionBreak`
	// as that gap-free span allows.
	italicLonePunctuation,

	// ---- The italic component: FOUR rules, gap-free ----
	//
	// Three of its ordering constraints are non-commutation, measured by
	// `commutation.ts` in entries whose final bytes differ between the
	// two orders:
	//
	//   em-dash-section-break-in-own-italic × italic-swallowed-…-period  270
	//   emphasis-run-edge-space × italic-swallowed-terminal-period         13
	//   em-dash-section-break-in-own-italic × label-period-outside-italic   4
	//
	// All three are `entangledWith` edges; with the period-pair edge the
	// four form one component. Without the declaration
	// `checkAdjacency()` is blind to them and this file is the only
	// thing holding them.

	// Measured 0 / 13 — CONSTRAINED: it must not run last. 29
	// trailing-edge occurrences read `<i>gloss.␣</i>`, where the
	// captured space hides the terminal period from
	// `italicGlossPeriodOutside`'s `INSIDE` pattern, which needs the
	// period to abut `</i>`. Order against the seam rules is free: both
	// orders converge on the same bytes and differ only in credit.
	emphasisRunEdgeSpace,

	// Measured 0 / 270 — CONSTRAINED. `SECTION_BREAK` needs its input's
	// first run to still read `<i>gloss.</i>`, which is exactly the
	// shape `italicGlossPeriodOutside` rewrites; with the gloss rule
	// first this one survives on 0 of its 270 entries. It does NOT need
	// to precede `labelPeriodInside`, whose pattern needs a period
	// already sitting after `</i>`.
	//
	// THE COST, since it is real: merging the two runs leaves a body
	// ending `—`, which `INSIDE` cannot match, so this rule takes 247
	// entries out of `italicGlossPeriodOutside`'s reach and 4 out of
	// `labelPeriodInside`'s — the whole-body granularity ruling (R1)
	// doing what it was ruled to do, not a rule failing.
	emDashSectionBreak,

	// The label pair, gap-free adjacent. `labelPeriodInside` measures
	// 0 / 0, so the internal order is free; it leads for robustness. It
	// moves every label's period inside, removing those runs from the
	// `<i>….</i>` population `italicGlossPeriodOutside` reads, so that
	// rule's exclusion clause is an assertion that already holds rather
	// than a filter that must get every label right one at a time.
	labelPeriodInside,
	italicGlossPeriodOutside,

	// ---- The headword-field family ----
	//
	// The first rules whose object is a FIELD rather than markup. One
	// rule above reaches that input — `gershayimInBody` is scoped to
	// every field `fieldsOf` walks — and the two converge rather than
	// conflict, since it repairs the copy too if it runs second.
	//
	// `parenAltHeadword` and `phraseAltHeadwordStub` sat here, in that
	// order, as an `entangledWith` pair that did not commute. Both were
	// UNREGISTERED 2026-09-21 with the headword-design §2 adoption: the
	// grouping the first deleted is now structure in `display`, and
	// §4's HW-no-expand row stops the second expanding. Removing them
	// removed the only ordering constraint this block carried.
	//
	// Free: `abbrevFusedHeadword` is the only rule in the registry that
	// rewrites `headword`, and `genderPairAltDuplicate` keys on whole
	// array values no other rule constructs.
	abbrevFusedHeadword,
	genderPairAltDuplicate,

	// Free: no rule here reads `grammar.verbal_stem`, and the only other
	// writer of a grammar field runs in a LATER PHASE. It sits above
	// `trailingWhitespaceDefinition` only to keep doctrine 4 literally
	// true — it never touches a `definition`.
	asteriskStemStrayPeriod,

	// IT CANNOT MEET ANY RULE ABOVE IT, structurally rather than by
	// argument: it fires only when the entry's whole content is ONE
	// CHILDLESS SENSE whose definition is a leading comma and an anchor,
	// which every `definition`-rewriting rule above needs more than. The
	// one rule that could touch the same bytes is
	// `trailingWhitespaceDefinition`, which is why this sits above it —
	// and it is a PURE INSERTION, carrying every other byte through,
	// edge whitespace included, so it hands that rule neither a new
	// member nor a lost one.
	seeParticleRestore,

	// Below `seeParticleRestore` because the two share a population
	// SHAPE while their rid sets are measured disjoint, and this is the
	// fail-closed order: were that rule ever to mint a `v. sub` where
	// none stood, it runs first and this rule simply does not match, its
	// table being keyed on rid AND the anchor's exact current target.
	// The reverse order would let a retarget change bytes the particle
	// rule reads.
	vSubRedirectTwin,

	// ---- The four Hebrew-orthography rows ----
	//
	// They end `text-repairs` as a block for one reason covering all
	// four: each keys on a Hebrew WORD or MARK, so each must see the
	// text every earlier text rule leaves rather than text one of them
	// might still change.

	// DIRECTLY BELOW `vSubRedirectTwin` BECAUSE THE TWO ARE ENTANGLED,
	// an edge the commutation gate found: `קוּסְדֹּור` carries this defect
	// inside S01645's stub target, so running this rule first breaks
	// that frozen table's key and the retarget is silently lost while
	// every per-rule count reads normal. The general lesson: A TABLE
	// KEYED ON DAMAGED BYTES IS DISABLED BY ANY RULE THAT REPAIRS THEM.
	holamMaterMigration,

	// Below `holamMaterMigration` because its twin table is keyed on
	// exact bytes — the same hazard one rule later, since a key holding
	// a migrated holam would be matched against text that rule has
	// already canonicalised and would never fire.
	shinSinDotRestore,

	// It swaps a LETTER where the two rules above swap or add a MARK, so
	// letters might be expected first; measured, the direction is free,
	// since neither point rule can create or destroy a dagesh. The
	// position is fixed by the entanglement above, whose gap-free span
	// leaves nowhere else to go.
	impossibleDagesh,

	// Entangled with nothing above it: the two letters it matches carry
	// no point, so no rule in this block can create or destroy one of
	// its members.
	vkhGereshRestore,

	// The first rule that CREATES an anchor, and LAST AMONG THE TEXT
	// RULES THAT DO ANY WORK. CONSTRAINED three ways:
	//
	// 1. After `ibAnaphora` (doctrine 3), which retargets the 312 bare
	//    anaphors the linker dropped into the `Yoma 2a` sink.
	//    `isSpentAnaphor` would catch a copied `Yoma 2a*` antecedent,
	//    but by declining, which loses a repair.
	// 2. After every rule that can create a bare `Ib.`. One exists: the
	//    population is 2,819 at the repaired stage and 2,820 after the
	//    phase, so running last is what makes that one reachable.
	// 3. Before `trailingWhitespaceDefinition` (doctrine 4), even though
	//    this rule writes no trailing whitespace — "last" is what makes
	//    that rule's measured 0 the whole answer rather than a claim
	//    about one pair.
	unlinkedBareAnaphor,

	// Doctrine 4, measured 0 / 0. It trims the entry's deepest-last
	// sense, so it must see that sense as every earlier rule leaves it;
	// `emphasisRunEdgeSpace` is the one rule that could hand it a new
	// member, and `edge-trim.test.ts` pins the count of space-terminated
	// fields as identical before and after.
	trailingWhitespaceDefinition,

	// ---- The `structural-repairs` rules ----
	//
	// From here down the rules run in a DIFFERENT PHASE, so list
	// position is not what sequences them: `applyTransforms` filters by
	// phase, and `structural-repairs` runs only after the whole
	// `text-repairs` pass. They are last here so the list reads in
	// execution order.
	//
	// The loss gate (`no-lost-text.ts`) judges every rule in this
	// registry. It judged this one alone while gating was phase-scoped;
	// the `text-repairs` rules that delete text were pinned by count
	// then, and `LOSS_ALLOWANCES` carries that pinning now.
	stemHeadMarkerChop,
	// It does not meet `stemHeadMarkerChop`, and that is a MEASUREMENT
	// rather than a property of the predicates: chop needs a sense with
	// `number: '1)'` and 0 of this rule's 436 members carry a number on
	// `content.senses[0]`. `blockFor` handles `sense.number` explicitly,
	// so a numbered `senses[0]` is NOT a shape this predicate rejects —
	// the exclusion is corpus-shaped, and a re-fetch could end it.
	strandedStemHead,
	// THEY RUN IN THIS PHASE BECAUSE THE LOSS GATE IS PHASE-SCOPED: this
	// is the only phase in which a deletion is judged PER CALL. Size is
	// not the argument — on the baseline's own basis (`textOf`, tags
	// stripped) they delete 2,738 codepoints against a 4,510 baseline.
	//
	// THEIR DISJOINTNESS IS POSITIONAL: `duplicatedOpeningRun` matches
	// only at offset 0 and `adjacentVerbatimRepeat` only away from it,
	// so no run can be claimed by both.
	duplicatedOpeningRun,
	adjacentVerbatimRepeat,
	// THE ONLY RULE IN THIS REGISTRY THAT MINTS A BYTE INTO THE TEXT. It
	// runs after both deletion rules because it is the only member that
	// ADDS; nothing else depends on its position, since no rule above
	// writes or removes its `—<label>` boundary.
	sectionBreakTerminator,
	// DIRECTLY ABOVE `continuationMarkerDash` BECAUSE THE TWO ARE
	// ENTANGLED, an edge the commutation gate found rather than a
	// reader: writing `—*3)` onto a sibling CREATES the witness that
	// rule requires, so this one must run FIRST or the repair never
	// happens. It meets neither rule above it — `stemHeadMarkerChop`
	// needs a definition ending `—N) ` where this needs one ending in
	// the dash itself, and `strandedStemHead` needs an opening italic
	// label run this rule never writes.
	strandedDashStarMarker,
	// It writes a `number` where `sectionBreakTerminator` writes a
	// `definition`, and nothing above it writes a `number` except
	// `stemHeadMarkerChop` and `strandedDashStarMarker`, both of which
	// leave a DASHED marker this rule's predicate refuses.
	continuationMarkerDash,
];

/**
 * One intended order dependency: `before` must run before `after`.
 *
 * The second way a non-commuting pair may be justified, beside
 * `entangledWith`, because the two record different phenomena:
 *
 * - **`entangledWith` is POPULATION COLLISION.** Two rows own the same
 *   records, so a rule touching one must account for the other or it
 *   rewrites the same anchors twice. The remedy is ADJACENCY, because
 *   what matters is that nothing runs BETWEEN them.
 * - **`ORDERED` is SEQUENCE DEPENDENCY.** One rule reads what another
 *   writes. The remedy is a DIRECTION, and adjacency is irrelevant:
 *   `unlinked-bare-anaphor` reads the antecedent every retarget and
 *   unlink rule above it leaves, so it must run after all of them and
 *   can be adjacent to none. Contiguity and "runs last" cannot both
 *   hold, which is the shape that needs this second mechanism.
 *
 * Three checks keep it from being a suppression list, and the middle
 * one is the one that matters:
 *
 * 1. Both ids must be registered (`checkOrdered`).
 * 2. **The registry must actually satisfy the direction**
 *    (`checkOrdered`). A declaration that does not match the shipped
 *    order is a false record, not a licence, and is reported.
 * 3. **The pair must actually be non-commuting**
 *    (`commutation.corpus.test.ts`). An entry for a pair whose two
 *    orders agree is STALE — the dependency it records has gone — and
 *    the gate reports it rather than carrying it forever. A recorded
 *    relationship must produce a validated check or a reported
 *    problem, never silence.
 *
 * `reason` is prose for a reader and is checked by nobody. It must say
 * what the wrong order WRITES, not that an order exists; each one was
 * measured on the entry it names.
 */
interface Ordered {
	after: string;
	before: string;
	reason: string;
}

/** Non-commuting pairs whose order is intended, fixed and argued. See
 * `Ordered`. Every one was measured on the entry it names. */
const ORDERED: readonly Ordered[] = [
	{
		after: 'unlinked-bare-anaphor',
		before: 'rabbi-name-linked-as-bible-book',
		reason:
			"I00273: the unlink removes an anchor pointing at `Joshua 2`, a rabbi's name misread as a book. Run the mint first and it copies `Joshua 2` onto the `Ib.`; run the unlink first and the mint reaches the real antecedent, `Kohelet Rabbah 12:7:1`. This is rule 1's hazard in `registry.order.test.ts` — an unlink deleting the antecedent a reader would otherwise read — and that assertion already pins the direction independently.",
	},
	{
		after: 'unlinked-bare-anaphor',
		before: 'ib-targum-work-loss',
		reason:
			'C00446: the retarget restores the lost work, `Leviticus 9:7` → `Targum Jonathan on Leviticus 9:7`. The mint copies its antecedent whole, so running first copies the unrepaired address. Same direction, same reason as the unlink above: the mint reads what every target-writing rule leaves.',
	},
	{
		after: 'unlinked-bare-anaphor',
		before: 'bare-rtl-hebrew',
		reason:
			'A03092: wrapping the bare Hebrew changes the token stream the antecedent walk reads, and the mint then finds an antecedent (`Exodus 15`) it otherwise misses. The wrong order loses a repair rather than writing a wrong one — a decline, not a mislink — but it is a real difference and the shipped order is the one that repairs more.',
	},
	{
		after: 'unlinked-bare-anaphor',
		before: 'superscript-subsection-stranded-outside-anchor',
		reason:
			'S02235: the superscript rule pulls a stranded `<sup>` inside its anchor. The two orders differ in whether that `<sup>10</sup>` ends up inside or outside, because the mint changes the anchor sequence the superscript rule indexes into. Neither writes a wrong target; the shipped order is the one measured.',
	},
];

/**
 * Problems with `ORDERED` against the registry: an unknown id, or a
 * declaration the shipped order does not satisfy.
 *
 * Every problem is returned rather than throwing on the first, like
 * `checkAdjacency`'s — the list is checked as a whole.
 */
function checkOrdered(
	declarations: readonly Ordered[] = ORDERED,
	rules: readonly Rule[] = RULES,
): string[] {
	const at = new Map(rules.map((rule, index) => [rule.id, index]));
	return declarations.flatMap((row) => {
		const before = at.get(row.before);
		const after = at.get(row.after);
		if (before === undefined || after === undefined) {
			const missing = [
				before === undefined ? row.before : undefined,
				after === undefined ? row.after : undefined,
			].filter((id) => id !== undefined);
			return [`ORDERED names unregistered rule(s): ${missing.join(', ')}`];
		}
		return before < after
			? []
			: [
					`ORDERED says ${row.before} runs before ${row.after}, but the registry runs it after`,
				];
	});
}

/** Rows awaiting registration. Empty: every catalogued transform row
 * is owned by `RULES` or by `COVERED`. The record of what left this
 * array, and why, is `docs/archive/registry-history.md`. */
const PENDING: readonly string[] = [];

/**
 * Catalogued transform rows with NO rule of their own and no rule
 * owed: every one of their records is repaired by a rule registered
 * for ANOTHER row.
 *
 * The third state the registry can be in. `PENDING` is a standing
 * claim that a row is still owed a rule; `RULES` says a rule carries
 * the row's own id. `jt-double-wrapped-citation` is neither — it is
 * the empty-trapped-text arm of `nested-anchor-swallows-punctuation`,
 * and no rule will ever carry its id. Left in `PENDING` it would be a
 * false claim NO GATE COULD SEE, since a row sitting there is exactly
 * what `coverage()` expects to find; removed from `PENDING` and named
 * nowhere it becomes `unaccounted`, the same silence from the other
 * side.
 *
 * What this list buys is falsifiability, through `coverage()` below: a
 * row here counts as owned only while the rule named by `by` is
 * actually registered, so unregistering `nestedAnchorDuplicate` drops
 * `jt-double-wrapped-citation` straight into `unaccounted` and fails
 * `registry.test.ts`. A row named here AND in `PENDING` is reported as
 * `duplicated`, so the two claims cannot both stand.
 *
 * What it does NOT establish is that the repair is real — no more than
 * a `PENDING` entry establishes that a row still needs one.
 */
const COVERED: readonly { by: string; row: string }[] = [
	{
		by: 'nested-anchor-swallows-punctuation',
		row: 'jt-double-wrapped-citation',
	},
];

/**
 * Catalogued transform rows a MAINTAINER RULING says will never be
 * repaired by a transform — a fourth state, and the only one whose
 * warrant is a decision rather than a measurement.
 *
 * `PENDING` claims a row is still owed a rule; `COVERED` claims
 * another rule already repairs it; `RULES` carries the row's own id.
 * A row that is none of those is `unaccounted`, which is the right
 * answer for a row nobody has looked at — and the wrong one for a row
 * somebody looked at and ruled out. Without this list, unregistering a
 * rule by ruling is indistinguishable from forgetting to write one.
 *
 * Each entry names the ruling, so the claim is checkable against
 * `docs/decisions.md` rather than self-granted. Unlike `COVERED` there
 * is no registered rule to hang the check on: what keeps this list
 * honest is that a row named here is reported in `retired`, counted,
 * and rendered in the review report as a class no detector answers.
 */
const RETIRED: readonly { by: string; row: string }[] = [
	{
		by: 'HW-paren (2026-09-20), adopted by HW-schema (2026-09-21): print grouping is structure in `display`, never deleted',
		row: 'parenthesized-alt-headword',
	},
	{
		by: 'HW-no-expand (2026-09-20), adopted by HW-schema (2026-09-21): an abbreviated alternate keeps its printed form and is `partial`',
		row: 'phrase-alt-headword-stub',
	},
];

interface Coverage {
	/** Rows named by `COVERED` whose owning rule is registered — no
	 * rule of their own, and none owed. Counted inside `registered`,
	 * because they ARE owned; listed separately because a row nobody
	 * can find by searching `RULES` for its id is exactly the kind of
	 * claim this file exists to keep visible. */
	covered: string[];
	/** Rows claimed by BOTH `PENDING` and one of the owning lists — a
	 * row that has a rule and is still listed as waiting for one.
	 * Always empty; a non-empty value means the lists disagree about
	 * who owns the row, and `registered + pending` over-counts
	 * `total`. */
	duplicated: string[];
	pending: number;
	/** Rows a registered rule owns: by carrying the row's id, or by
	 * repairing it under another row's id (`COVERED`). */
	registered: number;
	/** Rows a ruling retired: no rule, and none owed. Counted apart
	 * from `pending` so `registered + pending + retired === total`
	 * stays a real claim rather than an identity. */
	retired: string[];
	total: number;
	/** Transform rows that are neither registered, pending nor retired.
	 * A `COVERED` row whose owning rule is NOT registered lands here,
	 * which is what stops that list from being a self-granted
	 * exemption. */
	unaccounted: string[];
}

/**
 * Partition the catalogue's transform rows across `RULES`, `COVERED`,
 * `PENDING` and `RETIRED`.
 *
 * `pending` is counted from `PENDING`, NOT as the complement of
 * `registered`. The complement reading makes `registered + pending ===
 * total` an arithmetic identity — true for any input, unable to fail,
 * and therefore not a test. Counting each side from its own list makes
 * the sum a real claim: it holds only if every row belongs to exactly
 * one list, so a row in neither (also reported as `unaccounted`) or in
 * both (`duplicated`) breaks it.
 */
function coverage(catalogue: readonly Pattern[]): Coverage {
	const rows = catalogue.filter(
		(row) => row.route === 'transform' && row.status === 'candidate',
	);
	const rules = new Set(RULES.map((rule) => rule.id));
	// A `COVERED` row is owned by the rule that repairs it, so the claim
	// is only as good as that rule's registration — check it here rather
	// than trusting the list.
	const registered = new Set([
		...rules,
		...COVERED.filter((c) => rules.has(c.by)).map((c) => c.row),
	]);
	const pending = new Set(PENDING);
	const retired = new Set(RETIRED.map((r) => r.row));
	return {
		covered: rows
			.filter((row) => registered.has(row.id) && !rules.has(row.id))
			.map((row) => row.id),
		duplicated: rows
			.filter(
				(row) =>
					(registered.has(row.id) || retired.has(row.id)) &&
					(pending.has(row.id) ||
						(registered.has(row.id) && retired.has(row.id))),
			)
			.map((row) => row.id),
		pending: rows.filter((row) => pending.has(row.id)).length,
		registered: rows.filter((row) => registered.has(row.id)).length,
		retired: rows.filter((row) => retired.has(row.id)).map((row) => row.id),
		total: rows.length,
		unaccounted: rows
			.filter(
				(row) =>
					!(
						registered.has(row.id) ||
						pending.has(row.id) ||
						retired.has(row.id)
					),
			)
			.map((row) => row.id),
	};
}

/** One connected component of the catalogue's entanglement graph that
 * the registry can get wrong: either it has at least two REGISTERED
 * members, so execution order can split it, or it names an endpoint
 * the catalogue does not hold, so the record itself is broken. */
interface Cluster {
	/** Registry positions of the members that are registered, ascending. */
	at: number[];
	/** Every id in the component, registered or not, sorted. */
	ids: string[];
	/** Ids in the component that exist ONLY as an `entangledWith`
	 * endpoint — no catalogue row and no rule holds them — sorted.
	 * Empty for a healthy component.
	 *
	 * A stale or misspelt endpoint, in other words. An id the registry
	 * holds but the catalogue does not is NOT this: it contributes a
	 * position, so the span check still sees it, and
	 * `registry.test.ts`'s coverage suite is what names it.
	 * `checkEntanglement` names these from the catalogue's side; they
	 * are carried here so the adjacency gate does not fall silent when
	 * one of them shrinks a component below the two registered members
	 * it needs. */
	stale: string[];
}

/**
 * The `entangledWith` graph as an UNDIRECTED adjacency map: every edge
 * is stored on both endpoints, whichever side of it the catalogue
 * actually recorded.
 *
 * Reading `row.id -> row.entangledWith` alone builds a DIRECTED graph,
 * and `componentOf` traverses in that one direction only. A one-sided
 * edge — `a` names `b`, `b` does not name `a` — is then invisible from
 * `b`: if `b` sits earlier in `RULES` it is walked first, enters
 * `seen` as a singleton, and the later walk from `a` skips it. The
 * component never forms, so `checkAdjacency` passes on a SPLIT
 * recorded entanglement. Adding the reverse edge makes the traversal
 * find it from either end.
 *
 * `checkEntanglement` reports an unreciprocated edge as a catalogue
 * problem, and every edge is reciprocated today, so nothing in the
 * corpus reaches this. That is exactly why it is worth building
 * correctly: a gate whose correctness rests on a property of its own
 * input is the failure mode it exists to catch. Pinned by
 * `registry.test.ts`, walked from the side holding no edge.
 *
 * Edges to ids the catalogue does not hold are kept: they contribute
 * no registry position, so they widen no span, but they are what
 * `Cluster.stale` reports — a dangling endpoint otherwise shrinks a
 * component below two registered members and takes the whole component
 * out of the gate's view with it. `checkEntanglement` names them from
 * the catalogue's side; `checkAdjacency` names them from this one.
 */
function undirectedGraph(catalogue: readonly Pattern[]): Map<string, string[]> {
	const edges = new Map<string, Set<string>>();
	const of = (id: string): Set<string> => {
		const found = edges.get(id) ?? new Set<string>();
		edges.set(id, found);
		return found;
	};
	for (const row of catalogue) {
		of(row.id);
		for (const other of row.entangledWith ?? []) {
			of(row.id).add(other);
			of(other).add(row.id);
		}
	}
	return new Map([...edges].map(([id, set]) => [id, [...set]]));
}

/** The connected component containing `from`, marking each id seen so
 * a component is walked once rather than once per member. */
function componentOf(
	from: string,
	partners: ReadonlyMap<string, readonly string[]>,
	seen: Set<string>,
): string[] {
	const cluster: string[] = [];
	const queue = [from];
	while (queue.length > 0) {
		const id = queue.pop() as string;
		if (seen.has(id)) {
			continue;
		}
		seen.add(id);
		cluster.push(id);
		queue.push(...(partners.get(id) ?? []).filter((p) => !seen.has(p)));
	}
	return cluster;
}

/**
 * Every entanglement cluster the registry can currently get wrong,
 * DERIVED from the catalogue rather than listed anywhere.
 *
 * Exported because a hand-written test per cluster is a convention
 * with nothing enforcing it: `checkAdjacency` skips a component with
 * fewer than two registered members, so the day a pending row's rule
 * ships, its cluster starts mattering and no existing test knows.
 * Tests assert against THIS list, so the set of clusters under test is
 * the set that exists.
 */
function entangledClusters(
	catalogue: readonly Pattern[],
	rules: readonly Rule[] = RULES,
): Cluster[] {
	const index = new Map(rules.map((rule, at) => [rule.id, at]));
	const known = new Set(catalogue.map((row) => row.id));
	const partners = undirectedGraph(catalogue);
	const seen = new Set<string>();
	const clusters: Cluster[] = [];
	for (const rule of rules) {
		if (seen.has(rule.id)) {
			continue;
		}
		const ids = componentOf(rule.id, partners, seen);
		const at = ids
			.flatMap((id) => {
				const found = index.get(id);
				return found === undefined ? [] : [found];
			})
			.toSorted((a, b) => a - b);
		const stale = ids
			.filter((id) => !(known.has(id) || index.has(id)))
			.toSorted((a, b) => a.localeCompare(b));
		// The walk starts from a registered id, so `at` always holds at
		// least one position and `Math.max` below is never called on an
		// empty list. Two registered members is the ORDER question; a
		// stale endpoint is a RECORD question, and a component can raise
		// the second while falling short of the first.
		if (at.length >= 2 || stale.length > 0) {
			clusters.push({
				at,
				ids: ids.toSorted((a, b) => a.localeCompare(b)),
				stale,
			});
		}
	}
	return clusters.toSorted((a, b) =>
		(a.ids[0] ?? '').localeCompare(b.ids[0] ?? ''),
	);
}

/**
 * Entangled rows own the same records; a gap between them in execution
 * order means one rewrites the other's output.
 *
 * The check is CLUSTER CONTIGUITY, not pairwise distance. Entanglement
 * is transitive — the RTL family is a 3-clique — and in any contiguous
 * run of three the two endpoints are 2 apart, so a pairwise "≤ 1" test
 * can never be satisfied by a group larger than a pair. What "adjacent"
 * means for a cluster is that its members occupy a gap-free span, in
 * any order.
 *
 * ## What this gate CANNOT prove, stated rather than implied
 *
 * It reads the catalogue's `entangledWith` graph and nothing else, so
 * an entanglement nobody recorded does not exist as far as it is
 * concerned. A row carrying NO edge is invisible to it: the row's
 * component is a singleton, `entangledClusters` drops it, and the gate
 * returns clean whatever the registry does with that rule. That is a
 * catalogue-completeness problem and it is not fixable here. What a
 * rule author gets from a clean run is: no RECORDED entanglement is
 * split. Not: no entanglement is split. The cheapest guard remains
 * running the corpus under both orders and comparing bytes, which
 * needs no edge in the catalogue to work.
 */
function checkAdjacency(
	catalogue: readonly Pattern[],
	rules: readonly Rule[] = RULES,
): string[] {
	return entangledClusters(catalogue, rules).flatMap((cluster) => {
		const problems: string[] = [];
		if (cluster.stale.length > 0) {
			problems.push(
				`${cluster.ids.join(', ')} names unknown id(s): ${cluster.stale.join(', ')}`,
			);
		}
		const span = Math.max(...cluster.at) - Math.min(...cluster.at) + 1;
		if (span !== cluster.at.length) {
			problems.push(
				`${cluster.ids.join(', ')} span ${span} slots for ${cluster.at.length} registered rule(s)`,
			);
		}
		return problems;
	});
}

/**
 * Recorded entanglements the adjacency gate says NOTHING about —
 * neither validated inside a cluster nor reported as a problem.
 *
 * THE INVARIANT: a recorded entanglement touching the registry must
 * produce a validated cluster or a reported problem, never silence.
 * Three ways of breaking it have been found, each closed without
 * changing the shape:
 *
 * 1. A DIRECTED graph put a one-sided edge's endpoints in different
 *    components, so neither reached two registered members — fixed in
 *    `undirectedGraph`.
 * 2. A component with fewer than two registered members is dropped,
 *    which is correct for ORDER and left the rtl 3-clique pinned by
 *    nothing — closed by the derived-set assertion in
 *    `registry.order.test.ts`.
 * 3. A DANGLING endpoint shrank a component below two registered
 *    members and dropped it silently — closed by `Cluster.stale`.
 *
 * This function is the conservation law behind all three: walk the
 * edges the catalogue actually records and require each one that
 * touches a registered rule to land inside a derived cluster. It would
 * have caught 1 and 3, and it catches a FOURTH way of losing an edge
 * that nobody has thought of yet.
 *
 * What it does NOT replace is the derived-set assertion, since an edge
 * DELETED from the catalogue is not a recorded edge and this walks
 * past it. Two complementary claims, not one — and NEITHER witnesses
 * the deletion of an edge whose endpoints are both unregistered, since
 * `entangledClusters` derives over REGISTERED rules and such an edge
 * never enters a cluster. Protection begins once one endpoint is
 * registered, so register the rule FIRST and delete the edge second;
 * what pins a deletion itself is a direct catalogue assertion, as in
 * `rules/sense-marker.test.ts`.
 *
 * Edges between two unregistered rows are therefore excluded rather
 * than missing: execution order cannot be wrong about a rule that does
 * not run. Self-edges are excluded too — `checkEntanglement` owns
 * those, and a component cannot be split from itself.
 */
function unaccountedEdges(
	catalogue: readonly Pattern[],
	rules: readonly Rule[] = RULES,
): string[] {
	const registered = new Set(rules.map((rule) => rule.id));
	const clusters = entangledClusters(catalogue, rules);
	const found = new Set<string>();
	for (const row of catalogue) {
		for (const other of row.entangledWith ?? []) {
			if (
				other === row.id ||
				!(registered.has(row.id) || registered.has(other)) ||
				clusters.some(
					(cluster) =>
						cluster.ids.includes(row.id) && cluster.ids.includes(other),
				)
			) {
				continue;
			}
			found.add(
				`${[row.id, other].toSorted((a, b) => a.localeCompare(b)).join(' ~ ')}: recorded entanglement is invisible to the adjacency gate`,
			);
		}
	}
	return [...found].toSorted((a, b) => a.localeCompare(b));
}

export type { Cluster, Coverage, Ordered };
export {
	COVERED,
	checkAdjacency,
	checkOrdered,
	coverage,
	entangledClusters,
	ORDERED,
	PENDING,
	RETIRED,
	RULES,
	unaccountedEdges,
};
