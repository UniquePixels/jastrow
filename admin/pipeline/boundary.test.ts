/**
 * The module boundary, asserted rather than trusted.
 *
 * `admin/pipeline/` is an import module. Two things make that true
 * rather than aspirational, and both are checked here.
 *
 * FIRST: nothing it imports resolves outside it. A module that reaches
 * up into the project for code is not one you can lift out.
 *
 * SECOND: no path literal for `data/`, `docs/` or `app/` appears in
 * non-test module code outside `paths.ts`. This is the check that
 * keeps `paths.ts` honest: a second spelling of `data/entries` is how
 * the boundary quietly stops being one place.
 *
 * Test files are exempt from the second check. A test may name a path
 * as a FIXTURE — `patch/snapshot.test.ts` names
 * `data/source/new-file.json`, which has never existed — and forcing
 * those through `paths.ts` would make the constant list a record of
 * fictions.
 *
 * A non-test line can also opt out with a trailing `// boundary-ignore:
 * <reason>` comment — for a line that CITES a path in rendered prose
 * (a report's own markdown text, built as a string) rather than
 * resolving one. That prose plays the same role a docstring does; it
 * just can't be spelled as one because it is data, not a comment.
 */
import { describe, expect, it } from 'bun:test';

const MODULE_DIR = 'admin/pipeline';
const PATHS_FILE = `${MODULE_DIR}/paths.ts`;

/** A relative import climbing above the module root. */
const ESCAPES = /from\s+'((?:\.\.\/)+)([^']*)'/gu;

/**
 * A repo-root path literal — `data/…`, `docs/…` or `app/…` — inside a
 * single-quoted or backtick-quoted string, however far into that
 * string it falls (a template literal's `${…}` interpolation, or
 * plain prose before the path, both sit ahead of it). An optional
 * `./` or `/` prefix is allowed. The character immediately before the
 * segment must not be a word character, dot or hyphen, so `metadata/x`
 * doesn't false-positive on the `data/` it contains.
 */
const ROOT_PATH =
	/[`'][^`']*?(?<![\w.-])(?:\.\/|\/)?(?:data|docs|app)\/[\w./${}-]*/u;

/** A comment line — `/**`, `/*`, a JSDoc continuation `*`, or `//` —
 * once leading whitespace is trimmed. Widening `ROOT_PATH` to backticks
 * also makes it match a markdown \`code\` span inside a comment, so
 * this now has to catch every comment shape, not just JSDoc
 * continuation lines. */
const COMMENT_LINE = /^(?:\/\*|\*|\/\/)/u;

/** Opt-out for one line, explained above. */
const BOUNDARY_IGNORE = '// boundary-ignore:';

async function moduleFiles(): Promise<string[]> {
	const out: string[] = [];
	for await (const p of new Bun.Glob('**/*.ts').scan({
		cwd: MODULE_DIR,
		onlyFiles: true,
	})) {
		out.push(`${MODULE_DIR}/${p}`);
	}
	return out.sort();
}

describe('the module imports nothing above itself', () => {
	it('moduleFiles() finds real files — positive control', async () => {
		// Without this, a glob that silently stopped matching (a
		// typo'd cwd, a broken pattern, a renamed MODULE_DIR) would make
		// the check below iterate zero files and pass vacuously no
		// matter what the code actually imports. As of this test,
		// admin/pipeline/ holds 194 .ts files; the bound is loose on
		// purpose so ordinary file churn doesn't need to touch it —
		// only the glob going (near) empty should ever trip it.
		const files = await moduleFiles();
		expect(files.length).toBeGreaterThan(50);
	});

	it('every relative import stays inside admin/pipeline/', async () => {
		const offenders: string[] = [];
		for (const file of await moduleFiles()) {
			// Depth of this file below the module root.
			const depth = file.slice(MODULE_DIR.length + 1).split('/').length - 1;
			const text = await Bun.file(file).text();
			for (const m of text.matchAll(ESCAPES)) {
				if ((m[1]?.length ?? 0) / 3 > depth) {
					offenders.push(`${file}: ${m[0]}`);
				}
			}
		}
		expect(offenders).toEqual([]);
	});
});

describe('the boundary is declared in one place', () => {
	it('moduleFiles() finds real non-test files — positive control', async () => {
		// Witnesses the artifact the check below claims to scan: if the
		// glob silently stopped matching, "no offenders" would be true
		// vacuously regardless of what admin/pipeline/ actually
		// contains. As of this test, 101 of the 194 files are
		// non-test — again a loose bound, tripped only by the glob
		// going (near) empty, not by ordinary file churn.
		const files = await moduleFiles();
		const nonTest = files.filter(
			(f) => f !== PATHS_FILE && !f.includes('.test.ts'),
		);
		expect(nonTest.length).toBeGreaterThan(50);
	});

	it('no non-test file outside paths.ts names a repo-root path', async () => {
		const offenders: string[] = [];
		for (const file of await moduleFiles()) {
			if (file === PATHS_FILE || file.includes('.test.ts')) {
				continue;
			}
			const text = await Bun.file(file).text();
			for (const line of text.split('\n')) {
				// Comments may name a path to explain one; code may not.
				const trimmed = line.trimStart();
				if (
					!COMMENT_LINE.test(trimmed) &&
					!line.includes(BOUNDARY_IGNORE) &&
					ROOT_PATH.test(line)
				) {
					offenders.push(`${file}: ${line.trim()}`);
				}
			}
		}
		expect(offenders).toEqual([]);
	});

	it('paths.ts itself still declares some', async () => {
		// A positive control on the regex itself. Without it, a pattern
		// that stopped matching anything would make the check above
		// pass vacuously too.
		const text = await Bun.file(PATHS_FILE).text();
		expect(ROOT_PATH.test(text)).toBe(true);
	});
});
