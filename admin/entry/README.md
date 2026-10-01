# The Entry Contract

What a file under `data/entries/` must be, however it got there: the
import's write, the admin tool's save, or a hand edit. The import
([the pipeline](../pipeline/README.md)) is one caller; CI is
another; the admin tool, when it is written, is the third. So the
contract is its own module, and it depends on nothing in the
pipeline (ruling `09-30 entry contract`,
[`docs/decisions.md`](../../docs/decisions.md)).

| File | What it holds |
|---|---|
| `types.ts` | the entry shapes (`TruthEntry` and its parts), `SCHEMA_VERSION`, `VERBATIM_FIELDS` |
| `validate.ts` | the validator: `validateEntry`, `validateCorpus`, and `validateTruth` over a loaded tree |
| `validate-cli.ts` | `bun data:validate` |
| `headwords.ts`, `headword-rules.ts` | the headword-line parser and the six shape rules |
| `names.ts` | an entry's name, derived from `headwords[0]`, and name collisions |
| `page.ts` | the page-index loader |
| `html.ts` | the tokenizer every markup field is read with — the transforms' too |
| `paths.ts` | the three paths the contract reads; the pipeline's `paths.ts` re-exports them |

The schema itself is `data/schema/entry.schema.json`, read at run
time so a reader that is not TypeScript can hold a file to it too.

### What it checks

Per file (`validateEntry`): the schema; the file sits at
`<first letter>/<id>.json`; the six headword shape rules; markup in
the closed vocabulary and balanced per field; no markup in a plain
identifier field; every stored string in NFC, except
`sefariaHeadword`, which keeps Sefaria's bytes.

Across the tree (`validateCorpus`): names and `sefariaHeadword` are
unique in NFC; every rid-shaped cite names an entry that exists; and
each entry's page is its page-index row, both ways.

It checks an entry against itself, the tree and the page index —
never against the source. What only the source can answer is the
import's other gates; see the pipeline's
[`DESIGN.md`](../pipeline/DESIGN.md) §9.

### Running it

```bash
bun data:validate                             # the whole tree: CI's Validate job
bun data:validate data/entries/A/A00001.json  # named files, their own checks only
```

Every problem prints on its own line, and any problem exits non-zero.
The import runs the same checks as its gate 10, `contract`, over the
entries it is about to write, so it cannot write a tree this job
refuses.
