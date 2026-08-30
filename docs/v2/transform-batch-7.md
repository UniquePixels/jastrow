# Phase 2 batch 7 — the sense and definition structure family

**Status: complete 2026-08-29, pending review.** **Five rules
shipped**, **two rows re-scoped** and two withdrawn on Brian's rulings,
one entanglement edge deleted and **two added**, two gates made
phase-aware, four catalogued counts corrected. **All eight rows are
disposed.** Scope
ruled by Brian on the batch-7 opening question: the eight blocking rows
that describe sense and definition structure, 599 catalogued instances.
It is the second batch to run against the `structural-repairs` phase
batch 6b wired, and it holds the **only entanglement edge left in
`PENDING`**.

Every figure below is measured on
`applyTransforms(applyRepairs(source).entry, 'text-repairs').entry` —
the entry a structural rule actually receives — over all 32,512 entries
of the pinned snapshot (`data/source/jastrow-dictionary.jsonl`,
sha256 `4c64ff03…`). The raw-source figure is stated alongside wherever
the two differ. This is [[feedback_measure_post_repairs]] applied
before a line of rule code exists rather than after, and for the second
time in three batches it changed an answer.

## 1. The measurement

| Row | Catalogued | Measured post-repairs | |
|---|---:|---:|---|
| `trailing-em-dash-tail` | 130 ent / 132 senses | **130 / 132** | exact — **101 shipped**, §7 |
| `sense-number-outside-closed-grammar` | 111 ent / 113 tokens | **0** | **re-scoped to 6** — §2 |
| `duplicated-definition-opening-run` | 85 | **85 @ k=4** | **89 shipped** — §3, §13 |
| `empty-lead-sense` | 84 | **73 `{}` + 11 ws = 84** | exact — **withdrawn**, §9 |
| `continuation-marker-em-dash-loss` | 71 | **36** | **14 shipped**, re-scoped to 22 — §4, §16 |
| `adjacent-verbatim-repetition` | 59 | **65** | **65 shipped** — §5, §11 |
| `bracketed-gloss-lead-sense` | 49 | **49** | exact — **withdrawn**, §10 |
| `section-break-terminator-loss` | 10 | **11** | **11 shipped** — §6, §15 |

**Four of eight reproduce their catalogued count.** One of those four
(`bracketed-gloss-lead-sense`) reproduced only once a boundary condition
the catalogue states in prose was made executable — see §5.

`adjacent-verbatim-repetition` briefly looked like a fifth, at 59, and
is the batch's sharpest lesson so far: the agreement was two length caps
matching, not two measurements agreeing, and the count is **65**. §11
carries it. A number that reproduces is evidence about the predicate
only when the predicate is stated; this one was not.

`trailing-em-dash-tail` reproduces including its whole decomposition:
101 of 132 tails precede a `*N)` sibling, and the residual splits
**16 entry-final / 7 next-unnumbered / 8 next-bare**, digit for digit
what round 4 recorded. The recursive walk matters exactly as round 4
warned — a non-recursive one returns 109/108.

## 2. `sense-number-outside-closed-grammar` HAS NO POPULATION LEFT

The row is catalogued at 111 entries / 113 tokens: `*2)`×74, `*3)`×19,
`*4)`×9, `-2)`×5, `*1)`×3, `*5)`×1, `*6)`×1, `[1)`×1. **Not one of
those 113 is outside the closed grammar today, and the row's name has
been false since before Phase 2 opened.** Two independent reasons, and
they partition the row:

**107 of 113 were never outside the grammar.** `body/labels.ts`'s
`LABEL` is `/^(?<dash>—)?(?<star>\*)?(?<label>\d+|[a-z])\)$/u` — the
star is a *parsed field*, not a quarantine trigger, and its docstring
says so in the same breath as it names the two shapes that do
quarantine. All 107 `*N)` markers parse, round-trip byte-exactly
through `printLabel`, and are counted by this batch at 107 with all 107
at sibling position > 0.

**The other 6 are repaired by `applyRepairs` before any transform
runs.** `repairs.ts`'s "04 — sense-label quarantine repairs" turns the
five `-2)` ASCII hyphens into `—2)` and moves D00341's `[1)` bracket
into the sense text. Measured over the corpus, tokens that quarantine
to `{unknown}`: **6 raw → 0 post-`applyRepairs`**.

