# Spec: User Issue Reporting + GitHub Collaboration

- **Date:** 2026-06-04
- **Status:** Draft (design agreed, not yet implemented)
- **Scope:** In-app "report an issue" tool, the server endpoint behind it,
  GitHub as the issue store, local-dev story, and migration of existing
  admin annotations.

---

## 1. Goal

Let users report problems (bad data, site bugs) from the app, and move the
project toward open collaboration — without building or operating a custom
backend. Reports become GitHub issues so they live next to the PRs that fix
them and ride the existing review/approval flow.

## 2. Decisions (the load-bearing choices)

| # | Decision | Rationale |
|---|----------|-----------|
| D1 | Collaboration stays on **GitHub** (issues + PRs + review) | Infra, auth, approval flow already exist; near-zero build cost |
| D2 | Issues stored in a **separate PRIVATE intake repo** | User free-text may carry PII; public repo issues are permanent + world-readable. Promote to the public repo after triage |
| D3 | Report flow: client form → **Worker endpoint** `/api/report` → GitHub Issues API | Token/secrets must live server-side; client is untrusted |
| D4 | Deploy model: **Cloudflare Workers + Static Assets** (existing `wrangler.jsonc`) | Already wired; add a `main` Worker for `/api/*`, assets serve the rest |
| D5 | One **shared `Request → Response` handler**, mounted in both the Worker (prod/preview) and the Bun dev server (local) | Single implementation, fully local-testable, unit-testable |
| D6 | Categories chosen by **which button is clicked** (Data / Website), no dropdown | Lower friction for general users |
| D7 | **Shared repo area labels** (`data`, `website`, future `code`) + one provenance label `via:report-tool` | Hand-filed and tool-filed issues share taxonomy; provenance marks machine-parseable bodies |
| D8 | Per-item actions collapse into a **kebab menu** (Report / Share / Open-in-admin) | Three actions per item is past the point for loose icons |
| D9 | **Cloudflare Turnstile** + soft rate limit + length caps guard the public endpoint | Anonymous public write endpoint will be abused |
| D10 | Migrate **hand-added** annotations to GitHub; auto-scan findings stay a local lint | Auto-scan notes regenerate every run; not tracked state |

## 3. The two-repo (private intake) model — D2 detail

```
                        ┌─────────────────────────┐
   App report form ───► │  PRIVATE intake repo     │  (issues land here)
   (anonymous)          │  jastrow-reports (TBD)   │
                        └───────────┬─────────────┘
                                    │  triage: scrub PII, confirm
                                    │  gh issue transfer <n> <public-repo>
                                    ▼
                        ┌─────────────────────────┐
                        │  PUBLIC repo (jastrow)   │  (contributors, PRs)
                        └─────────────────────────┘
```

- **Both repos must be owned by the same account/org** or `gh issue transfer`
  is blocked by GitHub.
- The Worker's GitHub credential is scoped to **`issues:write` on the private
  intake repo only** — minimal blast radius if the Worker is compromised.
- Labels created on the public repo are **not** auto-created on the private
  repo (and transfer drops labels the target lacks); create the shared label
  set in **both** repos.
- Promotion is a manual maintainer step; can be done occasionally.

## 4. Architecture

### 4.1 Runtime hosts

| Host | Entry | Used for |
|------|-------|----------|
| Cloudflare Worker | `main` in `wrangler.jsonc` → `fetch` routes `/api/report` | Production + per-PR preview |
| Bun dev server | mounts handler at `/api/report` route | Local dev (`bun start`) |
| `wrangler dev` | serves assets + Worker on real runtime | Pre-deploy faithful check |

Both Workers and Bun speak the Web Fetch API, so the handler is written once
against `(request: Request) => Promise<Response>`. Only secret access differs,
abstracted behind `getSecret(env, name)` (`env` binding on Workers,
`process.env` on Bun).

### 4.2 Request flow

```
[ Report button ] (online only)
      │  POST /api/report  { category, description, turnstileToken, context }
      ▼
[ shared handler ]
   1. Verify Turnstile token (siteverify, server secret)   → 403 on fail
   2. Rate-limit check (KV, per-IP, soft)                   → 429 on exceed
   3. Validate: category ∈ {data, website}; length caps     → 400 on fail
   4. Sanitize description: strip markdown, neutralize @ / # → safe text
   5. Build issue body (JSON.stringify) + structured block
   6. POST GitHub Issues API (private intake repo)          → 201
   7. Return { ok, issueUrl } (or generic error)
```

### 4.3 Issue body shape

Tool-created issues embed a machine-readable context block, parsed only when
`via:report-tool` is present:

```
<!-- jastrow-report: {"rid":"...","headword":"...","version":"...","route":"..."} -->

<user description, sanitized to plain text>
```

## 5. Security

### 5.1 API integrity (answers "can input inject into the API call?")

Properly built, **no** — user input is data, not code:

- Build the request body with `JSON.stringify(...)`, never string
  concatenation of JSON.
- REST endpoint; if GraphQL is ever used, use **variables**, not interpolation.
- User text goes **only in the body**, never in HTTP headers (CRLF injection).
- Enforce length caps server-side (GitHub title/body limits; reject oversized
  to prevent DoS).

### 5.2 Content sanitization (separate from 5.1)

GitHub sanitizes its own HTML rendering, so XSS-on-GitHub is not the threat.
The real risks and their layer:

| Threat | Layer | Mitigation |
|--------|-------|------------|
| `@mention` notification spam, `#ref` cross-links | submit | Strip markdown + neutralize `@`/`#` (e.g. `strip-markdown` / remark, or escaper) |
| Markdown/link injection (misleading formatting) | submit | Same — treat input as plain text |
| Stored XSS when **our** app/admin renders the text | render | **DOMPurify** (already used in project) |

### 5.3 Abuse controls

| Control | Setting (config-tunable) |
|---------|--------------------------|
| Turnstile | Widget on form + server-side `siteverify` |
| Rate limit (soft, per-IP, KV) | 5/min, 40/hr, 150/day → friendly message + `Retry-After`, never a hard ban |
| Length caps | Title/description bounded; oversized rejected |

Rate limits are generous so a legitimate auditor filing many reports does not
trip them; tune up after observing real usage.

### 5.4 Secrets

| Secret | Local | Cloud |
|--------|-------|-------|
| Turnstile secret | `.dev.vars` / `.env` (gitignored) | Dashboard, **both preview + production** |
| GitHub App installation token (`issues:write` on `jastrow-reports`; issues authored as `jastrow-app[bot]`) | same | same |

Never commit secrets to `wrangler.jsonc`. **Gotcha:** a preview deployment
without these set will fail only in preview.

## 6. UI

### 6.1 Kebab menu (per item)

Replaces loose per-item icons. Uses `wa-dropdown` (pattern already in
`app.js:1642`) with `fa-ellipsis-vertical` trigger.

| Item | Icon | Shown when |
|------|------|-----------|
| Report issue | `fa-flag` | Online |
| Share link | (existing) | Always |
| Open in admin | (existing) | `hostname === 'localhost'` / maintainer only — avoids a dead `localhost:3333` link in production |

### 6.2 Report entry points

| Surface | Category | Context captured |
|---------|----------|------------------|
| Per-entry kebab | `data` | headword, `#rid`, app version (`data/version.json`) |
| One global entry point (app menu/footer) covering special pages (sages, guide, abbreviations, page-scan) | `website` | current route, app version, user agent |

### 6.3 Report dialog

Simple popup: description textarea + Turnstile widget + submit. No dropdown
(category is fixed by which button opened it).

### 6.4 Report target flag (`REPORT_TARGET`)

Controls whether the report form is active locally. **Same-origin only** — no
cross-origin-to-production mode (that would require loosening prod CORS and
adding `localhost` to the prod Turnstile domains, which we reject as not worth
the security cost).

| Mode | Endpoint | Result |
|------|----------|--------|
| `auto` (default) | same-origin `/api/report` if secrets present, else `off` | Maintainer gets it; contributor sees it disabled |
| `local` | same-origin `/api/report` | Force-on with local secrets |
| `off` | — | Disabled with note: *"Reporting runs on the live site and PR preview deploys"* |

**Contributor path:** a contributor without secrets sees report disabled
locally and exercises it on their **PR preview URL** (secrets + same-origin +
matching Turnstile domain already in place). No production loosening required.

**Note:** the **admin tool needs no secrets** to run — it edits
`annotations.json` locally and never calls GitHub/Turnstile. Reading private
intake issues for triage uses the maintainer's own `gh` CLI login, not a
deployed app secret. So contributors editing data manage zero secrets.

### 6.5 Offline behavior

- Disable report controls when offline — `online`/`offline` events +
  `navigator.onLine` as the first cue.
- Treat the fetch failure as the real backstop (`navigator.onLine` reports
  `true` on captive portals).
- Service worker must treat `/api/report` as **network-only** (never cache),
  consistent with the existing "SW bypasses data files" rule.

## 7. Local dev & contributor DX

- Extend the Bun admin server to **also serve the main app**, so contributors
  run one command (`bun start`) for app + working report endpoint.
- Keep admin routes **gated/separate** so contributor builds don't expose the
  admin tool.
- `.env` / `.dev.vars` provides Turnstile **test keys** (always-pass) and a
  GitHub token pointing at a **test/private** repo.
- If secrets are absent, report disables itself with a clear "set up `.env` to
  test reporting" message rather than erroring.
- Per-PR **preview URLs** (Cloudflare ↔ GitHub integration, already active)
  give real-runtime testing before merge — requires preview-env secrets.

## 8. Existing annotations migration

