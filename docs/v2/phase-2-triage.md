# Phase 2 worklist — the catalogue, routed

**Status: triaged 2026-08-21; totals recomputed from the catalogue
2026-08-26 after transform batch 4, again 2026-08-29 after batch 7, and
again 2026-09-01 after batches 9 and 10.** All 131 candidate rows
routed.
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
| Catalogue | `data/patches/patterns.jsonl` — 153 rows, 131 candidate (22 discarded) |
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
| **transform** | **54** | **15,512** | deterministic code + tests |
| judgment | 72 | 20,840 | per-entry reading (Opus pass or maintainer) |
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
- Batch 3b moved FOUR more out — `citation-quote-seam-period` (43),
  `orphan-gloss-seam-period` (19), `gloss-head-seam-period-doubling`
  (15) and `entry-final-comma` (10), transform → judgment, working in
  `data/patches/catalogue-audit/batch-3b-withdrawals.md`. It shipped
  twelve rules and corrected SEVEN counts, four of them downward and
  two of them twice: `italic-swallowed-terminal-period` 1,098 → 1,567,
  `label-period-outside-italic` 945 → 979, `anchor-italic-no-space`
  111 → 56, `paren-tag-no-space` 126 → 115 (OCCURRENCES),
  `italic-lone-punctuation` 29 → 28, `geresh-abbrev-space-loss`
  22 → 23, `italic-swallows-close-paren` 10 → 8.
  `anchor-italic-no-space`'s catalogued 111 was counting 53 seams
  that `paren-tag-no-space` was also counting — the first
  measured instance of two rows owning one population — and both were
  corrected a second time when the composed run found them
  manufacturing a rendered defect on 13 entries. See
  [transform-batch-3b.md](transform-batch-3b.md).
- Batch 4 moved one row out and added one that was never a transform:
  `post-anchor-numeral-duplication` (11) went transform → judgment —
  the direction of the duplication is now settled (681 attestations
  against 1, and 2 of the 11 prove the display numeral is print text)
  but no candidate MECHANISM survives its own members, and a transform
  must know why it is deleting — while
  `superscript-subsection-contradicts-link-sub-section` (33) was split
  off `superscript-subsection-stranded-outside-anchor` as `judgment`
  from birth, so it never entered the transform total. Both audits are
  under `data/patches/catalogue-audit/`. The batch also corrected two
  counts: `anchor-swallows-close-paren` 494 → 493 and
  `tosefta-variant-chapter-halakha-loss` 388 → 391. Ruled over TEN
  rows, it shipped SIX rules and touched ELEVEN (the ten plus the new
  judgment row), disposing of NINE: six registered, one
  (`jt-double-wrapped-citation`) repaired in full by another row's rule
  and recorded in `registry.ts`'s `COVERED` rather than given one of
  its own, one withdrawn, one born `judgment`. The two left —
  `tosefta-variant-chapter-halakha-loss` and
  `unterminated-href-swallows-closing-tag` — are blocked on one
  `link-target.ts` ruling, not on a missing predicate. See
  [transform-batch-4.md](transform-batch-4.md).
- Batch 5 moved one out: `abbrev-headword-stub` (34), transform →
  judgment, on the audit at
  `data/patches/catalogue-audit/abbrev-headword-stub.md` — an expansion
  source exists for 4 of its 34 members (11.8%) against the 65.5% that
  withdrew the parent row it was modelled on. Four rules shipped over
  five ruled rows, 914 instances repaired; every one of the batch's
  five counts reproduced on first measurement, a first for this
  programme. See [transform-batch-5.md](transform-batch-5.md).
