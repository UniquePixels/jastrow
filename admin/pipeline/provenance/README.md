# Provenance Investigations

One-time examinations of the v1 data. Important record, **not part
of [the pipeline](../README.md)**: each tool answered a question the
rebuild needed answered — proving what the pipeline may rely on and
making sure no existing work is lost. They stay re-runnable so their
reports remain reproducible; the reports themselves are regenerable
intermediates and are not committed (data architecture spec D2).

| Tool | Question | Answer |
|---|---|---|
| `audit.ts` | Did upstream drift between the ~2019 extraction and the fresh 2026 source? | 3 headword diffs in 32,512 entries; everything else byte-identical |
| `mine.ts` | What changed in the deployed data over v1's git lifetime? | 22,164 edits in 4 commits: 22,057 scripted, 107 hand page fixes |
| `baseline-audit.ts` | Did the deployed files enter git already edited? | Yes — one bounded fix session: 182 column + 3 page fixes, no text edits |

## Divergence audit (`audit.ts`, spec 1.2)

```bash
bun provenance:audit   # needs a fetched main (reads data/raw from git)
```

Compares `data/source/jastrow-dictionary.jsonl` against the legacy
extraction (`origin/main:data/raw/jastrow-part{1,2}.jsonl`) using the
unit-tested comparator in `compare-entries.ts`. Writes
`data/source/divergence-report.json`; findings and the resulting v2
rule candidates are in
[docs/v2/divergence-audit.md](../../../docs/v2/divergence-audit.md).

## Edit mining (`mine.ts`, spec 1.3)

```bash
bun provenance:mine   # needs a fetched main (reads history from git)
```

Walks `origin/main`'s history of the deployed JSONL
(`data/jastrow-part{1,2}.jsonl`) oldest→newest and reconstructs every
edit into `data/source/edit-replay.jsonl` (not committed). The first
commit touching the files is the baseline import, not an edit, so it
is skipped. Each record carries `commit`, ISO `date`, the entry `id`,
`op` (`add` / `remove` / `modify`), and the exact `before`/`after`
lines, parsed by the unit-tested `parse-jsonl-diff.ts`.

## Baseline audit (`baseline-audit.ts`)

```bash
bun provenance:baseline   # needs a fetched main
```

Mining skips the baseline import commit, assuming the deployed files
entered git unedited. This tool tests that assumption: it pushes
`data/raw` at the baseline commit (`8c10b59`) through the modeled v1
extraction transform (`baseline-transform.ts`, unit-tested) and diffs
the prediction against the actual deployed files at the same commit,
also verifying every rewritten link. Writes
`data/source/baseline-audit-report.json`; findings in
[docs/v2/baseline-audit.md](../../../docs/v2/baseline-audit.md).

## Preservation obligations

Work already done in v1 that migration must carry over so it is not
lost. These are one-time preservation tasks, not pipeline stages —
the pipeline documents how data is built; this list documents what
accumulated value rides along:

- **289 print-locator corrections** (182 column + 3 page fixes made
  before the first commit, plus 107 page fixes in caf242a): applied
  once during migration by sourcing `page`/`column` from the deployed
  data rather than `data/raw` and replaying the mined hand edits
  (data architecture spec §6 rule 6).
