# Transform batch 2 — links & citations

**Closed 2026-08-24** on `impl/phase-2-batch-2`. Design:
[2026-08-22-link-transform-design.md](../specs/2026-08-22-link-transform-design.md).
Module contract: [2026-08-22-transform-module-design.md](../specs/2026-08-22-transform-module-design.md).

**Ten rows, 1,166 catalogued instances, 1,131 occurrences repaired**
across 1,045 records and 1,006 entries — against twelve rows / 1,794
planned. Two rows withdrew to `judgment` on audit. Six rows repair by
UNLINK, three by retarget, one by a display-text edit; **the batch
creates no links**, which is enforced in code rather than left to rule
authors.

The registry now holds thirteen rules. `coverage()` accounts for all 78
catalogued transform rows: 13 registered, 65 pending, 0 unaccounted, 0
duplicated.

---

## 1. What shipped

| Row | Repair | Occ | Entries | vs catalogue |
|---|---|---:|---:|---|
| `geresh-letter-numeral-mislink` | unlink | 517 | 475 | MATCH (475) |
| `ib-yoma-2a` | retarget, gate case 2 | 209 | 188 | population 312 occ, 103 declines |
| `prefixed-geresh-abbrev-mislink` | unlink | 185 | 173 | MATCH (173) |
| `ellipsis-fragment-anchored` | unlink | 88 | 80 | MATCH (80) |
| `plural-to-feminine-final-letter-mislink` | unlink | 60 | 50 | **57 → 50** |
| `rabbi-name-linked-as-bible-book` | unlink | 42 | 42 | **41 → 42** |
| `shuruk-as-yod-display-corruption` | display text | 12 | 12 | MATCH (12) |
| `ib-targum-work-loss` | retarget, gate case 4 | 9 | 8 | MATCH (8) |
| `apparatus-cite-linked-as-scripture` | unlink | 8 | 8 | MATCH (8) |
| `sifre-ib-resolves-to-yalkut` | retarget, gate case 3 | 1 | 1 | population **5 → 6**, 5 declines |
| **total** | | **1,131** | **1,006 distinct** | |

Four rule modules hold the ten rows: `rules/unlink.ts` (3),
`rules/geresh.ts` (2), `rules/misc-links.ts` (2) and the new
`rules/anaphora.ts` (3). The gate gained a fourth case; the registry
gained an order test and the shared unlink walk gained a scope test,
both new in the closing task.

**Gate case 4, recombination** (ruling 2026-08-23, tightened
2026-08-24). `ib-targum-work-loss` joins the antecedent Targum anchor's
WORK to the anaphor's own already-correct verse. Cases 1-3 can license
none of its nine occurrences, and the limit is general rather than
incidental: case 3's remainder must occur in the anchor's DISPLAY, and
Jastrow writes `Deut. VI, 22` where Sefaria writes `6:22`, so **no
Jastrow→Sefaria locus can ever clear case 3**. Case 4 takes its
evidence from a second input target instead. The tightening — the
discarded tail prefix must itself be a prefix of the head, and head ≠
tail — was added after four probes against the first cut all came back
clean, and both constraints are load-bearing.

## 2. What withdrew

Two rows, each with a published audit under
`data/patches/catalogue-audit/`, each failing a **different** test.

| Row | Inst. | Failed on |
|---|---:|---|
| `homograph-numeral-mismatch` | 538 | the DESTINATION |
| `h-cognate-self-link` | 85 | there being no defect |

- **`h-cognate-self-link`** passes §5.2's inference test — an unlink
  infers nothing — and fails a different one. **No other article exists
  for any of its 87 anchors** (0 of 87 match a corpus headword at exact
  pointing with the homograph marker stripped), so the link is not
  being withheld from anywhere and the row's own description ("a no-op
  link that promises a different article") is false: the anchor
  promises the SAME article. The same linker behaviour produces 2,657
  further self-links in definitions; this row is 3.2% of a corpus-wide
  habit carved out by a field boundary. What remains is a
  PRESENTATION question over all 2,744 — should an anchor targeting its
  own entry render inert? — which is one reversible change in the view
  layer, not 2,744 irreversible deletions in the data.
