/**
 * Regenerates the committed fixture corpus (admin/pipeline/body/fixtures
 * jsonl files) from data/source/jastrow-dictionary.jsonl. Rid lists are
 * literal code, reviewed in the PR — the only two pasted from elsewhere
 * are `broken-sequences` (census report) and `quotes-stragglers` (design
 * session measurement). `--check` verifies the committed files still
 * match a fresh extraction; run after any source or rid-list change.
 * Design doc §7 (docs/specs/2026-07-11-entry-body-model-design.md).
 */
import { readSourceEntries } from '../source.ts';
import type { SourceEntry } from '../types.ts';

const FIXTURES_DIR = 'admin/pipeline/body/fixtures';

const CLASSES: Record<string, string[]> = {
	baseline: ['A00043', 'A00105', 'A00114'],
	'origin-splits': ['A00014', 'K00664', 'A01350', 'D01096'],
	// A01999–C00009: plain a)…b) runs (Task 8). O01078/P00480/Q01353/
	// Q01198: the italic-wrapped marker classes (Task 15, §6.0 review
	// decision 07) — full-italic `<i>a</i>)` runs of 2 (O01078) and 4
	// (P00480), Q01353's mixed run whose a-marker is a span-end `a</i>)`
	// (`<i>section, a</i>)`, lazy-merged italic; the split closes the
	// head span), and Q01198's span-start `<i>a)` (one span across
	// marker and item text; the split re-opens the item text).
	lettered: [
		'A01999',
		'A01873',
		'C00031',
		'E00378',
		'C00009',
		'O01078',
		'P00480',
		'Q01353',
		'Q01198',
	],
	// 25 rids: the design census's coarse detector (Pl. + a bare 1) within
	// ~120 chars) — only the first 5 carry a genuine paren-clear ascending
	// run and actually split; the other 20 are single spurious
	// "(citation N)" matches (task report, plural.ts header comment).
	plural: [
		'A01047',
		'B01292',
		'C00062',
		'D00194',
		'E00789',
		'F00066',
		'H01537',
		'H00587',
		'H01784',
		'I00598',
		'K00876',
		'L00489',
		'M02766',
		'M00189',
		'M00520',
		'M00596',
		'N00128',
		'N00597',
		'P00499',
		'S02271',
		'U00063',
		'U00380',
		'U00478',
		'V00080',
		'U01494',
	],
	// Non-Pl. form-section markers (B12 extension, maintainer print pass
	// 2026-07-14): Part. pass. (A02260, A03348, C00869, C00964, C01139,
	// H01022 — 6 genuine paren-clear splits; C00869/H01022 carry an inline
	// `<i>Part. pass</i>.` tag between "pass" and its period, per
	// form-sections.ts's `buildAnchorPattern` comment), Fem. (G00644 — the
	// only genuine Fem. split once D00194's run is attributed to its
	// nearer Pl., not its earlier Fem.; see form-sections.ts's header
	// comment), Denom. (I00311). D00194 is also fixtured in `plural`
	// above (its Pl. split) — carrying it here too exercises the
	// nearest-marker-attribution rule directly: this fixture's Fem. anchor
	// in D00194 must NOT produce a Fem. split.
	'form-sections': [
		'A02260',
		'A03348',
		'C00869',
		'C00964',
		'C01139',
		'H01022',
		'G00644',
		'D00194',
		'I00311',
	],
	stems: ['A00030', 'A00031', 'A00417'],
	'units-hard': [
		'A00014',
		'C00031',
		'B01162',
		'D00077',
		'D00478',
		'J00597',
		'J00603',
	],
	// 27 rids = the 29 orphan ref items (P00331 carries 3) — design doc §5
	orphans: [
		'A01069',
		'A01940',
		'B00752',
		'B00757',
		'D00791',
		'C00473',
		'C01224',
		'C01225',
		'D00541',
		'E00326',
		'C01036',
		'E00686',
		'M01200',
		'M01355',
		'M01490',
		'M01690',
		'J00083',
		'N00910',
		'P00169',
		'P00331',
		'P00600',
		'Q00890',
		'P01404',
		'Q00002',
		'S01230',
		'U02063',
		'V00042',
	],
	// data/source/body-census-report.json .brokenSequences[].rid, sorted as
	// they appear in the report (72 rids)
	'broken-sequences': [
		'A00675',
		'A00913',
		'A01350',
		'A01662',
		'A01989',
		'A03089',
		'A03104',
		'A03277',
		'B00534',
		'B00656',
		'B00991',
		'B01321',
		'C00062',
		'C00244',
		'C00328',
		'E00024',
		'C01169',
		'C01331',
		'D00470',
		'C00581',
		'H00301',
		'H01701',
		'H00709',
		'I00137',
		'I00149',
		'I00753',
		'H00871',
		'G00655',
		'J00301',
		'J00501',
		'K00081',
		'K01188',
		'L00346',
		'M00252',
		'N00327',
		'N00740',
		'O00821',
		'O01360',
		'O01397',
		'N01153',
		'N01155',
		'N01381',
		'O00120',
		'O00321',
		'P00286',
		'P00539',
		'Q00547',
		'Q00997',
		'R00096',
		'P00805',
		'P00859',
		'P00882',
		'P01088',
		'P01094',
		'P01426',
		'P01436',
		'R00519',
		'R00536',
		'Q01974',
		'Q02145',
		'Q02162',
		'S00490',
		'S01040',
		'S02265',
		'U00261',
		'U00398',
		'V00166',
		'U00764',
		'U01556',
		'U01674',
		'V00704',
		'V00765',
	],
	// The 6 sense-label quarantines (body-review 04): D00341's `[1)` and
	// the five ASCII-hyphen `-2)` labels — Task 16's label-repair pass.
	'label-quarantines': [
		'D00341',
		'M02309',
		'O00408',
		'S02030',
		'U00745',
		'U00939',
	],
	// Task 16 repair rids not already fixtured elsewhere: A01194 (missing
	// `)` after b. h.), D00072 (in-text implied 1), J00515 (confirmed
	// no-change: swallowed boundary, marker in-text), U01787 (implied 1
	// in the Af. stem children).
	'numbering-extras': ['A01194', 'D00072', 'J00515', 'U01787'],
	// measured in the design session (phrases that do not locate in their
	// own body even after abbreviation collapse)
	'quotes-stragglers': [
		'A00173',
		'A02049',
		'A03198',
		'C00860',
		'I00437',
		'K00250',
		'S00252',
		'S01101',
	],
};

