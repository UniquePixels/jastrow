// biome-ignore-all lint/style/noExcessiveLinesPerFile: one suite for the patch half of annotations: the record's field, the annotate op, and how each annotated op leaves its draft.
/**
 * The patch half of annotations (ANNOTATIONS.md §3; ruling `10-13
 * correction policy`): a reviewed patch's optional `annotation`, the
 * `annotate` op, and the draft each annotated op leaves on the entry
 * for the build to carry to its field. What the import adds — `field`,
 * `stored`, `source` — is finished in `import/finish.ts`; this suite
 * pins what the patch side hands it.
 */
import { describe, expect, it } from 'bun:test';
import type { SourceEntry } from '../types.ts';
import {
	applyEntryPatches,
	corpusPreflight,
	postApplyAssertions,
} from './apply.ts';
import { classifyDrift } from './drift.ts';
import { validateNoNewText } from './no-new-text.ts';
import {
	applyPatch,
	contentAnchor,
	formsBlock,
	PatchApplyError,
	parsePatch,
	type SemanticPatch,
} from './schema.ts';

const PIN = `sha256:${'0'.repeat(64)}`;
const NOTE: Record<string, string> = {
	date: '2026-10-13',
	evidence: 'a 2) follows an unlabelled first sense',
	kind: 'print-error',
	printed: '',
};
const KEPT: Record<string, string> = {
	...NOTE,
	kind: 'kept',
	printed: 'a)',
};

/** One unnumbered first sense, a numbered second, and a two-form line
 * whose first form carries no numeral. */
function makeEntry(): SourceEntry {
	return {
		alt_headwords: ['אבא'],
		content: {
			senses: [
				{ definition: 'to be first. Ber. 2ᵃ.' },
				{ definition: 'to follow, v. אבא.', number: '—2)' },
			],
		},
		headword: 'אב',
		rid: 'A00001',
	};
}

/** A record for `parsePatch`, aimed at `makeEntry()`'s first sense
 * unless a target and `expected_before` are given. */
function raw(over: Record<string, unknown>): Record<string, unknown> {
	const before = 'to be first. Ber. 2ᵃ.';
	return {
		confidence: 'high',
		defect_class: 'test',
		expected_before: before,
		id: 'P000001',
		prompt_version: 'human-review',
		rationale: 'r',
		rid: 'A00001',
		snapshot: PIN,
		target: `sense[]:${contentAnchor(before)}`,
		...over,
	};
}

/** `raw` aimed at the headword block. */
function rawForms(over: Record<string, unknown>): Record<string, unknown> {
	const before = formsBlock(makeEntry());
	return raw({
		expected_before: before,
		target: `forms:${contentAnchor(before)}`,
		...over,
	});
}

/** The reasons `parsePatch` refuses a record with, or `[]`. */
function reasons(record: Record<string, unknown>): string[] {
	try {
		parsePatch(record);
		return [];
	} catch (error) {
		return (error as { reasons?: string[] }).reasons ?? [String(error)];
	}
}

/** A parsed patch, stamped human as the reviewed loader stamps it. */
function human(record: Record<string, unknown>): SemanticPatch {
	return { ...parsePatch(record), author: 'human' };
}

const retag = { op: 'retag', payload: { number: '1)' } };
const replace = {
	op: 'replace',
	payload: { find: 'Ber.', replace: 'Berakh.' },
};
const homographs = {
	op: 'reform',
	payload: { forms: ['אב', 'אבא'], homographs: [{ form: 0, homograph: 1 }] },
};

