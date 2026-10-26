# Implied I under ruling 10-13 (2026-10-14)

Data PR (i) of [`docs/archive/correction-audit.md`](../../../../../../docs/archive/correction-audit.md)
§7, PR #174. It settles the 14 implied Is that PR #155 set (P000342–P000355,
[`../headword-print-read-2026-10-06/`](../headword-print-read-2026-10-06/README.md))
against the amended ruling, retargets the 10 cross-references that
prove five of them, and retires `implied` from the contract.

## The ruling

Ruling `10-13 correction policy` ([`docs/decisions.md`](../../../../../../docs/decisions.md)
§9, [`admin/entry/ANNOTATIONS.md`](../../../../../entry/ANNOTATIONS.md))
amends `10-06 implied I`. An I print does not set is a print error
whose intended value is determined (case 2) only where Jastrow's own
text names `X I`: a cross-reference, a `v. X I`, an etymology `(X I)`.
A bare candidate's place before the II proves nothing, however alone
it stands (amended by the maintainer, 2026-10-14). A proven I is
displayed, not hidden, and annotated `print-error` with the cites as
evidence; an unproven one is withdrawn, its form bare and its row on
the reviewed-kept list. Where Sefaria's linker aimed a cite that reads
`X I` at the II, the target is Sefaria's error and the text is
Jastrow's, so the retarget is case 1: corrected silently, the patch
`rationale` the only trace.

Print sets no numeral beside any of the 14: the maintainer read every
one on 2026-10-06 ("no numeral beside it"). The audit
([`correction-audit.md`](../../../../../../docs/archive/correction-audit.md)
§1) collected every `<cite>` whose text is a form's consonants followed
by `I`, whatever its link target, and every plain-text `<he>X</he> I`.

## Where the patches are

In [`../../reviewed/patches.jsonl`](../../reviewed/patches.jsonl), with
[`../../reviewed/manifest.jsonl`](../../reviewed/manifest.jsonl), as for
every tranche of a person's patches; this directory holds only this
README.

