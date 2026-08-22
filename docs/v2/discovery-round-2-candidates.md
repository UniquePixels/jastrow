# Discovery round 2 — candidates (detector calibrated before this round)

## chunk-00127 (letter B, B00323-B00352)
*** VALIDATES ROUND 1's OWN GENERALISATION ***
- post-anchor-numeral-mismatch — a Roman homograph numeral sits
  immediately AFTER </a> (outside the anchor) and names an existing
  headword different from the anchor's data-ref target, e.g.
  `<a data-ref="Jastrow, בּוּר 1">בּוֹר</a> II` where `בּוּר II` exists —
  95 anchors / 91 entries (letter-A: 4). The catalogued
  homograph-numeral-mismatch (538) is defined DISPLAY-SIDE ("display
  ends in a Roman numeral"); measured entry overlap is 3 of 91, so 88
  entries are invisible to it. This is precisely the hole round 1's §2
  generalisation predicted. CONFIRMS round-1 negative results reached
  by display-side probes must be re-run with post-anchor context.
- mekhilta-sifra-never-linked — missing-work-mapping family, same shape
  as catalogued targum-sheni-never-linked. Sifra 610 occ / 538 entries
  (A: 16), 0 anchored. `Mekh.` 432 occ / 385 entries (A: 19), 1
  anchored. CONTROL within the family: `Sifré` is 580 of 645 anchored
  (90%) via Sifrei Devarim/Bamidbar. `Mekhilta d'Rabbi Yishmael`
  appears as a data-ref work exactly ONCE corpus-wide; no `Sifra` work
  name appears at all.
Negative results (tested, discarded): dangling `v.` tail collapses to 2
  entries once q. v./s. v. excluded; dangling `a.` tail 8 entries,
  heterogeneous, inside citation-tail-truncation's family.
Confirmations: preced./next w./next art. 8 of 8 correct here — only
  `same` drifts, confirming same-anchor-positional-mislink's scoping.

## chunk-00284 (letter F, F00077-F00106)
- alt-headword-collision-link — a display form that is entry B's
  attested alt_headword AND entry A's headword; the linker resolves
  only against headwords so the reference lands on homonym A. NOT the
  catalogued homograph classes (cases where another entry shares the
  display's skeleton AS A HEADWORD are excluded by construction).
  1,613 at-risk / 1,268 hosts broad; 187 / 162 hosts once corroborated
  by citation overlap; 15 / 15 after excluding redirect-stub targets.
  Letter-A rids present at every tightening level. (Sizes letter O's
  round-1 alt-headword-collision, which sat at corpusCount 0.)
- label-period-outside-italic — `<i>Af</i>.` where the corpus writes
  `<i>Af.</i>` — 668 occ / 608 entries (27 in A) vs 1,719 period-inside.
  INVERSE of catalogued italic-swallowed-terminal-period; dedupe.
- corrigendum-reading-linked — a reading the text explicitly marks as an
  error is nonetheless hyperlinked, asserting a lexical identity the
  text denies — 356 anchors followed by `(corr. acc.)` / 330 entries
  (38 in A), plus 21 preceded by incorr./corrupt. Defect status is a
  maintainer call but it is uniform linker behaviour and explains a
  family of otherwise-ambiguous class-11 judgments.

## chunk-00305 (letter G, G00589-G00618)
- gender-pair-headword-line-collapse — an Aramaic adjective whose print
  headword line reads `X, Xָא m., Xְתָּא f.` stores the masculine
  emphatic TWICE in alt_headwords and captures the TRAILING feminine
  label as the whole entry's content.morphology — so a masculine
  adjective is labelled `f.` and `m.` is lost. 22 entries carry an
  exact-duplicate alt_headwords string; 21 of the 22 also have
  morphology == "f.". Two sub-shapes: 17 m./f. pair collapse, 5
  `abbrev, full, abbrev` repetition. Letter-A included (A00648 is the
  canonical instance). Neither the catalogued refs-duplicate rows nor
  gender-label-in-definition covers it — different array PLUS a wrong
  value written into morphology.
- plural_form duplicated value — 93 entries (A included, e.g. A01508);
  distinct from the catalogued empty-slot and h.-text/roman debris rows.
Rejected on evidence: broad `morphology == "f."` on masculine headwords
  (91 hits, overwhelmingly genuine feminines — only the duplicate-alt
  subset is real); italic run split at a semicolon (18x, renders
  identically); rare `Sifré Num. s. N` (4x vs 186x but attested).

## chunk-00182 (letter C, C00574-C00603)
- translit-italic-space-loss — a Latin token abutting an `<i>` that
  opens a transliterated foreign word, separating space lost, renders
  `Arab.ġaḥama` / `IHif.` — 15 occ / 15 entries. *** ZERO letter-A rids
  — the second genuinely letter-specific shape found (after round 1's
  bracketed-gloss-lead-sense). *** Disjoint from the catalogued
  `)<i>` (66), `</a><i>` (111), `</i>(` (95) loci; residual overlap
  risk only with the vaguely-named "gloss/fused space loss".
AGENT'S OWN SATURATION READ: "this chunk produced exactly one genuinely
  new shape, a 15-instance class whose only claim to novelty is that it
  never occurs in letter A. Everything else maps onto the 80."
Rejected with strong evidence: Roman-numeral transposition in citations
  — 38,006 display-vs-data-ref comparisons, ZERO mismatches after
  excluding the catalogued sub-section drift; href != data-ref across
  170,180 anchors reduces entirely to catalogued shapes; `<b>` wrapping
  a lone comma (20 entries, the <b> twin of italic-lone-punctuation);
  `<sub>` OCR debris (2 instances).

## chunk-00222 (letter D, D00341-D00370)
- orphan-gloss-seam-period — a second standalone period between a
  completed gloss and the first citation anchor (`gloss</i>. . <a>`) —
  56 total `. . ` occurrences, 37 are the catalogued lost-`(h.` residue,
  the remaining 19 are this clean seam shape. Letter A carries 6 of 19.
  The 37-strong sibling family suggests the orphan period MARKS dropped
  text rather than being stray.
- latin-prose-ocr-substitution — single-letter OCR substitution inside
  ENGLISH gloss prose (not Hebrew, not a citation abbrev): token
  occurring <=2x one substitution from a frequent English word —
  25 tokens / 28 occ / 28 entries under a tight filter (`kalled`,
  `persou`, `objeot`, `synogogue`, `iearned`, `frought`); loosening
  yields ~260, so 28 is a FLOOR. Letter A present (A00740, A02379,
  A03327, A01351). Distinct from quotes-OCR-one-for-I (quotes field
  only) and gloss/fused-space-loss (spacing not glyphs).
  *** This is the ENGLISH-side analogue of the Hebrew rule just added
  in calibration — the detector has no English prose frequency check
  either. ***
Rejected: `</a>—` without period (35 vs 3,569, heterogeneous);
  alt_headword absent from entry text (normal — print headword line);
  proclitic-swallowed link (84 raw hits but indistinguishable from
  ordinary defective pointing).
Note: starred/unstarred homograph collision (`X` and `*X` both existing
  with the same numeral, 23 pairs) is the mechanical CAUSE of two
  class-11 escalations here — worth a note when homograph-numbering-
  schism is scripted.

## chunk-00067 (letter A, A01980-A02009)
*** WORD-ORDER CORRUPTION — NOTHING IN THE CATALOGUE TOUCHES IT ***
- reversed-hebrew-phrase — a short bare-Hebrew phrase stored with its
  words in REVERSE of the corpus's order (bidi/visual-order extraction
  artifact). Two independent counts: (a) 20 two-word runs whose
  reversed bigram is attested >=5x while the stored order is <=1x
  (A00888 stores `התורה מן` where the corpus writes `מן התורה` 15x;
  K00761 `וכ׳ הוא` vs `הוא וכ׳` 35x) — 3 letter-A rids; (b) higher
  precision: 27 runs BEGINNING with `וכ׳` ("et cetera", which can only
  trail) against 17,125 that end with it — 5 letter-A rids.
  CORROBORATED INDEPENDENTLY by quotes[], which mirrors the inverted
  body order (A00172, A00188).
- empty-lead-sense — content.senses[0] is an object with NO KEYS at all
  (`{}`) — 73 entries, every one at path 0, across 19 letters, 4 in A;
  plus 12 whose only key is an empty-string definition. Distinct from
  the catalogued empty-stem-section (those 347 carry a grammar block;
  these carry nothing).
- abbrev-fused-headword — the headword field is `<geresh-abbrev>
  <lemma>`, print's abbreviated second form hoisted AHEAD of the lemma
  instead of into alt_headwords — 7 corpus-wide, 1 in A (A02002). In
  all 7, prev_hw/next_hw alphabetize by the SECOND token, proving the
  abbreviation is prefix debris.
Quantified, not new: unclosed `(b. h.` etymology parens — 462 entries
  with a net unclosed open paren, 246 containing `(b. h.`, 72 in A.
Rejected: root anchors resolving to particle entries (1 of 74);
  language_code carrying an anchor (35, legitimate convention);
  duplicate sibling sense numbers (0); quotes[] text absent from body
  (158 of 324, but the mechanism is by-design `א׳` expansion).

## chunk-00255 (letter E, E00167-E00196)
- shuruk-as-yod-display-corruption — an anchor's Hebrew display writes
  `יּ` (yod+dagesh) where the word AND its correctly-resolved target
  have `וּ` (shuruk). The LINK IS RIGHT; only the rendered text is
  wrong, so it is invisible to every link-target check and surfaces
  under one-consonant-diverge misleadingly labelled a mislink —
  12 corpus-wide across 8 letters. ZERO letter-A rids (third
  genuinely letter-absent shape). Deterministically script-fixable:
  substitute `יּ`->`וּ` only where the result equals the anchor's own
  target headword.
- unterminated-href-swallows-closing-tag — an `<a>` whose href value is
  missing its closing quote, so the following `</a>` (and in one case
  the next anchor's opening tag) is absorbed into the attribute;
  data-ref is lost and the cross-reference destroyed — 2 corpus-wide
  (D00478, J00597). Distinct from the catalogued ASCII-gershayim
  attribute break: trigger is a MISSING QUOTE, not a `"` in the text.
NEGATIVE RESULTS, measured (keeps the saturation test auditable):
  * unlinked JT citations 3,785 vs 10,950 linked — linker COVERAGE gap,
    not corrupted data; not the phantom-refs shape either
  * unlinked positional cross-refs (`v. preced.` as plain text) 275 —
    same family as catalogued unlinked `v. <span>`, display is English
  * constr. form disagreeing with headword — 227 spans, 80 one-letter
    mismatches, 78 legitimate construct endings, real residue n=1
  * fragment+ellipsis RTL spans 249 — Jastrow's print abbreviation
    convention, confirmed in context
  * MARKUP INTEGRITY (clean negatives): across all 164,806 anchors href
    and data-ref agree in EVERY case; tag balance perfect in every
    definition and non-sense field except J00597; zero empty anchors;
    zero final-form Hebrew letters mid-word

## chunk-00481 (letter L, L00143-L00172)
- stem-head-marker-chop — a stem-section's sense `1)` ends with a bare
  chopped `—N)` marker and nothing after it, its text stranded in the
  next UNNUMBERED sibling — 18 corpus-wide and PERFECTLY UNIFORM: all
  18 have number=="1)", all 18 are followed by a sibling with
  number==null and a definition; 17 of 18 share the byte shape
  `<a>same</a>[,;] v. supra.—N) `. Letter A included (A01509); also
  P00816, which sits in the doc-08 folded/undecided implied-one list.
  Not among the 80 — trailing-em-dash-tail (130) covers definitions
  ending in a BARE em-dash, which these do not.
- citation-quote-seam-period — a spurious `.` between a citation anchor
  and the dir=rtl quotation it introduces — 44 occ / 43 entries against
  33,168 clean seams (0.13%). 6 letter-A entries. Distinct from
  spurious-name-period (19, dotted citation NAME) and
  italic-swallowed-terminal-period.
- EXTENSION not new: markup-hidden doubled space — `\s<i>\sX` puts a
  space both before and inside the opening italic, rendering a doubled
  space the literal probe CANNOT SEE — 92 entries (15 in A) versus 107
  for the catalogued literal doubled-space locator. NEARLY DOUBLES that
  pattern's size; flag as under-measurement, not a new class.
Rejected: niqqud-superset displays (1,177 occ but dominated by
  legitimately unpointed target headwords — noise).

## chunk-00391 (letter I, I00513-I00542)
- vkh-geresh-loss — the ubiquitous abbreviation `וכ׳` written bare as
  `וכ`, geresh dropped — 11 occ / 11 entries against 17,254 correct.
  NO letter-A rids. A generalised probe over all >=2-letter geresh
  abbreviations with >=200 corpus occurrences found `וכ` the ONLY
  clean signal (the other candidates `אפי`/`בק` are real words).
- tosefta-variant-chapter-halakha-loss — a Tosefta citation whose
  display carries a parenthetical variant chapter (`Tosef. Par. II (I),
  2`) NEVER resolves its halakha correctly: of 32 such anchors, 20 get
  a chapter-only data-ref (halakha silently dropped) and the other 12
  get a halakha DISAGREEING with the display. CONTROL: of Tosefta
  displays WITHOUT the parenthetical, 0 of 3,618 lose a halakha. No
  letter-A rids among the 20. Distinct from the Midrash-specific
  catalogued drift rows.
Rejected: Midrash/Psalms citation drift here (`Ruth R. to III, 13`->6:4,
  `Midr. Till. to Ps. XVIII, 11`->18:12) are legitimate section/verse
  numbering offsets.

## chunk-00311 (letter H, H00027-H00056)
- citation-number-truncated-outside-anchor — a citation anchor's display
  stops one digit short of the printed number, stranding the trailing
  digit(s) as bare text, and the data-ref resolves to the TRUNCATED
  number (`ib. <a>B. Kam. XI, 2</a>8` -> `Bava Kamma 11a`, print is
  Tosef. B. Kam. XI, 28) — 14 corpus-wide, 0 in letter A. Clustered on
  Tosef. Pes./Midr. Till. Distinct from the catalogued superscript-
  subsection-stranded (superscript, T/U/V only).
  *** FOURTH instance of the outside-the-anchor blindness family. ***
- plural-form-parenthesized-variant — where print writes
  `Pl. (VARIANT) MAIN`, plural_form[] captures the PARENTHESIZED
  variant and drops the main plural (אִשָּׁה gets נָשׁוֹת not נָשִׁים;
  אַתְּ gets תּוּן not אַתּוּן) — 22 entries, 7 in letter A.
- inflection-sublist-numbering-flattened — the lead sense ends with an
  inflection label and its form (`—Fem. חֲבִיבְתָּא`), and the `1)`/`—2)`
  senses enumerating THAT INFLECTED FORM sit as top-level siblings, so
  sense 1) reads as a sense of the headword — 3 corpus-wide (A00994,
  A01798, H00052), 2 in A. Not implied-one, not preamble-stranded.
- contentless-entry — entry retains headword and morphology but has
  ZERO definitional content anywhere and empty refs — 6 corpus-wide
  (A01175, A01345, H00049, P01112, Q00078, U00622), 2 in A. Adjacent to
  the already-raised empty-lead-sense but that shape presumes populated
  siblings; these have no content at all. DEDUP at consolidation.
Rejected: colon-for-semicolon between citations (1 of 1 corpus-wide).
Confirmed already modelled: H00033's Hebrew confusable OCR is caught by
  the recalibrated hebrew-rare-confusable rule — the calibration is
  doing its job.

## chunk-00466 (letter K, K01088-K01117) — *** NO NEW PATTERN ***
First round-2 chunk to report zero new systemic shapes. Everything
mechanical maps onto existing patterns.jsonl rows.
Four candidates raised and KILLED with corpus counts:
  1. OCR lowercase-l for Roman I in citations (`Y. Ned. lV`) — 6 genuine
     corpus-wide; other `ll` hits are legitimate "ll. cc.". Too rare.
  2. `Ib.` anchor collapsing onto the preceding anchor's exact segment —
     932 pairs loose, 173 refined. *** Agent flagged its OWN filter as
     suspect: "Letter-A test fails: 27 A entries loose, 0 A entries
     refined, which reads as my filter being the artifact, not a real
     A-absence." Residue is arguably already refs-phantom-items seen
     from the anchor side. Reported as a weak lead, not a pattern. ***
  3. Definition opening `" , "` at the language-field seam — 280
     corpus-wide, 51 in A, but the same shape as the catalogued
     lost-hebrew-after-h-marker; difference is only interpretation.
  4. CLEAN NEGATIVE: `next art.`/`preced. art.` anchors — all 100
     (25 next, 75 preced.) resolve to the truly adjacent entry, 0
     misdirected. (Sixth confirmation that only `same` drifts.)

## chunk-00575 (letter M, M02244-M02273)
- unmatched-opening-paren — entry-level surplus OPENING paren: the
  etymology parenthetical opens, is cut mid-list, never closes, gloss
  resumes inline. 462 entries corpus-wide (concat language_code +
  language_reference + morphology + all sense definitions, strip tags,
  count('(') > count(')')). *** Letter A: 72 of the 462 — present all
  along. *** Dominant sub-family: etymology truncated at a semicolon,
  `(b. h.;` + non-Hebrew => 163 entries, 21 in A (J00093 יָד
  "(b. h.; hand", M01523 מֶלַח, M00607, U00576, C01353).
  Distinctness argued vs. all four neighbours: #40 unmatched-closing-
  paren is the CLOSING direction on a definitions-only count; #45 is
  brackets; #68 lost-h-equivalent (32) has ZERO overlap with the 163;
  #71/#73 are the field-seam residues. Repair differs from #40: text
  is LOST (print check) vs. deleting a stray closer.
1 patch (M02261, nested identical <a> trapping a period, class 10).
Rejected with counts: cross-family homograph numeral resolution (2);
display-is-unvocalized-headword-but-target-vocalized (0); `Book.;<ROMAN>`
citation semicolon (8 hits, 2 genuine); Targ. Y. I/II never linked
(424/456 and 572/614 ARE linked — clean negative vs #25); partial
Hebrew vocalization (8,559 — undecidable by regex, not reportable).
NOTE: 67 corpus-wide data-refs point a geresh abbreviation of the host
headword at `Jastrow, מ׳ 1` = M00001, the article on Mem as numeral 40.

## chunk-00407 (letter J, J00076-J00105)
- bh-semicolon-open-etymology — 14 corpus-wide, 14 entries. Stranded
  unnumbered lead sense whose whole text ENDS at `(b. h.; ` — cognate
  and closing paren gone, AND the entry carries NO language_code /
  language_reference field at all: the field split that puts `(b. h.;`
  in language_code and ` <cognate>)` in language_reference failed
  outright and took the etymology's content with it. 13 of 14 also
  show whole-entry paren imbalance. Rids: A03254 אֵשׁ, J00093 יָד,
  K00084, K00941, L00705, M00602, M02796, N00004, O00218, O01374,
  P01503, Q01947, S01505, U01556. Letter A confirmed (A03254).
  Distinctness argued vs #68 lost-h-equivalent (keys on `(h.` — none
  of the 14 contain that substring), #71, #73 (opposite failure: split
  happened, in the wrong place), and etymology-head-pseudo-sense
  (structural stranding, not text loss).

  *** CONSOLIDATION FLAG — OVERLAPS chunk-00575's unmatched-opening-
  paren. J00093 יָד is cited BY BOTH: 00575 names it in its 163-entry
  `(b. h.;`-truncated sub-family, 00407 names it in these 14. The 14
  is very likely a strict subset — the members that ALSO lost their
  language fields entirely. Two agents reached the same shape from
  opposite directions (paren-balance arithmetic vs. missing-field
  signature), which is corroboration, not duplication. Resolve at
  consolidation: probably ONE row with the field-loss variant as a
  sub-family, not two rows. ***
