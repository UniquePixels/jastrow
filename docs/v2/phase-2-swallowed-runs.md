# Swallowed sense runs beyond `—2)`

**Question.** Doc 08's census (`IMPLIED_ONE_CENSUS`, 79 rids) detects
exactly one shape: an unnumbered sense whose tag-stripped definition
carries a `—2) ` run with no `1)` before it. A local CodeRabbit review
of `fix/implied-one-confirmed-rows` observed that `I00111`, after its
doc-08 split, still carries a `—3)` inside the new sense 2. Are
swallowed runs at markers other than `—2)` a real, countable class?

**Answer: yes, and it is two classes, not one.**

| Class | Count | Reader-visible today |
| --- | --- | --- |
| A — tail residue a doc-08 split leaves behind | 11 of the 79 census rows | 2 rows ship the defect on this branch |
| B — entries whose run opens at `—3)`/`—4)` | 3 entries (entry-scoped, composed) | not yet repaired |

Class A is the CodeRabbit finding and is the actionable one. Class B is
real but small.

## Predicate

The census predicate generalized to any `—N)` run, N >= 2:

```
MARKER = /(?<![0-9])—(\d+)\)\s/gu
```

For each **unnumbered** sense, tag-strip the definition (the census's
fixed-point `stripTags`), then flag a match at index `i` with number
`N` when `${N - 1})` does not occur in the text before `i`.

At `N = 2` this is byte-identical to the committed detector. The
`(?<![0-9])` guard is new and load-bearing: without it the N >= 3
sweep collects verse and note ranges — `Deut. XXXII, 1—43)`,
`Num. XV, 37—41)`, `Rabb. D. S. notes 2—4)` — 8 of 16 raw hits were
that artefact. The guard removes all 8 and changes nothing at N = 2.

**Sense-scoped vs entry-scoped.** The committed detector looks for
`N-1)` only inside the same sense. That is sound at N = 2, where the
missing `1)` is the whole point. At N >= 3 it is weaker: a sibling
sense earlier in document order may already carry `2)`. Both scopings
are reported below; entry-scoped is the stricter reading.

## Controls

- **Positive control.** The generalized predicate restricted to N = 2,
  over raw source, returns exactly `IMPLIED_ONE_CENSUS`: 79 rids,
  sorted lists identical, no extras, no misses.
- **The predicate can fail.** 67 of the 79 census rows have a clean
  tail, and `D00072` resolves no host at all (it is already repaired
  by `repairs.ts`), so Class A's 11 is a discrimination, not a
  tautology.
- **Populations.** Residue 3,729; sweep population 3,668, matching
  `residue-sweep.ts`.

## Class B — runs opening above `—2)`

Unnumbered senses, guarded marker, per marker number:

| N | raw, sense-scoped | raw, entry-scoped | composed, sense-scoped | composed, entry-scoped | composed entry-scoped, in sweep |
| --- | --- | --- | --- | --- | --- |
| 2 | 79 | 68 | 78 | 67 | 24 |
| 3 | 8 | 3 | 3 | 3 | 2 |
| 4 | 1 | 0 | 1 | 0 | 0 |

Composed = `applyRepairs` then `text-repairs` then
`structural-repairs`, the state `seed-implied-one.ts`'s
`composedEntry` addresses. The N = 2 row loses one entry under
composition (`D00072`, already repaired). The N = 3 row loses five:
the transform rules already fix `H00107`, `J00312`, `L00165` and
`S01730`, and the entry-scope test removes the rest.

Three entries survive both filters — the whole of Class B:

| rid | N | in sweep | opening text |
| --- | --- | --- | --- |
| `K00599` | 3 | yes | `…a. e.—3) also כַּפָּא … shore, border.` |
| `L00565` | 3 | yes | `…a. fr.—3) to learn, study.` |
| `O01387` | 3 | no | `…Ib. VII, 9 (10).—3) to look out for, provide…` |

`O01387` produces no anomaly hint, so no sweep chunk will ever contain
it. `K00599` and `L00565` are queued.

## Class A — the tail a `—2)` split leaves swallowed

