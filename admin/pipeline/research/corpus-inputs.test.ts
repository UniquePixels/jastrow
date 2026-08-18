import { describe, expect, it } from 'bun:test';
import type { SourceEntry } from '../body/types.ts';
import { buildChunkInput, senseIndex } from './corpus-inputs.ts';

function entry(rid: string, definition: string): SourceEntry {
	return {
		content: { senses: [{ definition, number: '1)' }] },
		headword: 'ראש',
		rid,
	} as SourceEntry;
}

describe('buildChunkInput', () => {
	it('carries chunk id, tranche, pin, prompt version and entries', () => {
		const input = buildChunkInput({
			chunk: { id: 'chunk-00001', rids: ['X00001'] },
			entries: new Map([['X00001', entry('X00001', 'a definition')]]),
			hints: {},
			pin: 'sha256:abc',
			promptVersion: 'v4',
			tranche: 'tranche-01',
		});
		expect(input.chunkId).toBe('chunk-00001');
		expect(input.tranche).toBe('tranche-01');
		expect(input.pin).toBe('sha256:abc');
		expect(input.promptVersion).toBe('v4');
		expect(input.entries).toHaveLength(1);
	});

	it('attaches a precomputed sense index per rid', () => {
		const input = buildChunkInput({
			chunk: { id: 'chunk-00001', rids: ['X00001'] },
			entries: new Map([['X00001', entry('X00001', 'a definition')]]),
			hints: {},
			pin: 'sha256:abc',
			promptVersion: 'v4',
			tranche: 'tranche-01',
		});
		expect(input.sense_index['X00001']?.[0]?.number).toBe('1)');
	});

	it('omits hint entries for rids with no findings', () => {
		const input = buildChunkInput({
			chunk: { id: 'chunk-00001', rids: ['X00001'] },
			entries: new Map([['X00001', entry('X00001', 'a definition')]]),
			hints: {},
			pin: 'sha256:abc',
			promptVersion: 'v4',
			tranche: 'tranche-01',
		});
		expect(input.anomaly_hints).toEqual({});
	});
});

describe('senseIndex', () => {
	it('walks nested senses with dotted paths', () => {
		const e = {
			content: {
				senses: [
					{
						definition: 'outer',
						number: '1)',
						senses: [{ definition: 'inner', number: 'a)' }],
					},
				],
			},
			headword: 'ראש',
			rid: 'X00001',
		} as SourceEntry;
		expect(senseIndex(e).map((r) => r.path)).toEqual(['0', '0.0']);
	});
});
