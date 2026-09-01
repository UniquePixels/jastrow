# Audit — `v-sub-redirect-stub-mislink` (161 catalogued, 50 determinable)

**NOT YET RULED.** This records the measurement; the disposition below
is a recommendation awaiting Brian.

Like `containment-fallback.md`, this row **retargets an existing
anchor** rather than minting one. The destination is an entry that
already exists, so no gate has to witness a minted work name.

## The row

> whole-entry redirect stub `X, v. sub <geresh-abbrev>` whose anchor
> resolves the abbreviation as a standalone lookup and lands on an
> unrelated lemma.

## Population reproduces exactly

Over all 32,512 entries after `applyRepairs`:

```text
entries containing "v. sub" anywhere   327     (row: 327)
of which whole-entry redirect stubs    318
anchored (the pointer carries an <a>)  225
bare (no anchor to retarget)           102
anchor display is not an abbreviation    4
```

The row's arithmetic was over 209; this pass finds 225 anchored. The
predicate is stated so the two can be compared: this counts the FIRST
`v. sub` anchor in the joined definitions, requires a `Jastrow`
`data-ref`, and normalizes final forms (`ם`→`מ` etc.) — per
[[feedback_cap_artifact_agreement]], the number without the predicate
is not evidence.

## The row's own test, measured

The abbreviation names the target's opening consonants. Does the
target actually begin with them?

```text
target STARTS WITH the abbreviated prefix    89
target does NOT                             132
```

**Final-form normalization is load-bearing and easy to miss.**
`עוּלֵם` points `v. sub עוּלֵימ׳` at `עוּלֵים` — correct — but the
abbreviation ends in a medial mem and the headword in a final mem, so
an unnormalized comparison scores it a mismatch. Normalizing moved 3
cases from defect to correct (86 → 89) and removed `עוּלֵם` from the
unexplained bucket entirely.

## The prefix alone does NOT determine the repair

Of the 132 mismatches, taking every headword that starts with the
abbreviated prefix:

```text
exactly ONE such headword     1
SEVERAL                     134   (before the twin filter)
NONE                          0
```

`כֹּר׳` has **223** candidates. A rule keyed on the prefix alone would
be guessing.

## Prefix AND spelling twin DOES determine it, for 50

Adding the row's second condition — the candidate must also be a
spelling twin of the host, i.e. identical once the matres lectionis
(`י`, `ו`) are removed:

| | Count |
|---|---:|
| **exactly ONE candidate** | **50** |
| several candidates | 73 |
| no candidate | 9 |

The 50 are visibly correct on inspection — the defect is always the
same, an abbreviation resolved as a standalone lookup:

```text
טַוָּס      v. sub טַוו׳   was טָוִי         should be טַוָּוס    I00133
נִדּוּי     v. sub נִידּ׳   was נִדְבַּךְ I    should be נִידּוּי   N00624
נִישְׁמָא   v. sub נִשְׁ׳    was נִישְׁדּוּר    should be נִשְׁמָא    N01333
נִיצְבָא   v. sub נִצְ׳    was נִיצּוּחַ     should be נִצְבָּא    N01099
מֵנִיקָה    v. sub מֵינ׳    was מִנְיָמִין    should be מֵינִיקָה  M01225
חִסּוּלָא   v. sub חִיסּ׳   was חֶסֶד ²      should be חִיסּוּלָא  H00831
```

Every one is the plene/defective spelling pair the stub exists to
point at, and every "was" target is an unrelated lemma that merely
starts near the abbreviation.

## A false trail worth recording

A first pass defined "spelling twin" as equality after removing ALL
`י` and `ו` from both headwords, with no prefix condition. That makes
`כִּסּוּי` (covering) and `כּוֹס` (cup) both core `כס`, so "a twin
exists" came out true for 208 of 225 and carried no information. The
twin test is only meaningful **conjoined with the prefix**, which is
what the row said and what this pass finally measured.

## Recommendation

**Re-scope to 50 and ship a retarget rule**, subject to the same
condition as `containment-fallback.md`: all 50 read individually
before shipping, as the row's own sample was. The 73 ambiguous and 9
unresolved join the Phase 4 linker item with the rest of batch 9.

Two open items:

1. The 102 bare `v. sub` stubs have no anchor to retarget. They are an
   `unlinked-v-span`-shaped problem and should go wherever that row
   goes rather than being handled here.
2. The row states this is a sub-population of `geresh-abbrev-fixed-sink`
   (24% correct outside `v. sub`, 17% inside). Sequencing with that row
   is unsettled, exactly as it is for `containment-fallback-mislink`.
   **Both of batch 9's surviving rules depend on the same unsettled
   question**, so it should be answered once, for both.

## Reproduce

`scratchpad/batch-9/vsub.ts` — population.
`scratchpad/batch-9/vsub2.ts` — the loose-twin false trail.
`scratchpad/batch-9/vsub3.ts` — prefix test, prefix-only candidates.
`scratchpad/batch-9/vsub4.ts` — prefix AND twin, the 53 before
final-form normalization.
`scratchpad/batch-9/vsub5.ts` — the same with normalization, the 50.
