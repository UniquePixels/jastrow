# Body Census — Value Spaces and Edge Classes for the Body Model

The entry-body-model toolkit ([design doc](../specs/2026-07-11-entry-body-model-design.md),
[implementation plan](../superpowers/plans/2026-07-11-entry-body-model.md))
turns each source entry's free-text `content.senses` into the structured
`BodyEntry` shape the app renders. Several of its parse rules (grammar
markers, sense-label sequencing, lettered sub-senses, citation unit
boundaries, ibid linking) were sized from small samples during the design
session. This census re-measures every one of them over the full corpus so
the fixtures and rule vocabularies later tasks build are evidence, not
guesses. Produced by `bun admin/pipeline/body/census.ts` (`bun
body:census`) over `data/source/jastrow-dictionary.jsonl` (32,512 entries);
machine output in `data/source/body-census-report.json` (regenerable, not
committed — data-architecture spec D2).

## Headline

| Measure | Count |
|---|---|
| Entries | 32,512 |
| Definitions (recursive sense walk, nodes carrying `definition`) | 44,668 |
| Distinct `content.morphology` values | 8 |
| Broken sense-number sequences | **72** |
| Entries with a lettered `a)…b)` run | **189** |
| Citations found (`findCitations` hits) | 164,808 |
| — well-formed | 164,328 |
| — malformed | 480 (nested-duplicate 475 / runaway-href 2 / recovered-loss 3) |
| — slash-less external hrefs (of well-formed external) | 7,659 |
| Ibid tokens, linked / unlinked | 8,403 / 7,017 |
| Preamble openers: empty / non-gloss / gloss | 124 / 27,907 / 4,481 |

## Finding 1 — gender/POS markers are an 8-value closed set

`content.morphology` takes exactly 8 distinct values corpus-wide, dominated
by the two grammatical genders:

| Marker | Count |
|---|---|
| `m.` | 6,970 |
| `f.` | 4,175 |
| `m. pl.` | 629 |
| `pr. n. m.` | 534 |
| `pr. n. pl.` | 432 |
| `f. pl.` | 193 |
| `pr. n.` | 173 |
| `pr. n. f.` | 56 |

Confirms the design doc's read (§ grammar table): the marker vocabulary is
small and closed, well within reach of an exhaustive parse table rather
than a heuristic.

## Finding 2 — 72 broken sense-number sequences, not 524

The count only holds when the sequence check is scoped to each entry's
**top-level** `content.senses` numbers. Folding nested sub-sense numbers
into one flat sequence (the first pass at this census did exactly that)
manufactures 524 "breaks" that aren't really there — a sub-sense nested
under a grammar node routinely restarts its own numbering (`1)`, `2)`)
independently of its parent's sequence, and a naive recursive walk treats
that restart as corruption. Scoped to the top level, the real defect count
is 72, matching the design doc's independent estimate exactly. Examples
(`rid`: observed sequence):

- `A00675`: `[2]` — sequence opens on 2, no 1
- `A00913`: `[2]`
- `A01350`: `[1, 3, 4]` — skips 2
- `A01662`: `[2]`
- `A01989`: `[1, 3, 4]`
- `A03089`, `A03104`, `A03277`: `[2]`

**Correction (maintainer review pass):** the 72 are not one class. Most
of the "opens on 2" shape isn't a dropped first sense-number at all —
it's a phantom sense: Sefaria's importer chopped a parenthesized
cross-reference or citation (`(v. אוֹר 2)`, `(play on X, Gen. XLI, 2)`)
at its own `N)`, splitting one printed flow into a fake sense boundary.
`classifySequenceBreak` (`admin/pipeline/body/census.ts`) detects this
by checking whether the tag-stripped text immediately before the bare
(dash-less) non-1 number has an unclosed `(` — the fingerprint of the
chop — and reports one of four classes per broken entry (measured, not
assumed uniform):

