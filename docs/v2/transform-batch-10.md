# Phase 2 batch 10 — Hebrew orthography

**Scope ruled by Brian 2026-09-01:** all four Hebrew-orthography rows —
everything `PENDING` still held. A second ruling the same day, after the
gate blocker in §4 was measured: *write case 9, ship all four*.

**Outcome: four rules, one new gate case, and `PENDING` is empty.**

`RULES` **53**, `coverage()` **54** total / **54** registered / **0**
pending / 0 unaccounted / 0 duplicated. The transform queue the phase
opened with is closed.

## 1. The four rows

Every count measured over all 32,512 entries after `applyRepairs`,
through `fieldsOf` — the pipeline's own reader — and reported twice
where the two differ, because a rule rewrites RAW fields and a reader
sees STRIPPED text ([[feedback_rendered_harm_rule]]).

| Row | Catalogued | Measured (raw) | Taken | Disposition |
|---|---:|---:|---:|---|
| `holam-migrated-off-mater-vav` | 308 ent | **1,007 / 457 ent** | 1,006 | RULE |
| `shin-sin-dot-drop` | 77 | **102** | 52 | RULE, split |
| `impossible-dagesh` | 19 / 17 ent | **19 / 17 ent** | 13 | RULE, split |
| `vkh-geresh-loss` | 11 | **11** | 11 | RULE |

Three of the four reproduce their catalogue figures exactly. The holam
row reproduces exactly on headwords — **106 occurrences / 103 entries**,
the audit's own number — and is larger elsewhere than the 558 it was
catalogued at.

## 2. The finding

**Two of the four rows repair the inside of a link target, and the
corruption is self-consistent on both sides.**

Of the 218 anchors whose `data-ref` carries a migrated holam, **218
point at a headword carrying the same defect** — measured
`refResolvesNeither` **0**. Repair the headword alone and all 218 break.
Repair the target alone and all 218 break. Only repairing both keeps
them resolving, which is what a uniform field map does and what no
existing gate case would license.

`shin-sin-dot-drop` states the same thing in its own audit and calls it
the sharpest sub-case: five members sit in a headword that is the
corpus's only spelling of its lemma, and the neighbouring entry's
`refs[]` repeats the same dotless string. **The reference resolves only
because both sides are equally wrong.** No link-integrity check can see
that, before or after.

## 3. What each rule declines, and why

**`shin-sin-dot-drop` — 52 of 102.** Restoring the dot means choosing
between שׁ and שׂ, and a rule that chooses is doing the reconstruction
[[project_no_vowel_inference]] rules out. So the rule restores a dot
only where the corpus spells the word out: a TWIN, byte-identical except
for the dot, so the vowels are identical by construction.

| Twin witness | Distinct words | Occurrences |
|---|---:|---:|
| exactly one | **23** | **52** |
| more than one | **0** | 0 |
| none | 31 | 50 |

**The row's own witness claim does not reproduce, and it is weaker than
this one.** It reads *"28 of the 89 sit inside anchor displays with a
Jastrow data-ref, and 28 OF 28 TARGETS CARRY THE POINT THE DISPLAY
LOST"*. Re-measured: **22** sit inside anchor displays and **15** have a
dotted target. That test compares SKELETONS, so it admits a target whose
vowels differ — `שָלַב` reaching `שְׁלַב`, a different vocalization and
possibly a different lemma. The twin test is byte-exact and does not.

**`impossible-dagesh` — 13 of 19.** The row's argument is that the mark
announces its own correction, and the rule applies that argument
honestly rather than to the whole population:

| Shape | Count | Taken? |
|---|---:|---|
| ר + dagesh, vowel or mater follows — FORTE, so a doubled letter | 10 | yes → ד |
| ח + dagesh, word-final — MAPPIQ, which only ה takes | 3 | yes → ה |
| ר + dagesh, nothing follows | 5 | no — neither forte nor mappiq |
| ח + dagesh, mid-word | 1 | no — not a mappiq position |

