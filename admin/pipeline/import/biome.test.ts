import { describe, expect, it } from 'bun:test';
import { type BiomeLookup, biomeBinary } from './biome.ts';

const MANIFEST = '/repo/node_modules/@biomejs/biome/package.json';
const INSTALLED = '/repo/node_modules/@biomejs/biome/bin/biome';
const ON_PATH = '/usr/local/bin/biome';

/** A lookup over a posed tree: `manifest` is what resolution finds (a
 * thrown string stands for an unresolvable package), `files` what is on
 * disk, `path` what PATH holds. */
function lookup(
	manifest: string | undefined,
	declared: Record<string, string> | undefined,
	files: readonly string[],
	onPath: string | null,
): BiomeLookup {
	return {
		exists: (path: string): boolean => files.includes(path),
		readText: (): string => JSON.stringify({ bin: declared, version: '2.5.2' }),
		resolve: (): string => {
			if (manifest === undefined) {
				throw new Error('Cannot find package');
			}
			return manifest;
		},
		which: () => onPath,
	};
}

const BIOME_BIN = { biome: 'bin/biome' };

describe('biomeBinary', () => {
	it("returns the installed package's declared binary, resolved absolute", () => {
		const found = lookup(MANIFEST, BIOME_BIN, [INSTALLED], null);
		expect(biomeBinary(found)).toBe(INSTALLED);
	});

	it('prefers the installed dependency over PATH: the pin shaped the tree', () => {
		const both = lookup(MANIFEST, BIOME_BIN, [INSTALLED], ON_PATH);
		expect(biomeBinary(both)).toBe(INSTALLED);
	});

	it('falls back to PATH when the package does not resolve', () => {
		const bare = lookup(undefined, undefined, [], ON_PATH);
		expect(biomeBinary(bare)).toBe(ON_PATH);
	});

	it('falls back to PATH when the manifest declares no biome binary', () => {
		const other = lookup(MANIFEST, { somethingElse: 'bin/other' }, [], ON_PATH);
		expect(biomeBinary(other)).toBe(ON_PATH);
	});

	it('falls back to PATH when the manifest will not parse', () => {
		const truncated: BiomeLookup = {
			...lookup(MANIFEST, BIOME_BIN, [INSTALLED], ON_PATH),
			readText: (): string => '{"name": "@biomejs/bio',
		};
		expect(biomeBinary(truncated)).toBe(ON_PATH);
	});

	it('falls back to PATH when the manifest will not read', () => {
		const unreadable: BiomeLookup = {
			...lookup(MANIFEST, BIOME_BIN, [INSTALLED], ON_PATH),
			readText: (): string => {
				throw new Error('EACCES: permission denied');
			},
		};
		expect(biomeBinary(unreadable)).toBe(ON_PATH);
	});

	it('falls back to PATH when the declared binary is not on disk', () => {
		const partial = lookup(MANIFEST, BIOME_BIN, [], ON_PATH);
		expect(biomeBinary(partial)).toBe(ON_PATH);
	});

	it('throws naming `bun install` when neither holds a biome', () => {
		const empty = lookup(undefined, undefined, [], null);
		expect(() => biomeBinary(empty)).toThrow(/bun install/u);
	});

	it('resolves from this module, not the CWD: a worktree run is not rooted', () => {
		let asked: string | undefined;
		const spy: BiomeLookup = {
			...lookup(MANIFEST, BIOME_BIN, [INSTALLED], null),
			resolve: (_specifier: string, from: string): string => {
				asked = from;
				return MANIFEST;
			},
		};
		biomeBinary(spy);
		// This module's own directory, which is the same wherever the
		// process was started from — the literal `node_modules/.bin`
		// path it replaced only resolved from the repo root.
		expect(asked).toBe(import.meta.dir);
	});
});
