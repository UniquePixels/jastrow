/**
 * TalmudSagesExplorer — main orchestrator for the Talmudic Sages feature.
 *
 * Coordinates: SagesData, SagesGraph, SagesSidebar, toolbar, and routing.
 *
 * Usage:
 *   const explorer = new TalmudSagesExplorer();
 *   explorer.show();        // Show the sages view
 *   explorer.hide();        // Hide and return to dictionary
 *   explorer.openSage(id);  // Open a specific sage
 */

class TalmudSagesExplorer {
	constructor() {
		this.data = new SagesData();
		this.graph = null;
		this.sidebar = null;
		this._container = null;
		this._graphContainer = null;
		this._sidebarContainer = null;
		this._toolbarContainer = null;
		this._initialized = false;
		this._visible = false;
	}

	async show() {
		const firstShow = !this._initialized;
		if (firstShow) {
			await this._initialize();
		}
		this._container.hidden = false;
		this._visible = true;

		if (firstShow) {
			// Wait for layout, then set height and do initial zoom
			requestAnimationFrame(() => {
				this._updateHeight();
				requestAnimationFrame(() => {
					// Start zoomed in to ~0.5 scale, centered on the top
					this.graph.initialZoom();
				});
			});
		}
	}

	hide() {
		if (this._container) {
			this._container.hidden = true;
		}
		this._visible = false;
		if (this.sidebar?.isOpen) {
			this.sidebar.close();
		}
	}

	openSage(id) {
		if (!this._initialized) {
			return;
		}
		this.sidebar.open(id);
		this.graph.selectSage(id);
		this.graph.panToSage(id);
	}

	closeSage() {
		if (!this._initialized) {
			return;
		}
		this.sidebar.close();
		this.graph.clearSelection();
	}

	get isVisible() {
		return this._visible;
	}

	async _initialize() {
		// Load data
		await this.data.load();

		// Build DOM structure — create container and append to <main>
		this._container = document.createElement('div');
		this._container.id = 'sages-view';
		this._container.hidden = true;
		document.body.appendChild(this._container);
		this._buildToolbar();
		this._buildGraphContainer();
		this._buildSidebarContainer();
		this._buildZoomControls();
		this._buildLegend();

		// Initialize graph
		this.graph = new SagesGraph(this._graphContainer, this.data);
		this.graph.onNodeClick = (id) => {
			location.hash = `#sage:${id}`;
		};
		this.graph.render();

		// Initialize sidebar
		this.sidebar = new SagesSidebar(this._sidebarContainer, this.data);
		this.sidebar.onNavigate = (id) => {
			location.hash = `#sage:${id}`;
		};
		this.sidebar.onClose = () => {
			if (location.hash.startsWith('#sage:')) {
				location.hash = '#sages';
			}
		};

		// Click on graph background closes sidebar
		this._graphContainer.addEventListener('click', (e) => {
			// Only close if clicking the container itself or SVG background, not a node
			if (
				(e.target === this._graphContainer ||
					e.target.tagName === 'svg' ||
					e.target.classList.contains('zoom-group')) &&
				this.sidebar.isOpen
			) {
				location.hash = '#sages';
			}
		});

		// Keyboard handler
		document.addEventListener('keydown', (e) => {
			if (!this._visible) {
				return;
			}
			if (e.key === 'Escape' && this.sidebar.isOpen) {
				location.hash = '#sages';
				return;
			}
			if (e.key === 'Enter' || e.key === ' ') {
				const focused = document.activeElement;
				if (
					focused?.getAttribute('role') === 'button' &&
					focused.closest('.node')
				) {
					e.preventDefault();
					const id = focused.closest('[data-id]')?.getAttribute('data-id');
					if (id) {
						location.hash = `#sage:${id}`;
					}
				}
			}
		});

		this._initialized = true;
	}

	_updateHeight() {
		// Position the fixed overlay to fill the main content area
		// Measure where <main> starts (below header) and nav drawer width
		const main = document.querySelector('main');
		if (main) {
			const mainRect = main.getBoundingClientRect();
			this._container.style.top = `${mainRect.top}px`;
			this._container.style.left = `${mainRect.left}px`;
		}
	}

