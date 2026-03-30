# Spec: Separate Jastrow Dictionary into Standalone Repository

**Date:** 2026-03-30
**Status:** Draft
**Domain:** jastrow.app
**Repository:** UniquePixels/jastrow (public)

## Overview

Extract the Jastrow Dictionary PWA from `uniquepixels.xyz/talmud/` (a
subdirectory of the personal website repo) into its own public GitHub
repository deployed to `jastrow.app` via Cloudflare Pages.

## Goals

1. Standalone public repo with full tooling, docs, and CI
2. Deploy to `jastrow.app` via Cloudflare Pages (Git integration)
3. 301 redirect from old URLs (`uniquepixels.xyz/talmud/*`,
   `uniquepixels.xyz/jastrow/*`) to `jastrow.app/*`
4. Meaningful git history via squashed milestone commits
5. Migrate Claude Code memories to new project directory
6. Clean up parent site repo

## Non-Goals

- No code refactoring or feature additions
- No architectural changes to the app
- No build toolchain (remains a static site)

---

## 1. Repository Structure

```
jastrow/
├── .cfignore
├── .claude/
│   └── CLAUDE.md
├── .coderabbit.yaml
├── .commitlintrc.ts
├── .editorconfig
├── .github/
│   ├── actions/
│   │   └── setup-env/
│   │       └── action.yml
│   └── workflows/
│       ├── ci-lint.yml
│       ├── ci-codeql.yml
│       └── ci-scorecard.yml
├── .gitignore
├── .mise.toml
├── CODE_OF_CONDUCT.md
├── CONTRIBUTING.md
├── DCO
├── LICENSE
├── README.md
├── SECURITY.md
├── _headers
├── biome.json
├── assets/
│   ├── images/
│   │   └── favicon/
│   │       └── site.webmanifest
│   ├── scripts/
│   └── styles/
├── data/
│   ├── admin/
│   ├── raw/
│   ├── jastrow-part1.jsonl
│   ├── jastrow-part2.jsonl
│   ├── jastrow-abbr.json
│   ├── jastrow-hebrew-abbr.json
│   ├── sages.json
│   └── version.json
├── docs/
│   └── orchestra/
│       ├── SETLIST.md
│       ├── specs/
│       └── plans/
├── index.html
└── sw.js
```

### Deploy exclusions (`.cfignore`)

These directories/files are in the repo but excluded from Cloudflare
Pages deployment:

```
data/admin/
data/raw/
docs/
.claude/
.github/
.vscode/
biome.json
.commitlintrc.ts
.editorconfig
.mise.toml
CODE_OF_CONDUCT.md
CONTRIBUTING.md
DCO
SECURITY.md
```

### Files NOT carried over from current project

- `.superpowers/` — Legacy artifact, predates orchestra workflow
- `.worktrees/` — Transient build artifact
- `data-processing/` — If present, not part of the app

---

## 2. Git History Strategy

Squash commits by milestone to preserve meaningful history without
noise from the parent site repo. Approximate milestones:

1. **Initial application** — Core dictionary viewer, search, data
   loading, service worker, PWA setup
2. **Infinite scroll** — Bidirectional scroll with offscreen staging,
   page scanning
3. **Sages** — Sages graph, sidebar, data visualization
4. **Accessibility** — WCAG 2.1 AA refactor (focus, ARIA, keyboard,
   touch targets, reduced motion)
5. **Tooling & polish** — Atkinson Hyperlegible Next font, admin
   tooling, current state with all repo configs

Each milestone commit uses the current file state at that logical
boundary. The final commit reflects the current `main` plus all new
repo tooling/configs.

---

## 3. Code Changes (Path Updates)

The only code modifications are updating path prefixes from `/talmud/`
to `/` and domain references to `jastrow.app`.

### `sw.js`

- `STATIC_ASSETS` array: all `/talmud/` prefixes → `/`
- `isAppFile` pathname check: `"/talmud/"` → `"/"`

### `index.html`

