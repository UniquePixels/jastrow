/**
 * Data Loader for Jastrow Dictionary
 * Efficiently loads and indexes JSONL data with streaming support
 * Supports loading split data files for Cloudflare Pages 25MB limit
 */

class JastrowDataLoader {
    constructor(dataUrls) {
        // Support both single URL (legacy) and array of URLs (split files)
        this.dataUrls = Array.isArray(dataUrls) ? dataUrls : [dataUrls];
        this.entries = [];
        this.headwordIndex = new Map(); // headword -> array of entry indices
        this.pageIndex = new Map(); // page number -> array of entry indices
        this.referenceIndex = new Map(); // reference -> array of entry indices
        this.ridIndex = new Map(); // rid -> entry index
        this.sortedHeadwords = []; // sorted array of headwords for binary search
        this.sortedReferences = [];     // sorted array of unique reference strings
        this.normalizedReferences = []; // parallel array of normalized forms
        this.isLoaded = false;
        this.loadProgress = 0;
    }

    /**
     * Normalize Hebrew text by keeping ONLY Hebrew letters
     * Removes: vowel marks (niqqud), numbers, roman numerals, asterisks, etc.
     * Normalizes sofit (final) letters to regular forms: ך→כ ם→מ ן→נ ף→פ ץ→צ
     */
    normalizeHebrew(text) {
        if (!text) return '';
        // Keep only Hebrew letters (Unicode range U+05D0 to U+05EA: א through ת)
        let normalized = text.replace(/[^\u05D0-\u05EA]/g, '');
        // Normalize sofit (final) letters to regular forms
        // Each sofit letter's code point is exactly 1 less than its regular form
        normalized = normalized.replace(/[\u05DA\u05DD\u05DF\u05E3\u05E5]/g, (ch) =>
            String.fromCharCode(ch.charCodeAt(0) + 1)
        );
        return normalized;
    }

    /**
     * Normalize a reference string for fuzzy matching.
     * Lowercases, strips periods, collapses whitespace, trims.
     */
    normalizeReference(ref) {
        if (!ref) return '';
        return ref.toLowerCase().replace(/\./g, '').replace(/\s+/g, ' ').trim();
    }

    /**
     * Open (or create) the IndexedDB database.
     * Creates object stores on first visit or schema upgrade.
     * @returns {Promise<IDBDatabase>}
     */
    openDatabase() {
        return new Promise((resolve, reject) => {
            if (!window.indexedDB) {
                reject(new Error('IndexedDB not supported'));
                return;
            }
            const request = indexedDB.open(IDB.DATABASE_NAME, IDB.SCHEMA_VERSION);
            request.onupgradeneeded = (event) => {
                const db = event.target.result;
                if (!db.objectStoreNames.contains(IDB.ENTRIES_STORE)) {
                    db.createObjectStore(IDB.ENTRIES_STORE, { keyPath: 'id' });
                }
                if (!db.objectStoreNames.contains(IDB.METADATA_STORE)) {
                    db.createObjectStore(IDB.METADATA_STORE, { keyPath: 'key' });
                }
            };
            request.onsuccess = (event) => resolve(event.target.result);
            request.onerror = (event) => reject(event.target.error);
        });
    }

