# Audit — `ib-yoma-2a` (catalogued 312, no `reason`)

**Verdict: CONFIRM the row, RETARGET 209 of 312, DECLINE 103.** The
defect is real, its mechanism is identifiable, and the correct target
is derivable from the entry's own input for two members in three. It
is *not* derivable for the other third, and every one of those has the
same cause: Jastrow printed the antecedent citation, the linker never
anchored it, so there is nothing lawful to copy. The declines are
reported here as a measurement, not written around.

The row was catalogued from a display probe and has never carried a
`reason`. This document is that `reason` (Task 11 owns the
write-back).

Two corrections the row needs, both derived below:

- **`corpusCount` 312 is an OCCURRENCE count, not an entry count.**
  312 occurrences sit in **274 entries**. `transform:count` measures
  entries, so the rule reports 188 against a catalogued 312; the delta
  is arithmetic, not disagreement (§7).
- **The row's description understates its own family.** A sibling arm
  of **52** anchors, identical in every respect except that the target
  carries a segment (`Yoma 2a:8` and friends), is catalogued nowhere
  (§8).

## 1. The population, pinned

An anchor whose display is a bare anaphor and whose `data-ref` is
exactly the sink:

```bash
bun -e '
import { readSourceEntries } from "./admin/pipeline/body/source.ts";
import { tokenize } from "./admin/pipeline/transform/html.ts";
import { anchors } from "./admin/pipeline/transform/links.ts";
const BARE = /^(?:Ib|ib)\.$/u;
const defs = (ss, out) => { for (const s of ss) { if (s.definition !== undefined) out.push(s.definition); if (s.senses) defs(s.senses, out); } return out; };
let occ = 0; const rids = new Set();
for await (const e of readSourceEntries())
  for (const d of defs(e.content.senses, []))
    for (const a of anchors(tokenize(d)))
      if (a.dataRef === "Yoma 2a" && BARE.test(a.display.trim())) { occ++; rids.add(e.rid); }
console.log({ occ, entries: rids.size });
'
# → { occ: 312, entries: 274 }
```

**312 occurrences / 274 entries — the catalogued figure reproduced to
the occurrence, from a query derived here rather than copied from the
row.** No predicate was tuned to reach it: the two conditions are the
row's own description ("`Ib.` anchors" / "resolving to Yoma 2a") read
literally.

**Scope is settled, not assumed.** Walking *every* field `fieldsOf`
touches — `headword`, `alt_headwords`, `plural_form`,
`language_code`, `language_reference`, `quotes`, `content.morphology`,
and recursively every `senses[].definition` — puts **371 of 371**
`Yoma 2a*` anchors in `senses[].definition` and **0** anywhere else.
`h-cognate-self-link` is the reason this is measured rather than
assumed; here the narrower walk is moot, not lucky.

The full `Yoma 2a*` neighbourhood, by display (n = 371 anchors):

| display | `Yoma 2a` | `Yoma 2a:N` | reading |
|---|---:|---:|---|
| `Ib.` | 258 | 40 | **this row** (with `ib.`) |
| `ib.` | 54 | 12 | **this row** |
| `Ibid.` / `ibid.` | 3 | 0 | same defect, different spelling; outside the catalogued 312 |
| `Yoma 2ᵃ` / `2ᵃ` / `2` | 2 | 2 | genuine citations of Yoma 2a — the sink address is a real place |

The last row matters: `Yoma 2a` is not a nonsense address, so the
defect is not visible by inspecting the target. It is visible only in
the relation between the target and the context, which is why a
display probe found this row and a target probe could not have.

## 2. The null model, and why it fails

**Null model: "`Ib.` here really does mean Yoma 2a."** Under it the
312 are correct and the row is noise. Three independent measurements
refute it.

**(a) Frequency.** The corpus holds 170,182 anchors. Bare-anaphor
anchors (`Ib.`/`ib.`/`Ibid.`/`ibid.`, display and nothing else) number
**2,257**, spread over **1,732 distinct targets** — a mean of 1.3
occurrences per target. `Yoma 2a` takes **315** of them, 242× the
mean and 63× the next most common target (`Shemot Rabbah 1`, 5).
A single address absorbing 14.0% of all anaphora (315/2,257) is not a
distribution; it is a fallback.

