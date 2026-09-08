/**
 * CodeRabbit PR #71, comment 3951117332: `ownForms` built its
 * `forms`/`skeletons` from `baseHeadword` alone, which strips the
 * homograph numeral and editorial asterisk but not the editorial
 * parens Jastrow wraps an indirectly-attested alt in (`(גּוּם)`). A
 * display of the bare form (`גום`) then failed to match the host's
 * own recorded alt, so `ownFormEscapeHint` (and the other own-form
 * rules in link-anomalies.ts) silently missed the entry. Fixed by
 * routing through `recordedVariant`, same as `alts`/`formsOf`/
 * `recordedSkeletons` in `buildHeadwordIndex` already do.
 */
import { describe, expect, it } from 'bun:test';
import type { SourceEntry } from '../body/types.ts';
import { ownForms } from './headword-index.ts';

function entry(
	headword: string,
	extra: Partial<SourceEntry> = {},
): SourceEntry {
	return {
		content: { senses: [{ definition: 'stub' }] },
		headword,
		rid: 'C00000',
		...extra,
	} as SourceEntry;
}

describe('ownForms strips editorial parens from a recorded alt (comment 3951117332)', () => {
	it('skeletons match the bare display of a parenthesised alt', () => {
		const own = ownForms(entry('גְּמַם', { alt_headwords: ['(גּוּם)'] }));
		expect(own.skeletons).toContain('גום');
		expect(own.skeletons).not.toContain('(גום)');
	});

	it('forms match the bare consonantal display too', () => {
		const own = ownForms(entry('גְּמַם', { alt_headwords: ['(גּוּם)'] }));
		expect(own.forms).toContain('גם');
		expect(own.forms).not.toContain('(גם)');
	});
});
