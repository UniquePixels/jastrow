# Phase 2.3, first pass — adjudicating the hints the rules created

**Status: worked 2026-09-02 on `v2` at `e4f9ea6`; adjudication added
2026-09-03 on `v2` at `6745f17`.** This takes the first of the three
items
[`phase-2-residue.md`](phase-2-residue.md) hands 2.3 —

> **67 created hints on 65 entries are unadjudicated.** They are not
> a random sample of the residue: every one sits on an entry a
> transform touched, which is where a rule's own mistakes live.

— and adjudicates them. **35 of the 67 were one defect, and it was
not a rule's**: all 23 `bare-abbrev` and all 12 `rare-dotted-variant`.
It was the detector's tokenizer, which had never matched what a
reader sees. Fixing it, and the recall gap that turned out to be its
twin, leaves **67 − 35 = 32 hints on 30 entries**.

Then **32 + 5 = 37, on 35 entries**. The five are hints the
fixed-table reading cannot see at all, and finding them is the second
half of this pass; §"The adjudication" works through why a link hint
has to be measured against a rebuilt headword index. All 37 are link
judgment — 36 Hebrew-side, plus I00311's Roman citation numeral — and
all 37 are real.

The 23 are argued below because they are the shape that names the
defect. The 12 are the same tokenizer seen once more: a period the
tag boundary had orphaned is a period the frequency table never
counted as dotted, so a repair that moved one turned a token the
`rare-dotted-variant` rule could not see into one it could.

Reproduce the residue figures on this page with:

```bash
bun research:residue
```

The variant readings in §"Why the fix is not in `stripTags`" came
from one-time probes; each probe's shape is written out beside its
number.

## The finding: a period on the wrong side of a tag

23 of the 67 created hints are `bare-abbrev`, and every one of the 23
sits on an entry where a transform moved a terminal period out of an
emphasis run:

```html
<i>v.</i>   →   <i>v</i>.
```

That is `italic-swallowed-terminal-period` and
`label-period-outside-italic` doing exactly what they are for.
Rendered, the two lines are the same two characters, differing only
in whether the period is slanted. Nothing a reader sees moved.

The detector's tokenizer disagreed. From `anomalies.ts`:

> ```ts
> function stripTags(s: string): string {
> 	return s.replace(TAG, ' ');
> }
> ```

Every tag becomes **a space**. So `<i>v</i>.` strips to `v  .`, the
whitespace split hands `tokenHints` a bare `v` and an orphan period,
and the rule reports

> bare 'v' where the corpus writes 'v.' 36429x vs bare 6x

The probe tested the shape rather than the rule, which is what makes
the answer worth having: for each of the 23, is the flagged word
separated from a following period by nothing but tags? **23 of 23.**
Not a majority — the whole class, across every rule that produced
one.

This is the third instance of the rule
[`phase-2-residue.md`](phase-2-residue.md) states twice, at 484 hints
and then at 29:

> **a detector calibrated on the raw corpus is not calibrated on the
> healed one.**

It is also the widest, because it did not need a transform to fire.
The raw corpus already contains `<i>Pl. f</i>.` and its kin, so the
same tokenizer had been reporting **107 more entries** that were
never defects, in every sweep since the detector's 2026-08-13
calibration.

Every tag in the corpus is inline — `a` 170,203, `span` 101,225, `i`
47,082, `sup` 311, `b` 20, `sub` 10, and no block element anywhere —
so a tag boundary never renders as a space. The space was wrong at
every one of them; it only became visible where it separated a word
from its punctuation.

## The second finding: the corpus's own separator hid a control

The module docstring names one entry as `bare-abbrev`'s catch:

> `bare-abbrev` — 395 entries; catches the pilot-miss shape A00074
> (`bot` for `bot.`).

**A00074 does not fire, and never has.** Its text reads

```html
…>Y. Shebu. VI, 37ᵃ</a> bot—V. <a …>בּוּן</a>.
```

`bot—V.` is one whitespace token. `WORD` anchors on a short Latin
word with optional attached punctuation, and an em dash is neither,
so the token is rejected whole — neither `bot` nor `V.` is counted or
judged. The em dash is the corpus's sense separator, so this is not
one entry's bad luck: across the corpus **9,761 whitespace tokens**
open with a short Latin word and are then rejected on an em dash,
invisible to the frequency table and to every rule that reads it.

That is worse than the stale counts the residue page records in its
§"Two discrepancies". A count that has drifted still measures
something, and announces itself by failing to reproduce. A named
positive control that does not fire measures nothing and announces
nothing — it is indistinguishable from one that passes, and this one
had been standing in for `bare-abbrev`'s precision since 2026-08-13.
Three of five counts reproducing looked like an audited calibration;
the one thing that check could not see was a rule that never caught
what the line said it caught.

