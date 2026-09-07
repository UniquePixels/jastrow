import { describe, expect, it } from 'bun:test';
import {
	editDistance,
	isHebrewLetter,
	looseKey,
	normalizeHeadword,
	ocrSimilarity,
	similarity,
} from './hebrew.ts';

describe('normalizeHeadword', () => {
	it('strips niqqud so vocalised and bare spellings agree', () => {
		// The two forms Jastrow prints for the same guide word on p.226/227.
		expect(normalizeHeadword('גּוּפְתָּיָיה')).toBe('גופתייה');
		expect(normalizeHeadword('גּוֹרְדַּיְיתָא')).toBe(normalizeHeadword('גורדייתא'));
	});

	it('drops Roman-numeral homograph markers', () => {
		expect(normalizeHeadword('חָבַב I')).toBe('חבב');
		expect(normalizeHeadword('חבב III')).toBe('חבב');
	});

	it('drops superscript sense markers', () => {
		expect(normalizeHeadword('א ²')).toBe('א');
		expect(normalizeHeadword('א ⁶')).toBe('א');
	});

	it('drops the Sefaria asterisk prefix and Hebrew punctuation', () => {
		expect(normalizeHeadword('*גִּיוָוטָאֵי')).toBe('גיווטאי');
		expect(normalizeHeadword('אִ־')).toBe('א');
		expect(normalizeHeadword('ע״ע')).toBe('עע');
	});

	it('discards Latin fragments Tesseract mixes into Hebrew lines', () => {
		expect(normalizeHeadword('are.‏ .+ ,גורדייתא')).toBe('גורדייתא');
	});

	it('returns empty for a line with no Hebrew at all', () => {
		expect(normalizeHeadword('v. next w.')).toBe('');
	});
});

describe('looseKey', () => {
	it('folds final forms onto their base letter', () => {
		expect(looseKey('מִין')).toBe('מינ');
		expect(looseKey('גּוֹרְדְּיָיכוֹן')).toBe(looseKey('גורדייכונ'));
	});

	it('agrees with normalizeHeadword when no finals are present', () => {
		expect(looseKey('גורדייתא')).toBe(normalizeHeadword('גורדייתא'));
	});
});

describe('isHebrewLetter', () => {
	it('accepts letters and finals, rejects marks and Latin', () => {
		expect(isHebrewLetter('א')).toBe(true);
		expect(isHebrewLetter('ם')).toBe(true);
		expect(isHebrewLetter('ּ')).toBe(false);
		expect(isHebrewLetter('a')).toBe(false);
	});
});

describe('editDistance', () => {
	it('is zero for identical strings', () => {
		expect(editDistance('גורדייתא', 'גורדייתא')).toBe(0);
	});

	it('counts single-character edits', () => {
		expect(editDistance('גורדייתא', 'קורדייתא')).toBe(1);
		expect(editDistance('גורדייתא', 'גורדיתא')).toBe(1);
	});

	it('bails out past the cap rather than reporting a real distance', () => {
		expect(editDistance('אבג', 'שרקצפעסנמלכיטחז', 4)).toBe(5);
	});

	it('respects the cap on length difference alone', () => {
		expect(editDistance('א', 'אבגדהוזחטי', 3)).toBe(4);
	});
});

describe('similarity', () => {
	it('scores an exact match 1', () => {
		expect(similarity('גורדייתא', 'גורדייתא')).toBe(1);
	});

	it('scores a one-letter OCR slip highly', () => {
		expect(similarity('גורדייתא', 'קורדייתא')).toBeCloseTo(1 - 1 / 8, 6);
	});

	it('scores unrelated words far below any usable threshold', () => {
		// Not exactly 0 — two 8-letter strings can share a stray letter — but
		// nowhere near the ~0.6 a caller accepts as a match.
		expect(similarity('גורדייתא', 'מינוי')).toBeLessThan(0.3);
	});

	it('scores a pair beyond the distance cap exactly 0', () => {
		expect(similarity('אבג', 'שרקצפעסנמלכיטחז')).toBe(0);
	});

	it('scores an empty side 0 so blank OCR never wins', () => {
		expect(similarity('', 'גורדייתא')).toBe(0);
	});
});

describe('ocrSimilarity', () => {
	it('forgives the confusions actually seen in these scans', () => {
		// p.3's guide word read ד as ר; p.21's read ו as י; p.10's read ן as ז.
		expect(ocrSimilarity('אבד', 'אבר')).toBeGreaterThan(
			similarity('אבד', 'אבר'),
		);
		expect(ocrSimilarity('או', 'אי')).toBeGreaterThan(similarity('או', 'אי'));
		expect(ocrSimilarity('אברקין', 'אברקיז')).toBeGreaterThan(0.9);
	});

	it('still scores an exact match 1', () => {
		expect(ocrSimilarity('נטל', 'נטל')).toBe(1);
	});

	it('does not rescue a genuinely different word', () => {
		expect(ocrSimilarity('נטל', 'גורדייתא')).toBeLessThan(0.3);
	});

	it('scores an empty side 0', () => {
		expect(ocrSimilarity('', 'נטל')).toBe(0);
	});
});
