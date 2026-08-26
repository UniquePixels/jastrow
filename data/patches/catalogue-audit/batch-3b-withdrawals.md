# Batch 3b — rows withdrawn from `transform` to `judgment`

Task 6 audited the four catalogue rows whose own `reason` fields say no
deterministic repair exists. One turned out repairable and shipped;
four were withdrawn. This file states, for every withdrawn row, WHICH
TEST it failed, following batch 2's precedent
(`homograph-numeral-mismatch.md`).

The transform route total moves **77 → 73**, exactly the four
withdrawals. `coverage()` reports 0 unaccounted and 0 duplicated after
the change.

Two tests are available, and they are not the same:

- **No repair exists** — the defect is real, but the entry does not say
  which bytes are wrong, so no rule can be written that is right more
  often than it is wrong.
- **No nameable destination** — a rule is writable, but what it should
  write cannot be named from the data.

## Summary

| Row | Count | Test failed | Code written |
|---|---|---|---|
| `gloss-head-seam-period-doubling` | 15 entries (15 occ) | No repair exists | none |
| `entry-final-comma` | 10 entries | No repair exists | none |
| `orphan-gloss-seam-period` | 19 entries (19 occ) | No repair exists — the byte is a candidate loss marker | none |
| `citation-quote-seam-period` | 43 entries (44 occ) | No repair exists for the row as catalogued | none |

And, for contrast, the row that did NOT fail:

| Row | Count | Disposition |
|---|---|---|
| `italic-swallows-close-paren` | 10 → **8 entries** (8 occ) | SHIPPED as `rules/italic-paren.ts` `italicSwallowsCloseParen` (tests: `rules/italic-paren.test.ts`, `rules/italic-paren-corpus.test.ts`) |

---

## `gloss-head-seam-period-doubling` (15 entries / 15 occurrences)

Withdrawn on its OWN recorded audit, without a new measurement and
without writing code. Its `reason`, verbatim:

> ESCALATION-ONLY: which of the two bytes is surplus is unknowable from
> the entry, and one of them lives outside sense scope.

**Test failed: no repair exists.** The row already establishes that the
period is not the field-split convention (1,121 of 1,136 entries
sharing the left context do not add one; of the 3,317 without it, only
5 open the definition with a period, and all 5 are legitimate Roman
homograph numerals). So the doubling IS a defect. What no measurement
can supply is which of `language_reference`'s terminal period and
`senses[0].definition`'s opening one to delete — and because they live
in different fields, a rule would have to reach outside sense scope to
delete the wrong one.

Members read: 0 — deliberately. The row's audit already looked for the
two escapes (an abbreviation split across the seam, a definition-side
period doing separate work) and found neither. Re-reading members
cannot produce information the printed page holds.

Measurement run: none. `corpusCount` unchanged at 15 entries.

## `entry-final-comma` (10 entries)

Withdrawn on its own recorded audit. Its `reason`, verbatim:

> JOBS: two, both DEFECT with different repairs — 7 are cross-reference
> stubs ", v. X," (comma for period) and 3 are full definitions cut
> mid-flow; the two could not be separated without the printed page,
> and that is stated rather than guessed.

**Test failed: no repair exists.** This is the sharpest case of the
four, because the row does not merely lack a repair — it has TWO, and
they disagree. For the 7 stubs the comma should become a period; for
the 3 truncations the comma marks where text was lost and deleting or
converting it destroys the locator. The row's null model is strong
(entry-final terminators run `.` 20,715 against `,` 10, 0.03%) and its
falsifier is clean (all 10 successor entries open their own article, so
the text did not migrate). Neither helps: both arms are defects.

Members read: 0 new. The raising agent read all 10 and published the
7/3 split; nothing in this task changes it.

Measurement run: none. `corpusCount` unchanged at 10 entries.

Carried forward, the row's own honest caveat: "at 10 members this may
not warrant its own row and could fold into the text-loss-locator
family."

## `orphan-gloss-seam-period` (19 entries / 19 occurrences)

**Test failed: no repair exists — the byte a repair would delete is a
candidate text-loss marker.** Full audit:
`orphan-gloss-seam-period.md`.

In brief: the brief's own separator does not reproduce the catalogue's
19/37 (it returns 29/27, missing the `(b. h.` form); a corrected
separator reproduces 37/19 exactly; and the corpus holds **41** intact
instances of `</i>. <span dir="rtl">HEBREW</span>. <a class="refLink">`
whose Hebrew loss yields this row's shape byte for byte. One of the 19,
P01106, carries the loss family's own signature in its own field.

Measurements run: 4 (the published separator, a corrected separator,
the seam null model at 30,087 : 12, and the 41-instance generator).
Members read: all 20 that the corrected separator calls clean, in
rendered form.

## `citation-quote-seam-period` (43 entries / 44 occurrences)

**Test failed: no repair exists for the row as catalogued.** Full
audit: `citation-quote-seam-period.md`.

In brief: the row's predicate is pinned for the first time and
reproduces at 44/43 exactly. All 44 were read; 37 are followed by an
English translation and are quotation-shaped, but **A00714's period is
load-bearing** — the Hebrew after it is a plural-form variant list, and
deleting the period welds a form heading onto a citation. A second
reading (print's period, a dropped `—Pl.` label) survives for all seven
non-quotation members and cannot be excluded from the entry.

Measurements run: 3 (predicate reproduction, the seam null model at
33,223 : 44, the translation split at 37/7). Members read: 44
mechanically, 10 in full.

Handed forward, not written: the 37 translated members would carry a
narrower row. That is a maintainer call.

---

## The row that shipped, for the record

`italic-swallows-close-paren` failed NEITHER test. Its own `reason`
called it "not byte-conservingly repairable (needs an extra
`</i> <i>`), so members escalate rather than patch" — and that is the
one claim in the four rows' audits this task overturns. The repair is
byte-conserving: the split moves the tail's own leading space out of
the run rather than inserting one, so the text multiset is identical
before and after in all 8 members, and no `copied` declaration is
needed. `corpusCount` written back **10 → 8 entries**, the two excluded
being the lettered sub-sense markers the row's own audit calls
CONVENTION (Q01198 and S02102 — the second MID-run, which is why the
guard is not anchored to a run's head).

Defect-count delta: italic runs holding a paren whose opener sits
outside them go **10 → 2** corpus-wide, the two survivors being the
convention members. The row's falsifier reproduces: 0 italic runs of
the inverse polarity, of 47,073.
