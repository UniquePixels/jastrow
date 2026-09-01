import { expect, it } from 'bun:test';
import { parseLabel } from '../../body/labels.ts';
import type { SourceEntry, SourceSense } from '../../body/types.ts';
import { parsePatterns } from '../../research/patterns.ts';
import { RULES } from '../registry.ts';
import { applyTransforms } from '../run.ts';
import { composedEntries, sourceEntries } from './corpus-fixture.ts';
import { strandedDashStarMarker } from './sense-marker.ts';

/**
 * `trailing-em-dash-tail` and `sense-number-outside-closed-grammar`,
 * measured where the rule stands.
 *
 * Everything here is measured on
 * `applyTransforms(applyRepairs(source).entry, 'text-repairs')` — the
 * entry the `structural-repairs` phase actually receives — with the RAW
 * figure asserted alongside wherever the two differ. For the second row
 * that difference is the entire finding: its quarantined tokens are 6
 * raw and **0** here, so a rule written against raw source would have
 * repaired what `applyRepairs` had already fixed.
 *
 * ONE WALK, memoised, in the corpus-tier style `stem.corpus.test.ts`
 * records. Explicit timeouts throughout: bun's 5,000ms default made
 * `anaphora.corpus.test.ts` fail intermittently on a different test each run,
 * a false red that trains a reader to re-run rather than look.
 */

/** The row's PUBLISHED predicate — a definition ending in an em dash,
 * with trailing horizontal whitespace allowed. Wider than the RULE's
 * `endsInStrandedDash`, on purpose: the spaced members are counted here
 * rather than being invisible, and §6 below turns the difference
 * between the two into an assertion. */
const PUBLISHED_TAIL = /—[ \t]*$/u;
/** The rule's own, strict. */
const BARE_TAIL = /—$/u;
const STAR = /^\*\d+\)$/u;

interface Census {
	bareEntries: number;
	/** Senses matching the rule's strict predicate. */
	bareSenses: number;
	/** Tails by successor, split by whether the tail carries whitespace.
	 * Keys are `${'bare' | 'ws'}${'Star' | 'Final' | 'Unnum' | 'Other'}`. */
	bySuccessor: Record<string, string[]>;
	corpusEntries: number;
	/** `—*N)` values already present. */
	preJoined: number;
	/** Entries holding at least one tail under the published predicate. */
	publishedEntries: number;
	/** Senses matching the published predicate. */
	publishedSenses: number;
	/** `number` values that quarantine to `{unknown}`. */
	quarantined: number;
	/** `*N)` markers at sibling position > 0, all of them. */
	starMarkers: number;
	/** `*N)` markers WITHOUT a stranded dash before them — the re-scoped
	 * row. */
	starNoDash: string[];
	/** Every `*N)` token, counted. */
	starTokens: Record<string, number>;
}

function* walk(senses: readonly SourceSense[] | undefined): Generator<{
	sense: SourceSense;
	siblings: readonly SourceSense[];
	i: number;
}> {
	if (senses === undefined) {
		return;
	}
	for (let i = 0; i < senses.length; i++) {
		const sense = senses[i] as SourceSense;
		yield { i, sense, siblings: senses };
		yield* walk(sense.senses);
	}
}

/** Which of the four successor shapes follows a tail. Named rather
 * than nested-ternaried so each arm can be read on its own. */
function successorOf(next: SourceSense | undefined): string {
	if (next === undefined) {
		return 'Final';
	}
	if (next.number === undefined) {
		return 'Unnum';
	}
	return STAR.test(next.number) ? 'Star' : 'Other';
}

/** The `number`-field half of the census: quarantine, the already-joined
 * marker, and the starred markers with and without a dash before them. */
function countNumber(
	c: Census,
	rid: string,
	sense: SourceSense,
	previous: SourceSense | undefined,
): void {
	const { number } = sense;
	if (number === undefined) {
		return;
	}
	if ('unknown' in parseLabel(number)) {
		c.quarantined++;
	}
	if (/^—\*\d+\)$/u.test(number)) {
		c.preJoined++;
	}
	if (!STAR.test(number)) {
		return;
	}
	c.starMarkers++;
	c.starTokens[number] = (c.starTokens[number] ?? 0) + 1;
	if (!PUBLISHED_TAIL.test(previous?.definition ?? '')) {
		c.starNoDash.push(rid);
	}
}

