import { describe, expect, it } from 'bun:test';
import { buildAliases } from './seed-slug-index.ts';

interface Entry {
	headword: { text: string };
	id: string;
	slug: string;
}

function entry(id: string, slug: string, text: string): Entry {
	return { headword: { text }, id, slug };
}

describe('buildAliases', () => {
	it('points a shared stem at the member holding -1', () => {
		const { aliases, problems } = buildAliases([
			entry('A00012', 'אב-1', 'אַב־'),
			entry('A00013', 'אב-2', 'אָב'),
			entry('A00016', 'אב-3', 'אֵב'),
		]);
		expect(problems).toEqual([]);
		expect(aliases).toEqual([{ rid: 'A00012', slug: 'אב' }]);
	});

	it('gives a lone entry no alias: its slug is already the bare stem', () => {
		const { aliases, problems } = buildAliases([
			entry('A00010', 'אאלר״ן', 'אַאלר״ן'),
		]);
		expect(aliases).toEqual([]);
		expect(problems).toEqual([]);
	});

	it('reports a family whose bare stem is a real slug instead of aliasing it', () => {
		// An entry holding the bare `אב` leaves the family no alias to
		// give (§7.3 slug-bare-held). Silently overwriting it would point
		// one URL at two entries.
		const { aliases, problems } = buildAliases([
			entry('A00012', 'אב', 'אַב־'),
			entry('A00013', 'אב-2', 'אָב'),
		]);
		expect(aliases).toEqual([]);
		expect(problems).toEqual(['slug-bare-held: אב is a real slug; no alias']);
	});

	it('reports a family with no -1 member rather than picking one', () => {
		const { aliases, problems } = buildAliases([
			entry('A00012', 'אב-2', 'אַב־'),
			entry('A00013', 'אב-3', 'אָב'),
		]);
		expect(aliases).toEqual([]);
		expect(problems).toEqual(['no אב-1 among 2 members: A00012,A00013']);
	});

	it('folds pointed homographs onto one family', () => {
		// אָב and אֵב differ only in points, so they share a stem and a
		// single alias — the reason aliases are counted per stem, not
		// per headword string.
		const { aliases } = buildAliases([
			entry('A00012', 'אב-1', 'אָב'),
			entry('A00013', 'אב-2', 'אֵב'),
		]);
		expect(aliases).toHaveLength(1);
	});
});
