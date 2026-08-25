# Phase 2 worklist — the catalogue, routed

**Status: triaged 2026-08-21; totals recomputed from the catalogue
2026-08-25 after transform batch 3a and its pre-PR review.** All 131
candidate rows routed.
This is the Phase 2 entry point: start here, not in `patterns.jsonl`.

Every count on this page is derived from `patterns.jsonl`, never typed
in. Reproduce the route totals and the cutover cross-cut with:

```bash
bun -e 'import {parsePatterns} from "./admin/pipeline/research/patterns.ts";
const rows=(await parsePatterns(await Bun.file("data/patches/patterns.jsonl").text())).filter(r=>r.status==="candidate"&&r.route!==undefined);
const sum=(rs)=>rs.reduce((a,b)=>a+b.corpusCount,0);
for (const route of ["transform","judgment","blocked"]) { const rs=rows.filter(r=>r.route===route); console.log(route, rs.length, sum(rs)); }
const b=rows.filter(r=>r.blocking===true); console.log("blocking", b.length, sum(b), "| rest", rows.length-b.length, sum(rows)-sum(b));'
```

## Start here

| | |
|---|---|
| Catalogue | `data/patches/patterns.jsonl` — 149 rows, 131 candidate |
| Queue helpers | `admin/pipeline/research/patterns.ts` — `transformQueue()`, `blockingWork()`, `checkEntanglement()` |
| Phase spec | `docs/specs/2026-08-17-sweep-tiering-design.md` §4 |
| Round 4 reconcile | `docs/v2/discovery-round-4.md` |
| Snapshot | `data/source/jastrow-dictionary.jsonl`, sha256 `4c64ff03…`, pinned in `data/patches/snapshot.lock` |

```bash
bun -e 'import {parsePatterns,transformQueue} from "./admin/pipeline/research/patterns.ts"; const r=parsePatterns(await Bun.file("data/patches/patterns.jsonl").text()); console.table(transformQueue(r).slice(0,20))'
```

## The two axes, and what they do NOT mean

> **T6** Blocking = breaks the render **or** would be baked in by the
> transform. Everything else defers to post-launch.

> **T5** A pattern with a corpus-wide count and no per-entry judgment
> becomes a **deterministic transform**, never an LLM task.

**`blocking` gates the cutover; it does not gate the work.** A
non-blocking row whose predicate is already known is cheaper to fix now
than to carry into the post-launch sweep — the transform costs the same
either way, and shipping it early means shipping fewer defects. Read
`blocking: false` as *"launch need not wait for this"*, never as *"do
not touch this"*. `transformQueue()` deliberately does not filter on it.

A third route was needed. Round 4 found rows whose count is an *output
of the rule* rather than a corpus fact — `interior-consonant-mislink`
returns 464 / 495 / 516 / 642 / 708 depending on the comparison rule.
Those are **`blocked`**: neither transformable nor judgeable until
someone pins the predicate.

## Shape of the work

| Route | Rows | Instances | What it needs |
|---|---:|---:|---|
| **transform** | **77** | **21,678** | deterministic code + tests |
| judgment | 49 | 15,754 | per-entry reading (Opus pass or maintainer) |
| blocked | 5 | 4,947 | pin the predicate first |

Phase 1 closed this table at 81 / 46 / 5. Every move since has been a
transform row failing its own audit — or, once, a row whose whole
population turned out to be owned elsewhere. Either way the mechanism
is working:

- `abbrev-in-alt-headwords` (2,035) moved transform → judgment on
  2026-08-22 (spec
  [§5.2](../specs/2026-08-22-transform-module-design.md)), and
  `bare-rtl-hebrew`'s count was corrected 4,190 → 4,189 when its
  transform landed.
- Batch 2 moved two more: `h-cognate-self-link` (85) and
  `homograph-numeral-mismatch` (538), each with its audit published
  under `data/patches/catalogue-audit/`. It also corrected three
  counts to what the shipped rules reproduce —
  `rabbi-name-linked-as-bible-book` 41 → 42,
  `plural-to-feminine-final-letter-mislink` 57 → 50, and
  `sifre-ib-resolves-to-yalkut` 5 → 6 — and wrote a first `reason` for
  `prefixed-geresh-abbrev-mislink` and `ib-yoma-2a`. See
  [transform-batch-2.md](transform-batch-2.md).
