# Audit — `superscript-subsection-stranded-outside-anchor` (catalogued 160)

**RULED 2026-08-26 (Brian): SHIP the boundary rule, SPLIT the 38.** The
recommendation below was taken on the evidence in §§1–5. The 38
occurrences / 33 entries are now their own row,
`superscript-subsection-contradicts-link-sub-section` (`route:
judgment`, `corpusCount` 33 **entries**), its predicate written against
the **post-transform** shape. The 77 no-sub occurrences are disposed of
by an explicit sentence in the parent row's `reason` — see "A third
disposition" below.

**Verdict: the boundary repair is correct on both sides of the
disagreement, and it stands.** Moving `</a><sup>N</sup>` to
`<sup>N</sup></a>` relocates three tokens and touches no `href`, no
`data-ref`, and no character of text. Whether the printed superscript or
the link's sub-section turns out to be right is a question about the
*value* in `data-ref`; which element encloses the printed glyph is not
that question, and no answer to it changes the move.

**Recommendation, TAKEN: ship the boundary rule (182 occurrences / 160
entries,
already shipped as `superscriptInsideAnchor` in
`admin/pipeline/transform/rules/stranded-tail.ts`) and split the
38-occurrence target disagreement out as its own catalogue row with
`route: judgment`.** The 38 need per-entry adjudication against a text
this pipeline does not hold; they are `judgment` by definition and
cannot ride inside a row whose repair is a byte move.

**The alternative, declined:** withdraw `superscriptInsideAnchor` and hold
the whole row — all 182 occurrences / 160 entries — as `judgment` until
the 38 are adjudicated. What that buys is that no batch-4 rule touches
markup on any occurrence whose target is disputed. What it costs is 144
occurrences of an uncontested, information-free relocation deferred
behind an adjudication that needs a Sefaria-side reading this batch
cannot perform, plus the withdrawal of a rule with a green corpus tier.

**One correction the batch briefs and spec §4.2 both need.** Both state
that the flag's 105 / 67 / 38 split "was measured on a different
population" from this row's 182. **It was not.** Measured directly here:
all 182 occurrences are Midrash Rabbah anchors, and the 105 is exactly
this row's sub-section-bearing slice. The two populations are nested,
not disjoint — see "The two populations are the same population" below.

Everything below is measured on the pinned snapshot
(`data/source/jastrow-dictionary.jsonl`, sha256 `4c64ff03…`, verified
against `data/patches/snapshot.lock` before the run), walking every
`content.senses[].definition` recursively through `sense.senses` across
all 32,512 entries, using the rule's own predicate: `tokenize`,
`anchors`, then the literal three-token shape `<sup>` · one text token ·
`</sup>` immediately after a usable anchor's `</a>`. **`occ` is
occurrences, `ent` is distinct entries.**

## The population

| Figure | Row claims | Measured | |
|---|---|---|---|
| occurrences | 182 | **182 occ** | ✓ |
| entries (`corpusCount`) | 160 | **160 ent** | ✓ |
| letter `T` | 36 / 33 | **36 occ / 33 ent** | ✓ |
| letter `U` | 98 / 85 | **98 occ / 85 ent** | ✓ |
| letter `V` | 48 / 42 | **48 occ / 42 ent** | ✓ |
| any other letter | 0 | **0** | ✓ |

Occurrences per entry: **140 entries hold 1, 18 hold 2, 2 hold 3** —
140 + 36 + 6 = 182. Every superscript's text is a bare number (0
non-numeric). No occurrence is refused by the rule's `usable` gate: none
of the 182 anchors is malformed, unclosed, or inside another tag's
damaged attribute interior, so the rule's population is the measured
population exactly.

## The two populations are the same population

The row's audit flag reads: *"the midrash-subsection-link-drift audit
measured this row's population at 105 occurrences … of which 67 have a
superscript matching the link's sub-section and 38 contradict it."*
Spec §4.2 and the batch-4 task briefs treat that 105 as a **different**
set from this row's 182, measured on Midrash Rabbah anchors during
another audit, and warn that its numbers may not transfer.

Measured directly, they nest exactly:

