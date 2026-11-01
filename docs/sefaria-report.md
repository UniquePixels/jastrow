# Jastrow Lexicon — Corrections for Sefaria (cover note)

**Who.** The jastrow.app project (Brian L., brian@uniquepixels.xyz),
which rebuilds Marcus Jastrow's *Dictionary of the Targumim, Talmud
Babli, Yerushalmi and Midrashic Literature* (1903) from Sefaria's
export of it: `lexicon_entry`, `parent_lexicon: "Jastrow Dictionary"`,
snapshot of 2026-07-04, 32,512 entries.

**What is sent.** One CSV, [`reports/sefaria-appendix.csv`](reports/sefaria-appendix.csv):
one row per verified error in Sefaria's copy of the book, with the
text as Sefaria has it, the text as the printed page has it, and the
evidence. The errors are OCR misreadings (a wrong letter, a lost or
wrong vowel point, a numeral read as a letter) and Sefaria's parsing
and linking (a sense cut in the wrong place, a homograph numeral
dropped or moved, a cross-reference aimed at the wrong homograph).

**What is never sent.** Our own corrections of the print's errors,
Jastrow's own conventions (the implied `1)`, the implied homograph I,
print's lettering), and the structures of our own data model. The
maintainer's bar (2026-10-16): "whatever is sent to them must be solid
and verified. No slop, no garbage, no ambiguous etc. Just solid,
errors from OCR or Sefaria parsing."

## Where the rows come from

Every row is one reviewed correction record of ours (a *patch*, under
`admin/pipeline/patch/records/reviewed/`). Since 2026-10-26 every such
record carries a mandatory `evidence` object naming what it was read
against (ruling `10-26 patch evidence` in [`decisions.md`](decisions.md)):
a line of the page's hOCR quoted verbatim, a person's read of the scan
with their name and date, or Jastrow's own words when they determine
the change. `bun data:sefaria` (`admin/pipeline/sefaria.ts`) turns
those records into the appendix, admitting a record only when all four
filters hold:

1. **Sefaria's own error**, not our correction of print and not
   Jastrow's convention (the excluded classes and operations are listed
   in `admin/pipeline/report/sefaria-evidence.ts`).
2. **Print evidence**: the record's `evidence.kind` is a print read
   or Jastrow's text, never Sefaria's text alone (a record still
   waiting for its re-read is held back, whatever its notes say), and
   the rationale names it: an hOCR line, a scan read, or, for a
   cross-reference retarget, Jastrow's own text (the cite reads `X N`
   and exactly one entry of X's family carries `N` in Sefaria's data,
   or carries it once a print-read row of this appendix restores the
   numeral Sefaria dropped; the evidence column names that row).
3. **Traceable to Sefaria's string**: the changed text, with its
   context, occurs exactly once in the raw field of Sefaria's record.
4. **Still there** in the source as fetched: a row Sefaria has since
   fixed drops out.

A record that fails a filter goes to the review list, never into the
appendix. The generator writes three files; only the first is for
Sefaria.

| File | Holds |
|---|---|
| [`reports/sefaria-appendix.csv`](reports/sefaria-appendix.csv) | one row per verified instance — **the deliverable** |
| [`reports/sefaria-appendix.md`](reports/sefaria-appendix.md) | the current row count, rows by class, what is new since the last submission |
| [`reports/sefaria-review.csv`](reports/sefaria-review.csv) | every record a filter held back, with the reason — our work list, not sent |

## How to read a row

| Column | Meaning |
|---|---|
| `rid` | the entry's id in Sefaria's record, our key |
| `sefaria_oid` | the record's Mongo `_id` |
| `sefaria_headword` | the headword as Sefaria stores it |
| `class` | the kind of error (`headword-ocr-glyph`, `cross-reference-target`, …) |
| `field` | the path in Sefaria's record: `headword`, `alt_headwords[0]`, `content.senses[2].definition` |
| `sefaria_text` | Sefaria's current string, verbatim: a substring of the field with enough context to occur once |
| `corrected_text` | the same span as the printed page has it |
| `evidence` | the print read or the text proof |
| `scan` | the page image (Internet Archive, 1903 edition, University of Toronto copy), with volume, page and leaf |
| `patch_id` | our record's id |
| `first_seen` | the date of the review that found it |
| `submitted_batch` | the batch that sent it; empty for a row not yet sent |

**Notation in the text cells.** `‖` marks the boundary between two
sense objects: the text after it is the next sense, its `number`
first. A `field` such as `content.senses[0–1]` names two adjacent
senses. `(absent)` is a field the record does not carry; `(empty)` is
a field left empty. `alt_headwords` with no index is the whole array,
as JSON.

A corrected headword is also the string Sefaria's internal links name
(`/Jastrow,_<headword>.1`), so a headword that changes needs the links
that name it moved with it.

## Patterns with no rows

These are mechanical defects of the export, each with a detection
that finds every instance. Our import repairs them by a rule over the
whole corpus, so there is no per-instance record and no row; the
counts are over the 2026-07-04 snapshot (re-measured 2026-10-16).

| Pattern | Size | Detection |
|---|---|---|
| `refLink` `href` missing its leading slash | 7,679 anchors | `href="` not followed by `/` |
| identical anchor nested in itself (`<a X><a X>t</a></a>`) | 1,230 anchors (475 in definitions, 755 in `language_reference`) | `<a` followed at once by `<a` with the same `href` |
| `<a>` whose `href` is never quote-terminated, swallowing the markup after it | 2 entries (D00478, J00597) | an `href` value containing `<` |
| empty strings in `grammar.binyan_form` arrays | 486 in 446 entries | an array element `""` |
| ASCII hyphen for the em dash in a sense number (`-2)` for `—2)`) | 5 senses | `number` matching `^-\d+\)$` |
| strings not in Unicode NFC (mark order, uncomposed Latin/Greek diacritics) | 201 strings in 175 entries | `s !== s.normalize('NFC')`; `NFD` equal before and after, so the fix is lossless |

## The submission log

[`sefaria-submissions.jsonl`](sefaria-submissions.jsonl), kept by hand:
one line per batch sent, `{"batch", "date", "channel", "patch_ids" or
"classes", "response"}`. The generator marks every row a batch names
with that batch, so a run after a submission shows what is new. The
log is empty: nothing has been sent yet.

The class-by-class prose this note replaced, with its census counts
and review history, is archived at
[`archive/sefaria-report-2026-10-27.md`](archive/sefaria-report-2026-10-27.md).

*Full rid lists for any class, and the detection scripts, available on
request: brian@uniquepixels.xyz · jastrow.app.*
