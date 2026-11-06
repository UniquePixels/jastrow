# Canonical fetch — design

2026-11-05. Ruling `11-05 canonical fetch` in
[`../decisions.md`](../decisions.md). Approved in conversation the
same day; this file is the written record for review.

## Goal

A fetch is a fetch. `bun data:fetch` writes Sefaria's Jastrow data in
a form fixed by the data alone, and nothing after it depends on how
MongoDB happened to store that data.

Success is three properties:

1. **Same data, same bytes.** Fetching an unchanged export writes
   byte-identical `jastrow-dictionary.jsonl` and `lexicons.json`, so
   `git diff data/sources/sefaria/` shows only real Sefaria changes,
   one line per changed entry.
2. **No reader depends on line order.** Every result of the import and
   of `bun data:sefaria` is a function of the entries keyed by `rid`,
   not of their position in the file.
3. **A `rid` names one entry.** A source holding the same `rid` twice
   is refused, not quietly resolved first-wins or last-wins.

Out of scope: the update run (R11), anything about patches, and the
fetch knowing about anything downstream of it.

## What is tied to Mongo today

Measured on `v2` at `0e007868b`:

- `admin/pipeline/fetch.ts` writes entries in **dump order**, with
  each document's keys in **BSON field order**
  (`EJSON.stringify(doc, { relaxed: true })`). `lexicons.json` is the
  same, pretty-printed.
- **The dump order is not `rid` order.** It runs in interleaved
  blocks of roughly 64–128 entries (line 5,321 goes `D01030` →
  `C00144`): 60 breaks, and 20,923 of the 32,512 lines are not where
  a `rid` sort puts them. There are no duplicate `rid`s today.
- `familyRun` (`admin/pipeline/report/sefaria-evidence.ts:354`) takes
  "how far apart two entries stand" from their **line position**
  (`indexSource`, `:284`) and cuts a family wherever members are more
  than `FAMILY_GAP = 5` apart. With the interleaving above, a "nearby"
  entry can be from another letter. Its result decides whether a
  cite-retarget patch goes into the Sefaria appendix or into
  `sefaria-review.csv`.
- Nothing checks that `rid`s are unique. `readSourceEntries`
  (`body/source.ts:64`) and `readRaw` (`sefaria.ts:32`) both accept a
  duplicate, and their consumers keep the first or the last one.

Order effects that are cosmetic only (same rows, different order or
samples): the import's report rows, the blessing's 40 sample entries,
and a few error messages. They become stable once the file is sorted,
and are not changed by this design.

## Design

### 1. Fetch writes a canonical file

In `fetch.ts`:

- Collect the Jastrow entries, then **sort them by `rid`** in
  code-unit order (the order `locator.ts` and `cite-numeral.ts`
  already use) before writing.
- Write each document with its **object keys sorted, recursively**.
  Arrays keep their order, because array order is data (sense order,
  ref order). EJSON wrappers such as `{"$oid": …}` are single-key and
  unaffected.
- `lexicons.json`: the same key sort; its records sorted by `name`.
- `manifest.json` is unchanged. Its `fetchedAt` and HTTP fields
  change on every fetch by design; it is the record of the fetch, not
  source.
- The fetch stays ignorant of everything downstream. The canonical
  writer is a small pure function, `canonicalJson(value)`, so it can
  be unit-tested without a dump.

Memory: the entries are held in memory once to sort them (about 30 MB
of text), where today they are streamed. That is acceptable for 32,512
entries.

`data/sources/sefaria/README.md` changes "Sefaria's export,
unmodified" to say the data is Sefaria's, unmodified, written in a
canonical order (entries by `rid`, keys sorted).

### 2. `familyRun` reads `rid` order

`indexSource` stops recording line position. `familyRun` orders a
family by `rid` and measures the gap in `rid` order: the number of
entries between two members in the whole source sorted by `rid`, so
`FAMILY_GAP = 5` keeps its meaning, "five entries apart in the
dictionary." Since `rid` order is print order (the page index relies
on it), this is what the 10-05 homograph-sequence ruling meant by
"nearby."

This is a correction, not a refactor. Today's file position mixes
letters, so the appendix may change. **The change is measured before
anything is committed, and any appendix or review-file delta goes to
the maintainer as its own ADD / MOVE / REMOVE decision**; it is not
accepted by default.

### 3. Readers refuse a duplicate `rid`

`readSourceEntries` and `readRaw` each keep a set of the `rid`s seen
and throw on a repeat, naming the `rid` and both line numbers. The
check lives in the readers, not the fetch, so it also guards a
hand-edited source.

### Order of work

1. Duplicate-`rid` refusal in both readers (no data change).
2. `familyRun` on `rid` order; run `bun data:sefaria`, diff the
   appendix and review files against `v2`, and stop for the
   maintainer if anything moved.
3. Canonical writer in `fetch.ts`; regenerate the source with
   `bun data:fetch --cached` from the cached dump.
4. Prove the rewrite changed order only: the sorted entries parsed
   from the old and new files are deep-equal, entry by entry. Then a
   full dry import, `bun data:validate` and `bun data:sefaria`; the
   generated docs may reorder rows but must hold the same rows.

Each is its own commit.

## Testing

- `canonicalJson`: key order sorted recursively, arrays kept, and the
  same documents in shuffled order give byte-identical output.
- Readers: a fixture with a duplicate `rid` is refused, naming the
  `rid`.
- `familyRun`: a family whose members are adjacent in `rid` order but
  far apart in file order forms one run, and the reverse case splits.
- Corpus: the deep-equal proof in step 4, run once by hand; it is not
  a test that reads `data/sources/sefaria/` in the unit tier.

## Risks

- **The first canonical fetch rewrites every line** (the key order
  changes). That is a one-time large diff of the source. Step 4's
  deep-equal proof is the review of it, since nobody can read 32,512
  changed lines.
- **The appendix delta** in step 2 is unknown until measured.
- **The cached dump may not be the committed snapshot.**
  `.cache/sefaria/` holds a dump fetched 2026-11-04; the committed
  source is documented as the 2026-07-04 snapshot. If step 4's
  deep-equal fails, the cache carries real Sefaria changes. Then the
  canonical source is written **from the committed file instead**
  (parse, sort, rewrite: same data, new order), and a real re-fetch
  stays a separate decision for the maintainer. The source never
  changes data in this work.
