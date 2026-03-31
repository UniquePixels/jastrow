/**
 * Main Application Logic for Jastrow Dictionary
 */

// Import utilities from window object (loaded via script tags in index.html)
// Using vanilla JS pattern without build process
const { sanitizeURL, sanitizeSearchQuery, validatePageNumber } = window;
const {
	PAGINATION,
	DICTIONARY,
	SCROLL,
	TIMEOUTS,
	VALIDATION,
	EXTERNAL_URLS,
	SEARCH,
} = window;

const LANGUAGE_BADGES = {
	bh: { badge: 'Heb.', tooltip: 'Biblical Hebrew' },
	he: { badge: 'Heb.', tooltip: 'Hebrew' },
	ar: { badge: 'Aram.', tooltip: 'Aramaic' },
	'ar+he': { badge: 'Aram.+Heb.', tooltip: 'Aramaic + Hebrew' },
	'ar+bh': { badge: 'Aram.+BH', tooltip: 'Aramaic + Biblical Hebrew' },
	'he+ar': { badge: 'Heb.+Aram.', tooltip: 'Hebrew + Aramaic' },
	ab: { badge: 'Arabic', tooltip: 'Arabic' },
};

const POS_BADGES = {
	n: { badge: 'Noun', tooltip: 'Noun' },
	v: { badge: 'Verb', tooltip: 'Verb' },
	a: { badge: 'Adj.', tooltip: 'Adjective' },
	av: { badge: 'Adv.', tooltip: 'Adverb' },
	pt: { badge: 'Part.', tooltip: 'Participle' },
	ij: { badge: 'Interj.', tooltip: 'Interjection' },
	cj: { badge: 'Conj.', tooltip: 'Conjunction' },
};

const GENDER_BADGES = {
	m: { badge: 'm', tooltip: 'Masculine' },
	f: { badge: 'f', tooltip: 'Feminine' },
};

const REF_VARIANTS = {
	t: 'brand',
	b: 'success',
	mi: 'warning',
	o: 'neutral',
};

class JastrowApp {
	constructor() {
		this.dataLoader = null;
		this.scrollManager = null;
		this.totalDictPages = DICTIONARY.TOTAL_PAGES;
		this.currentSearchMode = 'word'; // 'word' or 'reference'

		// DOM elements
		this.mainContent = null;
		this.searchInput = null;
		this.modeWordBtn = null;
		this.modeRefBtn = null;
		this.keyboardToggle = null;
		this.keyboardOverlay = null;
		this.pageInput = null;
		this.pageJumpButton = null;

		this._autocompleteTimer = null;
		this._selectingOption = false; // guard against double-execution

		this._hebrewAbbrCache = null; // cached hebrew abbreviation data
		this._abbrDialogBuilt = false; // track if dialog content has been built
		this._guideDialogBuilt = false; // track if guide content has been built
		this._lastFocusedElement = null;
		this._previousTitle = null;
	}

	/**
	 * Initialize the application
	 */
	async init() {
		// Initialize data loader with split data files
		this.dataLoader = new JastrowDataLoader(DICTIONARY.DATA_URLS);

		// Show loading indicator
		this.showLoadingIndicator();

		// Check for pending service worker update — apply before loading data
		if (
			'serviceWorker' in navigator &&
			!location.hostname.startsWith('localhost') &&
			!location.hostname.startsWith('127.')
		) {
			try {
				const registration = await navigator.serviceWorker.getRegistration();
				if (registration?.waiting) {
					// New SW is waiting — activate it and reload to get new code
					const messageEl = document.getElementById('load-message');
					if (messageEl) {
						messageEl.textContent = 'Updating app...';
					}

					await new Promise((resolve) => {
						navigator.serviceWorker.addEventListener(
							'controllerchange',
							resolve,
							{ once: true },
						);
						registration.waiting.postMessage({
							type: 'SKIP_WAITING',
						});
					});
					window.location.reload();
					return; // Stop init — reload will re-run it
				}
			} catch (swError) {
				if (window.DEBUG) {
					console.warn('[App] SW update check failed:', swError);
				}
				// Continue with normal init
			}
		}

		// Load data
		try {
			await this.dataLoader.load((progress) => {
				this.updateLoadingProgress(progress);
			});

			// Initialize UI
			this.initializeUI();

			// Create infinite scroll manager
			this.scrollManager = new InfiniteScroll({
				container: this.mainContent,
				createEntry: (entry) => this.createEntryElement(entry),
				getEntries: (start, count) =>
					this.dataLoader.getEntriesByRange(start, count),
				getPageStartIndex: (page) => this.dataLoader.getPageStartIndex(page),
				totalEntries: this.dataLoader.getTotalEntries(),
				onPageChange: null,
			});
			this.scrollManager.init();

			// Delegated abbreviation tooltip + click-to-dialog listeners
			this._setupAbbrListeners();

			// Build dialog content lazily on first open
			const abbrDialog = document.querySelector('.abbr-dialog');
			if (abbrDialog) {
				abbrDialog.addEventListener(
					'wa-show',
					() => this.buildAbbreviationsDialog(),
					{ once: true },
				);
			}
			const guideDialog = document.querySelector('.guide-dialog');
			if (guideDialog) {
				guideDialog.addEventListener('wa-show', () => this.buildGuideDialog(), {
					once: true,
				});
			}

			// Page scan dialog — clear #scan: hash on close
			const pageDialog = document.querySelector('.page-dialog');
			if (pageDialog) {
				pageDialog.addEventListener('wa-hide', () => {
					if (window.location.hash.startsWith('#scan:')) {
						window.history.pushState(null, '', window.location.pathname);
					}
					if (this._lastFocusedElement) {
						this._lastFocusedElement.focus();
						this._lastFocusedElement = null;
					}
				});
			}

			// Visible page tracking is handled internally by scroll manager

			// Handle URL parameters (will load initial page if no hash)
			this.handleURLParameters();

			// Log version info to console for cache verification
			this._logVersionInfo();

			// Dispatch event to signal app is ready
			window.dispatchEvent(new CustomEvent('jastrow-app-initialized'));
		} catch (error) {
			console.error('Failed to initialize:', error);

			// Show user-friendly error message based on error type
			let errorMessage = 'Failed to load dictionary data. ';

			if (!navigator.onLine) {
				errorMessage +=
					'You appear to be offline. Please check your internet connection and try again.';
			} else if (error?.message?.includes('fetch')) {
				errorMessage +=
					'Unable to reach the server. Please check your connection and refresh the page.';
			} else {
				errorMessage += 'Please refresh the page to try again.';
			}

			this.showError(errorMessage);
		}
	}

	/**
	 * Initialize UI elements and event listeners
	 */
	initializeUI() {
		// Get DOM elements
		this.searchInput = document.querySelector('.search');
		this.searchInput.setAttribute('aria-autocomplete', 'list');
		this.searchInput.setAttribute('aria-controls', 'search-autocomplete-list');
		this.searchInput.setAttribute('aria-expanded', 'false');
		this.searchButton = document.querySelector('#search-button');
		this.modeWordBtn = document.getElementById('mode-word');
		this.modeRefBtn = document.getElementById('mode-ref');
		this.keyboardToggle = document.getElementById('keyboard-toggle');
		this.keyboardOverlay = document.getElementById('keyboard-overlay');
		this.pageInput = document.querySelector('#page-jump-input');
		this.pageJumpButton = document.querySelector('#page-jump-button');

		// Contextual share dropdown menu
		this._setupShareMenu();

		// Dialog share buttons
		this._setupDialogShareButtons();

		// Hide loading indicator
		this.hideLoadingIndicator();

		// Event delegation for page links, reference buttons, and permalink buttons
		document.addEventListener('click', (e) => {
			const pageLink = e.target.closest('.show-page');
			if (pageLink?.dataset.page) {
				e.preventDefault();
				this.showPageDialog(parseInt(pageLink.dataset.page, 10));
				return;
			}

			const refButton = e.target.closest('.ref-button');
			if (refButton?.dataset.ref) {
				e.preventDefault();
				this.syncSearchMode('reference');
				this._setSearchValue(refButton.dataset.ref);
				this.handleSearch(refButton.dataset.ref);
			}
		});

		// Execute search function
		const executeSearch = () => {
			const value = this._getSearchValue();
			if (window.DEBUG) {
				console.log(
					'[Search] executeSearch called, value:',
					JSON.stringify(value),
					'mode:',
					this.currentSearchMode,
				);
			}
			if (!value.trim()) {
				return; // Ignore empty searches
			}
			this._saveSearchHistory(value, this.currentSearchMode);
			this.handleSearch(value);
		};

		// Search on button click
		this.searchButton.addEventListener('click', executeSearch);

		// Search on Enter key
		this.searchInput.addEventListener('keydown', (e) => {
			if (e.key === 'Enter') {
				this._hideDropdown();
				if (this.keyboardOverlay && !this.keyboardOverlay.hidden) {
					this._toggleKeyboard();
				}
				executeSearch();
			} else if (e.key === 'Escape') {
				this._hideDropdown();
			} else if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
				this._navigateDropdown(e.key === 'ArrowDown' ? 1 : -1);
				e.preventDefault();
			}
		});

		// Autocomplete — debounced input
		this.searchInput.addEventListener('input', () => {
			clearTimeout(this._autocompleteTimer);
			this._autocompleteTimer = setTimeout(() => {
				this._updateAutocompleteOptions();
			}, SEARCH.AUTOCOMPLETE_DEBOUNCE);
		});

		// Show history on focus when input is empty
		this.searchInput.addEventListener('focus', () => {
			if (!this._getSearchValue().trim()) {
				this._updateAutocompleteOptions();
			}
		});

