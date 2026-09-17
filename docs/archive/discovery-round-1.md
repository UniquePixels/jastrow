# Discovery Round 1 — Stratified Sweep of Letters A–V

Consolidation of discovery round 1 of the sweep-tiering programme. The
sweep's product is **pattern classes, not per-entry patches**: one
deterministic rule derived from a pattern fixes every instance, so
sweeping for further instances of a known pattern is wasted spend.
Round 1 swept 22 stratified chunks — one per rid letter A–V, 30 entries
each, 660 entries — with Opus agents under `sweep-v4.md`.

Everything swept before this round sat inside letter A (5.3% of the
corpus, 49% of that one letter). This was the first look at the other
21 letters, and the answer it returned is not the one the
stratification was designed to test.

Counts below were **re-measured for this document** against
`data/source/jastrow-dictionary.jsonl` (32,512 entries). Where a chunk
report and this measurement disagree, the measurement is recorded and
the disagreement named. Anchors are counted over all sense definitions
including nested `sense.senses`, which reproduces chunk-00882's
67,549-anchor Jastrow universe as 67,639.

## Headline

| | |
| --- | --- |
| Chunks swept | 22 (one per rid letter A–V) |
| Entries swept | 660 |
| Raw candidate lines | 98, plus letter notes, detector findings, conflicts and negative results |
| Catalogued after merge | **69 rows** — 62 `candidate`, 7 `discarded` |
| Catalogue total | 80 rows (11 from round 0) |
| Conflicts recorded | 2, both settled by re-measurement |
| Saturation | `isSaturated(rows, 1) === false` |

### Dispositions

| Disposition | Entries |
| --- | --- |
| `clean` | 475 |
| `needs_human_judgment` | 126 |
| `needs_print_check` | 40 |
| `repaired` | 19 |
| **Total** | **660** |

33 patches were emitted across the 19 repaired entries.

## 1. Merges

98 candidate lines collapse to 69 rows. Many patterns were found
independently by different letters under different names; every merge
is recorded here.

### Merges the dispatch anticipated

| Merged row | Sources | Confirmation |
| --- | --- | --- |
| `geresh-letter-numeral-mislink` | C `letter-geresh-numeral-mislink`, E `numeral-letter-abbrev-mislink` | identical figures in both reports (708 anchors / 608 entries); re-measured 708 / 608 |
| `plural-inflection-anchor-escapes-entry` | D `plural-anchor-escapes-entry`, B `plural-form-crosslink`, V's widened quantification (2,656) | one rule over `plural_form` + `alt_headwords` + `binyan_form` yields 3,365 anchors / 2,281 entries |
| `gershayim-breaks-ref-attribute` | G `ascii-gershayim-breaks-attribute` (85), H `quote-in-ref-attribute` (86), M `gershayim-broken-link-attribute` (85) | three independent letters, one shape; re-measured 90 anchors / 85 entries |
| `open-paren-in-anchor-display` | C `paren-inside-anchor`, D `open-paren-inside-wrapper` (`<a>` half), U `open-paren-in-anchor-display` | all three report 225 occurrences / 214 entries; re-measured 225 / 214 |
| `open-paren-in-rtl-span` | D `open-paren-inside-wrapper` (`<span>` half), A `paren-crosses-rtl-span-boundary` | the `<span>` half is a separate row because the repair differs from the anchor half |
| `gloss-space-loss` | K `fused-gloss-space-loss`, O `gloss-space-loss` | O explicitly confirmed K's finding |
| `stranded-stem-head` | H `stranded-stem-head` (499), V loose `, <i>Pi./Hif.</i>` head (315) | re-measured 544 entries, of which **351** carry no `verbal_stem` anywhere — V's shape is the no-grammar-object subset |
| refs family (5 candidates) | A `refs-duplicate-item`, D `duplicate-refs-run`, C `refs-excess-duplicate`, E `phantom-refs-items`, K `refs-segment-run-padding` | → **3 rows**, all discarded (§3) |

### Merges this consolidation found

Four merges were not in the dispatch's list and only surfaced under
measurement.

