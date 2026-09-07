import { describe, expect, it } from 'bun:test';
import {
	type Anchor,
	bracket,
	buildAnchors,
	longestIncreasing,
	NGRAM,
	ngramHashes,
	uniquePositions,
} from './align.ts';

const words = (s: string): string[] => s.split(' ');

describe('ngramHashes', () => {
	it('produces one hash per window', () => {
		expect(ngramHashes(words('a b c d e'))).toHaveLength(5 - NGRAM + 1);
	});

	it('is empty when the stream is shorter than one window', () => {
		expect(ngramHashes(words('a b'))).toHaveLength(0);
	});

	it('gives equal hashes for equal windows', () => {
		const h = ngramHashes(words('x a b c d y a b c d'));
		expect(h[1]).toBe(h[6]);
	});
});

describe('uniquePositions', () => {
	it('keeps hashes seen once and drops repeats', () => {
		// "a b c d" occurs at 1 and 6, so it must be dropped; "x a b c" once.
		const uniq = uniquePositions(ngramHashes(words('x a b c d y a b c d')));
		const hashes = ngramHashes(words('x a b c d y a b c d'));
		expect(uniq.has(hashes[1] as number)).toBe(false);
		expect(uniq.get(hashes[0] as number)).toBe(0);
	});
});

describe('longestIncreasing', () => {
	it('keeps a already-monotonic chain intact', () => {
		const a: Anchor[] = [
			{ ocrPos: 1, refPos: 0 },
			{ ocrPos: 5, refPos: 2 },
			{ ocrPos: 9, refPos: 4 },
		];
		expect(longestIncreasing(a)).toEqual(a);
	});

	it('discards an out-of-order anchor', () => {
		const a: Anchor[] = [
			{ ocrPos: 1, refPos: 0 },
			{ ocrPos: 900, refPos: 1 },
			{ ocrPos: 5, refPos: 2 },
			{ ocrPos: 9, refPos: 3 },
		];
		expect(longestIncreasing(a).map((x) => x.ocrPos)).toEqual([1, 5, 9]);
	});

	it('returns empty for no anchors', () => {
		expect(longestIncreasing([])).toEqual([]);
	});
});

describe('buildAnchors', () => {
	it('aligns an OCR stream with noise against the reference', () => {
		const ref = words(
			'the quick brown fox jumps over the lazy dog again and again',
		);
		// Same text, one word corrupted, one dropped.
		const ocr = words(
			'the quick brown fox jumps ovcr the lazy dog again and again',
		);
		const anchors = buildAnchors(ref, ocr);
		expect(anchors.length).toBeGreaterThan(0);
		for (let i = 1; i < anchors.length; i++) {
			expect((anchors[i] as Anchor).refPos).toBeGreaterThan(
				(anchors[i - 1] as Anchor).refPos,
			);
			expect((anchors[i] as Anchor).ocrPos).toBeGreaterThan(
				(anchors[i - 1] as Anchor).ocrPos,
			);
		}
	});

	it('finds nothing between unrelated streams', () => {
		const a = words('alpha beta gamma delta epsilon zeta');
		const b = words('one two three four five six');
		expect(buildAnchors(a, b)).toEqual([]);
	});

	it('tracks a constant offset introduced by inserted text', () => {
		const ref = words('aa bb cc dd ee ff gg hh ii jj kk ll');
		const ocr = words('zz zz zz aa bb cc dd ee ff gg hh ii jj kk ll');
		const anchors = buildAnchors(ref, ocr);
		expect(anchors.length).toBeGreaterThan(0);
		for (const an of anchors) {
			expect(an.ocrPos - an.refPos).toBe(3);
		}
	});
});

describe('bracket', () => {
	const anchors: Anchor[] = [
		{ ocrPos: 10, refPos: 0 },
		{ ocrPos: 20, refPos: 5 },
		{ ocrPos: 30, refPos: 9 },
	];

	it('brackets a position between two anchors', () => {
		const b = bracket(anchors, 7);
		expect(b.before?.refPos).toBe(5);
		expect(b.after?.refPos).toBe(9);
	});

	it('treats an exact hit as before', () => {
		const b = bracket(anchors, 5);
		expect(b.before?.refPos).toBe(5);
		expect(b.after?.refPos).toBe(9);
	});

	it('returns null past each end', () => {
		expect(bracket(anchors, -1).before).toBeNull();
		expect(bracket(anchors, 99).after).toBeNull();
	});
});
