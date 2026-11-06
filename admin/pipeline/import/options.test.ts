import { describe, expect, it } from 'bun:test';
import { type RunOptions, runOptions } from './options.ts';

const RUNTIME = ['bun', 'admin/pipeline/import.ts'];

describe('runOptions', () => {
	it('is a non-strict dry run by default: drift reported', () => {
		expect(runOptions(RUNTIME)).toEqual({
			drift: 'outcome',
			strict: false,
			write: false,
		});
	});

	it('--strict makes drift a patch problem', () => {
		expect(runOptions([...RUNTIME, '--strict'])).toEqual({
			drift: 'problem',
			strict: true,
			write: false,
		});
	});

	it('--write alone stays non-strict', () => {
		expect(runOptions([...RUNTIME, '--write'])).toEqual({
			drift: 'outcome',
			strict: false,
			write: true,
		});
	});

	it('--write --strict, in either order, is a strict write', () => {
		const strictWrite: RunOptions = {
			drift: 'problem',
			strict: true,
			write: true,
		};
		expect(runOptions([...RUNTIME, '--write', '--strict'])).toEqual(
			strictWrite,
		);
		expect(runOptions([...RUNTIME, '--strict', '--write'])).toEqual(
			strictWrite,
		);
	});
});
