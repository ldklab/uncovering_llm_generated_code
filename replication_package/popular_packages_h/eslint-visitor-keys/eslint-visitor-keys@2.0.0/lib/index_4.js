"use strict";

const KEYS = require("./visitor-keys.json");
const NODE_TYPES = Object.freeze(Object.keys(KEYS));

for (const type of NODE_TYPES) {
    Object.freeze(KEYS[type]);
}
Object.freeze(KEYS);

const KEY_BLACKLIST = new Set([
    "parent",
    "leadingComments",
    "trailingComments"
]);

function filterKey(key) {
    return !KEY_BLACKLIST.has(key) && key[0] !== "_";
}

module.exports = Object.freeze({
    KEYS,

    getKeys(node) {
        return Object.keys(node).filter(filterKey);
    },

    unionWith(additionalKeys) {
        const combinedKeys = Object.assign({}, KEYS);

        Object.keys(additionalKeys).forEach(type => {
            if (combinedKeys[type]) {
                const keySet = new Set(additionalKeys[type]);
                combinedKeys[type].forEach(key => keySet.add(key));
                combinedKeys[type] = Object.freeze(Array.from(keySet));
            } else {
                combinedKeys[type] = Object.freeze(Array.from(additionalKeys[type]));
            }
        });

        return Object.freeze(combinedKeys);
    }
});
