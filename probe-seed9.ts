import { IMPLIED_ONE_CENSUS } from './admin/pipeline/body/implied-one-census.ts';
import {
	seedRow,
	SEED_CONFIRMED,
} from './admin/pipeline/patch/seed-implied-one.ts';
import { healedCorpus } from './admin/pipeline/research/residue-sweep.ts';
const healed = await healedCorpus();
for (const rid of [
	'E00005',
	'E00148',
	'E00298',
	'I00661',
	'I00822',
	'P00816',
	'P00856',
	'Q00990',
	'S01355',
]) {
	const inCensus = IMPLIED_ONE_CENSUS.includes(rid);
	const already = SEED_CONFIRMED.includes(rid);
	let outcome: string;
	try {
		const row = seedRow(healed.get(rid)!, 900);
		outcome = row.patches
			.map(
				(p) =>
					`${p['op']}${p['op'] === 'split' ? (p['payload'] as { marker: string }).marker : ''}`,
			)
			.join(' ');
	} catch (e) {
		outcome = `THREW: ${(e as Error).message.slice(0, 90)}`;
	}
	console.log(`${rid}\tcensus=${inCensus}\tseeded=${already}\t${outcome}`);
}
