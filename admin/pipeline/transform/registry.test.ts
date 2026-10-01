// biome-ignore-all lint/style/noExcessiveLinesPerFile: a table-driven suite; the cases and the fixtures they share read as one unit.
import { describe, expect, it } from 'bun:test';
import { type Pattern, parsePatterns } from '../patch/patterns.ts';
import { PATTERNS_PATH } from '../paths.ts';
import {
	checkAdjacency,
	checkOrdered,
	coverage,
	entangledClusters,
	ORDERED,
	PENDING,
	RETIRED,
	RULES,
	unaccountedEdges,
} from './registry.ts';
import type { Rule } from './types.ts';

const catalogue = parsePatterns(await Bun.file(PATTERNS_PATH).text());

// biome-ignore lint/complexity/noExcessiveLinesPerFunction: one suite per behaviour; its cases share setup and read as a single table.
describe('registry coverage', () => {
	it('every rule id exists in the catalogue', () => {
		const ids = new Set(catalogue.map((row) => row.id));
		for (const rule of RULES) {
			expect(ids).toContain(rule.id);
		}
	});

	it('every transform row is registered, pending or retired', () => {
		const report = coverage(catalogue);
		expect(report.unaccounted).toEqual([]);
		// A real claim, not an identity: each term is counted from its own
		// list rather than as the complement of the others, so the sum
		// only holds if every row belongs to exactly one.
		expect(report.registered + report.pending + report.retired.length).toBe(
			report.total,
		);
	});

	// A row nobody has looked at and a row a maintainer ruled out are
	// the same silence to `unaccounted`; `RETIRED` is what tells them
	// apart. `coverage` reports only the retired ids it finds in the
	// catalogue, so a misspelt id drops out here. Each entry cites the
	// ruling.
	it('every retired row is a catalogue row and cites its ruling', () => {
		expect(coverage(catalogue).retired.toSorted()).toEqual(
			RETIRED.map((r) => r.row).toSorted(),
		);
		for (const row of RETIRED) {
			expect(row.by).toMatch(/2026-09-2[01]/u);
		}
	});

	// The disjointness minor, deferred since the registry landed: a row
	// cannot both have a rule and be waiting for one. Cheap to assert,
	// and it is what stops the sum above from being satisfiable by
	// double-counting.
	it('RULES, PENDING and RETIRED are disjoint', () => {
		expect(coverage(catalogue).duplicated).toEqual([]);
		const registered = new Set(RULES.map((rule) => rule.id));
		expect(PENDING.filter((id) => registered.has(id))).toEqual([]);
		expect(RETIRED.filter((r) => registered.has(r.row))).toEqual([]);
	});

	it('pending ids all exist in the catalogue', () => {
		const ids = new Set(catalogue.map((row) => row.id));
		for (const id of PENDING) {
			expect(ids).toContain(id);
		}
	});

	// THE SILENCE THIS CLOSES, and it went uncaught through a whole
	// merged batch. `PENDING` is a standing claim that a row is still
	// owed a TRANSFORM rule (see its docstring in `registry.ts`), but
	// `coverage()` counts `pending` over transform-route rows ONLY. So a
	// row withdrawn to `judgment` and left in `PENDING` is counted by
	// nothing and reported by nothing: after #60 merged, `PENDING` held
	// 11 ids while `coverage().pending` read 4, and the seven withdrawn
	// citation-linking rows sat there claiming a rule was owed that
	// their own ruling had just said would never come.
	//
	// The test above cannot see it — those ids DO exist in the
	// catalogue, just on another route. `duplicated` cannot either: it
	// fires on a row named in `PENDING` AND registered, which a
	// withdrawn row is not. This asserts the property that was missing,
	// which is not existence but ROUTE.
	it('every pending id is a transform row, not a withdrawn one', () => {
		const routeOf = new Map(catalogue.map((row) => [row.id, row.route]));
		const misrouted = PENDING.filter((id) => routeOf.get(id) !== 'transform');
		expect(misrouted).toEqual([]);
	});

	// The other direction of the same reconciliation: the list's length
	// and the number `coverage()` reports must agree. They diverged
	// silently for the whole of #60.
	it('PENDING length equals the pending count coverage reports', () => {
		expect(PENDING).toHaveLength(coverage(catalogue).pending);
	});
});