	_buildToolbar() {
		this._toolbarContainer = document.createElement('div');
		this._toolbarContainer.className = 'sages-toolbar';
		const inner = document.createElement('div');
		inner.className = 'sages-toolbar-inner';

		const searchInput = document.createElement('wa-input');
		searchInput.className = 'sages-search';
		searchInput.setAttribute('placeholder', 'Search sages...');
		searchInput.setAttribute('with-clear', '');
		searchInput.setAttribute('size', 'small');
		searchInput.setAttribute('aria-label', 'Search sages by name');
		const searchIcon = document.createElement('wa-icon');
		searchIcon.setAttribute('slot', 'prefix');
		searchIcon.setAttribute('name', 'magnifying-glass');
		searchInput.appendChild(searchIcon);

		const GROUP_CONFIG = [
			{ key: 'tanna', label: 'Tannaim', color: '#7c3aff' },
			{ key: 'amorai-israel', label: 'Amoraim (Israel)', color: '#2563eb' },
			{ key: 'amorai-bavel', label: 'Amoraim (Bavel)', color: '#17a34a' },
		];
		const activeGroups = new Set(['tanna']);
		const eraGroup = document.createElement('wa-button-group');
		eraGroup.setAttribute('label', 'Era filter');
		for (const { key, label, color } of GROUP_CONFIG) {
			const btn = document.createElement('wa-button');
			btn.className = 'era-filter';
			btn.dataset.group = key;
			btn.setAttribute('size', 'small');
			btn.style.setProperty('--wa-color-brand-fill-default', color);
			btn.style.setProperty('--wa-color-brand-fill-loud', color);
			if (activeGroups.has(key)) {
				btn.setAttribute('variant', 'brand');
			} else {
				btn.setAttribute('appearance', 'outlined');
			}
			btn.textContent = label;
			eraGroup.appendChild(btn);
		}

		const REL_CONFIG = [
			{ key: 'teacher-student', label: 'Teacher-Student', color: '#7c3aff' },
			{ key: 'family', label: 'Family', color: '#2563eb' },
			{ key: 'sibling', label: 'Sibling', color: '#6b7280' },
		];
		const activeRelTypes = new Set(REL_CONFIG.map((r) => r.key));
		const relGroup = document.createElement('wa-button-group');
		relGroup.setAttribute('label', 'Relationship filter');
		for (const { key, label, color } of REL_CONFIG) {
			const btn = document.createElement('wa-button');
			btn.className = 'rel-filter';
			btn.dataset.rel = key;
			btn.setAttribute('size', 'small');
			btn.setAttribute('variant', 'brand');
			btn.style.setProperty('--wa-color-brand-fill-default', color);
			btn.style.setProperty('--wa-color-brand-fill-loud', color);
			btn.textContent = label;
			relGroup.appendChild(btn);
		}

		inner.append(searchInput, eraGroup, relGroup);
		this._toolbarContainer.appendChild(inner);
		this._container.appendChild(this._toolbarContainer);

		// Search handler
		let debounceTimer;
		searchInput.addEventListener('wa-input', (e) => {
			clearTimeout(debounceTimer);
			debounceTimer = setTimeout(() => {
				const query = e.target.value;
				if (query) {
					const results = this.data.search(query);
					if (results.length > 0) {
						this.graph.panToSage(results[0].id);
						this.graph.selectSage(results[0].id);
					}
				} else {
					this.graph.clearSelection();
				}
			}, 200);
		});
		searchInput.addEventListener('wa-clear', () => {
			this.graph.clearSelection();
			this.graph.fitToView();
		});

		// Era filter handlers — multi-select toggle
		this._toolbarContainer.querySelectorAll('.era-filter').forEach((btn) => {
			btn.addEventListener('click', () => {
				const group = btn.dataset.group;
				if (activeGroups.has(group)) {
					// Don't allow turning off all groups
					if (activeGroups.size <= 1) {
						return;
					}
					activeGroups.delete(group);
					btn.removeAttribute('variant');
					btn.setAttribute('appearance', 'outlined');
				} else {
					activeGroups.add(group);
					btn.setAttribute('variant', 'brand');
					btn.removeAttribute('appearance');
				}
				this.graph.setFilters({ activeGroups: new Set(activeGroups) });
			});
		});

		// Relationship filter handlers — multi-select toggle
		this._toolbarContainer.querySelectorAll('.rel-filter').forEach((btn) => {
			btn.addEventListener('click', () => {
				const rel = btn.dataset.rel;
				if (activeRelTypes.has(rel)) {
					if (activeRelTypes.size <= 1) {
						return;
					}
					activeRelTypes.delete(rel);
					btn.removeAttribute('variant');
					btn.setAttribute('appearance', 'outlined');
				} else {
					activeRelTypes.add(rel);
					btn.setAttribute('variant', 'brand');
					btn.removeAttribute('appearance');
				}
				this.graph.setFilters({ activeRelTypes: new Set(activeRelTypes) });
			});
		});
	}

