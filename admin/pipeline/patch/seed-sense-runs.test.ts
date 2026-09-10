/**
 * Gates on the follow-up run tranche. The generator is only as
 * trustworthy as `RUN_ROWS`, and every row there encodes a maintainer
 * reading — so the shape of the table is checked here, and the
 * anchors are checked by construction: `runPatches` applies each
 * patch through `applyPatch` before addressing the next.
 */
import { describe, expect, it } from 'bun:test';
import { IMPLIED_ONE_CENSUS } from '../body/implied-one-census.ts';
import type { SourceEntry } from '../body/types.ts';
import { parsePatch } from './schema.ts';
import { SEED_CONFIRMED } from './seed-implied-one.ts';
import { locate, RUN_ROWS, runPatches } from './seed-sense-runs.ts';

/** The six rids the maintainer confirmed on 2026-09-10. `P00816`
 * appears twice in `RUN_ROWS` because it carries two runs. */
const CONFIRMED = ['E00148', 'E00298', 'I00822', 'L00565', 'O01387', 'P00816'];

/** A composed entry with the given top-level sense definitions. */
function entryWith(...definitions: string[]): SourceEntry {
	return {
		content: { senses: definitions.map((definition) => ({ definition })) },
		headword: 'טֶסְט',
		rid: 'T99999',
	};
}

describe('RUN_ROWS', () => {
	it('names exactly the six confirmed rids', () => {
		expect([...new Set(RUN_ROWS.map((row) => row.rid))].sort()).toEqual(
			CONFIRMED,
		);
	});

	it('never claims a rid the implied-one seed also claims', () => {
		// `consolidate` supersedes the earlier tranche's manifest row for
		// a shared rid, silently dropping its patches. P00816 is the row
		// that taught us this; the gate keeps it from recurring.
		const seeded = new Set(SEED_CONFIRMED);
		expect(RUN_ROWS.filter((row) => seeded.has(row.rid))).toEqual([]);
	});

	it('splits by whether the census could see the row at all', () => {
		// The committed census only detects a `—2)` run. `L00565` and
		// `O01387` open at `—3)` with the `2)` marker dropped outright,
		// so no census row exists for them — which is exactly why they
		// went unrepaired. Asserting that keeps someone from "fixing"
		// the census membership check by widening it.
		const census = new Set(IMPLIED_ONE_CENSUS);
		const inCensus = [...new Set(RUN_ROWS.map((row) => row.rid))]
			.filter((rid) => census.has(rid))
			.sort();
		const outside = [...new Set(RUN_ROWS.map((row) => row.rid))]
			.filter((rid) => !census.has(rid))
			.sort();
		expect(inCensus).toEqual(['E00148', 'E00298', 'I00822', 'P00816']);
		expect(outside).toEqual(['L00565', 'O01387']);
	});

	it('declares a run whose split markers ascend', () => {
		for (const row of RUN_ROWS) {
			const markers = row.ops
				.filter((op) => op.kind === 'split')
				.map((op) => Number(/(\d+)/u.exec(op.marker)?.[1]));
			expect(markers).toEqual([...markers].sort((a, b) => a - b));
		}
	});
});

describe('locate', () => {
	it('finds the one sense whose stripped definition opens with the prefix', () => {
		const entry = entryWith('a gloss.', '<i>to regard</i>. more.');
		expect(locate(entry, 'to regard')).toBe(1);
	});

	it('refuses a prefix that matches none or several', () => {
		expect(() => locate(entryWith('a.', 'b.'), 'zz')).toThrow(/matched 0/u);
		expect(() => locate(entryWith('a.', 'a.'), 'a.')).toThrow(/matched 2/u);
	});
});

describe('runPatches', () => {
	it('addresses each op against the state the previous one leaves', () => {
		const row = {
			defectClass: 'missing-number',
			opens: 'to regard.',
			ops: [
				{ kind: 'retag' as const, number: '—2)' },
				{ kind: 'split' as const, marker: '—3)' },
			],
			rationale: 'test',
			rid: 'T99999',
		};
		const made = runPatches(
			row,
			entryWith('1) lead.', 'to regard.—3) more.'),
			1,
		);
		const [retag, split] = made.patches;
		expect(retag?.['op']).toBe('retag');
		// The split addresses the sense AFTER the retag numbered it, so
		// its target carries the new token rather than the empty one.
		expect(split?.['target']).toMatch(/^sense\[—2\)\]:/u);
		expect(made.entry.content.senses).toHaveLength(3);
		expect(made.entry.content.senses[2]?.number).toBe('—3)');
	});

	it('moves onto the sibling a split creates', () => {
		const row = {
			defectClass: 'ocr-marker',
			opens: ' l) one.',
			ops: [
				{ find: 'l)', kind: 'replace' as const, with: '1)' },
				{ kind: 'split' as const, marker: '1)' },
				{ kind: 'split' as const, marker: '—2)' },
			],
			rationale: 'test',
			rid: 'T99999',
		};
		const made = runPatches(row, entryWith(' l) one.—2) two.'), 1);
		expect(made.patches.map((patch) => patch['op'])).toEqual([
			'replace',
			'split',
			'split',
		]);
		const numbers = made.entry.content.senses.map((sense) => sense.number);
		expect(numbers).toEqual([undefined, '1)', '—2)']);
		// The OCR glyph is gone from the text, not merely relabelled.
		expect(JSON.stringify(made.entry)).not.toContain('l)');
	});

	it('emits records the patch schema accepts', () => {
		const row = {
			defectClass: 'swallowed-marker',
			opens: 'host.',
			ops: [{ kind: 'split' as const, marker: '—3)' }],
			rationale: 'test',
			rid: 'T99999',
		};
		for (const patch of runPatches(row, entryWith('host.—3) tail.'), 1)
			.patches) {
			expect(() => parsePatch(patch)).not.toThrow();
		}
	});

	it('mints consecutive ids from the one it is given', () => {
		const row = {
			defectClass: 'swallowed-marker',
			opens: 'host.',
			ops: [
				{ kind: 'split' as const, marker: '—3)' },
				{ kind: 'split' as const, marker: '—4)' },
			],
			rationale: 'test',
			rid: 'T99999',
		};
		const made = runPatches(row, entryWith('host.—3) a.—4) b.'), 300);
		expect(made.patches.map((patch) => patch['id'])).toEqual([
			'P000300',
			'P000301',
		]);
	});
});
