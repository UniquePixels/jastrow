/**
 * One-shot seeder for `data/patches/reviewed/` (consolidation spec
 * §4.2, step 8 Task 4). It turns the rid-keyed repair tables in
 * `body/repairs.ts` into human-authored patches that apply AFTER every
 * transform rule, and proves each rid reproduces today's output.
 *
 *     bun admin/pipeline/patch/seed-reviewed.ts
 *
 * Deliberately not a `package.json` script: it runs once. The seeder
 * refuses if `data/patches/reviewed/patches.jsonl` exists.
 *
 * For every rid in `REPAIR_RIDS` it builds two states of the entry:
 * `base`, the transforms over the source with only the corpus-wide
 * binyan cleanup (what the pipeline yields once the tables are gone),
 * and `want`, the transforms over `applyRepairs(source)` (what it
 * yields today). `patchesFor` diffs the two into ordinary patches and
 * throws unless applying them to `base` deep-equals `want`, so a rid
 * whose repair does not survive the move fails the run instead of
 * shipping a near miss. The written files are then loaded back through
 * `loadReviewedCorpus` and re-applied, so what is on disk is what was
 * proven.
 *
 * Every patch is authored against the state the previous one left:
 * its target, `expected_before`, `expected_occurrences` and
 * `occurrence_index` are read off that state, never assumed (two
 * senses can share a number token and a definition).
 */
import { existsSync } from 'node:fs';
import { mkdir, unlink } from 'node:fs/promises';
import {
	applyRepairs,
	CHOPPED,
	CITE_WRAPS,
	cleanBinyanForms,
	DASH_LABELS,
	DEFERRED,
	IMPLIED_ONE,
	IMPLIED_ONE_TEXT,
	REFS_REMOVALS,
	REINSERTS,
	REPAIR_RIDS,
} from '../body/repairs.ts';
import { readSourceEntries } from '../body/source.ts';
import type { SourceEntry, SourceSense } from '../body/types.ts';
import { applyTransforms } from '../transform/run.ts';
import { loadCorpus, loadReviewedCorpus, REVIEWED_DIR } from './apply.ts';
import type { EntryResult } from './manifest.ts';
import {
	applyPatch,
	contentAnchor,
	type PatchOp,
	parsePatch,
	parseTarget,
	resolveTarget,
	type SemanticPatch,
	senseTarget,
	validateCorpus,
	walkSenses,
} from './schema.ts';

const SNAPSHOT_LOCK = 'data/patches/snapshot.lock';
const PROMPT_VERSION = 'human-review-2026-08-05';

/** One patch to mint: its op, address, current text and payload, and
 * where its target sits among the places that address resolves to. */
interface Emit {
	before: string;
	counts: { index: number; total: number };
	op: PatchOp;
	payload: object;
	target: string;
}

interface SeedOptions {
	/** The phantom sense's number token, for a `CHOPPED` rid. */
	chopToken?: string | undefined;
	/** Numeric part of the first patch id to mint. */
	firstId: number;
	/** The `snapshot.lock` hash every patch pins. */
	pin: string;
	rationale: string;
}

/** A sense's definition, empty when absent. */
function text(sense: SourceSense): string {
	return sense.definition ?? '';
}

/** Every sense of `entry` in document order, with its depth. */
function flatSenses(
	entry: SourceEntry,
): { depth: number; sense: SourceSense }[] {
	const out: { depth: number; sense: SourceSense }[] = [];
	const walk = (list: SourceSense[], depth: number): void => {
		for (const sense of list) {
			out.push({ depth, sense });
			if (sense.senses !== undefined) {
				walk(sense.senses, depth + 1);
			}
		}
	};
	walk(entry.content.senses, 0);
	return out;
}

/** Pair the senses of `a` and `b` in document order. Throws if the two
 * trees differ in shape (count, or parent/child layout — the depth
 * sequence of a pre-order walk fixes both). Re-walks on every call, so
 * a later call sees what earlier patches changed. */
function zipSenses(
	a: SourceEntry,
	b: SourceEntry,
): [SourceSense, SourceSense][] {
	const left = flatSenses(a);
	const right = flatSenses(b);
	const shape = (list: { depth: number }[]): string =>
		list.map((s) => s.depth).join(',');
	if (shape(left) !== shape(right)) {
		throw new Error(`${a.rid}: sense trees differ in shape`);
	}
	return left.map((l, i) => [
		l.sense,
		(right[i] as { sense: SourceSense }).sense,
	]);
}

