import { describe, expect, it } from 'bun:test';
import type { SourceEntry } from '../types.ts';
import { declaredRunReason, joinLettered, splitLettered } from './lettered.ts';
import { readSourceEntries } from './source.ts';

// L53: the paren rule `parenFiltered` states, on synthetic cases and
// on the two fixture entries it changed; L56: where `ascendingRun`
// ends a run, on synthetic cases and on Q00140; L59: a run a reviewed
// `relabel` declares, gap included, on P00790. Kept apart from
// lettered.test.ts, which holds the marker shapes and the sweep.

const FIXTURES = 'admin/pipeline/body/fixtures/lettered.jsonl';

/** One entry of the lettered fixture set, by rid. */
async function fixture(rid: string): Promise<SourceEntry> {
	for await (const entry of readSourceEntries(FIXTURES)) {
		if (entry.rid === rid) {
			return entry;
		}
	}
	throw new Error(`fixture missing: ${rid}`);
}

/** What `text` splits into, as `letter=trimmed item text` per item,
 * or null when it stays whole — one value per case, so a table row
 * states its whole expectation, boundaries included. */
function itemsOf(text: string): string[] | null {
	const parts = splitLettered(text);
	if (parts === null) {
		return null;
	}
	expect(joinLettered(parts)).toBe(text);
	return parts.items.map((item) => `${item.letter}=${item.text.trim()}`);
}

// L53: a candidate inside an open paren does not count; an unclear
// paren state (a `)` with nothing open) keeps the text whole.
// [case, text, items it splits into or null]
const PAREN_CASES: [string, string, string[] | null][] = [
	[
		'cross-reference letter closing its paren',
		'x a) one (v. Kal, b) b) two c) three',
		['a=one (v. Kal, b)', 'b=two', 'c=three'],
	],
	['letter inside a paren that runs on', 'x a) one (as c) said) b) two', null],
	[
		'nested paren',
		'x a) one (so (v. b) here) b) two',
		['a=one (so (v. b) here)', 'b=two'],
	],
	[
		'italic candidate inside a paren',
		'x <i>a</i>) one (v. <i>b</i>) <i>b</i>) two',
		['a=one (v. <i>b</i>)', 'b=two'],
	],
	[
		'paren in a tag attribute',
		'x a) <a href="/x_(y">one</a> b) two',
		['a=<a href="/x_(y">one</a>', 'b=two'],
	],
	[
		'unclosed paren before later markers',
		'x a) one (two b) three c) four',
		null,
	],
	[
		'unclosed paren after the run',
		'x a) one b) two (three',
		['a=one', 'b=two (three'],
	],
	['stray close before the run', 'x one) a) two b) three', null],
	['stray close after the run', 'x a) one b) two three)', null],
	[
		'inline numbered marker',
		'x a) one b) two.—2) three',
		['a=one', 'b=two.—2) three'],
	],
	[
		'verse number closing a citation paren',
		'x (Is. XL, 1) a) one b) two',
		['a=one', 'b=two'],
	],
	[
		'a > and a ( inside a quoted attribute are not text',
		'x a) one <a title="x>(">two</a> b) three',
		['a=one <a title="x>(">two</a>', 'b=three'],
	],
];

describe('splitLettered paren state (L53)', () => {
	for (const [name, text, expected] of PAREN_CASES) {
		it(name, () => {
			expect(itemsOf(text)).toEqual(expected);
		});
	}
});

// L56: a run ends at the first counted marker that is not the next
// letter; it never skips one. A later run inside the last item stays
// in that item's text, and a mismatch before the run's `b)` leaves
// too few markers to split.
// [case, text, items it splits into or null]
const RUN_CASES: [string, string, string[] | null][] = [
	[
		'nested run in the last item',
		'x a) one b) two a) three c) four',
		['a=one', 'b=two a) three c) four'],
	],
	[
		'restarted run in the last item',
		'x a) one b) two a) three b) four',
		['a=one', 'b=two a) three b) four'],
	],
	['out-of-sequence letter mid-run', 'x a) one c) two b) three', null],
	['stray letter before the run', 'x c) one a) two b) three', null],
	[
		'run ends where a letter repeats',
		'x a) one b) two b) three c) four',
		['a=one', 'b=two b) three c) four'],
	],
];

