import { describe, expect, it } from 'bun:test';
import {
	type Entry,
	SCHEMA_VERSION,
	type Sense,
} from '../../../entry/types.ts';
import { detectEmptyBody } from './empty-body.ts';

/** One sense with no text unless a fixture gives it some. */
function sense(over: Partial<Sense> = {}): Sense {
	return { gloss: '', units: [], ...over };
}

/** P01112 and U00622 as the run writes them — one gloss head with no
 * text, no units, no stems — overridden per fixture. */
function entry(over: Partial<Entry> = {}): Entry {
	return {
		headwords: [{ text: 'אבג' }],
		id: 'P01112',
		schemaVersion: SCHEMA_VERSION,
		sefariaHeadword: 'אבג',
		senses: [sense()],
		...over,
	};
}

describe('empty-body', () => {
	it('names an entry whose body carries no text at all', () => {
		expect(detectEmptyBody(entry())).toEqual([
			{
				detail: 'senses and stems carry no text',
				kind: 'empty-body',
				rid: 'P01112',
				severity: 'review',
			},
		]);
	});
	it('reads whitespace and bare markup as no text', () => {
		const rows = detectEmptyBody(
			entry({ senses: [sense({ gloss: ' <i> </i>', units: [' '] })] }),
		);
		expect(rows).toHaveLength(1);
	});
	it('is silent when the gloss head carries text', () => {
		expect(
			detectEmptyBody(entry({ senses: [sense({ gloss: 'm.' })] })),
		).toEqual([]);
	});
	it('is silent when only a nested sense carries text', () => {
		const rows = detectEmptyBody(
			entry({ senses: [sense({ senses: [sense({ gloss: 'to tie' })] })] }),
		);
		expect(rows).toEqual([]);
	});
	it('is silent when a sense carries only a label', () => {
		const rows = detectEmptyBody(
			entry({ senses: [sense(), sense({ label: '1' })] }),
		);
		expect(rows).toEqual([]);
	});
	it('is silent when the entry has a stem block, which shows its label', () => {
		const rows = detectEmptyBody(
			entry({ stems: [{ forms: [], senses: [], stem: 'Pa.' }] }),
		);
		expect(rows).toEqual([]);
	});
});
