import { describe, expect, it } from 'bun:test';
import { walkSenses } from './census.ts';
import type { LetteredParts } from './lettered.ts';
import { joinLettered, splitLettered } from './lettered.ts';
import { readSourceEntries } from './source.ts';
import type { SourceEntry } from './types.ts';

const FIXTURES = 'admin/pipeline/body/fixtures/lettered.jsonl';

/** Loads the 5-entry fixture set once per test file (tiny, so an array
 * is simpler for callers than re-streaming per test). */
async function loadFixtures(): Promise<SourceEntry[]> {
	const entries: SourceEntry[] = [];
	for await (const entry of readSourceEntries(FIXTURES)) {
		entries.push(entry);
	}
	return entries;
}

function findFixture(entries: SourceEntry[], rid: string): SourceEntry {
	const entry = entries.find((e) => e.rid === rid);
	if (entry === undefined) {
		throw new Error(`fixture missing: ${rid}`);
	}
	return entry;
}

/** Asserts a split happened and hands back the non-null parts, so
 * callers don't need an `if` guard around a follow-up `expect()`. */
function assertSplit(text: string): LetteredParts {
	const parts = splitLettered(text);
	if (parts === null) {
		throw new Error(`expected a split for: ${text}`);
	}
	return parts;
}

interface SweepMismatch {
	expected: string;
	got: string;
	rid: string;
	senseIndex: number;
}

interface SweepResult {
	mismatches: SweepMismatch[];
	splitCount: number;
}

/** Runs splitLettered/joinLettered over every sense in `entries` and
 * reports, per rid + senseIndex, any definition whose split didn't
 * round-trip or that produced fewer than two items — so a failure
 * names the offending entry instead of just failing on the first
 * mismatch encountered. */
function sweepFixtures(entries: SourceEntry[]): SweepResult {
	const mismatches: SweepMismatch[] = [];
	let splitCount = 0;
	for (const entry of entries) {
		let senseIndex = 0;
		for (const sense of walkSenses(entry.content.senses)) {
			const definition = sense.definition ?? '';
			const parts = splitLettered(definition);
			if (parts !== null) {
				splitCount++;
				const got = joinLettered(parts);
				if (got !== definition || parts.items.length < 2) {
					mismatches.push({
						rid: entry.rid,
						senseIndex,
						expected: definition,
						got,
					});
				}
			}
			senseIndex++;
		}
	}
	return { mismatches, splitCount };
}

describe('splitLettered', () => {
	it('splits a complete a)…b) run', () => {
		const parts = assertSplit('x a) one b) two');
		expect(parts.items.map((i) => i.letter)).toEqual(['a', 'b']);
	});

	it('does not split a single marker', () => {
		expect(splitLettered('only a) alone')).toBeNull();
	});

	it('does not count markers wrapped in parentheses', () => {
		expect(splitLettered('see (a) and (b)')).toBeNull();
	});

	it('does not count markers inside an anchor', () => {
		const text = '<a href="/x" class="refLink">text a)</a> b) two';
		// The anchor-interior "a)" doesn't count, so only one real marker
		// ("b)") remains — too few to split.
		expect(splitLettered(text)).toBeNull();
	});

	it('resumes counting once a marker follows the anchor close', () => {
		const text = '<a href="/x" class="refLink">text a)</a> a) one b) two';
		const parts = assertSplit(text);
		expect(parts.items.map((i) => i.letter)).toEqual(['a', 'b']);
	});

	it('skips an out-of-sequence marker rather than ending the run', () => {
		const parts = assertSplit('a) one c) two b) three');
		expect(parts.items.map((i) => i.letter)).toEqual(['a', 'b']);
		expect(parts.items[0]?.text).toBe(' one c) two ');
		expect(parts.items[1]?.text).toBe(' three');
	});

	it('requires the run to start at a)', () => {
		expect(splitLettered('b) one c) two')).toBeNull();
	});

	it('round-trips through joinLettered', () => {
		const text = 'head a) one b) two c) three';
		const parts = assertSplit(text);
		expect(joinLettered(parts)).toBe(text);
	});

	it('splits a full-italic <i>a</i>)…<i>b</i>) run', () => {
		const text = 'head <i>a</i>) one <i>b</i>) two';
		const parts = assertSplit(text);
		expect(parts.head).toBe('head ');
		expect(parts.items.map((i) => i.letter)).toEqual(['a', 'b']);
		expect(parts.items.map((i) => i.marker)).toEqual([
			'<i>a</i>)',
			'<i>b</i>)',
		]);
		expect(joinLettered(parts)).toBe(text);
	});

	it('splits a span-end a</i>) marker, closing the head span', () => {
		// Q01353's shape: the source lazily merged the italic gloss and
		// the marker into one span (`<i>section, a</i>)` for `<i>section,
		// </i><i>a</i>)`), so the split repairs the boundary it cuts —
		// the head gets the missing `</i>` — and join strips it back off.
		const text = '<i>section, a</i>) one <i>b</i>) two';
		const parts = assertSplit(text);
		expect(parts.head).toBe('<i>section, </i>');
		expect(parts.items.map((i) => i.marker)).toEqual(['a</i>)', '<i>b</i>)']);
		expect(joinLettered(parts)).toBe(text);
	});

	it('closes the previous item text at a mid-run span-end marker', () => {
		const text = 'head a) one <i>two; b</i>) three';
		const parts = assertSplit(text);
		expect(parts.items[0]?.text).toBe(' one <i>two; </i>');
		expect(parts.items[1]?.text).toBe(' three');
		expect(joinLettered(parts)).toBe(text);
	});

	it('splits a span-start <i>a) marker, re-opening the item text', () => {
		// Q01198's shape: one italic span covers marker AND item text
		// (`<i>a) for appearance sake…</i>`), so the marker claims
		// `<i>a)` and the item text is re-opened with its own `<i>`.
		const text = 'head <i>a) one</i> b) two';
		const parts = assertSplit(text);
		expect(parts.items.map((i) => i.marker)).toEqual(['<i>a)', 'b)']);
		expect(parts.items[0]?.text).toBe('<i> one</i> ');
		expect(joinLettered(parts)).toBe(text);
	});

	it('does not count a possessive or parenthetical span-end letter', () => {
		// `)` closing a parenthetical right after an italic span is not a
		// marker: the span-end shape requires `.`/`,`/`;` + space before
		// the letter (corpus-measured discriminator, see MARKER comment).
		expect(splitLettered('(<i>in a</i>) manner b) two')).toBeNull();
		expect(splitLettered('the (<i>camel’s</i>) neck b) two')).toBeNull();
	});

	it('mixes plain and italic markers in one run', () => {
		const text = 'head a) one <i>b</i>) two';
		const parts = assertSplit(text);
		expect(parts.items.map((i) => i.marker)).toEqual(['a)', '<i>b</i>)']);
		expect(joinLettered(parts)).toBe(text);
	});

	it('does not count a parenthesized italic marker', () => {
		expect(splitLettered('see (<i>a</i>) and (<i>b</i>)')).toBeNull();
	});
});

