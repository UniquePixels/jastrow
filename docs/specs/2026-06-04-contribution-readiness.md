# Contribution Readiness — Canonical Plan

**Status:** planning · **Created:** 2026-06-04 · **Owner:** Brian

Single source of truth for making the Jastrow Dictionary repo ready to
accept external contributions. Supersedes the earlier split
review/plan drafts. Designed to be picked up across sessions: work the
**Execution batches** (§7) top-to-bottom, checking off tasks; consult
**Findings** (§5) for the why.

---

## 1. How to use this doc

- **§2 Decisions** — locked choices from the maintainer. Treat as canon.
- **§3 Open items** — must be confirmed before the affected task runs.
- **§4 Blocker assessment** — what actually gates opening the repo.
- **§5 Findings** — condensed audit (severity · confidence each).
- **§6 Semgrep suppression review** — the code chunks, for sign-off.
- **§7 Execution batches** — the checklist to work through.

Do **not** treat `docs/orchestra/*` (staged for deletion) or
`data/raw/data-processing-pipeline.md` as canonical — they are historical
artifacts, much of the work post-dated them without updates.

---

## 2. Decisions (locked)

| # | Decision | Rationale |
|---|---|---|
| D1 | **Data is edited via the local admin tool, not by hand.** | `data/admin/server.ts` is the supported edit path. It writes compact one-entry-per-line JSONL and auto-bumps `version.json` on save (`server.ts:80-86,35`). |
| D2 | **Do NOT shard the JSONL (downgraded from blocker).** | Empirically, an admin-tool edit changed 107 / 16,256 lines — GitHub renders that fine. Stable serialization keeps diffs minimal. Sharding would add complexity for no review benefit. |
| D3 | **Do NOT restore or re-run the data pipeline.** | It was a one-time Sefaria→current transform. Re-running it now would clobber all subsequent edits. The `.md` stays as history only. Useful *checks* inside it (Stage-7 HTML sanitization) get re-homed into the admin save path + CI (see T7). |
| D4 | **commitlint is not enforced on contributors.** | `.commitlintrc.ts` exists only to feed the VS Code addin. Squash-merge means the maintainer writes the final commit message, so contributor message format is irrelevant. No commitlint CI job. (Assumes squash-merge stays per global convention — correct if wrong.) |
| D5 | **Single `bun install` for contributors.** | Move `data/admin` deps to a root `package.json` and add `@biomejs/biome` + `@commitlint/types` as devDeps. See D6 for the one caveat. |
| D6 | **Pull Playwright/Chromium + font staging out of `postinstall`.** | The admin `postinstall` downloads Chromium (~150MB) and stages fonts. If left in `postinstall` at root, every contributor pays it just to fix a typo. Move it to an explicit `bun run setup:pdf` so the common `bun install` stays light. This is the *only* disadvantage of root-consolidation, and this neutralizes it. |
| D7 | **Renovate over Dependabot.** | Matches the maintainer's other repos; one dependency dashboard, grouped + scheduled + auto-merge for safe updates → less PR noise / lower cognitive load. Scope: GitHub Actions digests, `.mise.toml`, root `package.json`, and a custom regex manager for the pinned CDN versions in `index.html`/`_headers`. |
| D8 | **Limit data changes per PR — soft doc guideline + hard CI guard.** | Two distinct concerns. (a) Reviewability/fatigue: each entry is one dense JSON line; doc guideline = one topic per PR, aim **≤ ~25–50 changed entries**, coordinate larger corrections via an issue first. (b) Disaster guard: a contributor on a different tool version (or hand-editing) can **reserialize the whole file** → 16k-line diff from a trivial fix. CI fails a `data/**` PR over a ceiling (e.g. **> 300** changed lines) — set well above honest edits so only mass-rewrite accidents trip it. Maintainer can override with a `bulk-data-ok` label for genuine bulk corrections. |
| D9 | **AI-in-contributions: AI is a tool, the human is the author.** Resolves O3. Stance is *not* anti-AI — AI assistance is welcome. What is rejected: AI **slop**, massive AI-generated PRs, and **unsupervised end-to-end runs** ("set an agent loose to make the repo better and walk away"). Concrete norms for CONTRIBUTING: **(1)** The contributor is fully responsible for and must understand every line submitted — the DCO sign-off already attests this and explicitly covers AI-assisted work. **(2)** No autonomous/agentic PRs; no bulk AI refactors. Scoped, understood, human-reviewed changes only. **(3)** Lightweight disclosure of AI assistance in the PR (a checkbox, not a gate) for reviewer context. **(4) Data is stricter:** AI on data is allowed *only* for **narrow, structured, verifiable tasks** (find specific errors; wrap defined acronyms for tooltips; normalize a named field) — **never** open-ended "improve the data." Every AI-touched data change must be **human-verified against the source** (Jastrow / Sefaria); hallucinated scholarship is unacceptable. **(5)** PRs are judged on quality regardless of authorship method; slop is closed. Enforcement is principle + existing structural guards (D8 size cap, one-topic-per-PR, human review, CodeRabbit/Semgrep, `validate:data`, DCO) — detection of AI use is not attempted. |

