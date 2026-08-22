import { describe, expect, it } from 'bun:test';
import {
	buildCheckpoint,
	buildTranches,
	ChunkError,
	chunkCorpus,
	corpusFingerprint,
	markComplete,
	parseCheckpoint,
	pendingChunks,
} from './chunks.ts';

/** Synthetic rid list: A00001..A000NN. */
function rids(count: number): string[] {
	return Array.from(
		{ length: count },
		(_, i) => `A${String(i + 1).padStart(5, '0')}`,
	);
}

describe('chunkCorpus', () => {
	it('cuts rid-ordered chunks of the configured size', () => {
		const chunks = chunkCorpus(rids(70), 30);
		expect(chunks.map((c) => c.rids.length)).toEqual([30, 30, 10]);
		expect(chunks.map((c) => c.id)).toEqual([
			'chunk-00001',
			'chunk-00002',
			'chunk-00003',
		]);
		expect(chunks[0]?.rids[0]).toBe('A00001');
		expect(chunks[2]?.rids.at(-1)).toBe('A00070');
	});

	it('is deterministic regardless of input order', () => {
		const ordered = chunkCorpus(rids(50), 20);
		const shuffled = chunkCorpus([...rids(50)].reverse(), 20);
		expect(shuffled).toEqual(ordered);
	});

	it('rejects duplicate rids', () => {
		expect(() => chunkCorpus(['A00001', 'A00001'], 30)).toThrow(
			'duplicate rid',
		);
	});

	it('rejects a non-positive chunk size', () => {
		expect(() => chunkCorpus(rids(5), 0)).toThrow(ChunkError);
	});
});

describe('buildTranches', () => {
	it('groups consecutive chunks up to the tranche size', () => {
		const tranches = buildTranches(chunkCorpus(rids(100), 20), 40);
		expect(tranches.map((t) => t.id)).toEqual([
			'tranche-01',
			'tranche-02',
			'tranche-03',
		]);
		expect(tranches.map((t) => t.chunks.length)).toEqual([2, 2, 1]);
	});

	it('keeps every rid exactly once across tranches', () => {
		const tranches = buildTranches(chunkCorpus(rids(95), 20), 40);
		const seen = tranches.flatMap((t) => t.chunks.flatMap((c) => c.rids));
		expect(seen).toEqual(rids(95));
	});
});

describe('corpusFingerprint', () => {
	it('is order-independent, like chunkCorpus', () => {
		const forward = rids(50);
		expect(corpusFingerprint([...forward].reverse())).toBe(
			corpusFingerprint(forward),
		);
	});
});

describe('checkpoints', () => {
	const corpus = corpusFingerprint(rids(100));
	const tranche = buildTranches(chunkCorpus(rids(100), 20), 100)[0];
	if (tranche === undefined) {
		throw new Error('fixture tranche missing');
	}

	it('resumes mid-tranche: completed chunks are skipped', () => {
		let checkpoint = buildCheckpoint(tranche, corpus);
		checkpoint = markComplete(checkpoint, 'chunk-00001');
		checkpoint = markComplete(checkpoint, 'chunk-00003');
		const pending = pendingChunks(tranche, checkpoint, corpus);
		expect(pending.map((c) => c.id)).toEqual([
			'chunk-00002',
			'chunk-00004',
			'chunk-00005',
		]);
	});

	it('markComplete is idempotent', () => {
		let checkpoint = buildCheckpoint(tranche, corpus);
		checkpoint = markComplete(checkpoint, 'chunk-00001');
		checkpoint = markComplete(checkpoint, 'chunk-00001');
		expect(checkpoint.completed).toEqual(['chunk-00001']);
	});

	it('round-trips through JSON', () => {
		const checkpoint = markComplete(
			buildCheckpoint(tranche, corpus),
			'chunk-00002',
		);
		expect(parseCheckpoint(JSON.stringify(checkpoint))).toEqual(checkpoint);
	});

	it('refuses a checkpoint from another tranche', () => {
		const foreign = { completed: [], corpus, tranche: 'tranche-09' };
		expect(() => pendingChunks(tranche, foreign, corpus)).toThrow(
			'checkpoint is for tranche-09',
		);
	});

	it('refuses to resume after the corpus changed', () => {
		const checkpoint = buildCheckpoint(tranche, corpus);
		const moved = corpusFingerprint([...rids(99), 'B00001']);
		expect(() => pendingChunks(tranche, checkpoint, moved)).toThrow(
			'corpus changed',
		);
	});

	it('refuses completed chunk ids the tranche does not contain', () => {
		const checkpoint = markComplete(
			buildCheckpoint(tranche, corpus),
			'chunk-99999',
		);
		expect(() => pendingChunks(tranche, checkpoint, corpus)).toThrow(
			'does not contain: chunk-99999',
		);
	});

	it('rejects malformed checkpoint JSON', () => {
		expect(() => parseCheckpoint('{')).toThrow('not valid JSON');
		expect(() => parseCheckpoint('{"tranche": 5}')).toThrow(
			'checkpoint must be',
		);
	});
});