0 patches. Every finding class 8 (needs a byte the entry lacks) or
class 11 (href bytes absent).
Rejected with counts: `ib.`-anchor chain break (built an abbrev->work
map from 215 abbreviations with >=20 linked occurrences and >=80%
agreement; raw 103, but only 2 survive removing the catalogued
ib-yoma-2a sink and the Y.-tractate Yerushalmi/Bavli conflation);
variant-reading form in `(ed. …)` linked away (11, all inside
plural-inflection-anchor-escapes-entry / homograph-collapse-link);
display=host skeleton, target skeleton differs (69, restates
interior-consonant-mislink); Hebrew ד↔ר/ו↔י in vocalized quote tokens
(already the recalibrated hebrew-rare-confusable kind — known, not new);
CLEAN NEGATIVE `D. S. a. l. note` without a number (bare 629 vs
numbered 637 — a real convention, not truncation); `same`/`preced.`
positional anchors (all 6 resolve).
NOTE: J00103 `י׳` abbreviating the host headword -> J00001, the numeral
article "ten" — SAME shape as 00575's מ׳ -> M00001 (67 corpus-wide).
Cross-letter confirmation of the numeral-article sink.

## chunk-00609 (letter N, N00152-N00181)
- geresh-abbrev-space-loss — space lost immediately AFTER a geresh
  abbreviation mark inside Hebrew quotation text (`נ׳היא` for
  `נ׳ היא`). 23 occ / 22 entries, against a 26,566 control of
  geresh-followed-by-space. Letter A: 1 (A01923) — present, but only
  just. Disjoint from all catalogued space-loss rows (gloss-space-loss
  is English bigrams; anchor-italic-no-space / italic-close-paren-
  nospace / paren-tag-no-space are TAG seams) and from r2's
  translit-italic-space-loss. Deterministically script-fixable.
