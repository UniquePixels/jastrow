# Audit — `abbrev-in-alt-headwords` (catalogued 2,265)

**Verdict: SPLIT.** Count exactly reproducible; the description covers
only 2,035 of its 2,265 entries.

## Probe and raw figure

Written from the row's `description` alone: an `alt_headwords` item
containing the Hebrew geresh U+05F3.

```python
import json
GER = '׳'
occ = 0; ents = set()
for line in open('data/source/jastrow-dictionary.jsonl'):
    e = json.loads(line)
    for a in (e.get('alt_headwords') or []):
        if GER in a:
            occ += 1; ents.add(e['rid'])
print(occ, len(ents))   # 2485 2265
```

**2,485 occurrences / 2,265 entries.** The entry figure matches the
catalogued 2,265 exactly, so the row counts entries. 196 entries carry
more than one abbreviated item. Widening to ASCII `'`/`"` and gershayim
U+05F4 gives 2,497 / 2,275; the +12 are all genuine acronym lexemes, so
the geresh-only scope was correct.

## Does this population have more than one job?

**Yes — two, plus a third the strict probe correctly excludes.**

| Job | Occ | Entries | Verdict |
|---|---|---|---|
| 1. Truncation stub — a shortened *spelling* of the headword | 2,241 | 2,035 | DEFECT |
| 2. Substitution stub — a multi-word *phrase lemma* with the headword replaced by its initial | 244 | 236 | DEFECT, but not the one described |
| 3. Gershayim acronym (outside the geresh probe) | 12 | 10 | CONVENTION — correctly out of scope |

**Job 1** matches the description: `רִבְדָּא` → `רִי׳` (= רִיבְדָּא),
`קִרְיָה II` → `קִירְ׳`. Sub-shapes: 1,722 plene/defective spelling
variants (the stub's consonants are *not* a prefix of the headword —
that divergence is the point of the variant), 302 pure truncations, 175
carrying a Roman homograph numeral any expansion must preserve, 42
diverging in the first letter by guttural interchange
(`הַדְיֵיב`→`(חַ׳)`, `הוֹבְרָיָא`→`אוֹ׳`).

**Job 2** contradicts the row's own wording "rather than a full
spelling". These are not spellings of the headword at all — they are
complete multi-word lemmas (toponyms, compounds) in which the headword
token is stubbed: `בֵּית ז׳` (Beth Zabdin), `נְהַר פּ׳` (Nehar Papa),
`בַּר תַּ׳`, `שְׁ׳ דּוֹץ`. Expanding the geresh yields a correct lookup key —
but a *phrase*, not an alternate spelling. A transform written to this
row's description would file 244 phrases into the alt-spelling index as
spellings of the headword. Same shape of error as `X ch. same`: one
mark, two jobs.

