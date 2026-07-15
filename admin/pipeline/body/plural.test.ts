import { describe, expect, it } from 'bun:test';
import { walkSenses } from './census.ts';
import { splitLettered } from './lettered.ts';
import type { PluralParts } from './plural.ts';
import { joinPlural, splitPlural } from './plural.ts';
import { readSourceEntries } from './source.ts';
import type { SourceEntry } from './types.ts';

const FIXTURES = 'admin/pipeline/body/fixtures/plural.jsonl';

/** The 25 rids the design census's coarse detector flags (task report):
 * only these 5 carry a genuine, paren-clear ascending run and actually
 * split — the other 20 are single spurious `(citation N)` matches (see
 * plural.ts's header comment). Shared between the fixture sweep below and
 * the "no collateral" sweep over every other fixture class. */
const EXPECTED_SPLIT_RIDS = ['A01047', 'B01292', 'C00062', 'D00194', 'E00789'];

async function loadFixtures(path: string): Promise<SourceEntry[]> {
	const entries: SourceEntry[] = [];
	for await (const entry of readSourceEntries(path)) {
		entries.push(entry);
	}
	return entries;
}

function findFixture(entries: SourceEntry[], rid: string): SourceEntry {
	const entry = entries.find((e) => e.rid === rid);
	if (entry === undefined) {
		throw new Error(`fixture missing: ${rid}`);
	}
	return entry;
}

/** Asserts a split happened and hands back the non-null parts, so
 * callers don't need an `if` guard around a follow-up `expect()`. */
function assertSplit(text: string): PluralParts {
	const parts = splitPlural(text);
	if (parts === null) {
		throw new Error(`expected a split for: ${text}`);
	}
	return parts;
}

/** The text a definition presents to `splitPlural` in the real
 * composition (design §3 order): after `lettered.ts`'s split, on its
 * resulting head — mirrors `dry-run.ts`'s `buildTextSense`. */
function pluralInputHead(definition: string): string {
	const lettered = splitLettered(definition);
	return lettered ? lettered.head : definition;
}

interface SweepMismatch {
	detail: string;
	rid: string;
	senseIndex: number;
}

interface SweepResult {
	mismatches: SweepMismatch[];
	splitRids: string[];
}

/** Runs splitPlural/joinPlural over every sense in `entries` (through the
 * same lettered-head narrowing the real composition uses) and reports,
 * per rid + senseIndex, any split that didn't round-trip — so a failure
 * names the offending entry instead of just failing on the first
 * mismatch encountered. Mirrors lettered.test.ts's `sweepFixtures`. */
function sweepFixtures(entries: SourceEntry[]): SweepResult {
	const mismatches: SweepMismatch[] = [];
	const splitRids = new Set<string>();
	for (const entry of entries) {
		let senseIndex = 0;
		for (const sense of walkSenses(entry.content.senses)) {
			const head = pluralInputHead(sense.definition ?? '');
			const parts = splitPlural(head);
			if (parts !== null) {
				splitRids.add(entry.rid);
				const got = joinPlural(parts);
				if (got !== head) {
					mismatches.push({ detail: got, rid: entry.rid, senseIndex });
				}
			}
			senseIndex++;
		}
	}
	return {
		mismatches,
		splitRids: [...splitRids].sort((a, b) => a.localeCompare(b)),
	};
}

