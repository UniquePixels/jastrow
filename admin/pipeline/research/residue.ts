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
import { byCodeUnit } from '../transform/rules/point-claims.ts';
import { applyTransforms } from '../transform/run.ts';
import {
	type AnomalyHint,
	buildAbbrevTable,
	entryAnomalyHints,
} from './anomalies.ts';
import { buildHeadwordIndex } from './headword-index.ts';
import { buildHebrewTable } from './hebrew-anomalies.ts';

/** The pinned snapshot, read directly rather than through
 * `corpus-fixture.ts`: this is a script, not a test, so nothing else
 * in the process shares the memo. */
const SOURCE = 'data/source/jastrow-dictionary.jsonl';

/** The three corpus-wide comparison tables the detector reads. */
interface Tables {
	abbrev: ReturnType<typeof buildAbbrevTable>;
	hebrew: ReturnType<typeof buildHebrewTable>;
	index: ReturnType<typeof buildHeadwordIndex>;
}

/** Build all three tables from one corpus state. Taking the whole
 * corpus at once is the point: each table is a frequency comparison
 * across every entry, so a table built from a subset would judge an
 * entry against a different population than the detector does. */
function buildTables(entries: readonly SourceEntry[]): Tables {
	return {
		abbrev: buildAbbrevTable(entries.values()),
		hebrew: buildHebrewTable(entries.values()),
		index: buildHeadwordIndex(entries.values()),
	};
}

/** One hint's identity across two readings: its kind and its detail
 * string, joined. The detail is part of the identity because the
 * detector's complaint can change while its kind does not, and a
 * comparison watching only the kind calls such a pair of readings
 * identical. That is not hypothetical: it is how the 29 `v. sub`
 * false positives hid, on entries that kept an `abbrev-mislink`
 * throughout and only swapped which mislink it was. */
type HintKey = string;

function hintKey(hint: AnomalyHint): HintKey {
	return `${hint.kind}|${hint.detail}`;
}

function kindOf(key: HintKey): string {
	return key.slice(0, key.indexOf('|'));
}

/** One residue reading. Entries and hints are reported separately
 * because they answer different questions: entries size the sweep's
 * work queue, hints size what an agent has to read inside it.
 *
 * Everything here is identities rather than counts. A count cannot
 * be differenced: a kind whose total barely moves can have swapped
 * its membership out from under the number, and which entries and
 * which hints moved is what says whether a rise is a real finding or
 * a detector reading its own repair. */
interface Measurement {
	/** Every hint, keyed by the `rid` carrying it. */
	byRid: Map<string, Set<HintKey>>;
}

/** Run the detector over a corpus against a given set of tables.
 * The two are separate arguments so a POST corpus can be measured
 * against PRE tables — see the module comment on why both readings
 * are reported. */
function measure(corpus: readonly SourceEntry[], tables: Tables): Measurement {
	const byRid = new Map<string, Set<HintKey>>();
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
		byRid.set(entry.rid, new Set(found.map(hintKey)));
	}
	return { byRid };
}

/** Entries carrying at least one hint — the residue itself. */
function entryCount(m: Measurement): number {
	return m.byRid.size;
}

/** Hints, not entries: the sweep's reading load. */
function hintCount(m: Measurement): number {
	let n = 0;
	for (const keys of m.byRid.values()) {
		n += keys.size;
	}
	return n;
}

/** The `rid`s carrying at least one hint OF THAT KIND. Kinds overlap
 * on an entry, so these do not sum to the entry count. */
function ridsByKind(m: Measurement): Map<string, Set<string>> {
	const out = new Map<string, Set<string>>();
	for (const [rid, keys] of m.byRid) {
		for (const kind of new Set([...keys].map(kindOf))) {
			let rids = out.get(kind);
			if (rids === undefined) {
				rids = new Set();
				out.set(kind, rids);
			}
			rids.add(rid);
		}
	}
	return out;
}

