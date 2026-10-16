// biome-ignore-all lint/style/noExcessiveLinesPerFile: a table-driven suite; the cases and the fixtures they share read as one unit.
import { describe, expect, it } from 'bun:test';
import type { SourceEntry, SourceSense } from '../types.ts';
import {
	applyPatch,
	contentAnchor,
	countOccurrences,
	countTarget,
	flattenContent,
	PatchApplyError,
	parsePatch,
	parsePatchLine,
	parseTarget,
	resolveTarget,
	type SemanticPatch,
	senseTarget,
	validateCorpus,
	walkSenses,
} from './schema.ts';

const SNAPSHOT = `sha256:${'0'.repeat(64)}`;

/** A small entry exercising every shape the ops touch: an in-text
 * `—2)` run, an unnumbered sense, a nested child, and a duplicated
 * pair. */
function makeEntry(): SourceEntry {
	return {
		content: {
			senses: [
				{
					definition: 'to test. Ber. 6ᵇ.—2) to prove, meritorious deed.',
					number: '1)',
				},
				{ definition: 'unnumbered sense with l) inside.' },
				{
					definition: 'parent sense.',
					number: '2)',
					senses: [{ definition: 'nested child.', number: 'a' }],
				},
				{ definition: 'twin.', number: '3)' },
				{ definition: 'twin.', number: '3)' },
			],
		},
		headword: 'טסט',
		rid: 'T00001',
	};
}

/** Build a valid patch for a sense identified by (definition, token),
 * overriding op-specific fields. */
function patchFor(
	definition: string,
	token: string,
	overrides: Record<string, unknown>,
): ReturnType<typeof parsePatch> {
	return parsePatch({
		confidence: 'high',
		defect_class: 'test-class',
		expected_before: definition,
		id: 'P000001',
		prompt_version: 'v1',
		rationale: 'test rationale',
		rid: 'T00001',
		snapshot: SNAPSHOT,
		target: `sense[${token}]:${contentAnchor(definition)}`,
		...overrides,
	});
}

describe('target addressing', () => {
	it('round-trips through senseTarget and parseTarget', () => {
		const entry = makeEntry();
		const first = entry.content.senses[0];
		if (first === undefined) {
			throw new Error('fixture broken');
		}
		const target = parseTarget(senseTarget(first));
		expect(target.token).toBe('1)');
		expect(resolveTarget(entry, target)).toHaveLength(1);
	});

	it('resolves by content, not index: duplicated senses match twice', () => {
		const entry = makeEntry();
		const target = parseTarget(`sense[3)]:${contentAnchor('twin.')}`);
		expect(resolveTarget(entry, target)).toHaveLength(2);
	});

	it('walks nested senses in document order', () => {
		const definitions = [...walkSenses(makeEntry())].map(
			(p) => p.sense.definition,
		);
		expect(definitions[2]).toBe('parent sense.');
		expect(definitions[3]).toBe('nested child.');
	});

	it('rejects a malformed target address', () => {
		expect(() => parseTarget('sense[1)]:nothex!!')).toThrow(
			'expected sense[<token>]:<8-hex-anchor>',
		);
	});
});

describe('parsePatch', () => {
	it('collects every problem, not just the first', () => {
		expect(() =>
			parsePatch({
				confidence: 'certain',
				defect_class: '',
				expected_before: 'x',
				id: 'nope',
				op: 'explode',
				payload: {},
				prompt_version: '',
				rationale: '',
				rid: 'lowercase',
				snapshot: 'md5:beef',
				target: `sense[]:${contentAnchor('x')}`,
			}),
		).toThrow(/id must match.*rid must match.*op must be one of/su);
	});

	it('rejects an anchor inconsistent with expected_before', () => {
		expect(() =>
			patchFor('actual text', '1)', {
				op: 'retag',
				payload: { number: '1)' },
				target: `sense[1)]:${contentAnchor('different text')}`,
			}),
		).toThrow('does not match expected_before');
	});

	it('rejects an out-of-range occurrence_index', () => {
		expect(() =>
			patchFor('twin.', '3)', {
				expected_occurrences: 2,
				occurrence_index: 3,
				op: 'retag',
				payload: { number: '3)' },
			}),
		).toThrow('occurrence_index must be in 1..expected_occurrences');
	});

	it('parsePatchLine reports the line number on bad JSON', () => {
		expect(() => parsePatchLine('{not json', 7)).toThrow('line 7');
	});

	it('rejects a record that claims its own author', () => {
		const valid = patchFor('twin.', '3)', {
			expected_occurrences: 2,
			op: 'retag',
			payload: { number: '3)' },
		});
		expect(() => parsePatch({ ...valid, author: 'human' })).toThrow(
			'author is set by the loader from the patch directory, never by the record',
		);
	});
});

describe('split', () => {
	const def = 'to test. Ber. 6ᵇ.—2) to prove, meritorious deed.';

	it('applies: host truncates, verbatim-token sibling lands at host+1', () => {
		const entry = makeEntry();
		const patch = patchFor(def, '1)', {
			op: 'split',
			payload: { marker: '—2)' },
		});
		const after = applyPatch(entry, patch);
		const senses = after.content.senses;
		expect(senses[0]?.definition).toBe('to test. Ber. 6ᵇ.');
		expect(senses[1]?.number).toBe('—2)');
		expect(senses[1]?.definition).toBe(' to prove, meritorious deed.');
		// Byte conservation: host + marker + sibling == original.
		expect(
			`${senses[0]?.definition}${senses[1]?.number}${senses[1]?.definition}`,
		).toBe(def);
		// Pure: the input entry is untouched.
		expect(entry.content.senses).toHaveLength(5);
	});

	it('rejects a marker outside the closed grammar at parse time', () => {
		expect(() =>
			patchFor(def, '1)', { op: 'split', payload: { marker: 'l)' } }),
		).toThrow('closed marker grammar');
		expect(() =>
			patchFor(def, '1)', { op: 'split', payload: { marker: '—*a)' } }),
		).toThrow('closed marker grammar');
	});

	it('fails loudly when the marker is not exactly once in the text', () => {
		const twice = 'a.—2) b.—2) c.';
		const entry = makeEntry();
		const first = entry.content.senses[0];
		if (first === undefined) {
			throw new Error('fixture broken');
		}
		first.definition = twice;
		const patch = patchFor(twice, '1)', {
			op: 'split',
			payload: { marker: '—2)' },
		});
		expect(() => applyPatch(entry, patch)).toThrow('occurs 2 times');
	});
});

