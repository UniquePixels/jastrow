import { describe, expect, it } from 'bun:test';
import type { SourceEntry } from '../../body/types.ts';
import { GERESH, restoreVkhGeresh, vkhGereshRestore } from './vkh-geresh.ts';

/** The abbreviation, bare and whole. */
const BARE = 'וכ';
const WHOLE = `${BARE}${GERESH}`;

const stub = (definition: string): SourceEntry => ({
	content: { senses: [{ definition }] },
	headword: 'x',
	rid: 'D00686',
});
const defOf = (e: SourceEntry): string | undefined =>
	e.content.senses[0]?.definition;

describe('restoreVkhGeresh', () => {
	// `D00686`'s own text: the abbreviation ends the rtl run with nothing
	// after it, which is where the geresh went missing.
	it('restores the geresh on a bare abbreviation', () => {
		expect(restoreVkhGeresh(`<span dir="rtl">כתובות ${BARE}</span>`)).toBe(
			`<span dir="rtl">כתובות ${WHOLE}</span>`,
		);
	});

	// THE NULL MODEL IS 17,254 CORRECT SPELLINGS AGAINST 11. Every one of
	// the 17,254 must be refused, and this is the shape they take.
	it('refuses an abbreviation that already carries its geresh', () => {
		expect(restoreVkhGeresh(`א ${WHOLE} ב`)).toBeNull();
	});

	// A WORD IS NOT AN ABBREVIATION. `וכתב` opens with the same two
	// letters and is ordinary text.
	it('refuses the two letters inside a longer word', () => {
		expect(restoreVkhGeresh('א וכתב ב')).toBeNull();
	});

	// THE NOTARIKON TRAP, and it is what an unqualified probe gets wrong:
	// `K00463`, `K01215`, `K01217`, `K01358` and `S00372` write a dotted
	// `וכ̇` inside an acrostic. Six of a naive 17 are these, and none is
	// this defect.
	it('refuses a kaf carrying a notarikon mark', () => {
		expect(restoreVkhGeresh('א וכ̇ר̇ ב')).toBeNull();
	});

	// A Hebrew letter before the vav makes it part of that word, not a
	// conjunction opening an abbreviation.
	it('refuses two letters a Hebrew letter runs into', () => {
		expect(restoreVkhGeresh('א שוכ ב')).toBeNull();
	});
});

describe('vkhGereshRestore', () => {
	it('repairs the definition and records the entry', () => {
		const out = vkhGereshRestore.apply(stub(`א ${BARE}`));
		expect(defOf(out.entry)).toBe(`א ${WHOLE}`);
		expect(out.records).toHaveLength(1);
	});

	it('hands back the caller’s own entry when it declines', () => {
		const entry = stub('nothing to repair');
		expect(vkhGereshRestore.apply(entry).entry).toBe(entry);
	});
});
