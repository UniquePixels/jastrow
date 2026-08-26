import { describe, expect, it } from 'bun:test';
import type { SourceEntry } from '../body/types.ts';
import { mapFields } from './fields.ts';
import { fieldsOf } from './no-new-text.ts';

/** An entry populated in EVERY slot `fieldsOf` walks, including a
 * nested sense — the trap recorded in the batch-3a report. */
function fullEntry(): SourceEntry {
	return {
		alt_headwords: ['alt-one', 'alt-two'],
		content: {
			morphology: 'morph',
			senses: [
				{
					definition: 'outer def',
					grammar: {
						binyan_form: ['bf-one', 'bf-two'],
						language_code: 'g-lang',
						verbal_stem: 'stem',
					},
					number: '1)',
					senses: [{ definition: 'nested def', number: 'a)' }],
				},
			],
		},
		headword: 'head',
		language_code: 'lang',
		language_reference: 'langref',
		plural_form: ['pl-one'],
		quotes: [['q-a', 'q-b', null]],
		rid: 'A00000',
	} as SourceEntry;
}

describe('mapFields', () => {
	it('touches every field fieldsOf reads', () => {
		const entry = fullEntry();
		const mapped = mapFields(entry, (text) => `${text}!`);
		expect(mapped).toBeDefined();
		const before = fieldsOf(entry);
		const after = fieldsOf(mapped as SourceEntry);
		expect(after).toHaveLength(before.length);
		const untouched = before
			.map((text, at) => ({ at, after: after[at], before: text }))
			.filter((pair) => pair.before !== '' && pair.after === pair.before);
		expect(untouched).toEqual([]);
	});

	it('returns undefined when the mapper changes nothing', () => {
		expect(mapFields(fullEntry(), (text) => text)).toBeUndefined();
	});

	it('does not mutate a frozen input', () => {
		const entry = structuredClone(fullEntry());
		deepFreeze(entry);
		expect(() => mapFields(entry, (text) => `${text}!`)).not.toThrow();
	});
});

/** Recursively `Object.freeze`s a value, so the no-mutation case
 * above fails loudly instead of passing quietly. These files are ESM
 * and therefore strict, so an in-place write to a frozen entry
 * throws; without the freeze, a `mapFields` that mutated its input
 * would still satisfy every other assertion here. */
function deepFreeze(value: unknown): void {
	if (typeof value !== 'object' || value === null) {
		return;
	}
	Object.freeze(value);
	for (const child of Object.values(value)) {
		deepFreeze(child);
	}
}
