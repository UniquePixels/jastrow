import { beforeAll, describe, expect, it } from 'bun:test';
import { BSON } from 'bson';
import {
	bsonDocuments,
	ChunkReader,
	extractTargets,
	tarString,
} from './lib.ts';

const TEST_DIR = '.cache/test';

beforeAll(async () => {
	// Bun.file(...).writer() does not create parent directories; Bun.write does.
	await Bun.write(`${TEST_DIR}/.keep`, '');
});

async function* chunks(parts: Uint8Array[]): AsyncGenerator<Uint8Array> {
	await Promise.resolve();
	yield* parts;
}

function tarHeader(name: string, size: number): Uint8Array {
	const header = new Uint8Array(512);
	new TextEncoder().encodeInto(name, header);
	new TextEncoder().encodeInto(
		size.toString(8).padStart(11, '0'),
		header.subarray(124),
	);
	header[156] = 0x30; // typeflag '0' = regular file
	return header;
}

function tarMember(name: string, content: Uint8Array): Uint8Array {
	const padded = Math.ceil(content.length / 512) * 512;
	const out = new Uint8Array(512 + padded);
	out.set(tarHeader(name, content.length));
	out.set(content, 512);
	return out;
}

describe('ChunkReader', () => {
	it('reads exact lengths across chunk boundaries', async () => {
		const reader = new ChunkReader(
			chunks([
				new Uint8Array([1, 2]),
				new Uint8Array([3, 4, 5]),
				new Uint8Array([6]),
			]),
		);
		expect(await reader.read(4)).toEqual(new Uint8Array([1, 2, 3, 4]));
		expect(await reader.read(2)).toEqual(new Uint8Array([5, 6]));
		expect(await reader.read(1)).toBeNull();
	});

	it('throws on EOF mid-record', async () => {
		const reader = new ChunkReader(chunks([new Uint8Array([1, 2, 3])]));
		await expect(reader.read(5)).rejects.toThrow('unexpected EOF');
	});

	it('consume passes every byte to the sink', async () => {
		const reader = new ChunkReader(
			chunks([new Uint8Array([1, 2, 3]), new Uint8Array([4, 5])]),
		);
		const seen: number[] = [];
		await reader.consume(4, (chunk) => seen.push(...chunk));
		expect(seen).toEqual([1, 2, 3, 4]);
		expect(await reader.read(1)).toEqual(new Uint8Array([5]));
	});
});

describe('tarString', () => {
	it('decodes NUL-terminated fields', () => {
		const header = tarHeader('dump/sefaria/lexicon.bson', 0);
		expect(tarString(header, 0, 100)).toBe('dump/sefaria/lexicon.bson');
	});
});

describe('extractTargets', () => {
	it('extracts only targeted members and reports none missing', async () => {
		const wanted = new TextEncoder().encode('wanted-bytes');
		const archive = new Uint8Array([
			...tarMember('./dump/sefaria/skip.bson', new Uint8Array(600)),
			...tarMember('./dump/sefaria/keep.bson', wanted),
			...new Uint8Array(1024), // end-of-archive blocks
		]);
		const dest = `${TEST_DIR}/keep.bson`;
		const targets = new Map([['dump/sefaria/keep.bson', dest]]);
		const reader = new ChunkReader(chunks([archive]));
		const missing = await extractTargets(reader, targets, () => undefined);
		expect(missing.size).toBe(0);
		expect(new Uint8Array(await Bun.file(dest).arrayBuffer())).toEqual(wanted);
	});

	it('throws on an unparseable member size instead of desyncing', async () => {
		const header = tarHeader('dump/sefaria/bad.bson', 0);
		header[124] = 0x80; // GNU base-256 size marker — not octal
		const archive = new Uint8Array([...header, ...new Uint8Array(1024)]);
		const targets = new Map([
			['dump/sefaria/keep.bson', `${TEST_DIR}/keep.bson`],
		]);
		const reader = new ChunkReader(chunks([archive]));
		await expect(
			extractTargets(reader, targets, () => undefined),
		).rejects.toThrow('unparseable tar size');
	});

	it('reports targets missing from the archive', async () => {
		const archive = new Uint8Array(1024);
		const targets = new Map([
			['dump/sefaria/absent.bson', `${TEST_DIR}/absent.bson`],
		]);
		const reader = new ChunkReader(chunks([archive]));
		const missing = await extractTargets(reader, targets, () => undefined);
		expect([...missing]).toEqual(['dump/sefaria/absent.bson']);
	});
});

describe('bsonDocuments', () => {
	it('round-trips concatenated BSON documents', async () => {
		const docs = [
			{ headword: 'אַבָּא', parent_lexicon: 'Jastrow Dictionary' },
			{ headword: 'test', rid: 42 },
		];
		const parts = docs.map((doc) => BSON.serialize(doc));
		const path = `${TEST_DIR}/docs.bson`;
		await Bun.write(path, new Blob(parts));
		const seen: Record<string, unknown>[] = [];
		for await (const doc of bsonDocuments(path)) {
			seen.push(doc);
		}
		expect(seen).toMatchObject(docs);
	});

	it('throws on a truncated document', async () => {
		const whole = BSON.serialize({ headword: 'truncated' });
		const drain = async (path: string): Promise<number> => {
			let count = 0;
			for await (const _doc of bsonDocuments(path)) {
				count += 1;
			}
			return count;
		};
		// Cut mid-document: the reader hits EOF short of the declared length.
		const midPath = `${TEST_DIR}/truncated-mid.bson`;
		await Bun.write(midPath, whole.subarray(0, whole.length - 5));
		await expect(drain(midPath)).rejects.toThrow('unexpected EOF');
		// Cut right after the length prefix: the document body is absent.
		const prefixPath = `${TEST_DIR}/truncated-prefix.bson`;
		await Bun.write(prefixPath, whole.subarray(0, 4));
		await expect(drain(prefixPath)).rejects.toThrow('truncated BSON document');
	});
});
