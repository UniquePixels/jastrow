# Jastrow Dictionary — Claude Guidance

## Project Overview

Marcus Jastrow's Dictionary of the Targumim, Talmud Babli, Yerushalmi
and Midrashic Literature, as a static site on Cloudflare at jastrow.app.

This branch (`v2`) is the overhaul, and what exists on it is the data
pipeline under `admin/pipeline/`. **Neither the public app nor the
admin tool has been written for v2 yet** — `app/` is a placeholder.

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
