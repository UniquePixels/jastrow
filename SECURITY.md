# Security Policy

## Reporting a Vulnerability

If you discover a security vulnerability in this project, please report
it responsibly:

1. **Do not** open a public issue
2. Email **brian@uniquepixels.xyz** with details
3. Include steps to reproduce if possible

You should receive a response within 48 hours.

## Scope

This is a static site PWA with no server-side code (the `data/admin/`
tooling runs locally only). Security concerns are primarily:

- Cross-site scripting (XSS) via dictionary content rendering
- Content Security Policy effectiveness
- Service worker cache integrity
- Third-party CDN dependency integrity (SRI hashes)