/** A fully-connected synthetic entanglement group, shared by the two
 * suites below. Hoisted out of `checkAdjacency`'s block when
 * `entangledClusters` got its own tests — same fixture, two callers. */
const clique = (ids: string[]): Pattern[] =>
	ids.map((id) => ({
		corpusCount: 0,
		description: '',
		entangledWith: ids.filter((other) => other !== id),
		id,
		round: 0,
		status: 'candidate' as const,
	}));

describe('checkAdjacency', () => {
	// The RTL family is a 3-clique (Task 4), registered consecutively in
	// Task 5. Under a pairwise "≤ 1 apart" rule the endpoints are 2 apart
	// and no arrangement can pass — hence cluster contiguity.
	it('a contiguous three-way cluster passes', () => {
		const rules = ['a', 'b', 'c'].map((id) => ({ id }) as Rule);
		expect(checkAdjacency(clique(['a', 'b', 'c']), rules)).toEqual([]);
	});

	it('a split cluster is reported once, not once per edge', () => {
		const rules = ['a', 'b', 'x', 'c'].map((id) => ({ id }) as Rule);
		expect(checkAdjacency(clique(['a', 'b', 'c']), rules)).toHaveLength(1);
	});
});

/**
 * `entangledClusters` is what `registry.order.test.ts` asserts the
 * live clusters against, so its two failure modes are unit-tested here
 * on synthetic input rather than only exercised through the real
 * catalogue.
 *
 * The two mutations are the ones the review asked for, in miniature:
 * strip a cluster's edges and it must LEAVE the derived set (so the
 * pinned list fails); scatter its members and it must STAY in the set
 * with a span wider than its membership (so the span test fails).
 * Those are different failures, and the order test needs both — a
 * derived set alone cannot see scattering, and a span check alone
 * cannot see a missing edge.
 */
