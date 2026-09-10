/**
 * Gates on the seed list itself. The generator is only as trustworthy
 * as `SEED_CONFIRMED`, and that list is a claim about a document a
 * maintainer signed — so the claim is checked against the document
 * rather than restated here.
 */
import { describe, expect, it } from 'bun:test';
import { IMPLIED_ONE_CENSUS } from '../body/implied-one-census.ts';
import type { SourceEntry } from '../body/types.ts';
import { parsePatch, senseTarget } from './schema.ts';
import {
	impliedHost,
	runMarkers,
	SEED_CONFIRMED,
	seedRow,
} from './seed-implied-one.ts';

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
		expect(SEED_CONFIRMED).toHaveLength(33);
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

describe('runMarkers', () => {
	it('walks the run and stops at the first missing number', () => {
		expect(runMarkers('T99999', 'a.—2) b.—3) c.—4) d.')).toEqual([
			'—2)',
			'—3)',
			'—4)',
		]);
		// A gap is NOT a short run: splitting at 2 would leave the —4)
		// inside the numbered sibling, invisible to the census.
		expect(() => runMarkers('T99999', 'a.—2) b.—4) c.')).toThrow(
			/sit past the run/u,
		);
		// A verse range is not a marker and must not trip that gate.
		expect(runMarkers('T99999', 'a.—2) b. (Deut. XXXII, 1—43) c.')).toEqual([
			'—2)',
		]);
		expect(runMarkers('T99999', 'a. b.')).toEqual([]);
	});

	it('refuses an ambiguous or out-of-order marker', () => {
		expect(() => runMarkers('T99999', 'a.—2) b.—2) c.')).toThrow(
			/occurs 2 times/u,
		);
		expect(() => runMarkers('T99999', 'a.—3) b.—2) c.')).toThrow(
			/precedes —2\)/u,
		);
	});
});

describe('seedRow', () => {
	it('splits at the marker and retags the host it leaves behind', () => {
		const definition = 'v. אוֹר.—2) <i>to shine</i>. Ber. 2ᵃ.';
		const row = seedRow(entryWith(definition), 92);
		expect(row.patches).toHaveLength(2);
		const [split, retag] = row.patches;
		expect(split?.['op']).toBe('split');
		expect(split?.['expected_before']).toBe(definition);
		expect(split?.['payload']).toEqual({ marker: '—2)' });
		expect(split?.['defect_class']).toBe('implied-one');
		expect(retag?.['op']).toBe('retag');
		expect(retag?.['expected_before']).toBe('v. אוֹר.');
		expect(retag?.['payload']).toEqual({ number: '1)' });
	});

	it('splits every marker in a run, not just the first', () => {
		// The C00805/I00111 shape: a single —2) split would hand `—3)`
		// to a sibling it numbers, where the census cannot see it.
		const row = seedRow(entryWith('a.—2) b.—3) c.'), 92);
		expect(row.patches.map((patch) => patch['op'])).toEqual([
			'split',
			'split',
			'retag',
		]);
		const second = row.patches[1];
		expect(second?.['payload']).toEqual({ marker: '—3)' });
		// The second split addresses the tail the first one creates,
		// which carries the first marker as its number.
		expect(second?.['expected_before']).toBe(' b.—3) c.');
		expect(second?.['target']).toBe(
			senseTarget({
				definition: ' b.—3) c.',
				number: '—2)',
			}),
		);
		expect(second?.['defect_class']).toBe('swallowed-marker');
	});

	it('mints consecutive ids from the one it is given', () => {
		const row = seedRow(entryWith('a.—2) b.'), 200);
		expect(row.patches.map((patch) => patch['id'])).toEqual([
			'P000200',
			'P000201',
		]);
		const longer = seedRow(entryWith('a.—2) b.—3) c.'), 200);
		expect(longer.patches.map((patch) => patch['id'])).toEqual([
			'P000200',
			'P000201',
			'P000202',
		]);
	});

	it('emits records the patch schema accepts', () => {
		for (const patch of seedRow(entryWith('a.—2) b.—3) c.'), 92).patches) {
			expect(() => parsePatch(patch)).not.toThrow();
		}
	});

	it('refuses an entry that is not in the implied shape', () => {
		// A definition that already numbers its first sense carries a
		// complete run: retagging it would number a sense twice.
		expect(() => impliedHost(entryWith('1) a.—2) b.'))).toThrow(/found 0/u);
		expect(() => impliedHost(entryWith('a.—2) b.—2) c.'))).toThrow(
			/occurs 2 times/u,
		);
		expect(() => impliedHost(entryWith('a. b.'))).toThrow(/found 0/u);
	});
});
