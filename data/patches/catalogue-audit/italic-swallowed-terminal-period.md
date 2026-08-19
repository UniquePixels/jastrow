# Audit — `italic-swallowed-terminal-period` (catalogued 1,209)

**Verdict: RE-SCOPE to ~1,174 occurrences / ~1,098 entries — and
re-triage as typographic, not text-integrity.** The count could not be
reproduced, 9.5% of the population is abbreviation dots rather than
sentence-final periods, and the row collides head-on with a round-2 row.

## Probe and raw figure

"Multi-word italic gloss run" → an `<i>…</i>` run with ≥2 whitespace-
separated tokens; "period pulled inside" → body ends `.`; the contrast
case is `</i>.`.

| | Occ | Entries |
|---|---|---|
| period **inside** (`.</i>`) | **1,297** | **1,199** |
| period **outside** (`</i>.`) | 17,893 | 10,748 |

**1,209 could not be reproduced.** Nearest reproducible figures: 1,297
occ / 1,199 entries (the natural reading); 1,201 occ excluding bodies
with any internal period; 1,249 requiring the last word ≥3 chars. The
catalogued figure sits between all of these and matches none — +88 occ
(7.3%) / +10 entries against the natural probe. Report as a
discrepancy, not a match.

The description's own supporting figure, "23,647× dominant", **is**
near-reproducible at **23,645** — but only for *all* italic runs,
single-word included. Multi-word runs, the population the row actually
scopes, give 17,893. The numerator is measured on a narrower population
than the denominator quoted to justify it. Restricted to the real
population the dominance is 93.2%; in the commonest context (multi-word
run immediately followed by a `refLink` citation) it is **586 inside vs
12,752 outside = 4.4% inside**. Dominance survives the correction.

Nothing qualifies inside `quotes[]` (0); the population is entirely
`content.senses[].definition`.

## Does this population have more than one job? — at least seven

| Function | Occ | Verdict |
|---|---|---|
| **A.** English gloss with a genuine gloss-terminal period, followed by a citation or `—Pl.` break | **1,174** | DEFECT (markup-scope only — see the severity caveat) |
| **B.** Grammatical-label run — `<i>Part. pass.</i>`, `<i>Pl. fem.</i>`, `<i>Hebr. pl.</i>` | 83 | **CONVENTION** — abbreviation dot, not sentence-final |
| **C.** `v.` (vide) cross-reference — `<i>brightness, v.</i> <a>פּוֹטָא</a>` | 5 | **CONVENTION** — sentence continues into the ref |
| **D.** `&c.` terminator | 5 | **CONVENTION** — abbreviation dot |
| **E.** Proper-name / bibliographic initial standing for the headword — `<i>Land of Ḥ.</i>, a district…`, `<i>Mar Z.</i>`, `<i>Lam. R.</i>` | 18 | **CONVENTION** — 9 are followed by a comma, proving non-terminality |
| **F.** Structural section label swallowed into the gloss run — `<i>the hereafter.—Pl.</i>`, `<i>…gland.—Du.</i>` | 5 | DEFECT, but a *different* one — the trailing dot is `Pl.`/`Du.`/`Targ.` and the real terminal period is mid-body |
| **G.** Period standing where a **comma** belongs, run split across two `<i>` tags — `<i>trunk; twig.</i> <i> branch</i>` | 5 | DEFECT, different — moving the period outside cements the wrong glyph |
| **H.** Sentence demonstrably continues in lowercase after `</i>` | 2 | DEFECT, different kind |

**123 occurrences (9.5%) are not the thing the description names.** Of
those, 111 (B–E) are abbreviation dots for which "sentence-final period"
is simply false.

The empirical test that surfaced B–E: for each candidate's final token,
count how often that token appears **mid-run** (followed by more words)
inside an `<i>` elsewhere in the corpus. A token appearing mid-run is
proven to be an abbreviation. **98 candidates failed** — `pass.` ×75
(seen mid-run 7×), `part.` ×12 (mid-run 12×), `&c.` ×5, `Ḥ.` ×2, `R.`,
`Af.`, `St.`, `pl.`

## Sample read

`random.seed(20260818); random.sample(members, 14)` over the full 1,297,
no filtering. **14/14 landed in class A**, consistent with A being 90.5%
of the population: M00596, C00118, U01132, Q00518, H01073, I00509,
V00273, Q01821, L00677, U01044, P01247, M03079, U01601, G00500.

Two are worth noting: M03079's *preceding* run in the same sense is
`<i>to be long, slow; to wait</i>;` — the outside form, same entry; and
U01601's same sense shows the dominant outside form on the very next
run.

Because a 14-draw cannot be expected to hit a 5-member class, classes
B–H were **enumerated exhaustively** and every member of C, D, E, F, G
and H read individually (38 members).

## Letter A

