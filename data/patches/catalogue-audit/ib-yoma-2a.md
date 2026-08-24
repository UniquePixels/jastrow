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

**Known limit, stated up front rather than at the bottom.** The repair
is **folio-exact and segment-approximate**: it lands the reader on the
right page in every case, and on the segment the linker itself would
have chosen in about half. The other half is Sefaria matching quoted
Hebrew against a text corpus this pipeline does not hold, and it
cannot be reproduced or guessed. §3 measures the size of that gap and
argues it is nevertheless the most faithful reading available —
Jastrow wrote "ib." to mean the place he had just cited, so the
antecedent's own address is arguably closer to him than the linker's
text-match. It is recorded here as a blind spot, not implied away.

Two corrections the row needs, both derived below:

- **`corpusCount` 312 is an OCCURRENCE count, not an entry count.**
  312 occurrences sit in **274 entries**. `transform:count` measures
  entries, so the rule reports 188 against a catalogued 312; the delta
  is arithmetic, not disagreement (§7).
- **The row's description understates its own family.** A sibling arm
  of **52 occurrences / 47 entries**, identical in every respect except
  that the target carries a segment (`Yoma 2a:8` and friends), is
  catalogued nowhere — nor are 3 more in `Ibid.`/`ibid.` spelling. §8
  carries the executable query so Task 11 need not re-derive them.

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

Reusing the shipped rule's own predicates, so this measurement and the
rule cannot drift apart (`anaphora.test.ts` pins both halves and fails
on a single counterexample):

```bash
bun -e '
import { readSourceEntries } from "./admin/pipeline/body/source.ts";
import { tokenize } from "./admin/pipeline/transform/html.ts";
import { anchors } from "./admin/pipeline/transform/links.ts";
import { ANAPHOR, isSpentAnaphor, usable } from "./admin/pipeline/transform/rules/anaphora.ts";
const defs = (ss, out) => { for (const s of ss) { if (s.definition !== undefined) out.push(s.definition); if (s.senses) defs(s.senses, out); } return out; };
const jt = { sink: 0, total: 0 }, rest = { sink: 0, total: 0 };
for await (const e of readSourceEntries())
  for (const d of defs(e.content.senses, [])) {
    const list = anchors(tokenize(d));
    list.forEach((a, at) => {
      if (!(usable(a) && ANAPHOR.test(a.display.trim()))) return;
      const prior = list.slice(0, at).reverse().find((p) =>
        usable(p) && !isSpentAnaphor(p) && p.dataRef !== "" && !p.dataRef.startsWith("Jastrow, "));
      if (prior === undefined) return;
      const side = prior.dataRef.startsWith("Jerusalem Talmud") ? jt : rest;
      side.total++;
      if (a.dataRef.startsWith("Yoma 2a")) side.sink++;
    });
  }
console.log({ jt, rest });
'
# → { jt: { sink: 259, total: 259 }, rest: { sink: 62, total: 1942 } }
```

**Every bare `Ib.` standing after a Yerushalmi citation falls into the
sink** — 221 to `Yoma 2a`, 38 to `Yoma 2a:N` — with **no exception
corpus-wide**.

> **Corrected 2026-08-24 (apostrophe parser fix).** This read
> `259 of 260`, with the single exception explained as "O00242's anchor
> carries no `data-ref` at all, so the linker produced no address
> rather than a different one". The anchor carries
> `data-ref="Avot D'Rabbi Natan 1:7"`; `links.ts`'s value class was
> `[^"']*` and could not read a value holding an apostrophe, so it
> surfaced as empty. Read, O00242 is not a Yerushalmi case at all — its
> nearest citation antecedent is the `Avot D'Rabbi Natan 1:7` anchor
> two sentences earlier — so it leaves this population for `rest`
> (1,941 → 1,942) and the falsifier goes from one explained survivor to
> **zero survivors**. The identification is strengthened, not weakened,
> and the sink counts do not move.

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

