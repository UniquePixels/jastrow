/**
 * Chunker + tranche checkpoints (research-process plan Task 5; spec
 * docs/specs/2026-08-10-research-process-design.md §4.1.2, §4.5).
 *
 * Deterministic work division for the sweep: the rid-ordered corpus
 * splits into ~20–40-entry chunks (one sweep agent each, sized to
 * avoid long-context quality degradation), chunks group into
 * fixed-size tranches (one usage-gated batch each), and a per-tranche
 * checkpoint records completed chunks so a failed run loses at most
 * one chunk. The checkpoint carries a corpus fingerprint — resuming
 * against a changed corpus fails loudly instead of silently
 * reassigning entries to different chunks.
 */
import { createHash } from 'node:crypto';

/** Spec §3: ~20–40 entries per agent. */
const CHUNK_SIZE = 30;
/** Spec §4.5: fixed-size tranches of 2–4K entries. */
const TRANCHE_SIZE = 3000;
const CHECKPOINT_DIR = 'data/patches/checkpoints';

/** One sweep agent's worth of entries. */
interface Chunk {
	id: string;
	rids: string[];
}

/** One usage-gated batch of chunks (spec §4.5). */
interface Tranche {
	chunks: Chunk[];
	id: string;
}

/** A tranche's progress record: which chunks have completed, pinned
 * to the exact corpus (rid list) they were cut from. */
interface Checkpoint {
	completed: string[];
	corpus: string;
	tranche: string;
}

/** A chunking/checkpoint contract violation. */
class ChunkError extends Error {
	constructor(message: string) {
		super(message);
		this.name = 'ChunkError';
	}
}

/** Sort comparator for ASCII identifiers — rids, chunk ids, filenames.
 *
 * Deliberately NOT `localeCompare`: every ordering in this module feeds
 * something that must be byte-stable forever — the corpus fingerprint
 * that gates checkpoint resume, the chunk boundaries that give chunks
 * their ids, and the seeded verification sample. `localeCompare` without
 * an explicit locale varies with the host's ICU data, so adopting it
 * would make those outputs environment-dependent. This is the default
 * `.sort()` order stated explicitly, which is what S2871 asks for. */
function byCodeUnit(a: string, b: string): number {
	if (a < b) {
		return -1;
	}
	return a > b ? 1 : 0;
}

/** sha256 of the rid list — the identity of one exact chunking
 * input. Sorted first, so the fingerprint is order-independent in the
 * same way `chunkCorpus` is; a caller that hands over the same rid set
 * in a different order must not invalidate its own checkpoint.
 * Checkpoints pin it so resume-after-corpus-change fails. */
function corpusFingerprint(rids: readonly string[]): string {
	return createHash('sha256')
		.update([...rids].sort(byCodeUnit).join('\n'))
		.digest('hex');
}

/** Split the corpus into rid-ordered chunks. Pure and deterministic:
 * the same rid set always yields the same chunks with the same ids,
 * whatever order the input arrived in. */
function chunkCorpus(
	rids: readonly string[],
	chunkSize: number = CHUNK_SIZE,
): Chunk[] {
	if (!Number.isInteger(chunkSize) || chunkSize < 1) {
		throw new ChunkError(
			`chunk size must be a positive integer, got ${chunkSize}`,
		);
	}
	const sorted = [...rids].sort(byCodeUnit);
	for (let i = 1; i < sorted.length; i++) {
		if (sorted[i] === sorted[i - 1]) {
			throw new ChunkError(`duplicate rid in corpus: ${sorted[i]}`);
		}
	}
	const chunks: Chunk[] = [];
	for (let at = 0; at < sorted.length; at += chunkSize) {
		const index = chunks.length + 1;
		chunks.push({
			id: `chunk-${String(index).padStart(5, '0')}`,
			rids: sorted.slice(at, at + chunkSize),
		});
	}
	return chunks;
}

/** Group consecutive chunks into tranches of at most `trancheSize`
 * entries each. */
