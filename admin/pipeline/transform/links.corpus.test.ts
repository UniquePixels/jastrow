import { expect, it } from 'bun:test';
import { fieldsOf } from './no-new-text.ts';
import { sourceEntries } from './rules/corpus-fixture.ts';

/**
 * The corpus tier for `links.ts` — claims measured over all 32,512
 * entries rather than over a fixture.
 *
 * Split out of `links.test.ts` rather than appended to it: that file
 * is already at the `noExcessiveLinesPerFile` limit, and batch 2 made
 * the same call for `rules/unlink-scope.corpus.test.ts`. The fixture tier
 * stays there; everything that walks the snapshot lives here.
 */

/**
 * The apostrophe widening, pinned as a PROPERTY rather than a story.
 *
 * `ATTR`'s value class was `[^"']*`, which excluded both delimiters and
 * so failed outright on any value holding the other one. The corpus
 * writes 452 such values. Replacing the class could in principle have
 * done three things — gain a value, CHANGE one already read, or LOSE
 * one — and only the first is safe, so all three are measured here
 * against the old class, kept locally for exactly this comparison.
 *
 * This is the argument that the fix could not have altered any shipped
 * rule's behaviour, and it is a test rather than a paragraph because
 * the batch-2 review found four permanent records asserting things
 * their own code did not do.
 *
 * KNOWN LIMIT, recorded rather than implied: `NEW_ATTR` is a COPY of
 * the production class, not an import of it (`ATTR` is module-private
 * and its consumers need the `d` flag this comparison does not). So
 * this test pins a property of the two classes, and what ties
 * production to `NEW_ATTR` is the fixture test above — change `ATTR`
 * without changing `NEW_ATTR` and this test keeps passing while
 * measuring the wrong thing. `tags` is 170,180 rather than the
 * module's 170,182 anchors: `OPEN_TAG` cannot match the 2 whose `href`
 * swallows their own `</a>`, and neither class can read those either.
 */
const OLD_ATTR = (name: string): RegExp =>
	new RegExp(String.raw`\b${name}\s*=\s*(?<q>["'])(?<value>[^"']*)\k<q>`, 'u');
const NEW_ATTR = (name: string): RegExp =>
	new RegExp(
		String.raw`\b${name}\s*=\s*(?<q>["'])(?<value>[\s\S]*?)\k<q>`,
		'u',
	);
const OPEN_TAG = /<a\b[^<>]*>/giu;

/** Every `<a …>` opening tag in the corpus, with the entry it came
 * from. Shared by the three tests below so none has to nest three
 * loops to reach a tag. */
async function* openTags(): AsyncGenerator<{ rid: string; tag: string }> {
	for (const entry of await sourceEntries()) {
		for (const field of fieldsOf(entry)) {
			for (const [tag] of field.matchAll(OPEN_TAG)) {
				yield { rid: entry.rid, tag };
			}
		}
	}
}

it('widening the value class only ever ADDS a value — 452, none changed, none lost', async () => {
	const gained = { 'data-ref': 0, href: 0 };
	const changed = { 'data-ref': 0, href: 0 };
	const lost = { 'data-ref': 0, href: 0 };
	const rids = new Set<string>();
	let tags = 0;
	for await (const { rid, tag } of openTags()) {
		tags++;
		for (const name of ['href', 'data-ref'] as const) {
			const before = OLD_ATTR(name).exec(tag)?.groups?.['value'];
			const after = NEW_ATTR(name).exec(tag)?.groups?.['value'];
			if (before === after) {
				continue;
			}
			rids.add(rid);
			if (before === undefined) {
				gained[name]++;
			} else if (after === undefined) {
				lost[name]++;
			} else {
				changed[name]++;
			}
		}
	}
	expect(tags).toBe(170_180);
	expect(gained).toEqual({ 'data-ref': 452, href: 452 });
	expect(changed).toEqual({ 'data-ref': 0, href: 0 });
	expect(lost).toEqual({ 'data-ref': 0, href: 0 });
	expect(rids.size).toBe(417);
});

/** Why the class is lazy and not simply `[^"]*`: the corpus is entirely
 * double-quoted TODAY, so the narrower class would pass every test
 * above while silently over-running the first single-quoted tag anyone
 * adds. The count is pinned so "entirely double-quoted" stays a
 * measurement. */
it('every attribute value in the corpus is double-quoted — 340,360 of them', async () => {
	const quote = /\b(?:href|data-ref)\s*=\s*(?<mark>["'])/gu;
	let double = 0;
	let single = 0;
	for await (const { tag } of openTags()) {
		for (const found of tag.matchAll(quote)) {
			if (found.groups?.['mark'] === '"') {
				double++;
			} else {
				single++;
			}
		}
	}
	expect(double).toBe(340_360);
	expect(single).toBe(0);
});

/**
 * The assumption `ATTR`'s quote-blind `\b${name}` rests on, pinned so
 * it cannot quietly stop being true.
 *
 * `\bhref` would match inside ANOTHER attribute's value —
 * `<a title="see href='x'" href="/real">` reads `x`, under the old
 * value class and the new one alike (raised in review 2026-08-24;
 * measured, not assumed). The corpus cannot produce that shape: an
 * `<a>` tag here carries only these four attribute names, and never a
 * second `href` or `data-ref`. If a later pipeline stage adds a
 * `title`, this test fails before any link is misread.
 */
it('an anchor tag carries only class, href, data-ref and dir — and one of each', async () => {
	const names = new Map<string, number>();
	let repeatedTarget = 0;
	for await (const { tag } of openTags()) {
		for (const found of tag.matchAll(/(?<name>[a-zA-Z-]+)\s*=/gu)) {
			const name = found.groups?.['name'] ?? '';
			names.set(name, (names.get(name) ?? 0) + 1);
		}
		const hrefs = tag.match(/\bhref\s*=/gu)?.length ?? 0;
		const refs = tag.match(/\bdata-ref\s*=/gu)?.length ?? 0;
		if (hrefs > 1 || refs > 1) {
			repeatedTarget++;
		}
	}
	expect(Object.fromEntries(names)).toEqual({
		class: 170_180,
		'data-ref': 170_180,
		dir: 62_003,
		href: 170_180,
	});
	expect(repeatedTarget).toBe(0);
});
