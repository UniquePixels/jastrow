# Headword design — proposal, decisions and open questions

**Status: §2 shape RULED 2026-09-21 and IMPLEMENTED in [#130](https://github.com/UniquePixels/jastrow/pull/130); §5–§6 stay open.** Worked
through with Brian 2026-09-18–20, walking every shape in
[headword-issues.md](headword-issues.md). **All 16 shapes are
settled**, and §2, §3, §3.1 and §4 are in code: one parser reads the
whole headword line into `headwords[]` plus an optional `display`,
`validate.ts` enforces §3.1, and every entry file carries
`"schemaVersion": 2`. Open work is tracked in issues #102–#111 and in
the patch queue (§4.1).

**Three things the implementation did not settle, and did not guess.**
(1) **A02823's display.** §2's table gives `({0}) {1} I`, which §5 and
§6 record as print's own placement, confirmed against the print and
DIFFERENT from the source's. §5 rules that until the ~580 parenthesis
placements are checked "only what the source shows is recorded", so
the parser emits `{0}, ({1}) I` — moving a delimiter it cannot verify
would be a hard-coded exception rather than a parse. (2) **The
separator.** The upstream split cut print's line at its commas and did
not keep them (§1), so no parser can tell M02007's line, which has
one, from A02823's, which does not; §4 rules that the app supplies
separators, and the template joins items with `, `. (3) **A name
collision the correction creates.** G00674 (`זָרָה`, *fem. of* זָר) and
G00675 (`זָרָה  I, II`, *v.* זרי I, II) are two bare cross-reference
stubs for one spelling. Under HW-H1-xref the numeral list is display
only with no `homograph`, so G00675's name strips to `זָרָה`, which
G00674 holds — the shape HW-homograph-gaps describes, at
[#111](https://github.com/UniquePixels/jastrow/issues/111). URL names
§4 assigns it to the editor; the gate is left red rather than a
disambiguator invented.

Headwords are load-bearing — lookup, slugs, links all name them — so a
headword defect **halts the pipeline** rather than joining a review list.
That is the rule this design has to be strict enough to support.

## 1. The problem this replaces

Today an entry holds `headword` and `altHeadwords`, each a form object
whose `text` is the marked string Sefaria stored. That string carries
print notation the form object has no room for, so the pipeline either
keeps the notation inside the lookup key or deletes it:

| Print sets | Sefaria stores | Today |
|---|---|---|
| `אֵב, אֵיב (אוֹב)` | `alt_headwords: ["אֵיב", "(אוֹב)"]` | parentheses deleted, grouping lost |
| `אַבְזָקַת (אַבְזָקָא, אַבְזָקָה)` | `["(אַבְזָקָא", "אַבְזָקָה)"]` | one group, torn at print's comma |
| `אַפְרִיקִי (אַפְרִיקָא) I` | `headword: "אַפְרִיקִי"`, `alt: "(אַפְרִיקָא) I"` | parentheses on the wrong form |
| `שִׁיף m., שִׁיפָה f.` | `morphology: "f."`, alts `["שִׁיפָ", "ה"]` | `m.` lost; one form torn in two |

## 2. Structure

> **RULING (Brian, 2026-09-21).** Entry data adopts this section's
> shape **now**, before `compile.ts` is written: `headwords[]` (index 0
> primary) replaces `headword` / `altHeadwords`; `display` is a
> template and is **optional** (unset = flagged, never defaulted; 7
> rows today: the 6 H2 rows and A01394); `partial` and per-form
> `gender` are form fields; the §3.1 rules are enforced in
> `validate.ts`; every file carries `"schemaVersion": 2`. The
> `sefariaHeadword` field from the URL-names spec §5.1 lands in the
> same rewrite.
>
> **What it costs:** one new parser (whole headword line → forms +
> `display` + `partial`; 26,815 entries are trivial, 5,697 carry
> notation); gate 2 `headwordRoundTrip` is redefined (byte regeneration
> of Sefaria's split strings is impossible once parentheses live in
> `display`) as text conservation plus a notation multiset;
> `parenthesized-alt-headword` and `phrase-alt-headword-stub` are
> unregistered (post-consolidation review §10 Q10 resolves with this),
> which moves the `transform:invariants` baselines; the corpus-tier
> blessing is re-run; the `reform` patch payload becomes forms +
> `display`; ~11 test files change. The full-tree rewrite is not a
> cost of this ruling — `sefariaHeadword` and `schemaVersion` already
> touch all 32,512 files under any option.
>
> **What it drops:** ~2,474 abbreviated alternates (20.2% of 11,080)
> stop being search keys; 1,393 entries have no alternate key until the
> print work in #107. The 227 alternates the stub rule expanded revert
> to their printed form.
>
> **What it defers:** filling the 23 lost-gender pairs (§5) is print
> work, now expressible; expansion of partials (#106, #107); the 580
> parenthesis placements (§5) are recorded as the source shows them.
>
> **Rejected:** freezing today's shape under `schemaVersion: 1` (makes
> compile's emit stage disposable, and no field can hold `partial`,
> grouping or a second gender label); adopting the fields additively on
> the old names (saves only a rename, costs a permanent `{0}` =
> `headword` / `{n}` = `altHeadwords[n-1]` off-by-one and a second
> migration).

```json
"headwords": [
  { "text": "שִׁיף", "gender": "m" },
  { "text": "שִׁיפָה", "gender": "f" }
],
"display": "{0} m., {1} f."
```

- `headwords[0]` is always the primary form. Slugs, search and links use
  it. `headwords[1…]` replace today's `altHeadwords`.
- A form holds only **meaning**: `text` (clean Hebrew), `reconstructed`,
  `homograph`, `disambiguator`, optional `gender`, optional `partial`.
- `partial: true` marks a form that is not a usable lookup key: an ending
  Jastrow prints after an ellipsis (`… טָה`), or a phrase holding an
  abbreviated word (`נְהַר פּ׳`, *N'har Pappa*). It is shown exactly as
  printed and is **never a lookup key**. It applies only to a form that
  has a **sibling full form**: an abbreviation that is an entry's ONLY
  name stays a lookup key, notation and all, or the entry becomes
  unfindable (X7).
- `display` is a template holding **how print set the line**. `{n}`
  inserts form n's bare text. Everything else is literal: commas (or
  their absence), parentheses, `*`, `?`, Roman numerals, superscripts,
  `m.`/`f.`.

Worked examples, one per variation found:

| rid | Print | `display` |
|---|---|---|
| M02007 | comma, numeral after the parenthesis | `{0}, ({1}) I` |
| A02823 | parentheses on the headword, no comma — the **print's** reading, confirmed against the scan. The source puts them on the alternate, so the parser emits `{0}, ({1}) I`; this value is set by a reviewed patch (§4 Parentheses, ruling 2026-09-22) | `({0}) {1} I` |
| K01275 | numeral inside the parentheses | `{0} I, ({1} II)` |
| A00888 | a 1-form group, then a 4-form group | `{0}, ({1}), ({2}, {3}, {4}, {5})` |
| G00374 | group opens on the headword, never closes | **unset** — flagged, see §3 |
| A00610 | star outside the parentheses | `*({0})` |
| B00825 | `(?)` query | `*(?){0}` |
| A00883 | cross-reference naming two homographs | `{0} I, II` |
| O00394 | an ending after an ellipsis (`סוֹפִיסְטָא, … טָה`) | `{0}, … {1}`, form 1 `partial` |

### Why a template rather than a display string

A plain `display: "שִׁיף m., שִׁיפָה f."` duplicates the Hebrew. A later
correction to a form would have to be made twice, and the app could not
tell which span is which form — so it could not link a word, highlight a
search hit, or derive a slug from it.

## 3. What halts, and what is only flagged

**Text defects halt. Display uncertainty does not.**

- A form's `text` is a lookup key, a slug and a link target. If it is
  wrong, torn or unparseable, the pipeline halts — nothing downstream
  can be trusted.
- `display` only says how print laid the line out. Where the source
  cannot settle it, the entry is still written, `display` is left unset,
  and the row is flagged for review. **This does not block go-live.**
- A flagged row is a ticket, not a guess. No default template is
  invented to fill the gap.

## 3.1 Rules the pipeline halts on

1. Every form index appears in `display` exactly once.
2. `display` contains **no Hebrew letters or points**. All Hebrew comes
   from the forms.
3. Markers agree with the forms: `*` immediately before `{n}` or its
   group ⇔ `reconstructed`; a **single** numeral beside `{n}` or its
   group ⇔ `homograph`; `m.`/`f.` beside `{n}` ⇔ `gender`.
   **Two or more numerals** beside one form (`{0} I, II`) are a
   reference to other entries, not a number for this one, and require
   no `homograph` — see §4.
4. A form's `text` never contains a comma, parenthesis, `?`, `=`, `…` or
   a Latin letter.
5. A `partial` form is never a lookup key. A slug is still derived from
   `headwords[0]` even when it is partial — with the notation stripped,
   so the URL stays stable — and the row is flagged for review.
6. Every comparison — lookup key, slug stem, link resolution, duplicate
   check — normalizes to **NFC first**; stored text keeps the source's
   own byte order. Combining-mark order varies (6 forms differ from
   NFC) and the two spellings are canonically equal, so a byte-exact
   comparison is a bug. `admin/pipeline/migrate/cite.ts` already does
   this. **Amended 2026-09-22 ([#110](https://github.com/UniquePixels/jastrow/issues/110)):**
   the migrate WRITE step is the one exception — `normalizeForWrite`
   puts every string of an entry file into NFC, under an assertion
   that `NFD(before) == NFD(after)`, so the property holds by
   construction rather than at each reader. `data/source/` is still
   never rewritten.

## 4. Decisions taken

| Topic | Decision |
|---|---|
| **Commas** | Never stored in a headword. The leading `,` that opens 10,743 glosses also goes; the app supplies separators. The 3 headwords that carry one (A02356, B00407, D00844) are defects. |
| **Parentheses** | The 2026-08-27 ruling ("strip the delimiters, add no new form-object mark") is **reversed in intent**. Grouping is kept as structure in `display` and never inside `text`. A group may span the headword and its alternates. **RULING (Brian, 2026-09-22).** The parser stays **source-faithful**: it records the placement the source shows and emits a comma between ungrouped forms, because Sefaria's split dropped print's separators and no parser can tell M02007's line (comma) from A02823's (none). A02823's print reading `({0}) {1} I`, already confirmed against the scan, is filed as a reviewed patch in the same batch as [#113](https://github.com/UniquePixels/jastrow/issues/113) — not as a code exception. The §2 row for A02823 is that patch's target, not the parser's output. The ~580 other placements stay as §5 records them. |
| **Roman numerals** | **Never moved.** Each numeral stays on the form it is attached to today and is printed where the source prints it — 10 inside the parentheses, 5 after. |
| **Gender** | At most one of: the entry's `grammar.gender`, **or** a `gender` on *every* headword of the entry. Never both, and no inheritance. |
| **A01480 `אִיסְפְּלָנִית(א)`** | An alternate ending of one word, not a separate form. The only headword in the corpus with this notation. |
| **Numeral lists on cross-references** (H1, 6 rows) | `display` only, **no `homograph`**. All 6 are bare cross-references (`אוּרְיָה I, II, v. אוּרְיָא`) and the numbered forms already exist elsewhere, carrying their own `homograph`: A00877/A00878 hold `אוּרְיָה` 1 and 2, and so on for B00435/B00436, D00607/D00608, E00515/E00516, G00696/G00698. The numerals here point at those entries. **RULING (Brian, 2026-09-22).** Stripping the list from the URL name makes G00675 (`זָרָה I, II`) collide with G00674 (`זָרָה`, fem. of `זָר`) — the only collision in 32,512, gate 7 at 65023/65024. The 1903 print (412a) sets the two lines back to back and marks the second only by its `I, II`. G00675 takes `disambiguator: 2` (name `זָרָה²`) by reviewed patch — Sefaria's own tool, carried by 766 source headwords. Rejected: reading `I, II` as a homograph (contradicts this row), merging the stubs (loses a printed line), holding the collision for #113. |
| **Parentheses whose group never closes** (H2, 6 rows: G00374, L00587, P00223, P00224, Q00370, S01421) | The forms are clean and are written; `display` is left **unset** and the row flagged `paren-group-close-unknown`. Verified: no `)` in the headword, the alternates or `morphology` for any of the 6 — the `)` in their definitions closes an etymology. Two readings are possible (`({0}, {1})` or `({0}) {1}`) and A02823 proves Sefaria can place them wrongly, so neither is assumed. |
| **A01394 `אֵינָשׁ) אִינְשָׁא`** (H2, 1 row) | Same treatment: the alternates need a re-split only the print can settle, so the row is flagged rather than guessed. |
| **Query mark `?`** (H3, 2 rows) | `display` only, never in `text`. Jastrow is marking the reading as doubtful, which carries nothing the lookup needs. The whole corpus holds two: A00077 alt `(?אִיבּוּס)` inside a paren group, and B00825 `*(?)בַּלְוָוטִי`. If "uncertain" ever becomes something the app filters on, these are the two rows to revisit — `*` is stored as `reconstructed` for the same kind of signal. |
| **`=` in a headword** (H4, 2 rows) | A source defect, not a shape: `=` introduces a GLOSS cross-reference ("this word = that word, which see"), and 635 entries already open their definition with it. A01148 is the model — headword `איגראנאמון`, definition `= אַגְרוֹנִימוֹס q. v.` — matching the print. A01175 (`אִידְרְעָא = אֶדְרְעָא`) and A01345 (`אִימְנוֹן = הִמְנוֹן`) kept the whole line as the headword; the fix moves `= Y` into the gloss. Both targets resolve: A00477 alt `אֶדְרְעָא` and E00628. `slugStem` therefore needs no `=` case, and 2 of the 22 S1 rows clear. |
| **Ellipsis endings** (H5, 8 rows) | Jastrow's own notation (confirmed): `… טָה` is an ending that replaces the base form's. Stored as a `partial` form, the `…` in `display`, **not expanded**: joining a fragment means choosing its base and assuming the letters before the seam keep that base's vowels, the inference ruled out for geresh stubs on 2026-08-22. For N01089 and M00997 even the base is unclear. Expansion against the print is [#106](https://github.com/UniquePixels/jastrow/issues/106); not a go-live blocker. |
| **Two spellings in one item** (H6, 5 rows) | A defect: Sefaria missed the comma between two forms — I00158 `טְוִיָּיה טְוִיָּה`, I00654 `טְפֵילָה טְפֵילָא`, M02116 `מַעְיָינָא מַעְיָנָא`, A01161 alt `אַיְידָא אֵידָא`, M02868 alt `מְשֵׁיזְבָא מְשֵׁיזִיב`. **Fixed by patch**: split the item at the space into two forms. Relocation only — every letter and vowel is already in the source, so this is inside the 2026-08-22 boundary. 3 of the 5 are primary headwords, so the split also corrects their slugs. Halts until patched. |
| **Reduplication** (H6, 3 rows) | Legitimate multi-word forms — one expression spoken twice: D00004 `דא דא`, E00007 `הֵא הֵא`, H01657 `חַר חַר`. Kept as is. |
| **Abbreviated phrase alternates** (H6, 7 rows) | Kept as printed and marked `partial`: `נְהַר פּ׳` is *N'har Pappa*, the headword abbreviated. These are the rows the existing `phrase-alt-headword-stub` rule declines (fused article, two stubs, mismatched pointing) while expanding ~236 others. Expansion against the print is [#107](https://github.com/UniquePixels/jastrow/issues/107). |
| **Abbreviations in a PRIMARY headword** (H6, 3 rows: K00107 `כִּדְ׳ כַּדְבוּבָא`, P00137, A02002) | What these lines mean cannot be read from the data — two sessions failed, and it needs real Jastrow knowledge (Brian, 2026-09-20). Kept as printed, carried in `display`, form marked `partial`; the slug still derives from it with notation stripped so the URL is stable, and the row is flagged. Tracked in [#108](https://github.com/UniquePixels/jastrow/issues/108). |
| **No expansion of abbreviations** (H6, ~236 alternates) | Brian, 2026-09-20: the shipped rule `phrase-alt-headword-stub` stops expanding. An abbreviated alternate keeps the printed form and is marked `partial` — the same treatment as H5 and [#107](https://github.com/UniquePixels/jastrow/issues/107). Nothing halts: the geresh is legal in `text` (134 genuine headwords carry one), the rule only ever touched `alt_headwords`, and `buildHeadwordMap` keys on `headword` alone, so no link resolves through an alternate. The rule's "no inference" claim is undercut by 2 rows it doubled a letter in (`יַי׳ חֳלִי` → `יַיַסֵּי חֳלִי`), tracked in [#109](https://github.com/UniquePixels/jastrow/issues/109). What is lost until the print work happens: those alternates stop being search keys. |
| **Spaced variants** (H6, 8 rows) | Legitimate: the same word written as two words — Q00248 `פּוּמְבְּדִיתָא` / `פּוּם בְּדִיתָא`, B00864 `בְּלִימָה` / `(בְּלִי מָה)`, plus H01065, I00568, S01240 and B00442's two. Kept as multi-word forms. |
| **Phrase headwords** (H6, 3 rows) | Legitimate phrase lemmas, each glossing a cross-reference: A00436, A01881, C00517. Kept. |
| **Phrase alternates** (H6, 238 rows) | Split three ways. **227** exist only because `phrase-alt-headword-stub` expanded an abbreviation (source `בַּר א׳` → `בַּר אַבְיוּ`); with expansion stopped they revert to the printed form and are `partial`, raising [#107](https://github.com/UniquePixels/jastrow/issues/107)'s real scope to ~234. **9** are genuine multi-word phrases in the source (`בֶּן בַּג בַּג`, `בַּב נַהֲרָא`, `עֵין טַב`) — a multi-word phrase IS the headword, nothing to do. **2** differ from the source only in the gershayim repair (A03391, C01224). |
| **Split headwords** (X1/X3, 5 rows) | Adjudicated against the print by Brian, 2026-09-20: U00489 (`ש` + `ׁוּף` → `שׁוּף`, a PRIMARY headword that was a single letter), V00518 (one headword plus a reference — the fragments belong in the gloss), S01780 (three headwords, the last an abbreviation), U01000 (`שִׁיפָ` + `ה`). Patched, not joined blindly: V00518 and S01780 come out unpointed by concatenation, so the patch text is the print's. Tracked in [#105](https://github.com/UniquePixels/jastrow/issues/105). |
| **Final letter mid-word** (X2, 1 row) | F00009 `וַארְךּוּנְיָא` is an OCR error; Brian read the print: the letter is a **dalet**. A mis-recognised glyph is a correction, not invented text ([[project_ocr_correction_ruling]]), so it is patched. It is a primary headword, so the slug corrects with it. |
| **Ending entries** (X1, 2 rows) | J00321 `ַיי` and J00327 `ַיְידָא` are entries for a shared ENDING — the mirror of X5's maqaf prefix entries — and are decided with them (see the prefix/ending row), not as defects. |
| **Mark order** (X4, 6 rows) | Normalized to NFC **on write** in the pipeline, never in the source snapshot — 164 strings in `data/entries/`, 201 in the snapshot (reported to Sefaria as §16 of [sefaria-report.md](sefaria-report.md), since Brian ruled it a source data error). The rewrite is provably lossless (`NFD(before) == NFD(after)` for all 164) and Hebrew only ever reorders — presentation forms are composition-excluded. Implementation and its safety properties: [#110](https://github.com/UniquePixels/jastrow/issues/110). Comparisons still normalize (rule 6). Original note: no data change. All 6 are canonically equal to their NFC form — same letters and points, different order (`בִּישָׁא` stores dagesh before hiriq). Stored text stays byte-exact; comparisons normalize (rule 6). |
| **Q00752** (X1/X3) | Split headword, adjudicated by Brian against the print: `פִּ` + `י` + `סְחָא` join byte-exactly to `פִּיסְחָא`, and the gloss already carries `v. פִּסְחָא`. No print spelling needed. |
| **Prefix and ending entries** (X5, 144 rows) | Legitimate entries, not defects: Jastrow gives a prefix its own entry ending in a maqaf (`אִ־` → slug `א-7`, `אַב־` → `אב-1`; 115 headwords, 27 alternates) and an ending its own entry beginning with a bare vowel (`ַיי`, `ַיְידָא`). **Slugs:** `slugStem` strips the maqaf, so a prefix shares its letter's slug family — accepted (Brian, 2026-09-20). **Search:** a prefix entry MUST be findable, so the search path strips the maqaf the same way the slug does; the two ending entries need no searchability. The maqaf and the leading vowel stay in `text`, which is what print sets. |
| **Abbreviated alternates** (X6, 2,240 rows / 2,038 entries) | Identical to the phrase case: kept as printed, marked `partial`, never a lookup key; expansion is print work ([#107](https://github.com/UniquePixels/jastrow/issues/107)). With H6's ~234 this is ~2,474 abbreviated alternates, 20.2% of all 11,080 — and in **1,393 entries every** alternate is abbreviated, so those entries have no alternate search key until the print work is done. This is the population the 2026-08-22 ruling already routed to judgment. |
| **Acronyms and numeral letters** (X7, 99 rows) | Legitimate entries, fully searchable, notation kept in `text` AND in the slug because it is part of the word: 78 gershayim acronyms (`א"ל` *Albam*, `שעטנְז` ) and 21 letters used as numerals (`א׳` — *"as numeral letter, one"*). |
| **Truncated headwords** (X7, 34 rows) | The entry's only name is an abbreviation (`אנטג׳`, gloss `v. אנטי׳`) — the `abbrev-headword-stub` population of the 2026-08-22 ruling. They stay **lookup keys as printed**, NOT `partial`: only 6 of the 34 have an unabbreviated alternate, so marking them partial would leave 28 entries unfindable. A reader seeing `אנטג׳` in the print must be able to find it. Expansion is print work, with [#107](https://github.com/UniquePixels/jastrow/issues/107). |
| **Homograph numbering gaps** (X8, 178 families) | Not patchable from the data, flagged for the print: [#111](https://github.com/UniquePixels/jastrow/issues/111). 82 families have one missing numeral and exactly one unnumbered sibling, 52 have no unnumbered sibling at all, 44 have several. This is the A02823 defect at scale — Sefaria mishandling a numeral on the headword line, like [#102](https://github.com/UniquePixels/jastrow/issues/102) and [#103](https://github.com/UniquePixels/jastrow/issues/103). **The detector itself was wrong** and is fixed: keyed on consonants it merged `קַרְחָא` II, `קָרָחָא` II and `קָרְחָא` II into one false clash, and it ignored alternates carrying the missing numeral — 202 reported, 178 real. |
| **Notation in a slug** (S1, 22 rows) | No decision of its own: every row is a form whose `text` carries notation that H1–H4 already remove (11 parentheses, 8 numerals/commas, 2 `=`, 1 `?`). The slugs regenerate clean once those land, and slugs are unfrozen during development. |
| **Slug number vs printed numeral** (S2, was 1,184 rows) | **Not a defect — by design** (Brian, 2026-09-20). The slug number orders the entries sharing a stem; Jastrow's numeral counts homographs of one word. They drift apart wherever a family mixes the two (1,040 families) or is offset (144). A prefix entry takes `אב-1`, so `אָב` I becomes `אב-2` — the URL is an opaque identifier and the page still shows `אָב II`. The generator no longer reports these rows. |
| **H1 separator defects** (4 rows) | A doubled space (B00098 `בַּד  V`) or a stray comma (B00443, C00329, M00447 `מוֹזְלָא , I`) in front of a single numeral is a defect: the text corrects to `<word> <numeral>` and then parses. |

## 4.1 Fixes queued as patches

**Shipped 2026-09-20** as 15 `reform` patches plus one anchor `replace`
in `data/patches/reviewed/` — all nine gates green, `unresolved=0`,
`headword-unparsed` 309 → 300, `slug-unsafe` 12 → 2. The `reform` op
(target `forms:<anchor>`) was added for them: every other target
addresses a sense.

**Two more on 2026-09-22**, from the rulings in §4: P000307 gives
G00675 its `disambiguator` and P000308 sets A02823's `display` to the
print's reading. P000300 was restated in the same batch — the block it
reads carries `(אַיְידִי)` again now that `parenthesized-alt-headword`
is unregistered. 17 `reform` patches, `patches.applied` 232.

Five rows are NOT in that batch and are tracked in
[#113](https://github.com/UniquePixels/jastrow/issues/113): A01175,
A01345 and V00518 need text moved into a gloss, which no op expresses;
S01780 and U00489 need the print's spelling. U00489 is the instructive
one — rejoining its torn headword produced a string U00488 already
holds, and the uniqueness gate refused it, so the entry carries a
numeral the tear lost.

| Shape | Rows | Patch |
|---|---|---|
| H1 separator defects | B00098, B00443, C00329, M00447 | text → `<word> <numeral>` |
| H1 leaked commas | A02356, B00407, D00844 | trailing `,` back to the gloss |
| H4 `=` in a headword | A01175, A01345 | `= Y` moves to the gloss |
| H6 two spellings in one item | I00158, I00654, M02116, A01161, M02868 | split at the space into two forms |
| X1/X3 split headwords | U00489, V00518, S01780, U01000 | rebuild from the print (not by concatenation) |
| X2 OCR glyph | F00009 | final kaf → dalet |
| X1/X3 split headword | Q00752 | join to `פִּיסְחָא` (byte-exact) |

## 5. Open questions

- **Parenthesis placement is not trustworthy in the source.** A02823 puts
  them on the wrong form (print reads `(0) 1 I`). About 580 entries carry
  parentheses and would need checking against the hOCR or the print.
  Until then, only what the source shows is recorded; see §4 for the 7
  rows this already reaches. A02823 alone is corrected by a reviewed
  patch, since its reading is confirmed (ruled 2026-09-22, §4
  Parentheses).
- **A02823 and M02007**: is the trailing numeral the entry's own? Not
  resolved — under §4 nothing moves either way.
- **Lost per-form gender labels.** Sefaria keeps only the last label on
  the headword line. 22 entries are known
  (`gender-pair-headword-line-collapse`); U01000 is a 23rd, confirmed
  against the print. The true size needs the print text — Sefaria-only
  proxies failed their own controls. **Not a go-live blocker.**

## 6. Shapes found during the walk-through

Not yet enumerated as rows in `headword-issues.md`:

| Shape | Evidence |
|---|---|
| **Split word** — Sefaria tore one form in two | U01000 `שִׁיפָ` + `ה` (print-confirmed), S01780 `קִצ` + `ּא`, V00518 `ת` + `ּשַׁע`, Q00752 `י` + `סְחָא`. These also produce the X1 and X3 rows. |
| **Alternate ending as its own item** | H01195 `תָה`, M01037, M01896, M02409, K00725 `יָא`, O01410 `לה`, S02002 `סָה` — and the H5 ellipsis rows (`… תָּה`). |
| **Optional prefix in parentheses** | U01971 `(הַ)`, K01196 `(ד)`, Q00053 `(בֵּי)` — the prefix-side twin of A01480. |
| **Parenthesis on the wrong form** | A02823, confirmed against the print. |
| **Lost per-form gender label** | U01000 and the 22 known rows; see §5. |

## 7. Next

That audit is done: every ruling on this project, with what it drops,
is indexed in [`docs/decisions.md`](../decisions.md) — §3 to §5 above
are its `HW-*` rows.
