/**
 * InfiniteScroll — bidirectional infinite scrolling through dictionary entries.
 *
 * Uses native DOM rendering with scroll event detection. No virtual scrolling
 * library. Entries are real DOM elements that accumulate up to DOM_CAP, then
 * evicted from the far end.
 *
 * Scroll stability on prepend: manual scrollTop adjustment (Sefaria pattern)
 * measures an anchor element before/after DOM insertion and corrects scrollTop.
 * CSS overflow-anchor provides additional stability in supporting browsers
 * (not Safari).
 */
class InfiniteScroll {
	constructor({ container, createEntry, getEntries, getPageStartIndex, totalEntries, onPageChange }) {
		this.container = container;
		this.createEntry = createEntry;
		this.getEntries = getEntries;
		this.getPageStartIndex = getPageStartIndex;
		this.totalEntries = totalEntries;
		this.onPageChange = onPageChange;

		// Current loaded range in the flat entry array
		this.startIndex = 0;
		this.endIndex = 0;

		// Scroll state
		this.currentVisiblePage = 0;
		this._urlUpdateTimer = null;
		this._scrollHandler = null;
		this._rafId = null;
		this._loadingTop = false;
		this._loadingBottom = false;
		this._listening = false;
		this._lastScrollTop = 0;
		this._suppressLoading = false;
		this._settleObserver = null;
		this._settleTimers = null;
		this._driftObserver = null;
		this._driftTimers = null;

		this.CHUNK_SIZE = 50;
	}

	/**
	 * Start listening for scroll events.
	 */
	init() {
		this._scrollHandler = () => {
			if (this._rafId) return; // Already scheduled
			this._rafId = requestAnimationFrame(() => {
				this._rafId = null;
				this._onScroll();
			});
		};
		this._startListening();
	}

	/**
	 * Load initial entries around a target dictionary page.
	 * Called by search, page jump, URL routing.
	 */
	loadInitial(targetPage, scrollToEntryIndex = -1) {
		// Pause scroll detection during setup
		this._stopListening();
		this._cancelSettle();
		this._cancelDriftObserver();
		this._suppressLoading = true;

		// Set visible page immediately
		if (targetPage > 0) {
			this.currentVisiblePage = targetPage;
		}

		// Determine start index
		let start;
		if (scrollToEntryIndex >= 0) {
			start = scrollToEntryIndex;
		} else {
			start = this.getPageStartIndex(targetPage);
			if (start < 0) return;
		}

		// Load one chunk
		const entries = this.getEntries(start, this.CHUNK_SIZE);
		this.startIndex = start;
		this.endIndex = start + entries.length;

		// Render entries
		this.container.replaceChildren();
		const fragment = document.createDocumentFragment();
		for (const entry of entries) {
			const el = this.createEntry(entry);
			el.dataset.dictPage = entry.p;
			fragment.appendChild(el);
		}
		this.container.appendChild(fragment);

		// Scroll to top immediately — all entries are below, so WA components
		// growing taller only extends content downward.
		window.scrollTo({ top: 0, behavior: 'instant' });
		this._lastScrollTop = 0;

		// Wait for WA web components to finish rendering before enabling
		// scroll detection. Without this, async component upgrades cause
		// layout shifts that compound with the first scroll input ("jump").
		this._waitForSettle(() => {
			this._suppressLoading = false;
			this._startListening();
		});
	}

	/**
	 * Wait for container layout to settle after WA component upgrades.
	 * Uses ResizeObserver to detect when rendering quiesces.
	 */
	_waitForSettle(callback) {
		const timers = { settle: null, safety: null };

		timers.safety = setTimeout(() => {
			this._settleObserver?.disconnect();
			this._settleObserver = null;
			this._settleTimers = null;
			callback();
		}, window.SCROLL.RESIZE_SAFETY_TIMEOUT);

		const observer = new ResizeObserver(() => {
			clearTimeout(timers.settle);
			timers.settle = setTimeout(() => {
				observer.disconnect();
				clearTimeout(timers.safety);
				this._settleObserver = null;
				this._settleTimers = null;
				callback();
			}, window.SCROLL.RESIZE_SETTLE_MS);
		});
		observer.observe(this.container);
		this._settleObserver = observer;
		this._settleTimers = timers;
	}