// biome-ignore lint/complexity/noExcessiveLinesPerFunction: one table, one row per case; splitting it would scatter the rule it pins.
describe('the annotation field: parsePatch', () => {
	it.each([
		['a retag', raw({ ...retag, annotation: NOTE })],
		['a replace', raw({ ...replace, annotation: NOTE })],
		['a reform with homographs', rawForms({ ...homographs, annotation: NOTE })],
		[
			'a reform of the forms',
			rawForms({
				annotation: NOTE,
				op: 'reform',
				payload: { forms: ['אבב', 'אבא'] },
			}),
		],
		[
			'an annotate on a sense label',
			raw({ annotation: KEPT, op: 'annotate', payload: { field: 'label' } }),
		],
		[
			'an annotate on a form',
			rawForms({
				annotation: KEPT,
				op: 'annotate',
				payload: { field: 'text', form: 0 },
			}),
		],
	])('carries it on %s', (_name, record) => {
		expect(reasons(record)).toEqual([]);
		expect(parsePatch(record).annotation).toEqual(
			record['annotation'] as never,
		);
	});

	it('leaves the key off a patch without one', () => {
		expect('annotation' in parsePatch(raw(retag))).toBe(false);
	});

	it.each([
		[
			'split',
			raw({ annotation: NOTE, op: 'split', payload: { marker: '—2)' } }),
		],
		[
			'join',
			raw({
				annotation: NOTE,
				op: 'join',
				payload: {},
				target: `sense[—2)]:${contentAnchor('x')}`,
				expected_before: 'x',
			}),
		],
		[
			'nest',
			raw({
				annotation: NOTE,
				op: 'nest',
				payload: { lead: 'Ber.', markers: ['1)'] },
			}),
		],
		[
			'move',
			raw({
				annotation: NOTE,
				op: 'move',
				payload: { anchor: 'to', position: 'after', segment: 'Ber.' },
			}),
		],
		[
			'delete',
			raw({ annotation: NOTE, op: 'delete', payload: { scope: 'sense' } }),
		],
		[
			'unref',
			raw({
				annotation: NOTE,
				expected_before: 'Ber. 2a',
				op: 'unref',
				payload: {},
				target: `refs[Ber. 2a]:${contentAnchor('Ber. 2a')}`,
			}),
		],
	])('refuses it on %s, which cannot change a printed value', (op, record) => {
		expect(reasons(record)).toEqual([
			`an annotation on ${op}: the op cannot change a printed value (ANNOTATIONS.md §3)`,
		]);
	});

	it.each([
		['not an object', 'x', 'annotation must be an object'],
		[
			'a kind outside the enum',
			{ ...NOTE, kind: 'typo' },
			'annotation.kind must be illegible, kept or print-error',
		],
		[
			'a printed that is not a string',
			{ ...NOTE, printed: 1 },
			'annotation.printed must be a string',
		],
		[
			'an empty evidence',
			{ ...NOTE, evidence: '' },
			'annotation.evidence must be a non-empty string',
		],
		[
			'a date that is no calendar day',
			{ ...NOTE, date: '2026-02-30' },
			'annotation.date must be an ISO date (YYYY-MM-DD)',
		],
		[
			'a field the import adds',
			{ ...NOTE, stored: '1' },
			'annotation.stored is not a patch field: the import adds field, stored and source',
		],
	])('refuses %s', (_name, annotation, reason) => {
		expect(reasons(raw({ ...retag, annotation }))).toEqual([reason]);
	});

	it.each([
		[
			'two homographs',
			rawForms({
				annotation: NOTE,
				op: 'reform',
				payload: {
					forms: ['אב', 'אבא'],
					homographs: [
						{ form: 0, homograph: 1 },
						{ form: 1, homograph: 2 },
					],
				},
			}),
			'an annotated reform sets exactly one homograph, the one it annotates',
		],
		[
			'an empty replacement',
			raw({
				annotation: NOTE,
				op: 'replace',
				payload: { find: 'Ber.', replace: '' },
			}),
			'an annotated replace needs a non-empty replacement: it is what the annotation finds',
		],
	])(
		'refuses an annotated reform or replace with %s',
		(_name, record, reason) => {
			expect(reasons(record)).toEqual([reason]);
		},
	);
});

