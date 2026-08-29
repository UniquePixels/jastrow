/**
 * The ordered rule list and the coverage gate (spec §6).
 *
 * `patterns.jsonl` is the single source of truth. A `route: transform`
 * row must be either registered here or named in PENDING; a row that is
 * neither is a silent skip, and the gate fails on it.
 */
import type { Pattern } from '../research/patterns.ts';
import { ibAnaphora, sifreAnaphora, targumAnaphora } from './rules/anaphora.ts';
import {
	emphasisRunEdgeSpace,
	trailingWhitespaceDefinition,
} from './rules/edge-trim.ts';
import { gereshLetterNumeral, prefixedGereshAbbrev } from './rules/geresh.ts';
import { gershayimInBody, gershayimRefAttribute } from './rules/gershayim.ts';
import {
	abbrevFusedHeadword,
	genderPairAltDuplicate,
	parenAltHeadword,
	phraseAltHeadwordStub,
} from './rules/headword.ts';
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
import { stemHeadMarkerChop } from './rules/stem-head.ts';
import { asteriskStemStrayPeriod } from './rules/stem-label.ts';
import { strandedStemHead } from './rules/stem-section.ts';
import {
	superscriptInsideAnchor,
	truncatedCitationDigit,
} from './rules/stranded-tail.ts';
import { apparatusCite, ellipsisFragment, rabbiName } from './rules/unlink.ts';
import type { Rule } from './types.ts';

/** Rules in execution order. Entangled rows MUST be adjacent — they own
 * the same records and will rewrite each other's work otherwise. */
