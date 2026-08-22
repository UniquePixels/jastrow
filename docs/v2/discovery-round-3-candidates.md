# Discovery round 3 — candidates (per-chunk raw record)

Round 3 briefs required three answers per candidate: does this
population have more than one job, what is the null model, what would
falsify this. Candidates without them are not usable.

## chunk-00223 (letter D, D00371-D00400)
0 patches. 30 manifest rows: 24 clean, 4 needs_print_check (D00389,
D00392, D00398, D00400), 2 needs_human_judgment (D00390, D00396).
48 Jastrow anchors compared; 3 hints judged (1 rejected, 2 accepted).

- **shin-dot-drop** — NEW. A ש in a fully-pointed Hebrew token has lost
  its shin/sin dot (U+05C1/U+05C2) while every other consonant stays
  pointed. **38 occ / 34 entries**; fields: sense text 26, headword 4,
  refs 3, plural_form 3, binyan_form 1, language_reference 1. Letter A:
  3 (A03265, A03279, A03300). Chunk members D00389 `דּוֹשֵׁש`
  (binyan_form), D00392 `דּוֹשְנָהּ`.
  - *Jobs:* the raw probe returns 135, of which **97 are word-INITIAL
    bare ש and are CONVENTION** — Jastrow's unpointed proclitic שֶׁ־
    prefixed to a pointed stem (`שנִתְאַוּוּ`, `שיְהַלֵּךְ`). The position
    filter is load-bearing; without it the row inflates 3.5×. The 38
    non-initial split 12 word-final / 26 medial, both DEFECT.
  - *Null model:* 8,759 non-initial ש in fully-pointed tokens
    corpus-wide, 38 bare = **0.43%**. Not what the corpus produces on
    its own. The initial bucket is the null that would have fooled a
    naive probe.
  - *Falsifier:* a correctly-pointed twin should exist elsewhere. Only
    **8 of 38** do — including the decisive in-chunk pair D00389
    `דּוֹשֵׁש` vs D00390 `דּוֹשֵׁשׁ`, the same Polel form one rid apart.
    The other 30 are unique word-forms, so the test is **silent rather
    than negative**; reported as a weak result rather than hidden.
  - *Precision caveat:* ~5 of the 38 carry other pointing corruption too
    (`בֹשרֹ`, `גִּיֹשְ`, `מַשּוֹֹא`), so they belong to more than one row.
  - Checked against `initial-niqqud-drop`, `stacked-impossible-niqqud`,
    `impossible-dagesh`, `holam-migrated-off-mater-vav`,
    `shuruk-as-yod-display-corruption`. No overlap.

- **RE-MEASUREMENT: `dangling-denom-tail` 10 → 17, with the mechanism.**
  17 occ / 17 entries end `—Denom.` with the denominative absent. The 7
  missing rows all end **`—Denom.:`** with a colon (A03322, D00398,
  H00222, M01589, M01950, N00549, V00648); 17 − 7 = 10 exactly, so the
  catalogued detector anchored on `—Denom.` at end-of-string and the
  colon variant fell out. Letter A: 2. One job only — for all 17, the
  denominative survives in **0** later senses of the same entry, so
  every one is a true tail rather than a sense-boundary defect.

- **RE-MEASUREMENT: a deterministic slice of `homograph-collapse-link`**
  (the audit asked for one; that row is a review queue).
  **Slice H — the `h. text` language tag.** `h. text X` names the Hebrew
  original a Targum renders, so the target must be a Hebrew lemma.
  **61 occ / 59 entries** where an `h. text` anchor resolves to a
  `ch.` entry *while a non-`ch.` headword shares the display's
  skeleton*. Letter A: 1 (A02570). D00390 is a member.
  - *Jobs:* 862 `h. text` anchors total, 790 already target Hebrew
    (CONVENTION, working as intended). Of the 71 targeting `ch.`, 1 is
    CONVENTION (N00935 declares `ch. = h.`) and 10 have no Hebrew
    sibling at all. The expected escape hatch — *the Hebrew sibling is a
    bare `v.` stub, so routing to the substantive Aramaic article is
    right* — **is empty: 0 of 61.**
  - *Null model — and it kills the statistical framing while confirming
    the mechanism.* Base rate of picking a `ch.` target across all
    anchors whose skeleton is carried by both a Hebrew and an Aramaic
    headword: **4,162 / 12,708 = 32.8%.** Under `h. text`:
    **59 / 178 = 33.1%. There is no spike.** Raising this as a frequency
    anomaly would repeat the `same-anchor` error. What the identity
    *does* prove is that the linker's choice is statistically unmoved by
    the `h.` tag — **it never read it**, the same routing-asymmetry proof
    the `homograph-numbering-schism` audit used on the `ch.` side. This
    corroborates the standing merge flag between that row and
    `h-cognate-self-link`: they and this slice are one defect, **a
    language tag outside the anchor that the resolver is blind to.** The
    defect claim rests on the semantics of `h.`, not on the count.
  - *Falsifier:* if `ch.` articles routinely served both languages,
    targeting them would be defensible. Tested twice — the `= h.`
    declaration (1 of 71) and the stub test (0 of 61). Weakest members
    are the 18 vocalized displays whose own pointing matches the `ch.`
    headword exactly (D01004, M02034, S00061); read those before
    transforming.
  **Slice B — post-anchor binyan label.** Anchor immediately followed
  outside the tag by a binyan label naming a verb, where the target
  article carries no `verbal_stem` and a verb homograph exists: 9 occ /
  9 entries, 2 in A. D00396 `ענק` → `עֲנָק I` (noun "giant") with `Hif.`
  after `</a>` while the verb `עָנַק` exists — and the noun's own text
  reads `v. עָנַק`, the reciprocal signal the re-scoped
  `neighbor-rid-mislink` settled on. Reported as a sub-shape, not a row.

Killed with counts: `h. text` + binyan label as a combined pattern (1
corpus-wide — singleton, the two discriminators are near-disjoint);
`h. text`→`ch.` as a frequency anomaly (33.1% vs 32.8% base — no spike);
bare shin as a general shape (97 word-initial, CONVENTION);
`אר׳` → `אָרָמוּתָא` fixed sink (6 occ / 5 hosts, but the target *does*
begin with the abbreviated consonants so it fails
`geresh-abbrev-fixed-sink`'s own qualifier — boundary note, not a
candidate at n=6); `refs[]` duplication and `plural_form` empty slot
(already discarded rows).

Clean negatives: structure sound in 30 of 30 (paren and bracket balance
entry-wide, zero in-text `—N)` markers, zero OCR `l)`, zero doubled
spaces, numbering 1..n in both multi-sense entries). Trailing whitespace
at D00389 sense[0] and D00390 sense[3.0] is structural per the
carried-forward warning — both sit at a seam a following sense consumes,
so not flagged. Hints rejected with reasons: `rare-dotted-variant` on
D00387 (`gum.` is the English gloss "gum", not a mangled `Num.`),
`comma-for-period` on D00390 (`supra,` is a list separator). D00387
`שִׁינָּא` → U00968 is convention (attested alt_headword; maqaf-terminated
headwords are a real class, 115 of them). D00390 `same` → `דּוּשׁ` is the
legitimate `X ch. same` cognate back-link.

## chunk-00128 (letter B, B00353-B00382)
0 patches. 30 rows: 26 clean, 3 needs_human_judgment, 1
needs_print_check. 130 anchors compared across senses, `language_code`
and `language_reference`.

- **ellipsis-fragment-anchored** — NEW. Print's word-head elision
  (`(ed. …תא)`, `(not …לִין)`, `(read …טין)`) has its elided *tail*
  wrapped in an `<a>` and resolved to a headword spelled like the
  fragment, asserting a lexical identity for something that is not a
  word. **88 defect occ / 80 entries** (94 raw). Letter A: 11. Spread
  over 16 letters (M 24, A 11, C 7, O 6, B 5 …) — mechanical, not a
  batch artifact. In 62 of 88 the target skeleton is byte-identical to
  the fragment: the linker matched the fragment *as* a lemma. Chunk
  member B00367 `מאי בורכתיה (… <a>תא</a>)` → `תָּא`.
  - *Jobs:* two, separated by reading all 94. DEFECT — word-head
    elision, 88; absurd targets are the norm (`(ed. פלימרכים, …כוס)` →
    `כּוֹס III` "cup"; `(not …ים)` → `יָם` "sea"; `(not …לית)` → `לַיִת`
    "lion"). CONVENTION — sentence-level elision, 6, where `…` elides
    earlier text and the next token is a complete word correctly linked
    (A01111, A02658, L00584, K01049, H01758, D00702).
  - *Null model:* `…` followed by Hebrew occurs **7,157** times in
    definition text; **7,063 (98.7%) are left unanchored.** Anchoring
    after an ellipsis is a 1.3% misfire, not the corpus's behaviour —
    the construct's normal state is bare text.
  - *Falsifier:* if `…X` were a way of writing a whole short word, the
    links would be correct. The opposite was found — A02381 writes
    `(read תִי … or …תוֹ)`, M01288 `(ed. …נָן, …נַן)`, L00655
    `(read ם … or …ן)`: single **letters** after the ellipsis, which no
    lemma reading survives. Second falsifier: if the linker resolved the
    *reconstructed* word, targets would match the full form; they never
    do outside the 6 convention cases.
  - *Non-overlap*, checked against all 120 rows: 39 of 88 displays carry
    niqqud, so `homograph-collapse-link` ("unvocalized") cannot claim
    them; only 2 carry a geresh; no ellipsis-aware row exists.
  - **Caveat that corrects an audit ruling:** 7 members are single-letter
    displays hitting the alphabet-letter articles, which the
    `homograph-collapse-link` audit classed CONVENTION corpus-wide.
    **That ruling is wrong for these 7.**

Killed with counts:
- *"Homograph series numbered from II"* — 96 series have a Roman-numbered
  member but no `X I` and no bare-`X` twin anywhere (`בּוּרְסִי II` with no
  `בּוּרְסִי I`). **Killed: 0 of 96 are referenced by any anchor** — not one
  `data-ref` targets a missing `X I`. The gap has no downstream consumer,
  so it is print/edition reality, not a link defect. Sub-probe also
  killed: numbered `X N ²` pairs whose `X I` is absent number 2
  corpus-wide.
- *"Parenthesized headword variant stranded in the definition"* —
  **killed on the null model.** 362 entries open sense[0] with a lead
  Hebrew parenthetical; **358 name a different word** (the root:
  `גַּבָּל` ← `(גבל)`). The construct's job is root etymology; the 4
  skeleton-identical cases are triliteral roots that coincide with the
  headword's consonants.

Hints judged: B00361 `niqqud-twin-target` ACCEPTED (`בוריא` targets
`בּוּרְיָא I` but the sentence names the Syriac cognate of *this* entry).
B00382 `rare-dotted-variant` "Kes." REJECTED — `Kes. Mish. to Maim.` is
*Kesef Mishneh*, the standard commentary; no tractate reading is possible
in that slot, so the dominant `Kel./Pes./Ker.` siblings are the wrong
comparison class.

Clean negatives: ten redirect stubs checked anchor-by-anchor, all
correct. B00367 `בִּרְכָּא` → `בֶּרֶךְ ²` looked like a skeleton divergence
but is right — an attested `alt_headword` of the target. B00375
`בְּרִין` → `*בָּרִין` is a genuine niqqud twin; both candidates read, both
place-name stubs, neither carrying a reciprocal reference, so the agent
**left it clean rather than escalate on a coin-flip**. Three in-text
`N)` hits are all citation-closing parens; B00359's unnumbered lead
sense is the excluded etymology-preamble shape.

## chunk-00183 (letter C, C00604-C00633)
2 patches (C00618, C00620 — class 10 duplicate-anchor-wrap, both
byte-conserving). 30 rows: 21 clean, 2 repaired, 7 needs_human_judgment.

- **gloss-head-seam-period-doubling** — NEW. The `language_reference`
  fragment ends with a sentence period and `senses[0].definition` opens
  with a second one, so the rejoined gloss head renders
  `… ch. same. . *Targ. Is. XXXVIII, 12`. **15 occ / 15 entries**,
  letter A: 2 (A03033, A03312). Chunk member C00633.
  - *Disjoint from `orphan-gloss-seam-period` (19)*, whose 19 the agent
    reproduced exactly with `(?<!h)\. \. <a` inside definitions. **The
    two rid sets intersect emptily** — that row needs an italic gloss
    and a preceding in-definition period; these 15 have the period as
    the definition's first byte, its partner in a different field.
  - *Jobs:* one. 14 of 15 are the `X ch./h. same.` cognate header, the
    15th is `ch. = h.גֵּר.`. Looked for an abbreviation split across the
    seam (`Ms` + `.`) and for a definition-side period doing separate
    work; neither occurs.
  - *Null model:* 1,136 entries share the exact left context
    (`language_reference` ending in a period) and **1,121 (98.7%) do not
    add one**. Mirror check: of the 3,317 whose `language_reference`
    does *not* end in a period, only 5 open the definition with one —
    and all 5 end in a Roman homograph numeral, i.e. legitimate
    placement. The period is not the field-split convention and nothing
    consumes it.
  - *Falsifier:* if the seam period were structural the count would be
    in the hundreds and the 5-vs-3,312 mirror split would not be so
    lopsided. Stays escalation-only — which byte is surplus is unknowable
    from the entry, and one lives outside sense scope.

- **RE-MEASUREMENT: `multiword-abbrev-mislink` 22 → 62 of 64, and the
  reading changes.** Exactly 64 anchors corpus-wide display
  `{בר|בית|בני|בעל|בן|בת} X׳`. They collapse into **24 distinct
  display→target pairs, each display having exactly one target**
  (`בית א׳`→אֶבֶן ×12, `בר א׳`→אמוראי ×9, `בר פ׳`→פִּיקָא ³ ×6 …). All 24
  pairs read in context: **in every case the abbreviated word is the
  host entry's own headword** (Beth Abtinas, bar Abbub'ram, bar enash),
  never the sink. 62 of 64 mislinked; the 2 correct ones are correct
  only because the host happens to be the sink.
  - New reading: this is a **per-letter fixed sink**, not an assortment
    of one-off errors. For 10 of the 24 sinks the sink entry *declares
    the exact abbreviation in its own `alt_headwords`*, making this the
    multi-word arm of `alt-headword-collision` / `abbrev-in-alt-headwords`
    rather than an independent linker bug. The other 14 have no such
    declaration, so a second mechanism is also at work.

- **METHODOLOGICAL FINDING that applies to every display-keyed row.**
  The linker is a deterministic display→target map: of 12,454 Hebrew
  display strings occurring ≥2×, **12,443 (99.9%) have exactly one
  target** — the only exceptions being the positional `same`/`preced.`
  So 62 occurrences represent **24 independent decisions**, not 62.
  **Any catalogue row keyed on display text should be reported as
  (occurrences, distinct displays); occurrence counts over-state the
  evidence by the repetition factor.**

Killed with counts: *leading space before the gloss-head separator
comma* (`" , "` 280 vs `", "` 11,761). Two jobs, no single verdict —
when the last gloss-head fragment ends in an anchor whose display
terminates in a Roman numeral the space is present 27 times and absent
once (96%, a convention for that sub-shape), but when it ends in Hebrew
only ~23%. The sub-hypothesis that the space marks a dropped homograph
numeral was **falsified**: 21/205 of leading-space cases have a numeral
in target-but-not-display (10%) against 93/583 of no-space cases (16%)
— the control group is *more* enriched.

Clean negatives: 807 superscript headwords all have a bare-base sibling
(synthetic dedup suffix by construction) — **detector hazard: the suffix
survives niqqud-stripping, so every skeleton comparison against those
807 targets reports a spurious DIFF.** C00624, C00620, C00615 all looked
like class-11 and are correct on attested `alt_headwords` or read
context. C00609's Af.-section `same` fits the *narrowed*
`same-anchor-positional-mislink` description exactly.

## chunk-00068 (letter A, A02010-A02039)
0 patches. 30 rows: 23 clean, 5 needs_human_judgment, 2
needs_print_check. 108 anchors compared; 6 hints judged (3 accepted, 3
rejected with corpus counts).

