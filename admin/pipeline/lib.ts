/**
 * Streaming primitives for pipeline scripts: exact-length reads over
 * chunked streams, tar member extraction, and BSON file decoding.
 */
import { createHash } from 'node:crypto';
import { BSON, type Document } from 'bson';

const TAR_BLOCK = 512;
const LEADING_DOT_SLASH = /^\.\//u;

/** Exact-length reads over a stream of arbitrary-size chunks. */
class ChunkReader {
	private readonly queue: Uint8Array[] = [];
	private offset = 0;
	private done = false;

	public constructor(private readonly iter: AsyncIterator<Uint8Array>) {}

	/** Read exactly n bytes; null on clean EOF at a record boundary. */
	public async read(n: number): Promise<Uint8Array | null> {
		const out = new Uint8Array(n);
		let filled = 0;
		while (filled < n) {
			if (this.queue.length === 0) {
				if (this.done || !(await this.pull())) {
					if (filled === 0) {
						return null;
					}
					throw new Error(`unexpected EOF: wanted ${n} bytes, got ${filled}`);
				}
				continue;
			}
			const [head] = this.queue;
			if (head === undefined) {
				continue;
			}
			const take = Math.min(head.length - this.offset, n - filled);
			out.set(head.subarray(this.offset, this.offset + take), filled);
			filled += take;
			this.advance(head, take);
		}
		return out;
	}

	/** Consume exactly n bytes, passing each piece to sink (or discarding). */
	public async consume(
		n: number,
		sink?: (chunk: Uint8Array) => unknown,
	): Promise<void> {
		let remaining = n;
		while (remaining > 0) {
			if (this.queue.length === 0) {
				if (this.done || !(await this.pull())) {
					throw new Error(
						`unexpected EOF while consuming: ${remaining} bytes short`,
					);
				}
				continue;
			}
			const [head] = this.queue;
			if (head === undefined) {
				continue;
			}
			const take = Math.min(head.length - this.offset, remaining);
			if (sink) {
				await sink(head.subarray(this.offset, this.offset + take));
			}
			remaining -= take;
			this.advance(head, take);
		}
	}

	private advance(head: Uint8Array, take: number): void {
		this.offset += take;
		if (this.offset === head.length) {
			this.queue.shift();
			this.offset = 0;
		}
	}

	private async pull(): Promise<boolean> {
		const { value, done } = await this.iter.next();
		if (done) {
			this.done = true;
			return false;
		}
		if (value.length > 0) {
			this.queue.push(value);
		}
		return true;
	}
}

/** Decode a NUL-terminated string field from a tar header. */
function tarString(header: Uint8Array, start: number, length: number): string {
	const field = header.subarray(start, start + length);
	const end = field.indexOf(0);
	return new TextDecoder().decode(end === -1 ? field : field.subarray(0, end));
}

interface TarMemberHeader {
	isFile: boolean;
	name: string;
	padded: number;
	size: number;
}

/** Decode one 512-byte ustar member header (prefix-aware name, octal
 * size), failing loudly on a malformed size field. */
function parseTarHeader(header: Uint8Array): TarMemberHeader {
	const prefix = tarString(header, 345, 155);
	const rawName = (prefix ? `${prefix}/` : '') + tarString(header, 0, 100);
	const name = rawName.replace(LEADING_DOT_SLASH, '');
	const size = Number.parseInt(tarString(header, 124, 12).trim() || '0', 8);
	if (!Number.isFinite(size) || size < 0) {
		// e.g. GNU base-256 size encoding (member > 8 GB); a NaN size
		// would silently desync the reader (consume(NaN) is a no-op).
		throw new Error(`unparseable tar size for ${name}`);
	}
	const { 156: typeflag } = header;
	return {
		name,
		size,
		padded: Math.ceil(size / TAR_BLOCK) * TAR_BLOCK,
		isFile: typeflag === 0x30 || typeflag === 0, // '0' or NUL
	};
}

/**
 * Walk a tar stream, writing target members (member path → destination
 * file) and skipping everything else. Returns the set of targets not
 * found — empty on success, at which point the caller may cancel the
 * rest of the stream.
 */
async function extractTargets(
	reader: ChunkReader,
	targets: Map<string, string>,
	progress: (msg: string) => void,
): Promise<Set<string>> {
	const remaining = new Set(targets.keys());
	while (remaining.size > 0) {
		const block = await reader.read(TAR_BLOCK);
		if (block === null) {
			break;
		}
		if (block.every((b) => b === 0)) {
			continue; // end-of-archive padding
		}
		const { name, size, padded, isFile } = parseTarHeader(block);
		const dest = targets.get(name);
		if (isFile && dest !== undefined && remaining.has(name)) {
			progress(`extracting ${name} (${(size / 1e6).toFixed(1)} MB)`);
			const writer = Bun.file(dest).writer();
			await reader.consume(size, (chunk) => writer.write(chunk));
			await writer.end();
			await reader.consume(padded - size);
			remaining.delete(name);
		} else {
			await reader.consume(padded);
		}
	}
	return remaining;
}

/** Yield each document in a .bson file (length-prefixed concatenation). */
async function* bsonDocuments(path: string): AsyncGenerator<Document> {
	const reader = new ChunkReader(
		Bun.file(path).stream()[Symbol.asyncIterator](),
	);
	while (true) {
		const lenBytes = await reader.read(4);
		if (lenBytes === null) {
			return;
		}
		const len = new DataView(lenBytes.buffer, lenBytes.byteOffset, 4).getInt32(
			0,
			true,
		);
		const doc = new Uint8Array(len);
		doc.set(lenBytes);
		const rest = await reader.read(len - 4);
		if (rest === null) {
			throw new Error(`truncated BSON document in ${path}`);
		}
		doc.set(rest, 4);
		yield BSON.deserialize(doc);
	}
}

/** The file's SHA-256 hex digest, computed streaming. */
async function sha256(path: string): Promise<string> {
	const hash = createHash('sha256');
	for await (const chunk of Bun.file(path).stream()) {
		hash.update(chunk);
	}
	return hash.digest('hex');
}

export { bsonDocuments, ChunkReader, extractTargets, sha256, tarString };
