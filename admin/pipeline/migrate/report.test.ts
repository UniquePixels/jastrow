import { describe, expect, it } from 'bun:test';
import type { QuarantineRow } from './cite.ts';
import type { GateName, Report, Sample } from './report.ts';
import {
	createReport,
	createRuleCounter,
	GATE_NAMES,
	isGreen,
	lineRow,
	renderBlessing,
	writeReport,
} from './report.ts';
import { SCHEMA_VERSION, type Tally, type TruthEntry } from './types.ts';

/** A gate that ran once and passed. */
function greenTally(): Tally {
	return { failures: [], pass: 1, total: 1 };
}

/** A report where entries = 1 and every gate is 1/1, except
 * `internalTargets`, which is legitimately 0/0 (no quarantine rows). */
function greenReport(): Report {
	const gates = Object.fromEntries(
		GATE_NAMES.map((name) => [
			name,
			name === 'internalTargets'
				? { failures: [], pass: 0, total: 0 }
				: greenTally(),
		]),
	) as Record<GateName, Tally>;
	return {
		entries: 1,
		gates,
		patchOutcomes: [],
		patches: {
			absorbed: 0,
			accepted: 0,
			applied: 0,
			carried: 0,
			reviewed: 0,
			upstreamChanged: 0,
			upstreamFixed: 0,
		},
		quarantine: [],
		rows: [],
		rules: [],
		snapshot: { pin: `sha256:${'a'.repeat(64)}`, stalePins: 0 },
		unresolved: [],
		written: 1,
	};
}

describe('createReport', () => {
	it('is not green', () => {
		expect(isGreen(createReport())).toBe(false);
	});

	it('zeroes all nine gates', () => {
		const report = createReport();
		expect(Object.keys(report.gates).sort()).toEqual([...GATE_NAMES].sort());
		for (const name of GATE_NAMES) {
			expect(report.gates[name]).toEqual({ failures: [], pass: 0, total: 0 });
		}
	});
});

describe('isGreen', () => {
	it('is true for entries = 1 with every gate 1/1 (internalTargets 0/0)', () => {
		expect(isGreen(greenReport())).toBe(true);
	});

	it('is false when one gate is red', () => {
		const report = greenReport();
		report.gates.chain = { failures: ['A00001: chain'], pass: 0, total: 1 };
		expect(isGreen(report)).toBe(false);
	});

	it('is false when a gate other than internalTargets never reached (total 0)', () => {
		const report = greenReport();
		report.gates.schema = { failures: [], pass: 0, total: 0 };
		expect(isGreen(report)).toBe(false);
	});

	it('is false when internalTargets is 0/0 but lists a failure', () => {
		// internalTargets is the one gate exempt from the total > 0
		// check, so its failure list is the ONLY thing standing between
		// a quarantine mismatch and a green --write.
		const report = greenReport();
		report.gates.internalTargets = {
			failures: ['unlisted: A00349|אַנְגַּרְמוֹס'],
			pass: 0,
			total: 0,
		};
		expect(isGreen(report)).toBe(false);
	});
});

describe('lineRow', () => {
	it('splits a finishEntry line at the first ": " only', () => {
		expect(
			lineRow('A00002: senses[0].gloss: carried i', 'markup-carry'),
		).toEqual({
			bucket: 'review',
			detail: 'senses[0].gloss: carried i',
			kind: 'markup-carry',
			rid: 'A00002',
			severity: 'review',
		});
	});

	it('throws on a line with no rid prefix', () => {
		expect(() => lineRow('no prefix here', 'markup-carry')).toThrow('rid');
	});
});

describe('createRuleCounter', () => {
	it('rows every registered rule, zeros included, then unregistered ones', () => {
		const counter = createRuleCounter(['a', 'b']);
		counter.add('b', 'A00001');
		counter.add('b', 'A00001');
		counter.add('b', 'A00002');
		counter.add('z', 'A00003');
		expect(counter.rows()).toEqual([
			{ entries: 0, fired: 0, rule: 'a' },
			{ entries: 2, fired: 3, rule: 'b' },
			{ entries: 1, fired: 1, rule: 'z' },
		]);
	});
});