---

## 3. Open items (confirm before the task runs)

| # | Item | Blocks | Default if unconfirmed |
|---|---|---|---|
| ~~O1~~ | **RESOLVED 2026-06-04.** Semgrep runs as **Managed Scans**, not CI. The two installed apps are the required pair: `semgrep-app` (public — org membership) + `Semgrep Code - UniquePixels` (private app, code-access for Managed Scans). Both needed — do not retire either. Managed Scans run a **diff-aware scan on every PR automatically** + a weekly full scan, on Semgrep's infra. → **No Semgrep Actions workflow, no `SEMGREP_APP_TOKEN`, no repo `semgrep.yml`** (Managed Scans ignore in-repo config; rulesets live in the dashboard Policies). Inline `nosemgrep` suppressions remain honored. | T9 | — resolved |
| O2 | Confirm squash-merge stays the merge strategy. | D4 | Assume yes (global convention). |
| ~~O3~~ | **RESOLVED 2026-06-04 → D9.** Stance: AI is a tool, the human is the author; reject slop / massive PRs / unsupervised agentic runs; AI on data only for narrow structured verifiable tasks, human-verified against source. T12 writes the CONTRIBUTING section from D9. | T12 | — resolved |
| O4 | **Maintainer is authoring a reusable cross-repo AI statement** to drop into all repos' CONTRIBUTING. The T12 AI section should use *that* text (D9 is the interim spec / requirements it must satisfy). **REMIND the maintainer to provide the statement when T12 starts** — do not hand-write final AI-section prose without it. | T12 (AI section only) | If still unavailable at T12, draft from D9 and mark it provisional pending the official statement. |

---

## 4. Blocker assessment (revised after maintainer notes)

**Hard blockers (must land before opening):**

1. ✅ **Green + enforced quality gate** — DONE 2026-06-05 (Batch A).
   Was red (85 errors); now `biome check .` exits 0 and CI runs the full
   check (`ci-lint.yml`). 48 warnings remain but are non-gating. (T1–T5)
2. ✅ **Data-edit safety net** — DONE 2026-06-08 (Batch B). Admin save
   now rejects disallowed HTML (T6); a shared allow-list validator backs
   both save and CI (T7); `validate:data` + `ci-data.yml` gate every
   `data/**` PR on schema, unique ids, HTML, and a 300-line size ceiling
   (T8/T8b/T8c). The `trustedHTML` trust-boundary hole is closed end-to-end.

**Should-fix-first:**

3. ✅ Sages-graph keyboard access — DONE 2026-06-08 (Batch D, T11).
4. Contributor docs centered on the admin-tool workflow. (T12)
5. PR/issue templates + CODEOWNERS. (T13)
6. Renovate + Semgrep config. (T9–T10)