The two findings are the same defect seen from either side. One reads
a rendered space that is not there; the other misses a rendered break
that is. Both live in the split between markup and text.

## The fix

`latinTokens` replaces the bare `stripTags(def).split(WHITESPACE)` at
both call sites — the table build and the hint pass — so the two can
no longer drift apart:

```ts
const SEPARATOR = /[\s\u2014]+/gu;
const SEPARATOR_MARK = '\u0000';

function latinTokens(def: string): string[] {
	const marked = def.replace(SEPARATOR, SEPARATOR_MARK);
	return stripTags(marked)
		.split(SEPARATOR_MARK)
		.map((token) => token.replaceAll(' ', ''));
}
```

The order is the whole trick. `stripTags` fills every tag boundary
with a space of its own, and once it has run, the spaces the source
wrote and the spaces it invented are indistinguishable — while
meaning opposite things. Marking the source's separators first keeps
them apart, so a tag can then contribute *nothing*, which is what it
renders as, and only a marked separator ends a token.

That also means no second regex reads the markup. An earlier draft
removed tag runs sitting between a letter and its punctuation, with
`/(?<=[A-Za-z])(?:<[^>]*>)+(?=[.,])/gu`; CodeQL flagged it HIGH under
`js/incomplete-multi-character-sanitization`, and it was right to —
one pass over `<scr<i>ipt>` leaves `<script>` behind. The rule this
code needs has nothing to do with recognising a tag: a lone period
belongs to the word in front of it, and whether a boundary lies
between them is already settled by the marking.

The hyphen is deliberately not a separator: it joins a word rather
than breaking one (`au-`, `K'doshim`), and a control row asserts that
it still does not split.

**A00074 now fires**, with `bare 'bot' where the corpus writes 'bot.'
4618x vs bare 24x`. The other three entries the docstring names —
A00470 and A00266 for `comma-for-period`, A00571 for `circular-v-ref`
— fire before and after, which is what makes A00074's change
attributable to this fix rather than to a detector that started
flagging more of everything.

Five tests in `anomalies.test.ts` hold it. Three fail against the old
tokenizer; two are controls that must pass on both sides — a
genuinely bare `Ar` still flags, and `au-Ar` still does not — because
an assertion that something stopped firing means nothing beside one
that says it did not stop firing too much.

## Why the fix is not in `stripTags`

Stripping every tag to the empty string is the shorter change and it
looks equivalent: if no tag renders as a space, none should tokenize
as one. It is not equivalent, and the difference is measurable.

| PRE, corpus-wide | current | tags → `''` | `latinTokens` |
|---|---:|---:|---:|
| `bare-abbrev` | 395 | 289 | 289 |
| `rare-dotted-variant` | 575 | 691 | 691 |
| `comma-for-period` | 101 | 108 | 108 |
| `truncated-formula` | 22 | **15** | **22** |

Read the last two columns against each other with the em-dash half
held back, as above: they are the same tokenization and they agree on
every Latin count. One column differs, by seven entries, and it is
the rule that does not read tokens at all.

`stripTags` also feeds `formulaHints`, which matches stereotyped
citation formulas against the stripped string rather than against
tokens; joining every tag boundary there glues `D. S.` to its
neighbours and seven entries stop matching. A change to the tokenizer
belongs in the tokenizer, where exactly one thing reads it.

## What moved

Attributing the two halves separately, by PRE entry counts:

| Kind | before | tag boundary | + em dash |
|---|---:|---:|---:|
| `bare-abbrev` | 395 | 289 | 318 |
| `rare-dotted-variant` | 575 | 691 | 705 |
| `comma-for-period` | 101 | 108 | 108 |
| `truncated-formula` | 22 | 22 | 22 |
| **residue, POST** | **3,946** | **4,014** | **4,047** |
| **hints the rules created** | **67 / 65** | **32 / 30** | **32 / 30** |

The tag-boundary half alone retires all 23 created hints; the em-dash
half retires none of them and is carried for its recall.

Both halves *raise* `rare-dotted-variant`, which is the honest cost
to state. Making a period visible turns a token the rule never saw
into a dotted one it can judge, and the rule's precision on those is
the same mixed quality it already had. Two of the newly visible, in
context:

- A00188 `…v. infr.—Pl. אֲבָקוֹת` — `infr.` beside a dominant
  `infra.` A finding.
- A00318 `…in a bath tub.—Pl. אַגָּנִין` — `tub.` is an English word
  ending a sentence. Not a finding.

