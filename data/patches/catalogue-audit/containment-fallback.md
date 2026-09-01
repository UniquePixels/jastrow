# Audit — `containment-fallback-mislink` (22 catalogued, 20 defect)

**RULED 2026-08-31 (Brian), TWICE.** First: ship the rule at 18.
Then, after gate case 8's blast radius showed only 1 of the 18 has a
uniquely determined target: **WITHDRAW to `judgment`**, joining the
Phase 4 linker item with batch 9's other homograph work. See the
homograph section at the end — that finding is why the ruling
changed.

This row **retargets an existing anchor** rather than minting one, so
the objection that sank the never-linked family — no gate can witness
a minted work name — does not apply here. The target is an entry that
already exists in this dictionary. `v-sub-redirect-stub-mislink` is
the other row in batch 9 with that property.

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

The row measured **22**; this measures **65** (60 before final-form
normalization was added — see below). Per
[[feedback_cap_artifact_agreement]], the number is evidence only with
its predicate stated, so both are stated here.

- The row counted `9,859 unvocalized multi-letter displays`.
- This counts **every Hebrew-script display on a Jastrow-targeted
  anchor**, vocalized or not, geresh abbreviations excluded: **60,766**.

The two agree closely on the rate the null model turns on — the row's
`8,652 of 9,859 = 87.8%` resolve inside their own skeleton against this
pass's **53,489 of 60,766 = 88.0%** — so containment routing is not the
corpus's general behaviour on either predicate. Containment is 65 of
60,766, one tenth of one percent, and only 20 of those are defect.

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

## Defect and convention separate mechanically, recovering the hand reading

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

1. **Which are defect — answered, and then CONFIRMED BY READING: 18.**
   The mechanical split gave 20 of 65; all 20 were then read in
   context and **two do not survive**, so the rule ships **18**.
2. **Sequencing with `geresh-abbrev-fixed-sink` — now answered: there
   is nothing to sequence.** That row's predicate requires a geresh
   abbreviation and this census excludes geresh displays outright, so
   the two are disjoint by construction. The entanglement is real for
   `v-sub-redirect-stub-mislink` and measured there; it does not
   reach this row.

## Reproduce

`scratchpad/batch-9/contain3.ts` — the census.
`scratchpad/batch-9/contain4.ts` — the prefixed/suffixed split.
`scratchpad/batch-9/ingad.ts` — the two sinks probed directly.
`scratchpad/batch-9/contain.ts`, `contain2.ts` — the two failed
predicates, kept because they document the artifacts.

## ALL 20 READ — 18 CONFIRM, 2 EXCLUDED

Brian ruled 2026-08-31 to ship both of batch 9's rules, and this is
the confirmation pass that ruling was conditioned on.

| Group | N | Verdict |
|---|---:|---|
| `נגד -> אִינְגַּד` | 11 | defect |
| `נִימוֹס -> אַבְנִימוֹס` | 5 | defect |
| `פַּלְיוֹן -> אַפַּלְיוֹן` (A02690) | 1 | defect |
| `גַּבְיָא -> מַגַּבְיָא` (C00074) | 1 | defect |
| `גביא -> מַגַּבְיָא` (M00108) | 1 | **excluded — ambiguous** |
| `קנתור -> (קנתור)` (S01557) | 1 | **excluded — malformed target** |

Every one of the 11 `נגד` contexts is etymological and none is about
drawing or pulling in the `אִינְגַּד` sense: `(√גד, v. נגד a. גדל)`,
`(נגד)`, `forms of גדד a. נגד`, `with נגד or כלפי`,
`לעמת, מול, נגד, נכח`. `נָגַד` / `נְגַד` / `נֶגֶד` all exist as
entries. The 5 `נִימוֹס` contexts are all about *nomos* the law —
`law, v. נִימוֹס`, `cmp. נִימוֹס for νόμος`, `the gentile's nomos` —
never the proper name Oenomaus.

**M00108 is excluded because the reading changes it.** Its display
`גביא` is an EDITION'S VARIANT of the host headword — the context is
`מתקל זוזא מ׳ ג׳ Ar. (ed. גביא, Ms. M. only מגבי)` — so an anchor from
the variant to the host lemma `מַגַּבְיָא` is defensible rather than a
mislink. The mechanical test cannot see that; only the context can.

**S01557 is excluded as out of scope**: its target is the literal
string `(קנתור)`, parentheses included. That is a malformed target and
belongs to whichever row owns those, not to a containment repair.

**The rule's population is 18.**

## THE HOMOGRAPH PROBLEM — found while specifying gate case 8

Measured 2026-08-31, after Brian ruled to ship this rule and to add a
corpus-vouched gate case for it. **The gate case can vouch the WORD but
not the ENTRY, and for this row that is nearly the whole population.**

Case 8's clause for this shape is skeleton equality: the target
headword's skeleton must equal the anchor's display skeleton. Against
the 18 confirmed defects:

| | Count |
|---|---:|
| target entry **uniquely determined** | **1** |
| several homographs share the skeleton | **17** |

```text
11  נגד    -> נָגַד | נְגַד | נֶגֶד
 5  נימוס  -> נִימּוֹס | נִימוֹס I | נִימוֹס II
 1  גביא   -> גַּבְיָא I | *גַּבְיָא II | גַּבְיָא III
 1  פליונ  -> פליון                        <- the only unique one
```

**And the contexts want different homographs.** `(√גד, v. נגד a.
גדל)` is an etymological root and wants the verb; `לעמת, מול, נגד,
נכח` is a list of prepositions and wants `נֶגֶד`. Nothing in the corpus
distinguishes them mechanically.

**This is the same defect batch 9 already withdrew 347 rows for.**
`unlinked-v-span.md` withdrew its 347 ambiguous spans precisely
because homograph disambiguation is not available on the transform
route, and `homograph-numbering-schism` (186) sits in `judgment` for
the same reason. Shipping 17 of these while withdrawing those 347
would be incoherent.

**The counter-argument, which is real.** Per
[[feedback_rendered_harm_rule]] the classification is what the READER
sees, and today these anchors point at an unrelated lemma —
`אִינְגַּד` "go further!" for a host about drawing, `אַבְנִימוֹס` the
proper name for a host about *nomos*. Retargeting to ANY of the three
homographs is a strict improvement on that: right word, possibly wrong
sub-entry. The defect-count delta is favourable even under a blind
pick.

**RULED 2026-08-31 (Brian): reading 3 — WITHDRAW.** Three readings
were put; the ruling is the third, on consistency with the 347.

1. **Ship 1** (`פליונ` only) — honest, gate-clean, and not worth a rule.
2. **Ship 18 with a declared pick** — defensible on the reader-harm
   delta, but the pick has no principle behind it, and case 8 would be
   vouching a word while the rule silently chooses an entry.
3. **Withdraw the row**, ship `v-sub` alone (50, residue zero), and
   send this to the Phase 4 linker with the other homograph work.

Reading 3 was the recommendation and is the ruling. The 18 are a real,
read, confirmed defect and the measurements above should survive into
the Phase 4 linker item: the prefixed/suffixed discriminator, the 20/45
split, and the 18 confirmed contexts are all work that item will need.
What blocks them is not doubt about the defect — it is that the
transform route cannot choose between three spellings of one word.
