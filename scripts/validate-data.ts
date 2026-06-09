#!/usr/bin/env bun
/**
 * `validate:data` — CI gate for the dictionary JSONL (T8).
 *
 * Parses every line of each data file and checks three things, the same
 * invariants the admin save path enforces and the browser app depends on:
 *   1. each line is valid JSON                       (silent drop at load otherwise)
 *   2. structure matches the entry schema            (`entry-schema.ts`)
 *   3. id is globally unique across all files        (`ridIndex` collision otherwise)
 *   4. HTML-bearing fields use only allowed markup    (`entry-html.ts`)
 *
 * Exits 0 when clean, 1 with a per-error report (file:line · field · detail)
 * on the first problem set found. Run locally with `bun run validate:data`;
 * CI runs it on every `data/**` PR via `ci-data.yml`.
 */

import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import process from 'node:process';
import { findEntryViolations } from './lib/entry-html.ts';
import { validateEntry } from './lib/entry-schema.ts';

const DATA_DIR: string =
	process.env['JASTROW_DATA_DIR'] ?? join(import.meta.dir, '..', 'data');
const FILES: readonly string[] = ['jastrow-part1.jsonl', 'jastrow-part2.jsonl'];

interface Problem {
	detail: string;
	file: string;
	line: number;
	path: string;
}

function validateFile(
	file: string,
	seenIds: Map<string, string>,
	problems: Problem[],
): number {
	const content = readFileSync(join(DATA_DIR, file), 'utf-8');
	const lines = content.split('\n');
	let count = 0;

	for (let i = 0; i < lines.length; i++) {
		const raw = lines[i] ?? '';
		if (raw.trim().length === 0) {
			continue;
		}
		const lineNo = i + 1;
		const push = (path: string, detail: string): void => {
			problems.push({ file, line: lineNo, path, detail });
		};

		let entry: unknown;
		try {
			entry = JSON.parse(raw);
		} catch (err) {
			push('', `invalid JSON: ${(err as Error).message}`);
			continue;
		}
		count++;

		for (const v of validateEntry(entry)) {
			push(v.path, v.detail);
		}

		const id = (entry as { id?: unknown }).id;
		if (typeof id === 'string') {
			const prior = seenIds.get(id);
			if (prior) {
				push('id', `duplicate id "${id}" (also in ${prior})`);
			} else {
				seenIds.set(id, `${file}:${lineNo}`);
			}
		}

		for (const v of findEntryViolations(entry)) {
			push(v.path, `disallowed HTML (${v.kind}: ${v.detail})`);
		}
	}
	return count;
}

function main(): void {
	const seenIds = new Map<string, string>();
	const problems: Problem[] = [];
	let total = 0;

	for (const file of FILES) {
		total += validateFile(file, seenIds, problems);
	}

	if (problems.length > 0) {
		const shown = problems.slice(0, 50);
		for (const p of shown) {
			const field = p.path ? ` · ${p.path}` : '';
			console.error(`${p.file}:${p.line}${field} — ${p.detail}`);
		}
		if (problems.length > shown.length) {
			console.error(`… and ${problems.length - shown.length} more`);
		}
		console.error(
			`\n✗ validate:data: ${problems.length} problem(s) across ${total} entries`,
		);
		process.exit(1);
	}

	console.log(
		`✓ validate:data: ${total} entries, ${seenIds.size} unique ids, no problems`,
	);
}

main();
