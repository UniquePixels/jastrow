import { describe, expect, it } from 'bun:test';
import { buildBody, buildTrace } from './dry-run.ts';
import { evaluateRoundTrip } from './dry-run-verify.ts';
import { readSourceEntries } from './source.ts';
import type { SourceEntry } from './types.ts';

const FIXTURES_DIR = `${import.meta.dir}/fixtures`;

async function loadFixture(name: string): Promise<SourceEntry[]> {
	const entries: SourceEntry[] = [];
	for await (const entry of readSourceEntries(`${FIXTURES_DIR}/${name}`)) {
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

describe('buildBody structure: baseline.jsonl (trivial entries)', () => {
	it('builds one unlabeled intro sense per entry, no stems or quarantines', async () => {
		const entries = await loadFixture('baseline.jsonl');
		expect(entries.length).toBe(3);
		for (const e of entries) {
			const { body, problems } = buildBody(e);
			expect(problems).toEqual([]);
			expect(body.id).toBe(e.rid);
			expect(body.stems).toBeUndefined();
			expect(body.senses.length).toBeGreaterThan(0);
			expect(body.senses[0]?.label).toBeUndefined();
		}
	});
});

describe('buildBody structure: origin-splits.jsonl (K00664 straddle heals)', () => {
	it('folds the etymology paren and sense-1 text into one contiguous intro gloss', async () => {
		const entries = await loadFixture('origin-splits.jsonl');
		const k00664 = findFixture(entries, 'K00664');
		const { body } = buildBody(k00664);
		// language_reference opens "= <span>כרכר</span>" and sense-1
		// continues ", v. …)" — split across two source fields, contiguous
		// only once rejoined.
		expect(body.senses[0]?.gloss).toContain(
			'= <span dir="rtl">כרכר</span>, v. ',
		);
	});

	it('labels A00014 sense[1..3] "1"/"2"/"3", intro unlabeled', async () => {
		const entries = await loadFixture('origin-splits.jsonl');
		const a00014 = findFixture(entries, 'A00014');
		const { body } = buildBody(a00014);
		expect(body.senses.map((s) => s.label)).toEqual([undefined, '1', '2', '3']);
	});
});

describe('buildBody structure: stems.jsonl (A00030 stems array shape)', () => {
	it('routes grammar nodes into stems with stem/forms/senses, in source order', async () => {
		const entries = await loadFixture('stems.jsonl');
		const a00030 = findFixture(entries, 'A00030');
		const { body, problems } = buildBody(a00030);
		expect(problems).toEqual([]);
		expect(body.stems?.map((s) => s.stem)).toEqual(['Nif.', 'Pi.']);
		expect(body.stems?.[0]?.forms).toEqual(['נֶאֱבַד']);
		expect(body.stems?.[0]?.senses.map((s) => s.label)).toEqual([undefined]);
		expect(body.stems?.[1]?.forms).toEqual(['אִיבֵּד']);
		expect(body.stems?.[1]?.senses.map((s) => s.label)).toEqual(['1', '2']);
	});
});

describe('buildBody structure: lettered.jsonl (child senses with letters)', () => {
	it("splits A01999's intro gloss into lettered child senses a/b/c", async () => {
		const entries = await loadFixture('lettered.jsonl');
		const a01999 = findFixture(entries, 'A01999');
		const { body } = buildBody(a01999);
		expect(body.senses[0]?.senses?.map((s) => s.label)).toEqual([
			'a',
			'b',
			'c',
		]);
	});
});

describe('buildBody structure: units-hard.jsonl (malformed citations)', () => {
	it("builds D00478's intro sense without throwing on its malformed citation", async () => {
		const entries = await loadFixture('units-hard.jsonl');
		const d00478 = findFixture(entries, 'D00478');
		const { body, problems } = buildBody(d00478);
		expect(problems).toEqual([]);
		expect(body.senses[0]?.gloss.length).toBeGreaterThan(0);
	});
});

describe('buildBody round-trip: byte-exact reassembly across every named fixture', () => {
	const fixtureFiles = [
		'baseline.jsonl',
		'origin-splits.jsonl',
		'stems.jsonl',
		'lettered.jsonl',
		'units-hard.jsonl',
	];

	for (const file of fixtureFiles) {
		it(`round-trips rejoin/units/lettered for every entry in ${file}`, async () => {
			const entries = await loadFixture(file);
			expect(entries.length).toBeGreaterThan(0);

			const mismatches: { rid: string; rule: string }[] = [];
			for (const e of entries) {
				const trace = buildTrace(e);
				const result = evaluateRoundTrip(e, trace);
				if (!result.rejoin) {
					mismatches.push({ rid: e.rid, rule: 'rejoin' });
				}
				if (!result.units) {
					mismatches.push({ rid: e.rid, rule: 'units' });
				}
				if (!result.lettered) {
					mismatches.push({ rid: e.rid, rule: 'lettered' });
				}
			}
			expect(mismatches).toEqual([]);
		});
	}
});
