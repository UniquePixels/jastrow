# Audit — `inflection-abbrev-mislink` (catalogued 137)

**Verdict: RE-SCOPE to 52 occurrences / 46 entries at threshold ≥3.**

**The AUDIT FLAG that sent this row to audit was WRONG, and the auditor
refuted it.** The flag claimed the row was ~5× under-measured, on a 765
figure another auditor had measured inside a different row's population.
Tested directly: the two are not measuring the same shape. Measured on
its own terms the row is roughly **2.6× over-measured**, not under.

## Probe and raw figure

The description names three conditions: a **geresh abbreviation**; it
abbreviates **the entry's own inflected form, not its headword**; it is
**outside `abbrev-mislink`'s scope**. That last clause plus the
`-mislink` id implies the link leaves the entry.

Normalizers are a Python port of `admin/pipeline/research/headword-index.ts`
(`baseHeadword`/`skeleton`/`consonants`/`ownForms`), **validated by
reproducing the shipped `abbrev-mislink` rule at 734 entries against the
736 documented** in `link-anomalies.ts` (0.3% gap, from an unported
`ROMAN_NUMERAL` pre-gate).

| K = letters before geresh | Occ | Entries |
|---|---:|---:|
| ≥2 | 63 | 52 |
| **≥3** | **28** | **26** |
| ≥4 | 7 | 7 |

**None of 137, 355 or 31 could be reproduced under any reading.** A
288-cell grid was run over {form source in six combinations} ×
{normalization: skeleton vs consonants} × {length measure} ×
{headword-abbrev excluded or not} × {mislink required or not} ×
{occurrences vs entries}. Best fit to the catalogued triple
(355, 137, 31) was (362, 38, 12) — total error 125. The `31 at ≥4`
coincides exactly with one cell, but that cell's other two figures are
854 and 284, not 355 and 137. **The catalogued triple is not
reproducible.**

## Does this population have more than one job? — four

**The row's premise is stale, and that is the headline.** The shipped
`abbrev-mislink` was already widened to cover inflected forms — round
1's own recommendation (`docs/v2/discovery-round-1.md`), shipped in
`link-anomalies.ts`'s `abbreviates()`, which tests `own.forms` as well
as the headword. **28 of 28 hits fire the shipped `abbrevHint`.** The
population this row describes is now **100% inside** `abbrev-mislink`'s
scope, so the row as written has a corpus count of **0** genuinely
outside it.

Jobs inside the 28-occurrence K≥3 population:

| Job | Occ | Verdict |
|---|---:|---|
| 1. Abbreviated own inflected form, target an unrelated word sharing the opening letters (`אִיתְּ׳` under אֲמַר → אַתְקַפְתָּא) | 19 | **DEFECT** |
| 2. Multi-word abbreviation (`בית א׳`, `בר ג׳`, `בְּנֵי ח׳`) | 5 | DEFECT, owned by `multiword-abbrev-mislink` (22) |
| 3. Target is the *same word*, plene/defective spelling only — `isOwn` compares by `skeleton()`, which keeps matres, so קַיָּים→קַיָּם and עוּלֵם→עוּלֵים read as escapes | 4 | **CONVENTION** (false positive) |

**And the job that would have wrecked a transform**, found by dropping
the mislink condition — the reading a Phase 2 author could equally take,
since the description never says "mislink":

| Job | Occ | Verdict |
|---|---:|---|
| 4. The printed morphology list — `Pl. סַנְטֵרַיָּא, סַנְטֵרִין, סַנְטֵי׳, (סַנְטוֹ׳)` — where each abbreviated variant anchors **correctly back to its own entry** | **69 of 97 (71%)** | **CONVENTION** |

This is the `same-anchor-positional-mislink` failure verbatim. A
transform written against "geresh abbreviation of the entry's own
inflected form" without the escape condition rewrites 69 correct links
out of 97.

**The genuinely-outside-scope residual exists and was never measured.**
`headword-index.ts` documents it: `ownForms` reads only structured
fields, leaving "~86, estimated" inflected forms stated only in
definition prose. Measured here — display abbreviates neither the
headword nor any structured form, but abbreviates a full Hebrew token in
the same entry's prose that is plausibly an inflection: **45 occ / 39
ent at K≥3**, of which 12 are correct links to the abbreviated word
itself, leaving a **33-occurrence / 29-entry defect core** (`מִיטּ׳`
under טְכַס → מַטַּטְרוֹן; `דיי׳` under יִתְרָא → דִּיאַטְרִיטָא; `מינ׳`
under נְטַר → מִנְיָמִין).

