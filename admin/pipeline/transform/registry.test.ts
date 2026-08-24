import { describe, expect, it } from 'bun:test';
import { type Pattern, parsePatterns } from '../research/patterns.ts';
import {
	checkAdjacency,
	coverage,
	entangledClusters,
	PENDING,
	RULES,
} from './registry.ts';
import type { Rule } from './types.ts';

const catalogue = parsePatterns(
	await Bun.file('data/patches/patterns.jsonl').text(),
);

describe('registry coverage', () => {
	it('every rule id exists in the catalogue', () => {
		const ids = new Set(catalogue.map((row) => row.id));
		for (const rule of RULES) {
			expect(ids).toContain(rule.id);
		}
	});

	it('every transform row is registered or explicitly pending', () => {
		const report = coverage(catalogue);
		expect(report.unaccounted).toEqual([]);
		// A real claim, not an identity: `pending` is counted from
		// `PENDING` rather than as the complement of `registered`, so the
		// sum only holds if every row belongs to exactly one list.
		expect(report.registered + report.pending).toBe(report.total);
	});

	// The disjointness minor, deferred since the registry landed: a row
	// cannot both have a rule and be waiting for one. Cheap to assert,
	// and it is what stops the sum above from being satisfiable by
	// double-counting.
	it('RULES and PENDING are disjoint', () => {
		expect(coverage(catalogue).duplicated).toEqual([]);
		const registered = new Set(RULES.map((rule) => rule.id));
		expect(PENDING.filter((id) => registered.has(id))).toEqual([]);
	});

	// 78, not the 80 this asserted after batch 1, nor the 81 it asserted
	// during it. Three withdrawals, each for its own reason, and the set
	// is the point: a row leaves `transform` when the audit says so, and
	// the number here is a ledger of that, not a target.
	//
	// - `abbrev-in-alt-headwords`, 2026-08-22 (spec §5.2): expanding a
	//   geresh stub needs the headword's remaining vowels to carry over to
	//   the variant, and a variant spelling exists precisely because it
	//   differs — an assumption the corpus cannot test. It failed on what
	//   the rule would INFER.
	// - `h-cognate-self-link`, batch 2 Task 4: it passes that test — an
	//   unlink infers nothing — and fails a different one. No other article
	//   exists for any of its 87 anchors (0 of 87 at exact pointing), so
	//   there is no correct target the link was withheld from; and the same
	//   linker behaviour produces 2,657 more self-links in definitions, so
	//   the row is 3.2% of a corpus-wide habit carved out by a field
	//   boundary. There was no defect to remove. See
	//   data/patches/catalogue-audit/h-cognate-self-link.md.
	// - `homograph-numeral-mismatch`, batch 2 Task 9: there IS a defect —
	//   the display carries Jastrow's print numeral and is the
	//   authoritative side in 26 of 40 members read — but no rule can
	//   name where the link should go instead. 40.1% of the 576
	//   occurrences already point at the member print names, the only
	//   destination model available reproduces just 87.5% of 3,253
	//   KNOWN-CORRECT links, and gate case 2 can source the replacement
	//   for 3.5% of the candidate defects. It failed on the DESTINATION,
	//   where the two above failed on inference and on there being no
	//   defect at all. See
	//   data/patches/catalogue-audit/homograph-numeral-mismatch.md.
	it('the catalogue still holds 78 transform rows', () => {
		expect(coverage(catalogue).total).toBe(78);
	});

	it('pending ids all exist in the catalogue', () => {
		const ids = new Set(catalogue.map((row) => row.id));
		for (const id of PENDING) {
			expect(ids).toContain(id);
		}
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
describe('entangledClusters', () => {
	const rules = (ids: string[]): Rule[] => ids.map((id) => ({ id }) as Rule);

	it('derives a cluster from the catalogue, not from a list', () => {
		const found = entangledClusters(
			clique(['a', 'b', 'c']),
			rules(['a', 'b', 'c']),
		);
		expect(found).toEqual([{ at: [0, 1, 2], ids: ['a', 'b', 'c'] }]);
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
		expect(found).toEqual([{ at: [0, 2, 4], ids: ['a', 'b', 'c'] }]);
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
});
