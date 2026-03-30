# Jastrow Repository Separation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Extract the Jastrow Dictionary PWA into a standalone public repo at `UniquePixels/jastrow`, deployed to `jastrow.app` via Cloudflare Pages.

**Architecture:** Copy all app files from `talmud/` into a new repo at `/Users/brian/Repositories/websites/jastrow/`. Create squashed milestone commits for meaningful history. Update path prefixes (`/talmud/` → `/`), add tooling configs, CI workflows, and repo documentation. Push to GitHub, then manually connect Cloudflare Pages.

**Tech Stack:** Vanilla JS, Cloudflare Pages (static), Biome (lint), GitHub Actions (CI)

**Spec:** `docs/orchestra/specs/2026-03-30-repo-separation-spec.md`

---

### Task 1: Initialize new repo and copy application files

**Files:**
- Create: `/Users/brian/Repositories/websites/jastrow/` (new repo root)
- Copy from: `/Users/brian/Repositories/websites/brian/talmud/`

- [ ] **Step 1: Create the new repo directory and initialize git**

```bash
mkdir -p /Users/brian/Repositories/websites/jastrow
cd /Users/brian/Repositories/websites/jastrow
git init
```

- [ ] **Step 2: Copy all application files (excluding legacy artifacts)**

Copy everything from `talmud/` except `.superpowers/`, `.worktrees/`, `.DS_Store`, and the existing `.gitignore` (we'll write a new one). Preserve directory structure.

```bash
# From the talmud directory, copy app files
SRC=/Users/brian/Repositories/websites/brian/talmud
DEST=/Users/brian/Repositories/websites/jastrow

# Core app files
cp "$SRC/index.html" "$DEST/"
cp "$SRC/sw.js" "$DEST/"

# Assets (entire tree)
cp -R "$SRC/assets" "$DEST/"

# Data (entire tree including admin and raw)
cp -R "$SRC/data" "$DEST/"

# Docs (orchestra)
cp -R "$SRC/docs" "$DEST/"
```

- [ ] **Step 3: Remove `.DS_Store` files and the `.superpowers` leftover if copied**

```bash
find /Users/brian/Repositories/websites/jastrow -name '.DS_Store' -delete
find /Users/brian/Repositories/websites/jastrow -name 'favicon.svg.bak' -delete
```

- [ ] **Step 4: Verify the file tree looks correct**

```bash
find /Users/brian/Repositories/websites/jastrow -type f | sort
```

Expected: `index.html`, `sw.js`, all `assets/` files, all `data/` files (including `admin/` and `raw/`), all `docs/orchestra/` files. No `.superpowers`, `.worktrees`, `.DS_Store`.

---

### Task 2: Update path prefixes and domain references

**Files:**
- Modify: `sw.js`
- Modify: `index.html`
- Modify: `assets/images/favicon/site.webmanifest`

All work in `/Users/brian/Repositories/websites/jastrow/`.

- [ ] **Step 1: Update `sw.js` — replace `/talmud/` prefixes in STATIC_ASSETS**

Replace every `/talmud/` prefix with `/` in the `STATIC_ASSETS` array (lines 13–37). The array should look like:

```javascript
const STATIC_ASSETS = [
	"/",
	"/index.html",
	"/assets/styles/styles.css",
	"/assets/scripts/constants.js",
	"/assets/scripts/sanitizer.js",
	"/assets/scripts/keyboard.js",
	"/assets/scripts/data-loader.js",
	"/assets/scripts/app.js",
	"/assets/images/jastrow-mini.svg",
	"/assets/images/sefarialogo.svg",
	"/assets/images/favicon/favicon.svg",
	"/assets/images/favicon/favicon-96x96.png",
	"/assets/images/favicon/favicon.ico",
	"/assets/images/favicon/apple-touch-icon.png",
	"/assets/images/favicon/site.webmanifest",
	"/assets/styles/sages.css",
	"/assets/scripts/sages-data.js",
	"/assets/scripts/sages-graph.js",
	"/assets/scripts/sages-sidebar.js",
	"/assets/scripts/sages.js",
	"/assets/scripts/scroll-manager.js",
	"/data/sages.json",
	"/data/jastrow-abbr.json",
	"/data/jastrow-hebrew-abbr.json",
];
```

- [ ] **Step 2: Update `sw.js` — fix `isAppFile` pathname check**

Change lines 135–136 from:

```javascript
		url.pathname === "/talmud/" ||
		url.pathname === "/talmud";
```

To:

```javascript
		url.pathname === "/" ||
		url.pathname === "";
```

- [ ] **Step 3: Update `index.html` — domain and path references**

Replace all `uniquepixels.xyz/talmud/` references:

- Line 26: `og:url` content → `https://jastrow.app/`
- Line 32: `og:image` comment URL → `https://jastrow.app/assets/images/social-cover.png`
- Line 36: `twitter:url` content → `https://jastrow.app/`
- Line 42: `twitter:image` comment URL → `https://jastrow.app/assets/images/social-cover.png`
- Line 46: canonical `href` → `https://jastrow.app/`
- Line 102: JSON-LD `url` → `https://jastrow.app/`
- Line 112: JSON-LD `urlTemplate` → `https://jastrow.app/#{search_term_string}`

- [ ] **Step 4: Update `assets/images/favicon/site.webmanifest`**

Replace `/talmud/` with `/` in three places:

```json
{
  "start_url": "/",
  "scope": "/",
  ...
  "shortcuts": [
    {
      "name": "Entry Guide",
      "url": "/#guide",
      "description": "How to read dictionary entries"
    },
    {
      "name": "Abbreviations",
      "url": "/#abbreviations",
      "description": "Dictionary abbreviation reference"
    }
  ]
}
```

- [ ] **Step 5: Verify no remaining `/talmud/` references**

```bash
cd /Users/brian/Repositories/websites/jastrow
grep -rn '/talmud/' --include='*.js' --include='*.html' --include='*.json' .
```

Expected: No matches.

---

### Task 3: Create tooling configuration files

**Files:**
- Create: `.gitignore`
- Create: `.cfignore`
- Create: `.editorconfig`
- Create: `.mise.toml`
- Create: `biome.json`
- Create: `.commitlintrc.ts`

All files created in `/Users/brian/Repositories/websites/jastrow/`.

- [ ] **Step 1: Create `.gitignore`**

```
.DS_Store
Thumbs.db
node_modules/
.claude/settings.local.json
.worktrees/
```

- [ ] **Step 2: Create `.cfignore`**

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

- [ ] **Step 3: Create `.editorconfig`**

```ini
root = true

[*]
indent_style = tab
end_of_line = lf
charset = utf-8
trim_trailing_whitespace = true
insert_final_newline = true

[*.{yml,yaml}]
indent_style = space
indent_size = 2

[*.md]
trim_trailing_whitespace = false
```

- [ ] **Step 4: Create `.mise.toml`**

```toml
[tools]
biome = "2.4.6"
```

- [ ] **Step 5: Create `biome.json`**

```json
{
	"$schema": "./node_modules/@biomejs/biome/configuration_schema.json",

	"vcs": {
		"enabled": true,
		"clientKind": "git",
		"useIgnoreFile": true
	},
	"files": {
		"ignoreUnknown": true,
		"includes": ["**/*.js", "**/*.ts", "**/*.json", "**/*.html"]
	},
	"assist": { "actions": { "source": { "organizeImports": "on" } } },
	"linter": {
		"enabled": true,
		"rules": {
			"recommended": true,
			"complexity": {
				"noExcessiveCognitiveComplexity": "on",
				"noForEach": "on",
				"useSimplifiedLogicExpression": "on",
				"useWhile": "on"
			},
			"correctness": {
				"noUndeclaredVariables": "on"
			},
			"style": {
				"noNegationElse": "on",
				"noNestedTernary": "on",
				"noParameterAssign": "on",
				"noUselessElse": "on",
				"noYodaExpression": "on",
				"useBlockStatements": "on",
				"useCollapsedElseIf": "on",
				"useCollapsedIf": "on",
				"useConsistentBuiltinInstantiation": "on",
				"useDefaultParameterLast": "on",
				"useExplicitLengthCheck": "on",
				"useForOf": "on",
				"useSingleVarDeclarator": "on",
				"useThrowNewError": "on",
				"useThrowOnlyError": "on"
			},
			"suspicious": {
				"noConsole": "off",
				"noEmptyBlockStatements": "on",
				"noVar": "on",
				"useErrorMessage": "on"
			}
		}
	},
	"overrides": [
		{
			"includes": ["data/admin/**"],
			"linter": {
				"rules": {
					"style": {
						"noParameterAssign": "off"
					}
				}
			}
		}
	],
	"javascript": {
		"formatter": {
			"quoteStyle": "single"
		}
	}
}
```

- [ ] **Step 6: Create `.commitlintrc.ts`**

```typescript
import type { UserConfig } from '@commitlint/types';
import { RuleConfigSeverity } from '@commitlint/types';

const config: UserConfig = {
	parserPreset: {
		parserOpts: {
			headerPattern: /^(.+?): (.+)$/,
			headerCorrespondence: ['type', 'subject'],
		},
	},
	rules: {
		'body-leading-blank': [RuleConfigSeverity.Error, 'always'],
		'body-max-line-length': [RuleConfigSeverity.Error, 'always', 72],
		'header-max-length': [RuleConfigSeverity.Error, 'always', 50],
		'subject-case': [
			RuleConfigSeverity.Error,
			'never',
			['sentence-case', 'start-case', 'pascal-case', 'upper-case'],
		],
		'subject-empty': [RuleConfigSeverity.Error, 'never'],
		'subject-full-stop': [RuleConfigSeverity.Error, 'never', '.'],
		'type-enum': [
			RuleConfigSeverity.Error,
			'always',
			[
				'🦄 new',
				'🌈 improve',
				'🦠 fix',
				'🧺 chore',
				'🚀 release',
				'📖 doc',
				'🚦 ci',
			],
		],
	},
};

export default config;
```

---

### Task 4: Create CI workflows and shared setup action

**Files:**
- Create: `.github/actions/setup-env/action.yml`
- Create: `.github/workflows/ci-lint.yml`
- Create: `.github/workflows/ci-codeql.yml`
- Create: `.github/workflows/ci-scorecard.yml`

All files created in `/Users/brian/Repositories/websites/jastrow/`.

- [ ] **Step 1: Create `.github/actions/setup-env/action.yml`**

```yaml
name: Setup Environment
description: Install mise and project tools

runs:
  using: composite
  steps:
    - name: Install mise
      uses: jdx/mise-action@v2
      with:
        install: true
```

- [ ] **Step 2: Create `.github/workflows/ci-lint.yml`**

```yaml
name: CI - Lint

on:
  pull_request:
    branches:
      - main
  push:
    branches:
      - main

permissions: {}

jobs:
  lint:
    name: Biome Lint
    runs-on: ubuntu-latest
    permissions:
      contents: read
    steps:
      - name: Harden runner
        uses: step-security/harden-runner@a90bcbc6539c36a85cdfeb73f7e2f433735f215b # v2.15.0
        with:
          disable-sudo: true
          egress-policy: block
          allowed-endpoints: >
            api.github.com:443
            github.com:443
            mise-versions.jdx.dev:443
            mise.jdx.dev:443
            release-assets.githubusercontent.com:443
            tuf-repo-cdn.sigstore.dev:443
      - name: Checkout repository
        uses: actions/checkout@de0fac2e4500dabe0009e67214ff5f5447ce83dd # v6.0.2
      - name: Setup
        uses: ./.github/actions/setup-env
      - name: Lint
        run: biome check .
```

- [ ] **Step 3: Create `.github/workflows/ci-codeql.yml`**

```yaml
name: CI - CodeQL

on:
  push:
    branches: ["main"]
  pull_request:
    branches: ["main"]
  schedule:
    - cron: '37 1 * * 2'

permissions: {}

jobs:
  analyze:
    if: github.event.repository.visibility == 'public'
    name: Analyze (${{ matrix.language }})
    runs-on: ubuntu-latest
    permissions:
      security-events: write
      packages: read
      actions: read
      contents: read
    strategy:
      fail-fast: false
      matrix:
        include:
          - language: actions
            queries: security-extended,security-and-quality
          - language: javascript-typescript
            queries: security-extended,security-and-quality
    steps:
      - name: Harden runner
        uses: step-security/harden-runner@a90bcbc6539c36a85cdfeb73f7e2f433735f215b # v2.15.0
        with:
          disable-sudo: true
          egress-policy: block
          allowed-endpoints: >
            api.github.com:443
            github.com:443
            release-assets.githubusercontent.com:443
            uploads.github.com:443
      - name: Checkout repository
        uses: actions/checkout@de0fac2e4500dabe0009e67214ff5f5447ce83dd # v6.0.2
      - name: Initialize CodeQL
        uses: github/codeql-action/init@c793b717bc78562f491db7b0e93a3a178b099162 # v4.32.5
        with:
          languages: ${{ matrix.language }}
          queries: ${{ matrix.queries }}
      - name: Perform CodeQL Analysis
        uses: github/codeql-action/analyze@c793b717bc78562f491db7b0e93a3a178b099162 # v4.32.5
        with:
          category: "/language:${{matrix.language}}"
```

- [ ] **Step 4: Create `.github/workflows/ci-scorecard.yml`**

```yaml
name: CI - OpenSSF Scorecard

on:
  push:
    branches:
      - main
  schedule:
    - cron: '0 0 * * 1'
  workflow_dispatch:

permissions: {}

jobs:
  analysis:
    if: github.repository == 'UniquePixels/jastrow' && github.event.repository.visibility == 'public'
    name: Scorecard Analysis
    runs-on: ubuntu-latest
    permissions:
      contents: read
      actions: read
      security-events: write
      id-token: write
    steps:
      - name: Harden runner
        uses: step-security/harden-runner@a90bcbc6539c36a85cdfeb73f7e2f433735f215b # v2.15.0
        with:
          disable-sudo: true
          egress-policy: block
          allowed-endpoints: >
            api.deps.dev:443
            api.github.com:443
            api.osv.dev:443
            api.scorecard.dev:443
            github.com:443
            oss-fuzz-build-logs.storage.googleapis.com:443
            *.sigstore.dev:443
            www.bestpractices.dev:443
      - name: Checkout repository
        uses: actions/checkout@de0fac2e4500dabe0009e67214ff5f5447ce83dd # v6.0.2
        with:
          persist-credentials: false
      - name: Run Scorecard analysis
        uses: ossf/scorecard-action@4eaacf0543bb3f2c246792bd56e8cdeffafb205a # v2.4.3
        with:
          results_file: results.sarif
          results_format: sarif
          publish_results: true
      - name: Upload results to code-scanning
        uses: github/codeql-action/upload-sarif@c793b717bc78562f491db7b0e93a3a178b099162 # v4.32.5
        with:
          sarif_file: results.sarif
          category: scorecard
```

---

### Task 5: Create CodeRabbit configuration

**Files:**
- Create: `.coderabbit.yaml`

- [ ] **Step 1: Create `.coderabbit.yaml`**

```yaml
# CodeRabbit Configuration
# https://docs.coderabbit.ai/guides/configure-coderabbit

language: en-US
early_access: true
reviews:
  profile: assertive
  request_changes_workflow: true
  auto_title_instructions: |
    Use the format: <emoji> <type>(scope): description
    Types and emojis: new 🦄 / improve 🌈 / fix 🦠 / chore 🧺 / release 🚀 / doc 📖 / ci 🚦
    Scope should reflect the primary area changed (e.g. ui, data, admin, ci).
    Description must be lowercase, imperative mood, max 50 chars total.
  review_details: true
  fail_commit_status: true
  suggested_labels: false
  poem: false
  pre_merge_checks:
    docstrings:
      mode: error

  auto_review:
    enabled: true
    drafts: false
    base_branches:
      - main

  path_instructions:
    - path: "**"
      instructions: |
        General project rules:
        - This is a vanilla JS static site PWA. No bundler, no framework, no npm packages at runtime.
        - All JS runs in the browser unless under `data/admin/` (which uses Bun).
        - Biome enforces lint and formatting.
        - DOMPurify is loaded via CDN with SRI for XSS sanitization.

    - path: "assets/scripts/**"
      instructions: |
        Browser JavaScript. Focus on:
        - No module bundler — files loaded via `<script>` tags
        - DOM API usage and event handling patterns
        - Service worker lifecycle awareness
        - Accessibility (WCAG 2.1 AA compliance)
        - No `var` — use `const`/`let`

    - path: "data/admin/**"
      instructions: |
        Local dev tooling that runs on Bun (not deployed). Includes:
        - Admin server (`server.ts`) for annotating dictionary entries
        - AI classification helper
        - `console` and `process.env` are expected here

    - path: ".github/**"
      instructions: |
        CI/CD configuration. Check for:
        - Pinned action versions with hash comments
        - Harden Runner with egress blocking on all jobs
        - No credential or secret exposure risks
        - Correct branch targeting (main only)

issue_enrichment:
  auto_enrich:
    enabled: true
  planning:
    auto_planning:
      labels:
        - '!no-plan'
```

---

### Task 6: Create `_headers` for Cloudflare Pages

**Files:**
- Create: `_headers`

- [ ] **Step 1: Create `_headers`**

```
# Cloudflare Pages Security Headers
# https://developers.cloudflare.com/pages/platform/headers/

# Apply security headers to all routes
/*
  Content-Security-Policy: default-src 'self'; script-src 'self' 'unsafe-inline' https://cdn.jsdelivr.net https://kit.webawesome.com https://kit.fontawesome.com https://unpkg.com; style-src 'self' 'unsafe-inline' https://unpkg.com; img-src 'self' data: https://ia600802.us.archive.org https://*.us.archive.org; font-src 'self' data: https://fonts.gstatic.com; connect-src 'self'; frame-src 'none'; frame-ancestors 'none'; base-uri 'self'; form-action 'self'; object-src 'none'
  X-Frame-Options: DENY
  X-Content-Type-Options: nosniff
  Referrer-Policy: strict-origin-when-cross-origin
  Permissions-Policy: geolocation=(), microphone=(), camera=(), payment=(), usb=(), magnetometer=(), gyroscope=()
  X-XSS-Protection: 1; mode=block

# Cache JSONL data files aggressively (immutable content)
/data/jastrow-part1.jsonl
  Cache-Control: public, max-age=31536000, immutable
  Access-Control-Allow-Origin: *

/data/jastrow-part2.jsonl
  Cache-Control: public, max-age=31536000, immutable
  Access-Control-Allow-Origin: *

# Cache bundled JavaScript assets
/assets/*.js
  Cache-Control: public, max-age=31536000, immutable

# Cache CSS assets
/assets/*.css
  Cache-Control: public, max-age=31536000, immutable

# Cache images
/assets/images/*
  Cache-Control: public, max-age=86400

# HTML files: short cache, must revalidate
/*.html
  Cache-Control: public, max-age=3600, must-revalidate

# Root index
/
  Cache-Control: public, max-age=3600, must-revalidate
```

---

### Task 7: Create repository documentation

**Files:**
- Create: `LICENSE`
- Create: `README.md`
- Create: `SECURITY.md`
- Create: `CODE_OF_CONDUCT.md`
- Create: `CONTRIBUTING.md`
- Create: `DCO`

- [ ] **Step 1: Create `LICENSE`**

```
MIT License

Copyright (c) 2026 UniquePixels

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```

- [ ] **Step 2: Create `README.md`**

```markdown
# Jastrow Dictionary

A progressive web app for browsing and searching Marcus Jastrow's
*Dictionary of the Targumim, the Talmud Babli and Yerushalmi, and the
Midrashic Literature* (1903).

**Live:** [jastrow.app](https://jastrow.app)

## Features

- **Full-text search** across 32,000+ dictionary entries
- **Works offline** after first visit (PWA with service worker)
- **Cross-referenced abbreviations** — tap any abbreviation for its expansion
- **Page scans** — view the original 1903 print pages from Archive.org
- **Talmudic Sages explorer** — interactive graph of rabbis mentioned in the Talmud
- **Shareable URLs** — link directly to any entry, page, or search

## Tech Stack

- Vanilla JavaScript (no framework, no bundler)
- [Web Awesome](https://www.webawesome.com/) component library
- Cloudflare Pages (static hosting)
- IndexedDB for offline data persistence

## Local Development

Serve the root directory with any static HTTP server:

```bash
# Using Python
python3 -m http.server 8000

# Using Bun
bunx serve .

# Using npx
npx serve .
```

Then open `http://localhost:8000` in your browser.

### Admin Tooling

The `data/admin/` directory contains a Bun-based annotation server for
classifying dictionary entries. See `data/admin/` for details.

## Data Attribution

The dictionary data is derived from
[Sefaria's](https://www.sefaria.org/) digitization of Marcus Jastrow's
dictionary. Sefaria's content is licensed under
[CC-BY-NC](https://creativecommons.org/licenses/by-nc/4.0/). The raw
source data is preserved in `data/raw/` under its original license.

Abbreviation data includes contributions from Ezra Brand's abbreviation
dictionary.

## License

Code is licensed under [MIT](LICENSE).

Dictionary data in `data/` and `data/raw/` is subject to Sefaria's
CC-BY-NC license.

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.
```

- [ ] **Step 3: Create `SECURITY.md`**

```markdown
# Security Policy

## Reporting a Vulnerability

If you discover a security vulnerability in this project, please report
it responsibly:

1. **Do not** open a public issue
2. Email **brian@uniquepixels.xyz** with details
3. Include steps to reproduce if possible

You should receive a response within 48 hours.

## Scope

This is a static site PWA with no server-side code (the `data/admin/`
tooling runs locally only). Security concerns are primarily:

- Cross-site scripting (XSS) via dictionary content rendering
- Content Security Policy effectiveness
- Service worker cache integrity
- Third-party CDN dependency integrity (SRI hashes)
```

- [ ] **Step 4: Create `CODE_OF_CONDUCT.md`**

```markdown
# Contributor Covenant Code of Conduct

## Our Pledge

We as members, contributors, and leaders pledge to make participation in
our community a harassment-free experience for everyone, regardless of
age, body size, visible or invisible disability, ethnicity, sex
characteristics, gender identity and expression, level of experience,
education, socio-economic status, nationality, personal appearance,
race, caste, color, religion, or sexual identity and orientation.

We pledge to act and interact in ways that contribute to an open,
welcoming, diverse, inclusive, and healthy community.

## Our Standards

Examples of behavior that contributes to a positive environment:

- Using welcoming and inclusive language
- Being respectful of differing viewpoints and experiences
- Gracefully accepting constructive criticism
- Focusing on what is best for the community
- Showing empathy towards other community members

Examples of unacceptable behavior:

- The use of sexualized language or imagery, and sexual attention or
  advances of any kind
- Trolling, insulting or derogatory comments, and personal or political
  attacks
- Public or private harassment
- Publishing others' private information without explicit permission
- Other conduct which could reasonably be considered inappropriate in a
  professional setting

## Enforcement

Instances of abusive, harassing, or otherwise unacceptable behavior may
be reported to the project maintainer at **brian@uniquepixels.xyz**.

All complaints will be reviewed and investigated promptly and fairly.

## Attribution

This Code of Conduct is adapted from the
[Contributor Covenant](https://www.contributor-covenant.org/), version
2.1.
```

- [ ] **Step 5: Create `CONTRIBUTING.md`**

```markdown
# Contributing to Jastrow Dictionary

Thank you for your interest in contributing!

## Getting Started

1. Fork the repository
2. Create a feature branch (`git checkout -b my-feature`)
3. Make your changes
4. Commit using the project's commit format (see below)
5. Push to your fork and open a pull request

## Commit Format

```
<emoji> <type>([scope]): <description>
```

Types: `🦄 new` / `🌈 improve` / `🦠 fix` / `🧺 chore` / `📖 doc` / `🚦 ci`

Example: `🦠 fix(ui): correct search input focus on mobile`

All commits must include a sign-off line (`git commit -s`).

## Code Style

- Vanilla JavaScript — no frameworks or bundlers
- Biome handles linting and formatting (`biome check .`)
- Tabs for indentation, single quotes for strings
- No `var` — use `const` and `let`

## Pull Requests

- PRs are reviewed by [CodeRabbit](https://coderabbit.ai/) and a
  maintainer
- All CI checks must pass before merge
- Keep PRs focused — one feature or fix per PR

## Developer Certificate of Origin

By contributing, you agree to the [DCO](DCO). Your commits must include
a `Signed-off-by` line (use `git commit -s`).
```

- [ ] **Step 6: Create `DCO`**

```
Developer Certificate of Origin
Version 1.1

Copyright (C) 2004, 2006 The Linux Foundation and its contributors.

Everyone is permitted to copy and distribute verbatim copies of this
license document, but changing it is not allowed.


Developer's Certificate of Origin 1.1

By making a contribution to this project, I certify that:

(a) The contribution was created in whole or in part by me and I
    have the right to submit it under the open source license
    indicated in the file; or

(b) The contribution is based upon previous work that, to the best
    of my knowledge, is covered under an appropriate open source
    license and I have the right under that license to submit that
    work with modifications, whether created in whole or in part
    by me, under the same open source license (unless I am
    permitted to submit under a different license), as indicated
    in the file; or

(c) The contribution was provided directly to me by some other
    person who certified (a), (b) or (c) and I have not modified
    it.

(d) I understand and agree that this project and the contribution
    are public and that a record of the contribution (including all
    personal information I submit with it, including my sign-off) is
    maintained indefinitely and may be redistributed consistent with
    this project or the open source license(s) involved.
```

---

### Task 8: Create `.claude/CLAUDE.md`

**Files:**
- Create: `.claude/CLAUDE.md`

- [ ] **Step 1: Create `.claude/CLAUDE.md`**

```markdown
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
```

---

### Task 9: Create milestone commits

This task creates the squashed milestone history. Work in `/Users/brian/Repositories/websites/jastrow/`.

**Important:** This is the most manual task. We need to craft ~5 commits that represent the project's evolution. Since we can't reconstruct intermediate states from the current files alone, we'll create the milestone commits using the final file state but with meaningful commit messages that document the project's history. The final commit will include all tooling/config files.

- [ ] **Step 1: Stage and commit milestone 1 — Initial application**

Stage core app files only (no sages, no accessibility, no admin tooling):

```bash
cd /Users/brian/Repositories/websites/jastrow
git add index.html sw.js \
  assets/styles/styles.css \
  assets/scripts/constants.js \
  assets/scripts/sanitizer.js \
  assets/scripts/keyboard.js \
  assets/scripts/data-loader.js \
  assets/scripts/app.js \
  assets/scripts/announcer.js \
  assets/images/jastrow-mini.svg \
  assets/images/sefarialogo.svg \
  assets/images/book.svg \
  assets/images/favicon/ \
  data/jastrow-part1.jsonl \
  data/jastrow-part2.jsonl \
  data/jastrow-abbr.json \
  data/jastrow-hebrew-abbr.json \
  data/version.json \
  data/raw/
git commit -s -m "$(cat <<'EOF'
🦄 new: initial Jastrow Dictionary PWA

Core dictionary viewer with full-text search, offline
support via service worker and IndexedDB, abbreviation
cross-referencing, page scan viewer, and shareable URLs.

Data sourced from Sefaria's digitization of Marcus
Jastrow's 1903 dictionary (32,000+ entries).
EOF
)"
```

- [ ] **Step 2: Commit milestone 2 — Infinite scroll**

```bash
git add assets/scripts/scroll-manager.js
git commit -s -m "$(cat <<'EOF'
🌈 improve(ui): add bidirectional infinite scroll

Offscreen staging pattern for prepends to handle Web
Awesome async rendering. Direction-aware loading with
scroll event tracking instead of IntersectionObserver.
EOF
)"
```

- [ ] **Step 3: Commit milestone 3 — Sages**

```bash
git add assets/styles/sages.css \
  assets/scripts/sages.js \
  assets/scripts/sages-data.js \
  assets/scripts/sages-graph.js \
  assets/scripts/sages-sidebar.js \
  data/sages.json \
  data/raw/sages-source.json
git commit -s -m "$(cat <<'EOF'
🦄 new(sages): add Talmudic sages explorer

Interactive D3 force-directed graph of rabbis mentioned
in the Talmud with sidebar details, relationship mapping,
and keyboard-accessible graph nodes.
EOF
)"
```

- [ ] **Step 4: Commit milestone 4 — Accessibility**

```bash
git add assets/styles/accessibility.css
git commit -s -m "$(cat <<'EOF'
🌈 improve(a11y): WCAG 2.1 AA accessibility refactor

Focus indicators, color contrast, ARIA labels and live
regions, keyboard navigation, skip link, 44px touch
targets, reduced motion support, dialog focus management.
EOF
)"
```

- [ ] **Step 5: Commit milestone 5 — Tooling, admin, docs, and repo setup**

```bash
git add .
git commit -s -m "$(cat <<'EOF'
🧺 chore: add repo tooling, docs, and admin tools

Biome lint, CodeRabbit, commitlint, EditorConfig, CI
workflows (CodeQL, OpenSSF Scorecard, lint). Repository
docs (README, LICENSE, SECURITY, CONTRIBUTING, DCO).
Cloudflare Pages headers. Admin annotation server.
Orchestra development docs.
EOF
)"
```

- [ ] **Step 6: Verify the commit history**

```bash
git log --oneline
```

Expected: 5 commits in reverse chronological order, from "chore: add repo tooling" down to "new: initial Jastrow Dictionary PWA".

---

### Task 10: Create GitHub repo and push

- [ ] **Step 1: Create the public repo on GitHub**

```bash
cd /Users/brian/Repositories/websites/jastrow
gh repo create UniquePixels/jastrow \
  --public \
  --description "Progressive web app for Marcus Jastrow's Dictionary of the Targumim, Talmud Babli, Yerushalmi and Midrashic Literature" \
  --source . \
  --remote origin
