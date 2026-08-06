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

After this work, an entry whose print shows senses `1)…2)…3)…` has
**structural** senses `1)`, `2)`, `3)` — regardless of whether
Sefaria's segmentation swallowed a boundary — and every numbering
recount residue is either zero or an enumerated, maintainer-signed
exception.

## 3. Scope

### 3.1 Swallowed-sense splitter (S1)

A rid-scoped structural repair pass (in the `repairs.ts` family,
running **after** the text passes so reinserted markers are already
in-text):

- For each listed rid, locate the sequence-gap-filling marker
  (`—N)` / `N)`) inside the host sense's definition.
- Cut at the marker: host keeps the text before it; a new sibling
  sense is created with `number` = the marker token and `definition`
  = the tail.
- **Round-trip proof (B9-grade):** for every split,
  `host.definition + sibling.number + sibling.definition` must
  reconstruct the pre-split bytes exactly. Fixtured per edge shape;
  unprovable cases quarantine to eyes-on, never silently into truth.

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
conventions incl. decision-preservation). Confirmed rows get the
implied-`1)` insert (recorded deviation, register #16) and — where
the `—2)` run is in-text — the S1 split. Rejected rows are recorded
with reasons.

### 3.4 Deferred-row resolution (S4)

D00470, K00081, R00519 leave `DEFERRED` in the same eyes-on pass:
each gets a maintainer decision (edit / split / signed exception)
recorded in doc 01 and code. `DEFERRED` must be empty when this work
closes.

### 3.5 Completeness gate (S5)

A committed test asserts:

- every rid in every `docs/v2/body-review/*` decision table appears
  in exactly one code disposition (the Q00997 gap class can't
  recur);
- migrate-dry recounts hit their targets: `brokenTopSequences = 0`,
  `startsAtTwo = 0`, or the exception list is literal in code with a
  doc pointer.

### 3.6 Disposition vocabulary (S6)

`CONFIRMED_NO_CHANGE` is retired. Replacement buckets say what they
mean: `SPLIT` (S1/S2 rids), `SIGNED_EXCEPTION` (maintainer accepts
the flaw, reason string required), plus the existing rid-keyed edit
maps. "No change" without a reason is no longer a representable
state.

### 3.7 Registered follow-ups (S7 — tracked, not implemented here)

Opened as GitHub issues so prose acknowledgment can't decay into
forgotten work:

1. Ibid linking pass — 15,421 ibid citations, 7,018 unlinked
   (design changelog 2026-08-05 "scope the post-migration linking
   pass").
2. `notes` mechanism for intentional print deviations (design
   changelog 2026-08-05 "new scope").
3. CP-1 carryovers for `migrate.ts`: the 3 ד-headword corrections
   (manual-correction layer) and the 289 page/column print-locator
   fixes ("migration rule 6", baseline deployed files).

## 4. Non-goals

- No corpus-wide heuristic splitting: S1/S2 stay rid-scoped to
  reviewed entries. A general detector beyond the S3 census is
  future work.
- No change to B4 unit segmentation, B8 quotes drop, or any blessed
  round-trip rule.
- The S7 items are tracked, not built.

## 5. Acceptance evidence

- Per-split byte round-trip: 100% of applied splits, fixture-tested
  and full-corpus verified via migrate-dry gates (all four existing
  round-trips stay 32,512/32,512 on the healed corpus).
- Recounts: `brokenTopSequences` 34 → 0 (or signed exceptions),
  `startsAtTwo` 8 → 0 (or signed exceptions), schema failures 0,
  label quarantines 0.
- Eyes-on: doc 08 generated, every row carries a maintainer
  decision; docs 01 updated where dispositions changed.
- S5 completeness test green in `bun qa`.
- Standing gate: maintainer personally reviews doc 08 and the split
  diffs before anything is blessed into truth.

## 6. Open questions for maintainer review

- **Q1 (numbering of new siblings):** keep the marker token verbatim
  as `number` (e.g. `—3)`) matching the label vocabulary Task 7
  normalized, or normalize on creation? Proposal: verbatim token —
  it round-trips and the label rules already handle it.
- **Q2 (S3 scope):** review all ~78 candidates now, or only those
  whose absence breaks a sequence? Proposal: all — the census is
  small and one pass closes the class.

## 7. Changelog

| Date | Change |
|---|---|
| 2026-08-06 | Initial draft from the PR #36 decision-audit findings |
