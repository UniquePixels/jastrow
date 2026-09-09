/**
 * Migration — source snapshot to truth files (spec 2026-09-06 §3–4).
 * Two passes: compose every entry and build the corpus-level indexes,
 * then finish and gate every entry. Dry by default; `--write` reruns
 * every gate and refuses on any red one, or on an output tree that
 * already holds truth files.
 * Run: bun pipeline:migrate [--write]
 */
import { existsSync } from 'node:fs';
import process from 'node:process';
import type { ValidateFunction } from 'ajv';
import Ajv2020 from 'ajv/dist/2020';
import { composeEntry, TransformFailure } from './body/compose.ts';
import { buildTrace } from './body/dry-run.ts';
import { evaluateRoundTrip } from './body/dry-run-verify.ts';
import { readSourceEntries } from './body/source.ts';
import type { BodyEntry, SourceEntry } from './body/types.ts';
import {
	buildHeadwordMap,
	checkQuarantine,
	loadQuarantine,
} from './migrate/cite.ts';
import { finishEntry } from './migrate/finish.ts';
import {
	checkChain,
	checkHeadwordRoundTrip,
	checkPages,
	checkSlugs,
	checkTextConservation,
	mark,
} from './migrate/gates.ts';
import { decomposeForm } from './migrate/headword.ts';
import { loadPageIndex, type PagePlacement } from './migrate/page.ts';
import {
	BLESSING_PATH,
	createReport,
	isGreen,
	REPORT_PATH,
	type Report,
	renderBlessing,
	type Sample,
	writeReport,
} from './migrate/report.ts';
import { assignSlugs, slugStem } from './migrate/slug.ts';
import type { TruthEntry } from './migrate/types.ts';
import {
	corpusPreflight,
	loadAcceptedCorpus,
	patchesByRid,
} from './patch/apply.ts';
import type { SemanticPatch } from './patch/schema.ts';
import { computeSnapshot } from './patch/snapshot.ts';
import entrySchema from './schema/entry.schema.json' with { type: 'json' };

const OUT_DIR = 'data/entries';
const SAMPLE_COUNT = 40;

/** One composed entry, kept for pass 2. Only the three things pass 2
 * needs are retained — the composer's records and phase tracker are
 * per-entry bookkeeping already folded into the report, and holding
 * 32,512 of them would cost memory for nothing. */
interface Composed {
	/** The consumer-facing body `buildTrace` derived, under the
	 * `consumer-output` phase. */
	body: BodyEntry;
	/** The entry after text-repairs, structural-repairs and patches. */
	entry: SourceEntry;
	/** The pristine snapshot entry — the chain gate is a SOURCE
	 * artefact and must be walked on source spellings. */
	source: SourceEntry;
}

/** The rid-grouped patch sets `composeOne` applies (Ruling F). */
interface PatchGroups {
	accepted: Map<string, SemanticPatch[]>;
	carryOver: Map<string, SemanticPatch[]>;
}

/** The corpus-level indexes pass 1 builds and pass 2 finishes against. */
interface Indexes {
	headwordMap: ReadonlyMap<string, string>;
	pages: ReadonlyMap<string, PagePlacement>;
	slugs: ReadonlyMap<string, string>;
}

/** Preflight the accepted patch corpus and group it by rid — the same
 * contract `body/migrate-dry.ts` runs under: the full apply set
 * (accepted + carry-over, Ruling F) is pin- and corpus-checked
 * together, the manifest reconciles against the accepted set only, and
 * every escalation defers to post-go-live (Ruling D; spec §8). */
async function preparePatches(report: Report): Promise<PatchGroups> {
	const accepted = await loadAcceptedCorpus();
	const pin = `sha256:${(await computeSnapshot()).combined}`;
	const preflight = corpusPreflight(
		[...accepted.patches, ...accepted.carryOver],
		accepted.records,
		pin,
		{ escalations: 'defer', reconcileOnly: accepted.patches },
	);
	if (preflight.length > 0) {
		throw new Error(
			`patch-corpus preflight failed (${preflight.length} problem(s)):\n${preflight
				.map((p) => `${p.patchId ?? p.rid ?? '(corpus)'}: ${p.reason}`)
				.join('\n')}`,
		);
	}
	report.patches.accepted = accepted.patches.length;
	return {
		accepted: patchesByRid(accepted.patches),
		carryOver: patchesByRid(accepted.carryOver),
	};
}

/** One entry through the composer and the body round-trip gate. A
 * composition failure is recorded on gate 9 and the entry is dropped
 * from pass 2 — the walk keeps going so one run lists every failure. */