| Merged row | Sources | Evidence |
| --- | --- | --- |
| `em-dash-section-break-in-own-italic` | E "em-dash swallowed into `<i>`" (278 occ / 270), T `spaced-em-dash-section-separator` (286 occ / 278), and the em-dash sub-shape of D `italic-lone-punctuation` | the same thing. `.</i> <i>—` occurs 278 times in 270 entries, and in **rendered** text a spaced em-dash occurs **230 times across 226 entries** — reproducing T's "230/226 fully spaced" exactly. (The *tagged* string `\s—\s` is 0 corpus-wide only because the `<i>` tag sits between the space and the dash; the corpus norm `.—` occurs 20,195 times.) |
| `anchor-swallows-close-paren` | B `anchor-swallows-close-paren` (529), E `tosefta-double-chapter-anchor` (525 / 493) | one regex yields 526 occ / 494 entries, bracketing both reports |
| `italic-lone-punctuation` (restated) | D `italic-lone-punctuation` (23), B `italic-em-dash-separator` (230) | `<i>` wrapping one punctuation mark is 259 occ / 255 entries, but the em-dash sub-shape (230 / 226) is a **complete subset** of the row above — all 230 are preceded by `.</i> `. Catalogued at its full size it would double-count 230 instances and produce two Phase 2 rules for one defect, so this row is restated as its **29-occurrence non-em-dash residue** (`.` 21, `?` 5, `;` 2, `͗` 1), which also reconciles with D's original 23 |
| `homograph-numeral-mismatch` | N `wrong-homograph-link` (340), O `homograph-numeral-mismatch` (195), P `roman-numeral-orphan-display` (104) | all three compare a display's Roman numeral against the numeral in the ref or target; one rule yields 576 anchors / 538 entries |

Two further consolidations: L's `parashah-section-cite-as-bible-chapter`
and R's `midrash-section-cite-as-bible-chapter` are one mechanism (a
parashah name mapped to its biblical book, the section number read as a
chapter) and become one row; Q's `plene-yod-abbrev-sink` is the largest
deterministic subset of L's `geresh-abbrev-global-sink`, and the fix is
one lookup table, so they become one row.

## 2. The merged catalogue

62 `candidate` rows, largest first. Full text in
`data/patches/patterns.jsonl`.

### Linking

| Row | Entries | Note |
| --- | --- | --- |
| `midrash-subsection-link-drift` | 3,941 | 5,526 `X R. s. N` citations carry a `:sub-section` the display never shows; checkable only in T/U/V, where ~21% contradict |
| `homograph-numbering-schism` | 3,421 | §3 |
| `same-anchor-positional-mislink` | 3,183 | five independent confirmations (G, I, N, K, S) |
| `homograph-collapse-link` | 2,957 | **1,132 of 1,132** shared skeletons resolve to exactly one target; zero exceptions |
| `plural-inflection-anchor-escapes-entry` | 2,281 | |
| `neighbor-rid-mislink` | 655 | distance histogram over 1,531 skeleton-matched-but-diverging anchors: **701**, 87, 28, 17, 10 — a 7–8× spike at exactly ±1. Count caveated: the spike survives every tie-break, the count does not (first-match gives 596/123/57/22/37 and 559 entries; review measured 676/84/47/29/13 and 630) |
| `geresh-letter-numeral-mislink` | 608 | v4 deliberately does not hint these |
| `geresh-abbrev-fixed-sink` | 572 | 63 displays with one fixed wrong target; `שִׁי׳→שִׁבְהוֹר` 39, `פִּי׳→פְּגִימִין` 27, `סִי׳→סִבְכָא` 25 |
| `homograph-numeral-mismatch` | 538 | 537 of 576 name a numeral that is no headword |
| `interior-consonant-mislink` | 495 | count caveated — three chunks, three rules |
| `anchor-swallows-close-paren` | 494 | |
| `nested-anchor-swallows-punctuation` | 465 | 475 of 475 have byte-identical outer/inner refs; 455 trap punctuation |
| `unlinked-stub-nonexistent-target` | 451 | refines round 0's `unlinked-v-span` |
| `targum-sheni-never-linked` | 362 | 384 of 384 unlinked, against `Targ. II Chr.` 250 of 250 linked |
| `targum-cite-to-plain-bible` | 43 | same missing-work-mapping family; `Targum Jonathan on Habakkuk` does not exist |
| `midrash-section-cite-as-bible-chapter` | 255 | |
| `prefixed-geresh-abbrev-mislink` | 173 | 183 of 185 target a different entry |
| `superscript-subsection-stranded-outside-anchor` | 160 | T 36 / U 98 / V 48, zero in A–S |
| `inflection-abbrev-mislink` | 137 | count caveated |
| `unnumbered-terminal-homograph` | 129 | |
| `binyan-head-form-mislinked` | 65 | ~33% of the whole construction; count caveated |
| `h-cognate-self-link` | 50 | |
| `midrash-tehillim-wrong-psalm` | 49 | count caveated |
| `multiword-abbrev-mislink` | 22 | count caveated |
| `alt-headword-collision` | 0 | mechanism identified, **unquantified** — round 2 must size it |

