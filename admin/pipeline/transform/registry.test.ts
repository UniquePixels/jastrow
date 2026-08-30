import { describe, expect, it } from 'bun:test';
import { type Pattern, parsePatterns } from '../research/patterns.ts';
import {
	checkAdjacency,
	coverage,
	entangledClusters,
	PENDING,
	RULES,
	unaccountedEdges,
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

	// 68, not the 80 this asserted after batch 1, nor the 81 it asserted
	// during it. Thirteen departures, each for its own reason, and the set
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
	// - `ascii-gershayim-outside-body-text`, batch 3a pre-PR review: the
	//   fourth failed none of those tests — it had nothing left to fail
	//   them with. Batch 3a widened `ascii-quote-as-gershayim-in-body` to
	//   every field `fieldsOf` walks and split the tag locus into
	//   `gershayim-breaks-ref-attribute`, and those two rules between
	//   them repair six of this row's seven slots. The seventh is
	//   `refs[]`, dropped at compile (B7). An exhaustive walk over the
	//   raw JSON puts the unowned surviving population at ZERO, so the
	//   row was discarded rather than narrowed: left on `transform` it
	//   would have been a second owner of records these rules already
	//   repair, which is the failure the batch existed to fix. Its
	//   `reason` carries the partition and the command.
	// - FOUR MORE, batch 3b Task 6 — 77 down to 73, every one failing the
	//   NO REPAIR EXISTS test rather than the destination one:
	//   `gloss-head-seam-period-doubling` (15) and `entry-final-comma`
	//   (10) on their own recorded audits, `orphan-gloss-seam-period`
	//   (19) and `citation-quote-seam-period` (43) on new measurements.
	//   That task's fifth row, `italic-swallows-close-paren`, failed
	//   neither and shipped at 10 -> 8. See
	//   data/patches/catalogue-audit/batch-3b-withdrawals.md.
	// - `post-anchor-numeral-duplication` (11 occ / 11 ent), batch 4 Task 6
	//   — 73 to 72, NO REPAIR EXISTS; working in registry.ts's `PENDING`.
	// - `abbrev-headword-stub` (34), batch 5 Task 1 — 72 to 71, NO REPAIR
	//   EXISTS, and the row said so itself: its `reason` ended "RAISE ONLY
	//   IF THAT ROW'S DISPOSITION IS UPHELD", naming
	//   `abbrev-in-alt-headwords`, whose disposition was NOT upheld. The
	//   field-side row is structurally worse off than the parent it was
	//   modelled on — the stub IS the headword, so no fuller spelling of
	//   the lexeme exists in the entry by construction. Measured: an
	//   expansion source exists for 4 of 34 (11.8%) against the 65.5% that
	//   withdrew the parent, and for 26 the refs name the redirect TARGET,
	//   a different lemma. Ruled by Brian 2026-08-28. See
	//   data/patches/catalogue-audit/abbrev-headword-stub.md.
	// - `binyan-form-leading-space` (523 occ / 457 ent) and
	//   `binyan-form-empty-slot` (486 slots / 446 ent), batch 6a — 71 to
	//   69, and they are the SECOND and THIRD rows to leave the way
	//   `ascii-gershayim-outside-body-text` did: not withdrawn to
	//   `judgment` for want of a mechanism but DISCARDED because a
	//   mechanism already owns them. `repairs.ts:445 cleanBinyanForms`
	//   trims both edges and drops empty slots corpus-wide inside
	//   `applyRepairs`, upstream of every rule here, and it has done so
	//   since the 06 decision. Measured over all 32,512 entries: 523 → 0
	//   and 486 → 0. A rule for either would have repaired nothing while
	//   its row claimed hundreds. Ruled by Brian 2026-08-28. See
	//   data/patches/catalogue-audit/binyan-form-cleanup.md, and
	//   `body/binyan-cleanup.corpus.test.ts` for the standing gate.
	// - `empty-stem-section` (347 sections / 342 ent), batch 6b — 69 to
	//   68, and it failed none of the three tests above. It failed a
	//   fourth: there is nothing to repair. The label and the form both
	//   reach `BodyStem`, the schema permits `senses: []`, and the shape
	//   mirrors the print heading it came from; the one piece of debris
	//   was the trailing empty `binyan_form` slot, dropped upstream by
	//   `cleanBinyanForms`. What remains is a Phase 4 RENDERING item —
	//   show consecutive senseless stem blocks as one run — so the row
	//   was asserting that a rule was owed before cutover when none is.
	//   Ruled by Brian 2026-08-28 on that distinction, data vs display.
	//   See data/patches/catalogue-audit/empty-stem-section.md.
	// - `empty-lead-sense` (73 `{}` + 11 whitespace = 84) and
	//   `bracketed-gloss-lead-sense` (49), batch 7 — 68 to 66, and they
	//   are ONE finding counted twice. Both describe
	//   `content.senses[0]`, and **index 0 is not a sense**:
	//   `rejoin.ts:44` folds `content.senses[0]?.definition` into the
	//   gloss head, and `dry-run.ts:257` then SKIPS index 0 in the sense
	//   loop, because its content was already captured in the intro
	//   sense. Both rows were catalogued against the SOURCE shape, where
	//   index 0 looks like a stray or malformed sense.
	//
	//   `empty-lead-sense` goes further than `empty-stem-section` did:
	//   its presumed repair is not merely unnecessary but HARMFUL.
	//   Dropping the empty lead promotes `senses[1]` to index 0, where
	//   it is folded into the gloss head by the first line and skipped
	//   by the second — consumed, not moved. Built both ways over all
	//   73: 1 identical, 72 changed, `A00644` going from 4 senses
	//   labelled [—,1,2,3] to 3 labelled [1,2,3]. Neither text gate can
	//   see it: nothing invented, nothing lost, text moved between
	//   fields.
	//
	//   `bracketed-gloss-lead-sense` renders correctly today — `B01152`
	//   builds gloss head "m.(b. h.; ברר) [empty, open] " with labels
	//   [—,1,2], the printed order — and 42 of its 49 carry a
	//   `language_code`, so the bracket is usually one fragment of a
	//   multi-part lead. `judgment` rather than a discard because
	//   asserting no defect EXISTS would need the 49 read against print,
	//   and the 7 bracket-alone leads are the shape that could still be
	//   wrong. Both ruled by Brian 2026-08-29. See
	//   data/patches/catalogue-audit/empty-lead-sense.md and
	//   bracketed-gloss-lead-sense.md.
	it('the catalogue still holds 66 transform rows', () => {
		expect(coverage(catalogue).total).toBe(66);
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
