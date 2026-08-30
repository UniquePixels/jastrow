import { expect, it } from 'bun:test';
import { buildBody } from '../../body/dry-run.ts';
import { rejoinGlossHead } from '../../body/rejoin.ts';
import type { BodyEntry, BodySense, SourceEntry } from '../../body/types.ts';
import { composedEntries } from './corpus-fixture.ts';

/**
 * The standing gate under batch 8's second DISCARD,
 * `b-h-split-across-field-boundary` (4).
 *
 * ## The discard, in one line
 *
 * The row describes `language_code` ending in a bare `b.` while the
 * first definition opens with a bare `h.` — `b. h.` ("biblical Hebrew")
 * torn across a field boundary. It heals by construction:
 * `rejoinGlossHead` concatenates the four gloss-head fragments IN PRINT
 * ORDER and invents no separator, so `" ch. = b."` followed by
 * `" h. מוּג, to melt."` becomes `" ch. = b. h. מוּג, to melt."` again.
 * That is the K00664-class mid-phrase straddle `rejoin.ts`'s own header
 * says the module exists to heal, and this row is another instance of
 * it rather than a new defect.
 *
 * ## Why the gate is not a test of `rejoinGlossHead`
 *
 * It asserts the property through `buildBody`, which calls
 * `rejoinGlossHead` at `dry-run.ts:241`. Asserting on the helper alone
 * would leave the discard resting on a call site nothing checks: a
 * builder that stopped using the rejoin, or used it and then re-split
 * on a parse, would return all 4 defects with the helper still passing.
 * What the discard claims is about what a READER is shown, so that is
 * where it is measured.
 *
 * ## The predicate is the WIDER one, deliberately
 *
 * An exact `"= b."` match reads only 2 of the 4. The row's own text
 * names the exact form, so the wider predicate — any `language_code`
 * ending in a bare `b.` — is stated here and is what reproduces the
 * catalogued count.
 *
 * Audit: `data/patches/catalogue-audit/b-h-field-split.md`.
 */

const TIMEOUT = 120_000;

/** `language_code` ending in a bare `b.`, and a first definition
 * opening with a bare `h.`. */
const CODE_ENDS_B = /\bb\.\s*$/u;
const DEFINITION_OPENS_H = /^\s*h\.\s/u;
/** What the two fragments must read as once rejoined. */
const HEALED = /b\.\s*h\./u;

const strip = (s: string): string => s.replace(/<[^>]*>/gu, '');

/** The four the catalogue names, measured rather than assumed. */
const CATALOGUED = ['C00090', 'M00231', 'M00395', 'R00196'];

/**
 * The strings of the body's INTRO sense, each on its own.
 *
 * NOT joined. `buildBody` folds the rejoined gloss head into the entry's
 * intro sense (`dry-run.ts:247`, `pushTextSense(acc, joined, …)`), so
 * that is where `b. h.` must appear — and it must appear inside ONE
 * string. Joining the whole body with a separator, which is what an
 * earlier version of this file did, inserts a space between every field
 * and makes `HEALED` match even when `buildBody` has put `b.` at the end
 * of one field and `h.` at the start of the next. That is precisely the
 * regression this gate exists to catch, so the join would have let it
 * through.
 */
function introStrings(body: BodyEntry): string[] {
	const intro: BodySense | undefined = body.senses[0];
	if (intro === undefined) {
		return [];
	}
	return [intro.gloss, ...intro.units].map(strip);
}

interface Census {
	/** Of those, the ones whose BUILT body reads `b. h.` — the claim
	 * the discard actually makes. */
	built: string[];
	/** The narrower `"= b."` predicate, for the count discrepancy. */
	exact: string[];
	/** Of those, the ones whose REJOINED gloss head reads `b. h.`. */
	rejoined: string[];
	/** Rids matching the row's widened predicate. */
	split: string[];
}

function census(entries: readonly SourceEntry[]): Census {
	const out: Census = { built: [], exact: [], rejoined: [], split: [] };
	for (const entry of entries) {
		const code = entry.language_code ?? '';
		const first = strip(entry.content.senses[0]?.definition ?? '');
		if (!(CODE_ENDS_B.test(code) && DEFINITION_OPENS_H.test(first))) {
			continue;
		}
		out.split.push(entry.rid);
		if (/[=]\s*b\.\s*$/u.test(code)) {
			out.exact.push(entry.rid);
		}
		if (HEALED.test(strip(rejoinGlossHead(entry).joined))) {
			out.rejoined.push(entry.rid);
		}
		if (introStrings(buildBody(entry).body).some((text) => HEALED.test(text))) {
			out.built.push(entry.rid);
		}
	}
	return out;
}

let memo: Census | undefined;
async function measured(): Promise<Census> {
	memo ??= census(await composedEntries());
	return memo;
}

// §1 — THE COUNT, and it reproduces exactly under the widened
// predicate.
it(
	'finds exactly the four the catalogue names',
	async () => {
		const { split } = await measured();
		expect([...split].sort()).toEqual(CATALOGUED);
	},
	TIMEOUT,
);

// §2 — THE PREMISE OF THE DISCARD, asserted where the reader is: the
// built body, not the rejoin helper — and within a SINGLE intro-sense
// string, so a builder that re-split the two halves across fields fails
// here instead of being papered over by a join separator.
it(
	'reads "b. h." contiguously in the BUILT body, all four',
	async () => {
		const { built, split } = await measured();
		expect([...built].sort()).toEqual(CATALOGUED);
		expect(built).toHaveLength(split.length);
	},
	TIMEOUT,
);

// §3 — THE MECHANISM, separately, so a failure says WHICH half broke.
// If §3 passes and §2 fails, the rejoin still works and the builder
// stopped using it.
it(
	'rejoins the two fragments contiguously in the gloss head',
	async () => {
		const { rejoined } = await measured();
		expect([...rejoined].sort()).toEqual(CATALOGUED);
	},
	TIMEOUT,
);

// §4 — THE COUNT DISCREPANCY THE ROW HIDES. An exact `"= b."` match
// reads 2. Recorded so a future reader does not re-derive the row's 4
// with the narrow predicate, fail to reproduce it, and conclude the
// catalogue was wrong.
it(
	'reads only two under the narrower "= b." predicate',
	async () => {
		const { exact } = await measured();
		expect(exact).toHaveLength(2);
	},
	TIMEOUT,
);
