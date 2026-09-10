/**
 * The doc-08 seed tranche: split/retag patches for the implied-`1)`
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
 * ## The shape of the repair
 *
 * The convention is the one the accepted sweep patches already use
 * (A00339, `tranche-01`): `split` the host at its in-text `—2)`, then
 * `retag` the host with `1)`. Split alone would leave sense 1
 * unnumbered, which is the defect wearing a different face; retag
 * alone would number a sense that still swallows its sibling. The set
 * is byte-conserving apart from the closed-grammar marker tokens the
 * no-new-text validator allows.
 *
 * Most rows take exactly that pair, but the count is not fixed. Two
 * of them — `C00805` and `I00111` — carry a run that continues past
 * `—2)`, and a single split hands the rest of it to a sibling it
 * numbers, where no gate can see it. Those rows get one split per
 * marker; see `runMarkers` and `docs/v2/phase-2-swallowed-runs.md`.
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

/** The closed-grammar marker token for sense `n`. */
const marker = (n: number): string => `—${n})`;

/** The marker the census shape opens at, and the one `impliedHost`
 * locates. A run that continues past it carries `—3)`, `—4)`, … */
const MARKER = marker(2);

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
 * patches already repaired.
 *
 * Was 28 until 2026-09-10, when the maintainer confirmed six more
 * rows off the swallowed-run review (`E00005`, `I00661`, `P00816`,
 * `P00856`, `Q00990`, `S01355`). `I00661` was the row doc 08 had held
 * out on grounds that did not reproduce. The list is committed rather than parsed
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
	'E00005',
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
	'I00661',
	'I00853',
	'J00114',
	'J00459',
	'P00816',
	'P00856',
	'Q00990',
	'S01355',
];

/** One entry's seeded patches, in apply order: the run's splits,
 * then the retag. */
