import { describe, expect, it } from 'bun:test';
import {
	IMPLIED_ONE_CENSUS,
	isImpliedOneCandidate,
	runCensus,
} from './implied-one-census.ts';
import { readSourceEntries } from './source.ts';
import type { SourceEntry } from './types.ts';

const FIXTURES_DIR = `${import.meta.dir}/fixtures`;

/** A minimal entry with one unnumbered sense holding `definition`. */
function entryWith(definition: string): SourceEntry {
	return {
		content: { senses: [{ definition }] },
		headword: 'טֶסְט',
		rid: 'T99999',
	};
}

describe('isImpliedOneCandidate', () => {
	it('flags an in-text —2) run with no preceding 1)', () => {
		expect(
			isImpliedOneCandidate(
				entryWith('v. אוֹר.—2) <i>to shine</i>. Ber. 2ᵃ; a. fr.'),
			),
		).toBe(true);
	});

	it('ignores a definition whose 1) precedes the —2) (complete run)', () => {
		expect(
			isImpliedOneCandidate(
				entryWith('1) <i>to open</i>. Sabb. 3ᵇ.—2) <i>to begin</i>.'),
			),
		).toBe(false);
	});

	it('sees through markup around the earlier 1)', () => {
		expect(
			isImpliedOneCandidate(
				entryWith('<b>1)</b> <i>to open</i>.—2) <i>to begin</i>.'),
			),
		).toBe(false);
	});

	it('ignores a numbered sense — the structural class is censused elsewhere', () => {
		const entry: SourceEntry = {
			content: {
				senses: [{ definition: '—2) <i>to begin</i>. ', number: '—2)' }],
			},
			headword: 'טֶסְט',
			rid: 'T99998',
		};
		expect(isImpliedOneCandidate(entry)).toBe(false);
	});

	it('ignores a bare parenthetical 2) that lacks the em-dash run shape', () => {
		expect(
			isImpliedOneCandidate(
				entryWith('Lam. R. introd. (R. Joḥ. 2) you have to walk.'),
			),
		).toBe(false);
	});

	it('flags D00072 (the confirmed in-text shape) from the committed fixture', async () => {
		let found = false;
		for await (const entry of readSourceEntries(
			`${FIXTURES_DIR}/numbering-extras.jsonl`,
		)) {
			if (entry.rid === 'D00072') {
				found = true;
				expect(isImpliedOneCandidate(entry)).toBe(true);
			}
		}
		expect(found).toBe(true);
	});
});

describe('committed census', () => {
	it('is sorted, unique, and 79 rids (78 unreviewed + D00072)', () => {
		const sorted = [...IMPLIED_ONE_CENSUS].sort((a, b) => a.localeCompare(b));
		expect(IMPLIED_ONE_CENSUS).toEqual(sorted);
		expect(new Set(IMPLIED_ONE_CENSUS).size).toBe(IMPLIED_ONE_CENSUS.length);
		expect(IMPLIED_ONE_CENSUS).toHaveLength(79);
		expect(IMPLIED_ONE_CENSUS).toContain('D00072');
	});

	it('equals a fresh full-corpus census run (no drift)', async () => {
		expect(await runCensus()).toEqual([...IMPLIED_ONE_CENSUS]);
	});
});
