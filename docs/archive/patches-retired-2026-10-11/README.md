# Retired patch records (2026-10-11)

`reviewed/patches.jsonl` holds the 28 reviewed `replace` patches that
left `admin/pipeline/patch/records/reviewed/patches.jsonl` in PR #160
(ledger L58). Every line is the original line's bytes, moved.

Each one followed a `join` on the same rid and put back the space
Sefaria's split ate after the folded marker: `find` `)<`, `replace`
`) <`. Since PR #160 the `join` op restores that space itself
(`foldMarker` in `admin/pipeline/patch/schema.ts`). With the op fixed
the companions no longer matched their pre-state, and they had
nothing left to do. The re-import without them left all 28 entries
byte-identical to the tree before the change.

Each rid's `manifest.jsonl` row in `reviewed/` now lists only its
join.

| Patch | Rid | Its join |
|---|---|---|
| P000196 | A00913 | P000195 |
| P000199 | A01662 | P000198 |
| P000202 | A03104 | P000201 |
| P000205 | B00534 | P000204 |
| P000208 | B00991 | P000207 |
| P000225 | I00753 | P000224 |
| P000227 | J00301 | P000226 |
| P000229 | K01188 | P000228 |
| P000231 | L00346 | P000230 |
| P000235 | N00327 | P000234 |
| P000237 | N00740 | P000236 |
| P000240 | N01381 | P000239 |
| P000244 | O00821 | P000243 |
| P000247 | O01397 | P000246 |
| P000249 | P00286 | P000248 |
| P000252 | P00539 | P000251 |
| P000254 | P00805 | P000253 |
| P000256 | P00859 | P000255 |
| P000258 | P01088 | P000257 |
| P000260 | P01094 | P000259 |
| P000263 | P01436 | P000262 |
| P000267 | Q02145 | P000266 |
| P000270 | R00096 | P000269 |
| P000273 | S01040 | P000272 |
| P000277 | U00261 | P000276 |
| P000279 | U00398 | P000278 |
| P000284 | U01674 | P000283 |
| P000287 | V00166 | P000286 |
