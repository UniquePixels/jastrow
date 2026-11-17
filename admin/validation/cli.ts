/**
 * `bun data:validate`: validates entry files, prints one problem per
 * line and exits non-zero on any.
 *
 * With no arguments it validates all of `data/entries/`, corpus checks
 * included. With file arguments it runs only each file's own checks.
 *
 * Run: bun data:validate [data/entries/A/A00001.json ...]
 */
import { relative, resolve } from 'node:path';
import process from 'node:process';
import { paths } from '../paths.ts';
import { loadEntryFiles, validateEntries, validateEntry } from './validate.ts';

/**
 * Converts a file argument to the path `validateEntry` expects.
 *
 * @param file - A path, absolute or relative to the working directory.
 * @returns The path relative to `data/entries/`.
 */
function entryRelative(file: string): string {
	return relative(paths.entries, resolve(file));
}

/**
 * Runs the single-file checks on each named file.
 *
 * @param files - The file arguments.
 * @returns The problems found, including one per file that does not
 * parse.
 */
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

/**
 * Validates all of `data/entries/`.
 *
 * @returns The number of files checked and the problems found.
 */
async function validateTree(): Promise<{
	checked: number;
	problems: string[];
}> {
	const { files, problems } = await loadEntryFiles();
	problems.push(...validateEntries(files));
	return { checked: files.length, problems };
}

/**
 * Validates the files named on the command line, or the whole tree,
 * prints the problems and a summary, and sets a non-zero exit code if
 * there are problems or no files were checked.
 */
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
