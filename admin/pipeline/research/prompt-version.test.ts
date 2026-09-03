/**
 * The sweep prompt and the constant that labels its output are two
 * files, and nothing but this test connects them.
 *
 * `PROMPT_VERSION` is copied verbatim into every patch a chunk
 * produces, and `verify.ts` rejects a patch whose value does not match
 * the ingest context's. So a bump that moves the constant without
 * writing the document — or writes a document the constant never
 * points at — mislabels a whole tranche with a version whose text
 * says something else, and every gate downstream still passes: the
 * schema asks only for a non-empty string.
 */
import { expect, it } from 'bun:test';
import { PROMPT_VERSION } from './corpus-inputs.ts';

const PROMPTS = 'admin/pipeline/research/prompts';

/** The `- **Version:** \`vN\`` line the prompt opens with. */
const VERSION_LINE = /^- \*\*Version:\*\* `(?<version>v\d+)`/mu;
/** Its title, which repeats the same version. */
const TITLE_LINE = /^# Sweep Agent Prompt — (?<version>v\d+)$/mu;

async function promptText(): Promise<string> {
	return await Bun.file(`${PROMPTS}/sweep-${PROMPT_VERSION}.md`).text();
}

it('the constant names a prompt document that exists', async () => {
	expect(await Bun.file(`${PROMPTS}/sweep-${PROMPT_VERSION}.md`).exists()).toBe(
		true,
	);
});

it('that document declares the same version in its header', async () => {
	const found = VERSION_LINE.exec(await promptText())?.groups?.['version'];
	// Asserted against `undefined` first: a regex that stopped matching
	// would otherwise make the equality below compare two absences and
	// pass on a prompt with no version line at all.
	expect(found).toBeDefined();
	expect(found).toBe(PROMPT_VERSION);
});

it('and in its title', async () => {
	const found = TITLE_LINE.exec(await promptText())?.groups?.['version'];
	expect(found).toBeDefined();
	expect(found).toBe(PROMPT_VERSION);
});

it('supersedes the version before it, so the chain is unbroken', async () => {
	const n = Number(PROMPT_VERSION.slice(1));
	expect(n).toBeGreaterThan(1);
	const previous = `v${n - 1}`;
	expect(await Bun.file(`${PROMPTS}/sweep-${previous}.md`).exists()).toBe(true);
	expect(await promptText()).toContain(
		`[sweep-${previous}.md](sweep-${previous}.md)`,
	);
});