// biome-ignore lint/complexity/noExcessiveLinesPerFunction: one suite per behaviour; its cases share setup and read as a single table.
describe('entangledClusters', () => {
	const rules = (ids: string[]): Rule[] => ids.map((id) => ({ id }) as Rule);

	it('derives a cluster from the catalogue, not from a list', () => {
		const found = entangledClusters(
			clique(['a', 'b', 'c']),
			rules(['a', 'b', 'c']),
		);
		expect(found).toEqual([{ at: [0, 1, 2], ids: ['a', 'b', 'c'], stale: [] }]);
	});

	// Mutation 1: the edges are gone. The component collapses to three
	// singletons and the cluster disappears — which is exactly why
	// `checkAdjacency` alone cannot notice, and why the order test pins
	// the SET rather than only checking spans.
	it('drops a cluster whose edges were stripped, and checkAdjacency then passes', () => {
		const stripped = clique(['a', 'b', 'c']).map((row) => ({
			...row,
			entangledWith: [],
		}));
		expect(
			entangledClusters(stripped, rules(['a', 'x', 'b', 'y', 'c'])),
		).toEqual([]);
		expect(checkAdjacency(stripped, rules(['a', 'x', 'b', 'y', 'c']))).toEqual(
			[],
		);
	});

	// Mutation 2: the edges are intact and the members are scattered.
	// The cluster is still derived — with a span of 5 for 3 members.
	it('keeps a scattered cluster, with a span wider than its membership', () => {
		const found = entangledClusters(
			clique(['a', 'b', 'c']),
			rules(['a', 'x', 'b', 'y', 'c']),
		);
		expect(found).toEqual([{ at: [0, 2, 4], ids: ['a', 'b', 'c'], stale: [] }]);
		expect(
			Math.max(...(found[0]?.at ?? [])) - Math.min(...(found[0]?.at ?? [])) + 1,
		).toBe(5);
	});

	// A component with only one registered member cannot be got wrong by
	// execution order, so it is not a cluster. This is the blind spot
	// `checkAdjacency`'s limitation note names: an unregistered partner
	// makes the edge invisible until its rule ships.
	it('ignores a component with fewer than two registered members', () => {
		expect(entangledClusters(clique(['a', 'b']), rules(['a']))).toEqual([]);
	});

	/**
	 * A ONE-SIDED edge, walked from the side that does not record it.
	 *
	 * `checkEntanglement` reports an unreciprocated edge as a catalogue
	 * problem, and all 18 live edges are symmetric — but this function
	 * must not DEPEND on that. It is the code that makes the adjacency
	 * gate falsifiable; resting it on a property of the catalogue is the
	 * same shape of error the gate exists to catch.
	 *
	 * Registry order starts with `b`, the side holding no edge. Under a
	 * DIRECTED graph `b`'s component is a singleton, it enters `seen`
	 * first, and the later walk from `a` skips it as already seen — so
	 * the split cluster vanishes and `checkAdjacency` passes on it.
	 * Built undirected, `b` reaches `a` and the split is reported.
	 */
	const oneSided = (): Pattern[] => [
		{
			corpusCount: 0,
			description: '',
			entangledWith: ['b'],
			id: 'a',
			round: 0,
			status: 'candidate' as const,
		},
		{
			corpusCount: 0,
			description: '',
			id: 'b',
			round: 0,
			status: 'candidate' as const,
		},
	];

	it('derives a one-sided edge walked from the side without it', () => {
		expect(entangledClusters(oneSided(), rules(['b', 'x', 'a']))).toEqual([
			{ at: [0, 2], ids: ['a', 'b'], stale: [] },
		]);
	});

	it('checkAdjacency reports a split one-sided cluster', () => {
		expect(checkAdjacency(oneSided(), rules(['b', 'x', 'a']))).toHaveLength(1);
	});

	// The contiguous arrangement of the same one-sided pair must still
	// pass, so the fix above cannot be satisfied by reporting everything.
	it('a contiguous one-sided pair passes', () => {
		expect(checkAdjacency(oneSided(), rules(['b', 'a']))).toEqual([]);
	});

	/**
	 * A DANGLING endpoint: `a` is registered and records an edge to an
	 * id NO catalogue row holds.
	 *
	 * The component is `{a, ghost}`; `ghost` matches no rule, so it
	 * contributes no registry position and the component held one
	 * registered member. Under the `at.length >= 2` retention rule
	 * alone it was dropped whole, and `checkAdjacency` returned clean
	 * on a broken record — the third appearance on this branch of one
	 * failure shape, a recorded entanglement leaving the gate's view
	 * without a word. Only `checkEntanglement`, walking the catalogue
	 * from the other side, said anything.
	 *
	 * The two assertions below FAILED with `Received length: 0` before
	 * `Cluster.stale` existed. A stale endpoint is not an ordering
	 * defect — nothing can be scheduled next to a rule that does not
	 * exist — so it is reported as what it is, and the cluster is kept
	 * so that there is something to report it on.
	 */
	const dangling = (): Pattern[] => [
		{
			corpusCount: 0,
			description: '',
			entangledWith: ['ghost'],
			id: 'a',
			round: 0,
			status: 'candidate' as const,
		},
	];

	it('keeps a component whose endpoint is not a catalogue row', () => {
		expect(entangledClusters(dangling(), rules(['a']))).toEqual([
			{ at: [0], ids: ['a', 'ghost'], stale: ['ghost'] },
		]);
	});

	it('checkAdjacency reports a stale endpoint rather than going quiet', () => {
		const problems = checkAdjacency(dangling(), rules(['a']));
		expect(problems).toHaveLength(1);
		expect(problems[0]).toContain('ghost');
	});

	// And the fix is not "report everything": an unregistered partner
	// that IS a catalogue row is the deferred case — its rule has not
	// shipped, execution order cannot be wrong about it yet, and the
	// gate stays quiet. That distinction is the whole content of
	// `stale`.
	it('an unregistered partner the catalogue holds stays quiet', () => {
		expect(entangledClusters(clique(['a', 'b']), rules(['a']))).toEqual([]);
		expect(checkAdjacency(clique(['a', 'b']), rules(['a']))).toEqual([]);
	});
});

