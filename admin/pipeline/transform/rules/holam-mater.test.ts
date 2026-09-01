import { describe, expect, it } from 'bun:test';
import type { SourceEntry } from '../../body/types.ts';
import {
	COLLIDING_HEADWORD,
	holamMaterMigration,
	migrateHolam,
} from './holam-mater.ts';

const HOLAM = 'ֹ';
const DAGESH = 'ּ';
const VAV = 'ו';

/** `A00267`'s own defect and its repair: the holam sits on the nun,
 * the mater vav is bare. */
const BAD = `אַנ${HOLAM}${DAGESH}${VAV}נָא`;
const GOOD = `אַנ${DAGESH}${VAV}${HOLAM}נָא`;

const stub = (definition: string, headword = 'x'): SourceEntry => ({
	content: { senses: [{ definition }] },
	headword,
	rid: 'A00267',
});
const defOf = (e: SourceEntry): string | undefined =>
	e.content.senses[0]?.definition;

describe('migrateHolam', () => {
	it('moves the holam onto the bare mater vav', () => {
		expect(migrateHolam(BAD)).toBe(GOOD);
	});

	// THE REPAIR IS A MOVE AND NOTHING ELSE. Every codepoint of the input
	// survives, which is also why `checkNoNewText` is blind to this rule
	// and the corpus gate has to carry the argument.
	it('preserves the codepoint multiset exactly', () => {
		expect([...(migrateHolam(BAD) ?? '')].sort().join('')).toBe(
			[...BAD].sort().join(''),
		);
	});

	// THE CORRECT SPELLING IS THE FIXED POINT. 43,664 holam males in the
	// corpus are already encoded this way and none may move.
	it('refuses a holam already standing on its vav', () => {
		expect(migrateHolam(GOOD)).toBeNull();
	});

	// A POINTED VAV IS A CONSONANT, not a mater — `שָׁוֶה` carries a
	// segol on the vav and holds no holam male at all.
	it('refuses a vav carrying a point of its own', () => {
		expect(migrateHolam(`שֹׁ${VAV}ֶה`)).toBeNull();
	});

	it('refuses a holam no vav follows', () => {
		expect(migrateHolam(`ל${HOLAM}א`)).toBeNull();
	});
});

describe('holamMaterMigration', () => {
	it('declares every link target it repaired', () => {
		const link = (ref: string): string =>
			`<a href="/${ref.replaceAll(' ', '_')}" data-ref="${ref}">x</a>`;
		const out = holamMaterMigration.apply(stub(link(`Jastrow, ${BAD} 1`)));
		expect(out.pointed).toEqual([
			{ from: `/Jastrow,_${BAD}_1`, target: `/Jastrow,_${GOOD}_1` },
			{ from: `Jastrow, ${BAD} 1`, target: `Jastrow, ${GOOD} 1` },
		]);
	});

	// THE ONE HEADWORD THE RULE REFUSES. Repairing `T00796`'s headword
	// makes it equal `T00795`'s, and two entries spelled alike leave
	// `Jastrow, רִמּוֹן 1` naming neither — see the case-9 spec §6.
	it('refuses the headword that would collide with another entry', () => {
		const entry: SourceEntry = {
			content: { senses: [{ definition: BAD }] },
			headword: COLLIDING_HEADWORD,
			rid: 'T00796',
		};
		const out = holamMaterMigration.apply(entry);
		expect(out.entry.headword).toBe(COLLIDING_HEADWORD);
		expect(defOf(out.entry)).toBe(GOOD);
	});

	it('repairs every other headword', () => {
		const out = holamMaterMigration.apply(stub('nothing', BAD));
		expect(out.entry.headword).toBe(GOOD);
	});

	it('hands back the caller’s own entry when it declines', () => {
		const entry = stub('nothing to repair');
		expect(holamMaterMigration.apply(entry).entry).toBe(entry);
	});
});
