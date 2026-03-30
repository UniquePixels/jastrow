# Accessibility Refactor Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Achieve WCAG 2.1 AA compliance across the Jastrow Dictionary PWA in 3 phases, each shipping as an independent PR.

**Architecture:** Dedicated a11y layer — new `accessibility.css` and `announcer.js` files. Surgical modifications to existing files for ARIA, announcements, and focus management. WA-first principle: use Web Awesome utilities where they exist, custom code only for gaps.

**Tech Stack:** Vanilla JS, Web Awesome (Shoelace-based) components, D3.js (sages graph), CSS custom properties

---

## Phase 1 — Critical (PR #1: `a11y-phase-1`)

### Task 1: Create `accessibility.css` with Focus Indicators

**Files:**
- Create: `assets/styles/accessibility.css`
- Modify: `index.html:91` (add stylesheet link)

- [ ] **Step 1: Create `accessibility.css` with focus-visible styles**

```css
/* ==========================================================================
   Accessibility — Focus Indicators, Skip Link, Touch Targets, Reduced Motion
   Loaded after sages.css. All a11y-specific CSS lives here.
   ========================================================================== */

/* --- Focus Indicators --------------------------------------------------- */

a:focus-visible,
button:focus-visible,
[role="button"]:focus-visible,
[tabindex="0"]:focus-visible {
	outline: 3px solid var(--wa-color-brand-fill-loud);
	outline-offset: 2px;
}

wa-button:focus-visible::part(base),
wa-input:focus-visible::part(base),
wa-tab:focus-visible::part(base) {
	outline: 3px solid var(--wa-color-brand-fill-loud);
	outline-offset: 2px;
}

.sages-sidebar-close:focus-visible {
	outline: 3px solid var(--wa-color-brand-fill-loud);
	outline-offset: 2px;
}
```

- [ ] **Step 2: Add stylesheet link in `index.html` after `sages.css`**

In `index.html`, after line 91 (`<link rel="stylesheet" href="assets/styles/sages.css">`), add:

```html
  <link rel="stylesheet" href="assets/styles/accessibility.css">
```

- [ ] **Step 3: Verify focus styles render correctly**

Open the app in a browser. Tab through elements — each focusable element should show a 3px purple outline. Check: search input, buttons, mode toggles, banner dismiss, nav links.

- [ ] **Step 4: Commit**

```bash
git add assets/styles/accessibility.css index.html
git commit -s -m "🌈 improve(a11y): add global focus-visible indicators"
```

### Task 2: Fix Color Contrast — `styles.css`

**Files:**
- Modify: `assets/styles/styles.css:21-28` (`.banner-dismiss`)
- Modify: `assets/styles/styles.css:417-421` (`.autocomplete-mode`)
- Modify: `assets/styles/styles.css:499-503` (`.abbr-original`)
- Modify: `assets/styles/styles.css:522-526` (`.abbr-no-results`)
- Modify: `assets/styles/styles.css:630-634` (`.guide-component-desc`)

- [ ] **Step 1: Fix `.banner-dismiss` contrast**

Replace lines 21-28 of `styles.css`:

```css
.banner-dismiss {
	flex-shrink: 0;
	color: rgba(255, 255, 255, 0.85);
	font-size: 0.85rem;
	cursor: pointer;
	padding: 0.25rem;
}
```

Change: removed `color: white; opacity: 0.5;`, replaced with `color: rgba(255, 255, 255, 0.85)` for ~9:1 contrast on the dark banner background.

- [ ] **Step 2: Fix `.banner-dismiss:hover`**

Replace the hover rule (lines 30-32):

```css
.banner-dismiss:hover {
	color: white;
}
```

Change: was `opacity: 1`, now `color: white` (full white on hover).

- [ ] **Step 3: Fix `.autocomplete-mode` contrast**

Replace lines 417-421 of `styles.css`:

```css
.autocomplete-mode {
	float: right;
	color: var(--wa-color-text-subtle);
	font-size: 0.85em;
}
```

Change: removed `opacity: 0.5`, added `color: var(--wa-color-text-subtle)`.

- [ ] **Step 4: Fix `.abbr-original` contrast**

Replace lines 499-503 of `styles.css`:

```css
.abbr-original {
	font-size: 0.8rem;
	color: var(--wa-color-text-subtle);
	margin-top: 2px;
}
```