// biome-ignore lint/complexity/noExcessiveLinesPerFunction: one table, one row per case; splitting it would scatter the rule it pins.
describe('the annotate op: parsePatch', () => {
	it.each([
		[
			'no annotation',
			raw({ op: 'annotate', payload: { field: 'label' } }),
			'annotate needs an annotation',
		],
		[
			'a print-error',
			raw({ annotation: NOTE, op: 'annotate', payload: { field: 'label' } }),
			'annotate carries only a kept annotation: a correction belongs on the op that makes it',
		],
		[
			'an unknown field',
			raw({ annotation: KEPT, op: 'annotate', payload: { field: 'stem' } }),
			'annotate payload.field must be gloss, homograph, label, text or units',
		],
		[
			'a form field on a sense',
			raw({
				annotation: KEPT,
				op: 'annotate',
				payload: { field: 'text', form: 0 },
			}),
			'annotate on text needs a forms: target',
		],
		[
			'a sense field on the forms',
			rawForms({
				annotation: KEPT,
				op: 'annotate',
				payload: { field: 'gloss' },
			}),
			'annotate on gloss needs a sense[…] target',
		],
		[
			'a form field with no form',
			rawForms({
				annotation: KEPT,
				op: 'annotate',
				payload: { field: 'homograph' },
			}),
			'annotate payload.form must be a form index (a non-negative integer)',
		],
		[
			'a form on a sense field',
			raw({
				annotation: KEPT,
				op: 'annotate',
				payload: { field: 'label', form: 0 },
			}),
			'annotate payload.form is only for homograph and text',
		],
	])('refuses %s', (_name, record, reason) => {
		expect(reasons(record)).toEqual([reason]);
	});

	it('takes a forms: target only once, like reform', () => {
		expect(
			reasons(
				rawForms({
					annotation: KEPT,
					expected_occurrences: 2,
					op: 'annotate',
					payload: { field: 'text', form: 0 },
				}),
			),
		).toEqual([
			'annotate on the forms: expected_occurrences and occurrence_index must both be 1',
		]);
	});
});

// biome-ignore lint/complexity/noExcessiveLinesPerFunction: one table, one row per case; splitting it would scatter the rule it pins.
describe('applyPatch: the draft each annotated op leaves', () => {
	it('retag: a label draft on the retagged sense', () => {
		const after = applyPatch(
			makeEntry(),
			human(raw({ ...retag, annotation: NOTE, id: 'P000007' })),
		);
		expect(after.content.senses[0]).toEqual({
			annotations: [{ ...NOTE, field: 'label', source: 'P000007' }],
			definition: 'to be first. Ber. 2ᵃ.',
			number: '1)',
		} as never);
	});

	it('replace: a draft that finds the replacement in the gloss or a unit', () => {
		const after = applyPatch(
			makeEntry(),
			human(raw({ ...replace, annotation: NOTE })),
		);
		expect(after.content.senses[0]?.annotations).toEqual([
			{ ...NOTE, field: 'gloss-or-units', find: 'Berakh.', source: 'P000001' },
		] as never);
	});

	it('reform with homographs: a homograph draft on the form it numbers', () => {
		const after = applyPatch(
			makeEntry(),
			human(rawForms({ ...homographs, annotation: NOTE })),
		);
		expect(after.formAnnotations).toEqual([
			{ ...NOTE, field: 'homograph', form: 0, source: 'P000001' },
		] as never);
	});

	it('reform of the forms: a text draft on the one form it changed', () => {
		const after = applyPatch(
			makeEntry(),
			human(
				rawForms({
					annotation: NOTE,
					op: 'reform',
					payload: { forms: ['אב', 'אבב'] },
				}),
			),
		);
		expect(after.formAnnotations).toEqual([
			{ ...NOTE, field: 'text', form: 1, source: 'P000001' },
		] as never);
	});

	it.each([
		['no form', ['אב', 'אבא'], 'changes 0 forms'],
		['two forms', ['אג', 'אבב'], 'changes 2 forms'],
		['the number of forms', ['אב'], 'changes the number of forms (2 → 1)'],
	])(
		'refuses an annotated reform of the forms that changes %s',
		(_name, forms, what) => {
			const patch = human(
				rawForms({ annotation: NOTE, op: 'reform', payload: { forms } }),
			);
			expect(() => applyPatch(makeEntry(), patch)).toThrow(
				`an annotated reform of the forms must change exactly one form's text; this one ${what}`,
			);
		},
	);

	it('annotate on a sense: changes nothing but the draft', () => {
		const before = makeEntry();
		const [, target] = before.content.senses;
		const patch = human(
			raw({
				annotation: { ...KEPT, printed: '2' },
				expected_before: target?.definition,
				op: 'annotate',
				payload: { field: 'label' },
				target: `sense[—2)]:${contentAnchor(target?.definition ?? '')}`,
			}),
		);
		const after = applyPatch(before, patch);
		expect(after.content.senses[1]).toEqual({
			...target,
			annotations: [
				{ ...KEPT, field: 'label', printed: '2', source: 'P000001' },
			],
		} as never);
		expect(after.content.senses[0]).toEqual(before.content.senses[0] as never);
	});

	it('annotate on gloss or units: the draft finds what print set', () => {
		const after = applyPatch(
			makeEntry(),
			human(
				raw({
					annotation: { ...KEPT, printed: 'Ber.' },
					op: 'annotate',
					payload: { field: 'units' },
				}),
			),
		);
		expect(after.content.senses[0]?.annotations).toEqual([
			{
				...KEPT,
				field: 'units',
				find: 'Ber.',
				printed: 'Ber.',
				source: 'P000001',
			},
		] as never);
	});

	it('annotate on a form: a form draft, the line untouched', () => {
		const before = makeEntry();
		const after = applyPatch(
			before,
			human(
				rawForms({
					annotation: { ...KEPT, printed: 'אבא' },
					op: 'annotate',
					payload: { field: 'text', form: 1 },
				}),
			),
		);
		expect(formsBlock(after)).toBe(formsBlock(before));
		expect(after.formAnnotations).toEqual([
			{ ...KEPT, field: 'text', form: 1, printed: 'אבא', source: 'P000001' },
		] as never);
	});

	it('annotate fails loudly when the text it pins moved', () => {
		const patch = human(
			rawForms({
				annotation: KEPT,
				op: 'annotate',
				payload: { field: 'text', form: 0 },
			}),
		);
		const moved = { ...makeEntry(), headword: 'אג' };
		expect(() => applyPatch(moved, patch)).toThrow(PatchApplyError);
	});

	it('annotate on a label refuses an unnumbered sense', () => {
		const patch = human(
			raw({ annotation: KEPT, op: 'annotate', payload: { field: 'label' } }),
		);
		expect(() => applyPatch(makeEntry(), patch)).toThrow(
			'annotate on a label: the sense has no number',
		);
	});
});

