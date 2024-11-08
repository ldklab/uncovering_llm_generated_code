// eslint-visitor-keys/index.js

const DEFAULT_KEYS = Object.freeze({
    AssignmentExpression: ["left", "right"],
    MethodDefinition: ["key", "value"]
});

function extractNodeKeys(node) {
    if (!node) {
        return [];
    }
    return Object.keys(node).filter(key => (
        !key.startsWith("_") && !['parent', 'leadingComments', 'trailingComments'].includes(key)
    ));
}

function mergeKeys(customKeys) {
    const mergedKeys = { ...DEFAULT_KEYS };

    for (const type in customKeys) {
        if (mergedKeys[type]) {
            mergedKeys[type] = [...new Set([...mergedKeys[type], ...customKeys[type]])];
        } else {
            mergedKeys[type] = customKeys[type];
        }
    }
    return mergedKeys;
}

module.exports = {
    DEFAULT_KEYS,
    extractNodeKeys,
    mergeKeys
};

// Example Usage:
const exampleNode = {
    type: "AssignmentExpression",
    left: { type: "Identifier", name: "foo" },
    right: { type: "Literal", value: 0 }
};
console.log(extractNodeKeys(exampleNode)); // Output: ["type", "left", "right"]

console.log(mergeKeys({
    MethodDefinition: ["decorators"]
})); // Output: { ..., MethodDefinition: ["key", "value", "decorators"], ... }
