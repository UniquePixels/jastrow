/**
 * The cite-numeral allowlist (`CITE_NUMERAL_KEPT_PATH`, README beside
 * it): the cites gate 13, `citeNumeral` (`cite-numeral.ts`), keeps
 * although their target lacks the numeral they name. Read here, one
 * JSON object per line; a malformed row throws with its line number,
 * since a row that keeps nothing and says nothing would hide a cite.
 */

/** One allowlist row (`cite-numeral-kept/kept.jsonl`): the cite it
 * keeps (`rid`, `ref`, `cite` text in NFC), why, who read it and when.
 * `pending` marks a genuine mismatch no print read has settled yet,
 * and then `note` says where it is to be read. */
interface CiteNumeralKept {
	cite: string;
	date: string;
	note?: string;
	pending?: true;
	reason: string;
	ref: string;
	rid: string;
	source: string;
}

const REQUIRED = ['cite', 'date', 'reason', 'ref', 'rid', 'source'] as const;
const KNOWN = new Set<string>([...REQUIRED, 'note', 'pending']);

/** One row's problems: a missing or empty field, an unknown key, a
 * `pending` other than `true`, or a pending row with no `note`. */
function rowProblems(value: Record<string, unknown>): string[] {
	const problems = REQUIRED.filter(
		(key) => typeof value[key] !== 'string' || value[key] === '',
	).map((key) => `${key} missing or empty`);
	problems.push(
		...Object.keys(value)
			.filter((key) => !KNOWN.has(key))
			.map((key) => `${key} is not a field`),
	);
	if ('pending' in value && value['pending'] !== true) {
		problems.push('pending, when present, is true');
	}
	if (
		value['pending'] === true &&
		(typeof value['note'] !== 'string' || value['note'] === '')
	) {
		problems.push('a pending row needs a note');
	}
	return problems;
}

/** Read the allowlist: one JSON object per non-blank line. A line that
 * does not parse or breaks the row shape throws with its number. */
function parseCiteNumeralKept(jsonl: string): CiteNumeralKept[] {
	const rows: CiteNumeralKept[] = [];
	for (const [i, line] of jsonl.split('\n').entries()) {
		if (line.trim() === '') {
			continue;
		}
		let value: unknown;
		try {
			value = JSON.parse(line);
		} catch (error) {
			throw new Error(`cite-numeral-kept line ${i + 1}: not JSON`, {
				cause: error,
			});
		}
		if (typeof value !== 'object' || value === null || Array.isArray(value)) {
			throw new Error(`cite-numeral-kept line ${i + 1}: not a JSON object`);
		}
		const problems = rowProblems(value as Record<string, unknown>);
		if (problems.length > 0) {
			throw new Error(
				`cite-numeral-kept line ${i + 1}: ${problems.join('; ')}`,
			);
		}
		rows.push(value as CiteNumeralKept);
	}
	return rows;
}

export type { CiteNumeralKept };
export { parseCiteNumeralKept };
