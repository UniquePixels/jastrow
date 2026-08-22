/**
 * The corpus-count audit (spec §4). TEST-TIER — `migrate.ts` never
 * calls this and never reads a catalogue count.
 *
 * Each rule runs ALONE against the pinned snapshot. Composed counts
 * would be meaningless: rule 40's count drifts because rules 1–39
 * already edited the text.
 *
 * When the snapshot moves, this SKIPS rather than reporting up to 81
 * false mismatches. Re-pinning is a deliberate re-baseline, not a
 * break.
 *
 * `hit` below counts ENTRIES a rule touches, not instances within
 * them — a rule that fires three times inside one entry still counts
 * once. This matches the catalogue's `corpusCount`, which is an entry
 * count for the batch-1 rows (audit reports confirm `bare-rtl-hebrew`
 * is "4,472 senses / 4,190 entries" and its `corpusCount` is 4,190).
 *
 * The corpus (32,512 entries, ~41 MB) is read into memory once up
 * front and every rule loops over that array, rather than
 * re-streaming `readSourceEntries()` once per rule. Streaming scales
 * with rule count — file I/O and JSON parsing repeated 81 times — so
 * as the registry grows toward 81 rules that would dominate the run.
 * The parsed corpus fits comfortably in memory, so paying the
 * streaming cost once and looping rules over the array in memory is
 * the cheaper trade.
 *
 * Run: bun transform:count
 */
import { readSourceEntries } from '../body/source.ts';
import type { SourceEntry } from '../body/types.ts';
import { computeSnapshot, LOCK_PATH, parseLock } from '../patch/snapshot.ts';
import type { Pattern } from '../research/patterns.ts';
import { parsePatterns } from '../research/patterns.ts';
import { RULES } from './registry.ts';
import type { Rule } from './types.ts';

const PATTERNS_PATH = 'data/patches/patterns.jsonl';

/** Read the corpus once into memory (see module doc above) rather than
 * re-streaming `readSourceEntries()` once per rule. */
async function loadCorpus(): Promise<SourceEntry[]> {
	const entries: SourceEntry[] = [];
	for await (const entry of readSourceEntries()) {
		entries.push(entry);
	}
	return entries;
}

/** Count of ENTRIES the rule touches, not instances within them — a
 * rule firing three times inside one entry still counts once (see
 * module doc above). */
function measure(rule: Rule, entries: readonly SourceEntry[]): number {
	let hit = 0;
	for (const entry of entries) {
		if (rule.apply(entry).records.length > 0) {
			hit++;
		}
	}
	return hit;
}

/** One rule's report line, plus whether it is a mismatch. */
function reportRow(
	rule: Rule,
	hit: number,
	expected: number,
): { line: string; mismatch: boolean } {
	const delta = hit - expected;
	const verdict =
		delta === 0 ? 'MATCH' : `DELTA ${delta > 0 ? '+' : ''}${delta}`;
	const line = `${rule.id.padEnd(38)} measured(entries)=${String(hit).padStart(5)} catalogued=${String(expected).padStart(5)}  ${verdict}`;
	return { line, mismatch: delta !== 0 };
}

async function main(): Promise<void> {
	const pinned = parseLock(await Bun.file(LOCK_PATH).text());
	const actual = await computeSnapshot();
	if (pinned.combined !== actual.combined) {
		console.log(
			`pinned snapshot stale — lock sha256:${pinned.combined}, source sha256:${actual.combined}.\n` +
				'Counts are measured against the pinned corpus; skipping.\n' +
				'Re-baseline deliberately, then re-run.',
		);
		return;
	}
	const catalogue = new Map<string, Pattern>(
		parsePatterns(await Bun.file(PATTERNS_PATH).text()).map((row) => [
			row.id,
			row,
		]),
	);
	const entries = await loadCorpus();
	let mismatches = 0;
	for (const rule of RULES) {
		const expected = catalogue.get(rule.id)?.corpusCount ?? -1;
		const { line, mismatch } = reportRow(
			rule,
			measure(rule, entries),
			expected,
		);
		if (mismatch) {
			mismatches++;
		}
		console.log(line);
	}
	console.log(`\n${RULES.length} rule(s), ${mismatches} mismatch(es).`);
	if (mismatches > 0) {
		console.log(
			'A mismatch is a FINDING, not a failure to suppress: correct the\n' +
				"row's corpusCount and reason in patterns.jsonl, or reclassify it.",
		);
	}
}

await main();
