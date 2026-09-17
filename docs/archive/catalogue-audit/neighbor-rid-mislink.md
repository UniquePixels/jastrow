# Audit — `neighbor-rid-mislink` (catalogued 655)

**Verdict: RE-SCOPE to 124 occurrences / 109 entries — and RETIRE the
±1 predicate.** The flag is confirmed with a null model: **49.9% of
base→emphatic entry pairs in this dictionary are alphabetically adjacent
by construction**, with no reference to links at all. Adjacency is a
property of Jastrow's page layout, not of its hyperlinks.

## Probe and raw figure

```python
skel = lambda s: ''.join(HEB.findall(DIA.sub('', TAG.sub('', s))))
# keep anchors where skel(display) != skel(target headword)
#   BUT skel(display) == skel(headword) of some other entry  -> candidates
# pick R among candidates (tie-break), distance = |rid(R) - rid(T)| within a letter block
```

| Stage | Count |
|---|---|
| `refLink` anchors, all kinds | 164,330 |
| with a `Jastrow, …` data-ref | 67,639 |
| resolvable to an entry | 67,559 (80 unresolvable, all gershayim-truncated) |
| display contains no Hebrew | 5,128 |
| skeleton-**consistent** | 52,569 |
| skeleton-**diverging** | 9,862 |
| skeleton-matched-but-diverging (the row's base population) | **2,808 occ / 2,342 entries** |
| **at ±1, nearest-match tie-break** | **518 occ / 477 entries** |
| at ±1, first-match tie-break | 465 occ / 429 entries |

**None of the four published variants could be reproduced.** The row
cites a base of 1,531 skeleton-matched-but-diverging anchors; this probe
gets 2,808. It cites ±1 entry counts of 655 / 559 / 630 / 691; this gets
477 (nearest) and 429 (first). Every published variant sits 17–45% above
these and none is within plausible reach of the definition. **This makes
a fifth incompatible number rather than a tie-break to choose among
four.** Discrepancy reported; 655 not adopted.

The **shape** does reproduce. Nearest-match distances 1–5:
`518 / 102 / 48 / 45 / 34`. And the spike is not a tie-break artifact —
restricting to the 1,009 anchors with **exactly one** candidate, so no
tie-break is possible, gives `301 / 51 / 18 / 17 / 13`, still a 5.9×
step from 1 to 2.

## Does this population have more than one job? — at least five

| Job | Occ | Share | Verdict |
|---|---:|---:|---|
| **A. Self-link** — display is an inflected/feminine/emphatic form of the *source entry's own* headword and the data-ref points back at the source; the ±1 neighbour is an unrelated homograph | 35 | 6.8% | **CONVENTION** |
| **B. Abbreviation artifact** — display is geresh-truncated (`גִּלְדָּ׳`, `קוּשְׁטָ׳`); its skeleton coincides with an unrelated shorter headword purely because the geresh was stripped. The link is correct | 31 | 6.0% | **CONVENTION** (geresh-abbrev rows) |
| **C. Reciprocal partner** — candidate R cross-references the source entry and the resolved target does not | 45 | 8.7% | DEFECT-leaning (~50% on reading) |
| **D. Aramaic emphatic/determinate state** — `ds == ts + א`; display shows `עַמְרָא`/`כַּלְבָּא`/`תּוֹרָא` and the link goes to the absolute-form base entry. The ±1 neighbour is a *homograph of a different word* (`עָמְרָא` "v. עימרא", `כַּלְבָּא II` Ben Kalba Sbua, `תּוֹרָא II` "row, border") | **209** | **40.3%** | **CONVENTION** |
| **E. Residual** — further emphatic ה↔א alternations, unvocalized displays, homograph-numeral cases | 198 | 38.2% | mixed |

### The decisive measurement — a link-blind null model

Class D's adjacency is **structural**. For every entry X in the corpus
with any sibling entry whose skeleton is X+א, the audit measured where
that sibling actually sits, with no reference to links at all:

```
distance 1..9+ :  2104 / 962 / 543 / 295 / 156 / 73 / 36 / 16 / 30   (n = 4,215)
share at distance exactly 1: 49.9%
```

**Half of all base→emphatic pairs in this dictionary are alphabetically
adjacent by construction.** So for the 335 emphatic-state anchors in the
diverging population (255 at ±1), a fully **correct** link produces a ±1
hit half the time on the null alone. The ±1 predicate carries roughly
one bit of information in the largest single class of the population,
and none of it is about link quality.

**The sign distribution confirms the layout hypothesis directly: 449 of
518 (86.7%) have R = T + 1** — the entry matching the display is printed
*immediately after* the entry actually linked. Under the strict variant
below the asymmetry is **76 of 76, 100% at +1**. That is Jastrow's
typographic convention — variant/emphatic/feminine stub printed right
after its base — not an off-by-one in a resolver, which would have no
reason to prefer one direction.

## Sample read

`random.seed(N); random.sample(population, k)` over the full ±1 list, no
filtering. **44 members read** across three populations. Primary draw
(seed 42, k=10, full 518-member population) in full:

| rid | headword | display → data-ref | Verdict |
|---|---|---|---|
| G00054 | זָג | `זוֹג` → `זוֹגָא` | CONVENTION/FP — the ±1 candidate `זוּג ²` "to be clear" is semantically impossible |
| A03163 | *אַרְלָא | `עַרְלָא` → `עָרֵל ²` | CONVENTION — emphatic; R is a feminine homograph |
| N00329 | נַוְולָה | `נַוְולָא I` → `נְוַול ³` | CONVENTION/FP — display names `נַוְולָא I`, which does not exist; the tie-break grabbed the proper name `נַוְולָא II` |
| M00416 | מוֹדָנָא | `אוּדְנָא` → `אוֹדֶן` | CONVENTION — "denom. of אוּדְנָא … scale"; R is "leather-bottle" |
| M02357 | מֵצַר ² | `פַּלְגָּא` → `פְּלַג II` | CONVENTION — target's own entry quotes the identical locus |
| I00166 | טוּלִימוֹתָא | `טוּלָּא` → `טוּל II` | CONVENTION — emphatic of "shade"; R is "rag tied round the finger" |
| C00723 | גֶּילֶד | `גִּלְדָּ׳` → `גִּלְדָּא` | CONVENTION — geresh-stripping artifact |
| D00439 | דַּחֲקוּתָא | `דַּחְקָא` → `דְּחַק II` | CONVENTION — R is the agent noun "oppressor" |
| S02234 | קַשְׁטָנִית | `קוּשְׁטָ׳` → `קוּשְׁטָא` | CONVENTION — abbreviation matches target verbatim |
| **B00045** | בָּארַג | `בַּרְקָא` → `בְּרַק III` | **DEFECT** — "dial. for בַּרְקָא", and R names the source entry back; the link goes to the noun "lightning" instead |

**1 defect in 10.** A second draw of 8 (seed 7) gave 2 clear defects —
P00571 `עִילָה` (`עילא` "pretext" linked to `עִיל` "foal" instead of
`עִילָא II`) and B01053 `בָּעַל` (`בִּיאָה` linked to `בִּיָּא` = Greek
*via* "highway" instead of `בִּיאָה II` "coming in") — plus 5
conventions and 1 ambiguous.

Combined over 18 read from the unfiltered ±1 population: **3 DEFECT,
3 AMBIGUOUS, 12 CONVENTION — ~17% defect rate** (binomial 95% CI ≈
4–41%). Same failure mode and roughly the same magnitude as
`same-anchor-positional-mislink`'s ~15%.

## Letter A

**Present, under-represented.** A is 10.63% of the corpus. ±1
population: **30 occ / 28 entries** of 518 / 477 = **5.8%**, about half
the expected share. Strict subset: 7 of 76 (9.2%). Reciprocal subset:
14 occ / 12 entries of 124 / 109 (11.3%). One letter-A member is a
confirmed defect — **A02796** `אֶפְרָא II`, "a foolish son אפרא is ashes
in the eyes of his mother", linked to `אֲפַר ²` (the Targum
"reeds/flags" word) when the sense is the source entry's own "ashes".

