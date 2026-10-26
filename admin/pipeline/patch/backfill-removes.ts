#!/usr/bin/env bun
/**
 * The one-off backfill of `removes` on the reviewed patch records
 * (review checklist 2026-10-25, group 2: the loss report, gate 12
 * `declaredLoss`). Kept as the record of how the field was filled, not
 * run again: it refuses a corpus where any record already carries
 * `removes`, since from then on the author of a patch writes the field
 * with the patch.
 *
 * Every source entry a reviewed patch names is composed as the import
 * composes it (`composeEntry`: the transform phases, then the reviewed
 * patches, which apply first), and each patch that applies yields what
 * it removed (`removedCodepoints`, `loss.ts`): the visible codepoints
 * of the loss pool, before minus after. A record whose patch removed
 * any gains `removes`, those codepoints in the order they stood in the
 * entry; every other record is left byte-identical. A reviewed patch
 * that does not apply is listed and gets nothing, which gate 12 never
 * sees either, since it marks applied patches only.
 *
 * The accepted and carry-over patches apply after the reviewed ones,
 * so they cannot change what a reviewed patch removed, and are not
 * loaded. Key order stays alphabetical, one compact JSON object per
 * line.
 *
 * Usage:
 *   bun admin/pipeline/patch/backfill-removes.ts           # dry: print the table
 *   bun admin/pipeline/patch/backfill-removes.ts --write   # rewrite patches.jsonl
 */
import process from 'node:process';
import { readSourceEntries } from '../body/source.ts';
import { composeEntry } from '../compose.ts';
import { REVIEWED_DIR } from '../paths.ts';
import { loadReviewedCorpus, patchesByRid, splitProvisional } from './apply.ts';

const PATCHES = `${REVIEWED_DIR}/patches.jsonl`;

/** `value` with its keys in code-unit order, as every line of the file
 * already is. */
function sortedKeys(value: Record<string, unknown>): Record<string, unknown> {
	return Object.fromEntries(
		Object.entries(value).sort(([a], [b]) => (a < b ? -1 : Number(a > b))),
	);
}

/** What each applied reviewed patch removed (`patchId → removed`), and
 * the reviewed patches that did not apply. */
async function computeLosses(): Promise<{
	removed: Map<string, string>;
	unapplied: string[];
}> {
	const { patches } = await loadReviewedCorpus();
	const { apply } = splitProvisional(patches);
	const groups = patchesByRid(apply);
	const removed = new Map<string, string>();
	for await (const source of readSourceEntries()) {
		const reviewed = groups.get(source.rid);
		if (reviewed === undefined) {
			continue;
		}
		const result = composeEntry(source, { drift: 'outcome', reviewed });
		for (const loss of result.losses) {
			removed.set(loss.patchId, loss.removed);
		}
	}
	return {
		removed,
		unapplied: patches.map((p) => p.id).filter((id) => !removed.has(id)),
	};
}

/** Computes what each reviewed patch removes, writes it as `removes`
 * on the records that remove anything (`--write`), prints the table,
 * and refuses to run on records that already carry the field. */
async function main(): Promise<void> {
	const write = process.argv.includes('--write');
	const lines = (await Bun.file(PATCHES).text()).split('\n').filter(Boolean);
	const records = lines.map(
		(line) => JSON.parse(line) as Record<string, unknown>,
	);
	if (records.some((r) => 'removes' in r)) {
		throw new Error(
			`${PATCHES} already carries removes: the backfill ran once and is not run again`,
		);
	}
	const { removed, unapplied } = await computeLosses();
	const out: string[] = [];
	console.log('| patch | rid | op | prompt_version | removes | codepoints |');
	console.log('|---|---|---|---|---|---:|');
	let codepoints = 0;
	let patched = 0;
	for (const [index, record] of records.entries()) {
		const loss = removed.get(String(record['id'])) ?? '';
		if (loss === '') {
			out.push(lines[index] ?? '');
			continue;
		}
		patched++;
		codepoints += [...loss].length;
		console.log(
			`| ${record['id']} | ${record['rid']} | ${record['op']} | ${record['prompt_version']} | \`${loss}\` | ${[...loss].length} |`,
		);
		out.push(JSON.stringify(sortedKeys({ ...record, removes: loss })));
	}
	console.log('');
	console.log(
		`${patched} of ${records.length} records remove visible characters, ${codepoints} codepoints in all`,
	);
	console.log(
		`${unapplied.length} reviewed patch(es) did not apply: ${unapplied.join(' ') || 'none'}`,
	);
	if (write) {
		await Bun.write(PATCHES, `${out.join('\n')}\n`);
		console.log(`wrote ${PATCHES}`);
	}
}

if (import.meta.main) {
	await main();
}
