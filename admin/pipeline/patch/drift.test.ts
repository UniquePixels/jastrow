// biome-ignore-all lint/style/noExcessiveLinesPerFile: a table-driven suite; one describe per op's post-state, sharing the patch fixture.
import { describe, expect, it } from 'bun:test';
import type { SourceEntry, SourceSense } from '../types.ts';
import { classifyDrift, type DriftOutcome } from './drift.ts';
import { contentAnchor, type SemanticPatch } from './schema.ts';

const PIN = `sha256:${'a'.repeat(64)}`;
const OCR_BEFORE = 'l) emergency. Nidd. 9b';

/** A replace patch fixing an OCR `l)` → `1)`, overridable per test. */
function patch(overrides: Partial<SemanticPatch> = {}): SemanticPatch {
	const before = overrides.expected_before ?? OCR_BEFORE;
	return {
		defect_class: 'ocr-marker',
		expected_before: before,
		expected_occurrences: 1,
		id: 'P000001',
		occurrence_index: 1,
		op: 'replace',
		payload: { find: 'l)', replace: '1)' },
		prompt_version: 'v1',
		rationale: 'fixture',
		rid: 'D00436',
		snapshot: PIN,
		target: `sense[]:${contentAnchor(before)}`,
		...overrides,
	} as SemanticPatch;
}

function entryWith(...senses: SourceSense[]): SourceEntry {
	return { content: { senses }, headword: 'test-word', rid: 'D00436' };
}

