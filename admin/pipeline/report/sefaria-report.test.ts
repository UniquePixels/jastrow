// biome-ignore-all lint/style/noExcessiveLinesPerFile: a table-driven suite; the fixtures and the cases that share them read as one unit.
/**
 * The Sefaria appendix (`docs/decisions.md`, 10-16 upstream report):
 * one row per reviewed patch that is Sefaria's own error, carries print
 * evidence (or a cross-reference's text proof), and traces to the raw
 * source string; every other patch lands in the review list with the
 * first filter it failed, never in the appendix.
 */
import { describe, expect, it } from 'bun:test';
import { compareByCodeUnit } from '../../lib/compare-by-code-unit.ts';
import type { SemanticPatch } from '../patch/schema.ts';
import { contentAnchor } from '../patch/schema.ts';
import type { RawRecord } from './sefaria-change.ts';
import {
	evidenceOf,
	NOT_UPSTREAM_CLASSES,
	NOT_UPSTREAM_OPS,
	scopeReason,
} from './sefaria-evidence.ts';
import {
	type AppendixInputs,
	buildSefariaAppendix,
	parseSubmissions,
} from './sefaria-report.ts';

const READ = 'Maintainer print read of the 1903 scan, 2026-10-06';
const URL = 'https://archive.org/details/dictionaryoftarg01jastuoft/page/50';
const HOCR = 'hOCR vol. 1 p. 50a: `x`; scan 50a';
/** `HOCR` with its scan link, as a converted record words it. */
const LINKED = `${HOCR} (${URL})`;

/** A raw record as `data/sources/sefaria/` stores it. */
function record(rid: string, extra: Partial<RawRecord> = {}): RawRecord {
	return {
		_id: { $oid: `oid-${rid}` },
		content: { senses: [{ definition: 'one two three four five six seven' }] },
		headword: `hw-${rid}`,
		rid,
		...extra,
	};
}

/** A sense target for `definition` carrying `token`. */
function senseAt(definition: string, token = ''): string {
	return `sense[${token}]:${contentAnchor(definition)}`;
}

/** A reviewed patch; `fields` overrides the defaults. */
function patch(fields: Record<string, unknown>): SemanticPatch {
	const before = (fields['expected_before'] as string | undefined) ?? '';
	return {
		defect_class: 'ocr-marker',
		evidence: { kind: 'hOCR' },
		expected_occurrences: 1,
		id: 'P000001',
		occurrence_index: 1,
		prompt_version: 'group-d-2026-10-10',
		rationale: HOCR,
		rid: 'A00001',
		target: senseAt(before),
		...fields,
	} as unknown as SemanticPatch;
}

/** The inputs for one record and one or more patches. */
function inputs(
	records: readonly RawRecord[],
	patches: readonly SemanticPatch[],
	submissions: AppendixInputs['submissions'] = [],
): AppendixInputs {
	return {
		pages: {
			entries: new Map([['A00001', { column: 'a', lastPage: 50, page: 50 }]]),
		},
		patches,
		source: new Map(records.map((r) => [r.rid, r])),
		submissions,
	};
}

const TEXT = 'Neub. Géogr. p. 18; 261) <i>Ulam</i> (Porta) a place in Gilead';
const REPLACE: Record<string, unknown> = {
	expected_before: TEXT,
	op: 'replace',
	payload: { find: '261)', replace: '26 1)' },
};

