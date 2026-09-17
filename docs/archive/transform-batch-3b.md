# Transform batch 3b — italic & punctuation seams

**Status: shipped 2026-08-26.** Twelve rules across five modules, four
catalogue rows withdrawn to `judgment`, seven counts corrected. The
registry now holds 27 rules and `PENDING` 46, against 73 transform-route
rows.

Spec: [`2026-08-25-italic-punctuation-transform-design.md`](../specs/2026-08-25-italic-punctuation-transform-design.md).
Withdrawal working: `data/patches/catalogue-audit/batch-3b-withdrawals.md`.

## The three findings that outlive the tasks

**1. A repair for a rendered harm must fix the rendered output, and its
test must assert a defect-count DELTA rather than an invariant.** Three
rows in this batch were specified as repairs that repaired nothing, and
all three trace to one mistake — classifying a row by what the MARKUP
does when the catalogue classifies it by what the READER sees.
`em-dash-section-break-in-own-italic` shipped a rule that fired **278
times and left the rendered output byte-identical**, with a corpus test
asserting the very `stripTags` invariant that certified the defect had
survived. `emphasis-run-edge-space`'s planned implementation had the
same defect — a pure move across the tag boundary leaves two spaces
just as adjacent, 179 rendered doubled spaces before and 179 after —
and was caught by measurement before dispatch. An invariant is
satisfied by a no-op; a delta is not. This is now spec §3.1 and a
standing rule for later batches.

**2. Four rules in this batch could have claimed a different catalogue
row's population, and three would have.** Not one was visible to any
gate.

| Rule | Would have taken | Size | How it was stopped |
|---|---|---:|---|
| `italicGlossPeriodOutside` | `italic-lone-punctuation`'s catalogued `. x21` | 21 | empty-body guard; it was rewriting `<i>.</i>` → `<i></i>.`, destroying the other row's evidence on the way past |
| `anchorItalicSpace` | half of `paren-tag-no-space` | 53 | negative lookbehind on `)` — before it, ownership depended on registry ORDER, and the catalogued 111 was double-counting |
| `parenTagSpace` | the same 53 from the other side | 53 | same lookbehind, one owner in either order |
| `emphasisRunEdgeSpace` | `doubled-space-as-text-loss-locator`'s literal doubled spaces | 3 | both patterns require the tag BETWEEN the two spaces |

The pattern, not the instances: **a catalogue row is a claim about a
population, and two rows can describe the same characters without
either audit noticing.** `checkNoNewText` compares multisets and
`checkMarkup` is a delta gate; neither knows what a row OWNS. The only
things that caught these were a rule author reading a sibling row's
`reason` before writing a predicate, and the composed corpus run. Both
are manual. There is no gate for this, and one is worth building.

**3. The composed run found a defect two isolated runs had shipped
with.** See §4 — it is the reason this document exists rather than a
green checkmark.

## 1. What shipped

| Module | Rules | Class |
|---|---|---|
| `rules/seam-space.ts` | `anchorItalicSpace`, `parenTagSpace`, `italicParenSpace`, `translitItalicSpace`, `gereshAbbrevSpace` | B — inserts one space |
| `rules/italic-paren.ts` | `italicSwallowsCloseParen` | A — moves a byte past a tag |
| `rules/italic-period.ts` | `labelPeriodInside`, `italicGlossPeriodOutside` | A |
| `rules/punct-seams.ts` | `emDashSectionBreak`, `italicLonePunctuation` | C, A |
| `rules/edge-trim.ts` | `emphasisRunEdgeSpace`, `trailingWhitespaceDefinition` | C — deletes |

Two rows changed class during the batch, and both changes were
measured rather than argued —
`em-dash-section-break-in-own-italic` A → C and
`italic-swallows-close-paren` B → A. Spec §3 is corrected.

### Catalogued vs measured, all sixteen rows

Every count states its UNIT. The rightmost column says which figure the
rule reproduces.

