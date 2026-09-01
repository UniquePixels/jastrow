# Audit — `unlinked-v-span` (796 catalogued, 849 measured)

**NOT YET RULED.** This records the measurement; the disposition below
is a recommendation awaiting Brian.

The row is from discovery round 0 and carries **no `reason` field at
all** — it is the only row in batch 9 with nothing but a one-line
description, so everything here is measured from scratch.

## The row

> unlinked `v. <span dir=rtl>` cross-references the linker never
> anchored.

## Population, and the null model the row never had

Over all 32,512 entries after `applyRepairs`, every `v.` followed by an
RTL span, counting both shapes — anchored (`v. <a …><span dir="rtl">`)
and bare (`v. <span dir="rtl">`):

```text
ANCHORED 2,990   BARE 849   total 3,839
ambient link rate 77.9%
the 849 bare spans fall in 816 entries
```

**77.9% is the null model this row needed and did not have.** The bare
spans are a real minority failure, not the ambient rate — the opposite
of the never-linked rows, where the rate is 0% and the mechanism is a
missing work name.

A first cut of this measurement was vacuous and is worth recording:
matching only `v\.\s*<span` finds bare spans BY CONSTRUCTION, since an
anchored one has the `<a>` in between. It reported `0 anchored, ambient
rate 0.0%` — a number that could not have come out any other way.

## The target vocabulary is fully attested — this is not arm A

Of the 2,990 anchored controls, resolved by their `data-ref`:

```text
target is a Jastrow self-link   2,990
target is another work              0
```

Every single one points back into this dictionary. So a rule here would
mint an anchor whose work name (`Jastrow, …`) is attested 2,990 times
over in exactly this construction. The `never-linked-works.md`
objection — that no corpus gate can witness the minted work name — does
**not** apply.

## What blocks it is the LOCUS again, in a different disguise

Headwords are vocalized; these spans mostly are not. Matching on
consonantal skeleton, and collapsing trailing homograph numerals so
`חוּד II` reaches `חוּד`:

| Bucket | Count |
|---|---:|
| geresh abbreviation — a different family's row | 159 |
| skeleton → **exactly one** entry | **43** |
| skeleton → several entries (homographs) | 347 |
| skeleton → no entry in the dictionary at all | 300 |

The 300 are genuinely absent, not a matcher artifact. Spot-probed with
their nearest neighbours: `אֲחִיזָה`, `אָחוּז`, `אִיסְתּוֹמְכָא`,
`הָגְדָּס`, `שמאבר` each return **0 entries** at their skeleton, with
plausible near-neighbours present (`אֲחִידָה I`, `אַחְוָה`, `אִיסָא`,
`הַגָּדָה`, `שֶׁמָּא`). Jastrow points at forms he did not head.

## The corpus cannot disambiguate the 347 either

The anchored controls looked like they might supply a resolution
mechanism: **2,671 of 2,990 (89%) resolved a display skeleton that has
several candidate entries**, so the ambiguity is routinely settled
somewhere. Building the witness table that would copy it — every
display skeleton the corpus anchors to a `Jastrow` target, from every
anchor rather than just `v.` spans — gives 1,149 distinct skeletons,
and against the 690 non-geresh bare spans:

```text
witness: ONE target, unanimous     4
witness: SEVERAL targets, split   16
NO witness anywhere in the corpus 670
```

**670 of 690.** The anchored spans and the bare ones are largely
disjoint vocabularies, which is itself the explanation: the words that
went unlinked are the rare ones. The witness mechanism covers 4 cases.

## Recommendation

**Re-scope to 43 and withdraw the rest to `judgment`**, joining the
Phase 4 linker item — or withdraw all 849 and let the linker take the
row whole.

The recommendation is to withdraw whole, for the same reason as
`midrash-petichta.md`: 43 of 849 is 5%, the 159 geresh cases belong to
a family the catalogue already tracks, and the 347 ambiguous ones need
precisely the homograph disambiguation that
`homograph-numbering-schism` (186) already sits in `judgment` for. A
rule at 43 would repair 5% of its own row while the mechanism that
blocks the other 95% goes to a later phase regardless.

## Reproduce

`scratchpad/batch-9/vspan2.ts` — population and ambient rate.
`scratchpad/batch-9/vspan3.ts` — skeleton buckets.
`scratchpad/batch-9/probe.ts` — the no-entry spot probes.
`scratchpad/batch-9/vspan4.ts` — the anchored control.
`scratchpad/batch-9/vspan5.ts` — the witness table.
