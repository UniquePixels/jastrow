/**
 * The one way a uniqueness check finds its duplicates (ruling
 * `11-07 one comparison rule`): the first item to claim a key keeps it,
 * and every later item claiming it is reported with that owner. Every
 * check that asks "does anything else already hold this?" goes through
 * it, so two checks cannot disagree about which item is the duplicate.
 */

/** A later item whose key an earlier one already holds. */
interface Duplicate<T> {
	item: T;
	owner: T;
}

/** Every item whose key an earlier item already holds, in the order
 * given. `keyOf` is the whole of what "the same" means for the caller:
 * pass a key in its final form (a name path, a comparison form), since
 * nothing here normalizes it. */
function findDuplicates<T>(
	items: Iterable<T>,
	keyOf: (item: T) => string,
): Duplicate<T>[] {
	const owners = new Map<string, T>();
	const duplicates: Duplicate<T>[] = [];
	for (const item of items) {
		const key = keyOf(item);
		const owner = owners.get(key);
		if (owner === undefined) {
			owners.set(key, item);
		} else {
			duplicates.push({ item, owner });
		}
	}
	return duplicates;
}

export type { Duplicate };
export { findDuplicates };
