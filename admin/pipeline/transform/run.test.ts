import { describe, expect, it } from 'bun:test';
import type { SourceEntry } from '../body/types.ts';
import { applyTransforms } from './run.ts';
import type { Rule } from './types.ts';

function entry(): SourceEntry {
	return {
		content: { senses: [{ definition: 'a b' }] },
		headword: 'x',
		rid: 'A00001',
	};
}

const upper: Rule = {
	apply: (e: SourceEntry) => ({
		entry: { ...e, content: { senses: [{ definition: 'a  b' }] } },
		records: [{ detail: 'spaced', rid: e.rid, ruleId: 'spacer' }],
	}),
	id: 'spacer',
	phase: 'text-repairs',
};

describe('applyTransforms', () => {
	it('skips rules from another phase', () => {
		const out = applyTransforms(entry(), 'structural-repairs', [upper]);
		expect(out.records).toEqual([]);
	});

	it('collects records from matching rules', () => {
		const allowed: Rule = { ...upper, allows: [' '] };
		const out = applyTransforms(entry(), 'text-repairs', [allowed]);
		expect(out.records).toHaveLength(1);
	});

	it('throws when a rule invents text without an allowance', () => {
		expect(() => applyTransforms(entry(), 'text-repairs', [upper])).toThrow(
			/introduced/u,
		);
	});
});
