# Sense Structure Repair — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use
> superpowers-extended-cc:subagent-driven-development (recommended) or
> superpowers-extended-cc:executing-plans to implement this plan
> task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement
[docs/specs/2026-08-06-sense-structure-repair-design.md](../../specs/2026-08-06-sense-structure-repair-design.md)
(S1–S6): the swallowed-sense splitter, the implied-`1)` candidate
review, deferred-row resolution, the migration-inventory manifest,
the new disposition vocabulary, and the S5 completeness gate — so the
pipeline **corrects** sense structure instead of byte-faithfully
preserving Sefaria's broken segmentation.

**Architecture:** Everything extends the existing `repairs.ts` /
`migrate-dry.ts` / `review.ts` machinery. The splitter is a
structural repair pass running after the text passes; dispositions
become `SPLIT` / `SIGNED_EXCEPTION` / `REJECTED` / edit maps, all
reconciled against a committed pre-change manifest by a `bun qa`-run
test. Standing gate: the maintainer personally reviews doc 08, the
split diffs, and every exception/rejection row before blessing.

**Tech Stack:** Bun + TypeScript (tabs, biome), `bun:test`, JSONL
source at `data/source/jastrow-dictionary.jsonl`.

**Spec decisions (already made, §6):** sibling `number` = verbatim
marker token; doc-08 review covers all ~78 candidates.

---

## Task flow

| Task | Blocked by | User gate? |
|---|---|---|
| 1 census | — | |
| 2 doc-08 generator | 1 | |
| 3 eyes-on review | 2 | **YES** |
| 4 manifest + dispositions | 3 | |
| 5 splitter (S1/S2) | 3, 4 | |
| 6 implied-1 inserts | 3, 4 | |
| 7 S5 completeness gate | 4, 5, 6 | |
| 8 recounts + evidence docs | 7 | |

---

## Task 1: Implied-`1)` candidate census (S3 detector)

**Goal:** The in-text census behind `upstream-issues.md` #16 (~78
candidates) becomes reproducible code with a **committed literal rid
list** — the S3 completeness anchor.

**Files:** Create `admin/pipeline/body/implied-one-census.ts` (+
colocated test). Modify `census.ts` only if the detector belongs in
the shared census walk.

**Acceptance Criteria:**
- [ ] Detector finds entries whose first sense list opens at `—2)`
      (top-level or stem children) or whose `—2)` run sits in-text,
      with no `1)` anywhere before it — the Note 1 convention shape
- [ ] Census run prints the count and full rid list,
      deterministically ordered
- [ ] The rid list is committed as a literal (the S3/S5 anchor);
      re-running the census against the committed list is a test
- [ ] Fixture tests cover: genuine implied-1, entry with explicit
      `1)` (no hit), citation-close `2)` false-positive shape (no hit)

**Verify:** `bun test admin/pipeline/body/implied-one-census.test.ts`
→ pass; census run prints `candidates=<N>` matching the committed
list length (~78 expected; the exact measured N becomes the number).

## Task 2: Doc 08 generator

**Goal:** `bun body:review` additionally generates
`docs/v2/body-review/08-implied-one-candidates.md` — one row per
census rid (headword, sequence, label context, empty Decision cell)
— with the same decision-preservation guard as docs 00–07.

**Files:** Modify `admin/pipeline/body/review.ts` (+ `review.test.ts`);
regenerate `docs/v2/body-review/00-INDEX.md` inventory row.

**Acceptance Criteria:**
- [ ] Doc 08's row set **equals** Task 1's committed list (count +
      set, asserted in a test — a generator that drops rows fails)
- [ ] Regen preserves Decision cells; refusal lists 08 like the rest
- [ ] 00-INDEX gains the 08 row with its count and status

**Verify:** `bun run body:review` writes 08; immediate re-run reports
it unchanged; `bun test admin/pipeline/body/review.test.ts` → pass.

## Task 3: Maintainer eyes-on review (USER GATE)

**Goal:** The maintainer reviews **all** doc-08 rows (spec §6 Q2),
resolves the 3 deferred rows, and signs any exceptions — writing the
approval metadata S5 will later resolve.

**USER-ORDERED GATE — NON-SKIPPABLE.** Close only when every
acceptance criterion is independently verified with captured output.

**Files:** Modify `docs/v2/body-review/08-implied-one-candidates.md`
(Decision cells), `docs/v2/body-review/01-broken-sequences.md`
(D00470 / K00081 / R00519 rows + any changed dispositions).

**Acceptance Criteria:**
- [ ] Every doc-08 row carries confirm / reject (+ reason)
- [ ] D00470, K00081, R00519 each carry a final decision (edit /
      split / signed exception with reason)
- [ ] Every signed exception and rejection row records the review
      date (the approval metadata source of truth)

**Verify:** no empty Decision cells in 08; no "deferred" language
left in 01's three rows.

## Task 4: Migration-inventory manifest + disposition vocabulary (S6)

**Goal:** The pre-change inventory is committed and the disposition
vocabulary says what it means — "no change without a reason" stops
being representable.

**Files:** Modify `admin/pipeline/body/repairs.ts` (+ test).

**Acceptance Criteria:**
- [ ] `MIGRATION_MANIFEST`: literal pre-change inventory — the 19
      `CONFIRMED_NO_CHANGE` rids, the marker-reinsert rids, and the
      3 `DEFERRED` rids as they stand on `v2` today
