/**
 * The module boundaries, asserted rather than trusted.
 *
 * `admin/pipeline/` is an import module and `admin/entry/` is the
 * entry contract it writes to (ruling `09-30 entry contract`). Two
 * things make each a module rather than a directory, and both are
 * checked here, for both.
 *
 * FIRST: nothing it imports resolves outside what it may depend on.
 * The pipeline may depend on itself and on `admin/entry/` — exactly
 * one outward dependency, because the contract is what the import
 * writes to. The contract may depend on nothing but itself: the admin
 * tool and CI run it without the pipeline, so it must not reach into
 * one. A module that reaches up into the project for code is not one
 * you can lift out.
 *
 * SECOND: no path literal for `data/`, `docs/` or `app/` appears in
 * non-test module code outside that module's `paths.ts`. This is the
 * check that keeps `paths.ts` honest: a second spelling of
 * `data/entries` is how the boundary quietly stops being one place.
 * The pipeline's `paths.ts` re-exports the contract's three paths
 * rather than spelling them again.
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

/** One module's boundary: its directory, the one file that may name a
 * repo-root path, the directories its imports may resolve into, and a
 * floor on its file counts for the positive controls. */
interface Module {
	dir: string;
	/** Directories an import may resolve into, the module's own first. */
	mayImport: readonly string[];
	minFiles: number;
	minNonTest: number;
	paths: string;
}

const PIPELINE: Module = {
	dir: 'admin/pipeline',
	mayImport: ['admin/pipeline', 'admin/entry'],
	// As of this test admin/pipeline/ holds ~180 .ts files, ~95 of them
	// non-test. Loose on purpose so ordinary file churn doesn't need to
	// touch it — only the glob going (near) empty should trip it.
	minFiles: 50,
	minNonTest: 50,
	paths: 'admin/pipeline/paths.ts',
};

const ENTRY: Module = {
	dir: 'admin/entry',
	mayImport: ['admin/entry'],
	// 15 .ts files, 9 non-test, when the module was cut (2026-09-30).
	minFiles: 10,
	minNonTest: 5,
	paths: 'admin/entry/paths.ts',
};

// Mutable because `describe.each` types its object-table overload so.
const MODULES: Module[] = [PIPELINE, ENTRY];

/** `dirname`, posix-style, for a forward-slash repo-relative path. */
function dirOf(path: string): string {
	const i = path.lastIndexOf('/');
	return i === -1 ? '.' : path.slice(0, i);
}

/**
 * Joins `fromDir` and `spec`, collapsing `.` and `..` segments —
 * `node:path`'s `join`/`resolve`/`normalize` would do this directly,
 * but this module's own lint config (`biome.json`) forbids Node
 * built-ins in `*.test.ts` files specifically, so it's hand-rolled
 * here rather than imported.
 */
function resolveSpec(fromDir: string, spec: string): string {
	const out: string[] = [];
	for (const part of `${fromDir}/${spec}`.split('/')) {
		if (part === '' || part === '.') {
			continue;
		}
		if (part === '..') {
			out.pop();
			continue;
		}
		out.push(part);
	}
	return out.join('/');
}

/** Any single-quoted `from '...'` import specifier, whatever shape. */
const IMPORT_SPECIFIER = /from\s+'([^']*)'/gu;

/**
 * True for a specifier that can climb out of its directory: one that
 * starts with `.` (`./x`, `../x`) or that carries a bare `..` path
 * segment anywhere (`a/../../../x`). Counting a leading `../` run
 * against the importing file's depth used to be how this was
 * checked, but that only sees a specifier that BEGINS with `../`:
 * `'./../../x'` climbs out from behind a leading `./`, and
 * `'a/../../../x'` climbs out with no leading run at all. A bare
 * package specifier (`bun:test`, `zod`) never contains a `..`
 * segment, so this doesn't false-positive on one.
 */
function isTraversal(spec: string): boolean {
	return spec.startsWith('.') || spec.split('/').includes('..');
}

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

