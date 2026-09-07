/**
 * The OCR side of the alignment: the book's text blocks in reading order.
 *
 * A normal page is two blocks, column a then column b. A page where Jastrow
 * changes letter is **four**: he does not break at the column, so the old
 * letter runs across both columns above a full-width heading and the new
 * letter across both below. Reading order there is a-top, b-top, a-bottom,
 * b-bottom.
 *
 * Parsing is split from stream-building because the caller needs two passes:
 * the first tells it which pages carry a letter change, the second rebuilds the
 * stream with those pages correctly ordered.
 */

import { lineText, readHocrPages } from './hocr.ts';
import { analysePage, type Column } from './layout.ts';
import { latinTokens } from './spine.ts';

/** Which part of a letter-divided page a block covers. */
type Band = 'bottom' | 'full' | 'top';

interface ColumnRecord {
	/** Which part of a letter-divided page this block covers. */
	readonly band: Band;
	readonly column: Column;
	/** Guide word OCR'd from the header, as-is. */
	readonly guide: string;
	/** Zero-based page index within the volume's hOCR. */
	readonly leaf: number;
	readonly printedPage: number;
	/** Half-open token range `[start, end)` in the volume's OCR stream. */
	readonly tokenEnd: number;
	readonly tokenStart: number;
	readonly volume: number;
}

interface VolumeStream {
	readonly columns: readonly ColumnRecord[];
	/** `printedPage - leaf`, derived from the OCR'd page numbers. */
	readonly offset: number;
	/** Every Latin token in the volume, in reading order. */
	readonly tokens: readonly string[];
	readonly volume: number;
}

/** One line reduced to what the stream builder needs. */
interface LeafLine {
	readonly text: string;
	readonly y: number;
}

/** A parsed leaf, kept so the stream can be rebuilt without re-parsing. */
interface RawLeaf {
	readonly guideLeft: string;
	readonly guideRight: string;
	readonly leaf: number;
	readonly linesA: readonly LeafLine[];
	readonly linesB: readonly LeafLine[];
	readonly printedPage: number | null;
}

/** Page numbers OCR'd from a header, keyed by leaf. */
type PageNumbers = ReadonlyMap<number, number>;

/**
 * Derive the constant `printedPage - leaf` offset for a volume.
 *
 * Tesseract reads the small header numerals wrong often enough (it read p.227
 * as "237") that the modal difference is used rather than any single reading.
 */
function deriveOffset(pageNumbers: PageNumbers): number {
	const counts = new Map<number, number>();
	for (const [leaf, printed] of pageNumbers) {
		const d = printed - leaf;
		counts.set(d, (counts.get(d) ?? 0) + 1);
	}
	let best = 0;
	let bestCount = -1;
	for (const [d, n] of counts) {
		if (n > bestCount) {
			best = d;
			bestCount = n;
		}
	}
	return best;
}

/** Parse a volume's hOCR once into per-leaf lines. */
async function readLeaves(path: string): Promise<RawLeaf[]> {
	const leaves: RawLeaf[] = [];
	for await (const page of readHocrPages(path)) {
		const lay = analysePage(page);
		const toLines = (col: Column): LeafLine[] =>
			lay.body[col].map((l) => ({ text: lineText(l), y: l.bbox[1] }));
		leaves.push({
			guideLeft: lay.guideLeft,
			guideRight: lay.guideRight,
			leaf: page.index,
			linesA: toLines('a'),
			linesB: toLines('b'),
			printedPage: lay.printedPage,
		});
	}
	return leaves;
}

function tokensOf(lines: readonly LeafLine[]): string[] {
	return latinTokens(lines.map((l) => l.text).join(' '));
}

interface BlockSpec {
	readonly band: Band;
	readonly column: Column;
	readonly lines: readonly LeafLine[];
}

/**
 * The blocks of one leaf, in reading order.
 *
 * Without a letter band that is simply column a then column b. With one, the
 * page reads across both columns above the heading before either column below
 * it, so the two columns interleave.
 */
function blocksOf(leaf: RawLeaf, split: number | null): BlockSpec[] {
	if (split === null) {
		return [
			{ band: 'full', column: 'a', lines: leaf.linesA },
			{ band: 'full', column: 'b', lines: leaf.linesB },
		];
	}
	const above = (ls: readonly LeafLine[]): LeafLine[] =>
		ls.filter((l) => l.y < split);
	const below = (ls: readonly LeafLine[]): LeafLine[] =>
		ls.filter((l) => l.y >= split);
	return [
		{ band: 'top', column: 'a', lines: above(leaf.linesA) },
		{ band: 'top', column: 'b', lines: above(leaf.linesB) },
		{ band: 'bottom', column: 'a', lines: below(leaf.linesA) },
		{ band: 'bottom', column: 'b', lines: below(leaf.linesB) },
	];
}

/**
 * Assemble the volume's token stream and block table.
 *
 * `bands` maps a leaf to the y of its letter heading; leaves absent from it are
 * treated as ordinary two-column pages.
 */
function buildStream(
	leaves: readonly RawLeaf[],
	volume: number,
	bands: ReadonlyMap<number, number>,
): VolumeStream {
	const pageNumbers = new Map<number, number>();
	for (const leaf of leaves) {
		if (leaf.printedPage !== null) {
			pageNumbers.set(leaf.leaf, leaf.printedPage);
		}
	}
	const offset = deriveOffset(pageNumbers);

	const tokens: string[] = [];
	const columns: ColumnRecord[] = [];
	for (const leaf of leaves) {
		for (const block of blocksOf(leaf, bands.get(leaf.leaf) ?? null)) {
			const tokenStart = tokens.length;
			for (const t of tokensOf(block.lines)) {
				tokens.push(t);
			}
			columns.push({
				band: block.band,
				column: block.column,
				guide: block.column === 'a' ? leaf.guideLeft : leaf.guideRight,
				leaf: leaf.leaf,
				printedPage: leaf.leaf + offset,
				tokenEnd: tokens.length,
				tokenStart,
				volume,
			});
		}
	}
	return { columns, offset, tokens, volume };
}

/** Read one volume's hOCR into per-block token slices. */
async function readVolume(
	path: string,
	volume: number,
	bands: ReadonlyMap<number, number> = new Map(),
): Promise<VolumeStream> {
	return buildStream(await readLeaves(path), volume, bands);
}

/**
 * The block containing a token offset, or null if the offset falls in a block
 * that yielded no tokens at all.
 */
function columnAt(
	columns: readonly ColumnRecord[],
	pos: number,
): ColumnRecord | null {
	let lo = 0;
	let hi = columns.length - 1;
	while (lo <= hi) {
		const mid = Math.floor((lo + hi) / 2);
		const c = columns[mid] as ColumnRecord;
		if (pos < c.tokenStart) {
			hi = mid - 1;
		} else if (pos >= c.tokenEnd) {
			lo = mid + 1;
		} else {
			return c;
		}
	}
	return null;
}

export type { Band, ColumnRecord, LeafLine, RawLeaf, VolumeStream };
export {
	blocksOf,
	buildStream,
	columnAt,
	deriveOffset,
	readLeaves,
	readVolume,
};
