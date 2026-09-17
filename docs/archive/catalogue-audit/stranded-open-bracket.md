# Audit — `stranded-open-bracket` (catalogued 152)

**Verdict: RE-SCOPE to 87 occurrences / 85 entries.** The row is
**over-measured, not under-measured** — the round-2 under-measurement
flag should be cleared. 49 of its members belong entirely to another
row, and 18 are a homeless third defect.

## Probe and raw figure

```python
DANG = re.compile(r"\[[^\]]*$")   # a '[' with no ']' after it in the same definition
def orphan_close(d):              # d contains a ']' with no '[' before it
    depth = 0
    for ch in d:
        if ch == "[": depth += 1
        elif ch == "]":
            if depth == 0: return True
            depth -= 1
    return False
# for each hit at sense index i: first j>i whose definition has an orphan ']'
```

**154 occurrences / 152 entries.** The 152 reproduces the catalogued
count exactly.

**How narrow that reproduction is matters.** The more obvious
formulation — *net* balance, `d.count("[") > d.count("]")` — gives
**167 entries / 170 definitions**, not 152. The catalogued figure is
specifically the *trailing-run* test; the difference is definitions like
`[a] b [c] d]` that are net-positive but have a `]` after the last `[`.
The audit used the regex form throughout so the figures stay
commensurate with the catalogue.

Scale: 5,967 `[` and 5,920 `]` across 5,423 bracket-bearing definitions.
No bracket character anywhere in the corpus sits inside an HTML tag
(11,887 bracket chars, 0 inside tags), so markup is not a confound.

## Does this population have more than one job? — three, partitioning cleanly

The discriminator is one bit: **is the dangling `[` the last visible
character of the definition?**

| Job | Shape | Occ | Entries | Verdict |
|---|---|---:|---:|---|
| **A** | `[` is the **final visible char** (84/87 preceded by `.—`); an orphan `]` appears in a later **sibling** sense | 87 | 85 | **DEFECT — the described pattern** |
| **B** | `[` opens a **contentful** editorial run whose closer is an **orphan `)`** in the *same* definition | 49 | 49 | DEFECT, but **belongs entirely to `bracket-paren-mismatch`** |
| **D** | `[` opens a contentful run with **no closer of any kind, anywhere** | 18 | 18 | DEFECT, different repair, currently homeless |

Zero pairwise overlap: 85 + 49 + 18 = 152 exactly.

**The description is true of Job A only — 87 of 154 occurrences (56%).**
For the other 67 there is no closer in any later sibling sense: 54 sit
in the entry's **last sense**, so there is no later sense at all; 13 have
later senses but none containing an orphan `]`.

Job A is highly regular and does behave as described: 86/87 closers are
same-parent, same-depth siblings (1 cross-level); 80 in the immediately
next sense, 6 two later, 1 four later; and in 77/86 the orphan `]` is the
closing sense's **final visible character**. The bracket opens at a sense
boundary and closes at the end of the last enclosed sense — it wraps one
or more whole numbered senses. The next sense's `number` is a bare `N)`
in 86/87 cases (`2)` ×47, `3)` ×23, `4)` ×9, `1)` ×6).

**Job B is not a variant of Job A.** The closer is a paren, in the same
definition, and the fix is a one-character substitution. In context they
are unmistakable — Jastrow's editorial bracket with a mis-rendered
closer: I00616 `Midr. Till. to Ps. LXXXVII [read:)` (intended `[read:]`);
L00118 `[read with R. S. to Ohol. XII, 4) מלבין…`; R00026
`[prob. identical with צבעים, near Ono, Neh. XI, 34).`; G00147
`[the glittering, cmp. אִיסָר, אִסְתִּירָא &c.) Zuz,` — precisely the
reconstructed-sense bracket, with `)` for `]`. A transform written to
this row's description would do nothing for these 49, and if it hunted
for a closer "in a later sibling sense" it would insert a `]` in the
wrong sense entirely.

### The convention underneath Job A that a naive repair would destroy

No member is a false positive — a definition terminating in a bare `[`
is never meaningful, and neither is `[read:)`. But Jastrow's `[...]`
around a numbered sense is a **live editorial signal**: it marks that
sense as editorially supplied or uncertain. C01250 גַּרְגִּירָא reads
`…v. גּוּר II.—[2) berry, grain, v. גַּרְגְּרָא.]` — the whole of sense 2 is
bracketed. The sense split is *correct*; what broke is the bracket span,
orphaned across the boundary. **The obvious repair — delete the two
stray bracket characters — would silently discard the uncertainty
marking on 87 senses.** The correct repair rejoins the span.

