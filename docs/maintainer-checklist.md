# Maintainer checklist: what waits on you

What is left for you before go-live. By your ruling of 2026-10-18,
under your blocker definition
([`review-ledger.md`](review-ledger.md) § Definitions), this file keeps
the pre-publication items, the answers that change a `headwords[0]`:
the URL name is computed from it, and a name changed after go-live
costs a redirect forever (U6; redirects are unbuilt, L23). Since
PR #187 (2026-10-22) that is one block, P00639 in § Cross-reference
numerals: may rename an entry, which you left open with a note; none
is held. PR #187 applied the rest of what you ticked, all 17 spelling
blocks (C00299 after your ruling of 2026-10-22 on C00300), § X11, 17 of
the 18 numeral questions and the 8 you answered on 2026-10-18; they
are in
[`headword-worklist.md`](headword-worklist.md) § Applied from the
maintainer checklist (2026-10-22). The other 22 numeral questions and
the 3 scan reads for L65–L66 moved, byte for byte, to
[`post-go-live-review.md`](post-go-live-review.md), to be worked after
go-live as GitHub issues. Each block asks one
question: tick ONE box per bullet, and write a `note:` only where the
box you tick asks for one. A block's `Recommendation:` is a default
you can accept by ticking the box it names. When you are done, say
"checklist done", and a PR applies the ticks: an answer that changes
the data becomes a reviewed patch, and a "kept", "no word" or "can't
tell" is recorded instead (a reviewed-kept record or the review ledger
row), as each section's status says. The last section is not ticks: it
is rows for you to paste into #153 (five of them are already there and
are listed for reference). A ticked item leaves this file when a PR
applies it, and the paste rows once you say they are posted; its
history (the answer, what was written, the patch ids) lives in the
worklists ([`headword-worklist.md`](headword-worklist.md),
[`sense-worklist.md`](sense-worklist.md)) and the tranche READMEs under
[`admin/pipeline/patch/records/tranches/`](../admin/pipeline/patch/records/tranches/).
Started 2026-10-16 (PR #186) by moving the open sections out of
`headword-worklist.md`; `sense-worklist.md` has no unticked question.

| section | items | source PR | ledger row |
|---|---|---|---|
| [Cross-reference numerals: may rename an entry (18)](#cross-reference-numerals-may-rename-an-entry-18) | 1 question (P00639); 17 applied in PR #187 | #173 | L64 |
| [Textual-research candidates (for #153)](#textual-research-candidates-for-153) | 18 rows to paste (23 listed; 5 already in #153) | #181 | L47 |

## Cross-reference numerals: may rename an entry (18)

**Status:** you ticked 17 of the 18; PR #187 applied them, and they
moved to [`headword-worklist.md`](headword-worklist.md) § Applied from
the maintainer checklist (2026-10-22). P00639 stays, unticked, with
your note "Check 85 and analyze". The table keeps its row.

These 18 questions are pre-publication: an answer can set a homograph
numeral on `headwords[0]`, and the URL name is `headwords[0]` with its
numeral, so the name changes. Changed after go-live, each would need a
redirect, and redirects are unbuilt (U6, L23), so your ruling of
2026-10-18 brought them back from
[`post-go-live-review.md`](post-go-live-review.md); how to read the
blocks is in that file's § Cross-reference numerals (2026-10-14).

| cites | text | class | question in five words | recommendation | confidence |
|---|---|---|---|---|---|
| P00639 | `חֵיפָא III` | one bare member | where is חֵיפָא III? | kept | low |

### `חֵיפָא III`: P00639 (one bare member)

| rid | stored | hOCR, verbatim | scan |
|---|---|---|---|
| [H00839](https://jastrow.app/#rid:H00839) | `חֵיפָא I` | `attack, Targ. Prov, XXVIII, 4 (h, text Dow), Ih, I, 8` | [459a · leaf 482](https://iiif.archive.org/iiif/dictionaryoftarg01jastuoft$483/full/1400,/0/default.jpg) |
| [H00840](https://jastrow.app/#rid:H00840) | `חֵיפָא II` | no line matched | [459a · leaf 482](https://iiif.archive.org/iiif/dictionaryoftarg01jastuoft$483/full/1400,/0/default.jpg) |
| [H00841](https://jastrow.app/#rid:H00841) | `חִיפָּא` | no line matched | [459a · leaf 482](https://iiif.archive.org/iiif/dictionaryoftarg01jastuoft$483/full/1400,/0/default.jpg) |
| [H00843](https://jastrow.app/#rid:H00843) | `חֵיפָה I, חֵיפָא, בֵּית ח׳` | `a harbor of the Mediterranean Sea, south of` | [459a · leaf 482](https://iiif.archive.org/iiif/dictionaryoftarg01jastuoft$483/full/1400,/0/default.jpg) |

The cites, as the entries store them:

- [P00639](https://jastrow.app/#rid:P00639): …pr. n. m.ʿEfa, v. **חֵיפָא III**.… Sefaria links it to H00840 `חֵיפָא II`. [1073b · leaf 396](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$397/full/1400,/0/default.jpg)

P00639 `עֵיפָא II` (pr. n. m. ʿEfa) reads `v. חֵיפָא III`; Sefaria links H00840 `חֵיפָא II` (pr. n. pl., v. Haifa). The family numbers I and II only; H00841 `חִיפָּא` (border in webs) is the only bare member and is no proper name.

**Question.** Which entry is Jastrow's `חֵיפָא III`?

- **P00639**
  - [ ] none in the data: print's III names a word Sefaria lacks; the link stays (case 3: `kept` on the cite)
  - [ ] H00840: print's `III` is a slip for `II` (case 2: the cite's text annotated)
  - [ ] H00841 takes III (case 2)
  - [ ] can't tell from the scan
  - note: Check 85 and analyze

Recommendation: kept (low): a personal name ʿEfa matches no stored `חֵיפָא`; read the column for a third `חֵיפָא` line.

## Textual-research candidates (for #153)

**To do (no ticks):** paste the 18 new rows below, the 17 X8 rows and C00773, into #153 or into the separate issue A00312's note asks for, then say so.


Your notes asked for these rows to go to a textual-research issue
(review ledger L47). Nothing here was posted. The five X9 rows are
already in [#153](https://github.com/UniquePixels/jastrow/issues/153)
and are listed for reference only; the X8 rows and C00773 are new,
written so you can paste them into #153 yourself, or into the
separate issue A00312's note asks for. Your notes are quoted as
written. The scan is the leaf the row's question
linked.

### X9: no mark in print (5, already in #153)

You answered "print has no mark there" on each: two spellings of one
numbered sequence that print points apart.

| rid | headword | your note | scan |
|---|---|---|---|
| [A01420](https://jastrow.app/#rid:A01420) | `אִיסְטְוָוא` II (I is A01419 `אִיסטְוָוא`) | "This is likely a textual error but would require extensive research. I would love an issue oppened on it, as I think it is a fascinating question." | [leaf 77](https://iiif.archive.org/iiif/dictionaryoftarg01jastuoft$78/full/1400,/0/default.jpg) |
| [E00802](https://jastrow.app/#rid:E00802) | `הֲקָצָה` II (I is E00801 `הֲקָצה`) | "Another likley textual issue, add with other, fascinating I say....." | [leaf 387](https://iiif.archive.org/iiif/dictionaryoftarg01jastuoft$388/full/1400,/0/default.jpg) |
| [E00837](https://jastrow.app/#rid:E00837) | `הרְהוּן` II (I is E00836 `הִרְהוּן`) | "another to add to that textual issues research issue" | [leaf 389](https://iiif.archive.org/iiif/dictionaryoftarg01jastuoft$390/full/1400,/0/default.jpg) |
| [I00057](https://jastrow.app/#rid:I00057) | `טְבִיעָה` II (I is I00056 `טְבִיעה`) | "textual issue research" | [leaf 540](https://iiif.archive.org/iiif/dictionaryoftarg01jastuoft$541/full/1400,/0/default.jpg) |
| [P00959](https://jastrow.app/#rid:P00959) | `עֲנָוָה` II (I is P00958 `ענָוָה`) | "textual issue research" | [leaf 415](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$416/full/1400,/0/default.jpg) |

### X8: a missing numeral print does not set (17)

You answered "no numeral beside it" or "the gap is Jastrow's own" on
each but C00610, where you answered that print sets I beside C00609
`גִּיב`. Under ruling 10-13 the bare form stays bare unless Jastrow's own
text names it `X I`. A00312's note asks for these in a different
issue from the X9 five.

| rid | headword | your note | scan |
|---|---|---|---|
| [A00312](https://jastrow.app/#rid:A00312) | `אַגְמָא` II; A00311 bare | "Legit missing, lets put ones like this in a differnt textual issues research issue." | [leaf 36](https://iiif.archive.org/iiif/dictionaryoftarg01jastuoft$37/full/1400,/0/default.jpg) |
| [A00890](https://jastrow.app/#rid:A00890) | `אוֹרְיָין` II; A00889 bare | "add to textual research issue" | [leaf 57](https://iiif.archive.org/iiif/dictionaryoftarg01jastuoft$58/full/1400,/0/default.jpg) |
| [A02042](https://jastrow.app/#rid:A02042) | `אֲמָנָה` II; A02041 bare | "add to resarch issue" | [leaf 101](https://iiif.archive.org/iiif/dictionaryoftarg01jastuoft$102/full/1400,/0/default.jpg) |
| [B00382](https://jastrow.app/#rid:B00382) | `בּוּרְסִי` II, and B00383 `בּוּרְסִי` II²; no I | "add to issue, likely a textual mistake" | [leaf 173](https://iiif.archive.org/iiif/dictionaryoftarg01jastuoft$174/full/1400,/0/default.jpg) |
| [B00538](https://jastrow.app/#rid:B00538) | `בִּיאָה` II; B00537/alt bare | "add to issue" | [leaf 182](https://iiif.archive.org/iiif/dictionaryoftarg01jastuoft$183/full/1400,/0/default.jpg) |
| [B00936](https://jastrow.app/#rid:B00936) | `בַּנַּאי` II; B00935 bare | "add to research issue" | [leaf 199](https://iiif.archive.org/iiif/dictionaryoftarg01jastuoft$200/full/1400,/0/default.jpg) |
| [C00177](https://jastrow.app/#rid:C00177) | `גְּדוּדִית` II; C00176 bare | "add to issue" | [leaf 233](https://iiif.archive.org/iiif/dictionaryoftarg01jastuoft$234/full/1400,/0/default.jpg) |
| [C00610](https://jastrow.app/#rid:C00610) | `גִּיב` II; C00609, which print numbers I | "add to issue" | [leaf 257](https://iiif.archive.org/iiif/dictionaryoftarg01jastuoft$258/full/1400,/0/default.jpg) |
| [D00443](https://jastrow.app/#rid:D00443) | `דִּי` II; D00442 bare | "add to issue" | [leaf 316](https://iiif.archive.org/iiif/dictionaryoftarg01jastuoft$317/full/1400,/0/default.jpg) |
| [E00114](https://jastrow.app/#rid:E00114) | `הֲדָיָא` II; no I | "add to issue" | [leaf 356](https://iiif.archive.org/iiif/dictionaryoftarg01jastuoft$357/full/1400,/0/default.jpg) |
| [H00433](https://jastrow.app/#rid:H00433) | `חוּצָה` II; H00432 bare | "add to issue" | [leaf 461](https://iiif.archive.org/iiif/dictionaryoftarg01jastuoft$462/full/1400,/0/default.jpg) |
| [H01222](https://jastrow.app/#rid:H01222) | `חֲמַר` III; no I, II on `חֲמַר` | "add to issue" | [leaf 503](https://iiif.archive.org/iiif/dictionaryoftarg01jastuoft$504/full/1400,/0/default.jpg) |
| [J00113](https://jastrow.app/#rid:J00113) | `יָהּ` II; J00112 bare | "add to issue" | [leaf 588](https://iiif.archive.org/iiif/dictionaryoftarg01jastuoft$589/full/1400,/0/default.jpg) |
| [O00995](https://jastrow.app/#rid:O00995) | `סְלִיקוּסְתָּא` II; O00994 bare | "add to issue" | [leaf 318](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$319/full/1400,/0/default.jpg) |
| [Q00965](https://jastrow.app/#rid:Q00965) | `פְּלוּגְתָּא` II; Q00964 bare | "add to issue" | [leaf 500](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$501/full/1400,/0/default.jpg) |
| [Q01399](https://jastrow.app/#rid:Q01399) | `פַּפָּא` II; Q01398 bare | "add to issue" | [leaf 526](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$527/full/1400,/0/default.jpg) |
| [S00337](https://jastrow.app/#rid:S00337) | `קוּלְיָא` II; S00336 bare | "add to issue" | [leaf 651](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$652/full/1400,/0/default.jpg) |

### Round 2: `גִּיס` (1)

C00772 `גֵּיס` is bare before C00773 `גִּיס` II and C00774 `גִּיס` II.
C00707 and C00710 name C00773 II, while C00841 `(v. גִּיס I) familiar`
and K00444 call the familiar word I, which print numbers II. Kept bare
in PR #177.

| rid | headword | your note | scan |
|---|---|---|---|
| [C00773](https://jastrow.app/#rid:C00773) | `גִּיס` II, `גָּיֵיס` | "To much ambuiguity here honestly. So no implied anything, and maybe an issue to dig in on." | [leaf 263](https://iiif.archive.org/iiif/dictionaryoftarg01jastuoft$264/full/1400,/0/default.jpg) |
