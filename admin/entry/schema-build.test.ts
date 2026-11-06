import { describe, expect, it } from 'bun:test';
import { isCurrent, schemaText } from './schema-build.ts';

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

	it('refuses a reordered key', () => {
		const { $schema, ...rest } = JSON.parse(schemaText());
		expect(isCurrent(JSON.stringify({ ...rest, $schema }))).toBe(false);
	});
});
