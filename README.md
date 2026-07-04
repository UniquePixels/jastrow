> **⚠️ v2 branch** — this is the v2 overhaul integration branch. The v1
> public app has been removed here (subtractive start); the live site
> is built from `main`. See
> `docs/specs/2026-07-03-v2-overhaul-design.md` for the plan.

# Jastrow Dictionary

A progressive web app for browsing and searching Marcus Jastrow's
*Dictionary of the Targumim, the Talmud Babli and Yerushalmi, and the
Midrashic Literature* (1903).

**Live:** [jastrow.app](https://jastrow.app)

## Features

- **Full-text search** across 32,000+ dictionary entries
- **Works offline** after first visit (PWA with service worker)
- **Cross-referenced abbreviations** — tap any abbreviation for its expansion
- **Page scans** — view the original 1903 print pages from Archive.org
- **Talmudic Sages explorer** — interactive graph of rabbis mentioned in the Talmud
- **Shareable URLs** — link directly to any entry, page, or search

## License

Code is licensed under [MIT](LICENSE).

Dictionary data in `data/` and `data/raw/` is subject to Sefaria's
CC-BY-NC license.

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.
