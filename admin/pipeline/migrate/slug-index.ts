/**
 * The slug index (consolidation spec §7.1, R10): the record of which
 * slug belongs to which entry, read as a pipeline INPUT rather than
 * derived from `data/entries/` each run.
 *
 * Two files, both reference data (§1.1):
 *
 * - `entries.jsonl` — one row per rid, `{rid, slug, status}`, rid
 *   sorted. A `retired` row keeps its slug reserved so a URL is never
 *   handed to a different word.
 * - `aliases.jsonl` — one row per shared stem, `{rid, slug}`, slug
 *   sorted: the bare stem and the family member it reaches (§7.2).
 *
 * Slugs are Hebrew, so they are keys, not prose: written in NFC and
 * looked up in NFC. Stored entry text is never normalised — that rule
 * is about this file's keys only.
 */
const SLUG_INDEX_PATH = 'data/slug-index/entries.jsonl';
const ALIAS_INDEX_PATH = 'data/slug-index/aliases.jsonl';

/** Whether the index binds (R10). `false` until v2 is published.
 *
 * While false, a run assigns every slug and alias from the composed
 * headwords, the way it composes every entry, and `--write` rewrites
 * both index files to match. A headword rule may move a slug; nothing
 * has been published for that to break. The run reports each move as
 * `slug-changed` against the committed index, so a reviewer sees it.
 *
 * Setting it to `true` is the act of publication: from then the index
 * is an input, a rid keeps the slug it has, and only a new rid is
 * assigned (spec §7.3). */
const SLUGS_FROZEN = false;

type SlugStatus = 'live' | 'retired';

interface SlugRow {
	rid: string;
	slug: string;
	status: SlugStatus;
}

/** A bare stem and the entry it reaches. */
interface AliasRow {
	rid: string;
	slug: string;
}

const RID = /^[A-Z]\d{5}$/u;

/** A slug is a lookup key, so the file holds exactly one spelling of
 * it. Hebrew combining marks order differently under NFD, so an NFC row
 * and an NFD row are two Map keys that resolve to one URL — the
 * duplicate checks below would pass and two entries would share a name
 * (CodeRabbit, major). `serialise*` writes NFC; anything else is a hand
 * edit and is refused rather than quietly normalised. */
function rejectNonNfc(slug: string, path: string): void {
	if (slug !== slug.normalize('NFC')) {
		throw new Error(`${path}: slug not in NFC: ${JSON.stringify(slug)}`);
	}
}

/** Code-unit order: stable across machines, unlike a locale collation
 * (`migrate/validate.ts` sorts the same way for the same reason). */
function byCodeUnit(a: string, b: string): number {
	if (a === b) {
		return 0;
	}
	return a < b ? -1 : 1;
}

/** A row must be a plain object before its fields can be read: `null`
 * destructures into a TypeError rather than this file's path-aware
 * refusal, and an array reads every field as undefined. */
function rejectNonObject(row: unknown, path: string): void {
	if (typeof row !== 'object' || row === null || Array.isArray(row)) {
		throw new Error(`${path}: row rejected: ${JSON.stringify(row)}`);
	}
}

/** Every non-empty line of a JSONL file, parsed. A parse failure names
 * the offending line rather than throwing a bare SyntaxError. */
function* rowsOf(text: string, path: string): Generator<unknown> {
	for (const line of text.split('\n')) {
		if (line.trim() === '') {
			continue;
		}
		try {
			yield JSON.parse(line);
		} catch {
			throw new Error(`${path}: row does not parse: ${line}`);
		}
	}
}

/** rid → row. A malformed row throws, naming the line; so does a
 * second row for one rid, and so does one slug held by two rids.
 * The duplicate-slug check is the point of the file: an index that
 * carries a collision has already lost the property it exists to
 * keep, and no later gate would see it as anything but two entries
 * agreeing with their own rows. */
