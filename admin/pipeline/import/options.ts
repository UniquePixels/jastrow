/**
 * Command-line options for `bun data:import[:dry]` (consolidation spec
 * §4.2). Resolved here rather than inline in `main` so the `--strict`
 * switch is tested: a regression that stopped reading it would let
 * `--write` run with drifted patches reported instead of refused.
 */
import type { DriftMode } from '../patch/apply.ts';

/** The switches one `bun data:import` run was started with. `drift`
 * is not a switch of its own: it follows from `--strict`, which the
 * run keeps beside it. */
interface RunOptions {
	/** What a patch whose precondition no longer holds becomes. */
	drift: DriftMode;
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
		strict,
		write: argv.includes('--write'),
	};
}

export type { RunOptions };
export { runOptions };
