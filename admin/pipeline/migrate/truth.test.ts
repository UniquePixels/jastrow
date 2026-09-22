/**
 * The committed truth tree against every truth check (consolidation
 * spec §5.1). This is what a hand edit to `data/entries/` meets in
 * `bun qa` and CI's `Test` job; `validate.test.ts` holds the controls.
 * It reads truth and the page index, never the source snapshot, so it
 * belongs to the unit tier.
 *
 * **TRANSITIONAL, 2026-09-21.** Two rulings have changed the entry
 * shape without rewriting the tree: URL names spec §9 steps 1–3
 * (`sefariaHeadword` replaces `slug`) and headword design §2
 * (`headwords[]` plus an optional `display` replace
 * `headword`/`altHeadwords`, under `"schemaVersion": 2`). The
 * maintainer has ruled ONE batched rewrite of all 32,512 files, and
 * the PRs that changed the schema deliberately did not perform it.
 *
 * Until that rewrite lands the renamed and added fields are set aside
 * HERE, in the test, and nowhere in `validate.ts` — every other check
 * runs against the committed tree exactly as before, unrelaxed. The
 * first case below fails the moment the rewrite lands, which is what
 * removes the shim.
 */
import { expect, it } from 'bun:test';
import { loadPageIndex } from './page.ts';
import { type FormObject, SCHEMA_VERSION, type TruthEntry } from './types.ts';
import { loadTruthFiles, type TruthFile, validateTruth } from './validate.ts';

/** The pre-rewrite shape, as a committed file carries it. */
interface LegacyEntry {
	altHeadwords?: FormObject[];
	headword?: FormObject;
	headwords?: FormObject[];
	schemaVersion?: number;
	sefariaHeadword?: string;
	slug?: string;
}

/** One file with the renamed and added fields set aside: `slug`
 * dropped, `sefariaHeadword` stood in for by the rid, the form pair
 * folded into `headwords[]`, and `schemaVersion` stamped.
 *
 * Each stand-in is chosen so the check it satisfies is satisfied
 * TRIVIALLY rather than measured, and those are the checks the rewrite
 * has to switch on:
 *
 * - the rid is unique by construction, so the `sefariaHeadword`
 *   uniqueness clause cannot fail here;
 * - `display` is left ABSENT, which is a shape §3 admits, so §3.1's
 *   rules 1–3 have no template to read.
 *
 * Everything else reads the entry's own data and really is checked:
 * the current NAME is derived from the committed primary form and
 * tested for collisions (in NFC, which is §3.1 rule 6), as are the
 * schema's other constraints, rule 5 over the folded form list, the
 * file path, the markup vocabulary, the cite targets and the page
 * index. */
function asideRenamedFields(file: TruthFile): TruthFile {
	// A file holding `null` or an array is handed on UNTOUCHED, for
	// `checkFiles` to reject by path. Destructuring it here would throw
	// a TypeError naming no path and abort the whole run — one bad hand
	// edit hiding every other finding, which is what `loadTruthFiles`
	// catches parse errors to avoid.
	if (!isLegacy(file)) {
		return file;
	}
	const {
		altHeadwords,
		headword,
		slug: _slug,
		...rest
	} = file.entry as LegacyEntry;
	const entry = rest as TruthEntry;
	return {
		entry: {
			...entry,
			headwords: [
				...(headword === undefined ? [] : [headword]),
				...(altHeadwords ?? []),
			],
			schemaVersion: SCHEMA_VERSION,
			sefariaHeadword: entry.id,
		},
		path: file.path,
	};
}

/** Whether a file is still in the pre-rewrite shape. A non-object is
 * not, so it falls through to the schema check. */
function isLegacy(file: TruthFile): boolean {
	if (typeof file.entry !== 'object' || file.entry === null) {
		return false;
	}
	const entry = file.entry as LegacyEntry;
	return entry.slug !== undefined && entry.headwords === undefined;
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
