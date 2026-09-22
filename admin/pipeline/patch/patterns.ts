/**
 * Systemic-pattern catalogue (sweep tiering spec Phase 1).
 *
 * The sweep's product is pattern classes, not patches: one rule
 * derived from a pattern fixes every instance, so sweeping for more
 * instances of a known pattern is wasted spend. This module is the
 * catalogue and the saturation predicate that replaces the retired
 * catchable-miss gate.
 */

/** How a catalogued pattern will be handled. */
type PatternStatus = 'candidate' | 'discarded' | 'scripted';

/** Phase 2 routing (sweep-tiering spec T5): a pattern with a corpus
 * count and no per-entry judgment becomes a deterministic transform,
 * never an LLM task. `blocked` is neither until its predicate is
 * pinned — the count is an output of the rule, not a corpus fact. */
type PatternRoute = 'blocked' | 'judgment' | 'transform';

/** One systemic pattern class. */
interface Pattern {
	/** Holds up the v2 cutover (sweep-tiering spec T6): breaks the
	 * render, or would be baked in by the migration.
	 *
	 * This gates the CUTOVER, not the work. A non-blocking row may still
	 * be fixed now — see `transformQueue` — and false is only a promise
	 * that shipping need not wait for it. */
	blocking?: boolean;
	/** Entries matching corpus-wide, at the time it was catalogued. */
	corpusCount: number;
	description: string;
	/** Rows owning the same records, or contending over the same
	 * objects. A transform touching one MUST account for the others or
	 * it rewrites the same anchors twice (round 4; the catalogue had no
	 * way to say this, which is why the entanglements went unseen).
	 * Symmetric — see `checkEntanglement`. */
	entangledWith?: string[];
	/** Stable kebab-case key. */
	id: string;
	/** The row's audit trail: why it was discarded citing the v2 model,
	 * why it was routed, and why it was kept or dropped as a cutover
	 * blocker. Not confined to `discarded` rows, as this said until step
	 * 11 — `candidate` rows carried one long before, and every row the
	 * step-11 triage ruled records that ruling here. The live record of
	 * that triage, with each recount's predicate and control, is
	 * docs/v2/research-backlog.md; the earlier round is archived at
	 * docs/archive/pattern-triage.md. */
	reason?: string;
	/** Discovery round that first recorded it; 0 for pre-existing. */
	round: number;
	/** How Phase 2 resolves it. Absent until triaged. */
	route?: PatternRoute;
	status: PatternStatus;
}

/** Rounds with no new pattern needed to declare saturation. */
const SATURATION_ROUNDS = 2;

/** Parse the catalogue, rejecting a repeated id the way `addPattern`
 * does. Without this the two entry points disagreed: `addPattern`
 * refused a duplicate, but a file that already held one parsed
 * cleanly, and `checkEntanglement`'s `byId` map then kept only the
 * last row while its own loop visited both — so one row's edges were
 * checked against the other's, and an unregistered or mislinked
 * pattern could pass unseen. Reports every duplicate, not the first,
 * since the catalogue is checked as a whole. */
function parsePatterns(text: string): Pattern[] {
	const rows = text
		.split('\n')
		.filter((line) => line.trim() !== '')
		.map((line) => JSON.parse(line) as Pattern);
	const counts = new Map<string, number>();
	for (const row of rows) {
		counts.set(row.id, (counts.get(row.id) ?? 0) + 1);
	}
	const duplicates = [...counts.entries()]
		.filter(([, n]) => n > 1)
		.map(([id]) => id);
	if (duplicates.length > 0) {
		throw new Error(`duplicate pattern id: ${duplicates.join(', ')}`);
	}
	return rows;
}

/** Append a pattern, rejecting a duplicate id loudly. */
function addPattern(rows: readonly Pattern[], next: Pattern): Pattern[] {
	if (rows.some((r) => r.id === next.id)) {
		throw new Error(`duplicate pattern id: ${next.id}`);
	}
	return [...rows, next];
}

/** Candidate rows that hold up the cutover, largest first. Discarded
 * rows are excluded — they are resolved by definition. */
function blockingWork(rows: readonly Pattern[]): Pattern[] {
	return rows
		.filter((r) => r.blocking === true && r.status === 'candidate')
		.toSorted((a, b) => b.corpusCount - a.corpusCount);
}

/** Every candidate a deterministic rule can fix, largest first —
 * blocking and non-blocking alike.
 *
 * `blocking` gates the cutover; it does not gate the work. A
 * non-blocking row with a known predicate is cheaper to fix now than to
 * carry into the post-launch sweep, so this queue deliberately does not
 * filter on it. Use `blockingWork` for the cutover checklist. */
function transformQueue(rows: readonly Pattern[]): Pattern[] {
	return rows
		.filter((r) => r.route === 'transform' && r.status === 'candidate')
		.toSorted((a, b) => b.corpusCount - a.corpusCount);
}

/** Problems with the `entangledWith` graph: unknown ids, self-links and
 * one-sided edges. Returns every problem rather than throwing on the
 * first, because the catalogue is checked as a whole. */
function checkEntanglement(rows: readonly Pattern[]): string[] {
	const byId = new Map(rows.map((r) => [r.id, r]));
	const problems: string[] = [];
	for (const row of rows) {
		for (const other of row.entangledWith ?? []) {
			if (other === row.id) {
				problems.push(`${row.id}: entangled with itself`);
				continue;
			}
			const partner = byId.get(other);
			if (partner === undefined) {
				problems.push(`${row.id}: entangled with unknown id ${other}`);
				continue;
			}
			if (!(partner.entangledWith ?? []).includes(row.id)) {
				problems.push(`${row.id} -> ${other}: not reciprocated`);
			}
		}
	}
	return problems;
}

/** True when the last SATURATION_ROUNDS rounds added no pattern. */
function isSaturated(rows: readonly Pattern[], round: number): boolean {
	const cutoff = round - SATURATION_ROUNDS;
	return !rows.some((r) => r.round > cutoff);
}

export type { Pattern, PatternRoute, PatternStatus };
export {
	addPattern,
	blockingWork,
	checkEntanglement,
	isSaturated,
	parsePatterns,
	transformQueue,
};