## Sample read

All **28** members of the K≥3 population were dumped and read — a census,
not a sample — plus 10 uniformly random members of the 69 correct-link
population (`seed 7`) and 8 + 6 from the prose residual (`seed 11`,
`seed 5`).

| rid | headword | display → target | Judgement |
|---|---|---|---|
| A02061 | אֲמַר | `אִיתְּ׳` → אַתְקַפְתָּא | DEFECT — Ithpe. contraction of this entry; target unrelated |
| A00742 | אוּנְיָיקִי | `בית א׳` → אֶבֶן | DEFECT — multi-word, other row |
| A01603 | אִירוֹנִית | `עיר׳` → עַרְבּוּבְיָא | DEFECT — abbreviates alt_headword עִירוֹנִית |
| A02386 | אִסְטַנְדְּרָא | `אסת׳` → אַסְטְרוֹלוֹגְיָא | DEFECT — abbreviates alt_headword אִסְתַּ׳ |
| H00448 | חוֹר | `בְּנֵי ח׳` → בְּרַק | DEFECT — declared plural; multi-word |
| H01201 | חָמַם | `נתח׳` → חטי | DEFECT — Hithpa. נתחמם; target nonsense |
| N01026 | נְפַח | `אִינְּ׳` → נְצֵי | DEFECT — Ithpe. אִתְנְפַח |
| S00935 | קַיָּים | `קַיָּמ׳` → קַיָּם | **CONVENTION** — same word, matres only; `isOwn` artifact |
| P00267 | עוּלֵם | `עוּלֵימ׳` → עוּלֵים | **CONVENTION** — `v. sub` to the plene sibling |
| M01946 | מִסְכֵּין | `מִסְכֵּנ׳` → מִסְכֵּן | **CONVENTION** — `v. מִסְכֵּן, מִסְכֵּנ׳`, correct cross-ref |
| O01218 | סַנְטֵרָא | `(סַנְטוֹ׳` → סַנְטֵרָא | **CONVENTION** — printed `Pl.` list, link correct |
| V00735 | תְּנַח | `אִיתְּ׳` → אַתְקַפְתָּא | DEFECT — prose residual (`Ithpe. אִתְּנַח`), outside current scope |

## Letter A

**Not zero, and over-represented.** A is 10.6% of the corpus. In the K≥3
population: **6 entries / 7 occurrences (23% of entries)** — A00742,
A01603, A01887, A02053, A02061, A02386. In the re-scoped population:
**12 of 46 entries (26%)**, adding A00007, A00155, A00593, A01315,
A01591, A01957, A02452 from the prose arm.

## Disposition

**RE-SCOPE to 52 occurrences / 46 entries at threshold ≥3 letters before
the geresh.**

Two arms unioned, both requiring `letters_before_geresh(display) >= 3`
(Hebrew letters after niqqud removal, **matres retained**), the display
not headword-abbreviating, and `isOwn(target) == false`, then excluding
multi-word displays (→ `multiword-abbrev-mislink`) and targets identical
to the headword by `consonants()` (plene/defective siblings):

- **arm A** matches a structured `ownForms` entry — 19 occ / 17 ent
- **arm B** matches only a prose-cited plausible inflection and is not
  itself a skeleton-prefix of the target — 33 occ / 29 ent

New description: *geresh abbreviation of one of the entry's own
inflected forms — declared in plural_form/alt_headwords/binyan_form, or
cited only in definition prose — whose anchor resolves to an unrelated
word sharing the opening consonants; single-word displays of ≥3 letters,
excluding plene/defective spellings of the headword itself.*

### Threshold justification — the row's central question

**≥3, measured on skeleton letters, not consonants.**

- **≥2 is double-counting, not measurement.** Dropping to 2 adds 81
  occurrences that are overwhelmingly the one- and two-letter generic
  geresh forms, and those are already three other catalogue rows:
  `geresh-letter-numeral-mislink` (608),
  `prefixed-geresh-abbrev-mislink` (173), `geresh-abbrev-fixed-sink`
  (572). The shipped detector's `MIN_ABBREV_STEM = 2` exempts them
  precisely because expansion is ambiguous at that length, and round 1's
  fix was to narrow the exemption in a *separate* rule, not to widen
  this one.