Change: removed `opacity: 0.55`, added `color: var(--wa-color-text-subtle)`.

- [ ] **Step 5: Fix `.abbr-no-results` contrast**

Replace lines 522-526 of `styles.css`:

```css
.abbr-no-results {
	text-align: center;
	padding: 2rem;
	color: var(--wa-color-text-subtle);
}
```

Change: removed `opacity: 0.5`, added `color: var(--wa-color-text-subtle)`.

- [ ] **Step 6: Fix `.guide-component-desc` contrast**

Replace lines 630-634 of `styles.css`:

```css
.guide-component-desc {
	font-size: 0.85rem;
	color: var(--wa-color-text-subtle);
	line-height: 1.5;
}
```

Change: removed `opacity: 0.75`, added `color: var(--wa-color-text-subtle)`.

- [ ] **Step 7: Verify contrast visually**

Open the app and check: banner dismiss button, autocomplete dropdown mode labels, abbreviations dialog, guide dialog descriptions. All should be readable but visually secondary.

- [ ] **Step 8: Commit**

```bash
git add assets/styles/styles.css
git commit -s -m "🌈 improve(a11y): fix color contrast failures with semantic tokens"
```

### Task 3: Fix Color Contrast — `sages.css`

**Files:**
- Modify: `assets/styles/sages.css:89-91` (`.node-dimmed`)

- [ ] **Step 1: Fix `.node-dimmed` opacity**

Replace line 90 in `sages.css`:

```css
.node-dimmed {
	opacity: 0.4;
}
```

Change: `opacity: 0.25` → `opacity: 0.4` for WCAG 1.4.11 graphical contrast (3:1).

- [ ] **Step 2: Verify in sages view**

Open the sages graph, click a sage to select it. Unselected (dimmed) nodes should be less prominent but still clearly visible.

- [ ] **Step 3: Commit**

```bash
git add assets/styles/sages.css
git commit -s -m "🌈 improve(a11y): increase dimmed node contrast for WCAG 1.4.11"
```

### Task 4: Create `announcer.js` — Live Region Utility

**Files:**
- Create: `assets/scripts/announcer.js`
- Modify: `index.html:457` (add script tag)

- [ ] **Step 1: Create `announcer.js`**

```js
/**
 * Screen reader live region announcer.
 *
 * Injects two visually-hidden aria-live regions (polite + assertive)
 * and exposes window.announce(message, priority) for any module to use.
 *
 * Clear-then-set pattern ensures repeated identical messages are announced.
 */
document.addEventListener("DOMContentLoaded", () => {
	const regions = {};

	for (const priority of ["polite", "assertive"]) {
		const el = document.createElement("div");
		el.className = "wa-visually-hidden";
		el.setAttribute("aria-live", priority);
		el.setAttribute("aria-atomic", "true");
		el.setAttribute("role", priority === "assertive" ? "alert" : "status");
		document.body.appendChild(el);
		regions[priority] = el;
	}

	/**
	 * Announce a message to screen readers.
	 * @param {string} message - The text to announce
	 * @param {'polite'|'assertive'} [priority='polite'] - Announcement urgency
	 */
	window.announce = (message, priority = "polite") => {
		const region = regions[priority] || regions.polite;
		region.textContent = "";
		setTimeout(() => {
			region.textContent = message;
		}, 50);
	};
});
```

- [ ] **Step 2: Add script tag in `index.html` before `app.js`**

In `index.html`, before the `app.js` script tag (line 457), add:

```html
  <script src="assets/scripts/announcer.js"></script>
```

- [ ] **Step 3: Verify announcer loads**

Open the app. In the browser console, run `window.announce('test')`. Inspect the DOM — two `wa-visually-hidden` divs should exist at the end of `<body>`, one with `aria-live="polite"` containing "test".

- [ ] **Step 4: Commit**

```bash
git add assets/scripts/announcer.js index.html
git commit -s -m "🦄 new(a11y): add screen reader announcer utility"
```

### Task 5: Wire Live Region Announcements in `app.js`