- [ ] New structures: `SPLIT` (rid-keyed split expectations, Task 5
      fills), `SIGNED_EXCEPTION` and `REJECTED` (each record: reason
      string, doc pointer, review date — non-empty enforced by type
      and test); `REJECTED` valid only for Task 1 census rids
- [ ] `CONFIRMED_NO_CHANGE` and `DEFERRED` deleted — grep-clean
- [ ] Test: every manifest rid maps **exactly once** to `SPLIT` /
      `SIGNED_EXCEPTION` / an edit map (placeholder allowed until
      Task 5 lands splits, then exact)

**Verify:** `bun test admin/pipeline/body/repairs.test.ts` → pass;
`grep -c "CONFIRMED_NO_CHANGE\|DEFERRED" admin/pipeline/body/*.ts` → 0.

## Task 5: Swallowed-sense splitter (S1/S2)

**Goal:** The structural repair: each `SPLIT` rid's swallowed sense
becomes a real sibling sense, provably.

**Files:** Create `admin/pipeline/body/split.ts` (+ test). Modify
`repairs.ts` (pass wiring, after text passes), `migrate-dry.ts`
(pass ordering assertion), fixtures as needed.

**Acceptance Criteria:**
- [ ] Rid-keyed expectations: literal marker token, host address
      (`'top' | {stem}` + index or label), expected occurrence count
      — wrong/moved/missing marker throws with rid context
- [ ] Executable precondition: text passes have already run
      (asserted, not assumed)
- [ ] Sibling inserted at host index + 1; `number` = verbatim token
- [ ] Per-split proofs, both asserted: bytes
      (`host.definition + sibling.number + sibling.definition` ==
      pre-split) and structure (host's list reads 1..n after)
- [ ] Fixtures: top-level split, stem-child split (J00515 Hifil
      shape), multi-marker entry, and a no-op guard (unlisted rid
      untouched)
- [ ] All four existing round-trip gates stay 32,512/32,512 on the
      healed corpus

**Verify:** `bun test admin/pipeline/body/split.test.ts` → pass;
`bun run body:migrate-dry` → gates 32,512/32,512, split pass listed
with entry ids.

## Task 6: Implied-`1)` inserts for confirmed doc-08 rows

**Goal:** Task 3's confirmed candidates get their `1)` (recorded
deviation, register #16); in-text `—2)` runs additionally split via
Task 5's rule.

**Files:** Modify `admin/pipeline/body/repairs.ts` (`IMPLIED_ONE` /
`IMPLIED_ONE_TEXT` extensions + `SPLIT` additions), fixtures for
representative shapes.

**Acceptance Criteria:**
- [ ] Every confirmed doc-08 rid appears in exactly one of:
      `IMPLIED_ONE`, `IMPLIED_ONE_TEXT` (+`SPLIT` where in-text);
      every rejected rid in `REJECTED` with its reason
- [ ] All inserts flagged `deviation: true`
- [ ] `docs/v2/upstream-issues.md` #16 count updated from "4
      confirmed (~78 unreviewed)" to the reviewed totals

**Verify:** `bun run body:migrate-dry` → implied-one records match
the confirmed count; `bun test` green.

## Task 7: S5 completeness gate

**Goal:** The committed test that makes every future Q00997-class
gap a CI failure.

**Files:** Create `admin/pipeline/body/dispositions.test.ts`.

**Acceptance Criteria (all exact equalities):**
- [ ] Every `MIGRATION_MANIFEST` rid maps exactly once to `SPLIT` /
      `SIGNED_EXCEPTION` / edit map
- [ ] Doc 01 + doc 08 table rids (parsed from the committed docs)
      **equal** the union of code dispositions — no doc rid without
      a bucket, no code rid without a doc row, no rid in two buckets;
      class-level docs (02/03/05/06/07) deliberately excluded
- [ ] `CONFIRMED_NO_CHANGE` / `DEFERRED` identifiers absent from the
      module (their existence fails the test)
- [ ] Every `SIGNED_EXCEPTION` / `REJECTED` reason non-empty; its doc
      pointer resolves to a row that records a decision and date
- [ ] Per-detector: migration report's `brokenTopSequences` equals
      the brokenTopSequences exception set; `startsAtTwo` equals its
      own (target: both empty)

**Verify:** `bun qa` → green (the test runs in the standard suite);
deliberately removing a manifest rid or blanking a reason fails it.

## Task 8: Recounts + evidence docs

**Goal:** The blessing evidence: recounts at target, docs telling
the story, spec changelog closed out.

**Files:** Modify `docs/v2/body-migration.md`,
`docs/v2/upstream-issues.md`,
`docs/specs/2026-08-06-sense-structure-repair-design.md` (§7 row),
`docs/v2/body-review/00-INDEX.md` statuses.

**Acceptance Criteria:**
- [ ] `bun run body:migrate-dry`: `brokenTopSequences=0`,
      `startsAtTwo=0` (or the enumerated signed sets), all gates
      32,512/32,512, schema failures 0, repair failures 0
- [ ] body-migration.md documents the split pass and new recounts
      with measured numbers
- [ ] Spec §7 changelog records completion with evidence pointers
- [ ] Maintainer sign-off on the final split diffs (standing gate)

**Verify:** `bun run body:migrate-dry 2>&1 | tail` output matches the
documented numbers; `bun qa` green.