function censusOf(entries: readonly SourceEntry[]): Census {
	const c: Census = {
		bareEntries: 0,
		bareSenses: 0,
		bySuccessor: {
			bareFinal: [],
			bareOther: [],
			bareStar: [],
			bareUnnum: [],
			wsFinal: [],
			wsOther: [],
			wsStar: [],
			wsUnnum: [],
		},
		corpusEntries: entries.length,
		preJoined: 0,
		publishedEntries: 0,
		publishedSenses: 0,
		quarantined: 0,
		starMarkers: 0,
		starNoDash: [],
		starTokens: {},
	};
	for (const entry of entries) {
		let hasPublished = false;
		let hasBare = false;
		for (const { i, sense, siblings } of walk(entry.content.senses)) {
			const { definition } = sense;
			countNumber(c, entry.rid, sense, siblings[i - 1]);
			if (definition === undefined || !PUBLISHED_TAIL.test(definition)) {
				continue;
			}
			hasPublished = true;
			c.publishedSenses++;
			const bare = BARE_TAIL.test(definition);
			if (bare) {
				c.bareSenses++;
				hasBare = true;
			}
			const bucket = `${bare ? 'bare' : 'ws'}${successorOf(siblings[i + 1])}`;
			(c.bySuccessor[bucket] as string[]).push(entry.rid);
		}
		if (hasPublished) {
			c.publishedEntries++;
		}
		if (hasBare) {
			c.bareEntries++;
		}
	}
	return c;
}

const source: readonly SourceEntry[] = await sourceEntries();
/** What the `structural-repairs` phase receives. */
const composed: readonly SourceEntry[] = await composedEntries();
const raw = censusOf(source);
const pre = censusOf(composed);
/** After this rule alone, and after the whole phase — §7 needs both. */
const afterRule = composed.map(
	(entry) => strandedDashStarMarker.apply(entry).entry,
);
const afterPhase = composed.map(
	(entry) => applyTransforms(entry, 'structural-repairs', RULES).entry,
);
const post = censusOf(afterRule);

it('measures the whole corpus', () => {
	expect(pre.corpusEntries).toBe(32_512);
}, 30_000);

// ---- 1. `trailing-em-dash-tail` reproduces its catalogued count ----

it('reproduces 132 senses / 130 entries under the published predicate', () => {
	expect(pre.publishedSenses).toBe(132);
	expect(pre.publishedEntries).toBe(130);
}, 30_000);

// ---- 2. the mechanism, by contrast ----

it('finds the dash before 101 of the 107 starred markers', () => {
	expect(pre.starMarkers).toBe(107);
	expect(pre.bySuccessor['bareStar']).toHaveLength(101);
	expect(pre.bySuccessor['wsStar']).toEqual([]);
}, 30_000);

// ---- 3. the row's residual, which STAYS on the row ----

it('leaves 31 tails with no starred successor, in three shapes', () => {
	expect(pre.bySuccessor['bareFinal']).toHaveLength(16);
	expect(pre.bySuccessor['bareUnnum']).toHaveLength(7);
	expect(pre.bySuccessor['wsOther']).toHaveLength(8);
	expect(pre.bySuccessor['bareOther']).toEqual([]);
	const residual = 16 + 7 + 8;
	expect(residual + 101).toBe(pre.publishedSenses);
}, 30_000);

// ---- 4. `sense-number-outside-closed-grammar` has no population ----

it('finds 6 quarantined tokens raw and 0 after applyRepairs', () => {
	expect(raw.quarantined).toBe(6);
	expect(pre.quarantined).toBe(0);
}, 30_000);

it('parses every starred marker rather than quarantining it', () => {
	expect(pre.starTokens).toEqual({
		'*1)': 3,
		'*2)': 74,
		'*3)': 19,
		'*4)': 9,
		'*5)': 1,
		'*6)': 1,
	});
	for (const token of Object.keys(pre.starTokens)) {
		expect(parseLabel(token)).not.toHaveProperty('unknown');
	}
}, 30_000);

