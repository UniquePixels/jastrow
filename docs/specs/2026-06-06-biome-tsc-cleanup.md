# Biome + tsc cleanup (2026-06-06)

Tracking doc for the lint/type-check cleanup against the project's
intentionally-strict Biome config.

## Disabled rules — Biome 2.4.16 stack overflow (REVISIT)

The following 16 `nursery` rules are **type-inference rules**. In Biome
2.4.16 each one stack-overflows the worker thread the moment it runs —
on every file, including a one-line module — so the whole `biome check`
aborts. This is a Biome limitation, not a code issue (verified by
running each rule in isolation with `--only=<rule>`). `RUST_MIN_STACK`
has no effect; the worker stack is fixed internally.

They are temporarily disabled so the gate can run. **Re-enable when**
Biome ships a fix (track upstream), or once we confirm a project type
setup that satisfies the type-inference engine without overflowing.

| Rule | Type-aware purpose |
|---|---|
| `nursery/noBaseToString` | flags implicit `[object Object]` stringification |
| `nursery/noFloatingPromises` | unhandled promises |
| `nursery/noMisleadingReturnType` | declared vs inferred return mismatch |
| `nursery/noMisusedPromises` | promises in boolean/void positions |
| `nursery/noUnnecessaryConditions` | always-true/false conditions |
| `nursery/noUnsafePlusOperands` | `+` across incompatible types |
| `nursery/noUselessTypeConversion` | redundant `String()`/`Number()` etc. |
| `nursery/useArraySortCompare` | `.sort()` without comparator |
| `nursery/useAwaitThenable` | `await` on non-thenable |
| `nursery/useConsistentEnumValueType` | mixed enum value types |
| `nursery/useDisposables` | `using` for disposables |
| `nursery/useExhaustiveSwitchCases` | non-exhaustive switch over union |
| `nursery/useFind` | `.filter()[0]` → `.find()` |
| `nursery/useNullishCoalescing` | `\|\|` → `??` where safe |
| `nursery/useRegexpExec` | `.match()` → `.exec()` in loops |
| `nursery/useStringStartsEndsWith` | regex → `startsWith`/`endsWith` |

### Re-test procedure

```bash
# Should NOT print "overflowed its stack" once upstream is fixed:
for r in noBaseToString noFloatingPromises noMisleadingReturnType \
  noMisusedPromises noUnnecessaryConditions noUnsafePlusOperands \
  noUselessTypeConversion useArraySortCompare useAwaitThenable \
  useConsistentEnumValueType useDisposables useExhaustiveSwitchCases \
  useFind useNullishCoalescing useRegexpExec useStringStartsEndsWith; do
  out=$(./node_modules/.bin/biome lint --only=nursery/$r sw.js 2>&1)
  echo "$out" | grep -q overflowed && echo "STILL CRASHES: $r" || echo "ok: $r"
done
```

## Other per-project rule decisions

Documented as each is evaluated during cleanup. Default is to **fix the
code**; a rule is only disabled with a project-specific justification.

