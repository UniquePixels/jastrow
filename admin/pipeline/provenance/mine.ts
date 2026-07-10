/**
 * Edit mining (provenance investigation, spec 1.3). Question: what
 * changed in the deployed data over v1's lifetime? Walks main's history of the
 * deployed JSONL oldest→newest and reconstructs every manual edit into
 * data/source/edit-replay.jsonl, each record stamped with its commit
 * and committer date. The first commit touching the files is the
 * baseline import, not an edit, so it is skipped — both files were
 * created together in that commit and have never been renamed
 * (verified against 8c10b59; main is frozen, so this cannot change).
 */
import { type EditRecord, parseJsonlDiff } from './parse-jsonl-diff.ts';

const OUT_PATH = 'data/source/edit-replay.jsonl';
const DEPLOYED_FILES = ['data/jastrow-part1.jsonl', 'data/jastrow-part2.jsonl'];

interface EditCommit {
	date: string;
	sha: string;
}

interface MinedEdit extends EditRecord {
	commit: string;
	date: string;
}

async function git(args: string[]): Promise<string> {
	const proc = Bun.spawn(['git', ...args], { stderr: 'pipe' });
	const text = await new Response(proc.stdout).text();
	if ((await proc.exited) !== 0) {
		throw new Error(
			`git ${args.join(' ')} failed: ${await new Response(proc.stderr).text()}`,
		);
	}
	return text;
}

async function editCommits(): Promise<EditCommit[]> {
	const log = await git([
		'log',
		'--format=%H%x09%cI',
		'--reverse',
		'origin/main',
		'--',
		...DEPLOYED_FILES,
	]);
	return log
		.trim()
		.split('\n')
		.filter(Boolean)
		.map((line) => {
			const [sha, date] = line.split('\t');
			if (sha === undefined || date === undefined) {
				throw new Error(`unparseable log line: ${line}`);
			}
			return { sha, date };
		});
}

const minedRef = (await git(['rev-parse', 'origin/main'])).trim();
console.log(`mining origin/main @ ${minedRef}`);

const commits: EditCommit[] = await editCommits();
const mined: MinedEdit[] = [];
for (const [i, { sha, date }] of commits.entries()) {
	if (i === 0) {
		continue; // baseline import, not an edit
	}
	const diff = await git(['diff', `${sha}^`, sha, '--', ...DEPLOYED_FILES]);
	for (const record of parseJsonlDiff(diff)) {
		mined.push({ commit: sha, date, ...record });
	}
}

await Bun.write(
	OUT_PATH,
	`${mined.map((edit) => JSON.stringify(edit)).join('\n')}\n`,
);
console.log(`edits=${mined.length} commits=${commits.length - 1}`);
console.log(`replay set written to ${OUT_PATH}`);