describe('splitPlural', () => {
	it('splits a C00062-shaped —Pl. block with a restarted 1)…2)…3) run', () => {
		const text =
			'<i>high age</i>, v. infra.—Pl. <span dir="rtl">גְּבוּרוֹת</span> 1) <i>manifestations of Divine power</i> (that we should call Him <a class="refLink" href="/x">גבור</a>)?—2) <i>second def</i>.—3) <i>third def</i>.';
		const parts = assertSplit(text);
		expect(parts.host).toBe('<i>high age</i>, v. infra.');
		expect(parts.intro).toBe('—Pl. <span dir="rtl">גְּבוּרוֹת</span> ');
		expect(parts.items.map((i) => i.label)).toEqual(['1', '2', '3']);
		expect(joinPlural(parts)).toBe(text);
	});

	it('does not split plain Pl. prose with no numbered run', () => {
		expect(
			splitPlural('a. fr.—Pl. אבות, no numbering here at all.'),
		).toBeNull();
	});

	it('does not split when only a 2) follows Pl. (run must start at 1)', () => {
		expect(
			splitPlural('a. fr.—Pl. אבות 2) second only, without an earlier item.'),
		).toBeNull();
	});

	it('does not count a digit run closing a real parenthetical citation', () => {
		// The exact shape that fooled the census's coarse detector on 20 of
		// its 25 candidates (task report): "(R. Joḥ. 1)" is a citation
		// (Lam. R. introd., R. Joḥanan §1), not a restarted-list marker —
		// the "1" closes a paren that opened before it, so paren balance is
		// nonzero right at the ")" and the marker is rejected.
		const text =
			'gravel, sand.—Pl. <span dir="rtl">חֲצָצֵי</span>. Lam. R. introd. (R. Joh. 1) you have to walk over rocks.';
		expect(splitPlural(text)).toBeNull();
	});

	it('accepts a genuine single-item run (no 2) required)', () => {
		const text = 'sing.—Pl. formY 1) only sense.';
		const parts = assertSplit(text);
		expect(parts.items.map((i) => i.label)).toEqual(['1']);
	});

	it('round-trips through joinPlural', () => {
		const text = 'host text.—Pl. form 1) first—2) second';
		const parts = assertSplit(text);
		expect(joinPlural(parts)).toBe(text);
	});
});

describe('fixture sweep (fixtures/plural.jsonl)', () => {
	it('splits exactly the 5 measured rids; every hit round-trips; the other 20 stay whole', async () => {
		const entries = await loadFixtures(FIXTURES);
		expect(entries.length).toBe(25);

		const { mismatches, splitRids } = sweepFixtures(entries);
		expect(mismatches).toEqual([]);
		// Measured against the full 32,512-entry corpus (task report): the
		// design census's coarse detector flags 25 candidate entries, but
		// only these 5 carry a genuine paren-clear ascending run — see
		// plural.ts's header comment for why the other 20 are excluded.
		expect(splitRids).toEqual(EXPECTED_SPLIT_RIDS);
	});

	it("C00062's tail-of-sense-3 block splits into 1)/2)/3), print-verified", async () => {
		const entries = await loadFixtures(FIXTURES);
		const entry = findFixture(entries, 'C00062');
		const definition = entry.content.senses[1]?.definition ?? '';
		const head = pluralInputHead(definition);
		const parts = assertSplit(head);
		expect(parts.items.map((i) => i.label)).toEqual(['1', '2', '3']);
		expect(joinPlural(parts)).toBe(head);
	});
});

describe('no collateral: every other fixture class', () => {
	const OTHER_FIXTURES = [
		'baseline',
		'broken-sequences',
		'lettered',
		'origin-splits',
		'orphans',
		'quotes-stragglers',
		'stems',
		'units-hard',
	];

	for (const cls of OTHER_FIXTURES) {
		it(`${cls}.jsonl: splitPlural never fires outside the measured set`, async () => {
			const entries = await loadFixtures(
				`admin/pipeline/body/fixtures/${cls}.jsonl`,
			);
			const { mismatches, splitRids } = sweepFixtures(entries);
			expect(mismatches).toEqual([]);
			// broken-sequences.jsonl happens to also carry C00062 (it's
			// fixtured there for its own top-level 1)/—3) sequence gap) —
			// the only rid, across every other fixture class, that this
			// module is expected to split.
			const unexpected = splitRids.filter(
				(rid) => !EXPECTED_SPLIT_RIDS.includes(rid),
			);
			expect(unexpected).toEqual([]);
		});
	}
});
