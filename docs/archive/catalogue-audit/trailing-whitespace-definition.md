# Audit — `trailing-whitespace-definition` (catalogued 2,340)

**Verdict: RE-SCOPE to 10.** The description is literally true of all
2,340 entries and materially false about all but ten of them. A
`trimEnd()` transform written against this row would delete 1,976 sole
separators, welding gloss heads onto their sense labels corpus-wide.

## Probe and raw figure

```python
def walk(senses, path=()):                      # top-level + nested
    for i, s in enumerate(senses or []):
        if isinstance(s, dict):
            yield path + (i,), s
            yield from walk(s.get("senses"), path + (i,))

for line in open("data/source/jastrow-dictionary.jsonl"):
    e = json.loads(line)
    for p, s in walk((e.get("content") or {}).get("senses")):
        d = s.get("definition")
        if isinstance(d, str) and d != d.rstrip():
            record(e["rid"], p, d)
```

**2,450 occurrences / 2,352 entries.** Every tail is a single `U+0020`
— no tabs, newlines, NBSP or entity forms; an `\s$` variant returns the
same figures. 44,668 senses carry a string `definition`.

The catalogued 2,340 reproduces exactly as an **entry** count minus the
12 entries whose definition is whitespace *and nothing else*
(2,352 − 12 = 2,340). So a transform author reading `corpusCount: 2340`
under-budgets the edits by 110 (2,450 occurrences).

## Does this population have more than one job?

**Yes — and the minority job is the defect.**

| Function | Occ | Verdict |
|---|---|---|
| Field-split separator, sole separator present (next sense has no leading space) | **1,976** | **CONVENTION** |
| Field-split separator, redundant (next sense also carries a leading space) | **452** | CONVENTION (redundant but structural) |
| Terminal whitespace at the entry's last sense, nothing follows | **10** | **DEFECT** |
| Definition is whitespace only | 12 | Different defect (empty sense); already outside the 2,340 |

Positionally: 2,206 on top-level `senses[0]`, 191 nested, 53 non-first
top-level.

### Four independent lines of evidence that the space is load-bearing

**(a) The distribution is not serializer residue.** Same field, same
serializer, same position — the only variable is whether another
fragment follows:

| Population | hits / senses | rate |
|---|---|---|
| sense is followed by another sense | 2,440 / 12,162 | **20.06%** |
| sense is last in its entry | 10 / 32,506 | **0.031%** |
| `senses[0]` when it is the only sense | 8 / 27,517 | 0.03% |
| `senses[0]` when other senses follow | 2,198 / 4,871 | **45.12%** |

A ~1,500× swing driven solely by whether a separator is needed. Junk
does not do that.

**(b) The pipeline's own contract says so.** `admin/pipeline/body/rejoin.ts`
— "pure concatenation of the upstream fragments in print order… No
separators are invented; whatever whitespace or punctuation Sefaria
already put at the edges of each fragment is all that ever appears
between them."

**(c) Shipping code performs that concatenation.**
`admin/pipeline/body/repairs.ts:366` concatenates with no separator
inserted. And **0 of 10,186 `sense.number` tokens carry leading
whitespace**, so in the gloss-head → `1)` join the preamble's trailing
space is the only thing between them. rstrip A00016 and "swelling,
spreading, whence 1) the young shoots" becomes "…whence1) the young
shoots".

**(d) 2,089 of the 2,428 boundary cases continue mid-sentence** — the
next sense opens lowercase or with a comma. Preamble and sense 1 are one
print sentence split across two records.

**(e) Round 2 already ruled on the other edge of this seam.**
`discovery-round-2-candidates.md` records "Leading whitespace in
definitions: 15,822 at sense[0] (the field-split convention)" — the
probe reproduces 15,822 exactly. Round 2 rescued leading-whitespace at
`senses[0]` as convention, then called trailing whitespace its "twin…
same debris class" without noticing that 90% of trailing whitespace sits
at that same `senses[0]` position. Same convention, one edge over.

## Sample read

12 occurrences, uniform random over the full 2,450-occurrence list,
`random.Random(20260818).sample()`, no filtering by class.

| rid | headword | sense[0] tail | next sense opens | Judgement |
|---|---|---|---|---|
| M00461 | מוּטָב | `" (יָטַב) "` | `1)` `" (it is) good, better."` | CONVENTION — sole separator |
| C01266 | גַּרְגִּשְׁתָּא | `" (= גשגש׳; גשש) = h. גּוּשׁ, "` | `1)` `"clod, lump of earth."` | CONVENTION — mid-sentence |
| P00815 | עָלַל | `" עוֹלֵל Pol. …) to go about, "` | `1)` `" (cmp. סוּר I ch.) …"` | CONVENTION — double seam |
| G00597 | זְעֵיר I | `", fut. יִזְעַר … זְעֵיר) "` | `1)` `"to be slender, small"` | CONVENTION — sole separator |
| H00833 | חִיסּוּם | `" (חָסַם II) [finish, polish,] "` | `1)` `"the steel-coating…"` | CONVENTION — sole separator |
| T00981 | רצי | `" v. רְעֵי II) "` | `1)` `"to favor, pardon."` | CONVENTION — sole separator |
| L00255 | לְוִיָּה | `" (לָוָה) "` | `1)` `"consort, wife."` | CONVENTION — sole separator |
| S00491 | קוּפָּא I | `" (קפף) = h. קוּפָּה, "` | `1)` `"basket, tub."` | CONVENTION — after comma |
| N00021 | נָאלָא II | `" (לְאִי, לְהִי, v. P. Sm. 2260) "` | `1)` `"fatigue, heavy load"` | CONVENTION — sole separator |
| H01404 | חִסְנָא | `" (חֲסַן) "` | `1)` `"strength, power."` | CONVENTION — sole separator |
| V00122 | תהי | `" (cmp. שָׁהָא) [to stand still,] "` | `1)` `"to gaze, be astonished"` | CONVENTION — sole separator |
| J00221 | יוֹעֶזֶר | `" (b. h.) "` | `1)` `" pr. n. m. Joezer."` | CONVENTION — double seam |

