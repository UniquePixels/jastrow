# Schema — the entry contract

`entry.schema.json` is what every file under `data/entries/` must
satisfy. It is the specification: the documents describe it, this
defines it.

Hand-authored by this project. Read at run time by the entry
contract through `admin/entry/paths.ts` (the pipeline's `paths.ts`
re-exports it). `admin/entry/schema.test.ts` tests what it accepts
and refuses; `admin/entry/schema-parity.test.ts` holds every object
here to the `Entry` type in `admin/entry/types.ts`: same keys, same
required keys, same literal values. A change to one is a failing
`bun qa` until the other follows.

It lives here, beside the data it describes, rather than with the code
that happens to produce that data today — the admin tool and the app
read the same contract.

## Rights

**Public domain**, with everything else under `data/`. The entries are
this schema made concrete, so they share its status; and a schema
describing a public-domain dictionary should be free for anyone
rebuilding it.
