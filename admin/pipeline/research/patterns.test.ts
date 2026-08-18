import { describe, expect, it } from 'bun:test';
import {
	addPattern,
	isSaturated,
	type Pattern,
	parsePatterns,
} from './patterns.ts';

function rows(): Pattern[] {
	return [
		{
			corpusCount: 7679,
			description: 'JT href missing leading slash',
			id: 'jt-href-slash',
			round: 0,
			status: 'candidate',
		},
		{
			corpusCount: 312,
			description: 'Ib. anchors resolving to Yoma 2a',
			id: 'ib-yoma-2a',
			round: 1,
			status: 'candidate',
		},
	];
}

describe('parsePatterns', () => {
	it('round-trips JSONL', () => {
		const text = rows()
			.map((r) => JSON.stringify(r))
			.join('\n');
		expect(parsePatterns(text)).toEqual(rows());
	});

	it('ignores blank lines', () => {
		const text = `${JSON.stringify(rows()[0])}\n\n`;
		expect(parsePatterns(text)).toHaveLength(1);
	});
});

describe('addPattern', () => {
	it('appends a new pattern', () => {
		const next = addPattern(rows(), {
			corpusCount: 796,
			description: 'unlinked v. span cross-references',
			id: 'unlinked-v-span',
			round: 2,
			status: 'candidate',
		});
		expect(next).toHaveLength(3);
	});

	it('rejects a duplicate id', () => {
		expect(() =>
			addPattern(rows(), {
				corpusCount: 1,
				description: 'dupe',
				id: 'jt-href-slash',
				round: 2,
				status: 'candidate',
			}),
		).toThrow('jt-href-slash');
	});
});

describe('isSaturated', () => {
	it('is false while a recent round added a pattern', () => {
		expect(isSaturated(rows(), 2)).toBe(false);
	});

	it('is true when the last two rounds added nothing', () => {
		expect(isSaturated(rows(), 3)).toBe(true);
	});
});
