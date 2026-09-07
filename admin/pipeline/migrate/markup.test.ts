import { describe, expect, it } from 'bun:test';
import { tokenize } from '../transform/html.ts';
import { translateMarkup } from './markup.ts';

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
});
