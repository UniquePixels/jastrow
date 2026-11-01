# V00518: the torn headword line of תִּישַׁע (2026-11-01)

Issue [#113](https://github.com/UniquePixels/jastrow/issues/113), row
V00518, the last of its five, under ruling `10-13 correction policy`
([`docs/decisions.md`](../../../../../../docs/decisions.md)), case 1:
print is right, Sefaria's text tore the line, no annotation. The
maintainer read the print line during the headword walk-through of
2026-09-20 and recorded it in the issue; the row waited there because
`reform` could not then move text into a sense (ruling `09-21 admin
edits`), and once it could (ruling `09-29 reform gloss`) the new
`gloss` field was refused on an entry that already has a sense, which
V00518 does. The fix below uses two ops that have existed since, and
was written on the maintainer's go of 2026-11-01.

**Two reviewed patches, P000942 and P000943**, appended to
[`../../reviewed/patches.jsonl`](../../reviewed/patches.jsonl); the
manifest gains a V00518 record naming both. `prompt_version` is
`v00518-torn-headword-2026-11-01`; this directory holds only this
README. Reproduce the records with:

```sh
jq -c 'select(.prompt_version=="v00518-torn-headword-2026-11-01")' \
  admin/pipeline/patch/records/reviewed/patches.jsonl
```

## The defect

Print (1667a) sets one headword and a reference: `תִּישַׁע, v. תְּשַׁע ch.`
Sefaria's text tore the reference word in two and filed the pieces as
alternate headwords, so the entry carried three "headwords", the real
one and two fragments, and a sense holding only the tail ` ch.`.

| | headword line | sense |
|---|---|---|
| print (maintainer's read, 2026-09-20) | `תִּישַׁע` | `v. תְּשַׁע ch.` |
| Sefaria (`data/source/jastrow-dictionary.jsonl`) | `headword` `תִּישַׁע`, `alt_headwords` `ת`, `ּשַׁע` | ` ch.` |
| stored before (`data/entries/V/V00518.json`) | `תִּישַׁע`, `ת`, `ּשַׁע` (display `{0}, {1}, {2}`) | ` ch.` |
| stored after | `תִּישַׁע` | `v. <cite ref="V01106"><he>תְּשַׁע</he></cite> ch.` |

The second fragment opens on a dagesh (U+05BC), so the torn word was
`תּשַׁע`, without the sheva print sets; the fragments do not rejoin to
print's spelling, which is why this row could not take U00489's
byte-exact join (P000811). The word `תְּשַׁע` is the maintainer's, typed
from the scan, NFC, and byte-identical to the headword of V01106.

## The evidence

`evidence` is `maintainer-read` (Brian, 2026-09-20, vol. 2 leaf 990,
page 1667 in the page index). The hOCR of that leaf,
`leafLines(2, 990)` (`admin/pipeline/patch/hocr.ts`) line 49, reads:

```text
V. S1DF1 ch.
```

It witnesses `v.` and `ch.` with a word between them, and nothing of
the Hebrew: vol. 2's hOCR holds no Hebrew character
(`admin/pipeline/DESIGN.md` §5, "Patch evidence"), so the headword and
the reference word rest on the scan read alone. Scan:
[1667a · leaf 990](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$991/full/1400,/0/default.jpg).

## The patches

| field | P000942 | P000943 |
|---|---|---|
| `op` | `reform` | `replace` |
| `target` | `forms:1fc0aac6` | `sense[]:8f03d4b8` |
| `expected_before` | `תִּישַׁע\nת\nּשַׁע` | ` ch.` |
| `payload` | `forms: ["תִּישַׁע"]` | `find` ` ch.` → `replace` `v. <a dir="rtl" class="refLink" href="/Jastrow,_תְּשַׁע.1" data-ref="Jastrow, תְּשַׁע 1">תְּשַׁע</a> ch.` |
| `removes` | `תּשַׁע` (the two fragments' six codepoints) | none: the patch only adds |

**P000943 applies after P000942** on the same rid (`applyEntryPatches`,
`admin/pipeline/patch/apply.ts`, file order). The reform touches only
the headword block, so the sense's anchor (`8f03d4b8`, the hash of
` ch.`) is the same before and after it.

**The reference is linked** by its link key (ruling `10-09 link key`),
in the form Sefaria's own cites take, to V01106 `תְּשַׁע, תִּשְׁעָא,
תִּשְׁעָה` (*ch.* nine), whose headword is byte-identical to the word;
`v.` before a word is the dictionary's cross-reference, as A01175's
`= Y` was read on P000309.

## Verification

- `bun data:import` from an empty `data/entries/`, then
  `bun qa:format`: one entry file changed, `V00518.json`: the
  headword block went from three forms (display `{0}, {1}, {2}`) to
  one (`{0}`), and the sense from ` ch.` to
  `v. <cite ref="V01106"><he>תְּשַׁע</he></cite> ch.`. Every gate
  green. The first run, before `removes` was declared on P000942,
  stopped on `declaredLoss` 772/773 with `removes "תּשַׁע"
  undeclared`: the gate computed the six codepoints the declaration
  now carries.
- Against the run at `1525c2056` (before these records):
  `evidenceLocator` 566 → 568 (leaf 990 locates on V00518's page),
  `declaredLoss` 771 → 773 (P000942 declares the fragments, 115 → 116
  reviewed patches removing 468 → 474 codepoints; P000943 removes
  nothing), `internalTargets` 32512/32512 (the V01106 anchor
  resolves), `citeNumeral` 8938 both ways (the anchor names no
  numeral). Patch corpus 771 → 773 reviewed, 815 → 817 applied.
- `docs/reports/headword-issues.md`: shape X1 "starts with a
  vowel/dagesh mark" 1 → 0; V00518's `ּשַׁע` was its only row.
- `bun data:validate`: 32512 files, 0 problems.
- `bun data:sefaria`: 469 → 471 appendix rows, `headword-torn`
  1 → 2 and `reviewed-replace` 16 → 17, both on evidence
  `maintainer print read 2026-09-20; vol. 2 p. 1667a · leaf 990`;
  the review list stays at 302.