describe('scopeReason: case 1 only', () => {
	it('names every class that is not Sefaria’s error', () => {
		expect([...NOT_UPSTREAM_CLASSES.keys()].sort(compareByCodeUnit)).toEqual([
			'cross-reference-numeral',
			'headword-illegible-pointing',
			'headword-implied-one',
			'implied-one',
			'lettered-gap',
			'lettered-whole-run',
			'self-numbered-intext-marker',
		]);
		expect([...NOT_UPSTREAM_OPS.keys()].sort(compareByCodeUnit)).toEqual([
			'annotate',
			'nest',
			'relabel',
		]);
	});

	it.each([
		[{ defect_class: 'implied-one' }, 'convention or our structure'],
		[{ op: 'relabel' }, 'convention or our structure'],
		[{ annotation: { kind: 'print-error' } }, 'our correction (annotated)'],
		[
			{ rationale: 'ruling 10-13, case 2: x' },
			'our correction (10-13 case 2/3/4)',
		],
		[{ rationale: 'a recorded deviation' }, 'our deviation from print'],
		[{ rationale: '10-13 case 1; damage repair, not a deviation' }, undefined],
		[{ rationale: 'Damage repair, no byte deviation from print' }, undefined],
		[
			{ rationale: 'the dropped word is not restored' },
			'partial: print not fully restored',
		],
	])('%o → %s', (fields, reason) => {
		const got: string | undefined = scopeReason(
			patch({ ...REPLACE, ...fields }),
		)?.reason;
		expect(got).toBe(reason);
	});
});

describe('evidenceOf: the rationale names print evidence', () => {
	it.each([
		[LINKED, 'hOCR; scan p. 50'],
		[`${READ} (docs/headword-worklist.md)`, 'maintainer print read 2026-10-06'],
		[
			'Companion (same print read, docs/headword-worklist.md at ed8261aaa)',
			'maintainer print read (docs/headword-worklist.md)',
		],
		[
			'Ticked in the maintainer print read (docs/maintainer-checklist.md at 5a94da667)',
			'maintainer print read (docs/maintainer-checklist.md)',
		],
		[
			'Ticked in the maintainer print read (docs/post-go-live-review.md)',
			'maintainer print read (docs/post-go-live-review.md)',
		],
		[
			'Companion (same print read, docs/archive/headword-worklist.md)',
			'maintainer print read (docs/archive/headword-worklist.md)',
		],
		['(Brian, print check 2026-09-20)', 'maintainer print read 2026-09-20'],
		// A negated hOCR mention is not hOCR evidence (PR #213).
		[
			`not found in the hOCR; scan 97b (${URL.replace('/50', '/97')})`,
			'scan p. 97',
		],
		[
			`Evidence: hOCR for C00609: \`not found in the hOCR\`; scan 234a (${URL.replace('/50', '/234')})`,
			'scan p. 234',
		],
		['the hOCR cannot read it (`T^a`), so it waits on a scan read', ''],
		// One positive mention witnesses, whatever a later one says.
		[
			`hOCR: \`1) pr.\`; Tesseract garbled the rest, so the hOCR does not show it; scan 50a (${URL})`,
			'hOCR; scan p. 50',
		],
		['review doc 01: upstream segmentation chopped it', ''],
		['print sets `X V`', ''],
	])('%s → %s', (rationale, evidence) => {
		expect(evidenceOf(rationale)).toBe(evidence);
	});
});

