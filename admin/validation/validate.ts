// biome-ignore-all lint/style/noExcessiveLinesPerFile: the entry checks and the functions that run them; splitting would make them harder to read and maintain.
/**
 * Entry validation: the checks every file under `data/entries/` must
 * pass. `validateEntry` checks one file on its own, `validateCorpus`
 * checks what needs the whole tree, and `validateEntries` runs both.
 */
import type { TLocalizedValidationError } from 'typebox/error';
import { Compile } from 'typebox/schema';
import { ANNOTATE_OPEN } from '../lib/annotate.ts';
import { compareByCodeUnit } from '../lib/compare-by-code-unit.ts';
import { findDuplicates } from '../lib/find-duplicates.ts';
import { toComparisonForm } from '../lib/hebrew.ts';
import { tokenize } from '../lib/html.ts';
import { findEmptyUrlWords } from '../lib/url-path.ts';
import { paths } from '../paths.ts';
import { checkAnnotations } from './annotations.ts';
import { entryFields, type FieldMarkup, markupFields } from './fields.ts';
import { headwordShapeProblems } from './headword-rules.ts';
import { type Entry, EntrySchema, RID, VERBATIM_FIELDS } from './schema.ts';

/** The tags a markup field may carry. */
const VOCABULARY: ReadonlySet<string> = new Set([
	'annotate',
	'b',
	'cite',
	'he',
	'i',
	'sub',
	'sup',
]);

/** The tags `display` may carry. */
const DISPLAY_VOCABULARY: ReadonlySet<string> = new Set(['annotate']);

/** A `cite` opening tag; group 1 is its `ref`. */
const CITE_OPEN = /^<cite ref="([^"<>]+)">$/u;
/** An opening tag with no attributes; group 1 is its name. */
const BARE_OPEN = /^<([a-z]+)>$/u;
/** A closing tag; group 1 is its name. */
const CLOSE = /^<\/([a-z]+)>$/u;
/** A `<` or `>`. */
const ANGLE = /[<>]/u;

/**
 * The compiled entry schema. Call `errors` only after `check` fails;
 * it validates again.
 */
interface EntryValidator {
	check: (value: unknown) => value is Entry;
	errors: (value: unknown) => TLocalizedValidationError[];
}

/** The validator `schemaValidator` compiled, once it has. */
let compiled: EntryValidator | undefined;

/**
 * Compiles `EntrySchema` on the first call and reuses the result.
 *
 * @returns The compiled validator.
 */
function schemaValidator(): EntryValidator {
	if (compiled === undefined) {
		const validator = Compile(EntrySchema);
		compiled = {
			check: (value: unknown): value is Entry => validator.Check(value),
			errors: (value: unknown): TLocalizedValidationError[] =>
				validator.Errors(value)[1],
		};
	}
	return compiled;
}

/**
 * Describes why a value fails the entry schema.
 *
 * @param schema - The compiled validator.
 * @param value - A value `schema.check` rejected.
 * @returns The schema errors as a JSON string.
 */
function schemaErrors(schema: EntryValidator, value: unknown): string {
	return JSON.stringify(schema.errors(value));
}

/**
 * An entry file as read: its path relative to `data/entries/` and its
 * parsed, unvalidated content.
 */
interface EntryFile {
	entry: unknown;
	path: string;
}

/** The glob, relative to an entry tree, that matches its entry files. */
const ENTRY_FILE_GLOB = '**/*.json';

/**
 * Reads every JSON file at any depth under a directory.
 *
 * @param dir - The entry tree to read; defaults to `data/entries/`.
 * @returns The parsed files and one problem per file that does not
 * parse, both in path order.
 */
async function loadEntryFiles(
	dir = paths.entries,
): Promise<{ files: EntryFile[]; problems: string[] }> {
	const found = await Array.fromAsync(new Bun.Glob(ENTRY_FILE_GLOB).scan(dir));
	const files: EntryFile[] = [];
	const problems: string[] = [];
	await Promise.all(
		found.map(async (path): Promise<void> => {
			try {
				files.push({ entry: await Bun.file(`${dir}/${path}`).json(), path });
			} catch (error) {
				problems.push(`${path}: does not parse: ${String(error)}`);
			}
		}),
	);
	// Reads settle in any order; the report must not.
	return {
		files: files.toSorted((a, b) => compareByCodeUnit(a.path, b.path)),
		problems: problems.toSorted(compareByCodeUnit),
	};
}

/**
 * The findings of one markup field: its problems and the refs of its
 * cites.
 */
interface MarkupFindings {
	problems: string[];
	refs: string[];
}

/**
 * Tests whether an opening tag carries the attributes its name allows:
 * a `ref` on `cite`, an `id` on `annotate`, none on any other.
 *
 * @param name - The tag name.
 * @param value - The whole tag, `<` to `>`.
 * @returns Whether the tag is well formed.
 */
function wellFormedOpen(name: string, value: string): boolean {
	if (name === 'cite') {
		return CITE_OPEN.test(value);
	}
	if (name === 'annotate') {
		return ANNOTATE_OPEN.test(value);
	}
	return BARE_OPEN.exec(value)?.[1] === name;
}