Split semantics (`schema.ts`): the new sibling takes
`number = "—2)"` and `definition` = everything after the marker. The
host keeps the text before it. So a three-sense run splits into a
gloss and one sibling that still holds `—3)` as literal text — and
because that sibling is now **numbered**, the census predicate skips
it. Neither the census nor `seed-implied-one.ts` can see this: the
generator asserts `—2)` occurs exactly once, and asserts nothing about
higher markers.

Composed census rows whose `—2)` tail still carries a guarded run:

| rid | tail markers | seeded 2026-09-09 | in sweep |
| --- | --- | --- | --- |
| `C00805` | 3 | **yes** | no |
| `E00005` | 3 | no | yes |
| `E00148` | 3, 4 | no | yes |
| `E00298` | 3 | no | yes |
| `I00111` | 3 | **yes** | yes |
| `I00661` | 3 | no | yes |
| `I00822` | 3 | no | yes |
| `P00816` | 3 | no | no |
| `P00856` | 3, 4, 5, 6 | no | yes |
| `Q00990` | 3 | no | no |
| `S01355` | 3 | no | yes |

11 rows; 8 inside the sweep population; 2 inside the 28 seeded pairs.

### Two rows shipped the defect, and are now repaired

**Fixed 2026-09-10.** `seed-implied-one.ts` now splits at every marker
in the run rather than only at `—2)`, so `C00805` and `I00111` mint
three patches each instead of two. Composed through the same path
`migrate.ts` uses, both entries now read as three numbered senses with
no marker left in any definition. The tranche went from 56 patches to
58; `ACCEPTED_PATCHES`, `RAW_PATCHES` and `TEXT_FIELDS` moved by the
arithmetic that implies, and all nine migration gates stay green.

The generator also refuses two shapes it used to accept silently: a
marker occurring more than once, and a run whose markers are out of
document order. Both throw rather than minting an anchor that cannot
resolve.

The paragraphs below describe the state before that fix.

### What the two rows shipped

`3920ab644` rewrote the truth layer with the seeds, so `C00805` and
`I00111` carry the split in `data/entries/` today, and the reader sees
the swallowed run as literal text:

- `I00111` sense 2, unit 4 ends
  `…v. לְוָיְיתָא; a. fr.—3) much; many; very.`
- `C00805` sense 2 gloss ends
  `…v. גִּידָּא II.]—3) name of a disease, a sort of fever (?).`

Sense 3 exists in print in both. The split is incomplete, not wrong:
it repaired the implied `1)` and left the rest of the run inside the
sibling it created. The pre-split entry rendered as one run-on sense;
the post-split entry renders as two, the second still run-on. Net
defect count per entry falls by one, it does not reach zero.

### `I00661`'s recorded exclusion does not hold

Doc 08 says `I00661` is deliberately not seeded because it "no longer
presents the census shape after the transform phases run — its in-text
`—2)` is gone by the time patches apply". Re-derived through
`composedEntry` exactly: `isImpliedOneCandidate` returns **true**,
the host definition contains `—2)` exactly once, and `seedPair`
produces a valid split/retag pair. The row also carries the
maintainer's own 2026-08-13 note, "there are uncatogorized 2 and 3
senses as well" — which describes Class A a month before it was
measured. Whatever the real reason for holding `I00661` back, the
written one is falsifiable and false.

## Decisions — maintainer, 2026-09-10

All twelve reviewed rows are now repaired except `K00599`, which needs
print. Two tranches carry the work:

| Tranche | Rows | Patches |
| --- | --- | --- |
| `seed-doc-08-implied-one` | 33 | 76 |
| `seed-doc-08-sense-runs` | 6 | 21 |

`seed-implied-one.ts` addresses one shape and one repair. The six rows
it cannot express got their own generator, `seed-sense-runs.ts`, whose
`RUN_ROWS` table declares each row's ops and derives every anchor by
applying the previous patch through `applyPatch` — so an anchor that
would not resolve cannot be minted.

### What was repaired, by shape