### Markup and prose

`trailing-whitespace-definition` 2,340 · `unmatched-closing-paren`
1,604 (raw; 617 net of the `v. X 2)` convention) ·
`ascii-quote-as-gershayim-in-body` 1,234 ·
`italic-swallowed-terminal-period` 1,209 · `redundant-outer-rtl-span`
529 · `em-dash-section-break-in-own-italic` 270 ·
`italic-lone-punctuation` 29 (restated residue; see §1) ·
`open-paren-in-anchor-display` 214 ·
`stranded-open-bracket` 152 · `latin-token-inside-rtl-span` 130 ·
`trailing-em-dash-tail` 130 · `anchor-italic-no-space` 111 ·
`doubled-space-as-text-loss-locator` 108 · `italic-close-paren-nospace`
95 · `open-paren-in-rtl-span` 89 · `gershayim-breaks-ref-attribute` 85 ·
`bracket-paren-mismatch` 67.

### Segmentation and grammar

`etymology-head-pseudo-sense` 1,553 · `preamble-stranded-lead-sense`
676 · `stranded-stem-head` 544 · `empty-stem-section` 342 ·
`sense-number-outside-closed-grammar` 111 ·
`bracketed-gloss-lead-sense` 49 · `asterisk-stem-label` 43 ·
`self-numbered-intext-marker` 35 ·
`first-sense-debris-stranding-language-label` 5.

`etymology-head-pseudo-sense` is flood-scale and **needs a maintainer
ruling before it can be slated at all**. B reported it as a defect;
F and J both independently judged the unnumbered lead sense a normal
print convention (2,295 entries, re-measured 2,295); and B12 already
treats the first sense as "the entry's intro flow, exactly as printed".
If that ruling holds, the row becomes `discarded`, not scripted.

`sense-number-outside-closed-grammar` reproduces L's eight-value
breakdown exactly: `*2)` ×74, `*3)` ×19, `*4)` ×9, `-2)` ×5 (ASCII
hyphen where the corpus uses an em-dash), `*1)` ×3, `[1)`, `*5)`, `*6)`.
The hyphen and bracket forms are outright defects; the asterisked ones
are print-faithful but **unreachable by split/retag**, so those entries
are unrepairable by any structural op until the grammar or the field
changes.

### `alt_headwords` and text loss

`abbrev-in-alt-headwords` 2,265 · `parenthesized-alt-headword` 580 ·
`citation-tail-truncation` 657 · `initial-niqqud-drop` 76 ·
`gloss-space-loss` 45 · `lost-h-equivalent` 32 · `truncated-read-stub`
26 · `spurious-name-period` 19 · `lost-hebrew-after-h-marker` 13 ·
`dangling-denom-tail` 10 · `b-h-split-across-field-boundary` 4.

`altHeadwords` **survives** in v2 as clean form objects
(`entry.schema.json`, `formObject` with `text` `minLength: 1`), so both
`alt_headwords` rows are live migration requirements rather than moot.

### Discarded — seven rows, all dropped-field classes

| Row | Entries | Grounds |
| --- | --- | --- |
| `refs-phantom-items` | 2,465 | `refs[]` dropped (B7, §5) |
| `refs-segment-run-padding` | 615 | same |
| `refs-excess-duplicate` | 278 | same |
| `quotes-ocr-one-for-i` | 29 | `quotes` dropped entirely (B8, §6) |
| `quotes-gloss-slot-holds-markup-label` | 11 | same |
| `plural-form-roman-numeral-debris` | 64 | `plural_form` not a v2 field (§2) |
| `plural-form-holds-gloss-text` | 14 | same |

