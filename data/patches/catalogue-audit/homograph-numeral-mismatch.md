# Audit — `homograph-numeral-mismatch` (catalogued 538)

**Verdict: JUDGMENT.**

**THE DISPLAY IS THE AUTHORITATIVE SIDE. The row's name points the wrong
way, and so does the first number any reader will meet.** The display's
numeral is Jastrow's printed homograph numbering; the corpus lost its
numerals ENTRY-side. A stratified hand-read of 40 members finds the
display right in **26** and wrong in **0** (7 correct links, 1 entry-side
corruption, 6 undetermined). So this row is **not batch 3's either** — a
display-text fix would corrupt the only side that is reliably right.

**Read this before believing the counts.** The `data-ref` names an
existing headword in **576 of 576** cases and the display's numeral names
one in only **40 of 576** (exact pointing). That pair reads as "the
target always resolves, the display is corrupt" and it is wrong: what the
40-of-576 measures is the corpus's own entry-side numeral loss — Sefaria
rewrote homograph numerals as superscripts (`²`), stranded some inside
definitions, left others off entirely, and damaged a few headword strings
outright — so the member print names usually exists under a headword
carrying no Roman numeral for a lookup to match. §3 and §8.

The population reproduces exactly: **576 occurrences / 538 entries**.

No rule follows, because the repair is neither a display fix nor, in
practice, a retarget. **No mechanical rule can name the destination**:
the best family model scores 87.5% against 3,253 *known-correct*
controls, 40.1% of the catalogued population is already pointing where
print says, and gate case 2 can source the replacement target for 3.5%
of the candidate defects. Route to `judgment` with the count, the way
`homograph-numeral-blind-default` (1,358), `homograph-collapse-link`
(1,253) and `homograph-numbering-schism` (186) already went. The
`corpusCount` needs no correction.

Two recommendations for the catalogue, both evidenced below and neither
acted on here: **split the row in three** (§2, §7) and **fix the
entry-side shapes first** (§8) — 243 of the 345 candidate defects point
at a member the corpus has made unaddressable, so an entry-side repair
plus a resolver re-run shrinks this row without any anchor rule at all.

All measurement reads the tokenizer's anchor view (`html.ts` +
`links.ts`) over every field `fieldsOf` walks, never a flat regex —
anchors nest in both definitions and `language_reference` (the
`h-cognate-self-link` audit measured the pairs), and 21 of the 576 sit
in `language_reference`, which a definitions-only probe would miss.

## 1. The population reproduces exactly

```ts
// bun run — the whole predicate, nothing elided
const DISP = /(?:^|[\s־])(?<n>[IVX]+)\s*$/u;   // display ends in a Roman numeral
const ROM  = /\s(?<n>[IVX]+)$/u;               // target lemma carries one
for await (const e of readSourceEntries()) {
  for (const f of fieldsOf(e)) {
    if (typeof f !== 'string' || !f.includes('<a')) continue;
    for (const a of anchors(tokenize(f))) {
      if (!a.dataRef.startsWith('Jastrow, ')) continue;
      const lemma = a.dataRef.replace(/^Jastrow,\s*/u, '').replace(/\s+\d+$/u, '');
      const shown = DISP.exec(a.display)?.groups?.n;
      if (shown === undefined) continue;
      const targeted = ROM.exec(lemma)?.groups?.n ?? null;
      if (targeted === shown) continue;         // agrees — the control set
      record(e.rid, a);
    }
  }
}
// → { occ: 576, entries: 538, unusable: 0, byScope: { def: 555, langref: 21 } }
```

**576 occurrences / 538 entries.** The entry figure is the catalogued
`corpusCount` to the unit, and it matches round 1's own merge note
verbatim: *"one rule yields 576 anchors / 538 entries"*
(`docs/v2/discovery-round-1.md`). `unusable: 0` — none is `malformed`,
`interior` or unclosed, so the anchor view would accept every one and
both editors could touch them.

The reading is not fitted. Four independent spellings of "the display
ends in a Roman numeral" — a strict word boundary, `\b`, a
trailing-punctuation class, and "a numeral anywhere in the display" —
measure **576 / 576 / 594 / 576** occurrences; only the
trailing-punctuation variant moves, and all 18 of its extra occurrences
are outside `senses[].definition`, which measures 555 under every one of
the four. The brief's own sketch (`\b[IVX]+\s*$` over definitions only)
returns exactly that 555 — it silently drops the 21-occurrence
`language_reference` arm.

