/**
 * Gates on the seed list itself. The generator is only as trustworthy
 * as `SEED_CONFIRMED`, and that list is a claim about a document a
 * maintainer signed — so the claim is checked against the document
 * rather than restated here.
 */
import { describe, expect, it } from 'bun:test';
import { IMPLIED_ONE_CENSUS } from '../body/implied-one-census.ts';
import type { SourceEntry } from '../body/types.ts';
import { parsePatch } from './schema.ts';
import { impliedHost, SEED_CONFIRMED, seedPair } from './seed-implied-one.ts';

const DOC = 'docs/v2/body-review/08-implied-one-candidates.md';

/** Doc 08's Decision column, keyed by rid. Parsed from the committed
 * table so a decision reversal shows up as a failing test rather than
 * as a patch nobody re-read. */
async function decisions(): Promise<Map<string, string>> {
	const text = await Bun.file(DOC).text();
	const rows = new Map<string, string>();
	for (const line of text.split('\n')) {
		if (!line.startsWith('|')) {
			continue;
		}
		const cells = line.slice(1, -1).split('|');
		const rid = cells[0]?.match(/([A-Z]\d{5})/u)?.[1];
		const decision = cells.at(-1)?.trim();
		if (rid !== undefined && decision !== undefined) {
			rows.set(rid, decision.toLowerCase());
		}
	}
	return rows;
}

/** A minimal composed entry in the implied shape: one unnumbered
 * sense whose definition carries a single in-text `—2)`. */
function entryWith(definition: string): SourceEntry {
	return {
		content: { senses: [{ definition }] },
		headword: 'טֶסְט',
		rid: 'T99999',
	};
}

describe('SEED_CONFIRMED', () => {
	it('is sorted, unique, and 28 rids', () => {
		expect([...SEED_CONFIRMED].sort((a, b) => a.localeCompare(b))).toEqual([
			...SEED_CONFIRMED,
		]);
		expect(new Set(SEED_CONFIRMED).size).toBe(SEED_CONFIRMED.length);
		expect(SEED_CONFIRMED).toHaveLength(28);
	});

	it('is a subset of the committed census', () => {
		const census = new Set(IMPLIED_ONE_CENSUS);
		expect(SEED_CONFIRMED.filter((rid) => !census.has(rid))).toEqual([]);
	});

	it('names only rows doc 08 records as confirmed', async () => {
		const rows = await decisions();
		const wrong = SEED_CONFIRMED.filter(
			(rid) => !(rows.get(rid) ?? '').startsWith('confirm'),
		);
		expect(wrong).toEqual([]);
	});
});

describe('seedPair', () => {
	it('splits at the marker and retags the host it leaves behind', () => {
		const definition = 'v. אוֹר.—2) <i>to shine</i>. Ber. 2ᵃ.';
		const pair = seedPair(entryWith(definition), 92);
		const [split, retag] = pair.patches;
		expect(split?.['op']).toBe('split');
		expect(split?.['expected_before']).toBe(definition);
		expect(split?.['payload']).toEqual({ marker: '—2)' });
		expect(retag?.['op']).toBe('retag');
		expect(retag?.['expected_before']).toBe('v. אוֹר.');
		expect(retag?.['payload']).toEqual({ number: '1)' });
	});

	it('mints consecutive ids from the one it is given', () => {
		const pair = seedPair(entryWith('a.—2) b.'), 200);
		expect(pair.patches.map((patch) => patch['id'])).toEqual([
			'P000200',
			'P000201',
		]);
	});

	it('emits records the patch schema accepts', () => {
		for (const patch of seedPair(entryWith('a.—2) b.'), 92).patches) {
			expect(() => parsePatch(patch)).not.toThrow();
		}
	});

	it('refuses an entry that is not in the implied shape', () => {
		expect(() => impliedHost(entryWith('1) a.—2) b.'))).not.toThrow();
		expect(() => impliedHost(entryWith('a.—2) b.—2) c.'))).toThrow(
			/occurs 2 times/u,
		);
		expect(() => impliedHost(entryWith('a. b.'))).toThrow(/found 0/u);
	});
});