- Batch 3a corrected one count — `ascii-quote-as-gershayim-in-body`
  1,290 → 1,386 — and wrote a first `reason` for
  `gershayim-breaks-ref-attribute`, whose catalogued 85 reproduced
  exactly. Its pre-PR review then moved a fourth row out:
  **`ascii-gershayim-outside-body-text` (409) is discarded**, and it
  is the first withdrawal not caused by a rule failing its audit. Its
  seven slots ARE the gershayim defect, seen outside the audit's
  `dir=rtl` scope; the two shipped rules repair six of them and
  `refs[]` is dropped at compile (B7), so an exhaustive walk over the
  raw JSON puts its unowned surviving population at **zero**. Left on
  `transform` it would have been a second owner of records those rules
  already repair. See [transform-batch-3a.md](transform-batch-3a.md).

**51.2% of the backlog is deterministic code** (21,678 of 42,379
instances), 59% of it by row. That is the most useful number here —
most of the catalogue does not need judgment at all.

Cutover gate, cross-cut:

| | Rows | Instances |
|---|---:|---:|
| Blocks the v2 cutover | 58 | 15,676 |
| Launch need not wait | 73 | 26,703 |

## The transform queue — all 77 rows, largest first

`⚠ unaudited` marks a row with no `reason` recorded: its count has never
been derived. That is not a reason to skip it — for a transform row,
**writing the transform is the audit**, because a deterministic rule
either reproduces the count or does not.