describe('split at a starred marker', () => {
	// L36: print's starred sense marker (`—*2)`, ruling 10-04 sense
	// star) left inside a definition. The star is cut out of the text
	// with the numeral, never added: the sibling's number is the token
	// as the text held it, and the label the build reads off it keeps
	// the star as `reconstructed`.
	it('splits at a starred marker, the star kept on the token', () => {
		const starred = 'same. Targ. Y. Gen. XXX, 37, v. next w.—*2) = brick.';
		const entry: SourceEntry = {
			content: { senses: [{ definition: starred, number: '1)' }] },
			headword: 'x',
			rid: 'T00001',
		};
		const patch = patchFor(starred, '1)', {
			op: 'split',
			payload: { marker: '—*2)' },
		});
		const senses = applyPatch(entry, patch).content.senses;
		expect(senses).toEqual([
			{ definition: 'same. Targ. Y. Gen. XXX, 37, v. next w.', number: '1)' },
			{ definition: ' = brick.', number: '—*2)' },
		]);
	});
});

// biome-ignore lint/complexity/noExcessiveLinesPerFunction: one suite per behaviour; its cases share setup and read as a single table.
describe('join', () => {
	it('refuses a target with no number token', () => {
		// An unnumbered sense has no marker to fold back: joining it would
		// only erase a structural boundary.
		expect(() => patchFor(' night', '', { op: 'join', payload: {} })).toThrow(
			'join target token must match the closed marker grammar',
		);
	});

	it('folds a phantom sense into the preceding flow', () => {
		const entry: SourceEntry = {
			content: {
				senses: [
					{ definition: 'see (v. X', number: '1)' },
					{ definition: ' Y) night', number: '2)' },
				],
			},
			headword: 'x',
			rid: 'T00001',
		};
		const patch = patchFor(' Y) night', '2)', { op: 'join', payload: {} });
		const after = applyPatch(entry, patch);
		expect(after.content.senses).toEqual([
			{ definition: 'see (v. X 2) Y) night', number: '1)' },
		]);
	});

	it('unnumbers a phantom that opens the list', () => {
		const entry: SourceEntry = {
			content: { senses: [{ definition: ' Y) night', number: '2)' }] },
			headword: 'x',
			rid: 'T00001',
		};
		const patch = patchFor(' Y) night', '2)', { op: 'join', payload: {} });
		const after = applyPatch(entry, patch);
		expect(after.content.senses).toEqual([{ definition: '2) Y) night' }]);
		expect('number' in (after.content.senses[0] ?? {})).toBe(false);
	});

	it('refuses to join into a stem header', () => {
		const entry: SourceEntry = {
			content: {
				senses: [
					{ definition: '', grammar: { verbal_stem: 'Pi.' } },
					{ definition: ' x', number: '2)' },
				],
			},
			headword: 'x',
			rid: 'T00001',
		};
		const patch = patchFor(' x', '2)', { op: 'join', payload: {} });
		expect(() => applyPatch(entry, patch)).toThrow('no text flow to join into');
	});

	it('rejects a non-empty payload', () => {
		expect(() =>
			patchFor(' x', '2)', { op: 'join', payload: { x: 1 } }),
		).toThrow('join payload must be an empty object');
	});

	/** An entry whose second sense is the join target, with overrides on
	 * the target and on its preceding sibling. */
	const joinEntry = (
		previous: Partial<SourceSense>,
		target: Partial<SourceSense>,
	): SourceEntry => ({
		content: {
			senses: [
				{ definition: 'day', number: '1)', ...previous },
				{ definition: ' night', number: '2)', ...target },
			],
		},
		headword: 'x',
		rid: 'T00001',
	});
	const join = patchFor(' night', '2)', { op: 'join', payload: {} });

	it('refuses a target carrying grammar — joining would drop it', () => {
		const entry = joinEntry({}, { grammar: { verbal_stem: 'Pi.' } });
		expect(() => applyPatch(entry, join)).toThrow('grammar');
	});

	it('refuses a target with child senses — joining would drop them', () => {
		const entry = joinEntry(
			{},
			{ senses: [{ definition: 'child', number: 'a)' }] },
		);
		expect(() => applyPatch(entry, join)).toThrow('child senses');
	});

	it('refuses to join after a sibling with children — the text would land after them', () => {
		const entry = joinEntry(
			{ senses: [{ definition: 'child', number: 'a)' }] },
			{},
		);
		expect(() => applyPatch(entry, join)).toThrow('child senses');
	});

	it('refuses a list-opening target with grammar or children too', () => {
		const opener = (target: Partial<SourceSense>): SourceEntry => ({
			content: { senses: [{ definition: ' night', number: '2)', ...target }] },
			headword: 'x',
			rid: 'T00001',
		});
		expect(() =>
			applyPatch(opener({ grammar: { verbal_stem: 'Pi.' } }), join),
		).toThrow('grammar');
		expect(() =>
			applyPatch(
				opener({ senses: [{ definition: 'child', number: 'a)' }] }),
				join,
			),
		).toThrow('child senses');
	});

	it('joins a nested sense into its preceding nested sibling', () => {
		const entry: SourceEntry = {
			content: {
				senses: [
					{
						definition: 'parent',
						number: '1)',
						senses: [
							{ definition: 'day', number: 'a)' },
							{ definition: ' night', number: '2)' },
						],
					},
				],
			},
			headword: 'x',
			rid: 'T00001',
		};
		expect(applyPatch(entry, join).content.senses[0]?.senses).toEqual([
			{ definition: 'day 2) night', number: 'a)' },
		]);
	});

	/** A01620's two senses as the patch phase receives them: Sefaria
	 * minted `2)` out of `(v. אָשַׁר, Pi. 2) praise` and the minted text
	 * lost print's space after the `)`. Bytes copied from the composed
	 * entry and P000392's `expected_before`. */
	const A01620_PREVIOUS: string =
		' (v. <a dir="rtl" class="refLink" href="/Jastrow,_אָשַׁר.1" data-ref="Jastrow, אָשַׁר 1">אָשַׁר</a>, <i>Pi.</i> ';
	const A01620_TARGET: string =
		'<i>praise, adoration</i>. <a class="refLink" href="/Shir_HaShirim_Rabbah.8.11" data-ref="Shir HaShirim Rabbah 8:11">Cant. R. to VIII, 11</a> <span dir="rtl">אישורְךָ היא</span> it is thy praise. <a class="refLink" href="Jerusalem_Talmud_Sukkah.3.11.1" data-ref="Jerusalem Talmud Sukkah 3:11:1">Y. Succ. III, 54ᵃ</a> top, with ten var. expressions of praise are the psalms headed <span dir="rtl">באי׳</span> with the word <i>ashré</i>, &c.—2) (v. <a dir="rtl" class="refLink" href="/Jastrow,_אָשַׁר.1" data-ref="Jastrow, אָשַׁר 1">אָשַׁר</a> <i>Pi.</i> 1) <i>legal attestation</i>. <a class="refLink" href="Jerusalem_Talmud_Bava_Metzia.1.8.2" data-ref="Jerusalem Talmud Bava Metzia 1:8:2">Y. B. Mets. I, 8ᵃ</a> bot; v. <a dir="rtl" class="refLink" href="/Jastrow,_אַשָּׁרָא.1" data-ref="Jastrow, אַשָּׁרָא 1">אַשָּׁרָא</a>. [Some ed. <span dir="rtl">אֵישֶׁר</span>.].';

	it('restores the space print sets after the folded marker', () => {
		const entry: SourceEntry = {
			content: {
				senses: [
					{ definition: A01620_PREVIOUS, number: '1)' },
					{ definition: A01620_TARGET, number: '2)' },
				],
			},
			headword: 'x',
			rid: 'T00001',
		};
		const patch = patchFor(A01620_TARGET, '2)', { op: 'join', payload: {} });
		const senses = applyPatch(entry, patch).content.senses;
		expect(senses).toHaveLength(1);
		expect(senses[0]?.definition).toBe(`${A01620_PREVIOUS}2) ${A01620_TARGET}`);
	});

	it('restores the space when the folded marker opens the list', () => {
		const entry: SourceEntry = {
			content: { senses: [{ definition: '<i>night</i>', number: '2)' }] },
			headword: 'x',
			rid: 'T00001',
		};
		const patch = patchFor('<i>night</i>', '2)', { op: 'join', payload: {} });
		expect(applyPatch(entry, patch).content.senses).toEqual([
			{ definition: '2) <i>night</i>' },
		]);
	});

	// L61: Sefaria minted the sense out of a cross-reference's `(v. X 2)`
	// and lost print's space BEFORE the numeral too. The join sets it
	// back unless print sets the numeral tight: after whitespace, a
	// dash, an open paren or bracket, or a digit, where the numeral is
	// the end of a page, column or verse number and the `)` closes the
	// paren (`P. Sm. 4012)`, U01674; `Gen. IV, 22)`, S01040, whose last
	// digit is outside the link). The visible text decides, not markup.
	it.each([
		[
			'after a Hebrew word in a link',
			'v. <a href="/J">אָנַךְ</a>',
			'2)',
			'v. <a href="/J">אָנַךְ</a> 2) x',
		],
		['after a stem in italics', 'I, <i>Af.</i>', '1)', 'I, <i>Af.</i> 1) x'],
		['not after a page number', 'P. Sm. 401', '2)', 'P. Sm. 4012) x'],
		[
			'not after a verse number in a link',
			'<a href="/Genesis.4.2">Gen. IV, 2</a>',
			'2)',
			'<a href="/Genesis.4.2">Gen. IV, 2</a>2) x',
		],
		['not after a space', '(v. X, ', '2)', '(v. X, 2) x'],
		['not after an open paren', 'see (', '2)', 'see (2) x'],
		['not before a dashed token', 'a. fr.', '—3)', 'a. fr.—3) x'],
		// The visible text is read by the tokenizer, not one regex pass:
		// a nested `<<i>i>` leaves a `>` the reader sees, so a space.
		['after text a nested tag leaves', 'p. 57<<i>i>', '2)', 'p. 57<<i>i> 2) x'],
		[
			'not after a digit behind closing tags',
			'p. <i><b>57</b></i>',
			'2)',
			'p. <i><b>57</b></i>2) x',
		],
	] as const)(
		'restores the space before the numeral %s',
		(_, previous, token, joined) => {
			const entry = joinEntry(
				{ definition: previous },
				{ number: token, definition: 'x' },
			);
			const patch = patchFor('x', token, { op: 'join', payload: {} });
			expect(applyPatch(entry, patch).content.senses).toEqual([
				{ definition: joined, number: '1)' },
			]);
		},
	);

	it.each([[', <i>being raised</i>'], [') night'], ['; a. fr.']])(
		'inserts no space before closing punctuation: %p',
		(text) => {
			const entry = joinEntry({}, { definition: text });
			const patch = patchFor(text, '2)', { op: 'join', payload: {} });
			expect(applyPatch(entry, patch).content.senses).toEqual([
				{ definition: `day 2)${text}`, number: '1)' },
			]);
		},
	);
});

