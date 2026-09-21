import { describe, expect, it } from 'bun:test';
import type { Pattern } from '../patch/patterns.ts';
import { DETECTED_CLASSES } from './detectors/classes.ts';
import { classifyRows } from './publication.ts';
import type { Report } from './report.ts';
import { createReport, lineRow } from './report.ts';
import {
	loadUndetectedClasses,
	PATTERNS_PATH,
	renderReviewReport,
	undetectedClasses,
} from './review-report.ts';

/** Two catalogued classes with NO detector on the import path,
 * deliberately out of count order: the renderer prints what it is
 * handed, and `undetectedClasses` is what puts them in order — so the
 * render tests go through it, as the run does.
 *
 * Both ids are unregistered on purpose. A registered one would be
 * filtered out and every render assertion below would then be made
 * against an empty section. */
const CATALOGUED: readonly Pattern[] = [
	{
		blocking: true,
		corpusCount: 33,
		description: 'a mis-split judged against the print page',
		id: 'verse-paren-false-sense-split',
		round: 3,
		route: 'judgment',
		status: 'candidate',
	},
	{
		blocking: true,
		corpusCount: 342,
		description: 'the whole definition is the etymology parenthetical',
		id: 'etymology-head-pseudo-sense',
		round: 1,
		route: 'judgment',
		status: 'candidate',
	},
];

/** The catalogue as `migrate.ts` hands it to the renderer. */
const SORTED = undetectedClasses(CATALOGUED);

function sample(): Report {
	const report = createReport();
	report.entries = 3;
	report.rows = [
		lineRow('A00003: p1a (medium)', 'page-confidence-medium'),
		lineRow('A00001: ?אִיבּוּס — grammar did not parse', 'headword-unparsed'),
		lineRow('A00002: senses[0].gloss: carried i', 'markup-carry'),
		lineRow('A00004: boom', 'finish-failed', 'pipeline', 'fault'),
	];
	classifyRows(report);
	return report;
}

/** A patch row (object literal, since `lineRow` only builds `review`
 * rows), a note row, and two same-kind rows in a known order. */
function sampleForOrdering(): Report {
	const report = createReport();
	report.entries = 4;
	report.rows = [
		{
			bucket: 'patch',
			detail: 'source now differs from both the before and after',
			kind: 'upstream-changed',
			rid: 'A00010',
			severity: 'review',
		},
		lineRow('A00011: bare stem now free', 'slug-new'),
		lineRow('A00012: p1a (medium)', 'page-confidence-medium'),
		lineRow('A00013: p2b (medium)', 'page-confidence-medium'),
	];
	classifyRows(report);
	return report;
}

describe('undetectedClasses', () => {
	it('keeps blocking candidates off the transform route, largest first', () => {
		expect(undetectedClasses(CATALOGUED).map((c) => c.id)).toEqual([
			'etymology-head-pseudo-sense',
			'verse-paren-false-sense-split',
		]);
	});
	it('drops a class once a detector on the import path emits its rows', () => {
		const base = CATALOGUED[1] as Pattern;
		const detected: Pattern = { ...base, id: 'empty-stem-section' };
		expect(undetectedClasses([detected])).toEqual([]);
		// And the filter is the registry, not a hard-coded id list: the
		// same row survives when the registry does not name it.
		expect(undetectedClasses([detected], new Set()).map((c) => c.id)).toEqual([
			'empty-stem-section',
		]);
	});
	it('drops a class a registered rule already answers', () => {
		const transformRouted: Pattern = {
			...(CATALOGUED[1] as Pattern),
			id: 'bare-rtl-hebrew',
			route: 'transform',
		};
		expect(undetectedClasses([transformRouted])).toEqual([]);
	});
	it('drops a class that is not blocking, and one already resolved', () => {
		const base = CATALOGUED[1] as Pattern;
		expect(undetectedClasses([{ ...base, blocking: false }])).toEqual([]);
		expect(undetectedClasses([{ ...base, status: 'discarded' }])).toEqual([]);
	});
	it('drops an untriaged row, which no ruling has reached', () => {
		const { route, ...untriaged } = CATALOGUED[1] as Pattern;
		expect(route).toBe('judgment');
		expect(undetectedClasses([untriaged])).toEqual([]);
	});
	it('keeps a blocked-route row', () => {
		const blocked: Pattern = {
			...(CATALOGUED[1] as Pattern),
			route: 'blocked',
		};
		expect(undetectedClasses([blocked]).map((c) => c.id)).toEqual([
			'etymology-head-pseudo-sense',
		]);
	});
});

describe('loadUndetectedClasses', () => {
	// The zero needs a control, or it reads the same as a filter that
	// matched nothing because it was looking at an empty catalogue.
	// The control: the same five classes are still in the file, still
	// blocking, still off the transform route — and every one of them
	// is now a registered detector kind, which is the only reason the
	// list is empty (post-consolidation review §2 finding 2).
	it('reads no undetected blocking class: all five now have detectors', async () => {
		expect(await loadUndetectedClasses()).toEqual([]);
		const stillCatalogued = await loadUndetectedClasses(
			PATTERNS_PATH,
			new Set(),
		);
		expect(stillCatalogued.length).toBe(5);
		expect(stillCatalogued.map((c) => c.id)).toContain('empty-stem-section');
		for (const c of stillCatalogued) {
			expect(c.blocking).toBe(true);
			expect(c.status).toBe('candidate');
			expect(c.route).not.toBe('transform');
			expect(DETECTED_CLASSES.has(c.id)).toBe(true);
		}
	});
});