This is batch 6a's `binyan-form-*` shape for the third time, with one
difference worth stating: the row does not dissolve into *nothing*. Of
its 113 tokens, **101 are repaired by its entangled partner's rule** —
they are precisely the `*N)` markers whose em-dash is stranded on the
previous sibling, which is `trailing-em-dash-tail`'s repair — **6 by
`applyRepairs`**, and **6 remain**: `A00510`, `A02000`, `B00005`,
`M00591`, `N01131`, `P01184`, each a `*N)` with no stranded dash before
it (`A02000`'s predecessor ends `—[`, which is `stranded-open-bracket`'s
shape, not this one). Per batch 6b's principle — a partial rule must not
take its row's remainder off the queue — those 6 need a home before the
row leaves `PENDING`.

## 3. `duplicated-definition-opening-run` has no recorded predicate

Same situation as `stranded-stem-head` at 6c: a count with no statement
of how it was reached. The catalogued 85 is documented as "the middle
and best-argued figure" of three letter-scoped filters (M 91, Q 85,
P 79). Measured here as "definition opens with a run of ≥ *k* characters
repeated immediately at offset 0":

| minlen | occurrences | entries | catalogue's null model |
|---:|---:|---:|---:|
| 2 | 99 | 95 | 92 |
| 4 | 84 | 82 | 81 |
| 8 | 60 | 60 | 58 |

Those three figures carried the same 120-character cap §11 exposes, so
they are wrong for the same reason. **Uncapped**, over all 32,512
entries:

| minlen | occurrences | entries | codepoints |
|---:|---:|---:|---:|
| 2 | 103 | 98 | 3,393 |
| 3 | 94 | 90 | 3,375 |
| **4** | **88** | **85** | **3,357** |
| 6 | 81 | 79 | 3,327 |
| 8 | 64 | 64 | 3,224 |
| 12 | 47 | 47 | 3,051 |

***k* = 4 reproduces the catalogued 85 exactly, on entries.** That is
the best evidence available for what the round-3 detector actually did,
since the row records no predicate — and it is worth more than the
"middle of M 91 / Q 85 / P 79" the row offers, which is an argument
about three letter filters rather than a threshold.

The population is genuinely a text defect, unlike §9 and §10: measured
by position, **65 of the 88 sit in NESTED senses** (stem-section first
senses) and 23 at top-level index 0, with **0 at a later top-level
sense**. So it is not an index-0 artefact — most of it is nowhere near
the gloss head.



## 4. `continuation-marker-em-dash-loss` is unsettled, and its own row says so

Measured decomposition of continuation markers (`N)` with N > 1, not
first in a sibling list), tags stripped before testing the predecessor:

```
total 5,728 · with em-dash 5,445 · without 283
   ├─ em-dash stranded on previous sibling   109   (trailing-em-dash-tail)
   ├─ "[" stranded on previous sibling         80   (stranded-open-bracket)
   ├─ previous ends ";" or "," — print run     56   (convention, not a defect)
   └─ CLEAN, no residue at all                 38   ← the row
```

Those figures are measured BEFORE the structural phase. Measured after
it — where a rule for this row actually stands — the first arm has
mostly gone:

```
   ├─ em-dash stranded on previous sibling     8   (was 109)
   ├─ "[" stranded on previous sibling        79
   ├─ previous ends ";" or "," — print run    56   (convention)
   └─ CLEAN, no residue at all                36   ← the row
```

**The row's largest belongs-to-another-row arm was repaired by this
batch's own rules.** `strandedDashStarMarker` and `stemHeadMarkerChop`
rejoined 101 of the 109, which is why 109 becomes 8. Asserting the
pre-phase figure would pin a number nothing in the pipeline ever sees,
and §16 pins the post-phase one instead.

The row is catalogued at 71. Its own audit flag already records the
figure as **unsettled between 19 and 44**, from two reconstructions that
disagreed (round 2: 45/26/19; the `stranded-open-bracket` audit:
73/29/44). **36 is a fourth reconstruction agreeing with none of them**,
which is why only the witnessed core ships — §16. The 56-member `;`/`,`
arm is the catalogue's own "real finding that kills the naive version of
this candidate", and it reproduces exactly.

## 5. Two rows needed a prose boundary made executable — one of them twice

Both of these were "wrong" on first measurement, and the correction was
the same move each time: the catalogue states a boundary in a sentence,
and the detector has to encode it. Only one of the two then reproduced.