- **`homograph-numeral-mismatch`** has a real defect and no nameable
  destination. The row is three defects merged (roman 195/187,
  superscript-target 277/262, bare-target 104/96), the DISPLAY is the
  authoritative side (a stratified hand-read of 40 found 26 defects
  where the display is right and **0 where it is wrong** — it is
  Jastrow's print numbering), and no rule can say where the link should
  go: 40.1% of the 576 occurrences already point where print says, the
  only destination model available scores 87.5% against 3,253
  KNOWN-CORRECT controls, and gate case 2 reaches the replacement for
  3.5% of the candidate defects. **So batch 3 does not own it either** —
  it is not a display fix.

Batch 1 withdrew one row of four for the same reason
(`abbrev-in-alt-headwords`, spec §5.2). The mechanism is the point: a
route label is a reading of a row, and writing the transform is the
first thing that tests it.

## 3. Isolated versus composed

Every registered rule, in registry order, over all 32,512 entries.
**0 gate throws.** The composed column is the same walk `migrate-dry`
performs; the isolated column runs each rule alone against the same
pristine entry, gates on, which is what `bun transform:count` measures
(as ENTRIES).

```bash
bun -e '
import { readSourceEntries } from "./admin/pipeline/body/source.ts";
import { RULES } from "./admin/pipeline/transform/registry.ts";
import { applyTransforms } from "./admin/pipeline/transform/run.ts";
const iso = new Map(), cmp = new Map();
let entries = 0;
for await (const e of readSourceEntries()) {
  entries++;
  for (const r of applyTransforms(e, "text-repairs", RULES).records)
    cmp.set(r.ruleId, (cmp.get(r.ruleId) ?? 0) + 1);
  for (const rule of RULES)
    for (const r of applyTransforms(e, "text-repairs", [rule]).records)
      iso.set(r.ruleId, (iso.get(r.ruleId) ?? 0) + 1);
}
console.log({ entries, iso: [...iso].sort(), cmp: [...cmp].sort() });'
```

| Rule | Isolated (records) | Composed (records) | Why they differ |
|---|---:|---:|---|
| `redundant-outer-rtl-span` | 531 | 531 | — |
| **`bare-rtl-hebrew`** | **4,471** | **4,517** | **+46.** See below. |
| `latin-token-inside-rtl-span` | 131 | 131 | — |
| `apparatus-cite-linked-as-scripture` | 8 | 8 | — |
| `rabbi-name-linked-as-bible-book` | 42 | 42 | — |
| `ellipsis-fragment-anchored` | 80 | 80 | — |
| `geresh-letter-numeral-mislink` | 481 | 481 | — |
| `prefixed-geresh-abbrev-mislink` | 174 | 174 | — |
| `plural-to-feminine-final-letter-mislink` | 50 | 50 | — |
| `shuruk-as-yod-display-corruption` | 12 | 12 | — |
| `ib-yoma-2a` | 189 | 189 | — |
| `sifre-ib-resolves-to-yalkut` | 1 | 1 | — |
| `ib-targum-work-loss` | 8 | 8 | — |

**One difference in the whole registry, and it is batch 1's, not batch
2's.** `bare-rtl-hebrew` rises from 4,471 records / 4,189 entries alone
to 4,517 / 4,232 composed, because `redundant-outer-rtl-span` runs
first and drops wrapper spans, re-exposing Hebrew that was `rtl: true`
while the wrapper stood. Composed is HIGHER, which is the correct
direction: the unwrapper creates work for the wrapper. The failure mode
the ordering exists to prevent is the reverse one — batch 1 measured
that running the unwrapper LAST leaves 62 entries newly bare with
nothing to wrap them, with every unit test green.

**Every batch-2 rule is byte-identical isolated and composed.** That is
a fact about this corpus rather than about the rules, and the registry
order is what keeps it safe after a re-fetch: an unlink rule that
removes an antecedent a retarget rule wanted must run first, which is
why the ordering is asserted rather than reasoned about.

### `bun transform:count` — 13 rules, 4 findings

```
redundant-outer-rtl-span               measured(entries)=  529 catalogued=  529  MATCH
bare-rtl-hebrew                        measured(entries)= 4189 catalogued= 4189  MATCH
latin-token-inside-rtl-span            measured(entries)=  130 catalogued=  130  MATCH
apparatus-cite-linked-as-scripture     measured(entries)=    8 catalogued=    8  MATCH
rabbi-name-linked-as-bible-book        measured(entries)=   42 catalogued=   41  DELTA +1
ellipsis-fragment-anchored             measured(entries)=   80 catalogued=   80  MATCH
geresh-letter-numeral-mislink          measured(entries)=  475 catalogued=  475  MATCH
prefixed-geresh-abbrev-mislink         measured(entries)=  173 catalogued=  173  MATCH
plural-to-feminine-final-letter-mislink measured(entries)=   50 catalogued=   57  DELTA -7
shuruk-as-yod-display-corruption       measured(entries)=   12 catalogued=   12  MATCH
ib-yoma-2a                             measured(entries)=  188 catalogued=  312  DELTA -124
sifre-ib-resolves-to-yalkut            measured(entries)=    1 catalogued=    5  DELTA -4
ib-targum-work-loss                    measured(entries)=    8 catalogued=    8  MATCH
```

That output is the state BEFORE this task's write-backs — the
evidence they were made from. **After them: 13 rules, 11 MATCH, 2
findings**, both by design and both explained in their own rows:

```
rabbi-name-linked-as-bible-book        measured(entries)=   42 catalogued=   42  MATCH
plural-to-feminine-final-letter-mislink measured(entries)=   50 catalogued=   50  MATCH
ib-yoma-2a                             measured(entries)=  188 catalogued=  312  DELTA -124
sifre-ib-resolves-to-yalkut            measured(entries)=    1 catalogued=    6  DELTA -5
```

- **`ib-yoma-2a` −124.** The catalogued 312 is an OCCURRENCE count and
  the row never said so. `transform:count` measures entries. 312 occ =
  274 entries, of which 188 fire. This is spec §4.2's designed
  unit-mismatch finding, and the row's new `reason` records the unit.
- **`sifre-ib-resolves-to-yalkut` −5**, having been −4 before the
  write-back. Two corrections that must not be reported as one: `+1`
  population (E00476, a real member the probe missed) went into
  `corpusCount`, and the `−5` that remains is the decline census.
  Folding them together would have left the row reading −4 and hidden
  the discovery defect inside the design decision.

## 4. `bun body:migrate-dry`

```
entries=32512 repaired=832
gate formSection=32512/32512
gate lettered=32512/32512
gate rejoin=32512/32512
gate units=32512/32512
labelQuarantines=0
binyanEmptyOrUntrimmed=0
schemaFailures=0
repairFailures=0
transformFailures=0
patchCorpus=0 patchesApplied=0 patchProblems=0
unresolvedRepairedOrphans=0
transform redundant-outer-rtl-span: 531 instance(s)
transform bare-rtl-hebrew: 4516 instance(s)
transform latin-token-inside-rtl-span: 131 instance(s)
transform apparatus-cite-linked-as-scripture: 8 instance(s)
transform rabbi-name-linked-as-bible-book: 42 instance(s)
transform ellipsis-fragment-anchored: 80 instance(s)
transform geresh-letter-numeral-mislink: 481 instance(s)
transform prefixed-geresh-abbrev-mislink: 174 instance(s)
transform plural-to-feminine-final-letter-mislink: 50 instance(s)
transform shuruk-as-yod-display-corruption: 12 instance(s)
transform ib-yoma-2a: 189 instance(s)
transform sifre-ib-resolves-to-yalkut: 1 instance(s)
transform ib-targum-work-loss: 8 instance(s)
```

**32,512/32,512 on all four round-trip gates; 0 schema failures, 0
quarantines, 0 repair failures, 0 transform failures.**

**One instance count differs from the composed pass, and it is
explained rather than averaged:** `bare-rtl-hebrew` reads 4,516 here
against 4,517 composed. `migrate-dry` runs `applyRepairs` FIRST and
transforms on the HEALED entry; the composed pass above runs on
pristine source. The whole difference is **one entry, N00327**, where
the `rejoin-chopped` repair ("rejoined phantom `2)` into preceding
flow") merges two chopped Hebrew runs into one, so `bare-rtl-hebrew`
wraps once instead of twice. Measured per entry over the whole corpus:
exactly one entry differs, and no other rule differs at all.

## 5. Decline censuses

**A decline is a result.** Three rows deliberately do not touch part of
their own population, and the numbers belong here rather than in a
loosened predicate.

### `ib-yoma-2a` — 209 fire, 103 decline of 312

| disposition | occ | why |
|---|---:|---|
| retarget | 209 | citation antecedent, clean gap |
| no preceding anchor at all | 23 | the citation is printed, never anchored |
| only lexical `Jastrow, …` antecedents | 15 | same |
| every preceding anchor is a spent anaphor | 2 | N00819, R00635 |
| unanchored citation intervenes | 63 | see below |
| **total** | **312** | |

Every decline has one root cause: the citation the `Ib.` refers to is
in Jastrow's text but never became an anchor. Recovering any of them
means parsing `Y. Ter. VIII, 46ᵇ bot.` into a Sefaria address — the
deferred never-linked family, and inference rather than movement.

**The 63 are the finding.** The brief defined the antecedent as the
nearest preceding ANCHOR; in 63 members that is not the nearest
CITATION, because an unanchored one sits between. Copying the anchor
there writes a **different work**, and `link-target.ts` cannot catch
it — the wrong value is in the entry's own input target set, which is
the "laundering between anchors" blind spot its own docstring records.
Left unguarded the batch would have shipped 63 work-level mislinks past
a green gate.

### `sifre-ib-resolves-to-yalkut` — 1 fires, 5 decline of 6

K00811, N00892, Q01325, T00064 and V00301 hold no Sifré anchor anywhere
in their own entry, so there is no work to copy and minting one is the
fabrication the gate exists to stop. Five wrong links are left
standing; that is the honest cost of the ruling, not an oversight.

### The geresh pair and the plural row — arms deliberately left standing

`geresh-letter-numeral-mislink`'s strict predicate excludes 191 of the
708 numeral-article anchors, doing four different jobs. Per the
maintainer ruling of 2026-08-23 every one is registered with a query, a
count and rids in
[`geresh-abbrev-arms.md`](../../data/patches/catalogue-audit/geresh-abbrev-arms.md)
rather than dropped: variant readings (152/123, a real defect no row
owns), `ר׳` = Rabbi in a non-resh host (20/19), the numeral articles'
own cross-links (18/18, **not a defect** — convention), the swallowed
open paren (1/1), and verbal preformatives (34/32, a real defect no row
owns). Arms 1-4 sum to exactly 708 − 517 = 191, so the decomposition is
complete rather than a sample.

`plural-to-feminine-final-letter-mislink` declines 8 of its catalogued
68 — 3 self-links and 5 spans outside a printed `Pl.` construct — with
the full derivation in §6.

## 6. Catalogue write-backs

Surgical single-line edits. `renderPatterns()` was never called: it
emits compact JSON while the file uses spaced separators, so it would
reformat all 149 rows. The serializer used instead was verified to
round-trip all 149 lines byte for byte before any edit, and the diff is
six lines.

| Row | Field | Change |
|---|---|---|
| `rabbi-name-linked-as-bible-book` | `corpusCount` | 41 → **42** |
| `plural-to-feminine-final-letter-mislink` | `corpusCount` | 57 → **50** |
| `sifre-ib-resolves-to-yalkut` | `corpusCount` | 5 → **6** |
| `prefixed-geresh-abbrev-mislink` | `reason` | written for the first time |
| `ib-yoma-2a` | `reason` | written for the first time |
| `geresh-letter-numeral-mislink` | `reason` | records that the repair is UNLINK |
| `prefixed-geresh-abbrev-mislink` | `reason` | records that the repair is UNLINK |

**Rows whose measurement MATCHED their catalogued count and were left
alone:** `apparatus-cite-linked-as-scripture` (8),
`ellipsis-fragment-anchored` (80), `geresh-letter-numeral-mislink`
(475), `prefixed-geresh-abbrev-mislink` (173),
`shuruk-as-yod-display-corruption` (12), `ib-targum-work-loss` (8). Six
of ten reproduced exactly.

Every write-back was re-derived from the corpus in this task rather
than copied from a task report. **No measurement disagreed with its
report.**

### `rabbi-name-linked-as-bible-book`, 41 → 42

Maintainer ruling 2026-08-23: K01198's comma-lead variant
(`Lam. R. introd., R. <a …>Josh. 2</a>`) is the same defect as the
open-paren lead — same rabbinic-name context, same Book-of-Joshua
target, same `introd.` antecedent — and the predicate must describe the
defect rather than stop one short of it to match the catalogue. The
rule fires on 42 occurrences / 42 entries; K01198 is among them.

### `plural-to-feminine-final-letter-mislink`, 57 → 50

The delta decomposes exactly, with no residue, and every tier
reproduces:

```
68/57  catalogued, reproduced EXACTLY by the skeleton predicate alone
−3     self-link occurrences (H00796, K00308×2) — 2 entries
=65/55 pluralToFeminineRaw          (pinned in misc-links.test.ts)
−5     occurrences outside a printed Pl. construct — 5 entries
       (A02980, K01319, Q02197, U00688, U01486)
=60/50 pluralToFeminineMatch — what the rule fires on, shipped
```

The catalogued **entry** count moves 57 → 50; the occurrence count
moves 68 → 60.

### `sifre-ib-resolves-to-yalkut`, 5 → 6

**A POPULATION correction, not a fire/decline delta.** E00476 is a real
sixth member the discovery probe missed: all five catalogued rids are
preceded by `; Sifré `, E00476 by `.—Sifré `, and that punctuation
boundary in the probe cost the row its entire yield — its only
repairable member. Folding this into the same column as the five
declines would hide a discovery defect inside a design decision.

## 7. Registry order

`admin/pipeline/transform/registry.order.test.ts`, new in this task,
asserts three orderings and one exhaustiveness guard.

1. **Every unlink rule precedes every retarget rule.** A retarget rule
   copies a target off a neighbouring anchor; if an unlink rule is
   going to delete that anchor, its target is a wrong link and adopting
   it propagates the error.
2. **The live catalogue's entangled clusters occupy a gap-free span**,
   read off `entangledWith` rather than a list in the test, so a new
   edge in `patterns.jsonl` is enforced the moment it is recorded. The
   geresh pair is additionally named so the assertion cannot pass
   vacuously on an empty graph.
3. **The three `ib-` retargets keep their documented relative order.**
   This is the ordering the plan did not anticipate. Task 7 wrote the
   retarget-after-retarget rule into `registry.ts` when Task 8 was
   about to append two more retargets below it: a retarget reading the
   anchor sequence must run AFTER any rule that REPAIRS an anchor it
   might adopt, or it copies a target its neighbour is about to
   correct. The three populations are pairwise disjoint on today's
   corpus (Task 8 measured all six permutations at 6,212 records each
   with identical addresses), so the order is currently free — a fact
   about this corpus, not a licence to reorder after a re-fetch.
4. **The classification is asserted exhaustive**, both directions. A
   rule added to `RULES` and to neither set would otherwise satisfy
   every ordering vacuously, and the file would go blind at exactly the
   moment it is most needed.

## 8. Deferred minors, every one triaged

Nothing from the ledger disappeared silently.

| Minor | Origin | Disposition |
|---|---|---|
| `interior: 12` — the twelfth trapped anchor's source tag was unidentified | Task 0 | **FIXED.** Measured: all twelve are in ONE entry, J00597, trapped by ONE damaged tag — its first anchor's unterminated `href="/Jastrow,_דִּלְדֵּל.1</a>`. There is no twelfth source; there was only ever one. That tag is the catalogued row `unterminated-href-swallows-closing-tag`, so repairing it retires this refusal's whole live population. Recorded in `links.ts`. |
| biome infos 96 → 97, from `rules/unlink.ts` `lint/style/useDestructuring` | Task 3 | **FIXED.** One-line destructure. |
| `unlink.ts` docstring: re-derivation is "not a complexity-class change" | Task 4 | **FIXED.** It is — O(n) → O(k·n) in the definition's token count. Corrected to say so, and to say why it is affordable (shipped k is 1 or 2 in almost every member). |
| `prefixed-geresh-abbrev-mislink`'s `reason` still empty; neither geresh row records that the repair became UNLINK | Task 5 | **FIXED.** Both write-backs made — §6. |
| `geresh-abbrev-arms.md` arm 3's query omits the resh exclusion, so arms 2/3 are disjoint only empirically | Task 5 | **FIXED.** `m[1] !== 'ר'` added. Measured: overlap is 0 occurrences and the arm is unchanged at 18/18, so the decomposition still sums to 191 — the exclusion makes disjointness structural, not new. |
| `unlink.ts:180` "neither rule built on this reaches `language_reference`" — now six rules | Task 5 | **FIXED, and pinned.** The sentence is replaced, and the scope claim it was making is now a corpus test (`rules/unlink-scope.test.ts`) over every field `fieldsOf` walks: all three raw populations that had no field-scope pin (517 bare geresh, 185 prefixed, 65 plural) are 100% inside `senses[].definition`, 0 outside. A seventh row reusing the walk must extend it. |
| Task 7 review finding 6: the "92 of 272" figure in `anaphora.ts` and the audit is not reproducible (reviewer got 178/140/2 three ways) | Task 7 re-review — **queued to `impl-task-7` and never executed** | **FIXED.** The 92 reproduces under no reading, and the true figures make the omission MORE load-bearing, not less: **178 of the 272 gaps** carry a position marker and **133 of the 209 firing members** do, so adding `beg.`/`end.`/`top`/`bot.` as an intervening-citation cue would cost 133 repairs of 209 (64%), not "a third". Corrected in `anaphora.ts` and in `ib-yoma-2a.md`, and pinned by a new corpus test so it cannot drift back into prose. This is the only deferred minor that was a live wrong number in a permanent record. |
| Fixtures abridge surrounding text; A01423's `-יּוֹת` regression also passes for a second, coincidental reason (it is a self-link too) | Task 6 | **DEFERRED, knowingly.** The reviewer explicitly declined both: the fixtures are real rids with verbatim anchor markup in `geresh.test.ts`'s established style, and the primary reason (final letter ת, not ם/ן) is what the test's own comment documents and what the predicate gates on first. |
| `anaphora.test.ts` trips `noExcessiveLinesPerFile` (403 lines against 300) | Task 7 §9(7) | **DEFERRED, knowingly.** Info severity, `bun qa` exits 0, and **18 files in the repository trip this rule**, including `repairs.ts` (604) and `migrate-dry.ts`. Splitting the corpus tier into its own file is a repo-wide refactor decision, not a batch-2 change. `rules/unlink-scope.test.ts` was created as a separate file rather than appended to `unlink.test.ts` partly to avoid adding a nineteenth. |

**Net biome position: 105 infos, one BELOW the 106 at this task's
base commit** — the batch's own `useDestructuring` regression is
closed and nothing new was added. `bun qa` exits 0.

## 9. Candidate rows recorded, not opened

Each was measured while a rule was being written, each is outside every
catalogued row, and none was added to `patterns.jsonl` — the catalogue
is saturated and opening a row is a discovery decision, not a transform
one. They are carried into
[`phase-2-triage.md`](phase-2-triage.md#candidates-found-in-batch-2-recorded-and-not-opened)
so the measurement outlives the task reports.

| Candidate | Occ | Entries | Source |
|---|---:|---:|---|
| bare `Ib.`/`ib.` → `Yoma 2a:N` — the 312's segmented twin | 52 | 47 | `catalogue-audit/ib-yoma-2a.md` §8 |
| `Ibid.`/`ibid.` → `Yoma 2a` — a third spelling | 3 | 3 | same |
| `homograph-numeral-iv-default` — display string IS a headword, all targeting a IV-numbered member | 40 | 37 | `catalogue-audit/homograph-numeral-mismatch.md` §6a |
| geresh arm 1 — variant readings (`Ms. K. ב׳`) | 152 | 123 | `catalogue-audit/geresh-abbrev-arms.md` |
| geresh arm 5 — verbal-preformative stubs | 34 | 32 | same |
| geresh arm 2 — `ר׳` = Rabbi in a non-resh host | 20 | 19 | same |

The 55 `ib.` siblings are the cheapest of these: the shipped predicates
already draw both boundaries — `isSinkMember` is the catalogued 312 and
`isSpentAnaphor` is the 312 plus the 52 — so widening is one line on an
already-tested predicate. Verified in this task:

```
segmented: 52 occ / 47 entries — Yoma 2a:8 ×30, :7 ×5, :3 ×5, :4 ×5,
                                 :10 ×3, :1 ×2, :5 ×1, :6 ×1
ibid:       3 occ /  3 entries
```

Two further recommendations from Task 9's audit are carried and not
acted on, both recorded in `homograph-numeral-mismatch`'s own `reason`:
**split the row in three** (roman 195/187 keeps the id;
`homograph-numeral-vs-superscript` 277/262;
`roman-numeral-orphan-display` 104/96), and **fix the entry side
first** — 243 of the 345 candidate defects (70.4%) name a member whose
corpus headword carries no Roman numeral at all. Three entry-side
shapes no row owns: 6 headwords printing the same numeral twice and
distinguished only by a superscript (A00015, B00383, B00779, B01201,
C00774, O01369); 6 headwords naming two print members at once, so no
display numeral can ever match them (A00883, A02356, B00407, D00844,
E00508, G00675); and B00098's double-space `"בַּד  V"`, a one-character
repair that makes בַּד V addressable again.

## 10. Process finding — six of the briefs' discovery queries were wrong

This is the batch's most reusable result and it belongs in the record.
**Six discovery queries written into the task briefs did not measure
what they claimed to**, and in every case the implementer's own
measurement caught it before code was written. Each failure has the
same shape: the query encoded an ASSUMED BOUNDARY that the corpus does
not have.

| # | Task | The assumed boundary | What it cost |
|---|---|---|---|
| 1 | 3 | **A tag boundary.** The query looked for the ellipsis INSIDE the anchor display; print puts it in the lead text before the anchor. | 0 found against a real 94 raw. |
| 2 | 3 | **Nested-sense recursion.** The same snippet iterated `content.senses` and never walked `sense.senses`. | A flat walk loses roughly a quarter of any population in this corpus. It was masked by #1 — a query that never matches scores 0 however many senses it visits. |
| 3 | 4 | **A field name.** `/\bb\.\s*h\./u` was tested against `language_reference`; the cue lives in `language_code` (2,622 entries against 10). | Run as written, the population reads ~0. One printed parenthesis is split across two fields. |
| 4 | 5 | **A character class.** The stub pattern had no Hebrew-points class between the letter and the geresh (and allowed an ASCII apostrophe that occurs zero times). | 17 members are vocalised, so a points-blind pattern silently measures 690 where the truth is 707. |
| 5 | 7 | **A design claim about gate case 3.** The spec billed `ib-yoma-2a` as case 3's first user. | It is a pure case-2 copy and CANNOT use case 3 — 0 of 312 displays carry a locus. Case 3's first user turned out to be a one-anchor row, and case 3's general limit (no Jastrow display can supply a Sefaria locus) was only found because Task 8 tried it. |
| 6 | 10 | **An over-matching substring.** The query was `display.includes('יּ') && dataRef.includes('וּ')`; `יּ` is also ordinary Hebrew (a doubled consonant after a chirik, e.g. חִיּוּב), whose display legitimately holds both glyphs. The right reading is swap-then-EQUAL, full string. | 111 candidates against a true 12. |

Two more of the same family turned up in row descriptions rather than
in briefs, and are worth counting alongside: **Task 6** found that the
`plural_form` JSON field carries no markup corpus-wide, so the row's
"58 of 68 in `plural_form`" was a display-text reading of the
definition; and **Task 8** found the Targum brief probing
`anchor.display` for `ib.` when the row's own `reason` says `Targ.` and
`ib.` both sit OUTSIDE the anchor — the query returns non-members and
misses every real one.

**What worked.** Every one of the eight was caught the same way: by
running the brief's query verbatim before writing code, comparing it to
the row's catalogued number, and treating the disagreement as a
question rather than a target. The house rule this batch earns is the
one it kept proving: **a discovery query is a claim about where the
defect lives, and it is the first thing to falsify, not the thing to
tune until the count matches.**

## 11. Concerns

1. **The brief for this task said "eight rules across five modules"
   and named ten rules across four.** The enumeration is right and the
   summary is wrong; the registry holds 13 rules, of which 3 are batch
   1's, and the batch-2 ten live in `unlink.ts`, `geresh.ts`,
   `misc-links.ts` and `anaphora.ts`. Recorded because a headline
   number that disagrees with its own list is exactly the shape of
   defect this batch spent most of its effort on.
2. **Task 7's review finding 6 was queued and never executed** (see §8).
   It was recoverable only because the ledger recorded the queue. The
   ledger also does not record Task 9's fix round or Task 7's
   re-review closing, though the commits (`8d8589e`) are present — the
   ledger's last entry is Task 10's completion.
3. **Five wrong links are left standing by the Sifré declines and 103
   by `ib-yoma-2a`'s.** Both are honest declines under the batch's own
   §1 ruling, and both point at the same deferred work: the never-linked
   family. `ib-yoma-2a`'s decline census is, read another way, a
   measurement of how much of that family sits inside an already-linked
   entry.
4. **`ib-yoma-2a`'s segment approximation is a recorded limit, not a
   repair.** The antecedent's segment is copied whole, so the repaired
   address is the place Jastrow had just cited rather than the linker's
   own text-match. Ruled settled 2026-08-23; 3 of the 209 firing
   members (P00175, Q00006, S00030) are a distinguishable sub-shape
   inside it.
5. **Gate case 4 can MINT an address the entry never held.** Two
   same-work targets still license a third verse in that work
   (`13:2` + `1:13` → `13:13`). The tightening narrows it rather than
   closing it, and the residue is recorded in `link-target.ts`'s
   blind-spot list. No rule other than `ib-targum-work-loss` uses the
   case.
6. **`bare-rtl-hebrew`'s catalogued 4,189 is an entry count measured on
   PRISTINE source.** Composed it touches 4,232 entries and under
   `migrate-dry` 4,516 instances. Nothing is wrong, but the row's
   number and the pipeline's number will always differ, and the next
   person to reconcile them should read §3 and §4 first.

---

## Verification, reproducible

```bash
bun qa                  # format, lint, test, tsc — exit 0
bun transform:count     # 13 rules; see §3 for the surviving deltas
bun body:migrate-dry    # §4
bun test admin/pipeline/transform/registry.order.test.ts
```
