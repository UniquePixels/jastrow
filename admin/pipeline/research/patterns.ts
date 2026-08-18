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

/** One systemic pattern class. */
interface Pattern {
	/** Entries matching corpus-wide, at the time it was catalogued. */
	corpusCount: number;
	description: string;
	/** Stable kebab-case key. */
	id: string;
	/** Discovery round that first recorded it; 0 for pre-existing. */
	round: number;
	status: PatternStatus;
}

/** Rounds with no new pattern needed to declare saturation. */
const SATURATION_ROUNDS = 2;

function parsePatterns(text: string): Pattern[] {
	return text
		.split('\n')
		.filter((line) => line.trim() !== '')
		.map((line) => JSON.parse(line) as Pattern);
}

function renderPatterns(rows: readonly Pattern[]): string {
	return `${rows.map((r) => JSON.stringify(r)).join('\n')}\n`;
}

/** Append a pattern, rejecting a duplicate id loudly. */
function addPattern(rows: readonly Pattern[], next: Pattern): Pattern[] {
	if (rows.some((r) => r.id === next.id)) {
		throw new Error(`duplicate pattern id: ${next.id}`);
	}
	return [...rows, next];
}

/** True when the last SATURATION_ROUNDS rounds added no pattern. */
function isSaturated(rows: readonly Pattern[], round: number): boolean {
	const cutoff = round - SATURATION_ROUNDS;
	return !rows.some((r) => r.round > cutoff);
}

export type { Pattern, PatternStatus };
export {
	addPattern,
	isSaturated,
	parsePatterns,
	renderPatterns,
	SATURATION_ROUNDS,
};
