/**
 * `entry.schema.json` and the `Entry` type are one contract written
 * twice: the schema for a reader that is not TypeScript, the type for
 * every caller that is. `validate.ts` compiles the schema as
 * `ValidateFunction<Entry>` — a claim that a file the schema passes IS
 * an `Entry`. This suite holds the claim to account (review ledger
 * L01): every object the schema declares names the type's keys, the
 * same required ones, and every literal-valued field the same values.
 *
 * Each side is held by a different tool. A pin is declared against
 * the TYPE, so the compiler refuses it until it matches; the tests
 * compare the SCHEMA to the pin at run time. A drift on either side
 * is therefore a red `bun qa` — `tsc` for the type, `bun test` for
 * the schema.
 */
import { describe, expect, it } from 'bun:test';
import { SCHEMA_PATH } from './paths.ts';
import type { Entry, FormObject, Sense, Stem } from './types.ts';

/** One JSON Schema node, as far as the parity suite reads it. */
interface SchemaNode {
	$defs?: Record<string, SchemaNode>;
	additionalProperties?: boolean;
	const?: unknown;
	enum?: unknown[];
	items?: SchemaNode;
	properties?: Record<string, SchemaNode>;
	required?: string[];
	type?: string;
}

const schema: SchemaNode = await Bun.file(SCHEMA_PATH).json();

/** Every node of the schema, following only the keywords it uses. */
function* schemaNodes(node: SchemaNode | undefined): Generator<SchemaNode> {
	if (node === undefined) {
		return;
	}
	yield node;
	for (const child of Object.values(node.$defs ?? {})) {
		yield* schemaNodes(child);
	}
	for (const child of Object.values(node.properties ?? {})) {
		yield* schemaNodes(child);
	}
	yield* schemaNodes(node.items);
}

/** Whether each key of `T` is required or optional, as the compiler
 * sees it. Each pin below is declared as this type, so a key added
 * to, dropped from or made optional in the TYPE is a compile error
 * until the pin follows it; the tests then hold the SCHEMA to the
 * pin. */
type Presence<T> = {
	[K in keyof T]-?: object extends Pick<T, K> ? 'optional' : 'required';
};

type Grammar = NonNullable<Entry['grammar']>;
type Page = NonNullable<Entry['page']>;

const ENTRY_KEYS: Presence<Entry> = {
	display: 'optional',
	formerNames: 'optional',
	grammar: 'optional',
	headwords: 'required',
	id: 'required',
	page: 'optional',
	schemaVersion: 'required',
	sefariaHeadword: 'required',
	senses: 'required',
	stems: 'optional',
};

const FORM_KEYS: Presence<FormObject> = {
	disambiguator: 'optional',
	gender: 'optional',
	homograph: 'optional',
	partial: 'optional',
	reconstructed: 'optional',
	text: 'required',
};

const SENSE_KEYS: Presence<Sense> = {
	gloss: 'required',
	label: 'optional',
	senses: 'optional',
	units: 'required',
};

const STEM_KEYS: Presence<Stem> = {
	forms: 'required',
	senses: 'required',
	stem: 'required',
};

const GRAMMAR_KEYS: Presence<Grammar> = {
	gender: 'optional',
	number: 'optional',
	pos: 'optional',
};

const PAGE_KEYS: Presence<Page> = {
	column: 'optional',
	number: 'required',
};

/** Each object the schema declares, beside the pin of its TS type. */
const OBJECTS: [string, SchemaNode | undefined, Record<string, string>][] = [
	['entry', schema, ENTRY_KEYS],
	['headword form', schema.$defs?.['formObject'], FORM_KEYS],
	['sense', schema.$defs?.['sense'], SENSE_KEYS],
	['stem', schema.properties?.['stems']?.items, STEM_KEYS],
	['grammar', schema.properties?.['grammar'], GRAMMAR_KEYS],
	['page', schema.properties?.['page'], PAGE_KEYS],
];

/** The values a literal-typed field allows, as strings: `${T}` turns
 * `true` into `'true'` and `2` into `'2'`, so one record shape pins a
 * string enum, a boolean and a number const alike. `satisfies` holds a
 * pin to the TS union both ways — a missing member and an extra one
 * are compile errors. A field widened to bare `string`, `number` or
 * `boolean` resolves to `never`, so its pin stops compiling instead of
 * passing as a record of any key. */
type Literal<T extends boolean | number | string | undefined> = string extends T
	? never
	: number extends T
		? never
		: boolean extends T
			? never
			: Record<`${NonNullable<T>}`, true>;

const form: Record<string, SchemaNode> | undefined =
	schema.$defs?.['formObject']?.properties;
const grammar: Record<string, SchemaNode> | undefined =
	schema.properties?.['grammar']?.properties;

const LITERALS: [string, SchemaNode | undefined, Record<string, true>][] = [
	[
		'schemaVersion',
		schema.properties?.['schemaVersion'],
		{ 2: true } satisfies Literal<Entry['schemaVersion']>,
	],
	[
		'headword form gender',
		form?.['gender'],
		{ f: true, m: true } satisfies Literal<FormObject['gender']>,
	],
	[
		'partial',
		form?.['partial'],
		{ true: true } satisfies Literal<FormObject['partial']>,
	],
	[
		'reconstructed',
		form?.['reconstructed'],
		{ true: true } satisfies Literal<FormObject['reconstructed']>,
	],
	[
		'grammar.gender',
		grammar?.['gender'],
		{ c: true, f: true, m: true } satisfies Literal<Grammar['gender']>,
	],
	[
		'grammar.number',
		grammar?.['number'],
		{ du: true, pl: true } satisfies Literal<Grammar['number']>,
	],
	[
		'page.column',
		schema.properties?.['page']?.properties?.['column'],
		{ a: true, b: true } satisfies Literal<Page['column']>,
	],
];

/** What a schema node lets a value be, if it names the values at all. */
function allowedValues(node: SchemaNode): string[] | undefined {
	if (node.enum !== undefined) {
		return node.enum.map(String);
	}
	if ('const' in node) {
		return [String(node.const)];
	}
	return node.type === 'boolean' ? ['false', 'true'] : undefined;
}

describe('entry.schema.json agrees with the Entry type', () => {
	it('pins every object the schema declares, and nothing else', () => {
		const objects = [...schemaNodes(schema)].filter((n) => n.type === 'object');
		const pinned = OBJECTS.map(([, node]) => node);
		expect(objects).toHaveLength(OBJECTS.length);
		for (const node of objects) {
			expect(pinned).toContain(node);
		}
	});

	it.each(OBJECTS)('%s: same keys, same required keys', (_name, node, pin) => {
		expect(node?.additionalProperties).toBe(false);
		expect(Object.keys(node?.properties ?? {}).toSorted()).toEqual(
			Object.keys(pin).toSorted(),
		);
		expect((node?.required ?? []).toSorted()).toEqual(
			Object.keys(pin)
				.filter((key) => pin[key] === 'required')
				.toSorted(),
		);
	});

	it('pins every field the schema holds to literal values', () => {
		const literal = [...schemaNodes(schema)].filter(
			(n) => allowedValues(n) !== undefined,
		);
		const pinned = LITERALS.map(([, node]) => node);
		expect(literal).toHaveLength(LITERALS.length);
		for (const node of literal) {
			expect(pinned).toContain(node);
		}
	});

	it.each(LITERALS)('%s: same values', (_name, node, pin) => {
		expect(allowedValues(node ?? {})?.toSorted()).toEqual(
			Object.keys(pin).toSorted(),
		);
	});
});