- `<link rel="canonical">` → `https://jastrow.app/`
- `og:url` → `https://jastrow.app/`
- `twitter:url` → `https://jastrow.app/`
- JSON-LD `url` → `https://jastrow.app/`
- JSON-LD `urlTemplate` → `https://jastrow.app/#{headword}`

### `assets/images/favicon/site.webmanifest`

- `start_url`: `/talmud/` → `/`
- `scope`: `/talmud/` → `/`
- Shortcut URLs: `/talmud/#guide` → `/#guide`,
  `/talmud/#abbreviations` → `/#abbreviations`

### Files with NO changes

- `app.js` — Hash-based routing is path-agnostic
- All CSS files
- All data files
- All images

---

## 4. Tooling Configuration

### Biome (`biome.json`)

Simplified from the unicorn config for vanilla JS (no TypeScript):

- VCS integration with `.gitignore`
- Recommended lint rules + relevant complexity, style, suspicious
  subsets for browser JS
- Formatting: tabs, single quotes
- Override for `data/admin/**` to relax Node/Bun-specific rules
  (`noConsole`, `noProcessEnv`)

### CodeRabbit (`.coderabbit.yaml`)

Adapted from unicorn pattern:

- `language: en-US`, `early_access: true`
- `reviews.profile: assertive`
- `auto_title_instructions` with emoji commit format
- `base_branches: [main]`
- `fail_commit_status: true`
- `docstrings.mode: error`
- Path instructions for:
  - `assets/scripts/**` — Browser JS, no bundler, vanilla patterns
  - `data/admin/**` — Bun runtime, local dev tooling
  - `.github/**` — Pinned actions, harden runner, branch targeting

### commitlint (`.commitlintrc.ts`)

Config-only, no CI job. Identical to unicorn — provides VS Code
integration for commit message formatting with emoji types.

### EditorConfig (`.editorconfig`)

Identical to unicorn:

- Tabs, LF, UTF-8, trim trailing whitespace
- YAML files: 2-space indent

### mise (`.mise.toml`)

Pins Biome version only.

### CI Workflows

**`ci-lint.yml`** — On PR/push to `main`:

- Harden runner with egress blocking
- Biome lint check
- Single job, no matrix (no type check or tests needed)

**`ci-codeql.yml`** — On PR/push to `main` + weekly schedule:

- JavaScript + Actions analysis
- Same structure as unicorn

**`ci-scorecard.yml`** — On push to `main` + weekly schedule:

- OpenSSF Scorecard analysis
- Same structure as unicorn

All workflows use harden-runner with `egress-policy: block` and
pinned action versions with hash comments.

### Shared setup action (`.github/actions/setup-env/action.yml`)

- Checkout
- Install mise
- Install Biome via mise

---

## 5. Repository Documentation

### LICENSE

MIT license for code. Copyright 2026 UniquePixels.

### Data attribution notice

Add a `DATA_LICENSE.md` or a section in README noting:

- Dictionary data derived from Sefaria's digitization of Jastrow's
  Dictionary
- Sefaria content is CC-BY-NC
- Raw data in `data/raw/` retains original licensing

### README.md

- Project name, one-line description
- Live URL: `https://jastrow.app`
- Features list (searchable, offline-ready, cross-referenced
  abbreviations, sages graph)
- Screenshot/social image
- Tech stack (vanilla JS, Web Awesome, Cloudflare Pages)
- Local development instructions
- Data attribution
- License
- Contributing link

### Other docs

- `SECURITY.md` — Reporting instructions
- `CODE_OF_CONDUCT.md` — Contributor Covenant
- `CONTRIBUTING.md` — How to contribute, commit format, PR process
- `DCO` — Developer Certificate of Origin

---

## 6. Cloudflare Pages Setup

### New Pages project

- **Name:** `jastrow`
- **Production branch:** `main`
- **Build command:** (none)
- **Build output directory:** `/` (root)
- **Custom domain:** `jastrow.app`