| Row | Instances | Blocks cutover | Audit |
|---|---:|---|---|
| `bare-rtl-hebrew` | 4,189 | **yes** | — |
| `ascii-quote-as-gershayim-in-body` | 1,386 | no | — |
| `tanhuma-never-linked` | 1,137 | no | — |
| `italic-swallowed-terminal-period` | 1,098 | no | — |
| `label-period-outside-italic` | 945 | no | — |
| `mekhilta-sifra-never-linked` | 923 | no | — |
| `unlinked-v-span` | 796 | no | ⚠ unaudited |
| `nonsense-dup-anchor` | 755 | **yes** | — |
| `pesikta-drk-never-linked` | 695 | no | — |
| `parenthesized-alt-headword` | 580 | **yes** | ⚠ unaudited |
| `stranded-stem-head` | 544 | **yes** | — |
| `redundant-outer-rtl-span` | 529 | no | — |
| `anchor-swallows-close-paren` | 494 | no | — |
| `geresh-letter-numeral-mislink` | 475 | no | — |
| `nested-anchor-swallows-punctuation` | 465 | **yes** | — |
| `binyan-form-leading-space` | 457 | **yes** | — |
| `binyan-form-empty-slot` | 446 | **yes** | — |
| `tosefta-variant-chapter-halakha-loss` | 388 | no | — |
| `targum-sheni-never-linked` | 362 | no | ⚠ unaudited |
| `plural-label-rendering-defeats-capture` | 358 | **yes** | — |
| `empty-stem-section` | 342 | **yes** | ⚠ unaudited |
| `ib-yoma-2a` | 312 | no | — |
| `holam-migrated-off-mater-vav` | 308 | no | — |
| `emphasis-run-edge-space` | 304 | no | — |
| `midrash-petichta-unanchored` | 279 | no | — |
| `em-dash-section-break-in-own-italic` | 270 | no | — |
| `phrase-alt-headword-stub` | 236 | **yes** | — |
| `open-paren-in-anchor-display` | 214 | **yes** | ⚠ unaudited |
| `prefixed-geresh-abbrev-mislink` | 173 | no | — |
| `v-sub-redirect-stub-mislink` | 161 | no | — |
| `superscript-subsection-stranded-outside-anchor` | 160 | **yes** | — |
| `latin-token-inside-rtl-span` | 130 | **yes** | — |
| `trailing-em-dash-tail` | 130 | **yes** | — |
| `paren-tag-no-space` | 126 | no | ⚠ unaudited |
| `anchor-italic-no-space` | 111 | no | ⚠ unaudited |
| `sense-number-outside-closed-grammar` | 111 | **yes** | — |
| `italic-close-paren-nospace` | 95 | no | ⚠ unaudited |
| `gershayim-breaks-ref-attribute` | 85 | **yes** | — |
| `duplicated-definition-opening-run` | 85 | **yes** | — |
| `empty-lead-sense` | 84 | **yes** | — |
| `ellipsis-fragment-anchored` | 80 | no | — |
| `shin-sin-dot-drop` | 77 | no | — |
| `continuation-marker-em-dash-loss` | 71 | **yes** | — |
| `asterisk-stem-label` | 69 | **yes** | — |
| `adjacent-verbatim-repetition` | 59 | **yes** | — |
| `plural-to-feminine-final-letter-mislink` | 50 | no | — |
| `bracketed-gloss-lead-sense` | 49 | **yes** | — |
| `citation-quote-seam-period` | 43 | no | — |
| `rabbi-name-linked-as-bible-book` | 42 | no | — |
| `abbrev-headword-stub` | 34 | **yes** | — |
| `italic-lone-punctuation` | 29 | no | — |
| `reversed-hebrew-phrase` | 27 | **yes** | — |
| `homograph-roman-stranded-in-definition` | 23 | **yes** | — |
| `gender-pair-headword-line-collapse` | 22 | **yes** | — |
| `geresh-abbrev-space-loss` | 22 | no | — |
| `containment-fallback-mislink` | 22 | no | — |
| `orphan-gloss-seam-period` | 19 | no | — |
| `stem-head-marker-chop` | 18 | **yes** | — |
| `impossible-dagesh` | 17 | no | — |
| `translit-italic-space-loss` | 15 | no | — |
| `gloss-head-seam-period-doubling` | 15 | no | — |
| `citation-number-truncated-outside-anchor` | 14 | **yes** | — |
| `shuruk-as-yod-display-corruption` | 12 | no | — |
| `vkh-geresh-loss` | 11 | no | — |
| `post-anchor-numeral-duplication` | 11 | no | — |
| `trailing-whitespace-definition` | 10 | no | — |
| `section-break-terminator-loss` | 10 | **yes** | — |
| `entry-final-comma` | 10 | no | — |
| `italic-swallows-close-paren` | 10 | no | — |
| `jt-double-wrapped-citation` | 10 | **yes** | — |
| `ib-targum-work-loss` | 8 | no | — |
| `apparatus-cite-linked-as-scripture` | 8 | no | — |
| `abbrev-fused-headword` | 7 | **yes** | — |
| `sifre-ib-resolves-to-yalkut` | 6 | no | — |
| `b-h-split-across-field-boundary` | 4 | **yes** | ⚠ unaudited |
| `see-particle-lost` | 4 | **yes** | — |
| `unterminated-href-swallows-closing-tag` | 2 | **yes** | — |

### Sequencing advice

1. ~~**`bare-rtl-hebrew` (4,190) and `abbrev-in-alt-headwords`
   (2,035)** are 25% of the whole transform queue.~~ **Done and
   superseded.** Batch 1 shipped `bare-rtl-hebrew` (4,189) with its two
   entangled siblings `redundant-outer-rtl-span` (529) and
   `latin-token-inside-rtl-span` (130) — the audit warns that writing
   one of the three alone trades one defect for another.
   `abbrev-in-alt-headwords` was written and then WITHDRAWN to
   `judgment`: expanding a geresh stub infers the variant's
   vocalization rather than moving text (spec
   [§5.2](../specs/2026-08-22-transform-module-design.md)).
2. ~~**Then take the non-blocking audited rows on size.**~~ **Batch 2
   did exactly that** — ten rows, 1,166 catalogued instances, all
   non-blocking, all link-shaped
   ([transform-batch-2.md](transform-batch-2.md)). There are 38 such
   rows left (10,394 instances, twelve of them already shipped) and they
   remain the cheapest real wins in the catalogue — predicate known, no
   cutover pressure, no judgment required.
