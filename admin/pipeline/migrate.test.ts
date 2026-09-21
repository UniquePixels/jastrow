/**
 * `migrate.ts`'s ORCHESTRATION, which no per-module test can see.
 *
 * 734 lines with no test at all before 2026-09-21 (review, report-code
 * §6). `gates.ts` knows whether one tally is sound; `publication.ts`
 * knows what one row's class is; neither knows whether the CLI asks
 * them in the right order, whether it refuses a red run before it
 * writes, or whether it would overwrite a half-written truth tree.
 * That is what is asserted here.
 *
 * Nothing in this file reads `data/source/` (consolidation spec R9) or
 * touches `data/entries/`: the write guard runs against a temp
 * directory this test creates and removes, and every report below is
 * hand-built. The unit tier stays a fast tier.
 */
import { afterAll, describe, expect, it } from 'bun:test';
import { mark } from './migrate/gates.ts';
import { actionOf, classifyRows, PUBLICATION } from './migrate/publication.ts';
import type { GateName, Report, ReportRow } from './migrate/report.ts';
import { createReport, GATE_NAMES, isGreen } from './migrate/report.ts';
import { outputTreeIsEmpty, refuseUnlessEmpty } from './migrate.ts';

/** A scratch tree under the runner's own temp directory. Never
 * `data/entries`: the point of the guard is that it refuses a
 * non-empty tree, and proving it by filling the real one would be the
 * accident it exists to prevent.
 *
 * `Bun.env` rather than `process.env`, and no `node:os` import:
 * `biome.json` bans the process global and node modules from a test
 * file, and the override that relaxes the latter for
 * `admin/pipeline/**` excludes tests by design. Indexed rather than
 * dotted because the env's type is an index signature and
 * `noPropertyAccessFromIndexSignature` is on (TS4111). */
const TMP = `${Bun.env['TMPDIR'] ?? '/tmp'}/jastrow-migrate-test`;

afterAll(async () => {
	await Bun.$`rm -rf ${TMP}`.quiet().nothrow();
});

describe('the --write guard (spec R1, permanent)', () => {
	it('treats a directory that does not exist as empty', async () => {
		expect(await outputTreeIsEmpty(`${TMP}/never-created`)).toBe(true);
		await refuseUnlessEmpty(`${TMP}/never-created`);
	});

	it('treats a tree with no entry files as empty', async () => {
		const dir = `${TMP}/empty`;
		await Bun.write(`${dir}/README`, 'not an entry\n');
		expect(await outputTreeIsEmpty(dir)).toBe(true);
	});

	// The docstring's own reason for scanning rather than probing one
	// sentinel: a prior write that stopped early, or one that simply
	// does not begin at A00000, still has to refuse.
	it('refuses a partial tree that does not start at A00000', async () => {
		const dir = `${TMP}/partial`;
		await Bun.write(`${dir}/Z/Z09999.json`, '{}\n');
		expect(await outputTreeIsEmpty(dir)).toBe(false);
		// Awaited, because `.rejects` returns a promise: unawaited, the
		// case ends before the assertion runs and passes whatever the
		// guard did (Sonar S8780).
		await expect(refuseUnlessEmpty(dir)).rejects.toThrow(/writes once/u);
	});

	it('names the directory it refused', async () => {
		const dir = `${TMP}/named`;
		await Bun.write(`${dir}/A/A00001.json`, '{}\n');
		await expect(refuseUnlessEmpty(dir)).rejects.toThrow(dir);
	});
});

/** A report that would pass: one entry, every gate marked once and
 * passing. `internalTargets` is left at 0/0 deliberately — an empty
 * quarantine list is the green state for that one gate, and
 * `isGreen` exempts it by name. */
function greenReport(): Report {
	const report = createReport();
	report.entries = 1;
	for (const name of GATE_NAMES) {
		if (name !== 'internalTargets') {
			mark(report.gates[name], true, '');
		}
	}
	return report;
}

