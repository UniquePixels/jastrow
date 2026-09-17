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
	parenAltHeadword,
	phraseAltHeadwordStub,
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
	// that already spelled it. `registry.order.corpus.test.ts` classifies it in
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
	// `registry.order.corpus.test.ts` earns them into `UNLINK` from the corpus
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
	// — 0 entries in both, asserted corpus-wide where 755 + 465 = 1,220
	// reproduces the pre-re-scope catalogued figure, measured on the
	// 2026-07-04 export by a corpus check retired in consolidation
	// step 5 (`docs/v2/retired-corpus-checks.md`) — and they are
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
	// forbid.
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
	// relocation of an anchor tag, which is why `registry.order.corpus.test.ts`
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
	// collision. A corpus check composed the pair in both orders over
	// the whole corpus and asserted 0 order-dependent entries, 0
	// induced close-paren sites and 0 induced open-paren sites, so the
	// pair's freedom was a shipped assertion rather than a one-off run;
	// that check is retired in consolidation step 5
	// (`docs/v2/retired-corpus-checks.md`).
	openParenInAnchorDisplay,

	// The stranded tails (`superscript-subsection-stranded-outside-
	// anchor`, 182 occ / 160 ent, confined to letters T/U/V; and
	// `citation-number-truncated-outside-anchor`, 14 occ / 14 ent).
	// Both pull a fragment left outside the anchor back inside it by
	// moving `</a>`, and neither touches `href` or `data-ref` — the
	// opening-tag multiset was asserted byte-identical over the whole
	// corpus (`tagDrift`) by a corpus check retired in consolidation
	// step 5 (`docs/v2/retired-corpus-checks.md`).
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
	// disjoint from its 209 (isolated numbers measured on the
	// 2026-07-04 export by a corpus check retired in consolidation
	// step 5, `docs/v2/retired-corpus-checks.md`; task-7-report.md has
	// the composed run). Batch 1's RTL
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
	// `docs/archive/transform-batch-2.md` §3 rather than trusting either
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
	// Both measurements were a corpus check, re-run on every `bun qa`
	// rather than recorded here once. That check is retired in
	// consolidation step 5; on a new export this is a review-detector
	// candidate (consolidation spec §10), listed in
	// `docs/v2/retired-corpus-checks.md`.
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

	// `geresh-apostrophe-as-gershayim` — the THIRD arm of the same
	// defect, found by the residue sweep (batch 04) and shipped here
	// beside the pair rather than appended, because a reader looking for
	// "where does the corpus's gershayim get repaired" should find all
	// three in one place.
	//
	// It is NOT entangled with them and the catalogue does not say it is.
	// The three predicates are disjoint by construction: the pair reads
	// an ASCII `"`, this reads the two-codepoint run `׳'`, and neither
	// substitution can create or destroy the other's occurrence — the
	// pair writes `״` where a `"` stood and never emits a `׳`, and this
	// rule writes `״` and never emits a `"`. So no ordering constraint
	// binds them, and the placement is for legibility.
	//
	// The one thing that WOULD bind them is `gershayimRefAttribute`'s
	// `glyphCorrected` claim, which case 5 refuses outright if its `from`
	// tag already carries a `״`. That cannot happen: this rule is
	// document-text only and leaves every `<…>` run byte-identical, which
	// is measured over the whole corpus (0 of 25 occurrences sit inside a
	// tag) rather than argued.
	gereshApostropheGershayim,

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
	// `registry.order.corpus.test.ts`'s explicit pin, and in the corpus-tier
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
	// in a way measured on the 2026-07-04 export by a corpus check
	// retired in consolidation step 5 (`docs/v2/retired-corpus-checks.md`):
	// it repairs an ASCII quote in a HEADWORD, the phrase rule then
	// copies that repaired headword into `alt_headwords`, and the
	// corpus gershayim count moves 2,305 → 2,309.
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
	// 236 times; phrase-first, 235 — pinned by the direction test in
	// `registry.order.test.ts`. The disagreement was measured on the
	// 2026-07-04 export by a corpus check retired in consolidation
	// step 5 (`docs/v2/retired-corpus-checks.md`).
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

	// ---- batch 8: the lost see-particle ----
	//
	// `seeParticleRestore` is the SECOND rule in this registry to mint
	// text and the FIRST to mint a word. What licenses it is the null
	// model, not the size: the particle slot in a whole-definition
	// redirect stub is populated 7,270 times and empty 4, and it is
	// populated with a RETAINED VOCABULARY — `v.` 6,844, `v. sub` 196,
	// `read` 29, `pl. of` 29, eight more that bring the head of the
	// distribution to 7,154, and a tail of 116 rarer particles, several
	// themselves damaged (`v,` ×4). A slot being normalised away leaves
	// ONE surviving value; this one kept a dozen and a tail, so the four
	// empties are loss rather than convention. Ruling: Brian,
	// 2026-08-30.
	//
	// IT CANNOT MEET ANY RULE ABOVE IT, and the exclusion is structural
	// rather than argued. It fires only when the entry's whole content
	// is ONE CHILDLESS SENSE whose definition is nothing but a leading
	// comma and an anchor — no gloss text at all. Every rule above that
	// rewrites a `definition` needs something this shape does not hold:
	// `sectionBreakTerminator` a section label, the anaphora rules a
	// citation run, the paren rules a parenthesis, the geresh and
	// gershayim rules a Hebrew abbreviation mark in body text. The one
	// rule that could touch the same bytes is `trailingWhitespaceDefinition`
	// below, which is why this sits above it.
	//
	// IT IS A PURE INSERTION. The particle is spliced at the anchor's own
	// offset and every other byte is carried through, edge whitespace
	// included — so it hands `trailingWhitespaceDefinition` (10, still
	// `PENDING`) neither a new member nor a lost one. The three minted
	// codepoints are declared in `allows`; the second `.` needs an
	// allowance of its own because the input's only period is the stub's
	// terminator and `checkNoNewText` is a multiset test.
	seeParticleRestore,

	// ---- `vSubRedirectTwin` — batch 9's only rule ----
	//
	// Spec `docs/specs/2026-08-31-link-target-gate-case-8.md`, audit
	// `docs/archive/catalogue-audit/v-sub-redirect-stub.md`. It rewrites
	// the `data-ref` and `href` of ONE anchor in each of 50 whole-entry
	// `v. sub` redirect stubs, pointing it at the host's own spelling
	// twin instead of at an unrelated lemma the abbreviation happened to
	// reach. It writes no text, deletes none, and removes no anchor.
	//
	// DIRECTLY BELOW `seeParticleRestore` BECAUSE THEY SHARE A
	// POPULATION SHAPE, AND THE OVERLAP IS MEASURED 0. Both act on
	// whole-definition redirect stubs and batch 8's see-particle
	// vocabulary counts `v. sub` at 196, so the two look entangled.
	// They are not: `seeParticleRestore` repairs stubs whose particle
	// slot is EMPTY (E00226, G00428, H00010, H00021) and every one of
	// these 50 already spells `v. sub`. Measured over the corpus, the
	// two rid sets are disjoint.
	//
	// The order is nonetheless the safe one rather than the arbitrary
	// one. Were `seeParticleRestore` ever to widen and mint a `v. sub`
	// where none stood, it would run first and this rule would simply
	// not match — its table is keyed on rid AND the anchor's exact
	// current target, so a stub it has never seen gains no member. The
	// reverse order would let a retarget change bytes the particle rule
	// reads. Fail-closed either way, and closed harder this way round.
	vSubRedirectTwin,

	// ======== BATCH 10 — THE FOUR HEBREW-ORTHOGRAPHY ROWS ========
	//
	// The last four rows `PENDING` held. Spec for the gate case the two
	// point rules need:
	// `docs/specs/2026-09-01-link-target-gate-case-9.md`; report
	// `docs/archive/transform-batch-10.md`.
	//
	// THEY SIT AT THE END OF `text-repairs` AS A BLOCK, and the reason is
	// the same for all four: each keys on a Hebrew WORD or MARK, so each
	// wants to see the text every earlier text rule leaves rather than
	// the text one of them might still change. Running them earlier would
	// make their measured populations claims about a stage no rule
	// actually receives.

	// `holam-migrated-off-mater-vav`, 1,007 occurrences / 457 entries.
	// The largest population any single batch-10 rule takes, and the only
	// rule in the registry that `checkNoNewText` CANNOT SEE: it relocates
	// a codepoint, so the multiset is identical on both sides and that
	// gate returns clean whatever the rule does. Its safety lives in
	// `link-target.ts` case 9 and, until consolidation step 5 retired
	// it, a corpus check (`docs/v2/retired-corpus-checks.md`).
	//
	// IT SITS DIRECTLY BELOW `vSubRedirectTwin` BECAUSE THE TWO ARE
	// ENTANGLED, AND THE COMMUTATION GATE IS WHAT FOUND IT — nothing in
	// the catalogue connected the two rows, and no amount of reading
	// either module would have. `v-sub-redirect-stub-mislink ×
	// holam-migrated-off-mater-vav @ S01645`:
	//
	//   S01645's stub reads `, v. sub <a data-ref="Jastrow, קוּסְדֹּור 1">`
	//   and `קוּסְדֹּור` CARRIES THE DEFECT. `vSubRedirectTwin`'s frozen
	//   table is keyed on that exact target string, so run this rule first
	//   and the key no longer matches: the retarget is silently lost, and
	//   every per-rule count still reads normal.
	//
	// The pair is now declared `entangledWith` in `patterns.jsonl`, so
	// rule 2 requires them adjacent — and adjacency is DIRECTION-BLIND,
	// which is why `registry.order.test.ts` also pins the
	// direction. The general lesson is batch 9's rule looking back at
	// itself: A TABLE KEYED ON DAMAGED BYTES IS DISABLED BY ANY RULE THAT
	// REPAIRS THEM, and fail-closed here means a correct repair is lost
	// rather than a wrong one made.
	holamMaterMigration,

	// `shin-sin-dot-drop`, 52 of 102 — every occurrence whose dotted
	// spelling the corpus attests byte for byte. The other 50 stay on the
	// row: restoring a dot with no witness means CHOOSING between שׁ and
	// שׂ, which is the reconstruction [[project_no_vowel_inference]]
	// rules out.
	//
	// BELOW `holamMaterMigration` BECAUSE THE TWIN TABLE IS KEYED ON
	// EXACT BYTES — the same hazard one line up, one rule later. A table
	// key holding a migrated holam would be matched against text that
	// rule has already canonicalised and would never fire. None of the 23
	// keys holds one today; a corpus check re-derived the table from
	// the snapshot, so the day one does, the table would have been
	// rebuilt rather than silently missing. That check is retired in
	// consolidation step 5; on a new export this is a review-detector
	// candidate (consolidation spec §10), listed in
	// `docs/v2/retired-corpus-checks.md`.
	shinSinDotRestore,

	// `impossible-dagesh`, 13 of 19 — the forte and mappiq arms, where
	// the mark announces its own correction. It swaps a LETTER, and the
	// two rules above swap or add a MARK, so on the face of it letters
	// should come first. Measured, the direction is free: neither point
	// rule can create or destroy a dagesh, and none of the 23 twin keys
	// nor any migrated-holam context holds a ר or ח carrying one. The
	// entanglement above is what fixes the position — `holamMaterMigration`
	// must touch `vSubRedirectTwin`, and a gap-free span leaves nowhere
	// else for this rule to go.
	impossibleDagesh,

	// `vkh-geresh-loss`, 11 of 11 against a null model of 17,254. It
	// touches no link target and no headword, so it needs neither case 9
	// nor an exception table, and it is entangled with nothing above it:
	// the two letters it matches carry no point, so no rule in this block
	// can create or destroy one of its members.
	vkhGereshRestore,

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

	// ======== The first rule that CREATES an anchor ========
	//
	// `unlinked-bare-anaphor` (2026-09-06). Licensed by link-target gate
	// case 10, which lifted the spec's second counting invariant for it —
	// see `docs/specs/2026-09-06-link-target-gate-case-10.md` and Brian's
	// ruling of the same day. `MINT_DECLARERS` names it and nothing else.
	//
	// LAST AMONG THE TEXT RULES THAT DO ANY WORK, and unlike the
	// gershayim pair's placement this one is CONSTRAINED rather than
	// free. Three constraints, all directional:
	//
	// 1. **It must follow `ibAnaphora`.** That rule retargets the 312
	//    bare anaphors the linker dropped into the `Yoma 2a` sink. This
	//    rule copies whatever its antecedent carries, so running first
	//    would let it copy a target `ibAnaphora` is about to correct.
	//    `isSpentAnaphor` refuses a `Yoma 2a*` anaphor as an antecedent
	//    and so would catch that — but by declining, which is a repair
	//    lost rather than a wrong link written, and following is free.
	// 2. **It must follow every rule that can create a bare `Ib.`.** One
	//    exists: the population is 2,819 at the repaired stage and 2,820
	//    after the phase, so a rule above adds one. Running last is what
	//    makes that one reachable.
	//
	// 3. **It must precede `trailingWhitespaceDefinition`**, which
	//    `registry.order.test.ts` pins as the last `text-repairs`
	//    rule so it sees the deepest-last sense as everything else
	//    leaves it. A first cut appended this rule to the very end of
	//    `RULES` and that test caught it — the constraint is real even
	//    though this rule writes no trailing whitespace, because "last"
	//    is what makes that rule's measured 0 the whole answer rather
	//    than a claim about one pair.
	//
	// Nothing else constrains it. It writes only inside
	// `senses[].definition`, and the anchors it adds carry an
	// antecedent's own bytes, so a later rule reading targets sees
	// nothing it could not already see.
	unlinkedBareAnaphor,

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
	// 13 `text-repairs` rules that delete text (4,573 codepoints total)
	// were pinned by count in a corpus check instead, retired in consolidation step 5
	// (`docs/v2/retired-corpus-checks.md`). Batch-6b spec §2.3 carries
	// that argument.
	stemHeadMarkerChop,
	// The second `structural-repairs` rule, and the first to CREATE a
	// grammar block. It runs after `stemHeadMarkerChop` only because
	// that one shipped first.
	//
	// THE TWO DO NOT MEET, AND THAT IS A MEASUREMENT RATHER THAN A
	// PROPERTY OF THE PREDICATES. `stemHeadMarkerChop` needs a sense
	// with `number: '1)'`; **0 of this rule's 436 members carry a
	// number on `content.senses[0]` at all** (measured 2026-08-29 on
	// the composed corpus). What this comment must NOT say — a first
	// draft did — is that a numbered `senses[0]` is a shape this
	// predicate rejects: `blockFor` handles `sense.number` explicitly,
	// moving it onto the new child, and `stem-section.test.ts` pins
	// that path. The exclusion is corpus-shaped, so a re-fetch could
	// end it, and then the ORDER would start to matter: chop runs
	// first and trims the marker, and this rule would restructure the
	// trimmed definition afterwards.
	//
	// Both rules are in the same phase, so the commutation gate does
	// compose the pair — unlike a cross-phase pair, which it now skips
	// and counts (`PairStats.crossPhasePairs`, batch 6c).
	strandedStemHead,
	// Batch 7's two DUPLICATION rules, and the first rules in this
	// registry to declare `unlinks` alongside `removes`. Both delete a
	// verbatim duplicate; a duplicated run can contain an anchor, and
	// 26 of the 88 opening runs hold 30 between them against 9 of the 65
	// adjacent runs holding 11.
	//
	// THEY RUN HERE, NOT IN `text-repairs`, ON BRIAN'S RULING
	// 2026-08-29. The loss gate is phase-scoped, so this is the only
	// phase in which a deletion is judged PER CALL; in `text-repairs`
	// the two would instead have been defended by the same retired
	// corpus check's pinned total (`docs/v2/retired-corpus-checks.md`).
	//
	// The argument is the per-call gate, NOT the size — an earlier
	// version of this note compared their 6,128 RAW codepoints against
	// that baseline's 4,510 and called it larger, which is a raw figure
	// against a stripped one. On the baseline's own basis (`textOf`,
	// tags stripped) the two rules delete **2,738**, comfortably below
	// 4,510. The comparison never supported the ruling; the gating
	// difference does.
	//
	// THEIR DISJOINTNESS IS POSITIONAL AND IS WHAT DEFINES THEM.
	// `duplicatedOpeningRun` matches only at offset 0 and
	// `adjacentVerbatimRepeat` only away from it, so no single run can
	// be claimed by both — asserted in `duplication.test.ts` and
	// measured corpus-wide by a check retired in consolidation step 5
	// (`docs/v2/retired-corpus-checks.md`). ONE ENTRY (`I00509`)
	// holds one of each, at different offsets, and the two compose to
	// the same entry in either order.
	duplicatedOpeningRun,
	adjacentVerbatimRepeat,
	// THE ONLY RULE IN THIS REGISTRY THAT MINTS A BYTE INTO THE TEXT —
	// one period per member, declared through `allows: ['.']` on Brian's
	// ruling 2026-08-29.
	//
	// It runs after both deletion rules because it is the only member
	// that ADDS, so every deletion precedes the one insertion. The two
	// marker rules below it move text and sit there for their own
	// reason — they are an entangled pair and must be adjacent. Nothing
	// depends on this rule's position: its predicate is a `—<label>`
	// boundary, which no rule
	// above writes or removes, and the commutation gate composes it
	// against all four phase-mates.
	//
	// What licenses the `allows` is the null model, not the size: the
	// boundary occurs 7,532 times corpus-wide with 7,250 already carrying
	// their period, and the four legitimate non-period enders (`]` 241,
	// `?` 54, `)` 17, `!` 4) are refused by the predecessor class rather
	// than by an exception list — as are the row's two false-positive
	// families, the 3 closing quotes and 2 ellipses that cut its first
	// pass from 15 candidates to 10.
	sectionBreakTerminator,
	// `trailing-em-dash-tail`, which closes the only entanglement edge
	// batch 7 found already recorded in `PENDING`:
	// `sense-number-outside-closed-grammar` and this row are one
	// upstream event counted twice, and the catalogue on both says
	// they must be transformed in ONE step.
	//
	// IT SITS HERE, DIRECTLY ABOVE `continuationMarkerDash`, BECAUSE
	// THE TWO ARE ENTANGLED AND THE EDGE WAS FOUND BY THE COMMUTATION
	// GATE, not by reading — `trailing-em-dash-tail ×
	// continuation-marker-em-dash-loss @ A00337`. Writing `—*3)` onto
	// a sibling CREATES the witness `continuationMarkerDash` requires,
	// so this rule must run FIRST or that repair never happens. The
	// direction is pinned in `registry.order.test.ts`.
	//
	// IT MEETS NEITHER RULE ABOVE IT, AND BOTH EXCLUSIONS ARE MEASURED
	// RATHER THAN ARGUED. `stemHeadMarkerChop` needs a definition
	// ending in `—N) ` — a dash, digits, paren and space — where this
	// one needs a definition ending in the dash itself, so no string
	// satisfies both. `strandedStemHead` needs `content.senses[0]` with
	// no `grammar` and an opening italic label run; this rule never
	// touches `senses[0]`'s own text except to trim a trailing dash,
	// and never writes an italic run. Same phase, so the commutation
	// gate composes both pairs rather than skipping them.
	strandedDashStarMarker,
	// Batch 7's last rule, shipped for its HIGH-CONFIDENCE CORE only
	// (Brian's ruling 2026-08-29): the 14 dashless continuation markers
	// that sit in a MIXED sibling list, one whose other members carry
	// `—N)`.
	//
	// IT DECLARES `copied`, NOT `allows`, AND THAT IS THE SAFETY
	// ARGUMENT. An `allows: ['—']` would license an em dash anywhere in
	// the rule's diff, corpus-wide, on a maintainer's word; `copied` is
	// verified by the gate against THIS ENTRY'S input before it is
	// credited, and the mixed-list predicate is exactly what guarantees
	// the witness is there. Drop that requirement and the declaration
	// stops being checkable — the predicate is load-bearing, not
	// decorative.
	//
	// It runs after `sectionBreakTerminator` and touches a different
	// field: that one writes into a `definition`, this one into a
	// `number`. Nothing above it writes a `number` except
	// `stemHeadMarkerChop` and `strandedDashStarMarker`, and both leave
	// a DASHED marker, which this rule's predicate refuses.
	continuationMarkerDash,
];

