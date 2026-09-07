import { describe, expect, it } from 'bun:test';
import {
	buildCheckpoint,
	buildTranches,
	type Checkpoint,
	type Chunk,
	ChunkError,
	carryForward,
	chunkCorpus,
	corpusFingerprint,
	markComplete,
	parseCheckpoint,
	pendingChunks,
	resolveCheckpoint,
	type Tranche,
} from './chunks.ts';

/** Synthetic rid list: A00001..A000NN. */
function rids(count: number): string[] {
	return Array.from(
		{ length: count },
		(_, i) => `A${String(i + 1).padStart(5, '0')}`,
	);
}

/** The first tranche of a chunking, or a loud fixture failure. */
function firstTranche(all: readonly string[], size: number): Tranche {
	const tranche = buildTranches(chunkCorpus(all, size), 100)[0];
	if (tranche === undefined) {
		throw new Error('fixture tranche missing');
	}
	return tranche;
}

/** One chunk of a fixture tranche, or a loud fixture failure. */
function chunkAt(tranche: Tranche, at: number): Chunk {
	const chunk = tranche.chunks[at];
	if (chunk === undefined) {
		throw new Error(`fixture chunk ${at} missing`);
	}
	return chunk;
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
		checkpoint = markComplete(checkpoint, chunkAt(tranche, 0));
		checkpoint = markComplete(checkpoint, chunkAt(tranche, 2));
		const pending = pendingChunks(tranche, checkpoint, corpus);
		expect(pending.map((c) => c.id)).toEqual([
			'chunk-00002',
			'chunk-00004',
			'chunk-00005',
		]);
	});

	it('markComplete is idempotent', () => {
		let checkpoint = buildCheckpoint(tranche, corpus);
		checkpoint = markComplete(checkpoint, chunkAt(tranche, 0));
		checkpoint = markComplete(checkpoint, chunkAt(tranche, 0));
		expect(checkpoint.completed).toEqual(['chunk-00001']);
	});

	it('round-trips through JSON', () => {
		const checkpoint = markComplete(
			buildCheckpoint(tranche, corpus),
			chunkAt(tranche, 1),
		);
		expect(parseCheckpoint(JSON.stringify(checkpoint))).toEqual(checkpoint);
	});

	it('refuses a checkpoint from another tranche', () => {
		const foreign = { completed: [], corpus, swept: [], tranche: 'tranche-09' };
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
		const checkpoint = markComplete(buildCheckpoint(tranche, corpus), {
			id: 'chunk-99999',
			rids: [],
		});
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

describe('swept-rid progress', () => {
	const corpus = corpusFingerprint(rids(100));
	const tranche = firstTranche(rids(100), 20);
	const head = chunkAt(tranche, 0);

	it('markComplete records the chunk rids as swept', () => {
		const checkpoint = markComplete(buildCheckpoint(tranche, corpus), head);
		expect(checkpoint.swept).toEqual(head.rids);
	});

	it('carryForward keeps swept rids and clears the chunk ids', () => {
		const moved = corpusFingerprint(rids(99));
		const carried = carryForward(
			markComplete(buildCheckpoint(tranche, corpus), head),
			moved,
		);
		expect(carried.completed).toEqual([]);
		expect(carried.corpus).toBe(moved);
		expect(carried.swept).toEqual(head.rids);
	});

	it('does not re-sweep the head after the population shrinks', () => {
		const smaller = rids(100).filter((rid) => rid !== 'A00100');
		const moved = corpusFingerprint(smaller);
		const recut = firstTranche(smaller, 20);
		const carried = carryForward(
			markComplete(buildCheckpoint(tranche, corpus), head),
			moved,
		);
		const pending = pendingChunks(recut, carried, moved);
		expect(pending.map((c) => c.id)).not.toContain('chunk-00001');
		expect(pending[0]?.rids[0]).toBe('A00021');
	});

	it('keeps a chunk only partly covered by swept rids', () => {
		const recut = firstTranche(rids(100), 30);
		const carried = carryForward(
			markComplete(buildCheckpoint(tranche, corpus), head),
			corpus,
		);
		const pending = pendingChunks(recut, carried, corpus);
		expect(pending.map((c) => c.id)).toContain('chunk-00001');
	});

	it('reads a legacy checkpoint that has no swept list', () => {
		const legacy = '{"completed":[],"corpus":"abc","tranche":"tranche-01"}';
		expect(parseCheckpoint(legacy).swept).toEqual([]);
	});

	it('rejects a swept list that is not all strings', () => {
		const bad = '{"completed":[],"corpus":"a","tranche":"t","swept":[5]}';
		expect(() => parseCheckpoint(bad)).toThrow('checkpoint must be');
	});
});

describe('pending order', () => {
	const corpus = corpusFingerprint(rids(100));
	const tranche = firstTranche(rids(100), 20);

	/** A checkpoint whose rid ledger holds exactly `covered`. */
	function withSwept(covered: readonly string[]): Checkpoint {
		return { ...buildCheckpoint(tranche, corpus), swept: [...covered] };
	}

	it('puts fully-unswept chunks ahead of partly-swept ones', () => {
		// One rid swept in each of the first two chunks — the shape a
		// detector change leaves when it interleaves new entries into
		// an already-swept head.
		const pending = pendingChunks(
			tranche,
			withSwept(['A00001', 'A00021']),
			corpus,
		);
		expect(pending.map((c) => c.id)).toEqual([
			'chunk-00003',
			'chunk-00004',
			'chunk-00005',
			'chunk-00001',
			'chunk-00002',
		]);
	});

	it('ranks partly-swept chunks by how much is left in them', () => {
		const thin = chunkAt(tranche, 0).rids.slice(0, 19);
		const thick = chunkAt(tranche, 1).rids.slice(0, 5);
		const pending = pendingChunks(
			tranche,
			withSwept([...thin, ...thick]),
			corpus,
		);
		expect(pending.map((c) => c.id).slice(3)).toEqual([
			'chunk-00002',
			'chunk-00001',
		]);
	});

	it('keeps positional order among chunks with equal coverage', () => {
		const pending = pendingChunks(
			tranche,
			buildCheckpoint(tranche, corpus),
			corpus,
		);
		expect(pending.map((c) => c.id)).toEqual([
			'chunk-00001',
			'chunk-00002',
			'chunk-00003',
			'chunk-00004',
			'chunk-00005',
		]);
	});

	it('still returns a chunk holding a single unswept rid', () => {
		const head = chunkAt(tranche, 0);
		const pending = pendingChunks(
			tranche,
			withSwept(head.rids.slice(1)),
			corpus,
		);
		expect(pending.map((c) => c.id)).toContain('chunk-00001');
	});
});

describe('resolveCheckpoint', () => {
	const corpus = corpusFingerprint(rids(100));
	const tranche = firstTranche(rids(100), 20);
	const head = chunkAt(tranche, 0);

	it('builds a fresh checkpoint when none is stored', () => {
		expect(resolveCheckpoint(undefined, tranche, corpus)).toEqual(
			buildCheckpoint(tranche, corpus),
		);
	});

	it('returns the stored checkpoint when the fingerprint matches', () => {
		const stored = markComplete(buildCheckpoint(tranche, corpus), head);
		expect(resolveCheckpoint(stored, tranche, corpus)).toBe(stored);
	});

	it('carries the rid ledger forward when the fingerprint moved', () => {
		const stored = markComplete(buildCheckpoint(tranche, corpus), head);
		const moved = corpusFingerprint(rids(99));
		const resolved = resolveCheckpoint(stored, tranche, moved);
		expect(resolved.completed).toEqual([]);
		expect(resolved.swept).toEqual(head.rids);
		expect(resolved.corpus).toBe(moved);
	});
});
