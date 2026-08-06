import { describe, expect, it } from 'bun:test';
import { findCitations } from './cite.ts';
import { applyRepairs, CONFIRMED_NO_CHANGE } from './repairs.ts';
import { readSourceEntries } from './source.ts';
import type { SourceEntry } from './types.ts';

const FIXTURES_DIR = `${import.meta.dir}/fixtures`;
const FIXTURES = [
	`${FIXTURES_DIR}/broken-sequences.jsonl`,
	`${FIXTURES_DIR}/label-quarantines.jsonl`,
	`${FIXTURES_DIR}/numbering-extras.jsonl`,
	`${FIXTURES_DIR}/orphans.jsonl`,
];

/** Loads every repair-relevant fixture file once, keyed by rid. */
async function loadFixtures(): Promise<Map<string, SourceEntry>> {
	const entries = new Map<string, SourceEntry>();
	for (const file of FIXTURES) {
		for await (const entry of readSourceEntries(file)) {
			entries.set(entry.rid, entry);
		}
	}
	return entries;
}

function fixture(entries: Map<string, SourceEntry>, rid: string): SourceEntry {
	const entry = entries.get(rid);
	if (entry === undefined) {
		throw new Error(`fixture missing: ${rid}`);
	}
	return entry;
}

describe('applyRepairs', () => {
	it('leaves an untouched entry byte-identical and unrecorded', async () => {
		const entries = await loadFixtures();
		// A01350 is a confirmed-no-change row: swallowed boundary, marker
		// already in-text — the pass must not alter a byte.
		const source = fixture(entries, 'A01350');
		const { entry, records } = applyRepairs(source);
		expect(records).toEqual([]);
		expect(JSON.stringify(entry)).toBe(JSON.stringify(source));
	});

	it('never numbering-edits a confirmed-no-change row', async () => {
		const entries = await loadFixtures();
		for (const rid of CONFIRMED_NO_CHANGE) {
			const source = entries.get(rid);
			if (source === undefined) {
				continue; // not all rows are fixtured; corpus run covers the rest
			}
			// "No change" is the 01 numbering decision — the corpus-wide
			// binyan cleanup may still legitimately touch the same entry
			// (J00501 carries an empty binyan_form slot).
			const numbering = applyRepairs(source).records.filter(
				(r) => r.pass !== 'binyan-cleanup',
			);
			expect({ rid, numbering }).toEqual({ rid, numbering: [] });
		}
	});

	it('rejoins a mid-list chopped crossref (A00913)', async () => {
		const entries = await loadFixtures();
		const source = fixture(entries, 'A00913');
		const { entry, records } = applyRepairs(source);
		expect(records.map((r) => r.pass)).toEqual(['rejoin-chopped']);
		expect(entry.content.senses.length).toBe(source.content.senses.length - 1);
		const merged = entry.content.senses[0]?.definition ?? '';
		const prev = source.content.senses[0]?.definition ?? '';
		const chopped = source.content.senses[1]?.definition ?? '';
		expect(merged).toBe(`${prev}2)${chopped}`);
	});

	it('rejoins an entry-start chop into its own head (J00301)', async () => {
		const entries = await loadFixtures();
		const source = fixture(entries, 'J00301');
		const { entry } = applyRepairs(source);
		const first = entry.content.senses[0];
		expect(first?.number).toBeUndefined();
		expect(first?.definition?.startsWith('2)')).toBe(true);
	});

	it("rejoins C00244's chopped citation at 4)", async () => {
		const entries = await loadFixtures();
		const source = fixture(entries, 'C00244');
		const { entry } = applyRepairs(source);
		expect(entry.content.senses.some((s) => s.number === '4)')).toBe(false);
	});

	it('inserts the implied 1) on B01321 and flags it as a deviation', async () => {
		const entries = await loadFixtures();
		const { entry, records } = applyRepairs(fixture(entries, 'B01321'));
		expect(entry.content.senses[0]?.number).toBe('1)');
		expect(records).toEqual([
			expect.objectContaining({ pass: 'implied-one', deviation: true }),
		]);
	});

	it("inserts the implied 1) on U01787's Af. stem child", async () => {
		const entries = await loadFixtures();
		const { entry } = applyRepairs(fixture(entries, 'U01787'));
		const af = entry.content.senses.find(
			(s) => s.grammar?.verbal_stem === 'Af.',
		);
		expect(af?.senses?.[0]?.number).toBe('1)');
	});

	it("inserts D00072's implied 1) in-text", async () => {
		const entries = await loadFixtures();
		const { entry } = applyRepairs(fixture(entries, 'D00072'));
		expect(entry.content.senses[0]?.definition).toContain(
			'(b. h.) 1) <i>to cleave',
		);
	});

	it('reinserts a swallowed marker (C00062) without a deviation flag', async () => {
		const entries = await loadFixtures();
		const { entry, records } = applyRepairs(fixture(entries, 'C00062'));
		expect(entry.content.senses[0]?.definition).toContain('a. fr.—2) הַגְּ׳');
		expect(records).toEqual([
			expect.objectContaining({ pass: 'marker-reinsert', deviation: false }),
		]);
	});

	it('repairs the ASCII-hyphen label on M02309', async () => {
		const entries = await loadFixtures();
		const { entry } = applyRepairs(fixture(entries, 'M02309'));
		expect(entry.content.senses.some((s) => s.number === '—2)')).toBe(true);
		expect(entry.content.senses.some((s) => s.number === '-2)')).toBe(false);
	});

	it("moves D00341's bracket into the sense text", async () => {
		const entries = await loadFixtures();
		const { entry, records } = applyRepairs(fixture(entries, 'D00341'));
		const first = entry.content.senses[0];
		expect(first?.number).toBe('1)');
		expect(first?.definition?.startsWith('[')).toBe(true);
		expect(records).toEqual([
			expect.objectContaining({ pass: 'label-repair', deviation: true }),
		]);
	});

	it('escapes the gershayim anchor so the full ref parses (A01069)', async () => {
		const entries = await loadFixtures();
		const { entry } = applyRepairs(fixture(entries, 'A01069'));
		const definition = entry.content.senses[0]?.definition ?? '';
		expect(definition).toContain('data-ref="Jastrow, א&quot;ט 1"');
		const [hit] = findCitations(definition);
		expect(hit?.malformed).toBe(false);
		expect(hit?.dataRef).toBe('Jastrow, א&quot;ט 1');
		expect(hit?.kind).toBe('internal');
	});

	it("wraps P00331's bare ibid citation with its refs resolution", async () => {
		const entries = await loadFixtures();
		const { entry } = applyRepairs(fixture(entries, 'P00331'));
		const all = entry.content.senses.map((s) => s.definition ?? '').join('');
		expect(all).toContain(
			'<a class="refLink" href="/Eruvin.88b.1" data-ref="Eruvin 88b:1">Ib. 88ᵇ</a>',
		);
	});

	it('removes the baseless refs item from D00541', async () => {
		const entries = await loadFixtures();
		const source = fixture(entries, 'D00541');
		const { entry } = applyRepairs(source);
		expect(source.refs).toContain('Yoma 2a');
		expect(entry.refs).not.toContain('Yoma 2a');
		expect(entry.refs?.length).toBe((source.refs?.length ?? 0) - 1);
	});

	it('cleans binyan forms: drops empties, trims stray spaces', () => {
		const synthetic: SourceEntry = {
			content: {
				senses: [
					{
						grammar: { binyan_form: ['אִתְאָחַד', ' אִתָּחַד', ''] },
						senses: [],
					},
				],
			},
			headword: 'x',
			rid: 'X00000',
		};
		const { entry, records } = applyRepairs(synthetic);
		expect(entry.content.senses[0]?.grammar?.binyan_form).toEqual([
			'אִתְאָחַד',
			'אִתָּחַד',
		]);
		expect(records).toEqual([
			expect.objectContaining({ pass: 'binyan-cleanup' }),
		]);
	});

	it('is loud, not silent, when a find-text is stale', async () => {
		const entries = await loadFixtures();
		const tampered = structuredClone(fixture(entries, 'C00062'));
		for (const sense of tampered.content.senses) {
			sense.definition = (sense.definition ?? '').replace('הַגְּ׳', 'X');
		}
		expect(() => applyRepairs(tampered)).toThrow(/matched 0×/u);
	});
});
