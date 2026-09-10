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

## Review table — the 12 rows still needing a decision

Write `confirm` or `reject` in each Decision cell, the way doc 08's
column works. **Confirm** means: split the run so each numbered sense
becomes its own sense, exactly as `C00805` and `I00111` now are.
**Reject** means: leave the entry as it stands, and say why.

Nothing happens to these rows until the cells are filled — no patch is
authored from a blank cell.

### Class A — a run swallowed in the tail

| rid | headword | text at the marker | note | Decision |
| --- | --- | --- | --- | --- |
| [E00005](https://jastrow.app/#rid:E00005) | הָא I | …a. fr.**—3)** (as conjunction) [there is this,] a) introducing a self-evident consequent, then… | one unnumbered sense; needs 1) / —2) / —3) | |
| [E00148](https://jastrow.app/#rid:E00148) | הֲדַר | …a. fr.**—3)** to reply. Ḥull. 34ᵃ … **—4)** to carry around in procession. Yeb. 110ᵃ Ar.… | host already numbered; run of 3 and 4 swallowed | |
| [E00298](https://jastrow.app/#rid:E00298) | הַזְכָּרָה | …Taan. 2ᵇ; a. e.**—3)** the Tetragrammaton. Y. Ber. III, 6ᶜ bot.—Pl. הַזְכָּרוֹת… | one unnumbered sense; needs 1) / —2) / —3) | |
| [I00661](https://jastrow.app/#rid:I00661) | טְפַל | …while they were engaged in burying him.**—3)** to join, attach one’s self. Keth. 23ᵃ… | already `confirm` in doc 08; never seeded — see below | |
| [I00822](https://jastrow.app/#rid:I00822) | טְרִיקְלִין | …Tosef. Bets. II, 10 ט׳ שהסיקוהו וכ׳; a. e.**—3)** (τρίκλινος = ὅρριον, S.) granary. Y. Sot. V, 20ᵇ bot.… | one unnumbered sense; needs 1) / —2) / —3) | |
| [P00816](https://jastrow.app/#rid:P00816) | עֲלַל I | …Targ. O. Gen. XV, 12; a. fr.**—3)** to be busy, have to do with, (euphem.) to sport. Esth. R. to II, 16… | not in the sweep; nothing else will reach it | |
| [P00856](https://jastrow.app/#rid:P00856) | עָמַך II | …**—3)** ה׳ (על) עצמו to contain, check one’s self … **—4)** (of liquids) to make consistent, curdle … **—5)** ה׳ על חזקתו … **—6)** ה׳ על מדותיו | longest run: 1) through 6) in one sense | |
| [Q00990](https://jastrow.app/#rid:Q00990) | פָּלַח | …**—2)** to work for, serve, v. פּוֹלֵחַ.**—3)** to worship. Tosef. Ab. Zar. I, 4… | not in the sweep; nothing else will reach it | |
| [S01355](https://jastrow.app/#rid:S01355) | קָלַל | …the more lenient rule is applied; a. fr.**—3)** to be sparing, beggarly. Ib. כל המיקל… | one unnumbered sense; needs 1) / —2) / —3) | |

### Class B — a run that opens above `—2)`

| rid | headword | text at the marker | note | Decision |
| --- | --- | --- | --- | --- |
| [K00599](https://jastrow.app/#rid:K00599) | כֵּיף ² | …give me my jewelry back; a. e.**—3)** also כַּפָּא … shore, border … **—4)** arch, vault … **—5)** cap … **—6)** bundle, sheaf | opens at 3; senses 1 and 2 are both implied | |
| [L00565](https://jastrow.app/#rid:L00565) | לָמֵד I | …Sifra K’dosh. Par. 3, ch. VI, v. לִימּוּד; a. fr.**—3)** to learn, study. Ab. II, 5… | opens at 3 inside a multi-stem entry | |
| [O01387](https://jastrow.app/#rid:O01387) | סְפַן | …Targ. II Esth. I, 12. Ib. VII, 9 (10).**—3)** to look out for, provide, store… | opens at 3; not in the sweep | |

### `I00661` needs a yes, not a review

Its Decision cell in doc 08 already reads `Confirm, note: there are
uncatogorized 2 and 3 senses as well` — the maintainer saw this class
on 2026-08-13. It was left out of the seed on the stated grounds that
the transform phases consume its `—2)`, which does not reproduce: the
entry is still a census candidate after `composedEntry`, and the
generator produces a valid patch set for it today. Adding `I00661` to
`SEED_CONFIRMED` needs only a yes, not a fresh reading.

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
