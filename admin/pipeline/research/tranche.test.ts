import { describe, expect, it } from 'bun:test';
import type { SourceEntry } from '../body/types.ts';
import { contentAnchor } from '../patch/schema.ts';
import { maxPatchNumber, renumber, senseIndex } from './tranche.ts';
import type { IngestResult } from './verify.ts';

describe('senseIndex', () => {
	it('walks nested senses in document order with dotted paths', () => {
		const entry: SourceEntry = {
			content: {
				senses: [
					{
						definition: 'first',
						number: '1)',
						senses: [{ definition: 'nested' }],
					},
					{ definition: 'second', number: '—2)' },
				],
			},
			headword: 'x',
			rid: 'A00001',
		};
		expect(senseIndex(entry)).toEqual([
			{ anchor: contentAnchor('first'), number: '1)', path: '0' },
			{ anchor: contentAnchor('nested'), number: '', path: '0.0' },
			{ anchor: contentAnchor('second'), number: '—2)', path: '1' },
		]);
	});
});

describe('maxPatchNumber', () => {
	it('finds the highest valid id and ignores malformed ones', () => {
		expect(maxPatchNumber(['P000003', 'P000117', 'nope', 'P12'])).toBe(117);
		expect(maxPatchNumber([])).toBe(0);
	});
});

describe('renumber', () => {
	it('renumbers patches after the given max and remaps manifests', () => {
		const result = {
			patches: [
				{ id: 'P000001', rid: 'A00001' },
				{ id: 'P000002', rid: 'A00002' },
			],
			problems: [],
			records: [
				{ disposition: 'repaired', patches: ['P000001'], rid: 'A00001' },
				{ disposition: 'repaired', patches: ['P000002'], rid: 'A00002' },
			],
			rejects: [],
		} as unknown as IngestResult;
		const out = renumber(result, 41);
		expect(out.next).toBe(43);
		expect(out.patches.map((p) => p.id)).toEqual(['P000042', 'P000043']);
		expect(out.records.flatMap((r) => r.patches)).toEqual([
			'P000042',
			'P000043',
		]);
	});
});
