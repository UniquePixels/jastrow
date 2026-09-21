# URL Names — Design Spec

- **Date:** 2026-09-21
- **Status:** Draft from the 2026-09-21 session (maintainer + Claude).
  Rulings in §2 are the maintainer's; everything else is the plan to
  make them true.
- **Supersedes:** [pipeline consolidation](2026-09-13-pipeline-consolidation-design.md)
  §7 (slugs) and R10 as worded; the slug bullet of
  [data-architecture](2026-07-08-v2-data-architecture-design.md) D12
  (§4); [migrate](2026-09-06-migrate-design.md) §2.4; and
  [url-routes.md](../v2/url-routes.md), whose two routes are folded in
  here.
- **Does not change:** rid identity, ordering (D13), the page index,
  rid permalinks (`/A00015`).

## 1. Why

Slugs were designed for one job: type a word into the address bar and
get there, with a tidy URL bar as a bonus. Sefaria compatibility came
later. To make typing easy, the slug strips the vowel points, and
stripping makes different words collide, so we number them ourselves:
4,412 families, 11,640 numbered entries (`אב-1` … `אב-5`), an alias
file, and a freeze switch.

That numbering is ours alone. It matches neither Jastrow's print (Roman
numerals count per *pointed* form) nor Sefaria's URLs. It also ties a
URL to headword work that is not finished: `headword-unparsed` blocks
publication today because "the headword makes the slug, and slugs
freeze at publication".

Nobody will type vowel points or disambiguators into an address bar. A
reader who types bare letters expects to reach the first word spelled
that way. Sefaria already gives every entry a unique, stable name: its
headword. This design uses that name, keeps the bare-letter shortcut,
and lets names change over time without breaking a link.

## 2. Rulings (maintainer, 2026-09-21)

| # | Ruling |
|---|---|
| U1 | Three routes: bare letters (§3.1), our name (§3.2), a Sefaria URL (§3.3) |
| U2 | An entry's name is **our current headword, shaped the way Sefaria shapes its own**. No numbering of our own |
| U3 | `sefariaHeadword` is stored on **every** entry, verbatim from the source. Only import writes it |
| U4 | If an entry's exact name is bare letters, that entry owns the bare URL. The "first entry" rule applies only where no exact name exists |
| U5 | The reconstructed-form `*` is part of the name, as it is in Sefaria's |
| U6 | **Names may change; a published name never points at a different entry.** A corrected headword gets a new name, and the old one redirects. This replaces R10's "a published slug never changes" |
| U7 | Everything lives in the entry file. No separate names file: a hand or AI edit to one entry must not have to touch a second file to stay in sync |
| U8 | A sense or binyan suffix on a route is an app enhancement, not part of this design. If the data does not support it, it is not built |

## 3. Routes

Resolved in this order; the first match wins.

| Order | Route | Example | Resolves by |
|---|---|---|---|
| 1 | Sefaria URL (§3.3) | `/Jastrow,_אָב_I` | `sefariaHeadword` → redirect to our name |
| 2 | rid permalink (D12) | `/A00015` | rid → redirect to our name |
| 3 | Our name (§3.2) | `/אָב_I` | current name, then former names (redirect) |
| 4 | Bare letters (§3.1) | `/אב` | exact bare name (U4), else first entry in print order |

Our name (step 3) is tried before bare letters (step 4). That order is
U4: `/אבק` is A00192's exact name, so it goes to A00192 and not to
A00188, the first entry spelled אבק. 203 URLs fall under this rule
(§6).

### 3.1 Bare letters

The request is reduced to consonants: points removed, `_` kept as the
word separator. It lands on the first entry, in print (rid) order, whose
headword reduces to the same consonants. This is a convenience and not a
promise: which entry is first can change as headwords are corrected, and
that is accepted.

Open: whether alternate headwords count toward the match (§8).

### 3.2 Our name — the canonical URL

The address bar and the Share action always show this form. Former
names redirect to it.

### 3.3 Sefaria URL

