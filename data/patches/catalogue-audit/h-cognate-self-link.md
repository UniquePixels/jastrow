# Audit — `h-cognate-self-link` (catalogued 85)

**Verdict: CONVENTION.** The entry count reproduces exactly (85). Every
one of the 87 occurrences is the entry's own cognate form printed in its
etymology parenthesis and anchored back at the article you are already
reading. **No separate article exists for any of the 87 displayed forms
(0 of 87, exact pointing).** The construct is not local to this row
either: the same linker behaviour produces 2,657 further self-links in
definitions, so the catalogued population is 3.2% of a corpus-wide habit
carved out by a field boundary. There is no defect arm to write a rule
against. Route to `judgment`.

## Probe and raw figure

All measurement reads the tokenizer's anchor view (`html.ts` +
`links.ts`), not a regex over raw HTML — the corpus nests anchors in
both `language_reference` (757 pairs) and `definition` (507), and a flat
regex cannot see it (below).

`data-ref` in `language_reference` is `Jastrow, <headword> <senseNumber>`
in **5,339 of 5,339** anchors; no non-`Jastrow` target, and no headword
in the corpus ends in an ASCII digit (0 of 32,512), so stripping the
prefix and a trailing ` \d+` recovers the lemma unambiguously.

```ts
// bun run — see task-4-report.md for the full script
const lemmaOf = (r: string) =>
  r.replace(/^Jastrow,\s*/u, '').replace(/\s+\d+$/u, '');
for await (const e of readSourceEntries()) {
  const lr = e.language_reference;
  if (lr === undefined) continue;
  for (const a of anchors(tokenize(lr))) {
    if (lemmaOf(a.dataRef) === e.headword) { occ++; ents.add(e.rid); }
  }
}
// → { entries: 85, occ: 107, unusable: 0 }
```

**107 occurrences / 85 entries.** The entry figure matches the
catalogued 85 exactly. `unusable: 0` — none of the 107 is `malformed`,
`interior` or unclosed, so the anchor view would accept every one.

### Reconciling 107 against the catalogued 87

The +20 is fully derived, not a carve. **25 of this row's 85 member
entries carry a nested duplicate anchor** — the last anchor of the
etymology is wrapped a second time, swallowing the closing paren:

```
A00383  <a … data-ref="Jastrow, אֱדוֹם 1"><a … data-ref="Jastrow, אֱדוֹם 1">אֱדֹם</a>)</a>
```

`links.ts`'s stack pairs both opens, so both are real anchors; 20 of the
50 members of those pairs are self-links whose partner is also a
self-link with the same `data-ref`. Dropping the outer member of each
identical nested pair:

```ts
if (self.some((y) => y !== x && y.open > x.open && y.open < xc
                  && y.dataRef === x.dataRef)) continue;   // → 87 / 85
```

and the naive flat regex a pre-`links.ts` probe would have used —
`/<a\b[^>]*\bdata-ref="([^"]*)"[^>]*>([^<]*)<\/a>/gu`, whose `[^<]*`
display can never match the outer member — returns **87 / 85**
independently. So the catalogued 87 is the flat-regex reading and 107 is
the tokenizer-true one; they differ by exactly the 20 nested wrappers
and agree on the entry count. **All figures below are stated over the 87
inner occurrences**, because the 20 wrappers are the same printed word
counted twice and belong to a duplicate-anchor row, not to this one.

### Anchors nest in BOTH fields — corrected 2026-08-23

**The first version of this audit got this wrong and the correction is
the load-bearing part of this section.** It said `links.ts`'s "anchors
do not nest in this corpus" *"holds for definitions and fails in
`language_reference` (25 entries)"*. Both halves were false. The 25 is
real but is a **subset**: it is the nested-pair count inside this row's
own 85 member entries, not a corpus-wide figure, and it was produced by
a query that skipped every entry without a self-link. Re-measured
corpus-wide, over both fields, counting a pair whenever one anchor's
`open` lies strictly inside another's span:

```ts
function pairsIn(text: string) {
  const toks = tokenize(text);
  const as = anchors(toks);
  const out: Array<[Anchor, Anchor]> = [];
  for (const x of as) {
    const xc = x.close === -1 ? toks.length : x.close;
    for (const y of as) {
      if (y !== x && y.open > x.open && y.open < xc) out.push([x, y]);
    }
  }
  return out;
}
// definitions, recursing into sense.senses:
//   raw        → { pairs: 507, entries: 467 }
//   bothUsable → { pairs: 477, entries: 465, sameRef: 475 }
// language_reference:
//   raw = bothUsable → { pairs: 757, entries: 756, sameRef: 755 }
// within this row's 85 members → 25 pairs   ← the subset quoted above
```

