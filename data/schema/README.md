# Schema — the entry contract

`entry.schema.json` is what every file under `data/entries/` must
satisfy. It is the specification: the documents describe it, this
defines it.

Hand-authored by this project. Read at run time by the pipeline
through `admin/pipeline/paths.ts`, and validated by
`admin/pipeline/schema.test.ts`.

It lives here, beside the data it describes, rather than with the code
that happens to produce that data today — the admin tool and the app
read the same contract.

## Rights

**Public domain**, with everything else under `data/`. The entries are
this schema made concrete, so they share its status; and a schema
describing a public-domain dictionary should be free for anyone
rebuilding it.
