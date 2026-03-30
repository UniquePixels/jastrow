# Accessibility Refactor Spec

**Date**: 2026-03-28
**Status**: Complete
**Priority**: High
**Target**: WCAG 2.1 AA

## Overview

Comprehensive accessibility refactor for the Jastrow Dictionary PWA. 29 individual items grouped into 15 issue groups across 3 phases (Critical/Major/Minor). Each phase ships as a separate PR.

The target population has a wide range of accessibility needs — this work is critical for the project's mission.

## Decisions

- **Delivery**: Three separate PRs, one per phase, each independently shippable
- **Architecture**: Dedicated a11y layer — new `accessibility.css` and `announcer.js` files
- **Announcer pattern**: `window.announce(message, priority)` global, consistent with existing `window.*` globals
- **Sages graph keyboard**: Tab + Enter/Space + Escape (no spatial arrow-key nav — deferred)
- **WA-first principle**: Use Web Awesome utilities (`wa-visually-hidden`, `label` attribute, shadow DOM focus trap) wherever they exist; custom code only for gaps

## New Files

### `assets/styles/accessibility.css`

Loaded after `sages.css`. Contains all a11y-specific CSS:

- **Focus indicators**: Global `:focus-visible` on native elements (`a`, `button`, `[role="button"]`, `[tabindex="0"]`) and WA component parts (`wa-button::part(base)`, `wa-input::part(base)`, `wa-tab::part(base)`, `.sages-sidebar-close`). Style: `outline: 3px solid var(--wa-color-brand-fill-loud); outline-offset: 2px`
- **SVG node focus ring**: `.node:focus-visible .node-bg` with `stroke` and `drop-shadow` (SVG `<g>` elements cannot take CSS `outline`)
- **Skip link**: `.skip-link` — visually hidden, slides into view on focus via `transform`
- **Touch targets** (Phase 3): `.banner-dismiss` and `.sages-sidebar-close` get `min-width/min-height: 44px`
- **Reduced motion** (Phase 3): Global `@media (prefers-reduced-motion: reduce)` with `transition-duration: 0.01ms !important; animation-duration: 0.01ms !important; animation-iteration-count: 1 !important` on `*, *::before, *::after`

### `assets/scripts/announcer.js`

Loaded before `app.js`. Live region utility:

- On `DOMContentLoaded`, injects two `wa-visually-hidden` divs into `document.body`: one `aria-live="polite"`, one `aria-live="assertive"`, both `aria-atomic="true"`
- Exposes `window.announce(message, priority = 'polite')`
- Uses clear-then-set pattern: `textContent = ''` → 50ms `setTimeout` → `textContent = message` to ensure repeated identical messages still fire

## Phase 1 — Critical (PR #1)

Delivers: visible focus for keyboard users, AA contrast on all text, screen reader announcements for dynamic content.

### 1.1 Focus Indicators

- `accessibility.css`: Global `:focus-visible` styles (see New Files above)
- `index.html`: Load `accessibility.css` after `sages.css`

### 1.2 Color Contrast Fixes

All replacements use semantic WA tokens so they adapt to dark mode.

| File | Selector | Before | After |
|------|----------|--------|-------|
| `styles.css` | `.banner-dismiss` | `opacity: 0.5` | Remove opacity, `color: rgba(255,255,255,0.85)` (~9:1 on dark banner) |
| `styles.css` | `.autocomplete-mode` | `opacity: 0.5` | Remove opacity, `color: var(--wa-color-text-subtle)` |
| `styles.css` | `.abbr-original` | `opacity: 0.55` | Remove opacity, `color: var(--wa-color-text-subtle)` |
| `styles.css` | `.abbr-no-results` | `opacity: 0.5` | Remove opacity, `color: var(--wa-color-text-subtle)` |
| `styles.css` | `.guide-component-desc` | `opacity: 0.75` | Remove opacity, `color: var(--wa-color-text-subtle)` |
| `sages.css` | `.node-dimmed` | `opacity: 0.25` | `opacity: 0.4` (graphical contrast, WCAG 1.4.11 3:1) |

### 1.3 Live Region Announcements

- `index.html`: Load `announcer.js` before `app.js`
- `app.js` changes:
  - `showNoResults()` → `announce('No results found')`
  - `handleSearch()` → `announce('N results found')` on success
  - `showError()` → `announce(message, 'assertive')`
  - `showOfflineToast()` → `announce(message, 'assertive')` for offline, `'polite'` for back-online
  - `showLoadingIndicator()` → add `role="status"` to wrapper element

## Phase 2 — Major (PR #2)

Delivers: skip navigation, semantic heading hierarchy, full ARIA on autocomplete, keyboard-accessible sages graph, proper dialog focus management.

### 2.1 Skip Link

- `index.html`: `<a href="#main-content" class="skip-link">Skip to main content</a>` as first child of `<body>`
- `index.html`: `<main>` gets `id="main-content"`
- `accessibility.css`: Skip link styles (see New Files)

### 2.2 Heading Hierarchy

- `index.html`: Brand name wrapped in `<h1>` styled with `display: inline-flex; margin: 0; align-items: center` to preserve the flex layout. The `<a>` remains inside.

### 2.3 ARIA Labels

