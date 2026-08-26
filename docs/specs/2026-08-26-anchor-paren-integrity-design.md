# Anchor & paren integrity — Phase 2 batch 4 design

**Status:** APPROVED 2026-08-26 (scope ruled by Brian; §7.6 settled by PR #50, merged as `45d50a4`). §3.3 corrected after its first draft's exactness claim was disproved. Extends
[the transform module design](2026-08-22-transform-module-design.md);
that spec's §3 contract, §5 gates and §6 write-back mechanism hold here
unchanged unless this document says otherwise. The batch boundary that
created this document is ruled in
[the italic & punctuation design](2026-08-25-italic-punctuation-transform-design.md)
§1: *batch 4 is anchors and parens **swallowing content**, which is
structural* — the seam-spacing rows that merely lose a space next to
the same tags shipped in 3b.

## 1. What this batch is

**Scope, ruled 2026-08-26 (Brian): 10 rows / 2,515 catalogued
instances** (2,513 when ruled; Task 1's count corrections moved it +2 —
`anchor-swallows-close-paren` −1, `tosefta-variant` +3). The set is **entanglement-closed** — no `entangledWith`
edge leaves it and none enters it — so it ships as one pull request
without leaving `unaccountedEdges()` with a dangling endpoint.

```bash
bun -e 'import {parsePatterns} from "./admin/pipeline/research/patterns.ts";
const rows=await parsePatterns(await Bun.file("data/patches/patterns.jsonl").text());
const by=new Map(rows.map(r=>[r.id,r]));
const set=new Set(["nonsense-dup-anchor","anchor-swallows-close-paren","nested-anchor-swallows-punctuation","tosefta-variant-chapter-halakha-loss","open-paren-in-anchor-display","superscript-subsection-stranded-outside-anchor","citation-number-truncated-outside-anchor","post-anchor-numeral-duplication","jt-double-wrapped-citation","unterminated-href-swallows-closing-tag"]);
let n=0; for(const id of set) n+=by.get(id).corpusCount;
const out=[...set].flatMap(id=>(by.get(id).entangledWith??[]).filter(e=>!set.has(e)));
const inn=rows.filter(r=>!set.has(r.id)&&(r.entangledWith??[]).some(e=>set.has(e))).map(r=>r.id);
console.log({rows:set.size,instances:n,edgesOut:out,edgesIn:inn});'
```

Two families were offered and declined, and the reason is the same in
both cases — **split by predicate, not by adjacency**:

- **The duplication-debris pair** (`duplicated-definition-opening-run`
  85, `adjacent-verbatim-repetition` 59). Batch 4 does contain two
  delete-the-duplicate rules, so the pull was real; but these two carry
  no anchor and no paren in their predicate. They are bare-text
  duplication and belong with each other, not here.
- **`parenthesized-alt-headword`** (580, blocking). A paren-integrity
  defect, but it edits `alt_headwords`, which is batch 5's object.
  Pulling it forward would take batch 5's largest row.

**2,515 is a catalogue figure, and §3 shows why the batch's real
population is 2,114 and its rule count is 7, not 10.** CORRECTED
2026-08-26: this read *"2,122 … 9, not 10"*. It subtracted the tosefta
containment and not the JT one, although §3.2 is entirely about the JT
containment — and the rule count was the row count minus one
containment rather than the seven rules §5 actually lists.

## 2. Measured scope

Every figure below was re-derived on the pinned snapshot
(`data/source/jastrow-dictionary.jsonl`, sha256 `4c64ff03…`, verified
against `data/patches/snapshot.lock` before the run) using the
predicate each row's own `reason` records, walking `fieldsOf` over all
32,512 entries. **`occ` is occurrences, `ent` is distinct entries.**
Nothing here is copied from the catalogue.

| Row | Catalogued | Measured | Verdict |
|---|---:|---|---|
| `nonsense-dup-anchor` | 755 | **755 occ / 755 ent** | ✓ exact, both axes |
| `anchor-swallows-close-paren` | 494 | 525 occ / **493 ent** | ✗ §2.1 |
| `nested-anchor-swallows-punctuation` | 465 | 475 occ / **465 ent** | ✓ exact on `ent` |
| `tosefta-variant-chapter-halakha-loss` | 388 | 414 occ / **391 ent** | ✗ §2.1 |
| `open-paren-in-anchor-display` | 214 | 225 occ / **214 ent** | ✓ exact on `ent`, §2.2 |
| `superscript-subsection-stranded-outside-anchor` | 160 | 182 occ / **160 ent** | ✓ exact on `ent` |
| `citation-number-truncated-outside-anchor` | 14 | **14 occ / 14 ent** | ✓ exact, both axes |
| `post-anchor-numeral-duplication` | 11 | **11 occ / 11 ent** | ✓ exact, both axes |
| `jt-double-wrapped-citation` | 10 | 20 occ / **10 ent** | ✓ exact, as its `reason` states |
| `unterminated-href-swallows-closing-tag` | 2 | **2 occ / 2 ent** | ✓ exact, both axes |

Eight of ten reproduce. `corpusCount` still has no consistent unit —
3b §2.1's finding stands, unamended: `nonsense-dup-anchor` counts
occurrences, `nested-anchor-swallows-punctuation` counts entries, and
`jt-double-wrapped-citation` counts entries while its own `reason`
prints both. The unit is recoverable only from the `reason` prose.

### 2.1 Two counts do not reproduce, and one row misreports its own measurement

**`anchor-swallows-close-paren`: 494 → 493.** The row's `reason` is
otherwise the most rigorous in the catalogue, and it states the correct
figure and the wrong conclusion in one sentence: *"525 anchors / 493
entries match … — the catalogued 494 entries reproduces."* 493 is not
494. The predicate is exact and reproduces to the anchor; the arithmetic
in the prose does not. Correction owed: `corpusCount` 494 → 493, and the
sentence rewritten.

**`tosefta-variant-chapter-halakha-loss`: 388 → 391.** The row is
measured as *the primary arm of the split whose `data-ref` carries no
halakha* — the test being whether the ref has a `:` segment
(`Tosefta Shabbat 16` versus `Tosefta Shabbat 17:6`). Round 3 recorded
411 occ / 388 ent; this run finds **414 occ / 391 ent** over 525
variant anchors, of which **525 of 525 have a preceding primary
anchor** (0 orphans) and the primaries are 521 Tosefta / 4 Mishnah —
reproducing that half of the round-4 note exactly. The +3 is not
explained by this run and must be pinned before the rule is written;
until it is, the count is not a measurement (module design §4.2).

### 2.2 The largest unreasoned row in the catalogue now has a predicate

`open-paren-in-anchor-display` (214, blocking) carried **no `reason` at
all** — the shape that hid `anchor-swallows-close-paren`'s entanglement
for two rounds (that row's own `reason` says so). Its one-line
`description` was enough: `<a …>(TEXT</a>)` reproduces at **225 occ /
214 ent**, exact on the catalogued axis, first time asked.

```
A00014  <a … data-ref="Jastrow, מִשְׁנָיוֹת 1">(משניות</a>)
A01042  <a … data-ref="Jastrow, ס 1">(ס</a>)
```

It is the **opposite polarity** of `anchor-swallows-close-paren`
(`(<a …>ROMAN), N</a>`): there the paren opens outside and closes
inside, here it opens inside and closes outside. §3's detector confirms
the two never touch the same bytes.

## 3. Population collision, measured rather than noticed

Batch 3b's second finding was that **nothing gates population
collision**: four rules could have claimed another catalogue row's
members, three would have shipped that way, and all four were caught by
a human reading a sibling row's `reason`. This batch does not repeat
that. Every predicate above emits **byte spans** — `(rid, field,
start, end)` over the same field strings — and any two rows whose spans
intersect are claiming the same bytes.

Over all 45 pairs, **two collide and 43 are clean**. The comparison is on
BYTE SPANS, and Task 1's re-run showed why that matters rather than
rid-level comparison: **9 entries carry both `anchor-swallows-close-paren`
and `open-paren-in-anchor-display` at different offsets**, so a rid-level
test would report a collision between two rows whose shapes are opposite
polarities and never touch.

| Rows | Overlap (byte spans) | Declared? |
|---|---|---|
| `anchor-swallows-close-paren` × `tosefta-variant-chapter-halakha-loss` | 414 occ / 391 ent | **yes** — `entangledWith`, both `reason`s |
| `jt-double-wrapped-citation` × `nested-anchor-swallows-punctuation` | 20 occ / 10 ent | **no** |

### 3.1 The declared one collapses two rows into one rule

Round 4 already established this and both `reason`s say so: *525 of 525
close-paren-swallowing anchors are two-anchor splits, so
[`tosefta-variant`] has NO members outside that row … **ONE EDIT FIXES
BOTH**.* The detector reproduces the containment as a byte fact — every
one of the 391 chapter-only primaries lies inside a
`anchor-swallows-close-paren` span.

The consequence for this batch's headline is arithmetic: with §3.2's
containment counted too, **2,515 catalogued instances describe 2,114
distinct populations** (2,515 − 391 − 10), and **10 rows ship as 7
rules**. Re-splitting the boundary so the `)` falls
outside the variant anchor, and letting the print halakha reach the
primary, is one edit at one site.

### 3.2 The undeclared one is the finding

`jt-double-wrapped-citation` (10 entries / 20 pairs) is a **strict
subset of `nested-anchor-swallows-punctuation`'s measured population**,
and **no `entangledWith` edge records it in either direction.** Both are
`route: transform`; both are in this batch; two rules would have claimed
the same 20 nested pairs.

The trapped-text census is what makes it unambiguous. Of the 475
same-`data-ref` nested pairs in `definition`:

| Text trapped between the two anchor layers | Pairs |
|---|---:|
| `.` | 387 |
| `)` | 68 |
| **(nothing)** | **20** |

The 20 that trap nothing are exactly the 10 JT entries — `A00722`,
`C01048`, `K01007`, `M01214`, `J00603`, `K00021`, `N00255`, `P01456`,
`S00534`, `U00888` — and all 20 carry an `href` missing its leading
slash, reproducing that row's `reason` to the occurrence.

**The nested row's own `reason` knows.** It reads *"455 of the 465 trap
punctuation, while 10 (the Jerusalem Talmud double-wraps, href missing
its leading slash in 20 of 20 occurrences) trap nothing."* 465 − 10 =
455. The fact was written down in prose and never written into the
field that `checkAdjacency()` reads, so no gate could see it — the same
failure mode as `anchor-swallows-close-paren`'s missing `reason`, one
level up.

> **CORRECTED 2026-08-26 (Task 1).** This paragraph read *"…while 10
> (the Jerusalem Talmud …)"* and the §8 write-back table asked for the
> row's *"`reason` completed"*. **The `reason` was never truncated** —
> it is 687 characters and ends cleanly at "trap nothing". The ellipsis
> was an artefact of the `.slice(0, 600)` in the script that first
> dumped these rows for this spec, and it was then written up as a
> property of the data. Nothing needed completing; the row needed only
> its `entangledWith` edge. A display limit read back as a corpus fact
> is the same shape as the parser defect batch 2 recorded — when a
> measurement reports something missing, ask what could make it *look*
> missing besides absence.

**Write-back owed:** a mutual `entangledWith` edge between
`jt-double-wrapped-citation` and `nested-anchor-swallows-punctuation`,
edited surgically (module design §6). Once it exists the registry's
adjacency gate enforces what the prose has been asserting alone.

### 3.3 The commutation gate — shipped in PR #50, ahead of this batch

The byte-span detector above is a **design-time** instrument. It works because
the ten predicates here were written by hand as free-standing regexes and
anchor walks that can report offsets. `Rule` reports no offsets, so the
detector cannot be pointed at the registry, and a gate that only works on
predicates written twice is a gate nobody will maintain.

The shipped gate asks the same question through the interface that does exist:
**two rules contend for the same bytes exactly when their composition is
order-dependent**, so for every unordered pair of registered rules,
`A ∘ B ≡ B ∘ A` on every entry — unless the pair is declared `entangledWith`.
`checkAdjacency()` already enforced the converse; what was missing was that a
pair which *behaves* as entangled must be *declared* as one.

**It did not survive contact with this batch's schedule.** Its first run over
the 27 shipped rules found **eight non-commuting pairs, one declared, seven
not**, and four of the seven were one live defect: `bare-rtl-hebrew` ran before
the unlink rules that expose the Hebrew it wraps, so 765 entries were losing
rtl wrappers. Brian ruled on 2026-08-26 that this ships as its own PR before
batch 4 — the shape of PR #47 — and the gate went with it, since batch 4 could
not land a gate that fails and the precondition needed it green as proof.
Merged as `45d50a4` (PR #50).

**The restriction is the UNION of the two rules' changing-rid sets, not the
intersection.** This document's first draft argued the intersection was exact:
*"a pair cannot disagree on an entry where at least one of them changes
nothing."* CORRECTED 2026-08-26 — that premise is evaluated on the RAW entry,
so if `b` does not fire on `e` but fires on `a(e)`, the orders differ on an
entry the skip already discarded, which is precisely the exposure mechanism
PR #50 repairs. Measured, the intersection discarded ~70% of the differing
entries per pair and caught the 50-entry `plural-to-feminine` pair on 7
entries. The union's premise does hold: if neither rule changes `e`, both
orders are `e`. 351 pairs, ~35s, against a 180,000 ms timeout.

Three properties this batch must hold onto:

- **It generalises past this batch** — all 34 rules the registry will hold
  after batch 4, not the 10 rows measured here.
- **It is not a superset of the design-time detector.** Two rules can claim
  overlapping bytes and still commute if each is idempotent on the other's
  output. The span comparison stays the sharper instrument at spec time, and
  §3.2 is where batch 4's spans were compared.
- **It closes TWO-rule exposure only.** If rule C produces the state on which
  A and B disagree, the gate is silent, and it cannot see a `PENDING` row at
  all. **A green gate is not evidence that a new rule's placement in a 34-deep
  pipeline is free** — the instrument for that is composing the whole registry
  both ways, which is what §6 asks of the batch report.

## 4. Two rows say in their own audits that they may not be transformable

Module design §6 is the mechanism: a row that proves to need judgment
has `route` rewritten with a `reason`, as a committed diff rather than a
silence. Two rows here are candidates and neither is settled by this
document.

### 4.1 `post-anchor-numeral-duplication` (11) — no repair is proposed

The predicate is exact: **11 occ / 11 ent**, reproducing the `reason`'s
split to the case — 10 via `</a>` (`H00085`, `I00619`, `H01073`,
`H01370`, `M02691`, `O01416`, `N00957`, `O00123`, `R00702`, `U01778`)
and 1 via an unlinked `</span>` (`P01496`). The three-way separator
census reproduces too: comma + different numerals 56, empty 16, period
+ same numeral 11, semicolon 2 — the defect isolated by the conjunction,
exactly as recorded.

**What does not exist is the edit.** The row's own `reason`: *the agent
established that print supplies ONE copy … **BUT COULD NOT DETERMINE
WHICH COPY IS THE INTRUDER, AND THEREFORE PROPOSES NO DELETE**.* And
the two candidate edits are not equivalent — deleting the display
numeral leaves `<a>חַבְלָא</a>. I.`, deleting the bare one leaves
`<a>חַבְלָא I</a>.`, and those render differently and link differently.
The open problem is unresolved and stated as such: all 11 duplicates
are numeral `I` against a clean distribution of II 347 / I 279 / III 47
/ IV 6, so the wrapper-copies-the-token hypothesis predicts `II` cases
and there are none.

A transform must know which byte to delete. **Recommendation: withdraw
to `judgment` (11 instances) with the audit published**, unless a
maintainer ruling names the intruder.

### 4.2 `superscript-subsection-stranded-outside-anchor` (160) — two questions wearing one row

The boundary predicate reproduces exactly — `</a><sup>N</sup>` at **182
occ / 160 ent**, confined to letters T, U and V as described. Moving the
superscript inside the anchor is a deterministic byte move.

But the row carries an **audit flag** pointing at a different question:
of 105 occurrences on Midrash Rabbah anchors, 67 have a superscript
agreeing with the link's sub-section and **38 contradict it**; of 12
adjudicated against Sefaria's Hebrew text, print is right in 9, the link
is right in 2, and both are plausible in 1. That is per-entry
adjudication, and it is `judgment` by definition.

**These are separable and the spec asserts they are separate:** the
boundary repair moves markup and touches no `data-ref`, so it is
correct whichever side of the 38 wins. **Recommendation: transform the
boundary, and split the 38-instance target disagreement out as its own
row** rather than carrying it inside this one. The split needs a
measurement this document has not made — flagged in §7.

## 5. What each rule does

Nine rules. Every one is a **markup boundary move or a duplicate-layer
removal**; none writes text, so `no-new-text` runs with an empty
`allows` throughout and `checkMarkup`'s well-formedness delta is the
gate that matters (module design §5, §5.1).

| # | Rule | Rows | Edit |
|---|---|---|---|
| 1 | `nonsense-dup-anchor` | 755 | drop the outer layer of a same-`href` nested pair in `language_reference`, keeping the trapped mark |
| 2 | `nested-anchor-swallows-punctuation` | 465 (incl. JT 10) | drop the outer layer of a same-`data-ref` nested pair in `definition` |
| 3 | `anchor-boundary-tosefta-split` | 493 + 391 | move the `)` outside the variant anchor and carry the print halakha to the primary `data-ref` |
| 4 | `open-paren-in-anchor-display` | 214 | move the opening `(` outside the anchor |
| 5 | `superscript-subsection-stranded-outside-anchor` | 160 | move `<sup>N</sup>` inside the anchor |
| 6 | `citation-number-truncated-outside-anchor` | 14 | extend the anchor over the stranded digit; `data-ref` is a §4.2-class question, **not** in this rule |
| 7 | `jt-double-wrapped-citation` | (in #2) | folded into #2 — the slash half belongs to the discarded `jt-href-slash` |
| 8 | `unterminated-href-swallows-closing-tag` | 2 | terminate the `href`, restore the swallowed `</a>` |
| 9 | `post-anchor-numeral-duplication` | 11 | **§4.1 — no edit proposed; expected to withdraw** |

Rule 3 replaces two catalogue rows with one registered rule id, which
`coverage()` must be taught explicitly — a rule id must match a
catalogue row, so the two rows each need a rule, or the pair needs the
mechanism 3a used for its split-by-locus pair. Resolved in the plan.

## 6. Verification

Unchanged from module design §9, plus one addition:

| Tier | What it proves |
|---|---|
| Unit, per rule | the predicate fires on its shape and holds off near-misses |
| `transform:count` | each predicate reproduces its **corrected** catalogue count |
| `no-new-text`, per rule | empty `allows` throughout; no rule here writes text |
| `markup`, per rule | output no less well-formed than input — the load-bearing gate for nine boundary moves |
| Registry | coverage + `checkAdjacency` over the two entangled pairs |
| **Commutation** (inherited, PR #50) | every unordered rule pair commutes, except where `entangledWith` declares it — §3.3. Two-rule exposure only; report which placements rest on it alone |
| `pipeline-links.test.ts` | `applyRepairs` + registry over 32,512 entries — **the gate 3a added; nine of nine rules here edit anchors, so it is the one that matters most** |
| `body:migrate-dry` | 32,512/32,512, 0 schema failures, 0 quarantines |

**Link accounting is the headline measurement, and it is measured on
the pipeline, not on the rules** — 3a's finding, and this batch edits
anchor boundaries on 2,122 populations. The bar carried forward is
links **+90 / −0** unchanged, plus whatever this batch adds.

## 7. Rulings and open items before implementation

1. **§2.1 — pin `tosefta-variant`'s +3.** 411/388 recorded, 414/391
   measured. Not a measurement until explained.
2. **§3.2 — approve the `entangledWith` write-back** between
   `jt-double-wrapped-citation` and
   `nested-anchor-swallows-punctuation`.
3. **§4.1 — rule on `post-anchor-numeral-duplication` (11):** name the
   intruding copy, or withdraw the row to `judgment`. Recommendation:
   withdraw.
4. **§4.2 — rule on splitting
   `superscript-subsection-stranded-outside-anchor`:** transform the
   boundary and file the 38-instance target disagreement as its own
   row, or hold the whole row.
5. **§5 rule 3 — decide how two catalogue rows register as one rule.**
6. ~~**§3.3 — confirm the commutation gate ships** in this batch.~~
   **SETTLED 2026-08-26:** it shipped ahead of the batch, in PR #50, with
   the ordering defect it found. Batch 4 inherits it.

## 8. Expected write-backs to `patterns.jsonl`

Edited surgically, never through `renderPatterns()` (module design §6).

| Row | Change |
|---|---|
| `anchor-swallows-close-paren` | `corpusCount` 494 → 493; `reason` sentence corrected |
| `tosefta-variant-chapter-halakha-loss` | `corpusCount` 388 → 391, pending §7.1 |
| `nested-anchor-swallows-punctuation` | `entangledWith` += `jt-double-wrapped-citation`. (This row asked for the `reason` to be "completed"; it was never truncated — see §3.2's correction.) |
| `jt-double-wrapped-citation` | `entangledWith` += `nested-anchor-swallows-punctuation` |
| `open-paren-in-anchor-display` | first `reason`, from §2.2 |
| `post-anchor-numeral-duplication` | `route` → `judgment` + `reason`, pending §7.3 |
| `superscript-subsection-stranded-outside-anchor` | `reason` records the §4.2 split, pending §7.4 |

## 9. Decision log

| Date | Who | Decision |
|---|---|---|
| 2026-08-25 | Brian | batch 4 is anchors and parens *swallowing content*; seam-spacing stays in 3b |
| 2026-08-26 | Brian | scope is the core 10 rows / 2,513 instances; duplication pair and `parenthesized-alt-headword` declined |