    /**
     * Fetch version.json from server and compare to IDB metadata.
     * @param {IDBDatabase} db
     * @returns {Promise<{needsNetwork: boolean, serverVersion: string|null, hadCache: boolean}>}
     */
    async checkVersion(db) {
        let serverVersion = null;

        try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), IDB.VERSION_TIMEOUT);
            const response = await fetch(IDB.VERSION_URL, { signal: controller.signal });
            clearTimeout(timeoutId);

            if (response.ok) {
                const data = await response.json();
                serverVersion = data.v || null;
            }
        } catch {
            // Offline or timeout — will use cache if available
            if (window.DEBUG) console.log('[DataLoader] version.json fetch failed (offline?)');
        }

        // Read stored version from IDB
        const storedVersion = await new Promise((resolve) => {
            try {
                const tx = db.transaction(IDB.METADATA_STORE, 'readonly');
                const store = tx.objectStore(IDB.METADATA_STORE);
                const request = store.get('version');
                request.onsuccess = () => resolve(request.result?.value || null);
                request.onerror = () => resolve(null);
            } catch {
                resolve(null);
            }
        });

        const hadCache = storedVersion !== null;

        // If we couldn't reach the server, use cache if we have one
        if (serverVersion === null) {
            return { needsNetwork: !hadCache, serverVersion: null, hadCache };
        }

        // Compare versions
        return {
            needsNetwork: storedVersion !== serverVersion,
            serverVersion,
            hadCache,
        };
    }

    /**
     * Load all entries from IndexedDB entries store.
     * @param {IDBDatabase} db
     * @returns {Promise<Array>} entries array, or empty array if cache miss
     */
    loadFromCache(db) {
        return new Promise((resolve) => {
            try {
                const tx = db.transaction(IDB.ENTRIES_STORE, 'readonly');
                const store = tx.objectStore(IDB.ENTRIES_STORE);
                const request = store.getAll();
                request.onsuccess = () => resolve(request.result || []);
                request.onerror = () => resolve([]);
            } catch {
                resolve([]);
            }
        });
    }

    /**
     * Write entries to IndexedDB in batches, then store version metadata.
     * Entries are written in fire-and-forget batches during streaming.
     * Version is written only after all batches complete.
     * @param {IDBDatabase} db
     * @param {Array} entries - all entries to store
     * @param {string} version - server version string to store in metadata
     * @returns {Promise<void>}
     */
    async writeToCache(db, entries, version) {
        const batchSize = IDB.BATCH_SIZE;
        const pendingWrites = [];

        for (let i = 0; i < entries.length; i += batchSize) {
            const batch = entries.slice(i, i + batchSize);
            const writePromise = new Promise((resolve, reject) => {
                const tx = db.transaction(IDB.ENTRIES_STORE, 'readwrite');
                const store = tx.objectStore(IDB.ENTRIES_STORE);
                for (const entry of batch) {
                    store.put(entry);
                }
                tx.oncomplete = () => resolve();
                tx.onerror = (event) => reject(event.target.error);
            });
            pendingWrites.push(writePromise);
        }

        // Await all batch writes
        await Promise.all(pendingWrites);

        // Write version metadata only after all entries confirmed
        await new Promise((resolve, reject) => {
            const tx = db.transaction(IDB.METADATA_STORE, 'readwrite');
            const store = tx.objectStore(IDB.METADATA_STORE);
            store.put({ key: 'version', value: version });
            tx.oncomplete = () => resolve();
            tx.onerror = (event) => reject(event.target.error);
        });

        if (window.DEBUG) console.log(`[DataLoader] Cached ${entries.length} entries, version: ${version}`);
    }

    /**
     * Clear the entries store (before re-populating on version mismatch).
     * @param {IDBDatabase} db
     * @returns {Promise<void>}
     */
    clearCache(db) {
        return new Promise((resolve, reject) => {
            try {
                const tx = db.transaction(IDB.ENTRIES_STORE, 'readwrite');
                const store = tx.objectStore(IDB.ENTRIES_STORE);
                const request = store.clear();
                request.onsuccess = () => resolve();
                request.onerror = (event) => reject(event.target.error);
            } catch {
                resolve();
            }
        });
    }

    /**
     * Build all in-memory indexes from the entries array.
     * Used when loading from IndexedDB cache (since loadFile() is skipped).
     */
    buildIndexes() {
        this.headwordIndex.clear();
        this.pageIndex.clear();
        this.referenceIndex.clear();
        this.ridIndex.clear();

        for (let index = 0; index < this.entries.length; index++) {
            const entry = this.entries[index];

            // Index by headword
            const headword = this.normalizeHebrew(entry.hw);
            if (!this.headwordIndex.has(headword)) {
                this.headwordIndex.set(headword, []);
            }
            this.headwordIndex.get(headword).push(index);

            // Index by page
            if (entry.p) {
                if (!this.pageIndex.has(entry.p)) {
                    this.pageIndex.set(entry.p, []);
                }
                this.pageIndex.get(entry.p).push(index);
            }

            // Index by references
            if (entry.rf) {
                for (const refs of Object.values(entry.rf)) {
                    for (const ref of refs) {
                        if (!this.referenceIndex.has(ref)) {
                            this.referenceIndex.set(ref, []);
                        }
                        this.referenceIndex.get(ref).push(index);
                    }
                }
            }

            // Index by rid
            if (entry.id) {
                this.ridIndex.set(entry.id, index);
            }
        }
    }

    /**
     * Load and parse dictionary data.
     * Checks IndexedDB cache first (with version validation), falls back to network.
     * @param {Function} progressCallback - receives { phase, percent?, message? }
     */
    async load(progressCallback) {
        try {
            let db = null;
            let serverVersion = null;
            let hadCache = false;
            let loadedFromCache = false;

            // Try IndexedDB path
            try {
                db = await this.openDatabase();
                const versionCheck = await this.checkVersion(db);
                serverVersion = versionCheck.serverVersion;
                hadCache = versionCheck.hadCache;

                if (!versionCheck.needsNetwork) {
                    // Cache hit — load from IDB
                    if (progressCallback) {
                        progressCallback({ phase: 'cache', message: 'Loading dictionary...' });
                    }
                    const cachedEntries = await this.loadFromCache(db);

                    if (cachedEntries.length > 0) {
                        this.entries = cachedEntries;
                        this.buildIndexes();
                        loadedFromCache = true;
                        if (window.DEBUG) console.log(`[DataLoader] Loaded ${cachedEntries.length} entries from IndexedDB`);
                    }
                    // If cache returned empty despite version match, fall through to network
                }
            } catch (idbError) {
                if (window.DEBUG) console.warn('[DataLoader] IndexedDB unavailable, falling back to network:', idbError);
                db = null;
            }

            // Network path — first visit, version mismatch, or IDB failure
            if (!loadedFromCache) {
                // Distinguish "updating stale data" from "first download"
                const isUpdate = hadCache;
                if (db) {
                    await this.clearCache(db);
                }

                if (progressCallback) {
                    progressCallback({
                        phase: 'download',
                        message: isUpdate ? 'Updating dictionary...' : 'Downloading dictionary...',
                        percent: 0
                    });
                }

                // Use existing JSONL streaming (progressCallback adapted)
                for (let fileIndex = 0; fileIndex < this.dataUrls.length; fileIndex++) {
                    const dataUrl = this.dataUrls[fileIndex];
                    await this.loadFile(dataUrl, fileIndex, (percent) => {
                        if (progressCallback) {
                            progressCallback({ phase: 'download', percent });
                        }
                    });
                }

                // Write to IDB cache (fire-and-forget error handling)
                // Use 'unknown' sentinel if version.json was unavailable — next visit with
                // a working version.json will detect the mismatch and re-download cleanly
                if (db) {
                    try {
                        await this.writeToCache(db, this.entries, serverVersion || 'unknown');
                    } catch (writeError) {
                        if (window.DEBUG) console.warn('[DataLoader] Failed to write to IndexedDB cache:', writeError);
                        // App continues fine — just won't have cache next visit
                    }
                }
            }

            if (db) {
                db.close();
            }

            // Build indexes (same path regardless of source)
            this.sortedHeadwords = Array.from(this.headwordIndex.keys()).sort();

            const refSet = new Set();
            for (const key of this.referenceIndex.keys()) {
                refSet.add(key);
            }
            const refArray = Array.from(refSet);
            const normMap = new Map(refArray.map(r => [r, this.normalizeReference(r)]));
            refArray.sort((a, b) => {
                const na = normMap.get(a), nb = normMap.get(b);
                return na < nb ? -1 : na > nb ? 1 : 0;
            });
            this.sortedReferences = refArray;
            this.normalizedReferences = refArray.map(r => normMap.get(r));

            this.isLoaded = true;
            return this.entries;
        } catch (error) {
            console.error('Error loading data:', error);
            throw error;
        }
    }

    /**
     * Load and parse a single JSONL file
     */
    async loadFile(dataUrl, fileIndex, progressCallback) {
        const response = await fetch(dataUrl);
        if (!response.ok) {
            throw new Error(`Failed to load data: ${response.statusText}`);
        }

        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let buffer = '';
        const totalSize = parseInt(response.headers.get('content-length') || '0', 10);
        let loadedSize = 0;
        const numFiles = this.dataUrls.length;

        while (true) {
            const { done, value } = await reader.read();

            if (done) break;

            loadedSize += value.length;

            // Calculate overall progress across all files
            const fileProgress = totalSize > 0 ? (loadedSize / totalSize) : 0;
            const overallProgress = Math.min(((fileIndex + fileProgress) / numFiles) * 100, 100);
            this.loadProgress = overallProgress;

            if (progressCallback) {
                progressCallback(this.loadProgress);
            }

            // Decode and add to buffer
            buffer += decoder.decode(value, { stream: true });

            // Process complete lines
            const lines = buffer.split('\n');
            buffer = lines.pop() || ''; // Keep incomplete line in buffer

            for (const line of lines) {
                if (line.trim()) {
                    try {
                        const entry = JSON.parse(line);
                        const index = this.entries.length;
                        this.entries.push(entry);

                        // Index by headword (normalized to remove niqqud, numbers, etc.)
                        const headword = this.normalizeHebrew(entry.hw);
                        if (!this.headwordIndex.has(headword)) {
                            this.headwordIndex.set(headword, []);
                        }
                        this.headwordIndex.get(headword).push(index);

                        // Index by page
                        if (entry.p) {
                            if (!this.pageIndex.has(entry.p)) {
                                this.pageIndex.set(entry.p, []);
                            }
                            this.pageIndex.get(entry.p).push(index);
                        }

                        // Index by references (structured object with category arrays)
                        if (entry.rf) {
                            for (const refs of Object.values(entry.rf)) {
                                for (const ref of refs) {
                                    if (!this.referenceIndex.has(ref)) {
                                        this.referenceIndex.set(ref, []);
                                    }
                                    this.referenceIndex.get(ref).push(index);
                                }
                            }
                        }

                        // Index by rid (unique identifier)
                        if (entry.id) {
                            this.ridIndex.set(entry.id, index);
                        }
                    } catch (e) {
                        console.error('Error parsing line:', e);
                    }
                }
            }
        }

        // Process any remaining data in buffer
        if (buffer.trim()) {
            try {
                const entry = JSON.parse(buffer);
                const index = this.entries.length;
                this.entries.push(entry);

                // Index final entry (same logic as streaming loop above)
                const headword = this.normalizeHebrew(entry.hw);
                if (!this.headwordIndex.has(headword)) {
                    this.headwordIndex.set(headword, []);
                }
                this.headwordIndex.get(headword).push(index);

                if (entry.p) {
                    if (!this.pageIndex.has(entry.p)) {
                        this.pageIndex.set(entry.p, []);
                    }
                    this.pageIndex.get(entry.p).push(index);
                }

                if (entry.rf) {
                    for (const refs of Object.values(entry.rf)) {
                        for (const ref of refs) {
                            if (!this.referenceIndex.has(ref)) {
                                this.referenceIndex.set(ref, []);
                            }
                            this.referenceIndex.get(ref).push(index);
                        }
                    }
                }

                if (entry.id) {
                    this.ridIndex.set(entry.id, index);
                }
            } catch (e) {
                console.error('Error parsing final line:', e);
            }
        }
    }

    /**
     * Search for entries by headword (alphabetically closest match)
     * Uses binary search for O(log n) performance instead of O(n)
     */
    searchByHeadword(query) {
        if (!this.isLoaded) {
            throw new Error('Data not loaded yet');
        }

        const normalizedQuery = this.normalizeHebrew(query);

        // Exact match
        if (this.headwordIndex.has(normalizedQuery)) {
            const indices = this.headwordIndex.get(normalizedQuery);
            return indices.map(i => this.entries[i]);
        }

        // Find closest alphabetical match using binary search
        const closestIndex = this.binarySearchClosest(normalizedQuery);
        const closestHeadword = this.sortedHeadwords[closestIndex];

        const indices = this.headwordIndex.get(closestHeadword) || [];
        return indices.map(i => this.entries[i]);
    }

    /**
     * Binary search to find the closest headword alphabetically
     * Returns the index of the closest match in sortedHeadwords array
     */
    binarySearchClosest(query) {
        let left = 0;
        let right = this.sortedHeadwords.length - 1;
        let closest = 0;

        while (left <= right) {
            const mid = Math.floor((left + right) / 2);
            const headword = this.sortedHeadwords[mid];

            if (headword === query) {
                return mid; // Exact match
            }

            if (headword < query) {
                left = mid + 1;
                // Update closest to the element just before where query would be
                if (left < this.sortedHeadwords.length) {
                    closest = left;
                }
            } else {
                right = mid - 1;
            }
        }

        // Return the first headword >= query, or the last headword if query is larger than all
        if (left < this.sortedHeadwords.length && this.sortedHeadwords[left] >= query) {
            return left;
        }

        return Math.min(closest, this.sortedHeadwords.length - 1);
    }

    /**
     * Search for headwords matching a prefix.
     * Returns up to `limit` raw headword strings (with niqqud).
     */
    searchHeadwordPrefix(query, limit = 8) {
        if (!this.isLoaded || !query) return [];

        const normalized = this.normalizeHebrew(query);
        if (!normalized) return [];

        // Binary search for insertion point
        let left = 0;
        let right = this.sortedHeadwords.length;
        while (left < right) {
            const mid = (left + right) >>> 1;
            if (this.sortedHeadwords[mid] < normalized) {
                left = mid + 1;
            } else {
                right = mid;
            }
        }

        // Collect up to `limit` entries that start with the prefix
        const results = [];
        for (let i = left; i < this.sortedHeadwords.length && results.length < limit; i++) {
            if (this.sortedHeadwords[i].startsWith(normalized)) {
                const indices = this.headwordIndex.get(this.sortedHeadwords[i]);
                if (indices && indices.length > 0) {
                    results.push(this.entries[indices[0]].hw);
                }
            } else if (this.sortedHeadwords[i] > normalized + '\uFFFF') {
                break;
            }
        }
        return results;
    }

    /**
     * Search for references matching a prefix (normalized).
     * Returns up to `limit` original reference strings.
     */
    searchReferencePrefix(query, limit = 8) {
        if (!this.isLoaded || !query) return [];

        const normalized = this.normalizeReference(query);
        if (!normalized) return [];

        // Binary search on normalizedReferences
        let left = 0;
        let right = this.normalizedReferences.length;
        while (left < right) {
            const mid = (left + right) >>> 1;
            if (this.normalizedReferences[mid] < normalized) {
                left = mid + 1;
            } else {
                right = mid;
            }
        }

        const results = [];
        for (let i = left; i < this.normalizedReferences.length && results.length < limit; i++) {
            if (this.normalizedReferences[i].startsWith(normalized)) {
                results.push(this.sortedReferences[i]);
            } else {
                break;
            }
        }
        return results;
    }

    /**
     * Get entries by page number
     */
    getByPage(pageNumber) {
        if (!this.isLoaded) {
            throw new Error('Data not loaded yet');
        }

        const indices = this.pageIndex.get(pageNumber) || [];
        return indices.map(i => this.entries[i]);
    }

    /**
     * Search entries by reference prefix (fuzzy).
     * Returns all entries that have any reference starting with the query.
     * Deduplicates entries by index.
     */
    searchByReferencePrefix(query) {
        if (!this.isLoaded || !query) return [];

        const normalized = this.normalizeReference(query);
        if (!normalized) return [];

        // Binary search for start position
        let left = 0;
        let right = this.normalizedReferences.length;
        while (left < right) {
            const mid = (left + right) >>> 1;
            if (this.normalizedReferences[mid] < normalized) {
                left = mid + 1;
            } else {
                right = mid;
            }
        }

        // Collect matching refs with word-boundary awareness:
        // "Bamidbar Rabbah 1" should match "Bamidbar Rabbah 1" and
        // "Bamidbar Rabbah 1:5" but NOT "Bamidbar Rabbah 10"
        const entryIndices = new Set();
        for (let i = left; i < this.normalizedReferences.length; i++) {
            const nr = this.normalizedReferences[i];
            if (!nr.startsWith(normalized)) break;

            // Check boundary: next char after prefix must be end, ':', or space
            if (nr.length > normalized.length) {
                const nextChar = nr[normalized.length];
                if (nextChar !== ':' && nextChar !== ' ') continue;
            }

            const ref = this.sortedReferences[i];
            const indices = this.referenceIndex.get(ref) || [];
            for (const idx of indices) {
                entryIndices.add(idx);
            }
        }

        return Array.from(entryIndices).sort((a, b) => a - b).map(i => this.entries[i]);
    }

    /**
     * Get entry by rid (unique identifier)
     */
    getByRid(rid) {
        if (!this.isLoaded) {
            throw new Error('Data not loaded yet');
        }

        const index = this.ridIndex.get(rid);
        return index !== undefined ? this.entries[index] : null;
    }

    /**
     * Get the flat array index of an entry by rid.
     * @returns {number} index, or -1 if not found
     */
    getEntryIndex(rid) {
        if (!this.isLoaded) return -1;
        const index = this.ridIndex.get(rid);
        return index !== undefined ? index : -1;
    }

    /**
     * Get entries by index range (for infinite scroll).
     * @param {number} start - Start index (inclusive)
     * @param {number} count - Number of entries to return
     * @returns {Array} entries
     */
    getEntriesByRange(start, count) {
        if (!this.isLoaded) throw new Error('Data not loaded yet');
        const clamped = Math.max(0, Math.min(start, this.entries.length));
        return this.entries.slice(clamped, clamped + count);
    }

    /**
     * Get the index of the first entry on a given dictionary page.
     * @param {number} pageNumber
     * @returns {number} index, or -1 if page not found
     */
    getPageStartIndex(pageNumber) {
        if (!this.isLoaded) throw new Error('Data not loaded yet');
        const indices = this.pageIndex.get(pageNumber);
        return indices && indices.length > 0 ? indices[0] : -1;
    }

    /**
     * Get total number of entries
     */
    getTotalEntries() {
        return this.entries.length;
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = JastrowDataLoader;
}