```

- [ ] **Step 2: Push to GitHub**

```bash
git push -u origin main
```

- [ ] **Step 3: Verify on GitHub**

```bash
gh repo view UniquePixels/jastrow --web
```

Confirm: 5 commits visible, all files present, README renders correctly.

- [ ] **Step 4: Configure repo settings via `gh api`**

```bash
# Enable auto-delete head branches
gh api repos/UniquePixels/jastrow \
  -X PATCH \
  -f delete_branch_on_merge=true

# Enable vulnerability alerts
gh api repos/UniquePixels/jastrow/vulnerability-alerts \
  -X PUT
```

---

### Task 11: Update SETLIST.md

**Files:**
- Modify: `docs/orchestra/SETLIST.md`

- [ ] **Step 1: Update SETLIST to reflect current work and new domain**

Replace the content of `docs/orchestra/SETLIST.md` with:

```markdown
# Setlist — Jastrow Dictionary

## Now
**Task:** Repository separation — extract from personal site to jastrow.app
**Branch:** main
**Status:** in progress — repo created, awaiting Cloudflare Pages setup
**Context:** Moving to standalone public repo at UniquePixels/jastrow

## Enhancements
- [ ] English key input to Hebrew character interpolation in search bar
- [ ] Sage chart improvements including API data
- [ ] BDB/Klein/Frank/HALOT cross references
- [ ] Abbreviation tips from JSON data instead of hard coded
- [ ] Sages and abbreviation data optimization
- [ ] Sages graph spatial arrow-key navigation (~50 lines proximity logic)
- [ ] LLM-powered search assistant for natural language queries
- [ ] Social cover image — generate via Freepik AI, add to OG/Twitter meta