describe('renderBlessing', () => {
	it('renders every section, rows as "rid: detail" under their own heading', () => {
		const report = greenReport();
		report.rows = [
			lineRow('A00002: ambiguous vocalization', 'headword-unparsed'),
			lineRow('A00002: senses[0].gloss: carried i', 'markup-carry'),
			{
				bucket: 'review',
				detail: 'p12a (low)',
				kind: 'page-confidence-low',
				rid: 'A00003',
				severity: 'review',
			},
			{
				bucket: 'patch',
				detail: 'P000001 (ocr-marker): re-judge',
				kind: 'upstream-changed',
				rid: 'A00005',
				severity: 'review',
			},
			{
				bucket: 'pipeline',
				detail: 'transform: boom',
				kind: 'composition-failed',
				rid: 'A00006',
				severity: 'fault',
			},
		];
		report.rules = [{ entries: 2, fired: 3, rule: 'bare-rtl-hebrew' }];
		report.snapshot.stalePins = 4;
		const quarantine: QuarantineRow[] = [
			{ note: 'no match', rid: 'A00004', target: 'שלום' },
		];
		report.quarantine = quarantine;
		const sample: Sample = {
			rid: 'A00013',
			source: { headword: 'אָב I', rid: 'A00013' },
			truth: {
				headwords: [{ text: 'אָב I' }],
				id: 'A00013',
				schemaVersion: SCHEMA_VERSION,
				sefariaHeadword: 'אָב I',
				senses: [],
			} satisfies TruthEntry,
		};
		const doc = renderBlessing(report, [sample]);
		const section = (heading: string): string => {
			const start = doc.indexOf(`## ${heading}\n`);
			const end = doc.indexOf('\n## ', start + 1);
			return doc.slice(start, end === -1 ? undefined : end);
		};
		expect(doc).toContain('4 patch(es) pinned to a different snapshot');
		expect(doc).toContain('| Gate |');
		expect(section('Pipeline faults')).toContain('- A00006: transform: boom');
		expect(section('Headword review')).toContain(
			'- A00002: ambiguous vocalization',
		);
		expect(section('Headword review')).not.toContain('p12a');
		expect(section('Markup carried across unit boundaries')).toContain(
			'- A00002: senses[0].gloss: carried i',
		);
		expect(section('Page placements needing review')).toContain(
			'- A00003: p12a (low)',
		);
		expect(section('Patches needing re-judgment')).toContain(
			'- A00005: P000001 (ocr-marker): re-judge',
		);
		expect(section('Rule counts')).toContain('| bare-rtl-hebrew | 3 | 2 |');
		expect(doc).not.toContain('Slug collisions');
		expect(doc).toContain('## Quarantined internal targets');
		expect(doc).toContain('### A00013');
	});

	it('renders empty-list placeholders when a report has nothing to review', () => {
		const doc = renderBlessing(greenReport(), []);
		expect(doc).toContain('_none_');
	});
});

describe('writeReport', () => {
	it('writes tab-indented JSON with a trailing newline', async () => {
		const path = `${import.meta.dir}/.report.test.json`;
		try {
			await writeReport(greenReport(), path);
			const text = await Bun.file(path).text();
			expect(text.endsWith('\n')).toBe(true);
			expect(text).toContain('\t"entries": 1');
			expect(JSON.parse(text)).toEqual(greenReport());
		} finally {
			// Swallowed: if writeReport threw before Bun.write created the
			// file, this delete rejects with ENOENT and that rejection
			// would replace the failure the test is actually reporting.
			await Bun.file(path)
				.delete()
				.catch(() => {});
		}
	});
});