**(b) No member is accidentally correct.** For an `Ib.` to legitimately
mean Yoma 2a, the entry would have to have cited Yoma 2a just before
it. Measured across all 312: the number whose nearest preceding
non-anaphoric anchor targets `Yoma 2a*` is **1** (N01007) — and that
one's predecessor is itself a bare `Ib.` resolving to `Yoma 2a:8`,
i.e. another member of the same defect family, not a real citation.
**0 of 312 are correct today.**

**(c) The mechanism is identifiable, and it is not "Yoma".** Take
every bare-anaphor anchor in the corpus and classify it by the *work*
of its nearest preceding citation anchor:

| antecedent work | bare-anaphor anchors | landing on `Yoma 2a*` | rate |
|---|---:|---:|---|
| Jerusalem Talmud (any tractate) | 260 | **259** | **99.6%** |
| everything else | 1,941 | 62 | 3.2% |

```bash
# admin/pipeline/transform/rules/anaphora.test.ts pins both halves;
# the walk is the §1 query plus, per anchor, the nearest preceding
# usable anchor whose data-ref is neither "Jastrow, …" nor "Yoma 2a*".
```

**Every bare `Ib.` standing after a Yerushalmi citation falls into the
sink** — 221 to `Yoma 2a`, 38 to `Yoma 2a:N` — with exactly one
exception corpus-wide, and that exception is not a rival resolution:
O00242's anchor carries **no `data-ref` at all**, so the linker
produced no address rather than a different one.

The 81% Jerusalem-Talmud concentration in the members' own antecedents
(221 of the 272 that have a citation antecedent) is therefore not a
coincidence of subject matter; it is the defect's cause. The linker
resolves anaphora against the preceding citation, cannot resolve a
Yerushalmi citation in that position, and falls through to a fixed
address.