Checked whether the balanced editorial-bracket convention leaks in as
false positives: it does not. H01144 חָמַד opens `[to be hot,] to desire,
covet` — balanced in-sense, correctly excluded; that entry is in the
population only for a *separate* trailing `—[`.

**A mirror population the row cannot see.** Corpus-wide, mixed spans run
`[…)` ×65 and `(…]` ×33. This probe only ever finds a surplus `[`, so
the 33 `(…]` cases are structurally invisible to it — and separately, 38
entries carry an entry-level surplus `]` with no opener anywhere.

## Sample read

All 154 occurrences flattened in corpus order, `random.seed(20260818)`,
`random.sample(n=14)` — drawn **before** any classification existed, so
the draw is blind to the A/B/D split. All read with two senses of
context each side. Plus a second seeded draw of 8 from Job B, all 18 of
Job D exhaustively, and all 7 Job-A members whose closer is not in the
immediately next sense.

| rid | Case | Judgement |
|---|---|---|
| C01250 | s0 ends `…v. גּוּר II.—[`; s1 (`2)`) = `berry, grain, v. גַּרְגְּרָא.]` | **Job A** — textbook |
| P00079 | s1 ends `…he drew a circle.—[`; s2 = `to make a cake. Ez. IV, 12.]` | Job A |
| I00721 | s1 ends `bore. [`; s2 ends `…v. מִטְרְדָה.]` | Job A |
| I00602 | s7 (`—3)`) ends `(v. Ex. R. s. 8).—[`; s8 (`4)`) ends `h. text נְטוֹשׁ.]` | Job A — s8's marker is a bare `4)` where its siblings carry `—2)`, `—3)`: the em-dash is inside the stranded `[` |
| V01081 | s2 ends `…angel of premature death.—[`; s3 ends `Tanna d'be Elijahu ch. I.]` | Job A |
| Q02090 | single sense ` [to split, enter into, cmp. בָּדַק) to examine` | **Job B** — entry has one sense; nothing to do with siblings |
| M01419 | ` [marking off, counting,) toll, tax.` | Job B |
| V00271 | ` v. טוּר) [to go around; cmp. אָלַל,) to espy.` | Job B — two mis-rendered closers in one definition |
| H00825 | `[Vers. frequ. vary with הנינא, חגא). Pes. 75ᵃ…` | Job B |
| L00514 | `[Comment. takes ליצו"י as numerals = 146); v. טֶפֶף.` | Job B |
| Q01845 | ` same. [Targ. Koh. III, 3. v. פְּכַר.) Targ. Y. II…` | Job B |
| G00536 | `[Ib. XXVI, 9 מנמנמי Ar., read מזמני; ed. מערעי).` | Job B |
| L00015 | last sense ends `[Yalk. ib. 84 ולעיאו …—V. לְהִי, לְעִי.` | **Job D** — no closer anywhere |
| J00049 | s0 ends `—[Y. Ab. Zar. III, 43ᵃ נייבל, v. בִּיל ch.`; s2 = `to be carried.` | Job D — later senses exist, no orphan `]` in any |

**5 of 14 are the described pattern. 7 are Job B. 2 are Job D.**

From the exhaustive reads: M02277 is the single Job-A member whose
closer is missing entirely. I00189, V00139, D00891, U01998 have an
opener sense whose *entire definition is the bare `[`* — a phantom sense
with no body. Job D's 18 are uniformly editorial notes appended at the
end of a definition (A00941 `[In later writings אותו האיש is freq. used
for Jesus of Nazareth.`; H00448 `[Bibl. Hebr. חוֹרִים, חֹרִים noblemen`)
with the `]` simply lost; 13 of 18 are the entry's last sense.

## Letter A

**13 of 152 entries (8.6%)** against a 10.6% corpus share — no deficit,
no zero. Job A: 9 entries (A00764, A00870, A00889, A01791, A01898,
A02000, A02062, A02169, A03185) = **10.6% of the 85, dead on the corpus
proportion.** Job B: 3 (A00475, A03092, A03137). Job D: 1 (A00941).

## Disposition

**RE-SCOPE to Job A: 87 occurrences / 85 entries.**

New description: *definition ending in a bare unclosed `[`, the print
bracket wrapping one or more whole following numbered senses whose
orphan `]` closes the last of them in a later sibling sense; the
enclosed sense's marker loses its em-dash into the stranded bracket.*

