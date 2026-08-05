# Fixture corpus

Committed, hermetic entry snapshots per edge class, so every body-model
rule test in Tasks 5–9 runs against real source data without reading
`data/source/jastrow-dictionary.jsonl` (32,512 entries, ~41 MB). Each
`*.jsonl` file is one JSON object per line — the entry's original
`SourceEntry` shape, re-serialized deterministically with
`JSON.stringify`.

Regenerate with `bun admin/pipeline/body/fixtures/extract.ts`. Rid
lists live as literal, reviewed code inside `extract.ts` — nothing is
looked up at extraction time except the source entries themselves.
Verify the committed files still match extraction with
`bun admin/pipeline/body/fixtures/extract.ts --check`.

| File | Entries | Exercises | Design doc |
|---|---|---|---|
| `baseline.jsonl` | 3 | Plain, well-formed entries with no edge-case markup — the control group every rule should leave untouched | §7 (fixture plan) |
| `origin-splits.jsonl` | 4 | Gloss-head fragments split across `language_code`/`language_reference`/sense-1 text (paren split, mid-phrase straddle) that `rejoin.ts` must heal byte-exactly | §3 (import mapping, B2) |
| `lettered.jsonl` | 9 | Lettered `a)…b)…` sub-sense runs the lettered-item split (Task 6) must segment correctly — incl. the Task 15 italic-marker classes (`<i>a</i>)` full-pair, `a</i>)` span-end, `<i>a)` span-start, §6.0 review decision 07) | §7 (lettered-item shapes, ~190) |
| `stems.jsonl` | 3 | Verbal-stem grammar nodes (`binyan_form`/`verbal_stem`) for the grammar-node extractor (Task 5) | §3 (import mapping) |
| `units-hard.jsonl` | 7 | Hard unit-segmentation cases: embedded citations, slash-less hrefs, parenthesized cites, and the three malformed-citation damage sites (`D00478`, `J00597`, `J00603`) that exercise the malformed-hit path | §4 (unit segmentation, B4) |
| `orphans.jsonl` | 27 | The 27 rids carrying the 29 orphan `refs` items (`P00331` carries 3) with no inline citation basis — the disposition set audited in the design doc | §5 (references: derived, not stored, B7) |
| `broken-sequences.jsonl` | 72 | Every entry with a broken top-level sense-number sequence (spurious/missing `N)`), pasted verbatim from `data/source/body-census-report.json` `.brokenSequences[].rid` — quarantined to eyes-on review | §7 (broken sense-number sequences, 72) |
| `quotes-stragglers.jsonl` | 8 | `quotes` phrases that don't locate in their own entry body even after abbreviation collapse — reviewed before the field is dropped | §6 (quotes: dropped, B8) |

## Sanity guarantees

`extract.ts` enforces, on every run (`--check` or not):

- every requested rid is present in the source (`MISSING: <rid> (class
  <cls>)` and exit 1 otherwise);
- every fixture line JSON-parses and carries a non-empty `.rid`
  (`verifyBody`, throws otherwise);
- output is deterministic — re-running with `--check` against
  unmodified committed files always reports `all fixture files match
  extraction`.
