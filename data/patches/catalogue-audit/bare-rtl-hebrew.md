# Audit — `bare-rtl-hebrew` (catalogued 4,900)

**Verdict: RE-SCOPE to 4,472 senses / 4,190 entries.** The count is
substantially sound — a −8.7% correction, not a `same`-scale one. The
*description* is the part that would have misled a transform author.

## Probe and raw figure

Parse each `content.senses[].definition` (recursively) as HTML with a
real `HTMLParser`, walk every text node, report those containing Hebrew
where **no ancestor element carries `dir="rtl"`**.

| Measure | Figure |
|---|---|
| bare Hebrew **text nodes** | 5,679 |
| bare Hebrew **runs** (contiguous Hebrew tokens) | 6,248 |
| distinct **senses** | **4,898** |
| distinct **entries** | 4,545 |

Denominators: 44,668 senses with a definition, 42,460 of which contain
Hebrew; 32,512 entries.

**The catalogued 4,900 is a sense count and reproduces to within 2
(0.04%).** `docs/v2/pattern-triage.md` independently records "4,924
sense texts (4,570 entries)"; the ~26-sense gap is scope, not error —
that probe took Hebrew outside *any* `span`/anchor, this one takes
Hebrew outside any `dir="rtl"` element (only 3 nodes sit inside a
non-RTL `<a class="refLink">`).

**Methodological caution, recorded because it nearly changed the
verdict:** the auditor's first three scratch probes used a pasted
literal character class in which `יִ` decomposed to yod + hiriq,
silently producing the range `U+05B4–U+FB4F` — which swallows em-dashes,
superscript letters and curly quotes. Node/sense/entry counts were
unaffected, but run-level and adjacency figures were inflated ~9% **and
the sub-lemma job below was invisible**. Every figure here comes from a
class built with `chr()` and guarded by
`assert not re.search("["+H+"]", "—ᵃ'(")`.

## Does this population have more than one job? — yes, one

Every one of the 6,248 bare runs was classified by the markup slot it
occupies, then the **wrapped counterpart rate in that same slot** was
measured corpus-wide. That ratio is the discriminator: a slot where the
corpus overwhelmingly wraps is a slot where bareness is an omission; a
slot where the corpus never wraps is a construct with its own rule.

| Slot | Bare | Wrapped in same slot | % bare | Verdict |
|---|---:|---:|---:|---|
| quotation text after a citation `</a>` | 3,496 | 35,437 | 9.0% | **DEFECT** |
| parenthetical after `(` (etymology / variant reading) | 1,256 | 4,919 | 20.3% | **DEFECT** |
| after an italic gloss `</i>` | 243 | 2,183 | 10.0% | **DEFECT** |
| after `</span>` (continuation of a wrapped run) | 0 | 1 | — | n/a |
| em-dash + Hebrew, **not** followed by a gloss | 28 | 1,242 | 2.2% | **DEFECT** |
| **em-dash + Hebrew + `<i>` gloss (sub-lemma header)** | **473** | **0** | **100%** | **CONVENTION** |
| definition-initial | 172 | 195 | 46.9% | mixed — see below |

**The second job is the sub-lemma header.** Jastrow introduces a
sub-entry — an idiom, a construct phrase, a prefixed form — as
`—<Hebrew phrase> <i>gloss</i>`. In that exact slot the corpus is
**473 bare against 0 wrapped**, across all 32,512 entries; neither
`<span dir="rtl">` nor `<a dir="rtl">` appears there once. Second check:
of the **606 distinct Hebrew strings** used as sub-lemma headers, **0**
appear wrapped anywhere else in the corpus.

The definition-initial slot is the same construct at the head of a
nested sense: 165 of the 172 bare instances are followed immediately by
an `<i>` gloss, against 28 of the 195 wrapped ones — and those 28, read
individually, are etymology parentheticals and plural forms that merely
happen to precede an italic.

