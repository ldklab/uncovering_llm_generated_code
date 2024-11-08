"use strict";

const KEYS = require("./visitor-keys.json");

// Define node types by extracting keys from the KEYS object and freeze them for immutability.
const NODE_TYPES = Object.freeze(Object.keys(KEYS));

// Freeze each array of keys inside the KEYS object to prevent modifications.
NODE_TYPES.forEach(type => Object.freeze(KEYS[type]));
// Freeze the whole KEYS object to make it immutable.
Object.freeze(KEYS);

// Keys to be ignored due to specific reasons such as non-structural/documentation nature.
const KEY_BLACKLIST = new Set(["parent", "leadingComments", "trailingComments"]);

/**
 * Determines if a key should be included based on blacklist criteria and naming conventions.
 * @param {string} key - The key being evaluated.
 * @returns {boolean} - Returns true if the key is valid; otherwise, false.
 */
function filterKey(key) {
    return !KEY_BLACKLIST.has(key) && key[0] !== "_";
}

// Module exports to provide public API for working with visitor keys.
module.exports = Object.freeze({
    KEYS, // Expose the immutable KEYS for direct access.

    /**
     * Retrieves applicable visitor keys from a node, using the filterKey function.
     * @param {Object} node - The AST node to process.
     * @returns {string[]} - Array of valid keys from the node.
     */
    getKeys(node) {
        return Object.keys(node).filter(filterKey);
    },

    /**
     * Creates and returns a new set of visitor keys by merging KEYS with additional keys.
     * @param {Object} additionalKeys - Keys to be added to the current KEY set.
     * @returns {{ [type: string]: string[] | undefined }} - The combined set of keys.
     */
    unionWith(additionalKeys) {
        const result = { ...KEYS };

        for (const type of Object.keys(additionalKeys)) {
            const combinedKeys = new Set(result[type] ? result[type] : []);
            additionalKeys[type].forEach(key => combinedKeys.add(key));

            result[type] = Object.freeze(Array.from(combinedKeys));
        }

        return Object.freeze(result);
    }
});