| Field | Nested pairs | Entries | Both members usable | Same `data-ref` |
|---|---|---|---|---|
| `definition` (recursive) | 507 | 467 | **477 / 465 entries** | 475 |
| `language_reference` | **757** | **756** | 757 | 755 |
| — of which, inside this row's 85 members | 25 | ≤25 | 25 | 25 |

**Definitions are not safe, and definitions are the field the shipped
unlink rules actually run over.** 477 pairs across 465 entries have both
members usable, so both are live candidates for any predicate: A00085,
A00115, A00130, A00211, A00282, A00302, A00349, A00436 are the first
eight by rid. The 30-pair gap between 507 and 477 is pairs with a
`malformed`, `interior` or unclosed member, which both editors refuse
anyway.

The `language_reference` figure — **757 pairs / 756 entries, 755 sharing
one `data-ref`** — is the population of the pending
**`nonsense-dup-anchor`** row (`route: transform`, catalogued **755**),
whose description is exactly this shape: *"duplicate anchor wrap in
language_reference, the outer layer wrapping nothing but the inner
anchor and one trailing punctuation mark"*. That row is 755, not 25, and
nothing in this audit scopes it.

**This observation exposed a real bug, since fixed.** `unlinkMatching`
in `rules/unlink.ts` deleted matched anchors in reverse `open` order on
the strength of the false no-nesting claim; on a nested pair the outer
anchor's `close` index went stale and the deletion left a stray `</a>`.
Fixed in **`6b45ec8`** by re-deriving `anchors()` before each removal,
with an A00282 regression test and a permanent corpus-wide tag-balance
test; `links.ts`'s docstring was corrected in the same commit and now
carries these figures. A reader tracing the provenance of the nesting
claim should read that commit, not the superseded sentence this section
replaces.

## The etymology cue is in a different field than the brief assumed

The task brief's Step 1 query tests `/\bb\.\s*h\./u` against
`language_reference`. Measured: the cue is in **`language_code`**
(2,622 entries) and effectively absent from `language_reference`
(**10** entries corpus-wide).

```ts
// bhInLc: 2622, bhInLr: 10, entries: 32512, withLr: 4499
```

A00314 is the shape: `language_code` = `"(b. h. "`, `language_reference`
= `"…אַגְמֹן</a>; v. …אֲגַם II</a>)"`. One printed parenthesis, split
across two fields — the `b-h-split-across-field-boundary` row's own
subject. Run as written the brief's query reports ~0 under `b. h.` and
would have made the population look like it had no etymology cue at all.
Every figure below reads the cue from `language_code ∪
language_reference`.

## Measurement of the three populations

| Measure | Value | of 87 |
|---|---|---|
| self-link occurrences (inner) / entries | **87 / 85** | — |
| under a `b. h.` etymology | **83** | 95.4% |
| under `(h. ` | 3 | 3.4% |
| under `(Ar. ` | 1 | 1.1% |
| display byte-identical to headword | 9 | 10.3% |
| display differs by points only | 12 | 13.8% |
| display differs by matres lectionis (plene/defective) | 48 | 55.2% |
| **→ same consonantal skeleton (union of the three)** | **69** | **79.3%** |
| display differs morphologically | 18 | 20.7% |
| **another article exists for the display** | **0** | **0%** |
| letter-A entries | 10 of 85 | — |

Classification predicates, in order, first match wins: `identical` is
`display === headword`; `pointsOnly` is equal after
`.normalize('NFC').replace(/[֑-ׇ]/gu,'')`; `pleneDef` is equal
after additionally dropping `[וי]`; everything else is `other`.

**Deltas against the row's recorded numbers.** 85 entries and 83 under
`b. h.` reproduce exactly; 69 same-skeleton reproduces exactly as a
count. The row states those as "77 self-links, 75 following b. h., 69 of
77" — a denominator of 77 that **no predicate tried here reproduces**
(87 all; 83 b.h.; 80 with `language_code` exactly `"(b. h. "`; 64 first
anchor in the field; 63 b.h. and first; 18 sole anchor in the field).
Reported as an unreconciled delta rather than fitted: the honest figure
is 69 of 87.

## Does this population have more than one job?

**No. One job, one construct, in three cue dialects.**

The row's proposed split axis is orthographic: plene/defective is
convention, the rest is defect. Reading all 18 `other` members shows the
axis does not separate two jobs — it separates two kinds of difference
inside one job. Every `other` member is still the entry's Hebrew or
biblical cognate, differing morphologically rather than only in
spelling:

