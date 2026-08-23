# Exception register — the geresh-abbreviation arms

**Not an audit of a row. This is the list of populations the two
geresh transforms deliberately do not repair**, written on the
maintainer's ruling of 2026-08-23 — *"Unlink, but record the others as
exceptions, ultimately these exceptions need to be reviewed later"* —
so that the reasoning survives the workspace reports it came from.
Every arm below was measured against the pinned corpus while
`admin/pipeline/transform/rules/geresh.ts` was written (batch 2, task
5), and every figure here was re-derived from the corpus at the time
this document was written rather than copied from the brief.

**Nothing in this document has been decided.** Each section ends with
what a reviewer would actually have to settle.

## The two rules this is the complement of

| Rule | Predicate | Repaired |
|---|---|---|
| `geresh-letter-numeral-mislink` | display is one Hebrew letter (+ optional points) + geresh · `data-ref` is THAT letter's numeral article · the letter is the containing headword's first letter | 517 occ / 475 entries |
| `prefixed-geresh-abbrev-mislink` | display is proclitic + letter (+ points either side) + geresh · the SECOND letter is the containing headword's first letter · `data-ref` starts `Jastrow, ` | 185 occ / 173 entries |

Repair in both cases is UNLINK: drop the anchor, keep the stub text.
702 occurrences across 648 definitions in 640 distinct entries.

The parent population — every anchor whose `data-ref` is a letter's
numeral article — is **708 occurrences / 608 entries**, which is where
`geresh-letter-numeral-mislink`'s superseded `corpusCount` of 608 came
from. Arms 1–4 below account for the whole difference between that and
the strict 517.

### The shared harness

Every query in this document runs inside this walk. It is recursive
through `sense.senses` on purpose: senses nest, and a flat
`content.senses` walk loses roughly a quarter of these populations.

```ts
import { readSourceEntries } from './admin/pipeline/body/source.ts';
import { tokenize } from './admin/pipeline/transform/html.ts';
import { anchors } from './admin/pipeline/transform/links.ts';
import type { SourceSense } from './admin/pipeline/body/types.ts';

const P = '\\u0591-\\u05C7';                    // Hebrew points
const L = '\\u05D0-\\u05EA';                    // Hebrew letters
const ONE   = new RegExp(`^([${L}])[${P}]*׳$`, 'u');
const TWO   = new RegExp(`^([${L}])[${P}]*([${L}])[${P}]*׳$`, 'u');
const NUM   = new RegExp(`^Jastrow, ([${L}])׳ \\d+$`, 'u');
const FIRST = new RegExp(`[${L}]`, 'u');
const ART   = new RegExp(`^[${L}]׳`, 'u');
const PARTICLES = new Set([...'בהוכלמשד']);

function* defs(s: readonly SourceSense[]): Generator<string> {
  for (const x of s) {
    if (x.definition !== undefined) yield x.definition;
    if (x.senses !== undefined) yield* defs(x.senses);
  }
}
const head = (h: string) => FIRST.exec(h)?.[0] ?? '';

for await (const e of readSourceEntries())
  for (const d of defs(e.content.senses))
    for (const a of anchors(tokenize(d))) {
      /* per-arm predicate here */
    }
```

`[${P}]*` after every letter is load-bearing: **17** members of the
parent population are vocalised (`בַּ׳`, `אָ׳`, `נֶ׳`, `לִ׳`), and a
points-blind pattern silently measures 690 where the truth is 707.
The terminator is U+05F3 HEBREW PUNCTUATION GERESH in 707 of 707
stub-shaped displays — no ASCII apostrophe, no U+2019.

---

## Arm 1 — variant readings (152 occ / 123 entries)

```ts
const m = ONE.exec(a.display.trim()), n = NUM.exec(a.dataRef);
if (m && n && n[1] === m[1] && head(e.headword) !== m[1] && m[1] !== 'ר'
    && !ART.test(e.headword)) hit(e.rid);
```