**`adjacent-verbatim-repetition` — 71, then 59, then 65.** The row reads
"a run of ≥ 8 characters ending in a period, repeated immediately and
verbatim inside one definition", and then, separately, "Distinct from
`duplicated-definition-opening-run`, which is anchored at offset 0." A
detector that reads only the first sentence returns **71**. Excluding
the match that *is* the opening run makes the two rows disjoint BY
POSITION: no single run can be claimed by both, because one matches only
at offset 0 and the other only away from it.

That is not entry-level disjointness, and saying "0 entries" — as an
earlier draft here did, measured while the opening rule was still at
`k = 8` — would be false. At the shipped thresholds the two share
exactly one entry, `I00509`, which holds a member of each at different
offsets; `duplication-corpus.test.ts` asserts that single shared entry
by name, and that the two runs differ.

**It also returned 59, the catalogued figure, and that agreement was an
accident of two matching length caps.** The true count under the same
predicate is **65** — §11, which is the finding, and the reason this
section says "one of the two" reproduced rather than both.

**`bracketed-gloss-lead-sense` — 63, then 49.** The row reads
"unnumbered first sense whose entire definition is a bracketed
etymological gloss **ahead of a correct `1)`**". Unnumbered bracketed
lead senses number **63**; those whose next sibling carries `1)` or
`—1)` number **49**, the catalogued figure. The other **14 have no
following sibling at all** — the bracketed gloss is the whole entry
(`J00023` is `[<i>to exist, be strong</i>.]` entire) — and they are a
different shape that this row does not describe and no rule here should
touch.

## 6. `section-break-terminator-loss` measures 11, and its controls are exact

Predecessor census for `—<label>` where label ∈ {Pl., Part., Fem.,
Denom.}, tag-tolerant on both sides of the dash:

```
"." 7,250   "]" 241   "?" 54   ")" 17   "!" 4   ";" 3   "’" 3
"ᵃ" 2   "…" 2   " " 2   "e" 2   "s" 1   "l" 1   "d" 1
```

Every one of the catalogue's four falsifier controls reproduces to the
digit — `]` 241 against 242, `?` 54, `)` 17, `!` 4 — and its two
false-positive families are visible in the census exactly as described:
**3 quotation-closers** (the `’`) and **2 ellipses** (the `…`), which is
why the row was cut from a 15-candidate first pass to 10.

Letter- or digit-terminated predecessors number **11**, one above the
catalogued 10: `A00519`, `C00193`, `C00952`, `G00323`, `H00068`,
`M00479`, `Q01518`, `R00440`, `S01514`, `T00980`, `V00427`. `H00068`
is the row's own published example. All 11 need eyes-on before a rule
inserts a byte.

## 7. What shipped

**`strandedDashStarMarker`** (`rules/sense-marker.ts`, id
`trailing-em-dash-tail`, `structural-repairs`) — the third rule in that
phase, repairing **101** of the row's 132 tails. The em dash MOVES from
the end of the definition into the next sibling's `number`, so the rule
deletes nothing and declares neither `removes` nor `allows`;
`fieldsOf` walks both fields, and the move is text-neutral to
`checkNoNewText` and `no-lost-text` alike.

What it writes is **unattested but not ungrammatical**, and that is the
one place it is weaker than its phase-mate. `stemHeadMarkerChop` could
argue `—2)` is the corpus's own spelling, 3,985 `number` fields deep;
`—*N)` occurs **0 times corpus-wide**. What licenses it is the MODEL —
`labels.ts`'s `LABEL` takes dash and star as independent fields in that
order, and `printLabel` regenerates `—*2)` byte-exactly — and the
reason the combination is unattested is precisely the upstream split
being repaired.

Verified on the branch: `migrate-dry` gates **32,512/32,512** on all
four, `schemaFailures` 0, `transformFailures` 0,
`brokenTopSequences` **34** and `startsAtTwo` **8** unchanged from
`v2`, `labelQuarantines` 0, and `transform trailing-em-dash-tail: 101
instance(s)`.

## 8. A gate blind spot, found by deleting an edge

Brian ruled the row **re-scoped to its 6 residuals**, not discarded,
and ruled the now-dead entanglement edge **deleted with the cluster set
pinned**. The second half of that could not be carried out as written,
and finding out why is this batch's second real finding.

After the rule ships, each row's remainder is defined by the ABSENCE of
what the other needs — 31 stranded dashes with no starred successor, 6
starred markers with no stranded dash — and measured after the whole
`structural-repairs` phase the two remainders share **0 entries**. The
edge is dead. But **neither entanglement gate can witness its
deletion**:

- `unaccountedEdges` excludes both-unregistered edges by design —
  execution order cannot be wrong about a rule that does not run.
- `entangledClusters` derives over REGISTERED rules, so this edge was
  never in a cluster to begin with. Measured directly, before and
  after: **5 clusters both times, with neither row in any of them.**

`registry.ts`'s standing claim — *"An edge DELETED from the catalogue
is not a recorded edge, so this walks past it; only pinning the cluster
set notices"* — is therefore **false for edges between two unregistered
rows**, which this one was for the whole of Phase 2. It is corrected in
place rather than left standing, and the deletion is pinned by a direct
catalogue assertion in `rules/sense-marker-corpus.test.ts` §7 instead.

The ORDER of operations turned out to matter and is worth keeping: the
rule was registered FIRST and the edge deleted SECOND, so
`unaccountedEdges` reported the surviving half-edge in the open before
it was removed. Had the edge been deleted first, nothing anywhere would
have said a word.

## 9. `empty-lead-sense`'s presumed repair is wrong for 72 of its 73

The row reproduces exactly — 73 `{}` lead senses plus 11 whitespace-only
ones, 84 — and its catalogue entry names one caveat: `rejoinGlossHead`
concatenates `senses[0].definition`, so in the 11 whitespace cases that
space is the print separator and "the presumable repair (drop the lead
sense) WOULD DESTROY A BYTE IN 11 OF 84".

**The larger objection runs the other way, and it is 72 of 73.**
`rejoin.ts:44` reads `e.content.senses[0]?.definition ?? ''`. Dropping
an empty lead PROMOTES `senses[1]` into that slot — and 72 of the 73
empties have a numbered sibling holding real text. Measured on five of
them, the gloss head goes from `" ch. "` to `" ch.  <a class="refLink"
href="/Jastrow,_אוֹכֶל.1" …` — the whole of sense 1 pulled into the
entry's lead.

**Both text gates are blind to it.** Nothing is invented and nothing is
lost; text moves between fields, which is the same class as batch 4's
`applyRepairs` collision.

**Measured at the rendered level, the repair is worse than a promotion:
it CONSUMES a sense.** `dry-run.ts:257` skips index 0 in the sense loop,
because sense 0's content is already captured in the intro sense built
from the gloss head. So the empty lead contributes an empty string and
is then skipped — it costs the reader nothing — while `senses[1]`
promoted into index 0 is folded into the gloss head by `rejoin.ts:44`
AND skipped by `dry-run.ts:257`. Building the body both ways for all 73:

| | |
|---|---:|
| built body IDENTICAL after dropping the lead | **1** |
| built body CHANGED | **72** |

```
A00644  BEFORE  gloss " ch. "                  labels [—, 1, 2, 3]   4 senses
        AFTER   gloss " ch.  <a …>same</a>. "  labels [1, 2, 3]      3 senses
```

**Brian's ruling 2026-08-29: WITHDRAWN to `judgment`**, audit
`data/patches/catalogue-audit/empty-lead-sense.md`. It shares batch 6b's
`empty-stem-section` shape and goes one degree past it — that row
withdrew because the repair was unnecessary; this one because the repair
is **harmful**. `blocking` drops with the route, since sitting on the
transform queue as blocking asserted a rule was owed before cutover.

Post-ruling: `coverage()` **44 registered / 23 pending / 67 total**, 0
unaccounted / 0 duplicated. Route totals **transform 67 / 20,235 ·
judgment 61 / 16,521 · blocked 5 / 4,947** — the transform route loses
189 instances, which is this row's 84 plus the 105 that
`sense-number-outside-closed-grammar`'s re-scope gave up, and judgment
gains exactly 84.

## 10. THE INDEX-0 ROWS DESCRIBE A SENSE THAT IS NOT A SENSE

Three of the eight rows are about `content.senses[0]`, and two of them
dissolve for the same reason. **The body model does not treat index 0 as
a sense.** `rejoin.ts:44` folds `content.senses[0]?.definition` into the
gloss head, and `dry-run.ts:257` then SKIPS index 0 in the sense loop,
because its content was already captured in the intro sense. The rows
were catalogued against the SOURCE shape, where index 0 looks like a
stray or malformed sense; in the model it is the entry's lead.

