/**
 * SagesData — loads sage data and builds bidirectional relationship index.
 *
 * Usage:
 *   const data = new SagesData();
 *   await data.load();
 *   const sage = data.getById('rabbi-akiva');
 *   const rels = data.getRelationships('rabbi-akiva');
 */

(() => {
	const INVERSE_TYPES = {
		teacher: 'student',
		student: 'teacher',
		father: 'son',
		son: 'father',
		wife: 'husband',
		husband: 'wife',
		sibling: 'sibling',
		'brother-in-law': 'brother-in-law',
	};

	class SagesData {
		constructor() {
			this.sages = [];
			this.landmarks = [];
			this._byId = new Map();
			this._relationships = new Map();
			this._loaded = false;
		}

		async load() {
			if (this._loaded) {
				return;
			}
			const response = await fetch('data/sages.json');
			if (!response.ok) {
				throw new Error(
					`Failed to load sages data: ${response.status} ${response.statusText}`,
				);
			}
			const data = await response.json();
			this.sages = data.sages;
			this.landmarks = data.landmarks;
			this._buildIndex();
			this._loaded = true;
		}

		_buildIndex() {
			for (const sage of this.sages) {
				this._byId.set(sage.id, sage);
				this._relationships.set(sage.id, []);
			}

			for (const sage of this.sages) {
				for (const rel of sage.relationships || []) {
					this._relationships.get(sage.id).push({
						type: rel.type,
						targetId: rel.target,
					});

					if (this._byId.has(rel.target)) {
						const inverseType = INVERSE_TYPES[rel.type];
						if (inverseType) {
							this._relationships.get(rel.target).push({
								type: inverseType,
								targetId: sage.id,
							});
						}
					}
				}
			}
		}

		getById(id) {
			return this._byId.get(id) || null;
		}

		getRelationships(id) {
			return this._relationships.get(id) || [];
		}

		getGroupedRelationships(id) {
			const rels = this.getRelationships(id);
			const grouped = new Map();
			for (const rel of rels) {
				const sage = this._byId.get(rel.targetId);
				if (!sage) {
					continue;
				}
				if (!grouped.has(rel.type)) {
					grouped.set(rel.type, []);
				}
				grouped.get(rel.type).push({ id: sage.id, name: sage.name });
			}
			return grouped;
		}

		getEdges() {
			const seen = new Set();
			const edges = [];
			for (const sage of this.sages) {
				for (const rel of sage.relationships || []) {
					const key = `${[sage.id, rel.target].sort().join('|')}|${rel.type}`;
					if (!seen.has(key)) {
						seen.add(key);
						edges.push({
							sourceId: sage.id,
							targetId: rel.target,
							type: rel.type,
						});
					}
				}
			}
			return edges;
		}

		search(query) {
			if (!query) {
				return [];
			}
			const q = query.toLowerCase();
			return this.sages.filter(
				(s) => s.name.en.toLowerCase().includes(q) || s.name.he.includes(query),
			);
		}

		filterByEra(era) {
			if (era === 'all') {
				return this.sages;
			}
			return this.sages.filter((s) => s.era === era);
		}
	}

	/**
	 * Format birth/death dates for display.
	 * Shared utility used by SagesGraph and SagesSidebar.
	 */
	SagesData.formatDates = (dates) => {
		if (!dates) {
			return '';
		}
		const b =
			dates.born < 0 ? `${Math.abs(dates.born)} BCE` : `${dates.born} CE`;
		const d =
			dates.died < 0 ? `${Math.abs(dates.died)} BCE` : `${dates.died} CE`;
		const approx = dates.approximate ? '~' : '';
		return `${approx}${b} \u2013 ${approx}${d}`;
	};

	window.SagesData = SagesData;
})();