**Examples:** A00414 (hw אֲדָל, `ע׳`), A00544 (hw אוֹגֶן, `ה׳`), A00760
(hw אוּנְקָא I, `ע׳`, twice), A00800 (hw אוֹפְיָא, `ה׳`), A01676
(hw אַכְוַרְנְקָא, `כ׳`).

**What it is.** A one-letter geresh stub abbreviating a VARIANT READING
named in the surrounding prose rather than the headword —
"Ms. K. ב׳", "ed. Berl. ע׳", "Ar. ע׳". The row's `reason` records that
107 of them sit in an explicit `ed.` / `Ar.` / `Ms.` / `Var.` context.
The anchor is still wrong: it points at the numeral article for that
letter.

**Why the rules leave it alone.** The transform's one condition is
"the stub abbreviates THIS entry's headword". A variant reading is by
definition a *different* word, so its letter differs from the
headword's first letter and it falls outside the predicate with no cue
regex needed. `geresh-letter-numeral-mislink`'s `reason` is emphatic
about the cost of the alternative under the superseded RETARGET plan:
a transform written to the old description *"would assert the variant
reading is the lemma on all of them."* That hazard is gone now that
the repair is unlink — but the arm still has no home.

**What a reviewer must decide.** Whether this is a row of its own. The
defect is real and mechanical (152 occurrences is not noise), and
unlinking would be defensible on the same "show only what Jastrow
linked" principle — but the *correct* target, where one exists, is the
variant reading's own article, not the containing entry, so it is a
genuinely different repair. **One of the two arms here most likely to
deserve its own row.**

---

## Arm 2 — `ר׳` = Rabbi, non-resh headword (20 occ / 19 entries)

```ts
const m = ONE.exec(a.display.trim()), n = NUM.exec(a.dataRef);
if (m && n && n[1] === m[1] && m[1] === 'ר' && head(e.headword) !== 'ר') hit(e.rid);
```

**Examples:** A00018 (hw אַבָּא II), D00892 (hw דְּמֵי I), D00921
(hw \*דָּנָב, twice), D00979 (hw דָּצוֹצָא), D01144 (hw דָּשֹׁושׁ).

**What it is.** `ר׳` before a personal name — the standard abbreviation
for *Rabbi* — linked to the numeral article for resh. It should not be
a lexical link at all.

**Why the rules leave it alone.** Same single condition: the host's
headword does not begin with resh. Note that
`rabbi-name-linked-as-bible-book` (registered, 42 entries) already owns
the "Rabbi abbreviation mislinked" shape, but its cue is `(R. ` / `, R. `
in Latin script resolving to the Book of Joshua; these 20 are the
Hebrew `ר׳` resolving to a numeral article and sit entirely outside it.

**What a reviewer must decide.** Whether to widen
`rabbi-name-linked-as-bible-book`'s predicate to cover the Hebrew form,
or open a small row. Either way the repair is the same one that row
already ships — unlink — so this is a scoping question, not a design
question.

---

## Arm 3 — the numeral articles' own cross-links (18 occ / 18 entries)

```ts
const m = ONE.exec(a.display.trim()), n = NUM.exec(a.dataRef);
if (m && n && n[1] === m[1] && head(e.headword) !== m[1] && ART.test(e.headword)) hit(e.rid);
```

**Examples:** A00006 (hw `א׳` → `ב׳`), B00002 (hw `ב׳` → `א׳`), C00002
(hw `ג׳` → `א׳`), D00001 (hw `ד׳` → `א׳`), E00001 (hw `ה׳` → `א׳`).

**What it is.** The alphabet's numeral articles referring to each
other. A00006 (the article for aleph) explains that editions vary
"between the full numeral and the numeral letter, `א׳` for אחד … `ב׳`
for שנים" and links `ב׳` to beth's own article.

**Why the rules leave it alone. THIS ARM IS NOT A DEFECT.** The link is
correct — it is the convention, and the only arm here where doing
nothing is the right end state rather than a deferral. It falls out of
the same condition (the stub's letter is not the host's), so no
exception list is needed to protect it.

