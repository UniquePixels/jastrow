# Audit — `plural-label-rendering-defeats-capture` (358)

**RULED 2026-08-30 (Brian): DISCARDED,** `status: discarded`, `route`
and `blocking` removed, and the id taken out of `PENDING` in
`admin/pipeline/transform/registry.ts` so it appears in neither `RULES`
nor `PENDING`.

This is the **tenth `plural_form` row to leave the transform route**
and the only one whose disposition needed a measurement rather than the
argument the other nine share. Standing gate:
`admin/pipeline/transform/rules/plural-capture-corpus.test.ts`.

## Why this row was held back from the fold

Nine sibling rows — `plural-form-empty-slot` (703),
`geresh-abbrev-in-plural-form` (1,007), `plural-form-duplicated-value`
(93), `plural-form-holds-idiom-phrase` (90), `plural-form-roman-numeral-debris`
(64), `plural-form-holds-quotation-fragment` (26),
`plural-form-parenthesized-variant` (22), `plural-form-holds-gloss-text`
(14) and one more — carry an identical `reason`:

> `plural_form` is not a v2 field: `BodyEntry` has no such property and
> `entry.schema.json` (`additionalProperties: false`) forbids it.

This row's own `reason` says why it was not folded in with them:

> TRIAGE OWED — deliberately not dispositioned at the fold. […] that
> reasoning plausibly extends here **with a twist that should be ruled
> on rather than assumed: this shape is an ABSENCE, not debris, and the
> plural forms remain present verbatim in the definition text that v2
> does carry.**

The twist is real. The nine siblings describe *debris in a dropped
field* — deleting the field deletes the defect. This row describes a
**failure to capture**, and a failure to capture is only harmless if the
thing that was not captured is somewhere else. That second half was
asserted and never measured.

## The measurement

Over all 32,512 entries at the stage a transform would stand —
`applyTransforms(applyRepairs(source).entry, 'text-repairs').entry` —
every entry whose `plural_form` is absent, `[]`, or all-blank, and
whose definition text declares a plural (one of the six label
renderings, followed within four markup tokens by a Hebrew letter):

| | |
|---|---:|
| Entries flagged | **523** |
| Every declared Hebrew run present in the built `BodyEntry` | **523** |
| Entries losing at least one declared run | **0** |

Compared through `buildBody` itself, over the whole built entry —
every `gloss`, `label`, `units` entry, and every `stems[].stem` /
`stems[].forms` / stem sense — not through the source field and not
through `rejoinGlossHead` alone.

`A00016` אֵב is the row's own first example. Its `plural_form` is `[]`
and its definition reads `pl. אִבִּין, אִיבִּין`; both runs are in the
built body.

## The count does NOT reproduce, and that is recorded rather than fixed

The row measures **358**. The same six buckets measured across all
senses read **523**:

| Label rendering | declaring | missing |
|---|---:|---:|
| `Pl. ` | 5,588 | 26 |
| `pl. ` | 1,212 | 388 |
| `<i>Pl.</i>` | 137 | 89 |
| `<i>pl.</i>` | 32 | 23 |

The row's own by-label proportions are reproduced in shape — the
capitalised bucket loses well under 1% while the italic buckets lose
most of theirs, which is the INTERNAL CONTROL its argument rests on and
that control holds. Only the totals differ, and the likely cause is the
sense scope: the row's phrasing suggests a narrower walk.

**The disposition does not turn on which count is right.** 523 is a
superset of any narrower predicate over the same buckets, and survival
is 100% across all of it. But the catalogued 358 should not be read as
verified, and the gate pins **523** — the measured figure — so that a
change in either direction is visible. Compare
[[feedback_cap_artifact_agreement]]: a reproduced count is evidence only
when the predicate is stated.

## Why a discard rather than a withdrawal to `judgment`

The distinction this program uses is whether the row is *unowned* or
*already owned*. A `judgment` withdrawal says no rule can be stated but
the defect stands; a discard says something else already accounts for
it.

Here two things account for it, and both are structural rather than
circumstantial:

1. **There is no destination.** `entry.schema.json` sets
   `additionalProperties: false` over `{id, slug, headword,
   altHeadwords, page, grammar, senses, stems}`. A rule that populated
   `plural_form` would write a field the schema forbids.
2. **There is no loss.** The content is in `senses`, which v2 keeps, in
   all 523.

So the row is not describing something v2 gets wrong. It is describing
something Sefaria's extractor got wrong about a field v2 does not carry.
That is `binyan-form-*`'s shape — see
`data/patches/catalogue-audit/binyan-form-cleanup.md` — with the owner
being the body model's own field selection rather than a repair pass.

## What reopens it

The siblings all record the same reopening condition, and it applies
here unchanged: **if `plural_form` is ever given a v2 destination**, all
ten rows reopen together. §3 of the gate asserts the schema fact
directly for that reason, so the reopening is a test failure rather than
a thing someone has to remember.

## What this row still contributes

Its `reason` should be kept, not trimmed. It is the recorded mechanism
behind chunk-00803's independently-detected "73-entry unexplained
extraction gap", and the by-label breakdown — capture keyed to the
*rendering* of a label rather than its meaning — is a finding about the
upstream extractor that outlives the row's own disposition. It belongs
in `docs/v2/upstream-issues.md`'s territory, not in a transform.
