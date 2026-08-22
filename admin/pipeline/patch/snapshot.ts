#!/usr/bin/env bun
/**
 * Snapshot hash + corpus pin (research-process plan Task 1; spec
 * docs/specs/2026-08-10-research-process-design.md §3, §5.1).
 *
 * The canonical snapshot hash is a sha256 over the committed decoded
 * snapshot files in the fixed order below — source data only, never
 * reports. Every semantic patch pins this value; the apply engine's
 * preflight compares it; the maintenance track rebases it through
 * review, never silently.
 *
 * Usage:
 *   bun admin/pipeline/patch/snapshot.ts            # verify against lock
 *   bun admin/pipeline/patch/snapshot.ts --write    # (re)write the lock
 */
import { createHash } from 'node:crypto';
import process from 'node:process';
import { sha256 } from '../lib.ts';

// Hoisted per lint/performance/useTopLevelRegex — no state (`g`/`y`)
// flags, so sharing across calls is safe.
const LOCK_COMBINED_LINE = /^sha256:(?<hex>[0-9a-f]{64})$/u;
const LOCK_FILE_LINE = /^(?<path>\S+) sha256:(?<hex>[0-9a-f]{64})$/u;

/**
 * The decoded snapshot: exactly what `pipeline:fetch` emits from the
 * Sefaria dump, in fixed (alphabetical) order. `manifest.json` is
 * provenance about the fetch, `edit-replay.jsonl` is admin-tool
 * history, and `*-report.json` files are pipeline output — none of
 * them are snapshot content, so none of them are hashed.
 */
const SNAPSHOT_FILES = [
	'data/source/jastrow-dictionary.jsonl',
	'data/source/lexicons.json',
] as const;

const LOCK_PATH = 'data/patches/snapshot.lock';

/** One hashed snapshot file. */
interface FileHash {
	path: string;
	sha256: string;
}

/** A computed (or parsed) snapshot pin: the combined hash plus the
 * per-file hashes it was derived from. */
interface SnapshotPin {
	combined: string;
	files: FileHash[];
}

/** Hash every snapshot file in the fixed canonical order. */
async function hashSnapshotFiles(
	paths: readonly string[] = SNAPSHOT_FILES,
): Promise<FileHash[]> {
	const files: FileHash[] = [];
	for (const path of paths) {
		files.push({ path, sha256: await sha256(path) });
	}
	return files;
}

/** Fold the per-file hashes into the single canonical pin value: a
 * sha256 over `<path> sha256:<hash>` lines in file order. Folding the
 * paths in means a renamed or reordered file changes the pin. */
function combineHashes(files: readonly FileHash[]): string {
	const hash = createHash('sha256');
	for (const file of files) {
		hash.update(`${file.path} sha256:${file.sha256}\n`);
	}
	return hash.digest('hex');
}

/** Compute the current working tree's snapshot pin. */
async function computeSnapshot(
	paths: readonly string[] = SNAPSHOT_FILES,
): Promise<SnapshotPin> {
	const files = await hashSnapshotFiles(paths);
	return { combined: combineHashes(files), files };
}

/** Serialize a pin as the lock-file text: combined value first, then
 * the per-file lines it derives from (kept for auditability). */
function buildLock(pin: SnapshotPin): string {
	const lines = [`sha256:${pin.combined}`];
	for (const file of pin.files) {
		lines.push(`${file.path} sha256:${file.sha256}`);
	}
	return `${lines.join('\n')}\n`;
}

/** Parse lock-file text back into a pin. Throws on any malformed
 * line — a hand-edited lock should fail loudly, not verify quietly. */
function parseLock(text: string): SnapshotPin {
	const lines = text.trim().split('\n');
	const first = lines[0]?.match(LOCK_COMBINED_LINE);
	if (first?.groups?.['hex'] === undefined) {
		throw new Error(
			`malformed lock: expected "sha256:<hex>", got "${lines[0]}"`,
		);
	}
	const files: FileHash[] = [];
	for (const line of lines.slice(1)) {
		const m = line.match(LOCK_FILE_LINE);
		if (m?.groups?.['path'] === undefined || m.groups['hex'] === undefined) {
			throw new Error(`malformed lock line: "${line}"`);
		}
		files.push({ path: m.groups['path'], sha256: m.groups['hex'] });
	}
	return { combined: first.groups['hex'], files };
}

/** One per-file difference between the lock and the working tree. */
interface SnapshotMismatch {
	actual: string | undefined;
	expected: string | undefined;
	path: string;
}

/** Compare a computed pin against the locked pin, naming every file
 * that changed, appeared, or disappeared — never just the first. */
function diffSnapshot(
	locked: SnapshotPin,
	current: SnapshotPin,
): SnapshotMismatch[] {
	const mismatches: SnapshotMismatch[] = [];
	const lockedByPath = new Map(locked.files.map((f) => [f.path, f.sha256]));
	const currentByPath = new Map(current.files.map((f) => [f.path, f.sha256]));
	for (const [path, expected] of lockedByPath) {
		const actual = currentByPath.get(path);
		if (actual !== expected) {
			mismatches.push({ actual, expected, path });
		}
	}
	for (const [path, actual] of currentByPath) {
		if (!lockedByPath.has(path)) {
			mismatches.push({ actual, expected: undefined, path });
		}
	}
	return mismatches;
}

/** Human-readable mismatch report. The fix is a reviewed
 * maintenance-track rebase (spec §6) — re-locking without review
 * would silently invalidate every committed patch's pin. */
function describeMismatches(mismatches: readonly SnapshotMismatch[]): string {
	const lines = ['snapshot pin mismatch — changed files:'];
	for (const m of mismatches) {
		lines.push(
			`  ${m.path}: locked ${m.expected ?? '(absent)'} → current ${m.actual ?? '(absent)'}`,
		);
	}
	lines.push(
		'The corpus pin moves only through a reviewed maintenance-track',
		'rebase (spec §6, 2026-08-10-research-process-design.md).',
		'Do not re-lock: update or retire the affected patches first.',
	);
	return lines.join('\n');
}

/** Verify the working tree against the committed lock. Returns the
 * mismatch list (empty = verified). */
async function verifySnapshot(
	lockPath: string = LOCK_PATH,
): Promise<SnapshotMismatch[]> {
	const locked = parseLock(await Bun.file(lockPath).text());
	const current = await computeSnapshot();
	if (locked.combined === current.combined) {
		return [];
	}
	return diffSnapshot(locked, current);
}

if (import.meta.main) {
	if (Bun.argv.includes('--write')) {
		const pin = await computeSnapshot();
		await Bun.write(LOCK_PATH, buildLock(pin));
		console.log(`wrote ${LOCK_PATH}: sha256:${pin.combined}`);
	} else {
		const mismatches = await verifySnapshot();
		if (mismatches.length > 0) {
			console.error(describeMismatches(mismatches));
			process.exit(1);
		}
		console.log('snapshot pin verified');
	}
}

export type { FileHash, SnapshotMismatch, SnapshotPin };
export {
	buildLock,
	combineHashes,
	computeSnapshot,
	describeMismatches,
	diffSnapshot,
	hashSnapshotFiles,
	LOCK_PATH,
	parseLock,
	SNAPSHOT_FILES,
	verifySnapshot,
};