The two jobs need different transforms, which is the practical reason
they cannot share a row. Job 2 expands deterministically (substitute the
headword). **Job 1 does not:** the elided tail must be recovered by
aligning the stub to the headword, and the simplest anchor rule (locate
the stub's final consonant in the headword) is unique for only 1,468 of
2,241 stubs (65.5%). 527 (23.5%) have a final consonant that does not
occur in the headword at all (`אִיסְטְבָא` → `אִיצְ׳`, ס/צ interchange),
220 are ambiguous, 26 leave no tail. Positional alignment is not a safe
fallback either, because the stub is frequently the *plene* form and so
is longer than the headword prefix it replaces (`אִזְתַּוְודָּא` → `אִיזְ׳`).
No deterministic expansion rule was found.

**Checked for further jobs, none found:** geresh as a transliteration
modifier (ג׳ = /dʒ/) requires token-internal geresh — 2,484 of 2,485 are
token-terminal, and the one internal case is itself a job-2 phrase that
lost its space (P01521). Geresh as a numeral marker: zero. Words
genuinely spelled with terminal geresh, making the abbreviation vacuous:
3 of 2,485. Acronyms use gershayim, not geresh, and sit entirely outside
the probe.

## Sample read

`random.seed(11); random.sample(sorted(member_rids), 14)` — uniform over
the 2,265 member entries, drawn before reading any of them. 13 of 14
job 1, 1 of 14 job 2, consistent with the population split.

| rid | headword | item | Judgement |
|---|---|---|---|
| H00089 | חֶבְלָא | חֵיבְ׳ | Job 1 — plene חֵיבְלָא truncated (its `plural_form` carries `חִיבְ׳` too) |
| G00550 | זִמְרָא ² | זִי׳ II | Job 1 — זִימְרָא + homograph numeral |
| J00206 | יְוָנִי | יְוָו׳ | Job 1 — and stored twice in the array |
| M00165 | מָגִיסְטֵיר | מָגִסְ׳ | Job 1 — defective מָגִסְטֵיר |
| M00204 | מַגֵּפָה | מַגֵּי׳ | Job 1 |
| M00425 | מוֹהֲבוּתָא | מוֹהֲבִי׳ | Job 1 — definition reads "Targ. Ps. XVI, 5 מוֹהֲבִית *constr.*", so the stub may expand to the construct, not to a headword variant. Expansion genuinely indeterminate from the field alone |
| P00492 | עִיבּוּר ² | עִבּ׳ | Job 1 — sense 1 glosses the abbreviation in prose |
| T01125 | רִתְחָא | רִי׳ | Job 1 |
| T00673 | רֵיעוּתָא | רֵע׳ | Job 1 |
| T00057 | רִבְדָּא | רִי׳ | Job 1 |
| T00065 | רִבּוֹא ² | רִי׳ | Job 1 |
| S02040 | קִרְיָה II | קִירְ׳ | Job 1 |
| U01117 | שִׁכְבָּא | שִׁי׳ | Job 1 |
| U01257 | שְׁלוֹף | שְׁ׳ דּוֹץ | **Job 2** — definition gives "(שְׁלַף, דּוּץ) … a popular name for Cimolia"; the alt is the two-word lemma *sh'lof dots* |

Targeted read of 8 job-2 members (`random.seed(5)` over the 244 phrase
occurrences): P00353 `בֵּי ע׳`, G00014 `בֵּית ז׳`, Q00053 `בֵּית פַּ׳`,
K00392 `אולו כ׳`, S00675 `בֵּית ק׳`, Q01399 `נְהַר פּ׳`, V00853 `בַּר תַּ׳`,
S01585 `עֲלֵי קַ׳`. Every one a compound or toponym; none a spelling of
its headword.

## Letter A

**141 member entries, non-zero.** A is 10.6% of the corpus but 6.2% of
members; the within-A rate is 4.1% against a corpus mean of 7.0%. Low
but not an outlier — per-letter rates run 2.9% (B) to 10.4% (P), and A
sits between B and C. By job: 120 truncation-only, 20 phrase-only, 1
mixed. Both jobs are exercised in the pilot tranche.

## Disposition

**SPLIT into two rows.**

- `abbrev-in-alt-headwords` — **2,035 entries** (2,241 occurrences).
  New description: *alt_headwords item holding a geresh-truncated
  spelling of the headword (רִי׳ for רִיבְדָּא), unusable as a lookup key;
  the elided tail must be recovered by aligning the stub to the
  headword, which the simplest anchor rule resolves for only 65.5%.*
- `phrase-alt-headword-stub` — **236 entries** (244 occurrences).
  Description: *alt_headwords item is a multi-word phrase lemma
  (בֵּית X׳, נְהַר X׳, בַּר X׳) in which the headword token is replaced by
  its initial plus geresh; a compound lemma, not a spelling variant, and
  it expands deterministically by substituting the headword.*

Two scope corrections a transform author would otherwise get wrong from
the current wording:

- "unusable for lookup" is true of the *item*, not the *entry*. Every
  member entry has a full, geresh-free headword, so no entry is
  unreachable; what is lost is the variant or phrase as a search key.
  1,594 member entries have no geresh-free alt at all; 671 do.
- 88 members are also parenthesized, so the stub is wrapped
  (`(אֲגִיח׳)`, and `(אַפִּי׳` with the paren unclosed). A transform must
  unwrap before expanding.

## What would have falsified this

Flipping SPLIT to RE-SCOPE or discard would have required a substantial
subset in which the geresh is **not** an abbreviation mark — acronym
gershayim, a /dʒ/ transliteration modifier, a numeral marker, or a
lexeme genuinely spelled with terminal geresh. Those would be correct,
lookup-usable spellings that a transform would corrupt. All four were
checked: 1 token-internal geresh of 2,485, 3 vacuous stubs, zero
numerals, acronyms entirely on gershayim and already excluded. That
subset is not present under the geresh-only probe — but it *would* be
(16 genuine acronyms) if this row is ever re-measured with a loose
apostrophe class. That is the failure mode to guard against.

Flipping SPLIT back to COUNT CONFIRMED would have required the job-2
phrases turning out to be spellings after all — e.g. `בֵּית ז׳` being a
construct form of its headword. The 8 targeted reads plus U01257 rule
that out: they carry their own definitional content as toponyms and
compounds.

## Overlap with other catalogue rows

- **`parenthesized-alt-headword` (580)** — 88 members in both; that
  row's "sometimes unclosed" caveat applies here too.
- **`multiword-abbrev-mislink` (22)** — its description names exactly
  job 2 ("bet X׳, b'ne X׳, bar X׳") but scoped to *anchor* resolution
  rather than the field. The proposed `phrase-alt-headword-stub` is its
  field-side counterpart; 236 vs 22 suggests the anchor-side row
  measures only the mislinked tail of a much larger population.
- **`alt-headword-collision` (15)** — directly contradicts this row's
  wording: it says two entries "**legitimately** claim the same
  alt_headword abbreviation". The catalogue currently holds both
  "abbreviations in alt_headwords are unusable" and "abbreviations in
  alt_headwords are legitimate link targets". One must give. The
  auditor's reading: the collision row is right that they are *used*,
  this row is right that they are *unusable as literal keys*.
- **`plural-inflection-anchor-escapes-entry` (2,281)** — explicitly
  reads `alt_headwords` as an inflection source, so it consumes these
  items in their abbreviated state.
- **`gender-pair-headword-line-collapse` (22)** — the duplicate-item
  shape. 5 member entries store the same geresh item twice (H00875,
  J00206, N01099, Q01117, +1); whether these are the same 22 was not
  determined.
- **`abbrev-fused-headword` (7)** — the same convention leaking into the
  `headword` field. 62 headwords contain a geresh, so that row covers
  about 11% of the geresh-in-headword population.

## Uncatalogued sibling — the largest gap found

The identical defect exists in **`plural_form`** at **1,131 occurrences
/ 1,007 entries** (522 of those entries are also members of this row):
`חֶבְלָא` → `plural_form: ['חֲבָלִין','חֶבְלִין','חִיבְ׳']`. None of the eight
`plural-form-*` rows covers geresh abbreviation. That population is
currently invisible to the catalogue.
