/**
 * ISO calendar dates. The one rule every admin module holds a
 * `YYYY-MM-DD` value to: an annotation's `date` (the entry contract),
 * a patch's `date` and `annotation.date`, and the Sefaria appendix's
 * dates.
 */

/** `YYYY-MM-DD`, the shape alone; whether the day exists is
 * `isIsoDate`'s second half. */
const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/u;

/** Whether `value` is an ISO calendar date: the `YYYY-MM-DD` shape,
 * and a day the calendar has (`2026-02-30` has the shape and is not
 * one). */
function isIsoDate(value: string): boolean {
	if (!ISO_DATE.test(value)) {
		return false;
	}
	const day = new Date(`${value}T00:00:00Z`);
	return !Number.isNaN(day.getTime()) && day.toISOString().startsWith(value);
}

export { isIsoDate };