**Files:**
- Modify: `assets/scripts/app.js:1881-1898` (`showLoadingIndicator`)
- Modify: `assets/scripts/app.js:2000-2013` (`showNoResults`)
- Modify: `assets/scripts/app.js:2039-2049` (`showOfflineToast`)
- Modify: `assets/scripts/app.js:2051-2063` (`showError`)
- Modify: `assets/scripts/app.js:799-848` (`handleSearch`)

- [ ] **Step 1: Add `role="status"` to loading indicator**

In `showLoadingIndicator()`, after `wrapper.style.cssText = "text-align: center; padding: 3rem;";` (line 1886), add:

```js
			wrapper.setAttribute("role", "status");
```

- [ ] **Step 2: Add announcement to `showNoResults()`**

In `showNoResults()`, after `this.mainContent.appendChild(message);` (line 2012), add:

```js
		window.announce("No results found");
```

- [ ] **Step 3: Add announcement to `showError()`**

In `showError()`, after `console.error(message);` (line 2052), add:

```js
		window.announce(message, "assertive");
```

- [ ] **Step 4: Add announcement to `showOfflineToast()`**

In `showOfflineToast()`, before the `await customElements.whenDefined("wa-toast");` line (2043), add:

```js
		const isOfflineMsg = variant === "warning";
		window.announce(message, isOfflineMsg ? "assertive" : "polite");
```

- [ ] **Step 5: Add result count announcement to `handleSearch()`**

In `handleSearch()`, in the word search success path after `this.scrollManager.loadInitial(dictPage, entryIndex);` (line 832), add:

```js
				window.announce(`${results.length} result${results.length === 1 ? "" : "s"} found`);
```

In the reference search success path after `this._renderReferenceResults(results);` (line 840), add:

```js
				window.announce(`${results.length} reference${results.length === 1 ? "" : "s"} found`);
```

- [ ] **Step 6: Verify announcements**

Open the app with VoiceOver or browser accessibility inspector. Perform a search — the result count should be announced. Trigger an error (search for invalid input) — the error should be announced assertively.

- [ ] **Step 7: Commit**

```bash
git add assets/scripts/app.js
git commit -s -m "🌈 improve(a11y): wire live region announcements for dynamic content"
```

---

## Phase 2 — Major (PR #2: `a11y-phase-2`)

### Task 6: Add Skip Link

**Files:**
- Modify: `index.html:119` (add skip link)
- Modify: `index.html:262` (add id to `<main>`)
- Modify: `assets/styles/accessibility.css` (add skip link styles)

- [ ] **Step 1: Add skip link HTML**

In `index.html`, immediately after `<body>` (line 119), before `<wa-page>`, add:

```html
  <a href="#main-content" class="skip-link">Skip to main content</a>
```

- [ ] **Step 2: Add `id` to `<main>`**

Change `<main>` (line 262) to:

```html
    <main id="main-content">
```

- [ ] **Step 3: Add skip link styles to `accessibility.css`**

Append to `accessibility.css`:

```css
/* --- Skip Link ---------------------------------------------------------- */

.skip-link {
	position: absolute;
	top: 0;
	left: 0;
	padding: 0.75rem 1.5rem;
	background: var(--wa-color-brand-fill-loud);
	color: var(--wa-color-brand-on-loud);
	font-weight: 600;
	z-index: 10000;
	transform: translateY(-100%);
	transition: transform 0.2s ease;
}

.skip-link:focus {
	transform: translateY(0);
}
```

- [ ] **Step 4: Verify skip link**

Open the app. Press Tab once — the "Skip to main content" link should appear. Press Enter — focus should jump to `<main>`.

- [ ] **Step 5: Commit**

```bash
git add index.html assets/styles/accessibility.css
git commit -s -m "🦄 new(a11y): add skip link for keyboard navigation"
```

### Task 7: Heading Hierarchy — Add `<h1>`

**Files:**
- Modify: `index.html:149` (wrap brand name in `<h1>`)
- Modify: `assets/styles/accessibility.css` (neutralize h1 block display)

- [ ] **Step 1: Wrap brand name in `<h1>`**

In `index.html`, replace line 149:

```html
          <a href="#" id="brand-name" class="brand-link wa-heading-xl">Jastrow's Dictionary</a>
```

with:

```html
          <h1 class="wa-heading-xl brand-h1"><a href="#" id="brand-name" class="brand-link">Jastrow's Dictionary</a></h1>
```

- [ ] **Step 2: Add `<h1>` neutralizing styles**

