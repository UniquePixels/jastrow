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
| `html.ts` | the tokenizer every markup field is read with, plus the Hebrew character classes and span helpers built on it |
| `compare-by-code-unit.ts` | `compareByCodeUnit`, the comparator every string sort passes: code-unit order, the same on every machine; never `localeCompare` |

Tests live in `__tests__/`.
