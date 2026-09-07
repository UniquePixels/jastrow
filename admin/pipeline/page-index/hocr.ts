/**
 * Streaming reader for the Internet Archive's hOCR of the 1903 Jastrow scans.
 *
 * The two volumes are 107 MB and 159 MB of XHTML, so pages are yielded one at a
 * time rather than parsed into one tree. Only the three things the page index
 * needs are kept: the page box, each text line's box, and each word's text and
 * confidence.
 *
 * Note the OCR engine is `tesseract 5.0.0-rc2` (a 2021 re-OCR), *not* the
 * ABBYY FineReader 8.0 that produced the much older `_djvu.txt` on the same
 * item. The Tesseract layer is markedly better on Hebrew and is the only one
 * carrying word geometry.
 */

import { createReadStream } from 'node:fs';
import { Parser } from 'htmlparser2';

/** `[x0, y0, x1, y1]` in scan pixels, origin top-left. */
type BBox = readonly [number, number, number, number];

interface HocrWord {
	readonly bbox: BBox;
	readonly conf: number;
	readonly text: string;
}

interface HocrLine {
	readonly bbox: BBox;
	readonly words: readonly HocrWord[];
}

interface HocrPage {
	readonly bbox: BBox;
	/** Scan image this page was OCR'd from, e.g. `..._0251.jp2`. */
	readonly image: string;
	/** Zero-based index of the page within the volume's hOCR file. */
	readonly index: number;
	readonly lines: readonly HocrLine[];
}

const BBOX_RE = /bbox (?<x0>\d+) (?<y0>\d+) (?<x1>\d+) (?<y1>\d+)/u;
const WCONF_RE = /x_wconf (?<conf>\d+)/u;
const IMAGE_RE = /image "(?<path>[^"]*)"/u;

/** Classes Tesseract uses for a run of text on one baseline. */
const LINE_CLASSES = new Set([
	'ocr_line',
	'ocr_caption',
	'ocr_header',
	'ocr_textfloat',
]);

function parseBBox(title: string): BBox | null {
	const g = BBOX_RE.exec(title)?.groups;
	if (!g) {
		return null;
	}
	return [
		Number(g['x0']),
		Number(g['y0']),
		Number(g['x1']),
		Number(g['y1']),
	] as const;
}

interface MutablePage {
	bbox: BBox;
	image: string;
	lines: HocrLine[];
}

interface MutableLine {
	bbox: BBox;
	words: HocrWord[];
}

interface MutableWord {
	bbox: BBox;
	conf: number;
	text: string;
}

/**
 * Mutable cursor through the document.
 *
 * Kept as one object so the tag handlers stay small enough to read; each is
 * called once per element across ~270 MB of markup, so each does the least
 * work it can.
 */
interface ParseState {
	done: HocrPage[];
	index: number;
	line: MutableLine | null;
	page: MutablePage | null;
	word: MutableWord | null;
}

function openPage(state: ParseState, title: string): void {
	if (state.page) {
		state.done.push({ ...state.page, index: state.index });
		state.index++;
	}
	state.page = {
		bbox: parseBBox(title) ?? [0, 0, 0, 0],
		image: IMAGE_RE.exec(title)?.groups?.['path'] ?? '',
		lines: [],
	};
}

function openTag(
	state: ParseState,
	cls: string | undefined,
	title: string,
): void {
	if (cls === 'ocr_page') {
		openPage(state, title);
		return;
	}
	if (cls !== undefined && LINE_CLASSES.has(cls)) {
		const bbox = parseBBox(title);
		state.line = bbox ? { bbox, words: [] } : null;
		return;
	}
	if (cls === 'ocrx_word' && state.line) {
		const bbox = parseBBox(title);
		if (bbox) {
			state.word = {
				bbox,
				conf: Number(WCONF_RE.exec(title)?.groups?.['conf'] ?? -1),
				text: '',
			};
		}
	}
}

function closeSpan(state: ParseState): void {
	if (state.word) {
		const text = state.word.text.trim();
		if (text && state.line) {
			state.line.words.push({ ...state.word, text });
		}
		state.word = null;
		return;
	}
	if (state.line) {
		if (state.line.words.length > 0) {
			state.page?.lines.push(state.line);
		}
		state.line = null;
	}
}

/** Flatten a line's words into a single space-joined string. */
function lineText(line: HocrLine): string {
	return line.words.map((w) => w.text).join(' ');
}

/** Horizontal centre of a box. */
function centerX(bbox: BBox): number {
	return (bbox[0] + bbox[2]) / 2;
}

/**
 * Yield every `ocr_page` in an hOCR file in document order.
 *
 * Pages with no recognised words still yield (with an empty `lines`), so the
 * caller's page indices always line up with the volume's leaf numbering.
 */
async function* readHocrPages(
	path: string,
): AsyncGenerator<HocrPage, void, undefined> {
	const state: ParseState = {
		done: [],
		index: 0,
		line: null,
		page: null,
		word: null,
	};

	const parser = new Parser(
		{
			onclosetag(name: string): void {
				if (name === 'span') {
					closeSpan(state);
				}
			},
			onopentag(_name: string, attribs: Record<string, string>): void {
				openTag(state, attribs['class'], attribs['title'] ?? '');
			},
			ontext(text: string): void {
				if (state.word) {
					state.word.text += text;
				}
			},
		},
		{ decodeEntities: true, xmlMode: false },
	);

	const stream = createReadStream(path, { encoding: 'utf8' });
	for await (const chunk of stream) {
		parser.write(chunk as string);
		while (state.done.length > 0) {
			yield state.done.shift() as HocrPage;
		}
	}
	parser.end();
	while (state.done.length > 0) {
		yield state.done.shift() as HocrPage;
	}
	if (state.page) {
		yield { ...state.page, index: state.index };
	}
}

export type { BBox, HocrLine, HocrPage, HocrWord };
export { centerX, lineText, readHocrPages };
