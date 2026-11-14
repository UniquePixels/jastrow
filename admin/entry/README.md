# The Entry Contract

What a file under `data/entries/` must be, however it got there: the
import's write, the admin tool's save, or a hand edit. The import
([the pipeline](../pipeline/README.md)) is one caller; CI is
another; the admin tool (`admin/ui/`, ruling `11-06 admin layout`),
when it is written, is the third. So the
contract is its own module, and it depends on nothing in the
pipeline (ruling `09-30 entry contract`,
[`docs/decisions.md`](../../docs/decisions.md)). Compile, when it is
written, will be `admin/compile/` and may import only this module
and `admin/lib/` (rulings `10-04 compile home`, `11-06 admin layout`),
so anything about entries both it and the pipeline need lives here.
Helpers that are not about entries live in
[`admin/lib/`](../lib/README.md).

| File | What it holds |
|---|---|
| `schema.ts` | the schema, written once with TypeBox (ruling `11-05 schema source`): `EntrySchema`, the types derived from it (`Entry` and its parts), `SCHEMA_VERSION`, `VERBATIM_FIELDS` |
| `schema-build.ts` | `bun schema:build` writes `data/schema/entry.schema.json` from `schema.ts`; `bun schema:check` fails when the committed file is stale |
| `validate.ts` | the validator: `validateEntry`, `validateCorpus`, and `validateEntries` over a loaded tree; also `entryFields`, the walker over every text field of an entry (path, text, whether it may carry markup), and `RID`, the rid predicate |
| `annotations.ts` | the annotation clause (ANNOTATIONS.md §2): `checkAnnotations`, run by `validateEntry`; `entryAnnotations`, the walk over every annotation of an entry; `isIsoDate` |
| `ANNOTATIONS.md` | the design of `annotations` (ruling `10-13 correction policy`): the field, its checks, how the import fills it, the audit |
| `validate-cli.ts` | `bun data:validate` |
| `headwords.ts`, `headword-rules.ts` | the headword-line parser and the six shape rules |

The schema is written once, in `schema.ts`. A TypeBox schema is JSON
Schema as it stands, so TypeBox's own validator checks entries
against it directly (ruling `11-06 schema validator`), and the types
are derived from it, so the two cannot disagree.
`data/schema/entry.schema.json` is generated from it and committed,
never edited by hand: it gives an editor IntelliSense on an entry file
(`.vscode/settings.json` maps `data/entries/` to it, and each field's
`description` is its hover text), and a reader that is not TypeScript
can hold a file to it too. To change the schema, edit `schema.ts` and
run `bun schema:build`; `bun qa` and CI's Schema job run
`bun schema:check`, which fails on a stale file.

### What it checks

Per file (`validateEntry`): the schema; the file sits at
`<first letter>/<id>.json`; the six headword shape rules; gender in
one place, `grammar.gender` or a `gender` on every headword (ruling
HW-gender); each annotation's field resolves on its object, its
`stored` agrees with the field, `kept` iff `printed` equals `stored`,
one per field; markup in
the closed vocabulary and balanced per field; no markup in a plain
identifier field; every stored string in NFC, except
`sefariaHeadword`, which keeps Sefaria's bytes.

Across the tree (`validateCorpus`): no URL word is empty
(`checkUrlWords`, over `admin/lib/url-path.ts`) and `sefariaHeadword` is
unique in NFC; and every rid-shaped cite names an entry that exists.
An entry's `page` is its own record: the page index is an import
input, and nothing here compares the two (ruling `11-05 page index`).

It checks an entry against itself and the tree — never against the
source. What only the source can answer is the
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
