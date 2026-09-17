/**
 * One-shot seeder for `data/slug-index/` (consolidation spec §7.1,
 * §11 step 7). It records the slugs the committed entry tree already
 * carries; it does not assign any.
 *
 *     bun admin/pipeline/migrate/seed-slug-index.ts
 *
 * Deliberately not a `package.json` script: it runs once, and step 6
 * cut that file from 25 scripts to 13. The seeder refuses if either
 * file exists.
 *
 * After this run the pipeline READS the index and reports what it is
 * missing; it does not write to it. Persisting new or retired rows is
 * index maintenance and ships with the atomic write (R11).
 *
 * Safe because the assignment is reproducible: re-running `assignSlugs`
 * over the committed entries' own headwords returns all 32,512
 * committed slugs unchanged (the plan's positive control). The file is
 * therefore a record of today's state, not a new decision.
 */
import { existsSync } from 'node:fs';
import { unlink } from 'node:fs/promises';
import {
	ALIAS_INDEX_PATH,
	type AliasRow,
	auditAliases,
	SLUG_INDEX_PATH,
	type SlugFact,
	type SlugRow,
	writeAliases,
	writeSlugIndex,
} from './slug-index.ts';

const ENTRIES_DIR = 'data/entries';

interface Entry {
	headword: { text: string };
	id: string;
	slug: string;
}

/** Every committed entry, in rid order. */
async function readEntries(dir = ENTRIES_DIR): Promise<Entry[]> {
	const paths = await Array.fromAsync(new Bun.Glob('*/*.json').scan(dir));
	const entries = await Promise.all(
		paths.map(
			async (path) => (await Bun.file(`${dir}/${path}`).json()) as Entry,
		),
	);
	// Reads settle in any order; the output must not.
	return entries.toSorted((a, b) => (a.id < b.id ? -1 : 1));
}

/** The alias rule, run over committed entries. The rule itself lives
 * in `slug-index.ts` so the seeder and `migrate` cannot drift apart;
 * this only turns entries into the facts it takes. Both shapes that
 * make an alias impossible are reported rather than guessed around:
 * a family with no `-1` member, and a bare stem that is already some
 * entry's real slug (`slug-bare-held`, §7.3). Neither occurs in the
 * committed tree. */
function buildAliases(entries: readonly Entry[]): {
	aliases: AliasRow[];
	problems: string[];
} {
	const facts: SlugFact[] = entries.map((e) => ({ rid: e.id, slug: e.slug }));
	const audit = auditAliases(facts, new Map());
	return {
		aliases: audit.add,
		problems: [...audit.bareHeld, ...audit.problems],
	};
}

async function main(): Promise<void> {
	for (const path of [SLUG_INDEX_PATH, ALIAS_INDEX_PATH]) {
		if (existsSync(path)) {
			throw new Error(`${path} already exists; the seeder runs once`);
		}
	}
	const entries = await readEntries();
	const rows: SlugRow[] = entries.map((e) => ({
		rid: e.id,
		slug: e.slug,
		status: 'live',
	}));
	const { aliases, problems } = buildAliases(entries);
	for (const problem of problems) {
		console.log(`problem: ${problem}`);
	}
	if (problems.length > 0) {
		// Writing anyway would commit the holes, and the run-once check
		// would then block the corrected rerun.
		throw new Error(
			`seed aborted: ${problems.length} problem(s), none written`,
		);
	}
	// Two files, one act. A crash between the writes would leave
	// `entries.jsonl` alone, and the run-once guard above would then
	// refuse the corrected rerun; clean up so the next run starts fresh.
	try {
		await writeSlugIndex(rows);
		await writeAliases(aliases);
	} catch (error) {
		for (const path of [SLUG_INDEX_PATH, ALIAS_INDEX_PATH]) {
			if (existsSync(path)) {
				await unlink(path);
			}
		}
		throw new Error('seed failed; wrote nothing', { cause: error });
	}
	console.log(
		`wrote ${rows.length} rows to ${SLUG_INDEX_PATH} and ${aliases.length} aliases to ${ALIAS_INDEX_PATH}; problems=${problems.length}`,
	);
}

if (import.meta.main) {
	await main();
}

export { buildAliases };
