import { expect, it } from 'bun:test';
import { serialize, type Token, tokenize } from './html.ts';
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

/**
 * A00527 sense 2, verbatim: three well-formed sibling anchors in one
 * definition. The multi-anchor fixture the length-invariance test
 * below needs — `GRAETZ` carries exactly one, so a claim about index
 * stability "across several anchors" cannot be made against it.
 */
const THREE_ANCHORS =
	'<i>river.</i> <a class="refLink" href="/Daniel.8.2" data-ref="Daniel 8:2">Dan. VIII, 2</a>; ' +
	'<a class="refLink" href="/Daniel.8.3" data-ref="Daniel 8:3">3</a>; ' +
	'<a class="refLink" href="/Daniel.8.6" data-ref="Daniel 8:6">6</a>.';

/**
 * `retarget` is LENGTH-PRESERVING, and that is load-bearing rather
 * than incidental. `anaphora.ts`'s `retargetAnaphora` holds indices
 * from the ORIGINAL token array while accumulating edits into a
 * separate one, which is sound only while index i means the same
 * anchor on both sides. The removing counterpart of that assumption is
 * exactly what produced the `unlinkMatching` bug (fixed in 6b45ec8),
 * so the invariant is pinned here rather than left to `map`'s
 * signature.
 *
 * Pinned on THREE anchors in one definition, and over two passes each,
 * because one anchor edited twice cannot detect the failure that
 * matters: a length change shifts every LATER anchor's index, so the
 * test needs a later anchor to shift. (The first cut of this test used
 * the single-anchor `GRAETZ` while its docstring claimed "a definition
 * carrying several anchors" — a claim the code did not support, caught
 * in re-review 2026-08-24. This batch spent two days on exactly that
 * defect class; the fixture was changed rather than the sentence.)
 */
it('retarget never changes the token count or shifts a sibling anchor', () => {
	const tokens = tokenize(THREE_ANCHORS);
	const list = anchors(tokens);
	expect(list).toHaveLength(3);
	const places = list.map((anchor) => [anchor.open, anchor.close]);
	let next: readonly Token[] = tokens;
	for (const [round, anchor] of [...list, ...list].entries()) {
		next = retarget(next, anchor, {
			dataRef: `Daniel 8:${round + 10}`,
			href: `/Daniel.8.${round + 10}`,
		});
		expect(next).toHaveLength(tokens.length);
		// Every anchor — including the ones AFTER the edited tag — is
		// still at the index the original scan gave it.
		expect(anchors(next).map((a) => [a.open, a.close])).toEqual(places);
	}
	// Each of the three ended on its own second-pass value, so all three
	// were genuinely addressed rather than one being hit six times.
	expect(anchors(next).map((a) => a.dataRef)).toEqual([
		'Daniel 8:13',
		'Daniel 8:14',
		'Daniel 8:15',
	]);
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

/** J00597's shape: the malformed tag's `attributeInterior` region never
 * recovers (html.ts's own docs on that function name this field), so
 * everything after it — including a second `<a>` that is well-formed
 * on its own, closes cleanly and has a real `href` — is actually the
 * tail of the FIRST tag's damaged attribute value, not document markup.
 * A view that only checked each anchor's own opening tag against
 * `opensScope` would call this second anchor clean. */
const J00597 =
	'(cmp. <a dir="rtl" class="refLink" href="/Jastrow,_דִּלְדֵּל.1</a>' +
	'<a class="refLink" href="/Bava_Metzia.38b">B. Mets. 38ᵇ</a> ' +
	'<span dir="rtl">היוֹרֵד</span> he who takes possession.';

it('refuses an anchor trapped in another tag’s unrecovered interior', () => {
	const tokens = tokenize(J00597);
	const list = anchors(tokens);
	// The malformed tag itself: reported malformed, not interior — the
	// damage is its own.
	expect(list[0]?.malformed).toBe(true);
	expect(list[0]?.interior).toBe(false);
	// The trapped anchor: well-formed and fully closed by every local
	// measure, but its tokens are inside the first tag's interior.
	const [, trapped] = list;
	if (trapped === undefined) {
		throw new Error('expected a second, trapped anchor');
	}
	expect(trapped.malformed).toBe(false);
	expect(trapped.close).not.toBe(-1);
	expect(trapped.href).toBe('/Bava_Metzia.38b');
	expect(trapped.interior).toBe(true);
	expect(() => unlink(tokens, trapped)).toThrow('interior');
	expect(() => retarget(tokens, trapped, { dataRef: 'x', href: '/x' })).toThrow(
		'interior',
	);
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
