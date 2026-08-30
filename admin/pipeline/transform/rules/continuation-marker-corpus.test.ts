import { expect, it } from 'bun:test';
import { applyRepairs } from '../../body/repairs.ts';
import { readSourceEntries } from '../../body/source.ts';
import type { SourceEntry, SourceSense } from '../../body/types.ts';
import { stripTags } from '../no-new-text.ts';
import { RULES } from '../registry.ts';
import { applyTransforms } from '../run.ts';
import {
	BARE,
	continuationMarkerDash,
	DASHED,
	hasWitness,
	NOT_OURS,
} from './continuation-marker.ts';

/** The rule's own exclusion predicate, asserted here so the arm tests
 * below cannot drift from what the rule actually refuses. */
const REFUSES = (previous: string): boolean => NOT_OURS.test(previous);

/**
 * `continuation-marker-em-dash-loss`, measured after the WHOLE
 * `structural-repairs` phase — the only place its population is
 * meaningful, because three of its four arms belong to rules that run
 * in that phase.
 *
 * The decomposition below IS the row's disposition: it is the fourth
 * reconstruction of a count that has never reproduced, and pinning all
 * four arms is what makes the split between the 14 that ship and the 22
 * that stay an assertion rather than a claim.
 */

function* levels(
	senses: readonly SourceSense[] | undefined,
): Generator<readonly SourceSense[]> {
	if (senses === undefined) {
		return;
	}
	yield senses;
	for (const sense of senses) {
		yield* levels(sense.senses);
	}
}

/** The entry THIS RULE receives: the whole structural phase run with
 * this rule held out.
 *
 * Running the full phase would be self-erasing — the 14 members would
 * already carry their dash by census time and land in `withDash`, so
 * every assertion below would read 0 and pass for the wrong reason. That
 * is 6c's `stem-corpus.test.ts` defect, a test whose subject became
 * implicit once the world grew, and it showed up here on the first run. */
const OTHERS = RULES.filter(
	(rule) => rule.id !== 'continuation-marker-em-dash-loss',
);
const composed: SourceEntry[] = [];
for await (const entry of readSourceEntries()) {
	composed.push(
		applyTransforms(
			applyTransforms(applyRepairs(entry).entry, 'text-repairs').entry,
			'structural-repairs',
			OTHERS,
		).entry,
	);
}

const arms = { dash: 0, bracket: 0, mixed: 0, run: 0, unmixed: 0, withDash: 0 };
let refusalAgrees = true;
const mixedRids: string[] = [];
const unmixedRids: string[] = [];
for (const entry of composed) {
	for (const siblings of levels(entry.content.senses)) {
		const witnessed = hasWitness(siblings);
		for (let i = 1; i < siblings.length; i++) {
			const number = siblings[i]?.number;
			if (number === undefined) {
				continue;
			}
			if (DASHED.test(number)) {
				arms.withDash++;
				continue;
			}
			if (!BARE.test(number) || Number(number.slice(0, -1)) <= 1) {
				continue;
			}
			const previous = stripTags(siblings[i - 1]?.definition ?? '');
			// Every arm below that is NOT this row's must be one the rule
			// refuses, and every one that IS must not be.
			if (/—[ \t]*$/u.test(previous)) {
				arms.dash++;
			} else if (/\[[ \t]*$/u.test(previous)) {
				arms.bracket++;
			} else if (/[;,][ \t]*$/u.test(previous)) {
				arms.run++;
			} else if (witnessed) {
				arms.mixed++;
				mixedRids.push(entry.rid);
				refusalAgrees &&= !REFUSES(previous);
			} else {
				arms.unmixed++;
				unmixedRids.push(entry.rid);
				refusalAgrees &&= !REFUSES(previous);
			}
		}
	}
}

it('measures the whole corpus', () => {
	expect(composed).toHaveLength(32_512);
}, 30_000);

// THE FOUR-WAY DECOMPOSITION, and three of the four are not this row.
//
// MEASURED WHERE THE RULE STANDS, which is not where the row was
// catalogued. Before the structural phase the "dash stranded on the
// previous sibling" arm is 109; after it, **8** — because
// `strandedDashStarMarker` and `stemHeadMarkerChop`, both shipped by
// this same batch, rejoined 101 of them. The row's largest
// belongs-to-another-row arm was largely repaired by its own batch, and
// asserting the pre-phase figure here would pin a number nothing in the
// pipeline ever sees.
it('splits the dashless markers into their four arms', () => {
	expect(arms.dash).toBe(8);
	expect(arms.bracket).toBe(79);
	expect(arms.run).toBe(56);
	expect(arms.mixed + arms.unmixed).toBe(36);
	// The convention itself, for scale: 5,566 markers already carry it.
	expect(arms.withDash).toBe(5566);
	// And the arms this file computes are the ones the RULE draws: no
	// member of either surviving arm is something `NOT_OURS` refuses.
	expect(refusalAgrees).toBe(true);
}, 30_000);

// THE SPLIT THAT SHIPPED. 14 witnessed, 22 not — and the 22 are what
// keeps the row on the queue rather than being emptied by a rule that
// guessed.
it('ships the 14 witnessed and leaves the 22 unwitnessed', () => {
	expect(arms.mixed).toBe(14);
	expect(arms.unmixed).toBe(22);
	let records = 0;
	for (const entry of composed) {
		records += continuationMarkerDash.apply(entry).records.length;
	}
	expect(records).toBe(14);
}, 120_000);

// FOUR OF THE ROW'S SIX NAMED EXAMPLES REPRODUCE; the other two do not,
// and the reason is recorded rather than glossed. `B00411` and `C01321`
// have their bare marker preceded by a definition ending in `[`, so they
// belong to `stranded-open-bracket` under that row's own later audit.
// The catalogue's core of 16 predates that split.
it('reproduces four of the six named examples, and not the two bracket ones', () => {
	const mixed = new Set(mixedRids);
	for (const rid of ['A00441', 'A00842', 'A01047', 'A03174']) {
		expect(mixed).toContain(rid);
	}
	for (const rid of ['B00411', 'C01321']) {
		expect(mixed).not.toContain(rid);
	}
}, 30_000);

// The witness is what the `copied` declaration is verified against, so
// every repair must carry one.
it('declares one copied dash per repair, always witnessed', () => {
	for (const entry of composed) {
		const result = continuationMarkerDash.apply(entry);
		if (result.records.length === 0) {
			continue;
		}
		expect(result.copied).toHaveLength(result.records.length);
		expect(new Set(result.copied)).toEqual(new Set(['—']));
	}
	expect(new Set(unmixedRids).size).toBeGreaterThan(0);
}, 120_000);