| rid | headword | display | difference |
|---|---|---|---|
| A03329 | אַשְׁמוֹרָה | אַשְׁמֹרֶת | biblical `-et` for `-ah` |
| K01298 | כַּשְׂדִּי | כַּשְׂדִּים | gentilic plural |
| M02318 | מְצִילָּה | מְצִלּוֹת | biblical plural |
| H00141 | חַגְוָא | חַגְוֵי | construct plural |
| H01316 | חֲנַנְיָא | חֲנַנְיָה | Aram. `-a` → Heb. `-ah` |
| M00417 | מוֹדָעָא | מוֹדָעָה | Aram. `-a` → Heb. `-ah` |
| A00973 | אֲזַל I | אָזַל | Aram. → Heb. vocalization |
| O00068 | סְבָכָה | שְׂ׳ | ס/שׂ variant, abbreviated |

`אַשְׁמֹרֶת` is no more a mislink than `אֹסֶף` is. Both are what the print
says the biblical form is, and neither has an article of its own. A rule
that fired on the 18 and spared the 69 would be drawing its boundary on
whether the cognate happens to differ by a vowel letter or by a suffix —
a distinction with no bearing on whether the anchor is wrong. This is
§5.2's lesson in its measurement form: *a count can look like a
derivation and still be an assumption*.

## The decisive test: is there another article to link to?

The row's `description` says the anchor is "a no-op link that promises a
different article". If that is true there is a different article, and
the repair would be `retarget`, not `unlink`. Tested at the strictest
setting — the displayed form with its pointing intact, only a trailing
Roman/superscript homograph marker stripped, matched against every
headword in the corpus:

```ts
const dehom = (s: string) =>
  s.replace(/\s*(?:[IVX]+|[¹²³⁴⁵⁶⁷⁸⁹])\s*$/u, '').trim();
// other entries whose dehom(headword) === dehom(display)
// → { hwElse: 0, altElse: 1, n: 87 }
```

**0 of 87.** The one `altElse` is O00068's abbreviation stub `שְׂ׳`
matching an `alt_headwords` item of O01199 — an abbreviation, not a
pointed lemma, and `abbrev-*` territory.

Relaxing to the unpointed skeleton produces 28 apparent matches, and all
28 are skeleton collisions with **different lemmas**, verified by
reading them:

| self-link | unpointed match | what the match actually is |
|---|---|---|
| A00793 אוֹסֶף → אֹסֶף | A02475 אָסַף, A02476 אֲסַף | the *verb* "to gather", and its Aramaic |
| A00383 אֱדוֹם → אֱדֹם | A00416-419 אֲדַם, אָדַם … | "to be red", "man" |
| C00560 גָּזֵל → גָּזֵל | C00558 גָּזַל, C00559 גְּזַל I | the verb "to rob", and its Aramaic |
| H01710 חֲרָךְ I → חרך | H01707 חָרַךְ … | the verb "to parch" |

Retargeting any of these would replace an inert self-link with a real
mislink. **The row's own recorded caution is confirmed by measurement:
for a biblical form there is no separate article for the link to
promise.** The `description` is therefore wrong on its face — the anchor
promises the *same* article, which is precisely why it misleads no one.

## Null model

**Null model: the linker anchors any recognizable form of a headword,
including the headword of the entry it is inside. If that is true, this
row is not a defect class at all — it is one field's share of a
corpus-wide behaviour, and 85 entries is an artefact of where the census
looked.**

Measured on the other side of the field boundary, walking nested senses
(`sense.senses`, max observed depth 2):

```ts
// same lemmaOf test, over every definition, recursing into sense.senses
// → { defAnchors: 164808, defSelf: 2657, defSelfEntries: 2151 }
```

**2,657 self-links / 2,151 entries in definitions**, against 87 / 85 in
`language_reference`. Union 2,744 occurrences / 2,227 entries, overlap 9
entries. The catalogued row is **3.2% of the occurrences and 3.8% of the
entries** of the construct it names.

The null model is not refuted; it is confirmed. The definition-side
population is the same behaviour in a plainer setting — 2,562 of 2,657
follow no apparatus cue at all, being an inflected form of the lemma
quoted inside its own article (K01046 כָּפַר → `המִתְכַּפֵּר`, N01331 נְשַׁם →
`אִתְנְשִׁימַת`, P00817 עֲלַל II → `עֲלָלָתָא`). And the etymology construct
itself crosses the boundary: 25 definition-side self-links carry an
` h.` lead (17 `b. h.`, 8 `h.`) and are indistinguishable from the 87
except in which field the parenthesis landed in — A01745 `…(b. h. ` →
אָכַף, A01915 `m. (b. h. ` → אַלְמֹנִי.

