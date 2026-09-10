import { healedCorpus } from './admin/pipeline/research/residue-sweep.ts';
import type { SourceSense } from './admin/pipeline/body/types.ts';
const strip = (t: string) => {
	let o = t,
		p: string;
	do {
		p = o;
		o = o.replace(/<[^>]+>/gu, '');
	} while (o !== p);
	return o;
};
function* walk(l: readonly SourceSense[]): Generator<SourceSense> {
	for (const s of l) {
		yield s;
		if (s.senses) yield* walk(s.senses);
	}
}
const healed = await healedCorpus();
for (const rid of [
	'E00148',
	'E00298',
	'I00822',
	'E00005',
	'P00816',
	'P00856',
	'Q00990',
	'S01355',
]) {
	const e = healed.get(rid)!;
	console.log(`\n=== ${rid} ${e.headword} ===`);
	for (const s of walk(e.content.senses)) {
		const d = strip(s.definition ?? '');
		const l = d.match(/\bl\)/gu);
		if (l)
			console.log(
				`  number=${JSON.stringify(s.number)} has ${l.length}x "l)" : …${d.slice(Math.max(0, d.indexOf('l)') - 60), d.indexOf('l)') + 70).replace(/\s+/gu, ' ')}…`,
			);
	}
	const first = strip(e.content.senses[0]?.definition ?? '');
	console.log(`  head: ${first.slice(0, 110).replace(/\s+/gu, ' ')}`);
}
