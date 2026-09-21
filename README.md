# Jastrow Dictionary

Marcus Jastrow's *Dictionary of the Targumim, the Talmud Babli and
Yerushalmi, and the Midrashic Literature* (1903), as data you can
browse.

**Live:** [jastrow.app](https://jastrow.app) — served from `main`.

## This branch

`v2` is the overhaul. It began by removing the v1 app, and what exists
here today is the data pipeline: the auditable path from the Sefaria
source to the 32,512 entry files under `data/entries/`.

**Neither the public app nor the admin tool has been written for v2
yet.** `app/` is a placeholder so the Cloudflare build has something to
deploy.

- [`admin/pipeline/README.md`](admin/pipeline/README.md) — the pipeline,
  stage by stage, and what each directory under `data/` holds
- [`docs/glossary.md`](docs/glossary.md) — the words this repo uses for
  its own parts, and which ones are retired
- [`docs/specs/`](docs/specs/) — the design specs; the overhaul plan is
  [2026-07-03](docs/specs/2026-07-03-v2-overhaul-design.md)

## License

Code is licensed under [MIT](LICENSE).

Dictionary data under `data/` derives from Sefaria's Jastrow text and
is subject to Sefaria's CC-BY-NC license.

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md). Commits need a DCO sign-off
(`git commit -s`).
