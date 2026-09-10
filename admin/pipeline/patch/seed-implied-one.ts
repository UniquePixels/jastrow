/**
 * The doc-08 seed tranche: split/retag patch pairs for the implied-`1)`
 * rows a maintainer confirmed but the research sweep cannot reach.
 *
 * ## Why these rows need seeding at all
 *
 * The 2026-08-13 ruling folded doc 08's undecided rows into the
 * research sweep (`docs/v2/body-review/08-implied-one-candidates.md`).
 * That routing works only for entries the sweep actually sees, and
 * phase 2.3 sweeps the RESIDUE — the 3,668 entries that produce an
 * anomaly hint — not the corpus. Measured against that population, 24
 * of the 28 confirmed-but-unrepaired rows produce no hint at all, so
 * no sweep chunk will ever contain them. The other 4 are queued; they
 * are seeded here too, because the sweep reads the corpus AFTER
 * patch-apply and will therefore find them already repaired rather
 * than re-reporting them.
 *
 * ## The shape of the repair, and why it is two patches
 *
 * The convention is the one the accepted sweep patches already use
 * (A00339, `tranche-01`): `split` the host at its in-text `—2)`, then
 * `retag` the host with `1)`. Split alone would leave sense 1
 * unnumbered, which is the defect wearing a different face; retag
 * alone would number a sense that still swallows its sibling. The
 * pair is byte-conserving apart from the two closed-grammar marker
 * tokens the no-new-text validator allows.
 *
 * Targets are content anchors over the state patch-apply receives —
 * `applyRepairs` then both transform phases — so this module composes
 * each entry the same way `compose.ts` does before addressing it.
 *
 * Run: bun run patch:seed-implied-one
 */
import { healAndTransform } from '../body/compose.ts';
import { isImpliedOneCandidate } from '../body/implied-one-census.ts';
import { readSourceEntries } from '../body/source.ts';
import type { SourceEntry, SourceSense } from '../body/types.ts';
import { applyTransforms } from '../transform/run.ts';
import { senseTarget } from './schema.ts';

/** The in-text marker every seeded row splits at. Doc 08's census
 * shape is a `—2)` run, so the closed-grammar token is fixed. */
const MARKER = '—2)';

/** The number `retag` writes onto the host after the split. */
const SENSE_ONE = '1)';

/** The snapshot the census and these patches were derived against —
 * the pin every other tranche carries. */
const SNAPSHOT =
	'sha256:75bbc5ee7ab863b80b144c5fe176492b9bbcc8719cad83264ff8027092719ad9';

/** Not a sweep prompt: these decisions come from doc 08's committed
 * Decision column, signed by the maintainer on 2026-08-13. */
const PROMPT_VERSION = 'doc-08-seed';

/** First id this tranche mints. `P000091` is the highest in the
 * accepted corpus; ids are unique corpus-wide, not per tranche. */
const FIRST_ID = 92;

/**
 * The confirmed doc-08 rows still carrying the implied shape in the
 * shipped truth layer.
 *
 * Every rid here satisfies three things, each gated by the colocated
 * test: it is in `IMPLIED_ONE_CENSUS`; doc 08 records its Decision as
 * `Confirm`; and it is not one of the 8 rows the accepted sweep
 * patches already repaired. The list is committed rather than parsed
 * from the doc at run time so that a doc edit cannot silently change
 * what this generator emits.
 */
const SEED_CONFIRMED: readonly string[] = [
	'A00628',
	'A02056',
	'A02731',
	'A03305',
	'B00134',
	'B00807',
	'B01131',
	'C00095',
	'C00252',
	'C00460',
	'C00580',
	'C00805',
	'D00038',
	'D00249',
	'D00807',
	'E00443',
	'E00679',
	'G00403',
	'H00242',
	'H00507',
	'H00547',
	'H01864',
	'I00111',
	'I00466',
	'I00638',
	'I00853',
	'J00114',
	'J00459',
];

/** One entry's seeded pair, in apply order: split first, then retag. */
interface SeedPair {
	patches: Record<string, unknown>[];
	rid: string;
}

/** Walk a sense tree in document order — the same order
 * `schema.ts`'s resolver uses, so an address built here resolves
 * there. */
function* walkSenses(list: readonly SourceSense[]): Generator<SourceSense> {
	for (const sense of list) {
		yield sense;
		if (sense.senses !== undefined) {
			yield* walkSenses(sense.senses);
		}
	}
}

/** The entry as the patch-apply phase receives it: repairs, then the
 * text-repairs and structural-repairs transform phases. Addressing a
 * sense in any other state mints an anchor that will not resolve. */
function composedEntry(source: SourceEntry): SourceEntry {
	const healed = healAndTransform(source, { transformRecords: [] });
	return applyTransforms(healed.entry, 'structural-repairs').entry;
}

