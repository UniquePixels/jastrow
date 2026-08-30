import { expect, it } from 'bun:test';
import { applyRepairs } from '../../body/repairs.ts';
import { readSourceEntries } from '../../body/source.ts';
import type { SourceEntry, SourceSense } from '../../body/types.ts';
import { RULES } from '../registry.ts';
import { applyTransforms } from '../run.ts';
import {
	adjacentRepeat,
	adjacentVerbatimRepeat,
	duplicatedOpeningRun,
	MIN_ADJACENT,
	MIN_OPENING,
	squarePrefix,
} from './duplication.ts';

/**
 * The two duplication rows, measured where the rules stand — on
 * `applyTransforms(applyRepairs(source).entry, 'text-repairs')`, the
 * entry the `structural-repairs` phase receives.
 *
 * Neither row's catalogued figure survived contact with a stated
 * predicate, and the two failed differently:
 *
 * - `duplicated-definition-opening-run` recorded NO predicate at all,
 *   only "the middle and best-argued figure" of three letter filters.
 *   §3 of the batch report states one and rules `k = 4`.
 * - `adjacent-verbatim-repetition` recorded one, and the count that
 *   reproduced it was a LENGTH-CAP ARTEFACT. §10 corrects 59 to 65.
 *
 * Explicit timeouts throughout, per `anaphora.test.ts`'s lesson.
 */

const source: SourceEntry[] = [];
for await (const entry of readSourceEntries()) {
	source.push(entry);
}
const composed = source.map(
	(entry) => applyTransforms(applyRepairs(entry).entry, 'text-repairs').entry,
);

interface Tally {
	codepoints: number;
	entries: Set<string>;
	records: number;
	unlinks: number;
}

function tally(rule: typeof duplicatedOpeningRun): Tally {
	const out: Tally = {
		codepoints: 0,
		entries: new Set<string>(),
		records: 0,
		unlinks: 0,
	};
	for (const entry of composed) {
		const result = rule.apply(entry);
		if (result.records.length === 0) {
			continue;
		}
		out.records += result.records.length;
		out.entries.add(entry.rid);
		out.unlinks += result.unlinks ?? 0;
		for (const removed of result.removes ?? []) {
			out.codepoints += [...removed].length;
		}
	}
	return out;
}

const opening = tally(duplicatedOpeningRun);
const adjacent = tally(adjacentVerbatimRepeat);

/** Every RAW run the rules delete, found with the rules' own predicates.
 *
 * `TransformResult.removes` cannot answer this: it carries the STRIPPED
 * text, because `checkNoLostText` compares `textOf`, which strips tags.
 * The two figures mean different things and both are pinned — the raw
 * run is what a length cap would have truncated and what the anchors
 * live inside; the stripped declaration is what the gate credits. */
function rawRuns(): { adjacent: string[]; opening: string[] } {
	const out = { adjacent: [] as string[], opening: [] as string[] };
	const walk = (senses: readonly SourceSense[]): void => {
		for (const sense of senses) {
			if (sense.senses !== undefined) {
				walk(sense.senses);
			}
			const definition = sense.definition;
			if (definition === undefined) {
				continue;
			}
			const k = squarePrefix(definition);
			if (k > 0) {
				out.opening.push(definition.slice(0, k));
			}
			const hit = adjacentRepeat(definition);
			if (hit !== null) {
				out.adjacent.push(hit.run);
			}
		}
	};
	for (const entry of composed) {
		walk(entry.content.senses);
	}
	return out;
}
const raw = rawRuns();

it('measures the whole corpus', () => {
	expect(composed).toHaveLength(32_512);
}, 30_000);

// ---- the two populations ----

// `k = 4` is the ruling, and 85 ENTRIES is why: it reproduces the
// catalogued figure exactly, which is the only evidence available for
// what the round-3 detector did.
it('repairs 88 opening runs across 85 entries', () => {
	expect(MIN_OPENING).toBe(4);
	expect(opening.records).toBe(88);
	expect(opening.entries.size).toBe(85);
	// RAW run vs the STRIPPED declaration the gate credits.
	expect(raw.opening).toHaveLength(88);
	expect(raw.opening.reduce((n, r) => n + [...r].length, 0)).toBe(3357);
	expect(opening.codepoints).toBe(939);
}, 60_000);