// biome-ignore lint/complexity/noExcessiveLinesPerFunction: one suite per behaviour; its cases share the fixtures and read as a single table.
describe('buildSefariaAppendix: one row per solid patch', () => {
	it('writes a replace as Sefaria’s string and ours, with context', () => {
		const rec = record('A00001', {
			content: { senses: [{ definition: TEXT }] },
		});
		const out = buildSefariaAppendix(inputs([rec], [patch(REPLACE)]));
		expect(out.review).toEqual([]);
		const [row] = out.rows;
		expect(row?.field).toBe('content.senses[0].definition');
		expect(row?.sefaria_text).toContain('261)');
		expect(row?.corrected_text).toBe(
			row?.sefaria_text.replace('261)', '26 1)'),
		);
		expect(TEXT).toContain(row?.sefaria_text ?? '∅');
		expect(row?.sefaria_oid).toBe('oid-A00001');
		expect(row?.first_seen).toBe('2026-10-10');
		expect(row?.scan).toBe(`p. 50a · ${URL} (entry start)`);
		expect(row?.submitted_batch).toBe('');
	});

	it('sends a find the transforms changed to review', () => {
		const rec = record('A00001', {
			content: { senses: [{ definition: TEXT.replace('261)', '26l)') }] },
		});
		const out = buildSefariaAppendix(inputs([rec], [patch(REPLACE)]));
		expect(out.rows).toEqual([]);
		expect(out.review[0]?.reason).toBe('not traceable to source');
	});

	it('sends a find that occurs twice in the raw record to review', () => {
		const rec = record('A00001', {
			content: {
				senses: [{ definition: TEXT }, { definition: TEXT, number: '—2)' }],
			},
		});
		const out = buildSefariaAppendix(inputs([rec], [patch(REPLACE)]));
		expect(out.review[0]?.reason).toBe('not traceable to source');
	});

	it('sends a patch whose scan link shows another page to review', () => {
		const rec = record('A00001', {
			content: { senses: [{ definition: TEXT }] },
		});
		const elsewhere = URL.replace('/50', '/51');
		const out = buildSefariaAppendix(
			inputs(
				[rec],
				[patch({ ...REPLACE, rationale: LINKED.replace(URL, elsewhere) })],
			),
		);
		expect(out.review[0]?.reason).toBe('scan link outside the entry');
		const here = buildSefariaAppendix(
			inputs([rec], [patch({ ...REPLACE, rationale: LINKED })]),
		);
		expect(here.rows[0]?.scan).toBe(`p. 50 · ${URL}`);
	});

	it('holds back a sefaria-only record whatever its prose names', () => {
		const rec = record('A00001', {
			content: { senses: [{ definition: TEXT }] },
		});
		const prose = `not found in the hOCR; scan 50a (${URL})`;
		const pending = buildSefariaAppendix(
			inputs(
				[rec],
				[
					patch({
						...REPLACE,
						evidence: { kind: 'sefaria-only', pending: true },
						rationale: prose,
					}),
				],
			),
		);
		expect(pending.rows).toHaveLength(0);
		expect(pending.review[0]?.reason).toBe('no print evidence');
		expect(pending.review[0]?.detail).toBe(
			'evidence.kind is sefaria-only, pending a re-read',
		);
		const read = buildSefariaAppendix(
			inputs(
				[rec],
				[
					patch({
						...REPLACE,
						evidence: {
							date: '2026-10-25',
							kind: 'maintainer-read',
							reader: 'Brian',
						},
						rationale: prose,
					}),
				],
			),
		);
		expect(read.rows[0]?.evidence).toBe('scan p. 50');
		const none = buildSefariaAppendix(
			inputs(
				[rec],
				[patch({ ...REPLACE, evidence: undefined, rationale: prose })],
			),
		);
		expect(none.review[0]?.detail).toBe('evidence.kind is none');
	});

	it('words the evidence from the record when the prose names none', () => {
		const rec = record('A00001', {
			content: { senses: [{ definition: TEXT }] },
		});
		const hocr = buildSefariaAppendix(
			inputs([rec], [patch({ ...REPLACE, rationale: 'review doc 01' })]),
		);
		expect(hocr.rows[0]?.evidence).toBe('hOCR');
		const read = buildSefariaAppendix(
			inputs(
				[rec],
				[
					patch({
						...REPLACE,
						evidence: {
							date: '2026-10-25',
							kind: 'maintainer-read',
							reader: 'Brian',
						},
						rationale: 'review doc 01',
					}),
				],
			),
		);
		expect(read.rows[0]?.evidence).toBe('maintainer print read 2026-10-25');
	});

	it('writes a delete that empties the field as (empty)', () => {
		const def = '1) = next w. Targ. O. f. pl. ch. ';
		const rec = record('A00001', {
			content: { senses: [{ definition: def }] },
		});
		const del = patch({
			expected_before: def,
			op: 'delete',
			payload: { scope: 'segment', segment: def },
		});
		const [row] = buildSefariaAppendix(inputs([rec], [del])).rows;
		expect([row?.sefaria_text, row?.corrected_text]).toEqual([def, '(empty)']);
	});

	it('writes a split with the sense boundary mark', () => {
		const def =
			'to go round about. Keth. 19ᵃ a. fr.—2) to steal, carry off. Ib.';
		const rec = record('A00001', {
			content: { senses: [{ definition: def, number: '1)' }] },
		});
		const split = patch({
			expected_before: def,
			op: 'split',
			payload: { marker: '—2)' },
			target: senseAt(def, '1)'),
		});
		const [row] = buildSefariaAppendix(inputs([rec], [split])).rows;
		expect(row?.corrected_text).toBe(row?.sefaria_text.replace('—2)', '‖—2)'));
	});

	it('locates a split’s marker as the patch does: never the tail of a number (L81)', () => {
		// A raw record that holds print's `261) 1)`: the row cuts at the
		// marker, not at the page's `1)`.
		const def = 'Neub. Géogr. p. 18; 261) 1) <i>Ulam</i> (Porta) a place';
		const split = patch({
			expected_before: def,
			op: 'split',
			payload: { marker: '1)' },
		});
		const held = record('A00001', {
			content: { senses: [{ definition: def }] },
		});
		const [row] = buildSefariaAppendix(inputs([held], [split])).rows;
		expect(row?.sefaria_text).toContain('261) 1)');
		expect(row?.corrected_text).toBe(
			row?.sefaria_text.replace('261) 1)', '261) ‖1)'),
		);
		// A00675 as Sefaria holds it: the marker is not in the raw
		// record at all (P000194 inserts it), so the split is not
		// Sefaria's to fix and goes to review, never onto the page.
		const lost = record('A00001', {
			content: { senses: [{ definition: def.replace('261) 1)', '261)') }] },
		});
		const out = buildSefariaAppendix(inputs([lost], [split]));
		expect(out.rows).toEqual([]);
		expect(out.review[0]?.reason).toBe('not traceable to source');
		// Two real markers are still not once.
		const twice = '1) a. Ber. 6ᵇ; 1) b. Ib. 7ᵃ and more text here';
		const both = buildSefariaAppendix(
			inputs(
				[record('A00001', { content: { senses: [{ definition: twice }] } })],
				[
					patch({
						expected_before: twice,
						op: 'split',
						payload: { marker: '1)' },
					}),
				],
			),
		);
		expect(both.review[0]?.detail).toBe(
			'the find is not once in expected_before',
		);
	});

	it('writes a retag on an unnumbered sense as (absent) → the number', () => {
		const def = 'to move, shake, tremble. Pesik. R. s. 26';
		const rec = record('A00001', {
			content: {
				senses: [{ definition: 'x', number: '1)' }, { definition: def }],
			},
		});
		const retag = patch({
			expected_before: def,
			op: 'retag',
			payload: { number: '—2)' },
		});
		const [row] = buildSefariaAppendix(inputs([rec], [retag])).rows;
		expect([row?.field, row?.sefaria_text, row?.corrected_text]).toEqual([
			'content.senses[1].number',
			'(absent)',
			'—2)',
		]);
	});

	it('writes a join as the sense pair, boundary and all', () => {
		const prev = 'evening (v. אוֹר';
		const def = ' night. Pes. 2ᵃ';
		const rec = record('A00001', {
			content: {
				senses: [{ definition: prev }, { definition: def, number: '2)' }],
			},
		});
		const join = patch({
			expected_before: def,
			op: 'join',
			payload: {},
			target: senseAt(def, '2)'),
		});
		const [row] = buildSefariaAppendix(inputs([rec], [join])).rows;
		expect(row?.field).toBe('content.senses[0–1]');
		expect(row?.sefaria_text).toBe(`${prev}‖2)${def}`);
		expect(row?.corrected_text).toBe(`${prev} 2)${def}`);
	});

	it('writes a reform respelling as the one form it changes', () => {
		const rec = record('A00001', {
			alt_headwords: ['יַתִּירָא', 'יַתִּירָא', 'יְתֵיר׳'],
			headword: 'יַתִּור I',
		});
		const reform = patch({
			expected_before: 'יַתִּור I\nיַתִּירָא\nיְתֵיר׳',
			op: 'reform',
			payload: { forms: ['יַתִּיר I', 'יַתִּירָא', 'יְתֵיר׳'] },
			rationale: `${READ} (docs/headword-worklist.md)`,
			target: `forms:${contentAnchor('x')}`,
		});
		const out = buildSefariaAppendix(inputs([rec], [reform]));
		expect(
			out.rows.map((r) => [r.field, r.sefaria_text, r.corrected_text]),
		).toEqual([['headword', 'יַתִּור I', 'יַתִּיר I']]);
	});

	it('writes a dropped numeral onto the form it belongs to', () => {
		const rec = record('A00001', {
			alt_headwords: ['ש׳ מִישׁוֹט'],
			headword: 'שׁוֹט',
		});
		const reform = patch({
			expected_before: 'שׁוֹט\nש׳ מִישׁוֹט',
			op: 'reform',
			payload: {
				display: '{0} I, {1}',
				forms: ['שׁוֹט', 'ש׳ מִישׁוֹט'],
				homographs: [{ form: 0, homograph: 1 }],
			},
			rationale: `${READ} (docs/headword-worklist.md); ${HOCR}`,
			target: `forms:${contentAnchor('x')}`,
		});
		const [row] = buildSefariaAppendix(inputs([rec], [reform])).rows;
		expect([row?.field, row?.sefaria_text, row?.corrected_text]).toEqual([
			'headword',
			'שׁוֹט',
			'שׁוֹט I',
		]);
	});

	it('writes a reform that only reorders the forms as the whole line', () => {
		const rec = record('A00001', {
			alt_headwords: ['אבוב'],
			headword: 'איבוב',
		});
		const reorder = (forms: string[]): ReturnType<typeof patch> =>
			patch({
				expected_before: 'איבוב\nאבוב',
				op: 'reform',
				payload: { forms },
				rationale: `${READ} (docs/headword-order-worklist.md)`,
				target: `forms:${contentAnchor('x')}`,
			});
		const out = buildSefariaAppendix(
			inputs([rec], [reorder(['אבוב', 'איבוב'])]),
		);
		expect(
			out.rows.map((r) => [r.field, r.sefaria_text, r.corrected_text]),
		).toEqual([
			['headword + alt_headwords', '["איבוב","אבוב"]', '["אבוב","איבוב"]'],
		]);
		const respelt = buildSefariaAppendix(
			inputs([rec], [reorder(['אבובא', 'איבוב'])]),
		);
		expect(respelt.review[0]?.detail).toBe('the reform changes 2 forms');
	});

	it('refuses a reform whose display sets a layout', () => {
		const rec = record('A00001', {
			alt_headwords: ['(אַפְרִיקָא) I'],
			headword: 'אַפְרִיקִי',
		});
		const reform = patch({
			expected_before: 'אַפְרִיקִי\n(אַפְרִיקָא) I',
			op: 'reform',
			payload: { display: '({0}) {1} I', forms: ['אַפְרִיקִי', '(אַפְרִיקָא) I'] },
			target: `forms:${contentAnchor('x')}`,
		});
		expect(
			buildSefariaAppendix(inputs([rec], [reform])).review[0]?.reason,
		).toBe('not mechanical for op');
	});
});

