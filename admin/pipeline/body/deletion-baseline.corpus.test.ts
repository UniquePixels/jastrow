import { expect, it } from 'bun:test';
import { textOf } from '../transform/no-new-text.ts';
import { RULES } from '../transform/registry.ts';
import { repairedEntries } from '../transform/rules/corpus-fixture.ts';

/**
 * What the loss gate does NOT cover, pinned (batch-6b spec
 * `docs/specs/2026-08-28-structural-repairs-design.md` §2.3).
 *
 * `no-lost-text.ts` runs for `structural-repairs` rules only. The
 * reason is here: **12 of the rules in `RULES` delete text**, 4,523
 * codepoints between them over the 32,512 entries, and turning the
 * gate on globally would mean retrofitting a `removes` declaration
 * onto ten shipped rules in the PR that introduced the gate. (Ten
 * before this batch; the eleventh is batch 6b's own, and it declares.)
 *
 * Most of that is substitution the multiset reads as a deletion plus
 * an addition — `"` → `״` alone is 2,125 — and the rest is
 * deliberate: parentheses a row exists to strip, redundant spaces, a
 * damaged tag's own bytes.
 *
 * So this file states the boundary instead of implying coverage, the
 * doctrine `link-target.ts`'s blind-spot list established. A THIRTEENTH
 * deleting rule, or an existing one deleting more, fails here — with
 * the rule's name and both counts — rather than passing unremarked
 * because no gate was watching.
 *
 * Composed in registry order over the text-repaired corpus, which is
 * how the rules actually run. A rule's figure is therefore its
 * deletion GIVEN everything before it, not in isolation.
 */

/** Rule id → [entries it deleted text in, codepoints deleted]. */
const BASELINE: [string, number, number][] = [
	['ascii-quote-as-gershayim-in-body', 1386, 2125],
	['parenthesized-alt-headword', 579, 1152],
	['em-dash-section-break-in-own-italic', 270, 508],
	['phrase-alt-headword-stub', 228, 236],
	['emphasis-run-edge-space', 214, 229],
	['gender-pair-headword-line-collapse', 22, 196],
	['shuruk-as-yod-display-corruption', 12, 12],
	['trailing-whitespace-definition', 10, 10],
	['abbrev-fused-headword', 4, 4],
	['unterminated-href-swallows-closing-tag', 1, 32],
	// THE ELEVENTH, and it is this batch's own. `asteriskStemStrayPeriod`
	// drops ` .` from three stem labels; it DECLARES that through
	// `removes`, and nothing reads the declaration, because the gate is
	// scoped to the other phase. It appears here for exactly the reason
	// this file exists — a new deleting rule should have to be written
	// down, including by the batch that adds the gate.
	['asterisk-stem-label', 3, 6],
	// THE TWELFTH, batch 10's. `impossibleDagesh` DELETES NOTHING a
	// reader would call deleted: it swaps ר for ד and ח for ה, and a
	// codepoint multiset reads a substitution as one deletion plus one
	// addition. 13 swaps across 12 entries, so 13 codepoints.
	//
	// Its three batch-10 siblings are absent from this list and that is
	// worth as much as its presence. `holamMaterMigration` MOVES a mark,
	// so the multiset is identical on both sides — this file is the
	// independent confirmation of the claim its own module doc makes —
	// and `shinSinDotRestore` and `vkhGereshRestore` only ever add.
	['impossible-dagesh', 12, 13],
];

interface Tally {
	chars: number;
	entries: number;
}

/** Codepoint → count, the same basis `no-lost-text.ts` compares on. */
function multiset(text: string): Map<string, number> {
	const counts = new Map<string, number>();
	for (const ch of text) {
		counts.set(ch, (counts.get(ch) ?? 0) + 1);
	}
	return counts;
}

/** How many codepoints `before` holds that `after` does not. */
function lostCount(before: string, after: string): number {
	const remaining = multiset(after);
	let total = 0;
	for (const [ch, n] of multiset(before)) {
		total += Math.max(0, n - (remaining.get(ch) ?? 0));
	}
	return total;
}

/** One composed pass over the corpus, tallying per rule how much text
 * it deleted GIVEN everything before it — which is how the rules run,
 * and not what measuring each in isolation would report. */
async function build(): Promise<Map<string, Tally>> {
	const report = new Map<string, Tally>();
	// `repairedEntries()` is `applyRepairs` over the whole snapshot, built
	// once for the run. This walk needs the intermediate entry after EACH
	// rule, so it cannot share `composedEntries()` — but it has no reason
	// to repeat the repair pass that precedes them.
	for (const repaired of await repairedEntries()) {
		let entry = repaired;
		let text = textOf(entry);
		for (const rule of RULES) {
			if (rule.phase !== 'text-repairs') {
				continue;
			}
			const result = rule.apply(entry);
			// Identity means the rule declined; skipping the comparison
			// keeps this pass a few minutes rather than an hour, since
			// most rules decline on most entries.
			if (result.entry === entry) {
				continue;
			}
			const after = textOf(result.entry);
			const lost = lostCount(text, after);
			if (lost > 0) {
				const tally = report.get(rule.id) ?? { chars: 0, entries: 0 };
				tally.chars += lost;
				tally.entries++;
				report.set(rule.id, tally);
			}
			entry = result.entry;
			text = after;
		}
	}
	return report;
}

let pending: Promise<Map<string, Tally>> | undefined;
/** Memoised so the pass runs once per process. */
const measured = (): Promise<Map<string, Tally>> => {
	pending ??= build();
	return pending;
};

it('finds exactly the twelve text-repairs rules that delete text', async () => {
	const report = await measured();
	expect([...report.keys()].sort()).toEqual(BASELINE.map(([id]) => id).sort());
}, 900_000);

it('holds each of them at its measured deletion', async () => {
	const report = await measured();
	const actual = BASELINE.map(([id]) => {
		const tally = report.get(id);
		return [id, tally?.entries ?? 0, tally?.chars ?? 0];
	});
	expect(actual).toEqual(BASELINE);
});

// The number the spec quotes, asserted rather than left as prose.
it('totals 4,523 deleted codepoints', async () => {
	const report = await measured();
	let total = 0;
	for (const tally of report.values()) {
		total += tally.chars;
	}
	expect(total).toBe(4523);
});