Append to `accessibility.css`:

```css
/* --- Heading Hierarchy -------------------------------------------------- */

.brand-h1 {
	display: inline-flex;
	align-items: center;
	margin: 0;
	font: inherit;
}
```

- [ ] **Step 3: Verify layout unchanged**

Open the app. The brand row should look identical — the `<h1>` should not introduce any visual change. Check both desktop and mobile views.

- [ ] **Step 4: Commit**

```bash
git add index.html assets/styles/accessibility.css
git commit -s -m "🌈 improve(a11y): add semantic h1 heading for brand name"
```

### Task 8: ARIA Labels on Interactive Elements

**Files:**
- Modify: `index.html:141` (mobile menu button)
- Modify: `index.html:145` (logo link)
- Modify: `index.html:156` (search input)
- Modify: `index.html:167` (share button)
- Modify: `index.html:178-179` (page jump input)

- [ ] **Step 1: Add `label` to mobile menu button**

In `index.html`, change line 141:

```html
        <wa-button data-toggle-nav appearance="plain" class="mobile-menu-toggle">
```

to:

```html
        <wa-button data-toggle-nav appearance="plain" class="mobile-menu-toggle" label="Menu">
```

- [ ] **Step 2: Add `aria-label` to logo link**

In `index.html`, change line 145:

```html
          <a href="#" class="brand-link">
```

to:

```html
          <a href="#" class="brand-link" aria-label="Jastrow Dictionary home">
```

- [ ] **Step 3: Add `label` to search input**

In `index.html`, change line 156:

```html
          <wa-input class="search rtl-input" placeholder="Search Hebrew letters (אבג)" with-clear style="flex: 1; min-width: 120px; max-width: 400px;"></wa-input>
```

to:

```html
          <wa-input class="search rtl-input" label="Search dictionary" placeholder="Search Hebrew letters (אבג)" with-clear style="flex: 1; min-width: 120px; max-width: 400px;"></wa-input>
```

- [ ] **Step 4: Add `label` to share button**

In `index.html`, change line 167:

```html
          <wa-button slot="trigger" appearance="plain" variant="neutral">
```

to:

```html
          <wa-button slot="trigger" appearance="plain" variant="neutral" label="Share">
```

- [ ] **Step 5: Add `label` to page jump input**

In `index.html`, change lines 178-179:

```html
          <wa-input id="page-jump-input" without-spin-buttons style="width: 62%;" type="number"
            placeholder="Pg. Number">
```

to:

```html
          <wa-input id="page-jump-input" label="Page number" without-spin-buttons style="width: 62%;" type="number"
            placeholder="Pg. Number">
```

- [ ] **Step 6: Verify labels in accessibility inspector**

Open the browser accessibility tree. Each element should show its accessible name: "Menu", "Jastrow Dictionary home", "Search dictionary", "Share", "Page number".

- [ ] **Step 7: Commit**

```bash
git add index.html
git commit -s -m "🌈 improve(a11y): add ARIA labels to interactive elements"
```

### Task 9: Autocomplete ARIA Pattern

**Files:**
- Modify: `assets/scripts/app.js:199-269` (`initializeUI` — search input ARIA setup)
- Modify: `assets/scripts/app.js:578-586` (`_ensureDropdown`)
- Modify: `assets/scripts/app.js:601-649` (`_showDropdown`)
- Modify: `assets/scripts/app.js:651-655` (`_hideDropdown`)
- Modify: `assets/scripts/app.js:658-664` (`_highlightItem`)

- [ ] **Step 1: Set initial ARIA attributes on search input**

In `initializeUI()`, after `this.searchInput = document.querySelector(".search");` (line 201), add:

```js
		this.searchInput.setAttribute("aria-autocomplete", "list");
		this.searchInput.setAttribute("aria-controls", "search-autocomplete-list");
		this.searchInput.setAttribute("aria-expanded", "false");
```

- [ ] **Step 2: Add ARIA attributes to dropdown in `_ensureDropdown()`**

In `_ensureDropdown()`, after `this._dropdownEl.className = "autocomplete-dropdown";` (line 581), add:

```js
		this._dropdownEl.setAttribute("role", "listbox");
		this._dropdownEl.id = "search-autocomplete-list";
```

