# Audit — `plural-inflection-anchor-escapes-entry` (catalogued 2,281)

**Verdict: RE-SCOPE to 1,417 entries / 1,818 occurrences.** The count
reproduces almost exactly (within 7 entries), but 1,022 of those entries
carry at least one link that is *correct* by the stub-lemma convention,
and 919 were flagged on anchors that are not morphology displays at all.

## Probe and raw figure

For each entry E, `own_forms(E) = plural_form[] ∪ alt_headwords[] ∪
every senses[*].grammar.binyan_form` (recursive). For every
`<a … data-ref="Jastrow, HW n">DISPLAY</a>` in E's definitions, flag
when `norm(DISPLAY) ∈ own_forms(E)` and `base(HW) ≠ base(E.headword)`.
`norm` = strip tags, NFC, strip niqqud/te'amim (U+0591–U+05C7), strip
superscript homograph digits, strip `()[]*?.,;:`; `base` additionally
strips a trailing Roman homograph numeral.

**3,379 occurrences / 2,288 entries.** By source field: `plural_form`
2,802, `alt_headwords` 461, `binyan_form` 116.

**The catalogued 2,281 is the distinct-entry figure, reproduced to
within 7 entries (0.3%).** Sensitivity: not stripping Roman homograph
numerals from the headword comparison moves it only to 3,432 / 2,324, so
the count is robust to that choice.

## Does this population have more than one job? — four

| Function | Occ | Entries | Verdict |
|---|---:|---:|---|
| **1. Linker mis-resolution** — the declared inflected form is anchored to an unrelated lemma | 1,818 | 1,417 | **DEFECT** |
| **2. Form-is-its-own-lemma** — Jastrow lemmatizes the inflected form separately, usually as a `, v. X` / `pl. of X` stub, and the anchor correctly links there. Detected by: the target entry's opening 120 chars contain the source headword or one of its alt/plural forms as a whole token | 1,460 | 1,022 | **CONVENTION** |
| **3. Explicit cross-reference / variant reading** — anchor immediately preceded by `v.` (125), `ed.` (58), `oth. ed.` (13), `read` (11), `Ms.` (9), `cmp.` (7), `corr.` (5), `=` (4). Leaving the entry is the whole point | 232 (101 not already in job 2) | — | **CONVENTION** |
| **4. Probe artifact, premise false** — the anchor is not displaying the entry's inflection; it is a word inside a citation or gloss that merely string-matches a `plural_form`/`alt_headwords` value after niqqud stripping. Measured as: not preceded by a `Pl.`/`Fem.`/`Constr.`/`Du.`/`Denom.` marker | 1,216 | 919 | **NOT THE DESCRIBED THING** |

Jobs 2 and 3 partly co-occur; 1,818 occurrences / 1,417 entries survive
removal of both. Only 2,163 of 3,379 occurrences sit inside the
morphology block at all.

**The single most damaging finding for the row: 1,529 occurrences (45%)
have `data-ref` naming a headword string-identical to the display.** Half
of those are the correct stub link (job 2); half are niqqud-blind
homograph collapse (job 1). The description's premise — "names a
*different* headword" — is true of both and separates neither.

## Sample read

`random.sample` with fixed seeds over the full flagged list (seed
20260818, n=14, unstratified) plus stratified draws of 3 per structural
class (seed 4242), 10 each from the boomerang-true/false partitions
(seed 99), and 12 from the crisp residual (seed 1234). **50 members read
in target context.**

**DEFECT (job 1)** — a selection of 18 read:

| rid | Case |
|---|---|
| M02321 | מְצִיעַ "middle" — `Pl. מְצִיעִין` → `מְצִיקִין` "oppressors". One interior consonant off |
| P00191 | עוּגָּא "cake" — `Pl. עוגין` → `עוֹגֵין`, whose entry reads "anchor, ballast" |
| A01990 | אָמָה "maidservant" — `Pl. אמהות` → `אַמְהוּת` "servitude of a maid", an abstract noun |
| U00381 | שׁוֹטֶה "fool" — `Pl. שוטים` → `שׁוֹטִים` "the name of a plant, fenugreek" |
| A01619 | אִישֹׁון — `Pl. אשוני` → `אֲשׁוּחֵי` "a genus of weak cedar" |
| O00182 | סַדְיָא "cushion" — `Pl. סדוותא` → `סַמְוָותָא` "blindness" |
| P00447 | עָטִיף — `Pl. עטיפין` → `עֲטִינִים` "packed olives" |
| S01732 | קְפֵידָא — `Pl. קפירין` → `קְפֵילִין` "cook-shop, tavern" |
| S00563 | קוֹרָא III "young bird" — `Pl. קורין` → `קוֹלִין` |
| P00762 | עֲלָא "leaf" — `Pl. עליא` → `עֲלִיָּה` "upper chamber" |
| A00301 | אִגְלָא "city-gate" — `Pl. אגלי, איגלי` → `גְּלֵי` (both occurrences) |

plus K00847, L00515, Q00421, K00086, Q01229, O00311, T00718.

**CONVENTION (job 2 — form is its own lemma):** C01169 גַּסְטְרָא →
C01171 `גַּסְטְרָיוֹת`, whose *entire* definition is `, v. גַּסְטְרָא` — a stub
pointing straight back. A02853 → A02855 `v. אצבעא`. D00813 → D00817
`v. דלו`. C00558 גָּזַל, `Part. נגזל` → N00144 `נִגְזָל` "(גָּזַל) a
complainant in a case of robbery" — Jastrow lemmatizes the passive
participle. C00210 → C00206, whose text reads "Pl. fem. גדילן, v.
גדילתא" — the target itself claims that plural.