**Related, and NOT excluded:** two further anchors — A00006's `א׳` and
M00001's `מ׳` — are a numeral article linking its OWN letter. Those are
inside the strict population and ARE unlinked, on Task 4's finding that
a self-link promises an article the reader is already reading.

**What a reviewer must decide.** Only whether the classification is
right, i.e. that a letter-to-letter link between numeral articles is
intended. **This is the one arm the catalogue currently has no home
for**, because it needs none — there is no row to open, only a
convention to confirm.

---

## Arm 4 — the swallowed open paren (1 occ / 1 entry)

```ts
if (NUM.test(a.dataRef) && !ONE.test(a.display.trim())) hit(e.rid);
```

**The whole arm:** **E00248**, display `"(ח׳"`, `data-ref`
`Jastrow, ח׳ 1`.

**What it is.** An anchor that swallowed the open paren preceding it
into its own display text, so the display is `(ח׳` rather than `ח׳`.

**Why the rules leave it alone.** Both stub patterns anchor the whole
display (`^…$`), so a leading paren is not a stub. This is the single
anchor separating the parent population's 708 from the audit's
recorded 707, and its 608 entries from 607.

**What a reviewer must decide.** Nothing here — it belongs to the
pending row `open-paren-in-anchor-display`, and is recorded only so
that whoever writes that row knows one of its members is also a geresh
stub and will become a geresh member once the paren is moved out. **The
two rules must be re-measured after that row ships** (517 → 518, 475 →
476, if E00248 holds no other member).

---

## Arm 5 — verbal-preformative stubs (34 occ / 32 entries)

```ts
const m = TWO.exec(a.display.trim());
if (m && head(e.headword) === m[2] && a.dataRef.startsWith('Jastrow, ')
    && !PARTICLES.has(m[1])) hit(e.rid);
```

**Examples:** D00892 (hw דְּמֵי I, `אִדְּ׳` → דְּכַר I), D00990 (hw דַּקְדֵּק,
`יִדַּ׳` → יוֹדְקֶרֶת), C01428 (hw גִּשְׁתָּא ², `אג׳` → אִיגַּרְתָּא), H01202
(hw חֲמַם, `אַחְ׳` → חֲרַק), T01049 (hw רְקַע, `תִּרְ׳` → תִּירְיָיקָא),
V00900 (hw תְּקֵן, `אַתְ׳` → אִיתְכָּלָא).

**What it is.** Structurally identical to
`prefixed-geresh-abbrev-mislink` — two consonants plus a geresh,
second consonant matching the headword, resolved to an unrelated
article — but the first consonant is a VERBAL PREFORMATIVE, not a
proclitic particle: `אִדְּ׳` is the Ithpe'el of דמי, `אַחְ׳` the Aph'el of
חמם, `תִּרְ׳` an Ithpa'al, `יִדַּ׳` an imperfect. The stub abbreviates an
inflected FORM of the headword, not the headword with a particle in
front of it.

**Why the rules leave it alone.** The row's own description says
"particle prefix". The rule's particle set — `ב ה ו כ ל מ ש ד`, the
closed class of Hebrew/Aramaic proclitics — was written from the
grammar and from that description *before* the population was counted;
it then measured 185 occ / 173 entries against a catalogued 173. These
34 are what it excludes.

