"use strict";

const KEYS = require("./visitor-keys.json");

// Extract all node types from KEYS and freeze the structure
const NODE_TYPES = Object.freeze(Object.keys(KEYS));
for (const type of NODE_TYPES) {
    Object.freeze(KEYS[type]);
}
Object.freeze(KEYS);

// Define a set of keys that should be ignored
const IGNORED_KEYS = new Set(["parent", "leadingComments", "trailingComments"]);

/**
 * Determines if a key should be included based on predefined criteria.
 * @param {string} key - The key to examine.
 * @returns {boolean} - True if the key is valid, false otherwise.
 */
function isKeyValid(key) {
    return !IGNORED_KEYS.has(key) && !key.startsWith("_");
}

module.exports = Object.freeze({
    KEYS,
    
    /**
     * Retrieves valid keys from a given node object after filtering out unwanted ones.
     * @param {Object} node - The AST node object to process.
     * @returns {string[]} - An array of filtered valid keys.
     */
    getKeys(node) {
        return Object.keys(node).filter(isKeyValid);
    },

    /**
     * Combines existing visitor keys with additional keys into a unified frozen set.
     * @param {Object} additionalKeys - An object containing additional visitor keys.
     * @returns {{ [type: string]: string[] | undefined }} - A frozen object of combined keys.
     */
    unionWith(additionalKeys) {
        const combinedKeys = Object.assign({}, KEYS);

        for (const type in additionalKeys) {
            if (combinedKeys.hasOwnProperty(type)) {
                const keys = new Set([...combinedKeys[type], ...additionalKeys[type]]);
                combinedKeys[type] = Object.freeze(Array.from(keys));
            } else {
                combinedKeys[type] = Object.freeze([...additionalKeys[type]]);
            }
        }

        return Object.freeze(combinedKeys);
    }
});