The remaining 51 members with a non-Yerushalmi antecedent are the same
failure reached by other routes (Targum runs, Mishnah, a Bible verse —
§5's table); 51 occurrences on one address, where the mean address
takes 1.3, is not the tail of a healthy distribution either.

**The null model is rejected.** All 312 are wrong.

## 3. Is the correct target derivable? The control

The repair proposed is: an `Ib.` adopts the target of the nearest
preceding citation anchor in the same definition. The strongest
available evidence for that reading is the corpus's own behaviour
where the linker did *not* fail.

**Control population:** every bare-anaphor anchor NOT landing in the
sink and having a citation antecedent in the same definition —
**n = 1,880**, disjoint from the members by construction.

| the linker's own resolution vs the antecedent's target | n | share of 1,880 |
|---|---:|---:|
| byte-identical | 996 | **53.0%** |
| same work and folio, different segment | 845 | 44.9% |
| different work | 39 | 2.1% |

**97.9% of the time (1,841/1,880) the linker itself resolves a bare
`Ib.` to the antecedent's own work and folio.** That is the semantic
claim — *ibidem* = the place last named — validated on 1,880 cases
nobody fitted it to.

**The honest residual, stated at full size.** In 44.9% the linker
picks a *different segment of the same folio* (`Sanhedrin 78b:12` →
`78b:11`), because Sefaria matched the quoted Hebrew to a specific
segment. Copying the antecedent's target whole cannot reproduce that —
it is text matching against a corpus this pipeline does not hold, and
inventing a segment number is exactly what §3.2 forbids. **So the
repair is folio-exact and segment-approximate: it lands the reader on
the right page always, on the linker's own segment about half the
time.** Against `Yoma 2a` — a different tractate, a different
Talmud — that is a correction under any reading, and it is the most
precise one derivable from entry-local data. It is not segment-perfect
and this document does not claim it is.

The 39 "different work" cases are mostly an artefact of the folio-
stripping in the query above mishandling segment RANGES
(`Niddah 36b:59-60` vs `36b:66-67` are the same work); the residue of
genuine work changes is a handful, and each is an `Ib.` after an
intervening unanchored citation — the same shape §4 declines.

## 4. Where the repair is NOT derivable: the decline census

The brief defines the antecedent as *the nearest preceding anchor in
the same definition whose target is not itself the sink*. Measured
against real bytes, that definition needs two restrictions, both found
by reading the members rather than by theory.

**(i) A `Jastrow, …` anchor is not a citation.** It is a dictionary
cross-reference. Copying one would make `Ib.` point at a headword,
which is not a place and not what *ibidem* names. 15 members have
nothing else to offer.

**(ii) The nearest ANCHOR is not always the nearest CITATION.** In 63
members an unanchored citation sits in the text between the anchored
antecedent and the `Ib.`. A03095 is the clearest: the anchored
antecedent is `Aramaic Targum to Job 6:11`, but the intervening text
reads

> `.—Y. Yoma VI, 43ᵈ … Y. R. Hash. I, 57ᵃ bot. … `

before the `Ib.`. The `Ib.` means Y. R. Hash. I, 57ᵃ. Copying the
anchor would write a **different work** — and `link-target.ts` cannot
catch it, because the wrong value *is* in the entry's input target
set. This is the one failure mode the gate is structurally blind to
(its own blind-spot list: "laundering between anchors"), so it has to
be caught here.

The test is syntactic and re-derived on every corpus pass: the text
between the antecedent's `</a>` and the `Ib.`'s `<a>` must hold no
folio/column superscript (`ᵃᵇᶜᵈ`), no chapter Roman numeral followed
by a comma, no `l. c.`, and no `s. N`. No rid list, nothing to go
stale. It is deliberately conservative — a Roman numeral in prose
costs a decline, never a mislink.

**The census, accounting for all 312:**

| disposition | occ | why |
|---|---:|---|
| **RETARGET** | **209** | a citation antecedent, and the gap between it and the `Ib.` is clean |
| decline — no preceding anchor at all | 23 | the antecedent is printed (`Y. Bets. V, 63ᵃ bot.`) but was never linked |
| decline — every preceding anchor is a sink member | 2 | N00819, R00635; chains of `Ib.` where the first also failed |
| decline — only `Jastrow, …` lexical antecedents | 15 | (i) above; in all 15 the true antecedent is an unanchored `Y. …` citation |
| decline — unanchored citation intervenes | 63 | (ii) above |
| **total** | **312** | |

209 occurrences / **188 entries** fire. 103 occurrences decline.

**Every decline has the same root cause**, which is worth stating
plainly because it makes the decline rate a fact about the corpus
rather than a weakness of the rule: *the citation the `Ib.` refers to
exists in Jastrow's text but not as an anchor.* Recovering it would
mean parsing `Y. Ter. VIII, 46ᵇ bot.` into a Sefaria address — that is
the never-linked family, deferred by the batch's own §1 ruling, and it
is inference rather than movement.

## 5. Sample read

The worked example, A00445 (`אַדְרָא`), anchors in source order:

| # | display | `data-ref` |
|---|---|---|
| 1 | `אָדַר` | `Jastrow, אָדַר 1` |
| 2 | `Y. Maas. Sh. IV, 55ᶜ` | `Jerusalem Talmud Maaser Sheni 4:6:11` |
| 3 | **`Ib.`** | **`Yoma 2a`** ← the defect |
| 4 | `ברא` | `Jastrow, בָּרָא I 1` |

Anchor 1 is skipped as lexical; anchor 2 is the antecedent; the gap
between them is ` אדר תורתא hide of a cow. ` — Hebrew and gloss, no
citation. The repair writes anchor 2's `href` and `data-ref` into
anchor 3, both verbatim, both already in the entry's input: **gate
case 2, no declaration**.

Antecedent works across the 272 members that have a citation
antecedent:

| antecedent work family | occ |
|---|---:|
| Jerusalem Talmud (37 distinct tractates) | 221 |
| Targum (Onkelos, Jonathan, Jerusalem, Aramaic Targum) | 21 |
| Babylonian Talmud | 18 |
| Midrash / Yalkut (Bereishit, Vayikra, Eichah Rabbah; Yalkut Shimoni) | 7 |
| Mishnah | 3 |
| Tosefta | 1 |
| Bible (`Jeremiah 32:18`) | 1 |
| **total** | **272** |

## 6. Compose (gate case 3) is unreachable — and unnecessary

The batch's design assigned this row the shape **compose**: the
antecedent supplies the work, the display supplies a new locus. The
measurement does not support it.

**Every one of the 312 has a BARE display.** That is the population's
definition, so it is true by construction — but it is also true of the
text around it, which is not:

```
immediate text token following the sink anchor, n = 312
  " "                       299
  " (ref. to " and 12 other parenthetical glosses   13
  anything matching a locus cue (digit, folio letter, Roman numeral)   0
```

**0 of 312 carry a locus anywhere the gate could see it** — not in the
display, not in the following text. So there is no remainder for case
3 to license, and none is wanted: a bare `Ib.` means *the same place*,
and the same place is the antecedent's address copied whole. Compose
would be a strictly worse reading of the same bytes.

**This row is 209 case-2 copies and nothing else.** The rule declares
no `composed` claims. Case 3's first real use falls to
`ib-targum-work-loss` (Task 8), whose displays do carry a work.

## 7. Write-backs owed (Task 11)

| field | from | to | why |
|---|---|---|---|
| `corpusCount` | 312 | 312 occ / **274 entries** | the number is right; its UNIT is unrecorded, and `transform:count` measures entries. The rule reports **188** entries — 274 members minus the 86 entries in which every member declines. Stated as a delta: 312 (catalogued, occurrences) − 103 (declines) = 209 occurrences = 188 entries. |
| `reason` | absent | this document | the row has never had one |

Nothing else moves. The row stays `route: transform`, `status:
candidate`.

## 8. Found alongside, catalogued nowhere

**52 bare `Ib.`/`ib.` anchors resolving to `Yoma 2a:N`** (`:8` ×30,
`:7` ×5, `:3` ×5, `:4` ×5, `:1` ×2, `:10` ×2, `:5` ×1, `:6` ×1) are
the identical defect with a segment attached — 38 of them are the
Yerushalmi arm of §2(c)'s 259, the same mechanism firing into a
slightly different address. They are outside this row's catalogued
312, outside `ib-targum-work-loss` (Targum-context, plain-book target)
and outside `sifre-ib-resolves-to-yalkut` (explicit conflicting work
name). Nothing in `patterns.jsonl` covers them.

**3 `Ibid.`/`ibid.` anchors resolving to `Yoma 2a`** are the same
defect in a third spelling, likewise uncatalogued. The rule here does
not claim them: they are not in the 312, and widening a predicate past
the number it reproduces is what §2 of this batch's lessons forbids.

Recommended: one new row for the 55, or a scope widening of this one,
decided in the catalogue rather than in a rule.

## 9. What would have falsified this

Each was looked for; none was found.

- **A member that is correct.** An `Ib.` whose entry genuinely cites
  Yoma 2a just before it. Measured: 1 candidate, and its predecessor
  is itself a defect. **0 real.**
- **`Yoma 2a` as a normal target.** If the sink address were simply
  popular, its dominance would be uninformative. Measured: 5 anchors
  in the whole corpus target `Yoma 2a` with a non-anaphoric display,
  2 of which are genuine citations. The address is rare; the anaphora
  are not.
- **A Yerushalmi antecedent that resolves correctly.** One
  counterexample would break §2(c)'s mechanism. Measured across all
  260: **zero**. The single non-sink case (O00242) resolves to nothing
  — an empty `data-ref` — which is the mechanism failing differently,
  not succeeding.
- **The antecedent reading failing on data it wasn't fitted to.** §3's
  control is 1,880 anchors outside the population; 97.9% agree with
  the antecedent at work-and-folio. Had that come back near chance,
  the row would have gone to `judgment` the way `h-cognate-self-link`
  did.
- **Discovery skew.** The catalogue was built letter-A-first, so an
  A-heavy population would suggest the count is a sampling artefact.
  Members: 15 of 274 entries are letter A (5.5%) against letter A's
  10.63% corpus share — under-represented, so the row was not found by
  looking at A and extrapolating.
- **A locus the display could supply.** §6: zero, in the display or
  beside it. Had any member carried one, compose would have been
  required and this document would say so.
