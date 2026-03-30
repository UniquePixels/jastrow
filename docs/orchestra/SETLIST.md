# Setlist

## In Progress

## Up Next

1. **English key input to hebrew character interpolation in search bar.** (ie press a get alef, h get heh)

2. **Sage chart improvements including API data** - Some of this may be covered in the admin tool

3. **BDB/Klien/Frank/HALOT/??? Cross references**

4. **Abbriviation tips from json data instead of hard coded.**

5. **Sages, and abbriviation data optimization**

6. **Sages graph spatial arrow-key navigation** — Deferred from a11y refactor. ArrowUp/Down/Left/Right moves focus to nearest node in that direction. ~50 lines of proximity logic in `sages-graph.js`.

7. **LLM-Powered Search Assistant** — Future enhancement for natural language dictionary queries.

8. **Investigate separating Jastrow project from personal website** — Currently lives as a subdirectory of the personal site repo. Evaluate moving to its own repo/deployment.

## Completed

- [x] **Accessibility Refactor** — WCAG 2.1 AA compliance. Focus indicators, color contrast, ARIA labels, live regions, keyboard nav, skip link, touch targets, reduced motion.
  - Spec: [2026-03-28-accessibility-refactor-spec.md](specs/2026-03-28-accessibility-refactor-spec.md)
  - Plan: [2026-03-28-accessibility-refactor-plan.md](plans/2026-03-28-accessibility-refactor-plan.md)
