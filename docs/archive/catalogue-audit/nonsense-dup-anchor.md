# Audit — `nonsense-dup-anchor` (catalogued 1,220)

**Verdict: RE-SCOPE to 755.** The figure 1,220 is real and exactly
reproducible, but it is not a count of *non-sense fields*: 465 of the
1,220 entries (38%) live in `content.senses[].definition`. A transform
written to this row's description would scope to `language_reference`,
fix 755, and silently leave 465 entries defective while believing the
row cleared. Worse, those 465 are already catalogued separately — see
"Double count" below.

## Probe and raw figure

Nesting is depth-tracked rather than regex-matched, so
`<a>…<a>…</a>…</a>` is caught however the tags are spaced.

```python
TOK  = re.compile(r'<a\b[^>]*>|</a\s*>', re.I)
HREF = re.compile(r'href="([^"]*)"')

def nested_pairs(s):            # (outer, inner) for every <a> opened at depth>0
    st, out = [], []
    for m in TOK.finditer(s):
        t = m.group(0)
        if t.lower().startswith('</'):
            if st: st.pop()
        else:
            if st: out.append((st[-1], t))
            st.append(t)
    return out
```

| Measure | Occ | Entries |
|---|---|---|
| any nested `<a>` in any field | 1,251 | 1,223 |
| nested with **byte-identical href** (a true duplicate wrap) | **1,230** | **1,220** |
| — in `language_reference` | 755 | 755 |
| — in `content.senses[].definition` | 475 | **465** |
| nested with a *different* href (excluded) | 21 | 4 |

**1,220 reproduces exactly — but only when sense definitions are scanned
alongside `language_reference`.** Restricted to non-sense fields as the
description says, the figure is **755**.

Every other non-sense field scores zero, and informatively so — they are
populated, not trivially empty: `headword` 0, `alt_headwords` 0 (8,673
populated), `plural_form` 0, `refs` 0 (29,372 populated), `quotes` 0,
`content.morphology` 0 (13,162 populated), `language_code` 0. **The
"etc." in the description is empty:** `language_reference` is the only
non-sense field containing anchors at all (5,339 `<a>` tags across 4,174
entries). Aside, outside this row: `language_code` carries 35 stray
anchors in 35 entries, none nested.

## Does this population have more than one job?

Three functions, all DEFECT, but with different shapes, fields and
downstream owners. The outer and inner attribute sets are
**byte-identical in all 1,230 members** — no `class`, `dir` or
`data-ref` ever differs — and the outer anchor **never** covers content
beyond the inner anchor plus at most one punctuation mark (`pre=EMPTY`
in 1,230/1,230). There is no reading under which the outer tag carries
meaning.

| Function | Occ | Entries | Field | Verdict |
|---|---|---|---|---|
| **A. Terminal-punctuation double wrap** — `<a H><a H>X</a>)</a>`, outer exists only to swallow one trailing character. Post-char `)` ×770, `.` ×439, `,` ×1. Href is a `/Jastrow,_…` cross-reference in 1,210/1,210; outer `</a>` sits at the very end of the field in 1,134 of 1,230 | 1,210 | 1,210 | 755 `language_reference`, 455 sense definitions | DEFECT |
| **B. Exact double wrap of a Jerusalem Talmud citation** — no punctuation trapped, mid-sentence, always two per entry, href a `Jerusalem_Talmud_*` target **missing its leading slash** in 20/20 | 20 | 10 | sense definitions | DEFECT, structurally different |
| **C. Unterminated-`href` pseudo-nesting** — `href="/Jastrow,_כָּלוּל.1</a>` swallows the closing tag, so the parser sees nesting that isn't there. Excluded by the same-href test | 21 | 4 (D00478, J00597, J00603, O00832) | 19 sense, 2 `language_reference` | DEFECT, different row |

**The convention hypothesis, tried and failed.** Is
punctuation-inside-the-anchor a house style? Against the non-nested
corpus the norm is punctuation *outside*: `</a>.` occurs 27,505 times in
clean sense definitions vs 455 trapped, 60:1. One honest counter-figure,
reported rather than suppressed: inside `language_reference`
specifically, when a closing `)` follows an anchor, the defective
doubled form (755) **outnumbers** the correct form (572), 1.3:1. So
frequency alone would not condemn these. The condemnation rests on
structure — HTML forbids `<a>` inside `<a>`, every parser auto-closes
the outer tag, and the markup reduces to an **empty anchor** followed by
the real link. Reader-visible text is unaffected; the artefact is an
anchor with no discernible text (an accessibility defect) plus a phantom
link target for any consumer extracting links from raw HTML. Whether
this originates upstream in Sefaria or in the import could not be
determined — nothing in this repo carries the pre-import source.

## Sample read

`random.seed(20260818); random.sample(sorted(member_rids), 12)` —
uniform over the whole member set, not over one field. All 12 are
function A.

