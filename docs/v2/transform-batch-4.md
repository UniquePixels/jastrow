# Transform batch 4 — doubled anchors & anchor boundaries

**Status: shipped 2026-08-26.** Six rules across three modules, one
catalogue row withdrawn to `judgment`, one new `judgment` row split off
a transform row, two counts corrected, and **two rows left unrepaired
behind one shared gate**. The registry now holds **33 rules**, and they
COVER **34** of the **72** transform-route rows — the two counts differ
by one and are not interchangeable. `PENDING` holds the other **38**
(34 + 38 = 72). The extra covered row is `jt-double-wrapped-citation`,
held by a third list — `COVERED` — because it has a repair but will
never have a rule of its own.

Spec: [`2026-08-26-anchor-paren-integrity-design.md`](../specs/2026-08-26-anchor-paren-integrity-design.md).
Withdrawal working: `data/patches/catalogue-audit/post-anchor-numeral-duplication.md`
and `data/patches/catalogue-audit/superscript-subsection-stranded.md`.

## The four findings that outlive the tasks

**1. A green commutation gate is not coverage, and a green four-gate
stack is not link integrity.** The pair gate closes two-rule exposure
only: if rule C produces the state on which A and B disagree, it is
silent. That is why every placement in this batch was ALSO measured by
composing the whole registry both ways — see §2 — and why §8 states
what neither check can see. The sharpest case is `<a>(</a>)`: a
well-formed anchor with an empty display, a link with nothing to click,
which passes `checkNoNewText`, `checkMarkup`, `checkLinkTargets` and
the anchor-count invariant alike.

**2. `bun transform:count` and the migration disagree about
`citation-number-truncated-outside-anchor`, and both are right.** The
audit harness runs every rule ALONE against the pinned snapshot and
reports 14 MATCH; composed over the registry the rule fires 12 times,
because `apparatusCite` deletes the whole anchor in the other two. The
defect leaves with the link that carried it. §3 has the entries and the
proof the two orders converge.

**3. The pipeline manufactured a 15th member of a 14-member population,
and only the pipeline could have shown it.** `applyRepairs` runs before
every transform. In S01040 `rejoin-chopped` folds a phantom `2)` back
into the flow immediately behind `<a … data-ref="Genesis 4:2">Gen. IV,
2</a>`, and `truncatedCitationDigit` read that sense number as a
citation tail and rendered **`Gen. IV, 22`** — a link displaying a
verse the entry does not cite. Found by comparing `bun body:migrate-dry`
against the composed run on raw source, fixed with a refusal, and
covered by a fixture test. §4.

**4. A catalogue row can be REPAIRED without ever having a rule, and
nothing in the registry could say so.** `jt-double-wrapped-citation` is
exactly the empty-trapped-text arm of `nested-anchor-swallows-
punctuation`; all 10 of its entries are inside that rule's 465. Left in
`PENDING` it was a false standing claim that no gate could see, since a
row in `PENDING` is precisely what `coverage()` expects to find;
deleted from `PENDING` it would have gone `unaccounted`. §5.

## 1. Scope as ruled, scope as shipped

Batch 4 was ruled over **TEN** catalogue rows. It touched **ELEVEN** —
the ten plus one new row split off a member — and disposed of **NINE**.

| Row | Catalogued | Disposition |
|---|---:|---|
| `nonsense-dup-anchor` | 755 | rule `dupAnchorLanguageRef` |
| `nested-anchor-swallows-punctuation` | 465 | rule `nestedAnchorDuplicate` |
| `anchor-swallows-close-paren` | 493 | rule `toseftaCloseParen` |
| `open-paren-in-anchor-display` | 214 | rule `openParenInAnchorDisplay` |
| `superscript-subsection-stranded-outside-anchor` | 160 | rule `superscriptInsideAnchor` |
| `citation-number-truncated-outside-anchor` | 14 | rule `truncatedCitationDigit` |
| `jt-double-wrapped-citation` | 10 | **repaired by another row's rule** — `COVERED`, no rule of its own |
| `post-anchor-numeral-duplication` | 11 | **withdrawn** to `judgment` |
| `superscript-subsection-contradicts-link-sub-section` | 33 | **new row**, `judgment` from birth |
| `tosefta-variant-chapter-halakha-loss` | 391 | **DEFERRED** — gate wall, §6 |
| `unterminated-href-swallows-closing-tag` | 2 | **DEFERRED** — gate wall, §6; rule written, 19 tests, unregistered |

