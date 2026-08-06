# Jastrow Lexicon — Data Issues Report (for Sefaria)

Prepared by the jastrow.app project (Brian L.), from a full-corpus
audit of the Jastrow lexicon as exported from Sefaria's MongoDB
(`lexicon_entry`, `parent_lexicon: "Jastrow Dictionary"`, snapshot
2026-07-04, 32,512 entries). Each issue below is self-contained:
what is wrong, how to find every instance, and the fix — shown as a
before/after on a real entry where that helps. Counts are exact,
measured over the whole corpus.

Some of these faults may originate in the digitization that preceded
Sefaria's import rather than the import itself; they are in the
served data either way.

---

## 1. Three headwords read ך where the print has ד

**Entries:** `P00855` (עָמַך I), `P00856` (עָמַך II), `P00860` (עֶמֶך)

The printed dictionary (p. 1086) has עָמַד I, עָמַד II, עֶמֶד. The
entry content confirms the ד readings: P00855 equates the word to
אָמַד; P00856 is marked `(b. h.)` — עָמַד "to stand" is the biblical
verb, עמך is not a biblical lemma; P00860 cross-references עוּמָד.
Interestingly, the entries' own `prev_hw`/`next_hw` chain values
still carry the ד spellings.

**Fix:**

```diff
- "headword": "עָמַך I"
+ "headword": "עָמַד I"
```

(and likewise for the other two).

---

## 2. Phantom sense boundaries (36 entries)

The sense segmentation treats `N)` as a sense-number marker. In 36
entries the matched `N)` is actually the tail of a parenthesized
cross-reference or a citation's verse number, so the entry is split
into a phantom "sense 2" (etc.) with no sense 1, and the preceding
text is left with an unclosed `(`.

**Example — `A00913` (אוּרְתָּא).** The printed text is one flow:
`אוּרְתָּא f. (v. אוֹר 2) evening, night. Pes. 2ᵃ…` — "(see אוֹר,
sense 2)". Current data:

```json
"senses": [
  { "definition": " (v. <a …>אוֹר</a>" },
  { "number": "2)", "definition": "<i>evening, night</i>. <a …>Pes. 2ᵃ</a>; …" }
]
```

**Fix:** merge the two objects — concatenate
`definition₀ + number + definition₁` and drop the phantom boundary:

```json
"senses": [
  { "definition": " (v. <a …>אוֹר</a> 2) <i>evening, night</i>. <a …>Pes. 2ᵃ</a>; …" }
]
```

**Detection:** any sense whose `number` matches `^\d+\)$` with a
value ≠ `1)` and whose preceding text (previous sense's definition,
prepending `morphology`/`language_code`/`language_reference` when the
previous sense is the first) contains more `(` than `)`.

**Affected (cross-reference form, all 35):** A00913, A01662, A03104,
A03277, B00534, B00656, B00991, H00709, H00871, I00137, I00149,
I00753, J00301, K01188, L00346, N00327, N00740, N01381, O00821,
O01360, O01397, P00286, P00539, P00805, P00859, P01088, P01094,
P01436, Q02145, R00096, S01040, U00261, U00398, U01674, V00166.
**Citation form (1):** C00244 (sense boundary at `…I Chr. IV, 4)`,
a verse number).

---

## 3. Swallowed sense markers (numbering gaps, 35 entries)

Entries whose numbered senses skip values (`1), 3), 4)`) or start
past 1 without the unclosed-paren signature of issue 2 — usually a
sense marker fused into adjacent text.

**Example — `A00675` (אוּלָם II):** the first sense's text contains
`…Neub. Géogr. p. 18; 261)` — that is page `26` with the sense
marker `1)` fused onto it (missing space), which is why the entry's
only explicit number is `—2)`.

**Fix (this entry):**

```diff
- …Neub. Géogr. p. 18; 261) <i>Ulam</i> (Po…
+ …Neub. Géogr. p. 18; 26 — split here into sense "1)": <i>Ulam</i> (Po…
```

i.e. the text from `1)` onward belongs in a new sense object with
`"number": "1)"`. Each of the 35 needs an eyes-on read; list on
request (we have reviewed them individually).

---

## 4. Etymology parenthesis split mid-phrase across fields

`language_code` / `language_reference` hold crude segments of the
entry's opening parenthesis. In many entries the split lands
mid-phrase, and in some the parenthesis never closes inside the
language fields at all — the closing `)` sits at the start of the
first sense's `definition`. Gender markers are sometimes caught in
the wrong field too.

**Example — `K00664` (כִּכָּר):**

```json
"language_reference": " c. (b. h.; = <span dir=\"rtl\">כרכר</span>",
"content": { "senses": [ { "definition": ", v. <a …>כִּרְכֵּר</a>) [<i>circle</i>,] …" } ] }
```

