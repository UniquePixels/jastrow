#!/usr/bin/env bun
/**
 * Independent checks on the built page index.
 *
 * The build is an inference, so it is checked three ways, each using evidence
 * the build did not itself rely on:
 *
 *   1. **Guide words.** Jastrow prints the page's first headword as the left
 *      running head. Where Tesseract read it, it is ground truth straight from
 *      the print — and the alignment never used it.
 *   2. **Prior columns.** The shipped app data carries hand-made `col` values
 *      for pp. 1-235. Disagreement there is a real defect in one of the two.
 *   3. **Prior pages.** The shipped `p` field covers every entry. It is a
 *      baseline rather than an authority — it is one page low throughout
 *      volume 2 — so a *distribution* of differences is the useful signal.
 *
 * Usage: bun admin/pipeline/page-index/verify.ts --index <dir> [--prior <dir>]
 */

import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import process from 'node:process';
import { normalizeHeadword, ocrSimilarity, similarity } from './hebrew.ts';

interface ColumnHead {
	column: string;
	confidence: string;
	guideOcr: string;
	headword: string;
	page: number;
	rid: string;
}

interface EntryPlacement {
	column: string;
	confidence: string;
	page: number;
	rid: string;
	volume: number;
}

interface PriorEntry {
	col: string;
	hw: string;
	id: string;
	p: number;
}

/** A guide word counts as confirming a head if it is a near match. */
const GUIDE_THRESHOLD = 0.7;

/** How many example disagreements to print per check. */
const MAX_EXAMPLES = 8;

function readJsonl<T>(path: string): T[] {
	return readFileSync(path, 'utf8')
		.split('\n')
		.filter((l) => l.trim())
		.map((l) => JSON.parse(l) as T);
}

function pct(n: number, d: number): string {
	return d === 0 ? 'n/a' : `${((n / d) * 100).toFixed(1)}%`;
}

function arg(name: string, fallback: string): string {
	const i = process.argv.indexOf(name);
	return i >= 0 && process.argv[i + 1]
		? (process.argv[i + 1] as string)
		: fallback;
}

/** Compare each column-a head against the guide word printed above it. */
function checkGuides(heads: readonly ColumnHead[]): void {
	let tested = 0;
	let strict = 0;
	let lenient = 0;
	const misses: string[] = [];
	for (const h of heads) {
		const guide = normalizeHeadword(h.guideOcr);
		if (h.column !== 'a' || guide.length < 2) {
			continue;
		}
		tested++;
		const built = normalizeHeadword(h.headword);
		const s = similarity(guide, built);
		const so = ocrSimilarity(guide, built);
		if (s >= GUIDE_THRESHOLD) {
			strict++;
		}
		if (so >= GUIDE_THRESHOLD) {
			lenient++;
		} else if (misses.length < MAX_EXAMPLES) {
			misses.push(
				`p${h.page}a built=${h.headword} guide=${h.guideOcr} ocrSim=${so.toFixed(2)}`,
			);
		}
	}
	console.log(
		'=== 1. guide words (print ground truth, unused by the build) ===',
	);
	console.log(`  column-a heads with a readable guide word : ${tested}`);
	console.log(
		`  agreeing, strict edit distance            : ${strict} (${pct(strict, tested)})`,
	);
	console.log(
		`  agreeing, allowing OCR letter confusions  : ${lenient} (${pct(lenient, tested)})`,
	);
	for (const m of misses) {
		console.log(`    miss: ${m}`);
	}
}

