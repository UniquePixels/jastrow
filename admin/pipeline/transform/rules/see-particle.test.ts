import { describe, expect, it } from 'bun:test';
import type { SourceEntry } from '../../body/types.ts';
import {
	PARTICLE,
	restoreParticle,
	seeParticleRestore,
} from './see-particle.ts';

/** `E00226`'s definition, verbatim from the snapshot. */
const E00226 =
	', <a dir="rtl" class="refLink" href="/Jastrow,_הִיזְמָא.1" data-ref="Jastrow, הִיזְמָא 1">הִיזְמָא</a>.';

const stub = (definition: string): SourceEntry => ({
	content: { senses: [{ definition }] },
	headword: 'הוּזְמָא',
	rid: 'E00226',
});
const defOf = (e: SourceEntry): string | undefined =>
	e.content.senses[0]?.definition;

describe('restoreParticle', () => {
	it('restores the particle into a bare whole-definition stub', () => {
		expect(restoreParticle(E00226)).toBe(
			`, ${PARTICLE} <a dir="rtl" class="refLink" href="/Jastrow,_הִיזְמָא.1" data-ref="Jastrow, הִיזְמָא 1">הִיזְמָא</a>.`,
		);
	});

	// THE PARTICLE GOES OUTSIDE THE ANCHOR. Writing it into the display
	// would corrupt the link text a reader sees and would put `v.` inside
	// a `dir="rtl"` run, which renders reversed.
	it('writes the particle before the opening tag, never inside it', () => {
		const out = restoreParticle(E00226) ?? '';
		expect(out.indexOf(PARTICLE)).toBeLessThan(out.indexOf('<a'));
	});

	// THE POPULATED SLOT IS THE NULL MODEL — 7,270 of these stubs carry a
	// particle and only 4 do not. Every one of them must be refused.
	it('refuses a stub that already carries a particle', () => {
		for (const p of ['v.', 'v. sub', 'read', 'pl. of', 'part. of', 'v,']) {
			expect(restoreParticle(`, ${p} <a href="x">y</a>.`)).toBeNull();
		}
	});

	// THE ROW'S OWN FALSIFIER. `, <a Jastrow…>` at definition START occurs
	// 87 times and is overwhelmingly legitimate — the print headword
	// line's second form. Requiring the anchor to be the WHOLE definition
	// is what isolates the defect from that population.
	it('refuses when the anchor is not the entire definition', () => {
		expect(restoreParticle(', <a href="x">y</a> and more text.')).toBeNull();
		expect(restoreParticle('a gloss, <a href="x">y</a>.')).toBeNull();
	});

	it('refuses a definition with no anchor at all', () => {
		expect(restoreParticle(', הִיזְמָא.')).toBeNull();
	});

	// FAIL-CLOSED ON A COMMA WITH NOTHING AFTER IT. All four members read
	// `", <a"`, so the separating space is part of the shape rather than
	// an accident of it. Admitting `",<a"` would have the rule emit
	// `",v. <a"` — a particle fused to the comma, which is not a spelling
	// the corpus holds anywhere. Refusing is the choice `restored`'s
	// "ambiguity is a refusal, not a choice" makes for the same reason.
	it('refuses a comma the anchor follows with no space', () => {
		expect(restoreParticle(',<a href="x">y</a>.')).toBeNull();
	});

	// A PURE INSERTION, and nothing else. Deleting the edge whitespace on
	// the way past would be an undeclared deletion in a `text-repairs`
	// rule — invisible to `checkNoNewText`, which is a sub-multiset test
	// — and would hand `trailing-whitespace-definition` (10, still
	// PENDING) a silent population change.
	it('inserts and deletes nothing: removing the mint yields the input', () => {
		for (const before of [
			', <a href="x">y</a>.',
			' , <a href="x">y</a>. ',
			',\t<a href="x">y</a>',
		]) {
			const after = restoreParticle(before) as string;
			expect(after).not.toBeNull();
			expect(after.replace(`${PARTICLE} `, '')).toBe(before);
		}
	});
});

describe('seeParticleRestore', () => {
	it('repairs the entry and records one instance', () => {
		const result = seeParticleRestore.apply(stub(E00226));
		expect(defOf(result.entry)).toContain(`, ${PARTICLE} <a`);
		expect(result.records).toHaveLength(1);
		expect(result.records[0]?.ruleId).toBe('see-particle-lost');
	});

	// THE ENTRY-LEVEL RESTRICTION, and it is what separates 4 from 18. The
	// same string shape occurs in 14 CHILD senses of large entries, where a
	// bare cross-reference sub-sense is ordinary rather than damaged.
	it('refuses an entry whose stub is not its only sense', () => {
		const many: SourceEntry = {
			content: {
				senses: [{ definition: 'a real gloss.' }, { definition: E00226 }],
			},
			headword: 'x',
			rid: 'T00002',
		};
		expect(seeParticleRestore.apply(many).records).toHaveLength(0);
	});

	it('refuses an entry whose only sense has children', () => {
		const nested: SourceEntry = {
			content: {
				senses: [{ definition: E00226, senses: [{ definition: 'child.' }] }],
			},
			headword: 'x',
			rid: 'T00003',
		};
		expect(seeParticleRestore.apply(nested).records).toHaveLength(0);
	});

	it('returns the input entry unchanged when nothing matches', () => {
		const entry = stub('an ordinary gloss.');
		expect(seeParticleRestore.apply(entry).entry).toBe(entry);
	});

	// THE MINT IS DECLARED. `checkNoNewText` is a sub-multiset test, so
	// every codepoint of `v. ` needs an allowance: the second `.` is not
	// in the input either, the first one being the stub's terminator.
	it('declares exactly the codepoints it mints', () => {
		expect(seeParticleRestore.allows).toEqual(['v', '.', ' ']);
	});
});
