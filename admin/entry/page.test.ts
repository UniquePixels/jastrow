import { describe, expect, it } from 'bun:test';
import { loadPageIndex } from './page.ts';

describe('loadPageIndex', () => {
	it('maps rid to page and column', async () => {
		const pages = await loadPageIndex(
			`${import.meta.dir}/fixtures/page-index.jsonl`,
		);
		expect(pages.get('O00511')).toEqual({
			column: 'b',
			confidence: 'medium',
			number: 973,
		});
		expect(pages.size).toBe(2);
	});
	it('throws naming the rid for a column other than a/b', async () => {
		await expect(
			loadPageIndex(
				`${import.meta.dir}/fixtures/page-index-invalid-column.jsonl`,
			),
		).rejects.toThrow(/A00001/u);
	});
	it('throws naming the rid for a non-integer page', async () => {
		await expect(
			loadPageIndex(
				`${import.meta.dir}/fixtures/page-index-invalid-page.jsonl`,
			),
		).rejects.toThrow(/A00002/u);
	});
	it('refuses a duplicate rid', async () => {
		await expect(
			loadPageIndex(`${import.meta.dir}/fixtures/page-index-duplicate.jsonl`),
		).rejects.toThrow(/duplicate rid A00000/u);
	});
});