**Combined sub-lemma population: 625 runs, 545 senses, 527 entries.** Of
those, **426 senses contain no bare Hebrew of any other kind** — wholly
convention.

Honest limit: 100% consistency proves the construct is *systematic*, not
that it is *correct*; the printed 1903 edition was not consulted. The
operational conclusion is the same either way — this is a distinct
construct with its own rule, and a transform written to the row's
current description would treat these 545 senses as identical omissions
and insert a wrapper the source uses **nowhere** in that position.

**Jobs looked for and not found:** marks-only fragments needing no
wrapper (9 nodes of 5,679); single-letter alphabet names where bidi is a
no-op (2 nodes); RTL inherited from an ancestor (5,676 of 5,679 sit at
the definition root with no enclosing element); a wholly-unwrapped
stratum from a different source pass (4,627 of 4,898 hit senses, 94.5%,
contain correctly wrapped Hebrew *in the same definition*; only 271 have
none).

## Sample read

`random.seed(1234); random.sample(rows, 10)` over the 4,898 hit senses —
uniform, unfiltered. **10/10 DEFECT.**

| rid | headword | Judgement |
|---|---|---|
| P01066 | עָפַל | Quotation after `Sabb. 97ᵃ`; the parallel quotation two clauses later *is* wrapped. Same definition, same job, one wrapped one not |
| D00690 | דֵּיצָא | Leading etymology root; the plural `דִּיצִין` in the same definition is wrapped |
| A00448 | אַדְרָא | Em-dash variant-spelling header followed by a *citation*, not a gloss — the 2.2%-bare slot, not the sub-lemma slot |
| C00282 | *גּוּבִּיתָא | Quotation after `Y. Orl. III`; the definition has no wrapped Hebrew at all (one of the 271) |
| U01516 | שַׁמְּעָא | Quotation after `Ber. 62ᵃ`; the next quotation is wrapped. Also carries an ASCII `"` for gershayim |
| A02408 | אִסְטְרָטָא | Quotation after a citation, in a definition that wraps three other Hebrew runs |
| C00166 | גָּדַד I | Quotation after `Keth. 51ᵃ`; the variant `ליגזז` immediately after is wrapped |
| C01183 | גַּעְגַּע | Two quotations bare in a definition with four wrapped runs |
| O01404 | סָפַק II | Quotation after `Taan. 21ᵃ`; the Y. Ber. parallel is wrapped |
| M01073 | מִי II | Quotation after `Pes. 49ᵇ`; `מי יגלה וכ׳` earlier in the same sense is wrapped |

Supplementary draw over the sub-lemma subset (`seed 99`), all
**CONVENTION**: N00484 `—נ׳ ימא <i>sea-farers</i>`, M00469
`—מוֹהָא <i>her (its) waters</i>`, E00650 `ה׳ ד־ <i>he who</i>`, U01351
`—שאל בש׳ <i>to inquire after the health of</i>`, E00506
`—בתר ה׳ <i>afterwards</i>`, H00367 `ימא דח׳ <i>Sea or Lake of Ḥulta</i>`.

## Letter A

Present, slightly under-represented, not absent: **408 of 3,457 A
entries (11.8%) / 422 of 4,134 A senses (10.2%)**, against corpus-wide
4,545 of 32,512 (14.0%) and 4,898 of 44,668 (11.0%). A holds 9.0% of hit
entries against 10.6% of the corpus. The rate is essentially flat across
all 22 letters (low L 11.1%, high R 17.2%) — no letter-shaped stratum.
Of A's 422 hit senses, **67 are sub-lemma-header convention** and **365
senses / 357 entries** fall in the defect subset.

## Disposition

**RE-SCOPE** to the slots where the corpus demonstrably wraps and this
instance does not, excluding the sub-lemma-header construct.

| | Senses | Entries | Runs |
|---|---:|---:|---:|
| catalogued | 4,900 | — | — |
| measured, as described | 4,898 | 4,545 | 6,248 |
| sub-lemma-header convention (remove) | 545 (426 exclusively) | 527 | 625 |
| **defensible defect subset** | **4,472** | **4,190** | **5,623** |

