#!/usr/bin/env bash
# Corpus tier as parallel processes inside ONE job (docs/v2/test-tiers.md
# §5): the tier passed CI's ~20-minute wall on 2026-09-07. Each heavy
# file runs alone (measured on CI: pipeline-links 277 s, residue-sweep
# 276 s, registry.order 223 s, commutation 213 s), everything else in a
# fifth process; each rebuilds the shared fixture (~110 s on CI). One
# job so the required check keeps its name. The runner has 4 vCPUs.
set -u
heavy=(
  admin/pipeline/body/pipeline-links.corpus.test.ts
  admin/pipeline/research/residue-sweep.corpus.test.ts
  admin/pipeline/transform/commutation.corpus.test.ts
  admin/pipeline/transform/registry.order.corpus.test.ts
)
ignore=()
for f in "${heavy[@]}"; do ignore+=(--path-ignore-patterns="$f"); done
pids=(); names=()
for f in "${heavy[@]}"; do
  bun test "$f" > "corpus-shard-$(basename "$f" .corpus.test.ts).log" 2>&1 &
  pids+=($!); names+=("$(basename "$f" .corpus.test.ts)")
done
bun test .corpus.test.ts "${ignore[@]}" > corpus-shard-rest.log 2>&1 &
pids+=($!); names+=(rest)
status=0
for i in "${!pids[@]}"; do
  if ! wait "${pids[$i]}"; then status=1; fi
  echo "=== ${names[$i]} ==="; cat "corpus-shard-${names[$i]}.log"
done
rm -f corpus-shard-*.log
exit $status