**Was a blocker, now not:** data sharding (D2), pipeline restoration (D3),
manual `version.json` bumps (auto-handled by admin tool, D1).

---

## 5. Findings (condensed; severity · confidence)

### Code quality
| Finding | Where | Sev·Conf |
|---|---|---|
| Quality gate red — `window` globals undeclared to Biome (52) + ~37 real errors | `biome.json`, repo-wide | high·high |
| No client-app test infra; fragile core untested | no root `package.json` | high·high |
| `trustedHTML()` is an unsanitized sink (see §6) | `app.js:1173` | med·med → see §6 |
| Entry-indexing logic duplicated 3× | `data-loader.js:597,642,366` | med·high |
| `app.js` 2467-line god-object | `app.js` | med·high |
| 4 inconsistent module-boundary patterns | repo-wide | med·high |
| Positives: all dynamic `innerHTML` is DOMPurify-wrapped; no eval; links forced `noopener` | — | — |

### Accessibility (WCAG 2.1 AA)
| Finding | Where | Sev·Conf |
|---|---|---|
| Sages graph nodes `tabindex="-1"` → keyboard nav dead, Enter/Space handler unreachable. Set `"0"`. | `sages-graph.js:348` | high·high |
| `:focus` should be `:focus-visible` for node ring | `accessibility.css:57` | low·high |
| No text alternative for SVG sages graph | `sages-graph.js:170` | med·high |
| Sages view: no landmark/`<h2>`/focus-on-show | `sages.js:82` | med·med |
| Route changes don't move focus into `<main>` | `app.js:933,996` | med·med |
| Hebrew keyboard overlay unlabeled / not focus-managed | `index.html:267` | med·med |
| Filter toggles lack `aria-pressed`; page-jump error has no `aria-describedby` | `sages.js:267`, `app.js:380` | low·med |
| Positives: skip link, live-region announcer, autocomplete ARIA, dialog focus trap, reduced-motion | — | — |

### Data & performance
| Finding | Where | Sev·Conf |
|---|---|---|
| Admin save path does NO sanitization — contributor edit can inject HTML rendered as trusted | `server.ts:216-243` | high·med |
| No CI validation of data PRs (malformed line silently dropped at load) | `data-loader.js:628`, CI | high·high |
| Confirm Brotli/gzip on `.jsonl` in prod (40.5MB vs ~8.4MB cold load) | `_headers`/Cloudflare | high·med |
| SW/IDB split-ownership of `/data/` files → stale-data trap | `sw.js:36,108` | med·high |
| Synchronous main-thread JSONL parse (32k `JSON.parse`) → mobile freeze | `data-loader.js:594` | med·high |
| No `.gitattributes` (`linguist-generated`) for built data | repo root | med·high |
| `data/raw/` (~45MB) committed with no deployed consumer | `data/raw/` | low·med |
| Verified clean: 32,512 entries, all IDs unique; scroll DOM cap evicts (no leak). Doc's "64k/42MB" is stale. | — | — |

### CI/CD & tooling
| Item | Status | Sev·Conf |
|---|---|---|
| Harden-runner, SHA-pinned actions, min perms, CodeQL, Scorecard | strong, keep | — |
| Biome lint disabled in CI (`ci-lint.yml:37`) | re-enable after T1–T4 | high·high |
| commitlint config orphaned | keep local-only per D4 | resolved |
| Renovate / Dependabot absent | add per D7 | med·high |
| Semgrep CI absent (suppressions present) | config per O1 | med·med |
| No PR/issue templates, no CODEOWNERS | add (T13) | med·high |
| SonarQube absent | optional, lowest priority | low·med |

### Contributor docs
README dev section + community-health files (LICENSE/DCO/CoC/SECURITY/
CONTRIBUTING) are present. Gaps: no admin-tool data-editing guide, no
entry-schema doc, no architecture/module-map, no a11y checklist.

