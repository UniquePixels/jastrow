/**
 * Paths more than one admin module names, declared once (ruling
 * `11-06 shared paths`).
 *
 * A config file, not a library, so it sits at `admin/`'s root beside
 * the module folders rather than in `lib/`. Only a path two or more
 * modules name belongs here; a path one module alone names stays in
 * that module.
 *
 * Each path is absolute, resolved against the repo root from this
 * file's own location, so a command run from any folder reads the same
 * tree.
 */
import { join } from 'node:path';

/** The repo root: the folder above `admin/`. */
const ROOT = join(import.meta.dirname, '..');

export const paths = {
	/** The repo root. A path one module alone names is built on this in
	 * that module, so it is anchored the same way without living here. */
	root: ROOT,
	/** Where entry files live: one `<first letter>/<id>.json` per
	 * entry. Written by the import, read by `bun data:validate`. */
	entries: join(ROOT, 'data', 'entries'),
} as const;
