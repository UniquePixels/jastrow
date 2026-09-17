# Slug index

The record of which URL name belongs to which entry. **Reference data**
(consolidation spec §1.1): the pipeline reads it as an *input*, the way
it reads `data/page-index/`. It is not a derived artifact — do not
delete it expecting a rebuild to reproduce it.

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

4,407 stems are shared this way; 11,626 of the 32,512 entries (36%) are
numbered members of a family.

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

**A published slug never changes** (ruling R10). A run keeps every slug
already recorded here and assigns only to rids with no row. A `retired`
row keeps its slug reserved: the URL is never handed to a different
word, which is the whole reason this file exists rather than the slugs
being read back off `data/entries/`.

What threatens a slug is not Sefaria — Jastrow is a closed 1903 text —
but our own headword rules. Assigning from the source spellings instead
of the composed ones moves 6,570 slugs, 20% of the corpus: gershayim
normalisation, homograph extraction, superscript homographs. Freezing
is what stops a rule revision from rewriting a published URL.

## `aliases.jsonl`

One row per shared stem, slug-sorted: the bare stem and the family
member it reaches.

```json
{"rid":"A00012","slug":"אב"}
```

So `/אב` reaches the start of the run rather than nothing. An alias is
frozen exactly as a slug is — assigned once, never re-pointed, even if
a member with a lower rid arrives later.

The row is data, not behaviour. Whether the app redirects the bare name
to that entry or shows a disambiguation page listing the family is an
app decision, changeable without any slug moving.

A family whose bare stem is already some entry's real slug gets no
alias; the run reports it as `slug-bare-held`. None exist today.

## Seeding

Seeded once from the committed entry tree at step 7:

```bash
bun admin/pipeline/migrate/seed-slug-index.ts
```

It refuses if either file exists. It is not a `package.json` script
because it runs once.

**The pipeline reads this index; it does not yet write to it.** A run
reports what the index is missing — a rid with no row, a family with no
alias — as review rows. Persisting those rows is index maintenance and
ships with the atomic write (consolidation spec R11), so until then a
new entry means running the update by hand.

Seeding was safe because the assignment is reproducible: re-running
`assignSlugs` over the committed entries' own headwords returns all
32,512 committed slugs unchanged. The file records the state the tree
was already in.

## What checks it

`bun qa` validates entry data against this index both ways: every
entry's `slug` equals its row, every entry has a row, and every `live`
row has an entry. A hand edit or an admin-tool write that changes a
slug fails there.