/**
 * The invariant behind all three fixes, asserted directly: a recorded
 * entanglement touching the registry must produce a validated cluster
 * or a reported problem, never silence.
 *
 * `registry.order.test.ts` runs this against the live catalogue, where
 * it is currently empty. These four cases are what make that empty
 * result mean something.
 */
describe('unaccountedEdges', () => {
	const rules = (ids: string[]): Rule[] => ids.map((id) => ({ id }) as Rule);

	it('a fully registered cluster accounts for every edge in it', () => {
		expect(
			unaccountedEdges(clique(['a', 'b', 'c']), rules(['a', 'b', 'c'])),
		).toEqual([]);
		// Scattered, so `checkAdjacency` reports it — still accounted
		// for, because REPORTED is one of the two acceptable outcomes.
		expect(
			unaccountedEdges(
				clique(['a', 'b', 'c']),
				rules(['a', 'x', 'b', 'y', 'c']),
			),
		).toEqual([]);
	});

	// The deferred case, and the one place the gate is allowed to be
	// quiet — but not unnoticed. Naming it here is what forces a look
	// the day a registered rule acquires a pending partner.
	it('names an edge whose partner has no rule yet', () => {
		expect(unaccountedEdges(clique(['a', 'b']), rules(['a']))).toHaveLength(1);
	});

	it('says nothing about an edge between two unregistered rows', () => {
		expect(unaccountedEdges(clique(['a', 'b']), rules(['x']))).toEqual([]);
	});

	// The dangling endpoint again, from the invariant's side: before
	// `Cluster.stale` this returned the edge as unaccounted, because
	// the component was dropped and nothing reported it. It is
	// accounted for now precisely because `checkAdjacency` speaks up.
	it('a dangling endpoint is accounted for once it is reported', () => {
		const catalogueWithGhost: Pattern[] = [
			{
				corpusCount: 0,
				description: '',
				entangledWith: ['ghost'],
				id: 'a',
				round: 0,
				status: 'candidate' as const,
			},
		];
		expect(unaccountedEdges(catalogueWithGhost, rules(['a']))).toEqual([]);
		expect(checkAdjacency(catalogueWithGhost, rules(['a']))).toHaveLength(1);
	});
});

describe('ORDERED — intended non-commuting pairs', () => {
	// The direction is VERIFIED against the shipped registry, not taken
	// on the declaration's word. Without this, `ORDERED` would be a way
	// to write down an order rather than a way to enforce one.
	it('every declaration is satisfied by the registry', () => {
		expect(checkOrdered()).toEqual([]);
	});

	it('reports a declaration the registry contradicts', () => {
		const rules = [{ id: 'late' } as Rule, { id: 'early' } as Rule];
		expect(
			checkOrdered([{ after: 'late', before: 'early', reason: '' }], rules),
		).toEqual([
			'ORDERED says early runs before late, but the registry runs it after',
		]);
	});

	it('reports an unregistered id rather than passing vacuously', () => {
		expect(
			checkOrdered([{ after: 'ghost', before: 'phantom', reason: '' }], []),
		).toEqual(['ORDERED names unregistered rule(s): phantom, ghost']);
	});

	it('every declared id is a registered rule', () => {
		const ids = new Set(RULES.map((rule) => rule.id));
		for (const row of ORDERED) {
			expect(ids).toContain(row.before);
			expect(ids).toContain(row.after);
		}
	});

	// A pair cannot be BOTH: the two declarations describe different
	// phenomena and different remedies, so recording one pair under both
	// means one of them is the wrong description.
	it('no pair is declared both entangled and ordered', () => {
		const edges = new Map(
			catalogue.map((row) => [row.id, new Set(row.entangledWith ?? [])]),
		);
		const both = ORDERED.filter(
			(row) =>
				(edges.get(row.before)?.has(row.after) ?? false) ||
				(edges.get(row.after)?.has(row.before) ?? false),
		);
		expect(both.map((row) => `${row.before} → ${row.after}`)).toEqual([]);
	});
});
