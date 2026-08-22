import { describe, expect, it } from 'bun:test';
import {
	buildLock,
	combineHashes,
	computeSnapshot,
	describeMismatches,
	diffSnapshot,
	LOCK_PATH,
	parseLock,
	SNAPSHOT_FILES,
} from './snapshot.ts';

describe('computeSnapshot', () => {
	it('is deterministic across runs', async () => {
		const a = await computeSnapshot();
		const b = await computeSnapshot();
		expect(a).toEqual(b);
	});

	it('covers exactly the fixed snapshot file list, in order', async () => {
		const pin = await computeSnapshot();
		expect(pin.files.map((f) => f.path)).toEqual([...SNAPSHOT_FILES]);
	});

	it('matches the committed lock (working tree = pinned snapshot)', async () => {
		const locked = parseLock(await Bun.file(LOCK_PATH).text());
		const current = await computeSnapshot();
		expect(current.combined).toBe(locked.combined);
		expect(current.files).toEqual(locked.files);
	});
});

describe('lock round-trip', () => {
	it('parseLock inverts buildLock', async () => {
		const pin = await computeSnapshot();
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
