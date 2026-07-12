import { describe, expect, it } from 'bun:test';
import { rejoinGlossHead, splitGlossHead } from './rejoin.ts';
import { parseSourceEntry } from './source.ts';
import type { SourceEntry } from './types.ts';

const FIXTURES_DIR = `${import.meta.dir}/fixtures`;

function entry(overrides: {
	languageCode?: string;
	languageReference?: string;
	morphology?: string;
	sense0?: string;
}): SourceEntry {
	return {
		content: {
			...(overrides.morphology === undefined
				? {}
				: { morphology: overrides.morphology }),
			senses: [
				...(overrides.sense0 === undefined
					? []
					: [{ definition: overrides.sense0 }]),
			],
		},
		headword: 'x',
		...(overrides.languageCode === undefined
			? {}
			: { language_code: overrides.languageCode }),
		...(overrides.languageReference === undefined
			? {}
			: { language_reference: overrides.languageReference }),
		rid: 'X00000',
	};
}

async function loadFixture(name: string): Promise<SourceEntry[]> {
	const text = await Bun.file(`${FIXTURES_DIR}/${name}`).text();
	return text
		.split('\n')
		.filter((line) => line.trim() !== '')
		.map((line) => parseSourceEntry(line));
}

describe('rejoinGlossHead', () => {
	it('joins marker + both language fields + sense-1 in print order', () => {
		const e = entry({
			languageCode: '(b. h.;',
			languageReference: ' אבה)',
			morphology: 'm.',
			sense0: ' , const. x',
		});
		const { joined } = rejoinGlossHead(e);
		expect(joined).toBe('m.(b. h.; אבה) , const. x');
	});

	it('heals the K00664-style mid-phrase paren straddle', () => {
		const e = entry({
			languageReference: ' c. (b. h.; = כרכר',
			sense0: ', v. x) [circle,] more',
		});
		const { joined } = rejoinGlossHead(e);
		expect(joined).toContain('= כרכר, v. x)');
	});

	it('round-trips split(rejoin(e)) byte-for-byte, including empty/missing fields', () => {
		const e = entry({
			languageCode: '(b. h.;',
			languageReference: ' אבה)',
			morphology: 'm.',
			sense0: ' , const. x',
		});
		const { joined, offsets } = rejoinGlossHead(e);
		const split = splitGlossHead(joined, offsets);
		expect(split.morphology).toBe('m.');
		expect(split.languageCode).toBe('(b. h.;');
		expect(split.languageReference).toBe(' אבה)');
		expect(split.senseHead).toBe(' , const. x');
	});

	it('round-trips an entry with no morphology/language fields at all', () => {
		const e = entry({ sense0: 'just a definition' });
		const { joined, offsets } = rejoinGlossHead(e);
		expect(joined).toBe('just a definition');
		const split = splitGlossHead(joined, offsets);
		expect(split.morphology).toBe('');
		expect(split.languageCode).toBe('');
		expect(split.languageReference).toBe('');
		expect(split.senseHead).toBe('just a definition');
	});
});

describe('rejoinGlossHead fixture sweep', () => {
	it('round-trips every entry in origin-splits.jsonl and baseline.jsonl', async () => {
		const entries = [
			...(await loadFixture('origin-splits.jsonl')),
			...(await loadFixture('baseline.jsonl')),
		];
		expect(entries.length).toBeGreaterThan(0);

		const joinedByRid = new Map<string, string>();
		for (const e of entries) {
			const { joined, offsets } = rejoinGlossHead(e);
			const split = splitGlossHead(joined, offsets);
			expect(split.morphology).toBe(e.content.morphology ?? '');
			expect(split.languageCode).toBe(e.language_code ?? '');
			expect(split.languageReference).toBe(e.language_reference ?? '');
			expect(split.senseHead).toBe(e.content.senses[0]?.definition ?? '');
			joinedByRid.set(e.rid, joined);
		}

		expect(joinedByRid.get('K00664')).toContain(
			'= <span dir="rtl">כרכר</span>, v. ',
		);
	});
});
