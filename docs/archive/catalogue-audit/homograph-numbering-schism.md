# Audit — `homograph-numbering-schism` (catalogued 3,421)

**Verdict: RE-SCOPE to 186 entries / 188 occurrences.** The count
reproduces exactly, and every structural claim in the description is
literally true — but the population is a **blast radius**, not a defect
set. 77.5% of its occurrences are ordinary correct cross-references.

## Probe and raw figure

```python
SUP = '¹²³⁴⁵⁶⁷⁸⁹'
# families: headword ending in a superscript numeral -> its bare base
# member = any anchor whose target headword is exactly a bare base
```

| Quantity | Value |
|---|---|
| superscript families (bare base + ≥1 numbered sibling) | 766 |
| numbered members (² ×766, ³ ×35, ⁴ ×4, ⁵ ×1, ⁶ ×1) | 807 |
| bases with no bare headword present | 0 |
| **member occurrences** | **4,230** (4,151 well-formed `<a>`; 79 in nested/malformed markup) |
| **distinct source entries** | **3,421** ← exactly the catalogued figure |
| distinct bases hit | 733 of 766 |

`corpusCount` is **entries**, not occurrences. The description's
structural claims verify: no headword anywhere contains `¹` (0 of
32,512), no `data-ref` contains `¹` (0 of 73,469 Jastrow-internal
anchors), and the bare base precedes its superscript siblings in
**807/807** cases (minimum offset +1) — the bare member really is first.

## Does this population have more than one job? — at least six

Classified over all 4,151 anchor-level occurrences, priority-ordered and
non-overlapping.

| Job | Occ | Entries | Verdict |
|---|---:|---:|---|
| J1 ordinary cross-reference / etymology to the base lemma | 3,215 | 2,716 | **CONVENTION** (sampled: majority correct) |
| J2 printed text reads `v. X **ch.**`, anchor routed to the *Hebrew* base while a `ch.` superscript sibling exists | **188** | **186** | **DEFECT** |
| J3 printed ref names a Roman homograph (`v. גּוּר I ch.`), link is bare | 37 | 35 | DEFECT, but Roman-numeral system |
| J4 `ch. same` cognate back-link from the ² entry to its base | 399 | 391 | **CONVENTION** — the exact class that broke round 2 |
| J5 `preced.` / `next w.` / `foreg.` navigation | 140 | 131 | **CONVENTION** (130/130 targets do precede the source; 0 counter-examples) |
| J6 base is a letter/particle (א, ב, ג), where ²³⁴⁵⁶ number *sub-articles of one article*, not homographs | 172 | 150 | **PREMISE FALSE** — no homograph family exists here |

Two further findings break the description's model of what a superscript
*is*:

- **The superscript is not Jastrow's homograph numbering.** Jastrow
  numbers homographs with **Roman numerals**, and the corpus keeps them
  (2,871 headwords end in one; 1,233 in `I`). The superscript is a
  machine disambiguator for entries whose printed headword string is
  byte-identical, and its commonest occupant is the Aramaic cognate:
  **437 of 807** superscript members are marked `ch.`