/**
 * Opt-out for one line, explained above. Must be a TRAILING `//
 * boundary-ignore: <reason>` COMMENT with a non-empty reason —
 * matching `line.includes('// boundary-ignore:')` anywhere in the
 * line let the marker silence a line from *inside* a policed string:
 * rendered prose that happens to quote the marker's own text can
 * carry a real `data/`/`docs/`/`app/` path right past it, on the very
 * line it then silences. Requiring `$` at the end rules out a marker
 * that isn't the last thing on the line, but not one sitting inside
 * an open quote — `isBoundaryIgnoreComment` below rules that out too.
 */
const BOUNDARY_IGNORE = /\/\/\s*boundary-ignore:\s*\S.*$/u;

/**
 * True if position `index` of `line` sits inside an open `'`, `"` or
 * backtick string, scanning from the start of the line. Escaped
 * quotes are skipped. A template literal's `${…}` isn't modeled —
 * irrelevant here, since a trailing comment never follows one.
 */
function isQuotedAt(line: string, index: number): boolean {
	let single = false;
	let double = false;
	let template = false;
	for (let i = 0; i < index; i++) {
		const c = line[i];
		if (c === '\\') {
			i++;
			continue;
		}
		if (!double && !template && c === "'") {
			single = !single;
		} else if (!single && !template && c === '"') {
			double = !double;
		} else if (!single && !double && c === '`') {
			template = !template;
		}
	}
	return single || double || template;
}

/**
 * True when `line` carries a genuine trailing `// boundary-ignore:
 * <reason>` comment — the marker text, with a reason, ending the
 * line, and NOT sitting inside a quoted string.
 */
function isBoundaryIgnoreComment(line: string): boolean {
	const m = BOUNDARY_IGNORE.exec(line);
	return m !== null && !isQuotedAt(line, m.index);
}

/**
 * An import naming `paths.ts` (any relative depth), capturing its
 * `{ ... }` clause so the identifiers it binds can be pulled out.
 */
const PATHS_IMPORT =
	/import\s*\{([^}]*)\}\s*from\s*'(?:\.{1,2}\/)*paths\.ts'/gu;

/**
 * The local identifiers a file binds from `paths.ts` — the alias after
 * `as` when one is given, otherwise the name itself.
 */
function pathsIdentifiers(text: string): string[] {
	const names: string[] = [];
	for (const m of text.matchAll(PATHS_IMPORT)) {
		for (const raw of (m[1] ?? '').split(',')) {
			const spec = raw.trim();
			if (spec === '') {
				continue;
			}
			const asMatch = /\bas\s+(\S+)/u.exec(spec);
			names.push(asMatch ? (asMatch[1] as string) : spec);
		}
	}
	return names;
}

async function moduleFiles(dir: string): Promise<string[]> {
	const out: string[] = [];
	for await (const p of new Bun.Glob('**/*.ts').scan({
		cwd: dir,
		onlyFiles: true,
	})) {
		out.push(`${dir}/${p}`);
	}
	return out.sort();
}

/** Every relative import of `module`'s files, resolved repo-relative. */
async function resolvedImports(
	module: Module,
): Promise<Array<{ file: string; resolved: string; statement: string }>> {
	const out: Array<{ file: string; resolved: string; statement: string }> = [];
	for (const file of await moduleFiles(module.dir)) {
		const text = await Bun.file(file).text();
		for (const m of text.matchAll(IMPORT_SPECIFIER)) {
			const spec = m[1] ?? '';
			if (isTraversal(spec)) {
				out.push({
					file,
					resolved: resolveSpec(dirOf(file), spec),
					statement: m[0],
				});
			}
		}
	}
	return out;
}

/** Whether `resolved` sits in `dir` or below it. */
function isUnder(resolved: string, dir: string): boolean {
	return resolved === dir || resolved.startsWith(`${dir}/`);
}

/**
 * Files that import a `paths.ts` directory constant and then re-spell
 * it with a hand-written suffix — `` `${REPORTS_DIR}/foo.md` `` instead
 * of a declared full path like `HEADWORD_ISSUES_DOC`. `${TRANCHES_DIR}/
 * ${dir}/${name}` stays clean: the remainder there is a further
 * interpolation, not a hand-typed filename. (Deliberately not
 * illustrated with the two identifiers `test-tiers.test.ts` treats as
 * corpus signals — naming them here in prose would misclassify this
 * file's own tier.)
 */
