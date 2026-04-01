# Dynamic Abbreviation Tooltips Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace hard-coded `<abbr title>` tooltips with event-delegated tooltips powered by an IDB-cached abbreviation map, and make inline abbreviations clickable to jump to the abbreviations dialog.

**Architecture:** Strip `title` attributes from JSONL data. Load `jastrow-abbr.json` into IndexedDB via `data-loader.js` and expose an in-memory map. Delegated `pointerenter`/`click` listeners on the scroll container handle tooltip display and dialog navigation. The abbreviations dialog reads from the same shared map.

**Tech Stack:** Vanilla JS, IndexedDB, Web Awesome dialog components

---

### Task 1: Strip `title` attributes from JSONL data

**Files:**
- Modify: `data/jastrow-part1.jsonl`
- Modify: `data/jastrow-part2.jsonl`

One-time regex rewrite. Converts `<abbr title="...">text</abbr>` to `<abbr>text</abbr>`.

- [ ] **Step 1: Verify current state — count `<abbr title=` occurrences**

Run:
```bash
grep -c 'title=' data/jastrow-part1.jsonl
grep -c 'title=' data/jastrow-part2.jsonl
```

Record the counts. These are the "before" numbers.

- [ ] **Step 2: Run the rewrite on both files**

The `title="..."` attributes appear inside JSON string values where
quotes are escaped as `\"`. The pattern to strip is:
`title=\\"[^\\"]*\\"` followed by an optional trailing space.

```bash
sed -i '' 's/ title=\\"[^"]*\\"//g' data/jastrow-part1.jsonl
sed -i '' 's/ title=\\"[^"]*\\"//g' data/jastrow-part2.jsonl
```

- [ ] **Step 3: Verify the rewrite — zero `title=` on `<abbr>` tags, `<abbr>` tags still present**

```bash
grep -c 'title=' data/jastrow-part1.jsonl    # expect 0
grep -c 'title=' data/jastrow-part2.jsonl    # expect 0
grep -c '<abbr>' data/jastrow-part1.jsonl    # expect > 0
grep -c '<abbr>' data/jastrow-part2.jsonl    # expect > 0
```

- [ ] **Step 4: Spot-check a few entries to confirm structure**

```bash
python3 -c "
import json
with open('data/jastrow-part1.jsonl') as f:
    for i, line in enumerate(f):
        if '<abbr>' in line:
            entry = json.loads(line)
            print(json.dumps(entry, ensure_ascii=False)[:200])
            break
"
```

Confirm the output shows `<abbr>esp.</abbr>` (no `title`).

- [ ] **Step 5: Commit**

