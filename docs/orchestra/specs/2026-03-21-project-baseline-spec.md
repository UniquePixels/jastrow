# Jastrow Dictionary PWA — Baseline Project Spec

> Canonical reference for the complete project as of 2026-03-21. All phases complete.

## Overview

A Progressive Web App for browsing Marcus Jastrow's *Dictionary of the Targumim, the Talmud Babli and Yerushalmi, and the Midrashic Literature* (1903 edition). ~32,000 entries across ~1,704 printed pages. Includes a Talmudic Sages interactive explorer and a local-only data admin tool.

**Live:** https://uniquepixels.xyz/talmud/
**Hosting:** Cloudflare Pages (static deploy from Jekyll site)
**Admin:** `bun run talmud/data/admin/server.ts` → http://localhost:3333

---

## Tech Stack

| Layer | Technology | Notes |
|-------|-----------|-------|
| Runtime | Vanilla JS (no framework, no bundler, no ES modules) | Globals via `window.*`, strict script load order |
| UI Components | Web Awesome | CDN kit, web components (wa-page, wa-input, wa-button, wa-dialog, wa-toast, etc.) |
| Icons | Font Awesome Pro | CDN kit (includes custom: fa-sefaria, fa-mercava, fa-svara) |
| Sages Graph | D3.js 7.9.0 | Chronological SVG visualization |
| Virtual Keyboard | simple-keyboard 3.8.120 | SRI-hashed CDN |
| XSS Protection | DOMPurify 3.0.8 | SRI-hashed CDN, afterSanitizeAttributes hook |
| Persistence | IndexedDB | Dictionary entry cache with version-gated invalidation |
| Offline | Service Worker v1.2.0 | Network-first for app, cache-first for static, bypass for data |
| Data Format | JSONL (streaming) + JSON | Pre-processed 8-stage pipeline |
| Admin Server | Bun (TypeScript) | Local-only, REST API, reads/writes live data files |
| Build | Jekyll (minimal-mistakes-jekyll) | Parent site includes `talmud/` as static directory |

---

## File Structure

```
talmud/
├── index.html                          # SPA shell, CDN deps, dialogs, inline routing
├── sw.js                               # Service Worker v1.2.0
├── assets/
│   ├── scripts/
│   │   ├── app.js                      # JastrowApp class (~2123 lines)
│   │   ├── data-loader.js             # JastrowDataLoader — JSONL streaming, IDB, indexes
│   │   ├── scroll-manager.js          # InfiniteScroll — bidirectional, DOM eviction
│   │   ├── constants.js               # All config constants (IIFE → window.*)
│   │   ├── sanitizer.js               # XSS utilities (IIFE → window.*)
│   │   ├── keyboard.js               # Hebrew virtual keyboard (lazy init)
│   │   ├── sages.js                   # TalmudSagesExplorer orchestrator
│   │   ├── sages-data.js             # SagesData — relationship index, search
│   │   ├── sages-graph.js            # SagesGraph — D3.js SVG layout
│   │   └── sages-sidebar.js          # SagesSidebar — detail panel
│   ├── styles/
│   │   ├── styles.css                 # Main app styles (~560 lines)
│   │   └── sages.css                  # Sages feature styles (~338 lines)
│   └── images/                        # book.svg, sefarialogo.svg, favicon/
├── data/
│   ├── jastrow-part1.jsonl            # ~16K processed entries (short keys)
│   ├── jastrow-part2.jsonl            # ~16K processed entries (short keys)
│   ├── sages.json                     # 155 Talmudic sages + landmarks
│   ├── jastrow-abbr.json              # English abbreviations
│   ├── jastrow-hebrew-abbr.json       # Hebrew/Aramaic abbreviations (Sefaria format)
│   ├── version.json                   # Cache invalidation timestamp
│   ├── admin/
│   │   ├── server.ts                  # Bun REST API server (382 lines)
│   │   ├── admin.html                 # Admin UI — 6 tabs (~4700 lines)
│   │   ├── server.test.ts             # API tests (Bun test runner, 7 tests)
│   │   ├── annotations.json           # Issue tracking data
│   │   └── scripts/
│   │       └── ai-classify.ts         # Batch POS/gender classification
│   └── raw/                           # Original unprocessed source data (archive)
└── misc/
    └── data-cleanup-15/               # Legacy page-column mapper tool
```

---

## Script Load Order (critical — no bundler)

