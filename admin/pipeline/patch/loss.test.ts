/** The loss report (`loss.ts`): what a change removes from an entry's
 * visible text, and how a declaration departs from it. */
import { describe, expect, it } from 'bun:test';
import type { SourceEntry } from '../types.ts';
import { applyEntryPatches } from './apply.ts';
import { lossMismatch, lossPool, removedCodepoints } from './loss.ts';
import { contentAnchor, parsePatch } from './schema.ts';

/** An entry with one sense; `extra` overrides any field. */
function entry(
	definition: string,
	extra: Partial<SourceEntry> = {},
): SourceEntry {
	return {
		content: { senses: [{ definition, number: '1)' }] },
		headword: 'אב',
		rid: 'T00001',
		...extra,
	};
}

// [what, before, after, removed]
const REMOVED: readonly (readonly [
	string,
	SourceEntry,
	SourceEntry,
	string,
])[] = [
	['nothing changed', entry('a b'), entry('a b'), ''],
	['OCR l) → 1) removes the l', entry('x l) y'), entry('x 1) y'), 'l'],
	['a moved word removes nothing', entry('a b c'), entry('c a b'), ''],
	['whitespace is not visible', entry('a  b'), entry('ab'), ''],
	['a bidi mark is not visible', entry('a‏b'), entry('ab'), ''],
	['tags are not visible', entry('<i>a</i>'), entry('a'), ''],
	[
		'a deleted run reads as the run',
		entry('same. same.'),
		entry('same.'),
		'same.',
	],
	[
		'a refs item is in the pool',
		entry('a', { refs: ['Yoma 2a'] }),
		entry('a', { refs: [] }),
		'Yoma2a',
	],
	[
		'display text is in the pool',
		entry('a', { display: '({0})' }),
		entry('a', { display: '{0}' }),
		'()',
	],
	[
		'a display slot is not',
		entry('a', { display: '{0} {1}' }),
		entry('a', { display: '{0}' }),
		'',
	],
	[
		'a headword letter',
		entry('a', { headword: 'אבך' }),
		entry('a', { headword: 'אבכ' }),
		'ך',
	],
	[
		'a sense number digit',
		entry('a'),
		{ ...entry('a'), content: { senses: [{ definition: 'a', number: '2)' }] } },
		'1',
	],
];

// [what, declared, removed, undeclared, unremoved]
const MISMATCH: readonly (readonly [string, string, string, string, string])[] =
	[
		['agree', 'l', 'l', '', ''],
		['order is free', 'ba', 'ab', '', ''],
		['whitespace is free', 'Yoma 2a', 'Yoma2a', '', ''],
		['nothing declared, nothing removed', '', '', '', ''],
		['removes one it does not declare', '', 'l', 'l', ''],
		['declares one it does not remove', 'I', '', '', 'I'],
		['a multiset, not a set', 'I', 'II', 'I', ''],
	];

describe('removedCodepoints', () => {
	it.each(REMOVED)('%s', (_what, before, after, removed) => {
		expect(removedCodepoints(before, after)).toBe(removed);
	});
});

describe('lossMismatch', () => {
	it.each(MISMATCH)('%s', (...[, declared, removed, undeclared, unremoved]) => {
		expect(lossMismatch(declared, removed)).toEqual({ undeclared, unremoved });
	});
});

describe('lossPool', () => {
	it('holds refs after every text field', () => {
		expect(lossPool(entry('d', { refs: ['R 1'] }))).toBe('אב1)dR 1');
	});
});

/** A reviewed `replace` record on `entry`'s one sense, `extra` merged
 * in. */
function replace(extra: Record<string, unknown>): Record<string, unknown> {
	return {
		defect_class: 'test-class',
		expected_before: 'x l) y',
		id: 'P000001',
		op: 'replace',
		payload: { find: 'l)', replace: '1)' },
		prompt_version: 'v1',
		rationale: 'test rationale',
		rid: 'T00001',
		snapshot: `sha256:${'0'.repeat(64)}`,
		target: `sense[1)]:${contentAnchor('x l) y')}`,
		...extra,
	};
}

describe('removes on the record', () => {
	it('carries a declaration through', () => {
		expect(parsePatch(replace({ removes: 'l' })).removes).toBe('l');
	});

	it('refuses an empty one', () => {
		expect(() => parsePatch(replace({ removes: '' }))).toThrow(
			'removes, when present, must be a non-empty string',
		);
	});
});

describe('applyEntryPatches losses', () => {
	it('lists what each applied patch removed', () => {
		const { losses } = applyEntryPatches(entry('x l) y'), [
			parsePatch(replace({})),
		]);
		expect(losses).toEqual([
			{ patchId: 'P000001', removed: 'l', rid: 'T00001' },
		]);
	});
});