// biome-ignore lint/complexity/noExcessiveLinesPerFunction: one suite per behaviour; its cases share setup and read as a single table.
describe('classifyDrift', () => {
	it('is undefined when the precondition holds', () => {
		expect(
			classifyDrift(entryWith({ definition: OCR_BEFORE }), patch()),
		).toBeUndefined();
	});

	it('is upstream-fixed when the source already reads as the replace leaves it', () => {
		const entry = entryWith({ definition: '1) emergency. Nidd. 9b' });
		expect(classifyDrift(entry, patch())).toBe('upstream-fixed');
	});

	it('is upstream-changed when the source reads as neither before nor after', () => {
		const entry = entryWith({ definition: 'l) emergency. Nidd. 10a' });
		expect(classifyDrift(entry, patch())).toBe('upstream-changed');
	});

	it('compares the number token too: a retag already applied is upstream-fixed', () => {
		const before = 'pressure, need.';
		const retag = patch({
			expected_before: before,
			op: 'retag',
			payload: { number: '2)' },
			target: `sense[—2)]:${contentAnchor(before)}`,
		});
		expect(
			classifyDrift(entryWith({ definition: before, number: '2)' }), retag),
		).toBe('upstream-fixed');
	});

	it('matches a split as a contiguous sibling run', () => {
		const split = patch({
			expected_before: 'a thing. 2) other thing',
			op: 'split',
			payload: { marker: '2)' },
		});
		const entry = entryWith(
			{ definition: 'a thing. ' },
			{ definition: ' other thing', number: '2)' },
		);
		expect(classifyDrift(entry, split)).toBe('upstream-fixed');
	});

	it('calls a nest fixed only when the list under the lead is the same list', () => {
		const before = 'host.—Hence X, 1) one.—2) two.';
		const nest = patch({
			expected_before: before,
			op: 'nest',
			payload: { lead: '—Hence X, ', markers: ['1)', '—2)'] },
			target: `sense[—2)]:${contentAnchor(before)}`,
		});
		const nested = (second: string): SourceEntry =>
			entryWith(
				{ definition: 'host.', number: '—2)' },
				{
					definition: '—Hence X, ',
					senses: [
						{ definition: ' one.', number: '1)' },
						{ definition: second, number: '—2)' },
					],
				},
			);
		expect(classifyDrift(nested(' two.'), nest)).toBe('upstream-fixed');
		// The same lead over a different list is a change, not the fix.
		expect(classifyDrift(nested(' three.'), nest)).toBe('upstream-changed');
		// A list item that grew children upstream is not the item the nest makes.
		const grown = nested(' two.');
		const item = grown.content.senses[1]?.senses?.[1];
		if (item !== undefined) {
			item.senses = [{ definition: ' sub.', number: 'a)' }];
		}
		expect(classifyDrift(grown, nest)).toBe('upstream-changed');
	});

	it('finds the post-state at any depth', () => {
		const entry = entryWith({
			definition: 'head',
			senses: [{ definition: '1) emergency. Nidd. 9b' }],
		});
		expect(classifyDrift(entry, patch())).toBe('upstream-fixed');
	});

	it('never calls a sense-deleting patch fixed: a gone sense looks like an edit', () => {
		const deleting = patch({ op: 'delete', payload: { scope: 'sense' } });
		expect(classifyDrift(entryWith({ definition: 'other' }), deleting)).toBe(
			'upstream-changed',
		);
	});

	it('calls a partial count changed even when one sense reads as fixed', () => {
		const twice = patch({ expected_occurrences: 2 });
		const entry = entryWith(
			{ definition: OCR_BEFORE },
			{ definition: '1) emergency. Nidd. 9b' },
		);
		expect(classifyDrift(entry, twice)).toBe('upstream-changed');
	});

	it('calls a patch that cannot apply to its own expected_before changed', () => {
		const broken = patch({ payload: { find: 'zz', replace: 'yy' } });
		expect(classifyDrift(entryWith({ definition: 'other' }), broken)).toBe(
			'upstream-changed',
		);
	});

	it('never calls a multi-occurrence patch fixed: found===0 means every occurrence changed', () => {
		const twice = patch({ expected_occurrences: 2 });
		const entry = entryWith({ definition: '1) emergency. Nidd. 9b' });
		expect(classifyDrift(entry, twice)).toBe('upstream-changed');
	});

	const ITEM = 'Yoma 2a';
	const unref = patch({
		expected_before: ITEM,
		op: 'unref',
		payload: {},
		target: `refs[${ITEM}]:${contentAnchor(ITEM)}`,
	});
	const withRefs = (...refs: string[]): SourceEntry => ({
		content: { senses: [{ definition: 'x' }] },
		headword: 'test-word',
		refs,
		rid: 'D00436',
	});

	it('is upstream-fixed for an unref whose item is already gone', () => {
		expect(classifyDrift(withRefs('Pes. 4b'), unref)).toBe('upstream-fixed');
	});

	it('is upstream-changed for an unref whose item now appears twice', () => {
		expect(classifyDrift(withRefs(ITEM, ITEM), unref)).toBe('upstream-changed');
	});

	const PHANTOM = ' night. Ber. 2a';
	const join = patch({
		expected_before: PHANTOM,
		op: 'join',
		payload: {},
		target: `sense[2)]:${contentAnchor(PHANTOM)}`,
	});

	it('is upstream-fixed for a join whose phantom Sefaria already folded back', () => {
		const entry = entryWith(
			{ definition: 'day2) night. Ber. 2a', number: '1)' },
			{ definition: 'dusk', number: '3)' },
		);
		expect(classifyDrift(entry, join)).toBe('upstream-fixed');
	});

	it('is upstream-fixed for a folded join mid-definition, found exactly once', () => {
		const entry = entryWith({
			definition: 'day2) night. Ber. 2a; also dusk',
			number: '1)',
		});
		expect(classifyDrift(entry, join)).toBe('upstream-fixed');
	});

	it('is upstream-changed when the folded text appears twice', () => {
		// Two copies, the second ending a definition: which one is the
		// fold is ambiguous, so it must not read as fixed.
		const entry = entryWith(
			{ definition: 'day2) night. Ber. 2a', number: '1)' },
			{ definition: 'dusk2) night. Ber. 2a', number: '3)' },
		);
		expect(classifyDrift(entry, join)).toBe('upstream-changed');
	});

	it('is upstream-changed for a join whose phantom was rewritten', () => {
		const entry = entryWith(
			{ definition: 'day', number: '1)' },
			{ definition: ' night. Ber. 2b', number: '2)' },
		);
		expect(classifyDrift(entry, join)).toBe('upstream-changed');
	});
});

