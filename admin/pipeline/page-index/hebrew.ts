/**
 * Hebrew string normalisation for matching OCR text against headwords.
 *
 * Three problems have to be neutralised before an OCR'd running head can be
 * compared to a dictionary headword:
 *
 *   1. **Pointing.** Jastrow sets running heads sometimes vocalised
 *      (`גּוּפְתָּיָיה`) and sometimes bare (`גורדייתא`) on adjacent pages, and
 *      Tesseract drops or invents niqqud freely. All marks are stripped.
 *   2. **Disambiguators.** Sefaria distinguishes homographs with a trailing
 *      Roman numeral (`חָבַב I`) or a superscript digit (`א ²`); the print does
 *      not repeat these in the running head. They are removed for matching but
 *      preserved on the record so the caller can still identify the exact entry.
 *   3. **Final forms.** Tesseract confuses ך/כ, ם/מ, ן/נ, ף/פ, ץ/צ often enough
 *      that a second, looser key folding finals is worth carrying.
 */

/** Hebrew combining marks: cantillation, points, meteg, shin/sin dots. */
const HEBREW_MARKS = /[֑-ׇֽֿׁׂׅׄ]/gu;

/** Maqaf, geresh, gershayim, and the ASCII punctuation Sefaria mixes in. */
const PUNCTUATION = /[־׳״"'`*,()=?.‐-―-]/gu;

/** A trailing Roman-numeral homograph marker, e.g. the ` I` in `חָבַב I`. */
const ROMAN_SUFFIX = /\s+[IVX]+\s*$/u;

/** Superscript digits Sefaria uses for the second, third, … sense of a form. */
const SUPERSCRIPTS = /[²³¹⁰-⁹]/gu;

const FINALS: ReadonlyMap<string, string> = new Map([
	['ך', 'כ'],
	['ם', 'מ'],
	['ן', 'נ'],
	['ף', 'פ'],
	['ץ', 'צ'],
]);

/** True for the 27 Hebrew consonant code points (22 letters + 5 finals). */
function isHebrewLetter(ch: string): boolean {
	return ch >= 'א' && ch <= 'ת';
}

/**
 * Reduce a headword or an OCR'd running head to bare Hebrew consonants.
 *
 * Everything that is not a Hebrew letter is discarded, so Latin fragments that
 * Tesseract mixes into a Hebrew line vanish rather than corrupting the key.
 */
function normalizeHeadword(raw: string): string {
	const stripped = raw
		.normalize('NFD')
		.replace(HEBREW_MARKS, '')
		.replace(SUPERSCRIPTS, '')
		.replace(ROMAN_SUFFIX, '')
		.replace(PUNCTUATION, '');
	let out = '';
	for (const ch of stripped) {
		if (isHebrewLetter(ch)) {
			out += ch;
		}
	}
	return out;
}

/** {@link normalizeHeadword} with final forms folded onto their base letter. */
function looseKey(raw: string): string {
	let out = '';
	for (const ch of normalizeHeadword(raw)) {
		out += FINALS.get(ch) ?? ch;
	}
	return out;
}

/**
 * Levenshtein distance, capped so hopeless pairs bail out early.
 *
 * Returns `cap + 1` when the true distance exceeds `cap`; callers only ever
 * care whether a candidate is close, never how far away a bad one is.
 */
function editDistance(a: string, b: string, cap = 8): number {
	if (a === b) {
		return 0;
	}
	if (Math.abs(a.length - b.length) > cap) {
		return cap + 1;
	}
	let prev: number[] = Array.from({ length: b.length + 1 }, (_, i) => i);
	let cur: number[] = new Array(b.length + 1).fill(0);
	for (let i = 1; i <= a.length; i++) {
		cur[0] = i;
		let best = cur[0] as number;
		for (let j = 1; j <= b.length; j++) {
			const cost = a[i - 1] === b[j - 1] ? 0 : 1;
			const v = Math.min(
				(prev[j] as number) + 1,
				(cur[j - 1] as number) + 1,
				(prev[j - 1] as number) + cost,
			);
			cur[j] = v;
			if (v < best) {
				best = v;
			}
		}
		if (best > cap) {
			return cap + 1;
		}
		[prev, cur] = [cur, prev];
	}
	return prev[b.length] as number;
}

/**
 * Similarity in [0, 1] between two already-normalised strings.
 *
 * 1 is an exact match; 0 means "no better than deleting one and typing the
 * other". Empty inputs score 0 so that an OCR line that yielded no Hebrew at
 * all can never win a match.
 */
function similarity(a: string, b: string): number {
	if (!(a && b)) {
		return 0;
	}
	const longest = Math.max(a.length, b.length);
	const cap = Math.min(8, longest);
	const d = editDistance(a, b, cap);
	if (d > cap) {
		return 0;
	}
	return 1 - d / longest;
}

/**
 * Letters Tesseract interchanges on this typeface, grouped by shape.
 *
 * Observed directly in the scans: p.3's guide word `אָבֵד` was read `אבר`
 * (ד→ר), p.21's `אוּ` was read `אי` (ו→י), and p.10's `אַבְרְקִין` was read
 * `אברקיז` (ן→ז). Treating these as half-cost substitutions separates OCR
 * noise from a genuinely different word.
 */
const CONFUSION_GROUPS: readonly string[] = [
	// Narrow uprights and hooks — much the largest source of slips. Final nun
	// and final kaf belong here too: they differ from ז/ו only by a descender.
	'דרוינזןך',
	'בכפמ',
	'החת',
	'םסטע',
	'גנ',
	'צץ',
	'ףפ',
];

const CONFUSION_OF = new Map<string, number>();
for (const [gi, group] of CONFUSION_GROUPS.entries()) {
	for (const ch of group) {
		// A letter may sit in several groups; the first is enough to pair it
		// with its most frequent confusion partners.
		if (!CONFUSION_OF.has(ch)) {
			CONFUSION_OF.set(ch, gi);
		}
	}
}

function substitutionCost(a: string, b: string): number {
	if (a === b) {
		return 0;
	}
	const ga = CONFUSION_OF.get(a);
	const gb = CONFUSION_OF.get(b);
	return ga !== undefined && ga === gb ? 0.5 : 1;
}

/**
 * {@link similarity}, but charging half for a substitution between letters this
 * OCR routinely confuses.
 *
 * Used only to judge whether a printed guide word confirms a built headword —
 * never to choose between candidates, where the softer metric would let a
 * wrong-but-similar word win.
 */
function ocrSimilarity(a: string, b: string): number {
	if (!(a && b)) {
		return 0;
	}
	let prev: number[] = Array.from({ length: b.length + 1 }, (_, i) => i);
	let cur: number[] = new Array(b.length + 1).fill(0);
	for (let i = 1; i <= a.length; i++) {
		cur[0] = i;
		for (let j = 1; j <= b.length; j++) {
			cur[j] = Math.min(
				(prev[j] as number) + 1,
				(cur[j - 1] as number) + 1,
				(prev[j - 1] as number) +
					substitutionCost(a[i - 1] as string, b[j - 1] as string),
			);
		}
		[prev, cur] = [cur, prev];
	}
	const d = prev[b.length] as number;
	return Math.max(0, 1 - d / Math.max(a.length, b.length));
}

export {
	editDistance,
	isHebrewLetter,
	looseKey,
	normalizeHeadword,
	ocrSimilarity,
	similarity,
};
