# Jastrow Dictionary — Claude Guidance

## Project Overview

A progressive web app for browsing Marcus Jastrow's Dictionary of the
Targumim, Talmud Babli, Yerushalmi and Midrashic Literature. Deployed as a static site on Cloudflare at jastrow.app.


## Tech Stack

- **Runtime:** Browser
- **Components:** 
- **Icons:** Font Awesome Pro
- **Fonts:** Lexend (headings), Atkinson Hyperlegible Next (body), dyslexia-hebrew-extended (Hebrew)
- **Data:** 
- **Hosting:** Cloudflare
- **Lint:** Biome

## Quality Gate

Before every commit, run:

```bash
bun qa
```

That is `biome format --write`, `biome check --error-on-warnings`, the
unit test tier, and `tsc`. CI's Lint job runs `bun qa:ci`
(`biome ci --error-on-warnings`), which disagrees with plain
`biome check .` — use the scripts, not the bare tool.

## Test Tiers

`bun test` is split by filename, and the split is enforced by
`admin/pipeline/test-tiers.test.ts`.

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

Feature branches off `main`. Never commit directly to `main`.

**Commit format:** `<emoji> <type>([scope]): <description>` — 50 char
max, imperative, lowercase. Types: `new` 🦄 / `improve` 🌈 / `fix` 🦠
/ `chore` 🧺 / `release` 🚀 / `doc` 📖 / `ci` 🚦