Source: `data/admin/annotations.json`. The admin "Issues" tab auto-scan
(`admin.html:3914`) generates exactly three ephemeral notes, cleared and
regenerated each run:

- `Column not mapped` (`page-column`) — **dropped, not migrated**
- `Unresolved headword link pattern` (`word-link`)
- `Nested <a> tags detected in definition` (`data-quality`)

Migration:

1. Export **hand-added** annotations only (everything **not** in the auto-scan
   `AUTO_NOTES` set).
2. `gh issue create` each into the private intake repo with `data` +
   `via:report-tool` (or area as appropriate).
3. Leave auto-scan as a **local lint** — migrating regenerating findings is
   pointless.

## 8a. Admin issue worklist (pull from GitHub)

The admin **Issues tab** gains a worklist of open reports pulled from the
private intake repo. **Read-only, button-driven, no app secret** — it shells
out to the maintainer's existing `gh` CLI auth.

### Flow

```
Issues tab → [Sync from GitHub] button
  → POST /admin/sync-issues          (LOCAL Bun server only — never deployed)
  → gh issue list --repo <intake> --label via:report-tool
       --state open --json number,title,body,labels,createdAt,url
  → parse; extract structured context block (RID/headword) when present
  → write data/admin/github-issues.cache.json
  → render in Issues tab, read-only, each linking to its GitHub issue
```

### Storage decision — separate cache, NOT `annotations.json`

Pulled issues go into a **dedicated cache file**, not merged into
`annotations.json`, because:

| Risk if merged | Reason |
|----------------|--------|
| Source-of-truth conflict | GitHub is authoritative for issues; the file would be a stale mirror |
| Auto-scan clobber | `runAutoScan()` clears/regenerates notes each run (`admin.html:3921`) |
| Mixed data shapes | Annotations are RID-keyed QA notes; reports may not map to an RID |

When a report's context block carries an RID, **link** it to that entry for
display — do not convert it into an annotation. GitHub stays the single source
of truth; the cache is a disposable local view.

### Gotchas

| Gotcha | Handling |
|--------|----------|
| Command injection | Use arg-array spawn (`Bun.spawn([...])`), never an interpolated shell string |
| `gh` missing / not authenticated | Catch non-zero exit → "run `gh auth login`" message |
| Endpoint exposure | `/admin/sync-issues` exists only on the local Bun server, never deployed |

### Future (still secret-free)

Triage write-backs (`gh issue close`, label edits) run through the same `gh`
auth — "mark resolved" buttons stay secret-free. Out of initial scope.

## 9. CI

| Check | Catches |
|-------|---------|
| `biome check .` | Existing lint/format gate |
| Unit test handler | Validation, sanitization, label logic (pure function — no server needed) |
| Turnstile-fail path | Rejects on invalid token |
| Mock GitHub call | Asserts correct payload (`JSON.stringify`, labels) without hitting the API |
| `wrangler` build/typecheck (optional) | Function compiles for the Workers runtime |

## 10. Config changes required

| File / place | Change |
|--------------|--------|
| `wrangler.jsonc` | Add `"main"` Worker entry; add **KV namespace binding** for rate limiting |
| Bun server | Mount shared handler at `/api/report`; serve main app; gate admin routes |
| `.gitignore` | Ensure `.env` / `.dev.vars` ignored |
| Cloudflare dashboard | Set Turnstile + GitHub secrets for preview **and** production |
| Both GitHub repos | Create shared label set (`data`, `website`, `via:report-tool`, …) |
| Service worker (`sw.js`) | `/api/report` → network-only |

## 11. Phased implementation

1. **Kebab menu refactor** — absorb Share + Open-in-admin + Report slot (UI
   only, report disabled placeholder).
2. **Shared handler + Worker entry + Bun mount** — `/api/report`, Turnstile,
   validation, sanitization, GitHub call; secrets wired.
3. **Report dialog + buttons** — data (per-entry) + website (global), offline
   gating, SW network-only rule.
4. **Annotation export script** — hand-added annotations → `gh issue create`.
5. **Admin issue worklist** — `[Sync from GitHub]` button → `gh issue list` →
   separate cache → render in Issues tab (§8a).
6. **CI tests** — handler unit tests + mock GitHub.

## 12. Open questions

| # | Question | **Resolved** |
|---|----------|--------------|
| Q1 | GitHub auth | **GitHub App**, `issues:write` on intake repo. Issues are authored by the app's **bot identity** (`jastrow-app[bot]`), not the maintainer |
| Q2 | Private intake repo name | **`jastrow-reports`** (same owner as public repo) |
| Q3 | KV namespace for rate limiting | **Yes** — create it |
| Q4 | Optional reporter contact field | **No** — keep reports anonymous and quick to file (encourages reporting) |
| Q5 | Admin issue worklist | Issues tab pulls via `gh` (read-only, button-driven, separate cache) — see §8a |
```