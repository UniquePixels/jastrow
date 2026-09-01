# Phase 2 batch 9 — citation linking

**Scope ruled by Brian 2026-08-31:** the citation-linking family, 8 of
the 12 `PENDING` rows, 4,375 catalogued instances. The four Hebrew
orthography rows were left untouched.

**Outcome: one rule, seven withdrawals, and one new gate case.**

## The finding

**The transform route can repair a wrong anchor but cannot build a
right one**, because building one needs an address space that lives
outside this corpus.

Every row that would MINT an anchor failed. Both rows that RETARGET an
anchor already present held up under measurement, and one of those two
then failed for a different reason. That is the whole batch in three
sentences, and it is why the citation-linking family belongs to Phase 4
rather than to Phase 2.

| Row | Catalogued | Measured | Disposition |
|---|---:|---:|---|
| `tanhuma-never-linked` | 1,137 | 0 targets | judgment |
| `mekhilta-sifra-never-linked` | 923 | 1 target | judgment |
| `pesikta-drk-never-linked` | 695 | 0 targets | judgment |
| `targum-sheni-never-linked` | 362 | 0 targets | judgment |
| `midrash-petichta-unanchored` | 279 | 13 constructible | judgment |
| `unlinked-v-span` | 796 | 43 of 849 | judgment |
| `containment-fallback-mislink` | 22 | 20 defect, 1 determined | judgment |
| `v-sub-redirect-stub-mislink` | 161 | **50 determined** | **RULE** |

`coverage().total` **61 → 54**, the largest single drop the program has
recorded, past batch 8's 66 → 61. `RULES` **48 → 49**. `PENDING` **12 →
4**, and the four that remain are the orthography family.

## Arm A — the work is absent from the linker's table (5 rows, 3,396)

One measurement decides four of them. Over 32,512 entries after
`applyRepairs`: **170,184 anchors, 72,387 distinct `data-ref` values,
23,211 distinct work names.** Against that vocabulary, Tanhuma **0**,
Sifra **0**, Pesikta d'Rav Kahana **0**, Targum Sheni **0**, Mekhilta
d'Rabbi Yishmael **1**.

**No alias explains the zeros**, and the work-name list was enumerated
by initial letter rather than probed by guess — `S…` holds 10 names,
`T…` 102, `M…` 71, `P…` 6. The row's own controls survive that
enumeration intact: `Sifrei Devarim` 402 and `Sifrei Bamidbar` 193 are
present, and `Pesikta Rabbati` **809** stands against
`Pesikta d'Rav Kahana` **0**, which confirms with numbers the trap that
row warned of — a naive `Pesik.` rule would rewrite 809 correct links.

Every minting rule the registry carries is verified against an
in-corpus witness: `sectionBreakTerminator` 7,250 against 11,
`seeParticleRestore` a retained vocabulary of a dozen. Here there is no
witness. `Mekhilta d'Rabbi Yishmael` at 1 of 170,184 is not a
counter-example — one surviving value is exactly the normalised-away
signature.

`midrash-petichta-unanchored` is the near miss and was audited apart.
Its target pattern IS attested — 32 `Petichta` data-refs across five
addresses — so it is not a work-name problem. **It is a locus problem:
Sefaria addresses a proem by NUMBER and Jastrow cites it by its opening
RABBI.** Of 288 `introd.` citations, 149 read `(R. …` and **13** carry a
number. The rabbi→proem table is external data and belongs to Phase 4.

## Arm B — `unlinked-v-span` (796 catalogued, 849 measured)

A round-0 row carrying **no `reason` field at all**, so measured from
scratch, and the measurement supplied the null model it never had:
**2,990 anchored against 849 bare, 77.9% ambient.** The bare spans are
a real minority defect.

This row fails the OPPOSITE way to arm A and lands in the same place.
Its work name is attested 2,990 times over — every anchored control is
a Jastrow self-link — and the locus blocks it anyway: of 849 bare
spans, 159 are geresh abbreviations belonging to another family, **300
name a form the dictionary never heads** (spot-probed at 0 entries
each), 347 name an ambiguous skeleton, and 43 resolve uniquely. The
witness table that might have disambiguated the 347 covers **4 of
690** — the anchored and bare vocabularies are largely disjoint,
because the words that went unlinked are the rare ones.

## Arm C — retarget (2 rows), and the one that shipped

`v-sub-redirect-stub-mislink` reproduces at **327** entries. Of 225
anchored stubs, **132** point at a target that does not begin with the
consonants the abbreviation spells.

**The prefix alone does not determine the repair** — `כֹּר׳` has 223
candidate headwords — but conjoined with the row's own spelling-twin
test it determines **50** uniquely. All 50 were read; all 50 confirm,
and they are visibly right:

```text
נִדּוּי  v. sub נִידּ׳  was נִדְבַּךְ I  ->  נִידּוּי  N00624
נִיצְבָא v. sub נִצְ׳   was נִיצּוּחַ   ->  נִצְבָּא   N01099
קִבּוּץ  v. sub קִיבּ׳  was קְבל IV     ->  קִיבּוּץ  S00854
```

One shape the row did not name: `O00864` currently points at **its own
host**, a self-link rather than an unrelated lemma.

### The entanglement, declared

`geresh-abbrev-fixed-sink` (970) is `route: judgment`, so nothing
competes — but **39 of the 50 sit inside its population** under its own
multi-host predicate. The rule retargets the one `v. sub` host of each
deterministic sink and leaves the rest, which is defensible (the stub
supplies a spelling twin the other hosts lack) and is declared in
`registry.ts` and the audit rather than left for a gate to find.

### `containment-fallback-mislink` was ruled to ship, then withdrawn

Worth recording because the reversal came from doing the gate work.
Both named sinks reproduce exactly (`נגד → אִינְגַּד` 11,
`נימוס → אַבְנִימוֹס` 5), and defect separates from convention
**mechanically**: a target carrying material BEFORE the display is a
different lemma that merely contains it (`אִינְגַּד` = `אי` + `נגד`),
while a target that is display-plus-suffix is the Aramaic emphatic form
and a legitimate redirect. That gives 20 defect / 45 convention of 65,
and it recovers the row author's own hand reading — the 16 they called
defect are both named sinks, both in the prefixed bucket. 18 of the 20
survived reading every context.

**Specifying gate case 8 is what killed it.** The clause its shape
needs is skeleton EQUALITY, which vouches the WORD but not the ENTRY:
`נגד` admits `נָגַד`, `נְגַד` and `נֶגֶד`, and the contexts want
different ones. Only **1 of 18** has a uniquely determined target.
Withdrawing it is what keeps the batch consistent with the 347
ambiguous spans withdrawn in arm B for the same reason.

## Link-target gate case 8

Spec `docs/specs/2026-08-31-link-target-gate-case-8.md`. **The first
case to admit evidence from outside the entry.** Every earlier case
sources the written target from the entry's own input; a `v. sub` stub
holds only an ABBREVIATION of its target, so every earlier case
correctly reads the completion as a fabrication.

Five clauses, allowlisted on `VOUCH_DECLARERS` exactly as case 7 is.
**Residue measured zero**: clauses 2∧3 admit exactly one candidate
headword per repair, where clause 2 alone admits up to 54.

**The verification is in two halves and neither is sufficient alone.**
The gate checks STRUCTURE and has no corpus to ask whether the headword
exists; `v-sub-twin.corpus.test.ts` checks EXISTENCE and re-derives the
frozen table from the live snapshot. Both files say so, because a
reader who takes the gate's silence about existence for a guarantee has
the wrong model.

Of the 50 targets, 38 already appear as a `data-ref` elsewhere in the
corpus; 12 entries take their first anchor.

## Three matcher artifacts, all returning plausible numbers

Recorded because they are the batch's transferable lesson and none of
them came back empty:

1. `v\.\s*<span dir="rtl">` was used to split anchored from unanchored
   cross-references. An anchored one is `v. <a …><span>`, so the
   pattern can only match unanchored ones — it reported **0 anchored,
   ambient rate 0.0%**. Truth: 2,990 and **77.9%**.
2. A containment test compared skeletons without stripping the
   homograph superscript, so `צִינְּתָא ²` read as longer than
   `צינתא` and 242 ordinary homograph links scored as mislinks.
3. Fixing (2) gave **0** containment cases, reading as a clean
   refutation of a row that is real. It never looked: those anchors
   carry `dir="rtl"` on the `<a>` with bare inner text. Truth: 65.

The habit that catches an empty result does not catch these. The
sharper question for a census is: **can the pattern I wrote produce the
value I am treating as the contrast?**

## What batch 9 leaves

`PENDING` **4**, all Hebrew orthography, 413 instances:
`holam-migrated-off-mater-vav` 308, `shin-sin-dot-drop` 77,
`impossible-dagesh` 17, `vkh-geresh-loss` 11. Each must be checked
against the no-vowel-inference ruling before anything is written.

**One Phase 4 linker item** now carries the whole citation-linking
family: the missing work-name table, the rabbi→proem table, the
homograph disambiguation the 347 spans and the 18 containment repairs
both need, and the 175 `v. sub` stubs this rule does not reach. Every
measurement in the five audits under
`data/patches/catalogue-audit/` is work that item will need.

## Audits

`never-linked-works.md`, `midrash-petichta.md`, `unlinked-v-span.md`,
`containment-fallback.md`, `v-sub-redirect-stub.md`.