**129 occurrences / 120 entries — 9.9% of the population**, against
letter A's 10.6% corpus share. Proportional, no deficit. The rate is
uniform alphabet-wide (per 1,000 entries: A 37.3, mean 39.9, range F 8.5
to B 58.6), so this is not an import-batch artifact.

Letter A includes 7 of the 18 class-E false positives (`Lam. R.`,
`Shabur And.`, `district of Ant.`, `A. Cæsarea, Cæs.`) and 4 of the 5
class-D `&c.` cases — the pilot tranche will hit the false-positive
classes.

## Disposition

**RE-SCOPE** to the 1,174 occurrences / ~1,098 entries where the
trailing token is not an abbreviation and no structural label or
comma-substitution is involved.

New description: *multi-word English gloss run closing its terminal
period inside the italic (`gloss.</i>`) where the corpus writes it
outside (`gloss</i>.`, 12,752 vs 586 in the gloss-then-citation
context); excludes runs whose final token is an abbreviation dot
(`Part. pass.`, `v.`, `&c.`, proper-name initials), which the corpus
dots inside by convention.*

Exclusion predicate: drop members whose final token matches a Jastrow
abbreviation (`pass. part. pl. f. fem. sing. majest. v. &c.` and the
binyan names), whose final token is a short capitalised initial
(`^[A-ZŠŚḤṬ][a-zæœA-Z]{0,3}\.$`, minus false hits `Elul.`, `Peor.`),
whose body ends `—Pl.` / `—Du.` / `Targ.`, or which is immediately
followed by an `<i>` run continuing the same phrase in lowercase.

### Severity caveat a Phase 2 author must be told

Both forms strip to byte-identical rendered text:

```
<i>gift, outfit.</i>—Pl. X   →  "gift, outfit.—Pl. X"
<i>gift, outfit</i>.—Pl. X   →  "gift, outfit.—Pl. X"
```

Nothing is lost, duplicated or mis-ordered. The only difference is
whether the period glyph is italicised. There are **0** double-period
artifacts (`.</i>.`) and 0 bodies ending `..`. **This is a
typographic-consistency row, not a text-integrity row**, and should be
triaged accordingly — the 1,174 correctable members carry roughly the
reader-visible impact of one italic full stop each.

## What would have falsified this

The re-scope would have flipped to a **discard** if the outside form
were not actually dominant in the contexts the members occupy. Tested
three ways, and it survived: multi-word runs overall (17,893 out vs
1,297 in), the gloss-then-`refLink` context specifically (12,752 vs
586), and alphabet-wide uniformity (present in all 22 letters, so not a
localised convention).

**Where the dominance IS inverted is grammatical-label runs — which is
exactly why class B is excluded.** For **single-token** labels the
corpus writes the period **inside** 1,560 times vs outside 533: inside
is the norm. For **multi-token** labels it flips: outside 307, inside
82. `<i>Part. pass</i>.` occurs 230 times against `<i>Part. pass.</i>`
63. The corpus normalises the same object type in opposite directions
depending on token count, and the class-B members sit precisely on that
seam.

Also looked for and absent: a subset where the italic body is a
self-contained translated sentence legitimately owning its period.
Checked capitalised sentence-initial bodies, bodies containing embedded
markup (0 of 1,297 contain `<`), and bodies containing Hebrew (0). Every
member is a gloss fragment, a label or an abbreviation.

## Overlap — one collision needs resolving before either row transforms

- **`label-period-outside-italic` (round 2, 608) — DIRECT POLARITY
  COLLISION.** That row catalogues `<i>Af</i>.` as the defect and
  `<i>Af.</i>` as correct; this row catalogues `<i>Part. pass.</i>` as
  the defect. Applied together, the two normalise abbreviation labels in
  **opposite directions**, split only by token count. The 83 class-B
  members are the contested territory. **These two rows must be
  reconciled before either is transformed.**
- **`em-dash-section-break-in-own-italic` (270)** — 199 members are
  immediately followed by `<i>—</i>` or `<i>—Pl.</i>`, and a further 118
  by a bare `—`. About a quarter of this population is co-resident.
- **`gloss-space-loss` (45)** — U00392 `<i>to care for, mind.Targ.</i>`
  is a member of both.
- **`italic-lone-punctuation` (29, "period ×21")** and
  **`orphan-gloss-seam-period` (19)** — adjacent populations at the same
  `</i>`/citation seam; they are the residue of the opposite move, and a
  transform here could create or destroy their members.
- **`anchor-italic-no-space` (111)**, **`italic-close-paren-nospace`
  (95)**, **`paren-tag-no-space` (126)** — same class of italic-boundary
  defect; a shared italic-seam normaliser would be safer than four
  independent transforms.
- **`stranded-stem-head` (544)** and **`spurious-name-period` (19)** —
  class F (`—Pl.` absorbed into the gloss run) and the abbreviation-dot
  classes look like they belong under those rows rather than this one.
