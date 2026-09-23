# URL routes — future enhancements

> **Superseded 2026-09-21.** Both routes below are folded into the
> [URL names spec](specs/2026-09-21-url-names-design.md): Sefaria
> compatibility is its §3.3, bare-stem landing its §3.1. Kept for the
> measurements it records.

Not built. This records the shape of two routes the slug index makes
cheap, so the decision is not re-derived later. The slug design itself
is [consolidation spec §7](specs/2026-09-13-pipeline-consolidation-design.md).

## 1. Sefaria URL compatibility

**Goal:** swapping `sefaria.org` for `jastrow.app` in a link finds the
word.

Sefaria's canonical entry URL is the headword string verbatim, prefixed
and underscore-joined (measured 2026-09-17):

| URL | Result |
|---|---|
| `sefaria.org/Jastrow,_אָב_I` | the entry. Title "Jastrow, אָב I" |
| `sefaria.org/Jastrow,_אָב` | 404 — the numeral is not optional |
| `sefaria.org/Jastrow,_אב` (unpointed) | 404 |
| `sefaria.org/api/words/אב` | the whole family, across every lexicon |

The comma is percent-encoded in the canonical form
(`/Jastrow%2C_%D7%90%D6%B8%D7%91_I`) and spaces become underscores.

**The data is already ours.** Every source record carries the exact
string Sefaria routes on:

```json
{"_id":{"$oid":"5c4670aa08d98a02694c53b8"},"headword":"אָב I","rid":"A00013"}
```

So the mapping is derivable whenever the route is built. It does **not**
belong in `data/slug-index/entries.jsonl`: §7.1 keeps that a slug → rid
routing index and headwords out of it deliberately, and adding a column
would mean changing the row type, the loader, the seeder, the validator
and 32,512 committed rows together. A Sefaria-headword → rid index is
its own file, built the same way the slug index was.

The work is not the data — it is the routing layer, the
percent-encoding, and deciding the response:

- redirect to our own slug (`/אב-2`), keeping one canonical URL, or
- serve the entry at both names.

A redirect is the safer default: one canonical name per entry is what
§7 buys, and two live names for one page split search-engine signals.

**Watch for:** the headword string is not URL-safe in every entry.
P00224's is `(עוּזְרָד ²` — a leading parenthesis and a superscript
homograph marker. Any such route needs its own encoding pass, not a
naive `encodeURIComponent` of the raw field.

## 2. Bare-stem landing

**Goal:** typing `jastrow.app/אב` reaches the run of entries sharing
that stem instead of nothing.

The data ships with step 7: `data/slug-index/aliases.jsonl`, 4,407 rows,
each bare stem pointing at its family's first member. The alias is
frozen — assigned once, never re-pointed (§7.2).

What the app does with it is open and reversible:

| Behaviour | Note |
|---|---|
| 301 to the first member | what the alias row says today; simplest |
| a disambiguation page listing the family | better for a 13-member family; needs a page design |

**Decide the retired-target case before picking either.** An alias is
frozen and may outlive its target's entry (§7.2): when the `stem-1`
member retires, `/אב` points at a rid with no entry. A plain 301 would
then lead nowhere. Three answers, none chosen — the v2 app is still a
placeholder and has no resolver contract to hold one:

| Answer | Cost |
|---|---|
| redirect to the lowest-numbered *live* member | the bare URL silently changes destination over time |
| show the family page | needs the page design above, and makes it the default rather than the option |
| deliberate 404 | honest, and throws away a URL people may hold |

Whichever is chosen belongs in the resolver contract, not in the index:
the alias row stays exactly as it is.

Either can be chosen later without a slug moving, which is the point of
keeping the alias as data rather than as a rule in the slug assigner.