`empty-lead-sense` is §9 — withdrawn, because the repair consumes a
sense in 72 of 73.

**`bracketed-gloss-lead-sense` (49) renders correctly today, and is
WITHDRAWN to `judgment` on Brian's ruling** (audit
`data/patches/catalogue-audit/bracketed-gloss-lead-sense.md`). Its
bracketed etymological gloss is already folded into the entry's lead,
exactly where print puts it, ahead of the numbered senses:

```
B01152  בַּר I
  senses[0].definition  " [<i>empty, open</i>] "
  gloss head            "m.(b. h.; ברר) [<i>empty, open</i>] "
  built sense labels    [—, 1, 2]
```

Of the 49: **42 carry a `language_code`, 15 a `morphology`**, and only
**7** have a gloss head that is the bracket alone. In every case the
bracket lands in the lead and the numbered senses follow, unlabelled
intro first — which is the printed shape. Nothing here states what a
repair would even change, and this batch could not find a defect to
describe.

`judgment` rather than a discard, deliberately: no repair can be
stated, which takes the row off the transform queue, but asserting no
defect EXISTS would need the 49 read against print — and the 7
bracket-alone leads, with no morphology or language code to anchor the
bracket to, are the shape that could still be wrong.

Post-ruling: `coverage()` **44 registered / 22 pending / 66 total**, 0
unaccounted / 0 duplicated. Route totals **transform 66 / 20,186 ·
judgment 62 / 16,570 · blocked 5 / 4,947**.

`duplicated-definition-opening-run` is the one index-0-adjacent row that
is NOT this: 65 of its 88 members sit in nested senses, nowhere near the
gloss head. See §3.

## 11. `adjacent-verbatim-repetition` is 65, and the catalogued 59 is a cap artifact

The row reads "a run of ≥ 8 characters ending in a period, repeated
immediately and verbatim inside one definition", plus the separate
sentence that makes it disjoint from
`duplicated-definition-opening-run`: that row "is anchored at offset 0".
Encode both and the population is **65 occurrences / 65 entries**,
2,771 codepoints — not the catalogued 59.

**The 59 is what a length-capped detector can see, and the cap is not
harmless the way it looks.** A first pass here bounded the candidate run
at 120 characters, reasoning that a long duplicated run contains a short
one. It does not: the repeat is `run + run`, and a proper suffix of the
first copy is followed by the second copy's PREFIX, not by itself. Only
the FULL run repeats immediately. So a capped detector does not
under-report the run length — it misses the member entirely.

The split is exact, which is what identifies the cause rather than
merely fitting it:

| run length | members |
|---|---:|
| ≤ 120 chars | **59** |
| > 120 chars | **6** |

The six are `B01153` (128), `L00466` (126), `C00674` (131), `I00509`
(134), `K00081` (164), `U00540` (325). All six are anchor-bearing.

## 12. A rule here would delete anchors, which changes what it must declare

Of the 65 runs, **9 contain a full anchor and 11 anchors would be
deleted** — `B01003`, `B01153`, `C00674`, `I00105`, `I00410`, `I00509`,
`K00081`, `L00466`, and `U00540` with three of its own. Every one of the
65 runs is markup-BALANCED (measured: 0 unbalanced), so deleting the
second copy never breaks a tag — but it does remove links, and that has
consequences the row does not mention:

- the rule needs an `unlinks` declaration, not just a deletion;
- it cannot join `NEITHER` in `registry.order.test.ts`, whose membership
  is EARNED by a corpus pass asserting the rule removes no anchor;
- `K00081` is already on `migrate-dry`'s `deferred` list ("print sense 5
  label missing and note is unresolved — eyes-on"), so one of the 65 is
  a member of an open question.

That is a design decision for the row, not a detail of writing it, and
nothing is written here.

## 13. THE COMMUTATION GATE FOUND AN EDGE THE CATALOGUE NEVER HELD

Registering the two duplication rules made the gate report one
undeclared non-commuting pair: **`stranded-stem-head` ×
`duplicated-definition-opening-run` @ `R00223`.**

It is real, and the mechanism is exact. `R00223`'s definition opens
`<i>Pa.</i> ` and then repeats an anchor-bearing run — but that repeat
is NOT at offset 0, because the label precedes it, so
`duplicatedOpeningRun` alone finds nothing. `strandedStemHead` moves the
label into `grammar.verbal_stem` and the remainder into a child sense,
and the duplicate is then at offset 0 of that child. Measured: the
opening rule repairs **88 alone and 89 composed**, and the two orders
produce different entries.

