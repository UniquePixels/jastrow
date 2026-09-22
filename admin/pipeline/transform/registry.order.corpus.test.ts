// biome-ignore-all lint/style/noExcessiveLinesPerFile: a table-driven suite; the cases and the fixtures they share read as one unit.
/**
 * Registry order's classes, EARNED over the corpus.
 *
 * `registry.order.test.ts` asserts the order the classes in
 * `registry-classes.ts` imply. This file is the other half: one pass
 * over all 32,512 entries records what every rule actually declares
 * and moves, and requires each class to be exactly the rules that
 * behave that way. A rule in the wrong class would let an ordering
 * assertion pass while saying nothing about it.
 *
 * It reads the source data, so it is not CI work (consolidation spec
 * R9). Run it with `bun run transform:invariants` before a PR that
 * registers, reclassifies or reorders a rule.
 */
import { describe, expect, it } from 'bun:test';
import type { SourceEntry } from '../body/types.ts';
import { tokenize } from './html.ts';
import { anchors } from './links.ts';
import { fieldsOf, textOf } from './no-new-text.ts';
import { RULES } from './registry.ts';
import {
	CORROBORATE,
	FIELD,
	GLYPH,
	NEITHER,
	POINT,
	RESTORE,
	rtlSpanCoverageOf,
	UNLINK,
	VOUCH,
	WRAP,
} from './registry-classes.ts';
import { composedEntries, sourceEntries } from './rules/corpus-fixture.ts';
import { applyTransforms } from './run.ts';

/**
 * The classification in `registry-classes.ts`, EARNED over the corpus
 * rather than declared in a docstring — the review's question about
 * the two "rule 1 says nothing" buckets (`NEITHER` and `GLYPH`).
 *
 * One pass, shared by the three tests below, recording what each rule
 * ever declares to the gates and whether any `NEITHER` rule ever moves
 * an anchor's target.
 *
 * Behind a lazily-awaited cached promise, on `body/pipeline-links.
 * test.ts`'s shape, rather than at module scope. Module evaluation is
 * covered by NO test timeout, so a slow corpus there fails the suite
 * with nothing naming the cause; and the cost — 32,512 entries times
 * every rule — is paid on every import of this file. Consolidation
 * step 5 moved the cheap registry-order tests out to
 * `registry.order.test.ts` entirely, so a filtered run of those no
 * longer touches this file at all; the laziness now matters for this
 * file's own non-scanning tests — the cross-phase unlink check and the
 * FIELD-markup check — which still need none of it.
 *
 * WHAT THIS CAN AND CANNOT EARN, measured rather than assumed.
 * Declarations earn `UNLINK`, `GLYPH` and `RESTORE` in both
 * directions, because a rule that removes an anchor MUST declare
 * `unlinks`, a rule that writes a target by glyph substitution MUST
 * declare `glyphCorrected`, and a rule that restores one out of a
 * damaged tag MUST declare `restored` — `run.ts`'s gates fail
 * otherwise. They cannot earn `RETARGET`:
 * gate case 2 admits a target COPIED VERBATIM from another anchor in
 * the same entry with no declaration at all, and `ib-yoma-2a` is the
 * live proof — it retargets 188 entries and declares nothing corpus-
 * wide. So `NEITHER`'s "writes no target" half is earned the other
 * way, by walking every anchor's parsed `href` and `data-ref` before
 * and after and requiring them identical.
 */
const DECLARED = new Map<string, Set<string>>(
	RULES.map((rule) => [rule.id, new Set<string>()]),
);
const MOVED_A_TARGET = new Set<string>();
const MOVED_A_WRAPPER = new Set<string>();
const MOVED_TEXT = new Set<string>();

/** Every anchor's parsed target pair, in walk order. */
function targetsOf(entry: SourceEntry): string {
	return JSON.stringify(
		fieldsOf(entry).flatMap((field) =>
			anchors(tokenize(field)).map((anchor) => [anchor.href, anchor.dataRef]),
		),
	);
}

let scanned: Promise<void> | null = null;

