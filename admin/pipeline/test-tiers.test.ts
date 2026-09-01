/**
 * The tier boundary, asserted rather than trusted.
 *
 * ## Why this exists
 *
 * `bun test` is split in two. The UNIT tier is every `*.test.ts` that
 * does not touch the pinned snapshot; it runs in well under a second and
 * is CI's `Test` job. The CORPUS tier is every `*.corpus.test.ts`; it
 * loads all 32,512 entries of `data/source/jastrow-dictionary.jsonl`
 * (~41 MB), runs the transform pipeline over them, and takes minutes.
 * It is CI's separate `Corpus Audit` job and `bun run audit:corpus`
 * locally.
 *
 * The split is by FILENAME, because that is the only thing `bun test`
 * can select on before it evaluates a module. Nothing about a filename
 * is self-enforcing: a corpus-loading file left named `*.test.ts` lands
 * back in the fast tier and re-inflates it silently, which is exactly
 * how the `Test` job reached CI's fixed ~20-minute wall and was
 * SIGTERM'd on PR #58. This file is the check that the name and the
 * behaviour agree, in BOTH directions.
 *
 * ## What it can and cannot see
 *
 * It is a static check over file text. It sees the three ways a test
 * reaches the snapshot today:
 *
 *   - importing `corpus-fixture.ts` (the shared, memoised stages);
 *   - calling `readSourceEntries()` with no argument, which defaults to
 *     `SOURCE_PATH`;
 *   - naming `SOURCE_PATH` itself.
 *
 * It does NOT see a test that reaches the corpus INDIRECTLY — by calling
 * `census.ts`, `review.ts`, `dry-run.ts`, `migrate-dry.ts`, `count.ts`,
 * `headword-census.ts`, `patch/apply.ts` or `research/corpus-inputs.ts`,
 * each of which holds its own no-argument read. No test does that today,
 * and the measurement says so rather than the grep: with the tiers split,
 * no unit-tier file exceeds 0.11 s, which a 41 MB read cannot fit under.
 * If that ever stops being true the symptom is a slow unit tier, not a
 * failure here.
 *
 * This file necessarily contains every signal it hunts for — a scanner
 * has to name what it scans for — so it skips ITSELF. The skip is an
 * EXACT match on `import.meta.path`, which is why the scan is absolute:
 * a suffix test against relative paths would also exempt any other file
 * whose relative path happened to end this one's absolute path, and a
 * hardcoded name would survive a rename and exempt whatever took it.
 * `node:path` would be the obvious way to resolve instead, and
 * `biome.json` forbids node modules in `*.test.ts` — the override that
 * relaxes that rule for `admin/pipeline/**` excludes tests by design.
 */

import { expect, it } from 'bun:test';

/** Directories that are not ours to police. */
const IGNORED = /(^|\/)(node_modules|\.git|coverage)\//u;

/** Every way a test file reaches the pinned snapshot directly. */
const CORPUS_SIGNALS: ReadonlyArray<readonly [string, RegExp]> = [
	['imports corpus-fixture', /from\s+'[^']*corpus-fixture\.ts'/u],
	['calls readSourceEntries()', /\breadSourceEntries\(\s*\)/u],
	['names SOURCE_PATH', /\bSOURCE_PATH\b/u],
];

/** This file, absolute — the one path the scan must not report on. */
const SELF: string = import.meta.path;

async function testFiles(): Promise<string[]> {
	const glob = new Bun.Glob('**/*.test.ts');
	const out: string[] = [];
	// Absolute, so `path === SELF` is an identity test rather than a
	// suffix guess. The cost is verbose failure messages, which name a
	// file the reader can open directly.
	for await (const path of glob.scan({
		absolute: true,
		cwd: '.',
		onlyFiles: true,
	})) {
		if (!IGNORED.test(`/${path}`)) {
			out.push(path);
		}
	}
	return out.sort();
}

/** The signals `path` carries, by name. */
async function signalsOf(path: string): Promise<string[]> {
	const text = await Bun.file(path).text();
	return CORPUS_SIGNALS.filter(([, re]) => re.test(text)).map(([name]) => name);
}

const isCorpusName = (path: string): boolean =>
	path.endsWith('.corpus.test.ts');

it('the tier split covers every test file exactly once', async () => {
	const files = await testFiles();
	// A floor, not an equality: it fails if the glob silently stops
	// matching, without pinning a count every new test file would break.
	expect(files.length).toBeGreaterThan(80);
	expect(files.filter(isCorpusName).length).toBeGreaterThan(0);
	expect(files.filter((f) => !isCorpusName(f)).length).toBeGreaterThan(0);
});

it('no unit-tier file loads the corpus — it would re-inflate the fast gate', async () => {
	const offenders: string[] = [];
	for (const path of await testFiles()) {
		if (isCorpusName(path) || path === SELF) {
			continue;
		}
		const signals = await signalsOf(path);
		if (signals.length > 0) {
			offenders.push(`${path} — ${signals.join(', ')}`);
		}
	}
	// Named, not counted: the failure has to say which file to rename.
	expect(offenders).toEqual([]);
});

it('every corpus-tier file earns the name — none is merely labelled', async () => {
	const idle: string[] = [];
	for (const path of await testFiles()) {
		if (!isCorpusName(path)) {
			continue;
		}
		if ((await signalsOf(path)).length === 0) {
			idle.push(path);
		}
	}
	expect(idle).toEqual([]);
});
