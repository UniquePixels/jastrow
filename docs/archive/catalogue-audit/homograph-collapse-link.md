# Audit — `homograph-collapse-link` (catalogued 2,957)

**Verdict: RE-SCOPE to 1,394 occurrences / 1,253 entries — and do NOT
write a deterministic transform even against the re-scoped row.** The
count could not be reproduced in either direction; the description is
true of 26.8% of what its probe returns; and the read sample of the
*refined* subset is still roughly half correct links.

## Probe and raw figure

Terms operationalised from the description alone: *skeleton* = string
with all niqqud/cantillation/geresh/punctuation stripped (`[^א-ת]`
removed); *unvocalized Hebrew display* = anchor text of an internal
`data-ref="Jastrow, …"` link with ≥1 Hebrew letter and zero niqqud;
*shared by ≥2 headwords* = skeleton index over `headword` +
`alt_headwords`; *resolves context-free to one fixed homograph* = the
`data-ref` names exactly one target.

**5,210 occurrences / 3,942 entries** (1,534 distinct display strings,
1,425 distinct skeletons). Denominator: 72,222 Jastrow refLink anchors,
64,697 with Hebrew in the display, 12,347 of those unvocalized.

**2,957 could not be reproduced.** A 48-cell grid was swept
(headword-only vs +alt_headwords × min skeleton length 1/2/3 ×
exclude-geresh × exclude-Roman × include/exclude `language_reference`).
Nearest results: 2,966 entries, 2,945 entries, 2,970 occurrences — no
cell hits 2,957. The figure appears to be an entry count from a variant
excluding geresh abbreviations, but its provenance is not recoverable
from the description. **Recorded as a discrepancy, not a match.**

## Does this population have more than one job? — at least seven

A strict funnel over the 5,210; removals sum exactly to the total.

| Occ | Job | Verdict |
|---:|---|---|
| 1,310 | display is a **single Hebrew letter** (`ג׳`, `ת׳`, `מ`) — Jastrow's abbreviation of the host headword, whose "skeleton" collides with the alphabet-letter articles `ג`/`ג ²`/`ג׳`. No homograph is being chosen | CONVENTION (mislinks here belong to the geresh rows) |
| 1,119 | **display exactly equals an existing unvocalized headword** (`נקי`→`נקי`, `עני`→`עני`). The corpus genuinely carries unvocalized lemmata; the link resolves to the lemma. Nothing collapsed | CONVENTION |
| 957 | the ≥2 "sharing headwords" carry **only one distinct vocalization** — numbered sub-entries of one lexeme, or a Hebrew + `ch.` cognate pair (the `X ch. same` story again). There is no homograph to pick wrong | CONVENTION |
| 300 | **multi-letter geresh abbreviation** (`קט׳`, `כי׳`) | CONVENTION / other row |
| 97 | link resolves **outside** the display's skeleton set entirely — an outright mislink, not a collapse | DEFECT, wrong row |
| 33 | display **already carries its own Roman numeral** (`טרד II` → `טְרַד II`) — not context-free by construction, a false positive of the description itself | FALSE POSITIVE |
| **1,394** | **genuine homograph collapse**: multi-letter unvocalized word, ≥2 distinctly vocalized headwords share the skeleton, link lands inside that set | mixed — see the sample |

**The description is true of 1,394 of 5,210 (26.8%).** The single largest
driver of the raw figure is the alphabet-letter abbreviation collision,
which is not a lexical phenomenon at all.

## Sample read

Three random draws, no cherry-picking: 12 from the full 5,210
(`seed 20260818`), 8 from the pre-refinement class (`seed 777`), and 8
from the 1,394 defensible members (`random.Random(99)`). Judgements on
the primary 8:

| rid | Case | Verdict |
|---|---|---|
| J00548 | יָצַר `(cmp. צרר)` → `צָרַר I`, whose own definition is the stub `" v. צוּר II)"`. Six candidates, pick unjustified | DEFECT (low confidence) |
| M01297 | מֵירוּר `על (שם) מ׳` → **`שֵׁם I` = "pr. n. m. Shem, son of Noah"**. The idiom `על שם` is `שֵׁם II` "name, account" | DEFECT, unambiguous |
| E00156 | הִדְרוֹקָן `(חולה) ה׳` → `חוֹלֶה` "sick; a patient", against `חוֹלָה I`/`II` | CONVENTION — correct pick |
| S00823 | קָטַר I `עטר` → `עֲטַר I`. But `עֲטַר III` (P00478) reciprocally cites `קטר` in its own etymology | DEFECT, verifiable from the reciprocal link |
| D01075 | דְּרוֹר `, v. דור)` → `דּוּר I` "to form a circle"; `דּוֹר` "circle, period" equally available | UNDETERMINED |
| D00396 | *דְּחַד `h. text ענק Hif.` → `עֲנָק I` = "**giant**". The text is Deut. XV:14 `העניק תעניק`, the verb `עָנַק` Hif. A Hif'il verb resolved to a noun | DEFECT |
| C00642 | גִּידּוּר `(גדר) fencing in` → `גֶּדֶר I` "fence" (a noun) where a verbal noun's etymology should reach the verb | DEFECT (arguable) |
| B00223 | *בּוֹזָנָא `(בוז, בזז) plunderer` → `בָּזַז` "to make spoil" | CONVENTION — correct |