/** The corpus pass itself, run once however many tests await it. */
function scan(): Promise<void> {
	// biome-ignore lint/complexity/noExcessiveCognitiveComplexity: the branching is the test matrix itself; extracting it would hide which case is being asserted.
	scanned ??= (async (): Promise<void> => {
		for (const source of await sourceEntries()) {
			const before = targetsOf(source);
			const coverage = rtlSpanCoverageOf(source);
			const text = textOf(source);
			for (const rule of RULES) {
				const out = rule.apply(source);
				if (out.entry !== source) {
					if (rtlSpanCoverageOf(out.entry) !== coverage) {
						MOVED_A_WRAPPER.add(rule.id);
					}
					if (textOf(out.entry) !== text) {
						MOVED_TEXT.add(rule.id);
					}
				}
				const kinds = DECLARED.get(rule.id) as Set<string>;
				if ((out.unlinks ?? 0) > 0) {
					kinds.add('unlinks');
				}
				if ((out.composed ?? []).length > 0) {
					kinds.add('composed');
				}
				if ((out.recombined ?? []).length > 0) {
					kinds.add('recombined');
				}
				if ((out.glyphCorrected ?? []).length > 0) {
					kinds.add('glyphCorrected');
				}
				if ((out.restored ?? []).length > 0) {
					kinds.add('restored');
				}
				if ((out.corroborated ?? []).length > 0) {
					kinds.add('corroborated');
				}
				if ((out.vouched ?? []).length > 0) {
					kinds.add('vouched');
				}
				if ((out.pointed ?? []).length > 0) {
					kinds.add('pointed');
				}
				if (
					(NEITHER.has(rule.id) || WRAP.has(rule.id)) &&
					targetsOf(out.entry) !== before
				) {
					MOVED_A_TARGET.add(rule.id);
				}
			}
		}
	})();
	return scanned;
}

/** Explicit rather than `toSorted()`'s implicit UTF-16 order
 * (`typescript:S2871`), and the SAME comparator on both sides of every
 * comparison below — two orderings would make an equal pair of sets
 * read as unequal. */
const byId = (a: string, b: string): number => a.localeCompare(b);

/** Rules that ever declared `kind` over the whole corpus, sorted. */
function everDeclared(kind: string): string[] {
	return [...DECLARED]
		.filter(([, kinds]) => kinds.has(kind))
		.map(([id]) => id)
		.toSorted(byId);
}

