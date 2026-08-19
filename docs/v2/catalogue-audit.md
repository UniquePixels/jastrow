# Catalogue audit — Tier A complete, Tier B partial

**Status: Tier A DONE, Tier B PARTIAL (2026-08-18).** Thirteen rows
audited, one auditor each, each writing its probe from the row's
`description` alone before reading the rest of the catalogue. **Not one
row was confirmed as catalogued.**

This is an **unnumbered pass, not round 3**. No row gained `round: 3`;
the split product keeps its parent's round. `isSaturated` counts rounds
rather than looking, so numbering an audit would let
`isSaturated(rows, 4)` fire off a single empty sweep instead of two.
The next real sweep is still round 3.

| | |
|---|---|
| Rows audited | 10 of 10 Tier A, **3 of 23 Tier B** |
| Rows confirmed as catalogued | **0** |
| Counts not reproducible at all | **6** |
| Rows re-scoped | 11 |
| Rows split | 2 |
| Rows re-measured upward | 1 |
| Catalogue size | 118 → **120** |
| Tier A instances | 25,768 → **12,649** (−13,119, −50.9%) |
| Tier B audited instances | 944 → **258** (−686, −72.7%) |
| Neighbouring rows flagged | 10 (2 withdrawn on audit) |

Per-row evidence lives in `data/patches/catalogue-audit/<row-id>.md` —
probe, job decomposition, read sample, falsification test, overlaps. The
shared contract the auditors ran against is `auditor-brief.md` in the
same directory.

## Verdicts

| Row | Was | Now | Verdict |
|---|---:|---:|---|
| `trailing-whitespace-definition` | 2,340 | **10** | RE-SCOPE |
| `midrash-subsection-link-drift` | 3,941 | **179** | RE-SCOPE |
| `homograph-numbering-schism` | 3,421 | **186** | RE-SCOPE |
| `nonsense-dup-anchor` | 1,220 | **755** | RE-SCOPE |
| `homograph-collapse-link` | 2,957 | **1,253** | RE-SCOPE |
| `italic-swallowed-terminal-period` | 1,209 | **1,098** | RE-SCOPE |
| `plural-inflection-anchor-escapes-entry` | 2,281 | **1,417** | RE-SCOPE |
| `abbrev-in-alt-headwords` | 2,265 | **2,035** | SPLIT (+ `phrase-alt-headword-stub` 236) |
| `bare-rtl-hebrew` | 4,900 | **4,190** | RE-SCOPE |
| `ascii-quote-as-gershayim-in-body` | 1,234 | **1,290** | RE-MEASURE **up** |

### The four that would have corrupted the corpus

- **`trailing-whitespace-definition`, 2,340 → 10.** 1,976 members are
  the *sole* separator between a sense and the next. A corpus-wide
  `trimEnd()` would weld gloss heads onto their sense labels — "…whence
  1) the young shoots" becomes "…whence1) the young shoots". The
  discriminating rate: 20.06% when a sense is followed by another,
  0.031% when it is last.
- **`homograph-numbering-schism`, 3,421 → 186.** 77.5% are ordinary
  correct cross-references. A transform against the catalogued figure
  would rewrite roughly 3,000 correct links.
- **`midrash-subsection-link-drift`, 3,941 → 179.** ~75% carry a
  sub-section that is correct and *more precise* than the display —
  Sefaria segment addressing. Stripping it would degrade ~3,500 links to
  chapter granularity.
- **`bare-rtl-hebrew`, 4,900 → 4,190.** Smaller correction, but the
  removed 473 sub-lemma headers are written bare in **473 of 473**
  instances corpus-wide. A wrapper would be inserted where the source
  uses one nowhere.

### The one that grew

`ascii-quote-as-gershayim-in-body` was scoped to `<span dir=rtl>` and
silently excluded `<a dir=rtl>` display text. More consequentially, the
same defect runs to **2,317 occurrences / 1,392 entries** corpus-wide,
including 172 in `href`/`data-ref` values, 69 in `headword` and 21 in
`refs[]`. Because those carry the same abbreviations, **fixing body text
alone will break cross-links that currently match by string identity.**

## Two contradictions inside the catalogue

**A double count.** `nonsense-dup-anchor`'s 465 sense-side entries are
`nested-anchor-swallows-punctuation` (465), to the digit — the same
records catalogued twice. Resolved by re-scoping the former to its 755
`language_reference` members, leaving the latter to own the sense side.

