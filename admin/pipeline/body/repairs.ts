/**
 * The general migration repairs, approved by the maintainer body
 * review (`docs/archive/body-review/01–06`). Pure: takes a
 * `SourceEntry`, returns a repaired copy plus a record of every
 * change. `compose.ts` runs it first in the `text-repairs` phase.
 *
 * CORPUS-WIDE REPAIRS ONLY. A repair keyed on a rid belongs in
 * `data/patches/reviewed/` instead (spec §4.1), where its `rationale`
 * field carries the reasoning a table here could not. `walkSensesDeep`
 * lives here and is shared with `migrate/orphan-refs.ts`.
 */
import type { SourceEntry, SourceSense } from './types.ts';

/** Which repair pass produced a `RepairRecord`. A closed union rather
 * than a free string, so a corpus-wide pass has to be named here
 * before it can record anything — and a repair keyed on a single rid,
 * which belongs in `data/patches/reviewed/` (spec §4.1) instead, can
 * never quietly acquire a name in this file. */
type PassName = 'binyan-cleanup';

/** One change `applyRepairs` made: which pass made it, the rid it was
 * made on, and a human-readable `detail` of what changed. The passes
 * edit upstream data, so none of them is allowed to be silent — these
 * records are the trail a reviewer reads the corpus-wide repairs back
 * from. */
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
 * (spec §4.1). */
function applyRepairs(source: SourceEntry): {
	entry: SourceEntry;
	records: RepairRecord[];
} {
	const entry = structuredClone(source);
	const records: RepairRecord[] = [];
	cleanBinyanForms(entry, records);
	return { entry, records };
}

export type { PassName, RepairRecord };
export { applyRepairs, cleanBinyanForms, walkSensesDeep };