function composeOne(
	source: SourceEntry,
	groups: PatchGroups,
	report: Report,
): Composed | undefined {
	try {
		const result = composeEntry(source, {
			accepted: groups.accepted.get(source.rid),
			carryOver: groups.carryOver.get(source.rid),
		});
		report.patches.applied += result.patchesApplied;
		report.patches.absorbed += result.carryOver.absorbed.length;
		report.patches.carried += result.carryOver.carried.length;
		const patchDetail = result.patchProblems
			.map((p) => `${p.patchId ?? source.rid}: ${p.reason}`)
			.join('; ');
		mark(
			report.gates.composition,
			result.patchProblems.length === 0,
			`${source.rid}: ${patchDetail}`,
		);
		const trace = result.phases.run('consumer-output', () =>
			buildTrace(result.entry),
		);
		const gates = evaluateRoundTrip(result.entry, trace);
		mark(
			report.gates.bodyRoundTrips,
			gates.rejoin && gates.units && gates.lettered && gates.formSection,
			`${source.rid}: body round-trip`,
		);
		return { body: trace.body, entry: result.entry, source };
	} catch (error) {
		const kind = error instanceof TransformFailure ? 'transform' : 'repair';
		mark(
			report.gates.composition,
			false,
			`${source.rid}: ${kind}: ${error instanceof Error ? error.message : String(error)}`,
		);
		return;
	}
}

/** Pass 1: compose every entry; composition failures land on gate 9. */
async function composeAll(report: Report): Promise<Composed[]> {
	const groups = await preparePatches(report);
	const composed: Composed[] = [];
	for await (const source of readSourceEntries()) {
		report.entries++;
		const one = composeOne(source, groups, report);
		if (one !== undefined) {
			composed.push(one);
		}
		groups.accepted.delete(source.rid);
		groups.carryOver.delete(source.rid);
	}
	// A patch whose rid never streamed past targets a nonexistent entry.
	// Recorded on gate 9 rather than thrown, so the report lists it
	// beside every other composition problem.
	const missing = new Set([
		...groups.accepted.keys(),
		...groups.carryOver.keys(),
	]);
	for (const rid of missing) {
		mark(report.gates.composition, false, `no source entry with rid ${rid}`);
	}
	return composed;
}

/** The collision histogram: members per stem → number of such stems.
 * Counted from `slugStem` directly, the same function `assignSlugs`
 * partitions on, so the answer is the corpus fact rather than a guess
 * read back off the numbered slugs. */
function collisionHistogram(
	forms: ReadonlyArray<{ rid: string; text: string }>,
): Record<string, number> {
	const perStem = new Map<string, number>();
	for (const { text } of forms) {
		const stem = slugStem(text);
		perStem.set(stem, (perStem.get(stem) ?? 0) + 1);
	}
	const collisions = new Map<string, number>();
	for (const size of perStem.values()) {
		const key = String(size);
		collisions.set(key, (collisions.get(key) ?? 0) + 1);
	}
	return Object.fromEntries(collisions);
}

/** Pass 1's corpus-level indexes, and gates 5, 7, 8 — the three that
 * are properties of the corpus rather than of one entry.
 *
 * Two headword maps, deliberately: citations resolve against the
 * COMPOSED headwords (transforms respell both an anchor and the
 * headword it names — the gershayim family), while the prev/next chain
 * is a source artefact and must be walked on source spellings. */
async function buildIndexes(
	composed: readonly Composed[],
	report: Report,
): Promise<Indexes> {
	const headwordMap = buildHeadwordMap(composed.map((c) => c.entry));
	const sourceHeadwordMap = buildHeadwordMap(composed.map((c) => c.source));
	const forms = composed.map((c) => ({
		rid: c.source.rid,
		text: decomposeForm(c.entry.headword).form.text,
	}));
	const { problems, slugs } = assignSlugs(forms);
	const pages = await loadPageIndex();
	report.gates.chain = checkChain(
		composed.map((c) => c.source),
		sourceHeadwordMap,
	);
	report.gates.slugs = checkSlugs(forms, slugs);
	report.gates.slugs.failures.push(...problems);
	report.gates.pages = checkPages(
		composed.map((c) => c.source.rid),
		pages,
	);
	report.slugCollisions = collisionHistogram(forms);
	return { headwordMap, pages, slugs };
}

/** Pass 2: finish and gate every composed entry, in corpus order. */
function finishAll(
	composed: readonly Composed[],
	indexes: Indexes,
	report: Report,
	validate: ValidateFunction,
): { samples: Sample[]; truths: TruthEntry[] } {
	const truths: TruthEntry[] = [];
	const samples: Sample[] = [];
	const stride = Math.max(1, Math.floor(composed.length / SAMPLE_COUNT));
	for (const [i, c] of composed.entries()) {
		// `c.entry`, not `c.source`: transforms can respell the headword,
		// and `headwordMap`/`slugs` were built from the COMPOSED one.
		// `finishEntry` decomposes its first argument's `.headword` into
		// the truth entry, so the pre-transform source here would write
		// the old spelling under a slug assigned to the new one — and
		// `checkHeadwordRoundTrip`, which compares `c.entry` against this
		// same `finished.entry`, would fail on every respelled headword.
		const finished = finishEntry(c.entry, c.body, indexes);
		report.headwordReview.push(...finished.headwordReview);
		report.markupCarries.push(...finished.markupCarries);
		report.unresolved.push(...finished.unresolved);
		mark(
			report.gates.composition,
			finished.problems.length === 0,
			finished.problems.join('; '),
		);
		checkHeadwordRoundTrip(
			c.entry,
			finished.entry,
			report.gates.headwordRoundTrip,
		);
		checkTextConservation(
			c.body,
			finished.entry,
			report.gates.textConservation,
		);
		mark(
			report.gates.schema,
			validate(finished.entry) === true,
			`${c.source.rid}: ${JSON.stringify(validate.errors)}`,
		);
		const page = indexes.pages.get(c.source.rid);
		if (page !== undefined && page.confidence !== 'high') {
			report.nonHighPages.push(
				`${c.source.rid}: p${page.number}${page.column} (${page.confidence})`,
			);
		}
		truths.push(finished.entry);
		if (i % stride === 0 && samples.length < SAMPLE_COUNT) {
			samples.push({
				rid: c.source.rid,
				source: c.entry,
				truth: finished.entry,
			});
		}
	}
	return { samples, truths };
}

