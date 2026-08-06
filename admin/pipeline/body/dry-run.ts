/**
 * Full-corpus dry run (design doc §6.0, entry-body-model plan Task 11 —
 * the capstone). This module owns the §6.0 rule composition — `buildBody`
 * wires the rejoin/lettered/units/labels/grammar modules (Tasks 5-9) into
 * one `BodyEntry` — and the `bun body:dry-run` entry point, which streams
 * the full corpus through that composition and the round-trip verifier
 * and writes the gitignored blessing-gate report. Round-trip verification
 * lives in `dry-run-verify.ts` and the accumulator/tally/schema-sample
 * bookkeeping in `dry-run-report.ts` — neither depends back on this
 * module, so importing from them never forms a cycle; split only to stay
 * under the per-file line budget. Together the three files are Task 11.
 * Run: bun body:dry-run
 */
import type { ValidateFunction } from 'ajv';
import Ajv2020 from 'ajv/dist/2020';
import entrySchema from '../schema/entry.schema.json' with { type: 'json' };
import type { Accumulator } from './dry-run-report.ts';
import {
	createAccumulator,
	printSummary,
	REPORT_PATH,
	tallyGrammar,
	tallyLabels,
	tallyRoundTrip,
	tallySchema,
	tallyStructure,
} from './dry-run-report.ts';
import { evaluateRoundTrip } from './dry-run-verify.ts';
import { splitFormSection } from './form-sections.ts';
import { parseMarker } from './grammar.ts';
import { parseLabel } from './labels.ts';
import { splitLettered } from './lettered.ts';
import { rejoinGlossHead } from './rejoin.ts';
import { readSourceEntries } from './source.ts';
import type {
	BodyEntry,
	BodySense,
	BodyStem,
	SourceEntry,
	SourceSense,
} from './types.ts';
import { segmentUnits } from './units.ts';

interface Problem {
	detail: string;
	rid: string;
	rule: 'grammar' | 'labels' | 'schema';
}

/** One (original source text, built sense) correspondence recorded at
 * construction time — the pairing `dry-run-report.ts`'s round-trip
 * verifier needs, since a `BodySense` alone doesn't carry back a pointer
 * to the source string it came from. `formSectionSibling` is set
 * alongside `built` when the same text also produced a form-section
 * sibling sense (B12: Pl./Part. pass./Fem./Denom.) — the round-trip
 * verifier needs both halves to check the split reconstructs `original`
 * byte-for-byte. */
interface SensePair {
	built: BodySense;
	formSectionSibling?: BodySense;
	original: string;
}

interface Trace {
	body: BodyEntry;
	formSectionSiblings: Set<BodySense>;
	pairs: SensePair[];
	problems: Problem[];
}

interface BuildAcc {
	formSectionSiblings: Set<BodySense>;
	pairs: SensePair[];
	problems: Problem[];
}

/** Parse `raw` into the normalized label the design doc calls for
 * (§2 `senses` row), quarantining an unparseable value to `problems`
 * while still falling back to storing it verbatim — dry-run visibility,
 * never a silent drop. */
function resolveLabel(
	rid: string,
	raw: string | undefined,
	acc: BuildAcc,
): string | undefined {
	if (raw === undefined) {
		return;
	}
	const parsed = parseLabel(raw);
	if ('unknown' in parsed) {
		acc.problems.push({ detail: raw, rid, rule: 'labels' });
		return raw;
	}
	return parsed.label;
}

function buildLetteredChild(item: { letter: string; text: string }): BodySense {
	const { gloss, units } = segmentUnits(item.text);
	return { gloss, label: item.letter, units };
}

/** A form-section item child (design doc §2 senses row, B12) is built
 * exactly like a lettered child (own gloss + units), just labeled by
 * its restarted number instead of a letter. */
function buildFormSectionChild(item: {
	label: string;
	text: string;
}): BodySense {
	const { gloss, units } = segmentUnits(item.text);
	return { gloss, label: item.label, units };
}

/** Splits `text` (already the right input per caller — either a plain
 * sense definition or, for the entry's intro sense, the rejoined gloss
 * head) into its lettered run (if any), then — on the resulting head —
 * its restarted form-section run (if any, B12: Pl./Part. pass./Fem./
 * Denom.; design §3 table order: lettered before form section), before
 * unit-segmenting whatever's left. When a form-section block is found
 * it becomes an unlabeled SIBLING sense (not a child of the host)
 * appended right after the host: gloss = the marker intro, children =
 * the restarted numbered items, each unit-segmented like a lettered
 * child. Returns `[host]` or `[host, form-section sibling]` — this is
 * the one shared text→BodySense[] step every sense in the tree (intro,
 * plain, stem child) goes through. */
function buildTextSense(text: string, label: string | undefined): BodySense[] {
	const lettered = splitLettered(text);
	const head = lettered ? lettered.head : text;
	const formSection = splitFormSection(head);
	const hostText = formSection ? formSection.host : head;
	const { gloss, units } = segmentUnits(hostText);
	const host: BodySense = {
		gloss,
		units,
		...(label === undefined ? {} : { label }),
		...(lettered === null
			? {}
			: { senses: lettered.items.map(buildLetteredChild) }),
	};
	if (formSection === null) {
		return [host];
	}
	const sibling: BodySense = {
		gloss: formSection.intro,
		senses: formSection.items.map(buildFormSectionChild),
		units: [],
	};
	return [host, sibling];
}

/** Builds the sense(s) for one text and records their `SensePair` in one
 * place — every `buildTextSense` call site (intro, plain top-level sense,
 * stem child) needs this same bookkeeping, so it's shared rather than
 * repeated. */
