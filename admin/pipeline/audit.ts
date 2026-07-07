/**
 * Stage 2 — divergence audit (spec 1.2). Compares the fresh source
 * snapshot against the legacy extraction that main's data/raw carries
 * (removed from v2, so it is read from git) and writes
 * data/source/divergence-report.json.
 *
 * The legacy extraction added `page` and `column` to every entry —
 * fields Sefaria's lexicon schema does not define. They are censused,
 * then stripped before entry comparison so `changed` reflects real
 * content drift rather than the known enrichment.
 */
import {
	type CompareResult,
	compareEntryMaps,
	type SourceEntry,
} from './compare-entries.ts';

const REPORT_PATH = 'data/source/divergence-report.json';
const FRESH_PATH = 'data/source/jastrow-dictionary.jsonl';
const RAW_GIT_PATHS = [
	'origin/main:data/raw/jastrow-part1.jsonl',
	'origin/main:data/raw/jastrow-part2.jsonl',
];
const LEGACY_ENRICHMENTS = ['page', 'column'] as const;

/** JSON.stringify with recursively sorted object keys. */
const canon = (v: unknown): string =>
	JSON.stringify(v, (_k, val: unknown) =>
		val !== null && typeof val === 'object' && !Array.isArray(val)
			? Object.fromEntries(
					Object.entries(val).sort(([a], [b]) => a.localeCompare(b)),
				)
			: val,
	) ?? 'null';

interface FieldCensusRow {
	field: string;
	onlyInFresh: number;
	onlyInRaw: number;
	valueDiff: number;
}

interface DivergenceReport extends CompareResult {
	fieldCensus: FieldCensusRow[];
	inputs: { fresh: string; raw: string[] };
	strippedBeforeCompare: readonly string[];
}

function addLines(map: Map<string, SourceEntry>, text: string): void {
	for (const line of text.split('\n')) {
		if (!line.trim()) {
			continue;
		}
		const { _id, ...rest } = JSON.parse(line) as SourceEntry & {
			_id?: unknown;
		};
		map.set(rest.rid, rest);
	}
}

async function loadFresh(path: string): Promise<Map<string, SourceEntry>> {
	const map = new Map<string, SourceEntry>();
	addLines(map, await Bun.file(path).text());
	return map;
}

async function loadRawFromGit(
	gitPaths: string[],
): Promise<Map<string, SourceEntry>> {
	const map = new Map<string, SourceEntry>();
	for (const gitPath of gitPaths) {
		const proc = Bun.spawn(['git', 'show', gitPath], { stderr: 'pipe' });
		const text = await new Response(proc.stdout).text();
		if ((await proc.exited) !== 0) {
			throw new Error(
				`git show ${gitPath} failed: ${await new Response(proc.stderr).text()}`,
			);
		}
		addLines(map, text);
	}
	return map;
}

/** Tally one shared entry's fields into the census rows. */
function censusEntry(
	rows: Map<string, FieldCensusRow>,
	freshEntry: SourceEntry,
	rawEntry: SourceEntry,
): void {
	const row = (field: string): FieldCensusRow => {
		let r = rows.get(field);
		if (!r) {
			r = { field, onlyInRaw: 0, onlyInFresh: 0, valueDiff: 0 };
			rows.set(field, r);
		}
		return r;
	};
	for (const field of new Set([
		...Object.keys(freshEntry),
		...Object.keys(rawEntry),
	])) {
		const inFresh = field in freshEntry;
		const inRaw = field in rawEntry;
		if (inFresh && !inRaw) {
			row(field).onlyInFresh++;
		} else if (!inFresh && inRaw) {
			row(field).onlyInRaw++;
		} else if (canon(freshEntry[field]) !== canon(rawEntry[field])) {
			row(field).valueDiff++;
		}
	}
}

/** Per-field presence and value-difference counts across shared rids. */
function fieldCensus(
	freshEntries: Map<string, SourceEntry>,
	rawEntries: Map<string, SourceEntry>,
): FieldCensusRow[] {
	const rows = new Map<string, FieldCensusRow>();
	for (const [rid, freshEntry] of freshEntries) {
		const rawEntry = rawEntries.get(rid);
		if (rawEntry) {
			censusEntry(rows, freshEntry, rawEntry);
		}
	}
	return [...rows.values()].sort((a, b) => a.field.localeCompare(b.field));
}

const fresh: Map<string, SourceEntry> = await loadFresh(FRESH_PATH);
const raw: Map<string, SourceEntry> = await loadRawFromGit(RAW_GIT_PATHS);

const census: FieldCensusRow[] = fieldCensus(fresh, raw);

for (const entry of raw.values()) {
	for (const field of LEGACY_ENRICHMENTS) {
		delete entry[field];
	}
}
const result: CompareResult = compareEntryMaps(fresh, raw);

const report: DivergenceReport = {
	fieldCensus: census,
	inputs: { fresh: FRESH_PATH, raw: RAW_GIT_PATHS },
	strippedBeforeCompare: LEGACY_ENRICHMENTS,
	...result,
};
await Bun.write(REPORT_PATH, `${JSON.stringify(report, null, '\t')}\n`);

console.log(
	`fresh=${fresh.size} raw=${raw.size} onlyInFresh=${result.onlyInFresh.length} onlyInRaw=${result.onlyInRaw.length} changed=${result.changed.length}`,
);
for (const c of census) {
	if (c.onlyInRaw || c.onlyInFresh || c.valueDiff) {
		console.log(
			`  ${c.field}: onlyInRaw=${c.onlyInRaw} onlyInFresh=${c.onlyInFresh} valueDiff=${c.valueDiff}`,
		);
	}
}
console.log(`report written to ${REPORT_PATH}`);
