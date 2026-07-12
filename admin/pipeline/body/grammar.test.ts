import { describe, expect, it } from 'bun:test';
import { parseMarker } from './grammar.ts';

describe('parseMarker core vocabulary', () => {
	it('maps the plain gender markers', () => {
		expect(parseMarker('m.')).toEqual({ gender: 'm' });
		expect(parseMarker('f.')).toEqual({ gender: 'f' });
		expect(parseMarker('c.')).toEqual({ gender: 'c' });
	});

	it('maps gender + plural combos', () => {
		expect(parseMarker('m. pl.')).toEqual({ gender: 'm', number: 'pl' });
		expect(parseMarker('f. pl.')).toEqual({ gender: 'f', number: 'pl' });
	});

	it('maps gender + dual combos', () => {
		expect(parseMarker('m. du.')).toEqual({ gender: 'm', number: 'du' });
		expect(parseMarker('f. du.')).toEqual({ gender: 'f', number: 'du' });
	});

	it('maps the proper-noun + gender/number compounds', () => {
		expect(parseMarker('pr. n. m.')).toEqual({ gender: 'm' });
		expect(parseMarker('pr. n. f.')).toEqual({ gender: 'f' });
		expect(parseMarker('pr. n. pl.')).toEqual({ number: 'pl' });
	});

	it('maps bare proper-noun to null — no gender or number token', () => {
		expect(parseMarker('pr. n.')).toBeNull();
	});
});

describe('parseMarker trimming', () => {
	it('trims surrounding whitespace before lookup', () => {
		expect(parseMarker(' m. ')).toEqual({ gender: 'm' });
		expect(parseMarker('\tf. pl.\n')).toEqual({ gender: 'f', number: 'pl' });
	});
});

describe('parseMarker unknown values', () => {
	it('reports values outside the closed vocabulary instead of guessing', () => {
		expect(parseMarker('pr. n. m.?!')).toEqual({ unknown: 'pr. n. m.?!' });
		expect(parseMarker('adj.')).toEqual({ unknown: 'adj.' });
	});

	it('never throws on empty or garbage input', () => {
		expect(parseMarker('')).toEqual({ unknown: '' });
		expect(() => parseMarker('')).not.toThrow();
	});
});

const REPORT_PATH = 'data/source/body-census-report.json';

// Gitignored machine artifact (data architecture spec D2) — regenerate
// with `bun body:census` if missing. The suite still runs when it is
// present (as it is expected to be for anyone verifying this task).
const hasReport: boolean = await Bun.file(REPORT_PATH).exists();

describe.skipIf(!hasReport)('parseMarker census coverage', () => {
	it('parses every observed marker value without {unknown}', async () => {
		const report = (await Bun.file(REPORT_PATH).json()) as {
			markers: Record<string, number>;
		};
		const markers = Object.keys(report.markers);
		expect(markers.length).toBeGreaterThan(0);
		for (const marker of markers) {
			const parsed = parseMarker(marker);
			expect(parsed).not.toHaveProperty('unknown');
		}
	});
});
