import { describe, expect, it } from 'bun:test';
import type { SourceEntry, SourceSense } from '../../body/types.ts';
import { applyTransforms } from '../run.ts';
import { strandedStemHead } from './stem-section.ts';

/** An entry whose first top-level sense carries the definition under
 * test and nothing else — the shape all 436 members share. */
const withHead = (
	definition: string,
	rest: SourceSense[] = [],
): SourceEntry => ({
	content: { senses: [{ definition }, ...rest] },
	headword: 'אָבַק',
	rid: 'A00189',
});

/** The form the corpus actually spells after a stranded head. */
const FORM = '<span dir="rtl">אִבֵּק</span>';
const TAIL = `${FORM} <i>to cover with powder</i>.`;

const blockOf = (entry: SourceEntry): SourceSense =>
	entry.content.senses[0] as SourceSense;

describe('strandedStemHead', () => {
	it('lifts the label into a grammar block and the rest into a child', () => {
		const result = strandedStemHead.apply(withHead(`, <i>Pi.</i> ${TAIL}`));
		const block = blockOf(result.entry);
		expect(block.grammar).toEqual({ verbal_stem: 'Pi.' });
		expect(block.definition).toBe('');
		expect(block.senses).toEqual([{ definition: TAIL }]);
		expect(result.records).toHaveLength(1);
	});

	it('declares the seam prefix and the label space it deletes', () => {
		const result = strandedStemHead.apply(withHead(`, <i>Pi.</i> ${TAIL}`));
		expect(result.removes).toEqual([', ', ' ']);
	});

	it('declares only the space when the definition opens with the run', () => {
		const result = strandedStemHead.apply(withHead(`<i>Af.</i> ${TAIL}`));
		expect(result.removes).toEqual([' ']);
		expect(blockOf(result.entry).grammar).toEqual({ verbal_stem: 'Af.' });
	});

	it('writes no binyan_form, leaving the anchor form in the prose', () => {
		const anchor = '<a dir="rtl" href="/x" data-ref="Jastrow, אִבֵּק 1">אִבֵּק</a>';
		const result = strandedStemHead.apply(
			withHead(`, <i>Pa.</i> ${anchor} same.`),
		);
		const block = blockOf(result.entry);
		expect(block.grammar?.binyan_form).toBeUndefined();
		expect(block.senses?.[0]?.definition).toBe(`${anchor} same.`);
	});

	it("keeps the sense's own number on the child, not on the block", () => {
		const result = strandedStemHead.apply({
			content: { senses: [{ definition: `<i>Pi.</i> ${TAIL}`, number: '1)' }] },
			headword: 'אָבַק',
			rid: 'A00189',
		});
		const block = blockOf(result.entry);
		expect(block.number).toBeUndefined();
		expect(block.senses?.[0]?.number).toBe('1)');
	});

	it("keeps the sense's own children after the new text child", () => {
		const child: SourceSense = { definition: 'Ib. 4ᵃ.' };
		const result = strandedStemHead.apply({
			content: {
				senses: [{ definition: `<i>Pi.</i> ${TAIL}`, senses: [child] }],
			},
			headword: 'אָבַק',
			rid: 'A00189',
		});
		expect(blockOf(result.entry).senses).toEqual([{ definition: TAIL }, child]);
	});

	it('leaves later top-level senses untouched', () => {
		const sibling: SourceSense = {
			grammar: { binyan_form: ['הִתְאַבֵּק'], verbal_stem: 'Hithpa.' },
			senses: [{ definition: 'to wrestle.' }],
		};
		const result = strandedStemHead.apply(
			withHead(`, <i>Pi.</i> ${TAIL}`, [sibling]),
		);
		expect(result.entry.content.senses[1]).toBe(sibling);
		expect(result.entry.content.senses).toHaveLength(2);
	});

	// Every refusal below is a slice the batch-6c report counts, and
	// each stays on the queue rather than being half-repaired. Tuples
	// rather than object literals: see the duplication note in
	// `punct-seams.test.ts`.
	const refused: [string, string][] = [
		['"= Label" cross-reference', ` = <i>Pa.</i> ${TAIL}`],
		['"Label of X" gloss', `, <i>Pi.</i> of <a href="/x">בָּסַם</a>.`],
		['etymology-paren remnant, close', '<i>Pi.</i>) <i>to be lax</i>.'],
		['etymology-paren remnant, semicolon', `<i>Pi.</i>; cmp. ${FORM})`],
		[
			'double head in one definition',
			`<i>Pa.</i>, ${FORM}, <i>Af.</i> ${FORM}`,
		],
		['label not in the vocabulary', `, <i>Fem.</i> ${TAIL}`],
		['non-stem italic gloss', `, <i>to cover</i> ${FORM}`],
		['nothing after the run', ', <i>Pi.</i>'],
		['no space after the run', `, <i>Pi.</i>${FORM}`],
	];
	for (const [name, definition] of refused) {
		it(`refuses ${name}`, () => {
			const input = withHead(definition);
			const result = strandedStemHead.apply(input);
			expect(result.entry).toBe(input);
			expect(result.records).toEqual([]);
		});
	}

	it('refuses a sense that already carries a grammar block', () => {
		const input: SourceEntry = {
			content: {
				senses: [
					{
						definition: `, <i>Pi.</i> ${TAIL}`,
						grammar: { verbal_stem: 'Pa.' },
					},
				],
			},
			headword: 'אָבַק',
			rid: 'A00189',
		};
		expect(strandedStemHead.apply(input).entry).toBe(input);
	});

	it('refuses a stranded head that is not sense 0', () => {
		const input = withHead('<i>to be dusty</i>.', [
			{ definition: `, <i>Pi.</i> ${TAIL}` },
		]);
		expect(strandedStemHead.apply(input).entry).toBe(input);
	});

	it('refuses a stranded head in a CHILD sense', () => {
		const input: SourceEntry = {
			content: {
				senses: [
					{ definition: '', senses: [{ definition: `, <i>Pi.</i> ${TAIL}` }] },
				],
			},
			headword: 'אָבַק',
			rid: 'A00189',
		};
		expect(strandedStemHead.apply(input).entry).toBe(input);
	});

	it('is idempotent: the repaired entry no longer matches', () => {
		const once = strandedStemHead.apply(withHead(`, <i>Pi.</i> ${TAIL}`));
		const twice = strandedStemHead.apply(once.entry);
		expect(twice.entry).toBe(once.entry);
		expect(twice.records).toEqual([]);
	});

	it('clears all four gates through the phase runner', () => {
		const run = applyTransforms(
			withHead(`, <i>Pi.</i> ${TAIL}`),
			'structural-repairs',
			[strandedStemHead],
		);
		expect(run.records).toHaveLength(1);
		expect(blockOf(run.entry).grammar?.verbal_stem).toBe('Pi.');
	});
});
