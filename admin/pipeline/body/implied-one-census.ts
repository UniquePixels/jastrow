/**
 * Implied-`1)` candidate census (sense-structure-repair plan Task 1,
 * spec S3). The Note 1 convention: when sense 1 is only a
 * cross-reference tucked after the grammatical label, print omits the
 * `1)` and the numbering opens at `—2)`. This census finds the
 * **in-text** shape — an unnumbered sense whose definition carries a
 * `—2) ` run with no `1)` anywhere before it — the "~78 further
 * candidates, unreviewed" of `docs/v2/upstream-issues.md` #16 (79 with
 * the already-dispositioned D00072). The structural variant (a sense
 * *list* opening at 2) is a separate, already-reviewed class tracked
 * by migrate-dry's `startsAtTwo` recount.
 *
 * `IMPLIED_ONE_CENSUS` is the committed literal list — the S3/S5
 * completeness anchor: doc 08's row set must equal it exactly, and
 * the colocated test re-runs the detector over the full corpus to
 * prove the list has not drifted from the rule.
 *
 * Run: bun run body:implied-one-census
 */
import { walkSenses } from './census.ts';
import { readSourceEntries } from './source.ts';
import type { SourceEntry } from './types.ts';

const TAGS = /<[^>]+>/gu;
// Strips to a fixed point so fragments re-composed by one pass can't
// survive (matches census.ts/review.ts's hardened stripTags).
const stripTags = (text: string): string => {
	let out = text;
	let prev: string;
	do {
		prev = out;
		out = out.replace(TAGS, '');
	} while (out !== prev);
	return out;
};

/** The in-text implied-1 shape: `—2)` opening a run, with trailing
 * whitespace so a bare cross-reference like `v. אוֹר —2)quoted` odd
 * fragment can't half-match. */
const IMPLIED_TWO = /—2\)\s/u;
const SENSE_ONE = '1)';

interface ImpliedOneHit {
	/** Offset of the `—2)` marker in `text`. */
	markerIndex: number;
	/** The flagged sense's tag-stripped definition. */
	text: string;
}

/** The first in-text implied-`1)` hit in the entry, or null: an
 * unnumbered sense whose tag-stripped definition carries a `—2) ` run
 * with no `1)` anywhere before it. Numbered senses are excluded — a
 * sense *list* opening at 2 is the structural class, censused
 * elsewhere. */
function findImpliedOne(entry: SourceEntry): ImpliedOneHit | null {
	for (const sense of walkSenses(entry.content.senses)) {
		if (sense.number !== undefined) {
			continue;
		}
		const text = stripTags(sense.definition ?? '');
		const match = IMPLIED_TWO.exec(text);
		if (match && !text.slice(0, match.index).includes(SENSE_ONE)) {
			return { markerIndex: match.index, text };
		}
	}
	return null;
}

/** Boolean face of `findImpliedOne` for census/count call sites. */
function isImpliedOneCandidate(entry: SourceEntry): boolean {
	return findImpliedOne(entry) !== null;
}

/** The committed census (S3/S5 anchor): every corpus rid the detector
 * flags, sorted. 79 = D00072 (already dispositioned, IMPLIED_ONE_TEXT)
 * + the 78 unreviewed candidates of upstream-issues #16. The colocated
 * full-corpus test fails if this list drifts from the detector. */
const IMPLIED_ONE_CENSUS: readonly string[] = [
	'A00339',
	'A00628',
	'A02056',
	'A02731',
	'A03305',
	'B00134',
	'B00479',
	'B00771',
	'B00807',
	'B00881',
	'B01131',
	'C00095',
	'C00252',
	'C00460',
	'C00580',
	'C00805',
	'C01393',
	'D00038',
	'D00072',
	'D00249',
	'D00325',
	'D00436',
	'D00792',
	'D00807',
	'D00919',
	'D01009',
	'E00005',
	'E00148',
	'E00298',
	'E00443',
	'E00679',
	'E00741',
	'E00918',
	'E00940',
	'F00116',
	'G00173',
	'G00233',
	'G00363',
	'G00403',
	'G00652',
	'H00242',
	'H00507',
	'H00547',
	'H01202',
	'H01864',
	'I00111',
	'I00466',
	'I00638',
	'I00661',
	'I00822',
	'I00853',
	'J00114',
	'J00459',
	'J00627',
	'J00657',
	'K00030',
	'K00121',
	'K00156',
	'K00859',
	'N00235',
	'N00577',
	'N01162',
	'P00816',
	'P00856',
	'P01055',
	'Q00990',
	'Q01352',
	'R00075',
	'R00291',
	'R00586',
	'S00826',
	'S01355',
	'S01731',
	'T00243',
	'T00375',
	'T00538',
	'U00884',
	'U00960',
	'V00652',
];

/** Run the detector over the whole corpus; returns sorted hits. */
async function runCensus(): Promise<string[]> {
	const hits: string[] = [];
	for await (const entry of readSourceEntries()) {
		if (isImpliedOneCandidate(entry)) {
			hits.push(entry.rid);
		}
	}
	return hits.sort((a, b) => a.localeCompare(b));
}

if (import.meta.main) {
	const hits = await runCensus();
	const committed = new Set(IMPLIED_ONE_CENSUS);
	const extra = hits.filter((rid) => !committed.has(rid));
	const seen = new Set(hits);
	const missing = IMPLIED_ONE_CENSUS.filter((rid) => !seen.has(rid));
	console.log(
		`candidates=${hits.length} committed=${IMPLIED_ONE_CENSUS.length}`,
	);
	console.log(hits.join('\n'));
	if (extra.length > 0 || missing.length > 0) {
		throw new Error(
			`census drift — extra: [${extra.join(', ')}] missing: [${missing.join(', ')}]`,
		);
	}
	console.log('census matches the committed list');
}

export type { ImpliedOneHit };
export { findImpliedOne, IMPLIED_ONE_CENSUS, isImpliedOneCandidate, runCensus };
