# Security Policy

## Reporting a Vulnerability

If you discover a security vulnerability in this project, please report
it responsibly:

1. **Do not** open a public issue
2. Email **brian@uniquepixels.xyz** with details
3. Include steps to reproduce if possible

You should receive a response within 48 hours.

## Scope

There is no server-side code. The `v2` branch holds the data pipeline
under `admin/` — Bun tooling that runs on a maintainer's machine, never
deployed — the entry data under `data/`, and a placeholder `app/`. The
public app and the admin tool have not been written for v2 yet.

Security concerns are primarily:

- Supply chain: the pipeline's dependencies and the pinned GitHub
  Actions in `.github/workflows/`
- Integrity of the Sefaria snapshot in `data/source/` and of the entry
  data derived from it

The live site at [jastrow.app](https://jastrow.app) is built from
`main`, whose browser app has its own concerns (XSS in rendered
dictionary content, CSP, service worker cache, CDN SRI).
