# Pilot tranche report — 2026-08-13

- **Scope:** chunks 00001–00007 of the deterministic chunking
  (rids A00000–A00209, 210 entries), swept end-to-end as the
  calibration tranche (plan Task 7; spec §4.1.6).
- **Go/no-go:** maintainer go recorded 2026-08-13 12:23 CDT.
- **Prompts:** sweep-v1, verify-v1. Models: Sonnet sweep (7 agents,
  one per chunk), Opus verification (4 agents).
- **Snapshot pin:** `sha256:75bbc5ee7ab863b80b144c5fe176492b9bbcc8719cad83264ff8027092719ad9`
- **Sample config:** seed 20260813, highRate 0.25 (min 8),
  cleanRate 0.15 (min 15) — all low/med patches always included.
- **Entry state:** pre-patch pipeline state (post `applyRepairs`),
  matching the patch-apply phase's input.

## Measured numbers

| Measure | Value |
| --- | --- |
| Entries | 210 |
| clean | 197 |
| repaired | 3 |
| needs_print_check | 6 |
| needs_human_judgment | 4 |
| Patches accepted | 3 |
| Patches rejected at ingest | 1 |
| Patches sampled (Opus tier) | 3 of 3 (2 med always-sampled, 1 high) |
| Sampled error rate | 33.3% (1 of 3) |
| Clean entries sampled | 30 of 197 |
| Clean-sample miss rate | 3.3% (1 of 30) |
| Escalation queue | 10 |

## The error and the miss

- **P000003 (A00130), error:** repair bytes verified correct; the
  verdict failed it for `defect_class` mislabeling only — it tagged
  the nested-duplicate-anchor defect `chopped-duplicated-tail`
  (class 6) while the identical defect on A00085 got the proposed
  novel token `duplicate-anchor-wrap`. Inconsistent class labels
  would skew synthesis counts. Repair itself stands.
- **A00074, miss:** sense text reads `…37ᵃ bot—V. בּוּן.` — the
  abbreviation period after `bot` was dropped upstream (class 8
  text loss, one byte). Should have been `needs_print_check`, was
  called `clean`.

## Ingest floor (worked as designed)

- 1 patch rejected: chunk-00001's duplicate-tail `delete` set
  `expected_occurrences: 2` to express "delete the second copy of a
  segment" — but that field counts target-sense resolutions, and
  `delete` segments must be unique in the definition. Entry A00018
  auto-re-dispositioned `needs_human_judgment` with the reject
  logged ([rejects.jsonl](rejects.jsonl)).

## Escalation queue (10)

| Rid | Disposition | Finding |
| --- | --- | --- |
| A00018 | needs_human_judgment | duplicated tail; patch rejected at ingest (see above) |
| A00051 | needs_print_check | unclosed `(ed. …` parenthetical |
| A00085-adjacent (A00144) | needs_human_judgment | duplicate anchor in `language_reference` (outside sense scope) |
| A00112 | needs_print_check | `)` with no matching `(` |
| A00150 | needs_human_judgment | nested duplicate anchor in `language_reference` |
| A00165 | needs_print_check | stray `)` — likely lost text |
| A00172 | needs_human_judgment | duplicated 14-item `refs` block |
| A00174 | needs_print_check | `(b. h., ` never closed |
| A00195 | needs_print_check | missing `(` in `(v. X)` convention |
| A00203 | needs_print_check | missing `)` before "lead" |

## Feedback → prompt/catalog v2 (fold at next revision)

1. Clarify `expected_occurrences` semantics (target-sense count,
   not segment copies) and add the convention: make `delete`/`move`
   segments unique by extending them with surrounding context.
2. Name the nested/duplicate-anchor defect class once
   (`duplicate-anchor-wrap`) — it recurred in 4 chunks; chunk-4's
   corpus scan estimates ~1,220 affected entries (~3.75%), mostly
   in `language_reference` (outside patch scope) — strong
   deterministic-script candidate for Task 9 instead of per-entry
   patches.
3. Catalog-v2 candidates from verification: wrong anchor link
   targets (A00173: display אַבְנֵי → href אַדְנֵי), bare RTL
   Hebrew outside `dir="rtl"` wrappers (~4,900 senses, systemic),
   duplicated `refs` blocks (A00172).
4. Known non-defects to document: `language_code` parenthetical
   closing inside first sense (cross-field convention); missing
   terminal period on cross-reference senses (7,455 of 9,114 —
   corpus convention, not loss).
5. Micro-losses (single dropped bytes like A00074's period) are
   detectable mainly via parallel-formula comparison — consider a
   deterministic formula-consistency check rather than relying on
   per-entry agent attention.

## Acceptance

- **Thresholds (maintainer, 2026-08-13):** for scaled tranches
  (Task 8), a tranche is halted and re-swept when its sampled
  error rate exceeds **5%** or its clean-sample miss rate exceeds
  **2%**.
- **Decision (maintainer, 2026-08-13):** pilot **accepted** and
  committed. The pilot's own 33.3% figure (1 of 3, classification
  label only, repair bytes verified correct) was reviewed and
  accepted as a small-sample artifact; the thresholds above govern
  the scaled tranches, where samples are larger. Feedback items
  fold into prompt/catalog v2 before Task 8.
