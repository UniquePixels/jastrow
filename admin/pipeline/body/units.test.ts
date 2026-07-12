import { describe, expect, it } from 'bun:test';
import { walkSenses } from './census.ts';
import { segmentUnits } from './units.ts';

const CITE = (ref: string, txt: string): string =>
	`<a class="refLink" href="/${ref.replaceAll(' ', '_')}" data-ref="${ref}">${txt}</a>`;

describe('segmentUnits synthetic cases: breaks', () => {
	it('breaks a unit at a period before a citation', () => {
		const text = `foo bar. ${CITE('Sanh. 39a', 'Sanh. 39a')} more text.`;
		const { gloss, units } = segmentUnits(text);
		expect(gloss).toBe('foo bar. ');
		expect(units).toHaveLength(1);
		expect(units[0]).toBe(`${CITE('Sanh. 39a', 'Sanh. 39a')} more text.`);
		expect(gloss + units.join('')).toBe(text);
	});

	it('does not break on a semicolon-joined citation list', () => {
		const text = `foo. ${CITE('Sanh. 39a', 'Sanh. 39a')} bar; ${CITE('Ber. 26b', 'Ber. 26b')} baz`;
		const { gloss, units } = segmentUnits(text);
		// Only the first citation follows a period; the second follows a
		// semicolon, so it stays inside the first unit rather than opening
		// a new one.
		expect(units).toHaveLength(1);
		expect(gloss + units.join('')).toBe(text);
	});

	it('does not break on an embedded parenthesized citation', () => {
		const text = `foo. ${CITE('Sanh. 39a', 'Sanh. 39a')} (play on ${CITE('Ber. 26b', 'Ber. 26b')}) bar.`;
		const { gloss, units } = segmentUnits(text);
		expect(units).toHaveLength(1);
		expect(gloss + units.join('')).toBe(text);
	});

	it('breaks a unit at an em dash before a citation', () => {
		const text = `foo bar.—${CITE('Sanh. 39a', 'Sanh. 39a')} baz.`;
		const { gloss, units } = segmentUnits(text);
		expect(gloss).toBe('foo bar.—');
		expect(units).toHaveLength(1);
		expect(gloss + units.join('')).toBe(text);
	});

	it('opens unit[0] at sense start when the definition begins with a citation', () => {
		const text = `${CITE('Sanh. 39a', 'Sanh. 39a')} foo bar.`;
		const { gloss, units } = segmentUnits(text);
		expect(gloss).toBe('');
		expect(units).toHaveLength(1);
		expect(units[0]).toBe(text);
		expect(gloss + units.join('')).toBe(text);
	});

	it('round-trips a definition with multiple period-separated units', () => {
		const text = `a. ${CITE('X 1', 'X 1')} b. ${CITE('Y 2', 'Y 2')} c.`;
		const { gloss, units } = segmentUnits(text);
		expect(units).toHaveLength(2);
		expect(gloss + units.join('')).toBe(text);
	});
});

describe('segmentUnits synthetic cases: non-breaks', () => {
	it('does not break on a comma before a citation', () => {
		const text = `foo, ${CITE('Sanh. 39a', 'Sanh. 39a')} bar.`;
		const { gloss, units } = segmentUnits(text);
		expect(units).toHaveLength(0);
		expect(gloss).toBe(text);
	});

	it('never breaks on a malformed citation hit', () => {
		// Open tag whose href quote never closes cleanly — malformed, so it
		// must never open a unit even though it sits right after a period.
		const malformed = '<a class="refLink" href="/X.1</a>fragment</a>';
		const text = `foo bar. ${malformed} baz.`;
		const { gloss, units } = segmentUnits(text);
		expect(units).toHaveLength(0);
		expect(gloss).toBe(text);
	});

	it('returns an empty units array and the whole text as gloss when there is no citation', () => {
		const text = 'plain text with no anchors at all.';
		const { gloss, units } = segmentUnits(text);
		expect(gloss).toBe(text);
		expect(units).toEqual([]);
	});
});

describe('segmentUnits fixture sweep', () => {
	const fixtureFiles = [
		'baseline.jsonl',
		'broken-sequences.jsonl',
		'lettered.jsonl',
		'origin-splits.jsonl',
		'orphans.jsonl',
		'quotes-stragglers.jsonl',
		'stems.jsonl',
		'units-hard.jsonl',
	];

	for (const file of fixtureFiles) {
		it(`round-trips gloss + units.join('') === definition for every sense in ${file}`, async () => {
			const path = `${import.meta.dir}/fixtures/${file}`;
			const text = await Bun.file(path).text();
			const lines = text.split('\n').filter((line) => line.trim() !== '');
			expect(lines.length).toBeGreaterThan(0);

			for (const line of lines) {
				const entry = JSON.parse(line);
				for (const sense of walkSenses(entry.content.senses)) {
					const definition = sense.definition ?? '';
					const { gloss, units } = segmentUnits(definition);
					expect(`${gloss}${units.join('')}`).toBe(definition);
				}
			}
		});
	}
});

describe('segmentUnits A00014 pin', () => {
	it('measures the unit count for the first sense with slash-less detection active', async () => {
		const path = `${import.meta.dir}/fixtures/origin-splits.jsonl`;
		const text = await Bun.file(path).text();
		const lines = text.split('\n').filter((line) => line.trim() !== '');
		const entry = lines
			.map((line) => JSON.parse(line))
			.find((e) => e.rid === 'A00014');
		expect(entry).toBeDefined();

		const [firstSense] = entry.content.senses;
		const definition = firstSense.definition ?? '';
		const { gloss, units } = segmentUnits(definition);

		// The design-session manual count was 7 units, made without
		// noticing that the "Y. Ned." citation after "…prophets. " (a
		// slash-less href) also opens a period boundary. With slash-less
		// href detection active (cite.ts already classifies it `external`
		// regardless of the leading slash), that citation is measured here
		// as one of the 7 — matching the manual count, but for a different
		// reason: the manual pass missed it as a boundary opener, not as
		// a citation.
		expect(units).toHaveLength(7);
		expect(`${gloss}${units.join('')}`).toBe(definition);
	});
});