**Six registered `Rule` objects, disposing of eight of the spec's ten
catalogue rows** — the six rules' own rows, plus
`jt-double-wrapped-citation` (repaired under rule #2's id and recorded
in `COVERED`), plus `post-anchor-numeral-duplication` (re-routed to
`judgment`). The units are not interchangeable: rules, rows disposed,
and table rows are three different counts. The two deferrals stay in
`PENDING` because they are still owed a REGISTERED rule; neither is
idle — one has a written rule and the other a pinned population.

### The batch's real population: 2,515 catalogued, 2,114 distinct

Summing the ten rows' `corpusCount` gives **2,515 entries**. That is
not the number of entries the batch is about, because two of the ten
rows are strict subsets of two others, both measured rather than
argued:

- `tosefta-variant-chapter-halakha-loss` (391) is the chapter-only arm
  of `anchor-swallows-close-paren`'s 493. The shared walk in
  `rules/paren-boundary.ts` enumerates **525 occ / 493 ent** — that is
  the close-paren row — and splits it by whether the primary's
  `data-ref` carries a halakha: **414 occ / 391 ent** chapter-only, and
  **111 occ / 107 ent** disagreeing. The occurrence split is additive
  (414 + 111 = 525); the ENTRY split is not, because 5 entries carry
  both arms (391 + 107 − 5 = 493). So the containment is a STRICT
  subset — 391 of 493 entries — measured rather than asserted, and 391
  is what the arithmetic below subtracts. All five figures are pinned
  in `paren-boundary-corpus.test.ts`, the disagreeing arm's entry count
  and the both-arms overlap added there in this branch's last fix wave
  so that no later reader has to re-derive them from prose.

  > **CORRECTED 2026-08-26 (impl/phase-2-batch-4).** This bullet read
  > *"The shared walk … returns the same 525 occ / 493 ent for both,
  > splitting 414 + 111 … The containment is an equality of
  > populations, not an assertion."* Both cardinalities were wrong in
  > the same way: 525 / 493 is the WALK and the close-paren row, never
  > the halakha row, which is 414 / 391; and a subset of 391 inside 493
  > is not an equality. The spec has carried the correct reading since
  > §3.1's own retraction (*"414 occ / 391 ent inside 525 occ / 493
  > ent"*). Nothing downstream moves — 391 was already the figure
  > subtracted.
- `jt-double-wrapped-citation` (10) is the empty-trapped-text arm of
  `nested-anchor-swallows-punctuation`'s 465. Asserted as a sorted rid
  list in `rules/nested-anchor.test.ts`, and re-derived independently
  from the pipeline in §5.

`2,515 − 391 − 10 = **2,114 distinct entries**`. With
`post-anchor-numeral-duplication` withdrawn the batch's surviving
transform-route population is `2,504 catalogued / 2,103 distinct`.

Both figures were wrong when the batch was ruled and both were
corrected in the spec during it: the headline read 2,513 before this
batch's two count corrections (`494 → 493`, `388 → 391`, net +2), and
the derived population read 2,122 because it subtracted the tosefta
containment and not the JT one. The spec's rule count was stale too —
it said seven rules where six shipped, the seventh being
`unterminatedHref`, deferred in §6. **Corrected in the spec 2026-08-26**
(§3.1, §5), together with the tosefta halakha carry that §5's inventory
had presented as an implemented rule and that was in fact never
written.

### Catalogued vs measured, the nine rows that stayed transform rows

