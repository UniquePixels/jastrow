/**
 * Divergence comparator (spec 1.2): quantifies, entry by entry, how the
 * legacy extraction in main's data/raw differs from the fresh source.
 */

interface SourceEntry {
	content?: { senses?: unknown[] };
	headword: string;
	rid: string;
	[key: string]: unknown;
}

interface ChangedEntry {
	fields: string[];
	rid: string;
}

interface CompareResult {
	changed: ChangedEntry[];
	onlyInFresh: string[];
	onlyInRaw: string[];
}

const stable = (v: unknown): string => JSON.stringify(v ?? null);

const COMPARED_FIELDS = ['headword', 'alt_headwords'] as const;

/** Entry minus the named fields, for the remainder comparison. */
function remainder(entry: SourceEntry): Record<string, unknown> {
	return Object.fromEntries(
		Object.entries(entry).filter(
			([key]) => !COMPARED_FIELDS.includes(key as never),
		),
	);
}

/** Names of the fields on which two versions of an entry differ. */
function diffFields(fresh: SourceEntry, raw: SourceEntry): string[] {
	const fields: string[] = [];
	for (const field of COMPARED_FIELDS) {
		if (stable(fresh[field]) !== stable(raw[field])) {
			fields.push(field);
		}
	}
	const freshSenses = fresh.content?.senses?.length ?? 0;
	const rawSenses = raw.content?.senses?.length ?? 0;
	if (freshSenses !== rawSenses) {
		fields.push('senseCount');
	}
	// Compare the untracked remainder independently — a named-field
	// change must not mask additional drift elsewhere in the entry.
	if (stable(remainder(fresh)) !== stable(remainder(raw))) {
		fields.push('other');
	}
	return fields;
}

function compareEntryMaps(
	fresh: Map<string, SourceEntry>,
	raw: Map<string, SourceEntry>,
): CompareResult {
	const byRid = (a: string, b: string): number => a.localeCompare(b);
	const onlyInFresh = [...fresh.keys()]
		.filter((rid) => !raw.has(rid))
		.sort(byRid);
	const onlyInRaw = [...raw.keys()]
		.filter((rid) => !fresh.has(rid))
		.sort(byRid);
	const changed: ChangedEntry[] = [];
	for (const [rid, freshEntry] of fresh) {
		const rawEntry = raw.get(rid);
		if (!rawEntry) {
			continue;
		}
		const fields = diffFields(freshEntry, rawEntry);
		if (fields.length > 0) {
			changed.push({ rid, fields });
		}
	}
	changed.sort((a, b) => a.rid.localeCompare(b.rid));
	return { onlyInFresh, onlyInRaw, changed };
}

export type { ChangedEntry, CompareResult, SourceEntry };
export { compareEntryMaps };
