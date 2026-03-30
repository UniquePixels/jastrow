# Jastrow Dictionary — Claude Guidance

## Project Overview

A progressive web app for browsing Marcus Jastrow's Dictionary of the
Targumim, Talmud Babli, Yerushalmi and Midrashic Literature.
Vanilla JavaScript, no framework, no bundler. Deployed as a static
site on Cloudflare Pages at jastrow.app.

## Rules

Before writing or modifying code that uses Web Awesome components, read
the relevant component docs at `~/.claude/skills/webawesome/references/components/<component-name>.md`.

## Tech Stack

- **Runtime:** Browser (vanilla JS, no build step)
- **Components:** Web Awesome (loaded via CDN kit)
- **Icons:** Font Awesome Pro (CDN kit)
- **Fonts:** Lexend (headings), Atkinson Hyperlegible Next (body)
- **Data:** JSONL dictionary files loaded into IndexedDB
- **Hosting:** Cloudflare Pages (static, no server)
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

## Key Architecture

- `index.html` — Single-page app shell
- `sw.js` — Service worker (cache-first for assets, network-first for
  app files, IDB for data)
- `assets/scripts/app.js` — Main app logic, routing, UI
- `assets/scripts/data-loader.js` — JSONL parsing, IndexedDB storage
- `assets/scripts/scroll-manager.js` — Bidirectional infinite scroll
  with offscreen staging
- `assets/scripts/sages*.js` — Talmudic sages graph/sidebar
- `data/admin/` — Local-only Bun annotation server (not deployed)

## Conventions

- No `var` — use `const`/`let`
- DOMPurify for all user-content rendering (loaded via CDN with SRI)
- Hash-based routing (`#headword`, `#rid:ID`, `#sages`, etc.)
- Service worker bypasses data files — IndexedDB handles persistence
- Web Awesome components render async — use offscreen staging pattern
  for scroll prepends (see `scroll-manager.js`)
