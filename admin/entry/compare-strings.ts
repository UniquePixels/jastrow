/**
 * A comparator for sorting objects by a string field, in the same
 * UTF-16 code-unit order a bare `.sort()` gives a list of strings.
 *
 * It exists because JavaScript has no built-in that compares two
 * strings and returns -1, 0 or 1 without a locale; `localeCompare`
 * depends on the runtime's ICU data, so the order it gives can differ
 * between machines. A list of plain strings needs no comparator: sort
 * it with a bare `.sort()` / `.toSorted()`.
 *
 * Here rather than in the pipeline because `admin/entry/` imports
 * nothing else in the repo, so the pipeline and `scripts/` can both
 * import from it.
 */

/** `left` against `right` by UTF-16 code unit, for use as a
 * comparator: `rows.sort((a, b) => compareStrings(a.rid, b.rid))`.
 * Chain keys with `||`. */
function compareStrings(left: string, right: string): -1 | 0 | 1 {
	if (left === right) {
		return 0;
	}
	return left < right ? -1 : 1;
}

export { compareStrings };