// biome-ignore lint/complexity/noExcessiveLinesPerFunction: one suite per behaviour; its cases share setup and read as a single table.
describe('nest', () => {
	// C00263's shape: a derived noun after `Hence`, with its own list.
	const host =
		'among, in. Y. Peah; a. fr.—Hence Miggo, 1) a rule. Keth.; a. fr.—2) an action. B. Mets.';
	const lead = '—Hence Miggo, ';
	const nestEntry = (over: Partial<SourceSense> = {}): SourceEntry => ({
		content: {
			senses: [
				{ definition: 'belly.', number: '1)' },
				{ definition: host, number: '—2)', ...over },
				{ definition: 'third.', number: '—3)' },
			],
		},
		headword: 'גו',
		rid: 'T00001',
	});
	const nest = (
		payload: Record<string, unknown>,
		before: string = host,
	): SemanticPatch => patchFor(before, '—2)', { op: 'nest', payload });

	it('applies: host keeps its text, an unlabelled sibling holds the list as children', () => {
		const entry = nestEntry();
		const after = applyPatch(entry, nest({ lead, markers: ['1)', '—2)'] }));
		expect(after.content.senses).toEqual([
			{ definition: 'belly.', number: '1)' },
			{ definition: 'among, in. Y. Peah; a. fr.', number: '—2)' },
			{
				definition: lead,
				senses: [
					{ definition: ' a rule. Keth.; a. fr.', number: '1)' },
					{ definition: ' an action. B. Mets.', number: '—2)' },
				],
			},
			{ definition: 'third.', number: '—3)' },
		]);
		// Byte conservation: the walk's flattened text is unchanged, so
		// the no-new-text floor needs no allowance for this op.
		expect(flattenContent(after)).toBe(flattenContent(entry));
		// Pure: the input entry is untouched.
		expect(entry.content.senses[1]?.definition).toBe(host);
	});

	it('takes a letter and a number in one list, as print sets them (U01512)', () => {
		const text =
			'to teach.—Part. pass. form a) understood; a. fr.—2) inferred.';
		const entry: SourceEntry = {
			content: { senses: [{ definition: text, number: '—2)' }] },
			headword: 'x',
			rid: 'T00001',
		};
		const after = applyPatch(
			entry,
			patchFor(text, '—2)', {
				op: 'nest',
				payload: { lead: '—Part. pass. form ', markers: ['a)', '—2)'] },
			}),
		);
		expect(after.content.senses[1]?.senses?.map((s) => s.number)).toEqual([
			'a)',
			'—2)',
		]);
	});

	it('refuses a bad payload at parse time, every reason at once', () => {
		expect(() => nest({ lead: '', markers: [] })).toThrow(
			/nest payload\.lead must be a non-empty string; nest payload\.markers must be a non-empty array/u,
		);
		expect(() => nest({ lead, markers: ['l)', '<i>a</i>)'] })).toThrow(
			'must each be a label token',
		);
		expect(() => nest({ lead, markers: ['1)', '1)'] })).toThrow(
			'must not repeat a token',
		);
	});

	it.each([
		[
			'a lead that is not exactly once',
			{ lead: 'a. fr.', markers: ['1)', '—2)'] },
			'occurs 2 times',
			host,
		],
		[
			'a lead that opens the target',
			{ lead: 'among, in. ', markers: ['1)'] },
			'nest lead opens the target',
			host,
		],
		[
			'a first marker that does not follow the lead',
			{ lead, markers: ['—2)'] },
			'not followed directly by its first marker',
			host,
		],
		[
			'a later marker that is absent',
			{ lead, markers: ['1)', '—3)'] },
			'occurs 0 times',
			host,
		],
		[
			'a first marker that recurs in the list',
			{ lead, markers: ['1)', '—2)'] },
			'nest marker "1)" occurs 2 times',
			'among.—Hence Miggo, 1) one; 1) two.—2) three.',
		],
	] as const)('refuses %s', (_, payload, message, definition) => {
		expect(() =>
			applyPatch(nestEntry({ definition }), nest(payload, definition)),
		).toThrow(message);
	});

	it('refuses a later marker that stands before the one it follows', () => {
		const text = 'host.—Hence X, 1) one.—2) two.—3) three.';
		const entry: SourceEntry = {
			content: { senses: [{ definition: text, number: '1)' }] },
			headword: 'x',
			rid: 'T00001',
		};
		const patch = patchFor(text, '1)', {
			op: 'nest',
			payload: { lead: '—Hence X, ', markers: ['1)', '—3)', '—2)'] },
		});
		expect(() => applyPatch(entry, patch)).toThrow(
			'nest marker "—2)" comes before the marker it follows',
		);
	});

	it('refuses a target carrying grammar or children, which a nest would bury', () => {
		const payload = { lead, markers: ['1)', '—2)'] };
		expect(() =>
			applyPatch(nestEntry({ grammar: { verbal_stem: 'Pi.' } }), nest(payload)),
		).toThrow('grammar');
		expect(() =>
			applyPatch(
				nestEntry({ senses: [{ definition: 'child', number: 'a)' }] }),
				nest(payload),
			),
		).toThrow('child senses');
	});

	it('nests inside a stem section, where the target is a stem child', () => {
		const entry: SourceEntry = {
			content: {
				senses: [
					{ definition: 'lead' },
					{
						grammar: { verbal_stem: 'Af.' },
						senses: [{ definition: host, number: '—2)' }],
					},
				],
			},
			headword: 'x',
			rid: 'T00001',
		};
		const after = applyPatch(entry, nest({ lead, markers: ['1)', '—2)'] }));
		const stem = after.content.senses[1]?.senses ?? [];
		expect(stem.map((s) => s.number ?? '·')).toEqual(['—2)', '·']);
		expect(stem[1]?.senses).toHaveLength(2);
	});
});

