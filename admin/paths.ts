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
import { fileURLToPath } from 'node:url';

/** The repo root: the folder above `admin/`. */
const ROOT = fileURLToPath(new URL('../', import.meta.url));

export const paths = {
	/** Where entry files live: one `<first letter>/<id>.json` per
	 * entry. Written by the import, read by `bun data:validate`. */
	entries: join(ROOT, 'data', 'entries'),
} as const;