- non-binyan-verbal-stem-label — grammar.verbal_stem holding something
  that is not a binyan name at all. 26 occ / 26 entries BEYOND the
  catalogued asterisk-stem-label (43, literally `*.`), in four
  mechanically distinct sub-shapes: (a) punctuation-only debris, stem
  name entirely lost — `[.` x6, `,.`, `.`, `[[.`, `(.`, `* .` = 11;
  (b) a non-binyan PRINT SECTION HEAD read as a stem — `Compounds and
  combinations: .` (A00172), `Chief compounds:.` (B00753),
  `Compounds: .` (B01055), `Compounds of .` (B01377), plus inflection
  labels `Fem.` (B01154), `Pl.` (V00600), `Part. Hof.` (B00178),
  `Pa., part. pass.` (I00618), `נִסְתַּר.` (O01711) = 9;
  (c) asterisk-prefixed but stem RETAINED — `*Pa.`, `*Nif.`, `*Ithpe.`
  = 3 (extends the catalogued row); (d) stem plus stray period = 3.
  Letter A: 5. All 26 blocks carry a real binyan_form and real child
  content => structure genuinely mislabelled, not cosmetic.
  *** Total non-binyan verbal_stem corpus-wide is 69, not 43. ***
- common-gender-inexpressible — *** CHALLENGES A DISCARDED ROW'S
  REASONING. *** content.morphology has a CLOSED 9-value vocabulary
  corpus-wide (None 19,350; m. 6,970; f. 4,175; m. pl. 629; pr. n. m.
  534; pr. n. pl. 432; f. pl. 193; pr. n. 173; pr. n. f. 56 — sums to
  exactly 32,512). `c.` DOES NOT OCCUR ONCE. Yet 228 entries with no
  morphology open their lead definition with the common-gender label
  `c.` (A00617, A00654, A00873, N00154 …), 17 in letter A.
  gender-in-definition is status:discarded on the reasoning that
  grammar.gender is "a separate typed index seeded from the 13,162
  content.morphology markers" — that seed CANNOT recover common gender
  for these 228, because the field never expresses it. Same
  INEXPRESSIBILITY mechanism round 1 named in homograph-numbering-
  schism. The m./f./pl. leaks ARE recoverable (190 f., 128 m., 32 pl.
  in the same lead position), so the discard reasoning holds for them
  and not for `c.`. Agent stated the overlap caveat plainly:
  gender-in-definition's 710 entries very likely already CONTAIN these
  228 — the new claim is about the FIELD VOCABULARY, not the locus.
  ACTION AT CONSOLIDATION: re-open the gender-in-definition discard
  for the `c.` subset only.