- **guttural-initial-simple-sheva** — NEW. A word-initial guttural
  (א ה ח ע) carrying a simple sheva U+05B0 where Tiberian pointing
  permits only a hataf. **72 occ / 55 entries**, letter A: 16 occ / 10
  entries. Reaches lookup-critical fields: 2 headwords (A01964 `אְמָא I`,
  P01487), 3 alt_headwords, 7 plural_form, 2 refs[] strings, 12
  href/data-ref attributes.
  - *Jobs:* one. 0 of 72 are mid-word fragments split by markup (the
    preceding character of every hit was checked), and no position
    exists where a word-initial guttural legally takes a simple sheva.
    The nearest thing to a second job is directional, not functional: 29
    corrupt a display while the target is right, 14 corrupt a lookup key,
    which propagates — A01964's corrupted headword is chased by 5
    anchors across 5 entries plus 2 refs[] strings.
  - *Null model — a 64× swing.* Word-**medial** guttural + simple sheva
    occurs **2,744 times, 31.5%** of the medial population: ordinary
    silent sheva, entirely legitimate. Word-**initial** it is 72 against
    14,676 hatafs, **0.488%**. A naive "guttural + sheva" rule returns
    2,816 and would be **97.4% false positives**; a transform must not
    drop the word-initial condition.
  - *Falsifier:* if the correct forms were not attested elsewhere these
    would be genuine spellings. **46 of 72 have their correctly-pointed
    twin attested verbatim elsewhere, and 36 sit in a field string that
    already contains the correct spelling of the same word** — usually
    the anchor's own data-ref (A00577 displays `אְוַשׁ`, targets `אֲוַשׁ`).
  - *Downstream:* the corruption **manufactures phantom niqqud twins**.
    Of the 5 headword pairs separated only by sheva↔hataf on a guttural,
    4 are medial and legitimate but `אְמָא I` vs `אֲמָא II` is the
    corrupted one — and that phantom pair is exactly what fired this
    chunk's `niqqud-twin-target` hint. Repair is not deterministic
    (which hataf was intended is unknowable per token) → a
    needs_print_check generator, same posture as
    `stacked-impossible-niqqud`.
  - Not covered by any of the 120 rows: `stacked-impossible-niqqud` is
    two points on one consonant, `initial-niqqud-drop` a *lost* point,
    `holam-migrated-off-mater-vav` a *misplaced* point, and
    `impossible-dagesh` explicitly records "א and ע yield ZERO". This is
    a **wrong-class** point.

- **trailing-comma-entry-tail** — NEW, small. An entry's final sense
  ending on a bare comma with nothing following. **10 occ / 10 entries**,
  letter A: 1 (A02035).
  - *Jobs:* two, both defects with different repairs — comma-for-period
    on a cross-reference stub (8 of 10 are `, v. <a>X</a>,`) and a lost
    continuation after the comma. The agent could not separate them
    without the printed page and says so.
  - *Null model:* 252 definitions end in a comma, but **242 are mid-entry
    seams where the next sense consumes the comma as the field-split
    separator** — the structural-separator warning firing exactly as
    intended. Restricting to the entry's last sense leaves 10. This is
    the same position filter that took `trailing-whitespace-definition`
    from 2,352 to 10, and **the two sets are disjoint** (none of these 10
    ends in whitespace), so it is a separate shape, not a re-cut.
  - Honest caveat: at 10 members it may not warrant its own row and could
    fold into the text-loss-locator family.

- **RE-MEASUREMENT: `corrigendum-reading-linked` is ~2.5× under-measured.**
  Catalogued at 356 anchors / 330 entries, measured on the literal
  `(corr. acc.)`. Measuring the row's own predicate while allowing the
  corpus's actual punctuation gives **898 occ / 797 entries, 96 in
  letter A**: 424 fully parenthesized, 363 with a closing paren but no
  opener, 70 with neither, 38 with an opener but no closer, 3 closed
  with `]`. **The published 356 is not reproducible even for the
  parenthesized slice, which alone is 424.** A02022 is one of the 3
  bracket-closed cases, a slice the detector cannot see at all. The
  row's own note already flagged "plus 21 preceded by incorr./corrupt.",
  so the vocabulary was known to be broader; the count was never widened.

Killed with counts: RTL trailing ellipsis (**402 trailing, 0 leading, 0
both** — perfectly uniform, a convention; explicitly *not* a sub-shape of
`reversed-hebrew-phrase`). Hints rejected: `Yak.` (all **4** corpus
occurrences are `En Yak.` = Ein Yaakob, a work name; `Yalk.` occurs
4,240 times and never as `En Yalk.` — two different works, not a dotting
variant, and the detector has no rule distinguishing a work name from a
mis-dotted abbreviation); `אמר` (the gloss is literally "the word *amar*
in the Scripture text", so the Hebrew target is right); `טלל` (the gloss
fits, though its sibling `טול` on the same entry *is* wrong and was
escalated).

**Attempted and abandoned, reported honestly:** a re-measurement of
`neighbor-rid-mislink`'s re-scoped reciprocity predicate returned 664
occ / 618 entries against the catalogued 124/109. The reconstruction
clearly differs and the agent could not pin the difference from the
published description, so it **declined to report it as a
re-measurement**. The one observation that survives: 47 of its members
sit in `language_reference` (7.1%), and **no published measurement of
that row states whether that field is in scope.**

## chunk-00312 (letter H, H00057-H00086)
0 patches — every defect is class 8, class 11 or array/structural scope,
none patchable in the op grammar. 30 rows: 22 clean, 7
needs_human_judgment, 1 needs_print_check.

- **post-anchor-numeral-duplication** — NEW. A cross-reference's Roman
  numeral appears **both inside the anchor display and again as bare
  text after it**: `v. <a><span>חַבְלָא</span> I</a>. I.` **11 corpus-wide**
  (10 via `</a>`, 1 via an unlinked `</span>`), all numeral **I**, all
  definition-terminal, all period-separated. Letter A: **0**; letter H:
  3. Not covered by `post-anchor-numeral-mismatch` (which requires a
  *different* numeral).
  - *Jobs:* the raw family (87 hits) splits three ways by separator —
    comma + different numerals (**59**) is the elliptical enumeration
    convention `v. X I, II.`; empty separator (**16**) is coincidental
    adjacency of a citation numeral (`Targ. I Chr.`); period + *same*
    numeral + definition-terminal (**11**) is the defect. One further
    period case is the abbreviation `V.` = *vide*. **The defect subset is
    isolated by the conjunction of all three tests, not by any one.**
  - *Null model:* the correct rendering `v. <a>X I</a>.` has **679**
    definition-terminal occurrences; terminal bare " I." arising for
    unrelated reasons is **5**. 11 against 684 = 1.6%, a sharp residue.
  - *Falsifier:* print printing the numeral twice is untestable here, so
    stated plainly — the agent established print supplies *one* copy
    (O01416's display reads `סַפְרָא I` while its data-ref is `סָפַר ²`,
    so the display numeral is print text, not linker-generated) but
    **could not determine which copy is the intruder, and therefore
    proposes no delete.** Ruled out: a truncated citation (all 11 are
    string-terminal) and linking-stage duplication (P01496 straddles an
    *unlinked* span).
  - **Open problem left open:** among the 679 clean cases the numeral
    distribution is II 347 / I 279 / III 47 / IV 6, yet all 11
    duplicates are "I" (p ≈ 5e-5 under numeral-blind duplication). The
    wrapper-copies-the-token hypothesis predicts "II" cases and there are
    none, so **the mechanism is undetermined.** A homograph-host
    explanation was tested and killed (only 3 of 11 hosts are homograph
    members).

- **section-break-terminator-loss** — NEW. The terminal period before an
  em-dash section head is gone: `…is severed—Pl.` **10 corpus-wide**,
  letter A: 1. Class 8, one byte each.
  - *Jobs:* one among the 10 confirmed — but the first-pass detector
    returned 15, and 5 were false positives with a different job (3 close
    a quotation with the period present, 2 are ellipses). **Reporting the
    raw 15 would have overstated the row by 50%.**
  - *Null model:* correct `.—LABEL.` = **7,900+** (Pl. 5,139; Part.
    1,309; Fem. 346). Legitimate non-period predecessors: `]` 242, `?`
    54, `)` 17, `!` 4 — all real sentence-enders. The 10
    letter/digit-terminated cases are 0.12%.
  - *Falsifier:* that the corpus routinely writes `gloss—Pl.` with the
    em-dash carrying the break. It does not — 5,139 vs 8.

- **RE-MEASUREMENT: `empty-lead-sense` 73 → 84, and its description is
  rendering-keyed.** It tests `senses[0] === {}`. A whitespace-only lead
  sense `{"definition": " "}` has the identical structural consequence
  and occurs **11** more times. The split is mechanical: all 73 `{}`
  cases are entries whose `language_code` (" ch. ") was extracted; all 11
  whitespace cases are entries whose `content.morphology` was extracted,
  leaving the print space behind. **Repair caveat:** `rejoinGlossHead`
  concatenates morphology + language_code + language_reference +
  senses[0].definition, so in those 11 that space *is* the print
  separator between the morphology label and the `1)` marker — the
  presumable repair (drop the lead sense) would destroy a byte in 11 of
  84. Null model: whitespace-only senses at non-lead positions = **1**
  corpus-wide, so the shape is position-exclusive.

- **RE-MEASUREMENT: `plural-form-empty-slot` was discarded on a wrong
  reading, and `plural-form-parenthesized-variant` is undersized.** 703
  entries / 755 empty slots. Classifying each slot by what follows the
  last captured plural in the definition: **~246 (33%) mark a declared
  inflected form the extractor dropped** — `constr.` 160, parenthesized
  variant 46, `fem.` 11, bare Hebrew continuation 21, `pl.` 6, `Du.` 2 —
  while ~227 are genuinely inert. **The population has two jobs and only
  one is inert; discarding the row wholesale discards the third that is
  the evidence for the variant row.** Going wider: **419 entries declare
  a `constr.` form and 337 (80.4%) never reach `plural_form`**, of which
  only 176 leave an empty slot — so that row should be sized at ≥337 lost
  construct forms, and the empty slot is a **~52%-sensitive fingerprint,
  not the population**. Maintainer ruling owed: 82 of 419 construct forms
  *are* captured into `plural_form`, a field not supposed to hold
  construct states.

- **RE-MEASUREMENT: `initial-niqqud-drop` is position-specific and should
  not be.** Restricting to numbered-homograph sibling pairs where one
  headword is the other minus vowel points — the only place the drop is
  provable without print — gives 62 pairs: **36 unpointed-variant
  headwords** (zero points, the corpus's bare-consonant variant-spelling
  CONVENTION), **8 dagesh-only** (lexically real: מִילָא/מִילָּא,
  מָצַר/מָצַּר, CONVENTION), and **14 partial-pointing pairs** ≈ 9 distinct
  deficient headwords (DEFECT), plus 4 עוּר/עִוֵּר pairs rejected as
  genuinely different words. **Of the 9, only 2 lose the point on the
  *first* consonant** — the row's definition; 4 lose the qamats before a
  word-final ה/א and 3 lose an interior point. Detector bound stated
  honestly: this test only sees headwords with a numbered sibling, so the
  real population is larger and this method cannot size it.

Killed with counts: `Pass. pass` for `Part. pass` (**1** corpus-wide
against 1,374 correct — a singleton, kept as a per-entry escalation; it
is also the true content of the entry's `rare-dotted-variant` hint, which
had framed it as a capitalisation variant). Niqqud-deficient homograph
headword as a single row (36 of 62 are the deliberate unpointed-variant
convention, 8 more dagesh-real; only the residue survived, folded above).
`doubled-space-as-text-loss-locator` in H00064 — the doubled space is
there but whole-entry paren and bracket balance is clean and the text
reads complete, a clean negative against that row's 41%-imbalance claim.

Hints: 7 judged across 5 entries — 3 accepted (one re-read as
`corrigendum-reading-linked` rather than a twin choice, one re-read as
Part.→Pass. rather than capitalisation), 4 rejected. H00058's
`exact-headword-diverge` rejected because `חֲבִיבָא I` is an attested
`alt_headwords` entry of the target — **the detector cannot see
alt_headwords**, the carve-out the round-2 calibration note named.

Clean negatives on the four uncatalogued populations: geresh in
`plural_form` **0** in this chunk; ASCII gershayim outside `dir=rtl`
**0** (both occurrences sit inside spans); JT double-wrapped citations
**0** (six slash-less hrefs, all single-wrapped); `neighbor-rid-mislink`
class E **0**.

**Corroboration of the audit's `same-anchor` finding:** H00084, H00081
and H00075 are textbook members of that row's shape — a `same` anchor
resolving to the immediately preceding headword — and all three are
**correct** (חֲבַל I genuinely is the Aramaic cognate of Hebrew חָבַל).
Three more data points for the 2,882 legitimate-convention majority.

## chunk-00285 (letters F/G, F00107-G00018)
3 patches (F00115 class 6 adjacent duplication; F00116 class 3 OCR `l)`;
G00016 class 7 byte-conserving reorder). 30 rows: 23 clean, 6
needs_human_judgment, 1 repaired. All 8 hints judged — 2 accepted, 6
rejected with reasons (one `truncated-formula` rejected because the match
is Graetz `III², p. 426`, a bibliographic volume; one
`rare-dotted-variant` because `Lit. Centralblatt` is a journal name).

- **vocalized-display-names-other-twin** — NEW, 149 anchors / 146
  entries, letter A: 15. An anchor whose display is a **vocalized**
  Hebrew form exactly matching a corpus headword, while its `data-ref`
  names a different headword sharing the skeleton. Raw 222, minus 15
  single-headword skeletons, minus three separable jobs → 149.
  - *Jobs: four, and only three could be separated.* (a) 32 where the
    *target's own headword* is pointing-corrupt (`אִילפָא I` for
    `אִילְפָא`) — the link is fine, the defect is elsewhere. (b) 14 where
    the display is declared in the target's `alt_headwords` — v4's
    allowed difference. (c) 12 where the display-form headword is a bare
    `v. X` stub and the link resolves through it. **(d) The residual 149
    is still mixed**: 12 read against both entries gave ~4 clear defects,
    ~5 clear non-defects, ~3 undecidable. The clinching evidence: the
    single largest display→target pair, `בּוֹר`→`בּוּר` (8 instances),
    contains **both** a genuine mislink (B00700, gloss "pit") and correct
    links (O00403, A03326, gloss "ignorant"). **Same surface pair, two
    jobs. This population must never be transformed as a block.**
  - *Null model:* 39,085 anchors have a vocalized display that is exactly
    a corpus headword. 97.7% resolve to that same headword; 1.8% go to a
    different skeleton (other catalogued classes); only **0.6% (222)** go
    to a same-skeleton twin.
  - *Catalogue overlap near zero:* 0/149 have a numeral disagreement,
    1/149 sits in `X ch.` context, 4/149 are rid-adjacent, and
    `homograph-collapse-link` requires an *unvocalized* display so it is
    disjoint by construction.
  - *Falsifier, and the agent's own test defeated:* it checked whether
    the display's Roman numeral resolves the ambiguity, and found that in
    **105 of 149** the display carries a numeral naming a homograph that
    does not exist under the display's own vocalization — which looks
    decisive. **But A01201, the maintainer-confirmed batch-02 catchable
    miss cited in sweep-v4's own changelog, sits inside those 105.** So
    the numeral test is evidence, not proof, and the agent states plainly
    it cannot mechanically decide the 149. The working discriminator is
    semantic: does the target article cite the passage in hand? A future
    probe should test *that*, not the vocalization.

- **adjacent-verbatim-repetition** — NEW, 59 occ / 59 entries, letter A:
  11. A run of ≥8 characters ending in a period, repeated immediately and
  verbatim inside one definition (`(of bowels). (of bowels).`,
  `v. infra. v. infra.`). **`patterns.jsonl` has no row for in-sense text
  duplication at all.**
  - *Jobs:* all 59 read; every one is duplication debris, no legitimate
    repetition idiom. What would have shown a second job — a repetition
    whose two copies differ by a byte, i.e. text lost *between* copies —
    was checked separately in the shorter band and no such family exists.
  - *Stated limit:* only *adjacent* copies were measured; non-adjacent
    duplicated tails (the harder class-6 shape) are not in this count.
  - *Null model:* natural running text here effectively never repeats
    adjacently — relaxing the threshold to 3–7 characters adds only 39
    more occurrences across all 32,512 entries, and those are debris too.
    Base rate ~0, so precision is close to 1.