**12/12 separators, 0/12 defects.** The entire 10-member end-of-entry
subpopulation was also read (A01506, A02628, A03299, C01264, D00267,
H00654, L00289, N00873, P01087, R00262): all ten end in completed,
terminated text — A03299 `", v. אֲשִׁיתָּא. "`, C01264 `", v. גַּרְגְּרָן h. a. ch. "`
— with a stray space and nothing after. None is a truncation. Real,
harmless, strippable junk.

## Letter A

**217 occurrences / 201 entries** — 8.5% of member entries against A
being 10.6% of the corpus. Within A: 159 sole-separator, 55 double-seam,
3 end-of-entry (A01506, A02628, A03299), 0 blank-only. The pilot tranche
exercises every class.

## Disposition

**RE-SCOPE to the subset where nothing follows the whitespace.**

```python
fl = flatten(entry.content.senses)          # depth-first
d  = fl[-1].definition
defect = isinstance(d, str) and d.strip() != "" and d != d.rstrip()
```
→ **10 occurrences / 10 entries** (3 in letter A).

New description: *trailing whitespace on the final sense of an entry,
where no following fragment consumes it as a separator (10; the other
2,430 sit at a sense boundary and are the trailing edge of the
field-split convention documented for the 15,822 leading-space cases).*

`corpusCount`: **10**. At that size it may be cheaper to fold into a
general "terminal whitespace normalisation" note than to carry as a row.
The 12 whitespace-only definitions belong with `empty-lead-sense` /
`contentless-entry`, not here.

**Do not write a corpus-wide `trimEnd()` on `definition`.** If a later
stage wants normalized whitespace, the separator must first be
materialized into the join — and `rejoin.ts` explicitly refuses to
invent separators. That is a design change, not a data patch.

## What would have falsified this

**If trailing whitespace occurred at a comparable rate on senses with
nothing following as on senses at a boundary**, it would be
indiscriminate serializer residue and 2,340 would be exactly right.
Checked: 0.031% vs 20.06%, and controlling for field position,
`senses[0]`-as-only-sense 0.03% vs `senses[0]`-with-followers 45.12%.

**If `sense.number` tokens carried their own leading whitespace**, the
preamble's trailing space would be redundant everywhere and safe to
strip. Checked: 0 of 10,186.

**If the next sense always carried a leading space**, every case would
be a redundant double seam. Checked: only 452 of 2,428; 1,976 depend on
the trailing space alone.

**Not determined:** whether the published PWA renderer would visibly
regress. This branch carries no front-end, so load-bearingness was
verified against the pipeline's join contract and `repairs.ts`, not
against browser rendering. If the renderer emits each sense as its own
block, HTML collapses the space and the *visual* damage is nil — but the
joined intermediate strings the pipeline builds today would still be
corrupted.

## Overlap with other catalogue rows

| Row | Its count | Members also in it | Note |
|---|---|---|---|
| `etymology-head-pseudo-sense` | 1,553 | **1,249** | ~80% of that row also carries the trailing space — same records, described twice |
| `bracketed-gloss-lead-sense` | 49 | **49** | full containment |
| `preamble-stranded-lead-sense` | 676 | 272 | same `senses[0]` preamble population |
| `unmatched-closing-paren` | 1,604 | 260 | |
| `unmatched-opening-paren` | 452 | 45 | |
| `doubled-space-as-text-loss-locator` | 108 | 12 | |
| `trailing-em-dash-tail` | 130 | 8 | that shape with a space after the dash |
| `empty-lead-sense` | 73 | adjacent | the 12 blank-only are `definition == " "` |

In aggregate **1,570 of 2,450 occurrences (64%) are already catalogued
under a lead-sense row.** The distinctive residue this row contributes
on its own is the 10-member terminal subset.

## Escalation to a round-2 row

**`binyan-form-leading-space` (457, round 2) may be the same convention,
not a defect.** "Every non-empty `grammar.binyan_form` item after index 0
begins with a leading space" is the identical field-edge-separator
question in a different field, and under the `rejoin.ts` contract it is
plausibly structural. It has not been tested against the question that
collapsed this row from 2,340 to 10: *does anything consume this as a
separator?*