Measured on a RANGE-SAFE comparison (§3.2 — an earlier stripper here
mishandled segment ranges and understated every tier):

| the linker's own resolution vs the antecedent's target | n | cumulative |
|---|---:|---:|
| byte-identical | 997 | **53.0%** |
| differs ONLY in the trailing segment | 871 | **99.4%** |
| same work, different folio | 11 | **99.9%** |
| different work | 1 | — |

*(996 / 870 / 11 / 3 until the apostrophe parser fix of 2026-08-24 —
§3.2 has what moved and why.)*

```bash
bun -e '
import { readSourceEntries } from "./admin/pipeline/body/source.ts";
import { tokenize } from "./admin/pipeline/transform/html.ts";
import { anchors } from "./admin/pipeline/transform/links.ts";
import { ANAPHOR, isSpentAnaphor, usable } from "./admin/pipeline/transform/rules/anaphora.ts";
const defs = (ss, out) => { for (const s of ss) { if (s.definition !== undefined) out.push(s.definition); if (s.senses) defs(s.senses, out); } return out; };
// range-safe: strip the LAST segment group only, then the whole locus
const passage = (r) => r.replace(/:\d+(?:-\d+)?$/u, "");
const work = (r) => r.replace(/\s\d+[ab]?(?:[:-]\d+[ab]?)*$/u, "");
let n = 0, exact = 0, samePassage = 0, sameWorkOnly = 0, diffWork = 0;
for await (const e of readSourceEntries())
  for (const d of defs(e.content.senses, [])) {
    const list = anchors(tokenize(d));
    list.forEach((a, at) => {
      if (!(usable(a) && ANAPHOR.test(a.display.trim()))) return;
      if (a.dataRef.startsWith("Yoma 2a")) return;          // the population
      const prior = list.slice(0, at).reverse().find((p) =>
        usable(p) && !isSpentAnaphor(p) && p.dataRef !== "" && !p.dataRef.startsWith("Jastrow, "));
      if (prior === undefined) return;
      n++;
      if (a.dataRef === prior.dataRef) exact++;
      else if (passage(a.dataRef) === passage(prior.dataRef)) samePassage++;
      else if (work(a.dataRef) === work(prior.dataRef)) sameWorkOnly++;
      else diffWork++;
    });
  }
console.log({ n, exact, samePassage, sameWorkOnly, diffWork });
'
# → { n: 1880, exact: 997, samePassage: 871, sameWorkOnly: 11, diffWork: 1 }
```

**99.4% of the time (1,868/1,880) the linker itself resolves a bare
`Ib.` to an address differing from the antecedent's by at most the
trailing segment, and 99.9% to the same work.** That is the semantic
claim — *ibidem* = the place last named — validated on 1,880 cases
nobody fitted it to.

### 3.1 KNOWN LIMIT — segment precision

In 46.3% (871 of 1,880) the linker picks a *different trailing
segment of the same passage* (`Sanhedrin 78b:12` → `78b:11`), because
Sefaria matched the quoted Hebrew to a specific segment. Copying the antecedent's target whole cannot reproduce that —
it is text matching against a corpus this pipeline does not hold, and
inventing a segment number is exactly what §3.2 forbids. **So the
repair is passage-exact and segment-approximate: it lands the reader
on the antecedent's own address — which is what "ib." names — and
differs from the linker's own answer in the trailing segment about
half the time.** Against `Yoma 2a` — a different tractate, a different
Talmud — that is a correction under any reading, and it is the most
precise one derivable from entry-local data. It is not segment-perfect
and this document does not claim it is.

Ruling (maintainer, 2026-08-23): **settled, no change wanted.** The
antecedent's exact address is arguably more faithful to Jastrow than
the linker's segment guess, since "ib." names the place he had just
cited. The limit is recorded rather than repaired.