## TODOs
- [ ] Cloudflare Pages setup (manual — dashboard)
- [ ] GitHub branch protection (manual — after CI runs once)
- [ ] Add CodeRabbit GitHub App to repo
- [ ] Cloudflare redirect rules (uniquepixels.xyz/talmud/* → jastrow.app/*)
- [ ] Parent site cleanup (remove talmud/ from _config.yml, delete directory)

## Completed
- [x] Accessibility refactor — WCAG 2.1 AA compliance
- [x] Repository separation — spec and plan
```

- [ ] **Step 2: Commit the SETLIST update**

```bash
cd /Users/brian/Repositories/websites/jastrow
git add docs/orchestra/SETLIST.md
git commit -s -m "$(cat <<'EOF'
📖 doc: update SETLIST for new repo
EOF
)"
git push
```

---

### Task 12: Migrate Claude Code memories

This task runs from the **old** project directory context since it writes to the Claude memory system.

- [ ] **Step 1: Create the new project memory directory**

```bash
mkdir -p ~/.claude/projects/-Users-brian-Repositories-websites-jastrow/memory
```

- [ ] **Step 2: Copy applicable memory files**

```bash
SRC=~/.claude/projects/-Users-brian-Repositories-websites-brian/memory
DEST=~/.claude/projects/-Users-brian-Repositories-websites-jastrow/memory

cp "$SRC/user_brian.md" "$DEST/"
cp "$SRC/feedback_webawesome_docs.md" "$DEST/"
cp "$SRC/feedback_webawesome_tooltip.md" "$DEST/"
cp "$SRC/feedback_scroll_lessons.md" "$DEST/"
cp "$SRC/feedback_webawesome_label.md" "$DEST/"
cp "$SRC/project_llm_search.md" "$DEST/"
```

- [ ] **Step 3: Update `user_brian.md` in the new location**

Change the domain reference from `uniquepixels.xyz/talmud/` to `jastrow.app`:

Old:
```
- Builds Jastrow Dictionary PWA at uniquepixels.xyz/talmud/ for queer Talmud study community
```

New:
```
- Builds Jastrow Dictionary PWA at jastrow.app for queer Talmud study community
- Previously hosted at uniquepixels.xyz/talmud/ (redirects in place)
```

- [ ] **Step 4: Create `MEMORY.md` index in new location**

Write to `~/.claude/projects/-Users-brian-Repositories-websites-jastrow/memory/MEMORY.md`:

```markdown
# Memory Index

## User
- [user_brian.md](user_brian.md) — Jastrow PWA context: queer Talmud study, Cloudflare Pages, vanilla JS, offline-first

## Feedback
- [feedback_webawesome_docs.md](feedback_webawesome_docs.md) — Check local skills/references for Web Awesome docs before guessing APIs
- [feedback_webawesome_tooltip.md](feedback_webawesome_tooltip.md) — wa-tooltip uses for= sibling pattern, never nest inside
- [feedback_scroll_lessons.md](feedback_scroll_lessons.md) — WA async rendering requires offscreen staging for prepends, direction tracking, no IO
- [feedback_webawesome_label.md](feedback_webawesome_label.md) — WA label= renders visible text; use aria-label for accessible-only names

## Project
- [project_llm_search.md](project_llm_search.md) — Future enhancement: LLM-powered search assistant for the dictionary

## Reference
- Baseline project spec: `docs/orchestra/specs/2026-03-21-project-baseline-spec.md`
```

---

### Task 13: Manual configuration steps (USER ACTION REQUIRED)

These steps cannot be automated and require the user to complete them in the browser.

- [ ] **Step 1: Cloudflare Pages setup**

1. Go to Cloudflare dashboard → Workers & Pages → Create application
2. Select Pages tab → Import an existing Git repository
3. Connect to `UniquePixels/jastrow`
4. Settings:
   - Production branch: `main`
   - Build command: (leave blank)
   - Build output directory: `/`
5. Deploy

- [ ] **Step 2: Add custom domain**

1. In the Cloudflare Pages project settings → Custom domains
2. Add `jastrow.app`
3. Cloudflare will configure DNS automatically if the domain is on
   Cloudflare (add CNAME `jastrow.app` → `jastrow.pages.dev`)

- [ ] **Step 3: Verify the site loads**

Visit `https://jastrow.app` — confirm the dictionary loads, search
works, service worker registers, and offline mode functions.

- [ ] **Step 4: GitHub branch protection**

1. Go to repo Settings → Branches → Add branch protection rule
2. Branch name pattern: `main`
3. Enable:
   - Require a pull request before merging
   - Require status checks to pass (select: `Biome Lint`, `Analyze (javascript-typescript)`)
   - Require conversation resolution before merging
4. Save

- [ ] **Step 5: Add CodeRabbit**

1. Go to [coderabbit.ai](https://coderabbit.ai)
2. Add the `UniquePixels/jastrow` repository

- [ ] **Step 6: Cloudflare redirect rules (AFTER confirming jastrow.app works)**

1. Go to Cloudflare dashboard → `uniquepixels.xyz` zone → Rules → Redirect Rules
2. Create rule: `uniquepixels.xyz/talmud/*` → 301 → `https://jastrow.app/*`
3. Create rule: `uniquepixels.xyz/jastrow/*` → 301 → `https://jastrow.app/*`

- [ ] **Step 7: Parent site cleanup**

In the `brian` repo (`/Users/brian/Repositories/websites/brian/`):

1. Edit `_config.yml`: remove `talmud` from `include` and `exclude`
2. Delete `_pages/jastrow.html`
3. Remove stale `/data/jastrow.jsonl` rule from `_headers`
4. Delete the `talmud/` directory
5. Commit and push
