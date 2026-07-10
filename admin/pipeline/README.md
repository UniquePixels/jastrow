# Data Tools (v2)

Two kinds of tools live in this directory, and the distinction
matters:

1. **The pipeline** — the auditable, reproducible path from the
   Sefaria source to the data the app serves. A new contributor
   should be able to read this section top to bottom and see how
   source data is fetched, transformed, and published, as if
   starting from scratch.
2. **Provenance investigations** — one-time examinations of the v1
   data. Important record, **not part of the pipeline**: their job
   was to prove what the pipeline may rely on and to make sure no
   existing work is lost in the rebuild.

## The pipeline: source → app

| Stage | Tool | Status | Runs |
|---|---|---|---|
| Source acquisition | `fetch.ts` | working | on demand, re-runnable |
| Migration (source → truth) | `migrate.ts` | designed, not built | once, then retires |
| Compile (truth → serving) | `compile.ts` | designed, not built | every deploy |

Migration and compile are specified in the
[data architecture spec](../../docs/specs/2026-07-08-v2-data-architecture-design.md)
(§6): migration transforms the source snapshot into the per-entry
truth layer one time and is then blessed and retired; compile builds
the serving artifacts from truth on every deploy, forever.

### Source acquisition (`fetch.ts`)

```bash
bun admin/pipeline/fetch.ts           # download dump + decode + emit
bun admin/pipeline/fetch.ts --cached  # re-decode from .cache/sefaria (no download)
```

#### Channel decision (spec task 1.1)

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

#### One Jastrow lexicon (not two)

Sefaria's code maps a second parent lexicon, `Jastrow Unabbreviated`
(see `LexiconEntrySubClassMapping` in Sefaria-Project
`sefaria/model/lexicon.py`), but the deployed database does not carry
it: the 2026-07-04 dump has no `lexicon` record and zero
`lexicon_entry` docs under that name. Only `Jastrow Dictionary`
(32,512 entries) exists and is emitted.

#### Outputs (`data/source/`, committed)

| File | Contents |
|------|----------|
| `jastrow-dictionary.jsonl` | `lexicon_entry` docs with `parent_lexicon: "Jastrow Dictionary"`, verbatim, dump order, relaxed extended JSON |
| `lexicons.json` | The Jastrow lexicon registry record |
| `manifest.json` | Provenance: dump URL, ETag, Last-Modified, fetch time, sha256 + entry count per output |

Documents are emitted **unmodified** — no transformation happens in
this stage, so `data/source/` is a faithful snapshot for the
divergence audit. `word_form.bson` is cached for later use
(search word forms) but not yet emitted.

## Provenance investigations (not pipeline)

One-time evidence tools. Each answered a question about the v1 data;
their findings feed the migration rules and the preservation
obligations below, but none of them is a step in the source → app
path. They are kept re-runnable so their reports stay reproducible
(intermediates are not committed — data architecture spec D2).

### Divergence audit (`audit.ts`, spec 1.2)

```bash
bun admin/pipeline/audit.ts   # needs a fetched main (reads data/raw from git)
```

**Question:** did the upstream data drift between the ~2019 extraction
v1 was built from and the fresh 2026 source? Compares
`data/source/jastrow-dictionary.jsonl` against the legacy extraction
(`origin/main:data/raw/jastrow-part{1,2}.jsonl`) using the
unit-tested comparator in `compare-entries.ts`. Writes
`data/source/divergence-report.json`; findings and the resulting v2
rule candidates are in
[docs/v2/divergence-audit.md](../../docs/v2/divergence-audit.md).
**Answer:** 3 headword differences in 32,512 entries; everything else
byte-identical.

### Edit mining (`mine.ts`, spec 1.3)

```bash
bun admin/pipeline/mine.ts   # needs a fetched main (reads history from git)
```

**Question:** what was changed in the deployed data over v1's
lifetime? Walks `origin/main`'s history of the deployed JSONL
(`data/jastrow-part{1,2}.jsonl`) oldest→newest and reconstructs every
edit into `data/source/edit-replay.jsonl` (not committed —
regenerable). The first commit touching the files is the baseline
import, not an edit, so it is skipped. Each record carries `commit`,
ISO `date`, the entry `id`, `op` (`add` / `remove` / `modify`), and
the exact `before`/`after` lines, parsed by the unit-tested
`parse-jsonl-diff.ts`.
**Answer:** 22,164 edits in 4 commits — 22,057 scripted
transformations and 107 hand-made page-number fixes (caf242a).

### Baseline audit (`baseline-audit.ts`)

```bash
bun admin/pipeline/baseline-audit.ts   # needs a fetched main
```

**Question:** did the deployed files enter git already carrying
edits that mining (which skips the baseline import) cannot see?
Pushes `data/raw` at the baseline commit (`8c10b59`) through the
modeled v1 extraction transform (`baseline-transform.ts`,
unit-tested) and diffs the prediction against the actual deployed
files at the same commit, verifying every rewritten link. Writes
`data/source/baseline-audit-report.json` (not committed); findings
in [docs/v2/baseline-audit.md](../../docs/v2/baseline-audit.md).
**Answer:** yes — one bounded pre-git fix session: 182 contiguous
entries (C00363–C00544, pages 221–229) with `column` resolved and 3
page numbers corrected; no text edits.

## Preservation obligations (informed by the investigations)

Work already done in v1 that migration must carry over so it is not
lost. These are one-time preservation tasks, **not pipeline stages**
— the pipeline documents how data is built; this list documents what
accumulated value rides along:

- **289 print-locator corrections** (182 column + 3 page fixes made
  before the first commit, plus 107 page fixes in caf242a): applied
  once during migration by sourcing `page`/`column` from the
  deployed data rather than `data/raw` and replaying the mined hand
  edits (data architecture spec §6 rule 6).
