#!/usr/bin/env bun
/**
 * Build the headword → printed page + column index for Jastrow (1903).
 *
 * Both volumes are read as one continuous book so the alignment against the
 * spine is globally monotonic, then every spine entry is placed at a token
 * offset and hence in a column. The deliverable is the inverse of that map:
 * for each printed column, the first headword that begins in it.
 *
 * Usage:
 *   bun admin/pipeline/page-index/build.ts --v1 <hocr> --v2 <hocr> [--source <jsonl>] [--out <dir>]
 */

import process from 'node:process';
import {
	type Anchor,
	bracket,
	buildAnchors,
	localSlope,
	upperBound,
} from './align.ts';
import { bandYs, letterPins, resolveBands } from './bands.ts';
import {
	buildStream,
	type ColumnRecord,
	columnAt,
	readLeaves,
	type VolumeStream,
} from './columns.ts';
import { type Confidence, emitIndex, type Placement } from './emit.ts';
import { isNonDecreasing, isotonic } from './monotonic.ts';
import { loadSourceSpine, type SpineEntry } from './spine.ts';

/** A raw, pre-monotonic estimate of where an entry begins in the OCR stream. */
interface Estimate {
	readonly confidence: Confidence;
	/** Token distance to the anchor this estimate came from. */
	readonly distance: number;
	readonly ocrPos: number | null;
}

/** Weight given to a position the page layout fixes outright. */
const PIN_WEIGHT = 1e6;

/** Weight an estimate by how close its anchor was; nearer anchors are firmer. */
function weightOf(est: Estimate): number {
	if (est.ocrPos === null) {
		return 1e-6;
	}
	return 1 / (1 + est.distance);
}

/**
 * Locate an entry's first token in the OCR stream, then name its column.
 *
 * Each bracketing anchor is shifted to the entry start at the *local* OCR-to-
 * reference token ratio. Both the alternatives were tried and both put real
 * entries in the wrong column, each caught by a printed guide word:
 *
 *   - interpolating proportionally between two distant anchors lost p.10's
 *     first headword `אַבְרְקִין` back to p.9b;
 *   - extrapolating from the nearest anchor at slope 1 lost p.19's first
 *     headword `אדריכולין` back to p.18b, because the OCR stream runs about
 *     1.5x the reference and slope 1 therefore always undershoots.
 *
 * Shifting from the nearest anchor at the measured local slope fixes both. The
 * nearer anchor decides; the further one is a second opinion, and the two
 * agreeing is what makes a placement `high`.
 */
function estimate(
	refPos: number,
	anchors: readonly Anchor[],
	columns: readonly ColumnRecord[],
): Estimate {
	const { before, after } = bracket(anchors, refPos);
	if (!(before || after)) {
		return {
			confidence: 'low',
			distance: Number.POSITIVE_INFINITY,
			ocrPos: null,
		};
	}

	// Extrapolate at the local OCR-to-reference token ratio, not at 1:1.
	const slope = localSlope(anchors, upperBound(anchors, refPos));
	const fromBefore = before
		? before.ocrPos + (refPos - before.refPos) * slope
		: null;
	const fromAfter = after
		? after.ocrPos - (after.refPos - refPos) * slope
		: null;
	const distBefore = before ? refPos - before.refPos : Number.POSITIVE_INFINITY;
	const distAfter = after ? after.refPos - refPos : Number.POSITIVE_INFINITY;

	const primary = distAfter <= distBefore ? fromAfter : fromBefore;
	const secondary = distAfter <= distBefore ? fromBefore : fromAfter;
	const distance = Math.min(distBefore, distAfter);
	if (primary === null) {
		return { confidence: 'low', distance, ocrPos: null };
	}
	if (secondary === null) {
		return { confidence: 'low', distance, ocrPos: primary };
	}

	const colPrimary = columnAt(columns, primary);
	const colSecondary = columnAt(columns, secondary);
	const agree =
		colPrimary &&
		colSecondary &&
		colPrimary.leaf === colSecondary.leaf &&
		colPrimary.column === colSecondary.column;
	if (agree) {
		return { confidence: 'high', distance, ocrPos: primary };
	}
	return {
		confidence: distance <= 40 ? 'medium' : 'low',
		distance,
		ocrPos: primary,
	};
}

function arg(name: string, fallback?: string): string {
	const i = process.argv.indexOf(name);
	if (i >= 0 && process.argv[i + 1]) {
		return process.argv[i + 1] as string;
	}
	if (fallback !== undefined) {
		return fallback;
	}
	throw new Error(`missing required argument ${name}`);
}

interface PlaceInput {
	readonly anchors: readonly Anchor[];
	readonly columns: readonly ColumnRecord[];
	/** Positions the page layout fixes outright, by spine index. */
	readonly pins: ReadonlyMap<number, number>;
	readonly refStart: readonly number[];
	readonly spine: readonly SpineEntry[];
}

/**
 * Place every entry, then enforce the one thing the print guarantees.
 *
 * Independent per-entry estimates can come out of order where neighbouring
 * entries lean on different anchors. The print cannot put entry *i+1* before
 * entry *i*, so the estimates are projected onto the nearest non-decreasing
 * sequence before columns are read off them.
 */