Note the gender marker `c.` inside `language_reference`, and the
parenthesis opening there but closing in `definition`.
**Example — `A00014` (אָב II):** `language_code` is `"(b. h.;"` and
the first definition begins `" , const. …"` — an orphaned comma.

**Fix:** re-derive the two language fields by splitting at phrase
boundaries, or store the parenthesis whole. Systemic: 5,842 entries
carry the split; the mid-phrase cases are detectable by unbalanced
parens across the field boundary.

---

## 5. Malformed anchors — href swallows following markup (3 entries)

**Entries:** `D00478`, `J00597`, `J00603`

An `<a>` open tag's `href` value is never quote-terminated, so the
stored attribute contains following markup, and in two of the three
a neighboring valid anchor is consumed into it.

**Example — `J00597`:**

```html
<a dir="rtl" class="refLink" href="/Jastrow,_דִּלְדֵּל.1</a><a class="refLink" href="/Bava_Metzia.38b" …>
```

**Fix:** close the first anchor properly:

```html
<a dir="rtl" class="refLink" href="/Jastrow,_דִּלְדֵּל.1" data-ref="Jastrow, דִּלְדֵּל 1">…</a> <a class="refLink" href="/Bava_Metzia.38b" …>
```

---

## 6. Duplicated nested anchors (475 in definitions; 1,230 corpus-wide)

Identical anchors nested one inside the other. The 475 counts
definition-field anchors only; adding the 755 `language_reference`
occurrences gives the 1,230 all-field total the upstream register
reports.

**Example — `A00085`:**

```html
<a … href="/Jastrow,_אבהנוס.1" data-ref="Jastrow, אבהנוס 1"><a … href="/Jastrow,_אבהנוס.1" data-ref="Jastrow, אבהנוס 1">אבהנוס</a></a>
```

**Fix:** drop the outer duplicate. **Detection:** `<a` immediately
followed by another `<a` with identical `href`/`data-ref`.

---

## 7. refLink hrefs missing the leading slash (7,659 anchors)

```diff
- <a class="refLink" href="Jerusalem_Talmud_Nedarim.5.6.3" data-ref="Jerusalem Talmud Nedarim 5:6:3">
+ <a class="refLink" href="/Jerusalem_Talmud_Nedarim.5.6.3" data-ref="Jerusalem Talmud Nedarim 5:6:3">
```

All 7,659 are external (non-Jastrow) targets. **Detection:**
`href="` not followed by `/`.

---

## 8. `quotes` field corruption (324 triples, 301 entries)

The `quotes` triples (compound-phrase index) show several damage
patterns: phrase token order reversed relative to the body text,
third-slot translations truncated mid-word (`"Bibl"`, `"Ar"`,
`"Am"`), `I`→`1` substitutions (`"1 will gird him…"`), and 8 phrases
that do not occur in their entry's body at all (list: A00173, A02049,
A03198, C00860, I00437, K00250, S00252, S01101). The first slot of
every triple is null. As far as we could determine, nothing in
Sefaria-Project currently reads this field — flagging for whatever
future use it has.

**Example — `A00202`:** `quotes` holds
`[null, "רמ\"ח אֵבֶר", "248 limbs (joints)"]`; the body prints the
phrase in the abbreviated form `רמ"ח א׳` — the expanded phrase and
the body disagree, and third slots elsewhere truncate.

---

## 9. Empty strings in `binyan_form` arrays (486 occurrences, 446 entries)

**Example — `P00791`:**

```diff
- "grammar": { "binyan_form": ["אִתְעַלֶּי", " אִתְעַלָּא", ""], "verbal_stem": "Ithpa." }
+ "grammar": { "binyan_form": ["אִתְעַלֶּי", " אִתְעַלָּא"], "verbal_stem": "Ithpa." }
```

(Note also the leading space on the second form — pervasive in these
arrays.) **Detection:** any `binyan_form` array containing `""`.

---

## 10. Damaged sense-number strings (6 occurrences)

- `D00341`: first sense's `number` is `"[1)"` — a stray bracket
  (`[1)` → `1)`).
- `M02309`, `O00408`, `S02030`, `U00745`, `U00939`: `number` is
  `"-2)"` with an ASCII hyphen-minus (U+002D) where every other
  continuation sense in the corpus uses the em-dash `—2)` (U+2014).

**Fix:**

```diff
- "number": "-2)"
+ "number": "—2)"
```

---

## 11. Internal refLinks that resolve to no entry (88 links)

88 `refLink` anchors targeting `Jastrow,_<headword>` strings match no
entry headword (dangling internal links). List available on request.

---

## 12. `refs` items with no basis in the entry (3 items)

`D00541` lists `Yoma 2a`, `Q00890` lists `Yoma 2a:3`, and `M01355`
lists `Rosh Hashanah 23b` — in each case the entry's text contains no
citation of that location (checked including `Ib.` resolution). They
may be mis-attached links.

