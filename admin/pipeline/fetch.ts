#!/usr/bin/env bun
/**
 * Pipeline v2, stage 1: source acquisition.
 *
 * Streams Sefaria's public MongoDB dump, extracts only the lexicon
 * collections from the tar (the full dump is ~2.4 GB compressed and is
 * never written to disk), then decodes the BSON and emits the Jastrow
 * entries as JSONL plus a provenance manifest. The output is canonical
 * (canonical-json.ts): entries sorted by rid, keys sorted, so the bytes
 * depend on the data alone.
 *
 * Usage:
 *   bun admin/pipeline/fetch.ts             # full fetch (download + decode)
 *   bun admin/pipeline/fetch.ts --cached    # decode from .cache/sefaria without downloading
 *
 * See admin/pipeline/README.md for the channel decision and output contract.
 */
import { mkdir } from 'node:fs/promises';
import { type Document, EJSON } from 'bson';
import {
	bsonDocuments,
	ChunkReader,
	extractTargets,
	sha256,
} from './archive-io.ts';
import { canonicalJson, requireRid, sortByRid } from './canonical-json.ts';
import {
	LEXICONS_PATH,
	MANIFEST_PATH,
	SOURCE_DIR as OUT_DIR,
	SOURCE_PATH,
} from './paths.ts';

const DUMP_URL =
	'https://storage.googleapis.com/sefaria-mongo-backup/dump_small.tar.gz';
const CACHE_DIR = '.cache/sefaria';

/** Tar members to capture, and where each is cached. */
const TARGETS = new Map([
	['dump/sefaria/lexicon.bson', `${CACHE_DIR}/lexicon.bson`],
	['dump/sefaria/lexicon_entry.bson', `${CACHE_DIR}/lexicon_entry.bson`],
	['dump/sefaria/word_form.bson', `${CACHE_DIR}/word_form.bson`],
]);

/**
 * Sefaria's code also maps a 'Jastrow Unabbreviated' lexicon
 * (LexiconEntrySubClassMapping in Sefaria-Project
 * sefaria/model/lexicon.py), but the committed dump contains no such
 * lexicon record and zero entries for it, so only the printed
 * dictionary is emitted.
 */
const JASTROW_LEXICONS = new Map([['Jastrow Dictionary', SOURCE_PATH]]);

interface DumpProvenance {
	etag: string;
	lastModified: string;
}

/** Download the Sefaria dump to the cache, extracting the target BSON
 * members and hashing everything for the provenance record. */
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

/** The dump provenance — reused from the cache under `--cached`,
 * freshly downloaded otherwise. */
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

/** Write the Jastrow lexicon-registry JSON from the dump's lexicon
 * collection; returns the emitted path. */
async function emitRegistry(progress: (msg: string) => void): Promise<string> {
	const registry: Document[] = [];
	for await (const doc of bsonDocuments(
		TARGETS.get('dump/sefaria/lexicon.bson') as string,
	)) {
		if (JASTROW_LEXICONS.has(doc['name'] as string)) {
			registry.push(doc);
		}
	}
	if (registry.length !== JASTROW_LEXICONS.size) {
		// Fail fast on lexicon-collection schema drift (renamed name
		// field, renamed lexicon) instead of emitting empty outputs.
		throw new Error(
			`expected ${JASTROW_LEXICONS.size} lexicon record(s), found ${registry.length}`,
		);
	}
	const registryPath = LEXICONS_PATH;
	const sorted = [...registry].sort((a, b) => {
		const [left, right] = [a['name'] as string, b['name'] as string];
		return left < right ? -1 : Number(left > right);
	});
	await Bun.write(
		registryPath,
		`${canonicalJson(EJSON.serialize(sorted, { relaxed: true }), '\t')}\n`,
	);
	progress(`wrote ${registryPath} (${registry.length} lexicon records)`);
	return registryPath;
}

/**
 * Emit entries as relaxed extended JSON, one file per lexicon, sorted
 * by rid with keys sorted (canonical-json.ts), so the bytes depend on
 * the data alone.
 */
async function emitEntries(
	progress: (msg: string) => void,
): Promise<Map<string, number>> {
	const counts = new Map<string, number>();
	const collected = new Map(
		[...JASTROW_LEXICONS.keys()].map((l) => [
			l,
			[] as (Document & { rid: string })[],
		]),
	);
	for await (const doc of bsonDocuments(
		TARGETS.get('dump/sefaria/lexicon_entry.bson') as string,
	)) {
		collected.get(doc['parent_lexicon'] as string)?.push(requireRid(doc));
	}
	for (const [lexicon, docs] of collected) {
		if (docs.length === 0) {
			// Same drift guard as the registry: a renamed parent_lexicon
			// must not produce an empty snapshot that looks like success.
			// Checked for every lexicon before any file is written.
			throw new Error(`no entries found for lexicon "${lexicon}"`);
		}
	}
	await Promise.all(
		[...collected].map(async ([lexicon, docs]) => {
			const lines = sortByRid(docs).map(
				(doc) => `${canonicalJson(EJSON.serialize(doc, { relaxed: true }))}\n`,
			);
			await Bun.write(JASTROW_LEXICONS.get(lexicon) as string, lines.join(''));
			counts.set(lexicon, docs.length);
			progress(
				`wrote ${JASTROW_LEXICONS.get(lexicon)} (${docs.length} entries)`,
			);
		}),
	);
	return counts;
}

/** Entry point: fetch (or reuse) the dump, emit the source JSONL and
 * registry, and write the provenance record. */
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
	const manifestPath = MANIFEST_PATH;
	await Bun.write(
		manifestPath,
		`${JSON.stringify(manifest, undefined, '\t')}\n`,
	);
	progress(`wrote ${manifestPath}`);
}

if (import.meta.main) {
	await main();
}
