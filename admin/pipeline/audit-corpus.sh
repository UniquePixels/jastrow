#!/usr/bin/env bash
# Corpus tier (docs/v2/test-tiers.md §5). CI runs one shard per
# runner via the `corpus` matrix job in .github/workflows/ci-lint.yml,
# with an aggregating `corpus-audit` job that keeps the required
# check's name. Locally (CORPUS_SHARD unset) the five shards still run
# as parallel processes inside one job, the way CI did before
# 2026-09-08: each heavy file runs alone (measured on CI:
# pipeline-links 277 s, residue-sweep 276 s, registry.order 223 s,
# commutation 213 s), everything else in a fifth process; each
# rebuilds the shared fixture (~110 s on CI).
set -u
heavy=(
  admin/pipeline/body/pipeline-links.corpus.test.ts
  admin/pipeline/research/residue-sweep.corpus.test.ts
  admin/pipeline/transform/commutation.corpus.test.ts
  admin/pipeline/transform/registry.order.corpus.test.ts
)
heavy_names=(pipeline-links residue-sweep commutation registry.order)
ignore=()
for f in "${heavy[@]}"; do ignore+=(--path-ignore-patterns="$f"); done

if [[ -n "${CORPUS_SHARD:-}" ]]; then
  case "$CORPUS_SHARD" in
    pipeline-links) exec bun test admin/pipeline/body/pipeline-links.corpus.test.ts ;;
    residue-sweep) exec bun test admin/pipeline/research/residue-sweep.corpus.test.ts ;;
    commutation) exec bun test admin/pipeline/transform/commutation.corpus.test.ts ;;
    registry.order) exec bun test admin/pipeline/transform/registry.order.corpus.test.ts ;;
    rest) exec bun test .corpus.test.ts "${ignore[@]}" ;;
    *)
      echo "unknown CORPUS_SHARD '$CORPUS_SHARD'; valid shards: ${heavy_names[*]} rest" >&2
      exit 1
      ;;
  esac
fi

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
