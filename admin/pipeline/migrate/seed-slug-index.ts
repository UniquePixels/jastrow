/**
 * One-shot seeder for `data/slug-index/` (consolidation spec §7.1,
 * §11 step 7). It records the slugs the committed entry tree already
 * carries; it does not assign any.
 *
 *     bun admin/pipeline/migrate/seed-slug-index.ts
 *
 * Deliberately not a `package.json` script: it runs once, and step 6
 * cut that file from 25 scripts to 13. After this run the pipeline
 * maintains the index, so the seeder refuses if either file exists.
 *
 * Safe because the assignment is reproducible: re-running `assignSlugs`
 * over the committed entries' own headwords returns all 32,512
 * committed slugs unchanged (the plan's positive control). The file is
 * therefore a record of today's state, not a new decision.
 */
import { existsSync } from 'node:fs';
import { slugStem } from './slug.ts';
import {
	ALIAS_INDEX_PATH,
	type AliasRow,
	SLUG_INDEX_PATH,
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

/** One alias per shared stem: the bare stem, pointing at the member
 * holding `stem-1`. Two things are reported rather than guessed at —
 * a family with no `-1` member, which would mean the numbering is not
 * what §7 describes, and a bare stem that is already some entry's real
 * slug, which leaves that family no alias to give (`slug-bare-held`,
 * §7.3). Neither occurs in the committed tree; both would be silent if
 * the code chose a member on its own. */
function buildAliases(entries: readonly Entry[]): {
	aliases: AliasRow[];
	problems: string[];
} {
	const families = new Map<string, Entry[]>();
	const taken = new Set(entries.map((e) => e.slug));
	for (const entry of entries) {
		const stem = slugStem(entry.headword.text);
		families.set(stem, [...(families.get(stem) ?? []), entry]);
	}
	const aliases: AliasRow[] = [];
	const problems: string[] = [];
	for (const [stem, members] of families) {
		if (members.length < 2) {
			continue;
		}
		if (taken.has(stem)) {
			problems.push(`slug-bare-held: ${stem} is a real slug; no alias`);
			continue;
		}
		const first = members.find((m) => m.slug === `${stem}-1`);
		if (first === undefined) {
			problems.push(
				`no ${stem}-1 among ${members.length} members: ${members.map((m) => m.id).join(',')}`,
			);
			continue;
		}
		aliases.push({ rid: first.id, slug: stem });
	}
	return { aliases, problems };
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
	await writeSlugIndex(rows);
	await writeAliases(aliases);
	console.log(
		`wrote ${rows.length} rows to ${SLUG_INDEX_PATH} and ${aliases.length} aliases to ${ALIAS_INDEX_PATH}; problems=${problems.length}`,
	);
}

if (import.meta.main) {
	await main();
}

export { buildAliases };