**What a reviewer must decide.** Which row owns them.
`inflection-abbrev-mislink` describes exactly this shape ("geresh
abbreviation of one of the entry's own inflected forms … resolves to an
unrelated word sharing the opening consonants") but its audit imposed a
**≥ 3 letters before the geresh** threshold and its `reason` explicitly
hands the 1–2-letter cases to the geresh rows — so under the catalogue
as written these 34 are owned by nobody. **The second of the two arms
most likely to deserve its own row**, or a widening of
`inflection-abbrev-mislink` to two letters. The repair is the same
unlink either way.

**Caveat on the boundary, recorded because it cuts the other way.**
Even inside the 185 the rule DOES repair, a handful of `ה` / `מ` / `ל`
prefixes read more naturally as verbal preformatives than as proclitics
— C01182's `הִגַּ׳` (hw גִּעְגֵּעַ) looks Hiph'il, I00250's `מְטַ׳` (hw טוּשׁ)
participial. Since the repair is unlink and the anchor is wrong either
way, nothing is mis-repaired; only row *ownership* is ambiguous. A
reviewer settling arm 5 should settle these at the same time.

---

## Arm 6 — `ר׳` inside resh-headed entries (17 occ / 14 entries) — REPAIRED, flagged

```ts
const m = ONE.exec(a.display.trim()), n = NUM.exec(a.dataRef);
if (m && n && n[1] === m[1] && m[1] === 'ר' && head(e.headword) === 'ר') hit(e.rid);
```

**Examples:** T00033 (hw רִאשׁוֹן, four occurrences), T00454 (hw רוּת),
T00708 (hw רֵיקָנוּ), T00777 (hw רִכְפָּא), T01036 (hw רְקִיקָה).

**This arm is NOT excluded — it is unlinked with the rest of the strict
population.** It is registered here because it gets the right outcome
by inclusion rather than by intent, and that is worth a human's
confirmation.

**What it is.** `ר׳` in an entry whose headword begins with resh. The
predicate cannot tell whether it abbreviates the headword (רִאשׁוֹן →
`ר׳`) or means *Rabbi*; both readings are available, and by eye the
entries are mixed.

**Why they are in.** The audit's strict reading — `data-ref` is the
letter's numeral article AND the stub letter is the headword's first
letter — counts them, and it is that arithmetic that reproduces the
catalogued **517 occ / 475 entries** exactly. Excluding them would give
500/461 and would be carving the predicate against a number rather than
against the text, which is the failure mode the 2026-08-23 ruling on
Task 2 named ("a predicate carved to match a count is wrong").

**Why it is harmless under unlink, and would not have been under
retarget.** Under the superseded retarget plan these 17 would have been
pointed at the containing lexical entry — i.e. **a Rabbi abbreviation
asserted as the lemma**, the exact error arm 1's warning is about.
Under unlink they lose their anchor, which is where a Rabbi
abbreviation belongs anyway (arm 2's reading) *and* where a headword
abbreviation belongs (the rule's reading). Both readings agree on the
outcome, so the ambiguity does not have to be resolved to ship.

**What a reviewer must decide.** Confirm that agreement — that no
member of these 17 wanted to keep a link. If any did, it wanted a link
to the containing entry, which is the self-link Task 4 found promises
nothing.

---

## Summary

| # | Arm | Occ | Entries | Defect? | Repaired here | Home in the catalogue |
|---|---|---:|---:|---|---|---|
| 1 | variant reading | 152 | 123 | yes | no | **none** — candidate row |
| 2 | `ר׳` Rabbi, non-resh host | 20 | 19 | yes | no | near `rabbi-name-linked-as-bible-book` |
| 3 | numeral articles' cross-links | 18 | 18 | **no** | no | **none needed** — convention |
| 4 | swallowed open paren | 1 | 1 | yes | no | `open-paren-in-anchor-display` |
| 5 | verbal preformative | 34 | 32 | yes | no | **none** — candidate row, or widen `inflection-abbrev-mislink` |
| 6 | `ר׳` inside resh host | 17 | 14 | yes | **yes** | inside `geresh-letter-numeral-mislink` |

Arms 1–4 sum to 191, which is exactly the parent population's 708 less
the strict 517 — so the decomposition is complete, not a sample.

## Provenance

Measured against the pinned corpus (`data/source/jastrow-dictionary.jsonl`,
32,512 entries) during batch 2 task 5. The rule module is
`admin/pipeline/transform/rules/geresh.ts`; its corpus-walking tests in
`geresh.test.ts` pin the two repaired populations (517/475 and
185/173) on every `bun qa`, so a corpus edit that moves an arm shows up
as a test failure and this document can be re-derived.
