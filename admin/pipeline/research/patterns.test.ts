import { describe, expect, it } from 'bun:test';
import {
	addPattern,
	blockingWork,
	checkEntanglement,
	isSaturated,
	type Pattern,
	parsePatterns,
	transformQueue,
} from './patterns.ts';

function rows(): [Pattern, Pattern] {
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

describe('checkEntanglement', () => {
	function pair(a: string[] | undefined, b: string[] | undefined): Pattern[] {
		const [one, two] = rows();
		return [
			{ ...one, ...(a ? { entangledWith: a } : {}) },
			{ ...two, ...(b ? { entangledWith: b } : {}) },
		];
	}

	it('passes a reciprocated pair', () => {
		expect(checkEntanglement(pair(['ib-yoma-2a'], ['jt-href-slash']))).toEqual(
			[],
		);
	});

	it('passes rows with no entanglement', () => {
		expect(checkEntanglement(rows())).toEqual([]);
	});

	it('reports a one-sided edge', () => {
		expect(checkEntanglement(pair(['ib-yoma-2a'], undefined))).toEqual([
			'jt-href-slash -> ib-yoma-2a: not reciprocated',
		]);
	});

	it('reports an unknown id', () => {
		expect(checkEntanglement(pair(['no-such-row'], undefined))).toEqual([
			'jt-href-slash: entangled with unknown id no-such-row',
		]);
	});

	it('reports a self-link', () => {
		expect(checkEntanglement(pair(['jt-href-slash'], undefined))).toEqual([
			'jt-href-slash: entangled with itself',
		]);
	});
});

describe('blockingWork', () => {
	function triaged(): Pattern[] {
		const [one, two] = rows();
		return [
			{ ...one, blocking: true, route: 'transform' },
			{ ...two, blocking: false, route: 'judgment' },
			{
				corpusCount: 9000,
				description: 'big blocker',
				id: 'big-blocker',
				blocking: true,
				round: 3,
				route: 'transform',
				status: 'candidate',
			},
			{
				corpusCount: 5000,
				description: 'already resolved',
				id: 'resolved',
				blocking: true,
				round: 3,
				route: 'transform',
				status: 'discarded',
			},
		];
	}

	it('keeps only blocking candidates, largest first', () => {
		expect(blockingWork(triaged()).map((r) => r.id)).toEqual([
			'big-blocker',
			'jt-href-slash',
		]);
	});

	it('excludes discarded rows even when blocking', () => {
		expect(blockingWork(triaged()).map((r) => r.id)).not.toContain('resolved');
	});

	it('returns nothing for an untriaged catalogue', () => {
		expect(blockingWork(rows())).toEqual([]);
	});
});

describe('transformQueue', () => {
	function mixed(): Pattern[] {
		const [one, two] = rows();
		return [
			{ ...one, blocking: true, route: 'transform' },
			{ ...two, blocking: false, route: 'judgment' },
			{
				corpusCount: 9000,
				description: 'big non-blocking transform',
				id: 'big-nonblocking',
				blocking: false,
				round: 3,
				route: 'transform',
				status: 'candidate',
			},
		];
	}

	it('keeps non-blocking transforms — blocking gates the cutover, not the work', () => {
		expect(transformQueue(mixed()).map((r) => r.id)).toEqual([
			'big-nonblocking',
			'jt-href-slash',
		]);
	});

	it('excludes judgment rows', () => {
		expect(transformQueue(mixed()).map((r) => r.id)).not.toContain(
			'ib-yoma-2a',
		);
	});
});
