# Contributing to Jastrow Dictionary

Thank you for your interest in contributing!

## Getting Started

`v2` is the overhaul branch and holds the data pipeline; the public app
and the admin tool have not been written for it yet. Start with
[`admin/pipeline/README.md`](admin/pipeline/README.md) and
[`docs/glossary.md`](docs/glossary.md).

### Contributing Data

Entry data under `data/entries/` is produced by the import
(`bun data:import`), not edited by hand in a PR. If you have found an
error in an entry, open a **Data correction** issue with the source
citation rather than a pull request — the correction is applied through
the pipeline so the run stays reproducible.

Each entry is one dense line of scholarship, so review is careful and
slow: **one topic per PR**, and for anything larger open an issue first
to coordinate.

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
against the source, and the data rules above still apply.

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

- TypeScript on Bun, no bundler
- Biome handles linting and formatting (`bun qa:lint`, `bun qa:format`)
- Tabs for indentation, single quotes for strings
- Run `bun qa` before every commit — format, lint, unit tests, `tsc`

## Tests

`bun qa` runs every unit test (`*.test.ts`) in about two seconds, most
of it validating every entry data file. CI's `Test` job runs the same
set, and never reads the source data in `data/source/`.

Two checks of rule *code* need the whole source snapshot and take
several minutes, so they run on your machine rather than in CI:

```bash
bun run transform:invariants
```

Run it before opening a PR that registers a transform rule, changes
what a rule matches, or reorders `admin/pipeline/transform/registry.ts`.
It checks that rules editing the same text have a declared, justified
order (commutation) and that each rule's class is earned over the data
(registry order).

A test that reads the source snapshot MUST be named `*.corpus.test.ts`,
MUST take its entries from
`admin/pipeline/transform/rules/corpus-fixture.ts`, and MUST be added to
`transform:invariants`; `admin/pipeline/test-tiers.test.ts` fails the
build otherwise. An example built from real entries belongs in a
`*.test.ts` with the entries in a committed fixture file.

## Accessibility

There is no v2 interface yet. When one exists, UI changes must meet
**WCAG 2.1 AA** — especially keyboard operability and focus management,
which automated tools don't catch.

## Issues

- An issue is **one class of defect or one decision**, never a list of
  entry ids. Per-entry rows live in the generated docs
  (`docs/v2/review-report.md`, `docs/v2/headword-issues.md`) or in patch
  manifests; the issue links the section instead of copying it, so it
  cannot go stale on the next run.
- One issue per piece of work, not per shape of it. If several shapes are
  fixed by the same pass (say, one read of the 1903 print), they share an
  issue with a checklist.
- A single wrong entry goes through the **Data correction** form, which
  asks for the headword and its id. That is the one place an entry id
  belongs in an issue.
- AI sessions file no issue, and close none, without the maintainer's
  explicit go in that session.

## Pull Requests

- PRs are reviewed by [CodeRabbit](https://coderabbit.ai/) and a
  maintainer
- All CI checks must pass before merge (`Lint`, `Type Check`, `Test`)
- Keep PRs focused — one feature or fix per PR

## Developer Certificate of Origin

By contributing, you agree to the [DCO](DCO). Your commits must include
a `Signed-off-by` line (use `git commit -s`).