### This resolves the row's two opposing figures — they were never in tension

- **"87 definitions of which 85 pair within two senses" (chunk-00181) is
  the real population**, and this independent measure lands on the same
  87 (86 pairing within two senses, 86 at any distance). **The 152 was
  the over-broad outer figure, not a refinement of it.**
- **The round-2 under-measurement claim is the same 87 seen through a
  narrower window.** Round 2's 45/26/19 could not be reproduced exactly:
  the nearest reconstruction — bare `N)` markers whose immediately
  preceding sibling carries an em-dashed number — gives **73 total, 29
  explained by a preceding definition ending in `[`, residue 44** (11 in
  letter A). Discrepancy reported rather than either figure adopted. The
  direction is confirmed and the structural claim is right, but the
  residue belongs to `continuation-marker-em-dash-loss`, which does not
  need this row to grow to hold it. **The row is over-measured; clear
  the under-measurement flag.**

## What would have falsified this

Re-scoping, not confirming — so the falsifier that matters is against
the *reduction*: **a substantial subset of the 67 excluded occurrences
whose closer does sit in a later sibling sense, just not as an orphan
`]`.** Looked for three ways. (a) The location probe re-run with the
loose test — "any later sense containing a `]` at all", generous enough
to catch a closer that also opens a bracket — still returned 54 with no
later sense in existence and 9 with no `]` in any later sense. (b) All
18 Job-D members read in full rather than sampled: 13 are the terminal
sense with nothing after them; the remaining 5 have later senses read
directly with no candidate closer. (c) For Job B, whether the orphan `)`
might mask a genuine later-sibling closer: re-running the pairing test
on B members after excluding the `)` found 1 candidate at distance 2,
and reading it showed the paren was the true closer. **Sixty-seven
excluded, at most one arguable.**

Second falsifier, honestly reported as not clean: **if `[…)` and `(…]`
occurred at comparable rates, Job B would be undirected OCR noise rather
than a systematic `]`→`)` substitution.** Measured: `[…)` = 65, `(…]` =
33. That is 2:1, not 20:1, so **no corpus-wide one-way substitution is
claimed.** It does not need to be: whichever character is wrong, the
defect is confined to one definition and its repair is a character swap.
The direction is asserted only for the eight B members read, where
semantics decide it — and that is flagged as a judgement on eight
instances, not a corpus claim.

Third: **if letter A had been empty or depleted in Job A, the pilot
tranche could not exercise the transform.** 9/85 = 10.6%. Did not fire.

**Could not determine:** whether the correct Job-A repair wraps the
enclosed senses in a structural "bracketed/editorial" flag or restores
literal bracket characters at the span edges — a schema decision the
corpus does not settle. Also undetermined: whether the 33 `(…]` mirror
cases and the 38 entry-level surplus-`]` entries include members of this
same span-broken-across-senses shape with the polarity reversed.

## Overlap

- **`bracket-paren-mismatch` (67) — hard, total overlap.** Its
  description, "bracketed run opened with `[` and closed with `)` or the
  reverse", is exactly Job B. Its probe reproduced at **98 occurrences /
  97 entries corpus-wide against its catalogued 67 — itself a
  discrepancy worth a separate look** — and intersecting gives **49 of
  49 Job-B entries already members.** All 49 are currently
  double-counted across two rows. They belong there, not here.
- **`continuation-marker-em-dash-loss` (71, r2)** — confirmed as the
  correct home for the bare-`N)` residue. Job A is the complementary
  set; the two should be stated as complements rather than one leaking
  into the other.
- **`sense-number-outside-closed-grammar` (111)** — its enumeration
  literally ends with `[1)`, a Job-A boundary caught by a different
  probe. Worth checking whether that item is one of these 87.
- **`bracketed-gloss-lead-sense` (49)** — the 4 phantom senses whose
  whole definition is the bare `[` (D00891, I00189, U01998, V00139) are
  the degenerate case of that row.
- **`verse-paren-false-sense-split` (13)** and **`stem-head-marker-chop`
  (18)** — structural siblings: a print delimiter cut by a spurious
  sense boundary, and a sense-marker span broken across siblings. Same
  failure mode in the sense-splitter, different delimiter.
- **`unmatched-closing-paren` (1,604)** / **`unmatched-opening-paren`
  (452)** — the paren analogues. **Job D (18) is the bracket-side
  counterpart of `unmatched-opening-paren` and is currently homeless;**
  fold it there or mint an `unclosed-editorial-bracket` row.
