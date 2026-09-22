/**
 * `applyTransforms` — the runner, not the rules.
 *
 * The point of this file is that a REMOVED gate fails it. The suite it
 * replaced asserted `records` alone and never `out.entry`, so deleting
 * any of the four gate calls from `run.ts` left it green (review
 * 2026-09-21, report-code §6). There is one rogue rule per gate below,
 * each violating exactly one of them, and each asserted to be refused
 * by a message only that gate emits.
 */
import { describe, expect, it } from 'bun:test';
import type { SourceEntry } from '../types.ts';
import { applyTransforms } from './run.ts';
import type { Rule } from './types.ts';

function entry(): SourceEntry {
	return {
		content: { senses: [{ definition: 'a b' }] },
		headword: 'x',
		rid: 'A00001',
	};
}

/** A rule that rewrites the one definition, reporting one record. */
function rewriter(
	id: string,
	definition: string,
	rest: Partial<Rule> = {},
): Rule {
	return {
		apply: (e: SourceEntry) => ({
			entry: { ...e, content: { senses: [{ definition }] } },
			records: [{ detail: id, rid: e.rid, ruleId: id }],
		}),
		id,
		phase: 'text-repairs',
		...rest,
	};
}

const upper = rewriter('spacer', 'a  b');

// biome-ignore lint/complexity/noExcessiveLinesPerFunction: one suite per behaviour; its cases share setup and read as a single table.
describe('applyTransforms', () => {
	it('skips rules from another phase', () => {
		const out = applyTransforms(entry(), 'structural-repairs', [upper]);
		expect(out.records).toEqual([]);
		expect(out.entry).toEqual(entry());
	});

	it('returns the rule output, not the input', () => {
		const allowed: Rule = { ...upper, allows: [' '] };
		const out = applyTransforms(entry(), 'text-repairs', [allowed]);
		expect(out.records).toHaveLength(1);
		expect(out.entry.content.senses[0]?.definition).toBe('a  b');
	});

	// The loop carries the previous rule's output forward as the next
	// rule's input (`({ entry } = result);`). With one rule in the list
	// that line is unobservable — the loop's result is the only rule's
	// result either way.
	it('feeds each rule the previous rule output', () => {
		// A reordering, so the first rule's own output still passes every
		// gate: this case is about the carry-forward, not about them.
		const first = rewriter('first', 'b a');
		const second: Rule = {
			apply: (e: SourceEntry) => {
				const was = e.content.senses[0]?.definition ?? '';
				return {
					entry: { ...e, content: { senses: [{ definition: `${was}!` }] } },
					records: [{ detail: was, rid: e.rid, ruleId: 'second' }],
				};
			},
			allows: ['!'],
			id: 'second',
			phase: 'text-repairs',
		};
		const out = applyTransforms(entry(), 'text-repairs', [first, second]);
		// The second rule SAW `'b a'`, so the carry-forward happened; the
		// records are in rule order, and the entry holds both edits.
		expect(out.records.map((r) => r.detail)).toEqual(['first', 'b a']);
		expect(out.entry.content.senses[0]?.definition).toBe('b a!');
	});

	// biome-ignore lint/complexity/noExcessiveLinesPerFunction: one suite per behaviour; its cases share setup and read as a single table.
	describe('each gate is wired', () => {
		it('refuses invented text — checkNoNewText', () => {
			expect(() => applyTransforms(entry(), 'text-repairs', [upper])).toThrow(
				/introduced/u,
			);
		});

		// A rule may not lose a codepoint either, and until 2026-09-21
		// this phase was not checked at all: `checkNoLostText` ran for
		// `structural-repairs` alone, so a text-phase rule that deleted
		// text passed all four gates (review 2026-09-21, report-code §5).
		it('refuses deleted text in the TEXT phase — checkNoLostText', () => {
			const deleter = rewriter('deleter', 'ab');
			expect(() => applyTransforms(entry(), 'text-repairs', [deleter])).toThrow(
				/dropped " " \(U\+0020\)/u,
			);
		});

		it('refuses deleted text in the structural phase too', () => {
			const deleter = rewriter('deleter', 'ab', {
				phase: 'structural-repairs',
			});
			expect(() =>
				applyTransforms(entry(), 'structural-repairs', [deleter]),
			).toThrow(/dropped/u);
		});

		// The same deletion, declared per call, is the contract the gate
		// exists to enforce rather than a hole in it.
		it('accepts a deletion the rule declares', () => {
			const declared: Rule = {
				apply: (e: SourceEntry) => ({
					entry: { ...e, content: { senses: [{ definition: 'ab' }] } },
					records: [{ detail: 'joined', rid: e.rid, ruleId: 'joiner' }],
					removes: [' '],
				}),
				id: 'joiner',
				phase: 'text-repairs',
			};
			const out = applyTransforms(entry(), 'text-repairs', [declared]);
			expect(out.entry.content.senses[0]?.definition).toBe('ab');
		});

		it('refuses markup damage — checkMarkup', () => {
			const breaker = rewriter('breaker', '<i>a b');
			expect(() => applyTransforms(entry(), 'text-repairs', [breaker])).toThrow(
				/unmatched opening tag/u,
			);
		});

		it('refuses a minted link target — checkLinkTargets', () => {
			const linker: Rule = {
				apply: (e: SourceEntry) => ({
					entry: {
						...e,
						content: {
							senses: [
								{
									definition:
										'<a href="/w/invented" data-ref="Jastrow, invented">a b</a>',
								},
							],
						},
					},
					records: [{ detail: 'linked', rid: e.rid, ruleId: 'linker' }],
				}),
				id: 'linker',
				phase: 'text-repairs',
			};
			expect(() => applyTransforms(entry(), 'text-repairs', [linker])).toThrow(
				/linker:/u,
			);
		});
	});

	// `types.ts` on `Rule.apply` said an in-place mutator "breaks two
	// things silently ... Nothing detects this; the contract is the
	// defence". It is a check now: every gate compares VALUES, so a rule
	// that returns the object it was handed makes all four read the
	// mutated text on both sides and report clean.
	describe('the purity contract', () => {
		it('refuses a rule that mutated its input in place', () => {
			const mutator: Rule = {
				apply: (e: SourceEntry) => {
					const sense = e.content.senses[0];
					if (sense !== undefined) {
						sense.definition = 'WIPED';
					}
					return {
						entry: e,
						records: [{ detail: 'wiped', rid: e.rid, ruleId: 'mutator' }],
					};
				},
				id: 'mutator',
				phase: 'text-repairs',
			};
			expect(() => applyTransforms(entry(), 'text-repairs', [mutator])).toThrow(
				/mutated its input in place/u,
			);
		});

		// The realistic shape, and the one `Object.is` alone cannot see:
		// the rule mutates the sense tree and returns a shallow spread, so
		// the top-level objects differ while the array underneath is one
		// object. Every gate then reads the mutated text on both sides.
		it('refuses a rule that mutated a shared sense tree', () => {
			const sneak: Rule = {
				apply: (e: SourceEntry) => {
					const sense = e.content.senses[0];
					if (sense !== undefined) {
						sense.definition = 'text this entry never held';
					}
					return {
						entry: { ...e },
						records: [{ detail: 'sneaked', rid: e.rid, ruleId: 'sneak' }],
					};
				},
				id: 'sneak',
				phase: 'text-repairs',
			};
			expect(() => applyTransforms(entry(), 'text-repairs', [sneak])).toThrow(
				/mutated its input in place/u,
			);
		});

		// The guard must not fire on the normal no-match return, which is
		// the same reference with nothing reported.
		it('accepts the unchanged same-reference return', () => {
			const noop: Rule = {
				apply: (e: SourceEntry) => ({ entry: e, records: [] }),
				id: 'noop',
				phase: 'text-repairs',
			};
			const out = applyTransforms(entry(), 'text-repairs', [noop]);
			expect(out.records).toEqual([]);
			expect(out.entry).toEqual(entry());
		});
	});
});
