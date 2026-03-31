# Dynamic Abbreviation Tooltips

**Date:** 2026-03-31
**Status:** Draft
**Enhancement:** Abbreviation tips from JSON data instead of hard coded

## Problem

Abbreviation expansions are baked into the JSONL dictionary data as
`<abbr title="especially">esp.</abbr>` tags (Stage 4 of the archived
data pipeline). This means:

- Changing an abbreviation expansion requires re-processing the entire
  JSONL dataset
- The `title` attribute contains only the original Jastrow-era text
  (e.g. "ad locum"), not the modern plain-English version ("at that
  passage") that exists in `jastrow-abbr.json`
- `trustedHTML()` rewrites every `<abbr>` node into span-based tooltips
  on every render — unnecessary DOM mutation in the hot path
- The abbreviation dialog fetches its own copy of the JSON file
  separately from the rest of the data pipeline

## Design

### Data layer

**One-time JSONL rewrite:** Strip `title="..."` attributes from all
`<abbr>` tags in `data/jastrow-part1.jsonl` and
`data/jastrow-part2.jsonl`. Tags become bare `<abbr>esp.</abbr>`.

**IDB abbreviation store:** `data-loader.js` loads `jastrow-abbr.json`
into IndexedDB alongside the dictionary data, keyed by abbreviation
text (e.g. `"esp."`). Versioned with the same `version.json` cache
invalidation. The in-memory lookup map is a plain object:

```js
{ "esp.": { original: "especially", modern: "especially" },
  "a. l.": { original: "ad locum", modern: "at that passage" },
  ... }
```

### Tooltip rendering

**Event delegation** replaces the `trustedHTML()` rewrite. Two
delegated listeners on the entry scroll container:

1. **`pointerenter`** (capture phase) — on `<abbr>` elements, looks up
   `abbr.textContent` in the in-memory map and shows a tooltip with the
   `modern` expansion text. Tooltip is created lazily on first hover
   and reused.

2. **`click`** — on `<abbr>` elements, opens the abbreviations dialog
   with the search filter pre-populated to that abbreviation's text,
   scrolling to and highlighting the matching row.

### `trustedHTML()` simplification

Remove the `<abbr>` → span conversion loop. The method becomes a
passthrough (parse HTML into a DocumentFragment, return it). Keep the
method name — it documents that the HTML is trusted pipeline output.

### Abbreviations dialog

The dialog currently fetches `jastrow-abbr.json` independently via
`_loadJastrowAbbreviations()`. Change it to read from the same IDB
store / in-memory map used by tooltips. This eliminates a redundant
network request and ensures a single source of truth.

The `_abbrDataCache` property is replaced by the shared map.

### Hebrew abbreviations

The Hebrew abbreviation tab (`jastrow-hebrew-abbr.json`) is unaffected.
It uses a different data format (Sefaria text array) and has no inline
tooltip equivalent. It continues to load independently.

## Components changed

| File | Change |
|---|---|
| `data/jastrow-part1.jsonl` | Strip `title` from `<abbr>` tags |
| `data/jastrow-part2.jsonl` | Strip `title` from `<abbr>` tags |
| `assets/scripts/data-loader.js` | Load `jastrow-abbr.json` into IDB |
| `assets/scripts/app.js` | Delegated listeners, simplify `trustedHTML()`, dialog reads from shared map |
| `assets/styles/styles.css` | Style `<abbr>` hover state (cursor, underline) |
| `sw.js` | Add `jastrow-abbr.json` to data file list if not already cached |

## Data flow

```
App init
  └─ data-loader fetches jastrow-abbr.json → IDB store
  └─ builds in-memory abbrMap (object keyed by abbreviation text)

User scrolls to entry
  └─ trustedHTML() parses HTML → DocumentFragment (no rewriting)
  └─ bare <abbr>esp.</abbr> rendered to DOM

User hovers <abbr>
  └─ pointerenter (delegated) fires
  └─ abbrMap["esp."] → { modern: "especially" }
  └─ tooltip shown

User clicks <abbr>
  └─ click (delegated) fires
  └─ opens abbreviation dialog
  └─ search filter set to "esp."
  └─ row scrolled into view and highlighted
```

## Edge cases

- **Map not yet loaded:** If abbreviation data hasn't loaded from IDB
  yet (cold start, slow device), the hover handler silently does
  nothing. No tooltip is better than a broken one.
- **Unknown abbreviation:** If `abbr.textContent` has no match in the
  map, skip silently. The `<abbr>` still renders as styled text.
- **Abbreviations with special characters:** Keys like `a. l.` include
  periods and spaces. Lookup is by exact `textContent` match, which
  handles this naturally.
- **Nested or malformed `<abbr>`:** DOMPurify strips nesting. Only
  flat `<abbr>text</abbr>` passes through.

## Out of scope

- Hebrew abbreviation tooltip integration (different data format)
- Changes to the archived data processing pipeline scripts
- Abbreviation data editing UI
