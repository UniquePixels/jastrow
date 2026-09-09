#!/usr/bin/env bun
/**
 * Token accounting for a sweep run, read from Claude Code's own local
 * transcripts (research-process plan Task 8; `data/patches/RUNBOOK.md`
 * step 1, the usage gate).
 *
 * ## Why this exists
 *
 * The RUNBOOK's spend gate needs a number, and the maintainer may not
 * be at the machine when a dispatch finishes. Claude Code writes exact
 * per-message usage to `~/.claude/projects/<slug>/<session>.jsonl`, so
 * a run can be measured afterwards from disk instead of from a
 * dashboard read live.
 *
 * Same source the statusline uses: `ccstatusline` globs
 * `projects/ ** / *.jsonl` and sums the same four fields. This script
 * differs from it in one deliberate way, below.
 *
 * ## Subagent tokens are INCLUDED here, and the statusline excludes
 * ## them from its window figure
 *
 * A sweep is dispatched as one agent per chunk, and those arrive as
 * records with `isSidechain: true`. `ccstatusline`'s block-window
 * calculation skips them (`if (json.isSidechain === true) continue`),
 * so **the percentage on the statusline can understate what a sweep
 * actually consumed**. That is the whole reason this script reports
 * `main` and `subagent` as separate rows rather than one total: the
 * difference between them is exactly what the statusline is not
 * showing.
 *
 * What the transcripts cannot tell you is money. They carry tokens,
 * not billing. Do not multiply these by a rate and present the result
 * as spend — report tokens, and let the usage page report cost.
 *
 * Run (`bun usage` is the package script for this file):
 *   bun usage --mark .usage-mark             # before dispatch
 *   bun usage --since @.usage-mark           # after it
 *   bun usage --since 2026-09-03T21:00:00Z
 *   bun usage --since @mark --project jastrow
 */
import { homedir } from 'node:os';
import process from 'node:process';

/** Where Claude Code keeps per-session transcripts. */
const PROJECTS = `${homedir()}/.claude/projects`;

/** The four token fields every usage record carries. Named rather
 * than summed into one number because they are billed differently and
 * a cache read is not a fresh input token. */
interface Tokens {
	cacheCreation: number;
	cacheRead: number;
	input: number;
	output: number;
}

/** One row of the report: a model, and whether the tokens were spent
 * by the main session or by a subagent it dispatched. */
interface Row extends Tokens {
	messages: number;
	model: string;
	origin: 'main' | 'subagent';
}

function emptyTokens(): Tokens {
	return { cacheCreation: 0, cacheRead: 0, input: 0, output: 0 };
}

/** Sum of everything charged as input. Cache reads are counted here
 * because they are input the model saw, and separated in the table
 * because they are not priced like a fresh one. */
function totalIn(t: Tokens): number {
	return t.input + t.cacheCreation + t.cacheRead;
}

/** Resolve `--since`: an ISO instant, or `@path` to read one from a
 * file written by `--mark`. */
async function resolveSince(raw: string | undefined): Promise<number> {
	if (raw === undefined) {
		return 0;
	}
	const text = raw.startsWith('@')
		? (await Bun.file(raw.slice(1)).text()).trim()
		: raw;
	const at = Date.parse(text);
	if (Number.isNaN(at)) {
		throw new TypeError(
			`--since wants an ISO instant or @file containing one, got '${text}'`,
		);
	}
	return at;
}

/** Every transcript under `PROJECTS`, optionally narrowed to project
 * slugs containing `filter`. The slug is the project path with its
 * separators replaced, so a substring of the repo name matches it.
 *
 * **RECURSIVE, and that is the whole tool.** A subagent does not
 * append to its parent's session file — it gets its own transcript at
 * `<project>/<session>/subagents/agent-<id>.jsonl`. A one-level
 * glob (star slash star dot jsonl — not written literally, it would
 * close this comment) finds only the parent sessions and silently
 * reports zero subagent usage, which is exactly the number this
 * script exists to produce. Measured on this machine while writing it: 32
 * files at one level, **91 recursively, and the 59 extra hold 6,514
 * usage records, every one of them `isSidechain`.** */
async function transcripts(filter: string | undefined): Promise<string[]> {
	const glob = new Bun.Glob('**/*.jsonl');
	const out: string[] = [];
	for await (const hit of glob.scan({ cwd: PROJECTS })) {
		if (filter === undefined || hit.includes(filter)) {
			out.push(`${PROJECTS}/${hit}`);
		}
	}
	return out.sort((a, b) => a.localeCompare(b));
}

/** A usage field read straight off an untyped transcript record. Only
 * `input_tokens` is validated before this point (it gates whether the
 * record is read at all); the other three fields are cast, not
 * checked, so a malformed one must not reach `+=` — string
 * concatenation or `NaN` would corrupt the RUNBOOK's spend gate. */
function numeric(v: unknown): number {
	return typeof v === 'number' && Number.isFinite(v) ? v : 0;
}

/** Accumulate usage from one transcript into `rows`, keyed by model
 * and origin. Lines that do not parse are skipped rather than fatal:
 * a transcript being appended to while this runs can end mid-line. */
