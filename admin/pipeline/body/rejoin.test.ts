import { describe, expect, it } from 'bun:test';
import type { SourceEntry } from '../types.ts';
import { rejoinGlossHead, splitGlossHead } from './rejoin.ts';
import { parseSourceEntry } from './source.ts';

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
		expect(joined).toBe('m. (b. h.; אבה) , const. x');
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

describe('rejoinGlossHead: the space between fields (review ledger L69)', () => {
	// O01360 (`סְפִינָה`), as the import composes it (P000257's join
	// folds the `2)` into sense 0): no field spaces its edge, and print
	// reads `f. (b. h.; v. ספן 2) [storage,] freight-ship` (1013b).
	it('sets the space print sets between fields neither of which spaces its edge (O01360)', () => {
		const link =
			'<a dir="rtl" class="refLink" href="/Jastrow,_סָפַן.1" data-ref="Jastrow, סָפַן 1">סָפַן</a>';
		const e = entry({
			languageCode: '(b. h.;',
			languageReference: `v. ${link}`,
			morphology: 'f.',
			sense0: '2) [<i>storage</i>,] <i>freight-ship</i>. ',
		});
		const { joined } = rejoinGlossHead(e);
		expect(joined).toBe(
			`f. (b. h.; v. ${link} 2) [<i>storage</i>,] <i>freight-ship</i>. `,
		);
	});

	it('reads the seam on the visible text, past the tags at either edge', () => {
		const e = entry({
			languageReference: ' ch. <a class="refLink" href="/x">same</a>',
			sense0: '<i>to tie</i>. ',
		});
		expect(rejoinGlossHead(e).joined).toBe(
			' ch. <a class="refLink" href="/x">same</a> <i>to tie</i>. ',
		);
	});

	it('sets no space where a field already spaces its edge', () => {
		const e = entry({
			languageCode: '(b. h. ',
			languageReference: '<span dir="rtl">אבדן</span>)',
			morphology: 'm.',
			sense0: ' <i>ruin</i>',
		});
		expect(rejoinGlossHead(e).joined).toBe(
			'm. (b. h. <span dir="rtl">אבדן</span>) <i>ruin</i>',
		);
	});
});

describe('rejoinGlossHead: where print sets two fields tight', () => {
	it.each([
		[
			'punctuation print sets hard against a word',
			'same</a>',
			', <i>to grow</i>',
		],
		['a dash', 'same</a>.', '—Pl. x'],
		['a closing paren', 'x', ') y'],
		['an opening paren before it', 'x (', 'y'],
		['a number cut between fields', 'Gen. IV, 2', '2) y'],
		['a geresh closing an abbreviation', 'ק', '׳ y'],
	])('sets no space before or after %s', (_name, left, right) => {
		const e = entry({ languageReference: left, sense0: right });
		expect(rejoinGlossHead(e).joined).toBe(left + right);
	});

	it('sets no space beside a field that is only tags or empty', () => {
		const e = entry({
			languageCode: '<i></i>',
			morphology: 'm.',
			sense0: ' x',
		});
		expect(rejoinGlossHead(e).joined).toBe('m.<i></i> x');
	});

	it('round-trips through the offsets when a space was set between fields', () => {
		const e = entry({
			languageCode: '(b. h.;',
			languageReference: 'v. x',
			morphology: 'm.',
			sense0: '<i>tree</i>',
		});
		const { joined, offsets } = rejoinGlossHead(e);
		expect(joined).toBe('m. (b. h.; v. x <i>tree</i>');
		expect(splitGlossHead(joined, offsets)).toEqual({
			languageCode: '(b. h.;',
			languageReference: 'v. x',
			morphology: 'm.',
			senseHead: '<i>tree</i>',
		});
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
			expect({ rid: e.rid, ...split }).toEqual({
				rid: e.rid,
				morphology: e.content.morphology ?? '',
				languageCode: e.language_code ?? '',
				languageReference: e.language_reference ?? '',
				senseHead: e.content.senses[0]?.definition ?? '',
			});
			joinedByRid.set(e.rid, joined);
		}

		expect(joinedByRid.get('K00664')).toContain(
			'= <span dir="rtl">כרכר</span>, v. ',
		);
	});
});
