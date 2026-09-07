/**
 * Locating the full-width letter headings.
 *
 * When Jastrow starts a new letter mid-page he does not break at the column:
 * the old letter fills the top of the page across both columns, a heading
 * follows, and the new letter fills the bottom across both. Finding those 21
 * headings is what lets those pages be read in the right order.
 *
 * Geometry was tried first and abandoned. Keying on a wide vertical gap in both
 * columns fires on 65 leaves in volume 1 alone, because OCR dropping lines
 * leaves gaps that look identical; tightened until it fired 17 times it still
 * put ה's heading on p.326, every entry of which is ד.
 *
 * What works is the text. Each letter section opens with an essay on the letter
 * itself — "He, the fifth letter of the Alphabet" — and that English OCRs well,
 * so finding that line fixes both the leaf and the height exactly.
 */

import type { ColumnRecord, RawLeaf } from './columns.ts';
import type { Placement } from './emit.ts';
import { latinTokens } from './spine.ts';

/** Leaves either side of the first-pass placement to search for the heading. */
const BAND_SEARCH_RADIUS = 3;

/** Essay tokens compared against a line when locating a letter heading. */
const ESSAY_PROBE = 12;

/** Matching tokens required before a line is accepted as the essay. */
const ESSAY_MIN_HITS = 4;

/**
 * How well a line matches the opening of a letter's essay.
 *
 * Every letter section opens with an essay on the letter itself — "Beth, the
 * second letter of the Alphabet", "He, the fifth letter of the Alphabet" — and
 * that English OCRs well, so the ordinal alone pins which letter it is. Scoring
 * by token overlap avoids hard-coding twenty-two ordinals, including the
 * hyphenated "twenty-first" that Tesseract may or may not split.
 */
function essayScore(line: string, probe: readonly string[]): number {
	const words = new Set(latinTokens(line));
	let hits = 0;
	for (const t of new Set(probe)) {
		if (words.has(t)) {
			hits++;
		}
	}
	return hits;
}

/**
 * Find the line on which a letter's essay begins.
 *
 * That line is the first line of the page's lower band, so its y is exactly
 * where the full-width heading divides the page. This replaced a purely
 * geometric search: co-registered vertical gaps are common enough in ordinary
 * pages that the geometry put ה's heading on p.326, which carries no heading at
 * all — every entry on it is still ד.
 */
function findEssayLine(
	leaves: ReadonlyMap<number, RawLeaf>,
	probe: readonly string[],
	around: number,
): { leaf: number; y: number } | null {
	let best: { leaf: number; y: number } | null = null;
	let bestScore = ESSAY_MIN_HITS - 1;
	for (let d = -BAND_SEARCH_RADIUS; d <= BAND_SEARCH_RADIUS; d++) {
		const leaf = leaves.get(around + d);
		if (!leaf) {
			continue;
		}
		// The essay always opens the lower-left block.
		for (const line of leaf.linesA) {
			const score = essayScore(line.text, probe);
			if (score > bestScore) {
				bestScore = score;
				best = { leaf: leaf.leaf, y: line.y };
			}
		}
	}
	return best;
}

/**
 * Decide which leaves carry a letter heading, and where.
 *
 * A letter change is a fact of the spine, and the first pass says roughly which
 * leaf it lands on; the essay line then fixes the leaf and the height exactly.
 * The opening letter of the book is skipped — nothing precedes א, so no heading
 * divides a page for it.
 */
function resolveBands(
	placements: readonly Placement[],
	leaves: readonly RawLeaf[],
	volume: number,
): Map<number, LetterBand> {
	const byLeaf = new Map<number, RawLeaf>();
	for (const leaf of leaves) {
		byLeaf.set(leaf.leaf, leaf);
	}

	const bands = new Map<number, LetterBand>();
	let lastLetter = '';
	for (const p of placements) {
		const letter = p.entry.letter;
		if (letter === lastLetter) {
			continue;
		}
		const isFirstLetter = lastLetter === '';
		lastLetter = letter;
		if (isFirstLetter || p.column?.volume !== volume) {
			continue;
		}
		const { column, entry } = p;
		const probe = entry.tokens.slice(0, ESSAY_PROBE);
		const hit = findEssayLine(byLeaf, probe, column.leaf);
		if (hit && !bands.has(hit.leaf)) {
			bands.set(hit.leaf, { entryIndex: entry.index, y: hit.y });
		}
	}
	return bands;
}

/** A letter heading found on a leaf, and the entry that follows it. */
interface LetterBand {
	/** Spine index of the first entry of the new letter. */
	readonly entryIndex: number;
	/** Y of the heading within the scan. */
	readonly y: number;
}

/** Just the heading positions, which is all the stream builder needs. */
function bandYs(bands: ReadonlyMap<number, LetterBand>): Map<number, number> {
	const out = new Map<number, number>();
	for (const [leaf, b] of bands) {
		out.set(leaf, b.y);
	}
	return out;
}

/**
 * Positions the layout fixes outright, rather than leaving to the alignment.
 *
 * On a letter-change page the new letter begins at the top of the lower-left
 * block — that is what the full-width heading means. Left to inference the
 * first entry lands a few tokens early, in the `b-top` block that immediately
 * precedes it in reading order, which reported ב as starting in column b on
 * p.134 when the scan plainly shows it in column a.
 */
function letterPins(
	columns: readonly ColumnRecord[],
	bands: ReadonlyMap<number, LetterBand>,
	volume: number,
): Map<number, number> {
	const pins = new Map<number, number>();
	for (const col of columns) {
		if (col.volume !== volume || col.band !== 'bottom' || col.column !== 'a') {
			continue;
		}
		const band = bands.get(col.leaf);
		if (band) {
			pins.set(band.entryIndex, col.tokenStart);
		}
	}
	return pins;
}

export type { LetterBand };
export { bandYs, essayScore, findEssayLine, letterPins, resolveBands };
