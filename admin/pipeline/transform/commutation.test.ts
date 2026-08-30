import { describe, expect, it } from 'bun:test';
import { readSourceEntries } from '../body/source.ts';
import type { SourceEntry } from '../body/types.ts';
import { parsePatterns } from '../research/patterns.ts';
import {
	changingRids,
	nonCommutingPairs,
	type PairStats,
} from './commutation.ts';
import { RULES } from './registry.ts';
import type { Rule, TransformResult } from './types.ts';

const entryOf = (rid: string, definition: string): SourceEntry => ({
	content: { senses: [{ definition }] },
	headword: 'x',
	rid,
});

const editDef = (id: string, fn: (s: string) => string): Rule => ({
	apply(entry: SourceEntry): TransformResult {
		const [sense] = entry.content.senses;
		const before = sense?.definition ?? '';
		const after = fn(before);
		if (after === before) {
			return { entry, records: [] };
		}
		return {
			entry: {
				...entry,
				content: {
					...entry.content,
					senses: [{ ...sense, definition: after }],
				},
			},
			records: [{ detail: after, rid: entry.rid, ruleId: id }],
		};
	},
	id,
	phase: 'text-repairs',
});

const dotToBang = editDef('dot-to-bang', (s) => s.replace(/\.$/u, '!'));
const killLastChar = editDef('kill-last-char', (s) =>
	s === '' ? s : s.slice(0, -1),
);
const upperHead = editDef('upper-head', (s) => s.toUpperCase());
/** Fires on a trailing dot and nothing else, like `dotToBang` — so the
 * two share an empty union on a dot-free entry. */
const killLastDot = editDef('kill-last-dot', (s) => s.replace(/\.$/u, ''));

/** The shape this branch repairs, in miniature: one rule DELETES the
 * markup that was hiding text from the other. `unlinkAnchor` drops an
 * `<a>` keeping its display; `wrapHebrew` wraps a Hebrew run and
 * declines any text still carrying an anchor. Neither is contrived — they are
 * `ellipsis-fragment-anchored` and `bare-rtl-hebrew` reduced to one
 * regex each. */
const unlinkAnchor = editDef('unlink-anchor', (s) =>
	s.replace(/<a\b[^>]*>(?<display>[^<]*)<\/a>/gu, '$<display>'),
);
const wrapHebrew = editDef('wrap-hebrew', (s) =>
	s.includes('<a')
		? s
		: s.replace(/(?<run>[\u0590-\u05FF]+)/gu, '<span dir="rtl">$<run></span>'),
);

/** Returns a fresh entry object and NO record — the second of
 * `changingRids`' two signals, on its own. */
const silentRewrite: Rule = {
	apply: (entry: SourceEntry): TransformResult => ({
		entry: { ...entry },
		records: [],
	}),
	id: 'silent-rewrite',
	phase: 'text-repairs',
};

describe('changingRids', () => {
	it('reports only the rids where the rule changed the entry', () => {
		const corpus = [
			entryOf('A1', 'ends with a dot.'),
			entryOf('A2', 'ends without one'),
		];
		expect([...changingRids(dotToBang, corpus)]).toEqual(['A1']);
	});

	// The disjunction, pinned. A rule may report a change by returning a
	// new entry object, by producing a record, or both; relying on
	// records ALONE is what the previous version did, unstated, and the
	// union skip's soundness rests on this set never missing a change.
	it('reports a rid whose entry changed without a record', () => {
		expect([...changingRids(silentRewrite, [entryOf('A1', 'x')])]).toEqual([
			'A1',
		]);
	});

	// The corpus-tier gate asserts `stats.inertRules` is empty, so the
	// field has to be able to come back non-empty — pinned here rather
	// than trusted, since an out-param that is never written reads
	// exactly like an invariant that always holds.
	// THE CROSS-PHASE SKIP, pinned in miniature. `dotToBang` and
	// `killLastChar` are the pair this file already proves does NOT
	// commute; moving one of them into the other phase must silence it,
	// because the manifest then admits only one order. Written this way
	// round on purpose: a skip tested on a commuting pair would pass
	// whether the branch existed or not.
	it('skips a non-commuting pair whose rules are in different phases', () => {
		const structural: Rule = { ...killLastChar, phase: 'structural-repairs' };
		const stats: PairStats = {
			composedPairs: 0,
			crossPhasePairs: 0,
			inertRules: [],
			totalPairs: 0,
		};
		const corpus = [entryOf('A1', 'two dots..')];
		expect(nonCommutingPairs([dotToBang, killLastChar], corpus)).toHaveLength(
			1,
		);
		expect(nonCommutingPairs([dotToBang, structural], corpus, stats)).toEqual(
			[],
		);
		expect(stats.crossPhasePairs).toBe(1);
		expect(stats.composedPairs).toBe(0);
		expect(stats.totalPairs).toBe(1);
	});

	it('names a rule that changes no entry, through PairStats', () => {
		const stats: PairStats = {
			composedPairs: 0,
			crossPhasePairs: 0,
			inertRules: [],
			totalPairs: 0,
		};
		nonCommutingPairs(
			[dotToBang, killLastChar],
			[entryOf('A1', 'no dot')],
			stats,
		);
		expect(stats.inertRules).toEqual(['dot-to-bang']);
	});
});