Every figure below is measured on the pinned snapshot
(`data/source/jastrow-dictionary.jsonl`, sha256 `4c64ff03…`). It is
**nine rows, not the eleven the batch touched, and not the eight it
disposed of** — this is a table-membership count, a third unit again:
two of these nine (`tosefta-variant-chapter-halakha-loss`,
`unterminated-href-swallows-closing-tag`) are still `PENDING`. The two absent from
the table are the two that left the transform route — `post-anchor-
numeral-duplication` (11 catalogued, measured 11 occ / 11 ent, spec
§2) withdrawn to `judgment`, and `superscript-subsection-contradicts-
link-sub-section` (33), which was born a `judgment` row and so has no
catalogued-versus-measured verdict to record.

**"Catalogued" is the figure the row carried WHEN THE BATCH WAS RULED**,
not what `patterns.jsonl` holds now — the two rows marked **corrected**
were written back during the batch and read 493 and 391 today.

| Row | Catalogued, as ruled | Measured occ | Measured ent | Verdict |
|---|---:|---:|---:|---|
| `nonsense-dup-anchor` | 755 ent | 755 | 755 | MATCH |
| `nested-anchor-swallows-punctuation` | 465 ent | 475 | 465 | MATCH (occ ≠ ent, recorded in the row) |
| `anchor-swallows-close-paren` | 494 ent | 525 | **493** | **corrected**, 494 was arithmetic |
| `open-paren-in-anchor-display` | 214 ent | 225 | 214 | MATCH |
| `superscript-subsection-stranded-outside-anchor` | 160 ent | 182 | 160 | MATCH |
| `citation-number-truncated-outside-anchor` | 14 | 14 | 14 | MATCH alone; **12 composed**, §3 |
| `tosefta-variant-chapter-halakha-loss` | 388 ent | 414 | **391** | **corrected**; measured, not repaired |
| `jt-double-wrapped-citation` | 10 | 20 | 10 | MATCH, inside the row above it |
| `unterminated-href-swallows-closing-tag` | 2 | 2 | 2 | MATCH; D00478 + J00597 |

Both corrections went into `patterns.jsonl` before any rule registered,
with the measurement in the row's own `reason`. The `+3` on the tosefta
row is not a selection difference — the anchor-view and
textually-adjacent predicates return the identical 414 occ / 391 ent
entry set, because the separator is the literal `" ("` in 414 of 414
occurrences. It is round-3 measurement spread: that round recorded
three mutually inconsistent readings of one shape (522 / 526 / ~558
pairs) and none stored a rid set, so **the three differing entries
cannot be named from the record**. That limit is stated in the row
rather than papered over.

## 2. Registry order — which claims are whole-registry, which are pairwise

`RULES` went from 27 to 33, and batch 4 is deliberately **SPLIT across
two blocks**:

| Position | Rules | Why there |
|---|---|---|
| 3–4, in the unlink block | `dupAnchorLanguageRef`, `nestedAnchorDuplicate` | they declare `unlinks`, so `registry.order.test.ts` earns them into `UNLINK` from the corpus, and rules 1 and 4 then require them above every retarget and every rtl wrap rule (**corrected 2026-08-26 from "2–3"**: `apparatusCite` and `rabbiName` hold 1–2) |
| 12–15, after the wrap component, before the retargets | `toseftaCloseParen`, `openParenInAnchorDisplay`, `superscriptInsideAnchor`, `truncatedCitationDigit` | they REPAIR anchors that the retargets READ, and they must see the anchor sequence the unlinks leave behind |

The two unlink rows could not join the four: inserting them into the
seven-rule unlink/wrap component would break the gap-free span
`checkAdjacency()` requires, and moving the four up next to them would
put anchor repairs ahead of the deletions that decide which anchor is
which.

**Which claims rest on what.** The distinction the batch was asked to
state plainly:

