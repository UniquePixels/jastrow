import { describe, expect, it } from 'bun:test';
import type { Rule } from '../transform/types.ts';
import { composeEntry, TransformFailure } from './compose.ts';
import { readSourceEntries } from './source.ts';
import type { SourceEntry } from './types.ts';

const FIXTURE_PATH = `${import.meta.dir}/fixtures/broken-sequences.jsonl`;

async function loadFixture(rid: string): Promise<SourceEntry> {
	for await (const entry of readSourceEntries(FIXTURE_PATH)) {
		if (entry.rid === rid) {
			return entry;
		}
	}
	throw new Error(`fixture missing: ${rid}`);
}

describe('composeEntry', () => {
	it('heals C01331 and wraps its Hebrew, in that order', async () => {
		const source = await loadFixture('C01331');
		const result = composeEntry(source, undefined);
		expect(result.repairRecords.length).toBeGreaterThan(0);
		expect(
			result.transformRecords.some((r) => r.ruleId === 'bare-rtl-hebrew'),
		).toBe(true);
		expect(result.patchesApplied).toBe(0);
		expect(result.patchProblems).toEqual([]);
		expect(result.carryOver).toEqual({ absorbed: [], carried: [] });
	});

	it('raises TransformFailure when a structural rule breaks its gate', async () => {
		const source = await loadFixture('C01331');
		// `Rule` is { apply, id, phase, allows? }; `TransformResult` needs
		// `entry` and `records`. A rule that throws is the containment
		// case: composeEntry must surface it as TransformFailure.
		const rogue: Rule = {
			apply: () => {
				throw new Error('rogue rule tripped its own gate');
			},
			id: 'rogue-structural',
			phase: 'structural-repairs',
		};
		expect(() => composeEntry(source, undefined, [rogue])).toThrow(
			TransformFailure,
		);
	});
});
