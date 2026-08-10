import { describe, expect, it } from 'bun:test';
import { IMPLIED_ONE_CENSUS } from './implied-one-census.ts';
import { buildImpliedOneDoc, planWrites } from './review.ts';

describe('planWrites', () => {
	const docs = { 'a.md': 'alpha\n', 'b.md': 'beta\n' };

	it('missing files are written', () => {
		expect(planWrites(docs, new Map(), false)).toEqual({
			refused: [],
			unchanged: [],
			writes: ['a.md', 'b.md'],
		});
	});

	it('byte-identical files need no write', () => {
		const existing = new Map([
			['a.md', 'alpha\n'],
			['b.md', 'beta\n'],
		]);
		expect(planWrites(docs, existing, false)).toEqual({
			refused: [],
			unchanged: ['a.md', 'b.md'],
			writes: [],
		});
	});

	it('a differing file is refused without force', () => {
		const existing = new Map([
			['a.md', 'alpha\n\n| A00913 | ALL approved |\n'],
			['b.md', 'beta\n'],
		]);
		expect(planWrites(docs, existing, false)).toEqual({
			refused: ['a.md'],
			unchanged: ['b.md'],
			writes: [],
		});
	});

	it('force overwrites differing files', () => {
		const existing = new Map([['a.md', 'alpha edited\n']]);
		expect(planWrites(docs, existing, true)).toEqual({
			refused: [],
			unchanged: [],
			writes: ['a.md', 'b.md'],
		});
	});
});

describe('buildImpliedOneDoc (doc 08, S3 census equality)', () => {
	const rowFor = (
		rid: string,
	): { excerpt: string; headword: string; rid: string } => ({
		excerpt: 'v. אוֹר.**—2)** to shine',
		headword: 'טֶסְט',
		rid,
	});

	it('renders exactly one row per committed census rid', () => {
		const text = buildImpliedOneDoc([...IMPLIED_ONE_CENSUS].map(rowFor));
		for (const rid of IMPLIED_ONE_CENSUS) {
			expect(text).toContain(`| [${rid}](https://jastrow.app/#rid:${rid}) |`);
		}
		expect(text).toContain(`(${IMPLIED_ONE_CENSUS.length} entries)`);
	});

	it('throws when a census rid is missing from the rows', () => {
		const rows = [...IMPLIED_ONE_CENSUS].slice(1).map(rowFor);
		expect(() => buildImpliedOneDoc(rows)).toThrow(/missing: \[/u);
	});

	it('throws on a row outside the census', () => {
		const rows = [...IMPLIED_ONE_CENSUS].map(rowFor);
		rows.push(rowFor('Z99999'));
		expect(() => buildImpliedOneDoc(rows)).toThrow(/extra: \[Z99999\]/u);
	});
});