## Disposition

**RE-SCOPE to the reciprocity subset, and drop the ±1 predicate.** Two
tighter definitions were built and measured:

**(a) Strict headword identity** — the display, *with* its pointing,
equals R's headword verbatim (homograph numerals honoured, abbreviated
displays excluded). Drops 518 → **76 occ / 74 entries**, sign 76/76
at +1. Reading 18: **6 DEFECT, 1 AMBIGUOUS, 11 CONVENTION** (~33%).
Still minority-defect; survivors are dominated by emphatic-state links
to a base entry that happens to precede an unrelated `II` homograph.

**(b) Reciprocity — the only predicate that actually tracked defects.**

```python
src_skel = skel(source.headword)
keep = (len(src_skel) > 2
        and src_skel in hebrew_token_skeletons(R)
        and src_skel not in hebrew_token_skeletons(T)
        and not geresh_in(display))
```

**124 occurrences / 109 entries** across all distances (47 at ±1, 59 at
distance ≥9, 25 with R == the source entry itself). Reading 8:
**4 DEFECT, 1 AMBIGUOUS, 3 CONVENTION** — ~50%, the best precision
reached. Confirmed members: P00571; V00456 (`תֵּימַהּ`: own textual
variant `תֵּימָה` linked to `תֵּימָא`, a bird); R00739 (`צְרֵדָה`: own
variant linked to `צְרָדָא II`, a vertigo-demon); A02796; and from the
strict draw H01109 (`חָלַץ` part. pass. `חֲלוּצָה` → the *place*
Ḥalutsa), G00323 (`זִיזָא I` variant `זִיוָא` → the month Ziv), R00713
(`צְפַר II` → `צְפִירָא II` "she-goat"), R00263 (warrant `פְּתִיחָא` →
`פְּתִיחַ` "open-eyed"), U01088 (`= h. שִׁירָה` "song" → `שִׁירָא ²`
"silk").

