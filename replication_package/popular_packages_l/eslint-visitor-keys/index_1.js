// eslint-visitor-keys/index.js

const KEYS = Object.freeze({
    AssignmentExpression: ["left", "right"],
    MethodDefinition: ["key", "value"]
});

function getKeys(node) {
    if (node == null) {
        return [];
    }
    return Object.keys(node).filter(key => (
        !key.startsWith("_") && !['parent', 'leadingComments', 'trailingComments'].includes(key)
    ));
}

function unionWith(additionalKeys) {
    const result = {};
    for (const key in additionalKeys) {
        result[key] = additionalKeys[key];
    }
    for (const key in KEYS) {
        if (!result.hasOwnProperty(key)) {
            result[key] = KEYS[key];
        } else {
            result[key] = [...new Set([...result[key], ...KEYS[key]])];
        }
    }
    return result;
}

module.exports = {
    KEYS,
    getKeys,
    unionWith
};

// Usage Example:
const node = {
    type: "AssignmentExpression",
    left: { type: "Identifier", name: "foo" },
    right: { type: "Literal", value: 0 }
};
console.log(getKeys(node)); // Output: ["type", "left", "right"]

console.log(unionWith({
    MethodDefinition: ["decorators"]
})); // Output: { ..., MethodDefinition: ["decorators", "key", "value"], ... }
