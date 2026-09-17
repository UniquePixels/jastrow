/**
 * Truth validation (consolidation spec §5.1): what every file under
 * `data/entries/` must satisfy, however it got there — the pipeline's
 * write or a hand edit. `migrate`'s nine gates check the pipeline's
 * output against its SOURCE; these check truth against ITSELF and the
 * page index, so they are the only checks a hand edit ever meets.
 * `truth.test.ts` runs them over the committed tree in `bun qa:test`.
 */
import Ajv2020 from 'ajv/dist/2020';
import entrySchema from '../schema/entry.schema.json' with { type: 'json' };
import { tokenize } from '../transform/html.ts';
import type { PagePlacement } from './page.ts';
import { auditAliases, type SlugRow } from './slug-index.ts';
import type { TruthEntry, TruthSense } from './types.ts';

const TRUTH_DIR = 'data/entries';

/** The truth markup vocabulary (migrate spec §2.2): `markup.ts` keeps
 * four source tags and translates the other two into `he` and `cite`. */
const VOCABULARY: ReadonlySet<string> = new Set([
	'b',
	'cite',
	'he',
	'i',
	'sub',
	'sup',
]);

/** A cite carries exactly one attribute, a non-empty `ref`; every other
 * vocabulary tag carries none. */
const CITE_OPEN = /^<cite ref="([^"<>]+)">$/u;
const BARE_OPEN = /^<([a-z]+)>$/u;
const CLOSE = /^<\/([a-z]+)>$/u;
const RID = /^[A-Z]\d{5}$/u;
const MARKUP_CHAR = /[<>]/u;

const validateEntry = new Ajv2020({
	allErrors: true,
	strict: true,
}).compile<TruthEntry>(entrySchema);

/** One truth file as read: its path relative to `data/entries/`
 * (`A/A00013.json`) and its parsed, not-yet-validated content. */
interface TruthFile {
	entry: unknown;
	path: string;
}

/** Every JSON file at any depth under `dir`, in path order — not just
 * `<letter>/<file>`, so a file misplaced at the root or one level too
 * deep is still read and reported away from its home. A file that does
 * not parse is a problem, not a thrown error, so one bad hand edit does
 * not hide every other finding. */
async function loadTruthFiles(
	dir = TRUTH_DIR,
): Promise<{ files: TruthFile[]; problems: string[] }> {
	const paths = await Array.fromAsync(new Bun.Glob('**/*.json').scan(dir));
	const files: TruthFile[] = [];
	const problems: string[] = [];
	await Promise.all(
		paths.map(async (path): Promise<void> => {
			try {
				files.push({ entry: await Bun.file(`${dir}/${path}`).json(), path });
			} catch (error) {
				problems.push(`${path}: does not parse: ${String(error)}`);
			}
		}),
	);
	// Reads settle in any order; the report must not.
	return {
		files: files.toSorted((a, b) => byCodeUnit(a.path, b.path)),
		problems: problems.toSorted(byCodeUnit),
	};
}

/** Code-unit order: stable across machines, unlike a locale collation. */
function byCodeUnit(a: string, b: string): number {
	if (a === b) {
		return 0;
	}
	return a < b ? -1 : 1;
}

/** What one markup field yields: its problems and its cite refs. */
interface MarkupFindings {
	problems: string[];
	refs: string[];
}

/** An opening tag is a `<cite ref="…">` (its ref collected) or a bare
 * vocabulary tag other than `cite`; anything else is a problem. */
function checkOpenTag(value: string, found: MarkupFindings): void {
	const cite = CITE_OPEN.exec(value);
	if (cite !== null) {
		found.refs.push(cite[1] ?? '');
		return;
	}
	const name = BARE_OPEN.exec(value)?.[1];
	if (name === undefined || name === 'cite' || !VOCABULARY.has(name)) {
		found.problems.push(`tag outside the vocabulary: ${value}`);
	}
}

/** A closing tag must close the innermost open one. */
function checkCloseTag(
	value: string,
	open: string[],
	found: MarkupFindings,
): void {
	const top = open.pop();
	if (CLOSE.exec(value)?.[1] !== top) {
		const closed = top === undefined ? 'nothing' : `<${top}>`;
		found.problems.push(`${value} closes ${closed}`);
	}
}

/** One HTML field against the vocabulary: every open tag is in it with
 * the right attributes, every close matches the innermost open, and
 * nothing is left open. Off-vocabulary opens still go on the stack so
 * their own close is not reported a second time. */