```bash
git add data/jastrow-part1.jsonl data/jastrow-part2.jsonl
git commit -s -m "$(cat <<'EOF'
🧺 chore(data): strip title attributes from abbr tags

Prepare JSONL data for dynamic abbreviation tooltips.
Expansions will come from jastrow-abbr.json at runtime
instead of baked-in title attributes.

Co-Authored-By: Claude Opus 4.6 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

### Task 2: Add abbreviation map to data-loader and IDB

**Files:**
- Modify: `assets/scripts/data-loader.js:7-21` (constructor)
- Modify: `assets/scripts/data-loader.js:58-77` (openDatabase)
- Modify: `assets/scripts/data-loader.js:273-397` (load method)
- Modify: `assets/scripts/constants.js:62-68` (IDB config)

The data-loader gains an `abbrMap` property (plain object) and a new
IDB object store `abbreviations`. On load, it fetches
`jastrow-abbr.json`, stores it in IDB, and builds the in-memory map.
On cache hit, it reads from IDB instead of fetching.

- [ ] **Step 1: Add `ABBR_STORE` constant and bump schema version**

In `assets/scripts/constants.js`, inside the `window.IDB` block
(line 62), add the new store name and bump the schema version so
`onupgradeneeded` fires on existing installs:

```js
window.IDB = {
    DATABASE_NAME: 'jastrow-dictionary',
    ENTRIES_STORE: 'entries',
    METADATA_STORE: 'metadata',
    ABBR_STORE: 'abbreviations',
    SCHEMA_VERSION: 2,
    BATCH_SIZE: 500,
    VERSION_URL: 'data/version.json',
    ABBR_URL: 'data/jastrow-abbr.json',
};
```

- [ ] **Step 2: Add `abbrMap` property to JastrowDataLoader constructor**

In `assets/scripts/data-loader.js`, add after `this.normalizedReferences = []` (line 18):

```js
this.abbrMap = {}; // abbreviation text -> { original, modern }
```

- [ ] **Step 3: Update `openDatabase()` to create the abbreviations store**

In the `onupgradeneeded` handler (line 65-72), add:

```js
request.onupgradeneeded = (event) => {
    const db = event.target.result;
    if (!db.objectStoreNames.contains(IDB.ENTRIES_STORE)) {
        db.createObjectStore(IDB.ENTRIES_STORE, { keyPath: 'id' });
    }
    if (!db.objectStoreNames.contains(IDB.METADATA_STORE)) {
        db.createObjectStore(IDB.METADATA_STORE, { keyPath: 'key' });
    }
    if (!db.objectStoreNames.contains(IDB.ABBR_STORE)) {
        db.createObjectStore(IDB.ABBR_STORE, { keyPath: 'key' });
    }
};
```

- [ ] **Step 4: Add `loadAbbreviations()` method to JastrowDataLoader**

Add this method after `clearCache()` (after line 219):

```js
/**
 * Load abbreviation data from IDB cache or network.
 * Populates this.abbrMap for runtime tooltip lookups.
 * @param {IDBDatabase} db
 * @param {boolean} needsNetwork - true if data version changed
 * @returns {Promise<void>}
 */
async loadAbbreviations(db, needsNetwork) {
    // Try IDB cache first
    if (!needsNetwork) {
        try {
            const cached = await new Promise((resolve) => {
                const tx = db.transaction(IDB.ABBR_STORE, 'readonly');
                const store = tx.objectStore(IDB.ABBR_STORE);
                const request = store.getAll();
                request.onsuccess = () => resolve(request.result || []);
                request.onerror = () => resolve([]);
            });
            if (cached.length > 0) {
                for (const item of cached) {
                    this.abbrMap[item.key] = {
                        original: item.original,
                        modern: item.modern,
                    };
                }
                if (window.DEBUG) {
                    console.log(
                        `[DataLoader] Loaded ${cached.length} abbreviations from IDB`,
                    );
                }
                return;
            }
        } catch {
            // Fall through to network
        }
    }

    // Network fetch
    try {
        const response = await fetch(IDB.ABBR_URL);
        if (!response.ok) {
            throw new Error(`Failed to load abbreviations: ${response.statusText}`);
        }
        const data = await response.json();
        const abbrs = data.abbreviations;

        // Build in-memory map
        for (const [key, value] of Object.entries(abbrs)) {
            this.abbrMap[key] = {
                original: value.original,
                modern: value.modern,
            };
        }

        // Write to IDB
        try {
            const tx = db.transaction(IDB.ABBR_STORE, 'readwrite');
            const store = tx.objectStore(IDB.ABBR_STORE);
            store.clear();
            for (const [key, value] of Object.entries(abbrs)) {
                store.put({
                    key,
                    original: value.original,
                    modern: value.modern,
                });
            }
            await new Promise((resolve, reject) => {
                tx.oncomplete = () => resolve();
                tx.onerror = (event) => reject(event.target.error);
            });
        } catch (writeError) {
            if (window.DEBUG) {
                console.warn(
                    '[DataLoader] Failed to cache abbreviations:',
                    writeError,
                );
            }
        }

        if (window.DEBUG) {
            console.log(
                `[DataLoader] Loaded ${Object.keys(abbrs).length} abbreviations from network`,
            );
        }
    } catch (error) {
        if (window.DEBUG) {
            console.warn('[DataLoader] Abbreviation load failed:', error);
        }
        // Non-fatal — tooltips will silently skip
    }
}
```

- [ ] **Step 5: Call `loadAbbreviations()` from the `load()` method**

In the `load()` method, after the entries are loaded (either from
cache or network) and before `db.close()` (line 369-371), add the
abbreviation load. The `needsNetwork` flag reuses the same version
check — if entries needed a refresh, abbreviations do too:

```js
// Load abbreviations (same version lifecycle as entries)
if (db) {
    await this.loadAbbreviations(db, !loadedFromCache);
}

