# Audit — `ascii-quote-as-gershayim-in-body` (catalogued 1,234)

**Verdict: RE-MEASURE to 1,908 occurrences / 1,290 entries.** The
description's *interpretation* is confirmed — these really are gershayim,
not quotation marks — but the count is scoped narrower than the
description says, and the defect is 55% larger than this row anyway.

## Probe and raw figure

Reading of the description: inside body text, find ASCII `"` (U+0022)
in a `dir="rtl"` run where print sets gershayim U+05F4. Body text =
`content.senses[].definition` (incl. nested), `content.morphology`,
`quotes[][]`.

```python
RTL = re.compile(r'<(span|a)\b[^>]*\bdir="rtl"[^>]*>(.*?)</\1>', re.S)
TAG = re.compile(r'<[^>]+>')
# for each body field: for each RTL run: count '"' in TAG.sub('', run)
```

**1,912 occurrences / 1,291 entries.** Field split: 1,588 top-level
definitions, 323 nested sub-senses, 1 `quotes[]`, 0 `morphology`.

### Reconciling the catalogued 1,234

| Variant | Occ | Entries |
|---|---|---|
| `<span dir=rtl>` text only | 1,820 | **1,234** |
| `<a dir=rtl>` text only | 92 | 81 |
| union (this probe) | 1,912 | 1,291 |

**`corpusCount: 1234` is distinct *entries* with at least one ASCII `"`
in a `<span dir="rtl">` run — `<a dir="rtl">` link display text silently
excluded.** Re-validated with a real `html.parser` walk tracking
`dir=rtl` ancestry: 1,907 occ / 1,290 entries inside `dir=rtl`, of which
exactly 1,234 entries have a `span` as innermost rtl ancestor. The
figure is reproducible to the entry, but it is an entry count, not an
occurrence count, and it is span-scoped without saying so.

## Does this population have more than one job?

**Essentially one job — but two placement classes with different fixes,
and a third the auditor could not adjudicate.**

By immediate neighbours (niqqud-tolerant), of all 1,912 occurrences:
Hebrew letter on **both** sides 1,908; leading/trailing/whitespace-
flanked (i.e. a quotation mark) **0**; combining-dot-above on the left 1
(M01940, the niqqud skip missed U+0307); regex artifact from malformed
markup 3 (D00478).

**1,909 of 1,912 are inter-letter gershayim; zero are quotation marks.**
No pair of quotes anywhere encloses a phrase — all 92 elements with two
quotes spanning whitespace are two separate abbreviations
(`אח"ס בט"ע`, `ד"א … ד"א`, `ג"ר ד"ק`).

Sub-jobs by gershayim *position* (canonical slot is before the final
letter):

| Sub-job | Occ | Verdict |
|---|---|---|
| **A. Canonical penultimate slot** — plain `"` → `״` is correct and sufficient | 1,826 (95.7%) | **DEFECT** |
| **B. Displaced gershayim** — the token has a penultimate-slot twin that dominates corpus-wide (`הק"בה` 15 vs `הקב"ה` 194; `ב"וד` 9 vs `בו"ד` 19; `בע"הב` 2 vs 12; `להק"בה` 2 vs 14; `גי"מל` 1 vs 8; `רו"הק` 1 vs 6) | 49 (2.6%) | **DEFECT, but a different one** — substituting in place yields a correctly-glyphed gershayim in the wrong slot |
| **C. Non-penultimate, no dominant twin** — `עכ"ום` (12, twin `עכו"ם` 16, a genuine censorship-era variant in 19th-c. prints), `ש"ין`, `דַּלְ"תִים`, `זַיְי"נִין`, `אוכ"טא`, `ע"עז` | 34 (1.8%) | **UNDETERMINED** — displacement cannot be told from print variant without the 1903 scan. Stated plainly rather than assumed |

**No CONVENTION members.** The decisive check: **U+05F4 does not occur
once in the entire 32,512-line file**, while U+05F3 geresh occurs
64,000+ times and appears *in the same strings* as the ASCII quotes
(`משום ח׳ דכה"ג וכ׳`). The corpus has no population of already-correct
gershayim these could be deliberately distinguished from — the
substitution is systematic and total, and there is no competing job for
`"` to hold.

## Sample read

`random.seed(20260818); random.sample(range(1813), 12)` over the
*element* list (weighted by occurrence, not entry), each read with 160
chars of surrounding HTML. Twelve for twelve gershayim, zero
conventions.

| rid | RTL run | Judgement |
|---|---|---|
| M01772 | `שנִתְמַנּוּ ב"ד על וכ׳` | `ב״ד` bet-din — class A |
| D00891 | `לה"ד`, glossed "(abbrev. `מלה"ד`)" | למה הדבר דומה — class A |
| Q00991 | `פְּלַח לע"א` | `לע״א` = עבודה זרה — class A |
| M02939 | `הקב"ה אין לו … ולא מ׳` | `הקב״ה`; a real `׳` in the same run — class A |
| H00365 | `משום ח׳ דכה"ג וכ׳` | `כה״ג`; geresh correct, gershayim ASCII — class A |
| H00133 | `י"ט האחרון וכ׳` | `י״ט` yom tov — class A |
| Q00314 | `ר"י אומר כל שאינו מפיק` | `ר״י` = R. Judah — class A |
| N00681 | `אע"פ שעשה לה נִימוֹסָהּ` | `אע״פ` — class A |
| Q00188 | `שנפ̇ט̇ר מע"ז` | `מע״ז` — class A |
| K00865 | `שירי כה"ג` | `כה״ג` — class A |
| Q00002 | `פ"ה` inside `<a dir="rtl">` | class A — **and invisible to the catalogued count**, being an `<a>`, not a `<span>` |
| Q00936 | `זוכה לפ׳ של הקב"ה` | `הקב״ה` — class A |

