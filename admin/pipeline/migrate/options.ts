/**
 * Command-line options for `bun pipeline:migrate` (consolidation spec
 * §4.2). Resolved here rather than inline in `main` so the `--strict`
 * switch is tested: a regression that stopped reading it would let
 * `--write` run with stale pins skipped and drifted patches reported
 * instead of refused.
 */
import type { DriftMode } from '../patch/apply.ts';

interface RunOptions {
	/** What a patch whose precondition no longer holds becomes. */
	drift: DriftMode;
	/** Whether a stale snapshot pin fails the patch preflight. */
	pins: 'block' | 'skip';
	strict: boolean;
	write: boolean;
}

/** The options an argument vector selects. Only `--write` and
 * `--strict` are read; anything else (the runtime and script path
 * `process.argv` starts with) is ignored. */
function runOptions(argv: readonly string[]): RunOptions {
	const strict = argv.includes('--strict');
	return {
		drift: strict ? 'problem' : 'outcome',
		pins: strict ? 'block' : 'skip',
		strict,
		write: argv.includes('--write'),
	};
}

export type { RunOptions };
export { runOptions };