// L59: `relabel` declares a lettered run print gapped and the labels
// its children take. It edits no text: the run rides the source sense
// as a draft, and the build splits and labels at trace time.
// biome-ignore lint/complexity/noExcessiveLinesPerFunction: one table, one row per case; splitting it would scatter the rule it pins.
describe('relabel', () => {
	const gapped =
		'lead.—<i>a</i>) one.—<i>b</i>) (v. Kal, c) two.—<i>c</i>) three.—<i>d</i>) four.—<i>f</i>) five.';
	const RUN = ['a', 'b', 'c', 'd', 'f'];
	const TO = ['a', 'b', 'c', 'd', 'e'];
	const NOTE = {
		date: '2026-10-16',
		evidence: 'print skips e)',
		kind: 'print-error',
		printed: '',
	} as const;
	const relabelEntry = (over: Partial<SourceSense> = {}): SourceEntry => ({
		content: {
			senses: [
				{ definition: 'head.' },
				{ definition: gapped, number: '—2)', ...over },
			],
		},
		headword: 'x',
		rid: 'T00001',
	});
	const relabel = (over: Record<string, unknown> = {}): SemanticPatch => ({
		...patchFor(gapped, '—2)', {
			annotation: NOTE,
			op: 'relabel',
			payload: { run: RUN, to: TO },
			...over,
		}),
		author: 'human',
	});

	it('applies: the text is untouched, the run rides the sense as a draft', () => {
		const entry = relabelEntry();
		const after = applyPatch(entry, relabel());
		expect(after.content.senses[1]).toEqual({
			definition: gapped,
			number: '—2)',
			relabel: {
				note: { ...NOTE, source: 'P000001' },
				run: RUN,
				source: 'P000001',
				to: TO,
			},
		});
		// No text is added: a label is not text, and the pool is
		// byte-identical.
		expect(flattenContent(after)).toBe(flattenContent(entry));
		expect(entry.content.senses[1]).not.toHaveProperty('relabel');
	});

	// [case, record overrides, reason]
	it.each([
		[
			'a run letter that is not one letter',
			{ payload: { run: ['a', 'b)'], to: ['a', 'b'] } },
			'relabel payload.run must be an array of single letters a–z',
		],
		[
			'a to that is not an array',
			{ payload: { run: RUN, to: 'abcde' } },
			'relabel payload.to must be an array of single letters a–z',
		],
		[
			'a run of one',
			{ payload: { run: ['b'], to: ['a'] } },
			'relabel payload.run must hold at least two letters',
		],
		[
			'lengths that differ',
			{ payload: { run: RUN, to: ['a', 'b', 'c', 'd'] } },
			'relabel payload.to must be as long as payload.run',
		],
		[
			'a to that is not consecutive from a',
			{ payload: { run: RUN, to: ['a', 'b', 'c', 'e', 'f'] } },
			'relabel payload.to must run a, b, c… from a',
		],
		[
			'a run that repeats a letter',
			{ payload: { run: ['a', 'b', 'b'], to: ['a', 'b', 'c'] } },
			'relabel payload.run must not repeat a letter',
		],
		[
			'an annotation on a run that changes no label',
			{ payload: { run: TO, to: TO } },
			'a relabel that changes no label carries no annotation: it departs from no print',
		],
		[
			'no annotation',
			{ annotation: undefined },
			'relabel needs an annotation: every label it changes departs from print',
		],
		[
			'a kept annotation',
			{ annotation: { ...NOTE, kind: 'kept' } },
			'relabel carries a print-error annotation: the run it corrects is print’s error',
		],
		[
			'an annotation that states printed',
			{ annotation: { ...NOTE, printed: 'f' } },
			'relabel annotation.printed must be empty: the import reads each changed label’s printed letter from payload.run',
		],
	] as const)('refuses %s at parse', (_, over, reason) => {
		expect(() => relabel(over)).toThrow(reason);
	});

	// L57: a run print sets whole that the plain rule leaves unsplit
	// (J00403's, after print's own stray `)`). Declared as print reads
	// it, `run` equal to `to`, it only forces the split: no label
	// departs from print, so it owes no annotation and carries none.
	it('accepts a run that changes no label, unannotated: it only forces the split', () => {
		const whole = 'lead.—a) one.—b) two.)';
		const entry: SourceEntry = {
			content: { senses: [{ definition: whole }] },
			headword: 'x',
			rid: 'T00001',
		};
		const patch: SemanticPatch = {
			...patchFor(whole, '', {
				op: 'relabel',
				payload: { run: ['a', 'b'], to: ['a', 'b'] },
			}),
			author: 'human',
		};
		expect(patch.annotation).toBeUndefined();
		expect(applyPatch(entry, patch).content.senses[0]?.relabel).toEqual({
			run: ['a', 'b'],
			source: 'P000001',
			to: ['a', 'b'],
		});
	});

	it('refuses a forms: target', () => {
		expect(() => relabel({ target: `forms:${contentAnchor(gapped)}` })).toThrow(
			'forms: targets are only for reform and annotate',
		);
	});

	it.each([
		[
			'a run that is not what the text holds',
			{ payload: { run: ['a', 'b', 'c', 'd', 'g'], to: TO } },
			'the declared run a b c d g is not the counted markers of the text, a b c d f',
		],
		[
			'a run that stops short of a marker the text holds',
			{ payload: { run: ['a', 'b', 'c', 'f'], to: ['a', 'b', 'c', 'd'] } },
			'the declared run a b c f is not the counted markers of the text, a b c d f',
		],
	] as const)('refuses %s at apply', (_, over, reason) => {
		expect(() => applyPatch(relabelEntry(), relabel(over))).toThrow(reason);
	});

	it('refuses a target with children, grammar, or a run already declared', () => {
		const child = { senses: [{ definition: 'c', number: 'a)' }] };
		expect(() => applyPatch(relabelEntry(child), relabel())).toThrow(
			'relabel target already has child senses (from another patch); a relabel’s children are built from its text',
		);
		expect(() =>
			applyPatch(relabelEntry({ grammar: { verbal_stem: 'Pi.' } }), relabel()),
		).toThrow('relabel target carries grammar');
		const twice = applyPatch(relabelEntry(), relabel());
		expect(() => applyPatch(twice, relabel())).toThrow(
			'relabel target already carries a declared run (P000001)',
		);
	});
});

