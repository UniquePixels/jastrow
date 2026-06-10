/**
 * AI Classification Script
 *
 * Classifies POS/gender for Jastrow dictionary entries missing `g.ps`
 * using the Claude API. Results are saved as annotations with type
 * "needs-review" for human verification.
 *
 * Prerequisites:
 *   @anthropic-ai/sdk (declared as an optionalDependency; present after a
 *   default `bun install`, skipped under --no-optional)
 *   export ANTHROPIC_API_KEY=sk-ant-...
 *
 * Usage:
 *   bun run talmud/data/admin/scripts/ai-classify.ts
 */

import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import process from 'node:process';

const DATA_DIR = join(import.meta.dir, '../..');
const ANNOTATIONS_PATH = join(import.meta.dir, '..', 'annotations.json');

// Dynamic import so Bun doesn't hard-fail at load time if the SDK is missing
let Anthropic: typeof import('@anthropic-ai/sdk').default | undefined;
try {
	const mod = await import('@anthropic-ai/sdk');
	Anthropic = mod.default;
} catch {
	console.error(
		'@anthropic-ai/sdk not found. Install with: bun add @anthropic-ai/sdk',
	);
	process.exit(1);
}

interface DictEntry {
	c?: { s?: Array<{ d?: string }> };
	g?: { ps?: string; l?: string };
	hw?: string;
	id: string;
	[key: string]: unknown;
}

interface Annotation {
	created?: string;
	note: string;
	type: string;
}

function loadJsonl(path: string): DictEntry[] {
	return readFileSync(path, 'utf-8')
		.trim()
		.split('\n')
		.map((l): DictEntry => JSON.parse(l) as DictEntry);
}

const part1 = loadJsonl(join(DATA_DIR, 'jastrow-part1.jsonl'));
const part2 = loadJsonl(join(DATA_DIR, 'jastrow-part2.jsonl'));
const allEntries: DictEntry[] = [...part1, ...part2];

// Filter to entries missing POS
const needsClassification = allEntries.filter((e) => !e.g?.ps);
console.log(
	`Found ${needsClassification.length} entries needing POS classification`,
);

// Load existing annotations for progress tracking
let annotations: Record<string, Annotation[]> = {};
try {
	annotations = JSON.parse(readFileSync(ANNOTATIONS_PATH, 'utf-8')) as Record<
		string,
		Annotation[]
	>;
} catch {
	// No existing annotations file — start fresh
}

// Skip already-annotated entries (ones that already have an AI suggestion)
const todo = needsClassification.filter((e) => {
	const anns = annotations[e.id] || [];
	return !anns.some(
		(a) => a.type === 'needs-review' && a.note.startsWith('AI suggests:'),
	);
});
console.log(
	`${todo.length} entries remaining after skipping already-annotated`,
);

if (todo.length === 0) {
	console.log('Nothing to classify. Exiting.');
	process.exit(0);
}

const client = new Anthropic();
const BATCH_SIZE = 20;

for (let i = 0; i < todo.length; i += BATCH_SIZE) {
	const batch = todo.slice(i, i + BATCH_SIZE);
	const prompt = batch
		.map((e) => {
			const def = e.c?.s?.[0]?.d || '';
			return `RID: ${e.id} | Headword: ${e.hw} | Language: ${e.g?.l || '?'} | Definition: ${def.slice(0, 200)}`;
		})
		.join('\n');

	try {
		// biome-ignore lint/performance/noAwaitInLoops: batches are sent sequentially to respect API rate limits (loop sleeps between batches)
		const response = await client.messages.create({
			model: 'claude-sonnet-4-20250514',
			// biome-ignore lint/style/useNamingConvention: Anthropic API parameter name (snake_case)
			max_tokens: 1024,
			messages: [
				{
					role: 'user',
					content: `Classify the part of speech and gender for these Talmudic dictionary entries.
POS options: n (noun), v (verb), a (adjective), av (adverb), pt (participle), ij (interjection), cj (conjunction)
Gender options: m (masculine), f (feminine), null (not applicable)
Return a JSON array: [{"rid": "...", "ps": "n|v|a|av|pt|ij|cj", "gn": "m|f|null"}]

Entries:
${prompt}`,
				},
			],
		});

		const [firstBlock] = response.content;
		const text = firstBlock?.type === 'text' ? firstBlock.text : '';
		const jsonMatch = text.match(/\[[\s\S]*?\]/u);
		if (!jsonMatch) {
			console.log(`Batch ${i}: no JSON found in response`);
			continue;
		}

		const results = JSON.parse(jsonMatch[0]);
		for (const r of results) {
			const parts = [`ps=${r.ps}`];
			if (r.gn && r.gn !== 'null') {
				parts.push(`gn=${r.gn}`);
			}
			const existing = annotations[r.rid] ?? [];
			existing.push({
				type: 'needs-review',
				note: `AI suggests: ${parts.join(', ')}`,
				created: new Date().toISOString().split('T')[0] ?? '',
			});
			annotations[r.rid] = existing;
		}

		// Save progress after each batch
		writeFileSync(ANNOTATIONS_PATH, JSON.stringify(annotations, null, 2));
		console.log(
			`Batch ${i}-${i + batch.length}: classified ${results.length} entries`,
		);
	} catch (err) {
		const message = err instanceof Error ? err.message : String(err);
		console.error(`Batch ${i} error: ${message}`);
		// Save progress so we don't lose work
		writeFileSync(ANNOTATIONS_PATH, JSON.stringify(annotations, null, 2));
	}

	// Rate limit: 1 second between batches
	await Bun.sleep(1000);
}

console.log('Classification complete.');