- **≥4 is 5 occurrences.** Not a row.
- **Skeleton over consonants:** counting after matres removal collapses
  `נִידַּ׳` (3 printed letters) to 2 and halves the population
  arbitrarily; the abbreviation's identifying power is what the reader
  sees printed. **Whichever is chosen must be stated in the row — the
  28-vs-12 gap at K=3 is entirely this choice, a bigger swing than the
  threshold itself.**

### The description's scope clause is factually stale

*"outside the abbrev-mislink rule's scope"* is no longer true.
`abbrev-mislink` was widened per round 1's own recommendation and now
catches 100% of arm A. Only arm B (33 occ) is new detection work; arm A
is a **re-judgement of hits the detector already emits**.

## What would have falsified this

**If the printed-morphology-list members (`Pl. X, Y, Z׳`) had turned out
to be mislinks rather than correct back-links, the mislink condition
would be unnecessary and the population would be 97, not 28.** Looked
for directly — 10 uniformly random members of that 69-occurrence class,
each read with 200 characters of context (P00255, K00711, S00038,
B00289, D00450, C00849, J00621, O01218, A01525, S01261). Every one
anchors to its own entry or to a declared variant of it. The class held;
the mislink condition stays.

Second falsifier, for the exclusions: **if the four `consonants`-identical
targets had been distinct homographs rather than spelling variants, they
would be defects and the exclusion wrong.** Each entry's definition was
read — M01946 is a literal `v. מִסְכֵּן` cross-reference, P00267 a
`v. sub` to the plene sibling, S00935/S00936 the קַיָּים/קְיָים pair
printing each other's abbreviated plurals. All spelling variants.

**Could not determine:** whether S00935→קַיָּם is Sefaria pointing at a
deliberately separate lemma or a collapse. The data does not settle it;
excluded, which is the conservative direction.

## The audit flag, tested and refuted

**`plural-inflection-anchor-escapes-entry` (1,417) — the source of the
flag. The 137 and the 765 are not measuring the same shape.**

Their population requires the display to *equal* a declared form; because
`plural_form`/`alt_headwords` **themselves store geresh-abbreviated
strings** (3,685 such forms across 2,814 entries — see
`abbrev-in-alt-headwords`, 2,035), a large slice of their members are
geresh displays by construction. Reproducing that shape: 1,114 geresh
anchors equal a declared own form, 366 of them escape the entry — and
**330 of those 366 have only one or two letters before the geresh**,
exactly what this row's stated ≥3 threshold excludes and what the three
generic-geresh rows already own. Direct intersection with this row's
population: **11 occurrences of 366.**

**The lead is not confirmed.** The 765 is a different, mostly-two-letter
shape. The row is not 5× under-measured; on its own terms it is roughly
**2.6× over-measured** (137 → 52).

## Overlap

- **`abbrev-mislink` (detector rule, 736 entries)** — not a catalogue row
  but the decisive overlap: 28/28 of arm A already fire it. Sequencing
  hazard: any transform here contends with the live hint.
- **`multiword-abbrev-mislink` (22)** — 5 of the 28 raw hits are exactly
  its `bet X׳ / bar X׳ / b'ne X׳` shape (A00742, C01291, H00448, H00464,
  H00843). Excluded here; **5 named instances against a catalogued 22
  suggests that row may also be under-measured.**
- **`geresh-abbrev-fixed-sink` (572)** / **`prefixed-geresh-abbrev-mislink`
  (173)** / **`geresh-letter-numeral-mislink` (608)** — the ≥2 tier lands
  almost entirely in these three. The concrete reason not to carry 355.
- **`abbrev-in-alt-headwords` (2,035)** — the upstream cause of arm A:
  the abbreviated form is in `alt_headwords` because the extractor stored
  the print abbreviation rather than the expansion. Fixing that row would
  change what arm A can even see.
- **`homograph-collapse-link` (1,253)** — no material overlap;
  geresh-terminated displays are routed away from the skeleton rules by
  `anchorHints`.