- **emphasis-run-edge-space** — NEW but low value, raised with its own
  caveat. A space captured inside an `<i>` run's boundary (`<i> ` 238,
  ` </i>` 150), 304 entries, letter A: 42.
  - *Jobs: two.* ~55 of the 84 `</i> <i> X</i>` seams are stem/section
    heads; ~29 split a name or gloss mid-phrase.
  - **The agent's first reading was falsified by its own null model.** It
    read these as lost section-break em-dashes — class 8, a lost byte,
    and important. Across 1,534 italic stem-head runs the em-dash is
    **not** the norm: 362 carry `—`, but 121 follow a plain `. ` and 313
    follow a tag-plus-space. Only 24 of 1,534 (1.6%) put the space inside
    the tag. **Markup-whitespace drift, not text loss.**
  - *Caveat:* HTML collapses the doubled space, so nothing is visibly
    wrong today; a defect only if v2 stores emphasis runs as text without
    trimming. A normalization item at most.

- **RE-MEASUREMENT that says DO NOT widen a row —
  `doubled-space-as-text-loss-locator` (108), now with a null model for
  the first time.** The scan runs on raw text: 109 literal occurrences in
  108 entries, matching the catalogue. Strip tags first and it nearly
  triples to **283 occ / 280 entries**, the extra 173 hiding their second
  space behind an intervening tag. That widening would be wrong:

  | population | entries | whole-entry paren imbalance |
  |---|---:|---:|
  | corpus-wide | 32,512 | 3.7% |
  | **length-matched null (≥1,222 chars)** | 6,599 | **11.7%** |
  | literal double space (the catalogued 108) | 108 | **40.7%** |
  | tag-hidden only | 173 | 12.1% |

  **The row's loss signal survives the null model** — 40.7% against an
  11.7% length-matched baseline; its 41% figure was never
  length-controlled before, and it holds. The tag-hidden extension is
  statistically indistinguishable from baseline, carries no loss signal,
  and belongs to `emphasis-run-edge-space`, not here. **Keep the row at
  108 and record the length-matched null so it is not re-derived.**

Killed with counts: asterisk-prefixed headword (1,339 entries, 2,282
`data-ref` occurrences carrying `*`) — **killed on a check, not a
hunch**: round 2 already adjudicated it (0 of 72,257 anchors name an
asterisk-stripped target) and `headword-index.ts` strips
`EDITORIAL_ASTERISK` by design. "Yerushalmi citation left unlinked" —
not raised, because the linker is `refs[]`-driven, so this is link
*coverage* with no defect signature to probe.

Clean negatives on the uncatalogued populations: geresh in `plural_form`
**zero** across this chunk's five populated arrays; JT double-wrapped
citations **zero**; class E **zero**, and only 4 of the 149 candidate-1
anchors are rid-adjacent, so candidate 1 is not that row in disguise.
ASCII gershayim outside `dir=rtl` corroborated rather than re-discovered
— field-slot counts `headword` 68, `refs[]` 21, `alt_headwords` 16,
`plural_form` 8, consistent with the brief's ~409 once href/data-ref and
bare RTL runs are added.

## chunk-00256 (letter E, E00197-E00226)
1 patch. 30 rows: 24 clean, 1 repaired, 2 needs_print_check, 3
needs_human_judgment. 76 anchors compared (41 lemma links, 35 citation
links); all 3 hints judged — 2 accepted, 1 rejected.

- **vocalized-twin-ignored** — NEW, and *** CONVERGENT WITH
  chunk-00285's `vocalized-display-names-other-twin` (149/146) — SAME
  SHAPE, MERGE AT CONSOLIDATION. *** An anchor whose **vocalized**
  display exactly equals an existing headword, linked instead to a
  different headword sharing only the skeleton. The niqqud that would
  have decided it was present and was discarded. **35 anchors / 34
  entries / 15 distinct display→target pairs**, letter A: 9.
  - *Derivation (stricter than 00285's):* 78 anchors where a vocalized
    display equals a headword and the target is a skeleton-twin → −16
    where the display is in the target's `alt_headwords` → −3
    redirect-stub pairs → −8 where one entry mentions the other → −16
    where the target headword is simply the display *minus* points (an
    under-pointed headword, `initial-niqqud-drop` family, link correct)
    → **35**. The two chunks differ mainly in how much of that they
    subtract; consolidation must pick one derivation.
  - *Jobs:* 10 hand-read inside the retained 35 — **7 DEFECT** (C00447
    גּוּס II names גִּיס as its own denominative but links to גֵּיס
    "spoils"; H00036 חֲבוּרְתָּא "company" → חַבּוּרָה "wound"; B00704
    בִּירָה says "Ch. בִּירְתָא" and links to בֵּירְתָא "well"; A01318
    אֵימָא, the imperative listed inside אֲמָא II, → `אְמָא I`; A01248
    אֵיכָא = אֵי + כָּא → אִי II "if"), **2 CONVENTION/false-positive**
    (display is an ellipsis tail or a Ms. variant fragment, not the
    lemma), 1 undetermined. **≈70% precision: a review queue, not a
    rewrite rule** — the same verdict shape the audit reached for
    `homograph-collapse-link`.
  - *Null model:* the rival explanation "the linker ignores niqqud
    everywhere, so this is convention" does not survive — 62 of 78
    twin-target anchors resolve to a headword the display's own
    vocalization does not name, but 16 of those resolve to a target
    declaring the display in `alt_headwords` (legitimate) and 16 more
    are cases where the *target's* headword is merely under-pointed (the
    same lemma, not a twin). Removing both leaves a population where
    vocalization is the only discriminator and it was overridden.
  - *Falsifier:* if the host contexts matched the *target's* meaning
    rather than the display's. In 7 of 10 the host names the display's
    lemma explicitly — as its denominative, its ch. cognate, its
    imperative, or by quoting the same citation. **The 2 that falsified
    were fragment displays, reported as a known contaminant rather than
    hidden.**

- **see-particle-lost** — NEW, tiny but very clean. Whole-definition
  cross-reference stub `, <a>X</a>.` with the see-particle simply
  absent. **4 corpus-wide** (E00226, G00428, H00010, H00021), letter A: 0.
  - *Null model — the strong part:* the particle slot in whole-definition
    stubs is populated 7,200+ times with a rich preserved vocabulary —
    `v.` ×6844, `v. sub` ×196, `read` ×29, `pl. of` ×29, `read:` ×16,
    `part. of` ×8, `fem. of` ×5, `Pi. of` ×4, `constr. of` ×4,
    `imper. of` ×3 — against exactly **4** empty slots. **A vocabulary
    that varied is fully retained; only the empty case is anomalous, so
    it is loss, not convention.**
  - *Falsifier checked:* the broader shape `, <a Jastrow…>` at definition
    *start* occurs 87 times and is overwhelmingly legitimate — the print
    headword line's second form, after which the definition continues.
    **Restricting to "the anchor is the entire definition" is what
    isolates the defect; without it the candidate would have been 95%
    noise.**
  - Adjacent micro-finding, same slot: **`v,` for `v.` — 8 occurrences**
    (B00509, C00498, D00267, F00038, H01573, M01338, M01643, T00677).
    Class-8 comma-for-period; no catalogue row covers it.

- **abbrev-headword-stub** — NEW, weaker, raised conditionally. The
  `headword` field itself holds a geresh-truncated spelling, unusable as
  a lookup key. **34 entries**, letter A: 2.
  - *Jobs:* the larger one was excluded — 21 further geresh headwords are
    the one-letter alphabet/numeral articles (א׳, ב׳ … ת׳), genuine
    lexemes, CONVENTION. The remaining 34 are multi-letter truncations
    serving as cross-reference stubs. **Two of the 34 self-link** —
    their own `data-ref` is their own truncated headword, so the redirect
    terminates on itself.
  - *Falsifier:* if these were transcription artifacts the row would be a
    text-loss class instead. They are faithful to print — Jastrow does
    lemmatize an abbreviated manuscript reading — so it is a
    data-usability defect, as `abbrev-in-alt-headwords` is framed.
    **Raise only if that row's disposition is upheld.**

Killed with counts:
- *`same-display-divergent-target`* — an attractive-looking detector,
  explicitly flagged **do not build it**. 196 display strings / 1,014
  anchors resolve to ≥2 distinct targets, overwhelmingly legitimate
  (`Tosef. ib. III` correctly names a different tractate per host).
  Tightening to chapter-level disagreement gives 75 groups / 391 anchors,
  still dominated by Tosefta parenthetical-chapter fragments already
  covered by two rows. Genuine non-catalogued residue <20 anchors.
- *`dsal-note-number-loss`* — `D. S. a. l. note` occurs 1,318 times and
  **681 carry no number**. Unnumbered is normal convention, not
  truncation. Note this is the shape the `truncated-formula` hint kind is
  tuned for.
- *`headword-duplicated-in-alt-headwords`* — 4 corpus-wide; the
  plural_form analogue was discarded. Parked.