describe('fixture sweep (fixtures/lettered.jsonl)', () => {
	it('every definition either stays whole or round-trips exactly', async () => {
		const entries = await loadFixtures();
		const { mismatches, splitCount } = sweepFixtures(entries);

		expect(mismatches).toEqual([]);
		// These counts are tied to the current 9-entry fixture set
		// (fixtures/lettered.jsonl) — update both if fixtures are added,
		// removed, or edited. Measured across that set (see task report
		// for the per-entry breakdown): A01999 def#1 [a,b,c], A01873
		// def#2 [a,b,c], C00031 def#2 [a,b,c,d], E00378 def#3 [a,b],
		// C00009 def#2 [a,b], plus the Task 15 italic classes: O01078
		// def#1 [a,b], P00480 def#3 [a,b,c,d], Q01353 def#7 [a,b],
		// Q01198 def#1 [a,b] — 9 definitions split in total.
		expect(entries.length).toBe(9);
		expect(splitCount).toBe(9);
	});

	it("A01999's lettered run splits into a), b), c)", async () => {
		const entries = await loadFixtures();
		const entry = findFixture(entries, 'A01999');
		const definition = entry.content.senses[0]?.definition ?? '';
		const parts = assertSplit(definition);
		expect(parts.items.map((i) => i.letter)).toEqual(['a', 'b', 'c']);
		expect(joinLettered(parts)).toBe(definition);
	});

	it("A01873's sense-2 definition splits into a), b), c)", async () => {
		const entries = await loadFixtures();
		const entry = findFixture(entries, 'A01873');
		const definition = entry.content.senses[1]?.definition ?? '';
		const parts = assertSplit(definition);
		expect(parts.items.map((i) => i.letter)).toEqual(['a', 'b', 'c']);
		expect(joinLettered(parts)).toBe(definition);
	});

	it("O01078's full-italic run splits into a), b)", async () => {
		const entries = await loadFixtures();
		const entry = findFixture(entries, 'O01078');
		const definition = entry.content.senses[0]?.definition ?? '';
		const parts = assertSplit(definition);
		expect(parts.items.map((i) => i.letter)).toEqual(['a', 'b']);
		expect(parts.items.map((i) => i.marker)).toEqual([
			'<i>a</i>)',
			'<i>b</i>)',
		]);
		expect(joinLettered(parts)).toBe(definition);
	});

	it("Q01353's mixed span-end + full-italic run splits into a), b)", async () => {
		const entries = await loadFixtures();
		const entry = findFixture(entries, 'Q01353');
		const definition = entry.content.senses[6]?.definition ?? '';
		expect(definition).toContain('<i>section, a</i>)');
		const parts = assertSplit(definition);
		expect(parts.items.map((i) => i.letter)).toEqual(['a', 'b']);
		expect(parts.items.map((i) => i.marker)).toEqual(['a</i>)', '<i>b</i>)']);
		expect(joinLettered(parts)).toBe(definition);
	});

	it("Q01198's span-start <i>a) run splits and re-opens its item", async () => {
		const entries = await loadFixtures();
		const entry = findFixture(entries, 'Q01198');
		const definition = entry.content.senses[0]?.definition ?? '';
		expect(definition).toContain('<i>a) for appearance');
		const parts = assertSplit(definition);
		expect(parts.items.map((i) => i.marker)).toEqual(['<i>a)', '<i>b</i>)']);
		expect(parts.items[0]?.text.startsWith('<i> for appearance')).toBe(true);
		expect(joinLettered(parts)).toBe(definition);
	});

	it('a Hebrew-adjacent marker (E00378 def#3) still splits', async () => {
		// E00378's third definition opens on Hebrew text ("כי ה׳") right
		// before the "a)" marker — separated by a closing tag and a
		// space, so the lookbehind (which only inspects the single
		// character immediately before the marker letter) never sees the
		// Hebrew and the run isn't blocked.
		const entries = await loadFixtures();
		const entry = findFixture(entries, 'E00378');
		const definition = entry.content.senses[2]?.definition ?? '';
		expect(definition).toContain('כי ה׳');
		const parts = assertSplit(definition);
		expect(parts.items.map((i) => i.letter)).toEqual(['a', 'b']);
		expect(joinLettered(parts)).toBe(definition);
	});
});
