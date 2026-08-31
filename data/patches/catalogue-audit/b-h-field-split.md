# Audit — `b-h-split-across-field-boundary` (4)

**RULED 2026-08-30 (Brian): DISCARDED,** `status: discarded`, `route`
and `blocking` removed, and the id taken out of `PENDING` in
`admin/pipeline/transform/registry.ts`.

Standing gate:
`admin/pipeline/transform/rules/gloss-head-rejoin-corpus.test.ts`.

## The row

> `language_code` ends `"= b."` and the first definition opens
> `" h. ..."`, splitting `b. h.` across the field boundary.

`b. h.` is Jastrow's "biblical Hebrew". Upstream, the two halves landed
in different fields, so a reader of the SOURCE sees a `language_code`
trailing off mid-abbreviation and a definition starting mid-abbreviation.

## It heals by construction, and the module that heals it names this class

`admin/pipeline/body/rejoin.ts` concatenates the four gloss-head
fragments in print order and invents nothing:

```ts
const parts: [keyof RejoinOffsets, string][] = [
    ['morphology', e.content.morphology ?? ''],
    ['languageCode', e.language_code ?? ''],
    ['languageReference', e.language_reference ?? ''],
    ['senseHead', e.content.senses[0]?.definition ?? ''],
];
```

Its header states the property this row needs, in general terms and
about a different instance of it:

> No separators are invented; whatever whitespace or punctuation Sefaria
> already put at the edges of each fragment is all that ever appears
> between them. […] **This is what heals the K00664-class mid-phrase
> paren straddle**: the etymology parenthesis that opens in
> `language_reference` and closes inside the sense-1 definition becomes
> contiguous text again once the two are concatenated in print order.

`b. h.` is the same straddle with a different pair of fragments. For
`M00395`:

```text
language_code   " ch. = b."
senses[0].def   " h. מוּג, to melt."
rejoined        " ch. = b. h. מוּג, to melt."
```

## The measurement

| | |
|---|---:|
| Entries matching the row's predicate | **4** — `C00090`, `M00231`, `M00395`, `R00196` |
| Reading `b. h.` in the rejoined gloss head | **4** |
| Reading `b. h.` in the **built body** (`buildBody`) | **4** |

Asserted through `buildBody`, which calls `rejoinGlossHead` at
`dry-run.ts:241`, and not through the helper alone. A discard that
rested on the helper would survive a builder that stopped calling it, or
that called it and then re-split on a parse — and in either case all
four defects would be back with the helper still passing. What the
discard claims is about what a reader is shown, so that is where it is
measured. The gate keeps both assertions separately (§2 and §3) so a
failure says which half broke.

## The predicate had to be widened, and the row's own count is why

The row's phrasing is `language_code` ends `"= b."`. That exact form
matches **2** of the 4. The widened predicate — any `language_code`
ending in a bare `b.`, with the first definition opening on a bare
`h.` — matches all **4** and reproduces the catalogued count exactly.

This is worth recording rather than quietly fixing. A future reader
re-deriving the row from its own description would find 2, fail to
reproduce 4, and reach for the wrong conclusion — that the catalogue
over-counted. The gate's §4 pins the narrower figure at 2 alongside the
wider figure at 4, so the discrepancy is documented rather than
rediscovered. Compare [[feedback_brief_queries_unverified]].

## Why a discard rather than a withdrawal

Same test as `binyan-form-*`: is the row unowned, or already owned? It
is owned. `rejoinGlossHead` is not a repair that happens to fix this —
it is the body model's definition of what the gloss head IS, and under
that definition the two fragments were never apart in the first place.
A rule would be the second owner of the same four records, which is the
batch-3a two-owners failure.

## What reopens it

The discard is exactly as durable as `rejoinGlossHead`'s
concatenate-in-print-order contract. If the gloss head ever stops being
built by pure concatenation — if a separator is introduced, or the
fragments are reordered, or `buildBody` stops calling the rejoin — these
four come back. That is what the gate fails on.
