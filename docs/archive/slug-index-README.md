# Slug index

> **ARCHIVED 2026-09-21.** `data/slug-index/` and the slug itself were
> retired by the [URL names spec](../specs/2026-09-21-url-names-design.md)
> §7; nothing below describes the pipeline as it now runs.

The record of which URL name belongs to which entry. **Reference data**
(consolidation spec §1.1).

**Not frozen yet.** Until v2 is published, import assigns every slug
from scratch, the way it composes every entry, and `--write` rewrites
both files here. A run lists every slug that moved against this index as
a `slug-changed` review row. Freezing is one switch, `SLUGS_FROZEN` in
`admin/pipeline/migrate/slug-index.ts`, set at publication. From then
the pipeline reads this index as an *input*, the way it reads
`data/page-index/`, and a deleted file can no longer be rebuilt.

Design: [consolidation spec §7](../../docs/specs/2026-09-13-pipeline-consolidation-design.md).
Future routes built on it: [`docs/v2/url-routes.md`](../../docs/v2/url-routes.md).

## What a slug is

An entry's URL name: the headword with its points stripped, words
hyphen-joined. When several headwords strip to the same stem they form
a family and are numbered in rid order.

| rid | headword | slug |
|---|---|---|
| A00012 | אַב־ | `אב-1` |
| A00013 | אָב | `אב-2` |
| A00014 | אָב | `אב-3` |
| A00015 | אָב | `אב-4` |
| A00016 | אֵב | `אב-5` |

4,412 stems are shared this way; 11,640 of the 32,512 entries (36%) are
numbered members of a family.

Jastrow's editorial notation is dropped from the stem: `*`, `(…)`, `?`,
`,`, a Roman homograph numeral and a superscript. A parsed headword has
lost those already; this makes the unparsed rest agree. `=` stays, so
the two cross-reference headwords (A01175, A01345) show up as
`slug-unsafe` until the headword work resolves them.

**Rid order describes the first assignment, not the rule.** Once slugs
freeze, a member joining later takes the lowest free number and nobody
moves — so a family can hold a rid whose number is out of sequence, or
a gap where a member was retired. That is correct, not corruption: the
alternative is moving a published URL.

## `entries.jsonl`

One row per rid, rid-sorted, NFC.

```json
{"rid":"A00013","slug":"אב-2","status":"live"}
```

| Field | Meaning |
|---|---|
| `rid` | the entry, as Sefaria's export numbers it |
| `slug` | its URL name |
| `status` | `live`, or `retired` when the entry no longer exists |

**A published slug never changes** (ruling R10). Once frozen, a run
keeps every slug already recorded here and assigns only to rids with no
row. A `retired`
row keeps its slug reserved: the URL is never handed to a different
word, which is the whole reason this file exists rather than the slugs
being read back off `data/entries/`.

What threatens a slug is not Sefaria — Jastrow is a closed 1903 text —
but our own headword rules. Assigning from the source spellings instead
of the composed ones moves 6,570 slugs, 20% of the corpus: gershayim
normalisation, homograph extraction, superscript homographs. Freezing
is what stops a rule revision from rewriting a published URL. Before
publication that is exactly what should happen, which is why freezing
waits for it.

## `aliases.jsonl`

One row per shared stem, slug-sorted: the bare stem and the family
member it reaches.

```json
{"rid":"A00012","slug":"אב"}
```

So `/אב` reaches the start of the run rather than nothing. Once slugs
freeze, an alias is frozen exactly as a slug is — assigned once, never re-pointed, even if
a member with a lower rid arrives later.

The row is data, not behaviour. Whether the app redirects the bare name
to that entry or shows a disambiguation page listing the family is an
app decision, changeable without any slug moving.

A family whose bare stem is already some entry's real slug gets no
alias; the run reports it as `slug-bare-held`. That can only happen
under freezing, and none exist today.

## Seeding

Seeded once from the committed entry tree at step 7:

```bash
bun admin/pipeline/migrate/seed-slug-index.ts
```

It refuses if either file exists. It is not a `package.json` script
because it runs once.

**Before freezing, `data:import --write` writes this index.** After it, the
pipeline reads the index and reports what it is missing — a rid with no
row, a family with no alias — as review rows. Persisting those rows is
index maintenance and ships with the atomic write (consolidation spec
R11).

Seeding was safe because the assignment is reproducible: re-running
`assignSlugs` over the committed entries' own headwords returns all
32,512 committed slugs unchanged. The file records the state the tree
was already in.

## What checks it

`bun qa` validates entry data against this index both ways: every
entry's `slug` equals its row, every entry has a row, and every `live`
row has an entry. A hand edit or an admin-tool write that changes a
slug fails there.