	_buildGraphContainer() {
		this._graphContainer = document.createElement('div');
		this._graphContainer.className = 'sages-graph-container';
		this._container.appendChild(this._graphContainer);
	}

	_buildSidebarContainer() {
		this._sidebarContainer = document.createElement('div');
		this._sidebarContainer.className = 'sages-sidebar';
		this._container.appendChild(this._sidebarContainer);
	}

	_buildZoomControls() {
		const controls = document.createElement('div');
		controls.className = 'sages-zoom-controls';
		for (const [cls, iconName, iconLabel] of [
			['zoom-in', 'plus', 'Zoom in'],
			['zoom-out', 'minus', 'Zoom out'],
			['zoom-fit', 'arrows-maximize', 'Fit to view'],
		]) {
			const btn = document.createElement('wa-button');
			btn.className = cls;
			btn.setAttribute('appearance', 'outlined');
			btn.setAttribute('size', 'small');
			const icon = document.createElement('wa-icon');
			icon.setAttribute('name', iconName);
			icon.setAttribute('label', iconLabel);
			btn.appendChild(icon);
			controls.appendChild(btn);
		}
		this._container.appendChild(controls);

		controls
			.querySelector('.zoom-in')
			.addEventListener('click', () => this.graph.zoomStep('in'));
		controls
			.querySelector('.zoom-out')
			.addEventListener('click', () => this.graph.zoomStep('out'));
		controls
			.querySelector('.zoom-fit')
			.addEventListener('click', () => this.graph.fitToView());
	}

	_buildLegend() {
		const legend = document.createElement('div');
		legend.className = 'sages-legend';

		const items = [
			{ color: '#f59e0b', border: '#d97706', label: 'Nasi', dot: true },
			{ line: 'solid', lineColor: '#7c3aff', label: 'Teacher \u2192 Student' },
			{ line: 'dashed', lineColor: '#2563eb', label: 'Parent \u2192 Child' },
			{ line: 'dotted', lineColor: '#ec4899', label: 'Spouse' },
			{
				line: 'dashed',
				lineColor: '#6b7280',
				label: 'Sibling',
				dashStyle: '2 4',
			},
		];

		for (const item of items) {
			const row = document.createElement('div');
			row.className = 'sages-legend-item';

			if (item.dot) {
				const swatch = document.createElement('span');
				swatch.className = 'sages-legend-swatch';
				swatch.style.cssText = `width:10px;height:10px;border-radius:50%;background:${item.color};border:1.5px solid ${item.border}`;
				row.appendChild(swatch);
			} else if (item.line) {
				const line = document.createElement('span');
				line.className = 'sages-legend-line';
				line.style.cssText = `border-top:2px ${item.line} ${item.lineColor}`;
				row.appendChild(line);
			} else {
				const swatch = document.createElement('span');
				swatch.className = 'sages-legend-swatch';
				swatch.style.cssText = `background:${item.color};border:1.5px solid ${item.border}`;
				row.appendChild(swatch);
			}

			const label = document.createElement('span');
			label.textContent = item.label;
			row.appendChild(label);
			legend.appendChild(row);
		}

		this._container.appendChild(legend);
	}
}

window.TalmudSagesExplorer = TalmudSagesExplorer;
