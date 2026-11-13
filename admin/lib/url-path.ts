/**
 * The URL of an entry, computed from its primary headword (ruling
 * `11-13 url words`; spec `docs/specs/2026-11-13-url-words-design.md`
 * §4). The path is never stored: it is derived from `headwords[0]` and
 * the rid every time it is needed, so it cannot drift from the headword.
 */
import { compareByCodeUnit } from './compare-by-code-unit.ts';
import { toComparisonForm } from './hebrew.ts';

const NOT_KEPT = /[^א-ת־׳״\s]/gu;

/** What a URL word is read from: an entry's id and its headword
 * texts, `headwords[0]` the one that counts. Structural, so this file
 * imports no entry module and the app can take a copy of it. */
type UrlWordSource = readonly {
	readonly headwords: readonly { readonly text: string }[];
	readonly id: string;
}[];

/** One entry whose URL word is empty, with the line that reports it. */
interface EmptyUrlWord {
	line: string;
	rid: string;
}

/** The URL word for one headword text: its comparison form
 * (`toComparisonForm`) cut to its letters, maqaf, geresh and gershayim,
 * with each run of whitespace joined as one `_`. Cutting can leave two
 * spaces side by side, so the runs are joined after it. */
function toUrlWord(text: string): string {
	return toComparisonForm(text)
		.replace(NOT_KEPT, '')
		.trim()
		.replace(/\s+/gu, '_');
}

/** rid to path for every entry. Entries sharing a word are numbered
 * 1..n in rid order, whatever order they arrive in; 1 is `/<word>`,
 * the rest `/<word>-<n>`. */
function buildEntryPaths(entries: UrlWordSource): Map<string, string> {
	const byWord = new Map<string, string[]>();
	for (const entry of entries) {
		const word = toUrlWord(entry.headwords[0]?.text ?? '');
		const ids = byWord.get(word) ?? [];
		ids.push(entry.id);
		byWord.set(word, ids);
	}
	const paths = new Map<string, string>();
	for (const [word, ids] of byWord) {
		for (const [index, id] of ids.sort(compareByCodeUnit).entries()) {
			paths.set(id, index === 0 ? `/${word}` : `/${word}-${index + 1}`);
		}
	}
	return new Map([...paths].sort(([a], [b]) => compareByCodeUnit(a, b)));
}

/** The entries whose URL word is empty, in the order given, each with
 * the one line both the import gate and the validator report it by: a
 * headword that is all notation (`(?)`) keeps no letter, so its entry
 * would be reachable by no URL. An entry with no forms counts as empty.
 * The one address check left: a shared word is numbered, not refused. */
function findEmptyUrlWords(entries: UrlWordSource): EmptyUrlWord[] {
	return entries
		.filter((entry) => toUrlWord(entry.headwords[0]?.text ?? '') === '')
		.map((entry) => ({
			line: `${entry.id}: URL word is empty from ${JSON.stringify(entry.headwords[0]?.text ?? null)}`,
			rid: entry.id,
		}));
}

export type { EmptyUrlWord, UrlWordSource };
export { buildEntryPaths, findEmptyUrlWords, toUrlWord };
