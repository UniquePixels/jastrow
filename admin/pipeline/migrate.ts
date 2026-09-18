/**
 * Migration — source snapshot to truth files (spec 2026-09-06 §3–4).
 * Two passes: compose every entry and build the corpus-level indexes,
 * then finish and gate every entry. Dry by default; `--write` reruns
 * every gate and refuses on any red one, or on an output tree that
 * already holds truth files.
 * Run: bun pipeline:migrate [--write] [--strict]
 *
 * A stale snapshot pin is one count in the report header; a patch whose
 * precondition no longer holds is a report row. `--strict` makes either
 * refuse the run (consolidation spec §4.2).
 */
import { existsSync } from 'node:fs';
import process from 'node:process';
import type { ValidateFunction } from 'ajv';
import Ajv2020 from 'ajv/dist/2020';
import { composeEntry, TransformFailure } from './body/compose.ts';
import { buildTrace } from './body/dry-run.ts';
import { evaluateRoundTrip } from './body/dry-run-verify.ts';
import type { PassName } from './body/repairs.ts';
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
import { type RunOptions, runOptions } from './migrate/options.ts';
import { unbasedOrphans } from './migrate/orphan-refs.ts';
import { loadPageIndex, type PagePlacement } from './migrate/page.ts';
import {
	markMissingTargets,
	type PatchGroups,
	recordPatchOutcomes,
} from './migrate/patches.ts';
import {
	BLESSING_PATH,
	createReport,
	createRuleCounter,
	isGreen,
	lineRow,
	REPORT_PATH,
	type Report,
	type RuleCounter,
	renderBlessing,
	type Sample,
	writeReport,
} from './migrate/report.ts';
import { assignSlugs, slugStem } from './migrate/slug.ts';
import {
	type AliasAudit,
	type AliasRow,
	auditAliases,
	changedSlugs,
	loadAliases,
	loadSlugIndex,
	SLUGS_FROZEN,
	type SlugFact,
	type SlugRow,
	unsafeSlugs,
	writeAliases,
	writeSlugIndex,
} from './migrate/slug-index.ts';
import type { TruthEntry } from './migrate/types.ts';
import {
	corpusPreflight,
	loadAcceptedCorpus,
	loadReviewedCorpus,
	patchesByRid,
	reviewedManifestProblems,
	stalePins,
} from './patch/apply.ts';
import { computeSnapshot } from './patch/snapshot.ts';
import entrySchema from './schema/entry.schema.json' with { type: 'json' };
import { RULES } from './transform/registry.ts';

const OUT_DIR = 'data/entries';
const SAMPLE_COUNT = 40;

/** `repairs.ts` pass names (`PassName`), counted as rules alongside
 * the registry (consolidation spec §4.1). A pass missing here still
 * gets a row when it fires — only its zero row would be lost. */
const REPAIR_PASSES: readonly PassName[] = ['binyan-cleanup'] as const;

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

/** The corpus-level indexes pass 1 builds and pass 2 finishes against. */
interface Indexes {
	headwordMap: ReadonlyMap<string, string>;
	pages: ReadonlyMap<string, PagePlacement>;
	/** What `--write` puts in `data/slug-index/` — only while slugs are
	 * not frozen; a frozen run writes nothing there (spec §7.1). */
	slugIndex?: { aliases: AliasRow[]; rows: SlugRow[] };
	slugs: ReadonlyMap<string, string>;
}

/** One run's slugs, and the prior assignment gate 6 excuses. */
interface SlugPlan {
	prior: ReadonlyMap<string, string>;
	problems: string[];
	slugIndex?: Indexes['slugIndex'];
	slugs: ReadonlyMap<string, string>;
}

/** Preflight the accepted patch corpus and group it by rid. The full
 * apply set (accepted + carry-over, Ruling F) is corpus-checked
 * together, the manifest reconciles against the accepted set only, and
 * every escalation defers to post-go-live (Ruling D). A stale snapshot
 * pin is counted, not refused, unless `--strict` (consolidation §4.2). */
