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

/** One block row, checked on its own. */
interface Block {
	column: 'a' | 'b';
	first: string;
	last: string;
	letter: string;
	numbers: readonly [first: number, last: number];
	page: number;
}

/** `line` as a block, or a thrown error naming it: not JSON, a column
 * other than `a`/`b`, a page that is not a positive integer, a
 * malformed rid, or a range that runs backwards or across a letter. */
function parseBlock(line: string): Block {
	let row: BlockRow;
	try {
		row = JSON.parse(line) as BlockRow;
	} catch (error) {
		throw new Error(`page index row rejected: ${line}`, { cause: error });
	}
	const { column, page } = row;
	const first = ridParts(row.first);
	const last = ridParts(row.last);
	if (
		(column !== 'a' && column !== 'b') ||
		typeof page !== 'number' ||
		!Number.isInteger(page) ||
		page < 1 ||
		first === undefined ||
		first.letter !== last?.letter ||
		first.number > last.number
	) {
		throw new Error(`page index row rejected: ${line}`);
	}
	return {
		column,
		first: row.first as string,
		last: row.last as string,
		letter: first.letter,
		numbers: [first.number, last.number],
		page,
	};
}

/** Whether `block` follows `previous` in print order: its first rid
 * after the other's last (which is what keeps a rid from being placed
 * twice), its page no earlier, and on the same page a later column,
 * unless a letter starts there (a letter heading splits a page, and the
 * bottom blocks follow the top ones, a after b). */
function follows(block: Block, previous: Block): boolean {
	if (block.first <= previous.last || block.page < previous.page) {
		return false;
	}
	return (
		block.page > previous.page ||
		block.column > previous.column ||
		block.letter !== previous.letter
	);
}

/** rid → page placement, from the block rows in `text`. A row is
 * refused, naming its line, when it is malformed (`parseBlock`) or
 * out of print order (`follows`). */
function parsePageIndex(text: string): Map<string, PagePlacement> {
	const pages = new Map<string, PagePlacement>();
	let previous: Block | undefined;
	for (const line of text.split('\n')) {
		if (line.trim() === '') {
			continue;
		}
		const block = parseBlock(line);
		if (previous !== undefined && !follows(block, previous)) {
			throw new Error(`page index row out of print order: ${line}`);
		}
		const [from, to] = block.numbers;
		for (let n = from; n <= to; n++) {
			pages.set(`${block.letter}${String(n).padStart(5, '0')}`, {
				column: block.column,
				number: block.page,
			});
		}
		previous = block;
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
