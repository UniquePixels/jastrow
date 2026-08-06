# Sense Structure Repair — §6.0 Follow-up Design

- **Date:** 2026-08-06
- **Status:** Draft — pending maintainer review
- **Parent:** [2026-07-11-entry-body-model-design.md](2026-07-11-entry-body-model-design.md)
  (§6.0). Supersedes the `CONFIRMED_NO_CHANGE` disposition of the 01
  review and completes the numbering-repair story Task 16 started.
  Decision IDs here are S1–S7; the parent's B-numbers are unchanged.

## 1. Context

The 2026-08-06 decision audit (PR #36 review session) found one
systemic gap behind the Q00997 miss: **every Task 16 numbering repair
is a text-level byte edit; none restores sense structure.** The
migration report's own recounts prove it:

- `brokenTopSequences` after repair: **34** — ~13 marker-reinsert
  rids (their restored `1)` sits inline in sense text), ~18
  confirmed-no-change rids (swallowed `—N)` markers in-text), and the
  3 deferred rows.
- `startsAtTwo` after repair: **8** — six of which are entries that
  *received* a marker reinsert. The bytes now match print; the model
  still opens at sense 2.

Maintainer ruling (2026-08-06, verbatim intent): *"We need to make
sure that our pipeline is actually correcting the data, not just
accepting that the data is accurately flawed."* Print-fidelity of
text and correctness of structure are independent axes; the pipeline
must deliver both.

## 2. Goal

After this work, every entry in the **reviewed residue** (the 34
`brokenTopSequences` + 8 `startsAtTwo` survivors, the in-stem cases,
and the S3 census candidates the maintainer confirms) has
**structural** senses matching its print numbering — and every
numbering recount residue is either zero or an enumerated,
maintainer-signed exception. Entries outside the reviewed sets are
out of scope (§4): the recount detectors are the corpus-wide net,
and anything they catch later joins a future reviewed set rather
than being split heuristically.

## 3. Scope

### 3.1 Swallowed-sense splitter (S1)

A rid-scoped structural repair pass (in the `repairs.ts` family,
running **after** the text passes so reinserted markers are already
in-text):

- **Rid-keyed expectations, not search:** each listed rid carries the
  literal marker token expected (`—3)`), the host sense's address,
  and the expected occurrence count (normally exactly 1) — a wrong or
  moved marker fails loudly, exactly like the Task 16 find-text
  passes. The pass runs **after** the text passes as an executable
  precondition (reinserted markers must already be in-text), asserted
  in code, not by convention.
- Cut at the expected marker: host keeps the text before it; a new
  sibling sense is created with `number` = the marker token and
  `definition` = the tail, inserted at **host index + 1** in the same
  list (deterministic placement, not append).
- **Round-trip proof (B9-grade):** for every split,
  `host.definition + sibling.number + sibling.definition` must
  reconstruct the pre-split bytes exactly, **and** the resulting
  sense list must now read 1..n at the host's level — byte
  preservation alone can't vouch for structural placement, so both
  are asserted. Fixtured per edge shape (top-level and stem-child
  variants both); unprovable cases quarantine to eyes-on, never
  silently into truth.

Covers the ~31 non-deferred residue rids (the 01 swallowed-marker
and reinsert classes), rid-keyed and loud on drift, like every
Task 16 pass.

### 3.2 In-stem variant (S2)

Same rule where the host sense list is a stem's children (J00515's
Hifil `—4)`, the U01787 `Af.` shape). The splitter takes the same
`'top' | { stem }` addressing `IMPLIED_ONE` already uses.

### 3.3 Implied-`1)` candidate review (S3)

