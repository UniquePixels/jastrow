# Audit — `abbrev-headword-stub` (catalogued 34)

**RULED 2026-08-28 (Brian): WITHDRAWN to `route: judgment`,** 34
entries, on the measurement below. The row asks for an expansion the entries do not
contain: **at most 4 of 34 (11.8%)** hold anything that could supply the
elided tail, and the parent row this one is modelled on was itself
withdrawn from `transform` at 65.5%.

Written up as Task 1 of Phase 2 batch 5, spec
[`2026-08-27-headword-field-integrity-design.md`](../../../docs/specs/2026-08-27-headword-field-integrity-design.md)
§4.2.

## The row's own precondition was never met

The catalogue `reason` ends: **"RAISE ONLY IF THAT ROW'S DISPOSITION IS
UPHELD"**, naming `abbrev-in-alt-headwords` (2,035). That row's
disposition was **not** upheld — it moved `transform` → `judgment` on
2026-08-22, because its audit could find no deterministic expansion:

> the simplest anchor rule (locate the stub's final consonant in the
> headword) is unique for only 1,468 of 2,241 stubs (65.5%)
> — [`abbrev-in-alt-headwords.md`](abbrev-in-alt-headwords.md)

This audit exists to check whether the field-side row escapes that
finding. **It does not escape it; it is worse off, and for a structural
reason.**

## Why the field-side row is structurally worse

The parent row's stubs sit in `alt_headwords`, and the entry's
`headword` is right there holding a fuller spelling of the same lexeme.
That is what made 65.5% even possible — there was a second spelling to
align against.

**Here the stub IS the headword.** There is no fuller spelling of the
same lexeme anywhere in the entry by construction. Every candidate
source has to be found somewhere else, and this audit enumerates all of
them.

## The population

Predicate, executable against the pinned snapshot: `headword` contains a
geresh (U+05F3), contains no whitespace, and holds more than one Hebrew
letter. **55 headwords carry a geresh; 21 are the one-letter alphabet
and numeral articles** (`א׳`, `ב׳` … `ת׳`), which are genuine lexemes.
55 − 21 = **34**, reproducing the catalogued count exactly. Pinned in
`admin/pipeline/transform/rules/headword.corpus.test.ts`.

**33 of the 34 are cross-reference redirect entries** whose entire
definition is a pointer:

| Shape | N | Example |
|---|---:|---|
| `, v. X` | 31 | `D00963 דפליסט׳` → *", v. דִּיפְּלֵי"* |
| `, v. sub X` | 2 | `B00398 בושׂר׳` → *", v. sub. בוסר׳."* |
| substantive entry | 1 | `S01151 קיר׳`, citing Pesik. R. s. 6 |

Only the 2 `v. sub` members touch `v-sub-redirect-stub-mislink`'s
construct, so that row's 161 and this row's 34 are effectively disjoint
populations rather than two readings of one.

## The deciding measurement: where could the tail come from?

Four candidate sources, all of them checked over all 34.

| Source | Members it could serve | Verdict |
|---|---:|---|
| An `alt_headwords` item extending the stem | **4** | the only live candidate |
| An `alt_headwords` item that does NOT extend the stem | 4 | supplies a different word, not a tail |
| No `alt_headwords` and no `refs` at all | 4 | nothing to read |
| `refs` / definition anchors | 22 | **names the redirect TARGET, a different lemma** |

The fourth row is the one that settles it. A redirect stub's own
`data-ref` points at *the article it sends you to*, not at a longer
spelling of *itself*. `V00841 תפני׳` refs `Jastrow, תַּפְנִית 1` and its
definition reads *", v. next w."* — `תַּפְנִית` is the destination, and
`תפני׳` expands to `תפניס`, which is in this entry's `alt_headwords` and
is a different string from the ref. Reading the ref as the expansion
would rewrite 22 headwords into the lemma next door.

> **CORRECTED 2026-08-28 (local review round 2).** This table's last row
> read **26**, and the four rows then summed to 38 over a 34-member
> population while the prose called that row *"the remaining"* — which
> asserts a partition it did not have. Re-measured: the four buckets are
> disjoint and sum exactly, **4 + 4 + 4 + 22 = 34**. Nothing downstream
> moves: the deciding figure was always the 4 (11.8%) against the parent
> row's 65.5%, and no entry appears in two rows.