describe('retag', () => {
	it('applies: adds a number to an unnumbered sense', () => {
		const def = 'unnumbered sense with l) inside.';
		const entry = makeEntry();
		const patch = patchFor(def, '', { op: 'retag', payload: { number: '1)' } });
		const after = applyPatch(entry, patch);
		expect(after.content.senses[1]?.number).toBe('1)');
	});

	it('rejects a token outside the closed grammar (the OCR shape)', () => {
		expect(() =>
			patchFor('x', '', { op: 'retag', payload: { number: 'l)' } }),
		).toThrow('closed marker grammar');
	});
});

describe('move', () => {
	it('applies: lifts the segment and re-inserts at the anchor', () => {
		const def = 'nested child.';
		const entry = makeEntry();
		const patch = patchFor(def, 'a', {
			op: 'move',
			payload: { anchor: 'nested', position: 'before', segment: ' child' },
		});
		const after = applyPatch(entry, patch);
		expect(after.content.senses[2]?.senses?.[0]?.definition).toBe(
			' childnested.',
		);
	});

	it('fails loudly when the anchor vanishes with the lifted segment', () => {
		const def = 'nested child.';
		const entry = makeEntry();
		const patch = patchFor(def, 'a', {
			op: 'move',
			payload: { anchor: 'child', position: 'after', segment: 'child' },
		});
		expect(() => applyPatch(entry, patch)).toThrow('move anchor');
	});
});

describe('delete', () => {
	it('applies segment scope: removes a duplicated tail', () => {
		const def = 'parent sense.';
		const entry = makeEntry();
		const patch = patchFor(def, '2)', {
			op: 'delete',
			payload: { scope: 'segment', segment: ' sense' },
		});
		const after = applyPatch(entry, patch);
		expect(after.content.senses[2]?.definition).toBe('parent.');
	});

	it('applies sense scope: removes the second twin only', () => {
		const entry = makeEntry();
		const patch = patchFor('twin.', '3)', {
			expected_occurrences: 2,
			occurrence_index: 2,
			op: 'delete',
			payload: { scope: 'sense' },
		});
		const after = applyPatch(entry, patch);
		const twins = after.content.senses.filter((s) => s.number === '3)');
		expect(twins).toHaveLength(1);
		expect(after.content.senses).toHaveLength(4);
	});

	it('rejects segment scope without a segment at parse time', () => {
		expect(() =>
			patchFor('x', '', { op: 'delete', payload: { scope: 'segment' } }),
		).toThrow('segment required');
	});
});

describe('replace', () => {
	it('applies: swaps the exact find text', () => {
		const def = 'unnumbered sense with l) inside.';
		const entry = makeEntry();
		const patch = patchFor(def, '', {
			op: 'replace',
			payload: { find: 'l)', replace: '1)' },
		});
		const after = applyPatch(entry, patch);
		expect(after.content.senses[1]?.definition).toBe(
			'unnumbered sense with 1) inside.',
		);
	});

	it('fails loudly when the find text is absent', () => {
		const def = 'twin.';
		const entry = makeEntry();
		const patch = patchFor(def, '3)', {
			expected_occurrences: 2,
			op: 'replace',
			payload: { find: 'missing', replace: 'x' },
		});
		expect(() => applyPatch(entry, patch)).toThrow('occurs 0 times');
	});
});

