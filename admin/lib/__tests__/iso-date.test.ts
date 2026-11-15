import { describe, expect, it } from 'bun:test';
import { isIsoDate } from '../iso-date.ts';

describe('isIsoDate', () => {
	it.each([
		['2026-10-13', true],
		['2024-02-29', true],
		['2026-02-29', false],
		['2026-13-01', false],
		['2026-1-01', false],
		['20261013', false],
	])('%s → %p', (value, expected) => {
		expect(isIsoDate(value)).toBe(expected);
	});
});
