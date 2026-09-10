/**
 * Citation targets (migrate spec §2.3). Internal hrefs resolve through
 * the headword map — 32,512 distinct strings, so there is no ambiguity
 * to adjudicate. What does not resolve stays in the text and must be on
 * the reviewed quarantine list (gate 6).
 *
 * Lookup is keyed in NFC. Hebrew combining marks carry canonical
 * combining classes, so the same word can be spelled with dagesh before
 * or after its vowel — two byte strings, one word, and an exact-string
 * map answers `undefined` for the spelling it was not built from. NFC
 * reorders marks into canonical order, which is a comparison detail
 * only: nothing stored is ever normalized, so gate 2's byte-exact
 * headword regeneration sees the source spelling untouched.
 */
import type { SourceEntry } from '../body/types.ts';
import type { RefResolver } from './markup.ts';

const INTERNAL_PREFIX = 'Jastrow,_';
const SENSE_SUFFIX = /\.\d+$/u;
const QUARANTINE_PATH = 'data/quarantine/internal-targets.json';

interface Unresolved {
	rid: string;
	target: string;
}

interface QuarantineRow {
	note: string;
	/** The date a human accepted this row, `YYYY-MM-DD`. ABSENT until
	 * someone has actually read it. Gate 6 fails a row without it, so a
	 * list that is merely seeded — every row saying "not yet reviewed" —
	 * cannot let `--write` through. Matching `rid` and `target` alone
	 * would pass such a list, which is the whole hole this closes. */
	reviewed?: string;
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
 * stays in the text, and what reaches the quarantine list, is the
 * spelling the href actually carried. */
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

/** The reviewed quarantine list, or an empty one when the file does
 * not exist yet — the state of a corpus before its first sweep. */
async function loadQuarantine(
	path = QUARANTINE_PATH,
): Promise<QuarantineRow[]> {
	const file = Bun.file(path);
	if (!(await file.exists())) {
		return [];
	}
	return (await file.json()) as QuarantineRow[];
}

/** Identity of one unresolved pair, for set comparison. Tab-joined
 * because a target may contain anything else a separator might use. */
const key = (row: Unresolved): string => `${row.rid}\t${row.target}`;

/** Gate 6, three ways: every unresolved pair is listed, every listed
 * pair is still unresolved, and every listed pair has been read by a
 * human. The third is not redundant — the spec calls this the REVIEWED
 * quarantine list, and without it a freshly seeded list passes at full
 * marks while nobody has looked at a single row. */
function checkQuarantine(
	unresolved: readonly Unresolved[],
	rows: readonly QuarantineRow[],
): { stale: string[]; unlisted: string[]; unreviewed: string[] } {
	const listed = new Set(rows.map(key));
	const seen = new Set(unresolved.map(key));
	/** Stable order for a failure list, so a report diff shows what
	 * changed rather than how a Set happened to iterate. */
	const sorted = (keys: Iterable<string>): string[] =>
		[...keys].sort((a, b) => a.localeCompare(b));
	return {
		stale: sorted([...listed].filter((k) => !seen.has(k))),
		unlisted: sorted([...seen].filter((k) => !listed.has(k))),
		unreviewed: sorted(rows.filter((r) => r.reviewed === undefined).map(key)),
	};
}

export type { QuarantineRow, Unresolved };
export {
	buildHeadwordMap,
	checkQuarantine,
	createResolver,
	internalTarget,
	loadQuarantine,
	QUARANTINE_PATH,
};