function readTranscript(
	text: string,
	since: number,
	rows: Map<string, Row>,
): void {
	for (const line of text.split('\n')) {
		if (line === '') {
			continue;
		}
		// Cheap substring guard BEFORE the parse. A transcript line can
		// be a megabyte of tool output, and only assistant messages
		// carry usage — on this machine's largest project that is a few
		// thousand lines out of hundreds of thousands. Parsing every
		// line first turned an 83MB read into minutes.
		if (!line.includes('"input_tokens"')) {
			continue;
		}
		let record: Record<string, unknown>;
		try {
			record = JSON.parse(line) as Record<string, unknown>;
		} catch {
			continue;
		}
		const message = record['message'] as
			| { model?: string; usage?: Record<string, number> }
			| undefined;
		const usage = message?.usage;
		if (usage === undefined || typeof usage['input_tokens'] !== 'number') {
			continue;
		}
		const stamp = record['timestamp'];
		if (typeof stamp !== 'string') {
			continue;
		}
		// Parse once and reject NaN explicitly. `NaN < since` is FALSE,
		// so a malformed timestamp would otherwise fall through the
		// window test and be counted — a record that cannot be placed
		// in time must not be attributed to this run.
		const at = Date.parse(stamp);
		if (Number.isNaN(at) || at < since) {
			continue;
		}
		const origin: Row['origin'] =
			record['isSidechain'] === true ? 'subagent' : 'main';
		const model = message?.model ?? 'unknown';
		const key = `${origin}|${model}`;
		const row = rows.get(key) ?? {
			...emptyTokens(),
			messages: 0,
			model,
			origin,
		};
		row.messages += 1;
		row.input += numeric(usage['input_tokens']);
		row.output += numeric(usage['output_tokens']);
		row.cacheCreation += numeric(usage['cache_creation_input_tokens']);
		row.cacheRead += numeric(usage['cache_read_input_tokens']);
		rows.set(key, row);
	}
}

/** Every usage record at or after `since`, grouped by model and
 * origin. */
async function collect(
	since: number,
	filter: string | undefined,
): Promise<Row[]> {
	const rows = new Map<string, Row>();
	for (const path of await transcripts(filter)) {
		readTranscript(await Bun.file(path).text(), since, rows);
	}
	return [...rows.values()].sort(
		(a, b) => totalIn(b) + b.output - (totalIn(a) + a.output),
	);
}

const n = (v: number): string => v.toLocaleString('en-US');

function render(rows: readonly Row[], since: number): string {
	if (rows.length === 0) {
		return 'no usage records in that window';
	}
	const lines = [
		`since ${new Date(since).toISOString()}`,
		'',
		`${'origin'.padEnd(9)}${'model'.padEnd(22)}${'msgs'.padStart(6)}${'input'.padStart(12)}${'cache-w'.padStart(13)}${'cache-r'.padStart(13)}${'output'.padStart(12)}`,
	];
	const sum = { ...emptyTokens(), messages: 0 };
	for (const r of rows) {
		lines.push(
			`${r.origin.padEnd(9)}${r.model.padEnd(22)}${String(r.messages).padStart(6)}${n(r.input).padStart(12)}${n(r.cacheCreation).padStart(13)}${n(r.cacheRead).padStart(13)}${n(r.output).padStart(12)}`,
		);
		sum.messages += r.messages;
		sum.input += r.input;
		sum.output += r.output;
		sum.cacheCreation += r.cacheCreation;
		sum.cacheRead += r.cacheRead;
	}
	lines.push(
		'',
		`total in  ${n(totalIn(sum))}  (fresh ${n(sum.input)} + cache-write ${n(sum.cacheCreation)} + cache-read ${n(sum.cacheRead)})`,
		`total out ${n(sum.output)}   over ${n(sum.messages)} message(s)`,
	);
	const sub = rows.filter((r) => r.origin === 'subagent');
	if (sub.length > 0) {
		const subIn = sub.reduce((acc, r) => acc + totalIn(r), 0);
		const subOut = sub.reduce((acc, r) => acc + r.output, 0);
		lines.push(
			'',
			`of which SUBAGENT: ${n(subIn)} in, ${n(subOut)} out — the statusline's`,
			'window percentage EXCLUDES these, so it understates a sweep by this much.',
		);
	}
	return lines.join('\n');
}

/** Read one flag's value from `argv`.
 *
 * A flag that is PRESENT but has no value throws rather than reading
 * as absent. That distinction matters here more than usual: absent
 * `--since` means "report everything", so `bun usage --since` with a
 * forgotten argument would silently answer a different question than
 * the one asked — every token ever recorded, presented as a window.
 * On a spend gate that is the wrong direction to fail in. */
function flagIn(argv: readonly string[], name: string): string | undefined {
	const at = argv.indexOf(`--${name}`);
	if (at === -1) {
		return;
	}
	const value = argv[at + 1];
	if (value === undefined || value.startsWith('--')) {
		throw new Error(`--${name} needs a value`);
	}
	return value;
}

/** `flagIn` over this process's arguments. */
function flag(name: string): string | undefined {
	return flagIn(process.argv, name);
}

if (import.meta.main) {
	const mark = flag('mark');
	if (mark === undefined) {
		const since = await resolveSince(flag('since'));
		console.log(render(await collect(since, flag('project')), since));
	} else {
		const now = new Date().toISOString();
		await Bun.write(mark, `${now}\n`);
		console.log(`marked ${now} -> ${mark}`);
	}
}

export type { Row, Tokens };
export { collect, flagIn, readTranscript, render, resolveSince, totalIn };
