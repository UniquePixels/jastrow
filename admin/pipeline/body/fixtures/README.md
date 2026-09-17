# Fixture corpus

Committed, hermetic entry snapshots per edge class, so every body-model
rule test in Tasks 5–9 runs against real source data without reading
`data/source/jastrow-dictionary.jsonl` (32,512 entries, ~41 MB). Each
`*.jsonl` file is one JSON object per line — the entry's original
`SourceEntry` shape, re-serialized deterministically with
`JSON.stringify`.

`extract.ts`, the tool that generated and verified these fixtures, is
archived at `refs/tags/archive/v2-research-2026-09` — there is no
runnable regenerate or `--check` step. Rid lists lived as literal,
reviewed code inside `extract.ts`; nothing was looked up at extraction
time except the source entries themselves. The committed `*.jsonl`
files below are the surviving artifact and stay live, imported
directly by the body-model rule tests.

| File | Entries | Exercises | Design doc |
|---|---|---|---|
| `baseline.jsonl` | 3 | Plain, well-formed entries — the control group every rule should leave untouched (`A00043` does carry one slash-less href, a handled shape `cite.ts` tracks via `hadLeadingSlash`) | §7 (fixture plan) |
| `origin-splits.jsonl` | 4 | Gloss-head fragments split across `language_code`/`language_reference`/sense-1 text (paren split, mid-phrase straddle) that `rejoin.ts` must heal byte-exactly | §3 (import mapping, B2) |
| `lettered.jsonl` | 9 | Lettered `a)…b)…` sub-sense runs the lettered-item split (Task 6) must segment correctly — incl. the Task 15 italic-marker classes (`<i>a</i>)` full-pair, `a</i>)` span-end, `<i>a)` span-start, §6.0 review decision 07) | §7 (lettered-item shapes, ~190) |
| `stems.jsonl` | 3 | Verbal-stem grammar nodes (`binyan_form`/`verbal_stem`) for the grammar-node extractor (Task 5) | §3 (import mapping) |
| `units-hard.jsonl` | 7 | Hard unit-segmentation cases: embedded citations, slash-less hrefs, parenthesized cites, and the three malformed-citation damage sites (`D00478`, `J00597`, `J00603`) that exercise the malformed-hit path | §4 (unit segmentation, B4) |
| `orphans.jsonl` | 27 | The 27 rids carrying the 29 orphan `refs` items (`P00331` carries 3) with no inline citation basis — the disposition set audited in the design doc | §5 (references: derived, not stored, B7) |
| `broken-sequences.jsonl` | 72 | Every entry with a broken top-level sense-number sequence (spurious/missing `N)`), pasted verbatim from `data/source/body-census-report.json` `.brokenSequences[].rid` — quarantined to eyes-on review | §7 (broken sense-number sequences, 72) |
| `label-quarantines.jsonl` | 6 | The sense-label quarantines (`[1)`, `-2)` ×5) Task 16's label-repair pass corrects per the 04 review decisions | §6.0 review (04) |
| `numbering-extras.jsonl` | 4 | Task 16 repair rids not fixtured elsewhere: A01194 (missing `)`), D00072 (in-text implied 1), J00515 (confirmed no-change), U01787 (implied 1 in stem children) | §6.0 review (01) |
| `quotes-stragglers.jsonl` | 8 | `quotes` phrases that don't locate in their own entry body even after abbreviation collapse — reviewed before the field is dropped | §6 (quotes: dropped, B8) |
| `plural.jsonl` | 25 | The design census's coarse `Pl.` detector hits: 5 genuine paren-clear ascending runs that split plus 20 spurious `(citation N)` matches the split rule must reject | §2/§3 (B12) |
| `form-sections.jsonl` | 9 | The B12 extension markers (`Part. pass.`, `Fem.`, `Denom.`, nearest-marker canary D00194) from the 2026-07-14 maintainer print pass | §2/§3 (B12 extension) |

## Sanity guarantees

These properties hold of the committed files because `extract.ts`
enforced them on every run (`--check` or not) before it was archived:

- every requested rid was present in the source (`MISSING: <rid> (class
  <cls>)` and exit 1 otherwise);
- every fixture line JSON-parses and carries a non-empty `.rid`
  (`verifyBody`, threw otherwise);
- output was deterministic — re-running with `--check` against
  unmodified committed files always reported `all fixture files match
  extraction`.

The guarantees are now historical: nothing re-checks them, because the
tool that did is archived at `refs/tags/archive/v2-research-2026-09`.
