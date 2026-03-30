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

## Tech Stack

- Vanilla JavaScript (no framework, no bundler)
- [Web Awesome](https://www.webawesome.com/) component library
- Cloudflare Pages (static hosting)
- IndexedDB for offline data persistence

## Local Development

Serve the root directory with any static HTTP server:

```bash
# Using Python
python3 -m http.server 8000

# Using Bun
bunx serve .

# Using npx
npx serve .
```

Then open `http://localhost:8000` in your browser.

### Admin Tooling

The `data/admin/` directory contains a Bun-based annotation server for
classifying dictionary entries. See `data/admin/` for details.

## Data Attribution

The dictionary data is derived from
[Sefaria's](https://www.sefaria.org/) digitization of Marcus Jastrow's
dictionary. Sefaria's content is licensed under
[CC-BY-NC](https://creativecommons.org/licenses/by-nc/4.0/). The raw
source data is preserved in `data/raw/` under its original license.

Abbreviation data includes contributions from Ezra Brand's abbreviation
dictionary.

## License

Code is licensed under [MIT](LICENSE).

Dictionary data in `data/` and `data/raw/` is subject to Sefaria's
CC-BY-NC license.

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.
