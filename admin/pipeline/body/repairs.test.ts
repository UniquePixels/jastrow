import { describe, expect, it } from 'bun:test';
import type { SourceEntry } from '../types.ts';
import { applyRepairs } from './repairs.ts';
import { readSourceEntries } from './source.ts';

const FIXTURE = `${import.meta.dir}/fixtures/broken-sequences.jsonl`;

/** Reads one fixture entry by rid. */
async function fixture(rid: string): Promise<SourceEntry> {
	for await (const entry of readSourceEntries(FIXTURE)) {
		if (entry.rid === rid) {
			return entry;
		}
	}
	throw new Error(`fixture missing: ${rid}`);
}

describe('applyRepairs', () => {
	it('leaves an untouched entry byte-identical and unrecorded', async () => {
		// A01350 has no binyan form to clean, and its reviewed disposition
		// is "confirmed no change" — the pass must not alter a byte.
		const source = await fixture('A01350');
		const { entry, records } = applyRepairs(source);
		expect(records).toEqual([]);
		expect(JSON.stringify(entry)).toBe(JSON.stringify(source));
	});

	it('cleans binyan forms: drops empties, trims stray spaces', () => {
		const synthetic: SourceEntry = {
			content: {
				senses: [
					{
						grammar: { binyan_form: ['אִתְאָחַד', ' אִתָּחַד', ''] },
						senses: [],
					},
				],
			},
			headword: 'x',
			rid: 'X00000',
		};
		const { entry, records } = applyRepairs(synthetic);
		expect(entry.content.senses[0]?.grammar?.binyan_form).toEqual([
			'אִתְאָחַד',
			'אִתָּחַד',
		]);
		expect(records).toEqual([
			expect.objectContaining({ pass: 'binyan-cleanup' }),
		]);
	});
});
