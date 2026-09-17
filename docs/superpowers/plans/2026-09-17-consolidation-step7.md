# Consolidation Step 7 — Slug Freezing Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers-extended-cc:subagent-driven-development (recommended) or superpowers-extended-cc:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** A slug, once assigned, never moves and is never handed to a
different entry, so a rule change cannot rewrite a published URL. Every
collision family's bare stem reaches its first member.

**Architecture:** `data/slug-index/entries.jsonl` is generated once from
the committed entry tree — which the positive control below shows is
exactly what from-scratch assignment produces, so the file records
today's state and changes nothing. `assignSlugs` gains a second
argument, the prior assignment: a rid with a row keeps its slug, and
only rids without one are assigned, taking the lowest unused number in
their family. `aliases.jsonl` points each shared stem at the member
holding `stem-1`. Gate 6 keeps checking uniqueness and drops its
bare-slug clause for families holding a frozen member. Entry-data
validation gains a both-ways check between each entry's `slug` and its
index row, so the duplication is held by a gate rather than by
discipline.

**Tech Stack:** Bun 1.3.14, TypeScript, `bun:test`, Biome, JSONL.

**Spec:** `docs/specs/2026-09-13-pipeline-consolidation-design.md` R10,
R11, §1.1, §5.1, §7, §10, §11 step 7.

## Measured baseline (at `84282aba`)

| Measure | Value |
|---|---|
| entry files | 32,512 |
| distinct slugs | 32,512 (no duplicate) |
| collision families | 4,407 (sizes 2–13) |
| numbered collision members | 11,626 (36%) |
| `entries.jsonl`, rid-sorted | 32,512 rows, 1.73 MB (seeded) |
| `aliases.jsonl`, slug-sorted | 4,407 rows, 0.15 MB (seeded) |
| unit tier, `bun qa:test` | 1,297 pass, 0 fail, 81 files, 2.04 s |
| `migrate` dry run | ~2 min, nine gates green |

## Why this is worth doing (maintainer's challenge, 2026-09-17)

The challenge was fair: Jastrow is a closed 1903 text, Sefaria will not
add entries, rids come from the export and run dense and contiguous —
so why build for renumbering? Answer: the hazard is not Sefaria, it is
us. **Measured:** assigning from the *source* headwords instead of the
composed ones moves **6,570 slugs, 20% of the corpus**.

```text
sourceForms=32512 problems=0 differ=6570
   A00010: committed=אאלר״ן  fromSource=אאלר"ן   gershayim normalisation
   A00013: committed=אב-2    fromSource=אב-I     homograph extraction
   A00001: committed=א-2     fromSource=א-²      superscript homograph
```

That figure is the *surface*, not a prediction: it is how much of the
slug space depends on headword-spelling rules still being revised
(step 8, the ported judgment-class detectors, the 309 unparsed
headwords). The rid-renumbering contingency was dropped from this plan
as a result; `_id` as a fallback identity is not built.

**`data/page-index/build-report.json` does not confirm the entry count.**
`entriesTotal: 32512` is Sefaria's figure echoed back: the build "does
not try to *recognise* headwords", it aligns Sefaria's entries against
the hOCR (README §Method, step 1). `entriesPlaced == entriesTotal` is
coverage — every Sefaria entry found a column — not completeness. What
the file *does* support is rid density: 22 contiguous letter runs, no
gaps. An independent count would need a separate digitisation such as
Dukhrana's; not blocking.

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
needs a predicate shown to fire. Dropping one member of the `אב` family
and recomputing from scratch:

```text
dropped=A00013 (אב-2) moved=3
   A00014: אב-3 -> אב-2   A00015: אב-4 -> אב-3   A00016: אב-5 -> אב-4
freed for reissue: אב-5 held=false
```

## Global Constraints

- **No entry data changes.** Nothing under `data/entries/` changes. The
  only new committed data is `data/slug-index/`.
- **The dry run must not move.** After every task,
  `bun pipeline:migrate` (dry) reports nine green gates and rule counts
  byte-identical to `docs/v2/migration-blessing.md`. `gate slugs` stays
  `32512/32512`.
- **R11 is not in this step.** The `--write` empty-tree refusal stays as
  it is. Freezing works under it regardless: the index is outside
  `data/entries/`, so it survives an empty tree.
- **NFC, never byte-exact.** Slugs and stems are Hebrew. The index is
  written and read in NFC; a lookup normalises the query and never
  normalises stored text.
- **Every commit:** `bun qa` green, `git commit -s`, subject ≤ 50 chars
  in the project's emoji format, `Co-Authored-By: Claude Opus 5`.

## Task 1 — Generate and commit the slug index

**Goal:** `data/slug-index/` exists, recording today's assignment.

- [ ] Write `admin/pipeline/migrate/slug-index.ts`: `loadSlugIndex()`,
      `writeSlugIndex(rows)`, `loadAliases()`, and the row types —
      `{rid, slug, status}` with `status: 'live' | 'retired'`, and
      `{slug, rid}` for an alias. Rid-sorted, NFC, one JSON object per
      line, matching `data/page-index/entries.jsonl`'s style.
- [ ] Add a one-shot generator, `bun admin/pipeline/migrate/seed-slug-index.ts`,
      reading `data/entries/`. It refuses if either file exists — seeding
      is a one-time act; after this task the pipeline maintains them.
      Not a `package.json` script: it runs once, and step 6 cut that file
      from 25 scripts to 13.