const RULES: readonly Rule[] = [
	// ======== REPAIR THE PARSER'S VIEW FIRST ========
	//
	// `unterminated-href-swallows-closing-tag` (batch 4 task 5, gated
	// 2026-08-27 by `fix/link-target-gate-cases`). 2 occurrences, D00478
	// and J00597, and it leads `RULES` on its own module's argument
	// rather than on the doctrine below.
	//
	// An `href` that swallowed its own `</a>` leaves everything after it
	// inside an unrecovered `attributeInterior` region, and `links.ts`
	// marks every anchor trapped in one `interior: true`. BOTH editors
	// refuse those outright. In J00597 that is twelve anchors — the
	// ENTIRE corpus-wide `interior` population, all in that one entry,
	// all behind this one tag — so until this rule runs, no other rule
	// in this list can reach them, and each of them would decline for a
	// reason that is an artefact of the damage rather than a fact about
	// the text. That is the "unwrap before wrap" doctrine below in its
	// most literal form: a rule that repairs what the TOKENIZER can see
	// runs before every rule that reads the tokens.
	//
	// It shares the `text-repairs` phase with every other rule
	// (`structural-repairs` runs AFTER `text-repairs` per
	// `admin/pipeline/patch/apply.ts:56-57`, which is the wrong side of
	// every rule that edits an anchor this one frees), so position in
	// this list is the only thing that sequences it.
	//
	// It was written in batch 4 and deliberately left UNREGISTERED: the
	// link-target gate refused D00478, and `run.ts` throws on a gate
	// problem, so registering it would have halted the migration on the
	// first pass over that entry. Case 6 (spec
	// docs/specs/2026-08-27-link-target-gate-cases.md §2) licenses the
	// repair from the tag's own damaged bytes, the rule DECLARES the
	// pair through `restored`, and the row leaves `PENDING` below.
	//
	// It is neither an unlink nor a retarget nor a wrap: it declares no
	// `unlinks`, and it writes a target only by relocating the bytes
	// that already spelled it. `registry.order.test.ts` classifies it in
	// its own `RESTORE` set, EARNED over the corpus from the `restored`
	// declaration exactly as `GLYPH` is earned from `glyphCorrected`.
	unterminatedHref,

	// ======== UNLINK BEFORE WRAP ========
	//
	// REORDERED 2026-08-26 (fix/rtl-unlink-order). The rtl trio used to
	// lead this list and the unlink family followed it, which is the
	// SAME defect batch 1 shipped inside the trio, one level up. An
	// unlink rule drops an anchor and re-exposes the Hebrew that anchor
	// covered: while the anchor stood that text was already inside a
	// link, so `bare-rtl-hebrew` correctly declined it, and with the
	// unlinks running afterwards nothing ever wrapped it. `commutation.
	// ts` is what found it — over all 32,512 entries, in ENTRIES whose
	// final bytes differ between the two orders:
	//
	//   bare-rtl-hebrew × geresh-letter-numeral-mislink            441
	//   bare-rtl-hebrew × prefixed-geresh-abbrev-mislink           170
	//   bare-rtl-hebrew × ellipsis-fragment-anchored                80
	//   bare-rtl-hebrew × plural-to-feminine-final-letter-mislink   50
	//
	// Unlink-first is the higher-yield order in all four, and the
	// difference is rtl wrappers ADDED rather than text moved. All four
	// pairs are now declared `entangledWith` in `patterns.jsonl`, which
	// is what puts them under `checkAdjacency()` — see the component
	// note below.
	//
	// The doctrine was already stated twice in this file and simply
	// never applied here: "UNWRAP BEFORE WRAP" for the trio, and
	// `ibAnaphora`'s requirement to run after every unlink rule. It is
	// one doctrine — a rule that DELETES markup runs before a rule that
	// reads the text that markup was hiding.

	// `apparatusCite` and `rabbiName` (batch 2, tasks 2-3): unlink rows
	// whose anchor is wrong and whose correct target does not exist, so
	// the anchor is dropped. They are NOT members of the entangled
	// component below — measured 0 entries differing against
	// `bareRtlHebrew` in either order, because the display they re-expose
	// is a Latin apparatus citation or a rabbinic name, never Hebrew —
	// so `checkAdjacency()` requires them OUTSIDE its span, and they
	// lead.
	//
	// Leading is not merely permitted, it is the doctrine above applied
	// fail-closed: these two unlink, so they belong on the unlink side
	// of the wrap rules whether or not today's corpus can tell. Their
	// old placement (immediately after the trio) was the arrangement
	// that hid the defect in their four siblings.
	//
	// They must also stay BEFORE any compose rule (Tasks 7-8): a compose
	// rule reads the anchor sequence to build a new target, and must
	// never adopt work from an anchor these rules go on to delete — so
	// unlinking has to run first, not merely somewhere earlier in the
	// list. Pinned by `registry.order.test.ts`'s unlink-before-retarget
	// assertion, which reads the whole `UNLINK` set.
	apparatusCite,
	rabbiName,

	// ---- Batch 4's two UNLINK rows, and why they are not next to the
	// rest of their batch ----
	//
	// `nonsense-dup-anchor` (755 occ / 755 ent, `language_reference`)
	// and `nested-anchor-swallows-punctuation` (475 occ / 465 ent,
	// `definition`) drop the OUTER layer of a doubled anchor whose two
	// layers share a target. Both declare `unlinks`, so
	// `registry.order.test.ts` earns them into `UNLINK` from the corpus
	// rather than from this comment, and rules 1 and 4 then place them:
	// before every retarget rule, and before every rtl wrap rule. The
	// batch's other four rules carry no such requirement and sit
	// together further down, after the wrap component — batch 4 is
	// SPLIT across two blocks for that reason and no other. The batch's
	// PHASE ruling — why all six are `text-repairs` and why
	// `structural-repairs` is the wrong side rather than merely an
	// empty one — is stated once, at the head of that second block.
	//
	// They lead the component below rather than joining it: neither row
	// carries an `entangledWith` edge to any member of it, and putting
	// them inside would break the gap-free span `checkAdjacency()`
	// requires of those seven.
	//
	// Order between the two is MEASURED and free, and so is their order
	// against every rule already here. The two populations are DISJOINT
	// — 0 entries in both, asserted corpus-wide in
	// `rules/nested-anchor.test.ts`'s corpus tier, where 755 + 465 = 1,220
	// reproduces the pre-re-scope catalogued figure — and they are
	// separated by locus besides, one walking `language_reference` and
	// the other `definition`. The whole-registry check is what the
	// placement actually rests on: moving each rule to the front and to
	// the back of `RULES` and comparing all 32,512 entries byte for
	// byte reads 0 / 0 for both (batch-4 report §2).
	//
	// The one interaction worth naming, since it is the reason they sit
	// AFTER the three unlink rows above rather than before them: an
	// unlink rule that deletes an anchor can change which anchor is
	// "the outer layer" of a pair. It does not happen here — the
	// populations are disjoint and the 0 / 0 measurement says so from
	// the other side — but the doctrine at the top of this list wants
	// the deletions to have happened before a rule reads the anchor
	// sequence they leave behind, and that is a property to keep after
	// a re-fetch rather than a fact about today's corpus.
	dupAnchorLanguageRef,
	nestedAnchorDuplicate,

	// ---- The unlink/wrap component: SEVEN rules, gap-free ----
	//
	// One connected component of the catalogue's entanglement graph as
	// of 2026-08-26: the rtl 3-clique, the geresh pair, and the four
	// `bare-rtl-hebrew` edges declared by this branch. `checkAdjacency()`
	// requires all seven to occupy a gap-free span, which is why
	// `apparatusCite`/`rabbiName` had to move out of the middle of it.
	//
	// Within the span: every UNLINK first, then the wrap trio.

	// ellipsis-fragment-anchored (batch 2, task 3).
	ellipsisFragment,

	// The geresh pair (batch 2, task 5). Two more unlink rows, by the
	// maintainer ruling of 2026-08-23 — briefed as retargets, but the
	// address they would have copied is absent from 84% of their own
	// entries (see rules/geresh.ts). Both rows carry the other in
	// `entangledWith` — they share 8 entries and 7 definitions, each
	// re-serializing a definition the other also rewrites — so
	// `checkAdjacency()` requires this gap-free span.
	//
	// Order between them is MEASURED and free: over the whole corpus
	// both orders produce 655 records across 640 entries with 0 entries
	// differing by a byte. No member of either population nests inside
	// an anchor of the other, and `unlinkMatching` re-derives from the
	// current text on every pass, so neither can hand the other a stale
	// index. `gereshLetterNumeral` leads only because it is the audited
	// row of the two.
	gereshLetterNumeral,
	prefixedGereshAbbrev,

	// plural-to-feminine-final-letter-mislink (batch 2, task 6). A
	// third unlink row, by the same measurement `geresh.ts` used:
	// under TARGET-ENTRY IDENTITY, 17 of 60 clean occurrences (28.3%)
	// have some other anchor reaching their own headword and 43 of 60
	// (71.7%) do not, so a retarget rule would decline close to three
	// members out of every four.
	//
	// CORRECTED 2026-08-24 (task 11). This block said "10 of 60
	// (16.7%) … decline five members in six", which is the SUFFIX
	// test — the reading `misc-links.ts`'s own module doc calls
	// unsound in BOTH directions and its 83.3% "spurious", because a
	// prefix scan counts the DEFECT ITSELF as evidence a repair
	// exists. Every other record on the branch already carried 17/60;
	// this one did not, and it is the load-bearing ordering rationale.
	// The conclusion is unchanged — a majority under either reading —
	// but the number quoted here must be the sound one.
	//
	// CORRECTED 2026-08-26 (fix/rtl-unlink-order). This block said
	// "Unentangled with any other registered rule — its population sits
	// entirely inside the entry's own 'Pl.' construct, which no other
	// rule here rewrites." That is FALSE and it is exactly the claim
	// `commutation.ts` exists to falsify: unlinking inside the "Pl."
	// construct re-exposes the Hebrew the anchor was covering, and
	// `bareRtlHebrew` then wraps it — 50 entries differ between the two
	// orders. The row is entangled with `bare-rtl-hebrew` and now says
	// so in the catalogue.
	pluralToFeminineFinalLetter,

	// The rtl wrapper family — a 3-clique in the catalogue's
	// entanglement graph (Task 4), and now four edges wider.
	//
	// UNWRAP BEFORE WRAP, and the order is measured, not aesthetic.
	// Dropping a redundant outer span re-exposes the Hebrew it covered:
	// that text was `rtl: true` while the wrapper stood, so
	// `bare-rtl-hebrew` correctly skipped it, and running the unwrapper
	// afterwards left 62 entries newly bare with nothing left to wrap
	// them — the audit's "trade one for another" happening in the
	// registry rather than in a predicate. Unwrapping first leaves 0.
	// (`commutation.ts` re-derives that 62 as the trio's one DECLARED
	// non-commuting pair, and it is the only one of the eight the
	// catalogue already knew about.)
	redundantOuterRtl,
	bareRtlHebrew,
	latinTokenInsideRtl,

	// ======== Batch 4: the anchor-boundary rules ========
	//
	// ---- THE PHASE RULING, for all six of batch 4's rules ----
	//
	// Two reviewers asked whether the batch's structural removals — the
	// two rules that DELETE an anchor layer — belong in
	// `structural-repairs` rather than `text-repairs`. RULED
	// 2026-08-26: all six stay `text-repairs`, matching all 27 rules
	// shipped before them, and the reason is not conservatism.
	//
	// `structural-repairs` is the WRONG SIDE, not merely an empty one.
	// The committed phase manifest (`patch/apply.ts:56-57`) runs it
	// AFTER `text-repairs` in full, so an unlink rule moved there would
	// run after every wrap rule and every retarget rule in this list —
	// the exact inversion `fix/rtl-unlink-order` was written to undo,
	// and one that rules 1 and 4 in `registry.order.test.ts` exist to
	// forbid. The phase is also unwired: `migrate-dry.ts:294` runs it
	// as a no-op and `migrate-dry.ts:144` throws the moment any rule
	// declares it ("wire it — batch 6"), so a rule placed there today
	// halts the migration instead of running late.
	//
	// And the name does not describe these rules anyway. What
	// `structural-repairs` is reserved for is a pass that changes an
	// entry's SHAPE — splitting a sense, moving a field — which is why
	// `markup.ts:168` reasons about a field COUNT changing under it.
	// Dropping a redundant anchor layer changes markup inside one
	// field and leaves the sense tree exactly as it was. That is a text
	// repair by the manifest's own division.
	//
	// FOUR rules that move one of an anchor's own tags across the text
	// beside it. None removes an anchor, none writes a target, and none
	// changes a single byte of tag-stripped text: each is a pure
	// relocation of an anchor tag, which is why `registry.order.test.ts`
	// earns all four into `NEITHER` and why rules 1 and 4 say nothing
	// about where they sit.
	//
	// CORRECTED 2026-08-26 (impl/phase-2-batch-4). This said the four
	// "move an anchor's own CLOSING tag" and that "each is a pure
	// relocation of `</a>`". THREE of the four are: `toseftaCloseParen`,
	// `superscriptInsideAnchor` and `truncatedCitationDigit`.
	// `openParenInAnchorDisplay` is the exception and the whole point of
	// it — it carries the `(` out past the OPENING tag, which is the
	// opposite polarity in the opposite tag. The class claim (no
	// removal, no target, no text) holds for all four; the tag named did
	// not.
	//
	// Plenty else does. They sit HERE — after the unlink/wrap component
	// and before every retarget rule — for the two reasons this file
	// already states in both directions:
	//
	// - A rule that REPAIRS an anchor runs before a rule that READS
	//   one. That is `ibAnaphora`'s own retarget-after-retarget note
	//   turned around: a retarget adopts a neighbouring anchor's target
	//   and, under gate case 3, its DISPLAY. TWO of the four rewrite a
	//   display outright — `toseftaCloseParen` (`XVII), 6` becomes
	//   `XVII`) and `openParenInAnchorDisplay` (`(ס` becomes `ס`, by
	//   moving the OPENING tag rather than the closing one) — and the
	//   other two move `</a>` past text a display test would read.
	//   (CORRECTED 2026-08-26, impl/phase-2-batch-4: this read
	//   "`toseftaCloseParen` rewrites a display … and the other three
	//   move a closing tag". The open-paren rule does both halves
	//   differently from the description it was given.)
	//   The three `ib-` populations are disjoint from all four of these
	//   today — measured, see below — so this is a fail-closed default
	//   against a re-fetch rather than a live dependency.
	// - They must see the anchor sequence the UNLINK rules leave
	//   behind. `toseftaSplits` defines a variant's primary as the
	//   anchor immediately preceding it in document order, so a deleted
	//   anchor can move a primary — or leave a variant orphaned, which
	//   the walk then drops. What is measured is that none of that
	//   happens: composed over this registry `toseftaCloseParen` fires
	//   on the same 525 occurrences / 493 entries it fires on alone, so
	//   no pair is lost to an earlier deletion. The ordering is what
	//   keeps that true rather than lucky.
	//
	// EVERY placement claim below is measured the way batch 3b's block
	// measures its own: the rule is moved to the FRONT and to the BACK
	// of `RULES`, the whole registry is composed over all 32,512
	// entries, and the figure quoted is the number of ENTRIES whose
	// final bytes differ from the shipped order. `front / back`.
	//
	// ALL FOUR READ 0 / 0, and so do the batch's two unlink rows above:
	// every batch-4 placement is FREE on today's corpus at
	// whole-registry granularity, and the arguments above are what make
	// them right rather than merely permitted. The commutation gate
	// agrees from the pairwise side — 33 rules, 528 pairs, 8
	// non-commuting, 0 undeclared — but a green pair gate is NOT
	// coverage, since it can say nothing about a state some third rule
	// produces. The 0 / 0 figures are the whole-registry answer; the
	// gate is the cheap continuous one.

	// ---- THE SLOT, NOW FILLED: `toseftaPrimaryHalakha` ----
	//
	// `tosefta-variant-chapter-halakha-loss` (414 occ / 391 ent,
	// measured and pinned in `paren-boundary.test.ts`) is registered on
	// THIS line — STRICTLY BEFORE `toseftaCloseParen`, not merely
	// adjacent to it. The direction is the whole requirement and getting
	// it backwards is SILENT. `registry.order.test.ts` pins the
	// DIRECTION rather than the adjacency, because `checkAdjacency` sees
	// the entangled pair and is satisfied by either arrangement.
	//
	// `toseftaCloseParen` destroys `toseftaSplits`'s own predicate: a
	// variant's display reads `XVII), 6` before the boundary move and
	// `XVII` after it, `VARIANT_DISPLAY` is anchored at both ends, and
	// `run.ts` feeds each rule the previous rule's output. A halakha
	// rule registered below this line sees 0 splits and repairs 0
	// primaries — while `bun transform:count`, which measures every
	// rule ALONE against the pinned snapshot, keeps reporting 414
	// MATCH. Green everywhere, nothing done. The full argument is
	// `rules/paren-boundary.ts`'s REGISTRATION ORDER section, and the
	// corpus tier there measures the destruction directly
	// (`survivingSwallows` 525 -> 0, computed from the output).
	//
	// The two rows are declared `entangledWith` each other, so
	// `checkAdjacency()` requires the pair to occupy a gap-free span —
	// which this slot satisfies — and the commutation gate reports them
	// non-commuting, which is expected and declared. Neither gate can
	// say which order is right; this comment is the answer.
	//
	// CORRECTED 2026-08-27 (fix/link-target-gate-cases). This block
	// closed with "Why the row is deferred rather than dropped:
	// `link-target.ts` case 4 refuses the repair", and that was true of
	// the five cases then in force — `rejoinsFrom`'s 2026-08-24
	// tightening requires the part of `tail` the split discards to be a
	// prefix of `head`, and `Tosefta Shabbat 17` is not a prefix of
	// `Tosefta Shabbat 16`. The deferral also named the way out
	// correctly: "the halakha is witnessed twice in the entry's own
	// input, in the variant's `data-ref` and again in its display — so
	// the gap is in the gate, not in the repair." Case 7 is that second
	// witness made into a clause, the rule DECLARES the pair through
	// `corroborated`, and the row leaves `PENDING` below.
	//
	// What the case does NOT do is make the mint safe: measured, it also
	// licenses 29 of the 68 analogous same-work pairs corpus-wide, and
	// only this rule's own `VARIANT_DISPLAY` predicate keeps them out.
	// See `rules/paren-boundary.ts`'s CASE 7 section.
	toseftaPrimaryHalakha,

	toseftaCloseParen,

	// `open-paren-in-anchor-display` (225 occ / 214 ent) — the opposite
	// polarity in the same tag, `<a>(TEXT</a>)`, with the `(` carried
	// out to the left of the opening tag.
	//
	// Adjacent to `toseftaCloseParen` by choice, not by requirement:
	// the catalogue records no edge between the two rows, and the byte-
	// SPAN comparison behind that is the batch's headline check — 0
	// intersections, although 9 entries carry both shapes at different
	// offsets, so a rid-level test would have reported a false
	// collision. `paren-boundary-corpus.test.ts` composes the pair in
	// both orders over the whole corpus and asserts 0 order-dependent
	// entries, 0 induced close-paren sites and 0 induced open-paren
	// sites, so the pair's freedom is a shipped assertion rather than a
	// one-off run.
	openParenInAnchorDisplay,

	// The stranded tails (`superscript-subsection-stranded-outside-
	// anchor`, 182 occ / 160 ent, confined to letters T/U/V; and
	// `citation-number-truncated-outside-anchor`, 14 occ / 14 ent).
	// Both pull a fragment left outside the anchor back inside it by
	// moving `</a>`, and neither touches `href` or `data-ref` — the
	// opening-tag multiset is asserted byte-identical over the whole
	// corpus in `stranded-tail.test.ts` (`tagDrift`).
	//
	// `truncatedCitationDigit` deliberately leaves `data-ref` reading
	// the truncated number: resolving the correct Sefaria address is
	// inference, not relocation. And `superscriptInsideAnchor` performs
	// none of the target ENRICHMENT its own catalogue row's prose
	// advertises for the 77 no-sub-section occurrences — see that row's
	// `reason`, which now says so.
	//
	// COMPOSED, `truncatedCitationDigit` FIRES 12 TIMES, NOT 14, and
	// the two figures are both correct. `bun transform:count` runs
	// every rule alone against the raw snapshot and reports 14 MATCH;
	// composed over this registry the count is 12, because
	// `apparatusCite` — six slots above — DELETES the whole anchor in
	// G00065 and H00504. Both are `Koh. III, p. 3NN` apparatus
	// citations wrongly linked to Ecclesiastes, and an unlink takes the
	// defect away with the link that carried it. Nothing is lost and
	// the orders converge: unlinking keeps the display text, so
	// composing the two rules either way round leaves those entries
	// byte-identical, which is what the 0 / 0 above is reporting.
	//
	// This rule also carries a refusal added at registration, for a
	// case only the PIPELINE can produce: `applyRepairs` runs before
	// every transform, `rejoin-chopped` folds a phantom `2)` into the
	// flow directly behind `<a … data-ref="Genesis 4:2">Gen. IV, 2</a>`
	// in S01040, and the rule read that sense number as a citation tail
	// and rendered `Gen. IV, 22`. A 15th member of a 14-member
	// population, manufactured downstream of the snapshot every
	// measurement here is taken on. See `rules/stranded-tail.ts`,
	// "THE SENSE-MARKER REFUSAL".
	superscriptInsideAnchor,
	truncatedCitationDigit,

	// shuruk-as-yod-display-corruption (batch 2, task 10). Not an
	// unlink and not a retarget — the only rule in the batch that edits
	// DISPLAY text while leaving the target untouched (the link was
	// already correct; only the rendered glyph was OCR-corrupted).
	// Unentangled with any other registered rule: it never writes a
	// `data-ref`/`href`, so it cannot conflict with a retarget or
	// compose rule, and its 12 anchors all resolve to a correct target
	// already, so no unlink rule (which fires on a WRONG target) can
	// claim the same anchor. Placement here, rather than at either end
	// of the list, is free — measured with it run first and last in the
	// registry, both orders produce the identical 12 records byte-for-
	// byte, because no other rule's predicate reads or writes anything
	// inside this rule's matched anchors.
	shurukAsYodDisplayCorruption,

	// ib-yoma-2a (batch 2, task 7) — the batch's first RETARGET, and it
	// runs AFTER EVERY UNLINK RULE for the reason the unlink block
	// above states from the other side. (It said "runs LAST" when it
	// was written and it no longer is: task 8 appended two more
	// retargets below it, as the note at the end of this block asked
	// for. Reworded 2026-08-24, task 11.) This rule copies a target
	// off the nearest preceding
	// citation ANCHOR, so any anchor an unlink rule is going to remove
	// must already be gone before the antecedent search runs. An
	// antecedent that a later rule deletes is a wrong link, and adopting
	// its target would propagate the error into 312 anchors that
	// `transform:count` measures one rule at a time and cannot see.
	//
	// The cost of that ordering is MEASURED, not assumed: composed over
	// the full registry the rule fires on 209 occurrences / 188 entries,
	// exactly what it fires on ALONE. No shipped unlink rule removes an
	// antecedent this rule would have used — their populations are
	// disjoint from its 209 (`anaphora.test.ts` pins the isolated
	// numbers; task-7-report.md has the composed run). Batch 1's RTL
	// trio is why that is checked rather than reasoned about: there the
	// wrong order left 62 entries unfixed with every unit test green.
	//
	// Unentangled: the row carries no `entangledWith` in the catalogue,
	// and no other registered rule reads or writes a `Yoma 2a` anchor.
	//
	// FOR WHOEVER APPENDS THE NEXT RETARGET ROW — Task 8 adds
	// `ib-targum-work-loss` and `sifre-ib-resolves-to-yalkut` directly
	// below, and BOTH retarget. The argument above is about unlink
	// rules, and it does not cover them. The rule for retarget after
	// retarget is the mirror image and just as load-bearing: a retarget
	// rule reading the anchor sequence must run AFTER any rule that
	// REPAIRS an anchor it might adopt, or it will copy a target its
	// neighbour is about to correct. The three `ib-` rows all read the
	// same sequence, so a later one can legitimately adopt an anchor
	// this rule already fixed — that is a repaired address, not a wrong
	// one — but only if it sits below. Appending below is therefore the
	// safe default, and the pair must be MEASURED both ways over the
	// corpus (isolated vs composed, comparing the ADDRESS written and
	// not merely the count) before either order is called free, exactly
	// as `gereshLetterNumeral`/`prefixedGereshAbbrev` did above.
	ibAnaphora,

	// sifre-ib-resolves-to-yalkut (batch 2, task 8) — appended BELOW
	// `ibAnaphora` per the note directly above, which is the rule for a
	// retarget following a retarget. That note requires the pair be
	// MEASURED both ways at ADDRESS level before either order is called
	// free, because `transform:count` measures rules in isolation and
	// cannot see this class of defect. Measured over all 32,512 entries
	// (2026-08-23):
	//
	//   isolated            1 record / 1 entry (E00476)
	//   composed, shipped   1 record / 1 entry, same address, same bytes
	//   ibAnaphora          189 records either way — unchanged by the append
	//   both orders         6,204 records each, and 0 entries whose
	//                       anchor addresses differ between them
	//
	// THE 6,204 IS A REGISTRY-WIDE TOTAL AS OF 2026-08-23 AND HAS
	// MOVED (noted 2026-08-24, task 11). `shurukAsYodDisplayCorruption`
	// was registered afterwards and adds 12, and `targumAnaphora` 8, so
	// the registry produced 6,224 records over all 32,512 entries.
	// CORRECTED 2026-08-26 (batch 4): that read "the registry now
	// produces **6,224 records**", which went stale at batch 3b's
	// twelve rules and again here. Measured on the composed registry as
	// it stands, over all 32,512 entries: **13,696 records**. What the
	// measurement above claims is INVARIANCE between
	// the two orders, and that is unaffected: the absolute is a
	// timestamp, not the finding. Re-derive with the composed pass in
	// `docs/v2/transform-batch-2.md` §3 rather than trusting either
	// number here.
	//
	// So the order is free, and the reason it is free is measured too:
	// the two `ib-` rows share **0 entries** corpus-wide. Their
	// populations are disjoint by target (`ib-yoma-2a` requires
	// `data-ref` exactly `Yoma 2a`; this row requires a `Yalkut …`
	// target under an abutting `Sifré` label), and neither can supply
	// the other's antecedent — this row accepts only a `Sifrei …`
	// anchor, which `ibAnaphora` never writes.
	//
	sifreAnaphora,

	// ib-targum-work-loss (batch 2, task 8) — the THIRD retarget, and
	// gate case 4's first user. It was briefed to run here and it must:
	// appended below both `ib-` rows per the retarget-after-retarget
	// rule stated above, so it reads an anchor sequence those two have
	// already finished correcting rather than one they are about to.
	//
	// The case-4 ruling of 2026-08-23 is what let this row ship at all.
	// Its repair joins the antecedent Targum anchor's WORK to this
	// anchor's own already-correct verse, and cases 1-3 cannot license
	// that: case 3's remainder must appear in the DISPLAY, and Jastrow
	// writes `Deut. VI, 22` where Sefaria writes `6:22`. All 9
	// occurrences failed the gate before the amendment.
	//
	// Measured over all 32,512 entries, at ADDRESS level and in every
	// order, not by count:
	//
	//   isolated                      9 occurrences / 8 entries
	//                                 (8 records — C00446 holds two
	//                                 members in one definition)
	//   composed, shipped order       same 9, same addresses, byte
	//                                 for byte
	//   ibAnaphora / sifreAnaphora    189 / 1 records, both unchanged
	//                                 by the append
	//   all 6 permutations of the
	//     three retarget rules        6,212 records each and identical
	//                                 addresses in every one
	//
	// Same caveat as the block above (noted 2026-08-24, task 11): the
	// 6,212 is the registry-wide total as of 2026-08-23, before
	// `shurukAsYodDisplayCorruption`'s 12 were registered. CORRECTED
	// 2026-08-26 (batch 4): this read "the current total is **6,224**";
	// it is **13,696** measured on today's registry. The claim being
	// made is that all six
	// permutations agree with each other, which does not depend on the
	// absolute.
	//
	// The three populations are pairwise disjoint — 0 entries shared by
	// any pair — so no rule here can consume, create or destroy
	// another's antecedent. That is measured rather than argued, and it
	// is why the order is free; it is NOT a reason to reorder them,
	// since the disjointness is a fact about today's corpus and the
	// ordering rule is what keeps a re-fetch safe.
	targumAnaphora,

	// The gershayim pair (batch 3a). ONE defect, two catalogue rows,
	// split by locus: `gershayimInBody` takes the 2,125 occurrences in
	// document text, `gershayimRefAttribute` the 180 inside tag
	// interiors. Adjacent by requirement — every one of the 90 damaged
	// tags points at a headword carrying the same ASCII quote (90 of
	// 90, 0 unresolved), so repairing either side alone breaks all 90
	// cross-links by string identity.
	//
	// Order between them is MEASURED and free, like the geresh pair's:
	// the substitution never introduces or removes a `<` or a `>`, so
	// neither can move an occurrence into or out of the other's locus,
	// and over the whole corpus both orders produce 0 entries
	// differing by a byte. The pair is also order-free against the rtl
	// trio, which matters because the audit warned that wrapping bare
	// Hebrew would migrate 117 occurrences into scope — it does not,
	// because the predicate reads codepoints and not markup context.
	// Both measurements are `rules/gershayim.test.ts`'s corpus tier,
	// re-run on every `bun qa` rather than recorded here once.
	//
	// Appended at the END of the list when batch 3a shipped it, which
	// the measurements above say is free but do not by themselves say
	// is RIGHT. (CORRECTED 2026-08-26, batch 4: the pair is NOT last
	// any more and has not been since batch 3b appended twelve rules
	// below it. The sentence was a claim about where it went, and it
	// is kept as that with the tense fixed; the freedom it rests on is
	// re-measured every run by the corpus tier named above.) It is the
	// safe default for the same reason the retarget note gives: every
	// rule above reads today's targets, truncation and all, so running
	// last changes nothing any of them sees. Measured too, against the
	// whole shipped registry rather than against the rtl trio alone —
	// composed, the pair produces the same 1,386 and 85 entries it
	// produces alone, so no rule above consumes an occurrence of it,
	// and moving the pair to the FRONT of this list leaves all 32,512
	// entries byte-identical. The claim and its method are spec §4.2
	// (docs/specs/2026-08-24-gershayim-transform-design.md), which is
	// in the repository; the run itself is re-derivable from that
	// section in a few seconds and is deliberately not cited to a
	// working note nobody else can open.
	gershayimInBody,
	gershayimRefAttribute,

	// ======== Batch 3b: italic & punctuation seams ========
	//
	// TWELVE rules, five modules. EVERY ordering claim below was
	// measured against THIS registry, by moving the rule to the front
	// and to the back of `RULES` and comparing all 32,512 entries byte
	// for byte. The result is quoted per rule as `front / back`, and it
	// is the number of ENTRIES whose final bytes differ from the shipped
	// order. Two of the twelve are constrained; ten are free.
	//
	// This is not ceremony. The batch's own brief proposed an order that
	// violated two of the constraints, and a rule's placement being
	// ARGUED rather than measured is how batch 1 shipped the RTL trio
	// backwards with every unit test green. Where the argument and the
	// measurement disagree below, both are stated and the measurement
	// wins.

	// ---- Class B, the space-inserting seam rules, FIRST ----
	//
	// Measured 0 / 0, all five: their placement is FREE on today's
	// corpus, and the reason they lead is an argument rather than a
	// measurement. Stated as such. A missing space at `</a><i>` or
	// `)<i>` changes what "the italic run body" is for the label
	// predicate further down — with the seam closed, `<i>Pi.</i>` reads
	// as a run whose body is a label; with it open, the preceding token
	// has run into the tag. Repairing the seam first makes that
	// predicate read the string a human reads. Today no entry needs it,
	// so this is a fail-closed default against a re-fetch, not a live
	// dependency, and nobody should later "discover" it was free and
	// move them.
	//
	// The five are mutually order-free BY CONSTRUCTION, not by
	// measurement alone: `parenTagSpace` owns both `)<i>` and `)</a><i>`
	// and `anchorItalicSpace` carries a negative lookbehind declining
	// every seam whose anchor display ends in `)`, so the 53 shared
	// occurrences have ONE owner in either order (rules/seam-space.ts,
	// "Two owners, one seam"). Before that lookbehind existed, which row
	// owned those 53 depended on registry position — and the catalogue's
	// own 111 for `anchor-italic-no-space` was double-counting them.
	//
	// THE PROBE THAT MEASURES THIS FREEDOM ALSO FOUND A DEFECT IN TWO OF
	// THEM. Before Task 7, `anchorItalicSpace` and `parenTagSpace` read
	// 0 / 2 and 0 / 1: they were inserting a space in front of a run
	// OPENING with punctuation, rendering `well-covered) ;guarded;`, and
	// `italicLonePunctuation` later unwrapping the run left the stray
	// space loose in the text. 13 entries corpus-wide, 3 of them
	// order-dependent and 10 wrong in every order. Both rules now
	// decline that shape and both read 0 / 0. See
	// rules/seam-space.ts, "The run that opens with punctuation".
	anchorItalicSpace,
	parenTagSpace,
	italicParenSpace,
	translitItalicSpace,
	gereshAbbrevSpace,

	// `italic-swallows-close-paren` (Task 6) — Class A, not Class B as
	// the spec's §3 table had it: the split inserts no space, the tail's
	// own leading space moves out with the paren.
	//
	// Measured 0 / 0 — free. It matches a paren INSIDE a run body with
	// text on both sides; the seam rules above match a paren ADJACENT to
	// a tag from outside, and `emphasisRunEdgeSpace` below matches a
	// space at a run's edge. It creates 0 new `<i>␣`/`␣</i>` edges over
	// its 8 entries, so it hands that row nothing in either order.
	italicSwallowsCloseParen,

	// `italicLonePunctuation` is the residue row: of 259 single-
	// character non-alphanumeric italic runs corpus-wide, 230 are
	// `<i>—</i>` (`emDashSectionBreak`'s, below) and 28 are `[.?;]`
	// (this row's). The 259th is I00129's U+0357 combining mark, which
	// is not punctuation at all.
	//
	// Measured 0 / 0 — FREE, as the predicate says it must be:
	// `LONE_PUNCTUATION`'s class is `[.?;]` and has no way to match an
	// em-dash in any order, against any corpus.
	//
	// MOVED 2026-08-26 (fix/rtl-unlink-order), from between
	// `emDashSectionBreak` and `labelPeriodInside`. It sat there for
	// READABILITY — a reader checking the 230/28 split wants both rows
	// in view — and the block said in as many words that this was "a
	// presentation choice, not a constraint". It has now become one:
	// the four-rule italic component below (`emphasisRunEdgeSpace`,
	// `emDashSectionBreak`, `labelPeriodInside`,
	// `italicGlossPeriodOutside`) is declared entangled as of this
	// branch, and `checkAdjacency()` requires it gap-free — this row was
	// the gap. It moves UP rather than down because that leaves it two
	// slots from `emDashSectionBreak` instead of three — as close as
	// the span allows, and the readability was the only reason to care.
	// Nothing about the placement is measured differently: 0 / 0 still.
	// Spec §8's original claim that the old adjacency prevented a
	// 230-instance double-count is retracted; nothing prevents it except
	// the character class.
	italicLonePunctuation,

	// ---- The italic component: FOUR rules, gap-free ----
	//
	// DECLARED 2026-08-26 (fix/rtl-unlink-order). Three of the batch's
	// measured ordering constraints — the two stated in the blocks
	// below and `emDashSectionBreak` against `labelPeriodInside` — are
	// non-commutation, and `commutation.ts` measures them as such over
	// all 32,512 entries, in ENTRIES whose final bytes differ between
	// the two orders:
	//
	//   em-dash-section-break-in-own-italic × italic-swallowed-…-period  270
	//   emphasis-run-edge-space × italic-swallowed-terminal-period         13
	//   em-dash-section-break-in-own-italic × label-period-outside-italic   4
	//
	// Each was already argued in a block comment here and pinned in
	// `registry.order.test.ts`; none was ever written into
	// `entangledWith`, so `checkAdjacency()` was blind to all three and
	// this file was the only thing holding them. They are edges now, and
	// with the pre-existing period-pair edge the four rules form one
	// component that must occupy a gap-free span.
	//
	// NO ORDER CHANGES HERE. The three constraints were correct as
	// shipped; what was missing was the declaration. The only movement
	// is `italicLonePunctuation` out of the span, above.

	// ---- `emphasisRunEdgeSpace` BEFORE the period rules ----
	//
	// Measured 0 / 13 — CONSTRAINED. It must not run last, and this is
	// the constraint the brief got backwards by putting this rule at the
	// end of the batch.
	//
	// 29 trailing-edge occurrences read `<i>gloss.␣</i>`, where the
	// captured space hides the terminal period from
	// `italicGlossPeriodOutside`'s `INSIDE` pattern, which requires the
	// period to abut `</i>`. Running this rule first uncovers it. At
	// ENTRY granularity the gloss rule newly fires on 11 entries (A00740
	// A01190 A02252 A02901 C00200 C00399 C00772 C00872 C00964 C01379
	// E00196), which is the figure Task 5 and its reviewer measured. The
	// BYTE comparison finds 13, and the extra two (C00805, J00106) are
	// why the byte figure is the one quoted here: in both, the gloss
	// rule already fires at ANOTHER locus in the same entry, so an
	// entry-level count cannot see that this locus was also repaired.
	// `<i>froth, foam. </i> Pl.` closes to `<i>froth, foam</i>. Pl.`
	// here and stays `<i>froth, foam.</i> Pl.` with this rule last.
	//
	// Order against the five seam rules above is FREE and measured both
	// ways: the seam rule inserts a space this rule then absorbs, or
	// this rule moves one the seam rule then declines, and the two
	// orders CONVERGE on the same bytes. Only the per-rule record counts
	// differ, which is a fact about attribution, not about output.
	emphasisRunEdgeSpace,

	// ---- `emDashSectionBreak` BEFORE `italicGlossPeriodOutside` ----
	//
	// Measured 0 / 270 — CONSTRAINED, and the second constraint the
	// brief inverted. `SECTION_BREAK` needs its input's first run to
	// still read `<i>gloss.</i>` — period INSIDE, abutting `</i>` —
	// which is exactly the shape `italicGlossPeriodOutside` hunts and
	// rewrites. With the gloss rule first this rule survives on 0 of its
	// 270 entries. Zero. Measured on the full corpus by Task 4, again by
	// its reviewer, and again here.
	//
	// It does NOT need to precede `labelPeriodInside`, and only the
	// measured half is stated: with that rule first, all 270 survive,
	// because its pattern needs a period already sitting AFTER `</i>`,
	// which this raw seam never presents. Fix round 1 claimed the wider
	// constraint unmeasured and retracted it.
	//
	// THE COST OF THIS ORDER, since it is real and belongs next to the
	// constraint rather than in a report: merging the two runs leaves a
	// body ending `—`, which `INSIDE` cannot match, so this rule TAKES
	// 247 entries out of `italicGlossPeriodOutside`'s reach (1,567 alone
	// → 1,331 composed, the balance being the 11 the edge rule adds).
	// It also takes 4 out of `labelPeriodInside`'s (979 entries → 975;
	// the row fires once per entry, so its record count moves the same
	// 979 → 975): the
	// labelled shape `.</i> <i>—Pl</i>.` merges into `<i>gloss.—Pl</i>.`
	// and `isLabel` correctly declines that body, so the period stays
	// outside. Both are the whole-body granularity ruling (R1) doing
	// what it was ruled to do, not a rule failing.
	//
	// CORRECTED 2026-08-26 (fix/rtl-unlink-order). This block ended
	// "Neither constraint is an `entangledWith` edge, so
	// `checkAdjacency()` cannot see either one … It lives here, in
	// `registry.order.test.ts`'s explicit pin, and in the corpus-tier
	// tests; nowhere else." Both ARE edges now, and so is this rule's
	// pairing with `labelPeriodInside` — see the component block above.
	// `checkAdjacency()` still cannot see WHICH WAY ROUND any of them
	// goes, only that they are adjacent; the direction remains this
	// block, the order test's pin, and `commutation.ts`'s 270.
	emDashSectionBreak,

	// ---- The label pair, gap-free adjacent ----
	//
	// The batch's only recorded entanglement edge when it shipped, and
	// now one of four inside the component above.
	//
	// `labelPeriodInside` measures 0 / 0: on today's corpus the pair's
	// INTERNAL order is FREE, and the brief's claim that it is
	// load-bearing is not what the corpus says. It leads anyway, and the
	// reason is robustness rather than output: it moves every label's
	// period inside, removing those runs from the `<i>….</i>` population
	// `italicGlossPeriodOutside` then reads, so that rule's exclusion
	// clause is an assertion that already holds. Run the other way
	// round, the same clause becomes a filter that must get every label
	// right one at a time — `isLabel` gets all of them right today,
	// which is exactly why the measurement is 0, and is not a property
	// to rely on after a vocabulary change or a re-fetch.
	labelPeriodInside,
	italicGlossPeriodOutside,

	// ---- batch 5, the headword-field family -------------------------
	//
	// The first rules in this registry whose object is a FIELD rather
	// than markup. They touch `headword`, `alt_headwords` and nothing
	// else.
	//
	// **ONE RULE ABOVE DOES REACH THAT INPUT, and an earlier draft of
	// this block asserted otherwise while this branch was measuring the
	// interaction.** `gershayimInBody` is scoped to every field
	// `fieldsOf` walks — its own row records `headword` 69 and
	// `alt_headwords` 19 — and it composes with `phraseAltHeadwordStub`
	// in a way `body/pipeline-links.test.ts` pins: it repairs an ASCII
	// quote in a HEADWORD, the phrase rule then copies that repaired
	// headword into `alt_headwords`, and the corpus gershayim count
	// moves 2,305 → 2,309.
	//
	// The placement is nevertheless free, and that is MEASURED rather
	// than assumed: both orders give 92 marks across these two fields
	// and 235 phrase records, because `gershayimInBody` walks every
	// field and so repairs the copy too if it runs second. The pair
	// converges; it is not isolated. The commutation gate agrees —
	// 0 undeclared.
	//
	// What is NOT free is their order relative to each other.
	//
	// `parenAltHeadword` MUST precede `phraseAltHeadwordStub`, and the
	// pair is `entangledWith` on both rows so `checkAdjacency()` holds
	// them gap-free. They do not commute, by one occurrence in each
	// direction: `B00780` holds `'(עֵין ב׳)'`, whose stub token is
	// `'ב׳)'` — `expandStub` refuses anything following the geresh, so
	// phrase-first cannot see it, while paren-first strips the
	// delimiters and it expands normally. `A02403` moves the other way,
	// its `'אסת׳ )'` becoming a single token that leaves the phrase
	// population altogether. Composed paren-first the phrase rule fires
	// 236 times; phrase-first, 235. Pinned in
	// `rules/headword.corpus.test.ts` in the shape of the disagreement.
	//
	// The batch's spec argued this batch would add no entanglement at
	// all, reasoning about OTHER rules and never checking its own pair.
	// The commutation gate of PR #50 is what caught it.
	parenAltHeadword,
	phraseAltHeadwordStub,
	// The other two share the family's object but interact with nothing:
	// `abbrevFusedHeadword` is the only rule in the registry that
	// rewrites `headword`, and `genderPairAltDuplicate` keys on whole
	// array values that no other rule constructs. Measured, not assumed
	// — the commutation gate composes them against all 37.
	abbrevFusedHeadword,
	genderPairAltDuplicate,

	// ---- batch 6b: the stray-period stem label ----
	//
	// `asteriskStemStrayPeriod` rewrites `grammar.verbal_stem` and
	// touches nothing else. No rule here reads that field — measured,
	// not assumed: the commutation gate composes it against all 40, and
	// its 3 members are values no other rule can construct, since the
	// only other writer of a grammar field in this registry is the
	// structural rule below, which runs in a LATER PHASE.
	//
	// Position is therefore free, and it sits BEFORE
	// `trailingWhitespaceDefinition` only to keep that rule's "runs last
	// among text-repairs" constraint literally true. It could not hand
	// that rule a member in any case: it never touches a `definition`.
	asteriskStemStrayPeriod,

	// ---- `trailingWhitespaceDefinition` LAST ----
	//
	// Measured 0 / 0 — free, and last by argument. It trims the entry's
	// deepest-last sense, so it must see that sense as every earlier
	// rule leaves it. `emphasisRunEdgeSpace` is the one rule that could
	// hand it a new member, by pushing a space past a run that closes a
	// field — measured at 0 occurrences corpus-wide (no `␣</i>` ends its
	// field or is followed only by tags), and `edge-trim.test.ts` pins
	// the count of space-terminated fields as identical before and
	// after. That 0 is why the measurement here is 0; running last is
	// what keeps it the whole answer rather than a claim about one pair.
	trailingWhitespaceDefinition,

	// ---- THE FIRST `structural-repairs` RULE ----
	//
	// `stemHeadMarkerChop` runs in a DIFFERENT PHASE from every rule
	// above it, so its position in this list is not what sequences it:
	// `applyTransforms` filters by phase, and `structural-repairs` runs
	// only after the whole `text-repairs` pass has finished (phase
	// manifest, `patch/apply.ts:56-57`). It is last here so the list
	// reads in execution order.
	//
	// It is also the only rule in this registry that the loss gate
	// judges (`no-lost-text.ts`), because gating is phase-scoped — the
	// 10 `text-repairs` rules that delete text are pinned by count in
	// `body/deletion-baseline.corpus.test.ts` instead. Batch-6b spec
	// §2.3 carries that argument.
	stemHeadMarkerChop,
	// The second `structural-repairs` rule, and the first to CREATE a
	// grammar block. It runs after `stemHeadMarkerChop` only because
	// that one shipped first: the two cannot meet. `stemHeadMarkerChop`
	// reads a numbered sense whose sibling has no number, and this one
	// reads `content.senses[0]` with no `grammar` — and `senses[0]`
	// carrying `number: '1)'` with an unnumbered sibling is a shape
	// neither predicate admits, since this rule's own `HEAD` requires
	// the definition to OPEN with an italic label run and a chopped
	// marker sits at the END. The commutation gate carries the pair.
	strandedStemHead,
];

