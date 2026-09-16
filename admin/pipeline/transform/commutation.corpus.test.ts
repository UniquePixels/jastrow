import { describe, expect, it } from 'bun:test';
import { parsePatterns } from '../patch/patterns.ts';
import { nonCommutingPairs, type PairStats } from './commutation.ts';
import { ORDERED, RULES } from './registry.ts';
import { sourceEntries } from './rules/corpus-fixture.ts';

/**
 * TWO invariants, and the second was prose until review round 2.
 *
 * 1. Every non-commuting pair is declared `entangledWith`, mutually.
 * 2. Every registered rule changes SOMETHING, so no pair has an empty
 *    candidate set and `composedPairs === totalPairs`.
 *
 * The comment beside the log line asserted (2) in words while the test
 * only PRINTED both numbers, so a rule that fires on no entry at all
 * would have passed here in silence: it is trivially order-free with
 * every partner, and it satisfies (1) vacuously. That is
 * `registry.ts`'s own recurring lesson — a rule which does nothing
 * satisfies every gate, and the measurement is the only safety net —
 * landing on the gate written to embody it.
 *
 * The CAUSE is asserted first and it names the culprit. A pair count
 * can report only that some pair was skipped, never which rule made it
 * empty; `PairStats.inertRules` carries the rule ids, for free, off the
 * changing-rid sets the run already builds. `composedPairs ===
 * totalPairs` follows from an empty `inertRules` and is asserted
 * anyway, because it is the literal claim a reader checks against
 * stdout.
 */
describe('the registry commutes except where the catalogue says otherwise', () => {
	it('every non-commuting pair is mutually declared entangledWith', async () => {
		// The RAW snapshot, shared: this gate measures rules against the
		// unrepaired entry, and `sourceEntries()` is that array built once
		// for the whole run. `nonCommutingPairs` takes it `readonly` and
		// never writes to it, which is the fixture's contract.
		const corpus = await sourceEntries();

		const rows = await parsePatterns(
			await Bun.file('data/patches/patterns.jsonl').text(),
		);
		const edges = new Map(
			rows.map((r) => [r.id, new Set(r.entangledWith ?? [])]),
		);
		const declared = (x: string, y: string): boolean =>
			(edges.get(x)?.has(y) ?? false) && (edges.get(y)?.has(x) ?? false);

		const stats: PairStats = {
			composedPairs: 0,
			crossPhasePairs: 0,
			inertRules: [],
			totalPairs: 0,
		};
		const start = performance.now();
		const pairs = nonCommutingPairs(RULES, corpus, stats);
		const elapsedMs = performance.now() - start;

		// The SECOND justification, added 2026-09-06: a pair whose order
		// is intended, fixed and argued in `ORDERED`. `entangledWith`
		// records population collision and its remedy is adjacency;
		// `ORDERED` records a sequence dependency and its remedy is a
		// direction. `registry.ts`'s `Ordered` docstring carries why the
		// first could not be stretched to cover the second.
		const ordered = (x: string, y: string): boolean =>
			ORDERED.some(
				(row) =>
					(row.before === x && row.after === y) ||
					(row.before === y && row.after === x),
			);
		const undeclared = pairs.filter(
			(p) => !declared(p.ids[0], p.ids[1]) && !ordered(p.ids[0], p.ids[1]),
		);

		// The pair counts and wall-clock on stdout are the gate's own
		// cost, reported rather than claimed — see commutation.ts module
		// doc. Under the union rule `composedPairs` should equal
		// `totalPairs`: every registered rule changes something, so no
		// pair has an empty candidate set. A gap between the two is not
		// a win, it is a rule that fires on nothing.
		// biome-ignore lint/suspicious/noConsole: see comment above
		console.log(
			`commutation gate: ${RULES.length} rules, ${stats.totalPairs} unordered pair(s), ` +
				`${stats.composedPairs} composed (union of changing rids nonempty), ` +
				`${stats.crossPhasePairs} cross-phase (one order only), ` +
				`${pairs.length} non-commuting, ${undeclared.length} undeclared, ${elapsedMs.toFixed(0)}ms`,
		);

		expect(
			undeclared.map((p) => `${p.ids[0]} × ${p.ids[1]} @ ${p.sampleRid}`),
		).toEqual([]);

		// AND THE OTHER DIRECTION, which is what stops `ORDERED` becoming
		// a suppression list: every declaration must name a pair that is
		// ACTUALLY non-commuting here. One naming a pair whose two orders
		// now agree is stale — the dependency it records has gone — and a
		// stale entry silently exempts a pair that may non-commute again
		// later for a different reason. Same lesson `unaccountedEdges`
		// carries for `entangledWith`: a recorded relationship must
		// produce a validated check or a reported problem, never silence.
		const live = new Set(pairs.map((p) => [...p.ids].sort().join(' × ')));
		expect(
			ORDERED.filter(
				(row) => !live.has([row.after, row.before].sort().join(' × ')),
			).map((row) => `${row.before} → ${row.after}`),
		).toEqual([]);

		// The second invariant — see this suite's docstring. Cause first,
		// then the symptom it implies.
		expect(stats.inertRules).toEqual([]);
		// Every pair is either composed or skipped for the ONE reason
		// this gate accepts. `crossPhasePairs` is the count `apply.ts`'s
		// manifest forces — 42 `text-repairs` rules against the 7
		// `structural-repairs` ones — asserted here so the skip cannot
		// quietly widen into same-phase pairs it has no licence for.
		// 80 → 280 across batch 7, which registered five structural
		// rules; 280 → 287 across batch 8 and 287 → 294 across batch 9,
		// each registering ONE `text-repairs` rule; 294 → 322 across
		// batch 10, which registered FOUR of them (46 × 7); and 322 → 329
		// on 2026-09-06 for `geresh-apostrophe-as-gershayim`, ONE more
		// `text-repairs` rule (47 × 7), and 329 → 336 the same day for
		// `unlinked-bare-anaphor`, one more again (48 × 7). The figure is
		// a PRODUCT, so it moves whenever either phase grows, and
		// re-deriving it is how a reader checks that the growth was in
		// the phase they expected: any one of batch 10's four declaring
		// `structural-repairs` instead would make it 45 × 8 = 360, and
		// the 2026-09-06 rule declaring it would have made 46 × 8 = 368
		// rather than 329.
		//
		// THIS ASSERTION IS THE CORPUS TIER'S ONLY TRIPWIRE ON ADDING A
		// RULE, and it fired as designed: `geresh-apostrophe-as-gershayim`
		// shipped in a commit verified with `bun qa` alone, which is the
		// unit tier and cannot see this. `bun qa` is the pre-commit gate
		// CLAUDE.md names; registering a rule additionally needs
		// `bun run transform:invariants`, and this comment is where a reader
		// finds that out.
		expect(stats.composedPairs + stats.crossPhasePairs).toBe(stats.totalPairs);
		expect(stats.crossPhasePairs).toBe(336);
		// MEASURED on CI 2026-08-31, PR #59's first `Corpus Audit` run: this
		// gate logged 134,141ms against the 180s budget it used to carry —
		// 75% of it. A runner a third slower fails here, and the message
		// would name the commutation gate rather than the slow machine.
		// 600s matches the convention of the corpus walks retired in
		// consolidation step 5 (`docs/v2/retired-corpus-checks.md`) for a
		// walk of this size. It is a timeout, not an assertion.
	}, 600_000);
});