/**
 * Checks one opening tag: records a problem if it is outside the
 * vocabulary or malformed, and its `ref` if it is a cite.
 *
 * @param name - The tag name.
 * @param value - The whole tag, `<` to `>`.
 * @param vocabulary - The tag names allowed.
 * @param found - The findings to add to.
 */
function checkOpenTag(
	name: string,
	value: string,
	vocabulary: ReadonlySet<string>,
	found: MarkupFindings,
): void {
	if (!(vocabulary.has(name) && wellFormedOpen(name, value))) {
		found.problems.push(`tag outside the vocabulary: ${value}`);
		return;
	}
	const ref = CITE_OPEN.exec(value)?.[1];
	if (ref !== undefined) {
		found.refs.push(ref);
	}
}

/**
 * Pops the innermost open tag and records a problem if the closing tag
 * does not close it.
 *
 * @param value - The whole closing tag.
 * @param open - The stack of open tag names.
 * @param found - The findings to add to.
 */
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

/**
 * Checks one field's markup: every tag is in the vocabulary and well
 * formed, tags nest and close, and no `<` or `>` stands in text.
 *
 * @param html - The field's text.
 * @param vocabulary - The tag names allowed; defaults to `VOCABULARY`.
 * @returns The problems found and the refs of the field's cites.
 */
function markupProblems(
	html: string,
	vocabulary: ReadonlySet<string> = VOCABULARY,
): MarkupFindings {
	const found: MarkupFindings = { problems: [], refs: [] };
	const open: string[] = [];
	for (const token of tokenize(html)) {
		if (token.kind === 'text') {
			if (ANGLE.test(token.value)) {
				found.problems.push(`stray angle bracket in text: ${token.value}`);
			}
			continue;
		}
		if (token.close) {
			checkCloseTag(token.value, open, found);
			continue;
		}
		checkOpenTag(token.name, token.value, vocabulary, found);
		if (!token.value.endsWith('/>')) {
			open.push(token.name);
		}
	}
	if (open.length > 0) {
		found.problems.push(`unclosed: ${open.join(',')}`);
	}
	return found;
}

/** The vocabulary of each kind of field that may carry markup. */
const FIELD_VOCABULARY: Record<
	Exclude<FieldMarkup, 'none'>,
	ReadonlySet<string>
> = { annotate: DISPLAY_VOCABULARY, vocabulary: VOCABULARY };

/**
 * Computes where an entry file belongs.
 *
 * @param id - The entry's rid.
 * @returns The path relative to `data/entries/`: `<first
 * letter>/<id>.json`.
 */
function homePath(id: string): string {
	return `${id.charAt(0)}/${id}.json`;
}

/**
 * Yields every string stored under a value, skipping
 * `VERBATIM_FIELDS`.
 *
 * @param value - The value to walk.
 * @param at - The path of `value` within the entry; `''` for the entry
 * itself.
 * @returns Each string's path and text.
 */
function* storedStrings(
	value: unknown,
	at: string,
): Generator<[string, string]> {
	if (typeof value === 'string') {
		yield [at, value];
		return;
	}
	if (Array.isArray(value)) {
		for (const [i, item] of value.entries()) {
			yield* storedStrings(item, `${at}[${i}]`);
		}
		return;
	}
	if (typeof value === 'object' && value !== null) {
		for (const [key, item] of Object.entries(value)) {
			if (!VERBATIM_FIELDS.has(key)) {
				yield* storedStrings(item, at === '' ? key : `${at}.${key}`);
			}
		}
	}
}

/**
 * Reports each stored string that is not in NFC.
 *
 * @param entry - The entry to check.
 * @param problems - The list problems are appended to.
 */
function checkNfc(entry: Entry, problems: string[]): void {
	for (const [field, text] of storedStrings(entry, '')) {
		if (text !== text.normalize('NFC')) {
			problems.push(`${entry.id}: ${field}: not NFC`);
		}
	}
}

/**
 * Reports each entry whose URL word holds no letter.
 *
 * @param entries - Every entry in the tree.
 * @param problems - The list problems are appended to.
 */
function checkUrlWords(entries: readonly Entry[], problems: string[]): void {
	for (const { line } of findEmptyUrlWords(entries)) {
		problems.push(line);
	}
}

/**
 * Reports each entry whose `sefariaHeadword` another entry already
 * holds.
 *
 * @param entries - Every entry in the tree.
 * @param problems - The list problems are appended to.
 */
function checkSefariaHeadwords(
	entries: readonly Entry[],
	problems: string[],
): void {
	for (const { item, owner } of findDuplicates(entries, (entry) =>
		toComparisonForm(entry.sefariaHeadword),
	)) {
		problems.push(
			`${item.id}: sefariaHeadword ${item.sefariaHeadword} taken by ${owner.id}`,
		);
	}
}

/**
 * Reports markup outside a field's vocabulary, unbalanced markup, and
 * any `<` or `>` in a plain-text field.
 *
 * @param entry - The entry to check.
 * @param problems - The list problems are appended to.
 */