describe('splitLettered run end (L56)', () => {
	for (const [name, text, expected] of RUN_CASES) {
		it(name, () => {
			expect(itemsOf(text)).toEqual(expected);
		});
	}

	it("Q00140's run ends at b), keeping the plural's a) b) c) in b", async () => {
		// Print (vol. 2 p. 1138a): `לְפִי a) … —b) because … —Pl. a)
		// פִּיּוֹת … —b) פִּיפִיּוֹת … —c) (Chald. pl.) פּוּמִין`. The c)
		// is the plural's third item. The outer run meets the plural's
		// a) where it wants c), so it ends at b) and b's text keeps the
		// whole plural run: an under-split, not a c) under the wrong
		// parent.
		const entry = await fixture('Q00140');
		const definition = entry.content.senses[0]?.definition ?? '';
		const parts = splitLettered(definition);
		if (parts === null) {
			throw new Error('expected Q00140 sense 1 to split');
		}
		expect(parts.items.map((i) => i.letter)).toEqual(['a', 'b']);
		const b = parts.items[1]?.text ?? '';
		expect(b).toContain('<i>Pl. a</i>) ');
		expect(b).toContain('—<i>b</i>) ');
		expect(b).toContain('—<i>c</i>) (Chald. pl.) ');
		expect(joinLettered(parts)).toBe(definition);
	});
});

describe('lettered fixtures the paren rule changed (L53)', () => {
	it("Q01198's run stays whole inside its unclosed (b. h.; paren", async () => {
		// The span-start `<i>a)` shape itself is covered by the synthetic
		// case above. Q01198 carried it until L53: its definition opens
		// `c. pl. (b. h.;` and never closes that paren, so every later
		// marker reads as inside it and the text stays whole (B9).
		const entry = await fixture('Q01198');
		const definition = entry.content.senses[0]?.definition ?? '';
		expect(definition).toContain('c. pl. (b. h.;');
		expect(definition).toContain('<i>a) for appearance');
		expect(splitLettered(definition)).toBeNull();
	});

	it("P00790's Hif. run keeps each (v. Kal, x) in its sense (L53)", async () => {
		// Print: `b) (v. Kal, c) to neutralize … —c) (v. Kal, a) to
		// account … —d) (v. Kal, e) to succeed … —f) …`. Print has no
		// e), so f)–h) are not a complete run from d) and stay in d's
		// text: the under-split DESIGN §2 states for an incomplete run.
		const entry = await fixture('P00790');
		const [, , hif] = entry.content.senses;
		expect(hif?.grammar?.verbal_stem).toBe('Hif.');
		const definition = hif?.senses?.[1]?.definition ?? '';
		const parts = splitLettered(definition);
		if (parts === null) {
			throw new Error('expected P00790 Hif. sense 2 to split');
		}
		expect(parts.items.map((i) => i.letter)).toEqual(['a', 'b', 'c', 'd']);
		const starts = parts.items.map((i) => i.text.slice(0, 13));
		expect(starts.slice(1)).toEqual([
			' (v. Kal, c) ',
			' (v. Kal, a) ',
			' (v. Kal, e) ',
		]);
		expect(parts.items[3]?.text).toContain('—<i>f</i>) ');
		expect(joinLettered(parts)).toBe(definition);
	});
});

// L59: a reviewed `relabel` declares print's run as the text holds it,
// gap included, and the split honours it: exactly those counted
// markers, in that order, and nothing else.
describe('splitLettered with a declared run (L59 relabel)', () => {
	const GAP = ['a', 'b', 'c', 'd', 'f', 'g', 'h'];
	const text =
		'lead.—<i>a</i>) one.—<i>b</i>) (v. Kal, c) two.—<i>c</i>) three.—<i>d</i>) (v. Kal, e) four.—<i>f</i>) five.—<i>g</i>) six.—<i>h</i>) seven.';

	it('splits seven at a run print gapped, where the plain rule stops at d', () => {
		expect(splitLettered(text)?.items.map((i) => i.letter)).toEqual([
			'a',
			'b',
			'c',
			'd',
		]);
		const parts = splitLettered(text, GAP);
		expect(parts?.items.map((i) => i.letter)).toEqual(GAP);
		expect(parts?.items.map((i) => i.text)).toEqual([
			' one.—',
			' (v. Kal, c) two.—',
			' three.—',
			' (v. Kal, e) four.—',
			' five.—',
			' six.—',
			' seven.',
		]);
		expect(parts === null ? null : joinLettered(parts)).toBe(text);
		expect(declaredRunReason(text, GAP)).toBeUndefined();
	});
});

