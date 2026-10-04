# Jastrow Dictionary — Claude Guidance

## Project Overview

Marcus Jastrow's Dictionary of the Targumim, Talmud Babli, Yerushalmi
and Midrashic Literature, as a static site on Cloudflare at jastrow.app.

This branch (`v2`) is the overhaul, and what exists on it is the data
pipeline under `admin/pipeline/` and the entry contract under
`admin/entry/` (the checks every file under `data/entries/` meets).
**Neither the public app nor the admin tool has been written for v2
yet** — `app/` is a placeholder.

**The pipeline has been complete since 2026-09-22** (#116–#131).
Since then #132–#147 (to 2026-10-04) made the import a standalone
module, moved the entry contract out to `admin/entry/`, and closed the
2026-10-02 review's pipeline gaps (`docs/review-ledger.md`).
`compile.ts`, the admin tool and the app are the next efforts, and each
is separate work — a change to one is not a change to the pipeline.
Compile will be its own module, `admin/compile/`, importing only
`admin/entry/`; `app/` imports nothing under `admin/` (ruling
`10-04 compile home` in `docs/decisions.md`; Biome enforces both).

Rulings live in `docs/decisions.md`; a new ruling is a row there first.

## Tech Stack

- **Runtime:** Bun 1.3.14
- **Language:** TypeScript
- **Lint/format:** Biome 2.5.2
- **Hosting:** Cloudflare
- **Fonts** (for the app, when it is written): Lexend (headings),
  Atkinson Hyperlegible Next (body), dyslexia-hebrew-extended (Hebrew)
- **Icons** (same): Font Awesome Pro

## Quality Gate

Before every commit, run:

```bash
bun qa
```

That is `biome format --write`, `biome check --error-on-warnings`, the
unit test tier, and `tsc`. CI's Lint job runs `bun qa:ci`
(`biome ci --error-on-warnings`), which disagrees with plain
`biome check .` — use the scripts, not the bare tool.

`bun qa` does not check entry data. Since #141 the committed tree
under `data/entries/` is checked by `bun data:validate` (the entry
contract, `admin/entry/`), which is CI's Validate job.

## Test Tiers

`bun test` is split by filename. The split is a convention, not a
test: a corpus read left in a `*.test.ts` shows up as a slow CI
`Test` job.

| Tier | Files | Command | Where | Cost |
|---|---|---|---|---|
| Unit | `*.test.ts` | `bun qa:test` | `bun qa`; CI `Test` | ~2 s |
| Invariants | `transform/{commutation,registry.order}.corpus.test.ts` | `bun run transform:invariants` | local, before rule-code PRs | ~4 min |

Per-PR CI never reads `data/source/` (consolidation spec R9). Registering,
reclassifying or reordering a transform rule needs
`bun run transform:invariants` run locally — `bun qa` cannot see it.
A new corpus-reading test must be added to that script. The two research
corpus files that ran nowhere (`residue-sweep`, `implied-one-census`)
left with the research code in step 6.

## Branching & Commits

During the v2 overhaul, feature branches come off `v2` and PRs merge
into `v2`. Never commit directly to `v2` or `main`.

**Commit format:** `<emoji> <type>([scope]): <description>` — 50 char
max, imperative, lowercase. Types: `new` 🦄 / `improve` 🌈 / `fix` 🦠
/ `chore` 🧺 / `release` 🚀 / `doc` 📖 / `ci` 🚦

## Issues

An issue is one defect class or one decision, never a rid list (rid lists
live in generated docs; link the section). Never create, close, edit or
comment on an issue without the maintainer's explicit go in that session.
