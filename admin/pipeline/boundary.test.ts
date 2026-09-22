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
 */
import { describe, expect, it } from 'bun:test';

const MODULE_DIR = 'admin/pipeline';
const PATHS_FILE = `${MODULE_DIR}/paths.ts`;

/** A relative import climbing above the module root. */
const ESCAPES = /from\s+'((?:\.\.\/)+)([^']*)'/gu;

/** A repo-root path literal: `data/…`, `docs/…` or `app/…`. */
const ROOT_PATH = /'(?:data|docs|app)\/[A-Za-z0-9._/-]*'/u;

async function moduleFiles(suffix: string): Promise<string[]> {
	const out: string[] = [];
	for await (const p of new Bun.Glob('**/*.ts').scan({
		cwd: MODULE_DIR,
		onlyFiles: true,
	})) {
		if (p.endsWith(suffix)) {
			out.push(`${MODULE_DIR}/${p}`);
		}
	}
	return out.sort();
}

describe('the module imports nothing above itself', () => {
	it('every relative import stays inside admin/pipeline/', async () => {
		const offenders: string[] = [];
		for (const file of await moduleFiles('.ts')) {
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
	it('no non-test file outside paths.ts names a repo-root path', async () => {
		const offenders: string[] = [];
		for (const file of await moduleFiles('.ts')) {
			if (file === PATHS_FILE || file.includes('.test.ts')) {
				continue;
			}
			const text = await Bun.file(file).text();
			for (const line of text.split('\n')) {
				// Docstrings may name a path to explain one; code may not.
				if (!line.trimStart().startsWith('*') && ROOT_PATH.test(line)) {
					offenders.push(`${file}: ${line.trim()}`);
				}
			}
		}
		expect(offenders).toEqual([]);
	});

	it('paths.ts itself still declares some', async () => {
		// A positive control. Without it, a glob that silently stopped
		// matching would report a clean nothing.
		const text = await Bun.file(PATHS_FILE).text();
		expect(ROOT_PATH.test(text)).toBe(true);
	});
});