/** Hints present in `b` and absent from `a`, as `rid` -> keys. Read
 * one way this is what a sweep gained; read the other way (arguments
 * swapped) it is what the rules retired. */
function hintGains(a: Measurement, b: Measurement): Map<string, string[]> {
	const out = new Map<string, string[]>();
	for (const [rid, keys] of b.byRid) {
		const had = a.byRid.get(rid) ?? new Set<HintKey>();
		const gained = [...keys].filter((k) => !had.has(k));
		if (gained.length > 0) {
			out.set(rid, gained);
		}
	}
	return out;
}

/** An explicit sign on a delta, so a zero column reads as `+0`
 * rather than going quiet next to the signed ones. */
function signed(n: number): string {
	return n >= 0 ? `+${n}` : String(n);
}

if (import.meta.main) {
	const pre: SourceEntry[] = [];
	for await (const source of readSourceEntries(SOURCE)) {
		pre.push(applyRepairs(source).entry);
	}
	// Phase order is migrate-dry's (spec §5): text repairs, then
	// structural. Running them the other way measures a pipeline that
	// does not exist.
	//
	// The rule ids are kept alongside because a rise is only
	// diagnosable with them: `roman-numeral-display` was a detector
	// reading `anchor-swallows-close-paren`'s output, and naming the
	// rule is what turned 484 entries from a mystery into a carve-out.
	const rulesByRid = new Map<string, string[]>();
	const post = pre.map((entry) => {
		const text = applyTransforms(entry, 'text-repairs');
		const structural = applyTransforms(text.entry, 'structural-repairs');
		rulesByRid.set(
			entry.rid,
			[...text.records, ...structural.records].map((r) => r.ruleId),
		);
		return structural.entry;
	});

	const preTables = buildTables(pre);
	const postTables = buildTables(post);
	const before = measure(pre, preTables);
	const afterFixedTables = measure(post, preTables);
	const after = measure(post, postTables);

	const pct = (n: number): string => ((n / pre.length) * 100).toFixed(1);
	const row = (label: string, m: Measurement): string =>
		`${label.padEnd(34)}${String(entryCount(m)).padStart(6)} entries (${pct(entryCount(m)).padStart(4)}%)  ${String(hintCount(m)).padStart(6)} hints`;

	console.log(`corpus: ${pre.length} entries\n`);
	console.log(row('PRE  (repairs only)', before));
	console.log(row('POST (+rules, PRE tables)', afterFixedTables));
	console.log(row('POST (+rules, POST tables)', after));
	const delta = entryCount(after) - entryCount(before);
	console.log(
		`\nresidue delta: ${delta} entries (${((delta / entryCount(before)) * 100).toFixed(1)}%)\n`,
	);

	const preByKind = ridsByKind(before);
	const midByKind = ridsByKind(afterFixedTables);
	const postByKind = ridsByKind(after);
	const kinds = [
		...new Set([
			...preByKind.keys(),
			...midByKind.keys(),
			...postByKind.keys(),
		]),
		// Code-unit order, not `localeCompare` (Sonar S2871): this table
		// is committed to a report, so it must not reorder on a machine
		// carrying different ICU data. Same call batch 10 settled on.
	].sort(byCodeUnit);

	// Three columns, not two. A kind's net delta is the sum of an
	// entry-side move (a transform changed the entry) and a table-side
	// move (a transform changed what the corpus counts as normal), and
	// the two can point opposite ways and cancel. `bare-abbrev` is the
	// worked example: 395 -> 326 on the entry side, then +19 handed
	// back by the tables. A single PRE -> POST column reports -50 and
	// shows neither half.
	console.log(
		'by kind (entries carrying it): PRE -> POST/PRE-tables -> POST/POST-tables',
	);
	for (const kind of kinds) {
		const a = preByKind.get(kind)?.size ?? 0;
		const mid = midByKind.get(kind)?.size ?? 0;
		const b = postByKind.get(kind)?.size ?? 0;
		console.log(
			`  ${kind.padEnd(24)}${String(a).padStart(6)} ->${String(mid).padStart(6)} ->${String(b).padStart(6)}  net ${signed(b - a)}  (entry ${signed(mid - a)}, tables ${signed(b - mid)})`,
		);
	}

	// Every hint the rules created ON THE ENTRY SIDE, whether or not
	// it changed which kinds an entry carries. This is the population
	// a pre-sweep re-check has to open: `roman-numeral-display` was a
	// detector reading `anchor-swallows-close-paren`'s output, and a
	// rise is the only symptom that defect shows. The kind-level view
	// above is strictly narrower — an entry that keeps its
	// `abbrev-mislink` and swaps which mislink it is appears here and
	// not there.
	//
	// Deliberately entry-side only. The tables move as well, but a
	// hint identity cannot measure that move: a frequency hint's
	// detail quotes the very counts the tables hold ("bare 'v' where
	// the corpus writes 'v.' 36429x vs bare 6x"), so every such hint
	// is renamed by any table shift and a hint-level diff of the two
	// POST readings reports 400 creations for a net of +22. The
	// table-side move is real and is reported where it is
	// measurable — the `tables` column of the by-kind table above.
	const gained = hintGains(before, afterFixedTables);
	const gainedHints = [...gained.values()].reduce((n, g) => n + g.length, 0);
	console.log(
		`\nhints the rules created (PRE vs POST/PRE-tables): ${gainedHints} on ${gained.size} entries`,
	);
	const gainsByKind = new Map<string, number>();
	for (const keys of gained.values()) {
		for (const kind of keys.map(kindOf)) {
			gainsByKind.set(kind, (gainsByKind.get(kind) ?? 0) + 1);
		}
	}
	for (const kind of [...gainsByKind.keys()].sort(byCodeUnit)) {
		const kindGain = [...(midByKind.get(kind) ?? [])].filter(
			(rid) => !(preByKind.get(kind) ?? new Set<string>()).has(rid),
		).length;
		console.log(
			`  ${kind.padEnd(24)}${String(gainsByKind.get(kind)).padStart(4)} hints on entries new to the kind: ${kindGain}`,
		);
	}

	// Which rules fired on the entries that gained a hint. A rule at
	// the top of this list did not necessarily cause the gains — a
	// rule that fires on half the corpus will surface here by volume
	// alone — so the enrichment column, its share of the gained set
	// over its share of the corpus, is the one to read.
	const firedOnGained = new Map<string, number>();
	const firedOnCorpus = new Map<string, number>();
	for (const [rid, ids] of rulesByRid) {
		for (const id of new Set(ids)) {
			firedOnCorpus.set(id, (firedOnCorpus.get(id) ?? 0) + 1);
			if (gained.has(rid)) {
				firedOnGained.set(id, (firedOnGained.get(id) ?? 0) + 1);
			}
		}
	}
	console.log('\n  rules firing on those entries:');
	const ranked = [...firedOnGained].sort(
		(x, y) => y[1] - x[1] || byCodeUnit(x[0], y[0]),
	);
	for (const [id, n] of ranked) {
		const corpusWide = firedOnCorpus.get(id) ?? 0;
		const enrich = (n / gained.size / (corpusWide / rulesByRid.size)).toFixed(
			1,
		);
		console.log(
			`    ${id.padEnd(46)}${String(n).padStart(4)} of ${String(gained.size).padStart(3)}  (${corpusWide} corpus-wide, ${enrich}x)`,
		);
	}

	// The identities, so the re-check has somewhere to start.
	console.log('\n  the entries, with what each gained:');
	for (const rid of [...gained.keys()].sort(byCodeUnit)) {
		for (const key of (gained.get(rid) ?? []).sort(byCodeUnit)) {
			console.log(`    ${rid}  ${key.slice(0, 150)}`);
		}
	}
}

export type { Measurement, Tables };
export { buildTables, measure };
