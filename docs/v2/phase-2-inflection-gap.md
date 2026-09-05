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
`אֲבֵילִים` → `אֲבֵילִין`. Those look like ordinary spelling variants.
The residue is **362**.

**CORRECTION (2026-09-05).** An earlier revision of this paragraph
also cited `אֵגוֹרִים` → `אֵגוֹרִי` as an example of the 148. That was
wrong: the pair stems to `אגרם` against `אגר`, so it sits in the 362,
not the 148 — and adjudication found it to be a **real defect**
(A00282 `אֵגוֹרִי` is an independent lemma, "fit for storage, of good
quality", not a spelling variant of the plural of "heap"). The
extraction was right; only the prose example was wrong.

**The 148 remain entirely unadjudicated — no member has been read.**
They were excluded on an orthographic argument, which is the same kind
of reasoning that classified A02408 as a correct link three cuts
running. Treat the exclusion as untested.

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

## Adjudicated: 20 of the 362, and half are real

A systematic sample — sorted by rid, every 18th of 362, so it is
reproducible without a seed and spread across the alphabet — was read
by two independent Opus adjudicators, ten each. Each verdict had to
quote the **target** entry's own text from the corpus.

**10 wrong / 10 correct / 0 undecidable.** Both halves of the sample
came back 5–5 independently.

At that rate the 362 holds roughly **180 real defects**. Two things
make that a floor rather than a point estimate:

- **Defects cluster inside an entry.** N00891, T00033, T00697 and
  U02037 each carry a *second* faulty anchor that the sample did not
  select — `רִאשׁוֹנִים` alongside `רִאשׁוֹנוֹת`, `שִׁוֹ׳` → `שֹׁמְרוֹן`
  alongside `שָׁרְשִׁין`. Counting by anchor understates the entries
  affected.
- **The 927 and the 148 are not in this number.**

### The discriminator both adjudicators found independently

Neither was asked for one. Both arrived at the same test:

> **Does the target entry record the displayed form among its own
> `headword` / `alt_headwords` / `plural_form` (matres kept, niqqud
> stripped)?**

It sorted 10 of 10 for one adjudicator and 9 of 10 for the other. Both
branches are live — it fires on O01304, whose `alt_headwords` are
exactly `["סְעָרֵי","סְעָרִין"]`, and returns false on four wrong
targets.

The correct half is dominated by one legitimate shape: Jastrow's own
cross-reference stubs, entries whose entire definition is `", v. X"`
or `"same"`, which exist precisely to catch an inflected spelling.
Four or five of each adjudicator's "correct" targets were such stubs.

**Its one failure is instructive.** T00697's display is the
abbreviation `רִקּ`, and the wrong target `רִיקּוּד` records `רִקּ׳`
among its own forms — so the orthographic test says "recorded" and is
wrong. Geresh-abbreviated displays defeat it entirely and need a sense
read. That is the same population as the geresh-resolver finding in
batch 04's report.

### What the wrong half looks like

Not subtle. The reader lands on the circus (`קוּרְקְסַיָּא` →
`קִרְקְסָא`), on dancing (`רִקּ` → `רִיקּוּד`), on a personal name
(`בָּהוּל` → `בָּהוּ`, Abbahu), on ring-doves (`חֲתִימָתָא` →
`חֲמִימָתָא`), on leek (`כְּפָתַיָּא` → `כָּרָתֵי`), on a verb binyan
(`שָׁרְשִׁין` → `שָׁרְשִׁי`, ", Paeli of שְׁרַשׁ"). Two mechanisms:
one-letter corruption or truncation landing on a real but unrelated
headword, and links into a different lemma of the same root family.

None of the ten is a subtle homograph of the A02408 kind. Every one
would be caught by comparing the two glosses.

## Recommendation

**Do not change `inflection-escape-link`'s exclusions.** That was
batch 03's recommendation and it addresses the smallest clause in the
funnel. The two observed instances would both still be missed.

Three things are worth doing, in this order:

1. ~~**Adjudicate a sample of the 362.**~~ **DONE 2026-09-05: 10 of
   20 are real defects.** The class is confirmed at roughly 180
   instances in the 362 alone.
2. **Build the detector around the adjudicators' discriminator, not
   around `inflection-escape-link`.** "Does the target record the
   displayed form among its own forms?" sorted 19 of 20, needs no
   printed page, and is a different question from any clause in the
   existing rule. Exempt geresh-abbreviated displays, where it is
   known to fail, and send those to the sweep instead.
3. **Adjudicate the 148 before relying on the exclusion.** They were
   dropped on an orthographic argument and none has been read.
4. **Fix the clause-1 floor, which is cheap and self-contained.** The
   3-character minimum is applied to `stem()`, after matres are gone.
   Applying it to `skeleton()` instead would stop discarding
   four-letter participles as two-letter noise. This changes hint
   volume and therefore re-chunks, so it must land between batches.
5. **Leave the 927 to the sweep.** It is a homograph-disambiguation
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
