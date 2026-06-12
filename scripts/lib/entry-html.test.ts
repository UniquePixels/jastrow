import { describe, expect, it } from 'bun:test';
import { findEntryViolations, findHtmlViolations } from './entry-html.ts';

describe('findHtmlViolations', () => {
	it('accepts the allow-listed tags and attributes used in real entries', () => {
		const ok =
			'<i>Aleph</i> <span dir="rtl" class="x">אבב</span> ' +
			'<a href="#rid:E00027" class="word-link">הבב</a> ' +
			'<a href="https://www.sefaria.org/Shabbat%20104a" target="_blank" rel="noopener noreferrer" class="ref-link">Sh.</a> ' +
			'<abbr title="compare" class="c">cmp.</abbr> <sup>b</sup> <sub>2</sub> <b>x</b>';
		expect(findHtmlViolations(ok)).toEqual([]);
	});

	it('flags a disallowed tag', () => {
		const v = findHtmlViolations('hi <script>alert(1)</script>');
		expect(v).toContainEqual({ kind: 'tag', detail: 'script' });
	});

	it('flags an event-handler attribute', () => {
		const v = findHtmlViolations('<span onclick="evil()">x</span>');
		expect(v).toContainEqual({ kind: 'attr', detail: 'span[onclick]' });
	});

	it('flags a javascript: href, including entity-obfuscated', () => {
		expect(
			findHtmlViolations('<a href="javascript:alert(1)">x</a>'),
		).toContainEqual({ kind: 'scheme', detail: 'href=javascript:' });
		expect(
			findHtmlViolations('<a href="java&#115;cript:alert(1)">x</a>'),
		).toContainEqual({ kind: 'scheme', detail: 'href=javascript:' });
	});

	it('flags a protocol-relative href', () => {
		expect(findHtmlViolations('<a href="//evil.example">x</a>')).toContainEqual(
			{
				kind: 'scheme',
				detail: 'href=//',
			},
		);
	});

	it('flags href on a disallowed element (img) as a bad tag', () => {
		const v = findHtmlViolations('<img src="x" onerror="evil()">');
		expect(v).toContainEqual({ kind: 'tag', detail: 'img' });
	});

	it('does not flag a fragment href containing a colon', () => {
		expect(findHtmlViolations('<a href="#rid:E00027">x</a>')).toEqual([]);
	});
});

describe('findEntryViolations', () => {
	it('returns [] for a clean entry', () => {
		const entry = {
			id: 'A00000',
			hw: 'א',
			c: {
				s: [{ d: '<i>Aleph</i>' }, { d: '<a href="#rid:X">x</a>', n: '1' }],
			},
			li: '<span class="language-info">Ch.</span>',
		};
		expect(findEntryViolations(entry)).toEqual([]);
	});

	it('reports the field path of a violation in a nested sense', () => {
		const entry = {
			id: 'A00000',
			c: { s: [{ d: 'ok', s: [{ d: '<script>x</script>' }] }] },
		};
		const v = findEntryViolations(entry);
		expect(v).toContainEqual({
			kind: 'tag',
			detail: 'script',
			path: 'c.s[0].s[0].d',
		});
	});

	it('reports a violation in the li field', () => {
		const entry = { id: 'A', li: '<img src=x onerror=y>', c: { s: [] } };
		const v = findEntryViolations(entry);
		expect(v).toContainEqual({ kind: 'tag', detail: 'img', path: 'li' });
	});
});