3. **Respect `entangledWith`.** Four pairs must be fixed in one edit or
   they rewrite the same records twice. `checkEntanglement()` keeps the
   graph honest; the pairs are derived in the round-4 report. Batch 2
   shipped one of them, the geresh pair; batch 3a shipped the gershayim
   pair, recording the edge in `patterns.jsonl` *before* registering the
   rules. `registry.order.test.ts` now asserts cluster contiguity
   against the live graph rather than against a list.

   **Open, and it is catalogue work rather than transform work:** the
   adjacency gate reads `entangledWith` and nothing else, so a row
   carrying no edge is a singleton it cannot judge. **56 of the 62
   rows in `PENDING` carry no edge at all**, which makes the gate
   unfalsifiable by construction for most of the queue — a clean run
   means "no RECORDED entanglement is split", never "no entanglement is
   split". Reproduce:

   ```bash
   bun -e 'import {parsePatterns} from "./admin/pipeline/research/patterns.ts";
   import {PENDING} from "./admin/pipeline/transform/registry.ts";
   const rows=await parsePatterns(await Bun.file("data/patches/patterns.jsonl").text());
   const by=new Map(rows.map(r=>[r.id,r]));
   const noEdge=[...PENDING].filter(id=>(by.get(id)?.entangledWith??[]).length===0);
   console.log("PENDING:",PENDING.length,"| no edge:",noEdge.length);'
   ```
4. **9 transform rows are unaudited**, 4 of them blocking. Expect some
   to reclassify on contact — the routing is a reading of each row, not
   a measurement, and four rows have now moved: three to `judgment`,
   and `ascii-gershayim-outside-body-text` discarded outright.

## Candidates found in batch 2, recorded and NOT opened

Each was measured while a batch-2 rule was being written, each is
outside every catalogued row, and none has been added to
`patterns.jsonl` — the catalogue is saturated and opening a row is a
discovery decision, not a transform one. They are recorded here so the
measurement is not lost with the task reports.

