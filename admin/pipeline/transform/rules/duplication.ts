/**
 * The two duplication rules (`docs/archive/transform-batch-7.md`
 * §3, §11), kept in one file because **their disjointness is the thing
 * that defines them** and it is easier to keep true side by side than
 * across two.
 *
 * - `duplicatedOpeningRun` repairs a definition whose opening run is
 *   repeated immediately, anchored at **offset 0**.
 * - `adjacentVerbatimRepeat` repairs a run ending in a period repeated
 *   immediately **anywhere else**.
 *
 * The catalogue states the boundary in prose — "Distinct from
 * `duplicated-definition-opening-run`, which is anchored at offset 0" —
 * and the disjointness that follows is POSITIONAL: no single run can be
 * claimed by both, because one matches only at offset 0 and the other
 * only away from it.
 *
 * It is NOT entry-level, and saying so would be false. At the shipping
 * thresholds the two populations share exactly one entry, `I00509`,
 * which holds an opening duplicate AND a later adjacent one; they take
 * different runs and compose to the same entry in either order. (An
 * earlier draft of this file claimed "0 entries", measured when the
 * opening rule was still at `k = 8`.)
 *
 * ## NEITHER RULE MAY CARRY A LENGTH CAP, and that is not a detail
 *
 * A first pass at both bounded the candidate run at 120 characters,
 * reasoning that a long duplicated run contains a short one. **It does
 * not.** The repeat is `run + run`, so a proper suffix of the first copy
 * is followed by the second copy's PREFIX, not by itself; only the FULL
 * run repeats immediately. A capped detector therefore does not report a
 * shorter run for a long member — it misses that member entirely.
 *
 * That cost `adjacent-verbatim-repetition` six members, and the cap
 * happened to reproduce the catalogued 59 exactly, so the agreement read
 * as confirmation when it was two caps matching. Uncapped the row is
 * **65**. `duplicated-definition-opening-run` lost four the same way.
 * Hence the Z-array below rather than a bounded scan.
 *
 * ## What they delete, and what that costs them
 *
 * Both run in `structural-repairs` and declare what they delete per
 * call through `removes`. The loss gate reads that declaration in
 * every phase, so it is what defends them wherever they run.
 *
 * The size was never the argument. An earlier version of this
 * note set their 6,128 RAW deleted codepoints against the baseline's
 * 4,510 (measured at the time; the retired check's final figure was 4,573)
 * and called it larger — comparing a raw figure to a stripped one. On the
 * baseline's own basis (`textOf`, tags stripped) these two delete **2,738**,
 * well under either figure. Both figures were pinned by
 * corpus checks retired.
 *
 * Both also REMOVE ANCHORS, because a duplicated run can contain one:
 * 26 of the 88 opening runs hold 30 anchors between them, and 9 of the
 * 65 adjacent runs hold 11. `unlinks` is the only thing standing
 * between that and a clean run — the markup-delta gate reads a dropped
 * tag pair as an improvement, and the text gate is a sub-multiset check
 * that reads a deletion as legitimate. Every run in both populations is
 * markup-BALANCED (measured: 0 unbalanced of 153), so the deletion never
 * severs a tag from its partner.
 */
import type { SourceEntry, SourceSense } from '../../body/types.ts';
import { stripTags } from '../no-new-text.ts';
import type { Rule, TransformRecord, TransformResult } from '../types.ts';

/** Minimum opening run. `k = 4` reproduces the
 * catalogued 85 entries exactly (88 occurrences), which is the only
 * evidence there is for what the round-3 detector did — the row records
 * no predicate. Uncapped the thresholds run 2 → 98 entries, 3 → 90,
 * **4 → 85**, 6 → 79, 8 → 64, 12 → 47. */
const MIN_OPENING = 4;

/** Minimum adjacent run, the row's own published figure. */
const MIN_ADJACENT = 8;

/** Z-array: `z[i]` is the length of the longest common prefix of `s`
 * and `s.slice(i)`. Linear, so the maximal square prefix below needs no
 * bound of any kind. */
function zArray(s: string): number[] {
	const z = new Array<number>(s.length).fill(0);
	let left = 0;
	let right = 0;
	for (let i = 1; i < s.length; i++) {
		if (i < right) {
			z[i] = Math.min(right - i, z[i - left] as number);
		}
		while (
			i + (z[i] as number) < s.length &&
			s[z[i] as number] === s[i + (z[i] as number)]
		) {
			z[i] = (z[i] as number) + 1;
		}
		if (i + (z[i] as number) > right) {
			left = i;
			right = i + (z[i] as number);
		}
	}
	return z;
}

/** The longest `k >= MIN_OPENING` with `s.slice(0, k) === s.slice(k, 2k)`,
 * or 0. `z[k] >= k` is exactly that condition. */
function squarePrefix(s: string): number {
	const z = zArray(s);
	for (let k = s.length >> 1; k >= MIN_OPENING; k--) {
		if ((z[k] as number) >= k) {
			return k;
		}
	}
	return 0;
}

/** The first adjacent repeat that ends in a period and does NOT start at
 * offset 0, longest run first. Offset 0 is `duplicatedOpeningRun`'s, and
 * excluding it here is what keeps the two populations disjoint.
 *
 * COST: O(periods × n²) per definition in the worst case, against the
 * O(n) `zArray` path the opening rule uses. That is acceptable today —
 * the corpus pass runs well inside its pinned timeout — but it is the
 * one place in this file where a longer corpus would be felt. The fix
 * is NOT a length cap, for the reason the module docstring gives; a
 * Z-array formulation would give the same answer in linear time. */