The six refused are `A01756 כרּז`, `K00311 שָׁרּ`, `R00344` twice,
`R00346 צירּ` and `Q00891 פִּיחּוּחֵי`, named in the corpus gate so it
cannot pass on a rule that repaired six different ones.

**ATTESTATION WAS MEASURED AND SET ASIDE HERE, which is the opposite of
the shin-sin call.** Only **5 of the 19** corrections are attested
verbatim elsewhere in the corpus, because Jastrow spells most of these
words plene in other entries (`חִידּוּשׁ` beside `חִדּוּשׁ`). A twin
test would ship 5 and refuse 8 correct repairs. The evidence for a GLYPH
correction is the mark; the evidence for a restored DOT is the
vocabulary. The two rows need different standards because they are
different acts — [[project_ocr_correction_ruling]] against
[[project_no_vowel_inference]].

**`holam-migrated-off-mater-vav` — one headword.** §5.

## 4. Link-target gate case 9

Spec: `docs/specs/2026-09-01-link-target-gate-case-9.md`.

The blocker was measured with a prototype map and the real gates over
the whole corpus, not predicted:

```text
{ touched: 457, linkFail: 205, textFail: 0 }
target "Jastrow, אַנּוֹנָא 1" is not in A00267's input
```

**`textFail: 0` is the more interesting half.** A holam move preserves
the codepoint multiset, so `checkNoNewText` returns clean over all 457
touched entries whatever the rule does. `holamMaterMigration` is the
first rule in the registry that gate cannot see — a
[[feedback_vacuous_gates]] shape — and its safety lives in case 9 and in
`holam-mater.corpus.test.ts` instead.

Five clauses, allowlisted on `POINT_DECLARERS` like cases 7 and 8. The
blast radius, over all **72,387** distinct `data-ref` values:

| Clause set | Distinct targets it could confuse |
|---|---:|
| points stripped, consonants equal | **2,063** bare forms / 2,722 spellings |
| + point multiset equal | **9**, of which 8 are different lemmas |
| + the gate's own holam fold | **1** — this row's own two spellings |
| add arm: one dot, sequence checked | 2 |
| + the dot must stand on a pointed letter | **0** |

The first row is why clause 3 alone would not do, and the corpus says so
in words: `עַל`/`עֹל`, `אֵם`/`אִם`, `תְּפִלָּה`/`תִּפְלָה`,
`אֲדָם`/`אָדָם`/`אָדַם`. A case that stopped there would license
retargeting any of those to any other — the failure that withdrew
`containment-fallback-mislink` in batch 9.

**The fold is the gate's, not the rule's**, exactly as case 5 owns the
gershayim↔quote mapping. A fold a rule could name is a fold a rule could
widen.

**One clause was wrong when written and the corpus found it.** Clause
5's pointed-letter test was stated over every dot in the target, and
refused `Jastrow, אִישׁוֹן 1` — where the shin dot sits on a letter
whose only vowel is the holam of the FOLLOWING mater vav, ordinary
Hebrew, and a mark the repair under judgement did not write. It is now
scoped to the dots the claim ADDED, aligned letter for letter against
`from`. Found by running the phase, not by reading.

## 5. The one repair no rule may make

Repairing every holam defect makes exactly ONE pair of entries share a
headword:

```text
T00795  רִמּוֹן   (b. h.)   ר ִ מ ּ ו ֹ ן     already correct
T00796  רִמֹּון   ( ch. )   ר ִ מ ֹ ּ ו ן     damaged
```

T00796 is T00795's Aramaic counterpart, and its own
`language_reference` points at `Jastrow, רִמּוֹן 1` under the display
`same`. Two entries spelled alike leave that target naming neither —
[[feedback_headword_is_a_namespace]].

