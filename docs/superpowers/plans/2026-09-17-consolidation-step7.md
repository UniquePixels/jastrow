# Consolidation Step 7 — Slug Freezing Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers-extended-cc:subagent-driven-development (recommended) or superpowers-extended-cc:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** A slug, once assigned, never moves and is never handed to a
different entry. The assignment lives in a committed index that the
pipeline reads as an input, so a rebuild keeps every published URL and
a deleted entry's slug stays reserved.

**Architecture:** `data/slug-index/entries.jsonl` is generated once from
the committed entry tree — which the positive control below shows is
exactly what from-scratch assignment produces, so the file records
today's state and changes nothing. `assignSlugs` gains a second
argument, the prior assignment: a rid with a row keeps its slug, and
only rids without one are assigned, taking the lowest unused number in
their family. Gate 6 keeps checking uniqueness for every rid and drops
its bare-slug clause for families holding a frozen member, which emits
a review row instead. Entry-data validation gains a both-ways check
between each entry's `slug` and its index row, so the duplication is
held honest by a gate rather than by discipline. A `--write` run
rewrites the index: rows preserved, new rids appended, absent rids
marked `retired`.

**Tech Stack:** Bun 1.3.14, TypeScript, `bun:test`, Biome, JSONL.

**Spec:** `docs/specs/2026-09-13-pipeline-consolidation-design.md` R10,
R11, §1.1, §5.1, §7, §10, §11 step 7.

## Measured baseline (at `84282aba`)

| Measure | Value |
|---|---|
| entry files | 32,512 |
| distinct slugs | 32,512 (no duplicate) |
| numbered collision members | 11,627 (36%) |
| prospective index, JSONL rid-sorted | 1.30 MB |
| unit tier, `bun qa:test` | 1,297 pass, 0 fail, 81 files, 2.04 s |
| `migrate` dry run | ~2 min, nine gates green |

**rid is upstream, not ours.** Every source record in
`data/source/jastrow-dictionary.jsonl` carries its own `rid`
(`{"_id":{"$oid":…},"headword":"א","rid":"A00000",…}`); the pipeline
never constructs one. That is what makes a rid-keyed index sound: a new
Sefaria entry arrives with a new rid and the existing ones keep theirs.
**Residual risk, not addressed here:** the rid space is dense with no
gaps in `A00000`–`A00099`, which is what a positional numbering looks
like. If Sefaria ever renumbers on re-export, a rid-keyed index cannot
survive it and the `_id` oid becomes the identity to fall back to. The
run would notice — thousands of `slug-new` rows at once — but nothing
here repairs it. Pinned for the update-run spec.

## Controls

Both were run before this plan was written, against the committed tree.

**Positive — freezing is a no-op today.** `assignSlugs` re-run from the
committed entry files' own headwords reproduces every committed slug:

```text
forms=32512 assigned=32512 problems=0 differ=0
```

So the generated index is a record, not a change, and any movement in a
dry run after this step is a bug in the freezing logic.

**Negative — the probe can fire.** `differ=0` is a clean nothing, so it
needs a predicate that is shown to fire. Dropping one member of the `אב`
family and recomputing from scratch:

```text
dropped=A00013 (אב-2) moved=3
   A00014: אב-3 -> אב-2
   A00015: אב-4 -> אב-3
   A00016: אב-5 -> אב-4
freed for reissue: אב-5 held=false
```

That is both the control and the hazard R10 names: one deletion moves
three published URLs and frees a fourth for a different word.

## Global Constraints

- **No entry data changes.** Nothing under `data/entries/` changes in
  this step. The only new committed data is `data/slug-index/`.
- **The dry run must not move.** After every task,
  `bun pipeline:migrate` (dry) reports nine green gates and rule counts
  byte-identical to `docs/v2/migration-blessing.md`. `gate slugs` stays
  `32512/32512`.
- **R11 is not in this step.** The `--write` empty-tree refusal stays
  exactly as it is. Freezing works under it regardless: the index is
  outside `data/entries/`, so it survives an empty tree.
- **NFC, never byte-exact.** Slugs and stems are Hebrew. The index is
  written and read in NFC; a lookup normalises the query and never
  normalises stored text.
- **Every commit:** `bun qa` green, `git commit -s`, subject ≤ 50 chars
  in the project's emoji format, `Co-Authored-By: Claude Opus 5`.

## Task 1 — Generate and commit the slug index

**Goal:** `data/slug-index/entries.jsonl` exists, recording today's
assignment, with a README beside it as `data/page-index/` has.

- [ ] Write `admin/pipeline/migrate/slug-index.ts`: `loadSlugIndex()`,
      `writeSlugIndex(rows)`, and the `SlugRow` type
      (`{rid, slug, status}`, `status: 'live' | 'retired'`). Rows are
      rid-sorted and NFC. One JSON object per line, matching
      `data/page-index/entries.jsonl`'s style.
- [ ] Add a one-shot generator behind `bun run slug-index:seed` that
      reads `data/entries/` and writes the file. It refuses if the file
      already exists — seeding is a one-time act, and after this task
      the pipeline maintains it.
- [ ] Run it; commit the 32,512-row file.
- [ ] Write `data/slug-index/README.md`: what a slug is, that a
      published slug never changes (R10), the `status` values, and that
      the file is a pipeline input, not a derived artifact to be
      regenerated by hand.

