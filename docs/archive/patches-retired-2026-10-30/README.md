# Retired patch records (2026-10-30)

`reviewed/patches.jsonl` holds the 2 reviewed patches that left
`admin/pipeline/patch/records/reviewed/patches.jsonl` in PR #202, and
`reviewed/manifest.jsonl` the 2 `repaired` records of
`admin/pipeline/patch/records/reviewed/manifest.jsonl` that named
them. Every line is the original line's bytes, moved.

Both are C1's homograph reforms (PR #200,
[`c1-rereads-2026-10-27`](../../../admin/pipeline/patch/records/tranches/c1-rereads-2026-10-27/README.md)
§ Applied, C), retired under ruling `10-30 one numeral per line`
([`docs/decisions.md`](../../decisions.md) §10). The maintainer, on
2026-10-30: "I have ONLY ever agreed to adding a I when it is
COMPLETELY absent." A numeral print sets anywhere on a headword line,
on an abbreviation or on a variant form, is that line's numeral, and
no patch adds one to another form of a line that already carries one.
Each of these two did exactly that.

| Patch | Rid | What it did | Why it is retired | `manifest.jsonl` |
|---|---|---|---|---|
| P000940 | A02412 `אִסְטְרַטְיָא, אִיסְ׳ I` | `reform` giving form 0 homograph I (`{0} I, {1} I`), annotated `print-error` (`printed: ''`), on the cites of A02560 and O01590 | print sets the line's I after `אִיסְ׳` (91b · leaf 114) | record moved here |
| P000941 | B00049 `בָּב, בָּאב, בָּבָא I` | the same on form 0 (`{0} I, {1}, {2} I`), on the cites of B00051, B00058, M02321 and S01439 | print sets the line's I after `בָּבָא` (136a · leaf 159) | record moved here |

Retiring a reform needs no op: the import's reading of each head line
is the snapshot's, which print confirms (one I, after the later form).
The from-scratch import changes exactly `A/A02412.json` and
`B/B00049.json`, and each comes back byte-identical to its version at
`08936112f`, before PR #200. The names return to `אִסְטְרַטְיָא` and
`בָּב`.

The six C1 cite retargets that aim at these two entries (P000598,
P000678; P000600, P000601, P000640, P000727) stand: a link resolves by
`sefariaHeadword` (ruling `10-09 link key`), which the reforms never
changed. The two X8 reviewed-kept records the reforms had staled
(A02413, B00050: "the family's missing numeral is stored where the
source attaches it") are restored to
`admin/pipeline/report/records/reviewed-kept.jsonl`, byte-exact from
`08936112f`; the import reports them current (92 records, 0 stale).