`sefaria.org` → `jastrow.app` finds the word. The route accepts the
`Jastrow,_` prefix in plain or percent-encoded form (`Jastrow%2C_`),
drops a trailing `.N` sense suffix (U8), and redirects to our name.

Every route reduces the request to one key before lookup, and the route
map is keyed the same way:

1. percent-decode the path;
2. `_` → space;
3. NFC.

`sefariaHeadword` is stored verbatim, with spaces, so its route-map key
is step 3 alone. Without step 2, all 3,695 Sefaria headwords that
contain a space would miss.

Sefaria's URL is its headword verbatim: spaces become `_`, and anything
URL-hostile is percent-encoded. B00825's `*(?)בַּלְוָוטִי` is served
by Sefaria with the `?` as `%3F` (HTTP 200, 2026-09-21), so this route
must decode before it looks up.

## 4. The name

Built from the headword form object:

```
word = text with ( ) ? , removed, runs of whitespace → one space, trimmed
name = ("*" if reconstructed) + word + (" " + Roman if homograph) + superscript(disambiguator)
url  = name with spaces → "_", then percent-encoded as needed
```

Uniqueness (§5.2) and the route map both use `name`, after this
normalization.

- **Notation that is not part of the word is dropped** from the name
  only: `(`, `)`, `?`, `,`. The headword and its display keep them —
  B00825 still displays `*(?)בַּלְוָוטִי`; its name is `*בַּלְוָוטִי`.
  Stripping creates no collisions (0, measured on the formula above).
- **Uniqueness is required.** A correction that makes two current names
  equal fails the gate (§5.2), and the editor adds a disambiguator —
  the same tool Sefaria uses.
- **Lookup compares in NFC** on both sides. Stored text is never
  rewritten. The data is clean (0 non-NFC headwords); this covers a URL
  typed or pasted from elsewhere with its marks in a different order.
- `=` (A01175, A01345) stays until the headword work resolves those two
  cross-references.

## 5. Data

### 5.1 Entry fields

| Field | Content | Written by |
|---|---|---|
| `slug` | **removed** | — |
| `sefariaHeadword` | Sefaria's `headword`, byte for byte, on all 32,512 entries | import only; the admin tool and hand edits never touch it |
| `formerNames` | names this entry has published under and no longer holds; absent until publication | the admin tool on a headword edit; by hand when the gate asks for it |

The current name is not stored. It is computed from `headword`, so it
cannot drift from it.

### 5.2 Gates

| Gate | Where | Catches |
|---|---|---|
| Current names unique (NFC) | `bun qa` | a correction that collides with another entry's name |
| No current name equals another entry's former name | `bun qa` | reusing a name for a different word (U6) |
| Each former name appears on exactly one entry | `bun qa` | two entries claiming one old name, which would leave the route map with an ambiguous key |
| `sefariaHeadword` unique | `bun qa` | a hand edit that duplicates one |
| `sefariaHeadword` equals the source snapshot | import | a hand edit to a field that tracks Sefaria. Import-only because per-PR CI does not read `data/source/` (R9) |
| Every published name still resolves to the same rid | `bun qa`, after publication | a headword edit that forgot its `formerNames` entry; the failure names the exact line to add |

The last gate needs a record of what was published. That record is the
**published-names ledger**, a list of `{name, rid}` written only by the
release step and never by hand or by the admin tool. It is not a second
copy to keep in sync; it is the evidence the gate checks against. It
does not exist before publication.

### 5.3 The app

Compile builds the route map from entry data: current names, former
names, `sefariaHeadword`, and the bare-letter index (first rid per
consonant key, with U4 applied). This is the "Route map" artifact
data-architecture §3 already lists. The app never reads `data/`.

## 6. Evidence (measured 2026-09-21)

