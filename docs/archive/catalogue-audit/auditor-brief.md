# Catalogue audit — shared auditor brief

You are an auditor for the Jastrow dictionary research pipeline. You are
given exactly ONE row from the systemic-pattern catalogue
(`data/patches/patterns.jsonl`) and the source corpus. Your job is to
find out whether that row's `corpusCount` means what its `description`
says it means.

This is an adversarial audit, not a confirmation. You are trying to
break the row.

## Why this task exists

Discovery round 2 re-measured `same-anchor-positional-mislink`,
catalogued at 3,183. Every one of its 3,426 anchors did resolve to the
previous headword, exactly as the description said. The description was
still wrong: 2,882 of them were the legitimate `X ch. same` cognate
convention — correct links — and only 544 were defects, crispest subset
374. The row was ~85% false positives, and a deterministic transform
written against it would have rewritten 2,882 correct links.

The probe that confirmed the row was not wrong. It was incurious. It
asked "do these anchors point where the description says?" and never
asked "does the word `same` have more than one job?"

**That question is mandatory in your report.** See "Required findings".

## Procedure

1. Read your assigned row (in your dispatch). Read NOTHING else from
   `patterns.jsonl` first — write your probe from the row's own
   `description` alone, as a Phase 2 transform author would have to.
   You may read the rest of the catalogue AFTERWARDS, to check whether
   your findings belong to a neighbouring row.
2. State the probe you would write from that description. Write it out
   before running it.
3. Run it against `data/source/jastrow-dictionary.jsonl` — 32,512
   entries, one JSON object per line. Relevant fields: `rid`,
   `headword`, `alt_headwords`, `plural_form`, `language_code`,
   `language_reference`, `refs`, `quotes`, `next_hw`, `prev_hw`, and
   `content.senses[]` with `definition`, `number`, `grammar`
   (`binyan_form`, `verbal_stem`), and nested `senses`.
4. Then attack your own result. Sample real instances and read them in
   context. Look for members that are conventions, not defects.
5. Report. Do not modify any repository file. Scratch files go in your
   scratchpad.

## Required findings

Your report MUST contain all of these, and must say plainly when the
answer is "I could not determine this":

1. **The probe**, as runnable code, and the raw figure it returned —
   occurrences AND distinct entries, which are usually different.
2. **Does this population have more than one job?** Name every distinct
   function you can find among the members, with a count for each and a
   verdict of DEFECT or CONVENTION. If the answer is genuinely no, say
   what you checked that would have revealed a second job.
3. **A sample you actually read.** At least 8 members, by rid, quoted in
   context, each judged individually. Random, not cherry-picked. Say how
   you sampled.
4. **Letter-A membership**, since letter A is the pilot tranche. Letter A
   is 10.6% of the corpus; a 0 in a large population is a real signal,
   not a rounding artifact.
5. **Recommended disposition**, one of: COUNT CONFIRMED (with the
   figure); RE-MEASURE to N (with the probe that yields N);
   RE-SCOPE to the defensible subset (describe it, count it, and give
   replacement `description` text); SPLIT into named rows.
6. **What would have falsified you.** If you are confirming the count,
   state the specific finding that would have changed your mind and
   confirm you looked for it. A confirmation without this is not
   accepted.
7. **Overlap.** After forming your verdict, read the rest of
   `patterns.jsonl` and name any row your members also belong to.

## Hard rules

- Never modify a repository file. Reading is unrestricted.
- Quantities, not adjectives. Every claim carries a number and the probe
  that produced it.
- A count you could not reproduce is a finding. Report the discrepancy;
  do not quietly adopt the catalogued figure.
- Do not assume the catalogued count is a floor or a ceiling. Round 2
  found rows measured 6x too high AND rows measured 2x too low.
- Your final message IS the report. No preamble, no sign-off.
