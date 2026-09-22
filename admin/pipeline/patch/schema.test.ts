// biome-ignore-all lint/style/noExcessiveLinesPerFile: a table-driven suite; the cases and the fixtures they share read as one unit.
import { describe, expect, it } from 'bun:test';
import type { SourceEntry, SourceSense } from '../types.ts';
import {
	applyPatch,
	contentAnchor,
	countOccurrences,
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
			{ definition: 'see (v. X2) Y) night', number: '1)' },
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
			{ definition: 'day2) night', number: 'a)' },
		]);
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
		// `data/patches/reviewed/` were written under the 2026-09-20
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

describe('countOccurrences', () => {
	it('counts non-overlapping occurrences', () => {
		expect(countOccurrences('—2) a —2) b', '—2)')).toBe(2);
		expect(countOccurrences('abc', 'd')).toBe(0);
		expect(countOccurrences('abc', '')).toBe(0);
	});
});
