# Audit — `containment-fallback-mislink` (22 catalogued, 20 defect)

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

## Defect and convention separate MECHANICALLY, and the split recovers
## the row's own hand reading

Adding final-form normalization (`ם`→`מ` etc., which pulls in
`פליונ → אַפַּלְיוֹן`) the census is **65**. One test splits it:

**does the target carry material BEFORE the display, or only after?**

| Bucket | Count |
|---|---:|
| target has material before the display — **prefixed** | **20** |
| target is display + suffix, display at position 0 | 45 |

```text
PREFIXED — candidate defect          SUFFIXED — candidate convention
11  נגד     -> אִינְגַּד             13  אב     -> אַבָּא I
 5  נימוס   -> אַבְנִימוֹס            8  בית    -> בֵּיתָא I
 2  גביא    -> מַגַּבְיָא             5  טרפ    -> טַרְפָא I
 1  פליונ   -> אַפַּלְיוֹן            3  זוג    -> זוֹגָא
 1  קנתור   -> (קנתור)              …13 further sinks at 1–2 each
```

**The two sets are two different linguistic events.** A suffixed
target is the Aramaic emphatic form of the displayed Hebrew word —
`אב`/`אַבָּא`, `בית`/`בֵּיתָא` — which is a legitimate redirect and
exactly the CONVENTION job the row identified. A prefixed target is a
different lemma that merely happens to contain the display: `אִינְגַּד`
is `אי` + `נגד`, `אַבְנִימוֹס` is `אב` + `נימוס`.

**This recovers the row's hand reading rather than contradicting it.**
Its author read 22 and called 16 defect; those 16 are its two named
sinks, and both land in the prefixed bucket. The mechanical test adds
4 (`גביא`, `פליונ`, `קנתור`) and correctly sends the rest to
convention. So the rule's population is **20**, not 22 and not 65,
and the 45 must be excluded rather than inherited.

`קנתור -> (קנתור)` is a target wrapped in literal parentheses and is
probably a malformed-target row's business, not this one. It should be
excluded and referred rather than repaired here.

## Recommendation

**One of the two rows in batch 9 that can carry a rule**, with
`v-sub-redirect-stub.md`. It retargets, the
destination is an existing entry, the two dominant sinks were read in
full by the row's author and confirmed as impossible readings, and the
null model is strong in both predicates.

Before writing one, two things must be settled:

1. **Which are defect — now answered mechanically above: 20 of 65.**
   The 20 still want reading one by one before shipping, but that is
   confirmation of a derived set, not the open question it was.
2. **Sequencing with `geresh-abbrev-fixed-sink` — now answered: there
   is nothing to sequence.** That row's predicate requires a geresh
   abbreviation and this census excludes geresh displays outright, so
   the two are disjoint by construction. The entanglement is real for
   `v-sub-redirect-stub-mislink` and measured there; it does not
   reach this row.

## Reproduce

`scratchpad/batch-9/contain3.ts` — the census above.
`scratchpad/batch-9/ingad.ts` — the two sinks probed directly.
`scratchpad/batch-9/contain.ts`, `contain2.ts` — the two failed
predicates, kept because they document the artifacts.