function buildTranches(
	chunks: readonly Chunk[],
	trancheSize: number = TRANCHE_SIZE,
): Tranche[] {
	if (!Number.isInteger(trancheSize) || trancheSize < 1) {
		throw new ChunkError(
			`tranche size must be a positive integer, got ${trancheSize}`,
		);
	}
	const tranches: Tranche[] = [];
	let current: Chunk[] = [];
	let count = 0;
	const flush = (): void => {
		if (current.length > 0) {
			tranches.push({
				chunks: current,
				id: `tranche-${String(tranches.length + 1).padStart(2, '0')}`,
			});
			current = [];
			count = 0;
		}
	};
	for (const chunk of chunks) {
		if (count + chunk.rids.length > trancheSize) {
			flush();
		}
		current.push(chunk);
		count += chunk.rids.length;
	}
	flush();
	return tranches;
}

/** A fresh checkpoint for a tranche cut from the fingerprinted
 * corpus. */
function buildCheckpoint(tranche: Tranche, corpus: string): Checkpoint {
	return { completed: [], corpus, tranche: tranche.id };
}

/** Parse checkpoint JSON, failing loudly on any malformed field. */
function parseCheckpoint(text: string): Checkpoint {
	let value: unknown;
	try {
		value = JSON.parse(text);
	} catch (e) {
		throw new ChunkError(
			`checkpoint is not valid JSON: ${e instanceof Error ? e.message : String(e)}`,
		);
	}
	const raw = value as Record<string, unknown>;
	if (
		typeof value !== 'object' ||
		value === null ||
		typeof raw['tranche'] !== 'string' ||
		typeof raw['corpus'] !== 'string' ||
		!Array.isArray(raw['completed']) ||
		raw['completed'].some((id) => typeof id !== 'string')
	) {
		throw new ChunkError(
			'checkpoint must be { tranche: string, corpus: string, completed: string[] }',
		);
	}
	return {
		completed: raw['completed'] as string[],
		corpus: raw['corpus'],
		tranche: raw['tranche'],
	};
}

/** Record one chunk as completed (idempotent). */
function markComplete(checkpoint: Checkpoint, chunkId: string): Checkpoint {
	if (checkpoint.completed.includes(chunkId)) {
		return checkpoint;
	}
	return { ...checkpoint, completed: [...checkpoint.completed, chunkId] };
}

/** The chunks still to sweep: everything the checkpoint has not
 * completed. Validates that the checkpoint belongs to this tranche
 * and this exact corpus — a mismatch means the chunking moved under
 * the resume, and continuing would reassign entries. */
function pendingChunks(
	tranche: Tranche,
	checkpoint: Checkpoint,
	corpus: string,
): Chunk[] {
	if (checkpoint.tranche !== tranche.id) {
		throw new ChunkError(
			`checkpoint is for ${checkpoint.tranche}, not ${tranche.id}`,
		);
	}
	if (checkpoint.corpus !== corpus) {
		throw new ChunkError(
			'checkpoint corpus fingerprint does not match — the corpus changed since this tranche was cut; re-chunk and start a fresh checkpoint',
		);
	}
	const known = new Set(tranche.chunks.map((c) => c.id));
	const unknown = checkpoint.completed.filter((id) => !known.has(id));
	if (unknown.length > 0) {
		throw new ChunkError(
			`checkpoint completed chunk(s) this tranche does not contain: ${unknown.join(', ')}`,
		);
	}
	const done = new Set(checkpoint.completed);
	return tranche.chunks.filter((chunk) => !done.has(chunk.id));
}

/** Where a tranche's checkpoint lives. */
function checkpointPath(trancheId: string): string {
	return `${CHECKPOINT_DIR}/${trancheId}.json`;
}

/** Load a tranche's checkpoint, or undefined when none exists yet. */
async function loadCheckpoint(
	trancheId: string,
): Promise<Checkpoint | undefined> {
	const file = Bun.file(checkpointPath(trancheId));
	if (!(await file.exists())) {
		return;
	}
	return parseCheckpoint(await file.text());
}

/** Persist a tranche's checkpoint. */
async function saveCheckpoint(checkpoint: Checkpoint): Promise<void> {
	await Bun.write(
		checkpointPath(checkpoint.tranche),
		`${JSON.stringify(checkpoint, null, '\t')}\n`,
	);
}

export type { Checkpoint, Chunk, Tranche };
export {
	buildCheckpoint,
	buildTranches,
	byCodeUnit,
	CHECKPOINT_DIR,
	CHUNK_SIZE,
	ChunkError,
	checkpointPath,
	chunkCorpus,
	corpusFingerprint,
	loadCheckpoint,
	markComplete,
	parseCheckpoint,
	pendingChunks,
	saveCheckpoint,
	TRANCHE_SIZE,
};
