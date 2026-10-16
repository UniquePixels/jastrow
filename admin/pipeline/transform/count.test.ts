/**
 * `count.ts` is a CLI (`bun transform:count`). Importing it must not
 * run the audit: an unguarded top-level `await main()` hashes the
 * source snapshot and reads the whole corpus on import, which a
 * unit-tier test must never do (review ledger L33).
 */
import { describe, expect, it, spyOn } from 'bun:test';

describe('count.ts', () => {
	it('runs nothing when imported', async () => {
		const log = spyOn(console, 'log');
		try {
			await import('./count.ts');
			expect(log).not.toHaveBeenCalled();
		} finally {
			log.mockRestore();
		}
	});
});
