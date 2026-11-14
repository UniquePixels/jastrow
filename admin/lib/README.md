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
| `hebrew.ts` | the Hebrew character classes (`HEBREW`, `HEBREW_ATOM`, `HEBREW_MARK`), `SUPERSCRIPT_DIGIT` (Sefaria's superscript glyphs, the one definition), `hebrewRuns`, which finds Hebrew runs inside a text value, and the three forms a word is compared in: `toComparisonForm` (whether two strings are the same word: NFC, whitespace collapsed; ruling `11-07 one comparison rule`), `withoutMarks` (points removed, word by word) and `lettersOnly` (the letters alone) |
| `find-duplicates.ts` | `findDuplicates`, the one way a uniqueness check finds its duplicates: the first item to claim a key keeps it |
| `compare-by-code-unit.ts` | `compareByCodeUnit`, the comparator every string sort passes: code-unit order, the same on every machine; never `localeCompare` |
| `url-path.ts` | `toUrlWord` (a headword's URL word), `buildEntryPaths` (rid to path, numbered in rid order) and `findEmptyUrlWords` (the entries no URL reaches, each with its report line); the path is computed, never stored (ruling `11-13 url words`) |

Tests live in `__tests__/`.
