# Entry Body Model

The toolkit that turns each source entry's free-text `content.senses`
into the structured `BodyEntry` shape the app renders, per
[`DESIGN.md`](../DESIGN.md) §2 — the current design, which replaced the
original
[design doc](../../../docs/archive/specs/2026-07-11-entry-body-model-design.md)
and its
[implementation plan](../../../docs/archive/plans/2026-07-11-entry-body-model.md),
both kept archived as historical record.
Not part of [the pipeline](../README.md) proper — this is prep work
feeding Stage 2 (import).

| Tool | Job | Status |
|---|---|---|
| `source.ts` | Streaming reader for `data/source/jastrow-dictionary.jsonl` | done |
| `cite.ts` | Citation detector | done |
| `census.ts` | Corpus-wide census of sense shapes/markup, to size later rules | archived at `refs/tags/archive/v2-research-2026-09` |
| `rejoin.ts` | Rejoin split/lettered sense fragments | done |
| `grammar.ts` | Grammar-node extraction (gender, number, stem) | done |
| `labels.ts` | Sense label (`number`) parsing | done |
| `lettered.ts` | Lettered sub-sense handling | done |
| `units.ts` | Body unit builder (gloss + citation units) | done |
| `form-sections.ts` | Form-section split (B12: `Pl.`/`Part. pass.`/`Fem.`/`Denom.`) | done |
| `fixtures/` | Shared golden fixtures for the above | done |
| `trace.ts` | The §6.0 body composition `migrate.ts` imports (`buildTrace`, `buildBody`) | done |
| `round-trip.ts` | Round-trip verifier for the migrate gate | done |
| `dry-run.ts`, `dry-run-verify.ts`, `dry-run-report.ts` | Full-corpus dry run report before import commits | split: the library halves are `trace.ts` and `round-trip.ts`; the CLI is archived at `refs/tags/archive/v2-research-2026-09` |
| `review.ts` | Eyes-on review docs over dry-run output (`docs/archive/body-review/`) | archived at `refs/tags/archive/v2-research-2026-09` |
| `repairs.ts` | General, corpus-wide import repairs (Task 16); the rid-keyed tables moved to reviewed patches in `admin/pipeline/patch/records/reviewed/` (consolidation step 8, spec §4.1) | done |
| `../types.ts` | Shared upstream (`Source*`) and target (`Body*`) type vocabulary. **Moved to the pipeline root 2026-09-22**: every stage imports it, so it was never body-specific |
| `../compose.ts` | One entry through text-repairs → structural-repairs → patch-apply; used by `migrate.ts`. **Moved to the pipeline root 2026-09-22** for the same reason |
| `migrate-dry.ts` | Repairs + composition + gates over the healed snapshot, import report | archived at `refs/tags/archive/v2-research-2026-09` |

## Source reader (`source.ts`, `../types.ts`)

```ts
import { readSourceEntries } from './source.ts';

for await (const entry of readSourceEntries()) {
	// entry: SourceEntry
}
```

Streams `data/source/jastrow-dictionary.jsonl` (32,512 entries, ~41 MB)
line by line — chunks are decoded and split on `\n` as they arrive, so
the file is never held in memory whole. `parseSourceEntry()` parses a
single JSONL line; `readSourceEntries(path?)` is the generator, path
overridable for tests/fixtures. `linesOf(chunks)` is the underlying
chunk-safe line splitter (exported for direct testing).

`SourceEntry`/`SourceSense` model every upstream field the body-model
plan touches: `morphology`, `plural_form`, `language_code`,
`language_reference`, `alt_headwords`, `quotes`, `refs`, and recursive
senses with `number`/`grammar`. `BodySense`/`BodyStem`/`BodyEntry` are
the target shapes later modules build. See
`admin/pipeline/provenance/baseline-transform.ts`, archived at
`refs/tags/archive/v2-research-2026-09`, for the sibling model of the
deployed v1 shape these upstream fields fed.