function checkMarkup(entry: Entry, problems: string[]): void {
	for (const { markup, path, text } of entryFields(entry)) {
		if (markup === 'none') {
			if (ANGLE.test(text)) {
				problems.push(`${entry.id}: ${path}: markup in a plain-text field`);
			}
			continue;
		}
		for (const problem of markupProblems(text, FIELD_VOCABULARY[markup])
			.problems) {
			problems.push(`${entry.id}: ${path}: ${problem}`);
		}
	}
}

/**
 * Reports each cite whose `ref` is a rid that names no entry.
 *
 * @param entry - The entry to check.
 * @param ids - The rid of every entry in the tree.
 * @param problems - The list problems are appended to.
 */
function checkCiteTargets(
	entry: Entry,
	ids: ReadonlySet<string>,
	problems: string[],
): void {
	for (const [field, text] of markupFields(entry)) {
		for (const ref of markupProblems(text).refs) {
			if (RID.test(ref) && !ids.has(ref)) {
				problems.push(`${entry.id}: ${field}: cite ref ${ref} names no entry`);
			}
		}
	}
}

/**
 * Reports an entry that sets both `grammar.gender` and a form gender,
 * or a form gender on some headwords and not others.
 *
 * @param entry - The entry to check.
 * @param problems - The list problems are appended to.
 */
function checkGender(entry: Entry, problems: string[]): void {
	const gendered: number[] = [];
	const bare: number[] = [];
	for (const [i, form] of entry.headwords.entries()) {
		(form.gender === undefined ? bare : gendered).push(i);
	}
	if (gendered.length > 0 && entry.grammar?.gender !== undefined) {
		problems.push(
			`${entry.id}: grammar.gender beside a form gender on headwords [${gendered.join(',')}]; an entry carries one or the other, never both (HW-gender)`,
		);
	}
	if (gendered.length > 0 && bare.length > 0) {
		problems.push(
			`${entry.id}: a form gender on headwords [${gendered.join(',')}] but none on [${bare.join(',')}]; it goes on every headword or none (HW-gender)`,
		);
	}
}

/**
 * Runs every single-file check on one entry file. A file that fails
 * the schema gets no further checks.
 *
 * @param schema - The compiled validator.
 * @param entry - The file's parsed content.
 * @param path - The file's path relative to `data/entries/`.
 * @returns The entry, or `undefined` if it fails the schema, and the
 * problems found.
 */
function checkEntry(
	schema: EntryValidator,
	entry: unknown,
	path: string,
): [Entry | undefined, string[]] {
	if (!schema.check(entry)) {
		return [undefined, [`${path}: schema: ${schemaErrors(schema, entry)}`]];
	}
	const problems: string[] = [];
	const home = homePath(entry.id);
	if (path !== home) {
		problems.push(`${path}: id ${entry.id} belongs at ${home}`);
	}
	problems.push(...headwordShapeProblems(entry));
	checkGender(entry, problems);
	checkAnnotations(entry, problems);
	checkMarkup(entry, problems);
	checkNfc(entry, problems);
	return [entry, problems];
}

/**
 * Validates one entry file on its own.
 *
 * @param entry - The file's parsed content.
 * @param path - The file's path relative to `data/entries/`.
 * @returns The problems found; empty if the file is valid.
 */
function validateEntry(entry: unknown, path: string): string[] {
	const [, problems] = checkEntry(schemaValidator(), entry, path);
	return problems;
}

/**
 * Runs the checks that need the whole tree: URL words, unique
 * `sefariaHeadword` and cite targets.
 *
 * @param entries - Every entry in the tree, each schema-valid.
 * @returns The problems found; empty if the tree is consistent.
 */
function validateCorpus(entries: readonly Entry[]): string[] {
	const problems: string[] = [];
	checkUrlWords(entries, problems);
	checkSefariaHeadwords(entries, problems);
	const ids = new Set(entries.map((e) => e.id));
	for (const entry of entries) {
		checkCiteTargets(entry, ids, problems);
	}
	return problems;
}

/**
 * Validates a loaded entry tree: each file on its own, then the corpus
 * checks over the files that pass the schema.
 *
 * @param files - The entry files, as `loadEntryFiles` returns them.
 * @returns The problems found; empty if the tree is valid.
 */
function validateEntries(files: readonly EntryFile[]): string[] {
	const problems: string[] = [];
	const entries: Entry[] = [];
	const schema = schemaValidator();
	for (const { entry, path } of files) {
		const [valid, found] = checkEntry(schema, entry, path);
		problems.push(...found);
		if (valid !== undefined) {
			entries.push(valid);
		}
	}
	problems.push(...validateCorpus(entries));
	return problems;
}

export type { EntryFile, EntryValidator };
export {
	checkEntry,
	ENTRY_FILE_GLOB,
	loadEntryFiles,
	markupProblems,
	schemaErrors,
	schemaValidator,
	VOCABULARY,
	validateCorpus,
	validateEntries,
	validateEntry,
};
