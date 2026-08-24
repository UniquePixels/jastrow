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
// display/headword compared after collapsing internal whitespace:
//   norm = (s) => s.replace(/\s+/gu, ' ').trim()
targetIsExistingHeadword  = 576 / 576   (100%)
displayNamesExistingEntry =  40 / 576   (6.9%,  exact pointing)
                          =  61 / 576   (10.6%, points stripped)
                          =  68 / 576   (11.8%, consonant skeleton + numeral value)
```

**The 40 is the whitespace-normalised reading; the raw-string reading is
39.** The one member between them is B00211's `בַּד V` against B00098's
headword `"בַּד  V"` — the double-space defect of §8, which is exactly
the kind of member the comparison should not lose. Both readings are
stated wherever this figure is used below.

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
calls correct**, where the right answer is known. The model is code, not
prose, because a prose model is not reproducible — a review
re-implementing this paragraph from its previous description scored
90.2% / 56.6% rather than the figures below, and the gap was in how the
family key was built, so here is the key:

```ts
const POINTS = /[֑-ׇ]/gu;
const NONLETTER = /[^א-ת]/gu;
const BASE = /(?:\s+[IVX]+|\s*[¹²³⁴⁵])\s*$/u;          // numeral or superscript
const skel = (s) => s.replace(POINTS, '').replace(NONLETTER, '');
const base = (s) => s.replace(BASE, '').trim();        // POINTING KEPT

