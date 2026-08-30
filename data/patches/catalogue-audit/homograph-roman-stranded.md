# Audit — `homograph-roman-stranded-in-definition` (23)

**RULED 2026-08-30 (Brian): WITHDRAWN TO `judgment`,** `route:
judgment` in `patterns.jsonl`, the id taken out of `PENDING` in
`admin/pipeline/transform/registry.ts`.

**The count reproduces exactly.** This row is not withdrawn for want of
a population or a predicate — it has both. It is withdrawn because its
repair, performed alone, would leave the corpus worse than it found it.

## 1. The count reproduces at 23 under a stated predicate

The row's own predicate was never written down. Stated here for the
first time: **a leading Roman numeral in the first definition —
optionally after a comma — where the headword carries none, refused
before a lower-case letter or apostrophe.**

Measured over all 32,512 entries at the composed stage, that yields
**24**, of which one is `R00657`, and both false positives the row names
are accounted for:

- `F00006` "V'elleh Sh'moth" — refused by the lower-case/apostrophe
  guard, along with `F00008` "Vânay".
- `R00657` `צַעֲצוּעִים`, whose definition opens `, II Chr. III, 10` —
  **II Chronicles**, a citation. Refused by a second clause the row
  implies but does not state: a Roman numeral immediately before a
  CAPITALISED Latin abbreviation is a book number. Every one of the 23
  true members is followed by `.`, `,`, `)`, `=` or a lower-case
  abbreviation (` ch.`, ` f.,`, ` v. `, ` (or`); none is followed by a
  capital.

With both clauses, **23 exactly**, the catalogued rids to the letter.

## 2. The destination is the headword, and there is no other

`entry.schema.json`'s top-level properties are `{id, slug, headword,
altHeadwords, page, grammar, senses, stems}` with
`additionalProperties: false`. There is no homograph field. The corpus's
own convention puts the numeral in the headword string —
`A02000` is `"אָמוֹן II"` — so the repair is `headword + " " + numeral`,
with the numeral and its separator removed from the definition head.

That makes this a **headword rewrite**, and
[[feedback_headword_is_a_namespace]] is the entry that applies.

## 3. 17 of the 23 rewrites would dangle 37 live anchors

An anchor addresses an entry by headword string:
`data-ref="Jastrow, <headword> <sense>"`. Batch 5 met this and built
`LINKED_HEADWORDS` for it — an enumerated refusal list, kept loud on
drift by `rules/headword.corpus.test.ts`, which refuses to rewrite a
headword some anchor targets. There, 2 of 7 were refused.

Measured the same way here:

| Entry | headword → | anchors naming the bare headword |
|---|---|---:|
| `U01570` | `שָׁנָה` → `שָׁנָה I` | 6 |
| `V01060` | `תַּרְקְיָא` → `תַּרְקְיָא I` | 4 |
| `U01634` | `שָׁעָה` → `שָׁעָה I` | 4 |
| `V00522` | `תֻּכָּא` → `תֻּכָּא I` | 3 |
| `V00832` | `תְּפִלָּה ²` → `תְּפִלָּה ² II` | 3 |
| twelve more | | 17 |
| **total** | | **37** |

| | |
|---|---:|
| Rewrites that would dangle at least one anchor | **17 of 23** |
| Anchors that would dangle | **37** |
| Rewrites colliding with an existing headword | 0 |
| Entries no anchor names by the bare headword | 6 |

The row records the exposure as **3** — "all 3 corpus anchors displaying
a stranded-numeral homograph mis-resolve (`Q02021`, `U01568`,
`V00072`)". Those 3 are the anchors whose DISPLAY shows a numeral. The
37 are the anchors whose TARGET is the bare headword, which is the set a
rewrite actually breaks, and the row never measured it.

## 4. The counterpart repair is on the other route, so the dangle is permanent

The row itself identifies its own other half:

> Distinct from […] `homograph-numbering-schism` (3,421), **the anchor
> side of the same superscript schism to this row's entry side.**

`homograph-numbering-schism` is `route: judgment` (re-scoped to 186).
So the anchors will not be retargeted by any rule, and repairing the
entry side alone converts 37 anchors that resolve today into 37 that
resolve to nothing.

This is the row's decisive fact. A repair that is correct in isolation
and harmful in composition is not a transform this pipeline can ship —
compare [[feedback_correct_not_preserve]] from the other direction: the
pipeline must correct, and correcting one side of a two-sided defect is
not correction.

**Its whole family is already there.** Of the six homograph rows,
`homograph-numbering-schism` (186), `homograph-numeral-mismatch` (538),
`homograph-collapse-link` (1,253), `homograph-numeral-blind-default`
(1,358) and `unnumbered-terminal-homograph` (129) are all `judgment`.
This was the last one on `transform`.

## 5. An undeclared entanglement, and the `²` question

**The edge nobody recorded.** `unnumbered-terminal-homograph` (129, also
`blocking`, also `judgment`) names its own families in its `reason`:

> 18 families (צוּר, זוּחַ, דִּין, סוּף, זְמַם, **שִׁיעֲתָא** among
> them) in which the bare headword is the TERMINAL member of a Roman
> series rather than the first.

`שִׁיעֲתָא` is `U00997`/`U00998`, two of these 23. The two rows share
entries and **neither carries an `entangledWith` naming the other** —
both have `entangledWith: []`. Nothing in the gates could have found it:
`checkAdjacency` reads declared edges, and the commutation gate composes
registered RULES, of which neither row has one. This is the fourth
entanglement this program has found by reading rather than by gate.

**The `²` question, unsettled.** Six of the 23 already carry a `²` in
the headword — `תְּאֵב ²`, `שִׁיעֲתָא ²`, `שִׁיפָה ²`, `שלי ²`,
`תְּפִלָּה ²`, `תַּרְקְיָא ²` — and appending the print numeral makes
`"תְּאֵב ² II"`, marked twice by two different systems. The `²` is
**not** the print numeral, and the corpus proves it: `U00997`
`שִׁיעֲתָא` is print **II** while `U00998` `שִׁיעֲתָא ²` is print
**III**, so `²` counts records with a shared spelling while the Roman
numeral counts Jastrow's homographs. Reconciling them is a model
decision, and nothing in the v2 specs makes it.

## 6. What was considered and not taken

- **Ship the 6 unlinked members.** The `LINKED_HEADWORDS` pattern
  applied literally. Rejected: 5 of the 6 are the `²` cases from §5, so
  it would ship the double-marking question rather than settle it.
- **Ship `V00138` alone** — the one member that is both unlinked and
  `²`-free. Rejected: one entry, and 22 left on a blocking row.
- **Ship all 23 and retarget the 37 anchors in the same rule.** This is
  what the schism actually needs, and it is the right eventual shape.
  Rejected as out of scope: it reaches into a 186-entry `judgment` row
  and needs link-target gate declarations for every retarget.

## What reopens it

A ruling on the schism as a whole — both sides, entry and anchor, in one
step — with the `²` reconciliation settled first. At that point this
row's 23 are the cheapest part of the job: the numeral is present and
correctly identified, and §1's predicate is written down and reproduces.