That mix is not new; it is the population the existing 575 already
were. The change makes it 705.

Net, 2.3's sweep population grows **3,946 → 4,047 entries** (+101,
+2.6%) and its unadjudicated created hints shrink **67 → 32**.

## What is left of the created hints

**32 hints on 30 entries** as the fixed-table reading counts them —
**37 on 35** once the reading is made consistent, which
§"The adjudication" below works through. The composition has changed
character either way. The Latin FREQUENCY kinds are gone — `bare-abbrev`
and `rare-dotted-variant`, the two the tokenizer was manufacturing —
and what remains is link judgment: Hebrew headword comparisons, plus
`roman-numeral-display`'s single Roman citation numeral on I00311.

| Kind | Hints created | On entries new to the kind |
|---|---:|---:|
| `abbrev-mislink` | 10 | 1 |
| `one-consonant-diverge` | 6 | 0 |
| `exact-headword-diverge` | 5 | 5 |
| `inflection-escape-link` | 5 | 1 |
| `niqqud-twin-target` | 5 | 5 |
| `roman-numeral-display` | 1 | 0 |

The enrichment ranking over the 30 — a rule's share of the gained set
against its share of the 32,512 — now reads:

| Rule | On gained | Corpus-wide | Enrichment |
|---|---:|---:|---:|
| `open-paren-in-anchor-display` | 8 | 214 | **40.5x** |
| `holam-migrated-off-mater-vav` | 16 | 440 | **39.4x** |
| `plural-to-feminine-final-letter-mislink` | 1 | 50 | 21.7x |
| `gershayim-breaks-ref-attribute` | 1 | 85 | 12.7x |
| `ib-yoma-2a` | 2 | 188 | 11.5x |
| `paren-tag-no-space` | 1 | 136 | 8.0x |
| `parenthesized-alt-headword` | 4 | 579 | 7.5x |

`bare-rtl-hebrew` fires on 8 of the 30 at **1.8x** — that is the
null. `italic-swallowed-terminal-period`, which led the pre-fix
ranking's raw count at 26 of 94, is down to 3 of 30 at 2.4x: the
23 hints that put it there were the tokenizer's, not its own.

`roman-numeral-display`'s single created hint is I00311, already
adjudicated on the residue page as a correctly linked continuation
citation.

## The adjudication: 37, not 32, and none of them the detector's fault

The section above left 32 hints on 30 entries. **Adjudicated, the
population is 37 on 35** — and unlike the 35 the tokenizer was
manufacturing, every one of these is a real question about a real
link.

### The instrument undercounted, for the third time on this page

`residue.ts` counts a created hint **entry-side, holding the tables
at PRE**, and says why:

> a frequency hint's detail quotes the very counts the tables hold …
> so every such hint is renamed by any table shift

That is right for a frequency hint and wrong for a link one. A link
hint judges a display or target against the **headword index**, so
the index is not a neutral backdrop — it is the comparison. Held at
PRE while the entries are healed, a repaired display resolves to no
headword at all and the detector goes quiet. The fixed-table reading
is blind to exactly the hints a headword-repairing rule creates, and
`holam-migrated-off-mater-vav` fires on 16 of the 30.

Five entries prove it. C01276, K00110 and V00586 carry a display
`גַּרְדּוֹם`; Q01046 and Q01117 carry `פִּילּוֹן`. From `twinHint`:

> ```ts
> if (family.has(base)) { … 'differing only in niqqud' … }
> ```

The display has to **be** a headword. These displays were always
spelled correctly; it was the *neighbouring entry's headword* that
was corrupt — `גַּרְדֹּום`, holam sitting left of the dagesh instead
of on the mater vav — so `family.has(base)` was false and nothing
fired. Repair that headword and the display resolves, the family
holds two vocalizations, and the link is revealed to point at the
twin rather than at the word the display names.

`residue.ts` now prints both readings and names the five the fixed
one cannot see. `LINK_KINDS` lives in `link-anomalies.ts` beside the
rules that emit them, with `LinkHint['kind']` derived from it, so a
new link kind cannot be added there and missed here.

### Revealed, not created: 26 of the 35

The two dispositions are opposite, so the question is measured rather
than argued. For each gaining entry, compare the **consonant-level
(display → target) relations** before and after, ignoring points and
brackets — points are what these rules move, and
`open-paren-in-anchor-display` removes a stray `(` without changing
which word a display names.