| Candidate | Occ | Entries | Source, with a runnable query |
|---|---:|---:|---|
| bare `Ib.`/`ib.` → `Yoma 2a:N` (the 312's segmented twin) | 52 | 47 | `catalogue-audit/ib-yoma-2a.md` §8 |
| `Ibid.`/`ibid.` → `Yoma 2a` (a third spelling) | 3 | 3 | `catalogue-audit/ib-yoma-2a.md` §8 |
| `homograph-numeral-iv-default` — display string IS a headword, destination by string identity, all targeting a IV-numbered member | 40 | 37 | `catalogue-audit/homograph-numeral-mismatch.md` §6a |
| geresh arm 1 — variant readings abbreviated with a geresh (`Ms. K. ב׳`) | 152 | 123 | `catalogue-audit/geresh-abbrev-arms.md` arm 1 |
| geresh arm 5 — verbal-preformative stubs | 34 | 32 | `catalogue-audit/geresh-abbrev-arms.md` arm 5 |
| geresh arm 2 — `ר׳` = Rabbi in a non-resh host | 20 | 19 | `catalogue-audit/geresh-abbrev-arms.md` arm 2 — sibling of `rabbi-name-linked-as-bible-book` |

Two further recommendations from Task 9's audit, carried and not acted
on, both recorded in `homograph-numeral-mismatch`'s own `reason`:

- **Split `homograph-numeral-mismatch` in three.** The Roman arm
  (195 occ / 187 entries) is the only one the description fits and
  keeps the id; `homograph-numeral-vs-superscript` (277 / 262) belongs
  beside `homograph-numbering-schism`; `roman-numeral-orphan-display`
  (104 / 96) is chunk P's original id and count.
- **Fix the entry side first.** 243 of the 345 candidate defects
  (70.4%) name a member whose corpus headword carries no Roman numeral
  at all. Three entry-side shapes no row owns: 6 headwords printing the
  same numeral twice, distinguished only by a superscript (A00015,
  B00383, B00779, B01201, C00774, O01369); 6 headwords naming two print
  members at once, so no display numeral can ever match them (A00883,
  A02356, B00407, D00844, E00508, G00675); and B00098's double-space
  `"בַּד  V"`, a one-character repair that makes בַּד V addressable again.

## Judgment queue — 49 rows / 15,754 instances

`homograph-numeral-mismatch` (538) and `h-cognate-self-link` (85) are
the newest members, reclassified out of the transform queue in batch 2
on 2026-08-23 and 2026-08-24. Each failed a DIFFERENT test:
`h-cognate-self-link` had no defect to remove (no other article exists
for any of its 87 anchors), while `homograph-numeral-mismatch` has a
real defect and no nameable destination. Both audits are published
under `data/patches/catalogue-audit/`.

`abbrev-in-alt-headwords` (2,035) was the first, reclassified
out of the transform queue on 2026-08-22 — spec
[§5.2](../specs/2026-08-22-transform-module-design.md) has the ruling
and the test it establishes: *ask what a rule INFERS as opposed to what
it MOVES.*

**It is also `blocking: false`, decided the same day.** With no
transform, nothing is baked in by the migration, and no entry is
unreachable — every member carries a full geresh-free headword. What is
lost is the variant as a *search key*, in the 1,594 members that have no
geresh-free alt at all. Degraded search on those spellings is a
post-launch quality item, not a cutover gate. That is the only row whose
`blocking` flag this batch changed.

23 of these block the cutover (5,793 instances). Five rows are 85% of
that, and four of the five are **one family** —
paren/bracket integrity and lead-sense structure. Scope them as a single
pass, not five:

| Row | Instances |
|---|---:|
| `unmatched-closing-paren` | 1,604 |
| `etymology-head-pseudo-sense` | 1,553 |
| `preamble-stranded-lead-sense` | 676 |
| `citation-tail-truncation` | 657 |
| `unmatched-opening-paren` | 452 |

Full judgment list, blocking first:

| Row | Instances | Blocks cutover |
|---|---:|---|
| `unmatched-closing-paren` | 1,604 | **yes** |
| `etymology-head-pseudo-sense` | 1,553 | **yes** |
| `preamble-stranded-lead-sense` | 676 | **yes** |
| `citation-tail-truncation` | 657 | **yes** |
| `unmatched-opening-paren` | 452 | **yes** |
| `common-gender-inexpressible` | 228 | **yes** |
| `unnumbered-terminal-homograph` | 129 | **yes** |
| `doubled-space-as-text-loss-locator` | 108 | **yes** |
| `stranded-open-bracket` | 85 | **yes** |
| `bracket-paren-mismatch` | 67 | **yes** |
| `gloss-space-loss` | 45 | **yes** |
| `self-numbered-intext-marker` | 35 | **yes** |
| `lost-h-equivalent` | 32 | **yes** |
| `truncated-read-stub` | 26 | **yes** |
| `unclosed-editorial-bracket` | 18 | **yes** |
| `dangling-denom-tail` | 17 | **yes** |
| `lost-hebrew-after-h-marker` | 13 | **yes** |
| `verse-paren-false-sense-split` | 13 | **yes** |
| `inline-inflection-sublist` | 12 | **yes** |
| `continuation-marker-fully-absent` | 9 | **yes** |
| `contentless-entry` | 6 | **yes** |
| `first-sense-debris-stranding-language-label` | 5 | **yes** |
| `inflection-sublist-numbering-flattened` | 3 | **yes** |
| `abbrev-in-alt-headwords` | 2,035 | no |
| `homograph-numeral-blind-default` | 1,358 | no |
| `homograph-collapse-link` | 1,253 | no |
| `skeleton-escape-orphan` | 1,065 | no |
| `geresh-abbrev-fixed-sink` | 970 | no |
| `corrigendum-reading-linked` | 771 | no |
| `homograph-numeral-mismatch` | 538 | no |
| `unlinked-stub-nonexistent-target` | 451 | no |
| `midrash-section-cite-as-bible-chapter` | 255 | no |
| `homograph-numbering-schism` | 186 | no |
| `midrash-subsection-link-drift` | 179 | no |
| `binyan-head-form-mislinked` | 127 | no |
| `neighbor-rid-mislink` | 109 | no |
| `post-anchor-numeral-mismatch` | 91 | no |
| `h-cognate-self-link` | 85 | no |
| `initial-niqqud-drop` | 76 | no |
| `multiword-abbrev-mislink` | 62 | no |
| `stacked-impossible-niqqud` | 61 | no |
| `guttural-initial-simple-sheva` | 55 | no |
| `midrash-tehillim-wrong-psalm` | 49 | no |
| `inflection-abbrev-mislink` | 46 | no |
| `targum-cite-to-plain-bible` | 43 | no |
| `vocalized-twin-ignored` | 34 | no |
| `latin-prose-ocr-substitution` | 28 | no |
| `spurious-name-period` | 19 | no |
| `alt-headword-collision` | 15 | no |

## Blocked queue — 5 rows / 4,947 instances

| Row | Instances | Blocks cutover |
|---|---:|---|
| `dataref-skeleton-absent` | 2,572 | no |
| `plural-inflection-anchor-escapes-entry` | 1,417 | no |
| `interior-consonant-mislink` | 495 | no |
| `same-anchor-positional-mislink` | 374 | no |
| `open-paren-in-rtl-span` | 89 | **yes** |

Only `open-paren-in-rtl-span` is on the critical path. The other four are
the catalogue's hardest measurement problems and they are **all
link-target rows**, so none of them holds up shipping. Leave them until
after launch unless something else forces the issue.

## Caveats

- **The routing is a reading of each row's description and reason, not a
  measurement.** A `transform` label claims a deterministic predicate
  exists; that claim is only tested when the transform is written.
- **`blocking` leans inclusive.** Where "would be baked in by the
  transform" was arguable — lost-text rows especially — the row was
  marked blocking. Wrong that way costs pre-launch effort; wrong the
  other way ships a baked-in defect.
- **4 of the 9 unaudited transform rows block the cutover, and they
  carry the least confidence**, having no recorded derivation behind
  their counts. Recomputed 2026-08-25 rather than typed — the figure
  here read 8 until this review, a Phase-1 snapshot that three route
  changes had left behind:

  ```bash
  bun -e 'import {parsePatterns} from "./admin/pipeline/research/patterns.ts";
  const t=(await parsePatterns(await Bun.file("data/patches/patterns.jsonl").text()))
    .filter(r=>r.route==="transform"&&r.status==="candidate"&&r.reason===undefined);
  console.log("unaudited transform:",t.length,"| blocking:",t.filter(r=>r.blocking===true).length);'
  ```

## Still open, not part of Phase 2

1. **The 30 round-3 patches** are validated but not applied; they need
   ingesting through the normal apply path.
2. **`vocalized-twin-ignored` (34)** is unruled. Non-blocking, and it
   shrank on inspection: the raw 88 is 67% artefact, leaving 29 instances
   from **11 lemma pairs** — `בּוֹר`→`בּוּר` alone is 8 and is a confirmed
   mislink. It is 11 dictionary questions, not a review queue.
3. **`italic-swallowed-terminal-period` must lose its 123 misfiled label
   occurrences** before transform, or the house-style ruling moves them
   the wrong way.
4. **Round 5** would clear the saturation gate only if it adds nothing.
   Rounds 3 and 4 both found re-measurement worth more than discovery.
5. **The repair/transform overlap sweep** — recipe, runnable probe and
   pinned output in `docs/v2/transform-batch-3a.md` §9.2, parked for
   **CP-2**. Run each rule on the pristine entry and on
   `applyRepairs(entry).entry`, and assert that the set of rules whose
   record count differs equals a checked-in allowlist (today one row:
   `bare-rtl-hebrew` on N00327). Two caveats travel with it. It is a
   **detector, not a declaration** — nothing in the repo yet says that a
   repair and a transform own the same defect, and a repair and a rule
   that quietly agree on the same bytes without moving a record count
   still slip past it. And it covers only what the registry holds when
   it runs — **15 of the 77 catalogued transform rows** today, 62
   pending:

   ```bash
   bun transform:count | grep 'rule(s)'
   bun -e '
   const {parsePatterns}=await import("./admin/pipeline/research/patterns.ts");
   const {coverage}=await import("./admin/pipeline/transform/registry.ts");
   const r=coverage(parsePatterns(await Bun.file("data/patches/patterns.jsonl").text()));
   console.log({total:r.total, registered:r.registered, pending:r.pending});'
   ```

   ```
   15 rule(s), 2 mismatch(es).
   {
     total: 77,
     registered: 15,
     pending: 62,
   }
   ```
