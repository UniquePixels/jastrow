import { describe, expect, it } from 'bun:test';
import { canonicalJson, requireRid, sortByRid } from './canonical-json.ts';

describe('canonicalJson', () => {
	it('sorts keys at every depth, keeps arrays, and does not escape Hebrew', () => {
		expect(canonicalJson({ b: 1, a: { d: [{ z: 1, y: 2 }], c: 'א' } })).toBe(
			'{"a":{"c":"א","d":[{"y":2,"z":1}]},"b":1}',
		);
	});

	it('keeps array order exactly', () => {
		expect(canonicalJson({ senses: [{ n: 2 }, { n: 1 }] })).toBe(
			'{"senses":[{"n":2},{"n":1}]}',
		);
	});

	it('indents with tabs when asked, for the registry', () => {
		expect(canonicalJson([{ name: 'x', a: 1 }], '\t')).toBe(
			'[\n\t{\n\t\t"a": 1,\n\t\t"name": "x"\n\t}\n]',
		);
	});
});

describe('sortByRid', () => {
	it('gives the same bytes whatever order the dump held', () => {
		const docs = [
			{ rid: 'D01030', headword: 'ד', content: { senses: [] } },
			{ rid: 'C00144', headword: 'ג', content: { senses: [] } },
			{ rid: 'A00000', headword: 'א', content: { senses: [] } },
		];
		const write = (list: typeof docs): string =>
			sortByRid(list)
				.map((d) => canonicalJson(d))
				.join('\n');
		expect(write(docs)).toBe(write([...docs].reverse()));
		expect(sortByRid(docs).map((d) => d.rid)).toEqual([
			'A00000',
			'C00144',
			'D01030',
		]);
	});
});

describe('requireRid', () => {
	it('returns a document with a string rid', () => {
		const doc = { _id: 1, rid: 'A00001' };
		expect(requireRid(doc)).toBe(doc);
	});

	it('throws naming the _id when the rid is missing or not a string', () => {
		expect(() => requireRid({ _id: 'x1' })).toThrow(
			'lexicon_entry x1 has no string rid',
		);
		expect(() => requireRid({ _id: 'x2', rid: 5 })).toThrow(
			'lexicon_entry x2 has no string rid',
		);
	});
});
