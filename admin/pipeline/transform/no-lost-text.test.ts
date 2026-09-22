import { describe, expect, it } from 'bun:test';
import type { SourceEntry } from '../types.ts';
import { checkNoLostText, LOSS_ALLOWANCES } from './no-lost-text.ts';
import { RULES } from './registry.ts';

/** A minimal entry carrying only the senses under test. The gate
 * walks every field `fieldsOf` reaches, so the headword is real text
 * and counts toward both multisets. */
const entry = (senses: SourceEntry['content']['senses']): SourceEntry => ({
	content: { senses },
	headword: 'אָהַב',
	rid: 'T00001',
});

/** One sense, one definition — the shape most of these cases need. */
const one = (definition: string): SourceEntry => entry([{ definition }]);

// biome-ignore lint/complexity/noExcessiveLinesPerFunction: one suite per behaviour; its cases share setup and read as a single table.
describe('checkNoLostText', () => {
	it('passes a rule that changed nothing', () => {
		expect(checkNoLostText(one('to love'), one('to love'))).toEqual([]);
	});

	it('passes text MOVED between fields', () => {
		const before = entry([
			{ definition: 'v. supra.—2) ' },
			{ definition: 'x' },
		]);
		const after = entry([
			{ definition: 'v. supra. ' },
			{ definition: 'x', number: '—2)' },
		]);
		expect(checkNoLostText(before, after)).toEqual([]);
	});

	it('reports an undeclared deletion, naming the codepoint', () => {
		const problems = checkNoLostText(one('to love'), one('to lve'));
		expect(problems).toEqual(['T00001: dropped "o" (U+006F)']);
	});

	// The gate is what stands between "moved" and "dropped": an emptied
	// definition is a sub-multiset of its input and so passes
	// `checkNoNewText` without a murmur.
	it('reports every codepoint of an emptied definition', () => {
		expect(checkNoLostText(one('abc'), one(''))).toHaveLength(3);
	});

	it('permits exactly what `removes` declares', () => {
		expect(checkNoLostText(one('a b'), one('ab'), [' '])).toEqual([]);
	});

	it('credits `removes` as a multiset, not a set', () => {
		const problems = checkNoLostText(one('a b c'), one('abc'), [' ']);
		expect(problems).toEqual(['T00001: dropped " " (U+0020)']);
	});

	// Declarations draw on ONE budget. Checked per declaration, this
	// passed: each `'a'` occurs in the input, so both were credited and
	// an emptied field looked accounted for.
	it('refuses two declarations of a codepoint the input holds once', () => {
		const problems = checkNoLostText(one('a'), one(''), ['a', 'a']);
		expect(problems).toEqual([
			'T00001: declared removal "a" does not occur in the input',
		]);
	});

	// The same shape where the input CAN afford both.
	it('permits two declarations when the input holds two', () => {
		expect(checkNoLostText(one('aa'), one(''), ['a', 'a'])).toEqual([]);
	});

	// A rule that cannot say what it deleted has not shown that it
	// knows — so an unfounded claim fails rather than being ignored.
	it('rejects a declared removal absent from the input', () => {
		const problems = checkNoLostText(one('abc'), one('abc'), ['z']);
		expect(problems).toEqual([
			'T00001: declared removal "z" does not occur in the input',
		]);
	});

	// Tags are stripped before the comparison, exactly as in
	// `checkNoNewText`, so markup changes are this gate's business only
	// through the text they carry.
	it('ignores markup, and sees the text inside it', () => {
		expect(checkNoLostText(one('<i>x</i>'), one('x'))).toEqual([]);
		expect(checkNoLostText(one('<i>x</i>'), one('<i></i>'))).toHaveLength(1);
	});

	// Every field `fieldsOf` walks is in scope, not `definition` alone.
	it('sees a dropped headword', () => {
		const before = one('x');
		const after = { ...before, headword: '' };
		expect(checkNoLostText(before, after).length).toBeGreaterThan(0);
	});

	// The separator `textOf` joins fields with is this module's own
	// seam, not a corpus byte. A structural rule that drops an empty
	// sense removes one field and so one seam; while this gate counted
	// its own local multiset, that showed up as a lost U+0000 and the
	// rule was refused for text nothing in the source ever held.
	it('does not count the field separator it introduced itself', () => {
		const before = entry([{ definition: 'a' }, {}]);
		const after = entry([{ definition: 'a' }]);
		expect(checkNoLostText(before, after)).toEqual([]);
	});

	// `allowsLoss` mirrors `Rule.allows` on the other gate: a static,
	// codepoint-flattened maintainer ruling, credited without limit.
	it('credits an `allowsLoss` codepoint', () => {
		expect(checkNoLostText(one('a b c'), one('abc'), [], [' '])).toEqual([]);
	});

	it('credits `allowsLoss` only for the codepoints it names', () => {
		const problems = checkNoLostText(one('a b'), one('a'), [], [' ']);
		expect(problems).toEqual(['T00001: dropped "b" (U+0062)']);
	});
});

// `run.ts` looks the allowance up by a plain `LOSS_ALLOWANCES.get(rule.id)`,
// so a rule rename drops its allowance silently — and because per-PR CI
// never reads `data/source/` (spec R9), the only witness would be a full
// `bun data:import`. These two assertions put that witness in the 2 s tier.
describe('LOSS_ALLOWANCES', () => {
	it('names only rules that are registered', () => {
		const ids = new Set(RULES.map((r) => r.id));
		const unknown = [...LOSS_ALLOWANCES.keys()].filter((id) => !ids.has(id));
		expect(unknown).toEqual([]);
	});

	// A `structural-repairs` rule declares what it drops per call through
	// `removes`. A static row for one would be a blanket licence granted
	// where an exact declaration is already available.
	it('covers text-phase rules only', () => {
		const byId = new Map(RULES.map((r) => [r.id, r]));
		const misphased = [...LOSS_ALLOWANCES.keys()].filter(
			(id) => byId.get(id)?.phase !== 'text-repairs',
		);
		expect(misphased).toEqual([]);
	});

	it('allows no empty row, which would license nothing and read as cover', () => {
		for (const [id, chars] of LOSS_ALLOWANCES) {
			expect(`${id}: ${chars.length}`).not.toBe(`${id}: 0`);
		}
	});
});
