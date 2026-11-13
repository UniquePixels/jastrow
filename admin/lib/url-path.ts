/**
 * The URL of an entry, computed from its primary headword (ruling
 * `11-13 url words`; spec `docs/specs/2026-11-13-url-words-design.md`
 * §4). The path is never stored: it is derived from `headwords[0]` and
 * the rid every time it is needed, so it cannot drift from the headword.
 */
import type { Entry } from '../entry/schema.ts';
import { compareByCodeUnit } from './compare-by-code-unit.ts';

const NOT_KEPT = /[^א-ת־׳״\s]/gu;

/** The URL word for one headword text: its letters, maqaf, geresh and
 * gershayim, with each run of whitespace joined as one `_`. */
function toUrlWord(text: string): string {
	return text
		.normalize('NFC')
		.replace(NOT_KEPT, '')
		.trim()
		.replace(/\s+/gu, '_');
}

/** rid to path for every entry. Entries sharing a word are numbered
 * 1..n in rid order, whatever order they arrive in; 1 is `/<word>`,
 * the rest `/<word>-<n>`. */
function buildEntryPaths(
	entries: readonly Pick<Entry, 'headwords' | 'id'>[],
): Map<string, string> {
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

export { buildEntryPaths, toUrlWord };
