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

| Tier | Files | Command | Cost |
|---|---|---|---|
| Unit | `*.test.ts` | `bun qa:test` | sub-second |
| Corpus | `*.corpus.test.ts` | `bun run audit:corpus` | ~7–8 min |

A corpus-tier file streams all 32,512 entries of
`data/source/jastrow-dictionary.jsonl`. If a new test needs the corpus,
name it `*.corpus.test.ts` and take its stages from
`admin/pipeline/transform/rules/corpus-fixture.ts` — never re-read the
snapshot, and never mutate the shared arrays.

## Branching & Commits

Feature branches off `main`. Never commit directly to `main`.

**Commit format:** `<emoji> <type>([scope]): <description>` — 50 char
max, imperative, lowercase. Types: `new` 🦄 / `improve` 🌈 / `fix` 🦠
/ `chore` 🧺 / `release` 🚀 / `doc` 📖 / `ci` 🚦