- `index.html`:
  - Logo link: `aria-label="Jastrow Dictionary home"`
  - Search `wa-input`: `label="Search dictionary"`
  - Page jump `wa-input`: `label="Page number"`
  - Share `wa-button`: `label="Share"`
  - Mobile menu `wa-button`: `label="Menu"`

### 2.4 Autocomplete ARIA

All changes in `app.js`:

- `_ensureDropdown()`: set `role="listbox"`, `id="search-autocomplete-list"`
- `_showDropdown()`: items get `role="option"`, `aria-selected`, unique `id`s; set `aria-expanded="true"` on search input
- `_highlightItem()`: update `aria-selected` and `aria-activedescendant` on search input
- `_hideDropdown()`: clear `aria-expanded`, `aria-activedescendant`
- `initializeUI()`: set `aria-autocomplete="list"`, `aria-controls="search-autocomplete-list"` on search input

### 2.5 Keyboard Navigation — Sages Graph

- `sages-graph.js` `_drawNodes()`: nodes get `tabindex="0"`, `role="button"`, `aria-label` (name + dates)
- `sages.js` `_initialize()`: extend existing keydown handler — Enter/Space on focused `.node` triggers `location.hash = #sage:id`
- `accessibility.css`: SVG node focus ring (see New Files)

### 2.6 Dialog Focus Management

- `app.js`: Store `document.activeElement` before `dialog.open = true`; restore focus in each dialog's `wa-hide` handler
- `index.html` inline script: shared `_dialogOpener` variable for guide/abbr dialog openers; same save/restore pattern

### 2.7 Sages Sidebar Focus

- `sages-sidebar.js` `open()`: `requestAnimationFrame(() => closeBtn.focus())`
- `sages-sidebar.js` `close()`: return focus to the previously selected graph node
- `sages.js`: track `_lastSelectedId` in `openSage()`

## Phase 3 — Minor (PR #3)

Delivers: touch target compliance, full reduced-motion support, dynamic page titles, form validation feedback, search bidi isolation.

### 3.1 Touch Targets

- `accessibility.css`: `.banner-dismiss` and `.sages-sidebar-close` get `min-width: 44px; min-height: 44px` with flex centering

### 3.2 Reduced Motion

- `accessibility.css`: Global `prefers-reduced-motion: reduce` rule (see New Files)
- `styles.css`: Remove the existing single-rule `@media (prefers-reduced-motion: reduce)` block for `.entry-highlight` (now covered globally)

### 3.3 Page Title Updates

All in `app.js`:
- `handleSearch()` → `document.title = '${query} - Jastrow Dictionary'`
- `loadInitialPage()` → `document.title = 'Jastrow Dictionary'`
- `jumpToDictPage()` → `document.title = 'Page ${n} - Jastrow Dictionary'`
- `_showSagesView()` → store `this._previousTitle = document.title`, then `document.title = 'Talmudic Sages - Jastrow Dictionary'`
- `_hideSagesView()` → `document.title = this._previousTitle`

### 3.4 Form Error Handling

- `app.js` `jumpToDictPage()`: set `aria-invalid="true"` on page input when validation fails; remove on valid input

### 3.5 Search Input Bidi

- `styles.css`: Add `unicode-bidi: isolate` to `.search.rtl-input::part(input)` rule

### 3.6 Sages Search Label

- `sages.js` `_buildToolbar()`: add `label="Search sages by name"` to the search input

## Risk Areas

| Risk | Mitigation |
|------|------------|
| `<h1>` in flex layout breaks brand row | Style with `display: inline-flex; margin: 0; align-items: center` |
| `aria-activedescendant` through WA shadow DOM | WA forwards ARIA to internal `<input>`; verify in browser; fallback to `shadowRoot.querySelector('input')` if needed |
| SVG `tabindex` on `<g>` in Safari | Spec-compliant in modern browsers; test manually |
| `wa-toast` may duplicate announcer | If WA toast has internal `aria-live`, announcer calls for toast-backed messages produce double announcements; remove announcer call if so |
| Global reduced-motion `!important` affects WA animations | Correct WCAG behavior; verify WA dialog/drawer still functions without animation |
| Contrast tokens in dark mode | `var(--wa-color-text-subtle)` adapts automatically; `.banner-dismiss` uses explicit `rgba` on known-dark background |

## Deferred

- Spatial arrow-key navigation for sages graph nodes (logged to SETLIST.md)

## Files Modified

| File | Phases |
|------|--------|
| `assets/styles/accessibility.css` (new) | 1, 2, 3 |
| `assets/scripts/announcer.js` (new) | 1 |
| `index.html` | 1, 2 |
| `assets/styles/styles.css` | 1, 3 |
| `assets/styles/sages.css` | 1 |
| `assets/scripts/app.js` | 1, 2, 3 |
| `assets/scripts/sages-graph.js` | 2 |
| `assets/scripts/sages.js` | 2, 3 |
| `assets/scripts/sages-sidebar.js` | 2 |

## Testing

- **Automated**: axe-core scan after each phase
- **Manual screen reader**: VoiceOver (macOS) for autocomplete ARIA, dialog focus cycling, announcer, SVG keyboard nav
- **Keyboard-only walkthrough**: Full tab-through after each phase to verify focus visibility and order
