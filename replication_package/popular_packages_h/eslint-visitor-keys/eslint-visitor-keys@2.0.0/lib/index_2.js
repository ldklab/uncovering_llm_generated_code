"use strict";

const KEYS_DATA = require("./visitor-keys.json");
const NODE_TYPES = Object.freeze(Object.keys(KEYS_DATA));

for (const type of NODE_TYPES) {
    Object.freeze(KEYS_DATA[type]);
}
Object.freeze(KEYS_DATA);

const IGNORED_KEYS = new Set(["parent", "leadingComments", "trailingComments"]);

function isKeyValid(key) {
    return !IGNORED_KEYS.has(key) && !key.startsWith("_");
}

module.exports = Object.freeze({
    KEYS: KEYS_DATA,

    getKeys(node) {
        return Object.keys(node).filter(isKeyValid);
    },

    unionWith(extraKeys) {
        const combinedKeys = { ...KEYS_DATA };

        for (const type in extraKeys) {
            if (combinedKeys[type]) {
                combinedKeys[type] = Object.freeze([...new Set([...combinedKeys[type], ...extraKeys[type]])]);
            } else {
                combinedKeys[type] = Object.freeze([...extraKeys[type]]);
            }
        }

        return Object.freeze(combinedKeys);
    }
});