// 65, NOT the catalogued 59 — see the cap assertion below.
it('repairs 65 adjacent runs across 65 entries', () => {
	expect(MIN_ADJACENT).toBe(8);
	expect(adjacent.records).toBe(65);
	expect(adjacent.entries.size).toBe(65);
	expect(raw.adjacent).toHaveLength(65);
	expect(raw.adjacent.reduce((n, r) => n + [...r].length, 0)).toBe(2771);
	expect(adjacent.codepoints).toBe(1799);
}, 60_000);

// ---- 88 ALONE, 89 COMPOSED, and the difference is the entanglement ----

// `strandedStemHead` moves a stem label out of `content.senses[0]` and
// the remainder into a child sense, which brings a duplicated run to
// OFFSET 0 where this rule can see it. On `R00223` that is the entire
// difference, and it is why the two rows are declared `entangledWith`
// each other and why `registry.order.test.ts` pins the DIRECTION.
//
// Pinning both numbers is the point. `bun transform:count` measures
// every rule ALONE against the pinned snapshot, so it reports 88 and
// would keep reporting 88 with the order reversed and the repair at
// `R00223` silently not happening — the exact blindness batch 4 found.
it('repairs 89 composed, one more than it can find alone', () => {
	const counts = new Map<string, number>();
	for (const entry of composed) {
		for (const record of applyTransforms(entry, 'structural-repairs', RULES)
			.records) {
			counts.set(record.ruleId, (counts.get(record.ruleId) ?? 0) + 1);
		}
	}
	expect(counts.get('duplicated-definition-opening-run')).toBe(89);
	expect(counts.get('adjacent-verbatim-repetition')).toBe(65);
	expect(opening.records).toBe(88);
}, 300_000);

// ---- the cap artefact, pinned as the split that identifies it ----

// A capped detector does not shorten a long member, it LOSES it: only
// the full run repeats immediately, because a proper suffix of the first
// copy is followed by the second copy's prefix. The catalogued 59 is
// exactly the members whose run fits in 120 characters, and that exact
// split is what identifies the cap as the cause rather than merely
// fitting it.
it('accounts for the catalogued 59 as the members under a 120-char cap', () => {
	// Measured on the RAW run, which is what a cap over the definition
	// string would have truncated — not on the stripped declaration.
	const short = raw.adjacent.filter((run) => run.length <= 120).length;
	const long = raw.adjacent.filter((run) => run.length > 120).length;
	expect(short).toBe(59);
	expect(long).toBe(6);
	expect(short + long).toBe(adjacent.records);
}, 60_000);

// ---- anchors ----

it('declares every anchor it removes', () => {
	expect(opening.unlinks).toBe(30);
	expect(adjacent.unlinks).toBe(11);
}, 30_000);

// ---- the boundary between the two rows ----

// The disjointness is POSITIONAL, not entry-level, and stating it the
// other way would be false: one entry holds a member of each. An
// earlier draft claimed "0 entries", measured while the opening rule was
// still at `k = 8`.
it('shares exactly one entry, whose two runs are different', () => {
	const shared = [...opening.entries].filter((rid) =>
		adjacent.entries.has(rid),
	);
	expect(shared).toEqual(['I00509']);
	const entry = composed.find((e) => e.rid === 'I00509') as SourceEntry;
	const a = duplicatedOpeningRun.apply(entry).removes as readonly string[];
	const b = adjacentVerbatimRepeat.apply(entry).removes as readonly string[];
	expect(a).not.toEqual(b);
}, 30_000);

it('composes to the same entry in either order on that entry', () => {
	const entry = composed.find((e) => e.rid === 'I00509') as SourceEntry;
	const ab = adjacentVerbatimRepeat.apply(
		duplicatedOpeningRun.apply(entry).entry,
	).entry;
	const ba = duplicatedOpeningRun.apply(
		adjacentVerbatimRepeat.apply(entry).entry,
	).entry;
	expect(ab).toEqual(ba);
}, 30_000);