**Superscripts never appear in a display.** 0 of 73,468 Jastrow-targeted
anchor displays contain `¹²³⁴⁵⁶⁷⁸⁹` anywhere, let alone at the end;
headwords carry them (807 do) and `data-ref`s carry them, but the
printed display never does. So the display side of this row is a single
notation and needs no normalising.

## 2. The row is three defects, and they separate at the source figures

The description — *"disagrees with the numeral in its own `data-ref`"* —
is true of **195 of 576 (33.9%)**. The other 381 have no Roman numeral
in the `data-ref` at all. Splitting by what the target lemma carries:

| arm | occ | entries | target lemma ends in |
|---|---:|---:|---|
| `roman` | 195 | 187 | a DIFFERENT Roman numeral (`פִּילָא IV` under a display `פִּילָא I`) |
| `sup` | 277 | 262 | Sefaria's superscript disambiguator (`גִּזְרָא ²`) |
| `bare` | 104 | 96 | nothing (`שְׁתִיָּה`) |

(The arms' entry figures sum to 545 against 538 distinct entries — some
entries hold members of more than one arm.)

Those are not three readings of one shape; they are the three chunk
findings round 1 merged, recovered to the unit. Round 1's merge cell
names *"N `wrong-homograph-link` (340), O `homograph-numeral-mismatch`
(195), P `roman-numeral-orphan-display` (104)"* — and the `roman` arm is
**exactly** O's 195 and the `bare` arm **exactly** P's 104. The merge
was made on the ground that "all three compare a display's Roman numeral
against the numeral in the ref or target", which is true and is not
enough: the three arms have different defect rates (below), different
destinations, and two of them are mostly not defects.

## 3. The discriminator

**Which side names an entry that actually exists?**

```ts
// exact headword string, no normalisation
targetIsExistingHeadword  = 576 / 576   (100%)
displayNamesExistingEntry =  40 / 576   (6.9%,  exact pointing)
                          =  61 / 576   (10.6%, points stripped)
                          =  68 / 576   (11.8%, consonant skeleton + numeral value)
```

The exact-pointing figure reproduces round 1's own one-line summary of
this row — *"537 of 576 name a numeral that is no headword"* — to within
one occurrence (536 here; the difference is whitespace normalisation in
the display).

Read naively that is a display-fix verdict: the target always resolves,
the display almost never does. **The hand-read says the opposite, and
the reason the two disagree is the load-bearing finding of this audit.**
The display's numeral is Jastrow's print numbering. The corpus's
headword numbering is a lossy re-encoding of it, in at least four ways
all visible in the sample below:

- the numeral was rewritten as a **superscript** — `אוּרְיָא ²`, and the
  superscript numbers byte-identical headword STRINGS, not lemmas, so
  `אוּרְיָא ²` and `אוֹרְיָא ²` are two different families both numbered 2;
- the numeral was **dropped**, leaving the member bare — `נִיפְלָא`
  (print I) beside `נִיפְלָא II`;
- the numeral was **stranded in the definition** — U00488's headword is
  `שׁוּף` and its definition opens `I (b. h.; = נָשַׁף) to blow`; this is
  the catalogued `homograph-roman-stranded-in-definition` row (23);
- the headword string is **damaged** — B00098 is `"בַּד  V"`, with two
  spaces, which is why no lookup of `בַּד V` reaches it.

None of those is a fact about the display. Every one of them removes the
print numeral from the place a lookup would find it, which is precisely
what the 40-of-576 measures.

## 4. Hand-read, n = 40

Stratified, not random — 22 `roman`, 12 `sup`, 6 `bare`, and within
`sup` deliberately 8 value-disagreeing against 4 value-agreeing. **The
stratification over-samples the arms where a defect is likeliest, so the
65% defect rate below is an upper bound on the population rate**; §5
gives the population estimate, which is much lower. Every member was
read with its host context, its target entry's gloss, and its whole
corpus family.

| verdict | n | |
|---|---:|---|
| DEFECT — display right, target names the wrong member | 23 | destination exists |
| DEFECT — display right, no lawful destination | 3 | the member print names is absent from the corpus |
| CORRECT as linked | 7 | 5 where the target IS the member print names; 2 where the named entry is a redirect stub and the anchor resolves past it |
| ENTRY-SIDE defect, link semantically right | 1 | K00444 |
| UNDETERMINED | 6 | |