The two `plural_form` rows **reopen on exactly the condition round 0
attached to `plural-form-empty-slot`**: if follow-up #1 is resolved by
teaching `rejoin.ts` to append `plural_form`, this debris becomes
visible gloss text.

### Counts that are judgement calls

Twenty rows carry an explicit caveat in `reason` rather than a
false-precision number: `interior-consonant-mislink`,
`unlinked-stub-nonexistent-target`, `midrash-section-cite-as-bible-chapter`,
`inflection-abbrev-mislink`, `binyan-head-form-mislinked`,
`midrash-tehillim-wrong-psalm`, `multiword-abbrev-mislink`,
`alt-headword-collision`, `unmatched-closing-paren`,
`stranded-open-bracket`, `open-paren-in-rtl-span`,
`etymology-head-pseudo-sense`, `preamble-stranded-lead-sense`,
`self-numbered-intext-marker`, `citation-tail-truncation`,
`initial-niqqud-drop`, `gloss-space-loss`, `spurious-name-period`,
`bracket-paren-mismatch`, `neighbor-rid-mislink`.

### One finding that a first probe missed

chunk-00221's `targum-cite-to-plain-bible` (41 entries, 37 of them
Habakkuk, attributed to one missing work mapping) was **initially
recorded here as non-reproducing. That was a probe error, and the
chunk was right.**

The first probe required the display *inside* the anchor to begin
`Targ.`. In every instance `Targ.` sits **outside** the anchor and only
the book and chapter are linked:

```
D00892:  Targ. <a href="/Habakkuk.2.19" data-ref="Habakkuk 2:19">Hab. II, 19</a>
```

Re-measured with pre-anchor context included — anchors preceded by a
bare `Targ.` (optionally `Targ. O.` / `Targ. Y.`) whose data-ref names a
non-Targum work — the class is **44 anchors / 43 entries**: Habakkuk 37,
Judges 4, then Mishnah Chagigah, I Chronicles and I Samuel 1 each. The
figure is stable across pre-anchor windows of 30, 60 and 100
characters. Review measured 45 / 44; all three measurements agree on
the Habakkuk cluster.

The root cause is exactly what chunk-00221 stated — **one missing work
mapping**. `Targum Jonathan on Habakkuk` does not appear anywhere in the
corpus, while all eleven other minor prophets have one:

| Hosea | Amos | Zech. | Micah | Nahum | Joel | Zeph. | Mal. | Jonah | Obad. | Haggai | **Habakkuk** |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 131 | 107 | 86 | 66 | 40 | 39 | 37 | 29 | 26 | 14 | 13 | **absent** |

So `Targ. Hab.` — 37 occurrences, inside an anchor **0** times — links
to `Habakkuk` itself, the plain Hebrew Bible. Catalogued as
`targum-cite-to-plain-bible`, 43 entries, `candidate`, adjacent to
`targum-sheni-never-linked`: both are one missing work mapping, and both
are deterministic table-driven fixes.

### The generalisation, which matters more than the row

Two probes in this round tested the same family and only one was
sound. For `targum-sheni-never-linked` the probe asked whether the text
was **anchored at all**, and it worked. For `targum-cite-to-plain-bible`
the probe asked what the **anchor display** said, and it failed —
because the defining text (`Targ.`) is not in the display.

**Any pattern whose defining text sits outside the anchor is invisible
to a display-side probe.** This is a systematic hole, not a one-off
slip: the citation *work* is frequently named in prose before the
anchor while only the book-and-chapter reference is linked, so every
mislink class of that shape reads as clean. Round 2 must **re-run the
round-1 negative results with pre-anchor context included** before any
of them is trusted as a genuine absence.

## 3. The two recorded conflicts

### `refs[]` duplicate items — chunk-00283 is right

chunk-00066 called duplicated `refs[]` items a defect at 1,908 entries.
chunk-00283 rejected it, finding 1,629 of them have anchor counts
matching the duplicates, `refs` being a per-anchor list rather than a
set.

Re-measured, and both figures reproduce: **1,908** entries carry a
duplicated item, **1,630** of which have anchor counts matching or
exceeding every duplicate. So chunk-00283 is right — the duplication is
correct by construction for 85% of the class. The residue is the
**278** entries where a duplicate exceeds its anchor count, reproducing
chunk-00181's `refs-excess-duplicate` exactly, and that is the only
anomaly worth a row. chunk-00221's `duplicate-refs-run` (166 entries,
re-measured 166) is a sub-shape of the same 1,908 and earns none.