interface SeedRow {
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

/**
 * The consecutive run the host's definition carries: `—2)`, then
 * `—3)`, and so on until a number is missing.
 *
 * Splitting only at `—2)` was the original shape and it is not
 * enough. `split` hands the tail to a sibling it NUMBERS, and the
 * census skips numbered senses, so a `—3)` left in that tail is
 * invisible to every gate downstream and ships as literal text inside
 * sense 2. Eleven census rows carry such a tail; see
 * `docs/v2/phase-2-swallowed-runs.md`.
 *
 * Two things are asserted rather than worked around. Each marker must
 * occur exactly once, because `split` addresses its marker by content
 * and refuses an ambiguous one. And the markers must appear in
 * ascending order, because each split addresses the sibling the
 * previous one created — a `—3)` sitting before the `—2)` is not a
 * run, and the sequential walk would mint an anchor that cannot
 * resolve.
 */
function runMarkers(rid: string, definition: string): string[] {
	const markers: string[] = [];
	let previousAt = -1;
	for (let n = 2; ; n += 1) {
		const token = marker(n);
		const occurrences = definition.split(token).length - 1;
		if (occurrences === 0) {
			break;
		}
		if (occurrences !== 1) {
			throw new Error(
				`${rid}: ${token} occurs ${occurrences} times in the host definition; split needs exactly one`,
			);
		}
		const at = definition.indexOf(token);
		if (at < previousAt) {
			throw new Error(
				`${rid}: ${token} precedes ${marker(n - 1)} in the host definition; that is not a run`,
			);
		}
		previousAt = at;
		markers.push(token);
	}
	return markers;
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
	runMarkers(entry.rid, host.definition ?? '');
	return host;
}

/**
 * One composed entry's patches: a split at every marker in the run,
 * then the retag of the host the first split leaves behind.
 *
 * Each split addresses the sense as it stands when that patch runs —
 * the first the host itself, the rest the sibling its predecessor
 * created, which carries the predecessor's marker as its number.
 * Deriving those intermediate states here (rather than re-running
 * apply) keeps the generator a pure function of the composed entry.
 *
 * The retag is minted last but its anchor is the host's content after
 * the first split, which no later split touches — so it resolves
 * wherever it sits in the order.
 *
 * Only the first split repairs the implied `1)`. The rest repair a
 * marker the print numbered and the data swallowed, which the
 * catalogue already calls `swallowed-marker` (residue-01, P000091).
 */
function seedRow(entry: SourceEntry, firstId: number): SeedRow {
	const host = impliedHost(entry);
	const definition = host.definition ?? '';
	const before = definition.slice(0, definition.indexOf(MARKER));
	const common = {
		confidence: 'high',
		expected_occurrences: 1,
		occurrence_index: 1,
		prompt_version: PROMPT_VERSION,
		rid: entry.rid,
		snapshot: SNAPSHOT,
	};
	let nextId = firstId;
	const mint = (): string => {
		const id = `P${String(nextId).padStart(6, '0')}`;
		nextId += 1;
		return id;
	};
	const patches: Record<string, unknown>[] = [];
	// The sense the next split addresses: the host first, then each
	// tail, numbered with the marker that cut it off.
	let text = definition;
	let number: string | undefined;
	for (const token of runMarkers(entry.rid, definition)) {
		patches.push({
			...common,
			defect_class: number === undefined ? 'implied-one' : 'swallowed-marker',
			expected_before: text,
			id: mint(),
			op: 'split',
			payload: { marker: token },
			rationale:
				number === undefined
					? 'Doc-08 confirmed implied-one; in-text —2) run with no 1) before it.'
					: `Doc-08 confirmed implied-one; ${token} was swallowed in the tail the ${number} split creates.`,
			target: senseTarget(
				number === undefined
					? { definition: text }
					: { definition: text, number },
			),
		});
		text = text.slice(text.indexOf(token) + token.length);
		number = token;
	}
	patches.push({
		...common,
		defect_class: 'implied-one',
		expected_before: before,
		id: mint(),
		op: 'retag',
		payload: { number: SENSE_ONE },
		rationale:
			'Doc-08 confirmed implied-one; number the host print left implied.',
		target: senseTarget({ definition: before }),
	});
	return { patches, rid: entry.rid };
}

/** Every seeded row, in `SEED_CONFIRMED` order, with ids running
 * from `FIRST_ID`. Entries absent from the corpus throw — a rid in
 * the seed list that no longer exists is a drift the caller must see.
 */
async function buildSeed(): Promise<SeedRow[]> {
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
	const rows: SeedRow[] = [];
	let id = FIRST_ID;
	for (const rid of SEED_CONFIRMED) {
		const entry = found.get(rid);
		if (entry === undefined) {
			throw new Error(`unreachable: ${rid} passed the presence check`);
		}
		const row = seedRow(entry, id);
		rows.push(row);
		// Rows no longer mint a fixed two ids: a row whose run runs past
		// `—2)` mints one more per marker.
		id += row.patches.length;
	}
	return rows;
}

if (import.meta.main) {
	const rows = await buildSeed();
	const dir = 'data/patches/tranches/seed-doc-08-implied-one';
	const patches = rows.flatMap((row) => row.patches);
	const manifest = rows.map((row) => ({
		disposition: 'repaired',
		patches: row.patches.map((patch) => patch['id']),
		rid: row.rid,
	}));
	const write = async (name: string, rows: unknown[]): Promise<void> => {
		const text = `${rows.map((row) => JSON.stringify(row)).join('\n')}\n`;
		await Bun.write(`${dir}/${name}`, text);
	};
	await write('patches.jsonl', patches);
	await write('manifest.jsonl', manifest);
	console.log(
		`wrote ${patches.length} patches over ${rows.length} entries to ${dir}`,
	);
}

export type { SeedRow };
export { buildSeed, impliedHost, runMarkers, SEED_CONFIRMED, seedRow };