function placeAll(input: PlaceInput): Placement[] {
	const { anchors, columns, pins, refStart, spine } = input;
	const estimates = spine.map((e) =>
		estimate(refStart[e.index] as number, anchors, columns),
	);
	let carry = 0;
	const filled = estimates.map((e) => {
		if (e.ocrPos !== null) {
			carry = e.ocrPos;
		}
		return carry;
	});
	// A pinned position is a fact of the layout, so it is given a weight no
	// inferred estimate can outvote; isotonic then moves its neighbours to fit.
	const weights = estimates.map((e, i) =>
		pins.has(i) ? PIN_WEIGHT : weightOf(e),
	);
	for (const [i, pos] of pins) {
		filled[i] = pos;
	}
	const smoothed = isotonic(filled, weights);
	console.error(`  monotonic: ${isNonDecreasing(smoothed) ? 'yes' : 'NO'}`);
	return spine.map((e, i) => {
		const est = estimates[i] as Estimate;
		const column = columnAt(columns, Math.round(smoothed[i] as number));
		const estColumn =
			est.ocrPos === null ? null : columnAt(columns, Math.round(est.ocrPos));
		// Smoothing may move an entry out of the column the anchors agreed on.
		const moved =
			column?.leaf !== estColumn?.leaf || column?.column !== estColumn?.column;
		return {
			column,
			confidence:
				moved && est.confidence === 'high' ? 'medium' : est.confidence,
			entry: e,
		};
	});
}

/** Concatenate the two volumes into one book-wide block table and stream. */
function joinVolumes(
	v1: VolumeStream,
	v2: VolumeStream,
): {
	columns: ColumnRecord[];
	tokens: string[];
} {
	const shift = v1.tokens.length;
	return {
		columns: [
			...v1.columns,
			...v2.columns.map((c) => ({
				...c,
				tokenEnd: c.tokenEnd + shift,
				tokenStart: c.tokenStart + shift,
			})),
		],
		tokens: [...v1.tokens, ...v2.tokens],
	};
}

/** One alignment of the spine against the scans. */
interface AlignedBook {
	anchors: readonly Anchor[];
	columns: ColumnRecord[];
	placements: Placement[];
}

interface AlignInput {
	/** Given the block table, the positions the layout fixes outright. */
	readonly pinsFor?: (
		columns: readonly ColumnRecord[],
	) => ReadonlyMap<number, number>;
	readonly refStart: readonly number[];
	readonly refTokens: readonly string[];
	readonly spine: readonly SpineEntry[];
	readonly volumes: readonly [VolumeStream, VolumeStream];
}

/** Align the spine against a book stream and place every entry. */
function alignBook(input: AlignInput): AlignedBook {
	const { pinsFor, refStart, refTokens, spine, volumes } = input;
	const { columns, tokens } = joinVolumes(volumes[0], volumes[1]);
	const anchors = buildAnchors(refTokens, tokens);
	console.error(`  ${anchors.length} monotonic anchors`);
	const pins = pinsFor ? pinsFor(columns) : new Map<number, number>();
	return {
		anchors,
		columns,
		placements: placeAll({ anchors, columns, pins, refStart, spine }),
	};
}

/** The spine's tokens end to end, plus where each entry starts in them. */
function flattenSpine(spine: readonly SpineEntry[]): {
	refStart: number[];
	refTokens: string[];
} {
	const refTokens: string[] = [];
	const refStart: number[] = [];
	for (const e of spine) {
		refStart.push(refTokens.length);
		for (const t of e.tokens) {
			refTokens.push(t);
		}
	}
	return { refStart, refTokens };
}

async function main(): Promise<void> {
	const outDir = arg('--out', 'data/page-index');
	const spine = loadSourceSpine(
		arg('--source', 'data/source/jastrow-dictionary.jsonl'),
	);

	console.error('loading spine…');
	const { refStart, refTokens } = flattenSpine(spine);
	console.error(`  ${spine.length} entries, ${refTokens.length} tokens`);

	console.error('reading scans…');
	const leaves1 = await readLeaves(arg('--v1'));
	const leaves2 = await readLeaves(arg('--v2'));
	const noBands = new Map<number, number>();
	const plain1 = buildStream(leaves1, 1, noBands);
	const plain2 = buildStream(leaves2, 2, noBands);
	console.error(`  vol1 offset ${plain1.offset}, ${leaves1.length} leaves`);
	console.error(`  vol2 offset ${plain2.offset}, ${leaves2.length} leaves`);

	// Pass 1 — ordinary two-column reading order everywhere.
	console.error('pass 1: aligning…');
	const first = alignBook({
		refStart,
		refTokens,
		spine,
		volumes: [plain1, plain2],
	});

	// Pass 2 — re-read the letter-change pages as four blocks.
	const bands1 = resolveBands(first.placements, leaves1, 1);
	const bands2 = resolveBands(first.placements, leaves2, 2);
	console.error(
		`pass 2: letter bands on ${bands1.size + bands2.size} leaves ` +
			`(vol1 ${[...bands1.keys()].join(',')}; vol2 ${[...bands2.keys()].join(',')})`,
	);
	const r1 = buildStream(leaves1, 1, bandYs(bands1));
	const r2 = buildStream(leaves2, 2, bandYs(bands2));
	const final = alignBook({
		pinsFor: (columns: readonly ColumnRecord[]) => {
			const pins = letterPins(columns, bands1, 1);
			for (const [i, pos] of letterPins(columns, bands2, 2)) {
				pins.set(i, pos);
			}
			console.error(
				`  pinned ${pins.size} letter starts to their lower-left block`,
			);
			return pins;
		},
		refStart,
		refTokens,
		spine,
		volumes: [r1, r2],
	});

	const report = emitIndex({
		columns: final.columns,
		extra: {
			anchors: final.anchors.length,
			letterBandLeaves: bands1.size + bands2.size,
			volumeOffsets: { v1: r1.offset, v2: r2.offset },
		},
		outDir,
		placements: final.placements,
		spine,
	});
	console.error(JSON.stringify(report, null, '\t'));
}

if (import.meta.main) {
	await main();
}

export { estimate };