**A polarity collision.** `label-period-outside-italic` (608, round 2)
calls `<i>Af</i>.` the defect; `italic-swallowed-terminal-period` calls
`<i>Part. pass.</i>` the defect. The corpus normalises the same object
type in **opposite directions by token count** — single-token labels
take the period inside 1,560 times vs outside 533, multi-token labels
outside 307 vs inside 82. Both rows now carry the flag; **reconcile
before either is transformed.**

## Neighbouring rows flagged, counts unchanged

Each carries an `AUDIT FLAG` in its `reason`.

| Row | Flag |
|---|---|
| `binyan-form-leading-space` (457, r2) | **may be a convention** — the same field-edge-separator question that collapsed `trailing-whitespace-definition`, never tested against "does anything consume this?" |
| `label-period-outside-italic` (608, r2) | polarity collision, above |
| `nested-anchor-swallows-punctuation` (465) | double count, above; 455 of its 465 trap punctuation, 10 trap nothing |
| `superscript-subsection-stranded-outside-anchor` (160) | its 38 contradiction cases **carry their own correct answer** (printed superscript right in 9 of 12 adjudicated); deterministically fixable |
| `bracket-paren-mismatch` (67) | own probe reproduces at **98/97**, and it already owns 49 entries currently counted inside `stranded-open-bracket` |
| `multiword-abbrev-mislink` (22) | **possibly under-measured** — 5 members found inside a 28-occurrence population, and 236 of the same phrase-stub shape in `alt_headwords` |
| `unnumbered-terminal-homograph` (129) | 18 families contested with `homograph-numbering-schism` |
| `continuation-marker-em-dash-loss` (71) | **confirmed as the correct home** for the bare-`N)` residue; its size is unsettled between 19 and 44 |
| `h-cognate-self-link` (50) | **merge candidate** — the h.-language mirror of `homograph-numbering-schism`'s re-scoped defect |

**Two flags were raised in the Tier A pass and then tested in the Tier B
pass. Both were wrong:** `inflection-abbrev-mislink` was flagged ~5×
under-measured and is ~2.6× over-measured, and `stranded-open-bracket`
carried a round-2 under-measurement flag and is over-measured too. Both
withdrawals are recorded in the rows' own `reason`. A flag is a lead,
not a finding — the two that survived contact with a probe did so
because a probe was run.

## Two rows are review queues, not rewrite rules

- **`homograph-collapse-link`** runs ~50% correct links *even after*
  re-scoping (read sample: 4 defect / 2 convention / 2 undetermined). The
  tractable deterministic slice is 299 root-etymology occurrences where
  the target is a noun in a set containing a verb.
- **`bare-rtl-hebrew`**: 4,691 of 5,679 bare nodes mix Hebrew and Latin
  in one text node, so the run must be delimited *inside* the node.
  Wrapping nodes whole would drag English, Roman numerals and parens
  into an RTL context.

## Uncatalogued populations the audit surfaced

Recorded here rather than minted as rows, because this pass must not
create `round: 3` entries. **The next real sweep should fold them.**

- **Geresh abbreviation in `plural_form`** — 1,131 occurrences / 1,007
  entries (522 also in `abbrev-in-alt-headwords`). None of the eight
  `plural-form-*` rows covers it. The largest gap found.
- **ASCII gershayim outside `dir=rtl` body text** — 409 occurrences
  across `href`/`data-ref` (172), bare RTL text (117), `headword` (69),
  `refs[]` (21), `alt_headwords` (19), `plural_form` (8), `quotes[]` (4).
  Counted by no row today.
- **Jerusalem Talmud double-wrapped citations** — 20 occurrences / 10
  entries, no punctuation trapped, `href` missing its leading slash in
  20 of 20. Belongs with `jt-href-slash`.
- **`neighbor-rid-mislink`'s residual class E** — 198 occurrences that
  split between emphatic ה↔א alternations, unvocalized displays and
  genuine one-consonant confusions. Sampled only incidentally; needs its
  own probe.

## Tier B — three implicated rows run, 20 still deferred

The deferral below was **partly reversed**: the three rows Tier A
auditors had implicated were run.

| Row | Was | Now | Verdict |
|---|---:|---:|---|
| `neighbor-rid-mislink` | 655 | **109** | RE-SCOPE, ±1 predicate retired |
| `stranded-open-bracket` | 152 | **85** | RE-SCOPE (+ `unclosed-editorial-bracket` 18) |
| `inflection-abbrev-mislink` | 137 | **46** | RE-SCOPE |