// biome-ignore lint/complexity/noExcessiveLinesPerFunction: one suite per behaviour; its cases share the fixtures and read as a single table.
describe('buildSefariaAppendix: a cross-reference retarget’s text proof', () => {
	const anchor = (key: string): string =>
		`<a class="refLink" href="/Jastrow,_${key}.1" data-ref="Jastrow, ${key} 1"><span dir="rtl">בָּב</span> I</a>`;
	const cite = `v. ${anchor('בָּב II')}.`;
	const retarget = patch({
		defect_class: 'cross-reference-target',
		evidence: { kind: 'jastrow-text', quote: 'בָּב I' },
		expected_before: cite,
		op: 'replace',
		payload: { find: anchor('בָּב II'), replace: anchor('בָּב') },
		rationale: 'Case 1 under 10-13: the cite reads "בָּב I"',
	});
	const citing = record('A00001', {
		content: { senses: [{ definition: cite }] },
	});

	it('passes when exactly one family member carries the cited numeral', () => {
		const one = record('B00049', { alt_headwords: ['בָּבָא I'], headword: 'בָּב' });
		const two = record('B00050', { headword: 'בָּב II' });
		const [row] = buildSefariaAppendix(
			inputs([citing, one, two], [retarget]),
		).rows;
		expect(row?.evidence).toBe(
			'text: the cite reads "בָּב I"; only B00049 carries I',
		);
	});

	it('reads a numeral a print-read reform restores, and says so', () => {
		const one = record('B00049', { headword: 'בָּב' });
		const two = record('B00050', { headword: 'בָּב II' });
		const restore = patch({
			defect_class: 'headword-numeral-dropped',
			expected_before: 'בָּב',
			id: 'P000002',
			op: 'reform',
			payload: {
				display: '{0} I',
				forms: ['בָּב'],
				homographs: [{ form: 0, homograph: 1 }],
			},
			rationale: `${READ} (docs/headword-worklist.md)`,
			rid: 'B00049',
			target: `forms:${contentAnchor('x')}`,
		});
		const out = buildSefariaAppendix(
			inputs([citing, one, two], [retarget, restore]),
		);
		expect(out.rows.find((r) => r.patch_id === 'P000001')?.evidence).toBe(
			'text: the cite reads "בָּב I"; only B00049 carries I (restored by P000002)',
		);
	});

	it('cuts the family where its members stand more than five apart in rid order', () => {
		const far = record('B00099', { headword: 'בָּב I' });
		const gap = [
			'B00051',
			'B00052',
			'B00053',
			'B00054',
			'B00055',
			'B00056',
		].map((rid) => record(rid));
		const one = record('B00049', { alt_headwords: ['בָּבָא I'], headword: 'בָּב' });
		const two = record('B00050', { headword: 'בָּב II' });
		const out = buildSefariaAppendix(
			inputs([far, citing, two, ...gap.reverse(), one], [retarget]),
		);
		expect(out.rows[0]?.evidence).toBe(
			'text: the cite reads "בָּב I"; only B00049 carries I',
		);
	});

	it('keeps a near member in the family however far apart the file puts it', () => {
		const near = record('B00052', { headword: 'בָּב I' });
		const filler = [
			'C00001',
			'C00002',
			'C00003',
			'C00004',
			'C00005',
			'C00006',
		].map((rid) => record(rid));
		const one = record('B00049', { alt_headwords: ['בָּבָא I'], headword: 'בָּב' });
		const two = record('B00050', { headword: 'בָּב II' });
		const out = buildSefariaAppendix(
			inputs([citing, one, two, ...filler, near], [retarget]),
		);
		expect(out.review[0]?.detail).toBe(
			'family members carrying I: B00049, B00052',
		);
	});

	it('reads an anchor with the same text after it in find and replace', () => {
		const tail = patch({
			defect_class: 'cross-reference-target',
			evidence: { kind: 'jastrow-text', quote: 'בָּב I' },
			expected_before: cite,
			op: 'replace',
			payload: { find: `${anchor('בָּב II')}.`, replace: `${anchor('בָּב')}.` },
			rationale: 'Case 1 under 10-13',
		});
		const one = record('B00049', { alt_headwords: ['בָּבָא I'], headword: 'בָּב' });
		const two = record('B00050', { headword: 'בָּב II' });
		expect(
			buildSefariaAppendix(inputs([citing, one, two], [tail])).rows,
		).toHaveLength(1);
		const changed = patch({
			...tail,
			payload: { find: `${anchor('בָּב II')}.`, replace: `${anchor('בָּב')};` },
		});
		expect(
			buildSefariaAppendix(inputs([citing, one, two], [changed])).review[0]
				?.detail,
		).toBe('the patch changes more than one internal anchor’s link');
	});

	it('fails when no member carries it in Sefaria’s data', () => {
		const one = record('B00049', { headword: 'בָּב' });
		const two = record('B00050', { headword: 'בָּב II' });
		const out = buildSefariaAppendix(inputs([citing, one, two], [retarget]));
		expect(out.review[0]?.reason).toBe('no print evidence');
		// A jastrow-text retarget's claim is the proof: prose naming a
		// print read does not stand in for it (PR #214 review).
		const prosed = buildSefariaAppendix(
			inputs(
				[citing, one, two],
				[patch({ ...retarget, rationale: `${HOCR}; the cite reads בָּב I` })],
			),
		);
		expect(prosed.rows).toHaveLength(0);
		expect(prosed.review[0]?.reason).toBe('no print evidence');
		const read = buildSefariaAppendix(
			inputs(
				[citing, one, two],
				[
					patch({
						...retarget,
						evidence: {
							date: '2026-10-25',
							kind: 'maintainer-read',
							reader: 'Brian',
						},
					}),
				],
			),
		);
		expect(read.rows[0]?.evidence).toBe('maintainer print read 2026-10-25');
	});
});