| Row | Catalogued | Measured | Unit | Rule reproduces |
|---|---:|---:|---|---|
| `italic-swallowed-terminal-period` | 1,098 → **1,567** | 1,567 | entries | the corrected count |
| `label-period-outside-italic` | 945 → **979** | 979 | entries | the corrected count |
| `emphasis-run-edge-space` | 304 | 304 / 388 occ | entries | catalogued, exactly |
| `em-dash-section-break-in-own-italic` | 270 | 270 / 278 occ | entries | catalogued, exactly |
| `paren-tag-no-space` | 126 → **115** | 115 occ / 108 ent | occurrences | the corrected count |
| `anchor-italic-no-space` | 111 → **56** | 57 occ / 56 ent | entries | the corrected count |
| `italic-close-paren-nospace` | 95 | 96 occ / 95 ent | entries | catalogued, exactly |
| `italic-lone-punctuation` | 29 → **28** | 28 | both | the corrected count |
| `geresh-abbrev-space-loss` | 22 → **23** | 24 occ / 23 ent | entries | its own measurement; see below |
| `translit-italic-space-loss` | 15 | 15 | both | catalogued, exactly |
| `trailing-whitespace-definition` | 10 | 10 | entries | catalogued, exactly |
| `italic-swallows-close-paren` | 10 → **8** | 8 of 10 raw | entries | the corrected count |
| `citation-quote-seam-period` | 43 | 43 ent / 44 occ | entries | WITHDRAWN |
| `orphan-gloss-seam-period` | 19 | 19 | entries | WITHDRAWN |
| `gloss-head-seam-period-doubling` | 15 | not measured | entries | WITHDRAWN, no code |
| `entry-final-comma` | 10 | not measured | entries | WITHDRAWN, no code |

Seven corrections. Two of them — `anchor-italic-no-space` and
`paren-tag-no-space` — were corrected TWICE, once for the shared
population and once for the defect in §4.

`geresh-abbrev-space-loss` is the one row whose figure is the rule's
rather than the catalogue's, and it is flagged rather than smoothed
over. Scoping the seam to `dir="rtl"` text excludes exactly one entry
(`P01521`, whose hit is in `alt_headwords`) and leaves 23; the row's own
`reason` says 22. The predicate was NOT narrowed further to reach 22 —
every one of the 23 is a geresh-then-Hebrew-letter seam inside an
rtl-scoped definition, and no third measured criterion excludes one more
without guessing which. 23 is written back because 23 is what
reproduces. **The one-entry gap is unexplained and is a live concern.**

### The withdrawals, and which test each failed

| Row | Test failed | The finding |
|---|---|---|
| `orphan-gloss-seam-period` (19) | no repair exists | The brief's own script returns `{clean: 29, marked: 27}`, not the catalogued 19/37 — its regex misses the `(b. h.` form. A corrected test gives 36/20, and 37/19 counting `A00505`. The stated decision rule then pointed at `transform`; it was declined because the test is under-powered — it looks for one loss signature and a second is live. |
| `citation-quote-seam-period` (43) | no repair exists for the row as catalogued | `A00714`'s period separates a plural-form VARIANT LIST from a citation; deleting it welds a form heading onto `Gen. R. s. 61`. `B01377`, `M00701`, `M02503` are ambiguous the same way. A second reading survives for all seven: the corpus writes `.—Pl. ` **496** times at this seam. **Handed forward, not written:** the 37 translated members are a mechanical predicate and would carry a narrower row — re-scoping a row until a shippable subset falls out is a maintainer call, and it is escalated, not taken. |
| `gloss-head-seam-period-doubling` (15) | no repair exists | Its own audit: *"which of the two bytes is surplus is unknowable from the entry, and one of them lives outside sense scope."* |
| `entry-final-comma` (10) | no repair exists | Two jobs with different repairs — 7 cross-reference stubs, 3 definitions cut mid-flow — *"could not be separated without the printed page."* |

