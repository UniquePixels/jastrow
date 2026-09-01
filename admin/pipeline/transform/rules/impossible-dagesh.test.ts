import { describe, expect, it } from 'bun:test';
import type { SourceEntry } from '../../body/types.ts';
import { impossibleDagesh, repairDagesh } from './impossible-dagesh.ts';

const DAGESH = '\u05BC';
const RESH = '\u05E8';
const DALET = '\u05D3';
const HET = '\u05D7';
const HE = '\u05D4';

/** A minimal entry whose whole content is one childless sense. */
const stub = (definition: string): SourceEntry => ({
	content: { senses: [{ definition }] },
	headword: 'x',
	rid: 'H00666',
});
const defOf = (e: SourceEntry): string | undefined =>
	e.content.senses[0]?.definition;

describe('repairDagesh', () => {
	// THE FORTE ARM. `U01543` \u05e7\u05b4\u05d9\u05e8\u05bc\u05d5\u05bc\u05e9\u05c1 \u2014 the dagesh sits between
	// vowels, so it is forte, so it marks a DOUBLED letter, and \u05e8 is not
	// a letter Hebrew doubles. The correction is announced by the mark.
	it('swaps a forte resh-dagesh for a dalet', () => {
		expect(
			repairDagesh(
				`\u05e7\u05b4\u05d9${RESH}${DAGESH}\u05d5\u05bc\u05e9\u05c1`,
			),
		).toBe(`\u05e7\u05b4\u05d9${DALET}${DAGESH}\u05d5\u05bc\u05e9\u05c1`);
	});

	// THE MAPPIQ ARM. A word-final dagesh is a mappiq, and \u05d4 is the only
	// letter that takes one \u2014 `K00469` \u05d4\u05b4\u05db\u05b0\u05d7\u05b4\u05d9\u05e9\u05c1\u05b8\u05d7\u05bc for \u05d4\u05b4\u05db\u05b0\u05d7\u05b4\u05d9\u05e9\u05c1\u05b8\u05d4\u05bc.
	it('swaps a word-final het-dagesh for a he', () => {
		expect(repairDagesh(`\u05dc${HET}${DAGESH}`)).toBe(`\u05dc${HE}${DAGESH}`);
	});

	// THE ROW'S OWN ARGUMENT IS THAT THE DAGESH ANNOUNCES THE CORRECTION,
	// so where it announces nothing the rule declines. A resh-dagesh with
	// no following vowel is neither forte nor mappiq: 5 of the row's 19.
	it('declines a resh-dagesh no vowel follows', () => {
		expect(repairDagesh(`\u05e6\u05d9${RESH}${DAGESH}`)).toBeNull();
	});

	// `Q00891` \u05e4\u05bc\u05b4\u05d9\u05d7\u05bc\u05d5\u05bc\u05d7\u05b5\u05d9 \u2014 a het-dagesh mid-word is not a mappiq, and
	// nothing determines what it should have been. The last of the 6 the
	// rule leaves on the row.
	it('declines a het-dagesh that is not word-final', () => {
		expect(
			repairDagesh(
				`\u05e4\u05bc\u05b4\u05d9${HET}${DAGESH}\u05d5\u05bc\u05d7\u05b5\u05d9`,
			),
		).toBeNull();
	});

	// THE NULL MODEL IS 1,268 LEGITIMATE MAPPIQS. A \u05d4 carrying one is
	// ordinary Hebrew and must never be touched.
	it('leaves a legitimate mappiq alone', () => {
		expect(repairDagesh(`\u05d1\u05b8${HE}${DAGESH}`)).toBeNull();
	});
});

describe('impossibleDagesh', () => {
	it('repairs the definition and records the entry', () => {
		const out = impossibleDagesh.apply(
			stub(
				`\u05d1\u05d7\u05b4\u05d9${RESH}${DAGESH}\u05d5\u05bc\u05e9\u05c1\u05d5\u05b9`,
			),
		);
		expect(defOf(out.entry)).toBe(
			`\u05d1\u05d7\u05b4\u05d9${DALET}${DAGESH}\u05d5\u05bc\u05e9\u05c1\u05d5\u05b9`,
		);
		expect(out.records).toHaveLength(1);
	});

	// `Rule.apply`'s contract: an entry the rule declines comes back as
	// the caller's OWN object, not a copy.
	it('hands back the caller’s own entry when it declines', () => {
		const entry = stub('nothing to repair');
		expect(impossibleDagesh.apply(entry).entry).toBe(entry);
	});
});
