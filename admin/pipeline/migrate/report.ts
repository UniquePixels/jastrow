/** The migration report (migrate spec §4.2; consolidation spec §3.1): every gate as a tally, structured rows, rule counts, patch outcomes, and the evidence doc the maintainer blesses. */
import type { DriftOutcome } from '../patch/drift.ts';
import type { QuarantineRow, Unresolved } from './cite.ts';
import { tally } from './gates.ts';
import { isHeadwordReviewKind } from './headword.ts';
import type { Tally, TruthEntry } from './types.ts';

const REPORT_PATH = 'data/source/migration-report.json';
const BLESSING_PATH = 'docs/v2/migration-blessing.md';

const GATE_NAMES = [
	'bodyRoundTrips',
	'headwordRoundTrip',
	'textConservation',
	'schema',
	'chain',
	'internalTargets',
	'slugs',
	'pages',
	'composition',
] as const;
type GateName = (typeof GATE_NAMES)[number];

type Bucket = 'patch' | 'pipeline' | 'review';
type Severity = 'fault' | 'review';

/** Whether a review row must be resolved before v2 is published
 * (consolidation spec §3.1.1). Faults carry none: they refuse the write. */
type Publication = 'blocks' | 'defer' | 'note';

/** One report row (consolidation spec §3.1): the one shape every
 * review item, patch re-judgment and pipeline fault shares, so a later
 * run can be diffed against this one and the admin tool can route rows
 * by `bucket`. */
interface ReportRow {
	bucket: Bucket;
	detail: string;
	kind: string;
	/** Stamped by `classifyRows` on `review` and `patch` rows only. */
	publication?: Publication;
	rid: string;
	severity: Severity;
}

/** A rule's tally over one run. COMPOSED: each rule sees the text the
 * rules before it left, so this is not `transform:count`'s rule-alone
 * figure. */
interface RuleCount {
	entries: number;
	fired: number;
	rule: string;
}

interface RuleCounter {
	add(rule: string, rid: string): void;
	rows(): RuleCount[];
}

type PatchOutcome = 'applied' | 'superseded' | DriftOutcome;

/** What happened to one patch the run offered to an entry (spec §3.3).
 * A patch that failed its apply gate has no outcome: it is a
 * `patch-failed` fault row and a red gate 9. */
interface PatchOutcomeRow {
	outcome: PatchOutcome;
	patchId: string;
	rid: string;
}

interface Report {
	entries: number;
	gates: Record<GateName, Tally>;
	/** Patch accounting (Ruling F; consolidation spec §4.2). Every skip
	 * is counted here as well as listed as a row. */
	patches: {
		absorbed: number;
		accepted: number;
		applied: number;
		carried: number;
		/** Human-authored patches loaded from `data/patches/reviewed/`
		 * (consolidation spec §4.2, step 8) — applied before `accepted`,
		 * counted separately since Ruling C keeps one manifest row per
		 * rid and a reviewed rid may also have an agent record. */
		reviewed: number;
		upstreamChanged: number;
		upstreamFixed: number;
	};
	patchOutcomes: PatchOutcomeRow[];
	quarantine: QuarantineRow[];
	rows: ReportRow[];
	rules: RuleCount[];
	/** collision size → number of stems of that size */
	slugCollisions: Record<string, number>;
	/** The snapshot this run read, and how many patches pin another one.
	 * A stale pin skips nothing; each patch is judged by its own
	 * precondition (spec §4.2). */
	snapshot: { pin: string; stalePins: number };
	unresolved: Unresolved[];
	written: number;
}

interface Sample {
	rid: string;
	source: unknown;
	truth: TruthEntry;
}

/** A report with every gate present and empty. Gates are created up
 * front so `gateRows` and `isGreen` always see the full set, and a
 * gate the run never reached shows as 0/0 rather than going missing. */