- [ ] **Step 3: Add ARIA to dropdown items in `_showDropdown()`**

In `_showDropdown()`, inside the `for` loop after `div.className = "autocomplete-item";` (line 614), add:

```js
			div.setAttribute("role", "option");
			div.setAttribute("aria-selected", "false");
			div.id = `autocomplete-option-${i}`;
```

At the end of `_showDropdown()`, after `this._dropdownEl.style.display = "block";` (line 648), add:

```js
		this.searchInput.setAttribute("aria-expanded", "true");
```

Also, in the `items.length === 0` early return block (lines 606-609), after `this._dropdownEl.style.display = "none";`, add:

```js
			this.searchInput.setAttribute("aria-expanded", "false");
```

- [ ] **Step 4: Update `_hideDropdown()` to clear ARIA**

In `_hideDropdown()`, after `this._dropdownHighlight = -1;` (line 654), add:

```js
			this.searchInput?.setAttribute("aria-expanded", "false");
			this.searchInput?.removeAttribute("aria-activedescendant");
```

- [ ] **Step 5: Update `_highlightItem()` with ARIA selection**

Replace the `_highlightItem()` method (lines 658-665) with:

```js
	_highlightItem(index) {
		if (!this._dropdownEl) return;
		const items = this._dropdownEl.children;
		for (let i = 0; i < items.length; i++) {
			items[i].classList.toggle("highlighted", i === index);
			items[i].setAttribute("aria-selected", i === index ? "true" : "false");
		}
		this._dropdownHighlight = index;
		if (index >= 0 && items[index]) {
			this.searchInput.setAttribute("aria-activedescendant", items[index].id);
		} else {
			this.searchInput.removeAttribute("aria-activedescendant");
		}
	}
```

- [ ] **Step 6: Verify autocomplete ARIA**

Open the app, type in the search box. Inspect the dropdown — it should have `role="listbox"`, items should have `role="option"`. Arrow keys should update `aria-selected` and `aria-activedescendant`. Escape should clear `aria-expanded`.

- [ ] **Step 7: Commit**

```bash
git add assets/scripts/app.js
git commit -s -m "🌈 improve(a11y): add ARIA listbox pattern to autocomplete"
```

### Task 10: Sages Graph Keyboard Access

**Files:**
- Modify: `assets/scripts/sages-graph.js:286-343` (`_drawNodes`)
- Modify: `assets/scripts/sages.js:118-124` (keydown handler)
- Modify: `assets/styles/accessibility.css` (SVG node focus ring)

- [ ] **Step 1: Add `tabindex`, `role`, and `aria-label` to graph nodes**

In `sages-graph.js` `_drawNodes()`, after `.style("cursor", "pointer");` (line 298), add:

```js
      node.attr("tabindex", "0")
        .attr("role", "button")
        .attr("aria-label", `${sage.name.en}, ${sage.name.he}, ${this._formatDates(sage.dates)}`);
```

- [ ] **Step 2: Add Enter/Space keyboard handler in `sages.js`**

In `sages.js`, replace the keydown handler block (lines 118-124):

```js
    // Keyboard handler
    document.addEventListener("keydown", (e) => {
      if (!this._visible) return;
      if (e.key === "Escape" && this.sidebar.isOpen) {
        location.hash = "#sages";
      }
    });
```

with:

```js
    // Keyboard handler
    document.addEventListener("keydown", (e) => {
      if (!this._visible) return;
      if (e.key === "Escape" && this.sidebar.isOpen) {
        location.hash = "#sages";
        return;
      }
      if (e.key === "Enter" || e.key === " ") {
        const focused = document.activeElement;
        if (focused?.getAttribute("role") === "button" && focused.closest(".node")) {
          e.preventDefault();
          const id = focused.closest("[data-id]")?.getAttribute("data-id");
          if (id) location.hash = `#sage:${id}`;
        }
      }
    });
```

- [ ] **Step 3: Add SVG node focus ring to `accessibility.css`**

Append to `accessibility.css`:

```css
/* --- SVG Node Focus Ring ------------------------------------------------ */

.node:focus-visible .node-bg {
	stroke: var(--wa-color-brand-fill-loud);
	stroke-width: 3;
	filter: drop-shadow(0 0 4px var(--wa-color-brand-fill-loud));
}

