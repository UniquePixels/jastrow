# Quarantine

`internal-targets.json`: a hand-maintained, human-reviewed register of
internal cross-reference targets that name an entry the corpus does
not contain.

**Not regenerated.** Nothing in the pipeline writes this file — it is
only ever read, by `admin/pipeline/migrate/cite.ts`, where
`QUARANTINE_PATH` is a default parameter to the reader
(`loadQuarantine`), not an output path. A row must be added by a
person, and each row carries a `reviewed` date once someone has
actually looked at it; gate 6 fails a row that is merely seeded —
present but never reviewed.

The file is currently `[]`. When a row exists, it pairs an unresolved
target with the `rid` it was met in and a note; gate 6 holds this list
and each run's unresolved set to each other in both directions, so a
row is a claim that the pair is known, not a queue the pipeline
drains on its own.

## Rights

Derived from `data/source/` — public domain, see that README.