1 patch (N00165, class 10 nested identical <a> trapping a period).
Both niqqud-twin-target hints ACCEPTED; N00157 is the strongest: text
reads "(v. נְגִיד I, 3)" but target N00152 has ONE sense glossed
"leader, ruler", while N00154 carries sense 3 "(with רוּחָא) long-
suffering, forbearing" — section number AND gloss match verbatim.
Rejected with counts: spurious `. &c.` (48 vs 6,835 clean, dominated by
legitimate abbreviation-final periods R. &c. / Ms. H., Oxf. &c.);
`</span>. <lowercase>` quote/translation seam period (20 raw, 7 survive
an abbreviation filter, heterogeneous); anchors with empty/missing
refs[] (31, subsumed by dataref-not-in-refs 20,298); final ה/א display-
vs-target divergence (verified LEGITIMATE — attested alt_headwords,
single-skeleton, niqqud carve-out applies).

## chunk-00682 (letter O, O00942-O00971) — NO NEW CLASS
Second chunk to report no genuinely new shape. One EXTENSION only:
- stranded-stem-head-anchor-escape — EXTENSION of catalogued
  binyan-head-form-mislinked (65), NOT a new row. An
  `<i>Stem.</i> <a>FORM</a>` head anchor whose data-ref matches neither
  host nor display resolves to a DIFFERENT ROOT: 137 anchors / 127
  entries, all 22 letters, 7 in A — ~2.1x the catalogued 65. Examples:
  בָּהַר `בִּיהֵר`->בָּהַל, בָּשַׁל `נִתְבַּשֵּׁל`->בָּשַׂר, דָּרַם `הִדְרִים`->דָּמַם, אֲחַד `אָחֵיד`->חוּד.
  (a) The target sits ONE CONSONANT from the HOST headword in 103 of
      137 => the linker is matching the HOST's root letters loosely and
      landing on a neighbouring root, not resolving the displayed form.
  (b) *** STRUCTURAL BLINDNESS, 3rd distinct mechanism: 0 of 205
      escaping stem-head displays appear in the entry's plural_form /
      alt_headwords / binyan_form. Because the stem head is stranded in
      DEFINITION TEXT (catalogued stranded-stem-head, 544), the form was
      never captured into binyan_form[], so plural-inflection-anchor-
      escapes-entry (2,281) is structurally blind to every one of them.
      Cf. the outside-the-anchor family: a probe is blind whenever the
      evidence never reaches the field the probe reads. ***
  Control: 76 anchors / 73 entries where the stem form HAS its own
  headword entry and the link goes there — correct, excluded.
MEASURED NEGATIVES (valuable, keep for Phase 2):
- *** prev_hw/next_hw chain integrity: PERFECT. 0 prev mismatches,
  0 next mismatches over all 32,512 entries, 0 rid numeric gaps. The
  naive file-order check reports 133 "mismatches" — purely JSONL row
  interleaving between letter blocks, NOT data defects. ***
- Two-hop / mutual redirect-stub loops: 19 corpus-wide, ALL 19 already
  circular-v-ref; mutual A<->B loops between distinct entries: 0.
- Character-class debris negligible corpus-wide: 3 HTML entities (all
  `&c;`), 5 tabs, 1 NBSP, 7 ZWNJ.
- Top-level numbering: only 28 of 3,138 multi-numbered entries have a
  sequence that is not 1..n (2 in A) — scale figure for classes 2/4.
- quotes[] empty in 32,211 of 32,512 (99.1%) — population fact.
1 patch (O00944, duplicate-anchor-wrap). 73 anchors compared, 4 class-11
escalations. O00953 `ס׳` -> O00001 samekh-as-sixty: THIRD letter
confirming the numeral-article sink; agent identifies its catalogued
home as geresh-letter-numeral-mislink (608), which absorbs 00575's מ׳
note and 00407's י׳ note.

