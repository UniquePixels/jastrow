# URL Words — Design Spec

- **Date:** 2026-11-13
- **Status:** Draft, from the maintainer's decisions of 2026-11-09 and
  2026-11-13. §2 is the maintainer's; every other choice is marked as
  Claude's call.
- **Ruling:** `11-13 url words` in [`docs/decisions.md`](../decisions.md).
- **Supersedes:** the naming half of the 2026-09-21
  [URL names spec](../archive/specs/2026-09-21-url-names-design.md)
  (U2, U4, U5, U6 and its §4–§5, §7, §9), ruling
  `10-06 hidden superscript`, `HW-xref-collision`, and the URL clause of
  `11-07 one comparison rule`.
- **Does not change:** rid identity and order, `sefariaHeadword` (U3),
  everything in the entry file (U7), no sense suffix on a route (U8),
  what the reader sees on the headword line.

## 1. Why

The 2026-09-21 design named an entry by its full pointed headword, as
Sefaria does (`/אָב_I`, `/אָב²_II`). That needed three things beside the
headword: the superscript disambiguators Sefaria adds to tell apart
lines print sets alike (810 primary headwords carry one today), our own
added where a correction made two names collide (C00300, G00675,
A00055), and a list of former names to redirect from once a corrected
headword renamed a published entry. Each correction risked a collision,
and every published rename would have cost a redirect kept forever.

A URL with vowel points in it is also not one anybody types or reads.
The maintainer wants a short, plain-letter permalink that copies and
reads cleanly in the address bar (tested 2026-11-09 with a page of
sample links: the address bar and a copied link look right; only the
hover status bar shows percent-encoding).

So the URL becomes the headword's letters plus a number when several
entries share them:

```
jastrow.app/אמר      first entry spelled אמר, in rid order
jastrow.app/אמר-2    second
jastrow.app/אמר-3    third
```

## 2. Rulings (maintainer, 2026-11-09 and 2026-11-13)

| # | Ruling |
|---|---|
| W1 | An entry's **URL word** is its primary headword (`headwords[0].text`) reduced to its Hebrew letters, keeping the maqaf (`־`), the geresh (`׳`) and the gershayim (`״`). Vowel points, other marks, the reconstructed `*`, homograph numerals and superscript disambiguators are all dropped: the star and the numerals are display only now |
| W2 | Entries with the same URL word are **numbered 1, 2, 3 … in rid order, with no gaps**. Number 1 has no suffix (`/אמר`); the rest are `/<word>-<n>` |
| W3 | **The URL follows the headword.** When a correction changes a primary headword's URL word, its URL changes, and the entries after it in its old and new groups renumber. Old URLs are not kept or redirected. Corrections are rare after the pre-work, and not keeping a second copy of the name is the simplification |
| W4 | **Nothing is stored.** The URL word and the number are computed by compile from the entries; no entry file holds either |
| W5 | **Superscript disambiguators are removed** from entry data. They existed only to keep names unique, and W2 does that now |
| W6 | **`formerNames` is removed** from the schema, and with it the redirect from a former name (U6) |

## 3. Routes

Resolved in this order; the first match wins. The app does the
resolving; this design only fixes what each route means.

| Order | Route | Example | Resolves by |
|---|---|---|---|
| 1 | Sefaria URL | `/Jastrow,_אָב_I` | `sefariaHeadword` (U3), unchanged → redirect to the entry's URL |
| 2 | rid permalink | `/A02060` | rid → redirect to the entry's URL |
| 3 | URL word | `/אמר`, `/אמר-2` | the word and number of §4 |

A path that is Hebrew but not already a URL word (typed with vowel
points, say) is reduced by the same function as §4's word first, then
resolved as route 3. That is the old bare-letter route (U1, U4), folded
into this one: a bare word lands on number 1, the first entry in rid
order. *Claude's call:* a number past the end of its group (`/אמר-9`
where the group has 5) is not found, not sent to number 1, since a
guessed number that lands on the wrong entry is worse than a miss.

## 4. The URL word and number

**Word** (W1). From `headwords[0].text`, in NFC:

- keep Hebrew letters U+05D0–U+05EA, final forms as written;
- keep the maqaf U+05BE, the geresh U+05F3 and the gershayim U+05F4
  (maintainer, 2026-11-13: 68 primary headwords such as `עי״ן` and
  `עכ״ום` keep their own URL rather than sharing the plain spelling's);
- turn each run of whitespace inside the headword into `_`, as the
  current `namePath` and Sefaria both do (six primary headwords have a
  space: P00137, K00107, C00517, A00436, A02002, A01881). *Claude's
  call*;
- drop everything else.

**Number** (W2). Group every entry by its word; within a group, order by
rid; the first is 1. Measured over the 32,512 entries at `69048d52c`:
25,316 words, 7,196 entries with a number of 2 or more, the largest group `ערב` with 13. No primary
headword reduces to an empty word.

**Path.** Number 1 is `/<word>`; any other is `/<word>-<n>`. The `-` is
ASCII, which no word contains (the maqaf is a different character), so
a word and a suffix cannot be confused. Percent-encoding is the
browser's and the server's, after this.

## 5. What changes in the code and data

Names below are proposals, named for their job. The builder may rename
any of them for a better fit with the code they sit beside.

**Added** (*Claude's call* on placement): in `admin/lib/`, beside the
comparison form, since compile, the app's resolver and any check all
need them and `app/` imports nothing under `admin/` (it gets a copy at
compile, or compile writes the paths):

- `toUrlWord(text)`: §4's word, for a headword or a typed path alike.
- `buildEntryPaths(entries)`: every entry's path, from §4's word and
  number, as a map rid → path.

**Removed:**

- `disambiguator` on a form: the schema field, the 810 values in
  `data/entries/`, the parser's reading of the superscript
  (`readSuperscript` in `admin/entry/headwords.ts`), and `intToSup`.
  Sefaria's superscript stays in `sefariaHeadword` (`א ²` on A00001),
  so route 1 still matches.
- `formerNames` in the schema (absent from every entry today), and its
  read in `plainFields` (`admin/entry/validate.ts`).
- `admin/entry/names.ts` (`deriveFormName`, `getPrimaryName`,
  `namePath`, `findNameProblems`). Its callers: `checkNames` in
  `admin/entry/validate.ts` (`bun data:validate`), gate 7 `checkNames`
  in `admin/pipeline/import/gates.ts`, and five rows in
  `admin/pipeline/report/headword-issues.ts`.
- From gate 7, only the **addressable** mark (unique name, non-empty
  name). Its other mark, `sefariaHeadword` byte for byte against the
  source, stays: route 1 depends on it. Uniqueness now holds by
  construction (W2). The empty-word case measures 0; *Claude's call:*
  keep a check that no entry's URL word is empty, in `data:validate`
  and the import alike.

**Patches that add a superscript.** P000955 (A00055) loses its `²` and
keeps its real change, the reorder; its Sefaria appendix row then
shows the plain reorder. P000307 (G00675) and P000927 (C00300) add a
superscript and nothing else, so without it they change nothing, and
the import refuses a reform that changes nothing. **Both records are
deleted** (maintainer, 2026-11-13), from
`admin/pipeline/patch/records/reviewed/patches.jsonl`, and so are their
manifest records (G00675, C00300), each of which lists only that
patch. G00675 and G00674 (`זָרָה`), and C00300 and C00299 (`גּוּד`
since P000928), then share a URL word and are numbered by W2. The
`headword-name-collision` class in
`admin/pipeline/report/sefaria-evidence.ts` then has no members and
goes with them.

**Changed:** the places that read a disambiguator today must stop:

- gate 2's notation check (`writtenNotation` / `notationOf` in
  `admin/pipeline/import/gates.ts`): Sefaria's superscripts are left
  out of the count on both sides, the source line and the forms, as
  commas already are;
- `duplicateForms` in `admin/entry/headwords.ts`, which keys a line's
  repeated forms on the disambiguator;
- `numbersOnce` in `admin/pipeline/report/headword-issues.ts`, which
  treats two equal numerals as told apart by a superscript (six entries:
  A00015, B00383, B00779, B01201, C00774, O01369). *Claude's call:* it
  reads the superscript from `sefariaHeadword` instead, so the report's
  findings do not change. It is a report about Sefaria's line, and
  `sefariaHeadword` is that line;
- the report's `name` column: *Claude's call,* it shows the entry's URL
  path from `buildEntryPaths`;
- the reorder rule in `admin/pipeline/report/sefaria-change.ts`
  (`DISAMBIGUATOR_TAIL`), whose only user is P000955;
- `schemaVersion`: *Claude's call,* it goes from 2 to 3, since two
  fields leave a closed schema; every entry file is rewritten for it;
- `checkMarkers` rule 3 (no superscript in `display`) stays: the parser
  must still keep Sefaria's superscript out of `display`.

**Resolving a typed path** (*Claude's call*): the resolver first splits
off a trailing `-<digits>` and turns `_` back into a space, then
reduces what is left with `toUrlWord`. So `toUrlWord` is one function
for headwords and typed words, and a spaced headword resolves by its
own URL.

**Docs:** `docs/glossary.md`, `admin/entry/README.md`,
`admin/pipeline/DESIGN.md`, and the rulings that this replaces (struck
in `docs/decisions.md` by the `11-13 url words` row).

## 6. Goals, non-goals, anti-goals

**Goals:** a short plain-letter permalink for every entry; less code and
fewer checks; no data that has to be kept in step with the headword.

**Non-goals:** a permanent URL. A corrected headword moves its URL and
can move its neighbours' (W3). Redirects for changed URLs. Routes for
senses (U8). Writing compile or the app: this design fixes what they
compute and resolve; the plan covers the data and admin side only.

**Anti-goals:** a URL that points at a different entry than its word
says, with no sign of it. Storing a number or word that can drift from
the headword. A second spelling of the URL anywhere outside the one
function.

## 7. Left to the builder

- Exact function and file names, within `11-07`'s rule that one job has
  one function.
- Where the empty-word check lives.
- How compile hands the paths to the app.
- The order of the removal commits, as long as `bun qa`, the import's
  gates and `bun data:validate` are green after each.