**26 of 40 (65%) are defects in which the DISPLAY is authoritative. 0 of
40 was adjudicated the other way — a defect in which the display's
numeral is wrong.** That is the answer to the acceptance criterion's
question, and it eliminates the display-fix branch: nothing here belongs
to batch 3. The nearest thing to a counter-example is K00444, whose
display numeral is unattested in the corpus while the target reads
semantically right; it is filed as entry-side because the corpus holds
`גִּיס II` twice (below), which explains the same bytes without a print
error, but a reader who prefers the other reading should note it is 1
of 40 either way.

Proof texts, each re-readable by rid:

- **B00211** `בּוּדְיָא` — *"(denom. of בַּד V) a mat of reeds"*, targeted
  at `בַּד IV` *"chosen, fine linen"*. `בַּד V` is *"single stalk,
  twig"*. The display is right and the destination is B00098, whose
  headword is `"בַּד  V"` — a double space, which is why the resolver
  could not reach it.
- **M00454** `מוֹחַ ²` — *"Ḥull. 45ᵃ, v. חַיְיתָא IV"*, targeted at
  `חַיְיתָא I` *"(adj.), v. חַי"*. The family is I, II, III and then
  H00750 `חַיְּיתָא` *"pouch, bag"* — whose own text cites Ḥull. 45ᵃ. The
  print's IV is the fourth member; the corpus left it unnumbered.
- **U00490** `שׁוּף II` — an anchor displaying `שׁוּף I` targeted at
  `שׁוּף II`, i.e. at the host entry itself. Print's `שׁוּף I` is U00488,
  whose headword is the bare `שׁוּף` because its numeral is stranded at
  the head of its own definition; with no addressable `שׁוּף I` the
  resolver landed on the only numbered member it could see.
- **K00444** `כְּזַז` — display `גִּיס I`, target `גִּיס II` *"intimate,
  familiar"*, which is what the context needs. The corpus holds C00773
  `גִּיס II` and C00774 `גִּיס II ²`: **two entries printed with the same
  numeral**, so one of them must be print's `גִּיס I` and the corpus
  headword is wrong. The link is right, the entry is mis-numbered, and
  no anchor-side rule can repair that.
- **U02003** `שָׂרַף I` — display `שְׁתִיָּה I`, target the bare
  `שְׁתִיָּה` U02099 *"(שָׁתָה I) drinking"*, which is the family's first
  member. **Correct link.** The whole `bare` arm looks mostly like this.
- **P00658** `עִיקּוּם` — display `סִיקוֹסִים II`, target `סִיקוֹסִים ²`,
  and the target's own text cites the same Gen. R. s. 41 the host does.
  **Correct link**; `II` and `²` are the same member in two notations.
- **E00639** `הֲמַר` — display `חַמְרָא I`, target `חֲמַר III`. H01227
  `חַמְרָא` is itself a redirect stub, *"wine, v. חֲמַר III"*. The anchor
  resolves past the stub to the substantive article. **Correct**, and a
  shape no numeral predicate can see.
- **B01327** `בַּרְקִית` — display `בַּרְקָא I`, target `בְּרַק III`
  *"lightning"*. The corpus holds `בַּרְקָא II` and `*בַּרְקָא III` and
  **no** `בַּרְקָא I`. A defect with nowhere lawful to point.

## 5. Null models

**(a) The resolver is not slipping — it is deciding.** For each member,
the distribution of targets over every corpus anchor sharing its display
string (points stripped):

```
soleReading      561 / 576  (97.4%)  the display string resolves to ONE target corpus-wide
majorityElsewhere  9 / 576  (1.6%)   some other target is the plurality reading
minorityOfOne      3 / 576
onlyOccurrence   138 / 576            the display string occurs once in the corpus
```

So these are systematic resolutions of a display, not one-off misfires;
a "retarget to the majority reading" rule would have **9** members.

**(b) A positional family model, scored on knowns.** The obvious
destination rule is "the display's numeral names the Nth member of the
target's family, in corpus order". Scored not on the row but on the
**control population — the 3,253 anchors whose display numeral AGREES
with the target's Roman numeral, i.e. the links this row's own predicate
calls correct**, where the right answer is known:

| family grouping | predicts an entry | reproduces the known target |
|---|---:|---:|
| consonant skeleton | 3,197 / 3,253 | **1,808 (55.6%)** |
| pointed headword base, numeral stripped | 3,030 / 3,253 | **2,847 (87.5%)** |

The better model is wrong once in eight on links that are already
right. A retarget rule built on it would move roughly 40 of the 345
candidate defects to a *second* wrong entry, and nothing downstream
would catch it: `link-target.ts` checks provenance, never correctness.

**(c) 40.1% of the population is already correct.** Under that same
model (preferring, where it exists, the family member whose headword
carries the Roman numeral the display shows):

| arm | n | current target IS the member print names |
|---|---:|---:|
| `roman` | 195 | 17 (8.7%) |
| `sup` | 277 | 132 (47.7%) |
| `bare` | 104 | 82 (78.8%) |
| **total** | **576** | **231 (40.1%)** |

The direction agrees with the hand-read (`bare` and value-agreeing `sup`
members are mostly correct links; the `roman` arm is mostly defective)
and the magnitude corrects it, which is exactly what a stratified sample
should be corrected by. **Any rule that unlinks or retargets the whole
row destroys a correct link four times in ten.**

**(d) Gate case 2 cannot source the replacement.** For each candidate
defect, is the destination already an anchor target somewhere in the
host entry's own input?

```
candidate defects (destination differs from current target)   345
  destination reachable in the same entry                      12  (3.5%)
```

Tasks 5 and 6 both became unlink rules on a 28.3% reachability
measurement. This is 3.5%. Under the maintainer ruling of 2026-08-23
that would argue for unlinking — see §6 for why that is refused too.

## 6. Falsifiers, and what was tried

- **"The `data-ref` is right and the display is corrupt" (the batch-3
  re-file).** REFUTED by the hand-read: 0 of 40 members has a wrong
  display numeral, and 26 have a right one against a wrong target. The
  100%-of-targets-resolve figure that suggested it is an artefact of the
  target being, by construction, a string the corpus contains.
- **"The display's numeral is not a homograph numeral at all"** (the
  task's own suggested check — a swallowed citation numeral, an
  `<i>`-run remnant, a `latin-token-inside-rtl-span` artefact). NOT
  SUPPORTED. In all 40 read the numeral is the homograph numeral of the
  lemma the display names; 386 of 576 targets share the display's
  consonant skeleton outright, and the numeral distribution (I 1,233 /
  II 1,393 / III 215 / IV 29 / V 1 in headwords) matches the display
  side's shape.
- **"The display's numeral names a DIFFERENT existing entry, so the
  retarget has a determinable destination"** (the task's second check).
  TRUE FOR A MINORITY, and the minority is not separable: 68 of 576 by
  skeleton + numeral value, 92 of the 195-member `roman` arm if the
  destination is built from the TARGET's base rather than the display's.
  For the rest the member print names exists under a headword carrying
  no Roman numeral (§3) or does not exist at all (B01327, G00471,
  Q01327 in the sample), and telling those two apart needs the model in
  §5(b), which is 87.5%.
- **"Unlink the `roman` arm"** — the sharpest surviving option, and it
  is declined rather than overlooked. The predicate is purely syntactic
  (display Roman ≠ target Roman, no model), it covers 195 occurrences /
  187 entries, and 178 of the 195 are not already pointing where print
  says. But the 22 `roman` members read here are **18 defect / 1 correct
  / 1 entry-side / 2 undetermined** — 82%, against the ~100%-after-
  exclusions standard `geresh.ts` and `misc-links.ts` set in this batch.
  The two known non-defects have no syntactic separator: a redirect-stub
  target (E00639) reads identically to a mislink, and corrupt entry-side
  numbering (K00444, where the corpus prints `גִּיס II` twice) is
  invisible from the anchor. An enumerated exception list would have to
  carry both, which the loud-on-drift ruling permits only when a
  syntactic predicate has been tried and named — it has, and it does not
  exist here. Recorded as the crisp review-queue core, not written.
- **Overlap with the siblings.** Disjoint from
  `homograph-numeral-blind-default` (1,358) **by construction** — that
  row's predicate is a display with NO numeral, this one requires one —
  and from `post-anchor-numeral-mismatch` (91), which owns the numeral
  sitting after `</a>`; that row records the entry overlap as 3 of 91.
  The `sup` arm sits on the same superscript mechanism
  `homograph-numbering-schism` audited, and 7 of the 576 are self-links,
  the shape `h-cognate-self-link` withdrew on.

