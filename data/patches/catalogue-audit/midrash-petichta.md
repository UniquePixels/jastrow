# Audit — `midrash-petichta-unanchored` (279 → 13)

**NOT YET RULED.** This records the measurement; the disposition below
is a recommendation awaiting Brian.

## The row

> Midrash `introd.` (petichta/proem) citations are never anchored
> although Petichta targets exist.

It was catalogued with the four never-linked works (see
`never-linked-works.md`) and it is the one row of the five whose target
work name IS attested. That is why it is audited on its own.

## The population reproduces exactly

Over all 32,512 entries after `applyRepairs`:

```text
288 occurrences of "introd." / 279 entries / 0 inside an anchor
```

Identical to the row's `288 occurrences / 279 entries` and its
`0 of 288 sit inside an anchor`.

## The targets exist, and here they are in full

Every `data-ref` in the corpus containing `Petichta` — five addresses,
three works, 32 occurrences:

```text
22  Ruth Rabbah, Petichta 1
 3  Eichah Rabbah, Petichta 7
 3  Eichah Rabbah, Petichta 24
 2  Eichah Rabbah, Petichta 16
 2  Esther Rabbah, Petichta 11
```

So the pattern `<Work> Rabbah, Petichta <N>` is attested vocabulary, and
a minted ref in that shape would not be inventing a work name. This is
where the row parts company with the four never-linked rows.

## But the LOCUS is the defect, and the row measured the wrong thing

The row's claim is that `Lam. R. 170, Esth. R. 47 and Ruth R. 1 point
at petichta sections that ARE addressable`. That reads the work name,
not the locus. Sefaria addresses a proem **by number**. Jastrow
overwhelmingly cites it **by its opening rabbi**.

Classifying what follows each of the 288 `introd.`:

| Locus form | Count | Constructible |
|---|---:|---|
| proem cited by RABBI — `(R. …` | 149 | no |
| Hebrew span or anchor follows, no locus | 45 | no |
| bare — no locus at all | 38 | no |
| **proem cited by NUMBER** | **13** | **yes** |
| `end` | 5 | no |
| other, mixed | 38 | mostly no |

Turning `Lam. R. introd. (R. Josh.)` into `Eichah Rabbah, Petichta 24`
needs a rabbi→proem-number table. The corpus does not contain one, and
its 5 attested addresses cannot supply it. **That gap — the locus, not
the work — is what the row was actually seeing.**

Note also that 15 of the 288 are `Sifra introd.`, which belongs to
`mekhilta-sifra-never-linked`, not here.

## The 13 that are constructible, in full

```text
Ruth R. introd. 2   A01698, C01193
Ruth R. introd. 3   C01079, E00740, J00709
Ruth R. introd. 6   C00871
Lam. R. introd. 4   C01316
Lam. R. introd. 10  C01318
Lam. R. introd. 17  S02170, S02173
Lam. R. introd. 32  C01431, D00239, U00481
```

Two works, seven distinct proem numbers. Every number is plausible for
its work (Eichah Rabbah has 36 proems, Ruth Rabbah 8), and **every
number comes from Jastrow's own text** rather than being inferred — so
a rule would mint the work name from attested vocabulary and copy the
locus, which is the `seeParticleRestore` division of labour.

None of the 13 constructed refs matches an already-attested address:
attested are Ruth 1 and Eichah 7/16/24, and these are Ruth 2/3/6 and
Eichah 4/10/17/32. The *pattern* is witnessed; the specific addresses
are not. Whether that is enough is the open question — a locus slot is
by nature different in every citation, so demanding an attested
address would forbid any minting linker rule, but the gate then has no
witness that the address resolves.

## Recommendation

**Re-scope 279 → 13**, and treat the 266 as part of the same Phase 4
linker item the four never-linked rows go to — their blocker is a
rabbi→proem table, which is external data of exactly the kind that
item exists to hold.

For the remaining 13, two defensible readings, and this is the
decision to put to Brian:

1. **Ship a rule at 13.** Precedent supports the mint. Cost: a gate
   that cannot witness the address, only the shape.
2. **Withdraw all 279 to `judgment`** and let the Phase 4 linker
   handle proems whole, by number and by rabbi together. 13 of 279 is
   4.7% — a rule that leaves 95% of its own row unrepaired.

Reading 2 is the recommendation: the row's mechanism is one linker
gap, and splitting 13 out of it buys little while adding a minting
rule whose gate is weaker than every minting gate already shipped.

## Reproduce

`scratchpad/batch-9/petichta.ts` — attested target census.
`scratchpad/batch-9/introd.ts`, `introd2.ts`, `introd3.ts` —
population, locus-form classification, the 13.