- [ ] Run it; commit `entries.jsonl` (32,512 rows) and `aliases.jsonl`
      (4,407 rows).
- [ ] Write `data/slug-index/README.md`: what a slug is, that a
      published slug never changes (R10), the `status` values, what an
      alias is, and that these are pipeline inputs rather than derived
      artifacts to regenerate by hand.

**Verify:** `entries.jsonl` has 32,512 lines, every `status` is `live`;
`aliases.jsonl` has 4,407, each pointing at a rid whose slug ends `-1`;
no alias slug collides with a real slug (measured 0 today). `bun qa`
green.

## Task 2 — `assignSlugs` takes prior assignments

**Goal:** the assigner freezes what it is given and assigns only the rest.

- [ ] Signature becomes
      `assignSlugs(forms, prior: ReadonlyMap<string, string>)`. A rid in
      `prior` keeps that slug, whatever its current stem.
- [ ] A rid not in `prior` takes the bare stem if unheld, else the
      lowest unused number in its family. "Family" means every slug
      whose stem matches, from `prior` and this run together; a reserved
      (`retired`) slug counts as held.
- [ ] Return new assignments distinctly from frozen ones, so the caller
      emits a row per newly assigned rid without re-deriving which.
- [ ] Update the module doc comment: "assigned once, then frozen" is
      true only now.

**Tests** (`migrate/slug.test.ts`, unit tier):

- [ ] an empty `prior` reproduces today's behaviour (the existing two
      tests, bodies unchanged, `new Map()` passed)
- [ ] a frozen rid keeps its slug when its headword is respelled
- [ ] a new rid joining a frozen family takes the next free number and
      moves nobody
- [ ] a new rid whose stem is held by one frozen entry takes `stem-1`,
      and the incumbent keeps the bare slug
- [ ] a retired row's slug is not reissued
- [ ] an empty stem is still reported by rid, never thrown

**Verify:** `bun qa:test` green; dry run unmoved.

## Task 3 — `migrate` reads the index and reports

**Goal:** a run freezes, and says what it did.

- [ ] `buildIndexes` loads the index and passes it to `assignSlugs`.
- [ ] New rids get an alias when they form a new family; existing
      aliases are never re-pointed.
- [ ] New report rows, `bucket: 'review'`, `severity: 'review'`:

| kind | When |
|---|---|
| `slug-new` | a rid assigned a slug this run |
| `slug-frozen-stem-drift` | a frozen slug whose stem no longer matches its entry's headword |
| `slug-bare-held` | a family whose bare name is a member's real slug, so no alias is possible |

- [ ] One slug summary line beside the gate lines: new, drifted, aliases.
- [ ] P00224 (`slug: "(עוזרד-²"` — a leading parenthesis from the source
      headword `(עוּזְרָד ²`) gets a review row, not a fix. The `²` is
      Sefaria's own homograph notation, so this is a headword-parsing
      question, not a freezing one.

**Verify:** on the committed source data `slug-new` and
`slug-frozen-stem-drift` are both 0 — the index and the corpus agree
exactly (positive control). Non-zero means they have diverged.

## Task 4 — Relax gate 6 for frozen families

- [ ] `checkSlugs` keeps its uniqueness check for every rid, unchanged.
- [ ] Its "a collided stem must not hold the bare slug" clause applies
      only to families with no frozen member; for a frozen one the
      condition is `slug-bare-held` (Task 3), not a failure.
- [ ] Pass the loaded index rather than re-deriving which rids are frozen.

**Tests** (`migrate/gates.test.ts`): the two existing slug tests keep
their bodies and gain the new argument; add one where a frozen incumbent
holds the bare slug of a two-member family and the gate passes, and one
where two rids hold the same slug and it still fails.

**Verify:** `gate slugs=32512/32512` on the dry run, unchanged.

## Task 5 — Entry data validation: slug ↔ index, both ways

**Goal:** the duplication is held by a gate, not a promise.

- [ ] In `migrate/validate.ts`, beside the existing page/page-index
      check: every entry's `slug` equals its index row's, every entry
      has a row, every `live` row has an entry. A `retired` row with no
      entry is correct; a `retired` row *with* one is a problem. Every
      alias points at an existing rid.
- [ ] It runs over the committed tree from `migrate/truth.test.ts` in
      `bun qa`, like the page check — so a hand edit or an admin-tool
      write that changes a slug fails CI.

**Verify:** `bun qa` green on the committed tree. Then plant a
one-character slug edit in one entry file, confirm the check fails and
names the rid, and revert. Record both outcomes in the PR body — a
validation gate not seen to fail has not been seen to work.

## Not in this step

| Item | Where it goes |
|---|---|
| R11: the atomic write, retiring the empty-tree guard | update-run spec (§10) |
| The three-way merge of §3.2 | update-run spec |
| Index maintenance on `--write` (append new rids, mark absent ones retired) | update-run spec, with R11 — under today's empty-tree guard there is nothing to append |
| Sefaria URL compatibility route | `docs/v2/url-routes.md` §1 |
| Bare-stem landing behaviour: redirect or disambiguation page | `docs/v2/url-routes.md` §2 |
| An independent entry count (Dukhrana) | unscheduled |