.node:focus-visible {
	outline: none;
}
```

- [ ] **Step 4: Verify keyboard navigation**

Open the sages view. Tab into the graph — nodes should receive focus with a visible purple ring. Press Enter or Space on a focused node — the sidebar should open for that sage.

- [ ] **Step 5: Commit**

```bash
git add assets/scripts/sages-graph.js assets/scripts/sages.js assets/styles/accessibility.css
git commit -s -m "🌈 improve(a11y): add keyboard access to sages graph nodes"
```

### Task 11: Dialog Focus Management

**Files:**
- Modify: `assets/scripts/app.js:50-74` (constructor — add `_lastFocusedElement`)
- Modify: `assets/scripts/app.js:1281-1404` (`showPageDialog` — save focus)
- Modify: `assets/scripts/app.js:154-163` (page dialog `wa-hide` — restore focus)
- Modify: `index.html:315-435` (inline script — guide/abbr dialog focus)

- [ ] **Step 1: Add `_lastFocusedElement` to constructor**

In `app.js`, in the constructor after `this._guideDialogBuilt = false;` (line 73), add:

```js
		this._lastFocusedElement = null;
```

- [ ] **Step 2: Save focus before opening page dialog**

In `showPageDialog()`, before `dialog.open = true;` (line 1404), add:

```js
		this._lastFocusedElement = document.activeElement;
```

- [ ] **Step 3: Restore focus on page dialog close**

In `initializeUI()`, in the page dialog `wa-hide` handler (around line 159), after the hash cleanup, add:

```js
				if (this._lastFocusedElement) {
					this._lastFocusedElement.focus();
					this._lastFocusedElement = null;
				}
```

The full block becomes:

```js
			pageDialog.addEventListener('wa-hide', () => {
				if (window.location.hash.startsWith('#scan:')) {
					window.history.pushState(null, '', window.location.pathname);
				}
				if (this._lastFocusedElement) {
					this._lastFocusedElement.focus();
					this._lastFocusedElement = null;
				}
			});
```

- [ ] **Step 4: Add focus management to guide/abbr dialogs in inline script**

In `index.html`, inside the `DOMContentLoaded` handler (after line 334), add:

```js
      let _dialogOpener = null;
```

In `showGuide()`, before `guideDialog.open = true;` (line 344), add:

```js
        _dialogOpener = document.activeElement;
```

In `showAbbr()`, before `abbrDialog.open = true;` (line 359), add:

```js
        _dialogOpener = document.activeElement;
```

In the guide dialog `wa-hide` handler (lines 420-426), after the hash cleanup, add:

```js
          if (_dialogOpener) {
            _dialogOpener.focus();
            _dialogOpener = null;
          }
```

In the abbr dialog `wa-hide` handler (lines 428-434), after the hash cleanup, add:

```js
          if (_dialogOpener) {
            _dialogOpener.focus();
            _dialogOpener = null;
          }
```

- [ ] **Step 5: Verify focus return**

Open a dialog (click a page link, guide, or abbreviations). Close it. Focus should return to the element that opened it.

- [ ] **Step 6: Commit**

```bash
git add assets/scripts/app.js index.html
git commit -s -m "🌈 improve(a11y): add dialog focus return on close"
```

### Task 12: Sages Sidebar Focus Management

**Files:**
- Modify: `assets/scripts/sages-sidebar.js:23-37` (`open` — focus close button)
- Modify: `assets/scripts/sages-sidebar.js:196-201` (`close` — return focus)
- Modify: `assets/scripts/sages.js:56-60` (`openSage` — track last selected)

- [ ] **Step 1: Track `_lastSelectedId` in sages explorer**

In `sages.js`, in `openSage()` (line 56), before `this.sidebar.open(id);` (line 58), add:

```js
    this._lastSelectedId = id;
```

- [ ] **Step 2: Focus close button on sidebar open**

In `sages-sidebar.js`, in `open()`, after `this.container.appendChild(closeBtn);` (line 37), add:

```js
    requestAnimationFrame(() => closeBtn.focus());
```

- [ ] **Step 3: Return focus to graph node on sidebar close**

In `sages-sidebar.js`, replace `close()` (lines 196-201):

```js
  close() {
    const previousId = this._currentId;
    this._currentId = null;
    this.container.classList.remove("sages-sidebar-open");
    this.container.replaceChildren();
    if (this.onClose) this.onClose();
    if (previousId) {
      requestAnimationFrame(() => {
        const node = document.querySelector(`[data-id="${previousId}"]`);
        if (node) node.focus();
      });
    }
  }
