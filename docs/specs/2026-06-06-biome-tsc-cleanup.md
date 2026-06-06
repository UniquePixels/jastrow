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
| `nursery/useNullishCoalescing` | `||` → `??` where safe |
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
| `suspicious/noConsole` | TBD | (pending Batch 4) | (pending) |
