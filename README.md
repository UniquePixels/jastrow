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
editing dictionary entries, abbreviations, sages, and annotations.
It also hosts the **Rabbinic Time PDF builder**. It is local-only and
never deployed.

**One-time setup** — a single install at the repo root pulls in every
dependency (admin server, Biome, validators):

```bash
bun install
```

This install stays light: it does **not** download Chromium. Only run
the PDF builder's extra setup if you intend to rebuild the Rabbinic Time
PDF (installs Playwright + Chromium and stages bundled assets):

```bash
bun run setup:pdf
```

**Start the server:**

```bash
bun run admin
```

Then open `http://localhost:3333`. Set `PORT=…` to override the port.

#### Building the Rabbinic Time PDF

The site's Rabbinic Time dialog links a downloadable PDF at
[`assets/pdfs/rabbinic-time.pdf`](assets/pdfs/rabbinic-time.pdf).
Rebuild it whenever you edit `assets/scripts/rabbinic-time.js` or
`assets/styles/rabbinic-time.css`:

- **Admin UI:** open the **Builds** tab and click **Build PDF**.
- **CLI (admin server running):**
  `curl -X POST http://localhost:3333/api/builds/rabbinic-time-pdf`
- **CLI (no server):**
  `bun data/admin/pdf-builds/render-rabbinic-time.ts`

All three paths write to `assets/pdfs/rabbinic-time.pdf`. The print
HTML at `data/admin/pdf-builds/rabbinic-time.html` loads the live
site's CSS/JS via relative path, so there is no copy step or drift.

Commit the regenerated `assets/pdfs/rabbinic-time.pdf` so the deploy
ships the updated download.

**Edit-entry shortcut on the public site:**

When the `jastrow:admin` localStorage flag is set, each entry renders
a small pencil icon next to its permalink that opens that entry in
the local admin tool (via `#rid:<RID>`). Toggle in the browser console:

```js
localStorage.setItem('jastrow:admin', '1'); // enable
localStorage.removeItem('jastrow:admin');   // disable
```

The flag is per-browser; the shortcut expects the admin server to be
running on `localhost:3333` — if it isn't, the link simply fails to
load.

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
