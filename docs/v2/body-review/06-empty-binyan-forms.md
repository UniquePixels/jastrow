# 06 — Empty binyan-form strings (dry-run Finding 3)

**Set:** 486 empty-string `binyan_form` elements across
446 entries violate the entry schema's `minLength: 1` on stem
form strings (dry-run Finding 3 — the schema sample caught 3 of them;
this is the full-corpus recount). The dry-run composition threads
`binyan_form` straight through (`forms: binyan_form ?? []`), so an
empty upstream slot becomes an empty output slot. Upstream-data /
schema mismatch, not a composition bug.

First 10 affected entries (one row per affected stem;
`forms` verbatim, including empty strings and leading spaces):

| Rid | Headword | Stem | `forms` (verbatim) | Decision |
| --- | --- | --- | --- | --- |
| A00335 | אָגַר I | Hif. | `["הוֹגִיר",""]` |  |
| A00338 | אֲגַר II | Ithpa. | `["אִיתַּגַּר",""]` |  |
| A00481 | אָהַב | Nif. | `["נֶאֱהַב",""]` |  |
| A00481 | אָהַב | Pi. | `["אִהֵב",""]` |  |
| A00996 | אֲחַד | Ithpa. | `["אִתְאָחַד"," אִתָּחַד",""]` |  |
| A01697 | אֲכַל | Ithpe. | `["אִתְאֲכַל"," אִתְאֲכִיל",""]` |  |
| A02427 | אֲסִי | Ithpa. | `["אִיתַּסִּי",""]` |  |
| A02728 | אֲפַךְ | Ithpe. | `["אִתְּפִיךְ"," אִתְּפַךְ",""]` |  |
| A02888 | אָצַר | Pi. | `["אִיצֵּר",""]` |  |
| A02889 | אֲצַר I | Ithpa. | `["אִתְאַצַּר",""]` |  |
| A03095 | אֲרִיךְ I | Af. | `["אוֹרֵיךְ",""]` |  |

## Decision (choose one — the two options from docs/v2/body-dryrun.md Finding 3)

- [ ] **Accept in schema** — relax `minLength: 1` on stem form
  strings; an empty form is arguably meaningful, marking "no
  additional attested form" in that slot.
- [ ] **Drop at migration** — a migration step filters empty strings
  out of `forms`; the schema stays as reviewed (B11).

**Decision notes:**
