# Contributing to Jastrow Dictionary

Thank you for your interest in contributing!

## Getting Started

1. Fork the repository
2. Create a feature branch (`git checkout -b my-feature`)
3. Make your changes
4. Commit using the project's commit format (see below)
5. Push to your fork and open a pull request

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

## Pull Requests

- PRs are reviewed by [CodeRabbit](https://coderabbit.ai/) and a
  maintainer
- All CI checks must pass before merge
- Keep PRs focused — one feature or fix per PR

## Developer Certificate of Origin

By contributing, you agree to the [DCO](DCO). Your commits must include
a `Signed-off-by` line (use `git commit -s`).
