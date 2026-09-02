/**
 * Sweep tiering 2.2 — "re-run the structural detector after the rules
 * land; measure the residue."
 *
 * ## What it measures
 *
 * An entry is IN the residue when `entryAnomalyHints()` returns at
 * least one hint for it. That is the same call `tranche.ts`'s `prep`
 * makes to build chunk inputs, so the number this prints is the size
 * of the population a 2.3 sweep would actually be handed — not a
 * proxy for it.
 *
 * PRE is the corpus after `applyRepairs` and nothing else, which is
 * what `loadPrePatchCorpus()` returns and what every discovery round
 * was measured against. POST adds the two transform phases in the
 * order `migrate-dry.ts` runs them.
 *
 * ## Why the table variants exist
 *
 * `entryAnomalyHints` judges an entry against corpus-wide frequency
 * tables built FROM the corpus, so a transform moves both sides of
 * the comparison at once. Rebuilding the tables from the healed
 * corpus is the honest POST measurement — it is what a sweep run
 * after the rules would see. Holding the PRE tables fixed isolates
 * the entry-side change from the table drift; the gap between the two
 * is small (18 entries at the time of writing) and reporting both is
 * what keeps a future drift from hiding inside one number.
 *
 * Run: bun research:residue
 */
import { applyRepairs } from '../body/repairs.ts';
import { readSourceEntries } from '../body/source.ts';
import type { SourceEntry } from '../body/types.ts';
import { applyTransforms } from '../transform/run.ts';
import {
	type AnomalyHint,
	buildAbbrevTable,
	entryAnomalyHints,
} from './anomalies.ts';
import { buildHeadwordIndex } from './headword-index.ts';
import { buildHebrewTable } from './hebrew-anomalies.ts';

const SOURCE = 'data/source/jastrow-dictionary.jsonl';

/** The three corpus-wide comparison tables the detector reads. */
interface Tables {
	abbrev: ReturnType<typeof buildAbbrevTable>;
	hebrew: ReturnType<typeof buildHebrewTable>;
	index: ReturnType<typeof buildHeadwordIndex>;
}

function buildTables(entries: readonly SourceEntry[]): Tables {
	return {
		abbrev: buildAbbrevTable(entries.values()),
		hebrew: buildHebrewTable(entries.values()),
		index: buildHeadwordIndex(entries.values()),
	};
}

interface Measurement {
	/** Entries carrying at least one hint — the residue itself. */
	entries: number;
	/** Entries carrying at least one hint OF THAT KIND, keyed by kind.
	 * Kinds overlap on an entry, so these do not sum to `entries`. */
	entriesByKind: Map<string, number>;
	/** Hints, not entries: the sweep's reading load. */
	hints: number;
}

function measure(corpus: readonly SourceEntry[], tables: Tables): Measurement {
	const entriesByKind = new Map<string, number>();
	let entries = 0;
	let hints = 0;
	for (const entry of corpus) {
		const found: AnomalyHint[] = entryAnomalyHints(
			entry,
			tables.abbrev,
			tables.index,
			tables.hebrew,
		);
		if (found.length === 0) {
			continue;
		}
		entries += 1;
		hints += found.length;
		for (const kind of new Set(found.map((hint) => hint.kind))) {
			entriesByKind.set(kind, (entriesByKind.get(kind) ?? 0) + 1);
		}
	}
	return { entries, entriesByKind, hints };
}

if (import.meta.main) {
	const pre: SourceEntry[] = [];
	for await (const source of readSourceEntries(SOURCE)) {
		pre.push(applyRepairs(source).entry);
	}
	// Phase order is migrate-dry's (spec §5): text repairs, then
	// structural. Running them the other way measures a pipeline that
	// does not exist.
	const post = pre.map(
		(entry) =>
			applyTransforms(
				applyTransforms(entry, 'text-repairs').entry,
				'structural-repairs',
			).entry,
	);

	const preTables = buildTables(pre);
	const postTables = buildTables(post);
	const before = measure(pre, preTables);
	const afterFixedTables = measure(post, preTables);
	const after = measure(post, postTables);

	const pct = (n: number): string => ((n / pre.length) * 100).toFixed(1);
	const row = (label: string, m: Measurement): string =>
		`${label.padEnd(34)}${String(m.entries).padStart(6)} entries (${pct(m.entries).padStart(4)}%)  ${String(m.hints).padStart(6)} hints`;

	console.log(`corpus: ${pre.length} entries\n`);
	console.log(row('PRE  (repairs only)', before));
	console.log(row('POST (+rules, PRE tables)', afterFixedTables));
	console.log(row('POST (+rules, POST tables)', after));
	console.log(
		`\nresidue delta: ${after.entries - before.entries} entries (${(((after.entries - before.entries) / before.entries) * 100).toFixed(1)}%)\n`,
	);

	console.log('by kind (entries carrying it), PRE -> POST:');
	const kinds = [
		...new Set([...before.entriesByKind.keys(), ...after.entriesByKind.keys()]),
	].sort();
	for (const kind of kinds) {
		const a = before.entriesByKind.get(kind) ?? 0;
		const b = after.entriesByKind.get(kind) ?? 0;
		const delta = b - a;
		console.log(
			`  ${kind.padEnd(24)}${String(a).padStart(6)} -> ${String(b).padStart(6)}  ${delta >= 0 ? '+' : ''}${delta}`,
		);
	}
}

export type { Measurement, Tables };
export { buildTables, measure };