---

## 6. Semgrep suppression review (maintainer note 4)

Two rule families are suppressed. **One** carries real residual risk; the
rest are defensible.

### 6a. `insecure-document-method` (innerHTML) — 6 sites in `app.js`
- **5 sites (`1942, 1996, 2022, 2099, 2114`): SAFE.** Each assigns
  `DOMPurify.sanitize(...)` output; semgrep flags `innerHTML` regardless
  of sanitization. Suppressions accurate.
- **1 site (`app.js:1173`): REAL RESIDUAL RISK.**
  ```js
  trustedHTML(html) {
    const template = document.createElement('template');
    template.innerHTML = html; // nosemgrep: ...insecure-document-method
    return template.content;
  }
  ```
  No sanitization. Doc-comment says "pipeline output, never user input" —
  but with D1, **contributors now edit that data via the admin tool**, so
  the "trusted" assumption no longer holds end-to-end. The guard reduces
  to DOMPurify-at-the-pipeline, which no longer runs (D3).
  **Action (T6/T7):** sanitize on the admin save path and/or run
  `sense.d` through a permissive DOMPurify allow-list here
  (`a/span/em/strong/b/i/br/sup`). Cheap; closes the only real injection
  vector in an open-contribution model.

### 6b. `missing-integrity` (SRI) — 6 sites in `index.html`
- **4 unavoidable / benign:** `link rel="canonical"` (43, false
  positive — no integrity concept), WebAwesome kit loader (72),
  FontAwesome kit loader (77), Google Fonts stylesheet (83). Kit loaders
  rotate content per build; SRI would break them. CSP `script-src`
  already restricts hosts.
- **2 tightenable:** `d3@7.9.0` (599) and `chart.js@4.4.1` (602) are
  **exact-pinned** on jsdelivr → content is immutable → **SRI hashes can
  be added** (line 595 already does this for another script). The "may
  change per minor version" comment is inaccurate for an exact pin.
  **DONE 2026-06-08 (Batch C):** added `sha384` `integrity` to both tags
  (`index.html:597-602`), dropped both `nosemgrep` lines and the inaccurate
  "may change per minor version" comments. Hashes computed from the live
  exact-pinned CDN bytes. All 4 script CDN tags now carry SRI.

---

## 7. Execution batches

Work top-to-bottom. Each task: intent + key files + verification.

### Batch A — Toolchain + green gate (Blocker 1) — ✅ DONE 2026-06-05

**Execution notes (deltas from the plan as written):**
- **Globals were 11, not just `window` app-globals.** Declared in
  `biome.json` `javascript.globals`: CDN libs `DOMPurify`, `Chart`, `d3`
  (the plan missed `d3` — 10 of the 58); Bun runtime `Bun` (admin TS);
  app window-contract classes `IDB`, `SagesData`, `SagesGraph`,
  `SagesSidebar`, `TalmudSagesExplorer`, `JastrowDataLoader`,
  `InfiniteScroll`. Cleared all 58 `noUndeclaredVariables`.
- **T3 error set was different from the plan's list.** The blocking
  *errors* (85 total) were: 58 globals + **21 `useButtonType`** +
  3 `useIterableCallbackReturn` + 2 `noInnerDeclarations` +
  1 `useIframeTitle`. The `noParameterAssign` (8) and `noForEach` (11)
  the plan named are **warnings**, not errors — they don't fail the gate.
  Fixed: 3 real app/SW sites (`app.js` ×2 `forEach`→`for…of`, `sw.js`
  `map` return); **24 in `data/admin/admin.html`** (added `type="button"`
  to 21 JS-wired buttons — none in `<form>`, matching the file's own
  `type="button"` precedent; `<iframe>` title; 2 loop-body `function`
  decls → `const` arrows). Chose to *fix* admin.html rather than relax
  a11y rules for `data/admin/**` — keeps full lint coverage on the tool.