**This is the edge class `checkAdjacency`'s own limitation note names** —
"a row whose edge was never recorded at all". It could not have been
found by reading the catalogue, because the catalogue never held it.
The batch that deleted a dead edge (§8) added a live one by
measurement, and the two arrived by opposite routes.

Consequences, all pinned:

- the edge is declared in `patterns.jsonl` on both rows;
- `strandedDashStarMarker` moved ABOVE `strandedStemHead` so the
  entangled pair occupies a gap-free span (it commutes with both, so the
  move costs nothing);
- the DIRECTION is pinned separately, the way the tosefta pair's is —
  adjacency is direction-blind, and reversed the repair at `R00223`
  simply never happens while every per-rule count still reads normal;
- the pinned cluster set goes 5 → **6**.

## 14. Two more things the gates caught, not the reading

**`removes` must be STRIPPED text.** `checkNoLostText` compares
`textOf(entry)`, which is `fieldsOf(...).map(stripTags)`, so a
declaration carrying tag bytes does not occur in the input the gate
sees — it is refused, and every codepoint the rule actually dropped is
then reported unexplained. The composed corpus run found this on
`B01003`, whose duplicated run holds a whole anchor. Both figures are
now pinned, because they mean different things: **2,771 raw codepoints
deleted, 1,799 stripped ones declared** for the adjacent rule; 3,357 and
939 for the opening one.

**Rules 1 and 4 of `registry.order.test.ts` were phase-blind.** They
assert unlink-before-retarget and unlink-before-wrap by comparing
registry INDEX, and index is not execution order across phases — a
`structural-repairs` rule runs after every `text-repairs` rule whatever
its index. So for a structural unlink rule those assertions are not
merely violated but **unsatisfiable**, and could only be "satisfied" by
registering the rule early in a list whose own comment says structural
rules sit last so it reads in execution order. This is batch 6c's
phase-blindness in a second gate, and it takes 6c's fix: SKIP, and
COUNT — 8 pairs for rule 1 (2 structural unlinks × 4 readers), 6 for
rule 4 (× 3 wrap rules).

**What earns the skip is not the phase name.** Rule 1 guards against a
retarget adopting a target off an anchor an unlink will later delete.
These rules delete a verbatim DUPLICATE, so the twin survives: measured
over all 32,512 entries, every anchor they remove leaves a surviving
copy of its `data-ref` — 30 of 30 and 11 of 11, **0 orphaned** — and
that is asserted in the corpus pass rather than argued in a comment.

## 15. The only rule in the registry that mints a byte

`sectionBreakTerminator` ships all **11** on Brian's ruling
2026-08-29, declaring `allows: ['.']` — one period per member,
inserted immediately before the em dash.

**The null model is the whole argument**, which is why it is asserted in
`rules/section-break-corpus.test.ts` rather than quoted in a docstring:
the `—<label>` boundary occurs **7,532** times corpus-wide and **7,250**
already carry their period. The four legitimate non-period enders are
refused by the predecessor class, not by an exception list — and so are
the row's own two false-positive families, which are visible in the same
census as the 3 closing quotes and 2 ellipses that cut its first pass
from 15 candidates to 10.

It is a CORRECTION rather than composition: the period is print's,
dropped in transcription, under the standing OCR ruling.

**A unit test caught the one thing that would have made it harmful.** A
first draft inserted the period straight after the letter, which for
`height, <i>hill</i>—<i>Pl.</i>` writes `<i>hill.</i>` — a fresh member
of `italic-swallowed-terminal-period` (1,331, registered). A rule
MANUFACTURING population for a sibling row is the failure batch 3b found
by hand and `stem-head.ts` names in its own deletion note. The period
now goes outside the closing tags, and the corpus test asserts over the
real members that no repaired definition ever gains a period immediately
before a closing tag.

## 16. The last row ships only what its own entries witness

Brian ruled the **high-confidence core** and nothing else. Of the 36
clean markers, **14 sit in a MIXED sibling list** — one whose other
members carry `—N)` — and those ship as `continuationMarkerDash`. The
other **22** are unmixed and the row is re-scoped 71 → **22**.

