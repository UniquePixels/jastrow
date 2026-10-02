/**
 * Where to spawn biome from for the entry-data format step.
 * `migrate.ts` used to name `node_modules/.bin/biome` literally, which
 * resolves only when the process CWD is the repo root and only when
 * this checkout has installed its dependencies — a freshly created git
 * worktree has no `node_modules` of its own. Formatting is the LAST
 * step of a `--write` run, so that literal turned a missing binary into
 * 32,512 written-but-unformatted entry files: the state consolidation
 * spec R5 and the `qa:format` gate exist to prevent. Resolved here the
 * way the `qa:*` scripts resolve it — the project's own dependency
 * first, then PATH — and called once before a write run starts, so a
 * miss refuses the run instead of landing on top of it.
 */
import { existsSync, readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';

const BIOME_PACKAGE = '@biomejs/biome';

/** The four lookups this makes, injectable so the tests can pose a
 * tree this checkout does not have — a missing package being exactly
 * the case under test. */
interface BiomeLookup {
	exists: (path: string) => boolean;
	readText: (path: string) => string;
	/** Node package resolution, which walks up from `from` and so does
	 * not care what the CWD is. */
	resolve: (specifier: string, from: string) => string;
	/** PATH lookup, the fallback `bun run` itself takes when a script's
	 * binary is not in `node_modules/.bin`. */
	which: (command: string) => string | null;
}

const NODE_LOOKUP: BiomeLookup = {
	exists: (path: string): boolean => existsSync(path),
	readText: (path: string): string => readFileSync(path, 'utf8'),
	resolve: (specifier: string, from: string): string =>
		Bun.resolveSync(specifier, from),
	which: (command: string): string | null => Bun.which(command),
};

/** The installed package's own `bin.biome`, or undefined when there is
 * nothing here to spawn: no resolvable manifest, one that will not
 * read or parse, no such binary declared, or a binary that is not on
 * disk. Every one of those is a fallback to PATH, not an error — PATH
 * may still hold a biome — so the read and the parse are inside the
 * same `try` as the resolution. */
function installedBiome(lookup: BiomeLookup, from: string): string | undefined {
	let binary: string | undefined;
	try {
		const manifest = lookup.resolve(`${BIOME_PACKAGE}/package.json`, from);
		const declared = (
			JSON.parse(lookup.readText(manifest)) as {
				bin?: { biome?: string };
			}
		).bin?.biome;
		binary =
			declared === undefined ? undefined : resolve(dirname(manifest), declared);
	} catch {
		return;
	}
	return binary !== undefined && lookup.exists(binary) ? binary : undefined;
}

/** The biome to run. The project's pinned dependency wins, because
 * spec R5 makes the formatter part of what an entry file looks like and
 * the pin is the version that shaped the tree. Throws naming the fix
 * rather than handing back a path that is not there. */
function biomeBinary(
	lookup: BiomeLookup = NODE_LOOKUP,
	from: string = import.meta.dir,
): string {
	const installed = installedBiome(lookup, from);
	if (installed !== undefined) {
		return installed;
	}
	const onPath = lookup.which('biome');
	if (onPath !== null) {
		return onPath;
	}
	throw new Error(
		`no ${BIOME_PACKAGE} installed here and no biome on PATH; run \`bun install\` (a git worktree does not share the parent checkout's node_modules)`,
	);
}

export type { BiomeLookup };
export { biomeBinary };