function markupProblems(html: string): MarkupFindings {
	const found: MarkupFindings = { problems: [], refs: [] };
	const open: string[] = [];
	for (const token of tokenize(html)) {
		if (token.kind === 'text') {
			continue;
		}
		if (token.close) {
			checkCloseTag(token.value, open, found);
			continue;
		}
		checkOpenTag(token.value, found);
		if (!token.value.endsWith('/>')) {
			open.push(token.name);
		}
	}
	if (open.length > 0) {
		found.problems.push(`unclosed: ${open.join(',')}`);
	}
	return found;
}

/** The HTML fields of a sense tree, with a readable path to each. */
function* senseTexts(
	senses: readonly TruthSense[],
	at: string,
): Generator<[string, string]> {
	for (const [i, sense] of senses.entries()) {
		yield [`${at}[${i}].gloss`, sense.gloss];
		for (const [j, unit] of (sense.units ?? []).entries()) {
			yield [`${at}[${i}].units[${j}]`, unit];
		}
		yield* senseTexts(sense.senses ?? [], `${at}[${i}].senses`);
	}
}

/** Every field that may carry markup. */
function* markupFields(entry: TruthEntry): Generator<[string, string]> {
	yield* senseTexts(entry.senses, 'senses');
	for (const [i, stem] of (entry.stems ?? []).entries()) {
		yield [`stems[${i}].stem`, stem.stem];
		for (const [j, form] of stem.forms.entries()) {
			yield [`stems[${i}].forms[${j}]`, form];
		}
		yield* senseTexts(stem.senses, `stems[${i}].senses`);
	}
}

/** The sense labels of a sense tree (`1`, `a`, …), with their paths. */
function* senseLabels(
	senses: readonly TruthSense[],
	at: string,
): Generator<[string, string]> {
	for (const [i, sense] of senses.entries()) {
		if (sense.label !== undefined) {
			yield [`${at}[${i}].label`, sense.label];
		}
		yield* senseLabels(sense.senses ?? [], `${at}[${i}].senses`);
	}
}

/** Every field that must carry none: the headword forms and the slug
 * are identifiers, and `slug.ts` and the compiler read them as text;
 * sense labels are numbering. */
function* plainFields(entry: TruthEntry): Generator<[string, string]> {
	yield ['slug', entry.slug];
	yield ['headword.text', entry.headword.text];
	for (const [i, alt] of (entry.altHeadwords ?? []).entries()) {
		yield [`altHeadwords[${i}].text`, alt.text];
	}
	yield* senseLabels(entry.senses, 'senses');
	for (const [i, stem] of (entry.stems ?? []).entries()) {
		yield* senseLabels(stem.senses, `stems[${i}].senses`);
	}
}

/** Schema, and a file lives at `<first letter>/<id>.json`. Returns the
 * entries that passed, for the corpus-level checks. */
function checkFiles(
	files: readonly TruthFile[],
	problems: string[],
): TruthEntry[] {
	const entries: TruthEntry[] = [];
	for (const { entry, path } of files) {
		if (!validateEntry(entry)) {
			problems.push(`${path}: schema: ${JSON.stringify(validateEntry.errors)}`);
			continue;
		}
		const home = `${entry.id.charAt(0)}/${entry.id}.json`;
		if (path !== home) {
			problems.push(`${path}: id ${entry.id} belongs at ${home}`);
		}
		entries.push(entry);
	}
	return entries;
}

/** Slugs are unique across the tree. Ids need no check of their own:
 * glob paths are unique and `checkFiles` allows each id one path, so a
 * second file for an id is already reported as away from its home. */
function checkSlugs(entries: readonly TruthEntry[], problems: string[]): void {
	const slugs = new Map<string, string>();
	for (const { id, slug } of entries) {
		const owner = slugs.get(slug);
		if (owner === undefined) {
			slugs.set(slug, id);
		} else {
			problems.push(`${id}: slug ${slug} taken by ${owner}`);
		}
	}
}

/** Markup is in the vocabulary and balanced per field, identifiers
 * carry none, and every rid-shaped cite names an entry that exists. */
function checkMarkup(
	entry: TruthEntry,
	ids: ReadonlySet<string>,
	problems: string[],
): void {
	for (const [field, text] of plainFields(entry)) {
		if (MARKUP_CHAR.test(text)) {
			problems.push(`${entry.id}: ${field}: markup in a plain-text field`);
		}
	}
	for (const [field, text] of markupFields(entry)) {
		const found = markupProblems(text);
		for (const problem of found.problems) {
			problems.push(`${entry.id}: ${field}: ${problem}`);
		}
		for (const ref of found.refs) {
			if (RID.test(ref) && !ids.has(ref)) {
				problems.push(`${entry.id}: ${field}: cite ref ${ref} names no entry`);
			}
		}
	}
}

