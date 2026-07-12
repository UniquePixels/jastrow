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

/** Stream every entry from the source JSONL, one line at a time. Never
 * buffers the whole file — chunks are decoded and split on `\n` as they
 * arrive. */
async function* readSourceEntries(
	path: string = SOURCE_PATH,
): AsyncGenerator<SourceEntry> {
	const stream = Bun.file(path).stream();
	const decoder = new TextDecoder();
	let tail = '';
	for await (const chunk of stream) {
		tail += decoder.decode(chunk, { stream: true });
		const lines = tail.split('\n');
		tail = lines.pop() ?? '';
		for (const line of lines) {
			if (line.trim() !== '') {
				yield parseSourceEntry(line);
			}
		}
	}
	if (tail.trim() !== '') {
		yield parseSourceEntry(tail);
	}
}

export { parseSourceEntry, readSourceEntries, SOURCE_PATH };
