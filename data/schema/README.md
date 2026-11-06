# Schema — the entry contract

`entry.schema.json` is what every file under `data/entries/` must
satisfy.

**Generated, never edited by hand.** The source is
`admin/entry/schema.ts` (ruling `11-05 schema source`); `bun
schema:build` writes this file from it, and `bun schema:check`, run
by `bun qa` and CI, fails when the committed copy is stale. It is
committed so an editor has it without a build: `.vscode/settings.json`
maps `data/entries/` to it for IntelliSense, with each field's
`description` as its hover text. `admin/entry/schema.test.ts` tests
what it accepts and refuses.

It lives here, beside the data it describes, rather than with the code
that happens to produce that data today — the admin tool and the app
read the same contract.

## Rights

**Public domain**, with everything else under `data/`. The entries are
this schema made concrete, so they share its status; and a schema
describing a public-domain dictionary should be free for anyone
rebuilding it.