function adjacentRepeat(s: string): { at: number; run: string } | null {
	for (let i = 0; i < s.length; i++) {
		if (s[i] !== '.') {
			continue;
		}
		const maxRun = Math.min(i + 1, s.length - i - 1);
		for (let run = maxRun; run >= MIN_ADJACENT; run--) {
			const start = i - run + 1;
			if (start === 0) {
				continue;
			}
			if (s.startsWith(s.slice(start, i + 1), i + 1)) {
				return { at: i + 1, run: s.slice(start, i + 1) };
			}
		}
	}
	return null;
}

/** How many opening anchors a deleted run carries, for `unlinks`. */
function anchorsIn(run: string): number {
	return [...run.matchAll(/<a\b[^>]*>/giu)].length;
}

interface Deletion {
	removed: string;
	unlinks: number;
}

/** One rule's pass over an entry: what it deletes, what it records,
 * and the repair it applies. */
interface Pass {
	deletions: Deletion[];
	records: TransformRecord[];
	repair: (
		definition: string,
	) => { definition: string; removed: string } | null;
	rid: string;
	ruleId: string;
}

function repairSenses(
	senses: readonly SourceSense[],
	pass: Pass,
): SourceSense[] {
	const { repair, rid, ruleId } = pass;
	return senses.map((sense) => {
		const deepened =
			sense.senses === undefined
				? sense
				: {
						...sense,
						senses: repairSenses(sense.senses, pass),
					};
		if (deepened.definition === undefined) {
			return deepened;
		}
		const result = repair(deepened.definition);
		if (result === null) {
			return deepened;
		}
		pass.deletions.push({
			// STRIPPED, not raw. `checkNoLostText` compares
			// `textOf(entry)`, which is `fieldsOf(...).map(stripTags)`, so a
			// declaration carrying tag bytes does not occur in the input the
			// gate sees — it is refused, and every codepoint the rule
			// actually dropped is then reported unexplained. The composed
			// corpus run found this on `B01003`, whose duplicated run holds
			// a whole anchor.
			removed: stripTags(result.removed),
			unlinks: anchorsIn(result.removed),
		});
		pass.records.push({
			detail: `deleted a ${[...result.removed].length}-codepoint duplicate`,
			rid,
			ruleId,
		});
		return { ...deepened, definition: result.definition };
	});
}

/** Shared `apply`: both rules differ only in their `repair`. */
function applyDeletion(
	entry: SourceEntry,
	ruleId: string,
	repair: (
		definition: string,
	) => { definition: string; removed: string } | null,
): TransformResult {
	const out: Pass = {
		deletions: [],
		records: [],
		repair,
		rid: entry.rid,
		ruleId,
	};
	const senses = repairSenses(entry.content.senses, out);
	if (out.records.length === 0) {
		return { entry, records: out.records };
	}
	const unlinks = out.deletions.reduce((sum, d) => sum + d.unlinks, 0);
	return {
		entry: { ...entry, content: { ...entry.content, senses } },
		records: out.records,
		// One declared string per deletion. The gate credits `removes` as
		// ONE SHARED BUDGET, so a rule that deleted two
		// copies while declaring one still fails.
		removes: out.deletions.map((d) => d.removed),
		...(unlinks === 0 ? {} : { unlinks }),
	};
}

/**
 * A definition whose opening run is set twice over, cut back to one
 * copy — `squarePrefix`'s longest square prefix of at least
 * `MIN_OPENING` characters, anchored at offset 0. Runs in
 * `structural-repairs`.
 *
 * The deleted text goes out through `removes`, stripped of tags so
 * the loss gate can find it in the input it actually sees, and any
 * anchor that went with the run through `unlinks`. Both gates read a
 * deletion as an improvement on their own, so those declarations are
 * the only check that this rule dropped what it meant to.
 */
const duplicatedOpeningRun: Rule = {
	apply: (entry: SourceEntry): TransformResult =>
		applyDeletion(entry, 'duplicated-definition-opening-run', (definition) => {
			const k = squarePrefix(definition);
			if (k === 0) {
				return null;
			}
			return {
				definition: definition.slice(k),
				removed: definition.slice(0, k),
			};
		}),
	id: 'duplicated-definition-opening-run',
	phase: 'structural-repairs',
};

/**
 * A run ending in a period and repeated immediately, anywhere but
 * offset 0, cut back to one copy in `structural-repairs`. Offset 0 is
 * `duplicatedOpeningRun`'s, and excluding it here is the whole of the
 * two rules' disjointness.
 *
 * It declares its deletion the same way its sibling does, and for the
 * same reason.
 */
const adjacentVerbatimRepeat: Rule = {
	apply: (entry: SourceEntry): TransformResult =>
		applyDeletion(entry, 'adjacent-verbatim-repetition', (definition) => {
			const hit = adjacentRepeat(definition);
			if (hit === null) {
				return null;
			}
			return {
				definition:
					definition.slice(0, hit.at) +
					definition.slice(hit.at + hit.run.length),
				removed: hit.run,
			};
		}),
	id: 'adjacent-verbatim-repetition',
	phase: 'structural-repairs',
};

export {
	adjacentVerbatimRepeat,
	duplicatedOpeningRun,
	MIN_ADJACENT,
	MIN_OPENING,
	squarePrefix,
};
