import { describe, expect, it } from 'bun:test';
import { type RunOptions, runOptions } from './options.ts';

const RUNTIME = ['bun', 'admin/pipeline/migrate.ts'];

describe('runOptions', () => {
	it('is a non-strict dry run by default: pins counted, drift reported', () => {
		expect(runOptions(RUNTIME)).toEqual({
			drift: 'outcome',
			pins: 'skip',
			strict: false,
			write: false,
		});
	});

	it('--strict blocks stale pins and makes drift a patch problem', () => {
		expect(runOptions([...RUNTIME, '--strict'])).toEqual({
			drift: 'problem',
			pins: 'block',
			strict: true,
			write: false,
		});
	});

	it('--write alone stays non-strict', () => {
		expect(runOptions([...RUNTIME, '--write'])).toEqual({
			drift: 'outcome',
			pins: 'skip',
			strict: false,
			write: true,
		});
	});

	it('--write --strict, in either order, is a strict write', () => {
		const strictWrite: RunOptions = {
			drift: 'problem',
			pins: 'block',
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