## chunk-01049 (letter V, V00050-V00079)
- roman-numeral-stranded-in-definition — 17 corpus-wide, 0 in A. A
  homograph's Roman numeral was stripped out of the HEADWORD and left
  as the opening token of its first DEFINITION (U01570 headword שָׁנָה,
  definition " I, v. שני"). 13 of 17 have numbered homograph siblings,
  so the entry becomes UNADDRESSABLE and anchors naming it fall
  through: *** all 3 corpus anchors displaying a stranded-numeral
  homograph mis-resolve *** (שָׁנָה I -> שָׁנָה II at Q02021, U01568,
  V00072). Distinct from homograph-numbering-schism (3,421 —
  superscript family, numeral NEVER expressed), unnumbered-terminal-
  homograph (129 — LAST member loses its numeral), latin-token-inside-
  rtl-span (130 — different locus). Here the numeral SURVIVES verbatim
  one field away => the only member of this family that is
  deterministically script-repairable. Clustered in U and V (11 of 17).
- stacked-impossible-niqqud — 93 occ / 59 entries, 0 in A. One
  consonant carrying TWO vowel points (dagesh and shin/sin dots
  excluded) — orthographically impossible. Two sub-families: ~18 occ /
  13 entries are Jastrow's notarikon dot-above marker mis-encoded as
  holam (V00077 שַֹׁבָּת, חוֹבָֹה); rest is OCR. Cleanest slice: 34 occ / 19
  entries in a VAV environment (גּווָֹן, לווִֹין, הוֶֹה, צוְֹחִין) where a mater's
  holam landed on an already-pointed base. Reaches lookup-critical
  fields: D00208 headword, D00173 alt_headwords, L00247 + V00071
  plural_form. initial-niqqud-drop (76) is the OPPOSITE failure.
  Letter-A absence checked for artifact: A is 10.6% of corpus, so
  0 of 59 is ~0.2% under uniformity — statistically real.
1 patch (V00054, class 7 anchor-boundary-markup). 86 anchors compared;
9 class-11 mislinks in 8 entries, *** 5 of them UNHINTED *** — the
mandatory v4 display-vs-data-ref check earned its keep. V00072
שְׁבָרִים->שֶׁמֶר is contradicted by its OWN neighbour `(v. שֶׁבֶר I)`.
Rejected with counts: cognate-anchor mislink `= h. <a>X</a>` skeleton
divergence (51 of 712, overwhelmingly legitimate plene/defective and
root-lemma pairs; genuine residue reduces to catalogued rows).
Corroborations (not re-reported): 00391's tosefta-variant-chapter-
halakha-loss confirmed in letter V; 00127's mekhilta-sifra-never-linked
confirmed (V00057 Sifra Emor unlinked).

## chunk-00883 (letter S/ק, S00662-S00691)
- holam-migrated-off-mater-vav — *** STRONGEST ROUND-2 FINDING. *** The
  holam of a holam male is attached to the consonant PRECEDING the
  mater vav instead of to the vav: corpus stores <letter, dagesh,
  holam> + bare ו where it should store <letter, dagesh> + <ו, holam>.
  Renders the dot over the WRONG letter and breaks any exact-string
  lookup. 558 occ / 308 entries, *** 111 of them letter A *** —
  present all along. Headwords alone: 106 occ / 103 entries (43 in A)
  against 4,395 correctly-encoded holam-male headwords; body/arrays 452
  occ against 20,475 correct. TWO INDEPENDENT CONTROLS kill the
  "encoding convention" reading:
    (a) 10 headwords carry BOTH encodings in ONE string — A02608
        אָפֹּובַּלְסְמוֹן is wrong on פֹּו and right on מוֹן (also A01291, A01403,
        A01542, A01548, A02617, A02632, C01094, Q01646, Q01652);
    (b) 56 of the 103 bad headwords have their CORRECTED spelling
        attested verbatim elsewhere in the corpus (אַלֹּון->אַלּוֹן,
        אִישֹׁון->אִישׁוֹן).
  A preceding dagesh raises the failure rate ~20x (87/860 vs 19/3,647)
  but is not deterministic. Deterministically script-fixable: move
  U+05B9 one unit right onto the bare vav. Nothing in patterns.jsonl
  touches vowel-point PLACEMENT (initial-niqqud-drop is a LOST point,
  not a migrated one).
