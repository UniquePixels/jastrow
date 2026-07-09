import { describe, expect, it } from 'bun:test';
import { parseJsonlDiff } from './parse-jsonl-diff.ts';

const diff = (body: string): string =>
	`diff --git a/data/jastrow-part1.jsonl b/data/jastrow-part1.jsonl\n--- a/data/jastrow-part1.jsonl\n+++ b/data/jastrow-part1.jsonl\n@@ -1,2 +1,2 @@\n${body}`;

describe('parseJsonlDiff', () => {
	it('pairs a remove and add with the same id into a modify', () => {
		const records = parseJsonlDiff(
			diff(
				'-{"hw":"א","id":"A00000","c":{"s":[]}}\n+{"hw":"אָ","id":"A00000","c":{"s":[]}}\n',
			),
		);
		expect(records).toEqual([
			{
				id: 'A00000',
				op: 'modify',
				before: '{"hw":"א","id":"A00000","c":{"s":[]}}',
				after: '{"hw":"אָ","id":"A00000","c":{"s":[]}}',
			},
		]);
	});

	it('reports a pure addition as add', () => {
		const records = parseJsonlDiff(
			diff('+{"hw":"ב","id":"B00001","c":{"s":[]}}\n'),
		);
		expect(records).toEqual([
			{
				id: 'B00001',
				op: 'add',
				after: '{"hw":"ב","id":"B00001","c":{"s":[]}}',
			},
		]);
	});

	it('reports a pure removal as remove', () => {
		const records = parseJsonlDiff(
			diff('-{"hw":"ג","id":"C00002","c":{"s":[]}}\n'),
		);
		expect(records).toEqual([
			{
				id: 'C00002',
				op: 'remove',
				before: '{"hw":"ג","id":"C00002","c":{"s":[]}}',
			},
		]);
	});

	it('keeps distinct entries in one hunk separate', () => {
		const records = parseJsonlDiff(
			diff(
				'-{"hw":"א","id":"A00000"}\n+{"hw":"אָ","id":"A00000"}\n+{"hw":"ב","id":"B00001"}\n',
			),
		);
		expect(records).toEqual([
			{
				id: 'A00000',
				op: 'modify',
				before: '{"hw":"א","id":"A00000"}',
				after: '{"hw":"אָ","id":"A00000"}',
			},
			{ id: 'B00001', op: 'add', after: '{"hw":"ב","id":"B00001"}' },
		]);
	});

	it('ignores header and non-JSON lines', () => {
		expect(parseJsonlDiff(diff('+not json\n'))).toEqual([]);
	});
});