Seven targeted class-B/C members also read: B01371 `ב׳ ודם (abbr. ב"וד)`
— Jastrow's own abbreviation of בשר ודם, print `בו״ד`, displaced;
A02325 `הק"בה`; B00435 `בגי׳ 'מל וש"ין` — both marks displaced *and* the
gershayim of `גימ״ל` split into a stray ASCII apostrophe; D00863
`דַּלְ"תִים`; A01394 `ה"דא"א`; P00731 `ע"עז`; A00692 `עכ"ום`.

## Letter A

**86 entries / 127 occurrences** span-only, matching the catalogued
scope (86 of the 1,234). A is 10.6% of the corpus but 6.7% of member
entries; hit rate 2.49% of A entries against 3.97% corpus-wide.
Under-represented ~1.6×, not absent; the range across 22 letters is
2.49% (A) to 7.39% (J), so A is at the low end of an ordinary spread.

## Disposition

**RE-MEASURE to 1,908 occurrences / 1,290 entries**, recording
occurrences as the primary figure. Probe: as above, restricted to
Hebrew-flanked quotes (drops the 3 D00478 artifacts) — both neighbours,
skipping U+0591–U+05C7 and U+0307, matching `[א-ת]`.

- `corpusCount: 1234` → **1908**, entry count 1,290 recorded alongside.
  The +56 entries are ones whose only body-text gershayim lives in
  `<a dir="rtl">` display text (Q00002, A00009, A01065 …).
- New description: *ASCII double quote (U+0022) used as gershayim inside
  dir=rtl body-text runs — span and anchor display text alike — where
  print has ״; U+05F4 occurs 0 times in the corpus.*

### Two riders the transform author needs

1. **49 occurrences are displaced** (class B). A blind `"` → `״`
   substitution glyph-corrects them while leaving the mark in the wrong
   slot. They need a reposition rule keyed to the dominant penultimate
   twin, or explicit deferral. Another 34 (class C) are undetermined.
2. **The same defect is 55% larger than this row's scope.** Corpus-wide,
   ASCII-quote-as-gershayim occurs **2,317 times across 1,392 entries**:
   1,907 in `dir=rtl` definition text, 172 inside `href`/`data-ref`
   attribute values (81 entries), 117 in bare RTL definition text with
   no wrapper (109 entries), 69 in `headword`, 21 in `refs[]`, 19 in
   `alt_headwords`, 8 in `plural_form`, 4 in `quotes[]`. Because `refs[]`
   and `data-ref` carry the same abbreviations (`Jastrow, א"ת 1`),
   **fixing body text without fixing headwords, `refs[]` and `data-ref`
   in the same pass will break cross-links that currently match by
   string identity.** This row cannot be dispositioned in isolation.

## What would have falsified this

The count is not confirmed but its *interpretation* is, so the test
still applies. Two findings would have overturned it; both were looked
for:

- **Any ASCII `"` in `dir=rtl` body text functioning as a quotation
  mark** — string-initial, string-final, whitespace-flanked, or a
  matched pair enclosing a phrase. Those would be CONVENTION under a
  different typographic rule, and a `"`→`״` transform would corrupt
  them. **Found: 0 of 1,912.** All 92 two-quote elements re-read
  manually; all are multiple abbreviations.
- **Any real U+05F4 already present**, which would mean the corpus
  distinguishes the two. **Found: 0 in the entire raw file**, against
  64,000+ U+05F3 — including geresh and ASCII-gershayim coexisting in
  single strings (H00365, E00298, M02939).

**Not falsifiable here:** the clause "where print has ״". The 1903 print
was never inspected. For the 1,826 canonical-slot members the inference
from Hebrew orthography is near-certain; for the 34 class-C members
(notably the 17 `עכ"ום`-family occurrences) it is not, and that is
flagged undetermined rather than assumed.

## Overlap with other catalogue rows

- **`gershayim-breaks-ref-attribute` (85)** — direct sibling. 172
  `href`/`data-ref` early-terminations across 81 entries (~86 distinct
  anchors, matching their 85) measured independently. The 56 entries
  this row gains over 1,234 are the **display-text** side of those same
  anchors, which that row does not cover. **The two rows leave a
  56-entry gap between them and must be transformed together, or link
  text and link target will disagree.**
- **`bare-rtl-hebrew` (4,900)** — 117 occ / 109 entries of ASCII
  gershayim in unwrapped RTL definition text belong to that row today.
  **Ordering dependency:** if `bare-rtl-hebrew` runs first and wraps
  them, they migrate into this row's scope and this count rises to
  ~2,025 occ.
- **`unterminated-href-swallows-closing-tag` (2)** — D00478 is one of
  them and is the sole source of the 3 spurious occurrences here.
- **`abbrev-in-alt-headwords` (2,265)**, **`redundant-outer-rtl-span`
  (529)** — the 19 `alt_headwords` occurrences fall inside the former;
  the latter's nested spans are why the regex was cross-checked against
  a real HTML parser (they agree).
- Geresh-family rows (`vkh-geresh-loss` 11, `geresh-abbrev-space-loss`
  22) are the single-mark analogue — related but disjoint. 36 ASCII
  apostrophes sit in `dir=rtl` body text and are not in this population;
  B00435's `בגי׳ 'מל` shows one abbreviation corrupted across both
  families at once.
