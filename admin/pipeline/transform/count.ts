/**
 * The corpus-count audit (spec §4). TEST-TIER — `migrate.ts` never
 * calls this and never reads a catalogue count.
 *
 * Each rule runs ALONE against the pinned snapshot. Composed counts
 * would be meaningless: rule 40's count drifts because rules 1–39
 * already edited the text.
 *
 * When the snapshot moves, this SKIPS rather than reporting up to 80
 * false mismatches. Re-pinning is a deliberate re-baseline, not a
 * break.
 *
 * `hit` below counts ENTRIES a rule touches, not instances within
 * them — a rule that fires three times inside one entry still counts
 * once. `corpusCount` is an entry count for MOST rows — verified for
 * `bare-rtl-hebrew`, whose committed `corpusCount` is 4,189 entries
 * (4,471 senses), CORRECTED from the audit's 4,190 when the transform
 * was written: the old figure was a +1/−1 cancellation, not agreement
 * — but not all of them: `ascii-gershayim-outside-body-text`
 * (`corpusCount` 409) documents itself in patterns.jsonl as "COUNT IS
 * OCCURRENCES ACROSS SEVEN FIELD SLOTS, NOT ENTRIES." A DELTA against
 * a row like that is not a harness bug to chase — it is the designed
 * unit-mismatch finding (spec §4.2) for whoever writes that rule to
 * triage, not evidence this measurement is wrong.
 *
 * The corpus (32,512 entries, ~41 MB) is read into memory once up
 * front and every rule loops over that array, rather than
 * re-streaming `readSourceEntries()` once per rule. Streaming scales
 * with rule count — file I/O and JSON parsing repeated 80 times — so
 * as the registry grows toward 80 rules that would dominate the run.
 * The parsed corpus fits comfortably in memory, so paying the
 * streaming cost once and looping rules over the array in memory is
 * the cheaper trade.
 *
 * `loadCorpus()` recursively freezes every entry after parsing.
 * `Rule.apply` MUST treat its input as immutable (spec + `types.ts`
 * doc on `Rule.apply`) — an in-place mutator would otherwise corrupt
 * every later rule's measurement against this same shared array
 * within one run, a live instance of the "composed counts are
 * meaningless" failure this harness exists to prevent, introduced by
 * the load-once optimization above rather than by rule chaining. The
 * freeze turns that silent corruption into an immediate `TypeError`
 * naming the mutating call (ESM is strict mode).
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

/** Recursively freezes a parsed entry (and every nested object and
 * array it holds — `content.senses[]`, each sense's `grammar` and
 * nested `senses[]`, `quotes[]`, `alt_headwords`, `plural_form`,
 * `refs` — by walking own keys generically rather than naming fields,
 * so it stays correct if a field is added) so an in-place mutation by
 * a rule throws a `TypeError` immediately instead of silently
 * corrupting every later rule's measurement against the same shared
 * array (see module doc above, and the purity clause on `Rule.apply`
 * in `types.ts`). */
function deepFreeze<T>(value: T): T {
	if (value === null || typeof value !== 'object' || Object.isFrozen(value)) {
		return value;
	}
	Object.freeze(value);
	for (const key of Object.keys(value)) {
		deepFreeze((value as Record<string, unknown>)[key]);
	}
	return value;
}

/** Read the corpus once into memory (see module doc above) rather than
 * re-streaming `readSourceEntries()` once per rule, freezing each
 * entry so a mutating rule fails loudly instead of silently. */
async function loadCorpus(): Promise<SourceEntry[]> {
	const entries: SourceEntry[] = [];
	for await (const entry of readSourceEntries()) {
		entries.push(deepFreeze(entry));
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