Re-measurements:
- **`shuruk-as-yod-display-corruption` (12) — scope is roughly 4× larger,
  and the population does two jobs.** The impossible pointing
  "unvowelled consonant + יּ" (excluding legitimate double-yod `ייּ`)
  occurs **52 times**: 17 inside anchor displays (the row's entire
  current scope) and 35 outside — 30 in definition body text or bare
  `dir=rtl` spans, 5 in `plural_form`. The row's verification rule
  ("substitute only where the result equals the anchor's own target
  headword") is **unavailable outside anchors**; substituting against
  corpus attestation instead, 35 of 52 yield an attested `וּ` form. But
  **~17 are better read as a spurious dagesh on a plain yod**
  (אניּ→אני ×357, מפניּ→מפני ×276, חזיּ→חזי ×64) and belong with
  `impossible-dagesh`, not with shuruk substitution.
- `plural-label-rendering-defeats-capture` — E00200 confirms a member
  (lowercase `pl.`, plural declared in text, `plural_form: []`). No size
  change.
- `initial-niqqud-drop` — E00209's headword `הודָיָה` lost the holam of
  its holam-male and the fully-pointed twin is attested as E00203's
  `alt_headwords`, satisfying the row's own attested-twin criterion.
  Corroboration.
- Class-E residual (the brief's uncounted population #4): E00205's first
  anchor is a member. **Fed to the count rather than re-discovered.**

Clean negatives: three script-slated systemics present and not escalated.
ASCII gershayim in this chunk all sit **inside** `dir=rtl`, so catalogued
row territory, not the brief's gap. E00215 is a niqqud twin the detector
did **not** flag and which resolves correctly — recorded as a detector
blind spot, not an entry defect. One rejected hint is worth carrying:
E00214's `exact-headword-diverge` fails because the display is recorded
in the target's `alt_headwords` **and** the exact-match headword is
itself a redirect to that same target — **the detector consults neither
`alt_headwords` nor redirect stubs.**

## chunk-00306 (letter G, G00619-G00648)
1 patch (G00642, class 2 swallowed-marker — the split closes the
numbering gap exactly). 30 rows: 23 clean, 5 needs_human_judgment, 2
needs_print_check. All 128 anchors compared; 5 hints judged, 4 accepted,
1 rejected (`exact-headword-diverge` on a display that is the target's
own declared `alt_headwords` entry — **a false positive of a detector
that reads headwords only**, the third chunk this round to name it).

- **numeral-blind-homograph-default** — NEW, headline. Display is the
  fully vocalized headword of a Roman-numeral homograph series, carries
  no numeral, so the resolver returns member I. **1,492 occ / 1,363
  entries** (162 in A); target = I in 1,468 (98.4%). Crisp core: **100
  occ / 98 entries** (12 in A) where the cue is `v.`, the chosen member
  is I in 100 of 100, and only a *different* member of the series
  cross-references the host entry's skeleton.
  - *Jobs:* 706 cross-reference cues (`v.`/`cmp.`/`=`/`read:`) where the
    numeral is the only discriminator — DEFECT-prone; 634 plain mentions
    — mixed; 152 etymology parens naming a root — CONVENTION; 73 land on
    a redirect-stub member. Reciprocity test: 165 chosen-reciprocates-
    and-no-rival (CORRECT), 51 both reciprocate, 306 neither, **109
    only-a-rival (the signal)**. Reading 7 of the `v.` arm: 7/7 DEFECT
    (M00653 מוֹרִיר→מָרַד I "rebel" where II is "discharge, be inflamed";
    G00364 זִימּוּנָא "pr. n. m."→זְמִינָא I "invited guest" where II is
    the personal name; A00235 אַגַּב→גְּרָרָא I "cud" where II is
    literally glossed `אגב ג׳`).
  - *Null model, three ways:* (i) 1,277 of 1,492 series have exactly two
    members, so a blind default is right ~50% by chance; (ii) empirical
    comparator — when the display *does* carry the numeral (n = 2,629)
    targets spread I 43% / II 47% / III 8% / IV 1%, so **98.4% I in the
    numeral-less population is not context-reading**; (iii) the
    reciprocity probe is not self-fulfilling — 165 occurrences in the
    same population have the chosen member reciprocating with no rival.
  - *Falsifier, and it partly held:* "I is simply the commonest
    homograph." An unfiltered read of 10 broad-population members came
    back ~5 correct / 2 wrong / 3 undetermined, **so the 1,492 is a
    review queue, not a transform target.** The probe's own false
    positives are identified by name (J00696, E00526 are *correct*
    root-etymology links flagged by reciprocity) — which is exactly why
    the core is restricted to the `v.` arm.
  - *Not covered:* `homograph-collapse-link`'s audit explicitly **removed**
    "957 where the sharing headwords carry only ONE distinct vocalization
    (numbered sub-entries)" — that is this population;
    `homograph-numeral-mismatch` requires a numeral in the display;
    `neighbor-rid-mislink` requires diverging skeletons.

- **ib-targum-work-loss** — NEW. An `ib.` continuation inside a Targum
  citation run whose anchor resolves to the plain Hebrew-Bible book
  instead of the Targum work. **9 occ / 8 entries** (3 in A).
  - *Jobs:* of 157 anchors immediately after `ib.`, 9 are Targum-context
    → plain book (DEFECT) and **2 are Targum-context → Targum ref
    (CORRECT, proving the resolver can do it)**.
  - *Null model:* the competing reading "`ib.` means the same *book*, so
    the plain verse is right" is ruled out — in 8 of 9 the display names
    a **different** book from the preceding citation (Deut→Lev, Gen→Num),
    so `ib.` can only be carrying the work.
  - *Falsifier:* if the Targum works were absent from the mapping this
    would just be catalogued `targum-cite-to-plain-bible` (43). Checked —
    the needed works exist and are used heavily (Targum Jonathan on
    Leviticus 438 anchors, Onkelos Numbers 437). Different mechanism.
    Display-probe-invisible: `Targ.`/`ib.` sit outside the anchor.

- **entry-final-comma** — NEW, and *** CONVERGENT WITH chunk-00068's
  `trailing-comma-entry-tail` — SAME SHAPE, SAME COUNT (10), FOUND
  INDEPENDENTLY IN TWO LETTERS. MERGE AT CONSOLIDATION. *** 10 occ / 10
  entries, 1 in A.
  - *Jobs:* 7 are cross-reference stubs `, v. X,`; 3 are full definitions
    cut mid-flow. Both arms DEFECT (class 8); no convention arm.
  - *Null model:* field-edge separators usually *are* structural — 242
    **non-final** senses end in a comma and the next sense consumes it.
    Entry-final terminators: `.` 20,715, `,` **10 (0.03%)**, `;` 0.
  - *Falsifier:* text migrated into the following entry. **All 10
    successor entries checked — every one opens its own article.**

- **inline-inflection-sublist** — NEW. A numbered sense whose definition
  carries an inline sub-enumeration restarting at `1)` under an
  inflection label, enumerating the *inflected form's* senses. **12
  senses / 12 entries** (4 in A). Labels: Pl. 5, Part. pass. 4,
  Du./Denom./Fem. 1 each.
  - *Jobs:* one in the filtered set — CONVENTION in print, DEFECT for any
    sense-level consumer since those senses are unindexable. **And a
    trap: a naive class-2 split yields 1,2,3,1,2,3.** The unfiltered raw
    shape (159 senses with an in-text `1)`) mixes in citation-closing
    parens and duplication debris, which a splitter must also exclude.
  - *Null model:* the discriminator is *restart* vs *continuation* — of
    3,371 in-text `N)` markers, a genuine class-2 marker continues the
    sequence and closes a numbering gap (G00642 does exactly that); these
    12 restart at `1)` while the host already carries its own number.
  - Mirror of catalogued `inflection-sublist-numbering-flattened` (3),
    where the same construct was flattened into top-level siblings.
    Combined family ≈ 15.

Re-measurements:
- **`trailing-em-dash-tail` (130) and `sense-number-outside-closed-grammar`
  (111) are two halves of one event.** 132 senses end in a dangling
  em-dash; **101 are immediately followed by a sense whose number is
  `*2)`/`*3)`/`-2)`/`[1)`**, and from the other side 101 of the 114
  non-closed markers (88.6%) sit right after such a dash. Remaining
  decomposition of the 132: 13 entry-final, 10 next-sense-unnumbered, 8
  next-number-bare-`N)`. **Any transform must fix both sides in one
  step**, or it strips a dash and leaves `*3)`, or normalises `*3)` and
  leaves a doubled dash.
- **`anchor-swallows-close-paren` (494) → 525, and the repair direction
  is NOT derivable from the data.** `(<a>ROMAN), N</a>` occurs 525 times;
  `(<a>ROMAN</a>), N` occurs **0 times** and `(<a>ROMAN</a>)` **0 times**.
  There is no corpus instance of either corrected form, so whether to
  move the `)` out or the `(` in cannot be decided from the corpus.
  **This is why the agent did not patch G00620 and left it clean.** Needs
  a maintainer ruling before any script.
- **`h-cognate-self-link` (50) — scope is narrower than the phenomenon.**
  The probe reproduces 25 for the `h.`/`b. h.` arm, not 50, and finds a
  **20-occurrence foreign-cognate sibling the row's wording excludes**:
  Syr. 16, Chald. 2, Arab. 1, Assyr. 1. The same probe picks up 14 `Ar.`
  (Aruch) self-links which are a **different job** — variant-reading
  links, not cognate claims. Null model for the cognate arm: of 190
  cognate mentions followed immediately by Hebrew markup, 118 are
  unlinked (62%), 50 link elsewhere, 20 self-link — **self-linking is a
  minority behaviour, not the convention.**

Killed with counts: *"the linker defaults homographs to I" as a blanket
claim* — dead; across all 7,529 anchors targeting a numbered member,
no-numeral displays still reach II+ 888 times of 4,595 (19%). Only the
*exact vocalized match* slice is 98.4% I, and that restriction is what
makes the candidate real. *"`Ib.` drift"* (146 of 157 `ib.` anchors
resolve to a work different from the previous anchor) — dead on the null:
`ib.` refers to the last *cited* work, which is frequently **unlinked**,
so the previous anchor is not the referent; 10 read at random, all
explained. *Lowercased book abbreviation* — 2 corpus-wide against 20,374
capitalised.

## chunk-00721 (letter P, P00391-P00420)
1 patch. 30 rows: 27 clean, 3 needs_human_judgment. ~170 anchors
compared.

- **duplicated-definition-opening-run** — NEW. A sense definition opens
  with its leading label/qualifier run repeated verbatim:
  `insep. insep. conjunct.`, `part. pass. of part. pass. of אֲחַד`,
  `(cmp. (cmp. ברץ ברח)`, `(sub. (sub. נפשו)`. Chunk instance P00403
  `(of color) (of color) to be bright, intense`. **81 occ / 79 entries**,
  letter A: 6, spread across 21 of 22 letters. Shape split: 46
  paren-qualifier, 21 anchor-run, 14 bare-label; 58 in stem-section
  senses, 23 top-level.
  - *Jobs — none found, and four ways were tried.* (a) Paren balance: of
    the 50 paren-bearing members, dropping one copy *fixes* sense-level
    imbalance in 34 and leaves 16 already balanced; **0 become worse**.
    (b) The duplicated prefix appears in the same entry's
    morphology/language_code/language_reference in **0 of 81**, so it is
    not the cross-field split convention. (c) `rejoin.ts` concatenates
    only morphology + language_code + language_reference +
    `senses[0].definition` and invents no separators — it cannot produce
    an internal duplicate of a definition's own prefix, and **58 of 81
    sit in stem-section senses rejoin never touches**. (d) 16 read in
    full: in every one the second copy continues into the real text while
    the first terminates mid-phrase.
  - *Null model:* 44,668 sense definitions, only **92** open with any
    repeated run of ≥2 characters (0.21%). Threshold-stable at
    92 / 81 / 58 for minlen 2 / 4 / 8, so the population is not
    manufactured by the probe. Control: the same immediate-repeat probe
    run *anywhere* returns 306 hits of which 154 are `</span></span>` —
    markup, a different row — which is why the prefix-anchored cut is the
    right one.
  - *Falsifier:* would have been dropped if any member's two copies
    differed, if the first copy were consumed by a field boundary, or if
    dropping a copy broke balance. All three checked: 0, 0 of 81, 0 of 50.
  - Not covered by any of the 120 rows; sweep class 6 names the shape but
    is about tails and has no catalogue row.

- **KILLS ONE OF THE FOUR UNCATALOGUED POPULATIONS.** The brief's
  residual class E, ה↔א arm: 292 occ / 277 entries (260 ה→א, 32 א→ה).
  **Killed — the arm is ≥97% convention.** 204 (69.9%) have the display
  declared in the target's own `alt_headwords`, an acceptable difference
  under sweep-v4. Of the 88 residual, 82 have no entry of their own (the
  target is the corpus's only lexeme; several are self-links back to the
  host). Only **6 corpus-wide** have a competing own entry *and* no alt
  warrant, and reading all 6 leaves 2–3 arguable, already owned by
  `homograph-collapse-link` / `alt-headword-collision`. *Null model:* 875
  of 8,255 א-final headword skeletons (10.6%) have a ה-final twin **by
  Jastrow's own lemmatization** — the pair is a construction property of
  the dictionary, not evidence of a resolver fault.

Other kills: geresh abbreviation in the printed plural list — real but
already owned; 1,101 anchors whose geresh display is a declared
`plural_form`/`alt_headwords` value of the host, 325 resolving back and
776 elsewhere, of which 157 have a target beginning with the abbreviated
consonants (plausible expansions) and 619 do not. Two jobs, and four
existing geresh rows already split them. Immediately repeated
parenthetical `(X) (X)` as its own row — 14 occurrences, subsumed by the
candidate above. Asterisk-prefixed `data-ref` — clean negative, 1,339
headwords legitimately begin with `*`.

Re-measurements:
- `geresh-abbrev-fixed-sink` (572) — hard number for one member: **עִי׳
  occurs 19× across 19 distinct hosts, 17 sinking to עִבְרַי**. Broader
  shape: **60 distinct geresh displays with ≥5 distinct hosts and exactly
  one target, 736 occurrences.** Possibly under-measured, **but the 60
  include the one-letter forms owned by `geresh-letter-numeral-mislink`**
  (א׳ 72 hosts, נ׳ 40, ה׳ 34), so 736 is not a clean addition — overlap
  flagged rather than folded.
- `midrash-tehillim-wrong-psalm` (49) — new instance P00403 (display
  "Midr. Till. to Ps. CXVIII, 7" → `Midrash Tehillim 109:7`).
- `geresh-letter-numeral-mislink` (608) — two new instances in P00395,
  left `clean` per v4's de-scoping of one-letter geresh displays, noted
  so the maintainer can overrule.

Clean negatives: every remaining divergence across ~170 anchors resolved
to a documented convention. P00415's עָזִיל/עֲזִיל sits on a skeleton
shared by two headwords, so the narrowed carve-out could not apply
blindly — **both read, and the link to the participial noun is right.**
P00392's `rare-dotted-variant` on "Az." **rejected**: it is an
English-gloss abbreviation of the headword Azazel mirroring the Hebrew
ע׳ in the same sentence, not a citation-source abbreviation in the
Ab./Ar./Af. family the detector compared it against.

## chunk-00610 (letter N, N00182-N00211)
3 patches (N00186 class 7 byte-conserving; N00201 class 2 swallowed
`—2)` closing the 1..2 sequence; N00207 class 6 duplicated
`v. Del. Prol.; `). 30 rows: 21 clean, 2 repaired, 1 needs_print_check,
6 needs_human_judgment. ~180 anchors compared.

- **containment-fallback-mislink** — NEW. A Hebrew anchor display whose
  exact string is not itself a headword resolves to a *longer* headword
  that merely contains its skeleton, while a same-skeleton headword
  exists. **22 occ / 22 entries**, 3 in letter A. Two fixed sinks
  dominate: `נגד → אִינְגַּד` (11/11) and `נִימוֹס → אַבְנִימוֹס` (5/5).
  - *Jobs: three.* (a) **DEFECT, 16** — the two sinks; hosts are entries
    about drawing/pulling or about *nomos*, where אִינְגַּד ("go
    further!", a single Git. 58ᵃ idiom) and אַבְנִימוֹס (the proper name
    Oenomaus) are impossible readings. (b) **CONVENTION, 2** — plene
    double-vav spelling variants where the display skeleton has no entry
    and the target is the same word. (c) **CONVENTION/ambiguous, 4** —
    the containing headword genuinely is the lemma or a redirect
    shortcut (`גַּבְיָא→מַגַּבְיָא` where גַּבְיָא III's whole definition
    is ", v. מַגַּבְיָא"). Precision 16/22 = 73%.
  - *Null model:* containment routing is **not** the corpus's general
    behaviour — of 9,859 unvocalized multi-letter Hebrew displays, 8,652
    (87.8%) resolve inside their own skeleton. Within the `נגד` family
    itself **all 37 correctly-pointed displays reach their own vocalized
    headword and 0 reach אִינְגַּד**: the sink fires only when
    exact-string lookup fails.
  - *Mechanism is identical to catalogued `geresh-abbrev-fixed-sink`
    (572)* ("target not beginning with the abbreviated consonants") —
    **this is its non-abbreviation arm, and the two should be sized and
    sequenced together, not transformed separately.**
  - *Falsifier:* all 16 contexts read — every one is an etymological
    "(נגד)" or "v. נִימוֹס" cross-reference, none cites Git. 58ᵃ. Would
    also be falsified if pointed displays sank too; they don't.

- **Killed with counts: "affix-stripped root fallback"** (display =
  prefix + target skeleton), which looked like a mislink class from two
  chunk entries. Measured: **201 occ / 181 entries**; the dropped
  prefixes are exactly the stem/derivation set (א 61, נ 47, אי 19, את 17,
  ו 10, י 8, הת 7, נת 7). **In 189 of 201 the display skeleton has no
  entry at all**, and a 20-member read is overwhelmingly *correct* lemma
  resolution (`אִינְשֵׁי→נְשֵׁי`, `נִפְטַר→פָּטַר`, `נִנְעַר→נָעַר II`).
  CONVENTION. **The agent then declined to escalate its own N00207 case
  because of this null model** — and kept N00205 only on separate
  semantic grounds.

Re-measurements:
- **`initial-niqqud-drop` (76) — the row is described as cosmetic and is
  actually a mislink generator.** Under a strict rule (first consonant
  unpointed, rest fully pointed, next letter not a mater) exactly **3
  headwords** carry the shape: M02891 `משַׁךְ`, H01850 `חשֶׁךְ`, K01334
  `כּשְׁתְּ` (0 in A). **When the drop lands in the headword slot the
  entry becomes link-unreachable: 38 of 40 skeleton-matching anchors
  resolve to a sibling instead.** For משַׁךְ it is 0 of 22 — including
  **11 displays spelled correctly `מָשַׁךְ`, all of which land on the
  Aramaic `מְשַׁךְ I`**. Repointing 3 headwords fixes ~36 anchors.
- `geresh-abbrev-fixed-sink` (572) — corroborated with a measured slice:
  `נִי׳ → מני` in **23 of 23** occurrences across 23 unrelated N-letter
  hosts. Uniform, so per-entry escalation of this family is low-value for
  reviewers.
- `binyan-head-form-mislinked` (127) — N00202's `אִתְנַדֵּב → נְגֵב` is a
  textbook member: the target sits one consonant from the *host*
  headword, matching that row's 103-of-137 finding.
- **AN ORPHAN POPULATION, larger than the audit thought.** The
  `homograph-collapse-link` audit removed "97 resolving outside the
  skeleton set entirely (a different row)" — but **no row in the 120 owns
  it.** Measured here (unvocalized ≥3-letter display, target skeleton
  differs): **1,207 occ / 1,065 entries**, of which 233 had an
  exact-skeleton headword available and 974 did not. Mixes variant-reading
  links, corrigenda and the 22 above. **Not proposed as a row — flagged
  as unowned and ~12× larger than the audit's figure.**

Hints: 3 accepted, 3 rejected. One rejection is worth carrying — N00207's
`Prol.` vs `Prov.`: the comparison token is wrong (Prov. = Proverbs), but
**the hint pointed at a real anomaly the detector had mis-framed**,
`Del. Prol.` ×2 against `Del. Proleg.` ×19, escalated as class 8. N00211's
bare `L` rejected: it is the Roman numeral 50 ("Pirké d'R. El. ch. L"),
and bare Roman after `ch.` is the norm at 1,189 bare vs 102 dotted.

Clean negatives: 21 of 30 clean after comparing every anchor. Convention
shapes confirmed and left silent: `same`/`preced.`/`next w.` navigation
(all resolving to the adjacent headword, and these are `X ch. same`
cognate entries per the round-2 re-measurement), Aramaic emphatic,
geresh, alt-headword and cross-field parenthetical routings, and the
`" (b. h.) "` preamble lead senses — catalogued
`preamble-stranded-lead-sense`, explicitly *not* implied-one.

## chunk-00482 (letter L, L00173-L00202)
0 patches — no patchable defect in the chunk. 30 rows: 22 clean, 6
needs_human_judgment, 2 needs_print_check. Both preamble lead senses
judged NOT implied-one per the carried-forward warning; both trailing
spaces judged structural separators.

- **plural-to-feminine-final-letter-mislink** — NEW. A printed plural
  (`—Pl. Xִים, Xִין`) whose anchor resolves to the entry's feminine
  `Xִית` sibling — the skeletons differ only in the final letter.
  **68 occ / 57 entries**, 2 in A. 58 of 68 displays are in the host's
  own `plural_form`.
  - *Jobs: two.* (a) DEFECT, 58 — the host's own printed plural,
    mislinked (C01080 גַּנָּב "Pl. גַּנָּבִים, גַּנָּבִין" → C01085
    גַּנָּבִית "f., inclined to steal", whose own plural is
    גַּנָּבִיּוֹת). **Both plural variants of one entry usually land on
    the same wrong target, so the arm comes in pairs.** (b) UNDETERMINED,
    10 — display is a variant reading (`Ms.`, `read`) rather than the
    host's plural; overlaps `corrigendum-reading-linked`.
  - *Null model:* could a `-ין/-ים` display legitimately be the plural of
    a `-ית` headword? 500 corpus headwords end `-ית`; 91 declare a plural
    and **81 of them `-יּוֹת`**. Only 6 declare `-ין/-ים`, all with root-ת
    (בַּיִת, זַיִת, כָּתִית, לִילִית, פָּתִית, שִׁית). Exactly one could
    produce a member of this shape and it is not among the 68. **Base
    rate of a legitimate member ≈ 1/500.**
  - *Falsifier:* all 68 targets' morphology and `plural_form` checked —
    they are `f.` entries with `-יּוֹת` plurals. Several *do* reference
    the host (`גַּנָּבִית` is "denom. of גַּנָּב"), **which explains why
    the resolver lands there but does not make the plural theirs.**
  - Coverage: 58 of 68 sit inside `plural-inflection-anchor-escapes-entry`'s
    "crispest core" — **this is its most defensible deterministic slice,
    provable without reading the target.**

Re-measurements:
- *** CONVERGENT WITH chunk-00306, INDEPENDENTLY, WITH THE MECHANISM
  NOW PROVEN: `trailing-em-dash-tail` (130) × `sense-number-outside-
  closed-grammar` (111) ARE ONE DEFECT COUNTED TWICE. *** 132 senses /
  130 entries end in an em-dash (entry count reproduces exactly), and
  **101 of the 132 (76.5%) are immediately followed by a sibling whose
  `number` is `*N)`.** The mechanism is proven by contrast: of 5,442
  `—N)` markers **0** have a stranded em-dash on the previous sibling;
  of 2,644 plain `N)` at position >0, only 8 do; but of the 107 `*N)`
  markers, **101 (94.4%) carry the residue.** The upstream marker regex
  captures `—` before a digit but **not across an asterisk**, so print's
  `—*2)` splits into a tail `—` plus a number `*2)`.
  **Reading changes: the em-dash is not debris to delete — it is the
  following marker's separator, and the repair is to rejoin it, not trim
  it.** Residual after the asterisk arm: 16 last-in-list, 7
  next-sense-unnumbered, 8 plain `N)`.
- **`geresh-abbrev-fixed-sink` (572) is ~2.7× under-measured, and its
  mechanism is `abbrev-in-alt-headwords`.** 3,537 geresh-bearing displays
  corpus-wide; 2,135 resolve to an entry registering that abbreviation in
  its `alt_headwords`, only 305 of those self-links. **1,538 occ / 1,343
  entries (134 in A)** match this row's exact wording — target does not
  begin with the abbreviated consonants, and the alt-key is the only
  thing connecting display to target. They concentrate on 547 sinks, of
  which **148 serve ≥3 unrelated hosts, accounting for 967 occurrences**
  (שִׁי׳→שִׁבְהוֹר 37×, פִּי׳→פְּגִימִין 27×). Since v4 rules that a
  geresh display abbreviates *its own* entry's headword, **a sink serving
  3+ hosts cannot be right for all of them**; 215 of the 1,830 alt-key
  escapes are class 11 outright by that rule.
  - **This contradicts a line in `abbrev-in-alt-headwords`'s audit** —
    "what is lost is the variant as a search key". The abbreviated items
    *are* being used as link keys, and that is what breaks the anchors.
  - Corroboration: batch-02's known catchable miss A01525 falls out of
    this probe.
- **Reproductions with no change:** `corrigendum-reading-linked`
  reproduces **exactly** — 356 anchors followed by `(corr. acc.)` across
  330 entries. *(Note for consolidation: chunk-00068 measured the same
  row at 898/797 by widening the marker's punctuation. The two are not in
  conflict — this chunk reproduced the row as written, that chunk
  measured what the row's predicate should cover. The row needs a
  decision on scope, not a tie-break on arithmetic.)*
  `sense-number-outside-closed-grammar`'s token census also reproduces
  (`*2)` 74, `*3)` 19, `*4)` 9, `-2)` 5, `*1)` 3, `*5)` 1, `*6)` 1,
  `[1)` 1 = 113).

Killed with counts:
- *Intra-entry vocalization-split target* — 1,691 occ / 783 entries, but
  the dominant job is a vocalized lemma citation paired with an
  unvocalized quotation mention, both links correct. Restricting to
  both-vocalized leaves 942/409, and reading 30 shows two inflections of
  one lemma (בְּנוֹת/בָּנוֹת). Convention.
- *In-entry witness rule* — only 33 entries corpus-wide. Too small for a
  row, **but kept as a zero-reading precision probe** for
  `plural-inflection-anchor-escapes-entry`; it surfaces P00288
  (עוֹמְרִים→עוֹמְדִים), a clean ר/ד mislink.
- *Final-position single-consonant divergence as a whole* — 1,206 occ /
  1,096 entries, uncatalogued since `interior-consonant-mislink` excludes
  the final slot. **Not raised as one row because the population is
  mostly morphology:** ה→א 220, ה→י 137, ן→א 131, י→א 125, ן→ם 99 —
  Hebrew/Aramaic emphatic and construct alternations, all convention.
  Only the ן/ם→ת arm (the 68 above) and a graphic-confusion tail (ם→ר 10,
  ד→ר 6, ר→ד 5) are defect-shaped. *Side note:* an interior recount gives
  824 occ / 767 entries against `interior-consonant-mislink`'s 495,
  consistent with that row's own "count swings 464–708 by rule" caveat.
- *`Ms.`/`Var.` variant readings linked* — 1,096 occ / 985 entries, 698
  sharing the target's skeleton (a spelling variant resolved to its
  lemma, convention). **Exposes a live contradiction between two
  catalogued rows:** `plural-inflection-anchor-escapes-entry`'s audit
  carves `Ms.`-cued anchors out as "leaving the entry is the point",
  while `corrigendum-reading-linked` treats "the text denies the
  identity" as the defect. **Only the 398 skeleton-diverging members can
  be defects under both readings.**
- *quotes[] translation truncated at an abbreviation period* — dead on
  arrival; `quotes` is dropped from v2 truth.

Clean negatives: of the four uncounted populations the chunk touches only
one — no `plural_form` geresh, no ASCII gershayim in any Hebrew field
(the ASCII quotes present are HTML attribute delimiters only), no
double-wrapped JT citation.

## chunk-00392 (letter I/ט, I00543-I00572)
1 patch (I00545, class 7 byte-conserving). 30 rows: 21 clean, 1
repaired, 3 needs_print_check, 5 needs_human_judgment. All 8 hints
judged — 6 accepted, 2 rejected.

**Three NEW "work absent from the linker's table" candidates**, all
sharing one null model: comparable works in the same corpus link at
**85–93%** (Yalk. 3,619/4,241 = 85%, Pesik. R. 765/823 = 93%, Sifré
580/645 = 90%). Against that background a 0% rate is a missing work-name
entry, not the ambient rate.

- **tanhuma-never-linked** — **1,355 occ / 1,137 entries** (A: 65).
  **No `data-ref` anywhere in the corpus names Midrash Tanchuma.** Three
  arms, all DEFECT: standard `Tanḥ. <parasha> N` 985; `Tanḥ. ed. Bub.`
  305 — **a different Sefaria text (Midrash Tanchuma Buber); a transform
  must not collapse them**; `Tanḥ. ib./l. c.` 57 anaphoric refs needing
  the antecedent, not a work table. The one CONVENTION arm, `R. Tanḥ`
  (the amora), is 2 occurrences. *Falsifier:* the only 2 in-anchor hits
  are **display overruns from an adjacent anchor** (read in full), and
  Sefaria addresses the work by parasha+siman, exactly how Jastrow cites
  it.
- **pesikta-drk-never-linked** — **744 occ / 695 entries** (A: 58). Two
  arms: `Pesik. <parasha> p. N` 725, `Pesik. Zutr.` 19 (a different
  work). **Its near-twin `Pesik. R.` is a third string that links 93% of
  the time, so a naive `Pesik.` rule would rewrite correct links — the
  discriminator is the absence of `R.`**
- **midrash-petichta-unanchored** — **288 occ / 279 entries** (A: 15).
  The `introd.` (petichta/proem) locus is never linked; 0 of 288 sit
  inside an anchor. *Null model, load-bearing:* citations of **the same
  three works** that do *not* say `introd.` are anchored **1,007/1,084 =
  92.9%**; the `introd.` ones are **0/218**. The gap is the locus, not a
  reluctance to link Midrash Rabbah. Two repairs, not one: Lam. R. 170 /
  Esth. R. 47 / Ruth R. 1 point at petichta sections that **are**
  addressable (32 `Petichta` data-refs already exist in the corpus), but
  the remainder name loci with no Sefaria address — **CONVENTION/
  unfixable, and must be excluded from any transform.**

**The agent recommends folding the first two into
`mekhilta-sifra-never-linked` as one "work absent from the linker's
table" row** — same mechanism, same repair. It also corroborated that
row: Sifra 609 occ / 537 entries with 0 anchored; Mekh. 431 / 385 with 1.

Re-measurements:
- **`corrigendum-reading-linked` under-measured by 2.5–4×** — a second,
  independent measurement of what chunk-00068 found. Its own cue
  reproduces at 424 anchors / 392 entries tight and 906 / 803 with a
  ≤5-char window. **A second cue the row does not count — `(not X)` with
  X hyperlinked — adds 439 anchors / 421 entries.** *Null model for the
  new cue:* 1,259 further `(not X)` readings are left unlinked, and only
  215 of those (17%) name a resolvable skeleton — **so the linker links
  what it can resolve; the linked/unlinked split is not inconsistency.**
  Sub-jobs of the 439: 312 pure "asserts an identity the text denies" (a
  maintainer question), 58 geresh abbreviations, 30 prefix/inflection
  resolutions that are actually **correct**, 39 unrelated targets. **The
  genuinely wrong tail is small; the row's *size* is what changes.**
- *** CONVERGENT WITH chunk-00482, INDEPENDENTLY: the geresh family's
  mechanism, which no row states. *** Of 2,675 multi-letter geresh
  displays, **2,121 (79%) resolve to an entry carrying a matching geresh
  stub in its `alt_headwords`** — the abbreviation stubs catalogued as a
  lookup nuisance are in fact **the linker's resolution key**. And the
  key is ambiguous: 872 displays have exactly one candidate entry,
  **1,370 (51%) have two or more**, 433 have none — so half of these
  links are a context-free pick among stubs. This explains
  `geresh-abbrev-fixed-sink`'s fixed sinks (שִׁבְהוֹר 39 anchors,
  פְּגִימִין 27, סִבְכָא 25). **Both jobs are live in one chunk:** I00571
  `טִינּ׳ → טִינּוּף` is **correct** (mediated by that entry's own stub —
  hint rejected), while I00562 `מִטַ׳ → מְטַכְסָא` is **wrong**, mediated
  by that entry's `(מִיטַ׳` stub. **Any transform over the geresh rows
  must be sequenced against `alt_headwords`, not against display
  strings.**
