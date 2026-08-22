# Transform Module — Phase 2 Automation

- **Status:** approved 2026-08-22 (maintainer)
- **Parent:** [sweep tiering §4 Phase 2](2026-08-17-sweep-tiering-design.md)
- **Worklist:** [Phase 2 triage](../v2/phase-2-triage.md) — 81 transform
  rows, 24,655 instances
- **Consumes:** the entry body model
  ([§6.0](2026-07-11-entry-body-model-design.md)), the committed ordered
  phase manifest ([research process §5 step 2](2026-08-10-research-process-design.md),
  implemented at `admin/pipeline/patch/apply.ts:55`)

## 1. Context & Problem

Phase 1 closed with a catalogue of 132 candidate pattern classes,
routed three ways: 81 **transform** (deterministic code), 46
**judgment** (per-entry reading), 5 **blocked** (predicate unpinned).
This spec covers the 81.

No spec pins where they live. The existing transform module,
`admin/pipeline/body/repairs.ts`, holds **rid-keyed literal edits**
hand-transcribed from review docs — `A00913: '2)'`. The 81 are
**rule-based predicates over the whole corpus**. Same intent, different
shape; 642 lines of the former should not absorb the latter.

Two further problems the routing surfaced and nothing yet answers:

**Counts cannot be a runtime contract.** Each catalogue row carries a
`corpusCount` measured against the pinned snapshot. Those numbers are
how a deterministic rule proves it says what the catalogue claims —
"writing the transform is the audit". But the pipeline must survive a
re-fetch of the source, after which every count is stale. A rule that
asserts its own count at runtime turns a data refresh into an outage.

**The no-new-text gate does not transfer unchanged.** The patch-tier
validator flattens content *including markup*
(`schema.ts:flattenContent`), so a rule that only adds an `<a href>`
reads as inventing 1,137 entries' worth of new text.

## 2. Placement

No new phase. The committed manifest already has the two slots needed,
one of which is an empty placeholder waiting for exactly this work:

```
text-repairs          repairs.ts (rid-keyed) → THEN rule transforms
structural-repairs    the structure-changing rules
patch-apply           unchanged
consumer-output       unchanged
```

`migrate-dry.ts` says the placeholder's purpose outright: "No
structural pass exists yet […]; the phase runs empty so the ordering
contract is enforced from day one."

**Rules run after `applyRepairs`, within `text-repairs`.**
`repairs.ts` asserts each find-text matches its entry exactly once and
fails loudly otherwise, so it must see pristine source. Rules run
second, corpus-wide, over the healed entry.

Sweep-tiering §5 records an unverified risk that "sweep patches
collide with hand-curated `repairs.ts` edits on one entry". This
ordering settles the **transform** side of that: a rule can never
invalidate a find-text that has already matched. The patch side is
untouched — `patch-apply` still runs downstream of both, and §5's
mitigation ("check composition before Phase 3.1") still stands.

Rules that change entry *shape* — empty stem sections, stranded stem
heads, collapsed gender-pair headword lines — run in
`structural-repairs`, honouring the S1 contract that markers are
in-text before any split.

## 3. Module Layout

New directory `admin/pipeline/transform/`, sibling of `body/`,
`patch/`, `research/`.

| File | Purpose |
|---|---|
| `types.ts` | `Rule`, `TransformRecord` |
| `registry.ts` | ordered rule list; the coverage and entanglement gates |
| `run.ts` | `applyTransforms(entry, phase)` → `{ entry, records }` |
| `no-new-text.ts` | the transform-tier byte gate (§5) |
| `count.ts` | `bun transform:count` — the audit harness (§4) |
| `rules/*.ts` | seven family modules, tests colocated |

Family modules: `rtl.ts`, `links.ts`, `italics.ts`, `anchors.ts`,
`headwords.ts`, `senses.ts`, `niqqud.ts`. The split is by the object a
rule edits, not by phase or blocking status, so entangled rows land in
one file and get written as one edit.

### 3.1 The rule interface

```ts
interface Rule {
  id: string;
  phase: 'text-repairs' | 'structural-repairs';
  /** Text codepoints this rule may introduce (§5). Empty = strict
   *  sub-multiset. Non-empty requires a docs reference to the ruling. */
  allows?: readonly string[];
  apply(entry: SourceEntry): { entry: SourceEntry; hits: number };
}
```

**A rule carries no expected count.** It carries a predicate, and
reports how many instances it hit. `hits` is a record — it flows into
the migration report and is never compared against anything at
runtime.