So the question "should a self-link be unlinked?" has one answer for
2,744 occurrences, not two answers split on a field name. A transform
scoped to this row's 87 would remove 3.2% of the construct and leave
96.8% standing — introducing an inconsistency the corpus does not
currently have.

## Letter A

**10 of 85 member entries**, exhaustively: A00314, A00383, A00793,
A00812, A00872, A00899, A00973, A01102, A01507, A03329. A is 10.6% of the
corpus and 11.8% of the members, so the pilot tranche exercises the
construct at its corpus rate. The row's caution that a `' h.'` substring
rule would sweep "10+ of them in letter A" is confirmed in magnitude.

## Disposition

**Reclassify to `route: judgment`, `corpusCount: 85` unchanged.**

Recorded reason: the population is a single uniform construct with no
defect arm inside it; no correct target exists for any member (0 of 87);
and it is 3.2% of a corpus-wide linker behaviour (2,744 occ / 2,227
entries) that a field-scoped transform would make inconsistent rather
than repair.

What a judgment ruling would have to decide, if the project ever takes
it up, is a **presentation** question about the whole 2,744: should the
renderer make an anchor whose target is the entry it sits in inert?
That is one ruling in the view layer, cheap and reversible, against
2,744 irreversible deletions in the data. It is not a per-entry
transform.

This is the `abbrev-in-alt-headwords` outcome (spec §5.2) reached by a
different road. That row failed §5.2's "what does the rule INFER"
test. This one passes it — an unlink infers nothing, it deletes — and
fails a different one: **the rule has no defect to remove.** Both belong
in `judgment`; the tests are complementary, not redundant.

## What would have falsified this

Flipping CONVENTION to DEFECT required any one of these, all checked:

- **A separate article for the displayed form.** 0 of 87 at exact
  pointing, 0 of 87 at exact pointing with the homograph marker
  stripped. Had this been non-zero, those members would be genuine
  mis-targets and the repair would be `retarget`, not `unlink`.
- **A second job inside the population.** All 18 morphological outliers
  read as the same etymology construct; no member turned out to be, say,
  a `v. X` cross-reference that lost its target, or an anchor whose
  display is a *different word* the linker collapsed onto this headword.
- **The `language_reference` locus being special.** It is not: the same
  self-link behaviour runs 30× larger in definitions, cue and all.
  Had the definition-side count come back near zero, the etymology slot
  would have been a distinctive locus and the case for a scoped rule
  much stronger.
- **A member that is unusable or damaged**, making the anchor debris on
  structural grounds independent of its target. 0 of 87 are `malformed`,
  `interior` or unclosed.

The failure mode this row warned about is real and was avoided: a
predicate matching `' h.'` as a substring sweeps the whole 87, all of
which this audit finds to be convention.

## Merge flag — recorded, not acted on

The standing merge candidacy with **`homograph-numbering-schism`** (186,
already `judgment`) stands and is untouched here. Merging catalogue rows
is a catalogue decision, not a transform. Two notes for whoever takes
it:

- Both rows are now `judgment`, so the merge no longer has a routing
  consequence — it is bookkeeping.
- The corroborating evidence the schism audit cited (a language tag
  outside the anchor that the linker never reads) is confirmed again
  here from a third direction: the linker self-links at the same rate
  with an etymology cue (87) and without one (2,562), so the cue plays
  no part in its behaviour.

## Overlap with other catalogue rows

- **`b-h-split-across-field-boundary`** — owns the `language_code` /
  `language_reference` seam that this row's 83 `b. h.` members sit
  across. 2,622 entries carry the cue in `language_code`; that row, not
  this one, is where the etymology parenthesis gets repaired.
- **`nonsense-dup-anchor` (755, pending transform)** — its population is
  the **757 nested pairs / 756 entries** in `language_reference`, 755 of
  them same-`data-ref`, measured above. The 25 that fall inside this
  row's 85 members (A00383, A00899, A01507, C01192, D00120, …) are a
  3.3% slice of it and are **not** this row. Its author should read the
  nesting section above and `6b45ec8`: definitions nest too (477 usable
  pairs / 465 entries), and the reverse-order deletion that assumption
  licensed was a real bug.
- **`homograph-numbering-schism` (186, judgment)** — merge flag, above.
- **`abbrev-in-alt-headwords` / `abbrev-headword-stub`** — O00068's
  `שְׂ׳` display is an abbreviation stub, the only member of the 87 whose
  display is not a full word.

## Uncatalogued sibling

**Definition-side self-links: 2,657 occurrences / 2,151 entries.** No
catalogue row covers them. If the project ever rules that a self-link
should not render as a link, that is the population the ruling applies
to, and this row's 85 is 3.8% of it.