**55% of subset (b) sits at distance ≥3.** The defect signal is semantic
reciprocity, not adjacency, and the two are nearly orthogonal. **A
Phase 2 transform keyed to ±1 would miss most real defects while
rewriting hundreds of correct emphatic-state links.**

New description: *skeleton-matched-but-diverging Jastrow anchor whose
skeleton-matching candidate entry R cross-references the containing
entry while the resolved target does not; 25 of the members are ones
where R is the containing entry itself. Not a rid-adjacency pattern —
47 at ±1, 59 at distance ≥9. Precision ~50%; every member needs
sense-level adjudication before rewrite.*

## What would have falsified this

Three findings were set in advance as grounds to confirm the row:

1. **A defect rate above ~70% in the ±1 population.** Looked for by
   reading 18 random members unfiltered. Found 3/18. Not met.
2. **A ±1 concentration that survives a link-blind null.** The null was
   built explicitly: every entry X with an X+א sibling, distance to that
   sibling, no anchors involved. Had it come back flat — say 10% at
   distance 1 — the spike would have been a genuine anomaly demanding a
   defect explanation. **It came back at 49.9%.** Not met.
3. **A direction-neutral spike.** A genuine off-by-one in a resolver has
   no reason to prefer +1 over −1. Measured 449:69 in favour of +1
   (100:0 in the strict subset). That asymmetry is the signature of
   printed layout. Not met.

The reverse risk — a row measured too *low* — was also checked: the base
population is 2,808 against the row's 1,531, so the underlying
measurement is if anything under-counted. But the excess lands in the
same convention-heavy classes, so it does not rescue the count.

**Could not determine:** whether the 198-member residual class E
contains a coherent further job. Sampled only incidentally; members
split between emphatic ה↔א alternations, unvocalized displays and
genuine one-consonant confusions. **Worth a separate look.**

## Overlap

**222 of the 518 ±1 occurrences (42.9%) are already claimed by at least
one other row:**

| Row | What it claims | Count |
|---|---|---:|
| `homograph-numeral-mismatch` (538) | display carries a Roman numeral the data-ref does not match | 78 (15.1%) |
| `homograph-collapse-link` (1,253) | display fully unvocalized, skeleton shared by ≥2 vocalized headwords | 68 (13.1%) |
| `plural-inflection-anchor-escapes-entry` (1,417) | display equals a declared inflected form of the source entry — **the row that raised the audit flag, and it owns Class A outright** | 60 (11.6%) |
| geresh-abbrev family | Class B in full | 33 (6.4%) |

Further, unquantified: `corrigendum-reading-linked` (330) covers G00323,
where the linked form is an editorially-marked variant reading;
`dataref-skeleton-absent` (2,572) is the complement of this base
population; `interior-consonant-mislink` (495) and
`unnumbered-terminal-homograph` (129) both cut through class E.

After removing the four overlapping classes, this row's exclusive claim
on the ±1 population is 296 occurrences, of which — on the null model
and the reading — the large majority are the Aramaic emphatic-state
convention.