| Claim | Evidence |
|---|---|
| all six placements are FREE on today's corpus | **whole-registry, both ways.** Each rule moved to the FRONT and to the BACK of `RULES`, the whole registry composed over all 32,512 entries, final bytes compared per entry: **0 / 0 for all six.** |
| no new non-commuting pair | **pairwise gate only.** 33 rules, 528 unordered pairs, 528 composed, 8 non-commuting, **0 undeclared** — the same 8 the branch already declared. |
| the two paren rules do not induce each other's shape | **whole-corpus, both orders, as a shipped assertion** — `paren-boundary-corpus.test.ts`: 0 order-dependent entries, 0 induced close-paren sites, 0 induced open-paren sites. |
| the two unlink populations are disjoint | **whole-corpus assertion** in `nested-anchor.test.ts`: 755 + 465 = 1,220, 0 shared entries, reproducing the pre-re-scope catalogued figure from the opposite direction. |
| batch 4 changes no link target | **whole-pipeline**, §5. |

Nothing in this batch rests on the pair gate alone except the negative
"no new non-commuting pair", which is exactly what that gate is for.
The 0 / 0 figures are the whole-registry answer; the gate is the cheap
continuous one.

### The slot left in `RULES`

`toseftaPrimaryHalakha`, when the gate ruling lands, registers
**STRICTLY BEFORE `toseftaCloseParen`** — not merely adjacent. The slot
is marked in `registry.ts` with the reason, because getting it
backwards is SILENT: `toseftaCloseParen` destroys `toseftaSplits`'s own
predicate (a variant's display reads `XVII), 6` before the boundary
move and `XVII` after, and `VARIANT_DISPLAY` is anchored at both ends),
`run.ts` feeds each rule the previous rule's output, and a halakha rule
registered below would repair 0 primaries while `transform:count` kept
reporting 414. Green everywhere, nothing done.

## 3. Composed vs isolated

Composed over the whole registry, all six rules reproduce their
isolated figures — except one.

| Rule | Alone (occ) | Composed (occ) | Pipeline (occ) |
|---|---:|---:|---:|
| `dupAnchorLanguageRef` | 755 | 755 | 755 |
| `nestedAnchorDuplicate` | 475 | 475 | 475 |
| `toseftaCloseParen` | 525 | 525 | 525 |
| `openParenInAnchorDisplay` | 225 | 225 | 225 |
| `superscriptInsideAnchor` | 182 | 182 | 182 |
| `truncatedCitationDigit` | **14** | **12** | **12** |

**The −2 is `apparatusCite`, and it is correct.** G00065 and H00504 both
carry `Koh. III, p. 3NN` — an apparatus citation wrongly linked to
Ecclesiastes — and `apparatusCite`, six slots above, removes the whole
anchor. There is no anchor left for a digit to be stranded outside of,
so the defect is gone rather than unrepaired. The two orders converge:
unlinking keeps the display text, so composing the pair either way
leaves those entries byte-identical, which is what the 0 / 0
measurement in §2 reports.

The registry composed over all 32,512 entries now produces **13,696
records**. Two block comments in `registry.ts` quoting an obsolete
6,224 were corrected in place.

## 4. The defect the pipeline manufactured

`bun body:migrate-dry` reported **13** instances of
`citation-number-truncated-outside-anchor` where the composed run on
raw source reported 12 and the isolated run 14. Three different numbers
for one rule is the shape batch 3a's finding took, so it was traced
before anything else proceeded.

The extra instance is **S01040**, which is not one of the catalogued 14
and does not carry the defect in the source at all. `applyRepairs` runs
first, and `rejoin-chopped` — "rejoined phantom `2)` into preceding
flow" — folds that sense marker into the flow immediately behind:

```text
… <a class="refLink" href="/Genesis.4.2" data-ref="Genesis 4:2">Gen. IV, 2</a>2)<i>artist</i> …
```

`truncatedCitationDigit`'s predicate is "display ends in a digit, and
the text token after `</a>` begins with digits". Both hold. The rule
produced:

```text
… <a … data-ref="Genesis 4:2">Gen. IV, 22</a>) <i>artist</i> …
```

A link whose display reads a verse the entry does not cite, pointing at
the verse it does. Every gate passes: the text multiset is identical
(one byte moved across a tag), the markup delta is zero, no target was
written, the anchor count is unchanged.

