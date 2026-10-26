/**
 * The print hOCR as text, for one purpose: checking that a reviewed
 * patch's `hOCR` evidence quote is really on the leaf it names (the
 * import's `evidenceLocator` gate, ruling `10-26 patch evidence`).
 *
 * The hOCR is kept byte-exact under `data/print/hocr/<item>/` in
 * gzipped chunks of 100 leaves (`data/print/hocr/README.md`). A leaf
 * is one `ocr_page` (`id="page_NNNNNN"`, the leaf number the page index
 * and the IIIF links use, IIIF's `$n` being leaf `n − 1`). A line is
 * one `ocr_line` (or `ocr_textfloat`, `ocr_header`, `ocr_caption`):
 * its words' text, HTML entities decoded, each trimmed and joined by
 * one space — the reading the L71 amendments quoted from
 * (`patch/records/tranches/l71-evidence-2026-10-22/README.md`).
 *
 * **What a quote can witness.** Vol. 2's hOCR (ABBYY FineReader 8)
 * holds no Hebrew characters at all, and vol. 1's (Tesseract
 * `heb+eng`) garbles Hebrew. A quote found here is evidence for Latin
 * text, numerals, punctuation and position only, never for a Hebrew
 * reading, which needs a `maintainer-read` of the scan.
 *
 * Read only inside the import: a chunk is ~15 MB of HTML once
 * gunzipped. Each chunk is parsed once per process and cached.
 */
import { readdirSync } from 'node:fs';
import { HOCR_DIR } from '../paths.ts';

/** The shortest quote that can locate anything: a marker like `1)` or
 * an OCR `l)` occurs on nearly every leaf, so it witnesses nothing. */
const MIN_QUOTE = 12;

/** The two Internet Archive items the page index is pinned to, by
 * volume. */
const HOCR_ITEMS: Readonly<Record<1 | 2, string>> = {
	1: 'dictionaryoftarg01jastuoft',
	2: 'dictionaryoftarg02jastuoft',
};

/** A chunk's name: the first and last leaf it holds. */
const CHUNK = /^leaves-(?<first>\d{4})-(?<last>\d{4})\.html\.gz$/u;
/** The start of one leaf. */
const PAGE = /<div class="ocr_page" id="page_(?<leaf>\d+)"/gu;
/** A line opening, or a word with its text (words hold no tags). */
const LINE_OR_WORD =
	/<span class="(?<kind>ocr_line|ocr_textfloat|ocr_header|ocr_caption|ocrx_word)"[^>]*>(?<text>[^<]*)/gu;
const ENTITY = /&(?:#(?<dec>\d+)|#x(?<hex>[0-9a-f]+)|(?<name>[a-z]+));/giu;
const SPACE_RUN = /\s+/gu;
/** The invisible bidi controls (LRM, RLM, the embeddings, overrides
 * and isolates). Tesseract sets them around its right-to-left words;
 * a quote typed from the line cannot carry them. */
const BIDI_CONTROLS = /[\u200E\u200F\u202A-\u202E\u2066-\u2069]/gu;
const NAMED: Readonly<Record<string, string>> = {
	amp: '&',
	apos: "'",
	gt: '>',
	lt: '<',
	quot: '"',
};

/** `text` with its HTML character references decoded. An unknown
 * named reference is left as written. */
function decodeEntities(text: string): string {
	return text.replaceAll(ENTITY, (whole, ...args: unknown[]) => {
		const groups = args.at(-1) as Record<string, string | undefined>;
		if (groups['dec'] !== undefined) {
			return String.fromCodePoint(Number(groups['dec']));
		}
		if (groups['hex'] !== undefined) {
			return String.fromCodePoint(Number.parseInt(groups['hex'], 16));
		}
		return NAMED[(groups['name'] ?? '').toLowerCase()] ?? whole;
	});
}

/** Every leaf of one chunk's HTML, by leaf number, as its lines. */
function parseChunk(html: string): Map<number, string[]> {
	const starts = [...html.matchAll(PAGE)];
	const leaves = new Map<number, string[]>();
	for (const [i, start] of starts.entries()) {
		const end = starts[i + 1]?.index ?? html.length;
		const lines: string[] = [];
		let words: string[] | undefined;
		for (const m of html.slice(start.index, end).matchAll(LINE_OR_WORD)) {
			if (m.groups?.['kind'] !== 'ocrx_word') {
				words = [];
				lines.push('');
			} else if (words !== undefined) {
				const word = decodeEntities(m.groups['text'] ?? '').trim();
				if (word !== '') {
					words.push(word);
					lines[lines.length - 1] = words.join(' ');
				}
			}
		}
		leaves.set(
			Number(start.groups?.['leaf']),
			lines.filter((line) => line !== ''),
		);
	}
	return leaves;
}

/** Parsed chunks, by file path: each chunk is gunzipped and parsed at
 * most once per process. */
/** One parse per chunk, keyed by path. The promise is cached, not its
 * result, so callers that race for one chunk share one gunzip. */
const cache = new Map<string, Promise<Map<number, string[]>>>();

/** `path` gunzipped and parsed into its leaves. */
async function readChunk(path: string): Promise<Map<number, string[]>> {
	const bytes = new Uint8Array(await Bun.file(path).arrayBuffer());
	return parseChunk(new TextDecoder().decode(Bun.gunzipSync(bytes)));
}

/** The chunk file of `volume` that holds `leaf`, or `undefined` when
 * no chunk's range holds it. */
function chunkPath(
	volume: 1 | 2,
	leaf: number,
	root: string,
): string | undefined {
	const dir = `${root}/${HOCR_ITEMS[volume]}`;
	for (const name of readdirSync(dir)) {
		const m = CHUNK.exec(name);
		if (
			m !== null &&
			leaf >= Number(m.groups?.['first']) &&
			leaf <= Number(m.groups?.['last'])
		) {
			return `${dir}/${name}`;
		}
	}
	return undefined;
}

/** The text lines of one leaf of one volume's hOCR, or `undefined`
 * when the hOCR holds no such leaf. `root` is `HOCR_DIR` except in a
 * test, which hands in a fixture. */
async function leafLines(
	volume: 1 | 2,
	leaf: number,
	root: string = HOCR_DIR,
): Promise<string[] | undefined> {
	const path = chunkPath(volume, leaf, root);
	if (path === undefined) {
		return;
	}
	let leaves = cache.get(path);
	if (leaves === undefined) {
		leaves = readChunk(path);
		cache.set(path, leaves);
	}
	return (await leaves).get(leaf);
}

/** `text` without its bidi controls, every whitespace run collapsed
 * to one space, trimmed. */
function collapse(text: string): string {
	return text.replaceAll(BIDI_CONTROLS, '').replaceAll(SPACE_RUN, ' ').trim();
}

/** Whether `quote` occurs verbatim in the leaf's text — its lines
 * joined by one space — with whitespace collapsed and the invisible
 * bidi controls dropped on both sides. Nothing visible is normalized:
 * not case, not punctuation, not a character the OCR misread. An
 * empty quote occurs nowhere. */
function quoteOnLeaf(lines: readonly string[], quote: string): boolean {
	const needle = collapse(quote);
	return needle !== '' && collapse(lines.join(' ')).includes(needle);
}

export { collapse, HOCR_ITEMS, leafLines, MIN_QUOTE, quoteOnLeaf };