**944 → 258 instances (−72.7%).** Three more counts unreproducible,
bringing the audit total to six.

### `neighbor-rid-mislink` — the ±1 predicate is retired

The flag was confirmed, and the instrument that settled it was a
**link-blind null model**: for every entry with a sibling whose skeleton
is its own + א, **49.9% of those pairs are alphabetically adjacent by
construction** (2,104 of 4,215 at distance 1). A fully *correct*
emphatic-state link therefore produces a ±1 hit half the time on the
null alone. Confirmed by direction — 449 of 518 members (86.7%) sit at
target **+1**, and 76 of 76 under the strict variant; a resolver
off-by-one has no reason to prefer one sign. That is Jastrow's page
layout, not his hyperlinks.

Re-scoped to the only predicate that tracked defects: the candidate
entry cross-references the source while the resolved target does not.
**55% of that subset sits at distance ≥3** — the defect signal is
semantic reciprocity, and it is nearly orthogonal to adjacency.

### One audit flag was wrong, and the auditor refuted it

`inflection-abbrev-mislink` was flagged as ~5× under-measured, on a 765
figure another auditor had measured inside a *different* row's
population. Tested: the two are not the same shape — of the 366
comparable occurrences there, **330 have only one or two letters before
the geresh**, exactly what this row's ≥3 threshold excludes and what
three other rows already own. Direct intersection: 11 occurrences. The
row is ~2.6× **over**-measured. The flag is withdrawn in its `reason`.

Its description is also **stale**: `abbrev-mislink` was widened per round
1's own recommendation and now fires on 28 of 28 hits, so "outside the
abbrev-mislink rule's scope" describes a population of 0.

### `stranded-open-bracket`'s under-measurement flag is withdrawn too

The row is **over**-measured. Its two opposing figures were never in
tension — chunk-00181's "87 definitions, 85 pairing within two senses"
was the real population all along, and the audit independently lands on
the same 87. 152 was the over-broad outer figure. 49 of its members are
49-of-49 members of `bracket-paren-mismatch` (double-counted today), and
18 are a third defect now carried as `unclosed-editorial-bracket`.

**Transform hazard:** Jastrow's `[...]` around a numbered sense is a live
editorial signal marking that sense as supplied or uncertain. Deleting
the orphan bracket characters — the obvious repair — would silently
discard that marking on 87 senses.

### The 20 rows still deferred, with the cost stated

Led by `unmatched-closing-paren` (1,604), `etymology-head-pseudo-sense`
(1,553), `preamble-stranded-lead-sense` (676), `citation-tail-truncation`
(657). Regenerate the full list from the file rather than copying it —
the reasons are the source of truth.

**Cost of deferring.** Thirteen for thirteen misdescribed, so the base
rate says most of the remaining 20 are wrong too. What makes deferral
defensible is the difference that defined the tiers: **a Tier B row's
`reason` already warns the reader that its count is uncertain**, whereas
Tier A's rows carried no caveat and read as settled measurements. The
risk that justified this pass — a transform author trusting a figure
that looks solid — is materially lower.

What the partial run changes: the three implicated rows are no longer
part of that cost, and the two largest remaining rows
(`unmatched-closing-paren`, `etymology-head-pseudo-sense`, 3,157
instances between them) are now the largest unaudited counts in the
catalogue.

## Next actions

1. **[done]** The three implicated Tier B rows were run. **[open —
   Brian's call]** whether to run the remaining 20.
2. **Reconcile the polarity collision** between
   `label-period-outside-italic` and `italic-swallowed-terminal-period`
   before either is transformed.
3. **Re-audit `binyan-form-leading-space`** against the consuming
   question, before it is treated as a defect.
4. **Sequence the transform families** the audit identified as mutually
   entangled: the RTL-wrapper trio (`bare-rtl-hebrew`,
   `redundant-outer-rtl-span`, `latin-token-inside-rtl-span`); the
   gershayim pass (body text + `headword` + `refs[]` + `data-ref`
   together); and the anchor-escape family
   (`plural-inflection-anchor-escapes-entry` with
   `homograph-collapse-link` and the geresh-abbreviation rows).
5. **Round 3 remains unstarted** and is still a real sweep. This pass
   consumed no round number.