/** Truth's page is the page index's row, both ways (R2: the index is
 * the input a rebuild reads, so a page edited in truth alone is lost). */
function checkPages(
	entries: readonly TruthEntry[],
	ids: ReadonlySet<string>,
	pages: ReadonlyMap<string, PagePlacement>,
	problems: string[],
): void {
	for (const { id, page } of entries) {
		const row = pages.get(id);
		const has =
			page === undefined ? 'none' : `p${page.number}${page.column ?? ''}`;
		if (row === undefined) {
			problems.push(`${id}: no page-index row (truth has ${has})`);
		} else if (page?.number !== row.number || page.column !== row.column) {
			problems.push(
				`${id}: page ${has} but the page index says p${row.number}${row.column}`,
			);
		}
	}
	for (const rid of pages.keys()) {
		if (!ids.has(rid)) {
			problems.push(`page-index row ${rid} has no entry`);
		}
	}
}

/** Truth's slug is the slug index's row, both ways (R10: the index is
 * the input a rebuild reads, so a slug edited in truth alone is lost —
 * and worse, the next run would reassign from the index and move a
 * published URL back).
 *
 * A `retired` row with no entry is the point of the status: the slug
 * stays reserved. A `retired` row WITH an entry is a contradiction —
 * the entry is live and its URL is marked gone. */
function checkSlugIndex(
	entries: readonly TruthEntry[],
	index: ReadonlyMap<string, SlugRow>,
	aliases: ReadonlyMap<string, string>,
	problems: string[],
): void {
	const ids = new Set(entries.map((e) => e.id));
	for (const { id, slug } of entries) {
		const row = index.get(id);
		if (row === undefined) {
			problems.push(`${id}: no slug-index row (truth has ${slug})`);
		} else if (row.slug !== slug) {
			problems.push(`${id}: slug ${slug} but the slug index says ${row.slug}`);
		} else if (row.status === 'retired') {
			problems.push(`${id}: slug-index row is retired but the entry exists`);
		}
	}
	for (const [rid, row] of index) {
		if (row.status === 'live' && !ids.has(rid)) {
			problems.push(`slug-index row ${rid} is live but has no entry`);
		}
	}
	// Every slug the index reserves, retired rows included: a retired slug
	// is held precisely so nothing else can take it, an alias no less than
	// an entry.
	const held = new Map([...index.values()].map((row) => [row.slug, row.rid]));
	for (const family of auditAliases([...index.values()], aliases).add) {
		problems.push(`family ${family.slug} has no alias row`);
	}
	for (const [slug, rid] of aliases) {
		const row = index.get(rid);
		const owner = held.get(slug);
		if (owner !== undefined) {
			// `/אב` cannot be both an entry and a redirect. `auditAliases`
			// reports this family as `slug-bare-held` and gives it no
			// alias; a hand edit could still add one.
			problems.push(`alias ${slug} is also ${owner}'s slug`);
		} else if (!ids.has(rid)) {
			problems.push(`alias ${slug} points at ${rid}, which has no entry`);
		} else if (row?.slug !== `${slug}-1`) {
			// Existing-rid is not enough: an alias resolving to the wrong
			// member of its own family sends /אב to אב-2 and nothing fails
			// (CodeRabbit, major).
			problems.push(
				`alias ${slug} points at ${rid}, which holds ${row?.slug ?? '(no row)'} not ${slug}-1`,
			);
		}
	}
}

/** Every truth check over one tree; an empty list is a valid tree. */
function validateTruth(
	files: readonly TruthFile[],
	pages: ReadonlyMap<string, PagePlacement>,
	index: ReadonlyMap<string, SlugRow>,
	aliases: ReadonlyMap<string, string> = new Map(),
): string[] {
	const problems: string[] = [];
	const entries = checkFiles(files, problems);
	checkSlugs(entries, problems);
	const ids = new Set(entries.map((e) => e.id));
	for (const entry of entries) {
		checkMarkup(entry, ids, problems);
	}
	checkPages(entries, ids, pages, problems);
	checkSlugIndex(entries, index, aliases, problems);
	return problems;
}

export type { TruthFile };
export { loadTruthFiles, markupProblems, TRUTH_DIR, VOCABULARY, validateTruth };
