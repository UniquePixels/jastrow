/**
 * Snapshot hashing, WITHOUT the corpus.
 *
 * This file used to call `computeSnapshot` with no argument four
 * times. That defaults to the module's fixed snapshot file list and
 * so read the 41 MB pinned corpus from the unit tier — the tier that
 * consolidation spec R9 says never reads `data/source/`, and that
 * `test-tiers.test.ts` claimed to police (review 2026-09-21,
 * report-code §6). The function takes its paths, so the two tiny
 * fixtures beside this file exercise the same code with known bytes
 * and a pinned hash — a stronger assertion than "deterministic across
 * two runs", which a function returning a constant would also pass.
 *
 * `test-tiers.test.ts` now carries both of those no-argument shapes as
 * tier signals, so the old form cannot come back quietly. (It matches
 * on file TEXT, which is why this note spells neither of them the way
 * the code would.) What left with the corpus read is the "working
 * tree = pinned snapshot" assertion, which genuinely needs it: that
 * one lives on the `snapshot.ts` CLI and on migrate's own preflight,
 * where `preparePatches` pins every patch against a freshly computed
 * hash. What stays here is the lock's INTERNAL consistency, which
 * needs only the lock.
 */
import { describe, expect, it } from 'bun:test';
import {
	buildLock,
	combineHashes,
	computeSnapshot,
	describeMismatches,
	diffSnapshot,
	LOCK_PATH,
	parseLock,
} from './snapshot.ts';

/** Two committed files of a few dozen bytes each, standing in for the
 * snapshot pair. Their hashes are pinned below, so a change to either
 * fixture fails loudly rather than re-baselining itself. */
const FIXTURES = [
	`${import.meta.dir}/fixtures/snapshot/one.jsonl`,
	`${import.meta.dir}/fixtures/snapshot/two.json`,
];

/** Pinned over the bytes as `biome format` leaves them — it is the
 * one formatter for the tree (consolidation spec R5) and it does
 * reach a `.json` fixture, so a hash taken before the format would
 * re-baseline itself on the next `bun qa`. */
const FIXTURE_HASHES = [
	'cb53dc6a1168b4e422b99a8c1545cbc138cb4d924d495012db8d783a3ac6be7c',
	'828f8b58c6d3542ee86c72708c0635ff72d32cbbeba98281eeb113afd54212d2',
];

describe('computeSnapshot', () => {
	it('hashes each file it is given, in the order given', async () => {
		const pin = await computeSnapshot(FIXTURES);
		expect(pin.files.map((f) => f.path)).toEqual(FIXTURES);
		expect(pin.files.map((f) => f.sha256)).toEqual(FIXTURE_HASHES);
	});

	it('folds them into the combined pin', async () => {
		const pin = await computeSnapshot(FIXTURES);
		expect(pin.combined).toBe(
			combineHashes(
				FIXTURES.map((path, i) => ({
					path,
					sha256: FIXTURE_HASHES[i] ?? '',
				})),
			),
		);
	});

	it('is deterministic across runs', async () => {
		const a = await computeSnapshot(FIXTURES);
		const b = await computeSnapshot(FIXTURES);
		expect(a).toEqual(b);
	});
});

describe('the committed lock', () => {
	// The lock is a few hundred bytes, not the snapshot it pins, so
	// reading it here costs nothing and stays inside R9. A hand-edited
	// file hash that was not folded back into the combined line is the
	// failure this catches.
	it('folds its own file hashes into its own combined line', async () => {
		const locked = parseLock(await Bun.file(LOCK_PATH).text());
		expect(locked.files.length).toBeGreaterThan(0);
		expect(combineHashes(locked.files)).toBe(locked.combined);
	});
});

describe('lock round-trip', () => {
	it('parseLock inverts buildLock', async () => {
		const pin = await computeSnapshot(FIXTURES);
		expect(parseLock(buildLock(pin))).toEqual(pin);
	});

	it('rejects a malformed combined line', () => {
		expect(() => parseLock('sha256:nothex\n')).toThrow('malformed lock');
	});

	it('rejects a malformed file line', () => {
		expect(() => parseLock(`sha256:${'a'.repeat(64)}\nno-hash-here\n`)).toThrow(
			'malformed lock line',
		);
	});
});

describe('mismatch reporting', () => {
	const locked = {
		combined: 'x'.repeat(64),
		files: [
			{ path: 'data/source/jastrow-dictionary.jsonl', sha256: 'a'.repeat(64) },
			{ path: 'data/source/lexicons.json', sha256: 'b'.repeat(64) },
		],
	};

	it('names every changed file, not just the first', () => {
		const current = {
			combined: 'y'.repeat(64),
			files: [
				{
					path: 'data/source/jastrow-dictionary.jsonl',
					sha256: 'c'.repeat(64),
				},
				{ path: 'data/source/lexicons.json', sha256: 'd'.repeat(64) },
			],
		};
		const mismatches = diffSnapshot(locked, current);
		expect(mismatches.map((m) => m.path)).toEqual([
			'data/source/jastrow-dictionary.jsonl',
			'data/source/lexicons.json',
		]);
	});

	it('reports files that appear or disappear', () => {
		const current = {
			combined: 'y'.repeat(64),
			files: [
				{
					path: 'data/source/jastrow-dictionary.jsonl',
					sha256: 'a'.repeat(64),
				},
				{ path: 'data/source/new-file.json', sha256: 'e'.repeat(64) },
			],
		};
		const paths = diffSnapshot(locked, current).map((m) => m.path);
		expect(paths).toContain('data/source/lexicons.json');
		expect(paths).toContain('data/source/new-file.json');
	});

	it('points to the maintenance-track rebase, not re-locking', () => {
		const message = describeMismatches([
			{
				actual: 'c'.repeat(64),
				expected: 'a'.repeat(64),
				path: 'data/source/jastrow-dictionary.jsonl',
			},
		]);
		expect(message).toContain('data/source/jastrow-dictionary.jsonl');
		expect(message).toContain('maintenance-track');
		expect(message).toContain('Do not re-lock');
	});
});

describe('combineHashes', () => {
	it('changes when a path is renamed, even with identical content hashes', () => {
		const files = [{ path: 'a', sha256: 'a'.repeat(64) }];
		const renamed = [{ path: 'b', sha256: 'a'.repeat(64) }];
		expect(combineHashes(files)).not.toBe(combineHashes(renamed));
	});

	it('changes when file order changes', () => {
		const one = { path: 'a', sha256: 'a'.repeat(64) };
		const two = { path: 'b', sha256: 'b'.repeat(64) };
		expect(combineHashes([one, two])).not.toBe(combineHashes([two, one]));
	});
});