- plural-form-holds-idiom-phrase — a plural_form[] slot holds a
  multi-word Hebrew idiom/citation phrase rather than a plural. S00677
  stores ['קוֹתְלֵי', 'ק׳ דחזירי'] where print reads ", pl. קוֹתְלֵי; ק׳ דחזירי
  bacon". 91 slots / 90 entries, 4 in A (A00027, A01906, A02252,
  A03230). Disjoint by construction from plural-form-roman-numeral-
  debris (no Latin chars) and plural-form-holds-gloss-text (no "h.
  text"), and from 00305's duplicated-value row.
0 patches. All 3 hints accepted.
Rejected with evidence: verb entry carrying nominal morphology (24
corpus-wide, but 20 collapse into unmatched-opening-paren or
bracketed-gloss-lead-sense).
*** DETECTOR CALIBRATION NOTE: bare `a` for conjunction `a.` — 13
corpus-wide (a Ms. 2, a fr. 8, a e. 3) against 17,183 correct. Too
small for a pattern row, BUT no bare-abbrev hint fired on S00670, so
that rule appears not to cover the conjunction `a.`. Feed to Phase 2. ***

## chunk-00720 (letter P, P00361-P00390) — recovered via resume
- stacked-vowel-point — *** DUPLICATE OF chunk-01049's stacked-
  impossible-niqqud. MERGE AT CONSOLIDATION. *** One consonant carrying
  two full vowel points, which no Hebrew pointing permits. 68 occ / 47
  entries across 17 letters, ZERO letter-A rids (p~=0.007 under a flat
  10% prior). Counts differ from 01049's 93/59 ONLY because the
  exclusion sets differ: 00720 excludes shva/hataf/meteg/dagesh/shin
  dots; 01049 excludes dagesh and shin/sin dots. BOTH cite the same
  vav-environment core and BOTH name L00247 (לווִֹין / לווֶֹה). Two agents
  in different letters (P and V), neither able to see the other, landed
  on one shape — corroboration. Consolidation must pick ONE exclusion
  set and re-measure; do not carry two rows.
  00720's extra detail: 59 of 68 involve a stray holam U+05B9; 9 are a
  DOUBLED IDENTICAL holam (שָׁווֹֹת, לָמוֹֹד, מַשּוֹֹא); consonant is ו in 33 of
  68. 57 occ in definitions, 5 in headwords, 2 each in alt_headwords,
  plural_form, language_reference.
  *** Repair is NOT deterministic (you cannot know which of the two
  points was intended) => this is a needs_print_check GENERATOR, not a
  script fix. Note this contradicts nothing in 01049, which did not
  make a repairability claim. ***
- impossible-dagesh — GENUINELY NEW, distinct from the above. A dagesh
  on a letter that cannot take one. 19 occ / 17 entries, *** letter A
  PRESENT *** (A01756 כרּז, A02180 אַנְטַרְרּוֹס). Splits ר 15 / ח 4; א and ע
  yield ZERO, so the signal is clean.
    - The ר subset is a ד/ר OCR confusion SELF-ANNOUNCED BY THE DAGESH:
      the dagesh forte belongs on a doubled ד. חִרּוּשׁ<-חִדּוּשׁ (H00666 x2),
      קִירּוּשׁ<-קִידּוּשׁ (U01543), סִירּוּק<-סִידּוּק (U00776, O00195),
      פַּנְרּוּרָה<-פַּנְדּוּרָה (Q01156), רַרּוּדֵי (T00232), צירּ (R00346).
    - The ח subset is a ה/ח confusion at word end where the MAPPIQ
      survives on the wrong letter: הִכְחִישָׁחּ<-הִכְחִישָׁהּ (K00469),
      טְבִיחָתָחּ<-טְבִיחָתָהּ (I00052).
  *** DETERMINISTICALLY script-fixable for the ר cases (ר+dagesh ->
  ד+dagesh). And the recalibrated hebrew-rare-confusable will only
  catch the subset whose corrected token clears its >=100x threshold —
  פַּנְדּוּרָה and סִידּוּק will NOT. So this rule earns its place beside the
  detector, not inside it. ***
0 patches — deliberate. The one repairable-LOOKING case (P00381, class
7 swallowed paren) is a SYMPTOM: print's "Tosef. ib. VII (V), 9" was
mis-split so halakha 9 rides the parenthetical VARIANT chapter
(Tosefta Gittin 5:9) while the main anchor drops its halakha (Tosefta
Gittin 7). A byte-conserving paren move would leave a bare Roman
display against a chapter:halakha target and would NOT fix the split.
Agent named the exact candidate replace in the escalation and left the
call to the maintainer. Correct restraint.
NOTE: P00390 `בן ע׳` -> *עָקוֹשׁ I whose alt_headwords holds `בֶּן ע׳`, the
only occurrence of that string corpus-wide — a textbook instance of
alt-headword-collision, the row still sitting at corpusCount 0.
NOTE: P00371 was NOT hinted (one-letter geresh forms are exempt from
the detector) yet its own alt_headwords is exactly ["עוֹ׳"]. Detector
calibration note for Phase 2.
Rejected with counts: variant-reading anchors escaping the host (2,751
occ / 2,360 entries under a `(Ms.|ed.|Ar.|Mss.` probe, but precision
collapses — Jastrow legitimately gives corrupt variant readings their
own entries and links them there; genuine residue already catalogued as
geresh-abbrev-fixed-sink 572 + inflection-abbrev-mislink 137. KILLED);
hapax-vocalization displays (523 anchors / 490 entries, dominated by
LEGITIMATE variant vocalizations אֱדֹם/אֱדוֹם, אָזַל/אֲזַל — this is exactly why
the agent narrowed to the structurally impossible subset); orphan
combining marks (18 occ, bulk are Jastrow's GRAMMAR ARTICLES discussing
a vowel sign in isolation — M00000, N00001, A01411. KILLED).
CLEAN POSITIVE worth recording given 38-64% rule precision: P00368's
unvocalized חסף -> חֲסַף I is CORRECT (חֲסַף I = "to peel off, scrape",
exactly the adze etymology).

## chunk-00841 (letter R/צ, R00222-R00251)
- binyan-form-leading-space — *** 100% UNIFORM. A PIPELINE BUG, NOT AN
  OCR DEFECT. *** Every non-empty grammar.binyan_form item AFTER index
  0 begins with a leading space: 523 of 523 (100.0%), across 457
  entries in ALL 22 letters, 23 in letter A (A00031
  ['אוֹבֵד',' אוֹבֵיד'], A00156, A00189, A00200, A00939…). Index 0 NEVER
  carries it; alt_headwords, plural_form, refs, verbal_stem, morphology
  are clean (0 hits each) => the fault is isolated to ONE SPLIT SITE.
  Not in patterns.jsonl (catalogued whitespace rows are trailing-
  whitespace-definition, href-raw-space, doubled-space-as-text-loss-
  locator and the tag-seam rows; none touches grammar arrays). Low
  severity, perfectly deterministic, script-fixable — and it breaks
  exact-match lookup of EVERY SECOND BINYAN FORM in the corpus.
  A 100% rate is the signature of a split-on-delimiter that never
  strips; this should be findable in the migration code directly.
- rabbi-name-linked-as-bible-book — 41/41 uniform, overlap DISCLOSED.
  `Lam. R. introd. (R. Josh. N)` — R. Josh. is Rabbi Joshua, whose
  proem opens Lamentations Rabbah — anchored to the BIBLICAL BOOK of
  Joshua: 41 anchors / 41 entries, 2 in A (A01350, A01989), +1 non-
  `(R. ` variant = 42. Of 72,257 Jastrow-and-citation anchors, EVERY
  anchor immediately following `R. ` that is not a Hebrew variant
  reading resolves to Joshua; no counterexample.
  Agent's own caveat: these sit inside the measurement envelope of
  catalogued midrash-section-cite-as-bible-chapter (255) — 289 such
  anchors / 261 entries corpus-wide. But the MECHANISM differs: that
  row's Exodus-95/Genesis-48/Leviticus-34 members are Tanhuma parashah
  citations (`Tanh. Mishp. 5` -> `Exodus 5`) whose repair is to
  RE-POINT at the midrash, whereas here a PERSONAL NAME was read as a
  book and the repair is to UNLINK. Name as a sub-mechanism; dedupe at
  consolidation.
- binyan_form empty slot — EXTENSION, not new. 486 empty-string slots /
  446 entries (12 in A): the binyan twin of catalogued plural-form-
  empty-slot (703). Flag as UNDER-MEASUREMENT of that row.
- bare `N)` after an em-dashed sibling — WEAK LEAD, reported as an
  under-measurement note on stranded-open-bracket (152), not a new
  class. 45 corpus-wide / 45 entries (5 in A); 26 of 45 are explained
  by the preceding sense ending `—[` — the marker's em-dash was
  ABSORBED into the stranded bracket, exactly the R00519 seed shape.
  19-instance residue unexplained.
1 patch (R00226, class 10). 5 hints judged, 4 accepted + R00248
inflection-escape-link accepted; *** 7 FURTHER class-11s found with NO
hint *** by the mandatory display-vs-data-ref pass.
NEGATIVES, MEASURED:
- *** prev_hw/next_hw chain PERFECT — 0 mismatches across all 32,512
  in rid order. SECOND INDEPENDENT CONFIRMATION (chunk-00682 got the
  same result, and both correctly identified the ~22-133 apparent
  breaks in FILE order as JSONL ordering artifacts). Treat as settled. ***
- Asterisk in refs CLEAN: 2,261 anchors / 2,097 entries carry Jastrow's
  unattested-form `*` inside data-ref/href (431 in A), but 0 of 72,257
  anchors name an unstarred form whose only headword is starred.
  Internally consistent, not a broken-link class.
- Mixed Roman/superscript homograph families: 36, all explained, 0 in A
  (the `²` is the pipeline's synthetic disambiguator => catalogued
  homograph-numbering-schism).
- Doubled cross-reference anchors (identical display AND data-ref): 16,
  0 in A; 12 are the `same, same` shape at stem-section heads.
- Adjacent identical Hebrew tokens `X, X`: 34 occ / 33 entries (16 in
  A) — dominated by LEGITIMATE prosthetic-aleph variant pairs
  (אִסְטֵיו, סְטֵיו). Rejected.
- Repeated adjacent English words: 207 occ / 196 entries — dominated by
  legitimate compounds ("thorn, thorn-bush", "white, white spot").
  Only `same, same` is a defect. Rejected.
- Headword-field character hygiene: outside Hebrew/niqqud/*/Roman/
  superscript, only 69 gershayim (real acronym headwords), 12 commas,
  10 parens, 2 `=`. Only 3 real cases. Not systemic.
- `המ׳` fixed sink: all 21 corpus occurrences target `Jastrow, הִימְנוֹן 1`
  — confirms catalogued geresh-abbrev-fixed-sink.

## chunk-00803 (letter Q, Q01300-Q01329)
- verse-paren-false-sense-split — a Bible chapter/verse or homograph
  cross-reference is cut mid-parenthetical and the CITATION'S OWN
  CLOSING PAREN is parsed as a sense marker, FABRICATING a sense
  boundary. Signature: previous sense's definition has a net-unclosed
  `(` and ends `<ROMAN>,`; the following sense's number is a BARE `N)`.
  13 corpus-wide / 13 entries; letter A present (A01002, A01429,
  A03104). Three discriminators, all airtight:
    (a) 0 of 13 carry `—N)` against 5,442 genuine `—N)` markers. Print
        NEVER puts an em-dash before a verse number => the all-bare
        distribution is the mechanism's fingerprint, not noise.
    (b) *** All 13 BALANCE PERFECTLY once the number field's `)` is
        counted. Decisive: NO TEXT WAS LOST, the paren simply MIGRATED
        INTO `number`. ***
    (c) Corroborated by numbering damage: C00244 reads `1) —2) 4)` —
        the false marker consumed the 4 and opened a phantom gap at 3.
  Examples: A01002 `(play on ahu, Gen. XLI,` + `2)`; A01429 `(play on
  Shulamith Cant. VII,` + `1)`; A03104 `(v. אֲרִיךְ II,` + `2)`.
  *** RE-PARTITIONS chunk-00575: 10 of the 13 sit inside the 462-entry
  unmatched-opening-paren population, but that candidate's reading is
  "text is LOST, needs print check". For these 10 that reading is
  WRONG — repair is STRUCTURAL (merge the false sense back, restoring
  `N)` as the citation's closing paren), no page consult needed. Carve
  them out at consolidation. ***
- sifre-ib-resolves-to-yalkut — small but airtight. `Sifré ib. N`
  resolves to `Yalkut Shimoni on Torah N`, reusing the section number
  under the WRONG WORK. 5 of 5 corpus-wide wrong (K00811, N00892,
  Q01325, T00064, V00301); 0 letter-A rids. Clean control: `Sifré
  Deut. N` -> Sifrei Devarim 397x, `Sifré Num. N` -> Sifrei Bamidbar
  182x, ALL correct — so the work IS mapped and only the `ib.` form
  misses. Distinct from catalogued ib-yoma-2a (312, fixed sink) and
  from 00127's mekhilta-sifra-never-linked (those are UNLINKED; these
  are linked to the WRONG work).
0 patches. All 11 hints judged.
*** DETECTOR FALSE POSITIVE WITH A GENERAL CAUSE: Q01327's
exact-headword-diverge (display מָרָא II -> Jastrow, מָר 1) is a CORRECT
link — מָרָא II is a recorded alt_headword of M02480 ("hoe, rake", fits
the host פַּסָּל "mattock"). The detector fired because the display's BARE
form מָרָא is separately a headword (M02481). THE ALT_HEADWORDS CARVE-OUT
MUST BE CHECKED BEFORE THE EXACT-HEADWORD RULE FIRES. Phase 2 fix. ***
Killed with counts: `Ps.` for `Pl.` (1 of 1 vs 236 italic Pl.);
comma inside opening paren `(,` (1 of 1); multiple plurals collapsed
into one slot (5-6); bare `N)` generally (180 across 168 vs 5,442 `—N)`
— decomposes into catalogued rows + the new shape, not a class itself);
`Ib./ib.` -> Yalkut (74, but 64 legitimate — only the 5 with an
explicit conflicting work name survive).
AGENT'S SATURATION READ: "one shape I would defend as new and one
5-instance shape. Two of my four raised leads died on corpus counts of
1. That reads as discovery being close to saturated, with the remaining
yield concentrated in RE-PARTITIONING already-catalogued populations
rather than in finding untouched shapes."

## chunk-00948 (letter T, T00313-T00342)
- plural-label-rendering-defeats-capture — *** NEW, AND IT EXPLAINS
  chunk-00803's UNEXPLAINED GAP. *** The plural_form extractor is keyed
  to the RENDERING of the plural label, not its meaning. Measured over
  all 32,512 entries — entries whose definition declares a plural
  (label followed within four markup tokens by a Hebrew letter),
  bucketed by label rendering, against empty/absent plural_form:
      plain `Pl. ` (canonical)  5,094 declaring   20 missing   0.4%
      plain `pl. `                958 declaring  266 missing  27.8%
      `<i>Pl.</i>`                 74 declaring   44 missing  59.5%
      `<i>pl</i>.`                 19 declaring   14 missing  73.7%
      `<i>Pl</i>.`                 15 declaring   13 missing  86.7%
      `<i>pl.</i>`                  1 declaring    1 missing   100%
  358 entries total lose their declared plurals; 338 (94%) sit behind a
  NON-CANONICAL label. *** The near-perfect canonical bucket is the
  INTERNAL CONTROL that makes label RENDERING, not semantics, the
  cause. *** Letter A: 42 of 358 (A00016 אֵב `pl. אִבִּין, אִיבִּין`, A00119,
  A00497, A00252, A00352, A00437 …). Failure shape: 90 entries have NO
  plural_form key at all, 268 have `[]`; ZERO have a blank-string slot,
  so overlap with catalogued plural-form-empty-slot (703) is NIL. Also
  disjoint from plural-form-roman-numeral-debris (64), plural-form-
  holds-gloss-text (14), 00305's duplicated value (93), plural-form-
  parenthesized-variant (22) — all of those are WRONG CONTENTS; this is
  NO CONTENTS AT ALL. Deterministically script-fixable: the plural
  forms are present verbatim in the definition text.
  *** CROSS-CHUNK RESOLUTION: chunk-00803 measured "plural labelled in
  print but absent from plural_form" at 73 entries and reported it
  honestly as "an unexplained extraction gap — I could not isolate a
  mechanism". THIS IS THE MECHANISM. 00803's 73 is a subset of this
  358 under a narrower probe. Merge: keep 00948's measurement and
  mechanism, credit 00803's independent detection. ***
- continuation-marker-em-dash-loss — small, reported honestly. Of 5,650
  continuation markers (`N)`, N>1, not first in sibling list), 5,440
  carry the em-dash. The 210 that do not decompose as: *** 62
  LEGITIMATELY continue a `;`/`,` run (print convention — a real
  finding that KILLS the naive version of this candidate) ***, 77 have
  the em-dash or `—[` stranded on the previous sibling (catalogued
  trailing-em-dash-tail 130 + stranded-open-bracket 152), leaving 71
  with NO residue at all — previous sibling ends in a period, em-dash
  simply gone. 20 in letter A. High-confidence core is the 16 sitting
  in a MIXED list where siblings DO carry em-dashes (A01047 `1) —2) 3)`,
  B00411 `1) —2) —3) 4)`, A00441, A00842, A03174, C01321; 4 in A) — an
  INTERNAL CONTROL PER ENTRY. Repairable in the closed grammar via
  retag. Not sense-number-outside-closed-grammar (111), which is about
  tokens OUTSIDE the grammar.
1 patch (T00334, class 10). T00329 is a genuine circular v. reference.
- *** THIRD INDEPENDENT CONFIRMATION: entry-sequence integrity PERFECT.
  Sorted by rid across all 32,512 — next_hw matches the following
  entry's headword and prev_hw the preceding one in EVERY case (0
  mismatches, asterisk-stripped), and rid numbering has ZERO gaps
  within every letter. Agrees with chunk-00682 and chunk-00841. SETTLED
  — no dropped, duplicated, or misordered entries on this axis. ***

## chunk-01013 (letter U, U01112-U01141) — LAST CHUNK
*** PRECISION CORRECTION TO A CATALOGUED ROW — THE BIGGEST SINGLE
RESULT OF ROUND 2. A SCRIPT BUILT TO THE CURRENT DEFINITION WOULD
CORRUPT THE CORPUS. ***
  same-anchor-positional-mislink (catalogued at 3,183) is measured ~6x
  too large. Agent counted 3,426 `same` anchors; EVERY ONE resolves to
  the immediately preceding entry (0 self-links, 20 elsewhere). But the
  population splits into TWO FUNCTIONALLY DIFFERENT USES of the word:
    - 2,882 where host and previous headword SKELETONS ARE RELATED =
      the legitimate `X ch. <a>same</a>` COGNATE CONVENTION (שְׁכֵב ch.
      same -> שָׁכַב; verified in U01115, U01134, and an 8-row random
      sample N01194/N01193, P00893/P00892, C01350/C01349).
      *** THESE ARE CORRECT LINKS, NOT DEFECTS. ***
    - 544 where the two are UNRELATED words = genuinely wrong. Crispest
      defensible subset: 374 anchors / 284 entries (6 in A) — `same`
      inside a STEM SECTION of an entry carrying NO `ch.` marker, where
      `same` can only mean "same as this entry's own base stem", so the
      previous headword is never right. Instances plainly absurd:
      U01137 שָׁכַח Pi.->שִׁכּוֹר "drunk"; K00439 כָּזַב->כּוֹתֶשׁ; H00553 חָזַק->חַזָּנָא;
      Q02182 פָּתַל->פְּתַכְרָא; T01029 רָקַח->רְקוֹעַ.
  *** THIS ALSO RESOLVES THE SIX-CHUNK PUZZLE: chunks kept "confirming
  that only `same` drifts" while next/preced. never do. `same` DOESN'T
  drift — IT HAS TWO JOBS AND THE LINKER ONLY KNOWS ONE. ***
  ACTION: re-measure the row to 374 (or 544 loose) before Phase 2
  writes anything against it.
- homograph-roman-stranded-in-definition — an entry's printed Roman
  homograph numeral survives as the FIRST TOKEN OF ITS DEFINITION while
  the headword field carries no numeral (or a superscript-digit
  disambiguator instead). U01138 headword reads bare שְׁכַח with
  " I ch. (Hebraism) …" opening the definition, while U01139 carries an
  explicit שְׁכַח II. 23 corpus-wide (25 raw minus 2 false positives:
  F00006 `V'elleh` transliteration, R00657 `II Chr.` citation).
  Letters: U 11, V 9, B 1, C 1, S 1. ZERO letter-A rids — but UNLIKE
  the other A-absent shapes it is NOT strictly letter-confined; the
  B/C/S outliers show a mechanism, not a batch artifact.
  Distinctness: unnumbered-terminal-homograph (129) is defined by
  POSITION — 11 of these 23 have no numbered sibling at all (they carry
  a ² superscript headword) and sit outside that population entirely;
  of the 12 that do, only 5 are last-member (6 first, 1 middle).
  homograph-numbering-schism (3,421) is the ANCHOR side of the same
  superscript schism; this is its ENTRY side (headword field +
  definition text). Repair is cheaper: the numeral is PRESENT, just
  misfiled — a script can move it, no print check.
  Rids: B00883, C00577, S01616, U00997, U00998, U01004, U01006,
  U01008, U01138, U01292, U01570, U01634, U01775, U02097, V00003,
  V00006, V00138, V00254, V00522, V00809, V00832, V01060, V01061.
  *** NOTE: overlaps chunk-01049's roman-numeral-stranded-in-definition
  (17 corpus-wide, 0 in A, clustered U+V 11 of 17). SAME SHAPE, third
  convergent pair of round 2. Merge; 01013's 23 is the better
  measurement (it names its 2 false positives). ***
- plural-form-holds-quotation-fragment — a plural_form[] slot holding a
  RUNNING-TEXT CITATION FRAGMENT that cannot be a plural: contains וכ׳
  (16), a `…` ellipsis (1), or leads with the section em-dash (10).
  27 occ / 26 entries, 1 in A (A00014 `—בנין א׳`). Examples: B00731
  `הושיב ב׳ וכ׳`, E00525 `מחמשה ה׳ וכ׳`, Q01309. Distinct from all three
  catalogued plural_form rows and from 00305's duplicated-value row.
  Agent states 27 is a FLOOR: a looser "multi-word" probe returns 152
  but genuine construct plurals (אוּרִים ותומים, גְּזֵירוֹת שָׁווֹת) dominate it.
- verbal_stem debris — EXTENSION confirming chunk-00609 INDEPENDENTLY.
  21 further entries beyond asterisk-stem-label (43), same four
  sub-shapes, same exemplars (A00172, B00753, B01055, B01377, B01154,
  V00600, B00178, O01711). 00609 measured 26. FOURTH convergent pair.
0 patches. All 3 hints accepted. 228 anchors compared; 5 further
unhinted class-11 mislinks, four in U01139 alone.
MEASURED NEGATIVES:
- *** CLEAN NEGATIVE — binyan_form vs verbal_stem morphological
  agreement. 3,421 form/stem pairs checked against the expected prefix
  consonant for all 14 prefix-marked stems: 25 mismatches (0.7%), and
  inspection shows essentially all are legitimate imperatives,
  participles or Hebraisms (הִנָּפֵל, מִתְחַנֵּן, הוֹדַע). Hif. 0/591, Ithpa.
  0/472, Nithpa. 0/216. NO SYSTEMIC STEM MISLABELING EXISTS. ***
- Leading whitespace in definitions: 15,822 at sense[0] (the field-split
  convention) + 2,350 at non-first senses — the latter is the near-exact
  twin of trailing-whitespace-definition (2,340); same debris class.
- refs == [] with Sefaria data-refs present: 1,822 (250 in A) — a
  whole-array subset of dataref-not-in-refs (20,298).
- Headwords with Hebrew letters and NO niqqud: 4,089 (722 in A) —
  Jastrow's convention for foreign/doubtful words, NOT a defect.
- 22-locator markup-seam sweep returned only already-known shapes.
AGENT'S SATURATION READ: "its most consequential result is negative in
character: a catalogued 3,183-row is ~85% false positives, and the
corpus-wide `same`-anchor and stem-morphology probes both came back
clean. Consistent with discovery having largely saturated, with the
remaining value sitting in RE-MEASURING round-1 rows rather than
finding new ones."
