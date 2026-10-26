# Cite-numeral allowlist

Gate 13, `citeNumeral` ([`DESIGN.md`](../../../DESIGN.md) §9;
`import/cite-numeral.ts`), holds every internal cite whose text or
`data-ref` names a homograph numeral (`v. חוּל I`, `Jastrow, אוּלָם I 1`)
to a target that carries that numeral on one of its forms, or is the
`ch.` line print sets right after the entry that does (ruling
`10-15 ch. cross-reference`). [`kept.jsonl`](kept.jsonl) holds the cites
no stored value can settle, one per line, so the gate is green while
each waits for its answer. Review checklist 2026-10-25, group 2
([`docs/review-checklist-2026-10-25.md`](../../../../../docs/review-checklist-2026-10-25.md)).

## The row

One compact JSON object per line, keys alphabetical:

| field | holds |
|---|---|
| `rid` | the citing entry |
| `ref` | the rid the cite links to |
| `cite` | the cite's visible text, NFC (`עָמַד II)`, print's `)` included) |
| `reason` | why the cite fails and why it is kept: the case, or the open question |
| `source` | who or what settled it, or found it |
| `date` | when |
| `pending` | `true` on a genuine mismatch no print read has settled yet |
| `note` | required with `pending`: where it is to be read |

A row matches a failing cite on `rid`, `ref` and `cite` (NFC). A row
that matches no failing cite is **stale** and fails the gate: a patch
that retargets or renumbers a cite takes its row with it in the same
change, so the list never holds more than the facts.

**What does not belong here.** A cite the stored data already settles:
a target that carries the numeral, an implied I (since 10-13 a stored
`homograph: 1` like any other), and a `ch.` line under the numeral (the
gate reads all three). Nor a cite to be fixed now: fix it by patch.

## The rows of 2026-10-26: 37

Measured by the gate over the committed corpus: 8,938 internal cites
name a numeral (3,920 in their text, the rest in `data-ref` alone), and
45 fail on the target's stored numerals. The checklist's "40 of 3,554"
is the same predicate over sense glosses and units only; the 5 more are
in `stems` (J00114, O00278, P00973, Q02018, R00759).

| class | cites | here |
|---|---:|---|
| `ch.` line under the numeral (10-15): H00731, A00864, B01157, B01160, B01215, B01237, U02087 (`X N ch.`) and M00854 (`חֲטִי I`, the `ch.` line of H00613 `חָטָה I`, P000926) | 8 | no: the gate reads them |
| implied I stored on the target | 0 | no: a stored I passes |
| 10-13 case 3, kept as printed and annotated `kept` (C00147 P000919, C00841 P000923, K00444 P000924, U01637 P000888) | 4 | yes, not pending |
| genuine mismatch, deferred post go-live on 2026-10-18 ([`post-go-live-review.md` § Cross-reference numerals](../../../../../docs/archive/post-go-live-review.md#cross-reference-numerals-2026-10-14), issue #188): 33 of its 34 cites; the 34th, M02423's `מַוֶּה II`, now links M00725, which carries II | 33 | yes, `pending: true` |

The 33 pending rows are for a group 3 batch: each is a retarget or a
renumber once the family is read against the print, and each row goes
when its patch lands. Their `reason` quotes the deferred question and
its recommendation.

```bash
jq -r 'select(.pending) | .rid' admin/pipeline/patch/records/cite-numeral-kept/kept.jsonl | wc -l   # 33
jq -r 'select(.pending | not) | .rid' admin/pipeline/patch/records/cite-numeral-kept/kept.jsonl | wc -l   # 4
```