if (db) {
    db.close();
}
```

Replace the existing `if (db) { db.close(); }` block at lines 369-371.

- [ ] **Step 6: Verify the changes compile and load**

Open the app in a browser. Check the console for:
- `[DataLoader] Loaded 280 abbreviations from network` (first visit)
- No errors

Refresh and check for:
- `[DataLoader] Loaded 280 abbreviations from IDB` (cached)

- [ ] **Step 7: Commit**

```bash
git add assets/scripts/constants.js assets/scripts/data-loader.js
git commit -s -m "$(cat <<'EOF'
🦄 new(data): load abbreviation map into IndexedDB

Add abbreviation data to the IDB cache alongside dictionary
entries. The in-memory abbrMap enables runtime tooltip lookups
without separate fetch requests.

Co-Authored-By: Claude Opus 4.6 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

### Task 3: Simplify `trustedHTML()` and add delegated tooltip listeners

**Files:**
- Modify: `assets/scripts/app.js:50-76` (constructor)
- Modify: `assets/scripts/app.js:130-153` (init)
- Modify: `assets/scripts/app.js:1085-1100` (trustedHTML)
- Modify: `assets/styles/styles.css:308-313` (abbr-tooltip styles)

Remove the `<abbr>` → span rewrite from `trustedHTML()`. Add
delegated `pointerenter` and `click` listeners on `mainContent` for
`<abbr>` elements. Style bare `<abbr>` elements with the dotted
underline previously on `.abbr-tooltip`.

- [ ] **Step 1: Simplify `trustedHTML()`**

Replace the method at `app.js:1085-1100` with:

```js
/**
 * Parse trusted HTML (pipeline output) into a DocumentFragment.
 * Only for pre-processed data from the build pipeline, never user input.
 */
trustedHTML(html) {
    const template = document.createElement('template');
    template.innerHTML = html; // nosemgrep: javascript.browser.security.insecure-document-method.insecure-document-method
    return template.content;
}
```

- [ ] **Step 2: Add `_setupAbbrListeners()` method**

Add this method after `_addTooltip()` (after line 822):

```js
/**
 * Set up delegated listeners for inline <abbr> tooltip and click-to-dialog.
 * Uses pointerenter (capture) for hover tooltips and click for dialog nav.
 */
_setupAbbrListeners() {
    const container = this.mainContent;
    if (!container) {
        return;
    }

    let activeTooltip = null;

    const hideTooltip = () => {
        if (activeTooltip) {
            activeTooltip.remove();
            activeTooltip = null;
        }
    };

    // Hover → show tooltip with modern expansion
    container.addEventListener(
        'pointerenter',
        (e) => {
            const abbr = e.target.closest('abbr');
            if (!abbr) {
                return;
            }

            const entry = this.dataLoader.abbrMap[abbr.textContent];
            if (!entry) {
                return;
            }

            hideTooltip();

            // Reuse the same tip-box/tip-arrow pattern as _addTooltip
            const tip = document.createElement('span');
            tip.className = 'has-tooltip abbr-tip-anchor';

            const box = document.createElement('span');
            box.className = 'tip-box';
            box.style.visibility = 'visible';
            box.textContent = entry.modern;

            const arrow = document.createElement('span');
            arrow.className = 'tip-arrow';
            arrow.style.visibility = 'visible';

            tip.append(box, arrow);

            // Position relative to the <abbr>
            abbr.style.position = 'relative';
            abbr.appendChild(tip);
            activeTooltip = tip;
        },
        { capture: true },
    );

    container.addEventListener(
        'pointerleave',
        (e) => {
            if (e.target.closest('abbr')) {
                hideTooltip();
            }
        },
        { capture: true },
    );

    // Click → open abbreviations dialog pre-filtered
    container.addEventListener('click', (e) => {
        const abbr = e.target.closest('abbr');
        if (!abbr) {
            return;
        }

        const key = abbr.textContent;
        if (!this.dataLoader.abbrMap[key]) {
            return;
        }

        this._openAbbrDialog(key);
    });
}
```

