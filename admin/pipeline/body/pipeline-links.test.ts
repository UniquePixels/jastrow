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
 * What this DOES and does NOT cover, stated rather than implied,
 * because overclaiming a gate is the same error class as the one above.
 * The gained/lost arms are DIFFERENTIAL: both run `applyRepairs` and
 * every non-gershayim rule, so a change elsewhere in either layer
 * appears on both sides and CANCELS. What the differential catches is
 * anything that interferes with the withheld pair — another layer
 * consuming its population, moving its targets, or moving the headwords
 * its targets point at. That is exactly the collision above, and it is
 * a narrow window.
 *
 * The ABSOLUTE pin below is what widens it: `after` must hold exactly
 * 71,385 resolving Jastrow targets. Any change in any layer that moves
 * the corpus-wide total fails there instead, at no extra runtime. A new
 * unlink rule will move it legitimately — update the number WITH the
 * measurement that justifies it, never to make a red test green.
 *
 * MOVED 2026-08-26 (batch 4), 72,593 -> 71,383, and this is that
 * clause being used for the first time. Batch 4 registered two unlink
 * rules — `nonsense-dup-anchor` and
 * `nested-anchor-swallows-punctuation` — which drop the OUTER layer of
 * a doubled anchor whose two layers share one target. Measured on the
 * pipeline, withholding those two rules and nothing else:
 *
 *   anchors corpus-wide            169,285 -> 168,055   (-1,230)
 *   resolving Jastrow targets       72,593 ->  71,383   (-1,210)
 *   DISTINCT (rid, data-ref) pairs 160,239 -> 160,239   (       0)
 *
 * MOVED AGAIN 2026-08-27 (fix/link-target-gate-cases), 71,383 ->
 * 71,385, and this time UPWARD: registering `unterminatedHref` — held
 * back through batch 4 because `checkLinkTargets` refused D00478, now
 * licensed by the gate's case 6 — recovers the two cross-references an
 * unterminated `href` had swallowed. Measured the same way, withholding
 * that one rule and nothing else:
 *
 *   anchors corpus-wide            168,055 -> 168,055   (       0)
 *   resolving Jastrow targets       71,385 ->  71,383   (      -2)
 *   DISTINCT (rid, data-ref) pairs 160,238 -> 160,239   (      +1)
 *
 * The third line reads BACKWARDS here and says exactly what it should.
 * The pairs LOST by registering the rule are `D00478 ""` and
 * `J00597 ""` — the empty `data-ref` a damaged tag parses to, which is
 * the defect and not an address — and the one GAINED is
 * `D00478 "Jastrow, כָּלוּל 1"`. J00597's recovered address adds no
 * distinct pair because its intact twin already carried it, which is
 * the same witness the repair reads. So: 2 addresses restored, 2
 * non-addresses retired, 0 lost.
 *
 * The batch-4 third line is the one that says nothing was lost: every removed
 * layer duplicated a target its inner twin still carries, so not one
 * address left the corpus. The 20 removals that were not resolving
 * Jastrow targets are the `jt-double-wrapped-citation` pairs — 2 each
 * across the 10 rids the catalogue names — which is that row's
 * population re-derived here, from the pipeline, by subtraction.
 *
 * Batch 4's other four rules move NO anchor and NO target: withholding
 * all six gives the same 72,593 as withholding the unlink pair alone.
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
 * — resolves 1,131 anchors, across 288 distinct addresses, to a
 * DIFFERENT headword than the greedy read does. See `transform/rules/gershayim.test.ts` and
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
 * the whole registry is expensive and none of the three needs its own.
 *
 * MEASURED 2026-08-27 on an arm64 macOS dev machine under Bun 1.3.14,
 * against a 34-rule registry: ~48s per pass, so the corpus read plus
 * both passes puts this whole file at ~100s locally. The FIRST `it`
 * bears all of it — the other two await a resolved promise. CI runs
 * this roughly 2× slower (the first `it` was observed at 187s there),
 * which is why the timeout below is 600s and not a round 2× of the
 * local figure. Re-measure this number when rules are added: a stale
 * cost estimate here is what set the old timeout too low. */
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
		// Absolute, not differential — see the module docstring. Measured
		// on this tree; `before` is 71,295. Both figures moved by the
		// same 1,210 when batch 4's two unlink rules registered, and by
		// the same 2 when `unterminatedHref` registered on 2026-08-27
		// (`unterminatedHref` runs in BOTH passes here, so its gain lands
		// on both sides and cancels out of the differential above — which
		// is exactly why the absolute pin exists). The docstring carries
		// both measurements.
		expect(now.size).toBe(71_385);
	}, 600_000);

	it('leaves no escaped quote in the corpus, and one spelling per address', async () => {
		const { after, source } = await state();
		let entities = 0;
		let marks = 0;
		let sourceMarks = 0;
		for (const entry of source) {
			for (const field of fieldsOf(entry)) {
				sourceMarks += field.split(GERSHAYIM).length - 1;
			}
		}
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
		// `marks` counts EVERY gershayim in the output, so pinning it to
		// the batch's 2,305 writes is only a statement about this batch
		// while the source contributes none of its own. That assumption
		// is asserted rather than left in a comment: a re-fetch carrying
		// a real gershayim would otherwise fail the line below with no
		// hint that the corpus, not the transform, had moved.
		expect(sourceMarks).toBe(0);
		expect(marks).toBe(2305);
	}, 600_000);

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
	}, 600_000);
});
