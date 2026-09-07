/**
 * Citation targets (migrate spec §2.3). Internal hrefs resolve through
 * the exact headword map — 32,512 distinct strings, so there is no
 * ambiguity to adjudicate. What does not resolve stays in the text and
 * must be on the reviewed quarantine list (gate 6).
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

function buildHeadwordMap(
	entries: Iterable<Pick<SourceEntry, 'headword' | 'rid'>>,
): Map<string, string> {
	const map = new Map<string, string>();
	for (const { headword, rid } of entries) {
		const seen = map.get(headword);
		if (seen !== undefined) {
			throw new Error(
				`duplicate headword string "${headword}": ${seen} and ${rid}`,
			);
		}
		map.set(headword, rid);
	}
	return map;
}

/** A resolver for one entry: rid for a known internal target, the
 * canonical `data-ref` for an external one, and the bare target —
 * recorded on `unresolved` — for an internal one nothing owns. */
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
		const hit = map.get(target);
		if (hit !== undefined) {
			return hit;
		}
		unresolved.push({ rid, target });
		return target;
	};
}

async function loadQuarantine(
	path = QUARANTINE_PATH,
): Promise<QuarantineRow[]> {
	const file = Bun.file(path);
	if (!(await file.exists())) {
		return [];
	}
	return (await file.json()) as QuarantineRow[];
}

const key = (row: Unresolved): string => `${row.rid}\t${row.target}`;

/** Gate 6, both directions: every unresolved pair is listed, and every
 * listed pair is still unresolved. */
function checkQuarantine(
	unresolved: readonly Unresolved[],
	rows: readonly QuarantineRow[],
): { stale: string[]; unlisted: string[] } {
	const listed = new Set(rows.map(key));
	const seen = new Set(unresolved.map(key));
	return {
		stale: [...listed].filter((k) => !seen.has(k)).sort(),
		unlisted: [...seen].filter((k) => !listed.has(k)).sort(),
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