| Measured | Result |
|---|---|
| Sefaria headwords | 32,512; 0 duplicates; 0 non-NFC. The headword is Sefaria's key — there is no slug field in the export |
| Sefaria's internal links | `href="/Jastrow,_חָבַב I.1"`: headword verbatim, then `.N` |
| `.N` shapes in `data-ref` | none 54,738; `headword N` 17,463; `headword <Roman> N` 1,114. One level only — what `N` counts inside a binyan section is unmeasured (U8) |
| Our current names, `*` excluded | 23 collisions, every one a `*` / plain pair (`*טְפֵי` / `טְפֵי`) |
| Our current names, `*` included (U5) | **0 collisions** |
| Bare-letter names that are an exact headword but not the first entry with those letters | 203 (U4) |
| Sefaria headwords with no points | 4,077 |
| Notation still in our `headword.text` | `I` 23, `,` 12, `(` 10, `)` 4, `*` 2, `=` 2, `?` 1, `V` 1, `²` 1. The Roman-numeral residue is the 10 H1 rows patched in #114 and not yet written |
| Headwords with spaces | 3,695 in Sefaria's (most before a Roman numeral); 22 in our `text` |

**Rid order is print order, not a sort.** Sefaria's rid sequence is not
alphabetical by Sefaria's own headwords: 221 adjacent pairs sort
backwards. A00021 `אַכְאָבִית` (`כ` misread for `ב`) sits where the
*correct* spelling belongs. So a spelling correction does not move an
entry: the rid carries print position, and D13 already takes order from
rids, never from headwords. The page index agrees: print position never
goes backwards in rid order except at the 14 letter boundaries, where
the page splits into an upper and a lower two-column block that
`column: a | b` cannot express. The one that looked mid-letter
(G00739 415b → G00740 415a) is the ז/ח boundary; G00740 and G00741 are
probably upper-block 415b, both at medium confidence. The page index is
known to be imperfect and is corrected as issues surface; it is not
worked on for its own sake.

## 7. What goes away, what stays

| Goes away | Stays, reshaped |
|---|---|
| `slug` in 32,512 entry files | the name, computed from `headword` |
| `data/slug-index/` (`entries.jsonl`, `aliases.jsonl`) | the published-names ledger, from publication only |
| stem numbering and `slugStem` notation stripping (`migrate/slug.ts`) | a consonant key for the bare route, computed at compile |
| `migrate/slug-index.ts`, `migrate/seed-slug-index.ts`, `SLUGS_FROZEN` | the never-reassign rule (U6), as gates (§5.2) |
| review rows `slug-changed`, `slug-new`, `slug-alias-new`, `slug-bare-held`, `slug-frozen-stem-drift`, `slug-unsafe` | a `name-collision` gate failure |
| the `slugs` gate (32,512 unique, no bare owner) | a `names` gate (§5.2) |

## 8. Open items

| Item | Note |
|---|---|
| `headword-unparsed` still `blocks`? | Its stated reason — "the headword makes the slug, and slugs freeze" — no longer holds, because a name can change after publication (U6). Re-rule on what the reader sees |
| Alternate headwords in the bare route | Does `/אבא` reach an entry whose *alternate* is אבא, if no headword is? |
| Sefaria renames a headword | Does route 3 keep the old Sefaria name? Default: no — Sefaria itself stops serving it |
| Sefaria renumbers rids | Rid is our identity key; a renumbered export would misattach every edit. The update run (consolidation §10) needs a check that refuses on a bulk rid → headword shift. Belongs in that spec |
| `headwordRoundTrip` gate | Regenerates Sefaria's headword from the form object. With `sefariaHeadword` stored, decide whether it stays as a decomposition check or retires |
| G00740, G00741 page placement | Print check when convenient; not scheduled |

## 9. Implementation outline

Not a plan; the order the work falls in.

1. Import writes `sefariaHeadword` on every entry and drops `slug`.
   Schema, validator and the `slugs` gate change together.
2. Name derivation (§4) and the `bun qa` gates of §5.2 that apply
   before publication.
3. Retire `data/slug-index/`, `slug.ts`, `slug-index.ts`,
   `seed-slug-index.ts` and the slug review rows. Amend the glossary.
4. Admin tool: a headword edit shows the name change, and after
   publication appends `formerNames`.
5. Compile's route map (§5.3), with the app routes.
6. At publication: the release step writes the ledger, and the last
   gate of §5.2 switches on.