| | occ | ent |
|---|---:|---:|
| this row's population | **182** | **160** |
| — with a Midrash Rabbah `data-ref` | **182** | 160 |
| — `data-ref` carries a sub-section (`Book C:S`) | **105** | 93 |
| — — `<sup>` **agrees** with the sub-section | **67** | 63 |
| — — `<sup>` **contradicts** it | **38** | 33 |
| — `data-ref` carries **no** sub-section (`Book C`) | **77** | 70 |

**All 182 are Midrash Rabbah**, so there is no non-Rabbah remainder for
the drift audit's scope to have excluded. The drift audit's population
required a sub-section by construction; its jobs A (67) and A′ (38)
therefore *are* this row's 105 sub-bearing occurrences, and the 77 it
omitted are precisely the ones its own predicate could not admit. The
row's round-3 write-back (67 / 38 / 77 = 182) was arithmetically right
and is here **re-measured directly rather than inherited**.

Books, by class: contradicting — Bamidbar Rabbah 34, Shemot Rabbah 3,
Devarim Rabbah 1. Agreeing — Bamidbar 54, Shemot 7, Devarim 3, Vayikra
3. No sub-section — Bamidbar 64, Shemot 10, Devarim 1, Vayikra 1,
Bereishit 1. **6 entries carry occurrences of more than one class**, so
the classes are not an entry-level partition and cannot be routed by rid.

## Why the boundary move is correct on both sides of the 38

### 1. The chapter never disagrees. Only the sub-section can.

**182 of 182 occurrences have a display whose `s. N` equals the
`data-ref`'s chapter** — `Num. R. s. 10` against `Bamidbar Rabbah 10:1`,
with zero misses. The anchor is therefore addressing the section print
names, in every member of the row, including all 38 contradicting ones.
The disagreement is confined to the second numeric component. Nothing in
the row calls into question *which citation* the superscript belongs to
— only what its number should be.

### 2. The move changes no text and no target, by construction.

`superscriptMoveAt` returns
`[...tokens.slice(0, close), supOpen, supText, supClose, tokens[close], ...tokens.slice(close + 4)]`.
The anchor's opening tag is not in that expression at any index, so
`href` and `data-ref` are untouched. The three superscript tokens are
the same objects, in the same order. Reading order is unchanged; the
serialized text differs from the input by the position of one `</a>`.
Rendered, the reader sees the identical glyphs in the identical
sequence — the only change is that the superscript becomes part of the
link's clickable display.

### 3. The superscript belongs to the citation whether or not it is right.

A printed sub-section superscript in Jastrow marks the sub-section *of
the citation it follows*. That is a fact about typesetting, and it holds
in all three classes:

- **67 agree.** The superscript restates what the link already says.
  Moving it inside is unambiguously the correct nesting.
- **77 carry no sub-section in the ref.** The superscript is the only
  sub-section information in the record. Moving it inside preserves it
  where a reader and a later rule can both find it.
- **38 contradict.** The superscript is the *printed* sub-section of
  this citation. If print is right (9 of the 12 adjudicated), the
  superscript is the correct value and belongs inside the citation it
  qualifies. If the link is right (2 of 12), the superscript is a
  **wrong value for this citation** — still this citation's, still
  printed immediately after it, and still rendered in exactly the same
  place before and after the move. In the 1 of 12 where both are
  plausible, neither reading is disturbed.

There is no fourth possibility in which the superscript belongs to a
*different* citation, because §1 above shows the anchor and the
superscript always name the same chapter.

### 4. The move does not conceal the disagreement — it regularises it.

Because `data-ref` is untouched, `<sup>` against the ref's sub-section
remains fully comparable after the transform, and the shape becomes
**uniform** (`<sup>N</sup></a>` in all 182) where the snapshot mixes it
with unrelated post-anchor superscripts. Adjudication gets easier, not
harder.

**One consequence must be written into the new row:** its predicate has
to be stated against the **post-transform** corpus (`<sup>N</sup></a>`),
not against the snapshot (`</a><sup>N</sup>`), or it will measure zero
after the batch lands.

### 5. No mechanical rule recovers the right value, so nothing is lost by deferring it.

