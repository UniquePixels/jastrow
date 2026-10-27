# B01237: the words Sefaria lost in sense *4 (2026-10-27)

PR #201, under ruling `10-13 correction policy`
([`docs/decisions.md`](../../../../../../docs/decisions.md)), case 1:
print is right, Sefaria's text lost words, no annotation. Found by
the maintainer reading the scan of B01237 `ברי, בְּרָא` (192b · leaf
215) during the C1 re-reads (PR #200), 2026-10-27; review checklist
2026-10-25, group 3.

**One reviewed patch, P000939**, appended to
[`../../reviewed/patches.jsonl`](../../reviewed/patches.jsonl). The
manifest's B01237 record now names P000610, P000795 and P000939.
`prompt_version` is `b01237-lost-words-2026-10-27`; this directory
holds only this README. Reproduce the record with:

```sh
jq -c 'select(.prompt_version=="b01237-lost-words-2026-10-27")' \
  admin/pipeline/patch/records/reviewed/patches.jsonl
```

## The defect

Sefaria's text of sense `—*4)` drops `a. בָּרָאָה; cmp. זָהַם` between
`ch.,` and `Pi. 2)`. The reader then sees `Pi. 2)` as if it belonged to
`בַּר I ch.`; in print it belongs to `זָהַם` (G00102, 382a), whose Piel
sense 2 is *to declare unfit …, to reject*.

| | sense `*4)` |
|---|---|
| print (maintainer's read of the scan, 2026-10-27) | `(v. בַּר I ch., a. בָּרָאָה; cmp. זָהַם Pi. 2) to expel, exile. Targ. Prov. XXIV, 24 (h. text זעם).` |
| Sefaria (`data/source/jastrow-dictionary.jsonl`) | `(v. בַּר I ch., Pi. 2) to expel, exile. Targ. Prov. XXIV, 24 (h. text זעם).` |
| stored before (`data/entries/B/B01237.json`) | `(v. בַּר I ch., Pi. 2) to expel, exile. Targ. Prov. XXIV, 24 (h. text זעם).` |
| stored after | `(v. בַּר I ch., a. בָּרָאָה; cmp. זָהַם Pi. 2) to expel, exile. Targ. Prov. XXIV, 24 (h. text זעם).` |

The two Hebrew words are the maintainer's, typed from the scan, NFC;
both are byte-identical to the headwords of the entries they name.

## The evidence

`evidence` is `maintainer-read` (Brian, 2026-10-27, vol. 1 leaf 215).
The hOCR of that leaf, `leafLines(1, 215)` (`admin/pipeline/patch/hocr.ts`)
line 18, copied from the tool's output (its trailing RLM dropped):

```text
Is. XL, 20.—*4) (v. "2 1 ch,, a. MNI2; cmp. Ot Pi. 2) to
```

It witnesses `a.`, `; cmp.` and `Pi. 2)` in print's order, and so that
the words sit between `ch.,` and `Pi. 2)`. It garbles both Hebrew words
(`MNI2`, `Ot`) and witnesses neither: the Hebrew is the scan read's
alone (`admin/pipeline/DESIGN.md` §5, "Patch evidence"). The line's
bbox (x 1562–2747 on a 2774-wide leaf) puts the sense in the right-hand
column, 192b, as P000795 reads it. Scan:
[192b · leaf 215](https://iiif.archive.org/iiif/dictionaryoftarg01jastuoft$216/full/1400,/0/default.jpg).

## The patch

| field | value |
|---|---|
| `target` | `sense[—*4)]:bc82ea41` |
| `payload.find` | `ch., Pi. 2)` (once in the sense) |
| `payload.replace` | `ch., a. <a dir="rtl" class="refLink" href="/Jastrow,_בָּרָאָה.1" data-ref="Jastrow, בָּרָאָה 1">בָּרָאָה</a>; cmp. <a dir="rtl" class="refLink" href="/Jastrow,_זָהַם.1" data-ref="Jastrow, זָהַם 1">זָהַם</a> Pi. 2)` |
| `removes` | none: the patch only adds |

**It applies after P000795.** Reviewed patches on one rid apply in
file order, chained (`applyEntryPatches`, `admin/pipeline/patch/apply.ts`),
and P000795 re-aims this sense's `בַּר I` anchor first. So
`expected_before` is the sense as P000795 leaves it, and the target's
anchor is that text's hash (`bc82ea41`), not P000795's (`53576d09`):
a target's anchor is derived from its `expected_before`, and
`validateCorpus` allows one patch per (rid, target), as D00003's
P000616/P000617 pair does. The `find` does not overlap P000795's
anchor.

**Both words are linked,** each by its link key (ruling `10-09 link
key`), in the form Sefaria's own cites of it take
(`<a dir="rtl" class="refLink" …>word</a>`):

| word | entry | Sefaria's other links to it |
|---|---|---|
| `בָּרָאָה` | B01160 `בָּרָאָה, בָּרָיָיא, בָּרָיָה`, *external, foreign* (itself `v. בַּר I ch.`) | 10 |
| `זָהַם` | G00102 `זָהַם` | 12 |

`a.` reads "and": the parenthesis names two entries, then a third to
compare, so `בָּרָאָה` is a cross-reference like `בַּר I ch.` beside it.

## Verification

- `bun data:import` from an empty `data/entries/`, then
  `bun qa:format`: one entry file changed, `B01237.json`, and only
  sense 4's gloss, which gained `a. <cite ref="B01160"><he>בָּרָאָה</he></cite>; cmp. <cite ref="G00102"><he>זָהַם</he></cite>`.
  Every gate green.
- Against the same run without P000939: `evidenceLocator` 399 → 400
  (leaf 215 locates on B01237's pages), `declaredLoss` 770 → 771 (it
  declares no loss and removes none: `loss reviewed=115/468` both
  ways), `internalTargets` 32512/32512 (both anchors resolve),
  `citeNumeral` 8938 both ways (neither anchor names a numeral).
- `bun data:validate`: 32512 files, 0 problems.
- `bun data:sefaria`: 482 → 483 appendix rows, the new one
  `reviewed-replace` (15 → 16), evidence `maintainer print read
  2026-10-27; hOCR; scan leaf 215`.