**The declaration is `copied`, not `allows`, and that is the whole
safety argument.** An `allows: ['—']` would license an em dash anywhere
in the rule's diff, corpus-wide, on a maintainer's word. `copied: ['—']`
is verified by the gate against THIS ENTRY'S input before it is
credited — and the mixed-list predicate is precisely what guarantees the
witness exists. Drop the requirement and the declaration stops being
checkable, so the predicate is load-bearing rather than decorative.

**Why 14 and not the catalogued 16.** The row names six example rids for
its core; two of them, `B00411` and `C01321`, have their bare marker
preceded by a definition ending in `[`, so they belong to
`stranded-open-bracket` under that row's own later audit ("29 explained
by a preceding definition ending in `[`"). The catalogue's 16 predates
that split, and the two rows are — in its own words — complements. The
other four reproduce, and the corpus test asserts all six by name in
both directions.

**The corpus test was self-erasing on its first run.** Measuring after
the whole structural phase meant the 14 already carried their dash by
census time, landing in `withDash`, so every assertion read 0 and passed
for the wrong reason. It now runs the phase with this rule HELD OUT.
That is 6c's `stem-corpus.test.ts` defect — a test whose subject became
implicit once the world grew — recurring within one batch of being
named.

## 17. The gate found a SECOND edge the catalogue never held

Registering the last rule produced one more undeclared non-commuting
pair: **`trailing-em-dash-tail` × `continuation-marker-em-dash-loss` @
`A00337`.**

The mechanism is the batch's own two rules meeting.
`strandedDashStarMarker` rejoins a stranded dash onto a `*N)` marker,
writing `—*3)` into a sibling list — and that **CREATES the
dashed-sibling witness** `continuationMarkerDash` requires before it
will restore a dash of its own. Reversed, `A00337`'s bare `2)` has no
witness and is never repaired, while every per-rule count still reads
normal.

So batch 7 deleted one entanglement edge and added **two**, and neither
addition was in the catalogue to be read. Both were reported by the
commutation gate before the rules shipped. The registry was reordered so
both new pairs occupy gap-free spans — `strandedStemHead` →
`duplicatedOpeningRun`, and `strandedDashStarMarker` →
`continuationMarkerDash` — with each direction pinned separately,
because `checkAdjacency` is direction-blind. The cluster set goes 5 → 6
→ **7**.

## 18. A test predicted its own failure, and the prediction came true

`stem-corpus.test.ts` asserts that `stemHeadMarkerChop` adds 18 `—2)`
markers, and its comment reads:

> The assertion is the DELTA, not the total: the total is not this
> batch's to own, and pinning it would fail here the day an unrelated
> rule touched a sense number.

Batch 7 was that day. `continuationMarkerDash` restores the dash on
five bare `2)` markers, so the phase delta reads **23** where the rule
wrote 18 — and a delta over a growing phase turns out to be no more
robust than a total. It is the same implicit-subject defect 6c fixed in
that very file for `records.length`, two paragraphs above the assertion
that failed. Fixed the same way: the marker count now runs the phase
with `stemHeadMarkerChop` ALONE.

## 19. A pin of mine failed for a reason it was never about

§8's deletion pin asserted that both rows carry no `entangledWith` at
all. That is **stronger than the claim it protects**, which is only that
those two rows are not entangled *with each other* — and the same batch
falsified it, when the commutation gate found
`trailing-em-dash-tail × continuation-marker-em-dash-loss` and that row
correctly gained an edge.

Narrowed to the actual claim. Worth recording next to §18: within one
batch, two assertions failed for reasons they were not about — one
because its subject was implicit over a growing phase, one because it
pinned more than it meant. Neither was a defect in a rule.

## 20. What this batch has not done yet

- **No row is left undisposed.** What stays on the queue is the
  measured remainder of three of them: 31 tails on
  `trailing-em-dash-tail`, 6 markers on
  `sense-number-outside-closed-grammar`, 22 on
  `continuation-marker-em-dash-loss`.
- Nothing here reads the 22 unwitnessed markers, or the 31 tails, or the
  9 stem heads 6c left. They are populations with no rule owed *yet*,
  not populations shown to need none.
- The 6 residual `*N)` markers of §2 and the 31 residual tails of §7
  stay on their rows with no rule owed yet.
- *k* for §3 is not ruled.
- The 11 of §6 are not read.
- Nothing here measures what the 31 residual tails of
  `trailing-em-dash-tail` need. The 8 spaced ones point at
  `continuation-marker-em-dash-loss`; the 16 entry-final and 7
  next-unnumbered point at nothing yet.
