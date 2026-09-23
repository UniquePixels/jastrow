# Jastrow Dictionary

Marcus Jastrow's *Dictionary of the Targumim, the Talmud Babli and
Yerushalmi, and the Midrashic Literature* (1903), as data you can
browse.

**Live:** [jastrow.app](https://jastrow.app) — served from `main`.

## What is here

This branch (`v2`) is the overhaul. It began by removing the v1 app,
and one module has been written since: the **import pipeline** under
[`admin/pipeline/`](admin/pipeline/README.md). That is the auditable
path from Sefaria's export to the 32,512 entry files under
`data/entries/` — it reads data, writes data in a schema it does not
own, and knows nothing about the rest of the repo.

The **web app** and the **admin tool** are not written yet. When they
are, they arrive as siblings of the pipeline: separate modules over
the same entry data, not layers on top of it.

`app/index.html` is a deploy stub — one static page, so the Cloudflare
build has something to publish. It is not a piece of the app to come.

## The documents

| Document | What it is for |
|---|---|
| this file | what the repo is, and the licence |
| [`admin/pipeline/README.md`](admin/pipeline/README.md) | how to run the pipeline: inputs, outputs, commands, gates |
| [`admin/pipeline/DESIGN.md`](admin/pipeline/DESIGN.md) | its design as it stands today: the entry model, the rules, what each gate proves, and what the pipeline refuses to do |
| [`docs/decisions.md`](docs/decisions.md) | every ruling that still binds, with its date and what it drops |
| [`docs/glossary.md`](docs/glossary.md) | the words this repo uses for its own parts, and which ones are retired |
| [`docs/ideas.md`](docs/ideas.md) | things worth considering later; nothing in it is committed to |

A dated design spec is not a live document. The ones written during
the overhaul, and the research behind them, are kept unchanged under
[`docs/archive/`](docs/archive/): a record of what was intended on a
date, not a description of the code today. Where one of them still
answers a question, the answer belongs in `DESIGN.md` instead.

## Licence

**Everything under `data/` is public domain. Everything else is MIT**
(see [LICENSE](LICENSE)).

Jastrow's *Dictionary of the Targumim…* (1903) is out of copyright.
Nothing below compels attribution; it is owed regardless, and each
directory under `data/` carries a README naming its source.

| What | Credit |
|---|---|
| The dictionary text | digitized by [Sefaria](https://www.sefaria.org), who declare their `Jastrow` text index public domain — the export this project reads (`lexicon_entry`) declares no licence of its own |
| The page scans | scanned 2009 by the University of Toronto's Robarts Library, sponsored by the Ontario Council of University Libraries, hosted by the Internet Archive |

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md). Commits need a DCO sign-off
(`git commit -s`).