/** True when `at` falls between the two halves of a surrogate pair —
 * a cut there would put a lone surrogate in a patch. */
function splitsPair(s: string, at: number): boolean {
	const code = s.charCodeAt(at);
	return at > 0 && at < s.length && code >= 0xdc00 && code <= 0xdfff;
}

/** The smallest `find`/`replace` pair that turns `before` into `after`
 * with `find` occurring exactly once in `before`: strip the common
 * prefix and suffix, then widen both sides by one character at a time
 * (the context is shared, so both strings widen alike) until `find` is
 * non-empty and unique. Never cuts a surrogate pair. */
function minimalUniqueSpan(
	before: string,
	after: string,
): { find: string; replace: string } {
	let head = 0;
	const limit = Math.min(before.length, after.length);
	while (head < limit && before[head] === after[head]) {
		head += 1;
	}
	let tail = 0;
	while (
		tail < limit - head &&
		before[before.length - 1 - tail] === after[after.length - 1 - tail]
	) {
		tail += 1;
	}
	const span = (): { find: string; replace: string } => ({
		find: before.slice(head, before.length - tail),
		replace: after.slice(head, after.length - tail),
	});
	const settle = (): void => {
		while (splitsPair(before, head) || splitsPair(after, head)) {
			head -= 1;
		}
		while (
			splitsPair(before, before.length - tail) ||
			splitsPair(after, after.length - tail)
		) {
			tail -= 1;
		}
	};
	settle();
	let { find } = span();
	while (
		(find === '' || before.split(find).length - 1 !== 1) &&
		(head > 0 || tail > 0)
	) {
		head = Math.max(0, head - 1);
		tail = Math.max(0, tail - 1);
		settle();
		({ find } = span());
	}
	return span();
}

/** Deep equality, key order ignored (a retag appends `number`; the
 * repair it replaces may have set it in place). */
function sameEntry(a: SourceEntry, b: SourceEntry): boolean {
	return Bun.deepEquals(a, b, true);
}

/** The patches that turn `base` into `want`, in apply order: unref for
 * each refs item `want` lacks, a join for the chopped sense, a retag
 * for each sense whose number differs, then one replace per sense whose
 * definition still differs. Each patch is built against the state the
 * previous one left, so every target, expected_before and occurrence
 * count is exact. Throws unless the patches reproduce `want`. */