| Shape | Rows | Repair |
| --- | --- | --- |
| implied `1)`, run past `—2)` | `C00805` `I00111` `E00005` `I00661` `P00856` `Q00990` `S01355` | split every marker, retag the host `1)` |
| OCR `l)` for `1)` | `E00148` `E00298` `I00822` | `replace` the glyph, then split the `1)`…`—4)` run |
| dropped `2)` marker | `L00565` `O01387` | retag the number-less sense `—2)`, split its `—3)` tail |
| swallowed marker in a numbered sense | `P00816` (`Ithpe.`) | split at `—3)` |

The three OCR rows were held at first because doc 08 had rejected them
on 2026-08-05 as *"Not implied, OCR error — l) …"*, which is a correct
reading: each stores a literal lowercase `l)`. That makes them a
different class, not an unrepairable one. `replace`'s closed-marker
allowance is the sanctioned route for a glyph correction, so the
repair is `l)` → `1)` first, then the run splits.

`E00148`'s `Af.` block now opens with an unlabelled lead sense, the
same shape its own `Pa.` block already had, because the marker sat at
the very start of the definition with only a space before it.

### `P00816` moved tranches, and why that matters

`P00816` carries two runs: one at top level and one in its `Ithpe.`
stem. Seeding half of it in each tranche silently dropped the first
half — `consolidate` supersedes the earlier manifest row when two
tranches claim the same rid, so its three implied-one patches vanished
and only the `Ithpe.` split survived. The gates stayed green
throughout; nothing reported it.

The row is now repaired whole in `seed-sense-runs`, and
`SEED_CONFIRMED` dropped to 33. A colocated test asserts the two
tables never name the same rid.

### Still open

`K00599` (כֵּיף ²) needs print. The data supports the reading that its
first two senses arrive by cross-reference: `language_code` is
`" ch. "`, `language_reference` is the word `same` linking to `כֵּיף`
(`K00598`), and the entry's own numbering begins at `—3)` with no
`2)` anywhere in it. That is consistent with print numbering only the
senses that diverge from the referenced entry, but it cannot be
settled from the data. It belongs in `needs_print_check`.

## A detector hole, found on the way

`L00565` and `O01387` were never in any review set, and not because
anyone judged them. `census.ts`'s `labelSequence` pulls the integer
out of each sense's `number` token, **drops the senses that have
none**, and checks the result reads `1..n`. A sense whose marker was
lost carries no token, so it leaves the sequence rather than breaking
it: `O01387` stores `1) ∅ ∅`, which reads as a clean `[1]`.

The detector can see a wrong number and cannot see a missing one.
Register #3's 35 entries are therefore a floor, not a count. Nothing
here changes that detector — it is recorded so the next census does
not inherit the assumption.

## Measuring the hole: senses with no number at all

The detector hole above is not hypothetical, so it was measured. The
predicate, run over the **shipped truth layer** (what the reader
actually gets, stems already separated):

> an unlabelled sense that appears AFTER a labelled one in the same
> block, carrying at least 20 characters of text.

Before the first label is a legitimate preamble; after it, a sense
with no number is either a grammatical addendum or a dropped marker.
`L00565` and `O01387` both fired on this predicate before they were
repaired, and no longer do — the positive control and its release.
It rejects 32,489 of the 32,512 entries.

**23 occurrences, in three groups:**

| Group | Count | Reading |
| --- | --- | --- |
| grammatical addendum | 8 | correctly unnumbered — not senses |
| sandwiched between labels | 2 | unambiguous gap, no print needed |
| trailing after the last label | 13 | plausible dropped marker, needs print |

The addenda are Jastrow's own trailing notes — `—Pl. אֲחֵרִים`,
`—Part. pass. גָּלוּם`, `—Fem. זְקֵנָה`, `—Denom. טָגַן` — in
`A01047`, `A03348`, `C00869`, `C00964`, `E00789`, `G00644`, `H01022`,
`I00311`. They are classified by rule (a leading `Pl.` / `Part.` /
`Fem.` / `Masc.` / `Sing.` / `Denom.`), not by eye.

### The two unambiguous gaps