	/**
	 * Cancel any pending settle observation (e.g. on rapid re-navigation).
	 */
	_cancelSettle() {
		if (this._settleObserver) {
			this._settleObserver.disconnect();
			this._settleObserver = null;
		}
		if (this._settleTimers) {
			clearTimeout(this._settleTimers.settle);
			clearTimeout(this._settleTimers.safety);
			this._settleTimers = null;
		}
	}

	/**
	 * Reset — clear container and all state.
	 */
	reset() {
		this._stopListening();
		this.startIndex = 0;
		this.endIndex = 0;
		this.currentVisiblePage = 0;
		this.container.replaceChildren();
	}

	/**
	 * Scroll to a specific entry by ID using ResizeObserver for timing.
	 */
	scrollToEntry(entryId) {
		const entryElement = this.container.querySelector(`[data-entry-id="${CSS.escape(entryId)}"]`);
		if (!entryElement) return;

		this.container.querySelectorAll('.entry-highlight').forEach(el => {
			el.classList.remove('entry-highlight');
		});
		entryElement.classList.add('entry-highlight');

		let settleTimer = null;
		const safetyTimer = setTimeout(() => {
			observer.disconnect();
			this._doScroll(entryElement);
		}, window.SCROLL.RESIZE_SAFETY_TIMEOUT);

		const observer = new ResizeObserver(() => {
			clearTimeout(settleTimer);
			settleTimer = setTimeout(() => {
				observer.disconnect();
				clearTimeout(safetyTimer);
				this._doScroll(entryElement);
			}, window.SCROLL.RESIZE_SETTLE_MS);
		});

		observer.observe(entryElement);

		setTimeout(() => {
			entryElement.classList.remove('entry-highlight');
		}, window.TIMEOUTS.SCROLL_HIGHLIGHT_DURATION);
	}

	_doScroll(element) {
		const rect = element.getBoundingClientRect();
		const currentScrollTop = window.pageYOffset || document.documentElement.scrollTop;
		const headerOffset = 100;
		window.scrollTo({ top: currentScrollTop + rect.top - headerOffset, behavior: 'instant' });
	}

	/**
	 * Destroy — full cleanup.
	 */
	destroy() {
		this._stopListening();
		this._cancelSettle();
		this._cancelDriftObserver();
		clearTimeout(this._urlUpdateTimer);
		if (this._rafId) {
			cancelAnimationFrame(this._rafId);
			this._rafId = null;
		}
	}

	// ---- Scroll handler ----

	_onScroll() {
		this._updateVisiblePage();

		// Don't load more entries while initial render is settling
		if (this._suppressLoading) return;

		const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
		const scrollBottom = scrollTop + window.innerHeight;
		const docHeight = document.documentElement.scrollHeight;
		const scrollingDown = scrollTop > this._lastScrollTop;
		const scrollingUp = scrollTop < this._lastScrollTop;
		this._lastScrollTop = scrollTop;

		// Near bottom AND scrolling down — load forward
		if (scrollingDown && docHeight - scrollBottom < window.SCROLL.LOAD_THRESHOLD && this.endIndex < this.totalEntries) {
			this._loadForward();
		}

		// Near top AND scrolling up — load backward
		if (scrollingUp && scrollTop < window.SCROLL.LOAD_THRESHOLD && this.startIndex > 0 && !this._loadingTop) {
			this._loadBackward();
		}
	}

	_loadForward() {
		if (this._loadingBottom) return;
		this._loadingBottom = true;

		const newEntries = this.getEntries(this.endIndex, this.CHUNK_SIZE);
		if (newEntries.length === 0) {
			this._loadingBottom = false;
			return;
		}

		const fragment = document.createDocumentFragment();
		for (const entry of newEntries) {
			const el = this.createEntry(entry);
			el.dataset.dictPage = entry.p;
			fragment.appendChild(el);
		}
		this.container.appendChild(fragment);
		this.endIndex += newEntries.length;

		// Defer eviction to the next frame so the browser paints new content
		// before old content is removed. Prevents a blank flash on Safari.
		requestAnimationFrame(() => {
			this._evictTop();
			this._loadingBottom = false;
		});
	}

