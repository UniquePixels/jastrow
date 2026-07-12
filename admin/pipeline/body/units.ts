/**
 * Citation-unit segmentation (design doc §4, decision B4). A unit
 * boundary exists only where the text before a well-formed external
 * citation ends with '.' or '—' (or is the sense start) — the
 * conservative terminator rule. Malformed hits never open a unit
 * (their spans are open-tag-only, not a full citation). Failure mode
 * is under-split: `gloss + units.join('') === text` always, for every
 * definition string this is given.
 */
import { classifyBoundary } from './census.ts';
import { findCitations } from './cite.ts';

interface UnitSplit {
	gloss: string;
	units: string[];
}

/** Segment a definition string into a leading gloss and citation-anchored
 * units. Boundaries are found only before well-formed external citations
 * whose preceding (tag-stripped) text ends on '.' or '—', or is empty
 * (sense start). Everything before the first boundary is the gloss; when
 * there are no boundaries at all, the whole string is the gloss and
 * `units` is empty. */
function segmentUnits(text: string): UnitSplit {
	const boundaries: number[] = [];
	for (const hit of findCitations(text)) {
		if (hit.kind !== 'external' || hit.malformed) {
			continue;
		}
		const cls = classifyBoundary(text.slice(0, hit.start));
		if (cls === 'period' || cls === 'dash' || cls === 'sense-start') {
			boundaries.push(hit.start);
		}
	}
	if (boundaries.length === 0) {
		return { gloss: text, units: [] };
	}
	const units = boundaries.map((start, i) =>
		text.slice(start, boundaries[i + 1] ?? text.length),
	);
	return { gloss: text.slice(0, boundaries[0]), units };
}

export type { UnitSplit };
export { segmentUnits };
