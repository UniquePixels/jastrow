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

	it('maps the proper-noun + gender compounds', () => {
		expect(parseMarker('pr. n. m.')).toEqual({ gender: 'm' });
		expect(parseMarker('pr. n. f.')).toEqual({ gender: 'f' });
	});

	it('maps bare proper-noun to null — no gender or number token', () => {
		expect(parseMarker('pr. n.')).toBeNull();
	});

	it('maps pr. n. pl. to null — pl. means "place" here, not plural', () => {
		// In Jastrow's abbreviation key, `pl.` after `pr. n.` marks a
		// place name, not a plural. There is no gender or number to
		// record until `grammar.pos` exists, so this is null exactly
		// like bare `pr. n.` above — not `{ number: 'pl' }`.
		expect(parseMarker('pr. n. pl.')).toBeNull();
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