	_loadBackward() {
		if (this._loadingTop) return;
		this._loadingTop = true;
		this._cancelDriftObserver();

		const count = Math.min(this.CHUNK_SIZE, this.startIndex);
		if (count === 0) {
			this._loadingTop = false;
			return;
		}

		const newStart = this.startIndex - count;
		const newEntries = this.getEntries(newStart, count);
		if (newEntries.length === 0) {
			this._loadingTop = false;
			return;
		}

		// --- Loading banner + anchor-based scroll correction ---
		// The banner serves two purposes:
		//   1. Communicates loading state clearly to the user.
		//   2. Pauses scrolling while new entries are prepared.
		// After the banner's minimum display time, entries are inserted and
		// scroll position is corrected using anchor drift measurement
		// (same proven pattern as _evictTop). This avoids fragile offscreen
		// height estimation entirely.

		// 1. Show loading banner at top (sticky + height:0 overlay)
		const loader = document.createElement('div');
		loader.className = 'scroll-loading-top scroll-anchor-none';
		const inner = document.createElement('div');
		inner.className = 'scroll-loading-top-inner';
		const loaderSpinner = document.createElement('wa-spinner');
		inner.append(loaderSpinner, ' Loading entries\u2026');
		loader.appendChild(inner);
		this.container.prepend(loader);

		// 2. Build entries in a document fragment (no layout, no width issues)
		const fragment = document.createDocumentFragment();
		for (const entry of newEntries) {
			const el = this.createEntry(entry);
			el.dataset.dictPage = entry.p;
			fragment.appendChild(el);
		}

		// 3. After minimum banner time, insert entries and correct scroll
		setTimeout(() => {
			// Anchor on the first real entry (after the loader)
			const anchorEl = loader.nextElementSibling;
			const anchorTop = anchorEl ? anchorEl.getBoundingClientRect().top : 0;

			// Disable browser scroll anchoring during DOM mutations to
			// prevent Chrome's auto-correction from interfering with our
			// manual anchor-based correction.
			this.container.style.overflowAnchor = 'none';

			// Insert new entries above the loader, then remove loader
			this.container.insertBefore(fragment, loader);
			loader.remove();
			this.startIndex = newStart;

			// Correct scroll position so the anchor stays in place
			if (anchorEl) {
				const drift = anchorEl.getBoundingClientRect().top - anchorTop;
				if (window.DEBUG) {
					console.log('[Scroll] backward anchor correction:', {
						anchorId: anchorEl.dataset?.entryId,
						anchorTop,
						afterTop: anchorEl.getBoundingClientRect().top,
						drift,
						scrollTop: window.pageYOffset,
					});
				}
				window.scrollBy(0, drift);
			}

			// Re-enable browser scroll anchoring
			this.container.style.overflowAnchor = '';

			// Defer eviction to the next frame so the browser paints new
			// content before old content is removed.
			requestAnimationFrame(() => {
				this._evictBottom();
			});
			this._loadingTop = false;

			// Track WA component growth via anchor document position.
			// Document position (rect.top + pageYOffset) is immune to both
			// user scrolling and bottom eviction.
			if (anchorEl) {
				this._correctDriftAfterSettle(anchorEl);
			}
		}, window.SCROLL.LOADING_BANNER_MIN);
	}