/** Catalogued transform rows with no rule yet. Shrinks batch by batch;
 * empty at the end of Phase 2. */
const PENDING: readonly string[] = [
	// `nonsense-dup-anchor` and `nested-anchor-swallows-punctuation`
	// left this list in batch 4 Task 7: both are registered above.
	'unlinked-v-span',
	// `homograph-numeral-mismatch` left this list in batch 2 Task 9:
	// audited to `judgment` in `patterns.jsonl`. Its 576 occurrences /
	// 538 entries are three merged defects, the display (Jastrow's print
	// numeral) is the authoritative side — so batch 3 does not own it
	// either — and no rule can name the destination: 40.1% of the
	// population already points where print says, the only family model
	// available scores 87.5% on 3,253 known-correct controls, and gate
	// case 2 reaches the replacement for 3.5% of the candidate defects.
	'targum-sheni-never-linked',
	// `h-cognate-self-link` left this list in batch 2 Task 4: audited to
	// `judgment` in `patterns.jsonl` (no other article exists for any of
	// its 87 anchors, and the construct is 3.2% of a corpus-wide linker
	// behaviour), so `coverage` no longer counts it and neither list may.
	'trailing-em-dash-tail',
	// `stranded-stem-head` left this list in batch 6c: it is registered
	// above at its RE-MEASURED size. The row was catalogued at 544
	// entries with NO predicate recorded anywhere; under the predicate
	// `rules/stem-section.ts` now states it is 561 occurrences / 555
	// entries, measured where a structural rule stands. The rule takes
	// **436** of them — `content.senses[0]`, no `grammar`, a
	// single-label italic run, a space and then something.
	//
	// The other 125 are refused by the predicate. 100 of them are the
	// new `judgment` row `stem-head-in-child-sense`: they sit in a
	// CHILD sense, and `buildTrace` (`dry-run.ts:252`) tests `.grammar`
	// on `content.senses` only — 0 entries in the corpus carry a
	// grammar object below top level, so a rule writing one there
	// would mint a shape nothing reads. The remaining 25 are not the
	// defect at all (14 `Label of X` glosses, 7 etymology-paren
	// remnants, 2 `= Label` cross-references) or need a shape this
	// rule does not take (2). Splitting rather than registering the
	// whole row is the batch-6b step that keeps them ON the queue.
	// `empty-stem-section` (347 sections / 342 entries) left this list on
	// 2026-08-28 (batch 6b): audited to `judgment` in `patterns.jsonl`
	// on Brian's ruling, so `coverage` no longer counts it and neither
	// list may hold it. THE RULING TURNED ON DATA vs DISPLAY. Nothing is
	// missing — `dry-run.ts:193 buildStem` keeps the label and the form,
	// the schema permits `senses: []`, and the shape mirrors the print
	// heading it came from. The only debris the row carried was the
	// trailing empty `binyan_form` slot, and `repairs.ts`'s
	// `cleanBinyanForms` drops that before any rule here runs. What is
	// left is a Phase 4 rendering item — show consecutive senseless stem
	// blocks as one run — needing no data change, so leaving the row on
	// this list asserted a rule was owed before cutover when none is.
	// Audit: data/patches/catalogue-audit/empty-stem-section.md.
	'sense-number-outside-closed-grammar',
	'bracketed-gloss-lead-sense',
	// `parenthesized-alt-headword` and `phrase-alt-headword-stub` left
	// this list in batch 5: both are registered above, adjacent and
	// entangled.
	'b-h-split-across-field-boundary',
	'mekhilta-sifra-never-linked',
	'reversed-hebrew-phrase',
	'empty-lead-sense',
	// `abbrev-headword-stub` left this list in batch 5 Task 1: AUDITED
	// TO `judgment` in `patterns.jsonl` (audit
	// `data/patches/catalogue-audit/abbrev-headword-stub.md`, ruled by
	// Brian 2026-08-28), so `coverage` no longer counts it and neither
	// list may. At most 4 of its 34 entries hold anything that could
	// supply the elided tail, against the 65.5% that already withdrew
	// its parent row, and the shortfall is structural: the stub IS the
	// headword, so no fuller spelling of the lexeme exists in the entry
	// by construction.
	// `unterminated-href-swallows-closing-tag` left this list on
	// 2026-08-27 (fix/link-target-gate-cases): `unterminatedHref` is
	// registered FIRST in `RULES` above, now that link-target case 6
	// licenses D00478's repair. See the block at the head of `RULES`.
	// `stem-head-marker-chop` left this list in batch 6b: it is
	// registered above, and is the first rule the `structural-repairs`
	// phase has ever run. It repairs **18** — the members whose marker
	// has an EMPTY residue — of the **28** the row's round-3 flag
	// measured on RAW source. The other 10 are refused by the
	// predicate, 3 of them because they hold the real opening of sense
	// 2 and a delete-the-marker rule would destroy it; they are now
	// their own row, `chopped-marker-with-residue`.
	//
	// The corpus census counts **9**, not 10, of those refusals, and the
	// difference is not a disagreement: it measures the entry as this
	// phase receives it — after `applyRepairs` and the whole
	// `text-repairs` pass — where one member no longer presents the
	// shape at all. 18 + 9 = 27 there against 18 + 10 = 28 raw. The row
	// keeps the raw figure, because that is what it was catalogued from;
	// `rules/stem-corpus.test.ts` asserts the composed one.
	'vkh-geresh-loss',
	// `tosefta-variant-chapter-halakha-loss` left this list on
	// 2026-08-27 (fix/link-target-gate-cases): `toseftaPrimaryHalakha`
	// is registered above, STRICTLY BEFORE `toseftaCloseParen`, now that
	// link-target case 7 licenses the halakha the variant both addresses
	// and prints. See THE SLOT block in `RULES`.
	// `asterisk-stem-label` left this list in batch 6b: it is registered
	// above at its RE-SCOPED size of 3 (the stray-period sub-shape).
	// The other 66 became `stem-label-not-a-binyan-name`, a new
	// `judgment` row — the batch-4 precedent, where
	// `superscript-subsection-contradicts-link-sub-section` was split
	// off as `judgment` from birth. Splitting rather than registering
	// the whole row is what keeps 66 live defects ON the queue: a row
	// reads `registered` the moment any rule claims its id, so a
	// 3-of-69 rule would have retired the other 66 into silence.
	'homograph-roman-stranded-in-definition',
	'holam-migrated-off-mater-vav',
	'impossible-dagesh',
	// `binyan-form-leading-space` (523 occ / 457 ent) and
	// `binyan-form-empty-slot` (486 slots / 446 ent) left this list in
	// batch 6a: both are `status: discarded` in `patterns.jsonl` (Brian's
	// ruling 2026-08-28), so `coverage()` no longer counts them and
	// neither list may hold them. NOT withdrawn for want of a mechanism —
	// `repairs.ts:445 cleanBinyanForms` already performs exactly the
	// repair each row asks for, corpus-wide, inside `applyRepairs` and so
	// UPSTREAM of every rule here. Measured: 523 → 0 and 486 → 0 across
	// all 32,512 entries. A rule registered for either would have matched
	// nothing while its row claimed hundreds — the batch-3a two-owners
	// failure, caught this time before the rule existed rather than at
	// the last task. The premise is pinned corpus-wide by
	// `body/binyan-cleanup.corpus.test.ts`; the audit is
	// `data/patches/catalogue-audit/binyan-form-cleanup.md`.
	'plural-label-rendering-defeats-capture',
	'continuation-marker-em-dash-loss',
	'tanhuma-never-linked',
	'pesikta-drk-never-linked',
	'duplicated-definition-opening-run',
	'shin-sin-dot-drop',
	'v-sub-redirect-stub-mislink',
	'midrash-petichta-unanchored',
	'adjacent-verbatim-repetition',
	'containment-fallback-mislink',
	// `post-anchor-numeral-duplication` left this list in batch 4 Task 6:
	// audited to `judgment` in `patterns.jsonl` (Brian's ruling
	// 2026-08-26), so `coverage` no longer counts its 11 occurrences / 11
	// entries and neither list may hold it. The audit —
	// data/patches/catalogue-audit/post-anchor-numeral-duplication.md —
	// SETTLES THE DIRECTION and leaves only the mechanism open: deleting
	// the bare trailing copy yields a shape attested 681 occurrences
	// corpus-wide against 1 for the alternative, and in 2 of the 11 the
	// `data-ref` carries `²` where the display carries `I`, so the display
	// numeral is print text rather than a copy of the ref. What blocks a
	// rule is that neither candidate mechanism survives — all 11
	// duplicates are `I` at p = 5.9e-5 — and a transform must know why it
	// is deleting. The same task's other ruling ADDED a row —
	// `superscript-subsection-contradicts-link-sub-section`, 38
	// occurrences / 33 entries split off
	// `superscript-subsection-stranded-outside-anchor` — but it is
	// `judgment` from birth, so it enters neither this list nor
	// `coverage`'s total, and does not offset the withdrawal: 73 -> 72.
	'section-break-terminator-loss',
	'see-particle-lost',
	// FOUR MORE left this list in batch 3b Task 6, each audited to
	// `judgment` in `patterns.jsonl` for its own reason — the working is
	// in data/patches/catalogue-audit/batch-3b-withdrawals.md:
	// `orphan-gloss-seam-period` (19) and `citation-quote-seam-period`
	// (43), whose separators do not reproduce against any pinned
	// predicate; `gloss-head-seam-period-doubling` (15) and
	// `entry-final-comma` (10), where no repair names a destination.
	// A withdrawn row must appear in NEITHER list — `coverage()` filters
	// to `route === 'transform'`, so leaving one here fails nothing
	// today, but a `PENDING` entry is a standing claim that a row is
	// still owed a rule, and for these four it is not.
	//
	// SIX MORE left this list in batch 4 Task 7 by being REGISTERED —
	// `nonsense-dup-anchor`, `nested-anchor-swallows-punctuation`,
	// `anchor-swallows-close-paren`, `open-paren-in-anchor-display`,
	// `superscript-subsection-stranded-outside-anchor` and
	// `citation-number-truncated-outside-anchor` — and a SEVENTH,
	// `jt-double-wrapped-citation`, left it without a rule of its own.
	// See `COVERED` directly below: it is repaired in full by another
	// row's rule, which is neither "registered" nor "still owed a rule"
	// and had no way to be said here.
	//
	// TWO of batch 4's ten rows were left here BLOCKED on a shared-gate
	// ruling rather than on a missing predicate. Neither was idle: a
	// rule existed for one and a population was pinned for the other, so
	// what a `PENDING` entry claimed for those two is that the row is
	// owed a REGISTERED rule, which it was.
	//
	// - `unterminated-href-swallows-closing-tag` (2 occurrences, D00478
	//   and J00597) HAS a written, tested rule on this branch —
	//   `rules/malformed-href.ts`, 19 tests — and it is deliberately not
	//   imported above. `checkLinkTargets` refuses D00478: the repair's
	//   evidence lives in RAW TAG BYTES that do not parse, so the target
	//   it restores is absent from the input's parsed target set and no
	//   case licenses it. `run.ts` throws on a gate problem, so
	//   registering it would HALT the migration on the first pass over
	//   that entry rather than repair anything.
	// - `tosefta-variant-chapter-halakha-loss` (414 occ / 391 ent) is
	//   refused by case 4's 2026-08-24 tightening. Its slot in `RULES`
	//   is marked, and the direction is load-bearing.
	//
	// Both fold into one follow-up gate PR (Brian, 2026-08-26), on the
	// shape PR #50 took: a ruling on a SHARED gate is not an
	// implementation choice inside one rule module.
	//
	// CORRECTED 2026-08-27 (fix/link-target-gate-cases). That PR is this
	// branch, and BOTH of the two bullets above are now HISTORY. They
	// are quoted rather than deleted because they record what each
	// deferral claimed, and both claims were exactly right:
	//
	// - The first said `unterminated-href-swallows-closing-tag`'s target
	//   was absent from the input's PARSED target set. It was, which is
	//   why case 6 reads raw FIELD bytes instead. `unterminatedHref` is
	//   registered at the head of `RULES`.
	// - The second said `tosefta-variant-chapter-halakha-loss` was
	//   refused by case 4's tightening, and that the evidence was
	//   stronger than case 4 asks for. Both true: case 7 is that surplus
	//   evidence — the halakha printed in the variant's display as well
	//   as addressed in its `data-ref` — turned into a clause.
	//   `toseftaPrimaryHalakha` fills its marked slot, and the slot is
	//   no longer empty.
	//
	// What the second bullet did NOT anticipate is how much else case 7
	// licenses. Its corroboration clause was ruled in on a measurement
	// of 0 of 69 analogous same-work pairs that turned out to be an
	// arithmetic error; re-measured it is 29 of 68, and Brian re-ruled
	// on 2026-08-27 to ship anyway. Live exposure is zero because a
	// gate case is a LICENCE and not an instruction — nothing mints
	// unless a rule declares it, and no other rule declares case 7.
];