function createReport(): Report {
	const gates = Object.fromEntries(
		GATE_NAMES.map((name) => [name, tally()]),
	) as Record<GateName, Tally>;
	return {
		entries: 0,
		gates,
		patchOutcomes: [],
		patches: {
			absorbed: 0,
			accepted: 0,
			applied: 0,
			carried: 0,
			reviewed: 0,
			upstreamChanged: 0,
			upstreamFixed: 0,
		},
		quarantine: [],
		rows: [],
		rules: [],
		slugCollisions: {},
		snapshot: { pin: '', stalePins: 0 },
		unresolved: [],
		written: 0,
	};
}

/** A `rid: detail` line from `finishEntry` as a row. The rid is the
 * text before the FIRST `: ` — details themselves contain `: `. */
function lineRow(
	line: string,
	kind: string,
	bucket: Bucket = 'review',
	severity: Severity = 'review',
): ReportRow {
	const at = line.indexOf(': ');
	if (at === -1) {
		throw new Error(`report line has no "rid: " prefix: ${line}`);
	}
	return {
		bucket,
		detail: line.slice(at + 2),
		kind,
		rid: line.slice(0, at),
		severity,
	};
}

/** Per-rule tallies for one run. Every name given up front gets a row
 * even at 0 — a zero is information ("Sefaria fixed it" or "the rule
 * is dead", spec §3.1). A name seen but not given still gets a row,
 * after the given ones, so no firing is ever dropped. */
function createRuleCounter(names: readonly string[]): RuleCounter {
	const tallies = new Map<string, { fired: number; rids: Set<string> }>(
		names.map((name) => [name, { fired: 0, rids: new Set<string>() }]),
	);
	return {
		add(rule: string, rid: string): void {
			let t = tallies.get(rule);
			if (t === undefined) {
				t = { fired: 0, rids: new Set<string>() };
				tallies.set(rule, t);
			}
			t.fired++;
			t.rids.add(rid);
		},
		rows(): RuleCount[] {
			return [...tallies].map(([rule, t]) => ({
				entries: t.rids.size,
				fired: t.fired,
				rule,
			}));
		},
	};
}

/** Matching rows as `rid: detail`, in the order the run found them —
 * the same text the blessing doc rendered before rows existed. */
function rowLines(
	report: Report,
	match: (row: ReportRow) => boolean,
): string[] {
	return report.rows.filter(match).map((r) => `${r.rid}: ${r.detail}`);
}

function ruleRows(report: Report): string[] {
	return report.rules.map((r) => `| ${r.rule} | ${r.fired} | ${r.entries} |`);
}

/** Whether `--write` may proceed. A gate must have been REACHED, not
 * merely free of failures: an empty tally is a gate that never ran,
 * which is not evidence of anything. `internalTargets` is the one
 * exemption — a corpus with nothing quarantined leaves it legitimately
 * 0/0 — so its failure list is all that guards it. */
function isGreen(report: Report): boolean {
	if (report.entries === 0) {
		return false;
	}
	return GATE_NAMES.every((name) => {
		const t = report.gates[name];
		const reached = name === 'internalTargets' || t.total > 0;
		return reached && t.pass === t.total && t.failures.length === 0;
	});
}

/** Write the report as tab-indented JSON with a trailing newline. */
async function writeReport(report: Report, path = REPORT_PATH): Promise<void> {
	await Bun.write(path, `${JSON.stringify(report, null, '\t')}\n`);
}

/** One value as a fenced JSON block for the blessing document. */
function fence(value: unknown): string {
	return `\`\`\`json\n${JSON.stringify(value, null, '\t')}\n\`\`\``;
}

/** Markdown bullets, or an italicised `empty` when there are none —
 * so an empty section still says so rather than rendering blank. */
function list(lines: readonly string[], empty: string): string {
	return lines.length === 0
		? `_${empty}_`
		: lines.map((l) => `- ${l}`).join('\n');
}

/** One markdown table row per gate: pass, total, failure count. */
function gateRows(report: Report): string[] {
	return GATE_NAMES.map(
		(name) =>
			`| ${name} | ${report.gates[name].pass} / ${report.gates[name].total} | ${report.gates[name].failures.length} |`,
	);
}

