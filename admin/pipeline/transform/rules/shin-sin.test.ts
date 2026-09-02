import { describe, expect, it } from 'bun:test';
import type { SourceEntry } from '../../body/types.ts';
import { restoreShinSin, shinSinDotRestore, TWINS } from './shin-sin.ts';

const SHIN_DOT = 'ׁ';
/** `U01143`'s word and its attested twin, read from the table itself:
 * hand-building the dotted form encodes a guess about mark ORDER, and
 * the corpus writes the vowel before the dot. */
const BAD = 'שְכֵב';
const GOOD = TWINS.get(BAD) ?? '';
/** `B01287`'s, and the one that carries a SIN dot instead. */
const SIN_BAD = 'תֵּעָשֶה';
const SIN_GOOD = TWINS.get(SIN_BAD) ?? '';

const stub = (definition: string): SourceEntry => ({
	content: { senses: [{ definition }] },
	headword: 'x',
	rid: 'U01143',
});
const defOf = (e: SourceEntry): string | undefined =>
	e.content.senses[0]?.definition;

describe('TWINS', () => {
	// THE TABLE IS THE EVIDENCE. Every row is a corpus spelling
	// byte-identical to the damaged word except for the dot, so the rule
	// infers nothing — the vowels are the same by construction.
	it('holds a twin differing from its key by dots alone', () => {
		for (const [bad, good] of TWINS) {
			expect(good.replace(/[ׁׂ]/gu, '')).toBe(bad);
		}
	});
});

describe('restoreShinSin', () => {
	it('restores a shin dot from the table', () => {
		expect(restoreShinSin(`א ${BAD} ב`)).toBe(`א ${GOOD} ב`);
	});

	it('restores a sin dot from the table', () => {
		expect(restoreShinSin(`א ${SIN_BAD} ב`)).toBe(`א ${SIN_GOOD} ב`);
	});

	// THE 50 OCCURRENCES WITH NO ATTESTED TWIN ARE NOT THIS RULE'S. A
	// shin with no witness would have the rule CHOOSING between שׁ and
	// שׂ, which is the act [[project_no_vowel_inference]] rules out.
	it('refuses a damaged word the table does not attest', () => {
		expect(restoreShinSin('א שְכֶר ב')).toBeNull();
	});

	// A TABLE KEY INSIDE A LONGER WORD IS A DIFFERENT WORD, and its dot
	// is not this one's to restore.
	it('refuses a table key running into another letter', () => {
		expect(restoreShinSin(`א ${BAD}ים ב`)).toBeNull();
	});

	it('refuses text holding no table key at all', () => {
		expect(restoreShinSin('nothing here')).toBeNull();
	});
});

describe('shinSinDotRestore', () => {
	it('declares the dot it added to a link target', () => {
		const ref = `Jastrow, ${BAD} 1`;
		const fixed = `Jastrow, ${GOOD} 1`;
		const out = shinSinDotRestore.apply(
			stub(`<a href="/${ref.replaceAll(' ', '_')}" data-ref="${ref}">x</a>`),
		);
		expect(out.pointed).toEqual([
			{
				adds: SHIN_DOT,
				from: `/Jastrow,_${BAD}_1`,
				target: `/Jastrow,_${GOOD}_1`,
			},
			{ adds: SHIN_DOT, from: ref, target: fixed },
		]);
	});

	// THE DECLARED DOT IS THE ONE THE RULE ADDED, and getting that right
	// needs POSITION rather than a count. A target holding a repaired key
	// AND an already-dotted word carries two dots afterwards; taking the
	// last (n - had) of them names the pre-existing one, and the gate's
	// multiset accounting then reports a sin lost and a shin gained and
	// refuses a correct repair — which `run.ts` turns into a thrown
	// error, not a skipped rule.
	it('declares the dot it added, not a dot that was already there', () => {
		const SIN_WORD = TWINS.get('תֵּעָשֶה') ?? '';
		const ref = `Jastrow, ${BAD} ${SIN_WORD} 1`;
		const out = shinSinDotRestore.apply(
			stub(`<a href="/x" data-ref="${ref}">y</a>`),
		);
		expect(out.pointed?.map((claim) => claim.adds)).toEqual([SHIN_DOT]);
	});

	it('repairs the definition and records the entry', () => {
		const out = shinSinDotRestore.apply(stub(`א ${BAD} ב`));
		expect(defOf(out.entry)).toBe(`א ${GOOD} ב`);
		expect(out.records).toHaveLength(1);
	});

	it('hands back the caller’s own entry when it declines', () => {
		const entry = stub('nothing to repair');
		expect(shinSinDotRestore.apply(entry).entry).toBe(entry);
	});
});