function patchesFor(
	base: SourceEntry,
	want: SourceEntry,
	o: SeedOptions,
): SemanticPatch[] {
	const out: SemanticPatch[] = [];
	let state = structuredClone(base);
	const emit = ({ before, counts, op, payload, target }: Emit): void => {
		const patch = parsePatch({
			confidence: 'high',
			defect_class: `reviewed-${op}`,
			expected_before: before,
			expected_occurrences: counts.total,
			id: `P${String(o.firstId + out.length).padStart(6, '0')}`,
			occurrence_index: counts.index,
			op,
			payload,
			prompt_version: PROMPT_VERSION,
			rationale: o.rationale,
			rid: base.rid,
			snapshot: o.pin,
			target,
		});
		state = applyPatch(state, patch);
		out.push(patch);
	};
	/** Where the `walkIndex`-th sense of `state` sits among the senses
	 * its own target resolves to. */
	const senseCounts = (walkIndex: number): { index: number; total: number } => {
		const walked = [...walkSenses(state)];
		const sense = walked[walkIndex]?.sense;
		if (sense === undefined) {
			throw new Error(`${base.rid}: no sense at walk index ${walkIndex}`);
		}
		const matches = resolveTarget(state, parseTarget(senseTarget(sense)));
		return {
			index: matches.findIndex((m) => m.sense === sense) + 1,
			total: matches.length,
		};
	};
	const wanted = want.refs ?? [];
	for (const item of new Set(base.refs ?? [])) {
		if (wanted.includes(item)) {
			continue;
		}
		while ((state.refs ?? []).includes(item)) {
			const total = (state.refs ?? []).filter((r) => r === item).length;
			emit({
				before: item,
				counts: { index: 1, total },
				op: 'unref',
				payload: {},
				target: `refs[${item}]:${contentAnchor(item)}`,
			});
		}
	}
	if (o.chopToken !== undefined) {
		const walked = [...walkSenses(state)];
		const at = walked.findIndex((p) => p.sense.number === o.chopToken);
		const phantom = walked[at]?.sense;
		if (phantom === undefined) {
			throw new Error(`${base.rid}: no phantom ${o.chopToken}`);
		}
		emit({
			before: text(phantom),
			counts: senseCounts(at),
			op: 'join',
			payload: {},
			target: senseTarget(phantom),
		});
	}
	const count = zipSenses(state, want).length;
	for (let i = 0; i < count; i += 1) {
		const [got, target] = zipSenses(state, want)[i] as [
			SourceSense,
			SourceSense,
		];
		if ((got.number ?? '') !== (target.number ?? '')) {
			if (target.number === undefined) {
				throw new Error(`${base.rid}: want drops a number; retag cannot`);
			}
			emit({
				before: text(got),
				counts: senseCounts(i),
				op: 'retag',
				payload: { number: target.number },
				target: senseTarget(got),
			});
		}
	}
	for (let i = 0; i < count; i += 1) {
		const [got, target] = zipSenses(state, want)[i] as [
			SourceSense,
			SourceSense,
		];
		const before = text(got);
		const after = text(target);
		if (before !== after) {
			if (before === '') {
				throw new Error(`${base.rid}: empty definition; replace has no find`);
			}
			const { find, replace } = minimalUniqueSpan(before, after);
			emit({
				before,
				counts: senseCounts(i),
				op: 'replace',
				payload: { find, replace },
				target: senseTarget(got),
			});
		}
	}
	if (!sameEntry(state, want)) {
		throw new Error(
			`${base.rid}: seeded patches do not reproduce the repaired entry`,
		);
	}
	return out;
}

/** Why each rid is repaired, by the table that repairs it: the review
 * doc, the table name, and the table comment's one-line reason. */
function rationales(): Map<string, string> {
	const map = new Map<string, string>();
	const add = (
		rids: Iterable<string>,
		...[doc, table, why]: [string, string, string]
	): void => {
		for (const rid of rids) {
			if (map.has(rid)) {
				throw new Error(`${rid}: named by two repair tables`);
			}
			map.set(rid, `review doc ${doc} (repairs.ts ${table}): ${why}`);
		}
	};
	add(
		Object.keys(CHOPPED),
		'01',
		'CHOPPED',
		'upstream segmentation chopped a parenthesized cross-reference or citation at its own N), minting a phantom sense; rejoined into the preceding flow',
	);
	add(
		Object.keys(IMPLIED_ONE),
		'01',
		'IMPLIED_ONE',
		'print omits 1) when sense 1 is only a cross-reference after the grammatical label; the implied 1) is inserted as a recorded deviation (register #16)',
	);
	add(
		IMPLIED_ONE_TEXT.map((e) => e.rid),
		'01',
		'IMPLIED_ONE_TEXT',
		'the implied 1) sits in-text before the entry’s —2) run; inserted as a recorded deviation (register #16)',
	);
	add(
		REINSERTS.map((e) => e.rid),
		'01',
		'REINSERTS',
		'print has the sense marker the source snapshot lost; reinserted (damage repair, not a deviation)',
	);
	add(
		DASH_LABELS,
		'04',
		'DASH_LABELS',
		'the -2) label’s ASCII hyphen is a data error for the em dash —2)',
	);
	add(
		['D00341'],
		'04',
		'repairLabels',
		'[1) becomes 1) with the bracket moved into the sense text (maintainer decision, recorded deviation)',
	);
	add(
		CITE_WRAPS.map((e) => e.rid),
		'02',
		'CITE_WRAPS',
		'the bare ibid citation is wrapped in a refLink anchor carrying the orphan refs value',
	);
	add(
		Object.keys(REFS_REMOVALS),
		'02',
		'REFS_REMOVALS',
		'baseless refs item judged user-added via Sefaria’s interface; removed so only what Jastrow linked shows',
	);
	return map;
}