- **Tool-owned data JSON excluded from biome.** Added `!data/**/*.json`
  to `files.includes`. The admin server writes 2-space JSON
  (`version.json`, `annotations.json`, etc.); biome wants tabs → perpetual
  drift on every data save. Biome must not own that serialization (D1).
- **Pre-existing format drift normalized.** `app.js` + `data-loader.js`
  had committed format drift (main was *not* format-clean for them; the
  old format-only CI would already fail a PR touching them). Ran
  `biome format --write` on just those two — 4 small hunks.
- **Deps:** `@biomejs/biome` pinned `2.4.6` (matches `.mise.toml`),
  `@commitlint/types` `^21.0.0`. Deleted `data/admin/package.json` +
  `bun.lock`; root `bun.lock` generated. `stage.ts` `NODE_MODULES`
  repointed to repo-root. Scripts: `check`/`lint`/`format`/`test`/
  `validate:data` (stub for T8)/`admin`/`stage`/`setup:pdf`.
- **Verify results:** `biome check .` → exit 0 (48 warnings remain,
  non-blocking); `bun install` clean with no Chromium; `bun run stage`
  builds; `bun test` 7/7; no commitlint CI job.
- **Follow-up surfaced:** 48 biome *warnings* remain (32 infos too) —
  `noExplicitAny` 17, `noForEach` 9 (2 already fixed), `noParameterAssign`
  8, `useBlockStatements` 5, `useOptionalChain` 3, plus 32
  `noExcessiveCognitiveComplexity` infos. Not gating; clean up opportunistically.

- [x] **T1. Consolidate to a root `package.json`** (D5/D6). Move
  `data/admin` deps up; add `@biomejs/biome`, `@commitlint/types` devDeps;
  scripts: `lint`, `format`, `test`, `validate:data`, `setup:pdf`
  (the Playwright/Chromium + stage step, removed from `postinstall`).
  Update admin script paths/cwd as needed. *Verify:* one `bun install` at
  root with no Chromium download; `bun run setup:pdf` still builds the PDF.
- [x] **T2. Declare globals in `biome.json`** (`javascript.globals`:
  app `window` globals + `DOMPurify`, `Chart`, `d3`). *Verify:* the 52
  `noUndeclaredVariables` errors clear.
- [x] **T3. Fix remaining lint errors** (`noParameterAssign` in
  `sanitizer.js:30,68,111` + `formatSenses`; `noForEach`;
  `useIterableCallbackReturn`). *Verify:* `biome check .` exits 0.
- [x] **T4. Re-enable lint in CI** (`ci-lint.yml:37` drop
  `--linter-enabled=false`). *Verify:* CI lint passes on a clean PR.
- [x] **T5. Wire commitlint as local-only context** (D4) — confirm no CI
  job; keep config for the VS Code addin. *Verify:* no commit-message
  gate on PRs.

### Batch B — Data-edit safety net (Blocker 2)

**Execution notes (T6 + T7 foundation, 2026-06-08):**
- **Decision: reject, don't strip.** Maintainer chose to *reject* a save
  containing disallowed HTML (HTTP 400 + violation list, nothing written)
  over silently stripping. Rationale: a re-serializing sanitizer rewrote
  **5,168 / 50,510** clean fields (`&c.`→`&amp;c.` entity normalization),
  which would churn diffs and trip the D8 300-line guard on the first save.
  Reject keeps clean saves **byte-stable** and matches the pipeline's
  original "investigate, don't silently remove" philosophy.
- **Allow-list corrected from §6a.** Empirical audit of the live corpus
  (50,510 HTML fields) found the §6a narrow list (`a/span/em/strong/b/i/
  br/sup`) would strip **176,346 `<abbr>`** tags. The **Stage-7 list** is
  canonical: tags `a abbr b br div em i p span strong sub sup`; attrs
  `class dir data-ref` global + `href target rel` on `a`, `title` on
  `abbr`. Schemes: `http`/`https` only; protocol-relative (`//`) and
  fragment-with-colon (`#rid:…`) handled correctly. Detector found **0
  violations** across all 32,512 entries (no false positives).
