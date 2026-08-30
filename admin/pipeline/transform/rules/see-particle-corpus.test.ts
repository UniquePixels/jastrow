import { expect, it } from 'bun:test';
import type { SourceEntry, SourceSense } from '../../body/types.ts';
import { RULES } from '../registry.ts';
import { applyTransforms } from '../run.ts';
import { repairedEntries } from './corpus-fixture.ts';
import { isWholeEntryStub, restoreParticle, STUB } from './see-particle.ts';

/**
 * `see-particle-lost`, measured where the rule stands.
 *
 * ## The census runs the phase WITHOUT this rule in it
 *
 * `composedEntries()` runs the whole `text-repairs` phase, and this
 * rule is now IN that phase — so censusing on it would count the rule's
 * own output. Every empty slot would read as filled and the population
 * would come back 0, exactly the implicit-subject defect batch 7 found
 * in `continuation-marker-corpus.test.ts` and again in
 * `stem-corpus.test.ts`. Here it surfaced as a loud failure (`v.` read
 * 6,848 rather than 6,844, the four repairs already applied) rather
 * than as a silent pass, but it is the same class and the same fix:
 * build the stage this rule receives by running the phase with itself
 * held out.
 *
 * ## What this file is for
 *
 * The NULL MODEL. The rule mints a word, and what licenses that is not
 * the size of its population but the fact that the slot it fills is
 * populated 7,270 times with a vocabulary that was RETAINED rather than
 * normalised. If a re-fetch ever changes that ratio, this file fails
 * before the rule ships anything.
 */

const TIMEOUT = 120_000;

/** Every rule of the phase except this one. */
const WITHOUT_SEE_PARTICLE = RULES.filter(
	(rule) => rule.id !== 'see-particle-lost',
);

/** The corpus as this rule receives it: repaired, then run through the
 * `text-repairs` phase with itself held out. */
let stageMemo: readonly SourceEntry[] | undefined;
async function stage(): Promise<readonly SourceEntry[]> {
	stageMemo ??= (await repairedEntries()).map(
		(entry) =>
			applyTransforms(entry, 'text-repairs', WITHOUT_SEE_PARTICLE).entry,
	);
	return stageMemo;
}

/** The four the catalogue names. */
const CATALOGUED = ['E00226', 'G00428', 'H00010', 'H00021'];

interface Census {
	/** Stub-shaped definitions in a CHILD sense — the population the
	 * entry-level restriction refuses. */
	childShaped: number;
	/** Whole-entry stubs whose slot is empty. */
	empty: string[];
	/** Whole-entry stubs whose slot is filled, by particle. */
	filled: Map<string, number>;
	/** Every whole-entry stub, filled or not. */
	stubs: number;
}

function* walk(
	senses: readonly SourceSense[] | undefined,
	depth = 0,
): Generator<{ depth: number; sense: SourceSense }> {
	for (const sense of senses ?? []) {
		yield { depth, sense };
		yield* walk(sense.senses, depth + 1);
	}
}

function census(entries: readonly SourceEntry[]): Census {
	const out: Census = {
		childShaped: 0,
		empty: [],
		filled: new Map(),
		stubs: 0,
	};
	for (const entry of entries) {
		const senses = entry.content.senses;
		for (const { depth, sense } of walk(senses)) {
			const match = STUB.exec(sense.definition ?? '');
			if (match === null || (match.groups?.['slot'] ?? '').trim() !== '') {
				continue;
			}
			if (depth > 0 || !isWholeEntryStub(senses)) {
				out.childShaped++;
			}
		}
		if (!isWholeEntryStub(senses)) {
			continue;
		}
		const match = STUB.exec(senses[0]?.definition ?? '');
		if (match === null) {
			continue;
		}
		out.stubs++;
		const slot = (match.groups?.['slot'] ?? '').trim();
		if (slot === '') {
			out.empty.push(entry.rid);
		} else {
			out.filled.set(slot, (out.filled.get(slot) ?? 0) + 1);
		}
	}
	return out;
}

let memo: Census | undefined;
async function measured(): Promise<Census> {
	memo ??= census(await stage());
	return memo;
}

// §1 — THE POPULATION, and it is the catalogued four exactly.
it(
	'takes exactly the four entries the catalogue names',
	async () => {
		const { empty } = await measured();
		expect([...empty].sort()).toEqual(CATALOGUED);
	},
	TIMEOUT,
);

// §2 — THE NULL MODEL. What licenses the mint. The ratio, not the size.
it(
	'fills a slot that is populated 7,270 times and empty 4',
	async () => {
		const { empty, filled } = await measured();
		const populated = [...filled.values()].reduce((a, b) => a + b, 0);
		expect(populated).toBe(7270);
		expect(empty).toHaveLength(4);
	},
	TIMEOUT,
);

// §3 — THE VOCABULARY IS THE ARGUMENT. A slot being normalised away
// would show one surviving value. This one keeps a dozen, several of
// them themselves damaged (`v,` for `v.`), which is why the empty case
// reads as loss rather than as convention.
it(
	'finds a retained vocabulary, not a single normalised value',
	async () => {
		const { filled } = await measured();
		expect(filled.get('v.')).toBe(6844);
		expect(filled.get('v. sub')).toBe(196);
		expect(filled.get('read')).toBe(29);
		expect(filled.get('pl. of')).toBe(29);
		expect(filled.size).toBeGreaterThan(10);
	},
	TIMEOUT,
);

// §4 — THE RESTRICTION THAT SEPARATES 4 FROM 18. The same string shape
// in a child sense is an ordinary cross-reference sub-sense, and the
// rule must never reach one.
it(
	'refuses the 14 child senses carrying the same string shape',
	async () => {
		const { childShaped } = await measured();
		expect(childShaped).toBe(14);
	},
	TIMEOUT,
);

// §5 — THE REPAIR, end to end on every member.
it(
	'writes the particle outside the anchor on all four',
	async () => {
		const entries = await stage();
		const byRid = new Map(entries.map((e) => [e.rid, e]));
		for (const rid of CATALOGUED) {
			const entry = byRid.get(rid) as SourceEntry;
			const repaired = restoreParticle(
				entry.content.senses[0]?.definition ?? '',
			) as string;
			expect(repaired.startsWith(', v. <a')).toBe(true);
			expect(repaired).not.toContain('>v.');
		}
	},
	TIMEOUT,
);
