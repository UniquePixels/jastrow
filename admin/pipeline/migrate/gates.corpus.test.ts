/**
 * Corpus tier — every migration gate at 32,512, pinned.
 *
 * This file runs the same two passes `admin/pipeline/migrate.ts` runs,
 * over the same corpus, and pins each gate's tally. It does NOT import
 * `migrate.ts`: that module owns `--write`, `process.argv` and two file
 * writes, and a test has no business near any of them. What it shares
 * instead is the corpus fixture's memo — `composedEntries()` is the
 * `text-repairs` output every other `*.corpus.test.ts` already paid
 * for — and then finishes the job the way `body/compose.ts` does:
 * `structural-repairs`, the accepted patches, then the carry-over set.
 *
 * The numbers below were MEASURED by the first full dry run
 * (2026-09-07, branch feat/migrate-stages). Three of them are not round
 * because the gate they belong to counts something finer than entries:
 *
 *   headwordRoundTrip  counts FORMS (each headword, each alt, plus one
 *                      alt-count mark per entry)
 *   textConservation   counts FIELDS (every gloss, unit, and structural
 *                      length mark, at every depth)
 *   composition        counts MARKS (two per entry: the patch problems
 *                      from `patch-apply`, and the finishing problems
 *                      from `finishEntry`)
 *
 * Re-pin only WITH the measurement that justifies the move.
 */
import { expect, it } from 'bun:test';
import Ajv2020 from 'ajv/dist/2020';
import { buildTrace } from '../body/dry-run.ts';
import { evaluateRoundTrip } from '../body/dry-run-verify.ts';
import type { BodyEntry, SourceEntry } from '../body/types.ts';
import {
	type ApplyProblem,
	applyCarryOver,
	applyEntryPatches,
	loadAcceptedCorpus,
	patchesByRid,
} from '../patch/apply.ts';
import type { SemanticPatch } from '../patch/schema.ts';
import entrySchema from '../schema/entry.schema.json' with { type: 'json' };
import {
	composedEntries,
	sourceEntries,
} from '../transform/rules/corpus-fixture.ts';
import { applyTransforms } from '../transform/run.ts';
import { buildHeadwordMap, type Unresolved } from './cite.ts';
import { finishEntry } from './finish.ts';
import {
	checkChain,
	checkHeadwordRoundTrip,
	checkPages,
	checkSlugs,
	checkTextConservation,
	mark,
	tally,
} from './gates.ts';
import { decomposeForm } from './headword.ts';
import { loadPageIndex } from './page.ts';
import { assignSlugs, slugStem } from './slug.ts';
import type { Tally } from './types.ts';

const ENTRIES = 32_512;
/** Forms: 32,512 headwords + 32,512 alt-count marks + 11,080 alts. */
const HEADWORD_FORMS = 76_104;
/** Fields and structural length marks, at every sense depth. */
const TEXT_FIELDS = 186_736;
/** 32,512 entries + the head-uniqueness mark + the termination mark. */
const CHAIN_MARKS = 32_514;
/** Two marks per entry: patch problems, then finishing problems. */
const COMPOSITION_MARKS = 65_024;

/**
 * Gate 9's five red marks, 2026-09-07, and the reason they are named
 * here rather than tolerated as a count.
 *
 * Every one is a `translateMarkup` complaint that a body FIELD is not
 * balanced HTML — an open tag with no close, or a close with no open.
 * They fall into two classes, and neither is a defect in any module
 * this task wrote:
 *
 *   A tag run CROSSING A BODY-MODEL SPLIT — C00869, H01022, S02102
 *     (`<i>`) and J00603 (`<a>`). Raw-source tag counts for all four
 *     are balanced (measured: i 15/15, 10/10, 23/23; a 12/12). The
 *     split is `buildTrace`'s: a form-section marker (`Part. pass.`,
 *     `Pl.`) or a unit boundary falls INSIDE an italic or anchor run,
 *     so the open lands in one field and the close in the next. Gate 1
 *     passes because the rejoin is byte-exact, and gate 3 passes
 *     because tag-stripped text is unchanged — the tag seam is exactly
 *     what neither gate can see.
 *
 *   B GENUINELY UNBALANCED SOURCE — J00597 alone: 35 `<a` opens
 *     against 34 `</a>` closes in the snapshot itself. A Sefaria-side
 *     defect; research-track work (a transform rule or a patch), not
 *     migration's.
 *
 * Pinned as an exact rid list, not as `failures.length === 5`: a sixth
 * entry joining the set, or one of these being fixed, must fail HERE
 * and be read, rather than sliding under a tolerance. `migrate.ts`
 * itself is unmoved — gate 9 is red, `isGreen` is false, and `--write`
 * is refused until the list is empty.
 */
const COMPOSITION_RED = ['C00869', 'H01022', 'J00597', 'J00603', 'S02102'];

/** Unresolved internal `<cite ref>` targets — gate 6's input. Task 13
 * seeds the quarantine list from exactly this set, so gate 6 itself is
 * NOT asserted here. */
const UNRESOLVED = 25;
/** Page rows the hOCR alignment did not place with high confidence:
 * 1,893 medium + 298 low. Informational; gate 8 only requires a row. */
const NON_HIGH_PAGES = 2191;
/** Stems more than one headword slugs to — the members of every
 * numbered slug family. 4,407 of 25,293 stems collide. */
const COLLIDING_STEMS = 4407;

interface Composed {
	body: BodyEntry;
	entry: SourceEntry;
}

interface Gates {
	bodyRoundTrips: Tally;
	chain: Tally;
	composition: Tally;
	headwordRoundTrip: Tally;
	nonHighPages: string[];
	pages: Tally;
	schema: Tally;
	slugs: Tally;
	textConservation: Tally;
	unresolved: Unresolved[];
}