```

- [ ] **Step 4: Verify sidebar focus flow**

Open sages view. Tab to a node, press Enter. Sidebar opens — close button should have focus. Press Escape or click close. Focus should return to the graph node that was selected.

- [ ] **Step 5: Commit**

```bash
git add assets/scripts/sages-sidebar.js assets/scripts/sages.js
git commit -s -m "🌈 improve(a11y): add sidebar focus management"
```

---

## Phase 3 — Minor (PR #3: `a11y-phase-3`)

### Task 13: Touch Targets

**Files:**
- Modify: `assets/styles/accessibility.css` (add touch target rules)

- [ ] **Step 1: Add touch target minimum sizes**

Append to `accessibility.css`:

```css
/* --- Touch Targets ------------------------------------------------------ */

.banner-dismiss {
	min-width: 44px;
	min-height: 44px;
	display: inline-flex;
	align-items: center;
	justify-content: center;
}

.sages-sidebar-close {
	min-width: 44px;
	min-height: 44px;
	display: flex;
	align-items: center;
	justify-content: center;
}
```

- [ ] **Step 2: Verify touch targets**

Open the app on a mobile viewport. The banner dismiss and sages sidebar close buttons should have at least 44x44px clickable area. Inspect element dimensions.

- [ ] **Step 3: Commit**

```bash
git add assets/styles/accessibility.css
git commit -s -m "🌈 improve(a11y): enforce 44px minimum touch targets"
```

### Task 14: Global Reduced Motion

**Files:**
- Modify: `assets/styles/accessibility.css` (add global reduced motion rule)
- Modify: `assets/styles/styles.css:160-163` (remove old single-rule block)

- [ ] **Step 1: Add global reduced motion to `accessibility.css`**

Append to `accessibility.css`:

```css
/* --- Reduced Motion ----------------------------------------------------- */

@media (prefers-reduced-motion: reduce) {
	*,
	*::before,
	*::after {
		transition-duration: 0.01ms !important;
		animation-duration: 0.01ms !important;
		animation-iteration-count: 1 !important;
	}
}
```

- [ ] **Step 2: Remove old reduced motion block from `styles.css`**

Remove lines 160-163 from `styles.css`:

```css
@media (prefers-reduced-motion: reduce) {
	.entry-highlight {
		animation: none;
	}
}
```

- [ ] **Step 3: Verify reduced motion**

Enable "Reduce motion" in macOS System Settings (or Chrome DevTools > Rendering > Emulate prefers-reduced-motion: reduce). All animations and transitions should stop. WA dialogs should still open/close (just without animation).

- [ ] **Step 4: Commit**

```bash
git add assets/styles/accessibility.css assets/styles/styles.css
git commit -s -m "🌈 improve(a11y): add global reduced-motion support"
```

### Task 15: Page Title Updates

**Files:**
- Modify: `assets/scripts/app.js:799-848` (`handleSearch`)
- Modify: `assets/scripts/app.js:854-868` (`jumpToDictPage`)
- Modify: `assets/scripts/app.js:873-877` (`loadInitialPage`)
- Modify: `assets/scripts/app.js:2065-2101` (`_showSagesView`, `_hideSagesView`)
- Modify: `assets/scripts/app.js:50-74` (constructor — add `_previousTitle`)

- [ ] **Step 1: Add `_previousTitle` to constructor**

In `app.js` constructor, after `this._lastFocusedElement = null;` (added in Task 11), add:

```js
		this._previousTitle = null;
```

- [ ] **Step 2: Update title in `handleSearch()`**

In `handleSearch()`, in the word search success path, after the `window.announce(...)` line added in Task 5, add:

```js
				document.title = `${cleanQuery} - Jastrow Dictionary`;
```

In the reference search success path, after the `window.announce(...)` line added in Task 5, add:

```js
				document.title = `${cleanQuery} - Jastrow Dictionary`;
```

- [ ] **Step 3: Update title in `jumpToDictPage()`**

In `jumpToDictPage()`, after `this.updateURL({ page: validPage });` (line 867), add:

```js
		document.title = `Page ${validPage} - Jastrow Dictionary`;