**Verify:** the file has 32,512 lines, every `status` is `live`, and
every row's `slug` equals the entry file's — asserted, not eyeballed,
by the Task 5 gate once it exists. `bun qa` green.

## Task 2 — `assignSlugs` takes prior assignments

**Goal:** the assignment function freezes what it is given and assigns
only the rest.

- [ ] Change the signature to
      `assignSlugs(forms, prior: ReadonlyMap<string, string>)`. A rid
      in `prior` keeps that slug, whatever its current stem.
- [ ] A rid not in `prior` takes the bare stem if no one holds it, else
      the lowest unused number in its family. Frozen members never move.
      "Family" means every slug whose stem matches, from `prior` and
      from this run's assignments together — a reserved (`retired`) slug
      counts as held.
- [ ] Return the new assignments distinctly from the frozen ones, so
      the caller can emit one row per newly assigned rid without
      re-deriving which is which.
- [ ] Update the module doc comment: "assigned once, then frozen" is
      true only now.

**Tests** (`migrate/slug.test.ts`, unit tier):

- [ ] an empty `prior` reproduces today's behaviour (the existing two
      tests, unchanged in body, with `new Map()` passed)
- [ ] a frozen rid keeps its slug when its headword is respelled
- [ ] a new rid joining a frozen family takes the next free number and
      moves nobody
- [ ] a new rid whose stem is held by one frozen entry takes `stem-1`,
      and the incumbent keeps the bare slug
- [ ] a retired row's slug is not reissued to a new rid
- [ ] an empty stem is still reported by rid, never thrown

**Verify:** `bun qa:test` green; dry run unmoved.

## Task 3 — `migrate` reads the index and reports

**Goal:** a run freezes, and says what it did.

- [ ] `buildIndexes` loads the index and passes it to `assignSlugs`.
- [ ] New report rows, all `bucket: 'review'`, `severity: 'review'`:

| kind | When |
|---|---|
| `slug-new` | a rid assigned a slug this run |
| `slug-frozen-stem-drift` | a frozen slug whose stem no longer matches the entry's headword |
| `slug-bare-held` | a collision family whose bare slug is held by a member, so no disambiguation slug is free |
| `slug-retired` | an index row whose rid is absent from this run |

- [ ] The run prints a one-line slug summary beside the existing gate
      lines: new, drifted, retired.

**Verify:** on the committed source data all four counts are 0, because
the index and the corpus agree exactly (positive control). A non-zero
count here means the index and the tree have diverged.

## Task 4 — Relax gate 6 for frozen families

**Goal:** the gate still catches a real collision and stops failing on
the deliberate scars freezing creates.

- [ ] `checkSlugs` keeps its uniqueness check for every rid, unchanged.
- [ ] Its "a collided stem must not hold the bare slug" clause applies
      only to families with no frozen member. For a family with one, the
      condition is reported as `slug-bare-held` (Task 3), not a failure.
- [ ] `checkSlugs` needs to know which rids are frozen; pass the loaded
      index rather than re-deriving it.

**Tests** (`migrate/gates.test.ts`): the two existing slug tests keep
their bodies and gain the new argument; add one where a frozen
incumbent holds the bare slug of a two-member family and the gate
passes, and one where two rids hold the same slug and it still fails.

**Verify:** `gate slugs=32512/32512` on the dry run, unchanged.

## Task 5 — Entry data validation: slug ↔ index, both ways

**Goal:** the duplication is held by a gate, not a promise.

- [ ] In `migrate/validate.ts`, beside the existing page/page-index
      check: every entry's `slug` equals its index row's, every entry
      has a row, and every `live` row has an entry. A `retired` row with
      no entry is correct; a `retired` row *with* one is a problem.
- [ ] It runs over the committed tree from `migrate/truth.test.ts` in
      `bun qa`, like the page check — so a hand edit or an admin-tool
      write that changes a slug fails CI.

**Verify:** `bun qa` green on the committed tree. Plant a one-character
slug edit in one entry file, confirm the check fails and names the rid,
then revert. Record both outcomes in the PR body — a validation gate
that has not been seen to fail has not been seen to work.

## Task 6 — `--write` maintains the index

**Goal:** a write run leaves the index correct for the next run.

- [ ] After a successful write, rewrite the index: existing rows kept
      as they are, new rids appended, rids absent from this run set to
      `status: "retired"`. A retired row's slug is never removed.
- [ ] The dry run writes nothing, as now.

**Verify:** on a scratch copy, run `--write` against an emptied tree
with the index in place; the written entry files carry the same slugs
as the committed ones. This exercises the freezing path that matters
most, and it is the reason the index is a separate file (R10, §7.1).

## Task 7 — Documents

- [ ] `admin/pipeline/README.md`: the slug index in the inputs list.
- [ ] `docs/glossary.md`: slug, slug index, frozen, retired.
- [ ] `docs/v2/review-queue.md` if the new row kinds belong there when
      step 9 writes it — note only, no work here.

**Verify:** `bun qa` green; every path cited in a document exists.

## Not in this step

| Item | Where it goes |
|---|---|
| R11: the atomic write, retiring the empty-tree guard | update-run spec (§10) |
| The three-way merge of §3.2 | update-run spec |
| Sefaria renumbering rids; `_id` as fallback identity | update-run spec (see baseline) |
| A disambiguation page for a family whose bare slug is held | app work, once `slug-bare-held` rows exist to size it |
