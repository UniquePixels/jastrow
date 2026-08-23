import { expect, it } from 'bun:test';
import { serialize, tokenize } from './html.ts';
import { type Anchor, anchors, retarget, unlink } from './links.ts';

/** `anchors()[0]` narrowed for the tests below. Every fixture here is
 * known non-empty; `noUncheckedIndexedAccess` types indexed access as
 * possibly `undefined` regardless, and `lint/style/noNonNullAssertion`
 * forbids silencing that with `!`, so the narrowing is explicit. */
function first(list: readonly Anchor[]): Anchor {
	const [anchor] = list;
	if (anchor === undefined) {
		throw new Error('test fixture produced no anchor');
	}
	return anchor;
}

/** A00135, verbatim from the pinned snapshot. */
const GRAETZ =
	'a district of Peræa (v. Graetz, Gesch. d. ' +
	'<a class="refLink" href="/Judges.2.2" data-ref="Judges 2:2">Jud. II, 2</a>).';

it('reads href, data-ref and display', () => {
	const anchor = first(anchors(tokenize(GRAETZ)));
	expect(anchor.href).toBe('/Judges.2.2');
	expect(anchor.dataRef).toBe('Judges 2:2');
	expect(anchor.display).toBe('Jud. II, 2');
	expect(anchor.malformed).toBe(false);
});

it('unlink keeps the display text and drops both tags', () => {
	const tokens = tokenize(GRAETZ);
	const anchor = first(anchors(tokens));
	expect(serialize(unlink(tokens, anchor))).toBe(
		'a district of Peræa (v. Graetz, Gesch. d. Jud. II, 2).',
	);
});

it('retarget rewrites both attributes and nothing else', () => {
	const tokens = tokenize(GRAETZ);
	const anchor = first(anchors(tokens));
	const out = serialize(
		retarget(tokens, anchor, { dataRef: 'Judges 2:3', href: '/Judges.2.3' }),
	);
	expect(out).toContain('href="/Judges.2.3"');
	expect(out).toContain('data-ref="Judges 2:3"');
	expect(out).toContain('class="refLink"');
	expect(out.replace(/2\.3|2:3/gu, '')).toBe(GRAETZ.replace(/2\.2|2:2/gu, ''));
});

/** D00478's shape: an unterminated href swallows the closing tag, so
 * everything after it inside the tag is attribute tail, not document
 * text. `unterminated-href-swallows-closing-tag` (batch 4) repairs it;
 * batch 2 must not touch it. */
const DAMAGED =
	'<a dir="rtl" href="/Jastrow,_כָּלוּל.1</a>" data-ref="Jastrow, כָּלוּל 1">כָּלוּל</a>.';

it('a malformed opening tag is reported and refused', () => {
	const tokens = tokenize(DAMAGED);
	const anchor = first(anchors(tokens));
	expect(anchor.malformed).toBe(true);
	expect(() => unlink(tokens, anchor)).toThrow('malformed');
	expect(() => retarget(tokens, anchor, { dataRef: 'x', href: '/x' })).toThrow(
		'malformed',
	);
});

it('anchors returns every <a> in document order', () => {
	const html =
		'<a href="/a" data-ref="A">one</a> mid ' +
		'<a href="/b" data-ref="B">two</a>';
	const list = anchors(tokenize(html));
	expect(list[0]?.href).toBe('/a');
	expect(list[1]?.href).toBe('/b');
});

it('sorts an unclosed anchor back into document order', () => {
	// <a> does not nest in real markup, but the tokenizer does not
	// enforce that: an unclosed open is found from the LEFTOVER stack
	// after the main walk, so it lands after every closed anchor unless
	// `anchors()` re-sorts by `open`. Nesting here forces that path:
	// the outer <a> (open at 0) never closes, and the inner one (open
	// at 1) does, so the naive order would list "b" before "a".
	const html =
		'<a href="/a" data-ref="A">outer <a href="/b" data-ref="B">inner</a>';
	const list = anchors(tokenize(html));
	expect(list.map((anchor) => anchor.href)).toEqual(['/a', '/b']);
	expect(list[0]?.close).toBe(-1);
	expect(list[1]?.close).not.toBe(-1);
});

it('display drops nested tags but keeps their text', () => {
	const html = '<a href="/x" data-ref="y"><span dir="rtl">Text</span></a>';
	const anchor = first(anchors(tokenize(html)));
	expect(anchor.display).toBe('Text');
});

it('an anchor missing its closing tag is unclosed and refused', () => {
	const html = 'lead <a href="/x" data-ref="y">tail, no close';
	const tokens = tokenize(html);
	const anchor = first(anchors(tokens));
	expect(anchor.malformed).toBe(false);
	expect(anchor.close).toBe(-1);
	expect(() => unlink(tokens, anchor)).toThrow();
	expect(() =>
		retarget(tokens, anchor, { dataRef: 'x', href: '/x' }),
	).toThrow();
});
