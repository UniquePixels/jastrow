# Admin Helpers

Code any admin module may use: the entry contract
([`admin/entry/`](../entry/README.md)), the
[pipeline](../pipeline/README.md), and later compile and the admin
tool (`admin/ui/`). A helper belongs here when it is not about
entries or about one module's job (ruling `11-06 admin layout`,
[`docs/decisions.md`](../../docs/decisions.md)). Nothing here imports
from another admin module.

| File | What it holds |
|---|---|
| `html.ts` | the tokenizer every markup field is read with, and the tag-span helpers built on it |
| `hebrew.ts` | the Hebrew character classes (`HEBREW`, `HEBREW_ATOM`) and `hebrewRuns`, which finds Hebrew runs inside a text value |
| `biome-format.ts` | `biomeFormat`, which runs the project's Biome formatter over a file or directory (the import's entry files, the generated schema, the admin tool's save), and `biomeBinary`, which finds that Biome: the project's dependency first, then PATH |
| `compare-by-code-unit.ts` | `compareByCodeUnit`, the comparator every string sort passes: code-unit order, the same on every machine; never `localeCompare` |

Tests live in `__tests__/`.
