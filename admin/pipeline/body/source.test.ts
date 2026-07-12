import { describe, expect, it } from 'bun:test';
import { parseSourceEntry } from './source.ts';

describe('parseSourceEntry', () => {
	it('parses the fields the body model consumes', () => {
		const line = JSON.stringify({
			_id: { $oid: 'x' },
			rid: 'A00014',
			headword: 'אָב II',
			parent_lexicon: 'Jastrow Dictionary',
			language_code: '(b. h.;',
			language_reference: ' אבה)',
			content: {
				morphology: 'm.',
				senses: [
					{ definition: 'd0' },
					{ number: '1)', definition: 'd1' },
					{
						grammar: { verbal_stem: 'Nif.', binyan_form: ['נֶאֱבַד'] },
						senses: [{ definition: 'dn' }],
					},
				],
			},
		});
		const e = parseSourceEntry(line);
		expect(e.rid).toBe('A00014');
		expect(e.content.morphology).toBe('m.');
		expect(e.content.senses).toHaveLength(3);
		expect(e.content.senses[2]?.grammar?.verbal_stem).toBe('Nif.');
	});
});