describe('unref', () => {
	const entry: SourceEntry = {
		content: { senses: [{ definition: 'x', number: '1)' }] },
		headword: 'x',
		refs: ['Yoma 2a', 'Yoma 2a:3', 'Pes. 4b'],
		rid: 'T00001',
	};
	const unref = (item: string): SemanticPatch =>
		patchFor(item, '', {
			op: 'unref',
			payload: {},
			target: `refs[${item}]:${contentAnchor(item)}`,
		});

	it('removes exactly the named item', () => {
		expect(applyPatch(entry, unref('Yoma 2a')).refs).toEqual([
			'Yoma 2a:3',
			'Pes. 4b',
		]);
	});

	it('throws when the item is gone', () => {
		expect(() => applyPatch(entry, unref('Git. 9a'))).toThrow(PatchApplyError);
	});

	it('only pairs unref with a refs target', () => {
		expect(() => patchFor('x', '1)', { op: 'unref', payload: {} })).toThrow(
			'unref needs a refs[…] target',
		);
	});

	it('rejects a refs target whose item is not expected_before', () => {
		expect(() =>
			patchFor('Yoma 2a', '', {
				op: 'unref',
				payload: {},
				target: `refs[Other]:${contentAnchor('Yoma 2a')}`,
			}),
		).toThrow('refs[Other] does not name expected_before');
	});

	it('rejects any other op with a refs[…] target', () => {
		expect(() =>
			patchFor('Yoma 2a', '', {
				op: 'retag',
				payload: { number: '1)' },
				target: `refs[Yoma 2a]:${contentAnchor('Yoma 2a')}`,
			}),
		).toThrow('refs[…] targets are only for unref');
	});
});

