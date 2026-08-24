import { expect, it } from 'bun:test';
import { readSourceEntries } from '../body/source.ts';
import { serialize, type Token, tokenize } from './html.ts';
import { type Anchor, anchors, retarget, unlink } from './links.ts';
import { fieldsOf } from './no-new-text.ts';

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

/** A00016's shape, verbatim. Both attributes are present, and until
 * 2026-08-24 neither PARSED, because `ATTR`'s value class excluded the
 * apostrophe in `Tosefta Ma'asrot 1:4` — 452 anchors across 417 entries
 * were in that state. The lazy value class reads them; the corpus test
 * at the foot of this file pins that the widening only ever ADDS. */
const APOSTROPHE =
	'<a class="refLink" href="/Tosefta_Ma\'asrot.1.4" ' +
	'data-ref="Tosefta Ma\'asrot 1:4">Tosef. Maasr. I, 4</a>';

it('an apostrophe in the value parses', () => {
	const anchor = first(anchors(tokenize(APOSTROPHE)));
	expect(anchor.malformed).toBe(false);
	expect(anchor.close).not.toBe(-1);
	expect(anchor.display).toBe('Tosef. Maasr. I, 4');
	expect(anchor.href).toBe("/Tosefta_Ma'asrot.1.4");
	expect(anchor.dataRef).toBe("Tosefta Ma'asrot 1:4");
});

it('an apostrophe anchor is retargetable, and still unlinkable', () => {
	const tokens = tokenize(APOSTROPHE);
	const anchor = first(anchors(tokens));
	const out = serialize(
		retarget(tokens, anchor, {
			dataRef: "Tosefta Ma'asrot 1:5",
			href: "/Tosefta_Ma'asrot.1.5",
		}),
	);
	// The splice replaces the VALUE and nothing else: `class` and
	// attribute order survive, and the apostrophe is written back.
	expect(out).toBe(
		'<a class="refLink" href="/Tosefta_Ma\'asrot.1.5" ' +
			'data-ref="Tosefta Ma\'asrot 1:5">Tosef. Maasr. I, 4</a>',
	);
	expect(serialize(unlink(tokens, anchor))).toBe('Tosef. Maasr. I, 4');
});

/** The 2 anchors that carry `href` and no `data-ref` at all. Same
 * refusal, naming the attribute that is actually missing. */
it('retarget refuses an anchor carrying href alone', () => {
	const tokens = tokenize('<a class="refLink" href="/Yoma.2a">Ib.</a>');
	const anchor = first(anchors(tokens));
	expect(() => retarget(tokens, anchor, { dataRef: 'x', href: '/x' })).toThrow(
		'links: refusing to retarget an anchor whose data-ref does not parse',
	);
});

/**
 * The apostrophe widening, pinned as a PROPERTY rather than a story.
 *
 * `ATTR`'s value class was `[^"']*`, which excluded both delimiters and
 * so failed outright on any value holding the other one. The corpus
 * writes 452 such values. Replacing the class could in principle have
 * done three things — gain a value, CHANGE one already read, or LOSE
 * one — and only the first is safe, so all three are measured here
 * against the old class, kept locally for exactly this comparison.
 *
 * This is the argument that the fix could not have altered any shipped
 * rule's behaviour, and it is a test rather than a paragraph because
 * the batch-2 review found four permanent records asserting things
 * their own code did not do.
 */
const OLD_ATTR = (name: string): RegExp =>
	new RegExp(String.raw`\b${name}\s*=\s*(?<q>["'])(?<value>[^"']*)\k<q>`, 'u');
const NEW_ATTR = (name: string): RegExp =>
	new RegExp(
		String.raw`\b${name}\s*=\s*(?<q>["'])(?<value>[\s\S]*?)\k<q>`,
		'u',
	);
const OPEN_TAG = /<a\b[^<>]*>/giu;

/** Every `<a …>` opening tag in the corpus, with the entry it came
 * from. Shared by the two corpus tests below so neither has to nest
 * three loops to reach a tag. */
async function* openTags(): AsyncGenerator<{ rid: string; tag: string }> {
	for await (const entry of readSourceEntries()) {
		for (const field of fieldsOf(entry)) {
			for (const [tag] of field.matchAll(OPEN_TAG)) {
				yield { rid: entry.rid, tag };
			}
		}
	}
}

it('widening the value class only ever ADDS a value — 452, none changed, none lost', async () => {
	const gained = { 'data-ref': 0, href: 0 };
	const changed = { 'data-ref': 0, href: 0 };
	const lost = { 'data-ref': 0, href: 0 };
	const rids = new Set<string>();
	let tags = 0;
	for await (const { rid, tag } of openTags()) {
		tags++;
		for (const name of ['href', 'data-ref'] as const) {
			const before = OLD_ATTR(name).exec(tag)?.groups?.['value'];
			const after = NEW_ATTR(name).exec(tag)?.groups?.['value'];
			if (before === after) {
				continue;
			}
			rids.add(rid);
			if (before === undefined) {
				gained[name]++;
			} else if (after === undefined) {
				lost[name]++;
			} else {
				changed[name]++;
			}
		}
	}
	expect(tags).toBe(170_180);
	expect(gained).toEqual({ 'data-ref': 452, href: 452 });
	expect(changed).toEqual({ 'data-ref': 0, href: 0 });
	expect(lost).toEqual({ 'data-ref': 0, href: 0 });
	expect(rids.size).toBe(417);
});

/** Why the class is lazy and not simply `[^"]*`: the corpus is entirely
 * double-quoted TODAY, so the narrower class would pass every test
 * above while silently over-running the first single-quoted tag anyone
 * adds. The count is pinned so "entirely double-quoted" stays a
 * measurement. */
it('every attribute value in the corpus is double-quoted — 340,360 of them', async () => {
	const quote = /\b(?:href|data-ref)\s*=\s*(?<mark>["'])/gu;
	let double = 0;
	let single = 0;
	for await (const { tag } of openTags()) {
		for (const found of tag.matchAll(quote)) {
			if (found.groups?.['mark'] === '"') {
				double++;
			} else {
				single++;
			}
		}
	}
	expect(double).toBe(340_360);
	expect(single).toBe(0);
});

it('the lazy class still reads a damaged tag exactly as before', () => {
	// The tokenizer cuts DAMAGED's opening tag AT the swallowed `</a>`,
	// so the tag it hands this module ends mid-value with no closing
	// quote: `<a dir="rtl" href="/Jastrow,_כָּלוּל.1</a>`. Neither class
	// can match an unterminated value, so both read nothing and
	// `malformed` — which is what actually refuses this anchor — is
	// reached by the same route. Pinned because "the widening cannot
	// newly succeed on damaged markup" is the claim, not the guess that
	// it reads the same non-empty string.
	const [tag] = tokenize(DAMAGED);
	const tagValue = tag?.kind === 'tag' ? tag.value : '';
	expect(OLD_ATTR('href').exec(tagValue)).toBeNull();
	expect(NEW_ATTR('href').exec(tagValue)).toBeNull();
	const anchor = first(anchors(tokenize(DAMAGED)));
	expect(anchor.href).toBe('');
	expect(anchor.malformed).toBe(true);
});
