import { expect, it } from 'bun:test';
import type { SourceEntry, SourceSense } from '../../body/types.ts';
import { RULES } from '../registry.ts';
import { applyTransforms } from '../run.ts';
import { composedEntries, repairedEntries } from './corpus-fixture.ts';
import { isEmptySlot, isWholeEntryStub, stubSlot } from './see-particle.ts';

/**
 * `see-particle-lost`, measured where the rule stands.
 *
 * ## The census runs the phase WITHOUT this rule in it
 *
 * `composedEntries()` runs the whole `text-repairs` phase, and this
 * rule is now IN that phase — so censusing on it would count the rule's
 * own output. Every empty slot would read as filled and the population
 * would come back 0, exactly the implicit-subject defect batch 7 found
 * in `continuation-marker.corpus.test.ts` and again in
 * `stem.corpus.test.ts`. Here it surfaced as a loud failure (`v.` read
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

/** Does any sense of `entry`, at any depth, have the stub shape? */
function anyStubShaped(entry: SourceEntry): boolean {
	for (const { sense } of walk(entry.content.senses)) {
		if (stubSlot(sense.definition ?? '') !== null) {
			return true;
		}
	}
	return false;
}

/** Built once per `bun test` run, keyed by rid. */
let stageMemo: Map<string, SourceEntry> | undefined;

/**
 * The corpus as this rule receives it — repaired, then run through
 * `text-repairs` with itself held out — **for the entries that can
 * matter, and only those**.
 *
 * ## Why it is filtered, and why the filter is sound
 *
 * Running the held-out phase over all 32,512 entries is a SECOND full
 * transform pass, and the transform passes are the whole cost of this
 * tier: it measured ~49s locally on top of the shared fixture, which is
 * ~90s on CI. The `Test` job was killed by CI's fixed ~20-minute wall
 * midway through this very file on PR #58 — batch 7's failure exactly,
 * and for the same reason, a corpus file that rebuilds something
 * expensive.
 *
 * The filter is `anyStubShaped` evaluated on `composedEntries()`, which
 * is free. It is sound because **this rule can neither create nor
 * destroy the stub shape**: it fires only on a definition that already
 * matches `STUB`, and it inserts the particle INTO that definition's
 * slot, so the result still matches `STUB`. Nothing else in the entry
 * is touched. Therefore the set of stub-shaped entries after the rule
 * is exactly the set before it, and an entry that is not stub-shaped in
 * the composed corpus was not stub-shaped at this rule's input either.
 *
 * §6 pins that argument rather than leaving it as prose.
 */
async function stage(): Promise<Map<string, SourceEntry>> {
	if (stageMemo === undefined) {
		const composed = await composedEntries();
		const repaired = await repairedEntries();
		const out = new Map<string, SourceEntry>();
		for (const [index, entry] of composed.entries()) {
			if (!anyStubShaped(entry)) {
				continue;
			}
			const source = repaired[index] as SourceEntry;
			out.set(
				source.rid,
				applyTransforms(source, 'text-repairs', WITHOUT_SEE_PARTICLE).entry,
			);
		}
		stageMemo = out;
	}
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

/** Every sense of an entry, depth-first, paired with its nesting depth.
 * Depth is what §4 needs: the rule reaches top-level senses only, and
 * the 14 refused look-alikes all sit below one. */
function* walk(
	senses: readonly SourceSense[] | undefined,
	depth = 0,
): Generator<{ depth: number; sense: SourceSense }> {
	for (const sense of senses ?? []) {
		yield { depth, sense };
		yield* walk(sense.senses, depth + 1);
	}
}

/** Walk the staged entries once and count everything the assertions
 * below need: the empty slots, the filled ones by particle, and the
 * stub-shaped child senses the entry-level restriction refuses. One
 * pass, because the stage it reads is the expensive part. */
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
			const stub = stubSlot(sense.definition ?? '');
			if (stub === null || !isEmptySlot(stub.raw)) {
				continue;
			}
			if (depth > 0 || !isWholeEntryStub(senses)) {
				out.childShaped++;
			}
		}
		if (!isWholeEntryStub(senses)) {
			continue;
		}
		const stub = stubSlot(senses[0]?.definition ?? '');
		if (stub === null) {
			continue;
		}
		out.stubs++;
		// THE RULE'S OWN PREDICATE, not a second copy of it. `isEmptySlot`
		// is what `restoreParticle` calls, so a slot this file counts as
		// empty is exactly a slot the rule repairs — the two cannot drift
		// into counting different populations.
		if (isEmptySlot(stub.raw)) {
			out.empty.push(entry.rid);
		} else {
			out.filled.set(
				stub.raw.trim(),
				(out.filled.get(stub.raw.trim()) ?? 0) + 1,
			);
		}
	}
	return out;
}

/** The census, computed once and shared by every assertion below. */
let memo: Census | undefined;

/** The census, built on first use. */
async function measured(): Promise<Census> {
	memo ??= census([...(await stage()).values()]);
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

/** The rule AS REGISTERED, pulled from `RULES` by id rather than
 * imported from its module. What §5 has to prove is that the thing the
 * pipeline runs repairs these four — a bare call to `restoreParticle`
 * would pass with the rule mis-registered, in the wrong phase, or
 * absent from `RULES` altogether. */
const AS_REGISTERED = RULES.filter((rule) => rule.id === 'see-particle-lost');

// §5 — THE REPAIR, end to end on every member, through the registry.
it(
	'writes the particle outside the anchor on all four',
	async () => {
		expect(AS_REGISTERED).toHaveLength(1);
		const byRid = await stage();
		for (const rid of CATALOGUED) {
			const before = byRid.get(rid) as SourceEntry;
			const run = applyTransforms(before, 'text-repairs', AS_REGISTERED);
			expect(run.records.map((record) => record.ruleId)).toEqual([
				'see-particle-lost',
			]);
			const after = run.entry.content.senses[0]?.definition ?? '';
			expect(after.startsWith(', v. <a')).toBe(true);
			// The particle is OUTSIDE the anchor: nothing was written into
			// the display, where it would render inside a `dir="rtl"` run.
			expect(after).not.toContain('>v.');
			// And it is an insertion, not a rewrite — the whole input
			// survives once the mint is taken back out.
			expect(after.replace('v. ', '')).toBe(
				before.content.senses[0]?.definition ?? '',
			);
		}
	},
	TIMEOUT,
);

// §6 — THE FILTER'S OWN ARGUMENT, pinned rather than left as prose.
//
// `stage()` runs the held-out phase only for entries that are
// stub-shaped in the COMPOSED corpus, which is what keeps this file
// off CI's ~20-minute wall. The argument is that the rule can neither
// create nor destroy the stub shape, so the two sets are the same set.
//
// The half that could go wrong is CREATION — if the rule's output
// stopped matching `STUB`, a member would be stub-shaped before the
// rule and not after, so `stage()` would skip the very entries it
// exists to measure and §1 would report an empty population while
// passing every other assertion. Asserted directly on all four: the
// repaired definition still matches, and its slot is no longer empty.
it(
	'leaves its own output stub-shaped, which is what makes the filter sound',
	async () => {
		const byRid = await stage();
		for (const rid of CATALOGUED) {
			const before = byRid.get(rid) as SourceEntry;
			const after = applyTransforms(
				before,
				'text-repairs',
				AS_REGISTERED,
			).entry;
			const stub = stubSlot(after.content.senses[0]?.definition ?? '');
			expect(stub).not.toBeNull();
			expect(isEmptySlot((stub as { raw: string }).raw)).toBe(false);
		}
	},
	TIMEOUT,
);
