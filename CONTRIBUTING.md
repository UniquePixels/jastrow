# Contributing to Jastrow Dictionary

Thank you for your interest in contributing!

## Getting Started

### Size policy for data PRs

Each entry is one dense line of scholarship, so review is careful and
slow. To keep PRs reviewable:

- **One topic per PR.** Aim for **≤ ~25–50 changed entries**.
- For larger corrections, **open an issue first** to coordinate.
- CI fails a `data/**` PR that changes **more than 300 lines** — a guard
  against accidental whole-file reserialization. For a genuine bulk
  correction, a maintainer applies the `bulk-data-ok` label to override.

## Use of AI Tools

AI-assisted contributions are welcome. We use AI tools for coding and
review ourselves, so we're not about to limit contributors using them to
assist their own workflow. What matters is that you understand, test, and
sign off on your contributions.

What isn't welcome:

- Automated or agent-driven PRs submitted without human review
- Formatting-only changes generated to pad contribution counts
- Massive PRs touching unrelated files — scope your changes; if AI
  generated it, it probably needs to be cut by 80%
- Issues or PRs that restate existing content without adding value
- Submissions where you cannot explain the change if asked

Maintainers are volunteers. Every agent-generated PR we close, every
formatting churn we review, every copy-paste issue we triage is time
stolen from actual development. If a maintainer suspects a contribution
was submitted without genuine human judgment, we'll close it without
detailed feedback — and feel completely justified mocking it afterward.
We genuinely enjoy working with contributors; we do not enjoy being a
dumping ground for automated output dressed up as participation, for
digital points and bling.

**On the data specifically:** AI is fine for *narrow, verifiable* data
tasks — e.g. tagging defined acronyms for tooltips, normalizing a named
field. It is **not** acceptable to have AI rewrite or rephrase entry
definitions: this is Jastrow's scholarship, and hallucinated or "improved"
content is unacceptable. Every AI-touched data change must be verified
against the source, and the data size policy above still applies.

Your DCO sign-off (below) attests that you stand behind the change —
including AI-assisted work.

## Commit Format

```
<emoji> <type>([scope]): <description>
```

Types: `🦄 new` / `🌈 improve` / `🦠 fix` / `🧺 chore` / `📖 doc` / `🚦 ci`

Example: `🦠 fix(ui): correct search input focus on mobile`

All commits must include a sign-off line (`git commit -s`).

## Code Style

- Vanilla JavaScript — no frameworks or bundlers
- Biome handles linting and formatting (`biome check .`)
- Tabs for indentation, single quotes for strings
- No `var` — use `const` and `let`

## Accessibility

UI changes must meet **WCAG 2.1 AA**. Run through the
[Accessibility Checklist](docs/accessibility-checklist.md) before opening
a PR that touches the interface — especially keyboard operability and
focus management, which automated tools don't catch.

## Pull Requests

- PRs are reviewed by [CodeRabbit](https://coderabbit.ai/) and a
  maintainer
- All CI checks must pass before merge (`biome check .`, and for data
  PRs the `validate:data` + size guard)
- Keep PRs focused — one feature or fix per PR

## Developer Certificate of Origin

By contributing, you agree to the [DCO](DCO). Your commits must include
a `Signed-off-by` line (use `git commit -s`).
