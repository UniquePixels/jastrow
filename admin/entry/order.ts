/**
 * The one string order the repo sorts by. Every sorted list a gate,
 * a report or a rule writes has to come out the same on every machine
 * and every run, and a locale collation cannot promise that; this
 * comparator can. One home (third review, 2026-10-31): the pipeline
 * and `scripts/` import it from here, `admin/entry/` may import
 * nothing from them.
 */

/**
 * Two strings ordered by UTF-16 code unit.
 *
 * EXPLICIT, AND NOT `localeCompare`, WHICH IS WHAT SONAR'S S2871
 * SUGGESTS. The sort below exists to make a rule's declarations
 * REPRODUCIBLE — the same entry must yield the same claim list on every
 * machine and every run — and a locale-sensitive comparator is the one
 * thing that cannot promise that: its order for Hebrew depends on the
 * ICU data the runtime happens to carry. Code-unit order is total,
 * stable and environment-independent, which is the whole requirement.
 */
function byCodeUnit(left: string, right: string): -1 | 0 | 1 {
	if (left === right) {
		return 0;
	}
	return left < right ? -1 : 1;
}

export { byCodeUnit };
