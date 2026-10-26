/**
 * The Sefaria appendix (`report/sefaria-report.ts`; decisions 10-16
 * upstream report): the reviewed patch records, read against the raw
 * source, written as the rows we send Sefaria, a summary, and the
 * review list of every patch a filter kept out.
 *
 * Its own script, not a stage of the import: it reads only committed
 * inputs (the reviewed records, `data/source/`, the page index and the
 * submission log) and none of a run's in-memory state, so it takes
 * seconds where the import takes minutes, and it can be regenerated
 * after the maintainer logs a batch without re-importing anything.
 *
 * Run: bun data:sefaria
 */
import { loadReviewedCorpus } from './patch/apply.ts';
import { readPageLookup } from './patch/locator.ts';
import { computeSnapshot } from './patch/snapshot.ts';
import {
	SEFARIA_APPENDIX_CSV,
	SEFARIA_APPENDIX_DOC,
	SEFARIA_REVIEW_CSV,
	SEFARIA_SUBMISSIONS_PATH,
	SOURCE_PATH,
} from './paths.ts';
import type { RawRecord } from './report/sefaria-change.ts';
import {
	buildSefariaAppendix,
	parseSubmissions,
} from './report/sefaria-report.ts';

/** Every raw record by rid, `_id` and all. */
async function readRaw(): Promise<Map<string, RawRecord>> {
	const records = new Map<string, RawRecord>();
	for (const line of (await Bun.file(SOURCE_PATH).text()).split('\n')) {
		if (line.trim() !== '') {
			const record = JSON.parse(line) as RawRecord;
			records.set(record.rid, record);
		}
	}
	return records;
}

/** Builds the Sefaria appendix from the reviewed patches, the source,
 * the page index and the submission log, and writes its CSV, its
 * document and the review list under `docs/reports/`. */
async function main(): Promise<void> {
	const corpus = await loadReviewedCorpus();
	const log = Bun.file(SEFARIA_SUBMISSIONS_PATH);
	if (!(await log.exists())) {
		throw new Error(
			`${SEFARIA_SUBMISSIONS_PATH} is missing: the submission log must exist (empty when no batch has been sent)`,
		);
	}
	const appendix = buildSefariaAppendix({
		pages: await readPageLookup(),
		patches: corpus.patches,
		snapshot: `sha256:${(await computeSnapshot()).combined}`,
		source: await readRaw(),
		submissions: parseSubmissions(await log.text()),
	});
	await Bun.write(SEFARIA_APPENDIX_CSV, appendix.csv);
	await Bun.write(SEFARIA_APPENDIX_DOC, appendix.doc);
	await Bun.write(SEFARIA_REVIEW_CSV, appendix.reviewCsv);
	const fresh = appendix.rows.filter((r) => r.submitted_batch === '').length;
	console.log(
		`${corpus.patches.length} reviewed patches: ${appendix.rows.length} appendix rows (${fresh} new), ${appendix.review.length} in the review list`,
	);
	console.log(
		`wrote ${SEFARIA_APPENDIX_CSV}, ${SEFARIA_APPENDIX_DOC}, ${SEFARIA_REVIEW_CSV}`,
	);
}

if (import.meta.main) {
	await main();
}