The four live candidates, in full, so a later reader can re-derive
rather than trust:

```
D00957  דפוסיו׳  → alt ["דפוסיות"]
G00401  זִיפְתּ׳   → alt ["זִיפְתָא"]
V00228  תומיי׳   → alt ["תומיין"]
V00841  תפני׳    → alt ["תפניס"]
```

**4 of 34 is 11.8%.** The parent row was withdrawn at 65.5%. And even
these four are only *candidates*: nothing in the data declares that the
alt is an expansion of the headword rather than a coordinate variant,
which is precisely the job-1/job-2 distinction the parent audit had to
draw by reading.

**No deterministic expansion rule exists for this row.** That is the
finding, and it is the same finding the parent reached, reached again
against strictly less evidence.

## The row's two self-linkers: confirmed, and they are a different defect

The `reason` claims *"TWO OF THEM SELF-LINK: their own data-ref is their
own truncated headword, so the redirect terminates on itself."*
**Confirmed at exactly two**, and both are live definition anchors
rather than `refs[]` entries — so this is something a reader hits, not
only something a compiler drops:

```
D00826  hw דִּלָט׳         def ", v. <a … data-ref="Jastrow, דִּלָט׳ 1">דִּילָט׳</a>"
S00462  hw קוּסְטַאנְטִינ׳   def ", v. <a … data-ref="Jastrow, קוּסְטַאנְטִינ׳ 1">קוּסְטַנְטִינ׳</a>"
```

In both, the display differs from the target by one mater lectionis
(`דִּילָט׳`/`דִּלָט׳`, `קוּסְטַנְטִינ׳`/`קוּסְטַאנְטִינ׳`) and the linker
normalised the difference away, landing on the entry itself. The reader
clicks *"see X"* and arrives back where they started.

**A NOTE ON HOW THE THIRD ONE APPEARS.** A predicate that compares bare
Hebrew letters — stripping niqqud *and* the Roman homograph mark —
returns **three**, pulling in `S01151 קיר׳`, whose ref is
`Jastrow, קִיר I 1`. That is the homograph `קִיר I`, a real and correct
target, not a self-link. Requiring the ref's own lemma to carry a geresh
returns the correct two. The row's count was right; a looser predicate
is what makes it look wrong.

**This defect is NOT repaired by this batch and is owned by no row.**
It is a link defect (batch 2's ruling: a wrong link with no lawful
target is unlinked, keeping the display text), not a headword-field
defect, and the field row is being withdrawn to `judgment` rather than
repaired. Recorded here so it is not lost: **2 entries, live anchors,
self-terminating redirect.** It wants a `transform` row of its own or
an addition to an existing link row, and it should be raised when the
link family is next opened.

## Falsifiers

- **If an expansion source were found for the other 30**, this
  withdrawal is wrong and the row returns to `transform`. The four
  sources above are exhaustive over the fields an entry carries; a
  fifth would have to come from outside the entry (the hOCR, or the
  destination article's own text), which is a judgment task by
  construction.
- **If `S01151` is not a substantive entry**, the "33 of 34 are
  redirects" claim weakens. Its definition cites Pesik. R. s. 6 with a
  reading proposal and a `cmp.`, which no redirect stub does.
- **If the two self-linkers turn out to have lawful targets**, the
  paragraph above is wrong. In both, the `data-ref` names the entry's
  own `headword` verbatim (`Jastrow, <headword> 1`), so the check is a
  string comparison against the field the entry is keyed by.

## Cascade if accepted

- `route`: transform **72 → 71** rows; instances 22,017 → 21,983.
- `judgment`: 55 → 56 rows; 15,885 → 15,919.
- `coverage().total` 72 → 71; the id leaves `PENDING` and is named in
  neither `RULES` nor `PENDING`.
- Batch 5 ships **four** rules over **four** rows, not five over five.

The self-link defect recorded above was NOT given a row of its own in
the same ruling; it stays recorded here and is raised when the link
family is next opened.
