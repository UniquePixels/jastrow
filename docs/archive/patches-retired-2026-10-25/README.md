# Retired patch records (2026-10-25)

`reviewed/patches.jsonl` holds the 8 reviewed patches that left
`admin/pipeline/patch/records/reviewed/patches.jsonl` in PR #193
(checklist batch 2, review ledger L71, L77, L79), each withdrawn on the
maintainer's scan read of 2026-10-25
([`docs/headword-worklist.md`](../../headword-worklist.md) § Applied
from the maintainer checklist (2026-10-25)). Every line is the original
line's bytes, moved. The tranche README
[`checklist-batch-2-2026-10-25`](../../../admin/pipeline/patch/records/tranches/checklist-batch-2-2026-10-25/README.md)
has the whole batch.

Withdrawing a patch needs no op: each one changed Sefaria's text or
line, so retiring it returns the entry to the snapshot's reading, which
print confirms.

| Patch | Rid | What it did | Why it is wrong | `manifest.jsonl` |
|---|---|---|---|---|
| P000221 | H00871 `חִירָה` | wrapped two bare `Ib.` in links to Exodus 14 | they follow `Mekh. B’shall. s. 1` and cite the Mekhilta (L79); Sefaria leaves that cite unlinked | H00871 names P000220 alone |
| P000760 | U01063 `שֵׁירוּ` | re-aimed `שֵׁירוּתָא II` from U01070 to U01071 | `II, III` name U01070 and U01071: Sefaria's link was right (L77) | U01063 names P000931, which links the `III` to U01071 |
| P000291 | B00443 `בִּזְיוּנָא` II | removed the comma before the numeral | print has the comma | record removed |
| P000292 | C00329 `גַּוָּוזָא` II | the same | print has the comma | record removed |
| P000293 | M00447 `מוֹזְלָא` I | the same | print has the comma | record removed |
| P000294 | A02356 `אִסְטְוָוא` | dropped the trailing comma of `I, II,` (and the doubled space) | the comma is print's, in the bold of the headword line; the gloss begins ` v.`, so it was lost | record removed |
| P000295 | B00407 `בְּזָא` | the same | the same | record removed |
| P000296 | D00844 `דִּלְמָא` | the same | the same | D00844 names P000620 alone |

The doubled space the gloss-comma patches also closed needs no patch:
the parser reads `X  I, II,` as `{0} I, II,`.

## Tranche-01's P000027 (PR #n)

`tranches/tranche-01/patches.jsonl` holds P000027, A00675's agent
`split` at `1)`, and `tranches/tranche-01/manifest.jsonl` the
`repaired` record that named it; both are the original lines' bytes,
moved. Its `expected_before` is the old `26 1)` text, which PR #193's
P000194 no longer makes, so the import absorbed it (`superseded`). The
reviewed split P000935 takes its place, now that a split's marker
never follows a digit (review ledger L81,
[`l81-2026-10-25`](../../../admin/pipeline/patch/records/tranches/l81-2026-10-25/README.md)).
