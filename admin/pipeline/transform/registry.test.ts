import { describe, expect, it } from 'bun:test';
import { type Pattern, parsePatterns } from '../research/patterns.ts';
import { checkAdjacency, coverage, PENDING, RULES } from './registry.ts';
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

	// 79, not the 80 this asserted after batch 1, nor the 81 it asserted
	// during it. Two withdrawals, each for its own reason, and the pair is
	// the point: a row leaves `transform` when the audit says so, and the
	// number here is a ledger of that, not a target.
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
	it('the catalogue still holds 79 transform rows', () => {
		expect(coverage(catalogue).total).toBe(79);
	});

	it('pending ids all exist in the catalogue', () => {
		const ids = new Set(catalogue.map((row) => row.id));
		for (const id of PENDING) {
			expect(ids).toContain(id);
		}
	});
});

describe('checkAdjacency', () => {
	// The RTL family is a 3-clique (Task 4), registered consecutively in
	// Task 5. Under a pairwise "≤ 1 apart" rule the endpoints are 2 apart
	// and no arrangement can pass — hence cluster contiguity.
	const clique = (ids: string[]): Pattern[] =>
		ids.map((id) => ({
			corpusCount: 0,
			description: '',
			entangledWith: ids.filter((other) => other !== id),
			id,
			round: 0,
			status: 'candidate' as const,
		}));

	it('a contiguous three-way cluster passes', () => {
		const rules = ['a', 'b', 'c'].map((id) => ({ id }) as Rule);
		expect(checkAdjacency(clique(['a', 'b', 'c']), rules)).toEqual([]);
	});

	it('a split cluster is reported once, not once per edge', () => {
		const rules = ['a', 'b', 'x', 'c'].map((id) => ({ id }) as Rule);
		expect(checkAdjacency(clique(['a', 'b', 'c']), rules)).toHaveLength(1);
	});
});
