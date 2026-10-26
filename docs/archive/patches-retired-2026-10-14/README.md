# Retired patch records (2026-10-14)

`reviewed/patches.jsonl` holds the 9 reviewed `reform` patches that
left `admin/pipeline/patch/records/reviewed/patches.jsonl` in PR #174,
and D00072's `replace` P000214, which left in PR #175 (below)
(data PR (i) of [`docs/archive/correction-audit.md`](../correction-audit.md)
§7). Every line is the original line's bytes, moved. Each of the
nine rids' `manifest.jsonl` record in `reviewed/` was removed with it:
it named only this patch.

Each one set an implied I (`homograph: 1, implied: true`) on the bare
first form of a homograph sequence whose next entry print numbers II.
They were written from the maintainer's print read of 2026-10-06
("no numeral beside it") under ruling `10-06 implied I`, which let a
form's place before the II stand as the proof.

Ruling `10-13 correction policy` amended 10-06: an implied I is set
only where Jastrow's own text names `X I` (a cross-reference, a
`v. X I`, an etymology `(X I)`), and a sole bare candidate before the
II is no proof, however alone it stands (amended by the maintainer,
2026-10-14). The audit found no cite and no plain-text `X I` naming
any of these nine forms (`docs/correction-audit.md` §1). Removing the
numeral needs no op: it was ours, set by the reform, so retiring the
reform returns the form to the snapshot's line, bare. The X10 row the
headword report then prints for each II is answered by a
reviewed-kept record (`admin/pipeline/report/records/reviewed-kept.jsonl`,
ruling 10-06 reviewed kept).

`implied` itself left the contract in the same PR. The five reforms of
the same tranche whose I Jastrow's text does name (P000343, P000344,
P000348, P000353, P000355) stay, amended in place: see
[`admin/pipeline/patch/records/tranches/implied-i-2026-10-14/README.md`](../../../admin/pipeline/patch/records/tranches/implied-i-2026-10-14/README.md).

| Patch | Rid | Form | Name before → after | Reviewed-kept on |
|---|---|---|---|---|
| P000342 | A00311 | `אַגְמָא` | `אַגְמָא I` → `אַגְמָא` | A00312 |
| P000345 | B00537 | alternate `בִּיאָה` (`headwords[4]`) | `בִּיָּא` (unchanged: the name is the primary's) | B00538 |
| P000346 | B00935 | `בַּנַּאי` | `בַּנַּאי I` → `בַּנַּאי` | B00936 |
| P000347 | C00176 | `גְּדוּדִית` | `גְּדוּדִית I` → `גְּדוּדִית` | C00177 |
| P000349 | H00432 | `חוּצָה` | `חוּצָה I` → `חוּצָה` | H00433 |
| P000350 | H01290 | `חַנִּין` | `חַנִּין I` → `חַנִּין` | H01291 |
| P000351 | J00112 | `יָהּ` | `יָהּ I` → `יָהּ` | J00113 |
| P000352 | O00994 | `סְלִיקוּסְתָּא` | `סְלִיקוּסְתָּא I` → `סְלִיקוּסְתָּא` | O00995 |
| P000354 | Q01398 | `פַּפָּא` | `פַּפָּא I` → `פַּפָּא` | Q01399 |

## P000214 (PR #175)

A tenth line followed in PR #175 (data PR (ii) of
[`docs/archive/correction-audit.md`](../correction-audit.md) §7): P000214,
the reviewed `replace` on D00072 that wrote the implied `1)` into the
gloss (`.) <i>` → `.) 1) <i>`; review doc 01, `repairs.ts`
`IMPLIED_ONE_TEXT`). Its bytes are moved unchanged. D00072's
`manifest.jsonl` record in `reviewed/` was not removed but rewritten:
it now names the pair that replaces it.

The `1)` it wrote stayed text: the entry's Kal sense was unlabelled and
its `—2)` run sat inside a unit. Ruling `10-13 correction policy` makes
an implied `1)` case 2, annotated on the sense's label, and an
annotation on a `replace` describes a gloss or unit substring, not a
label. The source segment allows a `retag`, so P000554 numbers the
first source sense `1)` with the annotation and P000555 splits the
`—2)` out: Kal reads `1 2`, as print divides it. See
[`admin/pipeline/patch/records/tranches/rp8-marks-2026-10-14/README.md`](../../../admin/pipeline/patch/records/tranches/rp8-marks-2026-10-14/README.md).

| Patch | Rid | What it did | Replaced by |
|---|---|---|---|
| P000214 | D00072 | `replace` `.) <i>` → `.) 1) <i>` in the Kal definition | P000554 `retag` `1)` (annotated), P000555 `split` `—2)` |