/**
 * Catalogued transform rows with NO rule of their own and no rule
 * owed: every one of their records is repaired by a rule registered
 * for ANOTHER row.
 *
 * The third state, and the registry had no way to say it until batch 4
 * shipped `nestedAnchorDuplicate`. `PENDING` is a standing claim that a
 * row is still owed a rule; `RULES` says a rule carries the row's own
 * id. `jt-double-wrapped-citation` is neither — it is exactly the
 * empty-trapped-text arm of `nested-anchor-swallows-punctuation`, its
 * 10 entries are inside that rule's 465, and no rule will ever carry
 * its id. Left in `PENDING` it was a false claim NO GATE COULD SEE,
 * because a row sitting in `PENDING` is precisely what `coverage()`
 * expects to find; removed from `PENDING` and named nowhere it becomes
 * `unaccounted`, which is the same silence from the other side.
 *
 * What this list buys is falsifiability, through `coverage()` below:
 * a row here counts as owned only while the rule named by `by` is
 * actually registered, so unregistering `nestedAnchorDuplicate` drops
 * `jt-double-wrapped-citation` straight into `unaccounted` and fails
 * `registry.test.ts`. And a row named here AND in `PENDING` is
 * reported as `duplicated`, so the two claims cannot both stand.
 *
 * What it does NOT establish is that the repair is real — no more than
 * a `PENDING` entry establishes that a row still needs one. The
 * evidence for this row is measured and lives elsewhere:
 * `rules/nested-anchor.test.ts` asserts the 20 empty-trapped-text
 * records resolve to exactly the 10 rids the catalogue names, as a
 * sorted list.
 */