- Reproduced exactly, no change: `empty-stem-section` 347 occ / **342
  entries**; `anchor-italic-no-space` 112 occ / **111 entries**.

Killed with counts:
- *Letter sub-sense markers `a) b) c)` in definition prose* — 508 occ /
  208 entries. CONVENTION: three different things (sub-sense enumeration,
  lists of homonymous rabbis, inflection lists), and **nothing consumes
  them** — only 2 senses corpus-wide *begin* with one, and no `number`
  field anywhere holds a letter.
- *"Cross-reference to a stem/sense lands on sense 1"* — killed by the
  null model: **73,344 of 73,434** Jastrow-internal `data-ref`s end in
  ` 1`. The suffix is a Sefaria segment index constant by construction,
  so the observation **discriminates nothing**.
- *Opening paren OCR'd as `l`* — n = 1 after discarding one false
  positive. Escalated per entry instead.
- *Asterisk siglum* — 1,339 asterisked headwords, 2,098 asterisked refs
  resolving correctly, **13** mismatches. Uniform convention.
- *Combining dot above on Hebrew consonants* — 1,846 occurrences, base
  characters ordinary consonants: print's notarikon/acronym dot,
  meaningful content, 99.8% encoding-consistent. Not a defect.

Notable rejected hint: I00571's `abbrev-mislink` — the geresh
abbreviates the *target*, not the host, in a defective→plene stub, so the
link is right. **A recurring false-positive shape for that rule on
`, v. X׳` stubs.**

## chunk-00408 (letter J, J00106-J00135) — *** NO NEW PATTERN ***
3 patches (J00114 doc-08 seed-confirmed implied-one: split at the in-text
`—2)` + retag host; J00135 class 6 chopped duplicate whose deletion
closes the numbering at 1,2,3,4). 30 rows: 22 clean, 1 repaired, 5
needs_human_judgment, 2 needs_print_check.

**First round-3 chunk to report zero new systemic shapes.** "Nothing in
letter J's יָדַע–יְהוֹשׁוּעַ run recurs mechanically that the 120-row
catalogue does not already own. Every candidate I built either died on
its null model or resolved into an existing row." Two re-measurements are
the whole yield.

- *** CONVERGENT WITH chunk-00285, INDEPENDENTLY: `doubled-space-as-text-
  loss-locator` must NOT be widened — and it has three jobs, not one. ***
  Round 2 flagged it under-measured by ~92 markup-hidden entries with
  "overlap not measured". Measured:

  | population | occ / entries | whole-entry paren imbalance |
  |---|---|---:|
  | literal (no tag between the spaces) | 107 / 107 | **41.1%** |
  | markup seam (tag between them: `<i>` 92, `</i>` 84) | 176 / 176 | **13.1%** |
  | union | 283 / 280 (overlap = **3 entries**) | — |
  | corpus base rate | 32,512 | **3.72%** |

  *Falsifier, and it decided it:* if the markup half had shown ~41%
  imbalance, round 2's merge would be right and the row would nearly
  double. **It shows 13.1%; merging would dilute the row's own
  corroborator to ~24%.** Round 2's 92 is exactly the opening-italic
  half; **the closing-italic mirror (`</i>`, 84) was never counted.**
  The literal 107 splits *again*: `".␣␣v."` 28 entries at 7.1% —
  indistinguishable from base rate, a lost em-dash before a final
  cross-reference (corpus norm `".—V."` 709×), **not dropped words**;
  `"␣␣["` 33 entries at **84.8% (23× base)** — the genuine loss
  locators; other 46 at 30.4%. Both doubled spaces in this chunk are
  markup seams with zero text lost.

- **`alt-headword-collision` (15) measures only one of two resolution
  directions.** At-risk anchors (display simultaneously one entry's
  headword and another's alt_headword): **2,349**. *Arm 1*, the
  catalogued direction (resolved to the **headword** owner): 2,046 occ /
  1,798 entries, 208 corroborated by citation overlap — reproduces the
  row's 1,613/187 within ~11%. **Arm 2, uncounted** (resolved to the
  **alt** owner although the display exactly equals another entry's
  headword): **294 occ / 284 entries** (33 in A), 16 corroborated.
  - *Jobs, mostly convention:* 131 of 294 have a display entry that is a
    redirect stub pointing at the target (right destination by a
    shortcut), 45 more cross-reference the target, 54 are short with no
    cross-reference, and **only 64 have a display entry that is a full
    distinct article** — that arm contains sweep-v4's own exemplar A00988
    (אָב→אַבָּא I).
  - *Null model:* 39,559 anchor displays exactly equal an existing
    headword, so exactness alone predicts nothing, and the alt_headwords
    predicate by itself is a **weak defect predictor (≥60% convention)**.
    Citation overlap does the separating.
  - *Falsifier:* if the 16 corroborated members had redirect-stub display
    entries, arm 2 would be pure shortcut convention. **0 of 16 are.**

Killed with counts:
- *"resh-for-dalet OCR in unlinkable `v.` stubs"* — 830 stubs, 335 with
  an absent skeleton. **Killed by the null model:** the average absent
  stub skeleton is one substitution away from **8.26** corpus skeletons;
  ד→ר (9) and ר→ד (7) sit at ~1.5× a uniform expectation of 5.4, while
  the top pairs are ו→י 4.2×, ה→ח 3.9×, י→ו 3.7× — **letter-frequency and
  matres effects, not confusions.** Consequence for
  `unlinked-stub-nonexistent-target` (451): **the "correct the target"
  repair its own reason invites is not deterministic.** The chunk's two
  members survive only on independent evidence (an impossible dagesh; a
  neighbouring entry), never on edit distance.
- *"Empty stem section whose binyan_form is a corrupted twin of its
  filled sibling"* — 347 empty blocks / 342 entries (reproduces
  `empty-stem-section` exactly); 150 are one consonant from a filled
  sibling, but only 6 diverge at a *root* position and 4 of those are
  weak-root variants Jastrow lists deliberately. Residue: 2, both in this
  chunk. Null: 9,072 sibling form pairs, 736 one-consonant, dominated by
  prefix morphology (ה/נ 172, י/ת 76) and conventional root alternations;
  ד/ר = 1.
- *"In-text `—N)` duplicating the next sibling's opening"* — 374 in-text
  markers corpus-wide; only 2 sit where the next sibling already carries
  N, only 1 shares a ≥15-char prefix. One entry, not a pattern.

Corroborations: J00125's `נִימוֹס`→אַבְנִימוֹס is a member of
chunk-00610's `containment-fallback-mislink` (found independently in
letter N) **and** of `alt-headword-collision` arm 2 — the two rows
overlap on it.

Clean negatives: all four uncounted populations **0** in this chunk.
Detector precision note worth keeping: 7 hints, 3 accepted / 4 rejected,
and **3 of the 4 rejections are one shape** — a patronymic name token
read as a citation abbreviation (`b. Baba.`, `b. Tema.`, `b. Levi.`),
each instance immediately preceded by `b. `. J00112's bare-`O` is the
vocative "O altar" (15 bare vocative O in glosses vs 2,195 `O.` =
Onkelos). **Cheap precision filter: suppress `rare-dotted-variant` when
the token follows `b. ` or `R. `.**

## chunk-00683 (letter O, O00966-O00995)
2 patches (O00975 — the D00919 seed shape: delete marker+duplicate, then
retag the sibling `—2)`). 30 rows: 24 clean, 1 repaired, 1
needs_print_check, 4 needs_human_judgment. Every anchor compared; the
chunk's single hint accepted (`סיל׳` abbreviates this entry's own
headword but targets סִלְסוּל, 4/4 corpus-wide).

