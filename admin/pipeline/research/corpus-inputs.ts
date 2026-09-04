/**
 * Chunk-input construction, shared by the batch `prep` path and the
 * stratified discovery sampler (sweep tiering spec Phase 1). Both must
 * emit byte-identical inputs for the same chunk — the sweep prompt's
 * Input section is a contract, and a divergence between the two paths
 * would silently change what agents see.
 */
import { applyRepairs } from '../body/repairs.ts';
import { readSourceEntries } from '../body/source.ts';
import type { SourceEntry, SourceSense } from '../body/types.ts';
import { contentAnchor } from '../patch/schema.ts';
import type { AnomalyHint } from './anomalies.ts';
import type { Chunk } from './chunks.ts';

const SOURCE = 'data/source/jastrow-dictionary.jsonl';

/** The sweep prompt every chunk this module builds is written for.
 * It lives here, beside `ChunkInput.promptVersion`, because the two
 * paths that set that field used to hold a copy each and a bump had
 * to land in both. `prompt-version.test.ts` holds it to the version
 * line of `prompts/sweep-<this>.md`, so a bump that does not move
 * the document fails rather than mislabelling a tranche. */
const PROMPT_VERSION = 'v5';

/** One row of the precomputed per-entry sense index the sweep
 * prompt's Input section promises. */
interface SenseIndexRow {
	anchor: string;
	number: string;
	path: string;
}

/** Which composition of the pipeline the `entries` were built from.
 *
 * It is recorded rather than inferred because the two prep paths
 * disagree and the disagreement is invisible in the entries
 * themselves. `pre-patch` is source + `applyRepairs`, what the batch
 * path has always written. `healed` adds both transform phases,
 * which is the state `patch/apply.ts`'s phase manifest actually
 * applies a patch to. An agent's anchors are only valid against the
 * stage it read. */
type CorpusStage = 'healed' | 'pre-patch';

/** The JSON one sweep agent receives. */
interface ChunkInput {
	anomaly_hints: Record<string, AnomalyHint[]>;
	chunkId: string;
	corpusStage: CorpusStage;
	entries: SourceEntry[];
	pin: string;
	promptVersion: string;
	sense_index: Record<string, SenseIndexRow[]>;
	tranche: string;
}

/** Document-order sense index with dotted paths ("0", "0.1", …). */
function senseIndex(entry: SourceEntry): SenseIndexRow[] {
	const rows: SenseIndexRow[] = [];
	const walk = (senses: readonly SourceSense[], prefix: string): void => {
		for (const [i, sense] of senses.entries()) {
			const path = prefix === '' ? String(i) : `${prefix}.${i}`;
			rows.push({
				anchor: contentAnchor(sense.definition ?? ''),
				number: sense.number ?? '',
				path,
			});
			if (sense.senses !== undefined) {
				walk(sense.senses, path);
			}
		}
	};
	walk(entry.content.senses, '');
	return rows;
}

/** The full corpus in pre-patch state, keyed by rid. */
async function loadPrePatchCorpus(): Promise<Map<string, SourceEntry>> {
	const entries = new Map<string, SourceEntry>();
	for await (const entry of readSourceEntries(SOURCE)) {
		entries.set(entry.rid, applyRepairs(entry).entry);
	}
	return entries;
}

/** Assemble one chunk's input JSON. */
function buildChunkInput(args: {
	chunk: Chunk;
	corpusStage?: CorpusStage;
	entries: Map<string, SourceEntry>;
	hints: Record<string, AnomalyHint[]>;
	pin: string;
	promptVersion: string;
	tranche: string;
}): ChunkInput {
	return {
		anomaly_hints: args.hints,
		chunkId: args.chunk.id,
		// Defaulted, not required: every caller that predates the
		// residue path builds from `loadPrePatchCorpus`, so omitting it
		// keeps their output byte-identical apart from the new field.
		corpusStage: args.corpusStage ?? 'pre-patch',
		entries: args.chunk.rids.map((rid) => args.entries.get(rid) as SourceEntry),
		pin: args.pin,
		promptVersion: args.promptVersion,
		sense_index: Object.fromEntries(
			args.chunk.rids.map((rid) => [
				rid,
				senseIndex(args.entries.get(rid) as SourceEntry),
			]),
		),
		tranche: args.tranche,
	};
}

/** Write one chunk input to `<workdir>/inputs/<chunkId>.json`. */
async function writeChunkInput(
	workdir: string,
	input: ChunkInput,
): Promise<void> {
	await Bun.write(
		`${workdir}/inputs/${input.chunkId}.json`,
		JSON.stringify(input, null, '\t'),
	);
}

export type { ChunkInput, CorpusStage, SenseIndexRow };
export {
	buildChunkInput,
	loadPrePatchCorpus,
	PROMPT_VERSION,
	senseIndex,
	writeChunkInput,
};
