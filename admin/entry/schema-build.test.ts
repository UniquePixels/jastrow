import { describe, expect, it } from 'bun:test';
import { isCurrent, schemaText } from './schema-build.ts';

/** Every keyword JSON Schema 2020-12 defines (core, applicator,
 * unevaluated, validation, meta-data, format-annotation and content
 * vocabularies). A key outside this list constrains nothing: a
 * validator skips it, and `tsc` lets it through, because TypeBox's
 * options accept any key. */
const KEYWORDS: ReadonlySet<string> = new Set([
	'$anchor',
	'$comment',
	'$defs',
	'$dynamicAnchor',
	'$dynamicRef',
	'$id',
	'$ref',
	'$schema',
	'$vocabulary',
	'additionalProperties',
	'allOf',
	'anyOf',
	'const',
	'contains',
	'contentEncoding',
	'contentMediaType',
	'contentSchema',
	'default',
	'dependentRequired',
	'dependentSchemas',
	'deprecated',
	'description',
	'else',
	'enum',
	'examples',
	'exclusiveMaximum',
	'exclusiveMinimum',
	'format',
	'if',
	'items',
	'maxContains',
	'maximum',
	'maxItems',
	'maxLength',
	'maxProperties',
	'minContains',
	'minimum',
	'minItems',
	'minLength',
	'minProperties',
	'multipleOf',
	'not',
	'oneOf',
	'pattern',
	'patternProperties',
	'prefixItems',
	'properties',
	'propertyNames',
	'readOnly',
	'required',
	'then',
	'title',
	'type',
	'unevaluatedItems',
	'unevaluatedProperties',
	'uniqueItems',
	'writeOnly',
]);

/** Keywords whose value is a map of name to subschema. */
const SCHEMA_MAPS = new Set([
	'$defs',
	'dependentSchemas',
	'patternProperties',
	'properties',
]);

/** Keywords whose value is a list of subschemas. */
const SCHEMA_LISTS = new Set(['allOf', 'anyOf', 'oneOf', 'prefixItems']);

/** Keywords whose value is one subschema. */
const SCHEMA_ONE = new Set([
	'additionalProperties',
	'contains',
	'contentSchema',
	'else',
	'if',
	'items',
	'not',
	'propertyNames',
	'then',
	'unevaluatedItems',
	'unevaluatedProperties',
]);

type Node = Record<string, unknown>;

function isNode(value: unknown): value is Node {
	return typeof value === 'object' && value !== null && !Array.isArray(value);
}

/** The subschemas under one keyword, each with its path suffix: the
 * values of a map keyword, the items of a list keyword, or the one
 * value of a single-schema keyword. Anything else holds no schema. */
function subschemas(key: string, value: unknown): [string, unknown][] {
	if (SCHEMA_MAPS.has(key) && isNode(value)) {
		return Object.entries(value);
	}
	if (SCHEMA_LISTS.has(key) && Array.isArray(value)) {
		return value.map((sub, i): [string, unknown] => [String(i), sub]);
	}
	return SCHEMA_ONE.has(key) ? [['', value]] : [];
}

/** Every key in a keyword position of `schema` that is not a 2020-12
 * keyword, with the path to it. Property names under `properties` and
 * `$defs` are names, not keywords, and are not checked. */
function unknownKeywords(schema: unknown, path = '#'): string[] {
	if (!isNode(schema)) {
		return [];
	}
	const found: string[] = [];
	for (const [key, value] of Object.entries(schema)) {
		const at = `${path}/${key}`;
		if (!KEYWORDS.has(key)) {
			found.push(at);
		}
		for (const [suffix, sub] of subschemas(key, value)) {
			found.push(
				...unknownKeywords(sub, suffix === '' ? at : `${at}/${suffix}`),
			);
		}
	}
	return found;
}

describe('schema-build', () => {
	it('accepts its own output, however it is spaced', () => {
		const text = schemaText();
		expect(isCurrent(text)).toBe(true);
		expect(isCurrent(JSON.stringify(JSON.parse(text)))).toBe(true);
	});

	it('refuses a changed value', () => {
		const schema = JSON.parse(schemaText());
		schema.title = 'edited by hand';
		expect(isCurrent(JSON.stringify(schema))).toBe(false);
	});

	it('refuses text that is not JSON', () => {
		expect(isCurrent(`<<<<<<< HEAD\n${schemaText()}`)).toBe(false);
	});

	it('refuses a reordered key', () => {
		const { $schema, ...rest } = JSON.parse(schemaText());
		expect(isCurrent(JSON.stringify({ ...rest, $schema }))).toBe(false);
	});
});

describe('the generated schema', () => {
	it('uses only JSON Schema 2020-12 keywords', () => {
		expect(unknownKeywords(JSON.parse(schemaText()))).toEqual([]);
	});

	it('finds a misspelt keyword, however deep', () => {
		const schema = JSON.parse(schemaText());
		schema.$defs.sense.properties.label.minLenght = 1;
		schema.properties.grammar.dependentRequried = {};
		expect(unknownKeywords(schema)).toEqual([
			'#/properties/grammar/dependentRequried',
			'#/$defs/sense/properties/label/minLenght',
		]);
	});
});
