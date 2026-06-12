/**
 * Structural schema for a dictionary entry.
 *
 * Validates the invariants the browser app relies on when it loads the
 * JSONL into IndexedDB (`assets/scripts/data-loader.js`): every entry must
 * have a string headword (`hw`, normalized for the headword index), a
 * unique id (`id`, the `ridIndex` key and `#rid:` route target), and a
 * content object whose `s` is an array of senses. Optional fields are
 * type-checked only when present, so the schema stays permissive about
 * which optional fields a given entry carries.
 *
 * Hand-rolled rather than JSON-Schema-via-ajv to keep the validator
 * dependency-free and to emit field-path messages that match the HTML
 * validator's (`entry-html.ts`) style. It is the single source of truth
 * for entry structure, shared by the `validate:data` CI gate (T8).
 *
 * It only checks structure — HTML content of `c.s[].d` / `li` is validated
 * separately by `findEntryViolations` in `entry-html.ts`.
 */

// One letter followed by five digits, e.g. "A00000". Matches every id in
// the live corpus (audited 2026-06-08); the data has no entry-creation path
// that could introduce another shape.
export const ID_RE = /^[A-Za-z]\d{5}$/u;

export interface SchemaViolation {
	detail: string;
	path: string;
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
	return typeof value === 'object' && value !== null && !Array.isArray(value);
}

// Optional top-level fields grouped by the type each must hold when present.
// Types reflect an audit of the live corpus (2026-06-08): `ah`/`pf`/`q` are
// arrays, `g`/`rf` are objects, the rest are strings.
const OPTIONAL_STRING_FIELDS = ['nh', 'ph', 'col', 'li'] as const;
const OPTIONAL_ARRAY_FIELDS = ['ah', 'pf', 'q'] as const;
const OPTIONAL_OBJECT_FIELDS = ['g', 'rf'] as const;

function validateSenses(
	senses: unknown,
	path: string,
	out: SchemaViolation[],
): void {
	if (!Array.isArray(senses)) {
		out.push({ path, detail: 'must be an array' });
		return;
	}
	senses.forEach((sense, i) => {
		const base = `${path}[${i}]`;
		if (!isPlainObject(sense)) {
			out.push({ path: base, detail: 'must be an object' });
			return;
		}
		for (const key of ['d', 'n'] as const) {
			if (key in sense && typeof sense[key] !== 'string') {
				out.push({ path: `${base}.${key}`, detail: 'must be a string' });
			}
		}
		if ('g' in sense && !isPlainObject(sense['g'])) {
			out.push({ path: `${base}.g`, detail: 'must be an object' });
		}
		if ('s' in sense) {
			validateSenses(sense['s'], `${base}.s`, out);
		}
	});
}

/**
 * Find every structural violation in a single parsed entry. Returns [] for a
 * valid entry. Caller is responsible for JSON-parse errors and cross-entry id
 * uniqueness (see `validate-data.ts`).
 */
export function validateEntry(entry: unknown): SchemaViolation[] {
	const out: SchemaViolation[] = [];
	if (!isPlainObject(entry)) {
		return [{ path: '', detail: 'entry must be a JSON object' }];
	}

	if (typeof entry['id'] !== 'string' || entry['id'].length === 0) {
		out.push({ path: 'id', detail: 'required non-empty string' });
	} else if (!ID_RE.test(entry['id'])) {
		out.push({ path: 'id', detail: `must match ${ID_RE.source}` });
	}

	if (typeof entry['hw'] !== 'string' || entry['hw'].length === 0) {
		out.push({ path: 'hw', detail: 'required non-empty string' });
	}

	if ('p' in entry && typeof entry['p'] !== 'number') {
		out.push({ path: 'p', detail: 'must be a number' });
	}

	for (const field of OPTIONAL_STRING_FIELDS) {
		if (field in entry && typeof entry[field] !== 'string') {
			out.push({ path: field, detail: 'must be a string' });
		}
	}

	for (const field of OPTIONAL_ARRAY_FIELDS) {
		if (field in entry && !Array.isArray(entry[field])) {
			out.push({ path: field, detail: 'must be an array' });
		}
	}

	for (const field of OPTIONAL_OBJECT_FIELDS) {
		if (field in entry && !isPlainObject(entry[field])) {
			out.push({ path: field, detail: 'must be an object' });
		}
	}

	const content = entry['c'];
	if (isPlainObject(content)) {
		validateSenses(content['s'], 'c.s', out);
	} else {
		out.push({ path: 'c', detail: 'required object' });
	}

	return out;
}
