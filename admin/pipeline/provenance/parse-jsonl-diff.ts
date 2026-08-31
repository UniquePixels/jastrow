/**
 * Unified-diff → edit-record parser (spec 1.3): turns a git diff of
 * the deployed JSONL into replayable edit records keyed by the
 * deployed `id` field. A removed and an added line sharing an id are
 * paired into a single modify.
 */

interface EditRecord {
	after?: string;
	before?: string;
	id: string;
	op: 'add' | 'modify' | 'remove';
}

/** The entry id of a JSONL line, or null for non-entry lines. */
function idOf(line: string): string | null {
	try {
		const doc = JSON.parse(line) as { id?: unknown };
		return typeof doc.id === 'string' ? doc.id : null;
	} catch {
		return null;
	}
}

/** Turn one unified diff over JSONL into id-keyed edit records:
 * removed+added pairs on the same id become `modify`, the rest
 * `add`/`remove`; non-JSON lines are ignored. */
function parseJsonlDiff(diffText: string): EditRecord[] {
	const removed = new Map<string, string>();
	const added = new Map<string, string>();
	for (const line of diffText.split('\n')) {
		// File headers also start with -/+; entry lines never do.
		if (line.startsWith('---') || line.startsWith('+++')) {
			continue;
		}
		const isMinus = line.startsWith('-');
		if (!(isMinus || line.startsWith('+'))) {
			continue;
		}
		const body = line.slice(1);
		const id = idOf(body);
		if (id === null) {
			continue;
		}
		(isMinus ? removed : added).set(id, body);
	}
	const records: EditRecord[] = [];
	for (const [id, before] of removed) {
		const after = added.get(id);
		if (after === undefined) {
			records.push({ id, op: 'remove', before });
		} else {
			records.push({ id, op: 'modify', before, after });
			added.delete(id);
		}
	}
	for (const [id, after] of added) {
		records.push({ id, op: 'add', after });
	}
	records.sort((a, b) => a.id.localeCompare(b.id));
	return records;
}

export type { EditRecord };
export { parseJsonlDiff };
