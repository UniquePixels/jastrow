# Audit — `containment-fallback-mislink` (22 catalogued, 60 measured)

**NOT YET RULED.** This records the measurement; the disposition below
is a recommendation awaiting Brian.

This is the one row in batch 9 that **retargets an existing anchor**
rather than minting one, so the objection that sank the never-linked
family — no gate can witness a minted work name — does not apply here.
The target is an entry that already exists in this dictionary.

## The row

> anchor display whose exact string is not a headword resolves to a
> LONGER headword that merely contains its skeleton, while a
> same-skeleton headword exists.

## Both named sinks reproduce exactly

```text
נגד   -> אִינְגַּד     11      (row: 11/11)
נימוס -> אַבְנִימוֹס    5      (row:  5/5)
```

## The count differs from the row's, and the predicate is why

The row measured **22**; this measures **60**. Per
[[feedback_cap_artifact_agreement]], the number is evidence only with
its predicate stated, so both are stated here.

- The row counted `9,859 unvocalized multi-letter displays`.
- This counts **every Hebrew-script display on a Jastrow-targeted
  anchor**, vocalized or not, geresh abbreviations excluded: **60,766**.

The two agree closely on the rate the null model turns on — the row's
`8,652 of 9,859 = 87.8%` resolve inside their own skeleton against this
pass's **53,489 of 60,766 = 88.0%** — so containment routing is not the
corpus's general behaviour on either predicate. Containment is 60 of
60,766, one tenth of one percent.

## A matcher artifact worth recording, because it is the third this batch

The shape these anchors take is:

```html
<a dir="rtl" class="refLink" href="/Jastrow,_אִינְגַּד.1"
   data-ref="Jastrow, אִינְגַּד 1">נגד</a>
```

`dir="rtl"` sits on the `<a>` and the display is **bare inner text**,
not a wrapped `<span dir="rtl">`. A census keyed on the span shape
returns **0 containment cases** and looks like a clean refutation of
the row. It is not; it never looked. Two earlier passes in this batch
failed the same way for different reasons — see the vacuous ambient
rate in `unlinked-v-span.md`, and the superscript `²` that made
`צִינְּתָא ²` read as "longer than" `צינתא`. **Every one of the three
returned a plausible number.**

## Every sink, at the broader predicate

```text
13  אב      -> אַבָּא I
11  נגד     -> אִינְגַּד
 8  בית     -> בֵּיתָא I
 5  נימוס   -> אַבְנִימוֹס
 3  זוג     -> זוֹגָא
 2  בורסי   -> בּוּרְסִים
 2  גביא    -> מַגַּבְיָא
 2  דמי     -> דָּמִין
 2  לביא    -> לְבִיאָה
    …16 further sinks at 1 each
```

The 38 above the row's 22 are mostly the shape the row itself called
CONVENTION rather than defect: `אב → אַבָּא I` and `בית → בֵּיתָא I`
are the Aramaic form of the displayed Hebrew word, which is a
legitimate redirect, not a mislink. **The extra instances the broader
predicate finds are largely NOT extra defects**, and any rule must
exclude them rather than inherit them.

## Recommendation

**The only row in batch 9 that can carry a rule.** It retargets, the
destination is an existing entry, the two dominant sinks were read in
full by the row's author and confirmed as impossible readings, and the
null model is strong in both predicates.

Before writing one, two things must be settled:

1. **Which of the 60 are defect.** The row's own job split was 16
   defect / 2 convention / 4 ambiguous out of 22. At 60 the convention
   share grows and has not been read. Every one of the 60 needs
   reading, as the row's 22 were.
2. **Sequencing with `geresh-abbrev-fixed-sink`.** The row states this
   is that row's non-abbreviation arm and that the two should be sized
   and sequenced together. That has not been done.

## Reproduce

`scratchpad/batch-9/contain3.ts` — the census above.
`scratchpad/batch-9/ingad.ts` — the two sinks probed directly.
`scratchpad/batch-9/contain.ts`, `contain2.ts` — the two failed
predicates, kept because they document the artifacts.
