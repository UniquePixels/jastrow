/**
 * The page index (ruling `11-05 page index`): an import input that says
 * which printed page and column each entry begins in.
 *
 * One row per printed block, in print order: its page, its column, and
 * the first and last rid that begin in it. A block is a column, except
 * on a page where a letter changes, whose full-width letter heading
 * splits each column into a top block (the old letter) and a bottom
 * block (the new). A block in which no entry begins has no row. Rid
 * order is print order and rids run without gaps within a letter, so a
 * row's range names every rid in it.
 *
 * After the import an entry file's `page` is the record; nothing reads
 * this file to look a page up later. It holds no scan information: a
 * leaf belongs to one scan, and the evidence scan's offsets live in
 * `patch/scan.ts`.
 */
import { PAGE_INDEX_PATH } from './paths.ts';

/** Where one entry begins in the print: the page number and which of
 * the two columns. */
interface PagePlacement {
	column: 'a' | 'b';
	number: number;
}

interface BlockRow {
	column?: unknown;
	first?: unknown;
	last?: unknown;
	page?: unknown;
}

const RID = /^(?<letter>[A-V])(?<number>\d{5})$/u;

/** A rid's letter and number, or `undefined` for a malformed rid. */
function ridParts(
	rid: unknown,
): { letter: string; number: number } | undefined {
	const m = typeof rid === 'string' ? RID.exec(rid) : null;
	return m?.groups === undefined
		? undefined
		: { letter: m.groups['letter'] ?? '', number: Number(m.groups['number']) };
}

/** rid → page placement, from the block rows in `text`. A row is
 * refused, naming its line, when its column is not `a`/`b`, its page is
 * not a positive integer, its rids are malformed, its range runs
 * backwards or across a letter, or it does not follow the row before
 * it in print order: its first rid after the last row's last, its page
 * no earlier. The last check is what keeps a rid from being placed
 * twice. */
function parsePageIndex(text: string): Map<string, PagePlacement> {
	const pages = new Map<string, PagePlacement>();
	let previous: { last: string; page: number } | undefined;
	for (const line of text.split('\n')) {
		if (line.trim() === '') {
			continue;
		}
		const row = JSON.parse(line) as BlockRow;
		const { column, page } = row;
		const first = ridParts(row.first);
		const last = ridParts(row.last);
		if (
			(column !== 'a' && column !== 'b') ||
			typeof page !== 'number' ||
			!Number.isInteger(page) ||
			page < 1 ||
			first === undefined ||
			last === undefined ||
			first.letter !== last.letter ||
			first.number > last.number
		) {
			throw new Error(`page index row rejected: ${line}`);
		}
		const firstRid = row.first as string;
		if (
			previous !== undefined &&
			(firstRid <= previous.last || page < previous.page)
		) {
			throw new Error(`page index row out of print order: ${line}`);
		}
		for (let n = first.number; n <= last.number; n++) {
			pages.set(`${first.letter}${String(n).padStart(5, '0')}`, {
				column,
				number: page,
			});
		}
		previous = { last: row.last as string, page };
	}
	return pages;
}

/** The page index at `path`, parsed (`parsePageIndex`). */
async function loadPageIndex(
	path = PAGE_INDEX_PATH,
): Promise<Map<string, PagePlacement>> {
	return parsePageIndex(await Bun.file(path).text());
}

export type { PagePlacement };
export { loadPageIndex, parsePageIndex };