describe('annotate through the apply gates', () => {
	const annotate = (): SemanticPatch =>
		human(
			raw({
				annotation: { ...KEPT, printed: 'Ber.' },
				op: 'annotate',
				payload: { field: 'gloss' },
			}),
		);

	it('adds no text: the no-new-text floor passes it', () => {
		const before = makeEntry();
		expect(
			validateNoNewText(annotate(), before, applyPatch(before, annotate())),
		).toEqual({ ok: true });
	});

	it('passes the post-apply assertion though its target still resolves', () => {
		const before = makeEntry();
		expect(() =>
			postApplyAssertions(before, applyPatch(before, annotate()), annotate()),
		).not.toThrow();
	});

	it('is never upstream-fixed: a kept note on text that is gone is a change', () => {
		const moved = makeEntry();
		moved.content.senses[0] = { definition: 'rewritten.' };
		expect(classifyDrift(moved, annotate())).toBe('upstream-changed');
	});

	it('lists every applied patch that carries an annotation', () => {
		// The annotate first: the retag renumbers the sense both target.
		const result = applyEntryPatches(makeEntry(), [
			annotate(),
			human(raw({ ...retag, annotation: NOTE, id: 'P000002' })),
		]);
		expect(result.problems).toEqual([]);
		expect(result.annotated).toEqual(['P000001', 'P000002']);
	});

	it('does not list an annotated patch that failed to apply', () => {
		const stale = human(
			raw({
				...replace,
				annotation: NOTE,
				expected_before: 'gone',
				target: `sense[]:${contentAnchor('gone')}`,
			}),
		);
		expect(applyEntryPatches(makeEntry(), [stale]).annotated).toEqual([]);
	});
});

describe('corpusPreflight: an annotation is a person’s', () => {
	it('refuses an annotation on an agent patch', () => {
		const agent = parsePatch(raw({ ...retag, annotation: NOTE }));
		expect(
			corpusPreflight([agent], [], PIN, {
				escalations: 'defer',
				reconcileOnly: [],
			}),
		).toEqual([
			{
				patchId: 'P000001',
				reason:
					'an annotation on an agent patch: only a reviewed patch, written from the print, may carry one',
				rid: 'A00001',
			},
		]);
	});

	it('passes the same patch stamped human', () => {
		expect(
			corpusPreflight([human(raw({ ...retag, annotation: NOTE }))], [], PIN, {
				escalations: 'defer',
				reconcileOnly: [],
			}),
		).toEqual([]);
	});
});
