/**
 * Baseline audit: did the deployed JSONL enter git carrying anything
 * beyond the documented v1 extraction transform? mine.ts (spec 1.3)
 * skips the baseline import commit on the assumption it holds no
 * edits; this tool tests that assumption by transforming the raw
 * extraction at the baseline commit into the predicted deployed shape
 * (baseline-transform.ts) and diffing it against the actual deployed
 * files at the same commit. Residue = candidate pre-git hand edits.
 *
 * Writes data/source/baseline-audit-report.json (regenerable — data
 * architecture spec D2, not committed).
 */
import {
	expectedDeployed,
	extractLinks,
	type Link,
	type RawEntry,
	sefariaUrl,
	stripAbbrTags,
	stripLinkAttrs,
} from './baseline-transform.ts';

const BASELINE = '8c10b59ae5476b351e934879890ffec91ee54c5f';
const REPORT_PATH = 'data/source/baseline-audit-report.json';
const RAW_PATHS = [
	'data/raw/jastrow-part1.jsonl',
	'data/raw/jastrow-part2.jsonl',
];
const DEPLOYED_PATHS = ['data/jastrow-part1.jsonl', 'data/jastrow-part2.jsonl'];
/** Deployed fields with no raw source (v1-derived enrichments):
 * `g` = language/POS/gender parsed from entry text; `rf` = categorized
 * rollup of link targets and refs (keys j/t/b/mi/o). */
const DERIVED_FIELDS = ['g', 'rf'] as const;

/** JSON.stringify with recursively sorted object keys. */
const canon = (v: unknown): string =>
	JSON.stringify(v, (_k, val: unknown) =>
		val !== null && typeof val === 'object' && !Array.isArray(val)
			? Object.fromEntries(
					Object.entries(val).sort(([a], [b]) => a.localeCompare(b)),
				)
			: val,
	) ?? 'null';

interface LinkIssue {
	deployed: string;
	kind: 'count' | 'headword' | 'url';
	raw: string;
	rid: string;
}

interface BaselineReport {
	baseline: string;
	changed: { fields: string[]; rid: string }[];
	derivedFieldsExcluded: readonly string[];
	entries: { deployed: number; matching: number; raw: number };
	links: {
		external: number;
		internal: number;
		issues: LinkIssue[];
	};
}

async function loadAt(
	paths: string[],
	key: 'rid' | 'id',
): Promise<Map<string, Record<string, unknown>>> {
	const map = new Map<string, Record<string, unknown>>();
	for (const path of paths) {
		const proc = Bun.spawn(['git', 'show', `${BASELINE}:${path}`], {
			stderr: 'pipe',
		});
		const text = await new Response(proc.stdout).text();
		if ((await proc.exited) !== 0) {
			throw new Error(
				`git show ${BASELINE}:${path} failed: ${await new Response(proc.stderr).text()}`,
			);
		}
		for (const line of text.split('\n')) {
			if (line.trim()) {
				const entry = JSON.parse(line) as Record<string, unknown>;
				map.set(entry[key] as string, entry);
			}
		}
	}
	return map;
}

/** Field names on which the predicted and actual entries differ, with
 * anchor attributes stripped so link rewriting does not register. */
function diffFields(
	expected: Record<string, unknown>,
	actual: Record<string, unknown>,
): string[] {
	const fields: string[] = [];
	for (const field of new Set([
		...Object.keys(expected),
		...Object.keys(actual),
	])) {
		if (
			stripAbbrTags(stripLinkAttrs(canon(expected[field]))) !==
			stripAbbrTags(stripLinkAttrs(canon(actual[field])))
		) {
			fields.push(field);
		}
	}
	return fields.sort();
}

const LEXICON_PREFIX = /^Jastrow, /;
const SENSE_SUFFIX = / \d+$/;
const RID_PREFIX = /^#rid:/;

/** "Jastrow, אָב I 1" → "אָב I" (drop lexicon prefix + sense number). */
const refHeadword = (dataRef: string): string =>
	dataRef.replace(LEXICON_PREFIX, '').replace(SENSE_SUFFIX, '');

/** Every string leaf of a JSON value, in stable traversal order. */
function collectStrings(value: unknown, out: string[] = []): string[] {
	if (typeof value === 'string') {
		out.push(value);
	} else if (Array.isArray(value)) {
		for (const item of value) {
			collectStrings(item, out);
		}
	} else if (value !== null && typeof value === 'object') {
		for (const key of Object.keys(value).sort()) {
			collectStrings((value as Record<string, unknown>)[key], out);
		}
	}
	return out;
}

interface LinkAuditInput {
	actual: Record<string, unknown>;
	expected: Record<string, unknown>;
	rid: string;
}

function auditLinks(
	{ rid, expected, actual }: LinkAuditInput,
	rawEntries: Map<string, Record<string, unknown>>,
	links: BaselineReport['links'],
): void {
	const rawLinks: Link[] = extractLinks(collectStrings(expected).join('\n'));
	const depLinks: Link[] = extractLinks(collectStrings(actual).join('\n'));
	if (rawLinks.length !== depLinks.length) {
		links.issues.push({
			rid,
			kind: 'count',
			raw: String(rawLinks.length),
			deployed: String(depLinks.length),
		});
		return;
	}
	for (const [i, rawLink] of rawLinks.entries()) {
		const dep = depLinks[i] as Link;
		if (rawLink.target.startsWith('Jastrow, ')) {
			links.internal++;
			const target = rawEntries.get(dep.target.replace(RID_PREFIX, ''));
			if (target?.['headword'] !== refHeadword(rawLink.target)) {
				links.issues.push({
					rid,
					kind: 'headword',
					raw: rawLink.target,
					deployed: dep.target,
				});
			}
		} else {
			links.external++;
			if (dep.target !== sefariaUrl(rawLink.target)) {
				links.issues.push({
					rid,
					kind: 'url',
					raw: rawLink.target,
					deployed: dep.target,
				});
			}
		}
	}
}

const raw: Map<string, Record<string, unknown>> = await loadAt(
	RAW_PATHS,
	'rid',
);
const deployed: Map<string, Record<string, unknown>> = await loadAt(
	DEPLOYED_PATHS,
	'id',
);

const report: BaselineReport = {
	baseline: BASELINE,
	entries: { raw: raw.size, deployed: deployed.size, matching: 0 },
	derivedFieldsExcluded: DERIVED_FIELDS,
	changed: [],
	links: { internal: 0, external: 0, issues: [] },
};

for (const [rid, rawEntry] of raw) {
	const actualFull = deployed.get(rid);
	if (!actualFull) {
		report.changed.push({ rid, fields: ['<missing in deployed>'] });
		continue;
	}
	const actual = { ...actualFull };
	for (const field of DERIVED_FIELDS) {
		delete actual[field];
	}
	const expected = expectedDeployed(rawEntry as unknown as RawEntry);
	const fields = diffFields(expected, actual);
	if (fields.length > 0) {
		report.changed.push({ rid, fields });
	} else {
		report.entries.matching++;
	}
	auditLinks({ rid, expected, actual }, raw, report.links);
}
report.changed.sort((a, b) => a.rid.localeCompare(b.rid));

await Bun.write(REPORT_PATH, `${JSON.stringify(report, null, '\t')}\n`);
console.log(
	`raw=${raw.size} deployed=${deployed.size} matching=${report.entries.matching} changed=${report.changed.length}`,
);
console.log(
	`links: internal=${report.links.internal} external=${report.links.external} issues=${report.links.issues.length}`,
);
console.log(`report written to ${REPORT_PATH}`);
