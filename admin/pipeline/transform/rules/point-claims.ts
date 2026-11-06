/**
 * What both batch-10 point rules need to declare a case-9 claim: the
 * link targets their entry's input held, in a deterministic order.
 *
 * Shared rather than written twice because the two rules ask exactly
 * the same question of exactly the same field set, and a second copy of
 * this walk is the drift `fields.ts`'s own module doc warns about one
 * level up — a rule reading a field set the gate does not is invisible
 * to it.
 */

import { tokenize } from '../../../entry/html.ts';
import type { SourceEntry } from '../../types.ts';
import { anchors } from '../links.ts';
import { fieldsOf } from '../no-new-text.ts';

/**
 * Every `href` and `data-ref` the entry's input holds, deduplicated and
 * sorted — the strings a case-9 claim's `from` must come from.
 *
 * The empty string is dropped: an anchor missing an attribute reads
 * back as `''`, and a claim can neither start from nor write one.
 */
function inputTargets(entry: SourceEntry): string[] {
	const found = new Set<string>();
	for (const field of fieldsOf(entry)) {
		for (const anchor of anchors(tokenize(field))) {
			found.add(anchor.dataRef);
			found.add(anchor.href);
		}
	}
	found.delete('');
	return [...found].sort();
}

export { inputTargets };
