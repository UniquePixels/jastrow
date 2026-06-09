import { describe, expect, it } from 'bun:test';
import { validateEntry } from './entry-schema.ts';

describe('validateEntry', () => {
	it('accepts a representative real entry', () => {
		const entry = {
			hw: 'א',
			id: 'A00000',
			nh: 'א ²',
			ph: 'aleph',
			p: 1,
			col: 'a',
			c: { s: [{ d: '<i>Aleph</i>', n: '1', s: [{ d: 'nested' }] }] },
			rf: { j: ['הָבַב'] },
		};
		expect(validateEntry(entry)).toEqual([]);
	});

	it('rejects a non-object entry', () => {
		expect(validateEntry('nope')).toContainEqual({
			path: '',
			detail: 'entry must be a JSON object',
		});
	});

	it('flags a missing id and headword', () => {
		const v = validateEntry({ c: { s: [] } });
		expect(v).toContainEqual({
			path: 'id',
			detail: 'required non-empty string',
		});
		expect(v).toContainEqual({
			path: 'hw',
			detail: 'required non-empty string',
		});
	});

	it('flags a malformed id', () => {
		const v = validateEntry({ id: 'bogus', hw: 'x', c: { s: [] } });
		expect(v).toContainEqual({
			path: 'id',
			detail: 'must match ^[A-Za-z]\\d{5}$',
		});
	});

	it('flags a missing content object', () => {
		expect(validateEntry({ id: 'A00000', hw: 'x' })).toContainEqual({
			path: 'c',
			detail: 'required object',
		});
	});

	it('flags a non-array c.s', () => {
		const v = validateEntry({ id: 'A00000', hw: 'x', c: { s: 'oops' } });
		expect(v).toContainEqual({ path: 'c.s', detail: 'must be an array' });
	});

	it('flags a non-string definition in a nested sense', () => {
		const entry = {
			id: 'A00000',
			hw: 'x',
			c: { s: [{ d: 'ok', s: [{ d: 42 }] }] },
		};
		expect(validateEntry(entry)).toContainEqual({
			path: 'c.s[0].s[0].d',
			detail: 'must be a string',
		});
	});

	it('flags a wrong-typed optional field', () => {
		const v = validateEntry({ id: 'A00000', hw: 'x', p: '1', c: { s: [] } });
		expect(v).toContainEqual({ path: 'p', detail: 'must be a number' });
	});
});