- *** CONVERGENT WITH chunk-00306, INDEPENDENTLY AND AT NEARLY THE SAME
  SIZE: `homograph-numeral-default-i` — 1,532 occ / 1,358 entries
  (letter A: 180/162) against 00306's `numeral-blind-homograph-default`
  at 1,492 / 1,363. SAME SHAPE, FOUND IN LETTERS G AND O. MERGE. ***
  An anchor whose display is the bare vocalized base of a Roman-numeral
  homograph family and whose `data-ref` silently commits to one member.
  1,447 in sense text, 85 in `language_reference`. 1,506 of 1,532
  (98.3%) resolve to `I`.
  - *Null model, load-bearing and stated the same way by both chunks:*
    3,115 anchors carry the numeral **in the display** (print supplied
    it), distributing **I 44.5%, II 46.9%, III 7.8%, IV 0.8%**, and the
    resolver honours the explicit numeral 94.5% of the time. **So when
    print names the member it is I only 44.5% of the time; when print is
    silent the resolver says I 98.3% of the time.** If the silent
    population resembles the explicit one, roughly **800–850 of the
    1,532 assert the wrong homograph.**
  - *Falsifier, honestly unresolved:* a print convention that "bare X
    means X I" would make the 98.3% correct. The agent could neither
    confirm nor refute it — against it, print writes an explicit `I`
    1,386 times, which such a convention would make redundant. A
    proof-carrying probe (anchors inside a non-I host whose display is
    the host's own bare base) is **too small to decide: 26 cases, 25
    resolving away from the host.** **Offered with its uncertainty on the
    surface: the distributional mismatch is measured and large, the
    per-instance error rate is an estimate.**
  - *Why it has no home:* the catalogue audit explicitly **removed** 957
    same-vocalization numbered-sub-entry cases from
    `homograph-collapse-link` on the ground that "nothing collapsed" —
    **true of the vocalization and silent about the numeral.**

- **RE-MEASUREMENT: `stem-head-marker-chop` is 28, not 18 — and its
  description is false for 10 of them.** The row says the sense "ends
  with a bare chopped `—N)` marker **and nothing after it**". Probing
  without that clause: **28 occ / 28 entries**. 18 have empty residue
  (reproduces the catalogued figure exactly); **10 have residue and are
  invisible to the row as written** — `same.` ×6, `as preced.` ×2,
  `(of wine)`, `v.` (D00919, maintainer print-verified).
  - *Jobs: two, both DEFECT.* (a) *Duplicated-token residue*, 7 — the
    residue verbatim repeats the definition's own opening token; repair
    is delete+retag. (b) *Stranded real text*, 3 — `as preced.` ×2,
    `(of wine)` are the genuine opening of sense N, chopped off; **repair
    must MOVE them, not delete.** A row transformed as "delete the
    marker" would **destroy text in 3 of 28**.
  - *Null model:* of 10,186 numbered senses with definitions, only **37
    (0.36%)** are followed by an unnumbered text sibling, and 28 of those
    37 (75.7%) carry the chopped marker. Residue length is bimodal with a
    hard gap — 18 empty, 10 at ≤10 chars, **zero between 16 chars and
    unbounded**; the 42 cases with a full sense after the marker are
    ordinary class-2 swallowed markers whose next sibling is a *grammar
    block*, not a text sibling.

- **continuation-marker-fully-absent** — NEW, 9 occ / 9 entries, letter
  A: 0. The complement of that 37: a non-first unnumbered sense in a
  numbered list where the previous sibling carries **no residue at all**
  — the marker vanished entirely.
  - *Independent confirmation:* **two of the nine are already maintainer
    print-verified as exactly this shape** (K00081 "reinsert `—5)`",
    G00652 "main sense 2 is also missing its `2)` marker").
  - *Sub-shapes:* 5 clean marker-loss (repairable by `retag` inside the
    closed grammar); **4 where the seam also lost text** — the unnumbered
    sense opens with a stranded closing paren (`צָרַף) to rivet`), i.e.
    `—N) (` was eaten with the parenthetical's opening, so those need a
    print check, not a retag.
  - *Null model:* unnumbered senses are overwhelmingly *first* in their
    list — 2,408 of them (implied-one, preamble, etymology head, the
    brief's warned-off shapes). Non-first unnumbered senses number 37 in
    the whole corpus, **1.5% of that**. Position, not the mere absence of
    a number, carries the signal.
  - *Falsifier:* a print convention of a trailing unnumbered "appendix"
    sense. All 9 read in full — every one is a substantive gloss
    continuing the numbered series, none a `V.`-style note.
  - Not `continuation-marker-em-dash-loss` (71), which requires the
    marker present as a bare `N)`; these have `number: null`.

Killed: *`Pales of`* looked like a class-8 dropped period — corpus writes
bare `Pales` 10 times and `Pales.` **zero** times. The corpus norm, not a
loss, and **a bare-abbrev hint could not fire and should not.**

Corroborations: `geresh-abbrev-fixed-sink` confirmed with three measured
sinks (`שׂ׳`→סוֹכָה 6/6, `שַׂ׳`→סָהֲדָא 8/8, `סיל׳`→סִלְסוּל 4/4) — and a
mechanism note: **all three sinks begin with ס while two of the
abbreviations are שׂ, so the resolver appears to fold sin to samekh before
matching.** `ascii-quote-as-gershayim-in-body` reproduces at 2,028 quotes
/ 1,368 entries once English quotation marks are allowed for, consistent
with the audit's 1,908/1,290 — **and the agent flagged that its own first
count of 5,047 was a nested-`<span>` artifact** before reporting.

## chunk-00467 (letter K, K01118-K01147) — *** NO NEW PATTERN ***
1 patch (K01145, class 10 byte-conserving). 30 rows: 24 clean, 5
needs_human_judgment, 1 needs_print_check. All 96 anchors compared; both
hints judged (one accepted, one rejected — the flagged `safe.` is the
English gloss "man is safe.", not a corrupted `same.`).

**Second round-3 chunk to report zero new shapes.** "No new pattern was
found in this chunk. Everything I raised is a re-measurement of an
existing row." Structurally the chunk is healthy: no paren/bracket
imbalance in any of the 30 entries, no doubled spaces, no trailing
whitespace on a final sense, no numbering gaps, no swallowed markers, no
duplicated tails.

Six re-measurements:

1. **`geresh-letter-numeral-mislink` (608) — the count does not implement
   its own description.** The 608 reproduces exactly as *entries with any
   one-letter-geresh display targeting that letter's article* (607
   entries / 707 anchors) **with no host-headword condition, which the
   description asserts**. Splitting on that condition: 499 anchors / 457
   entries do abbreviate the host headword (the described job); **208
   anchors / 177 entries do not** — the geresh letter differs from the
   host's initial *by construction*, because it abbreviates a witness
   variant ("Ms. K. ב׳", "ed. ה׳", "Ar. ע׳"; 107 of the 208 sit in an
   explicit ed./Ar./Ms./Var. context). **A transform written to the
   description ("relink to the containing entry") would assert the
   variant reading *is* the lemma on all 208.** Third job: 20 anchors
   hosted inside the letter/numeral articles themselves are correct as
   they stand. *Null model:* 0 of the 208 are followed by Hebrew text,
   i.e. none is a numeral usage ("ג׳ ימים") where the article would be
   right.

2. *** THIRD INDEPENDENT MEASUREMENT OF `corrigendum-reading-linked`, AND
   THE `(not X)` FIGURE MATCHES chunk-00392 EXACTLY: 439 anchors / 421
   entries. *** Only **38 entries overlap** the corr.-acc. set and only
   **3 are in letter A** — **an A-weighted audit would see almost none of
   it.** *Null model:* 1,980 `(not X)` parentheticals corpus-wide, 1,259
   (64%) leave the rejected reading in an **unlinked** span — not linking
   is the corpus's dominant behaviour, so linking is the deviation,
   exactly as the row already argues. **Cannot be folded in blind — three
   jobs:** 292 link to the rejected form's own article (the row's job, a
   maintainer call), **101 display/target mismatches** (55 of them geresh
   abbreviations landing on unrelated words), and **46 self-links to the
   host headword**, which assert the rejected reading *is* the lemma.

3. **`interior-consonant-mislink` (495) — 45% double-counted, and its
   repair direction is wrong for part of the rest.** Its stated rule
   returns **541 anchors**, of which **241 (45%, 231 entries) have a
   display that is a *declared* inflected form of the host** — they are
   simultaneously members of `plural-inflection-anchor-escapes-entry`
   (1,417), **so two rows and two transforms own the same records**, the
   same shape the audit flagged for
   `nested-anchor-swallows-punctuation` / `nonsense-dup-anchor`. Third
   job: in the 29 `v. X` cases whose display names no corpus lemma at
   all, **28 are a one-letter OCR corruption of the target**
   (פַּנְרּוּרָה→פַּנְדּוּרָה, קוֹיְקְבָן→קוֹרְקְבָן) — **the link is
   correct and the display text is the defect, so the repair is a class-8
   print check, the opposite direction from "mislink".** *Falsifier
   honoured:* the agent expected the 132 non-lemma displays to be mostly
   corrupt text; reading a sample showed most are ordinary unlemmatized
   inflections whose links escaped to a neighbour lemma, **so it reports
   the OCR job at ~29, not at 132.**

4. **`same-anchor-positional-mislink` (374) — corroborated, and no second
   job in the residue.** Independent probe: 388 such anchors. The obvious
   second-job hypothesis was tested — that the 97 whose previous headword
   is skeleton-*related* are the legitimate cognate convention — and six
   were read (A00338 אֲגַר II Af.→אָגַר II, B01033 בָּעַט II Pi.→בָּעַט I,
   C00252 גָּדַשׁ Pi.→גָּדֵשׁ): **all are still mislinks**, the "same"
   meaning the entry's own base stem. **The round-2 correction holds.**

5. **`midrash-section-cite-as-bible-chapter` (255) — the display-side
   subset can be pinned mechanically.** Reproduced at 289 anchors / 261
   entries. The audit calls the provably-parashah subset a judgement call
   dependent on a midrash-name list; **122 of the 289 need no list** —
   the preceding token is literally `Tanḥ.`

6. **`plural-label-rendering-defeats-capture` (358) — corroborated with a
   by-label breakdown.** Capitalised `Pl.` loses 17 of 4,102; lowercase
   `pl.` loses **587 of 1,449 (40%)**; italic `<i>Pl.</i>` loses 35 of 55
   (64%).

Killed with counts: *"D. S. a. l. note" with no note number* — bare
`note)` is **681 against 637** with a digit, so the bare form is the
*majority*, not a truncation. *Space-before-colon at a bidi seam* — 2
occurrences against 2,687 normal. *Interior one-consonant **indel** as a
sibling of `interior-consonant-mislink`* — 501 anchors / 461 entries
exist, but **68% is legitimate Aramaic orthography** (א as mater 133,
ת 125, נ 82). **Reported as a scope warning: if Phase 2 widens that row's
rule from substitution to edit-distance-1, it must exclude א/ת/נ or it
imports ~340 conventions.**

Corroborations: `paren-tag-no-space` (110 no-space against 6,145 spaced);
`gloss-space-loss`; the brief's ASCII-gershayim population measured at
117 occ / 109 entries in bare RTL text plus 68 headword / 21 refs / 16
alt_headwords / 8 plural_form / 4 quotes — consistent with the ~409
estimate.

## chunk-00576 (letter M, M02274-M02303)
1 patch. 30 rows: 25 clean, 4 needs_human_judgment, 1 needs_print_check.
All 89 Jastrow anchors and 107 citation anchors compared; **zero dangling
targets**. 4 hints judged, 3 rejected.

- *** CONVERGENT WITH chunk-00721, INDEPENDENTLY AND UNDER THE SAME NAME:
  `duplicated-definition-opening-run` — 93 occ / 91 entries here against
  00721's 81 / 79. MERGE. *** The opening run of a definition is written
  twice, the second copy continuing into the real content (M02277
  `" (v. (v. צִיב) tufts or thrums…"`). Letter A: 7 entries. **68 of 93
  are the first sense of a stem section**; 25 top-level. 88 are
  byte-identical prefix repeats; **5 have an in-text sense marker between
  the copies** (`abbrev. of 1) abbrev. of יְהַב`) and **need a chained
  retag, not a plain delete**.
  - *Jobs: two, separating cleanly.* DEFECT 93 — deleting the first copy
    leaves a well-formed reading, and in 52 members it leaves behind an
    unclosed `(`. **CONVENTION 5, removed** — the English
    "gloss; gloss-extended" figure (`to be taken; to be taken away`;
    `unleavened; unleavened bread`), where the second copy is a
    *different, longer* gloss rather than the same run continued.
  - *Null model, and the decisive control is within-entry:* `(v. ` opens
    1,293 definitions and is doubled in 4 (0.31%); `(b. h.) ` 1,000/2;
    `same, ` 223/12. **Sibling stem sections of the same verb open
    singly** — in E00561 and R00565 the doubled section sits beside
    undoubled siblings, so print cannot be doubling deliberately. The
    mechanism is visible in D00132: `"as preced. Hithpa. B. Bath. 24 as
    preced. Hithpa. B. Bath. 24ᵃ"` — **the first copy stops mid-token at
    the fragment boundary.**
  - *Falsifier:* if the two copies differed the first would be *lost
    text*, not a duplicate — 88/93 are exact prefix repeats whose second
    copy is a strict superstring. And the overlap with
    `unmatched-opening-paren` was checked by reproducing that row's
    462-entry rule **exactly**: overlap is **30 of 91**, leaving 61
    unclaimed.

Re-measurements:
- **`tosefta-variant-chapter-halakha-loss` — catalogued 32, measured at
  ~558 anchors / ~520 entries.** The row measured only the single-anchor
  form (36 found, near its 32). **The corpus overwhelmingly uses a
  two-anchor split**: `Tosef. Erub. VI` + `V), 13`. Of 522 such pairs
  (490 entries), **411 give the primary anchor a chapter-only `data-ref`
  with the halakha dropped** (388 entries, **19 in letter A, so the row's
  "no letter-A rids" note does not hold at this scale**) and **111 give
  it a halakha that disagrees with print**. That 79/21 split mirrors the
  row's own 20/12 arms. *Null model reproduced independently:* **0 of
  3,085** plain Tosefta anchors whose display carries a halakha lose it —
  the loss is 100% specific to the parenthetical shape. **Overlap: these
  are the same anchors as `anchor-swallows-close-paren`, whose 494
  entries this agent also reproduces exactly (526 anchors / 494 entries)
  — two rows viewing one citation from opposite ends.**
