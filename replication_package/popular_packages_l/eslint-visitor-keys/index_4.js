// eslint-visitor-keys/index.js

// This module defines a set of default keys for different node types and provides 
// utility functions to manage those keys for AST (Abstract Syntax Tree) nodes. 

// KEYS object defines standard properties expected for certain node types.
const KEYS = Object.freeze({
    AssignmentExpression: ["left", "right"],
    MethodDefinition: ["key", "value"]
});

// Function to retrieve non-internal keys of a node.
// Filters out keys starting with "_" and specific meta keys common in AST nodes.
function getKeys(node) {
    if (node == null) {
        return [];
    }
    return Object.keys(node).filter(key => (
        !key.startsWith("_") && !['parent', 'leadingComments', 'trailingComments'].includes(key)
    ));
}

// Merges KEYS with additional values, avoiding duplication.
// Takes an object of additional keys and merges with the default KEYS, 
// prioritizing uniqueness of each property array.
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

// Exporting functions and constants for use in other modules.
module.exports = {
    KEYS,
    getKeys,
    unionWith
};

// Usage Examples
// To use in an ESM module, you can import as follows:
// import * as evk from "./index.js";

// For CommonJS module usage:
// const evk = require("./index.js");

// Example Usage
const node = {
    type: "AssignmentExpression",
    left: { type: "Identifier", name: "foo" },
    right: { type: "Literal", value: 0 }
};
console.log(getKeys(node)); // Output: ["type", "left", "right"]

console.log(unionWith({
    MethodDefinition: ["decorators"]
})); // Output: { ..., MethodDefinition: ["decorators", "key", "value"], ... }
