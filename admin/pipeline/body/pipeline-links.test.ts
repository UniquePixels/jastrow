/** Corpus tier — LINK INTEGRITY OF THE PIPELINE, not of a rule.
 *
 * Why this file exists, stated plainly because it is the lesson rather
 * than the code. Batch 3a's own census
 * (`transform/rules/gershayim.test.ts`) applies the rules to PRISTINE
 * source, which is the right way to measure a rule and the wrong way to
 * describe a pipeline: `migrate-dry` runs `applyRepairs` FIRST and
 * transforms on the healed entry. `migrate-dry` itself counts records
 * and never scores link resolution. So nothing in the suite ran the two
 * in sequence and asked whether links still resolved — and a
 * pre-existing repair (`repairs.ts`'s class-1 gershayim escape) turned
 * out to be repairing 22 of the same 90 anchors by writing `&quot;`
 * where the transform writes `״` — two spellings of one address, which
 * cost 22 cross-links and was found by reading one instance count in a
 * report at batch close. That escape is now retired (maintainer ruling
 * 2026-08-24) and this file is what would have caught it.
 *
 * The gap, not the incident, is what this closes. Any future rule or
 * repair that moves a link target — or moves a HEADWORD out from under
 * one — fails here, whichever layer it lives in.
 *
 * Cost: two full pipeline passes (`applyRepairs` + the whole registry)
 * over 32,512 entries. That is expensive and it is deliberate; the
 * cheaper per-rule measurement is the one that missed this. */
import { describe, expect, it } from 'bun:test';
import { tokenize } from '../transform/html.ts';
import { anchors } from '../transform/links.ts';
import { fieldsOf } from '../transform/no-new-text.ts';
import { RULES } from '../transform/registry.ts';
import { applyTransforms } from '../transform/run.ts';
import { applyRepairs, REPAIRED_ORPHAN_ITEMS } from './repairs.ts';
import { readSourceEntries } from './source.ts';
import type { SourceEntry } from './types.ts';

/** A Jastrow address is the headword string VERBATIM followed by the
 * sense number, so the headword is read GREEDILY. A lazy read that
 * strips a trailing roman numeral loses 7,536 honest links and — worse
 * — resolves 1,131 addresses to a DIFFERENT headword than the greedy
 * read does. See `transform/rules/gershayim.test.ts` and
 * `docs/v2/transform-batch-3a.md` §8.3. */
const JASTROW_REF = /^Jastrow, (?<headword>.+) (?<sense>\d+)$/u;

const GERSHAYIM = '״';

/** The two rules under test here by their absence: the "before" corpus
 * is the pipeline with the gershayim pair withheld. */
const GERSHAYIM_RULES = new Set([
	'ascii-quote-as-gershayim-in-body',
	'gershayim-breaks-ref-attribute',
]);

function pipeline(
	source: SourceEntry,
	rules: readonly (typeof RULES)[number][],
): SourceEntry {
	return applyTransforms(applyRepairs(source).entry, 'text-repairs', rules)
		.entry;
}

/** Every anchor in the corpus, keyed by `rid|walk-position`. Keying on
 * the target STRING instead would collapse an entry's duplicate targets
 * into one set member and under-count the delta — measured at 88 rather
 * than 90 when batch 3a tried it. */
function resolvingTargets(corpus: readonly SourceEntry[]): Set<string> {
	const headwords = new Set(corpus.map((entry) => entry.headword));
	const resolving = new Set<string>();
	for (const entry of corpus) {
		let position = 0;
		for (const field of fieldsOf(entry)) {
			for (const anchor of anchors(tokenize(field))) {
				const key = `${entry.rid}|${position}`;
				position++;
				const headword = JASTROW_REF.exec(anchor.dataRef)?.groups?.['headword'];
				if (headword !== undefined && headwords.has(headword)) {
					resolving.add(key);
				}
			}
		}
	}
	return resolving;
}

/** Two full pipeline passes, computed ONCE and shared by the three
 * assertions below. They are separate `it`s because they fail for
 * different reasons and the message should say which; they are one
 * walk because a pass over 32,512 entries through `applyRepairs` plus
 * the whole registry costs ~20s and none of the three needs its own. */
interface PipelineState {
	after: readonly SourceEntry[];
	before: readonly SourceEntry[];
	source: readonly SourceEntry[];
}

let cached: Promise<PipelineState> | null = null;

function state(): Promise<PipelineState> {
	cached ??= (async (): Promise<PipelineState> => {
		const source: SourceEntry[] = [];
		for await (const entry of readSourceEntries()) {
			source.push(entry);
		}
		const withoutPair = RULES.filter((rule) => !GERSHAYIM_RULES.has(rule.id));
		return {
			after: source.map((entry) => pipeline(entry, RULES)),
			before: source.map((entry) => pipeline(entry, withoutPair)),
			source,
		};
	})();
	return cached;
}

describe('the pipeline preserves and repairs link targets', () => {
	it('gains exactly 90 resolving targets and loses none', async () => {
		const { after, before, source } = await state();
		const was = resolvingTargets(before);
		const now = resolvingTargets(after);
		const gained = [...now].filter((key) => !was.has(key));
		const lost = [...was].filter((key) => !now.has(key));
		expect({
			entries: source.length,
			gained: gained.length,
			lost: lost.slice(0, 5),
			lostCount: lost.length,
		}).toEqual({ entries: 32_512, gained: 90, lost: [], lostCount: 0 });
	}, 180_000);

	it('leaves no escaped quote in the corpus, and one spelling per address', async () => {
		const { after } = await state();
		let entities = 0;
		let marks = 0;
		for (const entry of after) {
			for (const field of fieldsOf(entry)) {
				entities += field.split('&quot;').length - 1;
				marks += field.split(GERSHAYIM).length - 1;
			}
		}
		// The retired class-1 escape wrote 44 entities — 2 attributes on
		// each of 22 tags — across 21 entries that between them hold 23
		// damaged tags. Zero entities now, and the transform's 2,305
		// marks are what replaced them.
		expect({ entities, entries: after.length }).toEqual({
			entities: 0,
			entries: 32_512,
		});
		expect(marks).toBe(2305);
	}, 180_000);

	it('gives every repaired orphan refs item an in-body basis', async () => {
		const { after } = await state();
		const unresolved: string[] = [];
		for (const entry of after) {
			const expected = REPAIRED_ORPHAN_ITEMS[entry.rid];
			if (expected === undefined) {
				continue;
			}
			const seen = new Set(
				fieldsOf(entry).flatMap((field) =>
					anchors(tokenize(field)).map((anchor) => anchor.dataRef),
				),
			);
			unresolved.push(
				...expected
					.filter((item) => !seen.has(item))
					.map((item) => `${entry.rid}: ${item}`),
			);
		}
		// This is `migrate-dry`'s `unresolvedRepairedOrphans` recount,
		// asserted at test time. The 21 class-1 rids are gated here by the
		// TRANSFORM's output now that the escape is retired, so a
		// narrowed predicate re-orphans them loudly.
		expect(unresolved).toEqual([]);
	}, 180_000);
});