describe('nonCommutingPairs', () => {
	it('flags a pair whose two orders disagree on a shared rid', () => {
		// A single trailing dot is not enough to disagree: dot-then-kill
		// and kill-then-dot both land on the same string with the dot
		// stripped either way. Two trailing dots is where the orders
		// split — dot-then-kill leaves one dot behind (it bangs the
		// second, then the kill removes the bang); kill-then-dot removes
		// one dot outright, exposing the other to become a bang.
		const corpus = [entryOf('A1', 'ends with a dot..')];
		const found = nonCommutingPairs([dotToBang, killLastChar], corpus);
		expect(found).toHaveLength(1);
		expect(found[0]?.ids.sort()).toEqual(['dot-to-bang', 'kill-last-char']);
		expect(found[0]?.sampleRid).toBe('A1');
	});

	it('does not flag a pair whose two orders agree', () => {
		const corpus = [entryOf('A1', 'ends with a dot.')];
		expect(nonCommutingPairs([dotToBang, upperHead], corpus)).toEqual([]);
	});
});

/**
 * THE INVERSION (review round 1). This suite used to hold one test
 * asserting the opposite of the first below — `never composes a pair
 * whose firing rids do not intersect` — which pinned the UNSOUND
 * intersection skip as DESIRED behaviour, where it would have survived
 * review and refactoring untouched.
 */
describe('the union skip', () => {
	// The sound property, built from the exact shape
	// `fix/rtl-unlink-order` repairs. `wrapHebrew` does not fire on the
	// raw entry — the text still carries an anchor, which it declines
	// wholesale — and fires only on `unlinkAnchor`'s OUTPUT. That is
	// asserted here rather than assumed, so the test cannot quietly
	// stop exercising the case it exists for. Under the intersection
	// rule the two rid sets did not meet, the pair was discarded before
	// composition, and this returned []. Under the union it is reported.
	it('flags a pair that disagrees only after one rule exposes the other', () => {
		const corpus = [entryOf('A1', '<a href="/x">אבג</a>')];
		expect(changingRids(wrapHebrew, corpus).size).toBe(0);
		const found = nonCommutingPairs([unlinkAnchor, wrapHebrew], corpus);
		expect(found).toHaveLength(1);
		expect(found[0]?.ids.toSorted()).toEqual(['unlink-anchor', 'wrap-hebrew']);
		expect(found[0]?.sampleRid).toBe('A1');
	});

	it('never composes a pair when neither rule changes any entry', () => {
		// The skip that survives the inversion, and the only one the
		// union licenses: if NEITHER rule changes `e` then both orders
		// are `e`, so a pair with an empty union is skipped WITHOUT
		// composing. Asserted by counting apply calls, since composing
		// anyway would still return [] here and hide the missing
		// optimisation.
		let calls = 0;
		const counted: Rule = {
			...dotToBang,
			apply: (e: SourceEntry): TransformResult => {
				calls++;
				return dotToBang.apply(e);
			},
		};
		const corpus = [entryOf('A2', 'no trailing dot')];
		nonCommutingPairs([counted, killLastDot], corpus);
		expect(calls).toBe(1); // the changingRids pass only; no composition
	});
});

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
		const corpus: SourceEntry[] = [];
		for await (const entry of readSourceEntries()) {
			corpus.push(entry);
		}

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

		const undeclared = pairs.filter((p) => !declared(p.ids[0], p.ids[1]));

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

		// The second invariant — see this suite's docstring. Cause first,
		// then the symptom it implies.
		expect(stats.inertRules).toEqual([]);
		// Every pair is either composed or skipped for the ONE reason
		// this gate accepts. `crossPhasePairs` is the count `apply.ts`'s
		// manifest forces — 40 `text-repairs` rules against the 7
		// `structural-repairs` ones — asserted here so the skip cannot
		// quietly widen into same-phase pairs it has no licence for.
		// 80 → 280 across batch 7, which registered five structural
		// rules. The figure is a PRODUCT, so it moves whenever either
		// phase grows, and re-deriving it is how a reader checks that
		// the growth was in the phase they expected: a rule silently
		// declared `text-repairs` would push it to 287, not 280.
		expect(stats.composedPairs + stats.crossPhasePairs).toBe(stats.totalPairs);
		expect(stats.crossPhasePairs).toBe(280);
	}, 180_000);
});