The 38 deltas (`sup` minus the ref's sub-section) are:

```
-17 ×1  -16 ×2  -14 ×1  -12 ×3  -11 ×1  -9 ×1  -6 ×2  -5 ×1
 -4 ×2   -3 ×1   -2 ×2   -1 ×9   +2 ×2  +3 ×3  +5 ×4  +11 ×1
+18 ×1  +20 ×1
```

Modal delta −1 at 9 of 38 (24%); 26 have `sup` < sub, 12 have `sup` >
sub. **No constant offset, no dominant direction, no recoverable
transformation.** The adjudication is genuinely per-entry against an
external text, exactly as the flag says. Its 33 entries: `T00292`,
`T00328`, `T00357`, `T00459`, `T00692`, `T01051`, `U00909`, `U01158`,
`U01173`, `U01175`, `U01184`, `U01190`, `U01195`, `U01281`, `U01335`,
`U01370`, `U01387`, `U01390`, `U01513`, `U01517`, `U01870`, `U01893`,
`U01960`, `U02003`, `U02008`, `V00122`, `V00176`, `V00219`, `V00271`,
`V00321`, `V00397`, `V00793`, `V01097`.

## A third disposition the row's `reason` implies and no rule delivers

The row's `reason` says of the 77: *"THOSE 77 ARE THE SAFEST
DETERMINISTIC SLICE: the stranded superscript is the only sub-section
information in the record, so appending it destroys nothing."*
"Appending it" describes writing the superscript's value into the
`data-ref` — `Bamidbar Rabbah 16` → `Bamidbar Rabbah 16:4`. **No shipped
rule does that.** `superscriptInsideAnchor` moves markup and deliberately
leaves every target alone.

So the row advertises a repair the batch does not perform, and the 77
would read as "handled" once the boundary rule ships.

**Disposed 2026-08-26: an explicit sentence in the parent row's
`reason`, not a row of their own.** They get a sentence rather than a
row because *nothing about them has been established as a defect*. A
`data-ref` reading `Bamidbar Rabbah 16` where print supplies a
sub-section is **less precise than print, not wrong** — and the
`midrash-subsection-link-drift` audit found that sub-section precision
is Sefaria's segment addressing working correctly, not drift. Opening a
catalogue row would assert a defect no audit has measured as harm; what
has been measured is an **enrichment opportunity** (77 occurrences / 70
entries), which is a different claim and does not belong in a
defect catalogue on this evidence.

The parent row's `reason` now states, in terms: that the 77 are
untouched and unclaimed; that **no shipped rule performs the enrichment
its own prose advertises**, so once `superscriptInsideAnchor` ships they
will *read* as handled while nothing has been written; and that what
would dispose of them is a ruling on whether a print-supplied
sub-section may be written into a `data-ref` — a **target** edit that
must clear `link-target.ts`, out of batch 4's scope. Their being
untouched is now a decision on the record rather than a silence.

## Verdict

- **Boundary repair: survives, and ships.** Correct on both sides of the
  38 by §§1–4 above; `superscriptInsideAnchor` stands unchanged and the
  parent row keeps `route: transform`.
- **The 38 occurrences / 33 entries: split out** as
  `superscript-subsection-contradicts-link-sub-section`,
  `route: judgment`, `corpusCount` 33 **entries**, predicate written
  against the post-transform shape `<sup>N</sup></a>`, with the −17…+20
  delta spread and the modal −1 at 9 of 38 occurrences recorded so
  nobody mistakes it for mechanically recoverable.
- **The 77 target-enrichment candidates: disposed** by an explicit
  sentence in the parent row's `reason`, per the section above.

**No `entangledWith` edge joins the two rows, and the omission is
deliberate and measured.** They do own the same records — the parent's
rule moves the superscript of all 38 — but with the edge recorded,
`unaccountedEdges(catalogue, [...RULES, superscriptInsideAnchor])`
returns *"recorded entanglement is invisible to the adjacency gate"* the
moment Task 7 registers the parent's rule, because `entangledClusters`
emits no component with fewer than two **registered** members. The
gate's own rationale — *"execution order cannot be wrong about a rule
that does not run"* — applies exactly here, since a `judgment` row will
never have a rule; the gate simply has no way to say "this endpoint is
permanently unregistered". The containment is recorded in prose on both
rows instead, each naming the other by id. **If the 38-row is ever
re-routed to `transform`, add the edge on both sides first.**