describe('renderReviewReport', () => {
	it('renders the exact document', () => {
		expect(renderReviewReport(sample(), SORTED)).toBe(
			[
				'# Review report',
				'',
				'Generated by `bun data:import` over 3 entries: every review and patch row of the run, by whether it must be resolved before v2 is published (consolidation spec §3.1.1). Deferred rows become tracker issues; notes do not. A row `blocks` when the reader sees a defect that cannot be corrected in the admin tool after go-live (maintainer, 2026-09-20).',
				'',
				'Retiring kinds: `slug-alias-new`, `slug-bare-held`, `slug-changed`, `slug-frozen-stem-drift`, `slug-new`, `slug-unsafe` go away with the URL names work (`docs/specs/2026-09-21-url-names-design.md` §7), which also reopens why `headword-unparsed` blocks (§8).',
				'',
				'| Publication | Rows |',
				'|---|---|',
				'| blocks | 1 |',
				'| defer | 2 |',
				'| note | 0 |',
				'| catalogued, not yet detected | 0 rows (2 classes, 375 entries) |',
				'',
				'## Before publication (1)',
				'',
				'### headword-unparsed (1)',
				'',
				'**What to do:** Correct the headword text at source or by patch so the grammar accounts for it; the reader sees the raw string until then.',
				'',
				'- A00001: ?אִיבּוּס — grammar did not parse',
				'',
				'## Deferred (2)',
				'',
				'### markup-carry (1)',
				'',
				'**What to do:** Nothing to do: the composer closed the tag; the row records where the run crossed a unit boundary.',
				'',
				'- A00002: senses[0].gloss: carried i',
				'',
				'### page-confidence-medium (1)',
				'',
				'**What to do:** Check the placement against the print and correct it in the admin tool after go-live; no URL depends on it.',
				'',
				'- A00003: p1a (medium)',
				'',
				'## Notes (0)',
				'',
				'_none_',
				'',
				'## Catalogued, not yet detected (2 classes, 375 entries)',
				'',
				'No detector on the import path can see a class listed here, so it produces no rows above and is counted in neither `blocks` nor `defer`. Counts are the catalogue\'s own `corpusCount` in `data/patches/patterns.jsonl`, measured when the class was catalogued, not by this run. Porting what is left is consolidation spec §10, "port judgment-class detectors"; an empty list means every catalogued blocking class is now a kind above.',
				'',
				'They are `defer` for publication: none moves a URL (post-consolidation review §10, decision 2). The catalogue keeps `blocking: true` on each — that flag gates the CUTOVER, which is a separate question from what a reader can correct after go-live.',
				'',
				'**What to do:** write the detector under `admin/pipeline/migrate/detectors/` and register it; the class then leaves this list and its rows are triaged above under its own kind.',
				'',
				'- etymology-head-pseudo-sense — 342 entries — defer',
				'- verse-paren-false-sense-split — 33 entries — defer',
			].join('\n'),
		);
	});
	it('never renders a fault', () => {
		expect(renderReviewReport(sample(), SORTED)).not.toContain('A00004');
	});
	it('keeps the catalogued classes out of the blocks and defer counts', () => {
		const rendered = renderReviewReport(sample(), SORTED);
		expect(rendered).toContain('| blocks | 1 |');
		expect(rendered).toContain('## Before publication (1)');
	});
	it('says so when the catalogue has nothing undetected left', () => {
		// Scoped to the section: `## Notes (0)` emits its own `_none_`
		// into the same string, so an unscoped `toContain` would pass
		// even with the catalogued placeholder deleted.
		const rendered = renderReviewReport(sample(), []);
		const catalogued = rendered.slice(rendered.indexOf('## Catalogued'));
		expect(catalogued).toContain('(0 classes, 0 entries)');
		expect(catalogued).toContain('_none_');
	});
	it('sections a patch row, a note row, and keeps same-kind run order', () => {
		const rendered = renderReviewReport(sampleForOrdering(), SORTED);
		const beforePublication = rendered.slice(
			rendered.indexOf('## Before publication'),
			rendered.indexOf('## Deferred'),
		);
		expect(beforePublication).toContain('A00010');
		const notes = rendered.slice(
			rendered.indexOf('## Notes'),
			rendered.indexOf('## Catalogued'),
		);
		expect(notes).not.toContain('_none_');
		expect(rendered.indexOf('A00012')).toBeLessThan(rendered.indexOf('A00013'));
	});
	it('throws naming the kind when a row was minted after classifyRows', () => {
		const report = sample();
		report.rows.push(lineRow('A00005: late', 'slug-changed'));
		expect(() => renderReviewReport(report, SORTED)).toThrow('slug-changed');
	});
	it('still renders a fault row pushed after classifyRows', () => {
		const report = sample();
		report.rows.push(
			lineRow('A00006: boom', 'patch-failed', 'pipeline', 'fault'),
		);
		expect(() => renderReviewReport(report, SORTED)).not.toThrow();
	});
});
