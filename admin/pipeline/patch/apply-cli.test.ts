/**
 * The `research:apply` entry point, guarded statically.
 *
 * Patch targets are content anchors over the COMPOSED entry —
 * `applyRepairs`, then `text-repairs`, then `structural-repairs`. The
 * CLI used to hand each pristine source entry straight to
 * `applyEntryPatches`, so an anchor whose text a transform rewrites
 * failed to resolve under `bun research:apply` while resolving under
 * `bun pipeline:migrate` (CodeRabbit, PR #83). Measured 2026-09-10
 * against the committed corpus: of 190 raw patches, 81 resolved only
 * on the composed entry and 62 only on the pristine one.
 *
 * This is a TEXT scan, and it is here rather than in a behavioural
 * test for two reasons: the module runs its work at import time and
 * streams the whole 41 MB snapshot, and the behaviour
 * it should produce is already pinned entry-for-entry by
 * `apply.corpus.test.ts`. It sees a reintroduced raw-entry apply, a
 * dropped composer, and a return to the flat every-stage corpus; it
 * does NOT see a composer called on the wrong state, or the
 * accepted/carry-over split going wrong downstream of it.
 */
import { describe, expect, it } from 'bun:test';

const SOURCE: string = await Bun.file(`${import.meta.dir}/apply-cli.ts`).text();

describe('research:apply entry point', () => {
	it('composes each source entry before applying its patches', () => {
		expect(SOURCE).toContain('composeEntry(source, {');
	});

	it('never applies patches to a pristine source entry', () => {
		expect(SOURCE).not.toContain('applyEntryPatches(');
		expect(SOURCE).not.toContain('applyCarryOver(');
	});

	it('loads the accepted/carry-over split, not the flat corpus', () => {
		expect(SOURCE).toContain('loadAcceptedCorpus()');
		expect(SOURCE).not.toContain('loadCorpus(');
	});
});
