import { describe, expect, it } from 'bun:test';
import type { SourceEntry } from '../body/types.ts';
import { checkNoLostText } from './no-lost-text.ts';

const entry = (senses: SourceEntry['content']['senses']): SourceEntry => ({
	content: { senses },
	headword: 'אָהַב',
	rid: 'T00001',
});

const one = (definition: string): SourceEntry => entry([{ definition }]);

describe('checkNoLostText', () => {
	it('passes a rule that changed nothing', () => {
		expect(checkNoLostText(one('to love'), one('to love'))).toEqual([]);
	});

	it('passes text MOVED between fields', () => {
		const before = entry([
			{ definition: 'v. supra.—2) ' },
			{ definition: 'x' },
		]);
		const after = entry([
			{ definition: 'v. supra. ' },
			{ definition: 'x', number: '—2)' },
		]);
		expect(checkNoLostText(before, after)).toEqual([]);
	});

	it('reports an undeclared deletion, naming the codepoint', () => {
		const problems = checkNoLostText(one('to love'), one('to lve'));
		expect(problems).toEqual(['T00001: dropped "o" (U+006F)']);
	});

	// The gate is what stands between "moved" and "dropped": an emptied
	// definition is a sub-multiset of its input and so passes
	// `checkNoNewText` without a murmur.
	it('reports every codepoint of an emptied definition', () => {
		expect(checkNoLostText(one('abc'), one(''))).toHaveLength(3);
	});

	it('permits exactly what `removes` declares', () => {
		expect(checkNoLostText(one('a b'), one('ab'), [' '])).toEqual([]);
	});

	it('credits `removes` as a multiset, not a set', () => {
		const problems = checkNoLostText(one('a b c'), one('abc'), [' ']);
		expect(problems).toEqual(['T00001: dropped " " (U+0020)']);
	});

	// Declarations draw on ONE budget. Checked per declaration, this
	// passed: each `'a'` occurs in the input, so both were credited and
	// an emptied field looked accounted for.
	it('refuses two declarations of a codepoint the input holds once', () => {
		const problems = checkNoLostText(one('a'), one(''), ['a', 'a']);
		expect(problems).toEqual([
			'T00001: declared removal "a" does not occur in the input',
		]);
	});

	// The same shape where the input CAN afford both.
	it('permits two declarations when the input holds two', () => {
		expect(checkNoLostText(one('aa'), one(''), ['a', 'a'])).toEqual([]);
	});

	// A rule that cannot say what it deleted has not shown that it
	// knows — so an unfounded claim fails rather than being ignored.
	it('rejects a declared removal absent from the input', () => {
		const problems = checkNoLostText(one('abc'), one('abc'), ['z']);
		expect(problems).toEqual([
			'T00001: declared removal "z" does not occur in the input',
		]);
	});

	// Tags are stripped before the comparison, exactly as in
	// `checkNoNewText`, so markup changes are this gate's business only
	// through the text they carry.
	it('ignores markup, and sees the text inside it', () => {
		expect(checkNoLostText(one('<i>x</i>'), one('x'))).toEqual([]);
		expect(checkNoLostText(one('<i>x</i>'), one('<i></i>'))).toHaveLength(1);
	});

	// Every field `fieldsOf` walks is in scope, not `definition` alone.
	it('sees a dropped headword', () => {
		const before = one('x');
		const after = { ...before, headword: '' };
		expect(checkNoLostText(before, after).length).toBeGreaterThan(0);
	});
});