		// Close dropdown when clicking outside
		document.addEventListener('click', (e) => {
			if (
				!(
					this.searchInput.contains(e.target) ||
					this._dropdownEl?.contains(e.target)
				)
			) {
				this._hideDropdown();
			}
		});

		// Clear button - reset to page 1
		this.searchInput.addEventListener('wa-clear', () => {
			history.pushState(null, '', window.location.pathname);
			this.loadInitialPage();
		});

		// Search mode buttons
		this.modeWordBtn.addEventListener('click', () => {
			if (this.currentSearchMode !== 'word') {
				this.syncSearchMode('word');
				this._setSearchValue('');
				if (this.scrollManager) {
					this.scrollManager.loadInitial(1);
				}
			}
		});
		this.modeRefBtn.addEventListener('click', () => {
			if (this.currentSearchMode !== 'reference') {
				this.syncSearchMode('reference');
				this._setSearchValue('');
				this.clearEntries();
			}
		});

		// Keyboard overlay toggle
		this.keyboardToggle.addEventListener('click', () => {
			this._toggleKeyboard();
		});

		// Cmd/Ctrl+K hotkey to toggle keyboard
		document.addEventListener('keydown', (e) => {
			if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
				e.preventDefault();
				this._toggleKeyboard();
			}
			// Escape closes keyboard overlay
			if (
				e.key === 'Escape' &&
				this.keyboardOverlay &&
				!this.keyboardOverlay.hidden
			) {
				this.keyboardOverlay.hidden = true;
			}
		});

		// Click outside keyboard overlay closes it
		document.addEventListener('click', (e) => {
			if (
				this.keyboardOverlay &&
				!this.keyboardOverlay.hidden &&
				!this.keyboardOverlay.contains(e.target) &&
				e.target !== this.keyboardToggle &&
				!this.keyboardToggle.contains(e.target)
			) {
				this.keyboardOverlay.hidden = true;
			}
		});

		// Page jump button
		const handlePageJump = () => {
			const pageNum = parseInt(this.pageInput.value, 10);
			if (pageNum > 0 && pageNum <= DICTIONARY.TOTAL_PAGES) {
				this.pageInput.removeAttribute('aria-invalid');
				this.jumpToDictPage(pageNum);
			} else {
				this.pageInput.setAttribute('aria-invalid', 'true');
				this.showError(`Page must be between 1 and ${DICTIONARY.TOTAL_PAGES}`);
			}
		};

		this.pageJumpButton.addEventListener('click', handlePageJump);

		// Page jump on Enter key
		this.pageInput.addEventListener('keydown', (e) => {
			if (e.key === 'Enter') {
				handlePageJump();
			}
		});

		// Handle browser back/forward and hash changes
		window.addEventListener('popstate', () => {
			this.handleURLParameters();
		});
		window.addEventListener('hashchange', () => {
			this.handleURLParameters();
		});

		// Brand links — navigate back to dictionary
		document.querySelectorAll('.brand-link').forEach((link) => {
			link.addEventListener('click', (e) => {
				e.preventDefault();
				if (this._sagesExplorer?.isVisible) {
					this._hideSagesView();
				}
				window.history.pushState(null, '', window.location.pathname);
				this.loadInitialPage();
			});
		});

		// Offline detection
		this.isOffline = !navigator.onLine;
		this.offlineIndicator = document.querySelector('.offline-indicator');

		if (this.isOffline && this.offlineIndicator) {
			this.offlineIndicator.classList.add('is-offline');
		}

		window.addEventListener('offline', () => {
			this.isOffline = true;
			if (this.offlineIndicator) {
				this.offlineIndicator.classList.add('is-offline');
			}
			this.showOfflineToast(
				"You're offline — some features are unavailable",
				'warning',
				'cloud-slash',
			);
			this.updatePageDialogOfflineState();
		});

		window.addEventListener('online', () => {
			this.isOffline = false;
			if (this.offlineIndicator) {
				this.offlineIndicator.classList.remove('is-offline');
			}
			this.showOfflineToast("You're back online", 'success', 'cloud');
			this.updatePageDialogOfflineState();
		});
	}

	/**
	 * Handle URL hash parameters
	 */
	handleURLParameters() {
		const hash = decodeURIComponent(window.location.hash.slice(1)); // Remove # and decode

		// Sages route guard — intercept before dictionary routing
		if (hash === 'sages' || hash.startsWith('sage:')) {
			this._showSagesView(hash);
			return;
		}

		// If returning from sages view, hide it
		if (this._sagesExplorer?.isVisible) {
			this._hideSagesView();
		}

		// Load initial page if no hash, or if hash is a dialog hash (guide, abbreviations)
		if (!hash || hash === 'guide' || hash === 'abbreviations') {
			this.loadInitialPage();
			return;
		}

		// URL scheme:
		// #5 - Page number (numeric)
		// #אבא - Hebrew word search (contains Hebrew characters)
		// #ref:Berakhot_28b - Reference search (spaces as underscores)
		// #rid:A00000 - Direct entry permalink
		// #scan:500 - Open page scan dialog for page 500
		// #guide - Entry guide dialog (handled by index.html script)
		// #abbreviations - Abbreviations dialog (handled by index.html script)

		// #word=HEADWORD — navigation from Hebrew abbreviation links
		if (hash.startsWith('word=')) {
			const word = hash.slice(5).replace(/_/g, ' ');
			this.syncSearchMode('word');
			this._setSearchValue(word);
			this.handleSearch(word, true);
			return;
		}

		if (hash.startsWith('ref:')) {
			const ref = hash.slice(4).replace(/_/g, ' ');
			this.syncSearchMode('reference');
			this._setSearchValue(ref);
			this.handleSearch(ref, true);
			return;
		}

		if (hash.startsWith('rid:')) {
			const rid = hash.slice(4);
			const entry = this.dataLoader.getByRid(rid);
			if (entry) {
				// Load the page containing this entry and scroll to it
				this.syncSearchMode('word');
				this._setSearchValue('');
				const entryIndex = this.dataLoader.getEntryIndex(entry.id);
				this.scrollManager.loadInitial(entry.p, entryIndex);
			} else {
				console.warn(`Entry with rid ${rid} not found`);
				this.loadInitialPage();
			}
			return;
		}

		// #scan:500 - Open page scan dialog
		if (hash.startsWith('scan:')) {
			const scanPage = parseInt(hash.slice(5), 10);
			if (scanPage >= 1 && scanPage <= DICTIONARY.TOTAL_PAGES) {
				this.showPageDialog(scanPage);
			}
			return;
		}

		// Check if it's a plain number (page number)
		if (/^\d+$/.test(hash)) {
			const page = parseInt(hash, 10);
			this.syncSearchMode('word');
			this.scrollManager.loadInitial(page);
			return;
		}

		// Check if it contains Hebrew characters (word search)
		if (/[\u0590-\u05FF]/.test(hash)) {
			this.syncSearchMode('word');
			this._setSearchValue(hash);
			this.handleSearch(hash, true);
			return;
		}

		// Fallback: treat as word search
		this.syncSearchMode('word');
		this._setSearchValue(hash);
		this.handleSearch(hash, true);
	}

	/**
	 * Sync search mode UI (button group, placeholder, direction) with internal state
	 */
	syncSearchMode(mode) {
		this.currentSearchMode = mode;
		if (this.modeWordBtn && this.modeRefBtn) {
			if (mode === 'word') {
				this.modeWordBtn.setAttribute('variant', 'brand');
				this.modeRefBtn.removeAttribute('variant');
			} else {
				this.modeRefBtn.setAttribute('variant', 'brand');
				this.modeWordBtn.removeAttribute('variant');
			}
		}
		if (this.searchInput) {
			if (mode === 'word') {
				this.searchInput.placeholder = 'Search Hebrew letters (אבג)';
				this.searchInput.classList.add('rtl-input');
			} else {
				this.searchInput.placeholder = 'Reference (e.g., Berakhot 28b)';
				this.searchInput.classList.remove('rtl-input');
			}
			// Close autocomplete dropdown on mode switch
			this._hideDropdown();
		}
	}

	/**
	 * Toggle the floating Hebrew keyboard overlay
	 */
	_toggleKeyboard() {
		if (this.keyboardOverlay) {
			this.keyboardOverlay.hidden = !this.keyboardOverlay.hidden;
			// Position below the header dynamically
			if (!this.keyboardOverlay.hidden) {
				const header = document.querySelector('[slot="header"]');
				if (header) {
					const rect = header.getBoundingClientRect();
					this.keyboardOverlay.style.top = `${rect.bottom}px`;
				}
			}
		}
	}

	/**
	 * Get the search input text.
	 */
	_getSearchValue() {
		return this.searchInput.value || '';
	}

	/**
	 * Set the search input text.
	 */
	_setSearchValue(text) {
		this.searchInput.value = text;
	}

	/**
	 * Create the autocomplete dropdown element (lazy, once).
	 */
	_ensureDropdown() {
		if (this._dropdownEl) {
			return;
		}
		this._dropdownEl = document.createElement('div');
		this._dropdownEl.className = 'autocomplete-dropdown';
		this._dropdownEl.setAttribute('role', 'listbox');
		this._dropdownEl.id = 'search-autocomplete-list';
		this._dropdownHighlight = -1;
		// Append dropdown to document.body so it escapes wa-page's
		// stacking context and renders above the sages overlay.
		document.body.appendChild(this._dropdownEl);
	}

	/**
	 * Position the autocomplete dropdown below the search input.
	 * Called each time the dropdown is shown.
	 */
	_positionDropdown() {
		if (!this._dropdownEl) {
			return;
		}
		const rect = this.searchInput.getBoundingClientRect();
		this._dropdownEl.style.position = 'fixed';
		this._dropdownEl.style.top = `${rect.bottom}px`;
		this._dropdownEl.style.left = `${rect.left}px`;
		this._dropdownEl.style.width = `${rect.width}px`;
	}

	_showDropdown(items) {
		this._ensureDropdown();
		this._dropdownEl.replaceChildren();
		this._dropdownHighlight = -1;

		if (items.length === 0) {
			this._dropdownEl.style.display = 'none';
			this.searchInput.setAttribute('aria-expanded', 'false');
			return;
		}

		for (let i = 0; i < items.length; i++) {
			const item = items[i];
			const div = document.createElement('div');
			div.className = 'autocomplete-item';
			div.setAttribute('role', 'option');
			div.setAttribute('aria-selected', 'false');
			div.id = `autocomplete-option-${i}`;
			div.addEventListener('mouseenter', () => this._highlightItem(i));
			div.addEventListener('click', () => {
				if (item.mode) {
					this.syncSearchMode(item.mode);
					this._setSearchValue(item.query);
					this._saveSearchHistory(item.query, item.mode);
					this.handleSearch(item.query);
				} else {
					this._setSearchValue(item.text);
					this._saveSearchHistory(item.text, this.currentSearchMode);
					this.handleSearch(item.text);
				}
				this._hideDropdown();
			});

			if (item.mode) {
				const querySpan = document.createElement('span');
				querySpan.textContent = item.query;
				if (item.mode === 'word') {
					querySpan.setAttribute('dir', 'rtl');
				}
				div.appendChild(querySpan);
				const modeSpan = document.createElement('span');
				modeSpan.className = 'autocomplete-mode';
				modeSpan.textContent = item.mode === 'word' ? 'Word' : 'Ref';
				div.appendChild(modeSpan);
			} else {
				div.textContent = item.text;
				if (this.currentSearchMode === 'word') {
					div.setAttribute('dir', 'rtl');
				}
			}

			this._dropdownEl.appendChild(div);
		}

		this._positionDropdown();
		this._dropdownEl.style.display = 'block';
		this.searchInput.setAttribute('aria-expanded', 'true');
	}

	_hideDropdown() {
		if (this._dropdownEl) {
			this._dropdownEl.style.display = 'none';
			this._dropdownHighlight = -1;
			this.searchInput?.setAttribute('aria-expanded', 'false');
			this.searchInput?.removeAttribute('aria-activedescendant');
		}
	}

	_highlightItem(index) {
		if (!this._dropdownEl) {
			return;
		}
		const items = this._dropdownEl.children;
		for (let i = 0; i < items.length; i++) {
			items[i].classList.toggle('highlighted', i === index);
			items[i].setAttribute('aria-selected', i === index ? 'true' : 'false');
		}
		this._dropdownHighlight = index;
		if (index >= 0 && items[index]) {
			this.searchInput.setAttribute('aria-activedescendant', items[index].id);
		} else {
			this.searchInput.removeAttribute('aria-activedescendant');
		}
	}

	_navigateDropdown(direction) {
		if (!this._dropdownEl || this._dropdownEl.style.display === 'none') {
			return;
		}
		const count = this._dropdownEl.children.length;
		if (count === 0) {
			return;
		}
		let next = this._dropdownHighlight + direction;
		if (next < 0) {
			next = count - 1;
		}
		if (next >= count) {
			next = 0;
		}
		this._highlightItem(next);
	}

	/**
	 * Update autocomplete dropdown based on current input and mode.
	 */
	_updateAutocompleteOptions() {
		// Suppress autocomplete when virtual keyboard overlay is open
		if (this.keyboardOverlay && !this.keyboardOverlay.hidden) {
			this._hideDropdown();
			return;
		}

		const query = this._getSearchValue();

		if (!query.trim()) {
			this._showSearchHistory();
			return;
		}

		let suggestions;
		if (this.currentSearchMode === 'word') {
			suggestions = this.dataLoader.searchHeadwordPrefix(
				query,
				SEARCH.MAX_SUGGESTIONS,
			);
		} else {
			suggestions = this.dataLoader.searchReferencePrefix(
				query,
				SEARCH.MAX_SUGGESTIONS,
			);
		}

		this._showDropdown(suggestions.map((s) => ({ text: s })));
	}

	/**
	 * Save a search to history in localStorage.
	 */
	_saveSearchHistory(query, mode) {
		if (!query?.trim()) {
			return;
		}
		try {
			const history = this._loadSearchHistory();
			const filtered = history.filter(
				(h) => !(h.query === query && h.mode === mode),
			);
			filtered.unshift({ query, mode, timestamp: Date.now() });
			const capped = filtered.slice(0, SEARCH.MAX_HISTORY);
			localStorage.setItem(SEARCH.HISTORY_KEY, JSON.stringify(capped));
		} catch {
			// localStorage unavailable — fail silently
		}
	}

	/**
	 * Load search history from localStorage.
	 */
	_loadSearchHistory() {
		try {
			const raw = localStorage.getItem(SEARCH.HISTORY_KEY);
			return raw ? JSON.parse(raw) : [];
		} catch {
			return [];
		}
	}

	/**
	 * Show search history in the dropdown (when input is empty).
	 */
	_showSearchHistory() {
		const history = this._loadSearchHistory();
		if (history.length === 0) {
			this._hideDropdown();
			return;
		}
		this._showDropdown(history.map((h) => ({ query: h.query, mode: h.mode })));
	}

	/**
	 * Add a span-based tooltip to an element (virtual-scroll safe).
	 * Adds .has-tooltip class + .tip-box and .tip-arrow child spans.
	 */
	_addTooltip(element, text) {
		element.classList.add('has-tooltip');
		const box = document.createElement('span');
		box.className = 'tip-box';
		box.textContent = text;
		const arrow = document.createElement('span');
		arrow.className = 'tip-arrow';
		element.appendChild(box);
		element.appendChild(arrow);
	}

	/**
	 * Set up delegated listener for inline <abbr> hover tooltips.
	 * Uses pointerenter (capture) to show modern abbreviation expansions.
	 */
	_setupAbbrListeners() {
		const container = this.mainContent;
		if (!container) {
			return;
		}

		let activeTooltip = null;

		const hideTooltip = () => {
			if (activeTooltip) {
				activeTooltip.remove();
				activeTooltip = null;
			}
		};

		// Hover → show tooltip with modern expansion
		container.addEventListener(
			'pointerenter',
			(e) => {
				const abbr = e.target.closest('abbr');
				if (!abbr) {
					return;
				}

				const entry = this.dataLoader.abbrMap[abbr.textContent];
				if (!entry) {
					return;
				}

				hideTooltip();

				// Reuse the same tip-box/tip-arrow pattern as _addTooltip
				const tip = document.createElement('span');
				tip.className = 'has-tooltip abbr-tip-anchor';

				const box = document.createElement('span');
				box.className = 'tip-box';
				box.style.visibility = 'visible';
				box.textContent = entry.modern;

				const arrow = document.createElement('span');
				arrow.className = 'tip-arrow';
				arrow.style.visibility = 'visible';

				tip.append(box, arrow);

				// Position relative to the <abbr>
				abbr.style.position = 'relative';
				abbr.appendChild(tip);
				activeTooltip = tip;
			},
			{ capture: true },
		);

		container.addEventListener(
			'pointerleave',
			(e) => {
				if (e.target.closest('abbr')) {
					hideTooltip();
				}
			},
			{ capture: true },
		);
	}

	/**
	 * Render reference search results as a flat list with "Show more" button.
	 * Inserts entries before the scroll manager's bottom sentinel.
	 */
	_renderReferenceResults(results) {
		this.clearEntries();

		const max = PAGINATION.MAX_REFERENCE_RESULTS;
		const initial = results.slice(0, max);
		const remaining = results.slice(max);

		const fragment = document.createDocumentFragment();
		for (const entry of initial) {
			fragment.appendChild(this.createEntryElement(entry));
		}
		this.mainContent.appendChild(fragment);

		if (remaining.length > 0) {
			const showMoreBtn = document.createElement('wa-button');
			showMoreBtn.setAttribute('variant', 'neutral');
			showMoreBtn.setAttribute('appearance', 'outlined');
			showMoreBtn.style.cssText = 'display: block; margin: 1rem auto;';
			showMoreBtn.textContent = `Show ${remaining.length} more results`;
			showMoreBtn.addEventListener('click', () => {
				const moreFrag = document.createDocumentFragment();
				for (const entry of remaining) {
					moreFrag.appendChild(this.createEntryElement(entry));
				}
				showMoreBtn.before(moreFrag);
				showMoreBtn.remove();
			});
			this.mainContent.appendChild(showMoreBtn);
		}
	}

	/**
	 * Handle search
	 */
	handleSearch(query, skipURLUpdate = false) {
		// Exit sages view if active
		if (this._sagesExplorer?.isVisible) {
			this._hideSagesView();
		}

		// Validate and sanitize search query
		const validation = sanitizeSearchQuery(query);
		if (!validation.valid) {
			console.warn('Invalid search query:', validation.error);
			this.showError(validation.error);
			return;
		}

		const cleanQuery = validation.query;

		if (!cleanQuery || cleanQuery.trim() === '') {
			this.loadInitialPage();
			return;
		}

		if (this.currentSearchMode === 'word') {
			const results = this.dataLoader.searchByHeadword(cleanQuery);
			if (results.length > 0) {
				const dictPage = results[0].p;
				const targetEntryId = results[0].id;
				const entryIndex = this.dataLoader.getEntryIndex(targetEntryId);

				if (!skipURLUpdate) {
					this.updateURL({ word: cleanQuery });
				}

				// Load entries starting from the result
				this.scrollManager.loadInitial(dictPage, entryIndex);
				window.announce(
					`${results.length} result${results.length === 1 ? '' : 's'} found`,
				);
				document.title = `${cleanQuery} - Jastrow Dictionary`;
			} else {
				this.showNoResults();
			}
		} else {
			// Reference search — prefix match, flat list with "Show more"
			const results = this.dataLoader.searchByReferencePrefix(cleanQuery);
			if (results.length > 0) {
				this._renderReferenceResults(results);
				window.announce(
					`${results.length} reference${results.length === 1 ? '' : 's'} found`,
				);
				document.title = `${cleanQuery} - Jastrow Dictionary`;

				if (!skipURLUpdate) {
					this.updateURL({ ref: cleanQuery });
				}
			} else {
				this.showNoResults();
			}
		}
	}

	/**
	 * Jump to specific dictionary page
	 */
	jumpToDictPage(pageNumber) {
		// Validate page number
		const validation = validatePageNumber(pageNumber, 1, this.totalDictPages);
		if (!validation.valid) {
			console.warn('Invalid page number:', validation.error);
			this.showError(validation.error);
			return;
		}

		const validPage = validation.page;
		this.syncSearchMode('word');
		this._setSearchValue('');
		this.scrollManager.loadInitial(validPage);
		this.updateURL({ page: validPage });
		document.title = `Page ${validPage} - Jastrow Dictionary`;
	}

	/**
	 * Load initial page
	 */
	loadInitialPage() {
		if (this.scrollManager) {
			this.scrollManager.loadInitial(1);
			document.title = 'Jastrow Dictionary';
		}
	}

	/**
	 * Create HTML element for an entry
	 */
	createEntryElement(entry) {
		const container = document.createElement('div');
		container.className = 'wa-stack';
		container.dataset.entryId = entry.id;

		// Entry header with headword and metadata
		const splitDiv = document.createElement('div');
		splitDiv.className = 'wa-split';

		// Left side: headword, permalink, and badges
		const leftCluster = document.createElement('div');
		leftCluster.className = 'wa-cluster wa-gap-0';

		const headword = document.createElement('span');
		headword.className = 'wa-heading-2xl';
		headword.textContent = entry.hw;
		headword.dir = 'rtl';
		leftCluster.appendChild(headword);

		// Permalink copy button (wa-copy-button has its own built-in tooltip)
		const entryUrl = `${window.location.origin}${window.location.pathname}#rid:${entry.id}`;
		const permalinkButton = document.createElement('wa-copy-button');
		permalinkButton.setAttribute('value', entryUrl);
		permalinkButton.setAttribute('copy-label', 'Copy link to entry');
		permalinkButton.setAttribute('success-label', 'Link copied!');
		permalinkButton.setAttribute('error-label', 'Copy failed');
		permalinkButton.classList.add('permalink', 'wa-color-text-quiet');

		const copyIcon = document.createElement('wa-icon');
		copyIcon.setAttribute('slot', 'copy-icon');
		copyIcon.setAttribute('name', 'link');
		permalinkButton.appendChild(copyIcon);

		const successIcon = document.createElement('wa-icon');
		successIcon.setAttribute('slot', 'success-icon');
		successIcon.setAttribute('name', 'check');
		permalinkButton.appendChild(successIcon);

		leftCluster.appendChild(permalinkButton);

		// Grammar badges: language (brand) → POS (neutral) → gender (success)
		// Positioned after permalink, with pill shape and spacing
		const grammar = entry.g || {};

		if (grammar.l && LANGUAGE_BADGES[grammar.l]) {
			const info = LANGUAGE_BADGES[grammar.l];
			const badge = document.createElement('wa-badge');
			badge.setAttribute('variant', 'brand');
			badge.setAttribute('pill', '');
			badge.textContent = info.badge;
			badge.style.marginLeft = '4px';
			this._addTooltip(badge, info.tooltip);
			leftCluster.appendChild(badge);
		}

		if (grammar.ps && POS_BADGES[grammar.ps]) {
			const info = POS_BADGES[grammar.ps];
			const badge = document.createElement('wa-badge');
			badge.setAttribute('variant', 'neutral');
			badge.setAttribute('pill', '');
			badge.textContent = info.badge;
			badge.style.marginLeft = '4px';
			this._addTooltip(badge, info.tooltip);
			leftCluster.appendChild(badge);
		}

		if (grammar.gn && GENDER_BADGES[grammar.gn]) {
			const info = GENDER_BADGES[grammar.gn];
			const badge = document.createElement('wa-badge');
			badge.setAttribute('variant', 'success');
			badge.setAttribute('pill', '');
			badge.textContent = info.badge;
			badge.style.marginLeft = '4px';
			this._addTooltip(badge, info.tooltip);
			leftCluster.appendChild(badge);
		}

		splitDiv.appendChild(leftCluster);

		// Right side: page/column info
		const rightCluster = document.createElement('div');
		rightCluster.className = 'wa-cluster wa-body-s wa-gap-2xs';

		const pageLink = document.createElement('a');
		pageLink.className = 'show-page';
		pageLink.href = '#';
		pageLink.dataset.page = entry.p || '0';

		// Add icon
		const pageIcon = document.createElement('wa-icon');
		pageIcon.setAttribute('name', 'file-lines');
		pageIcon.setAttribute('variant', 'regular');
		pageLink.appendChild(pageIcon);

		// Add text
		const pageText = document.createTextNode(
			`Page ${entry.p || '?'}, Column ${entry.col || '?'}`,
		);
		pageLink.appendChild(pageText);

		this._addTooltip(pageLink, 'View printed page image');
		rightCluster.appendChild(pageLink);

		splitDiv.appendChild(rightCluster);
		container.appendChild(splitDiv);

		// Entry content (definition, senses, grammar)
		container.appendChild(this.formatEntryContent(entry));

		// References section
		if (entry.rf) {
			const refsSection = this.createReferencesSection(entry.rf);
			if (refsSection) {
				container.appendChild(refsSection);
			}
		}

		// Divider
		const divider = document.createElement('wa-divider');
		divider.style.setProperty('--spacing', '.5em');
		container.appendChild(divider);

		return container;
	}

	/**
	 * Parse trusted HTML (pipeline output) into a DocumentFragment.
	 * Only for pre-processed data from the build pipeline, never user input.
	 */
	trustedHTML(html) {
		const template = document.createElement('template');
		template.innerHTML = html; // nosemgrep: javascript.browser.security.insecure-document-method.insecure-document-method
		return template.content;
	}

	/**
	 * Format entry content as DOM nodes
	 */
	formatEntryContent(entry) {
		if (!entry.c?.s) {
			const p = document.createElement('p');
			p.textContent = 'No content available';
			const frag = document.createDocumentFragment();
			frag.appendChild(p);
			return frag;
		}

		const languageInfo = entry.li || '';
		const frag = this.formatSenses(entry.c.s, 0, languageInfo);

		if (!frag.hasChildNodes()) {
			const p = document.createElement('p');
			p.textContent = 'No definition available';
			const fallback = document.createDocumentFragment();
			fallback.appendChild(p);
			return fallback;
		}

		return frag;
	}

	/**
	 * Format senses as DOM nodes (handles nested senses with grammar)
	 */
	formatSenses(senses, level = 0, languageInfo = '') {
		const frag = document.createDocumentFragment();
		if (!senses || senses.length === 0) {
			return frag;
		}

		const firstSense = senses[0];
		const hasPrimarySense = firstSense.d && !firstSense.n && !firstSense.g;
		const hasChildren = senses.length > 1;

		if (hasPrimarySense && hasChildren) {
			const senseGroup = document.createElement('div');
			senseGroup.className = 'sense-group';

			const primaryDiv = document.createElement('div');
			primaryDiv.className = 'sense sense-primary';
			if (languageInfo) {
				primaryDiv.appendChild(
					this.trustedHTML(
						`<span class="language-info">${languageInfo}</span>`,
					),
				);
			}
			primaryDiv.appendChild(this.trustedHTML(firstSense.d));
			senseGroup.appendChild(primaryDiv);

			const childSenses = senses.slice(1);
			const numberedSenses = childSenses.filter((s) => s.d && s.n);
			const grammarSections = childSenses.filter((s) => s.g);

			if (numberedSenses.length > 0) {
				const childrenDiv = document.createElement('div');
				childrenDiv.className = 'sense-children';
				childrenDiv.appendChild(
					this.formatSenses(numberedSenses, level + 1, ''),
				);
				senseGroup.appendChild(childrenDiv);
			}

			frag.appendChild(senseGroup);

			if (grammarSections.length > 0) {
				frag.appendChild(this.formatSenses(grammarSections, level, ''));
			}
		} else {
			let isFirstSense = true;

			if (languageInfo && senses[0]?.n) {
				const langDiv = document.createElement('div');
				langDiv.className = 'sense';
				langDiv.appendChild(
					this.trustedHTML(
						`<span class="language-info">${languageInfo}</span>`,
					),
				);
				frag.appendChild(langDiv);
				languageInfo = '';
				isFirstSense = false;
			}

			for (const sense of senses) {
				if (sense.g) {
					const grammarSection = document.createElement('div');
					grammarSection.className = 'grammar-section';

					const grammarHeader = document.createElement('div');
					grammarHeader.className = 'grammar-header';

					const stemSpan = document.createElement('span');
					stemSpan.className = 'verbal-stem';
					stemSpan.textContent = `${sense.g.vs || ''} `;
					grammarHeader.appendChild(stemSpan);

					const binyanForms = sense.g.bf || [];
					if (binyanForms.length > 0) {
						const formsSpan = document.createElement('span');
						formsSpan.className = 'binyan-forms';
						formsSpan.setAttribute('dir', 'rtl');
						formsSpan.textContent = binyanForms.join(', ');
						grammarHeader.appendChild(formsSpan);
					}
					grammarSection.appendChild(grammarHeader);

					if (sense.s && sense.s.length > 0) {
						const grammarSensesDiv = document.createElement('div');
						grammarSensesDiv.className = 'grammar-senses';
						grammarSensesDiv.appendChild(
							this.formatSenses(
								sense.s,
								level + 1,
								isFirstSense ? languageInfo : '',
							),
						);
						grammarSection.appendChild(grammarSensesDiv);
						isFirstSense = false;
						languageInfo = '';
					}

					frag.appendChild(grammarSection);
				} else if (sense.d) {
					if (sense.n) {
						const cleanNumber = sense.n.replace(/^[—-]\s*/, '');
						const senseDiv = document.createElement('div');
						senseDiv.className = 'sense sense-numbered';

						const numSpan = document.createElement('span');
						numSpan.className = 'sense-number';
						numSpan.textContent = `${cleanNumber} `;
						senseDiv.appendChild(numSpan);

						const defSpan = document.createElement('span');
						defSpan.className = 'sense-definition';
						if (isFirstSense && languageInfo) {
							defSpan.appendChild(
								this.trustedHTML(
									`<span class="language-info">${languageInfo}</span>`,
								),
							);
							isFirstSense = false;
							languageInfo = '';
						}
						defSpan.appendChild(this.trustedHTML(sense.d));
						senseDiv.appendChild(defSpan);

						frag.appendChild(senseDiv);
					} else {
						const senseDiv = document.createElement('div');
						senseDiv.className = 'sense';
						if (isFirstSense && languageInfo) {
							senseDiv.appendChild(
								this.trustedHTML(
									`<span class="language-info">${languageInfo}</span>`,
								),
							);
							isFirstSense = false;
							languageInfo = '';
						}
						senseDiv.appendChild(this.trustedHTML(sense.d));
						frag.appendChild(senseDiv);
					}
				}
			}
		}

		return frag;
	}

	/**
	 * Create references section from structured references object.
	 * Displays non-Jastrow refs (talmud, bible, midrash, other) as buttons.
	 * Jastrow cross-refs are already inline word-links in definitions.
	 */
	createReferencesSection(references) {
		// Flatten non-jastrow categories, preserving category per ref
		const CATEGORY_ORDER = ['t', 'b', 'mi', 'o'];
		const displayRefs = [];
		for (const category of CATEGORY_ORDER) {
			if (references[category]) {
				for (const ref of references[category]) {
					displayRefs.push({ ref, category });
				}
			}
		}

		if (displayRefs.length === 0) {
			return null;
		}

		const section = document.createElement('div');
		section.className = 'wa-stack wa-gap-0';

		const heading = document.createElement('span');
		heading.className = 'wa-heading-m';
		heading.textContent = 'References:';
		section.appendChild(heading);

		const card = document.createElement('wa-card');
		card.setAttribute('appearance', 'filled');
		card.className = 'card-basic';
		card.style.setProperty('--spacing', 'var(--wa-space-xs)');
		card.style.width = '100%';

		const cluster = document.createElement('div');
		cluster.className = 'wa-cluster wa-gap-xs';

		const max = PAGINATION.MAX_REFERENCES_DISPLAY;
		const hiddenButtons = [];

		for (let i = 0; i < displayRefs.length; i++) {
			const { ref, category } = displayRefs[i];
			const button = document.createElement('wa-button');
			button.className = 'ref-button';
			button.setAttribute('variant', REF_VARIANTS[category] || 'neutral');
			button.setAttribute('outline', '');
			button.dataset.ref = ref;
			button.textContent = ref;
			if (i >= max) {
				button.style.display = 'none';
				hiddenButtons.push(button);
			}
			cluster.appendChild(button);
		}

		card.appendChild(cluster);

		if (hiddenButtons.length > 0) {
			const toggle = document.createElement('a');
			toggle.href = '#';
			toggle.className = 'refs-toggle';
			toggle.textContent = `Show all ${displayRefs.length} references`;
			toggle.addEventListener('click', (e) => {
				e.preventDefault();
				for (const btn of hiddenButtons) {
					btn.style.display = '';
				}
				toggle.style.display = 'none';
			});
			card.appendChild(toggle);
		}

		section.appendChild(card);
		return section;
	}

	/**
	 * Show page dialog with Archive.org image
	 */
	showPageDialog(pageNumber) {
		if (!pageNumber) {
			return;
		}

		// Validate page number
		const validation = validatePageNumber(
			pageNumber,
			VALIDATION.PAGE_NUMBER_MIN,
			VALIDATION.PAGE_NUMBER_MAX,
		);
		if (!validation.valid) {
			console.warn('Invalid page number for dialog:', validation.error);
			return;
		}

		const validPage = validation.page;

		// Archive.org - Image files have 16-page offset (front matter)
		// Page 1 of dictionary is at image index 16
		const imageIndex = validPage + DICTIONARY.ARCHIVE_IMAGE_OFFSET;
		const imageNumber = String(imageIndex).padStart(4, '0');
		// Use IIIF Image API for stable URLs (not tied to specific IA servers)
		const imageUrl = `${EXTERNAL_URLS.ARCHIVE_IIIF_BASE}/${EXTERNAL_URLS.ARCHIVE_IIIF_PATH}${imageNumber}.jp2/full/pct:50/0/default.jpg`;

		// Validate Archive.org URL
		if (!sanitizeURL(imageUrl, ['archive.org'])) {
			console.error('Invalid Archive.org URL:', imageUrl);
			this.showError('Unable to load page image');
			return;
		}

		// Get the dialog and its elements
		const dialog = document.querySelector('.page-dialog');
		const imageFrame = document.getElementById('page-image-frame');
		const prevBtn = document.getElementById('page-prev-btn');
		const nextBtn = document.getElementById('page-next-btn');
		const openBtn = document.getElementById('page-open-btn');
		const pageDisplay = document.getElementById('current-page-display');

		if (!(dialog && imageFrame)) {
			return;
		}

		// Track current page for online recovery
		this.currentDialogPage = validPage;

		// Update dialog label and URL hash
		dialog.label = `Page ${validPage} - Print Edition`;
		if (window.location.hash !== `#scan:${validPage}`) {
			window.history.pushState(null, '', `#scan:${validPage}`);
		}

		// Update current page display
		if (pageDisplay) {
			pageDisplay.textContent = `Page ${validPage}`;
		}

		if (navigator.onLine) {
			// Online — show image normally
			imageFrame.style.display = '';
			const offlineMsg = dialog.querySelector('.offline-fallback');
			if (offlineMsg) {
				offlineMsg.remove();
			}

			imageFrame.src = imageUrl;

			// Update Archive.org link button
			if (openBtn) {
				const archiveBookUrl = `https://archive.org/details/${EXTERNAL_URLS.ARCHIVE_ID}/page/${validPage}/mode/1up`;
				openBtn.href = archiveBookUrl;
				openBtn.style.pointerEvents = '';
				openBtn.removeAttribute('aria-disabled');
			}

			// Update navigation buttons
			if (prevBtn) {
				prevBtn.disabled = validPage <= 1;
				prevBtn.onclick = () => {
					if (validPage > 1) {
						this.showPageDialog(validPage - 1);
					}
				};
			}

			if (nextBtn) {
				nextBtn.disabled = validPage >= DICTIONARY.TOTAL_PAGES;
				nextBtn.onclick = () => {
					if (validPage < DICTIONARY.TOTAL_PAGES) {
						this.showPageDialog(validPage + 1);
					}
				};
			}
		} else {
			// Offline fallback — show message instead of image
			imageFrame.removeAttribute('src');
			imageFrame.style.display = 'none';

			let offlineMsg = dialog.querySelector('.offline-fallback');
			if (!offlineMsg) {
				offlineMsg = document.createElement('div');
				offlineMsg.className = 'offline-fallback';
				offlineMsg.style.cssText = 'padding: 3rem 2rem; text-align: center;';
				const offIcon = document.createElement('wa-icon');
				offIcon.setAttribute('name', 'cloud-slash');
				offIcon.style.cssText = 'font-size: 3rem; opacity: 0.3;';
				const offTitle = document.createElement('p');
				offTitle.className = 'wa-heading-m';
				offTitle.style.marginTop = '1rem';
				offTitle.textContent = 'Page images are unavailable offline';
				const offDesc = document.createElement('p');
				offDesc.className = 'wa-body-s';
				offDesc.style.color = 'var(--wa-color-text-subtle)';
				offDesc.textContent = 'They require a connection to Archive.org.';
				offlineMsg.append(offIcon, offTitle, offDesc);
				imageFrame.parentNode.insertBefore(offlineMsg, imageFrame);
			}

			// Disable all dialog buttons when offline
			if (prevBtn) {
				prevBtn.disabled = true;
			}
			if (nextBtn) {
				nextBtn.disabled = true;
			}
			if (openBtn) {
				openBtn.style.pointerEvents = 'none';
				openBtn.setAttribute('aria-disabled', 'true');
			}
		}

		// Show the dialog
		this._lastFocusedElement = document.activeElement;
		dialog.open = true;
	}

	/**
	 * Clear all entries
	 */
	clearEntries() {
		if (this.scrollManager) {
			this.scrollManager.reset();
		}
		if (this.mainContent) {
			this.mainContent.replaceChildren();
		}
	}

	/**
	 * Update URL hash without reloading (uses pushState to avoid popstate loop)
	 */
	updateURL(params, { replace = false } = {}) {
		let hash = '';

		// URL scheme:
		// #5 - Page number
		// #אבא - Hebrew word search
		// #ref:Berakhot_28b - Reference search (spaces as underscores)
		// #rid:A00000 - Direct entry permalink

		if (params.page !== undefined) {
			hash = `#${params.page}`;
		} else if (params.word !== undefined) {
			hash = `#${params.word}`;
		} else if (params.ref !== undefined) {
			hash = `#ref:${params.ref.replace(/ /g, '_')}`;
		} else if (params.rid !== undefined) {
			hash = `#rid:${params.rid}`;
		}

		const url = hash || window.location.pathname;
		if (replace) {
			history.replaceState(null, '', url);
		} else {
			history.pushState(null, '', url);
		}
	}

	/**
	 * Share or copy a URL. Uses navigator.share on mobile, clipboard + toast on desktop.
	 */
	async _shareURL(url, title = 'Jastrow Dictionary') {
		const shareData = { title, url };
		try {
			if (navigator.share && navigator.canShare?.(shareData)) {
				await navigator.share(shareData);
			} else {
				await navigator.clipboard.writeText(url);
				const toastContainer = document.querySelector('wa-toast');
				if (toastContainer) {
					await customElements.whenDefined('wa-toast');
					toastContainer.create('Link copied to clipboard', {
						variant: 'success',
						icon: 'check',
						duration: 2000,
					});
				}
			}
		} catch (err) {
			if (err.name !== 'AbortError') {
				console.warn('Share failed:', err);
			}
		}
	}

	/**
	 * Build the contextual share dropdown menu. Called on wa-show to refresh items.
	 */
	_setupShareMenu() {
		const dropdown = document.getElementById('share-dropdown');
		if (!dropdown) {
			return;
		}

		const baseUrl = `${window.location.origin}${window.location.pathname}`;

		const makeItem = (iconName, text, url) => {
			const item = document.createElement('wa-dropdown-item');
			const icon = document.createElement('wa-icon');
			icon.setAttribute('slot', 'icon');
			icon.setAttribute('name', iconName);
			item.appendChild(icon);
			item.append(text);
			item.addEventListener('click', () => this._shareURL(url));
			return item;
		};

		dropdown.addEventListener('wa-show', () => {
			// Remove old dynamic items (keep trigger button)
			dropdown
				.querySelectorAll('wa-dropdown-item, h4')
				.forEach((el) => el.remove());

			// Header label
			const header = document.createElement('h4');
			header.textContent = 'Share link to…';
			dropdown.appendChild(header);

			// 1. Current search (only if active)
			const searchValue = this._getSearchValue().trim();
			if (searchValue) {
				const displayQuery =
					searchValue.length > 20
						? `${searchValue.substring(0, 20)}…`
						: searchValue;
				const hashPrefix =
					this.currentSearchMode === 'reference' ? '#ref:' : '#';
				dropdown.appendChild(
					makeItem(
						'magnifying-glass',
						`Current search: ${displayQuery}`,
						`${baseUrl}${hashPrefix}${encodeURIComponent(searchValue)}`,
					),
				);
			}

			// 2. Page (always — detect from scroll manager or URL hash)
			const currentPage =
				this.scrollManager?.currentVisiblePage ||
				(/^\d+$/.test(window.location.hash.slice(1))
					? parseInt(window.location.hash.slice(1), 10)
					: null);
			if (currentPage && currentPage > 0) {
				dropdown.appendChild(
					makeItem(
						'file-lines',
						`Page ${currentPage}`,
						`${baseUrl}#${currentPage}`,
					),
				);
			}

			// 3. Dictionary (always)
			dropdown.appendChild(makeItem('book', 'Dictionary', baseUrl));
		});
	}

	/**
	 * Setup share buttons in dialog headers (Guide, Abbreviations, Page Scan).
	 */
	_setupDialogShareButtons() {
		const baseUrl = `${window.location.origin}${window.location.pathname}`;

		document.querySelectorAll('.dialog-share-btn').forEach((btn) => {
			btn.addEventListener('click', () => {
				const shareType = btn.dataset.share;
				let url;
				if (shareType === 'scan') {
					const pageDisplay = document.getElementById('current-page-display');
					const pageMatch = pageDisplay?.textContent.match(/\d+/);
					url = pageMatch
						? `${baseUrl}#scan:${pageMatch[0]}`
						: `${baseUrl}#scan:1`;
				} else {
					url = `${baseUrl}#${shareType}`;
				}
				this._shareURL(url);
			});
		});
	}

	/**
	 * Build abbreviations dialog content on first open.
	 * Replaces the empty .abbr-content container with WA tabs, search, and data.
	 */
	async buildAbbreviationsDialog() {
		if (this._abbrDialogBuilt) {
			return;
		}
		this._abbrDialogBuilt = true;

		const container = document.querySelector('.abbr-content');
		if (!container) {
			return;
		}

		// Search filter
		const filter = document.createElement('wa-input');
		filter.setAttribute('type', 'search');
		filter.setAttribute('placeholder', 'Look up abbreviation...');
		filter.setAttribute('clearable', '');
		filter.className = 'abbr-filter';

		// Tab group
		const tabGroup = document.createElement('wa-tab-group');

		const jastrowTab = document.createElement('wa-tab');
		jastrowTab.setAttribute('slot', 'nav');
		jastrowTab.setAttribute('panel', 'jastrow');
		jastrowTab.textContent = 'Jastrow Abbreviations';

		const hebrewTab = document.createElement('wa-tab');
		hebrewTab.setAttribute('slot', 'nav');
		hebrewTab.setAttribute('panel', 'hebrew');
		hebrewTab.textContent = 'Hebrew / Aramaic';

		const jastrowPanel = document.createElement('wa-tab-panel');
		jastrowPanel.setAttribute('name', 'jastrow');

		const hebrewPanel = document.createElement('wa-tab-panel');
		hebrewPanel.setAttribute('name', 'hebrew');

		tabGroup.append(jastrowTab, hebrewTab, jastrowPanel, hebrewPanel);
		container.append(filter, tabGroup);

		// Load both data sources
		this._loadJastrowAbbreviations(jastrowPanel);
		await this._loadHebrewAbbreviations(hebrewPanel);

		// Lookup logic — scroll to and highlight the best match
		let filterTimer = null;
		const clearHighlights = () => {
			container
				.querySelectorAll('.abbr-highlight')
				.forEach((el) => el.classList.remove('abbr-highlight'));
		};

		const doLookup = () => {
			clearHighlights();
			const query = filter.value.toLowerCase().trim();
			if (!query) {
				return;
			}

			const activePanel =
				tabGroup.querySelector('wa-tab-panel:not([hidden])') ||
				tabGroup.querySelector('wa-tab-panel[active]') ||
				jastrowPanel;
			const panelName = activePanel.getAttribute('name');

			if (panelName === 'jastrow') {
				// Find best match: prefer term prefix match, then term contains, then definition contains
				const rows = Array.from(jastrowPanel.querySelectorAll('.abbr-row'));
				const best =
					rows.find((r) =>
						r
							.querySelector('.abbr-term')
							?.textContent.toLowerCase()
							.startsWith(query),
					) ||
					rows.find((r) =>
						r
							.querySelector('.abbr-term')
							?.textContent.toLowerCase()
							.includes(query),
					) ||
					rows.find((r) => r.dataset.search.includes(query));
				if (best) {
					best.classList.add('abbr-highlight');
					// Scroll the term cell into view within the panel
					const termEl = best.querySelector('.abbr-term');
					if (termEl) {
						termEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
					}
				}
			} else {
				const items = Array.from(
					hebrewPanel.querySelectorAll('.hebrew-abbr-item'),
				);
				const best =
					items.find((r) => r.dataset.search.startsWith(query)) ||
					items.find((r) => r.dataset.search.includes(query));
				if (best) {
					best.classList.add('abbr-highlight');
					best.scrollIntoView({ behavior: 'smooth', block: 'center' });
				}
			}
		};

		filter.addEventListener('input', () => {
			clearTimeout(filterTimer);
			filterTimer = setTimeout(doLookup, 150);
		});
		filter.addEventListener('wa-clear', clearHighlights);

		// Clear lookup when switching tabs
		tabGroup.addEventListener('wa-tab-show', () => {
			filter.value = '';
			clearHighlights();
		});
	}

	/**
	 * Render Jastrow abbreviations into a tab panel from the shared abbrMap.
	 */
	_loadJastrowAbbreviations(panel) {
		const abbrs = this.dataLoader.abbrMap;

		if (Object.keys(abbrs).length === 0) {
			const err = document.createElement('div');
			err.className = 'abbr-no-results';
			err.textContent = 'Abbreviation data not available.';
			panel.appendChild(err);
			return;
		}

		const grid = document.createElement('div');
		grid.className = 'abbr-grid';

		const sorted = Object.keys(abbrs).sort((a, b) =>
			a.localeCompare(b, undefined, { sensitivity: 'base' }),
		);

		for (const key of sorted) {
			const def = abbrs[key];
			const row = document.createElement('div');
			row.className = 'abbr-row';
			row.dataset.search =
				`${key} ${def.original} ${def.modern}`.toLowerCase();

			const term = document.createElement('div');
			term.className = 'abbr-term';
			term.textContent = key;

			const defDiv = document.createElement('div');
			defDiv.className = 'abbr-def';

			const modern = document.createElement('div');
			modern.className = 'abbr-modern';
			modern.textContent = def.modern;

			const original = document.createElement('div');
			original.className = 'abbr-original';
			original.textContent = `Originally: ${def.original}`;

			defDiv.append(modern, original);
			row.append(term, defDiv);
			grid.appendChild(row);
		}

		panel.appendChild(grid);
	}

	/**
	 * Load and render Hebrew/Aramaic abbreviations into a tab panel.
	 */
	async _loadHebrewAbbreviations(panel) {
		try {
			if (!this._hebrewAbbrCache) {
				const response = await fetch('data/jastrow-hebrew-abbr.json');
				if (!response.ok) {
					throw new Error('Failed to load');
				}
				this._hebrewAbbrCache = await response.json();
			}

			const list = document.createElement('div');
			list.className = 'hebrew-abbr-list';

			// Skip first two lines (title and intro)
			const lines = this._hebrewAbbrCache.versions[0].text.slice(2);

			for (const line of lines) {
				// Rewrite Jastrow links for inline context (no target="_parent", no index.html prefix)
				const fixedLine = line.replace(
					/<a([^>]*)href="\/Jastrow,_([^"]*)"([^>]*)>/g,
					(_match, before, jastrowPath, after) => {
						const headword = jastrowPath
							.replace(/^\*/, '')
							.replace(/\.\d+$/, '');
						const cleanBefore = before.replace(/\s*target="[^"]*"/g, '');
						const cleanAfter = after.replace(/\s*target="[^"]*"/g, '');
						return `<a${cleanBefore}href="#word=${headword}"${cleanAfter}>`;
					},
				);

				const div = document.createElement('div');
				div.className = 'hebrew-abbr-item';
				// nosemgrep: javascript.browser.security.insecure-document-method.insecure-document-method
				div.innerHTML = DOMPurify.sanitize(fixedLine, {
					ALLOWED_TAGS: ['a', 'span', 'b', 'i', 'em', 'strong', 'br'],
					ALLOWED_ATTR: ['href', 'class', 'dir', 'data-ref'],
				});
				div.dataset.search = div.textContent.toLowerCase();

				list.appendChild(div);
			}

			panel.appendChild(list);

			// Handle clicks on Jastrow links — close dialog and navigate
			list.addEventListener('click', (e) => {
				const link = e.target.closest('a[href^="#word="]');
				if (link) {
					e.preventDefault();
					const abbrDialog = document.querySelector('.abbr-dialog');
					if (abbrDialog) {
						abbrDialog.open = false;
					}
					window.location.hash = link.getAttribute('href').substring(1);
				}
			});
		} catch {
			const err = document.createElement('div');
			err.className = 'abbr-no-results';
			err.textContent = 'Unable to load abbreviations. Check your connection.';
			panel.appendChild(err);
		}
	}

	/**
	 * Build entry guide dialog content on first open.
	 * Static educational content — no data loading needed.
	 */
	buildGuideDialog() {
		if (this._guideDialogBuilt) {
			return;
		}
		this._guideDialogBuilt = true;

		const container = document.querySelector('.guide-content');
		if (!container) {
			return;
		}

		// === Verb Example ===
		const verbLabel = document.createElement('div');
		verbLabel.className = 'guide-section-label';
		verbLabel.textContent = 'Example Entry — Verb';

		const verbCard = document.createElement('div');
		verbCard.className = 'guide-example-card';
		// nosemgrep: javascript.browser.security.insecure-document-method.insecure-document-method
		verbCard.innerHTML = DOMPurify.sanitize(
			'<span class="guide-callout" data-n="1">1</span>' +
				'<span class="headword"><span style="font-size:1.3rem;font-weight:700">אָמַר</span> I</span> ' +
				'<span class="guide-callout" data-n="2">2</span>' +
				'<span style="opacity:0.6">(b. h.; √אם, v. אֵם; cmp. חמר, עמר)</span> ' +
				'<span class="guide-callout" data-n="3">3</span>' +
				'a) <em>to join, knot; to be knotted, thick</em>; b) <em>to heap up</em>; c) <em>to join words, compose</em>; ' +
				'd) <em>to contract, bargain</em>. ' +
				'<span class="guide-callout" data-n="4">4</span>' +
				'1) <em>to speak, think, say, relate</em> ' +
				'<span class="guide-callout" data-n="5">5</span>' +
				'…א׳ ר׳ …א׳ ר׳ Rabbi … related in the name of R. … Ber. 3ᵇ; ' +
				'—2) <em>vow, devote</em>. ' +
				'<span class="guide-callout" data-n="6">6</span>' +
				'<strong>Nif.</strong> - נֶאֱמַר (b. h.) <em>be said, to read</em>…',
			{ ADD_TAGS: ['span'], ADD_ATTR: ['class', 'style', 'data-n'] },
		);

		// === Noun Example ===
		const nounLabel = document.createElement('div');
		nounLabel.className = 'guide-section-label';
		nounLabel.textContent = 'Example Entry — Noun';

		const nounCard = document.createElement('div');
		nounCard.className = 'guide-example-card';
		// nosemgrep: javascript.browser.security.insecure-document-method.insecure-document-method
		nounCard.innerHTML = DOMPurify.sanitize(
			'<span class="guide-callout" data-n="1">1</span>' +
				'<span class="headword"><span style="font-size:1.3rem;font-weight:700">דָּבָר</span></span> ' +
				'<span class="guide-callout" data-n="7">7</span>' +
				'm. (b. h.; preced.) ' +
				'<span class="guide-callout" data-n="4">4</span>' +
				'1) <em>word, utterance, command</em> (cmp. דִּיבּוּר)… ' +
				'—2) <em>thing, affair, object, occurrence</em>. ' +
				'<span class="guide-callout" data-n="8">8</span>' +
				'a) <em>idolatry</em>. —b) <em>swine</em>. —c) <em>leprosy</em>. —d) <em>unchaste conduct</em>…',
			{ ADD_TAGS: ['span'], ADD_ATTR: ['class', 'style', 'data-n'] },
		);

		container.append(verbLabel, verbCard, nounLabel, nounCard);

		// === Component Breakdown ===
		const components = [
			{
				num: '1',
				title: 'Headword',
				desc: 'The main entry word in Hebrew/Aramaic with vowel points. May include variant spellings and roman numeral disambiguators (I, II).',
			},
			{
				num: '2',
				title: 'Source Information',
				desc: 'Etymology indicators: <em>b.h.</em> = Biblical Hebrew, <em>ch.</em> = Chaldean/Aramaic, <em>√</em> = root, <em>v.</em> = see, <em>cmp.</em> = compare, <em>fr.</em> = from, <em>preced.</em> = preceding entry.',
			},
			{
				num: '3',
				title: 'Etymological Definitions',
				desc: 'Primitive meanings in <em>[brackets]</em> or lettered <em>a), b), c)</em> tracing semantic evolution from concrete to abstract.',
			},
			{
				num: '4',
				title: 'Practical Definitions',
				desc: 'Numbered senses <em>1), 2), 3)</em> showing how the word is actually used in Talmudic literature.',
			},
			{
				num: '5',
				title: 'Textual Citations',
				desc: 'Citations from Talmudic and related sources showing actual usage in context.',
			},
			{
				num: '6',
				title: 'Verb Forms (Binyanim)',
				desc: 'Hebrew: Pi. (Piel), Hif. (Hiphil), Hithpa. (Hithpael). Aramaic: Pa. (Pael), Af. (Aphel), Ithpe. (Ithpeel). Only in verb entries.',
			},
			{
				num: '7',
				title: 'Gender',
				desc: '<em>m.</em> = masculine, <em>f.</em> = feminine, <em>c.</em> = common. Appears in noun entries.',
			},
			{
				num: '8',
				title: 'Polysemes',
				desc: 'Related but distinct meanings labeled <em>a), b), c)</em> after the basic sense.',
			},
		];

		for (const comp of components) {
			const row = document.createElement('div');
			row.className = 'guide-component';

			const numEl = document.createElement('div');
			numEl.className = 'guide-component-number';
			numEl.dataset.n = comp.num;
			numEl.textContent = comp.num;

			const body = document.createElement('div');

			const title = document.createElement('div');
			title.className = 'guide-component-title';
			title.textContent = comp.title;

			const desc = document.createElement('div');
			desc.className = 'guide-component-desc';
			// nosemgrep: javascript.browser.security.insecure-document-method.insecure-document-method
			desc.innerHTML = DOMPurify.sanitize(comp.desc);

			body.append(title, desc);
			row.append(numEl, body);
			container.appendChild(row);
		}

		// === Legend ===
		const legendTitle = document.createElement('div');
		legendTitle.className = 'guide-legend-title';
		legendTitle.textContent = 'Inline Indicators';

		const legendList = document.createElement('div');
		legendList.className = 'guide-component-desc';
		// nosemgrep: javascript.browser.security.insecure-document-method.insecure-document-method
		legendList.innerHTML = DOMPurify.sanitize(
			'<ul>' +
				'<li><em>trnsf.</em> = transferred — meaning that evolved over time across sources</li>' +
				'<li><em>cmp.</em> = compare — related words with similar meanings</li>' +
				'<li><em>וכ׳</em> = "and so forth" — example has been shortened</li>' +
				'<li><em>sub.</em> = subaudi — supply an implied word</li>' +
				'</ul>',
		);

		container.append(legendTitle, legendList);
	}

	/**
	 * Show loading indicator
	 */
	showLoadingIndicator() {
		const main = document.querySelector('main');
		if (main) {
			main.replaceChildren();
			const wrapper = document.createElement('div');
			wrapper.style.cssText = 'text-align: center; padding: 3rem;';
			wrapper.setAttribute('role', 'status');
			const spinner = document.createElement('wa-spinner');
			spinner.style.fontSize = '3rem';
			const msg = document.createElement('p');
			msg.className = 'wa-body-l';
			msg.style.marginTop = '1rem';
			msg.id = 'load-message';
			msg.textContent = 'Loading dictionary data...';
			const progress = document.createElement('p');
			progress.className = 'wa-body-s';
			progress.id = 'load-progress';
			wrapper.append(spinner, msg, progress);
			main.appendChild(wrapper);
		}
	}

	/**
	 * Update loading progress
	 */
	updateLoadingProgress(progress) {
		const messageEl = document.getElementById('load-message');
		const progressEl = document.getElementById('load-progress');

		if (typeof progress === 'object') {
			if (messageEl && progress.message) {
				messageEl.textContent = progress.message;
			}
			if (progressEl) {
				progressEl.textContent =
					progress.percent != null ? `${Math.round(progress.percent)}%` : '';
			}
		} else {
			// Legacy number format fallback
			if (progressEl) {
				progressEl.textContent = `${Math.round(progress)}%`;
			}
		}
	}

	/**
	 * Hide loading indicator and prepare container for entries.
	 */
	hideLoadingIndicator() {
		const main = document.querySelector('main');
		if (main) {
			main.replaceChildren();
			const stack = document.createElement('div');
			stack.className = 'wa-stack';
			main.appendChild(stack);
			this.mainContent = main.querySelector('.wa-stack');
		}
	}

	/**
	 * Log version and cache info to the console for debugging/verification.
	 */
	async _logVersionInfo() {
		const table = {};

		// Code version from service worker
		if ('serviceWorker' in navigator) {
			const reg = await navigator.serviceWorker.getRegistration();
			if (reg?.active) {
				try {
					const swResp = await new Promise((resolve, reject) => {
						const ch = new MessageChannel();
						ch.port1.onmessage = (e) => resolve(e.data);
						setTimeout(() => reject(new Error('timeout')), 1000);
						reg.active.postMessage({ type: 'GET_VERSION' }, [ch.port2]);
					});
					if (swResp?.cacheVersion) {
						table['App version'] = swResp.cacheVersion;
					}
				} catch {
					/* timeout */
				}
				table['Service worker'] = 'active';
			} else if (reg?.waiting) {
				table['Service worker'] = 'waiting (update pending)';
			} else if (reg?.installing) {
				table['Service worker'] = 'installing';
			}
		} else {
			table['Service worker'] = 'unsupported';
		}

		// Data versions
		try {
			const resp = await fetch(IDB.VERSION_URL, { cache: 'no-store' });
			if (resp.ok) {
				const data = await resp.json();
				table['Data version (server)'] = data.v;
			}
		} catch {
			/* offline */
		}

		try {
			const db = await this.dataLoader.openDatabase();
			const stored = await new Promise((resolve) => {
				const tx = db.transaction(IDB.METADATA_STORE, 'readonly');
				const req = tx.objectStore(IDB.METADATA_STORE).get('version');
				req.onsuccess = () => resolve(req.result?.value || null);
				req.onerror = () => resolve(null);
			});
			db.close();
			table['Data version (cached)'] = stored || 'none';
		} catch {
			/* IDB unavailable */
		}

		table['Entries loaded'] = this.dataLoader.entries.length;

		console.log('%cJastrow Dictionary', 'font-weight:bold;font-size:14px');
		console.table(table);
	}

	/**
	 * Show no results message
	 */
	showNoResults() {
		this.clearEntries();
		const message = document.createElement('div');
		message.style.cssText = 'text-align: center; padding: 3rem;';
		const icon = document.createElement('wa-icon');
		icon.setAttribute('name', 'magnifying-glass');
		icon.style.cssText = 'font-size: 3rem; opacity: 0.3;';
		const text = document.createElement('p');
		text.className = 'wa-body-l';
		text.style.marginTop = '1rem';
		text.textContent = 'No results found';
		message.append(icon, text);
		this.mainContent.appendChild(message);
		window.announce('No results found');
	}

	/**
	 * Show error message to user with toast notification
	 */
	updatePageDialogOfflineState() {
		const dialog = document.querySelector('.page-dialog');
		if (!dialog?.open) {
			return;
		}

		if (!this.isOffline && this.currentDialogPage) {
			// Re-render the dialog to restore image, handlers, and button state
			this.showPageDialog(this.currentDialogPage);
		} else {
			const prevBtn = document.getElementById('page-prev-btn');
			const nextBtn = document.getElementById('page-next-btn');
			const openBtn = document.getElementById('page-open-btn');

			if (prevBtn) {
				prevBtn.disabled = true;
			}
			if (nextBtn) {
				nextBtn.disabled = true;
			}
			if (openBtn) {
				openBtn.style.pointerEvents = 'none';
				openBtn.setAttribute('aria-disabled', 'true');
			}
		}
	}

	async showOfflineToast(message, variant, icon) {
		const isOfflineMsg = variant === 'warning';
		window.announce(message, isOfflineMsg ? 'assertive' : 'polite');

		const toastContainer = document.querySelector('wa-toast');
		if (!toastContainer) {
			return;
		}

		await customElements.whenDefined('wa-toast');
		toastContainer.create(message, {
			variant,
			icon,
			duration: 5000,
		});
	}

	async showError(message) {
		console.error(message);
		window.announce(message, 'assertive');

		const toastContainer = document.querySelector('wa-toast');
		if (!toastContainer) {
			return;
		}

		await customElements.whenDefined('wa-toast');
		toastContainer.create(message, {
			variant: 'danger',
			icon: 'triangle-exclamation',
			duration: 5000,
		});
	}

	async _showSagesView(hash) {
		// Hide dictionary content (.wa-stack), keep header search visible for navigation
		this._previousTitle = document.title;
		document.title = 'Talmudic Sages - Jastrow Dictionary';
		if (this.mainContent) {
			this.mainContent.style.display = 'none';
		}

		if (!this._sagesExplorer) {
			this._sagesExplorer = new TalmudSagesExplorer();
		}

		try {
			await this._sagesExplorer.show();
		} catch (err) {
			console.error('Failed to load Sages view:', err);
			this._hideSagesView();
			const toast = document.querySelector('wa-toast');
			if (toast) {
				await customElements.whenDefined('wa-toast');
				toast.create(
					'Failed to load Talmudic Sages data. Check your connection.',
					{ variant: 'danger', icon: 'triangle-exclamation', duration: 5000 },
				);
			}
			this.loadInitialPage();
			return;
		}

		if (hash.startsWith('sage:')) {
			const sageId = hash.slice(5);
			this._sagesExplorer.openSage(sageId);
		} else {
			this._sagesExplorer.closeSage();
		}
	}

	_hideSagesView() {
		if (this._sagesExplorer) {
			this._sagesExplorer.hide();
		}
		// Restore dictionary content
		if (this.mainContent) {
			this.mainContent.style.display = '';
		}
		if (this._previousTitle) {
			document.title = this._previousTitle;
			this._previousTitle = null;
		}
	}
}

