/**
 * The committed truth tree against every truth check (consolidation
 * spec §5.1). This is what a hand edit to `data/entries/` meets in
 * `bun qa` and CI's `Test` job; `validate.test.ts` holds the controls.
 * It reads truth and the page index, never the source snapshot, so it
 * belongs to the unit tier.
 *
 * **TRANSITIONAL, 2026-09-21 (URL names spec §9 steps 1–3).** The
 * schema now requires `sefariaHeadword` and forbids `slug`, and the
 * committed tree still carries the old pair: the maintainer has ruled
 * ONE batched rewrite of all 32,512 files, and the PR that changed the
 * schema deliberately did not perform it. Until that rewrite lands the
 * two fields are set aside HERE, in the test, and nowhere in
 * `validate.ts` — every other check runs against the committed tree
 * exactly as before, unrelaxed. The first case below fails the moment
 * the rewrite lands, which is what removes the shim.
 */
import { expect, it } from 'bun:test';
import { loadPageIndex } from './page.ts';
import type { TruthEntry } from './types.ts';
import { loadTruthFiles, type TruthFile, validateTruth } from './validate.ts';

/** The pre-rewrite pair, as a committed file carries it. */
interface LegacyEntry {
	sefariaHeadword?: string;
	slug?: string;
}

/** One file with the renamed pair set aside: `slug` dropped, and
 * `sefariaHeadword` stood in for by the rid.
 *
 * The rid is a PLACEHOLDER and is unique by construction, so the
 * uniqueness clause over that field is satisfied trivially rather than
 * measured — it is the one check the rewrite has to switch on. Every
 * other check reads the entry's own data: the current NAME is derived
 * from the committed `headword` and really is checked for collisions,
 * as are the schema's other constraints, the file path, the markup
 * vocabulary, the cite targets and the page index. */
function asideRenamedFields(file: TruthFile): TruthFile {
	const { slug: _slug, ...rest } = file.entry as LegacyEntry;
	const entry = rest as TruthEntry;
	return {
		entry: { ...entry, sefariaHeadword: entry.id },
		path: file.path,
	};
}

/** Whether a file is still in the pre-rewrite shape. */
function isLegacy(file: TruthFile): boolean {
	const entry = file.entry as LegacyEntry;
	return entry.slug !== undefined && entry.sefariaHeadword === undefined;
}

it('the committed truth tree is still the pre-rewrite shape', async () => {
	// The shim's own expiry. When the batched rewrite lands this fails,
	// and the fix is to delete `asideRenamedFields`, this case, and the
	// docstring above — leaving the tree checked in full.
	const { files } = await loadTruthFiles();
	expect(files.filter((f) => !isLegacy(f))).toEqual([]);
}, 30_000);

it('the committed truth tree passes every truth check', async () => {
	const { files, problems } = await loadTruthFiles();
	// A floor, not the count: fails if the glob silently stops matching,
	// without breaking when an entry is added.
	expect(files.length).toBeGreaterThan(32_000);
	problems.push(
		...validateTruth(files.map(asideRenamedFields), await loadPageIndex()),
	);
	expect({ count: problems.length, first: problems.slice(0, 20) }).toEqual({
		count: 0,
		first: [],
	});
}, 30_000);