```

- [ ] **Step 4: Update title in `loadInitialPage()`**

In `loadInitialPage()`, after `this.scrollManager.loadInitial(1);` (line 875), add:

```js
			document.title = "Jastrow Dictionary";
```

- [ ] **Step 5: Update title in `_showSagesView()` and `_hideSagesView()`**

In `_showSagesView()`, before `if (!this._sagesExplorer) {` (line 2069), add:

```js
		this._previousTitle = document.title;
		document.title = "Talmudic Sages - Jastrow Dictionary";
```

In `_hideSagesView()`, after `if (this.mainContent) this.mainContent.style.display = '';` (line 2100), add:

```js
		if (this._previousTitle) {
			document.title = this._previousTitle;
			this._previousTitle = null;
		}
```

- [ ] **Step 6: Verify page titles**

Perform searches, jump to pages, open sages view. The browser tab title should update to reflect the current context. Going back to the dictionary should restore "Jastrow Dictionary".

- [ ] **Step 7: Commit**

```bash
git add assets/scripts/app.js
git commit -s -m "🌈 improve(a11y): update page title on navigation"
```

### Task 16: Form Validation, Search Bidi, and Sages Search Label

**Files:**
- Modify: `assets/scripts/app.js:854-868` (`jumpToDictPage` — `aria-invalid`)
- Modify: `assets/styles/styles.css:381-385` (search input bidi)
- Modify: `assets/scripts/sages.js:146-150` (sages search label)

- [ ] **Step 1: Add `aria-invalid` to page jump validation**

In `jumpToDictPage()`, in the `handlePageJump` function in `initializeUI()` (lines 352-358), replace:

```js
			const handlePageJump = () => {
				const pageNum = parseInt(this.pageInput.value, 10);
				if (pageNum > 0 && pageNum <= DICTIONARY.TOTAL_PAGES) {
					this.jumpToDictPage(pageNum);
				} else {
					this.showError(`Page must be between 1 and ${DICTIONARY.TOTAL_PAGES}`);
				}
			};
```

with:

```js
			const handlePageJump = () => {
				const pageNum = parseInt(this.pageInput.value, 10);
				if (pageNum > 0 && pageNum <= DICTIONARY.TOTAL_PAGES) {
					this.pageInput.removeAttribute("aria-invalid");
					this.jumpToDictPage(pageNum);
				} else {
					this.pageInput.setAttribute("aria-invalid", "true");
					this.showError(`Page must be between 1 and ${DICTIONARY.TOTAL_PAGES}`);
				}
			};
```

- [ ] **Step 2: Add `unicode-bidi: isolate` to search input**

In `styles.css`, change the RTL search input rule (lines 382-385):

```css
wa-input.search.rtl-input::part(input) {
	direction: rtl;
	text-align: right;
	unicode-bidi: isolate;
}
```

Change: added `unicode-bidi: isolate` to prevent Hebrew text from bleeding into LTR context.

- [ ] **Step 3: Add `label` to sages search input**

In `sages.js` `_buildToolbar()`, after `searchInput.setAttribute("size", "small");` (line 150), add:

```js
    searchInput.setAttribute("label", "Search sages by name");
```

- [ ] **Step 4: Verify all three changes**

1. Page jump: enter an invalid page number — the input should gain `aria-invalid="true"`. Enter a valid one — it should be removed.
2. Search: type Hebrew text — it should be isolated within the input, not affecting surrounding LTR layout.
3. Sages: open sages view — inspect the search input, it should have accessible name "Search sages by name".

- [ ] **Step 5: Commit**

```bash
git add assets/scripts/app.js assets/styles/styles.css assets/scripts/sages.js
git commit -s -m "🌈 improve(a11y): add form validation, search bidi, sages label"
```

---

## Post-Phase Verification

After all three phases are complete and merged:

- [ ] Run axe-core scan on the deployed site
- [ ] Full keyboard-only walkthrough: Tab through every interactive element, verify focus is visible, no traps
- [ ] VoiceOver test: search, autocomplete, dialogs, sages graph, error states
- [ ] Check `prefers-reduced-motion` with system setting enabled
- [ ] Verify no visual regressions on mobile (320px) and desktop