The rule refuses T00796's **headword** and repairs its other fields
normally: only the namespace key is held back. A rule cannot see the
corpus, so the exception is frozen in `rules/holam-mater.ts` and
**re-derived from the live snapshot** by `holam-mater.corpus.test.ts`,
the way `vSubRedirectTwin` carries its 50-row table. Without that
re-derivation the constant would be a claim nothing checks, and a
re-fetch adding a second collision would be repaired silently.

**This correction is worth recording as a process failure.** The first
collision probe reported **0** new collisions and it was reported as
such. Its `fix` function had been written with `'ֹ'` as a
JavaScript source string rather than as the character, so it replaced a
seven-character literal that never occurs and rewrote nothing. The
probe measured unrepaired headwords and answered the question it was
asked with a number that meant nothing. See
[[feedback_brief_queries_unverified]]: a reproduced count is evidence
only when the predicate is stated, and a predicate that cannot fire is
the easiest kind to miss.

## 6. What the gates gained

| Gate | Change |
|---|---|
| `link-target.ts` | case 9, `POINT_DECLARERS`, 12 unit tests |
| `registry.order.corpus.test.ts` | a TENTH class, `POINT`, earned like `VOUCH` |
| `deletion-baseline.corpus.test.ts` | a TWELFTH row; total 4,510 → **4,523** |
| `holam-mater.corpus.test.ts` | 6 assertions, incl. the exception re-derived |
| `shin-sin.corpus.test.ts` | 4, incl. all 23 frozen rows rebuilt |
| `impossible-dagesh.corpus.test.ts` | 6, covering both target-free rows |

**The deletion baseline earned its keep on the first batch that tested
it.** `impossibleDagesh` swaps ר for ד, and a codepoint multiset reads a
substitution as one deletion plus one addition: 13 codepoints over 12
entries. It had to be written down. Its three siblings are ABSENT from
that list, which is independent confirmation that
`holamMaterMigration` moves rather than rewrites — the same claim its
module doc makes, checked somewhere else by something that does not know
it is checking it.

## 7. Two stages, and a number that does not close

Every population is reported at both stages because the deltas differ,
and the difference is not noise:

| Population | Repaired (raw) | Composed (raw) | Repaired (stripped) | Composed (stripped) |
|---|---:|---:|---:|---:|
| migrated holam | 1,007 | 1 | 565 | 1 |
| bare pointed shin | 102 | 48 | 64 | 38 |
| impossible dagesh | 19 | 6 | 19 | 6 |
| bare `וכ` | 11 | 0 | 11 | 0 |
| mappiq (null model) | 1,268 | 1,269 | 1,052 | 1,055 |

**On stripped text every row closes exactly. On raw fields two do not.**
The mappiq null model grows by 1 raw and by 3 stripped, and 3 is the
right answer — the rule makes three ה. The missing two are mappiqs
inside a `data-ref` that an unlink rule earlier in the phase deleted
along with its tag. A gate asserting the raw delta would have been
measuring another rule's deletions under this rule's name, so the corpus
gates assert the stripped figures and say why.

## 8. What batch 10 leaves

`PENDING` is **empty**. What remains on the transform rows is remainder
rather than queue, and it is recorded here rather than in a list a gate
reads — a row named in `RULES` and in `PENDING` is `duplicated`, which
`registry.test.ts` forbids:

| Row | Left | Why |
|---|---:|---|
| `shin-sin-dot-drop` | 50 | no attested twin; restoring the dot would be a choice |
| `impossible-dagesh` | 6 | the mark announces nothing there |
| `holam-migrated-off-mater-vav` | 1 | T00796's headword, §5 |

## 9. Audits

- `docs/specs/2026-09-01-link-target-gate-case-9.md` — the gate case,
  its clauses and its measured blast radius.
- `rules/holam-mater.ts`, `rules/shin-sin.ts`,
  `rules/impossible-dagesh.ts`, `rules/vkh-geresh.ts` — each module doc
  carries its row's population, null model and refusals.