/** Gate 6: every unresolved internal target is on the quarantine
 * list, every listed pair is still unresolved, and every listed pair
 * has been REVIEWED. A row can fail on more than one count, so the
 * failing keys are unioned before they are subtracted — counting them
 * twice would drive `pass` below zero. */
async function gateQuarantine(report: Report): Promise<void> {
	report.quarantine = await loadQuarantine();
	const { stale, unlisted, unreviewed } = checkQuarantine(
		report.unresolved,
		report.quarantine,
	);
	const failing = new Set([...stale, ...unreviewed]);
	report.gates.internalTargets.total = report.quarantine.length;
	report.gates.internalTargets.pass = report.quarantine.length - failing.size;
	report.gates.internalTargets.failures.push(
		...unlisted.map((u) => `unlisted: ${u}`),
		...stale.map((s) => `stale: ${s}`),
		...unreviewed.map((u) => `unreviewed: ${u}`),
	);
}

/** The output subdirectory for a rid: its leading letter, so 32,512
 * files land in 22 directories rather than one. */
function letterDir(rid: string): string {
	return rid.charAt(0);
}

/** `--write`'s refusal check. A single sentinel (e.g. A/A00000.json)
 * misses a partial prior write that stopped before reaching it, or any
 * output tree that simply doesn't start at A00000 — either lets
 * `--write` mix old and new truth files. Refuse on ANY existing entry
 * file instead. */
async function outputTreeIsEmpty(): Promise<boolean> {
	if (!existsSync(OUT_DIR)) {
		return true;
	}
	const scan = new Bun.Glob('*/*.json').scan(OUT_DIR);
	return (await scan.next()).done === true;
}

/** The one write of the whole pipeline: 32,512 files, then the report
 * again so its `written` count is on disk. */
async function writeAll(
	truths: readonly TruthEntry[],
	report: Report,
): Promise<void> {
	for (const truth of truths) {
		await Bun.write(
			`${OUT_DIR}/${letterDir(truth.id)}/${truth.id}.json`,
			`${JSON.stringify(truth, null, '\t')}\n`,
		);
		report.written++;
	}
	await writeReport(report);
	console.log(`wrote ${report.written} truth files under ${OUT_DIR}`);
}

/** The run summary on stdout: every gate, then the four
 * informational lists, then where the written evidence went. */
function printGates(report: Report): void {
	for (const [name, t] of Object.entries(report.gates)) {
		console.log(
			`gate ${name}=${t.pass}/${t.total} failures=${t.failures.length}`,
		);
	}
	console.log(
		`unresolved=${report.unresolved.length} headwordReview=${report.headwordReview.length} nonHighPages=${report.nonHighPages.length} markupCarries=${report.markupCarries.length}`,
	);
	console.log(`report written to ${REPORT_PATH}; evidence to ${BLESSING_PATH}`);
}

/** The migrate CLI. Without `--write` it is a dry run: everything is
 * composed, gated and reported, and nothing is written to the truth
 * tree. With `--write` it refuses outright unless that tree is empty,
 * because the migration is a one-shot and a second pass over a
 * half-written tree would leave a mix of two runs. */
async function main(): Promise<void> {
	const write = process.argv.includes('--write');
	if (write && !(await outputTreeIsEmpty())) {
		throw new Error(
			`${OUT_DIR} already holds truth files; migration writes once`,
		);
	}
	const validate: ValidateFunction = new Ajv2020({
		allErrors: true,
		strict: true,
	}).compile(entrySchema);
	const report = createReport();
	const composed = await composeAll(report);
	const indexes = await buildIndexes(composed, report);
	const { samples, truths } = finishAll(composed, indexes, report, validate);
	await gateQuarantine(report);
	await writeReport(report);
	await Bun.write(BLESSING_PATH, `${renderBlessing(report, samples)}\n`);
	printGates(report);
	if (!isGreen(report)) {
		throw new Error('at least one gate is red; see the report');
	}
	if (write) {
		await writeAll(truths, report);
	}
}

if (import.meta.main) {
	await main();
}

export type { Composed, Indexes };
export {
	buildIndexes,
	collisionHistogram,
	composeAll,
	composeOne,
	finishAll,
	letterDir,
	outputTreeIsEmpty,
	preparePatches,
};