## 7. RECOMMENDED: split the row in three

Recorded here so Task 11 can carry it to the catalogue; not acted on in
this task, the way `h-cognate-self-link` recorded its merge flag rather
than merging. The merge of round 1 put three chunk findings under one id
on the ground that all three compare a display numeral against a target,
and the three behave differently on every axis that matters:

| proposed row | occ / entries | defect rate | the repair it would need |
|---|---:|---:|---|
| `homograph-numeral-mismatch` (roman arm, keeps the id and the description, which is literally true only here) | 195 / 187 | 178 of 195 not already correct; 82% defect on 22 read | retarget to a print-named member, mostly unaddressable — REVIEW QUEUE |
| `homograph-numeral-vs-superscript` (new) | 277 / 262 | 145 of 277 | mostly a NOTATION difference: 132 are already correct, and the rest turn on the superscript numbering byte-identical strings rather than lemmas — belongs beside `homograph-numbering-schism` |
| `roman-numeral-orphan-display` (new — chunk P's original id and its original 104) | 104 / 96 | 22 of 104 | mostly CORRECT links to a family's first member; the residue is the same review queue |

The entry figures sum to 545 against 538 distinct entries, so a split
must record the overlap; `corpusCount` for the parent stays an entry
count either way.

## 8. RECOMMENDED: the entry-side rows are upstream

**243 of the 345 candidate defects (70.4%) name a member whose corpus
headword carries no Roman numeral at all** — there is nothing for a
lookup of `<base> N` to match, which is why the resolver picked a
sibling. Repairing the entry side and re-running the resolver therefore
fixes a large share of this row with no anchor rule at all, and it is the
cheaper order of work. Four shapes, with counts:

| shape | count | status |
|---|---:|---|
| numeral stranded at the head of the definition while the headword carries none (`שׁוּף` + `I (b. h.; = נָשַׁף) to blow`, U00488) | 23 | catalogued — `homograph-roman-stranded-in-definition`, route `transform` |
| numeral rewritten as a superscript disambiguator | 807 headwords | catalogued — the mechanism `homograph-numbering-schism` audited |
| **two entries printed with the SAME numeral**, distinguished only by a superscript: `גִּיס II` + `גִּיס II ²` | **6** — A00015 `אָב II ²`, B00383 `בּוּרְסִי II ²`, B00779 `בְּכִי I ²`, B01201 `בְּרוּנָא I ²`, C00774 `גִּיס II ²`, O01369 `סְפִיקוּלָא I ²` | **UNRECORDED**; one member of each pair must be print's previous numeral, so the headword is wrong and no anchor-side rule can see it |
| **one entry standing for two print members**, its headword naming both: `אוּרְיָה  I, II` | **6** — A00883, A02356, B00407, D00844, E00508, G00675 | **UNRECORDED**; no display numeral can ever match these, by construction |
| **stray double space inside the headword** — B00098 `"בַּד  V"`, the 7th and last double-space headword and the only one that is not the shape above | **1** | **UNRECORDED**; a one-character repair that makes `בַּד V` addressable again |

The last three are new findings from this audit, not previously
catalogued anywhere.

## 9. What the catalogue should say

- `route`: `transform` → **`judgment`**. There is no rule.
- `corpusCount`: **unchanged at 538**, which reproduces exactly as an
  entry count (576 occurrences).
- `reason`: written, carrying the arm split, the discriminator, the two
  null models and the declined unlink arm.
- `registry.ts`: the id leaves `PENDING`; `coverage().total` goes 79 →
  78 and the assertion in `registry.test.ts` moves with it, as it did
  for `h-cognate-self-link`.
- **For Task 11, two carried recommendations, neither acted on here:**
  the three-way split of §7, and the three unrecorded entry-side shapes
  of §8 (6 duplicate-numeral headwords, 6 headwords naming two print
  members, 1 double-space headword) — which want rows of their own,
  since 243 of the 345 candidate defects here exist because the member
  print names is unaddressable.

Batch 2 therefore lands **11 rows / 1,256 instances** rather than 12 /
1,794 — the outcome §6 of the design doc anticipated, reached for the
opposite reason from the one it guessed: not because the `data-ref` is
right, but because the display is right and the corpus has no
addressable place to send it.
