import { describe, expect, it } from 'bun:test';
import { buildTranches, chunkCorpus } from './chunks.ts';
import { buildChunkInput } from './corpus-inputs.ts';
import {
	ADJUDICATED,
	isResidueTranche,
	RESIDUE_CHUNK_PREFIX,
	RESIDUE_TRANCHE_PREFIX,
	residueTranches,
	sweepRids,
} from './residue-sweep.ts';
import { sampleFiles } from './tranche.ts';

/** A residue-shaped rid list: the adjudicated ones plus filler, so
 * `sweepRids` has something to keep as well as something to drop. */
function residueOf(extra: readonly string[]): string[] {
	return [...ADJUDICATED, ...extra].sort();
}

describe('sweepRids', () => {
	it('removes every adjudicated rid and keeps the rest', () => {
		const kept = sweepRids(residueOf(['Z00001', 'Z00002']));
		expect(kept).toEqual(['Z00001', 'Z00002']);
	});

	it('excludes exactly 65 entries, the union items 1 and 2 adjudicated', () => {
		const residue = residueOf(['Z00001']);
		expect(residue.length - sweepRids(residue).length).toBe(65);
		expect(new Set(ADJUDICATED).size).toBe(65);
	});

	// The positive control for the guard: without it, an ADJUDICATED
	// rid that has left the residue removes nothing and the exclusion
	// silently narrows. A test that only checks the happy path cannot
	// tell that state from a working one.
	it('THROWS when an adjudicated rid is absent from the residue', () => {
		const short = residueOf([]).filter((rid) => rid !== 'I00311');
		expect(() => sweepRids(short)).toThrow(/I00311/u);
	});

	it('names every missing rid, not just the first', () => {
		const short = residueOf([]).filter(
			(rid) => rid !== 'I00311' && rid !== 'A00717',
		);
		expect(() => sweepRids(short)).toThrow(/A00717.*I00311|I00311.*A00717/u);
	});
});

describe('residue chunk and tranche ids', () => {
	const rids = Array.from(
		{ length: 65 },
		(_, i) => `Z${String(i).padStart(5, '0')}`,
	);

	it('cannot collide with the batch path, which names a different rid set', () => {
		const batch = chunkCorpus(rids).map((c) => c.id);
		const residue = residueTranches(rids).tranches.flatMap((t) =>
			t.chunks.map((c) => c.id),
		);
		expect(batch[0]).toBe('chunk-00001');
		expect(residue[0]).toBe('chunk-r00001');
		expect(residue.some((id) => batch.includes(id))).toBe(false);
	});

	// `ingest` globs `chunk-*.json`. A prefix outside that stem would
	// make every residue chunk silently invisible to ingest rather
	// than failing.
	it('keeps the stem ingest globs on', () => {
		expect(RESIDUE_CHUNK_PREFIX.startsWith('chunk-')).toBe(true);
		expect(residueTranches(rids).tranches[0]?.id).toBe(
			`${RESIDUE_TRANCHE_PREFIX}01`,
		);
	});

	it('fingerprints the residue list, not the corpus', () => {
		const a = residueTranches(rids).fingerprint;
		const b = residueTranches([...rids, 'Z99999']).fingerprint;
		expect(a).not.toBe(b);
	});

	it('discriminates the two tranche families', () => {
		expect(isResidueTranche('residue-01')).toBe(true);
		expect(isResidueTranche('tranche-01')).toBe(false);
	});

	it('is order-independent, like the batch chunker', () => {
		const forward = residueTranches(rids).fingerprint;
		const reversed = residueTranches([...rids].reverse()).fingerprint;
		expect(forward).toBe(reversed);
	});
});

describe('chunkCorpus / buildTranches id prefixes', () => {
	it('default to the batch path when no prefix is given', () => {
		expect(chunkCorpus(['A1', 'A2'], 30)[0]?.id).toBe('chunk-00001');
		expect(buildTranches(chunkCorpus(['A1'], 30))[0]?.id).toBe('tranche-01');
	});
});

// The verification sample shows an Opus reviewer a patch beside its
// entry. A patch's `expected_before` is byte-exact against the state
// its AUTHOR was handed, so a sample built from a re-derived
// pre-patch corpus would show the reviewer text the patch cannot
// match — on the 2,093 residue entries a transform rewrote, which is
// 53% of the population. It would read as a catastrophic error rate
// against the one gate the spec kept (T2, substantive errors <= 5%),
// and nothing else in the suite looks at it.
describe('the verification sample reads the entries the agent read', () => {
	const healedEntry = {
		content: {
			senses: [{ definition: 'x <span dir="rtl">א׳</span> y' }],
		},
		headword: 'a',
		rid: 'A00018',
	} as never;
	const patch = { id: 'P1', rid: 'A00018' } as never;
	const sample = { clean: ['A00018'], high: [], lowMed: [patch] } as never;

	it('shows the healed entry a residue patch was written against', () => {
		const files = sampleFiles(
			sample,
			[patch],
			new Map([['A00018', healedEntry]]),
		);
		expect(files.patches[0]?.entry).toBe(healedEntry);
		expect(files.clean[0]?.entry).toBe(healedEntry);
	});

	// The defect this replaced: `ingest` resolved sample entries
	// through `loadPrePatchCorpus()`, so a residue patch would have
	// been reviewed beside text it cannot match.
	it('reports undefined rather than substituting another corpus state', () => {
		const files = sampleFiles(sample, [patch], new Map());
		expect(files.patches[0]?.entry).toBeUndefined();
		expect(files.clean[0]?.entry).toBeUndefined();
	});

	it('refuses a workdir mixing both populations', async () => {
		const src = await Bun.file('admin/pipeline/research/tranche.ts').text();
		// Behavioural coverage would need a full ingest harness; what
		// this pins is that the refusal exists and names both families,
		// because the failure it prevents is silent.
		expect(src).toContain('mixes populations');
		expect(src).toContain("? 'residue'");
	});

	it('carries the whole chain on the entry, not just the sampled patch', () => {
		const second = { id: 'P2', rid: 'A00018' } as never;
		const files = sampleFiles(
			sample,
			[patch, second],
			new Map([['A00018', healedEntry]]),
		);
		expect(files.patches[0]?.chain).toEqual([patch, second]);
		expect(files.patches[0]?.patchUnderReview).toBe('P1');
	});
});

describe('ChunkInput.corpusStage', () => {
	const entry = {
		content: { senses: [{ definition: 'x' }] },
		headword: 'x',
		rid: 'A00001',
	};
	const args = {
		chunk: { id: 'chunk-00001', rids: ['A00001'] },
		entries: new Map([['A00001', entry]]),
		hints: {},
		pin: 'sha',
		promptVersion: 'v5',
		tranche: 'tranche-01',
	};

	it('defaults to pre-patch, so callers predating the residue path are unchanged', () => {
		expect(buildChunkInput(args).corpusStage).toBe('pre-patch');
	});

	it('records healed when the residue path asks for it', () => {
		expect(
			buildChunkInput({ ...args, corpusStage: 'healed' }).corpusStage,
		).toBe('healed');
	});
});