// biome-ignore lint/complexity/noExcessiveLinesPerFunction: one suite per behaviour; its cases share setup and read as a single table.
describe('reform', () => {
	const entry: SourceEntry = {
		alt_headwords: ['b', 'c'],
		content: { senses: [{ definition: 'x', number: '1)' }] },
		headword: 'a',
		rid: 'T00001',
	};
	const block = 'a\nb\nc';
	const reform = (
		payload: Record<string, unknown>,
		before = block,
	): SemanticPatch =>
		patchFor(before, '', {
			op: 'reform',
			payload,
			target: `forms:${contentAnchor(before)}`,
		});

	it('rewrites the whole block, splitting one form into two', () => {
		const after = applyPatch(entry, reform({ forms: ['a', 'b1', 'b2', 'c'] }));
		expect(after.headword).toBe('a');
		expect(after.alt_headwords).toEqual(['b1', 'b2', 'c']);
	});

	it('joins torn halves into one headword and drops the key when empty', () => {
		const torn: SourceEntry = {
			alt_headwords: ['\u05C1\u05D5\u05BC\u05E3'],
			content: { senses: [{ definition: 'x', number: '1)' }] },
			headword: '\u05E9',
			rid: 'T00001',
		};
		const joined = applyPatch(
			torn,
			reform(
				{ forms: ['\u05E9\u05C1\u05D5\u05BC\u05E3'] },
				'\u05E9\n\u05C1\u05D5\u05BC\u05E3',
			),
		);
		expect(joined.headword).toBe('\u05E9\u05C1\u05D5\u05BC\u05E3');
		expect('alt_headwords' in joined).toBe(false);
	});

	it('never mutates the entry it is given', () => {
		applyPatch(entry, reform({ forms: ['z'] }));
		expect(entry.headword).toBe('a');
		expect(entry.alt_headwords).toEqual(['b', 'c']);
	});

	it('fails loudly when the block moved under the patch', () => {
		const moved: SourceEntry = { ...entry, alt_headwords: ['b'] };
		expect(() => applyPatch(moved, reform({ forms: ['a'] }))).toThrow(
			PatchApplyError,
		);
	});

	it('only pairs reform with a forms target', () => {
		expect(() =>
			patchFor('a', '1)', {
				op: 'reform',
				payload: { forms: ['a'] },
			}),
		).toThrow('reform needs a forms:<8-hex-anchor> target');
	});

	it('rejects any other op with a forms: target', () => {
		expect(() =>
			patchFor('a', '', {
				op: 'retag',
				payload: { number: '1)' },
				target: `forms:${contentAnchor('a')}`,
			}),
		).toThrow('forms: targets are only for reform');
	});

	it('rejects a payload with no forms, an empty form or a newline', () => {
		expect(() => reform({ forms: [] })).toThrow('non-empty array');
		expect(() => reform({ forms: [''] })).toThrow('non-empty array');
		expect(() => reform({ forms: ['a', 'b\nc'] })).toThrow(
			'must not contain a newline',
		);
	});

	it('carries a display template, and removes one when it is omitted', () => {
		const laid = applyPatch(
			entry,
			reform({ display: '({0}, {1}, {2})', forms: ['a', 'b', 'c'] }),
		);
		expect(laid.display).toBe('({0}, {1}, {2})');
		expect(
			'display' in applyPatch(laid, reform({ forms: ['a'] }, 'a\nb\nc')),
		).toBe(false);
	});

	it('refuses a display that is not a template over the forms', () => {
		// §3.1 rules 1 and 2, checked where the text is still a patch
		// record: a malformed template is refused with the patch id
		// beside it rather than three stages later.
		expect(() => reform({ display: '{0} \u05D0\u05D1', forms: ['a'] })).toThrow(
			'no Hebrew',
		);
		expect(() => reform({ display: '{0}, {1}', forms: ['a'] })).toThrow(
			'names slots [0,1] for 1 form(s)',
		);
		expect(() => reform({ display: '{0}{0}', forms: ['a', 'b'] })).toThrow(
			'names slots [0,0] for 2 form(s)',
		);
		expect(() => reform({ display: '', forms: ['a'] })).toThrow(
			'non-empty string',
		);
	});

	it('lifts `= Y` off the line into the first sense of a senseless entry', () => {
		// A01175's shape (#113): the line is `X = Y` and the entry has no
		// sense for the cross-reference to move into.
		const bare: SourceEntry = {
			content: { senses: [] },
			headword: 'x = y',
			rid: 'T00001',
		};
		const after = applyPatch(
			bare,
			reform({ forms: ['x'], gloss: ' = y' }, 'x = y'),
		);
		expect(after.headword).toBe('x');
		expect(after.content.senses).toEqual([{ definition: ' = y' }]);
		expect(bare.content.senses).toEqual([]);
	});

	it('refuses a gloss on an entry that already has a sense', () => {
		// The field adds the first sense; it never overwrites one.
		expect(() =>
			applyPatch(entry, reform({ forms: ['a'], gloss: ' = y' })),
		).toThrow('the entry already has 1');
	});

	it('refuses an empty gloss', () => {
		expect(() => reform({ forms: ['a'], gloss: '' })).toThrow(
			'reform gloss must be a non-empty string',
		);
	});

	it('carries homographs onto the entry, and removes them when omitted', () => {
		// Ruling 10-09 reform homographs: a numeral Sefaria dropped, or an
		// I Jastrow's text names (10-13), is set by reviewed patch, so the
		// headword STRING (the link namespace) keeps Sefaria's spelling.
		const numbered = applyPatch(
			entry,
			reform({
				forms: ['a', 'b', 'c'],
				homographs: [
					{ form: 0, homograph: 1 },
					{ form: 2, homograph: 3 },
				],
			}),
		);
		expect(numbered.homographs).toEqual([
			{ form: 0, homograph: 1 },
			{ form: 2, homograph: 3 },
		]);
		expect(numbered.headword).toBe('a');
		expect('homographs' in applyPatch(numbered, reform({ forms: ['a'] }))).toBe(
			false,
		);
	});

	it.each([
		[[{ form: 3, homograph: 1 }], 'form 3 is not one of the 3 form(s)'],
		[[{ form: -1, homograph: 1 }], 'form -1 is not one of the 3 form(s)'],
		[[{ form: 0, homograph: 0 }], 'homograph must be a positive integer'],
		[[{ form: 0, homograph: 1.5 }], 'homograph must be a positive integer'],
		// Ruling 10-13 retired `implied`: a patch that still carries it is
		// refused, not read as a plain numeral.
		[[{ form: 0, homograph: 1, implied: true }], 'implied is not a field'],
		[[{ form: 0, homograph: 1, note: 'x' }], 'note is not a field'],
		[
			[
				{ form: 0, homograph: 1 },
				{ form: 0, homograph: 2 },
			],
			'form 0 twice',
		],
		[[], 'non-empty array'],
		['x', 'non-empty array'],
	])('refuses homographs %j', (homographs, reason) => {
		expect(() => reform({ forms: ['a', 'b', 'c'], homographs })).toThrow(
			reason,
		);
	});

	it('refuses a reform that claims more than one headword block', () => {
		// An entry has exactly one block; a count of 2 would parse, pass
		// expected_before, and rewrite a copy no caller checks.
		expect(() =>
			patchFor(block, '', {
				expected_occurrences: 2,
				op: 'reform',
				payload: { forms: ['a'] },
				target: `forms:${contentAnchor(block)}`,
			}),
		).toThrow(
			'reform expected_occurrences and occurrence_index must both be 1',
		);
	});

	it('counts the block as the byte pool the no-new-text gate reads', () => {
		// The pool must SEE the forms, or a reform could invent bytes
		// there and pass a gate measuring only `content`.
		expect(flattenContent(entry)).toContain(block);
	});

	it('reads the pre-§2 headword/alt_headwords payload forward', () => {
		// TRANSITIONAL: the 15 records already in
		// `admin/pipeline/patch/records/reviewed/` were written under the 2026-09-20
		// spelling. A patch corpus is evidence a person wrote from the
		// print, so it is read forward rather than rewritten under their
		// name. Both spellings are pinned here so neither can drift.
		const after = applyPatch(
			entry,
			reform({ alt_headwords: ['b1', 'b2'], headword: 'a' }),
		);
		expect(after.headword).toBe('a');
		expect(after.alt_headwords).toEqual(['b1', 'b2']);
	});

	it('refuses a record that carries both spellings', () => {
		// Not half-read: `readLegacyReform` steps aside when `forms` is
		// present, so a stale pair beside it would be silently ignored
		// and a reader could not tell which the run used.
		expect(() => reform({ alt_headwords: ['x'], forms: ['a', 'b'] })).toThrow(
			'both forms and the pre-2026-09-21 alt_headwords',
		);
	});

	it('refuses a malformed legacy payload instead of coercing it', () => {
		// The old validator required `alt_headwords` to be an array.
		// Coerced, `{headword: 'a'}` would become `forms: ['a']`, parse
		// cleanly, and delete every alternate on the entry.
		expect(() => reform({ headword: 'a' })).toThrow('non-empty array');
		expect(() => reform({ alt_headwords: 'b', headword: 'a' })).toThrow(
			'non-empty array',
		);
	});

	it('refuses a legacy payload carrying a gloss, display or homographs', () => {
		// The rebuild keeps only the forms, so any of them would be
		// dropped without a word — a gloss is the cross-reference itself.
		for (const extra of [
			{ gloss: ' = y' },
			{ display: '{0}' },
			{ homographs: [{ form: 0, homograph: 1 }] },
		]) {
			expect(() =>
				reform({ alt_headwords: [], headword: 'a', ...extra }),
			).toThrow('non-empty array');
		}
	});

	it('keeps a supplied display OUT of the pool', () => {
		// A template is not text: `({0}, {1})` contributes braces and
		// slot digits no entry holds, so pooling it would report every
		// well-formed template as invented bytes — a standing refusal
		// dressed as byte accounting. What the pool would have been
		// guarding is a template smuggling TEXT in, and that is refused
		// directly: a display holding Hebrew fails to parse.
		const laid = applyPatch(
			entry,
			reform({ display: '({0}, {1}, {2})', forms: ['a', 'b', 'c'] }),
		);
		expect(flattenContent(laid)).not.toContain('{0}');
		expect(() => reform({ display: '{0} \u05D0', forms: ['a'] })).toThrow(
			'no Hebrew',
		);
	});
});