describe('declaredRunReason (L59 relabel)', () => {
	const GAP = ['a', 'b', 'c', 'd', 'f', 'g', 'h'];
	const text =
		'lead.—<i>a</i>) one.—<i>b</i>) (v. Kal, c) two.—<i>c</i>) three.—<i>d</i>) (v. Kal, e) four.—<i>f</i>) five.—<i>g</i>) six.—<i>h</i>) seven.';

	it("splits P00790's Hif. sense 2 into seven, each (v. Kal, x) kept in its sense", async () => {
		const entry = await fixture('P00790');
		const definition = entry.content.senses[2]?.senses?.[1]?.definition ?? '';
		const parts = splitLettered(definition, GAP);
		expect(parts?.items.map((i) => i.letter)).toEqual(GAP);
		expect(parts?.items[3]?.text.startsWith(' (v. Kal, e) ')).toBe(true);
		expect(parts?.items[3]?.text).not.toContain('<i>f</i>)');
		expect(parts === null ? null : joinLettered(parts)).toBe(definition);
	});

	// [case, declared run, reason]
	it.each([
		[
			'a run missing a marker the text holds',
			['a', 'b', 'c', 'd', 'f', 'g'],
			'the declared run a b c d f g is not the counted markers of the text, a b c d f g h',
		],
		[
			'a run naming a letter print skipped',
			['a', 'b', 'c', 'd', 'e', 'f', 'g'],
			'the declared run a b c d e f g is not the counted markers of the text, a b c d f g h',
		],
		[
			'a run out of print order',
			['a', 'b', 'c', 'd', 'g', 'f', 'h'],
			'the declared run a b c d g f h is not the counted markers of the text, a b c d f g h',
		],
	])('refuses %s', (_, run, reason) => {
		expect(declaredRunReason(text, run)).toBe(reason);
		expect(splitLettered(text, run)).toBeNull();
	});
});

// L57: J00403's run, after which print sets a `)` that closes nothing.
// The plain rule cannot count markers in such a text and leaves it
// whole (B9); a declared run is a person's reading of the print, so it
// is checked against the markers counted with each such `)` skipped,
// each still exactly once: a candidate inside a paren that does close
// stays out.
describe('a declared run where the paren state is unclear (L57)', () => {
	const STRAY =
		'sea.—Esp. a) one.—b) two (only הים).—c) three.—d) four; Men. 64ᵇ, v. זִיבָה).';

	it('splits at a declared run where the paren state is unclear', () => {
		expect(splitLettered(STRAY)).toBeNull();
		const parts = splitLettered(STRAY, ['a', 'b', 'c', 'd']);
		expect(parts?.items.map((i) => i.text)).toEqual([
			' one.—',
			' two (only הים).—',
			' three.—',
			' four; Men. 64ᵇ, v. זִיבָה).',
		]);
		expect(parts === null ? null : joinLettered(parts)).toBe(STRAY);
	});

	it('refuses a declared run that is not the markers counted past the stray paren', () => {
		expect(declaredRunReason(STRAY, ['a', 'b', 'c'])).toBe(
			'the declared run a b c is not the counted markers of the text, each `)` that closes nothing skipped, a b c d',
		);
	});

	it('keeps a candidate inside a paren that closes out of the run', () => {
		const text = 'a) first (see b) reference) c) last';
		expect(splitLettered(text)).toBeNull();
		expect(declaredRunReason(text, ['a', 'b', 'c'])).toBe(
			'the declared run a b c is not the counted markers of the text, each `)` that closes nothing skipped, a c',
		);
		expect(splitLettered(text, ['a', 'c'])?.items.map((i) => i.text)).toEqual([
			' first (see b) reference) ',
			' last',
		]);
	});
});
