# Dictionary Entry Schema

Reference for the structure of a dictionary entry. **You normally won't
edit this by hand** — entries are edited through the admin tool, which
writes the JSONL for you (see
[CONTRIBUTING § Contributing Data](../CONTRIBUTING.md#contributing-data)).
This doc exists so reviewers and tool authors understand the shape, and
so you can read a diff.

The machine-readable source of truth is
[`scripts/lib/entry-schema.ts`](../scripts/lib/entry-schema.ts), enforced
by the `validate:data` CI gate. If this doc and that file ever disagree,
**the code wins** — please open a PR to fix the doc.

## Storage format

Two files, **one entry per line**, as compact JSON (JSONL):

- `data/jastrow-part1.jsonl`
- `data/jastrow-part2.jsonl`

One-entry-per-line keeps diffs small: editing one entry changes one line.

## Example entry

```json
{"hw":"א","id":"A00000","c":{"s":[{"d":"<i>Aleph</i>, the first letter of the alphabet …"}]},"nh":"א ²","p":1,"col":"a","rf":{"j":["הָבַב","חָבַב I"]}}
```

## Fields

**Required** (every entry must have these):

| Field | Type | Meaning |
|---|---|---|
| `hw` | non-empty string | Headword (the dictionary term) |
| `id` | string `^[A-Za-z]\d{5}$` | Unique id, e.g. `A00000`. The `#rid:ID` route target and the cross-reference key. **Must be unique across both files.** |
| `c` | object | Content; must contain `s` (senses) |
| `c.s` | array | Senses — one or more sense objects |

**Sense object** (each item in `c.s`):

| Field | Type | Meaning |
|---|---|---|
| `d` | string | Definition text (allow-listed HTML — see below) |
| `n` | string (optional) | Sense number/label |
| `g` | object (optional) | Grammatical info |
| `s` | array (optional) | Nested sub-senses (recursive, same shape) |

**Optional top-level fields** (type-checked only when present):

| Field | Type | Notes |
|---|---|---|
| `p` | number | Page number in Jastrow |
| `col` | string | Column (`a` / `b`) |
| `nh`, `ph`, `li` | string | Variant/related headword forms; list markup |
| `ah`, `pf`, `q` | array | — |
| `g`, `rf` | object | Grammar; cross-references (e.g. `rf.j` = Jastrow refs) |

The schema is **permissive about which optional fields an entry
carries** — it only checks the type of a field when that field is
present. It validates structure only; the HTML inside `d` / `li` is
checked separately.

## Allowed HTML in entry text

Definition text (`c.s[].d`) and list markup (`li`) may contain only this
allow-list (enforced by [`scripts/lib/entry-html.ts`](../scripts/lib/entry-html.ts)
on save **and** in CI):

- **Tags:** `a abbr b br div em i p span strong sub sup`
- **Attributes:** `class`, `dir`, `data-ref` (global); `href target rel`
  on `<a>`; `title` on `<abbr>`
- **Link schemes:** `http` / `https` only, plus protocol-relative
  (`//…`) and internal fragment refs (`#rid:ID`)

Anything outside the allow-list (e.g. `<script>`, a `javascript:` href,
including entity-obfuscated ones like `java&#115;cript:`) is **rejected**
— the admin tool returns an error and writes nothing; CI fails the PR.

## What CI checks (`validate:data`)

Run locally with `bun run validate:data`. It verifies, for every line:

1. Valid JSON
2. Structural schema (table above)
3. Global `id` uniqueness across both files
4. HTML allow-list compliance

Failures print as `file:line · field · detail` and exit non-zero.
