/**
 * The census's drift gate. Corpus tier because it re-derives the
 * committed list from all 32,512 entries; the unit-tier file beside
 * it covers the detector's shape rules on fixtures.
 *
 * The census reads the RAW source — an implied-`1)` is a property of
 * what print transcribed, before any repair or rule touches it — so
 * this takes `sourceEntries()` and not the composed stage.
 */
import { describe, expect, it } from 'bun:test';
import { sourceEntries } from '../transform/rules/corpus-fixture.ts';
import { censusOf, IMPLIED_ONE_CENSUS } from './implied-one-census.ts';

describe('committed census (corpus)', () => {
	it('equals a fresh full-corpus census run (no drift)', async () => {
		expect(censusOf(await sourceEntries())).toEqual([...IMPLIED_ONE_CENSUS]);
	});
});
