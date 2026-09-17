# Audit — `v-sub-redirect-stub-mislink` (161 catalogued, 50 determinable)

**RULED 2026-08-31 (Brian): SHIP THE RULE**, with the
`geresh-abbrev-fixed-sink` entanglement declared. Population 50.

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
point at, and every "was" target but one is an unrelated lemma that
merely starts near the abbreviation. The exception is `O00864`, whose
current target is the host itself — see the confirmation pass below.

## A false trail worth recording

A first pass defined "spelling twin" as equality after removing ALL
`י` and `ו` from both headwords, with no prefix condition. That makes
`כִּסּוּי` (covering) and `כּוֹס` (cup) both core `כס`, so "a twin
exists" came out true for 208 of 225 and carried no information. The
twin test is only meaningful **conjoined with the prefix**, which is
what the row said and what this pass finally measured.

## Recommendation

**Re-scope to 50 and ship a retarget rule.** Brian ruled 2026-08-31 to
ship it, conditioned on reading the 50 first; that pass is done and
**all 50 confirm** (see below). The 73 ambiguous and 9
unresolved join the Phase 4 linker item with the rest of batch 9.

Two open items:

1. The 102 bare `v. sub` stubs have no anchor to retarget. They are an
   `unlinked-v-span`-shaped problem and should go wherever that row
   goes rather than being handled here.
2. See the entanglement below.

## THE ENTANGLEMENT WITH `geresh-abbrev-fixed-sink`, MEASURED

The row states it is a sub-population of `geresh-abbrev-fixed-sink`
(970 entries, **`route: judgment`**). That row is therefore not going
to receive a transform rule, so these 50 are not competing with a
planned repair — they would be **carving a determinable
sub-population out of a row routed away from transform**.

Building the sink table — every ≥2-consonant geresh abbreviation
display in the corpus and the Jastrow targets it reaches (1,000
distinct abbreviations) — and scoring the 50 against the fixed-sink
row's own predicate:

| Test | Of the 50 |
|---|---:|
| wrong target shared by **≥2 unrelated hosts** | **39** |
| abbreviation reaches exactly ONE target corpus-wide | 32 |

**39 of the 50 are inside the judgment row's population.** The sinks
are the deterministic constants that row describes:

```text
מְיַנּ׳ -> מִנְיָמִין    4 hosts
מֵינ׳  -> מִנְיָמִין    4 hosts
חִיסּ׳  -> חֶסֶד ²      5 hosts
טַוו׳  -> טָוִי        4 hosts
```

A rule here retargets the ONE `v. sub` host of each sink and leaves
the others pointing at it. That is defensible on its merits — the
`v. sub` stub supplies a spelling twin that the other hosts do not
have, which is precisely what the row meant by "the correct target is
mechanically determinable HERE and NOWHERE ELSE in that family" — but
it is a cross-row effect and **must be declared**, not left for a gate
to discover. Compare batch 7's undeclared edges and batch 8's
`unnumbered-terminal-homograph` overlap, which no gate could see.

`containment-fallback-mislink` does NOT have this problem, and by
construction rather than luck: `geresh-abbrev-fixed-sink` requires a
geresh abbreviation, and the containment census excludes geresh
displays outright. The two rows are disjoint. **So the shared
sequencing question the two audits raised is not in fact shared — it
belongs to this row alone.**

## Reproduce

`scratchpad/batch-9/vsub.ts` — population.
`scratchpad/batch-9/vsub2.ts` — the loose-twin false trail.
`scratchpad/batch-9/vsub3.ts` — prefix test, prefix-only candidates.
`scratchpad/batch-9/vsub4.ts` — prefix AND twin, the 53 before
final-form normalization.
`scratchpad/batch-9/vsub5.ts` — the same with normalization, the 50.

## ALL 50 READ — 50 CONFIRM

Every one is the same shape, with no exceptions and nothing ambiguous:

- the entry is a whole-entry **STUB** whose only definition is
  `, v. sub <abbrev>.`
- the host headword is a plene/defective spelling variant
- the proposed target is the spelling twin whose skeleton begins with
  the abbreviated consonants
- the current target is an unrelated lemma that merely starts nearby

```text
נִדּוּי     v. sub נִידּ׳   was נִדְבַּךְ I     -> נִידּוּי    N00624
נִיצְבָא   v. sub נִצְ׳    was נִיצּוּחַ      -> נִצְבָּא     N01099
קִבּוּץ     v. sub קִיבּ׳   was קְבל IV       -> קִיבּוּץ    S00854
צִנוֹק     v. sub צִינ׳    was סִנַּבְרַאי    -> צִינוֹק     R00391
שִׁפּוּל    v. sub שִׁיפּ׳   was שִׁופּוּט     -> שִׁיפּוּל    U01015
```

**ONE SHAPE THE ROW DID NOT NAME.** `O00864 סִיתְוָא, v. sub סִתְוָ׳`
currently points at **`סִיתְוָא` — the host itself**. That is a
self-link, not the "unrelated lemma" the row describes; a stub whose
whole content is a pointer to itself tells the reader nothing. The
repair is the same and the target (`סִתְוָא` O01684) is correct, so it
stays in scope, but the rule's own documentation should say that the
population includes one self-link rather than claiming every current
target is unrelated.

**The rule's population is 50.**
