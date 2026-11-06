/**
 * The comparator every string sort in the repo passes: UTF-16
 * code-unit order, the same on every machine and every run.
 *
 * Every `.sort()` / `.toSorted()` takes a compare function (Biome's
 * `useArraySortCompare`, Sonar's S2871). Without one, JavaScript turns
 * each element into a string before comparing, so a list that stops
 * being strings sorts wrongly without an error: `[10, 9, 1].sort()` is
 * `[1, 10, 9]`. Passing this function instead keeps the type checked,
 * because `tsc` rejects it on anything but strings.
 *
 * Code-unit order, not `localeCompare`: a locale's collation depends on
 * the runtime's ICU data and default locale, so the order of a gate's
 * list, a committed report or the patch application could differ
 * between machines.
 *
 * Here rather than in the pipeline because `admin/entry/` imports
 * nothing else in the repo, so the pipeline and `scripts/` can both
 * import from it.
 */

/** `left` against `right` by UTF-16 code unit. Pass it straight to a
 * sort (`ids.sort(compareByCodeUnit)`), or per field for objects, chained
 * with `||`: `(a, b) => compareByCodeUnit(a.shape, b.shape) ||
 * compareByCodeUnit(a.rid, b.rid)`. */
function compareByCodeUnit(left: string, right: string): -1 | 0 | 1 {
	if (left === right) {
		return 0;
	}
	return left < right ? -1 : 1;
}

export { compareByCodeUnit };