async function preparePatches(
	report: Report,
	options: RunOptions,
): Promise<PatchGroups> {
	const accepted = await loadAcceptedCorpus();
	const reviewed = await loadReviewedCorpus();
	// Reviewed patches join the pin/id/target preflight (id uniqueness,
	// no overlapping targets); their manifest lives in the reviewed
	// directory, not the accepted one `reconcileOnly` names, so it is
	// reconciled separately against the reviewed patches alone.
	const applySet = [
		...reviewed.patches,
		...accepted.patches,
		...accepted.carryOver,
	];
	const pin = `sha256:${(await computeSnapshot()).combined}`;
	report.snapshot = { pin, stalePins: stalePins(applySet, pin).length };
	const preflight = corpusPreflight(applySet, accepted.records, pin, {
		escalations: 'defer',
		pins: options.pins,
		reconcileOnly: accepted.patches,
	});
	preflight.push(...reviewedManifestProblems(reviewed));
	if (preflight.length > 0) {
		throw new Error(
			`patch-corpus preflight failed (${preflight.length} problem(s)):\n${preflight
				.map((p) => `${p.patchId ?? p.rid ?? '(corpus)'}: ${p.reason}`)
				.join('\n')}`,
		);
	}
	report.patches.accepted = accepted.patches.length;
	report.patches.reviewed = reviewed.patches.length;
	report.rows.push(
		...reviewed.deferred.map((r) =>
			lineRow(`${r.rid}: ${r.escalation}`, 'review-deferred'),
		),
	);
	return {
		accepted: patchesByRid(accepted.patches),
		carryOver: patchesByRid(accepted.carryOver),
		drift: options.drift,
		reviewed: patchesByRid(reviewed.patches),
	};
}

/** One entry through the composer and the body round-trip gate. A
 * composition failure is recorded on gate 9 and as a fault row, and the
 * entry is dropped from pass 2 — the walk keeps going so one run lists
 * every failure. */
function composeOne(
	source: SourceEntry,
	groups: PatchGroups,
	report: Report,
	rules: RuleCounter,
): Composed | undefined {
	const reviewed = groups.reviewed.get(source.rid);
	const accepted = groups.accepted.get(source.rid);
	const carryOver = groups.carryOver.get(source.rid);
	try {
		const result = composeEntry(source, {
			accepted,
			carryOver,
			drift: groups.drift,
			reviewed,
		});
		for (const record of result.repairRecords) {
			rules.add(`repairs:${record.pass}`, record.rid);
		}
		for (const record of result.transformRecords) {
			rules.add(record.ruleId, record.rid);
		}
		report.patches.applied += result.patchesApplied;
		report.patches.absorbed += result.carryOver.absorbed.length;
		report.patches.carried += result.carryOver.carried.length;
		recordPatchOutcomes(
			source.rid,
			[...(reviewed ?? []), ...(accepted ?? []), ...(carryOver ?? [])],
			result,
			report,
		);
		for (const problem of result.patchProblems) {
			report.rows.push({
				bucket: 'pipeline',
				detail: `${problem.patchId ?? '(no patch id)'}: ${problem.reason}`,
				kind: 'patch-failed',
				rid: source.rid,
				severity: 'fault',
			});
		}
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
		const message = error instanceof Error ? error.message : String(error);
		mark(report.gates.composition, false, `${source.rid}: ${kind}: ${message}`);
		report.rows.push({
			bucket: 'pipeline',
			detail: `${kind}: ${message}`,
			kind: 'composition-failed',
			rid: source.rid,
			severity: 'fault',
		});
		// Load-bearing: `composeOne` returns `Composed | undefined` and
		// tsc's TS7030 rejects the implicit fall-off. The directive has to
		// be the LAST comment before the statement — with explanation
		// lines after it, `biome check --write` deleted the return.
		// biome-ignore lint/complexity/noUselessReturn: tsc TS7030 needs it
		return;
	}
}

