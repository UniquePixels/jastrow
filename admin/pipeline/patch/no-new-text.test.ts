import { describe, expect, it } from 'bun:test';
import type { SourceEntry } from '../body/types.ts';
import { type NoNewTextVerdict, validateNoNewText } from './no-new-text.ts';
import {
	applyPatch,
	contentAnchor,
	parsePatch,
	type SemanticPatch,
} from './schema.ts';

const SNAPSHOT = `sha256:${'0'.repeat(64)}`;

function makeEntry(): SourceEntry {
	return {
		content: {
			senses: [
				{
					definition: 'to test. Ber. 6ᵇ.—2) to prove, meritorious deed.',
					number: '1)',
				},
				{ definition: 'unnumbered sense with l) inside.' },
				{ definition: 'tail. tail.', number: '2)' },
			],
		},
		headword: 'טסט',
		rid: 'T00001',
	};
}

function patchFor(
	definition: string,
	token: string,
	overrides: Record<string, unknown>,
): SemanticPatch {
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

/** Apply and validate in one step. */
function verdictOf(patch: SemanticPatch): NoNewTextVerdict {
	const before = makeEntry();
	const after = applyPatch(before, patch);
	return validateNoNewText(patch, before, after);
}

describe('validateNoNewText', () => {
	it('accepts a byte-conserving split', () => {
		const verdict = verdictOf(
			patchFor('to test. Ber. 6ᵇ.—2) to prove, meritorious deed.', '1)', {
				op: 'split',
				payload: { marker: '—2)' },
			}),
		);
		expect(verdict.ok).toBe(true);
	});

	it('accepts a retag that synthesizes a closed-grammar marker', () => {
		const verdict = verdictOf(
			patchFor('unnumbered sense with l) inside.', '', {
				op: 'retag',
				payload: { number: '1)' },
			}),
		);
		expect(verdict.ok).toBe(true);
	});

	it('accepts the OCR l) → 1) replace via the marker allowance', () => {
		const verdict = verdictOf(
			patchFor('unnumbered sense with l) inside.', '', {
				op: 'replace',
				payload: { find: 'l)', replace: '1)' },
			}),
		);
		expect(verdict.ok).toBe(true);
	});

	it('accepts a byte-conserving move', () => {
		const verdict = verdictOf(
			patchFor('tail. tail.', '2)', {
				op: 'move',
				payload: { anchor: 'tail.', position: 'after', segment: ' tail' },
			}),
		);
		expect(verdict.ok).toBe(true);
	});

	it('accepts a delete (bytes only ever leave)', () => {
		const verdict = verdictOf(
			patchFor('tail. tail.', '2)', {
				op: 'delete',
				payload: { scope: 'segment', segment: ' tail.' },
			}),
		);
		expect(verdict.ok).toBe(true);
	});
});

describe('validateNoNewText rejections', () => {
	it('rejects a replace that invents words, re-dispositioning to needs_print_check', () => {
		const verdict = verdictOf(
			patchFor('unnumbered sense with l) inside.', '', {
				op: 'replace',
				payload: { find: 'l)', replace: 'newly invented prose' },
			}),
		);
		expect(verdict).toMatchObject({
			ok: false,
			reason: expect.stringContaining('introduces bytes not drawn from'),
			redisposition: 'needs_print_check',
		});
	});

	it('rejects marker-adjacent smuggling: digits beyond the tokens in the payload', () => {
		// '99)' is a valid closed-grammar token, but the replace also
		// carries a stray digit sequence outside any token — only the
		// token itself is in the allowance, so the rest must come from
		// the source bytes (this definition has no digits).
		const verdict = verdictOf(
			patchFor('unnumbered sense with l) inside.', '', {
				op: 'replace',
				payload: { find: 'l)', replace: '99) 77' },
			}),
		);
		expect(verdict.ok).toBe(false);
	});
});
