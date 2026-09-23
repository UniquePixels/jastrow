/**
 * The licence rule, asserted mechanically.
 *
 * The repo's whole licence statement is one sentence: everything under
 * `data/` is public domain, everything else is MIT. A sentence cannot
 * enforce itself, and the way this one will actually be broken is
 * someone dropping a helper beside the data it helps with. So: no
 * TypeScript under `data/`.
 *
 * The second check is attribution. Jastrow 1903 is out of copyright
 * and the Internet Archive scans carry no rights field, so nothing
 * COMPELS credit to Sefaria, to the University of Toronto's Robarts
 * Library or to the Ontario Council of University Libraries. It is
 * owed anyway, and a README beside each directory is where a reader
 * will actually find it.
 */
import { describe, expect, it } from 'bun:test';

const DATA_DIR = 'data';

async function subdirectories(): Promise<string[]> {
	const seen = new Set<string>();
	for await (const p of new Bun.Glob('*/**').scan({
		cwd: DATA_DIR,
		onlyFiles: true,
	})) {
		const top = p.split('/')[0];
		if (top !== undefined) {
			seen.add(top);
		}
	}
	return [...seen].sort();
}

describe('data/ carries no code', () => {
	it('has no TypeScript anywhere beneath it', async () => {
		const found: string[] = [];
		for await (const p of new Bun.Glob('**/*.ts').scan({
			cwd: DATA_DIR,
			onlyFiles: true,
		})) {
			found.push(`${DATA_DIR}/${p}`);
		}
		expect(found).toEqual([]);
	});
});

describe('data/ carries its attribution', () => {
	it('every subdirectory has a README', async () => {
		const dirs = await subdirectories();
		// A positive control: a glob that stopped matching would make
		// the assertion below vacuously true.
		expect(dirs.length).toBeGreaterThanOrEqual(6);
		const missing: string[] = [];
		for (const d of dirs) {
			if (!(await Bun.file(`${DATA_DIR}/${d}/README.md`).exists())) {
				missing.push(d);
			}
		}
		expect(missing).toEqual([]);
	});
});