/** Compare placements against the hand-made columns for pp. 1-235. */
function checkPriorColumns(
	entries: readonly EntryPlacement[],
	prior: ReadonlyMap<string, PriorEntry>,
): void {
	let tested = 0;
	let agree = 0;
	const misses: string[] = [];
	for (const e of entries) {
		const p = prior.get(e.rid);
		// Most prior rows carry `?` for the column; only pp. 1-235 were done.
		if (!p || (p.col !== 'a' && p.col !== 'b')) {
			continue;
		}
		tested++;
		if (p.col === e.column && p.p === e.page) {
			agree++;
		} else if (misses.length < MAX_EXAMPLES) {
			misses.push(
				`${e.rid} ${p.hw} built=p${e.page}${e.column} prior=p${p.p}${p.col}`,
			);
		}
	}
	console.log('\n=== 2. prior hand-made columns (pp. 1-235) ===');
	console.log(`  entries with a prior column : ${tested}`);
	console.log(
		`  page+column both agree      : ${agree} (${pct(agree, tested)})`,
	);
	for (const m of misses) {
		console.log(`    miss: ${m}`);
	}
}

/** Distribution of built-minus-prior page numbers, split by volume. */
function checkPriorPages(
	entries: readonly EntryPlacement[],
	prior: ReadonlyMap<string, PriorEntry>,
): void {
	const all = new Map<number, number>();
	const byVolume = [new Map<number, number>(), new Map<number, number>()];
	let tested = 0;
	for (const e of entries) {
		const p = prior.get(e.rid);
		if (!p || typeof p.p !== 'number') {
			continue;
		}
		tested++;
		const d = e.page - p.p;
		all.set(d, (all.get(d) ?? 0) + 1);
		const v = byVolume[e.volume === 1 ? 0 : 1] as Map<number, number>;
		v.set(d, (v.get(d) ?? 0) + 1);
	}
	const exact = all.get(0) ?? 0;
	const within1 = exact + (all.get(1) ?? 0) + (all.get(-1) ?? 0);
	console.log('\n=== 3. prior page baseline (all entries) ===');
	console.log(`  entries compared : ${tested}`);
	console.log(`  same page        : ${exact} (${pct(exact, tested)})`);
	console.log(`  within +/-1 page : ${within1} (${pct(within1, tested)})`);
	for (const [i, m] of byVolume.entries()) {
		const n = [...m.values()].reduce((a, b) => a + b, 0);
		const top = [...m.entries()].sort((a, b) => b[1] - a[1]).slice(0, 4);
		console.log(
			`  vol${i + 1} (n=${n}) modal diff : ` +
				top.map(([d, c]) => `${d}:${c}`).join('  '),
		);
	}
}

function reportCoverage(heads: readonly ColumnHead[]): void {
	const conf = new Map<string, number>();
	for (const h of heads) {
		conf.set(h.confidence, (conf.get(h.confidence) ?? 0) + 1);
	}
	console.log('\n=== coverage ===');
	console.log(`  columns indexed : ${heads.length}`);
	console.log(
		`  head confidence : ${[...conf].map(([k, v]) => `${k}=${v}`).join(' ')}`,
	);
	console.log(`  distinct pages  : ${new Set(heads.map((h) => h.page)).size}`);
}

function main(): void {
	const dir = arg('--index', 'data/page-index');
	const heads = readJsonl<ColumnHead>(join(dir, 'columns.jsonl'));
	const entries = readJsonl<EntryPlacement>(join(dir, 'entries.jsonl'));
	checkGuides(heads);
	// The v1 deployed files are not on v2. Pass `--prior <dir>` holding
	// jastrow-part1.jsonl and jastrow-part2.jsonl (e.g. checked out from
	// origin/main) to run the two comparisons against them.
	const priorDir = arg('--prior', '');
	if (priorDir !== '') {
		const prior = new Map(
			[
				...readJsonl<PriorEntry>(join(priorDir, 'jastrow-part1.jsonl')),
				...readJsonl<PriorEntry>(join(priorDir, 'jastrow-part2.jsonl')),
			].map((p) => [p.id, p]),
		);
		checkPriorColumns(entries, prior);
		checkPriorPages(entries, prior);
	}
	reportCoverage(heads);
}

if (import.meta.main) {
	main();
}