- **`stranded-open-bracket` — 85 confirmed exactly (third independent
  reproduction of the audit's figure), plus one corpus-unique orphan.**
  Partitioning all 154 definitions with a trailing unclosed `[`: bare `[`
  + orphan `]` in a later sibling = **85**; contentful `[` + no closer =
  62; contentful + closer = 6; **bare `[` + no closer anywhere = 1, and
  it is M02277 in this chunk.** The row's description is true of 85 of 86
  bare cases, with exactly one entry outside it.
- **`corrigendum-reading-linked` (330) — a *third* cue, and this one is
  unambiguous.** Beyond `(corr. acc.)` and `(not X)`, the same mechanism
  fires on **"Not to be confounded with"**: 53 entries carry such a note,
  and in **5 of them (8 anchors)** the word being distinguished is
  anchored to the host entry itself. **Here Jastrow's own sentence is the
  ground truth, so these are unambiguous** — unlike the maintainer-call
  status of the `(corr. acc.)` arm.
- **The brief's residual class E — a deterministic slice for the ה↔א
  arm.** Under the strict rule (display skeleton ends ה, target is the
  א-emphatic of that same skeleton, **and** a headword with the display's
  own skeleton exists, so the linker had a correct choice): **62 anchors
  / 57 entries**, plus 8 reverse = **70 anchors / 65 entries**, only 1 in
  letter A. *(Consolidation note: chunk-00721 killed the broad ה↔א arm as
  ≥97% convention. These are compatible — that measured the arm as a
  whole, this isolates the sub-slice where a correct choice existed.)*
- **Null-model caution for `h-cognate-self-link` (50).** The etymology
  slot holds **77 self-links**: 75 after `b. h.` and 2 after ` h.`. In 69
  of 77 the display differs from the headword only by plene/defective
  spelling — sweep-v4's own carve-out calls that convention, **and for a
  biblical form there is no separate article for the link to promise.**
  **Any rule for this row that matches ` h.` as a substring will sweep in
  ~75 `b. h.` convention cases, 10+ of them in letter A.**

Hints, 3 of 4 rejected and each rejection carrying a detector lesson:
`rare-dotted-variant` on "bow." — the English weapon ending an italic
gloss, not `bot.` `inflection-escape-link` — the display is an attested
`alt_headword` of the target **whose entire definition redirects straight
back to the host**, the convention arm the
`plural-inflection-anchor-escapes-entry` audit identified. `bare-abbrev`
— **the period is present, outside the tag** (`<i>m</i>. means rapid
waters`): this is `label-period-outside-italic`, not a lost byte, and
**the detector cannot see periods outside italics.** The fourth was
re-characterised rather than accepted as hinted: the link resolves
correctly and the *display* carries `shuruk-as-yod-display-corruption`.

Clean negatives: **`same` anchors 4 of 4 correct** — all carry `ch.` and
resolve to the immediately preceding related headword, consistent with
round 2's 2,882. Zero dangling targets in 89 anchors. Niqqud-only
differences: 3, all inside the carve-out (exactly one headword owns each
skeleton, so no twin can be confused).

## chunk-00949 (letter T, T00343-T00372)
3 patches (T00347 class 10; T00359 class 6 chopped `—2) ` tail + class 4
retag of the sibling that lost the marker). 30 rows: 25 clean, 1
repaired, 4 needs_human_judgment.

- *** THIRD MEMBER OF THE VOCALIZED-TWIN CONVERGENCE:
  `niqqud-twin-wrong-pick` — core **156 occ / 153 entries** (184/181
  raw), against chunk-00285's 149/146 and chunk-00256's 35/34. THREE
  LETTERS, THREE INDEPENDENT DERIVATIONS. MERGE. *** A *vocalized*
  Hebrew display whose pointing exactly names a different corpus entry
  sharing the target's skeleton; the linker resolves skeleton + Roman
  numeral and **discards the display's niqqud**. Letter A: 12 core
  entries — **including A01201, the maintainer-verified batch-02
  catchable miss, found independently by this probe** (the same rid that
  defeated chunk-00285's numeral test).
  - *Jobs: three, decomposed and counted.* **DEFECT core** —
    Hebrew/Aramaic cognate mis-resolution: Jastrow writes the
    Aramaic-pointed cognate (חֲגַר, קְטַר, זְמַר, טְפַח) with the Roman
    numeral of its *Hebrew* article, and the linker lands on the Hebrew
    entry when the display's own pointing names the Aramaic sibling.
    **CONVENTION/other row, 26, mechanically separable** — the *target's*
    headword is missing points the display has, so display and link are
    both right and the defect is in `headword`. **CONVENTION, ~2 of 16
    read** — the display's pointing coincidentally matches an unrelated
    homograph while the target is semantically right. Plus 2 self-links
    and ~4 of 16 undetermined. **Sampled precision ≈60% — a review queue,
    not a rewrite rule.**
  - *Null model, measured link-blind before judging anything:* of
    **26,934** vocalized displays whose skeleton is shared by ≥2 entries,
    **24,217 (89.9%) have the display exactly matching one of the
    target's own names.** The linker is niqqud-correct nine times in ten,
    so the residue is not baseline behaviour. **Second, independent
    corroboration:** taking the citation anchor immediately preceding
    each cross-reference and asking which candidate entry actually cites
    it — **28 resolve only in the display-named entry vs 5 only in the
    linked target (5.6 : 1).**
  - *Falsifier — and one fired, on the agent's own probe.* A first pass
    returned 327 hits, but **Jastrow's `*` headword prefix was blocking
    legitimate matches; stripping it cut the population to 184**, and the
    corrected figure is what is reported. Coverage checked and disjoint:
    **0 of 184** are followed by the `" ch."` token that is
    `homograph-numbering-schism`'s decisive predicate; **123 of the 124**
    carrying Roman numerals on both sides *agree*, the opposite of
    `homograph-numeral-mismatch`; and every display is vocalized, which
    `homograph-collapse-link`'s audited scope excludes by definition.
    **Not established:** whether the ~25% undetermined residue is defect
    or noise — hence the queue framing.

Re-measurements:
- **`superscript-subsection-stranded-outside-anchor` (160) — count
  semantics pinned, and a sub-class the audit omitted.** True figure is
  **182 occurrences / 160 entries**; the catalogued 160 is an *entry*
  count. T/U/V confinement confirmed exactly (T 36/33, U 98/85, V 48/42,
  zero elsewhere). Three-way split: **67 agrees / 38 contradicts** —
  reproducing the audit's numbers exactly — **plus 77 where the data-ref
  carries no sub-section at all, which the audit's 105-member measurement
  omitted. Those 77 are the safest deterministic slice: the stranded
  superscript is the only sub-section information in the record, so
  appending it destroys nothing.**
- **`same-anchor-positional-mislink` (374 anchors / 284 entries) — the
  entry count does not reproduce.** Across three readings of "non-`ch.`
  entry": 398/351, 397/350, 386/342. **The occurrence figure brackets
  374; the entry figure never comes within 20% of 284**, while letter
  A = 6 reproduces exactly in all three. The shape holds; the entry count
  needs pinning before sizing.
- **`stem-head-marker-chop` (18) — reproduces perfectly, 18/18.** All 18
  have `number == "1)"`, all followed by an unnumbered sibling with a
  definition, 17/18 sharing the byte shape. **T00359 is member 18, and it
  is patched here — the first patch pair the row has produced.**
  *(Consolidation note: chunk-00683 measured this row at 28 by dropping
  the "nothing after it" clause. Both are right about different things —
  18 is the row as written, 28 is the row's mechanism.)*
- **A flag against the `homograph-collapse-link` audit's removal
  rationale.** That audit removed 957 occurrences "where the sharing
  headwords carry only ONE distinct vocalization (numbered sub-entries)"
  as harmless. **T00359 is a counter-example:** `יורה` →
  `Jastrow, יוֹרֶה II 1` (denominative of אוּר), where Targ. Hos. VI, 3's
  `h. text יורה` is the early rain = יוֹרֶה I. **A single-vocalization
  family is exactly the case where the Roman numeral is doing all the
  lexical work and the linker has no signal.** One instance does not
  overturn the removal, **but the rationale should not be treated as
  settled.**

Killed with counts: *"Targ. Y." → Onkelos work collapse* — measured all
**3,349** `Targ. Y.` displays: 3,344 resolve to the correct work, only
**5** land on Onkelos, all 5 the `ib.` form. Too small for a row.
*Duplicated `plural_form` value* — already discarded in round 2, not
re-raised. *`one-consonant-diverge` on T00357* — rejected: the display is
**Jastrow's own bracketed emendation** (`[prob. to be read: …]`) of this
entry's headword, so the self-link is the variant-surface-form
convention, not a `v.` see-reference.

## chunk-00804 (letter Q/פ, Q01330-Q01359)
4 patches, all replayed and checked byte-exact. 30 rows: 21 clean, 1
repaired, 8 needs_human_judgment. **Includes a decided seed row: Q01352,
folded/undecided in doc-08, is confirmed implied-one** — the lead run
carries a full gloss *and* Kil. VI, 6 / Tosef. IV, 8 citations, so it is
not the preamble shape the brief warns off.

- *** THIRD MEMBER OF THE DUPLICATED-OPENING CONVERGENCE:
  `doubled-definition-head` — **88 occ / 85 entries** against
  chunk-00576's 93/91 and chunk-00721's 81/79. AND ALL THREE NAME THE
  SAME LETTER-A RIDS (A00367, A00417, A00840, A00990, A01025, A03389).
  MERGE. *** 65 of 88 sit at the first sense of a binyan sub-section, 23
  at the entry's lead sense. Sub-shapes: 52 etymology/qualifier parens,
  26 anchor-bearing, 10 bare labels.
  - *Jobs: none found, and the structural test argues the same way.* Of
    the 56 paren-bearing cases, **27 entries balance only once the
    duplicate is removed**, 16 are silent because the doubled unit is
    self-closing, 13 are unbalanced either way from unrelated causes
    already held by other rows. **Not one case needs the copy.**
  - *Null model:* adjacent identical runs of ≥8 chars anywhere in a
    definition = 854, but dominated by nested/sequential anchor markup
    already held by two rows plus coincidental within-word repeats.
    Constraining to offset 0 with a token-boundary test removes the
    coincidental class entirely and leaves 88. **The agent could not
    construct a single legitimate instance from the corpus**, and the
    nearest legitimate neighbour is *non-adjacent* and excluded by the
    adjacency test.
  - *Falsifier:* if the copies differed by one byte this would be a
    lost-text seam and deletion would destroy text — they are
    byte-identical by construction. If the doubled paren were
    load-bearing (its closer arriving later), removal would break balance
    — **zero such cases.**

- *** A GENUINE DISAGREEMENT TO RESOLVE AT CONSOLIDATION. *** This chunk
  **KILLED** the vocalized niqqud-twin shape that chunks 00256, 00285 and
  00949 all **RAISED**. Its measurement: **212 occ / 209 entries**, and
  it reproduces the verified batch-02 miss (`זְמַר I`→`זָמַר I`, 3×),
  "which is why it looked promising". Its reason for killing:
  - **At least four jobs, and no defensible subset could be carved.** 9
    are dagesh-only artefacts (`impossible-dagesh`), 38 are
    one-side-unpointed or holam-migration artefacts
    (`initial-niqqud-drop`, `holam-migrated-off-mater-vav`) — **in all of
    those the destination is right and the headword string is what is
    broken**. 16 more are excused by the target's own `alt_headwords`.
    **Even the 165 "vowel-quality differs" residue mixes real homograph
    mislinks with Hebrew↔Aramaic cognate pairs where niqqud-only
    variation is exactly the inflected/construct surface form v4 already
    carves out.** A Hebrew/Aramaic-split filter cut it only to 123 and
    still admitted the pointing artefacts.
  - Verdict as written: **"This is a blast radius, not a defect set —
    reporting it rather than raising it."**
  - **Note the shape of the disagreement:** 00256 subtracted the same
    artefact classes and got 35; 00285 got 149 and said the residual "is
    still mixed"; 00949 got 156 and called it "a review queue, not a
    rewrite rule"; 00804 got 212 and refused to raise it at all. **All
    four agree the population is impure — they differ on whether an
    impure population deserves a row.** That is a maintainer question,
    not an arithmetic one.

- **Also killed: `ch.` language label stranded at the head of a
  definition** with `language_code` empty — 95 entries (12 in A) against
  3,115 carrying it in the field, a 3.0% tail, and **in all 95
  `language_reference` is empty too, so it is a whole-block loss rather
  than an asymmetric split.** Not raised because it is the exact shape of
  `gender-in-definition`, **which was discarded at 575 — the same
  reasoning would discard this.**

Re-measurements:
- **`geresh-abbrev-fixed-sink` (572) undercounted by ~1.9×** — a fourth
  independent measurement this round. Under the row's own predicate:
  **254 families / 1,083 occurrences / 970 host entries (90 in A)**;
  dropping the multi-host requirement gives 893 / 1,755 / 1,506.
  - **Reading refinement: these sinks are deterministic constants, not
    drift** — `שִׁי׳`→שִׁבְהוֹר 39/39, `סִי׳`→סִבְכָא 25/25,
    `קִי׳`→קִבְעָא 24/24, `פִּי׳`→פְּגִימִין 27/27 — **so a transform can
    key on the (abbreviation → sink) pair globally rather than per host.**
  - **The obvious mechanism hypothesis was tested and REJECTED:** the
    sink is *not* the alphabetically- or rid-first candidate (target
    rid-ranks run 14, 30, 53, 61, 67, 1393, 763 within their initial), so
    **the lookup table's origin is still unexplained.**
  - The 572/1,083 gap may be a threshold difference rather than an error
    — **worth reconciling before anything is written against this row.**
- `same-anchor-positional-mislink` — Q01341 contributes 2 confirmed
  members of the *re-scoped* definition (no `ch.` marker, `same` inside
  Pi. and Hif. stem sections, both resolving to the immediately preceding
  unrelated root). **Five sibling entries in the same chunk carry `same`
  under a real `ch.` marker and all five resolve correctly** — counted as
  negatives.

Clean negatives: all six hints judged, two rejected with reasons. **Two
flagged anchors cleared by looking the targets up rather than assuming**
— Q01340's `פורנא`→פּוּרַן is correct (the two exact-skeleton headwords
mean the wrong thing; the target is glossed "endowment", the dowry sense
the passage needs), and Q01353's `פִּיתְקָא`→פִּיתַק is correct
(`פיתקא` is absent from the corpus and the target's own article cites
that very emphatic form).

## chunk-00842 (letter R/צ, R00252-R00281)
3 patches (1 class 7 byte-conserving, 2 class 2 swallowed-marker splits,
each closing its entry's numbering). 30 rows: 16 clean, 3 repaired, 2
needs_print_check, 9 needs_human_judgment.

- **apparatus-cite-linked-as-scripture** — NEW, 8 occ / 8 entries. A
  modern bibliographic reference (Graetz *Geschichte der Juden*; Aruch
  Completum ed. Kohut) whose volume/page numbers are anchored as a
  biblical chapter:verse, because the abbreviation collides with a
  Bible-book abbreviation. 5 × "Graetz Gesch. d. **Jud.**" → Book of
  Judges; 3 × "ed. **Koh.**" → Ecclesiastes. Letter A: 2. Sibling of
  catalogued `rabbi-name-linked-as-bible-book` (41).
  - *Jobs, and the display does not separate them:* 71 anchors display
    `Jud. …` — 66 genuine Judges citations, 5 Graetz volumes; 95 display
    `Koh. …` — 92 genuine Ecclesiastes, 3 Kohut volumes. **The
    discriminator is the preceding apparatus cue, never the display.**
  - *Null model:* apparatus references are normally **not** linked — 26
    apparatus markers occur 9,659 times, and hand-checking the
    linked-adjacent cases shows the anchor is the *following* real
    citation. Sharpest control: "Berl. Targ. O. II, p. NN" — **11 of 11
    unlinked**, though "Targ. O." is a live link token.
  - *Falsifier, with an independent check:* a census of Bible data-refs
    with verse > 90 (impossible outside Ps 119) returns exactly **3
    corpus-wide — and 2 of the 3 are members of this row** (Judges 4:168,
    Ecclesiastes 4:235). The third is a plain number corruption, a
    different shape.

- **italic-swallows-close-paren** — NEW, 8 genuine of 10 raw / 10
  entries. An `<i>` run swallows the closing paren of a parenthetical
  opened in plain text before the tag. Italic-side mirror of
  `open-paren-in-anchor-display` (214), `open-paren-in-rtl-span` (89),
  `anchor-swallows-close-paren` (494).
  - *Jobs:* 2 of the 10 raw hits are not paren damage but lettered
    sub-sense markers `a)` inside an italic — CONVENTION.
  - *Null model:* 47,028 italic runs corpus-wide, 46,990 paren-balanced —
    a 0.02% tail. **The inverse direction (italic with surplus `(`) is 0
    of 47,028, which is what a boundary-drift defect predicts and a print
    convention would not.**
  - Not byte-conservingly repairable (needs an extra `</i> <i>`), so
    escalated rather than patched.

- **Raised as a MODEL-EXPRESSIBILITY GAP, not a transform:** in-text
  lettered sub-sense markers `a)`/`b)`/`c)` — 374 occ / 190 entries. 235
  introduce a sense subdivision, 139 are inline prose enumerations
  (CONVENTION). *Falsifier checked:* if the pipeline ever captured a
  lettered marker in `number`, the inline ones would be an extraction
  miss — **it never does (0 of 32,512)**. So this is the same kind of
  gap as `common-gender-inexpressible`: **a Phase-2 model decision, not a
  per-entry defect.**

Re-measurements:
- **`unmatched-closing-paren` (1,604) has a large marker null.**
  Entry-level, tags stripped, 748 entries carry surplus `)`. Under a
  strict marker rule (`—N)`, definition-leading `N)`, lettered `x)`),
  **302 (40.4%) are fully explained by sense-structure markers**, 176
  partially, 270 (36.1%) have none. **A `)` from an in-text sense marker
  is not a lost `(`.** 748 does not reproduce 1,604, so the row's scope
  needs stating. **Proof inside the chunk: R00266 and R00256 are
  surplus-`)` members *only* because of their swallowed `—2)`, and the
  split patches remove them from the row.**
- **`h-cognate-self-link` (50) is blind to its largest locus.** Anchors
  in `language_reference` whose data-ref is the entry's **own** headword:
  **87 occ / 85 entries, 83 under a `(b. h. …` etymology** — the biblical
  defective spelling linked back to the article you are already reading.
  A definition-side probe with the row's own rule returns only 25/25, so
  **the language_reference locus is essentially disjoint and ~3.4×
  larger.**
- **`corrigendum-reading-linked` contains a CONVENTION arm.** R00268
  links three readings the text marks "corr. acc." and both resolve to
  **real purpose-built stub entries whose entire definition redirects
  back to the host**. **Linking an erroneous reading to a redirect stub
  for that reading is correct behaviour**; the row's job decomposition
  must carve this arm out before any transform.

Corroborations: **geresh in `plural_form` = 1,131 occ / 1,007 entries,
reproducing the brief's figure exactly.** `trailing-whitespace-definition`
(10) — R00262 confirmed as one of the 10, and the census reproduces at
exactly 10 for final senses.

Killed: `,)` comma before a closing paren — 114 occ / 109 entries, but
sampled members are unambiguously Jastrow's print habit for interpolated
alternatives (`(seized,)`, `(a rider,)`). Anchor display overrunning into
body text — only **5 of 96,691** citation anchors carry Hebrew in the
display. Out-of-range citation numbers as a class — after the safe >90
census only 3 survive, 2 belonging to the candidate above.

Hint note worth keeping: **R00263's `exact-headword-diverge` premise is
false and the finding still upheld.** The hint says the display "is
itself a headword" — it is not, the skeleton occurs in no headword and no
`alt_headwords` corpus-wide. The link is nonetheless class 11.

## chunk-01050 (letter V, V00080-V00109) — *** NO NEW PATTERN ***
0 patches — every finding is a class-11 link destination or a
grammar-block structure defect, neither expressible in the op grammar,
**and the agent declined the one technically byte-conserving `data-ref`
rewrite because the `homograph-numbering-schism` audit is explicit that
superscript re-targeting is a maintainer call.** 30 rows: 23 clean, 7
needs_human_judgment. 191 anchors compared.

**Third round-3 chunk to report zero new shapes.** It also stated its
escalation policy so it can be checked: *semantic link destinations
escalate; catalogued corpus-wide markup/typography rows do not* — which
would otherwise make all 30 entries `needs_*`.

- *** A CONTRADICTION INSIDE `same-anchor-positional-mislink` — THE ROW'S
  TWO RULES DISAGREE ON 101 ANCHORS. *** Reproducing round 2's re-scoped
  predicate gives **392 anchors / 350 entries** against the catalogued
  374/284. **101 of the 392 (90 entries) have host and target skeletons
  that are outright IDENTICAL** — homograph siblings (`פְּרַג II`→`פְּרַג
  I`, `רָעֵב II`→`רָעֵב I`). **Round 2's convention carve-out
  ("skeletons RELATED ⇒ legitimate cognate convention") calls them
  convention; the re-scoped predicate calls them defect. Both rules are
  in the same row.**
  - **V00088 is the proof text that the carve-out is the one that's
    wrong:** host `תְּגַר` and target `תגר` are skeleton-identical, and
    the target is an unvocalized corrigendum stub meaning "to gird" — a
    `same` in a trading verb's Ithpe. section pointing at it is
    indefensible.
  - Separately, a clean cheap slice: 197 `same` anchors resolve to an
    **unvocalized** headword; 142 are `ch.` hosts (legitimate) and **55
    are not**.
- **`corrigendum-reading-linked` — a FOURTH independent measurement, and
  the row's stated reason is wrong.** Pre-anchor cue `(not …)`: **459
  linked anchors / 441 entries, overlap with the post-anchor cue exactly
  0.** Union 854. **The row's reason says "Uniform linker behaviour
  either way." It is not uniform:** of 1,536 `(corr. acc.)` corrigenda
  only **424 (27.6%)** have their reading linked; of 1,707 `(not X)`
  corrigenda only **443 (26%)**. **Two independent cue families, same
  ~27% rate — linking a denied reading is the *minority* behaviour, which
  strengthens the defect reading considerably. A 27% behaviour is noise,
  not a convention.**
- **Geresh in `plural_form`: 1,131 occ / 1,007 entries — byte-for-byte
  the brief's figure, independently derived** (34 in letter A). Confirmed
  still uncatalogued.

Killed: **`quotes-translation-truncated-at-href`** — found, measured, and
**perfectly uniform: 21 of 21** translation slots containing an anchor
are truncated mid-`href`, zero survive, all cutting at the first `.` of
the Sefaria path. A clean deterministic extractor bug. **Killed anyway
because `quotes` is dropped from v2 truth** — and then the agent checked
whether the same splitter damaged any *surviving* field: **0 occurrences
across every non-`quotes` field in all 32,512 entries. It does not
transfer.** *"Anchor target is a corrigendum stub"* — 589 inbound anchors
into "read:" stubs, but **Jastrow lemmatizes rejected readings precisely
so they can be looked up**, so a `v. X` into such a stub is correct by
design; narrowing leaves ~10 real defects. *`morphology` "f."
contradicted by a masculine plural* — 270 of 4,175 (6.5%), and Aramaic
feminines routinely take `-ין`, so **no separation from the null**.

Clean negatives: all 30 entries paren/bracket balanced, zero class-8.
ASCII gershayim outside `dir=rtl` **0**; JT double-wrapped **0**; class E
**0**.

## chunk-01014 (letter U, U01142-U01171)
1 patch. 30 rows: 17 clean, 9 needs_human_judgment, 3 needs_print_check,
1 repaired. ~200 anchors compared; all 6 hints judged (4 accepted, 1
accepted-with-note, 1 rejected).

- *** CONVERGENT WITH chunk-00223, INDEPENDENTLY: `shin-sin-dot-drop` —
  89 occ / 77 entries here against 00223's `shin-dot-drop` at 38 / 34.
  FOUND IN LETTERS D AND U. MERGE — and note the two derivations differ,
  so consolidation must pick one. *** A Hebrew ש in an otherwise-pointed
  token that has lost its shin/sin point (U+05C1 / U+05C2) while the form
  it names carries the point. Letter A: 7. Fields: sense text 71,
  `plural_form` 8, `headword` 5, `refs` 4, `language_reference` 1.
  - *Jobs — and the second is 93% of the naive count.* The raw
    population is **1,269 occurrences**, splitting into: proclitic
    relative ש־ written bare before a pointed word (**1,167 / 705
    entries — CONVENTION, removed**); shin carrying a vowel or dagesh but
    no dot (68 — DEFECT); word-final shin, no vowel expected, no dot (21
    — DEFECT); bare medial shin mixed with other pointing corruption (16
    — unresolved, excluded).
  - *Null models, measured on each comparator rather than assumed:* a
    shin carrying a vowel or dagesh inside a pointed token is dotted
    **99.65%** of 19,401 instances (the 68 are a 0.35% tail); a
    word-final unvowelled shin is dotted **99.17%** of 2,538 (the 21 are
    0.83%); **the proclitic position is dotted only 47.97% of 2,241 — a
    coin flip, free variation, so absence there carries no signal at all.
    This is why the raw 1,269 must not be reported.**
  - *Falsifier:* if the corpus rendered these words dotless generally the
    *targets* would show the same gap. 28 of the 89 sit inside anchor
    displays with a Jastrow `data-ref`, and **28 of 28 targets carry the
    point the display lost. Zero counter-examples.**
  - **Sharpest sub-case:** 5 members are in the `headword` field itself.
    Each is the corpus's *only* spelling of that lemma — no dotted twin
    exists — and **the adjacent entry's `refs[]` repeats the same dotless
    string**, so the reference resolves only because both sides are
    equally wrong. **The corruption is invisible to any link-integrity
    check.**

- *** INDEPENDENT CONFIRMATION OF chunk-01050's CONTRADICTION FINDING,
  AND THE SAME 101. *** Reproducing `same-anchor-positional-mislink`'s
  crisp subset gives **393 occurrences**, within 5% of the catalogued
  374. Splitting by host-vs-target skeleton:
  - **101 occurrences / 90 entries have identical skeletons** — the same
    figure chunk-01050 reached independently. Of these, **21 hosts do
    carry a `ch.` marker somewhere in their text or
    `grammar.language_code` even though `language_code` does not — so the
    row's `language_code`-only test admits 21 legitimate cognate
    references as false positives.**
  - Of the remaining 80, **48 occurrences / 44 entries are explicitly
    numbered homograph siblings** — `חוּךְ II → חוּךְ I`, `לוּז IV → לוּז
    III`, `שָׂכַל II → שָׂכַל I`. **The link asserts an identity Jastrow
    denied by numbering the words apart.** And **the row's *other* stated
    exclusion — "skeletons RELATED ⇒ legitimate cognate" — would silently
    clear all 48. The two exclusion rules give opposite verdicts on this
    slice; any transform must be written against the `ch.`-marker rule,
    not the skeleton-relatedness rule.**
  - 228 occurrences / 202 entries: unrelated skeletons, the row's
    already-named "plainly absurd" core.
  - *Null model stated **because it cuts against the agent's own
    claim**:* 3,678 numbered homograph entries exist and **69.8% have
    their sibling as the immediately preceding headword**, so a `same`
    anchor resolving positionally to the sibling is ~70% expected by page
    layout alone — the same trap that halved `neighbor-rid-mislink`'s
    spike. **"The 48 are a defect claim on *semantics* — `same` in a stem
    section means this entry's own Kal — not on the alignment, and I have
    not tried to make the alignment carry the argument."**

- **`binyan-head-form-mislinked` (127) — a high-precision
  cross-reference-stub slice.** A narrower probe found 220 stem-head
  anchors with a Jastrow target, 88 mislinked (same order as the
  catalogued 137/127). Of those 88, **21 occurrences / 19 entries sit in
  one-sense cross-reference stubs whose entire definition is
  `", <i>Stem.</i> FORM, v. TARGET."` — and in 21 of 21 the same
  definition already carries a `v. X` anchor resolving to a real
  headword. The linker had a correct article in front of it and still
  sent the stem form elsewhere.**

Killed with counts: *superscript-digit homograph disambiguator* — **807
of 807 have a bare-base sibling entry (0 orphans)**, a complete
systematic extraction-side uniquifier. *Roman-vs-superscript mislink* —
1,114 anchors target a superscript-uniquified headword, 277 with a
Roman-numeral display, and **in 0 of 277 does a `<base> <Roman>` headword
also exist**, so display and data-ref always name the same entry.
*`</i>.X` no-space seam* — 1 occurrence against 21,961 spaced.
*Capital-verb-after-abbreviation* — 1 occurrence. Both singletons.

Clean negatives: `targum-cite-to-plain-bible` reproduces exactly —
**recommend moving it to the script-slated list, since it keeps arriving
as a per-entry escalation for a corpus-wide missing work mapping.**
`superscript-subsection-stranded-outside-anchor` corroborated without
change. Two `" (b. h.) "` lead senses dispositioned clean per the
carried-forward warning, no retag.

## chunk-00884 (letter S/ק, S00692-S00721)
0 patches. 30 rows: 25 clean, 2 needs_print_check, 3
needs_human_judgment. All 77 anchors compared; **every Jastrow target
resolves to an existing entry (0 dangling)**. All 30 entries are single
unnumbered senses — no numbering sequences, no in-text `—N)`, no
implied-one candidates, no loose binyan heads, paren balance clean
entry-wide. All 3 hints judged (2 rejected, 1 accepted).

- **v-sub-redirect-stub-mislink** — NEW. A whole-entry redirect stub
  `<headword>, v. sub <geresh-abbrev>` — print's instruction to look the
  word up under its other (usually plene) spelling — whose anchor
  resolves the abbreviation as a standalone lookup and lands on an
  unrelated lemma instead of the host's own spelling twin. Population
  **327 occ / 327 entries**; **defect arm 161**; 36 correct; 12
  undecided.
  - **Letter A: 0 — and the agent says why that matters:** the construct
    barely occurs before letter H (A=2, B=1, E=2, F=1, J=1 of 327), so
    **letter-A sampling can neither confirm nor refute this row.**
  - *Jobs: four.* (A) 36 — link already hits the host's spelling twin,
    CONVENTION. (B) 154 — twin exists, link went elsewhere, DEFECT. (C)
    12 — no twin, target shares the prefix and is usually what print
    means (S00703 verified correct), CONVENTION/undecided, **not counted
    as defect**. (D) 7 — no twin, target outside the prefix, DEFECT. The
    91+24 unanchored arm was separated out to `unlinked-v-span` /
    `unlinked-stub-nonexistent-target`.
  - *Null model — and it is reported as arguing AGAINST the candidate.*
    Alphabetical adjacency (the `neighbor-rid` trap) is ruled out: only
    25 of 209 targets sit within 3 corpus positions, 120 are >20 away.
    Prefix-matching is ruled out: 119 of 173 non-OK targets are not even
    in the abbreviation's prefix range. **But: geresh abbreviations of
    the host headword *outside* "v. sub" resolve correctly only 420/1,726
    times (24%), against 36/209 (17%) inside it — so this is NOT a
    markedly worse mechanism, it is a sub-population of a failure the
    catalogue already knows.** *What earns it a row is not the rate but
    that the correct target is **mechanically determinable** here and
    nowhere else in that family — the entry is nothing but a pointer.*
    79 of the 154 have exactly one candidate twin; the other 75 need
    eyes.
  - *Falsifier:* that the linker's targets are the articles print means.
    **157 of 161 targets never mention the host's skeleton anywhere; only
    4 do — while the twins claimed correct mention the host or the
    abbreviation 48 times (30%), a 12× difference.** Second falsifier
    ("v. sub" naming a prefix *range*) rejected: 119 of 173 targets fall
    outside the range and the host's twin is always inside it. **12
    random defect members hand-read: 12/12 wrong, 11 blatantly**
    (סֻלָּם → סֹלַת "fine flour"; מֵיעַיִם → מַעְשְׂרָא "tithe").
  - *Overlap declared so it is not double-counted:* of the 161, 21 have a
    target reused by ≥3 hosts (`geresh-abbrev-fixed-sink`'s shape), 57
    have a 2-letter stub, and **83 have a ≥3-letter stub with a
    non-sink non-numeral target — the part no existing row's description
    reaches.**

Re-measurements:
- *** CONVERGENT WITH chunk-00576: `anchor-swallows-close-paren` (494)
  and `tosefta-variant-chapter-halakha-loss` (32) ARE TWO VIEWS OF ONE
  MECHANISM. *** Measured 528 occ / 496 entries, of which **526 are a
  single shape**: `<a>Tosef. X ROMAN</a> (<a>ROMAN2), N</a>` — the
  citation split across two anchors at the parenthetical variant chapter
  (522 Tosefta, 4 Mishnah). **415 of the 526 leave the primary chapter
  anchor with no halakha** while the second anchor carries
  chapter+halakha. **The halakha row is catalogued at 32; under the
  two-anchor reading the same loss is 415, ~13× larger. The boundary fix
  and the halakha fix are the same edit** — reconcile the two rows before
  sizing either. *(chunk-00576 reached ~558/520 on the same shape from
  the other side.)*
- **`geresh-letter-numeral-mislink` (608) — the count is
  reading-dependent and the population does three jobs.** Strict (the
  row's own wording, abbreviating the *containing entry's headword*):
  **517 occ / 475 entries**. Without that condition: **707**. **The
  catalogued 608 sits between them and likely mixes them.** The
  190-occurrence difference splits: **152 abbreviate a variant reading
  named in the prose, not the headword** (defect, but a different
  repair); **20 are `ר׳` = "Rabbi" before a name** — defect, and **should
  not be a lexical link at all**; **18 sit inside the 21 numeral articles
  themselves where the numeral link is correct — convention, do not
  transform.** *(chunk-00467 reached the same split independently at
  499/208.)*
- **`truncated-read-stub` (26) — confirmed exactly at 26**, and refined:
  all 26 are the *entire* definition matching `,? read:`, not merely
  definitions ending with "read:".

Killed / not raised: **word-level English gloss substitution** (S00695
says "he said" where 9 of the 10 corpus definitions rendering חזייה say
"he saw"). Real at the entry level and escalated as class 8, **but not
raisable as a pattern** — the natural detector returns 53 of 116 and the
first 12 hand-read are all legitimate. **n=1 with no detector, and
`latin-prose-ocr-substitution` is explicitly single-letter, so no
word-level sibling is proposed on one instance.** S00716's "rend." hint
rejected: the proposed sibling `end.` is syntactically impossible in
"(rend. of קַטָּת …)"; "rend." = "rendering of", attested expanded ×2 and
paralleled by "transl. of" ×14.

Clean negatives: S00696's `קִטְבָּא ch. same` → קֶטֶב is **the legitimate
cognate convention round 2 vindicated** (both entries read, target
correct). S00710's third geresh anchor self-links correctly — **which is
precisely what shows the other two in that entry are wrong.**
