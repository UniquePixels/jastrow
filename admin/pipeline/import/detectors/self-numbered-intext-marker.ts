/**
 * Review detector — `self-numbered-intext-marker` (catalogue: 35
 * senses in chunk-00373; 22 entries on the committed entries of
 * 2026-10-11, after the Group D patch sets). A numbered sense whose
 * own text carries `—N)`, where N is its own label: print's next sense
 * sits inside a sense of the same number (H01899's `2) to seal … a.
 * fr.—2) to sign, subscribe`).
 *
 * The predicate is the worklist's (`docs/sense-worklist.md` §3): a
 * labelled sense whose visible text, gloss then units, holds an em
 * dash, an optional `*`, and its own number closed by `)`, where the
 * text before the dash ends on `.` (a sentence boundary), outside
 * every open paren or bracket, and outside a `<cite>` anchor. A `)` or
 * `]` with nothing open closes nothing (an earlier `1)` or `a)` is a
 * marker, not a close), so it leaves the depth at zero.
 *
 * What it misses: a repeat with no dash (`. 2) to sign`), one after a
 * `;` or `,` rather than a full stop, and one inside an unclosed paren
 * — on today's entries the dashed repeat at a full stop is the whole
 * class (26 of 26 before the patch sets, worklist §3's answer). What
 * it reports that is not print's doubled numeral: class 4's residue
 * (A00982 `—Du. אָזְנַיִם 1) ears … —2) handles`, C00263), where the
 * marker is the second item of a sublist restarting at `1)` inside the
 * same sense. The answer keeps those as rows on purpose, since the
 * form-section split does not carve them and nothing else shows them.
 *
 * Every row needs the page: the hOCR shows print's own doubled numeral
 * wherever it can be read, so no rule can say whether to split and
 * keep print's number, split and number on, or leave the sense whole
 * (maintainer ruling 2026-10-10: port a detector, review on the scan).
 * A split that changes print's text is a deviation, and the reviewed
 * patch's rationale is where it is annotated.
 *
 * `defer`: the page reads as print, and splitting a sense later moves
 * no URL.
 */

import { tokenize } from '../../../entry/html.ts';
import type { Entry } from '../../../entry/types.ts';
import { type ClassRow, entryRow } from './row.ts';
import { fieldsOf, type SenseAt, walkSenses } from './senses.ts';

/** Catalogue id and report `kind` for a sense holding its own number
 * in its text. */
const SELF_NUMBERED_INTEXT_MARKER = 'self-numbered-intext-marker';

/** What the review report tells a reader to do about these rows. */
const SELF_NUMBERED_INTEXT_MARKER_ACTION =
	'Read the page and choose per row: split at the in-text marker and keep print’s doubled number, split and number on (renumbering the later senses), or leave the sense whole; write the choice as a reviewed patch whose rationale annotates any change to print’s text, since the page reads as print meanwhile.';

/** An in-text sense marker: an em dash, optional space and `*`, a
 * number, and its `)`. */
const DASHED_MARKER: RegExp = /—\s*\*?(?<num>\d+)\)/gu;

/** A sense label that is a number, the only kind this class reads. */
const NUMBERED_LABEL: RegExp = /^\d+$/u;

/** How much text either side of a site its row quotes. */
const CONTEXT = 24;

/** One sense's visible text, gloss then units, and for each character
 * whether a `<cite>` (or `<a>`) anchor encloses it. */
interface Visible {
	inAnchor: boolean[];
	text: string;
}

/** The anchor elements whose visible text is a citation, not prose. */
const ANCHORS: ReadonlySet<string> = new Set(['a', 'cite']);

/** The visible text of one sense's own fields, with an anchor flag per
 * character. Tags are dropped exactly as `textOf` drops them. */
function visibleOf(at: SenseAt): Visible {
	const visible: Visible = { inAnchor: [], text: '' };
	for (const [, html] of fieldsOf(at)) {
		let anchors = 0;
		for (const token of tokenize(html)) {
			if (token.kind === 'text') {
				visible.text += token.value;
				// One flag per UTF-16 unit, the unit `matchAll`'s index counts.
				visible.inAnchor.push(
					...new Array<boolean>(token.value.length).fill(anchors > 0),
				);
			} else if (ANCHORS.has(token.name)) {
				anchors = Math.max(0, anchors + (token.close ? -1 : 1));
			}
		}
	}
	return visible;
}

/** Whether `index` sits outside every paren and bracket open before
 * it. A closer with nothing open is a marker's `)` (`1) ears`) or a
 * lost opener, and leaves the depth at zero. */
function outsideParens(text: string, index: number): boolean {
	let parens = 0;
	let brackets = 0;
	for (const char of text.slice(0, index)) {
		if (char === '(') {
			parens++;
		} else if (char === ')') {
			parens = Math.max(0, parens - 1);
		} else if (char === '[') {
			brackets++;
		} else if (char === ']') {
			brackets = Math.max(0, brackets - 1);
		}
	}
	return parens === 0 && brackets === 0;
}

/** The sites in one labelled sense: `—N)` with N its own label, at a
 * full stop, outside parens, brackets and anchors. */
function sitesIn(at: SenseAt): string[] {
	const label = at.sense.label ?? '';
	const { inAnchor, text } = visibleOf(at);
	const sites: string[] = [];
	for (const match of text.matchAll(DASHED_MARKER)) {
		const index = match.index;
		const atBoundary = text.slice(0, index).trimEnd().endsWith('.');
		if (
			match.groups?.['num'] !== label ||
			!atBoundary ||
			inAnchor[index] === true ||
			!outsideParens(text, index)
		) {
			continue;
		}
		const quote = text
			.slice(Math.max(0, index - CONTEXT), index + match[0].length + CONTEXT)
			.trim();
		sites.push(
			`${at.path} (labelled ${label}) holds "${match[0]}": "…${quote}…"`,
		);
	}
	return sites;
}

/** One row per entry naming every numbered sense whose text carries
 * its own number as an in-text marker. */
function detectSelfNumberedIntextMarker(entry: Entry): ClassRow[] {
	const sites = [...walkSenses(entry)]
		.filter((at) => NUMBERED_LABEL.test(at.sense.label ?? ''))
		.flatMap(sitesIn);
	return entryRow(entry, SELF_NUMBERED_INTEXT_MARKER, sites);
}

export {
	detectSelfNumberedIntextMarker,
	SELF_NUMBERED_INTEXT_MARKER,
	SELF_NUMBERED_INTEXT_MARKER_ACTION,
};
