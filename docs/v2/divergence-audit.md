# Divergence Audit — Fresh Source vs Legacy Extraction (spec 1.2)

Compares the fresh Sefaria source (`data/source/jastrow-dictionary.jsonl`,
dump of 2026-07-04, 32,512 entries) against the legacy extraction the v1
app was built from (`data/raw/jastrow-part{1,2}.jsonl` on `main`,
committed 2026-03-30 from a ~2019 Sefaria database, per the entries'
ObjectId timestamps). Produced by `bun admin/pipeline/audit.ts`; machine
output in `data/source/divergence-report.json`.

## Headline

| Measure | Count |
|---|---|
| Entries in fresh | 32,512 |
| Entries in legacy raw | 32,512 |
| rids only in fresh | 0 |
| rids only in legacy raw | 0 |
| Entries with real content differences | **3** (all `headword`) |
| Entries with legacy-added `page`/`column` fields | 32,512 (all) |

Every rid matches one-to-one. Definitions, senses, refs, quotes,
alt-headwords, and prev/next chains are byte-identical across all
32,512 entries. The forgotten extraction made no silent *edits* — its
one systematic change is an *enrichment* (below).

## Finding 1 — `page`/`column` are a local enrichment (v2 rule needed)

Every legacy entry carries `page` (1–1704) and `column` (`a`/`b`/`?`)
fields. These are **not** upstream data: Sefaria's lexicon model
(`sefaria/model/lexicon.py`, `LexiconEntry`/`JastrowDictionaryEntry`)
defines no such attributes, so they cannot have come from the dump.
They were computed by the forgotten extraction, and the v1 app ships
them (`p`, `col` in the deployed JSONL).

Quality of the enrichment:

| `column` value | Entries |
|---|---|
| `?` (unresolved) | 27,293 (84%) |
| `a` | 2,649 |
| `b` | 2,570 |

**v2 rule candidate R1:** print-locator enrichment must become a
deliberate, documented pipeline stage. `page` appears complete and is
worth carrying (source it from `data/raw` on `main` or recompute);
`column` is 84% unresolved and should be either recomputed properly or
dropped from the v2 schema.

## Finding 2 — three headwords drifted upstream (ד → ך)

| rid | Legacy (2019 dump) | Fresh (2026 dump) |
|---|---|---|
| P00855 | עָמַד I | עָמַך I |
| P00856 | עָמַד II | עָמַך II |
| P00860 | עֶמֶד | עֶמֶך |

This is upstream Sefaria drift, not an extraction fix: even in the
legacy data, the neighbouring entries' `next_hw`/`prev_hw` chain
already used the ך spellings, so upstream later aligned the headwords
to the chain. Which reading matches the 1903 print (p. 1086) is not
settled here — P00855's definition (`= אָמַד, to estimate`)
cross-references the ד root, which makes the ך spelling suspect.

**Open question for CP-1:** verify these three headwords against the
printed page 1086 scan; if the print reads ד, the v2 pipeline needs a
correction rule (and ideally an upstream report to Sefaria).

## Method notes

- Comparator: `admin/pipeline/compare-entries.ts` (unit-tested;
  named-field diffs plus an independent remainder check so a headword
  change cannot mask other drift).
- A full per-field census (key-order-insensitive) runs before
  comparison; `page`/`column` are then stripped from the legacy side so
  `changed` reflects content drift, not the known enrichment. The
  census is included in the report JSON — no other field shows any
  presence or value difference.
- `data/raw` no longer exists on `v2` (removed with the v1 app), so the
  driver reads it from `origin/main` via `git show`; re-running needs a
  fetched `main`.

## Conclusion (input to CP-1)

The forgotten extraction changed almost nothing: no dropped or added
entries, no content edits, one enrichment stage (R1) to re-implement
deliberately, and three upstream headword changes to adjudicate. The
fresh-source restart carries essentially no hidden-divergence cost.