- [ ] **Step 3: Add `_openAbbrDialog()` helper method**

Add after `_setupAbbrListeners()`:

```js
/**
 * Open the abbreviations dialog and pre-filter to a specific abbreviation.
 * @param {string} key - The abbreviation text to search for
 */
_openAbbrDialog(key) {
    const dialog = document.querySelector('.abbr-dialog');
    if (!dialog) {
        return;
    }

    // Ensure dialog content is built
    if (!this._abbrDialogBuilt) {
        this.buildAbbreviationsDialog();
    }

    dialog.open = true;

    // Wait for dialog to render, then populate filter
    requestAnimationFrame(() => {
        const filter = dialog.querySelector('.abbr-filter');
        if (filter) {
            filter.value = key;
            filter.dispatchEvent(new Event('input'));
        }
    });
}
```

- [ ] **Step 4: Wire up listeners in `init()`**

In `app.js`, after the scroll manager init (after line 143
`this.scrollManager.init();`), add:

```js
// Delegated abbreviation tooltip + click-to-dialog listeners
this._setupAbbrListeners();
```

- [ ] **Step 5: Remove stale constructor property**

In the constructor (line 70), remove `this._abbrDataCache = null;` —
it's replaced by `dataLoader.abbrMap`.

- [ ] **Step 6: Update CSS — style bare `<abbr>` elements**

In `assets/styles/styles.css`, replace the `.has-tooltip.abbr-tooltip`
rule (lines 308-313) with a rule targeting bare `<abbr>` elements
inside entry content:

```css
/* Dotted underline for inline abbreviations (hover for expansion) */
.entry-content abbr {
    text-decoration: underline dotted;
    text-underline-offset: 2px;
    cursor: help;
}

/* Anchor for delegated abbreviation tooltip positioning */
.abbr-tip-anchor {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    pointer-events: none;
}
```

- [ ] **Step 7: Verify tooltips work**

Open the app, scroll to an entry with abbreviations (most entries
have them). Hover over a dotted-underline abbreviation:
- Tooltip appears with modern expansion text
- Tooltip disappears on mouse leave
- Clicking the abbreviation opens the dialog pre-filtered

- [ ] **Step 8: Commit**

```bash
git add assets/scripts/app.js assets/styles/styles.css
git commit -s -m "$(cat <<'EOF'
🌈 improve(ui): dynamic abbreviation tooltips via event delegation

Replace trustedHTML() DOM rewriting with delegated pointerenter/
click listeners. Tooltips now show modern expansions from the
shared abbrMap. Clicking an abbreviation opens the dialog
pre-filtered to that entry.

Co-Authored-By: Claude Opus 4.6 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

### Task 4: Abbreviations dialog reads from shared map

**Files:**
- Modify: `assets/scripts/app.js:1786-1837` (_loadJastrowAbbreviations)

Replace the independent `fetch('data/jastrow-abbr.json')` call with
a read from `this.dataLoader.abbrMap`.

- [ ] **Step 1: Rewrite `_loadJastrowAbbreviations()` to use abbrMap**

Replace the method at lines 1786-1837:

```js
/**
 * Render Jastrow abbreviations into a tab panel from the shared abbrMap.
 */