	/**
	 * Post-insertion drift correction after WA components finish rendering.
	 * Tracks the anchor's document position (rect.top + pageYOffset), which
	 * is immune to user scrolling (cancels out) and bottom eviction (below
	 * anchor). Only one drift observer runs at a time.
	 */
	_correctDriftAfterSettle(anchorEl) {
		this._cancelDriftObserver();

		const timers = { settle: null, safety: null };
		const savedDocPos = anchorEl.getBoundingClientRect().top
			+ (window.pageYOffset || document.documentElement.scrollTop);

		const observer = new ResizeObserver(() => {
			clearTimeout(timers.settle);
			timers.settle = setTimeout(() => {
				observer.disconnect();
				this._driftObserver = null;
				this._driftTimers = null;
				const currentDocPos = anchorEl.getBoundingClientRect().top
					+ (window.pageYOffset || document.documentElement.scrollTop);
				const drift = currentDocPos - savedDocPos;
				if (window.DEBUG) {
					console.log('[Scroll] drift settle:', {
						savedDocPos,
						currentDocPos,
						drift,
						corrected: Math.abs(drift) > 1,
					});
				}
				if (Math.abs(drift) > 1) {
					window.scrollBy(0, drift);
				}
			}, window.SCROLL.RESIZE_SETTLE_MS);
		});
		observer.observe(this.container);
		this._driftObserver = observer;
		this._driftTimers = timers;

		// Don't observe forever
		timers.safety = setTimeout(() => {
			observer.disconnect();
			clearTimeout(timers.settle);
			this._driftObserver = null;
			this._driftTimers = null;
		}, window.SCROLL.RESIZE_SAFETY_TIMEOUT);
	}

	/**
	 * Cancel any running post-insertion drift observer.
	 */
	_cancelDriftObserver() {
		if (this._driftObserver) {
			this._driftObserver.disconnect();
			this._driftObserver = null;
		}
		if (this._driftTimers) {
			clearTimeout(this._driftTimers.settle);
			clearTimeout(this._driftTimers.safety);
			this._driftTimers = null;
		}
	}

	// ---- Eviction ----

	_evictTop() {
		const entryCount = this.container.children.length;
		if (entryCount <= window.SCROLL.DOM_CAP) return;

		const excess = entryCount - window.SCROLL.DOM_CAP;

		// Anchor to keep viewport stable during top removal
		const anchorEl = this.container.children[excess];
		const anchorTop = anchorEl ? anchorEl.getBoundingClientRect().top : 0;

		for (let i = 0; i < excess; i++) {
			this.container.firstElementChild.remove();
		}
		this.startIndex += excess;

		// Adjust scroll position after removing content above viewport
		if (anchorEl) {
			const newAnchorTop = anchorEl.getBoundingClientRect().top;
			const drift = newAnchorTop - anchorTop;
			window.scrollBy(0, drift);
		}
	}

	_evictBottom() {
		const entryCount = this.container.children.length;
		if (entryCount <= window.SCROLL.DOM_CAP) return;

		const excess = entryCount - window.SCROLL.DOM_CAP;
		for (let i = 0; i < excess; i++) {
			this.container.lastElementChild.remove();
		}
		this.endIndex -= excess;
	}

	_updateVisiblePage() {
		const viewportMid = window.innerHeight / 2;
		const entries = this.container.querySelectorAll('[data-dict-page]');

		for (const el of entries) {
			const rect = el.getBoundingClientRect();
			if (rect.top <= viewportMid && rect.bottom >= 0) {
				const page = parseInt(el.dataset.dictPage);
				if (page !== this.currentVisiblePage) {
					this.currentVisiblePage = page;
					if (this.onPageChange) {
						clearTimeout(this._urlUpdateTimer);
						this._urlUpdateTimer = setTimeout(() => {
							this.onPageChange(page);
						}, window.SCROLL.URL_UPDATE_DEBOUNCE);
					}
				}
				break;
			}
		}
	}

	// ---- Listener management ----

	_startListening() {
		if (this._listening || !this._scrollHandler) return;
		window.addEventListener('scroll', this._scrollHandler, { passive: true });
		this._listening = true;
	}

	_stopListening() {
		if (!this._listening) return;
		window.removeEventListener('scroll', this._scrollHandler);
		this._listening = false;
		if (this._rafId) {
			cancelAnimationFrame(this._rafId);
			this._rafId = null;
		}
	}
}
