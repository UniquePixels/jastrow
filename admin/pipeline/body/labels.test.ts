import { describe, expect, it } from 'bun:test';
import { walkSenses } from './census.ts';
import { parseLabel, printLabel } from './labels.ts';
import { parseSourceEntry, readSourceEntries } from './source.ts';
import type { SourceEntry } from './types.ts';

describe('parseLabel', () => {
	it('parses bare digit labels', () => {
		expect(parseLabel('1)')).toEqual({ dash: false, label: '1', star: false });
	});

	it('parses em-dash prefixed labels', () => {
		expect(parseLabel('—2)')).toEqual({
			dash: true,
			label: '2',
			star: false,
		});
		expect(parseLabel('—3)')).toEqual({
			dash: true,
			label: '3',
			star: false,
		});
	});

	it('parses single-letter labels', () => {
		expect(parseLabel('a)')).toEqual({ dash: false, label: 'a', star: false });
		expect(parseLabel('—b)')).toEqual({ dash: true, label: 'b', star: false });
	});

	it('parses star-flagged labels (measured corpus form: "*N)", no dash combo observed)', () => {
		expect(parseLabel('*2)')).toEqual({ dash: false, label: '2', star: true });
		expect(parseLabel('*6)')).toEqual({ dash: false, label: '6', star: true });
	});

	it('parses multi-digit labels', () => {
		expect(parseLabel('—10)')).toEqual({
			dash: true,
			label: '10',
			star: false,
		});
	});

	it('returns {unknown} for unparseable input instead of guessing', () => {
		expect(parseLabel('II.')).toEqual({ unknown: 'II.' });
		expect(parseLabel('')).toEqual({ unknown: '' });
		expect(parseLabel('1')).toEqual({ unknown: '1' });
		expect(parseLabel('a')).toEqual({ unknown: 'a' });
	});

	it('rejects uppercase letter labels (corpus letter labels are lowercase-only)', () => {
		expect(parseLabel('A)')).toEqual({ unknown: 'A)' });
		expect(parseLabel('—B)')).toEqual({ unknown: '—B)' });
	});

	// Measured corpus damage classes (data/source/jastrow-dictionary.jsonl):
	// a bracket standing in for a digit, and an ASCII hyphen-minus standing
	// in for the em dash. Both quarantine rather than being coerced, since
	// coercing would break byte-exact regeneration for these source strings.
	it('quarantines the two measured off-grammar shapes', () => {
		expect(parseLabel('[1)')).toEqual({ unknown: '[1)' });
		expect(parseLabel('-2)')).toEqual({ unknown: '-2)' });
	});
});

describe('printLabel', () => {
	it('round-trips the case table', () => {
		for (const raw of ['1)', '—2)', '—3)', 'a)', '—b)', '*2)', '*6)', '—10)']) {
			const parsed = parseLabel(raw);
			if ('unknown' in parsed) {
				throw new Error(`expected ${raw} to parse, got {unknown}`);
			}
			expect(printLabel(parsed)).toBe(raw);
		}
	});
});

// Corpus-measured off-grammar shapes (see labels.ts module comment for the
// full value-space measurement). Each entry here is a raw sense.number
// value that parseLabel must quarantine (return {unknown} for) — the
// corpus sweep below asserts every OTHER distinct observed value
// round-trips.
const EXPECTED_QUARANTINE = new Set<string>([
	// rid D00341, first sense: a bracket where a digit belongs (upstream
	// OCR/transcription damage) — 1 occurrence corpus-wide.
	'[1)',
	// ASCII hyphen-minus (U+002D) standing in for the em dash (U+2014)
	// used everywhere else for the same continuation marker — 5
	// occurrences corpus-wide (rids incl. M02309, O00408, S02030, U00745,
	// U00939).
	'-2)',
]);

/** Every distinct `sense.number` value found across a set of entries, with
 * occurrence counts — shared by the corpus and fixture sweeps below. */
function tallyLabels(entries: Iterable<SourceEntry>): Map<string, number> {
	const seen = new Map<string, number>();
	for (const entry of entries) {
		for (const sense of walkSenses(entry.content.senses)) {
			if (sense.number !== undefined) {
				seen.set(sense.number, (seen.get(sense.number) ?? 0) + 1);
			}
		}
	}
	return seen;
}

/** A raw value either round-trips through parseLabel/printLabel or is on
 * the explicit quarantine list — anything else is a reportable failure. */
function checkLabel(raw: string): string | undefined {
	const parsed = parseLabel(raw);
	if ('unknown' in parsed) {
		return EXPECTED_QUARANTINE.has(raw)
			? undefined
			: `${raw} (unquarantined parse failure)`;
	}
	return printLabel(parsed) === raw
		? undefined
		: `${raw} (round-trip mismatch)`;
}

function checkAllLabels(values: Iterable<string>): string[] {
	const failures: string[] = [];
	for (const raw of values) {
		const failure = checkLabel(raw);
		if (failure !== undefined) {
			failures.push(failure);
		}
	}
	return failures;
}

describe('parseLabel/printLabel corpus sweep', () => {
	it('round-trips or quarantines every distinct sense.number value in the corpus', async () => {
		// Tally while streaming — buffering all 32,512 entries would hold
		// the ~41 MB corpus in memory against source.ts's own contract.
		const seen = new Map<string, number>();
		for await (const entry of readSourceEntries()) {
			for (const [raw, count] of tallyLabels([entry])) {
				seen.set(raw, (seen.get(raw) ?? 0) + count);
			}
		}
		expect(seen.size).toBeGreaterThan(0);
		expect(checkAllLabels(seen.keys())).toEqual([]);

		// Every value this test declares quarantined must actually appear
		// in the corpus and actually fail to parse — otherwise the
		// quarantine list has drifted from reality.
		const quarantineDrift = [...EXPECTED_QUARANTINE].filter(
			(raw) => !(seen.has(raw) && 'unknown' in parseLabel(raw)),
		);
		expect(quarantineDrift).toEqual([]);
	});
});

async function loadFixtureEntries(fixturesDir: string): Promise<SourceEntry[]> {
	const glob = new Bun.Glob('*.jsonl');
	const files = await Array.fromAsync(glob.scan({ cwd: fixturesDir }));
	const texts = await Promise.all(
		files.map((file) => Bun.file(`${fixturesDir}/${file}`).text()),
	);
	return texts
		.flatMap((text) => text.split('\n'))
		.filter((line) => line.trim() !== '')
		.map((line) => parseSourceEntry(line));
}

describe('parseLabel/printLabel fixture sweep', () => {
	it('round-trips or quarantines every sense.number in every fixtures/*.jsonl entry', async () => {
		const fixturesDir = `${import.meta.dir}/fixtures`;
		const entries = await loadFixtureEntries(fixturesDir);
		expect(entries.length).toBeGreaterThan(0);

		const seen = tallyLabels(entries);
		expect(seen.size).toBeGreaterThan(0);
		expect(checkAllLabels(seen.keys())).toEqual([]);
	});
});