describe('classifyDrift on a reform', () => {
	const reform = (before: string): SemanticPatch =>
		patch({
			expected_before: before,
			op: 'reform',
			payload: { forms: ['ab'] },
			target: `forms:${contentAnchor(before)}`,
		} as Partial<SemanticPatch>);

	function formsEntry(headword: string, alts?: string[]): SourceEntry {
		return {
			...(alts === undefined ? {} : { alt_headwords: alts }),
			content: { senses: [{ definition: 'x' }] },
			headword,
			rid: 'D00436',
		};
	}

	it('is undefined while the block still reads as written', () => {
		expect(
			classifyDrift(formsEntry('a', ['b']), reform('a\nb')),
		).toBeUndefined();
	});

	it('is upstream-fixed when the block already reads as the patch would leave it', () => {
		expect(classifyDrift(formsEntry('ab'), reform('a\nb'))).toBe(
			'upstream-fixed',
		);
	});

	it('is upstream-changed when the block moved somewhere else', () => {
		expect(classifyDrift(formsEntry('a', ['b', 'c']), reform('a\nb'))).toBe(
			'upstream-changed',
		);
	});
	it('is upstream-fixed for a gloss reform only when the gloss arrived too', () => {
		// A line fixed upstream by DROPPING `= Y` lost the reference.
		const lifting = patch({
			expected_before: 'x = y',
			op: 'reform',
			payload: { forms: ['x'], gloss: ' = y' },
			target: `forms:${contentAnchor('x = y')}`,
		} as Partial<SemanticPatch>);
		const fixed: SourceEntry = {
			content: { senses: [{ definition: ' = y' }] },
			headword: 'x',
			rid: 'D00436',
		};
		const dropped: SourceEntry = {
			content: { senses: [] },
			headword: 'x',
			rid: 'D00436',
		};
		const extended: SourceEntry = {
			...fixed,
			content: { senses: [{ definition: ' = y' }, { definition: 'more' }] },
		};
		expect(classifyDrift(fixed, lifting)).toBe('upstream-fixed');
		expect(classifyDrift(dropped, lifting)).toBe('upstream-changed');
		// The gloss beside other senses is not the state the patch leaves.
		expect(classifyDrift(extended, lifting)).toBe('upstream-changed');
	});
});

describe('classifyDrift on a reform that sets homographs', () => {
	it('is never upstream-fixed for a reform that sets homographs', () => {
		// Upstream cannot write our `homographs`, so a block that already
		// reads as the forms is only half of what the patch leaves;
		// skipping it would drop the numeral without a word.
		const numbering = patch({
			expected_before: 'a\nb',
			op: 'reform',
			payload: { forms: ['ab'], homographs: [{ form: 0, homograph: 1 }] },
			target: `forms:${contentAnchor('a\nb')}`,
		} as Partial<SemanticPatch>);
		expect(
			classifyDrift(
				{
					content: { senses: [{ definition: 'x' }] },
					headword: 'ab',
					rid: 'D00436',
				},
				numbering,
			),
		).toBe('upstream-changed');
	});
});

describe('classifyDrift on a language_reference replace', () => {
	const before = ' I (b. h.; = x)';
	const lifting = patch({
		expected_before: before,
		payload: { find: ' I (', replace: ' (' },
		target: `language_reference:${contentAnchor(before)}`,
	});
	const withReference = (reference: string): SourceEntry => ({
		...entryWith({ definition: 'to blow.' }),
		language_reference: reference,
	});

	it.each<[string, string, DriftOutcome | undefined]>([
		['undefined: the field reads as written', before, undefined],
		[
			'fixed: it reads as the patch leaves it',
			' (b. h.; = x)',
			'upstream-fixed',
		],
		['changed: it moved elsewhere', ' I (b. h.; = y)', 'upstream-changed'],
	])('is %s', (_name, reference, outcome) => {
		expect(classifyDrift(withReference(reference), lifting)).toBe(outcome);
	});

	it('is upstream-changed when the field is gone: the head lost its paren', () => {
		expect(classifyDrift(entryWith({ definition: 'to blow.' }), lifting)).toBe(
			'upstream-changed',
		);
	});
});

// L59: a relabel changes no text, so the text it declares a run over
// cannot be seen fixed upstream: Sefaria's dump sets no lettered child
// senses for the build to label. A moved target is always a change.
describe('classifyDrift on a relabel', () => {
	const before = 'lead a) one b) two d) three.';
	const relabel = patch({
		expected_before: before,
		op: 'relabel',
		payload: { run: ['a', 'b', 'd'], to: ['a', 'b', 'c'] },
		target: `sense[]:${contentAnchor(before)}`,
	});

	it.each<[string, string, DriftOutcome | undefined]>([
		['undefined: the text reads as written', before, undefined],
		[
			'changed: the gap closed upstream',
			'lead a) one b) two c) three.',
			'upstream-changed',
		],
		['changed: the text moved', 'lead a) one b) two.', 'upstream-changed'],
	])('is %s', (_name, definition, outcome) => {
		expect(classifyDrift(entryWith({ definition }), relabel)).toBe(outcome);
	});
});