The in-text census behind `upstream-issues.md` #16 (~78 candidates,
unreviewed) becomes a generated eyes-on review doc
(`docs/v2/body-review/08-implied-one-candidates.md`, review.ts
conventions incl. decision-preservation). The census itself is
**committed as a literal rid list in code**, and a test asserts doc
08's row set equals that list exactly (count + set) — a generator
that drops candidates cannot pass. Confirmed rows get the
implied-`1)` insert (recorded deviation, register #16) and — where
the `—2)` run is in-text — the S1 split. Rejected rows land in the
`REJECTED` disposition bucket (S6) with their reasons, so they
participate in the S5 doc↔code equality like every other row.

### 3.4 Deferred-row resolution (S4)

D00470, K00081, R00519 leave `DEFERRED` in the same eyes-on pass:
each gets a maintainer decision (edit / split / signed exception)
recorded in doc 01 and code. `DEFERRED` must be empty when this work
closes.

### 3.5 Completeness gate (S5)

A committed test asserts, as **exact equalities** (coverage-only
checks can be satisfied by stale or duplicated entries):

- **Migration inventory manifest:** the pre-change inventory — the
  19 `CONFIRMED_NO_CHANGE` rids, the reinsert rids, and the 3
  `DEFERRED` rids as they stand on `v2` **before** this work — is
  committed as a literal manifest, and every manifest rid must map
  **exactly once** to `SPLIT`, `SIGNED_EXCEPTION`, or an applicable
  edit map. Without this, a rid deleted from both the doc and the
  code would pass the doc↔code equality below unnoticed. `REJECTED`
  is valid only for S3 census rows, never for manifest rids.
- **Doc↔code equality, explicitly scoped:** the rid-disposition
  tables — doc 01's broken-sequence tables and doc 08's census
  table (rid + Decision columns) — **equal** the union of code
  dispositions: no doc rid without a bucket (the Q00997 gap), no
  code rid without a doc row, and no rid in more than one bucket.
  The class-level review docs (02 orphans via the cite maps, 03
  quotes-drop, 05 sample, 06 binyan cleanup, 07 italic splits) are
  covered by their own existing class checks and are deliberately
  outside this equality — sweeping them in would fail the gate on
  unrelated, already-dispositioned work;
- `DEFERRED` is empty and `CONFIRMED_NO_CHANGE` no longer exists —
  their presence is itself a failure (S4/S6 enforced by assertion,
  not by intention);
- every `SIGNED_EXCEPTION` and `REJECTED` record carries a
  non-empty reason string, a doc pointer, **and maintainer-approval
  metadata** (the review date and the doc row that records the
  decision) — the acceptance test resolves the pointer and fails on
  a dangling or decision-less row, so "signed" is checkable, not
  honorific;
- migrate-dry recounts: **per detector**, the observed
  `brokenTopSequences` rid list equals that detector's own
  signed-exception set, and likewise `startsAtTwo` (target: both
  empty; the two residues are distinct sets — 34 and 8 today — so
  one shared list would let an exception for one detector break the
  other's equality).

### 3.6 Disposition vocabulary (S6)

`CONFIRMED_NO_CHANGE` is retired. Replacement buckets say what they
mean: `SPLIT` (S1/S2 rids), `SIGNED_EXCEPTION` (maintainer accepts
the flaw; reason + approval metadata required), `REJECTED` (an S3
census candidate the maintainer ruled is not an implied-`1)` case;
rejection reason required — so rejected doc-08 rows still land in
exactly one code bucket and the S5 equality holds), plus the
existing rid-keyed edit maps. "No change" without a reason is no
longer a representable state.

### 3.7 Registered follow-ups (S7 — tracked, not implemented here)

Opened as GitHub issues so prose acknowledgment can't decay into
forgotten work:

1. **#37** — Ibid linking pass: 15,421 ibid citations, 7,018
   unlinked (design changelog 2026-08-05 "scope the post-migration
   linking pass").
2. **#38** — `notes` mechanism for intentional print deviations
   (design changelog 2026-08-05 "new scope").
3. **#39** — CP-1 carryovers for `migrate.ts`: the 3 ד-headword
   corrections (manual-correction layer) and the 289 page/column
   print-locator fixes ("migration rule 6", baseline deployed
   files).

## 4. Non-goals

- No corpus-wide heuristic splitting: S1/S2 stay rid-scoped to
  reviewed entries. A general detector beyond the S3 census is
  future work.
- No change to B4 unit segmentation, B8 quotes drop, or any blessed
  round-trip rule.
- The S7 items are tracked, not built.

## 5. Acceptance evidence

- Per-split byte round-trip **and** structural placement (list reads
  1..n at the host's level): 100% of applied splits, fixture-tested
  (top-level and stem-child) and full-corpus verified via
  migrate-dry gates (all four existing round-trips stay
  32,512/32,512 on the healed corpus). Scope is the reviewed sets
  (§2) — the recount detectors, not a heuristic sweep, are the
  corpus-wide net.
- Recounts as exact rid-list equalities (S5), **per detector**:
  observed `brokenTopSequences` equals its own signed-exception set,
  observed `startsAtTwo` equals its own (target: both empty; today
  34 and 8), schema failures 0, label quarantines 0.
- Eyes-on: doc 08 generated, row set equal to the committed census
  list (S3), every row carries a maintainer decision; docs 01
  updated where dispositions changed.
- S5 completeness test green in `bun qa`, including resolution of
  every `SIGNED_EXCEPTION`/`REJECTED` approval pointer (S5).
- Standing gate: maintainer personally reviews doc 08, the split
  diffs, **and every signed-exception and rejection row** before
  anything is blessed into truth — the approval metadata those
  records carry is written during this review, not before it.

## 6. Resolved questions (maintainer, 2026-08-06)

- **Q1 (numbering of new siblings): verbatim token.** The maintainer
  asked what the schema and existing senses do; the architecture
  answers it. Source-layer `sense.number` holds raw print tokens
  (`"1)"`, `"—2)"`, `"*2)"` — all 10,186 existing labels); the B11
  truth schema stores the normalized `label`, and `parseLabel`/
  `printLabel` (B6, Task 7) convert with a byte-exact regeneration
  proof. New siblings store the verbatim token (e.g. `—3)`) and flow
  through the same machinery as every other sense — storing
  normalized would make them the corpus's only differently-shaped
  labels.
- **Q2 (S3 scope): all ~78 candidates.** One eyes-on pass closes the
  class; partial review would recreate the "acknowledged but
  unscheduled" pattern the audit exists to end.

## 7. Changelog

| Date | Change |
|---|---|
| 2026-08-06 | Initial draft from the PR #36 decision-audit findings |
| 2026-08-06 | PR #41 review hardening: goal narrowed to the reviewed sets; S1 gets rid-keyed marker expectations, executable text-pass precondition, host+1 placement, and a structural (1..n) assertion beside the byte proof; S3 census committed with doc-equality check; S5 gates become exact set equalities (incl. rejecting `DEFERRED`/`CONFIRMED_NO_CHANGE` and requiring exception reasons); S7 issue ids recorded (#37–#39) |
| 2026-08-06 | PR #41 review round 2: `REJECTED` disposition bucket added (S3 rejections join the S5 equality); signed exceptions and rejections carry maintainer-approval metadata resolved by the acceptance test; recount equalities become per-detector exception sets (`brokenTopSequences` vs `startsAtTwo`) |
| 2026-08-06 | PR #41 review round 3 (both outside-diff comments): S5 gains the committed pre-change migration-inventory manifest with one-to-one coverage (a rid deleted from doc and code alike can no longer pass silently; `REJECTED` restricted to S3 rows), and the doc↔code equality is explicitly scoped to the rid-disposition tables (01 + 08) with the class-level docs covered by their own checks |