// biome-ignore lint/complexity/noExcessiveLinesPerFunction: one suite per behaviour; its cases share setup and read as a single table.
describe('language_reference target', () => {
	// The etymology paren Sefaria keeps beside the senses, which the
	// import folds into `senses[0]`'s gloss head (`body/rejoin.ts`).
	// U00488's stray ` I` and the cites of review ledger L50 sit there.
	const reference = ' I (b. h.; = <a href="/Jastrow,_x.1">x</a>)';
	const entry: SourceEntry = {
		content: { senses: [{ definition: 'to blow.' }] },
		headword: 'x',
		language_reference: reference,
		rid: 'T00001',
	};
	const { language_reference: _, ...without } = entry;
	const onReference = (
		overrides: Record<string, unknown>,
		before = reference,
	): SemanticPatch =>
		patchFor(before, '', {
			op: 'replace',
			payload: { find: ' I (', replace: ' (' },
			target: `language_reference:${contentAnchor(before)}`,
			...overrides,
		});

	it('replaces inside the field, leaving the senses as they were', () => {
		const after = applyPatch(entry, onReference({}));
		expect(after.language_reference).toBe(
			' (b. h.; = <a href="/Jastrow,_x.1">x</a>)',
		);
		expect(after.content).toEqual(entry.content);
		expect(entry.language_reference).toBe(reference);
	});

	it('counts the field as one target, resolved once or not at all', () => {
		const patch = onReference({});
		expect(countTarget(entry, patch)).toBe(1);
		expect(countTarget({ ...entry, language_reference: 'moved' }, patch)).toBe(
			0,
		);
		expect(countTarget(without, patch)).toBe(0);
	});

	it.each([
		['the field moved', { ...entry, language_reference: ' II (b. h.)' }],
		['the field is absent', without],
	])('fails loudly when %s', (_name, moved: SourceEntry) => {
		expect(() => applyPatch(moved, onReference({}))).toThrow(
			'expected_before does not match language_reference',
		);
	});

	it('fails loudly when the find is not exactly once in the field', () => {
		expect(() =>
			applyPatch(entry, onReference({ payload: { find: 'y', replace: 'z' } })),
		).toThrow('occurs 0 times');
	});

	it.each([
		['retag', { number: '1)' }],
		['split', { marker: '2)' }],
		['reform', { forms: ['x'] }],
	])('refuses %s on a language_reference: target', (op, payload) => {
		expect(() => onReference({ op, payload })).toThrow(
			'language_reference: targets are only for replace and annotate',
		);
	});

	it('takes the target only once, like the headword block', () => {
		expect(() => onReference({ expected_occurrences: 2 })).toThrow(
			'a language_reference: target resolves once: expected_occurrences and occurrence_index must both be 1',
		);
	});

	it('rejects an anchor inconsistent with expected_before', () => {
		expect(() =>
			onReference({ target: `language_reference:${contentAnchor('other')}` }),
		).toThrow('does not match expected_before');
	});

	it('counts the field in the byte pool the no-new-text gate reads', () => {
		// The pool must SEE what the op edits, or a replace could invent
		// bytes there and pass a gate measuring only the senses.
		expect(flattenContent(entry)).toContain(reference);
	});
});

describe('apply assertions', () => {
	it('fails loudly on an expected_before drift (the maintenance signal)', () => {
		const entry = makeEntry();
		const stale = 'text the source no longer contains';
		const patch = patchFor(stale, '1)', {
			op: 'retag',
			payload: { number: '1)' },
		});
		// Same token exists, but no sense hashes to the stale anchor.
		expect(() => applyPatch(entry, patch)).toThrow('resolved to 0 sense(s)');
	});

	it('fails loudly when occurrences differ from expected', () => {
		const entry = makeEntry();
		const patch = patchFor('twin.', '3)', {
			expected_occurrences: 1,
			op: 'retag',
			payload: { number: '3)' },
		});
		expect(() => applyPatch(entry, patch)).toThrow(
			'resolved to 2 sense(s); expected 1',
		);
	});

	it('refuses a patch aimed at a different rid', () => {
		const entry = makeEntry();
		const patch = patchFor('twin.', '3)', {
			expected_occurrences: 2,
			op: 'retag',
			payload: { number: '3)' },
			rid: 'X00999',
		});
		expect(() => applyPatch(entry, patch)).toThrow(
			'patch is for X00999, entry is T00001',
		);
	});
});

describe('validateCorpus', () => {
	const def = 'twin.';
	const base = {
		expected_occurrences: 2,
		op: 'retag',
		payload: { number: '3)' },
	};

	it('reports duplicate ids and same-target overlaps together', () => {
		const a = patchFor(def, '3)', { ...base, id: 'P000001' });
		const b = patchFor(def, '3)', { ...base, id: 'P000001' });
		const problems = validateCorpus([a, b]);
		expect(problems.map((p) => p.reason).join('\n')).toMatch(
			/duplicate patch id/u,
		);
		expect(problems.map((p) => p.reason).join('\n')).toMatch(
			/overlapping patches on the same target/u,
		);
	});

	it('accepts distinct targets on the same rid', () => {
		const a = patchFor(def, '3)', { ...base, id: 'P000001' });
		const b = patchFor('parent sense.', '2)', {
			id: 'P000002',
			op: 'retag',
			payload: { number: '2)' },
		});
		expect(validateCorpus([a, b])).toEqual([]);
	});
});

describe('validateCorpus: ops that keep the text may share a target (L67)', () => {
	// L67: J00403's kept `)` is annotated on the sense P000820's
	// relabel targets. Neither op changes the text, so neither
	// invalidates the other's anchor, and the pair may share it.
	const kept = {
		annotation: {
			date: '2026-10-16',
			evidence: 'e',
			kind: 'kept',
			printed: 'a)',
		},
		id: 'P000002',
		op: 'annotate',
	};
	const lettered = 'x a) one.—b) two.';
	const relabel = patchFor(lettered, '', {
		op: 'relabel',
		payload: { run: ['a', 'b'], to: ['a', 'b'] },
	});

	it('accepts an annotate on the target of a relabel: neither changes the text', () => {
		const annotate = patchFor(lettered, '', {
			...kept,
			payload: { child: 'b', field: 'units' },
		});
		expect(validateCorpus([relabel, annotate])).toEqual([]);
	});

	it('still refuses an annotate on the target of a patch that changes the text', () => {
		const replace = patchFor(lettered, '', {
			op: 'replace',
			payload: { find: 'one', replace: 'One' },
		});
		const annotate = patchFor(lettered, '', {
			...kept,
			payload: { field: 'gloss' },
		});
		expect(validateCorpus([replace, annotate]).map((p) => p.patchIds)).toEqual([
			['P000001', 'P000002'],
		]);
	});
});

describe('countOccurrences', () => {
	it('counts non-overlapping occurrences', () => {
		expect(countOccurrences('—2) a —2) b', '—2)')).toBe(2);
		expect(countOccurrences('abc', 'd')).toBe(0);
		expect(countOccurrences('abc', '')).toBe(0);
	});
});