| Class | Count | What it means |
|---|---|---|
| `crossref-chop` | 35 | phantom sense from a chopped cross-reference (28 detected from the preceding sense text, 7 only after prepending the entry's morphology/language-code/language-reference fields, where the chopped paren opens instead) |
| `numbering-gap` | 35 | a genuine missing/odd number (plain index gaps like `[1, 3, 4]`, plus 3 cases where a bare non-1 label turned out to be a legitimate dash-less sense — not damage — leaving the entry's real gap elsewhere) |
| `citation-chop` | 1 | phantom sense from a chopped citation mid-sequence (`C00244`, `(play on Abigdor I Chr. IV, 4)`) |
| `unclassified` | 1 | doesn't fit either pattern (`C01169`: an asterisk-prefixed `*2)` opening the entry with balanced preceding parens — no phantom evidence, but not a plain index gap either) |

`crossref-chop` and `citation-chop` both quarantine to the same
disposition — heal at migration by rejoining the phantom sense into the
preceding text. `numbering-gap` and `unclassified` are genuine eyes-on
review, no proposed automatic fix. Full breakdown and per-row evidence:
`docs/v2/body-review/01-broken-sequences.md`.

## Finding 3 — same pitfall almost hit `totals.definitions`

The first pass counted every node `walkSenses` visits (49,131), including
container nodes that hold only `grammar`/nested `senses` and no gloss text
of their own. Restricting the count to nodes that actually carry a
`definition` field gives 44,668 — the number this report keeps, and the
one the fixture fund and dry-run pass should reconcile against.

## Finding 4 — citation malformation is tiny and already characterized

164,808 citation anchors total; 164,328 (99.7%) are well-formed. The 480
malformed hits decompose exactly as the citation-detector's own tests
predicted:

- **475 nested-duplicate** — the benign Sefaria quirk where an anchor's
  open tag immediately wraps an identical inner anchor (same href/data-ref).
  Harmless; the inner hit still carries the citation.
- **2 runaway-href** — the anchor's own href attribute quote never closes
  and runs into markup (`href="/Jastrow,_..."` followed directly by
  `</a>`). Both instances are on the anchors' own open tags at `D00478`
  and `J00597`.
- **3 recovered-loss** — a genuine anchor whose `</a>` is missing from the
  source, previously invisible before the citation-detector's
  never-drops-a-valid-anchor fix. All three are the damage-site rids
  already known from `cite.test.ts`'s fixtures and the baseline audit:
  `D00478`, `J00597`, and `J00603`.

7,659 well-formed external citations (4.7% of the 164,328) have hrefs
missing the leading slash (`href="Jerusalem_Talmud_Nedarim.5.6.3"` instead
of `href="/Jerusalem_Talmud_Nedarim.5.6.3"`) — the same quirk the design
doc flagged from A00014's fragment, now sized exactly.

## Finding 5 — unit-boundary terminator distribution matches the design estimate

Classifying the tag-stripped text immediately before every well-formed
**external** citation (96,689 of them) into its terminating punctuation:

| Class | Count | Share |
|---|---|---|
| period | 62,033 | 64.2% |
| semicolon | 13,730 | 14.2% |
| embedded | 9,463 | 9.8% |
| dash | 6,678 | 6.9% |
| comma | 3,435 | 3.6% |
| sense-start | 1,350 | 1.4% |

This reproduces the design session's own hand-measured estimate (64.4% /
13.9% / 6.6% / ~10%) to within a point on every class it already tracked,
with `comma` broken out as its own bucket here rather than folded into
`embedded`. The conservative segmentation rule (§4: break before an
external citation iff the preceding text ends `.`/`—`/sense-start; `;`/`,`
continue a citation list) is confirmed against the full corpus, not a
sample.

## Finding 6 — ibid linking: 8,403 / 7,017, one off the design estimate

Of 15,420 `ib.`/`ibid.` tokens (case-insensitive, not preceded by a
letter), 8,403 fall inside an anchor span and 7,017 sit in bare prose. The
design doc's design-session figure was 8,403 / 7,018 (15,421 total) — a
single-token discrepancy, immaterial to the linking-pass sizing it informs
(§5, "new register item"), and left unreconciled rather than chased
further; it's within the noise of a hand-measured estimate against a
mechanical recount.

## Finding 7 — preamble openers: the "non-gloss" bucket is mostly a formatting artifact

Classifying the first sense's opening (tag-stripped) by its first
character: 124 entries open on nothing at all (empty), 4,481 open directly
on gloss text, and 27,907 — the overwhelming majority — classify as
"non-gloss" (`/^[\s,(]/`). Spot-checking that bucket shows it's driven
almost entirely by a leading space before the gloss (`" often used to
form second roots of verbs…"`, `A00001`), a print-formatting convention
carried through from the source, not a distinct semantic class of
cross-reference-first entries. Any rule consuming this classification
should strip leading whitespace before testing for a real non-gloss
opener (comma continuation, parenthetical), or this bucket will look far
larger than it functionally is.

## Finding 8 — lettered sub-sense candidates: 189 entries

189 rids contain an `a)…b)` run in some definition (of 44,668, roughly
0.4%), close to the design doc's ~190 estimate. Examples: `A00996`,
`A01111`, `A01873`, `A01930`, `A01999`, `A02971`, `A03323`, `B00638`. Small
enough to fixture exhaustively rather than sample (Task 4).

## Verdict

Every rule vocabulary the design doc estimated from a sample now has a
full-corpus count behind it, and every estimate held up: marker set (8,
closed), broken sequences (72, once correctly scoped to the top level),
unit-boundary distribution (within a point of the hand measurement),
ibid linking (within 1 of 15,420), and lettered candidates (189 vs ~190).
The one place the first pass diverged sharply — broken sequences (524 vs
72) and total definitions (49,131 vs 44,668) — was a measurement bug in
this tool (recursing into nested numbering, counting container nodes with
no gloss), not a surprise in the data; both are corrected in the committed
report. Nothing here blocks Task 4's fixture selection or Task 6's grammar
`VOCAB`.