**The refusal.** `digitMoveAt` now declines a digit run closed by `)`,
because `N)` after a citation anchor is a printed SENSE NUMBER and not
a citation tail. The census that licenses the narrow phrasing: across
all 32,512 raw entries the remainder after the stranded digits is
` ` (×4), ` (`, ` I`, ` t`, ` נ`, `, `, `.]`, `.—`, `; ` (×2) and
`ᵇ,` — **14 of 14, and not one begins with `)`**. The only `)` in the
corpus is S01040's, and only after repairs. `bun transform:count` still
reports 14 MATCH, and the pipeline now reports 12.

It is **fail-closed and the cost is stated**: a genuine
`(cmp. B. Kam. XI, 2</a>8)` would be declined too. This corpus holds
none, and the two errors are not symmetrical — declining leaves a
defect exactly as it was, moving wrongly invents a citation.

## 5. Link accounting, measured on the pipeline

Batch 4 is the first batch since 3a whose rules all edit anchors, and
two of them DELETE one. Measured by running the full pipeline
(`applyRepairs` + the whole registry) over all 32,512 entries twice,
withholding batch 4's rules and nothing else:

| | batch 4 withheld | shipped | delta |
|---|---:|---:|---:|
| anchors corpus-wide | 169,285 | 168,055 | **−1,230** |
| resolving Jastrow targets | 72,593 | 71,383 | **−1,210** |
| DISTINCT (rid, `data-ref`) pairs | 160,239 | 160,239 | **0** |

The third row is the one that says nothing was lost. Every removed
anchor was the OUTER layer of a pair whose inner anchor carries the
same target, so **not one address left the corpus** — 0 addresses
present without batch 4 and absent with it.

The 20 removals that were not resolving Jastrow targets are, exactly,
the `jt-double-wrapped-citation` pairs — 2 each across A00722, C01048,
J00603, K00021, K01007, M01214, N00255, P01456, S00534, U00888. That
row's population, re-derived from the pipeline by subtraction, having
been asserted independently in the rule's own tests. It is the
strongest evidence for the `COVERED` record in §6.

Batch 4's other four rules move **no anchor and no target**: withholding
all six gives the same 72,593 as withholding the unlink pair alone.