Immaterial to Phase 2 in any case: round 0 established that `refs[]` is
dropped from truth and the reference index is derived at compile from
the `<cite ref>` tags (B7, body model §5). All three refs rows discard
on those grounds — as does `refs-phantom-items`, which is round 0's
`dataref-not-in-refs` counted from the other side.

### Homograph numbering — both measurements are true

chunk-00608 reported 4,101 anchors targeting a base with a `²` sibling.
chunk-00465 measured the same coexistence and found it "breaks no links
— 0 of the 81 data-refs naming no headword are resolvable by a
roman↔superscript mapping".

Re-measured, and **both reproduce**:

| Measurement | Result |
| --- | --- |
| Superscript-marked headwords | 807 |
| …whose bare base is also a headword | 807 (all of them) |
| Headwords ending in `¹` | **0** |
| Roman-marked headwords | 2,871 (1,233 explicit ` I`) |
| Jastrow data-refs naming no headword | 81, across 30 distinct targets |
| …fixable by a roman↔superscript mapping | **0** — chunk-00465 exactly |
| Anchors targeting a base with a `²` sibling | **4,151** — chunk-00608's 4,101 |

They are not in conflict because they measure different things.
chunk-00465 measured link *resolvability*; chunk-00608 measured
referential *correctness*. Nothing dangles — and that is precisely the
problem. Because no headword anywhere ends in `¹`, a cross-reference
meant for the **first** member of a superscript family has no string
that can express it, so it lands silently on the bare base and **no
resolvability test can ever see it**. Catalogued as
`homograph-numbering-schism`, 3,421 entries, `candidate`.

## 4. Detector calibration

Four findings are about `link-anomalies.ts` and the v4 hint rules, not
about the corpus. None is catalogued as a pattern; all four block
accurate hinting in round 2.

### The `*`-prefix false positive

Jastrow's editorial `*` on a reconstructed headword is part of the
stored headword string, so an anchor whose display is the *correct*
de-asterisked target fails `exact-headword-diverge`. Found by B and
confirmed independently by J: **1,339** `*`-prefixed headwords generate
1,485–1,894 anchors that are all correct links and all eligible to be
falsely hinted. It was the sole cause of both `exact-headword-diverge`
hints in chunk-00126.

The fix is the one already applied for superscripts: strip `*` before
comparison in `link-anomalies.ts` (`skeleton`/`consonants`). v2 agrees
that the asterisk is not part of the text — `formObject` carries it as
the boolean `reconstructed`.

These cluster in letter B, which is why letter-A sweeps never hit them
in volume.

### The niqqud carve-out is internally inconsistent

The carve-out's "unique skeleton" escape hatch is only safe where
skeletons are unique. Letter J is dense homograph clusters (יבל / יבם /
יבש, four to five headwords per skeleton), and there the hatch fires
constantly and **licenses links that are plainly wrong** — J00062,
J00069 and J00057 were left `clean` only because of it — while the
identical shape *is* escalable where the skeleton has twins (J00051).
That is an inconsistency in the rule, not a property of the data.

Letter I found the complementary blind spot: `niqqud-twin-target` only
fires on **vocalized** displays, so the maximally ambiguous case — a
bare unpointed display whose skeleton is shared — is unhinted. That
blind spot is what `homograph-collapse-link` measures, and it is total:
1,132 of 1,132 shared skeletons resolve to one fixed target, with zero
skeletons resolving two ways.

### The geresh carve-out is wrong for prefixed and inflected forms

`MIN_ABBREV_STEM = 2` exempts one- and two-letter geresh forms as
"generic and not hinted". Three letters showed the exemption is wrong:

- **C**: 2 of the 3 unhinted class-11s in the chunk were exactly those
  forms. The exempted shape is 608 entries corpus-wide
  (`geresh-letter-numeral-mislink`).
- **J**: the *prefixed* two-letter form (particle + one-letter geresh)
  is entry-specific, not generic — 185 instances, **183 targeting a
  different entry**, ~99% wrong and not a judgement call.