**CONVENTION (job 3):** H00737 — the anchor sits inside
`(Y. ed. Amst. <a>חַיָּיא</a>)`, a manuscript variant note, flagged only
because `חַיַּיָּא` is an alt_headword and niqqud stripping collapses the
two. Q01645 — `Greek pl. פרוזבוטי q. v.` → Q01643; `q. v.` is an
instruction to leave the entry, and the cue regex missed it because the
cue *trails* the anchor.

Read-out precision: 10–11 of the 14 unstratified members are defects
(~75%); 12 of 12 crisp-residual members are defects except Q01645 and
two marginals (~85%); 8 of 10 boomerang-true members are correct links.

## Letter A

**162 entries / 206 occurrences** raw — 7.1% of the 2,288 against letter
A's 10.6% corpus share, modestly under-represented but nowhere near
absent. Re-scoped subset: **90 entries**; crispest core: **46 entries**.

## Disposition

**RE-SCOPE to 1,417 entries / 1,818 occurrences.**

Probe delta from the base probe: additionally require **(a)** no
cross-reference cue (`v.`, `cmp.`, `corr.`, `read`, `ed.`, `Ms.`,
`oth. ed.`, `=`) in the 60 chars before the anchor, and **(b)** no lemma
bearing the target headword whose first 120 characters of definition
contain the source entry's headword, alt_headword or plural_form as a
whole token (the "resolves back" test).

New description: *anchor display equals one of the entry's own declared
inflected forms (plural_form / alt_headwords / binyan_form) and data-ref
names a lemma that is neither a cross-reference target the text
explicitly sends the reader to, nor an entry that resolves back to this
headword — i.e. the linker mis-resolved the inflected form to an
unrelated word.*

**Crispest core, if a tighter transform target is wanted: 532 entries /
587 occurrences** — the form sits inside the printed
`Pl.`/`Fem.`/`Constr.` morphology list, is spelled out in full (no
geresh abbreviation), and the target headword differs from the display
and does not resolve back. This is the `מְצִיעִין → מְצִיקִין` class.
Letter A holds 46 of those entries.

**Do not transform on the catalogued 2,281 as described.**

## What would have falsified this

The mirror of the claim: **if the "target is a stub that resolves back"
class had turned out to be unrelated words rather than genuine redirect
lemmas, the row would stand at 2,281.** Checked directly — for every
flagged member the *target entry's definition* was loaded and read, not
just its headword. The class held: `גַּסְטְרָיוֹת` = "v. גַּסְטְרָא",
`אצבעתא` = "v. אצבעא", `דַּלְוָותָא` = "v. דלו", `סַנְי` = "pl. of סנאה",
`נִגְזָל` = "(גָּזַל) a complainant". Conversely, amnesty was refused on
string identity alone: `עוֹגֵין`, `שׁוֹטִים` and `אַמְהוּת` are
string-identical to their displays yet are different words, and stay in
the defect set.

Second falsifier — that the *crisp* subset is contaminated by legitimate
cognate links the way `same` was — tested by reading 12 random crisp
members; 10–11 were unambiguous mis-resolutions, and the two soft ones
(Q01645's trailing `q. v.`; D01001 → D01002, an adjacent-rid lemma of
the same string) are the known ~15% residual, not a hidden convention.

**Could not determine:** whether links from an Aramaic entry's plural to
its Hebrew cognate lemma (Q00861 `פִּירְכּוּסָא` → `פִּירְכּוּס I`) are
intentional Sefaria policy or misfires. Judged defects because the
display is this entry's own plural, but nothing in the data settles it.
A minority of the crisp subset.

## Overlap

- **`homograph-collapse-link` (2,957)** — 549 occurrences have a display
  skeleton shared by ≥2 headwords; that row is the *mechanism* behind
  the job-1 members whose display equals the target string. Heavy
  overlap.
- **`inflection-abbrev-mislink` (137)** — describes exactly the
  geresh-abbreviation members, but **765 occurrences** here carry a
  geresh in the display. **That row appears measured far too low**, or
  scoped much more narrowly than its text implies. Related:
  `geresh-abbrev-fixed-sink` (572), `prefixed-geresh-abbrev-mislink`
  (173), `geresh-letter-numeral-mislink` (608).
- **`neighbor-rid-mislink` (655)** — 579 occurrences resolve to a
  headword within ±2 lines of the source entry. Very large overlap —
  **and many of these are precisely the *correct* stub links**, since
  Jastrow prints the plural stub immediately after its base entry. That
  row may carry the same false-positive problem.
- **`interior-consonant-mislink` (495)** — 281 occurrences differ from
  their target by exactly one interior consonant.
- **`binyan-head-form-mislinked` (127)** — subsumes part of the 116
  binyan_form members.
- **No overlap by construction** with `homograph-numbering-schism` /
  `homograph-numeral-mismatch`: `base()` strips trailing Roman numerals,
  so links differing only in the homograph numeral were never flagged.

A transform against the re-scoped row must be sequenced against
`homograph-collapse-link` and the geresh-abbreviation family, or the
same anchors will be rewritten twice.
