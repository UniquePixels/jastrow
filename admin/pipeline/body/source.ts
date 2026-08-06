/**
 * Streaming reader for `data/source/jastrow-dictionary.jsonl` (32,512
 * entries, ~41 MB). Every later body-model module reads entries through
 * this instead of loading the file into memory.
 */
import type { SourceEntry } from './types.ts';

const SOURCE_PATH = 'data/source/jastrow-dictionary.jsonl';

/** Parse one JSONL line into a `SourceEntry`. */
function parseSourceEntry(line: string): SourceEntry {
	return JSON.parse(line) as SourceEntry;
}

/** Split a stream of byte chunks into lines. Decodes UTF-8 incrementally
 * so a multi-byte character straddling a chunk boundary is never split,
 * and yields a final unterminated line if the stream doesn't end in
 * `\n`. Never buffers the whole stream — only the undecoded tail of the
 * current line is held between chunks. */
async function* linesOf(
	chunks: AsyncIterable<Uint8Array>,
): AsyncGenerator<string> {
	const decoder = new TextDecoder();
	let tail = '';
	for await (const chunk of chunks) {
		tail += decoder.decode(chunk, { stream: true });
		const lines = tail.split('\n');
		tail = lines.pop() ?? '';
		yield* lines;
	}
	// Final flush: a stream ending mid-multi-byte-sequence would otherwise
	// leave its trailing bytes inside the decoder — the tail line would be
	// silently shortened instead of failing visibly downstream.
	tail += decoder.decode();
	if (tail !== '') {
		yield tail;
	}
}

/** Stream every entry from the source JSONL, one line at a time. Never
 * buffers the whole file — chunks are decoded and split on `\n` as they
 * arrive. */
async function* readSourceEntries(
	path: string = SOURCE_PATH,
): AsyncGenerator<SourceEntry> {
	for await (const line of linesOf(Bun.file(path).stream())) {
		if (line.trim() !== '') {
			yield parseSourceEntry(line);
		}
	}
}

export { linesOf, parseSourceEntry, readSourceEntries, SOURCE_PATH };
