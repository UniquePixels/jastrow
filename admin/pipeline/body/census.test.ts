import { describe, expect, it } from 'bun:test';
import { classifyBoundary, labelSequence, letteredRun } from './census.ts';

describe('classifyBoundary', () => {
	it('buckets the text before a citation', () => {
		expect(classifyBoundary('…father. ')).toBe('period');
		expect(classifyBoundary('…a. fr.—')).toBe('dash');
		expect(classifyBoundary('…39ᵇ; ')).toBe('semicolon');
		expect(classifyBoundary('x, ')).toBe('comma');
		expect(classifyBoundary('(play on ')).toBe('embedded');
		expect(classifyBoundary('')).toBe('sense-start');
		expect(classifyBoundary('<i>father</i>. ')).toBe('period');
	});
});

describe('labelSequence', () => {
	it('extracts numeric sequence from sense numbers', () => {
		expect(labelSequence(['1)', '—2)', '—3)'])).toEqual([1, 2, 3]);
	});
	it('flags broken sequences', () => {
		expect(labelSequence(['—2)'])).toEqual([2]);
	});
});

describe('letteredRun', () => {
	it('detects an a)…b) run in plain text', () => {
		expect(letteredRun('x a) one b) two')).toBe(true);
		expect(letteredRun('(a) parenthesized only')).toBe(false);
		expect(letteredRun('only a) alone')).toBe(false);
	});
});