/** Slug-collision rows, smallest family first. Keys arrive as
 * strings from the JSON object, so the sort is numeric, not lexical. */
function collisionRows(report: Report): string[] {
	return Object.entries(report.slugCollisions)
		.sort(([a], [b]) => Number(a) - Number(b))
		.map(([size, count]) => `| ${size} | ${count} |`);
}

/** A source/truth pair per sample, for eyeballing the migration
 * against its input without leaving the blessing document. */
function sampleSections(samples: readonly Sample[]): string[] {
	return samples.flatMap((s) => [
		`### ${s.rid}`,
		'',
		'Source (composed):',
		'',
		fence(s.source),
		'',
		'Truth:',
		'',
		fence(s.truth),
		'',
	]);
}

/** The whole blessing document: the evidence a human reads before
 * accepting a run. Every list renders, empty or not, so a missing
 * section means a bug rather than a quiet nothing-to-report. */
function renderBlessing(report: Report, samples: readonly Sample[]): string {
	return [
		'# Migration blessing — evidence',
		'',
		`Generated by \`bun data:import\` over ${report.entries} entries. ${isGreen(report) ? 'Every gate is green.' : 'At least one gate is RED.'}`,
		'',
		`Snapshot \`${report.snapshot.pin}\`: ${report.snapshot.stalePins} patch(es) pinned to a different snapshot, each judged by its own \`expected_before\`.`,
		'',
		`Patch corpus: ${report.patches.reviewed} reviewed, ${report.patches.accepted} accepted, ${report.patches.applied} applied, ${report.patches.absorbed} carry-over absorbed, ${report.patches.carried} carried, ${report.patches.upstreamFixed} upstream-fixed, ${report.patches.upstreamChanged} upstream-changed.`,
		'',
		'## Gates',
		'',
		'| Gate | pass / total | failures |',
		'|---|---|---|',
		...gateRows(report),
		'',
		'## Pipeline faults',
		'',
		list(
			rowLines(report, (r) => r.severity === 'fault'),
			'none',
		),
		'',
		'## Headword review',
		'',
		list(
			// EVERY headword kind, from the detector's own list: the
			// multi-word split is about how the review report CLASSIFIES a
			// row, and the evidence doc still shows every form the detector
			// looked twice at. Naming the kinds here by hand would let a
			// third one drop out of this document unnoticed.
			rowLines(report, (r) => isHeadwordReviewKind(r.kind)),
			'none',
		),
		'',
		'## Markup carried across unit boundaries',
		'',
		list(
			rowLines(report, (r) => r.kind === 'markup-carry'),
			'none',
		),
		'',
		'## Page placements needing review',
		'',
		list(
			rowLines(report, (r) => r.kind.startsWith('page-confidence-')),
			'none',
		),
		'',
		'## Patches needing re-judgment',
		'',
		list(
			rowLines(report, (r) => r.bucket === 'patch'),
			'none',
		),
		'',
		'## Rule counts',
		'',
		'Composed counts: each rule sees the text the rules before it left.',
		'',
		'| rule | fired | entries |',
		'|---|---|---|',
		...ruleRows(report),
		'',
		'## Slug collisions',
		'',
		'| members per stem | stems |',
		'|---|---|',
		...collisionRows(report),
		'',
		'## Quarantined internal targets',
		'',
		list(
			report.quarantine.map((q) => `${q.rid} → \`${q.target}\` — ${q.note}`),
			'none',
		),
		'',
		'## Samples',
		'',
		...sampleSections(samples),
	].join('\n');
}

export type {
	GateName,
	PatchOutcome,
	PatchOutcomeRow,
	Publication,
	Report,
	ReportRow,
	RuleCount,
	RuleCounter,
	Sample,
};
export {
	BLESSING_PATH,
	createReport,
	createRuleCounter,
	GATE_NAMES,
	isGreen,
	lineRow,
	REPORT_PATH,
	renderBlessing,
	writeReport,
};