// biome-ignore lint/complexity/noExcessiveLinesPerFunction: one suite per behaviour; its cases share setup and read as a single table.
describe('the classification is earned, not declared', () => {
	it('exactly the UNLINK rules ever remove an anchor', async () => {
		await scan();
		expect(everDeclared('unlinks')).toEqual([...UNLINK].toSorted(byId));
		// 360 s: the file may be first in its shard and pay the fixture
		// cold start (~110 s on CI) plus its own tables.
	}, 360_000);

	// WHAT EARNS THE CROSS-PHASE SKIP IN RULES 1 AND 4. Those two
	// assertions can no longer compare a structural unlink rule against
	// a text-phase reader, because index is not execution order across
	// phases — so the guarantee has to come from somewhere, and the
	// phase name is not a guarantee.
	//
	// Rule 1's hazard is a retarget adopting a target off an anchor that
	// an unlink will later DELETE. Batch 7's two duplication rules
	// remove an anchor from a run that is a verbatim DUPLICATE, so the
	// twin carrying the same target survives in the same entry and the
	// antecedent does not go away. Measured over all 32,512 entries,
	// every anchor they remove leaves a surviving copy of its
	// `data-ref`: measured ALONE, 30 of 30 for the opening rule and
	// 11 of 11 for the adjacent one; measured COMPOSED, 42 of 42.
	// 0 fully orphaned in either reading.
	//
	// THE TOTAL IS 42 HERE, NOT THE 30 + 11 = 41 the retired
	// corpus-tier count reported — a measurement, not a surviving test
	// of `duplication.test.ts`, retired in step 5 and listed in
	// `docs/v2/retired-corpus-checks.md` — and the difference is the
	// composition. That measurement covered each rule alone on the entry after
	// `text-repairs`; this one measures after the preceding
	// `structural-repairs` rules, where `strandedStemHead` exposes the
	// duplicate at `R00223` and `duplicatedOpeningRun` repairs 89 rather
	// than 88. The 89th run carries one anchor. 30 + 1 + 11 = 42.
	//
	// Asserted here rather than argued in a comment, because an argument
	// would keep passing after a re-fetch changed the corpus.
	// biome-ignore lint/complexity/noExcessiveCognitiveComplexity: the branching is the test matrix itself; extracting it would hide which case is being asserted.
	// biome-ignore lint/complexity/noExcessiveLinesPerFunction: one suite per behaviour; its cases share setup and read as a single table.
	it('the cross-phase unlink rules orphan no target', async () => {
		// Named apart from the file's own `targetsOf`, which returns a
		// JSON signature of href/data-ref PAIRS for the classification
		// scan. This one needs the bare `data-ref` list, because the
		// question here is multiset survival of one target, not whether an
		// anchor's pair changed.
		const refsOf = (subject: SourceEntry): string[] =>
			fieldsOf(subject).flatMap((field) =>
				anchors(tokenize(field))
					.map((anchor) => anchor.dataRef)
					.filter((ref): ref is string => ref !== undefined && ref !== ''),
			);
		const structural = RULES.filter(
			(rule) => UNLINK.has(rule.id) && rule.phase === 'structural-repairs',
		);
		expect(structural).toHaveLength(2);
		const orphaned: string[] = [];
		let removed = 0;
		// THE STATE THE RULES ACTUALLY RECEIVE, not the state before the
		// phase. A first version stopped after `text-repairs`, which
		// measured 88 of `duplicatedOpeningRun`'s repairs and missed the
		// 89th — the one `strandedStemHead` EXPOSES at `R00223`, whose
		// run carries an anchor. The claim below says "over all 32,512
		// entries", so it has to be measured where the rules stand or it
		// is a claim with a hole exactly at this batch's own new
		// dependency.
		const earlier = RULES.slice(
			0,
			RULES.findIndex(
				(rule) => rule.id === 'duplicated-definition-opening-run',
			),
		).filter((rule) => rule.phase === 'structural-repairs');
		// `composedEntries()` IS `applyTransforms(applyRepairs(source).entry,
		// 'text-repairs')` over the whole corpus — the stage this walk used
		// to rebuild for itself. Sharing it costs nothing here and saves the
		// pass; the numbers below are unchanged by the substitution.
		for (const source of await composedEntries()) {
			const input = applyTransforms(
				source,
				'structural-repairs',
				earlier,
			).entry;
			for (const rule of structural) {
				const result = rule.apply(input);
				if (result.records.length === 0) {
					continue;
				}
				const before = refsOf(input);
				const after = refsOf(result.entry);
				for (const target of new Set(before)) {
					const lost =
						before.filter((t) => t === target).length -
						after.filter((t) => t === target).length;
					if (lost <= 0) {
						continue;
					}
					removed += lost;
					if (!after.includes(target)) {
						orphaned.push(`${source.rid} ${rule.id} ${target}`);
					}
				}
			}
		}
		expect(orphaned).toEqual([]);
		expect(removed).toBe(42);
	}, 300_000);

	it('exactly the GLYPH rules ever correct a target in place', async () => {
		await scan();
		expect(everDeclared('glyphCorrected')).toEqual([...GLYPH].toSorted(byId));
	}, 180_000);

	// `RESTORE` earned on `GLYPH`'s mechanism: gate case 6 licenses a
	// target only against a `restored` declaration, so a rule that
	// restores one and does not declare it is refused by `run.ts` rather
	// than quietly classified here. Both directions, like `GLYPH`: a
	// rule declaring `restored` and missing from this set fails, and a
	// name in this set that never declares one fails too.
	it('exactly the RESTORE rules ever restore a target from damaged bytes', async () => {
		await scan();
		expect(everDeclared('restored')).toEqual([...RESTORE].toSorted(byId));
	}, 180_000);

	// `CORROBORATE` earned on the same mechanism as `GLYPH` and
	// `RESTORE`: gate case 7 licenses a minted target only against a
	// `corroborated` declaration, so a rule that mints one and does not
	// declare it is refused by `run.ts` rather than quietly classified
	// here. Both directions — a rule declaring `corroborated` and
	// missing from this set fails, and a name in this set that never
	// declares one fails too.
	//
	// This is the assertion that keeps case 7's "live exposure is zero"
	// claim honest. That claim rests on exactly one rule declaring the
	// case; a second one appearing corpus-wide fails HERE, and whoever
	// added it has to come and read why the count mattered.
	//
	// Since 2026-08-27 it is no longer the only thing that fails. The
	// gate itself refuses a `corroborated` claim from any rule not on
	// `CORROBORATION_DECLARERS` (link-target.ts), so a second declarer
	// throws in `run.ts` before this set is ever compared — this
	// assertion now names the drift, and the allowlist stops it.
	it('exactly the CORROBORATE rules ever mint a corroborated target', async () => {
		await scan();
		expect(everDeclared('corroborated')).toEqual(
			[...CORROBORATE].toSorted(byId),
		);
	}, 180_000);

	// `VOUCH` earned on the same mechanism, and carrying the same job as
	// the `CORROBORATE` assertion above: case 8's residue-zero claim
	// rests on exactly one rule declaring the case, and a second one
	// appearing corpus-wide fails HERE. `VOUCH_DECLARERS`
	// (link-target.ts) throws in `run.ts` before this set is compared,
	// so this assertion names the drift and the allowlist stops it.
	it('exactly the VOUCH rules ever vouch a target from another entry', async () => {
		await scan();
		expect(everDeclared('vouched')).toEqual([...VOUCH].toSorted(byId));
	}, 180_000);

	// `POINT` earned on the same mechanism as the four above it. Case 9's
	// residue claim — one reachable pair on the move arm, zero on the add
	// arm — is a claim about the rules that declare it, so a third rule
	// declaring `pointed` corpus-wide fails HERE. `POINT_DECLARERS`
	// (link-target.ts) throws in `run.ts` before this set is compared, so
	// this assertion names the drift and the allowlist stops it.
	it('exactly the POINT rules ever repair a target’s pointing', async () => {
		await scan();
		expect(everDeclared('pointed')).toEqual([...POINT].toSorted(byId));
	}, 180_000);

	it('no NEITHER or WRAP rule removes an anchor or moves a target', async () => {
		await scan();
		expect([...MOVED_A_TARGET]).toEqual([]);
		expect(
			[...NEITHER, ...WRAP].filter((id) => (DECLARED.get(id)?.size ?? 0) > 0),
		).toEqual([]);
	}, 180_000);

	// `WRAP` earned, and the reason rule 4's second side is a set. The
	// conjunction is the rtl module's own claim about itself: it moves
	// wrappers (a) and leaves the text bytes alone (b). Measured:
	// `geresh-abbrev-space-loss` satisfies (a) alone — its inserted
	// space sometimes lands inside an rtl span — and is excluded by
	// (b); every unlink rule satisfies (b) alone and is excluded by
	// (a), because anchor-borne `dir="rtl"` is not counted.
	//
	// A fourth rtl wrap rule therefore cannot ship quietly: it fails
	// HERE until it is added to `WRAP`, and adding it to `WRAP` puts it
	// under rule 4. That is the hole the first draft of rule 4 left,
	// which wrote the wrap side as three hardcoded ids.
	it('exactly the WRAP rules ever move an rtl wrapper', async () => {
		await scan();
		const moversOnly = [...MOVED_A_WRAPPER]
			.filter((id) => !MOVED_TEXT.has(id))
			.toSorted(byId);
		expect(moversOnly).toEqual([...WRAP].toSorted(byId));
	}, 180_000);

	/**
	 * `FIELD` earned. Its exemption from every anchor question rests on
	 * one claim — that the fields these rules edit never carry markup —
	 * and this is that claim rather than a restatement of it.
	 *
	 * The walk compares `headword` and `alt_headwords` before and after
	 * each `FIELD` rule and asserts that no value on EITHER side ever
	 * contains a `<`. Both sides matter: an input containing one would
	 * mean the class's premise is false about the corpus, and an output
	 * containing one would mean a rule had introduced markup into a
	 * field that holds none.
	 *
	 * A future member that edited a definition fails here rather than
	 * inheriting the exemption, which is the hole a hardcoded set would
	 * have left.
	 */
	it('no FIELD rule reads or writes a field carrying markup', async () => {
		const rules = RULES.filter((rule) => FIELD.has(rule.id));
		expect(rules).toHaveLength(FIELD.size);
		let checked = 0;
		for (const source of await sourceEntries()) {
			for (const rule of rules) {
				const after = rule.apply(source).entry;
				for (const value of [
					source.headword,
					after.headword,
					...(source.alt_headwords ?? []),
					...(after.alt_headwords ?? []),
				]) {
					expect(value.includes('<')).toBe(false);
					checked += 1;
				}
			}
		}
		expect(checked).toBeGreaterThan(32_512 * FIELD.size);
		// 360 s: the file may be first in its shard and pay the fixture
		// cold start (~110 s on CI) plus its own tables.
	}, 360_000);
});