- Batch 6a DISCARDED two — `binyan-form-leading-space` (523 occ / 457
  ent) and `binyan-form-empty-slot` (486 slots / 446 ent), 71 → 69 rows
  and −903 instances. Not withdrawn to `judgment` for want of a
  mechanism: `repairs.ts:445 cleanBinyanForms` already trims both edges
  and drops empty slots corpus-wide inside `applyRepairs`, upstream of
  every transform, so both populations measure 523 → 0 and 486 → 0
  across the 32,512 entries. A rule for either would have repaired
  nothing while its row claimed hundreds. Working in
  `data/patches/catalogue-audit/binyan-form-cleanup.md`, gated by
  `admin/pipeline/body/binyan-cleanup.corpus.test.ts`. See
  [transform-batch-6a.md](transform-batch-6a.md).
- Batch 6b wired the `structural-repairs` phase, which had run empty
  since Phase 1, and added the fourth gate — `no-lost-text.ts`, which
  sees what the other three cannot: a deletion. Two rules shipped, one
  per phase. The two rules moved no complete row out of `transform`
  but SPLIT two:
  `asterisk-stem-label` re-scoped 69 → 3 with its other 66 becoming
  `stem-label-not-a-binyan-name` (judgment), and
  `stem-head-marker-chop`'s ten residue-bearing members becoming
  `chopped-marker-with-residue` (judgment). Both splits obey one rule —
  `coverage()` reads a row as registered the moment any rule claims its
  id, so a partial rule must not take its row's remainder off the
  queue. `empty-stem-section` (347 sections / 342 entries) gained the
  audit it never had and then LEFT the queue on Brian's ruling — the
  first row to go on a data-versus-display distinction rather than on
  inference, destination or there being no defect. Nothing is missing
  from it; what remains is a Phase 4 rendering item, showing
  consecutive senseless stem blocks as one run. See
  [transform-batch-6b.md](transform-batch-6b.md).
- Batch 6c shipped `stranded-stem-head`, the second `structural-repairs`
  rule and the first to MINT a grammar block — the label moves into
  `grammar.verbal_stem`, the rest of the definition into a child sense,
  because `buildStem` reads `sense.senses` and drops `sense.definition`
  entirely. The row was catalogued at 544 with NO PREDICATE RECORDED
  ANYWHERE; the rule states one, and the count lands in three places
  depending on where you stand: 296 alone on raw source (what
  `transform:count` reads and what `corpusCount` now holds), 561
  occurrences / 555 entries for the predicate after the whole
  `text-repairs` pass, and 436 repaired. The gap between the first two
  is ONE upstream rule — `label-period-outside-italic` takes the
  population 360 → 562 in a single step — which is 6a's lesson running
  the other way. 100 of the refusals became
  `stem-head-in-child-sense` (judgment): `buildTrace` tests `.grammar`
  on top-level senses only, and 0 entries in the corpus carry one below
  top level. The batch also found the commutation gate PHASE-BLIND —
  cross-phase pairs have one order, not two, and are now skipped and
  counted rather than read as undeclared entanglements. See
  [transform-batch-6c.md](transform-batch-6c.md).