**Inside the limit, but worth naming: 3 of the 209 firing members**
(P00175, Q00006, S00030) have an unanchored `Ib.` carrying a POSITION
marker in the gap — "Ib. (mid-page)", "Ib. bot." — so the `Ib.` this
rule repairs means the same folio at a different position on it. That
is a segment-level difference, so it sits inside the limit above
rather than beside it, but it is a distinguishable sub-shape and the
limit did not say so. `INTERVENING_CITATION` does not fire on these
because a position marker carries no locus: `beg.`/`end.`/`top`/`bot.`
are almost always the tail of the antecedent's OWN citation, so
treating them as cues would decline members for evidence of the
antecedent this rule is about to copy.

**Corrected 2026-08-24 (task 11).** This paragraph said those markers
"trip on 92 of the 272 gaps" and that using them would "decline a
third of the population", and closed with "3 same-folio position slips
against ~90 correct repairs". The 92 does not reproduce under any
reading, and the true numbers make the omission MORE load-bearing, not
less:

```bash
# over the same 272 gaps the census uses, with gapBetween's masking
bun test admin/pipeline/transform/rules/anaphora.test.ts \
  -t 'the omitted position-marker cue'
# → gaps 272, fires 209, marked 178, markedFires 133
```

**178 of the 272 gaps carry a position marker, and 133 of the 209
FIRING members do.** Adding the cue would cost 133 repairs of 209
(64%) and keep 76. So the trade is 3 same-folio position slips against
133 correct repairs. The figure is now pinned in `anaphora.test.ts`
rather than stated in prose, which is why it was wrong.

### 3.2 The "different work" cases — 1, not 3 and not 39

The 39 this section used to report was an artefact of a
folio-range-naive stripper, and it is corrected here rather than left
standing with a hedge. The old stripper —

```
r.replace(/\s*\d+[ab]?(?::\d+)*\s*$/u, "").replace(/\s*\d+(?::\d+)*\s*$/u, "").trim()
```

