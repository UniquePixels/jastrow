# Pipeline v2

Scripted, re-runnable data pipeline from the true Sefaria source
([design spec](../docs/specs/2026-07-03-v2-overhaul-design.md), Phase 1+).

## Stage 1 — Source acquisition (`fetch.ts`)

```bash
bun admin/pipeline/fetch.ts           # download dump + decode + emit
bun admin/pipeline/fetch.ts --cached  # re-decode from .cache/sefaria (no download)
```

### Channel decision (spec task 1.1)

The canonical channel is **Sefaria's public MongoDB dump**:

`https://storage.googleapis.com/sefaria-mongo-backup/dump_small.tar.gz`

| Channel | Verdict |
|---------|---------|
| MongoDB dump (`lexicon_entry` collection) | **Chosen.** The database Sefaria actually serves, refreshed roughly daily, publicly documented in their [local-install docs](https://developers.sefaria.org/docs/local-installation-instructions) |
| [Sefaria-Export](https://github.com/Sefaria/Sefaria-Export) | Rejected: texts and links only, no lexicon collections |
| [Sefaria-Data](https://github.com/Sefaria/Sefaria-Data) | Rejected: import sources for texts; no Jastrow lexicon source |
| [Words API](https://developers.sefaria.org/reference/get-words) | Rejected: per-word lookup only; a full crawl would need ~30k requests and still reflect the same database the dump snapshots |

The dump is ~2.4 GB compressed (~10+ GB unpacked), so `fetch.ts`
streams it: gunzip + tar parsing happen in memory and only the three
lexicon collections are written to disk (`.cache/sefaria/`, gitignored).
The download is cancelled as soon as all targets are captured.

### One Jastrow lexicon (not two)

Sefaria's code maps a second parent lexicon, `Jastrow Unabbreviated`
(see `LexiconEntrySubClassMapping` in Sefaria-Project
`sefaria/model/lexicon.py`), but the deployed database does not carry
it: the 2026-07-04 dump has no `lexicon` record and zero
`lexicon_entry` docs under that name. Only `Jastrow Dictionary`
(32,512 entries) exists and is emitted.

### Outputs (`data/source/`, committed)

| File | Contents |
|------|----------|
| `jastrow-dictionary.jsonl` | `lexicon_entry` docs with `parent_lexicon: "Jastrow Dictionary"`, verbatim, dump order, relaxed extended JSON |
| `lexicons.json` | The Jastrow lexicon registry record |
| `manifest.json` | Provenance: dump URL, ETag, Last-Modified, fetch time, sha256 + entry count per output |

Documents are emitted **unmodified** — no transformation happens in
this stage, so `data/source/` is a faithful snapshot for the
divergence audit (task 1.2). `word_form.bson` is cached for later use
(search word forms) but not yet emitted.

## Stage 2 — Divergence audit (`audit.ts`)

```bash
bun admin/pipeline/audit.ts   # needs a fetched main (reads data/raw from git)
```

Compares `data/source/jastrow-dictionary.jsonl` against the legacy
extraction (`origin/main:data/raw/jastrow-part{1,2}.jsonl`) using the
unit-tested comparator in `compare-entries.ts`. Writes
`data/source/divergence-report.json`; findings and the resulting v2
rule candidates are in
[docs/v2/divergence-audit.md](../../docs/v2/divergence-audit.md)
(spec task 1.2).

## Stage 3 — Edit mining (`mine.ts`)

```bash
bun admin/pipeline/mine.ts   # needs a fetched main (reads history from git)
```

Walks `origin/main`'s history of the deployed JSONL
(`data/jastrow-part{1,2}.jsonl`) oldest→newest and reconstructs every
manual edit into `data/source/edit-replay.jsonl` (spec task 1.3).
The first commit touching the files is the baseline import, not an
edit, so it is skipped. Each record carries `commit`, ISO `date`, the
entry `id`, `op` (`add` / `remove` / `modify`), and the exact
`before`/`after` JSONL lines, parsed by the unit-tested
`parse-jsonl-diff.ts`.

The output is **not committed** (regenerable on demand — data
architecture spec D2). Its Phase 1 finding: of 22,164 mined edits,
22,057 were scripted transformations and only 107 were hand edits
(page-number fixes), which migration applies directly (spec §6
rule 6).

## Stage 4 — Baseline audit (`baseline-audit.ts`)

```bash
bun admin/pipeline/baseline-audit.ts   # needs a fetched main
```

Mining (stage 3) skips the baseline import commit, assuming the
deployed files entered git unedited. This stage tests that
assumption: it pushes `data/raw` at the baseline commit (`8c10b59`)
through the modeled v1 extraction transform
(`baseline-transform.ts`, unit-tested) and diffs the prediction
against the actual deployed files at the same commit, also verifying
every rewritten link. Writes
`data/source/baseline-audit-report.json` (not committed — D2);
findings in [docs/v2/baseline-audit.md](../../docs/v2/baseline-audit.md).

Its finding: the assumption missed exactly one bounded pre-git fix
session — 182 contiguous entries (C00363–C00544, pages 221–229) with
`column` resolved and 3 page numbers corrected, and no text edits.
Migration rule 6 must therefore source `page`/`column` from the
baseline deployed files, not `data/raw`.
