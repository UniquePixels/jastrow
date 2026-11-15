/**
 * The `<annotate id="aN">…</annotate>` tag that points a stretch of
 * entry text at one item of the entry's `annotations` list (ruling
 * `11-15 annotation section`, `docs/decisions.md`). One module writes
 * the tag, finds the ids it carries and reads past it, so the entry
 * contract, the `display` rules and the import cannot disagree about
 * its shape. Tags are read through `tokenize`, never a second scanner.
 */
import { serialize, tokenize } from './html.ts';

/** An opening annotate tag exactly as written: `id` the only
 * attribute, double-quoted, `a` and then a number from 1. */
const ANNOTATE_OPEN = /^<annotate id="(?<id>a[1-9]\d*)">$/u;

/** The tag around `inner`, carrying annotation id `id`. */
function annotateTag(id: string, inner: string): string {
	return `<annotate id="${id}">${inner}</annotate>`;
}

/** The ids carried by the opening annotate tags in `text`, in order.
 * A malformed opening tag contributes none; the contract's markup
 * check refuses it separately. */
function annotateIds(text: string): string[] {
	const ids: string[] = [];
	for (const token of tokenize(text)) {
		if (token.kind === 'tag' && token.name === 'annotate' && !token.close) {
			const id = ANNOTATE_OPEN.exec(token.value)?.groups?.['id'];
			if (id !== undefined) {
				ids.push(id);
			}
		}
	}
	return ids;
}

/** `text` with every opening and closing annotate tag removed and
 * every other byte kept. */
function withoutAnnotateTags(text: string): string {
	return serialize(
		tokenize(text).filter(
			(token) => !(token.kind === 'tag' && token.name === 'annotate'),
		),
	);
}

export { ANNOTATE_OPEN, annotateIds, annotateTag, withoutAnnotateTags };