/** `body/compose.ts`'s patch-apply phase, over a rid's two groups: the
 * accepted patches first, then its carry-over set (Ruling F). Returns
 * the patched entry and every problem either half reported. */
function applyPatchPhase(
	entry: SourceEntry,
	accepted: readonly SemanticPatch[] | undefined,
	carry: readonly SemanticPatch[] | undefined,
): { entry: SourceEntry; problems: ApplyProblem[] } {
	const first =
		accepted === undefined
			? { entry, problems: [] as ApplyProblem[] }
			: applyEntryPatches(entry, accepted);
	if (carry === undefined) {
		return first;
	}
	const second = applyCarryOver(first.entry, carry);
	return {
		entry: second.entry,
		problems: [...first.problems, ...second.problems],
	};
}

it('pins every migration gate at corpus scale', async () => {
	const corpus = await loadAcceptedCorpus();
	const acceptedByRid = patchesByRid(corpus.patches);
	const carryByRid = patchesByRid(corpus.carryOver);
	const gates: Gates = {
		bodyRoundTrips: tally(),
		chain: tally(),
		composition: tally(),
		headwordRoundTrip: tally(),
		nonHighPages: [],
		pages: tally(),
		schema: tally(),
		slugs: tally(),
		textConservation: tally(),
		unresolved: [],
	};

	// Pass 1: structural repairs, patches, body trace, gate 1.
	const composed: Composed[] = [];
	for (const healed of await composedEntries()) {
		const structural = applyTransforms(healed, 'structural-repairs').entry;
		const applied = applyPatchPhase(
			structural,
			acceptedByRid.get(structural.rid),
			carryByRid.get(structural.rid),
		);
		mark(
			gates.composition,
			applied.problems.length === 0,
			`${structural.rid}: patch problems`,
		);
		const trace = buildTrace(applied.entry);
		const rt = evaluateRoundTrip(applied.entry, trace);
		mark(
			gates.bodyRoundTrips,
			rt.rejoin && rt.units && rt.lettered && rt.formSection,
			`${structural.rid}: body round-trip`,
		);
		composed.push({ body: trace.body, entry: applied.entry });
	}

	// Corpus indexes, and the three corpus-level gates.
	const headwordMap = buildHeadwordMap(composed.map((c) => c.entry));
	const forms = composed.map((c) => ({
		rid: c.entry.rid,
		text: decomposeForm(c.entry.headword).form.text,
	}));
	const { problems, slugs } = assignSlugs(forms);
	const pages = await loadPageIndex();
	const source = await sourceEntries();
	gates.chain = checkChain(source, buildHeadwordMap(source));
	gates.slugs = checkSlugs(forms, slugs);
	gates.slugs.failures.push(...problems);
	gates.pages = checkPages(
		composed.map((c) => c.entry.rid),
		pages,
	);

	// Pass 2: finish and gate.
	const validate = new Ajv2020({ allErrors: true, strict: true }).compile(
		entrySchema,
	);
	for (const c of composed) {
		const finished = finishEntry(c.entry, c.body, {
			headwordMap,
			pages,
			slugs,
		});
		gates.unresolved.push(...finished.unresolved);
		mark(
			gates.composition,
			finished.problems.length === 0,
			`${c.entry.rid}: ${finished.problems.join('; ')}`,
		);
		checkHeadwordRoundTrip(c.entry, finished.entry, gates.headwordRoundTrip);
		checkTextConservation(c.body, finished.entry, gates.textConservation);
		mark(
			gates.schema,
			validate(finished.entry) === true,
			`${c.entry.rid}: schema`,
		);
		const page = pages.get(c.entry.rid);
		if (page !== undefined && page.confidence !== 'high') {
			gates.nonHighPages.push(c.entry.rid);
		}
	}

	expect(composed.length).toBe(ENTRIES);
	// Gate 1, 4, 7, 8: one mark per entry, all green.
	expect(gates.bodyRoundTrips).toMatchObject({ pass: ENTRIES, total: ENTRIES });
	expect(gates.schema).toMatchObject({ pass: ENTRIES, total: ENTRIES });
	expect(gates.slugs).toMatchObject({ pass: ENTRIES, total: ENTRIES });
	expect(gates.pages).toMatchObject({ pass: ENTRIES, total: ENTRIES });
	// Gate 5: the walk plus its two structural marks.
	expect(gates.chain).toMatchObject({ pass: CHAIN_MARKS, total: CHAIN_MARKS });
	// Gates 2 and 3 count forms and fields, not entries.
	expect(gates.headwordRoundTrip).toMatchObject({
		pass: HEADWORD_FORMS,
		total: HEADWORD_FORMS,
	});
	expect(gates.textConservation).toMatchObject({
		pass: TEXT_FIELDS,
		total: TEXT_FIELDS,
	});
	// Gate 9 is RED by five named entries; see COMPOSITION_RED above.
	expect(gates.composition.total).toBe(COMPOSITION_MARKS);
	expect(gates.composition.failures.map((f) => f.slice(0, 6)).sort()).toEqual(
		COMPOSITION_RED,
	);
	// Gate 6's input. The quarantine list itself arrives in Task 13.
	expect(gates.unresolved.length).toBe(UNRESOLVED);
	expect(gates.nonHighPages.length).toBe(NON_HIGH_PAGES);
	const perStem = new Map<string, number>();
	for (const { text } of forms) {
		const stem = slugStem(text);
		perStem.set(stem, (perStem.get(stem) ?? 0) + 1);
	}
	expect([...perStem.values()].filter((n) => n > 1).length).toBe(
		COLLIDING_STEMS,
	);
});
