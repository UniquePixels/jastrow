/**
 * The committed truth tree against every truth check (consolidation
 * spec §5.1). This is what a hand edit to `data/entries/` meets in
 * `bun qa` and CI's `Test` job; `validate.test.ts` holds the controls.
 * It reads truth and the page index, never the source snapshot, so it
 * belongs to the unit tier.
 *
 * The tree is at schema v2 as of the batched rewrite (2026-09-22), so
 * it is validated whole: the `sefariaHeadword` uniqueness clause, the
 * name-collision check, §3.1's rules over each entry's real
 * `headwords`/`display` pair, the schema, the markup vocabulary, the
 * cite targets and the page index all read the committed data. The
 * transitional shim that stood in for the renamed fields while the
 * rewrite was pending is gone with it.
 */
import { expect, it } from 'bun:test';
import { loadPageIndex } from './page.ts';
import { loadTruthFiles, validateTruth } from './validate.ts';

it('the committed truth tree passes every truth check', async () => {
	const { files, problems } = await loadTruthFiles();
	// A floor, not the count: fails if the glob silently stops matching,
	// without breaking when an entry is added.
	expect(files.length).toBeGreaterThan(32_000);
	problems.push(...validateTruth(files, await loadPageIndex()));
	expect({ count: problems.length, first: problems.slice(0, 20) }).toEqual({
		count: 0,
		first: [],
	});
}, 30_000);
