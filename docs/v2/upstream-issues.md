# Upstream Data Issues — Sefaria Reporting Register

Hand-maintained register of data problems in the upstream Jastrow
lexicon (Sefaria MongoDB dump of 2026-07-04, `data/source/`), found
during the v2 pipeline work. Purpose: report these to Sefaria so
their copy can be fixed too. Append new classes as they surface;
update Status when reported/fixed. This file is **not** generated —
edit by hand.

Where an issue says "segmentation," the fault may sit in Sefaria's
import or in the digitization that preceded it — indistinguishable
from this repo. The data damage is real either way.

| # | Issue | Size | Examples | Evidence | Status |
|---|---|---|---|---|---|
| 1 | Three headwords read ך where print (p. 1086) has ד | 3 entries | P00855 (עָמַד I), P00856 (עָמַד II), P00860 (עֶמֶד) | [divergence audit](divergence-audit.md) Finding 2; content evidence in the entries themselves | to report |
| 2 | Phantom sense boundaries: sense split at a `N)` that belongs to a parenthesized cross-reference or citation, leaving an unclosed `(` behind | 36 entries (35 cross-ref + 1 citation) | A00913 (`(v. אוֹר 2)`), A01662, C00244 | [body-review 01](body-review/01-broken-sequences.md) crossref-chop + citation-chop sections | to report |
| 3 | Sense numbering gaps / swallowed markers (e.g. a missing space fusing a page number to the `1)` marker) | 35 entries | A00675 (`p. 18; 261)` = `26` + `1)`), A01350 (1,3,4) | [body-review 01](body-review/01-broken-sequences.md) numbering-gap section | to report |
| 4 | Etymology parenthesis split mid-phrase across `language_code`/`language_reference`/definition; gender markers caught in the wrong field | systemic (5,842 entries carry the split; mid-phrase cases incl. straddles) | K00664 (paren never closes in field), A00014 (orphan comma), A02705, B00880 | [body-census](body-census.md); design doc §1 | to report |
| 5 | Malformed anchor markup: `<a>` open tags whose href swallows following markup (quote never closed) | 3 entries | D00478, J00597, J00603 | cite.ts damage-class fixtures; [body-census](body-census.md) malformed decomposition | to report |
| 6 | Duplicate nested anchors (`<a X><a X>text</a></a>`) | 1,230 anchors (475 in definitions + 755 in `language_reference` — the latter found 2026-07-13, census previously scanned definitions only) | A00085, A00115, C00062 (`language_reference`) | census `citations.malformed.nestedDuplicate` + 2026-07-13 all-fields sweep | to report |
| 6b | Nested anchors with DIFFERENT targets (double-wrapped substring) | 1 known | O00832: anchor to סִירְסוּר wraps an anchor to סִיר in `language_reference` | 2026-07-13 all-fields sweep | to report |
| 7 | refLink hrefs missing the leading slash | 7,659 anchors | `href="Jerusalem_Talmud_Nedarim.5.6.3"` (A00014) | census `citations.slashless` | to report |
| 8 | `quotes` field corruption: token reversal vs body order, truncated third slots (`Bibl`, `Ar`), `I`→`1` substitutions; 8 phrases don't locate in their own body | 324 triples; 8 stragglers | A00202 (`רמ"ח אֵבֶר`), G00337 (`1 will gird`), stragglers in [body-review 03](body-review/03-quotes-stragglers.md) | design-session census (2026-07-11); design doc §6 | to report (note: field appears unused by Sefaria's own code) |
| 9 | Empty-string elements in `grammar.binyan_form` arrays | 486 occurrences / 446 entries | P00791, P01091, Q02144 | [body-review 06](body-review/06-empty-binyan-forms.md); dry-run Finding 3 | to report |
| 10 | Damaged sense-number strings: `[1)` (bracket for digit), ASCII hyphen `-2)` where the corpus convention is em-dash `—2)` | 6 occurrences | D00341 (`[1)`); M02309, O00408, S02030, U00745, U00939 (`-2)`) | [body-review 04](body-review/04-label-quarantines.md) | to report |
| 11 | Internal refLink targets that resolve to no entry | 88 links | (see parent spec register #3) | data-architecture spec §7 #3 | to report |
| 12 | `refs` items with no basis in the entry (possible mis-links) | 3 items | D00541 → Yoma 2a, Q00890 → Yoma 2a:3, M01355 → Rosh Hashanah 23b | [body-review 02](body-review/02-orphan-refs.md) eyes-on section | to report |
| 13 | Mis-targeted internal refLink: anchor text names one thing, href another | 1 known (systematic detection hard: needs text↔target comparison) | A01350 sense —4): text `כפר א׳` (K'far Imra, a place) links to `*איבּוּס` (manger, = A01126) | maintainer review 2026-07-13; present identically in v1 deployed | to report |
| 14 | Form sections (separate lemma sets in print — plural, and, found in a later print pass, passive participle/feminine/denominative) flattened into the preceding sense's definition; no structure for them in the model | all `Pl.` entries (5,484), plus smaller `Part. pass.`/`Fem.`/`Denom.` counts; visibly damaging in the 13 with restarted `1)…` numbering (`Pl.` 5: A01047, B01292, C00062, D00194, E00789; `Part. pass.` 6: A02260, A03348, C00869, C00964, C01139, H01022; `Fem.` 1: G00644; `Denom.` 1: I00311 — the census's 38 candidates across all four markers include 25 false positives, either citation-chapter-number lookalikes or a run belonging to a different, nearer marker (D00194), hand-verified) | C00062 (`—Pl. גְּבוּרוֹת 1)…2)…` inside sense —3's text) | maintainer print verification 2026-07-13 (B12); extended 2026-07-14; form-sections.ts paren-balance discriminator | to report |
| 15 | `refs` field incomplete vs the entry's own inline citations | 13,841 entries / 32,899 citations (book-level: 13,259 / 29,640) | A00014 (34 refs, missing Mishnah Kelim 1:1 + 3 more), A00013 | refs-derivability census (design session 2026-07-11) + 2026-07-13 entry-level measurement | to report (v2 itself drops refs — B7 — but useful to them) |

Counts are as of the 2026-07-04 snapshot; regenerate the censuses
(`bun body:census`, `bun body:dry-run`) to re-derive them against a
newer dump before filing.
