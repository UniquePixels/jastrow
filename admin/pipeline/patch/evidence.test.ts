/** The `evidence` and `status` fields of a patch record, the op table
 * the evidence rule reads, and the preflight and apply that enforce it
 * (ruling `10-26 patch evidence`; `schema.ts`, `apply.ts`). Each case
 * is one tuple, the evidence as JSON text, so the tables repeat no
 * keys. */
import { describe, expect, it } from 'bun:test';
import type { SourceEntry } from '../types.ts';
import {
	applyEntryPatches,
	corpusPreflight,
	splitProvisional,
} from './apply.ts';
import {
	contentAnchor,
	type PatchOp,
	parsePatch,
	type SemanticPatch,
	TEXT_CHANGING,
} from './schema.ts';

const DEFINITION = 'to test. Ber. 6ᵇ.';
const SNAPSHOT = `sha256:${'0'.repeat(64)}`;

/** A valid retag record with `extra` fields merged in. */
function record(extra: Record<string, unknown>): Record<string, unknown> {
	return {
		defect_class: 'test-class',
		expected_before: DEFINITION,
		id: 'P000001',
		op: 'retag',
		payload: { number: '1)' },
		prompt_version: 'v1',
		rationale: 'test rationale',
		rid: 'T00001',
		snapshot: SNAPSHOT,
		target: `sense[]:${contentAnchor(DEFINITION)}`,
		...extra,
	};
}

const READ = '"kind":"maintainer-read"';
const HOCR = '"kind":"hOCR"';

type Accepted = readonly [name: string, evidence: string];
const ACCEPTED: readonly Accepted[] = [
	['a read', `{${READ},"date":"2026-10-25","reader":"Brian"}`],
	[
		'a read, located',
		`{${READ},"date":"2026-10-25","reader":"B","leaf":4,"volume":1}`,
	],
	['hOCR', `{${HOCR},"leaf":85,"quote":"IT m. (v. 928 2)","volume":1}`],
	['jastrow-text', '{"kind":"jastrow-text","quote":"—2)"}'],
	['sefaria-only', '{"kind":"sefaria-only"}'],
	['pending', '{"kind":"sefaria-only","pending":true}'],
];

type Refused = readonly [name: string, evidence: string, reason: string];
const REFUSED: readonly Refused[] = [
	[
		'a read, no reader',
		`{${READ},"date":"2026-10-25"}`,
		'needs evidence.reader',
	],
	['a read, no date', `{${READ},"reader":"Brian"}`, 'needs evidence.date'],
	['hOCR, no quote', `{${HOCR},"leaf":85,"volume":1}`, 'needs evidence.quote'],
	['hOCR, no leaf', `{${HOCR},"quote":"a line"}`, 'needs evidence.leaf'],
	['jastrow-text, no quote', '{"kind":"jastrow-text"}', 'needs evidence.quote'],
	['an unknown kind', '{"kind":"vibes"}', 'evidence.kind must be'],
	[
		'pending hOCR',
		`{${HOCR},"leaf":8,"quote":"q","volume":1,"pending":true}`,
		'only on sefaria-only',
	],
	[
		'pending: false',
		'{"kind":"sefaria-only","pending":false}',
		'pending is true',
	],
	['a leaf alone', `{${HOCR},"leaf":8,"quote":"q"}`, 'go together'],
	['volume 3', `{${HOCR},"leaf":8,"quote":"q","volume":3}`, 'must be 1 or 2'],
	[
		'a negative leaf',
		`{${HOCR},"leaf":-1,"quote":"q","volume":1}`,
		'non-negative',
	],
	['a non-ISO date', `{${READ},"date":"25/10/2026","reader":"B"}`, 'ISO date'],
	['an empty quote', '{"kind":"jastrow-text","quote":""}', 'non-empty string'],
	[
		'an unknown key',
		'{"kind":"sefaria-only","why":"x"}',
		'not an evidence field',
	],
	['a string', '"print read"', 'evidence must be an object'],
];

type Op = readonly [op: PatchOp, changes: boolean];
const OPS: readonly Op[] = [
	['replace', true],
	['reform', true],
	['unref', true],
	['delete', true],
	['move', true],
	['split', true],
	['join', true],
	['nest', true],
	['retag', false],
	['relabel', false],
	['annotate', false],
];