async function loadSlugIndex(
	path = SLUG_INDEX_PATH,
): Promise<Map<string, SlugRow>> {
	const byRid = new Map<string, SlugRow>();
	const bySlug = new Map<string, string>();
	for (const row of rowsOf(await Bun.file(path).text(), path)) {
		rejectNonObject(row, path);
		const { rid, slug, status } = row as Partial<SlugRow>;
		if (
			typeof rid !== 'string' ||
			!RID.test(rid) ||
			typeof slug !== 'string' ||
			slug === '' ||
			(status !== 'live' && status !== 'retired')
		) {
			throw new Error(`${path}: row rejected: ${JSON.stringify(row)}`);
		}
		rejectNonNfc(slug, path);
		if (byRid.has(rid)) {
			throw new Error(`${path}: duplicate rid ${rid}`);
		}
		const owner = bySlug.get(slug);
		if (owner !== undefined) {
			throw new Error(`${path}: slug ${slug} held by ${owner} and ${rid}`);
		}
		byRid.set(rid, { rid, slug, status });
		bySlug.set(slug, rid);
	}
	return byRid;
}

/** bare stem → rid. A duplicate alias slug throws: an alias that
 * resolves two ways is a moved URL waiting to happen. */
async function loadAliases(
	path = ALIAS_INDEX_PATH,
): Promise<Map<string, string>> {
	const aliases = new Map<string, string>();
	for (const row of rowsOf(await Bun.file(path).text(), path)) {
		rejectNonObject(row, path);
		const { rid, slug } = row as Partial<AliasRow>;
		if (
			typeof rid !== 'string' ||
			!RID.test(rid) ||
			typeof slug !== 'string' ||
			slug === ''
		) {
			throw new Error(`${path}: row rejected: ${JSON.stringify(row)}`);
		}
		rejectNonNfc(slug, path);
		if (aliases.has(slug)) {
			throw new Error(`${path}: duplicate alias ${slug}`);
		}
		aliases.set(slug, rid);
	}
	return aliases;
}

/** JSONL keys alphabetical, as `data/page-index/` writes them, so a
 * row reads the same way in both files. */
function slugLine(row: SlugRow): string {
	return JSON.stringify({
		rid: row.rid,
		slug: row.slug.normalize('NFC'),
		status: row.status,
	});
}

function aliasLine(row: AliasRow): string {
	return JSON.stringify({ rid: row.rid, slug: row.slug.normalize('NFC') });
}

/** Rid-sorted, NFC, newline-terminated. */
function serialiseSlugIndex(rows: readonly SlugRow[]): string {
	const sorted = [...rows].toSorted((a, b) => byCodeUnit(a.rid, b.rid));
	return `${sorted.map(slugLine).join('\n')}\n`;
}

/** Slug-sorted: an alias file is read by slug, so it reads in the
 * order it is looked up in. */
function serialiseAliases(rows: readonly AliasRow[]): string {
	const sorted = [...rows].toSorted((a, b) =>
		byCodeUnit(a.slug.normalize('NFC'), b.slug.normalize('NFC')),
	);
	return `${sorted.map(aliasLine).join('\n')}\n`;
}

async function writeSlugIndex(
	rows: readonly SlugRow[],
	path = SLUG_INDEX_PATH,
): Promise<void> {
	await Bun.write(path, serialiseSlugIndex(rows));
}

async function writeAliases(
	rows: readonly AliasRow[],
	path = ALIAS_INDEX_PATH,
): Promise<void> {
	await Bun.write(path, serialiseAliases(rows));
}

/** One entry, as the alias rule sees it: a rid and the slug it holds.
 * Deliberately no headword stem — the family a slug belongs to is read
 * off the SLUG, so a caller holding only index rows can use this rule
 * as well as one holding entries. */
interface SlugFact {
	rid: string;
	slug: string;
}

/** The stem a slug names, read off the slug's own text — the same rule
 * `slug.ts` uses to decide which family a slug reserves a place in. A
 * frozen slug outlives the headword that produced it, so grouping by
 * the entry's current stem would file a drifted entry under a family it
 * has no slug in, and lose it from the one it does. */
const SLUG_FAMILY = /^(.+)-(\d+)$/u;