it('re-scopes the row to its 6 residual markers', () => {
	expect([...new Set(pre.starNoDash)].sort()).toEqual([
		'A00510',
		'A02000',
		'B00005',
		'M00591',
		'N01131',
		'P01184',
	]);
}, 30_000);

// ---- 5. what the rule writes is unattested, not ungrammatical ----

it('writes a marker the corpus does not already hold', () => {
	expect(pre.preJoined).toBe(0);
	expect(post.preJoined).toBe(101);
}, 30_000);

// ---- 6. the whitespace tell ----

// A tail carries trailing whitespace IF AND ONLY IF its successor holds
// a bare `N)` marker. Both directions are asserted because the equality
// of the two counts at 8 would otherwise read as coincidence: it is the
// same 8 members, and the space is what distinguishes an upstream STAR
// split from a bare-marker strand `continuation-marker-em-dash-loss`
// owns.
it('splits the two spellings exactly by successor', () => {
	expect(pre.bySuccessor['wsStar']).toEqual([]);
	expect(pre.bySuccessor['wsFinal']).toEqual([]);
	expect(pre.bySuccessor['wsUnnum']).toEqual([]);
	expect(pre.bySuccessor['bareOther']).toEqual([]);
	expect(pre.bySuccessor['wsOther']).toHaveLength(8);
}, 30_000);

// ---- 7. the entanglement edge does not survive the rule ----

// THE DELETION IS PINNED HERE BECAUSE NEITHER GATE CAN WITNESS IT.
// `entangledClusters` derives over REGISTERED rules, so an edge whose
// endpoints are both unregistered — which this one was for the whole of
// Phase 2 until batch 7 — never enters a cluster, and the pinned cluster
// list reads 5 clusters with neither row in any of them BOTH before and
// after the deletion. `unaccountedEdges` excludes both-unregistered
// edges by design. So `registry.ts`'s "only pinning the cluster set
// notices" does not hold for this class, and the assertion below is the
// one thing standing between a measured deletion and a silent one.
it('records the deleted entanglement edge as deleted', async () => {
	const rows = parsePatterns(
		await Bun.file('data/patches/patterns.jsonl').text(),
	);
	const edges = (id: string): readonly string[] =>
		rows.find((row) => row.id === id)?.entangledWith ?? [];
	// THE ASSERTION IS THE ABSENCE OF THIS EDGE, not the absence of all
	// edges. A first version pinned `entangledWith` as `undefined` on
	// both rows, which was stronger than the fact it protects — and the
	// same batch falsified it, when the commutation gate found
	// `trailing-em-dash-tail × continuation-marker-em-dash-loss` and that
	// row correctly gained an edge. Pinning more than the claim needs is
	// how a gate starts failing for reasons it was never about.
	expect(edges('trailing-em-dash-tail')).not.toContain(
		'sense-number-outside-closed-grammar',
	);
	expect(edges('sense-number-outside-closed-grammar')).toEqual([]);
}, 30_000);

it('leaves the two rows’ remainders disjoint, at 0 shared entries', () => {
	const dashes = new Set<string>();
	const stars = new Set<string>();
	for (const entry of afterPhase) {
		for (const { sense } of walk(entry.content.senses)) {
			if (
				sense.definition !== undefined &&
				PUBLISHED_TAIL.test(sense.definition)
			) {
				dashes.add(entry.rid);
			}
			if (sense.number !== undefined && STAR.test(sense.number)) {
				stars.add(entry.rid);
			}
		}
	}
	expect(stars.size).toBe(6);
	expect([...dashes].filter((rid) => stars.has(rid))).toEqual([]);
}, 60_000);

// ---- 8. the rule repairs exactly what it claims ----

it('records 101 repairs and no more', () => {
	let records = 0;
	for (const entry of composed) {
		records += strandedDashStarMarker.apply(entry).records.length;
	}
	expect(records).toBe(101);
}, 60_000);
