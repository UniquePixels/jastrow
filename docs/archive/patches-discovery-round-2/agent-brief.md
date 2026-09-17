# Discovery round 2 — shared sweep-agent brief

You are a sweep agent for the Jastrow dictionary research pipeline,
discovery round 2.

## Procedure
1. Read `admin/pipeline/research/prompts/sweep-v4.md` IN FULL — your
   operating contract. The anchor display-vs-`data-ref` comparison is
   MANDATORY for every anchor.
2. Read your input JSON (path in your dispatch).
3. Write exactly two output files (paths in your dispatch):
   `<chunk>.patches.jsonl` and `<chunk>.manifest.jsonl`.

## Hard rules
- Never modify any repository file. Your only writes are those two.
  You MAY read `data/source/jastrow-dictionary.jsonl`.
- Judge your chunk alone; do not read other chunks' files.
- An empty patches file IS normal. Every rid gets exactly one manifest
  row. Record `prompt_version` "v4".

## The detector was recalibrated before this round
Six corrections landed, so hints are more numerous and reach classes
previously invisible. Kinds you may see that round 1 could not produce:
`inflection-escape-link` (display is one of the host entry's own
inflected forms but the link leaves the entry), `one-consonant-diverge`
(display is no corpus headword but sits one non-final consonant from
its target), `hebrew-rare-confusable` (a Hebrew token occurring <=2x
one confusable-pair substitution from a token occurring >=100x).
`niqqud-twin-target` now also fires on unvocalized displays.

Judge every hint explicitly. These rules run at 38-64% precision by
design — rejecting a hint with a stated reason is a normal, expected
outcome, not a failure.

Known detector behaviour, so you do not re-litigate it: the editorial
`*` prefix is stripped before comparison; redirect-stub resolutions
(display X whose own entry is a bare `, v. Y` linking to Y) are
suppressed; geresh abbreviations behind a proclitic particle
(ב/ד/ה/ו/כ/ל/מ/ש) are no longer exempt.

## Warnings carried from round 1
- An unnumbered *preamble* sense (etymology/language label, no gloss,
  no citation) followed by correct `1)`/`—2)` numbering is NOT class-1
  implied-one. No retag for that shape.
- An anchor whose display is an inflection label of THIS entry
  (Pl./Fem./constr.) targeting a different headword is a candidate
  defect even when the consonantal skeleton is unique.
- Class 11 runs far above the catalog's "low expected volume", often
  without hints.
- Any pattern whose defining text sits OUTSIDE the anchor is invisible
  to a display-side probe. When probing, include pre- and post-anchor
  context.

## Discovery goal
Reported separately from the manifest: any defect shape recurring
mechanically across entries, corpus-wide rather than per-entry. Give
each a name, a one-line description, and a corpus-wide count from the
source JSONL.

Round 1 catalogued 80 patterns — read `data/patches/patterns.jsonl`
and treat every row there as already known. The bar for reporting is
that a shape is genuinely NOT among them.

Round 1 also found most of its patterns were present in letter A all
along and simply missed, so test whether your candidates' corpus counts
include letter-A rids and say so.

**A round that finds nothing new is a real and valuable result** —
this round exists to test whether discovery has saturated. Do not
manufacture candidates to seem productive. If you find no new systemic
shape, say so plainly and say what you checked.

## Return
Chunk id, entries processed, patches written, disposition counts, then
either NEW candidate systemic patterns with corpus-wide counts, or an
explicit statement that you found none and what you checked.
