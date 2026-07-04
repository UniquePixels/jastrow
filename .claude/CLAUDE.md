# Jastrow Dictionary — Claude Guidance

## Project Overview

A progressive web app for browsing Marcus Jastrow's Dictionary of the
Targumim, Talmud Babli, Yerushalmi and Midrashic Literature. Deployed as a static site on Cloudflare at jastrow.app.


## Tech Stack

- **Runtime:** Browser
- **Components:** 
- **Icons:** Font Awesome Pro
- **Fonts:** Lexend (headings), Atkinson Hyperlegible Next (body), ??? (Hebrew)
- **Data:** 
- **Hosting:** Cloudflare
- **Lint:** Biome

## Quality Gate

Before every commit, run:

```bash
biome check .
```

## Branching & Commits

Feature branches off `main`. Never commit directly to `main`.

**Commit format:** `<emoji> <type>([scope]): <description>` — 50 char
max, imperative, lowercase. Types: `new` 🦄 / `improve` 🌈 / `fix` 🦠
/ `chore` 🧺 / `release` 🚀 / `doc` 📖 / `ci` 🚦