**26 of 35 are spelling-only.** The rules changed how a word is
written and nothing about which words the anchor relates, so the
defect was there all along and a corrupt spelling was hiding it. Of
the 9 that did change a relation, **8 changed an anchor other than
the one the hint names** — `ib-yoma-2a` retargeting a Latin citation
in A01451 while the hint is about `אִיסְתַּ׳`, and so on. Incidental,
not causal.

That leaves one.

### The finding: a repair can invert which side of a mislink is wrong

**U00776**, and `impossible-dagesh` is the only rule that fired.

| | Display | Target | Hint |
|---|---|---|---|
| PRE | `סִירּוּק` | `סִילּוּק` | `one-consonant-diverge` — display is no corpus headword |
| POST | `סִידּוּק` | `סִילּוּק` | `exact-headword-diverge` — display **is** a headword |

Resh cannot carry a dagesh. Dalet can, and ד/ר is the canonical
Hebrew OCR confusion — so the impossible mark is the witness that
identifies the letter, which is the whole argument of that rule.
Jastrow's own next sentence settles it:

> dough is called *siur*, when the cracks on the surface spread like
> the horns of locusts

`סִידּוּק` is cracking; `סִילּוּק` is removal. The display is right and
**the target is the mislink.**

Now read the two hints as a sweep agent would. The PRE hint says the
display is no headword and sits one consonant from its target — which
invites correcting the *display* to match the link. That is
backwards, and it would have destroyed the reading Jastrow explains
two clauses later. The POST hint says the display is a headword and
the target differs — correct the *target*.

**A hint of this family does not say which side is wrong, and a
repair upstream can flip the answer.** Nothing in the sweep prompt
says so, and on this entry the pre-repair prior points the wrong way.

### One collision the rules did create

A rule that repairs a headword writes into the namespace every link
names, so the repaired form can collide with another headword.
Measured across all 32,512 entries: skeletons whose set of
vocalizations **grew** to two or more — exactly **one**.

`abbrev-fused-headword` repairs P00308 to `עוּנְתָא`, which now shares
the skeleton `עונתא` with P00309's `עוֹנָתָא`. One new niqqud-twin
pair in the headword namespace, corpus-wide. Small, and worth knowing
that it is one rather than assuming it is none: a headword is a
namespace, and a rule rewriting one can break the links that name it.

## What this hands the rest of 2.3

1. **37 created hints on 35 entries are adjudicated REAL and hand on
   to judgment**, not retired. 26 of the 35 are defects the rules
   made visible without changing any link relation; 8 more changed a
   relation on an anchor the hint does not name; U00776 is argued
   above. Link decisions throughout: 36 Hebrew headword comparisons
   and I00311's Roman numeral. `open-paren-in-anchor-display` at
   40.5x on 8 entries and `holam-migrated-off-mater-vav` at 39.4x on
   16 are where to start.
2. **31 `roman-numeral-display` entries**, unchanged by this pass and
   argued on the residue page.
3. **The remaining 3,982 entries are the sweep population.**

(1) and (2) are entry sets that overlap, so they subtract as a union
and not as a sum: I00311 is in both — it is the one created
`roman-numeral-display` hint *and* one of the 31 — which makes the
union 35 + 31 − 1 = **65**, and 4,047 − 65 = 3,982. Subtracting them
separately would hand the sweep an entry it had already been told
was adjudicated.

**Nothing in (1) is retired**, and that is the difference between the
two halves of this pass. The tokenizer was manufacturing hints; these
37 are the rules doing their job, repairing a spelling that had been
hiding a link defect. The 35 entries go to the sweep as judgment,
with U00776's lesson attached.

### The sweep prompt is not re-signed for this

`sweep-v5.md`'s hint table describes `rare-dotted-variant` as

> rare `X.` one edit from a dominant sibling (`Rab.`/`Rabb.`) — class
> 8, `needs_print_check` — unless the short form is itself a real
> convention in context

That clause already covers `tub.`: it is not a short form at all, so
an agent judging it in context marks it spurious under the rule as
written. The prompt carries no count for the kind and no verdict on
it, so nothing in v5 is falsified by the population growing — which
is the opposite of the v4 `roman-numeral-display` line, where a stated
prior (*"all inspected ones spurious"*) would have decided an entry
for the agent. Left at v5 deliberately; recorded here so the decision
is not mistaken for an oversight.

One thing this pass did not do: the hints the fix *adds* to the PRE
corpus — 314 `rare-dotted-variant`, 56 `bare-abbrev` and 9
`comma-for-period`, counted on an identity that ignores the frequency
figures a moved table rewrites into every detail string — are newly
visible, not newly true, and none of them has been adjudicated.
They are ordinary residue and reach 2.3 through the sweep like the
rest.
