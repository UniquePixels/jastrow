import { describe, expect, it } from 'bun:test';
import { compareEntryMaps, type SourceEntry } from './compare-entries.ts';

const entry = (over: Partial<SourceEntry>): SourceEntry => ({
	rid: 'A00000',
	headword: 'א',
	content: { senses: [{ definition: 'x' }] },
	...over,
});
const toMap = (es: SourceEntry[]): Map<string, SourceEntry> =>
	new Map(es.map((e) => [e.rid, e]));

describe('compareEntryMaps', () => {
	it('reports no differences for identical maps', () => {
		const r = compareEntryMaps(toMap([entry({})]), toMap([entry({})]));
		expect(r.onlyInFresh).toEqual([]);
		expect(r.onlyInRaw).toEqual([]);
		expect(r.changed).toEqual([]);
	});

	it('reports a rid present on one side only', () => {
		const r = compareEntryMaps(
			toMap([entry({}), entry({ rid: 'B00001' })]),
			toMap([entry({})]),
		);
		expect(r.onlyInFresh).toEqual(['B00001']);
		expect(r.onlyInRaw).toEqual([]);
	});

	it('reports a headword change as a field diff', () => {
		const r = compareEntryMaps(
			toMap([entry({ headword: 'אָב' })]),
			toMap([entry({})]),
		);
		expect(r.changed[0]).toEqual({ rid: 'A00000', fields: ['headword'] });
	});

	it('reports an alt_headwords difference', () => {
		const r = compareEntryMaps(
			toMap([entry({ alt_headwords: ['אבא'] })]),
			toMap([entry({})]),
		);
		expect(r.changed[0]?.fields).toContain('alt_headwords');
	});

	it('reports a sense-count difference', () => {
		const r = compareEntryMaps(
			toMap([
				entry({
					content: { senses: [{ definition: 'x' }, { definition: 'y' }] },
				}),
			]),
			toMap([entry({})]),
		);
		expect(r.changed[0]?.fields).toContain('senseCount');
	});

	it('reports named field AND remainder drift for a mixed edit', () => {
		const r = compareEntryMaps(
			toMap([entry({ headword: 'אָב', refs: ['Jastrow 1'] })]),
			toMap([entry({})]),
		);
		expect(r.changed[0]?.fields).toEqual(['headword', 'other']);
	});
});