— cannot consume a segment RANGE, so `Niddah 36b:59-60` and
`Niddah 36b:66-67` compared as different "works" when they are the
same tractate and folio. Range-safe (the `passage`/`work` pair in
§3's query above), the count was **3** — and with the apostrophe
parser fixed it is **1**, for the separate reason recorded under the
table:

| rid | antecedent | the linker's `Ib.` | reading |
|---|---|---|---|
| A01334 | `Sukkah 55b:14` | `Mishnah Sukkah 1:1` | the one genuine work change — Bavli tractate vs the Mishnah of the same name |

> **Corrected 2026-08-24 (apostrophe parser fix).** This table carried
> two more rows, O00242 and S00503, each with the linker's `Ib.` shown
> as *(empty)* and read as "no rival address, the linker resolved
> nothing". Neither was empty. Both carry an `Avot D'Rabbi Natan`
> address that `links.ts`'s old value class could not read. Read, they
> do not belong in this table at all: O00242's anaphor and antecedent
> are the SAME address (it moves to `exact`), and S00503's differs only
> in the trailing segment (it moves to `samePassage`). The whole tier
> shifts 996/870/11/**3** → 997/871/11/**1**.

So the genuine work-level disagreement in the whole 1,880-case control
is **one** — 1 of 1,880, 0.05% — and it is one for a stronger reason
than before: the other two were never disagreements. The batch
reviewer, using its own work extractor, measured **4** here, agreeing
on the two empty-`data-ref` cases; that agreement turns out to have
been two readings of the same parser defect rather than independent
confirmation. Its remaining two rows have not been re-run against the
fixed parser, so the honest bound across both extractors is **at most
2 of 1,880 (0.11%)**. Either figure leaves the conclusion untouched.

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

**52 occurrences / 47 entries: bare `Ib.`/`ib.` anchors resolving to
`Yoma 2a:N`** (`:8` ×30, `:7` ×5, `:3` ×5, `:4` ×5, `:10` ×3, `:1` ×2,
`:5` ×1, `:6` ×1) are the identical defect with a segment attached —
38 of them are the
Yerushalmi arm of §2(c)'s 259, the same mechanism firing into a
slightly different address. They are outside this row's catalogued
312, outside `ib-targum-work-loss` (Targum-context, plain-book target)
and outside `sifre-ib-resolves-to-yalkut` (explicit conflicting work
name). Nothing in `patterns.jsonl` covers them.

**3 occurrences / 3 entries: `Ibid.`/`ibid.` anchors resolving to
`Yoma 2a`** are the same
defect in a third spelling, likewise uncatalogued. The rule here does
not claim them: they are not in the 312, and widening a predicate past
the number it reproduces is what §2 of this batch's lessons forbids.

**The query, so Task 11 can act on these without re-deriving them.**
It returns both arms at once, each keyed by the reading that separates
it from the catalogued 312 — a segment on the target, or a third
spelling of the anaphor:

```bash
bun -e '
import { readSourceEntries } from "./admin/pipeline/body/source.ts";
import { tokenize } from "./admin/pipeline/transform/html.ts";
import { anchors } from "./admin/pipeline/transform/links.ts";
const BARE = /^(?:Ib|ib)\.$/u;               // the catalogued 312 arm
const IBID = /^(?:Ibid|ibid)\.$/u;           // the third-spelling arm
const defs = (ss, out) => { for (const s of ss) { if (s.definition !== undefined) out.push(s.definition); if (s.senses) defs(s.senses, out); } return out; };
const seg = { occ: 0, rids: new Set(), refs: new Map() };
const ibid = { occ: 0, rids: new Set() };
for await (const e of readSourceEntries())
  for (const d of defs(e.content.senses, []))
    for (const a of anchors(tokenize(d))) {
      const show = a.display.trim();
      if (BARE.test(show) && a.dataRef.startsWith("Yoma 2a:")) {
        seg.occ++; seg.rids.add(e.rid);
        seg.refs.set(a.dataRef, (seg.refs.get(a.dataRef) ?? 0) + 1);
      }
      if (IBID.test(show) && a.dataRef === "Yoma 2a") { ibid.occ++; ibid.rids.add(e.rid); }
    }
console.log({ segmented: { occ: seg.occ, entries: seg.rids.size, byRef: [...seg.refs].sort((x, y) => y[1] - x[1]) },
              ibid: { occ: ibid.occ, entries: ibid.rids.size } });
'
# → segmented: { occ: 52, entries: 47, byRef: [["Yoma 2a:8",30], ["Yoma 2a:7",5],
#                ["Yoma 2a:3",5], ["Yoma 2a:4",5], ["Yoma 2a:10",3],
#                ["Yoma 2a:1",2], ["Yoma 2a:5",1], ["Yoma 2a:6",1]] }
#   ibid:      { occ: 3, entries: 3 }
```

The shipped rule's own predicates draw the same two boundaries and can
be reused directly: `isSinkMember` is the catalogued 312 (bare display,
EXACT `Yoma 2a`) and `isSpentAnaphor` is the 312 plus the 52 (bare
display, `Yoma 2a` PREFIX) — the widening is one of those two, already
written and tested.

Recommended: one new row for the 55, or a scope widening of this one,
decided in the catalogue rather than in a rule. The repair machinery
needs no change either way: `antecedentOf` reads the anchor sequence,
not the target's shape.

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
  259: **zero**, with no case to set aside. (Until 2026-08-24 this
  read "across all 260" and set aside O00242 as resolving to nothing;
  that empty `data-ref` was the apostrophe parser defect, and read,
  O00242 is not a Yerushalmi case — see §2c.)
- **The antecedent reading failing on data it wasn't fitted to.** §3's
  control is 1,880 anchors outside the population; 99.4% agree with
  the antecedent to within the trailing segment, 99.9% on the work
  (99.3% / 99.8% before the apostrophe parser fix).
  Had that come back near chance,
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