- **P** and **I**: geresh abbreviations of the entry's own **inflected
  form** rather than its headword are outside `abbrev-mislink`'s scope
  entirely, which only checks headword abbreviations.

The exemption should be narrowed to unprefixed one-letter forms whose
expansion is genuinely ambiguous, and `abbrev-mislink` widened to match
inflected forms.

### There is no Hebrew-side frequency check at all

The highest-value finding of the round (F). Every existing hint rule —
`comma-for-period`, `bare-abbrev`, `rare-dotted-variant`,
`truncated-formula` — fires only on **Latin-script** citation tokens.
Hebrew quotation text gets no corpus-frequency comparison whatsoever,
and it carries the same OCR confusions. 1,053 Hebrew tokens occur ≤2×
and are one substitution from a token occurring ≥100×; restricting to
the confusable pairs (ד/ר ו/י ו/ן ה/ח ה/ת ב/כ ג/נ ם/ס כ/פ ח/ת ן/ר צ/ע)
gives 76 high-precision candidates. This is the Hebrew analogue of the
class-8 sub-token rule that broke batch-01.

Two smaller calibrations: P's `lemma-variant-retarget` (28 of 7,800
redirect stubs fire `exact-headword-diverge` on *correct* ל״ה/ל״י
resolutions and should be suppressed), and L's observation that 696 of
751 one-consonant-off anchors can **never** fire
`exact-headword-diverge` because the display is unvocalized and so is
not itself a corpus headword string.

## 5. Letter behaviour — what the stratification actually found

The stratification was designed to test whether defect classes are
letter-specific. It answered a different question.

**Four letters ran the test explicitly and all four failed it the same
way.** L, M, T and U each checked whether their newly found patterns
were letter-local, and each found the patterns present in letter A and
simply missed by the earlier sweeps:

- **M** rated itself against A on every measurable axis and matched:
  head pseudo-sense 5.9% vs 5.8%, trailing whitespace 5.9% vs 5.8%,
  italic-swallowed period 3.4% vs 3.5%, `, v. X` stubs 24.3% vs 25.9%.
  All four of its new patterns are present in A. Its own conclusion:
  "misses of earlier rounds".
- **L** cited letter-A rids for its own findings (`*3)` at A00337,
  chapter-only Bible anchors at A00458 and A00773, unmatched `)` at
  A00112) and read them as "under-detection in the earlier A sweeps
  rather than a letter difference".
- **T** ran the A test on all three of its patterns and confirmed A rids
  in each (A02153/A02732; 23 A entries; 16 A entries). None
  letter-specific.
- **U** ran it again and failed again on all three (129 → A00517,
  A00841, A03081; 225 → 11 A entries; 108 → 18 A entries).

Re-measured here, the letter-A exposure is real for every one of them:
`sense-number-outside-closed-grammar` A=1 of 111,
`open-paren-in-anchor-display` A=11 of 214,
`doubled-space-as-text-loss-locator` A=18 of 108,
`unnumbered-terminal-homograph` A=3 of 129,
`ascii-quote-as-gershayim-in-body` A=80 of 1,234.

**Against that, exactly one genuinely letter-skewed shape emerged.**
Letter R found `bracketed-gloss-lead-sense` — an unnumbered first sense
whose entire definition is a bracketed etymological gloss ahead of a
correct `1)` — at 49 corpus-wide with **zero instances in letter A**.
Re-measured: 49 entries, A=0. Exact.

Two smaller letter facts point the same way: OCR `l)` markers appear in
R but not at all in A, so the standing assumption that class 3 is a
letter-A artifact is **backwards**; and the printed sub-section
superscript exists only in T, U and V (182 instances, zero in A–S), so
letter-A sweeps *could not* have caught `midrash-subsection-link-drift`
— the linker supplied unverifiable sub-sections on 5,526 citations
across every letter, including 434 in A, and A has no superscripts to
check them against.

### What this means for the 57 already-accepted chunks

Stated plainly: **the 57 already-accepted chunks cannot be treated as
done.** They were accepted against a catalogue built almost entirely
from letter A, and round 1 has just shown that catalogue was
substantially incomplete for letter A itself. The evidence is not
inference — four independent letters ran the test and four independent
letters found their "new" patterns sitting unremarked in already-swept
A entries.