| Rule | Decision | Justification | Audit |
|---|---|---|---|
| `nursery/noEqualsToNull` | Disabled (global) | All uses are the deliberate `== null` null-or-undefined idiom. `=== null` alone drops `undefined` (a bug); `x === null \|\| x === undefined` is pure verbosity. Recommended `noDoubleEquals` already permits `== null` via its `ignoreNull` default. | n/a |
| `correctness/noUnresolvedImports` | Off for `**/*.test.ts` only | `bun:test` is a Bun *virtual* module with no on-disk file, so Biome can't resolve it (`node:` builtins resolve fine; `bun:` don't). Scoped to tests so real source still gets unresolved-import detection. | n/a |
| `correctness/noUndeclaredDependencies` + unresolved (@anthropic-ai/sdk) | Declared as `optionalDependency` | The ai-classify script dynamically imports the SDK with a try/catch fallback. Declaring it tracks the real (optional) dependency honestly and satisfies both rules without disabling anything. | n/a |
| `suspicious/noConsole` | Downgraded to `info` | Console is legitimate output in the CLI tooling and dev logging in the app. Kept at info severity so every call still lists on each `biome check` run (continuous audit) without failing the gate. | every lint run |
| `nursery/useGlobalThis` | Disabled (global) | Browser + service-worker app; `window`/`self` are the idiomatic globals and signal browser intent. `globalThis` adds no behavior here. ~103 sites. | n/a |
| `correctness/noNodejsModules` | Off for `data/admin/**` | The admin server/scripts are Bun server-side tooling that correctly imports `node:fs`/`node:path`/`node:process`. Browser code still gets the rule. | n/a |
| `performance/noDelete` | Off for `data/admin/**` | The admin editor removes optional keys before serializing JSONL, and surrounding logic depends on key absence (`Object.keys(g).length === 0`). `delete` is correct; `= undefined` breaks it. | n/a |
| `style/noDefaultExport` | Off for `.commitlintrc.ts` | commitlint requires the config to be a default export. | n/a |
| `complexity/noImportantStyles` | Suppressed (per-site) | `!important` kept only where required: `prefers-reduced-motion` a11y override and Chart.js inline-style canvas sizing. Removed where specificity already wins (rt-table header). | inline reasons |
| `complexity/useMaxParams` | Suppressed (3 sites) | Geometry primitives `pieSeg`/`ringSeg` and a form-field factory where positional params are the natural signature. | inline reasons |
| `nursery/useThisInClassMethods` | Disabled (global) | 11 of the flagged methods are cohesive App-class instance methods (`showError`, `updateURL`, `_shareURL`, …) called as `this.x()` throughout and likely to use `this` later. Forcing `static` rewrites every call site and hurts class cohesion for no real gain. | n/a |
| `performance/useTopLevelRegex` | Fixed (hoisted) | Regex literals hoisted to module scope; biggest win is the per-request route table in server.ts. | n/a |
| `nursery/noLoopFunc` | Disabled (global) | Flagged event-listeners/closures in `for…of` loops. With block-scoped `const`/`let` loop variables the capture hazard it guards against cannot occur; factory-wrapping each closure is ceremony with identical runtime behavior. | n/a |
| `style/noDescendingSpecificity` | Disabled (global) | Component-organized CSS legitimately defines low-specificity selectors (`img`, `.entry-preview-panel`) after higher-specificity ones in different contexts. No real cascade bug; reordering whole component blocks is risky churn. | n/a |
| `nursery/useThisInClassMethods`, others | Fixed inline | `noUnusedVariables`, `noExplicitAny`, `noParameterAssign`, `noForEach`, `noShadow`, `noParametersOnlyUsedInRecursion`, `noUnusedExpressions`, `noDuplicateSelectors`, `useIframeSandbox`, `useAwait` — resolved in code. | n/a |
| `style/useConsistentMemberAccessibility` | Off for `**/*.js` | Requires TS `public`/`private`/`protected` modifiers, which vanilla JS classes cannot have — unsatisfiable in `.js`. Kept available for any future `.ts` classes. | n/a |
| `style/noMagicNumbers` | Disabled (global) | Naming every numeric literal (timeouts, pixel sizes, ranges, opacities) across UI/CSS code is heavy churn with marginal benefit. | n/a |
| `security/noSecrets` | Disabled (global) | Static site with no client-side secrets by design; all 15 matches were CSS selectors, HTML markup, and Hebrew text (entropy false positives). | n/a |

| `nursery/noInlineStyles` | Disabled (global) | Flagged styles are one-off decorative icon colors and layout tweaks; single-use CSS classes would be worse, not cleaner. Print build (local) uses inline styles legitimately. | n/a |
| `nursery/noContinue` | Disabled (global) | Sites are guard clauses (`if (x) continue;`) — the clean, flat form; restructuring deepens nesting. | n/a |
| `suspicious/noAlert`, `style/noProcessEnv`, `nursery/noSyncScripts` | Off for `data/admin/**` | Local-only admin tooling: native `alert`/`prompt`, Bun server `process.env`, and order-dependent print-build scripts. | n/a |
| `style/useNamingConvention` | Modified + 3 suppressions | Added `objectLiteralProperty → [camelCase, CONSTANT_CASE]` so the deliberate UPPER_SNAKE config constants (and DOMPurify `ADD_TAGS` names) pass. Suppressed 3 external-protocol names (`PRINT_READY`/`PRINT_ERROR` window flags, Anthropic `max_tokens`). | inline reasons |
| `suspicious/noBitwiseOperators`, `performance/noAwaitInLoops` | Suppressed (per-site) | Binary-search `>>> 1` midpoint; necessarily-sequential awaits (stream reads, ordered writes, rate-limited API, rAF). | inline reasons |
| `nursery/noSyncScripts` (index.html) | Fixed (defer) | App + CDN scripts get `defer`; the two head kit loaders left synchronous (custom-element FOUC risk — needs browser check). | n/a |

**Kept as non-gating signal (info severity, not fixed):** `noConsole` (audit), `noExcessiveCognitiveComplexity`, `noExcessiveLinesPerFunction`, `noExcessiveLinesPerFile`, `useBaseline` — flag real complexity / browser-compat to revisit without forcing risky changes now.

**Deliberately held (info, non-gating):**
- `nursery/useNamedCaptureGroup` (11) — refactoring the regexes to named groups + updating their match-index references is fiddly with real bug risk for non-gating gain.
- `nursery/noSyncScripts` (2) — the Web Awesome / Font Awesome head kit loaders in `index.html`; deferring them risks custom-element FOUC and needs browser verification.
- `style/useExportsLast` (1) — `render-rabbinic-time.ts` has a `if (import.meta.main)` CLI entry block after the export; satisfying the rule means moving the 70-line function below it, which reads worse.

## Open verification

- The `index.html` `defer` change (body-end CDN + app scripts) should be sanity-checked in a browser: confirm the app initializes (search, sages graph, keyboard, charts). It's the one change not verified during cleanup.
