# Architecture & Module Map

A quick orientation for contributors. The app is **vanilla JavaScript —
no framework, no bundler, no build step.** Scripts load as plain
`<script defer>` tags in `index.html` and communicate through a small set
of `window` globals. There is nothing to compile: edit a file, reload the
page.

## Runtime shape

- **Single-page app** — `index.html` is the shell; all views render into
  it. Routing is hash-based (`#headword`, `#rid:ID`, `#sages`,
  `#sage:ID`, etc.) — see `assets/scripts/app.js`.
- **Data lives in IndexedDB.** The dictionary ships as two JSONL files
  (`data/jastrow-part1.jsonl`, `data/jastrow-part2.jsonl`) that are parsed
  once and stored in IndexedDB. The service worker (`sw.js`) is
  cache-first for assets, network-first for app files, and **bypasses the
  data files** — IndexedDB owns persistence.
- **Components** come from [Web Awesome](https://www.webawesome.com/),
  loaded via a CDN kit. They render **asynchronously**, which is why
  scroll prepends use an offscreen staging pattern (see
  `assets/scripts/scroll-manager.js`).

## Load order

Scripts are `defer`-loaded in `index.html` in this order. CDN libraries
load first so the app scripts can rely on them:

| # | Source | Provides |
|---|---|---|
| — | CDN: DOMPurify, simple-keyboard, d3, Chart.js | `DOMPurify`, `SimpleKeyboard`, `SimpleKeyboardLayouts`, `d3`, `Chart` |
| 1 | `constants.js` | config globals (below) |
| 2 | `sanitizer.js` | `sanitizeURL`, `sanitizeSearchQuery`, DOMPurify hooks |
| 3 | `keyboard.js` | Hebrew on-screen keyboard overlay |
| 4 | `data-loader.js` | `JastrowDataLoader` — JSONL → IndexedDB |
| 5 | `scroll-manager.js` | `InfiniteScroll` — bidirectional scroll |
| 6 | `sages-data.js` | `SagesData` — sages dataset helpers |
| 7 | `sages-graph.js` | `SagesGraph` — D3 timeline graph |
| 8 | `sages-sidebar.js` | `SagesSidebar` — sage detail panel |
| 9 | `sages.js` | `TalmudSagesExplorer` — sages view controller |
| 10 | `rabbinic-time.js` | `RabbinicTime` — halachic-time dialog + chart |
| 11 | `announcer.js` | `announce(message, priority)` — SR live region |
| 12 | `app.js` | main app: routing, search, rendering, UI |

`app.js` dispatches a `jastrow-app-initialized` event on `window` once
boot completes.

## `window`-globals contract

Because there is no module system, cross-file dependencies are explicit
`window` globals. These are the declared globals (mirrored in
`biome.json` `javascript.globals` so the linter knows they're defined):

| Global | Defined in | Kind |
|---|---|---|
| `PAGINATION`, `SCROLL`, `DICTIONARY`, `SEARCH`, `TIMEOUTS`, `IDB` | `constants.js` | config objects |
| `sanitizeURL`, `sanitizeSearchQuery`, `validatePageNumber` | `sanitizer.js` | functions |
| `announce` | `announcer.js` | function |
| `JastrowDataLoader` | `data-loader.js` | class |
| `InfiniteScroll` | `scroll-manager.js` | class |
| `SagesData` | `sages-data.js` | class |
| `SagesGraph` | `sages-graph.js` | class |
| `SagesSidebar` | `sages-sidebar.js` | class |
| `TalmudSagesExplorer` | `sages.js` | class |
| `RabbinicTime` | `rabbinic-time.js` | `{ init }` |
| `DOMPurify`, `Chart`, `d3` | CDN | libraries |

**If you add a new top-level class or helper that other files use,** add
its name to `biome.json` `javascript.globals` or the linter will flag it
as undeclared.

## Security boundaries

- **All dynamic HTML is sanitized.** User-facing content is rendered
  through `DOMPurify`; links are forced `rel="noopener"`. Never assign
  raw `innerHTML` from data without going through the sanitizer.
- **Entry HTML is allow-listed.** Dictionary entry markup is restricted
  to a fixed tag/attribute allow-list, enforced both on the admin save
  path and in CI (`scripts/lib/entry-html.ts`). See
  [data-entry-schema.md](data-entry-schema.md).

## Where things live

| Path | Role |
|---|---|
| `index.html` | SPA shell |
| `sw.js` | service worker (cache strategy + IDB note) |
| `assets/scripts/` | app modules (table above) |
| `assets/styles/` | CSS, incl. `accessibility.css` |
| `data/*.jsonl` | dictionary data (edit via the admin tool — see CONTRIBUTING) |
| `data/admin/` | local-only Bun annotation server (never deployed) |
| `scripts/` | `validate:data` CLI + shared validators (`scripts/lib/`) |
