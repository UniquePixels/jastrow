/**
 * Citation targets (migrate spec §2.3). Internal hrefs resolve through
 * the headword map — 32,512 distinct keys, so there is no ambiguity to
 * adjudicate. What does not resolve stays in the text and fails gate
 * 6; the fix is a patch.
 *
 * **The map is keyed on the upstream-shaped headword** (decisions.md
 * row `10-09 link key`): each rid's headword line as the transform
 * phases leave it, BEFORE any reviewed patch. A source href is a
 * Sefaria URL naming Sefaria's spelling (URL names spec U1 route 1,
 * U3), and the transforms respell href and headword together (the
 * gershayim pair, the pointing rules), so the post-transform line is
 * Sefaria's spelling as our rules read it. A reviewed patch respells
 * only our headword, never the hrefs that name it, so keying on the
 * patched line would dangle every link that names the old spelling.
 * Our corrected headword stays the entry's URL name. The caller
 * (`buildIndexes` in `import.ts`) chooses which line it hands in.
 *
 * Lookup is by `findRid`, in comparison form (`toComparisonForm` in
 * `admin/lib/hebrew.ts`, ruling `11-07 one comparison rule`): NFC, with
 * whitespace runs collapsed.
 * Hebrew combining marks carry canonical combining classes, so the
 * same word can be spelled with dagesh before or after its vowel — two
 * byte strings, one word, and an exact-string map answers `undefined`
 * for the spelling it was not built from. NFC reorders marks into
 * canonical order. Whitespace is collapsed because a source headword
 * can carry a doubled space its hrefs do not (B00098's `בַּד  V`,
 * named by B00097 as `בַּד V`). Both are comparison details only: gate
 * 6 reports the spelling the href carried, and the one step that
 * rewrites stored text into NFC is the write (`normalizeForWrite`),
 * not this lookup.
 */
import { toComparisonForm } from '../../lib/hebrew.ts';
import type { SourceEntry } from '../types.ts';
import type { RefResolver } from './markup.ts';

const INTERNAL_PREFIX = 'Jastrow,_';
const SENSE_SUFFIX = /\.\d+$/u;

/** One internal `<cite ref>` target that no entry owns, with the rid
 * it was met in. The target is the spelling the href actually carried:
 * what gate 6 reports is never the key the map was queried with. */
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

/** The rid a headword string names in `map`, or `undefined`. The one
 * way the map is queried: the string is put in comparison form, as
 * `buildHeadwordMap` put every key, so a spelling with its marks in
 * another order or a doubled space still finds its entry. Nothing the
 * caller holds is rewritten (see the module comment). */
function findRid(
	map: ReadonlyMap<string, string>,
	headword: string,
): string | undefined {
	return map.get(toComparisonForm(headword));
}

/** Headword string to rid, keyed in comparison form, for resolving internal
 * `<cite ref>` targets. The caller passes the headword line the links
 * name (decisions.md row `10-09 link key`): for citations, the line
 * the transform phases leave, before patches. THROWS on a duplicate
 * key: two entries answering to one word would make every reference to
 * it ambiguous, and silently keeping either one would point some
 * citations at the wrong entry. Canonically equivalent headwords, and
 * two that differ only in whitespace, count as duplicates — a reader
 * cannot tell them apart either. */
function buildHeadwordMap(
	entries: Iterable<Pick<SourceEntry, 'headword' | 'rid'>>,
): Map<string, string> {
	const map = new Map<string, string>();
	for (const { headword, rid } of entries) {
		const key = toComparisonForm(headword);
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
 * target is put in comparison form (`findRid`) to query the map and
 * never otherwise: what
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
		const hit = findRid(map, target);
		if (hit !== undefined) {
			return hit;
		}
		unresolved.push({ rid, target });
		return target;
	};
}

export type { Unresolved };
export { buildHeadwordMap, createResolver, findRid, internalTarget };