## 4. The Counting Model

Two harnesses, deliberately separate.

| Harness | Runs | Answers |
|---|---|---|
| `bun transform:count` | each rule **alone**, against the pinned snapshot | does the predicate reproduce its catalogue count? |
| `bun body:migrate-dry` | all rules **composed**, in phase order | does the healed corpus still pass the gates? |

Independent measurement is load-bearing. The catalogue's counts were
taken on the raw corpus; in a composed run rule 40's count drifts
because rules 1–39 already edited the text. Composed counts would make
the audit meaningless.

### 4.1 Counts are test-tier, not pipeline-tier

| Artefact | Lives in | Read by |
|---|---|---|
| The predicate | `rules/*.ts` | every pipeline run, forever |
| The expected count | `patterns.jsonl` `corpusCount` | `transform:count` only |
| The snapshot pin | `data/patches/snapshot.lock` | `transform:count` only |

`migrate.ts` never reads a catalogue count and never fails on one.

When the source snapshot moves, `transform:count` reports **"pinned
snapshot stale"** and skips, rather than emitting 81 false mismatches.
The pipeline is unaffected: rules run, the corpus gets corrected.

| Scenario | Result |
|---|---|
| Snapshot unchanged, count drifts | real signal — the predicate is wrong |
| Snapshot changed | harness skips; re-baseline is a deliberate act |

This decoupling is structural, not a matter of discipline. A rule
whose job is to *correct* the data must not be tuneable to hit a
number; keeping the number out of the rule makes that impossible
rather than merely discouraged.

### 4.2 A mismatch is a finding

Where a rule's independent count disagrees with the catalogue, the
disagreement is recorded, not suppressed. The row's `corpusCount` and
`reason` are corrected in `patterns.jsonl`, or the row reclassifies
(§6). Fifteen transform rows are unaudited — they have no recorded
derivation behind their counts — and the triage expects some of them
to reclassify on contact.

## 5. The no-new-text Gate

The constraint is unchanged from the patch tier: a transform may
rearrange, re-tag, split or delete existing text, never generate new
words. The mechanism has to change, because transforms legitimately
rewrite markup.

Three layers:

| Layer | Rule |
|---|---|
| **Markup** | free to change; separately checked for well-formedness |
| **Text**, tags stripped | strict sub-multiset of the input — unless the rule declares an `allows` |
| **Copies** | text duplicated from elsewhere in the same entry, declared per call (§5.1) |

The gate reads every text-bearing field a rule can edit: `headword`,
`alt_headwords`, `plural_form`, `language_reference`, `quotes`, and
`content` (morphology, sense numbers, definitions, recursively). A field
outside that set is a field the gate cannot see, and a rule editing it
would pass vacuously. `refs[]` is excluded deliberately — it is dropped
from truth (body model §5, B7) and holds machine identifiers, not text.

Every non-empty `allows` is a maintainer ruling in code, cited to its
source. Three groups are anticipated:

- **Space restoration** — `paren-tag-no-space`, `anchor-italic-no-space`,
  `italic-close-paren-nospace`, `geresh-abbrev-space-loss`,
  `translit-italic-space-loss`, `emphasis-run-edge-space`. `allows: [' ']`.
- **Niqqud correction** — `shin-sin-dot-drop`,
  `holam-migrated-off-mater-vav`, `impossible-dagesh`,
  `shuruk-as-yod-display-corruption`. Covered by the OCR ruling of
  2026-08-11: a mis-recognized glyph never was the source's content.
- **Lost markers** — `see-particle-lost`,
  `continuation-marker-em-dash-loss`. Closed-grammar tokens only.

Roughly twelve rows, read from the row names rather than measured; the
figure firms up as rules land. **A rule wanting text bytes outside a
declared allowance is not a transform.** It reclassifies.

### 5.1 Duplication is not invention

A sub-multiset check counts occurrences, so a rule that *copies* text
from one field of an entry into another fails it — the copied
codepoints now appear twice against an input that held them once. That
is the shape of `abbrev-in-alt-headwords`, which recovers an
abbreviation's elided tail from the entry's own `headword`, and of
several later rows that fuse or split headword lines.

Nothing is invented there, and a static `allows` cannot express it: the
copied tail differs per entry.

So a rule may return, alongside its records, the strings it copied:

```ts
apply(entry): {
  /** Text this call duplicated from elsewhere in the SAME entry. The
   *  gate verifies each string occurs in the input before permitting
   *  it — a declared copy that is not in the source is a violation,
   *  not an allowance. */
  copied?: readonly string[];
  entry: SourceEntry;
  records: TransformRecord[];
}
```

The guarantee this preserves is the one that matters: **no bytes from
outside the entry**. It is checked per call against that entry's own
text, so it cannot widen into a blanket exemption the way a
codepoint-level `allows` can.

Maintainer ruling, 2026-08-22, on the question "how should the gate
handle a rule that duplicates text from elsewhere in the same entry":
declare what was copied, verify it against the input.

## 6. Coverage and Reclassification

`patterns.jsonl` stays the single source of truth. A registry test
asserts a bijection against it:

| Check | Failure means |
|---|---|
| Every `route: transform` row has a rule | a row was silently skipped |
| Every rule id matches a catalogue row | a typo, or a rule with no mandate |
| Entangled pairs sit adjacent in the registry | the round-4 double-rewrite hazard |

When a row proves to need judgment, the rule is not quietly dropped.
`route` is rewritten to `judgment` in `patterns.jsonl` with a
`reason`, through the existing `renderPatterns()`. Coverage then
follows automatically and the reclassification is a committed diff
rather than a silence.

This is how sweep-tiering §4's Phase 2.1 gate is met: *every catalogue
row resolved* — as a rule, or as a recorded reason it cannot be one.

## 7. Sequencing

Seven batches, one pull request each, merging to `v2`.

| # | Batch | Rows | Instances |
|---|---|---:|---:|
| 1 | `bare-rtl-hebrew`, `abbrev-in-alt-headwords` | 2 | 6,225 |
| 2 | Links & citations | ~14 | ~5,600 |
| 3 | Italics & punctuation seams | ~16 | ~3,900 |
| 4 | Anchors & paren integrity | ~11 | ~2,200 |
| 5 | Headwords & alt-headwords | ~10 | ~1,300 |
| 6 | Senses, stems & binyan — fills `structural-repairs` | ~16 | ~2,400 |
| 7 | Niqqud & Hebrew orthography | ~12 | ~600 |

Batch 1 is the triage's own advice: both rows are blocking, neither is
entangled, and together they are 25% of the queue. Batches 2–5 are
text-phase. Batch 6 lands last among the large work because it is the
one that changes entry shape.

Batch counts are approximate — the family split is by edited object,
and a few rows will move between families on contact. The registry's
coverage gate, not this table, is what proves all 81 are accounted for.

**Precondition on batch 3:** `italic-swallowed-terminal-period` must
shed its 123 misfiled label occurrences before its transform is
written, or the house-style ruling moves them the wrong way (triage
caveat 3).

**`blocking` does not gate the work.** It gates the cutover. The
sequencing above takes rows on size and entanglement, not on blocking
status, because a transform costs the same whenever it is written and
shipping it early ships fewer defects.

## 8. Error Handling

A rule that throws is contained to its entry: the failure is recorded
and the walk continues, so one run lists every failure instead of
aborting at the first. `migrate-dry.ts` rethrows after the walk — the
run stays loud. This matches the existing handling of a drifted
`repairs.ts` find-text.

Output that is structurally wrong is caught downstream, not by the
rule: `body:migrate-dry` validates every healed entry against the full
schema and runs the four round-trip gates. The bar is unchanged —
32,512/32,512, 0 schema failures, 0 quarantines.

## 9. Testing

| Tier | What it proves |
|---|---|
| Unit, per rule | the predicate fires on its shape and holds off near-misses |
| `transform:count` | the predicate reproduces the catalogue count on the pinned snapshot |
| `no-new-text`, per rule | no text bytes beyond a declared allowance |
| Registry | all 81 rows resolved; entangled pairs adjacent |
| `body:migrate-dry` | the composed corpus still passes every gate |

Unit tests are colocated with their family module, following the
existing `body/` convention. Fixtures come from the entries the
catalogue rows cite.

## 10. Out of Scope

- The 46 judgment rows — Phase 2.3, one targeted Opus pass.
- The 5 blocked rows — their predicates need pinning first; only
  `open-paren-in-rtl-span` (89) is on the critical path.
- The 30 round-3 patches, validated but not yet ingested.
- `migrate.ts` and `compile.ts` — they consume this work; they are not
  part of it.
- The detector defect of Phase 2.4 (`HOMOGRAPH` superscript stripping).
