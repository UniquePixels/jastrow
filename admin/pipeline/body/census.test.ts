import { describe, expect, it } from 'bun:test';
import {
	classifyBoundary,
	classifyMalformed,
	labelSequence,
	letteredRun,
	walkSenses,
} from './census.ts';
import type { CitationHit } from './cite.ts';
import type { SourceSense } from './types.ts';

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
	it('strips tags internally before matching', () => {
		expect(letteredRun('x <i>a)</i> one <i>b)</i> two')).toBe(true);
	});
});

describe('walkSenses', () => {
	it('visits nested sub-senses depth-first in document order', () => {
		const senses: SourceSense[] = [
			{
				definition: 'a',
				senses: [
					{
						definition: 'a1',
						senses: [{ definition: 'a1a' }],
					},
					{ definition: 'a2' },
				],
			},
			{ definition: 'b' },
		];
		const order = [...walkSenses(senses)].map((s) => s.definition);
		expect(order).toEqual(['a', 'a1', 'a1a', 'a2', 'b']);
	});
});

describe('classifyMalformed', () => {
	const baseHit: CitationHit = {
		dataRef: '',
		end: 10,
		hadLeadingSlash: false,
		href: 'Sanh. 39a',
		kind: 'external',
		malformed: true,
		start: 0,
	};
	const freshTally = (): {
		nestedDuplicate: number;
		recoveredLoss: number;
		runawayHref: number;
	} => ({
		nestedDuplicate: 0,
		recoveredLoss: 0,
		runawayHref: 0,
	});

	it('flags runawayHref even when the next hit is adjacent and identical', () => {
		const hit: CitationHit = { ...baseHit, href: 'Sanh. 39<a' };
		const next: CitationHit = { ...baseHit, href: 'Sanh. 39<a', start: 10 };
		const malformed = freshTally();
		classifyMalformed(hit, next, malformed);
		expect(malformed).toEqual({ ...freshTally(), runawayHref: 1 });
	});

	it('flags nestedDuplicate when the next hit starts at this hit end with an identical href', () => {
		const next: CitationHit = { ...baseHit, start: 10 };
		const malformed = freshTally();
		classifyMalformed(baseHit, next, malformed);
		expect(malformed).toEqual({ ...freshTally(), nestedDuplicate: 1 });
	});

	it('flags recoveredLoss for everything else', () => {
		const malformed = freshTally();
		// No next hit at all.
		classifyMalformed(baseHit, undefined, malformed);
		// Next hit exists but doesn't start where this one ends.
		classifyMalformed(baseHit, { ...baseHit, start: 11 }, malformed);
		// Next hit starts at this one's end but carries a different href.
		classifyMalformed(
			baseHit,
			{ ...baseHit, start: 10, href: 'Sanh. 40a' },
			malformed,
		);
		expect(malformed).toEqual({ ...freshTally(), recoveredLoss: 3 });
	});
});
