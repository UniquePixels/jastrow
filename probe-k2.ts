import { healedCorpus } from './admin/pipeline/research/residue-sweep.ts';
const strip = (t: string) => {
	let o = t,
		p: string;
	do {
		p = o;
		o = o.replace(/<[^>]+>/gu, '');
	} while (o !== p);
	return o;
};
const healed = await healedCorpus();
for (const rid of ['K00599', 'L00565', 'O01387']) {
	const e = healed.get(rid)!;
	console.log(`\n=== ${rid} ${e.headword} ===`);
	console.log(
		`  language_reference=${JSON.stringify(e.language_reference)} language_code=${JSON.stringify(e.language_code)}`,
	);
	console.log(`  morphology=${JSON.stringify(e.content.morphology)}`);
	e.content.senses.forEach((s, i) => {
		const d = strip(s.definition ?? '');
		console.log(
			`  sense[${i}] number=${JSON.stringify(s.number)} len=${d.length}: ${d.slice(0, 150).replace(/\s+/gu, ' ')}`,
		);
	});
}