| rid | headword | field | Note |
|---|---|---|---|
| M02590 | מָרוֹם | `language_reference` | etymology "(b. h.; רוּם)"; outer wrap holds only the closing paren |
| C01275 | גַּרְדּוּמָא | `language_reference` | "ch. = h." cognate pointer, wrapped twice, post `.` |
| Q01867 | פָּרֹכֶת | `senses[0].definition` | final item of a cognate list; the preceding sibling link is single-wrapped, only the terminal one doubles — **field is a sense, contradicting the row's scope** |
| K00908 | כְּסוּסְטְרָא | `senses[0].definition` | same terminal-item pattern |
| K00165 | כָּהֵן | `language_reference` | on כֹּהֵן, post `.` |
| T00483 | רַחוּם | `language_reference` | on רָחַם, post `)` |
| M01762 | מְנַחֵשׁ | `language_reference` | on נָחַשׁ, post `)` |
| S01857 | קְצָת | `language_reference` | on קָצָה, post `)` |
| M02907 | מִשְׁכָּן | `language_reference` | on שָׁכַן, post `)` |
| K01222 | כַּרְכֵּשׁ | `senses[1].definition` | terminal cognate כַּרְכְּשָׁא, post `.` |
| V00035 | תֵּבָה | `language_reference` | longest-context member drawn; outer wrap still covers nothing but the last link and the paren |
| M00944 | מַחֲשָׁבָה | `language_reference` | on חָשַׁב, post `)` |

Group B read in full (10 entries): A00722, C01048, J00603, K00021,
K01007, M01214, N00255, P01456, S00534, U00888. E.g. U00888
`…<a href="Jerusalem_Talmud_Berakhot.9.1.16"><a href="…">Y. Ber. IX, 13ᵃ</a></a> bot.`
Each entry carries the same citation double-wrapped twice, mid-sentence,
no punctuation trapped, href lacking its leading slash.

## Letter A

**122 entries** (58 `language_reference`, 64 sense definitions), plus
A00722 in group B. That is 10.00% of the 1,220 members against letter
A's 10.63% corpus share — proportional, no skew. Per-letter rates run
1.64% (I) to 7.16% (M); A sits at 3.53% against a corpus mean of 3.75%.

## Disposition

**RE-SCOPE to 755.**

- `corpusCount`: **755**
- New description: *duplicate anchor wrap in language_reference:
  `<a H><a H>X</a>P</a>` with byte-identical outer/inner attributes, the
  outer layer wrapping nothing but the inner anchor and one trailing
  punctuation mark (`)` ×702, `.` ×52, `,` ×1); language_reference is
  the only non-sense field affected.*

Probe: the code above restricted to `language_reference`, keeping only
same-href pairs.

Secondary: the 10 group-B entries should be broken out or handed to
`jt-href-slash`, since they are not a punctuation wrap.

## Double count found

**`nested-anchor-swallows-punctuation` (round 1, 465)** — "in-sense
nested anchor pair with byte-identical data-refs trapping punctuation
between the two tag layers" — is **exactly this row's sense-side set:
465 entries, to the digit.** The catalogue counts those 465 entries
twice, once inside this row's 1,220 and once on its own. Two transforms
written against the two rows would both target the same 465 entries.

One correction owed to that row as well: 455 of its 465 trap
punctuation; the other 10 (group B) trap nothing.

## What would have falsified this

The count is not being confirmed, so the burden runs the other way.
Findings that would have made "1,220 in non-sense fields" correct, all
looked for and absent:

- **Another non-sense field contributing the missing 465.** All eight
  checked; all zero, and all confirmed populated rather than trivially
  empty, so the zeros are informative.
- **A definition of "duplicate" other than same-href landing on 1,220
  within `language_reference` alone.** Four tried: all-nesting
  (1,251/1,223), same-href (1,230/1,220), adjacent-tag regex
  `<a…><a…>` (1,232/1,222), per-field entry counts. Only
  same-href-across-both-fields yields 1,220; no non-sense-only variant
  comes within 400.
- **A convention hiding inside the population** — the `same` lesson
  applied here would be an outer anchor carrying attributes or coverage
  the inner lacks. Attribute-set equality identical in 1,230/1,230;
  outer span coverage `pre=EMPTY` in 1,230/1,230, post ≤1 char. No
  member survives as a convention.
- **Frequency evidence that punctuation-in-anchor is house style.**
  Measured: 60:1 against in senses, but only 1.3:1 against within
  `language_reference`'s paren niche. Reported because it is the
  strongest fact available *for* the convention reading; it still does
  not carry, HTML nesting being invalid regardless of frequency.

## Overlap with other catalogue rows

- **`nested-anchor-swallows-punctuation` (465)** — full double count,
  see above.
- **`jt-href-slash` (7,679, discarded)** — all 20 group-B occurrences
  carry `href="Jerusalem_Talmud_…"` with no leading slash, so those 10
  entries are also members of that discarded row.
- **`unterminated-href-swallows-closing-tag` (round 2, 2)** — group C's
  unterminated-quote entries are exactly **D00478 and J00597**, matching
  that row's count of 2. Correctly excluded here by the same-href test;
  J00603 and O00832 are collateral in the same scan but not
  unterminated-href cases.
- **Adjacent, non-overlapping family** (same anchor-boundary-vs-
  punctuation failure mode, single-anchor variants): `anchor-swallows-
  close-paren` (493 — **corrected 2026-08-26 from 494**, which was
  arithmetic rather than measurement; batch 4 re-measured the row at
  525 occ / 493 ent), `open-paren-in-anchor-display` (214),
  `open-paren-in-rtl-span` (89). Worth grouping for transform design; no
  member overlap.