const COVERED: readonly { by: string; row: string }[] = [
	{
		by: 'nested-anchor-swallows-punctuation',
		row: 'jt-double-wrapped-citation',
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
	total: number;
	/** Transform rows that are neither registered nor pending. A
	 * `COVERED` row whose owning rule is NOT registered lands here,
	 * which is what stops that list from being a self-granted
	 * exemption. */
	unaccounted: string[];
}

/**
 * Partition the catalogue's transform rows across `RULES`, `COVERED`
 * and `PENDING`.
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
	return {
		covered: rows
			.filter((row) => registered.has(row.id) && !rules.has(row.id))
			.map((row) => row.id),
		duplicated: rows
			.filter((row) => registered.has(row.id) && pending.has(row.id))
			.map((row) => row.id),
		pending: rows.filter((row) => pending.has(row.id)).length,
		registered: rows.filter((row) => registered.has(row.id)).length,
		total: rows.length,
		unaccounted: rows
			.filter((row) => !(registered.has(row.id) || pending.has(row.id)))
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
 * problem, and today every edge is reciprocated — 34 recorded entries,
 * 17 undirected edges, 0 one-sided, 0 dangling (2026-08-26, batch 4;
 * this read 32 / 16 the same day, before batch 4's own catalogue
 * write-back added the mutual JT/nested edge, and 18 / 9 before
 * `fix/rtl-unlink-order` declared seven more; see
 * `registry.order.test.ts` for a stale SPLIT of those totals corrected
 * at the same time) — so nothing in the
 * corpus reaches this. That is exactly why it is worth building
 * correctly rather than leaving: this is the code Task 3 added to make
 * the adjacency gate FALSIFIABLE, and a gate whose correctness rests
 * on a property of its own input is the failure mode it exists to
 * catch. Pinned by `registry.test.ts`, walked from the side holding no
 * edge.
 *
 * Edges to ids the catalogue does not hold are kept: they contribute
 * no registry position, so they widen no span, but they are what
 * `Cluster.stale` reports — a dangling endpoint used to shrink a
 * component below two registered members and take the whole component
 * out of the gate's view with it. `checkEntanglement` names them from
 * the catalogue's side; `checkAdjacency` now names them from this one.
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
 * returns clean whatever the registry does with that rule. 35 of the
 * 38 rows still in `PENDING` carry no edge at all (measured
 * 2026-08-26 after batch 4 registered six rows and recorded a seventh
 * in `COVERED`; this read "42 of the 46" earlier the same day and
 * "56 of the 62" one commit
 * earlier, at batch 3b, which took 16 rows off `PENDING` — 12 rules
 * shipped and 4 rows withdrawn — rather than on this branch, which
 * changed no `PENDING` row's edges. The ratio moved; the claim the
 * sentence makes did not), so for most of the work ahead this gate is
 * unfalsifiable BY CONSTRUCTION — not because the check is weak, but
 * because its input is incomplete.
 *
 * That is a catalogue-completeness problem and it is not fixable
 * here. What a rule author gets from a clean run is therefore: no
 * RECORDED entanglement is split. Not: no entanglement is split. The
 * cheapest guard remains the one batch 1 learned the hard way — run
 * the corpus under both orders and compare bytes — which needs no
 * edge in the catalogue to work.
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
 * THE INVARIANT, stated once rather than as a third spot-fix: a
 * recorded entanglement touching the registry must produce a validated
 * cluster or a reported problem, never silence. Three separate ways of
 * breaking it have now been found on this branch, and each one closed
 * a hole while leaving the shape intact:
 *
 * 1. The graph was built DIRECTED, so a one-sided edge put its two
 *    endpoints in different components and neither reached two
 *    registered members (`undirectedGraph`, pre-PR wave).
 * 2. A component with fewer than two registered members is dropped,
 *    which is correct for ORDER and left the rtl 3-clique pinned by
 *    nothing (Task 3; the derived-set assertion in
 *    `registry.order.test.ts` is what closed it).
 * 3. A DANGLING endpoint — an id no catalogue row holds — shrinks a
 *    component below two registered members and dropped it silently
 *    (CodeRabbit round 2; `Cluster.stale` above).
 *
 * This function is the conservation law behind all three: walk the
 * edges the catalogue actually records and require each one that
 * touches a registered rule to land inside a derived cluster. It would
 * have failed on 1 and on 3, and it fails on a FOURTH way of losing an
 * edge that nobody has thought of yet — which is the point, given that
 * three have turned up already.
 *
 * What it does NOT replace is the derived-set assertion. An edge
 * DELETED from the catalogue is not a recorded edge, so this walks
 * past it; only pinning the cluster set notices. Two complementary
 * claims, not one — see `registry.order.test.ts`.
 *
 * Edges between two unregistered rows are excluded rather than
 * missing: execution order cannot be wrong about a rule that does not
 * run. 2 of the catalogue's 17 undirected edges are of that kind
 * today (2026-08-26, batch 4; this read "3 of the catalogue's 16" —
 * the 16 became 17 with the JT/nested edge, and the third
 * neither-registered edge became a ONE-registered edge when
 * `nestedAnchorDuplicate` shipped, which is why it now reports rather
 * than being excluded).
 *
 * CORRECTED 2026-08-26 (fix/rtl-unlink-order). This read "4 of the
 * catalogue's 9". The 9 became 16 when this branch declared seven more
 * edges, but the 4 was wrong before the branch touched it — recomputed
 * on v2 the split is 6 both-registered and 3 neither, never 5 and 4 —
 * and every edge declared here joins two REGISTERED rules, which
 * cannot move the neither-registered count at all. Same stale split as
 * `registry.order.test.ts`'s `unaccountedEdges` block, corrected in
 * the same pass and by the same measurement.
 *
 * Self-edges are excluded too — `checkEntanglement` owns those, and a
 * component cannot be split from itself.
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

export type { Cluster, Coverage };
export {
	COVERED,
	checkAdjacency,
	coverage,
	entangledClusters,
	PENDING,
	RULES,
	unaccountedEdges,
};
