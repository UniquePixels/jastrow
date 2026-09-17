# The editorial-asterisk exposure — sizing

`headword-index.ts` has carried a round-1 claim in its
`EDITORIAL_ASTERISK` docstring since 2026-08-18:

> Round-1 letters B and J found this independently: 1,339 `*`
> headwords, 1,412 anchors whose display is exactly the de-asterisked
> target, **all correct**.

**"All correct" is false.** This document sizes the class, names the
mechanism, and records what a fix would have to see.

## How it surfaced

Batch 05's verification tier found **A03269** — an anchor displaying
`ארז` inside "disting. fr. ארז *male cedar*", targeting `*ארז`
(A03047), a verb root glossed "to penetrate deeply … to be prickly,
dry, hard". The cedar noun is A03048 `אֶרֶז`. The reader clicking
"male cedar" lands on a verb about being prickly.

Nothing deterministic can catch it. `twinHint` returns early on
`base === target`, and `baseHeadword` strips the editorial `*`, so an
anchor displaying `ארז` at target `*ארז` compares string-identical and
no hint can fire — even when the de-asterisked skeleton is carried by a
second, non-asterisked entry.

## The population

Measured on the **healed** corpus (`healedCorpus()`), over 66,761
Jastrow anchors, with A03269 asserted present in the final bucket:

| | Count |
| --- | --- |
| entries whose headword carries an editorial asterisk | 1,339 |
| anchors targeting a `*` headword | 2,210 |
| …whose de-asterisked **skeleton** is carried by ≥2 entries | **471** |

**The first cut of this returned 181 and did not contain A03269.** It
keyed the owner map by `baseHeadword`, which keeps niqqud, so `אֶרֶז`
never collided with `ארז` and the named counter-example fell out of its
own population. The collision is at skeleton level. A count with no
named member asserted in it is not evidence about that member — the
same failure `phase-2-inflection-gap.md` records for its own third cut.

The 1,339 reproduces the docstring exactly. The 471 is **not** a
reproduction of the docstring's 1,412: that figure counts anchors
whose display *is* the de-asterisked target, a different predicate, and
it was measured at source stage over a different anchor total (72,222
against 66,761). Neither number should be leaned on without restating
its predicate.

## Adjudicated: 20 of the 471, and one in four is wrong

A systematic sample — sorted by rid, every 23rd of 471, reproducible
without a seed — was read by two independent Opus adjudicators, ten
each. Every verdict had to quote the **target** entry's own text.

**A03269 was planted in both samples as an unlabelled 21st item.**
Both adjudicators independently ruled it wrong and both named A03048
as the entry meant. The control fired.

| | wrong | correct | undecidable |
| --- | --- | --- | --- |
| Adjudicator A | 1 | 8 | 1 |
| Adjudicator B | 4 | 5 | 1 |
| **Total (20 systematic)** | **5** | **13** | **2** |

Roughly **one in four**, or 5 of the 18 decidable. **The two halves
split 1-of-10 against 4-of-10**, which is a wide spread on n=10, so
treat 25% as this sample's rate and not as a corpus-scale estimate.
At that rate the 471 holds something like 120 wrong links; the honest
statement is that the class is real and unmeasured at scale.

### The second counter-example, found independently

**C00849 `גַּלָּא` "heap".** Its sense 1 is entire: "heap. Pl. גַּלִּין.
Targ. Is. XXV, 2." The display `גַּלִּין` is the **first string in the
host's own `plural_form`**, and the anchor sends it to `*גַּלִּי`
(C00929), "galium, bed-straw, an odoriferous plant". The same anchor
recurs in sense 2, so the rid carries the defect twice. A skeleton
search over every healed headword finds no entry for `גַּלִּין` at all
(control: the same search returns גִּלְגְּלִין, אגלין, פגלין and
others, so the predicate fires).

A03269 was one anecdote. C00849 is a second instance of the same
shape, found in an 11-item sample by an adjudicator who had not seen
the first — which is what turns this from an anecdote into a class.

## The mechanism: position beat sense

Every one of adjudicator B's five failures is the same thing, and it is
sharper than "asterisk stripping":

**The starred entry sorts alphabetically FIRST among its
skeleton-mates, and the linker took position over sense.** Following
the `prev_hw`/`next_hw` chains: `*ארז` → `אֶרֶז`; `*פִּתְרוֹן I` →
`פִּתְרוֹן II`; `*קַבָּלָן` → `קַבְּלָן`; `*עַיִר` → `עִיר I` →
`עִיר II`; `*אִיקוֹנְיָא I` → `*אִיקוֹנְיָא II`. In all five the
intended entry is the next headword or one after, and the starred one
sorts ahead of it.

