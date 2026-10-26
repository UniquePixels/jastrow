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

/** A parsed patch, stamped human as the reviewed loader stamps it,
 * with the print read every reviewed patch states (ruling `10-26 patch
 * evidence`) unless the record gives its own. */
function human(record: Record<string, unknown>): SemanticPatch {
	const evidence = { date: '2026-10-26', kind: 'maintainer-read', reader: 'T' };
	return { ...parsePatch({ evidence, ...record }), author: 'human' };
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

// L59: a relabel edits no text and changes no target, so it passes the
// gates the way an annotate does, and it owes one annotation per label
// it changes: gate 10 reads that count off `annotated`.
describe('relabel through the apply gates', () => {
	const gapped = 'lead a) one b) two d) three e) four.';
	const entry = (): SourceEntry => ({
		...makeEntry(),
		content: { senses: [{ definition: gapped }] },
	});
	const record = raw({
		annotation: NOTE,
		expected_before: gapped,
		op: 'relabel',
		payload: { run: ['a', 'b', 'd', 'e'], to: ['a', 'b', 'c', 'd'] },
		target: `sense[]:${contentAnchor(gapped)}`,
	});
	const relabel = (): SemanticPatch => human(record);

	it('adds no text and passes the post-apply assertion', () => {
		const before = entry();
		const after = applyPatch(before, relabel());
		expect(validateNoNewText(relabel(), before, after)).toEqual({ ok: true });
		expect(() => postApplyAssertions(before, after, relabel())).not.toThrow();
	});

	it('is listed once per label it changes', () => {
		const result = applyEntryPatches(entry(), [relabel()]);
		expect(result.problems).toEqual([]);
		expect(result.annotated).toEqual(['P000001', 'P000001']);
	});

	it('is refused unstamped: a relabel is a person’s', () => {
		expect(
			corpusPreflight([parsePatch(record)], [], PIN, {
				escalations: 'defer',
				reconcileOnly: [],
			}).map((p) => p.reason),
		).toEqual([
			'an annotation on an agent patch: only a reviewed patch, written from the print, may carry one',
		]);
	});
});

// L57: a relabel that changes no label (J00403's whole run) owes and
// carries no annotation, so gate 10 lists it never; it is still a
// person's reading of print, so an agent may not write one.
describe('a relabel that changes no label through the apply gates', () => {
	const whole = 'lead a) one b) two c) three.';
	const unchanged = raw({
		expected_before: whole,
		op: 'relabel',
		payload: { run: ['a', 'b', 'c'], to: ['a', 'b', 'c'] },
		target: `sense[]:${contentAnchor(whole)}`,
	});

	it('is listed never when it changes no label', () => {
		const result = applyEntryPatches(
			{ ...makeEntry(), content: { senses: [{ definition: whole }] } },
			[human(unchanged)],
		);
		expect(result.problems).toEqual([]);
		expect(result.annotated).toEqual([]);
	});

	it('is refused unstamped even when it carries no annotation', () => {
		expect(
			corpusPreflight([parsePatch(unchanged)], [], PIN, {
				escalations: 'defer',
				reconcileOnly: [],
			}).map((p) => p.reason),
		).toEqual([
			'a relabel on an agent patch: only a reviewed patch, written from the print, may declare a run',
		]);
	});
});

// biome-ignore lint/complexity/noExcessiveLinesPerFunction: one chain, three views of it (apply, order, preflight); splitting it would scatter the fixture.
describe('two reforms on one rid chain in corpus order', () => {
	// S01780's shape (correction audit §4): a torn alternate rejoined by
	// a reform that changes the number of forms, so it cannot carry an
	// annotation, then the rejoined form respelled by a second reform
	// that does. The second targets the block the first leaves.
	const torn: SourceEntry = {
		alt_headwords: ['קִצ', 'ּא', 'קִי׳'],
		content: { senses: [{ definition: 'ch. same.' }] },
		headword: 'קֵץ',
		rid: 'A00001',
	};
	const joined = ['קֵץ', 'קִצּא', 'קִי׳'];
	const respelled = ['קֵץ', 'קִצָּא', 'קִי׳'];
	const ILLEGIBLE = { ...NOTE, kind: 'illegible', printed: 'קִצּא' };
	const rejoin = (): SemanticPatch => {
		const before = formsBlock(torn);
		return human(
			raw({
				expected_before: before,
				id: 'P000001',
				op: 'reform',
				payload: { forms: joined },
				target: `forms:${contentAnchor(before)}`,
			}),
		);
	};
	const respell = (): SemanticPatch => {
		const before = joined.join('\n');
		return human(
			raw({
				annotation: ILLEGIBLE,
				expected_before: before,
				id: 'P000002',
				op: 'reform',
				payload: { forms: respelled },
				target: `forms:${contentAnchor(before)}`,
			}),
		);
	};

	it('applies the rejoin, then the annotated respelling of the form it made', () => {
		const result = applyEntryPatches(torn, [rejoin(), respell()]);
		expect(result.problems).toEqual([]);
		expect(result.annotated).toEqual(['P000002']);
		expect(formsBlock(result.entry)).toBe(respelled.join('\n'));
		expect(result.entry.formAnnotations).toEqual([
			{ ...ILLEGIBLE, field: 'text', form: 1, source: 'P000002' },
		] as never);
	});

	it('fails the respelling when it comes first: its block does not exist yet', () => {
		const result = applyEntryPatches(torn, [respell(), rejoin()]);
		expect(result.problems.map((p) => p.patchId)).toEqual(['P000002']);
		expect(result.annotated).toEqual([]);
		expect(formsBlock(result.entry)).toBe(joined.join('\n'));
	});

	it('passes the corpus preflight: the two targets differ by hash', () => {
		expect(
			corpusPreflight([rejoin(), respell()], [], PIN, {
				escalations: 'defer',
				reconcileOnly: [],
			}),
		).toEqual([]);
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

// biome-ignore lint/complexity/noExcessiveLinesPerFunction: one table, one row per case; splitting it would scatter the rule it pins.
describe('language_reference: the annotation lands on the gloss head', () => {
	// The import folds the field into `senses[0]`'s gloss head
	// (`body/rejoin.ts`), so its draft rides source sense 0, the sense
	// that head is built on, and names the gloss.
	const reference = ' (b. h.; = אבב)';
	const withReference = (senses = makeEntry().content.senses): SourceEntry => ({
		...makeEntry(),
		content: { senses },
		language_reference: reference,
	});
	const rawReference = (
		over: Record<string, unknown>,
	): Record<string, unknown> =>
		raw({
			expected_before: reference,
			target: `language_reference:${contentAnchor(reference)}`,
			...over,
		});
	const replaceReference = {
		op: 'replace',
		payload: { find: '= אבב', replace: '= אבא' },
	};
	const annotateReference = {
		annotation: { ...KEPT, printed: 'אבב' },
		op: 'annotate',
		payload: { field: 'gloss' },
	};

	it('replace: a gloss draft on the first sense, finding the replacement', () => {
		const after = applyPatch(
			withReference(),
			human(rawReference({ ...replaceReference, annotation: NOTE })),
		);
		expect(after.language_reference).toBe(' (b. h.; = אבא)');
		expect(after.content.senses[0]?.annotations).toEqual([
			{ ...NOTE, field: 'gloss', find: '= אבא', source: 'P000001' },
		] as never);
	});

	it('annotate: a gloss draft on the first sense, the field untouched', () => {
		const after = applyPatch(
			withReference(),
			human(rawReference(annotateReference)),
		);
		expect(after.language_reference).toBe(reference);
		expect(after.content.senses[0]?.annotations).toEqual([
			{
				...KEPT,
				field: 'gloss',
				find: 'אבב',
				printed: 'אבב',
				source: 'P000001',
			},
		] as never);
	});

	it.each([
		['the entry has no sense', []],
		['the first sense is a stem', [{ definition: '', grammar: {} }]],
	])('refuses an annotation where %s', (_name, senses) => {
		expect(() =>
			applyPatch(
				withReference(senses as never),
				human(rawReference(annotateReference)),
			),
		).toThrow(
			'an annotation on language_reference rides the gloss head, and the entry has no first text sense to carry it',
		);
	});

	it.each([
		['label', { field: 'label' }],
		['units', { field: 'units' }],
		['a form field', { field: 'text', form: 0 }],
	])(
		'refuses annotate on %s: the field is folded into the gloss',
		(_n, payload) => {
			expect(reasons(rawReference({ ...annotateReference, payload }))).toEqual([
				'annotate on a language_reference: target takes field gloss, the gloss head it is folded into',
			]);
		},
	);

	it('annotate fails loudly when the field it pins moved', () => {
		const moved = { ...withReference(), language_reference: ' (b. h.)' };
		expect(() =>
			applyPatch(moved, human(rawReference(annotateReference))),
		).toThrow('expected_before does not match language_reference');
	});
});

// L67: a lettered child exists only after the build splits its host's
// text, so an `annotate` on one names the host as its target and the
// child by its label (`payload.child`); the draft rides the host and
// the build moves it onto the child (`body/lettered-children.ts`).
describe('annotate on a lettered child: parsePatch (L67)', () => {
	const onChild = (payload: Record<string, unknown>): Record<string, unknown> =>
		raw({ annotation: KEPT, op: 'annotate', payload });

	it.each([
		['units', { child: 'd', field: 'units' }],
		['gloss', { child: 'a', field: 'gloss' }],
	])('takes a child on %s', (_name, payload) => {
		expect(reasons(onChild(payload))).toEqual([]);
		expect(parsePatch(onChild(payload)).payload).toEqual(payload as never);
	});

	it.each([
		[
			'a label',
			{ child: 'd', field: 'label' },
			'annotate payload.child is only for gloss and units',
		],
		[
			'two letters',
			{ child: 'dd', field: 'units' },
			"annotate payload.child must be a lettered child's label, one letter a-z",
		],
		[
			'a capital',
			{ child: 'D', field: 'units' },
			"annotate payload.child must be a lettered child's label, one letter a-z",
		],
		[
			'a number',
			{ child: 4, field: 'units' },
			"annotate payload.child must be a lettered child's label, one letter a-z",
		],
	])('refuses a child on %s', (_name, payload, reason) => {
		expect(reasons(onChild(payload))).toEqual([reason]);
	});
});

describe('annotate on a lettered child: the targets that take none (L67)', () => {
	it('refuses a child on a form field', () => {
		expect(
			reasons(
				rawForms({
					annotation: KEPT,
					op: 'annotate',
					payload: { child: 'd', field: 'text', form: 0 },
				}),
			),
		).toEqual(['annotate payload.child is only for gloss and units']);
	});

	it('refuses a child on a language_reference: target', () => {
		const reference = ' (b. h.; = אבא)';
		expect(
			reasons(
				raw({
					annotation: KEPT,
					expected_before: reference,
					op: 'annotate',
					payload: { child: 'd', field: 'gloss' },
					target: `language_reference:${contentAnchor(reference)}`,
				}),
			),
		).toEqual([
			'annotate on a language_reference: target takes no child: the gloss head it lands in is the host text, before any lettered child',
		]);
	});
});

describe('annotate on a lettered child: the draft rides the host (L67)', () => {
	it('leaves the draft on the host, naming the child', () => {
		const after = applyPatch(
			makeEntry(),
			human(
				raw({
					annotation: { ...KEPT, printed: 'Ber.' },
					op: 'annotate',
					payload: { child: 'd', field: 'units' },
				}),
			),
		);
		expect(after.content.senses[0]?.annotations).toEqual([
			{
				...KEPT,
				child: 'd',
				field: 'units',
				find: 'Ber.',
				printed: 'Ber.',
				source: 'P000001',
			},
		] as never);
	});
});
