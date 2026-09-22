/**
 * No-new-text validator (research-process plan Task 2; spec
 * docs/archive/specs/2026-08-10-research-process-design.md §4.3).
 *
 * The hard constraint behind the whole patch corpus: agents may
 * rearrange, re-tag, split, or delete existing text — **never
 * generate new words**. This validator enforces that mechanically:
 * the applied entry's content bytes must be a sub-multiset of the
 * original entry's content bytes, plus — for the ops that
 * legitimately introduce a sense-number marker — the bytes of one
 * closed-grammar token (`N)` / `—N)`) taken from the patch payload:
 *
 * - `retag` may introduce `payload.number` (the implied-1 /
 *   lost-marker reinsert class);
 * - `split` may introduce `payload.marker` (normally byte-conserving
 *   anyway, since the marker moves from the definition into the new
 *   sibling's number field);
 * - `replace` may introduce closed-grammar tokens present in
 *   `payload.replace` (the OCR `l)` → `1)` class);
 * - `move` and `delete` get no allowance at all.
 *
 * Maintainer ruling (2026-08-11): correcting an obvious OCR error is
 * *correction*, not adding to the text — a mis-recognized glyph never
 * was the source's content. The marker allowance on `replace` is that
 * ruling in code, held to the closed grammar so "correction" can
 * never widen into composition.
 *
 * Any repair needing bytes beyond that is not a repair this process
 * may make — the verdict re-dispositions the entry
 * `needs_print_check` (spec §3: repairs requiring new content are
 * automatically escalated).
 */
import type { SourceEntry } from '../body/types.ts';
import { CLOSED_MARKER, flattenContent, type SemanticPatch } from './schema.ts';

// Hoisted per lint/performance/useTopLevelRegex. The unanchored,
// global twin of `CLOSED_MARKER` (schema.ts, `/^—?\d{1,2}\)$/u`):
// that one asks whether a whole string IS a marker token, this one
// finds every marker-shaped run inside a longer string. `replace` is
// the only op whose payload holds free text rather than a bare token,
// so it is the only one that needs a scan — `markerAllowance` scans
// `payload.replace` with this, then re-tests each hit against
// `CLOSED_MARKER` before granting it an allowance.
//
// The `g` flag carries `lastIndex` state, so sharing this across calls
// would not be safe with `exec`; the one caller passes it to
// `String#match`, which is specified to reset `lastIndex` for a global
// regex and return all matches at once.
const MARKER_TOKENS = /—?\d{1,2}\)/gu;

/** Codepoint → count multiset of a string. */
function codepointCounts(text: string): Map<string, number> {
	const counts = new Map<string, number>();
	for (const cp of text) {
		counts.set(cp, (counts.get(cp) ?? 0) + 1);
	}
	return counts;
}

/** The synthesized-byte allowance an op's payload legitimately
 * introduces: the codepoints of its closed-grammar marker token(s). */
function markerAllowance(patch: SemanticPatch): Map<string, number> {
	switch (patch.op) {
		case 'retag':
			return codepointCounts(patch.payload.number);
		case 'split':
			return codepointCounts(patch.payload.marker);
		case 'replace': {
			const tokens = patch.payload.replace.match(MARKER_TOKENS) ?? [];
			return codepointCounts(
				tokens.filter((t) => CLOSED_MARKER.test(t)).join(''),
			);
		}
		default:
			return new Map();
	}
}

/** The validator's verdict. A rejection carries the mandatory
 * re-disposition (spec §4.3): the entry leaves the repaired pool and
 * joins the print-check queue. */
type NoNewTextVerdict =
	| { ok: true }
	| { ok: false; reason: string; redisposition: 'needs_print_check' };

/** Check that applying `patch` (turning `before` into `after`)
 * introduced no bytes beyond the original content plus the op's
 * closed-grammar marker allowance. */
function validateNoNewText(
	patch: SemanticPatch,
	before: SourceEntry,
	after: SourceEntry,
): NoNewTextVerdict {
	const pool = codepointCounts(flattenContent(before));
	for (const [cp, count] of markerAllowance(patch)) {
		pool.set(cp, (pool.get(cp) ?? 0) + count);
	}
	const result = codepointCounts(flattenContent(after));
	const invented: string[] = [];
	for (const [cp, count] of result) {
		const available = pool.get(cp) ?? 0;
		if (count > available) {
			invented.push(`"${cp}" ×${count - available}`);
		}
	}
	if (invented.length === 0) {
		return { ok: true };
	}
	return {
		ok: false,
		reason: `patch ${patch.id} (${patch.op}) introduces bytes not drawn from the source: ${invented.join(', ')}`,
		redisposition: 'needs_print_check',
	};
}

export type { NoNewTextVerdict };
export { validateNoNewText };
