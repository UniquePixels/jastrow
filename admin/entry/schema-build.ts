/**
 * `bun schema:build` writes `data/schema/entry.schema.json` from
 * `schema.ts`; `bun schema:check` (`--check`) fails when the committed
 * file is not what `schema.ts` produces (ruling `11-05 schema source`).
 *
 * The JSON file is generated and committed: an editor reads it for
 * IntelliSense on an entry file, and a reader that is not TypeScript
 * reads it as the contract. It is never edited by hand; a change is a
 * change to `schema.ts` and a rebuild. The check compares structure and
 * key order, not whitespace, which is Biome's to settle.
 */
import process from 'node:process';
import { biomeBinary } from './format.ts';
import { SCHEMA_PATH } from './paths.ts';
import { EntrySchema } from './schema.ts';

/** The schema as written to the file: its header (`$schema`, `$id`,
 * `title`, `description`) first, where a reader opening the file looks
 * for it, then everything else in TypeBox's order. Key order only;
 * the schema is `EntrySchema` unchanged. */
function fileSchema(): Record<string, unknown> {
	const header = ['$schema', '$id', 'title', 'description'];
	const inHeader = new Set(header);
	const keys = Object.keys(EntrySchema);
	const order = [...header, ...keys.filter((key) => !inHeader.has(key))];
	const schema: Readonly<Record<string, unknown>> = { ...EntrySchema };
	return Object.fromEntries(order.map((key) => [key, schema[key]]));
}

/** The schema as JSON text, before Biome formats it. */
function schemaText(): string {
	return `${JSON.stringify(fileSchema(), null, '\t')}\n`;
}

/** Whether `committed` (the file's text) holds what `schema.ts`
 * produces: the same keys, values and key order, however it is
 * spaced. Text that is not JSON — a merge conflict, a broken hand
 * edit — is not current either. */
function isCurrent(committed: string): boolean {
	try {
		return (
			JSON.stringify(JSON.parse(committed)) === JSON.stringify(fileSchema())
		);
	} catch {
		return false;
	}
}

/** Write the file, or with `--check` only compare it; a stale file or
 * a failed format sets a non-zero exit code. */
async function main(): Promise<void> {
	if (process.argv.includes('--check')) {
		const file = Bun.file(SCHEMA_PATH);
		if (!((await file.exists()) && isCurrent(await file.text()))) {
			console.error(
				`${SCHEMA_PATH} is not what admin/entry/schema.ts produces. Run \`bun schema:build\` and commit the result.`,
			);
			process.exitCode = 1;
		}
		return undefined;
	}
	await Bun.write(SCHEMA_PATH, schemaText());
	const format = Bun.spawnSync(
		[biomeBinary(), 'format', '--write', SCHEMA_PATH],
		{ stderr: 'inherit', stdout: 'inherit' },
	);
	if (format.exitCode === 0) {
		console.log(`wrote ${SCHEMA_PATH}`);
	} else {
		console.error(`biome format exited ${format.exitCode}`);
		process.exitCode = 1;
	}
	return undefined;
}

if (import.meta.main) {
	await main();
}

export { isCurrent, schemaText };
