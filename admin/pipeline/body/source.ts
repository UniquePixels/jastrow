/**
 * Streaming reader for `data/sources/sefaria/jastrow-dictionary.jsonl` (32,512
 * entries, ~41 MB). Every later body-model module reads entries through
 * this instead of loading the file into memory.
 */
import { SOURCE_PATH } from '../paths.ts';
import type { SourceEntry } from '../types.ts';

/** Every filename `bun test` discovers (its four patterns, any JS/TS
 * extension). Hoisted per useTopLevelRegex. */
const UNIT_TEST_FILE = /[._](?:test|spec)\.[cm]?[jt]sx?$/u;

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

/** The test-tier split (`DESIGN.md` §1, Test tiers), asserted rather
 * than left to filename convention: under `bun test`, `Bun.main` is
 * the test file being run, and only a `*.corpus.test.ts` may stream
 * the whole snapshot — the unit tier (`bun qa`, CI's `Test` job) may
 * not. The unit tier is every file Bun's discovery runs, not only the
 * `*.test.ts` the repo's convention names: `*_test.*`, `*.spec.*` and
 * `*_spec.*` too, since `qa:test` excludes corpus files and nothing
 * else. `main` is a parameter so the unit test can pose both tiers. */
function refusesDefaultPath(main: string): boolean {
	return UNIT_TEST_FILE.test(main) && !main.endsWith('.corpus.test.ts');
}

/** A checker that a source's rids are unique: call it with each
 * entry's rid and its 1-based file line; it throws on a repeat or on
 * a rid that is not a string. Shared
 * by every reader of the source (ruling 11-05 canonical fetch), so a
 * duplicate is refused rather than resolved first-wins or last-wins. */
function ridGuard(path: string): (rid: unknown, line: number) => void {
	const lines = new Map<string, number>();
	return (rid: unknown, line: number): void => {
		if (typeof rid !== 'string') {
			throw new Error(`missing rid at line ${line} of ${path}`);
		}
		const first = lines.get(rid);
		if (first !== undefined) {
			throw new Error(
				`duplicate rid ${rid}: lines ${first} and ${line} of ${path}`,
			);
		}
		lines.set(rid, line);
	};
}

/** Stream every entry from the source JSONL, one line at a time. Never
 * buffers the whole file — chunks are decoded and split on `\n` as they
 * arrive. `path` defaults to `SOURCE_PATH` (`paths.ts`) rather than a
 * literal buried inside the function, so a test or a fixture can
 * stream a smaller file through exactly the same decoding,
 * line-splitting and parsing path. The default refuses under the
 * unit test tier (`refusesDefaultPath`): a `*.test.ts` that reached
 * it would read all 32,512 entries and only a slow CI job would
 * notice. */
async function* readSourceEntries(path?: string): AsyncGenerator<SourceEntry> {
	if (path === undefined && refusesDefaultPath(Bun.main)) {
		throw new Error(
			`readSourceEntries() with no path streams all 32,512 source entries, which a unit-tier test file may not do: pass a fixture path, or name the file *.corpus.test.ts and add it to \`bun run transform:invariants\` (admin/pipeline/DESIGN.md §1, Test tiers); running as ${Bun.main}`,
		);
	}
	const file = path ?? SOURCE_PATH;
	const seen = ridGuard(file);
	let number = 0;
	for await (const line of linesOf(Bun.file(file).stream())) {
		number += 1;
		if (line.trim() !== '') {
			const entry = parseSourceEntry(line);
			seen(entry.rid, number);
			yield entry;
		}
	}
}

export {
	linesOf,
	parseSourceEntry,
	readSourceEntries,
	refusesDefaultPath,
	ridGuard,
};