/**
 * One intended order dependency: `before` must run before `after`.
 *
 * The SECOND way a non-commuting pair may be justified, beside
 * `entangledWith`, and it exists because the first one does not fit
 * every shape. Added 2026-09-06 on Brian's ruling, when
 * `unlinked-bare-anaphor` produced four non-commuting pairs whose
 * shipped order is demonstrably the right one and which
 * `entangledWith` cannot record.
 *
 * ## Why a second mechanism rather than a wider first one
 *
 * The two declarations describe two different phenomena, and
 * conflating them was what made the first one unusable here:
 *
 * - **`entangledWith` is POPULATION COLLISION.** Two rows own the same
 *   records, so a rule touching one must account for the other or it
 *   rewrites the same anchors twice. The remedy is ADJACENCY —
 *   `checkAdjacency` requires the cluster to occupy contiguous slots —
 *   because what matters is that nothing runs BETWEEN them.
 * - **`ORDERED` is SEQUENCE DEPENDENCY.** One rule reads what another
 *   writes. The remedy is a DIRECTION, and adjacency is irrelevant:
 *   `unlinked-bare-anaphor` reads the antecedent every retarget and
 *   unlink rule above it leaves, so it must run after all of them and
 *   can be adjacent to none.
 *
 * Declaring the four as `entangledWith` would have demanded a single
 * contiguous cluster spanning `bare-rtl-hebrew`'s existing 7-rule
 * cluster, a retarget and an unlink — while the same rule must run
 * last. Contiguity and "runs last" cannot both hold, which is the
 * shape that forced this.
 *
 * ## What keeps it from being a suppression list
 *
 * Three checks, and the middle one is the one that matters:
 *
 * 1. Both ids must be registered (`checkOrdered`).
 * 2. **The registry must actually satisfy the direction**
 *    (`checkOrdered`). A declaration that does not match the shipped
 *    order is a false record, not a licence, and is reported.
 * 3. **The pair must actually be non-commuting**
 *    (`commutation.corpus.test.ts`). An entry for a pair whose two
 *    orders agree is STALE — the dependency it records has gone — and
 *    the gate reports it rather than carrying it forever. This is
 *    `unaccountedEdges`' lesson for the other declaration: a recorded
 *    relationship must produce a validated check or a reported
 *    problem, never silence.
 *
 * `reason` is prose for a reader and is checked by nobody. It must say
 * what the wrong order WRITES, not that an order exists — the four
 * below were each measured on the named entry before being recorded.
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

/** Rows awaiting registration. Empty since transform batch 10; the
 * per-batch history of what left this array is archived at
 * `docs/archive/registry-history.md` (consolidation spec §8). */