```
1. constants.js        → window.PAGINATION, SCROLL, DICTIONARY, SEARCH, IDB, etc.
2. DOMPurify           (CDN)
3. sanitizer.js        → window.sanitizeURL, sanitizeSearchQuery, validatePageNumber
4. SimpleKeyboard      (CDN)
5. keyboard.js         → lazy SimpleKeyboard init via MutationObserver
6. data-loader.js      → window.JastrowDataLoader
7. scroll-manager.js   → window.InfiniteScroll
8. sages-data.js       → window.SagesData
9. sages-graph.js      → window.SagesGraph
10. sages-sidebar.js   → window.SagesSidebar
11. sages.js           → window.TalmudSagesExplorer
12. app.js             → window.JastrowApp (auto-instantiates on DOMContentLoaded)
```

---

## Entry Data Schema (processed JSONL, short keys)

```json
{
  "hw": "אָמַר",           // headword (Hebrew/Aramaic with vowel marks)
  "id": "A00001",          // unique entry RID
  "p": 1,                  // dictionary page (1–1704)
  "col": "a",              // column: "a" | "b" | "?"
  "ph": "אָמַץ",           // previous headword
  "nh": "אמר II",          // next headword
  "g": {                   // grammar (optional)
    "l": "bh",             // language: bh|he|ar|ar+he|ar+bh|he+ar|ab
    "ps": "n",             // POS: n|v|a|av|pt|ij|cj
    "gn": "m"              // gender: m|f
  },
  "li": "<i>b. h.</i>",   // language info HTML
  "c": {                   // content
    "s": [{                // senses array (recursive)
      "d": "definition HTML",  // pre-processed, trusted
      "n": "1) ",              // sense number label
      "g": {                   // grammar section (verb binyan)
        "vs": "Nif.",          // verbal stem
        "bf": ["שׁמע"]         // binyan forms
      },
      "s": [...]               // nested sub-senses
    }]
  },
  "rf": {                  // references (optional)
    "t": ["Berakhot 28b"],  // Talmud
    "b": ["Genesis 2:24"],  // Bible
    "mi": ["..."],          // Midrash
    "j": ["אָב"],           // Jastrow cross-refs
    "o": ["..."]            // Other
  }
}
```

Definition HTML may contain: `<a href="#rid:ID" class="word-link">`, `<abbr title="...">`, `<span dir="rtl">`, inline formatting tags. `trustedHTML()` converts `<abbr>` to span-based tooltips at render time.

---

## Sages Data Schema

```json
{
  "sages": [{
    "id": "hillel-the-elder",
    "name": { "en": "Hillel the Elder", "he": "הלל הזקן" },
    "era": "tanna",               // tanna | amorai
    "generation": 1,              // Tanna 1–5, Amora 1–7
    "dates": { "born": -110, "died": 10, "approximate": true },
    "location": "israel",         // israel | bavel
    "locations": ["Jerusalem"],
    "nasi": true,
    "relationships": [{ "type": "teacher", "target": "shammai" }],
    "bio": "...",
    "teachings": ["..."],
    "stories": ["..."],
    "sefariaTopicSlug": "hillel"
  }],
  "landmarks": [{ "year": -200, "label": "Hasmonean Period" }]
}
```

Relationship types: `teacher`, `father`, `son`, `wife`, `husband`, `brother-in-law`, `sibling`, `student` (student is inferred inverse of teacher by SagesData).

---

## URL Routing (hash-based)

| Pattern | Action |
|---------|--------|
| `(empty)` | Load dictionary page 1 |
| `#<number>` | Load dictionary page N |
| `#<Hebrew>` | Word search |
| `#word=<HEADWORD>` | Word search (abbreviation link) |
| `#ref:<Tractate_N>` | Reference search |
| `#rid:<ID>` | Permalink to specific entry |
| `#scan:<number>` | Page scan dialog (Archive.org IIIF) |
| `#guide` | Entry guide dialog |
| `#abbreviations` | Abbreviations dialog |
| `#sages` | Talmudic Sages explorer |
| `#sage:<id>` | Specific sage detail |

All routing via `history.pushState` + `popstate`/`hashchange` listeners. Dialogs routed by inline script in index.html; all others by `app.js:handleURLParameters()`.

---

## Data Flow

```
JSONL files ──fetch──► JastrowDataLoader
                         ├── streaming parse (line-by-line)
                         ├── build 4 indexes (headword, page, reference, rid)
                         ├── build sorted arrays (binary search)
                         └── cache to IndexedDB (500-entry batches)
                                │
User search ──► sanitizeSearchQuery() ──► DataLoader.searchByHeadword()
                                           or searchByReferencePrefix()
                                │
                         entry results
                                │
                         ──► InfiniteScroll.loadInitial(page, entryIndex)
                                │
                         ──► app.createEntryElement(entry)
                                │
                         ──► trustedHTML(sense.d) via <template>
                                │
                         ──► DOM <main>
```

