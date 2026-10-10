import { describe, expect, it } from 'bun:test';
import type { SourceEntry } from '../types.ts';
import { joinLettered, splitLettered } from './lettered.ts';
import { readSourceEntries } from './source.ts';

// L53: the paren rule `parenFiltered` states, on synthetic cases and
// on the two fixture entries it changed. Kept apart from
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
];

describe('splitLettered paren state (L53)', () => {
	for (const [name, text, expected] of PAREN_CASES) {
		it(name, () => {
			expect(itemsOf(text)).toEqual(expected);
		});
	}
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