describe('the submission log', () => {
	const line =
		'{"batch":"2026-11-a","date":"2026-11-01","channel":"email","patch_ids":["P000001"],"response":""}';

	it('fills submitted_batch for a patch it names', () => {
		const rec = record('A00001', {
			content: { senses: [{ definition: TEXT }] },
		});
		const out = buildSefariaAppendix(
			inputs([rec], [patch(REPLACE)], parseSubmissions(line)),
		);
		expect(out.rows[0]?.submitted_batch).toBe('2026-11-a');
		expect(out.doc).toContain('| 2026-11-a | 2026-11-01 | email | 1 |');
	});

	it('marks a class batch only on rows first seen by its date', () => {
		const rec = record('A00001', {
			content: { senses: [{ definition: TEXT }] },
		});
		const log = (date: string): string =>
			`{"batch":"b","date":"${date}","channel":"email","classes":["ocr-marker"],"response":""}`;
		const sent = buildSefariaAppendix(
			inputs([rec], [patch(REPLACE)], parseSubmissions(log('2026-10-10'))),
		);
		expect(sent.rows[0]?.submitted_batch).toBe('b');
		const before = buildSefariaAppendix(
			inputs([rec], [patch(REPLACE)], parseSubmissions(log('2026-10-09'))),
		);
		expect(before.rows[0]?.submitted_batch).toBe('');
	});

	it.each([
		['{"batch":"x"}'],
		['not json'],
		['{"batch":"x","date":"d","channel":"c","response":""}'],
	])('refuses a malformed line: %s', (text) => {
		expect(() => parseSubmissions(text)).toThrow('sefaria-submissions line 1');
	});

	it.each([['2026/10/16'], ['16-10-2026'], ['2026-13-01'], ['yesterday']])(
		'refuses a date that is not a real YYYY-MM-DD: %s',
		(date) => {
			const bad = `{"batch":"b","date":"${date}","channel":"email","patch_ids":["P000001"],"response":""}`;
			expect(() => parseSubmissions(bad)).toThrow(
				`sefaria-submissions line 1: date "${date}" is not a YYYY-MM-DD date`,
			);
		},
	);

	it('reads an empty log as no batches', () => {
		expect(parseSubmissions('')).toEqual([]);
	});
});
