# The own-inflected-form gap — sizing

Two batches produced the same defect shape: **an anchor whose display
is the host entry's own inflected form, linking away from the host.**

| Batch | Entry | Display | Target |
| --- | --- | --- | --- |
| 03 | A01023 `אחי` | `אָחוּי`, the host's own `Part. pass.` | `חוי ²` |
| 04 | A02408 `אִסְטְרָטָא` | the host's own plurals of "paved way" | `אִסְטְרַטְיָא` (στρατεία, "camp") |

Both were found only by the sweep prompt's mandatory display-vs-target
check — that is, by an agent reading carefully. Nothing deterministic
catches them. This document sizes the class and, more usefully,
corrects the diagnosis.

Measured on the **healed** corpus (repairs + both transform phases),
which is what a sweep agent reads. 32,512 entries, 63,936 non-geresh
anchors.

## The diagnosis in both reports was wrong

Batch 03 attributed A01023 to `inflection-escape-link`'s `formsOf`
exclusion — the clause narrowed in `71f4936` — and recommended
narrowing it further. Batch 04's verifier attributed A02408 to "the
detector's skeleton-match exclusion". **Neither anchor reaches any
exclusion.** Instrumenting the rule's own clauses in their own order:

| `inflectionHint` clause | Anchors stopped there |
| --- | --- |
| 1 stem shorter than 3 | 10,024 |
| 2 display reads as the headword | 10,047 |
| 3 display is not one of the host's own forms | 39,926 |
| 4 target stem == headword stem | 892 |
| 5 target stem == display stem | 2,324 |
| 6 target records the form (`formsOf`) | **173** |
| fires | 550 |

- **A01023 stops at clause 1.** `stem('אָחוּי')` is `אח` — two
  characters — because `stem()` removes matres lectionis, and `ו` and
  `י` are two of the four letters in the word. It falls under the
  3-character floor before any question about the link is asked.
- **A02408 stops at clause 2.** `stem()` reduces both the plural
  `אִסְטְרָטַיָּא` and the singular headword `אִסְטְרָטָא` to
  `אסטרטא`, so the rule concludes the display *is* the headword and
  returns. It never looks at where the link goes.

So the shared cause is not policy but **normalization**: `stem()`
strips exactly the letters that distinguish an inflected form from its
base. Clause 6, the one batch 03 proposed to change, is the smallest
in the funnel at 173 anchors — even if wholly wrong it could not
account for either instance.

## The class, sized

An anchor is a candidate when the display is one of the host's own
inflected forms (compared with matres **kept**, so a plural is not
confused with its singular) and the display is not the headword
itself. 3,283 anchors qualify. What happens to them:

| Bucket | Anchors | Status |
| --- | --- | --- |
| Target spells the form; its skeleton has ONE owner | 1,229 | correct link, no ambiguity |
| Target spells the form; skeleton has MANY owners | **927** | **A02408 shape** |
| Target is neither the host nor the form | **510** | **A01023 shape** |
| Already hinted by `inflection-escape-link` | 317 | detected today |

Against 317 currently detected, the undetected surface is roughly
**1,437 anchors** — but both figures need their caveats stated.

### The 510 (A01023 shape) is an upper bound

89 come from structured fields, 421 from forms stated only in sense
prose (`Pl. X`, `Part. pass. X`), which `ownForms` never reads — it
harvests `plural_form`, `alt_headwords` and `binyan_form` only.

**148 of the 510 collapse to equality under `stem()`**, meaning
display and target differ only by matres or the `-ים`/`-ין` nasal —
`אֲבֵילִים` → `אֲבֵילִין`, `אֵגוֹרִים` → `אֵגוֹרִי`. Those are
ordinary spelling variants and almost certainly correct. The
defensible residue is about **362**, and it has not been adjudicated.

### The 927 (A02408 shape) is not orthographically decidable

This is the harder half, and the reason it matters more than its size.
In A02408 the display, the target, and the host's own plural **all
share one skeleton**. The link is wrong anyway, because A02412 is a
different lemma that happens to be spelled the same. No comparison of
letters can separate "links to the entry that *is* this form" from
"links to a homograph that merely spells it".

The only deterministic signal available is that the skeleton has more
than one owner — which says the link *could* be wrong, never that it
is. That is a triage signal, not a detector.

## A failed control, recorded

The first three cuts of this measurement were each over-inclusive, and
the last of them **classified A02408 as a correct link**. The
predicate said "the target spells the displayed form, so the link is
fine" — true of the letters, false of the meaning, and it silently
excluded one of the two entries the whole exercise exists to explain.

It surfaced only because both named entries were asserted as controls
rather than the count being read on its own. A count with no named
member in it is not evidence about that member. Earlier cuts returned
7,150 and 2,666 and 510; all three were plausible.

## Recommendation

**Do not change `inflection-escape-link`'s exclusions.** That was
batch 03's recommendation and it addresses the smallest clause in the
funnel. The two observed instances would both still be missed.

Three things are worth doing, in this order:

1. **Adjudicate a sample of the 362.** Nobody has read them. Until
   somebody has, the class has two confirmed members and an unverified
   bound. A 20-entry sample would settle whether the residue is mostly
   real.
2. **Fix the clause-1 floor, which is cheap and self-contained.** The
   3-character minimum is applied to `stem()`, after matres are gone.
   Applying it to `skeleton()` instead would stop discarding
   four-letter participles as two-letter noise. This changes hint
   volume and therefore re-chunks, so it must land between batches.
3. **Leave the 927 to the sweep.** It is a homograph-disambiguation
   problem, and the mandatory display-vs-target check is already the
   thing that solves it — an agent reading both entries' senses. A
   detector can at best hand it the ownership count, which the
   `niqqud-twin-target` hint already does for a neighbouring shape.

## Provenance

Measurements taken with the production `ownForms`, `stem`, `skeleton`
and `buildHeadwordIndex` over `healedCorpus()`, never a
reimplementation. Every count carries a positive control; the anchor
scan reports 63,936 non-geresh anchors, and both named entries are
asserted present in the buckets that claim them.