| rid | headword | labels in block | missing |
| --- | --- | --- | --- |
| [K00081](https://jastrow.app/#rid:K00081) | כָּבַשׁ | `1 2 4 ∅ 6 7 8` | `5)` |
| [M02308](https://jastrow.app/#rid:M02308) | מצי ² | `1 ∅ 3` (Pi.) | `2)` |

Arithmetic settles both — a sense sitting between 4 and 6 is 5. And
`K00081` is not new: doc 01 recorded it on 2026-08-05 as a **deferral**,
with the maintainer's own note, *"this starts a seperate section in the
app but does not have the 5 label."* The class was seen and put down,
not missed. `M02308` has never been reviewed.

### The thirteen trailing candidates

Each is the last sense in its block and carries no number, where every
sense before it does. None can be settled by arithmetic.

| rid | headword | block | labels | text |
| --- | --- | --- | --- | --- |
| `B00753` | בַּיִת | top | `…9 10 ∅` | receptacle, cover &c., e.g. ב׳ הדיו inkstand |
| `C01079` | גְּנַב | Pa. | `1 ∅` | to go round about |
| `D00634` | דִּין | Ithpa. | `1 ∅` | to argue, dispute, have a law-suit with |
| `D00919` | דְּנָא | top | `1 ∅` | v. preced.**—2)** v. דְּנָה |
| `D01114` | דְּרַס | top | `1 2 ∅` | …press unawares.**—4)** as preced. 3) |
| `G00217` | זוּעַ | top | `1 ∅` | to move, shake, tremble |
| `G00652` | זָקַק | top | `1 ∅` | צָרַף) to rivet, forge; to chain |
| `J00199` | יָוָן | top | `1 ∅` | מלכות) Greek (Syrian) Government |
| `O00975` | סְלַח | Pa. | `1 ∅` | to effect forgiveness |
| `R00565` | צָמַח | Hif. | `1 ∅` | to cause to grow, produce |
| `S00811` | קְטַף I | Pa. | `1 ∅` | to break off, interrupt |
| `S02111` | קָרַס | Hif. | `1 ∅` | to become sourish |
| `U01512` | שְׁמַע I | Pa. | `1 ∅` | שַׁמְּעָא) to minister to |

Two of them carry their own evidence. `D00919` holds an in-text `—2)`
and `D01114` an in-text `—4)`, so those two are runs as well as gaps —
`D01114` is the Class B row from the top of this document.

Three (`G00652`, `J00199`, `U01512`) open on a closing parenthesis,
which usually means an etymology the body model kept in the same block
rather than a sense. They may be a fourth group.

**Only `K00081` of all 23 is in doc 01's reviewed set.** Register #3's
35 entries counts numbering it could see. It is a floor.

## Context, unadjudicated

Across the composed corpus, 302 entries carry at least one guarded
in-text `—N)` marker (359 markers), and 223 of those host senses are
already numbered. That is the outer bound on under-splitting corpus
wide. It is **not** a defect count — no one has read those rows, and
some markers are legitimate — but it says Classes A and B are the near
edge of a larger surface, not the whole of it.

## Proposed disposition

Nothing here should become a patch before a maintainer confirms the
rows, the same gate doc 08's Decision column applied.

1. ~~**Hold the two shipping rows.**~~ **Done 2026-09-10** — the
   generator splits the whole run, so `C00805` and `I00111` are
   repaired rather than half-repaired.
2. ~~**Guard the generator.**~~ **Done 2026-09-10** — `runMarkers`
   walks the run and throws on an ambiguous or out-of-order marker.
3. **Confirm Class A's other 9 rows** as a review set. None is in
   `SEED_CONFIRMED`, so none is repaired. 7 are in the sweep and could
   be left to it; `P00816` and `Q00990` produce no hint and never
   will, so nothing will reach them but a decision here.
4. **Confirm Class B's 3 rows** individually. `O01387` will never be
   swept and needs a decision either way.
5. **Correct doc 08's `I00661` note** to state the actual reason for
   the hold, or seed the row.
6. **Decide whether to commit the generalized census.** The counts
   above came from a one-off probe. If the class is accepted, the
   predicate belongs beside `IMPLIED_ONE_CENSUS` with its own
   committed list, so it cannot drift. Registering it moves no
   transform baseline, but it is a new corpus-tier assertion.

Register #16 is not amended here: its "in-text" wording and its 79-row
count remain accurate for the shape it describes.