describe('isGreen refuses a red run before anything is written', () => {
	it('passes the all-green report', () => {
		expect(isGreen(greenReport())).toBe(true);
	});

	it('refuses a run that composed nothing', () => {
		const report = greenReport();
		report.entries = 0;
		expect(isGreen(report)).toBe(false);
	});

	// Every gate is load-bearing, and this is the assertion that says
	// so: drop a gate's enforcement and the case for that name fails,
	// rather than the suite passing on the eight that remain.
	for (const name of GATE_NAMES) {
		it(`refuses a failing ${name}`, () => {
			const report = greenReport();
			mark(report.gates[name], false, `${name}: rigged`);
			expect(isGreen(report)).toBe(false);
		});
	}

	// A gate the run never reached reads 0/0, which is `pass === total`
	// and an empty failure list — green by arithmetic and meaningless
	// in fact. `internalTargets` is the ONE name allowed to be 0/0.
	for (const name of GATE_NAMES) {
		it(`refuses an unreached ${name}`, () => {
			const report = greenReport();
			report.gates[name] = { failures: [], pass: 0, total: 0 };
			expect(isGreen(report)).toBe(name === 'internalTargets');
		});
	}

	it('refuses internalTargets when it reports a failure at 0/0', () => {
		const report = greenReport();
		report.gates.internalTargets.failures.push('unlisted: A00001 → x');
		expect(isGreen(report)).toBe(false);
	});
});

function row(kind: string, bucket: ReportRow['bucket']): ReportRow {
	return {
		bucket,
		detail: 'detail',
		kind,
		rid: 'A00001',
		severity: bucket === 'pipeline' ? 'fault' : 'review',
	};
}

describe('classifyRows stamps every row the report will render', () => {
	// `classifyRows` runs ONCE, in `main`, after the last row is pushed.
	// A row that reaches the report unstamped is rendered in no section
	// of the review report at all, so "every kind, every row" is the
	// property — not "the kinds we remembered".
	it('stamps one row of every classified kind', () => {
		const report = createReport();
		report.rows.push(...[...PUBLICATION.keys()].map((k) => row(k, 'review')));
		classifyRows(report);
		expect(report.rows.filter((r) => r.publication === undefined)).toEqual([]);
		for (const r of report.rows) {
			expect(r.publication).toBe(PUBLICATION.get(r.kind)?.publication as never);
		}
	});

	// Every kind carries an action sentence as well as a class, and the
	// report prints it once per section — so a kind with an empty one
	// heads a section that tells the reader nothing.
	it('gives every kind a non-empty action sentence', () => {
		for (const [kind, rule] of PUBLICATION) {
			expect(actionOf(kind)).toBe(rule.action);
			expect(rule.action.length).toBeGreaterThan(0);
		}
	});

	it('stamps a patch row as well as a review row', () => {
		const report = createReport();
		report.rows.push(row('upstream-changed', 'patch'));
		classifyRows(report);
		expect(report.rows[0]?.publication).toBe('blocks');
	});

	// A pipeline fault refuses the write outright; it carries no
	// publication class and must not be given one.
	it('leaves a pipeline fault unstamped', () => {
		const report = createReport();
		report.rows.push(row('finish-failed', 'pipeline'));
		classifyRows(report);
		expect(report.rows[0]?.publication).toBeUndefined();
	});

	// The table is exhaustive by refusal: a kind nobody classified
	// cannot ship as an unclassified row.
	it('throws on a review kind no one classified', () => {
		const report = createReport();
		report.rows.push(row('a-kind-invented-for-this-test', 'review'));
		expect(() => {
			classifyRows(report);
		}).toThrow(/publication class/u);
	});

	it('is idempotent, so a second call cannot change a stamp', () => {
		const report = createReport();
		report.rows.push(row('markup-carry', 'review'));
		classifyRows(report);
		const first = report.rows[0]?.publication;
		classifyRows(report);
		expect(report.rows[0]?.publication).toBe(first as never);
	});
});

describe('the gate set itself', () => {
	// `createReport` builds every gate up front so a gate the run never
	// reached shows as 0/0 rather than going missing — which is the only
	// reason the "unreached" cases above can tell the two apart.
	it('creates every named gate, empty, in the declared order', () => {
		const report = createReport();
		expect(Object.keys(report.gates)).toEqual([...GATE_NAMES]);
		for (const name of GATE_NAMES) {
			expect(report.gates[name]).toEqual({ failures: [], pass: 0, total: 0 });
		}
	});

	it('names the nine gates of migrate spec §4.1', () => {
		const expected: readonly GateName[] = [
			'bodyRoundTrips',
			'headwordRoundTrip',
			'textConservation',
			'schema',
			'chain',
			'internalTargets',
			'slugs',
			'pages',
			'composition',
		];
		expect([...GATE_NAMES]).toEqual([...expected]);
	});
});
