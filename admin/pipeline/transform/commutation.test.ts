import { describe, expect, it } from 'bun:test';
import { readSourceEntries } from '../body/source.ts';
import type { SourceEntry } from '../body/types.ts';
import { parsePatterns } from '../research/patterns.ts';
import {
	firingRids,
	nonCommutingPairs,
	type PairStats,
} from './commutation.ts';
import { RULES } from './registry.ts';
import type { Rule, TransformResult } from './types.ts';

const entryOf = (rid: string, definition: string): SourceEntry => ({
	content: { senses: [{ definition }] },
	headword: 'x',
	rid,
});

const editDef = (id: string, fn: (s: string) => string): Rule => ({
	apply(entry: SourceEntry): TransformResult {
		const [sense] = entry.content.senses;
		const before = sense?.definition ?? '';
		const after = fn(before);
		if (after === before) {
			return { entry, records: [] };
		}
		return {
			entry: {
				...entry,
				content: {
					...entry.content,
					senses: [{ ...sense, definition: after }],
				},
			},
			records: [{ detail: after, rid: entry.rid, ruleId: id }],
		};
	},
	id,
	phase: 'text-repairs',
});

const dotToBang = editDef('dot-to-bang', (s) => s.replace(/\.$/u, '!'));
const killLastChar = editDef('kill-last-char', (s) =>
	s === '' ? s : s.slice(0, -1),
);
const upperHead = editDef('upper-head', (s) => s.toUpperCase());

describe('firingRids', () => {
	it('reports only the rids where the rule produced a record', () => {
		const corpus = [
			entryOf('A1', 'ends with a dot.'),
			entryOf('A2', 'ends without one'),
		];
		expect([...firingRids(dotToBang, corpus)]).toEqual(['A1']);
	});
});

describe('nonCommutingPairs', () => {
	it('flags a pair whose two orders disagree on a shared rid', () => {
		// A single trailing dot is not enough to disagree: dot-then-kill
		// and kill-then-dot both land on the same string with the dot
		// stripped either way. Two trailing dots is where the orders
		// split — dot-then-kill leaves one dot behind (it bangs the
		// second, then the kill removes the bang); kill-then-dot removes
		// one dot outright, exposing the other to become a bang.
		const corpus = [entryOf('A1', 'ends with a dot..')];
		const found = nonCommutingPairs([dotToBang, killLastChar], corpus);
		expect(found).toHaveLength(1);
		expect(found[0]?.ids.sort()).toEqual(['dot-to-bang', 'kill-last-char']);
		expect(found[0]?.sampleRid).toBe('A1');
	});

	it('does not flag a pair whose two orders agree', () => {
		const corpus = [entryOf('A1', 'ends with a dot.')];
		expect(nonCommutingPairs([dotToBang, upperHead], corpus)).toEqual([]);
	});

	it('never composes a pair whose firing rids do not intersect', () => {
		// `killLastChar` fires on A2, `dotToBang` does not. The pair has an
		// empty intersection, so it must be skipped WITHOUT composing —
		// asserted by counting apply calls, since composing anyway would
		// still return [] here and hide the missing optimisation.
		let calls = 0;
		const counted: Rule = {
			...dotToBang,
			apply: (e: SourceEntry): TransformResult => {
				calls++;
				return dotToBang.apply(e);
			},
		};
		const corpus = [entryOf('A2', 'no trailing dot')];
		nonCommutingPairs([counted, killLastChar], corpus);
		expect(calls).toBe(1); // the firingRids pass only; no composition pass
	});
});

describe('the registry commutes except where the catalogue says otherwise', () => {
	it('every non-commuting pair is mutually declared entangledWith', async () => {
		const corpus: SourceEntry[] = [];
		for await (const entry of readSourceEntries()) {
			corpus.push(entry);
		}

		const rows = await parsePatterns(
			await Bun.file('data/patches/patterns.jsonl').text(),
		);
		const edges = new Map(
			rows.map((r) => [r.id, new Set(r.entangledWith ?? [])]),
		);
		const declared = (x: string, y: string): boolean =>
			(edges.get(x)?.has(y) ?? false) && (edges.get(y)?.has(x) ?? false);

		const stats: PairStats = { composedPairs: 0, totalPairs: 0 };
		const start = performance.now();
		const pairs = nonCommutingPairs(RULES, corpus, stats);
		const elapsedMs = performance.now() - start;

		const undeclared = pairs.filter((p) => !declared(p.ids[0], p.ids[1]));

		// The pair counts and wall-clock on stdout are this gate's
		// evidence that the rid-set-intersection optimisation is doing
		// its job, not merely claimed — see commutation.ts module doc.
		// biome-ignore lint/suspicious/noConsole: see comment above
		console.log(
			`commutation gate: ${RULES.length} rules, ${stats.totalPairs} unordered pair(s), ` +
				`${stats.composedPairs} composed (rid-set intersection nonempty), ` +
				`${pairs.length} non-commuting, ${undeclared.length} undeclared, ${elapsedMs.toFixed(0)}ms`,
		);

		expect(
			undeclared.map((p) => `${p.ids[0]} × ${p.ids[1]} @ ${p.sampleRid}`),
		).toEqual([]);
	}, 180_000);
});
