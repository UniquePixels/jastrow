/**
 * Writes `data/schema/entry.schema.json` from `EntrySchema`, or with
 * `--check` verifies that the committed file is current.
 *
 * Run: bun schema:build | bun schema:check
 */
import { join } from 'node:path';
import process from 'node:process';
import { paths } from '../paths.ts';
import { EntrySchema } from './schema.ts';

/** The path of the generated schema file. */
const SCHEMA_PATH = join(paths.root, 'data', 'schema', 'entry.schema.json');

/**
 * Orders `EntrySchema` for the file: `$schema`, `$id`, `title` and
 * `description` first, then the remaining keys in their own order.
 *
 * @returns The schema with its keys in file order.
 */
function fileSchema(): Record<string, unknown> {
	const header = ['$schema', '$id', 'title', 'description'];
	const inHeader = new Set(header);
	const keys = Object.keys(EntrySchema);
	const order = [...header, ...keys.filter((key) => !inHeader.has(key))];
	const schema: Readonly<Record<string, unknown>> = { ...EntrySchema };
	return Object.fromEntries(order.map((key) => [key, schema[key]]));
}

/**
 * Serializes the schema for the file.
 *
 * @returns The schema as tab-indented JSON with a trailing newline.
 */
function schemaText(): string {
	return `${JSON.stringify(fileSchema(), null, '\t')}\n`;
}

/**
 * Tests whether a schema file matches `EntrySchema`, ignoring
 * whitespace.
 *
 * @param committed - The file's text.
 * @returns Whether the text is JSON with the same keys, values and key
 * order.
 */
function isCurrent(committed: string): boolean {
	try {
		return (
			JSON.stringify(JSON.parse(committed)) === JSON.stringify(fileSchema())
		);
	} catch {
		return false;
	}
}

/**
 * Writes the schema file, or with `--check` sets a non-zero exit code
 * if the committed file is missing or stale.
 */
async function main(): Promise<void> {
	if (process.argv.includes('--check')) {
		const file = Bun.file(SCHEMA_PATH);
		if (!((await file.exists()) && isCurrent(await file.text()))) {
			console.error(
				`${SCHEMA_PATH} is not what admin/validation/schema.ts produces. Run \`bun schema:build\` and commit the result.`,
			);
			process.exitCode = 1;
		}
		return undefined;
	}
	await Bun.write(SCHEMA_PATH, schemaText());
	console.log(`wrote ${SCHEMA_PATH}; run \`bun qa\` to format it`);
	return undefined;
}

if (import.meta.main) {
	await main();
}

export { isCurrent, SCHEMA_PATH, schemaText };
