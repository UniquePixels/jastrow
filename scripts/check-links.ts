/**
 * `bun docs:links` — every relative link in every markdown file
 * resolves.
 *
 * The scope is derived from the tree (`git ls-files`), not typed, so a
 * file a change has just moved is checked from its new home. A link's
 * `#fragment` and `?query` are stripped before its target is tested,
 * so a link to a deleted file cannot pass on an anchor; and there is
 * no repo-root fallback, so a link with the wrong number of `../`
 * fails rather than resolving by accident. A target exists when git
 * tracks it (or it is untracked and not ignored), or when it is a
 * directory holding such a file: what a clean checkout, and so CI,
 * would see.
 *
 * Exempt by design: `docs/archive/decisions-2026-09-22.md`, a
 * byte-verbatim copy of the ledger whose dead links are its value
 * (`docs/archive/README.md`). Links inside code spans and fenced
 * blocks are not links and are not checked.
 *
 * Prints every dead link, one per line, and exits non-zero on any.
 *
 * Run: bun docs:links
 */
import { dirname, join, normalize } from 'node:path';
import process from 'node:process';

const EXEMPT: ReadonlySet<string> = new Set([
	'docs/archive/decisions-2026-09-22.md',
]);
const LINK = /\]\(\s*<?(?<target>[^)\s>]+)/gu;
/** A reference definition, `[label]: target "title"`, which a
 * reference-style link `[text][label]` resolves through. */
const REF_DEF = /^\s{0,3}\[[^\]]+\]:\s*<?(?<target>[^\s>]+)/u;
/** A code span: a run of backticks to the next run of the same length,
 * across line breaks but not across a blank line (a paragraph end). */
const CODE_SPAN =
	/(?<!`)(?<ticks>`+)(?!`)(?:[^\n]|\n(?![ \t]*\n))*?(?<!`)\k<ticks>(?!`)/gu;
const NOT_NEWLINE = /[^\n]/gu;
const FENCE = /^\s{0,3}(?<fence>`{3,}|~{3,})/u;
/** A closing fence: the run alone on its line, bar whitespace. */
const FENCE_CLOSE = /^\s{0,3}(?:`{3,}|~{3,})\s*$/u;
const SCHEME = /^[a-z][a-z\d+.-]*:/iu;
const SUFFIX = /[#?]/u;

/** Code-unit order: stable across machines, unlike a locale collation. */
function byCodeUnit(a: string, b: string): -1 | 0 | 1 {
	if (a === b) {
		return 0;
	}
	return a < b ? -1 : 1;
}

/** `git ls-files` with `args`, one path per element. */
function gitFiles(args: readonly string[]): string[] {
	const run = Bun.spawnSync(['git', 'ls-files', '-z', ...args]);
	if (run.exitCode !== 0) {
		throw new Error(`git ls-files ${args.join(' ')} exited ${run.exitCode}`);
	}
	return run.stdout
		.toString()
		.split('\0')
		.filter((path) => path !== '');
}

/** Every path a clean checkout would hold, and every directory above
 * one: tracked files (less any deleted from the working tree) and
 * untracked files git does not ignore. */
function presentPaths(): Set<string> {
	const deleted = new Set(gitFiles(['--deleted']));
	const present = new Set<string>();
	present.add('.'); // the repo root, for a link to `./` or `../`
	for (const file of gitFiles(['--cached', '--others', '--exclude-standard'])) {
		if (deleted.has(file)) {
			continue;
		}
		present.add(file);
		let dir = dirname(file);
		while (dir !== '.' && !present.has(dir)) {
			present.add(dir);
			dir = dirname(dir);
		}
	}
	return present;
}

/** `path` less any trailing slashes. */
function withoutTrailingSlashes(path: string): string {
	let end = path.length;
	while (end > 0 && path.charAt(end - 1) === '/') {
		end -= 1;
	}
	return path.slice(0, end);
}

/** The repo path `link` in `file` points at, or `undefined` for a link
 * this check does not test: an absolute URL, a bare fragment. */
function resolveLink(file: string, link: string): string | undefined {
	if (SCHEME.test(link)) {
		return;
	}
	const cut = link.search(SUFFIX);
	let target = cut === -1 ? link : link.slice(0, cut);
	if (target === '') {
		return;
	}
	try {
		target = decodeURIComponent(target);
	} catch {
		// A malformed escape is tested as written.
	}
	const base = target.startsWith('/') ? '.' : dirname(file);
	return withoutTrailingSlashes(normalize(join(base, target)));
}

/** `text` with every fenced block and code span blanked, its line
 * breaks kept so a line number still points at the source. */
function withoutCode(text: string): string {
	// The open fence, if any: a closing fence must use the same character
	// and be at least as long (CommonMark section 4.5), so a shorter run inside
	// the block stays code.
	let open: string | undefined;
	const lines = text.split('\n').map((line) => {
		const fence = FENCE.exec(line)?.groups?.['fence'];
		if (fence !== undefined) {
			if (open === undefined) {
				open = fence;
			} else if (
				fence.startsWith(open.charAt(0)) &&
				fence.length >= open.length &&
				FENCE_CLOSE.test(line)
			) {
				open = undefined;
			}
			return '';
		}
		return open === undefined ? line : '';
	});
	return lines
		.join('\n')
		.replace(CODE_SPAN, (span) => span.replace(NOT_NEWLINE, ''));
}

/** Each link target in `text` outside code, with its 1-based line
 * number. */
function linksOf(text: string): { line: number; link: string }[] {
	const found: { line: number; link: string }[] = [];
	for (const [index, line] of withoutCode(text).split('\n').entries()) {
		const definition = REF_DEF.exec(line)?.groups?.['target'];
		if (definition !== undefined) {
			found.push({ line: index + 1, link: definition });
		}
		for (const match of line.matchAll(LINK)) {
			const link = match.groups?.['target'];
			if (link !== undefined) {
				found.push({ line: index + 1, link });
			}
		}
	}
	return found;
}

async function main(): Promise<void> {
	const present = presentPaths();
	const files = [...present]
		.filter((path) => path.endsWith('.md') && !EXEMPT.has(path))
		.sort(byCodeUnit);
	const texts = await Promise.all(files.map((file) => Bun.file(file).text()));
	let checked = 0;
	const dead: string[] = [];
	for (const [index, file] of files.entries()) {
		for (const { line, link } of linksOf(texts[index] ?? '')) {
			const target = resolveLink(file, link);
			if (target === undefined) {
				continue;
			}
			checked += 1;
			if (target.startsWith('..') || !present.has(target)) {
				dead.push(`DEAD in ${file}:${line}: ${link}`);
			}
		}
	}
	for (const line of dead) {
		console.log(line);
	}
	console.log(
		`${files.length} markdown file(s), ${checked} relative link(s), ${dead.length} dead`,
	);
	if (dead.length > 0 || files.length === 0) {
		process.exitCode = 1;
	}
}

if (import.meta.main) {
	await main();
}