/** Pass 1: compose every entry; composition failures land on gate 9. */
async function composeAll(
	report: Report,
	options: RunOptions,
): Promise<Composed[]> {
	const groups = await preparePatches(report, options);
	const rules = createRuleCounter([
		...RULES.map((rule) => rule.id),
		...REPAIR_PASSES.map((pass) => `repairs:${pass}`),
	]);
	const composed: Composed[] = [];
	for await (const source of readSourceEntries()) {
		report.entries++;
		const one = composeOne(source, groups, report, rules);
		if (one !== undefined) {
			composed.push(one);
		}
		groups.reviewed.delete(source.rid);
		groups.accepted.delete(source.rid);
		groups.carryOver.delete(source.rid);
	}
	report.rules = rules.rows();
	markMissingTargets(groups, report);
	return composed;
}

/** Gate 9's `orphan-ref-unbased` fault: every `REPAIRED_ORPHAN_ITEMS`
 * obligation still resolved against the COMPOSED entries — run after
 * `composeAll` so patches and transforms have already had their say.
 * A miss is both a row (for the counted kinds line) and a composition
 * failure, so `isGreen` refuses the run rather than reporting it. */
function checkOrphanRefs(composed: readonly Composed[], report: Report): void {
	const lines = unbasedOrphans(composed.map((c) => c.entry));
	report.rows.push(
		...lines.map((l) => lineRow(l, 'orphan-ref-unbased', 'pipeline', 'fault')),
	);
	report.gates.composition.failures.push(...lines);
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

/** The frozen run's slug-index review rows (spec §7.2, §7.3): families
 * that should gain a bare-stem alias, families whose bare name is
 * already a member's real slug so none can be given, and slugs carrying
 * notation that is not part of the word.
 *
 * Nothing is written. Adding an alias row is index maintenance, which
 * waits for the atomic write (R11); until then a run reports what the
 * index is missing. On the committed corpus it is missing nothing. */
async function auditSlugIndex(
	rids: readonly string[],
	slugs: ReadonlyMap<string, string>,
	index: ReadonlyMap<string, SlugRow>,
	report: Report,
): Promise<void> {
	const facts: SlugFact[] = [];
	const seen = new Set<string>();
	for (const rid of rids) {
		const slug = slugs.get(rid);
		if (slug !== undefined) {
			facts.push({ rid, slug });
			seen.add(rid);
		}
	}
	// Reserved rows this run has no form for — a retired member still
	// counts toward its family's size. Without them a family that has
	// dropped to one live member reads as a lone entry needing no alias,
	// and a missing alias goes unreported. `validate.ts` audits the whole
	// index for the same reason.
	for (const [rid, row] of index) {
		if (!seen.has(rid)) {
			facts.push({ rid, slug: row.slug });
		}
	}
	const audit = auditAliases(facts, await loadAliases());
	report.rows.push(
		...audit.add.map((a) => lineRow(`${a.rid}: ${a.slug}`, 'slug-alias-new')),
	);
	aliasRows(audit, facts, report);
}

/** The alias and notation rows both modes report. */
function aliasRows(
	audit: AliasAudit,
	facts: readonly SlugFact[],
	report: Report,
): void {
	report.rows.push(
		...audit.bareHeld.map((l) => lineRow(l, 'slug-bare-held')),
		...audit.problems.map((l) =>
			lineRow(l, 'slug-alias-failed', 'pipeline', 'fault'),
		),
		...unsafeSlugs(facts).map((l) => lineRow(l, 'slug-unsafe')),
	);
}

/** Frozen (R10, after publication): the slug index is an INPUT (spec
 * §7.1). A rid it already names keeps that slug whatever the transforms
 * did to its headword, and only a rid with no row is assigned. Retired
 * rows are passed too — they hold their slug without owning an entry. */
async function frozenSlugs(
	forms: ReadonlyArray<{ rid: string; text: string }>,
	report: Report,
): Promise<SlugPlan> {
	const index = await loadSlugIndex();
	const prior = new Map([...index].map(([rid, row]) => [rid, row.slug]));
	const { assigned, drift, problems, slugs } = assignSlugs(forms, prior);
	report.rows.push(
		...assigned.map((rid) => lineRow(`${rid}: ${slugs.get(rid)}`, 'slug-new')),
		...drift.map((l) => lineRow(l, 'slug-frozen-stem-drift')),
	);
	await auditSlugIndex(
		forms.map((f) => f.rid),
		slugs,
		index,
		report,
	);
	return { prior, problems, slugs };
}

/** Not frozen (before publication): every slug and alias is assigned
 * from the composed headwords, as every entry is composed, and becomes
 * the index `--write` writes. What moved against the committed index is
 * reported as `slug-changed`; nothing else holds a run back. */
async function regeneratedSlugs(
	forms: ReadonlyArray<{ rid: string; text: string }>,
	report: Report,
): Promise<SlugPlan> {
	const { problems, slugs } = assignSlugs(forms);
	const facts: SlugFact[] = forms.flatMap(({ rid }) => {
		const slug = slugs.get(rid);
		return slug === undefined ? [] : [{ rid, slug }];
	});
	const audit = auditAliases(facts, new Map());
	report.rows.push(
		...changedSlugs(facts, await loadSlugIndex()).map((l) =>
			lineRow(l, 'slug-changed'),
		),
	);
	aliasRows(audit, facts, report);
	const rows: SlugRow[] = facts.map((f) => ({ ...f, status: 'live' }));
	return {
		prior: new Map(),
		problems,
		slugIndex: { aliases: audit.add, rows },
		slugs,
	};
}

/** Pass 1's corpus-level indexes, and gates 5, 7, 8 — the three that
 * are properties of the corpus rather than of one entry.
 *
 * Two headword maps, deliberately: citations resolve against the
 * COMPOSED headwords (transforms respell both an anchor and the
 * headword it names — the gershayim family), while the prev/next chain
 * is a source artefact and must be walked on source spellings.
 *
 * `frozen` picks the slug mode (spec §7): `SLUGS_FROZEN` unless a
 * caller says otherwise. */
async function buildIndexes(
	composed: readonly Composed[],
	report: Report,
	frozen = SLUGS_FROZEN,
): Promise<Indexes> {
	const headwordMap = buildHeadwordMap(composed.map((c) => c.entry));
	const sourceHeadwordMap = buildHeadwordMap(composed.map((c) => c.source));
	const forms = composed.map((c) => ({
		rid: c.source.rid,
		text: decomposeForm(c.entry.headword).form.text,
	}));
	const { prior, problems, slugIndex, slugs } = frozen
		? await frozenSlugs(forms, report)
		: await regeneratedSlugs(forms, report);
	const pages = await loadPageIndex();
	report.gates.chain = checkChain(
		composed.map((c) => c.source),
		sourceHeadwordMap,
	);
	report.gates.slugs = checkSlugs(forms, slugs, prior);
	report.gates.slugs.failures.push(...problems);
	report.gates.pages = checkPages(
		composed.map((c) => c.source.rid),
		pages,
	);
	report.slugCollisions = collisionHistogram(forms);
	return slugIndex === undefined
		? { headwordMap, pages, slugs }
		: { headwordMap, pages, slugIndex, slugs };
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
		report.rows.push(
			...finished.headwordReview.map((line) =>
				lineRow(line, 'headword-unparsed'),
			),
			...finished.markupCarries.map((line) => lineRow(line, 'markup-carry')),
			...finished.problems.map((line) =>
				lineRow(line, 'finish-failed', 'pipeline', 'fault'),
			),
		);
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
			report.rows.push({
				bucket: 'review',
				detail: `p${page.number}${page.column} (${page.confidence})`,
				kind: `page-confidence-${page.confidence}`,
				rid: c.source.rid,
				severity: 'review',
			});
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

/** Biome is the one formatter for truth (consolidation spec R5), so
 * formatting is the write's last step. It runs here rather than as a
 * second command in the `pipeline:migrate` script: `bun run` appends
 * extra arguments to the LAST command, so `bun pipeline:migrate
 * --write` handed `--write` to biome and migrate ran dry (PR #88). */
function formatTruth(): void {
	const result = Bun.spawnSync(
		['node_modules/.bin/biome', 'format', '--write', OUT_DIR],
		{ stderr: 'inherit', stdout: 'inherit' },
	);
	if (result.exitCode !== 0) {
		throw new Error(`biome format exited ${result.exitCode}`);
	}
}

/** The one write of the whole pipeline: 32,512 files, formatted, the
 * slug index when this run assigned it, then the report again so its
 * `written` count is on disk. */
async function writeAll(
	truths: readonly TruthEntry[],
	slugIndex: Indexes['slugIndex'],
	report: Report,
): Promise<void> {
	for (const truth of truths) {
		await Bun.write(
			`${OUT_DIR}/${letterDir(truth.id)}/${truth.id}.json`,
			`${JSON.stringify(truth, null, '\t')}\n`,
		);
		report.written++;
	}
	formatTruth();
	if (slugIndex !== undefined) {
		await writeSlugIndex(slugIndex.rows);
		await writeAliases(slugIndex.aliases);
		console.log(
			`wrote ${slugIndex.rows.length} slug rows and ${slugIndex.aliases.length} aliases`,
		);
	}
	await writeReport(report);
	console.log(`wrote ${report.written} truth files under ${OUT_DIR}`);
}

/** The run summary on stdout: one line per gate, the row-kind counts
 * alongside the unresolved total, the stale-pin/drift line, and where
 * the written evidence went. */
function printGates(report: Report, slugMode: string): void {
	for (const [name, t] of Object.entries(report.gates)) {
		console.log(
			`gate ${name}=${t.pass}/${t.total} failures=${t.failures.length}`,
		);
	}
	const kinds = new Map<string, number>();
	for (const row of report.rows) {
		kinds.set(row.kind, (kinds.get(row.kind) ?? 0) + 1);
	}
	// Printed even at zero, like the slug kinds below: a gate that found
	// nothing to flag reads the same as one that never ran.
	if (!kinds.has('orphan-ref-unbased')) {
		kinds.set('orphan-ref-unbased', 0);
	}
	const kindCounts = [...kinds].map(([k, n]) => `${k}=${n}`).join(' ');
	console.log(`unresolved=${report.unresolved.length} ${kindCounts}`);
	console.log(
		`stalePins=${report.snapshot.stalePins} upstreamFixed=${report.patches.upstreamFixed} upstreamChanged=${report.patches.upstreamChanged}`,
	);
	// Printed even when every count is zero: a run that says nothing
	// about slugs reads the same as one that never looked.
	const slugKinds = [
		'slug-changed',
		'slug-new',
		'slug-frozen-stem-drift',
		'slug-alias-new',
		'slug-bare-held',
		'slug-unsafe',
	];
	const slugCounts = slugKinds.map((k) => `${k}=${kinds.get(k) ?? 0}`);
	console.log(`slugs=${slugMode} ${slugCounts.join(' ')}`);
	console.log(`report written to ${REPORT_PATH}; evidence to ${BLESSING_PATH}`);
}

/** The migrate CLI. Without `--write` it is a dry run: everything is
 * composed, gated and reported, and nothing is written to the truth
 * tree. With `--write` it refuses outright unless that tree is empty,
 * because the migration is a one-shot and a second pass over a
 * half-written tree would leave a mix of two runs. */
async function main(): Promise<void> {
	const options = runOptions(process.argv);
	if (options.write && !(await outputTreeIsEmpty())) {
		throw new Error(
			`${OUT_DIR} already holds truth files; migration writes once`,
		);
	}
	const validate: ValidateFunction = new Ajv2020({
		allErrors: true,
		strict: true,
	}).compile(entrySchema);
	const report = createReport();
	const composed = await composeAll(report, options);
	checkOrphanRefs(composed, report);
	const indexes = await buildIndexes(composed, report);
	const { samples, truths } = finishAll(composed, indexes, report, validate);
	await gateQuarantine(report);
	await writeReport(report);
	await Bun.write(BLESSING_PATH, `${renderBlessing(report, samples)}\n`);
	// Read off what the run did, not the constant: only a regenerating
	// run returns an index to write.
	printGates(
		report,
		indexes.slugIndex === undefined ? 'frozen' : 'regenerated',
	);
	if (!isGreen(report)) {
		throw new Error('at least one gate is red; see the report');
	}
	if (options.write) {
		await writeAll(truths, indexes.slugIndex, report);
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