function familyOf(slug: string): string {
	return SLUG_FAMILY.exec(slug)?.[1] ?? slug;
}

interface AliasAudit {
	/** Families that should gain an alias. */
	add: AliasRow[];
	/** Families whose bare name is a member's real slug, so no alias can
	 * be given (`slug-bare-held`, spec §7.3). */
	bareHeld: string[];
	/** A family with no `stem-1` member: the numbering is not what §7
	 * describes, reported rather than guessed around. */
	problems: string[];
}

/** The alias each collision family should have — its bare stem,
 * pointing at the member holding `stem-1` (spec §7.2). One rule, used
 * by the seeder over the committed tree and by `migrate` over a run.
 *
 * A stem `existing` already names is left exactly as it is: an alias
 * is frozen like a slug, so it never re-points, not even when a member
 * with a lower rid appears. */
function auditAliases(
	facts: readonly SlugFact[],
	existing: ReadonlyMap<string, string>,
): AliasAudit {
	const families = new Map<string, SlugFact[]>();
	for (const fact of facts) {
		const family = familyOf(fact.slug);
		families.set(family, [...(families.get(family) ?? []), fact]);
	}
	const audit: AliasAudit = { add: [], bareHeld: [], problems: [] };
	for (const [stem, members] of families) {
		if (members.length < 2 || existing.has(stem)) {
			continue;
		}
		const incumbent = members.find((m) => m.slug === stem);
		if (incumbent !== undefined) {
			audit.bareHeld.push(`${incumbent.rid}: ${stem} is a real slug; no alias`);
			continue;
		}
		const first = members.find((m) => m.slug === `${stem}-1`);
		if (first === undefined) {
			audit.problems.push(
				`${members[0]?.rid}: no ${stem}-1 among ${members.length} members`,
			);
			continue;
		}
		audit.add.push({ rid: first.rid, slug: stem });
	}
	return audit;
}

/** What a slug is made of: Hebrew letters, geresh and gershayim, the
 * hyphen between words, and ASCII digits for a family number. Anything
 * else is notation that is not part of the word. An allow-list, because
 * the deny-list it replaced named URL-hostile characters and so found
 * 12 of the 22 slugs carrying notation — it had no `,`, Roman numeral
 * or superscript. After `slugStem` strips notation the rows left are
 * the two `=` cross references and any frozen slug assigned before. */
const NOT_WORD = /[^\u05D0-\u05EA\u05F3\u05F4\-0-9]/u;

/** `rid: slug` for every slug holding notation. */
function unsafeSlugs(facts: readonly SlugFact[]): string[] {
	return facts
		.filter((f) => NOT_WORD.test(f.slug))
		.map((f) => `${f.rid}: ${f.slug}`);
}

/** `rid: old → new` for every rid whose slug this run differs from the
 * committed index on, in the order given, then every indexed rid the run
 * has no slug for. `(none)` stands for the missing side. The review list
 * of an unfrozen run: it is how a URL moved by a headword rule is seen
 * before the write rather than after. */
function changedSlugs(
	facts: readonly SlugFact[],
	committed: ReadonlyMap<string, SlugRow>,
): string[] {
	const lines: string[] = [];
	const seen = new Set<string>();
	for (const { rid, slug } of facts) {
		seen.add(rid);
		const before = committed.get(rid)?.slug;
		if (before !== slug) {
			lines.push(`${rid}: ${before ?? '(none)'} → ${slug}`);
		}
	}
	for (const [rid, row] of committed) {
		if (!seen.has(rid)) {
			lines.push(`${rid}: ${row.slug} → (none)`);
		}
	}
	return lines;
}

export type { AliasAudit, AliasRow, SlugFact, SlugRow, SlugStatus };
export {
	ALIAS_INDEX_PATH,
	auditAliases,
	changedSlugs,
	loadAliases,
	loadSlugIndex,
	SLUG_INDEX_PATH,
	SLUGS_FROZEN,
	serialiseAliases,
	serialiseSlugIndex,
	unsafeSlugs,
	writeAliases,
	writeSlugIndex,
};
