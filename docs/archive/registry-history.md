# Registry `PENDING` history

Commentary lifted verbatim from `admin/pipeline/transform/registry.ts`
by consolidation step 6 (spec §8). It recorded which rows left
`PENDING` in which transform batch; the array itself is empty and
stays in the code. Extracted at `470b63b6`.

```text
const PENDING: readonly string[] = [
	// `nonsense-dup-anchor` and `nested-anchor-swallows-punctuation`
	// left this list in batch 4 Task 7: both are registered above.
	// `homograph-numeral-mismatch` left this list in batch 2 Task 9:
	// audited to `judgment` in `patterns.jsonl`. Its 576 occurrences /
	// 538 entries are three merged defects, the display (Jastrow's print
	// numeral) is the authoritative side — so batch 3 does not own it
	// either — and no rule can name the destination: 40.1% of the
	// population already points where print says, the only family model
	// available scores 87.5% on 3,253 known-correct controls, and gate
	// case 2 reaches the replacement for 3.5% of the candidate defects.
	// `h-cognate-self-link` left this list in batch 2 Task 4: audited to
	// `judgment` in `patterns.jsonl` (no other article exists for any of
	// its 87 anchors, and the construct is 3.2% of a corpus-wide linker
	// behaviour), so `coverage` no longer counts it and neither list may.
	// `trailing-em-dash-tail` left this list in batch 7: it is
	// registered above at 101 of its 132 stranded dashes — every one
	// whose next sibling carries a `*N)` marker. The other 31 STAY ON
	// THE ROW (16 entry-final, 7 next-sibling-unnumbered, 8
	// next-sibling-bare), because the row's own reading is that the
	// dash is the following marker's SEPARATOR rather than debris, and
	// for those 31 there is no marker to rejoin it to.
	//
	// Splitting rather than registering the whole row is batch 6b's
	// step: `coverage()` reads a row as registered the moment any rule
	// claims its id, so a partial rule that took the row off this list
	// would take its remainder off the queue with it. So the remainder is
	// recorded in `patterns.jsonl` and in
	// `docs/v2/transform-batch-7.md` §1 rather than by a second entry
	// here: a row named in `RULES` AND in this list is `duplicated`,
	// which `registry.test.ts` forbids.
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
	// would mint a shape nothing reads.
	//
	// The remaining 25 split two ways, and the batch report keeps them
	// apart: **16 are not the defect at all** — 14 `Label of X`
	// glosses, where the headword IS that stem of another article, and
	// 2 `= Label` cross-references to a stem the entry already carries
	// — and they are part of why the catalogued 544 was too high. The
	// other **9 are the defect** and are refused on shape: 7
	// etymology-paren remnants and 2 heads (`I00696`, `O01115`) whose
	// form this rule does not take. Those 9 stay on THIS row.
	//
	// Splitting rather than registering the whole row is the batch-6b
	// step that keeps all 125 ON the queue.
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
	// `sense-number-outside-closed-grammar` STAYS on this list, but it
	// is RE-SCOPED from 111 entries to **6** — Brian's ruling
	// 2026-08-29, audit
	// `data/patches/catalogue-audit/sense-number-closed-grammar.md`.
	// The row's name has been false since before Phase 2 opened, and
	// its 113 catalogued tokens PARTITION as 101 + 6 + 6, with nothing
	// left for a rule of its own to do. (The two sixes are DIFFERENT
	// sets that happen to share a size — see below. An earlier version
	// of this note listed 107, 6 and 101 as the three parts, which sum
	// to 214 because the 101 are a subset of the 107.)
	//
	// - **107 of the 113 were never outside the grammar.**
	//   `body/labels.ts`'s `LABEL` takes the star as a parsed FIELD, not
	//   a quarantine trigger; all 107 `*N)` markers parse and round-trip
	//   through `printLabel` byte-exactly. Those 107 split into the 101
	//   of the third bullet and the 6 named at the end of this note.
	// - **The other 6 of the 113 are repaired before any transform
	//   runs**, and they are NOT `*N)` markers at all. `repairs.ts`'s
	//   "04 — sense-label quarantine repairs" turns the five `-2)`
	//   ASCII hyphens into `—2)` and moves D00341's `[1)` bracket into
	//   the sense text. Tokens quarantining to `{unknown}`: 6 raw → **0
	//   post-`applyRepairs`**, measured over all 32,512 entries. This
	//   is batch 6a's `binyan-form-*` shape for the third time.
	// - **101 are repaired by its entangled partner's rule** —
	//   `strandedDashStarMarker` above, which is exactly the claim both
	//   rows make about each other.
	//
	// What is LEFT is the 6 `*N)` markers with no stranded dash before
	// them: `A00510`, `A02000`, `B00005`, `M00591`, `N01131`,
	// `P01184`. They reconcile the catalogued token census to the digit
	// (`*2)` 74 − 72, `*3)` 19 − 18, `*1)` 3 − 0), and `A02000`'s
	// predecessor ends `—[`, which is `stranded-open-bracket`'s shape.
	// A row re-scoped to its true size is the fifth way a row has moved
	// on this queue, and the reason it is not simply discarded is that
	// discarding it would leave those 6 surfaced by nothing executable.
	// AND IT LEFT THIS LIST IN BATCH 8, WITHDRAWN to `judgment` in
	// `patterns.jsonl` on Brian's ruling 2026-08-30, so `coverage` no
	// longer counts it and neither list may hold it. The 6 reproduce
	// exactly, same rids — and measured on each one's PREDECESSOR they
	// split three ways with no arm a rule can take. 3 are the FIRST
	// numbered sibling of their run, where the convention never puts a
	// dash, so nothing is missing; `A02000` belongs to
	// `stranded-open-bracket`; and of the last 2 only `A00510` has a
	// dashed sibling to witness the dash a repair would write. Minting
	// `M00591`'s on a maintainer's word is what `continuationMarkerDash`
	// refused. Audit:
	// `data/patches/catalogue-audit/sense-number-closed-grammar.md` §2.
	// `bracketed-gloss-lead-sense` (49) left this list in batch 7:
	// WITHDRAWN to `judgment` in `patterns.jsonl` on Brian's ruling
	// 2026-08-29 (audit
	// `data/patches/catalogue-audit/bracketed-gloss-lead-sense.md`), so
	// `coverage` no longer counts it and neither list may hold it.
	//
	// SECOND INDEX-0 ROW TO GO IN THIS BATCH, AND FOR THE SAME REASON.
	// `content.senses[0]` is not a sense in the body model —
	// `rejoin.ts:44` folds its `definition` into the gloss head and
	// `dry-run.ts:257` skips index 0 in the sense loop. So an unnumbered
	// bracketed lead is not a sense that escaped numbering; it is the
	// entry's LEAD, and it renders as one. `B01152` builds a gloss head
	// `"m.(b. h.; ברר) [empty, open] "` with sense labels `[—, 1, 2]`,
	// which is the printed order. 42 of the 49 carry a `language_code`
	// and 15 a `morphology`, so the bracket is usually one fragment of a
	// multi-part lead rather than a lead on its own.
	//
	// `judgment` rather than a discard: no repair can be stated, which
	// takes it off the transform queue, but asserting no defect exists
	// would need the 49 read against print — and the 7 members whose
	// gloss head is the bracket ALONE are the shape that could still be
	// wrong.
	// `parenthesized-alt-headword` and `phrase-alt-headword-stub` left
	// this list in batch 5: both are registered above, adjacent and
	// entangled.
	// `b-h-split-across-field-boundary` left this list in batch 8:
	// `status: discarded` in `patterns.jsonl` (Brian's ruling
	// 2026-08-30). NOT withdrawn for want of a mechanism — THE SPLIT
	// HEALS BY CONSTRUCTION, and `rejoin.ts`'s own header names this
	// class. `rejoinGlossHead` concatenates the four gloss-head
	// fragments IN PRINT ORDER and invents no separator, so a
	// `language_code` of `" ch. = b."` and a first definition of
	// `" h. מוּג, to melt."` rejoin contiguous. The count reproduces at 4
	// under a widened predicate (an exact `"= b."` match reads only 2),
	// and all 4 read `"b. h."` in the BUILT body — verified through
	// `buildBody`, which calls `rejoinGlossHead` at `dry-run.ts:241`,
	// rather than through the helper alone. Pinned corpus-wide by a
	// check retired in consolidation step 5
	// (`docs/v2/retired-corpus-checks.md`); audit
	// `data/patches/catalogue-audit/b-h-field-split.md`.
	// `reversed-hebrew-phrase` left this list in batch 8: WITHDRAWN to
	// `judgment` in `patterns.jsonl` on Brian's ruling 2026-08-30. THE
	// ROW'S MECHANISM IS FALSIFIED AND ITS COUNT IS A UNIT ARTIFACT.
	// Measured at the unit a reader sees — one `<span dir="rtl">` — the
	// corpus holds 61,539 multi-word Hebrew spans, 17,092 ENDING in the
	// particle `וכ׳` and **18** beginning with it. The catalogued 27
	// counts whitespace runs across STRIPPED markup, which merges spans
	// print separates and splits them at an internal ellipsis. The
	// damage is a ROTATION, not the reversal the row is named for: full
	// reversal yields word salad where the English gloss beside it
	// matches the rotation. What blocks a rule is that the rotated form
	// is better attested for 1 of 18; the other 17 bodies occur exactly
	// once corpus-wide, their own damaged instance, so every repair but
	// one would rest on the aggregate convention with no witness of its
	// own. Audit:
	// `data/patches/catalogue-audit/reversed-hebrew-phrase.md`.
	// `empty-lead-sense` (73 `{}` + 11 whitespace-only = 84) left this
	// list in batch 7: WITHDRAWN to `judgment` in `patterns.jsonl` on
	// Brian's ruling 2026-08-29 (audit
	// `data/patches/catalogue-audit/empty-lead-sense.md`), so `coverage`
	// no longer counts it and neither list may hold it.
	//
	// THE RULING TURNED ON THE REPAIR BEING HARMFUL, not merely
	// unnecessary — which is where it goes beyond `empty-stem-section`'s
	// data-vs-display withdrawal in 6b. Two lines of the body model
	// point the same way: `rejoin.ts:44` reads
	// `content.senses[0]?.definition ?? ''` into the gloss head, and
	// `dry-run.ts:257` SKIPS index 0 in the sense loop because sense 0
	// is already captured in the intro sense. So an empty lead
	// contributes an empty string and is then skipped — it costs the
	// reader nothing. Drop it, and `senses[1]` becomes index 0: folded
	// into the gloss head by the first line and skipped by the second.
	// The sense is not moved, it is CONSUMED. Built both ways over all
	// 73: **1 identical, 72 changed** — `A00644` loses a sense and gains
	// its text inside an unlabelled intro gloss.
	//
	// Neither text gate can see that: nothing invented, nothing lost,
	// text moved between fields. Same blind spot batch 4 found when
	// `applyRepairs` composed with `truncatedCitationDigit`.
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
	// the composed one was asserted by a corpus check retired in
	// consolidation step 5 (`docs/v2/retired-corpus-checks.md`).
	// `vkh-geresh-loss` left this list in batch 10: `vkhGereshRestore` is
	// registered above at 11 of 11, against a null model of 17,254 correct
	// spellings — 99.94%, the same shape `sectionBreakTerminator` shipped
	// on. A naive probe returns 17; the six it adds are notarikon
	// acrostics whose combining dot is U+0307, outside the Hebrew block, so
	// a mark class that stops at U+05C7 reads `וכ̇ר̇` as a bare
	// abbreviation.
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
	// `homograph-roman-stranded-in-definition` left this list in batch 8:
	// WITHDRAWN to `judgment` in `patterns.jsonl` on Brian's ruling
	// 2026-08-30. The count REPRODUCES EXACTLY at 23 under a stated
	// predicate, once both false positives the row itself names are
	// refused. What blocks a rule is the destination: v2 has no homograph
	// field, so the numeral goes into `headword` — and **17 of the 23
	// rewrites would dangle 37 live anchors** whose `data-ref` names the
	// bare headword. That is batch 5's `LINKED_HEADWORDS` finding with
	// the ratio inverted (2 of 7 refused there, 17 of 23 here), and
	// [[feedback_headword_is_a_namespace]] is the entry.
	//
	// THE COUNTERPART REPAIR IS ON THE OTHER ROUTE. The row itself calls
	// `homograph-numbering-schism` (186) "the anchor side of the same
	// superscript schism to this row's entry side", and that row is
	// `judgment` — so the anchors are never retargeted and the dangle is
	// permanent. Repairing one side alone makes the corpus worse.
	// Audit: `data/patches/catalogue-audit/homograph-roman-stranded.md`.
	// `holam-migrated-off-mater-vav` left this list in batch 10:
	// `holamMaterMigration` is registered above at 1,007 occurrences /
	// 457 entries, against 43,664 correctly-encoded holam males. It is
	// the FIRST RULE `checkNoNewText` CANNOT SEE — a move preserves the
	// codepoint multiset, so that gate returns clean whatever the rule
	// does — and the first to need `link-target.ts` case 9, because 442
	// of its repairs sit inside a `data-ref` or `href`.
	//
	// ONE REPAIR IS REFUSED AND IT IS A HEADWORD. Repairing `T00796`'s
	// makes it equal `T00795`'s, and two entries spelled alike leave
	// `Jastrow, רִמּוֹן 1` naming neither. The exception is frozen in
	// `rules/holam-mater.ts` and was re-derived from the snapshot by a
	// corpus check retired in consolidation step 5
	// (`docs/v2/retired-corpus-checks.md`). The entry's other fields
	// are repaired normally: only the namespace key is held back.
	// `impossible-dagesh` left this list in batch 10: `impossibleDagesh`
	// is registered above at **13 of 19**. The other 6 are refused
	// because the mark announces nothing there, which is the row's own
	// argument applied honestly — 5 resh-dageshes with no vowel after
	// them (neither forte nor mappiq) and 1 mid-word het-dagesh. They
	// stay ON the row, recorded in `docs/v2/transform-batch-10.md` §3
	// rather than by a second entry here: a row named in `RULES` AND in
	// this list is `duplicated`, which `registry.test.ts` forbids.
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
	// the last task. The premise was pinned corpus-wide by a check
	// retired in consolidation step 5 (`docs/v2/retired-corpus-checks.md`);
	// the audit is `data/patches/catalogue-audit/binyan-form-cleanup.md`.
	// `plural-label-rendering-defeats-capture` left this list in batch 8:
	// `status: discarded` in `patterns.jsonl` (Brian's ruling
	// 2026-08-30), the TENTH `plural_form` row to go and the only one
	// that needed a measurement rather than the shared field argument.
	// It was held open because its shape is an ABSENCE and it claimed
	// the plurals "remain present verbatim in the definition text that
	// v2 does carry" — claimed, never measured. Measured now: **523 of
	// 523** entries that declare a plural while `plural_form` is empty
	// or absent have every declared Hebrew run present in the built
	// `BodyEntry`, compared through `buildBody` itself. The field side
	// is the siblings' argument unchanged: `plural_form` is not a v2
	// field. Note the catalogued 358 does NOT reproduce — the same
	// buckets over all senses read 523 — and the disposition does not
	// turn on which is right, 523 being a superset at 100% survival.
	// Pinned by a corpus check retired in consolidation step 5
	// (`docs/v2/retired-corpus-checks.md`); audit
	// `data/patches/catalogue-audit/plural-label-capture.md`.
	// `continuation-marker-em-dash-loss` left this list in batch 7: it is
	// registered above for its WITNESSED CORE of 14, and the row is
	// re-scoped 71 -> **22** in `patterns.jsonl`. The 22 are the dashless
	// markers whose sibling list holds no dashed member, so nothing in
	// the entry witnesses the convention and no declaration this gate
	// can check is available.
	//
	// The remainder is recorded on the row rather than by a second entry
	// here, for the reason `trailing-em-dash-tail`'s block gives: a row
	// named in `RULES` AND in this list is `duplicated`, which
	// `registry.test.ts` forbids.
	//
	// The row's count has now been reconstructed four times and never
	// twice the same (round 2: 19; the stranded-open-bracket audit: 44;
	// the catalogue: 71; this batch: 36 clean of 283 dashless markers).
	// Splitting it rather than emptying it keeps the 22 on the queue and
	// keeps the row's unsettled status honest.
	// `duplicated-definition-opening-run` left this list in batch 7: it
	// is registered above at 88 occurrences / 85 entries. THE ROW
	// RECORDED NO PREDICATE, only "the middle and best-argued figure" of
	// three letter filters (M 91, Q 85, P 79), so batch 7 had to state
	// one: a definition whose opening run of >= 4 characters repeats
	// immediately at offset 0. `k = 4` reproduces the catalogued 85
	// entries exactly, which is the only evidence available for what the
	// round-3 detector did; uncapped the thresholds run 2 -> 98 entries,
	// 3 -> 90, 4 -> 85, 6 -> 79, 8 -> 64, 12 -> 47.
	// `shin-sin-dot-drop` left this list in batch 10: `shinSinDotRestore`
	// is registered above at **52 of 102** — every occurrence whose
	// dotted spelling the corpus attests BYTE FOR BYTE, 23 distinct words
	// with exactly one twin each and zero with two. The other 50 stay on
	// the row, because restoring a dot with no witness means choosing
	// between שׁ and שׂ and that is the reconstruction
	// [[project_no_vowel_inference]] rules out.
	//
	// THE ROW'S OWN WITNESS CLAIM DOES NOT REPRODUCE and is weaker than
	// this one: it reads 28 of 89 in anchor displays with 28 of 28
	// targets carrying the point; re-measured, 22 sit in displays and 15
	// have a dotted target, and that test is stated on SKELETONS, so it
	// admits a target whose vowels differ (`שָלַב` reaching
	// `שְׁלַב`).
	// `adjacent-verbatim-repetition` left this list in batch 7: it is
	// registered above at its CORRECTED size, 65 rather than the
	// catalogued 59. The 59 was not a measurement agreeing with the
	// catalogue but two length caps matching — for an adjacent repeat
	// only the FULL run repeats immediately, since a proper suffix of
	// the first copy is followed by the second copy's PREFIX, so a
	// bounded search loses long members rather than shortening them.
	// The split is exact: 59 members at <= 120 characters, 6 above.
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
	// `section-break-terminator-loss` left this list in batch 7: it is
	// registered above at its CORRECTED size, 11 rather than the
	// catalogued 10, under a stated predicate — a letter or digit,
	// optional tags, an em dash, optional tags, a section label.
	// `see-particle-lost` left this list in batch 8: it is registered
	// above at the catalogued 4, which REPRODUCED EXACTLY — and only
	// under the row's own restriction that the anchor be the whole
	// definition AND the stub be the whole entry. Walking child senses
	// as well reads 18, and the 14 extra are ordinary cross-reference
	// sub-senses of large articles rather than damage.
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
	//
	// SEVEN ROWS LEFT THIS LIST IN BATCH 9 (#60), the whole
	// citation-linking family bar the one that got a rule:
	// `tanhuma-never-linked`, `mekhilta-sifra-never-linked`,
	// `pesikta-drk-never-linked`, `targum-sheni-never-linked`,
	// `midrash-petichta-unanchored`, `unlinked-v-span` and
	// `containment-fallback-mislink` — all audited to `judgment` in
	// `patterns.jsonl` on Brian's rulings of 2026-08-31, so `coverage`
	// no longer counts them and neither list may hold them. The batch's
	// finding is one sentence: the transform route can repair a wrong
	// anchor but cannot build a right one, because building one needs
	// an address space outside this corpus. Report:
	// `docs/v2/transform-batch-9.md`; five audits under
	// `data/patches/catalogue-audit/`.
	//
	// THEY WERE LEFT HERE BY MISTAKE WHEN #60 MERGED, and the mistake
	// is the one this list's own docstring warns about: a row named
	// here is a STANDING CLAIM THAT A RULE IS OWED, and seven rows
	// ruled to `judgment` were still making it. **No gate could see
	// it** — `coverage()` counts `pending` over TRANSFORM-route rows
	// only, so a withdrawn row named here is counted by nothing and
	// reported by nothing; `PENDING` read 11 while `coverage().pending`
	// read 4 and nothing reconciled them. That silence is now closed by
	// `registry.test.ts`'s "every pending id is a transform row".
	// `v-sub-redirect-stub-mislink` also left, by the other door: it is
	// registered above as `vSubRedirectTwin` at 50.
];
```