All four failed the SAME test — no repair exists, the one
`homograph-numeral-mismatch` failed in batch 2 — and none failed the
destination test. The two audits differ in how much work reaching it
took, not in which test it was: the first two were measured and read in
full, while for the last two no members were re-read and no
measurements were run — both audits had already read their members, and
re-reading cannot produce information only the printed page holds.

### The accepted cost, stated in the report and not only in the spec

`Part. pass.` is a genuine 10-letter unanimous period-OUTSIDE
convention in Jastrow's own usage, and ruling R1 overrides it — **266
occurrences normalised against their own attested usage.** A deliberate
consistency-over-fidelity trade, safe only because both forms strip to
byte-identical text. A further **62** genuine label occurrences the
vocabulary holds only token-granularly are declined and stay
period-outside (`—Part. pass` 19, `part. pass` 8, `Part. Pu` 5,
`Part. Hof` 4, and a tail of singletons). Widening the VOCABULARY is the
sound way to reach them; widening the PREDICATE to a final token is not,
because it cannot reach them without also taking 25 ordinary glosses.

## 2. Registry order, derived from four measured constraints

The batch brief proposed an order that violated two of them. Every claim
below was measured against the shipped registry by moving the rule to
the front and to the back of `RULES` and comparing all 32,512 entries
byte for byte. **`front / back` is the number of entries whose final
bytes differ from the shipped order.**

| # | Rule | front / back | Verdict |
|---:|---|:---:|---|
| 1 | `anchorItalicSpace` | 0 / 0 | free |
| 2 | `parenTagSpace` | 0 / 0 | free |
| 3 | `italicParenSpace` | 0 / 0 | free |
| 4 | `translitItalicSpace` | 0 / 0 | free |
| 5 | `gereshAbbrevSpace` | 0 / 0 | free |
| 6 | `italicSwallowsCloseParen` | 0 / 0 | free |
| 7 | `emphasisRunEdgeSpace` | 0 / **13** | **CONSTRAINED** — must not run last |
| 8 | `emDashSectionBreak` | 0 / **270** | **CONSTRAINED** — must not run last |
| 9 | `italicLonePunctuation` | 0 / 0 | free |
| 10 | `labelPeriodInside` | 0 / 0 | free |
| 11 | `italicGlossPeriodOutside` | **283** / 0 | **CONSTRAINED** — must not run first |
| 12 | `trailingWhitespaceDefinition` | 0 / 0 | free |

The arithmetic closes: **283 = 270 + 13.** Moving the gloss rule to the
front breaks exactly the union of the two constraints above it, and
nothing else. That is the strongest evidence the constraint set is
complete rather than merely non-empty.

**Constraint 1 — `emDashSectionBreak` before `italicGlossPeriodOutside`
(270).** `SECTION_BREAK` needs its input's first run to still read
`<i>gloss.</i>`, period abutting `</i>` — exactly the shape the gloss
rule hunts and rewrites. With the gloss rule first, the em-dash rule
survives on **0 of 270 entries**. It does **not** need to precede
`labelPeriodInside`: measured, all 270 survive. Only the measured half
is stated; fix round 1's wider claim is retracted.

**Constraint 2 — `emphasisRunEdgeSpace` before `italicGlossPeriodOutside`
(13).** 29 trailing-edge occurrences read `<i>gloss.␣</i>`, where the
captured space hides the terminal period. At ENTRY granularity the gloss
rule newly fires on 11 (`A00740 A01190 A02252 A02901 C00200 C00399
C00772 C00872 C00964 C01379 E00196`). The byte comparison finds 13; the
extra two (`C00805`, `J00106`) are entries where the gloss rule already
fires at another locus, so an entry-level count cannot see this locus
was also repaired. `<i>froth, foam. </i> Pl.` closes to
`<i>froth, foam</i>. Pl.` in the shipped order and stays
`<i>froth, foam.</i> Pl.` with the edge rule last.

