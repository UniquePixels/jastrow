# Headword design — proposal, decisions and open questions

**Status: proposed, not final.** Worked through with Brian on 2026-09-18
and 2026-09-19 while walking the shapes in
[headword-issues.md](headword-issues.md). Nothing here is implemented.

Headwords are load-bearing — lookup, slugs, links all name them — so a
headword defect **halts the pipeline** rather than joining a review list.
That is the rule this design has to be strict enough to support.

## 1. The problem this replaces

Today an entry holds `headword` and `altHeadwords`, each a form object
whose `text` is the marked string Sefaria stored. That string carries
print notation the form object has no room for, so the pipeline either
keeps the notation inside the lookup key or deletes it:

| Print sets | Sefaria stores | Today |
|---|---|---|
| `אֵב, אֵיב (אוֹב)` | `alt_headwords: ["אֵיב", "(אוֹב)"]` | parentheses deleted, grouping lost |
| `אַבְזָקַת (אַבְזָקָא, אַבְזָקָה)` | `["(אַבְזָקָא", "אַבְזָקָה)"]` | one group, torn at print's comma |
| `אַפְרִיקִי (אַפְרִיקָא) I` | `headword: "אַפְרִיקִי"`, `alt: "(אַפְרִיקָא) I"` | parentheses on the wrong form |
| `שִׁיף m., שִׁיפָה f.` | `morphology: "f."`, alts `["שִׁיפָ", "ה"]` | `m.` lost; one form torn in two |

## 2. Structure

```json
"headwords": [
  { "text": "שִׁיף", "gender": "m" },
  { "text": "שִׁיפָה", "gender": "f" }
],
"display": "{0} m., {1} f."
```

- `headwords[0]` is always the primary form. Slugs, search and links use
  it. `headwords[1…]` replace today's `altHeadwords`.
- A form holds only **meaning**: `text` (clean Hebrew), `reconstructed`,
  `homograph`, `disambiguator`, optional `gender`.
- `display` is a template holding **how print set the line**. `{n}`
  inserts form n's bare text. Everything else is literal: commas (or
  their absence), parentheses, `*`, `?`, Roman numerals, superscripts,
  `m.`/`f.`.

Worked examples, one per variation found:

| rid | Print | `display` |
|---|---|---|
| M02007 | comma, numeral after the parenthesis | `{0}, ({1}) I` |
| A02823 | parentheses on the headword, no comma | `({0}) {1} I` |
| K01275 | numeral inside the parentheses | `{0} I, ({1} II)` |
| A00888 | a 1-form group, then a 4-form group | `{0}, ({1}), ({2}, {3}, {4}, {5})` |
| G00374 | group opens on the headword | `({0}, {1})` |
| A00610 | star outside the parentheses | `*({0})` |
| B00825 | `(?)` query | `*(?){0}` |
| A00883 | cross-reference naming two homographs | `{0} I, II` |

### Why a template rather than a display string

A plain `display: "שִׁיף m., שִׁיפָה f."` duplicates the Hebrew. A later
correction to a form would have to be made twice, and the app could not
tell which span is which form — so it could not link a word, highlight a
search hit, or derive a slug from it.

## 3. Rules the pipeline halts on

1. Every form index appears in `display` exactly once.
2. `display` contains **no Hebrew letters or points**. All Hebrew comes
   from the forms.
3. Markers agree with the forms: `*` immediately before `{n}` or its
   group ⇔ `reconstructed`; a **single** numeral beside `{n}` or its
   group ⇔ `homograph`; `m.`/`f.` beside `{n}` ⇔ `gender`.
   **Two or more numerals** beside one form (`{0} I, II`) are a
   reference to other entries, not a number for this one, and require
   no `homograph` — see §4.
4. A form's `text` never contains a comma, parenthesis, `?`, `=` or a
   Latin letter.

## 4. Decisions taken

| Topic | Decision |
|---|---|
| **Commas** | Never stored in a headword. The leading `,` that opens 10,743 glosses also goes; the app supplies separators. The 3 headwords that carry one (A02356, B00407, D00844) are defects. |
| **Parentheses** | The 2026-08-27 ruling ("strip the delimiters, add no new form-object mark") is **reversed in intent**. Grouping is kept as structure in `display` and never inside `text`. A group may span the headword and its alternates. |
| **Roman numerals** | **Never moved.** Each numeral stays on the form it is attached to today and is printed where the source prints it — 10 inside the parentheses, 5 after. |
| **Gender** | At most one of: the entry's `grammar.gender`, **or** a `gender` on *every* headword of the entry. Never both, and no inheritance. |
| **A01480 `אִיסְפְּלָנִית(א)`** | An alternate ending of one word, not a separate form. The only headword in the corpus with this notation. |
| **Numeral lists on cross-references** (H1, 6 rows) | `display` only, **no `homograph`**. All 6 are bare cross-references (`אוּרְיָה I, II, v. אוּרְיָא`) and the numbered forms already exist elsewhere, carrying their own `homograph`: A00877/A00878 hold `אוּרְיָה` 1 and 2, and so on for B00435/B00436, D00607/D00608, E00515/E00516, G00696/G00698. The numerals here point at those entries. |
| **H1 separator defects** (4 rows) | A doubled space (B00098 `בַּד  V`) or a stray comma (B00443, C00329, M00447 `מוֹזְלָא , I`) in front of a single numeral is a defect: the text corrects to `<word> <numeral>` and then parses. |

## 5. Open questions

- **Parenthesis placement is not trustworthy in the source.** A02823 puts
  them on the wrong form (print reads `(0) 1 I`). About 580 entries carry
  parentheses and would need checking against the hOCR or the print.
- **A02823 and M02007**: is the trailing numeral the entry's own? Not
  resolved — under §4 nothing moves either way.
- **Lost per-form gender labels.** Sefaria keeps only the last label on
  the headword line. 22 entries are known
  (`gender-pair-headword-line-collapse`); U01000 is a 23rd, confirmed
  against the print. The true size needs the print text — Sefaria-only
  proxies failed their own controls. **Not a go-live blocker.**

## 6. Shapes found during the walk-through

Not yet enumerated as rows in `headword-issues.md`:

| Shape | Evidence |
|---|---|
| **Split word** — Sefaria tore one form in two | U01000 `שִׁיפָ` + `ה` (print-confirmed), S01780 `קִצ` + `ּא`, V00518 `ת` + `ּשַׁע`, Q00752 `י` + `סְחָא`. These also produce the X1 and X3 rows. |
| **Alternate ending as its own item** | H01195 `תָה`, M01037, M01896, M02409, K00725 `יָא`, O01410 `לה`, S02002 `סָה` — and the H5 ellipsis rows (`… תָּה`). |
| **Optional prefix in parentheses** | U01971 `(הַ)`, K01196 `(ד)`, Q00053 `(בֵּי)` — the prefix-side twin of A01480. |
| **Parenthesis on the wrong form** | A02823, confirmed against the print. |
| **Lost per-form gender label** | U01000 and the 22 known rows; see §5. |

## 7. Next

A full audit of earlier rulings. The parenthesis ruling above was taken
when its cost (losing which forms were bracketed) was not stated, and it
is unlikely to be the only one. Rulings are recorded in three different
formats — lettered (`Ruling C`–`F` in `admin/pipeline/patch/apply.ts`),
dated (`RULING (Brian, 2026-08-27)` in rule modules and specs), and
informal notes in plans — so the audit starts by listing them with what
each one decided **and what it drops**.
