const { BloomFilter } = require("bloom-filters");

/**
 * Bloom Filter for quick existence checks
 * Useful for checking if email/username has been seen before (spam/duplicate detection)
 * False positives possible, but no false negatives
 */

class BloomFilterManager {
    constructor(size = 100000, hashFunctions = 4) {
        this.bloomFilter = new BloomFilter(size, hashFunctions);
        this.size = size;
        this.hashFunctions = hashFunctions;
        this.elementsAdded = 0;
    }

    /**
     * Add an element to the bloom filter
     * @param {string} element - Element to add (email, username, etc.)
     */
    add(element) {
        if (!element || typeof element !== 'string') {
            throw new Error('Element must be a non-empty string');
        }
        this.bloomFilter.add(element.toLowerCase());
        this.elementsAdded++;
    }

    /**
     * Check if an element exists in the bloom filter
     * @param {string} element - Element to check
     * @returns {boolean} - True if possibly exists, false if definitely doesn't exist
     */
    has(element) {
        if (!element || typeof element !== 'string') {
            return false;
        }
        return this.bloomFilter.has(element.toLowerCase());
    }

    /**
     * Get statistics about the bloom filter
     */
    getStats() {
        return {
            size: this.size,
            hashFunctions: this.hashFunctions,
            elementsAdded: this.elementsAdded,
            loadFactor: (this.elementsAdded / this.size) * 100
        };
    }

    /**
     * Reset the bloom filter
     */
    reset() {
        this.bloomFilter = new BloomFilter(this.size, this.hashFunctions);
        this.elementsAdded = 0;
    }

    /**
     * Export bloom filter to JSON (for persistence)
     */
    toJSON() {
        return this.bloomFilter.export();
    }

    /**
     * Import bloom filter from JSON (for persistence)
     */
    static fromJSON(data, size = 100000, hashFunctions = 4) {
        const manager = new BloomFilterManager(size, hashFunctions);
        manager.bloomFilter = BloomFilter.import(data);
        return manager;
    }
}

// Initialize separate bloom filters for different purposes
const emailBloomFilter = new BloomFilterManager(100000, 4);
const usernameBloomFilter = new BloomFilterManager(100000, 4);
const vendorEmailBloomFilter = new BloomFilterManager(50000, 4);

module.exports = {
    BloomFilterManager,
    emailBloomFilter,
    usernameBloomFilter,
    vendorEmailBloomFilter
};
