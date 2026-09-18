/**
 * The general migration repairs (entry-body-model plan Task 16;
 * maintainer review 2026-08-05, docs/archive/body-review/01–06). Pure:
 * takes a SourceEntry, returns a repaired copy plus a record of every
 * change. `compose.ts` runs it first in the `text-repairs` phase.
 *
 * Only corpus-wide repairs live here now. The rid-keyed repairs (the
 * 01 chopped-crossref rejoins, implied `1)` labels, marker reinserts,
 * the 04 label repairs, the 02 cite wraps and refs removals) moved to
 * reviewed patches in `data/patches/reviewed/` in consolidation step 8
 * (spec §4.1); their `rationale` fields carry the deviation register
 * this header used to hold (implied `1)` labels, D00341's bracket
 * move). Git history keeps the old tables.
 *
 * `REPAIRED_ORPHAN_ITEMS` still lives here until step 8 moves it.
 */
import type { SourceEntry, SourceSense } from './types.ts';

type PassName = 'binyan-cleanup';

interface RepairRecord {
	detail: string;
	pass: PassName;
	rid: string;
}

/** Depth-first walk of a source-sense tree (stem children included) —
 * the shared walker migrate-dry imported too. */
function* walkSensesDeep(list: SourceSense[]): Generator<SourceSense> {
	for (const sense of list) {
		yield sense;
		if (sense.senses) {
			yield* walkSensesDeep(sense.senses);
		}
	}
}

/** Drop empty strings and trim stray spaces in binyan_form arrays
 * (06 decision; upstream-issues #9/#17). Corpus-wide, not rid-keyed. */
function cleanBinyanForms(entry: SourceEntry, records: RepairRecord[]): void {
	for (const sense of walkSensesDeep(entry.content.senses)) {
		const forms = sense.grammar?.binyan_form;
		if (forms === undefined || sense.grammar === undefined) {
			continue;
		}
		const cleaned = forms.map((f) => f.trim()).filter((f) => f !== '');
		const dropped = forms.length - cleaned.length;
		const trimmed = forms.filter((f) => f !== f.trim() && f.trim() !== '');
		if (dropped === 0 && trimmed.length === 0) {
			continue;
		}
		sense.grammar.binyan_form = cleaned;
		records.push({
			detail: `binyan_form: dropped ${dropped} empty, trimmed ${trimmed.length}`,
			pass: 'binyan-cleanup',
			rid: entry.rid,
		});
	}
}

/** Apply the general repairs to (a deep copy of) `source`. Pure. The
 * rid-keyed repairs that lived here moved to `data/patches/reviewed/`
 * in consolidation step 8 (spec §4.1). */
function applyRepairs(source: SourceEntry): {
	entry: SourceEntry;
	records: RepairRecord[];
} {
	const entry = structuredClone(source);
	const records: RepairRecord[] = [];
	cleanBinyanForms(entry, records);
	return { entry, records };
}

/** The orphan refs items each repaired entry's body must now carry an
 * inline citation basis for (migrate-dry's former resolution recount).
 * P00331's two finer-grained refs items (Eruvin 88b:17, 88b:22) are absorbed by
 * the one `Ib. 88ᵇ` wrap (now a reviewed patch) — same page citation — and are not expected to
 * match an anchor of their own.
 *
 * The first 21 are the retired class-1 escapes (maintainer ruling
 * 2026-08-24; docs/specs/2026-08-24-gershayim-transform-design.md,
 * docs/archive/transform-batch-3a.md §7). They are written out with the GERSHAYIM `״` rather than the
 * ASCII `"` their `refs[]` items carry, because the basis is now
 * supplied by `ascii-quote-as-gershayim-in-body` /
 * `gershayim-breaks-ref-attribute` rather than by an escape, and the
 * recount runs on the transformed entry. Keeping them listed is the
 * point: the escape retired, the OBLIGATION did not, so if the
 * transform ever stops reaching one of these anchors this gate says so
 * instead of the item quietly going orphan again. */
const REPAIRED_ORPHAN_ITEMS: Record<string, string[]> = {
	A01069: ['Jastrow, א״ט 1'],
	A01940: ['Jastrow, אלפ״א 1'],
	B00752: ['Jastrow, בי״ת 1'],
	B00757: ['Jastrow, בי״ת 1'],
	C00473: ['Jastrow, ג״ר 1'],
	C01036: ['Jastrow, גימ״ל 1'],
	C01224: ['Jastrow, א״ת 1'],
	C01225: ['Jastrow, ג״ר 1'],
	D00791: ['Jastrow, אח״ס 1'],
	E00326: ['Jastrow, ה״א 1'],
	E00686: ['Jastrow, ה״א 1'],
	J00083: ['Jastrow, יג״ל 1'],
	M01200: ['Jastrow, מ״ם 1'],
	M01490: ['Jastrow, דל״ה 1'],
	M01690: ['Jastrow, אאלר״ן 1'],
	N00910: ['Jastrow, אאלר״ן 1'],
	P00169: ['Jastrow, דצ״ך 1'],
	P00600: ['Jastrow, עיי״ן 1'],
	Q00002: ['Jastrow, פ״ה 1'],
	U02063: ['Jastrow, א״ת 1'],
	V00042: ['Jastrow, תבש״ט 1'],
	P00331: ['Eruvin 88b:1'],
	P01404: ['Targum Jerusalem, Exodus 21:18'],
	S01230: ['Yoma 85b:14'],
};

export type { PassName, RepairRecord };
export {
	applyRepairs,
	cleanBinyanForms,
	REPAIRED_ORPHAN_ITEMS,
	walkSensesDeep,
};