Cloudflare Pages Git integration auto-deploys on push to `main`.
This project MUST be created via the Cloudflare dashboard (Git
integration requires OAuth handshake with GitHub).

### `_headers` (Cloudflare Pages headers)

Ported from parent site with updated paths:

- CSP: same policy (same CDN origins)
- Cache rules for `/data/jastrow-part1.jsonl` and
  `/data/jastrow-part2.jsonl` (replaces old single-file path)
- Standard cache rules for assets, HTML, root
- Security headers: X-Frame-Options, X-Content-Type-Options,
  Referrer-Policy, Permissions-Policy

### Redirects (old URLs)

Cloudflare Redirect Rules on the `uniquepixels.xyz` zone:

- `uniquepixels.xyz/talmud/*` → 301 → `https://jastrow.app/*`
- `uniquepixels.xyz/jastrow/*` → 301 → `https://jastrow.app/*`

Created AFTER confirming `jastrow.app` is live and functional.

---

## 7. Parent Site Cleanup

After confirming new deployment is live:

1. Remove `talmud` from `_config.yml` `include` list
2. Remove `talmud` references from `_config.yml` `exclude` list
3. Remove `_pages/jastrow.html` redirect page
4. Remove stale `/data/jastrow.jsonl` cache rule from `_headers`
5. Remove `talmud/` directory

---

## 8. Manual Configuration Checklist

### GitHub (after repo creation)

- [ ] Branch protection on `main`:
  - Require pull request reviews
  - Require status checks to pass (ci-lint, CodeQL)
  - Require conversation resolution
  - Consider: require signed commits
- [ ] Enable "Automatically delete head branches"
- [ ] Enable Dependabot security alerts
- [ ] Add CodeRabbit GitHub App to the repo

### Cloudflare (sequential)

- [ ] Create Pages project connected to `UniquePixels/jastrow`
- [ ] Set production branch to `main`, no build command, output dir `/`
- [ ] Add custom domain `jastrow.app`
- [ ] Verify DNS (CNAME `jastrow.app` → Cloudflare Pages)
- [ ] Confirm site loads at `https://jastrow.app`
- [ ] Create redirect rules on `uniquepixels.xyz` zone (via dashboard
      or Cloudflare API MCP once available)

---

## 9. Claude Code Memory Migration

Before switching to the new project directory:

1. Create memory directory at the new project's Claude Code path
   (e.g., `~/.claude/projects/-Users-brian-Repositories-websites-jastrow/memory/`
   — exact path depends on where the repo is cloned)
2. Migrate applicable memories:
   - `user_brian.md` — Update domain reference
   - `feedback_webawesome_docs.md` — Still relevant
   - `feedback_webawesome_tooltip.md` — Still relevant
   - `feedback_scroll_lessons.md` — Still relevant
   - `feedback_webawesome_label.md` — Still relevant
   - `project_llm_search.md` — Still relevant
3. Do NOT migrate:
   - `feedback_branch_not_main.md` — Specific to parent site context
4. Create new `MEMORY.md` index
5. Create `.claude/CLAUDE.md` in the new repo with project-specific
   instructions (vanilla JS, Cloudflare Pages, Biome, etc.)

---

## 10. Social Cover Image

Generate via Freepik AI image generator:

> A richly textured open ancient Talmud page with visible Aramaic text,
> softly illuminated by warm golden light. Clean modern design overlay
> with a circular empty placeholder (subtle light border) in the
> upper-left area for a logo. Title text in Lexend bold font: "Jastrow
> Dictionary". Subtitle in Atkinson Hyperlegible font below:
> "Searchable · Offline-Ready · Cross-Referenced". The composition blends
> antique scholarly warmth with contemporary minimalist design. Color
> palette: deep indigo, aged parchment gold, warm ivory. Aspect ratio
> 2:1 (1200x600), suitable for an Open Graph social media card. No
> people, no faces.

Place final image at `assets/images/social-cover.png` and reference
in `index.html` OG/Twitter meta tags.
