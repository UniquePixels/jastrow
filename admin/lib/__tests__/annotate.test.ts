import { describe, expect, it } from 'bun:test';
import {
	ANNOTATE_OPEN,
	annotateIds,
	annotateTag,
	withoutAnnotateTags,
} from '../annotate.ts';

const FORM =
	'{0} <annotate id="a2">I</annotate>, <annotate id="a3">{1}</annotate>';
const CITE =
	'<cite ref="C00294"><annotate id="a1"><he>גּוּבְתָּא</he></annotate> I</cite>';

describe('annotateTag', () => {
	it('wraps the inner text in the one tag shape', () => {
		expect(annotateTag('a1', '{0}')).toBe('<annotate id="a1">{0}</annotate>');
	});
});

describe('annotateIds', () => {
	it.each([
		[FORM, ['a2', 'a3']],
		[CITE, ['a1']],
		['no tags', []],
		['<annotate id="a0">x</annotate>', []],
	] as [string, string[]][])('reads the ids in %p', (text, ids) => {
		expect(annotateIds(text)).toEqual(ids);
	});
});

describe('withoutAnnotateTags', () => {
	it.each([
		[FORM, '{0} I, {1}'],
		[CITE, '<cite ref="C00294"><he>גּוּבְתָּא</he> I</cite>'],
		['no tags', 'no tags'],
	] as [string, string][])('reads past the tags in %p', (text, plain) => {
		expect(withoutAnnotateTags(text)).toBe(plain);
	});
});

describe('ANNOTATE_OPEN', () => {
	it.each([
		['<annotate id="a1">', true],
		['<annotate id="a12">', true],
		['<annotate id="a0">', false],
		['<annotate id="b1">', false],
		["<annotate id='a1'>", false],
		['<annotate id="a1" x="y">', false],
	] as [string, boolean][])('on %p is %p', (tag, accepted) => {
		expect(ANNOTATE_OPEN.test(tag)).toBe(accepted);
	});
});