/** Both transform phases, in the migrate composer's order. */
function transformed(entry: SourceEntry): SourceEntry {
	return applyTransforms(
		applyTransforms(entry, 'text-repairs').entry,
		'structural-repairs',
	).entry;
}

/** A deep copy with only the corpus-wide binyan cleanup applied — what
 * the source becomes once the rid-keyed tables are gone. */
function binyanOnly(source: SourceEntry): SourceEntry {
	const entry = structuredClone(source);
	cleanBinyanForms(entry, []);
	return entry;
}

async function main(): Promise<void> {
	const patchesPath = `${REVIEWED_DIR}/patches.jsonl`;
	const manifestPath = `${REVIEWED_DIR}/manifest.jsonl`;
	if (existsSync(patchesPath)) {
		throw new Error(`${patchesPath} exists; the seeder runs once`);
	}
	const pin = (await Bun.file(SNAPSHOT_LOCK).text()).split('\n')[0] ?? '';
	const ids = (await loadCorpus()).map((p) => Number(p.id.slice(1)));
	let next = Math.max(0, ...ids) + 1;
	const reasons = rationales();
	const wanted = new Set(REPAIR_RIDS);
	const pairs = new Map<string, { base: SourceEntry; want: SourceEntry }>();
	for await (const source of readSourceEntries()) {
		if (wanted.has(source.rid)) {
			pairs.set(source.rid, {
				base: transformed(binyanOnly(source)),
				want: transformed(applyRepairs(source).entry),
			});
		}
	}
	const missing = REPAIR_RIDS.filter((rid) => !pairs.has(rid));
	if (missing.length > 0) {
		throw new Error(`rids not in source: ${missing.join(', ')}`);
	}
	const patches: SemanticPatch[] = [];
	const records: EntryResult[] = [];
	for (const rid of REPAIR_RIDS) {
		const { base, want } = pairs.get(rid) as {
			base: SourceEntry;
			want: SourceEntry;
		};
		const made = patchesFor(base, want, {
			chopToken: CHOPPED[rid],
			firstId: next,
			pin,
			rationale: reasons.get(rid) ?? '',
		});
		next += made.length;
		patches.push(...made);
		if (made.length > 0) {
			records.push({
				disposition: 'repaired',
				patches: made.map((p) => p.id),
				rid,
			});
		}
	}
	for (const [rid, escalation] of Object.entries(DEFERRED)) {
		records.push({
			disposition: 'needs_human_judgment',
			escalation,
			patches: [],
			rid,
		});
	}
	records.sort((a, b) => (a.rid < b.rid ? -1 : 1));
	const problems = validateCorpus(patches);
	if (problems.length > 0) {
		throw new Error(
			`seed aborted: ${problems.map((p) => p.reason).join('; ')}`,
		);
	}
	await mkdir(REVIEWED_DIR, { recursive: true });
	try {
		await Bun.write(
			patchesPath,
			patches.map((p) => `${JSON.stringify(p)}\n`).join(''),
		);
		await Bun.write(
			manifestPath,
			records.map((r) => `${JSON.stringify(r)}\n`).join(''),
		);
		// The files on disk, not the objects in memory, are what ships:
		// load them back the way `patch-apply` will and prove them again.
		const loaded = await loadReviewedCorpus();
		if (
			loaded.patches.length !== patches.length ||
			loaded.deferred.length !== 3
		) {
			throw new Error('reloaded corpus does not match what was written');
		}
		for (const [rid, { base, want }] of pairs) {
			const out = loaded.patches
				.filter((p) => p.rid === rid)
				.reduce((e, p) => applyPatch(e, p), base);
			if (!sameEntry(out, want)) {
				throw new Error(
					`${rid}: reloaded patches do not reproduce the repaired entry`,
				);
			}
		}
	} catch (error) {
		for (const path of [patchesPath, manifestPath]) {
			if (existsSync(path)) {
				await unlink(path);
			}
		}
		throw new Error('seed failed; wrote nothing', { cause: error });
	}
	const repaired = records.filter((r) => r.disposition === 'repaired').length;
	console.log(
		`wrote ${patches.length} patches for ${repaired} rids; deferred=${Object.keys(DEFERRED).length}`,
	);
}

if (import.meta.main) {
	await main();
}

export { minimalUniqueSpan, patchesFor, zipSenses };