`admin/pipeline/body/pipeline-links.test.ts` still reports **gained 90,
lost 0** on its differential arm. Its ABSOLUTE pin moved 72,593 →
71,383 — the first use of the clause its own docstring wrote for this
case ("a new unlink rule will move it legitimately — update the number
WITH the measurement that justifies it") — and the measurement above is
recorded there.

## 6. The two gate walls, and the row that needs no rule

### `tosefta-variant-chapter-halakha-loss` — 414 occ / 391 ent

Print reads `Tosef. Sabb. XVI (XVII), 6`. Sefaria splits it across two
anchors and the primary loses the halakha: its `data-ref` is
`Tosefta Shabbat 16` where the variant's is `Tosefta Shabbat 17:6`.
`link-target.ts` case 4 refuses the repair. `rejoinsFrom`'s 2026-08-24
tightening requires the part of `tail` the split discards to itself be
a prefix of `head`; the only viable split keeps `:6` and discards
`Tosefta Shabbat 17`, which is not a prefix of `Tosefta Shabbat 16`.
Every other assignment of the pair's four targets to `head`/`tail` was
tried and none clears; case 3 cannot license it either, because its
remainder must occur in the primary's own display, which reads
`Tosef. Sabb. XVI`.

**Why deferred and not dropped.** The halakha `6` is witnessed TWICE in
the entry's own input — in the variant's `data-ref`
(`Tosefta Shabbat 17:6`) and again in the variant's display text
(`XVII), 6`), agreeing 525 of 525 times. That is strictly more evidence
than case 4 asks for. The gap is in the gate, not in the repair. The
refusal is kept as a live test, green on the refusal string, so
widening the gate breaks it and sends whoever widened it to the
argument.

### `unterminated-href-swallows-closing-tag` — 2 occurrences

The rule is written, tested (19 tests) and on the branch as
`rules/malformed-href.ts`. It is **deliberately not registered**:
`checkLinkTargets` refuses D00478, and `run.ts` throws on a gate
problem, so registering it would HALT the migration on the first pass
over that entry rather than repair anything.

**D00478's problem is parsed targets versus raw bytes.**
`link-target.ts` builds the licensed target set from the input's PARSED
anchors, and the whole nature of this defect is that the damaged tag
does not parse: with no closing quote, `links.ts` reports `href: ''`
and `data-ref: ''`. So `/Jastrow,_כָּלוּל.1` and `Jastrow, כָּלוּל 1` —
present in the input as raw bytes, inside the damaged tag — are absent
from the set cases 1 and 2 test membership against. Case 3 fails on the
display test, case 4 finds no input target ending in the remainder,
case 5 is gershayim-only. J00597, by contrast, passes with nothing
declared, because its intact twin puts both spellings into the parsed
set.

This is structurally the gap **case 5 was invented to close** — a
repair whose evidence lives in raw tag bytes the parser cannot read.
`types.ts` says as much of case 5 in its own words.

**Both deferrals fold into ONE follow-up gate PR** (Brian, 2026-08-26),
on the shape PR #50 took: a ruling on a SHARED gate is not an
implementation choice inside one rule module.

### `jt-double-wrapped-citation` — repaired, and never to have a rule

`nestedAnchorDuplicate` repairs all 10 entries; the row is that rule's
empty-trapped-text arm. Left in `PENDING` it was a standing claim that
a row is still owed a rule, and that claim became false the moment the
rule shipped — **with no gate failing**, because a row in `PENDING` is
exactly what `coverage()` expects to find. Removing it from `PENDING`
and naming it nowhere makes it `unaccounted`: the same silence from the
other side.

`registry.ts` gained a third list, `COVERED`, naming the row and the
RULE that repairs it. `coverage()` counts such a row as owned only
while that rule is registered, so:

- unregistering `nestedAnchorDuplicate` drops the row into
  `unaccounted` and fails `registry.test.ts`;
- naming it in `COVERED` and `PENDING` at once is reported as
  `duplicated` and fails the disjointness test.

The claim is falsifiable where it was silent. What `COVERED` does NOT
establish is that the repair is real — no more than a `PENDING` entry
establishes that a row needs one; the evidence is the sorted rid list
asserted in `rules/nested-anchor.test.ts` and §5's independent
re-derivation.

### The two withdrawals

- **`post-anchor-numeral-duplication` (11 occ / 11 ent) → `judgment`.**
  The direction is now settled: deleting the bare trailing copy yields
  a shape attested **681 occurrences** corpus-wide against **1** for the
  alternative, and in 2 of the 11 the `data-ref` carries `²` where the
  display carries `I`, proving the display numeral is print text rather
  than a copy of the ref. What blocks a rule is that **no candidate
  MECHANISM survives its own members** — all 11 duplicates are `I` at
  p = 5.9 × 10⁻⁵ — and a transform must know why it is deleting.
  Audit: [`post-anchor-numeral-duplication.md`](../../data/patches/catalogue-audit/post-anchor-numeral-duplication.md).
- **`superscript-subsection-contradicts-link-sub-section` (38 occ / 33
  ent) — a NEW row, `judgment` from birth**, split off
  `superscript-subsection-stranded-outside-anchor`, whose boundary
  repair survives the split. Deltas spread −17…+20 with a modal −1 at 9
  of 38: nothing mechanical recovers the right value. Its predicate is
  written against the POST-transform shape `<sup>N</sup></a>`, because
  a snapshot-shape predicate measures zero once this batch lands.
  Audit: [`superscript-subsection-stranded.md`](../../data/patches/catalogue-audit/superscript-subsection-stranded.md).

The same audit leaves **77 occurrences / 70 entries genuinely
undisposed**: the sub-section-less slice whose parent row's prose
advertises a `data-ref` ENRICHMENT that **no shipped rule performs**.
`superscriptInsideAnchor` moves markup and leaves every target alone,
so once it ships the 77 READ as handled while nothing has been written.
Recorded in the parent row's `reason`; it needs a ruling on whether a
print-supplied sub-section may be written into a `data-ref`, which is a
target edit that must clear `link-target.ts`.

## 7. The phase ruling

**All six rules are `phase: 'text-repairs'`**, matching all 27 rules
shipped before them. Two reviewers asked whether the structural
removals belong in `structural-repairs`. They do not, and the reason is
not conservatism:

1. **It is the wrong side, not merely an empty one.** The committed
   phase manifest (`patch/apply.ts:56-57`) runs `structural-repairs`
   after `text-repairs` in full, so an unlink rule moved there would run
   after every wrap and retarget rule in the registry — the exact
   inversion `fix/rtl-unlink-order` was written to undo, and one that
   rules 1 and 4 of `registry.order.test.ts` exist to forbid.
2. **It is unwired and fails loudly.** `migrate-dry.ts:294` runs the
   phase as a no-op and `migrate-dry.ts:144` throws the moment any rule
   declares it ("wire it — batch 6"). A rule placed there today halts
   the migration instead of running late.
3. **The name does not describe these rules.** `structural-repairs` is
   reserved for a pass that changes an entry's SHAPE — splitting a
   sense, moving a field — which is why `markup.ts:168` reasons about a
   field COUNT changing under it. Dropping a redundant anchor layer
   changes markup inside one field and leaves the sense tree untouched.

The ruling is written into `registry.ts` beside the rules, not only
here.

## 8. What the gates still cannot see

Stated plainly rather than implied covered.

**The commutation gate is pairwise.** It composes rule pairs both ways
over the corpus and compares serialized entries. It closes two-rule
exposure and nothing else: if rule C produces the state on which A and
B disagree, the gate is silent — and there are 33 rules. The
whole-registry front/back measurements in §2 are what answer that for
this batch, one rule at a time, on today's corpus.

**It says nothing about the 38 `PENDING` rows.** A predicate that does
not exist cannot be compared with one that does, so every unwritten
rule is outside the gate by construction.

**The adjacency gate reads only recorded edges.** 35 of the 38 rows
still in `PENDING` carry no `entangledWith` edge at all, so for most of
the remaining queue `checkAdjacency` is unfalsifiable by construction —
not because the check is weak, but because its input is incomplete. A
clean run means "no RECORDED entanglement is split", never "no
entanglement is split".

**Two recorded edges are now reported rather than validated**, and the
report is pinned in `registry.order.test.ts` with its reason:
`anchor-swallows-close-paren ~ tosefta-variant-chapter-halakha-loss`
and `jt-double-wrapped-citation ~ nested-anchor-swallows-punctuation`.
Both have one registered endpoint and one that will not have a rule
soon (or ever). `unaccountedEdges` was not weakened to accommodate
them: its exact output is the record, so a THIRD unaccounted edge fails
the test.

**The four-gate stack does not measure link integrity.** An invariant
anchor count is not "no link lost", and neither is the stack:
`<a>(</a>)` is a well-formed anchor with an EMPTY display — a link with
nothing to click — and it clears `checkNoNewText` (identical text
multiset), `checkMarkup` (zero delta), `checkLinkTargets` (unchanged
target) and the anchor count alike. `openParenInAnchorDisplay` would
produce exactly that from a one-character display and nothing in the
stack would object. The live population of such displays is 0 and
`paren-boundary-corpus.test.ts` asserts the stronger property the count
does not give — **the number of anchors with an empty display is itself
invariant across every edit** — with a fixture demonstrating the hole
directly (the rule fires on `<a>(</a>)`, every gate passes, the hollow
count goes 0 → 1).

The same blind spot has a SIBLING, and it is now closed in code rather
than in prose. `<a>(XVII)</a>)` would have had its `(` carried out and
left a `)` inside the link — the very defect `toseftaCloseParen`
removes — with every gate silent for the same four reasons.
`moveOpenParenOut`'s docstring already asserted this could not happen
("0 whose display is left unbalanced once the leading `(` is
discounted"), but that was a MEASUREMENT being read as a guarantee and
nothing enforced it. `keepsParensBalanced` now does, fail-closed beside
`usable` and `tagFree`. It declines **0** members: the row still
measures **225 occ / 214 ent** with the guard in place, under both the
"no unmatched `)`" and the stricter "ends at depth 0" readings.

**No gate knows what a catalogue row OWNS.** Batch 3b's finding stands
unaddressed: two rows can describe the same characters without either
audit noticing. This batch met it twice — the tosefta containment and
the JT containment — and both were caught by a byte-SPAN comparison a
person ran, not by a check. A rid-level test would have reported a
false collision on the 9 entries carrying both paren shapes at
different offsets.

**A repair upstream can create a transform's population.** §4 is the
first measured instance. Nothing watches for it; the only reason it
surfaced was comparing three counts of one rule that should have
matched.

## 9. `bun transform:count`

```text
33 rule(s), 3 mismatch(es).
```

All six batch-4 rows report MATCH. The three mismatches are
pre-existing and documented: `ib-yoma-2a` −124 and
`sifre-ib-resolves-to-yalkut` −5 (both batch 2, catalogue counts
awaiting correction), `paren-tag-no-space` −7 (batch 3b).

## 10. `bun body:migrate-dry`

```text
entries=32512 repaired=812
gate formSection=32512/32512
gate lettered=32512/32512
gate rejoin=32512/32512
gate units=32512/32512
labelQuarantines=0
schemaFailures=0  repairFailures=0  transformFailures=0
patchCorpus=0 patchesApplied=0 patchProblems=0
```

Batch 4's instances: `nonsense-dup-anchor` 755,
`nested-anchor-swallows-punctuation` 475, `anchor-swallows-close-paren`
525, `open-paren-in-anchor-display` 225,
`superscript-subsection-stranded-outside-anchor` 182,
`citation-number-truncated-outside-anchor` 12.

## 11. Concerns

1. **Two rows are unrepaired and both wait on one gate ruling.** 393
   entries between them. The evidence for both repairs is recorded
   where the ruling will be made, and both refusals are live tests.
2. **The 77 target-enrichment candidates are undisposed and will read
   as handled.** §6. This is the batch's most likely thing to be
   silently lost.
3. **`registry.test.ts` sits at exactly the 300-line
   `noExcessiveLinesPerFile` ceiling, and comments are NOT free.**
   Measured while trying to document `COVERED` there: an 11-line
   comment inserted mid-file took it to 311 and tripped the info.
   (Comment lines appended after the file's last statement are not
   counted, which is what made an earlier probe read as safe.) That is
   why `COVERED`'s enforcement lives inside `coverage()` itself, where
   the two existing assertions already bite on it, and why its
   explanation lives in `registry.ts` rather than beside the tests
   that enforce it. **Nothing can be added to that file — comment or
   code — until it is split.**
4. **`COVERED` is a claim, like `PENDING`.** It is falsifiable in the
   directions that matter (the naming rule must be registered; the row
   may not also be `PENDING`) but nothing proves the repair is complete
   except the tests that measured it.
5. **`truncatedCitationDigit`'s refusal is fail-closed and will decline
   a legitimate shape if the corpus ever grows one.** Named in the
   rule's docstring with the census that says none exists today.
6. **The `-2` in §3 means `apparatusCite` and `truncatedCitationDigit`
   both reach two entries.** Neither row's `corpusCount` says so, and no
   gate would have reported it; it was found by comparing composed and
   isolated counts, which is a manual habit and not a check.

## Verification, reproducible

```bash
bun test                                             # 946 pass, 0 fail
bunx biome check .                                   # 122 infos, 0 errors
bun qa:tsc                                           # exit 0
bun transform:count                                  # 33 rules, 3 mismatches
bun body:migrate-dry                                 # entries=32512 repaired=812
bun test admin/pipeline/body/pipeline-links.test.ts  # 71,383 / +90 / −0
bun test admin/pipeline/transform/commutation.test.ts
#   33 rules, 528 pairs, 8 non-commuting, 0 undeclared
```

`coverage()` after this batch:

```text
{ covered: ['jt-double-wrapped-citation'], duplicated: [], pending: 38,
  registered: 34, total: 72, unaccounted: [] }
```

`registered + pending = 34 + 38 = 72 = total`, with the covered row
counted as owned by the rule that repairs it.
