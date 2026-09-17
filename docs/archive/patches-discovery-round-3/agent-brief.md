# Discovery round 3 — shared sweep-agent brief

You are a sweep agent for the Jastrow dictionary research pipeline,
discovery round 3.

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

## What changed since round 2 — read this before you raise anything

Round 2 found little that was new; its most consequential result was a
CORRECTION to an existing row. A follow-up audit then re-measured 13
catalogue rows and **not one was confirmed as catalogued** — Tier A fell
from 25,768 instances to 12,649. Four rows would have corrupted the
corpus if transformed as written.

The failure was always the same shape, and it is the thing this round
must not repeat:

> `same-anchor-positional-mislink` was catalogued at 3,183. Every one of
> its anchors resolved exactly where the description said. The
> description was still wrong: 2,882 were the legitimate `X ch. same`
> cognate convention. The probe asked "do these anchors point where I
> expect?" and never asked "does the word `same` have more than one
> job?"

**So for every candidate you raise, you must answer three questions in
your discovery report, and say plainly when you cannot:**

1. **Does this population have more than one job?** Name every distinct
   function among the members, with a count and a DEFECT or CONVENTION
   verdict for each. If the answer is genuinely no, say what you checked
   that would have revealed a second job.
2. **What is the null model?** Before calling an alignment a defect,
   measure how often it occurs with no defect involved. A worked
   example: `neighbor-rid-mislink` claimed a rid-±1 spike, but 49.9% of
   base→emphatic entry pairs in this dictionary are alphabetically
   adjacent *by construction*, so half its spike was page layout.
3. **What would falsify this?** State the finding that would have
   changed your mind, and confirm you looked for it.

A candidate raised without these is not usable. Raising fewer, better
candidates is the right outcome.

## Exclusion list

`data/patches/patterns.jsonl` now holds **120 catalogued patterns** —
read it. Do not re-report them. **Finding nothing new is a real result
and should be reported as such**; round 2's chunk-00466 returned zero
new patterns and that was one of its more useful reports.

If you find a NEW instance of an EXISTING row that changes its size or
its reading, report that as a re-measurement, not as a new pattern —
that is where round 2's real value turned out to be.

## Four populations the audit surfaced but did not catalogue

These are known-real and currently uncounted. If your chunk touches
them, corroborate with a corpus-wide count rather than re-discovering
them from scratch:

- **Geresh abbreviation in `plural_form`** — ~1,131 occurrences / 1,007
  entries. No `plural-form-*` row covers it. The largest known gap.
- **ASCII gershayim outside `dir=rtl` body text** — ~409 occurrences in
  `href`/`data-ref`, bare RTL text, `headword`, `refs[]`,
  `alt_headwords`, `plural_form`, `quotes[]`.
- **Jerusalem Talmud double-wrapped citations** — 20 occurrences / 10
  entries, `href` missing its leading slash in 20 of 20.
- **`neighbor-rid-mislink` residual class E** — ~198 occurrences mixing
  emphatic ה↔א alternation, unvocalized displays and one-consonant
  confusions. Needs its own probe.

## Warnings carried forward

- An unnumbered *preamble* sense (etymology/language label, no gloss, no
  citation) followed by correct `1)`/`—2)` numbering is NOT class-1
  implied-one. No retag for that shape.
- Any pattern whose defining text sits OUTSIDE the anchor is invisible
  to a display-side probe. Include pre- and post-anchor context.
- Detector rules run at 38–64% precision by design. Rejecting a hint
  with a stated reason is a normal outcome, not a failure.
- Whitespace and separator characters at a field edge are frequently
  STRUCTURAL, not debris: `rejoin.ts` invents no separators, so
  whatever sits at a fragment edge is all that ever appears between
  fragments. Test "does anything consume this?" before calling it junk.

## Discovery goal

Reported separately from the manifest: any defect shape recurring
mechanically across entries, corpus-wide rather than per-entry. Give
each a name, a one-line description, a corpus-wide count from the source
JSONL, its letter-A membership, and the three answers above.
