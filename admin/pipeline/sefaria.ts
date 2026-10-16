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
import { loadPageIndex } from '../entry/page.ts';
import { loadReviewedCorpus } from './patch/apply.ts';
import { computeSnapshot } from './patch/snapshot.ts';
import {
	PAGE_COLUMNS_PATH,
	SEFARIA_APPENDIX_CSV,
	SEFARIA_APPENDIX_DOC,
	SEFARIA_REVIEW_CSV,
	SEFARIA_SUBMISSIONS_PATH,
	SOURCE_PATH,
} from './paths.ts';
import type { RawRecord } from './report/sefaria-change.ts';
import {
	buildSefariaAppendix,
	type PageLookup,
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

/** Each page's scan leaf, from the column records. */
async function readLeaves(): Promise<Map<string, number>> {
	const leaves = new Map<string, number>();
	for (const line of (await Bun.file(PAGE_COLUMNS_PATH).text()).split('\n')) {
		if (line.trim() !== '') {
			const row = JSON.parse(line) as {
				leaf: number;
				page: number;
				volume: number;
			};
			leaves.set(`${row.volume}:${row.page}`, row.leaf);
		}
	}
	return leaves;
}

/** The page lookup the scan column reads. Volume is not in the entry
 * rows, so it comes from the page's column record: page numbers run
 * on across the two volumes, so a page names one volume. An entry runs
 * at most to the page the next one (in page-index order) starts on. */
async function readPages(): Promise<PageLookup> {
	const leaves = await readLeaves();
	const volumeOf = new Map(
		[...leaves.keys()].map((key) => {
			const [volume = '', page = ''] = key.split(':');
			return [Number(page), Number(volume)];
		}),
	);
	const entries = new Map<
		string,
		{ column: string; lastPage: number; page: number; volume: number }
	>();
	const inOrder = [...(await loadPageIndex())];
	for (const [i, [rid, placement]] of inOrder.entries()) {
		const volume = volumeOf.get(placement.number);
		const next = inOrder[i + 1]?.[1].number ?? placement.number;
		if (volume !== undefined) {
			entries.set(rid, {
				column: placement.column,
				lastPage: Math.max(next, placement.number),
				page: placement.number,
				volume,
			});
		}
	}
	return { entries, leaves };
}

async function main(): Promise<void> {
	const corpus = await loadReviewedCorpus();
	const log = Bun.file(SEFARIA_SUBMISSIONS_PATH);
	const appendix = buildSefariaAppendix({
		pages: await readPages(),
		patches: corpus.patches,
		snapshot: `sha256:${(await computeSnapshot()).combined}`,
		source: await readRaw(),
		submissions: parseSubmissions((await log.exists()) ? await log.text() : ''),
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