Starred entries are also, as a class, the thin ones — a single
attestation, a reconstructed lemma, often a verb root or a hapax —
while the entry meant is the ordinary well-attested word. **The bias
runs systematically from a common noun to a rare root**, which is the
direction that costs a reader the most.

Adjudicator A found the same asymmetry from the other side: in the
wrong cases the target is a reconstructed **verb root** while the
display is used as a **noun**, and in A03269 the target's own text
disavows itself — `*ארז` closes "Denom. אוּרְזָא, אָרוּזָא, a. **next
ws.**", and the next w. is the cedar the host means.

## What a fix has to see, and what an asterisk-only fix misses

**An asterisk-only fix is not enough.** Two of the seven failures sit
outside it:

| Entry | Why an asterisk rule misses it |
| --- | --- |
| K01135 | **Both** owners are starred (`*אִיקוֹנְיָא I` / `II`). It is a Roman-numeral mis-target *inside* the starred population, and `baseHeadword` strips `I`/`II` as well as `*`, so `twinHint`'s early return blinds it identically |
| C00849 | the display is the host's **own inflected form**, which no twin comparison examines at all — this is `own-form-escape-link` territory, not `twinHint`'s |

Two cheap disambiguators the detector does not currently consult, both
found independently:

1. **A reciprocal back-link.** Four of B's five failures have a
   skeleton-mate linking back to the host (S00075 → `קַבָּל`,
   O01668 → `סֶרֶט 2`, M00981 → `מַנְטוּלִין`, P00674 → `רומי`).
   A back-link proves the right answer outright.
2. **A shared citation.** Six of A's eight correct verdicts have host
   and target naming the same tractate-page or midrash section — Snh.
   84ᵇ, Snh. 82ᵇ, B. Kam. 85ᵃ, Num. R. s. 7, Gen. R. s. 88. Where the
   citation matches, the verdict was never in doubt. This corroborates
   by shared *evidence* rather than by shared letters, which is the
   thing every orthographic predicate in this area has lacked.

## A free gate, found in passing

**3,054 anchors display exactly `preced.`, and 3,051 have
`data-ref === host.prev_hw`.** The three residuals (D01034, C01221,
C01225) are niqqud/abbreviation normalisation noise, not semantic
misses; 62 of the matching ones point at a *starred* `prev_hw` and all
62 match. Measured by parsing, with a positive control.

That is a near-zero-cost check over ~3,000 anchors needing no sense
adjudication at all. Note what it does and does not say: it confirms
the link is faithful to what "preced." *means*, which is positional.
L00676 is correct on those terms even though the etymon of לֶקַח is
really the Hebrew לָקַח (L00674) and the reader lands on an Aramaic
Ithpe.

## The residual that no corpus rule can settle

Two of the 20 are undecidable, and both for reasons that generalise.

- **N00708** is a gloss-less redirect stub — its entire content is
  `, v. נִסְכָּא`, no gloss, no citation — and all three owners carry
  the *identical pointed form*. The display cannot select among them
  and there is no surrounding text to read. Settling it needs the
  print page.
- **A01590** is a homograph split with no discriminator at the anchor.
  The host's form list is bare (`ch. אִיקוֹנַיָּא, אִיקוֹנָתָא`), the
  display's pointing matches neither headword, and the host's own
  closing bracket uses the unnumbered lemma to cover **both**
  homographs' citations — while Jastrow demonstrably *does* number when
  he means one (A01596: "v. אִיקוֹנְיָא II").

**Expect a residual class of these.** They need print or an explicit
indeterminate disposition, not a guess — which is what
`needs_print_check` is for.

## Recommendation

1. **Qualify the docstring now.** "All correct" is falsified by two
   named entries and a 5-of-20 sample rate. Done, 2026-09-05.
2. **Do not build the detector around the asterisk.** Build it around
   *skeleton has more than one owner*, which is what actually creates
   the ambiguity, and let the asterisk be one signal among several.
   K01135 shows the asterisk is neither necessary nor sufficient.
3. **Use the two corroborators before any orthographic test** — a
   reciprocal back-link, and a shared citation between host and
   target. Both proved decisive where letters could not.
4. **Ship the `preced.` gate independently.** It is 3,051 of 3,054, it
   needs no adjudication, and it is unrelated to the rest of this.
5. **Size the 471 properly before trusting any rate.** Twenty anchors
   split 1-of-10 against 4-of-10 across two readers. The class is
   established; its magnitude is not.

## Provenance

Population measured with the production `baseHeadword`, `skeleton` and
`healedCorpus`, never a reimplementation. Both adjudicators parsed the
JSONL rather than grepping it, each with a stated positive control, and
each recorded which corpus stage it read. The sample is every 23rd of
471 by rid; A03269 was added to both halves as a planted control and is
excluded from the 20-item rate.