// families are built over every headword in corpus order, then:
const modelA = (lemma, n) => (famSkel.get(skel(lemma)) ?? [])[n - 1];
const modelB = (lemma, n) => (famBase.get(base(lemma)) ?? [])[n - 1];
// scored: prediction exists && prediction.rid === the anchor's current target
```

| family grouping | predicts an entry | reproduces the known target | of those predicted |
|---|---:|---:|---:|
| A, consonant skeleton | 3,197 / 3,253 | **1,808 — 55.6%** of 3,253 | 56.6% |
| B, pointed base, numeral stripped | 3,030 / 3,253 | **2,847 — 87.5%** of 3,253 | 94.0% |

Both denominators are given because both are defensible and the review
used the second for model A: a rule that DECLINES when the model
predicts nothing errs on 12.5% of the population (model B), while the
model itself, asked only where it will answer, errs on 6.0%. **The
conclusion is the same under every one of the four figures** — the best
reading still misdirects one known-correct link in seventeen, and a
retarget rule cannot tell which seventeenth it is.

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

**(e) Gate case 3 declines all 576, and the reason is the sense
number.** The acceptance criterion says case 2 **or 3**, and case 3 —
work copied whole from an input target, locus assembled from the
anchor's own display — is the natural path here, since the display
spells the numeral the repair wants. It fails on a character the display
never carries. Run through the gate's OWN `commonPrefix` and
`absentFrom` (copied verbatim out of `link-target.ts`), over the most
favourable compose available to every member — source is the anchor's
own current target, only the numeral changes, the sense number is kept:

```ts
const senseNumber = /\s(\d+)$/u.exec(a.dataRef)?.[1] ?? '1';
const proposed = `Jastrow, ${lemma.replace(ROM, '')} ${shown} ${senseNumber}`;
const remainder = proposed.slice(commonPrefix(a.dataRef, proposed).length);
absentFrom(remainder, a.display);            // → true for every member
// → { members: 576, displayHasDigit: 0, composeWouldPass: 0 }
```

**0 of 576.** The remainder always ends in the sense number (`" 1"`),
and **0 of 576 displays contain an ASCII digit at all** — Jastrow prints
`בַּר I`, never `בַּר I 1`, because the sense number is Sefaria's
addressing, not print's. So the remainder is never a sub-multiset of the
display and case 3 reports a fabrication, correctly.

Case 4 does not rescue it either: recombination would need a second
input target contributing the suffix `"I 1"`, and the tightening of
2026-08-24 requires that tail's discarded prefix to be a prefix of the
head — `Jastrow, אָדָא ` is not a prefix of `Jastrow, בַּר IV 1`, so any
such pairing is rejected on the work rather than licensed.

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
  TRUE FOR A MINORITY. **An earlier version of this audit said that
  minority "is not separable"; that was wrong, and a reader could
  disprove it in one query.** It conflated two different sets. The
  skeleton+value 68 genuinely is unseparable — skeleton matching pools
  distinct vocalizations. But **string identity is a different and
  perfectly crisp test**, and §6a below measures it. What remains true
  of everything OUTSIDE that subset: the member print names exists under
  a headword carrying no Roman numeral (§3, §8) or does not exist at all
  (B01327, G00471, Q01327 in the sample), and separating those two needs
  the model in §5(b).
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

## 6a. The one separable subset: display string IS a headword

Measured after review, because §6's "not separable" claim did not
survive contact with the obvious query:

```ts
// the display string, whitespace-collapsed, IS some entry's headword
const norm = (s) => s.replace(/\s+/gu, ' ').trim();
hwIndex.has(norm(anchor.display))
// → 40 occurrences / 37 entries   (39 / 36 on raw strings, §3)
```

**40 occurrences / 37 entries, and all 40 sit in the `roman` arm.** The
destination needs no model at all — it is the entry whose headword the
display already spells. Two properties make it the crispest thing in
this row:

- **It is one systematic resolver shape. All 40 target a member
  numbered IV** — `בַּר I`→`בַּר IV` (9), `עוֹנָה I`→`עוֹנָה IV` (7),
  `אָדָא I`→`אָדָא IV` (3), `נִיר I`→`נִיר IV` (3), `קוּץ I`→`קוּץ IV`
  (3), `דּוּרָא I`→`*דּוּרָא IV` (2), and eleven more families the same
  way. Whatever the resolver did here, it landed on the family's
  IV-numbered member; two of these fell into the review's independent
  random draw and both read as clear defects.
- **The destinations are substantial articles, not stubs.** Definition
  length across the 40: min 19, median 633, max 2,845 characters; 1 of
  40 is under 40 characters. The rejection argument offered in review —
  that B01152 `בַּר I` "has an EMPTY definition", so these retargets
  would point at stubs — **is refuted by the bytes**: B01152 carries
  three senses and 1,901 characters. What looks empty is its first
  sense, `[empty, open]` — Jastrow's bracketed gloss giving the root's
  reconstructed MEANING ("empty, open"), which is the sense `בַּר I`
  exists to record, not an absent field.

**It is still not a batch-2 rule, and the reason is the gate: 0 of 40
are reachable under case 2** — no member's host entry holds an anchor to
the destination anywhere in its own input — and §5(e) shows case 3
declines all 576 on the sense number. Zero of forty, not a low fraction:
there is nothing to write.

So the disposition is neither "reject" nor "write it": **hand it to Task
11 as a candidate row**, `homograph-numeral-iv-default`, 40 occurrences
/ 37 entries, destination determined by string identity, blocked only by
provenance. It is the one part of this row a future batch could repair
mechanically the moment the gate can source a target the corpus proves
some other way. The route of the parent row does not change.

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
sibling. This is the figure most likely to be acted on, so here is the
predicate that produces it, and the other defensible reading of it:

```ts
// candidates = members whose print-named destination is not already the
// current target (345). `p` is model C: the family member whose headword
// carries the display's Roman numeral if one exists, else the positional
// pick from the pointed-base family of §5(b).
if (p !== undefined && p.rid === currentRid) continue;   // already correct
cand++;
if (p === undefined) { destUnknown++; continue; }        // 28
if (!/\s[IVX]+$/u.test(p.hw)) unaddressable++;           // 243
// → { cand: 345, destKnown: 317, unaddressable: 243 (70.4% of 345),
//     unaddressable + destUnknown: 271 (78.6%) }
```

**243 of 345 (70.4%)** counts only destinations the model could name;
folding in the 28 whose destination it could not name — which are
unaddressable a fortiori — gives **271 of 345 (78.6%)**, which is the
reading a review independently arrived at (as 273). Both say the same
thing: the entry side, not the anchor side, is where most of this row
comes from. A stricter variant that also excludes superscript-carrying
destinations measures 223. Four shapes, with counts:

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
- **For Task 11, three carried recommendations, none acted on here:**
  the three-way split of §7; the candidate row of §6a
  (`homograph-numeral-iv-default`, 40 occurrences / 37 entries, all
  targeting a IV-numbered member, destination determined by string
  identity, blocked only by provenance); and the three unrecorded
  entry-side shapes of §8 (6 duplicate-numeral headwords, 6 headwords
  naming two print members, 1 double-space headword) — which want rows
  of their own, since 243 of the 345 candidate defects here exist
  because the member print names is unaddressable.

Batch 2 therefore lands **11 rows / 1,256 instances** rather than 12 /
1,794 — the outcome §6 of the design doc anticipated, reached for the
opposite reason from the one it guessed: not because the `data-ref` is
right, but because the display is right and the corpus has no
addressable place to send it.

## 10. Delta — revision of 2026-08-24, after review

The review re-derived the population independently, drew 20 members by a
hash-ordered draw with no reference to the sample in §4, and read each in
context: **0 of 20 has a wrong display numeral**, roman-arm defect rate
8 of 10. The inversion in the verdict block is therefore confirmed by a
second, differently-drawn sample. Everything else reproduced to the
digit. Five findings, all answered here:

1. **§6's "not separable" was wrong** — string identity separates 40
   occurrences / 37 entries cleanly. Corrected in §6, measured in the new
   **§6a**, and handed to Task 11 as a candidate row rather than written:
   the gate reaches 0 of 40. The rejection argument offered in review —
   B01152 `בַּר I` having an empty definition — is refuted in §6a; the
   rejection stands on the gate instead.
2. **Gate case 3 was never measured**, though the acceptance criterion
   said "case 2 or 3". Now **§5(e)**, run through the gate's own
   `commonPrefix`/`absentFrom`: 0 of 576 pass, because the remainder
   always ends in the sense number and 0 of 576 displays contain a digit.
   Case 4 addressed in the same place.
3. **§8's 243 of 345 had no published query.** Added, with the second
   defensible reading (271 of 345, 78.6% — the review's 273) and a
   stricter variant (223).
4. **§5(b)'s model was prose-only** and did not re-implement to the same
   score. The family key is now inlined as code, with both denominators
   (55.6% / 56.6% for model A, 87.5% / 94.0% for model B).
5. **§3's 40 is the whitespace-normalised reading**; the raw-string
   reading is 39, and the member between them is B00211/B00098, the
   double-space headword of §8. Both stated.

The pattern in 3 and 4 is worth naming rather than just fixing: **the
two figures that did not reproduce are exactly the two that were
described in prose instead of published as code.** Every number in this
audit now carries the query that produces it, which is the house
standard those two had quietly dropped.