describe('evidence: each kind states what it needs', () => {
	it.each(ACCEPTED)('accepts %s', (_name, json) => {
		const evidence: unknown = JSON.parse(json);
		expect(parsePatch(record({ evidence })).evidence).toEqual(
			evidence as never,
		);
	});

	it.each(REFUSED)('refuses %s', (_name, json, reason) => {
		const evidence: unknown = JSON.parse(json);
		expect(() => parsePatch(record({ evidence }))).toThrow(reason);
	});

	it('leaves evidence off a record that has none', () => {
		expect('evidence' in parsePatch(record({}))).toBe(false);
	});
});

describe('status: provisional is the only value', () => {
	it('carries provisional through', () => {
		const status = parsePatch(record({ status: 'provisional' })).status;
		expect(status).toBe('provisional');
	});

	it('refuses any other status', () => {
		expect(() => parsePatch(record({ status: 'final' }))).toThrow(
			'status, when present, must be provisional',
		);
	});
});

describe('confidence is gone', () => {
	it('does not carry a stray confidence through', () => {
		const patch = parsePatch(record({ confidence: 'high' }));
		expect('confidence' in patch).toBe(false);
	});
});

describe('TEXT_CHANGING: which ops may not stand on Sefaria alone', () => {
	it.each(OPS)('%s → %p', (op, changes) => {
		expect(TEXT_CHANGING[op]).toBe(changes);
	});

	it('names every op the grammar has', () => {
		expect(Object.keys(TEXT_CHANGING).sort()).toEqual(
			OPS.map(([op]) => op).sort(),
		);
	});
});

/** A record as the loader returns it: parsed, and stamped human when
 * it came from `reviewed/`. */
function loaded(
	extra: Record<string, unknown>,
	reviewed: boolean,
): SemanticPatch {
	const patch = parsePatch(record(extra));
	return reviewed ? { ...patch, author: 'human' } : patch;
}

const REPLACE = { op: 'replace', payload: { find: 'test', replace: 'tset' } };
const RETAG = { op: 'retag', payload: { number: '1)' } };
const SEFARIA = '{"kind":"sefaria-only"}';
const PENDING = '{"kind":"sefaria-only","pending":true}';
const PRINT_READ = `{${READ},"date":"2026-10-25","reader":"B"}`;

/** An op's fields with `json` as its evidence (none when empty). */
function evidenced(
	op: typeof REPLACE | typeof RETAG,
	json: string,
): Record<string, unknown> {
	return json === '' ? op : { ...op, evidence: JSON.parse(json) as unknown };
}

type Preflight = readonly [
	name: string,
	fields: Record<string, unknown>,
	reviewed: boolean,
	refusal: string,
];
const PREFLIGHT: readonly Preflight[] = [
	['a reviewed patch with none', RETAG, true, 'with no evidence'],
	['an agent patch with none', RETAG, false, ''],
	[
		'a text change on Sefaria',
		evidenced(REPLACE, SEFARIA),
		true,
		'a replace on sefaria',
	],
	['a text change pending', evidenced(REPLACE, PENDING), true, ''],
	['a retag on Sefaria', evidenced(RETAG, SEFARIA), true, ''],
	['a text change on a read', evidenced(REPLACE, PRINT_READ), true, ''],
];

describe('corpusPreflight: the evidence rule', () => {
	it.each(PREFLIGHT)('%s', (_name, fields, reviewed, refusal) => {
		const patch = loaded(fields, reviewed);
		const problems = corpusPreflight([patch], [], SNAPSHOT, {
			escalations: 'defer',
			reconcileOnly: [],
		});
		expect(problems.map((p) => [p.patchId, p.rid])).toEqual(
			refusal === '' ? [] : [['P000001', 'T00001']],
		);
		expect(problems.map((p) => p.reason).join('')).toContain(refusal);
	});
});

describe('a provisional patch is held, never applied', () => {
	const held = loaded({ ...RETAG, status: 'provisional' }, true);
	const kept = loaded({ ...RETAG, id: 'P000002' }, true);

	it('splitProvisional holds it out of the apply set', () => {
		expect(splitProvisional([held, kept])).toEqual({
			apply: [kept],
			held: [held],
		});
	});

	it('the apply refuses one that bypassed the hold', () => {
		const entry: SourceEntry = {
			content: { senses: [{ definition: DEFINITION }] },
			headword: 'x',
			rid: 'T00001',
		};
		const { entry: after, problems } = applyEntryPatches(entry, [held]);
		expect(problems.map((p) => p.reason)).toEqual([
			'a provisional patch reached the apply: hold it with splitProvisional',
		]);
		expect(after).toBe(entry);
	});
});
