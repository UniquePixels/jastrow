import { describe, expect, it } from 'bun:test';
import { linesOf, parseSourceEntry, readSourceEntries } from './source.ts';
import type { SourceEntry } from './types.ts';

const TEST_DIR = '.cache/test';

async function* chunksOf(parts: Uint8Array[]): AsyncGenerator<Uint8Array> {
	await Promise.resolve();
	yield* parts;
}

describe('parseSourceEntry', () => {
	it('parses the fields the body model consumes', () => {
		const line = JSON.stringify({
			_id: { $oid: 'x' },
			rid: 'A00014',
			headword: 'אָב II',
			parent_lexicon: 'Jastrow Dictionary',
			language_code: '(b. h.;',
			language_reference: ' אבה)',
			content: {
				morphology: 'm.',
				senses: [
					{ definition: 'd0' },
					{ number: '1)', definition: 'd1' },
					{
						grammar: { verbal_stem: 'Nif.', binyan_form: ['נֶאֱבַד'] },
						senses: [{ definition: 'dn' }],
					},
				],
			},
		});
		const e = parseSourceEntry(line);
		expect(e.rid).toBe('A00014');
		expect(e.content.morphology).toBe('m.');
		expect(e.content.senses).toHaveLength(3);
		expect(e.content.senses[2]?.grammar?.verbal_stem).toBe('Nif.');
	});
});

describe('linesOf', () => {
	it('reassembles a line split mid-entry across chunk boundaries', async () => {
		const bytes = new TextEncoder().encode('line one\nline two\nline three');
		const chunks = chunksOf([bytes.subarray(0, 12), bytes.subarray(12)]);
		const lines: string[] = [];
		for await (const line of linesOf(chunks)) {
			lines.push(line);
		}
		expect(lines).toEqual(['line one', 'line two', 'line three']);
	});

	it('reassembles a multi-byte Hebrew character split across a chunk boundary', async () => {
		// 'אָב' is aleph + qamats (combining mark) + bet, each 2 UTF-8
		// bytes. Byte 6 is aleph's lead byte (0xd7); byte 7 is its
		// continuation byte (0x90) — splitting there straddles the
		// character mid-byte, not just mid-line.
		const bytes = new TextEncoder().encode('first\nאָב\nthird');
		const chunks = chunksOf([bytes.subarray(0, 7), bytes.subarray(7)]);
		const lines: string[] = [];
		for await (const line of linesOf(chunks)) {
			lines.push(line);
		}
		expect(lines).toEqual(['first', 'אָב', 'third']);
	});

	it('yields a final line that has no trailing newline', async () => {
		const bytes = new TextEncoder().encode('only\nno trailing newline');
		const chunks = chunksOf([bytes]);
		const lines: string[] = [];
		for await (const line of linesOf(chunks)) {
			lines.push(line);
		}
		expect(lines).toEqual(['only', 'no trailing newline']);
	});

	it('skips a blank interior line, leaving it out of the results', async () => {
		const bytes = new TextEncoder().encode('one\n\ntwo');
		const chunks = chunksOf([bytes]);
		const lines: string[] = [];
		for await (const line of linesOf(chunks)) {
			lines.push(line);
		}
		expect(lines).toEqual(['one', '', 'two']);
	});
});

describe('readSourceEntries', () => {
	it('reads rids and fields from a JSONL fixture with a blank line and no trailing newline', async () => {
		const entries: SourceEntry[] = [
			{
				rid: 'A00001',
				headword: 'אָב',
				content: { senses: [{ definition: 'father' }] },
			},
			{
				rid: 'A00002',
				headword: 'שָׁלוֹם',
				content: { senses: [{ definition: 'peace' }] },
			},
			{
				rid: 'A00003',
				headword: 'תּוֹרָה',
				content: { senses: [{ definition: 'law, teaching' }] },
			},
		];
		const body = [
			JSON.stringify(entries[0]),
			JSON.stringify(entries[1]),
			'',
			JSON.stringify(entries[2]),
		].join('\n');
		const path = `${TEST_DIR}/source-fixture.jsonl`;
		await Bun.write(path, body);

		const seen: SourceEntry[] = [];
		for await (const entry of readSourceEntries(path)) {
			seen.push(entry);
		}

		expect(seen.map((entry) => entry.rid)).toEqual([
			'A00001',
			'A00002',
			'A00003',
		]);
		expect(seen[0]?.headword).toBe('אָב');
		expect(seen[2]?.content.senses[0]?.definition).toBe('law, teaching');
	});
});
