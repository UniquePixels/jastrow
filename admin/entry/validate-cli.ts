/**
 * `bun data:validate` — the entry contract over files on disk.
 *
 * With no arguments it validates the whole of `data/entries/` against
 * the page index: every file's own checks, then the corpus checks.
 * This is CI's Validate job, and the check a hand edit meets.
 *
 * With file arguments it runs only each file's own checks
 * (`validateEntry`). The corpus checks — unique names, cite targets,
 * the page index — are about the tree, not a file, so they need the
 * whole of it: run without arguments for those.
 *
 * Prints every problem, one per line, and exits non-zero on any.
 *
 * Run: bun data:validate [data/entries/A/A00001.json ...]
 */
import { relative, resolve } from 'node:path';
import process from 'node:process';
import { loadPageIndex } from './page.ts';
import { ENTRIES_DIR } from './paths.ts';
import { loadEntryFiles, validateEntries, validateEntry } from './validate.ts';

/** A file argument as `validateEntry` wants its path: relative to
 * `data/entries/`, so the home-path check compares like with like.
 * Resolved first, so `./data/entries/…` and absolute paths work too. */
function entryRelative(file: string): string {
	return relative(resolve(ENTRIES_DIR), resolve(file));
}

/** Each named file's own checks. A file that does not parse is a
 * problem, not a thrown error, so one bad file does not hide the rest. */
async function validateFiles(files: readonly string[]): Promise<string[]> {
	const perFile = await Promise.all(
		files.map(async (file): Promise<string[]> => {
			const path = entryRelative(file);
			let entry: unknown;
			try {
				entry = await Bun.file(file).json();
			} catch (error) {
				return [`${path}: does not parse: ${String(error)}`];
			}
			return validateEntry(entry, path);
		}),
	);
	return perFile.flat();
}

/** The whole tree: every file's own checks, then the corpus checks. */
async function validateTree(): Promise<{
	checked: number;
	problems: string[];
}> {
	const { files, problems } = await loadEntryFiles();
	problems.push(...(await validateEntries(files, await loadPageIndex())));
	return { checked: files.length, problems };
}

async function main(): Promise<void> {
	const args = process.argv.slice(2);
	const { checked, problems } =
		args.length > 0
			? { checked: args.length, problems: await validateFiles(args) }
			: await validateTree();
	for (const problem of problems) {
		console.log(problem);
	}
	const scope = args.length > 0 ? 'file checks only' : 'file and corpus checks';
	console.log(
		`${checked} entry file(s), ${problems.length} problem(s) (${scope})`,
	);
	if (problems.length > 0 || checked === 0) {
		// Zero files checked is a failure too: a glob that stopped
		// matching would otherwise report a clean tree.
		process.exitCode = 1;
	}
}

if (import.meta.main) {
	await main();
}
