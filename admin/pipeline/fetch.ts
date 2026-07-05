#!/usr/bin/env bun
/**
 * Pipeline v2, stage 1: source acquisition (spec task 1.1).
 *
 * Streams Sefaria's public MongoDB dump, extracts only the lexicon
 * collections from the tar (the full dump is ~2.4 GB compressed and is
 * never written to disk), then decodes the BSON and emits the Jastrow
 * entries as JSONL plus a provenance manifest.
 *
 * Usage:
 *   bun admin/pipeline/fetch.ts             # full fetch (download + decode)
 *   bun admin/pipeline/fetch.ts --cached    # decode from .cache/sefaria without downloading
 *
 * See admin/pipeline/README.md for the channel decision and output contract.
 */
import { mkdir } from 'node:fs/promises';
import { type Document, EJSON } from 'bson';
import { bsonDocuments, ChunkReader, extractTargets, sha256 } from './lib.ts';

const DUMP_URL =
	'https://storage.googleapis.com/sefaria-mongo-backup/dump_small.tar.gz';
const CACHE_DIR = '.cache/sefaria';
const OUT_DIR = 'data/source';

/** Tar members to capture, and where each is cached. */
const TARGETS = new Map([
	['dump/sefaria/lexicon.bson', `${CACHE_DIR}/lexicon.bson`],
	['dump/sefaria/lexicon_entry.bson', `${CACHE_DIR}/lexicon_entry.bson`],
	['dump/sefaria/word_form.bson', `${CACHE_DIR}/word_form.bson`],
]);

/**
 * Sefaria's code also maps a 'Jastrow Unabbreviated' lexicon
 * (LexiconEntrySubClassMapping in Sefaria-Project
 * sefaria/model/lexicon.py), but the 2026-07-04 dump contains no such
 * lexicon record and zero entries for it, so only the printed
 * dictionary is emitted.
 */
const JASTROW_LEXICONS = new Map([
	['Jastrow Dictionary', `${OUT_DIR}/jastrow-dictionary.jsonl`],
]);

interface DumpProvenance {
	etag: string;
	lastModified: string;
}

async function download(
	progress: (msg: string) => void,
): Promise<DumpProvenance> {
	progress(`downloading ${DUMP_URL}`);
	const res = await fetch(DUMP_URL);
	if (!res.ok || res.body === null) {
		throw new Error(`dump download failed: HTTP ${res.status}`);
	}
	const provenance: DumpProvenance = {
		etag: res.headers.get('etag') ?? '',
		lastModified: res.headers.get('last-modified') ?? '',
	};
	const tar = res.body.pipeThrough(new DecompressionStream('gzip'));
	const reader = new ChunkReader(tar[Symbol.asyncIterator]());
	const missing = await extractTargets(reader, TARGETS, progress);
	if (missing.size > 0) {
		throw new Error(
			`archive ended before extracting: ${[...missing].join(', ')}`,
		);
	}
	// All targets captured; stop pulling the remainder of the ~2.4 GB body.
	await tar.cancel().catch(() => progress('download stream already closed'));
	await Bun.write(
		`${CACHE_DIR}/provenance.json`,
		`${JSON.stringify(provenance, undefined, '\t')}\n`,
	);
	return provenance;
}

async function loadProvenance(
	cached: boolean,
	progress: (msg: string) => void,
): Promise<DumpProvenance> {
	if (!cached) {
		return await download(progress);
	}
	for (const path of TARGETS.values()) {
		if (!(await Bun.file(path).exists())) {
			throw new Error(
				`--cached given but ${path} is missing; run without --cached first`,
			);
		}
	}
	progress('using cached collections');
	const stored = Bun.file(`${CACHE_DIR}/provenance.json`);
	if (await stored.exists()) {
		return (await stored.json()) as DumpProvenance;
	}
	return { etag: '', lastModified: '' };
}

async function emitRegistry(progress: (msg: string) => void): Promise<string> {
	const registry: Document[] = [];
	for await (const doc of bsonDocuments(
		TARGETS.get('dump/sefaria/lexicon.bson') as string,
	)) {
		if (JASTROW_LEXICONS.has(doc['name'] as string)) {
			registry.push(doc);
		}
	}
	const registryPath = `${OUT_DIR}/lexicons.json`;
	await Bun.write(
		registryPath,
		`${EJSON.stringify(registry, undefined, '\t', { relaxed: true })}\n`,
	);
	progress(`wrote ${registryPath} (${registry.length} lexicon records)`);
	return registryPath;
}

/**
 * Emit entries verbatim as relaxed extended JSON, one file per lexicon,
 * preserving dump order.
 */
async function emitEntries(
	progress: (msg: string) => void,
): Promise<Map<string, number>> {
	const counts = new Map<string, number>();
	const writers = new Map(
		[...JASTROW_LEXICONS].map(([lexicon, path]) => {
			counts.set(lexicon, 0);
			return [lexicon, Bun.file(path).writer()];
		}),
	);
	for await (const doc of bsonDocuments(
		TARGETS.get('dump/sefaria/lexicon_entry.bson') as string,
	)) {
		const parentLexicon = doc['parent_lexicon'] as string;
		const writer = writers.get(parentLexicon);
		if (writer === undefined) {
			continue;
		}
		writer.write(`${EJSON.stringify(doc, { relaxed: true })}\n`);
		counts.set(parentLexicon, (counts.get(parentLexicon) ?? 0) + 1);
	}
	for (const [lexicon, writer] of writers) {
		await writer.end();
		progress(
			`wrote ${JASTROW_LEXICONS.get(lexicon)} (${counts.get(lexicon)} entries)`,
		);
	}
	return counts;
}

async function main(): Promise<void> {
	const cached = Bun.argv.includes('--cached');
	const progress = (msg: string): void => {
		console.log(`[fetch] ${msg}`);
	};
	await mkdir(CACHE_DIR, { recursive: true });
	await mkdir(OUT_DIR, { recursive: true });

	const dumpProvenance = await loadProvenance(cached, progress);
	const registryPath = await emitRegistry(progress);
	const counts = await emitEntries(progress);

	const manifest = {
		entryCounts: Object.fromEntries(counts),
		fetchedAt: new Date().toISOString(),
		outputs: await Promise.all(
			[registryPath, ...JASTROW_LEXICONS.values()].map(async (path) => ({
				path,
				sha256: await sha256(path),
			})),
		),
		source: {
			url: DUMP_URL,
			etag: dumpProvenance.etag,
			lastModified: dumpProvenance.lastModified,
		},
	};
	const manifestPath = `${OUT_DIR}/manifest.json`;
	await Bun.write(
		manifestPath,
		`${JSON.stringify(manifest, undefined, '\t')}\n`,
	);
	progress(`wrote ${manifestPath}`);
}

await main();