- **5 amended in place** (P000343, P000344, P000348, P000353,
  P000355). Each reform keeps its id, target and `expected_before`:
  `homographs` loses `implied` (`[{form: 0, homograph: 1}]`), the
  payload gains the `display` that shows the I, the record gains an
  `annotation` (`kind: 'print-error'`, `printed: ''`, the cites and
  the print read as `evidence`, `date: '2026-10-14'`), and the
  `rationale` keeps its 2026-10-06 text with the amendment appended.
  In place, so the annotation's `source` is the patch that already
  sets the numeral and the rid keeps one patch per target, as the
  audit prescribes. (No earlier reviewed record had been edited in
  place; the only lines ever removed from `patches.jsonl` were PR
  #160's retirements.)
- **9 retired** (P000342, P000345–P000347, P000349–P000352,
  P000354): their bytes moved to
  [`docs/archive/patches-retired-2026-10-14/`](../../../../../../docs/archive/patches-retired-2026-10-14/README.md),
  and their `manifest.jsonl` records removed. No op is needed to remove
  the numeral: it was ours, so retiring the reform returns the form to
  the snapshot's line. 9 records on the II rids join
  [`admin/pipeline/report/records/reviewed-kept.jsonl`](../../../../report/records/reviewed-kept.jsonl)
  (shape `X10 first homograph unnumbered: implied I candidate`).
- **10 new** `replace` patches, P000544–P000553, `defect_class`
  `cross-reference-target`, `prompt_version` `implied-i-2026-10-14`,
  one `repaired` manifest record per citing rid. None of the 10 rids
  had a reviewed patch before; A00882 has an agent `clean` record with
  no patch, which nothing here supersedes.

## The 14

| rid | headword | before → after name | disposition | evidence | scan |
|---|---|---|---|---|---|
| A00311 | `אַגְמָא` | `אַגְמָא I` → `אַגְמָא` | withdrawn: P000342 retired, reviewed-kept on A00312 | no cite names `אַגְמָא I`; print read: no numeral beside it | [13a · leaf 36](https://iiif.archive.org/iiif/dictionaryoftarg01jastuoft$37/full/1400,/0/default.jpg) |
| A00889 | `אוֹרְיָין, אוֹרְיָאן` | `אוֹרְיָין I` (unchanged) | case 2: P000343 amended; display `{0}, {1}` → `{0} I, {1}`, annotated | A00882 `, v. אוֹרְיָין I`; M01329 `Ar. (v. אוֹרְיָין I)` | [34b · leaf 57](https://iiif.archive.org/iiif/dictionaryoftarg01jastuoft$58/full/1400,/0/default.jpg) |
| A02041 | `אֲמָנָה` | `אֲמָנָה I` (unchanged) | case 2: P000344 amended; display `{0}` → `{0} I`, annotated | H01410 `מח׳ אמנה, v. אֲמָנָה I` | [77b · leaf 100](https://iiif.archive.org/iiif/dictionaryoftarg01jastuoft$101/full/1400,/0/default.jpg) |
| B00537 | `בִּיָּא, …, (בִּיאָה)` | `בִּיָּא` (unchanged: the I was on the alternate) | withdrawn: P000345 retired, reviewed-kept on B00538 | no cite names `בִּיאָה I`; print read: no numeral beside it | [158b · leaf 181](https://iiif.archive.org/iiif/dictionaryoftarg01jastuoft$182/full/1400,/0/default.jpg) |
| B00935 | `בַּנַּאי` | `בַּנַּאי I` → `בַּנַּאי` | withdrawn: P000346 retired, reviewed-kept on B00936 | no cite names `בַּנַּאי I`; print read: no numeral beside it | [176b · leaf 199](https://iiif.archive.org/iiif/dictionaryoftarg01jastuoft$200/full/1400,/0/default.jpg) |
| C00176 | `גְּדוּדִית` | `גְּדוּדִית I` → `גְּדוּדִית` | withdrawn: P000347 retired, reviewed-kept on C00177 | no cite names `גְּדוּדִית I`; print read: no numeral beside it | [210b · leaf 233](https://iiif.archive.org/iiif/dictionaryoftarg01jastuoft$234/full/1400,/0/default.jpg) |
| D00442 | `דִּי` | `דִּי I` (unchanged) | case 2: P000348 amended; display `{0}` → `{0} I`, annotated | D00595 `v. דִּי I` | [293b · leaf 316](https://iiif.archive.org/iiif/dictionaryoftarg01jastuoft$317/full/1400,/0/default.jpg) |
| H00432 | `חוּצָה` | `חוּצָה I` → `חוּצָה` | withdrawn: P000349 retired, reviewed-kept on H00433 | no cite names `חוּצָה I`; print read: no numeral beside it | [438a · leaf 461](https://iiif.archive.org/iiif/dictionaryoftarg01jastuoft$462/full/1400,/0/default.jpg) |
| H01290 | `חַנִּין` | `חַנִּין I` → `חַנִּין` | withdrawn: P000350 retired, reviewed-kept on H01291 | no cite names `חַנִּין I`; print read: no numeral beside it | [483a · leaf 506](https://iiif.archive.org/iiif/dictionaryoftarg01jastuoft$507/full/1400,/0/default.jpg) |
| J00112 | `יָהּ` | `יָהּ I` → `יָהּ` | withdrawn: P000351 retired, reviewed-kept on J00113 | no cite names `יָהּ I`; print read: no numeral beside it | [565b · leaf 588](https://iiif.archive.org/iiif/dictionaryoftarg01jastuoft$589/full/1400,/0/default.jpg) |
| O00994 | `סְלִיקוּסְתָּא` | `סְלִיקוּסְתָּא I` → `סְלִיקוּסְתָּא` | withdrawn: P000352 retired, reviewed-kept on O00995 | no cite names `סְלִיקוּסְתָּא I`; print read: no numeral beside it | [995a · leaf 318](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$319/full/1400,/0/default.jpg) |
| Q00964 | `פְּלוּגְתָּא, פְּלֻגְ׳` | `פְּלוּגְתָּא I` (unchanged) | case 2: P000353 amended; display `{0}, {1}` → `{0} I, {1}`, annotated | Q00942 `ed. Wil., v. פְּלוּגְתָּא I` (hOCR `I`); V00833 `= פְּלוּגְתָּא I, difference of opinion` (hOCR `I`) | [1177a · leaf 500](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$501/full/1400,/0/default.jpg) |
| Q01398 | `פַּפָּא` | `פַּפָּא I` → `פַּפָּא` | withdrawn: P000354 retired, reviewed-kept on Q01399 | no cite names `פַּפָּא I`; print read: no numeral beside it | [1203b · leaf 526](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$527/full/1400,/0/default.jpg) |
| S00336 | `קוּלְיָא, קוֹ׳` | `קוּלְיָא I` (unchanged) | case 2: P000355 amended; display `{0}, {1}` → `{0} I, {1}`, annotated | S00961 `, v. קוּלְיָא I`; S01262 `, v. קוּלְיָא I`; S01321 `pl.).—V. קוּלְיָא I` (hOCR `i.`); S01360 `misreading for קלווא, v. קוּלְיָא I` (hOCR `I`) | [1328a · leaf 651](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$652/full/1400,/0/default.jpg) |

Eight names lose their I. B00537's does not: its name is its primary
`בִּיָּא`, and the I was on its fifth form. Before go-live a rename
costs nothing (U6).

## The 10 retargets

Each is a `replace` of the source anchor in the citing sense, as P000306
re-aimed B00097's anchor: `find` is the anchor naming `X II`, `replace`
the same anchor naming the I's link key (ruling `10-09 link key`: the
snapshot's line as the transforms leave it, here the I's bare
`sefariaHeadword`), so gate 6 resolves it to the I. The anchor occurs
once in its definition in all ten. The visible text, `<he>X</he> I`,
is unchanged; only the `ref` moves. None of the ten sits in
`language_reference`, so none waits on L50.

| patch | citing rid | target | `ref` before → after |
|---|---|---|---|
| P000544 | A00882 | `sense[]:91af6848` | A00890 → A00889 |
| P000545 | M01329 | `sense[]:45014b6c` | A00890 → A00889 |
| P000546 | H01410 | `sense[]:513f5875` | A02042 → A02041 |
| P000547 | D00595 | `sense[]:d68dc1f2` | D00443 → D00442 |
| P000548 | Q00942 | `sense[—4)]:7f61f1b1` | Q00965 → Q00964 |
| P000549 | V00833 | `sense[]:5b5f0697` | Q00965 → Q00964 |
| P000550 | S00961 | `sense[]:b91d442f` | S00337 → S00336 |
| P000551 | S01262 | `sense[]:b91d442f` | S00337 → S00336 |
| P000552 | S01321 | `sense[]:5ee21c3f` | S00337 → S00336 |
| P000553 | S01360 | `sense[]:eb3dff51` | S00337 → S00336 |

## The contract change

In the same PR `implied` leaves the contract (ANNOTATIONS.md §2):
`FormObject.implied` and its `dependentRequired` go from
`admin/entry/types.ts`, `data/schema/entry.schema.json` and the parity
test; rule 3 (`admin/entry/headword-rules.ts`) reads a single numeral
beside `{n}` iff the form has a `homograph`; `reform.homographs`
(`admin/pipeline/patch/schema.ts`) refuses an `implied` key rather than
reading it as a plain numeral; gate 2 (`lineNotation`) counts every
patch-set numeral as notation. The headword report's X10 still names
the bare candidate; its note now says an I is set only where Jastrow's
text names `X I`.

## What the re-import shows

`rm -rf data/entries/[A-Z] && bun data:import && bun qa:format`
changed exactly 24 entry files: the 5, the 9 and the 10 citing
entries (none coincide). Every gate is green, and the blessing reads
`Annotations: 5 written (5 print-error, 0 kept, 0 illegible)`. For
each entry, checked by script against the tree before:

- the 5: `headwords[0]` is `homograph: 1` with no `implied`, `display`
  shows the ` I`, and the form carries exactly one annotation,
  `{field: 'homograph', stored: 'I', source: <its patch>}`; with
  `display`, `implied` and the annotation masked, the entry is
  unchanged;
- the 9: no form carries `homograph` or `implied`, `display` is as it
  was (no numeral), the reviewed-kept record is present and the
  report lists the II's X10 row as kept; with the numeral masked, the
  entry is unchanged;
- the 10: the one `<cite ref>` moved from the II to the I, and the
  file is otherwise byte-identical, visible text included.

The headword report reads X10 17 (12 primary), reviewed-kept 43 (34
before), 0 stale records.