async function suffixOffenders(module: Module): Promise<string[]> {
	const offenders: string[] = [];
	for (const file of await moduleFiles(module.dir)) {
		if (file === module.paths || file.includes('.test.ts')) {
			continue;
		}
		const text = await Bun.file(file).text();
		const identifiers = pathsIdentifiers(text);
		if (identifiers.length === 0) {
			continue;
		}
		const suffixPattern = new RegExp(
			`\\$\\{(${identifiers.join('|')})\\}/(?!\\$)[\\w.-]`,
			'gu',
		);
		text.split('\n').forEach((line, i) => {
			const trimmed = line.trimStart();
			if (
				!COMMENT_LINE.test(trimmed) &&
				!isBoundaryIgnoreComment(line) &&
				suffixPattern.test(line)
			) {
				offenders.push(`${file}:${i + 1}: ${line.trim()}`);
			}
			suffixPattern.lastIndex = 0;
		});
	}
	return offenders;
}

describe.each(MODULES)('$dir imports only what it may', (module) => {
	it('moduleFiles() finds real files — positive control', async () => {
		// Without this, a glob that silently stopped matching (a
		// typo'd cwd, a broken pattern, a renamed directory) would make
		// the check below iterate zero files and pass vacuously no
		// matter what the code actually imports.
		const files = await moduleFiles(module.dir);
		expect(files.length).toBeGreaterThan(module.minFiles);
	});

	it('every relative import resolves inside what it may depend on', async () => {
		const offenders = (await resolvedImports(module))
			.filter(({ resolved }) =>
				module.mayImport.every((dir) => !isUnder(resolved, dir)),
			)
			.map(({ file, statement }) => `${file}: ${statement}`);
		expect(offenders).toEqual([]);
	});
});

describe('the one outward dependency is live', () => {
	it('admin/pipeline/ does import admin/entry/ — the allowance is not dead', async () => {
		// A positive control on the allowance itself: if no pipeline
		// file resolved into admin/entry/, the allowance would be a door
		// nobody uses, and the entry module could drift from what the
		// pipeline writes without either boundary noticing.
		const into = (await resolvedImports(PIPELINE)).filter(({ resolved }) =>
			isUnder(resolved, ENTRY.dir),
		);
		expect(into.length).toBeGreaterThan(0);
	});
});

describe.each(MODULES)('$dir declares its boundary in one place', (module) => {
	it('moduleFiles() finds real non-test files — positive control', async () => {
		// Witnesses the artifact the check below claims to scan: if the
		// glob silently stopped matching, "no offenders" would be true
		// vacuously regardless of what the module actually contains.
		const files = await moduleFiles(module.dir);
		const nonTest = files.filter(
			(f) => f !== module.paths && !f.includes('.test.ts'),
		);
		expect(nonTest.length).toBeGreaterThan(module.minNonTest);
	});

	it('no non-test file outside paths.ts names a repo-root path', async () => {
		const offenders: string[] = [];
		for (const file of await moduleFiles(module.dir)) {
			if (file === module.paths || file.includes('.test.ts')) {
				continue;
			}
			const text = await Bun.file(file).text();
			for (const line of text.split('\n')) {
				// Comments may name a path to explain one; code may not.
				const trimmed = line.trimStart();
				if (
					!COMMENT_LINE.test(trimmed) &&
					!isBoundaryIgnoreComment(line) &&
					ROOT_PATH.test(line)
				) {
					offenders.push(`${file}: ${line.trim()}`);
				}
			}
		}
		expect(offenders).toEqual([]);
	});

	it('a declared paths.ts constant is not re-spelled with a hand-written suffix', async () => {
		// A `data/`- or `docs/`-free literal still defeats paths.ts: a
		// file can import a directory constant and then hand-type the
		// filename onto it instead of importing the full path paths.ts
		// already declares (see `suffixOffenders` above). The bare
		// basename carries no `data/`/`docs/`/`app/` segment, so
		// ROOT_PATH above never sees it.
		expect(await suffixOffenders(module)).toEqual([]);
	});

	it('paths.ts itself still declares some', async () => {
		// A positive control on the regex itself. Without it, a pattern
		// that stopped matching anything would make the check above
		// pass vacuously too.
		const text = await Bun.file(module.paths).text();
		expect(ROOT_PATH.test(text)).toBe(true);
	});
});
