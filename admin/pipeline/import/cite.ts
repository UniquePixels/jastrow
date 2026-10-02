/**
 * Citation targets (migrate spec §2.3). Internal hrefs resolve through
 * the headword map — 32,512 distinct strings, so there is no ambiguity
 * to adjudicate. What does not resolve stays in the text and fails
 * gate 6; the fix is a patch.
 *
 * Lookup is keyed in NFC. Hebrew combining marks carry canonical
 * combining classes, so the same word can be spelled with dagesh before
 * or after its vowel — two byte strings, one word, and an exact-string
 * map answers `undefined` for the spelling it was not built from. NFC
 * reorders marks into canonical order, which is a comparison detail
 * only: nothing stored is ever normalized, so gate 2's byte-exact
 * headword regeneration sees the source spelling untouched.
 */
import type { SourceEntry } from '../types.ts';
import type { RefResolver } from './markup.ts';

const INTERNAL_PREFIX = 'Jastrow,_';
const SENSE_SUFFIX = /\.\d+$/u;

/** One internal `<cite ref>` target that no entry owns, with the rid
 * it was met in. The target is the spelling the href actually carried:
 * what gate 6 reports is never the normalized form the map was queried
 * with. */
interface Unresolved {
	rid: string;
	target: string;
}

/** The marked headword string an internal href names, or `undefined`
 * for any other href. Underscores are the URL spelling of spaces. */
function internalTarget(href: string): string | undefined {
	const path = href.startsWith('/') ? href.slice(1) : href;
	let decoded = path;
	try {
		decoded = decodeURIComponent(path);
	} catch {
		// A stray `%` is not an encoding; the raw path is the target.
	}
	if (!decoded.startsWith(INTERNAL_PREFIX)) {
		return;
	}
	return decoded
		.slice(INTERNAL_PREFIX.length)
		.replace(SENSE_SUFFIX, '')
		.replaceAll('_', ' ');
}

/** Headword string to rid, keyed in NFC, for resolving internal
 * `<cite ref>` targets. THROWS on a duplicate key: two entries
 * answering to one word would make every reference to it ambiguous,
 * and silently keeping either one would point some citations at the
 * wrong entry. Canonically equivalent headwords count as duplicates —
 * a reader cannot tell them apart either. */
function buildHeadwordMap(
	entries: Iterable<Pick<SourceEntry, 'headword' | 'rid'>>,
): Map<string, string> {
	const map = new Map<string, string>();
	for (const { headword, rid } of entries) {
		const key = headword.normalize('NFC');
		const seen = map.get(key);
		if (seen !== undefined) {
			throw new Error(
				`duplicate headword string "${headword}": ${seen} and ${rid}`,
			);
		}
		map.set(key, rid);
	}
	return map;
}

/** A resolver for one entry: rid for a known internal target, the
 * canonical `data-ref` for an external one, and the bare target —
 * recorded on `unresolved` — for an internal one nothing owns. The
 * target is normalized to query the map and never otherwise: what
 * stays in the text, and what gate 6 reports, is the spelling the href
 * actually carried. */
function createResolver(
	map: ReadonlyMap<string, string>,
	rid: string,
	unresolved: Unresolved[],
): RefResolver {
	return ({ dataRef, href }: { dataRef: string; href: string }): string => {
		const target = internalTarget(href);
		if (target === undefined) {
			return dataRef === '' ? href : dataRef;
		}
		const hit = map.get(target.normalize('NFC'));
		if (hit !== undefined) {
			return hit;
		}
		unresolved.push({ rid, target });
		return target;
	};
}

export type { Unresolved };
export { buildHeadwordMap, createResolver, internalTarget };
