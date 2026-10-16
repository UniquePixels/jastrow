/**
 * The lettered children of one text (design doc §2 senses row, B5):
 * where `body/lettered.ts` splits it, and the label each child takes.
 * A child is labelled by its own letter, except where a reviewed
 * `relabel` patch declared the run print set (review ledger L59;
 * ruling `10-13 correction policy`, case 2). There the split is at
 * exactly that run, each child takes its label from `to`, and each
 * label that departs from print's letter carries a `label` draft with
 * that letter as `printed`, which `finishEntry` writes as the child's
 * annotation. An `annotate` on a child's text (review ledger L67)
 * names the child by its label; its draft rode the host's source
 * sense, and lands here on the child that carries that label.
 * `trace.ts` composes this with the other rules.
 */

import type {
	BodySense,
	RelabelDraft,
	SenseAnnotationDraft,
} from '../types.ts';
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
		throw new Error(`${relabel.source}: ${reason}`);
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
 * print's letter, and each carrying the `drafts` that name it as
 * `child` (`withChildDrafts`). */
function letteredChildren(
	parts: LetteredParts,
	relabel: RelabelDraft | undefined,
	drafts: readonly SenseAnnotationDraft[] = [],
): BodySense[] {
	return withChildDrafts(labelledChildren(parts, relabel), drafts);
}

/** Each child of the split, labelled (see `letteredChildren`). */
function labelledChildren(
	parts: LetteredParts,
	relabel: RelabelDraft | undefined,
): BodySense[] {
	return parts.items.map((item, i) => {
		const label = relabel?.to[i] ?? item.letter;
		const child = letteredChild(item.text, label);
		const note = relabel?.note;
		if (note === undefined || label === item.letter) {
			return child;
		}
		return {
			...child,
			annotations: [{ ...note, field: 'label', printed: item.letter }],
		};
	});
}

/** The label a draft names as its child, or `undefined` for a draft
 * that stays on its host. */
function childOf(draft: SenseAnnotationDraft): string | undefined {
	return 'child' in draft ? draft.child : undefined;
}

/** Move each draft that names a child (an `annotate`'s `child`, L67)
 * onto the one child built with that label, `child` dropped: on the
 * child it says nothing more. A label no child carries is thrown,
 * never dropped, since the annotation would be lost with it. */
function withChildDrafts(
	children: BodySense[],
	drafts: readonly SenseAnnotationDraft[],
): BodySense[] {
	for (const draft of drafts) {
		const child = childOf(draft);
		const target = children.find((c) => c.label === child);
		if (target === undefined) {
			const labels = children.map((c) => c.label).join(' ');
			throw new Error(
				`${draft.source}: the annotate names child ${child}, and the split built ${labels}`,
			);
		}
		const { child: _named, ...onChild } = draft as SenseAnnotationDraft & {
			child?: string;
		};
		target.annotations = [...(target.annotations ?? []), onChild];
	}
	return children;
}

export { childOf, letteredChildren, letteredSplit };