---

## Offline Strategy

**Layer 1 — Service Worker:** Caches static assets (HTML, JS, CSS, images, sages.json, abbreviations). Does NOT cache JSONL data files or version.json — those bypass SW entirely.

**Layer 2 — IndexedDB:** Caches all 64K dictionary entries. Version-gated: `version.json` is fetched on every load (2s timeout); if version matches stored version, entries load from IDB (<1s). If mismatch, full re-download + re-cache.

**SW Update:** New SW installs but waits → app detects `registration.waiting` → shows update toast → posts `SKIP_WAITING` → reloads on `controllerchange`.

---

## Security Model

- **User input:** `sanitizeSearchQuery()` strips HTML via DOMPurify, enforces 100-char limit
- **URLs:** `sanitizeURL()` validates protocol + hostname allowlist (sefaria.org, archive.org)
- **Page numbers:** `validatePageNumber()` enforces 1–1704 range
- **Dictionary HTML:** Pre-sanitized in build pipeline; rendered via `<template>` element (scripts don't execute)
- **External links:** DOMPurify `afterSanitizeAttributes` hook adds `target="_blank" rel="noopener noreferrer"`
- **SRI:** Applied to simple-keyboard and DOMPurify CDN loads; WA/FA kit loaders exempt (documented with nosemgrep)

---

## Performance Patterns

- **Binary search:** O(log n) headword/reference lookup on sorted arrays
- **DOM cap:** InfiniteScroll evicts at 250 entries (top or bottom) with scroll position compensation
- **Sefaria prepend pattern:** Backward scroll uses offscreen staging div + ResizeObserver settle to prevent viewport jump (Safari has no CSS overflow-anchor)
- **Streaming JSONL:** ReadableStream line-by-line parse with inline indexing during download
- **Lazy init:** Keyboard, sages explorer, dialog content all deferred until first use
- **IDB batch writes:** 500-entry batches; version stamp written only after all batches confirm

---

## Admin Tool

Local-only Bun server at port 3333. Reads/writes the same data files the PWA uses.

**API:** 13 REST endpoints — CRUD for entries, sages, abbreviations, annotations. Bulk save for page mapper. Claude CLI research endpoint for sage enrichment.

**UI (admin.html):** 6 tabs — Entry Editor (split preview/form with draggable divider, navigation bar), Page Mapper (batch column assignment with letter boundary detection), Issues (filterable annotations with auto-scan and pagination), Abbreviations (English + Hebrew sub-views), Sages (sidebar list + detail editor with relationship management + Claude research), Stats Dashboard (data quality metrics).

**AI tools:**
- `POST /api/sage/:id/research` — spawns `claude -p --output-format json` for sage enrichment
- `scripts/ai-classify.ts` — standalone batch script using Claude API for POS/gender classification

---

## Key Constants

| Constant | Value | Purpose |
|----------|-------|---------|
| `SCROLL.DOM_CAP` | 250 | Max DOM entries before eviction |
| `SCROLL.LOAD_THRESHOLD` | 800px | Distance from edge to trigger chunk load |
| `PAGINATION.MAX_REFERENCE_RESULTS` | 50 | Reference search result cap |
| `DICTIONARY.TOTAL_PAGES` | 1704 | Total printed dictionary pages |
| `DICTIONARY.ARCHIVE_IMAGE_OFFSET` | 15 | Archive.org front-matter page offset |
| `IDB.BATCH_SIZE` | 500 | IndexedDB write batch size |
| `IDB.VERSION_TIMEOUT` | 2000ms | Version check fetch timeout |
| `SEARCH.AUTOCOMPLETE_DEBOUNCE` | 150ms | Input debounce for suggestions |
| `SEARCH.MAX_SUGGESTIONS` | 8 | Max autocomplete items |
| `SEARCH.MAX_HISTORY` | 20 | Search history cap in localStorage |
| SW `CACHE_VERSION` | `jastrow-v1.2.0` | Must bump manually on deploy |

---

## Deployment

1. Data changes via admin tool → `version.json` updated automatically
2. Commit changed files to git
3. Push to main → Cloudflare Pages deploys via Jekyll build
4. Jekyll includes `talmud/` as static dir, excludes `talmud/data/admin/` and `talmud/misc/`
5. JSONL files split into two parts due to Cloudflare 25MB per-file limit
6. App code changes require bumping `CACHE_VERSION` in `sw.js`
