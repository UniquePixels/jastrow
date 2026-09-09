/** Page lookup (migrate spec §2.5) from the hOCR page index. */
const PAGE_INDEX_PATH = 'data/page-index/entries.jsonl';

interface PagePlacement {
	column: 'a' | 'b';
	confidence: 'high' | 'low' | 'medium';
	number: number;
}

interface IndexRow {
	column?: string;
	confidence?: string;
	page?: number;
	rid?: string;
}

/** rid → page placement, from the hOCR page index. A row with a
 * column other than `a`/`b`, an unknown confidence, or a non-integer
 * or non-positive page throws, naming the offending line. `checkPages`
 * (gate 8) only checks that every corpus rid HAS a page row — it
 * cannot see a rid that has TWO. `Map.set` would silently let a
 * second row for a rid replace the first, changing which page an
 * entry gets without ever failing a gate; refused here instead. */
async function loadPageIndex(
	path = PAGE_INDEX_PATH,
): Promise<Map<string, PagePlacement>> {
	const pages = new Map<string, PagePlacement>();
	for (const line of (await Bun.file(path).text()).split('\n')) {
		if (line.trim() === '') {
			continue;
		}
		const row = JSON.parse(line) as IndexRow;
		const { column, confidence, rid } = row;
		const number = row.page;
		if (
			typeof rid !== 'string' ||
			(column !== 'a' && column !== 'b') ||
			(confidence !== 'high' &&
				confidence !== 'medium' &&
				confidence !== 'low') ||
			typeof number !== 'number' ||
			!Number.isInteger(number) ||
			number < 1
		) {
			throw new Error(`page index row rejected: ${line}`);
		}
		if (pages.has(rid)) {
			throw new Error(`page index row rejected: duplicate rid ${rid}`);
		}
		pages.set(rid, { column, confidence, number });
	}
	return pages;
}

export type { PagePlacement };
export { loadPageIndex, PAGE_INDEX_PATH };