/** Every rid any class asks for, deduplicated — the streaming pass over
 * the source only needs to keep entries whose rid appears here. */
function collectWantedRids(classes: Record<string, string[]>): Set<string> {
	const wanted = new Set<string>();
	for (const rids of Object.values(classes)) {
		for (const rid of rids) {
			wanted.add(rid);
		}
	}
	return wanted;
}

/** Stream the 41 MB source once, keeping only the (re-serialized) JSON
 * line for each wanted rid. Re-serializing (not slicing the raw line)
 * keeps output deterministic regardless of upstream formatting. */
async function collectSourceLines(
	wanted: Set<string>,
): Promise<Map<string, string>> {
	const lines = new Map<string, string>();
	for await (const entry of readSourceEntries()) {
		if (wanted.has(entry.rid)) {
			lines.set(entry.rid, JSON.stringify(entry));
		}
	}
	return lines;
}

/** Every `(rid, class)` pair requested but absent from the source —
 * empty means every requested rid was found. */
function findMissingRids(
	classes: Record<string, string[]>,
	lines: Map<string, string>,
): { cls: string; rid: string }[] {
	const missing: { cls: string; rid: string }[] = [];
	for (const [cls, rids] of Object.entries(classes)) {
		for (const rid of rids) {
			if (!lines.has(rid)) {
				missing.push({ cls, rid });
			}
		}
	}
	return missing;
}

/** The fixture file body for one class: each rid's re-serialized JSON,
 * one per line in rid-list order, trailing newline. Callers must have
 * already confirmed every rid is present in `lines`. */
function buildClassBody(rids: string[], lines: Map<string, string>): string {
	const body = rids.map((rid) => lines.get(rid)).join('\n');
	return `${body}\n`;
}

/** Every line of a fixture body JSON-parses and carries a `.rid` —
 * the round-trip sanity check the design doc's plan calls for. */
function verifyBody(cls: string, body: string): void {
	const lines = body.split('\n').filter((line) => line !== '');
	for (const [index, line] of lines.entries()) {
		const { rid } = JSON.parse(line) as Partial<SourceEntry>;
		if (typeof rid !== 'string' || rid === '') {
			throw new Error(`${cls}.jsonl line ${index + 1}: no .rid after parse`);
		}
	}
}

function fixturePath(cls: string): string {
	return `${FIXTURES_DIR}/${cls}.jsonl`;
}

/** Compare a freshly built body against the committed file at `path`.
 * Returns `true` when they match. */
async function bodyMatchesFile(path: string, body: string): Promise<boolean> {
	const current = await Bun.file(path)
		.text()
		.catch(() => '');
	return current === body;
}

/** Print every rid missing from the source, then throw (which exits the
 * process non-zero) — a no-op when nothing is missing. */
function reportMissingOrThrow(missing: { cls: string; rid: string }[]): void {
	if (missing.length === 0) {
		return;
	}
	for (const { cls, rid } of missing) {
		console.error(`MISSING: ${rid} (class ${cls})`);
	}
	throw new Error(`${missing.length} requested rid(s) missing from source`);
}

/** `--check` mode: verify every class file matches a fresh extraction,
 * printing `MISMATCH: <path>` for each divergence and throwing (exit
 * non-zero) if any were found. */
async function checkClasses(
	classes: Record<string, string[]>,
	lines: Map<string, string>,
): Promise<void> {
	const paths = await Promise.all(
		Object.entries(classes).map(async ([cls, rids]) => {
			const body = buildClassBody(rids, lines);
			verifyBody(cls, body);
			const path = fixturePath(cls);
			const matches = await bodyMatchesFile(path, body);
			return matches ? undefined : path;
		}),
	);
	const mismatches = paths.filter((path): path is string => path !== undefined);
	for (const path of mismatches) {
		console.error(`MISMATCH: ${path}`);
	}
	if (mismatches.length > 0) {
		throw new Error(`${mismatches.length} fixture file(s) out of date`);
	}
	console.log('all fixture files match extraction');
}

/** Default mode: (re)write every class file from a fresh extraction. */
async function writeClasses(
	classes: Record<string, string[]>,
	lines: Map<string, string>,
): Promise<void> {
	await Promise.all(
		Object.entries(classes).map(async ([cls, rids]) => {
			const body = buildClassBody(rids, lines);
			verifyBody(cls, body);
			await Bun.write(fixturePath(cls), body);
		}),
	);
	console.log('fixtures written');
}

if (import.meta.main) {
	const wanted = collectWantedRids(CLASSES);
	const lines = await collectSourceLines(wanted);
	reportMissingOrThrow(findMissingRids(CLASSES, lines));

	if (Bun.argv.includes('--check')) {
		await checkClasses(CLASSES, lines);
	} else {
		await writeClasses(CLASSES, lines);
	}
}
