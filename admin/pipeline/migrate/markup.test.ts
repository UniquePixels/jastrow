import { describe, expect, it } from 'bun:test';
import { tokenize } from '../transform/html.ts';
import { type TagCarry, translateMarkup } from './markup.ts';

const resolve = ({ href }: { dataRef: string; href: string }): string =>
	href.includes('Jastrow') ? 'A00013' : 'Shabbat 104a';

const ANCHOR =
	'<a dir="rtl" class="refLink" href="/Jastrow,_אָב.1" data-ref="Jastrow, אָב 1">אָב</a>';

function textOf(html: string): string {
	return tokenize(html)
		.filter((t) => t.kind === 'text')
		.map((t) => t.value)
		.join('');
}

describe('translateMarkup', () => {
	it('turns an rtl span into <he>', () => {
		expect(translateMarkup('x <span dir="rtl">אב</span> y', resolve).text).toBe(
			'x <he>אב</he> y',
		);
	});
	it('turns an rtl anchor into cite + he', () => {
		expect(translateMarkup(ANCHOR, resolve).text).toBe(
			'<cite ref="A00013"><he>אָב</he></cite>',
		);
	});
	it('does not double-wrap an anchor holding one rtl span', () => {
		const html =
			'<a dir="rtl" class="refLink" href="/Jastrow,_אָב.1" data-ref="x"><span dir="rtl">אָב</span></a>';
		expect(translateMarkup(html, resolve).text).toBe(
			'<cite ref="A00013"><he>אָב</he></cite>',
		);
	});
	it('leaves an ltr anchor without <he>', () => {
		const html =
			'<a class="refLink" href="/Shabbat.104a" data-ref="Shabbat 104a">Sabb. 104a</a>';
		expect(translateMarkup(html, resolve).text).toBe(
			'<cite ref="Shabbat 104a">Sabb. 104a</cite>',
		);
	});
	it('keeps the typographic tags and reports strangers', () => {
		const html = '<i>a</i><sup>2</sup><sub>3</sub><b>,</b><u>x</u>';
		const out = translateMarkup(html, resolve);
		expect(out.text).toBe(html);
		expect(out.problems).toEqual(['tag outside the vocabulary: <u>']);
	});
	it('conserves every text byte', () => {
		const html = `<i>father</i>, <span dir="rtl">אָב</span>; v. ${ANCHOR}.`;
		expect(textOf(translateMarkup(html, resolve).text)).toBe(textOf(html));
	});
	it('reports a ref that would break the attribute', () => {
		const out = translateMarkup(ANCHOR, () => 'bad"ref');
		expect(out.problems[0]).toMatch(/quote/u);
	});
	it('passes a malformed anchor through raw instead of dangling </cite>', () => {
		const html = '<a href="/Jastrow,_x.1</a>" data-ref="x">Sabb.</a>';
		const out = translateMarkup(html, resolve);
		expect(out.text).toBe(html);
		expect(out.problems.some((p) => p.includes('anchor without href'))).toBe(
			true,
		);
		expect(textOf(out.text)).toBe(textOf(html));
	});
	it('reports a bare span and passes it through raw', () => {
		const html = '<span>x</span>';
		const out = translateMarkup(html, resolve);
		expect(out.text).toBe(html);
		expect(out.problems).toEqual(['span without dir="rtl": <span>']);
		expect(textOf(out.text)).toBe(textOf(html));
	});
	it('still translates an unclosed rtl span, reporting it unclosed', () => {
		const html = '<span dir="rtl">אב';
		const out = translateMarkup(html, resolve);
		expect(out.text).toBe('<he>אב');
		expect(out.problems).toEqual(['unclosed: span']);
		expect(textOf(out.text)).toBe(textOf(html));
	});
	it('carries an unclosed tag across a field boundary with a shared carry', () => {
		const carry: TagCarry = { open: [] };
		const first = translateMarkup('x <i>a', resolve, carry);
		expect(first.text).toBe('x <i>a</i>');
		expect(first.carried).toBe(1);
		expect(first.problems).toEqual([]);
		const second = translateMarkup('b</i> y', resolve, carry);
		expect(second.text).toBe('<i>b</i> y');
		expect(second.carried).toBe(0);
		expect(second.problems).toEqual([]);
	});
	it('carries an rtl anchor across a field boundary with the same ref', () => {
		const carry: TagCarry = { open: [] };
		const first = translateMarkup(
			'x <a dir="rtl" class="refLink" href="/Jastrow,_אָב.1" data-ref="Jastrow, אָב 1">אָב',
			resolve,
			carry,
		);
		expect(first.text).toBe('x <cite ref="A00013"><he>אָב</he></cite>');
		expect(first.carried).toBe(1);
		expect(first.problems).toEqual([]);
		const second = translateMarkup('ות</a> y', resolve, carry);
		expect(second.text).toBe('<cite ref="A00013"><he>ות</he></cite> y');
		expect(second.carried).toBe(0);
		expect(second.problems).toEqual([]);
	});
	it('closes the outer cite at the outer </a> around a malformed inner anchor', () => {
		const html =
			'<a class="refLink" href="/Shabbat.104a" data-ref="Shabbat 104a">Sabb. <a href="/Jastrow,_x.1</a>" data-ref="y">bad</a> 104a</a>';
		const out = translateMarkup(html, resolve);
		expect(out.text).toBe(
			'<cite ref="Shabbat 104a">Sabb. <a href="/Jastrow,_x.1</a>" data-ref="y">bad</a> 104a</cite>',
		);
		expect(textOf(out.text)).toBe(textOf(html));
	});
});
