# Entry Body Model

The toolkit that turns each source entry's free-text `content.senses`
into the structured `BodyEntry` shape the app renders, per the
[design doc](../../../docs/specs/2026-07-11-entry-body-model-design.md)
and its [implementation plan](../../../docs/superpowers/plans/2026-07-11-entry-body-model.md).
Not part of [the pipeline](../README.md) proper — this is prep work
feeding Stage 2 (migration).

| Tool | Job | Status |
|---|---|---|
| `types.ts` | Shared upstream (`Source*`) and target (`Body*`) type vocabulary | done |
| `source.ts` | Streaming reader for `data/source/jastrow-dictionary.jsonl` | done |
| `cite.ts` | Citation detector | planned |
| `census.ts` | Corpus-wide census of sense shapes/markup, to size later rules | planned |
| `rejoin.ts` | Rejoin split/lettered sense fragments | planned |
| `grammar.ts` | Grammar-node extraction (gender, number, stem) | planned |
| `labels.ts` | Sense label (`number`) parsing | planned |
| `lettered.ts` | Lettered sub-sense handling | planned |
| `units.ts` | Body unit builder (gloss + citation units) | planned |
| `fixtures/` | Shared golden fixtures for the above | planned |
| `dry-run.ts` | Full-corpus dry run report before migration commits | planned |
| `review.ts` | Human review harness over dry-run output | planned |

## Source reader (`source.ts`, `types.ts`)

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
overridable for tests/fixtures.

`SourceEntry`/`SourceSense` model every upstream field the body-model
plan touches: `morphology`, `plural_form`, `language_code`,
`language_reference`, `alt_headwords`, `quotes`, `refs`, and recursive
senses with `number`/`grammar`. `BodySense`/`BodyStem`/`BodyEntry` are
the target shapes later modules build. See
`admin/pipeline/provenance/baseline-transform.ts` for the sibling model
of the deployed v1 shape these upstream fields fed.