function pushTextSense(
	acc: BuildAcc,
	text: string,
	label: string | undefined,
): BodySense[] {
	const built = buildTextSense(text, label);
	const [host, sibling] = built;
	if (host !== undefined) {
		acc.pairs.push({
			built: host,
			original: text,
			...(sibling === undefined ? {} : { formSectionSibling: sibling }),
		});
	}
	if (sibling !== undefined) {
		acc.formSectionSiblings.add(sibling);
	}
	return built;
}

function buildStemChild(
	rid: string,
	child: SourceSense,
	acc: BuildAcc,
): BodySense[] {
	const text = child.definition ?? '';
	const label = resolveLabel(rid, child.number, acc);
	return pushTextSense(acc, text, label);
}

/** A top-level sense carrying `.grammar` is a binyan section (design doc
 * §2 `stems` row), not a text sense — its own children never carry
 * `grammar`/nested `senses` (corpus-measured: max depth 1), so one
 * non-recursive map over them is enough. */
function buildStem(rid: string, sense: SourceSense, acc: BuildAcc): BodyStem {
	const { grammar } = sense;
	return {
		forms: grammar?.binyan_form ?? [],
		senses: (sense.senses ?? []).flatMap((child) =>
			buildStemChild(rid, child, acc),
		),
		stem: grammar?.verbal_stem ?? '',
	};
}

function applyGrammarIndex(
	e: SourceEntry,
	body: BodyEntry,
	problems: Problem[],
): void {
	if (e.content.morphology === undefined) {
		return;
	}
	const parsed = parseMarker(e.content.morphology);
	if (parsed === null) {
		return;
	}
	if ('unknown' in parsed) {
		problems.push({ detail: parsed.unknown, rid: e.rid, rule: 'grammar' });
		return;
	}
	body.grammar = parsed;
}

/** Composes every §6.0 rule over one entry, recording a (source text,
 * built sense) pair for every text sense so the round-trip verifier can
 * check reconstruction later without re-deriving the routing decisions
 * (grammar-node vs. text sense, index-0 substitution) a second time. The
 * entry's first top-level sense is never re-emitted as a plain sense —
 * whether it's a text sense (whose `.definition` becomes part of the
 * rejoined gloss head) or a grammar node (whose header material still
 * folds into that same gloss head, since `rejoinGlossHead` reads
 * `content.senses[0]?.definition` regardless of what sense 0 actually
 * is) — its content is captured once, in the intro sense below. */
function buildTrace(e: SourceEntry): Trace {
	const acc: BuildAcc = {
		formSectionSiblings: new Set(),
		pairs: [],
		problems: [],
	};
	const { joined } = rejoinGlossHead(e);
	const [first] = e.content.senses;
	const introLabel =
		first !== undefined && !first.grammar
			? resolveLabel(e.rid, first.number, acc)
			: undefined;
	const introSenses = pushTextSense(acc, joined, introLabel);

	const senses: BodySense[] = [...introSenses];
	const stems: BodyStem[] = [];
	for (const [index, sense] of e.content.senses.entries()) {
		if (sense.grammar) {
			stems.push(buildStem(e.rid, sense, acc));
			continue;
		}
		if (index === 0) {
			continue;
		}
		const text = sense.definition ?? '';
		const label = resolveLabel(e.rid, sense.number, acc);
		senses.push(...pushTextSense(acc, text, label));
	}

	const body: BodyEntry = {
		id: e.rid,
		senses,
		...(stems.length > 0 ? { stems } : {}),
	};
	applyGrammarIndex(e, body, acc.problems);
	return {
		body,
		formSectionSiblings: acc.formSectionSiblings,
		pairs: acc.pairs,
		problems: acc.problems,
	};
}

/** Public composition contract (Task 11 step 1): every rule module wired
 * together into one `BodyEntry`, plus the quarantine `problems` a caller
 * (migrate.ts, later) needs for eyes-on review. */
function buildBody(e: SourceEntry): { body: BodyEntry; problems: Problem[] } {
	const { body, problems } = buildTrace(e);
	return { body, problems };
}

interface RunContext {
	acc: Accumulator;
	validate: ValidateFunction;
}

function processEntry(e: SourceEntry, index: number, ctx: RunContext): void {
	ctx.acc.entries++;
	const trace = buildTrace(e);
	// trace.problems is unused on this run path by design: the report's
	// quarantine counts come from tallyLabels/tallyGrammar's own independent
	// tallies below, not from re-reading this trace; `problems` exists for
	// the buildBody/migrate.ts contract instead.
	tallyRoundTrip(ctx.acc, evaluateRoundTrip(e, trace));
	tallyStructure(trace.body, trace.formSectionSiblings, ctx.acc);
	tallyLabels(e, ctx.acc);
	tallyGrammar(e, ctx.acc);
	tallySchema({ body: trace.body, e, index }, ctx.validate, ctx.acc);
}

if (import.meta.main) {
	const ajv = new Ajv2020({ allErrors: true, strict: true });
	const validate = ajv.compile(entrySchema);
	const acc = createAccumulator();
	const ctx: RunContext = { acc, validate };

	let index = 0;
	for await (const e of readSourceEntries()) {
		processEntry(e, index, ctx);
		index++;
	}

	await Bun.write(REPORT_PATH, `${JSON.stringify(acc, null, '\t')}\n`);
	printSummary(acc);
}

export type { Problem, SensePair, Trace };
export { buildBody, buildTrace };