- **Detector, not sanitizer.** `htmlparser2` (replaced a brief
  `sanitize-html` trial) parses with `decodeEntities:true` so obfuscated
  schemes (`java&#115;cript:`) are caught. Lives in
  `scripts/lib/entry-html.ts` — the shared validator (T7) importable by
  the admin server (T6) and the future `validate:data` CI (T8).
  **Why not Bun's zero-dep `HTMLRewriter`:** verified it does *not* decode
  entities in attribute values, so `java&#115;cript:` would slip past it
  while the browser's `innerHTML` sink *does* decode it (live XSS).
  Matching it would require hand-rolled entity decoding — custom security
  code we explicitly avoid. `htmlparser2` handles it correctly out of box.
- **CI now installs deps.** `htmlparser2` is the repo's first external
  *runtime* import, but CI's `setup-env` previously installed mise tools
  only (no `bun install`) — tests had passed because tested code used only
  `node:*` builtins. Added `bun install --frozen-lockfile` to
  `setup-env/action.yml` (npm egress already allow-listed; bun skips
  Playwright's browser download since no lifecycle scripts are trusted).
  Sandbox note: `server.test.ts` binds a real port via `Bun.serve`, which
  the local agent sandbox blocks (`EADDRINUSE`/errno 0); run `bun test`
  with the sandbox disabled. CI (GitHub runner) is unaffected.

- [x] **T6. Reject disallowed HTML on admin save** — `handlePutEntry` and
  `handleSaveAll` (`server.ts`) run `findEntryViolations` over each
  incoming entry's `c.s[].d` (recursive) + `li`; on any violation return
  400 all-or-nothing, writing nothing. *Verified:* `<script>`-laced and
  `javascript:`-href edits return 400 with the violation + field path; the
  on-disk entry is unchanged (`server.test.ts`, 9 server + 10 unit tests).
- [x] **T7. Shared validator with Stage-7 allow-list** (D3) — created
  `scripts/lib/entry-html.ts` + unit tests; consumed by T6 at save. CI
  half (same module imported by `validate:data`) lands with T8.
  *Verified:* allow-list enforced at save; module ready for CI import.
- [x] **T8. `validate:data` script + `ci-data.yml`** — `scripts/validate-data.ts`
  parses every JSONL line and checks: valid JSON, structural schema
  (`scripts/lib/entry-schema.ts`), global `id` uniqueness across both
  files, and the HTML allow-list (reuses `entry-html.ts` from T7).
  `ci-data.yml` (`validate` job) runs it on `data/**`/`scripts/**` PRs in
  the existing hardened style (harden-runner, SHA-pinned actions, min
  perms). *Verified:* clean corpus passes (32,512 entries, all ids
  unique); a temp dir with a malformed line + duplicate id +
  `<script>` href all fail with `file:line · field · detail` and exit 1.
  8 schema unit tests added.
- [x] **T8b. Add `.gitattributes`** marking `*.jsonl` `linguist-generated`.
  *Verified:* attribute applies to both data files; admin-tool edits still
  produce a small expandable hunk.
- [x] **T8c. Data-change-size guard in `ci-data.yml`** (D8) — `size-guard`
  job diffs `data/**` (`git diff --numstat base head`), fails over a
  300-line ceiling (`MAX_CHANGED_LINES` env). Whole job is gated
  `!contains(labels, 'bulk-data-ok')`, so the label override skips it
  cleanly; PR re-runs on `labeled`/`unlabeled`. SHAs passed via env (no
  injection). *Verified:* YAML valid; logic matches D8.

**Execution notes (T8, 2026-06-08):**
- **Schema is hand-rolled, not ajv.** Dependency-free (project ethos) and
  emits the same `path · detail` message shape as the HTML validator. Audited
  the live corpus for real field types before writing it: `ah`/`pf`/`q` are
  **arrays**, `g`/`rf` are **objects** (top-level *and* sense-level `g`),
  the rest strings — an initial string-everything guess flagged 27k false
  positives. Required: `hw` (non-empty string), `id` (string matching
  `^[A-Za-z]\d{5}$` — all 32,512 conform, no entry-creation path exists to
  introduce another shape), `c` (object with `s` array). Optionals
  type-checked only when present.
- **Two new biome facts.** (1) Added a `scripts/*.ts` override (mirrors
  `data/admin/**`: `noNodejsModules`/`noProcessEnv` off) because the CLI
  legitimately imports `node:*` + reads `process.env`; `scripts/lib/**`
  stays strict (pure libs). (2) `validate-data.ts` size-guard SHAs go
  through `env:` per the Actions-injection guidance.
- **No new deps.** Validator reuses T7's `htmlparser2`; lockfile unchanged.

### Batch C — Supply-chain tooling

**Execution notes (T9 SRI + T10, 2026-06-08):**
- **CDN pins live only in `index.html`, not `_headers`.** `_headers`
  carries host-level CSP `script-src` (no versions). The regex manager
  targets `index.html` jsdelivr pins.
- **SRI vs. Renovate tension.** 4 of 5 CDN scripts now carry `integrity`.
  A regex-manager version bump cannot recompute the hash, so a stale
  `integrity` would break the page. CDN updates are therefore **grouped,
  scheduled, and `automerge:false`** with a `needs-sri-update` label —
  matches D7's "automerge *safe* updates" (CDN+SRI is not safe). Maintainer
  recomputes the hash on each CDN PR.
- **Schema field names are current-Renovate.** `customManagers` +
  `managerFilePatterns` are v39+ (the older `regexManagers`/`fileMatch`
  validate-fail on a stale `renovate@37`). Validated clean against
  `renovate@latest`'s `renovate-config-validator`. **Caveat:** the
  validator binary needs Node, not Bun — Bun segfaults loading Renovate's
  native `re2` module; run it via `npx --package renovate@latest`.
- **mise + actions handled natively.** Renovate's `mise` manager covers
  `.mise.toml` (biome, bun); `github-actions` + `helpers:pinGitHubAction`
  `Digests` keep SHA-pins updated with `# vX.Y.Z` comments preserved.
  github-actions digests + root devDep minor/patch → automerged.

- [ ] **T9. Semgrep — confirm Managed Scans onboarding** (O1 resolved). In
  the Semgrep dashboard: verify `jastrow` is added to Managed Scans
  (private app has access) and a JS ruleset/policy is assigned. No
  workflow, no `semgrep.yml`. *Verify:* opening a test PR triggers a
  diff-aware Semgrep scan automatically; inline `nosemgrep` suppressions
  honored; `.github/workflows` has no Semgrep job. **(Dashboard step is the
  maintainer's — not in-repo.)** The in-repo half (d3/chart.js SRI, §6b) is
  **DONE** — see §6b.
- [x] **T10. Renovate** (D7) — `renovate.json` at repo root: `customManager`
  regex for jsdelivr CDN pins in `index.html`, native `mise` +
  `github-actions` managers, root `package.json` devDeps; grouped +
  scheduled (Mon before 6am ET) + automerge for safe updates (Actions
  digests, devDep minor/patch); CDN group held manual for SRI. *Verified:*
  `biome check .` exit 0; config validates clean against `renovate@latest`.

### Batch D — Accessibility (flagship fix) — ✅ DONE 2026-06-08

**Execution notes (T11, 2026-06-08):**
- **Click handler alone was unreachable by keyboard.** An SVG `<g
  role="button">` is not natively keyboard-operable, so `tabindex="0"`
  only got focus there — Enter/Space did nothing. Added an explicit
  `keydown` handler (Enter + Space, `preventDefault` on Space to stop
  page scroll) sharing one `activate()` closure with the click handler.
- **Text alternative is non-interactive by design.** The 155 nodes are
  now individually focusable; a second interactive surface would double
  the tab stops. `_drawTextAlternative()` appends a `.visually-hidden`
  `<h3>` + `<ul>` of plain-text names (en + he + dates) — a structured
  reading order for SR users, since positioned SVG nodes have none. It
  runs inside `render()` after `_createSVG()` so it rebuilds on every
  filter change (node count stays in sync).
- **`.visually-hidden` utility added** to `accessibility.css` (clip-rect
  pattern); biome reordered `clip` last (nursery `useSortedProperties`).
- **Verified live** (python static server + chrome-devtools): `#sages`
  renders 59 nodes (tannaim default filter), each `tabindex="0"`
  `role="button"` with a full aria-label; svg carries `role="group"` +
  descriptive aria-label; hidden list has matching 59 items. Focusing a
  node + dispatching Enter **and** Space both navigate to
  `#sage:hillel-the-elder`. No console errors. `biome check .` exit 0.

- [x] **T11. Sages graph keyboard access** — `tabindex` `-1`→`0`
  (`sages-graph.js:348`), CSS `:focus`→`:focus-visible`
  (`accessibility.css:57`), add `role="group"`+`aria-label` and a
  visually-hidden sage list as text alternative. *Verify:* Tab reaches a
  node, Enter opens sidebar, SR announces the graph + lists sages.

### Batch E — Contributor enablement
- [ ] **T12. Contributor docs** — CONTRIBUTING "Contributing Data"
  section centered on the **admin tool** (setup via root install +
  `setup:pdf` only if building PDFs; edit → tool saves → commit → PR;
  emphasize *don't hand-edit JSONL*). **State the data-change-size policy
  (D8):** one topic per PR, aim ≤ ~25–50 changed entries, coordinate
  larger corrections via an issue first, and note the CI line-count guard
  + `bulk-data-ok` override. **AI-in-contributions section (O4): FIRST
  remind the maintainer to provide their reusable cross-repo AI statement
  and use that text;** D9 is the interim spec it must satisfy
  (tool-not-author; no slop/massive/agentic PRs; AI on data only for
  narrow structured verifiable tasks, human-verified against source;
  lightweight disclosure checkbox; DCO covers AI-assisted work). Add an
  entry-schema reference and a
  short architecture/module-map (load order + `window`-globals contract).
  Port the a11y checklist out of the soon-deleted spec. *Verify:* a cold
  reader can install, edit one entry via the tool, and open a PR.
- [ ] **T13. PR + issue templates + CODEOWNERS** —
  `PULL_REQUEST_TEMPLATE.md` (DCO sign-off, `biome check` green, a11y
  check, "data validated" when `data/**` touched);
  `ISSUE_TEMPLATE/` (bug, data-correction, feature) + `config.yml`;
  `CODEOWNERS`. *Verify:* draft PR/issue shows the templates.

### Follow-ups (post-opening, not gating)
Unit tests for pure functions (`normalizeHebrew`, `binarySearchClosest`,
`sanitizeURL`, `validatePageNumber`) · de-dup `data-loader` indexing
(`_indexEntry`) · begin `app.js` decomposition · move JSONL parse to a
Web Worker · resolve SW/IDB `/data/` ownership · confirm prod
Brotli/gzip · move `data/raw/` out of the deployed repo · remaining a11y
items (route focus, keyboard-overlay labeling, `aria-pressed`,
`wa-button` dismiss) · SonarQube (optional).

---

## 8. Source

Synthesized 2026-06-04 from parallel code/a11y/data review passes, direct
review of all CI workflows + `_headers` + `.coderabbit.yaml` + community
files, the admin server (`data/admin/server.ts`), and maintainer
decisions D1–D7.
