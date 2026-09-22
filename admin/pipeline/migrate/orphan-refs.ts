/**
 * Gate: every obligated orphan-refs item still has an inline citation
 * basis in its entry's composed body (consolidation spec §4.1, step
 * 8). `REPAIRED_ORPHAN_ITEMS` used to be checked by the archived
 * `migrate-dry.ts`; this module is `migrate.ts`'s replacement check,
 * run on the COMPOSED entries after `composeAll` so it sees whatever
 * transforms and reviewed patches left behind.
 */
import { findCitations } from '../body/cite.ts';
import { walkSensesDeep } from '../body/repairs.ts';
import type { SourceEntry } from '../types.ts';

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

/** `rid: item` for every obligated refs item its composed entry no
 * longer carries an inline citation for, and `rid: (entry missing)`
 * for an obligated rid absent from `entries` — otherwise a rid that
 * dropped out of the composed set would pass the gate vacuously.
 * `obligations` defaults to `REPAIRED_ORPHAN_ITEMS`; tests pass a
 * smaller table. */
function unbasedOrphans(
	entries: readonly SourceEntry[],
	obligations: Readonly<
		Record<string, readonly string[]>
	> = REPAIRED_ORPHAN_ITEMS,
): string[] {
	const lines: string[] = [];
	const byRid = new Map(entries.map((e) => [e.rid, e]));
	for (const [rid, items] of Object.entries(obligations)) {
		const entry = byRid.get(rid);
		if (entry === undefined) {
			lines.push(`${rid}: (entry missing)`);
			continue;
		}
		// Parsed citation anchors only: a `data-ref` on some other element,
		// or in plain text, is not a citation a reader can follow.
		const cited = new Set(
			[...walkSensesDeep(entry.content.senses)].flatMap((s) =>
				findCitations(s.definition ?? '')
					.filter((hit) => !hit.malformed)
					.map((hit) => hit.dataRef),
			),
		);
		for (const item of items) {
			if (!cited.has(item)) {
				lines.push(`${rid}: ${item}`);
			}
		}
	}
	return lines;
}

export { unbasedOrphans };