**4 DEFECT / 2 CONVENTION / 2 UNDETERMINED. Even the refined subset is
roughly half correct links.**

The earlier draws are what exposed the contamination: A03391 linked `(ש`
— the *letter shin* named in an Athbash explanation — to a lexical
entry; A01466 linked `כו` from the sentence "`כו` mistaken for `ט`" (a
letter-shape discussion) to the noun `כַּו`; K00603 linked the
abbreviation `הכי׳` (= the host headword `כִּיפָּה`) to `כִּנָּרָא`.

## Letter A

Non-zero and **over-represented** at every stage. A is 10.6% of the
corpus. Raw probe: 895 occ / 612 entries (15.5% of member entries).
Defensible subset: **259 occ / 216 entries (17.2%)**. The pilot tranche
will meet this pattern; it is not a tail-letter artifact.

## Disposition

**RE-SCOPE to 1,394 occurrences / 1,253 entries / 428 distinct
skeletons.**

New description: *multi-letter unvocalized Hebrew anchor display,
neither an abbreviation nor an existing unvocalized headword, whose
skeleton is shared by ≥2 distinctly vocalized headwords, resolved
context-free to one member of that homograph set.*

Reproducing probe: from the 5,210, additionally require skeleton length
≥2; no Roman numeral in the display; no geresh/gershayim in the display;
the display (numbering stripped) is not itself an existing unvocalized
headword or alt_headword; ≥2 distinct vocalizations among entries whose
**headword** skeleton matches (not alt_headwords); and
`skeleton(target) == skeleton(display)`.

**Do not write a deterministic transform against even the re-scoped
row.** At a ~50% defect rate on the read sample, an automated re-target
would rewrite as many correct links as wrong ones. This subset is a
**review queue, not a rewrite rule.** The tractable deterministic
sub-slice is the 299 parenthetical/root-etymology occurrences where the
host is a derived form and the target is a *noun* in a set containing a
verb (the S00823 / D00396 / C00642 shape) — that direction is checkable
against reciprocal cross-references.

## What would have falsified this

The row would have been **discarded**, not re-scoped, if the chosen
homograph were systematically correct. Checked directly, by comparing
each sampled target's gloss against the host entry's context and, where
available, against the target's own reciprocal cross-reference. It cuts
both ways — E00156, B00223 and (in the seed-777 draw) A01043
`(חסן)`→`חֹסֶן` and I00363 `(טול)`→`טוּל I` are correct picks; M01297,
S00823, D00396 are demonstrably wrong. That mixture is why the
disposition is re-scope-and-review rather than confirm or discard.

Second falsifier, negative: **is a disambiguator present in the
surrounding text**, making the display not context-free? Across the
2,082 pre-refinement members a Roman numeral follows the anchor in only
**4** occurrences; 2,078 have none. The "context-free" half of the
description holds.

Third: whether 2,957 is a floor or a ceiling. **Neither** — the literal
reading is 76% higher, the defensible reading 53% lower.

## Overlap

Every contaminant class removed already has a home in the catalogue,
which is itself evidence the row was measured too broadly:

- 1,310 single-letter abbreviations → `geresh-letter-numeral-mislink`
  (608), `geresh-abbrev-fixed-sink` (572),
  `prefixed-geresh-abbrev-mislink` (173)
- 300 multi-letter abbreviations → `inflection-abbrev-mislink` (137),
  `multiword-abbrev-mislink` (22), `abbrev-in-alt-headwords` (2,265)
- 33 displays carrying their own Roman numeral →
  `homograph-numeral-mismatch` (538)
- 97 out-of-set resolutions → `interior-consonant-mislink` (495),
  `neighbor-rid-mislink` (655), `dataref-skeleton-absent` (2,572),
  `plural-inflection-anchor-escapes-entry` (2,281)

Live overlap remains *within* the re-scoped 1,394: **61 occurrences**
target the bare unnumbered base of a numbered homograph family
(`homograph-numbering-schism` 3,421, `unnumbered-terminal-homograph`
129), and **230 occurrences** sit in `Ms./ed./Var./read/h. text`
variant-reading context (`corrigendum-reading-linked` 330). Deduct or
cross-flag these before treating any count as independent — **the truly
unclaimed core is on the order of 1,100 occurrences.**
