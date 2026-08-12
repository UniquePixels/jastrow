import { describe, expect, it } from 'bun:test';
import type { SourceEntry } from '../body/types.ts';
import {
	applyPatch,
	contentAnchor,
	countOccurrences,
	parsePatch,
	parsePatchLine,
	parseTarget,
	resolveTarget,
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