- **In 107 of 766 families the bare base is itself the Aramaic entry**
  and the superscripted sibling is not (`צוּר` bare = ch. "to tie
  around", while `צוּר I/II/III` are the Hebrew homographs). "The bare
  base is the first member of a homograph family" is **inverted in 14%
  of families**.

## Sample read

Draw 1: `random.seed(20260818)`, 12 of 4,151 occurrences uniformly.
Draw 2: `random.seed(41)`, 10 uniformly from the J1 bucket alone, since
J1 is 77% of the population and the verdict hangs on it.

**Correct (14):** G00389 `(זֵעָה; זוּעַ)` etymology → Hebrew base.
U00345 `שְׁוַוח ²` "(preced.) pit" → base is literally the preceding
entry. M00596 "v. מוּכָן s. v. כּוּן" → Hebrew Hof'al, Hebrew base.
U01561 `שְׁנָא I` "v. שְׁנֵי" → bare `שְׁנֵי` *is* the ch. entry, right.
G00440 "corresp. to b. h. צַדִּיק" — text says *b. h.*, base is the
Hebrew. Plus M02844, P00470, R00440, M00947, R00667, J00284, P00998,
M01993, M02624.

**Defect (5):** R00101 "…a. e., v. **צוּד ch.**" — link on צוּד goes to
the Hebrew base; the ch. entry is `צוּד ²`. N01085 "נח נַפְשֵׁיה, v.
**נוּחַ ch.**" — same. G00273 source is `זִיג ²`, links its own participle
`זָיֵג` to bare `זִיג`, a different lemma. T00892 `רְעִי` links `(רָעָה)`
to bare `רָעָה` = "evil, v. רַע" when `רָעָה ²` = "to feed" is plainly
meant. N00486 links display `נְחִילִים` (swarm) to `נָפִיל` (giants) — a
wrong lemma outright, ח/פ, belonging to `interior-consonant-mislink`.

**Undetermined (3):** N00673 `נִימָא` "cmp. נִיב" (base "to flow" vs ²
"upper lip" — ² reads better). H00003, an Aramaic entry writing "v.
חוּס" where base is `b. h.` and ² is the Targum entry. N00615 `נִיגְדָּא`
"v. נִגְדָּא" where base = "load, freight" and ² = "lash".

**14 correct / 5 defect / 3 undetermined. The row is not a defect
population.**

## Letter A

**238 of 3,421 entries = 6.96%**, against a 10.63% corpus share —
present but under-represented ~0.65×. 39 of the 766 bare bases are
letter-A headwords. In the re-scoped J2 subset: **9 of 186 entries**
(heaviest letters are S/T/U at 16 each). A thin but workable pilot
slice.

## Disposition

**RE-SCOPE to 186 entries / 188 occurrences** — the subset where the
printed cross-reference explicitly names the Aramaic entry (`v. X ch.`)
and the anchor is routed to the Hebrew base instead of the `X ²`
cognate.

Probe: bare-base anchor, immediately followed in the running text by
`ch.`, where the base is not itself a `ch.` entry and at least one
superscript sibling is. **A00193 is the proof text** — the reference
reads `v. אָבָק ch.` and `אָבָק ²` opens with `ch. = h. אָבָק.`

New description: *`"v. X ch."` cross-reference whose anchor is routed to
the Hebrew base entry although the Aramaic cognate it names is the
superscripted sibling X ².*

**The catalogued 3,421 must not be carried forward as a defect count.**
It is every entry a bare-base rename would touch. A deterministic
transform written against the row as catalogued would rewrite roughly
3,000 correct links — the same failure mode as round 2's
`same-anchor-positional-mislink`.

## What would have falsified this

The row would have been **confirmed at 3,421** had there been a live
disambiguating signal the linker was discarding. Three checks:

- **Sense pointer carrying member identity.** If bare-base anchors bore
  pointers >1 while the base entry had fewer senses, they would be
  mis-targeted numbered members. Result: 4,133 of 4,151 carry sense `1`,
  18 carry none, **none carries anything else**. No signal.
- **Dangling `¹` references.** If any anchor addressed `X ¹`, the
  "inexpressible first member" would be a live broken link. Result: `¹`
  occurs in **0** of 73,469 Jastrow anchors and 0 headwords. Separately,
  81 anchors corpus-wide fail to resolve and **none** is a bare-base
  member — every one of the 4,230 members resolves uniquely.
- **The routing test that decided it.** If the trailing `ch.` token were
  ever honoured, J2 would be noise rather than a systematic mis-route.
  Result: of 1,114 anchors that *do* target a superscripted member,
  exactly **1** is followed by `ch.`; of 4,151 bare-base anchors, **205**
  are. **The linker never used the token.** That asymmetry is what makes
  J2 a defect and the rest a convention.

## Overlap

- **`unnumbered-terminal-homograph` (129)** — direct contradiction of
  this row's premise in **18 families** (`צוּר`, `זוּחַ`, `דִּין`, `סוּף`,
  `זְמַם`, `שִׁיעֲתָא`…), where the bare headword is the *terminal* member
  of a Roman series, not the first. Both rows claim these.
- **`post-anchor-numeral-mismatch` (91, r2)** and
  **`homograph-numeral-mismatch` (538)** — J3 (37 occ / 35 entries) is
  theirs, not this row's.
- **`neighbor-rid-mislink` (655)** — **622 occ / 513 entries** have a
  target rid adjacent to the source, since superscript siblings sit at
  R±1.
- **`homograph-collapse-link` (2,957)** — 709 occ have an unvocalized
  Hebrew display over a shared skeleton; and because every superscript
  family is by construction a set of byte-identical headword strings,
  **all 766 families are collapse candidates**.
- **`same-anchor-positional-mislink` (374)** — J4 (399 occ / 391
  entries) is the same `ch. same` cognate convention, on the
  correct-link side of it.
- **`h-cognate-self-link` (50)** — the `h.`-language mirror of J2. The
  two are complementary halves of one defect (the language tag outside
  the anchor being ignored) and are **worth merging into a single row**
  rather than left as two.
