import { describe, expect, it } from 'bun:test';
import type { SourceEntry } from '../body/types.ts';
import { applyPatch, parsePatch } from './schema.ts';
import { minimalUniqueSpan, patchesFor } from './seed-reviewed.ts';

const PIN = `sha256:${'a'.repeat(64)}`;
const OPTS: { firstId: number; pin: string; rationale: string } = {
	firstId: 194,
	pin: PIN,
	rationale: 'doc 01',
};

function entry(
	senses: SourceEntry['content']['senses'],
	refs?: string[],
): SourceEntry {
	return {
		content: { senses },
		headword: 'x',
		rid: 'A00913',
		...(refs === undefined ? {} : { refs }),
	} as SourceEntry;
}

function replay(
	base: SourceEntry,
	patches: ReturnType<typeof patchesFor>,
): SourceEntry {
	return patches.reduce((e, p) => applyPatch(e, p), base);
}

describe('patchesFor', () => {
	it('rejoins a chopped sense, then restores the space the old order kept', () => {
		const base = entry([
			{ definition: 'see (v. X', number: '1)' },
			{ definition: 'Y) night', number: '2)' },
		]);
		const want = entry([{ definition: 'see (v. X2) Y) night', number: '1)' }]);
		const patches = patchesFor(base, want, { ...OPTS, chopToken: '2)' });
		expect(replay(base, patches)).toEqual(want);
		expect(patches.map((p) => p.op)).toEqual(['join', 'replace']);
		expect(patches.map((p) => p.id)).toEqual(['P000194', 'P000195']);
		expect(patches[1]?.payload).toEqual({ find: ')Y', replace: ') Y' });
		for (const p of patches) {
			expect(parsePatch(JSON.parse(JSON.stringify(p)))).toEqual(p);
			expect(p.snapshot).toBe(PIN);
		}
	});

	it('retags a hyphen label to the em dash', () => {
		const base = entry([
			{ definition: 'a', number: '1)' },
			{ definition: 'b', number: '-2)' },
		]);
		const want = entry([
			{ definition: 'a', number: '1)' },
			{ definition: 'b', number: '—2)' },
		]);
		const patches = patchesFor(base, want, OPTS);
		expect(patches.map((p) => p.op)).toEqual(['retag']);
		expect(replay(base, patches)).toEqual(want);
	});

	it('adds bytes with a replace (C00062-style rtl wrap)', () => {
		const base = entry([{ definition: 'a. fr.—2) הַגְּ׳ the mouth' }]);
		const want = entry([
			{ definition: 'a. fr.—2) <span dir="rtl">הַגְּ׳</span> the mouth' },
		]);
		const patches = patchesFor(base, want, OPTS);
		expect(patches.map((p) => p.op)).toEqual(['replace']);
		expect(replay(base, patches)).toEqual(want);
	});

	it('unrefs an item the repaired entry lacks', () => {
		const base = entry([{ definition: 'a' }], ['Yoma 2a', 'Yoma 3b']);
		const want = entry([{ definition: 'a' }], ['Yoma 3b']);
		const patches = patchesFor(base, want, OPTS);
		expect(patches.map((p) => p.op)).toEqual(['unref']);
		expect(replay(base, patches)).toEqual(want);
	});

	it('counts senses that share a number and definition', () => {
		const base = entry([
			{ definition: 'same', number: '1)' },
			{ definition: 'same', number: '1)' },
		]);
		const want = entry([
			{ definition: 'same', number: '1)' },
			{ definition: 'same!', number: '1)' },
		]);
		const [patch] = patchesFor(base, want, OPTS);
		expect(patch?.expected_occurrences).toBe(2);
		expect(patch?.occurrence_index).toBe(2);
		expect(replay(base, patch ? [patch] : [])).toEqual(want);
	});

	it('throws when the sense trees cannot be paired', () => {
		const base = entry([{ definition: 'a' }, { definition: 'b' }]);
		const want = entry([{ definition: 'ab' }]);
		expect(() => patchesFor(base, want, OPTS)).toThrow('differ in shape');
	});

	it('throws when no op can reproduce the difference', () => {
		const base = entry([{ definition: 'a' }]);
		const want = {
			...entry([{ definition: 'a' }]),
			content: { morphology: 'm.', senses: [{ definition: 'a' }] },
		};
		expect(() => patchesFor(base, want, OPTS)).toThrow('do not reproduce');
	});
});

describe('minimalUniqueSpan', () => {
	it('widens an ambiguous span until it is unique', () => {
		expect(minimalUniqueSpan('a b a', 'a b ax')).toEqual({
			find: ' a',
			replace: ' ax',
		});
	});
});
