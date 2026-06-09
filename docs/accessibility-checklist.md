# Accessibility Checklist

Target: **WCAG 2.1 AA**. Accessibility is a first-class requirement here,
not a nice-to-have — this is a study tool people rely on. Run through
this list before opening a PR that touches UI.

A11y-specific CSS lives in
[`assets/styles/accessibility.css`](../assets/styles/accessibility.css);
the screen-reader live region is `window.announce(message, priority)`
([`announcer.js`](../assets/scripts/announcer.js)).

## Keyboard

- [ ] Every interactive element is reachable with **Tab** and operable
      with **Enter / Space**.
- [ ] Focus is **visible** — use `:focus-visible` (not `:focus`) for
      rings so they don't show on mouse click.
- [ ] No keyboard traps. Dialogs/drawers trap focus *while open* and
      restore it on close.
- [ ] Custom (non-native) controls — including SVG/`<g>` elements with
      `role="button"` — wire their own Enter/Space `keydown` handler;
      `tabindex="0"` alone is not keyboard-operable.

## Names, roles, structure

- [ ] Icon-only buttons have an accessible name (`aria-label`).
- [ ] Custom widgets expose a correct `role` + name.
- [ ] Non-text content (SVG graph, canvas chart) has a **text
      alternative** — a `role`/`aria-label` plus, where the content has
      structure, a `.visually-hidden` list mirroring it (see the sages
      graph in [`sages-graph.js`](../assets/scripts/sages-graph.js)).
- [ ] Headings are hierarchical; each view has a landmark/`<h2>`.

## Focus management on navigation

- [ ] Hash-route / view changes move focus into the new content (or
      announce it) so screen-reader and keyboard users aren't stranded.
- [ ] Dynamic updates that aren't focus-driven are announced via
      `window.announce(...)`.

## Visual

- [ ] Text contrast meets AA (4.5:1 body, 3:1 large/UI).
- [ ] Information is **not conveyed by color alone**.
- [ ] Touch targets are ≥ 44×44 px.
- [ ] `prefers-reduced-motion` is respected for animation/transitions.

## Forms & inputs

- [ ] Inputs have associated labels; combobox/autocomplete expose the
      correct ARIA state.
- [ ] Error messages are associated (`aria-describedby`) and announced.

## Hebrew / RTL

- [ ] Hebrew text carries `dir="rtl"` so it renders and reads correctly.

## How to verify

- **Keyboard:** unplug the mouse. Tab through the whole feature.
- **Screen reader:** VoiceOver (macOS: ⌘F5), NVDA (Windows), or Orca.
- Automated checks (axe, Lighthouse) catch some issues but **not**
  keyboard operability or sensible focus order — test those by hand.