- Batch 7 took the table 68 → **66** and is the first batch where the
  finding was the CATALOGUE rather than the corpus. Three of its eight
  rows describe `content.senses[0]`, and index 0 is not a sense:
  `rejoin.ts:44` folds its definition into the gloss head and
  `dry-run.ts:257` skips it in the sense loop. `empty-lead-sense` (84)
  and `bracketed-gloss-lead-sense` (49) both moved transform →
  judgment on that, the first because its presumed repair CONSUMES a
  sense in 72 of 73 entries. `sense-number-outside-closed-grammar` was
  re-scoped 111 → **6** — 107 of its tokens were never outside the
  grammar and 6 are repaired by `applyRepairs` — and
  `adjacent-verbatim-repetition` corrected 59 → **65**, where the
  agreement at 59 was two length caps matching rather than two
  measurements. Five rules shipped (`trailing-em-dash-tail` 101,
  `duplicated-definition-opening-run` 89, `adjacent-verbatim-repetition`
  65, `section-break-terminator-loss` 11 — the only rule in the
  registry that MINTS a byte, `allows: ['.']` — and
  `continuation-marker-em-dash-loss` 14, which declares its em dash as
  `copied` from a sibling marker so the gate verifies it against the
  entry rather than taking a maintainer's word). The commutation gate
  found an entanglement edge THE CATALOGUE HAD NEVER HELD — `stranded-stem-head` exposes a duplicate by moving a
  label out of `senses[0]`, so the opening rule repairs 88 alone and 89
  composed. See [transform-batch-7.md](transform-batch-7.md).

**37.6% of the backlog is deterministic code** (15,512 of 41,299
instances), 41.2% of it by row. **That share has FALLEN** — it read
47.8% by instance after batch 8 — and not because anything was
repaired: batch 9 moved seven rows and 4,214 instances onto the
judgment route without touching a byte of the corpus. The
deterministic half was partly a routing guess, and working the rows is
what tested it.

**Batch 8 moved five rows at once — the largest single drop until
batch 9 took seven — and it also cleared the last BLOCKING row from
the transform queue.** Every
row still marked `blocking` on that route now has a rule; the 12 then
pending were all non-blocking. Two of the five were discarded
because something upstream already owns them — `plural_form` is not a
v2 field and `rejoinGlossHead` heals the `b. h.` straddle by
construction — and three were withdrawn to `judgment`, one for having
no defect left to name, one for a falsified mechanism, and one because
its repair would dangle 37 live anchors that the counterpart row, on
the `judgment` route, will never retarget. See
[transform-batch-8.md](transform-batch-8.md).

**Batch 9 withdrew SEVEN rows and shipped one rule — the largest single
drop the programme has recorded**, past batch 8's five, and the first
batch whose finding was that a whole family belongs to a later phase.
`coverage().total` **61 → 54**. The seven moved transform → judgment
intact, carrying 4,214 instances with them:
`tanhuma-never-linked` (1,137), `mekhilta-sifra-never-linked` (923),
`unlinked-v-span` (796), `pesikta-drk-never-linked` (695),
`targum-sheni-never-linked` (362), `midrash-petichta-unanchored` (279)
and `containment-fallback-mislink` (22). One sentence disposes of all
seven: **the transform route can repair a wrong anchor but cannot build
a right one**, because minting one needs an address space this corpus
does not hold — across 170,184 anchors and 23,211 distinct work names,
Tanhuma **0**, Sifra **0**, Pesikta d'Rav Kahana **0**, Targum Sheni
**0**, Mekhilta **1**. Only `v-sub-redirect-stub-mislink` (161)
survived, on the 50 targets a spelling-twin test determines uniquely,
behind a new `link-target.ts` case 8 — the first gate case to admit
evidence from outside the entry. The batch also took the LAST TWO
unaudited rows off this route, which is why the `⚠ unaudited` column
below is now empty. See [transform-batch-9.md](transform-batch-9.md).

**Batch 10 shipped the four Hebrew-orthography rows and emptied
`PENDING`.** `RULES` **53**, `coverage()` **54** total / **54**
registered / **0** pending, 0 unaccounted, 0 duplicated — every
catalogued transform row now has a registered rule, and the queue this
phase opened with is closed. Its finding is that two of the four repair
the INSIDE of a link target and the corruption is self-consistent on
both sides: of the 218 anchors whose `data-ref` carries a migrated
holam, **218 point at a headword carrying the same defect**, so
repairing either side alone breaks all 218 and no link-integrity check
can see it either before or after. That took a `link-target.ts`
case 9. Three of the rules decline part of their own population rather
than infer a spelling — 50 of 102 for `shin-sin-dot-drop`, 6 for
`impossible-dagesh`, 1 for `holam-migrated-off-mater-vav` — and that
remainder is recorded in the batch report rather than in `PENDING`,
because a row named in both `RULES` and `PENDING` reads as
`duplicated`. See [transform-batch-10.md](transform-batch-10.md).

The instance total is now FALLING, and both directions have the same
cause: a row's count is a claim nobody has checked until someone works
it. Batch 3b corrected seven counts upward — `italic-swallowed-terminal-period`
alone went 1,098 → 1,567 when its rule was written — and batch 6a took
903 instances out at a stroke by measuring two rows' populations *after*
`applyRepairs` instead of on raw source.

Cutover gate, cross-cut — re-derived after batch 10 and **unchanged
since batch 8**, because batches 9 and 10 moved rows between routes
without changing any row's `blocking` flag:

| | Rows | Instances |
|---|---:|---:|
| Blocks the v2 cutover | 55 | 13,992 |
| Launch need not wait | 76 | 27,307 |

## The transform queue — all 54 rows, largest first

`⚠ unaudited` marks a row with no `reason` recorded: its count has never
been derived. That is not a reason to skip it — for a transform row,
**writing the transform is the audit**, because a deterministic rule
either reproduces the count or does not. **The column is currently
empty**: batch 9 withdrew the last two unaudited rows,
`unlinked-v-span` and `targum-sheni-never-linked`, to `judgment`.

Heading and table are GENERATED from `patterns.jsonl`, never typed.
Regenerate both with:

```bash
bun -e 'import {parsePatterns} from "./admin/pipeline/research/patterns.ts";
const n=(x)=>x.toLocaleString("en-US");
const rows=parsePatterns(await Bun.file("data/patches/patterns.jsonl").text())
  .filter(r=>r.route==="transform"&&r.status==="candidate")
  .toSorted((a,b)=>b.corpusCount-a.corpusCount||a.id.localeCompare(b.id));
const sum=rows.reduce((a,b)=>a+b.corpusCount,0);
console.log(`heading: all ${rows.length} rows / ${n(sum)} instances`);
console.log("| Row | Instances | Blocks cutover | Audit |");
console.log("|---|---:|---|---|");
for (const r of rows) console.log(`| \`${r.id}\` | ${n(r.corpusCount)} | ${r.blocking===true?"**yes**":"no"} | ${r.reason===undefined?"⚠ unaudited":"—"} |`);'
```

| Row | Instances | Blocks cutover | Audit |
|---|---:|---|---|
| `bare-rtl-hebrew` | 4,189 | **yes** | — |
| `italic-swallowed-terminal-period` | 1,567 | no | — |
| `ascii-quote-as-gershayim-in-body` | 1,386 | no | — |
| `label-period-outside-italic` | 979 | no | — |
| `nonsense-dup-anchor` | 755 | **yes** | — |
| `parenthesized-alt-headword` | 580 | **yes** | — |
| `redundant-outer-rtl-span` | 529 | no | — |
| `anchor-swallows-close-paren` | 493 | no | — |
| `geresh-letter-numeral-mislink` | 475 | no | — |
| `nested-anchor-swallows-punctuation` | 465 | **yes** | — |
| `tosefta-variant-chapter-halakha-loss` | 391 | no | — |
| `ib-yoma-2a` | 312 | no | — |
| `holam-migrated-off-mater-vav` | 308 | no | — |
| `emphasis-run-edge-space` | 304 | no | — |
| `stranded-stem-head` | 296 | **yes** | — |
| `em-dash-section-break-in-own-italic` | 270 | no | — |
| `phrase-alt-headword-stub` | 236 | **yes** | — |
| `open-paren-in-anchor-display` | 214 | **yes** | — |
| `prefixed-geresh-abbrev-mislink` | 173 | no | — |
| `v-sub-redirect-stub-mislink` | 161 | no | — |
| `superscript-subsection-stranded-outside-anchor` | 160 | **yes** | — |
| `latin-token-inside-rtl-span` | 130 | **yes** | — |
| `trailing-em-dash-tail` | 130 | **yes** | — |
| `paren-tag-no-space` | 115 | no | — |
| `italic-close-paren-nospace` | 95 | no | — |
| `duplicated-definition-opening-run` | 85 | **yes** | — |
| `gershayim-breaks-ref-attribute` | 85 | **yes** | — |
| `ellipsis-fragment-anchored` | 80 | no | — |
| `shin-sin-dot-drop` | 77 | no | — |
| `adjacent-verbatim-repetition` | 65 | **yes** | — |
| `anchor-italic-no-space` | 56 | no | — |
| `plural-to-feminine-final-letter-mislink` | 50 | no | — |
| `rabbi-name-linked-as-bible-book` | 42 | no | — |
| `italic-lone-punctuation` | 28 | no | — |
| `geresh-abbrev-space-loss` | 23 | no | — |
| `continuation-marker-em-dash-loss` | 22 | **yes** | — |
| `gender-pair-headword-line-collapse` | 22 | **yes** | — |
| `stem-head-marker-chop` | 18 | **yes** | — |
| `impossible-dagesh` | 17 | no | — |
| `translit-italic-space-loss` | 15 | no | — |
| `citation-number-truncated-outside-anchor` | 14 | **yes** | — |
| `shuruk-as-yod-display-corruption` | 12 | no | — |
| `section-break-terminator-loss` | 11 | **yes** | — |
| `vkh-geresh-loss` | 11 | no | — |
| `jt-double-wrapped-citation` | 10 | **yes** | — |
| `trailing-whitespace-definition` | 10 | no | — |
| `apparatus-cite-linked-as-scripture` | 8 | no | — |
| `ib-targum-work-loss` | 8 | no | — |
| `italic-swallows-close-paren` | 8 | no | — |
| `abbrev-fused-headword` | 7 | **yes** | — |
| `sifre-ib-resolves-to-yalkut` | 6 | no | — |
| `see-particle-lost` | 4 | **yes** | — |
| `asterisk-stem-label` | 3 | **yes** | — |
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
   ([transform-batch-2.md](transform-batch-2.md)). **Closed by batch
   10.** 31 such rows sit on the route today (8,009 instances) and
   every one of them is shipped — `PENDING` is empty. There are no
   cheap wins left to take here, only the remainder inside rules that
   already ship, recorded in
   [transform-batch-10.md](transform-batch-10.md) §8.
3. **Respect `entangledWith`.** Four pairs must be fixed in one edit or
   they rewrite the same records twice. `checkEntanglement()` keeps the
   graph honest; the pairs are derived in the round-4 report. Batch 2
   shipped one of them, the geresh pair; batch 3a shipped the gershayim
   pair, recording the edge in `patterns.jsonl` *before* registering the
   rules. `registry.order.corpus.test.ts` now asserts cluster contiguity
   against the live graph rather than against a list.

   **Open, and it is catalogue work rather than transform work:** the
   adjacency gate reads `entangledWith` and nothing else, so a row
   carrying no edge is a singleton it cannot judge. **`PENDING` is now
   empty, so this query returns 0 of 0** (it read "35 of the 38" after
   batch 4, "56 of the 62" at batch 2's close, and 42 of 46 earlier the
   same day). **That retires the query, not the concern.** For the whole
   time the queue held rows the gate was unfalsifiable by construction
   over most of it — a clean run meant "no RECORDED entanglement is
   split", never "no entanglement is split" — and every rule now
   registered was admitted under that reading. Reproduce:

   ```bash
   bun -e 'import {parsePatterns} from "./admin/pipeline/research/patterns.ts";
   import {PENDING} from "./admin/pipeline/transform/registry.ts";
   const rows=await parsePatterns(await Bun.file("data/patches/patterns.jsonl").text());
   const by=new Map(rows.map(r=>[r.id,r]));
   const noEdge=[...PENDING].filter(id=>(by.get(id)?.entangledWith??[]).length===0);
   console.log("PENDING:",PENDING.length,"| no edge:",noEdge.length);'
   ```
4. **0 transform rows are unaudited**, 0 of them blocking (measured
   2026-09-01 after batch 10; this read "3 … 1 of them blocking" after
   batch 6b, "4 … 2" after 6a, "5 … 3" after batch 4, and "9 … 4"
   before it).
   **CORRECTED 2026-08-26 (impl/phase-2-batch-4): this cited "the query
   above",** which is the `entangledWith` no-edge query in item 3 and
   measures nothing about auditing. `⚠ unaudited` is a row with no
   `reason` recorded (see the queue heading above), so the query is:

   ```bash
   bun -e 'import {parsePatterns} from "./admin/pipeline/research/patterns.ts";
   const t=parsePatterns(await Bun.file("data/patches/patterns.jsonl").text())
     .filter(r=>r.route==="transform"&&r.status==="candidate"&&r.reason===undefined);
   console.log("unaudited transform:",t.length,"| blocking:",t.filter(r=>r.blocking===true).length);'
   ```

   The last three were `unlinked-v-span` and
   `targum-sheni-never-linked` (non-blocking), both withdrawn to
   `judgment` in batch 9, and `b-h-split-across-field-boundary`
   (blocking), discarded in batch 8.
   `empty-stem-section` left the list in batch 6b, which derived its
   audit and recommended withdrawal.
   `parenthesized-alt-headword` left the list in batch 5, which wrote
   its rule and its `reason` together. Rows kept reclassifying on
   contact to the end — the routing is a reading of each row, not a
   measurement, and the route gave ground in every late batch: 68 → 66
   in batch 7, → 61 in batch 8 (three withdrawn, two discarded), → 54
   in batch 9.

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

## Judgment queue — 72 rows / 20,840 instances

(Heading CORRECTED 2026-08-29 from "49 rows / 15,754", again in batch 8
from "60 rows / 16,437", and again after batch 9, which moved seven rows
and 4,214 instances onto this route in one go: 65 / 16,626 → 72 /
20,840. **That first correction's claim that "the table below was
current" was itself false** — the table held 50 rows against a heading
that said 60. Both the heading and the table are now generated from
`patterns.jsonl` rather than edited, which is why they agree: a
hand-maintained list of 72 rows goes stale the first time a batch moves
one, and this one had gone stale twice without anyone noticing that the
fix for the heading left the table wrong.)

**The newest members are batch 9's seven** — the whole citation-linking
family, 4,214 instances, every one of them non-blocking, withdrawn
because minting an anchor needs a work-name table that lives outside
this corpus. See [transform-batch-9.md](transform-batch-9.md).

`homograph-numeral-mismatch` (538) and `h-cognate-self-link` (85) were
the next two after `abbrev-in-alt-headwords`, reclassified out of the
transform queue in batch 2 on 2026-08-23 and 2026-08-24. Each failed a
DIFFERENT test:
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

**31 of these block the cutover (6,400 instances)** — unchanged by
batch 9, whose seven are all non-blocking. Batch 8 moved three rows onto
this route, `homograph-roman-stranded-in-definition`,
`reversed-hebrew-phrase` and `sense-number-outside-closed-grammar`, all
of them blocking. Five rows are 77% of that, and four of the five fall
into two families — paren/bracket integrity
(`unmatched-closing-paren` 1,604, `unmatched-opening-paren` 452) and
lead-sense structure (`etymology-head-pseudo-sense` 1,553,
`preamble-stranded-lead-sense` 676); the fifth,
`citation-tail-truncation` (657), is neither. Scope the four as one
pass rather than four:

| Row | Instances |
|---|---:|
| `unmatched-closing-paren` | 1,604 |
| `etymology-head-pseudo-sense` | 1,553 |
| `preamble-stranded-lead-sense` | 676 |
| `citation-tail-truncation` | 657 |
| `unmatched-opening-paren` | 452 |

Full judgment list, blocking first. Heading and table are GENERATED
from `patterns.jsonl`, never typed; regenerate both with:

```bash
bun -e 'import {parsePatterns} from "./admin/pipeline/research/patterns.ts";
const n=(x)=>x.toLocaleString("en-US");
const rows=parsePatterns(await Bun.file("data/patches/patterns.jsonl").text())
  .filter(r=>r.route==="judgment"&&r.status==="candidate")
  .toSorted((a,b)=>Number(b.blocking===true)-Number(a.blocking===true)||b.corpusCount-a.corpusCount||a.id.localeCompare(b.id));