Two distinct failure modes, and they need different responses:

1. **Under-detection (the large majority).** The pattern is in A, the A
   sweeps walked past it. Cheap to remedy: these are pattern classes, so
   re-checking is a corpus-wide script run against the new rows, not a
   re-sweep. No agent time.
2. **Structural blindness (the minority, and the expensive one).** A
   *cannot* exhibit the evidence — `bracketed-gloss-lead-sense` (A=0),
   the T/U/V superscripts, `l)` OCR markers. No amount of re-checking A
   surfaces these; only breadth does.

The corollary for the programme is that the stratification's yield was
not letter variation. It was **evidence that the entire prior sweep was
under-detecting**, and that per-entry sweeping was the wrong instrument
throughout: 62 of the 69 new rows are corpus-wide classes with a
deterministic or table-driven fix, several of them — `homograph-collapse-link`
at 1,132 of 1,132, `targum-sheni-never-linked` at 384 of 384,
`prefixed-geresh-abbrev-mislink` at 183 of 185 — with no judgement
component at all.

Round 1 also confirmed several catalogue entries are badly mis-sized:
in-sense class 10 is described as low-volume (pilot: 2 entries) and is
actually 465 entries; class 12's duplicated run is described as "low
volume" and is 166; class 11 is described as "low expected volume" and
ran at 17% of entries in H, 5 of 30 in K, 8 of 30 in U, and 5 of 8
escalations in Q.

## 6. Saturation

`SATURATION_ROUNDS = 2`. `isSaturated(rows, round)` is true when no row
carries `round > round − 2`.

```
isSaturated(rows, 1) === false
```

False, and necessarily so: round 1 added 69 rows.

**What round 2 must clear.** Because the predicate looks back two
rounds, a clean round 2 is not by itself sufficient — at round 2 the
cutoff is 0 and the 69 round-1 rows still fail it, so
`isSaturated(rows, 2)` is `false` regardless of what round 2 finds. The
earliest saturation can be declared is **after round 3**, and it
requires **round 2 and round 3 to each add zero new pattern rows**.

Concretely, round 2 must:

1. **Add nothing new** — and be broad enough that adding nothing is
   informative. Round 1 swept 660 entries and yielded 69 rows, so round
   2 is not credible at round 1's breadth.
2. **Land the detector calibrations first** (§4). Round 1's sweeps were
   structurally blind to `geresh-letter-numeral-mislink` (608 entries),
   to unvocalized homograph collapse (2,957), and to every Hebrew-side
   OCR confusion. A round 2 run on the same detector would find nothing
   new for the wrong reason and would falsely advance saturation.
3. **Size `alt-headword-collision`**, catalogued at `corpusCount: 0` —
   the one row with a mechanism and no measurement.
4. **Get the maintainer ruling on `etymology-head-pseudo-sense`**
   (1,553 entries) — three chunks split on whether it is a defect or a
   print convention, and the row cannot be slated either way until that
   is settled.
5. **Re-run the round-1 negative results with pre-anchor context
   included** (§2). `targum-cite-to-plain-bible` was wrongly recorded as
   non-reproducing by a display-side probe and is a real 43-entry class;
   every other negative result reached the same way is unproven.
6. **Run the new rows against the 57 already-accepted chunks** (§5) —
   as scripts, not sweeps.

## Changelog

| Date | Change |
|------|--------|
| 2026-08-18 | Round 1 consolidated. 22 chunks / 660 entries swept; 98 candidates merged to 69 catalogue rows (62 candidate, 7 discarded); both recorded conflicts settled by re-measurement; four detector calibrations recorded; letter-behaviour finding recorded against the 57 already-accepted chunks. `isSaturated(rows, 1) === false` |
| 2026-08-18 | Review fixes: `targum-cite-to-plain-bible` restored (43 entries) after its non-reproduction was traced to a display-side probe that could not see `Targ.` outside the anchor — generalised in §2 as a hole in every display-side negative result; `italic-lone-punctuation` restated as its 29-occurrence non-em-dash residue after its 230 em-dash instances were found to be a complete subset of `em-dash-section-break-in-own-italic`; em-dash merge rationale re-grounded on the rendered-text measurement (230/226, matching chunk-00947) rather than the tagged string; count caveat added to `neighbor-rid-mislink` |