**Constraints 3 and 4 are ARGUMENTS, not measurements, and are labelled
as such in the registry.** The label pair's internal order measures 0 /
0 — on today's corpus it is free, and the brief's claim that it is
load-bearing is not what the corpus says. `labelPeriodInside` leads
anyway, for robustness: it removes labels from the population the gloss
rule then reads, so that rule's exclusion clause is an assertion that
already holds rather than a filter that must get every label right.
`isLabel` gets all of them right today — which is exactly why the
measurement is 0, and is not a property to rely on after a vocabulary
change. The same applies to Class B before the label pair: free today,
kept as a fail-closed default.

**One claim was retracted outright.** Spec §8 said
`emDashSectionBreak` must precede `italicLonePunctuation` or the residue
row would consume 230 instances the em-dash row owns. It cannot:
`LONE_PUNCTUATION`'s class is `[.?;]` and has no way to match an em-dash
in any order, against any corpus. The two are kept adjacent for
READABILITY — a reader checking the 230/28 split needs both in view —
and that is now stated as a presentation choice.

**Three of the four constraints carry no `entangledWith` edge**, so
`checkAdjacency()` is silent on all three. They are pinned by explicit
assertions in `registry.order.corpus.test.ts` instead.

## 3. Composed vs isolated

`transform:count` runs every rule ALONE; the pipeline runs them
composed. Four of the twelve differ, and every difference is accounted
for to the entry.

| Rule | Isolated | Composed | Difference |
|---|---:|---:|---|
| `anchor-italic-no-space` | 56 | 56 | — |
| `paren-tag-no-space` | 108 | 108 | — |
| `italic-close-paren-nospace` | 95 | 95 | — |
| `translit-italic-space-loss` | 15 | 15 | — |
| `geresh-abbrev-space-loss` | 23 | 23 | — |
| `italic-swallows-close-paren` | 8 | 8 | — |
| `emphasis-run-edge-space` | 304 | 304 | — |
| `em-dash-section-break-in-own-italic` | 270 | 270 | — |
| `italic-lone-punctuation` | 28 | 28 | — |
| `label-period-outside-italic` | 979 | **975** | −4 |
| `italic-swallowed-terminal-period` | 1,567 | **1,331** | −247, +11 |
| `trailing-whitespace-definition` | 10 | 10 | — |

**The gloss row: 1,567 − 247 + 11 = 1,331, and both halves are
attributed.** `emDashSectionBreak` merges its two runs into a body
ending `—`, which `INSIDE` cannot match, so it takes 247 entries out of
the gloss rule's reach; `emphasisRunEdgeSpace` uncovers 11. Measured by
re-running the registry with each of those two rules removed: 247 and
11 exactly.

**The label row: −4** (`Q02185`, `S01017`, `T00299`, `S02102`). All
four are the em-dash row's LABELLED shape `.</i> <i>—Pl</i>.`. Alone,
`labelPeriodInside` sees `<i>—Pl</i>.`, a label, and moves the period
inside. Composed, the runs are already merged into
`<i>gloss.—Pl</i>.`, and `isLabel` correctly declines that body. The
period stays outside. **This is ruling R1's whole-body granularity
doing what it was ruled to do** — the same class as the 62 declined
`—Part. pass` occurrences — not a rule failing, and it enlarges an
accepted cost by four.

Neither difference is a defect, and neither is a number anyone would
have arrived at by reasoning.

## 4. The defect the composed run found

**Two shipped, reviewed rules were manufacturing a rendered defect on
13 entries, and every gate passed.**

`anchorItalicSpace` and `parenTagSpace` inserted their space in front of
an italic run OPENING with a left-attaching punctuation mark:

```text
(<i>well-covered</i>)<i>;guarded;</i>   →   ) <i>;guarded;</i>
                                        renders  well-covered) ;guarded;

<i>double </i>(<i>years</i>)<i>, double age</i>  →  ) <i>, double age</i>
                                        renders  years) , double age

>דִּינָאטוֹס</a><i>.</i>]                →   </a> <i>.</i>]
                                        renders  דִּינָאטוֹס .]
```

Measured in isolation — one rule, no registry, rendered text through
`stripTags`, counting new `\s[.,;:?!]` over all 32,512 entries —
`parenTagSpace` created **11** (`A01999 A02061 C01033 D00109 D00678
H01112 M01104 O00374 P00158 P00879 U00311`) and `anchorItalicSpace`
**2** (`D00932 H01388`). The other three rules in the module created 0,
and `italicParenSpace` structurally cannot: its seam runs the other
direction and `</i> (` puts the space before an OPENING paren, which is
where the corpus wants one.

**Nothing would have caught it.** `checkNoNewText` credits the space as
`copied` and compares a MULTISET — a space in the wrong place is, to
that gate, the same space. `checkMarkup` is a delta gate and no tag
moved. Each rule's fixture tests passed, because none of them fixtures a
run that opens with punctuation. `transform:count` reproduced the
expected population, because the wrong members were IN it.

**What exposed it was the order-freedom probe, and only indirectly.**
Three of the 13 sit in front of an `<i>.</i>` that `italicLonePunctuation`
later unwraps, so those three entries came out with different bytes
depending on which rule ran first, and the byte comparison had no choice
but to report it. The other 10 are order-invariant and were wrong in
both orders. **The probe was a tripwire, not a measurement** — it found
3 of 13, and the real number only appeared once someone asked why those
3 diverged.

Fixed by PREDICATE, not by order: both patterns now carry
`(?![.,;:?!])`. That is the same instrument this module already uses for
the `)</a><i>` collision — resolve by construction, so the answer does
not depend on registry position. Counts corrected a second time:
`paren-tag-no-space` 126 → 115 OCCURRENCES, `anchor-italic-no-space`
111 → 59 → 57 occurrences / 56 ENTRIES. The `)<i>;gloss</i>` shape those
11 share — a semicolon captured inside the following run — may well be a
defect of its own, but no catalogue row holds it, and declining leaves
it for whoever catalogues it rather than claiming it here.

New: `rules/seam-space.corpus.test.ts` asserts the created-defect count
is 0 corpus-wide as a DELTA, paired with each rule's population so a
rule that stopped firing cannot satisfy it, and `seam-space.test.ts`
pins the decline once per punctuation mark rather than by one
representative.

## 5. Link integrity — the check batch 3a did not have until it needed one

**110 of this batch's seams sit directly against an anchor's closing
tag** — 57 `</a><i>` and 53 `)</a><i>`. Batch 3a's headline finding was
a link regression that every per-rule measurement missed, and
`body/pipeline-links.corpus.test.ts` exists because of it.

CORRECTED 2026-08-26: this read **165** at first publication, which was
the PRE-DECLINE arithmetic (112 + 53) handed to Task 7 before commit
`11f0914` added the `(?![.,;:?!])` guard to both patterns. The corpus
holds 112 raw `</a><i>` seams, of which 53 are `)</a><i>`; after the
guard the two rules own 57 and 53. Re-derive with:
`</a><i>` not preceded by `)` and not followed by `[.,;:?!]` = 57;
`)</a><i>` = 53. The section's point is unaffected — the link check is
warranted at either number — but 165 was never a count of anything.

```text
resolving link targets   72,593     gained 90     LOST 0
```

Identical to `v2`, with all twelve rules registered. The test asserts
the absolute, not a delta — `expect(now.size).toBe(72_593)` — so a rule
that broke one link and repaired another would fail it.

Corroborated from a second direction: `registry.order.corpus.test.ts`'s
corpus-earned classification walks every anchor's parsed `href` and
`data-ref` before and after all 27 rules and requires them identical.
All twelve new rules are in `NEITHER`, and that membership is now
EARNED over 32,512 entries rather than declared.