const sum=rows.reduce((a,b)=>a+b.corpusCount,0);
console.log(`heading: ${rows.length} rows / ${n(sum)} instances`);
console.log("| Row | Instances | Blocks cutover |");
console.log("|---|---:|---|");
for (const r of rows) console.log(`| \`${r.id}\` | ${n(r.corpusCount)} | ${r.blocking===true?"**yes**":"no"} |`);'
```

| Row | Instances | Blocks cutover |
|---|---:|---|
| `unmatched-closing-paren` | 1,604 | **yes** |
| `etymology-head-pseudo-sense` | 1,553 | **yes** |
| `preamble-stranded-lead-sense` | 676 | **yes** |
| `citation-tail-truncation` | 657 | **yes** |
| `unmatched-opening-paren` | 452 | **yes** |
| `empty-stem-section` | 342 | **yes** |
| `common-gender-inexpressible` | 228 | **yes** |
| `unnumbered-terminal-homograph` | 129 | **yes** |
| `doubled-space-as-text-loss-locator` | 108 | **yes** |
| `stem-head-in-child-sense` | 100 | **yes** |
| `stranded-open-bracket` | 85 | **yes** |
| `bracket-paren-mismatch` | 67 | **yes** |
| `stem-label-not-a-binyan-name` | 66 | **yes** |
| `gloss-space-loss` | 45 | **yes** |
| `self-numbered-intext-marker` | 35 | **yes** |
| `superscript-subsection-contradicts-link-sub-section` | 33 | **yes** |
| `lost-h-equivalent` | 32 | **yes** |
| `reversed-hebrew-phrase` | 27 | **yes** |
| `truncated-read-stub` | 26 | **yes** |
| `homograph-roman-stranded-in-definition` | 23 | **yes** |
| `unclosed-editorial-bracket` | 18 | **yes** |
| `dangling-denom-tail` | 17 | **yes** |
| `lost-hebrew-after-h-marker` | 13 | **yes** |
| `verse-paren-false-sense-split` | 13 | **yes** |
| `inline-inflection-sublist` | 12 | **yes** |
| `chopped-marker-with-residue` | 10 | **yes** |
| `continuation-marker-fully-absent` | 9 | **yes** |
| `contentless-entry` | 6 | **yes** |
| `sense-number-outside-closed-grammar` | 6 | **yes** |
| `first-sense-debris-stranding-language-label` | 5 | **yes** |
| `inflection-sublist-numbering-flattened` | 3 | **yes** |
| `abbrev-in-alt-headwords` | 2,035 | no |
| `homograph-numeral-blind-default` | 1,358 | no |
| `homograph-collapse-link` | 1,253 | no |
| `tanhuma-never-linked` | 1,137 | no |
| `skeleton-escape-orphan` | 1,065 | no |
| `geresh-abbrev-fixed-sink` | 970 | no |
| `mekhilta-sifra-never-linked` | 923 | no |
| `unlinked-v-span` | 796 | no |
| `corrigendum-reading-linked` | 771 | no |
| `pesikta-drk-never-linked` | 695 | no |
| `homograph-numeral-mismatch` | 538 | no |
| `unlinked-stub-nonexistent-target` | 451 | no |
| `targum-sheni-never-linked` | 362 | no |
| `midrash-petichta-unanchored` | 279 | no |
| `midrash-section-cite-as-bible-chapter` | 255 | no |
| `homograph-numbering-schism` | 186 | no |
| `midrash-subsection-link-drift` | 179 | no |
| `binyan-head-form-mislinked` | 127 | no |
| `neighbor-rid-mislink` | 109 | no |
| `post-anchor-numeral-mismatch` | 91 | no |
| `h-cognate-self-link` | 85 | no |
| `empty-lead-sense` | 84 | no |
| `initial-niqqud-drop` | 76 | no |
| `multiword-abbrev-mislink` | 62 | no |
| `stacked-impossible-niqqud` | 61 | no |
| `guttural-initial-simple-sheva` | 55 | no |
| `bracketed-gloss-lead-sense` | 49 | no |
| `midrash-tehillim-wrong-psalm` | 49 | no |
| `inflection-abbrev-mislink` | 46 | no |
| `citation-quote-seam-period` | 43 | no |
| `targum-cite-to-plain-bible` | 43 | no |
| `abbrev-headword-stub` | 34 | no |
| `vocalized-twin-ignored` | 34 | no |
| `latin-prose-ocr-substitution` | 28 | no |
| `containment-fallback-mislink` | 22 | no |
| `orphan-gloss-seam-period` | 19 | no |
| `spurious-name-period` | 19 | no |
| `alt-headword-collision` | 15 | no |
| `gloss-head-seam-period-doubling` | 15 | no |
| `post-anchor-numeral-duplication` | 11 | no |
| `entry-final-comma` | 10 | no |

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
- **There are no unaudited transform rows left.** The last two carried
  the least confidence in the catalogue, having no recorded derivation
  behind their counts — `unlinked-v-span` (796) and
  `targum-sheni-never-linked` (362) — and batch 9 withdrew both to
  `judgment`, neither having been on the critical path. The query
  returns 0 and 0. Recomputed rather than typed:

  > **CORRECTED 2026-09-01 (batch 10)** from *"0 of the 2 … block"*.
  > Batch 9 withdrew both rows to `judgment`, so the population is empty
  > and the line above now states the emptiness rather than a count.
  > **That is the fifth correction to this line, and it is the one the
  > note below predicted.**
  >
  > **CORRECTED 2026-08-30 (batch 8)** from *"1 of the 3 … blocks"*.
  > `b-h-split-across-field-boundary` was the third, and the blocking
  > one; batch 8 discarded it, so the count falls to 2 and the blocking
  > count to 0.
  >
  > That correction is itself the fourth on this line — 2026-08-28 read
  > *"3 of the 5"*, a 2026-08-26 correction of *"4 of the 9"*, which had
  > replaced a Phase-1 "8" that three route changes left behind. **The
  > reason this line keeps needing correcting is that it is typed rather
  > than generated**, which is exactly why batch 8 switched the two
  > queue tables above to being generated from `patterns.jsonl`. This
  > sentence is the last hand-maintained tally in the document, and it
  > should go the same way the next time it is wrong.

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
   it runs — **all 54 of the catalogued transform rows** today, 0
   pending, where at batch 3a it covered 15 of 77:

   ```bash
   bun transform:count | grep 'rule(s)'
   bun -e '
   const {parsePatterns}=await import("./admin/pipeline/research/patterns.ts");
   const {coverage}=await import("./admin/pipeline/transform/registry.ts");
   const r=coverage(parsePatterns(await Bun.file("data/patches/patterns.jsonl").text()));
   console.log({total:r.total, registered:r.registered, pending:r.pending});'
   ```

   ```text
   53 rule(s), 12 mismatch(es).
   {
     total: 54,
     registered: 54,
     pending: 0,
   }
   ```

   `registered` is 54 ROWS against 53 RULES because
   `jt-double-wrapped-citation` sits in `COVERED` rather than owning a
   rule of its own. The mismatch count is a FINDING and not a
   regression — `transform:count` says so itself — but it has grown
   2 → 12 as the registry filled, and nothing in this document tracks
   it. It is the next tally that should be generated rather than
   pinned.