_loadJastrowAbbreviations(panel) {
    const abbrs = this.dataLoader.abbrMap;

    if (Object.keys(abbrs).length === 0) {
        const err = document.createElement('div');
        err.className = 'abbr-no-results';
        err.textContent = 'Abbreviation data not available.';
        panel.appendChild(err);
        return;
    }

    const grid = document.createElement('div');
    grid.className = 'abbr-grid';

    const sorted = Object.keys(abbrs).sort((a, b) =>
        a.localeCompare(b, undefined, { sensitivity: 'base' }),
    );

    for (const key of sorted) {
        const def = abbrs[key];
        const row = document.createElement('div');
        row.className = 'abbr-row';
        row.dataset.search =
            `${key} ${def.original} ${def.modern}`.toLowerCase();

        const term = document.createElement('div');
        term.className = 'abbr-term';
        term.textContent = key;

        const defDiv = document.createElement('div');
        defDiv.className = 'abbr-def';

        const modern = document.createElement('div');
        modern.className = 'abbr-modern';
        modern.textContent = def.modern;

        const original = document.createElement('div');
        original.className = 'abbr-original';
        original.textContent = `Originally: ${def.original}`;

        defDiv.append(modern, original);
        row.append(term, defDiv);
        grid.appendChild(row);
    }

    panel.appendChild(grid);
}
```

Note: the method is no longer `async` — no fetch needed.

- [ ] **Step 2: Update `buildAbbreviationsDialog()` caller**

In `buildAbbreviationsDialog()` (around line 1704-1708), the
`Promise.all` wraps both loaders. Since `_loadJastrowAbbreviations`
is now synchronous, update:

```js
// Load both data sources
this._loadJastrowAbbreviations(jastrowPanel);
await this._loadHebrewAbbreviations(hebrewPanel);
```

- [ ] **Step 3: Verify the dialog still works**

Open the abbreviations dialog:
- Jastrow tab shows all 280 abbreviations
- Search filter highlights and scrolls to matches
- Hebrew tab still loads independently
- Clicking an inline abbreviation opens dialog pre-filtered

- [ ] **Step 4: Commit**

```bash
git add assets/scripts/app.js
git commit -s -m "$(cat <<'EOF'
🌈 improve(ui): abbreviations dialog reads from shared abbrMap

Eliminate redundant fetch of jastrow-abbr.json. The dialog now
reads from the same in-memory map used by inline tooltips.

Co-Authored-By: Claude Opus 4.6 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

### Task 5: Lint check and final verification

**Files:**
- All modified files

- [ ] **Step 1: Run Biome lint**

```bash
biome check .
```

Fix any issues reported.

- [ ] **Step 2: Full smoke test**

Test these scenarios in the browser:

1. **Cold start** (clear IDB via DevTools > Application > IndexedDB > delete `jastrow-dictionary`):
   - App loads, abbreviation data fetched from network
   - Console shows abbreviation load message
   - Hover tooltips work on inline abbreviations
   - Abbreviations dialog works

2. **Warm start** (reload):
   - Abbreviation data loaded from IDB
   - Tooltips work immediately

3. **Offline** (DevTools > Network > Offline):
   - If IDB has cached data, tooltips work
   - Dialog works from cached map

4. **Click-to-dialog**:
   - Click inline abbreviation
   - Dialog opens, filter pre-populated
   - Correct row highlighted and scrolled to

5. **Unknown abbreviation**:
   - If any `<abbr>` text doesn't match the map, no tooltip shown, no error in console

- [ ] **Step 3: Commit any lint fixes**

```bash
git add -u
git commit -s -m "$(cat <<'EOF'
🧺 chore: fix lint issues from abbreviation changes

Co-Authored-By: Claude Opus 4.6 (1M context) <noreply@anthropic.com>
EOF
)"
```
