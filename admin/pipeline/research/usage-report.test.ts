import { describe, expect, it } from 'bun:test';
import {
	flagIn,
	type Row,
	readTranscript,
	render,
	resolveSince,
	totalIn,
} from './usage-report.ts';

/** One transcript line in Claude Code's shape. */
function line(args: {
	cacheCreation?: number;
	cacheRead?: number;
	input: number;
	model?: string;
	output: number;
	sidechain?: boolean;
	timestamp: string;
}): string {
	return JSON.stringify({
		isSidechain: args.sidechain ?? false,
		message: {
			model: args.model ?? 'claude-opus-5',
			usage: {
				cache_creation_input_tokens: args.cacheCreation ?? 0,
				cache_read_input_tokens: args.cacheRead ?? 0,
				input_tokens: args.input,
				output_tokens: args.output,
			},
		},
		timestamp: args.timestamp,
		type: 'assistant',
	});
}

function read(text: string, since = 0): Map<string, Row> {
	const rows = new Map<string, Row>();
	readTranscript(text, since, rows);
	return rows;
}

describe('readTranscript', () => {
	// The whole point of the script: a sweep's tokens arrive as
	// sidechain records, and the statusline's window figure drops
	// them. If these two collapsed into one row, the report would
	// hide exactly what it was written to surface.
	it('splits subagent tokens from the main session', () => {
		const rows = read(
			[
				line({ input: 100, output: 10, timestamp: '2026-09-03T12:00:00Z' }),
				line({
					input: 900,
					output: 90,
					sidechain: true,
					timestamp: '2026-09-03T12:01:00Z',
				}),
			].join('\n'),
		);
		expect(rows.get('main|claude-opus-5')?.input).toBe(100);
		expect(rows.get('subagent|claude-opus-5')?.input).toBe(900);
		expect(rows.size).toBe(2);
	});

	it('keys by model as well, so a mixed-tier run separates', () => {
		const rows = read(
			[
				line({ input: 1, output: 1, timestamp: '2026-09-03T12:00:00Z' }),
				line({
					input: 2,
					model: 'claude-sonnet-5',
					output: 2,
					timestamp: '2026-09-03T12:00:01Z',
				}),
			].join('\n'),
		);
		expect([...rows.keys()].sort()).toEqual([
			'main|claude-opus-5',
			'main|claude-sonnet-5',
		]);
	});

	it('sums all four token fields', () => {
		const rows = read(
			line({
				cacheCreation: 30,
				cacheRead: 400,
				input: 1,
				output: 2,
				timestamp: '2026-09-03T12:00:00Z',
			}),
		);
		const row = rows.get('main|claude-opus-5') as Row;
		expect(row.input).toBe(1);
		expect(row.output).toBe(2);
		expect(row.cacheCreation).toBe(30);
		expect(row.cacheRead).toBe(400);
		expect(totalIn(row)).toBe(431);
	});

	it('excludes records before the window', () => {
		const rows = read(
			[
				line({ input: 5, output: 5, timestamp: '2026-09-03T11:59:59Z' }),
				line({ input: 7, output: 7, timestamp: '2026-09-03T12:00:00Z' }),
			].join('\n'),
			Date.parse('2026-09-03T12:00:00Z'),
		);
		expect(rows.get('main|claude-opus-5')?.input).toBe(7);
	});

	// `NaN < since` is false, so an unparseable timestamp would fall
	// through the window test and be counted against this run.
	it('skips a usage record whose timestamp cannot be placed in time', () => {
		const rows = read(
			[
				line({ input: 5, output: 5, timestamp: 'not-a-date' }),
				line({ input: 7, output: 7, timestamp: '2026-09-03T12:00:00Z' }),
			].join('\n'),
			Date.parse('2026-09-03T00:00:00Z'),
		);
		expect(rows.get('main|claude-opus-5')?.input).toBe(7);
		expect(rows.get('main|claude-opus-5')?.messages).toBe(1);
	});

	it('skips lines with no usage, and unparseable ones', () => {
		const rows = read(
			[
				'{not json',
				JSON.stringify({ timestamp: '2026-09-03T12:00:00Z', type: 'user' }),
				'',
				line({ input: 3, output: 3, timestamp: '2026-09-03T12:00:00Z' }),
			].join('\n'),
		);
		expect(rows.size).toBe(1);
		expect(rows.get('main|claude-opus-5')?.messages).toBe(1);
	});

	// CodeRabbit PR #71 comment 3951117344: `1e400` is valid JSON that
	// `JSON.parse` overflows to `Infinity` — a `number`, so `numeric`'s
	// old `typeof v === 'number'` check let it through and poisoned the
	// row's running total. Built by hand rather than through `line()`,
	// which round-trips a JS number through `JSON.stringify` first and
	// would already collapse `Infinity` to `null` before it reached
	// `numeric`.
	it('treats a non-finite token count as zero', () => {
		const raw = JSON.stringify({
			isSidechain: false,
			message: {
				model: 'claude-opus-5',
				usage: {
					cache_creation_input_tokens: 0,
					cache_read_input_tokens: 0,
					input_tokens: 3,
					output_tokens: 0,
				},
			},
			timestamp: '2026-09-03T12:00:00Z',
			type: 'assistant',
		}).replace('"input_tokens":3', '"input_tokens":1e400');
		const rows = read(raw);
		expect(rows.get('main|claude-opus-5')?.input).toBe(0);
	});
});

describe('resolveSince', () => {
	it('takes an ISO instant', async () => {
		expect(await resolveSince('2026-09-03T12:00:00Z')).toBe(
			Date.parse('2026-09-03T12:00:00Z'),
		);
	});

	it('defaults to everything when absent', async () => {
		expect(await resolveSince(undefined)).toBe(0);
	});

	it('refuses a value it cannot parse rather than reporting the world', async () => {
		await expect(resolveSince('yesterday')).rejects.toThrow(/ISO instant/u);
	});
});

describe('flagIn', () => {
	it('reads a value that follows the flag', () => {
		expect(flagIn(['--since', '2026-09-03T12:00:00Z'], 'since')).toBe(
			'2026-09-03T12:00:00Z',
		);
	});

	it('is undefined when the flag is absent', () => {
		expect(flagIn(['--project', 'jastrow'], 'since')).toBeUndefined();
	});

	// Absent `--since` means "report everything", so a flag typed
	// without its value must not read as absent — that would answer a
	// different question than the one asked, on a spend gate.
	it('THROWS when the flag is present with no value', () => {
		expect(() => flagIn(['--since'], 'since')).toThrow(
			/--since needs a value/u,
		);
	});

	it('THROWS when the next argument is another flag', () => {
		expect(() => flagIn(['--since', '--project', 'x'], 'since')).toThrow(
			/--since needs a value/u,
		);
	});
});

describe('render', () => {
	const main: Row = {
		cacheCreation: 0,
		cacheRead: 0,
		input: 100,
		messages: 1,
		model: 'claude-opus-5',
		origin: 'main',
		output: 10,
	};
	const sub: Row = { ...main, input: 900, origin: 'subagent', output: 90 };

	it('warns that the statusline understates a run with subagents', () => {
		expect(render([main, sub], 0)).toContain('SUBAGENT');
		expect(render([main, sub], 0)).toContain('EXCLUDES');
	});

	it('says nothing about subagents when none ran', () => {
		expect(render([main], 0)).not.toContain('SUBAGENT');
	});

	it('reports an empty window as empty rather than as zero usage', () => {
		expect(render([], 0)).toBe('no usage records in that window');
	});
});
