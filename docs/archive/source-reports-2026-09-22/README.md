# Orphaned source-directory artifacts (2026-09-22)

Four files that sat in `data/source/` without being source data. The
2026-09-22 module-boundary sweep moved them here so that directory
holds only what `data:import` reads: the Sefaria export, the lexicon
record and the fetch manifest.

**The files themselves are not in git.** All four were `.gitignore`d
where they stood, and they stay ignored here — together they are about
108 MB, and none of them can be regenerated: the tools that wrote them
were archived at `refs/tags/archive/v2-research-2026-09`. This README
is the tracked record of what the directory holds on the maintainer's
disk.

| File | What it was |
|---|---|
| `baseline-audit-report.json` | output of the v1/v2 baseline-audit tool (2026-07-10). Its findings were written up in [`../baseline-audit.md`](../baseline-audit.md) |
| `body-dryrun-report.json` | output of `body/migrate-dry.ts` (2026-08-06), the entry-body dry run. Written up in [`../body-dryrun.md`](../body-dryrun.md) |
| `body-migration-report.json` | the full entry-body migration account (2026-08-31), 11 MB. Written up in [`../body-migration.md`](../body-migration.md) |
| `edit-replay.jsonl` | v1 admin-tool edit history (2026-07-10), 96 MB. No code has ever read it. Kept because it is the only record of the v1 hand edits, and the v2 admin tool may yet want it as a seed (module-boundary spec M12) |

Nothing in `admin/pipeline/` reads any of the four. `paths.ts` names
`edit-replay.jsonl` in one comment, to say why it is not hashed into
the snapshot pin.
