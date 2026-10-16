/**
 * The lettered children of one text (design doc §2 senses row, B5):
 * where `body/lettered.ts` splits it, and the label each child takes.
 * A child is labelled by its own letter, except where a reviewed
 * `relabel` patch declared the run print set (review ledger L59;
 * ruling `10-13 correction policy`, case 2). There the split is at
 * exactly that run, each child takes its label from `to`, and each
 * label that departs from print's letter carries a `label` draft with
 * that letter as `printed`, which `finishEntry` writes as the child's
 * annotation. `trace.ts` composes this with the other rules.
 */

import type { BodySense, RelabelDraft } from '../types.ts';
import {
	declaredRunReason,
	type LetteredParts,
	splitLettered,
} from './lettered.ts';
import { segmentUnits } from './units.ts';

/** The lettered split of `text`: at the declared run when a `relabel`
 * left one, else the plain ascending rule. A declared run the text no
 * longer holds is thrown, never dropped into an under-split: the
 * patch's annotations would be lost with it. The apply checked the run
 * (`declaredRunReason`), so this fires only on text a later step
 * changed. */
function letteredSplit(
	text: string,
	relabel: RelabelDraft | undefined,
): LetteredParts | null {
	if (relabel === undefined) {
		return splitLettered(text);
	}
	const parts = splitLettered(text, relabel.run);
	if (parts === null) {
		const reason =
			declaredRunReason(text, relabel.run) ??
			'the declared run does not split the text';
		throw new Error(`${relabel.note.source}: ${reason}`);
	}
	return parts;
}

/** One lettered child: its own gloss + units, labelled `label`. */
function letteredChild(text: string, label: string): BodySense {
	const { gloss, units } = segmentUnits(text);
	return { gloss, label, units };
}

/** The children of a split, in order: each labelled by its letter, or
 * by the `relabel`'s `to` with a draft wherever that departs from
 * print's letter. */
function letteredChildren(
	parts: LetteredParts,
	relabel: RelabelDraft | undefined,
): BodySense[] {
	return parts.items.map((item, i) => {
		const label = relabel?.to[i] ?? item.letter;
		const child = letteredChild(item.text, label);
		if (relabel === undefined || label === item.letter) {
			return child;
		}
		return {
			...child,
			annotations: [{ ...relabel.note, field: 'label', printed: item.letter }],
		};
	});
}

export { letteredChildren, letteredSplit };