// Register service worker for offline support (skip on localhost for dev)
if (
	'serviceWorker' in navigator &&
	!location.hostname.startsWith('localhost') &&
	!location.hostname.startsWith('127.')
) {
	window.addEventListener('load', () => {
		navigator.serviceWorker
			.register('/sw.js')
			.then((registration) => {
				// Check for updates periodically
				setInterval(() => {
					registration.update();
				}, TIMEOUTS.SW_UPDATE_INTERVAL);

				// Handle service worker updates
				registration.addEventListener('updatefound', () => {
					const newWorker = registration.installing;
					newWorker.addEventListener('statechange', () => {
						if (
							newWorker.state === 'installed' &&
							navigator.serviceWorker.controller
						) {
							// New service worker installed, show update notification
							showUpdateNotification(newWorker);
						}
					});
				});
			})
			.catch((error) => {
				console.error('[App] Service Worker registration failed:', error);
			});

		// Handle service worker controller change — only reload if user initiated
		let refreshing = false;
		navigator.serviceWorker.addEventListener('controllerchange', () => {
			if (!refreshing && window._userInitiatedUpdate) {
				refreshing = true;
				window.location.reload();
			}
		});
	});
}

/**
 * Show a notification when a new version is available
 */
async function showUpdateNotification(newWorker) {
	const toastContainer = document.querySelector('wa-toast');
	if (!toastContainer) {
		return;
	}

	await customElements.whenDefined('wa-toast');
	const toastItem = await toastContainer.create(
		'A new version of the dictionary is available.',
		{
			variant: 'neutral',
			icon: 'circle-info',
			duration: 0,
		},
	);

	const updateButton = document.createElement('wa-button');
	updateButton.setAttribute('variant', 'brand');
	updateButton.setAttribute('size', 's');
	updateButton.textContent = 'Update Now';
	updateButton.style.cssText = 'margin-top: 0.5rem;';
	updateButton.addEventListener('click', () => {
		window._userInitiatedUpdate = true;
		newWorker.postMessage({ type: 'SKIP_WAITING' });
	});
	toastItem.appendChild(updateButton);
}

// Initialize app when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
	const app = new JastrowApp();
	app.init();
});
