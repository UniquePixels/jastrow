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
});

describe('fixture sweep (fixtures/lettered.jsonl)', () => {
	it('every definition either stays whole or round-trips exactly', async () => {
		const entries = await loadFixtures();
		let splitCount = 0;
		for (const entry of entries) {
			for (const sense of walkSenses(entry.content.senses)) {
				const definition = sense.definition ?? '';
				const parts = splitLettered(definition);
				if (parts === null) {
					continue;
				}
				splitCount++;
				expect(joinLettered(parts)).toBe(definition);
				expect(parts.items.length).toBeGreaterThanOrEqual(2);
			}
		}
		expect(entries.length).toBe(5);
		// Measured across the 5-entry fixture set (see task report for the
		// per-entry breakdown): A01999 def#1 [a,b,c], A01873 def#2
		// [a,b,c], C00031 def#2 [a,b,c,d], E00378 def#3 [a,b], C00009
		// def#2 [a,b] — 5 definitions split in total.
		expect(splitCount).toBe(5);
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
