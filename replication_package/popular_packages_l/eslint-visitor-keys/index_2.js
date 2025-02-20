// eslint-visitor-keys/index.js

// Define immutable object KEYS which maps node types to their expected keys
const KEYS = Object.freeze({
    AssignmentExpression: ["left", "right"],
    MethodDefinition: ["key", "value"]
});

// Helper function to retrieve keys from a provided node
function getKeys(node) {
    if (node == null) {
        return [];
    }
    // Return non-private keys and exclude certain properties
    return Object.keys(node).filter(key => (
        !key.startsWith("_") && !['parent', 'leadingComments', 'trailingComments'].includes(key)
    ));
}

// Function to merge custom keys with the predefined KEYS, ensuring no duplicates
function unionWith(additionalKeys) {
    const result = {};
    // Copy the additional keys into result
    for (const key in additionalKeys) {
        result[key] = additionalKeys[key];
    }
    // Merge KEYS into result, appending new keys while avoiding duplicates
    for (const key in KEYS) {
        if (!result.hasOwnProperty(key)) {
            result[key] = KEYS[key];
        } else {
            result[key] = [...new Set([...result[key], ...KEYS[key]])];
        }
    }
    return result;
}

// Export the KEYS, getKeys, and unionWith for external use
module.exports = {
    KEYS,
    getKeys,
    unionWith
};

// Demonstration of usage
const node = {
    type: "AssignmentExpression",
    left: { type: "Identifier", name: "foo" },
    right: { type: "Literal", value: 0 }
};

// Example invocation of getKeys function
console.log(getKeys(node)); // Output: ["type", "left", "right"]

// Example invocation of unionWith function with additional keys
console.log(unionWith({
    MethodDefinition: ["decorators"]
})); // Output: { ..., MethodDefinition: ["decorators", "key", "value"], ... }
