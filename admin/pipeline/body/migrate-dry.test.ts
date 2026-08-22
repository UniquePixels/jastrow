import { describe, expect, it } from 'bun:test';
import { applyTransforms } from '../transform/run.ts';
import type { Rule } from '../transform/types.ts';
import {
	assertNoStructuralRules,
	createReport,
	healAndTransform,
} from './migrate-dry.ts';
import { applyRepairs } from './repairs.ts';
import { readSourceEntries } from './source.ts';
import type { SourceEntry } from './types.ts';

const FIXTURE_PATH = `${import.meta.dir}/fixtures/broken-sequences.jsonl`;

/** Loads one fixtured entry by rid. C01331 carries both a `repairs.ts`
 * marker-reinsert find-text and a bare RTL Hebrew run the
 * `bare-rtl-hebrew` transform wraps — the one entry, today, whose
 * repair breaks if a rule ever runs before it. */
async function loadFixture(rid: string): Promise<SourceEntry> {
	for await (const entry of readSourceEntries(FIXTURE_PATH)) {
		if (entry.rid === rid) {
			return entry;
		}
	}
	throw new Error(`fixture missing: ${rid}`);
}

describe('healAndTransform — transform-spec §2 ordering contract', () => {
	it('repairs before transforms: C01331 heals and its Hebrew gets wrapped', async () => {
		const source = await loadFixture('C01331');
		const report = createReport();
		const { entry } = healAndTransform(source, report);
		const definition = entry.content.senses[0]?.definition ?? '';
		expect(definition).toContain(
			'(cmp. I <span dir="rtl">גָּרָב</span> 1),] 1) <i>griva</i>, a dry measure',
		);
	});

	it('is loud, not silent, if the order were ever reversed (C01331)', async () => {
		const source = await loadFixture('C01331');
		// What a reversed `healAndTransform` would do: transform first,
		// repair second. `bare-rtl-hebrew` wraps C01331's bare גָּרָב
		// before `repairs.ts`'s exactly-once find-text assertion ever
		// sees it, so the marker-reinsert find-text no longer matches.
		// Pinning this failure is the regression guard — the ordering
		// contract is enforced today by exactly this one entry.
		const transformedFirst = applyTransforms(source, 'text-repairs').entry;
		expect(() => applyRepairs(transformedFirst)).toThrow(/matched 0×/u);
	});
});

describe('assertNoStructuralRules', () => {
	it('passes for the committed RULES (all text-repairs today)', () => {
		expect(() => assertNoStructuralRules()).not.toThrow();
	});

	it('throws loudly the moment a rule targets structural-repairs', () => {
		const structural: Rule = {
			apply: (entry: SourceEntry) => ({ entry, records: [] }),
			id: 'fixture-structural-rule',
			phase: 'structural-repairs',
		};
		expect(() => assertNoStructuralRules([structural])).toThrow(
			/structural-repairs rule\(s\) registered/u,
		);
	});
});