const PENDING: readonly string[] = [];

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
 * evidence for this row was measured by a corpus check, retired in
 * consolidation step 5 (`docs/v2/retired-corpus-checks.md`): it
 * asserted the 20 empty-trapped-text records resolve to exactly the
 * 10 rids the catalogue names, as a sorted list.
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
 * past it; pinning the cluster set notices — SOMETIMES. Two
 * complementary claims, not one — see `registry.order.test.ts`.
 *
 * CORRECTED 2026-08-29 (batch 7). "Only pinning the cluster set
 * notices" is false for one class of edge, and batch 7 deleted one of
 * that class. `entangledClusters` derives over REGISTERED rules, so an
 * edge whose endpoints are BOTH unregistered never enters a cluster in
 * the first place — measured directly on the catalogue before and
 * after the deletion of the `trailing-em-dash-tail` ~
 * `sense-number-outside-closed-grammar` edge, and the pinned cluster
 * list is 5 clusters both times, with neither row in any of them. So
 * for a both-unregistered edge NEITHER gate witnesses a deletion:
 * this function excludes it by design (see the next paragraph) and the
 * cluster pin cannot see it either. The protection begins only once
 * one endpoint is registered, which is why batch 7 registered its rule
 * FIRST and deleted the edge second — with the rule in place, this
 * function did report the surviving half-edge, and would report a
 * re-addition. What pins the deletion itself is neither gate but a
 * direct catalogue assertion, now in `rules/sense-marker.test.ts`
 * (moved from the retired corpus tier's §7 in consolidation step 5).
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

export type { Cluster, Coverage, Ordered };
export {
	COVERED,
	checkAdjacency,
	checkOrdered,
	coverage,
	entangledClusters,
	ORDERED,
	PENDING,
	RULES,
	unaccountedEdges,
};