New description: *Hebrew run in definition text with no `dir=rtl`
wrapper, in a slot where the corpus wraps 80–98% of the time (quotation
after a citation anchor, etymology/variant parenthetical, after an
italic gloss, em-dash header without a gloss); excludes the sub-lemma
header `—<Hebrew> <i>gloss</i>`, which the corpus writes bare in 473 of
473 instances.*

## What would have falsified this

- **A wrapped counterpart for the sub-lemma header.** If the corpus
  wrapped sub-lemma headers even 5% of the time, bareness there would be
  omission, not rule, and the re-scope collapses. Searched the exact
  slot (473 bare, 0 wrapped) and all 606 distinct header strings for a
  wrapped occurrence anywhere in the corpus (0 of 606).
- **The mirror case — bareness being the corpus-wide norm**, which would
  make the whole 4,900 a convention and the row wholly false. Measured:
  the corpus wraps 90.0% of post-citation quotations, 79.7% of
  parentheticals, 90.0% of post-gloss Hebrew, 97.8% of em-dash headers
  without a gloss. Bareness is the minority everywhere except the one
  slot named above.
- **A whole-entry stratum** (a source pass that never wrapped anything),
  which would make entries rather than instances the unit. 94.5% of hit
  senses wrap other Hebrew in the same definition.
- **The members not really being Hebrew** — the character-class bug
  above proves this was a live risk. 5,670 of 5,679 nodes contain actual
  Hebrew consonants; 9 are marks-only.

**Could not determine:** whether the sub-lemma header is bare in the
*printed* dictionary too, and whether bare Hebrew actually mis-renders
in the app. The Unicode bidi algorithm resolves a pure Hebrew run
correctly inside an LTR paragraph without any wrapper; the wrapper
matters at neutral boundaries. **4,691 of the 5,679 bare nodes mix
Hebrew and Latin in the same text node**, so a transform must delimit
the run *inside* the node — wrapping the node whole would drag English
words, Roman numerals and parentheses into an RTL context. No renderer
exists in this repository to test against.

## Overlap

- **`reversed-hebrew-phrase` (27, r2)** — "short **bare-Hebrew** phrase
  stored with its words in reverse." A strict subset by construction;
  those 27 are counted twice across the catalogue.
- **`ascii-quote-as-gershayim-in-body` (1,234)** — scoped explicitly to
  "inside `dir=rtl` body text". **231 bare runs here sit adjacent to an
  ASCII `"` used as gershayim** (113 text nodes; U01516, M01073 in the
  sample). Same defect in the complementary population, **counted by
  neither row.**
- **`etymology-head-pseudo-sense` (1,553)**,
  **`preamble-stranded-lead-sense` (676)**,
  **`bracketed-gloss-lead-sense` (49)** — all concern the leading
  etymology parenthetical, which supplies **890 runs / 884 senses** here.
  96 hit senses consist of nothing but a parenthetical.
- **`redundant-outer-rtl-span` (529)** and **`latin-token-inside-rtl-span`
  (130)** are the exact inverse failures — over- and mis-application of
  the same wrapper. **Any Phase 2 transform should be written against
  all three at once, or it will trade one for another.**
- **`unlinked-v-span` (796)** and **`unlinked-stub-nonexistent-target`
  (451)** describe `v. <span dir=rtl>X</span>` cross-references —
  wrapped, so disjoint. Only 2 bare runs follow a `v.`, so this row does
  not conceal an unlinked-stub population.
- **`citation-quote-seam-period` (43)** is the same `</a>`-to-quotation
  seam this row's largest job occupies, scoped to the wrapped side.
- **`nonsense-dup-anchor` (1,220)** covers non-sense fields. For the
  record, bare Hebrew outside definitions is rare: of 4,473
  `language_reference` values containing Hebrew, only **14** are bare.
