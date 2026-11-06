/**
 * The canonical form the fetch writes (ruling 11-05 canonical fetch):
 * object keys sorted by code unit at every depth, arrays in their own
 * order (integer-like keys first, numerically: a JS rule), entries
 * sorted by rid. The bytes depend on the data alone, so
 * fetching an unchanged export gives identical files and `git diff`
 * names only the entries that changed.
 */
import { byCodeUnit } from '../entry/order.ts';

/** `value` with every object's keys in code-unit order, recursively.
 * Integer-like keys come first, in numeric order (a JS rule), which
 * the data alone still fixes. Arrays keep their order: sense and ref
 * order are data. */
function sortKeys(value: unknown): unknown {
	if (Array.isArray(value)) {
		return value.map(sortKeys);
	}
	if (value !== null && typeof value === 'object') {
		const object = value as Record<string, unknown>;
		return Object.fromEntries(
			Object.keys(object)
				.sort(byCodeUnit)
				.map((key) => [key, sortKeys(object[key])]),
		);
	}
	return value;
}

/** JSON text of an already EJSON-serialized `value` with sorted keys;
 * `indent` as `JSON.stringify` takes it. */
function canonicalJson(value: unknown, indent?: string): string {
	return JSON.stringify(sortKeys(value), undefined, indent);
}

/** A copy of `docs` sorted by rid in code-unit order. */
function sortByRid<T extends { rid: string }>(docs: readonly T[]): T[] {
	return [...docs].sort((a, b) => byCodeUnit(a.rid, b.rid));
}

/** `doc` unchanged if its `rid` is a string; throws otherwise, so a
 * rid-less document cannot make the sort inconsistent. */
function requireRid<T extends Record<string, unknown>>(
	doc: T,
): T & { rid: string } {
	if (typeof doc['rid'] !== 'string') {
		throw new Error(`lexicon_entry ${String(doc['_id'])} has no string rid`);
	}
	return doc as T & { rid: string };
}

export { canonicalJson, requireRid, sortByRid, sortKeys };
