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
for (const rid of ['K00597', 'K00598', 'K00599', 'K00600']) {
	const e = healed.get(rid);
	if (!e) {
		console.log(`${rid} missing`);
		continue;
	}
	const d = strip(e.content.senses[0]?.definition ?? '');
	console.log(
		`\n${rid}  headword=${e.headword}  prev=${e.prev_hw}  next=${e.next_hw}  senses=${e.content.senses.length}`,
	);
	console.log(`  ${d.slice(0, 260).replace(/\s+/gu, ' ')}`);
}