## 6. `bun body:migrate-dry`

Record count **unchanged from `v2`**:

```text
entries=32512 repaired=812
binyan-cleanup: 938   marker-reinsert: 14   rejoin-chopped: 36
implied-one: 4        label-repair: 6       refs-removal: 3
cite-wrap: 3
```

All fifteen pre-existing transform instance counts are byte-identical to
the baseline. Twelve new lines appear.

**One row reports a different number in the pipeline than in
`transform:count`, and it is not a discrepancy to chase.**
`paren-tag-no-space` measures 108 entries on raw source and **136** in
`migrate-dry`. The transforms run AFTER `applyRepairs`, and
`rejoin-chopped` creates 28 new `)<i>` seams by rejoining a chopped
sense onto its marker — `…</a>2)<i>evening, night</i>` — which this rule
then correctly opens to `2) <i>evening, night</i>`. Verified: the
whole-registry rendered space-before-punctuation delta on the
post-repair input is **0**, so nothing manufactured. The catalogue
measures the SOURCE population; the pipeline measures what the rule does
in situ. Both are correct and they are not the same number.

## 7. `bun transform:count`

27 rules, 3 mismatches — two inherited (`ib-yoma-2a` −124,
`sifre-ib-resolves-to-yalkut` −5) and one new:

```text
paren-tag-no-space   measured(entries)=108  catalogued=115  DELTA -7
```

This is the **designed unit-mismatch finding** (spec §4.2, and
`count.ts`'s own docstring: *"Some rows count OCCURRENCES, and say
so… A DELTA against a row like that is not a harness bug to chase"*).
The row's `corpusCount` is 115 OCCURRENCES; `count.ts` compares entries.
Both figures and both units are in the row's `reason`. Eleven of the
twelve match exactly.

## 8. Concerns

1. **`geresh-abbrev-space-loss` is 23 where its own audit says 22**, and
   the one-entry gap has no explanation. The predicate was not tuned to
   close it. Someone should read the 23 and find the odd one, or confirm
   the audit was off by one.
2. **`citation-quote-seam-period`'s 37 translated members are a
   shippable subset and were deliberately not shipped.** Cutting a
   narrower row out of a withdrawn one is a maintainer call. It is
   escalated and still open.
3. **There is no gate for population collision.** Four rules in this
   batch could have claimed another row's members and three would have;
   all four were stopped by a human reading a sibling row's `reason`.
   That is not a control. A cheap first version: for every pair of
   registered rules, assert their touched-entry sets are disjoint unless
   the catalogue records an `entangledWith` edge.
4. **`checkAdjacency()` sees one of this batch's four ordering
   constraints.** 46 of the 46 rows still in `PENDING` carry no edge at
   all, so for the work ahead the gate is unfalsifiable by construction.
   The order-freedom probe needs no edge and should be run per batch;
   it is currently a scratch script, not a committed harness.
5. **The order-freedom probe is a tripwire, not a measurement.** It
   found 3 of the 13 manufactured defects, and only because they
   happened to be order-sensitive. The metric that found the other 10
   was "does this rule create a rendered defect", which is now a
   committed test for the seam rules and for no other rule in the
   registry.
6. **`italic-swallowed-terminal-period` repairs 1,331 of its 1,567
   catalogued entries in the shipped pipeline**, by design — 247 belong
   to the em-dash row once composed. A future reader comparing the
   catalogue to the pipeline will see a 15% shortfall that is correct.
   It is recorded here and in the registry comment, and nowhere that a
   gate would surface it.

## Verification, reproducible

```bash
bun test                                     # 862 pass, 0 fail
biome check .                                # 116 infos, 0 errors
bun transform:count                          # 27 rules, 3 mismatches
bun body:migrate-dry                         # entries=32512 repaired=812
bun test admin/pipeline/body/pipeline-links.corpus.test.ts   # 72,593 / +90 / −0
```