---

## 13. Mis-targeted internal refLink (1 known)

**Entry `A01350` (אִימַּר), sense `—4)`:** the anchor wraps the text
`כפר א׳` (K'far Imra, a place name) but targets the unrelated entry
`*איבּוּס` ("manger", itself a pointer to אָמוּס):

```html
<a dir="rtl" class="refLink" href="/Jastrow,_*איבּוּס.1" data-ref="Jastrow, *איבּוּס 1">כפר א׳</a>
```

**Fix:** the link should target the K'far Imra-related entry (or be
unlinked). Found by eye during manual review; a systematic sweep
would need anchor-text ↔ target-headword comparison, so there may be
more of these. The same sense also opens with `*  pr. n. pl.` (star
followed by a double space) — the star likely belongs elsewhere in
the printed text (displaced during digitization).

---

## 14. Form sections flattened into the preceding sense

In the printed dictionary, a related grammatical form — a noun's
plural (`—Pl. <form> …`), or (found during a later print pass,
2026-07-14) a verb's passive participle (`—Part. pass. <form> …`),
feminine (`—Fem. <form> …`), or denominative (`—Denom. <form> …`) —
opens a separate lemma-level section after the preceding senses,
sometimes with its own numbered sense set restarting at `1)`. The
data model has no structure for this: every such section is
flattened into the tail of the preceding sense's `definition`
string. **All entries carrying one of these markers are affected**
(5,484 with `Pl.` in this snapshot, plus smaller counts for the
other three); in the 13 entries where the section carries its own
numbering — `Pl.` 5 (A01047, B01292, C00062, D00194, E00789),
`Part. pass.` 6 (A02260, A03348, C00869, C00964, C01139, H01022),
`Fem.` 1 (G00644), `Denom.` 1 (I00311) — the flattening is visibly
damaging because two independent numbering sequences end up
interleaved in one senses array. (D00194 carries both a `Fem.`
section and a numbered `Pl.` section; the numbering belongs to the
nearer `Pl.` marker, not the earlier `Fem.` one.)

**Example — `C00062` (גְּבוּרָה).** The end of sense `—3)`'s
definition currently reads:

```
…from the mouth of the Lord.—Pl. גְּבוּרוֹת 1) manifestations of
Divine power, wonders. … —2) mighty deeds…
```

The `1)` and `2)` here are not sub-points of sense 3 — they are the
plural lemma's own senses. A faithful structure would be, in outline:

```text
senses: 1) strength…  2) …  3) might of God…
plural (גְּבוּרוֹת): 1) manifestations of Divine power…  2) mighty deeds…
```

**Detection (numbered form):** tag-stripped definition matching one
of the four markers followed within ~120 characters by a bare `1)` —
but with paren-balance tracking from the marker forward: a naive
match yields 38 candidates across the four markers (`Pl.` 25,
`Part. pass.` 10, `Fem.` 2, `Denom.` 1), of which 25 are false
positives where the `1)` is a chapter/paragraph number closing a
parenthetical citation (`Lam. R. introd. (R. Joḥ. 1)` style), or —
for one of the two `Fem.` candidates (D00194) — a run that genuinely
belongs to a different, later marker section. The genuine 13 are
listed above; each was verified by hand.

---

## 15. `refs` field is missing ~33k citations that appear inline

The `refs` array tracks which texts an entry cites, but it is far
from complete against the entry's own body: **13,841 entries carry
at least one inline citation (a `refLink` anchor with a `data-ref`)
that does not appear in their `refs` — 32,899 citations in total.**
Even matching loosely (is the cited *book* present in `refs` at
all?), 13,259 entries / 29,640 citations are missing.

**Example — `A00014` (אָב II):** `refs` lists 34 items, yet the
body's inline citations of `Mishnah Kelim 1:1`, `Mishnah Bava Kamma
1:1`, `Mishnah Chagigah 2:2`, and `Leviticus 20:27` are absent.
**Example — `A00013` (אָב I):** `refs` has 2 items; inline
`Mishnah Rosh Hashanah 1:3` and `Mishnah Taanit 4:6` are missing.

**Detection:** per entry, collect every `data-ref` from `refLink`
anchors across all sense definitions plus `language_code`/
`language_reference`, drop the `Jastrow, …` internal ones, and diff
against the `refs` array. (The reverse direction is near-perfect:
99.97% of existing `refs` items correspond to an inline citation —
so `refs` behaves like an incomplete derivation of the body text.)

The full 32,899-row list (rid → missing refs) is machine-generated
and available on request — happy to attach it when filing.

---

*Contact: brian@uniquepixels.xyz · jastrow.app. Full rid lists for
any class, and the detection scripts, available on request.*
