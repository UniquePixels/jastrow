import { describe, expect, it } from 'bun:test';
import type { QuarantineRow } from './cite.ts';
import type { GateName, Report, Sample } from './report.ts';
import {
	createReport,
	GATE_NAMES,
	isGreen,
	renderBlessing,
	writeReport,
} from './report.ts';
import type { Tally, TruthEntry } from './types.ts';

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
		headwordReview: [],
		nonHighPages: [],
		patches: { absorbed: 0, accepted: 0, applied: 0, carried: 0 },
		quarantine: [],
		slugCollisions: {},
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
});

describe('renderBlessing', () => {
	it('renders every required section', () => {
		const report = greenReport();
		report.headwordReview = ['A00002: ambiguous vocalization'];
		report.nonHighPages = ['A00003: page confidence low'];
		report.slugCollisions = { '2': 3 };
		const quarantine: QuarantineRow[] = [
			{ note: 'no match', rid: 'A00004', target: 'שלום' },
		];
		report.quarantine = quarantine;
		const sample: Sample = {
			rid: 'A00013',
			source: { headword: 'אָב I', rid: 'A00013' },
			truth: {
				headword: { text: 'אָב I' },
				id: 'A00013',
				senses: [],
				slug: 'av-i',
			} satisfies TruthEntry,
		};
		const doc = renderBlessing(report, [sample]);
		expect(doc).toContain('| Gate |');
		expect(doc).toContain('## Headword review');
		expect(doc).toContain('## Page placements needing review');
		expect(doc).toContain('## Slug collisions');
		expect(doc).toContain('## Quarantined internal targets');
		expect(doc).toContain('## Samples');
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
			await Bun.file(path).delete();
		}
	});
});