/** The census's own predicate, asked of ONE sense. Marker presence is
 * not the shape: a definition that already numbers its first sense
 * (`1) … —2) …`) carries a complete run, and retagging it would
 * number a sense twice. Delegating keeps the generator and
 * `IMPLIED_ONE_CENSUS` agreeing by construction rather than by two
 * predicates that happen to match today. */
function isImpliedShape(entry: SourceEntry, sense: SourceSense): boolean {
	return isImpliedOneCandidate({
		...entry,
		content: { ...entry.content, senses: [sense] },
	});
}

/** The single unnumbered sense holding exactly one in-text `—2)` with
 * no `1)` before it. Throws rather than guessing: an entry that
 * resolves to none or to several is not the shape doc 08 confirmed,
 * and a patch written against a guess would fail its own apply gate
 * later and more confusingly. */
function impliedHost(entry: SourceEntry): SourceSense {
	const hosts = [...walkSenses(entry.content.senses)].filter(
		(sense) =>
			sense.number === undefined &&
			(sense.definition ?? '').includes(MARKER) &&
			isImpliedShape(entry, sense),
	);
	const host = hosts[0];
	if (hosts.length !== 1 || host === undefined) {
		throw new Error(
			`${entry.rid}: expected one unnumbered sense carrying ${MARKER}, found ${hosts.length}`,
		);
	}
	const occurrences = (host.definition ?? '').split(MARKER).length - 1;
	if (occurrences !== 1) {
		throw new Error(
			`${entry.rid}: ${MARKER} occurs ${occurrences} times in the host definition; split needs exactly one`,
		);
	}
	return host;
}

/**
 * The split/retag pair for one composed entry.
 *
 * The retag's anchor is the host as it stands AFTER the split — its
 * definition truncated at the marker — because that is the content
 * the second patch resolves against. Deriving it here (rather than
 * re-running apply) keeps the generator a pure function of the
 * composed entry.
 */
function seedPair(entry: SourceEntry, firstId: number): SeedPair {
	const host = impliedHost(entry);
	const definition = host.definition ?? '';
	const before = definition.slice(0, definition.indexOf(MARKER));
	const common = {
		confidence: 'high',
		defect_class: 'implied-one',
		expected_occurrences: 1,
		occurrence_index: 1,
		prompt_version: PROMPT_VERSION,
		rid: entry.rid,
		snapshot: SNAPSHOT,
	};
	return {
		patches: [
			{
				...common,
				expected_before: definition,
				id: `P${String(firstId).padStart(6, '0')}`,
				op: 'split',
				payload: { marker: MARKER },
				rationale:
					'Doc-08 confirmed implied-one; in-text —2) run with no 1) before it.',
				target: senseTarget(host),
			},
			{
				...common,
				expected_before: before,
				id: `P${String(firstId + 1).padStart(6, '0')}`,
				op: 'retag',
				payload: { number: SENSE_ONE },
				rationale:
					'Doc-08 confirmed implied-one; number the host print left implied.',
				target: senseTarget({ definition: before }),
			},
		],
		rid: entry.rid,
	};
}

/** Every seeded pair, in `SEED_CONFIRMED` order, with ids running
 * from `FIRST_ID`. Entries absent from the corpus throw — a rid in
 * the seed list that no longer exists is a drift the caller must see.
 */
async function buildSeed(): Promise<SeedPair[]> {
	const wanted = new Set(SEED_CONFIRMED);
	const found = new Map<string, SourceEntry>();
	for await (const source of readSourceEntries()) {
		if (wanted.has(source.rid)) {
			found.set(source.rid, composedEntry(source));
		}
	}
	const missing = SEED_CONFIRMED.filter((rid) => !found.has(rid));
	if (missing.length > 0) {
		throw new Error(`seed rids absent from the corpus: ${missing.join(', ')}`);
	}
	const pairs: SeedPair[] = [];
	let id = FIRST_ID;
	for (const rid of SEED_CONFIRMED) {
		const entry = found.get(rid);
		if (entry === undefined) {
			throw new Error(`unreachable: ${rid} passed the presence check`);
		}
		pairs.push(seedPair(entry, id));
		id += 2;
	}
	return pairs;
}

if (import.meta.main) {
	const pairs = await buildSeed();
	const dir = 'data/patches/tranches/seed-doc-08-implied-one';
	const patches = pairs.flatMap((pair) => pair.patches);
	const manifest = pairs.map((pair) => ({
		disposition: 'repaired',
		patches: pair.patches.map((patch) => patch['id']),
		rid: pair.rid,
	}));
	const write = async (name: string, rows: unknown[]): Promise<void> => {
		const text = `${rows.map((row) => JSON.stringify(row)).join('\n')}\n`;
		await Bun.write(`${dir}/${name}`, text);
	};
	await write('patches.jsonl', patches);
	await write('manifest.jsonl', manifest);
	console.log(
		`wrote ${patches.length} patches over ${pairs.length} entries to ${dir}`,
	);
}

export type { SeedPair };
export { buildSeed, impliedHost, SEED_CONFIRMED, seedPair };
